# FASTER Diario — project documentation

Single reference for backlog, architecture, code quality, extraction notes, refactor progress, and troubleshooting.

---

## Table of contents

1. [Current status & backlog](#1-current-status--backlog)
2. [Refactor plan & testing](#2-refactor-plan--testing)
3. [Architecture](#3-architecture)
4. [Code analysis (red / green / patterns)](#4-code-analysis-red--green--patterns)
5. [Extraction analysis](#5-extraction-analysis)
6. [Modular refactor progress](#6-modular-refactor-progress)
7. [Troubleshooting (Android & iOS)](#7-troubleshooting-android--ios)

---

## 1. Current status & backlog

**Goal:** do not break existing behaviour. Use for planning and before publishing to the stores.

### Current status

| Area | Status |
|------|--------|
| **Product / UX** | Done: UI (step arrows, Arm button style, “Review My Pillars” / “Revisar mis pilares”). Pilares back/summary/empty-state behaviour. All visible copy and lang IDs in English (EN + ES). |
| **Phase 1 (helpers)** | Done: `getEl`, `getHistorial`, `getLastFilledPillarIndex`; `parseLangXml` parsererror check. Some call sites still to wire (Phase 2). |
| **Phase 1b (TypeScript)** | Done: tsconfig, modular `src/` + ES modules, build, copy-web, types. |
| **Pure domain extract (Step 1)** | Done: `core/domain`, `core/services/record-helpers` (see §6). |
| **Next step** | **Testing** (unit + E2E). Then Phase 2 (use helpers everywhere), Phase 4, Phase 3, Phase 5/6 as needed. |

### Pending tasks (in order)

Do in this order. Verify after each phase.

#### Phase 1b – TypeScript migration ✅ DONE

1. **TS1–TS4** — Tooling, `src/shell/main.ts` entry, `src/features/faster/faster-app.ts`, build, types. ✅

#### Testing – Unit + E2E (next)

5. **T1** – Vitest; pure logic tests; lorem data. `npm run test:unit`.
6. **T2** – Playwright; serve `www/`; scenarios (happy path, validation, history, export, delete, language, Back from Pilares, 💪, step nav). `npm run test:e2e`.
7. **T3** – `npm run test` (unit + e2e); README.

#### Phase 2 – Use helpers (defensive + DRY)

8. **E5** – collectAllData: getEl + null guard for step.
9. **E6** – initCheckboxes: getEl + null guard.
10. **E7** – bindNav: null-check every element before addEventListener.
11. **E8** – Replace all historial reads with getHistorial().
12. **E9** – validatePillarsOrder: use getLastFilledPillarIndex(data) (partially aligned with `record-helpers`).
13. **E10** – renderPillarsOverview: same.

#### Phase 4 – Style & minor fixes

14. **E13** – var → const/let.
15. **E14** – showConfirm: single addEventListener + current action variable.

#### Phase 3 – Smaller methods (DRY)

16. **E11** – createCheckboxRow(...).
17. **E12** – (Optional) buildPillarRecordFragment(...).

#### Phase 5 – Object grouping

18. **E15–E25** – Config, Storage, DomUtils, Lang, Message, Record, Validation, Navigation, Historial, Pilares/Resumen, Checkboxes.

#### Phase 6 – Interfaces & patterns

29. **E26–E28** – Interfaces, decorator, factory.

#### Code quality & other

32–38. B1–B6 (safe getUltimoRegistro, state layer, focus, aria-live, lang error, privacy line, skip link, reduced motion, portrait lock, store descriptions).

#### Operational

39. Run `npm run copy-web` (or `./update.sh`) after changing index, theme, lang, or app.

---

## 2. Refactor plan & testing

**Rule:** Do not start phase N+1 until phase N is done and verified.

### Dependency overview

```
Phase 1 (helpers)     ✅ DONE
Phase 1b (TypeScript) ✅ DONE
Testing               next      T1 unit, T2 E2E, T3 npm run test
Phase 2 (use helpers)            E5–E10
Phase 4 (style)                  E13, E14
Phase 3 (DRY)                    E11, E12
Phase 5 (objects)                E15–E25
Phase 6 (interfaces)             E26–E28
```

### Verification checklist (after each phase)

- [ ] App loads; first step visible.
- [ ] Start → first pillar; Next/Back work.
- [ ] Fill one pillar; Review My Pillars → overview; View Summary.
- [ ] Validation if gap; with valid data, summary and save.
- [ ] History: list, detail, Back, Export, Delete all + confirm.
- [ ] Language switch ES/EN.
- [ ] Options menu: open, close on outside click.
- [ ] Capacitor: back button works.

### How to avoid breaking anything

- One phase at a time; null checks only add safety.
- E11/E12: compare DOM/HTML before and after.

### Testing plan

**Unit (Vitest):** migrateDataKeys, hasAnyData, recordHasAnyData, compactData, getLastFilledPillarIndex, pillar-order validation — use lorem data.

**E2E (Playwright):** 15 scenarios (happy path, validation, overview, history, export, delete, language, start over, 💪, step nav). Run `npm run copy-web` before E2E so `www/` is current.

**Layout (when tests exist):** `tests/unit/`, `tests/e2e/`.

### Done in the repo (reference)

| Item | Notes |
|------|--------|
| Copy script | Copies index, theme, lang, full `dist/` → `www/scripts/` (ES modules). |
| package.json | `build`, `copy-web`, `cap-sync`, `test:unit`. |
| Capacitor | `webDir: "www"`. |
| Android back | Handled when Capacitor + App plugin exist. |
| Export | navigator.share first, then download. |
| Safe areas | Message overlay uses env(safe-area-inset-*). |
| First step without JS | #step-start has class active in HTML. |

### Manual / store

- Native: README commands; icon and splash (see Asset sizes).
- Publish: privacy policy URL; Play Console + App Store Connect; listing, rating, Data Safety/App Privacy, screenshots, signing.

### Store checklist

- [ ] Icon & splash (1024×1024 iOS; 512 or 1024 Android).
- [ ] Privacy policy URL.
- [ ] Play + App Store metadata, screenshots, signing, TestFlight/Submit.

### Asset sizes

| Use | Size (px) |
|-----|-----------|
| iOS App Store icon | 1024 × 1024 |
| Android / Play icon | 512 × 512 (or 1024×1024) |

### Privacy policy (draft)

**Faster Diario** is offline; data stays on device in local storage; no server collection; export is user-initiated. Replace `[Date]` and `[Your contact]` before publishing.

### Technical debt & optional

| Item | Priority |
|------|----------|
| In-app privacy line | Low |
| Focus on step change | Medium |
| Skip link | Low |
| Reduced motion | Low |
| Lang load error | Low |
| Portrait lock | Optional |
| Store descriptions EN + ES | Before publish |

### Project layout

Folders are created only when they contain code.

```
faster-diario/
├── src/                    # shell/main.ts, features/*, core/*, infrastructure/*, data JSON copied to www/data/
├── tests/                  # Vitest when added
├── dist/                   # tsc output → www/scripts/
├── www/                    # Capacitor webDir
├── android/  ios/
├── scripts/                # copy-www.js
├── theme/  lang/
├── docs/
│   └── DOCUMENTATION.md    # this file
├── package.json  tsconfig.json  vitest.config.ts  update.sh
├── index.html  README.md
```

---

## 3. Architecture

**Rule:** Do not create empty folders; add a folder when the first file belongs there.

### Target `src/` structure

```
src/
├── core/
│   ├── assessment/   entities/, services/, validators/
│   ├── formation/    contracts/, engine/
│   └── shared/       types/
├── features/
│   ├── faster/   summary/   history/
│   ├── sword/  podcast/  video/  devotionals/   (future)
└── infrastructure/   storage/  media/  api/
```

### Target `tests/` structure

```
tests/
├── core/  features/  infrastructure/  utils/
```

### Purpose of each area

| Area | Purpose |
|------|---------|
| core/assessment | Entities, services, validators. |
| core/formation | FormationModule, recommendation engine. |
| core/shared | Shared types/utilities. |
| features/faster | Seven pillars, wizard, resumen, registros. |
| features/summary, history | Resumen and historial (may be shared). |
| features/sword…devotionals | Future. |
| infrastructure/* | Storage, media, API clients. |

### Relationship to current code

- **Today:** `src/shell/main.ts` (auth + nav); `src/features/faster/faster-app.ts` (FASTER wizard); `core/domain`, `core/services`; features SWORD / podcasts / bible / AI behind interfaces; compiles to `dist/**`, copied to `www/scripts/`.
- **Migration:** Extract into target folders as refactors land; create folders only with first file.

### Project layout (current)

- `src/shell/main.ts` — login, feature nav, wires FASTER + SWORD + podcasts.
- `src/features/faster/faster-app.ts` — FASTER wizard (i18n, steps, historial).
- **Auth (demo):** `admin` / `admin1`, `user` / `user1` via `HardcodedAuthService`; swap via `createAuthService` when Pure Desire is ready.
- **Data:** `data/sword-devotionals.json`, `data/podcasts-catalog.json` → copied to `www/data/` for `fetch`.
- `dist/` → `www/scripts/` (entire tree for ES module imports).
- `android/`, `ios/` at repo root (Capacitor default). After web changes: `./update.sh` or `npm run cap-sync`.

### iOS and Android

Keep `android/` and `ios/` at project root. They consume `www/` via `cap sync`. Edit native code only for plugins or platform config.

### TO REVIEW: HTML (shell + fragments + router)

*Not implemented yet.*

- One shell `index.html` with shared chrome + `#view-container`.
- Per-feature HTML fragments loaded with `fetch`; hash routes `#/faster`, `#/reports`, …
- One entry + router; per-feature `initView(container)`; optional single bundle then code-split later.

---

## 4. Code analysis (red / green / patterns)

### Red flags (mitigate over time)

1. **collectAllData** — null guard if `getElementById('step-'+id)` missing.
2. **bindNav** — null-check before every `addEventListener`.
3. **JSON.parse(localStorage)** — use try/catch; centralize (getHistorial pattern).
4. **parseLangXml** — parsererror handled ✅.
5. **initCheckboxes** — null guard for step ✅ (partial).
6. **Global state** — consider a small state object.
7. **var** — prefer const/let (Phase 4).
8. **showConfirm** — optional single listener + action ref (Phase 4).

### Green flags (keep)

| XSS via escapeHtml | i18n embedded + fetch | Constants | Validation | No eval |
| Feature detection (Capacitor, share) | CSS variables & safe-area | Offline-first |

### Recommended patterns

Defensive DOM (`getEl` + checks); safe storage reads; single startup path; a11y (focus, aria-live); lang fallback message; formatter/lint; optional state layer.

### Summary

| Red | 8 | Mitigate with null checks, safe JSON, optional state |
| Green | 8 | Keep escaping, i18n, validation approach |
| Patterns | 7 | Defensive DOM, safe storage, a11y, style |

---

## 5. Extraction analysis

**Conceptual modules** (can become namespaces/objects without behaviour change): Config, Storage, Lang, DomUtils, Message, Record helpers, Validation, Navigation, Historial, Pilares/Resumen views, Checkboxes.

**DRY wins:** getLastFilledPillarIndex ✅ (in core); buildPillarRecordFragment; createCheckboxRow; getHistorial everywhere.

**Performance:** Listeners bound once; optional lazy load of non-critical code later.

**Summary table:** Config/Storage/Lang/DOM/Message/Record/Validation/Navigation/Historial objects — all “no behaviour change” if logic is moved as-is.

---

## 6. Modular refactor progress

**Goal:** Move toward `core/`, `features/`, `infrastructure/` without breaking behaviour. **One concern per step.**

### Step 1 — DONE (pure domain + ES modules)

- `src/core/domain/types.ts`, `pillar-constants.ts`
- `src/core/services/record-helpers.ts` — pure pillar/record logic
- `faster-app.ts` imports helpers; `validatePillarsOrder` uses `computePillarOrderIssues` + `getString`
- Build: `tsc` → `dist/**`; `index.html` uses `<script type="module" src="scripts/shell/main.js">`; `copy-www` copies full `dist/` + `data/` → `www/`

**Verify:** `npm run copy-web`, then full manual flow.

### Next steps (planned)

| Step | Topic |
|------|--------|
| 2 | Interfaces: StorageService, I18nService, router |
| 3 | LocalStorageService, XML i18n adapter |
| 4 | DOM/UI split |
| 5 | Feature modules (assessment, history, summary) |
| 6 | Hash router + controllers |
| 7 | Lightweight DI |
| 8 | Factory, adapter, optional observer |
| 9 | No circular deps; minimal globals |

---

## 7. Troubleshooting (Android & iOS)

### Black / blank screen (both platforms)

Usually **stale or missing web assets** in the native bundle. Always:

```bash
./update.sh
```

Then **clean rebuild**: Android Studio → Build → Clean + Rebuild; Xcode → Product → Clean Build Folder (⇧⌘K) → Run.

Confirm after sync:

- **Android:** `android/app/src/main/assets/public/` has `index.html`, `scripts/` (with `shell/main.js` and `core/`, etc.), `data/`, `theme/`, `lang/`.
- **iOS:** `ios/App/App/public/` same structure.

**Rule:** Do not run only `npx cap sync` without a prior `npm run copy-web` / `./update.sh` — `www/scripts/` must contain the full `dist/` output (ES modules).

### Android-specific

- **Logcat:** filter `Capacitor`, `chromium`, `WebView`.
- **chrome://inspect** → Remote Target → inspect WebView → Console / Network.
- **Manifest:** `usesCleartextTraffic`, `INTERNET` (already set in project).

### iOS-specific

- **Destination:** must be an **iPhone/iPad simulator**, not “Any iOS Device”, or Simulator won’t show.
- **Simulator window** is a separate app — Dock or ⌘Tab to **Simulator**.
- **Safari → Develop → [Simulator] → [app]** → Web Inspector for Console errors.
- **CLI:** `npx cap run ios` to launch simulator + app.

### Quick checklist

| Step | Action |
|------|--------|
| 1 | `./update.sh` from project root |
| 2 | Clean + rebuild in Android Studio or Xcode |
| 3 | Logcat (Android) or Safari Web Inspector (iOS) if still blank |
| 4 | `chrome://inspect` (Android WebView) |

---

*End of consolidated documentation.*
