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
    const token = session.token;   // supaya server tahu siapa yang keluar (untuk log aktivitas)
    const response = await fetch("/api/auth/admin-session", {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "same-origin",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw new Error(`Cookie cleanup failed (${response.status}).`);
  } catch (error) {
    console.error("Failed to clear the administrator session cookie.", error);
  }
  session.clear();
  location.replace("/login");
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

/** Cegah halaman lama (cache back/forward) tampil lagi setelah logout. */
export function reloadOnBackForward() {
  window.addEventListener("pageshow", (event) => {
    const nav = performance.getEntriesByType("navigation")[0];
    if (event.persisted || (nav && nav.type === "back_forward")) location.reload();
  });
}