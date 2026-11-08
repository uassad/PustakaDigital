// admin.js — Halaman Dashboard Administrator Pustaka Digital
//
// KEAMANAN:
// - TIDAK ADA innerHTML, insertAdjacentHTML, atau document.write dengan data pengguna/server.
// - Semua teks dari server dimasukkan via textContent / el() dari dom.js (otomatis di-escape).
// - Validasi klien memberi peringatan, sedangkan backend memvalidasi, menghitung, dan membekukan akun.
// - Hanya path /api/ yang dipanggil via api() dari api.js.

import { api, ApiError, session } from "../api.js";
import { el, clear, show, toast, debounce } from "../dom.js";
import { logout } from "../auth.js";

// ─── State ────────────────────────────────────────────────────────────────────
let currentPage = 1;
let totalPages = 1;
let currentSearch = "";
let currentUploadIsbn = "";
let isFrozen = false;
let editingBookIsbn = "";
let pendingNewBookUpload = false;

// ─── Referensi Elemen DOM ─────────────────────────────────────────────────────
const logoutBtn          = document.getElementById("logout-btn");
const profileBtn         = document.getElementById("profile-btn");
const adminMenu          = document.getElementById("admin-menu");
const menuBookList       = document.getElementById("menu-book-list");
const frozenBanner       = document.getElementById("frozen-banner");
const statTotal          = document.getElementById("stat-total");
const statWithPdf        = document.getElementById("stat-with-pdf");
const adminSearch        = document.getElementById("admin-search");
const btnAddBook         = document.getElementById("btn-add-book");
const adminTbody         = document.getElementById("admin-tbody");
const tableState         = document.getElementById("table-state");
const pagination         = document.getElementById("pagination");
const prevPageBtn        = document.getElementById("prev-page-btn");
const nextPageBtn        = document.getElementById("next-page-btn");
const pageInfo           = document.getElementById("page-info");

// Modal Tambah Buku
const modalAddBook       = document.getElementById("modal-add-book");
const closeAddModal      = document.getElementById("close-add-modal");
const cancelAddModal     = document.getElementById("cancel-add-modal");
const formAddBook        = document.getElementById("form-add-book");
const addIsbn            = document.getElementById("add-isbn");
const addJudul           = document.getElementById("add-judul");
const addKategori        = document.getElementById("add-kategori");
const addPenulis         = document.getElementById("add-penulis");
const addPenerbit        = document.getElementById("add-penerbit");
const addTahun           = document.getElementById("add-tahun");
const addHalaman         = document.getElementById("add-halaman");
const addSinopsis        = document.getElementById("add-sinopsis");
const addBookFiles       = document.getElementById("add-book-files");
const addCover           = document.getElementById("add-cover");
const addPdf             = document.getElementById("add-pdf");
const addCoverFileName   = document.getElementById("add-cover-file-name");
const addPdfFileName     = document.getElementById("add-pdf-file-name");
const addCoverDropZone   = document.getElementById("add-cover-drop-zone");
const addPdfDropZone     = document.getElementById("add-pdf-drop-zone");
const addBookError       = document.getElementById("add-book-error");
const submitAddBook      = document.getElementById("submit-add-book");

// Modal Unggah File
const modalUpload        = document.getElementById("modal-upload");
const modalProfile       = document.getElementById("modal-profile");
const closeUploadModal   = document.getElementById("close-upload-modal");
const cancelUploadModal  = document.getElementById("cancel-upload-modal");
const formUpload         = document.getElementById("form-upload");
const uploadIsbnField    = document.getElementById("upload-isbn");
const uploadCover        = document.getElementById("upload-cover");
const uploadPdf          = document.getElementById("upload-pdf");
const coverFileName      = document.getElementById("cover-file-name");
const pdfFileName        = document.getElementById("pdf-file-name");
const coverDropZone      = document.getElementById("cover-drop-zone");
const pdfDropZone        = document.getElementById("pdf-drop-zone");
const uploadError        = document.getElementById("upload-error");
const uploadAnnouncement = document.getElementById("upload-announcement");
const submitUpload       = document.getElementById("submit-upload");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tampilkan/sembunyikan frozen banner dan nonaktifkan tombol jika akun beku. */
function applyFrozenState(frozen) {
  isFrozen = frozen;
  submitAddBook.disabled = frozen;
  submitUpload.disabled = frozen;
  document.querySelectorAll(".action-btns button").forEach((button) => {
    button.disabled = frozen;
  });
  if (frozen) {
    frozenBanner.hidden = false;
    frozenBanner.classList.add("visible");
    // Nonaktifkan semua tombol aksi utama
    if (btnAddBook) btnAddBook.disabled = true;
  } else {
    frozenBanner.hidden = true;
    frozenBanner.classList.remove("visible");
    if (btnAddBook) btnAddBook.disabled = false;
  }
}

