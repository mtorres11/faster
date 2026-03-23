/**
 * External AI recommendations (FASTER-aware). Implementation is remote-only.
 */
export interface RecommendationBundle {
  devotionalsIds: string[];
  podcastEpisodeIds: string[];
  scriptureReferences: string[];
}

export interface IRecommendationsService {
  getRecommendations(context: { fasterSummary?: string }): Promise<RecommendationBundle>;
}
