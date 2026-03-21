/** Single pillar form data (checked indices + text fields). */
interface PillarRecord {
  checked: number[];
  poderoso: string;
  q1: string;
  q2: string;
  q3: string;
}

/** Stored historial entry (date + compact pillar data). */
interface HistorialItem {
  fecha?: string;
  data?: Record<string, Partial<PillarRecord>>;
}

/** All pillars' form data keyed by pillar id. */
type PillarData = Record<string, PillarRecord>;

const PILLAR_IDS = ['restauracion', 'olvidar', 'ansiedad', 'aceleracion', 'enojarse', 'agotamiento', 'recaida'];

const PILLAR_ID_TO_LANG_SUFFIX = { restauracion: 'restoration', olvidar: 'forgetting_priorities', ansiedad: 'anxiety', aceleracion: 'speeding_up', enojarse: 'getting_angry', agotamiento: 'exhaustion', recaida: 'relapse' };
function pillarLangKey(pillarId: string) { return PILLAR_ID_TO_LANG_SUFFIX[pillarId] || pillarId; }

const CHECKBOX_COUNTS = { restauracion: 7, olvidar: 18, ansiedad: 14, aceleracion: 15, enojarse: 14, agotamiento: 17, recaida: 7 };
const CHECKBOX_IDS: Record<string, string[]> = {};
PILLAR_IDS.forEach(function(pid) {
  const suffix = PILLAR_ID_TO_LANG_SUFFIX[pid];
  const n = CHECKBOX_COUNTS[pid] || 0;
  CHECKBOX_IDS[pid] = [];
  for (let j = 0; j < n; j++) CHECKBOX_IDS[pid].push('cb_' + suffix + '_' + j);
});

const LABEL_NAME_TO_KEY = { poderoso: 'label_most_powerful', q1: 'label_q1', q2: 'label_q2', q3: 'label_q3' };

const STORAGE_LAST_RECORD = 'ultimoRegistro';
const STORAGE_HISTORY = 'historialFASTER';
const STORAGE_LANG = 'fasterLang';

const PILLAR_NAME_TO_ID: Record<string, string> = { 'Restauración':'restauracion', 'Olvidar prioridades':'olvidar', 'Ansiedad':'ansiedad', 'Aceleración':'aceleracion', 'Enojarse':'enojarse', 'Agotamiento':'agotamiento', 'Recaída':'recaida' };

function getEl(id: string) {
  return document.getElementById(id);
}

function getHistorial(): HistorialItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
  } catch (e) {
    return [];
  }
}

function getLastFilledPillarIndex(data: PillarData) {
  let last = -1;
  for (let i = 0; i < PILLAR_IDS.length; i++) {
    if (data[PILLAR_IDS[i]] && hasAnyData(data[PILLAR_IDS[i]])) last = i;
  }
  return last;
}

function migrateDataKeys(data: Record<string, unknown> | null | undefined) {
  if (!data || typeof data !== 'object') return data;
  const out: Record<string, unknown> = {};
  for (const k in data) {
    const id = PILLAR_NAME_TO_ID[k] || k;
    out[id] = data[k];
  }
  return out;
}

let strings: Record<string, string> = {};
let currentLang = localStorage.getItem(STORAGE_LANG) || 'es_la';

function parseLangXml(xmlText: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const out: Record<string, string> = {};
  if (doc.querySelector('parsererror')) return out;
  doc.querySelectorAll('string').forEach(el => {
    const id = el.getAttribute('id');
    if (id) out[id] = (el.textContent || '').trim();
  });
  return out;
}

async function loadLang(langCode: string) {
  const embedded = document.getElementById('lang-data-' + langCode);
  if (embedded && embedded.textContent && embedded.textContent.trim()) {
    strings = parseLangXml(embedded.textContent.trim());
    return;
  }
  try {
    const path = 'lang/' + langCode + '.xml';
    const res = await fetch(path);
    if (!res.ok) throw new Error('Fetch failed');
    const xml = await res.text();
    strings = parseLangXml(xml);
  } catch (e) {
    const fallback = document.getElementById('lang-data-es_la');
    if (fallback && fallback.textContent) {
      strings = parseLangXml(fallback.textContent.trim());
    }
  }
}

function getString(id: string) {
  return strings[id] != null ? strings[id] : id;
}

