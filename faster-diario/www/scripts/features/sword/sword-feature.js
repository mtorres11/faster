import { HttpJsonError } from '../../infrastructure/http/fetch-json.js';
const STEP_ORDER = ['scripture', 'write', 'observation', 'reflection', 'do'];
const STEP_LABEL = {
    scripture: 'S — Scripture',
    write: 'W — Write',
    observation: 'O — Observation',
    reflection: 'R — Reflection',
    do: 'D — Do',
};
function getPromptForStep(dev, key) {
    const s = dev.steps;
    switch (key) {
        case 'write':
            return s.write_prompt || '';
        case 'observation':
            return s.observation_prompt || '';
        case 'reflection':
            return s.reflection_prompt || '';
        case 'do':
            return s.do_prompt || '';
        default:
            return '';
    }
}
function emptySteps() {
    return {
        scripture: '',
        write: '',
        observation: '',
        reflection: '',
        do: '',
    };
}
function uid() {
    return 'sw_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}
export function bootstrapSwordFeature(ctx) {
    const errEl = document.getElementById('sword-error');
    const listEl = document.getElementById('sword-list');
    const wizardEl = document.getElementById('sword-wizard');
    const stepContent = document.getElementById('sword-step-content');
    const btnBack = document.getElementById('sword-back');
    const btnNext = document.getElementById('sword-next');
    const btnSave = document.getElementById('sword-save');
    const sessionsEl = document.getElementById('sword-sessions');
    let catalog = [];
    let current = null;
    let session = null;
    let stepIndex = 0;
    function showError(msg) {
        if (errEl) {
            errEl.textContent = msg;
            errEl.classList.remove('hidden');
        }
    }
    function clearError() {
        if (errEl) {
            errEl.textContent = '';
            errEl.classList.add('hidden');
        }
    }
    function showList() {
        if (wizardEl)
            wizardEl.classList.add('hidden');
        if (listEl)
            listEl.classList.remove('hidden');
        current = null;
        session = null;
    }
    function renderStep() {
        if (!stepContent || !current || !session)
            return;
        const key = STEP_ORDER[stepIndex];
        const label = STEP_LABEL[key];
        let html = '<h3>' + escapeHtml(label) + '</h3>';
        if (key === 'scripture') {
            html +=
                '<p class="sword-ref"><strong>' +
                    escapeHtml(current.scripture.reference) +
                    '</strong></p>';
            html += '<div class="sword-scripture">' + escapeHtml(current.scripture.text) + '</div>';
            html +=
                '<label class="sword-label">Notes (optional)<textarea id="sword-field" rows="4">' +
                    escapeHtml(session.steps.scripture) +
                    '</textarea></label>';
        }
        else {
            const prompt = getPromptForStep(current, key);
            if (prompt) {
                html += '<p class="sword-prompt">' + escapeHtml(prompt) + '</p>';
            }
            html +=
                '<label class="sword-label"><textarea id="sword-field" rows="8">' +
                    escapeHtml(session.steps[key]) +
                    '</textarea></label>';
        }
        stepContent.innerHTML = html;
        const field = document.getElementById('sword-field');
        if (field) {
            field.addEventListener('input', () => {
                if (!session)
                    return;
                if (key === 'scripture')
                    session.steps.scripture = field.value;
                else
                    session.steps[key] = field.value;
            });
        }
        if (btnBack)
            btnBack.style.display = stepIndex === 0 ? 'none' : '';
        if (btnNext)
            btnNext.style.display = stepIndex >= STEP_ORDER.length - 1 ? 'none' : '';
        if (btnSave)
            btnSave.style.display = stepIndex >= STEP_ORDER.length - 1 ? '' : 'none';
    }
    function openWizard(dev) {
        current = dev;
        const now = new Date().toISOString();
        session = {
            id: uid(),
            devotionalId: dev.id,
            createdAt: now,
            updatedAt: now,
            steps: emptySteps(),
        };
        stepIndex = 0;
        if (listEl)
            listEl.classList.add('hidden');
        if (wizardEl)
            wizardEl.classList.remove('hidden');
        clearError();
        renderStep();
    }
    async function loadCatalog() {
        clearError();
        try {
            catalog = await ctx.swordContent.listDevotionals();
            if (listEl) {
                listEl.innerHTML = catalog
                    .map(d => {
                    const tags = d.tags && d.tags.length
                        ? '<span class="sword-tags">' +
                            d.tags.map(t => escapeHtml(t)).join(' · ') +
                            '</span>'
                        : '';
                    return ('<button type="button" class="sword-pick" data-id="' +
                        escapeHtml(d.id) +
                        '"><span class="sword-pick-title">' +
                        escapeHtml(d.title) +
                        '</span>' +
                        tags +
                        '</button>');
                })
                    .join(' ');
                listEl.querySelectorAll('.sword-pick').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.getAttribute('data-id');
                        const dev = catalog.find(x => x.id === id);
                        if (dev)
                            openWizard(dev);
                    });
                });
            }
        }
        catch (e) {
            const msg = e instanceof HttpJsonError
                ? e.message
                : e instanceof Error
                    ? e.message
                    : 'Failed to load devotionals.';
            showError(msg);
        }
    }
    async function renderSessionList() {
        if (!sessionsEl)
            return;
        const rows = await ctx.swordSessions.list();
        if (rows.length === 0) {
            sessionsEl.innerHTML = '<p class="description">No saved sessions yet.</p>';
            return;
        }
        const titles = new Map(catalog.map(d => [d.id, d.title]));
        sessionsEl.innerHTML = rows
            .slice()
            .reverse()
            .map(r => '<div class="sword-session-row" data-id="' +
            escapeHtml(r.id) +
            '"><span>' +
            escapeHtml(titles.get(r.devotionalId) || r.devotionalId) +
            '</span><time>' +
            escapeHtml(r.updatedAt.slice(0, 10)) +
            '</time></div>')
            .join('');
        sessionsEl.querySelectorAll('.sword-session-row').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.getAttribute('data-id');
                if (!id)
                    return;
                ctx.swordSessions.get(id).then(rec => {
                    if (!rec)
                        return;
                    ctx.swordContent.getDevotional(rec.devotionalId).then(dev => {
                        if (!dev)
                            return;
                        current = dev;
                        session = rec;
                        stepIndex = 0;
                        if (listEl)
                            listEl.classList.add('hidden');
                        if (wizardEl)
                            wizardEl.classList.remove('hidden');
                        renderStep();
                    });
                });
            });
        });
    }
    btnBack?.addEventListener('click', () => {
        if (stepIndex <= 0)
            return;
        stepIndex -= 1;
        renderStep();
    });
    btnNext?.addEventListener('click', () => {
        if (!session)
            return;
        const field = document.getElementById('sword-field');
        const key = STEP_ORDER[stepIndex];
        if (field && session.steps[key] !== undefined) {
            session.steps[key] = field.value;
        }
        if (stepIndex >= STEP_ORDER.length - 1)
            return;
        stepIndex += 1;
        session.updatedAt = new Date().toISOString();
        renderStep();
    });
    btnSave?.addEventListener('click', async () => {
        if (!session)
            return;
        const field = document.getElementById('sword-field');
        const key = STEP_ORDER[stepIndex];
        if (field && session.steps[key] !== undefined) {
            session.steps[key] = field.value;
        }
        session.updatedAt = new Date().toISOString();
        try {
            await ctx.swordSessions.upsert(session);
            await ctx.swordQueue.enqueue({
                id: uid(),
                kind: 'sword_session_sync',
                sessionId: session.id,
                createdAt: new Date().toISOString(),
            });
            clearError();
            showList();
            await renderSessionList();
        }
        catch (e) {
            showError(e instanceof Error ? e.message : 'Save failed.');
        }
    });
    loadCatalog().then(() => renderSessionList());
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
