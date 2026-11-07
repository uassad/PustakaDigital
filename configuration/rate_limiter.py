"""Rate limiting sliding-window (in-memory, tanpa dependensi tambahan).

KEAMANAN: mencegah brute-force login, credential stuffing, spam registrasi & upload.

CATATAN PRODUKSI: penyimpanan di memori proses. Dengan banyak worker / banyak server,
batas berlaku PER PROSES. Untuk multi-instance ganti backend-nya dengan Redis
(antarmuka `hit()` tetap sama) atau tambahkan rate limit di reverse proxy (nginx/Cloudflare).
"""
import asyncio
import time
from collections import deque
from typing import Optional

from fastapi import HTTPException, Request, status


class SlidingWindowLimiter:
    def __init__(self, max_keys: int = 50_000) -> None:
        self._hits: dict[str, deque[float]] = {}
        self._lock = asyncio.Lock()
        self._max_keys = max_keys

    async def hit(self, key: str, limit: int, window_seconds: int) -> Optional[int]:
        """Catat satu permintaan. Mengembalikan None bila boleh, atau detik tunggu (Retry-After) bila melebihi batas."""
        now = time.monotonic()
        async with self._lock:
            if len(self._hits) > self._max_keys:           # batasi memori (anti memory-exhaustion)
                self._purge(now, window_seconds)
            q = self._hits.setdefault(key, deque())
            while q and now - q[0] >= window_seconds:
                q.popleft()
            if len(q) >= limit:
                return max(1, int(window_seconds - (now - q[0])) + 1)
            q.append(now)
            return None

    def _purge(self, now: float, window_seconds: int) -> None:
        for k in [k for k, q in self._hits.items() if not q or now - q[-1] >= window_seconds]:
            del self._hits[k]

    def reset(self) -> None:
        self._hits.clear()


limiter = SlidingWindowLimiter()


def _too_many(retry_after: int) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail="Terlalu banyak percobaan. Coba lagi nanti.",
        headers={"Retry-After": str(retry_after)},
    )


async def enforce(key: str, limit: int, window_seconds: int) -> None:
    retry = await limiter.hit(key, limit, window_seconds)
    if retry is not None:
        raise _too_many(retry)


def client_ip(request: Request) -> str:
    # request.client dipercaya apa adanya. Di belakang proxy jalankan uvicorn dengan
    # --proxy-headers --forwarded-allow-ips=<IP proxy Anda> agar IP asli terbaca.
    return request.client.host if request.client else "unknown"


def rate_limit(scope: str, limit: int, window_seconds: int):
    """Dependency factory: pembatasan per-IP untuk satu kelompok endpoint."""

    async def _dep(request: Request) -> None:
        await enforce(f"{scope}:{client_ip(request)}", limit, window_seconds)

    return _dep