function applyI18n() {
  if (Object.keys(strings).length === 0) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const id = el.getAttribute('data-i18n');
    if (id) el.textContent = getString(id);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const id = el.getAttribute('data-i18n-title');
    if (id) el.setAttribute('title', getString(id));
  });
  const docTitle = document.getElementById('doc-title');
  if (docTitle) docTitle.textContent = getString('title_page');
  const appTitle = document.getElementById('app-title');
  if (appTitle) appTitle.textContent = getString('app_title');
  const optHome = document.getElementById('opt-home');
  if (optHome) optHome.textContent = getString('menu_home');
  const optProfile = document.getElementById('opt-profile');
  if (optProfile) optProfile.textContent = getString('menu_profile');
  const optLogout = document.getElementById('opt-logout');
  if (optLogout) optLogout.textContent = getString('menu_logout');
  const optionsTrigger = document.getElementById('options-trigger');
  if (optionsTrigger) optionsTrigger.setAttribute('aria-label', getString('aria_options'));
  const langMenuEl = document.getElementById('lang-menu');
  if (langMenuEl) langMenuEl.setAttribute('aria-label', getString('aria_language'));
  const langMenu = document.getElementById('lang-menu') as HTMLSelectElement | null;
  if (langMenu) {
    Array.from(langMenu.options).forEach((opt: HTMLOptionElement) => {
      opt.textContent = opt.value === 'en_us' ? '🇺🇸' : '🇪🇸';
    });
  }
  initCheckboxes();
  document.querySelectorAll('button[data-i18n]').forEach(btn => {
    const id = btn.getAttribute('data-i18n');
    if (id) btn.textContent = getString(id);
  });
  const stepPrev = document.querySelector('.step-prev');
  if (stepPrev) stepPrev.setAttribute('aria-label', getString('btn_back'));
  const stepNext = document.querySelector('.step-next');
  if (stepNext) stepNext.setAttribute('aria-label', getString('btn_next'));
}

let currentStepIndex = 0;
let finishFromPillar: string | null = null;
let historyView: 'list' | { detailIndex: number } = 'list';
let historyReturnStep = 0;

const steps = document.querySelectorAll('.step[id^="step-"]');
const stepIds = Array.from(steps).map((s: Element) => (s as HTMLElement).id);

function initCheckboxes() {
  PILLAR_IDS.forEach((pillarId, i) => {
    const step = document.getElementById('step-' + pillarId);
    const container = step?.querySelector('.checkboxes');
    if (!container) return;
    container.innerHTML = '';
    const textareaPowerful = step.querySelector('textarea[name="poderoso"]') as HTMLTextAreaElement | null;
    const cbIds = CHECKBOX_IDS[pillarId] || [];
    cbIds.forEach((cbId, j) => {
      const row = document.createElement('div');
      row.className = 'checkbox-row';
      const inputId = 'cb-' + pillarId + '-' + j;
      const labelText = escapeHtml(getString(cbId));
      row.innerHTML = '<input type="checkbox" id="' + inputId + '" data-cb-index="' + j + '"><label for="' + inputId + '">' + labelText + '</label><button type="button" class="powerful-btn" data-i18n-title="title_most_powerful_tooltip" title="">💪</button>';
      container.appendChild(row);
      const btn = row.querySelector('.powerful-btn') as HTMLElement | null;
      if (btn) {
        btn.title = getString('title_most_powerful_tooltip');
        btn.addEventListener('click', function() {
          if (textareaPowerful) textareaPowerful.value = getString(cbId);
          const input = row.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
          if (input) input.checked = true;
        });
      }
    });
  });
}

