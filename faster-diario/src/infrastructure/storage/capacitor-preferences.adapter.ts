import { Preferences } from '@capacitor/preferences';
import type { IKeyValueStorage } from './key-value-storage.interface.js';

const PREFIX = 'kv_';

/**
 * Capacitor Preferences backend — survives app restarts on iOS/Android.
 */
export class CapacitorPreferencesKeyValueStorage implements IKeyValueStorage {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key: PREFIX + key });
    return value;
  }

  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key: PREFIX + key, value });
  }

  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key: PREFIX + key });
  }
}
