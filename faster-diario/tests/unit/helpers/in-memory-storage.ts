import type { IKeyValueStorage } from '../../../src/infrastructure/storage/key-value-storage.interface.js';

/** In-memory `IKeyValueStorage` for unit tests. */
export function createInMemoryStorage(
  initial?: Record<string, string>
): IKeyValueStorage & { snapshot(): Record<string, string> } {
  const store: Record<string, string> = { ...initial };
  return {
    async getItem(key: string) {
      return store[key] ?? null;
    },
    async setItem(key: string, value: string) {
      store[key] = value;
    },
    async removeItem(key: string) {
      delete store[key];
    },
    snapshot() {
      return { ...store };
    },
  };
}
