# Escala FASTER Diario

Offline self-assessment app for the FASTER scale (Restoration, Forgetting priorities, Anxiety, Speeding up, Ticked off, Exhaustion, Relapse). No backend, no account. Data stays on your device.

---

## Features

- **Wizard flow:** Step through the seven pillars; mark items, fill “Comportamiento más poderoso” and reflection questions.
- **Resumen:** Review your inputs and get a short consejo per pillar; save the current run as a registro.
- **Historial:** List of saved registros; open one to see detail; export selected ones as a single HTML file (download or Share when available).
- **Language:** Spanish (default) and English; switch in the toolbar; preference saved in `localStorage`.
- **Options menu:** Hamburger menu with Inicio (home), Perfil (placeholder), Cerrar sesión (placeholder).
- **Offline:** Works without internet; language strings are embedded so the app is usable as soon as the page loads.
- **Mobile-friendly:** Viewport, safe areas, touch-sized buttons; ready to be wrapped with Capacitor for Android/iOS.

---

## Tech stack

- Vanilla HTML, CSS, JavaScript (no framework).
- `localStorage` for last form state, historial, and language.
- i18n via embedded XML in `index.html` plus optional `fetch` of `lang/*.xml`.
- Brand styling in `theme/default.css` (teal palette, Caveat Brush / Oswald / Montserrat).

---

## Run locally (browser)

No build step:

- **Option 1:** Open `index.html` in the browser (double-click or drag into the window).
- **Option 2:** Use **Live Server** in VS Code/Cursor: right-click `index.html` → “Open with Live Server”.

---

## Usage

1. From the first screen, tap **Iniciar** to go to the first pillar (Restauración).
2. Use **Atrás** / **Siguiente** to move between pillars; use **Fin** to jump to the Pilares overview.
3. Use the **💪** button next to a checkbox to copy that line into “Comportamiento más poderoso.”
4. On the last pillar (Recaída), **Finalizar** takes you to the Pilares overview; from there, **Ver Resumen** goes to the summary.
5. On Resumen: **Guardar Registro** adds the current run to Historial; **Nuevo Registro** reloads to start over.
6. **Ver mis registros** (from the first screen or Resumen) opens Historial: tap a registro to view it; select one or more and **Exportar HTML** to get a file (download or Share).
7. **Opciones** (☰) → Inicio returns to the first screen; language is changed via the flag dropdown in the toolbar.

Data is stored only in the browser’s `localStorage`.

---

## Export to iOS and Android (Capacitor)

Follow these steps to build and run the app as a native Android and/or iOS project. You need Node.js and npm installed; for iOS you need a Mac with Xcode.

### 1. One-time setup

From the project root:

```bash
npm run copy-web
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/app
npx cap add android
npx cap add ios
npm run cap-sync
```

- `copy-web` copies `index.html`, `theme/`, `scripts/app.js`, and `lang/` into `www/` (Capacitor’s web root).
- `@capacitor/app` is needed so the Android back button is handled in the native app.
- After adding platforms, `cap-sync` copies web assets into the native projects.

### 2. Run on device or emulator

```bash
npx cap open android
```

or

```bash
npx cap open ios
```

Then build and run from Android Studio or Xcode (device or emulator).

**Android: if you installed Android Studio via DMG** — The DMG only installs the IDE. You still need the **Android SDK**. Open **Android Studio** once and complete the **first-run setup wizard**; it will download the SDK (often to `~/Library/Android/sdk`). When the wizard finishes, you’re ready to use `npx cap open android` and build. To confirm: after setup, you should see a folder at `~/Library/Android/sdk` containing `platform-tools` (with `adb`), `build-tools`, etc.

### 3. After changing the web app

Whenever you change `index.html`, `theme/`, `scripts/app.js`, or `lang/`:

```bash
npm run cap-sync
```

Then run again from the IDE so the native app loads the latest web assets.

### 4. Before publishing to the stores

- **App icon and splash:** Add PNGs (e.g. 1024×1024 icon). See **docs/BACKLOG.md** for sizes and where to put them.
- **Privacy policy:** Publish the policy text (draft in docs/BACKLOG.md) on a web page and add the URL in Google Play Console and App Store Connect.
- **Store listing:** Create the app in Play Console and App Store Connect; fill descriptions, category, content rating, Data Safety / App Privacy; upload screenshots; sign and submit.

Details, checklist, refactor and testing plans, and optional improvements are in **docs/BACKLOG.md**. Code and extraction analysis: **docs/CODE-ANALYSIS.md**, **docs/EXTRACTION-ANALYSIS.md**.

---

## Documentation (`docs/`)

| File | Contents |
|------|----------|
| **BACKLOG.md** | Current status, full task list, refactor plan, testing plan, manual/store checklist, asset sizes, privacy draft, project layout. |
| **ARCHITECTURE.md** | Target `src/` and `tests/` layout (core, features, infrastructure); rule: create folders only when they contain code. |
| **CODE-ANALYSIS.md** | Red/green flags and recommended patterns for the codebase. |
| **EXTRACTION-ANALYSIS.md** | Extractable modules and smaller methods (no behavior change). |
