# Code analysis: FASTER Diario

Red flags, green flags, and recommended patterns to fix and improve the codebase.

---

## Red flags (fix or mitigate)

### 1. **Null dereference in `collectAllData()`**  
If `document.getElementById('step-' + pillarId)` returns `null` (e.g. DOM changed or typo in `PILLAR_IDS`), `step.querySelectorAll(...)` throws.

**Recommendation:** Guard before using `step`:
```javascript
const step = document.getElementById('step-' + pillarId);
if (!step) return;
// or: if (!step) { data[pillarId] = { checked: [], poderoso: '', q1: '', q2: '', q3: '' }; return; }
```

### 2. **`bindNav()` assumes all elements exist**  
`document.querySelector('.finalizar-btn')`, `document.getElementById('btn-ver-resumen')`, etc. are used without null checks. If any element is missing (e.g. typo in HTML or step not rendered), `.addEventListener()` throws and the rest of `bindNav()` (including lang menu and options) never runs.

**Recommendation:** Use optional chaining or null checks before attaching listeners, e.g.:
```javascript
const finalizarBtn = document.querySelector('.finalizar-btn');
if (finalizarBtn) finalizarBtn.addEventListener('click', finalizar);
```
Apply the same pattern for every element used in `bindNav()`.

### 3. **`JSON.parse(localStorage.getItem(...))` can throw**  
If `localStorage` data is corrupted or manually edited, `JSON.parse()` throws and can break the app (e.g. in `renderHistorialList`, `exportHistorialHTML`, `renderHistorialDetail`).

**Recommendation:** Wrap in try/catch and fall back to a safe default:
```javascript
function getHistorial() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_HISTORIAL) || '[]');
  } catch (e) {
    return [];
  }
}
```
Use the same pattern for `STORAGE_ULTIMO` where appropriate.

### 4. **No XML parse error handling in `parseLangXml()`**  
`DOMParser.parseFromString(..., 'text/xml')` can produce a document with a `<parsererror>` element when the XML is invalid. The code still walks `querySelectorAll('string')` and may return an empty or wrong object.

**Recommendation:** After parsing, check for parse failure, e.g.:
```javascript
const doc = parser.parseFromString(xmlText, 'text/xml');
if (doc.querySelector('parsererror')) return out; // or throw / log
```

### 5. **`initCheckboxes()` assumes step exists**  
`const step = document.getElementById('step-' + pillarId);` is used without a check. If the step is missing, `step.querySelector('.checkboxes')` throws.

**Recommendation:** Add `if (!step) return;` at the start of the loop body.

### 6. **Global mutable state**  
`currentStepIndex`, `finalizarFromPillar`, `historialView`, `historialReturnStep`, `strings`, `currentLang` are global. Multiple callers can change them; flow is harder to reason about and test.

**Recommendation:** Introduce a small state object or module (e.g. `const state = { currentStepIndex: 0, ... }`) and update it in one place, or keep globals but document them and avoid redundant updates.

### 7. **Mixed `var` and `const`/`let`**  
e.g. `var fallback` in `loadLang`, `var optionsTrigger` in `bindNav`. Style is inconsistent and `var` is function-scoped.

**Recommendation:** Use `const` or `let` everywhere and avoid `var`.

### 8. **`showConfirm()` overwrites `onclick` each time**  
`btn-confirm-yes` and `btn-confirm-no` get new handlers on every `showConfirm()` call. No cleanup of previous handlers (minor; only one confirm is visible at a time).

**Recommendation:** Prefer `addEventListener` and a single handler that reads "current" confirm action from a variable, or keep assignment but document that only one confirm is active at a time.

---

## Green flags (keep doing)

| Area | What's good |
|------|-------------|
| **XSS** | User- and data-driven content is passed through `escapeHtml()` before being used in `innerHTML` or HTML strings. |
| **i18n** | Embedded XML + optional fetch with fallback to `es_la`; `getString(id)` used consistently. |
| **Constants** | `PILLAR_IDS`, `STORAGE_*`, `TEXTAREA_NAMES` are defined at the top and reused. |
| **Validation** | `validateCurrentStepInputs()` and `validatePillarsOrder()` prevent invalid navigation; errors shown with `showMessage`. |
| **No dangerous APIs** | No `eval`, `new Function`, or `document.write`. |
| **Feature detection** | Capacitor back button and `navigator.share` are guarded so the app works in browser and native. |
| **CSS** | Variables, mobile-first layout, safe-area insets, consistent button height. |
| **Offline** | Lang and logic work without network; embedded strings ensure first paint. |

---

## Recommended patterns to adopt

### 1. **Defensive DOM access**  
- Prefer a small helper, e.g. `function getEl(id) { return document.getElementById(id); }`, and always check before calling methods:
  - `const el = getEl('btn-ver-resumen'); if (el) el.addEventListener(...);`
- For `querySelector` / `querySelectorAll`, check length or null before iterating or calling `.addEventListener`.

### 2. **Safe localStorage read**  
- Centralize reads in helpers that catch `JSON.parse` errors and return a default (e.g. `getHistorial()` → `[]`, `getUltimoRegistro()` → `null` or `{}`). Use them everywhere instead of inline `JSON.parse(localStorage.getItem(...))`.

### 3. **Single startup path**  
- Keep one entry point (e.g. `loadLang().then(() => { applyI18n(); bindNav(); ... }).catch(...)`) and ensure `bindNav()` never throws so the lang menu and options always get their listeners. Defensive null checks in `bindNav()` support this.

### 4. **Accessibility**  
- **Focus management:** In `showStep(index)`, after toggling the active step, move focus to the step's `h2` or first focusable element (e.g. `activeStep.querySelector('h2')?.focus()` or first button/input).  
- **Live region:** For transient messages ("Registro guardado"), use an `aria-live` region and set `textContent` there instead of or in addition to the overlay, so screen readers announce the message.

### 5. **Error handling for lang**  
- If both embedded and fetch fail, either ensure a minimal fallback string set or show a short, non-blocking message ("Language could not be loaded. Some text may be missing.") and keep the app usable.

### 6. **Consistent style**  
- Use `const`/`let` only; run a simple lint rule to disallow `var`.  
- Optionally run a formatter (e.g. Prettier) on `app.js` and `default.css`.

### 7. **Optional: small state layer**  
- Group `currentStepIndex`, `historialView`, `historialReturnStep`, `finalizarFromPillar` (and optionally `currentLang` / `strings`) into one object. Update only through a couple of functions (e.g. `setStep(index)`, `setHistorialView(...)`). This makes it easier to add logging, persistence, or tests later.

---

## Summary

| Severity | Count | Action |
|----------|--------|--------|
| **Red** | 8 | Add null checks, try/catch for `JSON.parse`, XML parse check, and optional state/helpers. |
| **Green** | 8 | Keep current approach for escaping, i18n, validation, and feature detection. |
| **Patterns** | 7 | Use defensive DOM access, safe storage reads, single startup path, a11y (focus + live region), consistent style, and optional state layer. |

Implementing the red-flag fixes and the first three patterns will make the app more robust without changing behavior. Accessibility and state refactors can follow as needed.
