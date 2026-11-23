(() => {
  const byId = id => document.getElementById(id);
  const studentHash = '#student=VA100078710';
  const student = {
    student: '授课反馈产品验收', studentNo: 'S100078710', customerNo: 'VA100078710',
    school: '唯寻西南', grade: '8年级', teacher: '李春玲', tag: '黑金',
  };
  const classPrefix = '授课反馈产品验收-英联邦学科-ALEVEL-';
  const room = '雅仕-37F-艾克塞特学院（多媒体）';
  const diagnostic = {course:'ALEVEL-数学-AQA-线上',teacher:'李春玲',className:'测试前测',classNo:'01077804261119-0003',type:'diagnostic',confirmed:false,medal:true,room:''};
  const accounting = {course:'ALEVEL-会计-EDX-线下',teacher:'李春玲',className:classPrefix+'会计-1v1',type:'regular',confirmed:true,medal:true};
  const advancedMath = {course:'ALEVEL-高数-WJEC-线上',teacher:'出师签约测试5',className:classPrefix+'高数-1v1',classNo:'01077801260917-0001',type:'regular',confirmed:true,room:'111雅仕-1F上层-Seattle（多媒体）111'};
  const computing = {course:'ALEVEL-计算机-AQA-线上',teacher:'常竞文',className:classPrefix+'计算机-1v1',classNo:'01077801260826-0001',type:'regular',confirmed:false,change:true,room:''};
  const lessons = [
    {...diagnostic,date:'2026-11-29',time:'18:30-20:30'},
    {...diagnostic,date:'2026-11-29',time:'10:30-12:30'},
    {...diagnostic,date:'2026-11-22',time:'10:30-12:30'},
    {...diagnostic,date:'2026-11-22',time:'08:20-10:20'},
    {...computing,date:'2026-11-20',time:'00:00-01:00'},
    {...accounting,date:'2026-10-29',time:'13:30-15:30',classNo:'01077801261020-0004',room,roomCampus:'雅仕校区'},
    {...accounting,date:'2026-10-21',time:'13:30-15:30',classNo:'01077801261020-0002',room:'数学2',roomCampus:'雅仕校区'},
    {...accounting,date:'2026-10-21',time:'10:30-12:30',classNo:'01077801261020-0002',room,roomCampus:'雅仕校区'},
    {...advancedMath,date:'2026-09-25',time:'10:30-12:30'},
    {...advancedMath,date:'2026-09-24',time:'10:30-12:30'},
    {...computing,date:'2026-11-27',time:'08:20-10:20'},
    {...computing,date:'2026-11-27',time:'13:30-15:30'},
    {...accounting,date:'2026-11-28',time:'16:00-18:00',classNo:'01077801261020-0004',campus:'雅仕校区',room,confirmed:false,change:true},
  ].map((lesson,index) => ({...lesson,id:index+1,orderNo:lesson.change ? 'ORD-202611-' + lesson.classNo.slice(-4) : ''}));
  const roomsByCampus = new Map([
    ['舜元中心',['舜元 101','舜元 102','舜元 103']],
    ['雅仕校区',[room,'数学2','雅仕 302']],
    ['鸿寿校区',['鸿寿 201','鸿寿 202']],
    ['浦东校区',['浦东 101','浦东 102']],
    ['苏悦校区',['苏悦 201','苏悦 202']],
  ]);
  // 原型中的其他课表占用，用于演示教师冲突和教室替换。
  const otherBookings = [
    {teacher:'常竞文',date:'2026-11-20',time:'10:30-12:30'},
    {campus:'舜元中心',room:'舜元 101',date:'2026-11-20',time:'00:00-01:00'},
    {campus:'雅仕校区',room:'数学2',date:'2026-11-20',time:'00:00-01:00'},
  ];

  let scope = 'mine';
  let studentStatus = 'all';
  let lessonType = 'all';
  const filters = byId('hrFilters');
  const batchButton = byId('hrBatchChange');
  const batchDialog = byId('hrBatchDialog');
  const batchActions = batchDialog.querySelectorAll('[data-batch-action]');
  const batchCourses = byId('hrBatchCourses');
  const batchRows = byId('hrBatchRows');
  const selectAll = byId('hrSelectLessons');
  const batchLocationButton = byId('hrBatchLocation');
  const batchLocationDialog = byId('hrBatchLocationDialog');
  const batchLocationForm = byId('hrBatchLocationForm');
  const batchLocationFields = batchLocationForm.elements;
  const batchLocationMessage = byId('hrBatchLocationMessage');
  const batchCampusField = byId('hrBatchCampusField');
  const submitBatchLocation = byId('hrSubmitBatchLocation');
  const batchOperationDialog = byId('hrBatchOperationDialog');
  const batchOperationForm = byId('hrBatchOperationForm');
  const batchOperationFields = batchOperationForm.elements;
  const batchAnalysisPreview = byId('hrBatchAnalysisPreview');
  const batchTargetFields = byId('hrBatchTargetFields');
  const batchAiFields = byId('hrBatchAiFields');
  const batchOperationNotice = byId('hrBatchOperationNotice');
  const submitBatchOperation = byId('hrSubmitBatchOperation');
  let batchOperation = '';
  const lessonRows = byId('hrLessonRows');
  const lessonTabs = byId('hrDetailTabs');
  const lessonDialog = byId('hrLessonDialog');
  const lessonEditForm = byId('hrLessonEditForm');
  const lessonFields = lessonEditForm.elements;
  const originalLesson = byId('hrOriginalLesson');
  const changePreview = byId('hrChangePreview');
  const changeTimeFields = byId('hrChangeTimeFields');
  const changeModeField = byId('hrChangeModeField');
  const targetCourseFields = byId('hrTargetCourseFields');
  const targetSystemField = byId('hrTargetSystemField');
  const targetBalance = byId('hrTargetBalance');
  const cancelChangeSummary = byId('hrCancelChangeSummary');
  const splitOption = byId('hrSplitLessonOption');
  const splitFields = byId('hrSplitLessonFields');
  const demoTargetSystems = new Map([
    ['IB', {subjects:['物理','数学'], minutes:480}],
    ['IGCSE', {subjects:['物理','化学'], minutes:0}],
    ['ALEVEL', {subjects:['数学','物理','化学','计算机','会计'], minutes:360}],
  ]);
  const minutesOf = time => Number(time.slice(0,2)) * 60 + Number(time.slice(3,5));
  const durationOf = (start, end) => minutesOf(end) - minutesOf(start);
  const hoursText = minutes => Number((minutes / 60).toFixed(2)) + ' 小时';
  const holdExpiry = lesson => new Date(lesson.holdUntil).toLocaleString('zh-CN', {hour12:false});
  const customTimeFields = byId('hrCustomLessonTime');
  const standardPeriods = [...lessonFields.standardPeriod.options].slice(1).map(option => option.value);
  const locationFields = byId('hrLessonLocationFields');
  const changeReasons = byId('hrLessonReasons');
  const cancelReasons = byId('hrCancelLessonReasons');
  const reasonRequired = byId('hrLessonReasonRequired');
  const submitLessonEdit = byId('hrSubmitLessonEdit');
  const conflictPanel = byId('hrLessonConflict');
  const conflictMessage = byId('hrLessonConflictMessage');
  const roomActions = byId('hrRoomActions');
  const matchRoomButton = byId('hrMatchRoom');
  const chooseRoomButton = byId('hrChooseRoom');
  const manualRoomField = byId('hrManualRoomField');
  const manualRoom = byId('hrManualRoom');
  const roomStatus = byId('hrRoomStatus');
  let editingLesson = null;
  let initialLessonValues = null;
  let roomCampus = '';
  let changePlan = null;
  let nextLessonId = lessons.length + 1;
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let appliedFilters = new FormData(filters);

  function setupTabs(attribute, onChange) {
    const buttons = [...document.querySelectorAll('['+attribute+']')];
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      onChange(button.getAttribute(attribute));
    }));
  }

  function renderStudents() {
    const found = ['mine','matched'].includes(scope) && ['all','waiting'].includes(studentStatus) &&
      [...appliedFilters].every(([key,value]) => !value.trim() || student[key].toLowerCase().includes(value.trim().toLowerCase()));
    byId('hrStudentRow').hidden = !found;
    byId('hrStudentEmpty').hidden = found;
    byId('hrStudentCount').textContent = found ? '1' : '0';
  }

  function showPage() {
    const detail = window.location.hash === studentHash;
    byId('hrListPage').hidden = detail;
    byId('hrDetailPage').hidden = !detail;
    if (!detail && lessonDialog.open) lessonDialog.close();
    if (!detail && batchLocationDialog.open) batchLocationDialog.close();
    if (!detail && batchOperationDialog.open) batchOperationDialog.close();
    if (!detail && batchDialog.open) batchDialog.close();
    window.scrollTo(0,0);
  }
  function latestLessonFirst(a,b) {
    return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
  }
  function updateSelection() {
    const total = batchRows.querySelectorAll('tr:not([hidden]) input').length;
    const visibleSelected = batchRows.querySelectorAll('tr:not([hidden]) input:checked').length;
    const selected = batchRows.querySelectorAll('input:checked').length;
    selectAll.disabled = total === 0;
    selectAll.checked = total > 0 && visibleSelected === total;
    selectAll.indeterminate = visibleSelected > 0 && visibleSelected < total;
    batchActions.forEach(button => { button.disabled = selected === 0; });
    byId('hrBatchCount').textContent = `当前列表 ${total} 节，累计已选 ${selected} 节`;
  }
  function renderLessons() {
    const rows = lessons.filter(lesson => (!lesson.cancelled || lesson.holdUntil > Date.now()) &&
      (lessonType === 'all' || lesson.type === lessonType)).sort(latestLessonFirst);
    lessonRows.innerHTML = rows.map(lesson => `<tr>
      <td>${escape(lesson.date)}</td><td>${escape(lesson.time)}</td>
      <td><span class="hr-course-name"><i aria-hidden="true">★</i>${escape(lesson.course)}</span></td>
      <td>${lesson.medal?`<span class="hr-teacher-medal"><i aria-hidden="true">🏅</i>${escape(lesson.teacher)}</span>`:escape(lesson.teacher)}</td>
      <td>${lesson.type==='diagnostic'?escape(lesson.className):`<span class="hr-lesson-class">${escape(lesson.className)}</span>`}</td>
      <td>${escape(lesson.classNo)}</td><td>${[lesson.campus,lesson.room].filter(Boolean).map(escape).join(' · ')}</td><td>李春玲</td>
      <td>${lesson.cancelled ? `<span class="hr-hold-label">时段保留中<br>${escape(holdExpiry(lesson))} 到期</span>` : lesson.confirmed?'已确认':'未确认'}</td>
      <td><div class="hr-row-actions">${lesson.change && !lesson.cancelled?`<button type="button" class="hr-button hr-primary" data-edit-lesson="${lesson.id}" aria-haspopup="dialog">变更</button>`:''}${lesson.cancelled ? '' : '<span class="hr-homework">作业</span>'}</div></td>
    </tr>`).join('') || '<tr><td class="hr-empty" colspan="10">暂无课节</td></tr>';
    byId('hrLessonCount').textContent = String(rows.length);
  }
  function openBatchDialog() {
    const rows = lessons.filter(lesson => lesson.change && !lesson.cancelled).sort(latestLessonFirst);
    const courseNames = rows.map(lesson => lesson.course.replace(/-(线上|线下|OMO)$/, ''));
    const availableCourses = [...new Set(courseNames)];
    batchCourses.innerHTML = '<button type="button" data-batch-course="" aria-pressed="true">全部</button>' +
      availableCourses.map(name => `<button type="button" data-batch-course="${escape(name)}" aria-pressed="false">${escape(name)}</button>`).join('');
    batchRows.innerHTML = rows.map((lesson,index) => `<tr data-batch-course="${escape(courseNames[index])}">
      <td><input type="checkbox" value="${lesson.id}" aria-label="选择 ${escape(lesson.date)} ${escape(lesson.time)} ${escape(lesson.course)}"></td>
      <td>${escape(lesson.date)}</td><td>${escape(lesson.time)}</td><td>${escape(lesson.course)}</td>
      <td>${escape(lesson.teacher)}</td><td>${escape(lesson.className)}</td>
      <td>${[lesson.campus,lesson.room].filter(Boolean).map(escape).join(' · ') || '--'}</td>
    </tr>`).join('') || '<tr><td class="hr-empty" colspan="7">暂无可变更课节</td></tr>';
    updateSelection();
    batchDialog.showModal();
  }

  function selectedBatchLessons() {
    const selectedIds = new Set([...batchRows.querySelectorAll('input:checked')].map(input => Number(input.value)));
    return lessons.filter(lesson => lesson.change && !lesson.cancelled && selectedIds.has(lesson.id));
  }

  function mountBatchReasons(host, template) {
    const group = template.cloneNode(true);
    const prefix = host.id + '-';
    group.id = prefix + template.id;
    for (const label of group.querySelectorAll('[id]')) label.id = prefix + label.id;
    for (const part of group.querySelectorAll('[aria-labelledby]')) {
      part.setAttribute('aria-labelledby', prefix + part.getAttribute('aria-labelledby'));
    }
    group.querySelectorAll('input').forEach(option => { option.checked = false; });
    group.hidden = false;
    group.disabled = false;
    host.replaceChildren(group);
  }

  function checkedReasons(form) {
    return [...form.querySelectorAll('input[name="changeReason"]:checked')].map(option => option.value);
  }

  const totalLessonMinutes = selected => selected.reduce((total, lesson) => total + durationOf(...lesson.time.split('-')), 0);

  function updateBatchSubjects(selected) {
    const system = batchOperation === 'subject' ? selected[0]?.course.split('-')[0] : batchOperationFields.targetSystem.value;
    const sourceSubjects = new Set(selected.map(lesson => lesson.course.split('-')[1]));
    const subjects = demoTargetSystems.get(system)?.subjects || [];
    batchOperationFields.targetSubject.replaceChildren(new Option('请选择科目',''),
      ...subjects.filter(subject => batchOperation !== 'subject' || !sourceSubjects.has(subject)).map(subject => new Option(subject, subject)));
  }

  function syncBatchOperation() {
    const selected = selectedBatchLessons();
    const target = demoTargetSystems.get(batchOperationFields.targetSystem.value);
    const mixedSystems = batchOperation === 'subject' && new Set(selected.map(lesson => lesson.course.split('-')[0])).size > 1;
    const hold = batchOperation === 'order' || (batchOperation === 'system' && target && target.minutes < totalLessonMinutes(selected));
    const notice = mixedSystems ? '同体系换科目请先选择同一课程体系下的课节。'
      : batchOperation === 'cancel' ? '确认后取消所选课节并释放原上课时段。'
      : batchOperation === 'order' ? '取消所选课节后，为学员保留原老师时段 6 小时。'
      : batchOperation === 'system' && target
        ? `目标体系可用 ${hoursText(target.minutes)}，本次需要 ${hoursText(totalLessonMinutes(selected))}。${hold ? ' 课时不足，取消后保留原老师时段 6 小时。' : ''}`
        : batchOperation === 'subject' ? '使用原订单返还的课时，按原时段安排新科目。' : '';
    batchOperationNotice.textContent = notice;
    batchOperationNotice.hidden = !notice;
    submitBatchOperation.textContent = batchOperation === 'time' ? '提交 AI 分析'
      : hold ? '确认取消并保留时段' : batchOperation === 'cancel' ? '确认取消课节' : '确认重排';
    submitBatchOperation.disabled = !selected.length || !checkedReasons(batchOperationForm).length || mixedSystems ||
      (!batchAiFields.hidden && !batchOperationFields.requirement.value.trim()) ||
      (!batchTargetFields.hidden && (!batchOperationFields.targetSubject.value || (batchOperation === 'system' && !target)));
  }

  function openBatchOperation(button) {
    const selected = selectedBatchLessons().sort(latestLessonFirst);
    if (!selected.length) return;
    batchOperation = button.dataset.batchAction;
    batchOperationForm.reset();
    batchAnalysisPreview.hidden = true;
    const showAi = batchOperation === 'time';
    const showTarget = batchOperation === 'subject' || batchOperation === 'system';
    byId('hrBatchOperationTitle').textContent = showAi ? 'AI 补充排课要求' : button.textContent;
    batchAiFields.hidden = batchAiFields.disabled = !showAi;
    batchTargetFields.hidden = batchTargetFields.disabled = !showTarget;
    byId('hrBatchTargetSystemField').hidden = batchOperation !== 'system';
    batchOperationFields.targetSystem.disabled = batchOperation !== 'system';
    batchOperationFields.targetSystem.required = batchOperation === 'system';
    const sourceSystems = new Set(selected.map(lesson => lesson.course.split('-')[0]));
    batchOperationFields.targetSystem.replaceChildren(new Option('请选择目标体系',''),
      ...[...demoTargetSystems.keys()].filter(system => !sourceSystems.has(system)).map(system => new Option(system, system)));
    updateBatchSubjects(selected);
    byId('hrBatchOperationTotal').textContent = `${selected.length} 节 · ${hoursText(totalLessonMinutes(selected))}`;
    byId('hrBatchOperationRows').innerHTML = selected.map(lesson => `<tr>
      <td>${escape(lesson.course)}</td><td>${escape(lesson.date)}</td><td>${escape(lesson.time)}</td>
      <td>${hoursText(durationOf(...lesson.time.split('-')))}</td><td>${escape(lesson.teacher)}</td></tr>`).join('');
    mountBatchReasons(byId('hrBatchOperationReasons'), batchOperation === 'cancel' ? cancelReasons : changeReasons);
    syncBatchOperation();
    batchOperationDialog.showModal();
    if (showAi) batchOperationFields.requirement.focus();
  }

  function submitBatchChange(event) {
    event.preventDefault();
    syncBatchOperation();
    if (submitBatchOperation.disabled) return;
    const selected = selectedBatchLessons();
    const reasons = checkedReasons(batchOperationForm);
    if (batchOperation === 'time') {
      batchAnalysisPreview.innerHTML = `<strong>AI 分析输入预览</strong>
        <p>${selected.length} 节原课节及变更原因已带入。本次重排最多 ${hoursText(totalLessonMinutes(selected))}。</p>
        <p>${escape(batchOperationFields.requirement.value.trim())}</p>`;
      batchAnalysisPreview.hidden = false;
      batchAnalysisPreview.scrollIntoView({block:'nearest'});
      return;
    }
    const target = demoTargetSystems.get(batchOperationFields.targetSystem.value);
    const total = totalLessonMinutes(selected);
    const hold = batchOperation === 'order' || (batchOperation === 'system' && target.minutes < total);
    const cancel = batchOperation === 'cancel' || hold;
    const holdUntil = hold ? Date.now() + 6 * 60 * 60 * 1000 : undefined;
    for (const lesson of selected) {
      if (cancel) {
        Object.assign(lesson, {cancelled:true, holdUntil, changeReasons:reasons});
        continue;
      }
      const parts = lesson.course.split('-');
      const [system, , board] = parts;
      const newSystem = batchOperation === 'system' ? batchOperationFields.targetSystem.value : system;
      const subject = batchOperationFields.targetSubject.value;
      lesson.course = [newSystem, subject, batchOperation === 'subject' && parts.length > 3 ? board : '', parts.at(-1)].filter(Boolean).join('-');
      lesson.className = `${student.student}-${newSystem}-${subject}`;
      lesson.classNo = '待关联';
      if (batchOperation === 'system') lesson.orderNo = `ORD-DEMO-${newSystem}`;
      lesson.changeReasons = reasons;
    }
    if (!cancel && batchOperation === 'system') target.minutes -= total;
    renderLessons();
    batchOperationDialog.close();
    batchDialog.close();
  }

  function syncBatchLocation() {
    const mode = batchLocationFields.mode.value;
    const inPerson = mode === '线下' || mode === 'OMO';
    batchCampusField.hidden = !inPerson;
    batchLocationFields.campus.disabled = !inPerson;
    if (!inPerson) batchLocationFields.campus.value = '';
    submitBatchLocation.disabled = !mode || (inPerson && !batchLocationFields.campus.value) || !checkedReasons(batchLocationForm).length;
    batchLocationMessage.textContent = '';
  }

  function applyBatchLocation(event) {
    event.preventDefault();
    const selected = selectedBatchLessons();
    const mode = batchLocationFields.mode.value;
    const campus = mode === '线上' ? '' : batchLocationFields.campus.value;
    if (!selected.length || submitBatchLocation.disabled) return;

    const selectedIds = new Set(selected.map(lesson => lesson.id));
    const bookings = [...lessons.filter(lesson => !selectedIds.has(lesson.id)), ...otherBookings];
    const reasons = checkedReasons(batchLocationForm);
    const changes = [];
    for (const lesson of selected) {
      const updated = {...lesson, campus, room: '', roomCampus: '', course: lesson.course.replace(/-(线上|线下|OMO)$/, `-${mode}`), changeReasons:reasons};
      if (campus) {
        const [startTime, endTime] = lesson.time.split('-');
        const overlapping = overlappingBookings({date:lesson.date, startTime, endTime}, bookings);
        const available = getAvailableRooms({campus}, overlapping);
        updated.room = available.includes(lesson.room) ? lesson.room : available[0];
        if (!updated.room) {
          batchLocationMessage.textContent = `${lesson.date} ${lesson.time} 在${campus}没有可用教室，请选择其他校区。`;
          return;
        }
      }
      bookings.push(updated);
      changes.push([lesson, updated]);
    }
    changes.forEach(([lesson, updated]) => Object.assign(lesson, updated));
    renderLessons();
    batchLocationDialog.close();
    batchDialog.close();
  }

  function syncLessonLocation() {
    const inPerson = ['线下','OMO'].includes(lessonFields.mode.value);
    locationFields.hidden = !inPerson || changeModeField.hidden;
    lessonFields.campus.disabled = locationFields.hidden;
    lessonFields.room.disabled = locationFields.hidden;
  }
  function syncLessonTime() {
    const standard = lessonFields.timeMode.value === 'standard';
    lessonFields.standardPeriod.hidden = !standard;
    lessonFields.standardPeriod.disabled = !standard;
    customTimeFields.hidden = standard;
    lessonFields.startTime.disabled = standard;
    lessonFields.endTime.disabled = standard;
  }
  function updateRoomOptions() {
    const rooms = roomsByCampus.get(lessonFields.campus.value.trim()) || [];
    byId('hrRoomOptions').replaceChildren(...rooms.map(name => new Option(name, name)));
  }
  function syncRoomActions(showForConflict = false) {
    const {mode,campus} = readLessonEdit();
    roomActions.hidden = mode === '线上' || !roomsByCampus.has(campus) ||
      (!showForConflict && campus === initialLessonValues?.campus);
  }
  function overlappingBookings({date,startTime,endTime}, bookings = [...lessons, ...otherBookings]) {
    return bookings.filter(booking => {
      const [start,end] = booking.time.split('-');
      return booking !== editingLesson && (!booking.cancelled || booking.holdUntil > Date.now()) &&
        booking.date === date && start < endTime && startTime < end;
    });
  }
  function getAvailableRooms(values, bookings = overlappingBookings(values)) {
    const rooms = roomsByCampus.get(values.campus) || [];
    return rooms.filter(name => !bookings.some(booking =>
      !booking.cancelled && booking.room === name && (booking.campus || booking.roomCampus) === values.campus));
  }
  function clearLessonConflict() {
    conflictPanel.hidden = true;
    conflictMessage.textContent = '';
    manualRoomField.hidden = true;
    chooseRoomButton.setAttribute('aria-expanded', 'false');
    roomStatus.textContent = '';
    syncRoomActions();
  }
  function showLessonConflict(message, showRoomActions = false) {
    conflictMessage.textContent = message;
    conflictPanel.hidden = false;
    syncRoomActions(showRoomActions);
    conflictMessage.focus();
  }
  function roomsForSelection() {
    const values = readLessonEdit();
    if (!values.date || !values.startTime || values.endTime <= values.startTime) {
      roomStatus.textContent = '请先选择有效的上课日期和时段。';
      return [];
    }
    const rooms = getAvailableRooms(values);
    if (!rooms.length) roomStatus.textContent = '该校区在所选时段没有可用教室，请调整时间或校区。';
    return rooms;
  }
  function useAvailableRoom(name, source, trigger) {
    lessonFields.room.value = name;
    clearLessonConflict();
    roomStatus.textContent = `${source}：${name}`;
    refreshLessonReasons();
    (roomActions.hidden ? lessonFields.room : trigger).focus();
  }
  function readLessonEdit() {
    const {date,startTime,endTime,timeMode,standardPeriod,mode,campus,room} = lessonFields;
    const [start,end] = timeMode.value === 'standard'
      ? standardPeriod.value.split('-')
      : [startTime.value,endTime.value];
    const online = mode.value === '线上';
    const values = {
      date: date.value,
      startTime: start,
      endTime: end || '',
      mode: mode.value,
      campus: online ? '' : campus.value.trim(),
      room: online ? '' : room.value.trim(),
    };
    if (!initialLessonValues) return values;
    if (lessonFields.changeType.value === 'location') {
      return {...initialLessonValues, mode:values.mode, campus:values.campus, room:values.room};
    }
    if (changeTimeFields.hidden) return {...initialLessonValues};
    return {...initialLessonValues, date:values.date, startTime:values.startTime, endTime:values.endTime};
  }

  function pickTargetSubjects() {
    const [sourceSystem, sourceSubject] = editingLesson.course.split('-');
    const system = lessonFields.changeType.value === 'subject' ? sourceSystem : lessonFields.targetSystem.value;
    const subjects = (demoTargetSystems.get(system)?.subjects || []).filter(subject =>
      system !== sourceSystem || subject !== sourceSubject);
    lessonFields.targetSubject.replaceChildren(new Option('请选择目标科目', ''),
      ...subjects.map(subject => new Option(subject, subject)));
  }

  function syncChangeType() {
    const type = lessonFields.changeType.value;
    const isSwap = type === 'subject' || type === 'system';
    changeModeField.hidden = type !== 'location';
    targetCourseFields.hidden = !isSwap;
    targetSystemField.hidden = type !== 'system';
    lessonFields.targetSystem.disabled = type !== 'system';
    lessonFields.targetSubject.disabled = !isSwap;
    lessonFields.targetSystem.required = type === 'system';
    lessonFields.targetSubject.required = isSwap;
    cancelChangeSummary.hidden = type !== 'cancel' && type !== 'order';
    const duration = hoursText(durationOf(...editingLesson.time.split('-')));
    cancelChangeSummary.textContent = type === 'order'
      ? `原订单 ${editingLesson.orderNo}。将取消原课并返还 ${duration}，为该学员保留原老师时段 6 小时。新订单生效后可恢复排课。`
      : `将取消当前课节、返还 ${duration}，并释放原师生时段。`;
    const target = demoTargetSystems.get(lessonFields.targetSystem.value);
    const hold = type === 'system' && target && target.minutes < durationOf(...editingLesson.time.split('-'));
    targetBalance.textContent = type === 'subject'
      ? `沿用原订单。本节取消后返还 ${duration} 用于新科目。`
      : target ? `目标体系可用 ${hoursText(target.minutes)}，本次需 ${duration}。${hold ? ' 课时不足，取消后可保留原老师时段 6 小时。' : ''}` : '';
    byId('hrChangeTargetTime').hidden = Boolean(hold);
    changeTimeFields.hidden = type !== 'time' && (!isSwap || !lessonFields.changeTargetTime.checked || Boolean(hold));
    changeTimeFields.disabled = changeTimeFields.hidden;
    splitOption.hidden = type !== 'time';
    splitFields.hidden = splitOption.hidden || !lessonFields.splitLesson.checked;
    splitFields.disabled = splitFields.hidden;
    syncLessonLocation();
  }
  function refreshLessonReasons(values = readLessonEdit()) {
    const type = lessonFields.changeType.value;
    const editExisting = type === 'time' || type === 'location';
    const changed = editExisting && initialLessonValues !== null &&
      (Object.keys(values).some(key => values[key] !== initialLessonValues[key]) ||
        (type === 'time' && lessonFields.splitLesson.checked));
    const activeGroup = type === 'cancel' ? cancelReasons : changeReasons;
    const showReasons = !editExisting || changed;
    for (const group of [changeReasons, cancelReasons]) {
      group.hidden = !showReasons || group !== activeGroup;
      group.disabled = group.hidden;
      if (group.hidden) group.querySelectorAll('input:checked').forEach(option => { option.checked = false; });
    }
    const reasons = [...activeGroup.querySelectorAll('input:checked')].map(option => option.value);
    reasonRequired.hidden = !showReasons || reasons.length > 0;
    const target = demoTargetSystems.get(lessonFields.targetSystem.value);
    const hold = type === 'order' || (type === 'system' && target && target.minutes < durationOf(...editingLesson.time.split('-')));
    submitLessonEdit.textContent = hold ? '确认取消并保留时段'
      : type === 'cancel' ? '确认取消' : type === 'location' ? '保存修改' : changePlan ? '确认重排' : '预览新安排';
    const missingTarget = (type === 'subject' || type === 'system') &&
      (!lessonFields.targetSubject.value || (type === 'system' && !target));
    submitLessonEdit.disabled = !showReasons || reasons.length === 0 || missingTarget;
    return reasons;
  }
  function openLessonEdit(lesson) {
    editingLesson = lesson;
    lessonEditForm.reset();
    changePlan = null;
    changePreview.hidden = true;
    initialLessonValues = null;
    changeTimeFields.hidden = false;
    const [sourceSystem] = lesson.course.split('-');
    originalLesson.innerHTML = `<strong>${escape(lesson.course)} · ${escape(lesson.teacher)}</strong><span>${escape(lesson.date)} ${escape(lesson.time)} · ${hoursText(durationOf(...lesson.time.split('-')))} · ${escape(lesson.campus || lesson.roomCampus || '线上')}</span>`;
    lessonFields.targetSystem.replaceChildren(new Option('请选择目标课程体系', ''),
      ...[...demoTargetSystems.keys()].filter(system => system !== sourceSystem).map(system => new Option(system, system)));
    const [start,end] = lesson.time.split('-');
    lessonFields.date.value = lesson.date;
    lessonFields.startTime.value = start;
    lessonFields.endTime.value = end;
    const standard = standardPeriods.includes(lesson.time);
    lessonFields.standardPeriod.value = standard ? lesson.time : '';
    lessonFields.timeMode.value = standard ? 'standard' : 'custom';
    syncLessonTime();
    lessonFields.endTime.setCustomValidity('');
    lessonFields.mode.value = lesson.course.match(/-(线上|线下|OMO)$/)?.[1] || '线上';
    lessonFields.campus.value = lesson.campus || lesson.roomCampus || '';
    lessonFields.room.value = lesson.room || '';
    roomCampus = lessonFields.campus.value;
    updateRoomOptions();
    initialLessonValues = readLessonEdit();
    syncChangeType();
    clearLessonConflict();
    refreshLessonReasons();
    lessonDialog.showModal();
    lessonEditForm.querySelector('input[name="changeType"]:checked').focus();
  }

  lessonRows.addEventListener('click', event => {
    const button = event.target.closest('[data-edit-lesson]');
    if (!button) return;
    const lesson = lessons.find(item => item.id === Number(button.dataset.editLesson) && item.change && !item.cancelled);
    if (lesson) openLessonEdit(lesson);
  });
  lessonDialog.querySelectorAll('[data-close-lesson-edit]').forEach(button => {
    button.addEventListener('click', () => lessonDialog.close());
  });
  lessonDialog.addEventListener('close', () => {
    const button = lessonRows.querySelector(`[data-edit-lesson="${editingLesson?.id}"]`);
    editingLesson = null;
    initialLessonValues = null;
    changePlan = null;
    if (!byId('hrDetailPage').hidden) button?.focus();
  });
  lessonFields.mode.addEventListener('input', syncLessonLocation);
  for (const field of [lessonFields.startTime,lessonFields.endTime]) {
    field.addEventListener('input', () => lessonFields.endTime.setCustomValidity(''));
  }
  lessonFields.campus.addEventListener('input', () => {
    const campus = lessonFields.campus.value.trim();
    if (campus === roomCampus) return;
    roomCampus = campus;
    lessonFields.room.value = campus === initialLessonValues?.campus ? initialLessonValues.room : '';
    updateRoomOptions();
  });
  lessonEditForm.addEventListener('input', event => {
    if (event.target === manualRoom) return;
    if (event.target.name === 'timeMode') syncLessonTime();
    if (['changeType','targetSystem'].includes(event.target.name)) pickTargetSubjects();
    if (event.target.name !== 'changeReason') {
      changePlan = null;
      changePreview.hidden = true;
      syncChangeType();
      clearLessonConflict();
    }
    refreshLessonReasons();
  });
  matchRoomButton.addEventListener('click', () => {
    const [name] = roomsForSelection();
    if (name) useAvailableRoom(name, '系统已匹配教室', matchRoomButton);
  });
  chooseRoomButton.addEventListener('click', () => {
    const rooms = roomsForSelection();
    if (!rooms.length) return;
    manualRoom.replaceChildren(new Option('请选择可用教室', ''), ...rooms.map(name => new Option(name, name)));
    roomStatus.textContent = '';
    manualRoomField.hidden = false;
    chooseRoomButton.setAttribute('aria-expanded', 'true');
    manualRoom.focus();
  });
  manualRoom.addEventListener('change', () => {
    if (manualRoom.value) useAvailableRoom(manualRoom.value, '已选择教室', chooseRoomButton);
  });

  function previewReplacement(values, reasons, type, target) {
    const {date,startTime,endTime,mode,campus,room} = values;
    const slots = [{date,startTime,endTime}];
    if (type === 'time' && lessonFields.splitLesson.checked) {
      slots.push({date:lessonFields.splitDate.value, startTime:lessonFields.splitStart.value, endTime:lessonFields.splitEnd.value});
    }
    if (slots.some(slot => slot.endTime <= slot.startTime)) {
      showLessonConflict('每节课的结束时间须晚于开始时间。');
      return null;
    }
    const originalMinutes = durationOf(...editingLesson.time.split('-'));
    const totalMinutes = slots.reduce((total, slot) => total + durationOf(slot.startTime, slot.endTime), 0);
    if (totalMinutes > originalMinutes || (type !== 'time' && totalMinutes !== originalMinutes)) {
      showLessonConflict(type === 'time' ? `重排总时长不能超过原课的 ${hoursText(originalMinutes)}。`
        : '换科目或换体系时，此处沿用原课时长。');
      return null;
    }
    const [sourceSystem, , board] = editingLesson.course.split('-');
    const targetSystem = type === 'system' ? lessonFields.targetSystem.value : sourceSystem;
    const targetSubject = lessonFields.targetSubject.value;
    const course = type === 'time' ? editingLesson.course
      : [targetSystem, targetSubject, type === 'subject' ? board : '', mode].filter(Boolean).join('-');
    const proposed = [];
    for (const slot of slots) {
      const bookings = overlappingBookings(slot, [...lessons, ...otherBookings, ...proposed]);
      const teacherBusy = bookings.find(booking => booking.teacher === editingLesson.teacher);
      const studentBusy = bookings.find(booking => booking.id && !booking.cancelled);
      if (teacherBusy || studentBusy) {
        const conflict = teacherBusy || studentBusy;
        showLessonConflict(`${slot.date} ${conflict.time} ${teacherBusy ? '授课老师' : '学员'}已有排课，请另选时段。`);
        return null;
      }
      const availableRooms = campus ? getAvailableRooms({campus}, bookings) : [];
      if (mode !== '线上' && !availableRooms.length) {
        showLessonConflict(`${slot.date} 所选时段在${campus}没有可用教室。`);
        return null;
      }
      const replacement = {...editingLesson, date:slot.date, time:`${slot.startTime}-${slot.endTime}`, course, campus,
        room:availableRooms.includes(room) ? room : availableRooms[0] || '', roomCampus:'', changeReasons:reasons};
      if (type !== 'time') {
        replacement.className = `${student.student}-${targetSystem}-${targetSubject}`;
        replacement.classNo = '待关联';
        if (type === 'system') replacement.orderNo = `ORD-DEMO-${targetSystem}`;
      }
      proposed.push(replacement);
    }
    return {proposed, target, totalMinutes};
  }

  lessonEditForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!editingLesson) return;
    const values = readLessonEdit();
    const reasons = refreshLessonReasons(values);
    if (submitLessonEdit.disabled) return;
    const type = lessonFields.changeType.value;
    const target = type === 'system' ? demoTargetSystems.get(lessonFields.targetSystem.value) : null;
    const originalMinutes = durationOf(...editingLesson.time.split('-'));
    clearLessonConflict();
    if (type === 'cancel' || type === 'order' || (target && target.minutes < originalMinutes)) {
      editingLesson.cancelled = true;
      editingLesson.changeReasons = reasons;
      if (type !== 'cancel') editingLesson.holdUntil = Date.now() + 6 * 60 * 60 * 1000;
      renderLessons();
      lessonDialog.close();
      return;
    }
    if (type !== 'location') {
      const plan = previewReplacement(values, reasons, type, target);
      if (!plan) return;
      if (!changePlan) {
        changePlan = plan;
        changePreview.innerHTML = '<strong>重排预览</strong>' +
          `<p>原安排 · ${escape(editingLesson.date)} ${escape(editingLesson.time)} · ${escape(editingLesson.course)}</p>` +
          plan.proposed.map(lesson => `<p>新安排 · ${escape(lesson.date)} ${escape(lesson.time)} · ${escape(lesson.course)}</p>`).join('') +
          `<p>重排总时长 ${hoursText(plan.totalMinutes)}。确认后替换原课节。</p>`;
        changePreview.hidden = false;
        refreshLessonReasons(values);
        return;
      }
      const [first, ...additional] = plan.proposed;
      Object.assign(editingLesson, first);
      additional.forEach(lesson => lessons.push({...lesson, id:nextLessonId++}));
      if (target) target.minutes -= plan.totalMinutes;
      renderLessons();
      lessonDialog.close();
      return;
    }
    const {date,startTime,endTime,mode,campus,room} = values;
    const bookings = overlappingBookings(values);
    if (mode !== '线上') {
      if (!roomsByCampus.has(campus)) {
        showLessonConflict('请选择有效的授课校区。');
        lessonFields.campus.focus();
        return;
      }
      const availableRooms = getAvailableRooms(values, bookings);
      if (!availableRooms.includes(room)) {
        const message = room ? `教室「${room}」在所选校区和时段不可用。` : '请选择教室。';
        showLessonConflict(message + (availableRooms.length
          ? '可让系统匹配或手动分配可用教室。'
          : '该校区在所选时段没有可用教室，请调整时间或校区。'), true);
        return;
      }
    }
    Object.assign(editingLesson,{
      date,
      time:`${startTime}-${endTime}`,
      course:editingLesson.course.replace(/-(线上|线下|OMO)$/, `-${mode}`),
      campus,
      room,
      changeReasons:reasons,
    });
    renderLessons();
    lessonDialog.close();
  });

  filters.addEventListener('submit', event => {
    event.preventDefault();
    appliedFilters = new FormData(filters);
    renderStudents();
  });
  filters.addEventListener('reset', event => {
    event.preventDefault();
    for (const control of filters.elements) {
      if (control.matches('input, select')) control.value = '';
    }
    appliedFilters = new FormData(filters);
    renderStudents();
  });
  setupTabs('data-scope',value => { scope=value; renderStudents(); });
  setupTabs('data-student-status',value => { studentStatus=value; renderStudents(); });
  setupTabs('data-lesson-type',value => { lessonType=value; renderLessons(); });
  document.querySelector('.hr-role-switch').addEventListener('click', event => {
    const button = event.currentTarget;
    button.setAttribute('aria-checked',String(button.getAttribute('aria-checked') !== 'true'));
  });
  byId('hrRefresh').addEventListener('click', () => window.location.reload());
  byId('hrTabsLeft').addEventListener('click', () => lessonTabs.scrollBy({left:-380,behavior:'smooth'}));
  byId('hrTabsRight').addEventListener('click', () => lessonTabs.scrollBy({left:380,behavior:'smooth'}));
  batchButton.addEventListener('click', openBatchDialog);
  for (const button of batchActions) {
    if (button !== batchLocationButton) button.addEventListener('click', () => openBatchOperation(button));
  }
  batchOperationForm.addEventListener('input', event => {
    if (event.target === batchOperationFields.targetSystem) updateBatchSubjects(selectedBatchLessons());
    batchAnalysisPreview.hidden = true;
    syncBatchOperation();
  });
  batchOperationForm.addEventListener('submit', submitBatchChange);
  batchOperationDialog.querySelectorAll('[data-close-batch-operation]').forEach(button => {
    button.addEventListener('click', () => batchOperationDialog.close());
  });
  for (const campus of roomsByCampus.keys()) batchLocationFields.campus.add(new Option(campus, campus));
  batchLocationButton.addEventListener('click', () => {
    if (!selectedBatchLessons().length) return;
    batchLocationForm.reset();
    mountBatchReasons(byId('hrBatchLocationReasons'), changeReasons);
    syncBatchLocation();
    batchLocationDialog.showModal();
  });
  batchLocationForm.addEventListener('change', syncBatchLocation);
  batchLocationForm.addEventListener('submit', applyBatchLocation);
  batchLocationDialog.querySelectorAll('[data-close-batch-location]').forEach(button => {
    button.addEventListener('click', () => batchLocationDialog.close());
  });
  batchCourses.addEventListener('click', event => {
    const button = event.target.closest('button[data-batch-course]');
    if (!button) return;
    const course = button.dataset.batchCourse;
    for (const tab of batchCourses.querySelectorAll('button')) {
      tab.setAttribute('aria-pressed', String(tab === button));
    }
    for (const row of batchRows.querySelectorAll('tr[data-batch-course]')) {
      row.hidden = Boolean(course) && row.dataset.batchCourse !== course;
    }
    updateSelection();
  });
  batchDialog.querySelectorAll('[data-close-batch]').forEach(button => {
    button.addEventListener('click', () => batchDialog.close());
  });
  selectAll.addEventListener('change', () => {
    batchRows.querySelectorAll('tr:not([hidden]) input').forEach(input => { input.checked = selectAll.checked; });
    updateSelection();
  });
  batchRows.addEventListener('change', updateSelection);
  window.addEventListener('hashchange', showPage);
  renderStudents();
  renderLessons();
  showPage();
})();
