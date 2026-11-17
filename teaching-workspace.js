(() => {
  const byId = id => document.getElementById(id);
  const menu = byId('teachingManageSubmenu');
  const toggle = byId('teachingManageToggle');
  const breadcrumb = byId('teachingBreadcrumb');
  const pages = {
    approval: byId('teachingApprovalPage'),
    scheduleManage: byId('teachingSchedulePage'),
    schedule: byId('teachingSchedulePage'),
    settings: byId('teachingSettingsPage')
  };
  const pageNames = { approval: '排课审批', scheduleManage: '排课管理', schedule: '日程管理', settings: '配置中心' };
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.querySelector('em').textContent = expanded ? '⌄' : '⌃';
    menu.hidden = expanded;
  });
  menu.addEventListener('click', event => {
    const button = event.target.closest('[data-teaching-page]');
    if (!button) return;
    const selected = button.dataset.teachingPage;
    const selectedPage = pages[selected];
    for (const page of new Set(Object.values(pages))) page.hidden = page !== selectedPage;
    for (const item of menu.querySelectorAll('[data-teaching-page]')) {
      const active = item === button;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    }
    breadcrumb.textContent = `管理-${pageNames[selected]}`;
    byId('teachingSchedulePage').setAttribute('aria-label', selected === 'scheduleManage' ? '排课管理' : '日程管理');
    if (selected === 'scheduleManage' || selected === 'schedule') setScheduleMode(selected);
  });

  const picker = byId('teachingTeacherPicker');
  const backdrop = byId('teachingTeacherBackdrop');
  const teacher = byId('teachingTeacher');
  const search = byId('teachingTeacherSearch');
  const results = byId('teachingTeacherResults');
  const teachers = ['李春玲', '王若华', '刘敏'];
  function renderTeachers() {
    const keyword = search.value.trim();
    const matches = teachers.filter(name => name.includes(keyword));
    results.replaceChildren(...matches.map(name => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = name;
      button.addEventListener('click', () => {
        teacher.value = name;
        closePicker();
      });
      return button;
    }));
    if (!matches.length) results.textContent = '暂无匹配教师';
  }
  function openPicker() {
    picker.hidden = false;
    backdrop.hidden = false;
    search.value = teacher.value;
    renderTeachers();
    search.focus();
  }
  function closePicker() {
    picker.hidden = true;
    backdrop.hidden = true;
  }
  byId('teachingChooseTeacher').addEventListener('click', openPicker);
  byId('teachingTeacherClose').addEventListener('click', closePicker);
  backdrop.addEventListener('click', closePicker);
  search.addEventListener('input', renderTeachers);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !picker.hidden) closePicker();
  });

  const form = byId('teachingScheduleFilters');
  const result = byId('teachingScheduleResult');
  const emptyMarkup = '<p>您还未选择教师和日期，</p><p>请在上方选择您需要查询的教师和日期进行查询～</p>';
  const entries = new Set();
  const manageRules = new Set();
  let activeScheduleMode = 'schedule';
  let toastTimer;
  function toast(message) {
    const element = byId('teachingToast');
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 2400);
  }
  function selectedDates() {
    const start = byId('teachingStartDate').value;
    const end = byId('teachingEndDate').value;
    if (!teacher.value.trim() || !start || !end) {
      toast('请选择教师和日期');
      return null;
    }
    if (end < start) {
      toast('结束日期不能早于开始日期');
      return null;
    }
    return { start, end };
  }
  function showEmpty() {
    result.classList.remove('has-data');
    result.innerHTML = emptyMarkup;
  }
  function setScheduleMode(mode) {
    if (activeScheduleMode !== mode) showEmpty();
    activeScheduleMode = mode;
    const isManage = mode === 'scheduleManage';
    byId('teachingPeriods').hidden = isManage;
    byId('teachingManagePeriod').hidden = !isManage;
    byId('teachingPeriodLabel').htmlFor = isManage ? 'teachingManagePeriod' : 'teachingPeriods';
    byId('teachingAddTime').textContent = isManage ? '设置早晚课规则' : '添加可排课时间';
    byId('teachingRemoveTime').hidden = isManage;
  }
  function periodValues() {
    if (activeScheduleMode === 'scheduleManage') {
      const selected = byId('teachingManagePeriod').value;
      return selected ? [selected] : [];
    }
    return byId('teachingPeriods').value.split(';').map(value => value.trim()).filter(Boolean);
  }
  function ruleKey(dates, period) {
    return [teacher.value.trim(), dates.start, dates.end, byId('teachingWeekday').value, period].join('|');
  }
  function showResults() {
    const dates = selectedDates();
    if (!dates) return;
    const values = periodValues();
    if (activeScheduleMode === 'scheduleManage' && !values.length) return toast('请选择早课或晚课');
    const periods = values.length ? values : ['08:20-10:20'];
    const table = document.createElement('table');
    const head = document.createElement('thead');
    head.innerHTML = activeScheduleMode === 'scheduleManage'
      ? '<tr><th>日期</th><th>教师姓名</th><th>星期</th><th>时段</th><th>规则状态</th></tr>'
      : '<tr><th>日期</th><th>教师姓名</th><th>星期</th><th>可排课时段</th><th>操作</th></tr>';
    const body = document.createElement('tbody');
    for (const period of periods) {
      const row = document.createElement('tr');
      const date = document.createElement('td');
      date.textContent = `${dates.start} 至 ${dates.end}`;
      const name = document.createElement('td');
      name.textContent = teacher.value.trim();
      const weekday = document.createElement('td');
      weekday.textContent = byId('teachingWeekday').value || '全部';
      const time = document.createElement('td');
      time.textContent = period;
      const operation = document.createElement('td');
      if (activeScheduleMode === 'scheduleManage') {
        operation.textContent = manageRules.has(ruleKey(dates, period)) ? '已设置' : '未设置';
      } else {
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.value = period;
        box.checked = entries.has(period);
        box.setAttribute('aria-label', `选择${period}`);
        operation.append(box);
      }
      row.append(date, name, weekday, time, operation);
      body.append(row);
    }
    table.append(head, body);
    result.replaceChildren(table);
    result.classList.add('has-data');
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    showResults();
  });
  form.addEventListener('reset', () => {
    if (activeScheduleMode === 'schedule') entries.clear();
    setTimeout(showEmpty, 0);
  });
  byId('teachingAddTime').addEventListener('click', () => {
    const dates = selectedDates();
    if (!dates) return;
    const values = periodValues();
    if (activeScheduleMode === 'scheduleManage') {
      if (!values.length) return toast('请选择早课或晚课');
      manageRules.add(ruleKey(dates, values[0]));
      showResults();
      toast('已设置早晚课规则（原型演示）');
      return;
    }
    if (!values.length) return toast('请输入可排课时段');
    values.forEach(value => entries.add(value));
    showResults();
    toast('已添加可排课时间');
  });
  byId('teachingRemoveTime').addEventListener('click', () => {
    if (!selectedDates()) return;
    const selected = [...result.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);
    if (!selected.length) return toast('请先查询并选择可排课时段');
    selected.forEach(value => entries.delete(value));
    showResults();
    toast('已删除所选可排课时间');
  });

  const approvals = [
    { id: '01', source: '排课单', type: '排课状态', classType: '1V1', subject: 'ALEVEL-化学-CAIE-AS-线下', scheduleType: '此科目新排', applicant: '李春玲', appliedAt: '2026-11-16 10:24', status: '待审批', result: '—', reviewer: '—', reviewedAt: '—' },
    { id: '02', source: '排课单', type: '科目状态', classType: '自组班', subject: 'ALEVEL-物理-AQA-AS-线下', scheduleType: '此科目续排', applicant: '王若华', appliedAt: '2026-11-16 09:12', status: '已审批', result: '通过', reviewer: '陈主任', reviewedAt: '2026-11-16 09:40' },
    { id: '03', source: '顾问咨单', type: '试听', classType: '1V1', subject: 'ALEVEL-英语-CAIE-AS-线上', scheduleType: '此科目新排', applicant: '李春玲', appliedAt: '2026-11-15 16:38', status: '待审批', result: '—', reviewer: '—', reviewedAt: '—' },
    { id: '04', source: '学管咨单', type: '诊断', classType: '1V1', subject: 'ALEVEL-数学-EDX-AS-线下', scheduleType: '此科目新排', applicant: '王小花', appliedAt: '2026-11-15 14:05', status: '已审批', result: '驳回', reviewer: '陈主任', reviewedAt: '2026-11-15 14:30' },
    { id: '05', source: '排课单', type: '单日排课超8小时', classType: '1V1', subject: 'ALEVEL-计算机-AQA-AS-线上', scheduleType: '此科目续排', applicant: '刘敏', appliedAt: '2026-11-14 11:26', status: '待审批', result: '—', reviewer: '—', reviewedAt: '—' },
    { id: '06', source: '排课单', type: '当前跑校区超1次', classType: '自组班', subject: 'ALEVEL-英语-CAIE-AS-线下', scheduleType: '此科目新排', applicant: '周晨', appliedAt: '2026-11-14 09:41', status: '已审批', result: '通过', reviewer: '李春玲', reviewedAt: '2026-11-14 10:15' }
  ];
  const approvalFilters = byId('teachingApprovalFilters');
  const approvalRows = byId('teachingApprovalRows');
  function renderApprovals() {
    const fields = [
      ['source', byId('teachingApprovalSource').value],
      ['type', byId('teachingApprovalType').value],
      ['classType', byId('teachingApprovalClassType').value],
      ['scheduleType', byId('teachingApprovalScheduleType').value],
      ['status', byId('teachingApprovalStatus').value],
      ['result', byId('teachingApprovalResult').value]
    ];
    const applicant = byId('teachingApprovalApplicant').value.trim();
    const subject = byId('teachingApprovalSubject').value.trim();
    const reviewer = byId('teachingApprovalReviewer').value.trim();
    const appliedFrom = byId('teachingApprovalAppliedFrom').value;
    const appliedTo = byId('teachingApprovalAppliedTo').value;
    const reviewedFrom = byId('teachingApprovalReviewedFrom').value;
    const reviewedTo = byId('teachingApprovalReviewedTo').value;
    const inDateRange = (value, from, to) => {
      if (!from && !to) return true;
      if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return false;
      return (!from || value.slice(0, 10) >= from) && (!to || value.slice(0, 10) <= to);
    };
    const visible = approvals.filter(record =>
      fields.every(([key, value]) => !value || record[key] === value) &&
      (!subject || record.subject.includes(subject)) &&
      (!applicant || record.applicant.includes(applicant)) &&
      (!reviewer || record.reviewer.includes(reviewer)) &&
      inDateRange(record.appliedAt, appliedFrom, appliedTo) &&
      inDateRange(record.reviewedAt, reviewedFrom, reviewedTo)
    );
    approvalRows.replaceChildren();
    for (const record of visible) {
      const row = document.createElement('tr');
      for (const key of ['source', 'type', 'classType', 'subject', 'scheduleType', 'applicant', 'appliedAt', 'status', 'result', 'reviewer', 'reviewedAt']) {
        const cell = document.createElement('td');
        cell.textContent = record[key];
        if (key === 'status' || key === 'result') cell.className = `teaching-approval-${record[key] === '通过' ? 'pass' : record[key] === '驳回' ? 'reject' : record[key] === '待审批' ? 'pending' : 'neutral'}`;
        row.append(cell);
      }
      const action = document.createElement('td');
      const view = document.createElement('button');
      view.type = 'button';
      view.className = 'teaching-view-approval';
      view.dataset.approval = record.id;
      view.textContent = '查看';
      action.append(view);
      row.append(action);
      approvalRows.append(row);
    }
    if (!visible.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 12;
      cell.className = 'teaching-approval-empty';
      cell.textContent = '暂无符合条件的审批记录';
      row.append(cell);
      approvalRows.append(row);
    }
    byId('teachingApprovalCount').textContent = `共 ${visible.length} 条`;
  }
  approvalFilters.addEventListener('submit', event => {
    event.preventDefault();
    if ((byId('teachingApprovalAppliedFrom').value && byId('teachingApprovalAppliedTo').value && byId('teachingApprovalAppliedFrom').value > byId('teachingApprovalAppliedTo').value) ||
        (byId('teachingApprovalReviewedFrom').value && byId('teachingApprovalReviewedTo').value && byId('teachingApprovalReviewedFrom').value > byId('teachingApprovalReviewedTo').value)) {
      toast('结束日期不能早于开始日期');
      return;
    }
    renderApprovals();
  });
  approvalFilters.addEventListener('reset', () => setTimeout(renderApprovals, 0));
  renderApprovals();

  const approvalSchedules = {
    '01': { teacher: '张博雅（VA000914）', sessions: [
      ['2026-11-17', '08:20–10:20', '刘大礼-1V1', '舜元校区', '2'],
      ['2026-11-19', '10:30–12:30', '刘大礼-1V1', '舜元校区', '2'],
      ['2026-11-21', '13:30–15:30', '刘大礼-1V1', '舜元校区', '2']
    ] },
    '02': { teacher: '王若华（VA000465）', sessions: [
      ['2026-11-18', '08:20–10:20', '物理自组班-01', '舜元校区', '2'],
      ['2026-11-20', '13:30–15:30', '物理自组班-01', '舜元校区', '2']
    ] },
    '05': { teacher: '刘敏（VA000583）', sessions: [
      ['2026-11-18', '08:20–10:20', '计算机-1V1', '线上教室', '2'],
      ['2026-11-18', '10:30–12:30', '计算机-1V1', '线上教室', '2'],
      ['2026-11-18', '13:30–15:30', '计算机-1V1', '线上教室', '2'],
      ['2026-11-18', '16:00–18:00', '计算机-1V1', '线上教室', '2'],
      ['2026-11-18', '18:30–20:30', '计算机-1V1', '线上教室', '2']
    ] },
    '06': { teacher: '周晨（VA000770）', sessions: [
      ['2026-11-17', '08:20–10:20', '英语自组班-02', '舜元校区', '2'],
      ['2026-11-17', '13:30–15:30', '英语自组班-02', '泰康校区', '2'],
      ['2026-11-19', '10:30–12:30', '英语自组班-02', '舜元校区', '2']
    ] }
  };
  const approvalDialog = byId('teachingApprovalDialog');
  const approvalBackdrop = byId('teachingApprovalBackdrop');
  const approvalFooter = approvalDialog.querySelector('footer');
  const approvalSchedule = byId('teachingApprovalSchedule');
  const approvalPendingDetail = byId('teachingApprovalPendingDetail');
  const approvalOutcome = byId('teachingApprovalOutcome');
  const rejectForm = byId('teachingApprovalRejectForm');
  const rejectReason = byId('teachingApprovalRejectReason');
  const rejectError = byId('teachingApprovalRejectError');
  const rejectButton = byId('teachingApprovalReject');
  const passButton = byId('teachingApprovalPass');
  const cancelRejectButton = byId('teachingApprovalCancelReject');
  let approvalOpener = null;
  let selectedApproval = null;
  function setRejectMode(enabled) {
    rejectForm.hidden = !enabled;
    rejectError.hidden = true;
    rejectButton.textContent = enabled ? '确认驳回' : '驳回';
    cancelRejectButton.hidden = !enabled;
    passButton.hidden = enabled;
    if (!enabled) rejectReason.value = '';
  }
  function renderApprovalDetail() {
    const record = selectedApproval;
    byId('teachingApprovalRecord').textContent = `审批来源：${record.source}　审批类型：${record.type}　排课科目：${record.subject}`;
    const isSchedule = record.source === '排课单';
    approvalSchedule.hidden = !isSchedule;
    approvalPendingDetail.hidden = isSchedule;
    approvalOutcome.hidden = !isSchedule || record.status === '待审批';
    approvalFooter.hidden = !isSchedule || record.status !== '待审批';
    setRejectMode(false);
    if (!isSchedule) {
      approvalPendingDetail.textContent = `${record.source}审批详情待定`;
      return;
    }
    const schedule = approvalSchedules[record.id];
    byId('teachingApprovalTeacher').textContent = `授课教师：${schedule.teacher}`;
    const rows = byId('teachingApprovalScheduleRows');
    rows.replaceChildren();
    for (const [date, time, className, campus, hours] of schedule.sessions) {
      const row = document.createElement('tr');
      for (const value of [date, time, record.subject, className, record.subject.endsWith('线上') ? '线上' : '线下', campus, hours]) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      rows.append(row);
    }
    if (record.status === '已审批') {
      approvalOutcome.textContent = `审批结果：${record.result}　审批人：${record.reviewer}　审批时间：${record.reviewedAt}${record.rejectReason ? `\n驳回原因：${record.rejectReason}` : ''}`;
    }
  }
  function closeApproval() {
    approvalDialog.hidden = true;
    approvalBackdrop.hidden = true;
    approvalRows.querySelector(`[data-approval="${approvalOpener}"]`)?.focus();
  }
  byId('teachingApprovalPage').addEventListener('click', event => {
    const button = event.target.closest('.teaching-view-approval');
    if (!button) return;
    approvalOpener = button.dataset.approval;
    selectedApproval = approvals.find(record => record.id === approvalOpener);
    renderApprovalDetail();
    approvalDialog.hidden = false;
    approvalBackdrop.hidden = false;
    byId('teachingApprovalClose').focus();
  });
  byId('teachingApprovalClose').addEventListener('click', closeApproval);
  approvalBackdrop.addEventListener('click', closeApproval);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !approvalDialog.hidden) closeApproval();
  });
  cancelRejectButton.addEventListener('click', () => setRejectMode(false));
  rejectReason.addEventListener('input', () => { rejectError.hidden = true; });
  rejectButton.addEventListener('click', () => {
    if (rejectForm.hidden) {
      setRejectMode(true);
      rejectReason.focus();
      return;
    }
    const reason = rejectReason.value.trim();
    if (!reason) {
      rejectError.hidden = false;
      rejectReason.focus();
      return;
    }
    selectedApproval.status = '已审批';
    selectedApproval.result = '驳回';
    selectedApproval.rejectReason = reason;
    selectedApproval.reviewer = '李春玲';
    selectedApproval.reviewedAt = new Date().toLocaleString('sv-SE', { hour12: false }).slice(0, 16);
    renderApprovals();
    closeApproval();
    toast('审批结果已更新（原型演示）');
  });
  passButton.addEventListener('click', () => {
    selectedApproval.status = '已审批';
    selectedApproval.result = '通过';
    selectedApproval.reviewer = '李春玲';
    selectedApproval.reviewedAt = new Date().toLocaleString('sv-SE', { hour12: false }).slice(0, 16);
    renderApprovals();
    closeApproval();
    toast('审批结果已更新（原型演示）');
  });
  document.querySelectorAll('.teaching-language button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.teaching-language button').forEach(item => item.classList.toggle('active', item === button));
    });
  });
})();
