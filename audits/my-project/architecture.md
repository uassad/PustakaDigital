# Architecture & Threat Model Summary

## 1. Product Overview & Principals
Pustaka Digital is a digital library web application providing digital book cataloging, search, reader favorites, and administrative document curation.

The system defines three principal levels:
1. **Unauthenticated User (Guest)**: May browse the catalog, view book details, stream PDF content, and initiate contact-verification OTP challenges during registration.
2. **Authenticated User (Reader)**: Possesses an account verified via email or simulated SMS. May maintain a personal favorite books list (`/api/favorites`), manage their own profile, and self-delete their account. Restricted from all administrative endpoints.
3. **Administrator**: Manages catalog entries (create, update, delete books) and uploads physical book covers (`.jpg`) and PDF documents (`.pdf`). Admin users access an obfuscated dashboard route (`/seAj2hB9sk/admin`) protected by an HttpOnly cookie and server-side DB role verification.

## 2. Tech Stack & Execution Model
- **Backend**: Python 3.12 with FastAPI (ASGI framework) and Uvicorn.
- **Relational Storage**: PostgreSQL 16 accessed via SQLAlchemy async ORM and `asyncpg`.
- **Audit Logging**: MongoDB 7.0/4.4 accessed asynchronously via `AsyncMongoClient` (`activity_log.py`).
- **Frontend**: Server-rendered Jinja2 static shells (`templates/`) with client-side ES6 modules (`statics/js/`).
- **Cryptographic Primitives**: Argon2id for password hashing with application-layer HMAC-SHA256 pepper; HS256 JWTs with explicit claims (`sub`, `iss`, `aud`, `exp`, `iat`, `nbf`, `jti`).
- **Deployment Boundaries**: Containerized multi-service Docker Compose topology (`backend`, `postgres`, `mongodb`, `mailpit`).

## 3. Entry Surfaces & Sinks
- **HTTP Public Entrypoints**:
  - `POST /api/auth/register`, `POST /api/auth/register/verify-otp` -> OTP challenge store -> Mailpit delivery.
  - `POST /api/auth/login` -> Argon2id verification -> JWT issuance.
  - `GET /api/books`, `GET /api/books/{isbn}` -> PostgreSQL catalog queries.
  - `GET /api/books/{isbn}/cover`, `GET /api/books/{isbn}/pdf` -> Filesystem streaming from `books/cover` and `books/body`.
- **HTTP Authenticated Entrypoints**:
  - `PATCH /api/auth/me`, `DELETE /api/auth/me` -> Password-confirmed profile mutation.
  - `POST /api/books/{isbn}/favorite`, `GET /api/favorites` -> Favorites mapping.
- **HTTP Administrative Entrypoints**:
  - `POST /api/books/{isbn}/upload-files` -> Multipart parser -> Magic byte validation -> Disk storage in `books/cover` and `books/body`.
  - `POST /api/admin/books`, `POST /api/admin/books/{isbn}/update`, `DELETE /api/admin/books/{isbn}` -> Catalog lifecycle.
  - `GET /api/admin/logs`, `GET /api/admin/logs/summary` -> MongoDB aggregation and filtered log retrieval.

## 4. Security Controls & Containment
1. **Strict Content-Security-Policy (CSP)**: `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; form-action 'self'; frame-ancestors 'none'`.
2. **Path Traversal Defenses**: Uploaded files receive high-entropy UUIDv4 filenames; file retrieval rejects parent directory traversal (`..`) and absolute path prefixes (`/`).
3. **Database Privilege Separation**: Application runtime role (`grp_uas_sad_rw`) is restricted at the schema level from updating `role_id`, preventing privilege escalation.
4. **Anti-Timing & Anti-Enumeration**: Consistent Argon2id timing runs on authentication failures using dummy password hashes; login error responses are uniform.
