-- Run as uas_sad_migrator on existing databases after the base schema.
BEGIN;

ALTER TABLE uas_sad.pengguna
    ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS uas_sad.registration_challenge (
    id                  uuid         NOT NULL,
    username            varchar(30)  NOT NULL,
    email               varchar(50)  NOT NULL,
    nomor_telepon       varchar(15),
    password_hash       varchar(255) NOT NULL,
    verification_method varchar(10)  NOT NULL,
    otp_hash            varchar(64)  NOT NULL,
    expires_at          timestamptz  NOT NULL,
    attempts            integer      NOT NULL DEFAULT 0,
    created_at          timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT registration_challenge_pkey PRIMARY KEY (id),
    CONSTRAINT registration_challenge_method CHECK (verification_method IN ('email', 'phone')),
    CONSTRAINT registration_challenge_phone CHECK (verification_method <> 'phone' OR nomor_telepon IS NOT NULL),
    CONSTRAINT registration_challenge_attempts CHECK (attempts BETWEEN 0 AND 5),
    CONSTRAINT registration_challenge_password_is_argon2id CHECK (password_hash LIKE '$argon2id$%')
);

CREATE INDEX IF NOT EXISTS registration_challenge_expires_idx
    ON uas_sad.registration_challenge (expires_at);

GRANT INSERT (id_pengguna, username, email, nomor_telepon, email_verified, phone_verified, password, created_by)
    ON uas_sad.pengguna TO grp_uas_sad_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON uas_sad.registration_challenge TO grp_uas_sad_rw;

COMMIT;
