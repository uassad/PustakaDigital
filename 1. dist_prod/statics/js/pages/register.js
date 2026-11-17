const _0x3f2bca = _0x1dc3;
(function (_0x4a14a3, _0x43beca) {
  const _0x7138c5 = _0x1dc3,
    _0x419c67 = _0x4a14a3();
  while (!![]) {
    try {
      const _0x2e74c9 =
        -parseInt(_0x7138c5(0x11c)) / 0x1 +
        -parseInt(_0x7138c5(0x10a)) / 0x2 +
        -parseInt(_0x7138c5(0xe8)) / 0x3 +
        -parseInt(_0x7138c5(0x10f)) / 0x4 +
        parseInt(_0x7138c5(0xfa)) / 0x5 +
        (parseInt(_0x7138c5(0x10d)) / 0x6) *
          (parseInt(_0x7138c5(0x11f)) / 0x7) +
        parseInt(_0x7138c5(0xf5)) / 0x8;
      if (_0x2e74c9 === _0x43beca) break;
      else _0x419c67["push"](_0x419c67["shift"]());
    } catch (_0x2434d2) {
      _0x419c67["push"](_0x419c67["shift"]());
    }
  }
})(_0x3173, 0x7a680);
import { api } from "../api.js";
import { show } from "../dom.js";
const registerForm = document[_0x3f2bca(0xff)](_0x3f2bca(0xfe)),
  verifyForm = document[_0x3f2bca(0xff)]("verify-form"),
  errorBox = document[_0x3f2bca(0xff)]("form-error"),
  methodField = registerForm[_0x3f2bca(0x11d)],
  phoneField = registerForm["nomor_telepon"],
  otpField = verifyForm[_0x3f2bca(0x125)];
