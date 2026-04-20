/* ===================================================
   qualityStandards.js — Quality Standards Report Logic
   =================================================== */

let qualityStandardsReports = [];

const INSTITUTIONAL_STANDARDS = [
  { name: 'التخطيط الاستراتيجي', indicators: 7 },
  { name: 'القيادة والحوكمة', indicators: 6 },
  { name: 'إدارة الجودة والتطوير', indicators: 4 },
  { name: 'أعضاء هيئة التدريس والهيئة المعاونة', indicators: 3 },
  { name: 'الجهاز الإداري', indicators: 4 },
  { name: 'الموارد المالية والمادية', indicators: 6 },
  { name: 'المعايير الأكاديمية والبرامج التعليمية', indicators: 2 },
  { name: 'التدريس والتعلم', indicators: 2 },
  { name: 'الطلاب والخريجون', indicators: 6 },
  { name: 'البحث العلمي والأنشطة التعليمية', indicators: 6 },
  { name: 'الدراسات العليا', indicators: 4 },
  { name: 'المشاركة المجتمعية وتنمية البيئة', indicators: 4 },
];

const PROGRAMMATIC_STANDARDS = [
  { name: 'رسالة وإدارة البرنامج', indicators: 4 },
  { name: 'تصميم البرنامج', indicators: 4 },
  { name: 'التعليم والتعلم والتقييم', indicators: 8 },
  { name: 'الطلاب والخريجون', indicators: 3 },
  { name: 'أعضاء هيئة التدريس والهيئة المعاونة', indicators: 6 },
  { name: 'الموارد ومصادر التعلم والتسهيلات الداعمة', indicators: 4 },
  { name: 'ضمان الجودة وتقييم البرنامج', indicators: 5 },
];

const REPORT_FORM_TYPE_COUNT = 2;
const PROGRAM_LABELS = { CS: 'علوم الحاسب', IS: 'نظم المعلومات', AI: 'الذكاء الاصطناعي' };
const TYPE_LABELS = { institutional: 'مؤسسي', programmatic: 'برامجي' };
const STATUS_LABELS = { fulfilled: 'مستوفي', partial: 'مستوفي جزئي', unfulfilled: 'غير مستوفي', '': '—' };
const STATUS_COLORS = { fulfilled: '#166534', partial: '#d97706', unfulfilled: '#dc2626', '': '#64748b' };
const QS_VIEW_STATE_KEY = 'must_quality_qs_view_state';

function saveQSViewState(state) {
  try {
    if (!state) {
      localStorage.removeItem(QS_VIEW_STATE_KEY);
      return;
    }
    localStorage.setItem(QS_VIEW_STATE_KEY, JSON.stringify(state));
  } catch (_) {}
}

