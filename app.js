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
const pendingSubmissionStorageKey='teacher-scheduling-v3-pending-submissions';
let pendingSubmissions=[];
try{
  const saved=JSON.parse(localStorage.getItem(pendingSubmissionStorageKey)||'[]');
  if(Array.isArray(saved))pendingSubmissions=saved.filter(draft=>draft?.submission&&draft.precheckIssues?.length);
}catch{}
function savePendingSubmissions(){
  try{localStorage.setItem(pendingSubmissionStorageKey,JSON.stringify(pendingSubmissions))}catch{}
}
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
  if(order.submission){
    const student=order.submission.studentInfo||{};
    return [
      ['学生编号',student.number||order.submission.customerNo||'--'],['姓名',student.name||order.submission.student||'--'],
      ['英文名',student.english||'--'],['性别',student.gender||'--'],['在读年级',student.grade||'--'],
      ['出生日期',student.birthday||'--'],['登记年龄',student.age||'--'],['意向国家',student.country||'--'],
      ['学生手机',student.phone||'--'],['学生微信',student.wechat||'--'],['学生邮箱',student.email||'--'],
      ['在读学校',student.school||'--']
    ];
  }
  if(order.id===1)return [
    ['学生编号','VA100078710'],['姓名','授课反馈产品验收'],['英文名','--'],['性别','男'],
    ['在读年级','8年级'],['出生日期','--'],['登记年龄','--'],['意向国家','--'],
    ['学生手机','--'],['学生微信','--'],['学生邮箱','--'],['在读学校','上海市建平中学']
  ];
  return [['学生编号','--'],['姓名',order.course.split('-')[0]],['英文名','--'],['性别','--'],['在读年级','--'],['出生日期','--'],['登记年龄','--'],['意向国家','--'],['学生手机','--'],['学生微信','--'],['学生邮箱','--'],['在读学校','--']];
}
function courseInfo(order){
  if(order.submission)return order.submission.courses.map(course=>[
    course.item||'ALEVEL',course.classType||'1v1',course.subject||course.name,course.board,course.grade,course.module||'--',course.mode,course.campus,
    course.hours,course.historicalTeacher||'--',course.currentTeacher||'--',course.teacherDiscussed||'--',course.studentResult||'先修'
  ]);
  if(order.id===1)return [
    ['ALEVEL','1v1','商务','OCR','AS','P1','线上','--','10','李春玲 (VA100859)','--','是','先修'],
    ['ALEVEL','1v1','会计','EDX','AS','--','线下','舜元中心','10','李春玲 (VA100859)','--','是','先修']
  ];
  const subject=order.course.includes('数学')?'数学':order.course.includes('会计')?'会计':'商务';
  return [['ALEVEL',order.type==='自组班排课单'?'1v3':'1v1',subject,'--','--','--','线下','--','--','--','--','--','--']];
}
function packageCourseTable(pack,index){
  const courses=pack.courses||[];
  const populated=value=>value!==undefined&&value!==null&&!['','--','/','无'].includes(String(value).trim());
  const fields=[
    ['科目',course=>course.subject||course.name,true],
    ['考试局',course=>course.board],['年级',course=>course.grade],['模块',course=>course.module],
    ['学生水平',course=>course.studentLevel],['期望成绩',course=>course.expectedGrade],
    ['授课模式',course=>course.mode,true],['校区',course=>course.campus],['课时',course=>course.hours,true],
    ['历史授课老师',course=>course.historicalTeacher],['当前授课老师',course=>course.currentTeacher],
    ['老师时间是否已沟通',course=>course.teacherDiscussed]
  ].filter(([,read,required])=>required||courses.some(course=>populated(read(course))));
  return `<section class="detail-package-block"><div class="detail-package-heading"><span class="detail-package-label">${esc(pack.name||`课程包${index+1}`)}</span></div><div class="detail-package-table-scroll"><table style="min-width:${Math.max(650,fields.length*105)}px"><thead><tr>${fields.map(([label])=>`<th>${esc(label)}</th>`).join('')}</tr></thead><tbody>${courses.map(course=>`<tr>${fields.map(([,read])=>`<td title="${esc(read(course)||'--')}">${esc(read(course)||'--')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}
function detailFields(order){
  if(order.submission){
    const extra=order.submission.extra||{};
    const attachments=[...new Set([...(order.submission.requirementAttachments||[]),...(extra.vouchers||[])])];
    const specifiedEnd=order.submission.endMode==='SPECIFIED_DATE'||(!order.submission.endMode&&!!order.submission.end);
    const precise=order.submission.preciseTime;
    const preciseSummary=precise?[
      precise.weekdays?.length?precise.weekdays.map(day=>['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][day]).join('、'):'每天',
      [...(precise.slots||[]),...(precise.custom||[]).map(([start,end])=>`${start}-${end}`)].join('、')
    ].join('；'):'';
    return [
    ['排课单状态',order.status],['开课日期',order.submission.start],
    ['结课日期',specifiedEnd?order.submission.end||'--':'排完全部课程结束'],['时间要求',order.submission.time],...(precise?[['精准排课时段',preciseSummary]]:[]),
    ['排课类型',order.submission.type],['要求备注',order.submission.requirement||'--'],
    ['目前校内进度/需要听的知识点',extra.progress||'--'],['预计/已报名考试时间',extra.examDate||'--'],
    ['课程备注',extra.courseNote||'--'],['学习目的',extra.studyPurposes?.join('、')||'--'],['家庭与学习关系',extra.familyRelation||'--'],
    ['偏好上课风格',extra.teacherStyles?.join('、')||'--'],['性别偏好',extra.teacherGender||'--'],['学生学情介绍','--'],
    ['附件',attachments.join('、')||'--']
  ];
  }
  const isFirst=order.id===1;
  return [
    ['排课单状态',isFirst?'待分配':order.status],['开课日期',isFirst?'2026-11-02':order.start],
    ['结课日期',isFirst?'2026-11-18':'--'],['时间要求',isFirst?'模糊排课':'--'],
    ['排课类型',isFirst?'此科目新排':'--'],['要求备注',isFirst?'时间要求字段':'--'],
    ['目前校内进度/需要听的知识点',isFirst?'校内进度字段':'--'],
    ['预计/已报名考试时间',isFirst?'2026-11-02':'--'],
    ['课程备注',isFirst?'课程备注字段':'--'],['学习目的','--'],['家庭与学习关系','--'],
    ['偏好上课风格',isFirst?'<span class="blue-tag">风趣幽默</span>':'--',true],
    ['性别偏好',isFirst?'都可以':'--'],['学生学情介绍','--'],['附件','--']
  ];
}
let selectedOrderConsultId=null;
function linkedOrderConsults(order){
  const catalog=window.salesConsultBridge?.list()||[];
  return catalog.filter(item=>(item.linkedOrderIds||[]).some(id=>Number(id)===Number(order.id))||order.consultId===item.id);
}
function renderOrderConsultCard(order){
  const linked=linkedOrderConsults(order);
  $('orderConsultBody').innerHTML=linked.length?linked.map(item=>`<button type="button" class="order-consult-plan" data-order-consult="${esc(item.id)}">${esc(item.name)}</button>`).join(''):'<span class="order-consult-empty">暂无关联售前匹配</span>';
}
function closeOrderConsultModal(){
  $('orderConsultModal').hidden=true;
  $('orderConsultModalBackdrop').hidden=true;
  selectedOrderConsultId=null;
}
function openOrderConsultModal(title,content,footer=''){
  $('orderConsultModalTitle').textContent=title;
  $('orderConsultModalContent').innerHTML=content;
  $('orderConsultModalFooter').innerHTML=footer;
  $('orderConsultModalBackdrop').hidden=false;
  $('orderConsultModal').hidden=false;
}
function orderConsultChoices(query=''){
  const term=query.trim().toLowerCase();
  const order=allOrders.find(item=>item.id===state.currentOrderId);
  const linked=order?linkedOrderConsults(order).map(item=>item.id):[];
  const choices=(window.salesConsultBridge?.list()||[]).filter(item=>item.status==='已完成'&&!linked.includes(item.id)&&(!term||(item.name+' '+item.customer).toLowerCase().includes(term)));
  if(!choices.some(item=>item.id===selectedOrderConsultId)){selectedOrderConsultId=null;$('confirmOrderConsultLink').disabled=true}
  $('orderConsultChoices').innerHTML=choices.length?choices.map(item=>`<label class="order-consult-choice"><input type="radio" name="orderConsultChoice" value="${esc(item.id)}" ${selectedOrderConsultId===item.id?'checked':''}><span>${esc(item.name)}</span><small>${esc(item.customer)}</small></label>`).join(''):'<p class="order-consult-modal-empty">暂无可关联的已完成售前匹配</p>';
}
function openOrderConsultLink(){
  selectedOrderConsultId=null;
  openOrderConsultModal('关联售前匹配','<input class="order-consult-search" id="orderConsultSearch" type="search" placeholder="搜索方案名称或客户姓名" aria-label="搜索售前匹配"><div class="order-consult-choices" id="orderConsultChoices"></div>','<button type="button" data-order-consult-cancel>取消</button><button type="button" class="primary" id="confirmOrderConsultLink" disabled>确认关联</button>');
  orderConsultChoices();
  $('orderConsultSearch').focus();
}
function weekdayOf(date){
  const parsed=new Date((date||'')+'T00:00:00');
  return Number.isNaN(parsed.getTime())?'--':['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][parsed.getDay()];
}
function orderConsultLessonRows(item){
  const lessons=item.status==='已完成'?(item.preview?.lessons||[]):[];
  return lessons.slice().sort((a,b)=>(a.date+' '+a.slot).localeCompare(b.date+' '+b.slot)).map(lesson=>{
    const course=item.courses?.[Number(lesson.courseIndex)]||{};
    const start=(lesson.slot||'08:20-10:20').split('-')[0];
    const minutes=Number(start.slice(0,2))*60+Number(start.slice(3,5))+Math.round((Number(lesson.durationHours)||2)*60);
    const end=String(Math.floor(minutes/60)%24).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
    const courseName=course.name||[course.system,course.item,course.subject,course.board,course.grade].filter(Boolean).join('-');
    return `<tr><td>${esc((lesson.date||'')+' '+start+'—'+end)}</td><td>${esc(weekdayOf(lesson.date))}</td><td>${esc(courseName||'--')}</td><td>${esc(String(lesson.teacher||'--').replace(/\([^)]*\)/g,''))}</td><td>${esc(course.mode||'--')}</td><td>${esc((Number(lesson.durationHours)||2)+' 课时')}</td></tr>`;
  }).join('')||'<tr><td colspan="6" class="order-consult-modal-empty">暂无预排课程</td></tr>';
}
function openOrderConsultView(id){
  const item=window.salesConsultBridge?.get(id);
  if(!item){toast('未找到售前匹配');return}
  const content=`<section class="order-consult-view-section"><div class="order-consult-view-fields"><div><small>客户姓名</small><strong>${esc(item.customerDisplay||'--')}</strong></div><div><small>发起人</small><strong>${esc(item.initiatorDisplay||'--')}</strong></div><div><small>发起时间</small><strong>${esc(item.created||'--')}</strong></div><div><small>处理人</small><strong>${esc(item.handlerDisplay||'--')}</strong></div><div><small>处理时间</small><strong>${esc(item.processedAt||'--')}</strong></div></div></section><section class="order-consult-view-section"><h3>预排课表</h3><div class="order-consult-preplan-wrap"><table class="order-consult-preplan-table"><thead><tr><th>上课时间</th><th>星期</th><th>课程</th><th>授课老师</th><th>授课模式</th><th>课节时长</th></tr></thead><tbody>${orderConsultLessonRows(item)}</tbody></table></div></section>`;
  openOrderConsultModal('售前匹配',content,'<button type="button" data-order-consult-cancel>关闭</button>');
}
function showList(push=true){
  if(push)history.pushState({},'',location.pathname);
  state.currentOrderId=null;
  closeOrderConsultModal();
  $('detailBackdrop').hidden=true;
  $('orderDrawer').hidden=true;
  document.body.style.overflow='';
}
function showDetail(id,push=true){
  const order=allOrders.find(o=>o.id===Number(id));
  if(!order){showList(false);return}
  state.currentOrderId=order.id;
  if(push)history.pushState({order:id},'',`?order=${id}`);
  $('drawerTitle').textContent=order.type==='自组班排课单'?'自组班排课单详情':'1V1排课单详情';
  $('studentFields').innerHTML=studentInfo(order).map(([label,value])=>`<div class="student-field"><div class="student-field-label">${esc(label)}</div><div class="student-field-value">${esc(value)}</div></div>`).join('');
  renderOrderConsultCard(order);
  const packages=order.submission?.packages||[];
  document.querySelector('.course-card').classList.toggle('multi-package',packages.length>0);
  $('detailPackages').hidden=packages.length===0;
  $('detailCourseTable').hidden=packages.length>0;
  $('detailPackages').innerHTML=packages.map(packageCourseTable).join('');
  $('detailCourses').innerHTML=courseInfo(order).map(row=>`<tr>${row.map(value=>`<td title="${esc(value)}">${esc(value)}</td>`).join('')}</tr>`).join('');
  const supplements=order.supplements||[];
  $('detailOrderInfo').innerHTML=detailFields(order).map(([label,value,raw],index)=>{
    const field=`<div class="order-info-field ${index>=4?'wide':''}"><span class="order-info-label">${esc(label)}</span><span class="order-info-colon">:</span><span class="order-info-value">${raw?value:esc(value)}</span></div>`;
    if(label!=='要求备注'||!supplements.length)return field;
    const cards=supplements.map(item=>`<div class="order-info-supplement-item"><small>补充时间：${esc(item.time)}</small><div>${esc(item.text)}</div></div>`).join('');
    return field+`<section class="order-info-supplement-card"><h3>补充要求</h3>${cards}</section>`;
  }).join('');
  $('detailBackdrop').hidden=false;
  $('orderDrawer').hidden=false;
  document.body.style.overflow='hidden';
  $('closeOrderDrawer').focus();
}
document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(tab=>{tab.classList.toggle('current',tab===button);tab.setAttribute('aria-selected',tab===button)});state.tab=button.dataset.tab;state.page=1;renderList()}));
$('applyFilters').onclick=()=>{readFilters();state.page=1;renderList()};$('resetFilters').onclick=()=>{document.querySelectorAll('.filters input').forEach(input=>{input.value='';if(input.id!=='courseFilter')input.type='text'});document.querySelectorAll('.filters select').forEach(select=>select.value='');readFilters();state.page=1;renderList()};$('pageSize').onchange=()=>{state.size=Number($('pageSize').value);state.page=1;renderList()};$('prevPage').onclick=()=>{state.page--;renderList()};$('nextPage').onclick=()=>{state.page++;renderList()};$('jumpPage').onchange=()=>{state.page=Number($('jumpPage').value)||1;renderList()};$('pageNumbers').onclick=e=>{const button=e.target.closest('[data-page]');if(button){state.page=Number(button.dataset.page);renderList()}};$('orderRows').onclick=e=>{const order=e.target.closest('[data-order]');if(order){e.preventDefault();showDetail(order.dataset.order);return}const action=e.target.closest('[data-action]');if(action){e.preventDefault();toast('重新申请入口将在后续页面中补充')}};document.querySelector('.table-settings').onclick=()=>toast('表格设置入口示意');window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('order');if(id)showDetail(id,false);else showList(false)});readFilters();const initialOrder=new URLSearchParams(location.search).get('order');renderList();if(initialOrder)showDetail(initialOrder,false);

$('closeOrderDrawer').onclick=()=>showList();
$('orderConsultLinkButton').onclick=openOrderConsultLink;
$('orderConsultBody').addEventListener('click',event=>{const button=event.target.closest('[data-order-consult]');if(button)openOrderConsultView(button.dataset.orderConsult)});
$('orderConsultModalClose').onclick=closeOrderConsultModal;
$('orderConsultModalBackdrop').onclick=closeOrderConsultModal;
$('orderConsultModalContent').addEventListener('input',event=>{if(event.target.id==='orderConsultSearch')orderConsultChoices(event.target.value)});
$('orderConsultModalContent').addEventListener('change',event=>{if(event.target.name==='orderConsultChoice'){selectedOrderConsultId=event.target.value;$('confirmOrderConsultLink').disabled=false}});
$('orderConsultModalFooter').addEventListener('click',event=>{
  if(event.target.closest('[data-order-consult-cancel]')){closeOrderConsultModal();return}
  if(event.target.id!=='confirmOrderConsultLink'||!selectedOrderConsultId)return;
  if(window.salesConsultBridge?.associate(selectedOrderConsultId,state.currentOrderId)){
    const order=allOrders.find(item=>item.id===state.currentOrderId);
    renderOrderConsultCard(order);closeOrderConsultModal();toast('已关联售前匹配');
  }else toast('关联失败，请重试');
});
window.addEventListener('sales-consult-ready',()=>{const order=allOrders.find(item=>item.id===state.currentOrderId);if(order)renderOrderConsultCard(order)});
function educatorWorkspaceHref(order){
  return order?.submission?`教务端/index.html?v=20261110g#flow-order=${encodeURIComponent(JSON.stringify(order))}`:'教务端/index.html?v=20261110g';
}
$('educatorWorkspaceTab').onclick=event=>{
  const order=allOrders.find(item=>item.id===state.currentOrderId&&item.submission)||allOrders.find(item=>item.submission);
  if(order?.submission){event.preventDefault();location.href=educatorWorkspaceHref(order)}
};
$('detailBackdrop').onclick=()=>showList();
$('decryptButton').onclick=()=>toast('学生信息解密入口示意');
window.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(!$('orderConsultModal').hidden)closeOrderConsultModal();else if(!$('orderDrawer').hidden)showList()});

