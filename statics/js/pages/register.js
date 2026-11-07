import { api } from "../api.js";
import { show } from "../dom.js";

const form = document.getElementById("register-form");
const errorBox = document.getElementById("form-error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  show(errorBox, false);

  // Validasi sisi klien hanya untuk UX; server (Pydantic) tetap menjadi penentu.
  if (!form.checkValidity()) {
    show(errorBox, true, "Periksa kembali isian formulir.");
    form.reportValidity();
    return;
  }
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const phone = form.nomor_telepon.value.trim();
    await api("/api/auth/register", {
      method: "POST",
      auth: false,
      json: {
        username: form.username.value.trim(),
        email: form.email.value.trim(),
        nomor_telepon: phone === "" ? null : phone,
        password: form.password.value,
      },
    });
    location.assign("/login?registered=1");
  } catch (e) {
    show(errorBox, true, e.message);
  } finally {
    button.disabled = false;
  }
});
