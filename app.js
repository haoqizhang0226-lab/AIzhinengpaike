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
const homeroomOrderEmbed=document.documentElement.classList.contains('embedded-homeroom-order');
function notifyHomeroomOrder(kind,order){
  window.parent.postMessage({kind,order},location.origin);
}
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
if(!homeroomOrderEmbed)allOrders.unshift(...loadDemoOrders());
const combinedDemoSubmission={
  ...orders[0].submission,
  packages:[
    {name:'英联邦学科-ALEVEL-1V1',system:'英联邦学科',item:'ALEVEL',courses:[orders[0].submission.courses[0]]},
    {name:'英联邦学科-GCSE-1V1',system:'英联邦学科',item:'GCSE',courses:[{name:'数学',board:'CAIE',grade:'IG',mode:'线上',hours:'8'}]}
  ]
};
combinedDemoSubmission.courses=combinedDemoSubmission.packages.flatMap(pack=>pack.courses);
allOrders.splice(allOrders.indexOf(orders[0])+1,0,{
  ...orders[0],id:-1,orderNumber:'PK202611020001-C',course:courseNameForSubmission(combinedDemoSubmission),submission:combinedDemoSubmission
});
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
  const saved=homeroomOrderEmbed?[]:JSON.parse(localStorage.getItem(pendingSubmissionStorageKey)||'[]');
  if(Array.isArray(saved))pendingSubmissions=saved.filter(draft=>draft?.submission&&draft.precheckIssues?.length);
}catch{}
function savePendingSubmissions(){
  if(homeroomOrderEmbed)return;
  try{localStorage.setItem(pendingSubmissionStorageKey,JSON.stringify(pendingSubmissions.filter(draft=>!draft.demoPreview)))}catch{}
}
function saveDemoOrders(){
  try{localStorage.setItem(demoOrderStorageKey,JSON.stringify(allOrders.filter(order=>order.id!==-1&&order.submission)))}catch{}
}
const state={tab:'mine',page:1,size:10,filters:{},currentOrderId:null,orderMode:'individual'};
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500)}
function orderNumber(order){return order.orderNumber||order.orderNo||`PK${String(order.created||'').slice(0,10).replace(/\D/g,'')}${String(order.id).padStart(4,'0')}`}
function packagesForList(order){return (order.submission?.packages||[]).filter(pack=>pack.courses?.length)}
function suborderForPackage(order,pack,index){
  return {
    ...order,
    packageIndex:index,
    orderNumber:`${orderNumber(order)}-${index+1}`,
    course:courseNameForSubmission({...order.submission,packages:[pack]})
  };
}
function orderListEntries(){
  return allOrders.flatMap(order=>{
    const packages=packagesForList(order);
    if(state.orderMode==='combined')return packages.length>1?[order]:[];
    if(packages.length<2)return [order];
    return packages.map((pack,index)=>suborderForPackage(order,pack,index));
  });
}
function orderDetailHref(order){
  const params=new URLSearchParams({order:order.id});
  if(order.packageIndex!==undefined)params.set('package',order.packageIndex+1);
  return `?${params}`;
}
function readFilters(){state.filters={number:$('orderNumberFilter').value.trim().toLowerCase(),name:$('orderNameFilter').value.trim().toLowerCase(),type:$('typeFilter').value,status:$('statusFilter').value,createdFrom:$('createdFrom').value,createdTo:$('createdTo').value,startFrom:$('startFrom').value,startTo:$('startTo').value}}
function filtered(){const f=state.filters;return orderListEntries().filter(o=>{const created=o.created.slice(0,10);return (!f.number||orderNumber(o).toLowerCase().includes(f.number))&&(!f.name||String(o.course||o.name||'').toLowerCase().includes(f.name))&&(!f.type||o.type===f.type)&&(!f.status||o.status===f.status)&&(!f.createdFrom||created>=f.createdFrom)&&(!f.createdTo||created<=f.createdTo)&&(!f.startFrom||o.start>=f.startFrom)&&(!f.startTo||o.start<=f.startTo)})}
function renderList(){
  const rows=filtered(),size=state.size,pageCount=Math.max(1,Math.ceil(rows.length/size));
  const combined=state.orderMode==='combined';
  const label=combined?'组合排课单':'排课单';
  state.page=Math.min(Math.max(1,state.page),pageCount);
  const shown=rows.slice((state.page-1)*size,state.page*size);
  $('orderRows').innerHTML=shown.length?shown.map(o=>`<tr><td>${esc(orderNumber(o))}</td><td><a href="${esc(orderDetailHref(o))}" data-order="${o.id}" title="${esc(o.course)}">${o.packageIndex!==undefined?'<span class="order-origin-badge">组合</span>':''}${esc(o.course)}</a></td><td>${esc(o.created)}</td><td>${esc(o.type)}</td><td>${esc(o.attribute)}</td><td>${esc(o.handler)}</td><td>${esc(o.status)}</td><td>${esc(o.finished)}</td><td>${esc(o.applicant)}</td><td>${o.action?`<a href="#" data-action="${o.id}">${esc(o.action)}</a>`:''}</td><td></td></tr>`).join(''):`<tr><td colspan="11" style="height:90px;color:#8c98a9">暂无符合条件的${label}</td></tr>`;
  $('totalCount').textContent=`共 ${rows.length} 条`;
  $('prevPage').disabled=state.page===1;
  $('nextPage').disabled=state.page===pageCount;
  $('jumpPage').value=state.page;
  $('jumpPage').max=pageCount;
  const pageNumbers=Array.from({length:Math.min(6,pageCount)},(_,index)=>index+1);
  if(pageCount>6){
    if(state.page>6&&state.page<pageCount)pageNumbers.push(state.page);
    if(pageCount>pageNumbers.at(-1)+1)pageNumbers.push('…');
    pageNumbers.push(pageCount);
  }
  $('pageNumbers').innerHTML=pageNumbers.map(n=>n==='…'?'<span>…</span>':`<button class="${state.page===n?'active':''}" data-page="${n}">${n}</button>`).join('');
}
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
function displayPackages(order){
  const student=new Map(studentInfo(order)).get('姓名')||'学生';
  if(order.submission?.packages?.length)return order.submission.packages.filter(pack=>pack.courses?.length).map(pack=>{
    const courses=pack.courses;
    const subjects=[...new Set(courses.map(course=>course.subject||course.name).filter(Boolean))].join('&');
    const first=courses[0]||{};
    const name=[student,pack.system||first.system||'英联邦学科',pack.item||first.item||'ALEVEL',subjects,(first.classType||'1v1').toUpperCase()].filter(Boolean).join('-');
    return {...pack,name};
  });
  return courseInfo(order).map((row,index)=>({
    name:[student,'英联邦学科',row[0],row[2],order.type==='自组班排课单'?'1V3':'1V1'].filter(Boolean).join('-'),
    courses:[{subject:row[2],board:row[3],grade:row[4],module:row[5],studentLevel:row[12],mode:row[6],campus:row[7],hours:row[8],historicalTeacher:row[9]}]
  }));
}
function packageCourseTable(pack,index,suborder){
  const courses=pack.courses||[];
  const fields=[
    ['科目',course=>course.subject||course.name],['考试局',course=>course.board],
    ['年级',course=>course.grade],['模块',course=>course.module],
    ['学生水平',course=>course.studentLevel||course.studentResult],
    ['授课模式',course=>course.mode],['校区',course=>course.campus],
    ['课时',course=>course.hours],['历史授课老师',course=>course.historicalTeacher]
  ];
  const heading=suborder
    ? `<span class="detail-package-label">排课单名称：<a class="combined-suborder-link" href="${esc(orderDetailHref(suborder))}" data-suborder="${suborder.packageIndex+1}">${esc(suborder.course)}</a></span>`
    : `<span class="detail-package-label">${esc(pack.name||`课程包${index+1}`)}</span>`;
  return `<section class="detail-package-block"><div class="detail-package-heading"><span class="detail-package-icon" aria-hidden="true">▣</span>${heading}</div><div class="detail-package-table-scroll"><table><thead><tr>${fields.map(([label])=>`<th>${esc(label)}</th>`).join('')}</tr></thead><tbody>${courses.map(course=>`<tr>${fields.map(([,read])=>{const value=read(course)||'--';return `<td title="${esc(value)}">${esc(value)}</td>`}).join('')}</tr>`).join('')||'<tr><td colspan="9">暂无课程</td></tr>'}</tbody></table></div></section>`;
}
function renderOrderInfo(order){
  const firstSample=!order.submission&&order.id===1;
  const submission=order.submission||(firstSample?{
    start:'2026-11-02',end:'2026-11-18',type:'此科目新排',time:'模糊排课',requirement:'时间要求字段',
    extra:{progress:'校内进度字段',examDate:'2026-11-02',courseNote:'课程备注字段',teacherStyles:['风趣幽默'],teacherGender:'都可以'}
  }:{start:order.start,endMode:'SPECIFIED_DATE'});
  const field=([label,value,{compact,attachment}={}])=>{
    const shown=attachment&&value&&value!=='--'? `<span class="order-info-attachment">♧ ${esc(value)}</span>`:esc(value||'--');
    return `<div class="order-info-field${compact?'':' wide'}"><span class="order-info-label">${esc(label)}</span><span class="order-info-colon">:</span><span class="order-info-value">${shown}</span></div>`;
  };
  const groups=window.orderAnalysisSummary.fieldGroups({submission,supplements:order.supplements});
  const overview={title:'排课单详情',fields:[['排课单状态',firstSample?'待分配':order.status]]};
  $('detailOrderInfo').innerHTML=[overview,...groups].map(({title,fields})=>
    `<section class="drawer-card order-info-card"><div class="drawer-card-title"><strong>${title}</strong></div><div class="order-info-grid">${fields.map(field).join('')}</div></section>`).join('');
}
let selectedOrderConsultId=null;
function linkedOrderConsults(order){
  const catalog=window.salesConsultBridge?.list()||[];
  return catalog.filter(item=>(item.linkedOrderIds||[]).some(id=>Number(id)===Number(order.id))||order.consultId===item.id);
}
function renderOrderConsultCard(order){
  const linked=linkedOrderConsults(order);
  $('orderConsultBody').innerHTML=linked.length?linked.map(item=>`<button type="button" class="order-consult-plan" data-order-consult="${esc(item.id)}">${esc(item.name)}</button>`).join(''):'<span class="order-consult-empty">暂无关联售前咨单</span>';
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
  $('orderConsultChoices').innerHTML=choices.length?choices.map(item=>`<label class="order-consult-choice"><input type="radio" name="orderConsultChoice" value="${esc(item.id)}" ${selectedOrderConsultId===item.id?'checked':''}><span>${esc(item.name)}</span><small>${esc(item.customer)}</small></label>`).join(''):'<p class="order-consult-modal-empty">暂无可关联的已完成售前咨单</p>';
}
function openOrderConsultLink(){
  selectedOrderConsultId=null;
  openOrderConsultModal('关联售前咨单','<input class="order-consult-search" id="orderConsultSearch" type="search" placeholder="搜索方案名称或客户姓名" aria-label="搜索售前咨单"><div class="order-consult-choices" id="orderConsultChoices"></div>','<button type="button" data-order-consult-cancel>取消</button><button type="button" class="primary" id="confirmOrderConsultLink" disabled>确认关联</button>');
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
  if(!item){toast('未找到售前咨单');return}
  const content=`<section class="order-consult-view-section"><div class="order-consult-view-fields"><div><small>客户姓名</small><strong>${esc(item.customerDisplay||'--')}</strong></div><div><small>发起人</small><strong>${esc(item.initiatorDisplay||'--')}</strong></div><div><small>发起时间</small><strong>${esc(item.created||'--')}</strong></div><div><small>处理人</small><strong>${esc(item.handlerDisplay||'--')}</strong></div><div><small>处理时间</small><strong>${esc(item.processedAt||'--')}</strong></div></div></section><section class="order-consult-view-section"><h3>预排课表</h3><div class="order-consult-preplan-wrap"><table class="order-consult-preplan-table"><thead><tr><th>上课时间</th><th>星期</th><th>课程</th><th>授课老师</th><th>授课模式</th><th>课节时长</th></tr></thead><tbody>${orderConsultLessonRows(item)}</tbody></table></div></section>`;
  openOrderConsultModal('售前咨单',content,'<button type="button" data-order-consult-cancel>关闭</button>');
}
function showList(push=true){
  if(push)history.pushState({},'',location.pathname);
  state.currentOrderId=null;
  closeOrderConsultModal();
  $('detailBackdrop').hidden=true;
  $('orderDrawer').hidden=true;
  document.body.style.overflow='';
}
function showDetail(id,push=true,packageNumber=null){
  const order=allOrders.find(o=>o.id===Number(id));
  if(!order){showList(false);return}
  const packages=packagesForList(order);
  const packageIndex=packageNumber===null?undefined:Number(packageNumber)-1;
  if(packageIndex!==undefined&&!packages[packageIndex]){showList(false);return}
  state.currentOrderId=order.id;
  if(push)history.pushState({},'',orderDetailHref({...order,packageIndex}));
  $('drawerTitle').textContent=order.type==='自组班排课单'?'自组班排课单详情':packages.length>1&&packageIndex===undefined?'组合排课单详情':'1v1排课单详情';
  const student=new Map(studentInfo(order));
  const studentLabels=[['学生姓名','姓名'],['学生编号','学生编号'],['性别','性别'],['出生日期','出生日期'],['登记年龄','登记年龄'],['学生手机','学生手机'],['学生微信','学生微信'],['学生邮箱','学生邮箱'],['在读学校','在读学校'],['在读年级','在读年级']];
  $('studentFields').innerHTML=studentLabels.map(([label,key])=>`<div class="student-field"><div class="student-field-label">${esc(label)}</div><div class="student-field-value">${esc(student.get(key)||'--')}</div></div>`).join('');
  renderOrderConsultCard(order);
  const detailPackages=displayPackages(order);
  const shownPackages=packageIndex===undefined?detailPackages:[detailPackages[packageIndex]];
  const combinedDetail=packages.length>1&&packageIndex===undefined;
  $('detailPackages').innerHTML=shownPackages.map((pack,index)=>packageCourseTable(pack,index,
    combinedDetail?suborderForPackage(order,packages[index],index):null)).join('');
  renderOrderInfo(order);
  $('detailBackdrop').hidden=false;
  $('orderDrawer').hidden=false;
  document.body.style.overflow='hidden';
  $('closeOrderDrawer').focus();
}
document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(tab=>{tab.classList.toggle('current',tab===button);tab.setAttribute('aria-selected',tab===button)});state.tab=button.dataset.tab;state.page=1;renderList()}));
$('applyFilters').onclick=()=>{readFilters();state.page=1;renderList()};$('resetFilters').onclick=()=>{document.querySelectorAll('.filters input').forEach(input=>{input.value='';input.type='text'});document.querySelectorAll('.filters select').forEach(select=>select.value='');readFilters();state.page=1;renderList()};$('pageSize').onchange=()=>{state.size=Number($('pageSize').value);state.page=1;renderList()};$('prevPage').onclick=()=>{state.page--;renderList()};$('nextPage').onclick=()=>{state.page++;renderList()};$('jumpPage').onchange=()=>{state.page=Number($('jumpPage').value)||1;renderList()};$('pageNumbers').onclick=e=>{const button=e.target.closest('[data-page]');if(button){state.page=Number(button.dataset.page);renderList()}};$('orderRows').onclick=e=>{const order=e.target.closest('[data-order]');if(order){e.preventDefault();showDetail(order.dataset.order,true,new URL(order.href).searchParams.get("package"));return}const action=e.target.closest('[data-action]');if(action){e.preventDefault();toast('重新申请入口将在后续页面中补充')}};document.querySelector('.table-settings').onclick=()=>toast('表格设置入口示意');function readOrderRoute(){
  const params=new URLSearchParams(location.search);
  if(params.has('order'))showDetail(params.get('order'),false,params.get('package'));
  else showList(false);
}
window.addEventListener('popstate',readOrderRoute);
function setOrderListMode(mode){
  state.orderMode=mode;
  state.page=1;
  for(const option of $('salesOrderListMode').querySelectorAll('button')){
    option.setAttribute('aria-pressed',option.dataset.orderMode===mode);
  }
}
$('salesOrderListMode').addEventListener('click',event=>{
  const button=event.target.closest('[data-order-mode]');
  if(!button||button.dataset.orderMode===state.orderMode)return;
  setOrderListMode(button.dataset.orderMode);
  renderList();
});
readFilters();
renderList();
if(new URLSearchParams(location.search).has('order'))readOrderRoute();

