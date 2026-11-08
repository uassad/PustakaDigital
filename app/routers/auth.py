"""Endpoint autentikasi: registrasi, login, profil."""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pengguna import Pengguna
from app.schemas.user import (
    AccountDeletion,
    OTPVerify,
    RegistrationChallengeResponse,
    TokenResponse,
    UserLogin,
    UserProfileUpdate,
    UserPublic,
    UserRegister,
)
from app.services import auth_service
from app.services.db_errors import UNIQUE_VIOLATION, sqlstate_of
from app.services.registration_otp import start_registration, verify_registration
from configuration.authentication import bearer_scheme, create_access_token, get_current_user_for_profile
from configuration.authorization import (
    ADMIN_DASHBOARD_PATH,
    ADMIN_SESSION_COOKIE,
    ROLE_READER,
    require_admin,
    require_roles,
)
from configuration.database_session import get_db
from configuration.rate_limiter import rate_limit
from configuration.salt_and_pepper import verify_password_async
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


@router.post(
    "/admin-session",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_admin),
        Depends(rate_limit("admin_session", limit=10, window_seconds=60)),
    ],
)
async def create_admin_session(
    response: Response,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi diperlukan atau token tidak valid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    response.set_cookie(
        key=ADMIN_SESSION_COOKIE,
        value=credentials.credentials,
        max_age=settings.access_token_expire_minutes * 60,
        path=ADMIN_DASHBOARD_PATH,
        secure=settings.is_production,
        httponly=True,
        samesite="strict",
    )
    response.headers["Cache-Control"] = "no-store"


@router.delete("/admin-session", status_code=status.HTTP_204_NO_CONTENT)
async def clear_admin_session(response: Response) -> None:
    response.delete_cookie(
        key=ADMIN_SESSION_COOKIE,
        path=ADMIN_DASHBOARD_PATH,
        secure=settings.is_production,
        httponly=True,
        samesite="strict",
    )


@router.get("/me", response_model=UserPublic)
async def me(user: Pengguna = Depends(get_current_user_for_profile)) -> UserPublic:
    return auth_service.to_public(user)


@router.patch(
    "/me",
    response_model=UserPublic,
    dependencies=[Depends(rate_limit("profile_update", limit=5, window_seconds=600))],
)
async def update_profile(
    payload: UserProfileUpdate,
    user: Pengguna = Depends(require_roles(ROLE_READER)),
    db: AsyncSession = Depends(get_db),
) -> UserPublic:
    if not await verify_password_async(user.password, payload.current_password):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Kata sandi saat ini salah.")

    phone_changed = user.nomor_telepon != payload.nomor_telepon
    user.username = payload.username
    user.nomor_telepon = payload.nomor_telepon
    if phone_changed:
        user.phone_verified = False
    user.updated_by = user.id_pengguna

    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        if sqlstate_of(exc) == UNIQUE_VIOLATION:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Username atau nomor telepon sudah digunakan.",
            ) from None
        raise

    return auth_service.to_public(user)


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(rate_limit("account_delete", limit=3, window_seconds=600))],
)
async def delete_account(
    payload: AccountDeletion,
    user: Pengguna = Depends(require_roles(ROLE_READER)),
    db: AsyncSession = Depends(get_db),
) -> None:
    if not await verify_password_async(user.password, payload.password):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Kata sandi salah.")

    await db.delete(user)
    await db.commit()
