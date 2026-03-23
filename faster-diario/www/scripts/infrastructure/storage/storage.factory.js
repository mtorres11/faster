import { LocalStorageKeyValueStorage } from './local-storage.adapter.js';
/**
 * Returns the app-wide key-value store.
 *
 * **Unbundled web (e.g. `python -m http.server`):** only `localStorage` is used.
 * Do not statically import `@capacitor/preferences` here — bare specifiers break the browser
 * module loader, so `main.js` would fail to load and login would not run.
 * Capacitor WebView supports `localStorage`; `@capacitor/preferences` can be added with a bundler.
 */
export function createKeyValueStorage(_kind = 'auto') {
    return new LocalStorageKeyValueStorage();
}
let singleton = null;
export function getAppKeyValueStorage() {
    if (!singleton)
        singleton = createKeyValueStorage('auto');
    return singleton;
}
export function resetAppKeyValueStorageForTests() {
    singleton = null;
}
