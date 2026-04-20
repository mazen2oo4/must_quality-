/* ===================================================
   courseFile.js — Course File Report Logic
   =================================================== */

let courseFileReports = [];

const REGULATION_LABELS = {
  old: 'اللائحة القديمة',
  new: 'اللائحة الجديدة',
};

const COURSE_REGULATIONS = {
  old: {
    label: 'اللائحة القديمة',
    programs: {
      CS: {
        label: 'علوم الحاسب',
        courses: [
          ['CS101', 'Introduction to Computers Programming'],
          ['CS102', 'Structured Programming'],
          ['CS201', 'Object-Oriented Programming'],
          ['CS211', 'Concepts of Programming Language'],
          ['CS212', 'Data Structures'],
          ['CS251', 'Computer Architecture'],
          ['CS301', 'Data Communication and Networking'],
          ['CS311', 'Systems Programming and Assembly Language'],
          ['CS312', 'Modern Development Tools'],
          ['CS321', 'Theory of Computation'],
          ['CS331', 'Analysis and Design of Algorithms'],
          ['CS341', 'Software Engineering I'],
          ['CS352', 'Compiler Design'],
          ['CS361', 'Introduction to Artificial Intelligence'],
          ['CS371', 'Numerical Methods'],
          ['CS381', 'Operating Systems I'],
          ['CS401', 'Computer Science Seminar'],
          ['CS402', 'Computer Graphics'],
          ['CS409', 'Selected Topics in Computer Science'],
          ['CS441', 'Software Engineering II'],
          ['CS442', 'Software project Management'],
          ['CS451', 'Operating Systems II'],
          ['CS452', 'Computer Security'],
          ['CS462', 'Neural Network'],
          ['CS481', 'Pattern Recognition'],
          ['CS482', 'Computer Networks'],
          ['CS483', 'Computers Interface and Multimedia Systems'],
          ['CS484', 'Parallel Processing'],
          ['CS498', 'Senior CS Project I'],
          ['CS499', 'Senior CS Project II'],
        ],
      },
      IS: {
        label: 'نظم المعلومات',
        courses: [
          ['IS101', 'Fundamentals of Information Systems'],
          ['IS231', 'Operations Research'],
          ['IS301', 'Electronic Commerce'],
          ['IS311', 'File Organization'],
          ['IS312', 'Introduction to Database'],
          ['IS321', 'Systems Analysis and Design'],
          ['IS322', 'Object Oriented Analysis and Design'],
          ['IS331', 'Modeling and Simulation'],
          ['IS341', 'Management Information Systems'],
          ['IS401', 'Information Systems Seminar'],
          ['IS402', 'Internet Technologies'],
          ['IS409', 'Selected Topics in Information Systems'],
          ['IS411', 'Knowledge-Based Systems'],
          ['IS413', 'Design and Implementation of Database'],
          ['IS421', 'Data Analysis'],
          ['IS423', 'Advanced database management'],
          ['IS431', 'Decision Support and Business Intelligent Systems'],
          ['IS441', 'Management of Information Centers'],
          ['IS451', 'Information System Development'],
          ['IS461', 'Human Computer Interaction'],
          ['IS462', 'Multimedia Information Systems'],
          ['IS466', 'Foundations for Business Intelligence'],
          ['IS467', 'Introduction to Geographic Information Systems'],
          ['IS470', 'Business Analytics for BIS'],
          ['IS471', 'Enterprise Data'],
          ['IS472', 'Business Process Modeling & Analysis'],
          ['IS473', 'Critical Performance Management'],
          ['IS474', 'Predictive Analytics'],
          ['IS475', 'Management Issues in Business Intelligence'],
          ['IS476', 'Advanced Business Informatics'],
          ['IS477', 'Information Technology Acquisition Management'],
          ['IS478', 'Intelligent Financial Information systems'],
          ['IS479', 'Intelligent Accounting Information Systems'],
          ['IS480', 'GIS Spatial Database Development'],
          ['IS481', 'GIS Relational Databases'],
          ['IS482', 'GIS Laboratory'],
          ['IS483', 'Interactive Web Mapping for GIS'],
          ['IS484', 'GIS Management, Finance, and Policies'],
          ['IS498', 'Senior IS Project-I'],
          ['IS499', 'Senior IS Project-II'],
        ],
      },
    },
  },
  new: {
    label: 'اللائحة الجديدة',
    common: [
      ['CS101', 'Introduction to Computer Science'],
      ['CS102', 'Introduction to Computer Programming'],
      ['IS101', 'Introduction to Information Systems'],
      ['CS103', 'Object-Oriented Programming'],
      ['CS211', 'Concepts of Programming Languages'],
      ['CS212', 'Data Structures'],
      ['AI201', 'Introduction to AI'],
      ['IS220', 'Database Management Systems'],
      ['AI230', 'Embedded Systems'],
      ['CS231', 'Analysis and Design of Algorithms'],
      ['CS251', 'Computer Architecture and Organization'],
      ['IS311', 'Systems Analysis and Design'],
      ['CS341', 'Software Engineering'],
      ['CS351', 'Operating Systems'],
      ['CS381', 'Computer Networks I'],
      ['Math101', 'Calculus I'],
      ['Math102', 'Calculus II'],
      ['Math241', 'Linear Algebra'],
      ['Math251', 'Discrete Mathematics'],
      ['Math301', 'Applied Probability and Statistics'],
      ['Phy101', 'Physics I'],
      ['Phy102', 'Physics II'],
      ['ECE202', 'Logic Design'],
      ['UARAB101', 'اللغة العربية'],
      ['UCOMP101', 'مهارات الحاسوب'],
      ['UENGL101', 'مهارات اللغة الإنجليزية'],
      ['UENGL098', 'مهارات اللغة الإنجليزية التمهيدية 1'],
      ['UENGL099', 'مهارات اللغة الإنجليزية التمهيدية 2'],
      ['UHUMN102', 'التفكير العلمي'],
    ],
    universityElectives: [
      ['UMART101', 'الفن الحديث'],
      ['UEGY101', 'الفن المصري القديم'],
      ['UBA101', 'إدارة الأعمال'],
      ['ULM101', 'سوق العمل'],
      ['UPES101', 'أخلاقيات المهنة'],
      ['UCC101', 'الجرائم الإلكترونية'],
      ['UWEB101', 'تصميم المواقع الإلكترونية'],
    ],
    programs: {
      CS: {
        label: 'علوم الحاسب',
        courses: [
          ['CS302', 'Computer Graphics'],
          ['CS321', 'Theory of Computation'],
          ['IS341', 'Mobile Computing'],
          ['AI343', 'Neural Networks'],
          ['CS383', 'Image Processing'],
          ['CS401', 'Selected Topics in CS'],
          ['CS411', 'Compiler Design'],
          ['AI414', 'Machine Learning'],
          ['CS452', 'Computer Security'],
          ['CS481', 'Pattern Recognition'],
          ['CS482', 'Computer Networks II'],
          ['CS484', 'Parallel and Distributed Computing'],
          ['CS311', 'Systems Prog. and Assembly Lang.'],
          ['CS312', 'Modern Development Tools'],
          ['CS371', 'Numerical Methods'],
          ['IS321', 'Operation Research'],
          ['IS322', 'Data Mining'],
          ['CS441', 'Advanced Software Engineering'],
          ['IS431', 'Modeling and Simulation'],
          ['CS442', 'Software Project Management'],
          ['CS451', 'Advanced Operating Systems'],
          ['AI464', 'Deep Learning'],
          ['AI483', 'Computer Vision'],
          ['CS498', 'CS Senior Project I'],
          ['CS499', 'CS Senior Project II'],
        ],
      },
      IS: {
        label: 'نظم المعلومات',
        courses: [
          ['IS301', 'Electronic Commerce'],
          ['AI342', 'Introduction to Data Science'],
          ['IS321', 'Operation Research'],
          ['IS322', 'Data Mining'],
          ['IS341', 'Mobile Computing'],
          ['IS401', 'Selected Topics in IS'],
          ['IS402', 'Internet Technologies'],
          ['IS421', 'Big Data Analytics'],
          ['IS431', 'Modeling and Simulation'],
          ['IS432', 'Business Intelligence and DSS'],
          ['IS466', 'Information Security'],
          ['IS467', 'Introduction to GIS'],
          ['CS371', 'Numerical Methods'],
          ['CS312', 'Modern Development Tools'],
          ['IS343', 'Information Storage Management'],
          ['IS361', 'Human Computer Interaction'],
          ['IS411', 'Knowledge-Based Systems'],
          ['IS413', 'Advanced Database Manag. Systems'],
          ['CS441', 'Advanced Software Engineering'],
          ['IS462', 'Information Retrieval'],
          ['CS442', 'Software Project Management'],
          ['IS471', 'Block Chain & Digital Currency'],
          ['CS482', 'Computer Networks II'],
          ['CS484', 'Parallel and Distributed Computing'],
          ['IS498', 'IS Senior Project I'],
          ['IS499', 'IS Senior Project II'],
        ],
      },
      AI: {
        label: 'الذكاء الاصطناعي',
        courses: [
          ['AI301', 'AI Programming Languages'],
          ['AI331', 'Introduction to Robotics'],
          ['AI332', 'Kinematics and Dynamics of Robotics'],
          ['AI342', 'Introduction to Data Science'],
          ['AI343', 'Neural Networks'],
          ['CS383', 'Image Processing'],
          ['AI401', 'Selected Topics in AI'],
          ['AI414', 'Machine Learning'],
          ['AI461', 'Human Machine Interface'],
          ['AI462', 'Natural Language Processing'],
          ['AI466', 'Signal and Speech Processing'],
          ['AI483', 'Computer Vision'],
          ['AI345', 'Industrial Robotics Applications'],
          ['AI346', 'AI Applications'],
          ['AI352', 'Internet of Things (IoT)'],
          ['CS371', 'Numerical Methods'],
          ['AI402', 'AI Strategies & Algorithms'],
          ['AI403', 'Knowledge Representation'],
          ['AI412', 'Expert Systems'],
          ['AI441', 'Fuzzy Systems'],
          ['AI442', 'Game Theory'],
          ['AI449', 'Soft Computing'],
          ['AI464', 'Deep Learning'],
          ['AI465', 'Optimization Techniques'],
          ['AI471', 'Block Chain & Digital Currency'],
          ['AI472', 'Big Data & Data Mining'],
          ['CS452', 'Computer Security'],
          ['AI498', 'AI Senior Project I'],
          ['AI499', 'AI Senior Project II'],
        ],
      },
    },
  },
};

