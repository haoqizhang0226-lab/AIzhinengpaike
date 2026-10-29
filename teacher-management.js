(() => {
  'use strict';
  const order = document.getElementById('orderPage');
  const result = document.getElementById('resultPage');
  const management = document.getElementById('teacherManagementPage');
  const frame = document.getElementById('teacherManagementFrame');
  const scheduleMenu = document.getElementById('scheduleMenu');
  const teacherMenu = document.getElementById('teacherMenu');
  const submenu = document.getElementById('teacherSubmenu');
  const teacherScheduleMenu = document.getElementById('teacherScheduleMenu');
  let previousPage = 'order';
  let configuration = null;

  window.getTeacherPriorityConfiguration = () => configuration;
  const selectMenu = teacherPage => {
    scheduleMenu.classList.toggle('active', !teacherPage);
    teacherScheduleMenu.classList.toggle('active', teacherPage);
    teacherMenu.classList.toggle('active', teacherPage);
  };
  teacherMenu.addEventListener('click', () => {
    submenu.hidden = !submenu.hidden;
    teacherMenu.setAttribute('aria-expanded', String(!submenu.hidden));
  });
  teacherScheduleMenu.addEventListener('click', () => {
    if (!management.hidden) return;
    previousPage = result.hidden ? 'order' : 'result';
    order.hidden = true;
    result.hidden = true;
    management.hidden = false;
    document.body.classList.remove('formal-page-active');
    submenu.hidden = false;
    teacherMenu.setAttribute('aria-expanded', 'true');
    selectMenu(true);
    frame.contentWindow?.postMessage({ kind: 'REQUEST_TEACHER_PRIORITY_CONFIG' }, '*');
  });
  scheduleMenu.addEventListener('click', () => {
    management.hidden = true;
    if (previousPage === 'result') {
      result.hidden = false;
      order.hidden = true;
      document.body.classList.add('formal-page-active');
    } else {
      order.hidden = false;
      result.hidden = true;
      document.body.classList.remove('formal-page-active');
    }
    selectMenu(false);
  });
  frame.addEventListener('load', () => frame.contentWindow?.postMessage({ kind: 'REQUEST_TEACHER_PRIORITY_CONFIG' }, '*'));
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.data?.kind !== 'TEACHER_PRIORITY_CONFIG') return;
    if (!Array.isArray(event.data.rules) || !event.data.published || typeof event.data.published !== 'object') return;
    configuration = { rules: event.data.rules, published: event.data.published };
  });
})();
