(() => {
  const form = document.getElementById('createOrderForm');
  const groups = document.getElementById('createCourseGroups');
  const picker = document.getElementById('createCoursePicker');
  const backdrop = document.getElementById('createCoursePickerBackdrop');
  const initialGroup = groups.querySelector('[data-package-group]').cloneNode(true);
  const initialStartDate = document.getElementById('createStartDate').value;
  const initialEndMode = document.getElementById('createEndMode').value;
  const initialRequirement = document.getElementById('createRequirement').value;
  const packages = [
    {name:'英联邦-英联邦学科-ALEVEL-1v1',system:'英联邦学科',item:'ALEVEL',stats:['600','120.5','202.5','277']},
    {name:'英联邦-英联邦学科-GCSE-1v1',system:'英联邦学科',item:'GCSE',stats:['120','24','31','65']},
    {name:'英联邦-英联邦学科-IGCSE-1v1',system:'英联邦学科',item:'IGCSE',stats:['100','18','22','60']},
    {name:'全日制-全日制学科-1v1',system:'全日制',item:'全日制',stats:['200','36','45','119']},
    {name:'托福-托福课程-1v1',system:'托福',item:'托福',stats:['80','12','18','50']},
    {name:'雅思-雅思课程-1v1',system:'雅思',item:'雅思',stats:['80','14','16','50']}
  ];
  const samplePurchasedPackages = {
    VA100078710:['英联邦-英联邦学科-ALEVEL-1v1','英联邦-英联邦学科-GCSE-1v1','托福-托福课程-1v1'],
    VA100086215:['英联邦-英联邦学科-ALEVEL-1v1','英联邦-英联邦学科-GCSE-1v1'],
    VA100094332:['英联邦-英联邦学科-ALEVEL-1v1','全日制-全日制学科-1v1'],
    VA100073946:['英联邦-英联邦学科-ALEVEL-1v1']
  };
  const baseCatalog = [
    ['商务','OCR','AS','P1','线上'],['会计','EDX','AS','/','线下'],
    ['物理','CAIE','AS','/','线下'],['化学','EDX','AS','/','线上'],
    ['数学','CAIE','AS','/','线下'],['英语','CAIE','AS','/','线上'],
    ['经济','AQA','AS','/','线下'],['计算机','AQA','AS','/','线上'],
    ['写作','AQA','AS','/','线下'],['听力','AQA','AS','/','线上'],
    ['口语','CAIE','AS','/','线下'],['阅读','CAIE','AS','/','线上'],
    ['计算机','AQA','AS','/','线上'],['物理','AQA','AS','/','线下'],
    ['心理','AQA','AS','/','线下'],['物理','AQA','AS','/','线上'],
    ['商务','OCR','AS','/','线上'],['计算机','OCR','AS','/','线上'],
    ['经济','AQA','AS','/','线上'],['计算机','AQA','AS','/','线下'],
    ['中文','EDX','AS','/','线下'],['化学','CAIE','AS','/','线上'],
    ['数学','EDX','IAL-AS','/','线下'],['综合','AQA','AS','/','线下'],
    ['物理','EDX','A2','/','线上'],['化学','EDX','A2','/','线下'],
    ['数学','CAIE','A2','/','线上'],['商务','AQA','A2','/','线下'],
    ['经济','OCR','A2','/','线上']
  ];
  const campusOptions = ['','舜元中心','雅仕校区','鸿寿校区','浦东校区','苏悦校区','望京校区','海淀校区','南山校区'];
  const levelOptions = ['先修/同步-B及以上','先修/同步-B及以下','备考-B及以上','不限'];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const optionHtml = (values,selected) => values.map(value => '<option value="' + escapeHtml(value) + '"' + (value === selected ? ' selected' : '') + '>' + escapeHtml(value || '请选择') + '</option>').join('');
  const keyFor = course => [course.subject || course.name,course.board,course.grade,course.module || '/',course.mode].join('|');
  let activeGroup = null;
  let selected = new Map();
  let consultCourses = [];
  let selectedStudentNumber = '';

  function packageMeta(name) {
    return packages.find(entry => entry.name === name) || {name,system:'',item:'',stats:['0','0','0','0']};
  }
  function packageNameFor(course) {
    if (course.package) return course.package;
    return packages.find(entry => entry.system === course.system && entry.item === course.item)?.name ||
      [course.system || '英联邦',course.item || 'ALEVEL','1v1'].join('-');
  }
  function setPackageOptions(select,chosen) {
    const fromOrders = allOrders.filter(order => order.submission?.customerNo === selectedStudentNumber)
      .flatMap(order => (order.submission.packages || []).map(entry => entry.name));
    const purchased = new Set([...(samplePurchasedPackages[selectedStudentNumber] || []),...fromOrders]);
    const values = ['',...packages.filter(entry => purchased.has(entry.name)).map(entry => entry.name)];
    if (chosen && !values.includes(chosen)) values.push(chosen);
    select.innerHTML = values.map(value => '<option value="' + escapeHtml(value) + '"' + (value === chosen ? ' selected' : '') + '>' +
      escapeHtml(value || '请选择课时包') + '</option>').join('');
    select.required = true;
  }
  function setupGroup(group,packageName) {
    group.dataset.packageGroup = '';
    group.dataset.selectedPackage = packageName;
    const select = group.querySelector('.course-package-line select');
    setPackageOptions(select,packageName);
    const stats = packageMeta(packageName).stats;
    group.querySelectorAll('.course-hours-summary > div:not(.course-needed-summary) strong').forEach((node,index) => { node.textContent = stats[index] || '0'; });
    group.classList.toggle('package-unselected',!packageName);
    if (!group.querySelector('[data-consult-import]')) {
      const panel = document.createElement('div');
      panel.className = 'create-consult-import';
      panel.dataset.consultImport = '';
      group.querySelector('.create-course-table-scroll').before(panel);
    }
    renderConsultChoices(group);
  }
  function makeGroup(packageName = '') {
    const group = initialGroup.cloneNode(true);
    group.querySelector('tbody').innerHTML = '';
    setupGroup(group,packageName);
    return group;
  }
  function updateTotals() {
    [...groups.querySelectorAll('[data-package-group]')].forEach(group => {
      const total = [...group.querySelectorAll('.hours-stepper input')].reduce((sum,input) => sum + (Number(input.value) || 0),0);
      const displayedTotal = Number(total.toFixed(2));
      group.querySelector('[data-package-needed]').textContent = displayedTotal;
      group.querySelector('[data-package-total]').textContent = displayedTotal;
      group.querySelector('[data-remove-package]').hidden = groups.querySelectorAll('[data-package-group]').length === 1;
    });
  }
  function makeRow(course) {
    const row = document.createElement('tr');
    const subject = course.subject || course.name || '';
    row.createCourseData = {...course};
    row.innerHTML = '<td>' + escapeHtml(subject) + '</td><td>' + escapeHtml(course.board || '--') + '</td><td>' + escapeHtml(course.grade || '--') + '</td>' +
      '<td>' + escapeHtml(course.module || '/') + '</td>' +
      '<td><select class="create-cell-select" aria-label="' + escapeHtml(subject) + '学生水平">' + optionHtml(levelOptions,course.studentLevel || levelOptions[0]) + '</select></td>' +
      '<td><select class="create-cell-select" aria-label="' + escapeHtml(subject) + '期望成绩">' + optionHtml(['',...levelOptions],course.expectedGrade || '') + '</select></td>' +
      '<td>' + escapeHtml(course.mode || '线下') + '</td><td>' + escapeHtml(course.historicalTeacher || '无') + '</td>' +
      '<td>' + (course.mode === '线上' ? '/' : '<select class="create-cell-select" aria-label="' + escapeHtml(subject) + '校区">' + optionHtml(campusOptions,course.campus || '') + '</select>') + '</td>' +
      '<td><span class="hours-stepper"><button type="button" data-hour-step="-0.25">−</button><input type="number" min="0" step="0.25" value="' + escapeHtml(Number(course.hours || 0).toFixed(2)) + '" aria-label="' + escapeHtml(subject) + '课时"><button type="button" data-hour-step="0.25">+</button></span></td>' +
      '<td><input class="teacher-input" value="' + escapeHtml(course.currentTeacher || '无') + '" aria-label="' + escapeHtml(subject) + '当前授课老师"></td>' +
      '<td><select class="create-cell-select" aria-label="' + escapeHtml(subject) + '老师时间是否已沟通">' + optionHtml(['是','否'],course.teacherDiscussed || '是') + '</select></td>' +
      '<td><button type="button" class="remove-course" aria-label="删除' + escapeHtml(subject) + '课程">−</button></td>';
    return row;
  }
  function catalogFor(packageName) {
    const item = packageMeta(packageName).item;
    let rows = baseCatalog;
    if (item === '托福' || item === '雅思') rows = ['听力','口语','阅读','写作'].flatMap(subject => [[subject,'--','--','/','线上'],[subject,'--','--','/','线下']]);
    else if (item === 'GCSE' || item === 'IGCSE') rows = baseCatalog.filter(row => ['物理','化学','数学','英语','商务','经济'].includes(row[0])).map(row => [row[0],row[1],item,row[3],row[4]]);
    else if (item === '全日制') rows = ['数学','英语','物理','化学','生物','综合'].flatMap(subject => [[subject,'--','8年级','/','线下'],[subject,'--','8年级','/','线上']]);
    return [...new Map(rows.map(([subject,board,grade,module,mode]) => {
      const course = {subject,board,grade,module,mode};
      return [keyFor(course),course];
    })).values()];
  }
  function matchedConsultCourse(source,packageName) {
    const meta = packageMeta(packageName);
    if (!packageName || source.system !== meta.system || source.item !== meta.item) return null;
    return catalogFor(packageName).find(course =>
      course.subject === (source.subject || source.name) &&
      course.board === source.board && course.grade === source.grade &&
      course.mode === source.mode && (course.module || '/') === (source.module || '/')) || null;
  }
  function renderAllConsultChoices() {
    groups.querySelectorAll('[data-package-group]').forEach(renderConsultChoices);
  }
  function renderConsultChoices(group) {
    const panel = group.querySelector('[data-consult-import]');
    if (!panel) return;
    const packageName = group.querySelector('.course-package-line select').value;
    panel.hidden = !consultCourses.length || !packageName;
    if (panel.hidden) { panel.innerHTML = ''; return; }
    const rows = [...group.querySelectorAll('tbody tr')];
    const importedElsewhere = new Set([...groups.querySelectorAll('[data-package-group]')]
      .filter(other => other !== group)
      .flatMap(other => [...other.querySelectorAll('tbody tr[data-consult-course-index]')].map(row => row.dataset.consultCourseIndex)));
    panel.innerHTML = '<div class="create-consult-import-title"><strong>售前匹配科目</strong><span>勾选后填入当前课时包的课程列表</span></div><div class="create-consult-import-list">' +
      consultCourses.map((source,index) => {
        const match = matchedConsultCourse(source,packageName);
        const imported = rows.some(row => row.dataset.consultCourseIndex === String(index));
        const usedInOtherPackage = importedElsewhere.has(String(index));
        const occupied = !imported && match && rows.some(row => keyFor(row.createCourseData || {}) === keyFor(match));
        const disabled = !match || occupied || usedInOtherPackage;
        const note = usedInOtherPackage ? '已填入其他课时包' : !match ? '当前课时包无匹配课程' : occupied ? '已在课程列表中' : imported ? '已填入' : '可填入';
        return '<label class="create-consult-import-row' + (disabled ? ' is-disabled' : '') + '"><input type="checkbox" data-consult-course-index="' + index + '"' + (imported ? ' checked' : '') + (disabled ? ' disabled' : '') + '><span><b>' + escapeHtml(source.subject || source.name || '--') + '</b><small>' + escapeHtml([source.system,source.item,source.board,source.grade,source.module && source.module !== '/' ? source.module : '',source.mode].filter(Boolean).join(' · ')) + '</small></span><em>' + note + '</em></label>';
      }).join('') + '</div>';
  }
  function existingKeys() {
    return new Set([...activeGroup.querySelectorAll('tbody tr')].map(row => keyFor(row.createCourseData || {
      subject:row.cells[0].textContent.trim(),board:row.cells[1].textContent.trim(),
      grade:row.cells[2].textContent.trim(),module:row.cells[3].textContent.trim(),mode:row.cells[6].textContent.trim()
    })));
  }
  function renderPicker() {
    const catalog = catalogFor(activeGroup.querySelector('.course-package-line select').value);
    const filters = ['Subject','Board','Grade','Mode'].map(part => document.getElementById('createCourse' + part + 'Filter').value);
    const added = existingKeys();
    const visible = catalog.filter(course => [course.subject,course.board,course.grade,course.mode].every((value,index) => !filters[index] || value === filters[index]));
    document.getElementById('createCoursePickerRows').innerHTML = visible.map(course => {
      const key = keyFor(course);
      return '<tr><td><input type="checkbox" data-course-key="' + escapeHtml(key) + '"' + (selected.has(key) ? ' checked' : '') +
        (added.has(key) ? ' disabled' : '') + '></td><td>' + escapeHtml(course.subject) + '</td><td>' + escapeHtml(course.board) +
        '</td><td>' + escapeHtml(course.grade) + '</td><td>' + escapeHtml(course.mode) + '</td></tr>';
    }).join('') || '<tr><td colspan="5">暂无符合条件的课程</td></tr>';
    document.getElementById('createCoursePickerSelected').textContent = '已选 ' + selected.size + ' 门课程';
  }
  function openPicker(group) {
    const packageName = group.querySelector('.course-package-line select').value;
    if (!packageName) { toast('请先选择课时包'); return; }
    activeGroup = group;
    selected = new Map();
    const catalog = catalogFor(packageName);
    [['Subject','subject'],['Board','board'],['Grade','grade'],['Mode','mode']].forEach(([part,key]) => {
      const select = document.getElementById('createCourse' + part + 'Filter');
      const first = select.options[0].outerHTML;
      select.innerHTML = first + optionHtml([...new Set(catalog.map(course => course[key]))],'');
      select.value = '';
    });
    document.getElementById('createCoursePickerPackage').textContent = '课时包：' + packageName;
    renderPicker();
    backdrop.hidden = false;
    picker.hidden = false;
  }
  function closePicker() {
    backdrop.hidden = true;
    picker.hidden = true;
    activeGroup = null;
  }
  function clearGroups() {
    closePicker();
    groups.innerHTML = '';
    const group = initialGroup.cloneNode(true);
    group.querySelector('tbody').innerHTML = '';
    setupGroup(group,'');
    groups.append(group);
    updateTotals();
  }
  function reset() {
    consultCourses = [];
    clearGroups();
    document.getElementById('createStartDate').value = initialStartDate;
    document.getElementById('createEndMode').value = initialEndMode;
    document.getElementById('createEndMode').dispatchEvent(new Event('change'));
    document.getElementById('createRequirement').value = initialRequirement;
    document.getElementById('createRequirementCount').textContent = initialRequirement.length + '/500';
  }
  function setStudentSelected(selected,studentNumber = '') {
    const number = selected ? studentNumber : '';
    if (selectedStudentNumber !== number) {
      selectedStudentNumber = number;
      clearGroups();
    }
    document.getElementById('createCourseAwaitingStudent').hidden = selected;
    groups.hidden = !selected;
    document.getElementById('createAddPackage').hidden = !selected;
  }
  function setConsultIntent(courses) {
    consultCourses = Array.isArray(courses) ? courses.map(course => ({...course})) : [];
    clearGroups();
  }
  function setFromCourses(courses) {
    groups.innerHTML = '';
    const byPackage = new Map();
    courses.forEach(course => {
      const name = packageNameFor(course);
      if (!byPackage.has(name)) {
        const group = makeGroup(name);
        groups.append(group);
        byPackage.set(name,group);
      }
      byPackage.get(name).querySelector('tbody').append(makeRow(course));
    });
    if (!byPackage.size) groups.append(makeGroup(''));
    updateTotals();
  }
  function validate() {
    const packageGroups = [...groups.querySelectorAll('[data-package-group]')];
    if (packageGroups.some(group => !group.querySelector('.course-package-line select').value)) { toast('请选择每个课时包'); return false; }
    if (packageGroups.some(group => !group.querySelector('tbody tr'))) { toast('请为每个课时包添加课程'); return false; }
    const hours = [...groups.querySelectorAll('.hours-stepper input')].map(input => Number(input.value));
    if (hours.some(value => !Number.isFinite(value) || value <= 0 || Math.round(value * 4) !== value * 4)) {
      toast('课程课时须为 0.25 的正倍数'); return false;
    }
    return true;
  }

  groups.querySelector('[data-package-group] tbody').innerHTML = '';
  setupGroup(groups.querySelector('[data-package-group]'),'');
  updateTotals();
  setStudentSelected(false);
  document.getElementById('createAddPackage').addEventListener('click',() => {
    groups.append(makeGroup(''));
    updateTotals();
    groups.lastElementChild.querySelector('.course-package-line select').focus();
  });
  groups.addEventListener('click',event => {
    const group = event.target.closest('[data-package-group]');
    if (!group) return;
    if (event.target.closest('[data-add-package-course]')) { openPicker(group); return; }
    if (event.target.closest('[data-remove-package]')) { group.remove(); renderAllConsultChoices(); updateTotals(); return; }
    if (event.target.closest('.remove-course')) { event.target.closest('tr').remove(); renderAllConsultChoices(); updateTotals(); return; }
    const step = event.target.closest('[data-hour-step]');
    if (step) {
      const input = step.parentElement.querySelector('input');
      input.value = Math.max(0,Number(input.value || 0) + Number(step.dataset.hourStep)).toFixed(2);
      updateTotals();
    }
  });
  groups.addEventListener('change',event => {
    if (event.target.matches('[data-consult-course-index]')) {
      const group = event.target.closest('[data-package-group]');
      const index = Number(event.target.dataset.consultCourseIndex);
      const source = consultCourses[index];
      const packageName = group.querySelector('.course-package-line select').value;
      const match = source && matchedConsultCourse(source,packageName);
      const alreadyImported = !!groups.querySelector('tbody tr[data-consult-course-index="' + index + '"]');
      if (event.target.checked && match && !alreadyImported && ![...group.querySelectorAll('tbody tr')].some(row => keyFor(row.createCourseData || {}) === keyFor(match))) {
        const meta = packageMeta(packageName);
        const row = makeRow({...match,system:meta.system,item:meta.item,classType:'1v1',package:packageName,
          studentLevel:source.studentLevel || levelOptions[0],expectedGrade:source.expectedGrade || '',
          historicalTeacher:source.historicalTeacher || '无',campus:match.mode === '线上' ? '' : source.campus || '舜元中心',
          hours:source.hours || 0,currentTeacher:source.currentTeacher || '无',teacherDiscussed:source.teacherDiscussed || '是'});
        row.dataset.consultCourseIndex = String(index);
        group.querySelector('tbody').append(row);
      } else if (!event.target.checked) {
        group.querySelector('tbody tr[data-consult-course-index="' + index + '"]')?.remove();
      }
      renderAllConsultChoices(); updateTotals(); return;
    }
    if (event.target.matches('.course-package-line select')) {
      const group = event.target.closest('[data-package-group]');
      const oldName = group.dataset.selectedPackage || '';
      if (group.querySelector('tbody tr') && event.target.value !== oldName) {
        if (!window.confirm('切换课时包会清空该课时包下已添加的课程，是否继续？')) {
          event.target.value = oldName;
          return;
        }
        group.querySelector('tbody').innerHTML = '';
      }
      group.dataset.selectedPackage = event.target.value;
      setupGroup(group,event.target.value);
      renderAllConsultChoices();
      updateTotals();
    }
    if (event.target.matches('.hours-stepper input')) updateTotals();
  });
  groups.addEventListener('input',event => { if (event.target.matches('.hours-stepper input')) updateTotals(); });
  for (const id of ['createCoursePickerClose','createCoursePickerCancel']) document.getElementById(id).addEventListener('click',closePicker);
  backdrop.addEventListener('click',closePicker);
  for (const part of ['Subject','Board','Grade','Mode']) document.getElementById('createCourse' + part + 'Filter').addEventListener('change',renderPicker);
  document.getElementById('createCoursePickerRows').addEventListener('change',event => {
    const box = event.target.closest('[data-course-key]');
    if (!box) return;
    const course = catalogFor(activeGroup.querySelector('.course-package-line select').value).find(item => keyFor(item) === box.dataset.courseKey);
    if (box.checked && course) selected.set(box.dataset.courseKey,course);
    else selected.delete(box.dataset.courseKey);
    renderPicker();
  });
  document.getElementById('createCoursePickerConfirm').addEventListener('click',() => {
    if (!selected.size) { toast('请至少选择一门课程'); return; }
    const group = activeGroup;
    const packageName = activeGroup.querySelector('.course-package-line select').value;
    const meta = packageMeta(packageName);
    for (const course of selected.values()) activeGroup.querySelector('tbody').append(makeRow({
      ...course,system:meta.system,item:meta.item,classType:'1v1',package:packageName,
      studentLevel:levelOptions[0],expectedGrade:'',historicalTeacher:'无',
      campus:course.mode === '线上' ? '' : '舜元中心',hours:0,currentTeacher:'无',teacherDiscussed:'是'
    }));
    closePicker();
    renderAllConsultChoices();
    updateTotals();
  });
  window.createOrderPackages = {reset,setFromCourses,setConsultIntent,setStudentSelected,validate,packageMeta};
})();
