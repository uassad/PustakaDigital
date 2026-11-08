-- =====================================================================
-- 04_schema.sql : PostgreSQL schema derived from the supplied ERD
-- WHO RUNS THIS : human / CI, connected AS uas_sad_migrator (so it owns every object).
-- HOW           : psql "host=<host> dbname=book_platform user=uas_sad_migrator sslmode=verify-full" -f 04_schema.sql
-- ORDER         : 01_bootstrap_roles.sql -> THIS FILE -> 02_uas_sadly_grants.sql
-- STATUS        : NOT EXECUTED by Claude (no PostgreSQL in sandbox). Review, then test
--                 on a throw-away database first. Requires PostgreSQL 13+ (gen_random_uuid()).
-- NOTE          : If Alembic is your source of truth, translate this into models/migrations;
--                 do not run both against the same database.
--
-- Legend:  [ERD]  = taken directly from the diagram
--          [ADD]  = security hardening I added (not in the ERD) - review each one
-- =====================================================================
-- ROLLBACK;
-- \set ON_ERROR_STOP on
CREATE SCHEMA IF NOT EXISTS uas_sad;
SET search_path = uas_sad;

-- =====================================================================
-- Role/Group Definition
-- =====================================================================
-- Uses 'DO' block to simulate  "IF NOT EXISTS" into ROLE
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'grp_uas_sad_ro') THEN
        CREATE ROLE grp_uas_sad_ro;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'grp_uas_sad_rw') THEN
        CREATE ROLE grp_uas_sad_rw;
    END IF;
END
$$;

BEGIN;

-- ---------------------------------------------------------------------
-- PostgreSQL group role
-- ---------------------------------------------------------------------
-- Read-Only
GRANT USAGE ON SCHEMA uas_sad TO grp_uas_sad_ro;

-- Read-only (SELECT) to this group
GRANT SELECT ON ALL TABLES IN SCHEMA uas_sad TO grp_uas_sad_ro;

-- Future automated permission
ALTER DEFAULT PRIVILEGES IN SCHEMA uas_sad 
GRANT SELECT ON TABLES TO grp_uas_sad_ro;

-- Read-Write
GRANT USAGE ON SCHEMA uas_sad TO grp_uas_sad_rw;

-- Read-Write (SELECT, INSERT, UPDATE, DELETE) to this group
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA uas_sad TO grp_uas_sad_rw;

-- Permission to modified sequential data
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA uas_sad TO grp_uas_sad_rw;

-- Future automated permission
ALTER DEFAULT PRIVILEGES IN SCHEMA uas_sad 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO grp_uas_sad_rw;

ALTER DEFAULT PRIVILEGES IN SCHEMA uas_sad 
GRANT USAGE, SELECT ON SEQUENCES TO grp_uas_sad_rw;

COMMIT;

BEGIN;
-- ---------------------------------------------------------------------
-- 1. ISBN13 domain [ERD: type "ISBN13"]
--    Stored WITHOUT hyphens (normalise in the uas_sad). Validates the 978/979
--    prefix and the check digit, so malformed values are rejected by the DB too.
-- ---------------------------------------------------------------------
CREATE FUNCTION uas_sad.isbn13_is_valid(v text) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
SET search_path = pg_catalog
AS $$
    SELECT CASE
        WHEN v ~ '^97[89][0-9]{10}$' THEN
            ( (10 - ( SELECT sum( substr(v, i, 1)::int
                                  * CASE WHEN i % 2 = 1 THEN 1 ELSE 3 END )
                      FROM generate_series(1, 12) AS i ) % 10) % 10 )
            = substr(v, 13, 1)::int
        ELSE false
    END
$$;

-- CHECK constraints call this function with the *caller's* privileges, so the
-- runtime groups need EXECUTE (01_bootstrap revoked it from PUBLIC by default).
GRANT EXECUTE ON FUNCTION uas_sad.isbn13_is_valid(text) TO grp_uas_sad_rw, grp_uas_sad_ro;

