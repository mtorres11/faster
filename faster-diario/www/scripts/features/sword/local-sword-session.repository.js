const KEY = 'sword_sessions_v1';
export class LocalSwordSessionRepository {
    constructor(storage) {
        this.storage = storage;
    }
    async readAll() {
        const raw = await this.storage.getItem(KEY);
        if (!raw)
            return [];
        try {
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        }
        catch {
            return [];
        }
    }
    async writeAll(list) {
        await this.storage.setItem(KEY, JSON.stringify(list));
    }
    async list() {
        return this.readAll();
    }
    async get(id) {
        const list = await this.readAll();
        return list.find(s => s.id === id) || null;
    }
    async upsert(record) {
        const list = await this.readAll();
        const i = list.findIndex(s => s.id === record.id);
        if (i >= 0)
            list[i] = record;
        else
            list.push(record);
        await this.writeAll(list);
    }
    async delete(id) {
        const list = (await this.readAll()).filter(s => s.id !== id);
        await this.writeAll(list);
    }
}
