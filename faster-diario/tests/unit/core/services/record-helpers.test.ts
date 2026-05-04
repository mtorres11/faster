import { describe, expect, it } from 'vitest';
import {
  compactData,
  computePillarOrderIssues,
  getLastFilledPillarIndex,
  getLastPillarWithData,
  getPillarStepIndex,
  hasAnyData,
  migrateDataKeys,
  recordHasAnyData,
} from '../../../../src/core/services/record-helpers.js';
import type { PillarRecord } from '../../../../src/core/domain/types.js';
import { PILLAR_IDS } from '../../../../src/core/domain/pillar-constants.js';

const PILLAR_ORDER = PILLAR_IDS as unknown as readonly string[];

describe('hasAnyData', () => {
  it('is true when checked has items', () => {
    expect(hasAnyData({ checked: [1] })).toBe(true);
  });
  it('is true when poderoso is non-empty', () => {
    expect(hasAnyData({ poderoso: ' x ' })).toBe(true);
  });
  it('is false for empty or whitespace poderoso', () => {
    expect(hasAnyData({ checked: [], poderoso: '   ' })).toBe(false);
    expect(hasAnyData({ poderoso: '' })).toBe(false);
  });
});

describe('recordHasAnyData', () => {
  it('returns false for null/undefined', () => {
    expect(recordHasAnyData(null)).toBe(false);
    expect(recordHasAnyData(undefined)).toBe(false);
  });
  it('considers q1–q3 text', () => {
    expect(recordHasAnyData({ q1: 'a' })).toBe(true);
    expect(recordHasAnyData({ q2: 'b' })).toBe(true);
    expect(recordHasAnyData({ q3: 'c' })).toBe(true);
  });
});

describe('compactData', () => {
  it('drops empty records and trims strings', () => {
    const data: Record<string, Partial<PillarRecord>> = {
      a: { checked: [0], poderoso: '  x  ', q1: '  hi  ' },
      b: { checked: [] },
    };
    const out = compactData(data, ['a', 'b']);
    expect(out.a).toEqual({ checked: [0], poderoso: 'x', q1: 'hi' });
    expect(out.b).toBeUndefined();
  });
});

describe('migrateDataKeys', () => {
  it('returns input when not a plain object map', () => {
    expect(migrateDataKeys(null)).toBe(null);
    expect(migrateDataKeys(undefined)).toBe(undefined);
  });
  it('maps Spanish pillar names to ids', () => {
    const m = migrateDataKeys({
      Restauración: { checked: [1] },
    }) as Record<string, unknown>;
    expect(m?.restauracion).toEqual({ checked: [1] });
  });
  it('keeps unknown keys', () => {
    const m = migrateDataKeys({ custom: 1 }) as Record<string, unknown>;
    expect(m).toEqual({ custom: 1 });
  });
});

describe('getLastFilledPillarIndex & getPillarStepIndex & getLastPillarWithData', () => {
  it('getLastFilledPillarIndex returns -1 when nothing filled', () => {
    const data: Record<string, Partial<PillarRecord>> = { restauracion: {} };
    expect(getLastFilledPillarIndex(data, PILLAR_ORDER)).toBe(-1);
  });
  it('getPillarStepIndex returns 0 for unknown id', () => {
    expect(getPillarStepIndex('nope', PILLAR_ORDER)).toBe(0);
  });
  it('getLastPillarWithData returns last in order with data', () => {
    const data: Record<string, Partial<PillarRecord>> = {
      restauracion: { checked: [0] },
      olvidar: { checked: [0] },
    };
    expect(getLastPillarWithData(data, PILLAR_ORDER)).toBe('olvidar');
  });
});

describe('computePillarOrderIssues', () => {
  it('empty when no pillar has data', () => {
    expect(computePillarOrderIssues({}, PILLAR_ORDER)).toEqual({ kind: 'empty' });
  });
  it('ok when all previous filled', () => {
    const data: Record<string, Partial<PillarRecord>> = {
      restauracion: { checked: [0] },
      olvidar: { checked: [0] },
    };
    expect(computePillarOrderIssues(data, PILLAR_ORDER)).toEqual({ kind: 'ok' });
  });
  it('gaps when later pillar filled but earlier empty', () => {
    const data: Record<string, Partial<PillarRecord>> = {
      olvidar: { checked: [0] },
    };
    const r = computePillarOrderIssues(data, PILLAR_ORDER);
    expect(r).toEqual({ kind: 'gaps', missingPillars: ['restauracion'] });
  });
});
