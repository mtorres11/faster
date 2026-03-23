import { bootstrapFasterApp, goToFasterIntro, performFasterBack } from '../features/faster/faster-app.js';
import { bootstrapSwordFeature } from '../features/sword/sword-feature.js';
import { bootstrapPodcastsFeature } from '../features/podcasts/podcasts-feature.js';
import { createAppContext } from './app-context.js';
let authenticatedAppStarted = false;
function closeOptionsMenu() {
    const optionsDropdown = document.getElementById('options-dropdown');
    const optionsTrigger = document.getElementById('options-trigger');
    if (optionsDropdown)
        optionsDropdown.hidden = true;
    if (optionsTrigger)
        optionsTrigger.setAttribute('aria-expanded', 'false');
}
function showFeature(id) {
    const targetId = id === 'landing' ? 'view-landing' : 'view-' + id;
    document.querySelectorAll('.feature-view').forEach(el => {
        el.classList.toggle('active', el.id === targetId);
    });
    updateFloatingBackVisibility();
}
function showLanding() {
    showFeature('landing');
}
/** Floating back: hidden on landing; visible on any feature (FASTER, SWORD, …). */
function updateFloatingBackVisibility() {
    const btn = document.getElementById('floating-back');
    if (!btn)
        return;
    const onLanding = document.getElementById('view-landing')?.classList.contains('active');
    btn.classList.toggle('hidden', !!onLanding);
}
function handleFloatingBack() {
    if (performFasterBack())
        return;
    if (document.getElementById('view-landing')?.classList.contains('active'))
        return;
    showLanding();
}
async function bootstrapProfile(ctx) {
    const el = document.getElementById('profile-placeholder');
    if (!el)
        return;
    const prefs = await ctx.userPreferences.load();
    el.textContent =
        'Preferences (v' + prefs.version + ') will be configured here. ' + JSON.stringify(prefs.data);
}
function wireLandingAndMenu(ctx) {
    document.getElementById('landing-faster')?.addEventListener('click', () => {
        showFeature('faster');
        goToFasterIntro();
    });
    document.getElementById('landing-sword')?.addEventListener('click', () => {
        showFeature('sword');
    });
    document.getElementById('landing-devotionals')?.addEventListener('click', () => {
        showFeature('podcasts');
    });
    const optHome = document.getElementById('opt-home');
    optHome?.addEventListener('click', () => {
        showLanding();
        closeOptionsMenu();
    }, true);
    const optProfile = document.getElementById('opt-profile');
    optProfile?.addEventListener('click', () => {
        showFeature('profile');
        closeOptionsMenu();
    }, true);
    const optLogout = document.getElementById('opt-logout');
    optLogout?.addEventListener('click', async () => {
        await ctx.auth.signOut();
        location.reload();
    }, true);
    document.getElementById('floating-back')?.addEventListener('click', handleFloatingBack);
}
function showLogin() {
    document.getElementById('view-login')?.classList.remove('hidden');
    document.getElementById('view-app')?.classList.add('hidden');
}
function showApp() {
    document.getElementById('view-login')?.classList.add('hidden');
    document.getElementById('view-app')?.classList.remove('hidden');
}
async function tryStart() {
    const ctx = createAppContext();
    const session = await ctx.auth.restoreSession();
    if (!session) {
        showLogin();
        wireLogin(ctx);
        return;
    }
    showApp();
    startAuthenticatedApp(ctx);
}
function wireLogin(ctx) {
    const form = document.getElementById('login-form');
    const btn = document.getElementById('login-submit');
    const err = document.getElementById('login-error');
    if (!form || !btn)
        return;
    /** Client-only sign-in (hardcoded users). Never GET/POST the static file server — avoids 501 on POST. */
    async function attemptLogin() {
        if (err) {
            err.textContent = '';
            err.classList.add('hidden');
        }
        const fd = new FormData(form);
        const username = String(fd.get('username') || '').trim();
        const password = String(fd.get('password') || '');
        try {
            const result = await ctx.auth.signIn(username, password);
            if (result.ok === false) {
                if (err) {
                    err.textContent = result.message;
                    err.classList.remove('hidden');
                }
                return;
            }
            showApp();
            startAuthenticatedApp(ctx);
            stripSensitiveQueryFromUrl();
            try {
                history.replaceState(null, '', location.pathname + location.hash);
            }
            catch {
                /* ignore */
            }
        }
        catch (signInErr) {
            const msg = signInErr instanceof Error ? signInErr.message : 'Sign in failed. Try again.';
            if (err) {
                err.textContent = msg;
                err.classList.remove('hidden');
            }
        }
    }
    btn.addEventListener('click', () => void attemptLogin());
    form.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            void attemptLogin();
        }
    });
}
function startAuthenticatedApp(ctx) {
    if (authenticatedAppStarted)
        return;
    authenticatedAppStarted = true;
    window.addEventListener('app:go-landing', showLanding);
    /** Show landing first so it always appears even if later bootstrap throws. */
    showLanding();
    bootstrapFasterApp();
    bootstrapSwordFeature(ctx);
    bootstrapPodcastsFeature(ctx);
    wireLandingAndMenu(ctx);
    void bootstrapProfile(ctx);
}
/** Remove leaked ?username=&password= from URL bar (e.g. after a mistaken GET submit). */
function stripSensitiveQueryFromUrl() {
    if (typeof location === 'undefined' || !location.search)
        return;
    const params = new URLSearchParams(location.search);
    if (params.has('username') || params.has('password')) {
        try {
            history.replaceState(null, '', location.pathname + location.hash);
        }
        catch {
            /* ignore */
        }
    }
}
void (function initShell() {
    stripSensitiveQueryFromUrl();
    void tryStart();
})();