function escapeHtml(text: string) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showStep(index: number) {
  steps.forEach((s, i) => s.classList.toggle('active', i === index));
  currentStepIndex = index;
  const activeStep = document.querySelector('.step.active');
  const frame = document.getElementById('step-frame');
  if (frame) {
    if (activeStep && activeStep.hasAttribute('data-pillar-id')) frame.classList.add('show-step-arrows');
    else frame.classList.remove('show-step-arrows');
  }
  if (activeStep && (activeStep as HTMLElement).id === 'step-pillars') {
    renderPillarsOverview(collectAllData());
  }
  if (activeStep) activeStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goNext() {
  const inputCheck = validateCurrentStepInputs();
  if (!inputCheck.ok) {
    const step = document.querySelector('.step.active');
    const err = inputCheck as { ok: false; message: string; missingNames: string[] };
    showMessage(err.message, true);
    if (err.missingNames) markStepValidationErrors(step as Element | null, err.missingNames);
    return;
  }
  clearStepValidationErrors(document.querySelector('.step.active'));
  hideMessage();
  if (currentStepIndex < steps.length - 2) {
    showStep(currentStepIndex + 1);
  }
}

function goBack() {
  if (currentStepIndex <= 0) return;
  hideMessage();
  clearStepValidationErrors(steps[currentStepIndex]);
  const currentStep = steps[currentStepIndex];
  const isPillarsStep = currentStep && (currentStep as HTMLElement).id === 'step-pillars';
  if (isPillarsStep && finishFromPillar) {
    showStep(getPillarStepIndex(finishFromPillar) + 1);
  } else {
    showStep(currentStepIndex - 1);
  }
}

function getStepPillarId(stepEl: Element) {
  return (stepEl as HTMLElement).dataset.pillarId || null;
}

const TEXTAREA_NAMES = ['poderoso', 'q1', 'q2', 'q3'];

function validateCurrentStepInputs(): { ok: true } | { ok: false; message: string; missingNames: string[] } {
  const step = document.querySelector('.step.active');
  if (!step || !getStepPillarId(step)) return { ok: true };
  const checkboxesContainer = step.querySelector('.checkboxes');
  if (!checkboxesContainer) return { ok: true };
  const anyChecked = checkboxesContainer.querySelectorAll('input[type="checkbox"]:checked').length > 0;
  if (!anyChecked) return { ok: true };
  const missingNames: string[] = [];
  const missingLabels: string[] = [];
  TEXTAREA_NAMES.forEach(name => {
    const el = step.querySelector('textarea[name="' + name + '"]');
    const val = (el && (el as HTMLTextAreaElement).value) ? (el as HTMLTextAreaElement).value.trim() : '';
    if (!val) {
      missingNames.push(name);
      missingLabels.push(getString(LABEL_NAME_TO_KEY[name as keyof typeof LABEL_NAME_TO_KEY] || 'label_' + name));
    }
  });
  if (missingNames.length > 0) {
    return { ok: false, message: getString('msg_validation_fill_all').replace('{0}', missingLabels.join(', ')), missingNames };
  }
  return { ok: true };
}

function showMessage(text: string, isError: boolean) {
  const msgBox = document.getElementById('message-box');
  const confirmBox = document.getElementById('confirm-box');
  if (msgBox) msgBox.style.display = 'block';
  if (confirmBox) confirmBox.style.display = 'none';
  const overlay = document.getElementById('message-overlay');
  const box = document.getElementById('message-box');
  const textEl = document.getElementById('message-box-text');
  if (textEl) textEl.textContent = text;
  if (box) box.classList.toggle('is-error', !!isError);
  if (overlay) overlay.classList.add('is-visible');
}

function hideMessage() {
  const overlay = document.getElementById('message-overlay');
  const msgBox = document.getElementById('message-box');
  const confirmBox = document.getElementById('confirm-box');
  if (overlay) overlay.classList.remove('is-visible');
  if (msgBox) {
    msgBox.classList.remove('is-error');
    msgBox.style.display = '';
  }
  if (confirmBox) confirmBox.style.display = 'none';
}

function showConfirm(message: string, onYes: () => void) {
  const msgBox = document.getElementById('message-box');
  const confirmBox = document.getElementById('confirm-box');
  if (msgBox) msgBox.style.display = 'none';
  if (confirmBox) confirmBox.style.display = 'block';
  const confirmText = document.getElementById('confirm-text');
  if (confirmText) confirmText.textContent = message;
  const overlay = document.getElementById('message-overlay');
  if (overlay) overlay.classList.add('is-visible');
  const doHide = function() {
    const o = document.getElementById('message-overlay');
    const c = document.getElementById('confirm-box');
    const m = document.getElementById('message-box');
    if (o) o.classList.remove('is-visible');
    if (c) c.style.display = 'none';
    if (m) m.style.display = '';
  };
  const btnYes = document.getElementById('btn-confirm-yes');
  const btnNo = document.getElementById('btn-confirm-no');
  if (btnYes) btnYes.onclick = function() {
    onYes();
    doHide();
  };
  if (btnNo) btnNo.onclick = doHide;
}

function markStepValidationErrors(step: Element | null, missingNames: string[]) {
  if (!step) return;
  TEXTAREA_NAMES.forEach(name => {
    const el = step.querySelector('textarea[name="' + name + '"]');
    if (el) {
      if (missingNames.indexOf(name) >= 0) el.classList.add('validation-error');
      else el.classList.remove('validation-error');
    }
  });
  step.querySelectorAll('textarea[name]').forEach(ta => {
    const textarea = ta as HTMLTextAreaElement;
    const once = function() {
      if ((textarea.value || '').trim()) {
        textarea.classList.remove('validation-error');
        textarea.removeEventListener('input', once);
        textarea.removeEventListener('change', once);
      }
    };
    textarea.addEventListener('input', once);
    textarea.addEventListener('change', once);
  });
}

function clearStepValidationErrors(step: Element | null) {
  if (!step) return;
  step.querySelectorAll('textarea.validation-error').forEach(el => el.classList.remove('validation-error'));
}

function collectAllData(): PillarData {
  const data: PillarData = {};
  PILLAR_IDS.forEach((pillarId) => {
    const step = document.getElementById('step-' + pillarId);
    const checked: number[] = [];
    if (step) {
      step.querySelectorAll('.checkboxes input[type="checkbox"]:checked').forEach(cb => {
        const idx = cb.getAttribute('data-cb-index');
        if (idx !== null) checked.push(parseInt(idx, 10));
      });
    }
    const poderoso = (step?.querySelector('textarea[name="poderoso"]') as HTMLTextAreaElement | null)?.value || '';
    const q1 = (step?.querySelector('textarea[name="q1"]') as HTMLTextAreaElement | null)?.value || '';
    const q2 = (step?.querySelector('textarea[name="q2"]') as HTMLTextAreaElement | null)?.value || '';
    const q3 = (step?.querySelector('textarea[name="q3"]') as HTMLTextAreaElement | null)?.value || '';
    data[pillarId] = { checked, poderoso, q1, q2, q3 };
  });
  return data;
}

function hasAnyData(record: Partial<PillarRecord>) {
  const r = record as { checked?: number[]; poderoso?: string };
  return (r.checked?.length ?? 0) > 0 || (r.poderoso != null && r.poderoso.trim() !== '');
}

function recordHasAnyData(rec: Partial<PillarRecord> | null | undefined) {
  if (!rec) return false;
  const c = rec.checked && rec.checked.length > 0;
  const p = rec.poderoso && String(rec.poderoso).trim() !== '';
  const q1 = rec.q1 && String(rec.q1).trim() !== '';
  const q2 = rec.q2 && String(rec.q2).trim() !== '';
  const q3 = rec.q3 && String(rec.q3).trim() !== '';
  return c || p || q1 || q2 || q3;
}

function compactData(data: Record<string, Partial<PillarRecord>>) {
  const out: Record<string, Partial<PillarRecord> & { checked: number[] }> = {};
  PILLAR_IDS.forEach(pillarId => {
    const rec = data[pillarId];
    if (!rec || !recordHasAnyData(rec)) return;
    const compactRec: Partial<PillarRecord> & { checked: number[] } = { checked: rec.checked || [] };
    if (rec.poderoso && String(rec.poderoso).trim() !== '') compactRec.poderoso = rec.poderoso.trim();
    if (rec.q1 && String(rec.q1).trim() !== '') compactRec.q1 = rec.q1.trim();
    if (rec.q2 && String(rec.q2).trim() !== '') compactRec.q2 = rec.q2.trim();
    if (rec.q3 && String(rec.q3).trim() !== '') compactRec.q3 = rec.q3.trim();
    out[pillarId] = compactRec;
  });
  return out;
}

function validatePillarsOrder(data: Record<string, Partial<PillarRecord>>) {
  let lastFilledIndex = -1;
  for (let i = 0; i < PILLAR_IDS.length; i++) {
    const rec = data[PILLAR_IDS[i]];
    if (rec && hasAnyData(rec)) lastFilledIndex = i;
  }
  if (lastFilledIndex === -1) {
    return { valid: false, missingPillars: [] as string[], message: getString('msg_complete_one_pillar') };
  }
  const missingPillars: string[] = [];
  for (let i = 0; i < lastFilledIndex; i++) {
    const rec = data[PILLAR_IDS[i]];
    if (!rec || !hasAnyData(rec)) missingPillars.push(PILLAR_IDS[i]);
  }
  if (missingPillars.length === 0) {
    return { valid: true, missingPillars: [] };
  }
  const missingNames = missingPillars.map(id => getString('title_' + pillarLangKey(id))).join(', ');
  return { valid: false, missingPillars, message: getString('msg_fill_previous_pillars').replace('{0}', missingNames) };
}

function getPillarStepIndex(pillarId: string) {
  const idx = PILLAR_IDS.indexOf(pillarId);
  return idx >= 0 ? idx : 0;
}

function getLastPillarWithData(data: Record<string, Partial<PillarRecord>>) {
  let last: string | null = null;
  PILLAR_IDS.forEach(pillarId => {
    const rec = data[pillarId];
    if (rec && hasAnyData(rec)) last = pillarId;
  });
  return last;
}

function renderPillarsOverview(data: Record<string, Partial<PillarRecord>>) {
  let lastFilledIndex = -1;
  for (let i = 0; i < PILLAR_IDS.length; i++) {
    const rec = data[PILLAR_IDS[i]];
    if (rec && hasAnyData(rec)) lastFilledIndex = i;
  }
  const container = document.getElementById('pillars-list');
  if (!container) return;
  let html = '';
  PILLAR_IDS.forEach((pillarId, i) => {
    const rec = data[pillarId];
    const filled = rec && hasAnyData(rec);
    let icon = '';
    if (filled) {
      icon = '<span class="pillars-icon filled">✓</span>';
    } else if (i > lastFilledIndex) {
      icon = '<span class="pillars-icon optional">✓</span>';
    } else {
      icon = '<span class="pillars-icon missing" title="' + escapeHtml(getString('pillars_must_fill_this')) + '">⛔</span>';
    }
    html += '<div class="pillars-item">' + icon + ' <a href="#" class="pillar-link" data-pillar-index="' + i + '">' + escapeHtml(getString('title_' + pillarLangKey(pillarId))) + '</a></div>';
  });
  container.innerHTML = html;
  container.querySelectorAll('.pillar-link').forEach(link => {
    link.addEventListener('click', function(this: HTMLElement, e: Event) {
      e.preventDefault();
      const index = parseInt(this.getAttribute('data-pillar-index') || '0', 10);
      showStep(index + 1);
    });
  });
}

function labelForCheckedItem(pillarId: string, item: number | string) {
  if (typeof item === 'number' && CHECKBOX_IDS[pillarId]) {
    return getString(CHECKBOX_IDS[pillarId][item]);
  }
  return String(item);
}

function renderSummary(data: Record<string, Partial<PillarRecord>>, _fromPillar: string | null) {
  const container = document.getElementById('summary-content');
  const titleEl = document.getElementById('summary-title');
  if (!container || !titleEl) return;

  const displayPillar = getLastPillarWithData(data);
  titleEl.textContent = (displayPillar ? getString('summary_you_are_at') + ' ' + getString('title_' + pillarLangKey(displayPillar)) : getString('title_summary'));

  const rec = displayPillar && data[displayPillar] ? data[displayPillar] : null;
  const adviceText = displayPillar ? getString('advice_' + pillarLangKey(displayPillar)) : '';
  let html = '';
  if (rec && recordHasAnyData(rec)) {
    html += '<div class="summary-pillar">';
    if (rec.checked && rec.checked.length) {
      html += '<ul>';
      rec.checked.forEach(item => { html += '<li>' + escapeHtml(labelForCheckedItem(displayPillar, item)) + '</li>'; });
      html += '</ul>';
    }
    if (rec.poderoso && rec.poderoso.trim()) {
      html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('summary_most_powerful_behavior')) + '</p><p class="summary-value">' + escapeHtml(rec.poderoso.trim()) + '</p></div>';
    }
    if (rec.q1 && rec.q1.trim()) html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('label_q1')) + '</p><p class="summary-value">' + escapeHtml(rec.q1.trim()) + '</p></div>';
    if (rec.q2 && rec.q2.trim()) html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('label_q2')) + '</p><p class="summary-value">' + escapeHtml(rec.q2.trim()) + '</p></div>';
    if (rec.q3 && rec.q3.trim()) html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('label_q3')) + '</p><p class="summary-value">' + escapeHtml(rec.q3.trim()) + '</p></div>';
    if (adviceText) html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('summary_advice')) + '</p><p class="summary-value">' + escapeHtml(adviceText) + '</p></div>';
    html += '</div>';
  }
  container.innerHTML = html || '<p>' + escapeHtml(getString('msg_no_data')) + '</p>';
}

