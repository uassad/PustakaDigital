"""Endpoint admin untuk membaca log aktivitas (MongoDB). Hanya Administrator."""
from datetime import datetime
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.services import activity_log
from configuration.authorization import require_admin
from configuration.rate_limiter import rate_limit

router = APIRouter(
    prefix="/api/admin/logs",
    tags=["activity-log"],
    dependencies=[Depends(require_admin), Depends(rate_limit("admin_logs", limit=120, window_seconds=60))],
)


def _unavailable(exc: activity_log.ActivityLogUnavailable) -> HTTPException:
    return HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc))


@router.get("")
async def list_activity_logs(
    category: Optional[Literal["auth", "admin_book", "reader", "security"]] = None,
    log_status: Optional[Literal["success", "failed", "blocked"]] = Query(None, alias="status"),
    action: Optional[str] = Query(None, pattern=r"^[a-z_]{1,40}$"),
    actor: Optional[str] = Query(None, max_length=50, description="Username (mengandung)"),
    ip: Optional[str] = Query(None, pattern=r"^[0-9a-fA-F:.]{1,45}$"),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    page: int = Query(1, ge=1, le=100000),
    page_size: int = Query(20, ge=1, le=100),
) -> dict:
    try:
        return await activity_log.list_logs(
            page=page,
            page_size=page_size,
            category=category,
            status=log_status,
            action=action,
            actor=actor,
            ip=ip,
            date_from=date_from,
            date_to=date_to,
        )
    except activity_log.ActivityLogUnavailable as exc:
        raise _unavailable(exc) from None


@router.get("/summary")
async def activity_log_summary(hours: int = Query(24, ge=1, le=720)) -> dict:
    try:
        return await activity_log.summary(hours)
    except activity_log.ActivityLogUnavailable as exc:
        raise _unavailable(exc) from None
