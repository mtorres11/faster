import { Preferences } from '@capacitor/preferences';
const PREFIX = 'kv_';
/**
 * Capacitor Preferences backend — survives app restarts on iOS/Android.
 */
export class CapacitorPreferencesKeyValueStorage {
    async getItem(key) {
        const { value } = await Preferences.get({ key: PREFIX + key });
        return value;
    }
    async setItem(key, value) {
        await Preferences.set({ key: PREFIX + key, value });
    }
    async removeItem(key) {
        await Preferences.remove({ key: PREFIX + key });
    }
}