/** Tampilkan pesan peringatan di kotak pengumuman modal unggah (via textContent). */
function showAnnouncement(message, isDanger = false) {
  uploadAnnouncement.textContent = message;
  uploadAnnouncement.classList.toggle("danger", isDanger);
  uploadAnnouncement.classList.add("visible");
}

function hideAnnouncement() {
  uploadAnnouncement.textContent = "";
  uploadAnnouncement.classList.remove("visible", "danger");
}

/** Peringatkan format salah; tetap kirim agar backend mencatat percobaan secara otoritatif. */
function warnInvalidFileType(file, allowedExts, fieldName, target = uploadAnnouncement) {
  if (!file) return;
  const ext = file.name.split(".").pop().toLowerCase();
  if (!allowedExts.includes(ext)) {
    const message = `Peringatan: File "${file.name}" tidak valid untuk field ${fieldName}. Hanya format ${allowedExts.map((e) => "." + e).join(", ")} yang diizinkan. Backend akan menolak file ini dan menghitungnya dalam batas 4 percobaan per hari.`;
    if (target === uploadAnnouncement) showAnnouncement(message, true);
    else showModalError(target, message);
  }
}

/** Set loading state pada tombol submit. */
function setSubmitLoading(btn, loading, label, loadingLabel = "Memproses…") {
  btn.disabled = loading || isFrozen;
  btn.textContent = loading ? loadingLabel : label;
}

/** Tampilkan pesan error di dalam modal. */
function showModalError(el, message) {
  el.textContent = message;
  el.hidden = false;
}

function hideModalError(el) {
  el.textContent = "";
  el.hidden = true;
}

// ─── Modal Utilities ──────────────────────────────────────────────────────────

function openModal(modal) {
  modal.classList.add("open");
  // Fokus ke elemen pertama yang bisa difokus di dalam modal
  const focusable = modal.querySelector("button, [href], input, select, textarea");
  if (focusable) focusable.focus();
}

function closeModal(modal) {
  modal.classList.remove("open");
}

// Tutup modal saat klik backdrop (luar modal-box)
function handleBackdropClick(e) {
  if (e.target === e.currentTarget) closeModal(e.currentTarget);
}

// Tutup modal saat tekan Escape
function handleKeydown(e) {
  if (e.key === "Escape") {
    if (modalAddBook.classList.contains("open")) closeAddBookModal();
    if (modalUpload.classList.contains("open")) closeModal(modalUpload);
    if (modalProfile.classList.contains("open")) closeModal(modalProfile);
  }
}

// ─── Statistik ────────────────────────────────────────────────────────────────

function updateStats(data) {
  const total = data.total ?? 0;
  const withPdf = data.items ? data.items.filter((b) => b.has_pdf).length : 0;
  // Kalkulasikan dari data paginasi yang ada; untuk statistik akurat panggil endpoint terpisah bila tersedia
  statTotal.textContent = String(total);
  statWithPdf.textContent = String(withPdf);
}

/** Muat statistik dari endpoint admin jika tersedia, fallback ke data buku. */
async function loadStats() {
  try {
    const stats = await api("/api/admin/stats");
    statTotal.textContent = String(stats.total_books ?? 0);
    statWithPdf.textContent = String(stats.books_with_pdf ?? 0);
  } catch {
    toast("Statistik buku tidak dapat dimuat.", true);
  }
}

