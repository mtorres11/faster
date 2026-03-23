/** Single pillar form data (checked indices + text fields). */
export interface PillarRecord {
  checked: number[];
  poderoso: string;
  q1: string;
  q2: string;
  q3: string;
}

/** Stored historial entry (date + compact pillar data). */
export interface HistorialItem {
  fecha?: string;
  data?: Record<string, Partial<PillarRecord>>;
}

/** All pillars' form data keyed by pillar id. */
export type PillarData = Record<string, PillarRecord>;
