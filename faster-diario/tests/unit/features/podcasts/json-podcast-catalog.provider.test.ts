import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JsonPodcastCatalogProvider } from '../../../../src/features/podcasts/json-podcast-catalog.provider.js';

describe('JsonPodcastCatalogProvider', () => {
  const g = globalThis as typeof globalThis & { fetch: typeof fetch };
  const original = g.fetch;

  beforeEach(() => {
    g.fetch = vi.fn() as unknown as typeof fetch;
  });
  afterEach(() => {
    g.fetch = original;
  });

  function mockJson(body: unknown) {
    (g.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
  }

  it('listEpisodes reads episodes and caches', async () => {
    mockJson({ version: 1, episodes: [{ id: 'e1', title: 'A', audioUrl: 'a.mp3' }] });
    const p = new JsonPodcastCatalogProvider('https://x.test/pod.json');
    const a = await p.listEpisodes();
    const b = await p.listEpisodes();
    expect(a).toHaveLength(1);
    expect(a).toBe(b);
    expect((g.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it('listEpisodes uses [] when episodes missing', async () => {
    mockJson({ version: 1 });
    const p = new JsonPodcastCatalogProvider('https://x.test/empty.json');
    expect(await p.listEpisodes()).toEqual([]);
  });

  it('getDailyEpisode prefers dailyEpisodeId, else first', async () => {
    mockJson({
      version: 1,
      dailyEpisodeId: 'e2',
      episodes: [
        { id: 'e1', title: 'First', audioUrl: '1.mp3' },
        { id: 'e2', title: 'Daily', audioUrl: '2.mp3' },
      ],
    });
    const p = new JsonPodcastCatalogProvider('https://x.test/d.json');
    const d = await p.getDailyEpisode();
    expect(d?.id).toBe('e2');
  });

  it('getDailyEpisode falls back to first when daily id not found', async () => {
    mockJson({
      version: 1,
      dailyEpisodeId: 'missing',
      episodes: [{ id: 'e1', title: 'F', audioUrl: '1.mp3' }],
    });
    const p = new JsonPodcastCatalogProvider('https://x.test/m.json');
    const d = await p.getDailyEpisode();
    expect(d?.id).toBe('e1');
  });
});