// ─── Render Tabel ─────────────────────────────────────────────────────────────

/** Buat elemen status pill. */
function statusPill(has, labelYes, labelNo) {
  const pill = el("span", { class: has ? "status-pill ok" : "status-pill none" });
  pill.textContent = has ? labelYes : labelNo;
  return pill;
}

/** Render satu baris tabel buku. */
function renderBookRow(book, index) {
  // Thumbnail / placeholder
  let coverCell;
  if (book.has_cover && book.book_cover) {
    const img = el("img", {
      class: "admin-cover-thumb",
      src: `/api/books/${encodeURIComponent(book.isbn)}/cover`,
      alt: `Sampul ${book.judul_buku}`,
      loading: "lazy",
    });
    coverCell = el("td", {}, img);
  } else {
    const placeholder = el("div", { class: "admin-cover-placeholder" });
    placeholder.textContent = "📖";
    coverCell = el("td", {}, placeholder);
  }

  // Tombol Unggah File
  const uploadBtn = el("a", {
    class: "btn btn-sm",
    href: "#admin-books",
    "data-isbn": book.isbn,
  });
  uploadBtn.textContent = "Unggah File";
  if (isFrozen) uploadBtn.setAttribute("aria-disabled", "true");
  uploadBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (!isFrozen) openUploadModal(book.isbn);
  });

  const editBtn = el("button", { class: "btn btn-sm", type: "button" });
  editBtn.textContent = "Ubah";
  editBtn.disabled = isFrozen;
  editBtn.addEventListener("click", () => openEditBookModal(book));

  // Tombol Hapus
  const deleteBtn = el("button", {
    class: "btn btn-sm",
    type: "button",
    "data-isbn": book.isbn,
  });
  deleteBtn.textContent = "Hapus";
  deleteBtn.disabled = isFrozen;
  deleteBtn.addEventListener("click", () => handleDeleteBook(book.isbn, book.judul_buku));

  const actionBtns = el("div", { class: "action-btns" }, uploadBtn, editBtn, deleteBtn);

  // Kolom judul dengan info penulis
  const judulCell = el("td");
  const judulStrong = el("strong");
  judulStrong.textContent = book.judul_buku;
  const penulisSmall = el("small", { class: "muted" });
  penulisSmall.textContent = book.nama_penulis || "—";
  judulCell.append(judulStrong, el("br"), penulisSmall);

  // ISBN cell
  const isbnCell = el("td");
  const isbnCode = el("code");
  isbnCode.textContent = book.isbn;
  isbnCell.append(isbnCode);

  const tr = el("tr", { "data-isbn": book.isbn });
  const noCell = el("td");
  noCell.textContent = String(index);

  const katCell = el("td");
  katCell.textContent = book.kategori_nama || "—";

  const halCell = el("td");
  halCell.textContent = book.jumlah_halaman ? String(book.jumlah_halaman) : "—";

  const pdfCell = el("td", {}, statusPill(book.has_pdf, "✓ Ada", "Belum ada"));
  const coverStatusCell = el("td", {}, statusPill(book.has_cover, "✓ Ada", "Belum ada"));
  const actionCell = el("td", {}, actionBtns);

  tr.append(noCell, coverCell, judulCell, isbnCell, katCell, halCell, pdfCell, coverStatusCell, actionCell);
  return tr;
}

/** Tampilkan baris skeleton loading. */
function renderSkeletonRows(count = 5) {
  for (let i = 0; i < count; i++) {
    const tr = el("tr");
    for (let j = 0; j < 9; j++) {
      const td = el("td");
      const skel = el("div", { class: "skeleton skeleton-line" });
      td.append(skel);
      tr.append(td);
    }
    adminTbody.append(tr);
  }
}

// ─── Muat Daftar Buku ─────────────────────────────────────────────────────────