function openHistory() {
  historyReturnStep = currentStepIndex;
  historyView = 'list';
  renderHistoryList();
  const backBtn = document.getElementById('btn-history-back');
  const deleteBtn = document.getElementById('btn-history-delete');
  const exportBtn = document.getElementById('btn-history-export');
  if (backBtn) backBtn.textContent = getString('btn_back');
  if (deleteBtn) deleteBtn.style.display = '';
  if (exportBtn) exportBtn.style.display = '';
  showStep(stepIds.indexOf('step-history'));
}

function renderHistoryList() {
  const historyList = getHistorial();
  const panel = document.getElementById('history-panel');
  if (!panel) return;
  if (historyList.length === 0) {
    panel.innerHTML = '<p class="description">' + escapeHtml(getString('msg_no_records')) + '</p>';
    return;
  }
  let html = '<p class="description">' + escapeHtml(getString('msg_history_instructions')) + '</p><div class="history-list">';
  historyList.forEach((item: HistorialItem, idx: number) => {
    html += '<div class="history-item record-link" data-record-index="' + idx + '"><span class="export-check-wrap"><input type="checkbox" class="export-checkbox" data-record-index="' + idx + '" checked></span><span class="record-date">' + escapeHtml(item.fecha || '') + '</span></div>';
  });
  html += '</div>';
  panel.innerHTML = html;
  panel.querySelectorAll('.export-checkbox').forEach(cb => {
    cb.addEventListener('click', function(e) { e.stopPropagation(); });
  });
  panel.querySelectorAll('.record-link').forEach(el => {
    el.addEventListener('click', function(this: HTMLElement, e: Event) {
      if ((e.target as Element).classList.contains('export-checkbox') || (e.target as Element).closest('.export-check-wrap')) return;
      const idx = parseInt(this.getAttribute('data-record-index') || '0', 10);
      historyView = { detailIndex: idx };
      renderHistoryDetail(idx);
      const backBtn = document.getElementById('btn-history-back');
      const deleteBtn = document.getElementById('btn-history-delete');
      const exportBtn = document.getElementById('btn-history-export');
      if (backBtn) backBtn.textContent = getString('btn_back_to_list');
      if (deleteBtn) deleteBtn.style.display = 'none';
      if (exportBtn) exportBtn.style.display = 'none';
    });
  });
}

