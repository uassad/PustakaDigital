"""Log aktivitas aplikasi yang disimpan di MongoDB.

Kategori:
    auth        registrasi, login, logout, ubah profil, hapus akun
    admin_book  tambah / ubah / hapus buku dan unggah berkas oleh administrator
    reader      aktivitas pembaca: cari, buka detail, baca PDF, favorit
    security    kejadian keamanan: rate limit, akses ditolak, upload tidak valid, akun dibekukan

Prinsip:
- FAIL-OPEN: gangguan MongoDB tidak boleh membuat request pengguna gagal. Penulisan log dijalankan
  di background (fire-and-forget) dan semua error hanya dicatat sebagai peringatan di konsol.
- Data sensitif tidak pernah disimpan: kunci bernama password/token/otp/secret/cookie dibuang,
  string dipotong, karakter kontrol dibuang (anti log-injection).
- Pembacaan log hanya lewat endpoint admin (app/routers/logs.py); query dibangun dari
  parameter yang sudah divalidasi, dan input pencarian di-escape (anti NoSQL injection).
"""
import asyncio
import logging
import math
import re
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import Request

from configuration.rate_limiter import client_ip
from configuration.settings import settings

logger = logging.getLogger("uas_sad.activity")

CATEGORIES = ("auth", "admin_book", "reader", "security")
STATUSES = ("success", "failed", "blocked")

_client: Any = None
_collection: Any = None
_indexes_ready = False
_tasks: set[asyncio.Task] = set()
_last_warning = 0.0


class ActivityLogUnavailable(Exception):
    """MongoDB tidak aktif / tidak bisa dihubungi / fitur dimatikan."""


# --- Pembersihan data -----------------------------------------------------------------------------
_SENSITIVE_KEY = re.compile(r"pass|secret|token|authorization|otp|pepper|cookie", re.IGNORECASE)
_CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")
_BAD_KEY_CHARS = re.compile(r"^\$|\.")
_MAX_STR = 300


def _clean_str(value: str, limit: int = _MAX_STR) -> str:
    return _CONTROL_CHARS.sub(" ", value)[:limit]


def _clean(value: Any, depth: int = 0) -> Any:
    if value is None or isinstance(value, (bool, int, float)):
        return value
    if isinstance(value, str):
        return _clean_str(value)
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, datetime):
        return value
    if depth >= 3:
        return _clean_str(str(value))
    if isinstance(value, dict):
        out: dict[str, Any] = {}
        for key, item in list(value.items())[:30]:
            safe_key = _BAD_KEY_CHARS.sub("_", _clean_str(str(key), 50))
            out[safe_key] = "[disembunyikan]" if _SENSITIVE_KEY.search(safe_key) else _clean(item, depth + 1)
        return out
    if isinstance(value, (list, tuple, set, frozenset)):
        return [_clean(item, depth + 1) for item in list(value)[:20]]
    return _clean_str(str(value))


def actor_info(user: Any) -> Optional[dict[str, Any]]:
    """Ringkas pelaku jadi {id, username, role}. Terima Pengguna (ORM), UserPublic, atau dict.

    Panggil SEBELUM objek ORM dihapus (mis. hapus akun) agar atributnya masih bisa dibaca.
    """
    if user is None:
        return None
    if isinstance(user, dict):
        return _clean(user)
    role = getattr(user, "role", None)
    role = role if isinstance(role, str) else getattr(role, "role_name", None)
    return _clean({
        "id": getattr(user, "id_pengguna", None),
        "username": getattr(user, "username", None),
        "role": role,
    })


