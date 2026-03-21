const PILLAR_IDS = ['restauracion', 'olvidar', 'ansiedad', 'aceleracion', 'enojarse', 'agotamiento', 'recaida'];

const PILLAR_ID_TO_LANG_SUFFIX = { restauracion: 'restoration', olvidar: 'forgetting_priorities', ansiedad: 'anxiety', aceleracion: 'speeding_up', enojarse: 'getting_angry', agotamiento: 'exhaustion', recaida: 'relapse' };
function pillarLangKey(pillarId) { return PILLAR_ID_TO_LANG_SUFFIX[pillarId] || pillarId; }

const CHECKBOX_COUNTS = { restauracion: 7, olvidar: 18, ansiedad: 14, aceleracion: 15, enojarse: 14, agotamiento: 17, recaida: 7 };
const CHECKBOX_IDS = {};
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

const PILLAR_NAME_TO_ID = { 'Restauración':'restauracion', 'Olvidar prioridades':'olvidar', 'Ansiedad':'ansiedad', 'Aceleración':'aceleracion', 'Enojarse':'enojarse', 'Agotamiento':'agotamiento', 'Recaída':'recaida' };

function getEl(id) {
  return document.getElementById(id);
}

function getHistorial() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
  } catch (e) {
    return [];
  }
}

function getLastFilledPillarIndex(data) {
  let last = -1;
  for (let i = 0; i < PILLAR_IDS.length; i++) {
    if (data[PILLAR_IDS[i]] && hasAnyData(data[PILLAR_IDS[i]])) last = i;
  }
  return last;
}

function migrateDataKeys(data) {
  if (!data || typeof data !== 'object') return data;
  const out = {};
  for (const k in data) {
    const id = PILLAR_NAME_TO_ID[k] || k;
    out[id] = data[k];
  }
  return out;
}

let strings = {};
let currentLang = localStorage.getItem(STORAGE_LANG) || 'es_la';

function parseLangXml(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const out = {};
  if (doc.querySelector('parsererror')) return out;
  doc.querySelectorAll('string').forEach(el => {
    const id = el.getAttribute('id');
    if (id) out[id] = el.textContent.trim();
  });
  return out;
}

async function loadLang(langCode) {
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
    var fallback = document.getElementById('lang-data-es_la');
    if (fallback && fallback.textContent) {
      strings = parseLangXml(fallback.textContent.trim());
    }
  }
}

function getString(id) {
  return strings[id] != null ? strings[id] : id;
}

