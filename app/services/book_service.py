"""Logika bisnis katalog buku, pencarian aman, dan manajemen berkas fisik (cover & body).

KEAMANAN:
- Anti-CSRF & Anti-Predictable Resource: Berkas yang disimpan (cover & body) selalu diberi nama
  acak ber-entropi tinggi (UUIDv4 + token URL-safe acak) sehingga tidak dapat diprediksi oleh pihak ketiga.
- Anti-Path Traversal (CWE-22): Verifikasi path memastikan berkas selalu berada di dalam
  direktori terisolasi ('books/cover' dan 'books/body').
- Anti-SQLi: Semua query menggunakan SQLAlchemy Core / ORM berparameter (tanpa string concatenation).
- Anti-Wildcard DoS: Karakter khusus LIKE (%, _, \\) di-escape sebelum dimasukkan ke pencarian.
- Anti-BOLA / IDOR: Penambahan / penghapusan favorit selalu mengikatkan ID pengguna dari token JWT valid.
"""
import math
import re
import secrets
import uuid
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.buku import Buku
from app.models.favorit import Favorit
from app.models.kategori import KategoriBuku
from app.models.upload_failure_daily import UploadFailureDaily
from app.services.book_files import remove_book_files
from app.schemas.book import (
    BookListResponse,
    BookPublic,
    BookUpdate,
    KategoriPublic,
    UserFavoriteItem,
    clean_and_validate_isbn13,
)
from configuration.settings import BASE_DIR, settings

ALLOWED_COVER_EXTENSIONS = {".jpg"}
ALLOWED_BODY_EXTENSIONS = {".pdf"}

BAD_UPLOAD_LIMIT = 4


def escape_like(text: str) -> str:
    """Escape wildcard karakter SQL LIKE/ILIKE untuk mencegah manipulasi query."""
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def generate_secure_filename(extension: str) -> str:
    """Membuat nama berkas acak ber-entropi tinggi (UUIDv4 + 32-karakter token URL-safe).
    
    KEAMANAN (Anti-CSRF & Anti-IDOR/BOLA):
    - Mengubah nama file menjadi acak, unik, dan unguessable.
    - Penyerang tidak dapat menebak nama berkas secara cross-site (CSRF)
      maupun melakukan penimpaan berkas (file overwrite) atau enumeration.
    """
    ext = extension.lower().strip()
    if not ext.startswith("."):
        ext = f".{ext}"
    random_token = secrets.token_hex(16)
    unique_id = uuid.uuid4().hex
    return f"{unique_id}_{random_token}{ext}"


def save_book_cover(file_bytes: bytes, original_filename: str) -> str:
    """Menyimpan sampul buku ke books/cover dengan nama acak aman dari CSRF."""
    validate_book_cover(file_bytes, original_filename)
    ext = Path(original_filename).suffix.lower()
    secure_filename = generate_secure_filename(ext)
    target_dir = settings.books_cover_dir
    target_file = (target_dir / secure_filename).resolve()
    if not target_file.is_relative_to(target_dir):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Path berbahaya terdeteksi.")
    target_file.write_bytes(file_bytes)
    return f"books/cover/{secure_filename}"


def validate_book_cover(file_bytes: bytes, original_filename: str) -> None:
    if len(file_bytes) > settings.max_cover_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Ukuran berkas gambar sampul melebihi batas {settings.max_cover_upload_mb} MB.",
        )
    ext = Path(original_filename).suffix.lower()
    if ext not in ALLOWED_COVER_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format sampul tidak valid. Hanya berkas .jpg yang diizinkan.",
        )
    if len(file_bytes) < 4 or not file_bytes.startswith(b"\xff\xd8\xff") or not file_bytes.endswith(b"\xff\xd9"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Isi berkas tidak sesuai format gambar .jpg.")


def save_book_body(file_bytes: bytes, original_filename: str) -> str:
    """Menyimpan isi buku (PDF) ke books/body dengan nama acak aman dari CSRF."""
    validate_book_body(file_bytes, original_filename)
    secure_filename = generate_secure_filename(".pdf")
    target_dir = settings.books_body_dir
    target_file = (target_dir / secure_filename).resolve()
    if not target_file.is_relative_to(target_dir):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Path berbahaya terdeteksi.")
    target_file.write_bytes(file_bytes)
    return f"books/body/{secure_filename}"


def validate_book_body(file_bytes: bytes, original_filename: str) -> None:
    if len(file_bytes) > settings.max_pdf_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Ukuran berkas PDF melebihi batas {settings.max_pdf_upload_mb} MB.",
        )
    ext = Path(original_filename).suffix.lower()
    if ext not in ALLOWED_BODY_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format isi buku tidak valid. Hanya berkas .pdf yang diizinkan.",
        )
    if not file_bytes.startswith(b"%PDF-") or b"%%EOF" not in file_bytes[-1024:]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Isi berkas tidak sesuai format dokumen .pdf.")


