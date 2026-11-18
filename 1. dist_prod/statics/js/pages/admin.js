const _0x222c87 = _0x2931;
(function (_0x152143, _0x33b7af) {
  const _0x1556b6 = _0x2931,
    _0x1e2038 = _0x152143();
  while (!![]) {
    try {
      const _0x1b23e9 =
        -parseInt(_0x1556b6(0x249)) / 0x1 +
        -parseInt(_0x1556b6(0x1ba)) / 0x2 +
        (-parseInt(_0x1556b6(0x262)) / 0x3) *
          (parseInt(_0x1556b6(0x172)) / 0x4) +
        -parseInt(_0x1556b6(0x1a7)) / 0x5 +
        (parseInt(_0x1556b6(0x2a0)) / 0x6) *
          (parseInt(_0x1556b6(0x29c)) / 0x7) +
        (-parseInt(_0x1556b6(0x15c)) / 0x8) *
          (-parseInt(_0x1556b6(0x1fe)) / 0x9) +
        parseInt(_0x1556b6(0x1cf)) / 0xa;
      if (_0x1b23e9 === _0x33b7af) break;
      else _0x1e2038["push"](_0x1e2038["shift"]());
    } catch (_0x29b7d8) {
      _0x1e2038["push"](_0x1e2038["shift"]());
    }
  }
})(_0x1891, 0x19c81);
import { api, ApiError, session } from "../api.js";
import { el, clear, show, toast, debounce } from "../dom.js";
import { logout, reloadOnBackForward } from "../auth.js";
reloadOnBackForward();
let currentPage = 0x1,
  totalPages = 0x1,
  currentSearch = "",
  currentUploadIsbn = "",
  isFrozen = ![],
  editingBookIsbn = "",
  pendingNewBookUpload = ![];
const logoutBtn = document[_0x222c87(0x16b)](_0x222c87(0x27a)),
  profileBtn = document[_0x222c87(0x16b)](_0x222c87(0x284)),
  adminMenu = document[_0x222c87(0x16b)](_0x222c87(0x242)),
  menuBookList = document[_0x222c87(0x16b)]("menu-book-list"),
  frozenBanner = document[_0x222c87(0x16b)](_0x222c87(0x21c)),
  statTotal = document[_0x222c87(0x16b)](_0x222c87(0x221)),
  statWithPdf = document[_0x222c87(0x16b)](_0x222c87(0x265)),
  adminSearch = document["getElementById"](_0x222c87(0x235)),
  btnAddBook = document[_0x222c87(0x16b)](_0x222c87(0x21e)),
  adminTbody = document[_0x222c87(0x16b)](_0x222c87(0x270)),
  tableState = document[_0x222c87(0x16b)](_0x222c87(0x15d)),
  oeguma = document["getElementById"](_0x222c87(0x2ac)),
  prevPageBtn = document["getElementById"]("prev-page-btn"),
  nextPageBtn = document["getElementById"](_0x222c87(0x1ce)),
  pageInfo = document[_0x222c87(0x16b)](_0x222c87(0x217)),
  modalAddBook = document[_0x222c87(0x16b)](_0x222c87(0x1ae)),
  closeAddModal = document[_0x222c87(0x16b)](_0x222c87(0x2b6)),
  cancelAddModal = document["getElementById"](_0x222c87(0x241)),
  formAddBook = document[_0x222c87(0x16b)](_0x222c87(0x1e8)),
  addIsbn = document["getElementById"](_0x222c87(0x19a)),
  addJudul = document["getElementById"](_0x222c87(0x268)),
  addKategori = document[_0x222c87(0x16b)](_0x222c87(0x2b1)),
  addPenulis = document[_0x222c87(0x16b)](_0x222c87(0x158)),
  addPenerbit = document["getElementById"](_0x222c87(0x183)),
  addTahun = document[_0x222c87(0x16b)]("add-tahun"),
  addHalaman = document[_0x222c87(0x16b)](_0x222c87(0x167)),
  addSinopsis = document[_0x222c87(0x16b)](_0x222c87(0x276)),
  addBookFiles = document[_0x222c87(0x16b)]("add-book-files"),
  addCover = document["getElementById"](_0x222c87(0x17f)),
  addPdf = document[_0x222c87(0x16b)](_0x222c87(0x1b8)),
  addCoverFileName = document[_0x222c87(0x16b)](_0x222c87(0x2c6)),
  addPdfFileName = document["getElementById"](_0x222c87(0x160)),
  addCoverDropZone = document[_0x222c87(0x16b)](_0x222c87(0x23d)),
  addPdfDropZone = document[_0x222c87(0x16b)](_0x222c87(0x256)),
  addBookError = document["getElementById"](_0x222c87(0x1e4)),
  submitAddBook = document[_0x222c87(0x16b)](_0x222c87(0x2cb)),
  modalUpload = document[_0x222c87(0x16b)]("modal-upload"),
  modalProfile = document[_0x222c87(0x16b)](_0x222c87(0x22a)),
  closeUploadModal = document[_0x222c87(0x16b)](_0x222c87(0x1d9)),
  cancelUploadModal = document[_0x222c87(0x16b)](_0x222c87(0x16e)),
  formUpload = document[_0x222c87(0x16b)](_0x222c87(0x195)),
  uploadIsbnField = document["getElementById"](_0x222c87(0x155)),
  uploadCover = document[_0x222c87(0x16b)]("upload-cover"),
  uploadPdf = document[_0x222c87(0x16b)](_0x222c87(0x1d7)),
  coverFileName = document[_0x222c87(0x16b)](_0x222c87(0x1de)),
  pdfFileName = document[_0x222c87(0x16b)](_0x222c87(0x153)),
  coverDropZone = document[_0x222c87(0x16b)]("cover-drop-zone"),
  pdfDropZone = document["getElementById"](_0x222c87(0x198)),
  uploadError = document[_0x222c87(0x16b)](_0x222c87(0x23b)),
  uploadAnnouncement = document[_0x222c87(0x16b)]("upload-announcement"),
  submitUpload = document["getElementById"]("submit-upload");
