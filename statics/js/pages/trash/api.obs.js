const _0x2ba062 = _0x2252;
(function (_0x2a37f1, _0x36b349) {
  const _0x261f83 = _0x2252,
    _0x4dcd2f = _0x2a37f1();
  while (!![]) {
    try {
      const _0x198b2a =
        -parseInt(_0x261f83(0x109)) / 0x1 +
        -parseInt(_0x261f83(0x11d)) / 0x2 +
        (parseInt(_0x261f83(0x123)) / 0x3) *
          (parseInt(_0x261f83(0x118)) / 0x4) +
        -parseInt(_0x261f83(0x126)) / 0x5 +
        parseInt(_0x261f83(0x110)) / 0x6 +
        parseInt(_0x261f83(0x121)) / 0x7 +
        (parseInt(_0x261f83(0x111)) / 0x8) * (parseInt(_0x261f83(0x11c)) / 0x9);
      if (_0x198b2a === _0x36b349) break;
      else _0x4dcd2f["push"](_0x4dcd2f["shift"]());
    } catch (_0xb3d777) {
      _0x4dcd2f["push"](_0x4dcd2f["shift"]());
    }
  }
})(_0xa9bd, 0xde23f);
const TOKEN_KEY = _0x2ba062(0x125);
export const session = {
  get token() {
    const _0xead6b3 = _0x2ba062;
    try {
      return sessionStorage[_0xead6b3(0x11f)](TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(_0x5463c6) {
    const _0x7f9843 = _0x2ba062;
    try {
      sessionStorage[_0x7f9843(0x107)](TOKEN_KEY, _0x5463c6);
    } catch {}
  },
  clear() {
    const _0x32afc7 = _0x2ba062;
    try {
      sessionStorage[_0x32afc7(0x10b)](TOKEN_KEY);
    } catch {}
  },
};
export class ApiError extends Error {
  constructor(_0x414769, _0x5a8cdc) {
    const _0x21ec8e = _0x2ba062;
    (super(_0x5a8cdc),
      (this[_0x21ec8e(0x115)] = _0x21ec8e(0x10d)),
      (this[_0x21ec8e(0x12e)] = _0x414769));
  }
}
function _0x2252(_0x2a9e6f, _0x460d71) {
  _0x2a9e6f = _0x2a9e6f - 0x107;
  const _0xa9bd9b = _0xa9bd();
  let _0x22520c = _0xa9bd9b[_0x2a9e6f];
  return _0x22520c;
}
function _0xa9bd() {
  const _0x4d8217 = [
    "GET",
    "3jxzxyf",
    "startsWith",
    "uas_sad_token",
    "3918530kwchnK",
    "Permintaan\x20gagal\x20(",
    "string",
    "stringify",
    "/api/",
    "field",
    "concat",
    "Terlalu\x20banyak\x20percobaan.\x20Coba\x20lagi\x20sebentar\x20lagi.",
    "status",
    "/login?expired=1&next=",
    "setItem",
    "blob",
    "1192666XYwSqn",
    "Terjadi\x20kesalahan\x20pada\x20server.",
    "removeItem",
    "msg",
    "ApiError",
    "Content-Type",
    "Authorization",
    "9156444vmNyGu",
    "8WxKAuP",
    "omit",
    "isArray",
    "no-store",
    "name",
    "no-referrer",
    "join",
    "3042036tQZLZO",
    "Bearer\x20",
    "json",
    "map",
    "7189371JiVHcY",
    "1576712EJLuxA",
    "body",
    "getItem",
    "clear",
    "4124491uoDphc",
  ];
  _0xa9bd = function () {
    return _0x4d8217;
  };
  return _0xa9bd();
}
function describeError(_0x11f774, _0x563a2a) {
  const _0x195dbd = _0x2ba062,
    _0x58f877 = _0x563a2a && _0x563a2a["detail"];
  if (typeof _0x58f877 === _0x195dbd(0x128)) return _0x58f877;
  if (Array[_0x195dbd(0x113)](_0x58f877))
    return _0x58f877[_0x195dbd(0x11b)]((_0x2ef94b) =>
      _0x2ef94b["field"]
        ? ""
            ["concat"](_0x2ef94b[_0x195dbd(0x12b)], ":\x20")
            ["concat"](_0x2ef94b[_0x195dbd(0x10c)])
        : _0x2ef94b[_0x195dbd(0x10c)],
    )[_0x195dbd(0x117)](";\x20");
  if (_0x11f774 === 0x1ad) return _0x195dbd(0x12d);
  if (_0x11f774 >= 0x1f4) return _0x195dbd(0x10a);
  return _0x195dbd(0x127)[_0x195dbd(0x12c)](_0x11f774, ").");
}
async function request(
  _0x17c7a7,
  {
    method: method = _0x2ba062(0x122),
    json: _0x4ea90a,
    form: _0x1443b5,
    auth: auth = !![],
    redirectOn401: redirectOn401 = !![],
    signal: _0x5e968c,
  } = {},
) {
  const _0x38f6db = _0x2ba062;
  if (
    typeof _0x17c7a7 !== "string" ||
    !_0x17c7a7[_0x38f6db(0x124)](_0x38f6db(0x12a))
  )
    throw new Error("Hanya\x20path\x20/api/\x20yang\x20diizinkan.");
  const _0x4a2f33 = {},
    _0x27fcb1 = {
      method: method,
      headers: _0x4a2f33,
      signal: _0x5e968c,
      credentials: _0x38f6db(0x112),
      cache: _0x38f6db(0x114),
      referrerPolicy: _0x38f6db(0x116),
    },
    _0x4e9827 = session["token"];
  if (auth && _0x4e9827)
    _0x4a2f33[_0x38f6db(0x10f)] = _0x38f6db(0x119)[_0x38f6db(0x12c)](_0x4e9827);
  if (_0x4ea90a !== undefined)
    ((_0x4a2f33[_0x38f6db(0x10e)] = "application/json"),
      (_0x27fcb1[_0x38f6db(0x11e)] = JSON[_0x38f6db(0x129)](_0x4ea90a)));
  else _0x1443b5 && (_0x27fcb1["body"] = _0x1443b5);
  const _0x110b83 = await fetch(_0x17c7a7, _0x27fcb1);
  if (_0x110b83[_0x38f6db(0x12e)] === 0x191 && _0x4e9827 && auth) {
    session[_0x38f6db(0x120)]();
    if (redirectOn401) {
      const _0x5aa42b = encodeURIComponent(
        location["pathname"] + location["search"],
      );
      location["assign"](_0x38f6db(0x12f)[_0x38f6db(0x12c)](_0x5aa42b));
    }
  }
  return _0x110b83;
}
export async function api(_0x9dd47, _0x48f66b = {}) {
  const _0x190cca = _0x2ba062,
    _0x59c4db = await request(_0x9dd47, _0x48f66b);
  if (_0x59c4db[_0x190cca(0x12e)] === 0xcc) return null;
  let _0x19b103 = null;
  try {
    _0x19b103 = await _0x59c4db[_0x190cca(0x11a)]();
  } catch {}
  if (!_0x59c4db["ok"])
    throw new ApiError(
      _0x59c4db[_0x190cca(0x12e)],
      describeError(_0x59c4db[_0x190cca(0x12e)], _0x19b103),
    );
  return _0x19b103;
}
export async function apiBlob(_0x55dacd, _0x136b59 = {}) {
  const _0x4192ac = _0x2ba062,
    _0x19b00e = await request(_0x55dacd, _0x136b59);
  if (!_0x19b00e["ok"]) {
    let _0x36fe5b = null;
    try {
      _0x36fe5b = await _0x19b00e[_0x4192ac(0x11a)]();
    } catch {}
    throw new ApiError(
      _0x19b00e[_0x4192ac(0x12e)],
      describeError(_0x19b00e["status"], _0x36fe5b),
    );
  }
  return _0x19b00e[_0x4192ac(0x108)]();
}
