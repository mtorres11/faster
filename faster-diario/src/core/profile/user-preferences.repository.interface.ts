import type { UserPreferences } from './user-preferences.types.js';

export interface IUserPreferencesRepository {
  load(): Promise<UserPreferences>;
  save(prefs: UserPreferences): Promise<void>;
}