function _0x1dc3(_0x31e110, _0x54cec5) {
  _0x31e110 = _0x31e110 - 0xe8;
  const _0x31737b = _0x3173();
  let _0x1dc3c9 = _0x31737b[_0x31e110];
  if (_0x1dc3["IUjHqB"] === undefined) {
    var _0x24d2f4 = function (_0x14070a) {
      const _0x554183 =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0x1f0868 = "",
        _0x5c2136 = "";
      for (
        let _0x1019d9 = 0x0, _0x57bc1e, _0x452b68, _0xb05f05 = 0x0;
        (_0x452b68 = _0x14070a["charAt"](_0xb05f05++));
        ~_0x452b68 &&
        ((_0x57bc1e =
          _0x1019d9 % 0x4 ? _0x57bc1e * 0x40 + _0x452b68 : _0x452b68),
        _0x1019d9++ % 0x4)
          ? (_0x1f0868 += String["fromCharCode"](
              0xff & (_0x57bc1e >> ((-0x2 * _0x1019d9) & 0x6)),
            ))
          : 0x0
      ) {
        _0x452b68 = _0x554183["indexOf"](_0x452b68);
      }
      for (
        let _0x1c0e52 = 0x0, _0x153026 = _0x1f0868["length"];
        _0x1c0e52 < _0x153026;
        _0x1c0e52++
      ) {
        _0x5c2136 +=
          "%" +
          ("00" + _0x1f0868["charCodeAt"](_0x1c0e52)["toString"](0x10))[
            "slice"
          ](-0x2);
      }
      return decodeURIComponent(_0x5c2136);
    };
    ((_0x1dc3["crLmTt"] = _0x24d2f4),
      (_0x1dc3["sUiwCN"] = {}),
      (_0x1dc3["IUjHqB"] = !![]));
  }
  const _0x337c4b = _0x31737b[0x0];
  _0x1dc3["ZVuMcN"] !== _0x337c4b &&
    ((_0x1dc3["sUiwCN"] = {}), (_0x1dc3["ZVuMcN"] = _0x337c4b));
  const _0x4ba179 = _0x1dc3["sUiwCN"][_0x31e110];
  return (
    _0x4ba179 === undefined
      ? ((_0x1dc3c9 = _0x1dc3["crLmTt"](_0x1dc3c9)),
        (_0x1dc3["sUiwCN"][_0x31e110] = _0x1dc3c9))
      : (_0x1dc3c9 = _0x4ba179),
    _0x1dc3c9
  );
}
let challengeId;
function _0x3173() {
  const _0x339cca = [
    "rhzNq1q",
    "tfD4tuS",
    "yvfhvMW",
    "zw1HAwWGC2LTDwXHC2K",
    "C3vIBwL0",
    "CMvWB3j0vMfSAwrPDhK",
    "CgHVBMu",
    "uKnKzgW",
    "DMfSDwu",
    "otC5odiWqM1ty3zh",
    "we5ABeu",
    "EvLxrMS",
    "nZu0mJy2yxbRq0nh",
    "t3DqsgK",
    "ndm3nJiWBeviBLrw",
    "CxvLCNLtzwXLy3rVCG",
    "DhjPBq",
    "DxnLCM5HBwu",
    "y3vYCMvUDfrHCMDLDa",
    "s29Kzsa",
    "y0nvyLC",
    "vwLtv0m",
    "yNv0Dg9Uw3r5Cgu9C3vIBwL0xq",
    "zfjerwO",
    "ue9tva",
    "zxHWAxjLC19PBG",
    "ugvYAwTZysbRzw1IywXPigLZAwfUigzVCM11BgLYlG",
    "ntq2mty4CxzYCM9R",
    "DMvYAwzPy2f0Aw9Ux21LDgHVza",
    "AgLKzgvU",
    "mZvcteDbB2m",
    "Cer4DKW",
    "C2LTDwXHC2KGu01t",
    "Dgv4DenVBNrLBNq",
    "ChjLDMvUDerLzMf1Bhq",
    "twfZDwTRyw4GA29KzsbpvfaGnIbKAwDPDc4",
    "B3rWlwnVzgu",
    "B3rWlw5VDgLJzq",
    "BwvZC2fNzq",
    "zKnJEuG",
    "ig1LBML0lG",
    "mZG0ntC2CgL5s0v4",
    "l2XVz2LUp3jLz2LZDgvYzwq9mq",
    "y2HHBgXLBMDLx2LK",
    "l2fWAs9HDxrOl3jLz2LZDgvYl3zLCMLMEs1VDha",
    "zujTCvC",
    "zhfNwKK",
    "CgfZC3DVCMq",
    "CMvXDwLYzwq",
    "zLnjrMK",
    "y29Uy2f0",
    "Bhnxugy",
    "zM9JDxm",
    "ywrKrxzLBNrmAxn0zw5LCG",
    "mti3nJG4oeDID01oBW",
    "y2HLy2TwywXPzgL0Eq",
    "zM9ewMO",
    "y2XPy2S",
    "zgLZywjSzwq",
    "ndKZndqYnxP0q2jjra",
    "CMvZzw5KlwnVzgu",
    "zgvZDgLUyxrPB24",
    "s3n5CMq",
    "CMvNAxn0zxiTzM9YBq",
    "z2v0rwXLBwvUDej5swq",
    "u2rAzxu",
  ];
  _0x3173 = function () {
    return _0x339cca;
  };
  return _0x3173();
}
function updatePhoneRequirement() {
  const _0x24766d = _0x3f2bca,
    _0x494d90 = {
      pDxvL: function (_0xe65e52, _0xcc374) {
        return _0xe65e52 === _0xcc374;
      },
      DvgCT: "phone",
    };
  phoneField[_0x24766d(0xef)] = _0x494d90[_0x24766d(0x120)](
    methodField[_0x24766d(0x109)],
    _0x494d90[_0x24766d(0x101)],
  );
}
function registrationPayload() {
  const _0x104891 = _0x3f2bca,
    _0x231201 = {
      yYWFk: function (_0x4670ae, _0x60d58b) {
        return _0x4670ae === _0x60d58b;
      },
    },
    _0x4e03d7 = phoneField[_0x104891(0x109)][_0x104891(0x111)]();
  return {
    username:
      registerForm[_0x104891(0x112)][_0x104891(0x109)][_0x104891(0x111)](),
    email: registerForm["email"][_0x104891(0x109)]["trim"](),
    nomor_telepon: _0x231201[_0x104891(0x10c)](_0x4e03d7, "")
      ? null
      : _0x4e03d7,
    password: registerForm[_0x104891(0xee)][_0x104891(0x109)],
    verification_method: methodField[_0x104891(0x109)],
  };
}
async function requestCode(_0x4ef046) {
  const _0x17699c = _0x3f2bca,
    _0x278458 = {
      SdZeu: function (_0x5ec63a, _0x33df73, _0x528295) {
        return _0x5ec63a(_0x33df73, _0x528295);
      },
      aQGVl: function (_0xc20932, _0x515804, _0x301793, _0xba12d3) {
        return _0xc20932(_0x515804, _0x301793, _0xba12d3);
      },
      lsWPf: _0x17699c(0x11b),
      LWxMK: function (_0x4228be, _0x3c0a54, _0xa8d907) {
        return _0x4228be(_0x3c0a54, _0xa8d907);
      },
      eBmqW: function (_0x4a204d) {
        return _0x4a204d();
      },
      fSIFi: function (_0x1bcab4, _0x123bfb) {
        return _0x1bcab4 === _0x123bfb;
      },
      dRDEj: _0x17699c(0x107),
      Ksyrd: _0x17699c(0x121),
      dqgZI: _0x17699c(0x104),
      OwPHi: _0x17699c(0x126),
    };
  _0x278458[_0x17699c(0x100)](show, errorBox, ![]);
  if (!registerForm["checkValidity"]()) {
    (_0x278458[_0x17699c(0x103)](
      show,
      errorBox,
      !![],
      _0x278458[_0x17699c(0xf2)],
    ),
      registerForm[_0x17699c(0x106)]());
    return;
  }
  _0x4ef046["disabled"] = !![];
  try {
    const _0x3c1cba = await _0x278458[_0x17699c(0x102)](
      api,
      "/api/auth/register",
      {
        method: "POST",
        auth: ![],
        json: _0x278458[_0x17699c(0xec)](registrationPayload),
      },
    );
    ((challengeId = _0x3c1cba[_0x17699c(0xea)]), (otpField["value"] = ""));
    const _0x4a3df4 = _0x278458[_0x17699c(0xf0)](
      _0x3c1cba[_0x17699c(0x11d)],
      _0x278458[_0x17699c(0x118)],
    )
      ? _0x278458[_0x17699c(0xfd)]
      : _0x278458[_0x17699c(0xed)];
    ((document["getElementById"](_0x278458[_0x17699c(0x10e)])[
      _0x17699c(0x122)
    ] = _0x17699c(0x114)
      ["concat"](_0x4a3df4, "\x20dikirim\x20ke\x20")
      [_0x17699c(0xf1)](_0x3c1cba[_0x17699c(0xfc)], ".\x20Berlaku\x20")
      ["concat"](
        Math["ceil"](_0x3c1cba[_0x17699c(0x11a)] / 0x3c),
        _0x17699c(0x129),
      )),
      (registerForm[_0x17699c(0x11e)] = !![]),
      (verifyForm["hidden"] = ![]),
      otpField[_0x17699c(0xf3)]());
  } catch (_0x802c71) {
    _0x278458["aQGVl"](show, errorBox, !![], _0x802c71["message"]);
  } finally {
    _0x4ef046[_0x17699c(0xf9)] = ![];
  }
}
(methodField["addEventListener"]("change", updatePhoneRequirement),
  updatePhoneRequirement(),
  registerForm[_0x3f2bca(0xf4)](_0x3f2bca(0x105), (_0x3b7522) => {
    const _0x45b631 = _0x3f2bca,
      _0x3b8169 = {
        XNZlE: function (_0x51a606, _0x26e2ce) {
          return _0x51a606(_0x26e2ce);
        },
      };
    (_0x3b7522[_0x45b631(0x123)](),
      _0x3b8169[_0x45b631(0x10b)](
        requestCode,
        registerForm[_0x45b631(0x110)](_0x45b631(0x117)),
      ));
  }),
  document[_0x3f2bca(0xff)](_0x3f2bca(0xfb))["addEventListener"](
    _0x3f2bca(0xf8),
    (_0x32cbb2) => {
      const _0x48f6dc = _0x3f2bca;
      requestCode(_0x32cbb2[_0x48f6dc(0x113)]);
    },
  ),
  verifyForm[_0x3f2bca(0xf4)](_0x3f2bca(0x105), async (_0x5c8633) => {
    const _0x1f7321 = _0x3f2bca,
      _0x3c0913 = {
        AhQZW: function (_0x3c533f, _0x3a8ae7, _0x1342e4) {
          return _0x3c533f(_0x3a8ae7, _0x1342e4);
        },
        fcEdn: function (_0x59f6bb, _0x37cc91, _0x2754d8, _0x116950) {
          return _0x59f6bb(_0x37cc91, _0x2754d8, _0x116950);
        },
        UiSWC: _0x1f7321(0x124),
        foDZj: "button[type=submit]",
        ybSMm: function (_0xc79a4a, _0x17b1f9, _0x1667d5) {
          return _0xc79a4a(_0x17b1f9, _0x1667d5);
        },
        fCcyH: _0x1f7321(0xeb),
        RCddl: _0x1f7321(0x119),
        cCUbW: _0x1f7321(0xe9),
      };
    (_0x5c8633[_0x1f7321(0x123)](), _0x3c0913["AhQZW"](show, errorBox, ![]));
    if (!verifyForm[_0x1f7321(0xf6)]()) {
      (_0x3c0913["fcEdn"](show, errorBox, !![], _0x3c0913[_0x1f7321(0x116)]),
        verifyForm["reportValidity"]());
      return;
    }
    const _0x405dbd = verifyForm["querySelector"](_0x3c0913[_0x1f7321(0xf7)]);
    _0x405dbd[_0x1f7321(0xf9)] = !![];
    try {
      (await _0x3c0913["ybSMm"](api, _0x3c0913[_0x1f7321(0x128)], {
        method: _0x3c0913[_0x1f7321(0x108)],
        auth: ![],
        json: { challenge_id: challengeId, code: otpField[_0x1f7321(0x109)] },
      }),
        (registerForm[_0x1f7321(0xee)][_0x1f7321(0x109)] = ""),
        location["assign"](_0x3c0913[_0x1f7321(0x115)]));
    } catch (_0x599770) {
      show(errorBox, !![], _0x599770[_0x1f7321(0x127)]);
    } finally {
      _0x405dbd["disabled"] = ![];
    }
  }));
