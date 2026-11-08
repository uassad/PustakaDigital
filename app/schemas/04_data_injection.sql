BEGIN;

-- 1. Pastikan kategori buku 'Politik' tersedia
INSERT INTO uas_sad.kategori_buku (kategori, created_by)
VALUES ('Politik', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (kategori) DO NOTHING;

-- 2. Insert data buku Asta Cita Prabowo-Gibran tanpa cover dan body
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
    NULL, -- book_cover dikosongkan
    '/books/asta_cita.pdf',
    '00000000-0000-0000-0000-000000000000'
FROM uas_sad.kategori_buku
WHERE kategori = 'Politik';

COMMIT;


BEGIN;
-- select * from uas_sad.role;
-- select * from uas_sad.pengguna p inner join uas_sad.role r on p.role_id = r.role_id;
UPDATE uas_sad.pengguna  SET role_id = '69c3f52b-6b21-4314-9e50-cd771c0074e2' WHERE username = 'administrator';
-- select * from uas_sad.buku
COMMIT;