function buildRecordHtml(item: HistorialItem) {
  const data = migrateDataKeys(item.data || {}) as Record<string, Partial<PillarRecord>>;
  let html = '<section class="export-record"><h2>' + escapeHtml(getString('record_label')) + ' ' + escapeHtml(item.fecha || '') + '</h2>';
  PILLAR_IDS.forEach(pillarId => {
    const rec = data[pillarId];
    if (!rec || !recordHasAnyData(rec)) return;
    html += '<div class="export-pillar"><h3>' + escapeHtml(getString('title_' + pillarLangKey(pillarId))) + '</h3>';
    if (rec.checked && rec.checked.length) {
      html += '<ul>';
      rec.checked.forEach(cbItem => { html += '<li>' + escapeHtml(labelForCheckedItem(pillarId, cbItem)) + '</li>'; });
      html += '</ul>';
    }
    if (rec.poderoso && String(rec.poderoso).trim()) html += '<p><strong>' + escapeHtml(getString('summary_most_powerful_behavior')) + '</strong></p><p>' + escapeHtml(rec.poderoso.trim()) + '</p>';
    if (rec.q1 && String(rec.q1).trim()) html += '<p><strong>' + escapeHtml(getString('label_q1')) + '</strong></p><p>' + escapeHtml(rec.q1.trim()) + '</p>';
    if (rec.q2 && String(rec.q2).trim()) html += '<p><strong>' + escapeHtml(getString('label_q2')) + '</strong></p><p>' + escapeHtml(rec.q2.trim()) + '</p>';
    if (rec.q3 && String(rec.q3).trim()) html += '<p><strong>' + escapeHtml(getString('label_q3')) + '</strong></p><p>' + escapeHtml(rec.q3.trim()) + '</p>';
    html += '<p><strong>' + escapeHtml(getString('summary_advice')) + '</strong></p><p>' + escapeHtml(getString('advice_' + pillarLangKey(pillarId))) + '</p>';
    html += '</div>';
  });
  html += '</section>';
  return html;
}

