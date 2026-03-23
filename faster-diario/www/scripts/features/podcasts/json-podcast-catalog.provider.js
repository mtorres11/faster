import { fetchJson } from '../../infrastructure/http/fetch-json.js';
/**
 * Loads podcast metadata from JSON (replace with RSS/API later).
 */
export class JsonPodcastCatalogProvider {
    constructor(catalogUrl) {
        this.catalogUrl = catalogUrl;
        this.cache = null;
        this.dailyId = null;
    }
    async listEpisodes() {
        if (this.cache)
            return this.cache;
        const data = await fetchJson(this.catalogUrl);
        this.cache = Array.isArray(data.episodes) ? data.episodes : [];
        this.dailyId = data.dailyEpisodeId || null;
        return this.cache;
    }
    async getDailyEpisode() {
        const eps = await this.listEpisodes();
        if (this.dailyId) {
            const d = eps.find(e => e.id === this.dailyId);
            if (d)
                return d;
        }
        return eps[0] || null;
    }
}
