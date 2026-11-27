(() => {
  const panel = document.getElementById('hrSchedulingPage');
  const serviceMenu = document.getElementById('hrServiceMenu');
  const serviceToggle = document.getElementById('hrServiceToggle');
  const serviceLinks = [...serviceMenu.querySelectorAll('a')];
  const createDialog = document.createElement('dialog');
  createDialog.className = 'hr-order-form-dialog';
  createDialog.setAttribute('aria-label', '新增1V1排课单');
  document.body.append(createDialog);
  createDialog.addEventListener('close', () => createDialog.replaceChildren());
  const student = '授课反馈产品验收';
  const owner = '李春玲';
  const defaultPackage = '英联邦-英联邦学科-ALEVEL-1v1';
  const computer = 'ALEVEL-计算机-AQA-线上';
  const biology = 'ALEVEL-生物-OCR-线下';
  const statuses = ['待分配', '处理中', '已完成', '已驳回', '已撤回'];
  const properties = ['新增排课单', '变更排课单'];
  const types = ['1V1排课单', '预设班排课单', '自组班排课单'];
  const orders = [
    ['测试1124-01-新增', '24 10:42:42', 1, owner, 2, '24 11:38:32', owner, 0],
    ['测试1124-新增', '24 10:39:28', 1, owner, 3, '24 10:42:03', owner, 0],
    ['帮咨测试008-英联邦学科-ALEVEL-计算机-1V1', '24 10:33:14', 0, owner, 2, '24 10:37:34', owner, 0],
    [student + '-ALEVEL-计算机-变更', '20 10:09:20', 0, owner, 2, '20 10:10:07', owner, 1],
    [student + '-ALEVEL-会计-变更', '20 09:44:56', 0, owner, 2, '20 09:47:24', owner, 1],
    ['测试前测-新增', '19 18:40:28', 1, owner, 2, '20 11:14:25', '常竞文', 0],
    ['前测测试班级1119-新增', '19 18:00:57', 1, '常竞文', 2, '19 18:29:46', '常竞文', 0],
    ['前测测试班级1119-新增', '19 17:57:39', 1, '--', 0, '', owner, 0],
    ['吴天任1-橡沐语培-SAT-1V1', '19 10:29:20', 0, owner, 2, '19 10:44:06', owner, 1],
    ['吴天任1-橡沐语培-SAT-1V1', '18 18:43:36', 0, owner, 2, '18 19:22:53', owner, 1],
    ['测试1118-新增', '18 11:30:00', 1, '--', 0, '', owner, 0],
    ['班课-数学-排课单', '17 14:10:00', 1, owner, 2, '17 15:10:00', owner, 0]
  ].map(([name, start, type, handler, status, end, applicant, property], index) => ({
    name, start: '2026-11-' + start, type: types[type], handler, status: statuses[status],
    end: end ? '2026-11-' + end : '--', applicant, property: properties[property], dedicated: index < 11
  }));
  const orderPackages = ['英联邦学科-ALEVEL-商务-1V1', '英联邦学科-GCSE-数学-1V1', '英联邦学科-ALEVEL-计算机-1V1'];
  const sampleOrder = {
    name: student,
    start: '2026-11-18 10:30:00', type: types[0], handler: owner, status: statuses[1],
    end: '--', applicant: owner, property: properties[0], dedicated: true
  };
  const sampleSuborders = ordersForPackages(sampleOrder, orderPackages.slice(0, 2));
  const combinedOrders = [aggregateOrders(sampleOrder, sampleSuborders)];
  orders.push(...sampleSuborders);

  function ordersForPackages(order, packages) {
    return packages.map(packageName => ({
      ...order, packageName, name: order.name + '-' + packageName, combined: packages.length > 1
    }));
  }

  function aggregateOrders(order, suborders) {
    return { ...order, name: suborders.map(item => item.name).join(' / '), suborders };
  }
  const renewals = [
    ['11-11 17:13', 20, computer, '(1)'], ['11-11 15:58', 10, computer],
    ['11-09 14:15', 10, computer], ['11-08 14:58', 30, computer],
    ['09-01 11:31', 30, biology], ['07-08 15:44', 60, computer + '、ALEVEL-高数-AQA-线上'],
    ['06-15 16:12', 10, computer], ['05-11 16:07', 32, computer + '、' + biology, '(1)'],
    ['05-11 15:33', 32, computer + '、' + biology], ['05-07 18:43', 40, computer + '、' + biology, '(5)'],
    ['05-06 14:00', 10, computer], ['05-05 13:15', 20, biology]
  ].map(([created, hours, course, suffix = ''], index) => ({
    name: `${student}-续排方案-2026-${created.slice(0, 5)}${suffix ? '-' + suffix : ''}`,
    package: index >= 7 && index <= 9 ? defaultPackage + '、英研-英研留学-升学' : defaultPackage,
    course, hours, creator: owner, created: '2026-' + created, dedicated: index < 11
  }));
  const pages = {
    '#my-scheduling': {
      title: '我的排课', add: '新增1V1排课单', rows: orders,
      columns: [['name', '排课单名称'], ['start', '发起时间'], ['type', '排课单类型'], ['handler', '处理人名称'],
        ['status', '排课单状态'], ['end', '完成时间'], ['applicant', '申请人名称'], ['property', '排课单属性']]
    },
    '#renewal-plans': {
      title: '续排方案', add: '新增续排方案', rows: renewals,
      columns: [['name', '续排方案名称'], ['package', '课程包'], ['course', '课程'], ['hours', '续排课时'],
        ['creator', '创建人'], ['created', '创建时间']]
    }
  };
  let page;
  let dedicated = true;
  let orderMode = 'individual';
  let filters = {};
  let pageNumber = 1;
  let pageSize = 10;
  let pageRows = [];
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const input = (label, name, placeholder) => `<label>${label}<input name="${name}" placeholder="${placeholder}"></label>`;
  const select = (label, name, options) => `<label>${label}<select name="${name}"><option value="">请选择</option>${options.map(value => `<option>${value}</option>`).join('')}</select></label>`;
  const action = (name, label) => `<button type="button" class="hr-service-link" data-action="${name}">${label}</button>`;

  function setServiceOpen(open) {
    serviceToggle.setAttribute('aria-expanded', open);
    serviceMenu.hidden = !open;
  }

  function setOrderMode(mode) {
    orderMode = mode;
    pageNumber = 1;
    for (const option of panel.querySelectorAll('[data-order-mode]')) {
      option.setAttribute('aria-pressed', option.dataset.orderMode === mode);
    }
  }

  function showPage() {
    page = pages[location.hash];
    if (page?.rows !== orders && createDialog.open) createDialog.close();
    for (const link of serviceLinks) {
      if (link.hash === location.hash) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const dialog = panel.querySelector('dialog');
    if (dialog?.open) dialog.close();
    if (!page) return;
    setServiceOpen(true);
    filters = {};
    pageNumber = 1;
    pageSize = 10;
    const ordersPage = page.rows === orders;
    panel.setAttribute('aria-label', page.title);
    panel.innerHTML = `
      <div class="hr-role">班主任角色: <span>班课班主任</span><button type="button" class="hr-role-switch" role="switch" aria-label="专属班主任" aria-checked="${dedicated}"></button><span>专属班主任</span></div>
      <form class="hr-filters hr-service-filters">
        ${ordersPage ? input('排课单名称', 'name', '课程') + select('排课单状态', 'status', statuses)
          + select('排课单属性', 'property', properties) + select('排课单类型', 'type', types)
          + input('申请人姓名', 'applicant', '请输入姓名') : input('续排方案名称', 'name', '请输入')
          + '<div class="hr-service-range"><span>创建时间</span><div><input type="date" name="from" aria-label="开始时间"><span>至</span><input type="date" name="to" aria-label="结束时间"></div></div>'}
        <div class="hr-filter-actions"><button type="reset" class="hr-button">重置</button><button type="submit" class="hr-button hr-primary">查询</button></div>
      </form>
      <div class="hr-list-actions hr-service-actions">${ordersPage ? `<div class="order-list-mode" role="group" aria-label="排课单列表视图">
        <button type="button" data-order-mode="combined" aria-pressed="${orderMode === 'combined'}">组合排课单</button>
        <button type="button" data-order-mode="individual" aria-pressed="${orderMode === 'individual'}">排课单</button>
      </div>` : ''}<button type="button" class="hr-button hr-primary" data-action="add">${page.add}</button></div>
      <div class="hr-table-scroll"><table class="hr-table hr-service-table ${ordersPage ? 'hr-order-list' : 'hr-renewal-list'}">
        <thead><tr>${page.columns.map(([, label]) => `<th scope="col">${label}</th>`).join('')}<th scope="col">操作</th><th scope="col"><span class="hr-table-settings" aria-label="列表设置">☷</span></th></tr></thead><tbody></tbody>
      </table></div>
      <nav class="hr-pagination" aria-label="列表分页"></nav>
      <dialog class="hr-service-dialog" aria-labelledby="hrServiceDialogTitle"></dialog>`;
    const form = panel.querySelector('form');
    form.addEventListener('submit', event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      if (values.from && values.to && values.from > values.to) {
        const end = form.elements.to;
        end.setCustomValidity('结束时间不能早于开始时间');
        end.reportValidity();
        return;
      }
      filters = values;
      pageNumber = 1;
      renderRows();
    });
    form.addEventListener('input', () => form.elements.to?.setCustomValidity(''));
    form.addEventListener('reset', () => {
      form.elements.to?.setCustomValidity('');
      filters = {};
      pageNumber = 1;
      renderRows();
    });
    renderRows();
  }

  function openCreateOrder() {
    const frame = document.createElement('iframe');
    frame.title = '新增1V1排课单';
    frame.src = 'index.html?embed-homeroom-order=1';
    createDialog.replaceChildren(frame);
    createDialog.showModal();
  }

  function addSubmittedOrder(order) {
    const data = {
      name: order.course, start: order.created, type: order.type, handler: order.handler,
      status: order.status, end: order.finished, applicant: order.applicant,
      property: order.attribute, dedicated, submission: order.submission, supplements: order.supplements
    };
    const combined = order.suborders.length > 1;
    let courseNumber = 0;
    const suborders = order.suborders.map(item => ({
      ...data, ...item, combined,
      courses: item.courses.map(course => {
        const key = `course-${++courseNumber}`;
        return { ...course, specifiedTeacher: order.submission.specifiedTeachers?.[key],
          selectedTeacher: order.submission.selectedTeachers?.[key] };
      })
    }));
    orders.unshift(...suborders);
    if (combined) combinedOrders.unshift(aggregateOrders(data, suborders));
    setOrderMode(combined ? 'combined' : 'individual');
    panel.querySelector('.hr-service-filters').reset();
  }

  window.addEventListener('message', event => {
    if (!createDialog.open || event.origin !== location.origin ||
        event.source !== createDialog.querySelector('iframe')?.contentWindow) return;
    if (event.data?.kind === 'homeroom-order-created' && event.data.order?.suborders?.length) {
      addSubmittedOrder(event.data.order);
    }
    if (event.data?.kind === 'homeroom-order-close') createDialog.close();
  });

  function orderCourses(courses) {
    if (!courses?.length) return '';
    return `<ul class="hr-suborder-courses">${courses.map(course => {
      const fields = [course.subject || course.name, course.board, course.grade, course.mode,
        course.hours && `${course.hours} 课时`, course.specifiedTeacher && `指定教师 ${course.specifiedTeacher}`,
        course.selectedTeacher && `授课教师 ${course.selectedTeacher}`];
      return `<li>${escape(fields.filter(value => value && value !== '--').join(' · '))}</li>`;
    }).join('')}</ul>`;
  }

  function renderRows() {
    const source = page.rows === orders && orderMode === 'combined' ? combinedOrders.map(order => ({
      ...order, status: order.suborders.every(item => item.status === statuses[4]) ? statuses[4] : order.status
    })) : page.rows;
    const results = source.filter(row => row.dedicated === dedicated && Object.entries(filters).every(([key, value]) => {
      if (!value.trim()) return true;
      if (key === 'from') return row.created.slice(0, 10) >= value;
      if (key === 'to') return row.created.slice(0, 10) <= value;
      return key === 'name' || key === 'applicant' ? row[key].toLowerCase().includes(value.trim().toLowerCase()) : row[key] === value;
    }));
    const count = Math.max(1, Math.ceil(results.length / pageSize));
    pageNumber = Math.min(count, Math.max(1, pageNumber));
    const start = (pageNumber - 1) * pageSize;
    pageRows = results.slice(start, start + pageSize);
    panel.querySelector('tbody').innerHTML = pageRows.map((row, index) => `
      <tr data-row="${index}">
        ${page.columns.map(([key]) => `<td title="${escape(row[key])}">${page.rows === orders && key === 'name'
          ? action('view', (row.combined ? '<span class="order-origin-badge">组合</span>' : '') + escape(row[key])) : escape(row[key])}</td>`).join('')}
        <td>${page.rows === orders ? (!row.suborders && row.status === '待分配' ? action('withdraw', '撤回') : '')
          : action('preview', '预览') + action('view', '查看') + action('delete', '删除')}</td><td></td>
      </tr>`).join('') || `<tr><td colspan="${page.columns.length + 2}" class="hr-empty">暂无数据</td></tr>`;
    const pagination = panel.querySelector('.hr-pagination');
    pagination.innerHTML = `
      <button type="button" data-page="${pageNumber - 1}" aria-label="上一页" ${pageNumber === 1 ? 'disabled' : ''}>‹</button>
      ${Array.from({length: count}, (_, index) => {
        const number = index + 1;
        return `<button type="button" data-page="${number}" ${number === pageNumber ? 'class="hr-page-current" aria-current="page"' : ''}>${number}</button>`;
      }).join('')}
      <button type="button" data-page="${pageNumber + 1}" aria-label="下一页" ${pageNumber === count ? 'disabled' : ''}>›</button>
      <select aria-label="每页条数">${[10, 20, 50].map(size => `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}条/页</option>`).join('')}</select>
      <span>共 ${results.length} 条</span>
      <label>前往 <input aria-label="前往页码" type="number" min="1" max="${count}" value="${pageNumber}"> 页</label>`;
    pagination.querySelector('select').addEventListener('change', event => {
      pageSize = Number(event.target.value);
      pageNumber = 1;
      renderRows();
    });
    pagination.querySelector('input').addEventListener('change', event => {
      pageNumber = Number(event.target.value) || 1;
      renderRows();
    });
  }

  function openDialog(actionName, row) {
    const dialog = panel.querySelector('dialog');
    const ordersPage = page.rows === orders;
    if (actionName === 'add' && !ordersPage) {
      window.homeroomRenewalForm.open(dialog, saveRenewalPlan);
      return;
    }
    if (actionName === 'preview' && row?.previewOrder) {
      dialog.innerHTML = '';
      window.homeroomRenewalForm.openSchedule(dialog, row.previewOrder, {
        ready: snapshot => { row.previewOrder.renewalPreview = snapshot; }
      });
      return;
    }
    const removing = actionName === 'delete' || actionName === 'withdraw';
    const verb = actionName === 'delete' ? '删除' : '撤回';
    const title = removing ? verb + (ordersPage ? '排课单' : '续排方案')
      : actionName === 'preview' ? '续排方案预览' : row?.suborders ? '组合排课单详情' : ordersPage ? '排课单详情' : '续排方案详情';
    const details = row ? page.columns.map(([key, label]) => `<dt>${label}</dt><dd>${escape(row[key])}</dd>`).join('') : '';
    const packages = row?.suborders ? `<dt>包含排课单</dt><dd class="hr-combined-suborders">${row.suborders.map((item, index) =>
      `<section>排课单名称：<button type="button" class="hr-service-link" data-suborder="${index}">${escape(item.name)}</button>${orderCourses(item.courses)}</section>`).join('')}</dd>`
      : row?.packageName ? `<dt>课时包</dt><dd>${escape(row.packageName)}${orderCourses(row.courses)}</dd>` : '';
    const renewal = row?.renewalCourses ? `<dt>学生姓名</dt><dd>${escape(row.student)}</dd>
      <dt>方案课程</dt><dd><ul class="hr-suborder-courses">${row.renewalCourses.map(item =>
        `<li>${escape([item.kind, item.course, item.hours + ' 课时', item.teacher].join(' · '))}</li>`).join('')}</ul></dd>` : '';
    const submission = row?.submission;
    const request = submission ? `<dt>学生姓名</dt><dd>${escape(submission.student || '--')}</dd>
      <dt>排课类型</dt><dd>${escape(submission.type || '--')}</dd>
      <dt>开课日期</dt><dd>${escape(submission.start || '--')}</dd>
      <dt>结课日期</dt><dd>${escape(submission.end || '排完全部课程结束')}</dd>
      ${submission.schedulingHandler === 'self'
        ? `<dt>班课班主任</dt><dd>${escape(submission.classOwner || '学生的专属班主任')}</dd>`
        : `<dt>排课时间要求</dt><dd>${escape(submission.requirement || '--')}</dd>`}
      ${row.supplements?.length ? `<dt>排课时间要求补充</dt><dd>${row.supplements.map(item => escape([item.text, ...(item.attachments || [])].filter(Boolean).join('、'))).join('<br>')}</dd>` : ''}` : '';
    dialog.innerHTML = `<form method="dialog"><header><h2 id="hrServiceDialogTitle">${title}</h2><button type="button" class="hr-dialog-close" aria-label="关闭">×</button></header>
      <div class="hr-service-dialog-body">${removing
        ? `<p>确认${verb}「${escape(row.name)}」？</p>` : `<dl>${details}${packages}${renewal}${request}</dl>`}</div>
      <footer><button type="button" class="hr-button" data-dismiss>${removing ? '取消' : '关闭'}</button>
      ${removing ? `<button type="submit" class="hr-button hr-primary">确认${verb}</button>` : ''}</footer></form>`;
    dialog.querySelectorAll('.hr-dialog-close, [data-dismiss]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.querySelectorAll('[data-suborder]').forEach(button => button.addEventListener('click', () => {
      dialog.close();
      openDialog('view', row.suborders[Number(button.dataset.suborder)]);
    }));
    dialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      if (actionName === 'withdraw') row.status = '已撤回';
      if (actionName === 'delete') renewals.splice(renewals.indexOf(row), 1);
      dialog.close();
      renderRows();
    });
    dialog.showModal();
  }

  function saveRenewalPlan(student, courses, previewOrder, current) {
    if (current) {
      current.renewalCourses = courses;
      current.previewOrder = previewOrder;
      return current;
    }
    const created = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).slice(0, 16);
    const baseName = `${student}-续排方案-${created.slice(0, 10)}`;
    let name = baseName;
    for (let suffix = 1; renewals.some(row => row.name === name); suffix++) name = `${baseName}-(${suffix})`;
    const row = {
      name, student, created, creator: owner, dedicated,
      package: [...new Set(courses.map(course => course.package))].join('、'),
      course: courses.map(course => course.course).join('、'),
      hours: courses.reduce((total, course) => total + course.hours, 0),
      renewalCourses: courses, previewOrder
    };
    renewals.unshift(row);
    panel.querySelector('.hr-service-filters').reset();
    return row;
  }

  serviceToggle.addEventListener('click', () => setServiceOpen(serviceMenu.hidden));
  panel.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.closest('dialog')) return;
    if (button.matches('.hr-role-switch')) {
      dedicated = !dedicated;
      button.setAttribute('aria-checked', dedicated);
      pageNumber = 1;
      renderRows();
    }
    if (button.dataset.orderMode && button.dataset.orderMode !== orderMode) {
      setOrderMode(button.dataset.orderMode);
      renderRows();
    }
    if (button.dataset.page) {
      pageNumber = Number(button.dataset.page);
      renderRows();
    }
    if (button.dataset.action) {
      if (button.dataset.action === 'add' && page.rows === orders) {
        openCreateOrder();
        return;
      }
      openDialog(button.dataset.action, pageRows[button.closest('tr')?.dataset.row]);
    }
  });
  window.addEventListener('hashchange', showPage);
  showPage();
})();
