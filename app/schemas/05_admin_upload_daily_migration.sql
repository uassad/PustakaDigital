-- Run as uas_sad_migrator on databases created before the admin dashboard changes.
BEGIN;

ALTER TABLE uas_sad.pengguna
    ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS account_status varchar(10) NOT NULL DEFAULT 'normal';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pengguna_account_status_check'
          AND conrelid = 'uas_sad.pengguna'::regclass
    ) THEN
        ALTER TABLE uas_sad.pengguna
            ADD CONSTRAINT pengguna_account_status_check
            CHECK (account_status IN ('normal', 'beku'));
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS uas_sad.upload_failure_daily (
    user_id      uuid    NOT NULL,
    failure_date date    NOT NULL DEFAULT CURRENT_DATE,
    attempts     integer NOT NULL DEFAULT 0,
    CONSTRAINT upload_failure_daily_pkey PRIMARY KEY (user_id, failure_date),
    CONSTRAINT upload_failure_daily_user_fkey FOREIGN KEY (user_id)
        REFERENCES uas_sad.pengguna (id_pengguna) ON DELETE CASCADE,
    CONSTRAINT upload_failure_daily_attempts CHECK (attempts >= 0)
);

REVOKE INSERT, UPDATE ON uas_sad.pengguna FROM grp_uas_sad_rw;
GRANT INSERT (id_pengguna, username, email, nomor_telepon, email_verified, phone_verified, password, created_by)
    ON uas_sad.pengguna TO grp_uas_sad_rw;
GRANT UPDATE (username, email, nomor_telepon, password, account_status, updated_by)
    ON uas_sad.pengguna TO grp_uas_sad_rw;
GRANT UPDATE (phone_verified) ON uas_sad.pengguna TO grp_uas_sad_rw;
GRANT DELETE ON uas_sad.pengguna TO grp_uas_sad_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON uas_sad.upload_failure_daily TO grp_uas_sad_rw;

COMMIT;
