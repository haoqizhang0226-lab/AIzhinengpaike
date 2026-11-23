(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const seeds = [
    ['01077801261114-0074','宇-英联邦学科-ALEVEL-高数-1v1','待排课','2026-11-14','1v1','张浩宇(S100994384)','英联邦学科','ALEVEL','--'],
    ['01077801261114-0075','虚拟订单超时关闭-英联邦学科-ALEVEL-数学-1v1','已关闭','2026-11-14','1v1','示例学员(S100994385)','英联邦学科','ALEVEL','--',0],
    ['02110501261114-0004','溪-橡沐学科-AP-微观经济-1v1','新班','2026-11-21','1v1','蒋亦涵(S100968303)','橡沐学科','AP','李坤言(VA000812)'],
    ['070119201261114-0004','全日制学科-全日制学科-数学-1v1','待排课','2027-02-22','1v1','彭梓璐(S101232865)','全日制学科','全日制学科','--'],
    ['01077801261114-0073','en-英联邦学科-ALEVEL-化学&数学-1v1','待排课','2026-11-14','1v1','冯嘉成Kayden(S100197020)','英联邦学科','ALEVEL','--'],
    ['06055101261114-0010','剑-模拟面试非牛剑-IC生物医学工程-1v1','待排课','2026-11-14','1v1','张子越(S103412208)','高端牛剑','模拟面试非牛剑','--'],
    ['02128301261114-0002','语培-托福-口语&阅读&听力&写作-1v1','待排课','2026-11-14','1v1','高家锐(S101052250)','橡沐语培','托福','--'],
    ['01077801261114-0072','俞-英联邦学科-ALEVEL-经济-1v1','待排课','2026-11-14','1v1','张哲瑜(S102394731)','英联邦学科','ALEVEL','--'],
    ['02110501261114-0003','橡沐学科-AP-微观经济&微积分ab&心理-1v1','待排课','2026-11-14','1v1','Kristine李奕江(S103521282)','橡沐学科','AP','--'],
    ['02111415261114-0001','橡沐学科-IBHL-英文A-1v1试听','新班','2026-11-14','1v1试听','史思祺(S100456021)','橡沐学科','IBHL','陈美玲(VA000262)'],
    ['01077801261114-0071','Jason-英联邦学科-ALEVEL-高数-1v1','新班','2027-01-03','1v1','张恒梓雯Jason(S101113148)','英联邦学科','ALEVEL','杨舒晴(VA000591)']
  ];
  const seedRows = seeds.map(([number,name,status,start,classType,student,system,item,teacher,studentCount=1]) => ({number,name,status,start,classType,student,system,item,teacher,studentCount}));
  const homeroomKey = 'teacher-scheduling-v32-class-homerooms';
  let page = 1;
  let pageSize = 10;
  let filters = {};
  const selected = new Set();
  let editingNumbers = [];
  let noticeTimer;
  const notice = message => {
    let element = $('#classManagementNotice');
    if (!element) {element=document.createElement('div');element.id='classManagementNotice';element.className='class-management-notice';document.body.append(element);}
    element.textContent=message;element.classList.add('show');
    clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>element.classList.remove('show'),2400);
  };
  const readJson = (key,fallback) => {try {const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback;} catch {return fallback;}};
  const allRows = () => {
    const orders=readJson('teacher-scheduling-v3-full-flow-orders',[]);
    const saved=readJson('teacher-scheduling-v3-self-classes',[]);
    const teachers=readJson(homeroomKey,{});
    const created=(Array.isArray(saved)?saved:[]).map(row=>{
      const order=(Array.isArray(orders)?orders:[]).find(item=>item.classNumber===row.number||item.className===row.name);
      const draft=order?.submission?.selfClass||{};
      return {number:row.number,name:row.name,status:row.status,start:order?.submission?.start||draft.start||'--',classType:row.classType||row.type,student:(draft.students||[]).join('、')||'--',system:draft.system||'--',item:draft.item||'--',teacher:row.teacher||'--',studentCount:row.students||0};
    });
    return [...created,...seedRows].map(row=>({...row,teacher:teachers[row.number]||row.teacher||'--'}));
  };
  const filteredRows = () => allRows().filter(row => {
    const text=(value,query)=>String(value||'').toLowerCase().includes(String(query||'').trim().toLowerCase());
    const assigned=row.teacher!=='--'&&row.teacher!=='无';
    return text(row.name,filters.name)&&text(row.number,filters.number)&&(!filters.status||row.status===filters.status)
      &&(!filters.classType||row.classType===filters.classType||filters.classType==='自组班'&&row.classType.startsWith('1v')&&row.name.includes('-新增'))
      &&(!filters.homeroomStatus||filters.homeroomStatus===(assigned?'已分配':'待分配'));
  });
  const buttonPages = total => {
    const buttons=[];
    for(let index=1;index<=Math.min(6,total);index++)buttons.push(`<button type="button" data-class-page="${index}" ${index===page?'class="active" aria-current="page"':''}>${index}</button>`);
    if(total>7)buttons.push('<span>…</span>',`<button type="button" data-class-page="${total}">${total}</button>`);
    return `<button type="button" data-class-page="${Math.max(1,page-1)}" ${page===1?'disabled':''}>‹</button>${buttons.join('')}<button type="button" data-class-page="${Math.min(total,page+1)}" ${page===total?'disabled':''}>›</button>`;
  };
  function render() {
    const rows=filteredRows();
    const pages=Math.max(1,Math.ceil(rows.length/pageSize));
    page=Math.min(Math.max(1,page),pages);
    const current=rows.slice((page-1)*pageSize,page*pageSize);
    $('#classManagementRows').innerHTML=current.length?current.map(row=>{
      const teacher=row.teacher==='无'?'--':row.teacher;
      const assigned=teacher!=='--';
      const remark=window.smartClassRemark?.(row)||'--';
      return `<tr><td><input type="checkbox" data-class-select="${escapeHtml(row.number)}" aria-label="选择${escapeHtml(row.name)}" ${selected.has(row.number)?'checked':''}></td><td><button type="button" class="class-management-number" data-class-view="${escapeHtml(row.number)}">${escapeHtml(row.number)}</button></td><td title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</td><td>${escapeHtml(row.status)}</td><td>${escapeHtml(row.start)}</td><td>${escapeHtml(row.classType)}</td><td>${escapeHtml(row.studentCount)}</td><td title="${escapeHtml(row.student)}">${escapeHtml(row.student)}</td><td>${escapeHtml(row.system)}</td><td>${escapeHtml(row.item)}</td><td>${assigned?'已分配':'待分配'}</td><td>${escapeHtml(teacher)}</td><td class="class-management-remark" title="${escapeHtml(remark)}">${escapeHtml(remark)}</td><td><button type="button" class="class-management-action" data-class-edit="${escapeHtml(row.number)}">${assigned?'修改班主任':'关联班主任'}</button></td><td></td></tr>`;
    }).join(''):'<tr><td colspan="15" class="class-management-empty">暂无符合条件的班级</td></tr>';
    $('#classSelectAll').checked=!!current.length&&current.every(row=>selected.has(row.number));
    $('#classSelectAll').indeterminate=current.some(row=>selected.has(row.number))&&!$('#classSelectAll').checked;
    $('#classManagementPages').innerHTML=buttonPages(pages);
    $('#classManagementTotal').textContent=`共 ${rows.length} 条`;
    $('#classManagementJump').max=String(pages);
    $('#classManagementJump').value=String(page);
  }
  const openEditor = numbers => {
    if(!numbers.length){notice('请先选择班级');return;}
    editingNumbers=numbers;
    let modal=$('#classHomeroomModal');
    if(!modal){modal=document.createElement('div');modal.id='classHomeroomModal';modal.className='class-management-modal-backdrop';modal.innerHTML='<section class="class-management-modal" role="dialog" aria-modal="true" aria-labelledby="classHomeroomTitle"><header><strong id="classHomeroomTitle">修改班课班主任</strong><button type="button" data-class-close aria-label="关闭">×</button></header><label>班课班主任<input id="classHomeroomInput" type="text" placeholder="请输入班主任姓名或工号"></label><footer><button type="button" data-class-close>取消</button><button type="button" class="primary" id="classHomeroomSave">确认</button></footer></section>';document.body.append(modal);modal.addEventListener('click',event=>{if(event.target===modal||event.target.closest('[data-class-close]'))modal.hidden=true;if(event.target.id==='classHomeroomSave'){const name=$('#classHomeroomInput').value.trim();if(!name){notice('请输入班课班主任');return;}const values=readJson(homeroomKey,{});editingNumbers.forEach(number=>values[number]=name);localStorage.setItem(homeroomKey,JSON.stringify(values));modal.hidden=true;selected.clear();render();notice('班课班主任已更新');}});}
    $('#classHomeroomInput').value='';modal.hidden=false;$('#classHomeroomInput').focus();
  };
  $('#classManagementFilters').addEventListener('submit',event=>{event.preventDefault();filters=Object.fromEntries(new FormData(event.currentTarget).entries());page=1;selected.clear();render();});
  $('#classManagementFilters').addEventListener('reset',()=>{filters={};page=1;selected.clear();setTimeout(render,0);});
  $('#classManagementRows').addEventListener('click',event=>{const edit=event.target.closest('[data-class-edit]');if(edit){openEditor([edit.dataset.classEdit]);return;}const view=event.target.closest('[data-class-view]');if(view){const row=allRows().find(item=>item.number===view.dataset.classView);if(row)notice(`班级：${row.name}`);}});
  $('#classManagementRows').addEventListener('change',event=>{const checkbox=event.target.closest('[data-class-select]');if(!checkbox)return;checkbox.checked?selected.add(checkbox.dataset.classSelect):selected.delete(checkbox.dataset.classSelect);render();});
  $('#classSelectAll').addEventListener('change',event=>{filteredRows().slice((page-1)*pageSize,page*pageSize).forEach(row=>event.target.checked?selected.add(row.number):selected.delete(row.number));render();});
  $('#classManagementPages').addEventListener('click',event=>{const button=event.target.closest('[data-class-page]');if(button){page=Number(button.dataset.classPage);render();}});
  $('#classManagementPageSize').addEventListener('change',event=>{pageSize=Number(event.target.value);page=1;render();});
  $('#classManagementJump').addEventListener('change',event=>{page=Number(event.target.value)||1;render();});
  $('#classBulkHomeroom').addEventListener('click',()=>openEditor([...selected]));
  $('#classConflictCheck').addEventListener('click',()=>notice('全域冲突检测已完成'));
  $('#classColumnSettings').addEventListener('click',()=>notice('当前显示全部班级字段'));
  window.renderEducatorClasses=render;
  render();
})();