$('closeOrderDrawer').onclick=()=>showList();
$('detailPackages').addEventListener('click',event=>{
  const link=event.target.closest('[data-suborder]');
  if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  showDetail(state.currentOrderId,true,link.dataset.suborder);
});
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
    renderOrderConsultCard(order);closeOrderConsultModal();toast('已关联售前咨单');
  }else toast('关联失败，请重试');
});
window.addEventListener('sales-consult-ready',()=>{const order=allOrders.find(item=>item.id===state.currentOrderId);if(order)renderOrderConsultCard(order)});
function educatorWorkspaceHref(order){
  return order?.submission?`教务端/index.html?v=20261110g#flow-order=${encodeURIComponent(JSON.stringify(order))}`:'教务端/index.html?v=20261110g';
}
$('educatorWorkspaceTab').onclick=event=>{
  const order=allOrders.find(item=>item.id===state.currentOrderId&&item.submission);
  if(order?.submission){event.preventDefault();location.href=educatorWorkspaceHref(order)}
};
$('detailBackdrop').onclick=()=>showList();
window.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(!$('orderConsultModal').hidden)closeOrderConsultModal();else if(!$('orderDrawer').hidden)showList()});

function openCreateOrder(){
  $('createOrderPage').hidden=false;
  document.body.style.overflow='hidden';
  if(!window.createOrderDetails?.studentNumber()){
    if(homeroomOrderEmbed){
      window.createOrderDetails?.setStudentName('授课反馈产品验收','VA100078710');
      $('createOrderForm').querySelector('.create-type-row select').value='此科目续排';
    }else{
      window.createOrderDetails?.setStudentName('刘大礼','VA100012345');
      window.createOrderPackages?.seedReferenceDemo();
    }
  }
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
function cancelCreateOrder(){
  closeCreateOrder();
  if(homeroomOrderEmbed)notifyHomeroomOrder('homeroom-order-close');
}
$('closeCreateOrder').onclick=cancelCreateOrder;
$('cancelCreateOrder').onclick=cancelCreateOrder;
function validateCreateForm(){
  if($('createEndMode').value==='SPECIFIED_DATE'&&(!$('createEndDate').value||$('createEndDate').value<$('createStartDate').value)){
    toast('请选择不早于开课日期的结课日期');
    $('createEndDate').focus();
    return false;
  }
  if(isHomeroomSelfScheduling()){
    if(!window.createOrderDetails?.studentNumber()){
      toast('请从搜索结果中选择学生');
      $('createStudentSearch').focus();
      return false;
    }
    return window.createOrderPackages.validate();
  }
  return !!window.createOrderDetails?.validate()&&!!window.createOrderPackages?.validate()&&validateCreatePreciseTime();
}
function isHomeroomSelfScheduling(){return $('createOrderForm').dataset.handler==='self'}

if(homeroomOrderEmbed){
  const handler=$('createHandler');
  function setOrderHandler(mode){
    $('createOrderForm').dataset.handler=mode;
    $('createHomeroomOwner').hidden=mode!=='self';
    for(const button of handler.querySelectorAll('button')){
      button.setAttribute('aria-pressed',button.dataset.orderHandler===mode);
    }
    window.createOrderPackages?.refreshHistory();
  }
  handler.hidden=false;
  handler.addEventListener('click',event=>{
    const button=event.target.closest('[data-order-handler]');
    if(button)setOrderHandler(button.dataset.orderHandler);
  });
  setOrderHandler('self');
}

function openHomeroomSupplement(submission){
  const drawer=document.createElement('dialog');
  drawer.className='homeroom-supplement-frame';
  drawer.setAttribute('aria-label','补充排课要求');
  const frame=document.createElement('iframe');
  frame.title='补充排课要求';
  const order={id:Date.now(),submission,course:courseNameForSubmission(submission),source:'homeroom'};
  frame.src=`教务端/index.html?embed-homeroom-supplement=1#flow-order=${encodeURIComponent(JSON.stringify(order))}`;
  drawer.append(frame);
  document.body.append(drawer);
  let created=false;
  function receiveSupplement(event){
    if(event.source!==frame.contentWindow||event.origin!==location.origin)return;
    if(event.data?.kind==='homeroom-supplement-ready'&&!created){
      const {start,end,endMode,timezone,text,files,specifiedTeachers,selectedTeachers,lockedSlots}=event.data;
      const supplements=text||files.length?[{time:currentTimestamp(),text,attachments:files}]:[];
      createDemoOrder({...submission,start,end,endMode,timezone,specifiedTeachers,selectedTeachers,lockedSlots},supplements);
      created=true;
    }
    if(event.data?.kind==='homeroom-supplement-close')drawer.close();
  }
  window.addEventListener('message',receiveSupplement);
  drawer.addEventListener('close',()=>{
    window.removeEventListener('message',receiveSupplement);
    drawer.remove();
    if(created)cancelCreateOrder();
  },{once:true});
  drawer.showModal();
}
$('createOrderForm').onsubmit=event=>{
  event.preventDefault();
  if(!validateCreateForm())return;
  const submitted=readCreateOrder();
  if(isHomeroomSelfScheduling()){
    openHomeroomSupplement(submitted);
    return;
  }
  submitted.consultId=window.getPendingConsultId?.()||null;
  const draft={id:-Date.now(),course:courseNameForSubmission(submitted),status:'待提交',submission:submitted,originalSubmission:JSON.parse(JSON.stringify(submitted)),supplements:[]};
  pendingSubmissions.push(draft);
  activeFormDraftId=draft.id;
  openAiPrecheckLoading(draft);
  setTimeout(()=>{
    if(pendingSubmissions.includes(draft)&&draft.precheckIssues===undefined&&activeAnalysisOrderId===draft.id&&!$('aiPrecheckDrawer').hidden&&$('aiPrecheckDrawer').dataset.mode==='loading'){
      $('aiPrecheckLoadingText').textContent='正在分析排课策略，可稍后查看';
      $('deferAiPrecheck').hidden=false;
    }
  },60000);
  setTimeout(()=>{
    if(!pendingSubmissions.includes(draft))return;
    const {issues,strategy}=analyzeDemoOrderStrategy(submitted);
    draft.precheckIssues=issues;
    if(!issues.length){
      pendingSubmissions=pendingSubmissions.filter(item=>item!==draft);
      savePendingSubmissions();
      const order=createDemoOrder(submitted,[],[],null,strategy);
      if(activeFormDraftId===draft.id){closeCreateOrder();activeFormDraftId=null}
      showList(false);
      ['orderNumberFilter','orderNameFilter','typeFilter','statusFilter','createdFrom','createdTo','startFrom','startTo'].forEach(id=>$(id).value='');
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
    cancelCreateOrder();
  }
});

let activePrecheckOrderId=null;
let activeAnalysisOrderId=null;
let activeFormDraftId=null;
function hydrateCreateOrder(submission){
  window.createOrderDetails?.setFromSubmission(submission);
  window.createOrderPackages?.setFromPackages(submission.packages||[],submission.blankPackageCount??(submission.packages?.length?1:0));
  $('createStartDate').value=submission.start||'';
  $('createEndMode').value=submission.endMode||'FINISH_ALL';
  $('createEndDate').value=submission.end||'';
  syncCreateEndMode();
  $('createEndDate').value=submission.end||'';
  $('createOrderForm').querySelector('.create-type-row select').value=submission.type||'';
  const precise=!!submission.preciseTime;
  $('createOrderForm').querySelector(`input[name="timeRequirement"][value="${precise?'precise':'vague'}"]`).checked=true;
  syncCreateTimeRequirement();
  $('createRequirement').value=submission.requirement||'';
  $('createRequirementCount').textContent=$('createRequirement').value.length+'/500';
  document.querySelectorAll('input[name="createPreciseWeekday"]').forEach(input=>input.checked=!!submission.preciseTime?.weekdays?.includes(Number(input.value)));
  document.querySelectorAll('input[name="createPreciseSlot"]').forEach(input=>input.checked=!!submission.preciseTime?.slots?.includes(input.value));
  $('createCustomTimeRows').replaceChildren();
  for(const [start,end] of submission.preciseTime?.custom||[]){
    $('createAddCustomTime').click();
    const row=$('createCustomTimeRows').lastElementChild;
    const inputs=row.querySelectorAll('input');
    inputs[0].value=start;inputs[1].value=end;
  }
}
function renderAiPrecheckReadOnly(draft,hideCreate=true){
  const summary=$('aiPrecheckLeft');
  const previousScroll=summary.scrollTop;
  summary.innerHTML=window.orderAnalysisSummary.render(draft);
  summary.scrollTop=previousScroll;
  if(hideCreate)$('createOrderPage').hidden=true;
}
function setAiPrecheckMode(mode){
  const drawer=$('aiPrecheckDrawer');
  const wasLoading=drawer.dataset.mode==='loading';
  window.analysisMotion.cancelSuccessClose(drawer);
  drawer.dataset.mode=mode;
  $('aiPrecheckBody').hidden=mode==='success';
  $('aiPrecheckSuccess').hidden=mode!=='success';
  $('closeAiPrecheck').hidden=mode==='loading';
  if(mode==='loading')window.analysisMotion.start(drawer,{
    layer:$('aiPrecheckLoading'),header:drawer.firstElementChild,surface:[$('aiPrecheckBody'),$('aiPrecheckFooter')]
  });
  else if(mode==='success'){
    window.analysisMotion.stop(drawer,false);
    window.analysisMotion.closeAfterSuccess(drawer,closeAiPrecheck);
  }
  else if(wasLoading){
    window.analysisMotion.stop(drawer);
    requestAnimationFrame(()=>window.analysisMotion.reveal(drawer,'.ai-precheck-category:not([hidden])'));
  }
}
function openAiPrecheckLoading(order){
  activeAnalysisOrderId=order.id;
  $('aiPrecheckLoadingText').textContent='正在分析排课策略';
  $('deferAiPrecheck').hidden=true;
  $('aiPrecheckBackdrop').hidden=false;
  $('aiPrecheckDrawer').hidden=false;
  renderAiPrecheckReadOnly(order,false);
  setAiPrecheckMode('loading');
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
function createDemoOrder(submission,supplements=[],precheckIssues='',originalSubmission=null,strategy=null){
  const order={
    id:nextOrderId++,
    course:courseNameForSubmission(submission),
    created:currentTimestamp(),type:'1V1排课单',attribute:'新增排课单',handler:'李春玲',
    status:'处理中',finished:'--',applicant:'李春玲',start:submission.start,submission,supplements,precheckIssues,originalSubmission,
    strategyAnalysis:{status:'SUCCESS',...(strategy?{strategy}:{})}
  };
  if(homeroomOrderEmbed){
    const suborders=packagesForList(order).map((pack,index)=>({
      name:suborderForPackage(order,pack,index).course,
      packageName:pack.name,
      courses:pack.courses
    }));
    notifyHomeroomOrder('homeroom-order-created',{...order,suborders});
    return order;
  }
  allOrders.unshift(order);
  setOrderListMode(packagesForList(order).length>1?'combined':'individual');
  saveDemoOrders();
  document.dispatchEvent(new CustomEvent('formal-order-created',{detail:{order}}));
  return order;
}
function readCreateOrder(){
  const form=$('createOrderForm');
  const details=window.createOrderDetails?.read()||{};
  const blankPackageCount=[...form.querySelectorAll('[data-package-group]')].filter(group=>!group.querySelector('.course-package-line select').value).length;
  const packages=[...form.querySelectorAll('[data-package-group]')].filter(group=>group.querySelector('.course-package-line select').value).map(group=>{
    const name=group.querySelector('.course-package-line select').value;
    const meta=window.createOrderPackages.packageMeta(name);
    const courses=[...group.querySelectorAll('.create-course-table tbody tr')].map(row=>{
      const cells=row.querySelectorAll('td');
      const base=row.createCourseData||row.consultCourse||{};
      const subject=cells[0].textContent.trim();
      const historical=isHomeroomSelfScheduling()?window.createOrderPackages.getHistoricalCourse(name,base):null;
      return {...base,
        package:name,name:subject,subject,
        system:meta.system||base.system||'英联邦学科',item:meta.item||base.item||'ALEVEL',
        classType:base.classType||'1v1',
        board:cells[1].textContent.trim(),grade:cells[2].textContent.trim(),
        module:cells[3].querySelector('select')?.value??cells[3].textContent.trim(),
        studentLevel:cells[4].querySelector('select')?.value??base.studentLevel??'',
        expectedGrade:cells[5].querySelector('select')?.value??base.expectedGrade??'',
        mode:cells[6].textContent.trim(),historicalTeacher:historical?.historicalTeacher||cells[7].textContent.trim(),
        ...(isHomeroomSelfScheduling()?{isHistoricalCourse:Boolean(historical)}:{}),
        campus:cells[8].querySelector('select')?.value??cells[8].textContent.trim(),
        hours:cells[9].querySelector('input')?.value||'0',
        currentTeacher:historical?.currentTeacher||(cells[10].querySelector('input')?.value??cells[10].textContent.trim()),
        teacherDiscussed:cells[11].querySelector('select')?.value??cells[11].textContent.trim()
      };
    });
    const score=group.querySelector('.create-package-score')?.firstChild?.textContent.replace(/^目前\(期望\)成绩：/,'').trim()||'';
    return {name,system:meta.system||courses[0]?.system||'',item:meta.item||courses[0]?.item||'',score,courses};
  });
  return {
    student:form.querySelector('.student-name-input').value.trim(),
    ...details,
    package:packages[0]?.name||'',packages,blankPackageCount,
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
    courses:packages.flatMap(entry=>entry.courses),
    ...(homeroomOrderEmbed?{schedulingHandler:isHomeroomSelfScheduling()?'self':'educator'}:{}),
    ...(isHomeroomSelfScheduling()?{
      classOwner:$('createClassOwner').value,time:'',preciseTime:null,requirement:'',requirementAttachments:[],extra:{}
    }:{})
  };
}
// 原型在同一次提交分析中完成检查和策略输出，正式环境由 AI 服务返回策略。
function analyzeDemoOrderStrategy(submission,supplement=''){
  const issues=demoPrecheckIssues(submission,supplement);
  if(issues.length)return {issues};

  const precise=submission.preciseTime;
  const days=['周日','周一','周二','周三','周四','周五','周六'];
  const selectedDays=(precise?.weekdays||[]).map(day=>days[day]).filter(Boolean);
  const windows=precise?[...(precise.slots||[]).map(slot=>slot.split('-')),...(precise.custom||[])]:[];
  const timeRules=windows.length
    ? windows.map(([start,end])=>({type:'仅限',weekdays:selectedDays.length?selectedDays:days,allDay:false,start,end}))
    : [{type:'常规',weekdays:[],allDay:false,start:'',end:''}];
  const readFrequency=text=>text.match(/每(两周|周|月)(?:各|安排|排)?\s*(\d+)(?:\s*[-—–～~至到]\s*(\d+))?\s*(?:课)?节/u);
  const frequency=readFrequency(supplement)||readFrequency(String(submission.requirement||''));
  const frequencyMin=Number(frequency?.[2])||1;
  const frequencyMax=Math.max(frequencyMin,Number(frequency?.[3]||frequency?.[2])||2);
  return {issues,strategy:{
    start:submission.start,
    end:submission.endMode==='SPECIFIED_DATE'?submission.end:'',
    frequencyPeriod:({'两周':'biweek','周':'week','月':'month'})[frequency?.[1]]||'week',
    frequencyMin,frequencyMax,timeRules
  }};
}
function demoPrecheckIssues(order,supplement=''){
  const issues=[];
  const extra=order.extra||{};
  const other=extra.otherRequirement||'';
  if(order.endMode!=='SPECIFIED_DATE'&&/考前|考试前/.test(other)){
    issues.push({category:'end',text:'结课日期为“排完全部课程结束”，其他要求提出考试前完成。请指定最晚结课日期。'});
  }
  if(/严格严肃/.test(other)&&!(extra.teacherStyles||[]).includes('严格严肃')){
    issues.push({category:'style',text:'其他要求希望老师严格严肃，与当前老师风格不一致。请重新选择老师风格。'});
  }
  if(/男女都可以|性别不限/.test(other)&&extra.teacherGender!=='都可以'){
    issues.push({category:'gender',text:'其他要求写明老师男女都可以，与当前老师性别选择不一致。请重新选择老师性别。'});
  }
  const requirement=String(order.requirement||'').trim();
  const unclear=!order.preciseTime&&(/测试|报错|超时|延迟返回|尽量|时间灵活/.test(requirement)||requirement.length<6);
  if(unclear&&demoSupplementIssues(supplement)){
    if(/尽量|时间灵活/.test(requirement)){
      issues.push({category:'time',text:'请明确原文中的星期是固定、仅限还是优先时段。'});
      issues.push({category:'time',text:'请补充可上课的具体起止时间。'});
    }else{
      issues.push({category:'time',text:'排课时间要求尚不足以确定安排。请补充可执行的上课日期、频次或时段。'});
    }
  }
  return issues;
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
function normalizeAiPrecheckIssues(issues){
  const source=Array.isArray(issues)?issues:String(issues||'').split(/\n+/).filter(Boolean);
  return source.map(issue=>typeof issue==='string'?{category:'time',text:issue.replace(/^\s*\d+[、.．]\s*/,'')}:{category:['end','style','gender','time'].includes(issue?.category)?issue.category:'time',text:String(issue?.text||'')}).filter(issue=>issue.text.trim());
}
function renderAiPrecheck(order,issues){
  const grouped=normalizeAiPrecheckIssues(issues);
  let visibleIndex=0;
  for(const category of ['end','style','gender','time']){
    const items=grouped.filter(issue=>issue.category===category);
    const section=document.querySelector(`[data-precheck-category="${category}"]`);
    section.hidden=items.length===0;
    if(items.length)section.querySelector('header b').textContent=String(++visibleIndex);
    const container=document.querySelector(`[data-precheck-questions="${category}"]`);
    container.innerHTML=items.length?`<ol>${items.map(issue=>`<li>${esc(issue.text)}</li>`).join('')}</ol>`:'';
  }
  const submission=order.submission||{};
  const extra=submission.extra||{};
  $('aiPrecheckEndMode').value=submission.endMode||'FINISH_ALL';
  $('aiPrecheckEndDate').hidden=$('aiPrecheckEndMode').value!=='SPECIFIED_DATE';
  $('aiPrecheckEndDate').min=submission.start||'';
  $('aiPrecheckEndDate').value=submission.end||'';
  $('aiPrecheckTeacherStyles').innerHTML=[...document.querySelectorAll('#createTeacherStyles input')].map(input=>`<label><input type="radio" name="aiPrecheckTeacherStyle" value="${esc(input.value)}" ${(extra.teacherStyles||[]).includes(input.value)?'checked':''}>${esc(input.value)}</label>`).join('');
  $('aiPrecheckTeacherGenders').innerHTML=[...document.querySelectorAll('input[name="createTeacherGender"]')].map(input=>`<label><input type="radio" name="aiPrecheckTeacherGender" value="${esc(input.value)}" ${extra.teacherGender===input.value?'checked':''}>${esc(input.value)}</label>`).join('');
  $('aiPrecheckReply').value=order.replyText||'';
  $('aiPrecheckReplyCount').textContent=`${$('aiPrecheckReply').value.length}/1000`;
  $('aiPrecheckReplyError').hidden=true;
  renderAiPrecheckFiles(order);
  refreshAiPrecheckStatuses(order);
}
function refreshAiPrecheckStatuses(draft){
  const original=normalizeAiPrecheckIssues(draft.precheckIssues);
  const remaining=demoPrecheckIssues(draft.submission,draft.replyText||'');
  const categories=['end','style','gender','time'];
  for(const category of categories){
    const hadIssue=original.some(issue=>issue.category===category);
    const stillHas=remaining.some(issue=>issue.category===category);
    const status=document.querySelector(`[data-precheck-status="${category}"]`);
    status.hidden=hadIssue&&!stillHas&&category==='time';
    status.textContent=!hadIssue?'无需处理':stillHas?'待处理':category==='time'?'':'已修改 · 待复检';
    status.classList.toggle('is-resolved',hadIssue&&!stillHas);
    status.classList.toggle('is-idle',!hadIssue);
  }
  $('aiPrecheckReplyError').hidden=true;
}
function renderAiPrecheckFiles(draft){
  $('aiPrecheckReplyFileList').innerHTML=(draft.replyAttachments||[]).map((file,index)=>`<div><span>▤ ${esc(file.name)}</span><button type="button" data-remove-ai-file="${index}" aria-label="移除${esc(file.name)}">×</button></div>`).join('');
}
function addAiPrecheckFiles(files){
  const draft=pendingSubmissions.find(item=>item.id===activePrecheckOrderId);
  if(!draft)return;
  draft.replyAttachments||=[];
  for(const file of files){
    const extension=file.name.split('.').pop()?.toLowerCase();
    if(!['jpg','jpeg','png','bmp'].includes(extension)||file.size>20*1024*1024){toast('仅支持 JPG、PNG、BMP，单个文件不超过 20MB');continue}
    if(draft.replyAttachments.length>=20){toast('最多上传 20 张图片');break}
    if(!draft.replyAttachments.some(item=>item.name===file.name&&item.size===file.size))draft.replyAttachments.push({name:file.name,size:file.size});
  }
  renderAiPrecheckFiles(draft);
  savePendingSubmissions();
}
function pendingAiPrecheckOrders(){
  return pendingSubmissions.filter(draft=>draft.precheckIssues?.length);
}
function updateAiPrecheckFab(){
  const pending=pendingAiPrecheckOrders();
  $('aiPrecheckFab').hidden=pending.length===0;
  $('aiPrecheckDot').hidden=pending.length===0;
  $('aiPrecheckFab').setAttribute('aria-label',pending.length?`查看排课要求智能分析，${pending.length}张待提交排课单待确认`:'排课要求智能分析，暂无待确认排课单');
  return pending;
}
function refreshAiPrecheckList(preferredOrderId=activePrecheckOrderId){
  const pending=updateAiPrecheckFab();
  const selected=pending.find(order=>order.id===Number(preferredOrderId))||pending[0];
  if(!selected){activePrecheckOrderId=null;closeAiPrecheck();return 0}
  activePrecheckOrderId=selected.id;
  renderAiPrecheck(selected,selected.precheckIssues);
  if(!$('aiPrecheckDrawer').hidden&&$('aiPrecheckDrawer').dataset.mode==='issues')renderAiPrecheckReadOnly(selected);
  return pending.length;
}
function openAiPrecheck(preferredOrderId=null){
  if(!refreshAiPrecheckList(preferredOrderId)){toast('暂无待确认的排课单');return}
  activeAnalysisOrderId=null;
  setAiPrecheckMode('issues');
  $('aiPrecheckBackdrop').hidden=false;
  $('aiPrecheckDrawer').hidden=false;
  renderAiPrecheckReadOnly(pendingSubmissions.find(item=>item.id===activePrecheckOrderId));
  document.body.style.overflow='hidden';
  $('closeAiPrecheck').focus();
}
function closeAiPrecheck(showCreate=false){
  const completed=$('aiPrecheckDrawer').dataset.mode==='success';
  window.analysisMotion.cancelSuccessClose($('aiPrecheckDrawer'));
  window.analysisMotion.stop($('aiPrecheckDrawer'),false);
  activeAnalysisOrderId=null;
  if(showCreate)$('createOrderPage').hidden=false;
  $('aiPrecheckBackdrop').hidden=true;
  $('aiPrecheckDrawer').hidden=true;
  document.body.style.overflow=$('createOrderPage').hidden&&$('orderDrawer').hidden?'':'hidden';
  if(homeroomOrderEmbed&&completed)notifyHomeroomOrder('homeroom-order-close');
}
function cancelAiPrecheck(){
  const editingForm=activeFormDraftId!==null;
  const draftId=activeFormDraftId??activePrecheckOrderId;
  const draft=pendingSubmissions.find(item=>item.id===draftId);
  if(editingForm&&draft)hydrateCreateOrder(draft.submission);
  if($('aiPrecheckDrawer').dataset.mode==='issues'&&draftId!==null){
    pendingSubmissions=pendingSubmissions.filter(draft=>draft.id!==draftId);
    savePendingSubmissions();
    updateAiPrecheckFab();
  }
  if(!editingForm)window.clearPendingConsultId?.();
  closeAiPrecheck(editingForm);
  activeFormDraftId=null;
}
$('aiPrecheckFab').onclick=()=>openAiPrecheck();
$('closeAiPrecheck').onclick=()=>{if($('aiPrecheckDrawer').dataset.mode!=='loading'){if(activeFormDraftId!==null)cancelAiPrecheck();else closeAiPrecheck()}};
$('aiPrecheckBackdrop').onclick=()=>{if($('aiPrecheckDrawer').dataset.mode!=='loading'){if(activeFormDraftId!==null)cancelAiPrecheck();else closeAiPrecheck()}};
$('deferAiPrecheck').onclick=()=>{
  closeAiPrecheck();
  if(activeFormDraftId!==null){closeCreateOrder();activeFormDraftId=null;window.clearPendingConsultId?.();showList(false)}
};
$('dismissAiPrecheck').onclick=cancelAiPrecheck;
if(homeroomOrderEmbed)document.addEventListener('DOMContentLoaded',openCreateOrder);
$('aiPrecheckReply').oninput=event=>{
  const draft=pendingSubmissions.find(item=>item.id===activePrecheckOrderId);
  if(draft){draft.replyText=event.target.value;savePendingSubmissions();refreshAiPrecheckStatuses(draft)}
  $('aiPrecheckReplyCount').textContent=`${event.target.value.length}/1000`;
  $('aiPrecheckReplyError').hidden=true;
};
$('aiPrecheckEndMode').onchange=event=>{
  const draft=pendingSubmissions.find(item=>item.id===activePrecheckOrderId);
  if(!draft)return;
  draft.submission.endMode=event.target.value;
  if(event.target.value!=='SPECIFIED_DATE'){draft.submission.end='';$('aiPrecheckEndDate').value=''}
  $('aiPrecheckEndDate').hidden=event.target.value!=='SPECIFIED_DATE';
  savePendingSubmissions();renderAiPrecheckReadOnly(draft);refreshAiPrecheckStatuses(draft);
};
$('aiPrecheckEndDate').oninput=event=>{
  const draft=pendingSubmissions.find(item=>item.id===activePrecheckOrderId);
  if(!draft)return;
  draft.submission.end=event.target.value;
  savePendingSubmissions();renderAiPrecheckReadOnly(draft);refreshAiPrecheckStatuses(draft);
};
$('aiPrecheckTeacherStyles').onchange=event=>{
  const draft=pendingSubmissions.find(item=>item.id===activePrecheckOrderId);
  if(!draft||!event.target.matches('input[type="radio"]'))return;
  (draft.submission.extra||={}).teacherStyles=[event.target.value];
  savePendingSubmissions();renderAiPrecheckReadOnly(draft);refreshAiPrecheckStatuses(draft);
};
$('aiPrecheckTeacherGenders').onchange=event=>{
  const draft=pendingSubmissions.find(item=>item.id===activePrecheckOrderId);
  if(!draft||!event.target.matches('input[type="radio"]'))return;
  (draft.submission.extra||={}).teacherGender=event.target.value;
  savePendingSubmissions();renderAiPrecheckReadOnly(draft);refreshAiPrecheckStatuses(draft);
};
$('aiPrecheckReplyFiles').onchange=event=>{addAiPrecheckFiles(event.target.files);event.target.value=''};
$('aiPrecheckUpload').ondragover=event=>{event.preventDefault();event.currentTarget.classList.add('is-dragging')};
$('aiPrecheckUpload').ondragleave=event=>event.currentTarget.classList.remove('is-dragging');
$('aiPrecheckUpload').ondrop=event=>{event.preventDefault();event.currentTarget.classList.remove('is-dragging');addAiPrecheckFiles(event.dataTransfer.files)};
$('aiPrecheckReplyFileList').onclick=event=>{
  const button=event.target.closest('[data-remove-ai-file]');
  if(!button)return;
  const draft=pendingSubmissions.find(item=>item.id===activePrecheckOrderId);
  if(!draft)return;
  draft.replyAttachments.splice(Number(button.dataset.removeAiFile),1);
  renderAiPrecheckFiles(draft);
  savePendingSubmissions();
};
$('submitAiPrecheckReply').onclick=()=>{
  const draft=pendingSubmissions.find(item=>item.id===activePrecheckOrderId);
  if(!draft)return;
  if(draft.submission.endMode==='SPECIFIED_DATE'&&(!draft.submission.end||draft.submission.end<draft.submission.start)){
    $('aiPrecheckEndDate').focus();toast('请选择不早于开课日期的结课日期');return;
  }
  if(!draft.submission.extra?.teacherStyles?.length){toast('请选择老师风格');return}
  if(!draft.submission.extra?.teacherGender){toast('请选择老师性别');return}
  const text=$('aiPrecheckReply').value.trim();
  draft.replyText=text;
  savePendingSubmissions();
  openAiPrecheckLoading(draft);
  setTimeout(()=>{
    if(!pendingSubmissions.includes(draft))return;
    const {issues,strategy}=analyzeDemoOrderStrategy(draft.submission,text);
    if(issues.length){
      draft.precheckIssues=issues;
      savePendingSubmissions();
      activeAnalysisOrderId=null;
      setAiPrecheckMode('issues');
      refreshAiPrecheckList(draft.id);
      $('aiPrecheckReplyError').hidden=false;
      return;
    }
    const attachments=(draft.replyAttachments||[]).map(file=>file.name);
    const supplements=text||attachments.length?[{time:currentTimestamp(),text,attachments}]:[];
    createDemoOrder(draft.submission,supplements,normalizeAiPrecheckIssues(draft.precheckIssues).map(issue=>issue.text),draft.originalSubmission||null,strategy);
    pendingSubmissions=pendingSubmissions.filter(item=>item!==draft);
    savePendingSubmissions();
    if(activeFormDraftId===draft.id){closeCreateOrder();activeFormDraftId=null}
    showList(false);
    ['orderNumberFilter','orderNameFilter','typeFilter','statusFilter','createdFrom','createdTo','startFrom','startTo'].forEach(id=>$(id).value='');
    readFilters();state.page=1;renderList();updateAiPrecheckFab();
    activeAnalysisOrderId=null;
    setAiPrecheckMode('success');
  },1600);
};
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('aiPrecheckDrawer').hidden&&$('aiPrecheckDrawer').dataset.mode!=='loading'){if(activeFormDraftId!==null)cancelAiPrecheck();else closeAiPrecheck()}});
refreshAiPrecheckList();
const aiPrecheckDemoMode=new URLSearchParams(location.search).get('ai-precheck-demo');
if(aiPrecheckDemoMode!==null){
  const courses=[
    {subject:'听力',name:'听力',board:'--',grade:'--',module:'高端测试0012',studentLevel:'听力-基础段',expectedGrade:'5',mode:'线下',historicalTeacher:'李春玲',campus:'舜元校区',hours:'8',currentTeacher:'李春玲',teacherDiscussed:'是'},
    {subject:'口语',name:'口语',board:'--',grade:'--',module:'高端测试0012',studentLevel:'口语-基础段',expectedGrade:'6',mode:'线上',historicalTeacher:'李春玲',campus:'--',hours:'8',currentTeacher:'李春玲',teacherDiscussed:'是'}
  ];
  const secondPackageCourses=[
    {subject:'化学',name:'化学',board:'OCR',grade:'AS',module:'P1',studentLevel:'先修/同步-B及以下',expectedGrade:'B',mode:'线下',historicalTeacher:'李春玲 (VA100859)',campus:'舜元校区',hours:'12',currentTeacher:'李春玲',teacherDiscussed:'是'},
    {subject:'物理',name:'物理',board:'OCR',grade:'AS',module:'--',studentLevel:'先修/同步-B及以下',expectedGrade:'B',mode:'线下',historicalTeacher:'李春玲 (VA100859)',campus:'泰康校区',hours:'32',currentTeacher:'李春玲',teacherDiscussed:'否'}
  ];
  const submission={student:'刘大礼',studentInfo:{number:'VA100078710',name:'刘大礼',english:'Ella Du',gender:'女',birthday:'1998-03-13',age:'16岁',country:'英国',grade:'12',phone:'139****8976',wechat:'2****4',email:'13917694897@163.com',school:'上海市浦东新区建平路中心高级学习西校区'},
    packages:[{name:'英联邦-英联邦学科-雅思-1V1',system:'英联邦学科',item:'雅思',score:'听力:1 (5); 口语:1 (6); 写作:1 (4); 阅读:1 (20); 总分:1 (60)',courses},{name:'英联邦-英联邦学科-ALEVEL-化学&物理-1V1',system:'英联邦学科',item:'ALEVEL',courses:secondPackageCourses}],courses:[...courses,...secondPackageCourses],
    start:'2026-11-20',endMode:'FINISH_ALL',end:'',type:'此科目续排',time:'模糊排课',requirement:'每周二或周五晚上尽量排课，时间灵活。',
    requirementAttachments:['时间要求图片1.png'],extra:{teacherStyles:['可全英文'],teacherGender:'女老师',otherRequirement:'希望考试前学完；老师男女都可以；希望老师严格严肃。',progress:'雅思听力已完成基础训练，口语需要加强表达。',examDate:'2026-11-13',studyPurposes:['校内备考'],familyRelation:'父母主导',courseNote:'优先安排晚间课程。',vouchers:['凭证1.png']}};
  if(aiPrecheckDemoMode==='time')submission.extra.otherRequirement='';
  const draft={id:-11115001,course:courseNameForSubmission(submission),status:'待提交',submission,originalSubmission:JSON.parse(JSON.stringify(submission)),supplements:[],precheckIssues:demoPrecheckIssues(submission),demoPreview:true};
  pendingSubmissions.push(draft);
  setTimeout(()=>openAiPrecheck(draft.id),0);
}
