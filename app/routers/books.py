"""Endpoint REST API katalog buku, pencarian, dan manajemen favorit.

KEAMANAN (OWASP Top 10: 2025):
- A01: Broken Access Control -> Tamu dapat mencari buku, namun penambahan favorit
  hanya dapat dilakukan oleh pengguna terotentikasi. Akses data akun lain (/api/users/{user_id}/favorites)
  diverifikasi secara ketat menggunakan verify_user_access() dari configuration/authorization.py.
- A05: Injection -> Seluruh parameter pencarian divalidasi dan di-sanitize.
- A07: Authentication Failures -> Endpoint favorit menolak akses tamu dengan status 401.
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pengguna import Pengguna
from app.schemas.book import (
    BookListResponse,
    BookPublic,
    FavoriteToggleResponse,
    KategoriPublic,
    UserFavoriteItem,
)
from app.services import book_service
from configuration.authentication import get_current_user, get_optional_current_user
from configuration.authorization import require_reader, verify_user_access
from configuration.database_session import get_db
from configuration.rate_limiter import rate_limit

router = APIRouter(prefix="/api", tags=["books"])


@router.get(
    "/books",
    response_model=BookListResponse,
    dependencies=[Depends(rate_limit("books_search", limit=60, window_seconds=60))],
)
async def list_and_search_books(
    q: Optional[str] = Query(None, max_length=100, description="Pencarian judul, penulis, penerbit, atau ISBN"),
    kategori_id: Optional[int] = Query(None, ge=1, description="ID Kategori"),
    page: int = Query(1, ge=1, description="Nomor halaman"),
    page_size: int = Query(12, ge=1, le=50, description="Item per halaman (maks 50)"),
    current_user: Optional[Pengguna] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> BookListResponse:
    """Mencari dan menampilkan katalog buku secara aman.
    
    Akses: Publik (Tamu / Guest & Pengguna Terdaftar).
    Jika pengguna terotentikasi, status 'is_favorite' akan disesuaikan secara otomatis.
    """
    user_id = current_user.id_pengguna if current_user else None
    return await book_service.search_books(
        db=db,
        q=q,
        kategori_id=kategori_id,
        page=page,
        page_size=page_size,
        current_user_id=user_id,
    )


@router.get("/books/categories", response_model=list[KategoriPublic])
async def get_categories(db: AsyncSession = Depends(get_db)) -> list[KategoriPublic]:
    """Mengambil daftar seluruh kategori buku yang tersedia."""
    return await book_service.list_categories(db)


@router.get("/books/{isbn}", response_model=BookPublic)
async def get_book_detail(
    isbn: str,
    current_user: Optional[Pengguna] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> BookPublic:
    """Mengambil rincian informasi satu buku berdasarkan ISBN. Akses: Publik."""
    user_id = current_user.id_pengguna if current_user else None
    return await book_service.get_book_by_isbn(db, isbn, current_user_id=user_id)


@router.get("/books/{isbn}/pdf")
async def read_book_pdf(isbn: str) -> FileResponse:
    """Membaca / mengunduh berkas PDF buku secara aman (anti Path Traversal)."""
    pdf_path = book_service.get_secure_pdf_path(isbn)
    if not pdf_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Berkas digital PDF untuk buku ini belum tersedia di server.",
        )
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{isbn}.pdf",
        headers={
            "Content-Disposition": f"inline; filename={isbn}.pdf",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.post(
    "/books/{isbn}/favorite",
    response_model=FavoriteToggleResponse,
    dependencies=[Depends(rate_limit("favorite_toggle", limit=30, window_seconds=60))],
)
async def toggle_book_favorite(
    isbn: str,
    current_user: Pengguna = Depends(require_reader),
    db: AsyncSession = Depends(get_db),
) -> FavoriteToggleResponse:
    """Menambahkan atau menghapus buku dari daftar favorit pengguna.
    
    Akses: Hanya Pengguna Terdaftar (Authenticated User & Admin).
    Tamu (Guest) akan ditolak dengan status 401 Unauthorized oleh require_reader.
    """
    is_fav, msg = await book_service.toggle_favorite(db, current_user.id_pengguna, isbn)
    return FavoriteToggleResponse(isbn=isbn, is_favorite=is_fav, message=msg)


@router.get("/favorites", response_model=list[UserFavoriteItem])
async def get_my_favorites(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: Pengguna = Depends(require_reader),
    db: AsyncSession = Depends(get_db),
) -> list[UserFavoriteItem]:
    """Mengambil daftar buku favorit milik pengguna yang sedang login."""
    return await book_service.get_user_favorites(
        db=db,
        target_user_id=current_user.id_pengguna,
        page=page,
        page_size=page_size,
    )


@router.get("/users/{user_id}/favorites", response_model=list[UserFavoriteItem])
async def get_specific_user_favorites(
    user_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: Pengguna = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[UserFavoriteItem]:
    """Melihat daftar favorit dari akun pengguna tertentu.
    
    KEAMANAN KETAT (Anti Broken Access Control — OWASP A01 / BOLA):
    Memeriksa otorisasi melalui backend configuration/authorization.py:
    Pengguna biasa TIDAK BISA melihat daftar favorit akun pengguna lain.
    Jika user_id != current_user.id_pengguna dan bukan Administrator,
    server seketika membalas dengan status 403 Forbidden.
    """
    verify_user_access(current_user=current_user, target_user_id=user_id, allow_admin=True)
    return await book_service.get_user_favorites(
        db=db,
        target_user_id=user_id,
        page=page,
        page_size=page_size,
    )
