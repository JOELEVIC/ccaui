# Design System — page-by-page status

The app uses **two coexisting design languages** on the same obsidian canvas:

| Voice | Where | Tone |
|---|---|---|
| **System** (Solo-Leveling HUD) | R2M progression, learning, puzzles | Cyan/Purple neon, chamfered clip-paths, void background, glyph-pulse CTAs |
| **Luxury Academic** | Daily-driver: dashboard, play, profile, identity | Burnished gold on obsidian, floating glass cards, Playfair italics |

`/road-to-master` and `/learning` set `bg="sys.void"` explicitly, so the layout's obsidian wash doesn't bleed in.

---

## ✅ Done — Luxury Academic

| Route | Notes |
|---|---|
| `/dashboard` | Hero R2M card with gold wash + queen watermark, three primary action tiles, local play row, continue-playing list, three-stat ribbon. |
| `/play/bot` | Glass nameplates that gold-ring the side to move, toggle chips, glass move log with jump-to-live, italicised Victory/Defeat/Draw modal. |
| `/play/local` | Glass nameplates, gold ring on side to move + game over, glass match-status panel. |
| `/profile` | Conic gold-rim avatar, R2M tier pill, gold rule, KV stats, glass variant ratings grid, archive link. |
| `/games` | Mode tabs (Vs Human / Vs Engine / Vs Self), glass form for pairing, Elo grid + time-control pills, glass game rows. |
| `AppHeader` | Gold rule before wordmark, tracked uppercase nav with active gold underline, **MemberBadge** (gold-ringed avatar + tier line) in the slot. |

## ✅ Done — System

| Route | Notes |
|---|---|
| `/road-to-master` | Lobby with PlayerHUD + SystemPrompt + CenterPiece, tabbed views, Demo-Level-Up. |
| `/road-to-master/gate` | Dungeon Map with fog of war + mana beam + node burst. |
| `/road-to-master/status` | Hunter Status Window: hex radar, class, mentor, Chess.com sync. |
| `/road-to-master/memory` | Memory Echo (preview/recall/review). |
| `/road-to-master/shadow` | Shadow Extraction + collection. |
| `/road-to-master/guild` | Cameroon regional XP leaderboard. |
| `/road-to-master/pass` | Hunter's Pass checkout stub. |
| `/learning` | Curriculum: Daily Gate hero, Tactical Trials, Opening Archives, Endgame Conservatory. |
| `/learning/puzzle/[id]` | SystemBoardFrame, glass right rail, Trial Cleared overlay. |

---

## ⏳ Still on the old gold-on-navy style

These routes still use the legacy `bg="bgCard"` / `borderColor="goldDark"` blocky idiom and should be brought into the **Luxury** palette next:

| Route | Priority | Why |
|---|---|---|
| `/game/[id]` | **P0** | The actual game-playing screen. Used in every live match. ~600 LOC, complex (chat, clock, board). |
| `/watch` | P1 | Spectator listing. Good candidate for glass row layout. |
| `/community` | P1 | Social / activity feed. |
| `/(public)/rankings` | P1 | Leaderboard — naturally suits the glass-card aesthetic. |
| `/(public)/tournaments` | P1 | Tournament directory. |
| `/dashboard/rankings` | P1 | Authed leaderboard variant. |
| `/dashboard/tournaments` and `[id]` | P1 | Tournament browse + detail. |
| `/players` | P2 | Player directory. |
| `/schools` and `[id]` | P2 | School directory + detail. |
| `/analysis` and `/analysis/import` | P2 | Game review — should keep classic board palette for engine-arrow legibility but get the luxury chrome. |
| `/learn` (note: separate from `/learning`) | P2 | Static-ish learn hub. |
| `/admin` | P3 | Admin panel — internal, low traffic. |
| `/puzzles` (legacy) | P3 | Older puzzle list — superseded by `/learning`. |

### Auth + public

| Route | Priority | Notes |
|---|---|---|
| `/(auth)/login` | P1 | Member-onboarding moment. Needs the same gold rule + Playfair voice. |
| `/(auth)/login/email` | P1 | Same. |
| `/(auth)/register` | P1 | Same. |
| `/` (landing) | P2 | Already has its own DChess landing design (`LandingHero`, `LandingFeatures`, etc.). Audit later for consistency. |

---

## Conventions for the Luxury skin

Whenever you reskin a page, use the same building blocks so we converge on one voice:

1. **Page background** — let the dashboard layout's `var(--lux-obsidian)` show through; never paint a different bg.
2. **Section** — wrap with `LuxuryEyebrow` + `LuxuryHeading` + a `GoldRule` (short) or a flex divider line. No long subtitle paragraphs.
3. **Cards** — always `GlassCard` (1px border, 14px backdrop-blur, deep drop-shadow). Use `hero` for the dominant card on a page.
4. **Buttons** — `LuxuryButton` only (gold / outline / ghost). 8px radius, optional `glyph`. **Never** raw `<Button>` from Chakra.
5. **Copy** — under 8 words for descriptions on cards. Headlines are 1 short serif sentence with one italicised gold accent word.
6. **Watermark** — one `ChessWatermark` per page, opacity 0.035–0.06, positioned in a corner away from primary content.
7. **Text colours** — `var(--lux-text-primary)`, `var(--lux-text-secondary)`, `var(--lux-text-muted)`. Gold reserved for accents, never body.

## Conventions for the System skin

When extending the R2M progression / learning surfaces:

1. **Page background** — `bg="sys.void"`, ambient grid + radial wash backdrop.
2. **Panels** — `SystemPanel` with chamfered clip-path. Always set an `accent` (cyan / purple / epic / threat / gold).
3. **Buttons** — `SystemButton` only. Primary CTAs should pulse (default `emphasis="primary"`).
4. **Board surface** — wrap in `SystemBoardFrame`, use `<GameBoard variant="system" ... />`.
5. **Copy** — eyebrow tags in `[ BRACKETS ]`, Playfair headlines, short body text in `textSecondary`.
