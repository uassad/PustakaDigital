const _0x310701 = _0x2a49;
(function (_0xec8612, _0x2b4cbd) {
  const _0x445d4d = _0x2a49,
    _0x3fda78 = _0xec8612();
  while (!![]) {
    try {
      const _0x48f630 =
        (-parseInt(_0x445d4d(0x105)) / 0x1) *
          (parseInt(_0x445d4d(0x16e)) / 0x2) +
        -parseInt(_0x445d4d(0x189)) / 0x3 +
        parseInt(_0x445d4d(0x13c)) / 0x4 +
        (parseInt(_0x445d4d(0x16f)) / 0x5) *
          (parseInt(_0x445d4d(0x18e)) / 0x6) +
        (-parseInt(_0x445d4d(0x15c)) / 0x7) *
          (-parseInt(_0x445d4d(0x13e)) / 0x8) +
        (-parseInt(_0x445d4d(0x1ab)) / 0x9) *
          (-parseInt(_0x445d4d(0x1ac)) / 0xa) +
        (parseInt(_0x445d4d(0x133)) / 0xb) *
          (-parseInt(_0x445d4d(0x15e)) / 0xc);
      if (_0x48f630 === _0x2b4cbd) break;
      else _0x3fda78["push"](_0x3fda78["shift"]());
    } catch (_0x2f0abb) {
      _0x3fda78["push"](_0x3fda78["shift"]());
    }
  }
})(_0x5ec9, 0xa28a1);
import { api, ApiError, session } from "../../api.js";
import { getCurrentUser, logout, reloadOnBackForward } from "../../auth.js";
reloadOnBackForward();
import { clear, debounce, el, show, toast } from "../../dom.js";
let currentUser = null,
  currentQuery = "",
  selectedCategory = "",
  currentPage = 0x1,
  totalPages = 0x1,
  showingOnlyFavorites = ![];
const userNav = document[_0x310701(0x102)](_0x310701(0x163)),
  guestBanner = document[_0x310701(0x102)]("guest-banner"),
  profileModal = document[_0x310701(0x102)](_0x310701(0x137)),
  profileForm = document["getElementById"](_0x310701(0x121)),
  profileUsername = document["getElementById"](_0x310701(0x18c)),
  profileEmail = document[_0x310701(0x102)](_0x310701(0x135)),
  profilePhone = document[_0x310701(0x102)](_0x310701(0x111)),
  profilePassword = document[_0x310701(0x102)](_0x310701(0x1b0)),
  profilePasswordField = document[_0x310701(0x102)]("profile-password-field"),
  profileStatus = document[_0x310701(0x102)](_0x310701(0x172)),
  profileError = document[_0x310701(0x102)](_0x310701(0x150)),
  saveProfileBtn = document["getElementById"](_0x310701(0x11c)),
  deleteAccountModal = document[_0x310701(0x102)]("modal-delete-account"),
  deleteAccountForm = document["getElementById"]("delete-account-form"),
  deleteAccountConfirm = document[_0x310701(0x102)](_0x310701(0x118)),
  deleteAccountPassword = document["getElementById"](_0x310701(0x157)),
  deleteAccountError = document["getElementById"]("delete-account-error"),
  confirmDeleteAccountBtn = document[_0x310701(0x102)](_0x310701(0x101)),
  searchInput = document[_0x310701(0x102)](_0x310701(0x1ae)),
  searchClearBtn = document[_0x310701(0x102)](_0x310701(0x1bc)),
  categoryChips = document[_0x310701(0x102)]("category-chips"),
  favFilterWrapper = document[_0x310701(0x102)](_0x310701(0x1b8)),
  filterFavoritesBtn = document[_0x310701(0x102)]("filter-favorites-btn"),
  resultsCount = document[_0x310701(0x102)](_0x310701(0x10e)),
  bookGrid = document["getElementById"]("book-grid"),
  pagination = document["getElementById"](_0x310701(0x155)),
  prevPageBtn = document[_0x310701(0x102)]("prev-page-btn"),
  nextPageBtn = document[_0x310701(0x102)](_0x310701(0x15d)),
  pageInfo = document[_0x310701(0x102)](_0x310701(0x1c1));
