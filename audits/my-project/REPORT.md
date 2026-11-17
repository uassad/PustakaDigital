# Security Audit Report — Pustaka Digital (`sub`)

## 1. Run Metadata & Scope
- **Run Profile**: `standard`
- **Scope**: `app`, `configuration`, `statics`, `templates`, `main.py`, `.secrets`
- **Source Reference**: `4ca47a9363feee8c6e299d7bac3fad3be3d58235`
- **Execution Policy**: `sandboxed-source-and-local-only`
- **Selected Companions**: `WEB-PROTOCOL-AND-AUTH.md`, `CLIENT-SIDE.md`, `DATA-ISOLATION-AND-LIFECYCLE.md`, `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md`
- **Prior Run Paths**: None (initial audit pass)

## 2. Executive Security Posture Summary
The Pustaka Digital application displays robust defense-in-depth engineering across multiple layers:
- Strict **Server-Side Authorization (RBAC & ABAC)** with zero client-side role trust.
- Hardened **Database Security** with PostgreSQL column-level grant revocation on `role_id` preventing privilege escalation even in the event of an application vulnerability.
- Comprehensive **OWASP Mitigation**: NoSQL injection protection using `re.escape`, SQL injection prevention via typed SQLAlchemy ORM bind parameters, and path traversal prevention with high-entropy UUID filenames and strict boundary validation.
- Secure **Frontend Practices**: Non-negotiable Content Security Policy (no inline scripts, no external origins), DOM manipulation strictly utilizing `textContent` and `createTextNode` (eliminating client-side DOM XSS).

The primary critical vulnerability identified is the inadvertent tracking of `.secrets/.env` within Git source control, which exposes active cryptographic signing keys and database passwords to any party with repository access.

---

## 3. Confirmed Findings

| Severity | Fingerprint | Title | Affected Boundary | Observed Result |
| :--- | :--- | :--- | :--- | :--- |
| **HIGH** | `sec-secrets-env-git-tracked` | Production JWT Secret & Password Pepper Committed in Git-Tracked `.env` | Configuration & Cryptographic Secrets | Active `JWT_SECRET_KEY` and `PASSWORD_PEPPER` are exposed in plaintext via git tracking. |

### Finding Details: `sec-secrets-env-git-tracked`
- **Location**: `.secrets/.env:12-13`
- **Lower-Trust Principal**: Any collaborator or attacker with repository read access.
- **Root Cause**: `.secrets/.env` was committed into git tracking prior to adding `.secrets/` to `.gitignore`. Git continues tracking files regardless of subsequent `.gitignore` additions unless explicitly untracked via `git rm --cached`.
- **Target-Native Reproduction**:
  ```powershell
  git ls-files .secrets
  # Returns:
  # .secrets/.env
  # .secrets/requirements.txt
  ```
- **Conditions**: Read access to the Git repository or cloned checkout.
- **Demonstrated Impact**: Compromises JWT signature integrity (allowing token forgery for arbitrary user IDs) and exposes the password pepper, degrading Argon2id offline hash resistance if the database is breached.
- **Priority Rationale**: Rated **HIGH** because key disclosure compromises core authentication invariants.
- **Smallest Source Fix**:
  ```powershell
  git rm --cached .secrets/.env
  git rm --cached .secrets/requirements.txt
  git commit -m "fix(security): stop tracking secrets directory in git index"
  ```
  Immediately rotate `JWT_SECRET_KEY` and `PASSWORD_PEPPER` in production, ensuring they are loaded exclusively via host environment variables.

---

## 4. Needs Validation Leads

| Fingerprint | Title | Trace | Blocker | Recommended Resolution Plan |
| :--- | :--- | :--- | :--- | :--- |
| `sec-ratelimit-inmemory-proxy-ip` | In-Memory Rate Limiting Behind Reverse Proxies | `configuration/rate_limiter.py:62` | Reverse proxy and worker topology not established in repository. | **Deployment**: Verify proxy headers (`X-Forwarded-For`) and Uvicorn `--forwarded-allow-ips`. Consider Redis for distributed clusters. |
| `sec-auth-registration-disabled-in-production` | Self-Registration Inoperative in Production | `app/routers/auth.py:54` | Production transactional email/SMS gateway architecture not specified. | **Deployment**: Confirm whether registration should remain closed in production or if an authenticated external provider should be integrated. |

---

## 5. Security Strengths & Hardening Notes
1. **Password Security**: Argon2id parameters (m=64MB, t=3, p=2) with HMAC-SHA256 pepper. Verifications always execute against dummy hashes on non-existent users to ensure uniform response timing (anti-enumeration).
2. **Access Control Verification**: `verify_user_access(current_user, target_user_id)` strictly blocks Horizontal Privilege Escalation (BOLA/IDOR) on favorites and user profiles.
3. **Audit Trails**: Asynchronous, non-blocking MongoDB logging records security events (`rate_limited`, `access_denied`, `invalid_upload`, `account_frozen`) with sensitive key sanitization.
4. **File Upload Hardening**: Strict MIME/magic-byte checks (`\xff\xd8\xff` for JPG, `%PDF-` for PDF), request body size limits in ASGI middleware, and automated admin account freezing after 4 invalid upload attempts.

---

## 6. Coverage Summary
- **Total Coverage Units Evaluated**: 9
- **Status Breakdown**:
  - `covered`: 6 units (66.7%)
  - `candidate`: 3 units (33.3%)
  - `blocked`: 0 units
  - `deferred`: 0 units
- **Rejected Candidates**: 1 (`sec-book-search-sqli-speculation` disproved by SQLAlchemy typed query construction).
- **Final Validation Status**: All findings and coverage units strictly conform to `report-schema.json` and `validate-coverage-ledger.cjs`.
