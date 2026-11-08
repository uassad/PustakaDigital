import uuid
from typing import Optional

from sqlalchemy import FetchedValue, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.mixins import AuditMixin
from app.models.role import Role
from configuration.database_session import SCHEMA, Base


class Pengguna(AuditMixin, Base):
    __tablename__ = "pengguna"
    # eager_defaults: nilai default dari DB (role_id) langsung diambil via RETURNING (aman untuk async).
    __mapper_args__ = {"eager_defaults": True}

    id_pengguna: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # KEAMANAN (anti privilege-escalation / mass-assignment):
    # role_id TIDAK pernah diisi aplikasi saat INSERT -> DB memakai default_user_role_id()
    # ("Authenticated User"). Role runtime bahkan tidak punya hak menulis kolom ini.
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey(f"{SCHEMA}.role.role_id", ondelete="RESTRICT"), nullable=False, server_default=FetchedValue()
    )

    username: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    nomor_telepon: Mapped[Optional[str]] = mapped_column(String(15), unique=True)
    email_verified: Mapped[bool] = mapped_column(nullable=False, default=False, server_default="false")
    phone_verified: Mapped[bool] = mapped_column(nullable=False, default=False, server_default="false")
    account_status: Mapped[str] = mapped_column(String(10), nullable=False, server_default="normal")

    # Hanya hash Argon2id (+pepper di aplikasi). Jangan pernah dikirim ke klien / di-log.
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Dimuat bersama user (joined) -> tidak ada lazy-load di konteks async.
    role: Mapped[Role] = relationship(lazy="joined", innerjoin=True)

    def __repr__(self) -> str:  # jangan pernah menyertakan hash / email penuh di log
        return f"<Pengguna {self.id_pengguna}>"
