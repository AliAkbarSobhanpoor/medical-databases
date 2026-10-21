// ---------- Detail page (database.html) ----------

// Define the labels used on the detail page for each language.
const UI = {
  fa: { lets: "رفتن به پایگاه", back: "بازگشت به فهرست" },
  en: { lets: "Go to database", back: "Back to directory" },
};

// Store the currently selected database.
let current = null;

// Track requests so an older response cannot overwrite newer content.
let descriptionRequestId = 0;

// Select the database using the URL's id parameter.
function pickCurrent(data) {
  const id = new URLSearchParams(location.search).get("id");
  return data.find((x) => x.id === id) || data[0];
}

// Load and render the selected database's Markdown description.
async function loadDescription(database, lang) {
  const container = $("long-description");
  if (!container) return;

  const requestId = ++descriptionRequestId;
  const markdownUrl = lang === "fa" ? database.longFaUrl : database.longEnUrl;

  container.textContent =
    lang === "fa" ? "در حال بارگذاری..." : "Loading description...";

  try {
    const response = await fetch(markdownUrl);

    if (!response.ok) {
      throw new Error(`Failed to load Markdown: HTTP ${response.status}`);
    }

    const markdown = await response.text();

    // Ignore the response if another request has started.
    if (requestId !== descriptionRequestId) return;

    if (!window.marked || !window.DOMPurify) {
      throw new Error("Marked or DOMPurify is not loaded.");
    }

    const html = window.DOMPurify.sanitize(window.marked.parse(markdown));
    container.innerHTML = html;
    container.dir = lang === "fa" ? "rtl" : "ltr";
  } catch (error) {
    if (requestId !== descriptionRequestId) return;

    container.textContent =
      lang === "fa"
        ? "بارگذاری توضیحات با خطا مواجه شد."
        : "Could not load the database description.";

    console.error("Description loading error:", error);
  }
}

// Extract and validate the Aparat embed URL from a pasted embed snippet.
function aparatSrc(html) {
  const m = String(html).match(/src=["']([^"']+)["']/);
  const src = m && m[1];
  return src && /^https:\/\/www\.aparat\.com\/embed\/\w+\?/.test(src)
    ? src
    : null;
}

// Render videos. Scripts added via innerHTML never run, so create them manually.
function renderVideos(database) {
  const box = $("videos");
  if (!box) return;
  box.innerHTML = "";

  (database.videos || []).forEach((html, i) => {
    const src = aparatSrc(html);
    if (!src) return;

    const id = `aparat-${database.id}-${i}`; // unique per video
    const wrap = document.createElement("div");
    wrap.id = id;
    wrap.className = "w-full";
    box.appendChild(wrap);

    const script = document.createElement("script");
    script.src = src.replace(/(data\[rnddiv\]=)[^&]+/, `$1${id}`);
    wrap.appendChild(script);
  });
}

// Render the database detail page.
function render() {
  applyShell();
  if (!current) return;

  const { lang } = state;
  const d = current;
  const t = UI[lang];

  document.title = d.name + " | " + SHELL[lang].brand;

  $("main").innerHTML = `
    <div class="title-row">
      <h1 class="big ${lang === "fa" ? "text-end" : "text-start"}">${esc(d.name)}</h1>
      <a class="portal sm ${lang === "fa" ? "[animation-direction:reverse]" : ""}" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">
        <span class="txt">${t.lets}</span>
      </a>
    </div>
    <hr class="my-6 h-0.5 w-full border-0 bg-gradient-to-r from-gold via-line to-transparent rtl:bg-gradient-to-l" />
    <p class="lead">${esc(lang === "fa" ? d.fa : d.en)}</p>

    ${(d.videos || []).some((html) => aparatSrc(html)) 
      ? '<div id="videos" class="mt-10 flex w-full flex-col gap-8"></div>' 
    : ""}

    <div
      id="long-description"
      aria-live="polite"
      class="long prose mt-10 max-w-none leading-[1.9] text-ink
      prose-headings:font-bold prose-headings:text-ink
      prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-[1.35rem]
      prose-h3:mt-8 prose-h3:text-[1.1rem]
      prose-p:text-ink
      prose-strong:text-ink
      prose-a:text-ink prose-a:underline prose-a:decoration-gold prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:text-gold
      prose-li:text-ink prose-li:marker:text-gold
      prose-blockquote:border-gold prose-blockquote:text-mute prose-blockquote:not-italic
      prose-hr:border-line"
    ></div>


    <a class="back" href="index.html">${t.back}</a>
  `;

  loadDescription(d, lang);
  renderVideos(d);
}
// Show or hide the back-to-top button when scrolling.
const totop = $("totop");

addEventListener("scroll", () => {
  totop.classList.toggle("show", scrollY > 300);
});

totop.onclick = () =>
  scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });

initShell(render);

loadData()
  .then((data) => {
    current = pickCurrent(data);
    render();
  })
  .catch((err) => {
    console.error(err);
    $("main").textContent = SHELL[state.lang].error;
  });
