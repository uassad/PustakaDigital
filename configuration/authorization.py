"""Otorisasi RBAC (Role-Based Access Control) & ABAC / Anti-Broken Access Control (BOLA/IDOR).

Nama role harus sama dengan seed di table.sql:
    'Administrator'        -> kelola buku, kategori, upload file
    'Authenticated User'   -> pembaca: baca buku, favorit
(Guest = tidak punya akun, bukan baris di tabel role.)

KEAMANAN (OWASP Top 10: 2025 — A01: Broken Access Control):
1. Otorisasi Role (RBAC): diputuskan di SERVER dari role di DB. Pengecekan di frontend hanya UX.
   Gunakan `Depends(require_admin)` / `Depends(require_reader)` di setiap endpoint sensitif (deny by default).
2. Otorisasi Objek (Anti-BOLA / IDOR): Pengguna tidak boleh melihat atau memanipulasi data
   milik pengguna lain (misalnya daftar favorit akun lain, profil akun lain).
   Gunakan `verify_user_access(current_user, target_user_id)` pada level backend di folder configuration ini.
"""
import uuid
from fastapi import Depends, HTTPException, status

from app.models.pengguna import Pengguna
from configuration.authentication import get_current_user

ROLE_ADMIN = "Administrator"
ROLE_READER = "Authenticated User"


def is_admin(user: Pengguna) -> bool:
    """Periksa apakah pengguna memiliki role Administrator."""
    return user.role.role_name.casefold() == ROLE_ADMIN.casefold()


def require_roles(*allowed: str):
    """Factory dependency untuk membatasi akses endpoint berdasarkan role."""
    allowed_cf = {r.casefold() for r in allowed}

    async def _checker(user: Pengguna = Depends(get_current_user)) -> Pengguna:
        if user.role.role_name.casefold() not in allowed_cf:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda tidak memiliki hak akses untuk tindakan ini.",
            )
        return user

    return _checker


require_admin = require_roles(ROLE_ADMIN)
require_reader = require_roles(ROLE_READER, ROLE_ADMIN)   # admin juga boleh membaca


def verify_user_access(
    current_user: Pengguna,
    target_user_id: uuid.UUID,
    allow_admin: bool = True,
) -> None:
    """Validasi kepemilikan data (Anti-Broken Access Control / BOLA / IDOR).
    
    Memastikan pengguna hanya dapat melihat atau mengubah data miliknya sendiri.
    Pengguna biasa yang mencoba mengakses resource milik pengguna lain akan
    langsung ditolak dengan status HTTP 403 Forbidden.
    
    Args:
        current_user: Pengguna yang sedang terotentikasi (dari JWT terverifikasi).
        target_user_id: ID pengguna pemilik resource yang diminta.
        allow_admin: Jika True, role Administrator diizinkan mengakses data user lain.
    
    Raises:
        HTTPException: 403 Forbidden bila otorisasi gagal.
    """
    if current_user.id_pengguna == target_user_id:
        return

    if allow_admin and is_admin(current_user):
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Akses ditolak: Anda tidak memiliki izin untuk melihat atau memodifikasi data akun lain.",
    )

