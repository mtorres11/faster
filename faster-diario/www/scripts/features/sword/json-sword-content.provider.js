import { fetchJson } from '../../infrastructure/http/fetch-json.js';
const DEFAULT_PROMPTS = {
    write_prompt: 'Rewrite this verse in your own words.',
    observation_prompt: 'What stands out to you in this passage? What is God saying here?',
    reflection_prompt: 'How does this message connect to your life right now?',
    do_prompt: 'What is one action you can take today?',
};
/** Supports nested `scripture` + `steps` (current) or legacy flat `scriptureReference` + `scriptureText`. */
function normalizeDevotional(raw) {
    if (!raw || typeof raw !== 'object')
        return null;
    const r = raw;
    const id = r.id != null ? String(r.id) : '';
    const title = r.title != null ? String(r.title) : '';
    if (!id || !title)
        return null;
    const sc = r.scripture;
    if (sc && typeof sc === 'object') {
        const ref = sc.reference;
        const text = sc.text;
        if (typeof ref === 'string' && typeof text === 'string') {
            const steps = r.steps;
            if (steps && typeof steps === 'object') {
                const st = steps;
                const merged = {
                    write_prompt: typeof st.write_prompt === 'string' ? st.write_prompt : DEFAULT_PROMPTS.write_prompt,
                    observation_prompt: typeof st.observation_prompt === 'string' ? st.observation_prompt : DEFAULT_PROMPTS.observation_prompt,
                    reflection_prompt: typeof st.reflection_prompt === 'string' ? st.reflection_prompt : DEFAULT_PROMPTS.reflection_prompt,
                    do_prompt: typeof st.do_prompt === 'string' ? st.do_prompt : DEFAULT_PROMPTS.do_prompt,
                };
                const tags = Array.isArray(r.tags) ? r.tags.filter((t) => typeof t === 'string') : undefined;
                return {
                    id,
                    title,
                    scripture: { reference: ref, text },
                    steps: merged,
                    tags,
                };
            }
        }
    }
    const legacyRef = r.scriptureReference;
    const legacyText = r.scriptureText;
    if (typeof legacyRef === 'string' && typeof legacyText === 'string') {
        const tags = Array.isArray(r.tags) ? r.tags.filter((t) => typeof t === 'string') : undefined;
        return {
            id,
            title,
            scripture: { reference: legacyRef, text: legacyText },
            steps: { ...DEFAULT_PROMPTS },
            tags,
        };
    }
    return null;
}
/**
 * Fetches devotionals JSON (static file in /data/ for now; swap URL for API later).
 */
export class JsonSwordContentProvider {
    constructor(catalogUrl) {
        this.catalogUrl = catalogUrl;
        this.cache = null;
    }
    async listDevotionals() {
        if (this.cache)
            return this.cache;
        const data = await fetchJson(this.catalogUrl);
        const rawList = Array.isArray(data.devotionals) ? data.devotionals : [];
        const list = [];
        for (const item of rawList) {
            const n = normalizeDevotional(item);
            if (n)
                list.push(n);
        }
        this.cache = list;
        return list;
    }
    async getDevotional(id) {
        const all = await this.listDevotionals();
        return all.find(d => d.id === id) || null;
    }
    clearCache() {
        this.cache = null;
    }
}
