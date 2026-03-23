/**
 * Pillar IDs, i18n key mapping, and checkbox id lists.
 * No DOM; safe to import from pure services.
 */

export const PILLAR_IDS = [
  'restauracion',
  'olvidar',
  'ansiedad',
  'aceleracion',
  'enojarse',
  'agotamiento',
  'recaida',
] as const;

export type PillarId = (typeof PILLAR_IDS)[number];

export const PILLAR_ID_TO_LANG_SUFFIX: Record<string, string> = {
  restauracion: 'restoration',
  olvidar: 'forgetting_priorities',
  ansiedad: 'anxiety',
  aceleracion: 'speeding_up',
  enojarse: 'getting_angry',
  agotamiento: 'exhaustion',
  recaida: 'relapse',
};

export function pillarLangKey(pillarId: string): string {
  return PILLAR_ID_TO_LANG_SUFFIX[pillarId] || pillarId;
}

export const CHECKBOX_COUNTS: Record<string, number> = {
  restauracion: 7,
  olvidar: 18,
  ansiedad: 14,
  aceleracion: 15,
  enojarse: 14,
  agotamiento: 17,
  recaida: 7,
};

function buildCheckboxIds(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  PILLAR_IDS.forEach((pid) => {
    const suffix = PILLAR_ID_TO_LANG_SUFFIX[pid];
    const n = CHECKBOX_COUNTS[pid] || 0;
    out[pid] = [];
    for (let j = 0; j < n; j++) out[pid].push('cb_' + suffix + '_' + j);
  });
  return out;
}

export const CHECKBOX_IDS: Record<string, string[]> = buildCheckboxIds();

export const LABEL_NAME_TO_KEY = {
  poderoso: 'label_most_powerful',
  q1: 'label_q1',
  q2: 'label_q2',
  q3: 'label_q3',
} as const;

/** Map legacy Spanish display names to pillar ids (historial migration). */
export const PILLAR_NAME_TO_ID: Record<string, string> = {
  Restauración: 'restauracion',
  'Olvidar prioridades': 'olvidar',
  Ansiedad: 'ansiedad',
  Aceleración: 'aceleracion',
  Enojarse: 'enojarse',
  Agotamiento: 'agotamiento',
  Recaída: 'recaida',
};
