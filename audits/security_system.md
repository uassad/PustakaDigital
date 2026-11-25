# Ringkasan Audit Sistem Keamanan Aplikasi — Pustaka Digital (`uas_sad`)

Dokumen ini berisi hasil pembacaan menyeluruh terhadap kode sumber dan konfigurasi aplikasi **Pustaka Digital** tanpa mengubah kode program yang telah tersusun. Seluruh mekanisme keamanan, cara penerapan, dan parameter konfigurasinya dirangkum berdasarkan implementasi aktual pada repository.

---

## 1. Rate Limiting (Pembatasan Laju Permintaan)

### Cara Penerapan
- **Mekanisme:** Menggunakan algoritma **Sliding Window** in-memory (`SlidingWindowLimiter` pada `configuration/rate_limiter.py`) yang dilindungi `asyncio.Lock` agar aman dari *race condition* antar-*coroutine*.
- **Cara Kerja:** Setiap permintaan mencatat timestamp (`time.monotonic()`) ke dalam `deque` per kunci (`key`). Timestamp yang lebih tua dari `window_seconds` otomatis dibuang dari antrean. Jika jumlah hit dalam jendela waktu mencapai `limit`, server langsung mengembalikan **HTTP `429 Too Many Requests`** beserta header **`Retry-After`** (dalam detik) dan mencatat kejadian ke log keamanan MongoDB (`category="security"`, `action="rate_limited"`).
- **Proteksi Memori:** Jumlah kunci maksimal dibatasi (`max_keys = 50_000`). Jika terlampaui, kunci yang sudah kedaluwarsa langsung dibersihkan (`_purge`) untuk mencegah *memory exhaustion*.
- **Identifikasi Klien:** Menggunakan IP klien dari `request.client.host` (`client_ip()`). Di belakang *reverse proxy* (seperti Caddy/Nginx), Uvicorn dijalankan dengan `--proxy-headers` agar IP asli klien terbaca.

### Konfigurasi Lengkap per Endpoint

