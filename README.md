# Abhinav Prasad — Portfolio

A responsive, static portfolio with scroll-driven project previews. No installation or build step is required.

## Files

- `index.html` — page content and layout.
- `styles.css` — design, responsive layouts, and animation styles.
- `script.js` — navigation, contact controls, and scroll interactions.
- `projects.js` — project names, categories, and destination links.
- `assets/` — portrait cutout and Perzo thumbnail.

## Update projects

Edit the matching entry in `projects.js` to change a project's title, category, or URL. Use a complete `https://` or `http://` URL. Leave the URL empty for a project that is not ready.

Update descriptions and thumbnails in the corresponding `data-project` article in `index.html`. New project cards need a unique `data-project` value and a matching entry in `projects.js`. Keep `.project-art`, `.project-info`, and `.project-note` in each card; `.project-description` is optional.

Perzo also has an ordinary link in the HTML so it remains accessible without JavaScript. Update that link too when changing its destination.

## Preview and publish

Open `index.html` in a browser, or serve this folder with a static web server. Deploy the repository root on any static host; no build command is needed.

The site uses Google Fonts with system-font fallbacks. Scroll motion follows the visitor's reduced-motion preference.
