# Dashboard administrator

The dashboard is available at `/seAj2hB9sk/admin`. The page itself is public HTML;
all dashboard data and mutations are protected by backend administrator dependencies.

Administrators can search and paginate the book catalog, create/edit/delete book
metadata, and upload book files. Cover files must use the `.jpg` extension and
JPEG signature; book bodies must use `.pdf` and include PDF header/trailer markers.
Files are size-limited, stored under randomized server-generated filenames, and
never trusted based on the browser-provided MIME type.

Invalid format/content attempts are counted by the PostgreSQL backend per
administrator and database calendar day. The fourth invalid attempt sets
`pengguna.account_status` to `beku`. The counter naturally starts a new daily
record at the next database date, but a frozen account remains frozen until IT
manually changes its status. Network errors and file-size limit errors do not
count toward this threshold.

## Database setup

- New database: apply `app/schemas/01_table.sql`, then
  `app/schemas/02_runtime_grants.sql`.
- Existing database: apply the registration migration
  `app/schemas/03_registration_otp_migration.sql` first if it has not already
  been applied, then apply `app/schemas/05_admin_upload_daily_migration.sql`,
  then re-apply the runtime grants.

Run schema changes as `uas_sad_migrator`, not as the application role.

To reopen an account, IT should verify the account identity and change the
status through a controlled administrative database session:

```sql
UPDATE uas_sad.pengguna
SET account_status = 'normal',
    updated_by = id_pengguna
WHERE username = '<verified_admin_username>'
  AND account_status = 'beku';
```

The application role is intentionally not granted a general account-status
management endpoint.
