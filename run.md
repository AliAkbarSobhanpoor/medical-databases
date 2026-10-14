# Medical Database Directory

A bilingual (Persian and English) medical database directory built with HTML, JavaScript, and Tailwind CSS. Database descriptions are written in Markdown and rendered dynamically in the browser.

## Features

- Persian and English language support
- Light and dark themes
- Responsive layout
- Markdown-based database descriptions
- Tailwind CSS styling
- Secure Markdown rendering using Marked and DOMPurify
- Static hosting with GitHub Pages

## Requirements

- [Node.js and npm](https://nodejs.org/)
- Python 3
- A web browser

## Development

### 1. Install dependencies

Install the project's npm dependencies, including Tailwind CSS and the Typography plugin, if they are not already installed.

```bash
npm install
```

### 2. Start Tailwind CSS in watch mode

Run the following command to rebuild the CSS whenever you modify the source stylesheet:

```bash
npx @tailwindcss/cli -i ./styles/input.css -o ./styles/index.css --watch
```

Keep this terminal running during development.

### 3. Start the local HTTP server

Open a second terminal in the project root and run:

```bash
python -m http.server 8000
```

Open the website in your browser:

http://localhost:8000

Keep both terminals running while developing.

> Do not open `index.html` directly using a `file://` URL. Use the local HTTP server so JavaScript can fetch the JSON and Markdown files correctly.

## Production Build

Before deploying, generate the optimized CSS file:

```bash
npx @tailwindcss/cli -i ./styles/input.css -o ./styles/index.css --minify
```

This command creates a minified stylesheet at `styles/index.css`, which is referenced by the HTML pages.

Commit the generated stylesheet to the repository because GitHub Pages does not compile Tailwind CSS for you.