function exportHistoryHTML() {
  const checked = document.querySelectorAll('#history-panel .export-checkbox:checked');
  if (!checked.length) {
    showMessage(getString('msg_select_one_export'), true);
    return;
  }
  const historyList = getHistorial();
  const indices = Array.from(checked).map(cb => parseInt(cb.getAttribute('data-record-index') || '0', 10));
  const toExport = indices.map((i: number) => historyList[i]).filter(Boolean);
  const style = '<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:1rem;color:#222;}.export-record{margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #ddd;}.export-record:last-child{border-bottom:none;}.export-pillar{margin-bottom:1.25rem;}.export-pillar h3{margin:0.5rem 0 0.25rem 0;font-size:1.1rem;}.export-pillar ul{margin:0.25rem 0;padding-left:1.25rem;}.export-pillar p{margin:0.25rem 0;}</style>';
  let body = '<h1>' + escapeHtml(getString('export_records_title')) + '</h1>';
  toExport.forEach((item: HistorialItem) => { body += buildRecordHtml(item); });
  const fullHtml = '<!DOCTYPE html><html lang="' + (currentLang === 'es_la' ? 'es' : 'en') + '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + style + '</head><body>' + body + '</body></html>';
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const filename = 'faster-records-' + (new Date().toISOString().slice(0, 10)) + '.html';
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([blob], filename, { type: 'text/html;charset=utf-8' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: getString('export_records_title'), text: filename }).catch(function() {
          doExportDownload(blob, filename);
        });
        return;
      }
    } catch (e) {}
  }
  doExportDownload(blob, filename);
}