CREATE DOMAIN uas_sad.isbn13 AS varchar(13)
    CONSTRAINT isbn13_valid CHECK (uas_sad.isbn13_is_valid(VALUE));

-- ---------------------------------------------------------------------
-- 2. role [ERD]
-- ---------------------------------------------------------------------
CREATE TABLE uas_sad.role (
    role_id     uuid         NOT NULL DEFAULT gen_random_uuid(),
    role_name   varchar(50)  NOT NULL,
    created_at  timestamptz  NOT NULL DEFAULT now(),
    created_by  uuid         NOT NULL,
    updated_at  timestamptz,
    updated_by  uuid,
    CONSTRAINT role_pkey PRIMARY KEY (role_id),
    CONSTRAINT role_name_uq UNIQUE (role_name),                        -- [ADD]
    CONSTRAINT role_name_not_blank CHECK (btrim(role_name) <> '')      -- [ADD]
);
COMMENT ON TABLE uas_sad.role IS
  'Application roles (administrator, user). Guest is NOT a row: guests are unauthenticated. Write access: uas_sad_migrator only.';

-- Seed. created_by uses a documented SYSTEM uuid (no user exists yet). Names are
-- assumptions: change them to whatever your authorization.py expects.
INSERT INTO uas_sad.role (role_name, created_by) VALUES
    ('Administrator', '00000000-0000-0000-0000-000000000000'),
    ('Authenticated User',          '00000000-0000-0000-0000-000000000000');

-- Used as the DEFAULT of pengguna.role_id so that self-registration can NEVER
-- choose its own role (the runtime DB role is not allowed to write role_id).
CREATE FUNCTION uas_sad.default_user_role_id() RETURNS uuid
LANGUAGE sql STABLE
SET search_path = pg_catalog, uas_sad
AS $$ SELECT role_id FROM uas_sad.role WHERE role_name = 'Authenticated User' $$;
GRANT EXECUTE ON FUNCTION uas_sad.default_user_role_id() TO grp_uas_sad_rw;

-- ---------------------------------------------------------------------
-- 3. kategori_buku [ERD]
--    id_kategori: "serial" in the ERD -> IDENTITY (the modern, standard equivalent;
--    GENERATED ALWAYS stops clients from forcing arbitrary ids).  [ADD]
-- ---------------------------------------------------------------------
CREATE TABLE uas_sad.kategori_buku (
    id_kategori integer      GENERATED ALWAYS AS IDENTITY,
    kategori    varchar(50)  NOT NULL,
    created_at  timestamptz  NOT NULL DEFAULT now(),
    created_by  uuid         NOT NULL,
    updated_at  timestamptz,
    updated_by  uuid,
    CONSTRAINT kategori_buku_pkey PRIMARY KEY (id_kategori),
    CONSTRAINT kategori_buku_kategori_uq UNIQUE (kategori),                   -- [ADD]
    CONSTRAINT kategori_not_blank CHECK (btrim(kategori) <> '')               -- [ADD]
);