| Scope / Endpoint | Kunci Pembatasan | Batas (`limit`) | Jendela Waktu (`window_seconds`) | Keterangan Reset | Sumber File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/auth/register` | Per IP (`register:<ip>`) | **5 percobaan** | **3600 detik (60 menit)** | Otomatis reset bertahap setelah 60 menit | `app/routers/auth.py` |
| Registrasi per Email | Per Email (`register-email:<email>`) | **5 percobaan** | **3600 detik (60 menit)** | Mencegah spam OTP ke email yang sama | `app/services/registration_otp.py` |
| `POST /api/auth/register/verify-otp` | Per IP (`register-otp-verify:<ip>`) | **20 percobaan** | **3600 detik (60 menit)** | Ditambah batas max **5x salah OTP** per challenge | `app/routers/auth.py` |
| `POST /api/auth/login` (Layer 1) | Per IP (`login:<ip>`) | **10 percobaan** | **60 detik (1 menit)** | Menahan *brute-force* cepat dari satu IP | `app/routers/auth.py` |
| `POST /api/auth/login` (Layer 2) | Per Akun (`login-id:<identifier>`) | **8 percobaan** | **600 detik (10 menit)** | Menahan *distributed brute-force* ke satu akun | `app/services/auth_service.py` |
| `POST /api/auth/admin-session` | Per IP (`admin_session:<ip>`) | **10 percobaan** | **60 detik (1 menit)** | Pembuatan cookie sesi halaman admin | `app/routers/auth.py` |
| `PATCH /api/auth/me` | Per IP (`profile_update:<ip>`) | **5 percobaan** | **600 detik (10 menit)** | Pembaruan profil pengguna | `app/routers/auth.py` |
| `DELETE /api/auth/me` | Per IP (`account_delete:<ip>`) | **3 percobaan** | **600 detik (10 menit)** | Penghapusan akun mandiri | `app/routers/auth.py` |
| `GET /api/books` | Per IP (`books_search:<ip>`) | **60 percobaan** | **60 detik (1 menit)** | Pencarian dan daftar katalog buku | `app/routers/books.py` |
| `POST /api/books/{isbn}/upload-files` | Per IP (`book_upload_files:<ip>`) | **10 percobaan** | **60 detik (1 menit)** | Unggah cover & PDF oleh admin | `app/routers/books.py` |
| `POST /api/books/{isbn}/favorite` | Per IP (`favorite_toggle:<ip>`) | **30 percobaan** | **60 detik (1 menit)** | Tambah/hapus favorit pembaca | `app/routers/books.py` |
| `POST /api/admin/books` | Per IP (`admin_create_book:<ip>`) | **20 percobaan** | **60 detik (1 menit)** | Pembuatan entri buku baru | `app/routers/books.py` |
| `POST /api/admin/books/{isbn}/update` | Per IP (`admin_update_book:<ip>`) | **30 percobaan** | **60 detik (1 menit)** | Pembaruan metadata buku | `app/routers/books.py` |
| `GET /api/admin/logs` & `/summary` | Per IP (`admin_logs:<ip>`) | **120 percobaan** | **60 detik (1 menit)** | Pembacaan log aktivitas oleh admin | `app/routers/logs.py` |

> **Catatan Arsitektur:** Karena penyimpanan bersifat in-memory per proses worker, pada deployment multi-worker/multi-instance batas berlaku per proses (kecuali diganti backend Redis atau ditambah rate limit di reverse proxy).

---

## 2. Autentikasi & Manajemen Sesi (JWT + Cookie Admin)

### Cara Penerapan
- **Bearer JWT untuk REST API (`configuration/authentication.py`):**
  - Token ditandatangani menggunakan `PyJWT` dengan algoritma yang **dikunci lewat konfigurasi** (`algorithms=[settings.jwt_algorithm]`), sehingga kebal terhadap serangan *`alg: none`* dan *algorithm confusion*.
  - Token **hanya** menyimpan `sub` (UUID `id_pengguna`), `iss`, `aud`, `iat`, `nbf`, `exp`, dan `jti` (UUID unik token). **Role tidak pernah disimpan atau dipercaya dari token**—setiap request selalu mengambil data pengguna dan `role` terbaru langsung dari PostgreSQL (`get_authenticated_user_from_token`), sehingga perubahan role, pembekuan akun, atau penghapusan akun langsung berlaku seketika.
  - Pesan error **401 Unauthorized** diseragamkan (`"Autentikasi diperlukan atau token tidak valid."`) agar tidak membocorkan apakah token kedaluwarsa, tanda tangan palsu, atau akun tidak ada.
- **Scoped `HttpOnly` Cookie untuk Halaman HTML Admin (`app/routers/auth.py`, `configuration/authorization.py`):**
  - Saat admin login lewat `statics/js/pages/login.js`, frontend memanggil `POST /api/auth/admin-session` dengan Bearer token untuk menyetel cookie `uas_sad_admin_session`.
  - Halaman `/seAj2hB9sk/admin` dan `/seAj2hB9sk/admin/logs` memverifikasi cookie tersebut di server sebelum merender template HTML.

### Konfigurasi
- **Algoritma JWT:** `JWT_ALGORITHM` — hanya mengizinkan `"HS256"`, `"HS384"`, atau `"HS512"` (default: `HS256`).
- **Kunci Rahasia JWT:** `JWT_SECRET_KEY` — wajib minimal **32 karakter** dan tidak boleh mengandung placeholder `change_me` / `changeme`.
- **Masa Berlaku Token:** `ACCESS_TOKEN_EXPIRE_MINUTES` — default **30 menit** (rentang validasi: `1` s.d. `240` menit).
- **Klaim Wajib & Leeway:** `options={"require": ["exp", "iat", "nbf", "sub", "iss", "aud"]}`, `leeway=5` detik, `jwt_issuer="uas-sad-ebook"`, `jwt_audience="uas-sad-ebook-clients"`.
- **Atribut Cookie Admin (`uas_sad_admin_session`):**
  - `httponly=True` (tidak bisa dibaca JavaScript).
  - `samesite="strict"` (anti-CSRF).
  - `path="/seAj2hB9sk/admin"` (cookie hanya dikirim ke rute halaman admin).
  - `secure=settings.is_production` (wajib HTTPS di mode `production`).
  - `max_age = access_token_expire_minutes * 60`.
- **Penyimpanan Token di Frontend (`statics/js/api.js`):** Disimpan di `sessionStorage` dengan nama slot `uas_sad_session` (hilang otomatis saat tab ditutup, tidak menggunakan `localStorage`).

---

## 3. Penyimpanan & Verifikasi Password (Argon2id + Salt + Pepper)

### Cara Penerapan
- **Skema Kriptografi (`configuration/salt_and_pepper.py`):**
  1. Password mentah terlebih dahulu diproses dengan **HMAC-SHA256** menggunakan kunci rahasia aplikasi (`PASSWORD_PEPPER`) yang hanya berada di environment/secret manager dan **tidak pernah masuk ke database**. Ini juga mengatasi batas panjang password & karakter NUL.
  2. Hasil digest di-encode Base64 lalu di-hash menggunakan **Argon2id** (`argon2-cffi`) dengan *salt* acak unik 16 byte per password.
  3. Proses hashing & verifikasi dijalankan di threadpool (`run_in_threadpool`) agar tidak memblokir event loop async FastAPI.
- **Anti User-Enumeration via Timing:** Pada `verify_password()`, jika pengguna tidak ditemukan di database, sistem tetap menjalankan verifikasi Argon2 terhadap `_dummy_hash()` agar waktu respons gagal login selalu seragam.
- **Auto-Rehash:** Jika parameter Argon2 ditingkatkan di masa depan, `needs_rehash()` otomatis memperbarui hash pengguna saat login berhasil.
- **Proteksi Tingkat Database (`app/schemas/01_table.sql`):** Kolom `pengguna.password` memiliki constraint `CHECK (password LIKE '$argon2id$%')` untuk menolak penyimpanan plaintext atau algoritma lain secara paksa.

### Konfigurasi
- **Parameter Argon2id (OWASP / RFC 9106):**
  - `type = Type.ID` (Argon2id)
  - `time_cost = 3` iterasi
  - `memory_cost = 65536` KiB (**64 MiB**)
  - `parallelism = 2` thread
  - `hash_len = 32` byte
  - `salt_len = 16` byte
- **Pepper:** `PASSWORD_PEPPER` di `.env`, wajib minimal **32 karakter** dan bukan placeholder.

---

## 4. Otorisasi (RBAC, Anti-BOLA/IDOR, & Least-Privilege Database)

### Cara Penerapan
- **RBAC di Server (`configuration/authorization.py`):**
  - Role terdiri dari `Administrator`, `Authenticated User`, dan *Guest* (tanpa akun).
  - Dependency `require_admin` dan `require_reader` memverifikasi role langsung dari tabel `role` di database (*deny by default*). Pengecekan di frontend hanya untuk UX.
- **Anti-BOLA / IDOR:**
  - Endpoint `GET /api/users/{user_id}/favorites` memanggil `verify_user_access(current_user, target_user_id, allow_admin=True)`. Jika pengguna biasa mencoba mengakses data milik `user_id` lain, server langsung menolak dengan **HTTP `403 Forbidden`**.
  - Operasi favorit (`POST /api/books/{isbn}/favorite`, `GET /api/favorites`), edit profil (`PATCH /api/auth/me`), dan hapus akun (`DELETE /api/auth/me`) selalu mengikat `id_pengguna` dari JWT yang terverifikasi, bukan dari input payload klien.
- **Least-Privilege PostgreSQL (`app/schemas/01_table.sql` & `02_runtime_grants.sql`):**
  - Skema dibuat oleh role `uas_sad_migrator`, sedangkan aplikasi berjalan menggunakan role runtime anggota `grp_uas_sad_rw` (bukan superuser).
  - Hak `INSERT`/`UPDATE` pada tabel `role` dicabut (`REVOKE`) dari `grp_uas_sad_rw`.
  - Hak `INSERT`/`UPDATE` pada tabel `pengguna` dibatasi **per kolom tanpa `role_id`**, sehingga aplikasi secara struktural tidak dapat melakukan *privilege escalation* melalui SQL.
  - Kolom `pengguna.role_id` memiliki `DEFAULT uas_sad.default_user_role_id()` (`Authenticated User`).
  - Trigger `tg_audit_columns()` memastikan `created_at` dan `created_by` bersifat *immutable* setelah `INSERT`, serta memaksa `updated_at := now()` di sisi database.

---

## 5. Keamanan Registrasi & Verifikasi OTP

### Cara Penerapan (`app/services/registration_otp.py` & `app/schemas/user.py`)
- **Alur Tantangan Persisten:** Data registrasi sementara disimpan di tabel `uas_sad.registration_challenge` sebelum akun `pengguna` dibuat.
- **Pembuatan & Penyimpanan OTP:**
  - Kode OTP 6 digit dibuat menggunakan CSPRNG (`secrets.randbelow(1_000_000)`).
  - OTP **tidak pernah disimpan dalam bentuk plaintext** di database maupun di log; yang disimpan adalah `otp_hash = HMAC-SHA256(PASSWORD_PEPPER, "{challenge_id}:{code}")`.
  - Verifikasi menggunakan perbandingan *constant-time* (`hmac.compare_digest`) dengan penguncian baris (`SELECT ... FOR UPDATE`) untuk mencegah *race condition*.
- **Pembatasan Percobaan & Masa Berlaku:**
  - Maksimal salah memasukkan OTP sebanyak **`MAX_ATTEMPTS = 5`** kali; pada kegagalan ke-5, *challenge* langsung dihapus dari database.
  - Jika OTP kedaluwarsa, *challenge* otomatis dihapus.
- **Masking Tujuan:** Response registrasi hanya mengembalikan email/telepon yang dimasker (mis. `a***@domain.com`, `***1234`).
- **Pembatasan Environment:** Endpoint `/api/auth/register` dan `/api/auth/register/verify-otp` otomatis dinonaktifkan di mode `production` (**HTTP `503`**) karena pengiriman OTP menggunakan Mailpit lokal.

### Konfigurasi
- `OTP_SMTP_HOST`: default `"127.0.0.1"` (di Docker Compose: `"mailpit"`).
- `OTP_SMTP_PORT`: default `1025` (rentang `1`–`65535`).
- `OTP_FROM_EMAIL`: default `"no-reply@localhost"`.
- `OTP_EXPIRY_SECONDS`: default **`300` detik (5 menit)** (rentang `60`–`900` detik).

---

## 6. Keamanan Unggah Berkas, Anti-Path Traversal, & Pembekuan Akun

### Cara Penerapan (`app/services/book_service.py`, `app/services/book_files.py`, `app/routers/books.py`)
- **Validasi Tipe & Isi Berkas (Magic Bytes):**
  - **Cover (`validate_book_cover`):** Ekstensi wajib `.jpg`, diawali magic bytes JPEG `\xff\xd8\xff` dan diakhiri `\xff\xd9`.
  - **Isi Buku (`validate_book_body`):** Ekstensi wajib `.pdf`, diawali `%PDF-` dan mengandung `%%EOF` pada 1024 byte terakhir.
- **Nama Berkas Acak Ber-entropi Tinggi:** Berkas yang disimpan tidak menggunakan nama asli dari user, melainkan `{uuid4().hex}_{secrets.token_hex(16)}.{ext}` untuk mencegah penimpaan berkas (*file overwrite*), enumerasi, dan prediksi path.
- **Isolasi Direktori & Anti-Path Traversal (CWE-22):**
  - Path diselesaikan dengan `.resolve()` dan diverifikasi menggunakan `target.is_relative_to(base_dir)`.
  - Penghapusan berkas (`book_files.py`) **tidak menggunakan shell** (`os.system`/`subprocess`), melainkan `Path.unlink()`, dengan validasi regex ketat (`_STORED_NAME`), penolakan `..`, symlink, serta nama perangkat terlarang Windows (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`).
