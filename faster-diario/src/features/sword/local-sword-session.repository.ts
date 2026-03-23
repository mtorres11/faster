import type { IKeyValueStorage } from '../../infrastructure/storage/key-value-storage.interface.js';
import type { SwordSessionRecord } from './sword.types.js';
import type { ISwordSessionRepository } from './sword-session.repository.interface.js';

const KEY = 'sword_sessions_v1';

export class LocalSwordSessionRepository implements ISwordSessionRepository {
  constructor(private readonly storage: IKeyValueStorage) {}

  private async readAll(): Promise<SwordSessionRecord[]> {
    const raw = await this.storage.getItem(KEY);
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw) as SwordSessionRecord[];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  private async writeAll(list: SwordSessionRecord[]): Promise<void> {
    await this.storage.setItem(KEY, JSON.stringify(list));
  }

  async list(): Promise<SwordSessionRecord[]> {
    return this.readAll();
  }

  async get(id: string): Promise<SwordSessionRecord | null> {
    const list = await this.readAll();
    return list.find(s => s.id === id) || null;
  }

  async upsert(record: SwordSessionRecord): Promise<void> {
    const list = await this.readAll();
    const i = list.findIndex(s => s.id === record.id);
    if (i >= 0) list[i] = record;
    else list.push(record);
    await this.writeAll(list);
  }

  async delete(id: string): Promise<void> {
    const list = (await this.readAll()).filter(s => s.id !== id);
    await this.writeAll(list);
  }
}
