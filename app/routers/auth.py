"""Endpoint autentikasi: registrasi, login, profil."""
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
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
from app.services import activity_log, auth_service
from app.services.db_errors import UNIQUE_VIOLATION, sqlstate_of
from app.services.registration_otp import start_registration, verify_registration
from configuration.authentication import (
    bearer_scheme,
    create_access_token,
    get_current_user_for_profile,
    get_optional_current_user,
)
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
async def register(
    payload: UserRegister,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> RegistrationChallengeResponse:
    if settings.is_production:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "OTP simulasi lokal hanya tersedia di environment development.",
        )
    try:
        challenge_id, destination = await start_registration(db, payload)
    except HTTPException as exc:
        activity_log.log_event(
            "auth", "register_failed", status="failed", request=request,
            details={"method": payload.verification_method, "reason": exc.detail},
        )
        raise
    activity_log.log_event(
        "auth", "register_started", request=request,
        details={"method": payload.verification_method, "destination": destination},   # sudah dimasker oleh service
    )
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
async def verify_register_otp(
    payload: OTPVerify,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> UserPublic:
    if settings.is_production:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "OTP simulasi lokal hanya tersedia di environment development.",
        )
    try:
        user = await verify_registration(db, payload)
    except HTTPException as exc:
        activity_log.log_event(
            "auth", "register_verify_failed", status="failed", request=request,
            details={"challenge_id": payload.challenge_id, "reason": exc.detail},      # kode OTP tidak pernah dicatat
        )
        raise
    activity_log.log_event("auth", "register_verified", request=request, actor=user)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    # Rate limit: 10 percobaan / menit / IP (+ 8 / 10 menit / akun di service) -> anti brute-force.
    dependencies=[Depends(rate_limit("login", limit=10, window_seconds=60))],
)
async def login(payload: UserLogin, request: Request, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    try:
        user = await auth_service.authenticate(db, payload)
    except HTTPException as exc:
        if exc.status_code == status.HTTP_429_TOO_MANY_REQUESTS:        # batas percobaan per akun terlampaui
            activity_log.log_event(
                "security", "rate_limited", status="blocked", request=request,
                details={"scope": "login", "identifier": payload.identifier},
            )
        else:
            reason = "account_frozen" if exc.status_code == status.HTTP_403_FORBIDDEN else "invalid_credentials"
            activity_log.log_event(
                "auth", "login_failed", status="failed", request=request,
                details={"identifier": payload.identifier, "reason": reason},    # password TIDAK dicatat
            )
        raise
    activity_log.log_event("auth", "login_success", request=request, actor=user)
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
async def clear_admin_session(
    request: Request,
    response: Response,
    user: Pengguna | None = Depends(get_optional_current_user),
) -> None:
    if user is not None:        # frontend mengirim Bearer token saat logout (lihat statics/js/auth.js)
        activity_log.log_event("auth", "logout", request=request, actor=user)
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
    request: Request,
    user: Pengguna = Depends(require_roles(ROLE_READER)),
    db: AsyncSession = Depends(get_db),
) -> UserPublic:
    actor = activity_log.actor_info(user)
    if not await verify_password_async(user.password, payload.current_password):
        activity_log.log_event(
            "auth", "profile_update", status="failed", request=request, actor=actor,
            details={"reason": "wrong_password"},
        )
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Kata sandi saat ini salah.")

    phone_changed = user.nomor_telepon != payload.nomor_telepon
    changed_fields = [
        name for name, changed in (("username", user.username != payload.username), ("nomor_telepon", phone_changed))
        if changed
    ]
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
            activity_log.log_event(
                "auth", "profile_update", status="failed", request=request, actor=actor,
                details={"reason": "duplicate"},
            )
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Username atau nomor telepon sudah digunakan.",
            ) from None
        raise

    activity_log.log_event(
        "auth", "profile_update", request=request, actor=user,
        details={"fields_changed": changed_fields},          # nilai baru tidak dicatat
    )
    return auth_service.to_public(user)


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(rate_limit("account_delete", limit=3, window_seconds=600))],
)
async def delete_account(
    payload: AccountDeletion,
    request: Request,
    user: Pengguna = Depends(require_roles(ROLE_READER)),
    db: AsyncSession = Depends(get_db),
) -> None:
    actor = activity_log.actor_info(user)       # ambil sebelum objek dihapus
    if not await verify_password_async(user.password, payload.password):
        activity_log.log_event(
            "auth", "account_delete", status="failed", request=request, actor=actor,
            details={"reason": "wrong_password"},
        )
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Kata sandi salah.")

    await db.delete(user)
    await db.commit()
    activity_log.log_event("auth", "account_delete", request=request, actor=actor)
