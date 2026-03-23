import type { IKeyValueStorage } from '../../infrastructure/storage/key-value-storage.interface.js';
import type { IAuthService } from './auth.service.interface.js';
import { HardcodedAuthService } from './hardcoded-auth.service.js';

export type AuthProviderKind = 'hardcoded' | 'pure_desire_placeholder';

export function createAuthService(
  kind: AuthProviderKind,
  storage: IKeyValueStorage
): IAuthService {
  switch (kind) {
    case 'hardcoded':
      return new HardcodedAuthService(storage);
    case 'pure_desire_placeholder':
      return new HardcodedAuthService(storage);
    default:
      return new HardcodedAuthService(storage);
  }
}
