export type SwordStepId = 'scripture' | 'write' | 'observation' | 'reflection' | 'do';

export interface SwordScriptureBlock {
  reference: string;
  text: string;
}

/** Prompts for W, O, R, D (S is scripture reading). */
export interface SwordStepPrompts {
  write_prompt: string;
  observation_prompt: string;
  reflection_prompt: string;
  do_prompt: string;
}

export interface SwordDevotionalDTO {
  id: string;
  title: string;
  scripture: SwordScriptureBlock;
  steps: SwordStepPrompts;
  tags?: string[];
}

export interface SwordDevotionalsFile {
  version?: number;
  devotionals: SwordDevotionalDTO[];
}

export interface SwordSessionRecord {
  id: string;
  devotionalId: string;
  createdAt: string;
  updatedAt: string;
  /** User-edited content per step */
  steps: Record<SwordStepId, string>;
}

export interface SwordQueueItem {
  id: string;
  kind: 'sword_session_sync';
  sessionId: string;
  createdAt: string;
  attempts: number;
  lastError?: string;
}
