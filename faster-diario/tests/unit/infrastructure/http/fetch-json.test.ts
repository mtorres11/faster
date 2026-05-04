import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpJsonError, fetchJson } from '../../../../src/infrastructure/http/fetch-json.js';

describe('fetchJson', () => {
  const g = globalThis as typeof globalThis & { fetch: typeof fetch };
  const original = g.fetch;

  beforeEach(() => {
    g.fetch = vi.fn() as unknown as typeof fetch;
  });
  afterEach(() => {
    g.fetch = original;
  });

  it('returns parsed JSON on success', async () => {
    (g.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ a: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    await expect(fetchJson<{ a: number }>('https://x.test/data')).resolves.toEqual({ a: 1 });
  });

  it('throws HttpJsonError on non-ok response', async () => {
    (g.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('nope', { status: 404 }));
    try {
      await fetchJson('https://x.test/missing');
      expect.fail('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpJsonError);
      const err = e as HttpJsonError;
      expect(err.status).toBe(404);
    }
  });

  it('throws on invalid JSON body', async () => {
    (g.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('not-json{', { status: 200 }));
    await expect(fetchJson('https://x.test/bad')).rejects.toThrow(HttpJsonError);
  });

  it('throws on network error', async () => {
    (g.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('offline'));
    await expect(fetchJson('https://x.test/nope')).rejects.toThrow(/Network error/);
  });
});
