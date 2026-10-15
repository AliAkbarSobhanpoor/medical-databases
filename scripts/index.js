// ---------- Directory page (index.html) ----------
const UI = {
  fa: {
    title: "مرجع پایگاه‌های داده پزشکی",
    ph: "جستجوی پایگاه داده…",
    none: "نتیجه‌ای پیدا نشد.",
    all: "همه",
  },
  en: {
    title: "Medical Database Directory",
    ph: "Search databases…",
    none: "No databases match your search.",
    all: "All",
  },
};

const CATS = {
  literature: {
    fa: "جستجوی مقالات و منابع علمی",
    en: "Literature Search",
  },
  citation: {
    fa: "پایگاه‌های استنادی",
    en: "Citation Databases",
  },
  evidence: {
    fa: "منابع بالینی و پزشکی مبتنی بر شواهد",
    en: "Clinical & Evidence-Based Resources",
  },
  guidelines: {
    fa: "راهنماهای بالینی و سازمان‌های سلامت",
    en: "Clinical Guidelines & Health Agencies",
  },
  decision_support: {
    fa: "منابع بالینی و تصمیم‌یارهای مبتنی بر شواهد",
    en: "Clinical Decision Support Tools",
  },
  consumer: {
    fa: "اطلاعات سلامت معتبر برای عموم",
    en: "Reliable Public Health Information",
  },
  systematic_tools: {
    fa: "نرم‌افزارهای مرور نظام‌مند و ارزیابی شواهد",
    en: "Systematic Review & Evidence Appraisal Software",
  },
  ai_discovery: {
    fa: "جستجوی شواهد و کشف مقاله با هوش مصنوعی",
    en: "AI-Powered Evidence & Paper Discovery",
  },
  iranian: {
    fa: "پایگاه‌های ایرانی",
    en: "Iranian Databases",
  },
  multidisciplinary: {
    fa: "پایگاه‌ها و ناشران چندموضوعی",
    en: "Multidisciplinary Databases & Publishers",
  },
};

let DATA = [];
let activeCat = "all";
const q = $("q");
const grid = $("grid");
const none = $("none");
const cats = $("cats");

// Lowercase + unify Arabic/Persian letter variants
const norm = (s) => s.toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک");

// Tailwind classes kept as constants so the templates stay readable
const CHIP =
  "cursor-pointer rounded-full border px-4 py-[0.3rem] text-[0.9rem] transition-colors";
const CHIP_OFF = "border-white/35 text-white hover:border-gold";
const CHIP_ON = "border-gold bg-gold font-bold text-navy";
const CARD =
  "block rounded-lg border border-s-[5px] border-line border-s-teal bg-card px-[1.4rem] py-[1.3rem] transition-[translate,border-color] duration-200 hover:-translate-y-[3px] hover:border-s-gold motion-reduce:transition-none";
const CARD_TITLE = "mb-[0.3rem] text-start text-[1.25rem] text-teal";
const CARD_DESC = "text-[0.95rem] text-mute";
const GROUP_TITLE =
  "mb-4 border-b border-line pb-2 text-start text-[1.4rem] font-bold text-ink";
const GRID =
  "grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[1.2rem]";

const chip = (key, label) =>
  `<button type="button" data-cat="${key}" aria-pressed="${activeCat === key}"
     class="${CHIP} ${activeCat === key ? CHIP_ON : CHIP_OFF}">${esc(label)}</button>`;

const card = (d, lang) =>
  `<a class="${CARD}" href="database.html?id=${encodeURIComponent(d.id)}">
     <h3 dir="ltr" class="${CARD_TITLE}">${esc(d.name)}</h3>
     <p class="${CARD_DESC}">${esc(d[lang])}</p>
   </a>`;

function render() {
  const { lang } = state;
  applyShell();
  $("title").textContent = UI[lang].title;
  q.placeholder = UI[lang].ph;
  none.textContent = UI[lang].none;

  // Category chips
  cats.innerHTML =
    chip("all", UI[lang].all) +
    Object.keys(CATS)
      .map((k) => chip(k, CATS[k][lang]))
      .join("");

  // Filter by search term (name, both descriptions, labels of all categories)
  const term = norm(q.value.trim());
  const list = DATA.filter((d) =>
    norm(
      [
        d.name,
        d.fa,
        d.en,
        ...(d.categories || []).flatMap((k) => [CATS[k]?.fa, CATS[k]?.en]),
      ].join(" "),
    ).includes(term),
  );

  // Group by category: a database appears under every category it belongs to
  const groups = Object.keys(CATS)
    .filter((k) => activeCat === "all" || k === activeCat)
    .map((k) => ({
      key: k,
      items: list.filter((d) => (d.categories || []).includes(k)),
    }))
    .filter((g) => g.items.length);

  grid.innerHTML = groups
    .map(
      (g) => `<section class="mb-10">
        <h2 class="${GROUP_TITLE}">
          ${esc(CATS[g.key][lang])}
          <span class="text-[0.9rem] font-normal text-mute">(${g.items.length})</span>
        </h2>
        <div class="${GRID}">${g.items.map((d) => card(d, lang)).join("")}</div>
      </section>`,
    )
    .join("");

  none.hidden = DATA.length > 0 && groups.length > 0;
}

q.oninput = render;

cats.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  activeCat = btn.dataset.cat;
  render();
});

initShell(render);

loadData()
  .then((data) => {
    DATA = data;
    render();
  })
  .catch((err) => {
    console.error(err);
    none.textContent = SHELL[state.lang].error;
    none.hidden = false;
  });
