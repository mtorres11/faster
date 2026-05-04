import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JsonSwordContentProvider } from '../../../../src/features/sword/json-sword-content.provider.js';

describe('JsonSwordContentProvider', () => {
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

  it('normalizes nested scripture + steps and filters invalid rows', async () => {
    mockJson({
      devotionals: [
        {
          id: '1',
          title: 'T',
          scripture: { reference: 'Jn 1:1', text: 'In the beginning' },
          steps: {
            write_prompt: 'W',
            observation_prompt: 'O',
            reflection_prompt: 'R',
            do_prompt: 'D',
          },
        },
        { id: '', title: 'x' },
        {
          id: '2',
          title: 'Legacy',
          scriptureReference: 'Ps 1',
          scriptureText: 'Blessed',
        },
      ],
    });
    const p = new JsonSwordContentProvider('https://x.test/sword.json');
    const list = await p.listDevotionals();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe('1');
    expect(list[0].steps.write_prompt).toBe('W');
    expect(list[1].scripture.reference).toBe('Ps 1');
    const one = await p.getDevotional('1');
    expect(one?.title).toBe('T');
  });

  it('uses default prompts when steps missing in nested form', async () => {
    mockJson({
      devotionals: [
        {
          id: '1',
          title: 'T',
          scripture: { reference: 'A', text: 'B' },
          steps: {},
        },
      ],
    });
    const p = new JsonSwordContentProvider('https://x.test/a.json');
    const [d] = await p.listDevotionals();
    expect(d.steps.write_prompt.length).toBeGreaterThan(0);
  });

  it('caches list until clearCache', async () => {
    const body = { devotionals: [] };
    (g.fetch as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
      )
    );
    const p = new JsonSwordContentProvider('https://x.test/c.json');
    await p.listDevotionals();
    await p.listDevotionals();
    expect((g.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
    p.clearCache();
    await p.listDevotionals();
    expect((g.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });
});
