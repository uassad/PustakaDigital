# Local registration OTP simulation

This flow verifies the selected contact during registration. Login remains password-only.
It is a development simulation, not a way to send real email or SMS.

The application project is in the `sub` folder of this workspace. If your terminal
is at the workspace root, run `Set-Location sub` first. The commands below assume
your current directory is the project folder containing `main.py`.

## Run the development environment with Docker Compose

1. Make sure Docker Desktop is running and `.secrets/.env` contains
   `DATABASE_URL`, `JWT_SECRET_KEY`, and `PASSWORD_PEPPER`. The database URL
   must include the PostgreSQL username, password, and database name.
2. From the project root, generate Docker-specific runtime environment files:

   ```powershell
   python docker/prepare-env.py
   ```

   This keeps the local `.secrets/.env` unchanged, rewrites the database host
   to the Compose service name `postgres`, and passes PostgreSQL credentials
   only to the database container. The generated files are ignored by Git and
   excluded from the Docker build context. Run this command again after
   changing `.secrets/.env`.
3. Check and start the development stack:

   ```powershell
   docker compose -f docker/docker-compose-dev.yml config --quiet
   docker compose -f docker/docker-compose-dev.yml up --build -d
   ```

4. Check status and logs:

   ```powershell
   docker compose -f docker/docker-compose-dev.yml ps
   docker compose -f docker/docker-compose-dev.yml logs -f backend
   ```

5. Open <http://127.0.0.1:8000>. Mailpit is available at
   <http://127.0.0.1:8025>. Apply the database schema as described below if
   this is a new database.
6. Stop the stack when finished:

   ```powershell
   docker compose -f docker/docker-compose-dev.yml down
   ```

The database volume persists when the stack is stopped. Do not add `-v` to
`down` unless you intend to delete the database data.

## Run the production environment with Docker Compose

1. Set production values in `.secrets/.env`. Use a strong
   `JWT_SECRET_KEY` and `PASSWORD_PEPPER`, set `CORS_ORIGINS` to HTTPS origins,
   set `ALLOWED_HOSTS` to the actual host names, and configure
   `DATABASE_SSLMODE` to `require` or a verified TLS mode supported by the
   database.
2. Generate the runtime environment files:

   ```bash
   python docker/prepare-env.py
   ```

3. Configure `docker/Caddyfile` for the deployment domain, then validate
   Compose:

   ```bash
   docker compose -f docker/docker-compose-prod.yml config --quiet
   ```

4. Build and start the production stack:

   ```bash
   docker compose -f docker/docker-compose-prod.yml up --build -d
   docker compose -f docker/docker-compose-prod.yml ps
   docker compose -f docker/docker-compose-prod.yml logs -f backend
   ```

   The production Dockerfile runs `build.js` in a Linux builder stage with
   Node.js 22 and Python 3.12, then copies the generated bundle into the
   Ubuntu/Debian runtime image. No host-generated `1. dist_prod` bundle is
   required.
5. Open the HTTPS domain configured in Caddy. Stop the production stack with:

   ```bash
   docker compose -f docker/docker-compose-prod.yml down
   ```

**Production database prerequisite:** the bundled PostgreSQL service currently
does not enable TLS, while the application requires a TLS database connection
in production. Configure TLS for that service or use a TLS-enabled database
before starting the production backend. The database must also be initialized
with the schema described below.

## Start the local inbox

From the project root, run:

```powershell
docker compose -f docker-compose.otp.yml up -d
```

Mailpit catches all outgoing messages locally:

- Inbox UI: <http://127.0.0.1:8025>
- SMTP: `127.0.0.1:1025`

Add these optional settings to `.secrets/.env` if you need different values:

```dotenv
OTP_SMTP_HOST=127.0.0.1
OTP_SMTP_PORT=1025
OTP_FROM_EMAIL=no-reply@localhost
OTP_EXPIRY_SECONDS=300
```

## Apply the database schema

For a new database, run `app/schemas/table.sql` and then
`app/schemas/02_runtime_grants.sql` as the schema migrator.

For an existing database, run `app/schemas/03_registration_otp_migration.sql`
as `uas_sad_migrator`. It adds contact-verification flags and the pending-registration
challenge table. The schema migrator must own these objects.

Run `app/schemas/06_account_management_migration.sql` as `uas_sad_migrator` on an
existing database to enable reader profile updates and account deletion. Account
deletion cascades to that reader's favorites and upload-failure counters. Readers
can update their username and phone number after confirming their current password;
email remains read-only because changing it requires a contact-verification flow.

## Run and try it

Start the application from the project root:

```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Open <http://127.0.0.1:8000/register>, choose email or phone, and submit the
form. Both message types appear in Mailpit. Phone delivery is represented by a
message addressed to a synthetic `sms-...@sms.local` recipient; it never reaches
a mobile network. Enter the six-digit code from the inbox to finish registration.

Codes expire after five minutes by default, allow five verification attempts,
and are stored only as keyed hashes. Pending registrations store an Argon2id
password hash. OTP simulation endpoints are disabled when `ENVIRONMENT=production`.

## Administrator dashboard

Administrator and reader pages use separate templates and JavaScript files.
After an administrator signs in, the server verifies the role before issuing a
short-lived, HttpOnly cookie scoped to the admin dashboard. The dashboard checks
that cookie and the current database role on every page request; admin APIs also
enforce the role independently. Readers cannot open the dashboard or upload files.

## Stop the local inbox

From the project root, run:

```powershell
docker compose -f docker-compose.otp.yml down
```

To stop uvicorn:
```powershell
deactivate
```
