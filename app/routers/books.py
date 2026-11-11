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

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pengguna import Pengguna
from app.schemas.book import (
    BookCreate,
    BookListResponse,
    BookPublic,
    BookUpdate,
    FavoriteToggleResponse,
    KategoriPublic,
    UserFavoriteItem,
)
from app.services import activity_log, book_service
from configuration.authentication import get_current_user, get_optional_current_user
from configuration.authorization import require_admin, require_reader, verify_user_access
from configuration.database_session import get_db
from configuration.rate_limiter import rate_limit
from configuration.settings import settings

router = APIRouter(prefix="/api", tags=["books"])


@router.get(
    "/books",
    response_model=BookListResponse,
    dependencies=[Depends(rate_limit("books_search", limit=60, window_seconds=60))],
)
async def list_and_search_books(
    request: Request,
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
    result = await book_service.search_books(
        db=db,
        q=q,
        kategori_id=kategori_id,
        page=page,
        page_size=page_size,
        current_user_id=user_id,
    )
    if current_user and q and q.strip() and page == 1:        # hanya pencarian baru oleh pengguna login
        activity_log.log_event(
            "reader", "search", request=request, actor=current_user,
            details={"q": q.strip(), "kategori_id": kategori_id, "hasil": result.total},
        )
    return result


@router.get("/books/categories", response_model=list[KategoriPublic])
async def get_categories(db: AsyncSession = Depends(get_db)) -> list[KategoriPublic]:
    """Mengambil daftar seluruh kategori buku yang tersedia."""
    return await book_service.list_categories(db)


@router.get("/books/{isbn}", response_model=BookPublic)
async def get_book_detail(
    isbn: str,
    request: Request,
    current_user: Optional[Pengguna] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> BookPublic:
    """Mengambil rincian informasi satu buku berdasarkan ISBN. Akses: Publik."""
    user_id = current_user.id_pengguna if current_user else None
    _, pub = await book_service.get_book_by_isbn(db, isbn, current_user_id=user_id)
    if current_user:
        activity_log.log_event(
            "reader", "book_view", request=request, actor=current_user,
            target={"type": "buku", "id": isbn, "label": pub.judul_buku},
        )
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
    request: Request,
    current_user: Optional[Pengguna] = Depends(get_optional_current_user),
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
    byte_range = request.headers.get("range")
    if not byte_range or byte_range.startswith("bytes=0-"):      # viewer PDF memanggil berkali-kali (Range): catat sekali
        activity_log.log_event(
            "reader", "pdf_read", request=request, actor=current_user,
            target={"type": "buku", "id": isbn, "label": buku.judul_buku},
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
    request: Request,
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
    - Akun dibekukan setelah 4x percobaan upload tipe file tidak valid.
    """
    # Periksa status akun admin
    if current_user.account_status == "beku":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun Anda telah dibekukan. Hubungi tim IT untuk pemulihan akun.",
        )

    buku, _ = await book_service.get_book_by_isbn(db, isbn)
    incoming = []
    if cover and cover.filename:
        incoming.append((cover, "cover"))
    if body and body.filename:
        incoming.append((body, "body"))
    if not incoming:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pilih minimal satu berkas untuk diunggah.")

    validated_files = []
    for uploaded, kind in incoming:
        file_bytes = await uploaded.read()
        try:
            if kind == "cover":
                book_service.validate_book_cover(file_bytes, uploaded.filename or "")
            else:
                book_service.validate_book_body(file_bytes, uploaded.filename or "")
        except HTTPException as exc:
            if exc.status_code != status.HTTP_400_BAD_REQUEST:
                raise
            attempt = await book_service.record_bad_upload_attempt(db, current_user)
            activity_log.log_event(
                "security", "invalid_upload", status="failed", request=request, actor=current_user,
                target={"type": "buku", "id": isbn},
                details={
                    "kind": kind, "filename": uploaded.filename, "alasan": exc.detail,
                    "percobaan": attempt, "batas": book_service.BAD_UPLOAD_LIMIT,
                },
            )
            if attempt >= book_service.BAD_UPLOAD_LIMIT:
                activity_log.log_event(
                    "security", "account_frozen", status="blocked", request=request, actor=current_user,
                    details={"alasan": "upload tidak valid berulang"},
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Akun dibekukan setelah 4 percobaan format/isi file tidak valid hari ini. Hubungi tim IT untuk pembukaan manual.",
                ) from None
            remaining = book_service.BAD_UPLOAD_LIMIT - attempt
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{exc.detail} Percobaan tidak valid hari ini: {attempt}/{book_service.BAD_UPLOAD_LIMIT}; tersisa {remaining} sebelum akun dibekukan.",
            ) from None
        validated_files.append((kind, uploaded.filename or "", file_bytes))

    saved_paths = []
    try:
        for kind, filename, file_bytes in validated_files:
            if kind == "cover":
                buku.book_cover = book_service.save_book_cover(file_bytes, filename)
                saved_paths.append((buku.book_cover, settings.books_cover_dir))
            else:
                buku.book_body = book_service.save_book_body(file_bytes, filename)
                saved_paths.append((buku.book_body, settings.books_body_dir))
        buku.updated_by = current_user.id_pengguna
        await db.commit()
    except Exception:
        await db.rollback()
        for relative_path, base_dir in saved_paths:
            path = book_service.resolve_secure_file_path(relative_path, base_dir)
            if path is not None:
                path.unlink(missing_ok=True)
        raise

    activity_log.log_event(
        "admin_book", "upload_files", request=request, actor=current_user,
        target={"type": "buku", "id": isbn, "label": buku.judul_buku},
        details={"files": [kind for kind, _, _ in validated_files]},
    )
    return {
        "message": "Berkas buku berhasil diunggah.",
        "book_cover": buku.book_cover,
        "book_body": buku.book_body,
    }


@router.post(
    "/books/{isbn}/favorite",
    response_model=FavoriteToggleResponse,
    dependencies=[Depends(rate_limit("favorite_toggle", limit=30, window_seconds=60))],
)
async def toggle_book_favorite(
    isbn: str,
    request: Request,
    current_user: Pengguna = Depends(require_reader),
    db: AsyncSession = Depends(get_db),
) -> FavoriteToggleResponse:
    """Menambahkan atau menghapus buku dari daftar favorit pengguna.
    
    Akses: Hanya Pengguna Terdaftar (Authenticated User & Admin).
    Tamu (Guest) akan ditolak dengan status 401 Unauthorized oleh require_reader.
    """
    is_fav, msg = await book_service.toggle_favorite(db, current_user.id_pengguna, isbn)
    activity_log.log_event(
        "reader", "favorite_added" if is_fav else "favorite_removed", request=request, actor=current_user,
        target={"type": "buku", "id": isbn},
    )
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


# ===== ADMIN DASHBOARD ENDPOINTS =====

@router.get(
    "/admin/books",
    response_model=BookListResponse,
    dependencies=[Depends(require_admin)],
)
async def admin_list_books(
    q: Optional[str] = Query(None, max_length=100),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Pengguna = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> BookListResponse:
    """Daftar semua buku untuk Admin Dashboard."""
    return await book_service.search_books(db=db, q=q, page=page, page_size=page_size)


@router.get(
    "/admin/stats",
    dependencies=[Depends(require_admin)],
)
async def admin_book_stats(db: AsyncSession = Depends(get_db)) -> dict[str, int]:
    return await book_service.get_admin_book_stats(db)


@router.post(
    "/admin/books",
    response_model=BookPublic,
    status_code=201,
    dependencies=[Depends(rate_limit("admin_create_book", limit=20, window_seconds=60))],
)
async def admin_create_book(
    payload: BookCreate,
    request: Request,
    current_user: Pengguna = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> BookPublic:
    """Membuat entri buku baru (tanpa file — file diupload terpisah)."""
    if current_user.account_status == "beku":
        raise HTTPException(status_code=403, detail="Akun dibekukan.")
    _, pub = await book_service.create_book(db, payload, current_user.id_pengguna)
    activity_log.log_event(
        "admin_book", "book_create", request=request, actor=current_user,
        target={"type": "buku", "id": pub.isbn, "label": pub.judul_buku},
    )
    return pub


@router.post(
    "/admin/books/{isbn}/update",
    response_model=BookPublic,
    dependencies=[Depends(require_admin), Depends(rate_limit("admin_update_book", limit=30, window_seconds=60))],
)
async def admin_update_book(
    isbn: str,
    payload: BookUpdate,
    request: Request,
    current_user: Pengguna = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> BookPublic:
    pub = await book_service.update_book(db, isbn, payload, current_user.id_pengguna)
    activity_log.log_event(
        "admin_book", "book_update", request=request, actor=current_user,
        target={"type": "buku", "id": isbn, "label": pub.judul_buku},
        details={"fields": sorted(payload.model_fields_set)},
    )
    return pub


@router.delete(
    "/admin/books/{isbn}",
    dependencies=[Depends(require_admin)],
)
async def admin_delete_book(
    isbn: str,
    request: Request,
    current_user: Pengguna = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Menghapus buku dari katalog beserta berkas fisiknya (sampul .jpg & isi .pdf di folder books/)."""
    if current_user.account_status == "beku":
        raise HTTPException(status_code=403, detail="Akun dibekukan.")
    _, pub = await book_service.get_book_by_isbn(db, isbn)       # ambil judul untuk log (404 bila tidak ada, sama seperti delete)
    result = await book_service.delete_book(db, isbn, current_user.id_pengguna)
    activity_log.log_event(
        "admin_book", "book_delete", request=request, actor=current_user,
        target={"type": "buku", "id": isbn, "label": pub.judul_buku},
        details=result,
    )
    return result
