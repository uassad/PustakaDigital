const _0x45c57b = _0x567e;
(function (_0x27c8e6, _0x16d6d8) {
  const _0x13a367 = _0x567e,
    _0x5b5d78 = _0x27c8e6();
  while (!![]) {
    try {
      const _0x336f0b =
        (-parseInt(_0x13a367(0x15f)) / 0x1) *
          (parseInt(_0x13a367(0x16f)) / 0x2) +
        (parseInt(_0x13a367(0x171)) / 0x3) *
          (-parseInt(_0x13a367(0x163)) / 0x4) +
        (parseInt(_0x13a367(0x17c)) / 0x5) *
          (-parseInt(_0x13a367(0x170)) / 0x6) +
        -parseInt(_0x13a367(0x165)) / 0x7 +
        (-parseInt(_0x13a367(0x175)) / 0x8) *
          (-parseInt(_0x13a367(0x169)) / 0x9) +
        parseInt(_0x13a367(0x168)) / 0xa +
        (parseInt(_0x13a367(0x17b)) / 0xb) * (parseInt(_0x13a367(0x166)) / 0xc);
      if (_0x336f0b === _0x16d6d8) break;
      else _0x5b5d78["push"](_0x5b5d78["shift"]());
    } catch (_0x38f8bf) {
      _0x5b5d78["push"](_0x5b5d78["shift"]());
    }
  }
})(_0x84fd, 0x1b4e2);
import { api, ApiError, session } from "../../api.js";
function _0x567e(_0x35177e, _0x32b831) {
  _0x35177e = _0x35177e - 0x15c;
  const _0x84fdb6 = _0x84fd();
  let _0x567ea8 = _0x84fdb6[_0x35177e];
  return _0x567ea8;
}
function _0x84fd() {
  const _0x571103 = [
    "343MPDKdS",
    "no-store",
    "getEntriesByType",
    "administrator",
    "468JBfdlS",
    "pathname",
    "1147867mgLoHx",
    "61368lbrITe",
    "toLowerCase",
    "936960TXbnZU",
    "243QXLukz",
    "role",
    "Cookie\x20cleanup\x20failed\x20(",
    "/login?next=",
    "error",
    "token",
    "1132eEioHJ",
    "6954sKwJgr",
    "2637sfIYoO",
    "persisted",
    "no-referrer",
    "clear",
    "14552WfnHxg",
    "DELETE",
    "type",
    "back_forward",
    "pageshow",
    "assign",
    "1067BJkvrC",
    "285fKddmL",
    "navigation",
    "same-origin",
    "concat",
  ];
  _0x84fd = function () {
    return _0x571103;
  };
  return _0x84fd();
}
let cached;
export async function getCurrentUser() {
  const _0x21a01d = _0x567e;
  if (!session[_0x21a01d(0x16e)]) return null;
  if (cached === undefined)
    try {
      cached = await api("/api/auth/me", { redirectOn401: ![] });
    } catch (_0x40da16) {
      if (!(_0x40da16 instanceof ApiError)) throw _0x40da16;
      cached = null;
    }
  return cached;
}
export async function logout() {
  const _0x1d7c50 = _0x567e;
  try {
    const _0x521d1a = session[_0x1d7c50(0x16e)],
      _0x523b39 = await fetch("/api/auth/admin-session", {
        method: _0x1d7c50(0x176),
        headers: _0x521d1a
          ? { Authorization: "Bearer\x20"[_0x1d7c50(0x15e)](_0x521d1a) }
          : {},
        credentials: _0x1d7c50(0x15d),
        cache: _0x1d7c50(0x160),
        referrerPolicy: _0x1d7c50(0x173),
      });
    if (!_0x523b39["ok"])
      throw new Error(
        _0x1d7c50(0x16b)[_0x1d7c50(0x15e)](_0x523b39["status"], ")."),
      );
  } catch (_0x16d4a3) {
    console[_0x1d7c50(0x16d)](
      "Failed\x20to\x20clear\x20the\x20administrator\x20session\x20cookie.",
      _0x16d4a3,
    );
  }
  (session[_0x1d7c50(0x174)](), location["replace"]("/login"));
}
export const isAdmin = (_0x323a06) =>
  !!_0x323a06 &&
  _0x323a06[_0x45c57b(0x16a)][_0x45c57b(0x167)]() === _0x45c57b(0x162);
export async function requireLogin() {
  const _0x3e064a = _0x45c57b,
    _0x3309e7 = await getCurrentUser();
  if (!_0x3309e7)
    return (
      location[_0x3e064a(0x17a)](
        _0x3e064a(0x16c)[_0x3e064a(0x15e)](
          encodeURIComponent(location[_0x3e064a(0x164)]),
        ),
      ),
      new Promise(() => {})
    );
  return _0x3309e7;
}
export function reloadOnBackForward() {
  const _0x343022 = _0x45c57b;
  window["addEventListener"](_0x343022(0x179), (_0x3d31c3) => {
    const _0x1999b9 = _0x343022,
      _0x2f637c = performance[_0x1999b9(0x161)](_0x1999b9(0x15c))[0x0];
    if (
      _0x3d31c3[_0x1999b9(0x172)] ||
      (_0x2f637c && _0x2f637c[_0x1999b9(0x177)] === _0x1999b9(0x178))
    )
      location["reload"]();
  });
}
