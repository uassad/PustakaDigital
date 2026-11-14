const _0x9ead12 = _0x4a38;
(function (_0x340d45, _0x2e3d1b) {
  const _0x374a00 = _0x4a38,
    _0x217508 = _0x340d45();
  while (!![]) {
    try {
      const _0x17dfd5 =
        parseInt(_0x374a00(0xf7)) / 0x1 +
        parseInt(_0x374a00(0x10c)) / 0x2 +
        (parseInt(_0x374a00(0x14d)) / 0x3) *
          (-parseInt(_0x374a00(0x135)) / 0x4) +
        (parseInt(_0x374a00(0x117)) / 0x5) *
          (parseInt(_0x374a00(0x147)) / 0x6) +
        parseInt(_0x374a00(0x11b)) / 0x7 +
        -parseInt(_0x374a00(0xdf)) / 0x8 +
        (-parseInt(_0x374a00(0xfe)) / 0x9) * (parseInt(_0x374a00(0x106)) / 0xa);
      if (_0x17dfd5 === _0x2e3d1b) break;
      else _0x217508["push"](_0x217508["shift"]());
    } catch (_0x3671e2) {
      _0x217508["push"](_0x217508["shift"]());
    }
  }
})(_0x18f6, 0x3987e);
import { api, ApiError, session } from "../../api.js";
import { el, clear, show, toast } from "../../dom.js";
import { logout, reloadOnBackForward } from "../../auth.js";
reloadOnBackForward();
const PAGE_SIZE = 0x14,
  CATEGORY_LABELS = {
    auth: _0x9ead12(0x11c),
    admin_book: _0x9ead12(0xf1),
    reader: "Aktivitas\x20Pembaca",
    security: _0x9ead12(0x114),
  },
  ACTION_LABELS = {
    register_started: _0x9ead12(0x122),
    register_failed: "Registrasi\x20gagal",
    register_verified: _0x9ead12(0x132),
    register_verify_failed: _0x9ead12(0xfd),
    login_success: "Login\x20berhasil",
    login_failed: "Login\x20gagal",
    logout: _0x9ead12(0xef),
    profile_update: "Ubah\x20profil",
    account_delete: _0x9ead12(0x118),
    book_create: _0x9ead12(0x156),
    book_update: _0x9ead12(0x13a),
    book_delete: _0x9ead12(0x12d),
    upload_files: _0x9ead12(0x12a),
    search: "Cari\x20buku",
    book_view: _0x9ead12(0x13f),
    pdf_read: _0x9ead12(0x14b),
    favorite_added: _0x9ead12(0x102),
    favorite_removed: "Hapus\x20favorit",
    rate_limited: _0x9ead12(0x111),
    access_denied: _0x9ead12(0x113),
    unauthorized_access: _0x9ead12(0x14f),
    invalid_upload: _0x9ead12(0x159),
    account_frozen: "Akun\x20dibekukan",
  },
  STATUS_LABELS = {
    success: _0x9ead12(0xd4),
    failed: _0x9ead12(0x144),
    blocked: _0x9ead12(0x10d),
  },
  STATUS_PILL = { success: "ok", failed: "warn", blocked: _0x9ead12(0xf9) };
let currentPage = 0x1,
  totalPages = 0x1;
const tbody = document[_0x9ead12(0x131)]("log-tbody"),
  logState = document[_0x9ead12(0x131)](_0x9ead12(0xf8)),
  pagination = document[_0x9ead12(0x131)](_0x9ead12(0x140)),
  prevBtn = document["getElementById"]("prev-page-btn"),
  nextBtn = document[_0x9ead12(0x131)](_0x9ead12(0xe1)),
  pageInfo = document["getElementById"](_0x9ead12(0xf2)),
  filtersForm = document["getElementById"](_0x9ead12(0x15a)),
  fCategory = document[_0x9ead12(0x131)](_0x9ead12(0x101)),
  fAction = document[_0x9ead12(0x131)](_0x9ead12(0xdc)),
  fStatus = document[_0x9ead12(0x131)](_0x9ead12(0x146)),
  fActor = document[_0x9ead12(0x131)]("f-actor"),
  fFrom = document[_0x9ead12(0x131)](_0x9ead12(0x157)),
  fTo = document[_0x9ead12(0x131)](_0x9ead12(0x100));
