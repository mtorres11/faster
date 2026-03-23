const SESSION_KEY = 'auth_session_v1';
const USERS = {
    admin: { password: 'admin1', user: { id: '1', username: 'admin', role: 'admin' } },
    user: { password: 'user1', user: { id: '2', username: 'user', role: 'user' } },
};
function makeToken(user) {
    return 'local-' + user.id + '-' + Date.now().toString(36);
}
export class HardcodedAuthService {
    constructor(storage) {
        this.storage = storage;
    }
    async signIn(username, password) {
        const key = (username || '').trim().toLowerCase();
        const row = USERS[key];
        if (!row || row.password !== password) {
            return { ok: false, errorCode: 'invalid_credentials', message: 'Invalid username or password.' };
        }
        const session = {
            user: { ...row.user, username: key === 'admin' ? 'admin' : 'user' },
            token: makeToken(row.user),
            issuedAt: new Date().toISOString(),
        };
        await this.storage.setItem(SESSION_KEY, JSON.stringify(session));
        return { ok: true, session };
    }
    async signOut() {
        await this.storage.removeItem(SESSION_KEY);
    }
    async getSession() {
        const raw = await this.storage.getItem(SESSION_KEY);
        if (!raw)
            return null;
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    async restoreSession() {
        return this.getSession();
    }
}
