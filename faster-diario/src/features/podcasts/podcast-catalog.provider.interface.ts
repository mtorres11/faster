export interface PodcastEpisodeRef {
  id: string;
  title: string;
  topic?: string;
  audioUrl: string;
  publishedAt?: string;
}

export interface IPodcastCatalogProvider {
  listEpisodes(): Promise<PodcastEpisodeRef[]>;
  getDailyEpisode(): Promise<PodcastEpisodeRef | null>;
}