def resolve_secure_file_path(relative_or_name: Optional[str], base_dir: Path) -> Optional[Path]:
    """Menyelesaikan path berkas secara aman dan memverifikasi tidak keluar dari base_dir (Anti-Path Traversal)."""
    if not relative_or_name:
        return None

    clean_str = relative_or_name.replace("\\", "/").strip()
    if ".." in clean_str or clean_str.startswith("/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Path berkas tidak sah.")

    # Jika tersimpan dengan prefix 'books/cover/' atau 'books/body/'
    target = (BASE_DIR / clean_str).resolve()
    base_resolved = base_dir.resolve()

    if not target.is_relative_to(base_resolved):
        # Coba langsung dari base_dir jika yang tersimpan hanya nama berkasnya
        target = (base_resolved / Path(clean_str).name).resolve()
        if not target.is_relative_to(base_resolved):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses berkas tidak diizinkan.")

    if not target.is_file():
        return None
    return target


def get_secure_body_path(buku: Buku) -> Optional[Path]:
    """Mendapatkan path aman berkas isi PDF buku."""
    # 1. Coba dari kolom book_body di database
    if buku.book_body:
        path = resolve_secure_file_path(buku.book_body, settings.books_body_dir)
        if path:
            return path

    # 2. Fallback: coba berbasis ISBN di books/body
    isbn_clean = buku.isbn.replace("-", "").strip()
    fallback_file = (settings.books_body_dir / f"{isbn_clean}.pdf").resolve()
    if fallback_file.is_relative_to(settings.books_body_dir) and fallback_file.is_file():
        return fallback_file
    return None


def get_secure_cover_path(buku: Buku) -> Optional[Path]:
    """Mendapatkan path aman berkas gambar sampul buku."""
    # 1. Coba dari kolom book_cover di database
    if buku.book_cover:
        path = resolve_secure_file_path(buku.book_cover, settings.books_cover_dir)
        if path:
            return path

    # 2. Fallback: coba berbasis ISBN di books/cover
    isbn_clean = buku.isbn.replace("-", "").strip()
    for ext in ALLOWED_COVER_EXTENSIONS:
        candidate = (settings.books_cover_dir / f"{isbn_clean}{ext}").resolve()
        if candidate.is_relative_to(settings.books_cover_dir) and candidate.is_file():
            return candidate
    return None


def check_pdf_exists(buku: Buku) -> bool:
    """Periksa apakah berkas PDF isi buku tersedia di server."""
    return get_secure_body_path(buku) is not None


def check_cover_exists(buku: Buku) -> bool:
    """Periksa apakah berkas gambar sampul buku tersedia di server."""
    return get_secure_cover_path(buku) is not None


async def list_categories(db: AsyncSession) -> list[KategoriPublic]:
    """Ambil daftar semua kategori buku."""
    stmt = select(KategoriBuku).order_by(KategoriBuku.kategori.asc())
    result = await db.execute(stmt)
    return [KategoriPublic(id_kategori=k.id_kategori, kategori=k.kategori) for k in result.scalars().all()]


