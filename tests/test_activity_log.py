"""Tes unit untuk modul log aktivitas (tanpa MongoDB sungguhan — memakai koleksi tiruan).

Jalankan dari folder proyek:  pytest -q tests/test_activity_log.py
"""
import asyncio
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


@pytest.fixture(scope="module")
def al():
    os.environ.update(
        DATABASE_URL="postgresql+asyncpg://u:p@localhost/db",
        JWT_SECRET_KEY="k" * 48, PASSWORD_PEPPER="p" * 48,
    )
    from app.services import activity_log

    return activity_log


class FakeCollection:
    def __init__(self, fail: bool = False):
        self.docs: list[dict] = []
        self.fail = fail

    async def insert_one(self, doc):
        if self.fail:
            raise RuntimeError("mongo mati")
        self.docs.append(doc)

    async def create_index(self, *args, **kwargs):
        return "ok"


def fake_request(path="/api/books", method="GET", headers=None, host="10.0.0.5"):
    return SimpleNamespace(
        url=SimpleNamespace(path=path),
        method=method,
        headers={k.lower(): v for k, v in (headers or {}).items()},
        client=SimpleNamespace(host=host),
        state=SimpleNamespace(),
    )


def run_logging(al, collection, fn):
    """Jalankan fn() di dalam event loop, lalu tunggu task penulisan di background selesai."""
    async def runner():
        al.use_collection(collection)
        fn()
        await asyncio.sleep(0)
        if al._tasks:
            await asyncio.wait(list(al._tasks), timeout=2)

    asyncio.run(runner())


def test_clean_hides_secrets_and_strips_control_chars(al):
    cleaned = al._clean({
        "password": "rahasia", "access_token": "abc", "OTP_code": "123456",
        "judul": "Buku\nBaru\x00!", "$where": "x", "a.b": 1,
        "panjang": "x" * 1000,
    })
    assert cleaned["password"] == "[disembunyikan]"
    assert cleaned["access_token"] == "[disembunyikan]"
    assert cleaned["OTP_code"] == "[disembunyikan]"
    assert cleaned["judul"] == "Buku Baru !"
    assert "_where" in cleaned and "a_b" in cleaned          # kunci berbahaya bagi MongoDB dinetralkan
    assert len(cleaned["panjang"]) == 300


def test_build_query_escapes_regex_and_maps_filters(al):
    q = al.build_query(
        category="security", status="blocked", actor="a.*(b", ip="1.2.3.4",
        date_from=datetime(2026, 11, 1, tzinfo=timezone.utc),
    )
    assert q["category"] == "security" and q["status"] == "blocked" and q["ip"] == "1.2.3.4"
    assert q["actor.username"]["$regex"] == r"a\.\*\(b"      # input pengguna bukan regex
    assert q["timestamp"]["$gte"] == datetime(2026, 11, 1, tzinfo=timezone.utc)
    assert al.build_query() == {}


def test_actor_info_accepts_orm_like_and_public_objects(al):
    orm_like = SimpleNamespace(id_pengguna="u-1", username="admin1", role=SimpleNamespace(role_name="Administrator"))
    assert al.actor_info(orm_like) == {"id": "u-1", "username": "admin1", "role": "Administrator"}
    public_like = SimpleNamespace(id_pengguna="u-2", username="pembaca", role="Authenticated User")
    assert al.actor_info(public_like)["role"] == "Authenticated User"
    assert al.actor_info(None) is None


def test_log_event_writes_document_with_request_info(al):
    col = FakeCollection()
    req = fake_request(headers={"User-Agent": "pytest"})
    actor = SimpleNamespace(id_pengguna="u-1", username="admin1", role="Administrator")
    run_logging(al, col, lambda: al.log_event(
        "admin_book", "book_create", request=req, actor=actor,
        target={"type": "buku", "id": "9786020634944", "label": "Asta Cita"},
        details={"password": "x", "fields": ["judul_buku"]},
    ))
    assert len(col.docs) == 1
    doc = col.docs[0]
    assert doc["category"] == "admin_book" and doc["action"] == "book_create" and doc["status"] == "success"
    assert doc["actor"]["username"] == "admin1"
    assert doc["ip"] == "10.0.0.5" and doc["user_agent"] == "pytest" and doc["path"] == "/api/books"
    assert doc["details"]["password"] == "[disembunyikan]"
    assert doc["timestamp"].tzinfo is not None
    assert req.state.activity_logged is True


def test_log_event_never_raises_when_mongo_fails(al):
    col = FakeCollection(fail=True)
    run_logging(al, col, lambda: al.log_event("auth", "login_success"))      # tidak boleh melempar
    assert col.docs == []


def test_log_http_error_records_only_security_relevant_statuses(al):
    col = FakeCollection()

    def fire():
        al.log_http_error(fake_request("/api/admin/books"), 403, "ditolak")
        al.log_http_error(fake_request("/api/auth/login", "POST"), 429, "terlalu banyak")
        al.log_http_error(fake_request("/api/admin/stats"), 401, "tanpa token")
        al.log_http_error(fake_request("/api/auth/me"), 401, "token kedaluwarsa")     # bukan kejadian keamanan
        al.log_http_error(fake_request("/api/books/x"), 404, "tidak ada")
        al.log_http_error(fake_request("/login"), 403, "bukan API")

    run_logging(al, col, fire)
    actions = sorted(d["action"] for d in col.docs)
    assert actions == ["access_denied", "rate_limited", "unauthorized_access"]
    assert all(d["category"] == "security" and d["status"] == "blocked" for d in col.docs)


def test_log_http_error_skips_requests_already_logged(al):
    col = FakeCollection()
    req = fake_request("/api/auth/login", "POST")

    def fire():
        al.log_event("auth", "login_failed", status="failed", request=req)
        al.log_http_error(req, 403, "akun beku")

    run_logging(al, col, fire)
    assert [d["action"] for d in col.docs] == ["login_failed"]