async function guardAdmin() {
  const _0x21b0b0 = _0x9ead12;
  if (!session[_0x21b0b0(0x103)])
    return (
      location["assign"](
        _0x21b0b0(0xe7)[_0x21b0b0(0x121)](
          encodeURIComponent(location[_0x21b0b0(0x129)]),
        ),
      ),
      new Promise(() => {})
    );
  let _0x161590;
  try {
    _0x161590 = await api(_0x21b0b0(0x108), { redirectOn401: ![] });
  } catch (_0x3c3786) {
    if (_0x3c3786 instanceof ApiError && _0x3c3786[_0x21b0b0(0x143)] === 0x191)
      return (
        location[_0x21b0b0(0xfc)](
          "/login?expired=1&next="[_0x21b0b0(0x121)](
            encodeURIComponent(location[_0x21b0b0(0x129)]),
          ),
        ),
        new Promise(() => {})
      );
    throw _0x3c3786;
  }
  if (
    !_0x161590 ||
    _0x161590["role"]?.[_0x21b0b0(0x138)]() !== _0x21b0b0(0x15d)
  )
    return (location[_0x21b0b0(0xfc)]("/"), new Promise(() => {}));
  return _0x161590;
}
function fillSelect(_0x4a8020, _0x407255) {
  const _0x517f1b = _0x9ead12;
  for (const [_0xbfbf54, _0x546b58] of Object["entries"](_0x407255)) {
    const _0x54986d = el("option", { value: _0xbfbf54 });
    ((_0x54986d[_0x517f1b(0xfb)] = _0x546b58), _0x4a8020["append"](_0x54986d));
  }
}
function formatTime(_0x2eb8e2) {
  const _0x3203c8 = _0x9ead12;
  if (!_0x2eb8e2) return "—";
  const _0x5bcabe = new Date(_0x2eb8e2);
  return Number[_0x3203c8(0xd9)](_0x5bcabe[_0x3203c8(0x11e)]())
    ? _0x2eb8e2
    : _0x5bcabe["toLocaleString"](_0x3203c8(0x125), {
        dateStyle: _0x3203c8(0x13b),
        timeStyle: "medium",
      });
}
function buildParams() {
  const _0x1444d9 = _0x9ead12,
    _0x914e09 = new URLSearchParams({
      page: String(currentPage),
      page_size: String(PAGE_SIZE),
    });
  if (fCategory[_0x1444d9(0x150)])
    _0x914e09[_0x1444d9(0xe9)](_0x1444d9(0x134), fCategory["value"]);
  if (fAction["value"])
    _0x914e09[_0x1444d9(0xe9)]("action", fAction[_0x1444d9(0x150)]);
  if (fStatus[_0x1444d9(0x150)])
    _0x914e09[_0x1444d9(0xe9)]("status", fStatus[_0x1444d9(0x150)]);
  if (fActor[_0x1444d9(0x150)]["trim"]())
    _0x914e09[_0x1444d9(0xe9)](
      "actor",
      fActor[_0x1444d9(0x150)][_0x1444d9(0x124)](),
    );
  if (fFrom[_0x1444d9(0x150)])
    _0x914e09[_0x1444d9(0xe9)](
      _0x1444d9(0xd6),
      new Date(""[_0x1444d9(0x121)](fFrom["value"], _0x1444d9(0x126)))[
        _0x1444d9(0x123)
      ](),
    );
  if (fTo[_0x1444d9(0x150)])
    _0x914e09[_0x1444d9(0xe9)](
      _0x1444d9(0xdd),
      new Date(""["concat"](fTo[_0x1444d9(0x150)], _0x1444d9(0x119)))[
        _0x1444d9(0x123)
      ](),
    );
  return _0x914e09;
}
function _0x18f6() {
  const _0x1164f9 = [
    "date_to",
    "div",
    "2819672rPLbsM",
    "path",
    "next-page-btn",
    "strong",
    "click",
    "preventDefault",
    "stringify",
    "method",
    "/login?next=",
    "modal-profile",
    "set",
    "actor",
    "details",
    "classList",
    "label",
    "by_category",
    "Logout",
    "Tidak\x20ada\x20log\x20yang\x20cocok\x20dengan\x20filter.",
    "Aksi\x20Admin\x20(Buku)",
    "page-info",
    "user_agent",
    "key",
    "append",
    "username",
    "115527vMBhOQ",
    "log-state",
    "frozen",
    "Dibekukan",
    "textContent",
    "assign",
    "Verifikasi\x20OTP\x20gagal",
    "28917Dlibjy",
    "Terjadi\x20kesalahan\x20saat\x20memuat\x20log.",
    "f-to",
    "f-category",
    "Tambah\x20favorit",
    "token",
    "close-profile-modal",
    "skeleton\x20skeleton-line",
    "530MJwiEH",
    "open",
    "/api/auth/me",
    "timestamp",
    "pre",
    "muted",
    "502944pWQHks",
    "Diblokir",
    "profile-phone",
    "items",
    "total",
    "Terkena\x20rate\x20limit",
    "submit",
    "Akses\x20ditolak",
    "Keamanan",
    "Gagal\x20memuat\x20log:\x20",
    "addEventListener",
    "121225BvMALT",
    "Hapus\x20akun",
    "T23:59:59.999",
    "profile-btn",
    "2113706Kcsbfc",
    "Autentikasi",
    "small",
    "getTime",
    "f-reset",
    "nomor_telepon",
    "concat",
    "Registrasi\x20dimulai",
    "toISOString",
    "trim",
    "id-ID",
    "T00:00:00",
    "email",
    "total_pages",
    "pathname",
    "Unggah\x20berkas\x20buku",
    "close-profile-button",
    "logout-btn",
    "Hapus\x20buku",
    "remove",
    "log-details",
    "/api/admin/logs?",
    "getElementById",
    "Registrasi\x20selesai\x20(OTP\x20benar)",
    "span",
    "category",
    "4xrJdNp",
    "profile-status",
    "role",
    "toLowerCase",
    "Lihat",
    "Ubah\x20buku",
    "medium",
    "keys",
    "reset",
    "profile-email",
    "Lihat\x20detail\x20buku",
    "pagination",
    "status-pill\x20",
    "Halaman\x20",
    "status",
    "Gagal",
    "target",
    "f-status",
    "24cMSJFK",
    "length",
    "f-refresh",
    "log-json",
    "Baca\x20PDF",
    "keydown",
    "22629KvbMxR",
    "Belum\x20ditambahkan",
    "Akses\x20admin\x20tanpa\x20login",
    "value",
    "message",
    "sum-",
    "Tamu\x20/\x20tidak\x20dikenal",
    "beku",
    "action",
    "Tambah\x20buku",
    "f-from",
    "log-time",
    "Upload\x20tidak\x20valid",
    "log-filters",
    "sum-total",
    "Escape",
    "administrator",
    "Berhasil",
    "focus",
    "date_from",
    "add",
    "\x20catatan\x20ditemukan.",
    "isNaN",
    "none",
    "summary",
    "f-action",
  ];
  _0x18f6 = function () {
    return _0x1164f9;
  };
  return _0x18f6();
}
function actorCell(_0x385a3f) {
  const _0x5e07a1 = _0x9ead12,
    _0x13e067 = el("td");
  if (!_0x385a3f)
    return (
      (_0x13e067[_0x5e07a1(0xfb)] = _0x5e07a1(0x153)),
      _0x13e067[_0x5e07a1(0xec)]["add"](_0x5e07a1(0x10b)),
      _0x13e067
    );
  if (_0x385a3f[_0x5e07a1(0xf6)]) {
    const _0xf362db = el(_0x5e07a1(0xe2));
    ((_0xf362db["textContent"] = _0x385a3f["username"]),
      _0x13e067[_0x5e07a1(0xf5)](_0xf362db));
    if (_0x385a3f[_0x5e07a1(0x137)]) {
      const _0x4a69dd = el(_0x5e07a1(0x11d), { class: _0x5e07a1(0x10b) });
      ((_0x4a69dd[_0x5e07a1(0xfb)] = _0x385a3f["role"]),
        _0x13e067[_0x5e07a1(0xf5)](el("br"), _0x4a69dd));
    }
  } else
    _0x13e067["textContent"] = _0x385a3f["id"]
      ? "ID\x20"[_0x5e07a1(0x121)](
          String(_0x385a3f["id"])["slice"](0x0, 0x8),
          "…",
        )
      : "—";
  return _0x13e067;
}
function _0x4a38(_0x43dc9f, _0x14774d) {
  _0x43dc9f = _0x43dc9f - 0xd4;
  const _0x18f629 = _0x18f6();
  let _0x4a3894 = _0x18f629[_0x43dc9f];
  return _0x4a3894;
}
function targetCell(_0x5764b6) {
  const _0x4dfb1a = _0x9ead12,
    _0x276928 = el("td");
  if (!_0x5764b6) return ((_0x276928[_0x4dfb1a(0xfb)] = "—"), _0x276928);
  const _0x2abccc = el(_0x4dfb1a(0x133));
  ((_0x2abccc[_0x4dfb1a(0xfb)] = _0x5764b6["label"] || _0x5764b6["id"] || "—"),
    _0x276928["append"](_0x2abccc));
  if (_0x5764b6["id"] && _0x5764b6[_0x4dfb1a(0xed)]) {
    const _0x149697 = el("small", { class: _0x4dfb1a(0x10b) });
    ((_0x149697[_0x4dfb1a(0xfb)] = String(_0x5764b6["id"])),
      _0x276928[_0x4dfb1a(0xf5)](el("br"), _0x149697));
  }
  return _0x276928;
}
function detailCell(_0x35f19d) {
  const _0x4c482d = _0x9ead12,
    _0x76b9bd = el("td"),
    _0x3ad3a6 = { ...(_0x35f19d[_0x4c482d(0xeb)] || {}) };
  if (_0x35f19d[_0x4c482d(0xe6)] || _0x35f19d[_0x4c482d(0xe0)])
    _0x3ad3a6["request"] = ""
      [_0x4c482d(0x121)](_0x35f19d["method"] || "", "\x20")
      [_0x4c482d(0x121)](_0x35f19d[_0x4c482d(0xe0)] || "")
      ["trim"]();
  if (_0x35f19d[_0x4c482d(0xf3)])
    _0x3ad3a6["user_agent"] = _0x35f19d[_0x4c482d(0xf3)];
  if (Object[_0x4c482d(0x13c)](_0x3ad3a6)[_0x4c482d(0x148)] === 0x0)
    return ((_0x76b9bd["textContent"] = "—"), _0x76b9bd);
  const _0x4f887f = el(_0x4c482d(0xdb));
  _0x4f887f["textContent"] = _0x4c482d(0x139);
  const _0x455759 = el(_0x4c482d(0x10a), { class: _0x4c482d(0x14a) });
  return (
    (_0x455759[_0x4c482d(0xfb)] = JSON[_0x4c482d(0xe5)](_0x3ad3a6, null, 0x2)),
    _0x76b9bd[_0x4c482d(0xf5)](
      el(_0x4c482d(0xeb), { class: _0x4c482d(0x12f) }, _0x4f887f, _0x455759),
    ),
    _0x76b9bd
  );
}
function renderRow(_0x39952f) {
  const _0x1548e1 = _0x9ead12,
    _0x134983 = el("td");
  _0x134983[_0x1548e1(0xfb)] =
    CATEGORY_LABELS[_0x39952f[_0x1548e1(0x134)]] || _0x39952f[_0x1548e1(0x134)];
  const _0xa084aa = el("td");
  _0xa084aa["textContent"] =
    ACTION_LABELS[_0x39952f[_0x1548e1(0x155)]] || _0x39952f[_0x1548e1(0x155)];
  const _0x4535c4 = el(_0x1548e1(0x133), {
    class: _0x1548e1(0x141)[_0x1548e1(0x121)](
      STATUS_PILL[_0x39952f[_0x1548e1(0x143)]] || _0x1548e1(0xda),
    ),
  });
  _0x4535c4[_0x1548e1(0xfb)] =
    STATUS_LABELS[_0x39952f["status"]] || _0x39952f["status"];
  const _0x5e5031 = el("td", { class: _0x1548e1(0x158) });
  _0x5e5031[_0x1548e1(0xfb)] = formatTime(_0x39952f[_0x1548e1(0x109)]);
  const _0x37e861 = el("td");
  return (
    (_0x37e861[_0x1548e1(0xfb)] = _0x39952f["ip"] || "—"),
    el(
      "tr",
      {},
      _0x5e5031,
      _0x134983,
      _0xa084aa,
      el("td", {}, _0x4535c4),
      actorCell(_0x39952f[_0x1548e1(0xea)]),
      targetCell(_0x39952f[_0x1548e1(0x145)]),
      _0x37e861,
      detailCell(_0x39952f),
    )
  );
}
function renderSkeleton(_0x261baa = 0x5) {
  const _0x3533a6 = _0x9ead12;
  for (let _0x3e0258 = 0x0; _0x3e0258 < _0x261baa; _0x3e0258++) {
    const _0x421966 = el("tr");
    for (let _0x117cf2 = 0x0; _0x117cf2 < 0x8; _0x117cf2++)
      _0x421966["append"](
        el("td", {}, el(_0x3533a6(0xde), { class: _0x3533a6(0x105) })),
      );
    tbody["append"](_0x421966);
  }
}
async function loadSummary() {
  const _0x2d5bac = _0x9ead12;
  try {
    const _0x12b317 = await api("/api/admin/logs/summary?hours=24");
    document[_0x2d5bac(0x131)](_0x2d5bac(0x15b))[_0x2d5bac(0xfb)] = String(
      _0x12b317[_0x2d5bac(0x110)],
    );
    for (const _0x2bd211 of Object[_0x2d5bac(0x13c)](CATEGORY_LABELS)) {
      document[_0x2d5bac(0x131)](_0x2d5bac(0x152)[_0x2d5bac(0x121)](_0x2bd211))[
        _0x2d5bac(0xfb)
      ] = String(_0x12b317[_0x2d5bac(0xee)][_0x2bd211] ?? 0x0);
    }
  } catch {}
}
async function loadLogs() {
  const _0x21a3f3 = _0x9ead12;
  (clear(tbody),
    renderSkeleton(),
    (logState[_0x21a3f3(0xfb)] = ""),
    show(pagination, ![]));
  try {
    const _0x28776f = await api(
      _0x21a3f3(0x130)[_0x21a3f3(0x121)](buildParams()["toString"]()),
    );
    (clear(tbody), (totalPages = _0x28776f[_0x21a3f3(0x128)] || 0x1));
    if (!_0x28776f[_0x21a3f3(0x10f)]["length"]) {
      logState["textContent"] = _0x21a3f3(0xf0);
      return;
    }
    (_0x28776f[_0x21a3f3(0x10f)]["forEach"]((_0x17d3a4) =>
      tbody[_0x21a3f3(0xf5)](renderRow(_0x17d3a4)),
    ),
      (logState[_0x21a3f3(0xfb)] = ""[_0x21a3f3(0x121)](
        _0x28776f["total"],
        _0x21a3f3(0xd8),
      )),
      totalPages > 0x1 &&
        (show(pagination, !![]),
        (pageInfo[_0x21a3f3(0xfb)] = _0x21a3f3(0x142)
          [_0x21a3f3(0x121)](currentPage, "\x20dari\x20")
          [_0x21a3f3(0x121)](totalPages)),
        (prevBtn["disabled"] = currentPage <= 0x1),
        (nextBtn["disabled"] = currentPage >= totalPages)));
  } catch (_0xcf73e0) {
    clear(tbody);
    const _0x4a57d8 =
      _0xcf73e0 instanceof ApiError
        ? _0xcf73e0[_0x21a3f3(0x151)]
        : _0x21a3f3(0xff);
    ((logState[_0x21a3f3(0xfb)] =
      _0x21a3f3(0x115)[_0x21a3f3(0x121)](_0x4a57d8)),
      toast(_0x4a57d8, !![]));
  }
}
function reload(_0x40b8d1 = !![]) {
  if (_0x40b8d1) currentPage = 0x1;
  return (loadSummary(), loadLogs());
}
async function init() {
  const _0x4091d5 = _0x9ead12,
    _0x1f0498 = await guardAdmin(),
    _0x79c7c1 = document["getElementById"]("admin-menu"),
    _0x141559 = document[_0x4091d5(0x131)](_0x4091d5(0xe8));
  ((document[_0x4091d5(0x131)]("profile-username")["textContent"] =
    _0x1f0498[_0x4091d5(0xf6)]),
    (document[_0x4091d5(0x131)](_0x4091d5(0x13e))[_0x4091d5(0xfb)] =
      _0x1f0498[_0x4091d5(0x127)]),
    (document[_0x4091d5(0x131)](_0x4091d5(0x10e))["textContent"] =
      _0x1f0498[_0x4091d5(0x120)] || _0x4091d5(0x14e)),
    (document[_0x4091d5(0x131)](_0x4091d5(0x136))["textContent"] =
      _0x1f0498["account_status"] === _0x4091d5(0x154)
        ? _0x4091d5(0xfa)
        : "Normal"));
  const _0x331c88 = () => _0x141559[_0x4091d5(0xec)][_0x4091d5(0x12e)]("open");
  (document[_0x4091d5(0x131)](_0x4091d5(0x11a))[_0x4091d5(0x116)](
    _0x4091d5(0xe3),
    () => {
      const _0x340d1b = _0x4091d5;
      ((_0x79c7c1[_0x340d1b(0x107)] = ![]),
        _0x141559["classList"][_0x340d1b(0xd7)](_0x340d1b(0x107)),
        document[_0x340d1b(0x131)](_0x340d1b(0x104))[_0x340d1b(0xd5)]());
    },
  ),
    document[_0x4091d5(0x131)](_0x4091d5(0x104))["addEventListener"](
      _0x4091d5(0xe3),
      _0x331c88,
    ),
    document[_0x4091d5(0x131)](_0x4091d5(0x12b))[_0x4091d5(0x116)](
      _0x4091d5(0xe3),
      _0x331c88,
    ),
    _0x141559[_0x4091d5(0x116)](_0x4091d5(0xe3), (_0x49189a) => {
      const _0x15a6fc = _0x4091d5;
      if (_0x49189a[_0x15a6fc(0x145)] === _0x141559) _0x331c88();
    }),
    document["addEventListener"](_0x4091d5(0x14c), (_0x133c1a) => {
      const _0x138dc2 = _0x4091d5;
      if (_0x133c1a[_0x138dc2(0xf4)] === _0x138dc2(0x15c)) _0x331c88();
    }),
    fillSelect(fCategory, CATEGORY_LABELS),
    fillSelect(fAction, ACTION_LABELS),
    fillSelect(fStatus, STATUS_LABELS),
    document["getElementById"](_0x4091d5(0x12c))[_0x4091d5(0x116)](
      "click",
      logout,
    ),
    filtersForm[_0x4091d5(0x116)](_0x4091d5(0x112), (_0x4f3993) => {
      const _0x37ffb8 = _0x4091d5;
      (_0x4f3993[_0x37ffb8(0xe4)](), reload());
    }),
    document[_0x4091d5(0x131)](_0x4091d5(0x11f))[_0x4091d5(0x116)](
      "click",
      () => {
        const _0xe02cb6 = _0x4091d5;
        (filtersForm[_0xe02cb6(0x13d)](), reload());
      },
    ),
    document[_0x4091d5(0x131)](_0x4091d5(0x149))[_0x4091d5(0x116)](
      _0x4091d5(0xe3),
      () => reload(![]),
    ),
    prevBtn[_0x4091d5(0x116)]("click", () => {
      currentPage > 0x1 && (currentPage--, loadLogs());
    }),
    nextBtn[_0x4091d5(0x116)]("click", () => {
      currentPage < totalPages && (currentPage++, loadLogs());
    }),
    await reload());
}
init();
