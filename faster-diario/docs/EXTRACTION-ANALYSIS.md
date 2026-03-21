# Extraction analysis: objects and logic to split

What can be extracted from the single `app.js` into smaller objects, methods, and reusable logic **without changing current behavior**. Focus: reuse, clarity, and a path to better performance and interfaces.

---

## 1. Current shape of the app

- **One script:** ~690 lines; constants, global state, and ~40 functions in one scope.
- **Responsibilities mixed:** i18n, storage, navigation, validation, form data, UI (message/confirm), historial, export, resumen, checkboxes, and startup.
- **Entry point:** `loadLang(currentLang).then(applyI18n, bindNav, …).catch(…)` — single bootstrap.

---

## 2. Extractable objects (logical clusters)

These are **conceptual modules**. You can implement them as plain objects (namespaces) or IIFE modules that expose a small API. No need to change call sites at first; you can alias existing function names to the new methods.

| Object / module | Current pieces | Purpose | Safe to extract? |
|----------------|----------------|---------|-------------------|
| **Config** | `PILLAR_IDS`, `CHECKBOX_IDS`, `STORAGE_*`, `PILLAR_NAME_TO_ID`, `TEXTAREA_NAMES` | Read-only configuration | Yes. Move into one object; rest of code reads from it. No behavior change. |
| **Storage** | All `localStorage.getItem(STORAGE_*)` / `setItem` + `JSON.parse` | Read/write historial, último, lang | Yes. Expose `getHistorial()`, `setHistorial(arr)`, `getUltimoRegistro()`, `setUltimoRegistro(data)`, `getLang()`, `setLang(code)`. Add try/catch in getters. Replaces 4+ raw `JSON.parse` calls. |
| **Lang** | `strings`, `currentLang`, `parseLangXml`, `loadLang`, `getString`, `applyI18n` | Load strings, resolve key → text, apply to DOM | Yes. Keep same signatures; group as e.g. `Lang.load()`, `Lang.get()`, `Lang.apply()`. State stays in closure or object. |
| **DOM utils** | `escapeHtml` (and later `getEl`) | Pure helpers for DOM/HTML | Yes. e.g. `DomUtils.escapeHtml`, `DomUtils.getEl`. No side effects. |
| **Message / Dialog** | `showMessage`, `hideMessage`, `showConfirm` | Overlay and confirm UI | Yes. e.g. `Message.show(text, isError)`, `Message.hide()`, `Message.confirm(message, onYes)`. Same behavior, grouped. |
| **Record / form data** | `migrateDataKeys`, `hasAnyData`, `recordHasAnyData`, `compactData`, `collectAllData` | Data shape and collection from form | Partially. `hasAnyData`, `recordHasAnyData`, `compactData` are pure; can live in a `Record` helper. `collectAllData` reads DOM — keep as function that uses `Record` helpers; optionally expose as `Record.collectFromDom()`. |
| **Validation** | `validateCurrentStepInputs`, `validatePilaresOrder`, `markStepValidationErrors`, `clearStepValidationErrors` | Step and pillar-order rules, DOM marking | Yes. e.g. `Validation.stepInputs()`, `Validation.pilaresOrder()`, `Validation.markErrors()`, `Validation.clearErrors()`. Same logic. |
| **Navigation / steps** | `currentStepIndex`, `historialView`, `historialReturnStep`, `finalizarFromPillar`, `steps`, `stepIds`, `showStep`, `goNext`, `goBack`, `getStepPillarId` | Which step is active, back/next, pillar id from step | Yes. Group state + methods into a `Navigation` or `StepController` object. Other code calls e.g. `Navigation.showStep(i)`, `Navigation.goNext()`. Single place for step state. |
| **Historial** | `openHistorial`, `renderHistorialList`, `renderHistorialDetail`, `buildRecordHtml`, `exportHistorialHTML`, `doExportDownload`, `borrarTodosLosRegistros` | List/detail, export, delete | Yes. e.g. `Historial.open()`, `Historial.renderList()`, `Historial.renderDetail(idx)`, `Historial.exportHtml()`, `Historial.deleteAll()`. Use Storage and Message internally. Same behavior. |
| **Pilares / Resumen view** | `renderPilaresOverview`, `renderResumen`, `getLastPillarWithData`, `getPillarStepIndex`, `labelForCheckedItem` | Overview and resumen screen HTML | Yes. Group as view helpers; can depend on Lang, Record, Validation. |
| **Checkboxes** | `initCheckboxes` | Build checkbox rows per pillar | Yes. Keep as one function; optionally `Checkboxes.init()`. Can use `DomUtils.getEl` and Config. |

Extracting these **does not change behavior** if you:

- Keep the same function logic and only move it into objects or modules.
- Keep or alias the same public names (e.g. `getString` → `Lang.get`) so call sites stay minimal or unchanged.

---

## 3. Smaller methods (DRY, reuse, testability)

These are **refactors inside the current file** that reduce duplication and make future extraction easier.

