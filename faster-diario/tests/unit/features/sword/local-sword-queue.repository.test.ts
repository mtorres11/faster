import { beforeEach, describe, expect, it } from 'vitest';
import { LocalSwordQueueRepository } from '../../../../src/features/sword/local-sword-queue.repository.js';
import { createInMemoryStorage } from '../../helpers/in-memory-storage.js';

describe('LocalSwordQueueRepository', () => {
  let storage: ReturnType<typeof createInMemoryStorage>;
  let repo: LocalSwordQueueRepository;

  beforeEach(() => {
    storage = createInMemoryStorage();
    repo = new LocalSwordQueueRepository(storage);
  });

  it('enqueue assigns id and default attempts', async () => {
    await repo.enqueue({
      kind: 'sword_session_sync',
      sessionId: 's1',
      createdAt: 'c',
    });
    const all = await repo.peekAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBeTruthy();
    expect(all[0].attempts).toBe(0);
  });

  it('enqueue respects explicit id and attempts', async () => {
    await repo.enqueue({
      id: 'q1',
      kind: 'sword_session_sync',
      sessionId: 's1',
      createdAt: 'c',
      attempts: 2,
    });
    const [q] = await repo.peekAll();
    expect(q.id).toBe('q1');
    expect(q.attempts).toBe(2);
  });

  it('update and remove', async () => {
    await repo.enqueue({
      id: 'x',
      kind: 'sword_session_sync',
      sessionId: 's1',
      createdAt: 'c',
    });
    await repo.update({ ...((await repo.peekAll())[0]), attempts: 3 });
    expect((await repo.peekAll())[0].attempts).toBe(3);
    await repo.remove('x');
    expect(await repo.peekAll()).toEqual([]);
  });

  it('flushPending returns zero counts (noop backend)', async () => {
    await expect(repo.flushPending()).resolves.toEqual({ processed: 0, failed: 0 });
  });

  it('tolerates corrupt storage', async () => {
    await storage.setItem('sword_queue_v1', 'null');
    expect(await repo.peekAll()).toEqual([]);
  });
});
