# Backlog, refactor plan & testing

Single reference for what’s done, what’s left, refactor steps, testing plan, store requirements, and optional work. **Goal:** do not break existing behaviour. Use for planning and before publishing to the stores.

---

## Current status (where we are)

| Area | Status |
|------|--------|
| **Product / UX** | Done: UI (step arrows, Arm button style, “Review My Pillars” / “Revisar mis pilares”). Pilares back/summary/empty-state behaviour. All visible copy and lang IDs in English (EN + ES). |
| **Phase 1 (helpers)** | Done: `getEl`, `getHistorial`, `getLastFilledPillarIndex` added; `parseLangXml` parsererror check. No call sites changed yet. |
| **Phase 1b (TypeScript)** | Done: tsconfig, app.ts, build script, copy-web runs tsc first, PillarRecord/HistorialItem/PillarData types. |
| **Next step** | **Testing** (unit + E2E). Then Phase 2 (use helpers), Phase 4, Phase 3, Phase 5/6 as needed. |

---

## Pending tasks (whole list, in order)

Do in this order. Verify after each phase.

### Phase 1b – TypeScript migration ✅ DONE
1. **TS1** – Add TypeScript tooling: `tsconfig.json`; rename `scripts/app.js` → `scripts/app.ts`; compile to JS. ✅
2. **TS2** – Update copy/build: run `tsc` (or build) then copy compiled JS + assets to `www/`. ✅ (`npm run build`, `copy-web` runs build first)
3. **TS3** – Fix compile errors; verify full flow unchanged. ✅
4. **TS4** – (Optional) Add types gradually: DOM, storage, pillar/history shapes, lang strings. ✅ (PillarRecord, HistorialItem, PillarData; getHistorial return type)

### Testing – Unit + E2E (secure current behaviour) (next)
5. **T1** – Unit tests: Add Vitest; extract or expose pure logic; add `tests/unit/` with lorem-based data. Run `npm run test:unit`.
6. **T2** – E2E tests: Add Playwright; serve `www/`; implement scenarios (happy path, validation gap, empty history, export, delete, language, Back from Pilares, 💪, step nav). Use lorem ipsum for all filled text. Run `npm run test:e2e`.
7. **T3** – Add `npm run test` (unit + e2e); document in README. Optional: run before/after TS to lock behaviour.

*Full testing plan and E2E scenarios: see **§ Testing plan** below.*

### Phase 2 – Use helpers (defensive + DRY)
8. **E5** – collectAllData: use getEl + null guard for step.
9. **E6** – initCheckboxes: use getEl + null guard; skip when step is null.
10. **E7** – bindNav: null-check every element before addEventListener.
11. **E8** – Replace all historial reads with getHistorial().
12. **E9** – validatePillarsOrder: use getLastFilledPillarIndex(data).
13. **E10** – renderPillarsOverview: use getLastFilledPillarIndex(data).

### Phase 4 – Style & minor fixes
14. **E13** – var → const/let (loadLang, bindNav, catch blocks).
15. **E14** – showConfirm: single addEventListener + “current action” variable.

### Phase 3 – Smaller methods (DRY)
16. **E11** – Extract createCheckboxRow(...); initCheckboxes only loops and appends.
17. **E12** – (Optional) buildPillarRecordFragment(...); refactor renderSummary, export, renderHistoryDetail.

### Phase 5 – Object grouping (namespaces, same file)
18. **E15** – Config object.
19. **E16** – Storage API.
20. **E17** – DomUtils.
21. **E18** – Lang object.
22. **E19** – Message object.
23. **E20** – Record helpers object.
24. **E21** – Validation object.
25. **E22** – Navigation object.
26. **E23** – Historial object.
27. **E24** – Pilares/Resumen view object.
28. **E25** – Checkboxes.init.

### Phase 6 – Interfaces & patterns (later)
29. **E26** – Interfaces for Storage and Lang.
30. **E27** – Decorator pattern.
31. **E28** – Factory.

### Code quality & other
32. **B1** – Safe getUltimoRegistro() with try/catch.
33. **B2** – Single startup path (E7 covers bindNav).
34. **B3** – Optional state layer.
35. **B4** – Focus management in showStep.
36. **B5** – aria-live for transient messages.
37. **B6** – Lang load error message.
38. In-app privacy line; skip link; reduced motion; portrait lock; store descriptions (EN + ES).

### Operational
39. Run `npm run copy-web` after changing index.html, theme, lang, or app so `www/` is up to date.

---

