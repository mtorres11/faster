export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  /** Opaque token placeholder for future OAuth / Pure Desire */
  token: string;
  issuedAt: string;
}

export type AuthResult =
  | { ok: true; session: AuthSession }
  | { ok: false; errorCode: 'invalid_credentials' | 'network' | 'unknown'; message: string };
