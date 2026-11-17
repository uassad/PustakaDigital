"""Halaman HTML (shell statis): beranda, masuk, daftar.

Data pengguna selalu diambil frontend lewat fetch + Bearer token ke /api/auth/me.
Halaman ini tidak memuat data rahasia. Jinja2 autoescape aktif untuk .html.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from urllib.parse import quote, urlparse

from configuration.authorization import ADMIN_SESSION_COOKIE, get_current_admin_page_user
from configuration.database_session import get_db
from configuration.settings import BASE_DIR

def _validate_next_path(path: str) -> str:
    if not path or not path.startswith("/") or path.startswith(("//", "/\\")):
        return "/"
    
    parsed = urlparse(path)
    if parsed.scheme or parsed.netloc:
        return "/"
        
    return quote(parsed.path, safe="/")

router = APIRouter(include_in_schema=False)
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(request, "home.html", {})


@router.get("/login", response_class=HTMLResponse)
async def login(request: Request):
    return templates.TemplateResponse(request, "login.html", {})


@router.get("/register", response_class=HTMLResponse)
async def register(request: Request):
    return templates.TemplateResponse(request, "register.html", {})


async def _admin_page(request: Request, db: Annotated[AsyncSession, Depends(get_db)], template: str):
    """Render halaman admin bila cookie sesi valid dan pengguna adalah Administrator; selain itu arahkan ke login."""
    next_path = request.url.path
    # If admin session cookie missing, redirect to login with validated next path
    if not request.cookies.get(ADMIN_SESSION_COOKIE):
        safe_next = _validate_next_path(next_path)
        return RedirectResponse(url=f"/login?next={safe_next}", status_code=303) # nosemgrep

    try:
        await get_current_admin_page_user(request, db)
    except HTTPException as exc:
        if exc.status_code == 401:
            safe_next = _validate_next_path(next_path)
            return RedirectResponse(url=f"/login?expired=1&next={safe_next}", status_code=303) # nosemgrep
        raise

    return templates.TemplateResponse(request, template, {})


@router.get("/seAj2hB9sk/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: Annotated[AsyncSession, Depends(get_db)]):
    return await _admin_page(request, db, "admin.html")


@router.get("/seAj2hB9sk/admin/logs", response_class=HTMLResponse)
async def admin_activity_logs(request: Request, db: Annotated[AsyncSession, Depends(get_db)]):
    return await _admin_page(request, db, "admin_logs.html")
