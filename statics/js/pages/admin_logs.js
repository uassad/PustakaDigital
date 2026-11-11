// admin_logs.js — Halaman Log Aktivitas (MongoDB) untuk Administrator
//
// KEAMANAN: tanpa innerHTML; semua teks dari server dimasukkan via textContent / el() (otomatis di-escape).
// Server tetap memeriksa role Administrator pada setiap panggilan /api/admin/logs.

import { api, ApiError, session } from "../api.js";
import { el, clear, show, toast } from "../dom.js";
import { logout, reloadOnBackForward } from "../auth.js";

reloadOnBackForward();

const PAGE_SIZE = 20;

const CATEGORY_LABELS = {
  auth: "Autentikasi",
  admin_book: "Aksi Admin (Buku)",
  reader: "Aktivitas Pembaca",
  security: "Keamanan",
};

const ACTION_LABELS = {
  register_started: "Registrasi dimulai",
  register_failed: "Registrasi gagal",
  register_verified: "Registrasi selesai (OTP benar)",
  register_verify_failed: "Verifikasi OTP gagal",
  login_success: "Login berhasil",
  login_failed: "Login gagal",
  logout: "Logout",
  profile_update: "Ubah profil",
  account_delete: "Hapus akun",
  book_create: "Tambah buku",
  book_update: "Ubah buku",
  book_delete: "Hapus buku",
  upload_files: "Unggah berkas buku",
  search: "Cari buku",
  book_view: "Lihat detail buku",
  pdf_read: "Baca PDF",
  favorite_added: "Tambah favorit",
  favorite_removed: "Hapus favorit",
  rate_limited: "Terkena rate limit",
  access_denied: "Akses ditolak",
  unauthorized_access: "Akses admin tanpa login",
  invalid_upload: "Upload tidak valid",
  account_frozen: "Akun dibekukan",
};

const STATUS_LABELS = { success: "Berhasil", failed: "Gagal", blocked: "Diblokir" };
const STATUS_PILL = { success: "ok", failed: "warn", blocked: "frozen" };

let currentPage = 1;
let totalPages = 1;

const tbody = document.getElementById("log-tbody");
const logState = document.getElementById("log-state");
const pagination = document.getElementById("pagination");
const prevBtn = document.getElementById("prev-page-btn");
const nextBtn = document.getElementById("next-page-btn");
const pageInfo = document.getElementById("page-info");
const filtersForm = document.getElementById("log-filters");
const fCategory = document.getElementById("f-category");
const fAction = document.getElementById("f-action");
const fStatus = document.getElementById("f-status");
const fActor = document.getElementById("f-actor");
const fFrom = document.getElementById("f-from");
const fTo = document.getElementById("f-to");

// ─── Auth guard (sama seperti dashboard buku) ─────────────────────────────────

async function guardAdmin() {
  if (!session.token) {
    location.assign(`/login?next=${encodeURIComponent(location.pathname)}`);
    return new Promise(() => {});
  }
  let user;
  try {
    user = await api("/api/auth/me", { redirectOn401: false });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      location.assign(`/login?expired=1&next=${encodeURIComponent(location.pathname)}`);
      return new Promise(() => {});
    }
    throw err;
  }
  if (!user || user.role?.toLowerCase() !== "administrator") {
    location.assign("/");
    return new Promise(() => {});
  }
  return user;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fillSelect(select, labels) {
  for (const [value, label] of Object.entries(labels)) {
    const opt = el("option", { value });
    opt.textContent = label;
    select.append(opt);
  }
}

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" });
}

function buildParams() {
  const params = new URLSearchParams({ page: String(currentPage), page_size: String(PAGE_SIZE) });
  if (fCategory.value) params.set("category", fCategory.value);
  if (fAction.value) params.set("action", fAction.value);
  if (fStatus.value) params.set("status", fStatus.value);
  if (fActor.value.trim()) params.set("actor", fActor.value.trim());
  // Tanggal dari kolom input dianggap waktu lokal browser, dikirim sebagai ISO UTC.
  if (fFrom.value) params.set("date_from", new Date(`${fFrom.value}T00:00:00`).toISOString());
  if (fTo.value) params.set("date_to", new Date(`${fTo.value}T23:59:59.999`).toISOString());
  return params;
}

function actorCell(actor) {
  const td = el("td");
  if (!actor) {
    td.textContent = "Tamu / tidak dikenal";
    td.classList.add("muted");
    return td;
  }
  if (actor.username) {
    const strong = el("strong");
    strong.textContent = actor.username;
    td.append(strong);
    if (actor.role) {
      const small = el("small", { class: "muted" });
      small.textContent = actor.role;
      td.append(el("br"), small);
    }
  } else {
    td.textContent = actor.id ? `ID ${String(actor.id).slice(0, 8)}…` : "—";
  }
  return td;
}

