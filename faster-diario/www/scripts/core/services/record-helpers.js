/**
 * Pure pillar/record logic — no DOM, no localStorage, no i18n strings.
 * Callers supply pillar id ordering and resolve user-facing messages.
 */
import { PILLAR_NAME_TO_ID } from '../domain/pillar-constants.js';
export function hasAnyData(record) {
    const r = record;
    return (r.checked?.length ?? 0) > 0 || (r.poderoso != null && r.poderoso.trim() !== '');
}
export function recordHasAnyData(rec) {
    if (!rec)
        return false;
    const c = rec.checked && rec.checked.length > 0;
    const p = rec.poderoso && String(rec.poderoso).trim() !== '';
    const q1 = rec.q1 && String(rec.q1).trim() !== '';
    const q2 = rec.q2 && String(rec.q2).trim() !== '';
    const q3 = rec.q3 && String(rec.q3).trim() !== '';
    return !!(c || p || q1 || q2 || q3);
}
export function compactData(data, pillarIds) {
    const out = {};
    pillarIds.forEach((pillarId) => {
        const rec = data[pillarId];
        if (!rec || !recordHasAnyData(rec))
            return;
        const compactRec = { checked: rec.checked || [] };
        if (rec.poderoso && String(rec.poderoso).trim() !== '')
            compactRec.poderoso = rec.poderoso.trim();
        if (rec.q1 && String(rec.q1).trim() !== '')
            compactRec.q1 = rec.q1.trim();
        if (rec.q2 && String(rec.q2).trim() !== '')
            compactRec.q2 = rec.q2.trim();
        if (rec.q3 && String(rec.q3).trim() !== '')
            compactRec.q3 = rec.q3.trim();
        out[pillarId] = compactRec;
    });
    return out;
}
export function migrateDataKeys(data) {
    if (!data || typeof data !== 'object')
        return data;
    const out = {};
    for (const k in data) {
        const id = PILLAR_NAME_TO_ID[k] || k;
        out[id] = data[k];
    }
    return out;
}
export function getLastFilledPillarIndex(data, pillarIds) {
    let last = -1;
    for (let i = 0; i < pillarIds.length; i++) {
        const rec = data[pillarIds[i]];
        if (rec && hasAnyData(rec))
            last = i;
    }
    return last;
}
export function getPillarStepIndex(pillarId, pillarIds) {
    const idx = pillarIds.indexOf(pillarId);
    return idx >= 0 ? idx : 0;
}
export function getLastPillarWithData(data, pillarIds) {
    let last = null;
    pillarIds.forEach((pillarId) => {
        const rec = data[pillarId];
        if (rec && hasAnyData(rec))
            last = pillarId;
    });
    return last;
}
export function computePillarOrderIssues(data, pillarIds) {
    let lastFilledIndex = -1;
    for (let i = 0; i < pillarIds.length; i++) {
        const rec = data[pillarIds[i]];
        if (rec && hasAnyData(rec))
            lastFilledIndex = i;
    }
    if (lastFilledIndex === -1)
        return { kind: 'empty' };
    const missingPillars = [];
    for (let i = 0; i < lastFilledIndex; i++) {
        const rec = data[pillarIds[i]];
        if (!rec || !hasAnyData(rec))
            missingPillars.push(pillarIds[i]);
    }
    if (missingPillars.length === 0)
        return { kind: 'ok' };
    return { kind: 'gaps', missingPillars };
}
