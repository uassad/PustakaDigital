import { api } from "../api.js";
import { show } from "../dom.js";

const registerForm = document.getElementById("register-form");
const verifyForm = document.getElementById("verify-form");
const errorBox = document.getElementById("form-error");
const methodField = registerForm.verification_method;
const phoneField = registerForm.nomor_telepon;
const otpField = verifyForm["otp-code"];
let challengeId;

function updatePhoneRequirement() {
  phoneField.required = methodField.value === "phone";
}

function registrationPayload() {
  const phone = phoneField.value.trim();
  return {
    username: registerForm.username.value.trim(),
    email: registerForm.email.value.trim(),
    nomor_telepon: phone === "" ? null : phone,
    password: registerForm.password.value,
    verification_method: methodField.value,
  };
}

async function requestCode(button) {
  show(errorBox, false);
  if (!registerForm.checkValidity()) {
    show(errorBox, true, "Periksa kembali isian formulir.");
    registerForm.reportValidity();
    return;
  }
  button.disabled = true;
  try {
    const result = await api("/api/auth/register", {
      method: "POST",
      auth: false,
      json: registrationPayload(),
    });
    challengeId = result.challenge_id;
    otpField.value = "";
    const delivery = result.verification_method === "phone" ? "simulasi SMS" : "email simulasi";
    document.getElementById("otp-notice").textContent =
      `Kode ${delivery} dikirim ke ${result.destination}. Berlaku ${Math.ceil(result.expires_in / 60)} menit.`;
    registerForm.hidden = true;
    verifyForm.hidden = false;
    otpField.focus();
  } catch (error) {
    show(errorBox, true, error.message);
  } finally {
    button.disabled = false;
  }
}

methodField.addEventListener("change", updatePhoneRequirement);
updatePhoneRequirement();

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  requestCode(registerForm.querySelector("button[type=submit]"));
});

document.getElementById("resend-code").addEventListener("click", (event) => {
  requestCode(event.currentTarget);
});

verifyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  show(errorBox, false);
  if (!verifyForm.checkValidity()) {
    show(errorBox, true, "Masukkan kode OTP 6 digit.");
    verifyForm.reportValidity();
    return;
  }
  const button = verifyForm.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    await api("/api/auth/register/verify-otp", {
      method: "POST",
      auth: false,
      json: { challenge_id: challengeId, code: otpField.value },
    });
    registerForm.password.value = "";
    location.assign("/login?registered=1");
  } catch (error) {
    show(errorBox, true, error.message);
  } finally {
    button.disabled = false;
  }
});
