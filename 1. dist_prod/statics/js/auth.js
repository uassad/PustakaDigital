const _0x59d4e6 = _0x3c00;
(function (_0x546ea0, _0x80714a) {
  const _0x539e1e = _0x3c00,
    _0x3ff7ad = _0x546ea0();
  while (!![]) {
    try {
      const _0x57fdbf =
        -parseInt(_0x539e1e(0x162)) / 0x1 +
        (-parseInt(_0x539e1e(0x16a)) / 0x2) *
          (-parseInt(_0x539e1e(0x157)) / 0x3) +
        -parseInt(_0x539e1e(0x172)) / 0x4 +
        (parseInt(_0x539e1e(0x14d)) / 0x5) *
          (parseInt(_0x539e1e(0x151)) / 0x6) +
        (parseInt(_0x539e1e(0x170)) / 0x7) *
          (parseInt(_0x539e1e(0x155)) / 0x8) +
        -parseInt(_0x539e1e(0x15d)) / 0x9 +
        (-parseInt(_0x539e1e(0x156)) / 0xa) *
          (-parseInt(_0x539e1e(0x152)) / 0xb);
      if (_0x57fdbf === _0x80714a) break;
      else _0x3ff7ad["push"](_0x3ff7ad["shift"]());
    } catch (_0x365876) {
      _0x3ff7ad["push"](_0x3ff7ad["shift"]());
    }
  }
})(_0x3ce4, 0x83eda);
import { api, ApiError, session } from "./api.js";
let cached;
export async function getCurrentUser() {
  const _0x495c8b = _0x3c00,
    _0x376e64 = {
      dcpux: function (_0x41cc8f, _0x4ae2d3) {
        return _0x41cc8f === _0x4ae2d3;
      },
      HQDcU: function (_0x578fe4, _0x2d5d2b, _0x2dfd4e) {
        return _0x578fe4(_0x2d5d2b, _0x2dfd4e);
      },
      tPtuv: function (_0x1d4ec8, _0x11c54a) {
        return _0x1d4ec8 instanceof _0x11c54a;
      },
    };
  if (!session[_0x495c8b(0x16b)]) return null;
  if (_0x376e64[_0x495c8b(0x15b)](cached, undefined))
    try {
      cached = await _0x376e64[_0x495c8b(0x163)](api, _0x495c8b(0x16d), {
        redirectOn401: ![],
      });
    } catch (_0x2757e4) {
      if (!_0x376e64[_0x495c8b(0x167)](_0x2757e4, ApiError)) throw _0x2757e4;
      cached = null;
    }
  return cached;
}
function _0x3c00(_0x49df48, _0x225bad) {
  _0x49df48 = _0x49df48 - 0x14a;
  const _0x3ce41f = _0x3ce4();
  let _0x3c003a = _0x3ce41f[_0x49df48];
  if (_0x3c00["AkaOju"] === undefined) {
    var _0x150dc0 = function (_0x2b27d7) {
      const _0x9d51f9 =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0x17e34b = "",
        _0x4f5323 = "";
      for (
        let _0x18dd6d = 0x0, _0x75b7dd, _0x45ee6a, _0xd13566 = 0x0;
        (_0x45ee6a = _0x2b27d7["charAt"](_0xd13566++));
        ~_0x45ee6a &&
        ((_0x75b7dd =
          _0x18dd6d % 0x4 ? _0x75b7dd * 0x40 + _0x45ee6a : _0x45ee6a),
        _0x18dd6d++ % 0x4)
          ? (_0x17e34b += String["fromCharCode"](
              0xff & (_0x75b7dd >> ((-0x2 * _0x18dd6d) & 0x6)),
            ))
          : 0x0
      ) {
        _0x45ee6a = _0x9d51f9["indexOf"](_0x45ee6a);
      }
      for (
        let _0x23395f = 0x0, _0x17454e = _0x17e34b["length"];
        _0x23395f < _0x17454e;
        _0x23395f++
      ) {
        _0x4f5323 +=
          "%" +
          ("00" + _0x17e34b["charCodeAt"](_0x23395f)["toString"](0x10))[
            "slice"
          ](-0x2);
      }
      return decodeURIComponent(_0x4f5323);
    };
    ((_0x3c00["lVvxTq"] = _0x150dc0),
      (_0x3c00["AnPmfW"] = {}),
      (_0x3c00["AkaOju"] = !![]));
  }
  const _0x2742b5 = _0x3ce41f[0x0];
  _0x3c00["ijOrRJ"] !== _0x2742b5 &&
    ((_0x3c00["AnPmfW"] = {}), (_0x3c00["ijOrRJ"] = _0x2742b5));
  const _0x4f83eb = _0x3c00["AnPmfW"][_0x49df48];
  return (
    _0x4f83eb === undefined
      ? ((_0x3c003a = _0x3c00["lVvxTq"](_0x3c003a)),
        (_0x3c00["AnPmfW"][_0x49df48] = _0x3c003a))
      : (_0x3c003a = _0x4f83eb),
    _0x3c003a
  );
}
export async function logout() {
  const _0x19b659 = _0x3c00,
    _0x1760b3 = {
      ublLH: function (_0x8c5f5d, _0x14714c, _0x32c1a3) {
        return _0x8c5f5d(_0x14714c, _0x32c1a3);
      },
      cUnUq: "/api/auth/admin-session",
      mdbNS: _0x19b659(0x173),
      OZlgs: "same-origin",
      uVNeg: _0x19b659(0x175),
      qZWLb:
        "Failed\x20to\x20clear\x20the\x20administrator\x20session\x20cookie.",
    };
  try {
    const _0x4c3d44 = session[_0x19b659(0x16b)],
      _0x28098f = await _0x1760b3[_0x19b659(0x14e)](
        fetch,
        _0x1760b3[_0x19b659(0x153)],
        {
          method: _0x1760b3[_0x19b659(0x14b)],
          headers: _0x4c3d44
            ? { Authorization: "Bearer\x20"["concat"](_0x4c3d44) }
            : {},
          credentials: _0x1760b3[_0x19b659(0x150)],
          cache: _0x19b659(0x165),
          referrerPolicy: _0x1760b3[_0x19b659(0x16c)],
        },
      );
    if (!_0x28098f["ok"])
      throw new Error(
        "Cookie\x20cleanup\x20failed\x20("[_0x19b659(0x161)](
          _0x28098f[_0x19b659(0x14f)],
          ").",
        ),
      );
  } catch (_0x5c6abd) {
    console[_0x19b659(0x14a)](_0x1760b3[_0x19b659(0x15f)], _0x5c6abd);
  }
  (session[_0x19b659(0x171)](), location[_0x19b659(0x158)](_0x19b659(0x168)));
}
export const isAdmin = (_0x23f66e) =>
  !!_0x23f66e &&
  _0x23f66e[_0x59d4e6(0x166)][_0x59d4e6(0x164)]() === _0x59d4e6(0x160);
