export class LocalStorageKeyValueStorage {
    async getItem(key) {
        try {
            return localStorage.getItem(key);
        }
        catch {
            return null;
        }
    }
    async setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        }
        catch {
            /* quota or private mode */
        }
    }
    async removeItem(key) {
        try {
            localStorage.removeItem(key);
        }
        catch {
            /* ignore */
        }
    }
}
