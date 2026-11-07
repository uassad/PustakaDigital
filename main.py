"""Entry point FastAPI.

Jalankan (dari folder app_project):
    uvicorn main:app --reload                      # development
    uvicorn main:app --host 127.0.0.1 --port 8000 --no-server-header --proxy-headers   # produksi (di belakang reverse proxy TLS)
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.routers import auth, books, pages
from configuration.database_session import engine
from configuration.middleware import RequestSizeLimitMiddleware, SecurityHeadersMiddleware
from configuration.settings import BASE_DIR, settings

logger = logging.getLogger("uas_sad")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(
    title="Pustaka Digital API — Register & Login",
    version="1.0.0",
    lifespan=lifespan,
    # Dokumentasi interaktif DIMATIKAN di produksi (mengurangi information disclosure).
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

# --- Middleware. Urutan: yang ditambahkan TERAKHIR berjalan PALING LUAR. -----------------------
app.add_middleware(RequestSizeLimitMiddleware, max_json_bytes=settings.max_json_body_bytes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,            # daftar eksplisit, TIDAK pernah "*"
    allow_credentials=False,                            # token lewat header Authorization, bukan cookie
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)
app.add_middleware(SecurityHeadersMiddleware, production=settings.is_production)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_host_list)   # anti Host-header injection


# --- Error handler: jangan bocorkan input (mis. password) / stack trace ------------------------
@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    # Respons 422 bawaan FastAPI menyertakan "input" (nilai yang dikirim, termasuk password!). Kita buang.
    safe = [
        {"field": ".".join(str(p) for p in e.get("loc", ()) if p != "body"), "msg": str(e.get("msg", "tidak valid")).removeprefix("Value error, ")}
        for e in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": safe})


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=getattr(exc, "headers", None))


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)   # detail hanya di log server
    return JSONResponse(status_code=500, content={"detail": "Terjadi kesalahan pada server."})


# --- Routes -----------------------------------------------------------------------------------
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "statics")), name="static")   # hanya aset frontend
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(pages.router)
