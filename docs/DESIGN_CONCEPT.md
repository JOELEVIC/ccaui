# CCA Design Concept: Softer, Cameroon-Personalised, Welcoming

## Vision and mood

- **Keep:** Institutional authority, gold accent system, clear hierarchy, "National Platform" positioning.
- **Shift:** Slightly warmer and softer (not cold charcoal-only); more relatable and human (real faces, places, chess culture); visually rooted in Cameroon (landscapes, subtle flag tones, local chess) while still premium.
- **Mood:** Welcoming chamber rather than austere hall—confident but approachable, national pride without stiffness.

## Colour and radius/shadow decisions

- **Backgrounds:** Warmer darks (`#111318` primary, `#1A1E26` surface); optional subtle gradient (top slightly cooler, bottom warmer) on hero.
- **Gold:** Three shades retained; primary nudged warmer (`#C9A96E`) for softer feel.
- **Cameroon:** Flag colours (green, red, yellow) used very sparingly—e.g. thin accent line under "Cameroon" in hero, or tiny stripe in footer crest. No large blocks.
- **Radius:** Soft corners: `radius.soft` = 10px for cards and primary buttons; original `cca` = 6px where needed.
- **Shadows:** Soft, diffuse card shadow (`0 4px 24px rgba(0,0,0,0.2)`); slightly stronger on hover.
- **Motion:** 200ms transitions; subtle scale or opacity on card hover (e.g. scale 1.01 or opacity 0.97 → 1).

## Image and video map

| Location | Purpose | Content |
|----------|--------|--------|
| Hero | Set mood | Chess + Cameroon (board in setting, or landscape/skyline with overlay) |
| National rankings preview | Relatable | Optional texture or hero image (generic players) |
| Play & compete | Context | Tournament hall or university (photo) |
| The Academy | Trust | Three subtle images or icons per pillar |
| Footer | Identity | Crest or flag motif (simplified, gold + green/red) |
| Cameroon & chess (optional) | Story | 1–2 images: chess in Cameroon, youth, federation |
| Video (optional) | Hero/About | Short loop, muted, low opacity; abstract or B-roll |

## Sourcing and legal guidelines

- **Use only:** Royalty-free / CC0 / CC-BY (Unsplash, Pexels, Pixabay), or CCA-owned/licensed assets.
- **Do not:** Embed unlicensed images; use identifiable people without permission.
- **Superstars section:** Official FIDE/player sites, Wikipedia (check licence), or purchased/credited stock. Prefer placeholders with doc: "Replace with licensed images and approved quotes."
- See [ASSETS.md](../ASSETS.md) for file map and replacement checklist.

## Optional sections

- **"Cameroon & chess":** 2–3 sentences on chess in Cameroon, youth, academy’s role; one supporting image.
- **"Inspired by greatness" / "Global standards":** 3–4 cards with portrait, name, short quote or "World Champion" line. Placeholder frames until licensed content is added.

## Checklist for replacing placeholders

- [ ] Hero image
- [ ] Play & compete image
- [ ] Academy pillar images (if used)
- [ ] Cameroon & chess image
- [ ] Footer crest/logo
- [ ] Superstars: licensed portraits and approved quotes
- [ ] Hero video (optional)
