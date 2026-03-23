import type { IRecommendationsService, RecommendationBundle } from './recommendations.service.interface.js';

export class NoopRecommendationsService implements IRecommendationsService {
  async getRecommendations(_context: { fasterSummary?: string }): Promise<RecommendationBundle> {
    return { devotionalsIds: [], podcastEpisodeIds: [], scriptureReferences: [] };
  }
}
