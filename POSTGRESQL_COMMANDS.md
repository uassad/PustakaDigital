# Panduan perintah PostgreSQL

Panduan ini untuk database development yang dijalankan oleh Docker Compose.
Jalankan perintah dari folder proyek yang berisi `main.py`, dan nyalakan stack
terlebih dahulu sesuai [README2.md](README2.md).

## Masuk ke PostgreSQL

```shell
docker compose -f docker/docker-compose-dev.yml exec postgres psql -U postgres -d uas_sad_website_buku
```

Perintah di atas memakai nama database dan user default dari konfigurasi
README2. Jika nilainya diubah, gunakan `POSTGRES_USER` dan `POSTGRES_DB` dari
`.secrets/.postgres.env`.

Di prompt `psql`, perintah yang diawali `\` adalah perintah internal:

```text
\conninfo
\dn
\dt uas_sad.*
\d uas_sad.pengguna
```

Keluar dari `psql` dengan `\q`.

## Membaca data

Daftar role yang tersedia:

```sql
SELECT role_id, role_name
FROM uas_sad.role
ORDER BY role_name;
```

Daftar pengguna dan role-nya. Kolom `password` sengaja tidak ditampilkan:

```sql
SELECT p.id_pengguna,
       p.username,
       p.email,
       p.nomor_telepon,
       r.role_name,
       p.account_status,
       p.email_verified,
       p.phone_verified
FROM uas_sad.pengguna AS p
JOIN uas_sad.role AS r ON r.role_id = p.role_id
ORDER BY p.username;
```

Cari seorang pengguna:

```sql
SELECT p.id_pengguna, p.username, p.email, r.role_name
FROM uas_sad.pengguna AS p
JOIN uas_sad.role AS r ON r.role_id = p.role_id
WHERE lower(p.username) = lower('username');
```

Contoh data kategori dan buku:

```sql
SELECT id_kategori, kategori
FROM uas_sad.kategori_buku
ORDER BY kategori;

SELECT isbn, judul_buku, nama_penulis, nama_penerbit, tahun_terbit
FROM uas_sad.buku
ORDER BY judul_buku;
```

## Mengubah role pengguna

Role yang digunakan aplikasi adalah `Administrator` dan `Authenticated User`.
Daftarkan akun terlebih dahulu, lalu pastikan nama pengguna dan role tujuan
benar. Jalankan perubahan ini dengan koneksi database yang memiliki hak
administratif (misalnya user `postgres`). Jika aplikasi memakai role runtime
terbatas, role tersebut tidak diberi hak untuk mengubah `role_id`.

Mulai transaksi dan promosikan akun:

```sql
BEGIN;

UPDATE uas_sad.pengguna AS p
SET role_id = (
        SELECT role_id
        FROM uas_sad.role
        WHERE role_name = 'Administrator'
    ),
    updated_by = '00000000-0000-0000-0000-000000000000'
WHERE lower(p.username) = lower('username')
RETURNING p.id_pengguna, p.username, p.role_id;
```

Pastikan satu baris dikembalikan, lalu periksa role sebelum menyimpan:

```sql
SELECT p.username, r.role_name
FROM uas_sad.pengguna AS p
JOIN uas_sad.role AS r ON r.role_id = p.role_id
WHERE lower(p.username) = lower('username');
```

Jika hasilnya benar, simpan perubahan:

```sql
COMMIT;
```

Jika hasilnya salah atau tidak ada baris yang cocok, batalkan transaksi:

```sql
ROLLBACK;
```

Nilai `updated_by` di atas memakai UUID sistem yang digunakan schema untuk
operasi bootstrap. Untuk mengembalikan akun menjadi pembaca, jalankan pola
`UPDATE` yang sama dengan mengganti nama role menjadi
`Authenticated User`.

## Catatan keamanan

- Jangan menampilkan atau membagikan nilai kolom `password`; database
  menyimpan hash kredensial.
- Jangan menyalin UUID role dari contoh lama. Gunakan subquery berdasarkan
  `role_name` seperti di atas karena UUID role dibuat oleh database.
- Perubahan role memberi hak administrator pada akun tersebut. Verifikasi
  username dengan query `SELECT` sebelum menjalankan `UPDATE`.