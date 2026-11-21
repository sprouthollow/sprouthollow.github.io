# Sprout Hollow: architecture assessment and evolution plan

_Audit date: 2026-11-21. Baseline is commit e0c977e, the build that was live before this work started._

## 1. Existing architecture

| Area | Before | Notes |
|---|---|---|
| Hosting | GitHub Pages, `sprouthollow/sprouthollow.github.io`, served from `main` at the root | Static files only, with no build step. |
| Code | One `index.html` (366 lines) with inline CSS and one inline script | The script is wrapped in `{ }`, so nothing is exposed globally. |
| State | One object `S`, saved under the localStorage key `sprout-hollow-v2` on every tick and action | Missing fields are filled in with `Object.assign(defaults, saved)`. There is no version number. |
| Rendering | `render()` rebuilds the board, tools and side panel as HTML strings every second | Simple and robust. Every interaction rebuilds the DOM. |
| Input | One delegated `click` listener using `data-*` attributes | Works for mouse and touch. |
| Art | Inline SVG strings (crops, map icons, mascots, scene) | No image downloads apart from the icons. |
| Audio | Procedural Web Audio: a waltz loop plus sound effects. Off/on settings are saved under `sh-audio` | Starts on the first tap. |
| Offline/PWA | `manifest.webmanifest`, plus a cache-first `sw.js` versioned by the cache name | The cache name has to be bumped on every release, or players keep the old build. |
| External | Google Fonts; the qrcodejs library from cdnjs | Both have fallbacks (system fonts, a plain text link). |

**Risks found**
- Saves have no version number, so future schema changes need a migration step. This work adds `S.v` and the `S.x` extension namespace.
- The cache-first service worker serves stale builds until the cache name changes. This work keeps the versioned cache, adds `js/` and `css/` to it, and adds network-first loading for HTML.
- All the logic lives in one closure, so new systems can't get at the state. This work moves the script to `js/core.js` and exposes a small `window.SH` API.

## 2. Gameplay feature inventory (preserved)
- **Farm:** 16 plots; 5 crops plus 2 rare seeds; growth stages; watering doubles growth speed; golden crops (8%, or 25% on rainbow days); harvest combos; a basket and selling.
- **Village orders:** 3 orders per day from named villagers.
- **Levels:** gained from XP; higher levels unlock seeds.
- **Weather:** sunny, rain (waters crops for you), rainbow, breezy (faster growth).
- **Whisperwood:** a 5×5 fog map with energy; coins, gems, rare seeds, chests, Fuzzle friends, and the Grumpy Mole tap fight. The map changes every 5 days.
- **Quests:** 7 one-off quests, a gem shop and a sprinkler.
- **Share & install:** a QR code, Copy link, a PWA install and offline play.
- **Audio:** the music loop, 11 sound effects, and the on/off toggles.

## 3. Visual and UX recommendations
1. Re-skin the interface as an **illustrated adventure journal**: parchment panels, stitched borders, washi-tape tab labels and handwritten notes, using a cream, sage, peach, lavender, sky and muted-pink palette.
2. Add a **player character** (the farmer) in the countryside scene and on the Whisperwood map.
3. Give each **season** its own tint and drifting particles (petals, fireflies, leaves, snow).
4. Give **NPCs and companions** portraits and speech bubbles, so the world feels inhabited.
5. Add a gentle, skippable **tutorial**, plus a single "Today" card that lists the things to do.
6. Keep tap targets at 44px or larger, add reduced-motion support, and make the tabs stack on phones.

## 4. Prioritized development plan
| Phase | Scope | Status |
|---|---|---|
| 0 | Split into `css/`, `js/core.js`, `js/features.js`; add the `SH` API and hooks; versioned saves with migration; export and import of saves | This release |
| 1 | Journal visual identity, the farmer, seasons with effects, the tutorial, the daily discovery reward | This release |
| 2 | Village NPCs (personalities, dialogue, hearts, gifts), companions with affection, crafting and materials, secret locations, multi-stage questlines, daily quests | This release |
| 3 | Customizable cottage, discovery journal, achievements, collection rewards | This release |
| 4 | Marketplace UI and entitlement client (no real payments) | This release (stub) |
| 5 | Backend entitlements, payment provider, cloud saves | Waiting on the payment provider and backend choice |
| 6 | Fishing, night cycle, festival mini-games, more Whisperwood biomes | Backlog |

## 5. Files modified
- `index.html`: markup only. Styles and scripts are moved out; the new tabs and containers are added.
- `css/style.css` (new): the existing styles plus the journal theme.
- `js/core.js` (new): the original game script, moved here with only small hook calls added.
- `js/features.js` (new): all the new systems, built on `window.SH`.
- `js/entitlements.js` (new): a read-only entitlement client for future purchases.
- `sw.js`: new cache version, new files added, network-first loading for HTML.
- `docs/MONETIZATION.md` (new): the purchase and entitlement architecture.