function applyFrozenState(_0x30964f) {
  const _0x2f9ac2 = _0x222c87,
    _0x466480 = {
      IoTAw: "4|1|2|3|0",
      ModVW: _0x2f9ac2(0x277),
      gxIJW: _0x2f9ac2(0x19c),
    },
    _0x5d8bda = _0x466480["IoTAw"][_0x2f9ac2(0x2aa)]("|");
  let _0x3f9c3c = 0x0;
  while (!![]) {
    switch (_0x5d8bda[_0x3f9c3c++]) {
      case "0":
        if (_0x30964f) {
          ((frozenBanner[_0x2f9ac2(0x225)] = ![]),
            frozenBanner[_0x2f9ac2(0x179)][_0x2f9ac2(0x295)]("exldw0"));
          if (btnAddBook) btnAddBook[_0x2f9ac2(0x2b9)] = !![];
        } else {
          ((frozenBanner[_0x2f9ac2(0x225)] = !![]),
            frozenBanner[_0x2f9ac2(0x179)]["remove"](
              _0x466480[_0x2f9ac2(0x1f8)],
            ));
          if (btnAddBook) btnAddBook[_0x2f9ac2(0x2b9)] = ![];
        }
        continue;
      case "1":
        submitAddBook[_0x2f9ac2(0x2b9)] = _0x30964f;
        continue;
      case "2":
        submitUpload[_0x2f9ac2(0x2b9)] = _0x30964f;
        continue;
      case "3":
        document["querySelectorAll"](_0x466480[_0x2f9ac2(0x27f)])[
          _0x2f9ac2(0x1f0)
        ]((_0x519454) => {
          const _0x4150d8 = _0x2f9ac2;
          _0x519454[_0x4150d8(0x2b9)] = _0x30964f;
        });
        continue;
      case "4":
        isFrozen = _0x30964f;
        continue;
    }
    break;
  }
}
function _0x2931(_0x1c9361, _0x17b9c6) {
  _0x1c9361 = _0x1c9361 - 0x14f;
  const _0x18918f = _0x1891();
  let _0x29313b = _0x18918f[_0x1c9361];
  if (_0x2931["wpPPAC"] === undefined) {
    var _0x474c95 = function (_0x597a83) {
      const _0x5668c9 =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0x2fc094 = "",
        _0x31ce1a = "";
      for (
        let _0x22fdf2 = 0x0, _0x1ee8e5, _0x33f7d7, _0x404fe = 0x0;
        (_0x33f7d7 = _0x597a83["charAt"](_0x404fe++));
        ~_0x33f7d7 &&
        ((_0x1ee8e5 =
          _0x22fdf2 % 0x4 ? _0x1ee8e5 * 0x40 + _0x33f7d7 : _0x33f7d7),
        _0x22fdf2++ % 0x4)
          ? (_0x2fc094 += String["fromCharCode"](
              0xff & (_0x1ee8e5 >> ((-0x2 * _0x22fdf2) & 0x6)),
            ))
          : 0x0
      ) {
        _0x33f7d7 = _0x5668c9["indexOf"](_0x33f7d7);
      }
      for (
        let _0x57e4e3 = 0x0, _0x4d3f1f = _0x2fc094["length"];
        _0x57e4e3 < _0x4d3f1f;
        _0x57e4e3++
      ) {
        _0x31ce1a +=
          "%" +
          ("00" + _0x2fc094["charCodeAt"](_0x57e4e3)["toString"](0x10))[
            "slice"
          ](-0x2);
      }
      return decodeURIComponent(_0x31ce1a);
    };
    ((_0x2931["OsdPtC"] = _0x474c95),
      (_0x2931["zlerja"] = {}),
      (_0x2931["wpPPAC"] = !![]));
  }
  const _0x1328d0 = _0x18918f[0x0];
  _0x2931["xfPrmI"] !== _0x1328d0 &&
    ((_0x2931["zlerja"] = {}), (_0x2931["xfPrmI"] = _0x1328d0));
  const _0x2c48c9 = _0x2931["zlerja"][_0x1c9361];
  return (
    _0x2c48c9 === undefined
      ? ((_0x29313b = _0x2931["OsdPtC"](_0x29313b)),
        (_0x2931["zlerja"][_0x1c9361] = _0x29313b))
      : (_0x29313b = _0x2c48c9),
    _0x29313b
  );
}
function showAnnouncement(_0x5982f9, _0x25a917 = ![]) {
  const _0x4a5b87 = _0x222c87,
    _0x13f8f3 = { JPwDp: _0x4a5b87(0x298) };
  ((uploadAnnouncement[_0x4a5b87(0x2b7)] = _0x5982f9),
    uploadAnnouncement["classList"][_0x4a5b87(0x231)](
      _0x13f8f3["JPwDp"],
      _0x25a917,
    ),
    uploadAnnouncement["classList"][_0x4a5b87(0x295)](_0x4a5b87(0x277)));
}
function _0x1891() {
  const _0x402144 = [
    "EMXYAeC",
    "zgvyANe",
    "uNrwAuW",
    "BxbQmw4X",
    "BM9TB3jFDgvSzxbVBG",
    "yNrUlwfKzc1IB29R",
    "AhrTquW",
    "ANbeCg0",
    "C3rHDc10B3rHBa",
    "Aw5WDxq",
    "l3vWzgf0zq",
    "rM5nAhe",
    "AgLKzgvU",
    "uuzZDhG",
    "BK9dy1m",
    "DgvZDa",
    "Dhj1zq",
    "Bw9KywWTChjVzMLSzq",
    "qwT1BIbbBMrHigrPyMvRDwTHBI4GshvIDw5NAsbHzg1PBMLZDhjHDg9YlG",
    "zuLuuK8",
    "vhjfCeO",
    "i2fKBwLUlwjVB2TZ",
    "zM9JDxm",
    "D0fhDMC",
    "Dg9Nz2XL",
    "r2fNywWGBwvTDwf0igj1A3u6ia",
    "t2vhCwO",
    "ANvKDwXFyNvRDq",
    "ywrTAw4TC2vHCMnO",
    "wuTKsha",
    "EfbWvuq",
    "y2HPBgrYzw4",
    "Dg90ywW",
    "ELblyui",
    "DxbSB2fKlwvYCM9Y",
    "CMvZzxq",
    "ywrKlwnVDMvYlwrYB3aTEM9Uzq",
    "yMvRDq",
    "s0niBeq",
    "u2fTChvSiej1A3u",
    "y2fUy2vSlwfKzc1TB2rHBa",
    "CtHZAdvR",
    "suXIDhy",
    "DKPPu1e",
    "y3vYCMvUDfrHCMDLDa",
    "CMvTB3zL",
    "DxnLCM5HBwu",
    "y2XPy2S",
    "mti4mJy2B294twvO",
    "C1zQq1a",
    "uLDMD3e",
    "wwDNB1a",
    "y292zxi",
    "zhDMuwK",
    "A2v5zg93BG",
    "v2zPwhu",
    "vwjHAa",
    "rxbbvhO",
    "rxnNtNK",
    "sw5MB3jTyxnPigj1A3uGyMvYAgfZAwWGzgL1yMfOlG",
    "yxbWzw5K",
    "ywrKlxbKzI1KCM9WlxPVBMu",
    "uhnrs0q",
    "qNvRDsbeAxrHBwjHAgTHBIdIGjqGvw5Nz2fOiezPBgu",
    "DMfSDwu",
    "AgfZx2nVDMvY",
    "wxP0B3e",
    "DgfODw5FDgvYyML0",
    "whbPt1e",
    "y0rnsfe",
    "zuvWzuq",
    "yxvHDxbWihvUy2u1Aq",
    "ywrTAw5PC3rYyxrVCG",
    "mJu1ntDdwhz6q2q",
    "sgfSyw1HBIa",
    "rgD4BNC",
    "C3rHDc13AxrOlxbKzG",
    "twvUEwLTCgfU4OcM",
    "y29UDgfPBNm",
    "ywrKlwP1zhvS",
    "CxGWAdK3",
    "Dg9mB3DLCKnHC2u",
    "l2fWAs9IB29RCY8",
    "AK5yuu0",
    "C3DSALi",
    "Aw5JBhvKzxm",
    "rur6whG",
    "ywrTAw4TDgjVzhK",
    "ue9tva",
    "r2fNywWGBwvUz2HHChvZigj1A3uU",
    "A2PmB0C",
    "igrHCMKG",
    "y21tCfu",
    "ywrKlxnPBM9WC2LZ",
    "zxHSzhCW",
    "zMLSzxnFzMfPBgvK",
    "yNbYBeK",
    "Bg9NB3v0lwj0BG",
    "rMLSzsbIzxjOyxnPBcbKAxvUz2DHAc4",
    "BMfTzq",
    "ugvYAw5NyxrHBJOGrMLSzsaI",
    "B0jct0q",
    "z3HjsLC",
    "BMfTyv9Wzw5LCMjPDa",
    "DgfYz2v0",
    "C0vAuxC",
    "kt8kcLrPBMrHA2fUigLUAsb0AwrHAYbKyxbHDcbKAwjHDgfSA2fUlG",
    "ChjVzMLSzs1IDg4",
    "BgvUz3rO",
    "t2HtuM8",
    "ywrKrxzLBNrmAxn0zw5LCG",
    "vev3v3e",
    "v3jqAKy",
    "qvnyv2W",
    "t0X3tuG",
    "uK1UDMy",
    "s2XPAYb1BNr1AYbTzw1PBgLOigzPBguGuergicGUCgrMkq",
    "r2fNywWGBwvUEwLTCgfUigj1A3uU",
    "vgzutMO",
    "A2v5",
    "yMvmCuC",
    "wePeqvC",
    "CvvWEwS",
    "AeTstfG",
    "ywrK",
    "B05Jwuq",
    "CM9Szq",
    "yJj1BgqY",
    "s2XPAYb1BNr1AYbTzw1PBgLOihnHBxb1BcaOlMPWzYK",
    "AxnIBG",
    "A2f0zwDVCMK",
    "odu0ndjit0Hyt0C",
    "iIbKyw4GyMvYA2fZifberI9Zyw1WDwXUEweGyMvYAgfZAwWGzgLOyxb1CY4",
    "s2XPAYb1BNr1AYbTzw1PBgLOigzPBguGC2fTChvSicGUANbNkq",
    "s1jvvfC",
    "nJbXEefdr0C",
    "yM1izMy",
    "DNP1EhK",
    "uKzYA0y",
    "vgfTyMfOiej1A3uGqMfYDq",
    "svD0t1e",
    "D3DAwLK",
    "tufZC3i",
    "AxrLBxm",
    "yNv0Dg9U",
    "C3bSAxq",
    "C2v0qxr0CMLIDxrL",
    "B2vNDw1H",
    "q0zeEvi",
    "EevMyw0",
    "vurfBKy",
    "EwPbBe0",
    "ywrKlwTHDgvNB3jP",
    "rNb0ALK",
    "y2XVC2uTChjVzMLSzs1IDxr0B24",
    "rKnbyKO",
    "BwfW",
    "y2XVC2uTywrKlw1VzgfS",
    "Dgv4DenVBNrLBNq",
    "sw5MB3jTyxnPigj1A3uGDgvYC2LTCgfUlcb0zxrHCgKGzMLSzsbNywDHBcbKAxvUz2DHAc4",
    "zgLZywjSzwq",
    "s3PktKq",
    "AK9VwuK",
    "l2XVz2LUp25LEhq9",
    "tuDdvwe",
    "C3rYB25N",
    "sMjNtMK",
    "DfH3DKO",
    "twvUz3vUz2DHAokaPG",
    "zMLSzxm",
    "ugLSAwGGBwLUAw1HBcbZyxr1igzPBguGDw50DwSGzgL1BMDNywGGkfnHBxb1BcbHDgf1ifberIKU",
    "Dg90ywXFCgfNzxm",
    "qNvRDsaI",
    "ywrKlwnVDMvYlwzPBguTBMfTzq",
    "A0LMswC",
    "t1b2wgq",
    "C3rHDhvZ",
    "rwrPEgy",
    "C3vIBwL0lwfKzc1IB29R",
    "CgjeDuS",
    "twnZugK",
    "De12ywK",
    "C2v0",
    "CgrMlwzPBguTBMfTzq",
    "sxnPiej1A3uGkfberIK",
    "DxbSB2fKlwLZyM4",
    "zgL2",
    "igjLCMTHCYbNywDHBcbKAwHHChvZigrHCMKGzM9SzgvYigjVB2TZlIbuDxr1CcbWCM9NCMfTihLHBMCGBwvTyNvRysbIzxjRyxmGAxr1igXHBhuGAgfWDxmGBwfUDwfSlG",
    "ywrKlxbLBNvSAxm",
    "DhjBzgf0ys1PC2jUpsi",
    "s2nIzMi",
    "tuDID3q",
    "mZjoveLXzMe",
    "DgfIBguTC3rHDgu",
    "C2zLAe0",
    "nxWXmxWXnNW2Fdn8mtv8mhW4Fde3Fdj8mxWXm3W0FdL8mtj8mtb8mtr8nW",
    "ywrKlxbKzI1MAwXLlw5HBwu",
    "BNHnyxe",
    "vw5Nz2fOiezPBgu",
    "BhPTA3j5",
    "yM9KEq",
    "qMvSDw0GzgL0yw1IywHRyw4",
    "q2z5ELy",
    "ywrKlwHHBgfTyw4",
    "Bw9KywWTywrKlxrPDgXL",
    "EwL3qK4",
    "C2LUB3bZAxm",
    "z2v0rwXLBwvUDej5swq",
    "AKrMCMe",
    "Axj5uKG",
    "y2fUy2vSlxvWBg9Hzc1TB2rHBa",
    "DvPrCwK",
    "yNv0Dg9UlcbBAhjLzL0SigLUChv0lcbZzwXLy3qSihrLEhrHCMvH",
    "EuzquK4",
    "nJHpwuX5tKy",
    "Aw1N",
    "D3LABee",
    "u2fTChvSia",
    "s1PODLG",
    "CuHrwhK",
    "iIb0AwrHAYb2ywXPzcb1BNr1AYbMAwvSzca",
    "y2XHC3nmAxn0",
    "u2vTDweGA29SB20GD2fQAwiGzgLPC2KGA2vJDwfSAsbZAw5VChnPCY4",
    "4PYtiefKyq",
    "CvLXAuq",
    "lIbiyw55ysbMB3jTyxqG",
    "qNvRDsbKyw4GzMLSzsbIzxjOyxnPBcbKAxnPBxbHBI4",
    "ywrKlwnVDMvY",
    "Du1IBvq",
    "y29Kzq",
    "yMvytxi",
    "ywrKlxbLBMvYyML0",
    "sMDyrfu",
    "CMvru1i",
    "qwrgwK8",
    "vK9IrNu",
    "Dxb2z2i",
    "l2fWAs9Hzg1PBI9IB29RCW",
    "yM9VA19JB3zLCG",
    "r2fNywWGBwvUz3vUz2DHAcbMAwXLlG",
    "sgfWDxm",
    "qNvRDsbIzxjOyxnPBcbKAxrHBwjHAgTHBIWGDgv0yxbPigzPBguGz2fNywWGzgL1BMDNywGU",
    "D1DQr1G",
    "A2Tzt1K",
    "qvjNwwq",
    "s2LbBLG",
    "q1rlzMK",
    "rwzdu2q",
    "A3nWuK8",
    "zM9YBs11CgXVywq",
    "Cgf0Ag5HBwu",
    "Dg9Rzw4",
    "CgrMlwrYB3aTEM9Uzq",
    "yxvHDxbWig14Dxv0yq",
    "ywrKlwLZyM4",
    "qwHeAui",
    "lMfJDgLVBI1IDg5Zigj1DhrVBG",
    "l2fWAs9IB29RCY9JyxrLz29YAwvZ",
    "C2nYB2XSvg8",
    "qMTKqxq",
    "yM9VA3nFD2L0Af9Wzgy",
    "s2XPAYb1BNr1AYbTzw1PBgLOigLZAsbIDwT1icGUCgrMkq",
    "vg90Ahy",
    "ywnJB3vUDf9ZDgf0Dxm",
    "BvrABK0",
    "Cu5Hy1a",
    "uujVEK0",
    "mZaWnJbQA1LsBLy",
    "vKTeBLa",
    "tKHut0m",
    "uLD4zem",
    "tvjdvuK",
    "y29Uy2f0",
    "CLDgvfq",
    "Bw9KywWTywrKlwjVB2S",
    "wM1pBu4",
    "CxvLCNLtzwXLy3rVCG",
    "tNHfBNu",
    "B3b0Aw9UCW",
    "CLzXvMm",
    "zMLSDgvY",
    "sLPWrKe",
    "DhjPBq",
    "uNbUvNu",
    "ywrKlxbKzG",
    "rNz5vfe",
    "mtq1odqWy1rVtw5s",
    "ufLOzM0",
    "l2XVz2LUp2v4CgLYzwq9mszUzxH0pq",
    "BhboyMi",
    "A3b1vu0",
    "s0fpC2S",
    "tMTYEKW",
    "Cg9xu2W",
    "tLzKzfO",
    "rgLIzwT1A2fU",
    "AvLUrLu",
    "Bgf6Eq",
    "BgL4EKS",
    "tu1LEM4",
    "ANvTBgfOx2HHBgfTyw4",
    "u2LTCgfUiej1A3u",
    "ChjVzMLSzs1LBwfPBa",
    "tNzYteS",
    "svPQwe4",
    "DMnYCha",
    "BMv4Dc1WywDLlwj0BG",
    "mJC5ndq2mhLqCeXgAa",
    "Dg9tDhjPBMC",
    "y3zlBMW",
    "AxPHAvm",
    "rMvSr0u",
    "v1n0zwu",
    "zxnJyxbL",
    "zNzJru8",
    "DxbSB2fKlxbKzG",
    "Cg9W",
    "y2XVC2uTDxbSB2fKlw1VzgfS",
    "C21VB3rO",
    "mxW5Fdz8n3WXmxWXmhW4Fdv8mNWWFdn8na",
    "uKjizey",
    "8j+uKIbbA3vUiefUzgeGDgvSywGGzgLIzwT1A2fUigTHCMvUysbWzxjJB2jHyw4GBwvUz3vUz2DHAcbMAwXLigrLBMDHBIbMB3jTyxqGEwfUzYb0AwrHAYbKAwL6Aw5Ryw4GyMvYDwXHBMCGA2fSAs4Gu2vTDweGzML0DxiGDw5Nz2fOihrLBgfOigrPBM9UywT0AwzRyw4U",
    "y292zxiTzMLSzs1Uyw1L",
    "rxnJyxbL",
    "vwjHAcbjBMzVCM1HC2KGqNvRDq",
    "s0PTvMC",
    "B3bLBG",
    "Dg90ywXFyM9VA3m",
    "ywrKlwjVB2STzxjYB3i",
    "ENv5zum",
    "C3jJogzU",
    "BwvZC2fNzq",
    "zM9YBs1HzgqTyM9VAW",
    "zML2DKS",
    "qNvRDsb0zxjZAw1Wyw4UiezPBguGyMvSDw0GzgL1BMDNywG7igD1BMfRyw4GDg9TyM9SifvUz2DHAcbgAwXLihbHzgeGzgfMDgfYigj1A3uU",
    "A2f0zwDVCMLFBMfTyq",
    "C21HBgW",
    "zw9Mvwq",
    "sfnwwwG",
    "yxnZAwDU",
    "zM9YrwfJAa",
    "rLbUzhm",
    "tgTKEwG",
    "wKDgvLa",
    "yLnQrwq",
    "vvfOshe",
    "vgvYAMfKAsbRzxnHBgfOyw4GC2fHDcbTzw5NDw5Nz2fOigzPBguU",
    "EePUz3K",
    "tw9KvLC",
    "vvL0Dhm",
    "u2HLALm",
    "revmrvrf",
    "DhP1Bey",
    "Ewr1EdDNigH1EJy4CW",
    "mti2mJyXrMjlAM1O",
    "uxrysgG",
    "tLrIBw0",
    "wwnirLO",
    "mNWXFdr8mhWZ",
    "AgfZx3bKzG",
    "EwHor0e",
    "AwrFA2f0zwDVCMK",
    "CxzXyvy",
    "qun1rva",
    "suPuugi",
    "qMz6yvu",
    "wxHbtu8",
    "rvb4BeK",
    "t3fQwNa",
    "rMPHyMG",
    "B3b0Aw9U",
    "AM9PBG",
    "C3bHBG",
    "BLbMBMu",
    "vfvxswy",
    "ifbLCMjHAwTPihbPBgLOyw4GzMLSzsWGBgfSDsbJB2jHigXHz2KU",
    "y2HHBMDL",
    "zxDMuwe",
    "ihLHBMCGzgLPEMLUA2fUlIbcywnRzw5KigfRyw4GBwvUB2XHAYbMAwXLigLUAsbKyw4GBwvUz2HPDhvUz255ysbKywXHBsbIyxrHCYa0ihbLCMnVyMfHBIbWzxiGAgfYAs4",
    "EMm0A3zI",
    "l2fWAs9Hzg1PBI9IB29RCY8",
  ];
  _0x1891 = function () {
    return _0x402144;
  };
  return _0x1891();
}
function hideAnnouncement() {
  const _0xd4efea = _0x222c87,
    _0xc74b1b = { yhNGA: _0xd4efea(0x277), JZpFA: _0xd4efea(0x298) };
  ((uploadAnnouncement[_0xd4efea(0x2b7)] = ""),
    uploadAnnouncement[_0xd4efea(0x179)][_0xd4efea(0x246)](
      _0xc74b1b[_0xd4efea(0x204)],
      _0xc74b1b[_0xd4efea(0x1b5)],
    ));
}
function warnInvalidFileType(
  _0x5663a9,
  _0x4c666c,
  _0x4beac0,
  _0x10ed33 = uploadAnnouncement,
) {
  const _0x4b121a = _0x222c87,
    _0x33070e = {
      CfyzV: function (_0x24bfb8, _0x41ee5b) {
        return _0x24bfb8 === _0x41ee5b;
      },
      Fjabh: function (_0x141f5b, _0x79476c, _0x1034bf) {
        return _0x141f5b(_0x79476c, _0x1034bf);
      },
    };
  if (!_0x5663a9) return;
  const _0x59fa90 = _0x5663a9[_0x4b121a(0x27c)]
    [_0x4b121a(0x2aa)](".")
    [_0x4b121a(0x1d8)]()
    ["toLowerCase"]();
  if (!_0x4c666c[_0x4b121a(0x26e)](_0x59fa90)) {
    const _0x4744af = _0x4b121a(0x27d)
      [_0x4b121a(0x1ac)](_0x5663a9[_0x4b121a(0x27c)], _0x4b121a(0x178))
      ["concat"](_0x4beac0, _0x4b121a(0x17d))
      [_0x4b121a(0x1ac)](
        _0x4c666c[_0x4b121a(0x2b5)]((_0x51c6d0) => "." + _0x51c6d0)[
          _0x4b121a(0x20f)
        ](",\x20"),
        _0x4b121a(0x216),
      );
    if (_0x33070e[_0x4b121a(0x166)](_0x10ed33, uploadAnnouncement))
      showAnnouncement(_0x4744af, !![]);
    else _0x33070e[_0x4b121a(0x20d)](showModalError, _0x10ed33, _0x4744af);
  }
}
function setSubmitLoading(
  _0xf27cdf,
  _0x66d2f,
  _0x12ea5f,
  _0x1667af = "Memproses…",
) {
  const _0xf1298d = _0x222c87;
  ((_0xf27cdf[_0xf1298d(0x2b9)] = _0x66d2f || isFrozen),
    (_0xf27cdf[_0xf1298d(0x2b7)] = _0x66d2f ? _0x1667af : _0x12ea5f));
}
function showModalError(_0x3b506b, _0x195470) {
  ((_0x3b506b["textContent"] = _0x195470), (_0x3b506b["hidden"] = ![]));
}
function hideModalError(_0x365111) {
  const _0x4fff97 = _0x222c87;
  ((_0x365111[_0x4fff97(0x2b7)] = ""), (_0x365111[_0x4fff97(0x225)] = !![]));
}
function openModal(_0x185781) {
  const _0x60a0de = _0x222c87,
    _0x2c2772 = { qNacP: _0x60a0de(0x269) };
  _0x185781["classList"]["add"](_0x2c2772[_0x60a0de(0x1a5)]);
  const _0x19143e = _0x185781[_0x60a0de(0x1b0)](_0x60a0de(0x170));
  if (_0x19143e) _0x19143e[_0x60a0de(0x22f)]();
}
function closeModal(_0x5a8ff9) {
  const _0x4b898d = _0x222c87,
    _0x2e0cab = { OqjZp: _0x4b898d(0x269) };
  _0x5a8ff9[_0x4b898d(0x179)][_0x4b898d(0x246)](_0x2e0cab[_0x4b898d(0x20c)]);
}
function handleBackdropClick(_0x578c1d) {
  const _0x38ad11 = _0x222c87,
    _0x26f2bc = {
      FnMhq: function (_0xd6645, _0x24874f) {
        return _0xd6645 === _0x24874f;
      },
      MGCUa: function (_0x5cc3f6, _0x4bcb2d) {
        return _0x5cc3f6(_0x4bcb2d);
      },
    };
  if (
    _0x26f2bc[_0x38ad11(0x224)](
      _0x578c1d["target"],
      _0x578c1d[_0x38ad11(0x245)],
    )
  )
    _0x26f2bc[_0x38ad11(0x2bd)](closeModal, _0x578c1d["currentTarget"]);
}
function handleKeydown(_0x1511f2) {
  const _0x379dbe = _0x222c87,
    _0x4c7160 = {
      MRCUI: function (_0x3b503d, _0xc30f71) {
        return _0x3b503d === _0xc30f71;
      },
      iYnFU: _0x379dbe(0x1df),
      kpuUM: function (_0xd6add8) {
        return _0xd6add8();
      },
      Edixf: _0x379dbe(0x269),
      vZLWx: function (_0x295d9c, _0x95a7c9) {
        return _0x295d9c(_0x95a7c9);
      },
      xEfam: function (_0xb0c3f4, _0x461fe6) {
        return _0xb0c3f4(_0x461fe6);
      },
    };
  if (
    _0x4c7160[_0x379dbe(0x1ab)](
      _0x1511f2[_0x379dbe(0x290)],
      _0x4c7160[_0x379dbe(0x1c4)],
    )
  ) {
    if (modalAddBook[_0x379dbe(0x179)][_0x379dbe(0x267)](_0x379dbe(0x269)))
      _0x4c7160[_0x379dbe(0x1be)](closeAddBookModal);
    if (modalUpload[_0x379dbe(0x179)]["contains"](_0x4c7160[_0x379dbe(0x2ca)]))
      _0x4c7160["vZLWx"](closeModal, modalUpload);
    if (modalProfile[_0x379dbe(0x179)][_0x379dbe(0x267)](_0x379dbe(0x269)))
      _0x4c7160[_0x379dbe(0x2ae)](closeModal, modalProfile);
  }
}
function updateStats(_0x190722) {
  const _0xedfd15 = _0x222c87,
    _0x18c647 = {
      FelGE: function (_0x55f756, _0x12c171) {
        return _0x55f756(_0x12c171);
      },
    },
    _0x1d0551 = _0x190722[_0xedfd15(0x239)] ?? 0x0,
    _0x35e697 = _0x190722["items"]
      ? _0x190722[_0xedfd15(0x2a8)][_0xedfd15(0x1b4)](
          (_0x1354e0) => _0x1354e0[_0xedfd15(0x203)],
        )[_0xedfd15(0x285)]
      : 0x0;
  ((statTotal[_0xedfd15(0x2b7)] = _0x18c647[_0xedfd15(0x1d3)](
    String,
    _0x1d0551,
  )),
    (statWithPdf[_0xedfd15(0x2b7)] = String(_0x35e697)));
}
async function loadStats() {
  const _0x242a82 = _0x222c87,
    _0xda8629 = {
      reQSR: function (_0x4e4eda, _0x55c4a8) {
        return _0x4e4eda(_0x55c4a8);
      },
      qxPBt: "/api/admin/stats",
      dwfQi: function (_0x1b1e90, _0x4d836a) {
        return _0x1b1e90(_0x4d836a);
      },
      wCRRt: function (_0x36feb8, _0x590049) {
        return _0x36feb8(_0x590049);
      },
      eEpeD: function (_0xfd2649, _0x32176f, _0xb99e92) {
        return _0xfd2649(_0x32176f, _0xb99e92);
      },
      tMvai: "Statistik\x20buku\x20tidak\x20dapat\x20dimuat.",
    };
  try {
    const _0x924d7e = await _0xda8629[_0x242a82(0x185)](
      api,
      _0xda8629["qxPBt"],
    );
    ((statTotal[_0x242a82(0x2b7)] = _0xda8629[_0x242a82(0x24e)](
      String,
      _0x924d7e[_0x242a82(0x1e3)] ?? 0x0,
    )),
      (statWithPdf[_0x242a82(0x2b7)] = _0xda8629["wCRRt"](
        String,
        _0x924d7e[_0x242a82(0x1a0)] ?? 0x0,
      )));
  } catch {
    _0xda8629[_0x242a82(0x25f)](toast, _0xda8629[_0x242a82(0x151)], !![]);
  }
}
function statusPill(_0x4d3541, _0x122848, _0x54027e) {
  const _0x219bc7 = _0x222c87,
    _0x25ea7d = {
      KCHlD: function (_0x5e7476, _0x653394, _0x5869d5) {
        return _0x5e7476(_0x653394, _0x5869d5);
      },
      RpnVu: _0x219bc7(0x210),
      cvKnl: _0x219bc7(0x199),
      SdtxF: _0x219bc7(0x260),
    },
    _0x1cfbd2 = _0x25ea7d[_0x219bc7(0x23f)](el, _0x25ea7d[_0x219bc7(0x1b7)], {
      class: _0x4d3541 ? _0x25ea7d[_0x219bc7(0x1d1)] : _0x25ea7d["SdtxF"],
    });
  return (
    (_0x1cfbd2["textContent"] = _0x4d3541 ? _0x122848 : _0x54027e),
    _0x1cfbd2
  );
}
function renderBookRow(_0x3c2aeb, _0x4972ab) {
  const _0x45fc9c = _0x222c87,
    _0x44849b = {
      yiwBN: function (_0xcf1c99, _0xdb1d) {
        return _0xcf1c99(_0xdb1d);
      },
      kIfIg: function (_0xe4f23, _0x2a0a38, _0x5d7acc) {
        return _0xe4f23(_0x2a0a38, _0x5d7acc);
      },
      rEAhx: _0x45fc9c(0x173),
      QBozM: _0x45fc9c(0x1e6),
      ARgYd: function (_0x5032e2, _0x5c9295) {
        return _0x5032e2(_0x5c9295);
      },
      AhDiB: _0x45fc9c(0x1c5),
      WfiXu: function (_0x42eb26, _0x20b699, _0x5c3861, _0xdba17a) {
        return _0x42eb26(_0x20b699, _0x5c3861, _0xdba17a);
      },
      FCAbJ: function (_0x3eb0e7, _0x3e1597, _0x4471a2) {
        return _0x3eb0e7(_0x3e1597, _0x4471a2);
      },
      kkYOY: "w1yxh6",
      JBgVZ: _0x45fc9c(0x162),
      wTbFx: "aria-disabled",
      ANYso: _0x45fc9c(0x229),
      qHQXy: function (_0x5427c6, _0x1a33dc, _0x4c800a) {
        return _0x5427c6(_0x1a33dc, _0x4c800a);
      },
      UYtts: _0x45fc9c(0x2a9),
      jNXQM: "ydux7g\x20huz68s",
      LZIUI: _0x45fc9c(0x248),
      CFDyR: function (_0x338f94, _0x20ee92, _0x447c7f) {
        return _0x338f94(_0x20ee92, _0x447c7f);
      },
      POTiy: _0x45fc9c(0x18c),
      EDzXx: _0x45fc9c(0x156),
      zPKaB: _0x45fc9c(0x163),
      OeGqj: function (_0x69f805, _0x1620ff) {
        return _0x69f805(_0x1620ff);
      },
      YcHFZ: _0x45fc9c(0x2be),
      XpiOQ: function (_0x522c60, _0x10e8a5, _0x2abd82) {
        return _0x522c60(_0x10e8a5, _0x2abd82);
      },
      tXwvJ: _0x45fc9c(0x1ec),
      piaFj: "ypjbz0",
      wWjGX: function (_0x27d501, _0x550265) {
        return _0x27d501(_0x550265);
      },
      cmSpU: _0x45fc9c(0x181),
      JbgNi: function (_0x2d1e1d, _0x52dd8a) {
        return _0x2d1e1d(_0x52dd8a);
      },
      beXMr: _0x45fc9c(0x17b),
      beLqG: function (_0xa2a409, _0x84ea33, _0x4d9c31, _0x8553e4) {
        return _0xa2a409(_0x84ea33, _0x4d9c31, _0x8553e4);
      },
    };
  let _0x1c1417;
  if (_0x3c2aeb[_0x45fc9c(0x25a)] && _0x3c2aeb["book_cover"]) {
    const _0x4f3add = _0x44849b[_0x45fc9c(0x2c7)](el, _0x44849b["rEAhx"], {
      class: _0x44849b[_0x45fc9c(0x1a6)],
      src: _0x45fc9c(0x26b)
        ["concat"](
          _0x44849b[_0x45fc9c(0x190)](
            encodeURIComponent,
            _0x3c2aeb[_0x45fc9c(0x29a)],
          ),
          "/cover?v=",
        )
        ["concat"](
          _0x44849b[_0x45fc9c(0x190)](
            encodeURIComponent,
            _0x3c2aeb[_0x45fc9c(0x18a)] || "",
          ),
        ),
      alt: _0x45fc9c(0x175)["concat"](_0x3c2aeb[_0x45fc9c(0x234)]),
      loading: _0x44849b[_0x45fc9c(0x19b)],
    });
    _0x1c1417 = _0x44849b[_0x45fc9c(0x250)](el, "td", {}, _0x4f3add);
  } else {
    const _0x48bbc0 = _0x44849b[_0x45fc9c(0x2b4)](el, _0x45fc9c(0x156), {
      class: _0x44849b[_0x45fc9c(0x18f)],
    });
    ((_0x48bbc0["textContent"] = "📖"),
      (_0x1c1417 = _0x44849b[_0x45fc9c(0x250)](el, "td", {}, _0x48bbc0)));
  }
  const _0x59f025 = _0x44849b[_0x45fc9c(0x2c7)](el, "a", {
    class: _0x45fc9c(0x1fd),
    href: _0x45fc9c(0x22e),
    "data-isbn": _0x3c2aeb[_0x45fc9c(0x29a)],
  });
  _0x59f025["textContent"] = _0x44849b["JBgVZ"];
  if (isFrozen)
    _0x59f025[_0x45fc9c(0x2ab)](_0x44849b["wTbFx"], _0x44849b["ANYso"]);
  _0x59f025[_0x45fc9c(0x287)](_0x45fc9c(0x248), (_0xc71835) => {
    const _0x10f6bb = _0x45fc9c;
    _0xc71835["preventDefault"]();
    if (!isFrozen)
      _0x44849b[_0x10f6bb(0x169)](openUploadModal, _0x3c2aeb[_0x10f6bb(0x29a)]);
  });
  const _0x5f1c73 = _0x44849b[_0x45fc9c(0x177)](
    el,
    _0x44849b[_0x45fc9c(0x1f9)],
    { class: _0x44849b[_0x45fc9c(0x26c)], type: _0x44849b["UYtts"] },
  );
  ((_0x5f1c73[_0x45fc9c(0x2b7)] = _0x45fc9c(0x251)),
    (_0x5f1c73[_0x45fc9c(0x2b9)] = isFrozen),
    _0x5f1c73[_0x45fc9c(0x287)](_0x44849b["LZIUI"], () =>
      openEditBookModal(_0x3c2aeb),
    ));
  const _0x5812a9 = _0x44849b[_0x45fc9c(0x2ad)](el, _0x44849b["UYtts"], {
    class: _0x44849b[_0x45fc9c(0x26c)],
    type: _0x44849b[_0x45fc9c(0x1f9)],
    "data-isbn": _0x3c2aeb[_0x45fc9c(0x29a)],
  });
  ((_0x5812a9[_0x45fc9c(0x2b7)] = _0x44849b["POTiy"]),
    (_0x5812a9[_0x45fc9c(0x2b9)] = isFrozen),
    _0x5812a9[_0x45fc9c(0x287)](_0x44849b["LZIUI"], () =>
      handleDeleteBook(_0x3c2aeb["isbn"], _0x3c2aeb[_0x45fc9c(0x234)]),
    ));
  const _0x2ccf20 = el(
      _0x44849b[_0x45fc9c(0x26f)],
      { class: _0x44849b[_0x45fc9c(0x23a)] },
      _0x59f025,
      _0x5f1c73,
      _0x5812a9,
    ),
    _0x58dcf4 = _0x44849b[_0x45fc9c(0x190)](el, "td"),
    _0xecb6d4 = _0x44849b["OeGqj"](el, _0x44849b[_0x45fc9c(0x201)]);
  _0xecb6d4["textContent"] = _0x3c2aeb[_0x45fc9c(0x234)];
  const _0x464431 = _0x44849b[_0x45fc9c(0x25d)](
    el,
    _0x44849b[_0x45fc9c(0x2c0)],
    { class: _0x44849b["piaFj"] },
  );
  ((_0x464431[_0x45fc9c(0x2b7)] = _0x3c2aeb["nama_penulis"] || "—"),
    _0x58dcf4[_0x45fc9c(0x255)](_0xecb6d4, el("br"), _0x464431));
  const _0x1f2448 = _0x44849b["ARgYd"](el, "td"),
    _0x32cdfc = _0x44849b[_0x45fc9c(0x18e)](el, _0x44849b[_0x45fc9c(0x275)]);
  ((_0x32cdfc[_0x45fc9c(0x2b7)] = _0x3c2aeb["isbn"]),
    _0x1f2448[_0x45fc9c(0x255)](_0x32cdfc));
  const _0x2443a1 = el("tr", { "data-isbn": _0x3c2aeb[_0x45fc9c(0x29a)] }),
    _0x5ca4bd = el("td");
  _0x5ca4bd[_0x45fc9c(0x2b7)] = _0x44849b[_0x45fc9c(0x169)](String, _0x4972ab);
  const _0x46431b = _0x44849b[_0x45fc9c(0x233)](el, "td");
  _0x46431b[_0x45fc9c(0x2b7)] = _0x3c2aeb[_0x45fc9c(0x1eb)] || "—";
  const _0xefe3a8 = _0x44849b[_0x45fc9c(0x2bf)](el, "td");
  _0xefe3a8[_0x45fc9c(0x2b7)] = _0x3c2aeb[_0x45fc9c(0x1c8)]
    ? _0x44849b[_0x45fc9c(0x169)](String, _0x3c2aeb[_0x45fc9c(0x1c8)])
    : "—";
  const _0x13fabe = el(
      "td",
      {},
      statusPill(
        _0x3c2aeb[_0x45fc9c(0x203)],
        _0x44849b[_0x45fc9c(0x182)],
        "Belum\x20ada",
      ),
    ),
    _0x38c397 = el(
      "td",
      {},
      statusPill(
        _0x3c2aeb["has_cover"],
        _0x44849b[_0x45fc9c(0x182)],
        "Belum\x20ada",
      ),
    ),
    _0x17b3a2 = _0x44849b[_0x45fc9c(0x291)](el, "td", {}, _0x2ccf20);
  return (
    _0x2443a1[_0x45fc9c(0x255)](
      _0x5ca4bd,
      _0x1c1417,
      _0x58dcf4,
      _0x1f2448,
      _0x46431b,
      _0xefe3a8,
      _0x13fabe,
      _0x38c397,
      _0x17b3a2,
    ),
    _0x2443a1
  );
}
function renderSkeletonRows(_0x5c75eb = 0x5) {
  const _0x4c4b60 = _0x222c87,
    _0x1b5965 = {
      EpATz: function (_0xe54bf1, _0x45a19d) {
        return _0xe54bf1 < _0x45a19d;
      },
      Lkdyh: function (_0x125af9, _0x137fd0) {
        return _0x125af9(_0x137fd0);
      },
      sVjCP: function (_0x549126, _0x3cae9d) {
        return _0x549126(_0x3cae9d);
      },
      JgXDU: function (_0xd07c51, _0x325132, _0x3023ba) {
        return _0xd07c51(_0x325132, _0x3023ba);
      },
      pbDuK: _0x4c4b60(0x156),
    };
  for (
    let _0x5d833e = 0x0;
    _0x1b5965[_0x4c4b60(0x252)](_0x5d833e, _0x5c75eb);
    _0x5d833e++
  ) {
    const _0x34d77d = _0x1b5965[_0x4c4b60(0x1f2)](el, "tr");
    for (let _0x2bdbc9 = 0x0; _0x1b5965["EpATz"](_0x2bdbc9, 0x9); _0x2bdbc9++) {
      const _0x1a415c = _0x1b5965[_0x4c4b60(0x24a)](el, "td"),
        _0x3db91b = _0x1b5965[_0x4c4b60(0x184)](
          el,
          _0x1b5965[_0x4c4b60(0x14f)],
          { class: "ubt95k\x20zimzfe" },
        );
      (_0x1a415c[_0x4c4b60(0x255)](_0x3db91b),
        _0x34d77d[_0x4c4b60(0x255)](_0x1a415c));
    }
    adminTbody[_0x4c4b60(0x255)](_0x34d77d);
  }
}
async function loadBooks() {
  const _0x14b4ca = _0x222c87,
    _0x4bc0de = {
      RWfwq: function (_0x5d4115, _0xafe1ac) {
        return _0x5d4115 + _0xafe1ac;
      },
      jOoYI: function (_0x2b8cee, _0x3fb75a, _0x3df232) {
        return _0x2b8cee(_0x3fb75a, _0x3df232);
      },
      FPnds: function (_0x1b39c9, _0x1d28a8) {
        return _0x1b39c9(_0x1d28a8);
      },
      KJmVg: function (_0x5bf0c6, _0x5f2b9e) {
        return _0x5bf0c6 * _0x5f2b9e;
      },
      XJDAW: function (_0x165169, _0x171907) {
        return _0x165169 - _0x171907;
      },
      YxAMO: function (_0xb4f370, _0x246b01) {
        return _0xb4f370 === _0x246b01;
      },
      poWSl: function (_0x2375c5, _0x5eff16) {
        return _0x2375c5 > _0x5eff16;
      },
      uMbmT: function (_0x68a0f, _0x49fa49, _0x5803d8) {
        return _0x68a0f(_0x49fa49, _0x5803d8);
      },
      bCjfL: function (_0x2518d7, _0x3091dd) {
        return _0x2518d7 <= _0x3091dd;
      },
      XYdVN: function (_0x355b0b, _0x2613d8) {
        return _0x355b0b >= _0x2613d8;
      },
      MAssr: "Terjadi\x20kesalahan\x20saat\x20memuat\x20data\x20buku.",
      MGbwt: function (_0x39d366, _0x4af2d4) {
        return _0x39d366 === _0x4af2d4;
      },
      cDMHQ: function (_0xa3abd6, _0x113097) {
        return _0xa3abd6(_0x113097);
      },
      lixzK: "Gagal\x20memuat\x20daftar\x20buku.",
    };
  (clear(adminTbody),
    renderSkeletonRows(),
    (tableState[_0x14b4ca(0x2b7)] = ""),
    _0x4bc0de[_0x14b4ca(0x2bb)](show, pagination, ![]));
  try {
    const _0x3e68ef = new URLSearchParams({
      page: _0x4bc0de[_0x14b4ca(0x1f1)](String, currentPage),
      page_size: "15",
    });
    if (currentSearch[_0x14b4ca(0x1b6)]())
      _0x3e68ef[_0x14b4ca(0x152)]("q", currentSearch["trim"]());
    const _0x27e9f8 = await api(
      "/api/admin/books?"[_0x14b4ca(0x1ac)](_0x3e68ef[_0x14b4ca(0x1d0)]()),
    );
    (_0x4bc0de[_0x14b4ca(0x1f1)](clear, adminTbody),
      (totalPages = _0x27e9f8[_0x14b4ca(0x2c4)] || 0x1));
    const _0x180d8e = _0x4bc0de[_0x14b4ca(0x1e1)](
      _0x4bc0de[_0x14b4ca(0x292)](currentPage, 0x1),
      0xf,
    );
    statTotal["textContent"] = _0x4bc0de[_0x14b4ca(0x1f1)](
      String,
      _0x27e9f8["total"] ?? 0x0,
    );
    const _0x330de2 = (_0x27e9f8["items"] || [])[_0x14b4ca(0x1b4)](
      (_0x2d966d) => _0x2d966d["has_pdf"],
    )["length"];
    statWithPdf[_0x14b4ca(0x2b7)] === "—" &&
      (statWithPdf[_0x14b4ca(0x2b7)] = _0x4bc0de[_0x14b4ca(0x1f1)](
        String,
        _0x330de2,
      ));
    if (
      !_0x27e9f8[_0x14b4ca(0x2a8)] ||
      _0x4bc0de[_0x14b4ca(0x20a)](
        _0x27e9f8[_0x14b4ca(0x2a8)][_0x14b4ca(0x285)],
        0x0,
      )
    ) {
      ((tableState[_0x14b4ca(0x2b7)] =
        "Tidak\x20ada\x20buku\x20yang\x20cocok\x20dengan\x20pencarian\x20Anda."),
        _0x4bc0de["jOoYI"](show, pagination, ![]));
      return;
    }
    (_0x27e9f8["items"]["forEach"]((_0x142dc5, _0x44adb4) => {
      const _0x217732 = _0x14b4ca;
      adminTbody["append"](
        renderBookRow(
          _0x142dc5,
          _0x4bc0de[_0x217732(0x24b)](
            _0x4bc0de[_0x217732(0x24b)](_0x180d8e, _0x44adb4),
            0x1,
          ),
        ),
      );
    }),
      _0x4bc0de[_0x14b4ca(0x1c1)](totalPages, 0x1)
        ? (_0x4bc0de[_0x14b4ca(0x180)](show, pagination, !![]),
          (pageInfo[_0x14b4ca(0x2b7)] = _0x14b4ca(0x263)
            [_0x14b4ca(0x1ac)](currentPage, _0x14b4ca(0x274))
            [_0x14b4ca(0x1ac)](totalPages)),
          (prevPageBtn["disabled"] = _0x4bc0de["bCjfL"](currentPage, 0x1)),
          (nextPageBtn[_0x14b4ca(0x2b9)] = _0x4bc0de["XYdVN"](
            currentPage,
            totalPages,
          )))
        : _0x4bc0de[_0x14b4ca(0x180)](show, pagination, ![]));
  } catch (_0x1cf433) {
    _0x4bc0de[_0x14b4ca(0x1f1)](clear, adminTbody);
    const _0x4e528c =
      _0x1cf433 instanceof ApiError
        ? _0x1cf433[_0x14b4ca(0x1e7)]
        : _0x4bc0de[_0x14b4ca(0x2a7)];
    ((tableState[_0x14b4ca(0x2b7)] =
      _0x14b4ca(0x232)[_0x14b4ca(0x1ac)](_0x4e528c)),
      _0x1cf433 instanceof ApiError &&
        _0x4bc0de[_0x14b4ca(0x15b)](_0x1cf433[_0x14b4ca(0x2c9)], 0x193) &&
        /dibekukan/i[_0x14b4ca(0x228)](_0x1cf433[_0x14b4ca(0x1e7)]) &&
        _0x4bc0de[_0x14b4ca(0x25e)](applyFrozenState, !![]),
      toast(_0x4bc0de[_0x14b4ca(0x1c6)], !![]));
  }
}
async function loadCategories() {
  const _0x29dbce = _0x222c87,
    _0x28a9ac = {
      izaiS: function (_0x5c6f1f, _0x1ac66b, _0x4861c0) {
        return _0x5c6f1f(_0x1ac66b, _0x4861c0);
      },
      PMjYk: _0x29dbce(0x19d),
      BfzaU: function (_0x4f19a9, _0x1b0928) {
        return _0x4f19a9 > _0x1b0928;
      },
      Kcbfb: function (_0x459f5d, _0x1040ee, _0x27358a) {
        return _0x459f5d(_0x1040ee, _0x27358a);
      },
      PsQKD: _0x29dbce(0x20e),
      zuyeC: function (_0x29ed42, _0x235972) {
        return _0x29ed42(_0x235972);
      },
      UQhHq: function (_0xf6e077, _0x12dd68, _0x8bbfb5) {
        return _0xf6e077(_0x12dd68, _0x8bbfb5);
      },
      ONpmB: "Kategori\x20buku\x20tidak\x20dapat\x20dimuat.",
    };
  try {
    const _0x131c78 = await _0x28a9ac[_0x29dbce(0x1d2)](
      api,
      _0x28a9ac["PMjYk"],
      { auth: ![] },
    );
    while (
      _0x28a9ac[_0x29dbce(0x209)](
        addKategori[_0x29dbce(0x1b2)][_0x29dbce(0x285)],
        0x1,
      )
    )
      addKategori[_0x29dbce(0x246)](0x1);
    for (const _0x4c016e of _0x131c78) {
      const _0x1ac43c = _0x28a9ac[_0x29dbce(0x15a)](
        el,
        _0x28a9ac[_0x29dbce(0x257)],
        {
          value: _0x28a9ac[_0x29dbce(0x1e5)](String, _0x4c016e["id_kategori"]),
        },
      );
      ((_0x1ac43c[_0x29dbce(0x2b7)] = _0x4c016e[_0x29dbce(0x29b)]),
        addKategori[_0x29dbce(0x255)](_0x1ac43c));
    }
  } catch {
    _0x28a9ac[_0x29dbce(0x1f5)](toast, _0x28a9ac["ONpmB"], !![]);
  }
}
async function openAddBookModal() {
  const _0x51eb70 = _0x222c87,
    _0x51fb43 = {
      EsgNy: _0x51eb70(0x1db),
      lHfUQ: function (_0x9d6217, _0x10a095) {
        return _0x9d6217(_0x10a095);
      },
      zlrhG: function (_0x4cef84, _0x103c35, _0xb9b12a) {
        return _0x4cef84(_0x103c35, _0xb9b12a);
      },
      deXjq: _0x51eb70(0x1a1),
      WStee: function (_0x3b652b) {
        return _0x3b652b();
      },
      CTKfi: "Klik\x20untuk\x20memilih\x20sampul\x20(.jpg)",
      MbQBE: _0x51eb70(0x168),
      oNcYD: _0x51eb70(0x2a4),
      NHTOC: _0x51eb70(0x1c9),
    },
    _0x19c88e = _0x51fb43[_0x51eb70(0x253)][_0x51eb70(0x2aa)]("|");
  let _0x46d18b = 0x0;
  while (!![]) {
    switch (_0x19c88e[_0x46d18b++]) {
      case "0":
        _0x51fb43["lHfUQ"](hideModalError, addBookError);
        continue;
      case "1":
        if (isFrozen) {
          _0x51fb43[_0x51eb70(0x219)](
            toast,
            "Akun\x20Anda\x20dibekukan.\x20Tidak\x20dapat\x20menambah\x20buku.",
            !![],
          );
          return;
        }
        continue;
      case "2":
        addPdfFileName["textContent"] = _0x51fb43[_0x51eb70(0x21a)];
        continue;
      case "3":
        await _0x51fb43[_0x51eb70(0x1d4)](loadCategories);
        continue;
      case "4":
        openModal(modalAddBook);
        continue;
      case "5":
        addCoverFileName[_0x51eb70(0x2b7)] = _0x51fb43[_0x51eb70(0x192)];
        continue;
      case "6":
        addIsbn[_0x51eb70(0x2b9)] = ![];
        continue;
      case "7":
        document[_0x51eb70(0x16b)](_0x51fb43["MbQBE"])[_0x51eb70(0x2b7)] =
          _0x51fb43[_0x51eb70(0x296)];
        continue;
      case "8":
        addBookFiles[_0x51eb70(0x225)] = ![];
        continue;
      case "9":
        editingBookIsbn = "";
        continue;
      case "10":
        formAddBook[_0x51eb70(0x23c)]();
        continue;
      case "11":
        submitAddBook[_0x51eb70(0x2b7)] = _0x51fb43[_0x51eb70(0x1a9)];
        continue;
    }
    break;
  }
}
function closeAddBookModal() {
  const _0x3896c2 = _0x222c87,
    _0xeb595 = {
      Tothv: function (_0x4dc39f, _0x8298c8) {
        return _0x4dc39f(_0x8298c8);
      },
      sfLdH: _0x3896c2(0x1a1),
      mJhVn: _0x3896c2(0x168),
      qYqiD: "Tambah\x20Buku\x20Baru",
      upvgb: _0x3896c2(0x1c9),
    };
  (_0xeb595[_0x3896c2(0x1a2)](closeModal, modalAddBook),
    formAddBook["reset"](),
    (editingBookIsbn = ""),
    (pendingNewBookUpload = ![]),
    (addIsbn[_0x3896c2(0x2b9)] = ![]),
    (addBookFiles[_0x3896c2(0x225)] = ![]),
    (addCoverFileName["textContent"] =
      "Klik\x20untuk\x20memilih\x20sampul\x20(.jpg)"),
    (addPdfFileName[_0x3896c2(0x2b7)] = _0xeb595["sfLdH"]),
    (document["getElementById"](_0xeb595["mJhVn"])[_0x3896c2(0x2b7)] =
      _0xeb595[_0x3896c2(0x17c)]),
    (submitAddBook[_0x3896c2(0x2b7)] = _0xeb595[_0x3896c2(0x188)]),
    _0xeb595["Tothv"](hideModalError, addBookError));
}
async function openEditBookModal(_0x25e532) {
  const _0x242cce = _0x222c87,
    _0xb0e246 = {
      vcrpp: _0x242cce(0x15f),
      RBHdF: _0x242cce(0x168),
      rWFTT: function (_0x330370, _0x54c899) {
        return _0x330370(_0x54c899);
      },
      TfTNj: "Simpan\x20Perubahan",
      NkrzL: function (_0xdf9dc) {
        return _0xdf9dc();
      },
      RBkBp: function (_0x1ebff5, _0x546d80) {
        return _0x1ebff5(_0x546d80);
      },
    },
    _0x3bad63 = _0xb0e246[_0x242cce(0x1cd)]["split"]("|");
  let _0x186c87 = 0x0;
  while (!![]) {
    switch (_0x3bad63[_0x186c87++]) {
      case "0":
        addPenulis[_0x242cce(0x259)] = _0x25e532["nama_penulis"] || "";
        continue;
      case "1":
        addSinopsis[_0x242cce(0x259)] = _0x25e532[_0x242cce(0x16a)] || "";
        continue;
      case "2":
        addHalaman[_0x242cce(0x259)] = String(
          _0x25e532[_0x242cce(0x1c8)] || "",
        );
        continue;
      case "3":
        addIsbn[_0x242cce(0x2b9)] = !![];
        continue;
      case "4":
        document[_0x242cce(0x16b)](_0xb0e246[_0x242cce(0x1dc)])["textContent"] =
          _0x242cce(0x1e0);
        continue;
      case "5":
        if (isFrozen) return;
        continue;
      case "6":
        addIsbn[_0x242cce(0x259)] = _0x25e532[_0x242cce(0x29a)];
        continue;
      case "7":
        _0xb0e246[_0x242cce(0x1ad)](openModal, modalAddBook);
        continue;
      case "8":
        addPenerbit[_0x242cce(0x259)] = _0x25e532[_0x242cce(0x280)] || "";
        continue;
      case "9":
        submitAddBook[_0x242cce(0x2b7)] = _0xb0e246[_0x242cce(0x28f)];
        continue;
      case "10":
        await _0xb0e246[_0x242cce(0x1c0)](loadCategories);
        continue;
      case "11":
        editingBookIsbn = _0x25e532[_0x242cce(0x29a)];
        continue;
      case "12":
        _0xb0e246["RBkBp"](hideModalError, addBookError);
        continue;
      case "13":
        addBookFiles["hidden"] = !![];
        continue;
      case "14":
        addKategori[_0x242cce(0x259)] = _0xb0e246["rWFTT"](
          String,
          _0x25e532[_0x242cce(0x205)],
        );
        continue;
      case "15":
        addJudul["value"] = _0x25e532[_0x242cce(0x234)] || "";
        continue;
      case "16":
        formAddBook[_0x242cce(0x23c)]();
        continue;
      case "17":
        addTahun[_0x242cce(0x259)] = _0x25e532[_0x242cce(0x25c)] || "";
        continue;
    }
    break;
  }
}
async function handleAddBookSubmit(_0x2939e9) {
  const _0x18172f = _0x222c87,
    _0x46d453 = {
      QFstx: function (_0x3a222d, _0x49b778) {
        return _0x3a222d(_0x49b778);
      },
      xJngy: function (_0x1923e6, _0x1cf11e, _0x5ddb52) {
        return _0x1923e6(_0x1cf11e, _0x5ddb52);
      },
      ASXWl: _0x18172f(0x17a),
      FKdtP: function (_0x21f2bf, _0x214a46, _0x14a7fa) {
        return _0x21f2bf(_0x214a46, _0x14a7fa);
      },
      Yztoq: function (_0xe0e5ce, _0x5ae6f9) {
        return _0xe0e5ce(_0x5ae6f9);
      },
      JsrvD: function (_0x30a3e2, _0x3dcc37, _0x1e43bb, _0x4018a9, _0x47d8bd) {
        return _0x30a3e2(_0x3dcc37, _0x1e43bb, _0x4018a9, _0x47d8bd);
      },
      McsPi: "Unggah\x20File",
      HXazl: "Simpan\x20Perubahan",
      KAOsk: "Simpan\x20Buku",
      NTbmm: _0x18172f(0x266),
      Dgxnw: _0x18172f(0x271),
      RFrkF: _0x18172f(0x189),
      ShejS: _0x18172f(0x2c1),
      TUWIf: function (_0x44f537, _0x49a198, _0x53fb3a, _0x5155e5, _0xd318e0) {
        return _0x44f537(_0x49a198, _0x53fb3a, _0x5155e5, _0xd318e0);
      },
      rNgMJ: "Terjadi\x20kesalahan\x20saat\x20mengunggah\x20file.",
      vzuxy: function (_0x665695, _0x26c2b5) {
        return _0x665695 instanceof _0x26c2b5;
      },
      lENkg: function (_0x47f835, _0x1094b3) {
        return _0x47f835 === _0x1094b3;
      },
      MMezn: function (_0x138790, _0x40a9c4) {
        return _0x138790(_0x40a9c4);
      },
      mefTp: "modal-add-title",
      wwZZY: _0x18172f(0x258),
      KzJND: _0x18172f(0x18d),
      qUpyk: function (_0x5039ea, _0x45e5bf, _0x214303) {
        return _0x5039ea(_0x45e5bf, _0x214303);
      },
      mrYam: function (_0xda2f9b) {
        return _0xda2f9b();
      },
      AdFZO: _0x18172f(0x1ea),
      pFhUG: _0x18172f(0x254),
      NVddZ: "Buku\x20berhasil\x20ditambahkan.",
      NxEnu: function (_0x576c79, _0x43a8f9) {
        return _0x576c79 instanceof _0x43a8f9;
      },
      ewfQa: _0x18172f(0x28e),
      ZmOmN: function (_0x2cd647, _0x203364, _0x4139c4) {
        return _0x2cd647(_0x203364, _0x4139c4);
      },
      RWxdC: function (_0x537b0c, _0x5b0318, _0x1ba927, _0x461474) {
        return _0x537b0c(_0x5b0318, _0x1ba927, _0x461474);
      },
    };
  (_0x2939e9["preventDefault"](),
    _0x46d453[_0x18172f(0x226)](hideModalError, addBookError));
  const _0x30d966 = addIsbn[_0x18172f(0x259)][_0x18172f(0x1b6)](),
    _0x5a2fe7 = addJudul[_0x18172f(0x259)]["trim"](),
    _0x18af1a = addKategori[_0x18172f(0x259)],
    _0x5aa2dd = addPenulis[_0x18172f(0x259)][_0x18172f(0x1b6)](),
    _0x3d30c3 = addPenerbit[_0x18172f(0x259)][_0x18172f(0x1b6)](),
    _0x360cc9 = addTahun[_0x18172f(0x259)][_0x18172f(0x1b6)](),
    _0x1aafdf = addHalaman[_0x18172f(0x259)][_0x18172f(0x1b6)](),
    _0x20adf8 = addSinopsis[_0x18172f(0x259)][_0x18172f(0x1b6)](),
    _0x314128 = addCover["files"][0x0] || null,
    _0x22feeb = addPdf[_0x18172f(0x2c2)][0x0] || null;
  if (
    !_0x30d966 ||
    !_0x5a2fe7 ||
    !_0x18af1a ||
    !_0x5aa2dd ||
    !_0x3d30c3 ||
    !_0x360cc9 ||
    !_0x1aafdf
  ) {
    _0x46d453[_0x18172f(0x1f7)](
      showModalError,
      addBookError,
      _0x46d453[_0x18172f(0x28a)],
    );
    return;
  }
  const _0x1f0c7b = {
    judul_buku: _0x5a2fe7,
    id_kategori: _0x46d453["FKdtP"](parseInt, _0x18af1a, 0xa),
    nama_penulis: _0x5aa2dd,
    nama_penerbit: _0x3d30c3,
    tahun_terbit: _0x46d453[_0x18172f(0x25b)](String, parseInt(_0x360cc9, 0xa)),
    jumlah_halaman: parseInt(_0x1aafdf, 0xa),
  };
  _0x1f0c7b[_0x18172f(0x16a)] = _0x20adf8;
  const _0x38f5e1 = _0x46d453[_0x18172f(0x25b)](Boolean, editingBookIsbn);
  let _0x1cacab = ![];
  _0x46d453["JsrvD"](
    setSubmitLoading,
    submitAddBook,
    !![],
    pendingNewBookUpload
      ? _0x46d453[_0x18172f(0x150)]
      : _0x38f5e1
        ? _0x46d453["HXazl"]
        : _0x46d453[_0x18172f(0x1bf)],
    _0x46d453[_0x18172f(0x200)],
  );
  try {
    editingBookIsbn
      ? await _0x46d453[_0x18172f(0x1f7)](
          api,
          _0x18172f(0x218)[_0x18172f(0x1ac)](
            _0x46d453[_0x18172f(0x226)](encodeURIComponent, editingBookIsbn),
            _0x18172f(0x223),
          ),
          { method: _0x46d453[_0x18172f(0x264)], json: _0x1f0c7b },
        )
      : (await _0x46d453[_0x18172f(0x1f7)](api, _0x46d453[_0x18172f(0x2a3)], {
          method: _0x46d453["Dgxnw"],
          json: { ..._0x1f0c7b, isbn: _0x30d966 },
        }),
        (_0x1cacab = !![]),
        (editingBookIsbn = _0x30d966),
        (addIsbn[_0x18172f(0x2b9)] = !![]));
    if (_0x314128 || _0x22feeb) {
      setSubmitLoading(
        submitAddBook,
        !![],
        _0x18172f(0x162),
        _0x46d453[_0x18172f(0x1fa)],
      );
      try {
        await _0x46d453[_0x18172f(0x212)](
          uploadBookFiles,
          editingBookIsbn,
          _0x314128,
          _0x22feeb,
          addBookError,
        );
      } catch (_0x495672) {
        const _0x2bee98 =
          _0x495672 instanceof ApiError
            ? _0x495672[_0x18172f(0x1e7)]
            : _0x46d453["rNgMJ"];
        if (
          _0x46d453[_0x18172f(0x2a2)](_0x495672, ApiError) &&
          _0x46d453["lENkg"](_0x495672[_0x18172f(0x2c9)], 0x193)
        )
          _0x46d453[_0x18172f(0x1c7)](applyFrozenState, !![]);
        _0x1cacab &&
          ((pendingNewBookUpload = !![]),
          (addBookFiles[_0x18172f(0x225)] = ![]),
          (document[_0x18172f(0x16b)](_0x46d453["mefTp"])[_0x18172f(0x2b7)] =
            _0x46d453[_0x18172f(0x2a6)]));
        (showModalError(
          addBookError,
          ""
            [
              _0x18172f(0x1ac)
            ](_0x1cacab ? _0x46d453[_0x18172f(0x2ba)] : _0x18172f(0x2b8), "\x20")
            [_0x18172f(0x1ac)](_0x2bee98, _0x18172f(0x213)),
        ),
          _0x46d453[_0x18172f(0x293)](toast, _0x2bee98, !![]),
          (currentPage = 0x1),
          await loadBooks(),
          await _0x46d453["mrYam"](loadStats));
        return;
      }
    }
    const _0x3c866d = pendingNewBookUpload;
    (closeAddBookModal(),
      _0x46d453[_0x18172f(0x226)](
        toast,
        _0x314128 || _0x22feeb
          ? _0x18172f(0x17e)
          : _0x3c866d
            ? _0x46d453[_0x18172f(0x186)]
            : _0x38f5e1
              ? _0x46d453["pFhUG"]
              : _0x46d453[_0x18172f(0x1c2)],
      ),
      (currentPage = 0x1),
      await loadBooks(),
      await loadStats());
  } catch (_0x3f3d0c) {
    const _0x25296b = _0x46d453[_0x18172f(0x1b1)](_0x3f3d0c, ApiError)
      ? _0x3f3d0c["message"]
      : _0x46d453[_0x18172f(0x215)];
    (_0x46d453[_0x18172f(0x1af)](showModalError, addBookError, _0x25296b),
      _0x46d453[_0x18172f(0x293)](toast, _0x25296b, !![]));
  } finally {
    _0x46d453[_0x18172f(0x1aa)](
      setSubmitLoading,
      submitAddBook,
      ![],
      pendingNewBookUpload
        ? _0x46d453[_0x18172f(0x150)]
        : editingBookIsbn
          ? "Simpan\x20Perubahan"
          : _0x46d453["KAOsk"],
    );
  }
}
async function uploadBookFiles(
  _0xeacbc2,
  _0x563f3a,
  _0x20fca7,
  _0x2899d9 = uploadAnnouncement,
) {
  const _0x3a6160 = _0x222c87,
    _0x190728 = {
      GnFAI: function (_0x5d3cee, _0x5d6f5c, _0xe9dfa6, _0xc304d0, _0x59059e) {
        return _0x5d3cee(_0x5d6f5c, _0xe9dfa6, _0xc304d0, _0x59059e);
      },
      IWtOQ: "jpg",
      nxMaq: _0x3a6160(0x240),
      IZjXN: function (_0x2dc623, _0x3696f0, _0x505d50, _0x2b4a45, _0x4f6083) {
        return _0x2dc623(_0x3696f0, _0x505d50, _0x2b4a45, _0x4f6083);
      },
      OhSRo: "pdf",
      KiAnX: _0x3a6160(0x154),
      jUeQD: _0x3a6160(0x24d),
      QtXHh: _0x3a6160(0x164),
      eofUd: function (_0x3019b3, _0x58f5b7, _0xb0e99c) {
        return _0x3019b3(_0x58f5b7, _0xb0e99c);
      },
      Lheii: function (_0x71679f, _0x1fd47c) {
        return _0x71679f(_0x1fd47c);
      },
      HSVYh: _0x3a6160(0x271),
    };
  (_0x190728["GnFAI"](
    warnInvalidFileType,
    _0x563f3a,
    [_0x190728[_0x3a6160(0x2a5)]],
    _0x190728[_0x3a6160(0x161)],
    _0x2899d9,
  ),
    _0x190728[_0x3a6160(0x1cc)](
      warnInvalidFileType,
      _0x20fca7,
      [_0x190728[_0x3a6160(0x286)]],
      _0x190728[_0x3a6160(0x191)],
      _0x2899d9,
    ));
  const _0x52f23d = new FormData();
  if (_0x563f3a) _0x52f23d[_0x3a6160(0x255)](_0x190728["jUeQD"], _0x563f3a);
  if (_0x20fca7)
    _0x52f23d[_0x3a6160(0x255)](_0x190728[_0x3a6160(0x1ff)], _0x20fca7);
  await _0x190728[_0x3a6160(0x1ed)](
    api,
    "/api/books/"[_0x3a6160(0x1ac)](
      _0x190728["Lheii"](encodeURIComponent, _0xeacbc2),
      "/upload-files",
    ),
    { method: _0x190728[_0x3a6160(0x1ee)], form: _0x52f23d },
  );
}
function openUploadModal(_0x3844f2) {
  const _0x4140dd = _0x222c87,
    _0x5acb27 = {
      SFHgM: "1|5|0|3|8|4|7|2|6",
      OPvXd: function (_0x1cabcb, _0x14df4d) {
        return _0x1cabcb(_0x14df4d);
      },
      bSjEd: _0x4140dd(0x28d),
      FptjY: function (_0x5bc851) {
        return _0x5bc851();
      },
    },
    _0x5e6d3a = _0x5acb27["SFHgM"][_0x4140dd(0x2aa)]("|");
  let _0x42f885 = 0x0;
  while (!![]) {
    switch (_0x5e6d3a[_0x42f885++]) {
      case "0":
        uploadIsbnField[_0x4140dd(0x259)] = _0x3844f2;
        continue;
      case "1":
        if (isFrozen) return;
        continue;
      case "2":
        _0x5acb27["OPvXd"](hideModalError, uploadError);
        continue;
      case "3":
        formUpload["reset"]();
        continue;
      case "4":
        pdfFileName["textContent"] = _0x5acb27[_0x4140dd(0x1f4)];
        continue;
      case "5":
        currentUploadIsbn = _0x3844f2;
        continue;
      case "6":
        _0x5acb27[_0x4140dd(0x2c8)](openModal, modalUpload);
        continue;
      case "7":
        _0x5acb27[_0x4140dd(0x2b2)](hideAnnouncement);
        continue;
      case "8":
        coverFileName["textContent"] =
          "Klik\x20untuk\x20memilih\x20file\x20sampul\x20(.jpg)";
        continue;
    }
    break;
  }
}
function closeUploadModalFn() {
  const _0x526075 = _0x222c87,
    _0x2050fc = {
      OLwMH: _0x526075(0x202),
      RtViL: function (_0x103c09, _0x32fb23) {
        return _0x103c09(_0x32fb23);
      },
      xFgNn: function (_0x14a03f) {
        return _0x14a03f();
      },
    },
    _0xe0c46a = _0x2050fc[_0x526075(0x28b)][_0x526075(0x2aa)]("|");
  let _0x55182f = 0x0;
  while (!![]) {
    switch (_0xe0c46a[_0x55182f++]) {
      case "0":
        _0x2050fc[_0x526075(0x21b)](hideModalError, uploadError);
        continue;
      case "1":
        formUpload[_0x526075(0x23c)]();
        continue;
      case "2":
        closeModal(modalUpload);
        continue;
      case "3":
        currentUploadIsbn = "";
        continue;
      case "4":
        _0x2050fc["xFgNn"](hideAnnouncement);
        continue;
    }
    break;
  }
}
async function handleUploadSubmit(_0x17718e) {
  const _0x4f5bd6 = _0x222c87,
    _0x22d8c4 = {
      FvyTQ: function (_0x178edb) {
        return _0x178edb();
      },
      wyZlA: function (_0x4bc29d, _0x195545) {
        return _0x4bc29d(_0x195545);
      },
      WrPjF: function (_0x16ed51, _0x367c93, _0x1ad059) {
        return _0x16ed51(_0x367c93, _0x1ad059);
      },
      uZQqi: _0x4f5bd6(0x2c3),
      fvcEO: function (_0x1c77dd, _0x56ce6b, _0x157067, _0x250e1b, _0x54233b) {
        return _0x1c77dd(_0x56ce6b, _0x157067, _0x250e1b, _0x54233b);
      },
      EfCSd: _0x4f5bd6(0x162),
      xwmJk: _0x4f5bd6(0x2c1),
      fivvK: function (_0x18b4e4, _0x5eec7a) {
        return _0x18b4e4(_0x5eec7a);
      },
      kjLoG: _0x4f5bd6(0x27b),
      YKdHp: function (_0xca1aa7, _0x4bfae2) {
        return _0xca1aa7 instanceof _0x4bfae2;
      },
      yFPRN: _0x4f5bd6(0x1dd),
      UDEnF: function (_0x52e6b8, _0x346aef) {
        return _0x52e6b8 === _0x346aef;
      },
      ONFNf: function (_0x2a540f, _0xe8700d, _0x173537) {
        return _0x2a540f(_0xe8700d, _0x173537);
      },
      VObFu: _0x4f5bd6(0x18b),
    };
  (_0x17718e["preventDefault"](),
    _0x22d8c4[_0x4f5bd6(0x1b9)](hideAnnouncement),
    _0x22d8c4[_0x4f5bd6(0x174)](hideModalError, uploadError));
  const _0x4db93a = uploadCover[_0x4f5bd6(0x2c2)][0x0] || null,
    _0x8b6ed8 = uploadPdf[_0x4f5bd6(0x2c2)][0x0] || null;
  if (!_0x4db93a && !_0x8b6ed8) {
    _0x22d8c4["WrPjF"](
      showModalError,
      uploadError,
      _0x22d8c4[_0x4f5bd6(0x16f)],
    );
    return;
  }
  _0x22d8c4[_0x4f5bd6(0x1d6)](
    setSubmitLoading,
    submitUpload,
    !![],
    _0x22d8c4[_0x4f5bd6(0x193)],
    _0x22d8c4["xwmJk"],
  );
  try {
    const _0x3c1a73 = currentUploadIsbn || uploadIsbnField[_0x4f5bd6(0x259)];
    (await uploadBookFiles(_0x3c1a73, _0x4db93a, _0x8b6ed8),
      closeUploadModalFn(),
      _0x22d8c4[_0x4f5bd6(0x1e9)](toast, _0x22d8c4[_0x4f5bd6(0x273)]),
      await _0x22d8c4["FvyTQ"](loadBooks));
  } catch (_0x19a956) {
    if (_0x22d8c4[_0x4f5bd6(0x236)](_0x19a956, ApiError)) {
      if (_0x19a956[_0x4f5bd6(0x2c9)] === 0x193)
        (_0x22d8c4[_0x4f5bd6(0x1e9)](applyFrozenState, !![]),
          _0x22d8c4["WrPjF"](
            showAnnouncement,
            _0x22d8c4[_0x4f5bd6(0x171)],
            !![],
          ),
          toast(_0x4f5bd6(0x22b), !![]));
      else {
        const _0x51494f =
          _0x19a956[_0x4f5bd6(0x1e7)] || "Gagal\x20mengunggah\x20file.";
        if (_0x22d8c4[_0x4f5bd6(0x2af)](_0x19a956[_0x4f5bd6(0x2c9)], 0x190))
          _0x22d8c4[_0x4f5bd6(0x289)](showAnnouncement, _0x51494f, !![]);
        else
          _0x22d8c4[_0x4f5bd6(0x289)](showModalError, uploadError, _0x51494f);
        toast(_0x51494f, !![]);
      }
    } else
      (showModalError(uploadError, _0x4f5bd6(0x1f6)),
        _0x22d8c4["ONFNf"](toast, _0x22d8c4[_0x4f5bd6(0x187)], !![]));
  } finally {
    setSubmitLoading(submitUpload, ![], _0x22d8c4[_0x4f5bd6(0x193)]);
  }
}
async function handleDeleteBook(_0x362118, _0x48c0f3) {
  const _0x54d561 = _0x222c87,
    _0x5dae57 = {
      rVqVc: function (_0x33791a, _0x4d9c4b, _0x4bab98) {
        return _0x33791a(_0x4d9c4b, _0x4bab98);
      },
      ILbtv: function (_0x300a9e, _0x523db1) {
        return _0x300a9e(_0x523db1);
      },
      KZhvX: _0x54d561(0x1fb),
      TrEpJ: function (_0x2f4a69, _0xa8a991, _0x43b555) {
        return _0x2f4a69(_0xa8a991, _0x43b555);
      },
      NvrLK: function (_0xaf5620) {
        return _0xaf5620();
      },
      EPxlI: function (_0xe112a1, _0x4f03af) {
        return _0xe112a1 === _0x4f03af;
      },
      swljR: function (_0x446df9, _0x4b60de) {
        return _0x446df9 > _0x4b60de;
      },
      IJTPb: function (_0x27bc81) {
        return _0x27bc81();
      },
      wAGvg: function (_0x422b61, _0x194b44) {
        return _0x422b61 instanceof _0x194b44;
      },
      jpDpm: _0x54d561(0x272),
    },
    _0x58e335 = window["confirm"](
      "Apakah\x20Anda\x20yakin\x20ingin\x20menghapus\x20buku\x20\x22"
        ["concat"](_0x48c0f3, "\x22\x20(ISBN:\x20")
        [_0x54d561(0x1ac)](_0x362118, _0x54d561(0x283)),
    );
  if (!_0x58e335) return;
  try {
    const _0x3282e3 = await _0x5dae57[_0x54d561(0x1b3)](
        api,
        _0x54d561(0x218)[_0x54d561(0x1ac)](
          _0x5dae57[_0x54d561(0x243)](encodeURIComponent, _0x362118),
        ),
        { method: _0x5dae57[_0x54d561(0x176)] },
      ),
      _0x32d3b8 = adminTbody[_0x54d561(0x1b0)](
        _0x54d561(0x159)["concat"](CSS[_0x54d561(0x1d5)](_0x362118), "\x22]"),
      );
    if (_0x32d3b8) _0x32d3b8[_0x54d561(0x246)]();
    _0x3282e3 &&
    _0x3282e3[_0x54d561(0x278)] &&
    _0x3282e3[_0x54d561(0x278)][_0x54d561(0x285)]
      ? _0x5dae57[_0x54d561(0x22d)](
          toast,
          _0x54d561(0x2c5)
            [_0x54d561(0x1ac)](_0x48c0f3, "\x22\x20dihapus,\x20tetapi\x20")
            [
              _0x54d561(0x1ac)
            ](_0x3282e3[_0x54d561(0x278)][_0x54d561(0x285)], _0x54d561(0x157)),
          !![],
        )
      : _0x5dae57[_0x54d561(0x243)](
          toast,
          _0x54d561(0x2c5)[_0x54d561(0x1ac)](_0x48c0f3, _0x54d561(0x29d)),
        );
    await _0x5dae57[_0x54d561(0x1cb)](loadStats);
    if (
      _0x5dae57[_0x54d561(0x20b)](
        adminTbody[_0x54d561(0x238)][_0x54d561(0x285)],
        0x0,
      )
    ) {
      if (_0x5dae57[_0x54d561(0x26d)](currentPage, 0x1)) currentPage--;
      await _0x5dae57[_0x54d561(0x208)](loadBooks);
    }
  } catch (_0x2bc708) {
    const _0x21c1bb = _0x5dae57[_0x54d561(0x230)](_0x2bc708, ApiError)
      ? _0x2bc708["message"]
      : _0x5dae57[_0x54d561(0x220)];
    _0x5dae57[_0x54d561(0x1b3)](toast, _0x21c1bb, !![]);
  }
}
async function guardAdmin() {
  const _0x35f30b = _0x222c87,
    _0x5a9ac5 = {
      sEZQw: function (_0xecf7f7, _0x50a88b, _0x372413) {
        return _0xecf7f7(_0x50a88b, _0x372413);
      },
      qTlOs: "/api/auth/me",
      ZGFVP: function (_0xa9d1c1, _0x57de82) {
        return _0xa9d1c1 === _0x57de82;
      },
      KRUTW: function (_0x4b8d8a, _0x8b205b) {
        return _0x4b8d8a(_0x8b205b);
      },
      oBBOD: function (_0x34ab23, _0x26071c) {
        return _0x34ab23 !== _0x26071c;
      },
      bprlI: _0x35f30b(0x261),
    };
  if (!session[_0x35f30b(0x197)])
    return (
      location[_0x35f30b(0x1ef)](
        _0x35f30b(0x2bc)[_0x35f30b(0x1ac)](
          encodeURIComponent(location["pathname"]),
        ),
      ),
      new Promise(() => {})
    );
  let _0x3e9502;
  try {
    _0x3e9502 = await _0x5a9ac5[_0x35f30b(0x282)](api, _0x5a9ac5["qTlOs"], {
      redirectOn401: ![],
    });
  } catch (_0x5c57d2) {
    if (
      _0x5c57d2 instanceof ApiError &&
      _0x5a9ac5[_0x35f30b(0x1f3)](_0x5c57d2[_0x35f30b(0x2c9)], 0x191)
    )
      return (
        location["assign"](
          _0x35f30b(0x1bc)[_0x35f30b(0x1ac)](
            _0x5a9ac5[_0x35f30b(0x29f)](
              encodeURIComponent,
              location[_0x35f30b(0x196)],
            ),
          ),
        ),
        new Promise(() => {})
      );
    throw _0x5c57d2;
  }
  if (
    !_0x3e9502 ||
    _0x5a9ac5[_0x35f30b(0x27e)](
      _0x3e9502[_0x35f30b(0x297)]?.[_0x35f30b(0x26a)](),
      _0x5a9ac5[_0x35f30b(0x279)],
    )
  )
    return (location[_0x35f30b(0x1ef)]("/"), new Promise(() => {}));
  return _0x3e9502;
}
async function init() {
  const _0x3c2fa3 = _0x222c87,
    _0xabe07f = {
      PYhfm: _0x3c2fa3(0x299),
      VKDnP: _0x3c2fa3(0x1a1),
      qvqaV: function (_0x33373e, _0x31404d) {
        return _0x33373e(_0x31404d);
      },
      TEwWq: function (_0x2c8586) {
        return _0x2c8586();
      },
      htmAL: _0x3c2fa3(0x29e),
      hKRLX: function (_0x364432) {
        return _0x364432();
      },
      bmHff: _0x3c2fa3(0x28d),
      BkdAt: function (_0x47761a) {
        return _0x47761a();
      },
      lpNbb: function (_0x58b4ff, _0x4fa822) {
        return _0x58b4ff > _0x4fa822;
      },
      iryRH: function (_0x1a7aa9) {
        return _0x1a7aa9();
      },
      nOCcS: function (_0x2cf68d, _0x415f38) {
        return _0x2cf68d < _0x415f38;
      },
      kspRO: "smooth",
      tzulF: function (_0x1a9600, _0x25d708) {
        return _0x1a9600 === _0x25d708;
      },
      mTZnM: _0x3c2fa3(0x23e),
      sfehM: "profile-username",
      RMnvf: "profile-phone",
      xArjh: "profile-status",
      xPpUD: _0x3c2fa3(0x1c3),
      YggoP: "Normal",
      yjAlM: _0x3c2fa3(0x248),
      nPfne: "close-profile-modal",
      vJiSQ: _0x3c2fa3(0x2b3),
      eITRO: _0x3c2fa3(0x214),
      jDfra: "submit",
      epOwB: function (_0x29c418, _0x3e3708, _0x57f93e) {
        return _0x29c418(_0x3e3708, _0x57f93e);
      },
      kmnPx: _0x3c2fa3(0x24f),
      GwbJa: function (_0x488c7c) {
        return _0x488c7c();
      },
      ACuEP: function (_0x262e53) {
        return _0x262e53();
      },
    },
    _0xa272a7 = await _0xabe07f[_0x3c2fa3(0x294)](guardAdmin);
  _0xabe07f[_0x3c2fa3(0x1fc)](
    _0xa272a7["account_status"],
    _0xabe07f["mTZnM"],
  ) && applyFrozenState(!![]);
  ((document[_0x3c2fa3(0x16b)](_0xabe07f[_0x3c2fa3(0x15e)])["textContent"] =
    _0xa272a7[_0x3c2fa3(0x247)]),
    (document[_0x3c2fa3(0x16b)](_0x3c2fa3(0x1ca))[_0x3c2fa3(0x2b7)] =
      _0xa272a7["email"]),
    (document[_0x3c2fa3(0x16b)](_0xabe07f[_0x3c2fa3(0x28c)])["textContent"] =
      _0xa272a7[_0x3c2fa3(0x21d)] || _0x3c2fa3(0x165)),
    (document[_0x3c2fa3(0x16b)](_0xabe07f["xArjh"])["textContent"] =
      _0xa272a7[_0x3c2fa3(0x1a3)] === _0xabe07f[_0x3c2fa3(0x1a4)]
        ? _0xabe07f[_0x3c2fa3(0x237)]
        : _0xabe07f[_0x3c2fa3(0x24c)]),
    logoutBtn[_0x3c2fa3(0x287)](_0xabe07f[_0x3c2fa3(0x2b0)], logout),
    menuBookList[_0x3c2fa3(0x287)](_0xabe07f["yjAlM"], () => {
      const _0x1bf64b = _0x3c2fa3;
      adminMenu[_0x1bf64b(0x1e2)] = ![];
    }),
    profileBtn[_0x3c2fa3(0x287)](_0xabe07f[_0x3c2fa3(0x2b0)], () => {
      const _0x1973c0 = _0x3c2fa3;
      ((adminMenu[_0x1973c0(0x1e2)] = ![]), openModal(modalProfile));
    }),
    document[_0x3c2fa3(0x16b)](_0xabe07f[_0x3c2fa3(0x211)])[_0x3c2fa3(0x287)](
      _0xabe07f["yjAlM"],
      () => closeModal(modalProfile),
    ),
    document[_0x3c2fa3(0x16b)](_0xabe07f[_0x3c2fa3(0x244)])[_0x3c2fa3(0x287)](
      _0xabe07f[_0x3c2fa3(0x2b0)],
      () => closeModal(modalProfile),
    ),
    modalProfile[_0x3c2fa3(0x287)]("click", handleBackdropClick),
    btnAddBook[_0x3c2fa3(0x287)](_0xabe07f[_0x3c2fa3(0x2b0)], openAddBookModal),
    addCoverDropZone[_0x3c2fa3(0x287)](_0xabe07f[_0x3c2fa3(0x2b0)], () =>
      addCover[_0x3c2fa3(0x248)](),
    ),
    addPdfDropZone[_0x3c2fa3(0x287)](_0x3c2fa3(0x248), () =>
      addPdf[_0x3c2fa3(0x248)](),
    ),
    addCover["addEventListener"](_0xabe07f[_0x3c2fa3(0x22c)], () => {
      const _0x46d16b = _0x3c2fa3,
        _0x5ae916 = addCover[_0x46d16b(0x2c2)][0x0];
      ((addCoverFileName[_0x46d16b(0x2b7)] = _0x5ae916
        ? _0x5ae916[_0x46d16b(0x27c)]
        : _0xabe07f[_0x46d16b(0x1bb)]),
        hideModalError(addBookError));
    }),
    addPdf[_0x3c2fa3(0x287)](_0xabe07f[_0x3c2fa3(0x22c)], () => {
      const _0x4ef0d6 = _0x3c2fa3,
        _0x203d87 = addPdf[_0x4ef0d6(0x2c2)][0x0];
      ((addPdfFileName["textContent"] = _0x203d87
        ? _0x203d87[_0x4ef0d6(0x27c)]
        : _0xabe07f[_0x4ef0d6(0x1a8)]),
        _0xabe07f[_0x4ef0d6(0x206)](hideModalError, addBookError));
    }),
    closeAddModal[_0x3c2fa3(0x287)](
      _0xabe07f[_0x3c2fa3(0x2b0)],
      closeAddBookModal,
    ),
    cancelAddModal["addEventListener"](
      _0xabe07f[_0x3c2fa3(0x2b0)],
      closeAddBookModal,
    ),
    modalAddBook[_0x3c2fa3(0x287)](_0xabe07f["yjAlM"], (_0x139be9) => {
      const _0x1de3d0 = _0x3c2fa3;
      if (_0x139be9[_0x1de3d0(0x281)] === modalAddBook)
        _0xabe07f[_0x1de3d0(0x288)](closeAddBookModal);
    }),
    formAddBook[_0x3c2fa3(0x287)](
      _0xabe07f[_0x3c2fa3(0x16c)],
      handleAddBookSubmit,
    ),
    closeUploadModal["addEventListener"](
      _0xabe07f[_0x3c2fa3(0x2b0)],
      closeUploadModalFn,
    ),
    cancelUploadModal[_0x3c2fa3(0x287)](
      _0xabe07f[_0x3c2fa3(0x2b0)],
      closeUploadModalFn,
    ),
    modalUpload["addEventListener"](
      _0xabe07f[_0x3c2fa3(0x2b0)],
      handleBackdropClick,
    ),
    formUpload[_0x3c2fa3(0x287)](
      _0xabe07f[_0x3c2fa3(0x16c)],
      handleUploadSubmit,
    ),
    coverDropZone[_0x3c2fa3(0x287)](_0xabe07f[_0x3c2fa3(0x2b0)], () =>
      uploadCover["click"](),
    ),
    pdfDropZone[_0x3c2fa3(0x287)](_0xabe07f[_0x3c2fa3(0x2b0)], () =>
      uploadPdf["click"](),
    ),
    uploadCover[_0x3c2fa3(0x287)](_0xabe07f[_0x3c2fa3(0x22c)], () => {
      const _0x56318f = _0x3c2fa3,
        _0x254b53 = uploadCover[_0x56318f(0x2c2)][0x0];
      ((coverFileName[_0x56318f(0x2b7)] = _0x254b53
        ? _0x254b53[_0x56318f(0x27c)]
        : _0xabe07f[_0x56318f(0x21f)]),
        _0xabe07f[_0x56318f(0x294)](hideAnnouncement));
    }),
    uploadPdf[_0x3c2fa3(0x287)](_0xabe07f["eITRO"], () => {
      const _0x4d4149 = _0x3c2fa3,
        _0x321416 = uploadPdf[_0x4d4149(0x2c2)][0x0];
      ((pdfFileName["textContent"] = _0x321416
        ? _0x321416[_0x4d4149(0x27c)]
        : _0xabe07f[_0x4d4149(0x2a1)]),
        _0xabe07f["BkdAt"](hideAnnouncement));
    }));
  const _0x4bd147 = _0xabe07f["epOwB"](
    debounce,
    () => {
      const _0xa6f9a5 = _0x3c2fa3;
      ((currentSearch = adminSearch[_0xa6f9a5(0x259)]),
        (currentPage = 0x1),
        _0xabe07f[_0xa6f9a5(0x19f)](loadBooks));
    },
    0x190,
  );
  (adminSearch[_0x3c2fa3(0x287)](_0x3c2fa3(0x222), _0x4bd147),
    prevPageBtn["addEventListener"](_0x3c2fa3(0x248), () => {
      const _0x3b9000 = _0x3c2fa3;
      _0xabe07f[_0x3b9000(0x1bd)](currentPage, 0x1) &&
        (currentPage--,
        _0xabe07f[_0x3b9000(0x16d)](loadBooks),
        window[_0x3b9000(0x19e)]({ top: 0x0, behavior: _0x3b9000(0x1da) }));
    }),
    nextPageBtn[_0x3c2fa3(0x287)](_0xabe07f[_0x3c2fa3(0x2b0)], () => {
      const _0x5f0a2d = _0x3c2fa3;
      _0xabe07f[_0x5f0a2d(0x227)](currentPage, totalPages) &&
        (currentPage++,
        _0xabe07f[_0x5f0a2d(0x16d)](loadBooks),
        window[_0x5f0a2d(0x19e)]({
          top: 0x0,
          behavior: _0xabe07f[_0x5f0a2d(0x194)],
        }));
    }),
    document[_0x3c2fa3(0x287)](_0xabe07f["kmnPx"], handleKeydown),
    await _0xabe07f["GwbJa"](loadStats),
    await _0xabe07f[_0x3c2fa3(0x207)](loadBooks));
}
init();