function _0x2a49(_0x5edbf4, _0x22593c) {
  _0x5edbf4 = _0x5edbf4 - 0xfe;
  const _0x5ec93d = _0x5ec9();
  let _0x2a493b = _0x5ec93d[_0x5edbf4];
  return _0x2a493b;
}
function openModal(_0x3280e4) {
  const _0x1148f5 = _0x310701;
  (_0x3280e4[_0x1148f5(0x10b)]["add"](_0x1148f5(0x17b)),
    _0x3280e4[_0x1148f5(0x14f)](_0x1148f5(0x112))?.[_0x1148f5(0x178)]());
}
function closeModal(_0x3c7d67) {
  const _0x56b822 = _0x310701;
  _0x3c7d67[_0x56b822(0x10b)][_0x56b822(0x1c0)]("open");
}
function setFormError(_0xad511e, _0x536d1c) {
  const _0x1738e1 = _0x310701;
  ((_0xad511e[_0x1738e1(0x168)] = _0x536d1c),
    (_0xad511e[_0x1738e1(0x1be)] = !_0x536d1c));
}
function openProfileModal(_0x1df0c0) {
  const _0x555f41 = _0x310701,
    _0x374b7d =
      _0x1df0c0[_0x555f41(0x125)][_0x555f41(0x12b)]() === _0x555f41(0x1c4);
  (profileForm[_0x555f41(0x183)](),
    (profileUsername[_0x555f41(0x140)] = _0x1df0c0[_0x555f41(0x1af)]),
    (profileEmail[_0x555f41(0x140)] = _0x1df0c0[_0x555f41(0x113)]),
    (profilePhone[_0x555f41(0x140)] = _0x1df0c0[_0x555f41(0x176)] || ""),
    (profileUsername[_0x555f41(0x11a)] = _0x374b7d),
    (profilePhone[_0x555f41(0x11a)] = _0x374b7d),
    (profilePassword[_0x555f41(0x11a)] = _0x374b7d),
    (profilePasswordField[_0x555f41(0x1be)] = _0x374b7d),
    (saveProfileBtn[_0x555f41(0x1be)] = _0x374b7d),
    (profileStatus[_0x555f41(0x168)] = [
      _0x555f41(0x174)[_0x555f41(0x160)](
        _0x1df0c0["account_status"] === "beku"
          ? _0x555f41(0x156)
          : _0x555f41(0x1a3),
        ".",
      ),
      "Email:\x20"[_0x555f41(0x160)](
        _0x1df0c0[_0x555f41(0x1b6)] ? _0x555f41(0x191) : _0x555f41(0x17d),
        ".",
      ),
      _0x555f41(0x134)["concat"](
        _0x1df0c0[_0x555f41(0x100)] ? _0x555f41(0x191) : _0x555f41(0x17d),
        ".",
      ),
    ][_0x555f41(0x154)]("\x20")),
    setFormError(profileError, ""),
    openModal(profileModal));
}
function openDeleteAccountModal() {
  const _0x8feada = _0x310701;
  (deleteAccountForm[_0x8feada(0x183)](),
    setFormError(deleteAccountError, ""),
    openModal(deleteAccountModal));
}
async function openAdminDashboard(_0x1778e0, _0x1622af) {
  const _0x1c9084 = _0x310701;
  ((_0x1778e0[_0x1c9084(0x17b)] = ![]), (_0x1622af["disabled"] = !![]));
  try {
    const _0x4500d3 = await fetch(_0x1c9084(0x199), {
      method: "POST",
      headers: {
        Authorization: _0x1c9084(0x145)[_0x1c9084(0x160)](
          session[_0x1c9084(0x1a9)],
        ),
      },
      credentials: "same-origin",
      cache: _0x1c9084(0x19c),
      referrerPolicy: _0x1c9084(0x173),
    });
    if (!_0x4500d3["ok"])
      throw new ApiError(_0x4500d3[_0x1c9084(0x1c2)], _0x1c9084(0x132));
    location[_0x1c9084(0x14d)](_0x1c9084(0x129));
  } catch (_0x50fe2d) {
    const _0x4063a0 =
      _0x50fe2d instanceof ApiError
        ? _0x50fe2d[_0x1c9084(0x171)]
        : "Gagal\x20membuka\x20dashboard\x20administrator.";
    (console[_0x1c9084(0x19d)](
      "Failed\x20to\x20refresh\x20the\x20administrator\x20dashboard\x20session.",
      _0x50fe2d,
    ),
      toast(_0x4063a0, !![]),
      (_0x1622af[_0x1c9084(0x11a)] = ![]));
  }
}
function initUserNav(_0x507d12) {
  const _0x32f7c6 = _0x310701;
  clear(userNav);
  if (!_0x507d12) {
    (userNav["append"](
      el("span", { class: _0x32f7c6(0x127), text: _0x32f7c6(0x146) }),
      el("a", {
        class: _0x32f7c6(0x15a),
        href: _0x32f7c6(0x12e),
        text: "Masuk",
      }),
      el("a", {
        class: _0x32f7c6(0x153),
        href: _0x32f7c6(0x18d),
        text: "Daftar",
      }),
    ),
      show(guestBanner, !![]),
      show(favFilterWrapper, ![]));
    return;
  }
  const _0x4a518e =
      _0x507d12[_0x32f7c6(0x125)][_0x32f7c6(0x12b)]() === _0x32f7c6(0x1c4),
    _0x4a0a01 = el(_0x32f7c6(0x128), { class: _0x32f7c6(0x123) }),
    _0x3af036 = _0x4a518e
      ? el(_0x32f7c6(0x196), {
          class: _0x32f7c6(0x14c),
          type: _0x32f7c6(0x196),
          text: _0x32f7c6(0x18a),
          on: {
            click: (_0x213a4) =>
              openAdminDashboard(_0x4a0a01, _0x213a4[_0x32f7c6(0x159)]),
          },
        })
      : null,
    _0x56246b = el("button", {
      class: "admin-menu-link",
      type: _0x32f7c6(0x196),
      text: _0x32f7c6(0x177),
      on: {
        click: () => {
          const _0x4000d4 = _0x32f7c6;
          ((_0x4a0a01[_0x4000d4(0x17b)] = ![]), openProfileModal(_0x507d12));
        },
      },
    }),
    _0x1f7d7e = _0x4a518e
      ? [_0x3af036, _0x56246b]
      : [
          _0x56246b,
          el("button", {
            class: _0x32f7c6(0x14c),
            type: _0x32f7c6(0x196),
            text: _0x32f7c6(0xff),
            on: {
              click: () => {
                const _0x45d3e2 = _0x32f7c6;
                ((_0x4a0a01[_0x45d3e2(0x17b)] = ![]), openDeleteAccountModal());
              },
            },
          }),
          el(_0x32f7c6(0x196), {
            class: _0x32f7c6(0x14c),
            type: "button",
            text: "Favorit\x20Buku",
            on: {
              click: () => {
                const _0x2de09e = _0x32f7c6;
                ((showingOnlyFavorites = !![]),
                  filterFavoritesBtn[_0x2de09e(0x10b)][_0x2de09e(0x1a2)](
                    "active",
                  ),
                  (currentPage = 0x1),
                  loadBooks(),
                  (_0x4a0a01["open"] = ![]),
                  bookGrid[_0x2de09e(0x110)]({ behavior: "smooth" }));
              },
            },
          }),
        ];
  (_0x1f7d7e["push"](
    el("button", {
      class: _0x32f7c6(0x14c),
      type: _0x32f7c6(0x196),
      text: _0x32f7c6(0x103),
      on: { click: logout },
    }),
  ),
    _0x4a0a01["append"](
      el(_0x32f7c6(0x117), {
        class: "btn\x20btn-sm",
        text: _0x507d12[_0x32f7c6(0x1af)],
        "aria-label": _0x32f7c6(0x1b3),
      }),
      el(_0x32f7c6(0x19e), { class: _0x32f7c6(0x185) }, _0x1f7d7e),
    ),
    userNav[_0x32f7c6(0x12d)](_0x4a0a01),
    show(guestBanner, ![]),
    show(favFilterWrapper, !_0x4a518e));
}
async function loadCategories() {
  const _0x4c4684 = _0x310701;
  try {
    const _0x59f392 = await api(_0x4c4684(0x10a), { auth: ![] }),
      _0x22c03d = el("button", {
        class: selectedCategory === "" ? _0x4c4684(0x12a) : _0x4c4684(0x1ad),
        type: "button",
        text: _0x4c4684(0x192),
        on: {
          click: () => {
            const _0x51b646 = _0x4c4684;
            ((selectedCategory = ""), (showingOnlyFavorites = ![]));
            if (filterFavoritesBtn)
              filterFavoritesBtn["classList"][_0x51b646(0x1c0)](
                _0x51b646(0x169),
              );
            (updateCategoryActiveState(), (currentPage = 0x1), loadBooks());
          },
        },
      });
    (clear(categoryChips), categoryChips["append"](_0x22c03d));
    for (const _0x1c831b of _0x59f392) {
      const _0x1e836a = el(_0x4c4684(0x196), {
        class:
          selectedCategory === String(_0x1c831b[_0x4c4684(0x1bb)])
            ? _0x4c4684(0x12a)
            : "chip",
        type: _0x4c4684(0x196),
        text: _0x1c831b["kategori"],
        on: {
          click: () => {
            const _0x56227a = _0x4c4684;
            ((selectedCategory = String(_0x1c831b[_0x56227a(0x1bb)])),
              (showingOnlyFavorites = ![]));
            if (filterFavoritesBtn)
              filterFavoritesBtn[_0x56227a(0x10b)][_0x56227a(0x1c0)]("active");
            (updateCategoryActiveState(), (currentPage = 0x1), loadBooks());
          },
        },
      });
      categoryChips[_0x4c4684(0x12d)](_0x1e836a);
    }
  } catch (_0x4ce099) {
    console[_0x4c4684(0x19d)](_0x4c4684(0x114), _0x4ce099);
  }
}
function _0x5ec9() {
  const _0x2cfcd5 = [
    "no-store",
    "error",
    "div",
    "Escape",
    "Halaman:\x20",
    "Coba\x20gunakan\x20kata\x20kunci\x20lain\x20atau\x20pilih\x20kategori\x20berbeda.",
    "add",
    "Normal",
    "toggle",
    "empty-title",
    "reportValidity",
    "total_pages",
    "nama_penerbit",
    "token",
    "/login?deleted=1",
    "9YLbfQn",
    "5643010uxZrfK",
    "chip",
    "search-input",
    "username",
    "profile-password",
    "\x20judul\x20buku\x20(Halaman\x20",
    "Gagal\x20memuat\x20katalog\x20buku.",
    "Buka\x20menu\x20akun",
    "book-badge",
    "\x20hlm",
    "email_verified",
    "★\x20Tersimpan",
    "fav-filter-wrapper",
    ".chip",
    "close-delete-modal",
    "id_kategori",
    "search-clear-btn",
    "Tidak\x20dicantumkan",
    "hidden",
    "Menemukan\x20",
    "remove",
    "page-info",
    "status",
    "sinopsis",
    "administrator",
    "meta-label",
    "PATCH",
    "has_cover",
    "Hapus\x20Akun",
    "phone_verified",
    "confirm-delete-account",
    "getElementById",
    "Keluar",
    "/pdf",
    "84547UWKveK",
    "scrollTo",
    "☆\x20Favorit",
    "kategori_id",
    "jumlah_halaman",
    "/api/books/categories",
    "classList",
    "length",
    "key",
    "results-count",
    "card-top",
    "scrollIntoView",
    "profile-phone",
    "input:not(:disabled)",
    "email",
    "Gagal\x20memuat\x20kategori:",
    "cancel-delete-account",
    "/api/books/",
    "summary",
    "delete-account-confirm",
    "/favorite",
    "disabled",
    "kategori_nama",
    "save-profile-btn",
    "btn-fav",
    "meta-value",
    "book-cover-wrapper",
    "span",
    "profile-form",
    "/api/auth/me",
    "account-menu",
    "meta-value\x20isbn-text",
    "role",
    "Tambah\x20ke\x20favorit",
    "guest-badge",
    "details",
    "/seAj2hB9sk/admin",
    "chip\x20active",
    "toLowerCase",
    "click",
    "append",
    "/login",
    "title",
    "book_cover",
    "POST",
    "Sesi\x20administrator\x20tidak\x20dapat\x20diperbarui.\x20Silakan\x20masuk\x20lagi.",
    "22RldgMG",
    "Telepon:\x20",
    "profile-email",
    "book-synopsis",
    "modal-profile",
    "trim",
    "Hapus\x20",
    "close-profile-modal",
    "/cover?v=",
    "2255948yKaoNv",
    "forEach",
    "30872JZvhHL",
    "/api/favorites?page=",
    "value",
    "meta-item",
    "book-meta",
    "lazy",
    "Gagal\x20memperbarui\x20favorit.",
    "Bearer\x20",
    "Tamu",
    "nama_penulis",
    "close-profile-button",
    "card-actions",
    "clear",
    "Halaman\x20",
    "admin-menu-link",
    "assign",
    "isbn",
    "querySelector",
    "profile-error",
    "Tambahkan\x20",
    "book-card\x20card",
    "btn\x20btn-sm",
    "join",
    "pagination",
    "Dibekukan",
    "delete-account-password",
    "btn\x20primary\x20btn-sm\x20pdf-btn",
    "currentTarget",
    "btn\x20primary\x20btn-sm",
    "max",
    "2191VbVMXN",
    "next-page-btn",
    "3517284mTgauB",
    "Gagal\x20memperbarui\x20profil.",
    "concat",
    "page",
    "items",
    "user-nav",
    "ceil",
    "Sampul\x20",
    "📄\x20Baca\x20PDF",
    "addEventListener",
    "textContent",
    "active",
    "total",
    "book-cover-img",
    "btn-fav\x20active",
    "Penulis:\x20",
    "30zegcxM",
    "5iLCKpn",
    "smooth",
    "message",
    "profile-status",
    "no-referrer",
    "Status\x20akun:\x20",
    "book-title",
    "nomor_telepon",
    "Informasi\x20Profil",
    "focus",
    "article",
    "preventDefault",
    "open",
    "Mencari\x20buku...",
    "belum\x20terverifikasi",
    "dataset",
    "Gagal\x20menghapus\x20akun.",
    "Silakan\x20Masuk\x20atau\x20Daftar\x20terlebih\x20dahulu\x20untuk\x20menyimpan\x20buku\x20favorit.",
    "className",
    "badge\x20muted-badge",
    "reset",
    "is_favorite",
    "account-menu-panel",
    "set",
    "\x20dari\x20favorit",
    "DELETE",
    "1557516mNoHrt",
    "Kelola\x20Buku",
    "Hapus\x20dari\x20favorit",
    "profile-username",
    "/register",
    "4219182nyNIDN",
    "Terjadi\x20kesalahan\x20saat\x20memuat\x20katalog\x20buku.",
    "HAPUS",
    "terverifikasi",
    "Semua\x20Kategori",
    "judul_buku",
    "submit",
    "tahun_terbit",
    "button",
    "input",
    "categoryId",
    "/api/auth/admin-session",
    "\x20dari\x20",
    "Gagal\x20memuat\x20buku:\x20",
  ];
  _0x5ec9 = function () {
    return _0x2cfcd5;
  };
  return _0x5ec9();
}
function updateCategoryActiveState() {
  const _0x1242fe = _0x310701,
    _0x13c458 = categoryChips["querySelectorAll"](_0x1242fe(0x1b9));
  _0x13c458[_0x1242fe(0x13d)]((_0x4e6d9c, _0x289930) => {
    const _0x26441c = _0x1242fe;
    if (_0x289930 === 0x0 && selectedCategory === "")
      _0x4e6d9c["classList"][_0x26441c(0x1a2)](_0x26441c(0x169));
    else
      _0x4e6d9c[_0x26441c(0x168)] && selectedCategory !== ""
        ? _0x4e6d9c[_0x26441c(0x10b)][_0x26441c(0x1a4)](
            "active",
            _0x4e6d9c[_0x26441c(0x17e)][_0x26441c(0x198)] === selectedCategory,
          )
        : _0x4e6d9c[_0x26441c(0x10b)]["remove"](_0x26441c(0x169));
  });
}
function renderBookCard(_0x2b80a1) {
  const _0x4349ea = _0x310701,
    _0x54c978 = Boolean(_0x2b80a1[_0x4349ea(0x184)]),
    _0x461ad1 = el(_0x4349ea(0x196), {
      class: _0x54c978 ? "btn-fav\x20active" : "btn-fav",
      type: _0x4349ea(0x196),
      title: _0x54c978 ? _0x4349ea(0x18b) : "Tambah\x20ke\x20favorit",
      "aria-label": _0x54c978
        ? _0x4349ea(0x139)[_0x4349ea(0x160)](
            _0x2b80a1["judul_buku"],
            _0x4349ea(0x187),
          )
        : _0x4349ea(0x151)[_0x4349ea(0x160)](
            _0x2b80a1[_0x4349ea(0x193)],
            "\x20ke\x20favorit",
          ),
      text: _0x54c978 ? _0x4349ea(0x1b7) : "☆\x20Favorit",
      on: {
        click: async () => {
          const _0x36eaf7 = _0x4349ea;
          if (!currentUser) {
            toast(_0x36eaf7(0x180), !![]);
            return;
          }
          try {
            _0x461ad1["disabled"] = !![];
            const _0xafe8c2 = await api(
              _0x36eaf7(0x116)["concat"](
                encodeURIComponent(_0x2b80a1[_0x36eaf7(0x14e)]),
                _0x36eaf7(0x119),
              ),
              { method: _0x36eaf7(0x131) },
            );
            ((_0x2b80a1[_0x36eaf7(0x184)] = _0xafe8c2[_0x36eaf7(0x184)]),
              (_0x461ad1[_0x36eaf7(0x181)] = _0xafe8c2["is_favorite"]
                ? _0x36eaf7(0x16c)
                : _0x36eaf7(0x11d)),
              (_0x461ad1[_0x36eaf7(0x168)] = _0xafe8c2[_0x36eaf7(0x184)]
                ? _0x36eaf7(0x1b7)
                : _0x36eaf7(0x107)),
              (_0x461ad1[_0x36eaf7(0x12f)] = _0xafe8c2[_0x36eaf7(0x184)]
                ? _0x36eaf7(0x18b)
                : _0x36eaf7(0x126)),
              toast(_0xafe8c2[_0x36eaf7(0x171)]),
              showingOnlyFavorites &&
                !_0xafe8c2[_0x36eaf7(0x184)] &&
                loadBooks());
          } catch (_0x562360) {
            toast(_0x562360["message"] || _0x36eaf7(0x144), !![]);
          } finally {
            _0x461ad1["disabled"] = ![];
          }
        },
      },
    });
  let _0x13eefd;
  _0x2b80a1["has_pdf"]
    ? (_0x13eefd = el("a", {
        class: _0x4349ea(0x158),
        href: _0x4349ea(0x116)[_0x4349ea(0x160)](
          encodeURIComponent(_0x2b80a1["isbn"]),
          _0x4349ea(0x104),
        ),
        target: "_blank",
        rel: "noopener\x20noreferrer",
        text: _0x4349ea(0x166),
      }))
    : (_0x13eefd = el(_0x4349ea(0x120), {
        class: _0x4349ea(0x182),
        text: "PDF\x20Belum\x20Tersedia",
      }));
  const _0x785d2d = _0x2b80a1["kategori_nama"]
      ? el("span", {
          class: _0x4349ea(0x1b4),
          text: _0x2b80a1["kategori_nama"],
        })
      : null,
    _0xff7b5e = el(
      _0x4349ea(0x19e),
      { class: _0x4349ea(0x142) },
      el(
        _0x4349ea(0x19e),
        { class: _0x4349ea(0x141) },
        el(_0x4349ea(0x120), {
          class: _0x4349ea(0x1c5),
          text: _0x4349ea(0x16d),
        }),
        el(_0x4349ea(0x120), {
          class: _0x4349ea(0x11e),
          text: _0x2b80a1[_0x4349ea(0x147)] || _0x4349ea(0x1bd),
        }),
      ),
      el(
        _0x4349ea(0x19e),
        { class: _0x4349ea(0x141) },
        el("span", { class: _0x4349ea(0x1c5), text: "Penerbit:\x20" }),
        el("span", {
          class: _0x4349ea(0x11e),
          text: ""
            [_0x4349ea(0x160)](_0x2b80a1[_0x4349ea(0x1a8)] || "-", "\x20(")
            [_0x4349ea(0x160)](_0x2b80a1[_0x4349ea(0x195)] || "-", ")"),
        }),
      ),
      el(
        "div",
        { class: _0x4349ea(0x141) },
        el(_0x4349ea(0x120), {
          class: _0x4349ea(0x1c5),
          text: _0x4349ea(0x1a0),
        }),
        el("span", {
          class: "meta-value",
          text: ""[_0x4349ea(0x160)](
            _0x2b80a1[_0x4349ea(0x109)],
            _0x4349ea(0x1b5),
          ),
        }),
      ),
      el(
        _0x4349ea(0x19e),
        { class: _0x4349ea(0x141) },
        el(_0x4349ea(0x120), { class: "meta-label", text: "ISBN:\x20" }),
        el(_0x4349ea(0x120), {
          class: _0x4349ea(0x124),
          text: _0x2b80a1[_0x4349ea(0x14e)],
        }),
      ),
    ),
    _0x5280c3 = _0x2b80a1[_0x4349ea(0x1c3)]
      ? el("p", { class: _0x4349ea(0x136), text: _0x2b80a1[_0x4349ea(0x1c3)] })
      : null;
  let _0x105cbb;
  return (
    _0x2b80a1[_0x4349ea(0xfe)] || _0x2b80a1[_0x4349ea(0x130)]
      ? (_0x105cbb = el(
          _0x4349ea(0x19e),
          { class: _0x4349ea(0x11f) },
          el("img", {
            class: _0x4349ea(0x16b),
            src: _0x4349ea(0x116)
              [_0x4349ea(0x160)](
                encodeURIComponent(_0x2b80a1[_0x4349ea(0x14e)]),
                _0x4349ea(0x13b),
              )
              [_0x4349ea(0x160)](
                encodeURIComponent(_0x2b80a1[_0x4349ea(0x130)] || ""),
              ),
            alt: _0x4349ea(0x165)[_0x4349ea(0x160)](_0x2b80a1["judul_buku"]),
            loading: _0x4349ea(0x143),
          }),
        ))
      : (_0x105cbb = el(
          _0x4349ea(0x19e),
          { class: "book-cover-wrapper\x20book-cover-placeholder" },
          el("span", { class: "placeholder-icon", text: "📖" }),
          el(_0x4349ea(0x120), {
            class: "placeholder-title",
            text: _0x2b80a1[_0x4349ea(0x193)],
          }),
        )),
    el(
      _0x4349ea(0x179),
      { class: _0x4349ea(0x152), dataset: { isbn: _0x2b80a1["isbn"] } },
      _0x105cbb,
      el(
        _0x4349ea(0x19e),
        { class: "card-body" },
        el(_0x4349ea(0x19e), { class: _0x4349ea(0x10f) }, _0x785d2d, _0x461ad1),
        el("h2", {
          class: _0x4349ea(0x175),
          text: _0x2b80a1[_0x4349ea(0x193)],
        }),
        _0xff7b5e,
        _0x5280c3,
        el(_0x4349ea(0x19e), { class: _0x4349ea(0x149) }, _0x13eefd),
      ),
    )
  );
}
async function loadBooks() {
  const _0x4109ca = _0x310701;
  (clear(bookGrid),
    (resultsCount[_0x4109ca(0x168)] = _0x4109ca(0x17c)),
    show(pagination, ![]));
  try {
    let _0x331f5c;
    if (showingOnlyFavorites && currentUser) {
      const _0x1573d8 = await api(
        _0x4109ca(0x13f)[_0x4109ca(0x160)](currentPage, "&page_size=12"),
      );
      _0x331f5c = {
        items: _0x1573d8["map"]((_0x5025cb) => ({
          isbn: _0x5025cb[_0x4109ca(0x14e)],
          id_kategori: 0x0,
          kategori_nama: _0x5025cb[_0x4109ca(0x11b)],
          judul_buku: _0x5025cb[_0x4109ca(0x193)],
          nama_penulis: _0x5025cb[_0x4109ca(0x147)],
          nama_penerbit: _0x5025cb[_0x4109ca(0x1a8)],
          tahun_terbit: _0x5025cb[_0x4109ca(0x195)],
          jumlah_halaman: _0x5025cb["jumlah_halaman"],
          sinopsis: null,
          book_cover: _0x5025cb[_0x4109ca(0x130)],
          has_cover: _0x5025cb[_0x4109ca(0xfe)],
          is_favorite: !![],
          has_pdf: _0x5025cb["has_pdf"],
        })),
        total: _0x1573d8[_0x4109ca(0x10c)],
        page: currentPage,
        page_size: 0xc,
        total_pages: Math[_0x4109ca(0x15b)](
          0x1,
          Math[_0x4109ca(0x164)](_0x1573d8[_0x4109ca(0x10c)] / 0xc),
        ),
      };
    } else {
      const _0x14344d = new URLSearchParams({
        page: String(currentPage),
        page_size: "12",
      });
      if (currentQuery["trim"]())
        _0x14344d[_0x4109ca(0x186)]("q", currentQuery[_0x4109ca(0x138)]());
      if (selectedCategory)
        _0x14344d[_0x4109ca(0x186)](_0x4109ca(0x108), selectedCategory);
      _0x331f5c = await api(
        "/api/books?"[_0x4109ca(0x160)](_0x14344d["toString"]()),
        { auth: Boolean(currentUser), redirectOn401: ![] },
      );
    }
    ((totalPages = _0x331f5c[_0x4109ca(0x1a7)] || 0x1),
      (resultsCount[_0x4109ca(0x168)] = _0x4109ca(0x1bf)
        ["concat"](_0x331f5c[_0x4109ca(0x16a)], _0x4109ca(0x1b1))
        ["concat"](_0x331f5c[_0x4109ca(0x161)], _0x4109ca(0x19a))
        ["concat"](totalPages, ")")));
    if (_0x331f5c[_0x4109ca(0x162)][_0x4109ca(0x10c)] === 0x0) {
      (bookGrid["append"](
        el(
          _0x4109ca(0x19e),
          { class: "empty-state\x20card" },
          el("p", {
            class: _0x4109ca(0x1a5),
            text: "Tidak\x20ada\x20buku\x20yang\x20cocok\x20dengan\x20pencarian\x20Anda.",
          }),
          el("p", { class: "muted", text: _0x4109ca(0x1a1) }),
        ),
      ),
        show(pagination, ![]));
      return;
    }
    for (const _0x384fc8 of _0x331f5c[_0x4109ca(0x162)]) {
      bookGrid[_0x4109ca(0x12d)](renderBookCard(_0x384fc8));
    }
    totalPages > 0x1
      ? (show(pagination, !![]),
        (pageInfo[_0x4109ca(0x168)] = _0x4109ca(0x14b)
          [_0x4109ca(0x160)](currentPage, _0x4109ca(0x19a))
          [_0x4109ca(0x160)](totalPages)),
        (prevPageBtn[_0x4109ca(0x11a)] = currentPage <= 0x1),
        (nextPageBtn[_0x4109ca(0x11a)] = currentPage >= totalPages))
      : show(pagination, ![]);
  } catch (_0x35249f) {
    (_0x35249f instanceof ApiError
      ? (resultsCount[_0x4109ca(0x168)] = _0x4109ca(0x19b)[_0x4109ca(0x160)](
          _0x35249f[_0x4109ca(0x171)],
        ))
      : (resultsCount[_0x4109ca(0x168)] = _0x4109ca(0x18f)),
      toast(_0x4109ca(0x1b2), !![]));
  }
}
(profileForm[_0x310701(0x167)](_0x310701(0x194), async (_0x2872c2) => {
  const _0x493f12 = _0x310701;
  (_0x2872c2[_0x493f12(0x17a)](), setFormError(profileError, ""));
  if (!profileForm[_0x493f12(0x1a6)]()) return;
  saveProfileBtn[_0x493f12(0x11a)] = !![];
  try {
    ((currentUser = await api(_0x493f12(0x122), {
      method: _0x493f12(0x1c6),
      json: {
        username: profileUsername[_0x493f12(0x140)][_0x493f12(0x138)](),
        nomor_telepon:
          profilePhone[_0x493f12(0x140)][_0x493f12(0x138)]() || null,
        current_password: profilePassword[_0x493f12(0x140)],
      },
    })),
      (profilePassword[_0x493f12(0x140)] = ""),
      initUserNav(currentUser),
      closeModal(profileModal),
      toast("Informasi\x20profil\x20berhasil\x20diperbarui."));
  } catch (_0x7f1e2) {
    setFormError(
      profileError,
      _0x7f1e2 instanceof ApiError
        ? _0x7f1e2[_0x493f12(0x171)]
        : _0x493f12(0x15f),
    );
  } finally {
    saveProfileBtn["disabled"] = ![];
  }
}),
  deleteAccountForm[_0x310701(0x167)](_0x310701(0x194), async (_0x1a2f2d) => {
    const _0x343453 = _0x310701;
    (_0x1a2f2d[_0x343453(0x17a)](), setFormError(deleteAccountError, ""));
    if (!deleteAccountForm[_0x343453(0x1a6)]()) return;
    if (deleteAccountConfirm[_0x343453(0x140)] !== _0x343453(0x190)) {
      (setFormError(
        deleteAccountError,
        "Ketik\x20HAPUS\x20persis\x20untuk\x20mengonfirmasi\x20penghapusan\x20akun.",
      ),
        deleteAccountConfirm[_0x343453(0x178)]());
      return;
    }
    confirmDeleteAccountBtn[_0x343453(0x11a)] = !![];
    try {
      (await api(_0x343453(0x122), {
        method: _0x343453(0x188),
        json: { password: deleteAccountPassword[_0x343453(0x140)] },
      }),
        session[_0x343453(0x14a)](),
        location[_0x343453(0x14d)](_0x343453(0x1aa)));
    } catch (_0x560165) {
      setFormError(
        deleteAccountError,
        _0x560165 instanceof ApiError
          ? _0x560165[_0x343453(0x171)]
          : _0x343453(0x17f),
      );
    } finally {
      confirmDeleteAccountBtn[_0x343453(0x11a)] = ![];
    }
  }));
