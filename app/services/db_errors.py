"""Pemetaan error PostgreSQL (SQLSTATE) -> HTTP error yang aman (tanpa membocorkan detail skema)."""
from typing import Optional

from sqlalchemy.exc import IntegrityError

UNIQUE_VIOLATION = "23505"
FK_VIOLATION = "23503"
CHECK_VIOLATION = "23514"


def sqlstate_of(exc: IntegrityError) -> Optional[str]:
    orig = exc.orig
    for candidate in (orig, getattr(orig, "__cause__", None)):
        code = getattr(candidate, "sqlstate", None) or getattr(candidate, "pgcode", None)
        if code:
            return str(code)
    return None
