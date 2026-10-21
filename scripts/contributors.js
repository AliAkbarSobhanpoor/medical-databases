// ---------- Contributors page ----------
// Relies on common.js: $, esc, state, applyShell, initShell, SHELL
const CONTRIBUTORS_URL = "data/contributors.json";

const TEXT = {
  fa: {
    title: "مشارکت‌کنندگان",
    intro: "کسانی که در ساخت و تکمیل این مرجع نقش داشته‌اند.",
    home: "صفحه اصلی",
    empty: "هنوز مشارکت‌کننده‌ای ثبت نشده است.",
  },
  en: {
    title: "Contributors",
    intro: "The people who helped build and improve this directory.",
    home: "Home",
    empty: "No contributors have been added yet.",
  },
};

let contributors = [];

// Pick the current language's entry, falling back to the other one
// so a half-filled contributor still shows up.
function pick(person) {
  const other = state.lang === "fa" ? "en" : "fa";
  const cur = person[state.lang] || {};
  const alt = person[other] || {};
  return {
    name: cur.name || alt.name || "",
    degree: cur.degree || alt.degree || "",
    email: cur.email || alt.email || "",
  };
}

// First letters of the first and last word, used as the avatar
const initials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = [...parts[0]][0];
  const last = parts.length > 1 ? [...parts[parts.length - 1]][0] : "";
  return (first + last).toUpperCase();
};

function card(person) {
  const c = pick(person);

  const email = c.email
    ? `<a href="mailto:${esc(c.email)}" dir="ltr" class="inline-flex items-center gap-2 break-all text-[0.9rem] text-mute hover:text-gold">
         <i class="fa-regular fa-envelope" aria-hidden="true"></i>${esc(c.email)}
       </a>`
    : "";

  return `
    <article class="flex items-start gap-3 rounded-[0.6rem] border border-line p-4">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy font-bold text-gold"
        aria-hidden="true"
      >${esc(initials(c.name))}</div>
      <div class="min-w-0">
        <h2 class="text-[1.05rem] leading-[1.4] font-bold">${esc(c.name)}</h2>
        ${c.degree ? `<p class="mb-1 text-[0.9rem] text-mute">${esc(c.degree)}</p>` : ""}
        ${email}
      </div>
    </article>`;
}

function render() {
  applyShell(); // header, footer, language, theme (from common.js)

  const t = TEXT[state.lang];
  document.title = `${t.title} | ${SHELL[state.lang].brand}`;
  $("title").textContent = t.title;
  $("intro").textContent = t.intro;
  $("home").title = t.home;
  $("home").setAttribute("aria-label", t.home);

  $("grid").innerHTML = contributors.map(card).join("");
  $("none").hidden = contributors.length > 0;
  $("none").textContent = t.empty;
}

async function init() {
  initShell(render); // wires the language/theme buttons and paints the shell
  try {
    const res = await fetch(CONTRIBUTORS_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    contributors = await res.json();
    render();
  } catch (e) {
    $("none").hidden = false;
    $("none").textContent = SHELL[state.lang].error;
  }
}

init();