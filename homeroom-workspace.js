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
  ].map((lesson,index) => {
    const id = index + 1;
    const lock = window.studentSlotLocks.forLesson(student.customerNo, id);
    return {...lesson,id,orderNo:lesson.change ? 'ORD-202611-' + lesson.classNo.slice(-4) : '',
      cancelled:Boolean(lock),slotLocked:Boolean(lock && !lock.used && lock.expiresAt > Date.now())};
  });
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
  const batchTargetFields = byId('hrBatchTargetFields');
  const batchCourseTeacherField = byId('hrBatchCourseTeacherField');
  const batchOperationRows = byId('hrBatchOperationRows');
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
  const changeTimeFields = byId('hrChangeTimeFields');
  const changeModeField = byId('hrChangeModeField');
  const targetCourseFields = byId('hrTargetCourseFields');
  const targetBalance = byId('hrTargetBalance');
  const courseTeacherField = byId('hrCourseTeacherField');
  const replanFields = byId('hrReplanFields');
  const lessonChangeStatus = byId('hrLessonChangeStatus');
  const refundedMinutesByOrder = new Map();
  const newTeacherCourseNotice = byId('hrNewTeacherCourseNotice');
  const minutesOf = time => Number(time.slice(0,2)) * 60 + Number(time.slice(3,5));
  const durationOf = (start, end) => minutesOf(end) - minutesOf(start);
  function endAfter(start, duration) {
    const end = minutesOf(start) + duration;
    if (!start || !(duration > 0) || end > 1440) return '';
    return `${String(Math.floor(end / 60)).padStart(2,'0')}:${String(end % 60).padStart(2,'0')}`;
  }
  const hoursText = minutes => Number((minutes / 60).toFixed(2)) + ' 小时';
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
  const aiChangeDialog = document.createElement('dialog');
  aiChangeDialog.className = 'hr-order-form-dialog';
  aiChangeDialog.setAttribute('aria-label', '变更排课');
  document.body.append(aiChangeDialog);
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
    if (detail) renderLessons();
    const scheduling = ['#my-scheduling', '#renewal-plans'].includes(window.location.hash);
    byId('hrListPage').hidden = detail || scheduling;
    byId('hrDetailPage').hidden = !detail;
    byId('hrSchedulingPage').hidden = !scheduling;
    if (scheduling) byId('hrStudentMenu').removeAttribute('aria-current');
    else byId('hrStudentMenu').setAttribute('aria-current', 'page');
    if (!detail && lessonDialog.open) lessonDialog.close();
    if (!detail && batchLocationDialog.open) batchLocationDialog.close();
    if (!detail && batchOperationDialog.open) batchOperationDialog.close();
    if (!detail && batchDialog.open) batchDialog.close();
    if (!detail && aiChangeDialog.open) aiChangeDialog.close();
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
    for (const lesson of lessons.filter(item => item.slotLocked)) {
      const lock = window.studentSlotLocks.forLesson(student.customerNo, lesson.id);
      lesson.slotLocked = Boolean(lock && !lock.used && lock.expiresAt > Date.now());
    }
    const rows = lessons.filter(lesson => (!lesson.cancelled || lesson.slotLocked) &&
      (lessonType === 'all' || lesson.type === lessonType)).sort(latestLessonFirst);
    lessonRows.innerHTML = rows.map(lesson => `<tr>
      <td>${escape(lesson.date)}</td><td>${escape(lesson.time)}</td>
      <td><span class="hr-course-name"><i aria-hidden="true">★</i>${escape(lesson.course)}</span></td>
      <td>${lesson.medal?`<span class="hr-teacher-medal"><i aria-hidden="true">🏅</i>${escape(lesson.teacher)}</span>`:escape(lesson.teacher)}</td>
      <td>${lesson.type==='diagnostic'?escape(lesson.className):`<span class="hr-lesson-class">${escape(lesson.className)}</span>`}</td>
      <td>${escape(lesson.classNo)}</td><td>${[lesson.campus,lesson.room].filter(Boolean).map(escape).join(' · ')}</td><td>李春玲</td>
      <td>${lesson.slotLocked ? '<span class="hr-hold-label">课节已取消<br>原老师时段已锁定</span>' : lesson.confirmed?'已确认':'未确认'}</td>
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

  function listTargetCourses(select, selected) {
    const system = selected[0]?.course.split('-')[0];
    const sources = selected.map(lesson => lesson.course.split('-'));
    const options = system && sources.every(parts => parts[0] === system)
      ? window.prototypeCourseCatalog.catalogFor(system).filter(course => !sources.some(parts =>
        parts[1] === course.subject && parts[2] === course.board &&
        (parts.length === 4 || parts.slice(3,-1).join('-') === course.grade) && parts.at(-1) === course.mode))
        .map(course => [system, course.subject, course.board, course.grade, course.mode].filter(part => part && part !== '--').join('-'))
      : [];
    select.replaceChildren(new Option('请选择新课程',''), ...[...new Set(options)].map(name => new Option(name,name)));
  }

  function syncBatchOperation() {
    const selected = selectedBatchLessons();
    const courseChange = batchOperation === 'course';
    const sameTeacher = courseChange && batchOperationFields.courseTeacher.value === 'same';
    const needsNewTeacher = courseChange && !sameTeacher;
    const mixedSystems = courseChange && new Set(selected.map(lesson => lesson.course.split('-')[0])).size > 1;
    batchTargetFields.hidden = batchTargetFields.disabled = !sameTeacher;
    const notice = mixedSystems ? '请选择同一课程体系下的课节。'
      : batchOperation === 'cancel' ? '确认后取消所选课节并释放原上课时段。'
      : batchOperation === 'order' ? '取消所选课节，锁定各课节的原授课老师时段。适用于换课程体系或换订单。'
        : sameTeacher ? '新课程沿用各课节的原授课老师、时段和课时。'
        : needsNewTeacher ? '换老师需要填写排课信息。排课信息页待接入。' : '';
    batchOperationNotice.textContent = notice;
    batchOperationNotice.hidden = !notice;
    submitBatchOperation.textContent = batchOperation === 'time' ? '保存修改'
      : batchOperation === 'replan' ? '提交 AI 分析'
      : batchOperation === 'order' ? '确认取消课节并锁定时段'
      : batchOperation === 'cancel' ? '确认取消课节' : sameTeacher ? '确认换课程'
      : needsNewTeacher ? '填写排课信息' : '补充排课要求';
    submitBatchOperation.disabled = needsNewTeacher || !selected.length || !checkedReasons(batchOperationForm).length || mixedSystems ||
      (!batchAiFields.hidden && !batchOperationFields.requirement.value.trim()) ||
      (!batchTargetFields.hidden && !batchOperationFields.targetCourse.value);
  }

  function readBatchTimeChanges() {
    const selected = new Map(selectedBatchLessons().map(lesson => [lesson.id,lesson]));
    return [...batchOperationRows.querySelectorAll('tr')].map(row => {
      const lesson = selected.get(Number(row.dataset.lessonId));
      const read = field => row.querySelector(`[data-time-field="${field}"]`).value;
      return {lesson,date:read('date'),startTime:read('start'),endTime:read('end')};
    }).filter(({lesson,date,startTime,endTime}) => date !== lesson.date || `${startTime}-${endTime}` !== lesson.time);
  }

  function openBatchOperation(button) {
    const selected = selectedBatchLessons().sort(latestLessonFirst);
    if (!selected.length) return;
    batchOperation = button.dataset.batchAction;
    batchOperationForm.reset();
    const showAi = batchOperation === 'replan';
    const courseChange = batchOperation === 'course';
    const editTimes = batchOperation === 'time';
    byId('hrBatchOperationTitle').textContent = button.textContent;
    batchAiFields.hidden = batchAiFields.disabled = !showAi;
    batchCourseTeacherField.hidden = batchOperationFields.courseTeacher.disabled = !courseChange;
    if (courseChange) listTargetCourses(batchOperationFields.targetCourse, selected);
    byId('hrBatchOperationTotal').textContent = `${selected.length} 节 · ${hoursText(totalLessonMinutes(selected))}`;
    const timeColumns = ['调整后日期','开始时间','结束时间'];
    const columns = ['课程','上课日期','原时段','时长','老师',...(editTimes?timeColumns:[])];
    byId('hrBatchOperationHead').innerHTML = columns.map(label => `<th scope="col">${label}</th>`).join('');
    batchOperationRows.closest('table').classList.toggle('hr-batch-time-editor',editTimes);
    batchOperationRows.innerHTML = selected.map((lesson,index) => {
      const [start,end] = lesson.time.split('-');
      const timeInputs = editTimes ? [['date',lesson.date],['start',start],['end',end]].map(([key,value],i) =>
        `<td><input type="${i?'time':'date'}" aria-label="第${index+1}节${timeColumns[i]}" data-time-field="${key}" value="${escape(value)}" required></td>`).join('') : '';
      return `<tr data-lesson-id="${lesson.id}">
      <td>${escape(lesson.course)}</td><td>${escape(lesson.date)}</td><td>${escape(lesson.time)}</td>
      <td>${hoursText(durationOf(start,end))}</td><td>${escape(lesson.teacher)}</td>${timeInputs}</tr>`;
    }).join('');
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
      const changes = readBatchTimeChanges();
      const error = changes.length?saveDirectTimeChanges(changes,reasons):'请至少修改一节课的日期或起止时间。';
      if (error) {
        batchOperationNotice.hidden = false;
        batchOperationNotice.textContent = error;
        return;
      }
    }
    if (batchOperation === 'replan' || batchOperation === 'teacher') {
      const requirement = batchOperation === 'replan' ? batchOperationFields.requirement.value.trim() : '';
      openChangeAnalysis(batchOperation === 'replan'?'duration-replan':'teacher', selected, selected, reasons, {requirement});
      return;
    }
    if (batchOperation === 'course') {
      const error = changeCourseWithSameTeacher(selected, batchOperationFields.targetCourse.value, reasons);
      if (error) { batchOperationNotice.textContent = error; return; }
    }
    const slotLocked = batchOperation === 'order';
    const cancel = batchOperation === 'cancel' || slotLocked;
    for (const lesson of selected) {
      if (slotLocked) window.studentSlotLocks.lock(student.customerNo, lesson);
      if (cancel) Object.assign(lesson, {cancelled:true, slotLocked, changeReasons:reasons});
    }
    renderLessons();
    batchOperationDialog.close();
    batchDialog.close();
  }

  function changeCourseWithSameTeacher(selected, course, reasons) {
    const [system,subject] = course.split('-');
    const inPerson = !course.endsWith('-线上');
    const selectedIds = new Set(selected.map(lesson => lesson.id));
    const remaining = lessons.filter(lesson => !selectedIds.has(lesson.id));
    const replacements = [];
    for (const lesson of selected) {
      const [startTime,endTime] = lesson.time.split('-');
      const bookings = overlappingBookings({date:lesson.date,startTime,endTime}, [...remaining,...otherBookings,...replacements]);
      if (bookings.some(item => item.id && !item.cancelled || item.teacher === lesson.teacher)) {
        return `${lesson.date} ${lesson.time} 有师生排课冲突，请先调整原课时段。`;
      }
      const campus = inPerson ? lesson.campus || lesson.roomCampus || '舜元中心' : '';
      const available = inPerson ? getAvailableRooms({campus},bookings) : [];
      if (inPerson && !available.length) return `${lesson.date} ${lesson.time} 在${campus}没有可用教室。`;
      replacements.push({...lesson,course,campus,room:available.includes(lesson.room)?lesson.room:available[0]||'',
        roomCampus:'',className:`${student.student}-${system}-${subject}`,classNo:'待关联',changeReasons:reasons});
    }
    selected.forEach((lesson,index) => Object.assign(lesson,replacements[index]));
    return '';
  }

  function openChangeAnalysis(type, original, revised, reasons, {requirement = ''} = {}) {
    const selectedIds = new Set(original.map(lesson => lesson.id));
    const untouched = () => lessons.filter(lesson => !selectedIds.has(lesson.id) && (!lesson.cancelled || lesson.slotLocked));
    const groups = new Map();
    for (const lesson of revised) {
      const key = [lesson.course, lesson.classNo, lesson.teacher].join('|');
      if (!groups.has(key)) groups.set(key, { base: lesson, slots: [] });
      groups.get(key).slots.push([lesson.date, lesson.time]);
    }
    const changeGroups = [...groups.values()];
    const courses = changeGroups.map(({base,slots}) => {
      const [item,subject,...rest] = base.course.split('-');
      return { item, name:subject, board:rest.length>1?rest[0]:'--', mode:rest.at(-1),
        campus:base.campus||base.roomCampus||'', hours:slots.reduce((sum,[,time]) => sum+durationOf(...time.split('-')),0)/60 };
    });
    const dates = revised.map(lesson => lesson.date).sort();
    const order = {
      id:Date.now(), source:'homeroom-change', course:`${student.student}-变更排课`,
      submission:{student:student.student,start:dates[0],end:dates.at(-1),endMode:'SPECIFIED_DATE',courses},
      supplements:requirement?[{text:requirement}]:[],
      change:{
        type,reasons,original:original.map(({course,date,time,teacher}) => ({course,date,time,teacher})),
        autoAnalyze:Boolean(requirement),
        groups:changeGroups.map(({base,slots}) => ({teacher:base.teacher,slots})),
        busy:[...untouched().filter(lesson => !lesson.cancelled).map(({date,time,teacher}) => ({date,time,teacher,student:true})),
          ...otherBookings.filter(booking => booking.teacher)]
      }
    };
    const frame = document.createElement('iframe');
    frame.title = '变更排课';
    frame.src = `教务端/index.html?embed-homeroom-supplement=1#flow-order=${encodeURIComponent(JSON.stringify(order))}`;
    aiChangeDialog.replaceChildren(frame);
    function receive(event) {
      if (event.source !== frame.contentWindow || event.origin !== location.origin) return;
      if (event.data?.kind === 'homeroom-supplement-close') aiChangeDialog.close();
      if (event.data?.kind !== 'homeroom-change-submit') return;
      const replacements = event.data.lessons.map(([date,time,courseId]) => {
        const {base} = changeGroups[Number(courseId.slice(7))-1];
        return { ...base, date,time,teacher:event.data.teachers[courseId], changeReasons:reasons };
      });
      const originalMinutes = totalLessonMinutes(original);
      const replacementMinutes = totalLessonMinutes(replacements);
      const incorrectDuration = type === 'duration-replan' ? replacementMinutes !== originalMinutes : replacementMinutes > originalMinutes;
      const conflicting = replacements.some((lesson,index) => {
        const [startTime,endTime] = lesson.time.split('-');
        const target = {date:lesson.date,startTime,endTime};
        if (durationOf(startTime,endTime)<=0||!lesson.teacher) return true;
        return overlappingBookings(target,[...untouched().filter(item => !item.cancelled),...replacements.slice(0,index)])
          .some(item => !item.cancelled) || overlappingBookings(target,otherBookings).some(item => item.teacher===lesson.teacher);
      });
      if (!replacements.length || incorrectDuration || conflicting) {
        const durationMessage = type === 'duration-replan' ? '重排总时长须等于原课节时长。' : '变更后的课时不能超过原课时。';
        frame.contentWindow.postMessage({kind:'homeroom-change-rejected',message:incorrectDuration
          ? durationMessage : '请检查待提交课节和师生日程冲突。'},location.origin);
        return;
      }
      for (let index=lessons.length-1;index>=0;index--) {
        if (selectedIds.has(lessons[index].id)) lessons.splice(index,1);
      }
      replacements.forEach(lesson => lessons.push({...lesson,id:nextLessonId++}));
      renderLessons();
      aiChangeDialog.close();
      for (const dialog of [lessonDialog,batchOperationDialog,batchDialog]) if (dialog.open) dialog.close();
    }
    window.addEventListener('message',receive);
    aiChangeDialog.addEventListener('close',()=>{
      window.removeEventListener('message',receive);
      frame.remove();
    },{once:true});
    aiChangeDialog.showModal();
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
      return booking !== editingLesson && (!booking.cancelled || booking.slotLocked) &&
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
    const [originalStart,originalEnd] = editingLesson.time.split('-');
    const online = mode.value === '线上';
    const original = {date:editingLesson.date,startTime:originalStart,endTime:originalEnd};
    const location = {mode:mode.value,campus:online?'':campus.value.trim(),room:online?'':room.value.trim()};
    if (!initialLessonValues || lessonFields.changeType.value === 'location') return {...original,...location};
    if (lessonFields.changeType.value !== 'time') return {...initialLessonValues};
    const standard = timeMode.value === 'standard';
    const start = standard ? standardPeriod.value.split('-')[0] : startTime.value;
    const end = standard ? endAfter(start,durationOf(originalStart,originalEnd)) : endTime.value;
    return {...initialLessonValues,date:date.value,startTime:start,endTime:end};
  }

  function syncDuration() {
    const {startTime,endTime} = readLessonEdit();
    const adjusted = startTime && endTime ? durationOf(startTime,endTime) : 0;
    const remaining = durationOf(...editingLesson.time.split('-')) - adjusted;
    byId('hrAdjustedDuration').textContent = adjusted > 0 ? hoursText(adjusted) : '—';
    byId('hrRefundField').hidden = !(adjusted > 0 && remaining > 0);
    byId('hrRefundDuration').textContent = remaining > 0 ? hoursText(remaining) : '';
  }

  function syncChangeType() {
    const type = lessonFields.changeType.value;
    const isCourseChange = type === 'course';
    const isSwap = isCourseChange && lessonFields.courseTeacher.value === 'same';
    courseTeacherField.hidden = lessonFields.courseTeacher.disabled = !isCourseChange;
    changeModeField.hidden = type !== 'location';
    targetCourseFields.hidden = !isSwap;
    newTeacherCourseNotice.hidden = !isCourseChange || isSwap;
    lessonFields.targetCourse.disabled = !isSwap;
    lessonFields.targetCourse.required = isSwap;
    const duration = hoursText(durationOf(...editingLesson.time.split('-')));
    targetBalance.textContent = isSwap ? `沿用原授课老师 ${editingLesson.teacher}、原上课时段及 ${duration} 时长。` : '';
    changeTimeFields.hidden = type !== 'time';
    changeTimeFields.disabled = changeTimeFields.hidden;
    replanFields.hidden = replanFields.disabled = type !== 'replan';
    if (type === 'time') syncDuration();
    syncLessonLocation();
  }
  function refreshLessonReasons(values = readLessonEdit()) {
    const type = lessonFields.changeType.value;
    const isReplan = type === 'replan';
    const editExisting = type === 'time' || type === 'location';
    const changed = editExisting && initialLessonValues !== null &&
      Object.keys(values).some(key => values[key] !== initialLessonValues[key]);
    const activeGroup = type === 'cancel' ? cancelReasons : changeReasons;
    const showReasons = !editExisting || changed;
    for (const group of [changeReasons, cancelReasons]) {
      group.hidden = !showReasons || group !== activeGroup;
      group.disabled = group.hidden;
      if (group.hidden) group.querySelectorAll('input:checked').forEach(option => { option.checked = false; });
    }
    const reasons = [...activeGroup.querySelectorAll('input:checked')].map(option => option.value);
    reasonRequired.hidden = !showReasons || reasons.length > 0;
    submitLessonEdit.textContent = type === 'order' ? '确认取消课节并锁定时段'
      : type === 'cancel' ? '确认取消' : type === 'location' ? '保存修改'
      : isReplan ? '提交 AI 分析' : type === 'time' ? '保存修改'
      : type === 'course' ? lessonFields.courseTeacher.value === 'same' ? '确认换课程' : '填写排课信息' : '补充排课要求';
    const blockedCourse = type === 'course' && (lessonFields.courseTeacher.value === 'new' || !lessonFields.targetCourse.value);
    submitLessonEdit.disabled = blockedCourse || !showReasons || reasons.length === 0 ||
      (isReplan && !lessonFields.replanRequirement.value.trim());
    return reasons;
  }
  function openLessonEdit(lesson) {
    editingLesson = lesson;
    lessonEditForm.reset();
    lessonChangeStatus.hidden = true;
    initialLessonValues = null;
    changeTimeFields.hidden = false;
    originalLesson.innerHTML = `<strong>${escape(lesson.course)} · ${escape(lesson.teacher)}</strong><span>${escape(lesson.date)} ${escape(lesson.time)} · ${hoursText(durationOf(...lesson.time.split('-')))} · ${escape(lesson.campus || lesson.roomCampus || '线上')}</span>`;
    const [start,end] = lesson.time.split('-');
    lessonFields.date.value = lesson.date;
    lessonFields.startTime.value = start;
    const duration = durationOf(start,end);
    lessonFields.endTime.value = end === '24:00' ? '' : end;
    for (const option of lessonFields.standardPeriod.options) {
      if (option.value) {
        const from = option.value.split('-')[0];
        option.textContent = `${from}-${endAfter(from,duration)}`;
      }
    }
    const standard = standardPeriods.includes(lesson.time);
    lessonFields.standardPeriod.value = standard ? lesson.time : '';
    lessonFields.timeMode.value = standard ? 'standard' : 'custom';
    syncLessonTime();
    listTargetCourses(lessonFields.targetCourse,[lesson]);
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
    if (!byId('hrDetailPage').hidden) button?.focus();
  });
  lessonFields.mode.addEventListener('input', syncLessonLocation);
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
    if (event.target === lessonFields.standardPeriod && event.target.value) {
      const {startTime,endTime} = readLessonEdit();
      lessonFields.startTime.value = startTime;
      lessonFields.endTime.value = endTime === '24:00' ? '' : endTime;
    }
    if (event.target.name !== 'changeReason') {
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

  function saveDirectTimeChanges(changes,reasons) {
    const changing = new Set(changes.map(({lesson}) => lesson.id));
    const remaining = lessons.filter(lesson => !changing.has(lesson.id));
    const revised = [];
    const refunds = [];
    for (const {lesson,date,startTime,endTime} of changes) {
      if (!date || !startTime || !endTime || endTime <= startTime) return '请选择有效的时段，课节须在当天结束。';
      const originalMinutes = durationOf(...lesson.time.split('-'));
      const refund = originalMinutes - durationOf(startTime,endTime);
      if (refund < 0) return `${lesson.date} ${lesson.time} 的调整后时长不能超过原课的 ${hoursText(originalMinutes)}。`;
      const bookings = overlappingBookings({date,startTime,endTime},[...remaining,...otherBookings,...revised]);
      const teacherBusy = bookings.find(booking => booking.teacher === lesson.teacher);
      const studentBusy = bookings.find(booking => booking.id && !booking.cancelled);
      if (teacherBusy || studentBusy) {
        const conflict = teacherBusy || studentBusy;
        return `${date} ${conflict.time} ${teacherBusy ? '授课老师' : '学员'}已有排课，请另选时段。`;
      }
      const campus = lesson.campus || lesson.roomCampus || '';
      const availableRooms = campus ? getAvailableRooms({campus}, bookings) : [];
      if (!lesson.course.endsWith('-线上') && !availableRooms.length)
        return `${date} 所选时段在${campus}没有可用教室。`;
      revised.push({...lesson, date, time:`${startTime}-${endTime}`, campus,
        room:availableRooms.includes(lesson.room)?lesson.room:availableRooms[0]||'', roomCampus:'',changeReasons:reasons});
      refunds.push({order:lesson.orderNo||lesson.classNo,minutes:refund});
    }
    for (const [index,{lesson}] of changes.entries()) Object.assign(lesson,revised[index]);
    let totalRefund = 0;
    for (const {order,minutes} of refunds) {
      if (!minutes) continue;
      refundedMinutesByOrder.set(order,(refundedMinutesByOrder.get(order)||0)+minutes);
      totalRefund += minutes;
    }
    const order = refunds[0]?.order;
    const aggregate = changes.length===1&&order&&totalRefund?`原订单累计返还 ${hoursText(refundedMinutesByOrder.get(order))}。`:'';
    lessonChangeStatus.textContent = `已更新 ${changes.length} 节课。${totalRefund?`已返还 ${hoursText(totalRefund)}。${aggregate}`:''}`;
    lessonChangeStatus.hidden = false;
    return '';
  }

  lessonEditForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!editingLesson) return;
    const values = readLessonEdit();
    const reasons = refreshLessonReasons(values);
    if (submitLessonEdit.disabled) return;
    const type = lessonFields.changeType.value;
    clearLessonConflict();
    if (type === 'cancel' || type === 'order') {
      if (type === 'order') window.studentSlotLocks.lock(student.customerNo, editingLesson);
      editingLesson.cancelled = true;
      editingLesson.changeReasons = reasons;
      editingLesson.slotLocked = type === 'order';
      renderLessons();
      lessonDialog.close();
      return;
    }
    if (type === 'course') {
      const error = changeCourseWithSameTeacher([editingLesson], lessonFields.targetCourse.value, reasons);
      if (error) { showLessonConflict(error); return; }
      renderLessons();
      lessonDialog.close();
      return;
    }
    if (type === 'replan') {
      openChangeAnalysis('duration-replan',[editingLesson],[editingLesson],reasons,
        {requirement:lessonFields.replanRequirement.value.trim()});
      return;
    }
    if (type === 'time') {
      const error = saveDirectTimeChanges([{lesson:editingLesson,...values}],reasons);
      if (error) { showLessonConflict(error); return; }
      renderLessons();
      lessonDialog.close();
      return;
    }
    if (type === 'teacher') {
      openChangeAnalysis(type, [editingLesson], [editingLesson], reasons);
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
  window.addEventListener('storage', () => {
    if (window.location.hash === studentHash) renderLessons();
  });
  renderStudents();
  renderLessons();
  showPage();
})();
