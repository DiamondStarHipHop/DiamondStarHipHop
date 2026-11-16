# Diamond Star Hip Hop

The media network behind **MoPlicity** — radio, news, and the podcast for the
series, inspired by Diamond. Home: [fortworthpac.com](https://fortworthpac.com).

This repository holds the Fort Worth Pac website (the Diamond Star Hip Hop
pages) as a plain static site: HTML, CSS, and JavaScript with the media files
kept as separate files instead of embedded in the page.

## Layout

| File / folder | What it is |
|---|---|
| `index.html` | The site page. Links the stylesheet and scripts below and references every image, video, and document in `assets/` with a relative path. |
| `styles.css` | All of the page CSS (was the single inline `<style>` block). |
| `head.js` | The one script that must run before first paint — direct-link landing handling (was the first inline `<script>` in `<head>`). Loaded from `<head>`. |
| `app.js` | The rest of the page JavaScript — playlist player, merch nav, shopping cart, Pick a Number game, and more — in original document order (were inline `<script>` blocks #2–#10). Loaded at the end of `<body>`. |
| `assets/` | Every image, video, icon, and document the page uses (see below). |
| `assets/manifest.json` | The web-app manifest (was embedded as a `data:` URI on the `<link rel="manifest">` tag). |
| `assets/moplicity-merch.html` | The standalone MoPlicity Merch page (was embedded as a `data:` URI on the merch link). |

One inline `<script type="application/ld+json">` block (Schema.org structured
data about Fort Worth Pac) is intentionally left inline in `index.html` —
JSON-LD is data, not JavaScript, so it does not belong in `app.js`.

## Media files

The `assets/` folder is large (about 290 MB) because the site is media-heavy:
211 WebP images, 16 JPEGs, 4 PNGs, and 9 MP4 videos, plus the manifest and the
MoPlicity Merch page. Images that appear more than once on the page are stored
once and referenced from every place they appear (142 unique files for 251
uses). The page references them all with relative paths (`assets/img-001.webp`,
`assets/video-001.mp4`, …), so the whole folder must be served together with
`index.html` — open it from a local web server or any static host, not by
copying `index.html` on its own.

The three favicon/icon files keep the names the manifest expects:
`assets/icon-192.png`, `assets/icon-512.png`, and
`assets/apple-touch-icon.png`, so the manifest's icon entries resolve. (The
manifest also lists two maskable icons that were never present in the original
page, so those two entries still point at files that do not exist — that
predates this split.)

## Viewing locally

```sh
# from this folder, serve it and open http://localhost:8000/
python3 -m http.server 8000
```

## Notes

- The site's live home is [fortworthpac.com](https://fortworthpac.com). This
  repo is the code and media behind it, kept so the site stays saved and can
  be updated piece by piece.
- Nothing here is minified or re-encoded: the media files are byte-identical
  to what was embedded in the original single-file export, and the HTML, CSS,
  and JavaScript are unchanged apart from the split itself.
