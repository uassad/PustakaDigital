const _0x29ca00 = _0x3da0;
function _0x3da0(_0x2632ad, _0x7bb72f) {
  _0x2632ad = _0x2632ad - 0x117;
  const _0x4ca9c8 = _0x4ca9();
  let _0x3da033 = _0x4ca9c8[_0x2632ad];
  return _0x3da033;
}
(function (_0x313a70, _0x36c715) {
  const _0x420bba = _0x3da0,
    _0x2b3d5a = _0x313a70();
  while (!![]) {
    try {
      const _0x5ad2c9 =
        parseInt(_0x420bba(0x13d)) / 0x1 +
        (-parseInt(_0x420bba(0x11b)) / 0x2) *
          (-parseInt(_0x420bba(0x12e)) / 0x3) +
        -parseInt(_0x420bba(0x13c)) / 0x4 +
        (-parseInt(_0x420bba(0x122)) / 0x5) *
          (-parseInt(_0x420bba(0x13a)) / 0x6) +
        parseInt(_0x420bba(0x13b)) / 0x7 +
        (-parseInt(_0x420bba(0x125)) / 0x8) *
          (parseInt(_0x420bba(0x137)) / 0x9) +
        -parseInt(_0x420bba(0x13e)) / 0xa;
      if (_0x5ad2c9 === _0x36c715) break;
      else _0x2b3d5a["push"](_0x2b3d5a["shift"]());
    } catch (_0xc321e2) {
      _0x2b3d5a["push"](_0x2b3d5a["shift"]());
    }
  }
})(_0x4ca9, 0x520e3);
import { api, session } from "../../api.js";
import { show } from "../../dom.js";
const params = new URLSearchParams(location[_0x29ca00(0x117)]),
  ADMIN_DASHBOARD_PATH = _0x29ca00(0x11e),
  notice = document[_0x29ca00(0x11d)](_0x29ca00(0x126));
function _0x4ca9() {
  const _0x3a4cb6 = [
    "204596AGggBE",
    "43157IGMBny",
    "10958830QaAUCR",
    "form-error",
    "trim",
    "POST",
    "search",
    "value",
    "access_token",
    "clear",
    "340hCdacB",
    "/api/auth/login",
    "getElementById",
    "/seAj2hB9sk/admin",
    "has",
    "administrator",
    "preventDefault",
    "5BECHLt",
    "addEventListener",
    "set",
    "88mmyoss",
    "notice",
    "submit",
    "querySelector",
    "disabled",
    "expired",
    "password",
    "registered",
    "Akun\x20berhasil\x20didaftarkan.\x20Silakan\x20masuk.",
    "8736gNfJkB",
    "toLowerCase",
    "identifier",
    "button[type=submit]",
    "same-origin",
    "Sesi\x20berakhir.\x20Silakan\x20masuk\x20lagi.",
    "Akun\x20Anda\x20berhasil\x20dihapus.",
    "Bearer\x20",
    "assign",
    "95373EnnNsr",
    "/api/auth/admin-session",
    "concat",
    "3623082pqWydJ",
    "3203578ffBmPb",
  ];
  _0x4ca9 = function () {
    return _0x3a4cb6;
  };
  return _0x4ca9();
}
if (params[_0x29ca00(0x11f)]("deleted")) show(notice, !![], _0x29ca00(0x134));
else {
  if (params["has"](_0x29ca00(0x12c))) show(notice, !![], _0x29ca00(0x12d));
  else {
    if (params[_0x29ca00(0x11f)](_0x29ca00(0x12a)))
      show(notice, !![], _0x29ca00(0x133));
  }
}
const form = document[_0x29ca00(0x11d)]("login-form"),
  errorBox = document[_0x29ca00(0x11d)](_0x29ca00(0x13f));
form[_0x29ca00(0x123)](_0x29ca00(0x127), async (_0x288edc) => {
  const _0x3b9db2 = _0x29ca00;
  (_0x288edc[_0x3b9db2(0x121)](), show(errorBox, ![]));
  const _0x107a2e = form[_0x3b9db2(0x128)](_0x3b9db2(0x131));
  _0x107a2e[_0x3b9db2(0x129)] = !![];
  try {
    const _0x214b69 = await api(_0x3b9db2(0x11c), {
      method: "POST",
      auth: ![],
      json: {
        identifier:
          form[_0x3b9db2(0x130)][_0x3b9db2(0x118)][_0x3b9db2(0x140)](),
        password: form["password"]["value"],
      },
    });
    (session[_0x3b9db2(0x124)](_0x214b69[_0x3b9db2(0x119)]),
      (form[_0x3b9db2(0x12b)][_0x3b9db2(0x118)] = ""));
    const _0x27834b =
        _0x214b69["user"]["role"]?.[_0x3b9db2(0x12f)]() === _0x3b9db2(0x120),
      _0x4cbfb1 = _0x27834b ? ADMIN_DASHBOARD_PATH : "/";
    if (_0x4cbfb1 === ADMIN_DASHBOARD_PATH) {
      const _0x264a0c = await fetch(_0x3b9db2(0x138), {
        method: _0x3b9db2(0x141),
        headers: {
          Authorization: _0x3b9db2(0x135)[_0x3b9db2(0x139)](
            _0x214b69["access_token"],
          ),
        },
        credentials: _0x3b9db2(0x132),
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (!_0x264a0c["ok"]) {
        session[_0x3b9db2(0x11a)]();
        throw new Error(
          "Sesi\x20administrator\x20tidak\x20dapat\x20dibuat.\x20Silakan\x20masuk\x20lagi.",
        );
      }
    }
    location[_0x3b9db2(0x136)](_0x4cbfb1);
  } catch (_0x435c58) {
    show(errorBox, !![], _0x435c58["message"]);
  } finally {
    _0x107a2e[_0x3b9db2(0x129)] = ![];
  }
});
