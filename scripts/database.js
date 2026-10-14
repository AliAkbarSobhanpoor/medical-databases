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
  // Find the element that will display the Markdown content.
  const container = $("long-description");

  // Stop if the description container does not exist.
  if (!container) return;

  // Create an identifier for this request.
  const requestId = ++descriptionRequestId;

  // Select the correct Markdown URL for the language.
  const markdownUrl = lang === "fa" ? database.longFaUrl : database.longEnUrl;

  // Display a loading message while fetching the file.
  container.textContent =
    lang === "fa" ? "در حال بارگذاری..." : "Loading description...";

  try {
    // Fetch the Markdown file from the server.
    const response = await fetch(markdownUrl);

    // Throw an error if the server returns an unsuccessful status.
    if (!response.ok) {
      throw new Error(`Failed to load Markdown: HTTP ${response.status}`);
    }

    // Read the Markdown file as plain text.
    const markdown = await response.text();

    // Ignore the response if another request has started.
    if (requestId !== descriptionRequestId) return;

    // Verify that both required libraries are available.
    if (!window.marked || !window.DOMPurify) {
      throw new Error("Marked or DOMPurify is not loaded.");
    }

    // Convert Markdown into HTML and sanitize it before insertion.
    const html = window.DOMPurify.sanitize(window.marked.parse(markdown));

    // Display the sanitized HTML.
    container.innerHTML = html;

    // Set the correct reading direction for the description.
    container.dir = lang === "fa" ? "rtl" : "ltr";
  } catch (error) {
    // Do not display errors from an outdated request.
    if (requestId !== descriptionRequestId) return;

    // Display a localized error message.
    container.textContent =
      lang === "fa"
        ? "بارگذاری توضیحات با خطا مواجه شد."
        : "Could not load the database description.";

    // Log details to help diagnose loading failures.
    console.error("Description loading error:", error);
  }
}

// Render the database detail page.
function render() {
  // Update the shared header, footer, language, and theme.
  applyShell();

  // Stop if the database has not been selected yet.
  if (!current) return;

  // Read the active language and selected database.
  const { lang } = state;
  const d = current;
  const t = UI[lang];

  // Update the browser tab title.
  document.title = d.name + " | " + SHELL[lang].brand;

  // Render the page structure and an empty description container.
  // Persian pages right-align the English title (text-end); English pages left-align it (text-start).
  $("main").innerHTML = `
    <h1 class="big ${lang === "fa" ? "text-end" : "text-start"}">${esc(d.name)}</h1>

    <a class="portal ${lang === "fa" ? "[animation-direction:reverse]" : ""}" href="${esc(d.url)}" target="_blank" rel="noopener">
      <span class="txt">${t.lets}</span>
      <span class="arrows" aria-hidden="true">
        ${lang === "fa" ? "&lt;" : "&gt;"}
      </span>
    </a>

    <p class="lead">${esc(lang === "fa" ? d.fa : d.en)}</p>

    <div
      class="long prose prose-slate max-w-none"
      id="long-description"
      aria-live="polite"
    ></div>

    <a class="back" href="index.html">${t.back}</a>
  `;

  // Load the description without blocking the rest of the page.
  loadDescription(d, lang);
}

// Show or hide the back-to-top button when scrolling.
const totop = $("totop");

addEventListener("scroll", () => {
  totop.classList.toggle("show", scrollY > 300);
});

// Scroll smoothly to the top unless reduced motion is preferred.
totop.onclick = () =>
  scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });

// Initialize the shared website shell.
initShell(render);

// Load the database metadata and render the selected database.
loadData()
  .then((data) => {
    // Select the database from the URL.
    current = pickCurrent(data);

    // Render the page and load its Markdown description.
    render();
  })
  .catch((err) => {
    // Log errors for debugging.
    console.error(err);

    // Display the shared localized error message.
    $("main").textContent = SHELL[state.lang].error;
  });
