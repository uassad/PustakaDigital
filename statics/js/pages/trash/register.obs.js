const _0x55b4ab = _0x18c1;
(function (_0xf88d13, _0x1ce8fa) {
  const _0xd06748 = _0x18c1,
    _0x5e080f = _0xf88d13();
  while (!![]) {
    try {
      const _0x532b6b =
        parseInt(_0xd06748(0xe1)) / 0x1 +
        -parseInt(_0xd06748(0xeb)) / 0x2 +
        (parseInt(_0xd06748(0xf8)) / 0x3) * (parseInt(_0xd06748(0xed)) / 0x4) +
        (parseInt(_0xd06748(0xfe)) / 0x5) *
          (-parseInt(_0xd06748(0x109)) / 0x6) +
        (-parseInt(_0xd06748(0xf3)) / 0x7) *
          (-parseInt(_0xd06748(0xe8)) / 0x8) +
        parseInt(_0xd06748(0xde)) / 0x9 +
        (-parseInt(_0xd06748(0xee)) / 0xa) * (parseInt(_0xd06748(0xe6)) / 0xb);
      if (_0x532b6b === _0x1ce8fa) break;
      else _0x5e080f["push"](_0x5e080f["shift"]());
    } catch (_0x297533) {
      _0x5e080f["push"](_0x5e080f["shift"]());
    }
  }
})(_0x4f4c, 0x5e413);
function _0x4f4c() {
  const _0x5a85d2 = [
    "669664xBMYlt",
    "phone",
    "/api/auth/register/verify-otp",
    "otp-notice",
    "required",
    "331837OBsoFw",
    "message",
    "24Bggctk",
    "verification_method",
    "concat",
    "1728pLQptJ",
    "Masukkan\x20kode\x20OTP\x206\x20digit.",
    "4YHVxQl",
    "550tzlaGA",
    "form-error",
    "click",
    "getElementById",
    "value",
    "1451492jkPvIX",
    "destination",
    "querySelector",
    "checkValidity",
    "otp-code",
    "922527XtHwkT",
    "textContent",
    "register-form",
    "assign",
    "ceil",
    "email\x20simulasi",
    "10ysNqFJ",
    "username",
    "POST",
    "preventDefault",
    "reportValidity",
    "trim",
    "submit",
    "challenge_id",
    "\x20dikirim\x20ke\x20",
    "button[type=submit]",
    "addEventListener",
    "410838YioqiN",
    "currentTarget",
    "focus",
    "/login?registered=1",
    "Periksa\x20kembali\x20isian\x20formulir.",
    "email",
    "\x20menit.",
    "disabled",
    "password",
    ".\x20Berlaku\x20",
    "hidden",
    "5254389eLgYea",
    "/api/auth/register",
    "change",
  ];
  _0x4f4c = function () {
    return _0x5a85d2;
  };
  return _0x4f4c();
}
import { api } from "../../api.js";
import { show } from "../../dom.js";
const registerForm = document[_0x55b4ab(0xf1)](_0x55b4ab(0xfa)),
  verifyForm = document["getElementById"]("verify-form"),
  errorBox = document[_0x55b4ab(0xf1)](_0x55b4ab(0xef)),
  methodField = registerForm[_0x55b4ab(0xe9)],
  phoneField = registerForm["nomor_telepon"],
  otpField = verifyForm[_0x55b4ab(0xf7)];