- **Mekanisme Pembekuan Akun Admin (`account_status = 'beku'`):**
  - Setiap kegagalan validasi format/isi berkas pada `POST /api/books/{isbn}/upload-files` dicatat secara atomik per hari ke tabel `upload_failure_daily`.
  - Jika admin melakukan **`BAD_UPLOAD_LIMIT = 4`** kali percobaan unggah tidak valid dalam satu hari (berdasarkan tanggal database), status akun otomatis diubah menjadi **`beku`** dan tercatat di log keamanan (`action="account_frozen"`).
  - Akun berstatus `beku` langsung ditolak (`403 Forbidden`) pada saat login, pembuatan/pembaruan/penghapusan buku, unggah berkas, serta akses halaman admin sampai dibuka secara manual oleh tim IT.

### Konfigurasi
- `BOOKS_COVER_PATH`: default `"books/cover"`.
- `BOOKS_BODY_PATH`: default `"books/body"`.
- `MAX_COVER_UPLOAD_MB`: default **`5` MB** (rentang `1`–`20` MB).
- `MAX_PDF_UPLOAD_MB`: default **`100` MB** (rentang `1`–`100` MB).
- `BAD_UPLOAD_LIMIT`: **`4` percobaan** tidak valid per hari.

---

## 7. Validasi Input, Anti-Mass Assignment, Anti-SQLi, & Anti-Open Redirect

