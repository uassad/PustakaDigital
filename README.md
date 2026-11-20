# Pustaka Digital - run the project on another device

Follow these steps to run the development version on a new computer. Docker
starts the web app, PostgreSQL, MongoDB, and a local email inbox together.

## 1. Install the prerequisites

- [Git](https://git-scm.com/downloads) to get the project source.
- [Python 3](https://www.python.org/downloads/) to run the environment setup
  helper.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) on Windows
  or macOS. It includes Docker Compose. On Linux, install
  [Docker Engine](https://docs.docker.com/engine/install/) and the
  [Compose plugin](https://docs.docker.com/compose/install/linux/).

Start Docker Desktop (or the Docker Engine service) before continuing. You do
not need to install the app's Python or Node.js packages on your computer;
Docker installs the app dependencies when it builds the image.
On macOS or Linux, use `python3` instead of `python` in the commands below if
that is the Python 3 command on your system.

## 2. Get the project

This repository is private, so sign in to an account with access before cloning:

```shell
git clone https://github.com/uassad/private.git
cd private
```

Run the remaining commands from the project folder containing `main.py`.

## 3. Create local development secrets

Create `.secrets/.env` in the project folder. This file is local and must not be
committed. Generate three random values with Python; run the command once for
the database password and twice for the application secrets:

```shell
python -c "import secrets; print(secrets.token_hex(24))"
python -c "import secrets; print(secrets.token_urlsafe(48))"
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Add the generated values to `.secrets/.env`:

```dotenv
ENVIRONMENT=development
DATABASE_URL=postgresql+asyncpg://postgres:<database-password>@localhost:5432/uas_sad_website_buku
DB_SCHEMA=uas_sad
JWT_SECRET_KEY=<first-application-secret>
PASSWORD_PEPPER=<second-application-secret>
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
ALLOWED_HOSTS=localhost,127.0.0.1
```

Replace each placeholder with its generated value. Keep the database password
from `token_hex` as-is; it is safe to use in the database URL. The two
application secrets must each be at least 32 characters.

Generate Docker's runtime environment files from this local configuration:

```shell
python docker/prepare-env.py
```

This sets the database hostname to the Compose service name and creates the
PostgreSQL container settings. Re-run it if you change `DATABASE_URL`.

## 4. Build and start the Docker project

```shell
docker compose -f docker/docker-compose-dev.yml config --quiet
docker compose -f docker/docker-compose-dev.yml up --build -d
```

The first build may take a few minutes. Compose installs the Python
dependencies, starts the databases and Mailpit, and initializes the database
schema on its first start.

Check that the services are running:

```shell
docker compose -f docker/docker-compose-dev.yml ps
```

For database inspection commands, see
[PostgreSQL commands](POSTGRESQL_COMMANDS.md) and
[MongoDB commands](MONGODB_COMMANDS.md).

## 5. Open the app

- [Pustaka Digital](http://127.0.0.1:8000/)
- [Register](http://127.0.0.1:8000/register)
- [Interactive API docs](http://127.0.0.1:8000/docs)
- [Local email inbox (Mailpit)](http://127.0.0.1:8025/)

Registration verification messages appear in Mailpit; this development setup
does not send real email or SMS.

To open the app from another device on the same network, use the computer
running Docker's LAN IP, for example `http://192.168.1.20:8000`. Add that IP to
`ALLOWED_HOSTS` in `.secrets/.env`, allow port 8000 through the host firewall if
needed, and run `python docker/prepare-env.py` again before restarting the app.
Do not expose this development setup directly to the public internet.

## 6. Stop or troubleshoot

Stop the containers without deleting the database:

```shell
docker compose -f docker/docker-compose-dev.yml down
```

To inspect application logs:

```shell
docker compose -f docker/docker-compose-dev.yml logs -f backend
```

The database is stored in a Docker volume and remains available after stopping
the stack. Avoid `docker compose down -v` unless you intend to delete that data.

## Registration and account roles

Registration verifies the selected email address or phone number; login remains
password-only. Verification codes expire after five minutes and allow up to five
attempts. Messages are captured by Mailpit: phone verification uses a synthetic
email recipient and never sends an SMS to a mobile network. OTP simulation
endpoints are disabled in production.

Administrator pages and APIs verify the account role. Reader accounts cannot
open the administrator dashboard or upload books.

## Existing databases

The Compose database initialization scripts run only when PostgreSQL creates a
new data volume. If you reuse an existing database or volume, check that its
schema is current before starting the app; in particular, the registration OTP
and account-management migrations are
[`03_registration_otp_migration.sql`](app/schemas/03_registration_otp_migration.sql)
and
[`06_account_management_migration.sql`](app/schemas/06_account_management_migration.sql).
Apply any required migrations as `uas_sad_migrator`.

## Production deployment

Production uses a separate Compose file. Before starting it, configure
[`docker/Caddyfile`](docker/Caddyfile) for the deployment domain and set
production values in `.secrets/.env`: use strong secrets, HTTPS-only
`CORS_ORIGINS`, the real `ALLOWED_HOSTS`, and `DATABASE_SSLMODE=require` (or a
verified TLS mode).

**The bundled PostgreSQL service does not enable TLS.** The app requires a TLS
database connection in production, so configure TLS for PostgreSQL or use a
TLS-enabled database before starting the production backend.

```shell
python docker/prepare-env.py
docker compose -f docker/docker-compose-prod.yml config --quiet
docker compose -f docker/docker-compose-prod.yml up --build -d
docker compose -f docker/docker-compose-prod.yml ps
docker compose -f docker/docker-compose-prod.yml logs -f backend
```

The production image builds its bundle with Node.js 22 and Python 3.12; no
host-generated `1. dist_prod` directory is required. Stop it with:

```shell
docker compose -f docker/docker-compose-prod.yml down
```
