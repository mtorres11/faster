import type { SwordQueueItem } from './sword.types.js';

/**
 * Pending operations to sync when online (SWORD sessions, etc.).
 */
export interface ISwordQueueRepository {
  enqueue(item: Omit<SwordQueueItem, 'attempts'> & { attempts?: number }): Promise<void>;
  peekAll(): Promise<SwordQueueItem[]>;
  update(item: SwordQueueItem): Promise<void>;
  remove(id: string): Promise<void>;
  /** Process queue (no-op stub until backend exists) */
  flushPending(): Promise<{ processed: number; failed: number }>;
}
