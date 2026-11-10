(() => {
  'use strict';
  const order = document.getElementById('orderPage');
  const result = document.getElementById('resultPage');
  const management = document.getElementById('teacherManagementPage');
  const consult = document.getElementById('educatorConsultPage');
  const consultFrame = document.getElementById('educatorConsultFrame');
  const frame = document.getElementById('teacherManagementFrame');
  const scheduleMenu = document.getElementById('scheduleMenu');
  const consultMenu = document.getElementById('consultMenu');
  const teacherMenu = document.getElementById('teacherMenu');
  const submenu = document.getElementById('teacherSubmenu');
  const teacherScheduleMenu = document.getElementById('teacherScheduleMenu');
  let previousPage = 'order';
  let configuration = null;
  let consultCatalog = [];
  let selectedConsultId = null;
  const currentOrder = () => window.currentEducatorFlowOrder;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const sendCurrentOrder = () => {
    if (currentOrder()?.id) consultFrame.contentWindow?.postMessage({kind:'SYNC_EDUCATOR_ORDER',order:currentOrder()},'*');
    consultFrame.contentWindow?.postMessage({kind:'REQUEST_CONSULT_CATALOG'},'*');
  };
  const linkedConsults = () => consultCatalog.filter(item => (item.linkedOrderIds || []).some(id => Number(id) === Number(currentOrder()?.id)) || currentOrder()?.consultId === item.id);
  const renderConsultCard = () => {
    const body = document.getElementById('educatorConsultCardBody');
    const linked = linkedConsults();
    body.innerHTML = linked.length ? linked.map(item => '<button type="button" class="educator-consult-linked-plan" data-consult-view="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + '</button>').join('') : '<span class="educator-consult-unlinked">暂无关联售前咨单</span>';
  };
  const renderConsultChoices = () => {
    const search = document.getElementById('educatorConsultLinkSearch').value.trim().toLowerCase();
    const linkedIds = linkedConsults().map(item => item.id);
    const items = consultCatalog.filter(item => item.status === '已完成' && !linkedIds.includes(item.id) && (!search || item.name.toLowerCase().includes(search) || item.customer.toLowerCase().includes(search)));
    if (!items.some(item => item.id === selectedConsultId)) selectedConsultId = null;
    document.getElementById('educatorConsultLinkChoices').innerHTML = items.length ? items.map(item => '<label><input type="radio" name="educatorConsultChoice" value="' + escapeHtml(item.id) + '"' + (item.id === selectedConsultId ? ' checked' : '') + '><span>' + escapeHtml(item.name) + '</span><small>' + escapeHtml(item.customer) + '</small></label>').join('') : '<p>暂无可关联的已完成方案</p>';
  };
  const closeLinkModal = () => {
    document.getElementById('educatorConsultLinkBackdrop').hidden = true;
    document.getElementById('educatorConsultLinkModal').hidden = true;
    selectedConsultId = null;
  };
  const closeConsultView = () => {
    document.getElementById('educatorConsultViewBackdrop').hidden = true;
    document.getElementById('educatorConsultViewModal').hidden = true;
  };
  const consultLessonRows = item => {
    const lessons = item?.status === '已完成' ? (item.preview?.lessons || []) : [];
    return lessons.slice().sort((a,b) => (a.date+' '+a.slot).localeCompare(b.date+' '+b.slot)).map(lesson => {
      const course = item.courses?.[Number(lesson.courseIndex)] || {};
      const start = (lesson.slot || '08:20-10:20').split('-')[0];
      const minutes = Number(start.slice(0,2))*60 + Number(start.slice(3,5)) + Math.round((Number(lesson.durationHours)||2)*60);
      const end = String(Math.floor(minutes/60)%24).padStart(2,'0') + ':' + String(minutes%60).padStart(2,'0');
      const courseName = course.name || [course.system,course.item,course.subject,course.board,course.grade].filter(Boolean).join('-');
      return '<tr><td>' + escapeHtml((lesson.date||'')+' '+start+'—'+end) + '</td><td>' + escapeHtml(courseName||'--') + '</td><td>' + escapeHtml(String(lesson.teacher||'--').replace(/\([^)]*\)/g,'')) + '</td><td>' + escapeHtml(course.mode||'--') + '</td><td>' + escapeHtml((Number(lesson.durationHours)||2)+' 课时') + '</td></tr>';
    }).join('') || '<tr><td colspan="5" class="educator-consult-view-empty">暂无预排课程</td></tr>';
  };
  const renderConsultView = item => {
    if (!item) return;
    document.getElementById('educatorConsultViewTitle').textContent = '售前咨单';
    const fields = [['客户姓名',item.customerDisplay],['发起人',item.initiatorDisplay],['发起时间',item.created],['处理人',item.handlerDisplay],['处理时间',item.processedAt]];
    document.getElementById('educatorConsultViewBody').innerHTML = '<div class="educator-consult-view-fields">' + fields.map(([label,value]) => '<div><small>' + escapeHtml(label) + '</small><strong>' + escapeHtml(value||'--') + '</strong></div>').join('') + '</div><section class="educator-consult-view-section"><h3>预排课表</h3><div class="educator-consult-view-table-wrap"><table class="educator-consult-view-table"><thead><tr><th>上课时间</th><th>课程</th><th>授课老师</th><th>授课模式</th><th>课节时长</th></tr></thead><tbody>' + consultLessonRows(item) + '</tbody></table></div></section>';
    document.getElementById('educatorConsultViewBackdrop').hidden = false;
    document.getElementById('educatorConsultViewModal').hidden = false;
  };

  window.getTeacherPriorityConfiguration = () => configuration;
  const selectMenu = page => {
    scheduleMenu.classList.toggle('active', page === 'schedule');
    consultMenu.classList.toggle('active', page === 'consult');
    teacherScheduleMenu.classList.toggle('active', page === 'teacher');
    teacherMenu.classList.toggle('active', page === 'teacher');
  };
  teacherMenu.addEventListener('click', () => {
    submenu.hidden = !submenu.hidden;
    teacherMenu.setAttribute('aria-expanded', String(!submenu.hidden));
  });
  teacherScheduleMenu.addEventListener('click', () => {
    if (!management.hidden) return;
    if (!order.hidden || !result.hidden) previousPage = result.hidden ? 'order' : 'result';
    order.hidden = true;
    result.hidden = true;
    consult.hidden = true;
    management.hidden = false;
    document.body.classList.remove('formal-page-active');
    submenu.hidden = false;
    teacherMenu.setAttribute('aria-expanded', 'true');
    selectMenu('teacher');
    frame.contentWindow?.postMessage({ kind: 'REQUEST_TEACHER_PRIORITY_CONFIG' }, '*');
  });
  scheduleMenu.addEventListener('click', () => {
    management.hidden = true;
    consult.hidden = true;
    if (previousPage === 'result') {
      result.hidden = false;
      order.hidden = true;
      document.body.classList.add('formal-page-active');
    } else {
      order.hidden = false;
      result.hidden = true;
      document.body.classList.remove('formal-page-active');
    }
    selectMenu('schedule');
  });
  consultMenu.addEventListener('click', () => {
    if (!order.hidden || !result.hidden) previousPage = result.hidden ? 'order' : 'result';
    order.hidden = true;
    result.hidden = true;
    management.hidden = true;
    consult.hidden = false;
    document.body.classList.remove('formal-page-active');
    selectMenu('consult');
    sendCurrentOrder();
  });
  consultFrame.addEventListener('load',sendCurrentOrder);
  document.addEventListener('DOMContentLoaded',sendCurrentOrder,{once:true});
  document.getElementById('educatorConsultAssociate').addEventListener('click',() => {
    selectedConsultId = null;
    document.getElementById('educatorConsultLinkSearch').value = '';
    document.getElementById('educatorConsultLinkError').hidden = true;
    renderConsultChoices();
    document.getElementById('educatorConsultLinkBackdrop').hidden = false;
    document.getElementById('educatorConsultLinkModal').hidden = false;
    document.getElementById('educatorConsultLinkSearch').focus();
  });
  document.getElementById('educatorConsultCardBody').addEventListener('click',event => {
    const button = event.target.closest('[data-consult-view]');
    if (!button) return;
    consultFrame.contentWindow?.postMessage({kind:'REQUEST_CONSULT_DETAIL',consultId:button.dataset.consultView},'*');
  });
  for (const id of ['educatorConsultViewClose','educatorConsultViewDone','educatorConsultViewBackdrop']) document.getElementById(id).addEventListener('click',closeConsultView);
  for (const id of ['educatorConsultLinkClose','educatorConsultLinkCancel','educatorConsultLinkBackdrop']) document.getElementById(id).addEventListener('click',closeLinkModal);
  document.addEventListener('keydown',event => { if (event.key !== 'Escape') return; if (!document.getElementById('educatorConsultViewModal').hidden) closeConsultView(); else if (!document.getElementById('educatorConsultLinkModal').hidden) closeLinkModal(); });
  document.getElementById('educatorConsultLinkSearch').addEventListener('input',renderConsultChoices);
  document.getElementById('educatorConsultLinkChoices').addEventListener('change',event => {if(event.target.name==='educatorConsultChoice')selectedConsultId=event.target.value;});
  document.getElementById('educatorConsultLinkConfirm').addEventListener('click',() => {
    if (!selectedConsultId || !currentOrder()?.id) {
      const error = document.getElementById('educatorConsultLinkError');
      error.textContent = '请选择售前咨单'; error.hidden = false;
      return;
    }
    consultFrame.contentWindow?.postMessage({kind:'LINK_CONSULT_TO_ORDER',consultId:selectedConsultId,order:currentOrder()},'*');
  });
  frame.addEventListener('load', () => frame.contentWindow?.postMessage({ kind: 'REQUEST_TEACHER_PRIORITY_CONFIG' }, '*'));
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.data?.kind !== 'TEACHER_PRIORITY_CONFIG') return;
    if (!Array.isArray(event.data.rules) || !event.data.published || typeof event.data.published !== 'object') return;
    configuration = { rules: event.data.rules, published: event.data.published };
  });
  window.addEventListener('message',event => {
    if (event.source !== consultFrame.contentWindow) return;
    if (event.data?.kind === 'CONSULT_CATALOG' && Array.isArray(event.data.consults)) {
      consultCatalog = event.data.consults;
      renderConsultCard();
      if (!document.getElementById('educatorConsultLinkModal').hidden) renderConsultChoices();
    }
    if (event.data?.kind === 'CONSULT_ASSOCIATION_RESULT') {
      if (event.data.success) closeLinkModal();
      else { const error = document.getElementById('educatorConsultLinkError'); error.textContent = '关联失败，请重试'; error.hidden = false; }
    }
    if (event.data?.kind === 'CONSULT_DETAIL') renderConsultView(event.data.consult);
  });
})();
