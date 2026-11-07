# Local registration OTP simulation

This flow verifies the selected contact during registration. Login remains password-only.
It is a development simulation, not a way to send real email or SMS.

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
