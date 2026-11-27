(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const storageKey = 'teacher-scheduling-v3-full-flow-orders';
  const assignmentKey = 'teacher-scheduling-v32-educator-assignments';
  const seed = [
    ['测试-广州03-英研课程-英国大学课程-生物-1v1-新增','生物','处理中',2,'2026-11-13 13:13:56','袁瑞(VA000165)','袁瑞(VA000165)'],
    ['刘中怡-英联邦学科-ALEVEL-数学-1v1-变更','数学','已完成',32,'2026-11-13 13:13:54','张璐(VA000914)','张璐(VA000914)'],
    ['张栩祎-英联邦学科-ALEVEL-生物-1v1-变更','生物','处理中',4,'2026-11-13 13:13:35','常雪(VA000465)','常雪(VA000465)'],
    ['戴诗琪Doris-英联邦学科-ALEVEL-生物&化学-1v1-变更','化学','待审批',1.5,'2026-11-13 13:12:55','王丹妮(VA000968)','王丹妮(VA000968)'],
    ['任子豪-择校备考-择校初升高-中文数学-1v1-新增','数学','待分配',4,'2026-11-13 13:12:53','卞立颖(VA000583)',''],
    ['杨雨宸-英研课程-英国大学课程-工商管理-1v1-变更','工商管理','已完成',5,'2026-11-13 13:11:22','胡宇欣(VA002382)','胡宇欣(VA002382)'],
    ['Winston SUN-橡沐学科-MYP-英语-1v1-变更','英语','待审批',1.5,'2026-11-13 13:08:42','王丹妮(VA000968)','王丹妮(VA000968)'],
    ['俞道-高端牛剑-牛剑面试辅导-托福经济-1v1-变更','经济','已完成',4.5,'2026-11-13 13:08:14','王慧琪(VA000107)','王慧琪(VA000107)'],
    ['Winston SUN-橡沐学科-MYP-物理-1v1-新增','物理','处理中',2,'2026-11-13 13:07:49','王丹妮(VA000968)','王丹妮(VA000968)'],
    ['何璐雪snow-橡沐学科-IBIA-单次修改-数学-1v1-新增','数学','已完成',3.5,'2026-11-13 13:06:41','李雅(VA000770)','李雅(VA000770)']
  ];
  const demo = window.smartSchedulingV3DemoOrder;
  const mockOrders = seed.map(([course,subject,status,hours,created,applicant,handler], index) => {
    const submission = structuredClone(demo.submission);
    submission.student = course.split('-')[0];
    submission.studentInfo = {...submission.studentInfo,name:submission.student};
    submission.start = '2026-11-16';
    submission.end = '2026-12-31';
    submission.courses = [{...submission.courses[0],name:subject,hours:String(hours)}];
    submission.requirement = `${subject}课程按学生和老师可排时段安排，优先匹配每周固定课次。`;
    const attribute = course.includes('-变更') ? '变更排课单' : '新增排课单';
    const strategyAnalysis=index===0?{status:'NOT_STARTED'}:index===2?{status:'BUSINESS_FAILED',questions:['请确认学生可上课的星期和具体时段。','请补充每周或每两周需要安排的课节数。']}:{status:'SUCCESS'};
    return {id:`educator-sample-${index+1}`,course,created,type:'1V1排课单',attribute,status,handler,applicant,start:submission.start,finished:status==='已完成'?created.slice(0,10)+' 13:14:06':'--',method:status==='已完成'?'人工':'--',hours,submission,supplements:[],strategyAnalysis};
  });
  const readSaved = () => {
    try { const value=JSON.parse(localStorage.getItem(storageKey)||'[]'); return Array.isArray(value)?value.filter(order=>order?.submission&&Array.isArray(order.submission.courses)):[]; }
    catch { return []; }
  };
  const readAssignments = () => {
    try { return JSON.parse(localStorage.getItem(assignmentKey)||'{}')||{}; }
    catch { return {}; }
  };
  let tab='全部', page=1, criteria={}, selected=new Set();
  let pageSize=10;
  const withAssignment = order => {
    const change=readAssignments()[String(order.id)];
    return change?{...order,...change}:order;
  };
  const allOrders = () => {
    const saved=readSaved().map(withAssignment);
    const ids=new Set(saved.map(order=>String(order.id)));
    const demoOrder={id:1,course:'授课反馈产品验收-英联邦学科-ALEVEL-商务&会计-1v1-新增',created:'2026-11-02 11:16:55',type:'1V1排课单',attribute:'新增排课单',status:'处理中',handler:'李春玲',applicant:'李春玲',start:'2026-11-02',finished:'--',method:'智能',hours:20,...demo};
    return [...saved,...mockOrders.map(withAssignment),...(ids.has('1')?[]:[withAssignment(demoOrder)])];
  };
  const textMatch=(value,filter)=>String(value||'').toLowerCase().includes(String(filter||'').trim().toLowerCase());
  const filteredOrders=()=>allOrders().filter(order=>{
    if(tab==='待分配'&&order.status!=='待分配')return false;
    if(tab==='已分配'&&(!order.handler||order.status==='待分配'))return false;
    if(tab==='我的'&&!String(order.handler||'').includes('李春玲'))return false;
    if(!textMatch(order.course,criteria.name)||!textMatch(order.applicant,criteria.initiator)||!textMatch(order.handler,criteria.handler))return false;
    if(criteria.type&&order.type!==criteria.type)return false;
    if(criteria.attribute&&order.attribute!==criteria.attribute)return false;
    if(criteria.status&&order.status!==criteria.status)return false;
    if(criteria.method&&order.method!==criteria.method)return false;
    const created=String(order.created||'').slice(0,10),start=String(order.start||order.submission?.start||'').slice(0,10);
    return (!criteria.createdFrom||created>=criteria.createdFrom)&&(!criteria.createdTo||created<=criteria.createdTo)&&(!criteria.startFrom||start>=criteria.startFrom)&&(!criteria.startTo||start<=criteria.startTo);
  });
  const hoursOf=order=>order.hours??order.submission?.courses?.reduce((sum,course)=>sum+(Number(course.hours)||0),0)??'--';
  const pendingStatuses=new Set(['待分配','处理中','待审批','待确认']);
  const setMenuBadge=(id,count)=>{
    const badge=$(id);
    badge.hidden=count===0;
    badge.textContent=count>99?'99+':String(count);
    badge.setAttribute('aria-label',`${id==='#schedulePendingCount'?'待处理排课单':'待处理售前咨单'} ${count} 条`);
    badge.title=`待处理 ${count} 条`;
  };
  const refreshOrderBadge=()=>setMenuBadge('#schedulePendingCount',allOrders().filter(order=>pendingStatuses.has(order.status)).length);
  function render() {
    refreshOrderBadge();
    const orders=filteredOrders();
    const totalPages=Math.max(1,Math.ceil(orders.length/pageSize));
    page=Math.min(Math.max(1,page),totalPages);
    const current=orders.slice((page-1)*pageSize,page*pageSize);
    $('#orderListRows').innerHTML=current.length?current.map(order=>{
      const key=String(order.id);
      return `<tr><td><input type="checkbox" data-order-select="${esc(key)}" aria-label="选择${esc(order.course)}" ${selected.has(key)?'checked':''}></td><td class="order-list-name"><button type="button" class="order-list-view order-list-name-link" data-order-view="${esc(key)}" title="${esc(order.course)}">${esc(order.course)}</button></td><td>${esc(order.type||'1V1排课单')}</td><td>${esc(order.attribute||'新增排课单')}</td><td>${esc(order.method||'--')}</td><td>${esc(order.status||'处理中')}</td><td>${esc(hoursOf(order))}</td><td>${esc(order.created||'--')}</td><td>${esc(order.finished||'--')}</td><td>${esc(order.applicant||'--')}</td><td>${esc(order.handler||'--')}</td><td>${esc(order.classTeacher||'--')}</td><td><button type="button" class="order-list-view" data-order-view="${esc(key)}">查看</button></td></tr>`;
    }).join(''):'<tr><td colspan="13" class="order-list-empty">暂无符合条件的排课单</td></tr>';
    $('#orderListSelectAll').checked=!!current.length&&current.every(order=>selected.has(String(order.id)));
    $('#orderListSelectAll').indeterminate=current.some(order=>selected.has(String(order.id)))&&!$('#orderListSelectAll').checked;
    const buttons=[];
    for(let number=Math.max(1,page-2);number<=Math.min(totalPages,Math.max(5,page+2));number++)buttons.push(`<button type="button" data-order-page="${number}" ${number===page?'class="active" aria-current="page"':''}>${number}</button>`);
    $('#orderListPages').innerHTML=`<button type="button" data-order-page="${Math.max(1,page-1)}" ${page===1?'disabled':''}>‹</button>${buttons.join('')}<button type="button" data-order-page="${Math.min(totalPages,page+1)}" ${page===totalPages?'disabled':''}>›</button>`;
    $('#orderListTotal').textContent=`共 ${orders.length} 条`;
    $('#orderListJump').max=String(totalPages);
    $('#orderListJump').value=String(page);
  }
  function showList() {
    $('#orderPage').hidden=true;
    $('#resultPage').hidden=true;
    $('#orderListPage').hidden=false;
    document.body.classList.remove('formal-page-active');
    if(location.hash.startsWith('#flow-order='))history.replaceState(null,'',location.pathname+location.search);
    render();
  }
  if(location.hash.startsWith('#flow-order=')) {
    $('#orderListPage').hidden=true;
    $('#orderPage').hidden=false;
  } else {
    $('#orderListPage').hidden=false;
    $('#orderPage').hidden=true;
  }
  $('#orderDetailBack').addEventListener('click',showList);
  $('#orderListFilters').addEventListener('submit',event=>{
    event.preventDefault();
    criteria=Object.fromEntries(new FormData(event.currentTarget).entries());
    page=1;selected.clear();render();
  });
  $('#orderListFilters').addEventListener('reset',()=>{criteria={};page=1;selected.clear();setTimeout(render,0);});
  $('.order-list-tabs').addEventListener('click',event=>{
    const button=event.target.closest('[data-order-tab]');if(!button)return;
    tab=button.dataset.orderTab;page=1;selected.clear();
    $('.order-list-tabs').querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));
    render();
  });
  $('#orderListRows').addEventListener('click',event=>{
    const view=event.target.closest('[data-order-view]');
    if(view){
      const order=allOrders().find(item=>String(item.id)===view.dataset.orderView);
      if(order)location.href=`index.html?order-list-view=${encodeURIComponent(String(order.id))}#flow-order=${encodeURIComponent(JSON.stringify(order))}`;
      return;
    }
    const checkbox=event.target.closest('[data-order-select]');
    if(checkbox){if(checkbox.checked)selected.add(checkbox.dataset.orderSelect);else selected.delete(checkbox.dataset.orderSelect);render();}
  });
  $('#orderListSelectAll').addEventListener('change',event=>{
    filteredOrders().slice((page-1)*pageSize,page*pageSize).forEach(order=>event.target.checked?selected.add(String(order.id)):selected.delete(String(order.id)));
    render();
  });
  $('#orderListAssign').addEventListener('click',()=>{
    if(!selected.size){alert('请先选择排课单');return;}
    const assignments=readAssignments();
    selected.forEach(id=>{assignments[id]={handler:'李春玲',status:'处理中'};});
    localStorage.setItem(assignmentKey,JSON.stringify(assignments));
    selected.clear();render();
  });
  $('#orderListPages').addEventListener('click',event=>{const button=event.target.closest('[data-order-page]');if(button){page=Number(button.dataset.orderPage);render();}});
  $('#orderListPageSize').addEventListener('change',event=>{pageSize=Number(event.target.value);page=1;render();});
  $('#orderListJump').addEventListener('change',event=>{page=Number(event.target.value)||1;render();});
  $('#scheduleMenu').addEventListener('click',render);
  const consultFrame=$('#educatorConsultFrame');
  window.addEventListener('message',event=>{
    if(event.source!==consultFrame.contentWindow||event.data?.kind!=='CONSULT_CATALOG'||!Array.isArray(event.data.consults))return;
    setMenuBadge('#consultPendingCount',event.data.consults.filter(consult=>['待分配','教务处理中'].includes(consult.status)).length);
  });
  consultFrame.addEventListener('load',()=>consultFrame.contentWindow?.postMessage({kind:'REQUEST_CONSULT_CATALOG'},'*'));
  consultFrame.contentWindow?.postMessage({kind:'REQUEST_CONSULT_CATALOG'},'*');
  window.refreshEducatorPendingCounts=refreshOrderBadge;
  render();
})();
