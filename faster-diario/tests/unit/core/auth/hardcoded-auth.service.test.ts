import { beforeEach, describe, expect, it } from 'vitest';
import { HardcodedAuthService } from '../../../../src/core/auth/hardcoded-auth.service.js';
import { createInMemoryStorage } from '../../helpers/in-memory-storage.js';

describe('HardcodedAuthService', () => {
  let storage: ReturnType<typeof createInMemoryStorage>;
  let auth: HardcodedAuthService;

  beforeEach(() => {
    storage = createInMemoryStorage();
    auth = new HardcodedAuthService(storage);
  });

  it('rejects bad password', async () => {
    const r = await auth.signIn('admin', 'wrong');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errorCode).toBe('invalid_credentials');
  });

  it('signs in admin and persists session', async () => {
    const r = await auth.signIn('admin', 'admin1');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.session.user.username).toBe('admin');
      expect(r.session.token).toMatch(/^local-/);
    }
    const session = await auth.getSession();
    expect(session?.user.username).toBe('admin');
  });

  it('signs in with trimmed username case', async () => {
    const r = await auth.signIn('  USER  ', 'user1');
    expect(r.ok).toBe(true);
  });

  it('signOut clears session', async () => {
    await auth.signIn('user', 'user1');
    await auth.signOut();
    expect(await auth.getSession()).toBeNull();
  });

  it('getSession returns null on corrupt JSON', async () => {
    await storage.setItem('auth_session_v1', '{');
    expect(await auth.getSession()).toBeNull();
  });

  it('restoreSession matches getSession', async () => {
    expect(await auth.restoreSession()).toBeNull();
    await auth.signIn('user', 'user1');
    const a = await auth.getSession();
    const b = await auth.restoreSession();
    expect(b).toEqual(a);
  });
});