/** Official table style: CS101 → CS 101 (values in data stay compact). */
function formatCourseCodeForDisplay(code) {
  if (!code) return '';
  const s = String(code).trim();
  const m = s.match(/^([A-Za-z]+)(\d[\w]*)$/i);
  return m ? `${m[1]} ${m[2]}` : s;
}

function uniqueCourses(courses) {
  return Array.from(new Map(courses.map((c) => [c.code, c])).values()).sort((a, b) => a.code.localeCompare(b.code));
}

function flattenCourses(regulationKey, programKey = '') {
  const reg = COURSE_REGULATIONS[regulationKey];
  if (!reg) return [];

  const courses = [];
  if (reg.common) courses.push(...reg.common.map(([code, name]) => ({ code, name, program: 'COMMON' })));
  if (reg.universityElectives) courses.push(...reg.universityElectives.map(([code, name]) => ({ code, name, program: 'UNIV' })));

  if (programKey && reg.programs[programKey]) {
    courses.push(...reg.programs[programKey].courses.map(([code, name]) => ({ code, name, program: programKey })));
  } else {
    Object.entries(reg.programs).forEach(([program, meta]) => {
      courses.push(...meta.courses.map(([code, name]) => ({ code, name, program })));
    });
  }

  return uniqueCourses(courses);
}

