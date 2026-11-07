// Helper DOM aman-XSS. Teks SELALU lewat textContent / createTextNode (otomatis ter-escape).
// JANGAN pernah memakai innerHTML / insertAdjacentHTML / document.write dengan data dari server atau pengguna.

const FORBIDDEN_ATTR = /^(on|style$|srcdoc$)/i; // blokir handler inline, style inline, srcdoc

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = String(value);
    else if (key === "on") for (const [evt, fn] of Object.entries(value)) node.addEventListener(evt, fn);
    else if (key === "dataset") Object.assign(node.dataset, value);
    else {
      if (FORBIDDEN_ATTR.test(key)) throw new Error(`Atribut dilarang: ${key}`);
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) {
  node.replaceChildren();
}

export function show(node, visible, text) {
  if (text !== undefined) node.textContent = text;
  node.hidden = !visible;
}

let toastTimer;
export function toast(message, isError = false) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = message;
  t.className = isError ? "toast error" : "toast";
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 4000);
}

/** Terima hanya path internal seperti "/buku/123" — mencegah open-redirect ("//evil.com", "https://...", "javascript:"). */
export function safeInternalPath(candidate, fallback = "/") {
  return typeof candidate === "string" && /^\/(?![/\\])[^\s\\]*$/.test(candidate) ? candidate : fallback;
}

export function debounce(fn, ms) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}

export const isIsbn = (s) => /^97[89][0-9]{10}$/.test(s);
export const cleanIsbn = (s) => s.replace(/[-\s]/g, "");
