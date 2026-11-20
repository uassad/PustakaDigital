# Panduan perintah MongoDB

MongoDB di development Compose menyimpan log aktivitas aplikasi pada database
`pustaka_digital`, collection `activity_logs`. Jalankan perintah dari folder
proyek yang berisi `main.py`, dan pastikan stack berjalan sesuai
[README2.md](README2.md).

## Masuk ke MongoDB

Image proyek menggunakan MongoDB 4.4, sehingga shell yang tersedia bernama
`mongo`:

```shell
docker compose -f docker/docker-compose-dev.yml exec mongodb mongo pustaka_digital
```

Di shell MongoDB:

```javascript
show dbs
db
show collections
```

Keluar dengan `exit`.

## Membaca log aktivitas

Lihat satu dokumen terbaru:

```javascript
db.activity_logs.findOne({}, {
  _id: 0,
  timestamp: 1,
  category: 1,
  action: 1,
  status: 1,
  actor: 1,
  target: 1,
  path: 1,
  details: 1
})
```

Lihat 20 log terbaru:

```javascript
db.activity_logs.find({}, {
  _id: 0,
  timestamp: 1,
  category: 1,
  action: 1,
  status: 1,
  actor: 1,
  target: 1,
  path: 1,
  details: 1
}).sort({ timestamp: -1 }).limit(20).pretty()
```

Hitung jumlah dokumen:

```javascript
db.activity_logs.countDocuments({})
```

Hitung log berdasarkan kategori:

```javascript
db.activity_logs.aggregate([
  { $group: { _id: "$category", jumlah: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])
```

Kategori yang digunakan aplikasi meliputi `auth`, `admin_book`, `reader`, dan
`security`. Contoh filter untuk login yang berhasil:

```javascript
db.activity_logs.find(
  { category: "auth", action: "login_success" },
  { _id: 0, timestamp: 1, category: 1, action: 1, status: 1, actor: 1 }
).sort({ timestamp: -1 }).limit(20).pretty()
```

## Catatan

- Log ditulis oleh aplikasi secara asynchronous. Jika belum ada aktivitas,
  hasil query bisa kosong.
- Log dapat memuat username, alamat IP, dan informasi request. Jangan
  membagikan output tanpa memeriksa data tersebut.
- Collection ini adalah audit log aplikasi. Gunakan perintah baca di atas;
  jangan mengubah atau menghapus log secara manual.
- Data berada di Docker volume dan tetap ada setelah `docker compose down`.
  Jangan gunakan `docker compose down -v` kecuali memang ingin menghapus data.
