"""Otorisasi RBAC (Role-Based Access Control).

Nama role harus sama dengan seed di table.sql:
    'Administrator'        -> kelola buku, kategori, upload file
    'Authenticated User'   -> pembaca: baca buku, favorit
(Guest = tidak punya akun, bukan baris di tabel role.)

KEAMANAN: otorisasi diputuskan di SERVER dari role di DB. Pengecekan di frontend hanya UX.
Gunakan `Depends(require_admin)` / `Depends(require_reader)` di setiap endpoint sensitif (deny by default).
"""
from fastapi import Depends, HTTPException, status

from app.models.pengguna import Pengguna
from configuration.authentication import get_current_user

ROLE_ADMIN = "Administrator"
ROLE_READER = "Authenticated User"


def is_admin(user: Pengguna) -> bool:
    return user.role.role_name.casefold() == ROLE_ADMIN.casefold()


def require_roles(*allowed: str):
    allowed_cf = {r.casefold() for r in allowed}

    async def _checker(user: Pengguna = Depends(get_current_user)) -> Pengguna:
        if user.role.role_name.casefold() not in allowed_cf:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Anda tidak memiliki hak akses.")
        return user

    return _checker


require_admin = require_roles(ROLE_ADMIN)
require_reader = require_roles(ROLE_READER, ROLE_ADMIN)   # admin juga boleh membaca
