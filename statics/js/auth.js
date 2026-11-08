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

export async function logout() {
  try {
    const response = await fetch("/api/auth/admin-session", {
      method: "DELETE",
      credentials: "same-origin",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw new Error(`Cookie cleanup failed (${response.status}).`);
  } catch (error) {
    console.error("Failed to clear the administrator session cookie.", error);
  }
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
