const KEY = 'sword_queue_v1';
function uid() {
    return 'q_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}
export class LocalSwordQueueRepository {
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
    async enqueue(item) {
        const full = {
            ...item,
            id: item.id || uid(),
            attempts: item.attempts ?? 0,
        };
        const list = await this.readAll();
        list.push(full);
        await this.writeAll(list);
    }
    async peekAll() {
        return this.readAll();
    }
    async update(item) {
        const list = await this.readAll();
        const i = list.findIndex(q => q.id === item.id);
        if (i >= 0)
            list[i] = item;
        await this.writeAll(list);
    }
    async remove(id) {
        const list = (await this.readAll()).filter(q => q.id !== id);
        await this.writeAll(list);
    }
    async flushPending() {
        /** Future: POST to BFF; for now mark as processed = 0 */
        return { processed: 0, failed: 0 };
    }
}