def build_document(
    category: str,
    action: str,
    *,
    status: str = "success",
    request: Optional[Request] = None,
    actor: Any = None,
    target: Optional[dict[str, Any]] = None,
    details: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    doc: dict[str, Any] = {
        "timestamp": datetime.now(timezone.utc),
        "category": category,
        "action": action,
        "status": status,
        "actor": actor_info(actor),
        "target": _clean(target) if target else None,
        "ip": None,
        "user_agent": None,
        "method": None,
        "path": None,
        "details": _clean(details or {}),
    }
    if request is not None:
        doc["ip"] = _clean_str(client_ip(request), 45)
        doc["user_agent"] = _clean_str(request.headers.get("user-agent", ""), 200) or None
        doc["method"] = request.method
        doc["path"] = _clean_str(request.url.path, 200)
        # Tandai: request ini sudah punya catatan log, jangan dicatat ganda oleh error handler.
        request.state.activity_logged = True
    return doc


# --- Koneksi & penulisan ----------------------------------------------------------------------------
def _warn(message: str, *args: Any) -> None:
    """Peringatan maksimal sekali per 30 detik agar konsol tidak banjir saat MongoDB mati."""
    global _last_warning
    now = time.monotonic()
    if now - _last_warning >= 30:
        _last_warning = now
        logger.warning(message, *args)


async def _ensure_indexes() -> None:
    global _indexes_ready
    await _collection.create_index([("timestamp", -1)], name="ts_desc")
    await _collection.create_index([("category", 1), ("timestamp", -1)], name="category_ts")
    await _collection.create_index([("action", 1), ("timestamp", -1)], name="action_ts")
    await _collection.create_index([("actor.id", 1), ("timestamp", -1)], name="actor_ts")
    _indexes_ready = True


async def init_activity_log() -> None:
    """Dipanggil saat startup. Tidak pernah menggagalkan startup aplikasi."""
    global _client, _collection
    if not settings.activity_log_enabled:
        logger.info("Log aktivitas dimatikan (ACTIVITY_LOG_ENABLED=false).")
        return
    try:
        from pymongo import AsyncMongoClient
    except ImportError:
        logger.warning("Paket 'pymongo' belum terpasang — log aktivitas dilewati. Jalankan: python -m pip install pymongo")
        return

    _client = AsyncMongoClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=settings.mongodb_timeout_ms,
        connectTimeoutMS=settings.mongodb_timeout_ms,
        tz_aware=True,
    )
    _collection = _client[settings.mongodb_db][settings.mongodb_log_collection]
    try:
        await _ensure_indexes()
        logger.info("Log aktivitas aktif: MongoDB db=%s collection=%s", settings.mongodb_db, settings.mongodb_log_collection)
    except Exception as exc:
        logger.warning(
            "MongoDB tidak dapat dihubungi (%s). Aplikasi tetap jalan; log akan tersimpan setelah MongoDB aktif.",
            type(exc).__name__,
        )


async def close_activity_log() -> None:
    global _client, _collection, _indexes_ready
    if _tasks:
        await asyncio.wait(list(_tasks), timeout=3)
    if _client is not None:
        try:
            await _client.close()
        except Exception:  # pragma: no cover - best effort
            pass
    _client = _collection = None
    _indexes_ready = False


def use_collection(collection: Any) -> None:
    """Dipakai tes: ganti koleksi dengan objek tiruan."""
    global _collection, _indexes_ready
    _collection = collection
    _indexes_ready = True


async def _write(doc: dict[str, Any]) -> None:
    try:
        if not _indexes_ready:
            await _ensure_indexes()
        await _collection.insert_one(doc)
    except Exception as exc:
        _warn("Gagal menulis log aktivitas ke MongoDB (%s).", type(exc).__name__)


def log_event(
    category: str,
    action: str,
    *,
    status: str = "success",
    request: Optional[Request] = None,
    actor: Any = None,
    target: Optional[dict[str, Any]] = None,
    details: Optional[dict[str, Any]] = None,
) -> None:
    """Catat satu kejadian. Tidak perlu di-await dan TIDAK PERNAH melempar error."""
    if _collection is None:
        return
    try:
        doc = build_document(
            category, action, status=status, request=request, actor=actor, target=target, details=details
        )
        task = asyncio.get_running_loop().create_task(_write(doc))
        _tasks.add(task)
        task.add_done_callback(_tasks.discard)
    except Exception as exc:
        _warn("Gagal menyusun log aktivitas (%s).", type(exc).__name__)


