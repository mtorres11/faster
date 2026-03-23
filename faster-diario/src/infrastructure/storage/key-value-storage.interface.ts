/**
 * Pluggable key-value persistence (browser localStorage vs Capacitor Preferences).
 * All methods are async so native adapters can use Preferences without blocking the UI thread.
 */
export interface IKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
