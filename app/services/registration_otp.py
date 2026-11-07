"""OTP registration flow and local Mailpit delivery."""
import asyncio
import hashlib
import hmac
import secrets
import smtplib
import uuid
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from fastapi import HTTPException, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pengguna import Pengguna
from app.models.registration_challenge import RegistrationChallenge
from app.schemas.user import OTPVerify, UserPublic, UserRegister
from app.services import auth_service
from app.services.db_errors import UNIQUE_VIOLATION, sqlstate_of
from configuration.rate_limiter import enforce
from configuration.salt_and_pepper import hash_password_async
from configuration.settings import settings

MAX_ATTEMPTS = 5


def _otp_digest(challenge_id: uuid.UUID, code: str) -> str:
    message = f"{challenge_id}:{code}".encode("ascii")
    return hmac.new(settings.password_pepper.encode("utf-8"), message, hashlib.sha256).hexdigest()


def _masked_destination(data: UserRegister) -> str:
    if data.verification_method == "email":
        name, domain = data.email.split("@", 1)
        return f"{name[:1]}***@{domain}"
    phone = data.nomor_telepon or ""
    return f"***{phone[-4:]}"


def _deliver_message(recipient: str, subject: str, body: str) -> None:
    message = EmailMessage()
    message["From"] = settings.otp_from_email
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)
    with smtplib.SMTP(settings.otp_smtp_host, settings.otp_smtp_port, timeout=5) as smtp:
        smtp.send_message(message)


async def _send_otp(data: UserRegister, code: str) -> None:
    expiry_minutes = max(1, settings.otp_expiry_seconds // 60)
    if data.verification_method == "email":
        recipient = data.email
        subject = "Kode verifikasi akun"
        body = f"Kode verifikasi Anda: {code}\nBerlaku sekitar {expiry_minutes} menit."
    else:
        digits = "".join(character for character in (data.nomor_telepon or "") if character.isdigit())
        recipient = f"sms-{digits}@sms.local"
        subject = "[SIMULASI SMS] Kode verifikasi"
        body = f"[SIMULASI SMS untuk {data.nomor_telepon}] Kode verifikasi: {code}. Berlaku sekitar {expiry_minutes} menit."
    await asyncio.to_thread(_deliver_message, recipient, subject, body)


async def start_registration(db: AsyncSession, data: UserRegister) -> tuple[uuid.UUID, str]:
    if data.verification_method == "phone" and not data.nomor_telepon:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Nomor telepon wajib untuk verifikasi SMS.")

    await enforce(f"register-email:{data.email}", limit=5, window_seconds=3600)
    identity_filters = [
        func.lower(Pengguna.username) == data.username.lower(),
        func.lower(Pengguna.email) == data.email,
    ]
    if data.nomor_telepon:
        identity_filters.append(Pengguna.nomor_telepon == data.nomor_telepon)
    existing = await db.execute(select(Pengguna.id_pengguna).where(or_(*identity_filters)).limit(1))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Username, email, atau nomor telepon sudah terdaftar.")

    challenge_id = uuid.uuid4()
    code = f"{secrets.randbelow(1_000_000):06d}"
    password_hash = await hash_password_async(data.password)
    challenge = RegistrationChallenge(
        id=challenge_id,
        username=data.username,
        email=data.email,
        nomor_telepon=data.nomor_telepon,
        password_hash=password_hash,
        verification_method=data.verification_method,
        otp_hash=_otp_digest(challenge_id, code),
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=settings.otp_expiry_seconds),
    )
    pending_identity = [
        func.lower(RegistrationChallenge.username) == data.username.lower(),
        func.lower(RegistrationChallenge.email) == data.email,
        RegistrationChallenge.expires_at <= datetime.now(timezone.utc),
    ]
    if data.nomor_telepon:
        pending_identity.append(RegistrationChallenge.nomor_telepon == data.nomor_telepon)
    await db.execute(delete(RegistrationChallenge).where(or_(*pending_identity)))
    db.add(challenge)
    await db.commit()

    try:
        await _send_otp(data, code)
    except (OSError, smtplib.SMTPException) as exc:
        await db.delete(challenge)
        await db.commit()
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Layanan OTP lokal tidak tersedia. Jalankan Mailpit di port 1025 lalu coba lagi.",
        ) from exc
    return challenge_id, _masked_destination(data)


async def verify_registration(db: AsyncSession, data: OTPVerify) -> UserPublic:
    challenge = (
        await db.execute(
            select(RegistrationChallenge)
            .where(RegistrationChallenge.id == data.challenge_id)
            .with_for_update()
        )
    ).scalar_one_or_none()
    if challenge is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Kode verifikasi tidak valid atau sudah digunakan.")

    if challenge.expires_at <= datetime.now(timezone.utc):
        await db.delete(challenge)
        await db.commit()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Kode verifikasi kedaluwarsa. Silakan minta kode baru.")

    if not hmac.compare_digest(challenge.otp_hash, _otp_digest(challenge.id, data.code)):
        challenge.attempts += 1
        if challenge.attempts >= MAX_ATTEMPTS:
            await db.delete(challenge)
        await db.commit()
        if challenge.attempts >= MAX_ATTEMPTS:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Batas percobaan tercapai. Minta kode baru.")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Kode verifikasi salah.")

    user_id = uuid.uuid4()
    user = Pengguna(
        id_pengguna=user_id,
        username=challenge.username,
        email=challenge.email,
        nomor_telepon=challenge.nomor_telepon,
        password=challenge.password_hash,
        email_verified=challenge.verification_method == "email",
        phone_verified=challenge.verification_method == "phone",
        created_by=user_id,
    )
    db.add(user)
    await db.delete(challenge)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        if sqlstate_of(exc) == UNIQUE_VIOLATION:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Username, email, atau nomor telepon sudah terdaftar.",
            ) from None
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Data registrasi ditolak.") from None

    created = await auth_service.get_user_by_id(db, user_id)
    if created is None:
        raise RuntimeError("Registered user was not found after commit.")
    return auth_service.to_public(created)