async function loadBooks() {
  clear(adminTbody);
  renderSkeletonRows();
  tableState.textContent = "";
  show(pagination, false);

  try {
    const params = new URLSearchParams({
      page: String(currentPage),
      page_size: "15",
    });
    if (currentSearch.trim()) params.set("q", currentSearch.trim());

    const data = await api(`/api/admin/books?${params.toString()}`);

    clear(adminTbody);

    totalPages = data.total_pages || 1;
    const offset = (currentPage - 1) * 15;

    // Update stats dari data yang ada
    statTotal.textContent = String(data.total ?? 0);
    const withPdf = (data.items || []).filter((b) => b.has_pdf).length;
    // Hanya update jika endpoint stats gagal (sederhana: selalu update)
    // Stat per-halaman, endpoint terpisah lebih akurat
    if (statWithPdf.textContent === "—") {
      statWithPdf.textContent = String(withPdf);
    }

    if (!data.items || data.items.length === 0) {
      tableState.textContent = "Tidak ada buku yang cocok dengan pencarian Anda.";
      show(pagination, false);
      return;
    }

    data.items.forEach((book, i) => {
      adminTbody.append(renderBookRow(book, offset + i + 1));
    });

    // Paginasi
    if (totalPages > 1) {
      show(pagination, true);
      pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
      prevPageBtn.disabled = currentPage <= 1;
      nextPageBtn.disabled = currentPage >= totalPages;
    } else {
      show(pagination, false);
    }
  } catch (err) {
    clear(adminTbody);
    const msg = err instanceof ApiError ? err.message : "Terjadi kesalahan saat memuat data buku.";
    tableState.textContent = `Gagal memuat buku: ${msg}`;
    if (err instanceof ApiError && err.status === 403 && /dibekukan/i.test(err.message)) {
      applyFrozenState(true);
    }
    toast("Gagal memuat daftar buku.", true);
  }
}

// ─── Muat Kategori untuk Dropdown ─────────────────────────────────────────────

async function loadCategories() {
  try {
    const categories = await api("/api/books/categories", { auth: false });
    // Hapus semua opsi kecuali yang pertama (placeholder)
    while (addKategori.options.length > 1) addKategori.remove(1);

    for (const cat of categories) {
      const opt = el("option", { value: String(cat.id_kategori) });
      opt.textContent = cat.kategori;
      addKategori.append(opt);
    }
  } catch {
    toast("Kategori buku tidak dapat dimuat.", true);
  }
}

// ─── Modal Tambah Buku ────────────────────────────────────────────────────────

async function openAddBookModal() {
  if (isFrozen) {
    toast("Akun Anda dibekukan. Tidak dapat menambah buku.", true);
    return;
  }
  editingBookIsbn = "";
  addIsbn.disabled = false;
  document.getElementById("modal-add-title").textContent = "Tambah Buku Baru";
  submitAddBook.textContent = "Simpan Buku";
  formAddBook.reset();
  addBookFiles.hidden = false;
  addCoverFileName.textContent = "Klik untuk memilih sampul (.jpg)";
  addPdfFileName.textContent = "Klik untuk memilih isi buku (.pdf)";
  hideModalError(addBookError);
  await loadCategories();
  openModal(modalAddBook);
}

function closeAddBookModal() {
  closeModal(modalAddBook);
  formAddBook.reset();
  editingBookIsbn = "";
  pendingNewBookUpload = false;
  addIsbn.disabled = false;
  addBookFiles.hidden = false;
  addCoverFileName.textContent = "Klik untuk memilih sampul (.jpg)";
  addPdfFileName.textContent = "Klik untuk memilih isi buku (.pdf)";
  document.getElementById("modal-add-title").textContent = "Tambah Buku Baru";
  submitAddBook.textContent = "Simpan Buku";
  hideModalError(addBookError);
}

async function openEditBookModal(book) {
  if (isFrozen) return;
  editingBookIsbn = book.isbn;
  formAddBook.reset();
  addIsbn.value = book.isbn;
  addIsbn.disabled = true;
  addJudul.value = book.judul_buku || "";
  addPenulis.value = book.nama_penulis || "";
  addPenerbit.value = book.nama_penerbit || "";
  addTahun.value = book.tahun_terbit || "";
  addHalaman.value = String(book.jumlah_halaman || "");
  addSinopsis.value = book.sinopsis || "";
  addBookFiles.hidden = true;
  document.getElementById("modal-add-title").textContent = "Ubah Informasi Buku";
  submitAddBook.textContent = "Simpan Perubahan";
  hideModalError(addBookError);
  await loadCategories();
  addKategori.value = String(book.id_kategori);
  openModal(modalAddBook);
}

