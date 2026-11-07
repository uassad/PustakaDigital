import re
import uuid
from typing import Annotated, Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints, field_validator, model_validator

Username = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^[A-Za-z0-9_]{3,30}$")]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^\+?[0-9]{8,14}$")]


class UserRegister(BaseModel):
    """Payload registrasi. `extra="forbid"` => field tak dikenal (mis. `role_id`, `role`) DITOLAK (anti mass-assignment)."""

    model_config = ConfigDict(extra="forbid")

    username: Username
    email: EmailStr
    nomor_telepon: Optional[Phone] = None
    password: str = Field(min_length=12, max_length=128, repr=False)
    verification_method: Literal["email", "phone"] = "email"

    @field_validator("nomor_telepon", mode="before")
    @classmethod
    def _blank_phone(cls, v: Any) -> Any:
        return None if isinstance(v, str) and not v.strip() else v

    @field_validator("email")
    @classmethod
    def _email_rules(cls, v: str) -> str:
        v = v.strip().lower()
        if len(v) > 50:
            raise ValueError("email maksimal 50 karakter")
        return v

    @field_validator("password")
    @classmethod
    def _password_strength(cls, v: str) -> str:
        if any(ord(c) < 32 or ord(c) == 127 for c in v):
            raise ValueError("password mengandung karakter kontrol")
        classes = sum(
            bool(re.search(p, v)) for p in (r"[a-z]", r"[A-Z]", r"[0-9]", r"[^A-Za-z0-9]")
        )
        if classes < 3:
            raise ValueError("password harus memuat minimal 3 dari: huruf kecil, huruf besar, angka, simbol")
        if len(set(v)) < 5:
            raise ValueError("password terlalu monoton")
        return v

    @model_validator(mode="after")
    def _password_not_identity(self) -> "UserRegister":
        if self.verification_method == "phone" and not self.nomor_telepon:
            raise ValueError("nomor telepon wajib untuk verifikasi SMS")
        low = self.password.lower()
        identity_parts = (self.username.lower(), self.email.split("@", 1)[0].lower())
        if any(len(part) >= 3 and part in low for part in identity_parts):
            raise ValueError("password tidak boleh mengandung username atau nama email")
        return self


class OTPVerify(BaseModel):
    model_config = ConfigDict(extra="forbid")

    challenge_id: uuid.UUID
    code: str = Field(pattern=r"^[0-9]{6}$", repr=False)


class RegistrationChallengeResponse(BaseModel):
    challenge_id: uuid.UUID
    verification_method: Literal["email", "phone"]
    destination: str
    expires_in: int


class UserLogin(BaseModel):
    model_config = ConfigDict(extra="forbid")

    identifier: str = Field(min_length=3, max_length=50, description="username atau email")
    password: str = Field(min_length=1, max_length=128, repr=False)

    @field_validator("identifier")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3 or any(ord(c) < 32 for c in v):
            raise ValueError("identifier tidak valid")
        return v


class UserPublic(BaseModel):
    """Data pengguna yang BOLEH dikirim ke klien. Tidak pernah memuat hash password."""

    id_pengguna: uuid.UUID
    username: str
    email: str
    nomor_telepon: Optional[str] = None
    email_verified: bool = False
    phone_verified: bool = False
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPublic
