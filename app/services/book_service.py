"""Logika bisnis katalog buku, pencarian aman, dan manajemen favorit.

KEAMANAN:
- Anti-SQLi: Semua query menggunakan SQLAlchemy Core / ORM berparameter (tanpa string concatenation).
- Anti-Wildcard DoS: Karakter khusus LIKE (%, _, \\) di-escape sebelum dimasukkan ke pencarian.
- Anti-Path Traversal: Pemeriksaan ISBN ketat (hanya digit EAN-13) dan pemastian path berada
  di dalam direktori penyimpanan yang diizinkan (settings.books_storage_dir).
- Anti-BOLA / IDOR: Penambahan / penghapusan favorit selalu mengikatkan ID pengguna dari session/token yang valid.
"""
import math
import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.buku import Buku
from app.models.favorit import Favorit
from app.models.kategori import KategoriBuku
from app.schemas.book import (
    BookListResponse,
    BookPublic,
    KategoriPublic,
    UserFavoriteItem,
    clean_and_validate_isbn13,
)
from configuration.settings import settings


def escape_like(text: str) -> str:
    """Escape wildcard karakter SQL LIKE/ILIKE untuk mencegah manipulasi query."""
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def check_pdf_exists(isbn: str) -> bool:
    """Periksa apakah berkas PDF untuk ISBN ini ada di penyimpanan server secara aman."""
    try:
        clean_isbn = clean_and_validate_isbn13(isbn)
    except ValueError:
        return False
    storage_dir = settings.books_storage_dir
    target_file = (storage_dir / f"{clean_isbn}.pdf").resolve()
    if not target_file.is_relative_to(storage_dir):
        return False
    return target_file.is_file()


def get_secure_pdf_path(isbn: str) -> Optional[Path]:
    """Mengembalikan path berkas PDF yang aman setelah memvalidasi ISBN dan mencegah Path Traversal."""
    clean_isbn = clean_and_validate_isbn13(isbn)
    storage_dir = settings.books_storage_dir
    target_file = (storage_dir / f"{clean_isbn}.pdf").resolve()
    if not target_file.is_relative_to(storage_dir):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses berkas tidak diizinkan.")
    if not target_file.is_file():
        return None
    return target_file


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
                is_favorite=(b.isbn in fav_isbns),
                has_pdf=check_pdf_exists(b.isbn),
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
) -> BookPublic:
    """Ambil rincian satu buku berdasarkan ISBN."""
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

    return BookPublic(
        isbn=buku.isbn,
        id_kategori=buku.id_kategori,
        kategori_nama=buku.kategori.kategori if buku.kategori else None,
        judul_buku=buku.judul_buku,
        nama_penulis=buku.nama_penulis,
        nama_penerbit=buku.nama_penerbit,
        tahun_terbit=buku.tahun_terbit,
        jumlah_halaman=buku.jumlah_halaman,
        sinopsis=buku.sinopsis,
        is_favorite=is_fav,
        has_pdf=check_pdf_exists(buku.isbn),
    )


async def toggle_favorite(
    db: AsyncSession,
    user_id: uuid.UUID,
    isbn: str,
) -> tuple[bool, str]:
    """Toggle status favorit buku untuk pengguna yang sedang terotentikasi."""
    clean_isbn = clean_and_validate_isbn13(isbn)

    # Pastikan buku ada
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
                has_pdf=check_pdf_exists(b.isbn),
                favorited_at=f.created_at,
            )
        )
    return results