function consumeQSViewState() {
  try {
    const raw = localStorage.getItem(QS_VIEW_STATE_KEY);
    if (!raw) return null;
    localStorage.removeItem(QS_VIEW_STATE_KEY);
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function applySavedQSViewState() {
  const state = consumeQSViewState();
  if (!state) return false;

  const typeEl = document.getElementById('filter-qs-type');
  const programEl = document.getElementById('filter-qs-program');
  const dateEl = document.getElementById('filter-qs-date');
  const standardEl = document.getElementById('filter-qs-report');

  if (typeEl) typeEl.value = state.type || '';
  if (programEl) programEl.value = state.program || '';
  if (scopeEl) scopeEl.value = state.scope || 'all-standards';

  updateQSViewFilters();

  if (dateEl && state.date) dateEl.value = state.date;
  updateQSViewFilters();

  if (standardEl && state.standardNumber !== undefined && state.standardNumber !== null && state.standardNumber !== '') {
    standardEl.value = String(state.standardNumber);
  }

  updateQSViewMode();
  renderQSTable();
  return true;
}

function refreshDashboardMetaStats() {
  const inst = document.getElementById('stat-institutional');
  const prog = document.getElementById('stat-programmatic');
  const types = document.getElementById('stat-report-types');
  if (inst) inst.textContent = INSTITUTIONAL_STANDARDS.length;
  if (prog) prog.textContent = PROGRAMMATIC_STANDARDS.length;
  if (types) types.textContent = String(REPORT_FORM_TYPE_COUNT);
}

function getStandardsByType(type) {
  return type === 'institutional' ? INSTITUTIONAL_STANDARDS : PROGRAMMATIC_STANDARDS;
}

function getLoadedQualityReports() {
  if (typeof loadFromStorage === 'function' && typeof STORAGE_KEYS !== 'undefined') {
    qualityStandardsReports = loadFromStorage(STORAGE_KEYS.qualityReports, []);
  }
  return Array.isArray(qualityStandardsReports) ? qualityStandardsReports : [];
}

function renderStandards() {
  const type = document.getElementById('qs-type')?.value || '';
  const area = document.getElementById('standards-area');
  const progGroup = document.getElementById('qs-program-group');
  const stdNumSel = document.getElementById('qs-std-num');
  const notesSection = document.getElementById('qs-notes-section');
  if (!area || !progGroup || !stdNumSel || !notesSection) return;

  progGroup.style.display = type === 'programmatic' ? 'flex' : 'none';
  stdNumSel.innerHTML = '<option value="">-- الكل --</option>';
  area.innerHTML = '';
  notesSection.style.display = type ? 'block' : 'none';

  if (!type) return;

  getStandardsByType(type).forEach((s, i) => {
    stdNumSel.innerHTML += `<option value="${i}">المعيار ${i + 1}: ${s.name}</option>`;
  });
  renderStandardCards();
}

function renderStandardCards() {
  const type = document.getElementById('qs-type')?.value || '';
  const selectedStd = document.getElementById('qs-std-num')?.value || '';
  const area = document.getElementById('standards-area');
  if (!type || !area) {
    if (area) area.innerHTML = '';
    return;
  }

  const standards = getStandardsByType(type);
  const entries = selectedStd !== '' ? [{ standard: standards[parseInt(selectedStd, 10)], index: parseInt(selectedStd, 10) }] : standards.map((standard, index) => ({ standard, index }));

  area.innerHTML = `<div class="form-section"><div class="form-section-title">المعايير والمؤشرات</div><div class="standards-grid" id="stds-grid"></div></div>`;
  const grid = document.getElementById('stds-grid');
  entries.forEach(({ standard, index }) => {
    let rows = '';
    for (let indicator = 1; indicator <= standard.indicators; indicator += 1) {
      rows += `
      <div class="ind-row">
        <span class="ind-num">${index + 1}.${indicator}</span>
        <span class="ind-name">المؤشر ${indicator}</span>
        <select class="ind-select" id="ind-${index}-${indicator}">
          <option value="">-- اختر --</option>
          <option value="fulfilled">مستوفي</option>
          <option value="partial">مستوفي جزئي</option>
          <option value="unfulfilled">غير مستوفي</option>
        </select>
        <input type="text" class="ind-notes" id="ind-notes-${index}-${indicator}" placeholder="ملاحظات المؤشر (اختياري)" />
      </div>`;
    }

    grid.innerHTML += `
      <div class="standard-card" data-standard-index="${index}">
        <div class="standard-card-header">
          <div class="num">${index + 1}</div>
          <div>
            <div class="name">المعيار ${index + 1}: ${standard.name}</div>
            <div class="ind-count">${standard.indicators} مؤشر</div>
          </div>
        </div>
        <div class="standard-card-body">
          ${rows}
          <div class="notes-field">
            <label>ملاحظات المعيار</label>
            <textarea id="std-notes-${index}" placeholder="ملاحظات على هذا المعيار..."></textarea>
          </div>
        </div>
      </div>`;
  });
}

function collectStandardReport(type, standardIndex) {
  const standards = getStandardsByType(type);
  const standard = standards[standardIndex];
  const indicatorData = {};
  let fulfilled = 0;
  let partial = 0;
  let unfulfilled = 0;

  for (let indicator = 1; indicator <= standard.indicators; indicator += 1) {
    const status = document.getElementById(`ind-${standardIndex}-${indicator}`)?.value || '';
    const notes = document.getElementById(`ind-notes-${standardIndex}-${indicator}`)?.value?.trim() || '';
    indicatorData[indicator] = { indicatorNumber: `${standardIndex + 1}.${indicator}`, status, notes };
    if (status === 'fulfilled') fulfilled += 1;
    if (status === 'partial') partial += 1;
    if (status === 'unfulfilled') unfulfilled += 1;
  }

  return {
    id: Date.now() + standardIndex,
    createdAt: new Date().toISOString(),
    date: document.getElementById('qs-date')?.value || '',
    type,
    accreditationType: type,
    typeLabel: TYPE_LABELS[type] || type,
    program: type === 'programmatic' ? (document.getElementById('qs-program')?.value || '') : '',
    programLabel: type === 'programmatic' ? (PROGRAM_LABELS[document.getElementById('qs-program')?.value || ''] || '') : '',
    standardIndex,
    standardNumber: standardIndex + 1,
    standardName: standard.name,
    indicatorCount: standard.indicators,
    indicatorData,
    fulfilled,
    partial,
    unfulfilled,
    notes: document.getElementById(`std-notes-${standardIndex}`)?.value?.trim() || '',
    generalNotes: document.getElementById('qs-notes')?.value?.trim() || '',
    userId: currentUser ? currentUser.id : null,
    userName: currentUser ? currentUser.name : 'Unknown',
  };
}

async function submitQualityStandards() {
  const date = document.getElementById('qs-date')?.value || '';
  const type = document.getElementById('qs-type')?.value || '';
  const selectedStd = document.getElementById('qs-std-num')?.value || '';
  const program = document.getElementById('qs-program')?.value || '';

  if (!date || !type) {
    showToast('يرجى إدخال تاريخ التقرير ونوع المعيار', 'error');
    return;
  }
  if (type === 'programmatic' && !program) {
    showToast('يرجى اختيار البرنامج للتقرير البرامجي', 'error');
    return;
  }

  const targets = selectedStd !== '' ? [parseInt(selectedStd, 10)] : getStandardsByType(type).map((_, index) => index);
  const newReports = targets.map((index) => collectStandardReport(type, index));

  const canSync =
    currentUser &&
    currentUser.role !== 'viewer' &&
    (currentUser.email === 'admin@must.edu.eg' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'main_admin');

  if (canSync) {
    try {
      for (const rep of newReports) {
        const res = await fetch('/api/quality-standards', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: rep.type, data: rep }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) {
          showToast(j.error || 'فشل حفظ تقرير الجودة على الخادم', 'error');
          return;
        }
        if (j.id) rep.id = j.id;
      }
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
      return;
    }
  }

  qualityStandardsReports.push(...newReports);
  if (typeof saveToStorage === 'function' && typeof STORAGE_KEYS !== 'undefined') {
    saveToStorage(STORAGE_KEYS.qualityReports, qualityStandardsReports);
  }
  updateStatCount();

  if (selectedStd !== '' && newReports.length === 1) {
    saveQSViewState({
      scope: 'single-standard',
      type,
      program: type === 'programmatic' ? program : '',
      date,
      standardNumber: newReports[0].standardNumber,
    });
  } else {
    saveQSViewState({
      scope: 'all-standards',
      type,
      program: type === 'programmatic' ? program : '',
      date,
      standardNumber: '',
    });
  }

  updateQSViewFilters();
  renderQSTable();
  showToast(`تم حفظ ${newReports.length} تقرير معيار بنجاح ✅`, 'success');
  resetQSForm(false);
}

function resetQSForm(showMessage = true) {
  const dateEl = document.getElementById('qs-date');
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
  ['qs-type', 'qs-program', 'qs-notes', 'qs-std-num'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const area = document.getElementById('standards-area');
  if (area) area.innerHTML = '';
  const programGroup = document.getElementById('qs-program-group');
  if (programGroup) programGroup.style.display = 'none';
  const notesSection = document.getElementById('qs-notes-section');
  if (notesSection) notesSection.style.display = 'none';
  if (showMessage) showToast('تم مسح النموذج');
}

function getLatestReportByStandard(reports) {
  const latestMap = new Map();
  reports.forEach((report) => {
    const key = `${report.type || ''}|${report.program || ''}|${report.date || ''}|${report.standardNumber || ''}`;
    const existing = latestMap.get(key);
    const reportStamp = String(report.createdAt || report.date || '') + `|${report.id || ''}`;
    const existingStamp = existing ? String(existing.createdAt || existing.date || '') + `|${existing.id || ''}` : '';
    if (!existing || reportStamp > existingStamp) {
      latestMap.set(key, report);
    }
  });
  return Array.from(latestMap.values());
}


function updateQSStandardOptions() {
  const reports = getLoadedQualityReports();
  const type = document.getElementById('filter-qs-type')?.value || '';
  const date = document.getElementById('filter-qs-date')?.value || '';
  const program = document.getElementById('filter-qs-program')?.value || '';
  const standardSelect = document.getElementById('filter-qs-report');
  if (!standardSelect) return;

  const currentValue = standardSelect.value;
  let filtered = reports.filter((report) => {
    if (type && report.type !== type) return false;
    if (date && report.date !== date) return false;
    if (type === 'programmatic' && program && report.program !== program) return false;
    return true;
  });

  filtered = getLatestReportByStandard(filtered)
    .sort((a, b) => (a.standardNumber - b.standardNumber) || String(a.standardName || '').localeCompare(String(b.standardName || '')));

  standardSelect.innerHTML = '<option value="">كل المعايير</option>' + filtered
    .map((report) => `<option value="${report.standardNumber}">المعيار ${report.standardNumber}: ${report.standardName}</option>`)
    .join('');

  if (filtered.some((report) => String(report.standardNumber) === String(currentValue))) {
    standardSelect.value = currentValue;
  } else {
    standardSelect.value = '';
  }

  standardSelect.disabled = !type || !date || (type === 'programmatic' && !program) || filtered.length === 0;
}

function updateQSViewMode() {
  const type = document.getElementById('filter-qs-type')?.value || '';
  const programWrapper = document.getElementById('filter-qs-program-wrapper');
  const reportWrapper = document.getElementById('filter-qs-report-wrapper');
  if (programWrapper) programWrapper.style.display = type === 'programmatic' ? 'flex' : 'none';
  if (reportWrapper) reportWrapper.style.display = type ? 'flex' : 'none';
}

function updateQSViewFilters() {
  const reports = getLoadedQualityReports();
  const dateSelect = document.getElementById('filter-qs-date');
  const programSelect = document.getElementById('filter-qs-program');
  const type = document.getElementById('filter-qs-type')?.value || '';
  if (!dateSelect) return;

  const currentDate = dateSelect.value;
  const currentProgram = programSelect?.value || '';

  if (programSelect && type !== 'programmatic') {
    programSelect.value = '';
  }

  const dates = Array.from(new Set(
    reports
      .filter((report) => {
        if (type && report.type !== type) return false;
        if (type === 'programmatic' && currentProgram && report.program !== currentProgram) return false;
        return true;
      })
      .map((report) => report.date)
  )).sort((a, b) => b.localeCompare(a));

  dateSelect.innerHTML = '<option value="">-- اختر التاريخ --</option>' + dates
    .map((date) => `<option value="${date}">${date}</option>`)
    .join('');

  if (dates.includes(currentDate)) {
    dateSelect.value = currentDate;
  } else {
    dateSelect.value = '';
  }

  updateQSStandardOptions();
  updateQSViewMode();
}

function getFilteredQSReports() {
  const reports = [...getLoadedQualityReports()];
  const type = document.getElementById('filter-qs-type')?.value || '';
  const date = document.getElementById('filter-qs-date')?.value || '';
  const standardNumber = document.getElementById('filter-qs-report')?.value || '';
  const program = document.getElementById('filter-qs-program')?.value || '';

  let filtered = reports.filter((report) => {
    if (type && report.type !== type) return false;
    if (date && report.date !== date) return false;
    if (type === 'programmatic' && program && report.program !== program) return false;
    if (standardNumber && String(report.standardNumber) !== String(standardNumber)) return false;
    return true;
  });

  return getLatestReportByStandard(filtered)
    .sort((a, b) => (a.standardNumber - b.standardNumber) || String(a.standardName || '').localeCompare(String(b.standardName || '')));
}

function getStandardStatus(report) {
  const entries = getSortedIndicatorEntries(report);
  const counts = entries.reduce((acc, item) => {
    if (item.status === 'fulfilled') acc.fulfilled += 1;
    else if (item.status === 'partial') acc.partial += 1;
    else if (item.status === 'unfulfilled') acc.unfulfilled += 1;
    else acc.empty += 1;
    return acc;
  }, { fulfilled: 0, partial: 0, unfulfilled: 0, empty: 0 });

  const total = entries.length;
  if (!total || counts.empty === total) return '';
  if (counts.fulfilled === total) return 'fulfilled';
  if (counts.unfulfilled === total) return 'unfulfilled';
  return 'partial';
}

function updateQSViewSummary(data) {
  const summary = document.getElementById('qs-view-summary');
  if (!summary) return;

  const type = document.getElementById('filter-qs-type')?.value || '';
  const date = document.getElementById('filter-qs-date')?.value || '';
  const program = document.getElementById('filter-qs-program');
  const standard = document.getElementById('filter-qs-report');

  if (!type) {
    summary.textContent = 'اختر نوع الاعتماد لعرض التقارير.';
    return;
  }
  if (type === 'programmatic' && !document.getElementById('filter-qs-program')?.value) {
    summary.textContent = 'اختر البرنامج أولًا لعرض المعايير البرامجية.';
    return;
  }
  if (!date) {
    summary.textContent = 'اختر تاريخ التقرير لعرض البيانات.';
    return;
  }
  if (!data.length) {
    summary.textContent = 'لا توجد تقارير مطابقة للفلاتر الحالية.';
    return;
  }

  const programText = type === 'programmatic' ? (program?.selectedOptions?.[0]?.textContent || '') : '';
  const selectedStandard = standard?.value ? (standard?.selectedOptions?.[0]?.textContent || '') : '';
  const standardNames = data.map((report) => `المعيار ${report.standardNumber}: ${report.standardName}`).join(' | ');
  summary.innerHTML = `
    <strong>النوع:</strong> ${type === 'institutional' ? 'مؤسسي' : 'برامجي'}
    ${programText ? `<span> — <strong>البرنامج:</strong> ${programText}</span>` : ''}
    <span> — <strong>التاريخ:</strong> ${date}</span>
    <span> — <strong>المعايير:</strong> ${selectedStandard || standardNames}</span>
  `;
}

function updateQSTableHeader(isSingleStandard) {
  const head = document.getElementById('qs-view-head');
  if (!head) return;
  if (isSingleStandard) {
    head.innerHTML = `
      <tr>
        <th>م</th>
        <th>رقم المؤشر</th>
        <th>حالة المؤشر</th>
        <th>ملاحظات المؤشر</th>
      </tr>`;
    return;
  }

  head.innerHTML = `
    <tr>
      <th>م</th>
      <th>نوع المعيار</th>
      <th>رقم المعيار</th>
      <th>اسم المعيار</th>
      <th>البرنامج</th>
      <th>حالة الاستيفاء</th>
      <th>ملاحظات المعيار</th>
    </tr>`;
}

function buildQSSingleReportRows(report) {
  const indicatorRows = getSortedIndicatorEntries(report).map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.indicatorNumber}</td>
      <td style="color:${STATUS_COLORS[item.status] || '#64748b'};font-weight:700">${STATUS_LABELS[item.status] || '—'}</td>
      <td>${item.notes || '—'}</td>
    </tr>`).join('');

  const notesRow = report.notes
    ? `<tr><td colspan="4" style="background:#fff7ed"><strong>ملاحظات المعيار:</strong> ${report.notes}</td></tr>`
    : '';

  const generalNotesRow = report.generalNotes
    ? `<tr><td colspan="4" style="background:#eff6ff"><strong>ملاحظات عامة:</strong> ${report.generalNotes}</td></tr>`
    : '';

  return indicatorRows + notesRow + generalNotesRow;
}

function renderQSTable() {
  const tbody = document.getElementById('qs-view-body');
  if (!tbody) return;

  updateQSViewFilters();

  const type = document.getElementById('filter-qs-type')?.value || '';
  const date = document.getElementById('filter-qs-date')?.value || '';
  const selectedStandard = document.getElementById('filter-qs-report')?.value || '';
  const program = document.getElementById('filter-qs-program')?.value || '';
  const isSingleStandard = Boolean(selectedStandard);

  updateQSTableHeader(isSingleStandard);

  if (!type) {
    updateQSViewSummary([]);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--gray)">اختر نوع الاعتماد أولًا</td></tr>';
    return;
  }

  if (type === 'programmatic' && !program) {
    updateQSViewSummary([]);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--gray)">اختر البرنامج أولًا لعرض المعايير البرامجية</td></tr>';
    return;
  }

  if (!date) {
    updateQSViewSummary([]);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--gray)">اختر تاريخ التقرير أولًا</td></tr>';
    return;
  }

  const data = getFilteredQSReports();
  updateQSViewSummary(data);

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="${isSingleStandard ? 4 : 7}" style="text-align:center;padding:2rem;color:var(--gray)">لا توجد تقارير مطابقة</td></tr>`;
    return;
  }

  if (isSingleStandard && data.length === 1) {
    tbody.innerHTML = buildQSSingleReportRows(data[0]);
    return;
  }

  tbody.innerHTML = data.map((report, index) => {
    const status = getStandardStatus(report);
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${report.typeLabel}</td>
        <td>${report.standardNumber}</td>
        <td>${report.standardName}</td>
        <td>${report.programLabel || '—'}</td>
        <td style="color:${STATUS_COLORS[status] || '#64748b'};font-weight:700">${STATUS_LABELS[status] || '—'}</td>
        <td>${report.notes || '—'}</td>
      </tr>`;
  }).join('');
}

async function downloadQualityWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const QUALITY_XLSX_THEME = Object.freeze({
  titleBlue: 'FF1F4E78',
  headerBlue: 'FF4F81BD',
  lightBlue: 'FFDCE6F1',
  labelGray: 'FFE7E6E6',
  borderGray: 'FF7F7F7F',
  white: 'FFFFFFFF',
  black: 'FF000000',
});

function getExcelColumnLetter(columnNumber) {
  let dividend = columnNumber;
  let columnName = '';
  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return columnName;
}

function createQualityBorder() {
  return {
    top: { style: 'thin', color: { argb: QUALITY_XLSX_THEME.borderGray } },
    left: { style: 'thin', color: { argb: QUALITY_XLSX_THEME.borderGray } },
    bottom: { style: 'thin', color: { argb: QUALITY_XLSX_THEME.borderGray } },
    right: { style: 'thin', color: { argb: QUALITY_XLSX_THEME.borderGray } },
  };
}

function getQualityStatusArgb(status) {
  if (status === 'fulfilled') return 'FF166534';
  if (status === 'partial') return 'FFD97706';
  if (status === 'unfulfilled') return 'FFDC2626';
  return QUALITY_XLSX_THEME.black;
}

function styleQualityCell(cell, options = {}) {
  const {
    fillColor = QUALITY_XLSX_THEME.white,
    bold = false,
    fontColor = QUALITY_XLSX_THEME.black,
    horizontal = 'center',
    vertical = 'middle',
    wrapText = true,
  } = options;

  cell.font = {
    name: 'Arial',
    size: 11,
    bold,
    color: { argb: fontColor },
  };
  cell.alignment = { horizontal, vertical, wrapText };
  cell.border = createQualityBorder();
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
}

function setupQualitySheet(worksheet, title, columnCount, subtitle = '') {
  worksheet.views = [{ rightToLeft: true }];
  worksheet.pageSetup = {
    paperSize: 9,
    orientation: columnCount > 4 ? 'landscape' : 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.25, right: 0.25, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
  };

  const lastColumnLetter = getExcelColumnLetter(columnCount);
  worksheet.mergeCells(`A1:${lastColumnLetter}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: QUALITY_XLSX_THEME.black } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.border = createQualityBorder();
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: QUALITY_XLSX_THEME.white } };
  worksheet.getRow(1).height = 28;

  worksheet.mergeCells(`A2:${lastColumnLetter}2`);
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = subtitle || 'جامعة مصر للعلوم والتكنولوجيا - كلية تكنولوجيا المعلومات - وحدة ضمان الجودة';
  subtitleCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: QUALITY_XLSX_THEME.titleBlue } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subtitleCell.border = createQualityBorder();
  subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: QUALITY_XLSX_THEME.white } };
  worksheet.getRow(2).height = 22;

  return lastColumnLetter;
}