function openCreateOrder(){
  $('createOrderPage').hidden=false;
  document.body.style.overflow='hidden';
  $('closeCreateOrder').focus();
}
function closeCreateOrder(){
  $('createOrderPage').hidden=true;
  window.clearPendingConsultId?.();
  window.createOrderPackages?.reset();
  window.createOrderDetails?.reset();
  document.querySelector('input[name="timeRequirement"][value="vague"]').checked=true;
  document.querySelectorAll('input[name="createPreciseWeekday"],input[name="createPreciseSlot"]').forEach(input=>input.checked=false);
  $('createCustomTimeRows').replaceChildren();
  syncCreateTimeRequirement();
  document.body.style.overflow=$('orderDrawer').hidden?'':'hidden';
}
function syncCreateTimeRequirement(){
  $('createPreciseOptions').hidden=document.querySelector('input[name="timeRequirement"]:checked').value!=='precise';
}
document.querySelectorAll('input[name="timeRequirement"]').forEach(input=>input.addEventListener('change',syncCreateTimeRequirement));
$('createAddCustomTime').addEventListener('click',()=>{
  const row=document.createElement('div');
  row.className='create-custom-time-row';
  row.innerHTML='<span>其它时间：</span><input type="time" step="900" aria-label="其它时间开始"><span>至</span><input type="time" step="900" aria-label="其它时间结束"><button type="button" aria-label="移除其它时间">移除</button>';
  row.querySelector('button').addEventListener('click',()=>row.remove());
  $('createCustomTimeRows').append(row);
  row.querySelector('input').focus();
});
syncCreateTimeRequirement();
function validateCreatePreciseTime(){
  if(document.querySelector('input[name="timeRequirement"]:checked').value!=='precise')return true;
  const standard=[...document.querySelectorAll('input[name="createPreciseSlot"]:checked')];
  const custom=[...$('createCustomTimeRows').querySelectorAll('.create-custom-time-row')];
  if(!standard.length&&!custom.length){toast('请选择上课时间或添加其它时间');return false}
  for(const row of custom){
    const [start,end]=[...row.querySelectorAll('input')].map(input=>input.value);
    const minutes=time=>{const [h,m]=time.split(':').map(Number);return h*60+m};
    if(!start||!end||minutes(end)<=minutes(start)||((minutes(end)-minutes(start))%15)!==0){
      toast('其它时间须填写同一天的起止时间，时长为15分钟的整数倍');return false;
    }
  }
  return true;
}
function syncCreateEndMode(){
  const specified=$('createEndMode').value==='SPECIFIED_DATE';
  document.querySelectorAll('[data-create-end-mode]').forEach(button=>{
    const active=button.dataset.createEndMode===$('createEndMode').value;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  $('createEndDateRow').hidden=!specified;
  $('createEndDate').required=specified;
  $('createEndDate').min=$('createStartDate').value;
  if(!specified)$('createEndDate').value='';
}
document.querySelectorAll('[data-create-end-mode]').forEach(button=>button.addEventListener('click',()=>{
  $('createEndMode').value=button.dataset.createEndMode;
  $('createEndMode').dispatchEvent(new Event('change'));
}));
$('createEndMode').addEventListener('change',syncCreateEndMode);
$('createStartDate').addEventListener('change',syncCreateEndMode);
syncCreateEndMode();
$('createOrder').onclick=openCreateOrder;
$('closeCreateOrder').onclick=closeCreateOrder;
$('cancelCreateOrder').onclick=closeCreateOrder;
$('createOrderForm').onsubmit=event=>{
  event.preventDefault();
  if($('createEndMode').value==='SPECIFIED_DATE'&&(!$('createEndDate').value||$('createEndDate').value<$('createStartDate').value)){
    toast('请选择不早于开课日期的结课日期');
    $('createEndDate').focus();
    return;
  }
  if(!window.createOrderDetails?.validate())return;
  if(!window.createOrderPackages?.validate())return;
  if(!validateCreatePreciseTime())return;
  const submitted=readCreateOrder();
  submitted.consultId=window.getPendingConsultId?.()||null;
  const draft={id:-Date.now(),course:courseNameForSubmission(submitted),status:'待提交',submission:submitted,supplements:[]};
  pendingSubmissions.push(draft);
  activeFormDraftId=draft.id;
  openAiPrecheckLoading(draft);
  setTimeout(()=>{
    if(pendingSubmissions.includes(draft)&&draft.precheckIssues===undefined&&activeAnalysisOrderId===draft.id&&!$('aiPrecheckDrawer').hidden&&$('aiPrecheckDrawer').dataset.mode==='loading'){
      $('aiPrecheckLoadingText').textContent='AI正在分析排课要求，可稍后查看';
      $('deferAiPrecheck').hidden=false;
    }
  },60000);
  setTimeout(()=>{
    if(!pendingSubmissions.includes(draft))return;
    const issues=demoPrecheckIssues(submitted);
    draft.precheckIssues=issues;
    if(!issues.length){
      pendingSubmissions=pendingSubmissions.filter(item=>item!==draft);
      savePendingSubmissions();
      const order=createDemoOrder(submitted);
      if(activeFormDraftId===draft.id){closeCreateOrder();activeFormDraftId=null}
      showList(false);
      ['courseFilter','typeFilter','statusFilter','createdFrom','createdTo','startFrom','startTo'].forEach(id=>$(id).value='');
      readFilters();state.page=1;renderList();
      if(activeAnalysisOrderId===draft.id&&!$('aiPrecheckDrawer').hidden){
        activeAnalysisOrderId=null;
        setAiPrecheckMode('success');
      }
      updateAiPrecheckFab();
      return;
    }
    savePendingSubmissions();
    if(activeAnalysisOrderId===draft.id&&!$('aiPrecheckDrawer').hidden&&$('aiPrecheckDrawer').dataset.mode==='loading'){
      activeAnalysisOrderId=null;
      setAiPrecheckMode('issues');refreshAiPrecheckList(draft.id);
    }else updateAiPrecheckFab();
  },/超时|延迟返回/.test(submitted.requirement)?90000:1600);
};
$('createRequirement').oninput=event=>{
  $('createRequirementCount').textContent=`${event.target.value.length}/500`;
};
window.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!$('createOrderPage').hidden&&$('aiPrecheckDrawer').hidden){
    event.stopPropagation();
    closeCreateOrder();
  }
});