function closeProfileModal() {
  ((profilePassword["value"] = ""), closeModal(profileModal));
}
function closeDeleteAccountModal() {
  const _0x114bbd = _0x310701;
  ((deleteAccountPassword[_0x114bbd(0x140)] = ""),
    (deleteAccountConfirm[_0x114bbd(0x140)] = ""),
    closeModal(deleteAccountModal));
}
(document[_0x310701(0x102)](_0x310701(0x13a))["addEventListener"](
  "click",
  closeProfileModal,
),
  document["getElementById"](_0x310701(0x148))[_0x310701(0x167)](
    "click",
    closeProfileModal,
  ),
  document[_0x310701(0x102)](_0x310701(0x1ba))[_0x310701(0x167)](
    _0x310701(0x12c),
    closeDeleteAccountModal,
  ),
  document[_0x310701(0x102)](_0x310701(0x115))["addEventListener"](
    _0x310701(0x12c),
    closeDeleteAccountModal,
  ),
  profileModal["addEventListener"](_0x310701(0x12c), (_0x434924) => {
    if (_0x434924["target"] === profileModal) closeProfileModal();
  }),
  deleteAccountModal[_0x310701(0x167)](_0x310701(0x12c), (_0x40dc4a) => {
    if (_0x40dc4a["target"] === deleteAccountModal) closeDeleteAccountModal();
  }),
  document["addEventListener"]("keydown", (_0x4debc5) => {
    const _0x5479c9 = _0x310701;
    _0x4debc5[_0x5479c9(0x10d)] === _0x5479c9(0x19f) &&
      (closeProfileModal(), closeDeleteAccountModal());
  }));
