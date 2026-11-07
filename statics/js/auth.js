import { api, ApiError, session } from "./api.js";

let cached;

/** Pengguna saat ini (atau null bila belum login / token kedaluwarsa). Hanya untuk UX — server tetap memeriksa tiap request. */
export async function getCurrentUser() {
  if (!session.token) return null;
  if (cached === undefined) {
    try {
      cached = await api("/api/auth/me", { redirectOn401: false });
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
      cached = null;
    }
  }
  return cached;
}

export function logout() {
  // JWT stateless: logout = membuang token di klien. Token tetap valid sampai exp (singkat, 30 menit).
  session.clear();
  location.assign("/login");
}

export const isAdmin = (user) => !!user && user.role.toLowerCase() === "administrator";

export async function requireLogin() {
  const user = await getCurrentUser();
  if (!user) {
    location.assign(`/login?next=${encodeURIComponent(location.pathname)}`);
    return new Promise(() => {}); // hentikan eksekusi lanjutan selama redirect
  }
  return user;
}