-- ---------------------------------------------------------------------
-- 4. pengguna [ERD]
--    "password" stores ONLY an Argon2id hash (hash includes its own unique salt;
--    the uas_sadlication-level pepper is uas_sadlied in Python and is never stored here).
--    The column name is kept as in the ERD; "password_hash" would be clearer.
-- ---------------------------------------------------------------------
CREATE TABLE uas_sad.pengguna (
    id_pengguna   uuid          NOT NULL DEFAULT gen_random_uuid(),
    role_id       uuid          NOT NULL DEFAULT uas_sad.default_user_role_id(),
    username      varchar(30)   NOT NULL,
    email         varchar(50)   NOT NULL,
    nomor_telepon varchar(15),
    email_verified boolean     NOT NULL DEFAULT false,
    phone_verified boolean     NOT NULL DEFAULT false,
    password      varchar(255)  NOT NULL,
    created_at    timestamptz   NOT NULL DEFAULT now(),
    created_by    uuid          NOT NULL,
    updated_at    timestamptz,
    updated_by    uuid,
    CONSTRAINT pengguna_pkey PRIMARY KEY (id_pengguna),
    CONSTRAINT pengguna_role_fkey FOREIGN KEY (role_id)
        REFERENCES uas_sad.role (role_id) ON DELETE RESTRICT,                     -- [ADD] explicit action
    CONSTRAINT pengguna_username_uq      UNIQUE (username),                   -- [ERD]
    CONSTRAINT pengguna_email_uq         UNIQUE (email),                      -- [ERD]
    CONSTRAINT pengguna_nomor_telepon_uq UNIQUE (nomor_telepon),              -- [ERD]
    -- [ADD] defence in depth; the uas_sadlication validation remains authoritative
    CONSTRAINT pengguna_username_format CHECK (username ~ '^[A-Za-z0-9_]{3,30}$'),
    CONSTRAINT pengguna_email_format    CHECK (email = btrim(email)
                                               AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
    CONSTRAINT pengguna_phone_format    CHECK (nomor_telepon IS NULL
                                               OR nomor_telepon ~ '^\+?[0-9]{8,14}$'),
    -- [ADD] refuses plaintext or any non-Argon2id value being stored by mistake
    CONSTRAINT pengguna_password_is_argon2id CHECK (password LIKE '$argon2id$%')
);
-- [ADD] case-insensitive uniqueness ("Alice@x.com" vs "alice@x.com")
CREATE UNIQUE INDEX pengguna_email_lower_uq    ON uas_sad.pengguna (lower(email));
CREATE UNIQUE INDEX pengguna_username_lower_uq ON uas_sad.pengguna (lower(username));
CREATE INDEX pengguna_role_id_idx ON uas_sad.pengguna (role_id);

COMMENT ON COLUMN uas_sad.pengguna.password IS
  'Argon2id hash only (salt embedded by library). Never plaintext, never reversible encryption. Pepper is NOT stored in the database.';

-- ---------------------------------------------------------------------
-- 4a. registration_challenge [ADD]
--    Pending registrations are persisted so OTP verification works across restarts.
--    otp_hash is HMAC-SHA256; the OTP itself is never stored in the database.
-- ---------------------------------------------------------------------
CREATE TABLE uas_sad.registration_challenge (
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
CREATE INDEX registration_challenge_expires_idx ON uas_sad.registration_challenge (expires_at);

-- ---------------------------------------------------------------------
-- 5. buku [ERD]
-- ---------------------------------------------------------------------
CREATE TABLE uas_sad.buku (
    isbn            uas_sad.isbn13    NOT NULL,
    id_kategori     integer       NOT NULL,        -- ERD shows "serial"; FK columns must be integer
    judul_buku      varchar(250)  NOT NULL,
    nama_penulis    varchar(60),
    nama_penerbit   varchar(60),
    tahun_terbit    varchar(60),
    jumlah_halaman  smallint      NOT NULL,
    sinopsis        varchar(60),
    book_cover      varchar(255),
    book_body       varchar(255),
    created_at      timestamptz   NOT NULL DEFAULT now(),
    created_by      uuid          NOT NULL,
    updated_at      timestamptz,
    updated_by      uuid,
    CONSTRAINT buku_pkey PRIMARY KEY (isbn),
    CONSTRAINT buku_kategori_fkey FOREIGN KEY (id_kategori)
        REFERENCES uas_sad.kategori_buku (id_kategori) ON DELETE RESTRICT,       -- [ADD]
    CONSTRAINT buku_judul_not_blank CHECK (btrim(judul_buku) <> ''),         -- [ADD]
    CONSTRAINT buku_halaman_range   CHECK (jumlah_halaman BETWEEN 1 AND 10000), -- [ADD]
    CONSTRAINT buku_tahun_format    CHECK (tahun_terbit IS NULL
                                           OR tahun_terbit ~ '^[0-9]{4}$')   -- [ADD] see note
);
CREATE INDEX buku_id_kategori_idx ON uas_sad.buku (id_kategori);
-- Lexical search helpers (plain btree; prefix search). Add pg_trgm only after review.
CREATE INDEX buku_judul_lower_idx   ON uas_sad.buku (lower(judul_buku)   text_pattern_ops);
CREATE INDEX buku_penulis_lower_idx ON uas_sad.buku (lower(nama_penulis) text_pattern_ops);

-- ---------------------------------------------------------------------
-- 6. favorit [ERD]  (composite PK: a user can favourite a book only once)
-- ---------------------------------------------------------------------
CREATE TABLE uas_sad.favorit (
    isbn         uas_sad.isbn13   NOT NULL,
    id_pengguna  uuid         NOT NULL,
    created_at   timestamptz  NOT NULL DEFAULT now(),
    created_by   uuid         NOT NULL,
    updated_at   timestamptz,
    updated_by   uuid,
    CONSTRAINT favorit_pkey PRIMARY KEY (isbn, id_pengguna),
    -- [ADD] CASCADE = deleting a user / book also removes dependent favourites,
    --       which makes account deletion consistent inside one transaction.
    CONSTRAINT favorit_buku_fkey FOREIGN KEY (isbn)
        REFERENCES uas_sad.buku (isbn) ON DELETE CASCADE,
    CONSTRAINT favorit_pengguna_fkey FOREIGN KEY (id_pengguna)
        REFERENCES uas_sad.pengguna (id_pengguna) ON DELETE CASCADE
);
CREATE INDEX favorit_id_pengguna_idx ON uas_sad.favorit (id_pengguna);

-- ---------------------------------------------------------------------
-- 7. [ADD] Audit-column integrity trigger
--    created_at / created_by can never be changed after INSERT;
--    updated_at is set by the database (cannot be forged by the client).
--    updated_by must still be supplied by the uas_sadlication.
-- ---------------------------------------------------------------------
CREATE FUNCTION uas_sad.tg_audit_columns() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
    IF NEW.created_at IS DISTINCT FROM OLD.created_at
       OR NEW.created_by IS DISTINCT FROM OLD.created_by THEN
        RAISE EXCEPTION 'created_at and created_by are immutable'
            USING ERRCODE = '42501';
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END
$$;

CREATE TRIGGER trg_role_audit           BEFORE UPDATE ON uas_sad.role           FOR EACH ROW EXECUTE FUNCTION uas_sad.tg_audit_columns();
CREATE TRIGGER trg_kategori_buku_audit  BEFORE UPDATE ON uas_sad.kategori_buku  FOR EACH ROW EXECUTE FUNCTION uas_sad.tg_audit_columns();
CREATE TRIGGER trg_pengguna_audit       BEFORE UPDATE ON uas_sad.pengguna       FOR EACH ROW EXECUTE FUNCTION uas_sad.tg_audit_columns();
CREATE TRIGGER trg_buku_audit           BEFORE UPDATE ON uas_sad.buku           FOR EACH ROW EXECUTE FUNCTION uas_sad.tg_audit_columns();
CREATE TRIGGER trg_favorit_audit        BEFORE UPDATE ON uas_sad.favorit        FOR EACH ROW EXECUTE FUNCTION uas_sad.tg_audit_columns();

COMMIT;

-- =====================================================================
-- HUMAN-ONLY: creating the first administrator
-- The uas_sadlication role cannot write role_id, so promote/create admins as uas_sad_migrator.
-- 1) Generate an Argon2id hash with YOUR uas_sadlication's hashing code (with the pepper),
--    never in SQL, and never paste a real hash/password into chat or Git.
-- 2) Then run (placeholders only):
--
--   INSERT INTO uas_sad.pengguna (role_id, username, email, password, created_by)
--   SELECT role_id, '<admin_username>', '<admin_email>', '<argon2id_hash>',
--          '00000000-0000-0000-0000-000000000000'
--   FROM uas_sad.role WHERE role_name = 'administrator';
-- =====================================================================