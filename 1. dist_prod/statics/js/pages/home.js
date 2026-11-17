const _0xd1c099 = _0x455e;
(function (_0x578dba, _0x2bae8f) {
  const _0x52435a = _0x455e,
    _0x3c67b7 = _0x578dba();
  while (!![]) {
    try {
      const _0x1e6bd3 =
        (parseInt(_0x52435a(0x20e)) / 0x1) *
          (parseInt(_0x52435a(0x2bf)) / 0x2) +
        -parseInt(_0x52435a(0x239)) / 0x3 +
        (-parseInt(_0x52435a(0x200)) / 0x4) *
          (parseInt(_0x52435a(0x2e6)) / 0x5) +
        (-parseInt(_0x52435a(0x25f)) / 0x6) *
          (parseInt(_0x52435a(0x288)) / 0x7) +
        (-parseInt(_0x52435a(0x246)) / 0x8) *
          (-parseInt(_0x52435a(0x1e7)) / 0x9) +
        (parseInt(_0x52435a(0x1c0)) / 0xa) *
          (-parseInt(_0x52435a(0x29c)) / 0xb) +
        parseInt(_0x52435a(0x1c8)) / 0xc;
      if (_0x1e6bd3 === _0x2bae8f) break;
      else _0x3c67b7["push"](_0x3c67b7["shift"]());
    } catch (_0x12c200) {
      _0x3c67b7["push"](_0x3c67b7["shift"]());
    }
  }
})(_0x5b3b, 0xea9c1);
import { api, ApiError, session } from "../api.js";
import { getCurrentUser, logout, reloadOnBackForward } from "../auth.js";
reloadOnBackForward();
import { clear, debounce, el, show, el61vg } from "../dom.js";
let currentUser = null,
  currentQuery = "",
  selectedCategory = "",
  currentPage = 0x1,
  totalPages = 0x1,
  showingOnlyFavorites = ![];
const userNav = document[_0xd1c099(0x2c6)](_0xd1c099(0x2de)),
  guestBanner = document[_0xd1c099(0x2c6)](_0xd1c099(0x1c5)),
  profileModal = document[_0xd1c099(0x2c6)](_0xd1c099(0x2fb)),
  profileForm = document[_0xd1c099(0x2c6)]("profile-form"),
  profileUsername = document[_0xd1c099(0x2c6)](_0xd1c099(0x25b)),
  profileEmail = document["getElementById"]("profile-email"),
  profilePhone = document["getElementById"](_0xd1c099(0x248)),
  profilePassword = document[_0xd1c099(0x2c6)](_0xd1c099(0x2dd)),
  profilePasswordField = document[_0xd1c099(0x2c6)](_0xd1c099(0x242)),
  profileStatus = document[_0xd1c099(0x2c6)]("profile-status"),
  profileError = document[_0xd1c099(0x2c6)](_0xd1c099(0x2ec)),
  saveProfileBtn = document[_0xd1c099(0x2c6)]("save-profile-btn"),
  deleteAccountModal = document[_0xd1c099(0x2c6)](_0xd1c099(0x2be)),
  deleteAccountForm = document[_0xd1c099(0x2c6)](_0xd1c099(0x269)),
  deleteAccountConfirm = document[_0xd1c099(0x2c6)]("delete-account-confirm"),
  deleteAccountPassword = document["getElementById"](_0xd1c099(0x2c1)),
  deleteAccountError = document[_0xd1c099(0x2c6)](_0xd1c099(0x236)),
  confirmDeleteAccountBtn = document[_0xd1c099(0x2c6)](_0xd1c099(0x2d3)),
  searchInput = document[_0xd1c099(0x2c6)]("search-input"),
  searchClearBtn = document[_0xd1c099(0x2c6)](_0xd1c099(0x2e7)),
  categoryChips = document[_0xd1c099(0x2c6)]("category-chips"),
  favFilterWrapper = document["getElementById"](_0xd1c099(0x1da)),
  filterFavoritesBtn = document["getElementById"](_0xd1c099(0x309)),
  resultsCount = document[_0xd1c099(0x2c6)](_0xd1c099(0x21a)),
  bookGrid = document["getElementById"]("dzbgsi"),
  oeguma = document[_0xd1c099(0x2c6)](_0xd1c099(0x2f6)),
  prevPageBtn = document["getElementById"](_0xd1c099(0x1d4)),
  nextPageBtn = document[_0xd1c099(0x2c6)]("next-page-btn"),
  pageInfo = document[_0xd1c099(0x2c6)](_0xd1c099(0x2e9));
