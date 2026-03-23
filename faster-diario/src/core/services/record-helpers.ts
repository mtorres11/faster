/**
 * Pure pillar/record logic — no DOM, no localStorage, no i18n strings.
 * Callers supply pillar id ordering and resolve user-facing messages.
 */

import type { PillarRecord } from '../domain/types.js';
import { PILLAR_NAME_TO_ID } from '../domain/pillar-constants.js';

export function hasAnyData(record: Partial<PillarRecord>): boolean {
  const r = record as { checked?: number[]; poderoso?: string };
  return (r.checked?.length ?? 0) > 0 || (r.poderoso != null && r.poderoso.trim() !== '');
}

export function recordHasAnyData(rec: Partial<PillarRecord> | null | undefined): boolean {
  if (!rec) return false;
  const c = rec.checked && rec.checked.length > 0;
  const p = rec.poderoso && String(rec.poderoso).trim() !== '';
  const q1 = rec.q1 && String(rec.q1).trim() !== '';
  const q2 = rec.q2 && String(rec.q2).trim() !== '';
  const q3 = rec.q3 && String(rec.q3).trim() !== '';
  return !!(c || p || q1 || q2 || q3);
}

export function compactData(
  data: Record<string, Partial<PillarRecord>>,
  pillarIds: readonly string[],
): Record<string, Partial<PillarRecord> & { checked: number[] }> {
  const out: Record<string, Partial<PillarRecord> & { checked: number[] }> = {};
  pillarIds.forEach((pillarId) => {
    const rec = data[pillarId];
    if (!rec || !recordHasAnyData(rec)) return;
    const compactRec: Partial<PillarRecord> & { checked: number[] } = { checked: rec.checked || [] };
    if (rec.poderoso && String(rec.poderoso).trim() !== '') compactRec.poderoso = rec.poderoso.trim();
    if (rec.q1 && String(rec.q1).trim() !== '') compactRec.q1 = rec.q1.trim();
    if (rec.q2 && String(rec.q2).trim() !== '') compactRec.q2 = rec.q2.trim();
    if (rec.q3 && String(rec.q3).trim() !== '') compactRec.q3 = rec.q3.trim();
    out[pillarId] = compactRec;
  });
  return out;
}

export function migrateDataKeys(data: Record<string, unknown> | null | undefined) {
  if (!data || typeof data !== 'object') return data;
  const out: Record<string, unknown> = {};
  for (const k in data) {
    const id = PILLAR_NAME_TO_ID[k] || k;
    out[id] = data[k];
  }
  return out;
}

export function getLastFilledPillarIndex(
  data: Record<string, Partial<PillarRecord>>,
  pillarIds: readonly string[],
): number {
  let last = -1;
  for (let i = 0; i < pillarIds.length; i++) {
    const rec = data[pillarIds[i]];
    if (rec && hasAnyData(rec)) last = i;
  }
  return last;
}

export function getPillarStepIndex(pillarId: string, pillarIds: readonly string[]): number {
  const idx = pillarIds.indexOf(pillarId);
  return idx >= 0 ? idx : 0;
}

export function getLastPillarWithData(
  data: Record<string, Partial<PillarRecord>>,
  pillarIds: readonly string[],
): string | null {
  let last: string | null = null;
  pillarIds.forEach((pillarId) => {
    const rec = data[pillarId];
    if (rec && hasAnyData(rec)) last = pillarId;
  });
  return last;
}

/** Result of validating pillar fill order (no user-facing strings). */
export type PillarOrderIssue =
  | { kind: 'ok' }
  | { kind: 'empty' }
  | { kind: 'gaps'; missingPillars: string[] };

export function computePillarOrderIssues(
  data: Record<string, Partial<PillarRecord>>,
  pillarIds: readonly string[],
): PillarOrderIssue {
  let lastFilledIndex = -1;
  for (let i = 0; i < pillarIds.length; i++) {
    const rec = data[pillarIds[i]];
    if (rec && hasAnyData(rec)) lastFilledIndex = i;
  }
  if (lastFilledIndex === -1) return { kind: 'empty' };
  const missingPillars: string[] = [];
  for (let i = 0; i < lastFilledIndex; i++) {
    const rec = data[pillarIds[i]];
    if (!rec || !hasAnyData(rec)) missingPillars.push(pillarIds[i]);
  }
  if (missingPillars.length === 0) return { kind: 'ok' };
  return { kind: 'gaps', missingPillars };
}
