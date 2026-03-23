import { HardcodedAuthService } from './hardcoded-auth.service.js';
export function createAuthService(kind, storage) {
    switch (kind) {
        case 'hardcoded':
            return new HardcodedAuthService(storage);
        case 'pure_desire_placeholder':
            return new HardcodedAuthService(storage);
        default:
            return new HardcodedAuthService(storage);
    }
}
