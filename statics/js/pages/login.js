import { api, session } from "../api.js";
import { safeInternalPath, show } from "../dom.js";

const params = new URLSearchParams(location.search);
const notice = document.getElementById("notice");
if (params.has("registered")) show(notice, true, "Akun berhasil didaftarkan. Silakan masuk.");
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
    location.assign(safeInternalPath(params.get("next"), "/")); // anti open-redirect
  } catch (e) {
    show(errorBox, true, e.message);
  } finally {
    button.disabled = false;
  }
});
