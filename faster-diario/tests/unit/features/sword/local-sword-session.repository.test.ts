import { beforeEach, describe, expect, it } from 'vitest';
import { LocalSwordSessionRepository } from '../../../../src/features/sword/local-sword-session.repository.js';
import type { SwordSessionRecord } from '../../../../src/features/sword/sword.types.js';
import { createInMemoryStorage } from '../../helpers/in-memory-storage.js';

function sampleSession(id: string): SwordSessionRecord {
  return {
    id,
    devotionalId: 'd1',
    createdAt: 't0',
    updatedAt: 't1',
    steps: { scripture: '', write: '', observation: '', reflection: '', do: '' },
  };
}

describe('LocalSwordSessionRepository', () => {
  let storage: ReturnType<typeof createInMemoryStorage>;
  let repo: LocalSwordSessionRepository;

  beforeEach(() => {
    storage = createInMemoryStorage();
    repo = new LocalSwordSessionRepository(storage);
  });

  it('starts empty', async () => {
    expect(await repo.list()).toEqual([]);
  });

  it('upsert insert and update', async () => {
    await repo.upsert(sampleSession('a'));
    expect((await repo.list()).map(s => s.id)).toEqual(['a']);
    const u = { ...sampleSession('a'), updatedAt: 't2' };
    await repo.upsert(u);
    expect((await repo.get('a'))?.updatedAt).toBe('t2');
  });

  it('get returns null when missing', async () => {
    expect(await repo.get('nope')).toBeNull();
  });

  it('delete filters id', async () => {
    await repo.upsert(sampleSession('a'));
    await repo.upsert(sampleSession('b'));
    await repo.delete('a');
    expect((await repo.list()).map(s => s.id)).toEqual(['b']);
  });

  it('tolerates corrupt storage', async () => {
    await storage.setItem('sword_sessions_v1', '[');
    expect(await repo.list()).toEqual([]);
  });
});
