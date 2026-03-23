import type { SwordSessionRecord } from './sword.types.js';

export interface ISwordSessionRepository {
  list(): Promise<SwordSessionRecord[]>;
  get(id: string): Promise<SwordSessionRecord | null>;
  upsert(record: SwordSessionRecord): Promise<void>;
  delete(id: string): Promise<void>;
}
