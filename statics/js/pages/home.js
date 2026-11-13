import { api, ApiError, session } from "../api.js";
import { getCurrentUser, logout, reloadOnBackForward } from "../auth.js";

reloadOnBackForward();

import { clear, debounce, el, show, toast } from "../dom.js";

// State aplikasi di halaman beranda
let currentUser = null;
let currentQuery = "";
let selectedCategory = "";
let currentPage = 1;
let totalPages = 1;
let showingOnlyFavorites = false;

// Elemen DOM
const userNav = document.getElementById("user-nav");
const guestBanner = document.getElementById("guest-banner");
const profileModal = document.getElementById("modal-profile");
const profileForm = document.getElementById("profile-form");
const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
const profilePhone = document.getElementById("profile-phone");
const profilePassword = document.getElementById("profile-password");
const profilePasswordField = document.getElementById("profile-password-field");
const profileStatus = document.getElementById("profile-status");
const profileError = document.getElementById("profile-error");
const saveProfileBtn = document.getElementById("save-profile-btn");
const deleteAccountModal = document.getElementById("modal-delete-account");
const deleteAccountForm = document.getElementById("delete-account-form");
const deleteAccountConfirm = document.getElementById("delete-account-confirm");
const deleteAccountPassword = document.getElementById("delete-account-password");
const deleteAccountError = document.getElementById("delete-account-error");
const confirmDeleteAccountBtn = document.getElementById("confirm-delete-account");
const searchInput = document.getElementById("search-input");
const searchClearBtn = document.getElementById("search-clear-btn");
const categoryChips = document.getElementById("category-chips");
const favFilterWrapper = document.getElementById("fav-filter-wrapper");
const filterFavoritesBtn = document.getElementById("filter-favorites-btn");
const resultsCount = document.getElementById("results-count");
const bookGrid = document.getElementById("book-grid");
const pagination = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prev-page-btn");
const nextPageBtn = document.getElementById("next-page-btn");
const pageInfo = document.getElementById("page-info");

function openModal(modal) {
  modal.classList.add("open");
  modal.querySelector("input:not(:disabled)")?.focus();
}

function closeModal(modal) {
  modal.classList.remove("open");
}

function setFormError(box, message) {
  box.textContent = message;
  box.hidden = !message;
}

function openProfileModal(user) {
  const admin = user.role.toLowerCase() === "administrator";
  profileForm.reset();
  profileUsername.value = user.username;
  profileEmail.value = user.email;
  profilePhone.value = user.nomor_telepon || "";
  profileUsername.disabled = admin;
  profilePhone.disabled = admin;
  profilePassword.disabled = admin;
  profilePasswordField.hidden = admin;
  saveProfileBtn.hidden = admin;
  profileStatus.textContent = [
    `Status akun: ${user.account_status === "beku" ? "Dibekukan" : "Normal"}.`,
    `Email: ${user.email_verified ? "terverifikasi" : "belum terverifikasi"}.`,
    `Telepon: ${user.phone_verified ? "terverifikasi" : "belum terverifikasi"}.`,
  ].join(" ");
  setFormError(profileError, "");
  openModal(profileModal);
}

function openDeleteAccountModal() {
  deleteAccountForm.reset();
  setFormError(deleteAccountError, "");
  openModal(deleteAccountModal);
}

async function openAdminDashboard(menu, button) {
  menu.open = false;
  button.disabled = true;
  try {
    const response = await fetch("/api/auth/admin-session", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
      credentials: "same-origin",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) {
      throw new ApiError(response.status, "Sesi administrator tidak dapat diperbarui. Silakan masuk lagi.");
    }
    location.assign("/seAj2hB9sk/admin");
  } catch (error) {
    const message = error instanceof ApiError
      ? error.message
      : "Gagal membuka dashboard administrator.";
    console.error("Failed to refresh the administrator dashboard session.", error);
    toast(message, true);
    button.disabled = false;
  }
}

