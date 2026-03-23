import { fetchJson } from '../../infrastructure/http/fetch-json.js';
import type { ISwordContentProvider } from './sword-content.provider.interface.js';
import type {
  SwordDevotionalDTO,
  SwordDevotionalsFile,
  SwordStepPrompts,
} from './sword.types.js';

const DEFAULT_PROMPTS: SwordStepPrompts = {
  write_prompt: 'Rewrite this verse in your own words.',
  observation_prompt: 'What stands out to you in this passage? What is God saying here?',
  reflection_prompt: 'How does this message connect to your life right now?',
  do_prompt: 'What is one action you can take today?',
};

/** Supports nested `scripture` + `steps` (current) or legacy flat `scriptureReference` + `scriptureText`. */
function normalizeDevotional(raw: unknown): SwordDevotionalDTO | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  const title = r.title != null ? String(r.title) : '';
  if (!id || !title) return null;

  const sc = r.scripture;
  if (sc && typeof sc === 'object') {
    const ref = (sc as Record<string, unknown>).reference;
    const text = (sc as Record<string, unknown>).text;
    if (typeof ref === 'string' && typeof text === 'string') {
      const steps = r.steps;
      if (steps && typeof steps === 'object') {
        const st = steps as Record<string, unknown>;
        const merged: SwordStepPrompts = {
          write_prompt: typeof st.write_prompt === 'string' ? st.write_prompt : DEFAULT_PROMPTS.write_prompt,
          observation_prompt:
            typeof st.observation_prompt === 'string' ? st.observation_prompt : DEFAULT_PROMPTS.observation_prompt,
          reflection_prompt:
            typeof st.reflection_prompt === 'string' ? st.reflection_prompt : DEFAULT_PROMPTS.reflection_prompt,
          do_prompt: typeof st.do_prompt === 'string' ? st.do_prompt : DEFAULT_PROMPTS.do_prompt,
        };
        const tags = Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === 'string') : undefined;
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
    const tags = Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === 'string') : undefined;
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
export class JsonSwordContentProvider implements ISwordContentProvider {
  private cache: SwordDevotionalDTO[] | null = null;

  constructor(private readonly catalogUrl: string) {}

  async listDevotionals(): Promise<SwordDevotionalDTO[]> {
    if (this.cache) return this.cache;
    const data = await fetchJson<SwordDevotionalsFile>(this.catalogUrl);
    const rawList = Array.isArray(data.devotionals) ? data.devotionals : [];
    const list: SwordDevotionalDTO[] = [];
    for (const item of rawList) {
      const n = normalizeDevotional(item);
      if (n) list.push(n);
    }
    this.cache = list;
    return list;
  }

  async getDevotional(id: string): Promise<SwordDevotionalDTO | null> {
    const all = await this.listDevotionals();
    return all.find(d => d.id === id) || null;
  }

  clearCache(): void {
    this.cache = null;
  }
}
