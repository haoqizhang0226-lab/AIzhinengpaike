const orders = [
  {id:1,course:'授课反馈产品验收-英联邦学科-ALEVEL-商务&会计-1v1-新增',created:'2026-11-02 11:16:55',type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',status:'处理中',finished:'--',applicant:'李春玲',start:'2026-11-05'},
  {id:2,course:'自动匹配班主任-04-英联邦学科-ALEVEL-会计-1v1-新增',created:'2026-10-28 18:01:50',type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',status:'已完成',finished:'2026-10-28 18:10:25',applicant:'李春玲',start:'2026-10-30'},
  {id:3,course:'自动匹配班主任-03-英联邦学科-ALEVEL-商务-1v1-新增',created:'2026-10-28 15:50:33',type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',status:'已完成',finished:'2026-10-28 15:51:29',applicant:'李春玲',start:'2026-10-30'},
  {id:4,course:'自动匹配班主任-02-英联邦学科-ALEVEL-商务-1v1-新增',created:'2026-10-28 14:28:41',type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',status:'已完成',finished:'2026-10-28 14:31:05',applicant:'李春玲',start:'2026-10-30'},
  {id:5,course:'自动匹配班主任-01-英联邦学科-ALEVEL-商务-1v1-新增',created:'2026-10-28 10:25:39',type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',status:'已完成',finished:'2026-10-28 11:13:26',applicant:'李春玲',start:'2026-10-30'},
  {id:6,course:'帮答测试008-英联邦学科-ALEVEL-会计-1v1-新增',created:'2026-10-26 14:55:30',type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',status:'已完成',finished:'2026-10-27 11:04:29',applicant:'李春玲',start:'2026-10-29'},
  {id:7,course:'王发发-英联邦学科-ALEVEL-数学-1v3-新增',created:'2026-10-26 11:16:19',type:'自组班排课单',attribute:'新增排课单',handler:'李春玲',status:'已驳回',finished:'2026-10-29 13:36:21',applicant:'李春玲',start:'2026-11-01'},
  {id:8,course:'授课反馈产品验收-英联邦学科-ALEVEL-会计-1v1-新增',created:'2026-10-20 15:00:58',type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',status:'已完成',finished:'2026-10-20 15:06:29',applicant:'李春玲',start:'2026-10-24'},
  {id:9,course:'授课反馈产品验收-英联邦学科-ALEVEL-会计-1v1-新增',created:'2026-10-20 13:07:55',type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',status:'已完成',finished:'2026-10-20 13:15:14',applicant:'李春玲',start:'2026-10-24'},
  {id:10,course:'授课反馈产品验收-英联邦学科-ALEVEL-商务-1v1-新增',created:'2026-10-20 13:04:37',type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',status:'已驳回',finished:'2026-10-22 18:04:18',applicant:'李春玲',action:'重新申请',start:'2026-10-24'}
];
Object.assign(orders[0],window.smartSchedulingV3DemoOrder);
// 首页十条按设计稿录入；其余页使用同结构的演示记录，便于检验分页交互。
const allOrders=orders.concat(Array.from({length:2014},(_,i)=>({...orders[(i+1)%orders.length],id:i+11})));
const demoOrderStorageKey='teacher-scheduling-v3-full-flow-orders';
function loadDemoOrders(){
  try{
    const current=JSON.parse(localStorage.getItem(demoOrderStorageKey)||'null');
    const saved=Array.isArray(current)?current:JSON.parse(localStorage.getItem('teacher-scheduling-v3-consultant-orders')||'[]');
    const valid=Array.isArray(saved)?saved.filter(order=>order&&Number.isInteger(order.id)&&order.submission&&Array.isArray(order.supplements)):[];
    if(!Array.isArray(current))localStorage.setItem(demoOrderStorageKey,JSON.stringify(valid));
    return valid;
  }catch{return []}
}
allOrders.unshift(...loadDemoOrders());
try{
  const prefix='#flow-return=';
  if(location.hash.startsWith(prefix)){
    const returned=JSON.parse(decodeURIComponent(location.hash.slice(prefix.length)));
    if(returned?.submission&&Number.isInteger(returned.id)&&!allOrders.some(order=>order.id===returned.id))allOrders.unshift(returned);
  }
}catch{}
let nextOrderId=Math.max(...allOrders.map(order=>order.id))+1;
function saveDemoOrders(){
  try{localStorage.setItem(demoOrderStorageKey,JSON.stringify(allOrders.filter(order=>order.submission)))}catch{}
}
const state={tab:'mine',page:1,size:10,filters:{},currentOrderId:null};
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500)}
function readFilters(){state.filters={course:$('courseFilter').value.trim().toLowerCase(),type:$('typeFilter').value,status:$('statusFilter').value,createdFrom:$('createdFrom').value,createdTo:$('createdTo').value,startFrom:$('startFrom').value,startTo:$('startTo').value}}
function filtered(){const f=state.filters;return allOrders.filter(o=>{const created=o.created.slice(0,10);return (!f.course||o.course.toLowerCase().includes(f.course))&&(!f.type||o.type===f.type)&&(!f.status||o.status===f.status)&&(!f.createdFrom||created>=f.createdFrom)&&(!f.createdTo||created<=f.createdTo)&&(!f.startFrom||o.start>=f.startFrom)&&(!f.startTo||o.start<=f.startTo)})}
function renderList(){const rows=filtered(),size=state.size,pageCount=Math.max(1,Math.ceil(rows.length/size));state.page=Math.min(Math.max(1,state.page),pageCount);const shown=rows.slice((state.page-1)*size,state.page*size);$('orderRows').innerHTML=shown.length?shown.map(o=>`<tr><td><a href="?order=${o.id}" data-order="${o.id}" title="${esc(o.course)}">${esc(o.course)}</a></td><td>${esc(o.created)}</td><td>${esc(o.type)}</td><td>${esc(o.attribute)}</td><td>${esc(o.handler)}</td><td>${esc(o.status)}</td><td>${esc(o.finished)}</td><td>${esc(o.applicant)}</td><td>${o.action?`<a href="#" data-action="${o.id}">${esc(o.action)}</a>`:''}</td><td></td></tr>`).join(''):`<tr><td colspan="10" style="height:90px;color:#8c98a9">暂无符合条件的排课单</td></tr>`;$('totalCount').textContent=Object.keys(state.filters).some(k=>state.filters[k])?`共 ${rows.length} 条`:`共 ${allOrders.length} 条`;$('prevPage').disabled=state.page===1;$('nextPage').disabled=state.page===pageCount;$('jumpPage').value=state.page;$('jumpPage').max=pageCount;const numbers=$('pageNumbers');if(!Object.keys(state.filters).some(k=>state.filters[k])&&size===10){numbers.innerHTML=[1,2,3,4,5,6,'…',pageCount].map(n=>n==='…'?'<span>…</span>':`<button class="${state.page===n?'active':''}" data-page="${n}">${n}</button>`).join('')}else{numbers.innerHTML=Array.from({length:pageCount},(_,i)=>`<button class="${state.page===i+1?'active':''}" data-page="${i+1}">${i+1}</button>`).join('')}}
function studentInfo(order){
  if(order.submission)return [
    ['学生编号','VA100078710'],['姓名',order.submission.student],['英文名','--'],['性别','男'],
    ['在读年级','8年级'],['出生日期','--'],['登记年龄','--'],['意向国家','--'],
    ['学生手机','138****9993'],['学生微信','Z****2'],['学生邮箱','--'],['在读学校','上海市建平中学']
  ];
  if(order.id===1)return [
    ['学生编号','VA100078710'],['姓名','授课反馈产品验收'],['英文名','--'],['性别','男'],
    ['在读年级','8年级'],['出生日期','--'],['登记年龄','--'],['意向国家','--'],
    ['学生手机','--'],['学生微信','--'],['学生邮箱','--'],['在读学校','上海市建平中学']
  ];
  return [['学生编号','--'],['姓名',order.course.split('-')[0]],['英文名','--'],['性别','--'],['在读年级','--'],['出生日期','--'],['登记年龄','--'],['意向国家','--'],['学生手机','--'],['学生微信','--'],['学生邮箱','--'],['在读学校','--']];
}
function courseInfo(order){
  if(order.submission)return order.submission.courses.map(course=>[
    'ALEVEL','1v1',course.name,course.board,course.grade,course.module||'--',course.mode,course.campus,
    course.hours,course.historicalTeacher||'--',course.currentTeacher||'--',course.teacherDiscussed||'--','先修'
  ]);
  if(order.id===1)return [
    ['ALEVEL','1v1','商务','OCR','AS','P1','线上','--','10','李春玲 (VA100859)','--','是','先修'],
    ['ALEVEL','1v1','会计','EDX','AS','--','线下','舜元中心','10','李春玲 (VA100859)','--','是','先修']
  ];
  const subject=order.course.includes('数学')?'数学':order.course.includes('会计')?'会计':'商务';
  return [['ALEVEL',order.type==='自组班排课单'?'1v3':'1v1',subject,'--','--','--','线下','--','--','--','--','--','--']];
}
function detailFields(order){
  if(order.submission)return [
    ['排课单状态',order.status],['开课日期',order.submission.start],
    ['结课日期',order.submission.end],['时间要求',order.submission.time],
    ['排课类型',order.submission.type],['要求备注',order.submission.requirement||'--'],
    ['目前校内进度/需要听的知识点','--'],['预计/已报名考试时间','--'],
    ['课程备注','--'],['学习目的','--'],['家庭与学习关系','--'],
    ['偏好上课风格','--'],['性别偏好','--'],['学生学情介绍','--'],['凭证','--']
  ];
  const isFirst=order.id===1;
  return [
    ['排课单状态',isFirst?'待分配':order.status],['开课日期',isFirst?'2026-11-02':order.start],
    ['结课日期',isFirst?'2026-11-18':'--'],['时间要求',isFirst?'模糊排课':'--'],
    ['排课类型',isFirst?'此科目新排':'--'],['要求备注',isFirst?'时间要求字段':'--'],
    ['目前校内进度/需要听的知识点',isFirst?'校内进度字段':'--'],
    ['预计/已报名考试时间',isFirst?'2026-11-02':'--'],
    ['课程备注',isFirst?'课程备注字段':'--'],['学习目的','--'],['家庭与学习关系','--'],
    ['偏好上课风格',isFirst?'<span class="blue-tag">风趣幽默</span>':'--',true],
    ['性别偏好',isFirst?'都可以':'--'],['学生学情介绍','--'],['凭证','--']
  ];
}
function showList(push=true){
  if(push)history.pushState({},'',location.pathname);
  state.currentOrderId=null;
  $('detailBackdrop').hidden=true;
  $('orderDrawer').hidden=true;
  document.body.style.overflow='';
}
function showDetail(id,push=true){
  const order=allOrders.find(o=>o.id===Number(id));
  if(!order){showList(false);return}
  state.currentOrderId=order.id;
  $('handoffEducator').hidden=!order.submission;
  if(push)history.pushState({order:id},'',`?order=${id}`);
  $('drawerTitle').textContent=order.type==='自组班排课单'?'自组班排课单详情':'1V1排课单详情';
  $('studentFields').innerHTML=studentInfo(order).map(([label,value])=>`<div class="student-field"><div class="student-field-label">${esc(label)}</div><div class="student-field-value">${esc(value)}</div></div>`).join('');
  $('detailCourses').innerHTML=courseInfo(order).map(row=>`<tr>${row.map(value=>`<td title="${esc(value)}">${esc(value)}</td>`).join('')}</tr>`).join('');
  $('detailOrderInfo').innerHTML=detailFields(order).map(([label,value,raw],index)=>`<div class="order-info-field ${index>=4?'wide':''}"><span class="order-info-label">${esc(label)}</span><span class="order-info-colon">:</span><span class="order-info-value">${raw?value:esc(value)}</span></div>`).join('');
  const supplements=order.supplements||[];
  $('detailSupplementCard').hidden=supplements.length===0;
  $('detailSupplementList').innerHTML=supplements.map(item=>`<div class="precheck-supplement-item"><div class="precheck-supplement-meta">补充时间：${esc(item.time)}</div><div class="precheck-supplement-content">${esc(item.text)}</div></div>`).join('');
  $('detailBackdrop').hidden=false;
  $('orderDrawer').hidden=false;
  document.body.style.overflow='hidden';
  $('closeOrderDrawer').focus();
}
document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(tab=>{tab.classList.toggle('current',tab===button);tab.setAttribute('aria-selected',tab===button)});state.tab=button.dataset.tab;state.page=1;renderList()}));
$('applyFilters').onclick=()=>{readFilters();state.page=1;renderList()};$('resetFilters').onclick=()=>{document.querySelectorAll('.filters input').forEach(input=>{input.value='';if(input.id!=='courseFilter')input.type='text'});document.querySelectorAll('.filters select').forEach(select=>select.value='');readFilters();state.page=1;renderList()};$('pageSize').onchange=()=>{state.size=Number($('pageSize').value);state.page=1;renderList()};$('prevPage').onclick=()=>{state.page--;renderList()};$('nextPage').onclick=()=>{state.page++;renderList()};$('jumpPage').onchange=()=>{state.page=Number($('jumpPage').value)||1;renderList()};$('pageNumbers').onclick=e=>{const button=e.target.closest('[data-page]');if(button){state.page=Number(button.dataset.page);renderList()}};$('orderRows').onclick=e=>{const order=e.target.closest('[data-order]');if(order){e.preventDefault();showDetail(order.dataset.order);return}const action=e.target.closest('[data-action]');if(action){e.preventDefault();toast('重新申请入口将在后续页面中补充')}};document.querySelector('.table-settings').onclick=()=>toast('表格设置入口示意');window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('order');if(id)showDetail(id,false);else showList(false)});readFilters();const initialOrder=new URLSearchParams(location.search).get('order');renderList();if(initialOrder)showDetail(initialOrder,false);

$('closeOrderDrawer').onclick=()=>showList();
function educatorWorkspaceHref(order){
  return order?.submission?`educator.html#flow-order=${encodeURIComponent(JSON.stringify(order))}`:'educator.html';
}
$('educatorWorkspaceTab').onclick=event=>{
  const order=allOrders.find(item=>item.id===state.currentOrderId&&item.submission)||allOrders.find(item=>item.submission);
  if(order?.submission){event.preventDefault();location.href=educatorWorkspaceHref(order)}
};
$('handoffEducator').onclick=()=>{
  const order=allOrders.find(item=>item.id===state.currentOrderId);
  if(!order?.submission)return;
  location.href=educatorWorkspaceHref(order);
};
$('detailBackdrop').onclick=()=>showList();
$('decryptButton').onclick=()=>toast('学生信息解密入口示意');
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('orderDrawer').hidden)showList()});