function doExportDownload(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function renderHistoryDetail(index: number) {
  const historyList = getHistorial();
  const item = historyList[index];
  const panel = document.getElementById('history-panel');
  if (!panel) return;
  if (!item) {
    panel.innerHTML = '<p>' + escapeHtml(getString('msg_record_not_found')) + '</p>';
    return;
  }
  const data = migrateDataKeys(item.data || {}) as Record<string, Partial<PillarRecord>>;
  let html = '<p class="description"><strong>' + escapeHtml(getString('date_label')) + '</strong> ' + escapeHtml(item.fecha || '') + '</p>';
  PILLAR_IDS.forEach(pillarId => {
    const rec = data[pillarId];
    if (!rec || !recordHasAnyData(rec)) return;
    html += '<div class="record-detail-pillar">';
    html += '<h3>' + escapeHtml(getString('title_' + pillarLangKey(pillarId))) + '</h3>';
    if (rec.checked && rec.checked.length) {
      html += '<ul>';
      rec.checked.forEach(cbItem => { html += '<li>' + escapeHtml(labelForCheckedItem(pillarId, cbItem)) + '</li>'; });
      html += '</ul>';
    }
    if (rec.poderoso && String(rec.poderoso).trim()) {
      html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('summary_most_powerful_behavior')) + '</p><p class="summary-value">' + escapeHtml(rec.poderoso.trim()) + '</p></div>';
    }
    if (rec.q1 && String(rec.q1).trim()) html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('label_q1')) + '</p><p class="summary-value">' + escapeHtml(rec.q1.trim()) + '</p></div>';
    if (rec.q2 && String(rec.q2).trim()) html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('label_q2')) + '</p><p class="summary-value">' + escapeHtml(rec.q2.trim()) + '</p></div>';
    if (rec.q3 && String(rec.q3).trim()) html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('label_q3')) + '</p><p class="summary-value">' + escapeHtml(rec.q3.trim()) + '</p></div>';
    html += '<div class="summary-block"><p class="summary-title">' + escapeHtml(getString('summary_advice')) + '</p><p class="summary-value">' + escapeHtml(getString('advice_' + pillarLangKey(pillarId))) + '</p></div>';
    html += '</div>';
  });
  panel.innerHTML = html || '<p>' + escapeHtml(getString('msg_no_data_short')) + '</p>';
}

function deleteAllRecords() {
  showConfirm(getString('confirm_delete_all_message'), function() {
    localStorage.setItem(STORAGE_HISTORY, '[]');
    renderHistoryList();
  });
}

function goToPillarsOverview() {
  const step = steps[currentStepIndex];
  const inputCheck = validateCurrentStepInputs();
  if (!inputCheck.ok) {
    const err = inputCheck as { ok: false; message: string; missingNames: string[] };
    showMessage(err.message, true);
    if (err.missingNames) markStepValidationErrors(step as Element, err.missingNames);
    return;
  }
  finishFromPillar = getStepPillarId(step as Element);
  const data = collectAllData();
  clearStepValidationErrors(step as Element);
  hideMessage();
  localStorage.setItem(STORAGE_LAST_RECORD, JSON.stringify(data));
  renderPillarsOverview(data);
  showStep(stepIds.indexOf('step-pillars'));
}

function finish() {
  goToPillarsOverview();
}

function goToSummary() {
  const data = collectAllData();
  const validation = validatePillarsOrder(data);
  if (!validation.valid) {
    showMessage(validation.message, true);
    return;
  }
  localStorage.setItem(STORAGE_LAST_RECORD, JSON.stringify(data));
  const historyList = getHistorial();
  const dateStr = new Date().toLocaleString(currentLang === 'es_la' ? 'es' : 'en-US');
  historyList.push({ fecha: dateStr, data: compactData(data) });
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(historyList));
  showMessage(getString('msg_record_saved'), false);
  renderSummary(data, finishFromPillar);
  showStep(stepIds.indexOf('step-summary'));
}

function startOver() {
  showStep(0);
}