/** Inisialisasi navigasi pengguna (Tamu vs pengguna dan administrator). */
function initUserNav(user) {
  clear(userNav);

  if (!user) {
    userNav.append(
      el("span", { class: "guest-badge", text: "Tamu" }),
      el("a", { class: "btn primary btn-sm", href: "/login", text: "Masuk" }),
      el("a", { class: "btn btn-sm", href: "/register", text: "Daftar" }),
    );
    show(guestBanner, true);
    show(favFilterWrapper, false);
    return;
  }

  const admin = user.role.toLowerCase() === "administrator";
  const menu = el("details", { class: "account-menu" });
  const adminBooksButton = admin
    ? el("button", {
      class: "admin-menu-link",
      type: "button",
      text: "Kelola Buku",
      on: {
        click: (event) => openAdminDashboard(menu, event.currentTarget),
      },
    })
    : null;
  const profileAction = el("button", {
    class: "admin-menu-link",
    type: "button",
    text: "Informasi Profil",
    on: {
      click: () => {
        menu.open = false;
        openProfileModal(user);
      },
    },
  });
  const items = admin
    ? [adminBooksButton, profileAction]
    : [
      profileAction,
      el("button", {
        class: "admin-menu-link",
        type: "button",
        text: "Hapus Akun",
        on: {
          click: () => {
            menu.open = false;
            openDeleteAccountModal();
          },
        },
      }),
      el("button", {
        class: "admin-menu-link",
        type: "button",
        text: "Favorit Buku",
        on: {
          click: () => {
            showingOnlyFavorites = true;
            filterFavoritesBtn.classList.add("active");
            currentPage = 1;
            loadBooks();
            menu.open = false;
            bookGrid.scrollIntoView({ behavior: "smooth" });
          },
        },
      }),
    ];

  items.push(
    el("button", {
      class: "admin-menu-link",
      type: "button",
      text: "Keluar",
      on: {
        click: logout,
      },
    }),
  );
  menu.append(
    el("summary", { class: "btn btn-sm", text: user.username, "aria-label": "Buka menu akun" }),
    el("div", { class: "account-menu-panel" }, items),
  );
  userNav.append(menu);
  show(guestBanner, false);
  show(favFilterWrapper, !admin);
}

/** Muat daftar kategori dari backend */
async function loadCategories() {
  try {
    const categories = await api("/api/books/categories", { auth: false });
    // Tombol "Semua Kategori"
    const allBtn = el("button", {
      class: selectedCategory === "" ? "chip active" : "chip",
      type: "button",
      text: "Semua Kategori",
      on: {
        click: () => {
          selectedCategory = "";
          showingOnlyFavorites = false;
          if (filterFavoritesBtn) filterFavoritesBtn.classList.remove("active");
          updateCategoryActiveState();
          currentPage = 1;
          loadBooks();
        },
      },
    });

    clear(categoryChips);
    categoryChips.append(allBtn);

    for (const cat of categories) {
      const chip = el("button", {
        class: selectedCategory === String(cat.id_kategori) ? "chip active" : "chip",
        type: "button",
        text: cat.kategori,
        on: {
          click: () => {
            selectedCategory = String(cat.id_kategori);
            showingOnlyFavorites = false;
            if (filterFavoritesBtn) filterFavoritesBtn.classList.remove("active");
            updateCategoryActiveState();
            currentPage = 1;
            loadBooks();
          },
        },
      });
      categoryChips.append(chip);
    }
  } catch (err) {
    console.error("Gagal memuat kategori:", err);
  }
}

function updateCategoryActiveState() {
  const chips = categoryChips.querySelectorAll(".chip");
  chips.forEach((btn, index) => {
    if (index === 0 && selectedCategory === "") {
      btn.classList.add("active");
    } else if (btn.textContent && selectedCategory !== "") {
      // aktifkan jika terpilih
      btn.classList.toggle("active", btn.dataset.categoryId === selectedCategory);
    } else {
      btn.classList.remove("active");
    }
  });
}

