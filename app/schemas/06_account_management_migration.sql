-- Run as uas_sad_migrator to enable reader profile updates and self-deletion.
BEGIN;

GRANT UPDATE (phone_verified) ON uas_sad.pengguna TO grp_uas_sad_rw;
GRANT DELETE ON uas_sad.pengguna TO grp_uas_sad_rw;

COMMIT;
