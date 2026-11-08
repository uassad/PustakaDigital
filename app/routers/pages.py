"""Halaman HTML (shell statis): beranda, masuk, daftar.

Data pengguna selalu diambil frontend lewat fetch + Bearer token ke /api/auth/me.
Halaman ini tidak memuat data rahasia. Jinja2 autoescape aktif untuk .html.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession

from configuration.authorization import ADMIN_DASHBOARD_PATH, ADMIN_SESSION_COOKIE, get_current_admin_page_user
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


@router.get("/seAj2hB9sk/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: AsyncSession = Depends(get_db)):
    if not request.cookies.get(ADMIN_SESSION_COOKIE):
        return RedirectResponse(
            url=f"/login?next={ADMIN_DASHBOARD_PATH}",
            status_code=303,
        )
    try:
        await get_current_admin_page_user(request, db)
    except HTTPException as exc:
        if exc.status_code == 401:
            return RedirectResponse(
                url=f"/login?expired=1&next={ADMIN_DASHBOARD_PATH}",
                status_code=303,
            )
        raise
    return templates.TemplateResponse(request, "admin.html", {})
