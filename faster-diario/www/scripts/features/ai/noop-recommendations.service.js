export class NoopRecommendationsService {
    async getRecommendations(_context) {
        return { devotionalsIds: [], podcastEpisodeIds: [], scriptureReferences: [] };
    }
}