/** Render kartu buku dengan penanganan DOM aman (anti-XSS) */
function renderBookCard(book) {
  const isFav = Boolean(book.is_favorite);

  // Tombol Favorit
  const favBtn = el("button", {
    class: isFav ? "btn-fav active" : "btn-fav",
    type: "button",
    title: isFav ? "Hapus dari favorit" : "Tambah ke favorit",
    "aria-label": isFav ? `Hapus ${book.judul_buku} dari favorit` : `Tambahkan ${book.judul_buku} ke favorit`,
    text: isFav ? "★ Tersimpan" : "☆ Favorit",
    on: {
      click: async () => {
        // KEAMANAN & UX: Tamu TIDAK BISA favorit sebelum daftar dan masuk!
        if (!currentUser) {
          toast("Silakan Masuk atau Daftar terlebih dahulu untuk menyimpan buku favorit.", true);
          return;
        }

        try {
          favBtn.disabled = true;
          const res = await api(`/api/books/${encodeURIComponent(book.isbn)}/favorite`, {
            method: "POST",
          });
          book.is_favorite = res.is_favorite;
          favBtn.className = res.is_favorite ? "btn-fav active" : "btn-fav";
          favBtn.textContent = res.is_favorite ? "★ Tersimpan" : "☆ Favorit";
          favBtn.title = res.is_favorite ? "Hapus dari favorit" : "Tambah ke favorit";
          toast(res.message);

          // Jika sedang dalam filter "Hanya Favorit", muat ulang agar sinkron
          if (showingOnlyFavorites && !res.is_favorite) {
            loadBooks();
          }
        } catch (e) {
          toast(e.message || "Gagal memperbarui favorit.", true);
        } finally {
          favBtn.disabled = false;
        }
      },
    },
  });

  // Tombol PDF
  let pdfAction;
  if (book.has_pdf) {
    pdfAction = el("a", {
      class: "btn primary btn-sm pdf-btn",
      href: `/api/books/${encodeURIComponent(book.isbn)}/pdf`,
      target: "_blank",
      rel: "noopener noreferrer",
      text: "📄 Baca PDF",
    });
  } else {
    pdfAction = el("span", {
      class: "badge muted-badge",
      text: "PDF Belum Tersedia",
    });
  }

  // Tag Kategori
  const catBadge = book.kategori_nama
    ? el("span", { class: "book-badge", text: book.kategori_nama })
    : null;

  // Metadata buku
  const metaList = el("div", { class: "book-meta" },
    el("div", { class: "meta-item" },
      el("span", { class: "meta-label", text: "Penulis: " }),
      el("span", { class: "meta-value", text: book.nama_penulis || "Tidak dicantumkan" })
    ),
    el("div", { class: "meta-item" },
      el("span", { class: "meta-label", text: "Penerbit: " }),
      el("span", { class: "meta-value", text: `${book.nama_penerbit || "-"} (${book.tahun_terbit || "-"})` })
    ),
    el("div", { class: "meta-item" },
      el("span", { class: "meta-label", text: "Halaman: " }),
      el("span", { class: "meta-value", text: `${book.jumlah_halaman} hlm` })
    ),
    el("div", { class: "meta-item" },
      el("span", { class: "meta-label", text: "ISBN: " }),
      el("span", { class: "meta-value isbn-text", text: book.isbn })
    )
  );

  // Sinopsis ringkas
  const synopsisEl = book.sinopsis
    ? el("p", { class: "book-synopsis", text: book.sinopsis })
    : null;

  // Gambar Sampul Buku (Cover dari books/cover)
  let coverEl;
  if (book.has_cover || book.book_cover) {
    coverEl = el("div", { class: "book-cover-wrapper" },
      el("img", {
        class: "book-cover-img",
                src: `/api/books/${encodeURIComponent(book.isbn)}/cover?v=${encodeURIComponent(book.book_cover || "")}`,
        alt: `Sampul ${book.judul_buku}`,
        loading: "lazy",
      })
    );
  } else {
    coverEl = el("div", { class: "book-cover-wrapper book-cover-placeholder" },
      el("span", { class: "placeholder-icon", text: "📖" }),
      el("span", { class: "placeholder-title", text: book.judul_buku })
    );
  }

  return el("article", { class: "book-card card", dataset: { isbn: book.isbn } },
    coverEl,
    el("div", { class: "card-body" },
      el("div", { class: "card-top" },
        catBadge,
        favBtn
      ),
      el("h2", { class: "book-title", text: book.judul_buku }),
      metaList,
      synopsisEl,
      el("div", { class: "card-actions" }, pdfAction)
    )
  );
}