function addQualityMetaRows(worksheet, startRowNumber, rows, lastColumnNumber) {
  let currentRow = startRowNumber;
  rows.forEach(([label, value]) => {
    worksheet.mergeCells(currentRow, 2, currentRow, lastColumnNumber);
    const labelCell = worksheet.getCell(currentRow, 1);
    labelCell.value = label;
    styleQualityCell(labelCell, { fillColor: QUALITY_XLSX_THEME.labelGray, bold: true, horizontal: 'right' });

    const valueCell = worksheet.getCell(currentRow, 2);
    valueCell.value = value || '—';
    styleQualityCell(valueCell, { fillColor: QUALITY_XLSX_THEME.white, horizontal: 'right' });

    for (let col = 3; col <= lastColumnNumber; col += 1) {
      styleQualityCell(worksheet.getCell(currentRow, col), { fillColor: QUALITY_XLSX_THEME.white, horizontal: 'right' });
    }

    worksheet.getRow(currentRow).height = 21;
    currentRow += 1;
  });
  return currentRow;
}

function styleQualityHeaderRow(row) {
  row.eachCell({ includeEmpty: true }, (cell) => {
    styleQualityCell(cell, {
      fillColor: QUALITY_XLSX_THEME.headerBlue,
      fontColor: QUALITY_XLSX_THEME.black,
      bold: true,
      horizontal: 'center',
    });
  });
  row.height = 24;
}