function openCreateOrder(){
  $('createOrderPage').hidden=false;
  document.body.style.overflow='hidden';
  $('closeCreateOrder').focus();
}
function closeCreateOrder(){
  $('createOrderPage').hidden=true;
  document.body.style.overflow=$('orderDrawer').hidden?'':'hidden';
}
$('createOrder').onclick=openCreateOrder;
$('closeCreateOrder').onclick=closeCreateOrder;
$('cancelCreateOrder').onclick=closeCreateOrder;
$('createOrderForm').onsubmit=event=>{
  event.preventDefault();
  const submitted=readCreateOrder();
  const order=createDemoOrder(submitted);
  closeAiPrecheck();
  closeCreateOrder();
  showList(false);
  ['courseFilter','typeFilter','statusFilter','createdFrom','createdTo','startFrom','startTo'].forEach(id=>$(id).value='');
  readFilters();state.page=1;renderList();
  toast('排课单已提交，AI 正在分析排课要求');
  setTimeout(()=>{
    const issues=demoPrecheckIssues(submitted);
    order.precheckIssues=issues;
    saveDemoOrders();
    if(issues.length){refreshAiPrecheckList(order.id);toast('AI 发现待确认的排课要求')}
    else toast('AI 排课分析已完成');
  },1600);
};
$('createRequirement').oninput=event=>{
  $('createRequirementCount').textContent=`${event.target.value.length}/500`;
};
document.querySelectorAll('[data-hour-step]').forEach(button=>button.addEventListener('click',()=>{
  const input=button.parentElement.querySelector('input');
  input.value=Math.max(0,Number(input.value||0)+Number(button.dataset.hourStep)).toFixed(1);
}));
window.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!$('createOrderPage').hidden){
    event.stopPropagation();
    closeCreateOrder();
  }
});

