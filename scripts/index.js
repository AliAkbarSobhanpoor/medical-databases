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

  grid.innerHTML = list
    .map(
      (d) =>
        `<a class="card" href="database.html?id=${encodeURIComponent(d.id)}"><h2>${esc(d.name)}</h2><p>${esc(d[lang])}</p></a>`,
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