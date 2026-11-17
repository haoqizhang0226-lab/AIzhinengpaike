(() => {
  if (document.documentElement.classList.contains('embedded-consult') || document.body.classList.contains('consult-preview-mode')) return;
  const tabs = document.querySelector('.topbar .workspace-tabs, .legacy-topbar .workspace-tabs');
  if (!tabs) return;
  const bar = document.createElement('div');
  bar.className = 'prototype-global-nav';
  bar.append(tabs);
  document.body.prepend(bar);
  document.body.classList.add('prototype-nav-active');
})();