let activePrecheckOrderId=null;
const precheckDrafts=new Map();
function currentTimestamp(){
  const now=new Date(),pad=n=>String(n).padStart(2,'0');
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
function createDemoOrder(submission){
  const order={
    id:nextOrderId++,
    course:`${submission.student}-英联邦学科-ALEVEL-${submission.courses.map(course=>course.name).join('&')}-1v1-新增`,
    created:currentTimestamp(),type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',
    status:'处理中',finished:'--',applicant:'李春玲',start:submission.start,submission,supplements:[]
  };
  allOrders.unshift(order);
  saveDemoOrders();
  return order;
}
function readCreateOrder(){
  const form=$('createOrderForm');
  const dates=form.querySelectorAll('.create-date-row input');
  const rows=[...form.querySelectorAll('.create-course-table tbody tr')];
  return {
    student:form.querySelector('.student-name-input').value.trim(),
    package:form.querySelector('.course-package-line select').value,
    start:dates[0].value.trim(),end:dates[1].value.trim(),
    type:form.querySelector('.create-type-row select').value,
    time:form.querySelector('input[name="timeRequirement"]:checked').parentElement.textContent.trim(),
    requirement:$('createRequirement').value.trim(),
    courses:rows.map(row=>{
      const cells=row.querySelectorAll('td');
      return {
        name:cells[0].textContent.trim(),board:cells[1].textContent.trim(),grade:cells[2].textContent.trim(),
        module:cells[3].querySelector('select')?.value||cells[3].textContent.trim(),
        mode:cells[6].textContent.trim(),historicalTeacher:cells[7].textContent.trim(),
        campus:cells[8].querySelector('select')?.value||cells[8].textContent.trim(),
        hours:cells[9].querySelector('input').value,currentTeacher:cells[10].querySelector('input')?.value||'--',
        teacherDiscussed:cells[11].querySelector('select').value
      };
    })
  };
}
function demoPrecheckIssues(order){
  // 原型用截图中的占位要求展示“提交成功后异步发现问题”的场景。
  if(/测试|报错/.test(order.requirement)||order.requirement.length<6){
    return '1、排课要求中的“'+(order.requirement||'空白内容')+'”未说明具体上课安排。请确认是否按开结课日期均匀排课；若有固定、仅限或不可排时段，请一次性补充。';
  }
  return '';
}
function renderAiPrecheck(order,issues){
  $('aiPrecheckStudent').innerHTML=studentInfo(order).slice(0,2).map(([label,value])=>`<div><span>${esc(label==='姓名'?'学生姓名':label)}</span><strong>${esc(value)}</strong></div>`).join('');
  $('aiPrecheckCourses').innerHTML=courseInfo(order).map(row=>`<tr>${row.map(value=>`<td title="${esc(value)}">${esc(value)}</td>`).join('')}</tr>`).join('');
  $('aiPrecheckSummary').innerHTML=detailFields(order).map(([label,value,raw],index)=>`<div class="${index>=4?'wide':''}"><span>${esc(label)}</span><strong>${raw?value:esc(value)}</strong></div>`).join('');
  const numbered=/^\s*(?:\d+|[一二三四五六七八九十]+)[、.．]/;
  const issueText=Array.isArray(issues)?issues.map((issue,index)=>numbered.test(String(issue))?String(issue).trim():`${index+1}、${String(issue).trim()}`).join('\n'):String(issues||'').trim();
  $('aiPrecheckIssueList').textContent=numbered.test(issueText)?issueText:`1、${issueText}`;
  $('aiPrecheckReply').value=precheckDrafts.get(order.id)||'';
  $('aiPrecheckReplyCount').textContent=`${$('aiPrecheckReply').value.length}/1000`;
  $('aiPrecheckReplyError').hidden=true;
}
function pendingAiPrecheckOrders(){
  return allOrders.filter(order=>order.submission&&order.precheckIssues?.length&&!order.supplements?.length);
}
function refreshAiPrecheckList(preferredOrderId=activePrecheckOrderId){
  const pending=pendingAiPrecheckOrders();
  $('aiPrecheckFab').hidden=pending.length===0;
  $('aiPrecheckDot').hidden=pending.length===0;
  $('aiPrecheckFab').setAttribute('aria-label',pending.length?`查看AI排课提示，${pending.length}张排课单待确认`:'AI排课提示，暂无待确认排课单');
  $('aiPrecheckOrderTotal').textContent=`待确认 ${pending.length} 单`;
  $('aiPrecheckOrderSelect').innerHTML=pending.map(order=>`<option value="${order.id}">${esc(order.course)}</option>`).join('');
  const selected=pending.find(order=>order.id===Number(preferredOrderId))||pending[0];
  if(!selected){activePrecheckOrderId=null;closeAiPrecheck();return 0}
  activePrecheckOrderId=selected.id;
  $('aiPrecheckOrderSelect').value=String(selected.id);
  renderAiPrecheck(selected,selected.precheckIssues);
  return pending.length;
}
function openAiPrecheck(){
  if(!refreshAiPrecheckList()){toast('暂无待确认的排课单');return}
  $('aiPrecheckBackdrop').hidden=false;
  $('aiPrecheckDrawer').hidden=false;
  document.body.style.overflow='hidden';
  $('closeAiPrecheck').focus();
}
function closeAiPrecheck(){
  $('aiPrecheckBackdrop').hidden=true;
  $('aiPrecheckDrawer').hidden=true;
  if($('createOrderPage').hidden&&$('orderDrawer').hidden)document.body.style.overflow='';
}
$('aiPrecheckFab').onclick=openAiPrecheck;
$('closeAiPrecheck').onclick=closeAiPrecheck;
$('aiPrecheckBackdrop').onclick=closeAiPrecheck;
$('dismissAiPrecheck').onclick=closeAiPrecheck;
$('aiPrecheckOrderSelect').onchange=event=>refreshAiPrecheckList(event.target.value);
$('aiPrecheckReply').oninput=event=>{
  if(activePrecheckOrderId!==null)precheckDrafts.set(activePrecheckOrderId,event.target.value);
  $('aiPrecheckReplyCount').textContent=`${event.target.value.length}/1000`;
  $('aiPrecheckReplyError').hidden=true;
};
$('submitAiPrecheckReply').onclick=()=>{
  const text=$('aiPrecheckReply').value.trim();
  if(!text){$('aiPrecheckReplyError').hidden=false;$('aiPrecheckReply').focus();return}
  const order=allOrders.find(item=>item.id===activePrecheckOrderId);
  if(!order)return;
  order.supplements.push({time:currentTimestamp(),text});
  saveDemoOrders();
  precheckDrafts.delete(order.id);
  refreshAiPrecheckList();
  toast('补充内容已保存，可在排课单详情中查看');
};
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('aiPrecheckDrawer').hidden)closeAiPrecheck()});
refreshAiPrecheckList();
