import type { IKeyValueStorage } from './key-value-storage.interface.js';
import { LocalStorageKeyValueStorage } from './local-storage.adapter.js';

export type StorageBackend = 'auto' | 'localStorage' | 'preferences';

/**
 * Returns the app-wide key-value store.
 *
 * **Unbundled web (e.g. `python -m http.server`):** only `localStorage` is used.
 * Do not statically import `@capacitor/preferences` here — bare specifiers break the browser
 * module loader, so `main.js` would fail to load and login would not run.
 * Capacitor WebView supports `localStorage`; `@capacitor/preferences` can be added with a bundler.
 */
export function createKeyValueStorage(_kind: StorageBackend = 'auto'): IKeyValueStorage {
  return new LocalStorageKeyValueStorage();
}

let singleton: IKeyValueStorage | null = null;

export function getAppKeyValueStorage(): IKeyValueStorage {
  if (!singleton) singleton = createKeyValueStorage('auto');
  return singleton;
}

export function resetAppKeyValueStorageForTests(): void {
  singleton = null;
}
