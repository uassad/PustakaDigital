This is the functional, non-functional, and security requirement from this project.
This file will be explained in Bahasa (Indonesia)

Definition: 
C - Create
R - Read
U - Update
D - Delete

Role Name: Administrator
Nama Aktivitas: (CRUD) Daftar buku
Functional Requirement
Menambahkan buku baru yang wajib dengan tipe data .pdf untuk isi buku dan .jpg untuk cover buku
Mencari dan melihat daftar buku yang telah tersedia
Mengubah informasi atau menghapus buku yang telah terdaftar
Memblokir penambahan buku baru lainnya selain tipe data .pdf dan .jpg
Non-Functional Requirement
Proses penambahan buku baru mudah untuk dipahami
Security Requirement
Pencegahan cross-site scripting (XSS) dan cross site request forgery (CSRF)
Pencegahan percobaan peng-unggah-an berulang
Membatasi meng-unggah jenis file selain .pdf dan .jpg di sisi pengguna (frontend)
File handling validation tetap diterapkan secara ketat di sisi server (backend)
File .pdf harus diamankan (encode) sehingga tidak menjalankan script berbahaya
Akun admin dibekukan setelah 4x percobaan meng-unggah file selain .pdf dan .jpg ke dalam basis data
Nama Aktivitas: (R) Informasi profil
Functional Requirement
Dapat melihat informasi profil
Non-Functional Requirement
Enkripsi data in transit dan hash informasi sensitif seperti kata sandi pada data at rest
Otorisasi diterapkan secara ketat di sisi server (backend)


Security Requirement
Enkripsi data in transit dan hash informasi sensitif pada data at rest
Otorisasi diterapkan secara ketat di sisi server (backend)
Tidak dapat melakukan perubahan informasi profil
Jika akun terblokir, maka staf harus melaporkannya kepada tim human resource
Perhatian pada authorization dan accounting
Nama Aktivitas: (D) Logout
Functional Requirement
Sesi akun pengguna terlepas dari web browser
Non-Functional Requirement
Pelepasan sesi atau cookie sebelumnya tidak dapat dikembalikan (irreversible) atau digunakan kembali
Security Requirement
Cookie atau token terlepas dari web browser
Cookie atau token dari akun yang telah dilepaskan dan dihapus (deaktivasi) akibat proses logout tidak dapat digunakan kembali dalam tahap autentikasi kedepannya
Nama Aktivitas: (RD) Session/Token
Functional Requirement
Cookie hanya bisa dibaca oleh server 
Sesi dan token dapat terhapus dan terlepas sendiri setelah beberapa waktu
Non-Functional Requirement
Token atau cookie harus dikirimkan secara aman saat transit dan saat disimpan oleh web browser
Security Requirement
2FA untuk penambahan perangkat baru yang tidak dikenali
2FA untuk percobaan masuk dari lokasi geografis baru
Token dan cookie harus dienkripsi secara aman dengan metode terbaru yang efisien



Role Name: Authenticated User
Nama Aktivitas: (R) Tampilan bacaan buku
Functional Requirement
Mencari dan melihat buku-buku yang telah terdaftar
Non-Functional Requirement
Kemudahan dan kesesuaian pencarian (lexical search)
Security Requirement
Pencegahan injection
Anti (D)DoS
Debouncing atau melakukan pencarian setelah pengguna berhenti mengetik sepersekian sekon
Nama Aktivitas: (CRD) Simpan buku favorit
Functional Requirement
Menyimpan buku favorit yang sesuai
Melihat buku favorit
Menghapus buku dari daftar favorit
Non-Functional Requirement
Kesesuaian penyimpanan buku favorit
Security Requirement
Perlu login untuk melakukan aktivitas ini
Nama Aktivitas: (RU) Informasi profil
Functional Requirement
Dapat melihat informasi profil akun
Dapat melakukan perubahan informasi profil akun
Non-Functional Requirement
Enkripsi data in transit dan hash informasi sensitif seperti kata sandi pada data at rest
Otorisasi diterapkan secara ketat di sisi server (backend)
Security Requirement
Membutuhkan kata sandi untuk mengubah informasi profil
Nama Aktivitas: (U) Ubah kata sandi
Functional Requirement
Dapat melakukan proses lupa password
Non-Functional Requirement
Proses perubahan kata sandi tidak dapat dipermudah, tetap harus refer ke akun-akun yang terhubung