function openModal(_0x394a65) {
  const _0x228467 = _0xd1c099,
    _0x40f51d = { oMGUI: _0x228467(0x2ae), khZwZ: _0x228467(0x2da) };
  (_0x394a65["classList"][_0x228467(0x283)](_0x40f51d[_0x228467(0x287)]),
    _0x394a65[_0x228467(0x306)](_0x40f51d[_0x228467(0x1db)])?.[
      _0x228467(0x1de)
    ]());
}
function closeModal(_0x170419) {
  const _0x41d30e = _0xd1c099,
    _0x4f8bb1 = { ZpIbq: _0x41d30e(0x2ae) };
  _0x170419[_0x41d30e(0x23c)][_0x41d30e(0x2cf)](_0x4f8bb1["ZpIbq"]);
}
function setFormError(_0x1a6c7f, _0x5a60c8) {
  const _0x1dfd95 = _0xd1c099;
  ((_0x1a6c7f[_0x1dfd95(0x2bd)] = _0x5a60c8),
    (_0x1a6c7f[_0x1dfd95(0x23b)] = !_0x5a60c8));
}
function openProfileModal(_0x32fdd7) {
  const _0xcb8d50 = _0xd1c099,
    _0x35e4da = {
      fMOYI: function (_0x222e5e, _0x1520c0) {
        return _0x222e5e === _0x1520c0;
      },
      ysCas: _0xcb8d50(0x300),
      gBfwc: "Dibekukan",
      pwCSF: _0xcb8d50(0x25c),
      oVobO: _0xcb8d50(0x29a),
      CDxtN: _0xcb8d50(0x2a1),
      RMuDL: function (_0x57ec6a, _0x340547, _0x47ddb7) {
        return _0x57ec6a(_0x340547, _0x47ddb7);
      },
      SHOxU: function (_0x24e153, _0x3131ab) {
        return _0x24e153(_0x3131ab);
      },
    },
    _0x4387e9 = _0x35e4da[_0xcb8d50(0x22c)](
      _0x32fdd7[_0xcb8d50(0x277)]["toLowerCase"](),
      _0xcb8d50(0x28d),
    );
  (profileForm["reset"](),
    (profileUsername[_0xcb8d50(0x2d1)] = _0x32fdd7[_0xcb8d50(0x1ce)]),
    (profileEmail[_0xcb8d50(0x2d1)] = _0x32fdd7[_0xcb8d50(0x2b8)]),
    (profilePhone["value"] = _0x32fdd7[_0xcb8d50(0x255)] || ""),
    (profileUsername[_0xcb8d50(0x2b6)] = _0x4387e9),
    (profilePhone[_0xcb8d50(0x2b6)] = _0x4387e9),
    (profilePassword[_0xcb8d50(0x2b6)] = _0x4387e9),
    (profilePasswordField[_0xcb8d50(0x23b)] = _0x4387e9),
    (saveProfileBtn[_0xcb8d50(0x23b)] = _0x4387e9),
    (profileStatus[_0xcb8d50(0x2bd)] = [
      _0xcb8d50(0x2bb)[_0xcb8d50(0x249)](
        _0x35e4da[_0xcb8d50(0x22c)](
          _0x32fdd7[_0xcb8d50(0x238)],
          _0x35e4da[_0xcb8d50(0x27b)],
        )
          ? _0x35e4da[_0xcb8d50(0x23a)]
          : _0x35e4da[_0xcb8d50(0x2e8)],
        ".",
      ),
      _0xcb8d50(0x1f4)[_0xcb8d50(0x249)](
        _0x32fdd7[_0xcb8d50(0x210)]
          ? _0x35e4da[_0xcb8d50(0x23f)]
          : _0x35e4da[_0xcb8d50(0x293)],
        ".",
      ),
      "Telepon:\x20"[_0xcb8d50(0x249)](
        _0x32fdd7[_0xcb8d50(0x257)]
          ? _0x35e4da[_0xcb8d50(0x23f)]
          : _0x35e4da[_0xcb8d50(0x293)],
        ".",
      ),
    ][_0xcb8d50(0x240)]("\x20")),
    _0x35e4da["RMuDL"](setFormError, profileError, ""),
    _0x35e4da[_0xcb8d50(0x314)](openModal, profileModal));
}
function openDeleteAccountModal() {
  const _0x1af61e = _0xd1c099,
    _0x5e42f7 = {
      enSKk: function (_0x460aa7, _0x2e03ff, _0x2f57bf) {
        return _0x460aa7(_0x2e03ff, _0x2f57bf);
      },
      VKunV: function (_0x53787d, _0x398d45) {
        return _0x53787d(_0x398d45);
      },
    };
  (deleteAccountForm[_0x1af61e(0x280)](),
    _0x5e42f7[_0x1af61e(0x266)](setFormError, deleteAccountError, ""),
    _0x5e42f7[_0x1af61e(0x262)](openModal, deleteAccountModal));
}
async function openAdminDashboard(_0x5ac0d6, _0x1c7ad5) {
  const _0x23fcf2 = _0xd1c099,
    _0x35b1cf = {
      wSzZm: function (_0x15b922, _0x43f6b5, _0x29d9a4) {
        return _0x15b922(_0x43f6b5, _0x29d9a4);
      },
      ztoDg: "/api/auth/admin-session",
      RyDwj: "POST",
      mMxYs: "no-store",
      NPYoi: _0x23fcf2(0x279),
      CEKCl: "/seAj2hB9sk/admin",
      AThOh: function (_0x5d145f, _0x5831ca) {
        return _0x5d145f instanceof _0x5831ca;
      },
      zPBPR: _0x23fcf2(0x232),
    };
  ((_0x5ac0d6[_0x23fcf2(0x1e4)] = ![]), (_0x1c7ad5[_0x23fcf2(0x2b6)] = !![]));
  try {
    const _0x165d05 = await _0x35b1cf[_0x23fcf2(0x22f)](
      fetch,
      _0x35b1cf[_0x23fcf2(0x26c)],
      {
        method: _0x35b1cf[_0x23fcf2(0x212)],
        headers: {
          Authorization: _0x23fcf2(0x21b)[_0x23fcf2(0x249)](
            session[_0x23fcf2(0x285)],
          ),
        },
        credentials: _0x23fcf2(0x1df),
        cache: _0x35b1cf[_0x23fcf2(0x26b)],
        referrerPolicy: _0x23fcf2(0x2c5),
      },
    );
    if (!_0x165d05["ok"])
      throw new ApiError(_0x165d05["status"], _0x35b1cf[_0x23fcf2(0x2b5)]);
    location["assign"](_0x35b1cf[_0x23fcf2(0x2d0)]);
  } catch (_0x1e2ac2) {
    const _0x1b3730 = _0x35b1cf[_0x23fcf2(0x30e)](dnl4kp, ApiError)
      ? _0x1e2ac2["message"]
      : _0x35b1cf["zPBPR"];
    (console["error"](_0x23fcf2(0x1e3), _0x1e2ac2),
      toast(_0x1b3730, !![]),
      (_0x1c7ad5[_0x23fcf2(0x2b6)] = ![]));
  }
}
function initUserNav(_0x3475ed) {
  const _0x39b096 = _0xd1c099,
    _0x1e3f82 = {
      rEJvf: function (_0x377862) {
        return _0x377862();
      },
      UaOeI: "gh5kv2",
      PUkJW: function (_0x177993, _0x587adb) {
        return _0x177993(_0x587adb);
      },
      GpCyr: function (_0x386bc1, _0x50f17e, _0x1a1386) {
        return _0x386bc1(_0x50f17e, _0x1a1386);
      },
      eMrIp: _0x39b096(0x2fe),
      rZhBy: "Tamu",
      tExEA: function (_0x45346b, _0x5f56d9, _0x4199a1) {
        return _0x45346b(_0x5f56d9, _0x4199a1);
      },
      vUADR: "ydux7g\x20bmm22v\x20huz68s",
      KwzFH: _0x39b096(0x313),
      zHXgY: function (_0x24a5ec, _0xa86135, _0x1c8a39) {
        return _0x24a5ec(_0xa86135, _0x1c8a39);
      },
      BmrAi: "ydux7g\x20huz68s",
      YuKzW: _0x39b096(0x221),
      UNItv: function (_0x1ab799, _0x611de5) {
        return _0x1ab799 === _0x611de5;
      },
      XUBqV: _0x39b096(0x28d),
      NvNoB: _0x39b096(0x27e),
      NUmnm: _0x39b096(0x2eb),
      PbAsJ: "Kelola\x20Buku",
      qXevB: _0x39b096(0x2b2),
      GDZnI: _0x39b096(0x1c1),
      iUqyc: function (_0x56fcd0, _0x12befb, _0x58e57f) {
        return _0x56fcd0(_0x12befb, _0x58e57f);
      },
      ZgdXe: _0x39b096(0x2ab),
      oixqz: function (_0x461168, _0x4b2081, _0x58b4ae) {
        return _0x461168(_0x4b2081, _0x58b4ae);
      },
      OevYZ: "Favorit\x20Buku",
      UVFRn: function (_0x57d76b, _0x4ccab2, _0x4222ca) {
        return _0x57d76b(_0x4ccab2, _0x4222ca);
      },
      TjdBT: _0x39b096(0x1eb),
      slHvy: "Buka\x20menu\x20akun",
      ytTnd: function (_0x2f7d4c, _0x7c3418, _0x2e7def, _0x2f2b81) {
        return _0x2f7d4c(_0x7c3418, _0x2e7def, _0x2f2b81);
      },
      GguFn: _0x39b096(0x2ed),
      AyiLH: function (_0x1d71a5, _0x53d620, _0x20491b) {
        return _0x1d71a5(_0x53d620, _0x20491b);
      },
    };
  _0x1e3f82[_0x39b096(0x233)](clear, userNav);
  if (!_0x3475ed) {
    (userNav[_0x39b096(0x284)](
      _0x1e3f82[_0x39b096(0x224)](el, _0x39b096(0x278), {
        class: _0x1e3f82[_0x39b096(0x245)],
        text: _0x1e3f82[_0x39b096(0x2f7)],
      }),
      _0x1e3f82[_0x39b096(0x272)](el, "a", {
        class: _0x1e3f82[_0x39b096(0x1f3)],
        href: _0x39b096(0x247),
        text: _0x1e3f82[_0x39b096(0x256)],
      }),
      _0x1e3f82[_0x39b096(0x23e)](el, "a", {
        class: _0x1e3f82[_0x39b096(0x2e2)],
        href: _0x1e3f82[_0x39b096(0x28f)],
        text: _0x39b096(0x2a5),
      }),
    ),
      show(guestBanner, !![]),
      _0x1e3f82[_0x39b096(0x272)](show, favFilterWrapper, ![]));
    return;
  }
  const _0x137e86 = _0x1e3f82[_0x39b096(0x260)](
      _0x3475ed["role"][_0x39b096(0x1dc)](),
      _0x1e3f82[_0x39b096(0x234)],
    ),
    _0x4a3ca8 = el(_0x1e3f82[_0x39b096(0x2f1)], { class: _0x39b096(0x2aa) }),
    _0x1d2b7a = _0x137e86
      ? _0x1e3f82[_0x39b096(0x23e)](el, _0x1e3f82[_0x39b096(0x21e)], {
          class: _0x39b096(0x2b2),
          type: _0x1e3f82["NUmnm"],
          text: _0x1e3f82["PbAsJ"],
          on: {
            click: (_0x41a0d0) =>
              openAdminDashboard(_0x4a3ca8, _0x41a0d0[_0x39b096(0x1d0)]),
          },
        })
      : null,
    _0x2813ff = el(_0x1e3f82[_0x39b096(0x21e)], {
      class: _0x1e3f82[_0x39b096(0x2ef)],
      type: _0x39b096(0x2eb),
      text: _0x1e3f82[_0x39b096(0x252)],
      on: {
        click: () => {
          ((_0x4a3ca8["open"] = ![]), openProfileModal(_0x3475ed));
        },
      },
    }),
    _0x3c3fe8 = _0x137e86
      ? [_0x1d2b7a, _0x2813ff]
      : [
          _0x2813ff,
          _0x1e3f82[_0x39b096(0x302)](el, _0x1e3f82[_0x39b096(0x21e)], {
            class: _0x1e3f82["qXevB"],
            type: _0x1e3f82[_0x39b096(0x21e)],
            text: _0x1e3f82["ZgdXe"],
            on: {
              click: () => {
                const _0x405c09 = _0x39b096;
                ((_0x4a3ca8[_0x405c09(0x1e4)] = ![]),
                  _0x1e3f82["rEJvf"](openDeleteAccountModal));
              },
            },
          }),
          _0x1e3f82["oixqz"](el, _0x1e3f82["NUmnm"], {
            class: _0x1e3f82[_0x39b096(0x2ef)],
            type: _0x39b096(0x2eb),
            text: _0x1e3f82["OevYZ"],
            on: {
              click: () => {
                const _0x2e2a59 = _0x39b096;
                ((showingOnlyFavorites = !![]),
                  filterFavoritesBtn[_0x2e2a59(0x23c)][_0x2e2a59(0x283)](
                    _0x1e3f82[_0x2e2a59(0x1d6)],
                  ),
                  (currentPage = 0x1),
                  _0x1e3f82[_0x2e2a59(0x201)](loadBooks),
                  (_0x4a3ca8[_0x2e2a59(0x1e4)] = ![]),
                  bookGrid[_0x2e2a59(0x241)]({ behavior: "smooth" }));
              },
            },
          }),
        ];
  (_0x3c3fe8[_0x39b096(0x1f1)](
    _0x1e3f82[_0x39b096(0x298)](el, _0x1e3f82[_0x39b096(0x21e)], {
      class: _0x39b096(0x2b2),
      type: _0x39b096(0x2eb),
      text: _0x39b096(0x220),
      on: { click: logout },
    }),
  ),
    _0x4a3ca8[_0x39b096(0x284)](
      _0x1e3f82[_0x39b096(0x23e)](el, _0x1e3f82[_0x39b096(0x25a)], {
        class: _0x1e3f82[_0x39b096(0x2e2)],
        text: _0x3475ed[_0x39b096(0x1ce)],
        "aria-label": _0x1e3f82[_0x39b096(0x1fa)],
      }),
      _0x1e3f82["ytTnd"](
        el,
        _0x39b096(0x29e),
        { class: _0x1e3f82[_0x39b096(0x292)] },
        _0x3c3fe8,
      ),
    ),
    userNav[_0x39b096(0x284)](_0x4a3ca8),
    _0x1e3f82[_0x39b096(0x1d1)](show, guestBanner, ![]),
    _0x1e3f82[_0x39b096(0x224)](show, favFilterWrapper, !_0x137e86));
}
async function loadCategories() {
  const _0x1f5455 = _0xd1c099,
    _0x3d7cc4 = {
      tbLQN: _0x1f5455(0x20f),
      bqINg: function (_0x5c8094) {
        return _0x5c8094();
      },
      PBOpj: function (_0x2c43d9, _0x33dbb4) {
        return _0x2c43d9(_0x33dbb4);
      },
      EsmnR: _0x1f5455(0x23d),
      opkPQ: "button",
      jgXXm: function (_0x4b099c, _0x43dcb7) {
        return _0x4b099c === _0x43dcb7;
      },
      HSHYr: _0x1f5455(0x2f3),
      DpHVy: function (_0x2c96c7, _0x410098) {
        return _0x2c96c7(_0x410098);
      },
      MveRC: function (_0x2fa284, _0x54d520, _0x108152) {
        return _0x2fa284(_0x54d520, _0x108152);
      },
      YFsff: function (_0x511613, _0x31c859) {
        return _0x511613(_0x31c859);
      },
      pGcjJ: "Gagal\x20memuat\x20kategori:",
    };
  try {
    const _0x5978ad = await api(_0x3d7cc4["EsmnR"], { auth: ![] }),
      _0x1c477e = el(_0x3d7cc4["opkPQ"], {
        class: _0x3d7cc4[_0x1f5455(0x301)](selectedCategory, "")
          ? _0x3d7cc4[_0x1f5455(0x273)]
          : "otc5w9",
        type: _0x1f5455(0x2eb),
        text: _0x1f5455(0x307),
        on: {
          click: () => {
            const _0x310a5a = _0x1f5455;
            ((selectedCategory = ""), (showingOnlyFavorites = ![]));
            if (filterFavoritesBtn)
              filterFavoritesBtn[_0x310a5a(0x23c)][_0x310a5a(0x2cf)](
                _0x3d7cc4["tbLQN"],
              );
            (updateCategoryActiveState(),
              (currentPage = 0x1),
              _0x3d7cc4[_0x310a5a(0x1d7)](loadBooks));
          },
        },
      });
    (_0x3d7cc4[_0x1f5455(0x1e5)](clear, categoryChips),
      categoryChips[_0x1f5455(0x284)](_0x1c477e));
    for (const _0x408938 of _0x5978ad) {
      const _0x20ae79 = _0x3d7cc4[_0x1f5455(0x2f5)](
        el,
        _0x3d7cc4[_0x1f5455(0x228)],
        {
          class:
            selectedCategory ===
            _0x3d7cc4[_0x1f5455(0x2fd)](String, _0x408938["id_kategori"])
              ? _0x3d7cc4[_0x1f5455(0x273)]
              : "otc5w9",
          type: _0x3d7cc4["opkPQ"],
          text: _0x408938[_0x1f5455(0x231)],
          on: {
            click: () => {
              const _0x407be3 = _0x1f5455,
                _0x228a0c = _0x407be3(0x29b)[_0x407be3(0x2a7)]("|");
              let _0x4e720f = 0x0;
              while (!![]) {
                switch (_0x228a0c[_0x4e720f++]) {
                  case "0":
                    if (filterFavoritesBtn)
                      filterFavoritesBtn[_0x407be3(0x23c)]["remove"](
                        _0x3d7cc4["tbLQN"],
                      );
                    continue;
                  case "1":
                    showingOnlyFavorites = ![];
                    continue;
                  case "2":
                    currentPage = 0x1;
                    continue;
                  case "3":
                    _0x3d7cc4["bqINg"](loadBooks);
                    continue;
                  case "4":
                    _0x3d7cc4[_0x407be3(0x1d7)](updateCategoryActiveState);
                    continue;
                  case "5":
                    selectedCategory = _0x3d7cc4[_0x407be3(0x2ff)](
                      String,
                      _0x408938["id_kategori"],
                    );
                    continue;
                }
                break;
              }
            },
          },
        },
      );
      categoryChips["append"](chip);
    }
  } catch (_0xeff0ba) {
    console[_0x1f5455(0x1e8)](_0x3d7cc4[_0x1f5455(0x25d)], _0xeff0ba);
  }
}
function updateCategoryActiveState() {
  const _0x5af45e = _0xd1c099,
    _0x1d0c3b = {
      uxoyA: function (_0x64f2c6, _0x2b461b) {
        return _0x64f2c6 === _0x2b461b;
      },
      KCqXR: _0x5af45e(0x20f),
      LExvb: function (_0xee61df, _0x3faa6a) {
        return _0xee61df !== _0x3faa6a;
      },
      TXrBK: _0x5af45e(0x275),
    },
    _0x4c5ae1 = categoryChips[_0x5af45e(0x2af)](_0x1d0c3b[_0x5af45e(0x243)]);
  _0x4c5ae1[_0x5af45e(0x2fa)]((_0x5248d0, _0xd40a3d) => {
    const _0x25b4e6 = _0x5af45e;
    if (
      _0x1d0c3b[_0x25b4e6(0x2ac)](_0xd40a3d, 0x0) &&
      _0x1d0c3b["uxoyA"](selectedCategory, "")
    )
      _0x5248d0[_0x25b4e6(0x23c)]["add"](_0x1d0c3b["KCqXR"]);
    else
      _0x5248d0[_0x25b4e6(0x2bd)] &&
      _0x1d0c3b[_0x25b4e6(0x1c4)](selectedCategory, "")
        ? _0x5248d0[_0x25b4e6(0x23c)][_0x25b4e6(0x1e6)](
            _0x1d0c3b[_0x25b4e6(0x312)],
            _0x5248d0[_0x25b4e6(0x1ed)]["categoryId"] === selectedCategory,
          )
        : _0x5248d0[_0x25b4e6(0x23c)][_0x25b4e6(0x2cf)](_0x25b4e6(0x20f));
  });
}
function renderBookCard(_0x54547c) {
  const _0x129b60 = _0xd1c099,
    _0x4cd5de = {
      LcEXD: _0x129b60(0x227),
      IudxD: function (_0x4167e2, _0x1c54f7, _0x4a4c3c) {
        return _0x4167e2(_0x1c54f7, _0x4a4c3c);
      },
      ooBqy: function (_0x17a30b, _0x211cee) {
        return _0x17a30b(_0x211cee);
      },
      aeYSX: _0x129b60(0x30c),
      VgNCm: "cifaca\x20gh5kv2",
      BNVdL: _0x129b60(0x2ee),
      xjmes: _0x129b60(0x215),
      iiplx: _0x129b60(0x2a6),
      XowGL: _0x129b60(0x225),
      eAeXA: function (_0x51bd54) {
        return _0x51bd54();
      },
      hIVoR: _0x129b60(0x310),
      NQyfm: function (_0x57b3a0, _0x5adf33) {
        return _0x57b3a0(_0x5adf33);
      },
      EhWrQ: _0x129b60(0x2eb),
      FRsKI: _0x129b60(0x235),
      GsGZW: _0x129b60(0x226),
      PklIG: _0x129b60(0x24b),
      IzvZk: function (_0x922586, _0x1e031f, _0x15d73c) {
        return _0x922586(_0x1e031f, _0x15d73c);
      },
      ocsLR: _0x129b60(0x28c),
      cSLBQ: "PDF\x20Belum\x20Tersedia",
      ucfsw: _0x129b60(0x278),
      AyIAr: _0x129b60(0x237),
      ypiSl: function (
        _0x456acf,
        _0x301104,
        _0x2f44c5,
        _0x2ade44,
        _0x2adf5b,
        _0x32e809,
        _0x478497,
      ) {
        return _0x456acf(
          _0x301104,
          _0x2f44c5,
          _0x2ade44,
          _0x2adf5b,
          _0x32e809,
          _0x478497,
        );
      },
      SOQfm: _0x129b60(0x29e),
      eIcca: _0x129b60(0x2e1),
      ozpXm: function (_0x58ec03, _0x4902b9, _0xb8c9ab, _0x115ddd, _0x577e19) {
        return _0x58ec03(_0x4902b9, _0xb8c9ab, _0x115ddd, _0x577e19);
      },
      cEeDy: _0x129b60(0x2d4),
      yqHkz: _0x129b60(0x20b),
      LDmQz: _0x129b60(0x311),
      AntLN: function (_0x846f6e, _0x51ea1b, _0x54cb88) {
        return _0x846f6e(_0x51ea1b, _0x54cb88);
      },
      dsDlF: _0x129b60(0x251),
      xZOjj: _0x129b60(0x295),
      wfDYa: _0x129b60(0x29d),
      HsqyY: _0x129b60(0x281),
      RrLYC: function (_0x18a178, _0x1f89c5, _0x20604c) {
        return _0x18a178(_0x1f89c5, _0x20604c);
      },
      SIQNM: _0x129b60(0x261),
      hyZvk: _0x129b60(0x2b0),
      MfnJF: _0x129b60(0x1e0),
      nEUza: function (_0x23c1f8, _0x27de8c, _0x3072fa, _0x3a718e) {
        return _0x23c1f8(_0x27de8c, _0x3072fa, _0x3a718e);
      },
      yMguQ: _0x129b60(0x207),
      leaqX: function (_0xebafcb, _0x49b005, _0x3a9472) {
        return _0xebafcb(_0x49b005, _0x3a9472);
      },
      unVtZ: _0x129b60(0x253),
      Ngwzm: _0x129b60(0x30a),
      CzqPA: "lazy",
      hStYI: _0x129b60(0x265),
      dOcUq: _0x129b60(0x1ef),
      RRRoh: function (_0x8b2927, _0x531d47, _0x4924cb) {
        return _0x8b2927(_0x531d47, _0x4924cb);
      },
      PItgu: "ymarjj",
      iipuj: "article",
      auhzn: _0x129b60(0x20c),
      niNOZ: _0x129b60(0x1c6),
      CShLi: function (_0xaebeda, _0x40a1a1, _0x1653d1, _0x234920, _0x4766e8) {
        return _0xaebeda(_0x40a1a1, _0x1653d1, _0x234920, _0x4766e8);
      },
      GWCRs: _0x129b60(0x1ee),
      KSNqI: function (_0x1c89d8, _0x4302e4, _0x4710a3) {
        return _0x1c89d8(_0x4302e4, _0x4710a3);
      },
      DYQuY: _0x129b60(0x1c9),
    },
    _0x42d3ca = _0x4cd5de[_0x129b60(0x264)](
      Boolean,
      _0x54547c[_0x129b60(0x20a)],
    ),
    _0x2d6e0a = el(_0x4cd5de[_0x129b60(0x1cd)], {
      class: _0x42d3ca ? "cifaca\x20gh5kv2" : _0x4cd5de[_0x129b60(0x291)],
      type: _0x4cd5de["EhWrQ"],
      title: _0x42d3ca ? _0x129b60(0x2a6) : _0x4cd5de["XowGL"],
      "aria-label": _0x42d3ca
        ? _0x129b60(0x1f2)[_0x129b60(0x249)](
            _0x54547c[_0x129b60(0x24a)],
            "\x20dari\x20favorit",
          )
        : _0x129b60(0x1e1)[_0x129b60(0x249)](
            _0x54547c[_0x129b60(0x24a)],
            _0x129b60(0x2d6),
          ),
      text: _0x42d3ca ? _0x4cd5de[_0x129b60(0x218)] : _0x4cd5de["xjmes"],
      on: {
        click: async () => {
          const _0x42a38e = _0x129b60;
          if (!currentUser) {
            toast(_0x4cd5de[_0x42a38e(0x26e)], !![]);
            return;
          }
          try {
            _0x2d6e0a["disabled"] = !![];
            const _0x45a841 = await _0x4cd5de[_0x42a38e(0x2bc)](
              api,
              _0x42a38e(0x222)[_0x42a38e(0x249)](
                _0x4cd5de[_0x42a38e(0x308)](
                  encodeURIComponent,
                  _0x54547c[_0x42a38e(0x2cd)],
                ),
                _0x42a38e(0x209),
              ),
              { method: _0x4cd5de[_0x42a38e(0x1d9)] },
            );
            ((_0x54547c[_0x42a38e(0x20a)] = _0x45a841[_0x42a38e(0x20a)]),
              (_0x2d6e0a["className"] = _0x45a841["is_favorite"]
                ? _0x4cd5de["VgNCm"]
                : _0x4cd5de[_0x42a38e(0x291)]),
              (_0x2d6e0a[_0x42a38e(0x2bd)] = _0x45a841["is_favorite"]
                ? _0x42a38e(0x235)
                : _0x4cd5de[_0x42a38e(0x1fe)]),
              (_0x2d6e0a[_0x42a38e(0x1c2)] = _0x45a841["is_favorite"]
                ? _0x4cd5de["iiplx"]
                : _0x4cd5de[_0x42a38e(0x22e)]),
              _0x4cd5de[_0x42a38e(0x308)](toast, _0x45a841[_0x42a38e(0x2c7)]),
              showingOnlyFavorites &&
                !_0x45a841[_0x42a38e(0x20a)] &&
                _0x4cd5de["eAeXA"](loadBooks));
          } catch (_0x3138a3) {
            _0x4cd5de["IudxD"](
              toast,
              _0x3138a3[_0x42a38e(0x2c7)] || _0x4cd5de[_0x42a38e(0x1f8)],
              !![],
            );
          } finally {
            _0x2d6e0a[_0x42a38e(0x2b6)] = ![];
          }
        },
      },
    });
  let _0x9f2dd3;
  _0x54547c["has_pdf"]
    ? (_0x9f2dd3 = _0x4cd5de[_0x129b60(0x2bc)](el, "a", {
        class: _0x4cd5de["GsGZW"],
        href: _0x129b60(0x222)[_0x129b60(0x249)](
          _0x4cd5de[_0x129b60(0x264)](
            encodeURIComponent,
            _0x54547c[_0x129b60(0x2cd)],
          ),
          _0x129b60(0x1f6),
        ),
        target: _0x4cd5de[_0x129b60(0x1ec)],
        rel: "noopener\x20noreferrer",
        text: _0x129b60(0x28e),
      }))
    : (_0x9f2dd3 = _0x4cd5de[_0x129b60(0x286)](el, _0x129b60(0x278), {
        class: _0x4cd5de[_0x129b60(0x274)],
        text: _0x4cd5de["cSLBQ"],
      }));
  const _0x40145a = _0x54547c[_0x129b60(0x254)]
      ? _0x4cd5de["IzvZk"](el, _0x4cd5de[_0x129b60(0x2f2)], {
          class: _0x4cd5de[_0x129b60(0x1ff)],
          text: _0x54547c["kategori_nama"],
        })
      : null,
    _0x454f17 = _0x4cd5de["ypiSl"](
      el,
      _0x4cd5de["SOQfm"],
      { class: _0x4cd5de[_0x129b60(0x229)] },
      _0x4cd5de[_0x129b60(0x1c7)](
        el,
        _0x4cd5de[_0x129b60(0x202)],
        { class: _0x4cd5de[_0x129b60(0x2d8)] },
        _0x4cd5de[_0x129b60(0x286)](el, "span", {
          class: _0x4cd5de["yqHkz"],
          text: _0x4cd5de[_0x129b60(0x22a)],
        }),
        _0x4cd5de["AntLN"](el, _0x4cd5de["ucfsw"], {
          class: _0x4cd5de[_0x129b60(0x2f9)],
          text: _0x54547c[_0x129b60(0x2e3)] || _0x4cd5de[_0x129b60(0x22b)],
        }),
      ),
      _0x4cd5de["ozpXm"](
        el,
        _0x4cd5de[_0x129b60(0x202)],
        { class: _0x129b60(0x2d4) },
        el(_0x4cd5de[_0x129b60(0x2f2)], {
          class: _0x4cd5de[_0x129b60(0x289)],
          text: _0x4cd5de["wfDYa"],
        }),
        el(_0x4cd5de[_0x129b60(0x2f2)], {
          class: _0x4cd5de["dsDlF"],
          text: ""
            ["concat"](_0x54547c[_0x129b60(0x2f8)] || "-", "\x20(")
            [_0x129b60(0x249)](_0x54547c[_0x129b60(0x2df)] || "-", ")"),
        }),
      ),
      el(
        _0x129b60(0x29e),
        { class: _0x129b60(0x2d4) },
        _0x4cd5de[_0x129b60(0x2bc)](el, _0x4cd5de["ucfsw"], {
          class: _0x129b60(0x20b),
          text: _0x4cd5de[_0x129b60(0x206)],
        }),
        el(_0x129b60(0x278), {
          class: _0x129b60(0x251),
          text: ""["concat"](_0x54547c[_0x129b60(0x208)], _0x129b60(0x2ca)),
        }),
      ),
      _0x4cd5de["ozpXm"](
        el,
        _0x4cd5de[_0x129b60(0x202)],
        { class: _0x4cd5de[_0x129b60(0x2d8)] },
        _0x4cd5de[_0x129b60(0x2ad)](el, _0x4cd5de["ucfsw"], {
          class: _0x4cd5de["yqHkz"],
          text: _0x4cd5de[_0x129b60(0x2fc)],
        }),
        _0x4cd5de[_0x129b60(0x2ad)](el, _0x4cd5de[_0x129b60(0x2f2)], {
          class: _0x4cd5de[_0x129b60(0x21c)],
          text: _0x54547c["isbn"],
        }),
      ),
    ),
    _0x1ec4b6 = _0x54547c[_0x129b60(0x244)]
      ? _0x4cd5de[_0x129b60(0x2bc)](el, "p", {
          class: _0x4cd5de[_0x129b60(0x2c2)],
          text: _0x54547c[_0x129b60(0x244)],
        })
      : null;
  let _0x486f17;
  return (
    _0x54547c[_0x129b60(0x1d2)] || _0x54547c[_0x129b60(0x2a8)]
      ? (_0x486f17 = _0x4cd5de[_0x129b60(0x259)](
          el,
          _0x129b60(0x29e),
          { class: _0x4cd5de[_0x129b60(0x250)] },
          _0x4cd5de[_0x129b60(0x270)](el, _0x4cd5de[_0x129b60(0x2a2)], {
            class: _0x4cd5de[_0x129b60(0x1e2)],
            src: "/api/books/"
              [
                _0x129b60(0x249)
              ](encodeURIComponent(_0x54547c[_0x129b60(0x2cd)]), _0x129b60(0x21d))
              [
                _0x129b60(0x249)
              ](_0x4cd5de[_0x129b60(0x308)](encodeURIComponent, _0x54547c["book_cover"] || "")),
            alt: _0x129b60(0x211)["concat"](_0x54547c[_0x129b60(0x24a)]),
            loading: _0x4cd5de[_0x129b60(0x297)],
          }),
        ))
      : (_0x486f17 = el(
          _0x4cd5de["SOQfm"],
          { class: _0x4cd5de[_0x129b60(0x2f0)] },
          el(_0x129b60(0x278), {
            class: _0x4cd5de[_0x129b60(0x203)],
            text: "📖",
          }),
          _0x4cd5de["RRRoh"](el, _0x129b60(0x278), {
            class: _0x4cd5de[_0x129b60(0x1dd)],
            text: _0x54547c[_0x129b60(0x24a)],
          }),
        )),
    el(
      _0x4cd5de[_0x129b60(0x267)],
      {
        class: _0x4cd5de["auhzn"],
        dataset: { isbn: _0x54547c[_0x129b60(0x2cd)] },
      },
      _0x486f17,
      el(
        _0x4cd5de[_0x129b60(0x202)],
        { class: _0x4cd5de[_0x129b60(0x30f)] },
        _0x4cd5de["CShLi"](
          el,
          _0x4cd5de[_0x129b60(0x202)],
          { class: _0x4cd5de[_0x129b60(0x1fc)] },
          _0x40145a,
          _0x2d6e0a,
        ),
        _0x4cd5de[_0x129b60(0x2f4)](el, "h2", {
          class: _0x4cd5de[_0x129b60(0x2a9)],
          text: _0x54547c[_0x129b60(0x24a)],
        }),
        _0x454f17,
        _0x1ec4b6,
        el("div", { class: "vm3x12" }, _0x9f2dd3),
      ),
    )
  );
}
async function loadBooks() {
  const _0x2cc666 = _0xd1c099,
    _0x20154b = {
      BnQhT: function (_0x1fba1d, _0x1d4331) {
        return _0x1fba1d(_0x1d4331);
      },
      jEzuJ: function (_0x34cde0, _0x13db1e, _0x1e2a8f) {
        return _0x34cde0(_0x13db1e, _0x1e2a8f);
      },
      eAXsL: function (_0x2049bf, _0xd5460f) {
        return _0x2049bf / _0xd5460f;
      },
      LyKYe: function (_0x8999ea, _0x7679d) {
        return _0x8999ea(_0x7679d);
      },
      WYKlt: _0x2cc666(0x20d),
      iCpOY: function (_0x29de93, _0x302731) {
        return _0x29de93(_0x302731);
      },
      VZsrv: function (_0x4de080, _0x1280fd) {
        return _0x4de080 === _0x1280fd;
      },
      XyjHS: function (_0x5c2baf, _0x2a586b, _0x26491a, _0x24f2e6, _0x5b1edd) {
        return _0x5c2baf(_0x2a586b, _0x26491a, _0x24f2e6, _0x5b1edd);
      },
      BXiIx: _0x2cc666(0x25e),
      TvaWz: _0x2cc666(0x1f9),
      WfKsP: _0x2cc666(0x1e9),
      BqxXE: function (_0x322ce1, _0x55cf09) {
        return _0x322ce1 > _0x55cf09;
      },
      SnYqD: function (_0x5ceaf8, _0x11bd90) {
        return _0x5ceaf8 <= _0x11bd90;
      },
      gwIaq: function (_0x8b52ef, _0xd45a8d, _0x42e637) {
        return _0x8b52ef(_0xd45a8d, _0x42e637);
      },
      MvtMH: "Gagal\x20memuat\x20katalog\x20buku.",
    };
  (_0x20154b[_0x2cc666(0x1ea)](clear, bookGrid),
    (resultsCount[_0x2cc666(0x2bd)] = _0x2cc666(0x2c9)),
    _0x20154b[_0x2cc666(0x2d2)](show, pagination, ![]));
  try {
    let _0x4e91d7;
    if (showingOnlyFavorites && currentUser) {
      const _0x3ca83f = await _0x20154b[_0x2cc666(0x1ea)](
        api,
        _0x2cc666(0x2b3)["concat"](currentPage, "&page_size=12"),
      );
      _0x4e91d7 = {
        items: _0x3ca83f["map"]((_0x92721) => ({
          isbn: _0x92721[_0x2cc666(0x2cd)],
          id_kategori: 0x0,
          kategori_nama: _0x92721[_0x2cc666(0x254)],
          judul_buku: _0x92721["judul_buku"],
          nama_penulis: _0x92721[_0x2cc666(0x2e3)],
          nama_penerbit: _0x92721["nama_penerbit"],
          tahun_terbit: _0x92721[_0x2cc666(0x2df)],
          jumlah_halaman: _0x92721[_0x2cc666(0x208)],
          sinopsis: null,
          book_cover: _0x92721[_0x2cc666(0x2a8)],
          has_cover: _0x92721[_0x2cc666(0x1d2)],
          is_favorite: !![],
          has_pdf: _0x92721[_0x2cc666(0x2dc)],
        })),
        total: _0x3ca83f["length"],
        page: currentPage,
        page_size: 0xc,
        total_pages: Math["max"](
          0x1,
          Math["ceil"](
            _0x20154b[_0x2cc666(0x1cc)](_0x3ca83f[_0x2cc666(0x27a)], 0xc),
          ),
        ),
      };
    } else {
      const _0x3797f7 = new URLSearchParams({
        page: _0x20154b[_0x2cc666(0x27f)](String, currentPage),
        page_size: "12",
      });
      if (currentQuery["trim"]())
        _0x3797f7[_0x2cc666(0x1f7)]("q", currentQuery[_0x2cc666(0x213)]());
      if (selectedCategory)
        _0x3797f7["set"](_0x20154b[_0x2cc666(0x28b)], selectedCategory);
      _0x4e91d7 = await _0x20154b[_0x2cc666(0x2d2)](
        api,
        _0x2cc666(0x1fd)[_0x2cc666(0x249)](_0x3797f7[_0x2cc666(0x2db)]()),
        {
          auth: _0x20154b[_0x2cc666(0x2ba)](Boolean, currentUser),
          redirectOn401: ![],
        },
      );
    }
    ((totalPages = _0x4e91d7[_0x2cc666(0x2d5)] || 0x1),
      (resultsCount[_0x2cc666(0x2bd)] = _0x2cc666(0x29f)
        [_0x2cc666(0x249)](_0x4e91d7[_0x2cc666(0x2a3)], _0x2cc666(0x1f0))
        [_0x2cc666(0x249)](_0x4e91d7[_0x2cc666(0x2c4)], _0x2cc666(0x24c))
        [_0x2cc666(0x249)](totalPages, ")")));
    if (
      _0x20154b[_0x2cc666(0x2a4)](
        _0x4e91d7[_0x2cc666(0x1d3)][_0x2cc666(0x27a)],
        0x0,
      )
    ) {
      (bookGrid[_0x2cc666(0x284)](
        _0x20154b["XyjHS"](
          el,
          _0x2cc666(0x29e),
          { class: _0x20154b["BXiIx"] },
          _0x20154b[_0x2cc666(0x2d2)](el, "p", {
            class: _0x20154b[_0x2cc666(0x299)],
            text: _0x2cc666(0x1f5),
          }),
          el("p", {
            class: _0x20154b[_0x2cc666(0x290)],
            text: _0x2cc666(0x1d5),
          }),
        ),
      ),
        _0x20154b[_0x2cc666(0x2d2)](show, pagination, ![]));
      return;
    }
    for (const _0x515fe8 of _0x4e91d7["items"]) {
      bookGrid["append"](
        _0x20154b[_0x2cc666(0x2ba)](renderBookCard, _0x515fe8),
      );
    }
    _0x20154b[_0x2cc666(0x230)](totalPages, 0x1)
      ? (_0x20154b[_0x2cc666(0x2d2)](show, pagination, !![]),
        (pageInfo[_0x2cc666(0x2bd)] = _0x2cc666(0x28a)
          ["concat"](currentPage, _0x2cc666(0x24c))
          ["concat"](totalPages)),
        (prevPageBtn[_0x2cc666(0x2b6)] = _0x20154b[_0x2cc666(0x24d)](
          currentPage,
          0x1,
        )),
        (nextPageBtn["disabled"] = currentPage >= totalPages))
      : _0x20154b[_0x2cc666(0x304)](show, pagination, ![]);
  } catch (_0x40d18b) {
    (_0x40d18b instanceof ApiError
      ? (resultsCount[_0x2cc666(0x2bd)] = _0x2cc666(0x2ce)[_0x2cc666(0x249)](
          _0x40d18b[_0x2cc666(0x2c7)],
        ))
      : (resultsCount[_0x2cc666(0x2bd)] = _0x2cc666(0x271)),
      _0x20154b[_0x2cc666(0x2d2)](toast, _0x20154b["MvtMH"], !![]));
  }
}
(profileForm[_0xd1c099(0x30d)](_0xd1c099(0x2b1), async (_0x3799be) => {
  const _0x1632ae = _0xd1c099,
    _0x4b464f = {
      XMnxO: "0|4|3|1|2",
      gAnAF: function (_0x1478e4, _0x5a7f30, _0x226a01) {
        return _0x1478e4(_0x5a7f30, _0x226a01);
      },
      KsCqA: _0x1632ae(0x217),
      iaNzD: function (_0x32dd1a, _0x18917d) {
        return _0x32dd1a(_0x18917d);
      },
      SRzaL: _0x1632ae(0x223),
      APYhp: function (_0x2806e2, _0x2d39b9, _0x26dff6) {
        return _0x2806e2(_0x2d39b9, _0x26dff6);
      },
      mmNvv: function (_0x443379, _0x5e4721) {
        return _0x443379 instanceof _0x5e4721;
      },
      aCgVy: _0x1632ae(0x294),
    };
  (_0x3799be[_0x1632ae(0x2e0)](), setFormError(profileError, ""));
  if (!profileForm[_0x1632ae(0x296)]()) return;
  saveProfileBtn[_0x1632ae(0x2b6)] = !![];
  try {
    const _0x2d1240 = _0x4b464f["XMnxO"]["split"]("|");
    let _0x2970fd = 0x0;
    while (!![]) {
      switch (_0x2d1240[_0x2970fd++]) {
        case "0":
          currentUser = await _0x4b464f[_0x1632ae(0x2b4)](
            api,
            _0x1632ae(0x303),
            {
              method: _0x4b464f[_0x1632ae(0x1ca)],
              json: {
                username: profileUsername[_0x1632ae(0x2d1)][_0x1632ae(0x213)](),
                nomor_telepon: profilePhone[_0x1632ae(0x2d1)]["trim"]() || null,
                current_password: profilePassword[_0x1632ae(0x2d1)],
              },
            },
          );
          continue;
        case "1":
          closeModal(profileModal);
          continue;
        case "2":
          _0x4b464f["iaNzD"](toast, _0x4b464f[_0x1632ae(0x1cb)]);
          continue;
        case "3":
          initUserNav(currentUser);
          continue;
        case "4":
          profilePassword["value"] = "";
          continue;
      }
      break;
    }
  } catch (_0x3152d3) {
    _0x4b464f[_0x1632ae(0x216)](
      setFormError,
      profileError,
      _0x4b464f["mmNvv"](dnl4kp, ApiError)
        ? _0x3152d3[_0x1632ae(0x2c7)]
        : _0x4b464f["aCgVy"],
    );
  } finally {
    saveProfileBtn[_0x1632ae(0x2b6)] = ![];
  }
}),
  deleteAccountForm[_0xd1c099(0x30d)](_0xd1c099(0x2b1), async (_0x5c005c) => {
    const _0xe723fc = _0xd1c099,
      _0xe658ff = {
        EqNUZ: function (_0x427fbc, _0x29cf43) {
          return _0x427fbc !== _0x29cf43;
        },
        ubgut: _0xe723fc(0x21f),
        cOWZz: function (_0x2fc8dc, _0x3f198d, _0xf41759) {
          return _0x2fc8dc(_0x3f198d, _0xf41759);
        },
        tmAjg:
          "Ketik\x20HAPUS\x20persis\x20untuk\x20mengonfirmasi\x20penghapusan\x20akun.",
        mGRYh: function (_0x30297d, _0x184a29, _0xbd73b4) {
          return _0x30297d(_0x184a29, _0xbd73b4);
        },
        vGlAv: "/api/auth/me",
        Zzkze: _0xe723fc(0x2e5),
        FDQuv: "/login?deleted=1",
        tkcXz: function (_0x19b90d, _0x59f3a7) {
          return _0x19b90d instanceof _0x59f3a7;
        },
      };
    (_0x5c005c[_0xe723fc(0x2e0)](), setFormError(deleteAccountError, ""));
    if (!deleteAccountForm[_0xe723fc(0x296)]()) return;
    if (
      _0xe658ff["EqNUZ"](
        deleteAccountConfirm[_0xe723fc(0x2d1)],
        _0xe658ff[_0xe723fc(0x2d9)],
      )
    ) {
      (_0xe658ff[_0xe723fc(0x27d)](
        setFormError,
        deleteAccountError,
        _0xe658ff[_0xe723fc(0x2b9)],
      ),
        deleteAccountConfirm[_0xe723fc(0x1de)]());
      return;
    }
    confirmDeleteAccountBtn[_0xe723fc(0x2b6)] = !![];
    try {
      (await _0xe658ff[_0xe723fc(0x2e4)](api, _0xe658ff["vGlAv"], {
        method: _0xe658ff[_0xe723fc(0x205)],
        json: { password: deleteAccountPassword[_0xe723fc(0x2d1)] },
      }),
        session[_0xe723fc(0x1cf)](),
        location[_0xe723fc(0x2cc)](_0xe658ff["FDQuv"]));
    } catch (_0x404b5c) {
      _0xe658ff["mGRYh"](
        setFormError,
        deleteAccountError,
        _0xe658ff[_0xe723fc(0x24f)](dnl4kp, ApiError)
          ? _0x404b5c[_0xe723fc(0x2c7)]
          : _0xe723fc(0x219),
      );
    } finally {
      confirmDeleteAccountBtn[_0xe723fc(0x2b6)] = ![];
    }
  }));
