(() => {
  const get = id => document.getElementById(id);
  const styleOptions = ['风趣幽默','可全英文','热情活泼','严格严肃','循序善诱','疑难专家','生动形象','温柔耐心','雷厉风行','其他'];
  const genderOptions = ['男老师','女老师','都可以'];
  const styles = new Set(['可全英文','温柔耐心']);
  let gender = '女老师';
  let endMode = 'natural';
  let endDate = '';
  const original = {
    schedule: get('scheduleReadonly').textContent.trim(),
    other: get('otherReadonly').textContent.trim(),
    end: '排完全部课程结束',
    styles: [...styles],
    gender
  };
  const dialog = get('demoDialog');
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  get('styleRightOptions').innerHTML = styleOptions.map(value => `<label><input type="checkbox" data-style="${value}" ${styles.has(value)?'checked':''}> ${value}</label>`).join('');
  get('genderRightOptions').innerHTML = genderOptions.map(value => `<label><input type="radio" name="teacherGender" data-gender="${value}" ${gender===value?'checked':''}> ${value}</label>`).join('');
  function syncFixedFields() {
    document.querySelectorAll('[data-style]').forEach(input => { input.checked = styles.has(input.dataset.style); });
    document.querySelectorAll('[data-gender]').forEach(input => { input.checked = gender === input.dataset.gender; });
    get('styleReadonly').textContent = [...styles].join('、') || '未选择';
    get('genderReadonly').textContent = gender;
    get('endReadonly').textContent = endMode === 'date' ? (endDate || '指定结课日期（待填写）') : '排完全部课程结束';
  }
  const resolved = () => ({
    end: endMode === 'date' && Boolean(endDate) && endDate >= '2026-11-20',
    style: styles.has('严格严肃') && !styles.has('温柔耐心'),
    gender: gender === '都可以',
    time: get('timeSupplement').value.trim().length >= 12
  });
  function refresh() {
    syncFixedFields();
    const results = resolved();
    const keys = Object.keys(results);
    const count = Object.values(results).filter(Boolean).length;
    for (const [key, done] of Object.entries(results)) {
      const issue = document.querySelector(`[data-issue="${key}"]`);
      issue.classList.toggle('resolved', done);
      const status = issue.querySelector('.ai-demo-state');
      status.hidden = done && key === 'time';
      status.textContent = done ? (key === 'time' ? '' : '已修改 · 待复检') : '待处理';
    }
    get('progressTextCount').textContent = `已处理 ${count}/${keys.length}`;
    get('progressPending').textContent = count === keys.length ? '可重新分析' : `${keys.length-count} 类待处理`;
    get('actionHint').textContent = count === keys.length ? '全部问题已处理，可统一重新分析。' : `请处理右侧剩余 ${keys.length-count} 类问题。`;
  }
  function showDialog(title, body) {
    get('demoDialogTitle').textContent = title;
    get('demoDialogBody').innerHTML = body;
    dialog.showModal();
  }
  get('endInlineMode').addEventListener('change', () => {
    endMode = get('endInlineMode').value;
    get('endInlineDate').hidden = endMode !== 'date';
    if (endMode !== 'date') { endDate = ''; get('endInlineDate').value = ''; }
    refresh();
  });
  get('endInlineDate').addEventListener('input', () => {
    endDate = get('endInlineDate').value;
    refresh();
  });
  document.addEventListener('change', event => {
    const input = event.target;
    if (input.matches('[data-style]')) {
      if (input.checked) styles.add(input.dataset.style); else styles.delete(input.dataset.style);
      refresh();
    }
    if (input.matches('[data-gender]')) {
      gender = input.dataset.gender;
      refresh();
    }
  });
  get('timeSupplement').addEventListener('input', refresh);
  get('viewOriginal').addEventListener('click', () => showDialog('原始提交版本', `
    <p>以下是本次 AI 分析所依据的原始内容。右侧修改只覆盖当前排课单字段，不会删除原始版本。</p>
    <div class="version-row"><strong>学生及课程</strong>刘大礼（VA100078710） · 英联邦-英联邦学科-雅思-1V1 · 听力 8 课时、口语 8 课时、写作 8 课时</div>
    <div class="version-row"><strong>结课日期</strong>${escapeHtml(original.end)}</div>
    <div class="version-row"><strong>老师风格</strong>${escapeHtml(original.styles.join('、'))}</div>
    <div class="version-row"><strong>老师性别</strong>${escapeHtml(original.gender)}</div>
    <div class="version-row"><strong>排课时间要求原文</strong>${escapeHtml(original.schedule)}</div>
    <div class="version-row"><strong>其他排课要求</strong>${escapeHtml(original.other)}</div>`));
  get('retrySubmit').addEventListener('click', () => {
    const results = resolved();
    const keys = Object.keys(results);
    const next = keys.find(key => !results[key]);
    if (next) {
      const issue = document.querySelector(`[data-issue="${next}"]`);
      issue.scrollIntoView({behavior:'smooth',block:'center'});
      get('actionHint').textContent = `请先处理第 ${keys.indexOf(next)+1} 类问题。`;
      issue.animate([{boxShadow:'0 0 0 0 #f5ab5833'},{boxShadow:'0 0 0 5px #f5ab5855'},{boxShadow:'0 0 0 0 #f5ab5800'}],{duration:900});
      return;
    }
    const button = get('retrySubmit');
    button.disabled = true;
    button.textContent = 'AI 正在重新分析…';
    get('actionHint').textContent = '正在分析更新后的固定字段及补充排课要求。';
    setTimeout(() => {
      button.disabled = false;
      button.textContent = '重新分析并发起排课单';
      get('actionHint').textContent = '演示分析已通过。';
      document.querySelectorAll('.ai-demo-state').forEach(state => state.textContent = '已通过');
      showDialog('AI 分析通过', `<div class="success-mark">✓</div><div class="success-title">排课单可以发起</div>
        <p class="success-copy">前三类修改已覆盖当前排课单字段；补充排课要求单独交给 AI 重新分析。</p>
        <div class="version-row"><strong>排课单 · 结课日期</strong>${escapeHtml(endDate)}</div>
        <div class="version-row"><strong>排课单 · 老师风格</strong>${escapeHtml([...styles].join('、'))}</div>
        <div class="version-row"><strong>排课单 · 老师性别</strong>${escapeHtml(gender)}</div>
        <div class="version-row"><strong>排课单 · 排课时间要求原文</strong>${escapeHtml(original.schedule)}</div>
        <div class="version-row"><strong>独立字段 · 补充排课要求</strong>${escapeHtml(get('timeSupplement').value.trim())}</div>
        <p class="success-copy">这是交互 Demo，不会生成真实排课单。</p>`);
    }, 650);
  });
  [get('closeDemoDialog'),get('dialogDone')].forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  refresh();
})();