Security Requirement
Tautan perubahan kata sandi dikirimkan kepada akun yang terhubung (gmail atau nomor telepon [whatsapp])
Nama Aktivitas: (D) Hapus akun
Functional Requirement
Akun dan berbagai dependensinya terhapus dari basis data
Non-Functional Requirement
Penghapusan akun tidak dapat dikembalikan (irreversible)
Security Requirement
Double verification dan hambatan (friction) saat permintaan penghapusan akun
Nama Aktivitas: (D) Logout
Functional Requirement
Sesi akun pengguna terlepas dari web browser
Non-Functional Requirement
Pelepasan sesi atau cookie sebelumnya tidak dapat dikembalikan (irreversible) atau digunakan kembali
Security Requirement
Cookie atau token terlepas dari web browser
Cookie atau token dari akun yang telah dilepaskan dan dihapus (deaktivasi) akibat proses logout tidak dapat digunakan kembali dalam tahap autentikasi kedepannya
Nama Aktivitas: (RD) Session/Token
Functional Requirement
Cookie hanya bisa dibaca oleh server 
Sesi dan token dapat terhapus dan terlepas sendiri setelah beberapa waktu
Non-Functional Requirement
Keamanan sesi dengan penggunaan cookie, dan token terjamin
Security Requirement
Menggunakan atribut HTTPOnly untuk cookie
Menggunakan atribut Secure untuk memastikan cookie dikirim melalui koneksi HTTPS
Enkripsi cookie dan token at rest serta in transit



Role Name: Guest
Nama Aktivitas: (R) Tampilan bacaan buku
Functional Requirement
Mencari dan melihat buku-buku yang telah terdaftar
Non-Functional Requirement
Kemudahan dan kesesuaian pencarian (lexical search)
Security Requirement
Pencegahan injection
Anti (D)DoS
Debouncing atau melakukan pencarian setelah pengguna berhenti mengetik sepersekian sekon
Nama Aktivitas: (C) Login/register
Functional Requirement
Memvalidasi format email dan memeriksa keunikan email
Mencocokkan kata sandi dan konfirmasi kata sandi
Mengenkripsi kata sandi
Membuat sesi pengguna dan token otentikasi
Menampilkan pesan kesalahan yang aman
Non-Functional Requirement
Penggunaan simbol unik yang umum seperti @”%’! tetap bisa digunakan
Security Requirement
Menerapkan kebijakan sandi (password policy)
Error dan kode-nya harus dibuat seumum mungkin (“Nama pengguna atau kata sandi salah”)
Menerapkan batasan percobaan salah kredensial (anti brute force)
Perhatian pada authentication
Kata sandi di-hash dan menerapkan SALT in transit dan at rest
Menerapkan PEPPER ke dalam aplikasi (PEPPER di environment_variable server + (SALT di database + Password))
Pencegahan injection
Nama Aktivitas: (C) Session/Token
Functional Requirement
Sesi, token, atau cookie hanya dibuat dan dikirimkan apabila pengguna berhasil login
Sesi menggunakan token atau cookie yang acak dan tidak berulang berkali-kali
Non-Functional Requirement
Token atau cookie harus dikirimkan secara aman saat transit dan saat disimpan oleh web browser
Security Requirement
Menggunakan atribut HTTPOnly untuk cookie
Menggunakan atribut Secure untuk memastikan cookie dikirim melalui koneksi HTTPS
Enkripsi cookie dan token at rest serta in transit


Security Awareness
Password policy
Authorization check in server
Anti (D)DoS dan Rate Limitting
Tidak ada key/secret/lokasi internal yang diberikan ke pengguna
Parameterized Query, prepared statement, and Object Relational Mapping
Enkripsi terbaru yang efisien dan informasi harus dienkripsi (HTTPS)
Hash terbaru yang efisien (namun harus dicegah dengan rate limitting sehingga fungsi hash tidak menjadi titik lemah keamanan dan availibility)
URL Admin ditambahin 1 path ribet campuran, seperti /seAj2hB9sk/admin/
Menggunakan secure endpoint API (FastAPI) dengan autorisasi di server
Request perubahan tidak boleh menggunakan GET method, harus pakai POST method
Melakukan obfuskasi (obfuscation) pada kode program publik