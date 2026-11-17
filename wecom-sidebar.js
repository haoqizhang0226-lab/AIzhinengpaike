(() => {
  const $ = id => document.getElementById(id);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const conversations = [
    ['robot','☻','智能机器人','员工使用统计（11…','40分钟前'],['yellow','▤','行业资讯','认证提升365：谁在说…','9:27'],
    ['green','●','微信客服','查询昨日企业客服数据…','9:27'],['green','●','学员联系','[6条]安全经营·客户流…','昨天'],
    ['green','▥','企业名片','昨日有1位成员提醒企…','昨天'],['green','▤','数据资产交接','[2条]远老师已离职，地…','昨天'],
    ['green','▣','离职继承','他的学员待分配','昨天'],['mosaic','▦','唯寻腾讯会议开通','张无为：嗯嗯','星期五'],
    ['mosaic','▦','唯寻教育-企微客…','梁梓榕：没有可以分…','星期四'],['green','☏','企业微信团队','[2条]成员加客户…','星期三'],
    ['blue','✉','邮件提醒','张皓滨等238人绑定…','11/06']
  ];
  $('conversationList').innerHTML = conversations.map(([tone,icon,name,preview,time], index) => `<div class="conversation-row${index === 7 ? ' active' : ''}"><span class="conversation-icon ${tone}">${icon}</span><div><strong>${safe(name)}</strong><small>${safe(preview)}</small></div><time>${safe(time)}</time></div>`).join('');
  const messages = [
    ['张无为(wuwei（别名）)','▧　排课信息截图',true],
    ['熊焰-微伴助手（联系电话 18720194955） @夜莺科技','你们试用版什么时候到期啊?'],
    ['熊焰-微伴助手（联系电话 18720194955） @夜莺科技','如果就这两天的话，你看要不要等两天再提单；还是说直接就买 30 个，后面 7 个的费用，你到时候再重新走付款打给我们。'],
    ['张无为(wuwei（别名）)','差不多能用完，今天下午又多加了一个，剩下还有一个业务部门没给名单呢'],
    ['熊焰-微伴助手（联系电话 18720194955） @夜莺科技','那 30 个应该估计差不多。'],
    ['张海琴 @天泰科技','那就按30个买，反正月底可能也还得加，到时候统一结算。'],['张无为(wuwei（别名）)','嗯嗯']
  ];
  $('chatMessages').innerHTML = messages.map(([name,content,attachment]) => `<div class="message"><small>${safe(name)}</small><div class="chat-bubble${attachment ? ' attachment' : ''}">${safe(content)}</div></div>`).join('');
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const tags = read('wecom-personal-tags');
  const renderTags = () => { $('personalTagContent').className = tags.length ? 'tag-list' : 'card-empty'; $('personalTagContent').innerHTML = tags.length ? tags.map(tag => `<span class="tag-chip">${safe(tag)}</span>`).join('') : '<span class="empty-icon">▱</span><span>客户未添加个人标签~</span>'; };
  const renderConsults = () => {
    const name = document.querySelector('.wecom-customer').dataset.currentWechatName;
    const consults = read('smart-scheduling-v32-consults').filter(item => item.customerName === name);
    $('consultContent').className = consults.length ? 'consult-list' : 'card-empty';
    $('consultContent').innerHTML = consults.length ? consults.map(item => `<div class="consult-list-item"><strong>${safe(item.consultType || '1V1')} · ${safe(item.customerName)}</strong><small>${safe(item.schemeNo || '待生成')}　${safe(item.status || '进行中')}</small></div>`).join('') : '<span class="empty-icon">▤</span><span>暂无售前咨单</span>';
  };
  renderTags(); renderConsults();
  const layer = $('wecomDrawerLayer');
  let returnFocus = null;
  const openDrawer = kind => {
    returnFocus = document.activeElement;
    const isConsult = kind === 'consult';
    const title = $('wecomDrawerTitle');
    title.hidden = isConsult;
    title.textContent = isConsult ? '' : '新增个人标签';
    $('wecomBottomDrawer').setAttribute('aria-label', isConsult ? '售前咨单' : '新增个人标签');
    if (isConsult) {
      window.WecomConsultForm.mount({body:$('wecomDrawerBody'),footer:$('wecomDrawerFooter'),customerName:document.querySelector('.wecom-customer').dataset.currentWechatName,onSubmitted:renderConsults});
    } else {
      $('wecomDrawerBody').innerHTML = '';
      ['wecomDrawerPrevious','wecomDrawerNext','wecomDrawerSubmit'].forEach(id => { $(id).hidden = true; });
      $('wecomDrawerCancel').textContent = '取消';
    }
    layer.setAttribute('aria-hidden', 'false');
    layer.classList.add('open');
    $('wecomDrawerCancel').focus();
  };
  const closeDrawer = () => {
    window.WecomConsultForm?.pause();
    layer.classList.remove('open');
    layer.setAttribute('aria-hidden', 'true');
    returnFocus?.focus();
  };
  $('addPersonalTag').addEventListener('click', () => openDrawer('tag'));
  $('addConsult').addEventListener('click', () => openDrawer('consult'));
  $('wecomDrawerCancel').addEventListener('click', closeDrawer);
  layer.querySelector('[data-drawer-close]').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && layer.classList.contains('open')) { event.preventDefault(); closeDrawer(); } });
  $('bindCustomer').addEventListener('click', () => { const number = $('customerNumber').value.trim(); $('bindFeedback').textContent = number ? `已绑定客户编号：${number}` : '请输入客户编号'; });
  document.querySelectorAll('.role-options button').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.role-options button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); }));
})();
