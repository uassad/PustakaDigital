-- =====================================================================
-- 02_runtime_grants.sql  (OPSIONAL tapi DISARANKAN) — jalankan SETELAH table.sql, sebagai uas_sad_migrator.
--
-- Mengapa: table.sql memberi grp_uas_sad_rw hak INSERT/UPDATE di SEMUA kolom (table-level). Artinya, secara
-- DB, role runtime masih BISA menulis pengguna.role_id (privilege escalation bila ada bug di aplikasi).
-- Komentar di table.sql menyatakan role runtime "tidak boleh menulis role_id" — file ini yang
-- benar-benar menegakkannya, plus menjadikan tabel role read-only untuk aplikasi.
-- Kode aplikasi sudah kompatibel: INSERT/UPDATE hanya menyebut kolom yang diizinkan di bawah.
-- =====================================================================
SET search_path = uas_sad;
BEGIN;

-- role: hanya dibaca aplikasi (ditulis migrator saja)
REVOKE INSERT, UPDATE, DELETE ON uas_sad.role FROM grp_uas_sad_rw;

-- pengguna: ganti hak tabel penuh dengan hak per-kolom TANPA role_id
REVOKE INSERT, UPDATE ON uas_sad.pengguna FROM grp_uas_sad_rw;
GRANT  INSERT (id_pengguna, username, email, nomor_telepon, email_verified, phone_verified, password, created_by)
       ON uas_sad.pengguna TO grp_uas_sad_rw;
GRANT  UPDATE (username, email, nomor_telepon, password, updated_by)
       ON uas_sad.pengguna TO grp_uas_sad_rw;

GRANT SELECT, INSERT, UPDATE, DELETE ON uas_sad.registration_challenge TO grp_uas_sad_rw;

COMMIT;

-- Buat login role aplikasi (ganti password; simpan di .env, jangan di Git):
--   CREATE ROLE uas_sad_app LOGIN PASSWORD '<password-acak-panjang>' IN ROLE grp_uas_sad_rw;
--   GRANT CONNECT ON DATABASE uas_sad_website_buku TO uas_sad_app;