## Refactor plan (phase-by-phase)

**Rule:** Do not start phase N+1 until phase N is done and verified.

### Dependency overview

```
Phase 1 (helpers)     ✅ DONE   E1 getEl, E2 getHistorial, E3 getLastFilledPillarIndex, E4 parseLangXml parsererror
Phase 1b (TypeScript) ✅ DONE   TS1–TS4
Testing               next      T1 unit, T2 E2E, T3 npm run test
Phase 2 (use helpers)            E5–E10  ← E1, E2, E3
Phase 4 (style)                  E13, E14
Phase 3 (DRY)                    E11, E12
Phase 5 (objects)                E15–E25
Phase 6 (interfaces)             E26–E28
```

### Phase 1 – Helpers ✅ DONE
- E1: `getEl(id)` after constants.
- E2: `getHistorial()` try/catch, return `[]` on error.
- E3: `getLastFilledPillarIndex(data)` using hasAnyData.
- E4: parseLangXml – if `doc.querySelector('parsererror')` return out.

### Phase 1b – TypeScript migration ✅ DONE
- TS1: tsconfig; app.js → app.ts; install typescript (dev). ✅
- TS2: Build/copy: `npm run build` (tsc); `copy-web` runs build then copies to www/. ✅
- TS3: Fix compile; verify full flow (steps, pillars, summary, history, export, lang). ✅
- TS4: PillarRecord, HistorialItem, PillarData; getHistorial(): HistorialItem[]. ✅
- **Rollback:** Rename app.ts → app.js; remove tsconfig and TS build; restore copy script.

### Phase 2 – Use helpers
- E5: collectAllData: getEl + null guard.
- E6: initCheckboxes: getEl + null guard.
- E7: bindNav: if (el) el.addEventListener(...) for every element.
- E8: Replace historial reads with getHistorial().
- E9: validatePillarsOrder: use getLastFilledPillarIndex(data).
- E10: renderPillarsOverview: use getLastFilledPillarIndex(data).

### Phase 3 – Smaller methods
- E11: createCheckboxRow(...); initCheckboxes loops and appends.
- E12: (Optional) buildPillarRecordFragment(pillarId, rec, variant).

### Phase 4 – Style
- E13: var → const/let.
- E14: showConfirm: one addEventListener + current callback variable.

### Phase 5 – Object grouping
- E15 Config → E25 Checkboxes.init (see §6b tables in original backlog for full list).

### Phase 6 – Interfaces & patterns
- E26 Interfaces, E27 Decorator, E28 Factory.

### Verification checklist (after each phase)

- [ ] App loads; first step visible.
- [ ] Start → first pillar; Next/Back work.
- [ ] Fill one pillar (checkboxes + text); Review My Pillars → overview; View Summary.
- [ ] Validation if gap; with valid data, summary shows and record saved.
- [ ] View my records: list, open one, Back, Export, Delete all + confirm.
- [ ] Language switch (ES/EN): strings update.
- [ ] Options menu: open, close on outside click.
- [ ] Capacitor (if used): back button works.

### How to avoid breaking anything

- One phase at a time; add before replacing (e.g. E1–E4 before E5–E10).
- Null checks only add safety.
- E11/E12: compare DOM/HTML before and after.
- When adding Lang/Message etc., keep aliases (getString = Lang.get).

---

## Testing plan

**Goal:** Lock in current behaviour with unit tests (pure logic) and E2E tests (full flows, lorem ipsum for inputs).

### Unit tests (Vitest + Node)

| What to test | Assertions |
|--------------|------------|
| migrateDataKeys(data) | Old Spanish keys → internal ids; empty/null safe. |
| hasAnyData(record) | true when checked.length > 0 or poderoso non-empty. |
| recordHasAnyData(rec) | Any of checked, poderoso, q1–q3; null safe. |
| compactData(data) | Only pillars with data; trimmed strings. |
| getLastFilledPillarIndex(data) | Last index with data; -1 when none. |
| Pillar-order validation | Gap → invalid, missingPillars; no gap → valid. |

**How:** Extract a small `scripts/core.js` (or expose on window for tests) with these pure functions; test with lorem-based data. Run: `npm run test:unit`.

### E2E tests (Playwright)

Serve `www/` (or project root); simulate user actions; use **lorem ipsum** for all text inputs.

