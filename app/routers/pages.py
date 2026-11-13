"""Halaman HTML (shell statis): beranda, masuk, daftar.

Data pengguna selalu diambil frontend lewat fetch + Bearer token ke /api/auth/me.
Halaman ini tidak memuat data rahasia. Jinja2 autoescape aktif untuk .html.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession

from configuration.authorization import ADMIN_SESSION_COOKIE, get_current_admin_page_user
from configuration.database_session import get_db
from configuration.settings import BASE_DIR

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


async def _admin_page(request: Request, db: AsyncSession, template: str):
    """Render halaman admin bila cookie sesi valid dan pengguna adalah Administrator; selain itu arahkan ke login."""
    next_path = request.url.path
    if not request.cookies.get(ADMIN_SESSION_COOKIE):
        return RedirectResponse(url=f"/login?next={next_path}", status_code=303)
    try:
        await get_current_admin_page_user(request, db)
    except HTTPException as exc:
        if exc.status_code == 401:
            return RedirectResponse(url=f"/login?expired=1&next={next_path}", status_code=303)
        raise
    return templates.TemplateResponse(request, template, {})


@router.get("/seAj2hB9sk/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: AsyncSession = Depends(get_db)):
    return await _admin_page(request, db, "admin.html")


@router.get("/seAj2hB9sk/admin/logs", response_class=HTMLResponse)
async def admin_activity_logs(request: Request, db: AsyncSession = Depends(get_db)):
    return await _admin_page(request, db, "admin_logs.html")