function targetCell(target) {
  const td = el("td");
  if (!target) {
    td.textContent = "—";
    return td;
  }
  const label = el("span");
  label.textContent = target.label || target.id || "—";
  td.append(label);
  if (target.id && target.label) {
    const small = el("small", { class: "muted" });
    small.textContent = String(target.id);
    td.append(el("br"), small);
  }
  return td;
}

function detailCell(item) {
  const td = el("td");
  const payload = { ...(item.details || {}) };
  if (item.method || item.path) payload.request = `${item.method || ""} ${item.path || ""}`.trim();
  if (item.user_agent) payload.user_agent = item.user_agent;
  if (Object.keys(payload).length === 0) {
    td.textContent = "—";
    return td;
  }
  const summary = el("summary");
  summary.textContent = "Lihat";
  const pre = el("pre", { class: "log-json" });
  pre.textContent = JSON.stringify(payload, null, 2);
  td.append(el("details", { class: "log-details" }, summary, pre));
  return td;
}

function renderRow(item) {
  const category = el("td");
  category.textContent = CATEGORY_LABELS[item.category] || item.category;

  const action = el("td");
  action.textContent = ACTION_LABELS[item.action] || item.action;

  const pill = el("span", { class: `status-pill ${STATUS_PILL[item.status] || "none"}` });
  pill.textContent = STATUS_LABELS[item.status] || item.status;

  const time = el("td", { class: "log-time" });
  time.textContent = formatTime(item.timestamp);

  const ip = el("td");
  ip.textContent = item.ip || "—";

  return el("tr", {}, time, category, action, el("td", {}, pill), actorCell(item.actor), targetCell(item.target), ip, detailCell(item));
}

function renderSkeleton(count = 5) {
  for (let i = 0; i < count; i++) {
    const tr = el("tr");
    for (let j = 0; j < 8; j++) tr.append(el("td", {}, el("div", { class: "skeleton skeleton-line" })));
    tbody.append(tr);
  }
}

// ─── Muat data ────────────────────────────────────────────────────────────────

async function loadSummary() {
  try {
    const data = await api("/api/admin/logs/summary?hours=24");
    document.getElementById("sum-total").textContent = String(data.total);
    for (const key of Object.keys(CATEGORY_LABELS)) {
      document.getElementById(`sum-${key}`).textContent = String(data.by_category[key] ?? 0);
    }
  } catch {
    /* pesan kesalahan ditampilkan oleh loadLogs (sumbernya sama) */
  }
}

async function loadLogs() {
  clear(tbody);
  renderSkeleton();
  logState.textContent = "";
  show(pagination, false);
  try {
    const data = await api(`/api/admin/logs?${buildParams().toString()}`);
    clear(tbody);
    totalPages = data.total_pages || 1;
    if (!data.items.length) {
      logState.textContent = "Tidak ada log yang cocok dengan filter.";
      return;
    }
    data.items.forEach((item) => tbody.append(renderRow(item)));
    logState.textContent = `${data.total} catatan ditemukan.`;
    if (totalPages > 1) {
      show(pagination, true);
      pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;
    }
  } catch (err) {
    clear(tbody);
    const msg = err instanceof ApiError ? err.message : "Terjadi kesalahan saat memuat log.";
    logState.textContent = `Gagal memuat log: ${msg}`;
    toast(msg, true);
  }
}

function reload(resetPage = true) {
  if (resetPage) currentPage = 1;
  loadSummary();
  return loadLogs();
}

// ─── Inisialisasi ─────────────────────────────────────────────────────────────

async function init() {
  const user = await guardAdmin();

  // Profil administrator (modal)
  const adminMenu = document.getElementById("admin-menu");
  const modalProfile = document.getElementById("modal-profile");
  document.getElementById("profile-username").textContent = user.username;
  document.getElementById("profile-email").textContent = user.email;
  document.getElementById("profile-phone").textContent = user.nomor_telepon || "Belum ditambahkan";
  document.getElementById("profile-status").textContent = user.account_status === "beku" ? "Dibekukan" : "Normal";
  const closeProfile = () => modalProfile.classList.remove("open");
  document.getElementById("profile-btn").addEventListener("click", () => {
    adminMenu.open = false;
    modalProfile.classList.add("open");
    document.getElementById("close-profile-modal").focus();
  });
  document.getElementById("close-profile-modal").addEventListener("click", closeProfile);
  document.getElementById("close-profile-button").addEventListener("click", closeProfile);
  modalProfile.addEventListener("click", (event) => { if (event.target === modalProfile) closeProfile(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeProfile(); });

  fillSelect(fCategory, CATEGORY_LABELS);
  fillSelect(fAction, ACTION_LABELS);
  fillSelect(fStatus, STATUS_LABELS);

  document.getElementById("logout-btn").addEventListener("click", logout);

  filtersForm.addEventListener("submit", (event) => {
    event.preventDefault();
    reload();
  });
  document.getElementById("f-reset").addEventListener("click", () => {
    filtersForm.reset();
    reload();
  });
  document.getElementById("f-refresh").addEventListener("click", () => reload(false));

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadLogs();
    }
  });
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadLogs();
    }
  });

  await reload();
}

init();
