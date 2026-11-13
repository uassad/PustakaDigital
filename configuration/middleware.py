"""Middleware keamanan (pure ASGI): HTTP security headers + pembatasan ukuran body.

Dipasang di main.py.
"""
from starlette.datastructures import MutableHeaders
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

# Content-Security-Policy ketat: TIDAK ada inline script/style, TIDAK ada sumber eksternal.
# -> bila ada celah XSS, penyerang tetap tidak bisa menjalankan <script> inline / memuat skrip dari luar.
CSP = "; ".join(
    [
        "default-src 'none'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ]
)

_DOC_PATHS = {"/docs", "/redoc", "/openapi.json", "/docs/oauth2-redirect"}


class SecurityHeadersMiddleware:
    def __init__(self, app: ASGIApp, *, production: bool) -> None:
        self.app = app
        self.production = production

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        path = scope["path"]

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                h = MutableHeaders(scope=message)
                h.setdefault("X-Content-Type-Options", "nosniff")
                h.setdefault("X-Frame-Options", "DENY")
                h.setdefault("Referrer-Policy", "no-referrer")
                h.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
                h.setdefault("Cross-Origin-Opener-Policy", "same-origin")
                h.setdefault("Cross-Origin-Resource-Policy", "same-origin")
                # Swagger UI (hanya development) butuh skrip dari CDN -> jangan pasang CSP di sana.
                if not (path in _DOC_PATHS and not self.production):
                    h.setdefault("Content-Security-Policy", CSP)
                if path.startswith("/api/"):
                    h.setdefault("Cache-Control", "no-store")   # jangan cache respons API / data pribadi
                elif not path.startswith("/static/"):
                    h.setdefault("Cache-Control", "no-store")   # halaman HTML (termasuk admin) jangan di-cache
                if self.production:
                    h.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
            await send(message)

        await self.app(scope, receive, send_wrapper)


_BODY_METHODS = {"POST", "PUT", "PATCH"}


class RequestSizeLimitMiddleware:
    """Menolak body terlalu besar SEBELUM diproses (mitigasi DoS & upload raksasa).

    - Wajib Content-Length (chunked ditolak 411) agar ukuran bisa diperiksa di muka.
    - Endpoint JSON dibatasi max_json_bytes (default 64 KB).
    - Endpoint unggah berkas (multipart / upload) dibatasi max_upload_bytes (default 32 MB).
    """

    def __init__(self, app: ASGIApp, *, max_json_bytes: int, max_upload_bytes: int | None = None) -> None:
        self.app = app
        self.max_json = max_json_bytes
        self.max_upload = max_upload_bytes or (max_json_bytes * 16)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope["method"] not in _BODY_METHODS:
            await self.app(scope, receive, send)
            return

        headers = {k.lower(): v for k, v in scope["headers"]}
        if b"transfer-encoding" in headers:
            await self._reject(scope, receive, send, 411, "Content-Length wajib; chunked tidak diterima.")
            return
        try:
            length = int(headers.get(b"content-length", b"0"))
            if length < 0:
                raise ValueError
        except ValueError:
            await self._reject(scope, receive, send, 400, "Content-Length tidak valid.")
            return

        content_type = headers.get(b"content-type", b"").decode("latin1", errors="ignore").lower()
        path = scope.get("path", "")
        is_upload = "multipart/form-data" in content_type or "/upload-files" in path

        allowed_limit = self.max_upload if is_upload else self.max_json

        if length > allowed_limit:
            if is_upload:
                limit_mb = allowed_limit / (1024 * 1024)
                msg = f"Ukuran berkas melebihi batas maksimal yang diizinkan ({limit_mb:.0f} MB)."
            else:
                msg = "Ukuran permintaan terlalu besar."
            await self._reject(scope, receive, send, 413, msg)
            return
        await self.app(scope, receive, send)

    @staticmethod
    async def _reject(scope: Scope, receive: Receive, send: Send, code: int, msg: str) -> None:
        await JSONResponse({"detail": msg}, status_code=code)(scope, receive, send)
