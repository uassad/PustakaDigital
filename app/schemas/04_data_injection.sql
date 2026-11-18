BEGIN;

-- 1. Pastikan kategori buku 'Politik' tersedia
INSERT INTO uas_sad.kategori_buku (kategori, created_by)
VALUES ('Politik', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (kategori) DO NOTHING;

-- 2. Insert data buku Asta Cita Prabowo-Gibran beserta cover dan body
INSERT INTO uas_sad.buku (
    isbn,
    id_kategori,
    judul_buku,
    nama_penulis,
    nama_penerbit,
    tahun_terbit,
    jumlah_halaman,
    sinopsis,
    book_cover,
    book_body,
    created_by
)
SELECT 
    '9786020300009',
    id_kategori,
    'Asta Cita: Visi dan Misi Indonesia Maju',
    'Tim Kampanye Nasional',
    'Media Center Prabowo-Gibran',
    '2024',
    175,
    'Visi, Misi, dan Program Aksi Prabowo-Gibran.',
    'books/cover/78b7ff5d9e6a447c8d957ac998d9fa64_091e7d3420a7e8f2bdd0f002eea53ce7.jpg',
    'books/body/6d02aa0818304eb58b0138d1af90ff56_c9a64f14d72796a6be6ca7f87fe9d098.pdf',
    '00000000-0000-0000-0000-000000000000'
FROM uas_sad.kategori_buku
WHERE kategori = 'Politik'
ON CONFLICT (isbn) DO UPDATE SET
    book_cover = EXCLUDED.book_cover,
    book_body = EXCLUDED.book_body;

COMMIT;


BEGIN;
-- select * from uas_sad.role;
-- select * from uas_sad.pengguna p inner join uas_sad.role r on p.role_id = r.role_id;
UPDATE uas_sad.pengguna  SET role_id = '69c3f52b-6b21-4314-9e50-cd771c0074e2' WHERE username = 'administrator';
-- select * from uas_sad.buku
COMMIT;
