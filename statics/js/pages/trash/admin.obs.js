const _0x9716c8 = _0x9a04;
(function (_0x4b8986, _0x134e38) {
  const _0x2dc138 = _0x9a04,
    _0x53a52f = _0x4b8986();
  while (!![]) {
    try {
      const _0x46e8c9 =
        (-parseInt(_0x2dc138(0x1f4)) / 0x1) *
          (-parseInt(_0x2dc138(0x1cc)) / 0x2) +
        parseInt(_0x2dc138(0x22e)) / 0x3 +
        parseInt(_0x2dc138(0x231)) / 0x4 +
        (-parseInt(_0x2dc138(0x1e7)) / 0x5) *
          (parseInt(_0x2dc138(0x250)) / 0x6) +
        -parseInt(_0x2dc138(0x21b)) / 0x7 +
        parseInt(_0x2dc138(0x19f)) / 0x8 +
        -parseInt(_0x2dc138(0x20d)) / 0x9;
      if (_0x46e8c9 === _0x134e38) break;
      else _0x53a52f["push"](_0x53a52f["shift"]());
    } catch (_0x33d4f6) {
      _0x53a52f["push"](_0x53a52f["shift"]());
    }
  }
})(_0x4981, 0xc9c02);
import { api, ApiError, session } from "../../api.js";
import { el, clear, show, toast, debounce } from "../../dom.js";
function _0x9a04(_0x1df8a7, _0x2bca4f) {
  _0x1df8a7 = _0x1df8a7 - 0x19c;
  const _0x498188 = _0x4981();
  let _0x9a04ba = _0x498188[_0x1df8a7];
  return _0x9a04ba;
}
import { logout, reloadOnBackForward } from "../../auth.js";
reloadOnBackForward();
let currentPage = 0x1,
  totalPages = 0x1,
  currentSearch = "",
  currentUploadIsbn = "",
  isFrozen = ![],
  editingBookIsbn = "",
  pendingNewBookUpload = ![];
const logoutBtn = document[_0x9716c8(0x20c)](_0x9716c8(0x1e0)),
  profileBtn = document["getElementById"]("profile-btn"),
  adminMenu = document[_0x9716c8(0x20c)](_0x9716c8(0x1f6)),
  menuBookList = document[_0x9716c8(0x20c)](_0x9716c8(0x203)),
  frozenBanner = document["getElementById"]("frozen-banner"),
  statTotal = document[_0x9716c8(0x20c)]("stat-total"),
  statWithPdf = document[_0x9716c8(0x20c)](_0x9716c8(0x1d4)),
  adminSearch = document[_0x9716c8(0x20c)](_0x9716c8(0x1d9)),
  btnAddBook = document["getElementById"]("btn-add-book"),
  adminTbody = document[_0x9716c8(0x20c)](_0x9716c8(0x1e6)),
  tableState = document[_0x9716c8(0x20c)]("table-state"),
  pagination = document[_0x9716c8(0x20c)](_0x9716c8(0x217)),
  prevPageBtn = document[_0x9716c8(0x20c)](_0x9716c8(0x254)),
  nextPageBtn = document[_0x9716c8(0x20c)](_0x9716c8(0x1b9)),
  pageInfo = document[_0x9716c8(0x20c)](_0x9716c8(0x233)),
  modalAddBook = document[_0x9716c8(0x20c)]("modal-add-book"),
  closeAddModal = document[_0x9716c8(0x20c)](_0x9716c8(0x22b)),
  cancelAddModal = document[_0x9716c8(0x20c)](_0x9716c8(0x24f)),
  formAddBook = document[_0x9716c8(0x20c)]("form-add-book"),
  addIsbn = document[_0x9716c8(0x20c)](_0x9716c8(0x256)),
  addJudul = document[_0x9716c8(0x20c)](_0x9716c8(0x25a)),
  addKategori = document[_0x9716c8(0x20c)](_0x9716c8(0x212)),
  addPenulis = document[_0x9716c8(0x20c)]("add-penulis"),
  addPenerbit = document[_0x9716c8(0x20c)](_0x9716c8(0x1f7)),
  addTahun = document[_0x9716c8(0x20c)](_0x9716c8(0x1de)),
  addHalaman = document[_0x9716c8(0x20c)](_0x9716c8(0x1ed)),
  addSinopsis = document[_0x9716c8(0x20c)]("add-sinopsis"),
  addBookFiles = document[_0x9716c8(0x20c)](_0x9716c8(0x25e)),
  addCover = document["getElementById"](_0x9716c8(0x248)),
  addPdf = document[_0x9716c8(0x20c)](_0x9716c8(0x234)),
  addCoverFileName = document["getElementById"](_0x9716c8(0x239)),
  addPdfFileName = document[_0x9716c8(0x20c)](_0x9716c8(0x1db)),
  addCoverDropZone = document["getElementById"](_0x9716c8(0x260)),
  addPdfDropZone = document["getElementById"]("add-pdf-drop-zone"),
  addBookError = document[_0x9716c8(0x20c)]("add-book-error"),
  submitAddBook = document["getElementById"](_0x9716c8(0x225)),
  modalUpload = document[_0x9716c8(0x20c)]("modal-upload"),
  modalProfile = document[_0x9716c8(0x20c)](_0x9716c8(0x1c9)),
  closeUploadModal = document[_0x9716c8(0x20c)]("close-upload-modal"),
  cancelUploadModal = document[_0x9716c8(0x20c)](_0x9716c8(0x215)),
  formUpload = document[_0x9716c8(0x20c)](_0x9716c8(0x1af)),
  uploadIsbnField = document["getElementById"]("upload-isbn"),
  uploadCover = document[_0x9716c8(0x20c)](_0x9716c8(0x258)),
  uploadPdf = document["getElementById"](_0x9716c8(0x1b6)),
  coverFileName = document[_0x9716c8(0x20c)](_0x9716c8(0x1f2)),
  pdfFileName = document[_0x9716c8(0x20c)](_0x9716c8(0x1ba)),
  coverDropZone = document[_0x9716c8(0x20c)]("cover-drop-zone"),
  pdfDropZone = document[_0x9716c8(0x20c)](_0x9716c8(0x1a9)),
  uploadError = document[_0x9716c8(0x20c)](_0x9716c8(0x1a2)),
  uploadAnnouncement = document[_0x9716c8(0x20c)](_0x9716c8(0x1e4)),
  submitUpload = document[_0x9716c8(0x20c)](_0x9716c8(0x1b1));
