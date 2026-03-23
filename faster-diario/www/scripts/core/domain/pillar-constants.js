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
];
export const PILLAR_ID_TO_LANG_SUFFIX = {
    restauracion: 'restoration',
    olvidar: 'forgetting_priorities',
    ansiedad: 'anxiety',
    aceleracion: 'speeding_up',
    enojarse: 'getting_angry',
    agotamiento: 'exhaustion',
    recaida: 'relapse',
};
export function pillarLangKey(pillarId) {
    return PILLAR_ID_TO_LANG_SUFFIX[pillarId] || pillarId;
}
export const CHECKBOX_COUNTS = {
    restauracion: 7,
    olvidar: 18,
    ansiedad: 14,
    aceleracion: 15,
    enojarse: 14,
    agotamiento: 17,
    recaida: 7,
};
function buildCheckboxIds() {
    const out = {};
    PILLAR_IDS.forEach((pid) => {
        const suffix = PILLAR_ID_TO_LANG_SUFFIX[pid];
        const n = CHECKBOX_COUNTS[pid] || 0;
        out[pid] = [];
        for (let j = 0; j < n; j++)
            out[pid].push('cb_' + suffix + '_' + j);
    });
    return out;
}
export const CHECKBOX_IDS = buildCheckboxIds();
export const LABEL_NAME_TO_KEY = {
    poderoso: 'label_most_powerful',
    q1: 'label_q1',
    q2: 'label_q2',
    q3: 'label_q3',
};
/** Map legacy Spanish display names to pillar ids (historial migration). */
export const PILLAR_NAME_TO_ID = {
    Restauración: 'restauracion',
    'Olvidar prioridades': 'olvidar',
    Ansiedad: 'ansiedad',
    Aceleración: 'aceleracion',
    Enojarse: 'enojarse',
    Agotamiento: 'agotamiento',
    Recaída: 'recaida',
};
