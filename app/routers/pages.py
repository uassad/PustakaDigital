"""Halaman HTML (shell statis): beranda, masuk, daftar.

Data pengguna selalu diambil frontend lewat fetch + Bearer token ke /api/auth/me.
Halaman ini tidak memuat data rahasia. Jinja2 autoescape aktif untuk .html.
"""
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

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
