# Android: black screen troubleshooting

If the app opens in Android Studio / on device but you only see a **black screen**, try these in order.

---

## 1. Sync web content and do a clean rebuild

The APK might have been built before the last sync, so it could be serving old or missing assets.

**From the project root (faster-diario/):**

```bash
./update.sh
```

**In Android Studio:**

1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. **Run (▶)** again

---

## 2. Confirm assets are in the Android project

After `./update.sh`, check that the app’s `public` folder has your web files:

```bash
ls android/app/src/main/assets/public/
```

You should see: `index.html`, `scripts/`, `theme/`, `lang/`.  
If any are missing, run `npm run copy-web` then `npx cap sync` from the project root and repeat step 1.

---

## 3. See if the WebView is loading (Logcat)

In Android Studio, open **View → Tool Windows → Logcat**. Run the app and filter by:

- `Capacitor` or `capacitor`
- `chromium` or `WebView`
- `Console` (if your device/emulator reports JS console there)

Look for:

- “Loading app at capacitor://localhost…” → WebView is starting to load.
- Red lines or “Error” → note the message; it often points to the cause (e.g. file not found, JS error).

---

## 4. Enable WebView debugging (optional)

To inspect the in-app page like a normal web page:

1. On your **device or emulator**, open the app (even if the screen is black).
2. On your **Mac**, open **Chrome** and go to: `chrome://inspect`
3. Under **Remote Target**, find your device and the WebView (e.g. “Faster Diario” or “WebView in …”).
4. Click **inspect**. A DevTools window opens for the WebView. Check the **Console** tab for JavaScript errors and the **Network** tab to see if `index.html` and `app.js` load.

---

## 5. Manifest: allow cleartext (already set)

If anything in the app loads over `http://` (e.g. a redirect or old config), the WebView can block it and show a blank screen. This project already has in **AndroidManifest.xml**:

- `android:usesCleartextTraffic="true"` on `<application>`
- `INTERNET` permission

So cleartext is allowed. If you had removed these, add them back.

---

## 6. Quick checklist

| Step | Action |
|------|--------|
| 1 | Run `./update.sh` from project root |
| 2 | Android Studio: **Build → Clean Project**, then **Rebuild Project**, then **Run** |
| 3 | Check **Logcat** for Capacitor/WebView/Console errors |
| 4 | Optional: **chrome://inspect** to debug the WebView and check Console/Network |

Most black screens are fixed by **step 1 + 2** (sync + clean rebuild). If it’s still black, use Logcat and chrome://inspect to see the exact error.