async function init() {
  const _0x209902 = _0x310701;
  ((currentUser = await getCurrentUser()), initUserNav(currentUser));
  const _0x322ade = debounce(() => {
    const _0x379e65 = _0x2a49;
    ((currentQuery = searchInput[_0x379e65(0x140)]),
      show(searchClearBtn, currentQuery["length"] > 0x0),
      (currentPage = 0x1),
      loadBooks());
  }, 0x12c);
  (searchInput["addEventListener"](_0x209902(0x197), _0x322ade),
    searchClearBtn["addEventListener"](_0x209902(0x12c), () => {
      const _0x1fbc04 = _0x209902;
      ((searchInput["value"] = ""),
        (currentQuery = ""),
        show(searchClearBtn, ![]),
        (currentPage = 0x1),
        loadBooks(),
        searchInput[_0x1fbc04(0x178)]());
    }),
    filterFavoritesBtn &&
      filterFavoritesBtn[_0x209902(0x167)]("click", () => {
        const _0x27fca2 = _0x209902;
        ((showingOnlyFavorites = !showingOnlyFavorites),
          filterFavoritesBtn[_0x27fca2(0x10b)][_0x27fca2(0x1a4)](
            "active",
            showingOnlyFavorites,
          ),
          (currentPage = 0x1),
          loadBooks());
      }),
    prevPageBtn["addEventListener"]("click", () => {
      const _0x813d44 = _0x209902;
      currentPage > 0x1 &&
        (currentPage--,
        loadBooks(),
        window["scrollTo"]({ top: 0x0, behavior: _0x813d44(0x170) }));
    }),
    nextPageBtn["addEventListener"](_0x209902(0x12c), () => {
      const _0x1a2638 = _0x209902;
      currentPage < totalPages &&
        (currentPage++,
        loadBooks(),
        window[_0x1a2638(0x106)]({ top: 0x0, behavior: "smooth" }));
    }),
    await loadCategories(),
    await loadBooks());
}
init();