function applyFrozenState(_0x407af6) {
  const _0x45b883 = _0x9716c8;
  ((isFrozen = _0x407af6),
    (submitAddBook[_0x45b883(0x1be)] = _0x407af6),
    (submitUpload[_0x45b883(0x1be)] = _0x407af6),
    document[_0x45b883(0x238)](_0x45b883(0x1cf))["forEach"]((_0x4c8041) => {
      _0x4c8041["disabled"] = _0x407af6;
    }));
  if (_0x407af6) {
    ((frozenBanner["hidden"] = ![]),
      frozenBanner["classList"][_0x45b883(0x20e)]("visible"));
    if (btnAddBook) btnAddBook[_0x45b883(0x1be)] = !![];
  } else {
    ((frozenBanner[_0x45b883(0x1b2)] = !![]),
      frozenBanner[_0x45b883(0x222)][_0x45b883(0x1a1)](_0x45b883(0x253)));
    if (btnAddBook) btnAddBook[_0x45b883(0x1be)] = ![];
  }
}
function showAnnouncement(_0x532595, _0x1daa34 = ![]) {
  const _0x3b1398 = _0x9716c8;
  ((uploadAnnouncement[_0x3b1398(0x1cd)] = _0x532595),
    uploadAnnouncement[_0x3b1398(0x222)][_0x3b1398(0x1b3)](
      _0x3b1398(0x202),
      _0x1daa34,
    ),
    uploadAnnouncement[_0x3b1398(0x222)][_0x3b1398(0x20e)](_0x3b1398(0x253)));
}
function hideAnnouncement() {
  const _0x1e8578 = _0x9716c8;
  ((uploadAnnouncement[_0x1e8578(0x1cd)] = ""),
    uploadAnnouncement[_0x1e8578(0x222)][_0x1e8578(0x1a1)](
      _0x1e8578(0x253),
      _0x1e8578(0x202),
    ));
}
function warnInvalidFileType(
  _0x514e60,
  _0x1b3d46,
  _0x450fd2,
  _0x3dca55 = uploadAnnouncement,
) {
  const _0x2a56bb = _0x9716c8;
  if (!_0x514e60) return;
  const _0xd497af = _0x514e60[_0x2a56bb(0x1d2)]
    [_0x2a56bb(0x20f)](".")
    ["pop"]()
    [_0x2a56bb(0x1e3)]();
  if (!_0x1b3d46["includes"](_0xd497af)) {
    const _0x28f217 = _0x2a56bb(0x246)
      ["concat"](_0x514e60[_0x2a56bb(0x1d2)], _0x2a56bb(0x22d))
      [_0x2a56bb(0x1c0)](_0x450fd2, _0x2a56bb(0x1e8))
      [_0x2a56bb(0x1c0)](
        _0x1b3d46["map"]((_0x4773ba) => "." + _0x4773ba)[_0x2a56bb(0x1ae)](
          ",\x20",
        ),
        _0x2a56bb(0x1a4),
      );
    if (_0x3dca55 === uploadAnnouncement) showAnnouncement(_0x28f217, !![]);
    else showModalError(_0x3dca55, _0x28f217);
  }
}
function setSubmitLoading(
  _0x3dbe87,
  _0x4fc05f,
  _0x3f50bf,
  _0x173dc9 = _0x9716c8(0x232),
) {
  const _0x12994e = _0x9716c8;
  ((_0x3dbe87["disabled"] = _0x4fc05f || isFrozen),
    (_0x3dbe87[_0x12994e(0x1cd)] = _0x4fc05f ? _0x173dc9 : _0x3f50bf));
}
function showModalError(_0x44dac2, _0x2029c4) {
  ((_0x44dac2["textContent"] = _0x2029c4), (_0x44dac2["hidden"] = ![]));
}
function hideModalError(_0xcc9d08) {
  const _0x31996b = _0x9716c8;
  ((_0xcc9d08["textContent"] = ""), (_0xcc9d08[_0x31996b(0x1b2)] = !![]));
}
function openModal(_0x38e1a7) {
  const _0x376b4e = _0x9716c8;
  _0x38e1a7["classList"][_0x376b4e(0x20e)](_0x376b4e(0x21e));
  const _0x10b9f6 = _0x38e1a7["querySelector"](_0x376b4e(0x23a));
  if (_0x10b9f6) _0x10b9f6["focus"]();
}
function closeModal(_0x4ccd53) {
  const _0x48ca93 = _0x9716c8;
  _0x4ccd53[_0x48ca93(0x222)][_0x48ca93(0x1a1)](_0x48ca93(0x21e));
}
function handleBackdropClick(_0x5612fe) {
  const _0x3c1a1b = _0x9716c8;
  if (_0x5612fe[_0x3c1a1b(0x220)] === _0x5612fe[_0x3c1a1b(0x241)])
    closeModal(_0x5612fe[_0x3c1a1b(0x241)]);
}
function handleKeydown(_0x12f2bc) {
  const _0x1ae9a2 = _0x9716c8;
  if (_0x12f2bc[_0x1ae9a2(0x22c)] === "Escape") {
    if (modalAddBook["classList"][_0x1ae9a2(0x1b5)](_0x1ae9a2(0x21e)))
      closeAddBookModal();
    if (modalUpload[_0x1ae9a2(0x222)][_0x1ae9a2(0x1b5)]("open"))
      closeModal(modalUpload);
    if (modalProfile[_0x1ae9a2(0x222)][_0x1ae9a2(0x1b5)]("open"))
      closeModal(modalProfile);
  }
}
function updateStats(_0x30933d) {
  const _0x537342 = _0x9716c8,
    _0x32dd04 = _0x30933d[_0x537342(0x1ef)] ?? 0x0,
    _0x42a71d = _0x30933d["items"]
      ? _0x30933d[_0x537342(0x1e9)][_0x537342(0x1fe)](
          (_0x259e47) => _0x259e47["has_pdf"],
        )[_0x537342(0x251)]
      : 0x0;
  ((statTotal[_0x537342(0x1cd)] = String(_0x32dd04)),
    (statWithPdf["textContent"] = String(_0x42a71d)));
}
async function loadStats() {
  const _0x429857 = _0x9716c8;
  try {
    const _0x173e45 = await api(_0x429857(0x1d3));
    ((statTotal[_0x429857(0x1cd)] = String(_0x173e45[_0x429857(0x229)] ?? 0x0)),
      (statWithPdf["textContent"] = String(
        _0x173e45[_0x429857(0x1bd)] ?? 0x0,
      )));
  } catch {
    toast("Statistik\x20buku\x20tidak\x20dapat\x20dimuat.", !![]);
  }
}
function statusPill(_0xc9c248, _0x1fe45d, _0x1f7661) {
  const _0x17d689 = _0x9716c8,
    _0x22bffc = el(_0x17d689(0x200), {
      class: _0xc9c248 ? _0x17d689(0x22a) : _0x17d689(0x1ce),
    });
  return (
    (_0x22bffc["textContent"] = _0xc9c248 ? _0x1fe45d : _0x1f7661),
    _0x22bffc
  );
}
function renderBookRow(_0x255555, _0x5e5422) {
  const _0x351c02 = _0x9716c8;
  let _0x3ac9a0;
  if (_0x255555[_0x351c02(0x1f3)] && _0x255555[_0x351c02(0x226)]) {
    const _0x484ded = el("img", {
      class: _0x351c02(0x1c6),
      src: _0x351c02(0x209)
        ["concat"](encodeURIComponent(_0x255555["isbn"]), _0x351c02(0x1fb))
        [_0x351c02(0x1c0)](encodeURIComponent(_0x255555["book_cover"] || "")),
      alt: _0x351c02(0x21a)["concat"](_0x255555[_0x351c02(0x1e2)]),
      loading: _0x351c02(0x19e),
    });
    _0x3ac9a0 = el("td", {}, _0x484ded);
  } else {
    const _0x4ece01 = el("div", { class: _0x351c02(0x1f0) });
    ((_0x4ece01["textContent"] = "📖"), (_0x3ac9a0 = el("td", {}, _0x4ece01)));
  }
  const _0x7f4828 = el("a", {
    class: _0x351c02(0x1f8),
    href: "#admin-books",
    "data-isbn": _0x255555[_0x351c02(0x1ee)],
  });
  _0x7f4828[_0x351c02(0x1cd)] = "Unggah\x20File";
  if (isFrozen) _0x7f4828["setAttribute"]("aria-disabled", _0x351c02(0x25b));
  _0x7f4828[_0x351c02(0x1c8)](_0x351c02(0x1ea), (_0xbd4fd4) => {
    const _0x320ac5 = _0x351c02;
    _0xbd4fd4[_0x320ac5(0x1aa)]();
    if (!isFrozen) openUploadModal(_0x255555["isbn"]);
  });
  const _0x346f1d = el(_0x351c02(0x24b), {
    class: _0x351c02(0x1f8),
    type: _0x351c02(0x24b),
  });
  ((_0x346f1d["textContent"] = _0x351c02(0x21f)),
    (_0x346f1d[_0x351c02(0x1be)] = isFrozen),
    _0x346f1d[_0x351c02(0x1c8)](_0x351c02(0x1ea), () =>
      openEditBookModal(_0x255555),
    ));
  const _0x561b9c = el(_0x351c02(0x24b), {
    class: _0x351c02(0x1f8),
    type: "button",
    "data-isbn": _0x255555["isbn"],
  });
  ((_0x561b9c["textContent"] = _0x351c02(0x211)),
    (_0x561b9c[_0x351c02(0x1be)] = isFrozen),
    _0x561b9c[_0x351c02(0x1c8)](_0x351c02(0x1ea), () =>
      handleDeleteBook(
        _0x255555[_0x351c02(0x1ee)],
        _0x255555[_0x351c02(0x1e2)],
      ),
    ));
  const _0x27ea46 = el(
      _0x351c02(0x219),
      { class: _0x351c02(0x1a8) },
      _0x7f4828,
      _0x346f1d,
      _0x561b9c,
    ),
    _0x3d892a = el("td"),
    _0x510ab7 = el(_0x351c02(0x1d7));
  _0x510ab7["textContent"] = _0x255555[_0x351c02(0x1e2)];
  const _0x299321 = el(_0x351c02(0x1d5), { class: _0x351c02(0x207) });
  ((_0x299321[_0x351c02(0x1cd)] = _0x255555["nama_penulis"] || "—"),
    _0x3d892a[_0x351c02(0x1df)](_0x510ab7, el("br"), _0x299321));
  const _0x14311d = el("td"),
    _0x4a3de6 = el(_0x351c02(0x23e));
  ((_0x4a3de6[_0x351c02(0x1cd)] = _0x255555[_0x351c02(0x1ee)]),
    _0x14311d[_0x351c02(0x1df)](_0x4a3de6));
  const _0x897bf5 = el("tr", { "data-isbn": _0x255555[_0x351c02(0x1ee)] }),
    _0x2ded3b = el("td");
  _0x2ded3b["textContent"] = String(_0x5e5422);
  const _0x25160f = el("td");
  _0x25160f[_0x351c02(0x1cd)] = _0x255555[_0x351c02(0x24e)] || "—";
  const _0x173f4b = el("td");
  _0x173f4b[_0x351c02(0x1cd)] = _0x255555[_0x351c02(0x249)]
    ? String(_0x255555[_0x351c02(0x249)])
    : "—";
  const _0x4ad680 = el(
      "td",
      {},
      statusPill(_0x255555[_0x351c02(0x23f)], _0x351c02(0x25c), "Belum\x20ada"),
    ),
    _0x29aa14 = el(
      "td",
      {},
      statusPill(_0x255555[_0x351c02(0x1f3)], "✓\x20Ada", _0x351c02(0x210)),
    ),
    _0x2cf9fb = el("td", {}, _0x27ea46);
  return (
    _0x897bf5[_0x351c02(0x1df)](
      _0x2ded3b,
      _0x3ac9a0,
      _0x3d892a,
      _0x14311d,
      _0x25160f,
      _0x173f4b,
      _0x4ad680,
      _0x29aa14,
      _0x2cf9fb,
    ),
    _0x897bf5
  );
}
function renderSkeletonRows(_0x10d938 = 0x5) {
  const _0x39ea6a = _0x9716c8;
  for (let _0x58c0de = 0x0; _0x58c0de < _0x10d938; _0x58c0de++) {
    const _0x111428 = el("tr");
    for (let _0x551290 = 0x0; _0x551290 < 0x9; _0x551290++) {
      const _0x24b403 = el("td"),
        _0x477bba = el("div", { class: _0x39ea6a(0x20a) });
      (_0x24b403[_0x39ea6a(0x1df)](_0x477bba),
        _0x111428[_0x39ea6a(0x1df)](_0x24b403));
    }
    adminTbody[_0x39ea6a(0x1df)](_0x111428);
  }
}
async function loadBooks() {
  const _0x24d248 = _0x9716c8;
  (clear(adminTbody),
    renderSkeletonRows(),
    (tableState[_0x24d248(0x1cd)] = ""),
    show(pagination, ![]));
  try {
    const _0x35daba = new URLSearchParams({
      page: String(currentPage),
      page_size: "15",
    });
    if (currentSearch[_0x24d248(0x1b8)]())
      _0x35daba["set"]("q", currentSearch[_0x24d248(0x1b8)]());
    const _0x5f4f30 = await api(
      "/api/admin/books?"[_0x24d248(0x1c0)](_0x35daba[_0x24d248(0x1bb)]()),
    );
    (clear(adminTbody), (totalPages = _0x5f4f30[_0x24d248(0x1a7)] || 0x1));
    const _0x24f959 = (currentPage - 0x1) * 0xf;
    statTotal[_0x24d248(0x1cd)] = String(_0x5f4f30["total"] ?? 0x0);
    const _0x5e4582 = (_0x5f4f30["items"] || [])[_0x24d248(0x1fe)](
      (_0x6fe443) => _0x6fe443[_0x24d248(0x23f)],
    )[_0x24d248(0x251)];
    statWithPdf[_0x24d248(0x1cd)] === "—" &&
      (statWithPdf["textContent"] = String(_0x5e4582));
    if (
      !_0x5f4f30[_0x24d248(0x1e9)] ||
      _0x5f4f30[_0x24d248(0x1e9)][_0x24d248(0x251)] === 0x0
    ) {
      ((tableState[_0x24d248(0x1cd)] = _0x24d248(0x1c7)),
        show(pagination, ![]));
      return;
    }
    (_0x5f4f30["items"][_0x24d248(0x23b)]((_0x5075ed, _0x1d7929) => {
      const _0x3dce8f = _0x24d248;
      adminTbody[_0x3dce8f(0x1df)](
        renderBookRow(_0x5075ed, _0x24f959 + _0x1d7929 + 0x1),
      );
    }),
      totalPages > 0x1
        ? (show(pagination, !![]),
          (pageInfo[_0x24d248(0x1cd)] = "Halaman\x20"
            [_0x24d248(0x1c0)](currentPage, _0x24d248(0x1fc))
            [_0x24d248(0x1c0)](totalPages)),
          (prevPageBtn[_0x24d248(0x1be)] = currentPage <= 0x1),
          (nextPageBtn[_0x24d248(0x1be)] = currentPage >= totalPages))
        : show(pagination, ![]));
  } catch (_0x4d2461) {
    clear(adminTbody);
    const _0x27cc35 =
      _0x4d2461 instanceof ApiError
        ? _0x4d2461["message"]
        : "Terjadi\x20kesalahan\x20saat\x20memuat\x20data\x20buku.";
    ((tableState[_0x24d248(0x1cd)] = "Gagal\x20memuat\x20buku:\x20"[
      _0x24d248(0x1c0)
    ](_0x27cc35)),
      _0x4d2461 instanceof ApiError &&
        _0x4d2461[_0x24d248(0x228)] === 0x193 &&
        /dibekukan/i[_0x24d248(0x208)](_0x4d2461[_0x24d248(0x1ad)]) &&
        applyFrozenState(!![]),
      toast(_0x24d248(0x259), !![]));
  }
}
async function loadCategories() {
  const _0x4fd633 = _0x9716c8;
  try {
    const _0x2a7efc = await api(_0x4fd633(0x1c5), { auth: ![] });
    while (addKategori["options"][_0x4fd633(0x251)] > 0x1)
      addKategori[_0x4fd633(0x1a1)](0x1);
    for (const _0x34c73e of _0x2a7efc) {
      const _0x360bac = el(_0x4fd633(0x21d), {
        value: String(_0x34c73e["id_kategori"]),
      });
      ((_0x360bac["textContent"] = _0x34c73e["kategori"]),
        addKategori[_0x4fd633(0x1df)](_0x360bac));
    }
  } catch {
    toast(_0x4fd633(0x1f9), !![]);
  }
}
function _0x4981() {
  const _0x4ad301 = [
    "/api/auth/me",
    "tahun_terbit",
    "682246vkknGb",
    "textContent",
    "status-pill\x20none",
    ".action-btns\x20button",
    "Klik\x20untuk\x20memilih\x20isi\x20buku\x20(.pdf)",
    "input",
    "name",
    "/api/admin/stats",
    "stat-with-pdf",
    "small",
    "tr[data-isbn=\x22",
    "strong",
    "Buku\x20Ditambahkan\x20—\x20Unggah\x20File",
    "admin-search",
    "DELETE",
    "add-pdf-file-name",
    "submit",
    "Normal",
    "add-tahun",
    "append",
    "logout-btn",
    "files",
    "judul_buku",
    "toLowerCase",
    "upload-announcement",
    "Semua\x20kolom\x20wajib\x20diisi\x20kecuali\x20sinopsis.",
    "admin-tbody",
    "8765whNogI",
    ".\x20Hanya\x20format\x20",
    "items",
    "click",
    "Tambah\x20Buku\x20Baru",
    "close-profile-modal",
    "add-halaman",
    "isbn",
    "total",
    "admin-cover-placeholder",
    "sinopsis",
    "cover-file-name",
    "has_cover",
    "3dMqQGs",
    "Buku\x20berhasil\x20ditambahkan.",
    "admin-menu",
    "add-penerbit",
    "btn\x20btn-sm",
    "Kategori\x20buku\x20tidak\x20dapat\x20dimuat.",
    "Gagal\x20menghapus\x20buku.",
    "/cover?v=",
    "\x20dari\x20",
    "confirm",
    "filter",
    "value",
    "span",
    "/update",
    "danger",
    "menu-book-list",
    "close-profile-button",
    "modal-add-title",
    "/api/admin/books",
    "muted",
    "test",
    "/api/books/",
    "skeleton\x20skeleton-line",
    "token",
    "getElementById",
    "21636783EZjxYC",
    "add",
    "split",
    "Belum\x20ada",
    "Hapus",
    "add-kategori",
    "nomor_telepon",
    "profile-email",
    "cancel-upload-modal",
    "username",
    "pagination",
    "nama_penulis",
    "div",
    "Sampul\x20",
    "4236386YrQoBr",
    "\x20Perbaiki\x20pilihan\x20file,\x20lalu\x20coba\x20lagi.",
    "option",
    "open",
    "Ubah",
    "target",
    "scrollTo",
    "classList",
    "Buku\x20\x22",
    "Klik\x20untuk\x20memilih\x20file\x20sampul\x20(.jpg)",
    "submit-add-book",
    "book_cover",
    "Menyimpan…",
    "status",
    "total_books",
    "status-pill\x20ok",
    "close-add-modal",
    "key",
    "\x22\x20tidak\x20valid\x20untuk\x20field\x20",
    "3708375KTpwXX",
    "id_kategori",
    "body",
    "4762856aSEeFR",
    "Memproses…",
    "page-info",
    "add-pdf",
    "Mengunggah…",
    "Isi\x20Buku\x20(PDF)",
    "administrator",
    "querySelectorAll",
    "add-cover-file-name",
    "button,\x20[href],\x20input,\x20select,\x20textarea",
    "forEach",
    "Buku\x20dan\x20file\x20berhasil\x20disimpan.",
    "role",
    "code",
    "has_pdf",
    "escape",
    "currentTarget",
    "Simpan\x20Perubahan",
    "Simpan\x20Buku",
    "Gagal\x20mengunggah\x20file.",
    "Akun\x20Anda\x20dibekukan.\x20Hubungi\x20administrator.",
    "Peringatan:\x20File\x20\x22",
    "querySelector",
    "add-cover",
    "jumlah_halaman",
    "Buku\x20tersimpan.\x20File\x20belum\x20diunggah;\x20gunakan\x20tombol\x20Unggah\x20File\x20pada\x20daftar\x20buku.",
    "button",
    "Unggah\x20File",
    "Gagal\x20menyimpan\x20buku.",
    "kategori_nama",
    "cancel-add-modal",
    "636FvZyWw",
    "length",
    "profile-phone",
    "visible",
    "prev-page-btn",
    "children",
    "add-isbn",
    "\x20berkas\x20gagal\x20dihapus\x20dari\x20folder\x20books.\x20Tutup\x20program\x20yang\x20membuka\x20berkas\x20itu\x20lalu\x20hapus\x20manual.",
    "upload-cover",
    "Gagal\x20memuat\x20daftar\x20buku.",
    "add-judul",
    "true",
    "✓\x20Ada",
    "profile-username",
    "add-book-files",
    "pathname",
    "add-cover-drop-zone",
    "Apakah\x20Anda\x20yakin\x20ingin\x20menghapus\x20buku\x20\x22",
    "files_failed",
    "lazy",
    "4570120eYpyIq",
    "/api/admin/books/",
    "remove",
    "upload-error",
    "smooth",
    "\x20yang\x20diizinkan.\x20Backend\x20akan\x20menolak\x20file\x20ini\x20dan\x20menghitungnya\x20dalam\x20batas\x204\x20percobaan\x20per\x20hari.",
    "Klik\x20untuk\x20memilih\x20sampul\x20(.jpg)",
    "Pilih\x20minimal\x20satu\x20file\x20untuk\x20diunggah\x20(Sampul\x20atau\x20PDF).",
    "total_pages",
    "action-btns",
    "pdf-drop-zone",
    "preventDefault",
    "File\x20berhasil\x20diunggah.",
    "assign",
    "message",
    "join",
    "form-upload",
    "POST",
    "submit-upload",
    "hidden",
    "toggle",
    "\x22\x20dihapus,\x20tetapi\x20",
    "contains",
    "upload-pdf",
    "jpg",
    "trim",
    "next-page-btn",
    "pdf-file-name",
    "toString",
    "reset",
    "books_with_pdf",
    "disabled",
    "pdf",
    "concat",
    "\x22\x20(ISBN:\x20",
    "account_status",
    "change",
    "Dibekukan",
    "/api/books/categories",
    "admin-cover-thumb",
    "Tidak\x20ada\x20buku\x20yang\x20cocok\x20dengan\x20pencarian\x20Anda.",
    "addEventListener",
    "modal-profile",
  ];
  _0x4981 = function () {
    return _0x4ad301;
  };
  return _0x4981();
}
async function openAddBookModal() {
  const _0x16aa46 = _0x9716c8;
  if (isFrozen) {
    toast(
      "Akun\x20Anda\x20dibekukan.\x20Tidak\x20dapat\x20menambah\x20buku.",
      !![],
    );
    return;
  }
  ((editingBookIsbn = ""),
    (addIsbn[_0x16aa46(0x1be)] = ![]),
    (document[_0x16aa46(0x20c)]("modal-add-title")[_0x16aa46(0x1cd)] =
      "Tambah\x20Buku\x20Baru"),
    (submitAddBook["textContent"] = _0x16aa46(0x243)),
    formAddBook["reset"](),
    (addBookFiles["hidden"] = ![]),
    (addCoverFileName[_0x16aa46(0x1cd)] = _0x16aa46(0x1a5)),
    (addPdfFileName[_0x16aa46(0x1cd)] =
      "Klik\x20untuk\x20memilih\x20isi\x20buku\x20(.pdf)"),
    hideModalError(addBookError),
    await loadCategories(),
    openModal(modalAddBook));
}
function closeAddBookModal() {
  const _0x545aa6 = _0x9716c8;
  (closeModal(modalAddBook),
    formAddBook[_0x545aa6(0x1bc)](),
    (editingBookIsbn = ""),
    (pendingNewBookUpload = ![]),
    (addIsbn[_0x545aa6(0x1be)] = ![]),
    (addBookFiles[_0x545aa6(0x1b2)] = ![]),
    (addCoverFileName[_0x545aa6(0x1cd)] =
      "Klik\x20untuk\x20memilih\x20sampul\x20(.jpg)"),
    (addPdfFileName["textContent"] = _0x545aa6(0x1d0)),
    (document[_0x545aa6(0x20c)](_0x545aa6(0x205))[_0x545aa6(0x1cd)] =
      _0x545aa6(0x1eb)),
    (submitAddBook[_0x545aa6(0x1cd)] = _0x545aa6(0x243)),
    hideModalError(addBookError));
}
async function openEditBookModal(_0x1d8628) {
  const _0x5f4bea = _0x9716c8;
  if (isFrozen) return;
  ((editingBookIsbn = _0x1d8628[_0x5f4bea(0x1ee)]),
    formAddBook[_0x5f4bea(0x1bc)](),
    (addIsbn[_0x5f4bea(0x1ff)] = _0x1d8628[_0x5f4bea(0x1ee)]),
    (addIsbn[_0x5f4bea(0x1be)] = !![]),
    (addJudul[_0x5f4bea(0x1ff)] = _0x1d8628["judul_buku"] || ""),
    (addPenulis[_0x5f4bea(0x1ff)] = _0x1d8628[_0x5f4bea(0x218)] || ""),
    (addPenerbit[_0x5f4bea(0x1ff)] = _0x1d8628["nama_penerbit"] || ""),
    (addTahun["value"] = _0x1d8628[_0x5f4bea(0x1cb)] || ""),
    (addHalaman[_0x5f4bea(0x1ff)] = String(_0x1d8628[_0x5f4bea(0x249)] || "")),
    (addSinopsis[_0x5f4bea(0x1ff)] = _0x1d8628[_0x5f4bea(0x1f1)] || ""),
    (addBookFiles["hidden"] = !![]),
    (document[_0x5f4bea(0x20c)](_0x5f4bea(0x205))["textContent"] =
      "Ubah\x20Informasi\x20Buku"),
    (submitAddBook[_0x5f4bea(0x1cd)] = _0x5f4bea(0x242)),
    hideModalError(addBookError),
    await loadCategories(),
    (addKategori[_0x5f4bea(0x1ff)] = String(_0x1d8628[_0x5f4bea(0x22f)])),
    openModal(modalAddBook));
}
async function handleAddBookSubmit(_0x3c7ecc) {
  const _0x441b03 = _0x9716c8;
  (_0x3c7ecc[_0x441b03(0x1aa)](), hideModalError(addBookError));
  const _0x2561fc = addIsbn[_0x441b03(0x1ff)]["trim"](),
    _0x58462c = addJudul["value"][_0x441b03(0x1b8)](),
    _0x3a24d3 = addKategori["value"],
    _0x38fa02 = addPenulis[_0x441b03(0x1ff)][_0x441b03(0x1b8)](),
    _0x55f60f = addPenerbit["value"][_0x441b03(0x1b8)](),
    _0x5b9e18 = addTahun[_0x441b03(0x1ff)][_0x441b03(0x1b8)](),
    _0x327cc4 = addHalaman[_0x441b03(0x1ff)][_0x441b03(0x1b8)](),
    _0x1e0c0e = addSinopsis[_0x441b03(0x1ff)][_0x441b03(0x1b8)](),
    _0x468f35 = addCover[_0x441b03(0x1e1)][0x0] || null,
    _0x2f8e92 = addPdf[_0x441b03(0x1e1)][0x0] || null;
  if (
    !_0x2561fc ||
    !_0x58462c ||
    !_0x3a24d3 ||
    !_0x38fa02 ||
    !_0x55f60f ||
    !_0x5b9e18 ||
    !_0x327cc4
  ) {
    showModalError(addBookError, _0x441b03(0x1e5));
    return;
  }
  const _0x4ceb9d = {
    judul_buku: _0x58462c,
    id_kategori: parseInt(_0x3a24d3, 0xa),
    nama_penulis: _0x38fa02,
    nama_penerbit: _0x55f60f,
    tahun_terbit: String(parseInt(_0x5b9e18, 0xa)),
    jumlah_halaman: parseInt(_0x327cc4, 0xa),
  };
  _0x4ceb9d[_0x441b03(0x1f1)] = _0x1e0c0e;
  const _0x303475 = Boolean(editingBookIsbn);
  let _0x344c4b = ![];
  setSubmitLoading(
    submitAddBook,
    !![],
    pendingNewBookUpload
      ? _0x441b03(0x24c)
      : _0x303475
        ? _0x441b03(0x242)
        : _0x441b03(0x243),
    _0x441b03(0x227),
  );
  try {
    editingBookIsbn
      ? await api(
          _0x441b03(0x1a0)[_0x441b03(0x1c0)](
            encodeURIComponent(editingBookIsbn),
            _0x441b03(0x201),
          ),
          { method: _0x441b03(0x1b0), json: _0x4ceb9d },
        )
      : (await api(_0x441b03(0x206), {
          method: "POST",
          json: { ..._0x4ceb9d, isbn: _0x2561fc },
        }),
        (_0x344c4b = !![]),
        (editingBookIsbn = _0x2561fc),
        (addIsbn[_0x441b03(0x1be)] = !![]));
    if (_0x468f35 || _0x2f8e92) {
      setSubmitLoading(submitAddBook, !![], "Unggah\x20File", _0x441b03(0x235));
      try {
        await uploadBookFiles(
          editingBookIsbn,
          _0x468f35,
          _0x2f8e92,
          addBookError,
        );
      } catch (_0x42b08e) {
        const _0x1adaa9 =
          _0x42b08e instanceof ApiError
            ? _0x42b08e[_0x441b03(0x1ad)]
            : "Terjadi\x20kesalahan\x20saat\x20mengunggah\x20file.";
        if (
          _0x42b08e instanceof ApiError &&
          _0x42b08e[_0x441b03(0x228)] === 0x193
        )
          applyFrozenState(!![]);
        _0x344c4b &&
          ((pendingNewBookUpload = !![]),
          (addBookFiles[_0x441b03(0x1b2)] = ![]),
          (document["getElementById"](_0x441b03(0x205))["textContent"] =
            _0x441b03(0x1d8)));
        (showModalError(
          addBookError,
          ""
            [
              _0x441b03(0x1c0)
            ](_0x344c4b ? "Buku\x20berhasil\x20ditambahkan,\x20tetapi\x20file\x20gagal\x20diunggah." : "Informasi\x20buku\x20tersimpan,\x20tetapi\x20file\x20gagal\x20diunggah.", "\x20")
            [_0x441b03(0x1c0)](_0x1adaa9, _0x441b03(0x21c)),
        ),
          toast(_0x1adaa9, !![]),
          (currentPage = 0x1),
          await loadBooks(),
          await loadStats());
        return;
      }
    }
    const _0x1286de = pendingNewBookUpload;
    (closeAddBookModal(),
      toast(
        _0x468f35 || _0x2f8e92
          ? _0x441b03(0x23c)
          : _0x1286de
            ? _0x441b03(0x24a)
            : _0x303475
              ? "Informasi\x20buku\x20berhasil\x20diubah."
              : _0x441b03(0x1f5),
      ),
      (currentPage = 0x1),
      await loadBooks(),
      await loadStats());
  } catch (_0x53e56f) {
    const _0x72bc1d =
      _0x53e56f instanceof ApiError ? _0x53e56f["message"] : _0x441b03(0x24d);
    (showModalError(addBookError, _0x72bc1d), toast(_0x72bc1d, !![]));
  } finally {
    setSubmitLoading(
      submitAddBook,
      ![],
      pendingNewBookUpload
        ? _0x441b03(0x24c)
        : editingBookIsbn
          ? _0x441b03(0x242)
          : _0x441b03(0x243),
    );
  }
}
async function uploadBookFiles(
  _0x2040b7,
  _0x5d57eb,
  _0x513089,
  _0x4699fc = uploadAnnouncement,
) {
  const _0x3049bf = _0x9716c8;
  (warnInvalidFileType(
    _0x5d57eb,
    [_0x3049bf(0x1b7)],
    "Sampul\x20Buku",
    _0x4699fc,
  ),
    warnInvalidFileType(
      _0x513089,
      [_0x3049bf(0x1bf)],
      _0x3049bf(0x236),
      _0x4699fc,
    ));
  const _0x58858b = new FormData();
  if (_0x5d57eb) _0x58858b[_0x3049bf(0x1df)]("cover", _0x5d57eb);
  if (_0x513089) _0x58858b[_0x3049bf(0x1df)](_0x3049bf(0x230), _0x513089);
  await api(
    _0x3049bf(0x209)[_0x3049bf(0x1c0)](
      encodeURIComponent(_0x2040b7),
      "/upload-files",
    ),
    { method: _0x3049bf(0x1b0), form: _0x58858b },
  );
}
function openUploadModal(_0x10ef8f) {
  const _0x4614a7 = _0x9716c8;
  if (isFrozen) return;
  ((currentUploadIsbn = _0x10ef8f),
    (uploadIsbnField[_0x4614a7(0x1ff)] = _0x10ef8f),
    formUpload[_0x4614a7(0x1bc)](),
    (coverFileName[_0x4614a7(0x1cd)] = _0x4614a7(0x224)),
    (pdfFileName[_0x4614a7(0x1cd)] =
      "Klik\x20untuk\x20memilih\x20file\x20PDF\x20(.pdf)"),
    hideAnnouncement(),
    hideModalError(uploadError),
    openModal(modalUpload));
}
function closeUploadModalFn() {
  (closeModal(modalUpload),
    formUpload["reset"](),
    hideAnnouncement(),
    hideModalError(uploadError),
    (currentUploadIsbn = ""));
}
async function handleUploadSubmit(_0x132229) {
  const _0x473387 = _0x9716c8;
  (_0x132229[_0x473387(0x1aa)](),
    hideAnnouncement(),
    hideModalError(uploadError));
  const _0x37ea37 = uploadCover[_0x473387(0x1e1)][0x0] || null,
    _0x14812c = uploadPdf[_0x473387(0x1e1)][0x0] || null;
  if (!_0x37ea37 && !_0x14812c) {
    showModalError(uploadError, _0x473387(0x1a6));
    return;
  }
  setSubmitLoading(submitUpload, !![], _0x473387(0x24c), _0x473387(0x235));
  try {
    const _0x3e58ae = currentUploadIsbn || uploadIsbnField[_0x473387(0x1ff)];
    (await uploadBookFiles(_0x3e58ae, _0x37ea37, _0x14812c),
      closeUploadModalFn(),
      toast(_0x473387(0x1ab)),
      await loadBooks());
  } catch (_0x1525cf) {
    if (_0x1525cf instanceof ApiError) {
      if (_0x1525cf[_0x473387(0x228)] === 0x193)
        (applyFrozenState(!![]),
          showAnnouncement(
            "🔒\x20Akun\x20Anda\x20telah\x20dibekukan\x20karena\x20percobaan\x20mengunggah\x20file\x20dengan\x20format\x20yang\x20tidak\x20diizinkan\x20berulang\x20kali.\x20Semua\x20fitur\x20unggah\x20telah\x20dinonaktifkan.",
            !![],
          ),
          toast(_0x473387(0x245), !![]));
      else {
        const _0x1e6766 = _0x1525cf["message"] || _0x473387(0x244);
        if (_0x1525cf[_0x473387(0x228)] === 0x190)
          showAnnouncement(_0x1e6766, !![]);
        else showModalError(uploadError, _0x1e6766);
        toast(_0x1e6766, !![]);
      }
    } else
      (showModalError(
        uploadError,
        "Terjadi\x20kesalahan\x20saat\x20mengunggah\x20file.",
      ),
        toast(_0x473387(0x244), !![]));
  } finally {
    setSubmitLoading(submitUpload, ![], "Unggah\x20File");
  }
}
async function handleDeleteBook(_0x4ed534, _0x1d09ad) {
  const _0x52b3d3 = _0x9716c8,
    _0x14964d = window[_0x52b3d3(0x1fd)](
      _0x52b3d3(0x19c)
        [_0x52b3d3(0x1c0)](_0x1d09ad, _0x52b3d3(0x1c1))
        [
          _0x52b3d3(0x1c0)
        ](_0x4ed534, ")?\x0a\x0aTindakan\x20ini\x20tidak\x20dapat\x20dibatalkan."),
    );
  if (!_0x14964d) return;
  try {
    const _0x41158f = await api(
        _0x52b3d3(0x1a0)["concat"](encodeURIComponent(_0x4ed534)),
        { method: _0x52b3d3(0x1da) },
      ),
      _0x12fde2 = adminTbody[_0x52b3d3(0x247)](
        _0x52b3d3(0x1d6)[_0x52b3d3(0x1c0)](
          CSS[_0x52b3d3(0x240)](_0x4ed534),
          "\x22]",
        ),
      );
    if (_0x12fde2) _0x12fde2[_0x52b3d3(0x1a1)]();
    _0x41158f &&
    _0x41158f["files_failed"] &&
    _0x41158f[_0x52b3d3(0x19d)][_0x52b3d3(0x251)]
      ? toast(
          _0x52b3d3(0x223)
            [_0x52b3d3(0x1c0)](_0x1d09ad, _0x52b3d3(0x1b4))
            ["concat"](_0x41158f[_0x52b3d3(0x19d)]["length"], _0x52b3d3(0x257)),
          !![],
        )
      : toast(
          "Buku\x20\x22"[_0x52b3d3(0x1c0)](
            _0x1d09ad,
            "\x22\x20dan\x20berkas\x20PDF/sampulnya\x20berhasil\x20dihapus.",
          ),
        );
    await loadStats();
    if (adminTbody[_0x52b3d3(0x255)][_0x52b3d3(0x251)] === 0x0) {
      if (currentPage > 0x1) currentPage--;
      await loadBooks();
    }
  } catch (_0x5db632) {
    const _0x5a3b0a =
      _0x5db632 instanceof ApiError
        ? _0x5db632[_0x52b3d3(0x1ad)]
        : _0x52b3d3(0x1fa);
    toast(_0x5a3b0a, !![]);
  }
}
async function guardAdmin() {
  const _0x52ced0 = _0x9716c8;
  if (!session[_0x52ced0(0x20b)])
    return (
      location[_0x52ced0(0x1ac)](
        "/login?next="[_0x52ced0(0x1c0)](
          encodeURIComponent(location[_0x52ced0(0x25f)]),
        ),
      ),
      new Promise(() => {})
    );
  let _0x51d67b;
  try {
    _0x51d67b = await api(_0x52ced0(0x1ca), { redirectOn401: ![] });
  } catch (_0x118a84) {
    if (_0x118a84 instanceof ApiError && _0x118a84[_0x52ced0(0x228)] === 0x191)
      return (
        location[_0x52ced0(0x1ac)](
          "/login?expired=1&next="[_0x52ced0(0x1c0)](
            encodeURIComponent(location[_0x52ced0(0x25f)]),
          ),
        ),
        new Promise(() => {})
      );
    throw _0x118a84;
  }
  if (
    !_0x51d67b ||
    _0x51d67b[_0x52ced0(0x23d)]?.[_0x52ced0(0x1e3)]() !== _0x52ced0(0x237)
  )
    return (location[_0x52ced0(0x1ac)]("/"), new Promise(() => {}));
  return _0x51d67b;
}
async function init() {
  const _0x4697e6 = _0x9716c8,
    _0x378231 = await guardAdmin();
  _0x378231["account_status"] === "beku" && applyFrozenState(!![]);
  ((document[_0x4697e6(0x20c)](_0x4697e6(0x25d))[_0x4697e6(0x1cd)] =
    _0x378231[_0x4697e6(0x216)]),
    (document[_0x4697e6(0x20c)](_0x4697e6(0x214))[_0x4697e6(0x1cd)] =
      _0x378231["email"]),
    (document[_0x4697e6(0x20c)](_0x4697e6(0x252))[_0x4697e6(0x1cd)] =
      _0x378231[_0x4697e6(0x213)] || "Belum\x20ditambahkan"),
    (document[_0x4697e6(0x20c)]("profile-status")[_0x4697e6(0x1cd)] =
      _0x378231[_0x4697e6(0x1c2)] === "beku"
        ? _0x4697e6(0x1c4)
        : _0x4697e6(0x1dd)),
    logoutBtn["addEventListener"]("click", logout),
    menuBookList[_0x4697e6(0x1c8)](_0x4697e6(0x1ea), () => {
      const _0x105042 = _0x4697e6;
      adminMenu[_0x105042(0x21e)] = ![];
    }),
    profileBtn["addEventListener"]("click", () => {
      const _0x2ccd55 = _0x4697e6;
      ((adminMenu[_0x2ccd55(0x21e)] = ![]), openModal(modalProfile));
    }),
    document[_0x4697e6(0x20c)](_0x4697e6(0x1ec))[_0x4697e6(0x1c8)](
      _0x4697e6(0x1ea),
      () => closeModal(modalProfile),
    ),
    document["getElementById"](_0x4697e6(0x204))[_0x4697e6(0x1c8)](
      _0x4697e6(0x1ea),
      () => closeModal(modalProfile),
    ),
    modalProfile[_0x4697e6(0x1c8)](_0x4697e6(0x1ea), handleBackdropClick),
    btnAddBook["addEventListener"]("click", openAddBookModal),
    addCoverDropZone[_0x4697e6(0x1c8)](_0x4697e6(0x1ea), () =>
      addCover["click"](),
    ),
    addPdfDropZone["addEventListener"](_0x4697e6(0x1ea), () =>
      addPdf[_0x4697e6(0x1ea)](),
    ),
    addCover[_0x4697e6(0x1c8)](_0x4697e6(0x1c3), () => {
      const _0x91cf35 = _0x4697e6,
        _0x5616f8 = addCover[_0x91cf35(0x1e1)][0x0];
      ((addCoverFileName[_0x91cf35(0x1cd)] = _0x5616f8
        ? _0x5616f8[_0x91cf35(0x1d2)]
        : _0x91cf35(0x1a5)),
        hideModalError(addBookError));
    }),
    addPdf[_0x4697e6(0x1c8)](_0x4697e6(0x1c3), () => {
      const _0x2c138d = _0x4697e6,
        _0x1b82a0 = addPdf[_0x2c138d(0x1e1)][0x0];
      ((addPdfFileName["textContent"] = _0x1b82a0
        ? _0x1b82a0[_0x2c138d(0x1d2)]
        : _0x2c138d(0x1d0)),
        hideModalError(addBookError));
    }),
    closeAddModal[_0x4697e6(0x1c8)](_0x4697e6(0x1ea), closeAddBookModal),
    cancelAddModal[_0x4697e6(0x1c8)](_0x4697e6(0x1ea), closeAddBookModal),
    modalAddBook[_0x4697e6(0x1c8)](_0x4697e6(0x1ea), (_0x3604f6) => {
      if (_0x3604f6["target"] === modalAddBook) closeAddBookModal();
    }),
    formAddBook[_0x4697e6(0x1c8)](_0x4697e6(0x1dc), handleAddBookSubmit),
    closeUploadModal["addEventListener"]("click", closeUploadModalFn),
    cancelUploadModal[_0x4697e6(0x1c8)](_0x4697e6(0x1ea), closeUploadModalFn),
    modalUpload[_0x4697e6(0x1c8)](_0x4697e6(0x1ea), handleBackdropClick),
    formUpload[_0x4697e6(0x1c8)](_0x4697e6(0x1dc), handleUploadSubmit),
    coverDropZone[_0x4697e6(0x1c8)]("click", () =>
      uploadCover[_0x4697e6(0x1ea)](),
    ),
    pdfDropZone["addEventListener"](_0x4697e6(0x1ea), () =>
      uploadPdf[_0x4697e6(0x1ea)](),
    ),
    uploadCover["addEventListener"](_0x4697e6(0x1c3), () => {
      const _0x41f415 = _0x4697e6,
        _0x1f199f = uploadCover[_0x41f415(0x1e1)][0x0];
      ((coverFileName["textContent"] = _0x1f199f
        ? _0x1f199f[_0x41f415(0x1d2)]
        : "Klik\x20untuk\x20memilih\x20file\x20sampul\x20(.jpg)"),
        hideAnnouncement());
    }),
    uploadPdf[_0x4697e6(0x1c8)]("change", () => {
      const _0x34375b = _0x4697e6,
        _0x4e9d39 = uploadPdf[_0x34375b(0x1e1)][0x0];
      ((pdfFileName[_0x34375b(0x1cd)] = _0x4e9d39
        ? _0x4e9d39["name"]
        : "Klik\x20untuk\x20memilih\x20file\x20PDF\x20(.pdf)"),
        hideAnnouncement());
    }));
  const _0x429785 = debounce(() => {
    const _0x43bcef = _0x4697e6;
    ((currentSearch = adminSearch[_0x43bcef(0x1ff)]),
      (currentPage = 0x1),
      loadBooks());
  }, 0x190);
  (adminSearch[_0x4697e6(0x1c8)](_0x4697e6(0x1d1), _0x429785),
    prevPageBtn[_0x4697e6(0x1c8)](_0x4697e6(0x1ea), () => {
      const _0x59ad14 = _0x4697e6;
      currentPage > 0x1 &&
        (currentPage--,
        loadBooks(),
        window["scrollTo"]({ top: 0x0, behavior: _0x59ad14(0x1a3) }));
    }),
    nextPageBtn[_0x4697e6(0x1c8)]("click", () => {
      const _0x3e4f4d = _0x4697e6;
      currentPage < totalPages &&
        (currentPage++,
        loadBooks(),
        window[_0x3e4f4d(0x221)]({ top: 0x0, behavior: _0x3e4f4d(0x1a3) }));
    }),
    document[_0x4697e6(0x1c8)]("keydown", handleKeydown),
    await loadStats(),
    await loadBooks());
}
init();
