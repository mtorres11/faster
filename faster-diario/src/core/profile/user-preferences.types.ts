/** Extensible user preferences (populated when backend exists). */
export interface UserPreferences {
  version: number;
  /** e.g. notification toggles, theme — empty object for now */
  data: Record<string, unknown>;
}
