// ---------- Shared: used by every page ----------
const DATA_URL = "data/data.json";

const SHELL = {
  fa: {
    brand: "پایگاه‌های داده پزشکی",
    foot: "پیوندها به منابع بیرونی هستند. ساخته شده با ♥️ توسط علی اکبر سبحانپور",
    error: "بارگذاری داده‌ها ناموفق بود.",
  },
  en: {
    brand: "Medical Databases",
    foot: "Links lead to external resources.",
    error: "Failed to load data.",
  },
};

const root = document.documentElement;
const state = { lang: "fa", theme: "light" };

try {
  state.lang = localStorage.lang || "fa";
  state.theme =
    localStorage.theme ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
} catch (e) {}

const $ = (id) => document.getElementById(id);

// Escape text before putting it into innerHTML
const esc = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const save = (key, value) => {
  try {
    localStorage[key] = value;
  } catch (e) {}
};

async function loadData() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

// Header, footer, language and theme
function applyShell() {
  const { lang, theme } = state;
  root.lang = lang;
  root.dir = lang === "fa" ? "rtl" : "ltr";
  root.dataset.theme = theme;
  $("brand").textContent = SHELL[lang].brand;
  $("lang").innerHTML =
    `<b class="${lang === "fa" ? "on" : ""}">FA</b> / <b class="${lang === "en" ? "on" : ""}">EN</b>`;
  $("theme").textContent = theme === "dark" ? "☀" : "☾";
  $("foot").textContent = SHELL[lang].foot;
}

// Wire up the two buttons. `onChange` is the page's own render().
function initShell(onChange) {
  $("lang").onclick = () => {
    state.lang = state.lang === "fa" ? "en" : "fa";
    save("lang", state.lang);
    onChange();
  };
  $("theme").onclick = () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    save("theme", state.theme);
    onChange();
  };
  applyShell(); // show header/footer immediately, before data arrives
}