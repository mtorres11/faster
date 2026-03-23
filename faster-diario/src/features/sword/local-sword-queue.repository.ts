import type { IKeyValueStorage } from '../../infrastructure/storage/key-value-storage.interface.js';
import type { SwordQueueItem } from './sword.types.js';
import type { ISwordQueueRepository } from './sword-queue.repository.interface.js';

const KEY = 'sword_queue_v1';

function uid(): string {
  return 'q_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

export class LocalSwordQueueRepository implements ISwordQueueRepository {
  constructor(private readonly storage: IKeyValueStorage) {}

  private async readAll(): Promise<SwordQueueItem[]> {
    const raw = await this.storage.getItem(KEY);
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw) as SwordQueueItem[];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  private async writeAll(list: SwordQueueItem[]): Promise<void> {
    await this.storage.setItem(KEY, JSON.stringify(list));
  }

  async enqueue(
    item: Omit<SwordQueueItem, 'attempts'> & { attempts?: number }
  ): Promise<void> {
    const full: SwordQueueItem = {
      ...item,
      id: item.id || uid(),
      attempts: item.attempts ?? 0,
    };
    const list = await this.readAll();
    list.push(full);
    await this.writeAll(list);
  }

  async peekAll(): Promise<SwordQueueItem[]> {
    return this.readAll();
  }

  async update(item: SwordQueueItem): Promise<void> {
    const list = await this.readAll();
    const i = list.findIndex(q => q.id === item.id);
    if (i >= 0) list[i] = item;
    await this.writeAll(list);
  }

  async remove(id: string): Promise<void> {
    const list = (await this.readAll()).filter(q => q.id !== id);
    await this.writeAll(list);
  }

  async flushPending(): Promise<{ processed: number; failed: number }> {
    /** Future: POST to BFF; for now mark as processed = 0 */
    return { processed: 0, failed: 0 };
  }
}