async function handleAddBookSubmit(e) {
  e.preventDefault();
  hideModalError(addBookError);

  const isbn = addIsbn.value.trim();
  const judul = addJudul.value.trim();
  const idKategori = addKategori.value;
  const penulis = addPenulis.value.trim();
  const penerbit = addPenerbit.value.trim();
  const tahun = addTahun.value.trim();
  const halaman = addHalaman.value.trim();
  const sinopsis = addSinopsis.value.trim();
  const coverFile = addCover.files[0] || null;
  const pdfFile = addPdf.files[0] || null;

  if (!isbn || !judul || !idKategori || !penulis || !penerbit || !tahun || !halaman) {
    showModalError(addBookError, "Semua kolom wajib diisi kecuali sinopsis.");
    return;
  }

  const payload = {
    judul_buku: judul,
    id_kategori: parseInt(idKategori, 10),
    nama_penulis: penulis,
    nama_penerbit: penerbit,
    tahun_terbit: parseInt(tahun, 10),
    jumlah_halaman: parseInt(halaman, 10),
  };
  payload.sinopsis = sinopsis;
  const isEditing = Boolean(editingBookIsbn);
  let createdBook = false;

  setSubmitLoading(
    submitAddBook,
    true,
    pendingNewBookUpload ? "Unggah File" : isEditing ? "Simpan Perubahan" : "Simpan Buku",
    "Menyimpan…",
  );

  try {
    if (editingBookIsbn) {
      await api(`/api/admin/books/${encodeURIComponent(editingBookIsbn)}/update`, {
        method: "POST",
        json: payload,
      });
    } else {
      await api("/api/admin/books", {
        method: "POST",
        json: { ...payload, isbn },
      });
      createdBook = true;
      editingBookIsbn = isbn;
      addIsbn.disabled = true;
    }

    if (coverFile || pdfFile) {
      setSubmitLoading(submitAddBook, true, "Unggah File", "Mengunggah…");
      try {
        await uploadBookFiles(editingBookIsbn, coverFile, pdfFile, addBookError);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Terjadi kesalahan saat mengunggah file.";
        if (err instanceof ApiError && err.status === 403) applyFrozenState(true);
        if (createdBook) {
          pendingNewBookUpload = true;
          addBookFiles.hidden = false;
          document.getElementById("modal-add-title").textContent = "Buku Ditambahkan — Unggah File";
        }
        showModalError(
          addBookError,
          `${createdBook ? "Buku berhasil ditambahkan, tetapi file gagal diunggah." : "Informasi buku tersimpan, tetapi file gagal diunggah."} ${message} Perbaiki pilihan file, lalu coba lagi.`,
        );
        toast(message, true);
        currentPage = 1;
        await loadBooks();
        await loadStats();
        return;
      }
    }

    const wasPendingNewBookUpload = pendingNewBookUpload;
    closeAddBookModal();
    toast(coverFile || pdfFile
      ? "Buku dan file berhasil disimpan."
      : wasPendingNewBookUpload
        ? "Buku tersimpan. File belum diunggah; gunakan tombol Unggah File pada daftar buku."
        : isEditing ? "Informasi buku berhasil diubah." : "Buku berhasil ditambahkan.");
    currentPage = 1;
    await loadBooks();
    await loadStats();
  } catch (err) {
    const msg = err instanceof ApiError ? err.message : "Gagal menyimpan buku.";
    showModalError(addBookError, msg);
    toast(msg, true);
  } finally {
    setSubmitLoading(
      submitAddBook,
      false,
      pendingNewBookUpload ? "Unggah File" : editingBookIsbn ? "Simpan Perubahan" : "Simpan Buku",
    );
  }
}

// ─── Modal Unggah File ────────────────────────────────────────────────────────