def log_http_error(request: Request, status_code: int, detail: Any) -> None:
    """Dipanggil error handler global: catat penolakan akses sebagai kejadian keamanan."""
    path = request.url.path
    if not path.startswith("/api/") or getattr(request.state, "activity_logged", False):
        return
    if status_code == 429:
        action = "rate_limited"
    elif status_code == 403:
        action = "access_denied"
    elif status_code == 401 and (path.startswith("/api/admin") or path.endswith("/upload-files")):
        action = "unauthorized_access"
    else:
        return

    actor = None
    auth = request.headers.get("authorization", "")
    if auth[:7].lower() == "bearer ":
        try:
            from configuration.authentication import decode_access_token

            actor = {"id": decode_access_token(auth[7:].strip())}
        except Exception:
            actor = None
    log_event(
        "security",
        action,
        status="blocked",
        request=request,
        actor=actor,
        details={"status_code": status_code, "detail": str(detail)},
    )


# --- Pembacaan (untuk halaman admin) ----------------------------------------------------------------
def _as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def build_query(
    *,
    category: Optional[str] = None,
    action: Optional[str] = None,
    status: Optional[str] = None,
    actor: Optional[str] = None,
    ip: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> dict[str, Any]:
    query: dict[str, Any] = {}
    if category:
        query["category"] = category
    if action:
        query["action"] = action
    if status:
        query["status"] = status
    if actor:
        query["actor.username"] = {"$regex": re.escape(actor), "$options": "i"}   # di-escape: bukan regex dari pengguna
    if ip:
        query["ip"] = ip
    window: dict[str, datetime] = {}
    if date_from:
        window["$gte"] = _as_utc(date_from)
    if date_to:
        window["$lte"] = _as_utc(date_to)
    if window:
        query["timestamp"] = window
    return query


def _serialize(doc: dict[str, Any]) -> dict[str, Any]:
    out = {k: v for k, v in doc.items() if k not in {"_id", "timestamp"}}
    out["id"] = str(doc.get("_id"))
    ts = doc.get("timestamp")
    out["timestamp"] = _as_utc(ts).isoformat().replace("+00:00", "Z") if isinstance(ts, datetime) else None
    return out


def _require_collection() -> Any:
    if _collection is None:
        raise ActivityLogUnavailable(
            "Log aktivitas tidak aktif (dimatikan, atau paket pymongo belum terpasang)."
        )
    return _collection


async def list_logs(*, page: int, page_size: int, **filters: Any) -> dict[str, Any]:
    collection = _require_collection()
    query = build_query(**filters)
    try:
        total = await collection.count_documents(query)
        cursor = (
            collection.find(query)
            .sort([("timestamp", -1), ("_id", -1)])
            .skip((page - 1) * page_size)
            .limit(page_size)
        )
        docs = await cursor.to_list(length=page_size)
    except Exception as exc:
        raise ActivityLogUnavailable("MongoDB tidak dapat dihubungi. Pastikan MongoDB berjalan.") from exc
    return {
        "items": [_serialize(d) for d in docs],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, math.ceil(total / page_size)),
    }


async def summary(hours: int = 24) -> dict[str, Any]:
    collection = _require_collection()
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    pipeline = [
        {"$match": {"timestamp": {"$gte": since}}},
        {"$group": {"_id": "$category", "n": {"$sum": 1}}},
    ]
    try:
        cursor = await collection.aggregate(pipeline)
        rows = await cursor.to_list(length=None)
    except Exception as exc:
        raise ActivityLogUnavailable("MongoDB tidak dapat dihubungi. Pastikan MongoDB berjalan.") from exc
    by_category = {c: 0 for c in CATEGORIES}
    for row in rows:
        if row["_id"] in by_category:
            by_category[row["_id"]] = int(row["n"])
    return {
        "hours": hours,
        "since": since.isoformat().replace("+00:00", "Z"),
        "total": sum(by_category.values()),
        "by_category": by_category,
    }