### Cara Penerapan
- **Anti-Mass Assignment:** Seluruh skema input Pydantic (`UserRegister`, `OTPVerify`, `UserLogin`, `UserProfileUpdate`, `AccountDeletion`, `BookSearchQuery`, `BookCreate`, `BookUpdate`) menggunakan `ConfigDict(extra="forbid")`, sehingga field tak dikenal (seperti `role_id` atau `account_status`) langsung ditolak dengan `422`.
- **Kebijakan Password Registrasi (`UserRegister`):**
  - Panjang `12`–`128` karakter, bebas karakter kontrol (`ord < 32` atau `127`).
  - Wajib mengandung minimal **3 dari 4 kelas karakter** (huruf kecil, huruf besar, angka, simbol).
  - Minimal **5 karakter unik** (mencegah password monoton seperti `aaaaaaaaaaaa`).
  - Tidak boleh mengandung substring `username` atau bagian lokal `email` (untuk panjang ≥ 3 karakter).
- **Validasi ISBN-13 (`clean_and_validate_isbn13` & Domain PostgreSQL `uas_sad.isbn13`):** Wajib 13 digit diawali `978`/`979` dan lolos algoritma *check digit* modulo 10 di aplikasi maupun di database.
- **Anti-SQL Injection & Anti-Wildcard DoS:**
  - Seluruh query menggunakan SQLAlchemy ORM/Core dengan *bound parameters*.
  - Pencarian `ILIKE` men-escape karakter `\`, `%`, `_` lewat `escape_like()`.
  - Koneksi database (`configuration/database_session.py`) menerapkan `statement_timeout = 10000` ms (10 detik), `idle_in_transaction_session_timeout = 15000` ms, `command_timeout = 15` detik, `echo=False`, dan `hide_parameters=True`.
- **Anti-Open Redirect:**
  - Backend (`app/routers/pages.py`): `_validate_next_path()` menghapus query string dan hanya mengizinkan path internal yang cocok dengan regex `[\/\w\-.]*` (fallback ke `"/"`).
  - Frontend (`statics/js/dom.js`): `safeInternalPath()` memvalidasi pola `^\/(?![/\\])[^\s\\]*$` agar menolak `//evil.com`, `https://...`, dan `javascript:`.

