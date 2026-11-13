"""Penghapusan berkas fisik buku (sampul .jpg & isi .pdf) secara aman.

Prinsip keamanan:
- TANPA SHELL: tidak ada os.system / subprocess / perintah teks. Penghapusan hanya lewat Path.unlink()
  (API pustaka standar). Data (nama berkas) tidak pernah digabung menjadi string perintah, sehingga
  command injection tidak mungkin terjadi: nama berkas hanya diperlakukan sebagai DATA.
- WHITELIST NAMA: nilai dari database divalidasi ketat dengan regex sebelum disentuh. Karakter
  pemisah path (/ \\), '..', spasi, ':' (Windows alternate data stream), '*', '?', '|', ';', '&', '$', dsb. ditolak.
- TERKUNCI KE FOLDER: sampul hanya di books/cover, isi buku hanya di books/body. Berkas dibentuk dari
  <folder>/<nama> lalu diverifikasi: induknya HARUS persis folder itu (bukan subfolder / folder lain),
  bukan symlink, dan ekstensinya cocok (.jpg untuk cover, .pdf untuk body).
- Berkas yang gagal validasi TIDAK dihapus; hanya dilaporkan.
"""
import logging
import re
from pathlib import Path
from typing import Iterable, Optional

from configuration.settings import settings

logger = logging.getLogger("uas_sad")

COVER_EXTENSIONS = frozenset({".jpg"})
BODY_EXTENSIONS = frozenset({".pdf"})

# Opsional diawali "books/cover/" atau "books/body/" (format yang disimpan di kolom database), lalu nama berkas.
_STORED_NAME = re.compile(r"(?:books/(?P<kind>cover|body)/)?(?P<name>[A-Za-z0-9][A-Za-z0-9._-]{0,200})")
_WINDOWS_RESERVED = frozenset({"con", "prn", "aux", "nul", *(f"com{i}" for i in range(1, 10)), *(f"lpt{i}" for i in range(1, 10))})


class UnsafeFileName(ValueError):
    """Nama / path berkas tidak lolos validasi."""


def strict_book_file(stored: object, kind: str, base_dir: Path, allowed_ext: Iterable[str]) -> Optional[Path]:
    """Kembalikan Path berkas bila valid DAN ada; None bila tidak ada; lempar UnsafeFileName bila tidak aman."""
    if not isinstance(stored, str):
        raise UnsafeFileName("bukan teks")
    match = _STORED_NAME.fullmatch(stored)
    if match is None:
        raise UnsafeFileName("karakter/format tidak diizinkan")
    if match["kind"] is not None and match["kind"] != kind:
        raise UnsafeFileName("folder tidak sesuai jenis berkas")
    name = match["name"]
    if ".." in name or name.endswith("."):
        raise UnsafeFileName("pola nama tidak diizinkan")
    if Path(name).suffix.lower() not in set(allowed_ext):
        raise UnsafeFileName("ekstensi tidak diizinkan")
    if name.split(".")[0].lower() in _WINDOWS_RESERVED:
        raise UnsafeFileName("nama perangkat Windows")

    base = base_dir.resolve()
    target = base / name
    if target.is_symlink() or target.parent.resolve() != base:
        raise UnsafeFileName("di luar folder yang diizinkan")
    return target if target.is_file() else None


def remove_book_files(
    isbn: str,
    book_cover: Optional[str],
    book_body: Optional[str],
    *,
    skip: frozenset[str] = frozenset(),
    cover_dir: Optional[Path] = None,
    body_dir: Optional[Path] = None,
) -> tuple[list[str], list[str]]:
    """Hapus sampul & isi buku milik satu buku. Mengembalikan (terhapus, gagal).

    skip: path tersimpan yang masih dipakai buku lain -> jangan dihapus.
    Selain path di database, berkas bernama <ISBN>.jpg / <ISBN>.pdf juga dihapus (aplikasi ikut menyajikannya
    sebagai berkas buku tersebut).
    """
    deleted: list[str] = []
    failed: list[str] = []
    plan = (
        ("cover", cover_dir or settings.books_cover_dir, COVER_EXTENSIONS, book_cover),
        ("body", body_dir or settings.books_body_dir, BODY_EXTENSIONS, book_body),
    )
    for kind, base_dir, extensions, stored in plan:
        candidates: list[tuple[str, bool]] = []
        if stored and stored not in skip:
            candidates.append((stored, True))
        candidates += [(f"{isbn}{ext}", False) for ext in sorted(extensions)]

        done: set[Path] = set()
        for name, from_database in candidates:
            try:
                target = strict_book_file(name, kind, base_dir, extensions)
            except UnsafeFileName as exc:
                if from_database:
                    logger.warning("Berkas %s buku %s TIDAK dihapus: %s.", kind, isbn, exc)
                    failed.append(f"{kind}: path tidak valid, tidak dihapus")
                continue
            if target is None or target in done:
                continue
            done.add(target)
            try:
                target.unlink()
                deleted.append(f"books/{kind}/{target.name}")
            except OSError as exc:       # mis. berkas sedang dibuka program lain di Windows
                logger.warning("Gagal menghapus %s: %s", target.name, type(exc).__name__)
                failed.append(f"books/{kind}/{target.name}")
    return deleted, failed