async function uploadBookFiles(isbn, coverFile, pdfFile, warningTarget = uploadAnnouncement) {
  warnInvalidFileType(coverFile, ["jpg"], "Sampul Buku", warningTarget);
  warnInvalidFileType(pdfFile, ["pdf"], "Isi Buku (PDF)", warningTarget);

  const formData = new FormData();
  if (coverFile) formData.append("cover", coverFile);
  if (pdfFile) formData.append("body", pdfFile);
  await api(`/api/books/${encodeURIComponent(isbn)}/upload-files`, {
    method: "POST",
    form: formData,
  });
}

function openUploadModal(isbn) {
  if (isFrozen) return;
  currentUploadIsbn = isbn;
  uploadIsbnField.value = isbn;
  formUpload.reset();
  coverFileName.textContent = "Klik untuk memilih file sampul (.jpg)";
  pdfFileName.textContent = "Klik untuk memilih file PDF (.pdf)";
  hideAnnouncement();
  hideModalError(uploadError);
  openModal(modalUpload);
}

function closeUploadModalFn() {
  closeModal(modalUpload);
  formUpload.reset();
  hideAnnouncement();
  hideModalError(uploadError);
  currentUploadIsbn = "";
}

async function handleUploadSubmit(e) {
  e.preventDefault();
  hideAnnouncement();
  hideModalError(uploadError);

  const coverFile = uploadCover.files[0] || null;
  const pdfFile   = uploadPdf.files[0] || null;

  if (!coverFile && !pdfFile) {
    showModalError(uploadError, "Pilih minimal satu file untuk diunggah (Sampul atau PDF).");
    return;
  }

  setSubmitLoading(submitUpload, true, "Unggah File", "Mengunggah…");

  try {
    const isbn = currentUploadIsbn || uploadIsbnField.value;
    await uploadBookFiles(isbn, coverFile, pdfFile);

    closeUploadModalFn();
    toast("File berhasil diunggah.");
    await loadBooks();
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403) {
        // Akun dibekukan oleh backend
        applyFrozenState(true);
        showAnnouncement(
          "🔒 Akun Anda telah dibekukan karena percobaan mengunggah file dengan format yang tidak diizinkan berulang kali. Semua fitur unggah telah dinonaktifkan.",
          true
        );
        toast("Akun Anda dibekukan. Hubungi administrator.", true);
      } else {
        const msg = err.message || "Gagal mengunggah file.";
        if (err.status === 400) showAnnouncement(msg, true);
        else showModalError(uploadError, msg);
        toast(msg, true);
      }
    } else {
      showModalError(uploadError, "Terjadi kesalahan saat mengunggah file.");
      toast("Gagal mengunggah file.", true);
    }
  } finally {
    setSubmitLoading(submitUpload, false, "Unggah File");
  }
}

// ─── Hapus Buku ───────────────────────────────────────────────────────────────

async function handleDeleteBook(isbn, judul) {
  // Konfirmasi dalam Bahasa Indonesia
  const confirmed = window.confirm(
    `Apakah Anda yakin ingin menghapus buku "${judul}" (ISBN: ${isbn})?\n\nTindakan ini tidak dapat dibatalkan.`
  );
  if (!confirmed) return;

  try {
    await api(`/api/admin/books/${encodeURIComponent(isbn)}`, { method: "DELETE" });

    // Hapus baris dari tabel
    const row = adminTbody.querySelector(`tr[data-isbn="${CSS.escape(isbn)}"]`);
    if (row) row.remove();

    toast(`Buku "${judul}" berhasil dihapus.`);
    await loadStats();

    // Reload jika tabel kosong setelah penghapusan
    if (adminTbody.children.length === 0) {
      if (currentPage > 1) currentPage--;
      await loadBooks();
    }
  } catch (err) {
    const msg = err instanceof ApiError ? err.message : "Gagal menghapus buku.";
    toast(msg, true);
  }
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────

async function guardAdmin() {
  if (!session.token) {
    location.assign(`/login?next=${encodeURIComponent(location.pathname)}`);
    return new Promise(() => {});
  }

  let user;
  try {
    user = await api("/api/auth/me", { redirectOn401: false });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      location.assign(`/login?expired=1&next=${encodeURIComponent(location.pathname)}`);
      return new Promise(() => {});
    }
    throw err;
  }

  if (!user || user.role?.toLowerCase() !== "administrator") {
    location.assign("/");
    return new Promise(() => {});
  }

  return user;
}

