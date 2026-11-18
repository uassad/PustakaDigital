-- PostgreSQL Automated Schema Initialization
\echo '===> Initializing base tables and roles...'
\i /app_schemas/01_table.sql

\echo '===> Applying runtime grants...'
\i /app_schemas/02_runtime_grants.sql

\echo '===> Applying registration challenge and OTP migration...'
\i /app_schemas/03_registration_otp_migration.sql

\echo '===> Applying admin upload daily migration...'
\i /app_schemas/05_admin_upload_daily_migration.sql

\echo '===> Applying account management migration...'
\i /app_schemas/06_account_management_migration.sql

\echo '===> Seeding initial data...'
\i /app_schemas/04_data_injection.sql

-- Ensure the container postgres superuser has permissions on uas_sad schema
GRANT grp_uas_sad_rw TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA uas_sad TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA uas_sad TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA uas_sad TO postgres;
