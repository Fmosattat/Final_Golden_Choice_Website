# Golden Choice Website (v4)

This folder is a **static website** that renders the Golden Choice profile in the same page order as the original PDF.

## Structure
- `index.html` / `styles.css` / `script.js` — the site
- `data/content.json` — **source of truth** for page order + selectable text
- `assets/pages/page-XX.webp` — page images in order

## Run locally
Use a simple web server (recommended):

```bash
python -m http.server 8080
```

Then open:
- http://localhost:8080

## Deploy
### GitHub Pages
- Repo **Settings → Pages**
- Source: `main` branch, `/(root)`

### Vercel / Netlify
Deploy as a static site (no build command required).

## Editing text
Edit `data/content.json` and refresh.