---

## 8. HTTP Middleware, Security Headers, CORS, & Error Handling

### Cara Penerapan (`main.py` & `configuration/middleware.py`)
Urutan middleware disusun berlapis (yang ditambahkan terakhir berjalan paling luar):
1. **`TrustedHostMiddleware`:** Memvalidasi header `Host` terhadap `ALLOWED_HOSTS` untuk mencegah *Host-header injection*.
2. **`SecurityHeadersMiddleware`:** Menyisipkan header keamanan pada setiap respons HTTP:
   - `Content-Security-Policy`: `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'` (dikecualikan hanya untuk `/docs`, `/redoc`, `/openapi.json` di mode `development`).
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: no-referrer`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Resource-Policy: same-origin`
   - `Cache-Control: no-store` untuk semua rute `/api/` dan halaman HTML (selain `/static/`).
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains` (aktif otomatis saat `ENVIRONMENT=production`).
3. **`CORSMiddleware`:**
   - Menolak wildcard `*` secara keras di `Settings` (`_cors`).
   - `allow_credentials=False`, `allow_methods=["GET", "POST"]`, `allow_headers=["Authorization", "Content-Type"]`, `max_age=600`.
   - Di mode `production`, seluruh origin CORS wajib diawali `https://`.
4. **`RequestSizeLimitMiddleware`:**
   - Berlaku pada `POST`, `PUT`, `PATCH`.
   - Menolak request `Transfer-Encoding: chunked` dengan **HTTP `411`**.
   - Membatasi ukuran body JSON maksimal **`MAX_JSON_BODY_KB`** (default **64 KB**, rentang `1`–`1024` KB) dan upload multipart maksimal **`(max_pdf_upload_mb + max_cover_upload_mb + 2)` MB** (default **107 MB**), menolak selebihnya dengan **HTTP `413`**.
