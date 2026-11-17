(() => {
  if (document.documentElement.classList.contains('embedded-consult') || document.body.classList.contains('consult-preview-mode')) return;
  const workbench = document.body.dataset.prototypeSection || (document.body.classList.contains('educator-workspace') ? 'educator' : 'sales');
  const pages = workbench === 'educator' ? [
    ['scheduleLogDrawer','排课日志'],
    ['flowRequirementsOverlay','完整排课要求'],['modalBackdrop','补充排课要求'],
    ['educatorConsultLinkModal','关联售前咨单'],['educatorConsultViewModal','售前咨单详情'],
    ['teacherWhitelistPage','教师推荐白名单'],['teacherManagementPage','教师推荐规则管理'],
    ['educatorConsultPage','售前咨单'],['classManagementPage','班级管理'],['resultPage','智能排课结果'],
    ['orderPage','排课单详情'],['orderListPage','我的排课单']
  ] : workbench === 'sales' ? [
    ['aiPrecheckIssuesDemoPage','排课单 AI 提示 Demo'],
    ['consultPlanDemoPage','确认售前咨单方案'],
    ['aiPrecheckDrawer','AI 排课分析'],['createCoursePicker','添加课程'],
    ['createOrderPage','新增排课单'],['orderConsultModal','售前咨单详情'],
    ['consultAssociateModal','关联售前咨单'],['consultExportModal','导出售前咨单'],
    ['consultAssignModal','分配售前咨单'],['consultRejectModal','驳回售前咨单'],
    ['consultCourseModal','选择课程'],['selfClassWizard','新增自组班'],
    ['orderDrawer','排课单详情'],['smartConsultPanel','售前咨单'],
    ['myClassesPanel','我的班级'],['listPanel','我的排课']
  ] : [];
  const visible = element => element && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
  const slug = value => String(value).trim().replace(/[^\p{L}\p{N}]+/gu,'-').slice(0,60);
  const panel = document.createElement('aside');
  panel.className = 'prototype-notes';
  panel.setAttribute('aria-label','原型说明');
  const emptyList = '<ol data-style="decimal-outline"><li><br></li></ol>';
  panel.innerHTML = '<div class="prototype-notes-head"><strong id="prototypeNotesPage">原型说明</strong></div><div class="prototype-notes-toolbar"><button type="button" id="prototypeNotesBold" aria-label="加粗" title="加粗"><b>B</b></button><label class="prototype-color-control" title="文字颜色">颜色 <input id="prototypeNotesColor" type="color" value="#253b57" aria-label="文字颜色"></label><select id="prototypeNotesFontSize" aria-label="字体大小" title="字体大小"><option value="">字号</option><option value="12">12</option><option value="14">14</option><option value="16">16</option><option value="18">18</option><option value="20">20</option><option value="24">24</option></select></div><div id="prototypeNotesText" class="prototype-notes-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="原型说明内容" data-placeholder="输入说明…" spellcheck="false"></div><div class="prototype-notes-actions"><span id="prototypeNotesStatus" role="status"></span><button type="button" id="prototypeNotesSave">保存说明</button></div>';
  document.body.append(panel);
  const title = panel.querySelector('#prototypeNotesPage');
  const editor = panel.querySelector('#prototypeNotesText');
  const status = panel.querySelector('#prototypeNotesStatus');
  const save = panel.querySelector('#prototypeNotesSave');
  const bold = panel.querySelector('#prototypeNotesBold');
  const color = panel.querySelector('#prototypeNotesColor');
  const fontSize = panel.querySelector('#prototypeNotesFontSize');
  const drafts = new Map();
  let currentKey = '';
  let currentHtml = '';
  let requestVersion = 0;
  let savedRange = null;

  function page() {
    if (workbench === 'business' || workbench === 'algorithm') return {key:workbench,title:workbench === 'business' ? '业务流程' : '排课算法'};
    for (const [id,label] of pages) {
      const element = document.getElementById(id);
      if (!visible(element)) continue;
      if (id === 'orderPage' && element.classList.contains('self-class-detail')) return {key:'selfClassOrderPage',title:'自组班排课单详情'};
      const pageTitle = id === 'modalBackdrop' ? document.getElementById('wizardTitle')?.textContent?.trim() || label : label;
      return {key:id === 'modalBackdrop' ? 'wizard-' + slug(pageTitle) : id,title:pageTitle};
    }
    return {key:'home',title:workbench === 'educator' ? '教务工作台' : '销售工作台'};
  }
  function sanitize(html) {
    const source = document.createElement('template');
    source.innerHTML = html;
    const output = document.createElement('div');
    const allowed = new Set(['div','p','br','ol','ul','li','strong','b','em','i','u','span','font','blockquote']);
    const blocked = new Set(['script','style','iframe','object','embed','img','svg','math']);
    const clean = (node,parent) => {
      if (node.nodeType === Node.TEXT_NODE) { parent.append(document.createTextNode(node.textContent)); return; }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      if (blocked.has(tag)) return;
      const target = allowed.has(tag) ? document.createElement(tag === 'font' ? 'span' : tag) : document.createDocumentFragment();
      if (target.nodeType === Node.ELEMENT_NODE) {
        const style = node.style;
        const color = style.color || (tag === 'font' ? node.getAttribute('color') : '');
        if (/^#[0-9a-f]{3,8}$/i.test(color) || /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(color)) target.style.color = color;
        const font = style.fontSize || (tag === 'font' ? ({'2':'12px','3':'14px','4':'16px','5':'18px','6':'20px','7':'24px'}[node.getAttribute('size')] || '') : '');
        if (/^(1[0-9]|2[0-8])px$/.test(font)) target.style.fontSize = font;
        if (style.fontWeight === 'bold' || Number(style.fontWeight) >= 600) target.style.fontWeight = 'bold';
        if (tag === 'ol') {
          if (node.dataset.style === 'decimal-outline') target.dataset.style = 'decimal-outline';
        }
      }
      for (const child of node.childNodes) clean(child,target);
      parent.append(target);
    };
    for (const child of source.content.childNodes) clean(child,output);
    return output.innerHTML;
  }
  function decode(text) {
    try {
      const value = JSON.parse(text);
      if (value?.format === 'rich-html-v1' && typeof value.html === 'string') return sanitize(value.html);
    } catch {}
    const holder = document.createElement('div');
    holder.textContent = text || '';
    return holder.innerHTML;
  }
  async function syncPage() {
    const next = page();
    const key = workbench + ':' + next.key;
    if (key === currentKey) return;
    if (currentKey && editor.innerHTML !== currentHtml && (editor.textContent.trim() || currentHtml)) drafts.set(currentKey,editor.innerHTML);
    savedRange = null;
    currentKey = key;
    title.textContent = (workbench === 'educator' ? '教务工作台/' : workbench === 'sales' ? '销售工作台/' : '') + next.title + '说明';
    editor.innerHTML = drafts.get(key) || emptyList;
    status.textContent = '正在读取…';
    const version = ++requestVersion;
    try {
      const response = await fetch('/__prototype_notes?key=' + encodeURIComponent(key),{cache:'no-store'});
      if (!response.ok) throw new Error('读取失败');
      const record = await response.json();
      if (version !== requestVersion) return;
      currentHtml = decode(record.text || '');
      if (!drafts.has(key)) editor.innerHTML = currentHtml || emptyList;
      status.textContent = drafts.has(key) ? '未保存' : '';
    } catch {
      if (version === requestVersion) status.textContent = '读取失败，请检查本地预览服务';
    }
  }
  editor.addEventListener('input',() => {
    for (const list of editor.querySelectorAll('ol')) {
      if (list.parentElement?.closest('ol')) list.removeAttribute('data-style');
      else list.dataset.style = 'decimal-outline';
    }
    drafts.set(currentKey,editor.innerHTML);
    status.textContent = '未保存';
  });
  document.addEventListener('selectionchange',() => {
    const selection = getSelection();
    if (selection.rangeCount && editor.contains(selection.anchorNode)) savedRange = selection.getRangeAt(0).cloneRange();
  });
  function restoreSelection() {
    editor.focus();
    if (savedRange && editor.contains(savedRange.commonAncestorContainer)) {
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(savedRange);
    }
  }
  function selectedList() {
    let node = getSelection()?.anchorNode;
    if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
    return node?.closest?.('ol') || null;
  }
  function formatSpan(property,value) {
    restoreSelection();
    const selection = getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      editor.style[property] = value;
      return;
    }
    const range = selection.getRangeAt(0);
    const walker = document.createTreeWalker(editor,NodeFilter.SHOW_TEXT);
    const parts = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent || !range.intersectsNode(node)) continue;
      const start = node === range.startContainer ? range.startOffset : 0;
      const end = node === range.endContainer ? range.endOffset : node.length;
      if (end > start) parts.push({node,start,end});
    }
    let last = null;
    for (const {node,start,end} of parts.reverse()) {
      if (end < node.length) node.splitText(end);
      const selected = start ? node.splitText(start) : node;
      const span = document.createElement('span');
      span.style[property] = value;
      selected.before(span);
      span.append(selected);
      if (!last) last = span;
    }
    if (last) {
      const after = document.createRange();
      after.setStartAfter(last); after.collapse(true);
      selection.removeAllRanges(); selection.addRange(after);
    }
    editor.dispatchEvent(new Event('input',{bubbles:true}));
  }
  bold.addEventListener('click',() => { restoreSelection(); document.execCommand('bold'); editor.dispatchEvent(new Event('input',{bubbles:true})); });
  color.addEventListener('input',() => formatSpan('color',color.value));
  fontSize.addEventListener('change',() => { if (fontSize.value) formatSpan('fontSize',fontSize.value + 'px'); });
  editor.addEventListener('keydown',event => {
    const selection = getSelection();
    let anchor = selection?.anchorNode;
    if (anchor?.nodeType === Node.TEXT_NODE) anchor = anchor.parentElement;
    const item = anchor?.closest?.('li');
    const list = item?.closest('ol');
    if (event.key === 'Enter' && !event.shiftKey && item && !item.textContent.trim()) {
      event.preventDefault();
      const next = document.createElement('li');
      next.append(document.createElement('br'));
      item.after(next);
      const range = document.createRange();
      range.selectNodeContents(next); range.collapse(true);
      selection.removeAllRanges(); selection.addRange(range);
      editor.dispatchEvent(new Event('input',{bubbles:true}));
      return;
    }
    const deeper = (event.ctrlKey || event.metaKey) && event.code === 'BracketRight';
    const shallower = (event.ctrlKey || event.metaKey) && event.code === 'BracketLeft';
    const tabIndent = event.key === 'Tab';
    if (!deeper && !shallower && !tabIndent) return;
    if (!list && !deeper && !shallower) return;
    event.preventDefault();
    if (!list) return;
    const outdent = shallower || (tabIndent && event.shiftKey);
    if (outdent && !list.parentElement?.closest('ol')) return;
    if (!outdent && !item.previousElementSibling?.matches('li')) return;
    document.execCommand(outdent ? 'outdent' : 'indent');
    editor.dispatchEvent(new Event('input',{bubbles:true}));
  });
  editor.addEventListener('paste',event => { event.preventDefault(); document.execCommand('insertText',false,event.clipboardData.getData('text/plain')); });
  save.addEventListener('click',async () => {
    const key = currentKey;
    const beforeSave = editor.innerHTML;
    const html = sanitize(beforeSave);
    if (!editor.textContent.trim()) { status.textContent = '请先输入说明'; return; }
    const text = JSON.stringify({format:'rich-html-v1',html});
    save.disabled = true;
    status.textContent = '正在保存…';
    try {
      const response = await fetch('/__prototype_notes?key=' + encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});
      if (!response.ok) throw new Error('保存失败');
      await response.json();
      const unchanged = key === currentKey ? editor.innerHTML === beforeSave : drafts.get(key) === beforeSave;
      if (unchanged) drafts.delete(key);
      if (key === currentKey) {
        currentHtml = html;
        if (unchanged) editor.innerHTML = html;
        status.textContent = unchanged ? '已保存' : '未保存';
      }
    } catch { if (key === currentKey) status.textContent = '保存失败，请重试'; }
    finally { save.disabled = false; }
  });
  let timer;
  new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(syncPage,50); }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden','class','aria-label'],childList:false});
  window.addEventListener('hashchange',syncPage);
  syncPage();
})();
