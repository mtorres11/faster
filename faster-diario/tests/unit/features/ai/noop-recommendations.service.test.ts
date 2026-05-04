import { describe, expect, it } from 'vitest';
import { NoopRecommendationsService } from '../../../../src/features/ai/noop-recommendations.service.js';

describe('NoopRecommendationsService', () => {
  it('returns empty bundle', async () => {
    const s = new NoopRecommendationsService();
    const r = await s.getRecommendations({ fasterSummary: 'x' });
    expect(r).toEqual({ devotionalsIds: [], podcastEpisodeIds: [], scriptureReferences: [] });
  });
});
