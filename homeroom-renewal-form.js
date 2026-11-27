window.homeroomRenewalForm = (() => {
  const { courseSystems, divisionForSystem, itemsFor, catalogFor } = window.prototypeCourseCatalog;
  const students = ['授课反馈产品验收', '刘大礼', '陈同学'];
  const levels = ['先修/同步-B及以上', '先修/同步-B及以下', '备考-B及以上', '不限'];
  const campuses = ['舜元中心', '雅仕校区', '鸿寿校区', '浦东校区', '苏悦校区', '望京校区', '海淀校区', '南山校区'];
  const alevel = '英联邦-英联邦学科-ALEVEL-1v1';
  const gcse = '英联邦-英联邦学科-GCSE-1v1';
  const ielts = '英联邦-英联邦学科-雅思-1V1';
  const history = {
    [students[0]]: {
      [alevel]: { hours: 234, courses: {
        'ALEVEL-计算机-AQA-线上': ['李春玲', '常竞文'],
        'ALEVEL-生物-OCR-线下': ['李春玲'],
        'ALEVEL-高数-WJEC-线上': ['出师签约测试5'],
        'ALEVEL-会计-EDX-线下': ['李春玲']
      }},
      [gcse]: { hours: 65, courses: { 'GCSE-数学-CAIE-线上': ['李春玲'] } }
    },
    [students[1]]: { [ielts]: { hours: 25, courses: { '雅思-听力-线下': ['李春玲'], '雅思-阅读-线上': ['常竞文'] } } },
    [students[2]]: { [alevel]: { hours: 24, courses: { 'ALEVEL-数学-CAIE-线下': ['常竞文'] } } }
  };
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const blankHistoryRow = () => ({ course: '', hours: '', teacher: '' });
  const blankHistoryGroup = () => ({ package: '', rows: [blankHistoryRow()] });
  const blankExpansionGroup = () => ({ system: '', item: '', choosing: false, rows: [] });
  const option = (value, selected, label = value) =>
    `<option value="${safe(value)}"${String(selected) === String(value) ? ' selected' : ''}>${safe(label)}</option>`;
  const choices = (values, selected, placeholder = '请选择') => option('', selected, placeholder)
    + values.map(value => option(value, selected)).join('');
  const field = (name, values, selected, label, placeholder, disabled = false) =>
    `<select data-field="${name}" aria-label="${label}"${disabled ? ' disabled' : ''}>${choices(values, selected, placeholder)}</select>`;
  const action = (name, label, disabled = false) =>
    `<button type="button" class="hr-service-link" data-renewal-action="${name}"${disabled ? ' disabled' : ''}>${label}</button>`;
  const hoursInput = (value, label) =>
    `<input type="number" min="0.25" step="0.25" data-field="hours" value="${safe(value)}" aria-label="${label}" placeholder="请输入">`;
  const table = (columns, rows, empty) => `<div class="hr-table-scroll"><table class="hr-table hr-renewal-table"><thead><tr>${columns.map(label =>
    `<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${columns.length}" class="hr-empty">${empty}</td></tr>`}</tbody></table></div>`;
  const courseName = (item, course) => [item, course.subject, course.board, course.grade, course.mode]
    .filter(value => value && value !== '--').join('-');

  function open(dialog, onSave) {
    const formState = { student: '', historical: [blankHistoryGroup()], expansion: [blankExpansionGroup()] };
    const packages = () => history[formState.student] || {};
    const historyGroup = group => {
      const record = packages()[group.package];
      const packageNames = Object.keys(packages()).filter(name => name === group.package ||
        !formState.historical.some(other => other.package === name));
      const rows = group.rows.map((row, index) => `<tr data-renewal-row="${index}">
        <td>${field('course', Object.keys(record?.courses || {}), row.course, '课程', '请选择', !record)}</td>
        <td>${hoursInput(row.hours, '续排课时')}</td>
        <td>${field('teacher', record?.courses[row.course] || [], row.teacher, '授课老师', '系统推荐', !row.course)}</td>
        <td>${action('remove-row', '删除')}</td></tr>`).join('');
      return `<div class="hr-renewal-group" data-renewal-group="historical" data-index="${formState.historical.indexOf(group)}">
        <div class="hr-renewal-group-toolbar"><label>选择课时包${field('package', packageNames, group.package, '选择课时包',
          formState.student ? '请选择课时包' : '请先选择学生', !formState.student)}</label>
          ${record ? `<span class="hr-renewal-balance">剩余课时 <strong>${record.hours}</strong></span>` : ''}
          ${action('add-history-row', '＋ 添加课程', !record)}${formState.historical.length > 1 ? action('remove-group', '移除课时包') : ''}</div>
        ${table(['课程', '续排课时', '授课老师', '操作'], rows, '请选择课时包后添加历史课程')}
      </div>`;
    };
    const expansionGroup = (group, index) => {
      const items = itemsFor(divisionForSystem(group.system), group.system);
      const catalog = group.item ? catalogFor(group.item) : [];
      const rows = group.rows.map((row, rowIndex) => `<tr data-renewal-row="${rowIndex}"><td>${safe(row.subject)}</td>
        <td>${safe(row.board)}</td><td>${safe(row.grade)}</td><td>${safe(row.module)}</td>
        <td>${field('studentLevel', levels, row.studentLevel, '学生水平')}</td>
        <td>${field('expectedGrade', levels, row.expectedGrade, '期望成绩')}</td>
        <td>${safe(row.mode)}</td><td>${field('campus', campuses, row.campus, '校区', row.mode === '线上' ? '—' : '请选择', row.mode === '线上')}</td>
        <td>${hoursInput(row.hours, '课时')}</td><td>${action('remove-row', '移除')}</td></tr>`).join('');
      return `<div class="hr-renewal-group" data-renewal-group="expansion" data-index="${index}">
        <div class="hr-renewal-group-toolbar"><label>课程体系${field('system', courseSystems, group.system, '课程体系')}</label>
          <label>课程项${field('item', items, group.item, '课程项', '请选择', !group.system)}</label>
          ${action('choose-course', '＋ 添加科目', !group.item)}${formState.expansion.length > 1 ? action('remove-group', '移除组合') : ''}
          ${group.choosing ? `<label>科目<select data-field="subject" aria-label="选择科目">${option('', '', '请选择科目')}
            ${catalog.map((course, courseIndex) => group.rows.some(row => row.catalogIndex === courseIndex)
              ? '' : option(courseIndex, '', courseName(group.item, course))).join('')}</select></label>` : ''}
        </div>${table(['科目', '考试局', '年级', '模块', '学生水平', '期望成绩', '授课模式', '校区', '课时', '操作'],
          rows, '请选择课程体系和课程项，再添加科目')}</div>`;
    };
    dialog.innerHTML = `<form class="hr-renewal-form">
      <header><h2 id="hrServiceDialogTitle">新增续排方案</h2><button type="button" class="hr-dialog-close" aria-label="关闭">×</button></header>
      <div class="hr-service-dialog-body hr-renewal-body">
        <div data-renewal-edit><label class="hr-renewal-student">学生姓名<input name="student" list="hrRenewalStudents" placeholder="请输入姓名搜索" required>
          <datalist id="hrRenewalStudents">${students.map(name => option(name, '')).join('')}</datalist></label>
          <section><h3>历史科目续排</h3><div data-renewal-history></div>${action('add-history-group', '＋ 添加课时包')}</section>
          <section><h3>扩科预排</h3><div data-renewal-expansion></div>${action('add-expansion-group', '＋ 添加课程组合')}</section>
        </div>
        <p class="hr-renewal-error" role="alert" hidden></p>
      </div>
      <footer><button type="button" class="hr-button" data-renewal-action="back">取消</button><button type="submit" class="hr-button hr-primary">下一步</button></footer>
    </form>`;
    const form = dialog.querySelector('form');
    const error = form.querySelector('.hr-renewal-error');
    const showError = message => { error.textContent = message; error.hidden = !message; };
    function renderGroups() {
      form.querySelector('[data-renewal-history]').innerHTML = formState.historical.map(historyGroup).join('');
      form.querySelector('[data-renewal-expansion]').innerHTML = formState.expansion.map(expansionGroup).join('');
    }
    const groupAt = element => {
      const node = element.closest('[data-renewal-group]');
      const groups = node ? formState[node.dataset.renewalGroup] : [];
      const index = Number(node?.dataset.index);
      return { group: groups[index], groups, index };
    };
    form.addEventListener('input', event => {
      if (event.target.name === 'student') {
        const name = event.target.value.trim();
        const student = students.includes(name) ? name : '';
        if (student !== formState.student) {
          formState.student = student;
          formState.historical = [blankHistoryGroup()];
          renderGroups();
        }
        showError('');
        return;
      }
      if (event.target.dataset.field !== 'hours') return;
      const row = groupAt(event.target).group.rows[Number(event.target.closest('tr').dataset.renewalRow)];
      row.hours = event.target.value;
      showError('');
    });
    form.addEventListener('change', event => {
      const target = event.target;
      showError('');
      if (target.dataset.field) {
        const { group } = groupAt(target);
        switch (target.dataset.field) {
          case 'package': group.package = target.value; group.rows = [blankHistoryRow()]; break;
          case 'system': group.system = target.value; group.item = ''; group.rows = []; group.choosing = false; break;
          case 'item': group.item = target.value; group.rows = []; group.choosing = false; break;
          case 'subject': {
            if (!target.value) return;
            const catalogIndex = Number(target.value);
            const course = catalogFor(group.item)[catalogIndex];
            group.rows.push({ ...course, catalogIndex, module: '--', studentLevel: levels[0], expectedGrade: '',
              campus: course.mode === '线上' ? '' : campuses[0], hours: '' });
            group.choosing = false;
            break;
          }
          case 'course': {
            const row = group.rows[Number(target.closest('tr').dataset.renewalRow)];
            row.course = target.value;
            row.teacher = '';
            break;
          }
          default:
            if (target.dataset.field && target.dataset.field !== 'hours') {
              group.rows[Number(target.closest('tr').dataset.renewalRow)][target.dataset.field] = target.value;
            }
            return;
        }
        renderGroups();
      }
    });
    form.addEventListener('click', event => {
      const button = event.target.closest('button[type=button]');
      if (!button) return;
      if (button.matches('.hr-dialog-close')) { dialog.close(); return; }
      showError('');
      const { group, groups, index } = groupAt(button);
      switch (button.dataset.renewalAction) {
        case 'back': dialog.close(); return;
        case 'add-history-group': formState.historical.push(blankHistoryGroup()); break;
        case 'add-expansion-group': formState.expansion.push(blankExpansionGroup()); break;
        case 'add-history-row': group.rows.push(blankHistoryRow()); break;
        case 'remove-row': group.rows.splice(Number(button.closest('tr').dataset.renewalRow), 1); break;
        case 'remove-group': groups.splice(index, 1); break;
        case 'choose-course': group.choosing = true; break;
        default: return;
      }
      renderGroups();
      if (button.dataset.renewalAction === 'choose-course') {
        form.querySelector(`[data-renewal-group="expansion"][data-index="${index}"] [data-field="subject"]`).focus();
      }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      formState.student = form.elements.student.value.trim();
      if (!students.includes(formState.student)) { showError('请从搜索结果中选择学生'); return; }
      const historical = formState.historical.flatMap(group => group.rows
        .filter(row => row.course || row.hours).map(row => ({
          ...row, package: group.package, kind: '历史科目续排', historicalTeachers: packages()[group.package]?.courses[row.course] || []
        })));
      const expansion = formState.expansion.flatMap(group => group.rows.map(row =>
        ({ ...row, system: group.system, item: group.item, package: group.item, course: courseName(group.item, row), kind: '扩科预排' })));
      const plan = [...historical, ...expansion];
      if (!plan.length) { showError('请添加至少一门课程'); return; }
      if (plan.some(row => !row.course || !(Number(row.hours) > 0) || !Number.isInteger(Number(row.hours) * 4))) {
        showError('请选择课程，并为每门课程填写 0.25 的正倍数课时'); return;
      }
      if (expansion.some(row => row.mode !== '线上' && !row.campus)) {
        showError('请选择线下课程的校区'); return;
      }
      for (const [name, record] of Object.entries(packages())) {
        const total = historical.filter(row => row.package === name).reduce((sum, row) => sum + Number(row.hours), 0);
        if (total > record.hours) { showError(`${name}的续排课时不能超过剩余课时 ${record.hours}`); return; }
      }
      const entries = plan.map(row => ({ ...row, hours: Number(row.hours) }));
      const order = buildRenewalOrder(formState.student, entries);
      form.hidden = true;
      let row;
      openSchedule(dialog, order, {
        ready: snapshot => {
          const courseIds = new Map(order.submission.courses.map((course, index) => [course.renewalIndex, `course-${index + 1}`]));
          const chosen = entries.map((entry, index) => {
            const id = courseIds.get(index);
            return { ...entry, teacher: snapshot.direct[id] || snapshot.selected[id] || '系统推荐' };
          });
          row = onSave(formState.student, chosen, { ...order, renewalPreview: snapshot }, row);
        },
        close: () => {
          if (row) dialog.close();
          else form.hidden = false;
        }
      });
    });
    renderGroups();
    dialog.showModal();
  }

  function buildRenewalOrder(student, entries) {
    const packages = new Map();
    entries.forEach((entry, renewalIndex) => {
      const historical = entry.kind === '历史科目续排';
      const [legacyItem, subject, board, modeOrGrade, legacyMode] = entry.course.split('-');
      const system = entry.system || (legacyItem === '雅思' ? '英联邦语言' : '英联邦学科');
      const item = entry.item || legacyItem;
      const mode = entry.mode || legacyMode || modeOrGrade || board;
      const key = JSON.stringify([historical, system, entry.package]);
      if (!packages.has(key)) packages.set(key, { name: entry.package, system, item, courses: [] });
      packages.get(key).courses.push({
        ...entry, system, item, renewalIndex,
        name: entry.subject || subject,
        subject: entry.subject || subject,
        board: entry.board || (legacyMode ? board : modeOrGrade ? board : '--'),
        grade: entry.grade || (legacyMode ? modeOrGrade : '--'),
        mode,
        campus: entry.campus || (historical && mode !== '线上' ? campuses[0] : ''),
        isHistoricalCourse: historical,
        historicalTeacher: (entry.historicalTeachers || []).join('、'),
        specifiedTeacher: historical ? entry.teacher : undefined
      });
    });
    const groups = [...packages.values()];
    return {
      id: Date.now(), source: 'homeroom-renewal', course: `${student}-续排方案`,
      submission: {
        student, start: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }),
        endMode: 'FINISH_ALL', packages: groups, courses: groups.flatMap(group => group.courses)
      }
    };
  }

  function openSchedule(dialog, order, callbacks = {}) {
    const frame = document.createElement('iframe');
    frame.className = 'hr-renewal-schedule-frame';
    frame.title = '续排方案排课';
    frame.src = `教务端/index.html?embed-homeroom-supplement=1#flow-order=${encodeURIComponent(JSON.stringify(order))}`;
    dialog.append(frame);
    const cleanup = () => {
      window.removeEventListener('message', receive);
      dialog.removeEventListener('close', cleanup);
      frame.remove();
    };
    function receive(event) {
      if (event.source !== frame.contentWindow || event.origin !== location.origin) return;
      if (event.data?.kind === 'homeroom-renewal-ready' && event.data.snapshot) callbacks.ready?.(event.data.snapshot);
      if (event.data?.kind === 'homeroom-supplement-close') {
        cleanup();
        if (callbacks.close) callbacks.close();
        else dialog.close();
      }
    }
    window.addEventListener('message', receive);
    dialog.addEventListener('close', cleanup);
    if (!dialog.open) dialog.showModal();
  }
  return { open, openSchedule };
})();