const COURSE_CODES = uniqueCourses([
  ...flattenCourses('old'),
  ...flattenCourses('new'),
]);

const CF_DOCS = [
  'كود المقرر',
  'تاريخ التقرير',
  'اسم أستاذ المقرر',
  'توصيف المقرر',
  'تقرير المقرر',
  'البلو برنت',
  'إحصائيات النتائج',
  'نتائج استبيان المقرر',
  'نموذج الامتحان النهائي التحريري',
  'تسليم نموذج الامتحان التعويضي',
  'نموذج إجابة الامتحان النهائي التحريري',
  'نموذج الامتحان النهائي العملي',
  'نموذج إجابة الامتحان النهائي العملي',
  'نماذج حلول الطلاب في الامتحان النهائي',
  'كويز 1',
  'نموذج إجابة كويز 1',
  'نماذج حلول الطلاب في كويز 1',
  'كويز 2',
  'نموذج إجابة كويز 2',
  'نماذج حلول الطلاب في كويز 2',
  'كتاب المقرر',
];

const WEEKS = [
  'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع',
  'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر',
];

function getProgramOptions(regulationKey) {
  const reg = COURSE_REGULATIONS[regulationKey];
  if (!reg) return [];
  return Object.entries(reg.programs).map(([value, meta]) => ({ value, label: meta.label }));
}

function populateProgramDropdown(selectId, regulationKey, includeAll = true) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const current = select.value;
  const options = getProgramOptions(regulationKey);
  select.innerHTML = includeAll ? '<option value="">الكل</option>' : '<option value="">-- اختر البرنامج --</option>';
  options.forEach((opt) => {
    const el = document.createElement('option');
    el.value = opt.value;
    el.textContent = opt.label;
    select.appendChild(el);
  });
  if (options.some((opt) => opt.value === current)) select.value = current;
}

function getSelectedFormCourses() {
  const regulation = document.getElementById('cf-list')?.value || 'new';
  const program = document.getElementById('cf-program')?.value || '';
  return flattenCourses(regulation, program);
}

function buildCourseCodeDropdown(targetId = 'cf-code', includeAll = false, courses = null) {
  const sel = document.getElementById(targetId);
  if (!sel) return;
  const current = sel.value;
  const sourceCourses = courses || getSelectedFormCourses();
  sel.innerHTML = includeAll ? '<option value="">All</option>' : '<option value="">-- اختر المقرر --</option>';
  sourceCourses.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = `(${formatCourseCodeForDisplay(c.code)})`;
    opt.dataset.name = c.name;
    opt.dataset.program = c.program || '';
    sel.appendChild(opt);
  });
  if (sourceCourses.some((c) => c.code === current)) sel.value = current;
  if (targetId === 'cf-code') autoFillCourseName();
}

function syncCourseDropdowns() {
  const regulation = document.getElementById('cf-list')?.value || 'new';
  populateProgramDropdown('cf-program', regulation, false);
  buildCourseCodeDropdown('cf-code', false);
  autoFillCourseName();
}

function updateCourseViewMode() {
  const scope = document.getElementById('filter-course-scope')?.value || 'all';
  const wrapper = document.getElementById('filter-course-wrapper');
  if (wrapper) wrapper.style.display = scope === 'single' ? 'flex' : 'none';
  const courseSelect = document.getElementById('filter-course');
  if (courseSelect && scope !== 'single') courseSelect.value = '';
}

function syncCourseViewFilters() {
  const regulation = document.getElementById('filter-List')?.value || '';
  const scope = document.getElementById('filter-course-scope')?.value || 'all';
  populateProgramDropdown('filter-program', regulation || 'new', true);
  const courses = regulation ? flattenCourses(regulation, document.getElementById('filter-program')?.value || '') : uniqueCourses([
    ...flattenCourses('old'),
    ...flattenCourses('new'),
  ]);
  buildCourseCodeDropdown('filter-course', scope !== 'single', courses);
  updateCourseViewMode();
}

function onCourseViewFilterChanged() {
  syncCourseViewFilters();
  renderCFTable();
}

function autoFillCourseName() {
  const sel = document.getElementById('cf-code');
  const nameEl = document.getElementById('cf-name');
  if (!sel || !nameEl) return;
  const selected = sel.options[sel.selectedIndex];
  nameEl.value = selected?.dataset?.name || '';
}

