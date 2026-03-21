# Target architecture: FASTER Diario (and future modules)

This document describes the **target source layout** as the app evolves. The current behaviour (wizard, pillars, summary, history, export, i18n) will live under **features/faster**; additional content types (Sword, Podcast, Video, Devotionals) are planned as separate features.

**Rule:** We do **not** create folders until they contain code. Add a folder only when you add the first file that belongs there.

---

## Target structure: `src/`

```
src/
│
├── core/
│   ├── assessment/
│   │   ├── entities/
│   │   ├── services/
│   │   └── validators/
│   │
│   ├── formation/
│   │   ├── contracts/
│   │   │   └── FormationModule.ts
│   │   └── engine/
│   │       └── RecommendationEngine.ts
│   │
│   └── shared/
│       └── types/
│
├── features/
│   ├── faster/          # Current app: pillars wizard, summary, historial, export
│   ├── summary/         # Summary / resumen (shared or feature-specific)
│   ├── history/         # Historial list, detail, export
│   │
│   ├── sword/           # (future)
│   ├── podcast/         # (future)
│   ├── video/           # (future)
│   └── devotionals/     # (future)
│
├── infrastructure/
│   ├── storage/
│   ├── media/
│   └── api/
```

## Target structure: `tests/`

Tests mirror `src/` so that each area has a corresponding test folder. Create a folder only when you add tests for that area.

```
tests/
├── core/           # core/assessment, core/formation, core/shared
├── features/       # features/faster, features/summary, features/history, etc.
├── infrastructure/ # storage, media, api
└── utils/          # shared test helpers, mocks, fixtures
```

---

## Purpose of each area

| Area | Purpose |
|------|---------|
| **core/assessment** | Assessment logic: entities, services, validators. Reusable across assessment types (e.g. FASTER scale and future ones). |
| **core/formation** | Formation content and recommendations: contracts (e.g. `FormationModule`), recommendation engine. Shared by features that show “consejos” or recommendations. |
| **core/shared** | Shared types and utilities used across core and features. |
| **features/faster** | Current FASTER Diario behaviour: seven pillars, step flow, checkboxes, “Comportamiento más poderoso”, reflection questions, resumen, guardar registro. |
| **features/summary** | Summary / resumen view and logic (may be shared by faster and other features). |
| **features/history** | Historial: list, detail, export HTML, delete. Shared by features that persist registros. |
| **features/sword** | *(Future)* Sword content/feature. |
| **features/podcast** | *(Future)* Podcast content/feature. |
| **features/video** | *(Future)* Video content/feature. |
| **features/devotionals** | *(Future)* Devotionals content/feature. |
| **infrastructure/storage** | Persistence (e.g. localStorage, later optional sync). |
| **infrastructure/media** | Media handling (e.g. playback, downloads). |
| **infrastructure/api** | Remote API clients (when needed). |

---

## Relationship to current codebase

- **Today:** A single entry `src/app.ts` (compiled to `dist/app.js`, copied to `www/scripts/`) contains all behaviour that will eventually map to:
  - **core:** validation, data shapes, recommendation/consejo logic.
  - **features/faster:** step navigation, pillars UI, checkboxes, form collection.
  - **features/summary:** resumen screen.
  - **features/history:** historial list/detail, export, delete.
  - **infrastructure/storage:** localStorage reads/writes.

- **Migration path:** As we refactor (Phase 2–6 in **docs/BACKLOG.md**), we extract code into the target folders above. We **create each folder only when we add the first file** in that folder. New features (sword, podcast, video, devotionals) get new folders under `features/` when we add code for them.

---

## Project layout (current)

Only folders that exist today are listed. No empty placeholder folders.

```
faster-diario/
├── src/
│   └── app.ts             # Single entry; move pieces into core/, features/, infrastructure/ as we refactor
├── tests/                 # Vitest; add tests/core, tests/features, etc. when adding tests
├── dist/                  # Build output (tsc: src → dist/app.js), not committed
├── www/                   # Capacitor web root (index, theme, lang, scripts/app.js)
├── android/               # Capacitor Android native project
├── ios/                   # Capacitor iOS native project
├── scripts/               # copy-www.js; app.backup.js
├── theme/
├── lang/
├── docs/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── update.sh
└── index.html
```

---

## iOS and Android: where they live and how to keep them sorted

**Recommendation: keep `android/` and `ios/` at the project root.**

- **Why:** Capacitor creates them there by default. Moving them (e.g. into `platforms/android` and `platforms/ios`) is possible via `capacitor.config.json` and custom paths but is non-standard, can break tooling and docs, and complicates `npx cap sync` and IDE project opening.
- **Logical role:** Treat them as **native build outputs** that consume the same web app: you edit `src/`, `theme/`, `lang/`, `index.html`; `update.sh` (or `npm run copy-web && npx cap sync`) builds and copies into `www/`, then syncs `www/` into both native projects. You don’t edit Android/iOS code unless you add native plugins or platform-specific config.
- **Workflow:** After any change to the web app, run `./update.sh` (or `npm run cap-sync`). To run on device or emulator: `npx cap open android` or `npx cap open ios`. That keeps both platforms in sync without moving folders.

---

## TO REVIEW: HTML and view structure (shell + fragments + router)

*To be defined and agreed later. This section records the proposed approach for splitting the UI into manageable, feature-scoped pieces.*

### Proposed approach: one shell + view fragments + one router

- **One shell (`index.html`)**  
  Single HTML with shared chrome only: header, nav, language selector. One content container (e.g. `<main id="view-container"></main>`) that stays empty until a view is loaded. No feature markup in the shell.

- **One HTML fragment per feature/screen**  
  Fragments (no `<html>`, no repeated header/footer). One file per screen, e.g. `views/landing.html`, `views/faster.html`, `views/reports.html`, `views/profile.html`, and later `views/sword.html`, `views/podcast.html`, etc. Loaded at runtime via `fetch` and injected into the container.

- **One entry script + router**  
  Single entry (e.g. shell/app) that: (1) reads the current route from the URL (hash-based: `#/`, `#/faster`, `#/reports`, etc.); (2) fetches the right fragment and injects it into the container; (3) calls the init for that view’s TS. Handles link clicks and back/forward (e.g. `history.pushState` + hash).

- **One TS view per feature**  
  Each feature has a view module (e.g. `src/features/faster/view.ts`) exporting e.g. `initView(container)`. That function binds only to the DOM inside the container and uses shared `core/` and `infrastructure/` modules. No duplicated shell logic.

- **Build**  
  Start with one bundle (shell + router + all view inits). Optionally add code-splitting later so each view’s script loads when first visited.

- **URLs**  
  Hash routing (`#/faster`, `#/reports`, …) so back button and deep links work with static hosting and Capacitor.

### Outcomes (if adopted)

- No duplicated shell; one place for header/nav/lang.
- One HTML fragment per feature; clear ownership (e.g. `views/faster.html` + `src/features/faster/`).
- App-like behaviour without full reloads; state can live in memory or a small shared store.
- Single bundle to start; optional code-split later.

*Decision and details (exact routes, fragment location, naming) to be confirmed in a later review.*

---

## References

- **docs/BACKLOG.md** – Refactor phases (Phase 1b TS, Phase 2–6), testing, and task order.
- **docs/EXTRACTION-ANALYSIS.md** – Extractable modules and methods (Config, Storage, Lang, etc.) that align with this structure.