function closeProfileModal() {
  const _0x2f3e51 = _0xd1c099,
    _0x16204b = {
      RPpQn: function (_0x2eefbc, _0x1a5e99) {
        return _0x2eefbc(_0x1a5e99);
      },
    };
  ((profilePassword[_0x2f3e51(0x2d1)] = ""),
    _0x16204b[_0x2f3e51(0x2ea)](closeModal, profileModal));
}
function closeDeleteAccountModal() {
  const _0x3a94d2 = _0xd1c099,
    _0x3ad91c = {
      riRiv: function (_0x3f0c57, _0x1d8889) {
        return _0x3f0c57(_0x1d8889);
      },
    };
  ((deleteAccountPassword[_0x3a94d2(0x2d1)] = ""),
    (deleteAccountConfirm[_0x3a94d2(0x2d1)] = ""),
    _0x3ad91c[_0x3a94d2(0x276)](closeModal, deleteAccountModal));
}
function _0x5b3b() {
  const _0x1757fb = [
    "AMqWngPXigHUB3rZCq",
    "mtC1nZa0wxffzhjg",
    "vu5jDhy",
    "svnctJOG",
    "vKT1BLy",
    "rfrtzhC",
    "tLf5zM0",
    "BgXQz2H5igS5ogPOCq",
    "zw5ts2S",
    "AwLWDwO",
    "y2XVC2uTzgvSzxrLlw1VzgfS",
    "zgvSzxrLlwfJy291BNqTzM9YBq",
    "A2v5",
    "Bu14wxm",
    "ENrVrgC",
    "C21VB3rO",
    "tgnfweq",
    "y2XPy2S",
    "BgvHCvG",
    "vgvYAMfKAsbRzxnHBgfOyw4GC2fHDcbTzw11yxqGA2f0ywXVzYbIDwT1lG",
    "Dev4rue",
    "sfniwxi",
    "B2nZtfi",
    "lMnOAxa",
    "CMLsAxy",
    "CM9Szq",
    "C3bHBG",
    "u2vZAsbHzg1PBMLZDhjHDg9YihrPzgfRigrHCgf0igrPCgvYyMfYDwKUifnPBgfRyw4GBwfZDwSGBgfNAs4",
    "BgvUz3rO",
    "Exndyxm",
    "sMHcwMG",
    "y09xwNO",
    "zgv0ywLSCW",
    "thLlwwu",
    "CMvZzxq",
    "sgfSyw1HBJOG",
    "rMrmv1i",
    "ywrK",
    "yxbWzw5K",
    "Dg9Rzw4",
    "sxP2wMS",
    "B01hvuK",
    "mZG1Bvb6veXV",
    "ExfiA3O",
    "sgfSyw1HBIa",
    "v1LlBhq",
    "yMfKz2uGyZz4ng9N",
    "ywrTAw5PC3rYyxrVCG",
    "8j+tHcbcywnHifberG",
    "wxvlELC",
    "v2zlC1a",
    "qK5wzeW",
    "r2D1rM4",
    "q0r4De4",
    "r2fNywWGBwvTCgvYyMfYDwKGChjVzMLSlG",
    "vgLKywSGzgLJyw50Dw1Ryw4",
    "CMvWB3j0vMfSAwrPDhK",
    "q3PXuee",
    "vvzguM4",
    "vhzHv3O",
    "DgvYDMvYAwzPA2fZAq",
    "nxWXFdb8nhWYFdm",
    "ndmXmdLfDun5uwO",
    "ugvUzxjIAxq6ia",
    "zgL2",
    "twvUzw11A2fUia",
    "y0rWtLy",
    "yMvSDw0GDgvYDMvYAwzPA2fZAq",
    "Dw5wDfO",
    "Dg90ywW",
    "vLPZCNy",
    "rgfMDgfY",
    "sgfWDxmGzgfYAsbMyxzVCML0",
    "C3bSAxq",
    "yM9VA19JB3zLCG",
    "rfLrDvK",
    "Dg5ZAdz3",
    "sgfWDxmGqwT1BG",
    "DxHVEue",
    "uNjmwum",
    "CxGWAdK3",
    "CxvLCNLtzwXLy3rVCKfSBa",
    "Bwv1D3vNihGYoxi0Ca",
    "C3vIBwL0",
    "CZb0y2fX",
    "l2fWAs9MyxzVCML0zxm/CgfNzt0",
    "z0fUquy",
    "tLbzB2K",
    "zgLZywjSzwq",
    "D1n1vuC",
    "zw1HAwW",
    "Dg1bAMC",
    "AunWt1K",
    "u3rHDhvZigfRDw46ia",
    "sxvKEeq",
    "Dgv4DenVBNrLBNq",
    "Bw9KywWTzgvSzxrLlwfJy291BNq",
    "mte0mNfmDeLNyq",
    "nxWZFdb8nhWXFdi",
    "zgvSzxrLlwfJy291BNqTCgfZC3DVCMq",
    "twzUsKy",
    "DeLpuve",
    "CgfNzq",
    "BM8TCMvMzxjYzxi",
    "z2v0rwXLBwvUDej5swq",
    "BwvZC2fNzq",
    "A1nYA1y",
    "twvUy2fYAsbIDwT1lI4U",
    "igHSBq",
    "A2v5zg93BG",
    "yxnZAwDU",
    "AxnIBG",
    "r2fNywWGBwvTDwf0igj1A3u6ia",
    "CMvTB3zL",
    "q0vlq2W",
    "DMfSDwu",
    "AKv6DuO",
    "y29UzMLYBs1KzwXLDguTywnJB3vUDa",
    "Cg5YAguW",
    "Dg90ywXFCgfNzxm",
    "igTLigzHDM9YAxq",
    "C2nYB2XSvg8",
    "y0vLrhK",
    "DwjNDxq",
    "Aw5WDxq6BM90kdPKAxnHyMXLzcK",
    "Dg9tDhjPBMC",
    "AgfZx3bKzG",
    "ChjVzMLSzs1WyxnZD29Yza",
    "EJvKCNOY",
    "DgfODw5FDgvYyML0",
    "ChjLDMvUDerLzMf1Bhq",
    "BdG5AZm4",
    "qM1YqwK",
    "BMfTyv9Wzw51BgLZ",
    "BuDswwG",
    "revmrvrf",
    "mZvmDKL2z04",
    "C2vHCMnOlwnSzwfYlwj0BG",
    "ChDdu0y",
    "EMm0A3zI",
    "uLbWuw4",
    "yNv0Dg9U",
    "ChjVzMLSzs1LCNjVCG",
    "DNvXAMLR",
    "y2LMywnH",
    "CvHLDKi",
    "Afn0wuK",
    "tNzoB0i",
    "DwnMC3C",
    "B3rJnxC5igDOnwT2mG",
    "s1noCuK",
    "txzLuKm",
    "B2vNDw1H",
    "CLPOqNK",
    "BMfTyv9Wzw5LCMjPDa",
    "zhneBey",
    "zM9YrwfJAa",
    "Bw9KywWTChjVzMLSzq",
    "u0LrtK0",
    "wuzZzMy",
    "AMC3DxrM",
    "uejpCgO",
    "yMvRDq",
    "AMDywg0",
    "AvvXEwm",
    "l2fWAs9HDxrOl21L",
    "z3Djyxe",
    "r1DYB0C",
    "CxvLCNLtzwXLy3rVCG",
    "u2vTDweGs2f0zwDVCMK",
    "B29cCxK",
    "zMLSDgvYlwzHDM9YAxrLCY1IDg4",
    "AtHRDhrR",
    "rxnJyxbL",
    "ue9tva",
    "ywrKrxzLBNrmAxn0zw5LCG",
    "qvrOt2G",
    "BMLot1O",
    "r2fNywWGBwvTCgvYyMfYDwKGzMf2B3jPDc4",
    "ugvUDwXPCZOG",
    "s0nXwfi",
    "twfZDwS",
    "u0HpEfu",
    "nZeWqwzHsgLx",
    "sw5MB3jTyxnPifbYB2zPBa",
    "DgL0Bgu",
    "D0L6BMO",
    "tev4DMi",
    "DwfLyMLM",
    "CtDTCtG2",
    "B3PWwg0",
    "mJa5mJaZnJHqyLj0vMi",
    "C3vRmMzQ",
    "s3ndCue",
    "u1j6yuW",
    "zufyC0W",
    "rwHxCLe",
    "DxnLCM5HBwu",
    "y2XLyxi",
    "y3vYCMvUDfrHCMDLDa",
    "qxLPteG",
    "AgfZx2nVDMvY",
    "AxrLBxm",
    "ChjLDI1WywDLlwj0BG",
    "q29IysbNDw5HA2fUigTHDgeGA3vUy2KGBgfPBIbHDgf1ihbPBgLOigTHDgvNB3jPigjLCMjLzgeU",
    "vwfpzuK",
    "yNfjtMC",
    "rxfAzuu",
    "ywvzu1G",
    "zMf2lwzPBhrLCI13CMfWCgvY",
    "A2HAD1O",
    "Dg9mB3DLCKnHC2u",
    "ueL0z3u",
    "zM9JDxm",
    "C2fTzs1VCMLNAw4",
    "AJv1z3i0",
    "vgfTyMfOA2fUia",
    "tMD3EM0",
    "rMfPBgvKihrVihjLzNjLC2GGDgHLigfKBwLUAxn0CMf0B3iGzgfZAgjVyxjKihnLC3nPB24U",
    "B3bLBG",
    "rhbivNK",
    "Dg9Nz2XL",
    "mJG2odG1ogXrrNDWqG",
    "zxjYB3i",
    "ExbQyNOW",
    "qM5rAfq",
    "C3vTBwfYEq",
    "ugTSsuC",
    "zgf0yxnLDa",
    "DtHNzgzH",
    "BwjTyxzK",
    "igP1zhvSigj1A3uGkeHHBgfTyw4G",
    "ChvZAa",
    "sgfWDxmG",
    "DLvbrfi",
    "rw1HAwW6ia",
    "vgLKywSGywrHigj1A3uGEwfUzYbJB2nVAYbKzw5Nyw4GCgvUy2fYAwfUiefUzgeU",
    "l3bKzG",
    "C2v0",
    "AeLwB1i",
    "zdbIC3OX",
    "C2XiDNK",
    "ENfwwfO",
    "r1DduNm",
    "l2fWAs9IB29RCZ8",
    "EgPTzxm",
    "qxLjqxi",
    "mZG4ntCYDK53qNfk",
    "CKvkDMy",
    "u09rzM0",
    "ze9Jvxe",
    "y2XVC2uTChjVzMLSzs1IDxr0B24",
    "wNPREMu",
    "shnXEvK",
    "BgXQz2H5",
    "ANvTBgfOx2HHBgfTyw4",
    "l2zHDM9YAxrL",
    "AxnFzMf2B3jPDgu",
    "yZe1mNjS",
    "y3bJyM5UigHUB3rZCq",
    "A2f0zwDVCMLFAwq",
    "mta3m3HICvrTtq",
    "z2G1A3yY",
    "zw1HAwXFDMvYAwzPzwq",
    "u2fTChvSia",
    "uNLeD2O",
    "DhjPBq",
    "Aw5WDxq",
    "4PIgiezHDM9YAxq",
    "qvbzAha",
    "uefuq0G",
    "rLjZs0K",
    "r2fNywWGBwvUz2HHChvZigfRDw4U",
    "CMvZDwX0CY1JB3vUDa",
    "qMvHCMvYia",
    "AhLADMS",
    "l2nVDMvYp3y9",
    "tLvTBM0",
    "sefqvvm",
    "s2vSDwfY",
    "l3jLz2LZDgvY",
    "l2fWAs9IB29RCY8",
    "sw5MB3jTyxnPihbYB2zPBcbIzxjOyxnPBcbKAxbLCMjHCNvPlG",
    "r3bdExi",
    "vgfTyMfOigTLigzHDM9YAxq",
    "Ewr1EdDNigjTBtiYDIbODxO2ohmGDZDPnwmZ",
    "u2LSywTHBIbnyxn1AYbHDgf1ierHzNrHCIb0zxjSzwjPAcbKywH1BhuGDw50DwSGBwvUEwLTCgfUigj1A3uGzMf2B3jPDc4",
    "B3bRufe",
    "zuLJy2e",
    "terTuxO",
    "EfPpAMO",
    "zK1pwuK",
    "DgfYz2v0",
    "wg93r0W",
    "D1n6wM0",
    "qNf4weu",
    "A2f0zwDVCMK",
    "r2fNywWGBwvTyNvRysbKyxnOyM9HCMqGywrTAw5PC3rYyxrVCI4",
    "ufvRsLC",
    "wfvcCvy",
    "4PIfifrLCNnPBxbHBG",
    "zgvSzxrLlwfJy291BNqTzxjYB3i",
    "CNzHDZDR",
    "ywnJB3vUDf9ZDgf0Dxm",
    "mZaZnZKYuvrxyLLN",
    "z0jMD2m",
    "AgLKzgvU",
    "y2XHC3nmAxn0",
    "l2fWAs9IB29RCY9JyxrLz29YAwvZ",
    "EKHyz1K",
    "B1zVyK8",
    "AM9PBG",
    "C2nYB2XSsw50B1zPzxC",
    "ChjVzMLSzs1WyxnZD29Yzc1MAwvSza",
    "vfHYqKS",
    "C2LUB3bZAxm",
    "zu1Ysxa",
    "mZjMsuLwCNy",
    "l2XVz2LU",
    "ChjVzMLSzs1WAg9Uzq",
    "y29Uy2f0",
    "ANvKDwXFyNvRDq",
    "x2jSyw5R",
    "igrHCMKG",
    "u25zCuq",
    "tendBum",
    "DgTJwhO",
    "Eu1NDve",
    "Bwv1D3vN",
    "r0rABKK",
    "Aw1N",
    "A2f0zwDVCMLFBMfTyq",
    "BM9TB3jFDgvSzxbVBG",
    "s3D6rKG",
    "CgHVBMvFDMvYAwzPzwq",
    "v0PyshK",
    "BKvvEMe",
    "vgPKqLq",
    "ChjVzMLSzs11C2vYBMfTzq",
    "tM9YBwfS",
    "CeDJAKO",
  ];
  _0x5b3b = function () {
    return _0x1757fb;
  };
  return _0x5b3b();
}
(document[_0xd1c099(0x2c6)]("close-profile-modal")[_0xd1c099(0x30d)](
  _0xd1c099(0x26f),
  closeProfileModal,
),
  document["getElementById"](_0xd1c099(0x204))["addEventListener"](
    "click",
    closeProfileModal,
  ),
  document[_0xd1c099(0x2c6)](_0xd1c099(0x268))[_0xd1c099(0x30d)](
    _0xd1c099(0x26f),
    closeDeleteAccountModal,
  ),
  document[_0xd1c099(0x2c6)]("cancel-delete-account")["addEventListener"](
    _0xd1c099(0x26f),
    closeDeleteAccountModal,
  ),
  profileModal["addEventListener"](_0xd1c099(0x26f), (_0x593b51) => {
    const _0x59fcff = _0xd1c099,
      _0x2fbe0e = {
        DTSdw: function (_0x2ab019, _0x1947a3) {
          return _0x2ab019 === _0x1947a3;
        },
        kSrkV: function (_0x1f3afd) {
          return _0x1f3afd();
        },
      };
    if (_0x2fbe0e[_0x59fcff(0x263)](_0x593b51[_0x59fcff(0x22d)], profileModal))
      _0x2fbe0e[_0x59fcff(0x2c8)](closeProfileModal);
  }),
  deleteAccountModal[_0xd1c099(0x30d)](_0xd1c099(0x26f), (_0x32d6b7) => {
    const _0x28cd90 = _0xd1c099,
      _0x3525c4 = {
        iHyml: function (_0x31dff4, _0x15636f) {
          return _0x31dff4 === _0x15636f;
        },
      };
    if (_0x3525c4["iHyml"](_0x32d6b7[_0x28cd90(0x22d)], deleteAccountModal))
      closeDeleteAccountModal();
  }),
  document[_0xd1c099(0x30d)](_0xd1c099(0x2cb), (_0x19df85) => {
    const _0x3a11dc = _0xd1c099,
      _0x26bd51 = {
        zqVXZ: _0x3a11dc(0x30b),
        tPNBf: function (_0x2f6ee5) {
          return _0x2f6ee5();
        },
        wIznj: function (_0x437b04) {
          return _0x437b04();
        },
      };
    _0x19df85[_0x3a11dc(0x26a)] === _0x26bd51[_0x3a11dc(0x1fb)] &&
      (_0x26bd51["tPNBf"](closeProfileModal),
      _0x26bd51[_0x3a11dc(0x1c3)](closeDeleteAccountModal));
  }));
