import { describe, expect, it } from 'vitest';
import { StubBibleContentProvider } from '../../../../src/features/bible/stub-bible-content.provider.js';

describe('StubBibleContentProvider', () => {
  it('lists stub versions and returns placeholder passage', async () => {
    const p = new StubBibleContentProvider();
    const v = await p.listVersions();
    expect(v).toEqual([
      { id: 'stub_en', name: 'Stub English' },
      { id: 'stub_es', name: 'Stub Español' },
    ]);
    const passage = await p.getPassage('stub_en', 'John 3:16');
    expect(passage?.reference).toBe('John 3:16');
    expect(passage?.text).toContain('Bible text');
  });
});
