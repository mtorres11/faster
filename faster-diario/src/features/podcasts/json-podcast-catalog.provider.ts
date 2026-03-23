import { fetchJson } from '../../infrastructure/http/fetch-json.js';
import type { IPodcastCatalogProvider, PodcastEpisodeRef } from './podcast-catalog.provider.interface.js';

interface CatalogFile {
  version: number;
  episodes: PodcastEpisodeRef[];
  dailyEpisodeId?: string;
}

/**
 * Loads podcast metadata from JSON (replace with RSS/API later).
 */
export class JsonPodcastCatalogProvider implements IPodcastCatalogProvider {
  private cache: PodcastEpisodeRef[] | null = null;
  private dailyId: string | null = null;

  constructor(private readonly catalogUrl: string) {}

  async listEpisodes(): Promise<PodcastEpisodeRef[]> {
    if (this.cache) return this.cache;
    const data = await fetchJson<CatalogFile>(this.catalogUrl);
    this.cache = Array.isArray(data.episodes) ? data.episodes : [];
    this.dailyId = data.dailyEpisodeId || null;
    return this.cache;
  }

  async getDailyEpisode(): Promise<PodcastEpisodeRef | null> {
    const eps = await this.listEpisodes();
    if (this.dailyId) {
      const d = eps.find(e => e.id === this.dailyId);
      if (d) return d;
    }
    return eps[0] || null;
  }
}
