"""Endpoint autentikasi: registrasi, login, profil."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pengguna import Pengguna
from app.schemas.user import (
    OTPVerify,
    RegistrationChallengeResponse,
    TokenResponse,
    UserLogin,
    UserPublic,
    UserRegister,
)
from app.services import auth_service
from app.services.registration_otp import start_registration, verify_registration
from configuration.authentication import create_access_token, get_current_user
from configuration.database_session import get_db
from configuration.rate_limiter import rate_limit
from configuration.settings import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegistrationChallengeResponse,
    status_code=status.HTTP_202_ACCEPTED,
    # Rate limit: 5 OTP registrations / hour / IP.
    dependencies=[Depends(rate_limit("register", limit=5, window_seconds=3600))],
)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)) -> RegistrationChallengeResponse:
    if settings.is_production:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "OTP simulasi lokal hanya tersedia di environment development.",
        )
    challenge_id, destination = await start_registration(db, payload)
    return RegistrationChallengeResponse(
        challenge_id=challenge_id,
        verification_method=payload.verification_method,
        destination=destination,
        expires_in=settings.otp_expiry_seconds,
    )


@router.post(
    "/register/verify-otp",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("register-otp-verify", limit=20, window_seconds=3600))],
)
async def verify_register_otp(payload: OTPVerify, db: AsyncSession = Depends(get_db)) -> UserPublic:
    if settings.is_production:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "OTP simulasi lokal hanya tersedia di environment development.",
        )
    return await verify_registration(db, payload)


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
