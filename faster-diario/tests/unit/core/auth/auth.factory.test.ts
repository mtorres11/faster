import { describe, expect, it } from 'vitest';
import type { AuthProviderKind } from '../../../../src/core/auth/auth.factory.js';
import { createAuthService } from '../../../../src/core/auth/auth.factory.js';
import { HardcodedAuthService } from '../../../../src/core/auth/hardcoded-auth.service.js';
import { createInMemoryStorage } from '../../helpers/in-memory-storage.js';

describe('createAuthService', () => {
  it('returns HardcodedAuthService for hardcoded and placeholder kinds', () => {
    const s = createInMemoryStorage();
    expect(createAuthService('hardcoded', s)).toBeInstanceOf(HardcodedAuthService);
    expect(createAuthService('pure_desire_placeholder', s)).toBeInstanceOf(HardcodedAuthService);
  });

  it('default branch still returns hardcoded for unknown kind at runtime', () => {
    const s = createInMemoryStorage();
    const k = 'unknown-provider' as unknown as AuthProviderKind;
    expect(createAuthService(k, s)).toBeInstanceOf(HardcodedAuthService);
  });
});
