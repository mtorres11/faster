# iOS / Xcode troubleshooting: "iPhone not showing"

Use this when the app isn’t visible in Xcode or the Simulator.

---

## 1. Make sure a simulator is selected (not a real device)

- In Xcode, at the **top toolbar**, next to the **Run (▶)** button, click the **destination** dropdown (it might say "App" or a device name).
- You must see **iPhone XX** or **iPad XX** (e.g. **iPhone 16**, **iPhone 15**).  
  If you see **"Any iOS Device (arm64)"** or only physical devices, the Simulator won’t open.
- **Fix:** In the same dropdown, choose any **iPhone** or **iPad** simulator. If the list is empty, go to **Section 4** below.

---

## 2. Run the app and find the Simulator window

- Click **Run (▶)** or press **⌘R**.
- Wait for the build to finish (no errors in the build log).
- **iOS Simulator** is a **separate app**: a window that looks like a phone. It often opens **behind** Xcode or on another Space.
- **Find it:**
  - **Dock:** Click the **Simulator** icon (iPhone in a frame).
  - **⌘Tab:** Switch to the app named **"Simulator"**.
  - **Mission Control:** Swipe up with three fingers (or F3) and look for the Simulator window.
- Inside the Simulator window you should see the **home screen**; your app (**Faster Diario**) may already be in the foreground, or tap its icon to open it.

---

## 3. Simulator opens but the app screen is blank (white or black)

- The WebView might not be loading your `index.html`.
- **Sync web content into the iOS project again:**
  ```bash
  cd /path/to/faster-diario
  ./update.sh
  ```
  or:
  ```bash
  npm run copy-web
  npx cap sync
  ```
- In Xcode: **Product → Clean Build Folder (⇧⌘K)**, then **Run (▶)** again.
- Confirm that `ios/App/App/public/` contains `index.html`, `scripts/app.js`, `theme/`, and `lang/`. If not, run `./update.sh` and `npx cap sync` from the project root.

---

## 4. No iPhone simulators in the destination dropdown

- **Install a simulator:**
  - **Xcode → Settings… (⌘,)** → **Platforms** (or **Components** in older Xcode).
  - Click **+** and add an **iOS** version (e.g. **18.0** or **17.0**). Wait for the download.
  - Or: **Window → Devices and Simulators** → **Simulators** tab → **+** to add a new simulator (choose OS version and device type, e.g. iPhone 15).
- Close and reopen the project in Xcode, then check the destination dropdown again.

---

## 5. Run from the command line (to test without Xcode UI)

From the project root:

```bash
npx cap run ios
```

This builds the app and launches the **iOS Simulator** with your app. If the Simulator window appears and shows your app, the project is fine and the issue is likely the **destination** or **window placement** in Xcode (sections 1 and 2).

---

## 6. Quick checklist

| Check | Action |
|-------|--------|
| Destination is a **simulator** (e.g. iPhone 16), not "Any iOS Device" | Use the device dropdown next to Run |
| Simulator app is visible | Dock, ⌘Tab, or Mission Control → Simulator |
| Web content is in the app | Run `./update.sh` then Clean + Run in Xcode |
| At least one simulator exists | Xcode → Settings → Platforms (or Devices and Simulators) |
| Try without Xcode | Run `npx cap run ios` from project root |

If you’ve done all of the above and the Simulator still doesn’t show or the app is still blank, note exactly what you see (e.g. “destination dropdown is empty”, “Simulator window is white”, “build fails with …”) and use that for the next step.