function styleQualityDataRow(row, striped = false) {
  row.eachCell({ includeEmpty: true }, (cell) => {
    styleQualityCell(cell, {
      fillColor: striped ? QUALITY_XLSX_THEME.lightBlue : QUALITY_XLSX_THEME.white,
      horizontal: 'center',
    });
  });
  row.height = 22;
}

function colorQualityStatusCell(cell, status) {
  cell.font = {
    ...(cell.font || {}),
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: getQualityStatusArgb(status) },
  };
}

function finalizeQualityTable(worksheet, headerRowNumber, lastRowNumber, lastColumnNumber) {
  worksheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: Math.max(lastRowNumber, headerRowNumber), column: lastColumnNumber },
  };
  worksheet.views = [{ rightToLeft: true, state: 'frozen', ySplit: headerRowNumber }];
}

async function buildQualityWorkbook(reports) {
  if (!window.ExcelJS) {
    throw new Error('مكتبة ExcelJS غير محملة');
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MUST Quality';
  workbook.created = new Date();

  const selectedStandard = document.getElementById('filter-qs-report')?.value || '';
  const isSingleStandard = Boolean(selectedStandard) && reports.length === 1;

  if (isSingleStandard) {
    const report = reports[0];
    const sheet = workbook.addWorksheet('تقرير المعيار');
    sheet.columns = [
      { width: 8 },
      { width: 18 },
      { width: 18 },
      { width: 54 },
    ];

    setupQualitySheet(sheet, 'تقرير معيار من معايير الجودة', 4, `المعيار ${report.standardNumber}: ${report.standardName}`);

    let currentRow = 4;
    currentRow = addQualityMetaRows(sheet, currentRow, [
      ['نوع المعيار', report.typeLabel],
      ['رقم المعيار', report.standardNumber],
      ['اسم المعيار', report.standardName],
      ['البرنامج', report.programLabel || '—'],
      ['تاريخ التقرير', report.date || '—'],
      ['حالة الاستيفاء', STATUS_LABELS[getStandardStatus(report)] || '—'],
    ], 4);

    currentRow += 1;
    const headerRowNumber = currentRow;
    const headerRow = sheet.getRow(headerRowNumber);
    headerRow.values = ['م', 'رقم المؤشر', 'حالة المؤشر', 'ملاحظات المؤشر'];
    styleQualityHeaderRow(headerRow);

    const indicators = getSortedIndicatorEntries(report);
    indicators.forEach((item, index) => {
      const row = sheet.getRow(headerRowNumber + 1 + index);
      row.values = [
        index + 1,
        item.indicatorNumber,
        STATUS_LABELS[item.status] || '—',
        item.notes || '',
      ];
      styleQualityDataRow(row, index % 2 === 1);
      row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
      colorQualityStatusCell(row.getCell(3), item.status);
    });

    let lastRowNumber = headerRowNumber + Math.max(indicators.length, 1);

    const noteRows = [];
    if (report.notes) noteRows.push(['ملاحظات المعيار', report.notes]);
    if (report.generalNotes) noteRows.push(['ملاحظات عامة', report.generalNotes]);
    if (noteRows.length) {
      lastRowNumber += 2;
      addQualityMetaRows(sheet, lastRowNumber, noteRows, 4);
      lastRowNumber += noteRows.length - 1;
    }

    finalizeQualityTable(sheet, headerRowNumber, headerRowNumber + indicators.length, 4);
    return workbook;
  }

  const summarySheet = workbook.addWorksheet('تقارير الجودة');
  summarySheet.columns = [
    { width: 8 },
    { width: 16 },
    { width: 14 },
    { width: 32 },
    { width: 18 },
    { width: 18 },
    { width: 40 },
  ];
  setupQualitySheet(summarySheet, 'التقرير المجمع لمعايير الجودة', 7, `إجمالي التقارير: ${reports.length}`);

  let summaryHeaderRowNumber = 4;
  summaryHeaderRowNumber = addQualityMetaRows(summarySheet, summaryHeaderRowNumber, [
    ['تاريخ التصدير', new Date().toISOString().split('T')[0]],
    ['إجمالي التقارير', String(reports.length)],
  ], 7);
  summaryHeaderRowNumber += 1;

  const summaryHeaderRow = summarySheet.getRow(summaryHeaderRowNumber);
  summaryHeaderRow.values = ['م', 'نوع المعيار', 'رقم المعيار', 'اسم المعيار', 'البرنامج', 'حالة الاستيفاء', 'ملاحظات المعيار'];
  styleQualityHeaderRow(summaryHeaderRow);

  reports.forEach((report, index) => {
    const row = summarySheet.getRow(summaryHeaderRowNumber + 1 + index);
    const status = getStandardStatus(report);
    row.values = [
      index + 1,
      report.typeLabel,
      report.standardNumber,
      report.standardName,
      report.programLabel || '—',
      STATUS_LABELS[status] || '—',
      report.notes || '',
    ];
    styleQualityDataRow(row, index % 2 === 1);
    row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
    row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
    colorQualityStatusCell(row.getCell(6), status);
  });
  finalizeQualityTable(summarySheet, summaryHeaderRowNumber, summaryHeaderRowNumber + reports.length, 7);

  const detailsSheet = workbook.addWorksheet('المؤشرات');
  detailsSheet.columns = [
    { width: 28 },
    { width: 16 },
    { width: 18 },
    { width: 44 },
  ];
  setupQualitySheet(detailsSheet, 'تفاصيل مؤشرات معايير الجودة', 4, 'تفصيل جميع المؤشرات حسب المعيار');

  let detailsHeaderRowNumber = 4;
  detailsHeaderRowNumber = addQualityMetaRows(detailsSheet, detailsHeaderRowNumber, [
    ['إجمالي التقارير', String(reports.length)],
    ['إجمالي المؤشرات', String(reports.reduce((sum, report) => sum + getSortedIndicatorEntries(report).length, 0))],
  ], 4);
  detailsHeaderRowNumber += 1;

  const detailsHeaderRow = detailsSheet.getRow(detailsHeaderRowNumber);
  detailsHeaderRow.values = ['المعيار', 'رقم المؤشر', 'حالة المؤشر', 'ملاحظات المؤشر'];
  styleQualityHeaderRow(detailsHeaderRow);

  let detailRowIndex = 0;
  reports.forEach((report) => {
    getSortedIndicatorEntries(report).forEach((item) => {
      const row = detailsSheet.getRow(detailsHeaderRowNumber + 1 + detailRowIndex);
      row.values = [
        `المعيار ${report.standardNumber}: ${report.standardName}`,
        item.indicatorNumber,
        STATUS_LABELS[item.status] || '—',
        item.notes || '',
      ];
      styleQualityDataRow(row, detailRowIndex % 2 === 1);
      row.getCell(1).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
      row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
      colorQualityStatusCell(row.getCell(3), item.status);
      detailRowIndex += 1;
    });
  });
  finalizeQualityTable(detailsSheet, detailsHeaderRowNumber, detailsHeaderRowNumber + detailRowIndex, 4);

  return workbook;
}

function buildAllStandardsPdf(reports) {
  const rows = reports.map((report, index) => {
    const status = getStandardStatus(report);
    return `
      <tr>
        <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center">${index + 1}</td>
        <td style="padding:6px 8px;border:1px solid #d8e0ea">${report.typeLabel}</td>
        <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center">${report.standardNumber}</td>
        <td style="padding:6px 8px;border:1px solid #d8e0ea">${report.standardName}</td>
        <td style="padding:6px 8px;border:1px solid #d8e0ea">${report.programLabel || '—'}</td>
        <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center;color:${STATUS_COLORS[status] || '#64748b'};font-weight:700">${STATUS_LABELS[status] || '—'}</td>
        <td style="padding:6px 8px;border:1px solid #d8e0ea">${report.notes || '—'}</td>
      </tr>`;
  }).join('');

  return `
    <html dir="rtl"><head><meta charset="UTF-8"><title>تقارير معايير الجودة</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
    <style>*{box-sizing:border-box} body{font-family:Cairo,sans-serif;padding:18px;color:#002147;direction:rtl;font-size:12px} table{width:100%;border-collapse:collapse;font-size:.82rem} th{background:#002147;color:#fff;padding:8px;border:1px solid #001530;text-align:right} @page{size:A4 landscape;margin:12mm}@media print{ @page{size:A4 landscape;margin:12mm} body{margin:0;} }</style></head><body>
    ${buildQualityReportHeader('تقارير معايير الجودة', reports.map((report) => `المعيار ${report.standardNumber}: ${report.standardName}`).join(' | '))}
    <table><thead><tr><th>م</th><th>نوع المعيار</th><th>رقم المعيار</th><th>اسم المعيار</th><th>البرنامج</th><th>حالة الاستيفاء</th><th>ملاحظات المعيار</th></tr></thead><tbody>${rows}</tbody></table>
    </body></html>`;
}

function buildQualityReportHeader(title, subtitle = '') {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px;border-bottom:2px solid #dbe4f0;padding-bottom:10px;">
      <img src="${location.origin}/must-logo.png" alt="MUST" style="width:72px;height:72px;object-fit:contain" />
      <div style="flex:1;text-align:center">
        <div style="font-size:0.95rem;font-weight:700;color:#002147">جامعة مصر للعلوم والتكنولوجيا</div>
        <div style="font-size:1.05rem;font-weight:800;color:#002147">كلية تكنولوجيا المعلومات</div>
        <div style="font-size:0.9rem;color:#4b5563">وحدة ضمان الجودة</div>
        <div style="font-size:1.15rem;font-weight:800;color:#002147;margin-top:6px">${title}</div>
        ${subtitle ? `<div style="font-size:0.82rem;color:#6b7280;margin-top:2px">${subtitle}</div>` : ''}
      </div>
      <img src="${location.origin}/assets/images/quality-unit-logo.jpg" alt="Quality" style="width:72px;height:72px;object-fit:contain" />
    </div>`;
}

function getSortedIndicatorEntries(report) {
  return Object.values(report?.indicatorData || {}).sort((a, b) => {
    const aParts = String(a?.indicatorNumber || '').split('.').map((value) => parseInt(value, 10) || 0);
    const bParts = String(b?.indicatorNumber || '').split('.').map((value) => parseInt(value, 10) || 0);
    return (aParts[0] - bParts[0]) || (aParts[1] - bParts[1]);
  });
}

function buildQualityDetailsPdf(reports) {
  const rows = [];
  reports.forEach((report) => {
    getSortedIndicatorEntries(report).forEach((item) => {
      rows.push(`
        <tr>
          <td style="padding:6px 8px;border:1px solid #d8e0ea">${`المعيار ${report.standardNumber}: ${report.standardName}`}</td>
          <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center">${item.indicatorNumber}</td>
          <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center;color:${STATUS_COLORS[item.status] || '#64748b'};font-weight:700">${STATUS_LABELS[item.status] || '—'}</td>
          <td style="padding:6px 8px;border:1px solid #d8e0ea">${item.notes || '—'}</td>
        </tr>`);
    });
  });

  const totalIndicators = rows.length;
  const standardsList = reports.map((r) => `المعيار ${r.standardNumber}: ${r.standardName}`).join(' | ');

  return `
    <html dir="rtl"><head><meta charset="UTF-8"><title>تفاصيل مؤشرات معايير الجودة</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
    <style>*{box-sizing:border-box} body{font-family:Cairo,sans-serif;padding:18px;color:#002147;direction:rtl;font-size:12px} table{width:100%;border-collapse:collapse;font-size:.82rem} th{background:#002147;color:#fff;padding:8px;border:1px solid #001530;text-align:right} @page{size:A4 landscape;margin:12mm}@media print{ @page{size:A4 landscape;margin:12mm} body{margin:0;} }</style></head><body>
    ${buildQualityReportHeader('تفاصيل مؤشرات معايير الجودة', `إجمالي المؤشرات: ${totalIndicators} | ${standardsList}`)}
    <table><thead><tr><th>المعيار</th><th style="width:120px;text-align:center">رقم المؤشر</th><th style="width:160px;text-align:center">حالة المؤشر</th><th>ملاحظات المؤشر</th></tr></thead><tbody>${rows.join('')}</tbody></table>
    </body></html>`;
}


function exportQSPDF() {
  const reports = getLoadedQualityReports();
  if (!reports.length) {
    showToast('لا توجد تقارير محفوظة للتصدير', 'error');
    return;
  }
  const latest = [...reports].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
  printHtmlForPdf(buildQualityStandardPdf(latest));
}

function exportQSViewPDF() {
  const type = document.getElementById('filter-qs-type')?.value || '';
  const date = document.getElementById('filter-qs-date')?.value || '';
  const program = document.getElementById('filter-qs-program')?.value || '';

  if (!type) {
    showToast('اختر نوع الاعتماد أولًا قبل التصدير', 'error');
    return;
  }
  if (!date) {
    showToast('اختر تاريخ التقرير أولًا قبل التصدير', 'error');
    return;
  }
  if (type === 'programmatic' && !program) {
    showToast('اختر البرنامج أولًا قبل التصدير', 'error');
    return;
  }

  const data = getFilteredQSReports();
  if (!data.length) {
    showToast('لا توجد تقارير للتصدير', 'error');
    return;
  }

  if ((document.getElementById('filter-qs-report')?.value || '') && data.length === 1) {
    printHtmlForPdf(buildQualityStandardPdf(data[0]));
    return;
  }

  printHtmlForPdf(buildQualityDetailsPdf(data));
}

async function exportQSViewExcel() {
  const type = document.getElementById('filter-qs-type')?.value || '';
  const date = document.getElementById('filter-qs-date')?.value || '';
  const program = document.getElementById('filter-qs-program')?.value || '';

  if (!type) {
    showToast('اختر نوع الاعتماد أولًا قبل التصدير', 'error');
    return;
  }
  if (!date) {
    showToast('اختر تاريخ التقرير أولًا قبل التصدير', 'error');
    return;
  }
  if (type === 'programmatic' && !program) {
    showToast('اختر البرنامج أولًا قبل التصدير', 'error');
    return;
  }

  const data = getFilteredQSReports();
  if (!data.length) {
    showToast('لا توجد تقارير للتصدير', 'error');
    return;
  }

  try {
    const workbook = await buildQualityWorkbook(data);
    const selectedStandard = document.getElementById('filter-qs-report')?.value || '';
    const filename = selectedStandard && data.length === 1
      ? `تقرير_المعيار_${data[0].standardNumber}.xlsx`
      : 'تقارير_معايير_الجودة.xlsx';
    await downloadQualityWorkbook(workbook, filename);
  } catch (error) {
    console.error(error);
    showToast('تعذر إنشاء ملف Excel لتقارير الجودة', 'error');
  }
}

function exportQSExcel() {
  exportQSViewExcel();
}

function initQualityStandardsModule() {
  const dateEl = document.getElementById('qs-date');
  const typeSelect = document.getElementById('qs-type');
  const standardSelect = document.getElementById('qs-std-num');

  if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().split('T')[0];

  if (typeSelect && !typeSelect.dataset.boundQualityStandards) {
    typeSelect.addEventListener('change', renderStandards);
    typeSelect.dataset.boundQualityStandards = 'true';
  }

  if (standardSelect && !standardSelect.dataset.boundQualityStandards) {
    standardSelect.addEventListener('change', renderStandardCards);
    standardSelect.dataset.boundQualityStandards = 'true';
  }

  updateQSViewFilters();
  updateQSViewMode();
  renderQSTable();
}

document.addEventListener('DOMContentLoaded', initQualityStandardsModule);
window.applySavedQSViewState = applySavedQSViewState;