async def search_books(
    db: AsyncSession,
    q: Optional[str] = None,
    kategori_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 12,
    current_user_id: Optional[uuid.UUID] = None,
) -> BookListResponse:
    """Pencarian dan penjelajahan buku aman untuk tamu (Guest) maupun pengguna terdaftar."""
    page = max(1, page)
    page_size = min(max(1, page_size), 50)
    offset = (page - 1) * page_size

    conditions = []
    if q and q.strip():
        term = f"%{escape_like(q.strip())}%"
        conditions.append(
            or_(
                Buku.judul_buku.ilike(term),
                Buku.nama_penulis.ilike(term),
                Buku.nama_penerbit.ilike(term),
                Buku.isbn.ilike(term),
            )
        )
    if kategori_id:
        conditions.append(Buku.id_kategori == kategori_id)

    # Hitung total hasil yang cocok
    count_stmt = select(func.count(Buku.isbn))
    if conditions:
        count_stmt = count_stmt.where(*conditions)
    total_count = (await db.execute(count_stmt)).scalar() or 0

    # Ambil halaman data
    stmt = (
        select(Buku)
        .options(joinedload(Buku.kategori))
        .order_by(Buku.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    if conditions:
        stmt = stmt.where(*conditions)

    books = (await db.execute(stmt)).scalars().all()

    # Periksa status favorit pengguna bila terotentikasi
    fav_isbns = set()
    if current_user_id and books:
        book_isbns = [b.isbn for b in books]
        fav_stmt = select(Favorit.isbn).where(
            Favorit.id_pengguna == current_user_id,
            Favorit.isbn.in_(book_isbns),
        )
        fav_results = (await db.execute(fav_stmt)).scalars().all()
        fav_isbns = set(fav_results)

    items: list[BookPublic] = []
    for b in books:
        has_cov = check_cover_exists(b)
        has_body = check_pdf_exists(b)
        items.append(
            BookPublic(
                isbn=b.isbn,
                id_kategori=b.id_kategori,
                kategori_nama=b.kategori.kategori if b.kategori else None,
                judul_buku=b.judul_buku,
                nama_penulis=b.nama_penulis,
                nama_penerbit=b.nama_penerbit,
                tahun_terbit=b.tahun_terbit,
                jumlah_halaman=b.jumlah_halaman,
                sinopsis=b.sinopsis,
                book_cover=b.book_cover,
                book_body=b.book_body,
                has_cover=has_cov,
                is_favorite=(b.isbn in fav_isbns),
                has_pdf=has_body,
            )
        )

    total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1

    return BookListResponse(
        items=items,
        total=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


async def get_book_by_isbn(
    db: AsyncSession,
    isbn: str,
    current_user_id: Optional[uuid.UUID] = None,
) -> tuple[Buku, BookPublic]:
    """Ambil model Buku dan skema BookPublic berdasarkan ISBN."""
    clean_isbn = clean_and_validate_isbn13(isbn)
    stmt = select(Buku).options(joinedload(Buku.kategori)).where(Buku.isbn == clean_isbn)
    buku = (await db.execute(stmt)).scalar_one_or_none()
    if not buku:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buku tidak ditemukan.")

    is_fav = False
    if current_user_id:
        fav_stmt = select(Favorit.isbn).where(
            Favorit.id_pengguna == current_user_id,
            Favorit.isbn == clean_isbn,
        )
        is_fav = (await db.execute(fav_stmt)).scalar_one_or_none() is not None

    pub = BookPublic(
        isbn=buku.isbn,
        id_kategori=buku.id_kategori,
        kategori_nama=buku.kategori.kategori if buku.kategori else None,
        judul_buku=buku.judul_buku,
        nama_penulis=buku.nama_penulis,
        nama_penerbit=buku.nama_penerbit,
        tahun_terbit=buku.tahun_terbit,
        jumlah_halaman=buku.jumlah_halaman,
        sinopsis=buku.sinopsis,
        book_cover=buku.book_cover,
        book_body=buku.book_body,
        has_cover=check_cover_exists(buku),
        is_favorite=is_fav,
        has_pdf=check_pdf_exists(buku),
    )
    return buku, pub


async def toggle_favorite(
    db: AsyncSession,
    user_id: uuid.UUID,
    isbn: str,
) -> tuple[bool, str]:
    """Toggle status favorit buku untuk pengguna yang sedang terotentikasi."""
    clean_isbn = clean_and_validate_isbn13(isbn)

    buku = (await db.execute(select(Buku).where(Buku.isbn == clean_isbn))).scalar_one_or_none()
    if not buku:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buku tidak ditemukan.")

    existing_fav = (
        await db.execute(
            select(Favorit).where(
                Favorit.isbn == clean_isbn,
                Favorit.id_pengguna == user_id,
            )
        )
    ).scalar_one_or_none()

    if existing_fav:
        await db.delete(existing_fav)
        await db.commit()
        return False, "Buku berhasil dihapus dari daftar favorit Anda."
    else:
        new_fav = Favorit(
            isbn=clean_isbn,
            id_pengguna=user_id,
            created_by=user_id,
        )
        db.add(new_fav)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            return True, "Buku sudah ada di daftar favorit."
        return True, "Buku berhasil ditambahkan ke daftar favorit Anda."


async def get_user_favorites(
    db: AsyncSession,
    target_user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
) -> list[UserFavoriteItem]:
    """Ambil daftar favorit milik pengguna target (diotorisasi ketat oleh caller)."""
    page = max(1, page)
    page_size = min(max(1, page_size), 50)
    offset = (page - 1) * page_size

    stmt = (
        select(Favorit)
        .options(
            joinedload(Favorit.buku).joinedload(Buku.kategori),
        )
        .where(Favorit.id_pengguna == target_user_id)
        .order_by(Favorit.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )

    favs = (await db.execute(stmt)).scalars().all()
    results: list[UserFavoriteItem] = []
    for f in favs:
        b = f.buku
        results.append(
            UserFavoriteItem(
                isbn=b.isbn,
                judul_buku=b.judul_buku,
                nama_penulis=b.nama_penulis,
                nama_penerbit=b.nama_penerbit,
                tahun_terbit=b.tahun_terbit,
                jumlah_halaman=b.jumlah_halaman,
                kategori_nama=b.kategori.kategori if b.kategori else None,
                book_cover=b.book_cover,
                has_cover=check_cover_exists(b),
                has_pdf=check_pdf_exists(b),
                favorited_at=f.created_at,
            )
        )
    return results


async def record_bad_upload_attempt(db: AsyncSession, user: "Pengguna") -> int:
    """Atomically count invalid file formats per database day and freeze on the fourth."""
    table = UploadFailureDaily.__table__
    await db.execute(delete(UploadFailureDaily).where(UploadFailureDaily.failure_date < func.current_date()))
    statement = (
        pg_insert(table)
        .values(user_id=user.id_pengguna, failure_date=func.current_date(), attempts=1)
        .on_conflict_do_update(
            index_elements=[table.c.user_id, table.c.failure_date],
            set_={"attempts": table.c.attempts + 1},
        )
        .returning(table.c.attempts)
    )
    count = int((await db.execute(statement)).scalar_one())
    if count >= BAD_UPLOAD_LIMIT:
        user.account_status = "beku"
        user.updated_by = user.id_pengguna
    await db.commit()
    return count


async def create_book(db: AsyncSession, data: "BookCreate", created_by: uuid.UUID) -> tuple[Buku, BookPublic]:
    """Membuat entri buku baru di database."""
    from app.schemas.book import BookCreate as BC  # noqa: F401
    new_buku = Buku(
        isbn=data.isbn,
        id_kategori=data.id_kategori,
        judul_buku=data.judul_buku,
        nama_penulis=data.nama_penulis,
        nama_penerbit=data.nama_penerbit,
        tahun_terbit=data.tahun_terbit,
        jumlah_halaman=data.jumlah_halaman,
        sinopsis=data.sinopsis,
        created_by=created_by,
    )
    db.add(new_buku)
    try:
        await db.commit()
        await db.refresh(new_buku)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="ISBN sudah terdaftar atau kategori tidak ditemukan.")
    buku, pub = await get_book_by_isbn(db, data.isbn)
    return buku, pub


async def update_book(
    db: AsyncSession, isbn: str, data: BookUpdate, updated_by: uuid.UUID
) -> BookPublic:
    buku, _ = await get_book_by_isbn(db, isbn)
    for field in data.model_fields_set:
        setattr(buku, field, getattr(data, field))
    buku.updated_by = updated_by
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Kategori buku tidak ditemukan.") from None
    return (await get_book_by_isbn(db, isbn))[1]


async def get_admin_book_stats(db: AsyncSession) -> dict[str, int]:
    total, with_pdf, with_cover = (
        await db.execute(
            select(
                func.count(Buku.isbn),
                func.count(Buku.isbn).filter(Buku.book_body.is_not(None)),
                func.count(Buku.isbn).filter(Buku.book_cover.is_not(None)),
            )
        )
    ).one()
    return {
        "total_books": int(total),
        "books_with_pdf": int(with_pdf),
        "books_without_pdf": int(total - with_pdf),
        "books_with_cover": int(with_cover),
    }


async def delete_book(db: AsyncSession, isbn: str, deleted_by: uuid.UUID) -> dict[str, list[str]]:
    """Menghapus buku dari database, lalu berkas sampul (.jpg) dan isi (.pdf)-nya dari folder books/.

    Urutan: baris database dihapus & di-commit DULU. Bila database gagal, berkas tidak tersentuh.
    Penghapusan berkas lewat book_files.remove_book_files (tanpa shell, whitelist nama, terkunci ke folder).
    """
    buku, _ = await get_book_by_isbn(db, isbn)        # ISBN sudah divalidasi 13 digit di sini
    isbn_value, cover, body = buku.isbn, buku.book_cover, buku.book_body

    await db.delete(buku)
    await db.commit()

    # Jangan hapus berkas yang masih dipakai buku lain.
    still_used: set[str] = set()
    for column, value in ((Buku.book_cover, cover), (Buku.book_body, body)):
        if value:
            count = (await db.execute(select(func.count()).select_from(Buku).where(column == value))).scalar_one()
            if count:
                still_used.add(value)

    deleted, failed = remove_book_files(isbn_value, cover, body, skip=frozenset(still_used))
    return {"files_deleted": deleted, "files_failed": failed}