let challengeId;
function updatePhoneRequirement() {
  const _0x3a648c = _0x55b4ab;
  phoneField[_0x3a648c(0xe5)] = methodField["value"] === _0x3a648c(0xe2);
}
function registrationPayload() {
  const _0x38f0f5 = _0x55b4ab,
    _0x5cc968 = phoneField["value"][_0x38f0f5(0x103)]();
  return {
    username:
      registerForm[_0x38f0f5(0xff)][_0x38f0f5(0xf2)][_0x38f0f5(0x103)](),
    email: registerForm[_0x38f0f5(0xd8)]["value"][_0x38f0f5(0x103)](),
    nomor_telepon: _0x5cc968 === "" ? null : _0x5cc968,
    password: registerForm[_0x38f0f5(0xdb)][_0x38f0f5(0xf2)],
    verification_method: methodField[_0x38f0f5(0xf2)],
  };
}
async function requestCode(_0x1e54e3) {
  const _0x4d2b37 = _0x55b4ab;
  show(errorBox, ![]);
  if (!registerForm[_0x4d2b37(0xf6)]()) {
    (show(errorBox, !![], _0x4d2b37(0xd7)), registerForm[_0x4d2b37(0x102)]());
    return;
  }
  _0x1e54e3[_0x4d2b37(0xda)] = !![];
  try {
    const _0x55f861 = await api(_0x4d2b37(0xdf), {
      method: _0x4d2b37(0x100),
      auth: ![],
      json: registrationPayload(),
    });
    ((challengeId = _0x55f861[_0x4d2b37(0x105)]),
      (otpField[_0x4d2b37(0xf2)] = ""));
    const _0x42685a =
      _0x55f861[_0x4d2b37(0xe9)] === _0x4d2b37(0xe2)
        ? "simulasi\x20SMS"
        : _0x4d2b37(0xfd);
    ((document[_0x4d2b37(0xf1)](_0x4d2b37(0xe4))[_0x4d2b37(0xf9)] = "Kode\x20"
      ["concat"](_0x42685a, _0x4d2b37(0x106))
      [_0x4d2b37(0xea)](_0x55f861[_0x4d2b37(0xf4)], _0x4d2b37(0xdc))
      [_0x4d2b37(0xea)](
        Math[_0x4d2b37(0xfc)](_0x55f861["expires_in"] / 0x3c),
        _0x4d2b37(0xd9),
      )),
      (registerForm[_0x4d2b37(0xdd)] = !![]),
      (verifyForm[_0x4d2b37(0xdd)] = ![]),
      otpField[_0x4d2b37(0xd5)]());
  } catch (_0x334417) {
    show(errorBox, !![], _0x334417[_0x4d2b37(0xe7)]);
  } finally {
    _0x1e54e3[_0x4d2b37(0xda)] = ![];
  }
}
function _0x18c1(_0x2312de, _0x19783b) {
  _0x2312de = _0x2312de - 0xd4;
  const _0x4f4c7f = _0x4f4c();
  let _0x18c103 = _0x4f4c7f[_0x2312de];
  return _0x18c103;
}
(methodField[_0x55b4ab(0x108)](_0x55b4ab(0xe0), updatePhoneRequirement),
  updatePhoneRequirement(),
  registerForm[_0x55b4ab(0x108)](_0x55b4ab(0x104), (_0x4b1ebb) => {
    const _0x3ef526 = _0x55b4ab;
    (_0x4b1ebb["preventDefault"](),
      requestCode(registerForm[_0x3ef526(0xf5)](_0x3ef526(0x107))));
  }),
  document[_0x55b4ab(0xf1)]("resend-code")["addEventListener"](
    _0x55b4ab(0xf0),
    (_0x10126e) => {
      const _0x396f6a = _0x55b4ab;
      requestCode(_0x10126e[_0x396f6a(0xd4)]);
    },
  ),
  verifyForm[_0x55b4ab(0x108)](_0x55b4ab(0x104), async (_0x2cd027) => {
    const _0x399d12 = _0x55b4ab;
    (_0x2cd027[_0x399d12(0x101)](), show(errorBox, ![]));
    if (!verifyForm[_0x399d12(0xf6)]()) {
      (show(errorBox, !![], _0x399d12(0xec)), verifyForm["reportValidity"]());
      return;
    }
    const _0x5babfc = verifyForm[_0x399d12(0xf5)]("button[type=submit]");
    _0x5babfc[_0x399d12(0xda)] = !![];
    try {
      (await api(_0x399d12(0xe3), {
        method: "POST",
        auth: ![],
        json: { challenge_id: challengeId, code: otpField[_0x399d12(0xf2)] },
      }),
        (registerForm[_0x399d12(0xdb)][_0x399d12(0xf2)] = ""),
        location[_0x399d12(0xfb)](_0x399d12(0xd6)));
    } catch (_0x1692a8) {
      show(errorBox, !![], _0x1692a8[_0x399d12(0xe7)]);
    } finally {
      _0x5babfc[_0x399d12(0xda)] = ![];
    }
  }));