5. **Pengamanan Dokumentasi & Error Handler (`main.py`):**
   - `/docs`, `/redoc`, dan `/openapi.json` **dimatikan** (`None`) saat `ENVIRONMENT=production`.
   - Handler `RequestValidationError` (422) membuang field `"input"` agar password/data sensitif tidak pernah dipantulkan kembali di respons error.
   - Handler `Exception` (500) hanya mengembalikan pesan generik `"Terjadi kesalahan pada server."` sementara *stack trace* dicatat di log server.

### Konfigurasi
- `CORS_ORIGINS`: default `"http://localhost:8000"` (dipisah koma, tanpa `*`).
- `ALLOWED_HOSTS`: default `"localhost,127.0.0.1"` (dipisah koma).

---

## 9. Keamanan Frontend (Anti-XSS & Manajemen Klien)

### Cara Penerapan (`statics/js/dom.js`, `statics/js/api.js`, `statics/js/auth.js`)
- **Zero `innerHTML`:** Seluruh manipulasi DOM menggunakan helper `el()` yang menulis teks via `textContent` / `document.createTextNode` (otomatis ter-escape dari XSS).
- **Blokir Atribut Berbahaya:** `el()` menolak atribut yang cocok dengan `/^(on|style$|srcdoc$)/i` untuk mencegah inline event handler dan inline style.
- **Fetch Terkunci (`api.js`):**
  - Hanya mengizinkan path yang diawali `"/api/"`.
  - Memaksa `credentials: "omit"`, `cache: "no-store"`, dan `referrerPolicy: "no-referrer"`.
  - Otomatis membersihkan `sessionStorage` dan mengarahkan ke `/login?expired=1` jika menerima `401`.
- **Proteksi Back-Forward Cache (`auth.js`):** `reloadOnBackForward()` memicu reload pada event `pageshow` (`persisted` / `back_forward`) agar halaman terautentikasi tidak tampil dari cache browser setelah logout.

---

## 10. Logging Aktivitas & Pemantauan Keamanan (MongoDB)

### Cara Penerapan (`app/services/activity_log.py`, `app/routers/logs.py`)
- **Kategori Log:** `auth`, `admin_book`, `reader`, dan `security` (mencakup `rate_limited`, `access_denied`, `unauthorized_access`, `invalid_upload`, `account_frozen`).
- **Prinsip Fail-Open:** Penulisan log dijalankan asinkron (*fire-and-forget* `asyncio.create_task`). Jika MongoDB mati atau tidak terjangkau, aplikasi **tetap berjalan normal** dan hanya mencatat peringatan maksimal sekali per 30 detik.
- **Redaksi Data Sensitif & Anti Log-Injection:**
  - Kunci yang cocok dengan regex `pass|secret|token|authorization|otp|pepper|cookie` otomatis diganti nilainya menjadi `"[disembunyikan]"`.
  - Karakter kontrol `[\x00-\x1f\x7f]` diganti spasi dan string dipotong maksimal 300 karakter.
  - Kunci diawali `$` atau mengandung `.` disanitasi menjadi `_`.
