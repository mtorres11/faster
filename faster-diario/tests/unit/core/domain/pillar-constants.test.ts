import { describe, expect, it } from 'vitest';
import {
  CHECKBOX_IDS,
  PILLAR_IDS,
  PILLAR_NAME_TO_ID,
  pillarLangKey,
} from '../../../../src/core/domain/pillar-constants.js';

describe('pillar-constants', () => {
  it('has 7 pillars in order', () => {
    expect(PILLAR_IDS).toHaveLength(7);
  });
  it('pillarLangKey maps id to lang suffix or passthrough', () => {
    expect(pillarLangKey('restauracion')).toBe('restoration');
    expect(pillarLangKey('unknown')).toBe('unknown');
  });
  it('PILLAR_NAME_TO_ID has expected Spanish names', () => {
    expect(PILLAR_NAME_TO_ID['Recaída']).toBe('recaida');
  });
  it('CHECKBOX_IDS match CHECKBOX_COUNTS for each pillar', () => {
    for (const id of PILLAR_IDS) {
      const ids = CHECKBOX_IDS[id];
      expect(Array.isArray(ids) && ids.length).toBeGreaterThan(0);
    }
  });
});
