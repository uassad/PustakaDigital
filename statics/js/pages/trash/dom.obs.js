const _0x10b4f3 = _0x372e;
(function (_0x140b08, _0x23e276) {
  const _0x160e03 = _0x372e,
    _0x16ec32 = _0x140b08();
  while (!![]) {
    try {
      const _0x4399bd =
        (parseInt(_0x160e03(0x9b)) / 0x1) * (parseInt(_0x160e03(0xb6)) / 0x2) +
        (-parseInt(_0x160e03(0x9d)) / 0x3) * (parseInt(_0x160e03(0x9e)) / 0x4) +
        parseInt(_0x160e03(0xa7)) / 0x5 +
        parseInt(_0x160e03(0xa1)) / 0x6 +
        parseInt(_0x160e03(0xaf)) / 0x7 +
        (-parseInt(_0x160e03(0xb5)) / 0x8) * (parseInt(_0x160e03(0xa0)) / 0x9) +
        (-parseInt(_0x160e03(0xb7)) / 0xa) * (-parseInt(_0x160e03(0xaa)) / 0xb);
      if (_0x4399bd === _0x23e276) break;
      else _0x16ec32["push"](_0x16ec32["shift"]());
    } catch (_0x80bd2) {
      _0x16ec32["push"](_0x16ec32["shift"]());
    }
  }
})(_0x3c2c, 0x18fab);
const FORBIDDEN_ATTR = /^(on|style$|srcdoc$)/i;
export function el(_0x33abc1, _0xcbe47e = {}, ..._0x3c4881) {
  const _0x17ba45 = _0x372e,
    _0x406fa1 = document[_0x17ba45(0xb2)](_0x33abc1);
  for (const [_0x5327e6, _0x4c8aac] of Object["entries"](_0xcbe47e)) {
    if (_0x4c8aac === undefined || _0x4c8aac === null || _0x4c8aac === ![])
      continue;
    if (_0x5327e6 === _0x17ba45(0xa5)) _0x406fa1[_0x17ba45(0xa3)] = _0x4c8aac;
    else {
      if (_0x5327e6 === _0x17ba45(0xae))
        _0x406fa1["textContent"] = String(_0x4c8aac);
      else {
        if (_0x5327e6 === "on") {
          for (const [_0x2a9ec7, _0x14fa11] of Object["entries"](_0x4c8aac))
            _0x406fa1[_0x17ba45(0x99)](_0x2a9ec7, _0x14fa11);
        } else {
          if (_0x5327e6 === "dataset")
            Object[_0x17ba45(0xa6)](_0x406fa1[_0x17ba45(0x9c)], _0x4c8aac);
          else {
            if (FORBIDDEN_ATTR["test"](_0x5327e6))
              throw new Error(_0x17ba45(0x9a)[_0x17ba45(0x9f)](_0x5327e6));
            _0x406fa1[_0x17ba45(0xa4)](
              _0x5327e6,
              _0x4c8aac === !![] ? "" : String(_0x4c8aac),
            );
          }
        }
      }
    }
  }
  for (const _0x48b30c of _0x3c4881["flat"]()) {
    if (_0x48b30c === null || _0x48b30c === undefined || _0x48b30c === ![])
      continue;
    _0x406fa1[_0x17ba45(0xac)](
      _0x48b30c instanceof Node
        ? _0x48b30c
        : document[_0x17ba45(0xa2)](String(_0x48b30c)),
    );
  }
  return _0x406fa1;
}
function _0x3c2c() {
  const _0x2dd943 = [
    "Atribut\x20dilarang:\x20",
    "1zIaKAS",
    "dataset",
    "3TdQBfZ",
    "691640QjLBWN",
    "concat",
    "18vtLxzk",
    "535860PJDdst",
    "createTextNode",
    "className",
    "setAttribute",
    "class",
    "assign",
    "309765rEViLA",
    "string",
    "toast",
    "858sskWwd",
    "replaceChildren",
    "append",
    "textContent",
    "text",
    "756693IumIiJ",
    "toast\x20error",
    "test",
    "createElement",
    "hidden",
    "replace",
    "52408LLgOTv",
    "43422PgeYRi",
    "930xspXGD",
    "addEventListener",
  ];
  _0x3c2c = function () {
    return _0x2dd943;
  };
  return _0x3c2c();
}
export function clear(_0x348937) {
  const _0x1e3408 = _0x372e;
  _0x348937[_0x1e3408(0xab)]();
}
function _0x372e(_0x53e009, _0x5efcd6) {
  _0x53e009 = _0x53e009 - 0x99;
  const _0x3c2cdd = _0x3c2c();
  let _0x372e6e = _0x3c2cdd[_0x53e009];
  return _0x372e6e;
}
export function show(_0x27a25a, _0x113dc3, _0x261227) {
  const _0x497bee = _0x372e;
  if (_0x261227 !== undefined) _0x27a25a["textContent"] = _0x261227;
  _0x27a25a[_0x497bee(0xb3)] = !_0x113dc3;
}
let toastTimer;
export function toast(_0x13f36f, _0x27fcd3 = ![]) {
  const _0x4dd401 = _0x372e,
    _0xa554a2 = document["getElementById"](_0x4dd401(0xa9));
  if (!_0xa554a2) return;
  ((_0xa554a2[_0x4dd401(0xad)] = _0x13f36f),
    (_0xa554a2[_0x4dd401(0xa3)] = _0x27fcd3
      ? _0x4dd401(0xb0)
      : _0x4dd401(0xa9)),
    (_0xa554a2["hidden"] = ![]),
    clearTimeout(toastTimer),
    (toastTimer = setTimeout(() => {
      _0xa554a2["hidden"] = !![];
    }, 0xfa0)));
}
export function safeInternalPath(_0x60132, _0x4e9278 = "/") {
  const _0x3785c6 = _0x372e;
  return typeof _0x60132 === _0x3785c6(0xa8) &&
    /^\/(?![/\\])[^\s\\]*$/[_0x3785c6(0xb1)](_0x60132)
    ? _0x60132
    : _0x4e9278;
}
export function debounce(_0x1fc2ce, _0x1ccbb7) {
  let _0x530124;
  return (..._0x48ad40) => {
    (clearTimeout(_0x530124),
      (_0x530124 = setTimeout(() => _0x1fc2ce(..._0x48ad40), _0x1ccbb7)));
  };
}
export const isIsbn = (_0x936eef) =>
  /^97[89][0-9]{10}$/[_0x10b4f3(0xb1)](_0x936eef);
export const cleanIsbn = (_0x5a2d60) =>
  _0x5a2d60[_0x10b4f3(0xb4)](/[-\s]/g, "");
