"""Endpoint autentikasi: registrasi, login, profil."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pengguna import Pengguna
from app.schemas.user import TokenResponse, UserLogin, UserPublic, UserRegister
from app.services import auth_service
from configuration.authentication import create_access_token, get_current_user
from configuration.database_session import get_db
from configuration.rate_limiter import rate_limit

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    # Rate limit: 5 registrasi / jam / IP (anti spam akun).
    dependencies=[Depends(rate_limit("register", limit=5, window_seconds=3600))],
)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)) -> UserPublic:
    user = await auth_service.register_user(db, payload)
    return auth_service.to_public(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    # Rate limit: 10 percobaan / menit / IP (+ 8 / 10 menit / akun di service) -> anti brute-force.
    dependencies=[Depends(rate_limit("login", limit=10, window_seconds=60))],
)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await auth_service.authenticate(db, payload)
    token, expires_in = create_access_token(user.id_pengguna)
    return TokenResponse(access_token=token, expires_in=expires_in, user=auth_service.to_public(user))


@router.get("/me", response_model=UserPublic)
async def me(user: Pengguna = Depends(get_current_user)) -> UserPublic:
    return auth_service.to_public(user)