/** Muat data buku dari backend */
async function loadBooks() {
  clear(bookGrid);
  resultsCount.textContent = "Mencari buku...";
  show(pagination, false);

  try {
    let data;

    if (showingOnlyFavorites && currentUser) {
      // Mengambil daftar favorit pengguna saat ini
      const favs = await api(`/api/favorites?page=${currentPage}&page_size=12`);
      data = {
        items: favs.map((f) => ({
          isbn: f.isbn,
          id_kategori: 0,
          kategori_nama: f.kategori_nama,
          judul_buku: f.judul_buku,
          nama_penulis: f.nama_penulis,
          nama_penerbit: f.nama_penerbit,
          tahun_terbit: f.tahun_terbit,
          jumlah_halaman: f.jumlah_halaman,
          sinopsis: null,
          book_cover: f.book_cover,
          has_cover: f.has_cover,
          is_favorite: true,
          has_pdf: f.has_pdf,
        })),
        total: favs.length,
        page: currentPage,
        page_size: 12,
        total_pages: Math.max(1, Math.ceil(favs.length / 12)),
      };
    } else {
      // Pencarian umum (dapat diakses Tamu & Authenticated)
      const params = new URLSearchParams({
        page: String(currentPage),
        page_size: "12",
      });
      if (currentQuery.trim()) params.set("q", currentQuery.trim());
      if (selectedCategory) params.set("kategori_id", selectedCategory);

      // auth: true jika ada token pengguna sehingga backend menandai status is_favorite
      data = await api(`/api/books?${params.toString()}`, {
        auth: Boolean(currentUser),
        redirectOn401: false,
      });
    }

    totalPages = data.total_pages || 1;
    resultsCount.textContent = `Menemukan ${data.total} judul buku (Halaman ${data.page} dari ${totalPages})`;

    if (data.items.length === 0) {
      bookGrid.append(
        el("div", { class: "empty-state card" },
          el("p", { class: "empty-title", text: "Tidak ada buku yang cocok dengan pencarian Anda." }),
          el("p", { class: "muted", text: "Coba gunakan kata kunci lain atau pilih kategori berbeda." })
        )
      );
      show(pagination, false);
      return;
    }

    for (const book of data.items) {
      bookGrid.append(renderBookCard(book));
    }

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
    if (err instanceof ApiError) {
      resultsCount.textContent = `Gagal memuat buku: ${err.message}`;
    } else {
      resultsCount.textContent = "Terjadi kesalahan saat memuat katalog buku.";
    }
    toast("Gagal memuat katalog buku.", true);
  }
}

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormError(profileError, "");
  if (!profileForm.reportValidity()) return;

  saveProfileBtn.disabled = true;
  try {
    currentUser = await api("/api/auth/me", {
      method: "PATCH",
      json: {
        username: profileUsername.value.trim(),
        nomor_telepon: profilePhone.value.trim() || null,
        current_password: profilePassword.value,
      },
    });
    profilePassword.value = "";
    initUserNav(currentUser);
    closeModal(profileModal);
    toast("Informasi profil berhasil diperbarui.");
  } catch (error) {
    setFormError(
      profileError,
      error instanceof ApiError ? error.message : "Gagal memperbarui profil.",
    );
  } finally {
    saveProfileBtn.disabled = false;
  }
});

deleteAccountForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormError(deleteAccountError, "");
  if (!deleteAccountForm.reportValidity()) return;
  if (deleteAccountConfirm.value !== "HAPUS") {
    setFormError(deleteAccountError, "Ketik HAPUS persis untuk mengonfirmasi penghapusan akun.");
    deleteAccountConfirm.focus();
    return;
  }

  confirmDeleteAccountBtn.disabled = true;
  try {
    await api("/api/auth/me", {
      method: "DELETE",
      json: { password: deleteAccountPassword.value },
    });
    session.clear();
    location.assign("/login?deleted=1");
  } catch (error) {
    setFormError(
      deleteAccountError,
      error instanceof ApiError ? error.message : "Gagal menghapus akun.",
    );
  } finally {
    confirmDeleteAccountBtn.disabled = false;
  }
});

function closeProfileModal() {
  profilePassword.value = "";
  closeModal(profileModal);
}

function closeDeleteAccountModal() {
  deleteAccountPassword.value = "";
  deleteAccountConfirm.value = "";
  closeModal(deleteAccountModal);
}

document.getElementById("close-profile-modal").addEventListener("click", closeProfileModal);
document.getElementById("close-profile-button").addEventListener("click", closeProfileModal);
document.getElementById("close-delete-modal").addEventListener("click", closeDeleteAccountModal);
document.getElementById("cancel-delete-account").addEventListener("click", closeDeleteAccountModal);

profileModal.addEventListener("click", (event) => {
  if (event.target === profileModal) closeProfileModal();
});
deleteAccountModal.addEventListener("click", (event) => {
  if (event.target === deleteAccountModal) closeDeleteAccountModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProfileModal();
    closeDeleteAccountModal();
  }
});

// Inisialisasi awal saat halaman dimuat
async function init() {
  // Ambil profil jika login, tetapi JANGAN redirect bila tamu (getCurrentUser aman)
  currentUser = await getCurrentUser();
  initUserNav(currentUser);

  // Setup listener pencarian debounced
  const debouncedSearch = debounce(() => {
    currentQuery = searchInput.value;
    show(searchClearBtn, currentQuery.length > 0);
    currentPage = 1;
    loadBooks();
  }, 300);

  searchInput.addEventListener("input", debouncedSearch);

  searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentQuery = "";
    show(searchClearBtn, false);
    currentPage = 1;
    loadBooks();
    searchInput.focus();
  });

  // Setup tombol filter favorit
  if (filterFavoritesBtn) {
    filterFavoritesBtn.addEventListener("click", () => {
      showingOnlyFavorites = !showingOnlyFavorites;
      filterFavoritesBtn.classList.toggle("active", showingOnlyFavorites);
      currentPage = 1;
      loadBooks();
    });
  }

  // Setup navigasi halaman
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

  // Muat data kategori dan buku
  await loadCategories();
  await loadBooks();
}

init();
