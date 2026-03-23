import type { SwordDevotionalDTO } from './sword.types.js';

export interface ISwordContentProvider {
  /** Load catalog (from network or cache). */
  listDevotionals(): Promise<SwordDevotionalDTO[]>;
  getDevotional(id: string): Promise<SwordDevotionalDTO | null>;
}