function _0x455e(_0x2c093a, _0x32c2e2) {
  _0x2c093a = _0x2c093a - 0x1c0;
  const _0x5b3b5a = _0x5b3b();
  let _0x455e6b = _0x5b3b5a[_0x2c093a];
  if (_0x455e["kaJCIL"] === undefined) {
    var _0x4ac805 = function (_0x1e7f7d) {
      const _0x1c6ccd =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0x4a0b64 = "",
        _0x5df5c5 = "";
      for (
        let _0x17d0f4 = 0x0, _0x3c78ea, _0x1c56dd, _0x3b704f = 0x0;
        (_0x1c56dd = _0x1e7f7d["charAt"](_0x3b704f++));
        ~_0x1c56dd &&
        ((_0x3c78ea =
          _0x17d0f4 % 0x4 ? _0x3c78ea * 0x40 + _0x1c56dd : _0x1c56dd),
        _0x17d0f4++ % 0x4)
          ? (_0x4a0b64 += String["fromCharCode"](
              0xff & (_0x3c78ea >> ((-0x2 * _0x17d0f4) & 0x6)),
            ))
          : 0x0
      ) {
        _0x1c56dd = _0x1c6ccd["indexOf"](_0x1c56dd);
      }
      for (
        let _0x16b9f5 = 0x0, _0x40fb44 = _0x4a0b64["length"];
        _0x16b9f5 < _0x40fb44;
        _0x16b9f5++
      ) {
        _0x5df5c5 +=
          "%" +
          ("00" + _0x4a0b64["charCodeAt"](_0x16b9f5)["toString"](0x10))[
            "slice"
          ](-0x2);
      }
      return decodeURIComponent(_0x5df5c5);
    };
    ((_0x455e["IgPMCo"] = _0x4ac805),
      (_0x455e["UFbRQx"] = {}),
      (_0x455e["kaJCIL"] = !![]));
  }
  const _0x50537f = _0x5b3b5a[0x0];
  _0x455e["tYKFCT"] !== _0x50537f &&
    ((_0x455e["UFbRQx"] = {}), (_0x455e["tYKFCT"] = _0x50537f));
  const _0x48444a = _0x455e["UFbRQx"][_0x2c093a];
  return (
    _0x48444a === undefined
      ? ((_0x455e6b = _0x455e["IgPMCo"](_0x455e6b)),
        (_0x455e["UFbRQx"][_0x2c093a] = _0x455e6b))
      : (_0x455e6b = _0x48444a),
    _0x455e6b
  );
}
async function init() {
  const _0x73a7e7 = _0xd1c099,
    _0x128bca = {
      WJXHy: function (_0x32be12, _0x3416aa) {
        return _0x32be12 > _0x3416aa;
      },
      cDpNV: function (_0x2ea68f) {
        return _0x2ea68f();
      },
      EqZeE: _0x73a7e7(0x2c0),
      LCCmC: function (_0x1e65ea, _0x372728, _0x152e70) {
        return _0x1e65ea(_0x372728, _0x152e70);
      },
      JhBZh: function (_0x2e1ab8) {
        return _0x2e1ab8();
      },
      wSuUG: _0x73a7e7(0x26d),
      FdLWR: function (_0x3f3b1d, _0x17cbdb, _0x3a5f4b) {
        return _0x3f3b1d(_0x17cbdb, _0x3a5f4b);
      },
      tIOQQ: _0x73a7e7(0x214),
      GWroG: "click",
    };
  ((currentUser = await _0x128bca[_0x73a7e7(0x27c)](getCurrentUser)),
    initUserNav(currentUser));
  const _0x487d58 = _0x128bca[_0x73a7e7(0x282)](
    debounce,
    () => {
      const _0x57e325 = _0x73a7e7;
      ((currentQuery = searchInput["value"]),
        show(
          searchClearBtn,
          _0x128bca[_0x57e325(0x258)](currentQuery[_0x57e325(0x27a)], 0x0),
        ),
        (currentPage = 0x1),
        _0x128bca[_0x57e325(0x2a0)](loadBooks));
    },
    0x12c,
  );
  (searchInput["addEventListener"](_0x128bca[_0x73a7e7(0x2c3)], _0x487d58),
    searchClearBtn["addEventListener"](_0x128bca[_0x73a7e7(0x305)], () => {
      const _0x1a79ef = _0x73a7e7,
        _0x14c6af = _0x128bca[_0x1a79ef(0x1d8)][_0x1a79ef(0x2a7)]("|");
      let _0x37ae23 = 0x0;
      while (!![]) {
        switch (_0x14c6af[_0x37ae23++]) {
          case "0":
            _0x128bca[_0x1a79ef(0x24e)](show, searchClearBtn, ![]);
            continue;
          case "1":
            _0x128bca[_0x1a79ef(0x2a0)](loadBooks);
            continue;
          case "2":
            searchInput[_0x1a79ef(0x1de)]();
            continue;
          case "3":
            currentQuery = "";
            continue;
          case "4":
            currentPage = 0x1;
            continue;
          case "5":
            searchInput[_0x1a79ef(0x2d1)] = "";
            continue;
        }
        break;
      }
    }),
    filterFavoritesBtn &&
      filterFavoritesBtn[_0x73a7e7(0x30d)](_0x128bca["GWroG"], () => {
        const _0x499863 = _0x73a7e7;
        ((showingOnlyFavorites = !showingOnlyFavorites),
          filterFavoritesBtn["classList"][_0x499863(0x1e6)](
            _0x499863(0x20f),
            showingOnlyFavorites,
          ),
          (currentPage = 0x1),
          loadBooks());
      }),
    prevPageBtn["addEventListener"](_0x128bca[_0x73a7e7(0x305)], () => {
      const _0x4db090 = _0x73a7e7;
      currentPage > 0x1 &&
        (currentPage--,
        _0x128bca[_0x4db090(0x27c)](loadBooks),
        window[_0x4db090(0x2d7)]({ top: 0x0, behavior: "smooth" }));
    }),
    nextPageBtn[_0x73a7e7(0x30d)](_0x128bca[_0x73a7e7(0x305)], () => {
      const _0x125607 = _0x73a7e7;
      currentPage < totalPages &&
        (currentPage++,
        _0x128bca[_0x125607(0x27c)](loadBooks),
        window["scrollTo"]({
          top: 0x0,
          behavior: _0x128bca[_0x125607(0x2b7)],
        }));
    }),
    await _0x128bca[_0x73a7e7(0x2a0)](loadCategories),
    await _0x128bca[_0x73a7e7(0x27c)](loadBooks));
}
init();
