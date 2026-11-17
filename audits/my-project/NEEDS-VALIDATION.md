# Security Items Needing Validation

The following items represent source-grounded security hypotheses that depend on deployment topology, runtime configuration, or unobserved infrastructure facts outside the repository code.

---

## 1. In-Memory Rate Limiting Relies on Direct Socket IP Behind Reverse Proxies

- **Fingerprint**: `sec-ratelimit-inmemory-proxy-ip`
- **Affected Boundary**: Request throttling, brute-force mitigation, and client isolation.
- **Claimed Root Cause**: `client_ip()` in `configuration/rate_limiter.py` reads `request.client.host` without centralized coordination or verified proxy forwarding configuration.

### Source Trace & Evidence
- [configuration/rate_limiter.py:62](file:///d:/uas_praktikum_sad/uas_final/sub/configuration/rate_limiter.py#L62):
  ```python
  def client_ip(request: Request) -> str:
      return request.client.host if request.client else "unknown"
  ```
- [configuration/rate_limiter.py:19](file:///d:/uas_praktikum_sad/uas_final/sub/configuration/rate_limiter.py#L19):
  ```python
  self._hits: dict[str, deque[float]] = {}
  ```

### Decisive Blocker
The production reverse proxy setup (e.g. Nginx, Cloudflare, Traefik, or AWS ALB) and Uvicorn process worker configuration are external operational facts not maintained inside this repository.

### Actionable Validation Plan
1. **Local Bounded Validation**:
   - Run Uvicorn with multiple workers (`uvicorn main:app --workers 4`).
   - Send requests exceeding the limit to test whether rate limits are shared or siloed per worker.
2. **Owner-Observed Deployment Check**:
   - Verify that Uvicorn in production is started with `--proxy-headers --forwarded-allow-ips=<TRUSTED_PROXY_IP>`.
   - Ensure the reverse proxy strips any client-provided `X-Forwarded-For` header and sets it authoritatively.
   - For horizontally autoscaled deployments, recommend transitioning `SlidingWindowLimiter` to a shared Redis backend.

---

## 2. User Self-Registration Permanently Disabled in Production Environment

- **Fingerprint**: `sec-auth-registration-disabled-in-production`
- **Affected Boundary**: Account lifecycle, availability of user registration.
- **Claimed Root Cause**: The OTP delivery subsystem only supports a local Mailpit container and unconditionally aborts with HTTP 503 when `ENVIRONMENT=production`.

### Source Trace & Evidence
- [app/routers/auth.py:54-58](file:///d:/uas_praktikum_sad/uas_final/sub/app/routers/auth.py#L54-L58):
  ```python
  if settings.is_production:
      raise HTTPException(
          status.HTTP_503_SERVICE_UNAVAILABLE,
          "OTP simulasi lokal hanya tersedia di environment development.",
      )
  ```
- [app/routers/auth.py:90-94](file:///d:/uas_praktikum_sad/uas_final/sub/app/routers/auth.py#L90-L94):
  ```python
  if settings.is_production:
      raise HTTPException(
          status.HTTP_503_SERVICE_UNAVAILABLE,
          "OTP simulasi lokal hanya tersedia di environment development.",
      )
  ```

### Decisive Blocker
The intended production user registration model (e.g., whether public registration should be enabled via a real transactional SMTP provider like SendGrid/Mailgun, or whether production accounts are strictly pre-provisioned by administrators) is a business requirement not defined in code.

### Actionable Validation Plan
1. **Local Bounded Validation**:
   - Set `ENVIRONMENT=production` in `.secrets/.env` and trigger `POST /api/auth/register`.
   - Confirm that the server returns `503 Service Unavailable`.
2. **Owner-Observed Deployment Check**:
   - Confirm with stakeholders if public user registration is required in production.
   - If required, implement a production email delivery adapter supporting authenticated TLS SMTP / transactional API.
