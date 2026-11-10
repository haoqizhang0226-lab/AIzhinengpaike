(() => {
  const byId = id => document.getElementById(id);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const display = value => safe(value || '--');
  const educatorMode = new URLSearchParams(location.search).has('embed-consult');
  const currentUserName = '李春玲';
  const storageKey = 'smart-scheduling-v32-consults';
  const defaultCourse = (subject, hours, mode = '线下') => ({
    system:'英联邦学科',item:'ALEVEL',subject,classType:'1v1',
    board:subject === '商务' ? 'OCR' : 'EDX',grade:'AS',module:subject === '商务' ? 'P1' : '',
    mode,campus:mode === '线上' ? '' : '舜元中心',hours,
    historicalTeacher:'李春玲',currentTeacher:'',teacherDiscussed:'是',studentResult:'先修'
  });
  const seeds = [
    {id:'ZD20261106001',customerNo:'VA100078710',customerName:'授课反馈产品验收',advisorName:'李春玲',created:'2026-11-06 10:26:08',initiator:'李春玲',status:'待分配',start:'2026-11-08',end:'2026-12-30',requirement:'两门课程尽量交叉安排，先确认学生和老师共同可用的时间。',linkedOrderIds:[1,8],courses:[defaultCourse('商务',10,'线上'),defaultCourse('会计',10)]},
    {id:'ZD20261105002',customerNo:'VA100086215',customerName:'陈同学',advisorName:'李春玲',created:'2026-11-05 16:12:35',completedAt:'2026-11-05 16:45:00',initiator:'李春玲',status:'已完成',start:'2026-11-09',end:'2026-12-15',requirement:'工作日晚上优先；每周安排两到三节。',linkedOrderIds:[2],courses:[defaultCourse('商务',16)]},
    {id:'ZD20261104003',customerNo:'VA100094332',customerName:'王同学',advisorName:'王若华',initiatorRole:'学管师',created:'2026-11-04 14:38:21',initiator:'王若华',status:'处理中',handlerName:'王若华',start:'2026-11-10',end:'2027-01-31',requirement:'优先沿用当前授课老师，课程分布尽量均匀。',linkedOrderIds:[],courses:[defaultCourse('会计',30)]},
    {id:'ZD20261102004',customerNo:'VA100073946',customerName:'张同学',advisorName:'李春玲',created:'2026-11-02 09:17:43',completedAt:'2026-11-02 10:06:00',initiator:'李春玲',status:'已完成',start:'2026-11-08',end:'2026-12-20',requirement:'周末优先排课，需避开周日晚上。',linkedOrderIds:[],courses:[defaultCourse('商务',20)]},
    {id:'ZD20261030005',customerNo:'',customerName:'赵同学',advisorName:'陈顾问',created:'2026-10-30 11:42:06',initiator:'陈顾问',status:'处理中',start:'2026-11-15',end:'2027-01-15',requirement:'先确认可上课的时段。',linkedOrderIds:[],courses:[defaultCourse('商务',12)]},
    {id:'ZD20261028006',customerNo:'VA100084126',customerName:'',advisorName:'王若华',initiatorRole:'学管师',created:'2026-10-28 17:08:12',initiator:'王若华',status:'已驳回',start:'2026-11-20',end:'2026-12-20',requirement:'周二或周四排课。',linkedOrderIds:[],courses:[defaultCourse('会计',8)]},
    {id:'ZD20261026007',customerNo:'',customerName:'',advisorName:'李春玲',created:'2026-10-26 09:25:31',initiator:'李春玲',status:'处理中',start:'2026-11-18',end:'2026-12-30',requirement:'待补充客户资料；优先周末。',linkedOrderIds:[],courses:[defaultCourse('商务',10)]}
  ];
  const catalogRows = [
    ['计算机','AQA','AS','线上'],['物理','AQA','AS','线下'],['心理','AQA','AS','线下'],
    ['物理','CAIE','AS','线下'],['物理','AQA','AS','线上'],['商务','OCR','AS','线上'],
    ['计算机','OCR','AS','线上'],['经济','AQA','AS','线上'],['计算机','AQA','AS','线下'],
    ['中文','EDX','AS','线下'],['会计','EDX','AS','线下'],['化学','CAIE','AS','线上'],
    ['数学','EDX','IAL-AS','线下'],['英语','CAIE','AS','线上'],['写作','AQA','AS','线下'],
    ['听力','AQA','AS','线上'],['口语','CAIE','AS','线下'],['阅读','CAIE','AS','线上'],
    ['综合','AQA','AS','线下'],['物理','EDX','A2','线上'],['化学','EDX','A2','线下'],
    ['数学','CAIE','A2','线上'],['商务','AQA','A2','线下'],['经济','OCR','A2','线上']
  ];
  const courseHierarchy = {
    高端:{高端牛剑:['高阶笔试'],高端竞赛:['高端竞赛']},
    全日制:{全日制学校:['上海远见']},
    英联邦:{英联邦学科:['ALEVEL','GCSE','IGCSE'],英联邦语言:['托福','雅思']},
    英研:{英研课程:['英国大学课程']},
    橡沐:{橡沐学科:['美高同步']}
  };
  const scheduleWeekdays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  const scheduleSlots = ['08:20-10:20','10:30-12:30','13:30-15:30','16:00-18:00','18:30-20:30'];
  const teacherStyles = ['风趣幽默','可全英文','热情活泼','严格严肃','循序善诱','疑难专家','生动形象','温柔耐心','雷厉风行','其他'];
  const consultEndMode = item => item.endMode || (item.end ? 'SPECIFIED_DATE' : 'FINISH_ALL');
  const divisionForSystem = system => Object.keys(courseHierarchy).find(division =>
    Object.hasOwn(courseHierarchy[division],system)) || '';
  const itemsFor = (division,system) => courseHierarchy[division]?.[system] || [];
  const courseSystems = Object.values(courseHierarchy).flatMap(group => Object.keys(group));
  let saved = [];
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(value)) saved = value;
  } catch {}
  let consults = saved.map(item => {
    const seed = seeds.find(entry => entry.id === item.id);
    const merged = {...seed,...item};
    if(merged.status==='已完结')merged.status='已完成';
    if(merged.status==='已撤回')merged.status='已驳回';
    merged.advisorName = merged.advisorName || merged.initiator || '';
    merged.initiatorRole = merged.initiatorRole === '学管师' ? '学管师' : '销售顾问';
    merged.linkedOrderIds = Array.isArray(merged.linkedOrderIds) ? merged.linkedOrderIds : (seed?.linkedOrderIds || []);
    merged.courses = Array.isArray(merged.courses) && merged.courses.length ? merged.courses : (seed?.courses || [defaultCourse('商务',Number(merged.hours) || 10)]);
    merged.preplanVersions = Array.isArray(merged.preplanVersions) ? merged.preplanVersions : [];
    return merged;
  });
  seeds.forEach(seed => { if (!consults.some(item => item.id === seed.id)) consults.push(seed); });
  const save = () => { try { localStorage.setItem(storageKey,JSON.stringify(consults)); } catch {} };
  let currentId = null;
  let drawerMode = 'view';
  let activePreplanId = null;
  let linkedOrderId = null;
  let pendingConsultId = null;
  window.getPendingConsultId = () => pendingConsultId;
  window.clearPendingConsultId = () => { pendingConsultId = null; };
  let formCourses = [];
  let formAttachments = [];
  let formGroups = [];
  let groupSequence = 0;
  let activeGroupId = null;
  let modalCatalog = [];
  let modalSelected = new Map();
  let modalPage = 1;
  let modalFilters = {subject:'',board:'',grade:'',mode:''};
  let associateConsultId = null;
  let associateOrderId = null;
  let filters = {plan:'',customer:'',from:'',to:'',status:'',role:'',initiator:'',handler:'',handledFrom:'',handledTo:'',linked:''};
  let activeConsultTab = 'all';
  let consultAnalysisDraft = null;
  let consultAnalysisSourceMode = 'create';
  let formCreating = false;
  let customerSearchMode = false;
  const current = () => consults.find(item => item.id === currentId);
  const linkedOrders = item => (item.linkedOrderIds || []).map(id => allOrders.find(order => order.id === Number(id))).filter(Boolean);
  function sendConsultCatalog() {
    if (!educatorMode || window.parent === window) return;
    window.parent.postMessage({kind:'CONSULT_CATALOG',consults:consults.map(item=>({id:item.id,name:planNameFor(item),customer:customerLabel(item),status:item.status,linkedOrderIds:item.linkedOrderIds||[]}))},'*');
  }
  const courseLabel = item => (item.courses || []).map(course => [course.system,course.item,course.subject].filter(Boolean).join('-')).join('、') || item.course || '--';
  const totalHours = item => (item.courses || []).reduce((sum,course) => sum + (Number(course.hours) || 0),0);
  const statusClass = status => status === '已驳回' ? 'withdrawn' : status === '已完成' ? 'finished' : status === '待分配' ? 'pending' : 'processing';
  const staffNumbers = {'李春玲':'VA000811','王若华':'VA000812','陈顾问':'VA000813'};
  const staffLabel = (name,number) => name ? safe(name + '（' + (number || staffNumbers[name] || '--') + '）') : '--';
  const handlerName = item => ['待分配','待确认'].includes(item.status) ? '' : (item.handlerName || currentUserName);
  const handlerLabel = item => handlerName(item) ? staffLabel(handlerName(item),item.handlerNo) : '--';
  const initiatorRole = item => item.initiatorRole === '学管师' ? '学管师' : '销售顾问';
  const initiatorName = item => staffLabel(item.initiatorRole === '学管师' ? (item.managerName || item.initiator) : (item.advisorName || item.initiator),item.initiatorRole === '学管师' ? item.managerNo : item.advisorNo);
  const customerLabel = item => item.customerName && item.customerNo ? item.customerName + '（' + item.customerNo + '）' : item.customerName || (item.customerNo ? '--（' + item.customerNo + '）' : '--');
  const processedAt = item => item.status === '待分配' ? '' : (item.handledAt || item.completedAt || item.created || '');
  function planNameFor(item) {
    const date = (item.created || '').slice(0,10) || '未定日期';
    const studentKey = item.customerNo || item.customerName || item.id;
    const sameDay = consults.filter(other => (other.customerNo || other.customerName || other.id) === studentKey && (other.created || '').slice(0,10) === date)
      .sort((a,b) => (a.created || '').localeCompare(b.created || '') || String(a.id).localeCompare(String(b.id)));
    const number = String(Math.max(0,sameDay.findIndex(other => other.id === item.id)) + 1).padStart(2,'0');
    return (item.customerName || item.customerNo || '未填写客户姓名') + '-' + (initiatorRole(item) === '学管师' ? '续排方案' : '售前咨单方案') + '-' + date + '（' + number + '）';
  }

  function showSection(section) {
    const consult = section === 'consult';
    const classes = section === 'classes';
    if (!byId('orderDrawer').hidden) showList();
    byId('listPanel').hidden = consult || classes;
    byId('smartConsultPanel').hidden = !consult;
    byId('myClassesPanel').hidden = !classes;
    byId('smartConsultNav').classList.toggle('active',consult);
    byId('myClassesNav').classList.toggle('active',classes);
    byId('myScheduleNav').classList.toggle('active',!consult && !classes);
    if (consult) renderConsults();
    if (classes) window.renderSelfClasses?.();
  }
  window.showSalesSection = showSection;

  function renderConsults() {
    const rows = consults.filter(item => {
      const created = (item.created || '').slice(0,10);
      const customer = (item.customerNo + ' ' + item.customerName).toLowerCase();
      const linked = linkedOrders(item).length > 0;
      const initiator = [item.initiator,item.initiatorNo,item.advisorName,item.advisorNo,item.managerName,item.managerNo].filter(Boolean).join(' ').toLowerCase();
      const handler = [handlerName(item),item.handlerNo || staffNumbers[handlerName(item)]].filter(Boolean).join(' ').toLowerCase();
      const handled = processedAt(item).slice(0,10);
      if (!educatorMode && initiatorRole(item) !== '销售顾问') return false;
      if (educatorMode && activeConsultTab === 'pending' && item.status !== '待分配') return false;
      if (educatorMode && activeConsultTab === 'assigned' && item.status === '待分配') return false;
      if (educatorMode && activeConsultTab === 'mine' && (item.status === '待分配' || handlerName(item) !== currentUserName)) return false;
      return (!filters.plan || planNameFor(item).toLowerCase().includes(filters.plan))
        && (!filters.customer || customer.includes(filters.customer))
        && (!filters.from || created >= filters.from)
        && (!filters.to || created <= filters.to)
        && (!filters.status || item.status === filters.status)
        && (!filters.role || initiatorRole(item) === filters.role)
        && (!filters.initiator || initiator.includes(filters.initiator))
        && (!filters.handler || handler.includes(filters.handler))
        && (!filters.handledFrom || handled >= filters.handledFrom)
        && (!filters.handledTo || (handled && handled <= filters.handledTo))
        && (!filters.linked || (filters.linked === 'yes') === linked);
    });
    byId('consultRows').innerHTML = rows.length ? rows.map(item => {
      const linked = linkedOrders(item).length > 0;
      return '<tr>' +
        '<td><span class="smart-consult-plan-name" title="' + safe(planNameFor(item)) + '">' + safe(planNameFor(item)) + '</span></td>' +
        '<td>' + safe(customerLabel(item)) + '</td>' +
        '<td class="sales-only"><span class="smart-consult-course" title="' + safe(courseLabel(item)) + '">' + safe(courseLabel(item)) + '</span></td>' +
        '<td>' + safe(totalHours(item)) + ' 课时</td><td>' + staffLabel(item.initiator,item.initiatorNo) + '</td><td class="educator-only">' + safe(initiatorRole(item)) + '</td><td>' + display(item.created) + '</td>' +
        '<td><span class="smart-consult-status ' + statusClass(item.status) + '">' + safe(item.status) + '</span></td>' +
        '<td>' + handlerLabel(item) + '</td><td>' + display(item.completedAt) + '</td>' +
        '<td>' + (linked ? '<button type="button" class="smart-consult-linked" data-consult-action="orders" data-consult-id="' + safe(item.id) + '">是</button>' : '否') + '</td>' +
        '<td><div class="smart-consult-operations">' +
        '<button type="button" data-consult-action="view" data-consult-id="' + safe(item.id) + '">查看</button>' +
        '<button type="button" data-consult-action="edit" data-consult-id="' + safe(item.id) + '"' + (['已完成','已驳回'].includes(item.status) ? '' : ' disabled') + '>修改</button>' +
        '<button type="button" data-consult-action="withdraw" data-consult-id="' + safe(item.id) + '"' + (item.status === '待分配' ? '' : ' disabled') + '>撤回</button>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="12" class="smart-consult-empty">暂无符合条件的售前咨单</td></tr>';
    byId('consultCount').textContent = '共 ' + rows.length + ' 条';
    if (educatorMode) sendConsultCatalog();
  }

  function courseTable(courses) {
    const headings = ['课程体系','课程项','科目','班型','考试局','年级','模块','学生水平','授课模式','校区','课时','可指定授课老师'];
    const keys = ['system','item','subject','classType','board','grade','module','studentLevel','mode','campus','hours','currentTeacher'];
    return '<div class="smart-consult-course-scroll"><table class="smart-consult-course-table"><thead><tr>' +
      headings.map(label => '<th>' + label + '</th>').join('') +
      '</tr></thead><tbody>' + (courses || []).map(course => '<tr>' + keys.map(key => '<td>' + display(course[key]) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>';
  }
  function groupedCourseTables(courses) {
    const groups = new Map();
    (courses || []).forEach(course => {
      const system = course.system || '未设置课程体系';
      const item = course.item || '未设置课程项';
      const key = system + '\u0000' + item;
      if (!groups.has(key)) groups.set(key,{system,item,courses:[]});
      groups.get(key).courses.push(course);
    });
    return [...groups.values()].map(group => '<section class="detail-package-block smart-consult-grouped-table">' +
      '<div class="detail-package-heading"><span class="detail-package-label">' + safe(group.system + ' / ' + group.item) + '</span></div>' +
      courseTable(group.courses) + '</section>').join('') || '<p class="smart-consult-empty">暂无课程</p>';
  }

  function detailMarkup(item,{showPreplan=true,currentStatus=item.status,currentCompletedAt=item.completedAt,planChoices=[]}={}) {
    const formalOrders = linkedOrders(item);
    return '<div class="smart-consult-view-layout' + (showPreplan ? '' : ' compact') + '"><div class="smart-consult-view-sidebar"><section class="smart-consult-detail smart-consult-customer-sidebar"><h3>基础信息</h3><div class="smart-consult-detail-grid">' +
      '<div><small>客户姓名</small><strong>' + display(item.customerName ? item.customerName + (item.customerNo ? '（' + item.customerNo + '）' : '') : item.customerNo) + '</strong></div>' +
      (educatorMode ? '<div><small>发起人角色</small><strong>' + safe(initiatorRole(item)) + '</strong></div>' : '') +
      '<div><small>' + (educatorMode ? (initiatorRole(item) === '学管师' ? '学管姓名' : '顾问姓名') : '发起人') + '</small><strong>' + initiatorName(item) + '</strong></div>' +
      '<div><small>发起时间</small><strong>' + display(item.created) + '</strong></div>' +
      '<div><small>当前状态</small><strong><span class="smart-consult-status ' + statusClass(currentStatus) + '">' + safe(currentStatus) + '</span></strong></div>' +
      '<div><small>处理人</small><strong>' + handlerLabel({...item,status:currentStatus}) + '</strong></div>' +
      '<div><small>完成时间</small><strong>' + display(currentCompletedAt) + '</strong></div>' +
      '</div></section>' +
      (showPreplan ? '<section class="smart-consult-detail smart-consult-plan-card"><div class="smart-consult-plan-block"><span class="smart-consult-plan-label">当前方案</span>' +
      (planChoices.length ? '<select id="consultPlanSwitch" aria-label="切换预排方案">' + planChoices.map(choice => '<option value="' + safe(choice.id) + '"' + (choice.id === activePreplanId ? ' selected' : '') + '>' + safe(choice.label) + '</option>').join('') + '</select>' : '<strong>--</strong>') +
      '</div><div class="smart-consult-plan-block"><span class="smart-consult-plan-label">正式排课单</span><div class="smart-consult-formal-orders">' + (formalOrders.length ? formalOrders.map(order => '<button type="button" data-consult-order-detail="' + safe(order.id) + '">' + safe(order.course || '排课单 ' + order.id) + '</button>').join('') : '--') + '</div></div></section>' : '') +
      '</div><div class="smart-consult-view-main">' +
      (showPreplan ? '<section class="smart-consult-detail smart-consult-detail-preplan">'+consultPreplanMarkup(item)+'</section>' : '') +
      '<section class="smart-consult-detail"><h3>课程信息</h3>' + groupedCourseTables(item.courses) +
      '</section>' +
      '<section class="smart-consult-detail"><h3>匹配要求</h3><div class="smart-consult-detail-grid">' +
      '<div><small>开课日期</small><strong>' + display(item.start) + '</strong></div>' +
      '<div><small>结课日期</small><strong>' + (consultEndMode(item) === 'SPECIFIED_DATE' ? display(item.end) : '排完全部课程结束') + '</strong></div>' +
      '<div class="full"><small>匹配要求</small><strong>' + display(item.requirement) + '</strong></div>' +
      '<div class="full"><small>附件</small><strong>' + (item.attachments?.length ? item.attachments.map(file => '<span class="smart-consult-attachment-name">' + safe(typeof file==='string' ? file : file.name) + '</span>').join('') : '--') + '</strong></div>' +
      '<div><small>老师风格</small><strong>' + display((item.teacherStyles || []).join('、')) + '</strong></div>' +
      '<div><small>老师性别</small><strong>' + display(item.teacherGender) + '</strong></div>' +
      '</div></section></div></div>';
  }

  function formalOrderMarkup(order) {
    const orderFields = detailFields(order);
    const headings = ['课程项','班型','科目','考试局','年级','模块','授课模式','校区','课时','历史授课老师','当前授课老师','老师时间是否已沟通','学生成绩'];
    const firstCourse = courseInfo(order)[0] || [];
    const legacySystem = (order.course || '').split('-').find(part => /学科|课程|语言/.test(part)) || '课程包';
    const legacyPackage = [legacySystem,firstCourse[0],firstCourse[1]].filter(Boolean).join('-');
    const legacyTable = '<section class="detail-package-block smart-consult-grouped-table"><div class="detail-package-heading"><span class="detail-package-label">' + safe(legacyPackage) + '</span></div><div class="smart-consult-course-scroll"><table class="smart-consult-course-table"><thead><tr>' +
      headings.map(label => '<th>' + label + '</th>').join('') + '</tr></thead><tbody>' +
      courseInfo(order).map(row => '<tr>' + row.map(value => '<td>' + display(value) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div></section>';
    const packageTables = order.submission?.packages?.length
      ? order.submission.packages.map(packageCourseTable).join('') : legacyTable;
    return '<section class="smart-consult-detail smart-consult-linked-packages"><h3>课程信息</h3>' + packageTables +
      '</section><section class="smart-consult-detail"><h3>排课单信息</h3><div class="smart-consult-detail-grid">' +
      orderFields.map(([label,value]) => '<div><small>' + safe(label) + '</small><strong>' + display(value) + '</strong></div>').join('') +
      '</div></section>';
  }

  function linkedMarkup(item) {
    const orders = linkedOrders(item);
    if (!orders.length) return '<section class="smart-consult-detail">暂无关联排课单</section>';
    if (!orders.some(order => order.id === linkedOrderId)) linkedOrderId = orders[0].id;
    const selected = orders.find(order => order.id === linkedOrderId);
    return '<div class="smart-consult-linked-layout"><aside class="smart-consult-linked-student smart-consult-detail"><h3>学生信息</h3><div class="smart-consult-linked-student-fields">' +
      studentInfo(selected).map(([label,value]) => '<div><small>' + safe(label) + '</small><strong>' + display(value) + '</strong></div>').join('') +
      '</div></aside><div class="smart-consult-linked-main"><section class="smart-consult-detail"><h3>关联排课单</h3><div class="smart-consult-order-list">' +
      orders.map(order => '<button type="button" class="smart-consult-order-option ' + (order.id === linkedOrderId ? 'selected' : '') +
        '" data-linked-order="' + order.id + '">' + safe(order.course) + '</button>').join('') +
      '</div></section>' + formalOrderMarkup(selected) + '</div></div>';
  }

  const options = (values,selected) => {
    const choices = selected && !values.includes(selected) ? [...values,selected] : values;
    return choices.map(value => '<option value="' + safe(value) + '"' + (value === selected ? ' selected' : '') + '>' + safe(value || '请选择') + '</option>').join('');
  };
  const choice = (key,values,value) => '<select data-course-field="' + key + '">' + options(values,value) + '</select>';
  function selectedCourseRow(course,index) {
    return '<tr data-course-index="' + index + '"><td>' + display(course.subject) + '</td><td>' + display(course.board) +
      '</td><td>' + display(course.grade) + '</td><td>' + display(course.module) + '</td>' +
      '<td>' + choice('studentLevel',['先修/同步-B及以上','先修/同步-B及以下','备考-B及以上','不限'],course.studentLevel || '先修/同步-B及以上') + '</td>' +
      '<td>' + display(course.mode) + '</td>' +
      '<td>' + choice('campus',['','舜元中心','雅仕校区','鸿寿校区','浦东校区','苏悦校区','望京校区','海淀校区','南山校区'],course.campus || '') + '</td>' +
      '<td><span class="smart-consult-hour-step"><button type="button" data-hour-adjust="-0.25" aria-label="减少课时">−</button>' +
      '<input data-course-field="hours" type="number" min="0" step="0.25" value="' + safe(Number(course.hours || 0).toFixed(2)) + '" aria-label="' + safe(course.subject) + '课时">' +
      '<button type="button" data-hour-adjust="0.25" aria-label="增加课时">+</button></span></td>' +
      '<td><input data-course-field="currentTeacher" type="text" maxlength="40" value="' + safe(course.currentTeacher || '') + '" placeholder="可选填老师姓名或工号" aria-label="可指定授课老师，非必填"></td>' +
      '<td><button type="button" data-remove-course="' + index + '">移除</button></td></tr>';
  }
  function formCourseTable(group) {
    const courses = formCourses.map((course,index) => ({course,index})).filter(entry => entry.course.groupId === group.id);
    return '<div class="smart-consult-form-table-scroll"><table class="smart-consult-form-table create-columns"><thead><tr>' +
      ['科目','考试局','年级','模块','学生水平','授课模式','校区','课时','可指定授课老师','操作'].map(label => '<th>' + label + '</th>').join('') +
      '</tr></thead><tbody class="consult-course-editors">' +
      (courses.length ? courses.map(entry => selectedCourseRow(entry.course,entry.index)).join('') : '<tr><td colspan="10" class="smart-consult-form-empty">请先选择课程体系和课程项，再添加科目</td></tr>') +
      '</tbody></table></div>';
  }
  function formGroupMarkup(group) {
    return '<div class="smart-consult-course-group" data-group-id="' + safe(group.id) + '"><div class="smart-consult-course-top">' +
      '<label>课程体系<select data-group-system required>' + options(['',...courseSystems],group.system) + '</select></label>' +
      '<label>课程项<select data-group-item required' + (group.system ? '' : ' disabled') + '>' + options(['',...itemsFor(group.division,group.system)],group.item) + '</select></label>' +
      '<button type="button" data-add-course-group="' + safe(group.id) + '">＋ 添加科目</button>' +
      (formGroups.length > 1 ? '<button type="button" class="smart-consult-remove-group" data-remove-group="' + safe(group.id) + '">移除组合</button>' : '') +
      '</div>' + formCourseTable(group) + '</div>';
  }
  function renderFormCourses() {
    const groups = byId('consultCourseGroups');
    if (groups) groups.innerHTML = formGroups.map(formGroupMarkup).join('');
    updateTotal();
  }

  function customerCatalog() {
    const records = new Map();
    consults.forEach(item => { if (item.customerName && item.customerNo) records.set(item.customerName + item.customerNo,{name:item.customerName,no:item.customerNo}); });
    allOrders.slice(0,20).forEach(order => {
      const data = studentInfo(order),name = data.find(row => row[0] === '姓名')?.[1],no = data.find(row => row[0] === '学生编号')?.[1];
      if (name && name !== '--' && no && no !== '--') records.set(name + no,{name,no});
    });
    return [...records.values()];
  }

  function formAttachmentsMarkup() {
    return formAttachments.map((file,index) => '<span class="smart-consult-attachment-chip">' + safe(file.name) + '<button type="button" data-remove-attachment="' + index + '" aria-label="移除附件 ' + safe(file.name) + '">×</button></span>').join('');
  }
  function addFormAttachments(files) {
    const valid = [...files].filter(file => {
      const image = /\.(jpe?g|png|bmp)$/i.test(file.name) && (!file.type || /^image\/(jpeg|png|bmp|x-ms-bmp)$/.test(file.type));
      if (!image) { toast('仅支持 JPG、PNG、BMP 图片'); return false; }
      if (file.size > 20 * 1024 * 1024) { toast('单个文件不能超过 20MB'); return false; }
      return true;
    });
    if (formAttachments.length + valid.length > 20) { toast('最多上传 20 个文件'); return; }
    formAttachments.push(...valid.map(file => ({name:file.name,size:file.size,type:file.type})));
    const list = byId('consultAttachmentList');
    if (list) list.innerHTML = formAttachmentsMarkup();
  }

  function formMarkup(item,creating) {
    formCreating = creating;
    const data = item || {customerName:'',customerNo:'',advisorName:'李春玲',start:'',end:'',requirement:'',courses:[]};
    customerSearchMode = !creating && !!data.customerNo;
    const endMode = consultEndMode(data);
    formAttachments = (data.attachments || []).map(file => typeof file === 'string' ? {name:file} : {...file});
    formCourses = (data.courses || []).map(course => ({...course}));
    formGroups = [];
    const groupByCombo = new Map();
    formCourses.forEach(course => {
      const key = course.groupId ? 'group:' + course.groupId : [course.division || '',course.system || '',course.item || ''].join('|');
      if (!groupByCombo.has(key)) {
        const group = {id:'cg' + (++groupSequence),division:course.division || divisionForSystem(course.system),system:course.system || '',item:course.item || ''};
        formGroups.push(group);
        groupByCombo.set(key,group);
      }
      course.groupId = groupByCombo.get(key).id;
    });
    if (!formGroups.length) formGroups.push({id:'cg' + (++groupSequence),division:'',system:'',item:''});
    return '<form id="consultForm" class="smart-consult-form' + (creating ? ' smart-consult-create-form' : '') + '">' +
      '<section class="smart-consult-edit"><h3>客户信息</h3><div class="smart-consult-edit-grid smart-consult-customer-grid">' +
      '<div class="smart-consult-customer-entry"><label class="smart-consult-customer-field">客户姓名<input id="consultCustomerName" name="customerName" value="' + safe(customerSearchMode ? data.customerName + '（' + data.customerNo + '）' : data.customerName) +
      '" autocomplete="off"' + (creating ? ' required' : '') + ' maxlength="80"' + (creating ? '' : ' readonly aria-readonly="true"') + ' placeholder="' + (customerSearchMode ? '输入姓名或客户编号搜索已入库客户' : '请填写未入库客户姓名') + '"><div id="consultCustomerSuggestions" class="smart-consult-suggestions" role="listbox" hidden></div></label>' +
      (creating ? '<button type="button" id="consultCustomerSearchToggle" class="smart-consult-customer-toggle">' + (customerSearchMode ? '填写未入库客户' : '搜索已入库客户') + '</button>' : '') + '</div>' +
      '<input id="consultCustomerNo" name="customerNo" type="hidden" value="' + safe(data.customerNo) + '">' +
      '<input id="consultCustomerPureName" name="customerPureName" type="hidden" value="' + safe(data.customerName) + '">' +
      '</div></section>' +
      '<section class="smart-consult-edit"><h3>课程信息</h3><div id="consultCourseGroups">' + formGroups.map(formGroupMarkup).join('') +
      '</div><button type="button" id="consultAddGroup" class="smart-consult-add-group">＋ 添加课程组合</button></section>' +
      '<section class="smart-consult-edit"><h3>匹配要求</h3><div class="smart-consult-schedule-row">' +
      '<label>开课日期<input name="start" type="date" value="' + safe(data.start) + '" required></label>' +
      '<div class="smart-consult-end-field"><span>结课日期</span><div class="smart-consult-end-switch" role="group" aria-label="结课日期">' +
      '<button type="button" data-consult-end-mode="FINISH_ALL" class="' + (endMode === 'FINISH_ALL' ? 'active' : '') + '" aria-pressed="' + (endMode === 'FINISH_ALL') + '">排完全部课程结束</button>' +
      '<button type="button" data-consult-end-mode="SPECIFIED_DATE" class="' + (endMode === 'SPECIFIED_DATE' ? 'active' : '') + '" aria-pressed="' + (endMode === 'SPECIFIED_DATE') + '">指定结课日期</button></div><input name="endMode" type="hidden" value="' + endMode + '"></div>' +
      '<label class="smart-consult-end-date"' + (endMode === 'FINISH_ALL' ? ' hidden' : '') + '><input name="end" type="date" aria-label="指定结课日期" value="' + safe(data.end) + '" min="' + safe(data.start) + '"' + (endMode === 'SPECIFIED_DATE' ? ' required' : '') + '></label>' +
      '</div><input name="scheduleType" type="hidden" value="' + safe(data.scheduleType || '此科目新排') + '"><input name="timeRequirement" type="hidden" value="vague">' +
      '<div class="smart-consult-edit-grid smart-consult-requirement-fields"><label class="full">匹配要求<textarea name="requirement" maxlength="1000" placeholder="请输入课程、老师及时段等匹配要求">' + safe(data.requirement) + '</textarea></label></div>' +
      '<div class="smart-consult-attachments"><label class="create-voucher-drop" id="consultAttachmentDrop" for="consultAttachmentInput"><span class="create-voucher-icon">☁</span><span>将文件拖拽到此处，或 <em>点击上传</em></span><small>支持 JPG、PNG、BMP，最多 20 个文件，单个文件不超过 20MB</small></label><input id="consultAttachmentInput" type="file" accept=".jpg,.jpeg,.png,.bmp,image/jpeg,image/png,image/bmp" multiple hidden><div id="consultAttachmentList" class="create-voucher-list">' + formAttachmentsMarkup() + '</div></div>' +
      '<div class="smart-consult-choice-field"><span>老师风格</span><div>' + teacherStyles.map(style => '<label><input type="checkbox" name="teacherStyles" value="' + style + '"' + ((data.teacherStyles || []).includes(style) ? ' checked' : '') + '>' + style + '</label>').join('') + '</div></div>' +
      '<div class="smart-consult-choice-field"><span>老师性别</span><div>' + ['男老师','女老师','都可以'].map(gender => '<label><input type="radio" name="teacherGender" value="' + gender + '"' + (data.teacherGender === gender ? ' checked' : '') + '>' + gender + '</label>').join('') + '</div></div>' +
      '</section></form>';
  }
  function syncConsultEndMode(form) {
    const specified = form.elements.endMode.value === 'SPECIFIED_DATE';
    const dateField = form.querySelector('.smart-consult-end-date');
    dateField.hidden = !specified;
    form.elements.end.required = specified;
    form.elements.end.min = form.elements.start.value;
    if (!specified) form.elements.end.value = '';
    form.querySelectorAll('[data-consult-end-mode]').forEach(button => {
      const active = button.dataset.consultEndMode === form.elements.endMode.value;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }
  function consultIssue(data,reply='') {
    const content = String(data.requirement||'').trim();
    if (reply.trim().length>=6 && /(周|月|日|时|节|课|老师|教师|日期|时间|按照|确认)/.test(reply) && !/仍有冲突|继续报错|待定|不确定|不知道/.test(reply)) return '';
    if (/仍有冲突|继续报错|待定|不确定|不知道/.test(content+' '+reply)) return '1. 排课要求中仍有待定或冲突的内容，请明确可上课的日期、时段及课程安排。';
    if (/老师时间(排课|安排|上课)?(即可|就行)?/.test(content)) return '';
    if (data.timeRequirement==='precise' && (data.preciseTime?.slots?.length||data.preciseTime?.custom?.length)) return '';
    if (content.length < 8)
      return '1. 排课要求尚未明确学生可上课的日期或时段。请补充学生的可排时间与需要避开的时间。';
    if (/冲突|展示报错|报错/.test(content)) return '1. 排课要求中存在前后冲突的时段，请明确最终采用的课程与上课时间。';
    return '';
  }

  function runConsultAnalysis(reply='') {
    const draft=consultAnalysisDraft;
    if (!draft) return;
    drawerMode='analyzing';
    byId('consultDrawer').classList.remove('teacher-mode','preplan-mode','orders-mode');
    byId('consultDrawerTitle').textContent='AI分析排课要求';
    byId('consultDrawerBody').innerHTML='<div class="smart-consult-analysis-loading" role="status"><span class="smart-consult-analysis-symbol">✦</span><strong>AI正在分析排课要求</strong><div class="smart-consult-analysis-track"></div></div>';
    byId('consultDrawerFoot').innerHTML='';
    const token=Symbol('analysis');
    runConsultAnalysis.token=token;
    setTimeout(()=>{
      if (runConsultAnalysis.token!==token || byId('consultDrawer').hidden) return;
      const issue=consultIssue(draft,reply);
      if (issue) {
        drawerMode='issue';
        byId('consultDrawerTitle').innerHTML='<span>新增咨单</span><span class="smart-consult-status pending">客户需求待确认</span>';
        byId('consultDrawerBody').innerHTML='<div class="smart-consult-issue-layout"><div>' + detailMarkup({...draft,customerNo:draft.customerNo||'',created:current()?.created||'待提交',status:'待确认'},{showPreplan:false}) + '</div><section class="smart-consult-detail"><h3>AI分析结果</h3><div class="smart-consult-issue-text">' + safe(issue) + '</div><label class="smart-consult-issue-reply">补充排课要求<textarea id="consultIssueReply" placeholder="请一次性补充以上待确认内容"></textarea></label></section></div>';
        byId('consultDrawerFoot').innerHTML='<button type="button" data-consult-footer="close">取消</button><button type="button" class="primary" data-consult-footer="submit-reply">提交咨单</button>';
        byId('consultIssueReply').focus();
        return;
      }
      if (reply.trim()) draft.requirement=[draft.requirement,`补充要求：${reply.trim()}`].filter(Boolean).join('\n');
      let item;
      if (consultAnalysisSourceMode==='create') {
        item={id:'ZD'+Date.now(),...draft,created:currentTimestamp(),handledAt:currentTimestamp(),initiator:'李春玲',initiatorRole:'销售顾问',status:'处理中',linkedOrderIds:[]};
        consults.unshift(item);
      } else {
        item=current();
        if (!item) return;
        preserveCurrentPreplan(item);
        Object.assign(item,draft);
        item.status='处理中';
        item.handledAt=currentTimestamp();
        delete item.preview;
        item.completedAt='';
      }
      save();renderConsults();
      consultAnalysisDraft=null;
      toast('AI分析通过，正在选择授课老师');
      openConsultTeachers(item);
    },1500);
  }

  function openConsultTeachers(item) {
    currentId=item.id;
    drawerMode='teachers';
    byId('consultDrawer').classList.remove('preplan-mode','create-mode');
    byId('consultDrawer').classList.add('teacher-mode');
    byId('consultDrawerTitle').textContent='选择排课老师';
    const payload={id:item.id,consultId:item.id,consultPreview:true,course:courseLabel(item),submission:{
      student:item.customerName||'咨询客户',start:item.start,endMode:consultEndMode(item),end:item.end||'',
      requirement:item.requirement||'',courses:item.courses.map(course=>({name:course.subject,item:course.item,system:course.system,board:course.board,grade:course.grade,module:course.module,hours:course.hours,mode:course.mode||'线下',campus:course.campus||'雅仕校区',
        currentTeacher:course.currentTeacher||'',historicalTeacher:course.historicalTeacher||''}))}};
    const frame=document.createElement('iframe');
    frame.className='smart-consult-teacher-frame';
    frame.id='consultTeacherFrame';
    frame.title='售前咨单选择老师';
    frame.src='../教务端/index.html#flow-order='+encodeURIComponent(JSON.stringify(payload));
    byId('consultDrawerBody').replaceChildren(frame);
    byId('consultDrawerFoot').innerHTML='';
    byId('consultBackdrop').hidden=false;
    byId('consultDrawer').hidden=false;
    document.body.style.overflow='hidden';
  }

  const dateUTC=value=>new Date(value+'T00:00:00Z');
  const isoDate=date=>date.toISOString().slice(0,10);
  const addDays=(date,days)=>new Date(date.getTime()+days*86400000);
  const slotHours=slot=>{
    const [from,to]=String(slot||'').split('-');
    const minutes=value=>{const [hour,minute]=String(value||'').split(':').map(Number);return hour*60+minute;};
    const length=minutes(to)-minutes(from);
    return Number.isFinite(length)&&length>0?length/60:2;
  };
  function buildConsultPreview(item,teachers) {
    const start=dateUTC(item.start||isoDate(new Date()));
    const firstMonday=addDays(start,-((start.getUTCDay()+6)%7));
    const remaining=item.courses.map(course=>Number(course.hours)||2);
    const requestedSlots=item.timeRequirement==='precise'?[...(item.preciseTime?.slots||[]),...(item.preciseTime?.custom||[]).map(([from,to])=>from+'-'+to)]:scheduleSlots;
    const allowedSlots=requestedSlots.length?requestedSlots:scheduleSlots;
    const maxWeeks=Math.min(52,Math.max(4,Math.ceil(Math.max(...remaining,1)/Math.min(...allowedSlots.map(slotHours)))+3));
    const occupied=new Set(),lessons=[];
    for(let week=0;week<maxWeeks&&remaining.some(count=>count>0);week++) {
      item.courses.forEach((course,index)=>{
        const allowedDays=item.timeRequirement==='precise'&&item.preciseTime?.weekdays?.length?item.preciseTime.weekdays:[1,3,5,2,4,6,0];
        let placed=0;
        for(let step=0;step<allowedDays.length&&placed<2&&remaining[index]>0;step++) {
          const day=allowedDays[(step+index)%allowedDays.length];
          const date=isoDate(addDays(firstMonday,week*7+(day+6)%7));
          if(date<item.start||(consultEndMode(item)==='SPECIFIED_DATE'&&item.end&&date>item.end)) continue;
          if(lessons.some(row=>row.courseIndex===index&&row.date===date)) continue;
          for(let offset=0;offset<allowedSlots.length;offset++) {
            const slot=allowedSlots[(index+step+offset)%allowedSlots.length];
            const key=date+'|'+slot;
            if(occupied.has(key)) continue;
            occupied.add(key);
            const durationHours=Math.min(remaining[index],slotHours(slot));
            lessons.push({date,slot,durationHours,courseIndex:index,teacher:teachers[index]||'待选老师'});
            remaining[index]-=durationHours;placed++;
            break;
          }
        }
      });
    }
    return {teachers,lessons};
  }

  function ensureCurrentPreview(item) {
    if (item.status === '已完成' && !item.preview)
      item.preview = buildConsultPreview(item,item.courses.map(course => course.currentTeacher || course.historicalTeacher || '待选老师'));
  }
  function preserveCurrentPreplan(item) {
    if (item.status !== '已完成') return;
    ensureCurrentPreview(item);
    if (!item.preview) return;
    item.preplanVersions ||= [];
    const fields = ['courses','start','end','endMode','requirement','attachments','teacherStyles','teacherGender','preview','completedAt'];
    const version = {id:'plan-' + Date.now() + '-' + item.preplanVersions.length};
    fields.forEach(field => { version[field] = JSON.parse(JSON.stringify(item[field] ?? null)); });
    item.preplanVersions.push(version);
  }
  function preplanChoices(item) {
    ensureCurrentPreview(item);
    const history = (item.preplanVersions || []).map((version,index) => ({id:version.id || 'plan-' + index,label:'方案' + (index + 1),version}));
    if (item.preview) history.push({id:'current',label:'方案' + (history.length + 1),version:null});
    return history;
  }
  function renderSelectedPreplan(item) {
    const choices = preplanChoices(item);
    if (!choices.some(choice => choice.id === activePreplanId)) activePreplanId = choices.at(-1)?.id || null;
    const selected = choices.find(choice => choice.id === activePreplanId);
    const shown = selected?.version ? {...item,...selected.version,status:'已完成'} : item;
    byId('consultDrawerBody').innerHTML = detailMarkup(shown,{currentStatus:item.status,currentCompletedAt:item.completedAt,planChoices:choices});
  }

  function consultPreplanMarkup(item) {
    const completed=item.status==='已完成';
    ensureCurrentPreview(item);
    const lessons=completed?[...(item.preview?.lessons||[])].sort((a,b)=>(a.date+' '+a.slot).localeCompare(b.date+' '+b.slot)):[];
    const usedHours=new Map();
    const rows=lessons.map(lesson=>{
      const index=Number(lesson.courseIndex);
      const course=item.courses[index]||{};
      const total=Number(course.hours)||2;
      const duration=Number(lesson.durationHours)||Math.min(slotHours(lesson.slot),Math.max(0.25,total-(usedHours.get(index)||0)));
      usedHours.set(index,(usedHours.get(index)||0)+duration);
      const start=(lesson.slot||'08:20-10:20').split('-')[0];
      const startMinutes=Number(start.slice(0,2))*60+Number(start.slice(3,5));
      const endMinutes=startMinutes+Math.round(duration*60);
      const end=String(Math.floor(endMinutes/60)).padStart(2,'0')+':'+String(endMinutes%60).padStart(2,'0');
      const courseName=course.name||[course.system,course.item,course.subject,course.board,course.grade].filter(Boolean).join('-');
      return '<tr><td>'+safe(lesson.date+' '+start+'—'+end)+'</td><td>'+display(courseName)+'</td><td>'+display(String(lesson.teacher||'').replace(/\([^)]*\)/,''))+'</td><td>'+display(course.mode)+'</td><td>'+safe(duration)+' 课时</td></tr>';
    }).join('');
    const endDate=consultEndMode(item)==='SPECIFIED_DATE'&&item.end?item.end:(lessons.at(-1)?.date||'--');
    return '<div class="smart-consult-preplan"><div class="smart-consult-preplan-heading"><h4>预排课表</h4><div class="smart-consult-preplan-actions"><button type="button" data-consult-export'+(lessons.length?'':' disabled')+'>导出预排课表</button></div></div>'+
      (completed?'<div class="smart-consult-preplan-dates"><span>开课日期：<strong>'+display(item.start)+'</strong></span><span>结课日期：<strong>'+display(endDate)+'</strong></span></div>':'')+
      '<div class="smart-consult-preplan-table-wrap"><table class="smart-consult-preplan-table"><thead><tr><th>上课时间</th><th>课程</th><th>授课老师</th><th>授课模式</th><th>课节时长</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5" class="smart-consult-preplan-empty">暂无预排课程</td></tr>')+'</tbody></table></div></div>';
  }

  function exportConsultPreplan() {
    const table=byId('consultDrawerBody').querySelector('.smart-consult-preplan-table');
    if(!table)return;
    const rows=[...table.querySelectorAll('tr')].filter(row=>!row.querySelector('[colspan]')).map(row=>[...row.cells].map(cell=>cell.textContent.trim()));
    const quote=value=>{
      const text=String(value).replace(/^[=+\-@]/,"'$&");
      return '"'+text.replace(/"/g,'""')+'"';
    };
    const csv='\ufeff'+rows.map(row=>row.map(quote).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');
    link.href=url;
    link.download='售前咨单_预排课表_'+(currentId||'')+'.csv';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function openConsultPreplan(item) {
    if(!item?.preview && !item?.preplanVersions?.length) return;
    openDrawer(item.id,'view');
  }

  function openDrawer(id,mode) {
    currentId = id;
    drawerMode = mode;
    activePreplanId = null;
    byId('consultDrawer').classList.remove('teacher-mode','preplan-mode');
    linkedOrderId = null;
    const item = current();
    if (mode !== 'create' && !item) return;
    const titles = {view:'查看售前咨单',edit:'修改售前咨单',create:'新增售前咨单',orders:'关联排课单'};
    byId('consultDrawer').classList.toggle('create-mode',mode==='create');
    byId('consultDrawer').classList.toggle('detail-mode',mode==='view');
    byId('consultDrawer').classList.toggle('orders-mode',mode==='orders');
    byId('consultDrawerTitle').innerHTML = mode==='create' ? '<span class="smart-consult-create-spark">✦</span><span>新增售前咨单</span><span class="smart-consult-create-ai">AI 智能辅助</span>' :
      mode==='view' ? '<span>查看售前咨单</span>' : safe(titles[mode]);
    byId('consultDrawerBody').innerHTML = mode === 'create' || mode === 'edit' ? formMarkup(item,mode === 'create') :
      mode === 'orders' ? linkedMarkup(item) : '';
    if (mode === 'view') renderSelectedPreplan(item);
    byId('consultDrawerFoot').innerHTML = mode === 'create' || mode === 'edit' ?
      '<button type="button" data-consult-footer="close">取消</button><button type="submit" form="consultForm" class="primary">' + (mode === 'create' ? '提交咨单' : '保存') + '</button>' :
      '<button type="button" data-consult-footer="close">关闭</button>' +
      (mode === 'view' && item.status === '已完成' ? '<button type="button" data-consult-footer="' + (educatorMode ? 'associate' : 'formal') + '" class="primary">' + (educatorMode ? '关联正式排课' : '发起正式排课') + '</button>' : '');
    byId('consultBackdrop').hidden = false;
    byId('consultDrawer').hidden = false;
    document.body.style.overflow = 'hidden';
    byId('consultClose').focus();
  }

  function closeDrawer() {
    runConsultAnalysis.token=null;
    consultAnalysisDraft=null;
    byId('consultDrawer').classList.remove('teacher-mode','preplan-mode','create-mode','detail-mode','orders-mode');
    closeCourseModal();
    byId('consultBackdrop').hidden = true;
    byId('consultDrawer').hidden = true;
    currentId = null;
    activePreplanId = null;
    document.body.style.overflow = '';
  }

  function readCourses() {
    return [...byId('consultCourseGroups').querySelectorAll('tr[data-course-index]')].map(row => {
      const base = formCourses[Number(row.dataset.courseIndex)];
      const value = key => row.querySelector('[data-course-field="' + key + '"]')?.value.trim() ?? base[key] ?? '';
      const group = row.closest('[data-group-id]');
      const system = group.querySelector('[data-group-system]').value;
      return {...base,groupId:group.dataset.groupId,division:divisionForSystem(system),
        system,item:group.querySelector('[data-group-item]').value,
        studentLevel:value('studentLevel'),expectedGrade:value('expectedGrade'),
        campus:value('campus'),hours:Number(value('hours')),currentTeacher:value('currentTeacher')};
    });
  }
  function readGroups() {
    return [...byId('consultCourseGroups').querySelectorAll('[data-group-id]')].map(group => ({
      id:group.dataset.groupId,division:divisionForSystem(group.querySelector('[data-group-system]').value),
      system:group.querySelector('[data-group-system]').value,item:group.querySelector('[data-group-item]').value
    }));
  }
  function syncFormState() {
    formCourses = readCourses();
    formGroups = readGroups();
  }
  function updateTotal() {
    const inputs = byId('consultCourseGroups')?.querySelectorAll('[data-course-field="hours"]') || [];
    const total = byId('consultTotalHours');
    if (total) total.textContent = [...inputs].reduce((sum,input) => sum + (Number(input.value) || 0),0).toFixed(2);
  }
  const catalogKey = course => [course.subject,course.board,course.grade,course.mode].join('|');
  function catalogFor(item) {
    let source = catalogRows;
    if (item === '托福' || item === '雅思') {
      source = ['听力','口语','阅读','写作'].flatMap(subject => [[subject,'--','--','线上'],[subject,'--','--','线下']]);
    } else if (item === '择校') {
      source = ['综合','数学','英语','物理','化学'].flatMap(subject => [[subject,'--','8年级','线下'],[subject,'--','8年级','线上']]);
    } else if (item === 'GCSE' || item === 'IGCSE') {
      source = catalogRows.filter(row => ['物理','化学','数学','英语','商务','经济'].includes(row[0]))
        .map(row => [row[0],row[1],item,row[3]]);
    } else if (item === '高阶笔试' || item === '高端竞赛' || item === '上海远见' || item === '英国大学课程' || item === '美高同步') {
      const subjects = {
        高阶笔试:['数学','物理','化学','英语'],高端竞赛:['数学','物理','化学'],
        上海远见:['数学','英语','综合'],英国大学课程:['商科','数学','英语'],
        美高同步:['数学','英语','物理','化学']
      }[item];
      source = subjects.flatMap(subject => [[subject,'--','--','线上'],[subject,'--','--','线下']]);
    }
    return source.map(([subject,board,grade,mode]) => ({subject,board,grade,mode}));
  }
  function closeCourseModal() {
    byId('consultCourseBackdrop').hidden = true;
    byId('consultCourseModal').hidden = true;
  }
  function openCourseModal(groupId) {
    syncFormState();
    const group = formGroups.find(entry => entry.id === groupId);
    if (!group?.system || !group?.item) { toast('请先选择课程体系和课程项'); return; }
    activeGroupId = groupId;
    modalCatalog = catalogFor(group.item);
    modalSelected = new Map();
    modalPage = 1;
    modalFilters = {subject:'',board:'',grade:'',mode:''};
    const keys = [
      ['consultCourseSubjectFilter','subject'],['consultCourseBoardFilter','board'],
      ['consultCourseGradeFilter','grade'],['consultCourseModeFilter','mode']
    ];
    keys.forEach(([id,key]) => {
      byId(id).innerHTML = options(['',...new Set(modalCatalog.map(course => course[key]))],'');
      byId(id).options[0].textContent = '请选择' + ({subject:'科目',board:'考试局',grade:'年级',mode:'授课模式'}[key]);
      byId(id).value = '';
    });
    renderCourseCatalog();
    byId('consultCourseBackdrop').hidden = false;
    byId('consultCourseModal').hidden = false;
    byId('consultCourseClose').focus();
  }
  function filteredCatalog() {
    return modalCatalog.filter(course => Object.entries(modalFilters).every(([key,value]) => !value || course[key] === value));
  }
  function renderCourseCatalog() {
    const filtered = filteredCatalog();
    const pageCount = Math.max(1,Math.ceil(filtered.length / 10));
    modalPage = Math.min(Math.max(1,modalPage),pageCount);
    const pageRows = filtered.slice((modalPage - 1) * 10,modalPage * 10);
    const alreadyAdded = new Set(formCourses.filter(course => course.groupId === activeGroupId).map(catalogKey));
    const listScroll = byId('consultCourseResults').closest('.smart-consult-course-list-scroll');
    const previousScroll = listScroll.scrollTop;
    byId('consultCourseResults').innerHTML = pageRows.length ? pageRows.map(course => {
      const key = catalogKey(course);
      const checked = modalSelected.has(key);
      const disabled = alreadyAdded.has(key);
      return '<tr><td><input type="checkbox" data-catalog-key="' + safe(key) + '"' + (checked ? ' checked' : '') +
        (disabled ? ' disabled' : '') + ' aria-label="选择' + safe(course.subject) + '课程"></td>' +
        '<td>' + safe(course.subject) + '</td><td>' + safe(course.board) + '</td><td>' + safe(course.grade) +
        '</td><td>' + safe(course.mode) + '</td></tr>';
    }).join('') : '<tr><td colspan="5" class="smart-consult-form-empty">暂无符合条件的课程</td></tr>';
    listScroll.scrollTop = previousScroll;
    byId('consultCourseSelectPage').checked = pageRows.length > 0 && pageRows.every(course => alreadyAdded.has(catalogKey(course)) || modalSelected.has(catalogKey(course)));
    byId('consultCourseSelectPage').disabled = pageRows.every(course => alreadyAdded.has(catalogKey(course)));
    byId('consultCoursePages').innerHTML = Array.from({length:pageCount},(_,index) =>
      '<button type="button" data-course-page="' + (index + 1) + '"' + (modalPage === index + 1 ? ' class="active"' : '') + '>' + (index + 1) + '</button>').join('');
    byId('consultCoursePrev').disabled = modalPage === 1;
    byId('consultCourseNext').disabled = modalPage === pageCount;
    byId('consultCourseCount').textContent = '共 ' + filtered.length + ' 条';
    byId('consultCourseSelectedCount').textContent = modalSelected.size;
    byId('consultCourseSelected').innerHTML = modalSelected.size ?
      [...modalSelected.values()].map(course => '<tr><td>' + safe(course.subject) + '</td><td>' + safe(course.board) +
        '</td><td>' + safe(course.grade) + '</td><td>' + safe(course.mode) + '</td><td><button type="button" data-selected-remove="' +
        safe(catalogKey(course)) + '">移除</button></td></tr>').join('') :
      '<tr><td colspan="5" class="smart-consult-form-empty">尚未选择课程</td></tr>';
  }
  function confirmCourses() {
    if (!modalSelected.size) { toast('请至少选择一门课程'); return; }
    syncFormState();
    const group = formGroups.find(entry => entry.id === activeGroupId);
    if (!group) { closeCourseModal(); return; }
    for (const course of modalSelected.values()) {
      formCourses.push({...defaultCourse(course.subject,0,course.mode),...course,
        groupId:group.id,division:group.division,system:group.system,item:group.item,
        board:course.board,grade:course.grade,module:'/',historicalTeacher:'无',
        campus:course.mode === '线上' ? '' : '舜元中心',studentLevel:'先修/同步-B及以上',
        expectedGrade:'',currentTeacher:''});
    }
    renderFormCourses();
    closeCourseModal();
  }
  function showCustomerSuggestions(query) {
    const list = byId('consultCustomerSuggestions');
    if (!customerSearchMode) { list.hidden = true; return; }
    const matches = query ? customerCatalog().filter(item => item.name.includes(query) || item.no.toLowerCase().includes(query.toLowerCase())).slice(0,6) : [];
    list.innerHTML = matches.map((item,index) => '<button type="button" role="option" aria-selected="false" data-customer-index="' + index + '"><span class="smart-consult-customer-radio" aria-hidden="true"></span>' + safe(item.name + '（' + item.no + '）') + '</button>').join('') || (query ? '<div class="smart-consult-customer-no-match">未找到已入库客户</div>' : '');
    list.hidden = !query;
    list._matches = matches;
  }

  function startFormal(id) {
    const item = consults.find(row => row.id === id);
    if (!item) return;
    if (item.status !== '已完成') { toast('仅已完成的方案可发起正式排课'); return; }
    if (!item.customerName) { toast('请先补充客户姓名'); openDrawer(id,'edit'); return; }
    pendingConsultId = id;
    closeDrawer();
    showSection('schedule');
    openCreateOrder();
    if (item.customerNo) {
      if (!window.createOrderDetails?.selectExistingStudent(item.customerName,item.customerNo))
        toast('请先从搜索结果中确认已入库学生');
    } else {
      const studentSearch = byId('createStudentSearch');
      studentSearch.value = item.customerName;
      studentSearch.dispatchEvent(new Event('input'));
      toast('请先选择已入库学生，再选择其已购课时包');
    }
    byId('createStartDate').value = item.start || '';
    byId('createEndMode').value = consultEndMode(item);
    byId('createEndMode').dispatchEvent(new Event('change'));
    byId('createEndDate').value = item.end || '';
    window.createOrderPackages.setConsultIntent(item.courses || []);
    const formalForm = byId('createOrderForm');
    formalForm.querySelector('.create-type-row select').value = item.scheduleType || '此科目新排';
    const timeMode = formalForm.querySelector('input[name="timeRequirement"][value="' + (item.timeRequirement === 'precise' ? 'precise' : 'vague') + '"]');
    timeMode.checked = true;
    timeMode.dispatchEvent(new Event('change'));
    formalForm.querySelectorAll('input[name="createPreciseWeekday"],input[name="createPreciseSlot"]').forEach(input => {
      input.checked = input.name === 'createPreciseWeekday' ? (item.preciseTime?.weekdays || []).includes(Number(input.value)) : (item.preciseTime?.slots || []).includes(input.value);
    });
    byId('createCustomTimeRows').replaceChildren();
    (item.preciseTime?.custom || []).forEach(([start,end]) => {
      byId('createAddCustomTime').click();
      const inputs = byId('createCustomTimeRows').lastElementChild.querySelectorAll('input');
      inputs[0].value = start; inputs[1].value = end;
    });
    formalForm.querySelectorAll('#createTeacherStyles input').forEach(input => { input.checked = (item.teacherStyles || []).includes(input.value); });
    formalForm.querySelectorAll('input[name="createTeacherGender"]').forEach(input => { input.checked = item.teacherGender === input.value; });
    byId('createProgress').value = item.progress || '';
    byId('createProgress').dispatchEvent(new Event('input'));
    byId('createRequirement').value = (item.requirement || '').slice(0,500);
    byId('createRequirementCount').textContent = byId('createRequirement').value.length + '/500';
  }

  function renderAssociateOrders() {
    const query = byId('consultAssociateSearch').value.trim().toLowerCase();
    const choices = allOrders.filter(order => order.course && (!query || order.course.toLowerCase().includes(query))).slice(0,30);
    byId('consultAssociateOrders').innerHTML = choices.length ? choices.map(order =>
      '<label class="smart-consult-associate-option"><input type="radio" name="associateOrder" value="' + safe(order.id) + '"' + (order.id === associateOrderId ? ' checked' : '') + '><span>' + safe(order.course) + '</span></label>'
    ).join('') : '<p class="smart-consult-empty">未找到排课单</p>';
  }
  function openAssociateModal(id) {
    if (consults.find(item => item.id === id)?.status !== '已完成') { toast('仅已完成的方案可关联正式排课'); return; }
    associateConsultId = id;
    associateOrderId = null;
    byId('consultAssociateSearch').value = '';
    renderAssociateOrders();
    byId('consultAssociateBackdrop').hidden = false;
    byId('consultAssociateModal').hidden = false;
    byId('consultAssociateSearch').focus();
  }
  function closeAssociateModal() {
    byId('consultAssociateBackdrop').hidden = true;
    byId('consultAssociateModal').hidden = true;
    associateConsultId = null;
    associateOrderId = null;
  }
  function associateConsult(consultId,orderId,orderFromParent) {
    const item = consults.find(row => row.id === consultId);
    if (!item || item.status !== '已完成') return false;
    if (orderFromParent?.id && !allOrders.some(order => order.id === Number(orderFromParent.id))) allOrders.unshift(orderFromParent);
    const order = allOrders.find(row => row.id === Number(orderId));
    if (!order) return false;
    item.linkedOrderIds = [...new Set([...(item.linkedOrderIds || []),Number(orderId)])];
    order.consultId = item.id;
    saveDemoOrders(); save(); renderConsults();
    if (drawerMode === 'view' && currentId === consultId) renderSelectedPreplan(item);
    return true;
  }

  // 排课单详情页与售前咨单共用同一份方案数据和关联关系。
  const consultSnapshot = item => {
    if (!item) return null;
    if (item.status === '已完成') ensureCurrentPreview(item);
    const starter = item.initiatorRole === '学管师' ? (item.managerName || item.initiator) : (item.advisorName || item.initiator);
    const starterNo = item.initiatorRole === '学管师' ? item.managerNo : item.advisorNo;
    const handler = handlerName(item);
    const staff = (name,no) => name ? name + '（' + (no || staffNumbers[name] || '--') + '）' : '--';
    return JSON.parse(JSON.stringify({...item,name:planNameFor(item),customerDisplay:customerLabel(item),
      initiatorDisplay:staff(starter,starterNo),handlerDisplay:staff(handler,item.handlerNo),processedAt:processedAt(item)||'--'}));
  };
  window.salesConsultBridge = {
    list: () => consults.map(item => ({
      id:item.id,name:planNameFor(item),status:item.status,
      customer:customerLabel(item),linkedOrderIds:[...(item.linkedOrderIds || [])]
    })),
    get: id => consultSnapshot(consults.find(row => row.id === id)),
    associate: (consultId,orderId) => associateConsult(consultId,orderId)
  };
  window.dispatchEvent(new Event('sales-consult-ready'));

  byId('smartConsultNav').addEventListener('click',() => showSection('consult'));
  byId('myScheduleNav').addEventListener('click',() => showSection('schedule'));
  byId('myClassesNav').addEventListener('click',() => showSection('classes'));
  for (const id of ['smartConsultNav','myScheduleNav','myClassesNav']) byId(id).addEventListener('keydown',event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); byId(id).click(); }
  });
  byId('consultCreate').addEventListener('click',() => openDrawer(null,'create'));
  byId('consultSearch').addEventListener('click',() => {
    filters = {plan:byId('consultPlanFilter').value.trim().toLowerCase(),customer:byId('consultCustomerFilter').value.trim().toLowerCase(),
      from:byId('consultFromFilter').value,to:byId('consultToFilter').value,status:byId('consultStatusFilter').value,
      role:byId('consultRoleFilter').value,initiator:byId('consultInitiatorFilter').value.trim().toLowerCase(),
      handler:byId('consultHandlerFilter').value.trim().toLowerCase(),handledFrom:byId('consultHandledFromFilter').value,
      handledTo:byId('consultHandledToFilter').value,linked:byId('consultLinkedFilter').value};
    renderConsults();
  });
  byId('consultReset').addEventListener('click',() => {
    for (const id of ['consultPlanFilter','consultCustomerFilter','consultFromFilter','consultToFilter','consultStatusFilter','consultRoleFilter','consultInitiatorFilter','consultHandlerFilter','consultHandledFromFilter','consultHandledToFilter','consultLinkedFilter']) byId(id).value = '';
    filters = {plan:'',customer:'',from:'',to:'',status:'',role:'',initiator:'',handler:'',handledFrom:'',handledTo:'',linked:''};
    renderConsults();
  });
  for (const id of ['consultPlanFilter','consultCustomerFilter','consultInitiatorFilter','consultHandlerFilter']) {
    byId(id).addEventListener('keydown',event => { if (event.key === 'Enter') byId('consultSearch').click(); });
  }
  byId('consultTabs').addEventListener('click',event => {
    const tab = event.target.closest('[data-consult-tab]');
    if (!tab) return;
    activeConsultTab = tab.dataset.consultTab;
    byId('consultTabs').querySelectorAll('[data-consult-tab]').forEach(button => {
      const active = button === tab;
      button.classList.toggle('active',active);
      button.setAttribute('aria-selected',String(active));
    });
    renderConsults();
  });
  byId('consultRows').addEventListener('click',event => {
    const button = event.target.closest('[data-consult-action]');
    if (!button || button.disabled) return;
    const id = button.dataset.consultId, action = button.dataset.consultAction;
    if (action === 'formal') startFormal(id);
    else if (action === 'associate') openAssociateModal(id);
    else if (action === 'preview') openConsultPreplan(consults.find(item=>item.id===id));
    else if (action === 'withdraw') {
      const item = consults.find(row => row.id === id);
      if (!item) return;
      if(item.status!=='待分配')return;
      item.status = '已驳回';
      item.handledAt = currentTimestamp();
      save(); renderConsults(); toast('售前咨单已驳回');
    } else openDrawer(id,action);
  });
  byId('consultClose').addEventListener('click',closeDrawer);
  byId('consultBackdrop').addEventListener('click',closeDrawer);
  byId('consultDrawerBody').addEventListener('change',event => {
    if (event.target.id !== 'consultPlanSwitch' || drawerMode !== 'view') return;
    activePreplanId = event.target.value;
    renderSelectedPreplan(current());
  });
  byId('consultDrawerFoot').addEventListener('click',event => {
    const button = event.target.closest('[data-consult-footer]');
    if (!button) return;
    if (button.dataset.consultFooter === 'formal') startFormal(currentId);
    else if (button.dataset.consultFooter === 'associate') openAssociateModal(currentId);
    else if (button.dataset.consultFooter === 'submit-reply') {
      const reply=byId('consultIssueReply')?.value.trim()||'';
      if(!reply){toast('请补充待确认的排课要求');byId('consultIssueReply')?.focus();return;}
      runConsultAnalysis(reply);
    }
    else closeDrawer();
  });
  for (const id of ['consultAssociateClose','consultAssociateCancel','consultAssociateBackdrop']) byId(id).addEventListener('click',closeAssociateModal);
  byId('consultAssociateSearch').addEventListener('input',renderAssociateOrders);
  byId('consultAssociateOrders').addEventListener('change',event => {
    if (event.target.name === 'associateOrder') associateOrderId = Number(event.target.value);
  });
  byId('consultAssociateConfirm').addEventListener('click',() => {
    if (!associateOrderId) { toast('请选择排课单'); return; }
    if (!associateConsult(associateConsultId,associateOrderId)) { toast('关联失败，请重试'); return; }
    closeAssociateModal(); toast('已关联正式排课单');
  });
  window.addEventListener('message',event => {
    if (!educatorMode || event.source !== window.parent || !event.data) return;
    if (event.data.kind === 'REQUEST_CONSULT_CATALOG') sendConsultCatalog();
    if (event.data.kind === 'REQUEST_CONSULT_DETAIL') {
      window.parent.postMessage({kind:'CONSULT_DETAIL',consult:consultSnapshot(consults.find(row=>row.id===event.data.consultId))},'*');
    }
    if (event.data.kind === 'SYNC_EDUCATOR_ORDER' && event.data.order?.id) {
      const incoming = event.data.order;
      const existing = allOrders.find(order => order.id === Number(incoming.id));
      if (existing) Object.assign(existing,incoming);
      else allOrders.unshift(incoming);
      renderConsults();
    }
    if (event.data.kind === 'LINK_CONSULT_TO_ORDER') {
      const success = associateConsult(event.data.consultId,event.data.order?.id,event.data.order);
      window.parent.postMessage({kind:'CONSULT_ASSOCIATION_RESULT',success},'*');
    }
    if (event.data.kind === 'OPEN_CONSULT_DETAIL') {
      showSection('consult');
      openDrawer(event.data.consultId,'view');
    }
  });
  byId('consultDrawerBody').addEventListener('click',event => {
    if (event.target.closest('[data-consult-export]')) { exportConsultPreplan(); return; }
    const formalOrderLink = event.target.closest('[data-consult-order-detail]');
    if (formalOrderLink) {
      const orderId = Number(formalOrderLink.dataset.consultOrderDetail);
      closeDrawer();
      showSection('schedule');
      showDetail(orderId);
      return;
    }
    if (event.target.closest('#consultCustomerSearchToggle')) {
      customerSearchMode = !customerSearchMode;
      const name = byId('consultCustomerName');
      name.value = '';
      name.placeholder = customerSearchMode ? '输入姓名或客户编号搜索已入库客户' : '请填写未入库客户姓名';
      byId('consultCustomerSearchToggle').textContent = customerSearchMode ? '填写未入库客户' : '搜索已入库客户';
      byId('consultCustomerNo').value = '';
      byId('consultCustomerPureName').value = '';
      byId('consultCustomerSuggestions').hidden = true;
      name.focus();
      return;
    }
    const removeAttachment = event.target.closest('[data-remove-attachment]');
    if (removeAttachment) {
      formAttachments.splice(Number(removeAttachment.dataset.removeAttachment),1);
      byId('consultAttachmentList').innerHTML = formAttachmentsMarkup();
      return;
    }
    const endModeButton = event.target.closest('[data-consult-end-mode]');
    if (endModeButton) {
      const form = byId('consultForm');
      form.elements.endMode.value = endModeButton.dataset.consultEndMode;
      syncConsultEndMode(form);
      return;
    }
    const orderButton = event.target.closest('[data-linked-order]');
    if (orderButton) {
      linkedOrderId = Number(orderButton.dataset.linkedOrder);
      byId('consultDrawerBody').innerHTML = linkedMarkup(current());
      return;
    }
    const customerButton = event.target.closest('[data-customer-index]');
    if (customerButton) {
      const match = byId('consultCustomerSuggestions')._matches[Number(customerButton.dataset.customerIndex)];
      byId('consultCustomerName').value = match.name + '（' + match.no + '）';
      byId('consultCustomerNo').value = match.no;
      byId('consultCustomerPureName').value = match.name;
      byId('consultCustomerSuggestions').hidden = true;
      return;
    }
    const addCourse = event.target.closest('[data-add-course-group]');
    if (addCourse) {
      openCourseModal(addCourse.dataset.addCourseGroup);
      return;
    }
    if (event.target.closest('#consultAddGroup')) {
      syncFormState();
      formGroups.push({id:'cg' + (++groupSequence),division:'',system:'',item:''});
      renderFormCourses();
      return;
    }
    const removeGroup = event.target.closest('[data-remove-group]');
    if (removeGroup) {
      syncFormState();
      if (formGroups.length < 2) return;
      const groupId = removeGroup.dataset.removeGroup;
      formGroups = formGroups.filter(group => group.id !== groupId);
      formCourses = formCourses.filter(course => course.groupId !== groupId);
      renderFormCourses();
      return;
    }
    const adjust = event.target.closest('[data-hour-adjust]');
    if (adjust) {
      const input = adjust.parentElement.querySelector('[data-course-field="hours"]');
      input.value = Math.max(0,Number(input.value || 0) + Number(adjust.dataset.hourAdjust)).toFixed(2);
      updateTotal();
      return;
    }
    const remove = event.target.closest('[data-remove-course]');
    if (remove) {
      syncFormState();
      formCourses.splice(Number(remove.dataset.removeCourse),1);
      renderFormCourses();
    }
  });
  byId('consultDrawerBody').addEventListener('input',event => {
    if (event.target.id === 'consultCustomerName') {
      byId('consultCustomerNo').value = '';
      byId('consultCustomerPureName').value = '';
      showCustomerSuggestions(event.target.value.trim());
    }
    if (event.target.matches('[data-course-field="hours"]')) updateTotal();
  });
  byId('consultDrawerBody').addEventListener('change',event => {
    if (event.target.id === 'consultAttachmentInput') {
      addFormAttachments(event.target.files);
      event.target.value='';
      return;
    }
    if (event.target.matches('input[name="start"]')) {
      byId('consultForm').elements.end.min = event.target.value;
      return;
    }
    const field = event.target.closest('[data-group-system],[data-group-item]');
    if (!field) return;
    const groupId = field.closest('[data-group-id]').dataset.groupId;
    syncFormState();
    const group = formGroups.find(entry => entry.id === groupId);
    if (!group) return;
    if (field.matches('[data-group-system]')) { group.division = divisionForSystem(group.system); group.item = ''; }
    formCourses = formCourses.filter(course => course.groupId !== groupId);
    renderFormCourses();
  });
  byId('consultDrawerBody').addEventListener('dragover',event => {
    const drop = event.target.closest('#consultAttachmentDrop');
    if (!drop) return;
    event.preventDefault();
    drop.classList.add('is-dragging');
  });
  byId('consultDrawerBody').addEventListener('dragleave',event => {
    const drop = event.target.closest('#consultAttachmentDrop');
    if (drop && !drop.contains(event.relatedTarget)) drop.classList.remove('is-dragging');
  });
  byId('consultDrawerBody').addEventListener('drop',event => {
    const drop = event.target.closest('#consultAttachmentDrop');
    if (!drop) return;
    event.preventDefault();
    drop.classList.remove('is-dragging');
    addFormAttachments(event.dataTransfer?.files || []);
  });
  for (const id of ['consultCourseClose','consultCourseCancel','consultCourseBackdrop']) {
    byId(id).addEventListener('click',closeCourseModal);
  }
  byId('consultCourseSearch').addEventListener('click',() => {
    modalFilters = {subject:byId('consultCourseSubjectFilter').value,board:byId('consultCourseBoardFilter').value,
      grade:byId('consultCourseGradeFilter').value,mode:byId('consultCourseModeFilter').value};
    modalPage = 1;
    renderCourseCatalog();
  });
  byId('consultCourseReset').addEventListener('click',() => {
    for (const id of ['consultCourseSubjectFilter','consultCourseBoardFilter','consultCourseGradeFilter','consultCourseModeFilter']) byId(id).value = '';
    modalFilters = {subject:'',board:'',grade:'',mode:''};
    modalPage = 1;
    renderCourseCatalog();
  });
  byId('consultCourseResults').addEventListener('change',event => {
    const checkbox = event.target.closest('[data-catalog-key]');
    if (!checkbox) return;
    const key = checkbox.dataset.catalogKey;
    const course = modalCatalog.find(row => catalogKey(row) === key);
    if (checkbox.checked && course) modalSelected.set(key,course);
    else modalSelected.delete(key);
    renderCourseCatalog();
  });
  byId('consultCourseSelectPage').addEventListener('change',event => {
    const alreadyAdded = new Set(formCourses.filter(course => course.groupId === activeGroupId).map(catalogKey));
    filteredCatalog().slice((modalPage - 1) * 10,modalPage * 10).forEach(course => {
      const key = catalogKey(course);
      if (alreadyAdded.has(key)) return;
      if (event.target.checked) modalSelected.set(key,course);
      else modalSelected.delete(key);
    });
    renderCourseCatalog();
  });
  byId('consultCourseSelected').addEventListener('click',event => {
    const button = event.target.closest('[data-selected-remove]');
    if (!button) return;
    modalSelected.delete(button.dataset.selectedRemove);
    renderCourseCatalog();
  });
  byId('consultCoursePages').addEventListener('click',event => {
    const button = event.target.closest('[data-course-page]');
    if (!button) return;
    modalPage = Number(button.dataset.coursePage);
    renderCourseCatalog();
  });
  byId('consultCoursePrev').addEventListener('click',() => { modalPage--; renderCourseCatalog(); });
  byId('consultCourseNext').addEventListener('click',() => { modalPage++; renderCourseCatalog(); });
  byId('consultCourseConfirm').addEventListener('click',confirmCourses);
  byId('consultDrawerBody').addEventListener('submit',event => {
    if (event.target.id !== 'consultForm') return;
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    if (customerSearchMode && !form.elements.customerNo.value) {
      toast('请从搜索结果中选择一位已入库客户');
      byId('consultCustomerName').focus();
      return;
    }
    const courses = readCourses();
    if (!courses.length || courses.some(course => !course.subject || !Number.isFinite(course.hours) || course.hours <= 0 || Math.round(course.hours * 4) !== course.hours * 4)) {
      toast('请添加科目，课时须为 0.25 的正倍数'); return;
    }
    if (readGroups().some(group => !courses.some(course => course.groupId === group.id))) {
      toast('请为每组课程体系和课程项添加科目'); return;
    }
    const specified = form.elements.endMode.value === 'SPECIFIED_DATE';
    if (specified && (!form.elements.end.value || form.elements.end.value < form.elements.start.value)) {
      toast('请选择不早于开课日期的结课日期'); form.elements.end.focus(); return;
    }
    const data = {customerNo:form.elements.customerNo.value.trim(),customerName:customerSearchMode ? form.elements.customerPureName.value.trim() : form.elements.customerName.value.trim(),
      advisorName:current()?.advisorName || '李春玲',start:form.elements.start.value,
      endMode:form.elements.endMode.value,end:specified ? form.elements.end.value : '',
      scheduleType:form.elements.scheduleType.value,timeRequirement:form.elements.timeRequirement.value,
      preciseTime:null,
      requirement:form.elements.requirement.value.trim(),
      attachments:formAttachments.map(file=>({name:file.name,size:file.size||0,type:file.type||''})),
      teacherStyles:[...form.querySelectorAll('input[name="teacherStyles"]:checked')].map(input => input.value),
      teacherGender:form.querySelector('input[name="teacherGender"]:checked')?.value || '',
      progress:'',courses};
    consultAnalysisDraft=data;
    consultAnalysisSourceMode=drawerMode;
    runConsultAnalysis();
  });
  window.addEventListener('message',event=>{
    const frame=byId('consultTeacherFrame');
    if(!frame||event.source!==frame.contentWindow||!event.data||event.data.consultId!==currentId)return;
    if(event.data.type==='consult-preview-close'){closeDrawer();return;}
    if(event.data.type!=='consult-preview-ready')return;
    const item=current();
    if(!item)return;
    item.preview=buildConsultPreview(item,Array.isArray(event.data.teachers)?event.data.teachers:[]);
    item.status='已完成';
    item.completedAt=currentTimestamp();
    item.handledAt=item.completedAt;
    save();renderConsults();openConsultPreplan(item);
  });
  document.addEventListener('formal-order-created',event => {
    const consultId = event.detail.order.submission?.consultId || pendingConsultId;
    if (!consultId) return;
    const item = consults.find(row => row.id === consultId);
    if (item) {
      item.linkedOrderIds = [...new Set([...(item.linkedOrderIds || []),event.detail.order.id])];
      event.detail.order.consultId = item.id;
      event.detail.order.submission.customerNo = item.customerNo || event.detail.order.submission.customerNo || '';
      saveDemoOrders(); save(); renderConsults();
    }
    pendingConsultId = null;
  });
  for (const id of ['closeCreateOrder','cancelCreateOrder']) byId(id).addEventListener('click',() => {
    pendingConsultId = null;
  });
  window.addEventListener('keydown',event => {
    if (event.key !== 'Escape') return;
    if (!byId('consultAssociateModal').hidden) closeAssociateModal();
    else if (!byId('consultCourseModal').hidden) closeCourseModal();
    else if (!byId('consultDrawer').hidden) closeDrawer();
  });
  renderConsults();
  if (new URLSearchParams(location.search).has('embed-consult')) {
    const heading = document.querySelector('.smart-consult-heading > div > span');
    if (heading) heading.textContent = '教务工作台 / 售前咨单';
  }
  if (location.hash === '#smart-consult') showSection('consult');
})();