// ─── Inisialisasi ─────────────────────────────────────────────────────────────

async function init() {
  // 1. Pastikan pengguna adalah Administrator
  const user = await guardAdmin();

  // 2. Periksa status akun
  if (user.account_status === "beku") {
    applyFrozenState(true);
  }
  document.getElementById("profile-username").textContent = user.username;
  document.getElementById("profile-email").textContent = user.email;
  document.getElementById("profile-phone").textContent = user.nomor_telepon || "Belum ditambahkan";
  document.getElementById("profile-status").textContent =
    user.account_status === "beku" ? "Dibekukan" : "Normal";

  // 3. Event listener tombol Logout
  logoutBtn.addEventListener("click", logout);
  menuBookList.addEventListener("click", () => { adminMenu.open = false; });
  profileBtn.addEventListener("click", () => {
    adminMenu.open = false;
    openModal(modalProfile);
  });
  document.getElementById("close-profile-modal").addEventListener("click", () => closeModal(modalProfile));
  document.getElementById("close-profile-button").addEventListener("click", () => closeModal(modalProfile));
  modalProfile.addEventListener("click", handleBackdropClick);

  // 4. Tombol Tambah Buku
  btnAddBook.addEventListener("click", openAddBookModal);
  addCoverDropZone.addEventListener("click", () => addCover.click());
  addPdfDropZone.addEventListener("click", () => addPdf.click());
  addCover.addEventListener("change", () => {
    const file = addCover.files[0];
    addCoverFileName.textContent = file ? file.name : "Klik untuk memilih sampul (.jpg)";
    hideModalError(addBookError);
  });
  addPdf.addEventListener("change", () => {
    const file = addPdf.files[0];
    addPdfFileName.textContent = file ? file.name : "Klik untuk memilih isi buku (.pdf)";
    hideModalError(addBookError);
  });

  // 5. Modal Tambah Buku
  closeAddModal.addEventListener("click", closeAddBookModal);
  cancelAddModal.addEventListener("click", closeAddBookModal);
  modalAddBook.addEventListener("click", (event) => {
    if (event.target === modalAddBook) closeAddBookModal();
  });
  formAddBook.addEventListener("submit", handleAddBookSubmit);

  // 6. Modal Unggah File
  closeUploadModal.addEventListener("click", closeUploadModalFn);
  cancelUploadModal.addEventListener("click", closeUploadModalFn);
  modalUpload.addEventListener("click", handleBackdropClick);
  formUpload.addEventListener("submit", handleUploadSubmit);

  // 7. File input: tampilkan nama file yang dipilih dan trigger dari drop zone
  coverDropZone.addEventListener("click", () => uploadCover.click());
  pdfDropZone.addEventListener("click",   () => uploadPdf.click());

  uploadCover.addEventListener("change", () => {
    const file = uploadCover.files[0];
    coverFileName.textContent = file ? file.name : "Klik untuk memilih file sampul (.jpg)";
    hideAnnouncement();
  });

  uploadPdf.addEventListener("change", () => {
    const file = uploadPdf.files[0];
    pdfFileName.textContent = file ? file.name : "Klik untuk memilih file PDF (.pdf)";
    hideAnnouncement();
  });

  // 8. Pencarian dengan debounce 400ms
  const debouncedSearch = debounce(() => {
    currentSearch = adminSearch.value;
    currentPage = 1;
    loadBooks();
  }, 400);
  adminSearch.addEventListener("input", debouncedSearch);

  // 9. Paginasi
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadBooks();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadBooks();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // 10. Tutup modal dengan Escape
  document.addEventListener("keydown", handleKeydown);

  // 11. Muat data
  await loadStats();
  await loadBooks();
}

init();
