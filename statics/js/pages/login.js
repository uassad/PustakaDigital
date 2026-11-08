import { api, session } from "../api.js";
import { show } from "../dom.js";

const params = new URLSearchParams(location.search);
const ADMIN_DASHBOARD_PATH = "/seAj2hB9sk/admin";
const notice = document.getElementById("notice");
if (params.has("deleted")) show(notice, true, "Akun Anda berhasil dihapus.");
else if (params.has("registered")) show(notice, true, "Akun berhasil didaftarkan. Silakan masuk.");
else if (params.has("expired")) show(notice, true, "Sesi berakhir. Silakan masuk lagi.");

const form = document.getElementById("login-form");
const errorBox = document.getElementById("form-error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  show(errorBox, false);
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      auth: false,
      json: { identifier: form.identifier.value.trim(), password: form.password.value },
    });
    session.set(data.access_token);
    form.password.value = "";
    const isAdmin = data.user.role?.toLowerCase() === "administrator";
    const destination = isAdmin ? ADMIN_DASHBOARD_PATH : "/";

    if (destination === ADMIN_DASHBOARD_PATH) {
      const response = await fetch("/api/auth/admin-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.access_token}` },
        credentials: "same-origin",
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (!response.ok) {
        session.clear();
        throw new Error("Sesi administrator tidak dapat dibuat. Silakan masuk lagi.");
      }
    }

    location.assign(destination);
  } catch (e) {
    show(errorBox, true, e.message);
  } finally {
    button.disabled = false;
  }
});