| # | Scenario | Assertions |
|---|----------|------------|
| 1 | Happy path – one pillar | Summary shows pillar; record saved. |
| 2 | Happy path – three pillars | Summary shows last pillar; saved. |
| 3 | Validation – gap (only pillar 3 filled) | Error; fill previous pillars; no save. |
| 4 | Validation – no pillar filled | At least one pillar message. |
| 5 | Pillars overview – empty | List visible; no crash. |
| 6 | Pillars overview – after fill | Filled vs optional correct; click opens step. |
| 7 | Back from Pilares | Returns to same pillar step. |
| 8 | History – empty | Empty state message. |
| 9 | History – one record | One entry; detail shows data (lorem). |
| 10 | History – export | Export triggers. |
| 11 | History – delete all | Confirm; Yes clears; No cancels. |
| 12 | Language switch | UI text changes (e.g. Review My Pillars / Revisar mis pilares). |
| 13 | Start Over | Back to start; can start again. |
| 14 | Arm button (💪) | Checkbox text moves to “Most powerful behaviour”. |
| 15 | Step navigation | Next/Back; Back from first → start. |

Run: `npm run test:e2e`. Document: run `npm run copy-web` before E2E so `www/` is up to date.

### Test layout (after adding tests)

```
tests/
├── unit/           # e.g. core.test.js
└── e2e/            # playwright.config.ts, flows.spec.ts
```

---

## Done in the repo

| Item | Notes |
|------|--------|
| Copy script | `scripts/copy-www.js` copies index, theme, lang, scripts/app.js → `www/`. |
| package.json | `npm run copy-web`, `npm run cap-sync`. |
| Capacitor config | `webDir: "www"`. |
| Android back button | Handled in app when Capacitor + App plugin exist. |
| Export Share | navigator.share first, then download. |
| Safe areas | Message overlay uses env(safe-area-inset-*). |
| First step visible without JS | #step-start has class active in HTML. |

---

## Manual steps (no code change)

- **Native app:** Run README commands; add app icon and splash (see Asset sizes).
- **Publish:** Publish privacy policy; create app in Play Console and App Store Connect; fill listing, content rating, Data Safety/App Privacy; upload screenshots; sign and submit.

---

## Store publish checklist

- [ ] Icon & splash (1024×1024 iOS; 512 or 1024 Android).
- [ ] Privacy policy URL in both store consoles.
- [ ] Play Console: description, category, content rating, Data Safety, screenshots.
- [ ] App Store Connect: description, category, age rating, App Privacy, screenshots.
- [ ] Signing: keystore + Play App Signing; iOS provisioning; TestFlight then Submit.

---

## Asset sizes

| Use | Size (px) |
|-----|-----------|
| iOS App Store icon | 1024 × 1024 |
| Android / Google Play icon | 512 × 512 (or 1024×1024) |

Splash: see Capacitor docs. Fonts (reference): step titles 1.25rem; body 0.95rem; buttons 1rem.

---

## Privacy policy (draft)

**Last updated:** [Date]

**Faster Diario** is an offline self-assessment tool.

**Data stored on your device:** Inputs (assessments, notes, history) are saved only on your device in local storage. We do not collect, transmit, or store this data on our servers. You can delete all data by clearing the app’s data or uninstalling.

**Data we do not collect:** No personal data, account data, or usage analytics; no third-party tracking or advertising.

**Export and sharing:** Exported files are created on your device and shared only where you choose. We do not receive or store exported content.

**Contact:** [Your contact email or link].

---

## Code quality backlog (reference)

Principles: DRY, SOLID, KISS, YAGNI. See **docs/CODE-ANALYSIS.md** for red/green flags and patterns. Items 1–8 (P0/P1) are addressed by Phase 1 + Phase 2; items 9–15 (P2–P4) by Phase 4 and later phases.

---

## Technical debt & optional

| Item | Priority |
|------|----------|
| In-app privacy line | Low |
| Focus on step change | Medium |
| Skip link | Low |
| Reduced motion (CSS) | Low |
| Lang load error message | Low |
| Portrait lock | Optional |
| Store descriptions (EN + ES) | Before publish |

---

## Project layout

Folders are created only when they contain code (see **docs/ARCHITECTURE.md** for target `src/` and `tests/` structure).

```
faster-diario/
├── src/
│   └── app.ts            # Entry; refactor into core/, features/, infrastructure/ as we go
├── tests/                # Vitest; add subdirs when adding tests
├── dist/                 # tsc output → copied to www/scripts/
├── www/                  # Capacitor webDir
├── android/
├── ios/
├── scripts/              # copy-www.js; app.backup.js
├── theme/
├── lang/
├── docs/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── update.sh
├── index.html
└── README.md
```
