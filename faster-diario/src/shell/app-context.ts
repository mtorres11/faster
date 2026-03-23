import { getAppKeyValueStorage } from '../infrastructure/storage/storage.factory.js';
import { createAuthService } from '../core/auth/auth.factory.js';
import { LocalUserPreferencesRepository } from '../core/profile/local-user-preferences.repository.js';
import { JsonSwordContentProvider } from '../features/sword/json-sword-content.provider.js';
import { LocalSwordSessionRepository } from '../features/sword/local-sword-session.repository.js';
import { LocalSwordQueueRepository } from '../features/sword/local-sword-queue.repository.js';
import { JsonPodcastCatalogProvider } from '../features/podcasts/json-podcast-catalog.provider.js';
import { StubBibleContentProvider } from '../features/bible/stub-bible-content.provider.js';
import { NoopRecommendationsService } from '../features/ai/noop-recommendations.service.js';

/** Relative to index.html (www/ in Capacitor). */
export const DATA_SWORD_CATALOG = 'data/sword-devotionals.json';
export const DATA_PODCAST_CATALOG = 'data/podcasts-catalog.json';

export function createAppContext() {
  const storage = getAppKeyValueStorage();
  const auth = createAuthService('hardcoded', storage);
  const userPreferences = new LocalUserPreferencesRepository(storage);
  const swordContent = new JsonSwordContentProvider(DATA_SWORD_CATALOG);
  const swordSessions = new LocalSwordSessionRepository(storage);
  const swordQueue = new LocalSwordQueueRepository(storage);
  const podcastCatalog = new JsonPodcastCatalogProvider(DATA_PODCAST_CATALOG);
  const bibleContent = new StubBibleContentProvider();
  const recommendations = new NoopRecommendationsService();

  return {
    storage,
    auth,
    userPreferences,
    swordContent,
    swordSessions,
    swordQueue,
    podcastCatalog,
    bibleContent,
    recommendations,
  };
}

export type AppContext = ReturnType<typeof createAppContext>;