function bindNav() {
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', goNext);
  });
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', goBack);
  });
  document.querySelectorAll('.fin-btn').forEach(btn => btn.addEventListener('click', goToPillarsOverview));
  const finishBtn = document.querySelector('.finish-btn');
  if (finishBtn) finishBtn.addEventListener('click', finish);
  const btnViewSummary = document.getElementById('btn-view-summary');
  if (btnViewSummary) btnViewSummary.addEventListener('click', goToSummary);
  const btnStartOver = document.getElementById('btn-start-over');
  if (btnStartOver) btnStartOver.addEventListener('click', startOver);
  const btnViewRecordsSummary = document.getElementById('btn-view-records-summary');
  if (btnViewRecordsSummary) btnViewRecordsSummary.addEventListener('click', openHistory);
  const btnViewRecordsStart = document.getElementById('btn-view-records-start');
  if (btnViewRecordsStart) btnViewRecordsStart.addEventListener('click', openHistory);
  const btnHistoryBack = document.getElementById('btn-history-back');
  if (btnHistoryBack) btnHistoryBack.addEventListener('click', function() {
    if (historyView === 'list') {
      showStep(historyReturnStep);
    } else {
      historyView = 'list';
      renderHistoryList();
      this.textContent = getString('btn_back');
      const deleteBtn = document.getElementById('btn-history-delete');
      const exportBtn = document.getElementById('btn-history-export');
      if (deleteBtn) deleteBtn.style.display = '';
      if (exportBtn) exportBtn.style.display = '';
    }
  });
  const btnHistoryExport = document.getElementById('btn-history-export');
  if (btnHistoryExport) btnHistoryExport.addEventListener('click', exportHistoryHTML);
  const btnHistoryDelete = document.getElementById('btn-history-delete');
  if (btnHistoryDelete) btnHistoryDelete.addEventListener('click', deleteAllRecords);
  const messageBoxClose = document.getElementById('message-box-close');
  if (messageBoxClose) messageBoxClose.addEventListener('click', hideMessage);
  const messageOverlay = document.getElementById('message-overlay');
  if (messageOverlay) messageOverlay.addEventListener('click', function(e) {
    if (e.target === this) hideMessage();
  });
  const messageBox = document.getElementById('message-box');
  if (messageBox) messageBox.addEventListener('click', function(e) { e.stopPropagation(); });
  const confirmBox = document.getElementById('confirm-box');
  if (confirmBox) confirmBox.addEventListener('click', function(e) { e.stopPropagation(); });
  const btnStart = document.getElementById('btn-start');
  if (btnStart) btnStart.addEventListener('click', function() {
    showStep(1);
  });
  const optionsTrigger = document.getElementById('options-trigger');
  const optionsDropdown = document.getElementById('options-dropdown');
  function closeOptionsMenu() {
    if (optionsDropdown) optionsDropdown.hidden = true;
    if (optionsTrigger) optionsTrigger.setAttribute('aria-expanded', 'false');
  }
  if (optionsTrigger && optionsDropdown) {
    optionsTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = !optionsDropdown.hidden;
      optionsDropdown.hidden = isOpen;
      optionsTrigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
    optionsDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
    document.addEventListener('click', function() { closeOptionsMenu(); });
    const optHomeEl = document.getElementById('opt-home');
    if (optHomeEl) optHomeEl.addEventListener('click', function() { showStep(0); closeOptionsMenu(); });
    const optProfileEl = document.getElementById('opt-profile');
    if (optProfileEl) optProfileEl.addEventListener('click', function() { closeOptionsMenu(); });
    const optLogoutEl = document.getElementById('opt-logout');
    if (optLogoutEl) optLogoutEl.addEventListener('click', function() { closeOptionsMenu(); });
  }
  const langMenuEl = document.getElementById('lang-menu');
  if (langMenuEl) {
    langMenuEl.addEventListener('change', function() {
      currentLang = (this as HTMLSelectElement).value;
      localStorage.setItem(STORAGE_LANG, currentLang);
      document.documentElement.lang = currentLang === 'es_la' ? 'es' : 'en';
      loadLang(currentLang).then(function() {
        applyI18n();
      });
    });
  }
  if (typeof window !== 'undefined' && (window as unknown as { Capacitor?: { Plugins?: { App?: { addListener?: (event: string, cb: () => void) => void; exitApp?: () => void } } } }).Capacitor?.Plugins?.App) {
    try {
      const Cap = (window as unknown as { Capacitor: { Plugins: { App: { addListener: (event: string, cb: () => void) => void; exitApp?: () => void } } } }).Capacitor.Plugins.App;
      Cap.addListener('backButton', function() {
        if (currentStepIndex > 0) {
          goBack();
        } else {
          if (Cap.exitApp) Cap.exitApp();
        }
      });
    } catch (e) {}
  }
}

loadLang(currentLang).then(function() {
  applyI18n();
  bindNav();
  const langSelect = document.getElementById('lang-menu');
  if (langSelect) (langSelect as HTMLSelectElement).value = currentLang;
  document.documentElement.lang = currentLang === 'es_la' ? 'es' : 'en';
  showStep(0);
}).catch(function() {
  bindNav();
  const langSelect = document.getElementById('lang-menu');
  if (langSelect) (langSelect as HTMLSelectElement).value = currentLang;
  document.documentElement.lang = currentLang === 'es_la' ? 'es' : 'en';
  showStep(0);
});