- **Anti-NoSQL Injection pada Pembacaan Log:**
  - Endpoint `GET /api/admin/logs` hanya dapat diakses `require_admin`.
  - Parameter `category`, `status`, `action` (`^[a-z_]{1,40}$`), `ip` (`^[0-9a-fA-F:.]{1,45}$`) divalidasi ketat.
  - Pencarian username `actor` di-escape dengan `re.escape(actor)` sebelum dimasukkan ke operator `$regex`.

### Konfigurasi
- `ACTIVITY_LOG_ENABLED`: default `true`.
- `MONGODB_URI`: default `"mongodb://127.0.0.1:27017"` (harus diawali `mongodb://` atau `mongodb+srv://`).
- `MONGODB_DB`: default `"pustaka_digital"`.
- `MONGODB_LOG_COLLECTION`: default `"activity_logs"`.
- `MONGODB_TIMEOUT_MS`: default `2000` ms (rentang `200`–`30000` ms).

---

## 11. Keamanan Konfigurasi, Infrastruktur Docker, & Build Produksi

### Cara Penerapan & Konfigurasi
- **Fail-Closed Settings (`configuration/settings.py`):** Aplikasi membaca konfigurasi dari `.secrets/.env` (atau environment container) dan **gagal start** apabila `DATABASE_URL`, `JWT_SECRET_KEY`, atau `PASSWORD_PEPPER` tidak valid/tidak ada. Pada mode `production`, `DATABASE_SSLMODE` wajib minimal `"require"` (disarankan `"verify-full"`).
- **Container Hardening (`docker/Dockerfile.debian`, `docker/docker-compose-prod.yml`, `docker/Caddyfile`):**
  - Aplikasi dijalankan sebagai user non-root (`nonroot`).
  - Pada `docker-compose-prod.yml`, port backend `8000` hanya diekspos ke jaringan internal Docker (`expose: ["8000"]`), sedangkan trafik luar masuk melalui reverse proxy **Caddy** (port `80`/`443` dengan TLS).
- **Obfuscation & Minification Produksi (`build.js`):**
  - Kode Python (`main.py`, `app`, `books`, `configuration`) di-obfuscate menggunakan **PyArmor**.
  - JavaScript di-obfuscate menggunakan `javascript-obfuscator` (*control flow flattening* & *base64 string array*).
  - Nama class CSS diacak menggunakan `postcss-obfuscator` dan disinkronkan ke HTML/JS; HTML diminifikasi menggunakan `html-minifier-terser`.

---

## 12. Catatan Penting Konfigurasi Saat Ini

Beberapa hal yang teramati langsung dari kode dan perlu diperhatikan saat operasional/deployment:
1. **CORS vs `DELETE /api/auth/admin-session`:** Di `main.py`, `CORSMiddleware` mengizinkan metode `["GET", "POST"]` dan `allow_credentials=False` (memadai bila frontend & backend berada pada origin yang sama di balik Caddy). Jika frontend dipisah ke domain berbeda (misalnya Vercel), `DELETE` atau cookie admin lintas-origin perlu penyesuaian.
2. **Penanganan Proxy di `Dockerfile.debian` (Production):** Perintah `CMD` produksi pada `docker/Dockerfile.debian` menggunakan `--forwarded-allow-ips=*`. Di produksi nyata, sebaiknya dipersempit menjadi IP/subnet *reverse proxy* tepercaya agar header `X-Forwarded-For` tidak dapat dipalsukan jika backend terekspos langsung.
3. **Revokasi Token (`jti`):** Klaim `jti` sudah disertakan dalam setiap JWT (`create_access_token`), namun saat ini belum ada mekanisme *denylist/revocation* aktif di server sebelum token kedaluwarsa (`access_token_expire_minutes`, default 30 menit).
