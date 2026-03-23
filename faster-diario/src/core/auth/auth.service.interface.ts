import type { AuthResult, AuthSession } from './auth.types.js';

/**
 * Pluggable authentication (hardcoded now; Pure Desire / OAuth later).
 */
export interface IAuthService {
  signIn(username: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  /** Restore session from persisted storage if valid */
  restoreSession(): Promise<AuthSession | null>;
}