function applyI18n() {
  if (Object.keys(strings).length === 0) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = getString(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', getString(el.getAttribute('data-i18n-title')));
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
  const langMenu = document.getElementById('lang-menu');
  if (langMenu) {
    Array.from(langMenu.options).forEach(opt => {
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
let finishFromPillar = null;
let historyView = 'list';
let historyReturnStep = 0;

const steps = document.querySelectorAll('.step[id^="step-"]');
const stepIds = Array.from(steps).map(s => s.id);

function initCheckboxes() {
  PILLAR_IDS.forEach((pillarId, i) => {
    const step = document.getElementById('step-' + pillarId);
    const container = step.querySelector('.checkboxes');
    if (!container) return;
    container.innerHTML = '';
    const textareaPowerful = step.querySelector('textarea[name="poderoso"]');
    const cbIds = CHECKBOX_IDS[pillarId] || [];
    cbIds.forEach((cbId, j) => {
      const row = document.createElement('div');
      row.className = 'checkbox-row';
      const inputId = 'cb-' + pillarId + '-' + j;
      const labelText = escapeHtml(getString(cbId));
      row.innerHTML = '<input type="checkbox" id="' + inputId + '" data-cb-index="' + j + '"><label for="' + inputId + '">' + labelText + '</label><button type="button" class="powerful-btn" data-i18n-title="title_most_powerful_tooltip" title="">💪</button>';
      container.appendChild(row);
      const btn = row.querySelector('.powerful-btn');
      if (btn) {
        btn.title = getString('title_most_powerful_tooltip');
        btn.addEventListener('click', function() {
          textareaPowerful.value = getString(cbId);
          row.querySelector('input[type="checkbox"]').checked = true;
        });
      }
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showStep(index) {
  steps.forEach((s, i) => s.classList.toggle('active', i === index));
  currentStepIndex = index;
  const activeStep = document.querySelector('.step.active');
  const frame = document.getElementById('step-frame');
  if (frame) {
    if (activeStep && activeStep.hasAttribute('data-pillar-id')) frame.classList.add('show-step-arrows');
    else frame.classList.remove('show-step-arrows');
  }
  if (activeStep && activeStep.id === 'step-pillars') {
    renderPillarsOverview(collectAllData());
  }
  if (activeStep) activeStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goNext() {
  const inputCheck = validateCurrentStepInputs();
  if (!inputCheck.ok) {
    const step = document.querySelector('.step.active');
    showMessage(inputCheck.message, true);
    if (inputCheck.missingNames) markStepValidationErrors(step, inputCheck.missingNames);
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
  const isPillarsStep = currentStep && currentStep.id === 'step-pillars';
  if (isPillarsStep && finishFromPillar) {
    showStep(getPillarStepIndex(finishFromPillar) + 1);
  } else {
    showStep(currentStepIndex - 1);
  }
}

function getStepPillarId(stepEl) {
  return stepEl.dataset.pillarId || null;
}

const TEXTAREA_NAMES = ['poderoso', 'q1', 'q2', 'q3'];

function validateCurrentStepInputs() {
  const step = document.querySelector('.step.active');
  if (!step || !getStepPillarId(step)) return { ok: true };
  const checkboxesContainer = step.querySelector('.checkboxes');
  if (!checkboxesContainer) return { ok: true };
  const anyChecked = checkboxesContainer.querySelectorAll('input[type="checkbox"]:checked').length > 0;
  if (!anyChecked) return { ok: true };
  const missingNames = [];
  const missingLabels = [];
  TEXTAREA_NAMES.forEach(name => {
    const el = step.querySelector('textarea[name="' + name + '"]');
    const val = (el && el.value) ? el.value.trim() : '';
    if (!val) {
      missingNames.push(name);
      missingLabels.push(getString(LABEL_NAME_TO_KEY[name] || 'label_' + name));
    }
  });
  if (missingNames.length > 0) {
    return { ok: false, message: getString('msg_validation_fill_all').replace('{0}', missingLabels.join(', ')), missingNames };
  }
  return { ok: true };
}

function showMessage(text, isError) {
  document.getElementById('message-box').style.display = 'block';
  document.getElementById('confirm-box').style.display = 'none';
  const overlay = document.getElementById('message-overlay');
  const box = document.getElementById('message-box');
  const textEl = document.getElementById('message-box-text');
  if (textEl) textEl.textContent = text;
  box.classList.toggle('is-error', !!isError);
  overlay.classList.add('is-visible');
}

function hideMessage() {
  document.getElementById('message-overlay').classList.remove('is-visible');
  document.getElementById('message-box').classList.remove('is-error');
  document.getElementById('message-box').style.display = '';
  document.getElementById('confirm-box').style.display = 'none';
}

function showConfirm(message, onYes) {
  document.getElementById('message-box').style.display = 'none';
  document.getElementById('confirm-box').style.display = 'block';
  document.getElementById('confirm-text').textContent = message;
  document.getElementById('message-overlay').classList.add('is-visible');
  const overlay = document.getElementById('message-overlay');
  const doHide = function() {
    document.getElementById('message-overlay').classList.remove('is-visible');
    document.getElementById('confirm-box').style.display = 'none';
    document.getElementById('message-box').style.display = '';
  };
  document.getElementById('btn-confirm-yes').onclick = function() {
    onYes();
    doHide();
  };
  document.getElementById('btn-confirm-no').onclick = doHide;
}

function markStepValidationErrors(step, missingNames) {
  if (!step) return;
  TEXTAREA_NAMES.forEach(name => {
    const el = step.querySelector('textarea[name="' + name + '"]');
    if (el) {
      if (missingNames.indexOf(name) >= 0) el.classList.add('validation-error');
      else el.classList.remove('validation-error');
    }
  });
  step.querySelectorAll('textarea[name]').forEach(ta => {
    const once = function() {
      if ((ta.value || '').trim()) {
        ta.classList.remove('validation-error');
        ta.removeEventListener('input', once);
        ta.removeEventListener('change', once);
      }
    };
    ta.addEventListener('input', once);
    ta.addEventListener('change', once);
  });
}

function clearStepValidationErrors(step) {
  if (!step) return;
  step.querySelectorAll('textarea.validation-error').forEach(el => el.classList.remove('validation-error'));
}

function collectAllData() {
  const data = {};
  PILLAR_IDS.forEach((pillarId) => {
    const step = document.getElementById('step-' + pillarId);
    const checked = [];
    step.querySelectorAll('.checkboxes input[type="checkbox"]:checked').forEach(cb => {
      const idx = cb.getAttribute('data-cb-index');
      if (idx !== null) checked.push(parseInt(idx, 10));
    });
    const poderoso = (step.querySelector('textarea[name="poderoso"]') || {}).value || '';
    const q1 = (step.querySelector('textarea[name="q1"]') || {}).value || '';
    const q2 = (step.querySelector('textarea[name="q2"]') || {}).value || '';
    const q3 = (step.querySelector('textarea[name="q3"]') || {}).value || '';
    data[pillarId] = { checked, poderoso, q1, q2, q3 };
  });
  return data;
}

function hasAnyData(record) {
  return record.checked.length > 0 || (record.poderoso && record.poderoso.trim() !== '');
}

function recordHasAnyData(rec) {
  if (!rec) return false;
  const c = rec.checked && rec.checked.length > 0;
  const p = rec.poderoso && String(rec.poderoso).trim() !== '';
  const q1 = rec.q1 && String(rec.q1).trim() !== '';
  const q2 = rec.q2 && String(rec.q2).trim() !== '';
  const q3 = rec.q3 && String(rec.q3).trim() !== '';
  return c || p || q1 || q2 || q3;
}

function compactData(data) {
  const out = {};
  PILLAR_IDS.forEach(pillarId => {
    const rec = data[pillarId];
    if (!rec || !recordHasAnyData(rec)) return;
    const compactRec = { checked: rec.checked || [] };
    if (rec.poderoso && String(rec.poderoso).trim() !== '') compactRec.poderoso = rec.poderoso.trim();
    if (rec.q1 && String(rec.q1).trim() !== '') compactRec.q1 = rec.q1.trim();
    if (rec.q2 && String(rec.q2).trim() !== '') compactRec.q2 = rec.q2.trim();
    if (rec.q3 && String(rec.q3).trim() !== '') compactRec.q3 = rec.q3.trim();
    out[pillarId] = compactRec;
  });
  return out;
}

function validatePillarsOrder(data) {
  let lastFilledIndex = -1;
  for (let i = 0; i < PILLAR_IDS.length; i++) {
    const rec = data[PILLAR_IDS[i]];
    if (rec && hasAnyData(rec)) lastFilledIndex = i;
  }
  if (lastFilledIndex === -1) {
    return { valid: false, missingPillars: [], message: getString('msg_complete_one_pillar') };
  }
  const missingPillars = [];
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

function getPillarStepIndex(pillarId) {
  const idx = PILLAR_IDS.indexOf(pillarId);
  return idx >= 0 ? idx : 0;
}

function getLastPillarWithData(data) {
  let last = null;
  PILLAR_IDS.forEach(pillarId => {
    const rec = data[pillarId];
    if (rec && hasAnyData(rec)) last = pillarId;
  });
  return last;
}

function renderPillarsOverview(data) {
  let lastFilledIndex = -1;
  for (let i = 0; i < PILLAR_IDS.length; i++) {
    const rec = data[PILLAR_IDS[i]];
    if (rec && hasAnyData(rec)) lastFilledIndex = i;
  }
  const container = document.getElementById('pillars-list');
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
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const index = parseInt(this.getAttribute('data-pillar-index'), 10);
      showStep(index + 1);
    });
  });
}

function labelForCheckedItem(pillarId, item) {
  if (typeof item === 'number' && CHECKBOX_IDS[pillarId]) {
    return getString(CHECKBOX_IDS[pillarId][item]);
  }
  return String(item);
}

function renderSummary(data, fromPillar) {
  const container = document.getElementById('summary-content');
  const titleEl = document.getElementById('summary-title');

  const displayPillar = getLastPillarWithData(data);
  titleEl.textContent = (displayPillar ? getString('summary_you_are_at') + ' ' + getString('title_' + pillarLangKey(displayPillar)) : getString('title_summary'));

  const rec = displayPillar && data[displayPillar] ? data[displayPillar] : null;
  const adviceText = displayPillar ? getString('advice_' + pillarLangKey(displayPillar)) : '';
  let html = '';
  if (rec && hasAnyData(rec)) {
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
  document.getElementById('btn-history-back').textContent = getString('btn_back');
  document.getElementById('btn-history-delete').style.display = '';
  document.getElementById('btn-history-export').style.display = '';
  showStep(stepIds.indexOf('step-history'));
}

function renderHistoryList() {
  const historyList = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
  const panel = document.getElementById('history-panel');
  if (historyList.length === 0) {
    panel.innerHTML = '<p class="description">' + escapeHtml(getString('msg_no_records')) + '</p>';
    return;
  }
  let html = '<p class="description">' + escapeHtml(getString('msg_history_instructions')) + '</p><div class="history-list">';
  historyList.forEach((item, idx) => {
    html += '<div class="history-item record-link" data-record-index="' + idx + '"><span class="export-check-wrap"><input type="checkbox" class="export-checkbox" data-record-index="' + idx + '" checked></span><span class="record-date">' + escapeHtml(item.fecha || '') + '</span></div>';
  });
  html += '</div>';
  panel.innerHTML = html;
  panel.querySelectorAll('.export-checkbox').forEach(cb => {
    cb.addEventListener('click', function(e) { e.stopPropagation(); });
  });
  panel.querySelectorAll('.record-link').forEach(el => {
    el.addEventListener('click', function(e) {
      if (e.target.classList.contains('export-checkbox') || e.target.closest('.export-check-wrap')) return;
      const idx = parseInt(this.getAttribute('data-record-index'), 10);
      historyView = { detailIndex: idx };
      renderHistoryDetail(idx);
      document.getElementById('btn-history-back').textContent = getString('btn_back_to_list');
      document.getElementById('btn-history-delete').style.display = 'none';
      document.getElementById('btn-history-export').style.display = 'none';
    });
  });
}

function buildRecordHtml(item) {
  const data = migrateDataKeys(item.data || {});
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
  const historyList = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
  const indices = Array.from(checked).map(cb => parseInt(cb.getAttribute('data-record-index'), 10));
  const toExport = indices.map(i => historyList[i]).filter(Boolean);
  const style = '<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:1rem;color:#222;}.export-record{margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #ddd;}.export-record:last-child{border-bottom:none;}.export-pillar{margin-bottom:1.25rem;}.export-pillar h3{margin:0.5rem 0 0.25rem 0;font-size:1.1rem;}.export-pillar ul{margin:0.25rem 0;padding-left:1.25rem;}.export-pillar p{margin:0.25rem 0;}</style>';
  let body = '<h1>' + escapeHtml(getString('export_records_title')) + '</h1>';
  toExport.forEach(item => { body += buildRecordHtml(item); });
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

function doExportDownload(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function renderHistoryDetail(index) {
  const historyList = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
  const item = historyList[index];
  const panel = document.getElementById('history-panel');
  if (!item) {
    panel.innerHTML = '<p>' + escapeHtml(getString('msg_record_not_found')) + '</p>';
    return;
  }
  const data = migrateDataKeys(item.data || {});
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
    showMessage(inputCheck.message, true);
    if (inputCheck.missingNames) markStepValidationErrors(step, inputCheck.missingNames);
    return;
  }
  finishFromPillar = getStepPillarId(step);
  const data = collectAllData();
  clearStepValidationErrors(step);
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
  const historyList = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
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
  document.querySelector('.finish-btn').addEventListener('click', finish);
  document.getElementById('btn-view-summary').addEventListener('click', goToSummary);
  document.getElementById('btn-start-over').addEventListener('click', startOver);
  document.getElementById('btn-view-records-summary').addEventListener('click', openHistory);
  document.getElementById('btn-view-records-start').addEventListener('click', openHistory);
  document.getElementById('btn-history-back').addEventListener('click', function() {
    if (historyView === 'list') {
      showStep(historyReturnStep);
    } else {
      historyView = 'list';
      renderHistoryList();
      this.textContent = getString('btn_back');
      document.getElementById('btn-history-delete').style.display = '';
      document.getElementById('btn-history-export').style.display = '';
    }
  });
  document.getElementById('btn-history-export').addEventListener('click', exportHistoryHTML);
  document.getElementById('btn-history-delete').addEventListener('click', deleteAllRecords);
  document.getElementById('message-box-close').addEventListener('click', hideMessage);
  document.getElementById('message-overlay').addEventListener('click', function(e) {
    if (e.target === this) hideMessage();
  });
  document.getElementById('message-box').addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('confirm-box').addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('btn-start').addEventListener('click', function() {
    showStep(1);
  });
  var optionsTrigger = document.getElementById('options-trigger');
  var optionsDropdown = document.getElementById('options-dropdown');
  function closeOptionsMenu() {
    if (optionsDropdown) optionsDropdown.hidden = true;
    if (optionsTrigger) optionsTrigger.setAttribute('aria-expanded', 'false');
  }
  if (optionsTrigger && optionsDropdown) {
    optionsTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = !optionsDropdown.hidden;
      optionsDropdown.hidden = isOpen;
      optionsTrigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
    optionsDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
    document.addEventListener('click', function() { closeOptionsMenu(); });
    var optHomeEl = document.getElementById('opt-home');
    if (optHomeEl) optHomeEl.addEventListener('click', function() { showStep(0); closeOptionsMenu(); });
    var optProfileEl = document.getElementById('opt-profile');
    if (optProfileEl) optProfileEl.addEventListener('click', function() { closeOptionsMenu(); });
    var optLogoutEl = document.getElementById('opt-logout');
    if (optLogoutEl) optLogoutEl.addEventListener('click', function() { closeOptionsMenu(); });
  }
  var langMenuEl = document.getElementById('lang-menu');
  if (langMenuEl) {
    langMenuEl.addEventListener('change', function() {
      currentLang = this.value;
      localStorage.setItem(STORAGE_LANG, currentLang);
      document.documentElement.lang = currentLang === 'es_la' ? 'es' : 'en';
      loadLang(currentLang).then(function() {
        applyI18n();
      });
    });
  }
  if (typeof window.Capacitor !== 'undefined' && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    try {
      window.Capacitor.Plugins.App.addListener('backButton', function() {
        if (currentStepIndex > 0) {
          goBack();
        } else {
          if (window.Capacitor.Plugins.App.exitApp) {
            window.Capacitor.Plugins.App.exitApp();
          }
        }
      });
    } catch (e) {}
  }
}

loadLang(currentLang).then(function() {
  applyI18n();
  bindNav();
  const langSelect = document.getElementById('lang-menu');
  if (langSelect) langSelect.value = currentLang;
  document.documentElement.lang = currentLang === 'es_la' ? 'es' : 'en';
  showStep(0);
}).catch(function() {
  bindNav();
  var langSelect = document.getElementById('lang-menu');
  if (langSelect) langSelect.value = currentLang;
  document.documentElement.lang = currentLang === 'es_la' ? 'es' : 'en';
  showStep(0);
});
