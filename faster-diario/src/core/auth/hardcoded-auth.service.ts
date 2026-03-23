import type { IKeyValueStorage } from '../../infrastructure/storage/key-value-storage.interface.js';
import type { AuthSession, AuthUser, AuthResult } from './auth.types.js';
import type { IAuthService } from './auth.service.interface.js';

const SESSION_KEY = 'auth_session_v1';

const USERS: Record<string, { password: string; user: AuthUser }> = {
  admin: { password: 'admin1', user: { id: '1', username: 'admin', role: 'admin' } },
  user: { password: 'user1', user: { id: '2', username: 'user', role: 'user' } },
};

function makeToken(user: AuthUser): string {
  return 'local-' + user.id + '-' + Date.now().toString(36);
}

export class HardcodedAuthService implements IAuthService {
  constructor(private readonly storage: IKeyValueStorage) {}

  async signIn(username: string, password: string): Promise<AuthResult> {
    const key = (username || '').trim().toLowerCase();
    const row = USERS[key];
    if (!row || row.password !== password) {
      return { ok: false, errorCode: 'invalid_credentials', message: 'Invalid username or password.' };
    }
    const session: AuthSession = {
      user: { ...row.user, username: key === 'admin' ? 'admin' : 'user' },
      token: makeToken(row.user),
      issuedAt: new Date().toISOString(),
    };
    await this.storage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  async signOut(): Promise<void> {
    await this.storage.removeItem(SESSION_KEY);
  }

  async getSession(): Promise<AuthSession | null> {
    const raw = await this.storage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  async restoreSession(): Promise<AuthSession | null> {
    return this.getSession();
  }
}