let activePrecheckOrderId=null;
let activeAnalysisOrderId=null;
let activeFormDraftId=null;
const precheckDrafts=new Map();
function setAiPrecheckMode(mode){
  $('aiPrecheckDrawer').dataset.mode=mode;
  $('aiPrecheckLoading').hidden=mode!=='loading';
  $('aiPrecheckBody').hidden=mode!=='issues';
  $('aiPrecheckSuccess').hidden=mode!=='success';
  $('closeAiPrecheck').hidden=mode==='loading';
}
function openAiPrecheckLoading(order){
  activeAnalysisOrderId=order.id;
  $('aiPrecheckLoadingText').textContent='AI正在分析排课要求';
  $('deferAiPrecheck').hidden=true;
  setAiPrecheckMode('loading');
  $('aiPrecheckBackdrop').hidden=false;
  $('aiPrecheckDrawer').hidden=false;
  document.body.style.overflow='hidden';
}
function currentTimestamp(){
  const now=new Date(),pad=n=>String(n).padStart(2,'0');
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
function courseNameForSubmission(submission){
  const packages=submission.packages||[];
  const prefixFor=(pkg,withStudent=true)=>[withStudent?submission.student:'',pkg.system,pkg.item,(pkg.courses||[]).map(course=>course.name).join('&')].filter(Boolean).join('-');
  if(packages.length>1) return `${packages.map((pkg,pi)=>prefixFor(pkg,pi===0)).join('/')}-1V1`;
  if(packages.length===1) return `${prefixFor(packages[0])}-1V1`;
  return `${submission.student}-${submission.courses.map(course=>course.name).join('&')}-1v1-新增`;
}
function createDemoOrder(submission,supplements=[],precheckIssues=''){
  const order={
    id:nextOrderId++,
    course:courseNameForSubmission(submission),
    created:currentTimestamp(),type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',
    status:'处理中',finished:'--',applicant:'李春玲',start:submission.start,submission,supplements,precheckIssues,
    strategyAnalysis:{status:'SUCCESS'}
  };
  allOrders.unshift(order);
  saveDemoOrders();
  document.dispatchEvent(new CustomEvent('formal-order-created',{detail:{order}}));
  return order;
}
function readCreateOrder(){
  const form=$('createOrderForm');
  const details=window.createOrderDetails?.read()||{};
  const packages=[...form.querySelectorAll('[data-package-group]')].map(group=>{
    const name=group.querySelector('.course-package-line select').value;
    const meta=window.createOrderPackages.packageMeta(name);
    const courses=[...group.querySelectorAll('.create-course-table tbody tr')].map(row=>{
      const cells=row.querySelectorAll('td');
      const base=row.createCourseData||row.consultCourse||{};
      const subject=cells[0].textContent.trim();
      return {...base,
        package:name,name:subject,subject,
        system:meta.system||base.system||'英联邦学科',item:meta.item||base.item||'ALEVEL',
        classType:base.classType||'1v1',
        board:cells[1].textContent.trim(),grade:cells[2].textContent.trim(),
        module:cells[3].querySelector('select')?.value??cells[3].textContent.trim(),
        studentLevel:cells[4].querySelector('select')?.value??base.studentLevel??'',
        expectedGrade:cells[5].querySelector('select')?.value??base.expectedGrade??'',
        mode:cells[6].textContent.trim(),historicalTeacher:cells[7].textContent.trim(),
        campus:cells[8].querySelector('select')?.value??cells[8].textContent.trim(),
        hours:cells[9].querySelector('input')?.value||'0',
        currentTeacher:cells[10].querySelector('input')?.value??cells[10].textContent.trim(),
        teacherDiscussed:cells[11].querySelector('select')?.value??cells[11].textContent.trim()
      };
    });
    return {name,system:meta.system||courses[0]?.system||'',item:meta.item||courses[0]?.item||'',courses};
  });
  return {
    student:form.querySelector('.student-name-input').value.trim(),
    ...details,
    package:packages[0]?.name||'',packages,
    start:$('createStartDate').value.trim(),endMode:$('createEndMode').value,
    end:$('createEndMode').value==='SPECIFIED_DATE'?$('createEndDate').value.trim():'',
    type:form.querySelector('.create-type-row select').value,
    time:form.querySelector('input[name="timeRequirement"]:checked').parentElement.textContent.trim(),
    preciseTime:form.querySelector('input[name="timeRequirement"]:checked').value==='precise'?{
      weekdays:[...form.querySelectorAll('input[name="createPreciseWeekday"]:checked')].map(input=>Number(input.value)),
      slots:[...form.querySelectorAll('input[name="createPreciseSlot"]:checked')].map(input=>input.value),
      custom:[...form.querySelectorAll('.create-custom-time-row')].map(row=>[...row.querySelectorAll('input')].map(input=>input.value))
    }:null,
    requirement:form.querySelector('input[name="timeRequirement"]:checked').value==='precise'?'':$('createRequirement').value.trim(),
    courses:packages.flatMap(entry=>entry.courses)
  };
}
function demoPrecheckIssues(order){
  if(order.preciseTime)return '';
  // 原型示例：补充前先检查排课要求，待确认问题处理完成后才发起排课单。
  if(/测试|报错|超时|延迟返回/.test(order.requirement)||order.requirement.length<6){
    return '1、排课要求中的“'+(order.requirement||'空白内容')+'”未说明具体上课安排。请确认是否按开结课日期均匀排课；若有固定、仅限或不可排时段，请一次性补充。';
  }
  return '';
}
function demoSupplementIssues(text){
  const answer=text.trim();
  if(/待定|不确定|不知道|仍有冲突|继续报错/.test(answer)){
    return '1、补充说明仍存在待确认内容。请明确可执行的排课日期、上课频次或时段，再提交排课。';
  }
  if(answer.length<8||!/(按|每周|每月|日期|时间|老师|教师|固定|仅限|不可排|上课|排课|课时|课节|周[一二三四五六日天])/.test(answer)){
    return '1、补充说明尚不足以确定排课安排。请明确是否按开结课日期排课，以及可用的上课频次或时段。';
  }
  return '';
}
function renderAiPrecheck(order,issues){
  $('aiPrecheckStudent').innerHTML=studentInfo(order).filter(([label])=>['学生编号','姓名','在读年级'].includes(label)).map(([label,value])=>`<div><span>${esc(label==='姓名'?'学生姓名':label)}</span><strong>${esc(value)}</strong></div>`).join('');
  $('aiPrecheckCourses').innerHTML=courseInfo(order).map(row=>`<tr>${[0,2,3,4,5,6,7,8,9,10].map(index=>`<td title="${esc(row[index])}">${esc(row[index])}</td>`).join('')}</tr>`).join('');
  $('aiPrecheckSummary').innerHTML=detailFields(order).map(([label,value,raw])=>`<div class="${label==='要求备注'?'wide is-requirement':''}"><span>${esc(label)}</span><strong>${raw?value:esc(value)}</strong></div>`).join('');
  const numbered=/^\s*(?:\d+|[一二三四五六七八九十]+)[、.．]/;
  const issueText=Array.isArray(issues)?issues.map((issue,index)=>numbered.test(String(issue))?String(issue).trim():`${index+1}、${String(issue).trim()}`).join('\n'):String(issues||'').trim();
  $('aiPrecheckIssueList').textContent=issueText?(numbered.test(issueText)?issueText:`1、${issueText}`):'';
  $('aiPrecheckReply').value=precheckDrafts.get(order.id)||'';
  $('aiPrecheckReplyCount').textContent=`${$('aiPrecheckReply').value.length}/1000`;
  $('aiPrecheckReplyError').hidden=true;
}
function pendingAiPrecheckOrders(){
  return pendingSubmissions.filter(draft=>draft.precheckIssues?.length);
}
function updateAiPrecheckFab(){
  const pending=pendingAiPrecheckOrders();
  $('aiPrecheckFab').hidden=pending.length===0;
  $('aiPrecheckDot').hidden=pending.length===0;
  $('aiPrecheckFab').setAttribute('aria-label',pending.length?`查看AI排课提示，${pending.length}张待提交排课单待确认`:'AI排课提示，暂无待确认排课单');
  return pending;
}
function refreshAiPrecheckList(preferredOrderId=activePrecheckOrderId){
  const pending=updateAiPrecheckFab();
  const selected=pending.find(order=>order.id===Number(preferredOrderId))||pending[0];
  if(!selected){activePrecheckOrderId=null;closeAiPrecheck();return 0}
  activePrecheckOrderId=selected.id;
  const switcher=$('aiPrecheckDraftSwitch');
  switcher.replaceChildren(...pending.map(draft=>new Option(draft.course,String(draft.id))));
  switcher.value=String(selected.id);
  switcher.hidden=pending.length<2||activeFormDraftId!==null;
  renderAiPrecheck(selected,selected.precheckIssues);
  return pending.length;
}
function openAiPrecheck(preferredOrderId=null){
  if(!refreshAiPrecheckList(preferredOrderId)){toast('暂无待确认的排课单');return}
  activeAnalysisOrderId=null;
  setAiPrecheckMode('issues');
  $('aiPrecheckBackdrop').hidden=false;
  $('aiPrecheckDrawer').hidden=false;
  document.body.style.overflow='hidden';
  $('closeAiPrecheck').focus();
}
function closeAiPrecheck(){
  activeAnalysisOrderId=null;
  $('aiPrecheckBackdrop').hidden=true;
  $('aiPrecheckDrawer').hidden=true;
  if($('createOrderPage').hidden&&$('orderDrawer').hidden)document.body.style.overflow='';
}
function cancelAiPrecheck(){
  const editingForm=activeFormDraftId!==null;
  const draftId=activeFormDraftId??activePrecheckOrderId;
  if($('aiPrecheckDrawer').dataset.mode==='issues'&&draftId!==null){
    pendingSubmissions=pendingSubmissions.filter(draft=>draft.id!==draftId);
    precheckDrafts.delete(draftId);
    if(activeFormDraftId===draftId)activeFormDraftId=null;
    savePendingSubmissions();
    updateAiPrecheckFab();
  }
  if(!editingForm)window.clearPendingConsultId?.();
  closeAiPrecheck();
}
$('aiPrecheckFab').onclick=()=>openAiPrecheck();
$('closeAiPrecheck').onclick=()=>{if($('aiPrecheckDrawer').dataset.mode!=='loading'){if(activeFormDraftId!==null)cancelAiPrecheck();else closeAiPrecheck()}};
$('aiPrecheckBackdrop').onclick=()=>{if($('aiPrecheckDrawer').dataset.mode!=='loading'){if(activeFormDraftId!==null)cancelAiPrecheck();else closeAiPrecheck()}};
$('deferAiPrecheck').onclick=()=>{
  closeAiPrecheck();
  if(activeFormDraftId!==null){closeCreateOrder();activeFormDraftId=null;window.clearPendingConsultId?.();showList(false)}
};
$('dismissAiPrecheck').onclick=cancelAiPrecheck;
$('closeAiPrecheckSuccess').onclick=closeAiPrecheck;
$('aiPrecheckDraftSwitch').onchange=event=>refreshAiPrecheckList(event.target.value);
$('aiPrecheckReply').oninput=event=>{
  if(activePrecheckOrderId!==null)precheckDrafts.set(activePrecheckOrderId,event.target.value);
  $('aiPrecheckReplyCount').textContent=`${event.target.value.length}/1000`;
  $('aiPrecheckReplyError').hidden=true;
};
$('submitAiPrecheckReply').onclick=()=>{
  const text=$('aiPrecheckReply').value.trim();
  if(!text){$('aiPrecheckReplyError').hidden=false;$('aiPrecheckReply').focus();return}
  const draft=pendingSubmissions.find(item=>item.id===activePrecheckOrderId);
  if(!draft)return;
  openAiPrecheckLoading(draft);
  setTimeout(()=>{
    if(!pendingSubmissions.includes(draft))return;
    const issues=demoSupplementIssues(text);
    if(issues){
      draft.precheckIssues=issues;
      savePendingSubmissions();
      activeAnalysisOrderId=null;
      setAiPrecheckMode('issues');
      refreshAiPrecheckList(draft.id);
      return;
    }
    createDemoOrder(draft.submission,[{time:currentTimestamp(),text}],draft.precheckIssues);
    pendingSubmissions=pendingSubmissions.filter(item=>item!==draft);
    savePendingSubmissions();
    precheckDrafts.delete(draft.id);
    if(activeFormDraftId===draft.id){closeCreateOrder();activeFormDraftId=null}
    showList(false);
    ['courseFilter','typeFilter','statusFilter','createdFrom','createdTo','startFrom','startTo'].forEach(id=>$(id).value='');
    readFilters();state.page=1;renderList();updateAiPrecheckFab();
    activeAnalysisOrderId=null;
    setAiPrecheckMode('success');
  },1600);
};
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('aiPrecheckDrawer').hidden&&$('aiPrecheckDrawer').dataset.mode!=='loading'){if(activeFormDraftId!==null)cancelAiPrecheck();else closeAiPrecheck()}});
refreshAiPrecheckList();
