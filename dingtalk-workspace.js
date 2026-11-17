(() => {
  const home = document.getElementById('ding-home');
  const approval = document.getElementById('ding-approval');
  const list = document.getElementById('ding-card-list');
  const query = document.getElementById('ding-query');
  const count = document.getElementById('ding-pending-count');
  const tabs = [...document.querySelectorAll('.ding-status-tabs button')];
  let activeStatus = 'pending';
  const items = [
    { id: 1, name: '排课状态审批', time: '2026-11-16 17:42', status: 'pending' },
    { id: 2, name: '科目状态审批', time: '2026-11-16 17:40', status: 'pending' }
  ];
  function render() {
    const keyword = query.value.trim();
    count.textContent = items.filter(item => item.status === 'pending').length;
    const visible = items.filter(item => item.status === activeStatus && (!keyword || item.name.includes(keyword)));
    list.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'ding-empty';
      empty.textContent = '暂无相关审批';
      list.append(empty);
      return;
    }
    visible.forEach(item => {
      const card = document.createElement('article');
      card.className = 'ding-card';
      const actions = activeStatus === 'pending' ? '<div class="ding-card-actions"><button class="reject" data-decision="rejected" type="button">驳回</button><button class="approve" data-decision="approved" type="button">通过</button></div>' : '';
      card.innerHTML = `<div class="ding-card-time">${item.time}</div><div class="ding-card-title">${item.name}</div><div class="ding-card-row"><span>审批字段</span><b>待补充</b></div><div class="ding-card-row"><span>详细内容</span><b>待补充</b></div><div class="ding-card-view">基本信息查看 <span>›</span></div>${actions}`;
      card.querySelectorAll('[data-decision]').forEach(button => button.addEventListener('click', () => { item.status = button.dataset.decision; render(); }));
      list.append(card);
    });
  }
  document.getElementById('open-scheduling-approval').addEventListener('click', () => { home.hidden = true; approval.hidden = false; render(); window.scrollTo(0, 0); });
  document.getElementById('ding-back').addEventListener('click', () => { approval.hidden = true; home.hidden = false; window.scrollTo(0, 0); });
  tabs.forEach(tab => tab.addEventListener('click', () => {
    activeStatus = tab.dataset.status;
    tabs.forEach(button => { const selected = button === tab; button.classList.toggle('active', selected); button.setAttribute('aria-selected', String(selected)); });
    render();
  }));
  document.getElementById('ding-search-button').addEventListener('click', render);
  query.addEventListener('keydown', event => { if (event.key === 'Enter') render(); });
})();
