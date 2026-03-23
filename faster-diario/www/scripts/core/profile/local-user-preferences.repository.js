const KEY = 'user_preferences_v1';
const DEFAULT = { version: 1, data: {} };
export class LocalUserPreferencesRepository {
    constructor(storage) {
        this.storage = storage;
    }
    async load() {
        const raw = await this.storage.getItem(KEY);
        if (!raw)
            return { ...DEFAULT, data: { ...DEFAULT.data } };
        try {
            const parsed = JSON.parse(raw);
            if (typeof parsed.version !== 'number')
                return { ...DEFAULT };
            return { version: parsed.version, data: { ...(parsed.data || {}) } };
        }
        catch {
            return { ...DEFAULT };
        }
    }
    async save(prefs) {
        await this.storage.setItem(KEY, JSON.stringify(prefs));
    }
}