export async function requireLogin() {
  const _0x3c76ac = _0x59d4e6,
    _0x33ab4d = {
      kPVii: function (_0x27c707) {
        return _0x27c707();
      },
    },
    _0x2323dc = await _0x33ab4d[_0x3c76ac(0x176)](getCurrentUser);
  if (!_0x2323dc)
    return (
      location[_0x3c76ac(0x16e)](
        _0x3c76ac(0x159)["concat"](
          encodeURIComponent(location[_0x3c76ac(0x174)]),
        ),
      ),
      new Promise(() => {})
    );
  return _0x2323dc;
}
function _0x3ce4() {
  const _0x2fc109 = [
    "DwjSteG",
    "C3rHDhvZ",
    "t1PSz3m",
    "nKHwzufRrW",
    "ntm2ntCYm3jSy2z4Eq",
    "y1vUvxe",
    "CgvYC2LZDgvK",
    "otC4nJa4uM50zLrk",
    "mtbACMX6D2m",
    "ndy4owrbDxr3Aa",
    "CMvWBgfJzq",
    "l2XVz2LUp25LEhq9",
    "B1bSzuu",
    "zgnWDxG",
    "ywrKrxzLBNrmAxn0zw5LCG",
    "mZyWmZKYnereqLnuDG",
    "yMfJA19MB3j3yxjK",
    "CvPxtgi",
    "ywrTAw5PC3rYyxrVCG",
    "y29Uy2f0",
    "mtm2mZKYtgvuDe9k",
    "sffey1u",
    "Dg9mB3DLCKnHC2u",
    "BM8TC3rVCMu",
    "CM9Szq",
    "Dfb0Dxy",
    "l2XVz2LU",
    "BuvZrKW",
    "nJGYv3frwvHr",
    "Dg9Rzw4",
    "DvzozwC",
    "l2fWAs9HDxrOl21L",
    "yxnZAwDU",
    "BMf2AwDHDgLVBG",
    "mtryrLjwEfe",
    "y2XLyxi",
    "mJGWnJaZnM9xzLziDW",
    "revmrvrf",
    "Cgf0Ag5HBwu",
    "BM8TCMvMzxjYzxi",
    "A1bwAwK",
    "CMvSB2fK",
    "zxjYB3i",
    "BwrItLm",
    "DhLWzq",
    "mJu2nJqZnvD6zLDVvG",
  ];
  _0x3ce4 = function () {
    return _0x2fc109;
  };
  return _0x3ce4();
}
export function reloadOnBackForward() {
  const _0x31afa2 = _0x59d4e6,
    _0x488b1e = { oPleE: _0x31afa2(0x16f), mEsFL: "pageshow" };
  window[_0x31afa2(0x15c)](_0x488b1e[_0x31afa2(0x169)], (_0x34aa66) => {
    const _0x9ab59 = _0x31afa2,
      _0x395044 = performance["getEntriesByType"](
        _0x488b1e[_0x9ab59(0x15a)],
      )[0x0];
    if (
      _0x34aa66[_0x9ab59(0x154)] ||
      (_0x395044 && _0x395044[_0x9ab59(0x14c)] === _0x9ab59(0x15e))
    )
      location[_0x9ab59(0x177)]();
  });
}
