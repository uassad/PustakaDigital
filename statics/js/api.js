// Klien API: semua komunikasi ke backend lewat fetch() + header "Authorization: Bearer <JWT>".
//
// KEAMANAN
// - Token disimpan di sessionStorage (hilang saat tab ditutup), bukan localStorage, dan tidak pernah di URL.
// - Risiko XSS mencuri token dikurangi dengan: CSP ketat (tanpa inline script), dan SEMUA render memakai
//   textContent (lihat dom.js) — tidak ada innerHTML di seluruh kode frontend.
// - Hanya path same-origin "/api/..." yang boleh dipanggil; credentials: "omit" (tanpa cookie).
// - Pesan error dari server ditampilkan sebagai teks biasa.

const TOKEN_KEY = "uas_sad_token";

export const session = {
  get token() {
    try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token) {
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch { /* storage diblokir: sesi hanya di memori halaman */ }
  },
  clear() {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* abaikan */ }
  },
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function describeError(status, body) {
  const detail = body && body.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => (d.field ? `${d.field}: ${d.msg}` : d.msg)).join("; ");
  }
  if (status === 429) return "Terlalu banyak percobaan. Coba lagi sebentar lagi.";
  if (status >= 500) return "Terjadi kesalahan pada server.";
  return `Permintaan gagal (${status}).`;
}

async function request(path, { method = "GET", json, form, auth = true, redirectOn401 = true, signal } = {}) {
  if (typeof path !== "string" || !path.startsWith("/api/")) {
    throw new Error("Hanya path /api/ yang diizinkan.");
  }
  const headers = {};
  const init = { method, headers, signal, credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer" };
  const token = session.token;
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(json);
  } else if (form) {
    init.body = form; // FormData: browser mengisi boundary multipart sendiri
  }

  const res = await fetch(path, init);
  if (res.status === 401 && token && auth) {
    session.clear(); // token kedaluwarsa / tidak valid
    if (redirectOn401) {
      const next = encodeURIComponent(location.pathname + location.search);
      location.assign(`/login?expired=1&next=${next}`);
    }
  }
  return res;
}

/** Panggil API JSON. Melempar ApiError bila status bukan 2xx. */
export async function api(path, options = {}) {
  const res = await request(path, options);
  if (res.status === 204) return null;
  let body = null;
  try { body = await res.json(); } catch { /* bukan JSON */ }
  if (!res.ok) throw new ApiError(res.status, describeError(res.status, body));
  return body;
}

/** Ambil berkas biner (mis. PDF) dengan header Authorization. */
export async function apiBlob(path, options = {}) {
  const res = await request(path, options);
  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch { /* abaikan */ }
    throw new ApiError(res.status, describeError(res.status, body));
  }
  return res.blob();
}
