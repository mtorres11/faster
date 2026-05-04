import { beforeEach, describe, expect, it } from 'vitest';
import { LocalUserPreferencesRepository } from '../../../../src/core/profile/local-user-preferences.repository.js';
import { createInMemoryStorage } from '../../helpers/in-memory-storage.js';

describe('LocalUserPreferencesRepository', () => {
  let storage: ReturnType<typeof createInMemoryStorage>;
  let repo: LocalUserPreferencesRepository;

  beforeEach(() => {
    storage = createInMemoryStorage();
    repo = new LocalUserPreferencesRepository(storage);
  });

  it('load returns defaults when empty', async () => {
    const p = await repo.load();
    expect(p.version).toBe(1);
    expect(p.data).toEqual({});
  });

  it('load recovers from bad JSON', async () => {
    await storage.setItem('user_preferences_v1', 'not-json');
    const p = await repo.load();
    expect(p.version).toBe(1);
  });

  it('load recovers from missing version', async () => {
    await storage.setItem('user_preferences_v1', JSON.stringify({ data: {} }));
    const p = await repo.load();
    expect(p.version).toBe(1);
  });

  it('save and load roundtrip', async () => {
    const prefs = { version: 2, data: { theme: 'dark' } };
    await repo.save(prefs);
    const p = await repo.load();
    expect(p.version).toBe(2);
    expect(p.data).toEqual({ theme: 'dark' });
  });
});
