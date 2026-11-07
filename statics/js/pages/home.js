import { logout, requireLogin } from "../auth.js";

// Halaman tujuan setelah login. Hanya untuk UX — otorisasi sebenarnya tetap di server (/api/*).
const user = await requireLogin();
document.getElementById("who").textContent = user.username;
document.getElementById("logout").addEventListener("click", logout);