| Change | Where | What's duplicated today | New piece | Benefit |
|-------|--------|---------------------------|-----------|---------|
| **Last-filled index** | `validatePilaresOrder` (313–316), `renderPilaresOverview` (348–351) | Same loop: find last index `i` where pillar has data | `function getLastFilledPillarIndex(data)` returning `-1` or index | Single source of truth; `validatePilaresOrder` and `renderPilaresOverview` use it. DRY. |
| **Pillar record HTML fragment** | `renderResumen` (396–408), `buildRecordHtml` (456–468), `renderHistorialDetail` (523–539) | Same structure: checked list, poderoso, q1–q3, consejo; only wrapper class differs | `function buildPillarRecordFragment(pillarId, rec, options)` with e.g. `variant: 'resumen'|'export'|'detail'` to choose wrapper/classes | One place for "how we render one pillar's data"; three callers. DRY, easier to change layout. |
| **Single checkbox row** | `initCheckboxes` (118–132) | Inline creation of row, input, label, button | `function createCheckboxRow(pillarId, index, cbId, textareaPoderoso)` returning the row element | Clearer init loop; row logic testable; same behavior. |
| **Safe historial read** | `renderHistorialList`, `exportHistorialHTML`, `renderHistorialDetail`, `borrarTodosLosRegistros` (indirect) | `JSON.parse(localStorage.getItem(STORAGE_HISTORIAL) \|\| '[]')` | `function getHistorial()` with try/catch, return `[]` on error | One implementation; all callers use `getHistorial()`. Safer and DRY. |

These can be done **before** or **in parallel** with the object extractions above.

---

## 4. What to do now (no behavior change)

Recommended order: do the following in the current single file; then you can move groups into objects/files later.

1. **Add helpers (no call-site changes yet)**  
   - `getEl(id)` → `document.getElementById(id)`.  
   - `getHistorial()` → try/catch around `JSON.parse(localStorage.getItem(STORAGE_HISTORIAL) || '[]')`, return `[]` on error.  
   - `getLastFilledPillarIndex(data)` → loop `PILLAR_IDS`, return last index with `hasAnyData(data[pillarId])`, else `-1`.

2. **Use the helpers**  
   - In `collectAllData` and `initCheckboxes`: use `getEl('step-' + pillarId)` and null check before using `step`.  
   - In `bindNav`: use `getEl(...)` or null-check each element before `addEventListener`.  
   - Everywhere that reads historial: replace `JSON.parse(localStorage.getItem(STORAGE_HISTORIAL) || '[]')` with `getHistorial()`.  
   - In `validatePilaresOrder`: replace the first loop with `const lastFilledIndex = getLastFilledPillarIndex(data)`.  
   - In `renderPilaresOverview`: replace the first loop with `const lastFilledIndex = getLastFilledPillarIndex(data)`.

3. **Extract one small method**  
   - `createCheckboxRow(pillarId, index, cbId, textareaPoderoso)` in `initCheckboxes`: move the row creation into this function; `initCheckboxes` only loops and appends. Same DOM and behavior.

4. **Optional next step**  
   - `buildPillarRecordFragment(pillarId, rec, variant)` and refactor `renderResumen`, `buildRecordHtml`, and `renderHistorialDetail` to use it. Variant controls wrapper div class and small layout differences. Same output as today.

After that you have:

- Safer DOM and storage access.  
- Less duplication (last-filled index, historial read, checkbox row).  
- A clear place to add interfaces (e.g. Storage, Lang) and decorators later without breaking existing behavior.

---

## 5. Performance (low risk)

- **No change:** Event listeners are already attached once in `bindNav`; no repeated re-binding.  
- **Possible micro-optimization:** `steps` and `stepIds` are computed once at load; that's good.  
- **If you split into modules later:** You can load non-critical parts (e.g. export, historial view) on demand to reduce initial parse cost; not required for current size.  
- **getHistorial():** Centralizing reads and caching the result per "transaction" (e.g. one read per render) avoids repeated `localStorage` + `JSON.parse` in the same turn; you already don't read multiple times in one call stack, so this is a small win and keeps code simpler.

---

## 6. Summary table

| Category | Action | Breaks behavior? |
|----------|--------|-------------------|
| Config object | Group constants in one object | No |
| Storage helpers | getHistorial(), setHistorial(), get/set lang/ultimo | No (add try/catch in getters) |
| Lang object | Group load, get, apply | No |
| DOM utils | escapeHtml, getEl in one place | No |
| Message object | Group show, hide, confirm | No |
| Record helpers | hasAnyData, recordHasAnyData, compactData, collectAllData | No |
| Validation object | Group validation + mark/clear errors | No |
| Navigation object | Group step state + showStep, goNext, goBack | No |
| Historial object | Group open, renderList, renderDetail, export, deleteAll | No |
| getLastFilledPillarIndex | Single function used in validate + render overview | No |
| buildPillarRecordFragment | One function for resumen/export/detail pillar block | No (same HTML output) |
| createCheckboxRow | One function used in initCheckboxes | No |
| getEl + null checks | In collectAllData, initCheckboxes, bindNav | No (more robust) |

Doing the "what to do now" section gives you smaller, reusable methods and a clear path to the extractable objects above **without breaking current logic and behaviour**.
