// ---------- Directory page (index.html) ----------
const UI = {
  fa: {
    title: "مرجع پایگاه‌های داده پزشکی",
    ph: "جستجوی پایگاه داده…",
    none: "نتیجه‌ای پیدا نشد.",
  },
  en: {
    title: "Medical Database Directory",
    ph: "Search databases…",
    none: "No databases match your search.",
  },
};

let DATA = [];
const q = $("q");
const grid = $("grid");
const none = $("none");

// Lowercase + unify Arabic/Persian letter variants
const norm = (s) => s.toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک");

function render() {
  const { lang } = state;
  applyShell();
  $("title").textContent = UI[lang].title;
  q.placeholder = UI[lang].ph;
  none.textContent = UI[lang].none;

  const term = norm(q.value.trim());
  const list = DATA.filter((d) =>
    norm(d.name + " " + d.fa + " " + d.en).includes(term),
  );

  // Tailwind classes kept as constants so the template stays readable
  const CARD =
    "block rounded-lg border border-s-[5px] border-line border-s-teal bg-card px-[1.4rem] py-[1.3rem] transition-[translate,border-color] duration-200 hover:-translate-y-[3px] hover:border-s-gold motion-reduce:transition-none";
  const CARD_TITLE = "mb-[0.3rem] text-start text-[1.25rem] text-teal";
  const CARD_DESC = "text-[0.95rem] text-mute";

  // ...inside render():
  grid.innerHTML = list
    .map(
      (d) =>
        `<a class="${CARD}" href="database.html?id=${encodeURIComponent(d.id)}">
         <h2 dir="ltr" class="${CARD_TITLE}">${esc(d.name)}</h2>
         <p class="${CARD_DESC}">${esc(d[lang])}</p>
       </a>`,
    )
    .join("");
  none.hidden = DATA.length > 0 && list.length > 0;
}

q.oninput = render;
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
