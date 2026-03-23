import type { IKeyValueStorage } from '../../infrastructure/storage/key-value-storage.interface.js';
import type { UserPreferences } from './user-preferences.types.js';
import type { IUserPreferencesRepository } from './user-preferences.repository.interface.js';

const KEY = 'user_preferences_v1';

const DEFAULT: UserPreferences = { version: 1, data: {} };

export class LocalUserPreferencesRepository implements IUserPreferencesRepository {
  constructor(private readonly storage: IKeyValueStorage) {}

  async load(): Promise<UserPreferences> {
    const raw = await this.storage.getItem(KEY);
    if (!raw) return { ...DEFAULT, data: { ...DEFAULT.data } };
    try {
      const parsed = JSON.parse(raw) as UserPreferences;
      if (typeof parsed.version !== 'number') return { ...DEFAULT };
      return { version: parsed.version, data: { ...(parsed.data || {}) } };
    } catch {
      return { ...DEFAULT };
    }
  }

  async save(prefs: UserPreferences): Promise<void> {
    await this.storage.setItem(KEY, JSON.stringify(prefs));
  }
}
