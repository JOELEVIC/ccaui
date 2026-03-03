# Landing Page Images

The **landing page and dashboard** use UBCA academy images imported from `src/assets/images/ubca/`. They are bundled at build time, so no separate commit of `public/` images is needed for deployment.

## UBCA academy images (current design)

Files in `src/assets/images/ubca/` are imported in code:

| File | Used for |
|------|----------|
| `hero-1.png` | Landing hero full-bleed background |
| `hero-2.png` | Landing hero right panel |
| `players-2.png` | Gallery, Cameroon section, dashboard “Where the game is played” strip |
| `board-top.png` | Dashboard layout blended background |
| `hands-board.png` | Landing gallery |

To add or replace an image: update the file in `src/assets/images/ubca/` and re-export from `index.ts`.

---

Legacy: free, commercial-use images for a generic landing. Place downloaded files in `public/images/`.

## Filenames and sources

| Filename | Purpose | Source (Unsplash License) |
|----------|---------|---------------------------|
| `hero.jpg` | Hero full-bleed or focal; chess board or players | [Chess board](https://unsplash.com/photos/white-and-black-chess-pieces-on-gray-concrete-floor-V7TeXTM-rQY) — `https://images.unsplash.com/photo-1611195974228-a849e70f17e9?w=1920&q=80` or search "chess board" |
| `cameroon-chess.jpg` | Cameroon & Chess section; youth/school/federation | [Chess youth](https://unsplash.com/s/photos/chess-youth) or [chess school](https://unsplash.com/s/photos/chess-school) — pick one and download |
| `gallery-1.jpg` | Gallery tile: tournament / play | [Chess game](https://unsplash.com/s/photos/chess-game) |
| `gallery-2.jpg` | Gallery tile: study / strategy | [Chess strategy](https://unsplash.com/s/photos/chess-strategy) |
| `gallery-3.jpg` | Gallery tile: pieces / close-up | [Chess pieces](https://unsplash.com/s/photos/chess-pieces) |
| `gallery-4.jpg` | Gallery tile: moment / trophy | [Chess tournament](https://unsplash.com/s/photos/chess-tournament) |

## Direct download URLs (Unsplash)

Use these in `scripts/fetch-landing-images.js` or download manually:

- Hero: `https://images.unsplash.com/photo-1611195974228-a849e70f17e9?w=1920&q=80` (chess pieces)
- Alternative hero: `https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1920&q=80` (chess board)
- Cameroon/gallery: choose from Unsplash search results; ensure license is Unsplash License (free for commercial use).

## Optional: superstar portraits

If using portrait images for Superstars section: `superstar-1.jpg`, `superstar-2.jpg`, `superstar-3.jpg`. Prefer royalty-free or use the current initial-based design.