function buildCFDocs() {
  const tbody = document.getElementById('cf-docs-body');
  if (!tbody) return;
  tbody.innerHTML = CF_DOCS.map((doc, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${doc}</td>
      <td>
        <div class="radio-group">
          <label><input type="radio" name="doc${i}" value="yes"> متوفر</label>
          <label><input type="radio" name="doc${i}" value="no"> غير متوفر</label>
        </div>
      </td>
    </tr>`).join('');
}

function buildWeeklyContent() {
  const tbody = document.getElementById('weekly-body');
  if (!tbody) return;
  tbody.innerHTML = WEEKS.map((w, i) => `
    <tr>
      <td>الأسبوع ${w}</td>
      <td>
        <div class="radio-group">
          <label><input type="radio" name="week${i}" value="yes"> متوفرة</label>
          <label><input type="radio" name="week${i}" value="no"> غير متوفرة</label>
        </div>
      </td>
    </tr>`).join('');
}

function collectDocs() {
  return CF_DOCS.map((doc, i) => {
    const checked = document.querySelector(`input[name="doc${i}"]:checked`);
    return { name: doc, status: checked ? checked.value : '' };
  });
}

function collectWeeks() {
  return WEEKS.map((w, i) => {
    const checked = document.querySelector(`input[name="week${i}"]:checked`);
    return { name: `الأسبوع ${w}`, status: checked ? checked.value : '' };
  });
}

function submitCourseFile() {
  const date = document.getElementById('cf-date')?.value;
  const code = document.getElementById('cf-code')?.value?.trim();
  const name = document.getElementById('cf-name')?.value?.trim();
  const regulation = document.getElementById('cf-list')?.value;

  if (!date || !code || !name || !regulation) {
    showToast('يرجى إدخال تاريخ التقرير واللائحة والمقرر', 'error');
    return;
  }

  buildCFDocs();
  buildWeeklyContent();

  document.getElementById('cf-basic-section').style.display = 'none';
  document.getElementById('cf-back-button-area').style.display = 'block';
  document.getElementById('cf-docs-section').style.display = 'block';
  document.getElementById('cf-weekly-section').style.display = 'block';
  document.getElementById('cf-notes-section').style.display = 'block';
  document.getElementById('cf-submit-btn').style.display = 'none';
  document.getElementById('cf-secondary-actions').style.display = 'flex';
}

function goBackToBasicData() {
  document.getElementById('cf-basic-section').style.display = 'block';
  document.getElementById('cf-back-button-area').style.display = 'none';
  document.getElementById('cf-docs-section').style.display = 'none';
  document.getElementById('cf-weekly-section').style.display = 'none';
  document.getElementById('cf-notes-section').style.display = 'none';
  document.getElementById('cf-submit-btn').style.display = 'block';
  document.getElementById('cf-secondary-actions').style.display = 'none';
}

function detectProgramFromCourse(regulation, code) {
  const reg = COURSE_REGULATIONS[regulation];
  if (!reg) return '';
  const match = Object.entries(reg.programs).find(([, meta]) => meta.courses.some((c) => c[0] === code));
  if (match) return match[0];
  if (reg.common?.some((c) => c[0] === code)) return 'COMMON';
  if (reg.universityElectives?.some((c) => c[0] === code)) return 'UNIV';
  return '';
}

async function saveCourseFile() {
  const regulation = document.getElementById('cf-list')?.value || '';
  const code = document.getElementById('cf-code')?.value?.trim() || '';
  const name = document.getElementById('cf-name')?.value?.trim() || '';
  const date = document.getElementById('cf-date')?.value || '';

  if (!regulation || !code || !name || !date) {
    showToast('يرجى استكمال البيانات الأساسية أولاً', 'error');
    return;
  }

  const selectedProgram = document.getElementById('cf-program')?.value || '';
  const report = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    date,
    code,
    name,
    list: regulation,
    listLabel: REGULATION_LABELS[regulation] || regulation,
    semester: document.getElementById('cf-semester')?.value || '',
    level: document.getElementById('cf-level')?.value || '',
    program: selectedProgram || detectProgramFromCourse(regulation, code),
    programLabel: COURSE_REGULATIONS[regulation]?.programs[selectedProgram || detectProgramFromCourse(regulation, code)]?.label || '',
    prof: document.getElementById('cf-prof')?.value?.trim() || '',
    notes: document.getElementById('cf-notes')?.value?.trim() || '',
    docs: collectDocs(),
    weeks: collectWeeks(),
    userId: currentUser ? currentUser.id : null,
    userName: currentUser ? currentUser.name : 'Unknown',
  };

  const canSync =
    currentUser &&
    currentUser.role !== 'viewer' &&
    (currentUser.email === 'admin@must.edu.eg' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'main_admin');

  if (canSync) {
    try {
      const res = await fetch('/api/course-file', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_code: report.code,
          course_name: report.name,
          data: report,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(j.error || 'فشل حفظ التقرير على الخادم', 'error');
        return;
      }
      if (j.id) report.id = j.id;
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
      return;
    }
  }

  courseFileReports.push(report);
  if (typeof saveToStorage === 'function' && typeof STORAGE_KEYS !== 'undefined') {
    saveToStorage(STORAGE_KEYS.courseReports, courseFileReports);
  }
  updateStatCount();
  renderCFTable();
  showToast('تم حفظ تقرير ملف المقرر بنجاح ✅', 'success');
  resetCourseForm(false);
}

function resetCourseForm(showMessage = true) {
  ['cf-date', 'cf-name', 'cf-prof', 'cf-notes'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['cf-semester', 'cf-program', 'cf-list', 'cf-code'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('#cf-docs-body input[type=radio], #weekly-body input[type=radio]').forEach((r) => {
    r.checked = false;
  });
  const dateEl = document.getElementById('cf-date');
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
  goBackToBasicData();
  syncCourseDropdowns();
  if (showMessage) showToast('تم مسح النموذج');
}

function getLoadedCourseReports() {
  if (typeof loadFromStorage === 'function' && typeof STORAGE_KEYS !== 'undefined') {
    courseFileReports = loadFromStorage(STORAGE_KEYS.courseReports, []);
  }
  return Array.isArray(courseFileReports) ? courseFileReports : [];
}

function getFilteredCourseReports({ latestOnly = true } = {}) {
  const reports = [...getLoadedCourseReports()];
  const semester = document.getElementById('filter-semester')?.value || '';
  const regulation = document.getElementById('filter-List')?.value || '';
  const program = document.getElementById('filter-program')?.value || '';
  const scope = document.getElementById('filter-course-scope')?.value || 'all';
  const courseCode = scope === 'single' ? (document.getElementById('filter-course')?.value || '') : '';

  let data = reports.filter((r) => {
    if (semester && r.semester !== semester) return false;
    if (regulation && r.list !== regulation) return false;
    if (program && r.program !== program) return false;
    if (courseCode && r.code !== courseCode) return false;
    return true;
  });

  data.sort((a, b) => {
    const dateComp = (b.date || '').localeCompare(a.date || '');
    if (dateComp !== 0) return dateComp;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  if (!latestOnly) return data;

  const map = new Map();
  data.forEach((report) => {
    const key = `${report.list || ''}|${report.program || ''}|${report.code}`;
    if (!map.has(key)) map.set(key, report);
  });
  return Array.from(map.values());
}

function updateCourseViewSummary(data) {
  const summary = document.getElementById('cf-view-summary');
  if (!summary) return;
  const scope = document.getElementById('filter-course-scope')?.value || 'all';
  const selectedCourse = document.getElementById('filter-course');
  const courseText = selectedCourse?.selectedOptions?.[0]?.textContent || '';
  if (scope === 'single') {
    summary.innerHTML = `<strong>نطاق العرض:</strong> ${courseText || 'مقرر محدد'} <span>— يتم عرض آخر تقرير محفوظ لهذا المقرر فقط.</span>`;
  } else {
    summary.innerHTML = `<strong>نطاق العرض:</strong> جميع المقررات المطابقة للفلاتر <span>— إجمالي العناصر المعروضة: ${data.length}</span>`;
  }
}

function renderCFTable() {
  const tbody = document.getElementById('cf-view-body');
  if (!tbody) return;

  const scope = document.getElementById('filter-course-scope')?.value || 'all';
  const courseCode = document.getElementById('filter-course')?.value || '';
  if (scope === 'single' && !courseCode) {
    updateCourseViewSummary([]);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--gray)">اختر مادة / مقررًا محددًا لعرض تقريره</td></tr>';
    return;
  }

  const data = getFilteredCourseReports({ latestOnly: true });
  updateCourseViewSummary(data);
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--gray)">لا توجد تقارير مطابقة</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.date || '—'}</td>
      <td>${r.listLabel || REGULATION_LABELS[r.list] || '—'}</td>
      <td><strong>${formatCourseCodeForDisplay(r.code)}</strong></td>
      <td>${r.name || '—'}</td>
      <td>${r.prof || '—'}</td>
      <td>${r.semester || '—'}</td>
      <td>${r.notes ? `<span title="${r.notes}">📝</span>` : '—'}</td>
    </tr>`).join('');
}

function countByStatus(items, positiveValue = 'yes') {
  return (items || []).filter((item) => item.status === positiveValue).length;
}

function getCourseDocStatusLabel(status) {
  if (status === 'yes') return 'متوفر';
  if (status === 'no') return 'غير متوفر';
  return '';
}

function getCourseWeekStatusLabel(status) {
  if (status === 'yes') return 'متوفرة';
  if (status === 'no') return 'غير متوفرة';
  return '';
}

function getCourseDocValue(report, name) {
  const item = (report.docs || []).find((doc) => doc.name === name);
  return getCourseDocStatusLabel(item?.status || '');
}

function getCourseWeekValue(report, ordinalLabel) {
  const item = (report.weeks || []).find((week) => String(week.name || '').includes(ordinalLabel));
  return getCourseWeekStatusLabel(item?.status || '');
}

function triggerExcelDownload(buffer, filename) {
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

async function buildCourseFileTemplateWorkbook(reports) {
  if (!window.ExcelJS) {
    throw new Error('مكتبة ExcelJS غير محملة');
  }

  // Template embedded as base64 — no server fetch needed
  const TEMPLATE_B64 = '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';
  const byteChars = atob(TEMPLATE_B64);
  const byteNums = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(byteNums.buffer);

  const worksheet = workbook.getWorksheet('Course File') || workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('ورقة Course File غير موجودة في النموذج');
  }

  worksheet.spliceColumns(1, 2);

  const startRow = 3;
  const lastDataColumn = 45; // AS بعد حذف عمودي اسم المصحح الثاني ورصد الدرجات ع البانر
  const shiftColumnLetter = (column, offset = -2) => {
    let number = 0;
    for (let i = 0; i < column.length; i += 1) {
      number = number * 26 + (column.charCodeAt(i) - 64);
    }
    number += offset;
    let result = '';
    while (number > 0) {
      const remainder = (number - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      number = Math.floor((number - 1) / 26);
    }
    return result;
  };
  const templateLastRow = Math.max(worksheet.rowCount || startRow, startRow);
  const extraBandFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };

  const clearRowValues = (rowNumber) => {
    const row = worksheet.getRow(rowNumber);
    for (let col = 1; col <= lastDataColumn; col += 1) {
      row.getCell(col).value = null;
    }
    row.commit();
  };

  const cloneCellStyle = (sourceCell, targetCell) => {
    targetCell.style = JSON.parse(JSON.stringify(sourceCell.style || {}));
    if (sourceCell.numFmt) targetCell.numFmt = sourceCell.numFmt;
    if (sourceCell.alignment) targetCell.alignment = JSON.parse(JSON.stringify(sourceCell.alignment));
    if (sourceCell.border) targetCell.border = JSON.parse(JSON.stringify(sourceCell.border));
    if (sourceCell.fill) targetCell.fill = JSON.parse(JSON.stringify(sourceCell.fill));
    if (sourceCell.font) targetCell.font = JSON.parse(JSON.stringify(sourceCell.font));
    if (sourceCell.protection) targetCell.protection = JSON.parse(JSON.stringify(sourceCell.protection));
    targetCell.value = null;
  };

  const cloneTemplateRow = (sourceRowNumber, targetRowNumber) => {
    const sourceRow = worksheet.getRow(sourceRowNumber);
    const targetRow = worksheet.getRow(targetRowNumber);
    targetRow.height = sourceRow.height;
    for (let col = 1; col <= lastDataColumn; col += 1) {
      cloneCellStyle(sourceRow.getCell(col), targetRow.getCell(col));
    }
    targetRow.commit();
  };

  const applyExtraRowBanding = (rowNumber) => {
    const isBanded = (rowNumber - startRow) % 2 === 1;
    if (!isBanded) return;
    const row = worksheet.getRow(rowNumber);
    for (let col = 1; col <= lastDataColumn; col += 1) {
      const cell = row.getCell(col);
      cell.fill = JSON.parse(JSON.stringify(extraBandFill));
    }
    row.commit();
  };

  const requiredLastRow = Math.max(startRow + reports.length - 1, templateLastRow);
  const cleanupEndRow = Math.max(requiredLastRow, templateLastRow);

  for (let rowNumber = startRow; rowNumber <= cleanupEndRow; rowNumber += 1) {
    if (rowNumber > templateLastRow) {
      cloneTemplateRow(templateLastRow, rowNumber);
      applyExtraRowBanding(rowNumber);
    }
    clearRowValues(rowNumber);
  }

  const weekColumns = [
    ['D', 'الرابع عشر'],
    ['E', 'الثالث عشر'],
    ['F', 'الثاني عشر'],
    ['G', 'الحادي عشر'],
    ['H', 'العاشر'],
    ['I', 'التاسع'],
    ['J', 'الثامن'],
    ['K', 'السابع'],
    ['L', 'السادس'],
    ['M', 'الخامس'],
    ['N', 'الرابع'],
    ['O', 'الثالث'],
    ['P', 'الثاني'],
    ['Q', 'الأول'],
  ];

  const docColumns = {
    R: 'كتاب المقرر',
    S: 'نماذج حلول الطلاب في كويز 1',
    T: 'نموذج إجابة كويز 2',
    U: 'كويز 2',
    V: 'نماذج حلول الطلاب في كويز 2',
    W: 'نموذج إجابة كويز 1',
    X: 'كويز 1',
    Y: 'نماذج حلول الطلاب في الامتحان النهائي',
    Z: 'نموذج إجابة الامتحان النهائي العملي',
    AA: 'نموذج الامتحان النهائي العملي',
    AB: 'نموذج إجابة الامتحان النهائي التحريري',
    AC: 'تسليم نموذج الامتحان التعويضي',
    AD: 'نموذج الامتحان النهائي التحريري',
    AE: 'نتائج استبيان المقرر',
    AF: 'إحصائيات النتائج',
    AG: 'البلو برنت',
    AH: 'تقرير المقرر',
    AI: 'توصيف المقرر',
  };

  reports.forEach((report, index) => {
    const rowNumber = startRow + index;
    const row = worksheet.getRow(rowNumber);

    row.getCell('A').value = report.notes || '';

    weekColumns.forEach(([column, label]) => {
      row.getCell(shiftColumnLetter(column)).value = getCourseWeekValue(report, label);
    });

    Object.entries(docColumns).forEach(([column, docName]) => {
      row.getCell(shiftColumnLetter(column)).value = getCourseDocValue(report, docName);
    });

    row.getCell('AH').value = '';
    row.getCell('AI').value = '';
    row.getCell('AJ').value = '';
    row.getCell('AK').value = '';
    row.getCell('AL').value = '';
    row.getCell('AM').value = '';
    row.getCell('AN').value = report.prof || '';
    row.getCell('AO').value = report.name || '';
    row.getCell('AP').value = report.prof || '';
    row.getCell('AQ').value = report.date || '';
    row.getCell('AR').value = formatCourseCodeForDisplay(report.code) || report.code || '';
    row.getCell('AS').value = index + 1;

    row.commit();
  });

  return workbook;
}

function getReportLogosHeader(title, subtitle) {
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

function buildCourseFilePdf(report) {
  const docsRows = (report.docs || []).map((d, i) => {
    const label = d.status === 'yes' ? 'متوفر' : d.status === 'no' ? 'غير متوفر' : '—';
    const color = d.status === 'yes' ? '#166534' : d.status === 'no' ? '#991b1b' : '#64748b';
    return `<tr>
      <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center">${i + 1}</td>
      <td style="padding:6px 8px;border:1px solid #d8e0ea">${d.name}</td>
      <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center;color:${color};font-weight:700">${label}</td>
    </tr>`;
  }).join('');

  const weeksRows = (report.weeks || []).map((w) => {
    const label = w.status === 'yes' ? 'متوفرة' : w.status === 'no' ? 'غير متوفرة' : '—';
    const color = w.status === 'yes' ? '#166534' : w.status === 'no' ? '#991b1b' : '#64748b';
    return `<tr>
      <td style="padding:6px 8px;border:1px solid #d8e0ea">${w.name}</td>
      <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center;color:${color};font-weight:700">${label}</td>
    </tr>`;
  }).join('');

  const availableDocs = countByStatus(report.docs, 'yes');
  const availableWeeks = countByStatus(report.weeks, 'yes');

  return `
  <html dir="rtl"><head><meta charset="UTF-8"><title>تقرير ملف المقرر</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box} body{font-family:Cairo,sans-serif;padding:20px;color:#002147;direction:rtl;font-size:13px}
    table{width:100%;border-collapse:collapse;font-size:0.84rem;margin-top:8px} th{background:#002147;color:#fff;padding:8px;border:1px solid #001530;text-align:right}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;background:#f6f8fb;border:1px solid #dbe4f0;padding:12px;border-radius:10px;margin:10px 0}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}.stat{border:1px solid #dbe4f0;border-radius:10px;padding:10px;text-align:center;background:#fff}
    .v{font-size:1.2rem;font-weight:800}.l{font-size:.72rem;color:#64748b}
    h3{margin:16px 0 8px;background:#eef4ff;border-right:4px solid #1d4ed8;padding:8px 12px;border-radius:8px}
    @page{size:A4 portrait;margin:12mm}
    @media print{ @page{size:A4 portrait;margin:12mm} body{margin:0;} }
  </style></head><body>
  ${getReportLogosHeader('تقرير مراجعة ملف المقرر', 'Course File Review Report')}
  <div class="meta">
    <div><strong>تاريخ التقرير:</strong> ${report.date || '—'}</div>
    <div><strong>اللائحة:</strong> ${report.listLabel || REGULATION_LABELS[report.list] || '—'}</div>
    <div><strong>الفصل الدراسي:</strong> ${report.semester || '—'}</div>
    <div><strong>البرنامج:</strong> ${report.programLabel || '—'}</div>
    <div><strong>كود المقرر:</strong> ${formatCourseCodeForDisplay(report.code) || report.code || '—'}</div>
    <div><strong>اسم المقرر:</strong> ${report.name || '—'}</div>
    <div><strong>أستاذ المقرر:</strong> ${report.prof || '—'}</div>
    <div><strong>تاريخ الإدخال:</strong> ${report.createdAt ? report.createdAt.slice(0, 10) : report.date || '—'}</div>
  </div>
  <div class="stats">
    <div class="stat"><div class="v">${availableDocs}</div><div class="l">مستندات متوفرة</div></div>
    <div class="stat"><div class="v">${CF_DOCS.length}</div><div class="l">إجمالي المستندات</div></div>
    <div class="stat"><div class="v">${availableWeeks}</div><div class="l">أسابيع المادة المتوفرة</div></div>
  </div>
  <h3>مستندات ملف المقرر</h3>
  <table><thead><tr><th style="width:44px;text-align:center">م</th><th>المستند</th><th style="width:130px;text-align:center">الحالة</th></tr></thead><tbody>${docsRows}</tbody></table>
  <h3>المادة العلمية الأسبوعية</h3>
  <table><thead><tr><th>الأسبوع</th><th style="width:130px;text-align:center">الحالة</th></tr></thead><tbody>${weeksRows}</tbody></table>
  ${report.notes ? `<div style="margin-top:12px;padding:12px;border:1px solid #fde68a;background:#fffbeb;border-radius:10px"><strong>ملاحظات:</strong> ${report.notes}</div>` : ''}
  </body></html>`;
}

function exportCFPDF() {
  const reports = getLoadedCourseReports();
  if (!reports.length) {
    showToast('لا توجد تقارير محفوظة للتصدير', 'error');
    return;
  }
  const latest = [...reports].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
  printHtmlForPdf(buildCourseFilePdf(latest));
}

async function exportCFSingleExcel() {
  try {
    const reports = getLoadedCourseReports();
    if (!reports.length) {
      showToast('لا توجد تقارير محفوظة للتصدير', 'error');
      return;
    }
    const latest = [...reports].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
    await _buildAndDownloadCFExcel([latest], `تقرير_ملف_المقرر_${latest.code || 'export'}.xlsx`);
  } catch (error) {
    console.error(error);
    showToast('تعذر إنشاء ملف Excel لملف المقرر', 'error');
  }
}

function buildDetailedCFPDF(report) {
  const docsRows = (report.docs || []).map((doc, i) => `
    <tr>
      <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center">${i + 1}</td>
      <td style="padding:6px 8px;border:1px solid #d8e0ea">${doc.name}</td>
      <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center">${doc.status === 'present' ? 'موجود' : doc.status === 'absent' ? 'غير موجود' : '—'}</td>
    </tr>`).join('');

  const weeklyRows = (report.weeks || []).map((week, i) => `
    <tr>
      <td style="padding:6px 8px;border:1px solid #d8e0ea;text-align:center">${week.name}</td>
      <td style="padding:6px 8px;border:1px solid #d8e0ea">${week.status === 'covered' ? 'مغطى' : week.status === 'not_covered' ? 'غير مغطى' : '—'}</td>
    </tr>`).join('');

  return `
  <html dir="rtl"><head><meta charset="UTF-8"><title>تقرير ملف المقرر</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
  <style>*{box-sizing:border-box} body{font-family:Cairo,sans-serif;padding:20px;color:#002147;direction:rtl;font-size:13px} table{width:100%;border-collapse:collapse;font-size:0.84rem;margin-top:8px} th{background:#002147;color:#fff;padding:8px;border:1px solid #001530;text-align:right} .meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;background:#f6f8fb;border:1px solid #dbe4f0;padding:12px;border-radius:10px;margin:10px 0} @page{size:A4 portrait;margin:12mm}@media print{ @page{size:A4 portrait;margin:12mm} body{margin:0;} }</style></head><body>
  ${getReportLogosHeader('تقرير مراجعة ملف المقرر', `المقرر ${formatCourseCodeForDisplay(report.code)}: ${report.name}`)}
  <div class="meta">
    <div><strong>تاريخ التقرير:</strong> ${report.date}</div>
    <div><strong>الفصل الدراسي:</strong> ${report.semester || '—'}</div>
    <div><strong>المستوي الدراسي:</strong> ${report.level || '—'}</div>
    <div><strong>اللائحة:</strong> ${report.listLabel || REGULATION_LABELS[report.list] || '—'}</div>
    <div><strong>كود المقرر:</strong> ${formatCourseCodeForDisplay(report.code)}</div>
    <div><strong>اسم المقرر:</strong> ${report.name}</div>
    <div><strong>أستاذ المقرر:</strong> ${report.prof || '—'}</div>
    <div><strong>تاريخ إدخال التقرير:</strong> ${report.createdAt ? report.createdAt.slice(0, 10) : report.date}</div>
  </div>
  <h3>مستندات ملف المقرر</h3>
  <table><thead><tr><th style="width:72px;text-align:center">م</th><th>المستند</th><th style="width:120px;text-align:center">الحالة</th></tr></thead><tbody>${docsRows}</tbody></table>
  <h3>المادة العلمية الأسبوعية (1-14)</h3>
  <table><thead><tr><th style="width:120px;text-align:center">الأسبوع</th><th>حالة المادة العلمية</th></tr></thead><tbody>${weeklyRows}</tbody></table>
  ${report.notes ? `<div style="margin-top:12px;padding:12px;border:1px solid #fde68a;background:#fffbeb;border-radius:10px"><strong>ملاحظات:</strong> ${report.notes}</div>` : ''}
  </body></html>`;
}

async function exportCFViewExcel() {
  const scope = document.getElementById('filter-course-scope')?.value || 'all';
  const courseCode = document.getElementById('filter-course')?.value || '';
  if (scope === 'single' && !courseCode) {
    showToast('اختر المادة أولًا قبل التصدير', 'error');
    return;
  }
  const data = getFilteredCourseReports({ latestOnly: true });
  if (!data.length) {
    showToast('لا توجد تقارير للتصدير', 'error');
    return;
  }
  try {
    await _buildAndDownloadCFExcel(data, 'التقرير_المجمع_لملفات_المقررات.xlsx');
  } catch (error) {
    console.error(error);
    showToast('تعذر إنشاء ملف Excel لملفات المقررات', 'error');
  }
}

async function _buildAndDownloadCFExcel(reports, filename) {
  const workbook = await buildCourseFileTemplateWorkbook(reports);
  const buffer = await workbook.xlsx.writeBuffer();
  triggerExcelDownload(buffer, filename);
}

async function exportCFViewPDF() {
  const scope = document.getElementById('filter-course-scope')?.value || 'all';
  const courseCode = document.getElementById('filter-course')?.value || '';
  if (scope === 'single' && !courseCode) {
    showToast('اختر المادة أولًا قبل التصدير', 'error');
    return;
  }
  const data = getFilteredCourseReports({ latestOnly: true });
  if (!data.length) {
    showToast('لا توجد تقارير للتصدير', 'error');
    return;
  }
  let html;
  if (scope === 'single' && data.length === 1) {
    html = buildDetailedCFPDF(data[0]);
  } else {
    // For all courses, use summary PDF
    const latest = data[0]; // or some summary
    html = buildCourseFilePdf(latest);
  }
  printHtmlForPdf(html);
}

function initCourseFileModule() {
  const cfList = document.getElementById('cf-list');
  const filterList = document.getElementById('filter-List');
  const scopeEl = document.getElementById('filter-course-scope');
  if (cfList && !cfList.value) cfList.value = 'new';
  if (filterList && !filterList.value) filterList.value = '';
  if (scopeEl && !scopeEl.value) scopeEl.value = 'all';
  const dateEl = document.getElementById('cf-date');
  if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().split('T')[0];
  syncCourseDropdowns();
  syncCourseViewFilters();
  updateCourseViewMode();
  renderCFTable();
}

document.addEventListener('DOMContentLoaded', initCourseFileModule);
