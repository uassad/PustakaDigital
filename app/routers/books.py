"""Endpoint REST API katalog buku, pencarian, dan manajemen favorit.

KEAMANAN (OWASP Top 10: 2025):
- A01: Broken Access Control -> Tamu dapat mencari buku, namun penambahan favorit
  hanya dapat dilakukan oleh pengguna terotentikasi. Akses data akun lain (/api/users/{user_id}/favorites)
  diverifikasi secara ketat menggunakan verify_user_access() dari configuration/authorization.py.
- A05: Injection -> Seluruh parameter pencarian divalidasi dan di-sanitize.
- Anti-CSRF & Unguessable File Paths -> Berkas fisik cover ('books/cover') dan body ('books/body')
  disimpan menggunakan nama acak ber-entropi tinggi dan divalidasi anti-Path Traversal.
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
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
from configuration.authorization import require_admin, require_reader, verify_user_access
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
    _, pub = await book_service.get_book_by_isbn(db, isbn, current_user_id=user_id)
    return pub


@router.get("/books/{isbn}/cover")
async def get_book_cover(
    isbn: str,
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    """Mengambil berkas gambar sampul buku ('books/cover'). Akses: Publik."""
    buku, _ = await book_service.get_book_by_isbn(db, isbn)
    cover_path = book_service.get_secure_cover_path(buku)
    if not cover_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Berkas gambar sampul buku ini belum tersedia di server.",
        )
    ext = cover_path.suffix.lower()
    media_type = "image/jpeg" if ext in {".jpg", ".jpeg"} else f"image/{ext.removeprefix('.')}"
    return FileResponse(
        path=cover_path,
        media_type=media_type,
        filename=cover_path.name,
        headers={
            "Cache-Control": "public, max-age=86400",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.get("/books/{isbn}/pdf")
async def read_book_pdf(
    isbn: str,
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    """Membaca / mengunduh berkas PDF buku ('books/body') secara aman (anti Path Traversal). Akses: Publik."""
    buku, _ = await book_service.get_book_by_isbn(db, isbn)
    pdf_path = book_service.get_secure_body_path(buku)
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
    "/books/{isbn}/upload-files",
    dependencies=[Depends(rate_limit("book_upload_files", limit=10, window_seconds=60))],
)
async def upload_book_files(
    isbn: str,
    cover: Optional[UploadFile] = File(None),
    body: Optional[UploadFile] = File(None),
    current_user: Pengguna = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Unggah berkas fisik sampul (cover) dan isi PDF (body) buku oleh Administrator.
    
    KEAMANAN:
    - Hanya role Administrator yang berwenang.
    - Nama berkas diubah menjadi acak ber-entropi tinggi (anti-CSRF & overwrite).
    - Lokasi berkas disimpan di database ('books/cover' dan 'books/body').
    """
    buku, _ = await book_service.get_book_by_isbn(db, isbn)
    updated = False

    if cover and cover.filename:
        cover_bytes = await cover.read()
        cover_path = book_service.save_book_cover(cover_bytes, cover.filename)
        buku.book_cover = cover_path
        updated = True

    if body and body.filename:
        body_bytes = await body.read()
        body_path = book_service.save_book_body(body_bytes, body.filename)
        buku.book_body = body_path
        updated = True

    if updated:
        buku.updated_by = current_user.id_pengguna
        await db.commit()
        return {
            "message": "Berkas buku berhasil diunggah.",
            "book_cover": buku.book_cover,
            "book_body": buku.book_body,
        }

    return {"message": "Tidak ada berkas yang diunggah."}


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
