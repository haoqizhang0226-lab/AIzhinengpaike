(() => {
  'use strict';

  const flowOrder=(()=>{
    try{
      const prefix='#flow-order=';
      if(location.hash.startsWith(prefix)){
        const order=JSON.parse(decodeURIComponent(location.hash.slice(prefix.length)));
        if(order?.submission&&Array.isArray(order.submission.courses))return order;
      }
      const saved=JSON.parse(localStorage.getItem('teacher-scheduling-v3-full-flow-orders')||'[]');
      return (Array.isArray(saved)?saved.find(order=>order?.submission&&Array.isArray(order.submission.courses)):null)
        ||{id:1,course:'授课反馈产品验收-英联邦学科-ALEVEL-商务&会计-1v1-新增',...window.smartSchedulingV3DemoOrder};
    }catch{return {id:1,course:'授课反馈产品验收-英联邦学科-ALEVEL-商务&会计-1v1-新增',...window.smartSchedulingV3DemoOrder}}
  })();
  const flowSubmission=flowOrder?.submission;
  const renewalPreview=flowOrder?.source==='homeroom-renewal';
  const lessonChange=flowOrder?.source==='homeroom-change'?flowOrder.change:null;
  const homeroomSupplement=window.parent!==window&&(flowOrder?.source==='homeroom'||renewalPreview||lessonChange)&&
    new URLSearchParams(location.search).has('embed-homeroom-supplement');
  const homeroomNewOrder=homeroomSupplement&&flowOrder?.source==='homeroom';
  const studentNumber=flowSubmission?.customerNo||flowSubmission?.studentInfo?.number;
  const lockedSlotChoices=new Map();
  const lockedSlotModes=new Set();
  let activeSlotLocks=window.studentSlotLocks.active();
  const locksForTeacher=teacher=>homeroomNewOrder&&teacher
    ?activeSlotLocks.filter(lock=>lock.student===studentNumber&&lock.expiresAt>Date.now()&&window.studentSlotLocks.sameTeacher(lock.teacher,teacher))
    :[];
  const slotIsHeld=(teacher,day,time)=>teacher&&activeSlotLocks.some(lock=>
    lock.expiresAt>Date.now()&&window.studentSlotLocks.sameTeacher(lock.teacher,teacher)&&changeSlotsConflict(day,time,lock));
  function notifyHomeroomSupplement(kind,data={}){
    window.parent.postMessage({kind,...data},location.origin);
  }
  window.currentEducatorFlowOrder = flowOrder;
  const consultPreview=Boolean(flowOrder?.consultPreview);
  const submittedStrategy=flowOrder?.strategyAnalysis?.strategy;
  // Older submitted orders were saved with a creation time and supplement history before analysis status was stored.
  const legacySubmittedOrder=Number.isInteger(flowOrder?.id)&&!!flowOrder.created&&Array.isArray(flowOrder.supplements);
  const hasUnresolvedPrecheck=!!flowOrder?.precheckIssues?.length&&!flowOrder?.supplements?.length;
  const strategyAnalysisStatus=flowOrder?.strategyAnalysis?.status
    ||(submittedStrategy?'SUCCESS':hasUnresolvedPrecheck?'BUSINESS_FAILED':legacySubmittedOrder?'SUCCESS':'NOT_STARTED');
  const flowStudentName=flowSubmission?.student||'托福组合排课测试学生';
  const packageClassPrefix=(pack,withStudent=true)=>[withStudent?flowStudentName:'',pack.system||'',pack.item||'',(pack.courses||[]).map(course=>course.name).join('&')].filter(Boolean).join('-');
  const flowOrderTitle=renewalPreview?flowOrder.course:flowSubmission?(flowSubmission.packages?.length?flowSubmission.packages.map((pack,pi)=>packageClassPrefix(pack,pi===0)).join('/')+'-1V1':flowOrder.course||`${flowStudentName}-${flowSubmission.courses.map(course=>course.name).join('&')}-1v1`):'托福听说读写组合排课-1v1';
  const flowFinishesAll=flowSubmission?.endMode==='FINISH_ALL';
  const defaultOrderDates={start:flowSubmission?.start||'2026-09-01',end:flowFinishesAll?'':flowSubmission?.end||'2026-12-30'};
  const orderDates={...defaultOrderDates};
  const endRules=['指定结课日期','排完全部课程结束'];
  const normalizeOrderEndRule=value=>value==='按开结课日期排课'?endRules[0]:value==='排完课程为止'?endRules[1]:endRules.includes(value)?value:endRules[0];
  const scheduleTimezoneOptions=[
    ['Asia/Shanghai','中国 · 北京'],
    ['Europe/London','英国 · 伦敦'],
    ['America/New_York','美国 · 纽约'],
    ['America/Los_Angeles','美国 · 洛杉矶'],
    ['Australia/Sydney','澳大利亚 · 悉尼'],
    ['Asia/Tokyo','日本 · 东京'],
    ['Asia/Singapore','新加坡'],
    ['Asia/Dubai','阿联酋 · 迪拜']
  ];
  const archivedOrderText = '写作30课时：单节可用2、1.5或1课时；9月每周固定1节，固定周一18:30—20:30；10月、11月每周可排2—3节，优先周三、周四10:20—12:30，10月23日全天不可排，周五18:30—20:30不可排；12月排完剩余课时。听力30课时：9月每周1—2节，优先周中08:20—12:20；10月每周1—2节，优先周三、周四10:30—12:30；12月排完剩余课时。口语30课时：9月每月3—4节，固定周二10:30—12:30；10月每月3—4节，优先周三、周四10:30—12:30；11月至12月每周1—2节，优先周六、周日08:20—10:20。阅读30课时：9月每两周1节，优先周二、周四14:30—16:30；10月、11月每月2—3节，优先周中14:30—16:30；12月排完剩余课时。10月1日至7日全天不可排；10月8日至10日早课（08:20—10:20）不可排。';
  const orderText=flowSubmission?flowSubmission.requirement||'--':archivedOrderText;
  const templateCourses = [
    { id:'writing', name:'托福-写作-线下', hours:30, lessonOptions:[2,1.5,1], mode:'线下', campus:'雅仕校区', tags:['严格严肃','循序善诱'], history:[['郑扬扬(VA000755)','当前'],['荷超(VA000144)','历史'],['崔昕瑜(VA001736)','历史']], ai:'单节可用2、1.5或1课时，优先按最长课节安排。9月每周固定1节，固定周一18:30—20:30。9月首周从周二开始，无周一固定时段，首周目标为0节；10—11月每周2—3节，优先周三、周四上午；10月23日全天不可排，周五18:30—20:30不可排；12月排完剩余课节。', segments:[['2026-09-01','2026-09-30','每周固定1节','固定周一18:30—20:30'],['2026-10-08','2026-11-30','每周2—3节','优先周三、周四10:20—12:30'],['2026-12-01','2026-12-30','排完剩余课程','不限制']], funnel:[326,29,12,6,3], candidates:[
      { name:'郑扬扬(VA000755)', relation:'当前授课老师', slots:24, periods:[['9月固定周一',4,6],['10—11月周频次',7,11],['截止前累计',15,24]], preference:89, reason:'固定周一全部覆盖，最紧周期仍有2个可替换时段。' },
      { name:'荷超(VA000144)', relation:'历史授课老师', slots:22, periods:[['9月固定周一',4,5],['10—11月周频次',7,12],['截止前累计',15,22]], preference:94, reason:'全部周期可排，但9月固定时段余量仅1个。' },
      { name:'崔昕瑜(VA001736)', relation:'历史授课老师', slots:20, periods:[['9月固定周一',4,5],['10—11月周频次',7,10],['截止前累计',15,20]], preference:85, reason:'满足总量及频次；优先时段覆盖略低。' }
    ]},
    { id:'listening', name:'托福-听力-线下', hours:30, mode:'线下', campus:'雅仕校区', tags:['严格严肃','循序善诱'], history:[['王紫(VA001968)','当前'],['崔昕瑜(VA001736)','历史'],['夏红微(VA002413)','历史']], ai:'9月和10月每周1—2节，优先上午。11—12月在剩余有效日期内排完课程总量；老师需覆盖每周最低课节和结课前累计课节。', segments:[['2026-09-01','2026-09-30','每周1—2节','优先周中08:20—12:20'],['2026-10-08','2026-10-31','每周1—2节','优先周三、周四10:30—12:30'],['2026-11-01','2026-12-30','排完剩余课程','不限制']], funnel:[326,34,15,7,3], candidates:[
      { name:'王紫(VA001968)', relation:'当前授课老师', slots:27, periods:[['9月自然周',1,3],['10月自然周',1,4],['截止前累计',15,27]], preference:92, reason:'各自然周最低要求均可覆盖，上午优先时段较充足。' },
      { name:'夏红微(VA002413)', relation:'历史授课老师', slots:25, periods:[['9月自然周',1,2],['10月自然周',1,4],['截止前累计',15,25]], preference:97, reason:'优先时段覆盖高；9月有一周的可替换时段较少。' },
      { name:'崔昕瑜(VA001736)', relation:'历史授课老师', slots:23, periods:[['9月自然周',1,2],['10月自然周',1,3],['截止前累计',15,23]], preference:84, reason:'能够排满课程，部分课节需使用普通可排时段。' }
    ]},
    { id:'speaking', name:'托福-口语-线下', hours:30, mode:'线下', campus:'雅仕校区', tags:['严格严肃','循序善诱'], history:[['王紫(VA001968)','当前'],['姜雪竹(VA002901)','历史']], ai:'9月每月3—4节，周二10:30—12:30为固定时段；10月每月3—4节，优先周三、周四上午；11月至12月每周1—2节，优先周末早课。', segments:[['2026-09-01','2026-09-30','每月3—4节','固定周二10:30—12:30'],['2026-10-08','2026-10-31','每月3—4节','优先周三、周四10:30—12:30'],['2026-11-01','2026-12-30','每周1—2节','优先周六、周日08:20—10:20']], funnel:[326,31,13,5,3], candidates:[
      { name:'姜雪竹(VA002901)', relation:'历史授课老师', slots:23, periods:[['9月固定周二',4,6],['10月月频次',3,5],['11—12月周频次',1,3]], preference:91, reason:'每个固定周二均可授课，月频次与周频次均有安全余量。' },
      { name:'王紫(VA001968)', relation:'当前授课老师', slots:24, periods:[['9月固定周二',4,5],['10月月频次',3,7],['11—12月周频次',1,4]], preference:95, reason:'优先时段匹配高，但9月固定时段余量只有1个。' },
      { name:'崔昕瑜(VA001736)', relation:'', slots:21, periods:[['9月固定周二',4,5],['10月月频次',3,5],['11—12月周频次',1,3]], preference:83, reason:'可完成全量课程；周末优先时段覆盖较少。' }
    ]},
    { id:'reading', name:'托福-阅读-线下', hours:30, mode:'线下', campus:'雅仕校区', tags:['严格严肃','循序善诱'], history:[['郑扬扬(VA000755)','当前'],['杨红艳(VA001642)','历史'],['姜雪竹(VA002901)','历史']], ai:'9月每两周1节，优先周二或周四14:30—16:30；10月、11月每月2—3节，优先工作日下午；12月排完剩余课程。双周以要求开始日期所在自然周为第一周，不拆成每周目标。', segments:[['2026-09-01','2026-09-30','每两周1节','优先周二、周四14:30—16:30'],['2026-10-08','2026-11-30','每月2—3节','优先周中14:30—16:30'],['2026-12-01','2026-12-30','排完剩余课程','不限制']], funnel:[326,27,11,5,3], candidates:[
      { name:'杨红艳(VA001642)', relation:'历史授课老师', slots:25, periods:[['9月自然双周',1,3],['10—11月自然月',2,5],['截止前累计',15,25]], preference:88, reason:'双周与月度最低要求均覆盖，最紧周期余量2个。' },
      { name:'郑扬扬(VA000755)', relation:'当前授课老师', slots:26, periods:[['9月自然双周',1,2],['10—11月自然月',2,5],['截止前累计',15,26]], preference:91, reason:'总交集较多，但首个双周只有1个可替换时段。' },
      { name:'姜雪竹(VA002901)', relation:'历史授课老师', slots:22, periods:[['9月自然双周',1,2],['10—11月自然月',2,4],['截止前累计',15,22]], preference:85, reason:'全程可排；部分下午优先时段需用普通时间替代。' }
    ]}
  ];
  const courses=flowSubmission?flowSubmission.courses.map((source,index)=>{
    const template=templateCourses[index%templateCourses.length];
    const historical=String(source.historicalTeacher||'').split(/[、，,]/).map(name=>name.trim()).filter(name=>name&&!['...','--','无'].includes(name));
    const current=String(source.currentTeacher||'').trim();
    const history=[...(current&&current!=='无'&&current!=='--'?[[current,'当前']]:[]),...historical.map(name=>[name,'历史'])];
    const start=flowSubmission.start||defaultOrderDates.start,end=flowFinishesAll?'':flowSubmission.end||defaultOrderDates.end;
    return {...template,id:`course-${index+1}`,isHistoricalCourse:source.isHistoricalCourse===true,package:source.package||'',name:[source.item||'ALEVEL',source.name,source.board,source.mode].filter(Boolean).join('-'),hours:Number(source.hours)||10,
      lessonOptions:[2],mode:source.mode||'线下',campus:source.campus&&source.campus!=='/'?source.campus:'不限',tags:[],history,
      ai:`原排课要求：${flowSubmission.requirement||(flowSubmission.preciseTime?'按指定星期和时段排课':'未填写')}。${flowOrder.supplements?.length?`顾问补充：${flowOrder.supplements.map(item=>item.text).join('；')}。`:''}`,
      segments:[[start,end,'每周1—2节','常规']]};
  }):templateCourses;
  const flowClassGroups=flowSubmission?.packages?.length?(()=>{
    let offset=0;
    return flowSubmission.packages.map((pack,index)=>{
      const relatedCourses=courses.slice(offset,offset+(pack.courses?.length||0));
      offset+=pack.courses?.length||0;
      const displayName=(pack.system||pack.item)?`${packageClassPrefix(pack)}-1V1`:(pack.name||`课程包${index+1}`);
      return {name:displayName,index:index+1,courses:relatedCourses};
    });
  })():[];
  // 班级统一使用蓝色标识，不再按班级区分配色
  const classColors=Array.from({length:6},()=>['#185FA5','#E6F1FB']);
  const courseClassInfo=courseId=>{
    const gi=flowClassGroups.findIndex(group=>group.courses.some(course=>course.id===courseId));
    const color=classColors[(gi>=0?gi:0)%classColors.length];
    return {index:gi,group:gi>=0?flowClassGroups[gi]:null,color};
  };
  const teacherDepartment='唯寻上海-英联邦浦西中心-班课教学部-教学组';
  const teacherSchedulingStatus={
    '郑扬扬(VA000755)':'引导',
    '王紫(VA001968)':'可排',
    '荷超(VA000144)':'引导',
  };
  const demoCourseStatuses={
    '杨红艳(VA001642)':'待审批-新生',
    '崔昕瑜(VA001736)':'待审批-新生&老生',
    '夏红微(VA002413)':'停排-新生',
    '姜雪竹(VA002901)':'停排-老生&新生'
  };
  const courseSchedulingStatus=Object.fromEntries(courses.map(course=>[course.id,{...demoCourseStatuses}]));
  // 原型排课单的发起人所属架构；正式系统从排课单发起人档案读取。
  const orderInitiatorOrg='union_sales';
  const teacherOrgInfo={
    '郑扬扬(VA000755)':{id:'union_puxi_teaching',parents:['union_puxi','union'],department:teacherDepartment},
    '王紫(VA001968)':{id:'union_puxi_teaching',parents:['union_puxi','union'],department:teacherDepartment},
    '姜雪竹(VA002901)':{id:'union_puxi_tutoring',parents:['union_puxi','union'],department:'唯寻上海-英联邦浦西中心-一对一教学组'},
    '荷超(VA000144)':{id:'oxmu_teaching',parents:['oxmu'],department:'唯寻上海-橡沐教学中心-教学部'},
    '崔昕瑜(VA001736)':{id:'union_puxi_teaching',parents:['union_puxi','union'],department:teacherDepartment},
    '夏红微(VA002413)':{id:'oxmu_teaching',parents:['oxmu'],department:'唯寻上海-橡沐教学中心-教学部'},
    '杨红艳(VA001642)':{id:'union_puxi_teaching',parents:['union_puxi','union'],department:teacherDepartment}
  };
  const teacherDepartmentFor=name=>teacherOrgInfo[name]?.department||teacherDepartment;
  const teacherOrgLabels={union:'英联邦',union_puxi:'英联邦浦西',union_puxi_teaching:'浦西班课教学部',union_puxi_tutoring:'浦西一对一教学组',union_pudong:'英联邦浦东',union_suzhou:'苏州分校',oxmu:'橡沐',oxmu_teaching:'橡沐教学部',oxmu_tutoring:'橡沐辅导组'};
  const teacherOrgFullNames={
    union:'唯寻上海-英联邦',union_puxi:'唯寻上海-英联邦浦西',union_puxi_teaching:'唯寻上海-英联邦浦西-班课教学部',union_puxi_tutoring:'唯寻上海-英联邦浦西-一对一教学组',
    union_pudong:'唯寻上海-英联邦浦东',union_pudong_teaching:'唯寻上海-英联邦浦东-教学部',union_suzhou:'唯寻江苏-唯寻苏州',union_suzhou_teaching:'唯寻江苏-唯寻苏州-教学部',
    oxmu:'唯寻上海-橡沐中心',oxmu_teaching:'唯寻上海-橡沐中心-教学部',oxmu_tutoring:'唯寻上海-橡沐中心-辅导组',full_day:'唯寻上海-全日制学科',full_day_teaching:'唯寻上海-全日制学科-学科教学部'
  };
  const priorityPreviewRules=(()=>{
    try {
      const prefix='#teacher-priority-preview=';
      if(!window.location.hash.startsWith(prefix)) return null;
      const rules=JSON.parse(decodeURIComponent(window.location.hash.slice(prefix.length)));
      return Array.isArray(rules)&&rules.every(rule=>Array.isArray(rule.tiers)&&Array.isArray(rule.conditions))?rules:null;
    } catch { return null; }
  })();
  const educatorTeacherFlow=!homeroomSupplement&&!consultPreview&&!priorityPreviewRules;
  const educatorRegenerateLabel='确认修改并重新生成方案';
  const educatorSpecifiedCourses=new Set();
  let educatorStrategyEdit=null;
  let educatorRequirementText=null;
  let educatorRequirementDraft=null;
  let educatorAnalysisIssues=[];
  let educatorRequirementReturn=false;
  // 原型示例资质；正式推荐需改为读取教师档案与授课资格。
  const teacherProfiles={
    '郑扬扬(VA000755)':{modes:['线下','线上'],level:'普通',trial:true,trialApproval:false,diagnosis:true,selfOrganized:true,studentLevels:['先修/同步-B及以上（可带B,A,A*）','先修/同步-B及以下（可带B,C,D及以下）'],campuses:['雅仕校区'],gender:'男老师',styles:['严格严肃','循序善诱','疑难专家'],position:'全职'},
    '荷超(VA000144)':{modes:['线下'],level:'金牌',trial:true,trialApproval:true,diagnosis:false,selfOrganized:true,studentLevels:['先修/同步-B及以上（可带B,A,A*）','备考-B及以上（可带B,A,A*）'],campuses:['雅仕校区','浦东校区'],gender:'男老师',styles:['严格严肃','循序善诱','可全英文'],position:'全职'},
    '崔昕瑜(VA001736)':{modes:['线下','线上'],level:'普通',trial:false,trialApproval:false,diagnosis:true,selfOrganized:false,studentLevels:['先修/同步-B及以下（可带B,C,D及以下）','备考-B及以下（可带B,C,D及以下）'],campuses:['雅仕校区'],gender:'女老师',styles:['严格严肃','循序善诱','温柔耐心'],position:'兼职'},
    '王紫(VA001968)':{modes:['线下','线上'],level:'普通',trial:true,trialApproval:false,diagnosis:true,selfOrganized:false,studentLevels:['先修/同步-B及以上（可带B,A,A*）','备考-B及以上（可带B,A,A*）'],campuses:['雅仕校区'],gender:'女老师',styles:['严格严肃','循序善诱','热情活泼'],position:'全职'},
    '夏红微(VA002413)':{modes:['线下','线上'],level:'金牌',trial:true,trialApproval:true,diagnosis:false,selfOrganized:true,studentLevels:['先修/同步-B及以下（可带B,C,D及以下）','备考-B及以下（可带B,C,D及以下）'],campuses:['雅仕校区'],gender:'女老师',styles:['严格严肃','循序善诱','生动形象'],position:'兼职'},
    '姜雪竹(VA002901)':{modes:['线下','线上'],level:'普通',trial:true,trialApproval:false,diagnosis:true,selfOrganized:true,studentLevels:['先修/同步-B及以上（可带B,A,A*）','备考-B及以上（可带B,A,A*）'],campuses:['雅仕校区','浦东校区'],gender:'女老师',styles:['严格严肃','循序善诱','风趣幽默'],position:'全职'},
    '杨红艳(VA001642)':{modes:['线下'],level:'普通',trial:false,trialApproval:false,diagnosis:true,selfOrganized:true,studentLevels:['先修/同步-B及以下（可带B,C,D及以下）','备考-B及以下（可带B,C,D及以下）'],campuses:['雅仕校区'],gender:'女老师',styles:['严格严肃','循序善诱','温柔耐心'],position:'实习'}
  };
  if(flowSubmission)Object.values(teacherProfiles).forEach(profile=>{
    profile.modes=[...new Set([...profile.modes,'线上','线下'])];
    profile.campuses=[...new Set([...profile.campuses,...flowSubmission.courses.map(course=>course.campus).filter(campus=>campus&&campus!=='/')])];
  });
  const teacherCampusOptions=['雅仕校区','鸿寿校区','浦东校区','舜元中心','南山校区','望京校区','海淀校区','鸿港校区','苏悦校区','时代校区','长安国际校区','长安国际校区2','福田校区'];
  const teacherStudentLevelOptions=['先修/同步-B及以上（可带B,A,A*）','先修/同步-B及以下（可带B,C,D及以下）','备考-B及以上（可带B,A,A*）','备考-B及以下（可带B,C,D及以下）'];
  const teacherStyleOptions=['风趣幽默','可全英文','热情活泼','严格严肃','循序善诱','疑难专家','生动形象','温柔耐心'];
  const defaultTeacherRequirement=course=>({mode:course.mode,campus:course.campus,level:'',trial:'',diagnosis:'',selfOrganized:'',studentLevel:'',gender:'',styles:[...course.tags],position:''});
  function normalizeTeacherRequirement(course,saved) {
    const requirement={...defaultTeacherRequirement(course),...(saved||{})};
    if(requirement.mode==='OMO') requirement.mode='线上/线下';
    if(requirement.level==='不限'||requirement.level==='资深') requirement.level='';
    if(requirement.trial==='是') requirement.trial='可带试听';
    if(requirement.trial==='否') requirement.trial='';
    if(requirement.diagnosis==='是') requirement.diagnosis='可带诊断';
    if(requirement.diagnosis==='否') requirement.diagnosis='';
    if(requirement.selfOrganized==='是') requirement.selfOrganized='可带自组班';
    if(requirement.selfOrganized==='否') requirement.selfOrganized='';
    if(requirement.studentLevel==='不限'||['基础','中等','进阶'].includes(requirement.studentLevel)) requirement.studentLevel='';
    if(requirement.campus==='不限') requirement.campus='';
    if(!Array.isArray(requirement.styles)) requirement.styles=[...course.tags];
    return requirement;
  }
  const teacherStatus=name=>teacherSchedulingStatus[name]||'可排';
  const courseStatus=(course,name)=>courseSchedulingStatus[course.id]?.[name]||'可排';
  const teacherLoadExample=[[333,13],[131.25,14],[141,15],[215,16],[208.5,17],[185.5,18],[136.25,19],[370.5,20],[102,21],[65.5,22],[11,23],[24,24]];
  const teacherLoadView={name:'',year:2026,showTags:false};
  const teacherScheduleView={teacher:'',timezone:'Asia/Shanghai',queried:false};
  const templateResultLessons = [
    ...['2026-09-07','2026-09-14','2026-09-21','2026-09-28'].map(date=>[date,'18:30-20:30','writing']),
    ...['2026-10-15','2026-10-22'].map(date=>[date,'10:20-12:30','writing']),
    ...['2026-09-02','2026-09-09','2026-09-16','2026-09-23','2026-09-30','2026-10-14','2026-10-21','2026-10-28','2026-11-04','2026-11-11','2026-11-18','2026-11-25','2026-12-02','2026-12-09'].map(date=>[date,'08:20-10:20','listening',date==='2026-09-02'?'我最多能放二十个字数二十个字数，我最多能放二十个字数':'']),
    ['2026-10-08','10:30-12:30','listening'],
    ...['2026-09-01','2026-09-08','2026-09-15','2026-09-22','2026-10-20'].map(date=>[date,'10:30-12:30','speaking']),
    ...['2026-09-03','2026-09-17','2026-09-29'].map(date=>[date,'14:30-16:30','reading'])
  ].sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
  const demoResultLessons=flowSubmission?(()=>{
    const start=new Date(`${defaultOrderDates.start}T00:00:00Z`),end=defaultOrderDates.end?new Date(`${defaultOrderDates.end}T00:00:00Z`):new Date(start.getTime()+90*86400000);
    const days=[];
    for(let day=start.getTime();day<=end.getTime()&&days.length<150;day+=86400000)days.push(new Date(day).toISOString().slice(0,10));
    const availableDays=days.length?days:[defaultOrderDates.start];
    return courses.flatMap((course,index)=>Array.from({length:Math.ceil(course.hours/2)},(_,lesson)=>[
      availableDays[Math.min(lesson*3+index,availableDays.length-1)],index%2?'10:30-12:30':'08:20-10:20',course.id
    ])).sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
  })():templateResultLessons;

  const versionStorageKey=flowSubmission?`teacher-schedule-v3-full-flow-versions-${flowOrder.id}`:'teacher-schedule-v3-full-flow-archive-preview';
  function loadVersions() {
    try {
      const saved=JSON.parse(localStorage.getItem(versionStorageKey)||'[]');
      if(!Array.isArray(saved)) return [];
      const valid=saved.filter(item=>item&&item.id&&item.name&&item.snapshot?.draft&&Array.isArray(item.snapshot.resultLessons));
      return valid.map((item,index)=>({...item,planNo:item.planNo||valid.length-index,kind:item.kind||item.snapshot.planMode||'智能排课',createdAt:item.createdAt||item.snapshot.createdAt||item.savedAt||item.name,savedAt:item.savedAt||item.name}));
    } catch { return []; }
  }
  function persistVersions(versions) {
    try { localStorage.setItem(versionStorageKey,JSON.stringify(versions)); return true; }
    catch { return false; }
  }
  const copyData=value=>JSON.parse(JSON.stringify(value));
  const state = { step:1, supplement:flowOrder?.supplements?.map(item=>item.text).join('\n')||'', files:[], aiAnalysisError:'', requirementConversation:null, direct:{}, selected:{}, editingSpecifiedCourseId:null, teacherRequirements:Object.fromEntries(courses.map(course=>[course.id,defaultTeacherRequirement(course)])), editingTeacherRequirements:false, teacherRequirementDrafts:null, orderEndRule:flowFinishesAll?endRules[1]:endRules[0], scheduleTimezone:'Asia/Shanghai', editing:false, strategyEditFromTeachers:false, dirty:false, draft:null, aiSnapshot:null, coursePlans:null, expandedPlanCourseId:null, recommended:false, completed:false, restartingSchedule:false, resultLessons:[], selectedResultLessons:new Set(), newPlacedLessons:new Set(), pickedSlots:new Set(), versions:loadVersions(), activeVersionId:null, planMode:'智能排课', pendingPlanVersionId:null, currentPlanCreatedAt:null, sideCollapsed:true, lessonAdjustSource:null, lessonConfirm:null };
  state.expandedTeacherRequirementIds=new Set();
  if(renewalPreview){
    flowSubmission.courses.forEach((course,index)=>{
      const selected=course.specifiedTeacher;
      if(course.isHistoricalCourse&&courses[index].history.some(([name])=>name===selected)){
        state.direct[courses[index].id]=selected;
      }
    });
  }
  window.getEducatorScheduleLogContext=()=>{
    const groups=flowClassGroups.length?flowClassGroups:[{name:flowOrderTitle,index:1,courses}];
    const sourceCourses=flowSubmission?.courses||[];
    return {
      orderId:flowOrder.id,
      created:flowOrder.created||'2026-11-04 16:51:42',
      operator:flowOrder.handler||'李春玲',
      groups:groups.map(group=>({
        name:group.name,
        number:flowSubmission?.packages?.[group.index-1]?.classNumber||flowOrder.classNumber||flowOrder.classNo||'1123456789',
        courseIds:group.courses.map(course=>course.id)
      })),
      courses:courses.map((course,index)=>{
        const source=sourceCourses[index]||{};
        return {id:course.id,name:[source.item||course.name.split('-')[0],source.name||course.name,source.board,source.mode||course.mode].filter(Boolean).join('-'),teacher:source.currentTeacher&&source.currentTeacher!=='--'&&source.currentTeacher!=='无'?source.currentTeacher:source.historicalTeacher||course.history?.[0]?.[0]||'--',room:source.room||'--'};
      }),
      lessons:(state.restartingSchedule?[]:state.completed?state.resultLessons:demoResultLessons).map(row=>row.slice(0,3))
    };
  };
  function initialCourseSegments(course) {
    return course.segments.map(s=>{
      const frequency=frequencySpec(s[2]);
      const time=parseTimeRequirement(s[3]);
      const strategyStart=s[0]==='2026-10-08'?'2026-10-01':s[0];
      const demoWritingLimit=course.id==='writing'&&s[0]==='2026-10-08';
      const octoberLimits=strategyStart==='2026-10-01'?[{dateFrom:'2026-10-01',dateTo:'2026-10-07',weekdays:[],allDay:true,startTime:'',endTime:''},{dateFrom:'2026-10-08',dateTo:'2026-10-10',weekdays:[],allDay:false,startTime:'08:20',endTime:'10:20'}]:[];
      const writingLimits=demoWritingLimit?[{dateFrom:'2026-10-23',dateTo:'2026-10-23',weekdays:[],allDay:true,startTime:'',endTime:''},{dateFrom:'',dateTo:'',weekdays:['周五'],allDay:false,startTime:'18:30',endTime:'20:30'}]:[];
      const timeRules=time.mode==='常规'?[{type:'常规',weekdays:[],allDay:false,start:'',end:''}]:time.slots.map(slot=>({...slot,allDay:false,type:time.mode}));
      const segment={start:strategyStart,end:s[1],frequency:s[2],frequencyPeriod:frequency.period,frequencyMin:frequency.min||1,frequencyMax:frequency.max||1,lessonCount:'',weekCap:'无特殊要求',time:s[3],timeRules,completion:s[2]==='排完剩余课程'?'排完剩余课程':'按频次排课',dayCap:'1',unavailableTimeRules:[...octoberLimits,...writingLimits]};
      segment.time=formatTimeRequirement(segment);
      if(segment.completion==='按频次排课') segment.frequency=formatFrequency(segment);
      normalizeCourseDayCap(segment);
      return segment;
    });
  }
  const initialDraft = () => ({ global:{weekCap:'无特殊要求',dayCap:'无特殊要求',method:'随机排课'}, courseLessonHours:Object.fromEntries(courses.map(c=>[c.id,2])), availability:{fullDayStops:[],blockedSlots:[]}, courses:Object.fromEntries(courses.map(c=>[c.id,initialCourseSegments(c)])) });
  function loadSubmittedStrategy() {
    const draft=initialDraft();
    for(const course of courses) {
      const segment=draft.courses[course.id][0];
      const {start,end,frequencyPeriod,frequencyMin,frequencyMax,timeRules}=submittedStrategy;
      Object.assign(segment,{start,end,frequencyPeriod,frequencyMin,frequencyMax,timeRules:copyData(timeRules),unavailableTimeRules:[]});
      segment.frequency=formatFrequency(segment);
      segment.time=formatTimeRequirement(segment);
      normalizeCourseDayCap(segment);
    }
    return draft;
  }
  function simpleTeacherTimeDraft() {
    const draft=initialDraft();
    const start=utcDate(orderDates.start),end=utcDate(orderDates.end);
    const weeks=state.orderEndRule===endRules[0]&&end>=start
      ?new Set(Array.from({length:daysBetween(start,end)},(_,i)=>periodBounds(new Date(start.getTime()+i*DAY),'week',orderDates.start)[0].getTime())).size
      :0;
    for(const course of courses) {
      const lessons=Math.ceil(course.hours/2);
      const lower=weeks?Math.max(1,Math.floor(lessons/weeks)):1;
      const upper=weeks?Math.max(lower,Math.ceil(lessons/weeks)):3;
      const segment={start:orderDates.start,end:state.orderEndRule===endRules[0]?orderDates.end:'',frequencyPeriod:'week',frequencyMin:lower,frequencyMax:upper,lessonCount:'',weekCap:'无特殊要求',timeRules:[{type:'常规',weekdays:[],allDay:false,start:'',end:''}],completion:'按频次排课',dayCap:'1',unavailableTimeRules:[]};
      segment.frequency=formatFrequency(segment);segment.time=formatTimeRequirement(segment);
      draft.courses[course.id]=[segment];
    }
    return draft;
  }
  function normalizeDraft(savedDraft) {
    const draft=copyData(savedDraft);
    if(Array.isArray(draft.global?.stages)) {
      const active=draft.global.stages.find(stage=>stage.status!=='全天停排');
      draft.availability={
        fullDayStops:draft.global.stages.filter(stage=>stage.status==='全天停排').map(({start,end})=>({start,end})),
        blockedSlots:copyData(draft.global.blockedSlots||[])
      };
      draft.global={weekCap:active?.weekCap||'无特殊要求',dayCap:active?.dayCap||'无特殊要求',method:active?.method||'随机排课'};
    }
    draft.availability ||= {fullDayStops:[],blockedSlots:[]};
    draft.courseLessonHours ||= Object.fromEntries(courses.map(c=>[c.id,2]));
    draft.availability.fullDayStops ||= [];
    draft.availability.blockedSlots ||= [];
    for(const segments of Object.values(draft.courses||{})) for(const segment of segments) {
      if(!Array.isArray(segment.timeRules)) segment.timeRules=segment.timeMode==='常规'||!segment.timeSlots?.length
        ?[{type:'常规',weekdays:[],allDay:false,start:'',end:''}]
        :segment.timeSlots.map(slot=>({...slot,allDay:false,type:segment.timeMode||'优先'}));
      segment.timeRules.forEach(rule=>{rule.allDay=Boolean(rule.allDay);});
      segment.time=formatTimeRequirement(segment);
      delete segment.timeMode;
      delete segment.timeSlots;
      if(!Array.isArray(segment.unavailableTimeRules)) {
        segment.unavailableTimeRules=[
          ...(segment.blockedDates||[]).map(stop=>stop.kind==='WEEKLY'
            ?{dateFrom:'',dateTo:'',weekdays:[stop.weekday],allDay:true,startTime:'',endTime:''}
            :{dateFrom:stop.start,dateTo:stop.end,weekdays:[],allDay:true,startTime:'',endTime:''}),
          ...(segment.avoidTimeSlots||[]).map(slot=>slot.kind==='DATE'
            ?{dateFrom:slot.date,dateTo:slot.date,weekdays:[],allDay:false,startTime:slot.start,endTime:slot.end}
            :{dateFrom:'',dateTo:'',weekdays:[slot.weekday],allDay:false,startTime:slot.start,endTime:slot.end})
        ];
      }
      const segmentStart=segment.start,segmentEnd=segment.end||'';
      const clippedRule=(start,end,allDay,startTime='',endTime='')=>{
        const from=start<segmentStart?segmentStart:start;
        const to=segmentEnd&&end>segmentEnd?segmentEnd:end;
        return from<=to?{dateFrom:from,dateTo:to,weekdays:[],allDay,startTime,endTime}:null;
      };
      for(const stop of draft.availability.fullDayStops) {
        const rule=clippedRule(stop.start,stop.end,true);
        if(rule&&!segment.unavailableTimeRules.some(existing=>JSON.stringify(existing)===JSON.stringify(rule))) segment.unavailableTimeRules.push(rule);
      }
      for(const slot of draft.availability.blockedSlots) {
        const rule=clippedRule(slot.start,slot.end,false,slot.from,slot.to);
        if(rule&&!segment.unavailableTimeRules.some(existing=>JSON.stringify(existing)===JSON.stringify(rule))) segment.unavailableTimeRules.push(rule);
      }
      delete segment.blockedDates;
      delete segment.avoidTimeSlots;
    }
    draft.availability={fullDayStops:[],blockedSlots:[]};
    return draft;
  }
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const scheduleTimezoneLabel = timezone => {
    const option=scheduleTimezoneOptions.find(([id])=>id===timezone);
    return option?`${option[1]}（${timezone}）`:timezone||'未选择';
  };
  function validScheduleTimezone(timezone) {
    if(!timezone||!timezone.includes('/')||timezone.startsWith('Etc/')) return false;
    try { new Intl.DateTimeFormat('zh-CN',{timeZone:timezone}); return true; }
    catch { return false; }
  }
  function scheduleTimezoneContext() {
    return `<div class="schedule-timezone-context"><span>上课时区</span><strong>${escapeHtml(scheduleTimezoneLabel(state.scheduleTimezone))}</strong></div>`;
  }
  const displayDate = value => String(value ?? '').replaceAll('-','/');
  const plainName = name => String(name).replace(/\(.+\)/,'');
  const teacherRequirementFor=course=>state.teacherRequirements[course.id];
  function matchesTeacherRequirements(course,teacherName) {
    const requirement=teacherRequirementFor(course),profile=teacherProfiles[teacherName];
    if(!profile) return false;
    return (!requirement.mode||requirement.mode==='线上/线下'||profile.modes.includes(requirement.mode))
      &&(!requirement.campus||requirement.mode==='线上'||profile.campuses.includes(requirement.campus))
      &&(!requirement.level||profile.level===requirement.level)
      &&(!requirement.trial||(requirement.trial==='可带试听'&&profile.trial)||(requirement.trial==='不可试听'&&!profile.trial)||(requirement.trial==='试听需直属主管审批'&&profile.trialApproval))
      &&(!requirement.diagnosis||profile.diagnosis)
      &&(!requirement.selfOrganized||profile.selfOrganized)
      &&(!requirement.studentLevel||profile.studentLevels.includes(requirement.studentLevel))
      &&(!requirement.gender||profile.gender===requirement.gender)
      &&(!requirement.styles?.length||requirement.styles.every(style=>profile.styles.includes(style)))
      &&(!requirement.position||profile.position===requirement.position);
  }
  const teacherRequirementOptions=(values,current)=>`<option value="">不限</option>${values.map(value=>`<option value="${escapeHtml(value)}" ${value===current?'selected':''}>${escapeHtml(value)}</option>`).join('')}`;
  function teacherRequirementFields(course,showSummary=true) {
    const editing=state.editingTeacherRequirements;
    const saved=teacherRequirementFor(course);
    const display=value=>value||'不限';
    const values=[`授课模式：${display(saved.mode)}`,`授课校区：${saved.mode==='线上'?'不适用':display(saved.campus)}`,`教师级别：${display(saved.level)}`,`试听课：${display(saved.trial)}`,`诊断课：${display(saved.diagnosis)}`,`自组班：${display(saved.selfOrganized)}`,`学生水平：${display(saved.studentLevel)}`,`教师性别：${display(saved.gender)}`,`教师风格：${saved.styles.length?saved.styles.join('、'):'不限'}`,`岗位类型：${display(saved.position)}`];
    const summary=`<div class="teacher-requirement-summary" id="teacher-requirement-${course.id}" ${showSummary?'':'hidden'}>${values.map(value=>`<span>${escapeHtml(value)}</span>`).join('')}</div>`;
    if(!editing) return summary;
    const requirement=state.teacherRequirementDrafts[course.id];
    const field=(label,key,options)=>`<label class="teacher-requirement-field"><span>${label}</span><select data-teacher-requirement-field="${key}">${teacherRequirementOptions(options,requirement[key])}</select></label>`;
    const styles=`<div class="teacher-requirement-field teacher-style-field"><span>教师风格</span><div class="teacher-style-select"><button type="button" class="teacher-style-trigger" data-open-teacher-styles aria-expanded="false"><span data-teacher-style-display>${escapeHtml(requirement.styles.length?requirement.styles.join('、'):'不限')}</span><b aria-hidden="true">⌄</b></button><div class="teacher-style-menu" hidden role="group" aria-label="教师风格（可多选）">${teacherStyleOptions.map(style=>`<button type="button" class="teacher-style-option ${requirement.styles.includes(style)?'is-selected':''}" data-toggle-teacher-style="${escapeHtml(style)}" aria-pressed="${requirement.styles.includes(style)}">${escapeHtml(style)}</button>`).join('')}</div></div></div>`;
    return `<div class="teacher-requirement-editor" data-teacher-requirement-course="${course.id}"><div class="teacher-requirement-fields">${field('授课模式','mode',['线上','线下','线上/线下'])}${field('授课校区','campus',teacherCampusOptions)}${field('教师级别','level',['金牌','普通'])}${field('试听课','trial',['试听需直属主管审批','不可试听','可带试听'])}${field('诊断课','diagnosis',['可带诊断'])}${field('自组班','selfOrganized',['可带自组班'])}${field('学生水平','studentLevel',teacherStudentLevelOptions)}${field('教师性别','gender',['男老师','女老师'])}${styles}${field('岗位类型','position',['全职','兼职','实习'])}</div></div>`;
  }
  const notify = message => { const t=$('#toast'); t.textContent=message; t.classList.add('show'); clearTimeout(notify.timer); notify.timer=setTimeout(()=>t.classList.remove('show'),2600); };
  const dateLabel = value => value.replaceAll('-','.');
  const avatar = '<span class="chat-avatar"><img src="ai-dialog-avatar.png" alt="AI助手"></span>';
  function teacherPriorityRules() {
    if(priorityPreviewRules) return priorityPreviewRules;
    const integrated=typeof window.getTeacherPriorityConfiguration==='function'?window.getTeacherPriorityConfiguration():null;
    if(integrated) return integrated.rules.filter(rule=>integrated.published[rule.course]);
    try {
      const saved=JSON.parse(localStorage.getItem('teacher-org-priority-demo-v4')||'null');
      if(saved&&Array.isArray(saved.rules)) return saved.rules.filter(rule=>saved.published?.[rule.course]);
    } catch { /* 浏览器禁用本地存储时，使用未配置兜底 */ }
    return [];
  }
  function teacherPriorityRuleFor(course) {
    const requirement=teacherRequirementFor(course);
    const mode=requirement.mode==='线上'?'ONLINE':'OFFLINE_OMO';
    const campusIds={'雅仕校区':'yashi','鸿寿校区':'hongshou','苏州校区':'suzhou','浦东校区':'pudong','舜元中心':'shunyuan','南山校区':'nanshan','望京校区':'wangjing','海淀校区':'haidian','苏悦校区':'suyue','时代校区':'shidai','长安国际校区':'changan','福田校区':'futian'};
    const condition=mode==='ONLINE'?orderInitiatorOrg:campusIds[requirement.campus||course.campus];
    const courseItem=course.name.startsWith('托福')?'TOEFL':course.name.split('-')[0];
    return teacherPriorityRules().find(rule=>rule.course===courseItem&&rule.mode===mode&&rule.conditions.includes(condition));
  }
  function teacherMatchedPriorityOrg(name,tier) {
    const info=teacherOrgInfo[name];
    if(!info||!tier) return null;
    const orgIds=Array.isArray(tier.orgIds)?tier.orgIds:tier.orgId?[tier.orgId]:[];
    return orgIds.find(orgId=>info.id===orgId||(tier.descendants&&info.parents.includes(orgId)))||null;
  }
  function teacherMatchesPriorityTier(name,tier) {
    const profile=teacherProfiles[name];
    if(!profile||!tier) return false;
    const job={'全职':'FULL_TIME','兼职':'PART_TIME','实习':'INTERN'}[profile.position];
    return (tier.job==='ALL'||tier.job===job)
      &&!!teacherMatchedPriorityOrg(name,tier);
  }
  function recommendTeachersForCourse(course) {
    if(!consultPreview&&state.direct[course.id])return {groups:[],teachers:[]};
    const rule=teacherPriorityRuleFor(course);
    const requirement=teacherRequirementFor(course);
    const fallback=!rule;
    const fallbackTier={fallback:true,mode:requirement.mode==='线上'?'ONLINE':'OFFLINE_OMO',campus:requirement.campus||course.campus,approvalRequired:false};
    const tiers=fallback?[fallbackTier]:rule.tiers;
    return TeacherPriorityRecommendation.recommendByPriority({
      tiers,
      teachers:course.candidates,
      requiredLessons:lessonChange?state.changeLessons.filter(row=>row[2]===course.id).length:courseLessonTotal(course),
      matchesRequirements:teacher=>matchesTeacherRequirements(course,teacher.name)&&(!lessonChange||
        teacher.name.split('(')[0].trim()!==originalChangeTeacher(course.id).split('(')[0].trim()&&
        changeTeacherCovers(course.id,teacher.name)),
      matchesTier:(teacher,tier)=>{
        if(!tier.fallback) return teacherMatchesPriorityTier(teacher.name,tier);
        const profile=teacherProfiles[teacher.name];
        return !!profile&&(tier.mode==='ONLINE'?profile.modes.includes('线上'):profile.modes.includes('线下')&&profile.campuses.includes(tier.campus));
      },
      availableLessons:teacher=>lessonChange?state.changeLessons.filter(row=>row[2]===course.id).length:teacher.slots,
      coverage:teacher=>lessonChange
        ?{total:state.changeLessons.filter(row=>row[2]===course.id).length,fixed:0,preferred:0,gap:0}
        :teacherCoverageSummary(course,teacher.name),
      limit:4
    });
  }
  const tightPeriod = teacher => teacher.periods.reduce((worst,p)=>!worst || (p[2]-p[1])/p[1]<(worst[2]-worst[1])/worst[1] ? p : worst,null);

  function renderSelfClassOrder() {
    const draft=flowSubmission.selfClass||{};
    const extra=flowSubmission.extra||{};
    let savedClass;
    try {
      const rows=JSON.parse(localStorage.getItem('teacher-scheduling-v3-self-classes')||'[]');
      savedClass=Array.isArray(rows)?rows.find(row=>row.name===flowOrder.className||row.name===flowOrder.course):null;
    } catch {}
    const display=value=>escapeHtml(value===undefined||value===null||value===''||value==='无'||value==='/'?'--':value);
    const className=String(flowOrder.className||savedClass?.name||flowOrder.course||'--').replace(/-新增$/,'');
    const classTeacher=flowOrder.classTeacher||savedClass?.teacher||'--';
    const sideField=(label,value)=>`<div class="self-class-detail-side-field"><small>${label}</small><strong>${display(value)}</strong></div>`;
    $('#orderPage').classList.add('self-class-detail');
    $('#selfClassDetailContent').hidden=false;
    $('#selfClassAssign').hidden=false;
    $('#educatorDetailType').textContent='自组班排课单';
    $('#educatorDetailClasses').innerHTML=[
      sideField('自组班编号',flowOrder.classNumber||savedClass?.number),
      sideField('自组班名称',className),
      sideField('报名日期',draft.registrationFrom&&draft.registrationTo?`${draft.registrationFrom} 至 ${draft.registrationTo}`:'--'),
      sideField('开课日期',flowSubmission.start),sideField('结课日期',flowSubmission.end),
      sideField('最大承载人数',draft.capacity),sideField('开班最低人数',draft.minimum),
      sideField('班级状态',flowOrder.classStatus||savedClass?.status||'待排课'),
      sideField('报名状态',flowOrder.registrationStatus||savedClass?.registration),
      sideField('班级介绍',draft.introduction),sideField('组班学员要求',draft.studentRequirement),
      sideField('教学目标',draft.learningGoal),sideField('班课班主任',classTeacher)
    ].join('');
    const courses=flowSubmission.courses||[];
    const courseRows=courses.map(course=>`<tr>${[course.subject||course.name,course.board,course.grade,course.module,course.mode,course.campus,course.hours,course.currentTeacher||course.teacher,course.teacherDiscussed||course.discussed].map(cell=>`<td>${display(cell)}</td>`).join('')}</tr>`).join('');
    const students=(Array.isArray(draft.students)&&draft.students.length?draft.students:[flowSubmission.student]).filter(Boolean);
    const studentRows=students.map(student=>`<tr><td>${display(student?.name||student)}</td><td>${display(flowOrder.courseAdvisor||flowOrder.applicant)}</td><td>${display(classTeacher)}</td><td>${display(flowOrder.created)}</td></tr>`).join('');
    const field=(label,value)=>`<div class="self-class-detail-fact"><span>${label}</span><b>:</b><strong>${display(value)}</strong></div>`;
    $('#selfClassDetailContent').innerHTML=`
      <section class="self-class-detail-card"><header>课程信息 <em>★ 金牌</em></header><div class="self-class-detail-card-body">
        <div class="self-class-detail-course-meta">${[['归属事业部',draft.division],['课程体系',draft.system],['课程项',draft.item],['班型',draft.classType]].map(([label,value])=>`<div><small>${label}</small><strong>${display(value)}</strong></div>`).join('')}</div>
        <h3>包含课程</h3><div class="self-class-detail-table-scroll"><table><thead><tr>${['科目','考试局','年级','模块','授课模式','校区','课时','当前授课老师','老师时间是否已沟通'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${courseRows||'<tr><td colspan="9">暂无课程</td></tr>'}</tbody></table></div>
      </div></section>
      <section class="self-class-detail-card"><header>学生列表</header><div class="self-class-detail-card-body"><div class="self-class-detail-table-scroll"><table><thead><tr><th>学生姓名</th><th>课程顾问</th><th>专属班主任</th><th>加入时间</th></tr></thead><tbody>${studentRows||'<tr><td colspan="4">暂无学生</td></tr>'}</tbody></table></div></div></section>
      <section class="self-class-detail-card"><header>排课单详情</header><div class="self-class-detail-card-body self-class-detail-facts">
        <div class="self-class-detail-fact-row">${field('排课单状态',flowOrder.status)}${field('排课单属性',flowOrder.attribute)}${field('发起人',flowOrder.applicant)}</div>
        <div class="self-class-detail-fact-row">${field('开课日期',flowSubmission.start)}${field('结课日期',flowSubmission.end)}</div>
        ${field('排课类型','--')}${field('排课时间要求',draft.description||flowSubmission.requirement||flowSubmission.time)}${field('课程备注',extra.courseNote||draft.notes)}
      </div></section>`;
  }
  function renderOrder() {
    $('#orderRequirementText').textContent=educatorRequirementText??orderText;
    if(!flowSubmission)return;
    if(flowSubmission.selfClass||flowOrder.type==='自组班排课单') {renderSelfClassOrder();return;}
    $('#orderPage').classList.remove('self-class-detail');
    $('#selfClassDetailContent').hidden=true;
    $('#selfClassAssign').hidden=true;
    const value=text=>escapeHtml(text===undefined||text===null||text===''?'--':text);
    const student=flowSubmission.studentInfo||{};
    const classGroups=flowClassGroups.length?flowClassGroups:[{name:flowOrderTitle,index:1,courses}];
    const classNumber=flowOrder.classNumber||flowOrder.classNo||'1123456789';
    const classTeacher=flowOrder.classTeacher||'--';
    $('#educatorDetailType').textContent=flowOrder.type||'1V1排课单';
    $('#educatorDetailStatus').textContent=flowOrder.status||'处理中';
    $('#educatorDetailAttribute').textContent=flowOrder.attribute||'新增排课单';
    $('#educatorDetailApplicant').textContent=flowOrder.applicant||'李春玲';
    $('#educatorDetailClasses').innerHTML=classGroups.map(group=>`<div class="educator-detail-class"><div><small>班级名称</small><strong>${value(group.name)}</strong></div><div><small>班级编号</small><strong>${value(classNumber)}</strong></div><div><small>班课班主任</small><strong>${value(classTeacher)}</strong></div></div>`).join('');
    $('#educatorDetailStudent').innerHTML=[['学生姓名',student.name||flowStudentName],['性别',student.gender],['学生手机',student.phone],['学生微信',student.wechat],['在读学校',student.school]].map(([label,text])=>`<div><small>${label}</small><strong>${value(text)}</strong></div>`).join('');
    const headers=['科目','考试局','年级','模块','授课模式','校区','课时','历史授课老师','当前授课老师','老师时间是否已沟通'];
    $('#flowCourseGroups').innerHTML=classGroups.map(group=>{
      const sources=flowSubmission.packages?.[group.index-1]?.courses||flowSubmission.courses||[];
      const rows=sources.map(course=>[course.subject||course.name,course.board,course.grade,course.module,course.mode,course.campus,course.hours,course.historicalTeacher,course.currentTeacher,course.teacherDiscussed]);
      return `<section class="flow-course-group"><div class="flow-course-group-head"><span class="educator-course-bag" aria-hidden="true">▣</span><span>${value(group.name)}</span></div><div class="flow-course-group-scroll"><table><thead><tr>${headers.map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${value(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
    }).join('');
    const fact=([label,text,{compact,attachment}={}])=>{
      const shown=attachment&&text&&text!=='--'?`<span class="educator-detail-attachment">♧ ${value(text)}</span>`:value(text);
      return `<div class="educator-detail-fact${compact?' is-compact':''}${label.length>12?' educator-detail-long-label':''}"><span class="educator-detail-label">${escapeHtml(label)}</span><span class="educator-detail-colon">:</span><span class="educator-detail-value">${shown}</span></div>`;
    };
    $('#educatorDetailFacts').innerHTML=window.orderAnalysisSummary.fieldGroups(educatorOrderSummary()).map(({title,fields})=>
      `<section class="educator-detail-section"><h2 class="legacy-card-title">${title}</h2><div class="educator-detail-fields">${fields.map(fact).join('')}</div></section>`).join('');
    $('#flowSupplements').hidden=true;
  }
  function educatorOrderSummary(){
    const dates=educatorRequirementText===null?{}:{...orderDates,endMode:state.orderEndRule===endRules[0]?'SPECIFIED_DATE':'FINISH_ALL'};
    return {
      submission:{...flowSubmission,...dates,requirement:educatorRequirementText??flowSubmission?.requirement},
      supplements:flowOrder?.supplements,
      replyText:state.supplement,
      supplementFiles:state.files
    };
  }
  const requirementAttachmentNames=files=>[...new Set(files.map(file=>typeof file==='string'?file:file?.name).filter(Boolean))];
  function requirementReviewMarkup() {
    const supplements=flowOrder?.supplements||[];
    const originalSupplement=supplements.map(item=>item.text).join('\n').trim();
    const currentSupplement=state.supplement.trim();
    const educatorSupplement=currentSupplement===originalSupplement?'':currentSupplement.startsWith(originalSupplement)?currentSupplement.slice(originalSupplement.length).trim():currentSupplement;
    const attachmentNames=requirementAttachmentNames([...(flowSubmission?.requirementAttachments||[]),...(flowSubmission?.extra?.vouchers||[])]);
    const attachments=attachmentNames.join('、')||flowSubmission?.credential||flowOrder?.credential||'--';
    const supplementEntries=supplements.map(item=>{
      const files=requirementAttachmentNames(item.attachments||[]);
      return `<div class="flow-requirements-supplement">${item.time?`<small>补充时间：${escapeHtml(item.time)}</small>`:''}${item.text?`<p>${escapeHtml(item.text)}</p>`:''}${files.length?`<p>补充附件：${files.map(escapeHtml).join('、')}</p>`:''}</div>`;
    }).join('');
    return `<div class="flow-requirements-facts"><span>开课日期：${escapeHtml(orderDates.start)}</span><span>结课日期：${escapeHtml(state.orderEndRule===endRules[1]?'排完全部课程结束':orderDates.end||'未指定')}</span>${educatorTeacherFlow?'':`<span>上课时区：${escapeHtml(scheduleTimezoneLabel(state.scheduleTimezone))}</span>`}</div>
      <section class="flow-requirements-section"><h3>排课要求</h3><p>${escapeHtml(educatorRequirementText??orderText)}</p></section>
      <section class="flow-requirements-section"><h3>附件</h3><p>${escapeHtml(attachments)}</p></section>
      <section class="flow-requirements-section"><h3>补充排课要求</h3>${supplementEntries}${educatorSupplement?`<div class="flow-requirements-supplement"><small>教务补充</small><p>${escapeHtml(educatorSupplement)}</p></div>`:''}${state.files.length?`<div class="flow-requirements-supplement"><small>${educatorTeacherFlow?'补充附件':'补充图片'}</small><p>${state.files.map(escapeHtml).join('、')}</p></div>`:''}${!supplements.length&&!educatorSupplement&&!state.files.length?'<p class="flow-requirements-empty">暂无补充</p>':''}</section>`;
  }
  function openRequirementReview() {
    resetStrategyReviewFooter();
    const title=$('#flowRequirementsTitle');
    title.textContent='查看排课要求';
    if(educatorTeacherFlow)title.insertAdjacentHTML('afterend',strategyTimezonePill());
    $('#flowRequirementsContent').innerHTML=requirementReviewMarkup();
    if(educatorTeacherFlow&&state.step===3){
      $('#flowRequirementsOverlay').classList.add('educator-strategy-modal');
      const footer=$('.teacher-direct-strategy-footer');
      footer.innerHTML='<button type="button" class="btn btn-primary" data-edit-educator-supplement>修改排课要求</button>';
      footer.hidden=false;
    }
    $('#flowRequirementsOverlay').hidden=false;
    $('#closeFlowRequirements').focus();
  }
  function resetStrategyReviewFooter() {
    const footer=$('.teacher-direct-strategy-footer');
    footer.hidden=true;
    footer.innerHTML='';
    $('#flowRequirementsOverlay').classList.remove('educator-strategy-modal');
    $('.flow-requirements-dialog > header .strategy-timezone-pill')?.remove();
  }
  function closeRequirementReview() {
    educatorSupplementFiles=[];
    if(educatorStrategyEdit){
      Object.assign(state,educatorStrategyEdit);
      educatorStrategyEdit=null;
    }
    resetStrategyReviewFooter();
    $('#flowRequirementsOverlay').hidden=true;
  }
  function openTeacherStrategyReview() {
    const editing=Boolean(educatorStrategyEdit);
    const expanded=editing||!educatorTeacherFlow?' open':'';
    const title=$('#flowRequirementsTitle');
    title.textContent=editing?'修改排课策略':'查看排课策略';
    title.parentElement.querySelector('.strategy-timezone-pill')?.remove();
    if(educatorTeacherFlow)title.insertAdjacentHTML('afterend',strategyTimezonePill());
    $('#flowRequirementsOverlay').classList.toggle('educator-strategy-modal',educatorTeacherFlow);
    const footer=$('.teacher-direct-strategy-footer');
    footer.hidden=Boolean(teacherPlanningJob);
    footer.innerHTML=educatorTeacherFlow?(editing
      ?`<button type="button" class="btn" data-cancel-educator-strategy>取消</button><button type="button" class="btn btn-primary" data-confirm-educator-strategy>${educatorRegenerateLabel}</button>`
      :'<button type="button" class="btn btn-primary" data-edit-educator-strategy>修改排课策略</button>')
      :'<button type="button" class="btn btn-primary" data-edit-strategy-from-teachers>编辑排课策略</button>';
    $('#flowRequirementsContent').innerHTML=`<div class="teacher-direct-strategy-review wizard" data-step="2">${educatorTeacherFlow?'':`<div class="flow-requirements-facts"><span>上课时区：${escapeHtml(scheduleTimezoneLabel(state.scheduleTimezone))}</span></div>`}
      <section class="content-card analysis-section strategy-global-card"><div class="content-card-header"><strong>全局排课策略</strong></div><div class="content-card-inner"><div class="analysis-card"><p>根据AI分析结果：${escapeHtml(state.aiSnapshot?.global||globalAnalysisSummary())}</p></div><details class="structure"${expanded}><summary><span>排课策略</span></summary><div class="structure-body">${globalStructure()}</div></details></div></section>
      ${courses.map(course=>`<section class="content-card analysis-section strategy-course-card"><div class="content-card-header"><div class="course-analysis-title"><strong>${escapeHtml(course.name)}</strong><span class="meta-chip">${course.hours}课时</span><span class="meta-chip">${escapeHtml(course.mode)}</span><span class="meta-chip">${escapeHtml(course.campus)}</span>${courseLessonDurationChips(course)}<span class="meta-chip">${courseLessonTotal(course)}节</span></div></div><div class="content-card-inner"><div class="analysis-card"><p>根据AI分析结果：${escapeHtml(state.aiSnapshot?.courses?.[course.id]||course.ai)}</p></div><details class="structure"${expanded}><summary><span>排课策略</span></summary>${courseStructure(course)}</details></div></section>`).join('')}
      </div>`;
    $('#flowRequirementsOverlay').hidden=false;
    $('#flowRequirementsContent').scrollTop=0;
    $('#closeFlowRequirements').focus();
  }
  function educatorRequirementForm() {
    const values=educatorRequirementDraft;
    return `<div class="ai-precheck-reply educator-analysis-reply">
      <label for="educatorRequirementSupplement">补充排课要求${educatorAnalysisIssues.length?'':' <small>选填</small>'}</label>
      <textarea id="educatorRequirementSupplement" maxlength="2000" placeholder="请输入需要补充的排课信息">${escapeHtml(values?.reply||'')}</textarea>
      <div class="educator-supplement-attachments">
        <button type="button" class="ai-precheck-upload educator-analysis-upload" data-choose-educator-supplement><strong>⊕ 上传附件</strong><span>点击选择或拖拽附件${educatorAnalysisIssues.length?'':' · 选填'}</span></button>
        <input type="file" id="educatorSupplementFiles" multiple hidden>
        <ul id="educatorSupplementFileList" hidden></ul>
      </div>
      <p id="educatorRequirementError" class="strategy-notice is-error" role="alert" hidden></p>
    </div>`;
  }
  function currentEducatorRequirementDraft() {
    return {...orderDates,mode:state.orderEndRule,text:educatorRequirementText??(orderText==='--'?'':orderText),supplement:state.supplement,reply:''};
  }
  function editEducatorRequirements() {
    educatorRequirementReturn=state.step===2;
    educatorRequirementDraft=currentEducatorRequirementDraft();
    educatorSupplementFiles=[];
    closeRequirementReview();
    openWizard(1);
  }
  function openEducatorRequirementPage() {
    const analysis=flowOrder.strategyAnalysis||{};
    const questions=analysis.questions||analysis.issues||flowOrder.precheckIssues||[];
    const failed=['BUSINESS_FAILED','FAILED','REJECTED','未通过'].includes(strategyAnalysisStatus);
    educatorAnalysisIssues=failed?[...(Array.isArray(questions)?questions:[]).map(item=>typeof item==='string'?item:item?.text||item?.message||item?.question),analysis.reason].filter(Boolean):[];
    if(failed&&!educatorAnalysisIssues.length)educatorAnalysisIssues=['请核对排课要求，补充可排日期、时间或频次后重新提交。'];
    educatorRequirementDraft=currentEducatorRequirementDraft();
    educatorRequirementReturn=false;
    educatorSupplementFiles=[];
    openWizard(1);
  }
  let educatorSupplementFiles=[];
  function editEducatorSupplement() {
    educatorSupplementFiles=[];
    $('#flowRequirementsTitle').textContent='修改排课要求';
    $('#flowRequirementsContent').innerHTML=`${requirementReviewMarkup()}<section class="flow-requirements-section educator-requirement-editor">
      <label>本次补充排课要求<textarea id="educatorNewSupplement" maxlength="2000" placeholder="请输入本次需要补充的排课要求"></textarea></label>
      <div class="educator-supplement-attachments"><label for="educatorSupplementFiles">上传附件</label><input type="file" id="educatorSupplementFiles" multiple><ul id="educatorSupplementFileList" hidden></ul></div>
      <p id="educatorSupplementError" class="strategy-notice is-error" role="alert" hidden></p>
    </section>`;
    const footer=$('.teacher-direct-strategy-footer');
    footer.innerHTML=`<button type="button" class="btn" data-cancel-educator-supplement>取消</button><button type="button" class="btn btn-primary" data-confirm-educator-supplement>${educatorRegenerateLabel}</button>`;
    $('#flowRequirementsContent').scrollTop=0;
    $('#educatorNewSupplement').focus({preventScroll:true});
  }
  function renderEducatorSupplementFiles() {
    const list=$('#educatorSupplementFileList');
    list.hidden=!educatorSupplementFiles.length;
    list.innerHTML=educatorSupplementFiles.map((file,index)=>`<li><span>${escapeHtml(file.name)}</span><button type="button" class="btn" data-remove-educator-supplement-file="${index}" aria-label="移除${escapeHtml(file.name)}">移除</button></li>`).join('');
  }
  function appendEducatorSupplementFiles(files) {
    for(const file of files){
      if(!educatorSupplementFiles.some(item=>item.name===file.name&&item.size===file.size&&item.lastModified===file.lastModified))educatorSupplementFiles.push(file);
    }
    renderEducatorSupplementFiles();
  }
  function confirmEducatorSupplement() {
    const text=$('#educatorNewSupplement').value.trim();
    const error=$('#educatorSupplementError');
    const showError=message=>{error.textContent=message;error.hidden=false;};
    if(!text&&!educatorSupplementFiles.length){showError('请填写补充排课要求或添加附件。');return;}
    const previous=state.draft;
    if(text){
      try {state.draft=strategyFromEducatorRequirements('',text,orderDates.start,orderDates.end,true);}
      catch(error){showError(error.message);return;}
      const validation=validateDraft();
      if(validation){state.draft=previous;showError(validation);return;}
      state.supplement=[state.supplement,text].filter(Boolean).join('\n');
      state.aiSnapshot={global:globalAnalysisSummary(),courses:Object.fromEntries(courses.map(course=>[course.id,state.draft.courses[course.id].map(segment=>`${segment.frequency}，${segment.time}`).join('；')]))};
    }
    state.files=[...new Set([...state.files,...educatorSupplementFiles.map(file=>file.name)])];
    educatorSupplementFiles=[];
    closeRequirementReview();
    setLoading('正在重新分析排课要求','根据补充内容更新排课策略',()=>applyEducatorStrategy());
  }
  function strategyFromEducatorRequirements(text,supplement,start,end,supplementOnly=false) {
    const content=[text,supplement].filter(Boolean).join('；');
    if(!content||/每月|待定|不确定|仍有冲突/.test(content))
      throw new Error('请明确上课时段和频次。每月安排需明确拆分为每周或每两周。');
    const analysisError=simulatedAiAnalysisError(content);
    if(analysisError)throw new Error(analysisError.message||'暂未生成策略，请确认排课要求后重试。');
    const draft=supplementOnly?copyData(state.draft):initialDraft();
    for(const [key,pattern] of [['dayCap',/每天(?:最多|不超过)(\d+)节/u],['weekCap',/每周(?:最多|不超过)(\d+)节/u]]) {
      const value=content.replace(/\s/g,'').match(pattern)?.[1];
      if(value)draft.global[key]=value;
    }
    const frequency=/每(两周|周)\s*(?:尽量)?(?:各)?(?:固定|安排|排)?\s*(\d+)(?:\s*[-—–～~至]\s*(\d+))?\s*节/u;
    const statements=content.split(/[。；;\n]+/).filter(Boolean);
    const subjects=courses.map((course,index)=>flowSubmission?.courses[index]?.subject||flowSubmission?.courses[index]?.name||course.name);
    const general=statements.filter(item=>!subjects.some(subject=>item.includes(subject)));
    for(const [index,course] of courses.entries()){
      const own=statements.filter(item=>item.includes(subjects[index]));
      const requirements=[...general,...own];
      if(supplementOnly&&!requirements.length)continue;
      const match=requirements.map(item=>item.match(frequency)).filter(Boolean).at(-1);
      const rules=requirements.flatMap(item=>{
        const range=item.match(/\b(\d{2}:\d{2})\s*[-—–至]\s*(\d{2}:\d{2})\b/u);
        const days=[...new Set([...item.matchAll(/周[一二三四五六日]/g)].map(day=>day[0]))];
        if(!range||!days.length)return [];
        if(/禁排|不可排|不能上课/.test(item))return [];
        const type=/优先/.test(item)?'优先':/固定|必须/.test(item)?'固定':'仅限';
        return [{type,weekdays:days,allDay:false,start:range[1],end:range[2]}];
      });
      if(!match&&!rules.length&&!/按(?:照)?老师.*(?:时间|日程)|不限|常规/u.test(requirements.join('；')))
        throw new Error(`请明确${course.name}的周／双周频次或具体上课时段。`);
      const previous=state.draft?.courses?.[course.id]?.[0]||draft.courses[course.id][0];
      if(/禁排|不可排|不能上课/.test(requirements.join('；')))
        throw new Error(`${course.name}有不可排时段，请在修改排课策略中设置不可排规则。`);
      const segment={...previous,start,end,completion:'按频次排课',frequencyPeriod:match?.[1]==='两周'?'biweek':match?'week':previous.frequencyPeriod,
        frequencyMin:match?Number(match[2]):previous.frequencyMin,frequencyMax:match?Number(match[3]||match[2]):previous.frequencyMax,
        unavailableTimeRules:[],timeRules:rules.length?rules:[{type:'常规',weekdays:[],allDay:false,start:'',end:''}]};
      segment.frequency=formatFrequency(segment);
      segment.time=formatTimeRequirement(segment);
      normalizeCourseDayCap(segment);
      draft.courses[course.id]=supplementOnly?draft.courses[course.id].map(item=>{
        if(match)Object.assign(item,{frequencyPeriod:segment.frequencyPeriod,frequencyMin:segment.frequencyMin,frequencyMax:segment.frequencyMax,frequency:segment.frequency,completion:segment.completion});
        if(rules.length||/按(?:照)?老师.*(?:时间|日程)|不限|常规/u.test(requirements.join('；'))) {
          item.timeRules=copyData(segment.timeRules);
          item.time=segment.time;
        }
        normalizeCourseDayCap(item);
        return item;
      }):[segment];
    }
    return draft;
  }
  function applyEducatorStrategy({showStrategy=false}={}) {
    state.editing=false;
    state.dirty=false;
    state.recommended=false;
    state.selected={};
    preparedTeacherRecommendations=null;
    generateCoursePlans();
    try {
      localStorage.setItem(educatorStrategyKey(),JSON.stringify({draft:state.draft,dates:orderDates,
        endRule:state.orderEndRule,requirement:educatorRequirementText,supplement:state.supplement,files:state.files,analysis:state.aiSnapshot}));
    } catch { /* 浏览器禁用存储时，本页仍复用新策略。 */ }
    renderOrder();
    closeRequirementReview();
    if(state.step===3)openTeacherSelection();
    else {
      renderWizard();
      if(showStrategy)openTeacherStrategyReview();
    }
  }
  function educatorStrategyKey() {return `educator-verified-strategy:${flowOrder.id}`;}
  function loadEducatorStrategy() {
    try {
      const saved=JSON.parse(localStorage.getItem(educatorStrategyKey())||'null');
      if(!saved?.dates?.start||!courses.every(course=>Array.isArray(saved.draft?.courses?.[course.id])))return;
      state.draft=saved.draft;
      state.orderEndRule=normalizeOrderEndRule(saved.endRule);
      state.supplement=saved.supplement||'';
      state.files=Array.isArray(saved.files)?saved.files:[];
      state.aiSnapshot=saved.analysis;
      educatorRequirementText=saved.requirement??null;
      Object.assign(orderDates,saved.dates);
    } catch { /* 恢复原排课单策略。 */ }
  }
  function regenerateEducatorRequirements() {
    const values={...currentEducatorRequirementDraft(),reply:$('#educatorRequirementSupplement').value.trim()};
    if(values.mode===endRules[1])values.end='';
    if(!values.start||values.mode===endRules[0]&&(!values.end||values.end<values.start)){
      const message='请检查开课日期和结课日期。';
      const error=$('#educatorRequirementError');
      if(error){error.textContent=message;error.hidden=false;}
      else notify(message);
      return;
    }
    educatorRequirementDraft=values;
    setLoading('正在分析排课要求','根据排课要求和补充信息生成排课策略',analyzeEducatorRequirementPage);
  }
  function analyzeEducatorRequirementPage() {
    const {start,end,mode,text,supplement,reply}=educatorRequirementDraft;
    const combinedSupplement=[supplement,reply].filter(Boolean).join('\n');
    const failure=message=>{
      educatorAnalysisIssues=[message];
      renderEducatorRequirementPage();
      $('#educatorRequirementIssues')?.focus();
    };
    if(simulatedAiAnalysisError([text,combinedSupplement].join('；'))?.status==='TECHNICAL_FAILED'){
      notify('AI分析暂不可用，请重新提交分析');
      return;
    }
    let draft;
    try {
      draft=state.draft
        ?reply?strategyFromEducatorRequirements('',reply,start,end,true):state.draft
        :strategyFromEducatorRequirements(text,combinedSupplement,start,end);
    }
    catch(error){failure(error.message);return;}
    const previous={draft:state.draft,mode:state.orderEndRule,dates:{...orderDates}};
    state.draft=draft;
    state.orderEndRule=mode;
    Object.assign(orderDates,{start,end});
    const validation=validateDraft();
    if(validation){
      state.draft=previous.draft;
      state.orderEndRule=previous.mode;
      Object.assign(orderDates,previous.dates);
      failure(validation);
      return;
    }
    educatorRequirementText=text;
    state.supplement=combinedSupplement;
    state.files=[...new Set([...state.files,...educatorSupplementFiles.map(file=>file.name)])];
    educatorAnalysisIssues=[];
    educatorRequirementDraft=null;
    state.aiSnapshot={global:globalAnalysisSummary(),courses:Object.fromEntries(courses.map(course=>{
      const segment=draft.courses[course.id][0];
      return [course.id,`${segment.frequency}，${segment.time}。`];
    }))};
    state.step=2;
    applyEducatorStrategy();
  }
  function openTeacherSupplementReview() {
    resetStrategyReviewFooter();
    $('#flowRequirementsTitle').textContent='补充排课要求';
    const supplements=flowOrder?.supplements||[];
    const originalSupplement=supplements.map(item=>item.text).join('\n').trim();
    const currentSupplement=state.supplement.trim();
    const educatorSupplement=currentSupplement===originalSupplement?'':currentSupplement.startsWith(originalSupplement)?currentSupplement.slice(originalSupplement.length).trim():currentSupplement;
    const attachmentNames=[...new Set([...(flowSubmission?.requirementAttachments||[]),...(flowSubmission?.extra?.vouchers||[])])];
    const attachments=attachmentNames.join('、')||flowSubmission?.credential||flowOrder?.credential||'--';
    $('#flowRequirementsContent').innerHTML=`<section class="flow-requirements-section"><h3>排课要求</h3><p>${escapeHtml(orderText)}</p></section>
      <section class="flow-requirements-section"><h3>附件</h3><p>${escapeHtml(attachments)}</p></section>
      <section class="flow-requirements-section"><h3>已有补充排课要求</h3>${supplements.map(item=>`<div class="flow-requirements-supplement"><small>补充时间：${escapeHtml(item.time)}</small><p>${escapeHtml(item.text)}</p></div>`).join('')}${educatorSupplement?`<div class="flow-requirements-supplement"><small>教务补充</small><p>${escapeHtml(educatorSupplement)}</p></div>`:''}${state.files.length?`<div class="flow-requirements-supplement"><small>补充图片</small><p>${state.files.map(escapeHtml).join('、')}</p></div>`:''}${!supplements.length&&!educatorSupplement&&!state.files.length?'<p class="flow-requirements-empty">暂无补充</p>':''}</section>
      <section class="flow-requirements-section"><h3>新增补充内容</h3><textarea id="teacherDirectSupplement" maxlength="2000" placeholder="输入需要补充或更正的排课要求"></textarea><div class="teacher-direct-review-actions"><button type="button" class="btn" id="closeTeacherSupplement">取消</button><button type="button" class="btn btn-primary" id="saveTeacherSupplement">保存并重新分析策略</button></div></section>`;
    $('#flowRequirementsOverlay').hidden=false;
    $('#teacherDirectSupplement').focus();
  }
  function openTeacherDesignation(courseId) {
    const course=courses.find(item=>item.id===courseId);
    if(!course) return;
    resetStrategyReviewFooter();
    const current=course.history.filter(item=>item[1]==='当前');
    const historical=course.history.filter(item=>item[1]==='历史');
    $('#flowRequirementsTitle').textContent=`指定老师 · ${course.name}`;
    $('#flowRequirementsContent').innerHTML=`<section class="flow-requirements-section teacher-direct-designation"><h3>当前授课老师</h3><div class="teacher-list">${current.map(item=>`<button type="button" class="teacher-choice" data-fill-direct-teacher="${escapeHtml(item[0])}">${escapeHtml(item[0])}</button>`).join('')||'—'}</div><h3>历史授课老师</h3><div class="teacher-list">${historical.map(item=>`<button type="button" class="teacher-choice" data-fill-direct-teacher="${escapeHtml(item[0])}">${escapeHtml(item[0])}</button>`).join('')||'—'}</div><label>老师姓名或工号<input id="teacherDirectName" data-direct-course="${courseId}" value="${escapeHtml(state.direct[courseId]||'')}" placeholder="输入老师姓名或工号"></label><div class="teacher-direct-review-actions"><button type="button" class="btn" data-clear-direct-teacher="${courseId}" ${state.direct[courseId]?'':'disabled'}>取消指定</button><button type="button" class="btn btn-primary" data-save-direct-teacher="${courseId}">确认指定</button></div></section>`;
    $('#flowRequirementsOverlay').hidden=false;
  }
  function setLoading(title,description,callback) {
    const wizard=$('.wizard');
    wizard.dataset.loading='true';
    $('#closeWizard').disabled=true;
    window.analysisMotion.start(wizard,{title,description,header:$('.wizard-header'),surface:[$('#wizardBody'),$('#wizardFooter')]});
    setTimeout(()=>{
      window.analysisMotion.stop(wizard);
      wizard.dataset.loading='false';
      $('#closeWizard').disabled=false;
      callback();
      if(!$('#modalBackdrop').hidden&&wizard.dataset.planningMotion!=='true')
        window.analysisMotion.reveal($('#wizardBody'),'.strategy-course-card, .strategy-summary, .teacher-course-card, .homeroom-analysis-result, .supplement-ai-error, #educatorRequirementIssues');
      else if(!$('#resultPage').hidden)
        window.analysisMotion.reveal($('#resultPage'),'.formal-lesson');
    },1050);
  }
  function simulatedAiAnalysisError(requirement=state.supplement) {
    const text=requirement.replace(/\s+/g,'');
    if(text.includes('展示技术报错样式')) return {status:'TECHNICAL_FAILED'};
    if(text.includes('报错')) {
      return {kind:'BUSINESS_FAILED',message:'写作10.10-11.20日固定每周一08:20-10:20与听力11.1-11.10日固定上课时间冲突，请确认后重新提交AI分析'};
    }
    if(text.includes('进入对话')) return {kind:'DIALOGUE',message:''};
    if(text.includes('展示冲突沟通')) return {kind:'CONFLICT',message:'补充要求同时提出写作每周一 18:30—20:30 固定上课，以及同一时段不可排。'};
    const mondayBan=/周一18:30[—\-~至]20:30(?:禁排|不可排|不能上课|不上课)/u.test(text);
    const mondayFixed=/(?:固定|必须).*周一18:30[—\-~至]20:30|周一18:30[—\-~至]20:30.*(?:固定|必须)/u.test(text);
    if(mondayBan&&mondayFixed) {
      return {kind:'CONFLICT',message:'补充要求同时提出写作每周一 18:30—20:30 固定上课，以及同一时段不可排。'};
    }
    if(homeroomSupplement&&(/待定|不确定|不知道|仍有冲突/.test(text)||
      (!lessonChange&&!state.files.length&&(text.length<6||/^(时间灵活|时间不限|尽量安排|都可以|排课)[。！!]*$/.test(text))&&
        !(!text&&lockedSlotModes.size)))){
      return {kind:'BUSINESS_FAILED',questions:['排课时间要求尚不足以确定安排。请补充可执行的上课日期、频次或时段。']};
    }
    return null;
  }
  function showAiAnalysisError(message) {
    state.aiAnalysisError=message;
    state.step=1;
    renderWizard();
  }
  function showHomeroomAnalysisError(error) {
    const technical=error.status==='TECHNICAL_FAILED';
    const fallback='请确认是否存在互相冲突的排课要求，并明确本次应采用的上课时段。';
    state.homeroomAnalysisResult={
      technical,
      questions:technical?['系统调用失败，请重新提交 AI 分析。']:error.questions||[error.message||fallback]
    };
    openWizard(1);
  }
  function homeroomAnalysisResult() {
    const result=state.homeroomAnalysisResult;
    if(!result)return '';
    const hint=result.technical?'请重新提交':'请确认以下信息';
    return `<section class="supplement-panel homeroom-analysis-result" role="alert">
      <header class="supplement-panel-header"><h3>AI分析结果</h3><span>${hint}</span></header>
      <div class="supplement-panel-content"><ol>${result.questions.map(question=>`<li>${escapeHtml(question)}</li>`).join('')}</ol></div>
    </section>`;
  }
  function openRequirementConversation(error) {
    const reason=error.message||'写作10.10-11.20日固定每周一08:20-10:20与听力11.1-11.10日固定上课时间冲突，请确认该时段固定排课课程';
    const options=error.message
      ?[
        {label:'保留写作固定时段',detail:'取消同一时段的禁排要求',reply:'保留写作每周一18:30-20:30固定上课，取消该时段禁排'},
        {label:'保留禁排要求',detail:'写作改用其他可排时段',reply:'写作周一18:30-20:30不可排，改用其他可排时段'}
      ]
      :[
        {label:'该时段固定排写作',detail:'听力调整至其他可排时段',reply:'该时段固定排写作，听力调整至其他可排时段'},
        {label:'该时段固定排听力',detail:'写作调整至其他可排时段',reply:'该时段固定排听力，写作调整至其他可排时段'}
      ];
    const conversation={
      sourceText:state.supplement,
      reason:'',
      options,
      stage:'analyzing',
      messages:[{role:'assistant',text:'正在分析排课要求',loading:true}],
      resolution:''
    };
    state.requirementConversation=conversation;
    openWizard(1.5);
    setTimeout(()=>{
      if(state.requirementConversation!==conversation||state.step!==1.5||$('#modalBackdrop').hidden) return;
      conversation.reason=reason;
      conversation.stage='awaiting';
      conversation.messages[0]={role:'assistant',text:reason};
      renderRequirementConversation();
    },2000);
  }
  let teacherPlanningJob=null;
  let preparedTeacherRecommendations=null;
  function openTeacherSelection() {
    if(state.coursePlans&&state.recommended) {openWizard(3);return;}
    if(!teacherPlanningJob||teacherPlanningJob.draft!==state.draft) {
      const job={draft:state.draft};
      teacherPlanningJob=job;
      setTimeout(()=>{
        if(teacherPlanningJob!==job)return;
        teacherPlanningJob=null;
        if(state.draft!==job.draft)return;
        const viewing=!$('#modalBackdrop').hidden&&state.step===3;
        try {
          generateCoursePlans();
          preparedTeacherRecommendations=Object.fromEntries(courses.map(course=>[course.id,recommendTeachersForCourse(course)]));
          state.recommended=true;
        } catch(error) {
          state.coursePlans=null;
          state.recommended=false;
          console.error('计算学生排课计划或推荐老师失败',error);
          if(viewing) {closeWizard();notify('排课计划计算失败，请重新点击智能排课');}
          return;
        }
        if(viewing)renderWizard();
      },1800);
    }
    openWizard(3);
  }
  function openWizard(step) { if(step===3&&state.step!==3) state.expandedTeacherRequirementIds.clear(); state.step=step; $('#modalBackdrop').hidden=false; renderWizard(); }
  function cancelTeacherStrategyEdit() {
    if(state.strategyEditSnapshot) Object.assign(state,state.strategyEditSnapshot);
    state.dirty=state.strategyEditDirty||false;
    state.strategyEditSnapshot=null;
    state.strategyEditDirty=false;
    state.strategyEditFromTeachers=false;
    state.editing=false;
    openWizard(3);
  }
  function closeWizard(returnToParent=true) {
    const wizard=$('.wizard');
    if(wizard.dataset.loading==='true') return;
    window.analysisMotion.stop(wizard,false);
    delete wizard.dataset.planningMotion;
    if(state.strategyEditFromTeachers&&state.step===2) {cancelTeacherStrategyEdit();return;}
    closeRequirementReview();
    state.strategyEditFromTeachers=false;
    state.editingTeacherRequirements=false;
    state.teacherRequirementDrafts=null;
    $('#modalBackdrop').hidden=true;
    document.body.classList.remove('flow-drawer-open');
    if(homeroomSupplement&&returnToParent&&$('#resultPage').hidden)notifyHomeroomSupplement('homeroom-supplement-close');
  }
  function renderWizard() {
    const titles={1:educatorTeacherFlow?'排课要求智能分析':'补充排课要求',1.5:'排课要求沟通确认',2:educatorTeacherFlow?'确认选师方式':'确认排课策略',3:consultPreview?'确认售前咨单方案':'选择排课老师',4:'查看智能排课结果'};
    const isDrawer=state.step<=4;
    const planning=state.step===3&&teacherPlanningJob?.draft===state.draft;
    const wizard=$('.wizard');
    const wasPlanning=wizard.dataset.planningMotion==='true';
    if(wasPlanning&&!planning){
      window.analysisMotion.stop(wizard);
      delete wizard.dataset.planningMotion;
    }
    $('#modalBackdrop').classList.toggle('flow-drawer-backdrop',isDrawer);
    $('#modalBackdrop').classList.toggle('strategy-edit-modal',state.step===2&&state.strategyEditFromTeachers);
    document.body.classList.toggle('flow-drawer-open',isDrawer);
    $('.wizard').dataset.step=String(state.step);
    wizard.classList.toggle('educator-teacher-flow',educatorTeacherFlow);
    $('#wizardTitle').textContent=planning?'智能排课':titles[state.step];
    $('#wizardFooter').hidden=planning;
    $('#viewFlowRequirements').hidden=state.step!==2&&!(state.step===3&&educatorTeacherFlow);
    $('#viewTeacherStrategy').hidden=!(state.step===3&&!consultPreview||state.step===2&&educatorTeacherFlow)||state.editingTeacherRequirements;
    $('#wizardBody').classList.toggle('educator-analysis-body',state.step===1&&educatorTeacherFlow);
    if(state.step!==2) $('.wizard-header .strategy-timezone-pill')?.remove();
    if(state.step===1) {
      if(educatorTeacherFlow)renderEducatorRequirementPage();
      else renderSupplement();
    }
    else if(state.step===1.5) renderRequirementConversation();
    else if(state.step===2) renderAnalysis();
    else if(planning) {
      const body=$('#wizardBody');
      if(!body.children.length)body.innerHTML=courses.map(course=>`<section class="content-card"><div class="content-card-header"><strong>${escapeHtml(course.name)}</strong><span class="meta-chip">${course.hours}课时</span></div></section>`).join('');
      wizard.dataset.planningMotion='true';
      window.analysisMotion.start(wizard,{title:'系统正在计算学生排课计划',header:$('.wizard-header'),surface:[body]});
    }
    else if(state.step===3) renderTeachers();
    else renderCompletedPlan();
    if(wasPlanning&&!planning)window.analysisMotion.reveal($('#wizardBody'),'.teacher-course-card');
    $('#wizardBody').scrollTop=0;
  }
  function strategyTeacherAssignment(course) {
    const selected=state.direct[course.id];
    const editing=state.editingSpecifiedCourseId===course.id;
    if(homeroomSupplement&&!course.isHistoricalCourse){
      return `<div class="strategy-teacher-assignment" data-strategy-teacher-course="${course.id}">${renewalPreview?'扩科科目将在分析通过后由系统推荐授课老师':'新科目将在分析通过后选择授课老师'}</div>`;
    }
    const input=homeroomSupplement?'—':`<input class="teacher-input" data-specified-input="${course.id}" placeholder="输入老师姓名或工号" aria-label="${escapeHtml(course.name)}指定排课老师"><button type="button" class="supplement-specify-button" data-set-specified="${course.id}">指定</button>${editing?'<button type="button" class="btn btn-quiet" data-cancel-specified-change>取消</button>':''}`;
    const chosen=`<span class="specified-teacher-tag">${escapeHtml(selected)}<button type="button" data-clear-specified="${course.id}" aria-label="取消指定${escapeHtml(selected)}">×</button></span><span class="supplement-specified-state">✓ 已指定</span>`;
    const teacherButtons=relation=>course.history.filter(([,status])=>status===relation).map(([teacher])=>{
      const count=locksForTeacher(teacher).length;
      return `<button type="button" class="teacher-choice ${selected===teacher?'selected':''}" data-pick-history="${course.id}" data-teacher="${escapeHtml(teacher)}">${escapeHtml(teacher)}${count?`<span class="teacher-held-badge">已锁定 ${count} 个时段</span>`:''}</button>`;
    }).join('')||'—';
    return `<div class="strategy-teacher-assignment" data-strategy-teacher-course="${course.id}"><strong class="strategy-teacher-heading">指定授课老师</strong><div class="teacher-line"><span>当前授课老师</span><div class="teacher-list">${teacherButtons('当前')}</div></div><div class="teacher-line"><span>历史授课老师</span><div class="teacher-list">${teacherButtons('历史')}</div></div><div class="teacher-line specified-teacher-line"><span>指定排课老师</span><div class="specified-teacher-control">${selected&&!editing?chosen:input}</div></div>${lockedSlotControls(course,selected)}</div>`;
  }
  function lockedSlotControls(course,teacher) {
    const locks=locksForTeacher(teacher).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
    if(!locks.length&&!lockedSlotModes.has(course.id))return '';
    const useLocked=lockedSlotModes.has(course.id);
    const selected=lockedSlotChoices.get(course.id)||new Set();
    return `<fieldset class="teacher-held-options"><legend>排课时段</legend><div class="teacher-held-modes">
      <label><input type="radio" name="held-mode-${course.id}" data-held-mode="${course.id}" value="new" ${useLocked?'':'checked'}>按新的要求排课</label>
      <label><input type="radio" name="held-mode-${course.id}" data-held-mode="${course.id}" value="locked" ${useLocked?'checked':''} ${!locks.length?'disabled':''}>使用锁定时段</label></div>
      ${useLocked?`<p>勾选要使用的原时段，剩余课时按新的要求排课。</p><div class="teacher-held-slots">${locks.map(lock=>`<label><input type="checkbox" data-held-slot="${course.id}" value="${escapeHtml(lock.id)}" ${selected.has(lock.id)?'checked':''} ${!lockFitsOrder(lock)?'disabled':''}>${escapeHtml(lock.date+' '+lock.time)}${!lockFitsOrder(lock)?'（不在开结课日期内）':''}</label>`).join('')||'锁定已失效，请切换为按新的要求排课。'}</div>`:''}</fieldset>`;
  }
  function lockFitsOrder(lock) {
    return lock.date>=orderDates.start&&(state.orderEndRule!==endRules[0]||lock.date<=orderDates.end);
  }
  function selectedLockedSlots() {
    return courses.flatMap(course=>{
      if(!lockedSlotModes.has(course.id))return [];
      const requested=lockedSlotChoices.get(course.id);
      return locksForTeacher(state.direct[course.id]).filter(lock=>requested?.has(lock.id)&&lockFitsOrder(lock))
        .map(lock=>({...lock,courseId:course.id}));
    });
  }
  function validateLockedSlots() {
    const slots=selectedLockedSlots();
    for(const id of lockedSlotModes){
      const course=courses.find(item=>item.id===id);
      const chosen=slots.filter(slot=>slot.courseId===id);
      if(!chosen.length||chosen.length!==lockedSlotChoices.get(id)?.size)return `${course.name}：请选择有效的锁定时段，或改用新的排课要求。`;
      const duration=chosen.reduce((sum,slot)=>{
        const [start,end]=slot.time.split('-').map(minutes);
        return sum+end-start;
      },0);
      if(duration>course.hours*60)return `${course.name}：所选锁定时段超过课程课时，请减少所选时段。`;
    }
    if(slots.some((slot,index)=>slots.slice(0,index).some(other=>changeSlotsConflict(slot.date,slot.time,other))))
      return '所选锁定时段重叠，请每个时段只安排一门课程。';
    return '';
  }
  function refreshStrategyTeacher(courseId) {
    if(educatorTeacherFlow&&state.step===3){renderTeachers();return;}
    const host=$(`[data-strategy-teacher-course="${courseId}"]`);
    const course=courses.find(item=>item.id===courseId);
    if(host&&course)host.outerHTML=strategyTeacherAssignment(course);
    const proceed=$('#wizardFooter [data-recommend]');
    if(proceed&&!homeroomSupplement&&!consultPreview){
      proceed.textContent=strategyProceedLabel();
      if(educatorTeacherFlow)proceed.disabled=hasMissingSpecifiedTeacher();
    }
  }
  function allTeachersSpecified(){return courses.length>0&&courses.every(course=>state.direct[course.id])}
  const usesSpecifiedTeacher=course=>educatorSpecifiedCourses.has(course.id)||Boolean(state.direct[course.id]);
  const hasMissingSpecifiedTeacher=()=>courses.some(course=>usesSpecifiedTeacher(course)&&!state.direct[course.id]);
  function teacherMethodSwitch(course) {
    const specified=usesSpecifiedTeacher(course);
    return `<div class="educator-method-switch" role="group" aria-label="${escapeHtml(course.name)}选师方式"><button type="button" data-educator-teacher-method="system" data-course-id="${course.id}" aria-pressed="${!specified}">由系统推荐老师</button><button type="button" data-educator-teacher-method="specified" data-course-id="${course.id}" aria-pressed="${specified}">指定排课老师</button></div>`;
  }
  function strategyProceedLabel(){
    if(educatorTeacherFlow)return allTeachersSpecified()?'生成正式排课':'推荐排课老师';
    return !homeroomSupplement&&!consultPreview&&allTeachersSpecified()?'生成正式排课':'生成学生排课计划并推荐教师';
  }
  function resolveSpecifiedTeacher(value) {
    const input=value.trim().replaceAll('（','(').replaceAll('）',')');
    const known=[...new Set(courses.flatMap(course=>[...course.history.map(item=>item[0]),...course.candidates.map(item=>item.name)]))];
    const match=known.find(name=>name===input||plainName(name)===input||name.slice(name.indexOf('(')+1,-1).toLowerCase()===input.toLowerCase());
    return match||(/^[^()]+\([A-Za-z0-9]+\)$/.test(input)?input:null);
  }
  function renderEducatorRequirementPage() {
    const summary=window.orderAnalysisSummary.render(educatorOrderSummary());
    const hasIssues=educatorAnalysisIssues.length>0;
    $('#wizardBody').innerHTML=`<div class="ai-precheck-body educator-analysis-layout">
      <section class="ai-precheck-left" aria-label="排课单信息">${summary}</section>
      <section class="ai-precheck-right" aria-label="${hasIssues?'智能分析结果':'可补充排课信息'}"><div class="ai-precheck-right-scroll">
        <section class="ai-precheck-card ai-precheck-issues" ${hasIssues?'id="educatorRequirementIssues" tabindex="-1"':''}>
          <div class="ai-precheck-result-heading"><h2>${hasIssues?'智能分析结果':'可补充排课信息'}</h2>${hasIssues?'<span>请确认以下信息</span>':''}</div>
          ${hasIssues?`<ol class="ai-precheck-issue-text">${educatorAnalysisIssues.map(issue=>`<li>${escapeHtml(issue)}</li>`).join('')}</ol>`:''}
          ${educatorRequirementForm()}</section></div></section>
      </div>`;
    renderEducatorSupplementFiles();
    $('#wizardFooter').innerHTML=`<button type="button" class="btn" ${educatorRequirementReturn?'data-cancel-educator-requirements':'data-close'}>取消</button>
      <button type="button" class="btn btn-primary" data-confirm-educator-requirements>${educatorRequirementReturn?educatorRegenerateLabel:hasIssues?'重新提交AI分析':'提交AI分析'}</button>`;
  }
  function renderSupplement() {
    const knownTimezone=scheduleTimezoneOptions.some(([id])=>id===state.scheduleTimezone);
    const calendarIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6.5 2.5v4M13.5 2.5v4M3 8h14" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="6" y="10.5" width="2.5" height="2.5" rx=".3" fill="currentColor"/><rect x="11" y="10.5" width="2.5" height="2.5" rx=".3" fill="currentColor"/></svg>';
    const uploadIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="currentColor"/><path d="M10 5.5v9M5.5 10h9" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>';
    const orderInfo=homeroomSupplement?'':`
      <header class="supplement-panel-header"><h3><span class="supplement-heading-icon">${calendarIcon}</span>排课单信息</h3><span class="supplement-origin-badge">内容来自排课单</span></header>
        <div class="supplement-order-section"><div class="supplement-primary-row"><div class="supplement-mode-switch" role="group" aria-label="结课日期">${endRules.map(rule=>`<button type="button" data-order-end-rule="${rule}" class="${state.orderEndRule===rule?'is-active':''}" aria-pressed="${state.orderEndRule===rule}">${rule}</button>`).join('')}</div>
          <div class="order-date-controls"><label class="order-control order-date-item"><span>开课日期</span><input type="date" data-order-date="start" aria-label="开课日期" value="${escapeHtml(orderDates.start)}"></label>
          <label class="order-control order-date-item ${state.orderEndRule===endRules[1]?'is-disabled':''}"><input type="date" data-order-date="end" aria-label="指定结课日期" value="${escapeHtml(orderDates.end)}" min="${escapeHtml(orderDates.start)}" ${state.orderEndRule===endRules[1]?'disabled':'required'}></label>
          <label class="order-control order-timezone-item"><span>上课时区</span><select id="scheduleTimezoneChoice" data-schedule-timezone-choice aria-label="上课时区">${scheduleTimezoneOptions.map(([id,label])=>`<option value="${id}" ${state.scheduleTimezone===id?'selected':''}>${escapeHtml(label)}</option>`).join('')}<option value="__custom__" ${knownTimezone?'':'selected'}>其他时区</option></select></label></div></div>
        ${knownTimezone?'':`<div class="order-timezone-custom"><label>其他上课时区<input type="text" data-schedule-timezone-input aria-label="其他上课时区" placeholder="例如 Europe/Paris" value="${escapeHtml(state.scheduleTimezone)}"></label></div>`}
        <p class="supplement-order-text">${escapeHtml(orderText)}</p></div>
        <div class="supplement-section-divider"></div>`;
    const teacherSection=homeroomSupplement&&!lessonChange?`<section class="supplement-panel homeroom-specified-teachers">
      <header class="supplement-panel-header"><h3>指定排课老师</h3><p class="homeroom-teacher-note">仅允许历史科目指定授课老师</p></header>
      <div class="supplement-panel-content">${courses.map(course=>`<section><h4>${escapeHtml(course.name)}</h4>${strategyTeacherAssignment(course)}</section>`).join('')}</div>
    </section>`:'';
    $('#wizardBody').innerHTML=`${homeroomSupplement?homeroomAnalysisResult():state.aiAnalysisError?`<section class="supplement-ai-error ai-analysis-error" role="alert"><strong>AI分析结果：</strong><p>${escapeHtml(state.aiAnalysisError)}</p></section>`:''}
      <section class="supplement-panel supplement-main-panel">${orderInfo}
        <div class="supplement-panel-content"><h3 class="supplement-subheading"><span class="supplement-heading-icon">${uploadIcon}</span>${homeroomSupplement?'填写排课要求':'补充排课要求'}</h3>
          <div class="supplement-text-wrap"><textarea id="supplementInput" aria-label="排课要求" maxlength="2000" placeholder="${homeroomSupplement?'请输入排课要求':'可以输入文字，或上传文件补充排课要求'}">${escapeHtml(state.supplement)}</textarea><span class="supplement-character-count" id="supplementCharacterCount">${state.supplement.length}/2000</span></div>
          <button type="button" class="supplement-upload-zone" id="supplementDropZone" data-choose-supplement><span class="supplement-upload-action">${uploadIcon}上传图片</span><span class="supplement-upload-divider"></span><span class="supplement-upload-description">点击上传补充信息或将文件拖拽到此处，只支持图片</span></button><input id="fileInput" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden>
          ${state.files.length?`<div class="supplement-file-list">${state.files.map((name,index)=>`<div class="supplement-file-row"><span class="supplement-file-icon">▤</span><span class="supplement-file-name">${escapeHtml(name)}</span><button type="button" data-remove-supplement-file="${index}" aria-label="删除${escapeHtml(name)}">×</button></div>`).join('')}</div>`:''}</div></section>${teacherSection}`;
    if(lessonChange){
      $('#wizardBody').insertAdjacentHTML('beforeend',`<section class="supplement-panel homeroom-specified-teachers">
        <header class="supplement-panel-header"><h3>原课节</h3></header>
        <div class="supplement-panel-content"><ul>${lessonChange.original.map(row=>
          `<li>${escapeHtml([row.course,row.date,row.time,row.teacher].join(' · '))}</li>`).join('')}</ul></div></section>`);
    }
    $('#wizardFooter').innerHTML='<button class="btn" data-close>取消</button><button class="btn btn-primary" data-analyze>AI分析排课要求</button>';
  }
  function renderRequirementConversation() {
    const conversation=state.requirementConversation;
    if(!conversation) {openWizard(1);return;}
    $('#wizardBody').innerHTML=`<section class="requirement-chat-page">
      <div class="requirement-chat-thread" role="log" aria-live="polite">${conversation.messages.map(message=>`<div class="requirement-chat-message ${message.role==='user'?'is-user':'is-assistant'} ${message.loading?'is-loading':''} ${message.success?'is-success':''}">${message.role==='assistant'?'<span class="requirement-chat-avatar"><img src="ai-dialog-avatar.png" alt="AI助手"></span>':''}<div class="requirement-chat-bubble">${escapeHtml(message.text)}${message.loading?'<span class="requirement-chat-dots" aria-hidden="true"><i></i><i></i><i></i></span>':''}</div></div>`).join('')}${conversation.stage==='awaiting'?`<div class="requirement-chat-options" role="group" aria-label="冲突处理选项"><p>可直接选择并确认，也可在下方补充其他内容</p>${conversation.options.map(option=>`<button type="button" data-confirm-conflict-option="${escapeHtml(option.reply)}"><span><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.detail)}</small></span><b aria-hidden="true">→</b></button>`).join('')}</div>`:''}</div>
      <div class="requirement-chat-composer-area"><div class="requirement-chat-composer"><textarea id="requirementChatInput" rows="2" maxlength="1000" aria-label="回复智能体" placeholder="向智能体说明排课要求…" ${conversation.stage==='awaiting'?'':'disabled'}></textarea><button type="button" data-send-conflict-message aria-label="发送消息" title="发送消息" ${conversation.stage==='awaiting'?'':'disabled'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><small>Enter 发送，Shift + Enter 换行</small></div>
    </section>`;
    $('#wizardFooter').innerHTML='';
    $('#wizardBody').querySelector('.requirement-chat-thread').scrollTop=99999;
  }
  function submitRequirementConversation(text) {
    const conversation=state.requirementConversation;
    if(!conversation||conversation.stage!=='awaiting') return;
    const value=String(text||'').trim();
    if(!value) {notify('请先输入补充条件');return;}
    conversation.messages.push({role:'user',text:value});
    conversation.resolution=value;
    conversation.stage='analyzingSupplement';
    conversation.messages.push({role:'assistant',text:'正在分析补充条件',loading:true});
    renderRequirementConversation();
    setTimeout(()=>{
      if(state.requirementConversation!==conversation||state.step!==1.5||$('#modalBackdrop').hidden) return;
      conversation.stage='generating';
      conversation.messages[conversation.messages.length-1]={role:'assistant',text:'排课要求分析成功，正在生成排课策略',success:true};
      renderRequirementConversation();
      setTimeout(()=>{
        if(state.requirementConversation===conversation&&state.step===1.5&&!$('#modalBackdrop').hidden) finishAiAnalysis();
      },1100);
    },2000);
  }
  function finishAiAnalysis(targetStep=homeroomSupplement||consultPreview?3:2,{useSubmitted=false}={}) {
    state.editing=false;
    state.aiAnalysisError='';
    const simpleOnly=(!state.supplement.trim()&&lockedSlotModes.size>0)||
      /^(按|按照)老师(的)?时间排课(即可|就可以|就行)?[。！!]?$/u.test(state.supplement.trim());
    const useSavedStrategy=useSubmitted&&Boolean(submittedStrategy);
    state.draft=useSavedStrategy?loadSubmittedStrategy():simpleOnly?simpleTeacherTimeDraft():initialDraft();
    if(lessonChange)for(const course of courses){
      const dates=state.changeLessons.filter(row=>row[2]===course.id).map(row=>row[0]).sort();
      Object.assign(state.draft.courses[course.id][0],{start:dates[0],end:dates.at(-1)});
    }
    state.aiSnapshot=simpleOnly&&!useSavedStrategy?{global:'未提出额外全局限制；多课程默认随机排课。',courses:Object.fromEntries(courses.map(course=>[course.id,`仅要求按老师可用时间排课，未指定学生时段。${state.orderEndRule===endRules[0]?`在有效开结课日期内按每周 ${state.draft.courses[course.id][0].frequencyMin}—${state.draft.courses[course.id][0].frequencyMax} 节尽量均匀安排；课程排满可提前结束。`:'无明确结课日期，默认每周 1—3 节，排完剩余课程结束。'}本课程每日课节上限默认 1 节。`]))}:null;
    const resolution=state.requirementConversation?.sourceText===state.supplement?state.requirementConversation.resolution:'';
    const supplementBansMonday=/周一18:30[—\-~至]20:30(?:禁排|不可排|不能上课|不上课)/u.test(state.supplement.replace(/\s+/g,''));
    const useOtherTime=!flowSubmission&&(resolution?/周一.*(?:不可排|不排|禁排)|取消.*周一|改用其他时段|以补充要求为准/u.test(resolution):supplementBansMonday);
    if(useOtherTime) {
      const writing=state.draft.courses.writing;
      writing[0].frequency='每周1节';
      writing[0].timeRules=[{type:'常规',weekdays:[],allDay:false,start:'',end:''}];
      writing[0].time='常规';
      writing.forEach(segment=>segment.unavailableTimeRules.push({dateFrom:'',dateTo:'',weekdays:['周一'],allDay:false,startTime:'18:30',endTime:'20:30'}));
    }
    const analyzedCourseText=course=>course.id==='writing'&&useOtherTime
      ?course.ai.replace('9月每周固定1节，固定周一18:30—20:30。9月首周从周二开始，无周一固定时段，首周目标为0节；','9月每周1节，周一18:30—20:30不可排；')
      :course.ai;
    if(resolution) {
      state.aiSnapshot={global:'学生每周总课节上限和学生每日总课节上限均无特殊要求，多课程采用随机排课。',courses:Object.fromEntries(courses.map(course=>[course.id,`${analyzedCourseText(course)}${course.id==='writing'?` 沟通确认：${resolution}。`:''}`]))};
    } else if(supplementBansMonday) {
      state.aiSnapshot={global:'学生每周总课节上限和学生每日总课节上限均无特殊要求，多课程采用随机排课。',courses:Object.fromEntries(courses.map(course=>[course.id,analyzedCourseText(course)]))};
    }
    state.coursePlans=null;
    state.dirty=false;
    state.recommended=false;
    state.selected={};
    if(lessonChange&&lessonChange.type!=='teacher'){
      state.direct=Object.fromEntries(courses.map(course=>[course.id,originalChangeTeacher(course.id)]));
      generateSchedule();
    }else if(homeroomSupplement&&!lessonChange&&!renewalPreview&&allTeachersSpecified()){
      generateSchedule();
    }else if(targetStep===3)openTeacherSelection();
    else openWizard(targetStep);
  }
  function refreshSupplement() {
    const scrollTop=$('#wizardBody').scrollTop;
    renderSupplement();
    $('#wizardBody').scrollTop=scrollTop;
  }
  function appendSupplementFiles(fileList) {
    const files=[...fileList];
    const accepted=files.filter(file=>/\.(png|jpe?g|webp)$/i.test(file.name));
    if(!accepted.length) {notify('请选择 PNG、JPG 或 WebP 图片');return;}
    state.files.push(...accepted.map(file=>file.name));
    refreshSupplement();
    notify(`已选择 ${accepted.length} 份补充信息${accepted.length<files.length?'，不支持的格式已忽略':''}`);
  }
  function field(label,value,attrs='') { return `<label>${label}<input ${attrs} value="${escapeHtml(value)}" ${state.editing?'':'disabled'}></label>`; }
  function dateRangeField(start,end,attrs,lastStrategy=false) {
    const displayedStart=start;
    const displayedEnd=end;
    if(!state.editing) return `<label class="date-range-field">排课日期<div class="date-range-inputs"><input value="${escapeHtml(displayDate(displayedStart))}" aria-label="排课开始日期" disabled><span>—</span><input value="${displayedEnd?escapeHtml(displayDate(displayedEnd)):'排完全部课时结束'}" aria-label="排课结束日期" disabled></div></label>`;
    const hints=[];
    if(lastStrategy) hints.push('排完为止的最后一条策略可不填结束日期');
    return `<label class="date-range-field">排课日期<div class="date-range-inputs"><input type="date" ${attrs} data-key="start" value="${escapeHtml(start)}" aria-label="排课开始日期" required><span>-</span><input type="date" ${attrs} data-key="end" value="${escapeHtml(end)}" aria-label="排课结束日期${lastStrategy?'（最后一条策略可留空）':''}" ${lastStrategy?'':'required'}></div>${hints.length?`<small class="date-range-hint">${escapeHtml(hints.join('；'))}</small>`:''}</label>`;
  }
  function effectiveCourseRequirements(course) {
    return state.draft.courses[course.id];
  }
  function globalSelect(label,key,value,options) {
    if(!state.editing) return `<label>${label}<input value="${escapeHtml(key==='method'||value==='无特殊要求'?value:`${value}节课`)}" disabled></label>`;
    return `<label>${label}<select data-global-key="${key}" ${state.editing?'':'disabled'}>${options.map(option=>`<option value="${escapeHtml(option)}" ${value===option?'selected':''}>${escapeHtml(key==='method'||option==='无特殊要求'?option:`${option}节课`)}</option>`).join('')}</select></label>`;
  }
  function globalStructure() {
    const global=state.draft.global;
    const limits=['无特殊要求',...Array.from({length:10},(_,i)=>String(i+1))];
    return `<div class="global-policy-card"><div class="rule-grid">${globalSelect('学生每周总课节上限','weekCap',global.weekCap,limits)}${globalSelect('学生每日总课节上限','dayCap',global.dayCap,limits)}${globalSelect('多课程排课方式','method',global.method,['随机排课','交叉排课'])}</div></div>`;
  }
  function globalAnalysisSummary() {
    const global=state.draft.global;
    return `学生每周总课节上限 ${global.weekCap}，学生每日总课节上限 ${global.dayCap}，多课程排课方式 ${global.method}。`;
  }
  const DAY=86400000;
  const utcDate=value=>new Date(`${value}T00:00:00Z`);
  const isoDate=date=>date.toISOString().slice(0,10);
  const daysBetween=(a,b)=>Math.round((b-a)/DAY)+1;
  const roundLessons=value=>Math.max(0,Math.floor(value+.5));
  const unavailableRuleMatchesDay=(rule,day,requirement)=>{
    const from=rule.dateFrom||requirement?.start||orderDates.start;
    const to=rule.dateTo||requirement?.end||'';
    const weekday=weekdayLabels[(utcDate(day).getUTCDay()+6)%7];
    return day>=from&&(!to||day<=to)&&(!rule.weekdays?.length||rule.weekdays.includes(weekday));
  };
  const isStoppedDay=(day,requirement)=>{
    const globalStop=state.draft.availability.fullDayStops.some(stop=>stop.start<=day&&day<=stop.end);
    const localStop=(requirement?.unavailableTimeRules||[]).some(rule=>rule.allDay&&unavailableRuleMatchesDay(rule,day,requirement));
    return globalStop||localStop;
  };
  const minutes=value=>{const [hour,minute]=value.split(':').map(Number);return hour*60+minute;};
  const originalChangeTeacher=id=>lessonChange.groups[courses.findIndex(course=>course.id===id)].teacher;
  const sameChangeTeacher=(a,b)=>a?.split('(')[0].trim()===b?.split('(')[0].trim();
  function changeSlotsConflict(date,time,booking) {
    if(date!==booking.date)return false;
    const [from,to]=time.split('-').map(minutes),[otherFrom,otherTo]=booking.time.split('-').map(minutes);
    return from<otherTo&&otherFrom<to;
  }
  function changeTeacherCovers(courseId,teacher) {
    return state.changeLessons.filter(row=>row[2]===courseId).every(([date,time])=>
      !lessonChange.busy.some(booking=>sameChangeTeacher(booking.teacher,teacher)&&changeSlotsConflict(date,time,booking)));
  }
  function findReplannedLessons(original, text, occupied) {
    const [originalDate,originalSlot,courseId]=original;
    const teacher=originalChangeTeacher(courseId);
    const [originalStart,originalEnd]=originalSlot.split('-').map(minutes);
    const originalMinutes=originalEnd-originalStart;
    const split=text.match(/(?:拆(?:分)?成|改为|安排)\s*([一二两三四五六]|\d+)\s*节/u);
    const count=split ? Number(split[1])||({一:1,二:2,两:2,三:3,四:4,五:5,六:6})[split[1]] : 1;
    const requestedLength=text.match(/(?:每节|各|改为|时长(?:为)?)\s*(\d+(?:\.\d+)?)\s*(小时|分钟)/u);
    const duration=requestedLength ? Number(requestedLength[1])*(requestedLength[2]==='小时'?60:1) : originalMinutes/count;
    if(!Number.isInteger(duration)||!(duration>0)||duration*count!==originalMinutes)
      return {questions:[`请调整课节数量或每节时长，重新排课的合计时长须等于原课节的 ${originalMinutes} 分钟。`]};
    const dates=[...new Set(text.match(/\d{4}-\d{2}-\d{2}/g)||[])];
    const weekdays=[...text.matchAll(/(?:周|星期)([一二三四五六日天])/g)].map(match=>'日一二三四五六'.indexOf(match[1]==='天'?'日':match[1]));
    const clocks=text.match(/\b\d{1,2}:\d{2}\b/g)||[];
    const clockMinutes=clock=>{
      const [hour,minute]=clock.split(':').map(Number);
      return minute<60&&hour<24?hour*60+minute:NaN;
    };
    const lower=clocks.length&& !/以前|之前|前可上/u.test(text)?clockMinutes(clocks[0]):0;
    const upper=clocks.length===2?clockMinutes(clocks[1]):/以前|之前|前可上/u.test(text)&&clocks.length?clockMinutes(clocks[0]):1440;
    const exact=clocks.length===1&&!/以后|之后|以前|之前|前可上/u.test(text);
    const scopeQuestion=['请明确重排日期、星期或可上课时段，例如“周二或周四 10:30–12:30”，或填写“按老师时间安排”。'];
    if((!dates.length&&!weekdays.length&&!clocks.length&&!/按(?:照)?老师.*时间/u.test(text))||
      /不可排|不排|禁排|不能上课|不要|除外/u.test(text)||dates.length>2||clocks.length>2)return {questions:scopeQuestion};
    const first=utcDate(dates[0]||originalDate);
    const last=dates.length?utcDate(dates.at(-1)):new Date(first.getTime()+30*DAY);
    if(dates.some(date=>Number.isNaN(utcDate(date).getTime())||isoDate(utcDate(date))!==date)||
      !Number.isFinite(lower+upper)||lower+duration>upper||last<first||last-first>92*DAY)
      return {questions:['请确认重排的日期范围和起止时间。所选时段须能容纳每节课。']};
    const lessons=[];
    const differentDays=/分(?:两|二|[2-6]|几)天|不同日期|每天(?:只排)?一节/u.test(text);
    for(let day=first.getTime();day<=last;day+=DAY){
      const date=new Date(day);
      if(weekdays.length&&!weekdays.includes(date.getUTCDay()))continue;
      const dayText=isoDate(date);
      for(const available of studentSlots(dayText)){
        const [from,to]=available.split('-').map(minutes);
        const limit=Math.min(upper,to,exact?lower+duration:1440);
        for(let start=exact?lower:Math.max(lower,from);start>=from&&start+duration<=limit;start+=15){
          const time=slotText(start,start+duration);
          if(occupied.some(([date,slot])=>changeSlotsConflict(dayText,time,{date,time:slot})))continue;
          if(lessons.some(([date,slot])=>changeSlotsConflict(dayText,time,{date,time:slot})||differentDays&&dayText===date))continue;
          if(lessonChange.busy.some(booking=>changeSlotsConflict(dayText,time,booking)&&
            (booking.student||sameChangeTeacher(booking.teacher,teacher))))continue;
          if(!teacherAvailable(teacher,dayText,time))continue;
          lessons.push([dayText,time,courseId]);
          if(lessons.length===count)return {lessons};
        }
      }
    }
    return {questions:['指定范围内的师生共同可排时段不足。请扩大可排范围，或调整课节数量和时长。']};
  }
  function calculateChangeLessons() {
    const text=state.supplement.trim();
    const groupSlots=lessonChange.groups.flatMap((group,index)=>group.slots.map(([date,time])=>[date,time,courses[index].id]));
    if(lessonChange.type==='duration-replan'){
      const generated=[];
      const originals=groupSlots.sort(([dateA,timeA],[dateB,timeB])=>dateA.localeCompare(dateB)||timeA.localeCompare(timeB));
      for(const original of originals){
        const result=findReplannedLessons(original,text,generated);
        if(result.questions){
          const [date,time]=original;
          return {questions:originals.length===1?result.questions:result.questions.map(question=>`原课节 ${date} ${time}：${question}`)};
        }
        generated.push(...result.lessons);
      }
      return {lessons:generated};
    }
    const offset=text.match(/(顺延|提前)\s*(\d+)\s*天/u);
    const resized=text.match(/(?:改为|调整为|缩短为|每节)\s*(\d+(?:\.\d+)?)\s*(小时|分钟)/u);
    const explicit=text.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*[-—–至]\s*(\d{2}:\d{2})/u);
    const isBatchTime=lessonChange.type==='time'&&lessonChange.autoAnalyze;
    if(isBatchTime&&!offset&&!resized&&!explicit&&!/保留原(?:上课)?时段/u.test(text)){
      return {questions:['请明确新的上课日期、时段或每节课的时长，例如“每节课顺延1天”或“保留原开始时间，每节改为1小时”。']};
    }
    if(explicit&&groupSlots.length!==1)return {questions:['这次选择了多节课。请分别说明各课节的新日期和时段，或填写统一的顺延天数、时长。']};
    if(offset&&Number(offset[2])>3660)return {questions:['请确认调整的天数，或填写新的具体日期。']};
    const applyTime=lessonChange.type!=='teacher';
    const generated=groupSlots.map(([date,time,id])=>{
      if(applyTime&&explicit)return [explicit[1],`${explicit[2]}-${explicit[3]}`,id];
      if(applyTime&&offset)date=isoDate(new Date(utcDate(date).getTime()+Number(offset[2])*DAY*(offset[1]==='顺延'?1:-1)));
      if(applyTime&&resized){
        const from=minutes(time.split('-')[0]);
        const duration=Number(resized[1])*(resized[2]==='小时'?60:1);
        time=slotText(from,from+duration);
      }
      return [date,time,id];
    });
    const duration=rows=>rows.reduce((sum,row)=>{
      const [from,to]=row[1].split('-').map(minutes);return sum+to-from;
    },0);
    for(const course of courses){
      if(duration(generated.filter(row=>row[2]===course.id))>course.hours*60)return {questions:['变更后的课时超过原课时。请缩短时长，或减少本次重排的课节数。']};
    }
    for(const [index,[date,time,id]] of generated.entries()){
      const [from,to]=time.split('-').map(minutes);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(utcDate(date).getTime())||!(from<to&&from>=0&&to<=1440)){
        return {questions:['请确认日期和起止时间，结束时间应晚于开始时间。']};
      }
      const busy=lessonChange.busy.some(booking=>changeSlotsConflict(date,time,booking)&&
        (booking.student||lessonChange.type!=='teacher'&&sameChangeTeacher(booking.teacher,originalChangeTeacher(id))));
      if(busy||generated.slice(0,index).some(([day,slot])=>changeSlotsConflict(date,time,{date:day,time:slot}))){
        return {questions:[`${date} ${time} 与其他课节冲突，请调整时段后重新提交。`]};
      }
    }
    return {lessons:generated};
  }
  const isBlockedSlot=(day,start,end,requirement)=>isStoppedDay(day,requirement)
    ||state.draft.availability.blockedSlots.some(slot=>slot.start<=day&&day<=slot.end&&start<minutes(slot.to)&&end>minutes(slot.from))
    ||(requirement?.unavailableTimeRules||[]).some(rule=>!rule.allDay&&rule.startTime&&rule.endTime&&unavailableRuleMatchesDay(rule,day,requirement)&&start<minutes(rule.endTime)&&end>minutes(rule.startTime));
  function frequencySpec(value) {
    const period=value.includes('每两周')?'biweek':value.includes('每月')?'month':'week';
    const numbers=[...value.matchAll(/\d+/g)].map(match=>Number(match[0]));
    return {period,min:numbers[0]||0,max:numbers[1]||numbers[0]||0};
  }
  const frequencyPeriods={week:'每周',biweek:'每两周',month:'每月'};
  const weekdayLabels=['周一','周二','周三','周四','周五','周六','周日'];
  const formatFrequency=segment=>`${frequencyPeriods[segment.frequencyPeriod]||'每周'}${segment.frequencyMin}-${segment.frequencyMax}节`;
  function parseTimeRequirement(value) {
    const mode=value.startsWith('固定')?'固定':value.startsWith('优先')?'优先':'常规';
    if(mode==='常规') return {mode,slots:[]};
    const slots=[];
    for(const part of value.split(/[；;]/)) {
      const range=part.match(/(\d{1,2}:\d{2})\s*[—–-]\s*(\d{1,2}:\d{2})/);
      if(!range) continue;
      const days=part.includes('周中')?weekdayLabels.slice(0,5):part.includes('周末')?weekdayLabels.slice(5):[...part.matchAll(/周[一二三四五六日]/g)].map(match=>match[0]);
      slots.push({weekdays:[...new Set(days)],start:range[1],end:range[2]});
    }
    return {mode,slots};
  }
  const courseLessonHours=course=>Number(state.draft?.courseLessonHours?.[course.id])||2;
  const courseLessonOptions=course=>Array.isArray(course.lessonOptions)&&course.lessonOptions.length?course.lessonOptions:[courseLessonHours(course)];
  const courseLessonDurationChips=course=>[...courseLessonOptions(course)].sort((a,b)=>Number(b)-Number(a)).map(hours=>'<span class="meta-chip lesson-duration-chip">'+hours+'课时/节</span>').join('');
  const courseLessonTotal=course=>Math.ceil(course.hours/courseLessonHours(course)-1e-9);
  const timeRulesOf=segment=>segment?.timeRules||[];
  const rulesByType=(segment,type)=>timeRulesOf(segment).filter(rule=>rule.type===type);
  const onlyFixedRules=segment=>rulesByType(segment,'固定').length>0&&timeRulesOf(segment).every(rule=>rule.type==='固定');
  const slotInRule=(rule,weekday,from,to)=>rule.weekdays.includes(weekday)&&(rule.allDay||minutes(rule.start)<=from&&to<=minutes(rule.end));
  const formatTimeRequirement=segment=>timeRulesOf(segment).map(rule=>rule.type==='常规'?'常规（系统选择时段）':`${rule.type} ${rule.weekdays.join('、')} ${rule.allDay?'全天':`${rule.start}—${rule.end}`}`).join('；');
  function effectiveDays(start,end,requirement) {
    let count=0;
    for(let t=start.getTime();t<=end.getTime();t+=DAY){const day=isoDate(new Date(t));if(!isStoppedDay(day,requirement))count++;}
    return count;
  }
  // Prototype student/teacher calendars: capacity is calculated from dated slots,
  // not from the number of visually available cells. Replace with live agendas in production.
  const studentWeeklySlots=[
    ['08:20-10:20','14:30-16:30'],
    ['18:30-20:30'],
    ['10:30-12:30','14:30-16:30'],
    ['08:20-10:20','10:20-12:30','14:30-16:30'],
    ['10:20-12:30','10:30-12:30','14:30-16:30'],
    ['08:20-10:20','14:30-16:30'],
    ['08:20-10:20','10:30-12:30']
  ];
  function studentSlots(day) {
    // One intentionally tight example week makes the student-side shortfall visible.
    if(day>='2026-11-23'&&day<='2026-11-29') return day==='2026-11-25'?['08:20-10:20']:[];
    return studentWeeklySlots[utcDate(day).getUTCDay()];
  }
  function teacherAvailable(teacherName,day,time) {
    if(!teacherName) return true;
    const seed=[...`${teacherName}|${day}|${time}`].reduce((sum,char)=>sum+char.charCodeAt(0),0);
    return seed%6!==0;
  }
  function fixedPatternCount(requirement,start,end) {
    if(!onlyFixedRules(requirement)) return Infinity;
    const fixedRules=rulesByType(requirement,'固定');
    let count=0;
    for(let t=start.getTime();t<=end.getTime();t+=DAY) {
      const date=new Date(t),weekday=weekdayLabels[(date.getUTCDay()+6)%7];
      if(!isStoppedDay(isoDate(date),requirement)&&fixedRules.some(slot=>slot.weekdays.includes(weekday))) count++;
    }
    return count;
  }
  const slotClock=value=>`${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;
  const slotText=(from,to)=>`${slotClock(from)}-${slotClock(to)}`;
  function eligibleSlots(requirement,date,duration,teacherName='',specificType='') {
    const day=isoDate(date);
    if(isStoppedDay(day,requirement))return [];
    const weekday=weekdayLabels[(date.getUTCDay()+6)%7];
    const rules=timeRulesOf(requirement);
    const limited=rules.filter(rule=>rule.type==='仅限');
    const fixed=rules.filter(rule=>rule.type==='固定');
    const preferred=rules.filter(rule=>rule.type==='优先');
    const explicitStarts=rules.filter(rule=>rule.type!=='常规'&&!rule.allDay&&rule.weekdays.includes(weekday)&&rule.start)
      .map(rule=>minutes(rule.start));
    const matches=(group,from,to)=>group.some(rule=>slotInRule(rule,weekday,from,to));
    return studentSlots(day).flatMap(time=>{
      const [availableFrom,availableTo]=time.split('-').map(minutes);
      const starts=new Set([availableFrom,...explicitStarts.filter(value=>value>=availableFrom&&value<availableTo)]);
      return [...starts].flatMap(from=>{
        const to=from+duration;
        if(to>availableTo||isBlockedSlot(day,from,to,requirement))return [];
        const isFixed=matches(fixed,from,to);
        if(limited.length&&!matches(limited,from,to)||onlyFixedRules(requirement)&&!isFixed)return [];
        if(specificType&&!matches(rules.filter(rule=>rule.type===specificType),from,to))return [];
        const time=slotText(from,to);
        if(slotIsHeld(teacherName,day,time)||!teacherAvailable(teacherName,day,time))return [];
        return [{day,from,to,priority:isFixed?0:matches(preferred,from,to)?1:2}];
      });
    });
  }
  function calendarCapacity(requirement,start,end,courseId,teacherName='',specificType='') {
    if(!end||end<start) return 0;
    const course=courses.find(item=>item.id===courseId);
    const durationMinutes=Math.round((course?courseLessonHours(course):2)*60);
    const perDay=Math.min(Number(requirement.dayCap)||1,Number(state.draft.global.dayCap)||Infinity);
    const perWeek=Math.min(Number(requirement.weekCap)||Infinity,Number(state.draft.global.weekCap)||Infinity);
    const weekly=new Map();
    for(let t=start.getTime();t<=end.getTime();t+=DAY) {
      const date=new Date(t);
      const eligible=eligibleSlots(requirement,date,durationMinutes,teacherName,specificType).sort((a,b)=>a.to-b.to);
      let dayCount=0,lastEnd=-1;
      for(const {from,to} of eligible) if(from>=lastEnd&&dayCount<perDay) {dayCount++;lastEnd=to;}
      const [weekStart]=periodBounds(date,'week',requirement.start);
      const key=isoDate(weekStart);
      weekly.set(key,(weekly.get(key)||0)+dayCount);
    }
    return [...weekly.values()].reduce((sum,count)=>sum+Math.min(count,perWeek),0);
  }
  function periodBounds(day,period,requirementStart) {
    const first=new Date(day);
    if(period==='month') {first.setUTCDate(1);const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0));return [first,last];}
    const monday=(day.getUTCDay()+6)%7;first.setUTCDate(first.getUTCDate()-monday);
    if(period==='biweek') {
      const anchor=utcDate(requirementStart);
      anchor.setUTCDate(anchor.getUTCDate()-(anchor.getUTCDay()+6)%7);
      const offset=Math.floor((first-anchor)/(14*DAY));
      first.setTime(anchor.getTime()+offset*14*DAY);
    }
    return [first,new Date(first.getTime()+(period==='biweek'?13:6)*DAY)];
  }
  function fixedCapacity(requirement,start,end,dailyCapacity) {
    if(!onlyFixedRules(requirement)) return Infinity;
    let count=0;
    for(let t=start.getTime();t<=end.getTime();t+=DAY) {
      const date=new Date(t),day=isoDate(date),weekday=weekdayLabels[(date.getUTCDay()+6)%7];
      const intervals=rulesByType(requirement,'固定').filter(slot=>slot.weekdays.includes(weekday)&&/^\d{1,2}:\d{2}$/.test(slot.start)&&/^\d{1,2}:\d{2}$/.test(slot.end))
        .map(slot=>[minutes(slot.start),minutes(slot.end)])
        .filter(([from,to])=>from<to&&!isBlockedSlot(day,from,to,requirement))
        .sort((a,b)=>a[1]-b[1]);
      let lastEnd=-1,dayCount=0;
      for(const [from,to] of intervals) if(from>=lastEnd) {dayCount++;lastEnd=to;}
      count+=Math.min(dayCount,dailyCapacity);
    }
    return count;
  }
  function fixedRuleCapacity(requirement,start,end,applyStops) {
    let count=0;
    const fixedRules=rulesByType(requirement,'固定');
    for(let t=start.getTime();t<=end.getTime();t+=DAY) {
      const date=new Date(t),day=isoDate(date),weekday=weekdayLabels[(date.getUTCDay()+6)%7];
      const intervals=fixedRules.filter(rule=>rule.weekdays.includes(weekday))
        .map(rule=>[minutes(rule.start),minutes(rule.end)])
        .filter(([from,to])=>!applyStops||!isBlockedSlot(day,from,to,requirement))
        .sort((a,b)=>a[1]-b[1]);
      let daily=0,lastEnd=-1;
      for(const [from,to] of intervals) if(from>=lastEnd&&daily<Number(requirement.dayCap||1)) {daily++;lastEnd=to;}
      count+=daily;
    }
    return count;
  }
  function weeklyCapacity(requirement,start,end,dailyCapacity) {
    const weeklyLimit=Number(requirement.weekCap);
    let total=0;
    for(let cursor=new Date(start);cursor<=end;) {
      const [,weekEnd]=periodBounds(cursor,'week',requirement.start);
      const sliceEnd=weekEnd<end?weekEnd:end;
      const dayCapacity=effectiveDays(cursor,sliceEnd,requirement)*dailyCapacity;
      total+=Math.min(dayCapacity,fixedCapacity(requirement,cursor,sliceEnd,dailyCapacity),Number.isInteger(weeklyLimit)&&weeklyLimit>0?weeklyLimit:Infinity);
      cursor=new Date(sliceEnd.getTime()+DAY);
    }
    return total;
  }
  function strategyPlan(course) {
    const requirements=effectiveCourseRequirements(course);
    const buckets=[];
    const issues=[];
    for(const [index,requirement] of requirements.entries()) {
      let lowerCarry=0;
      if(!requirement.end&&index===requirements.length-1&&requirement.completion==='排完剩余课程') {
        buckets.push({index,start:requirement.start,end:'',days:null,min:0,max:Infinity,requiredMin:0,requiredMax:Infinity,studentCapacity:null,studentGap:0,finish:true,rolling:true});
        continue;
      }
      const start=utcDate(requirement.start),end=utcDate(requirement.end||previewEnd(requirement.start));
      if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||start>end) continue;
      const dailyCapacity=Number(requirement.dayCap)||1;
      if(requirement.completion==='排完剩余课程'||requirement.completion==='按课节数排课') {
        const days=effectiveDays(start,end,requirement);
        const capacity=calendarCapacity(requirement,start,end,course.id);
        if(requirement.completion==='按课节数排课') {
          const count=Number(requirement.lessonCount)||0;
          if(count>capacity) issues.push(`排课要求${index+1}最多可排${capacity}节，无法完成指定的${count}节`);
          buckets.push({index,start:requirement.start,end:requirement.end,days,min:Math.min(count,capacity),max:Math.min(count,capacity),requiredMin:count,requiredMax:count,studentCapacity:capacity,studentGap:Math.max(0,count-capacity),count:true,finish:false});
        } else buckets.push({index,start:requirement.start,end:requirement.end,days,min:0,max:capacity,requiredMin:0,requiredMax:Infinity,studentCapacity:capacity,studentGap:0,finish:true});
        continue;
      }
      const spec={period:requirement.frequencyPeriod,min:Number(requirement.frequencyMin),max:Number(requirement.frequencyMax)};
      let cumulativeMin=0,cumulativeMax=0,previousMin=0,previousMax=0;
      for(let cursor=new Date(start);cursor<=end;) {
        const [periodStart,periodEnd]=periodBounds(cursor,spec.period,requirement.start);
        const sliceEnd=periodEnd<end?periodEnd:end;
        const days=effectiveDays(cursor,sliceEnd,requirement);
        const denominator=daysBetween(periodStart,periodEnd);
        const fixedDates=fixedPatternCount(requirement,cursor,sliceEnd);
        const ratio=onlyFixedRules(requirement)&&fixedDates===0?0:onlyFixedRules(requirement)&&spec.period==='week'?1:days/denominator;
        cumulativeMin+=spec.min*ratio;
        cumulativeMax+=spec.max*ratio;
        const requiredMin=Math.max(0,roundLessons(cumulativeMin)-previousMin);
        const requiredMax=Math.max(requiredMin,Math.ceil(cumulativeMax-1e-9)-previousMax);
        previousMin+=requiredMin;
        previousMax+=requiredMax;
        const capacity=calendarCapacity(requirement,cursor,sliceEnd,course.id);
        const max=Math.min(requiredMax,capacity);
        const min=Math.min(requiredMin+lowerCarry,max);
        lowerCarry=Math.max(0,requiredMin+lowerCarry-max);
        buckets.push({index,start:isoDate(cursor),end:isoDate(sliceEnd),days,min,max,requiredMin,requiredMax,studentCapacity:capacity,studentGap:lowerCarry,finish:false});
        cursor=new Date(sliceEnd.getTime()+DAY);
      }
    }
    // The student plan describes every rule period, not a teacher-independent lesson allocation.
    // A later period disappears from the result only when the actual schedule has already finished the course.
    const fixedLessonCount=buckets.filter(bucket=>bucket.count).reduce((sum,bucket)=>sum+bucket.requiredMin,0);
    if(fixedLessonCount>courseLessonTotal(course)) issues.push(`按课节数排课的指定节数超过课程总节数`);
    const totalCapacity=buckets.reduce((sum,bucket)=>sum+bucket.max,0);
    return {rows:buckets,remaining:Math.max(0,courseLessonTotal(course)-totalCapacity),issues};
  }
  function planRuleLine(requirement,withTitle=false) {
    const frequency=requirement.completion==='按频次排课'?`<span>${escapeHtml(requirement.frequency)}</span>`:'';
    const lessonCount=requirement.completion==='按课节数排课'?`<span>排课课节数 ${escapeHtml(requirement.lessonCount)}节</span>`:'';
    const weekCap=requirement.completion!=='按频次排课'?`<span>本课程每周课节上限 ${escapeHtml(requirement.weekCap||'无特殊要求')}${requirement.weekCap&&requirement.weekCap!=='无特殊要求'?'节':''}</span>`:'';
    return `<div class="result-rule-line">${withTitle?'<strong class="result-rule-title">排课策略</strong>':''}<span>${escapeHtml(requirement.completion)}</span>${frequency}${lessonCount}${weekCap}<span>${escapeHtml(requirement.time)}</span><span>本课程每日课节上限 ${escapeHtml(requirement.dayCap)} 节</span></div>`;
  }
  const lessonRange=(min,max)=>`${min}—${max} 节`;
  const periodDate=row=>row.rolling?`${dateLabel(row.start)} 起 · 滚动排课`:`${dateLabel(row.start)}—${dateLabel(row.end)}`;
  const dateFromLabel=value=>{const [year,month,day]=value.split('-').map(Number);return `${year}年${month}月${day}日起`;};
  const previewEnd=start=>isoDate(new Date(utcDate(start).getTime()+55*DAY));
  function periodRequirement(row) {
    if(row.rolling) return '排完剩余课节（滚动）';
    if(row.finish) return '排完剩余课节';
    return lessonRange(row.requiredMin,row.requiredMax);
  }
  function studentCapacityLabel(row,course,requirement) {
    if(row.rolling) {
      const capacity=calendarCapacity(requirement,utcDate(row.start),utcDate(previewEnd(row.start)),course.id);
      return `${Math.min(courseLessonTotal(course),capacity)} 节`;
    }
    if(row.finish) return `${Math.min(courseLessonTotal(course),row.studentCapacity)} 节`;
    return `${row.max} 节`;
  }
  const studentGap=row=>row.rolling?'--':row.finish?'待实际排课后核对':`${row.studentGap} 节`;
  const studentEffectiveDays=(row,requirement)=>row.rolling
    ?`${effectiveDays(utcDate(row.start),utcDate(previewEnd(row.start)),requirement)} 天`
    :`${row.days} 天`;
  function teacherCapacity(course,teacherName,row,requirement) {
    const end=row.rolling?previewEnd(row.start):row.end;
    const capacity=calendarCapacity(requirement,utcDate(row.start),utcDate(end),course.id,teacherName);
    return Math.min(courseLessonTotal(course),row.requiredMax,capacity);
  }
  function teacherExpectedRows(course,teacherName,plan=state.coursePlans?.[course.id]||strategyPlan(course)) {
    const requirements=effectiveCourseRequirements(course);
    let lowerCarry=0;
    let previousIndex=null;
    return plan.rows.map(row=>{
      if(row.index!==previousIndex) { lowerCarry=0; previousIndex=row.index; }
      const covered=teacherCapacity(course,teacherName,row,requirements[row.index]);
      if(row.finish) return {row,covered,expectedMin:0,expectedMax:covered,gap:0};
      const required=row.count?row.requiredMin:row.requiredMin+lowerCarry;
      const expectedMin=Math.min(required,covered);
      const gap=Math.max(0,required-covered);
      lowerCarry=row.count?0:gap;
      return {row,covered,expectedMin,expectedMax:covered,gap};
    });
  }
  function teacherCoverageSummary(course,teacherName) {
    const plan=state.coursePlans?.[course.id]||strategyPlan(course);
    const requirements=effectiveCourseRequirements(course);
    let total=0,gap=0,fixed=0,preferred=0;
    for(const row of plan.rows) {
      const requirement=requirements[row.index];
      const covered=teacherCapacity(course,teacherName,row,requirement);
      total+=covered;
      if(!row.finish) gap+=Math.max(0,row.requiredMin-covered);
      const end=row.rolling?previewEnd(row.start):row.end;
      if(rulesByType(requirement,'固定').length) fixed+=Math.min(covered,calendarCapacity(requirement,utcDate(row.start),utcDate(end),course.id,teacherName,'固定'));
      if(rulesByType(requirement,'优先').length) preferred+=Math.min(covered,calendarCapacity(requirement,utcDate(row.start),utcDate(end),course.id,teacherName,'优先'));
    }
    return {total:Math.min(courseLessonTotal(course),total),gap,fixed:Math.min(courseLessonTotal(course),fixed),preferred:Math.min(courseLessonTotal(course),preferred)};
  }
  function coursePlanList(courseId) {
    const plan=state.coursePlans?.[courseId];
    if(!plan) return '<div class="strategy-notice">请先生成排课计划</div>';
    const course=courses.find(item=>item.id===courseId);
    const requirements=effectiveCourseRequirements(course);
    const sections=requirements.map((requirement,index)=>{
      const rows=plan.rows.filter(row=>row.index===index);
      if(!rows.length) return '';
      const range=requirement.end?`${dateLabel(requirement.start)}—${dateLabel(requirement.end)}`:dateFromLabel(requirement.start);
      return `<div class="result-requirement teacher-plan-section"><div class="teacher-plan-heading"><strong>学生排课计划 ${index+1}</strong><span>${range}</span></div>${planRuleLine(requirement)}<div class="result-table-scroll"><table class="result-period-table"><thead><tr><th>排课日期</th><th>有效天数</th><th>学生排课要求</th><th>学生可排容量</th><th>下限容量缺口</th></tr></thead><tbody>${rows.map(row=>`<tr class="${row.rolling?'rolling-plan-row':''}"><td>${row.rolling?dateFromLabel(row.start):periodDate(row)}</td><td>${studentEffectiveDays(row,requirement)}</td><td>${row.rolling?'排完剩余课节':periodRequirement(row)}</td><td><strong>${studentCapacityLabel(row,course,requirement)}</strong></td><td class="${row.studentGap&&!row.rolling?'period-gap':''}">${studentGap(row)}</td></tr>`).join('')}</tbody></table></div></div>`;
    }).join('')||'<div class="strategy-notice">当前策略没有可执行的排课日期</div>';
    const warning=plan.remaining>0?`<div class="strategy-notice is-error">按示例学生日程测算，指定日期内预计仍有 ${plan.remaining} 节缺少排课机会；可继续选择老师，最终以联合排课结果为准。</div>`:'';
    return `${sections}${warning}`;
  }
  function completionField(course,index,value) {
    if(!state.editing) return `<label>排课方式<input value="${escapeHtml(value)}" disabled></label>`;
    return `<label>排课方式<select data-course="${course.id}" data-segment="${index}" data-key="completion" ${state.editing?'':'disabled'}><option ${value==='按频次排课'?'selected':''}>按频次排课</option><option ${value==='按课节数排课'?'selected':''}>按课节数排课</option><option ${value==='排完剩余课程'?'selected':''}>排完剩余课程</option></select></label>`;
  }
  function frequencyField(course,index,segment) {
    if(!state.editing) return `<label data-frequency-field>上课频次<input value="${escapeHtml(segment.frequency)}" disabled></label>`;
    return `<div class="course-rule-control frequency-rule-control" data-frequency-field data-frequency-control data-course="${course.id}" data-segment="${index}"><span>上课频次</span><div class="frequency-rule-inputs"><select data-frequency-period aria-label="上课周期">${Object.entries(frequencyPeriods).map(([value,label])=>`<option value="${value}" ${segment.frequencyPeriod===value?'selected':''}>${label}</option>`).join('')}</select><input type="number" min="1" step="1" value="${segment.frequencyMin}" data-frequency-min aria-label="最少课节"><i>-</i><input type="number" min="1" step="1" value="${segment.frequencyMax}" data-frequency-max aria-label="最多课节"><em>节</em></div></div>`;
  }
  function lessonCountField(course,index,segment) {
    if(!state.editing) return `<label>排课课节数<input value="${escapeHtml(segment.lessonCount||'')}节" disabled></label>`;
    return `<label>排课课节数<div class="lesson-count-input"><input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${escapeHtml(segment.lessonCount||'')}" data-lesson-count data-course="${course.id}" data-segment="${index}" aria-label="排课课节数"><em>节</em></div></label>`;
  }
  function weekCapField(course,index,segment) {
    const value=segment.weekCap||'无特殊要求';
    if(!state.editing) return `<label>本课程每周课节上限<input value="${escapeHtml(value==='无特殊要求'?value:`${value}节`)}" disabled></label>`;
    const options=['无特殊要求',...Array.from({length:10},(_,i)=>String(i+1))];
    return `<label>本课程每周课节上限<select data-course="${course.id}" data-segment="${index}" data-key="weekCap">${options.map(option=>`<option value="${option}" ${value===option?'selected':''}>${option==='无特殊要求'?option:`${option}节`}</option>`).join('')}</select></label>`;
  }
  function completionSpecificFields(course,index,segment) {
    const fields=segment.completion==='按频次排课'?frequencyField(course,index,segment):`${segment.completion==='按课节数排课'?lessonCountField(course,index,segment):''}${weekCapField(course,index,segment)}`;
    return `<div class="completion-specific-fields" data-completion-fields>${fields}</div>`;
  }
  function timeSlotRow(slot) {
    const regular=slot.type==='常规';
    return `<div class="course-time-slot-row" data-time-slot-row><select data-time-rule-type aria-label="该时段类型">${['固定','优先','仅限','常规'].map(type=>`<option value="${type}" ${slot.type===type?'selected':''}>${type}</option>`).join('')}</select><div class="course-time-slot-details" data-time-rule-details ${regular?'hidden':''}><details class="weekday-picker" data-weekday-picker><summary><span data-weekday-summary>${slot.weekdays.length?slot.weekdays.join('、'):'选择星期'}</span></summary><div class="weekday-options">${weekdayLabels.map(day=>`<label><input type="checkbox" data-time-weekday value="${day}" ${slot.weekdays.includes(day)?'checked':''}>${day}</label>`).join('')}</div></details><select data-time-all-day aria-label="时段范围" ${slot.type==='固定'?'disabled':''}><option value="specific" ${slot.allDay?'':'selected'}>指定时段</option><option value="allDay" ${slot.allDay?'selected':''}>全天</option></select><div class="course-time-clock-inputs" data-time-clock-inputs ${slot.allDay?'hidden':''}><input type="time" value="${escapeHtml(slot.start)}" data-time-start aria-label="开始时间"><i>—</i><input type="time" value="${escapeHtml(slot.end)}" data-time-end aria-label="结束时间"></div></div><span class="course-regular-time" data-regular-time ${regular?'':'hidden'}>系统选择时段</span><button type="button" data-remove-time-slot aria-label="删除时段">×</button></div>`;
  }
  function timeField(course,index,segment) {
    if(!state.editing) return `<div class="course-rule-control time-rule-control"><span>上课时段</span><div class="course-time-rule-view-list">${timeRulesOf(segment).map(rule=>`<div class="course-time-rule-view-row"><strong>${escapeHtml(rule.type)}</strong>${rule.type==='常规'?'<span class="slot-regular-description">系统自动选择时段</span>':`<span class="slot-weekdays">${escapeHtml(rule.weekdays.join('、')||'每天')}</span><span>${rule.allDay?'全天':'指定时段'}</span>${rule.allDay?'':`<span>${escapeHtml(rule.start)}</span><i>—</i><span>${escapeHtml(rule.end)}</span>`}`}</div>`).join('')}</div></div>`;
    return `<div class="course-rule-control time-rule-control" data-time-control data-course="${course.id}" data-segment="${index}"><span>上课时段</span><div class="course-time-slot-editor"><div class="course-time-slot-list" data-time-slot-list>${timeRulesOf(segment).map(timeSlotRow).join('')}</div><button type="button" class="course-add-time-slot" data-add-time-slot>＋ 添加时段</button></div></div>`;
  }
  function unavailableTimeRow(rule) {
    const selected=rule.weekdays||[];
    return `<div class="strategy-limit-edit-row" data-unavailable-time-row><label class="unavailable-field">开始日期<input type="date" data-unavailable-from aria-label="不可排开始日期" value="${escapeHtml(rule.dateFrom||'')}"></label><label class="unavailable-field">结束日期<input type="date" data-unavailable-to aria-label="不可排结束日期" value="${escapeHtml(rule.dateTo||'')}"></label><div class="unavailable-field"><span>星期</span><details class="weekday-picker unavailable-weekday-picker"><summary><span data-weekday-summary>${selected.length?selected.join('、'):'每天'}</span></summary><div class="weekday-options"><label><input type="checkbox" data-unavailable-everyday ${selected.length?'':'checked'}>每天</label>${weekdayLabels.map(day=>`<label><input type="checkbox" data-unavailable-weekday value="${day}" ${selected.includes(day)?'checked':''}>${day}</label>`).join('')}</div></details></div><label class="unavailable-field unavailable-mode-field">时段<select data-unavailable-mode aria-label="不可排时段类型"><option value="allDay" ${rule.allDay?'selected':''}>全天</option><option value="specific" ${rule.allDay?'':'selected'}>指定时段</option></select></label><div class="unavailable-time-inputs" data-unavailable-time-inputs ${rule.allDay?'hidden':''}><label class="unavailable-field">开始时间<input type="time" data-unavailable-start aria-label="不可排开始时间" value="${escapeHtml(rule.startTime||'')}"></label><label class="unavailable-field">结束时间<input type="time" data-unavailable-end aria-label="不可排结束时间" value="${escapeHtml(rule.endTime||'')}"></label></div><button type="button" data-remove-unavailable-time aria-label="删除不可排时段">×</button></div>`;
  }
  function unavailableTimeView(rule) {
    const value=text=>`<span class="unavailable-view-value">${escapeHtml(text)}</span>`;
    return `<div class="unavailable-view-row">${value(rule.dateFrom?dateLabel(rule.dateFrom):'策略开始日期')}${value(rule.dateTo?dateLabel(rule.dateTo):'策略结束日期')}${value(rule.weekdays?.length?rule.weekdays.join('、'):'每天')}${value(rule.allDay?'全天':'指定时段')}${rule.allDay?'':`${value(rule.startTime||'--')}<i>—</i>${value(rule.endTime||'--')}`}</div>`;
  }
  function restrictionModule(course,index,segment) {
    const rules=segment.unavailableTimeRules||[];
    return `<section class="strategy-limit-module" data-strategy-limits data-course="${course.id}" data-segment="${index}"><div class="strategy-limit-heading"><strong>不可排时段</strong></div>${state.editing?`<div class="strategy-limit-edit-list" data-unavailable-time-list>${rules.map(unavailableTimeRow).join('')}</div><button type="button" class="strategy-limit-add" data-add-unavailable-time>＋ 添加不可排时段</button>`:`<div class="strategy-limit-view-list">${rules.length?rules.map(unavailableTimeView).join(''):'<span class="strategy-limit-empty">无</span>'}</div>`}</section>`;
  }
  function syncUnavailableTimeRules(module) {
    const segment=state.draft.courses[module.dataset.course][Number(module.dataset.segment)];
    segment.unavailableTimeRules=[...module.querySelectorAll('[data-unavailable-time-row]')].map(row=>({
      dateFrom:row.querySelector('[data-unavailable-from]').value,
      dateTo:row.querySelector('[data-unavailable-to]').value,
      weekdays:[...row.querySelectorAll('[data-unavailable-weekday]:checked')].map(input=>input.value),
      allDay:row.querySelector('[data-unavailable-mode]').value==='allDay',
      startTime:row.querySelector('[data-unavailable-start]').value,
      endTime:row.querySelector('[data-unavailable-end]').value
    }));
    state.dirty=true;
  }
  const courseDayCapBounds=segment=>{
    if(segment.completion==='排完剩余课程') return {min:1,max:10};
    if(segment.completion==='按课节数排课') {
      const count=Number(segment.lessonCount);
      return {min:1,max:Number.isInteger(count)&&count>0?Math.min(10,count):10};
    }
    const min=Number(segment.frequencyMin),max=Number(segment.frequencyMax);
    return Number.isInteger(min)&&Number.isInteger(max)&&min>=1&&max>=min?{min:1,max:Math.min(10,max)}:null;
  };
  const courseDayCapEnabled=segment=>Boolean(courseDayCapBounds(segment));
  function normalizeCourseDayCap(segment) {
    const bounds=courseDayCapBounds(segment);
    if(bounds) {
      const current=Number(segment.dayCap);
      segment.dayCap=String(Number.isInteger(current)?Math.min(bounds.max,Math.max(bounds.min,current)):bounds.min);
    }
  }
  function courseDayCapField(course,index,segment) {
    const enabled=courseDayCapEnabled(segment);
    const value=enabled?segment.dayCap:'1';
    const bounds=courseDayCapBounds(segment);
    const options=enabled?Array.from({length:bounds.max-bounds.min+1},(_,i)=>String(bounds.min+i)):['1'];
    if(!state.editing) return `<label data-course-day-cap>本课程每日课节上限<input value="${escapeHtml(value)}节" disabled></label>`;
    return `<label data-course-day-cap ${enabled?'':'class="course-day-cap-disabled"'}>本课程每日课节上限<select data-course="${course.id}" data-segment="${index}" data-key="dayCap" ${state.editing&&enabled?'':'disabled'}>${options.map(option=>`<option value="${option}" ${value===option?'selected':''}>${option}节</option>`).join('')}</select></label>`;
  }
  function courseStructure(course) {
    const segments=state.draft.courses[course.id];
    return `<div class="structure-body">${segments.map((s,i)=>`<div class="requirement-strategy-pair"><div class="structured-segment"><div class="structured-segment-head"><strong>策略 ${i+1}</strong>${state.editing?`<button type="button" class="segment-delete-button" data-delete-strategy="${course.id}" data-strategy-index="${i}" ${segments.length===1?'disabled title="至少保留一条策略"':''}>删除策略</button>`:''}</div><div class="rule-grid">${dateRangeField(s.start,s.end,`data-course="${course.id}" data-segment="${i}"`,i===segments.length-1)}${completionField(course,i,s.completion)}${completionSpecificFields(course,i,s)}${timeField(course,i,s)}${courseDayCapField(course,i,s)}</div>${restrictionModule(course,i,s)}</div></div>`).join('')}${state.editing?`<button type="button" class="course-add-strategy" data-add-strategy="${course.id}">＋ 添加策略</button>`:''}</div>`;
  }
  function addCourseStrategy(courseId) {
    const segments=state.draft.courses[courseId];
    const previous=segments.at(-1);
    if(!previous.end) {notify('请先填写当前策略的结束日期，再添加下一条策略');return;}
    const start=utcDate(previous.start),end=utcDate(previous.end);
    if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||end<start) {notify('请先填写有效的策略日期，再添加新策略');return;}
    const next=copyData(previous);
    const originalUnavailable=copyData(previous.unavailableTimeRules||[]);
    if(state.orderEndRule===endRules[0]&&previous.end>=orderDates.end) {
      const span=daysBetween(start,end);
      if(span<2) {notify('当前策略不足两天，请先调整日期再添加');return;}
      const split=isoDate(new Date(start.getTime()+Math.floor(span/2)*DAY));
      previous.end=isoDate(new Date(utcDate(split).getTime()-DAY));
      next.start=split;
      next.end=isoDate(end);
    } else {
      next.start=isoDate(new Date(end.getTime()+DAY));
      next.end='';
    }
    const unavailableInRange=(items,rangeStart,rangeEnd)=>items.flatMap(rule=>{
      if(!rule.dateFrom&&!rule.dateTo) return [rule];
      const from=rule.dateFrom<rangeStart?rangeStart:rule.dateFrom;
      const to=rangeEnd&&rule.dateTo>rangeEnd?rangeEnd:rule.dateTo;
      return from<=to?[{...rule,dateFrom:from,dateTo:to}]:[];
    });
    previous.unavailableTimeRules=unavailableInRange(originalUnavailable,previous.start,previous.end);
    next.unavailableTimeRules=unavailableInRange(originalUnavailable,next.start,next.end);
    segments.push(next);
    state.dirty=true;
    if(educatorStrategyEdit)openTeacherStrategyReview();
    else renderAnalysis();
    notify('已添加策略，请核对日期；最后一条策略的结束日期可留空');
  }
  function deleteCourseStrategy(courseId,index) {
    const segments=state.draft.courses[courseId];
    if(segments.length<=1) {notify('每门课程至少保留一条策略');return;}
    const [removed]=segments.splice(index,1);
    if(index===0) segments[0].start=removed.start;
    else segments[index-1].end=removed.end;
    state.dirty=true;
    if(educatorStrategyEdit)openTeacherStrategyReview();
    else renderAnalysis();
    notify('策略已删除，请核对剩余策略日期');
  }
  function syncFrequencyControl(control) {
    const segment=state.draft.courses[control.dataset.course][Number(control.dataset.segment)];
    segment.frequencyPeriod=control.querySelector('[data-frequency-period]').value;
    segment.frequencyMin=Number(control.querySelector('[data-frequency-min]').value);
    segment.frequencyMax=Number(control.querySelector('[data-frequency-max]').value);
    segment.frequency=formatFrequency(segment);
    normalizeCourseDayCap(segment);
    const course=courses.find(item=>item.id===control.dataset.course);
    control.closest('.structured-segment').querySelector('[data-course-day-cap]').outerHTML=courseDayCapField(course,Number(control.dataset.segment),segment);
    state.dirty=true;
  }
  function syncTimeControl(control) {
    const segment=state.draft.courses[control.dataset.course][Number(control.dataset.segment)];
    segment.timeRules=[...control.querySelectorAll('[data-time-slot-row]')].map(row=>{
      const type=row.querySelector('[data-time-rule-type]').value;
      const allDay=type!=='固定'&&type!=='常规'&&row.querySelector('[data-time-all-day]').value==='allDay';
      const weekdays=[...row.querySelectorAll('[data-time-weekday]:checked')].map(input=>input.value);
      row.querySelector('[data-weekday-summary]').textContent=weekdays.length?weekdays.join('、'):'选择星期';
      row.querySelector('[data-time-rule-details]').hidden=type==='常规';
      row.querySelector('[data-regular-time]').hidden=type!=='常规';
      row.querySelector('[data-time-all-day]').disabled=type==='固定';
      row.querySelector('[data-time-clock-inputs]').hidden=type==='常规'||allDay;
      return {type,weekdays:type==='常规'?[]:weekdays,allDay,start:type==='常规'||allDay?'':row.querySelector('[data-time-start]').value,end:type==='常规'||allDay?'':row.querySelector('[data-time-end]').value};
    });
    segment.time=formatTimeRequirement(segment);
    state.dirty=true;
  }
  function strategyTimezonePill() {
    return `<span class="strategy-timezone-pill"><span aria-hidden="true">◉</span> 上课时区：${escapeHtml(scheduleTimezoneLabel(state.scheduleTimezone))}</span>`;
  }
  function renderAnalysis() {
    if(!state.draft) state.draft=initialDraft();
    if(!state.aiSnapshot) state.aiSnapshot={ global:'学生每周总课节上限和学生每日总课节上限均无特殊要求，多课程采用随机排课。', courses:Object.fromEntries(courses.map(c=>[c.id,c.ai])) };
    const policyOpen=state.editing?' open':'';
    const title=$('#wizardTitle');
    if(educatorTeacherFlow){
      title.textContent='确认选师方式';
      title.closest('.wizard-header').querySelector('.strategy-timezone-pill')?.remove();
      title.parentElement.insertAdjacentHTML('afterend',strategyTimezonePill());
      $('#wizardBody').innerHTML=courses.map(course=>`<section class="content-card educator-method-card"><div class="content-card-header"><div class="course-analysis-title"><strong>${escapeHtml(course.name)}</strong><span class="meta-chip">${course.hours}课时</span><span class="meta-chip">${escapeHtml(course.mode)}</span><span class="meta-chip">${escapeHtml(course.campus)}</span></div>${teacherMethodSwitch(course)}</div>${usesSpecifiedTeacher(course)?`<div class="content-card-inner">${strategyTeacherAssignment(course)}</div>`:''}</section>`).join('');
      $('#wizardFooter').innerHTML=`<button type="button" class="btn" data-close>取消</button><button type="button" class="btn" data-edit-educator-requirements>修改排课要求</button><button type="button" class="btn btn-primary" data-recommend ${hasMissingSpecifiedTeacher()?'disabled':''}>${strategyProceedLabel()}</button>`;
      return;
    }
    title.textContent=state.editing?'编辑排课策略':'确认排课策略';
    title.closest('.wizard-header').querySelector('.strategy-timezone-pill')?.remove();
    title.parentElement.insertAdjacentHTML('afterend',`<span class="strategy-timezone-pill"><span aria-hidden="true">◉</span> 上课时区：${escapeHtml(scheduleTimezoneLabel(state.scheduleTimezone))}</span>`);
    $('#wizardBody').innerHTML=`<section class="content-card analysis-section strategy-global-card"><div class="content-card-header"><strong>全局排课策略</strong>${state.dirty?'<small>已修改 · 待校验</small>':''}</div><div class="content-card-inner"><div class="analysis-card"><p>根据AI分析结果：${escapeHtml(globalAnalysisSummary())}</p></div><details class="structure"${policyOpen}><summary><span>排课策略</span></summary><div class="structure-body">${globalStructure()}</div></details></div></section>
      ${courses.map(c=>`<section class="content-card analysis-section strategy-course-card"><div class="content-card-header"><div class="course-analysis-title"><strong>${c.name}</strong><span class="meta-chip">${c.hours}课时</span><span class="meta-chip">${escapeHtml(c.mode)}</span><span class="meta-chip">${escapeHtml(c.campus)}</span>${courseLessonDurationChips(c)}<span class="meta-chip">${courseLessonTotal(c)}节</span></div></div><div class="content-card-inner"><div class="analysis-card"><p>根据AI分析结果：${escapeHtml(state.aiSnapshot.courses[c.id])}</p></div>${strategyTeacherAssignment(c)}<details class="structure"${policyOpen}><summary><span>排课策略</span></summary>${courseStructure(c)}</details></div></section>`).join('')}`;
    $('#wizardFooter').innerHTML=state.strategyEditFromTeachers?'<button class="btn" data-cancel-strategy-edit>取消</button><button class="btn btn-primary" data-save-rules>校验并保存策略</button>':`<button class="btn" data-strategy-supplement>补充排课要求</button><button class="btn btn-quiet" data-toggle-edit>${state.editing?'退出编辑':'编辑排课策略'}</button>${state.editing?'<button class="btn btn-primary" data-save-rules>校验并保存策略</button>':`<button class="btn btn-primary" data-recommend>${strategyProceedLabel()}</button>`}`;
  }
  function renderCandidate(course,teacher,specified=false,tier=null,knownCoverage=null,sampleApproval=false) {
    const total=lessonChange?state.changeLessons.filter(row=>row[2]===course.id).length:courseLessonTotal(course);
    const requirements=state.draft.courses[course.id];
    const hasFixed=requirements.some(segment=>rulesByType(segment,'固定').length);
    const hasPreferred=requirements.some(segment=>rulesByType(segment,'优先').length);
    const coverage=knownCoverage||teacherCoverageSummary(course,teacher.name);
    const metrics=[`<span><b>${coverage.total}/${total}</b><small>总课节覆盖</small></span>`];
    if(hasFixed) metrics.push(`<span><b>${coverage.fixed}/${total}</b><small>固定时段覆盖</small></span>`);
    else if(hasPreferred) metrics.push(`<span><b>${coverage.preferred}/${total}</b><small>优先时段覆盖</small></span>`);
    else if(!consultPreview) metrics.push(`<span><b>${coverage.total}/${total}</b><small>候选时段覆盖</small></span>`);
    const selected=specified||state.selected[course.id]===teacher.name;
    const status=teacherStatus(teacher.name);
    const lessonStatus=courseStatus(course,teacher.name);
    const statusPair=`<span class="teacher-status-pair" tabindex="0" aria-label="老师排课状态：${escapeHtml(status)}；课程排课状态：${escapeHtml(lessonStatus)}"><span class="teacher-status-tag ready">${escapeHtml(status)}</span><span class="teacher-status-tag warning">${escapeHtml(lessonStatus)}</span><span class="candidate-status-tooltip" role="tooltip"><span><i class="status-legend-dot teacher-dot" aria-hidden="true"></i>老师排课状态：${escapeHtml(status)}</span><span><i class="status-legend-dot course-dot" aria-hidden="true"></i>课程排课状态：${escapeHtml(lessonStatus)}</span></span></span>`;
    const matchedTier=tier||teacherPriorityRuleFor(course)?.tiers.find(row=>teacherMatchesPriorityTier(teacher.name,row));
    const approvalText=matchedTier?.approvalRequired&&matchedTier.approvalText?matchedTier.approvalText:sampleApproval?'【示例】推荐该老师需先由所属教学部门负责人审批':'';
    const approvalTag=approvalText?`<span class="org-approval-icon" tabindex="0" aria-label="审批提示：${escapeHtml(approvalText)}"><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 2.5 18 17H2zM10 7.5v4.8M10 14.7v.2"/></svg><span class="org-approval-tooltip" role="tooltip">${escapeHtml(approvalText)}</span></span>`:'';
    const approvalNote=approvalText?`<div class="candidate-approval-note"><span aria-hidden="true">●</span>${escapeHtml(approvalText)}</div>`:'';
    const action=specified?`<button class="btn choose-teacher" type="button" disabled>${consultPreview?'已确定方案':'✓ 已指定为本课程老师'}</button>`:`<button class="btn ${selected?'choose-teacher':'btn-quiet choose-teacher'}" data-select-candidate="${course.id}" data-teacher="${escapeHtml(teacher.name)}" aria-pressed="${selected}">${consultPreview?'选择该方案':selected?'✓ 已选为本课程老师':'选择该老师'}</button>`;
    return `<article class="candidate ${selected?'selected':''} ${specified?'specified-candidate':''}" data-scheduling-status="${escapeHtml(lessonStatus)}"><div class="candidate-title"><div class="candidate-name-row"><strong>${escapeHtml(teacher.name)}</strong>${statusPair}</div><button type="button" class="teacher-load-button" data-view-teacher-load="${escapeHtml(teacher.name)}">${consultPreview?'查看教师信息':'查看'}</button></div><div class="teacher-department">${escapeHtml(teacherDepartmentFor(teacher.name))}</div>${approvalNote}<div class="candidate-metrics" style="--metric-count:${metrics.length}">${metrics.join('')}</div><div class="candidate-action">${action}${approvalTag}</div></article>`;
  }
  function renderRecommendedCandidates(course,result,pinnedTeacher='',showSampleApproval=false) {
    const currentName=consultPreview||educatorTeacherFlow?'':course.history.find(([,relation])=>relation==='当前')?.[0]||'';
    const candidates=result.groups.flatMap(group=>group.ranked.map(item=>({teacher:item.teacher,tier:group.tier,coverage:item.coverage})))
      .filter(item=>item.teacher.name!==pinnedTeacher&&item.teacher.name!==currentName);
    const recommended=candidates.map((item,index)=>renderCandidate(course,item.teacher,false,item.tier,item.coverage,showSampleApproval&&index===0)).join('');
    const empty='<div class="empty-teacher">暂无推荐老师。可修改老师要求后重新推荐。</div>';
    const specified=pinnedTeacher?renderCandidate(course,{name:pinnedTeacher},true):'';
    if(educatorTeacherFlow)return recommended?`<div class="candidate-grid">${recommended}</div>`:empty;
    if(consultPreview)return specified||recommended?`<div class="candidate-grid">${specified}${recommended}</div>`:empty;
    const current=currentName
      ? `<div class="candidate-grid">${pinnedTeacher===currentName?specified:renderCandidate(course,{name:currentName})}</div>`
      : '<p class="teacher-group-empty">暂无当前授课老师</p>';
    return `<div class="teacher-candidate-group"><h3>当前授课老师</h3>${current}</div>
      ${specified&&pinnedTeacher!==currentName?`<div class="teacher-candidate-group"><h3>指定排课老师</h3><div class="candidate-grid">${specified}</div></div>`:''}
      ${pinnedTeacher?'':`<div class="teacher-candidate-group"><h3>系统推荐老师</h3>${recommended?`<div class="candidate-grid">${recommended}</div>`:empty}</div>`}`;
  }
  function renderTeachers() {
    const selectedCount=courses.filter(c=>state.direct[c.id]||state.selected[c.id]).length;
    const displayedCourses=educatorTeacherFlow?courses.filter(course=>!state.direct[course.id]):courses;
    const editing=state.editingTeacherRequirements;
    const title=$('#wizardTitle');
    title.textContent=editing?'修改老师要求':consultPreview?'确认售前咨单方案':'选择排课老师';
    title.closest('.wizard-header').querySelector('.strategy-timezone-pill')?.remove();
    $('#viewTeacherStrategy').hidden=consultPreview||editing;
    if(educatorTeacherFlow)$('#viewFlowRequirements').hidden=editing;
    if(consultPreview||educatorTeacherFlow)title.parentElement.insertAdjacentHTML('afterend',strategyTimezonePill());
    $('#wizardBody').classList.toggle('teacher-requirements-editing',editing);
    const recommendations=editing?{}:preparedTeacherRecommendations||Object.fromEntries(courses.map(course=>[course.id,recommendTeachersForCourse(course)]));
    preparedTeacherRecommendations=null;
    const hasActualApproval=Object.values(recommendations).some(result=>result.groups.some(group=>group.tier?.approvalRequired&&group.tier.approvalText&&group.ranked.length));
    let sampleApprovalShown=false;
    $('#wizardBody').innerHTML=`${consultPreview&&!editing?'':`<div class="teacher-selection-count"><span class="selection-summary">${editing?'正在修改老师要求，保存后重新显示推荐结果':`已选择：${selectedCount}/${courses.length}门`}</span></div>`}
      ${displayedCourses.map(c=>{
        const direct=state.direct[c.id],expanded=state.expandedPlanCourseId===c.id,showRequirement=editing||state.expandedTeacherRequirementIds.has(c.id);
        const teacherPanel=editing?'':renderRecommendedCandidates(c,recommendations[c.id],direct,!hasActualApproval&&!sampleApprovalShown);
        if(teacherPanel.includes('【示例】'))sampleApprovalShown=true;
        const planPanel=editing||consultPreview||!expanded?'':`<div class="teacher-plan-shell"><div class="teacher-course-plan" id="course-plan-${c.id}">${coursePlanList(c.id)}</div></div>`;
        const requirementToggle=editing?'':`<button class="teacher-requirement-toggle" type="button" data-toggle-teacher-requirements="${c.id}" aria-controls="teacher-requirement-${c.id}" aria-expanded="${showRequirement}">${showRequirement?'收起老师要求':'查看老师要求'}</button>`;
        const planToggle=editing||consultPreview?'':`<button class="teacher-requirement-toggle" type="button" data-view-course-plan="${c.id}" aria-controls="course-plan-${c.id}" aria-expanded="${expanded}">${expanded?'收起学生排课计划':'查看学生排课计划'}</button>`;
        return `<section class="content-card teacher-course-card"><div class="content-card-header"><div class="course-analysis-title"><strong>${escapeHtml(c.name)}</strong><span class="meta-chip">${c.hours}课时</span><span class="meta-chip">${escapeHtml(c.mode)}</span><span class="meta-chip">${escapeHtml(c.campus)}</span>${courseLessonDurationChips(c)}<span class="meta-chip">${courseLessonTotal(c)}节</span></div><div class="teacher-direct-course-actions">${requirementToggle}${planToggle}</div></div>${teacherRequirementFields(c,showRequirement)}${planPanel}${teacherPanel?`<div class="content-card-inner teacher-candidates">${teacherPanel}</div>`:''}</section>`;
      }).join('')}`;
    $('#wizardFooter').innerHTML=state.editingTeacherRequirements?'<button class="btn" data-cancel-teacher-requirements>取消修改</button><button class="btn btn-primary" data-save-teacher-requirements>保存并重新推荐老师</button>':`${consultPreview?(selectedCount<courses.length?'<button class="btn" data-transfer-consult>无合适方案，转教务</button>':''):'<button class="btn" data-edit-strategy-from-teachers>修改排课策略</button>'}<button class="btn" data-edit-teacher-requirements>修改老师要求</button><button class="btn btn-primary" data-generate ${selectedCount<courses.length?'disabled':''}>${consultPreview?'确认方案并生成预排课表':renewalPreview?'生成预排课表':'生成正式排课'}</button>`;
  }
  function renderTeacherLoad() {
    const overlay=$('#teacherLoadBackdrop');
    const teacherIndex=Math.max(0,[...new Set(courses.flatMap(course=>course.candidates.map(candidate=>candidate.name)))].indexOf(teacherLoadView.name));
    const profile=teacherProfiles[teacherLoadView.name];
    const yearOffset=teacherLoadView.year-2026;
    const values=teacherLoadExample.map(([booked,limit],index)=>{
      const adjusted=Math.max(0,booked+teacherIndex*2.5+yearOffset*(index+3));
      return `${Number.isInteger(adjusted)?adjusted.toFixed(1):adjusted.toString()} / ${limit}`;
    });
    const employeeId=teacherLoadView.name.match(/\(([^)]+)\)$/)?.[1]||'--';
    const subjects=courses.filter(course=>course.candidates.some(candidate=>candidate.name===teacherLoadView.name)||course.history.some(item=>item[0]===teacherLoadView.name)).map(course=>course.name);
    const styleTags=(profile?.styles||[]).map(style=>`<span class="teacher-profile-style">${escapeHtml(style)}</span>`).join('');
    const detailHeaders=['工号','教师级别','教师性别','教师类型','所属校区','所属部门','授课科目','排课状态','授课方式','课时负载','授课风格','备注','排课标签'];
    const detailCells=[
      `<span class="teacher-profile-id">${escapeHtml(employeeId)}</span>`,
      escapeHtml(profile?.level||'--'),
      escapeHtml(profile?.gender?.replace('老师','')||'--'),
      escapeHtml(profile?.position||'--'),
      escapeHtml(profile?.campuses?.join('、')||'--'),
      escapeHtml(teacherDepartmentFor(teacherLoadView.name)),
      `${subjects.length?subjects.map(subject=>`<div>${escapeHtml(subject)}</div>`).join(''):'--'}${subjects.length?`<small>共 ${subjects.length} 门</small>`:''}`,
      escapeHtml(teacherStatus(teacherLoadView.name)),
      escapeHtml(profile?.modes?.filter(mode=>mode==='线上'||mode==='线下').join('/')||'--'),
      escapeHtml(values[9]),
      styleTags||'--',
      '--',
      `<button type="button" class="teacher-profile-tag-link" data-toggle-teacher-tags aria-expanded="${teacherLoadView.showTags}">查看标签</button>`
    ];
    const qualificationTags=profile?[profile.trial?'可带试听':'不可试听',profile.diagnosis?'可带诊断':'不可带诊断',profile.selfOrganized?'可带自组班':'不可带自组班',...profile.studentLevels]:[];
    overlay.innerHTML=`<section class="teacher-load-dialog" role="dialog" aria-modal="true" aria-labelledby="teacherLoadTitle"><header><strong id="teacherLoadTitle">教师信息</strong><button type="button" class="teacher-load-close" data-close-teacher-load aria-label="关闭">×</button></header><div class="teacher-load-body"><div class="teacher-profile-scroll"><table class="teacher-profile-table"><thead><tr>${detailHeaders.map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody><tr>${detailCells.map(value=>`<td>${value}</td>`).join('')}</tr></tbody></table></div>${teacherLoadView.showTags?`<div class="teacher-profile-tags"><strong>排课标签</strong>${qualificationTags.length?qualificationTags.map(tag=>`<span>${escapeHtml(tag)}</span>`).join(''):'暂无标签'}</div>`:''}<div class="teacher-load-year"><button type="button" data-teacher-load-year="-1" aria-label="上一年">◀</button><strong>${teacherLoadView.year}</strong><button type="button" data-teacher-load-year="1" aria-label="下一年">▶</button></div><div class="teacher-load-scroll"><table><thead><tr><th>月份</th>${Array.from({length:12},(_,index)=>`<th>${index+1}月</th>`).join('')}</tr></thead><tbody><tr><th>已排课量/课量上限</th>${values.map(value=>`<td>${value}</td>`).join('')}</tr></tbody></table></div></div><footer><button type="button" class="btn" data-close-teacher-load>关闭</button></footer></section>`;
    overlay.hidden=false;
  }
  function openTeacherLoad(name) {teacherLoadView.name=name;teacherLoadView.year=2026;teacherLoadView.showTags=false;renderTeacherLoad();}
  function closeTeacherLoad() {const overlay=$('#teacherLoadBackdrop');overlay.hidden=true;overlay.innerHTML='';}
  function validateDraft() {
    const global=state.draft.global;
    const validLimit=value=>value==='无特殊要求'||Number.isInteger(Number(value))&&Number(value)>=1&&Number(value)<=10;
    if(!orderDates.start) return '请选择排课单开课日期';
    if(state.orderEndRule===endRules[0]&&(!orderDates.end||orderDates.end<orderDates.start)) return '结课日期不能为空，且不能早于开课日期';
    if(!validScheduleTimezone(state.scheduleTimezone)) return '请选择有效的上课时区（例如 Europe/London）';
    if(!validLimit(global.weekCap)||!validLimit(global.dayCap)) return '学生总课节上限无效';
    if(!['随机排课','交叉排课'].includes(global.method)) return '多课程排课方式无效';
    if(!endRules.includes(state.orderEndRule)) return '结课日期选项无效';
    for(const course of courses) {
      const duration=Number(state.draft.courseLessonHours?.[course.id]);
      if(!Number.isFinite(duration)||duration<=0||Math.abs(duration*4-Math.round(duration*4))>1e-9) return `${course.name}的课节时长必须为大于0的0.25课时倍数`;
      if(!Number.isFinite(course.hours)||course.hours<=0||Math.abs(course.hours*4-Math.round(course.hours*4))>1e-9) return `${course.name}的课程总课时必须为0.25课时的倍数`;
    }
    for(const c of courses) for(let i=0;i<state.draft.courses[c.id].length;i++) {
      const s=state.draft.courses[c.id][i];
      const lastStrategy=i===state.draft.courses[c.id].length-1;
      const effectiveStart=s.start;
      const effectiveEnd=s.end;
      if(!effectiveStart) return `${c.name}策略${i+1}请选择排课开始日期`;
      if(!lastStrategy&&!s.end) return `${c.name}策略${i+1}请选择排课结束日期；只有最后一条策略可留空`;
      if(lastStrategy&&state.orderEndRule===endRules[0]&&s.completion!=='排完剩余课程'&&!s.end) return `${c.name}策略${i+1}请填写排课单日期范围内的结束日期`;
      if(effectiveEnd&&effectiveStart>effectiveEnd) return `${c.name}策略${i+1}的排课结束日期不能早于开始日期`;
      if(i>0&&effectiveStart<=state.draft.courses[c.id][i-1].end) return `${c.name}排课要求${i}与${i+1}的日期不能重叠`;
      if(!s.time?.trim()) return `${c.name}排课要求${i+1}的上课时段未填写`;
      if(s.completion==='按频次排课') {
        if(!frequencyPeriods[s.frequencyPeriod]) return `${c.name}排课要求${i+1}的上课周期无效`;
        if(!Number.isInteger(s.frequencyMin)||!Number.isInteger(s.frequencyMax)||s.frequencyMin<1||s.frequencyMax<s.frequencyMin) return `${c.name}排课要求${i+1}的频次范围无效`;
      } else if(s.completion==='按课节数排课') {
        if(!/^\d+$/.test(String(s.lessonCount))||!Number.isSafeInteger(Number(s.lessonCount))||Number(s.lessonCount)<1||Number(s.lessonCount)>courseLessonTotal(c)) return `${c.name}排课要求${i+1}的课节数应为1至${courseLessonTotal(c)}的整数`;
      } else if(s.completion!=='排完剩余课程') return `${c.name}排课要求${i+1}的排课类型无效`;
      const weekCap=s.weekCap||'无特殊要求';
      if(s.completion!=='按频次排课'&&weekCap!=='无特殊要求'&&(!Number.isInteger(Number(weekCap))||Number(weekCap)<1||Number(weekCap)>10)) return `${c.name}排课要求${i+1}的本课程每周课节上限无效`;
      const dayBounds=courseDayCapBounds(s);
      if(!dayBounds||!Number.isInteger(Number(s.dayCap))||Number(s.dayCap)<dayBounds.min||Number(s.dayCap)>dayBounds.max) return `${c.name}排课要求${i+1}的本课程每日课节上限无效`;
      if(!timeRulesOf(s).length) return `${c.name}策略${i+1}请至少添加一个上课时段`;
      if(timeRulesOf(s).some(rule=>!['固定','优先','仅限','常规'].includes(rule.type))) return `${c.name}策略${i+1}的时段类型无效`;
      if(timeRulesOf(s).some(rule=>rule.type!=='常规'&&(!rule.weekdays.length||rule.weekdays.some(day=>!weekdayLabels.includes(day))||(rule.allDay&&rule.type==='固定')||(!rule.allDay&&(!/^\d{2}:\d{2}$/.test(rule.start)||!/^\d{2}:\d{2}$/.test(rule.end)||minutes(rule.start)>=minutes(rule.end)))))) return `${c.name}策略${i+1}的星期或时段无效`;
      const onlyRules=rulesByType(s,'仅限');
      if(onlyRules.length) for(const rule of timeRulesOf(s).filter(item=>item.type==='固定'||item.type==='优先')) {
        if(!rule.weekdays.every(day=>onlyRules.some(allowed=>allowed.weekdays.includes(day)&&(allowed.allDay||!rule.allDay&&minutes(allowed.start)<=minutes(rule.start)&&minutes(rule.end)<=minutes(allowed.end))))) return `${c.name}策略${i+1}的${rule.type}时段不在仅限时段内，请调整冲突要求`;
      }
      for(const rule of s.unavailableTimeRules||[]) {
        if(Boolean(rule.dateFrom)!==Boolean(rule.dateTo)) return `${c.name}策略${i+1}的不可排日期范围须同时填写开始和结束日期，或均留空`;
        if(rule.dateFrom&&(rule.dateFrom>rule.dateTo||rule.dateFrom<effectiveStart||(effectiveEnd&&rule.dateTo>effectiveEnd))) return `${c.name}策略${i+1}的不可排日期须在本策略日期范围内`;
        if(!Array.isArray(rule.weekdays)||rule.weekdays.some(day=>!weekdayLabels.includes(day))) return `${c.name}策略${i+1}的不可排星期无效`;
        if(typeof rule.allDay!=='boolean') return `${c.name}策略${i+1}的不可排时段类型无效`;
        if(!rule.allDay&&(!/^\d{2}:\d{2}$/.test(rule.startTime)||!/^\d{2}:\d{2}$/.test(rule.endTime)||minutes(rule.startTime)>=minutes(rule.endTime))) return `${c.name}策略${i+1}的不可排具体时段无效`;
      }
      if(s.completion==='按频次排课'&&rulesByType(s,'固定').length) {
        const fixedValidationEnd=utcDate(effectiveEnd||previewEnd(effectiveStart));
        for(let cursor=utcDate(effectiveStart);cursor<=fixedValidationEnd;) {
          const [,periodEnd]=periodBounds(cursor,s.frequencyPeriod,effectiveStart);
          const sliceEnd=periodEnd<fixedValidationEnd?periodEnd:fixedValidationEnd;
          const fixedSlots=fixedRuleCapacity(s,cursor,sliceEnd,false);
          const availableFixedSlots=fixedRuleCapacity(s,cursor,sliceEnd,true);
          if(availableFixedSlots<Math.min(s.frequencyMin,fixedSlots)) return `${c.name}策略${i+1}在 ${dateLabel(isoDate(cursor))}—${dateLabel(isoDate(sliceEnd))} 的固定时段与不可排时段冲突，无法满足频次下限`;
          cursor=new Date(sliceEnd.getTime()+DAY);
        }
      }
    }
    return '';
  }
  function generateCoursePlans() {
    const plans=Object.fromEntries(courses.map(course=>[course.id,strategyPlan(course)]));
    state.coursePlans=plans;
    state.expandedPlanCourseId=null;
    return '';
  }
  function selectedTeacher(course) { return state.direct[course.id]||state.selected[course.id]||'未选择'; }
  function generateStrategyLessons() {
    generateCoursePlans();
    const lockedSlots=selectedLockedSlots();
    const fixedSlots=new Map();
    const candidates=courses.flatMap(course=>{
      const requirements=effectiveCourseRequirements(course);
      const duration=Math.round(courseLessonHours(course)*60);
      const teacher=selectedTeacher(course);
      if(teacher==='未选择'||duration<=0)return [];
      return state.coursePlans[course.id].rows.flatMap(period=>{
        const slots=[];
        const requirement=requirements[period.index];
        const rollingEnd=period.end||previewEnd(period.start);
        const start=orderDates.start&&orderDates.start>period.start?orderDates.start:period.start;
        const finish=state.orderEndRule===endRules[0]&&orderDates.end&&orderDates.end<rollingEnd?orderDates.end:rollingEnd;
        const end=utcDate(finish).getTime();
        const fixed=rulesByType(requirement,'固定');
        for(let time=utcDate(start).getTime();time<=end;time+=DAY){
          const date=new Date(time),day=isoDate(date);
          const weekday=weekdayLabels[(date.getUTCDay()+6)%7];
          if(!isStoppedDay(day,requirement))for(const rule of fixed){
            if(!rule.weekdays.includes(weekday))continue;
            const reserved={courseId:course.id,from:minutes(rule.start),to:minutes(rule.end)};
            if(!fixedSlots.has(day))fixedSlots.set(day,[]);
            fixedSlots.get(day).push(reserved);
          }
          if(period.max>0)slots.push(...eligibleSlots(requirement,date,duration,teacher));
        }
        const reserved=lockedSlots.filter(lock=>lock.courseId===course.id&&lock.date>=start&&lock.date<=finish)
          .flatMap(lock=>{
            const [from,to]=lock.time.split('-').map(minutes);
            return isBlockedSlot(lock.date,from,to,requirement)?[]:[{day:lock.date,from,to,priority:-1}];
          });
        if(reserved.length)period.max=Math.min(period.requiredMax,period.max+reserved.length);
        slots.push(...reserved);
        return slots.map(slot=>({...slot,course,period,requirement}));
      });
    }).filter(slot=>slot.priority<=0||!(fixedSlots.get(slot.day)||[]).some(reserved=>
      reserved.courseId!==slot.course.id&&slot.from<reserved.to&&reserved.from<slot.to));
    const remainingChoices=new Map();
    for(const slot of candidates)remainingChoices.set(slot.period,(remainingChoices.get(slot.period)||0)+1);
    const chronological=(a,b)=>a.day.localeCompare(b.day)||a.from-b.from;
    const fixedFirst=(a,b)=>Number(a.priority>=0)-Number(b.priority>=0)||Number(a.priority>0)-Number(b.priority>0);
    const distinct=[
      (a,b)=>a.priority-b.priority||chronological(a,b),
      (a,b)=>fixedFirst(a,b)||remainingChoices.get(a.period)-remainingChoices.get(b.period)||a.priority-b.priority||chronological(a,b),
      (a,b)=>fixedFirst(a,b)||chronological(a,b)||a.priority-b.priority
    ];
    const periodMinimums=courses.flatMap(course=>state.coursePlans[course.id].rows);
    let best;
    for(const compare of distinct){
      const ordered=[...candidates].sort(compare);
      const result=placeStrategyLessons(ordered,periodMinimums);
      if(!best){best=result;continue;}
      const different=result.score.findIndex((value,index)=>value!==best.score[index]);
      if(different!==-1&&result.score[different]>best.score[different])best=result;
    }
    return best.lessons.sort(chronological).map(slot=>[slot.day,slotText(slot.from,slot.to),slot.course.id]);
  }

  function placeStrategyLessons(candidates,periodMinimums) {
    const lessons=[];
    const occupied=new Map();
    const counts=new Map();
    for(const slot of candidates){
      const {day,from,to,course,period,requirement}=slot;
      const [weekStart]=periodBounds(utcDate(day),'week',requirement.start);
      const week=isoDate(weekStart);
      const limits=[
        [period,period.max],
        [`${course.id}:${day}`,Number(requirement.dayCap)||1],
        [`${course.id}:${week}`,Number(requirement.weekCap)||Infinity],
        [`day:${day}`,Number(state.draft.global.dayCap)||Infinity],
        [`week:${week}`,Number(state.draft.global.weekCap)||Infinity]
      ];
      const courseMinutes=(counts.get(course.id)||0)+to-from;
      if(courseMinutes>course.hours*60||limits.some(([key,max])=>(counts.get(key)||0)>=max))continue;
      const times=occupied.get(day)||[];
      if(times.some(slot=>from<slot.to&&to>slot.from))continue;
      occupied.set(day,[...times,{from,to}]);
      counts.set(course.id,courseMinutes);
      for(const [key] of limits)counts.set(key,(counts.get(key)||0)+1);
      lessons.push(slot);
    }
    const metMinimums=periodMinimums.reduce((sum,row)=>sum+Math.min(row.min||0,counts.get(row)||0),0);
    const ordered=[...lessons].sort((a,b)=>a.day.localeCompare(b.day)||a.from-b.from);
    const alternations=state.draft.global.method==='交叉排课'
      ?ordered.filter((slot,index)=>index&&slot.course.id!==ordered[index-1].course.id).length:0;
    return {lessons,score:[lessons.filter(slot=>slot.priority<0).length,lessons.length,lessons.filter(slot=>slot.priority===0).length,metMinimums,alternations,lessons.filter(slot=>slot.priority===1).length]};
  }

  function generateSchedule() {
    const description=lessonChange?'按已确认的变更要求生成课节…':'根据已选老师、学生可排时段和排课策略生成课节…';
    setLoading('正在生成排课方案',description,()=>{
      activeSlotLocks=window.studentSlotLocks.active();
      const lockError=validateLockedSlots();
      if(lockError){openWizard(1);notify(lockError);return;}
      const planned=lockedSlotModes.size?generateStrategyLessons():null;
      if(planned&&selectedLockedSlots().some(lock=>!planned.some(row=>row[0]===lock.date&&row[1]===lock.time&&row[2]===lock.courseId))){
        openWizard(1);
        notify('部分锁定时段无法纳入本次排课，请调整所选时段或改用新的排课要求。');
        return;
      }
      renderResult(false,false,planned);
      if(renewalPreview)notifyHomeroomSupplement('homeroom-renewal-ready',{snapshot:resultSnapshot()});
      else if(homeroomSupplement)notifyHomeroomSupplement('homeroom-supplement-ready',{
        start:orderDates.start,
        end:state.orderEndRule===endRules[0]?orderDates.end:'',
        endMode:state.orderEndRule===endRules[0]?'SPECIFIED_DATE':'FINISH_ALL',
        timezone:state.scheduleTimezone,text:state.supplement.trim(),files:[...state.files],
        specifiedTeachers:{...state.direct},selectedTeachers:{...state.selected},
        lockedSlots:selectedLockedSlots()
      });
    });
  }
  function renderCompletedPlan() {
    const lessons=state.resultLessons;
    const courseResults=courses.map((course,courseIndex)=>{
      const total=courseLessonTotal(course);
      const courseLessons=lessons.filter(item=>item[2]===course.id);
      const actualTotal=courseLessons.length;
      const totalMet=actualTotal===total;
      const completionDay=totalMet?[...courseLessons].sort((a,b)=>a[0].localeCompare(b[0]))[total-1]?.[0]:null;
      const plan=state.coursePlans?.[course.id]||strategyPlan(course);
      const expectedByRow=new Map(teacherExpectedRows(course,selectedTeacher(course),plan).map(item=>[item.row,item]));
      const requirementCards=effectiveCourseRequirements(course).map((requirement,index)=>{
        if(completionDay&&completionDay<requirement.start) return '';
        const actualInRequirement=courseLessons.filter(item=>requirement.start<=item[0]&&(!requirement.end||item[0]<=requirement.end)).length;
        const evaluatedRows=plan.rows.filter(row=>row.index===index&&(!completionDay||row.start<=completionDay)).map(row=>{
          const actual=courseLessons.filter(item=>row.start<=item[0]&&(!row.end||item[0]<=row.end)).length;
          const cumulative=row.rolling?actualTotal:courseLessons.filter(item=>item[0]<=row.end).length;
          const finishedInPeriod=Boolean(completionDay&&row.start<=completionDay&&(!row.end||completionDay<=row.end));
          const met=row.finish?cumulative===total:actual>=row.requiredMin&&actual<=row.requiredMax||Boolean(finishedInPeriod);
          const expected=expectedByRow.get(row);
          const expectedRange=row.rolling?`0—${expected.covered} 节（近8周）`:row.finish?`0—${expected.covered} 节`:lessonRange(expected.expectedMin,expected.expectedMax);
          const periodGap=finishedInPeriod?0:row.finish?Math.max(0,total-cumulative):Math.abs(actual-row.requiredMin);
          return {actual,met,html:`<tr><td>${periodDate(row)}</td><td>${periodRequirement(row)}</td><td><strong>${expectedRange}</strong></td><td>${actual} 节</td><td class="${periodGap?'period-gap':''}">${periodGap} 节</td><td><span class="result-status ${met?'met':'unmet'}">${met?'完成':'未完成'}</span></td></tr>`};
        });
        const accounted=evaluatedRows.reduce((sum,row)=>sum+row.actual,0);
        const completedBefore=courseLessons.filter(item=>item[0]<requirement.start).length===total;
        const requirementMet=(evaluatedRows.length?evaluatedRows.every(row=>row.met):completedBefore)&&accounted===actualInRequirement;
        const periodRows=evaluatedRows.map(row=>row.html).join('');
        return `<details class="result-requirement" ${courseIndex===0&&index<2?'open':''}><summary class="result-requirement-head"><strong>排课计划 ${index+1}</strong><span>${requirement.end?`${dateLabel(requirement.start)}—${dateLabel(requirement.end)}`:`${dateLabel(requirement.start)} 起 · 排完全部课时结束`}</span><em class="result-status ${requirementMet?'met':'unmet'}">${requirementMet?'完成':'未完成'} 已排${actualInRequirement}节</em></summary>${planRuleLine(requirement,true)}${periodRows?`<div class="result-table-scroll"><table class="result-period-table"><thead><tr><th>排课日期</th><th>学生排课要求</th><th>本周期预计排课</th><th>本周期实际排课</th><th>本周期排课差额</th><th>完成状态</th></tr></thead><tbody>${periodRows}</tbody></table></div>`:'<div class="result-empty-period">本段暂无周期排课结果</div>'}</details>`;
      }).join('');
      const totalLabel=totalMet?'已完成':actualTotal<total?'未完成':'超出';
      const totalGap=Math.max(0,total-actualTotal);
      return `<section class="content-card result-course-card"><div class="content-card-header"><div class="course-analysis-title"><strong>${escapeHtml(course.name)}</strong><span class="meta-chip">授课老师：${escapeHtml(selectedTeacher(course))}</span></div><span class="result-status ${totalMet?'met':'unmet'}">${totalLabel} 已排${actualTotal}/${total}节${totalGap?` · 待补${totalGap}节`:''}</span></div><div class="content-card-inner">${requirementCards}</div></section>`;
    }).join('');
    $('#wizardTitle').parentElement.insertAdjacentHTML('afterend',`<span class="strategy-timezone-pill"><span aria-hidden="true">◉</span> 上课时区：${escapeHtml(scheduleTimezoneLabel(state.scheduleTimezone))}</span>`);
    $('#wizardBody').innerHTML=courseResults;
    $('#wizardFooter').innerHTML='<button class="btn" data-restart-plan>重新排课</button><button class="btn btn-primary" data-close>关闭</button>';
  }
  function resultSnapshot() {
    return copyData({draft:state.draft,orderDates,orderEndRule:state.orderEndRule,scheduleTimezone:state.scheduleTimezone,selected:state.selected,direct:state.direct,teacherRequirements:state.teacherRequirements,resultLessons:state.resultLessons,supplement:state.supplement,files:state.files,aiSnapshot:state.aiSnapshot,planMode:state.planMode,createdAt:state.currentPlanCreatedAt});
  }
  function restoreResultSnapshot(snapshot) {
    Object.assign(orderDates,defaultOrderDates,snapshot.orderDates||{});
    state.draft=normalizeDraft(snapshot.draft);
    state.orderEndRule=normalizeOrderEndRule(snapshot.orderEndRule||(
      Object.values(snapshot.courseBoundaries||{}).some(boundary=>boundary.endMode==='排完全部课时结束')?endRules[1]:endRules[0]
    ));
    state.scheduleTimezone=snapshot.scheduleTimezone||'Asia/Shanghai';
    if(snapshot.courseBoundaries&&!snapshot.orderEndRule) for(const course of courses) {
      const oldBoundary=snapshot.courseBoundaries[course.id];
      const segments=state.draft.courses[course.id];
      if(!oldBoundary||!segments?.length) continue;
      if(oldBoundary.start) segments[0].start=oldBoundary.start;
      if(oldBoundary.endMode==='排完全部课时结束') segments.at(-1).end='';
      else if(!segments.at(-1).end&&oldBoundary.end) segments.at(-1).end=oldBoundary.end;
    }
    state.coursePlans=null;
    state.expandedPlanCourseId=null;
    state.selected=copyData(snapshot.selected||{});
    state.direct=copyData(snapshot.direct||{});
    state.teacherRequirements=Object.fromEntries(courses.map(course=>[course.id,normalizeTeacherRequirement(course,snapshot.teacherRequirements?.[course.id])]));
    state.editingTeacherRequirements=false;
    state.teacherRequirementDrafts=null;
    state.resultLessons=copyData(snapshot.resultLessons);
    state.selectedResultLessons.clear();
    state.newPlacedLessons.clear();
    state.pickedSlots.clear();
    state.supplement=snapshot.supplement||'';
    state.files=copyData(snapshot.files||[]);
    state.aiSnapshot=copyData(snapshot.aiSnapshot||null);
    state.planMode=snapshot.planMode||'智能排课';
    state.currentPlanCreatedAt=snapshot.createdAt||null;
    state.editing=false;
    state.dirty=false;
    state.completed=true;
  }
  function versionName(now) {
    const pad=value=>String(value).padStart(2,'0');
    return `${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  function createResultVersion(remark='') {
    const base=versionName(new Date());
    if(!state.currentPlanCreatedAt) state.currentPlanCreatedAt=base;
    const sameSecond=state.versions.filter(item=>item.name===base||item.name.startsWith(`${base}（`)).length;
    const name=sameSecond?`${base}（${sameSecond+1}）`:base;
    const planNo=Math.max(0,...state.versions.map(item=>Number(item.planNo)||0))+1;
    const version={id:`${Date.now()}-${state.versions.length}`,name,planNo,kind:state.planMode,createdAt:state.currentPlanCreatedAt,savedAt:base,remark,snapshot:resultSnapshot()};
    state.versions.unshift(version);
    const persisted=persistVersions(state.versions);
    return {version,persisted};
  }
  function saveCurrentResultVersion(remark='') {
    const active=state.versions.find(item=>item.id===state.activeVersionId);
    if(active&&JSON.stringify(active.snapshot)===JSON.stringify(resultSnapshot())) {
      active.savedAt=versionName(new Date());
      active.remark=remark;
      state.pendingPlanVersionId=active.id;
      return {version:active,persisted:persistVersions(state.versions),created:false};
    }
    if(active) state.currentPlanCreatedAt=versionName(new Date());
    const saved=createResultVersion(remark);
    state.activeVersionId=saved.version.id;
    state.pendingPlanVersionId=saved.version.id;
    return {...saved,created:true};
  }
  const formalLessonKey=item=>`${item[0]}|${item[1]}|${item[2]}`;
  const slotSeed=key=>{let hash=0;for(let i=0;i<key.length;i++) hash=(hash*31+key.charCodeAt(i))>>>0;return hash;};
  function slotStatus(date,time,course) {
    const key=formalLessonKey([date,time,course.id]);
    if(state.newPlacedLessons.has(key)) return {cls:'is-new',label:`<span>${escapeHtml(course.name)}</span>`,tip:'新排（点击可撤销）',clickable:true};
    if(state.resultLessons.some(row=>row[0]===date&&row[1]===time&&row[2]===course.id)) return {cls:'is-teacher',label:`<span>${escapeHtml(course.name)}</span>`,tip:'老师有课',clickable:false};
    if(slotIsHeld(selectedTeacher(course),date,time))return {cls:'is-unavailable',label:'已锁定',tip:'授课老师时段已锁定',clickable:false};
    if(state.pickedSlots.has(key)) return {cls:'is-selected',label:'',tip:'已选择（再次点击取消）',clickable:true};
    const seed=slotSeed(`${key}|${selectedTeacher(course)}`);
    const mode=course.mode==='线上'?'线上':'线下线上';
    const bucket=seed%100;
    if(bucket<10) return {cls:'is-rest',label:`-90min/${mode}`,tip:'老师休假',clickable:false};
    if(bucket<26) return {cls:'is-student',label:`90min/${mode}`,tip:'学生有课',clickable:false};
    if(bucket<34) return {cls:'is-shared',label:'0min/线下教室',tip:'老师&学生都有课',clickable:false};
    if(bucket<46) return {cls:'is-unavailable',label:'30min',tip:'不可排（未到排课时间）',clickable:false};
    return {cls:'is-available',label:'',tip:'可排，点击选择该时段',clickable:true};
  }
  function applySlotCell(cell,date,time,course) {
    const status=slotStatus(date,time,course);
    cell.className=`formal-teacher-slot ${status.cls}`;
    cell.title=status.tip;
    const key=formalLessonKey([date,time,course.id]);
    if(status.clickable) cell.dataset.teacherSlot=key; else delete cell.dataset.teacherSlot;
    if(status.cls==='is-teacher'||status.cls==='is-new') cell.dataset.lessonSlot=key; else delete cell.dataset.lessonSlot;
    if(status.cls==='is-available'||status.cls==='is-selected') cell.dataset.emptySlot=key; else delete cell.dataset.emptySlot;
    cell.innerHTML=status.label;
  }
  function toggleTeacherSlot(key) {
    const [date,time,courseId]=key.split('|');
    const course=courses.find(item=>item.id===courseId);
    if(!course) return;
    if(state.resultLessons.some(row=>row[0]===date&&row[1]===time&&row[2]===courseId)&&!state.newPlacedLessons.has(key)) {notify('该时段已有课节，如需调整请使用批量操作');return;}
    const cell=document.querySelector(`[data-teacher-slot="${key}"]`);
    const refresh=()=>{if(cell) applySlotCell(cell,date,time,course);};
    if(state.newPlacedLessons.has(key)) {
      state.newPlacedLessons.delete(key);
      state.resultLessons=state.resultLessons.filter(row=>!(row[0]===date&&row[1]===time&&row[2]===courseId));
      refresh();
      notify('已取消新排课节');
    } else if(state.pickedSlots.has(key)) {
      state.pickedSlots.delete(key);
      refresh();
      notify('已取消选择该时段');
    } else {
      state.pickedSlots.add(key);
      refresh();
      notify(`已选择 ${date} ${time} 「${course.name}」时段，提交排课后生效`);
    }
  }
  function formalLessonCard(item,course,teacher,selectable=true,groupInfo) {
    const checked=selectable&&state.selectedResultLessons.has(formalLessonKey(item));
    const picker=selectable?`<input class="formal-lesson-select" type="checkbox" data-select-result-lesson="${escapeHtml(formalLessonKey(item))}" aria-label="选择${escapeHtml(item[0])} ${escapeHtml(item[1])} ${escapeHtml(course.name)}" ${checked?'checked':''}>`:'';
    const cls=groupInfo||courseClassInfo(course.id);
    let topLabel='';
    if(cls.group){
      topLabel=`<span class="formal-lesson-class-label">班级${cls.group.index}</span>`;
    }
    const topRow=(cls.group||selectable)?`<div class="formal-lesson-top"><span class="formal-lesson-top-left">${topLabel}</span>${picker}</div>`:'';
    return `<article class="formal-lesson">${topRow}<div class="formal-lesson-title"><strong>${escapeHtml(course.name)}</strong><span>${escapeHtml(plainName(teacher))}</span></div><div class="formal-lesson-meta"><span class="formal-lesson-mode">${escapeHtml(course.mode)}</span><span>${course.mode==='线上'?'Classin':'鸿寿3F-D区-401'}</span></div><div class="formal-lesson-note">备注：${escapeHtml(item[3]||'--')}</div></article>`;
  }
  const lessonKeyParts = key => key.split('|');
  function findLesson(key) {
    const [date,time,courseId]=lessonKeyParts(key);
    return state.resultLessons.find(row=>row[0]===date&&row[1]===time&&String(row[2])===String(courseId));
  }
  function hideLessonPopover() {
    const pop=$('#formalLessonPopover');
    if(pop) {pop.hidden=true;pop.dataset.key='';}
  }
  function openLessonPopover(key,cell) {
    const pop=$('#formalLessonPopover');
    if(!pop) return;
    pop.dataset.key=key;
    pop.hidden=false;
    const rect=cell.getBoundingClientRect();
    const width=pop.offsetWidth||160, height=pop.offsetHeight||84;
    const canvasRight=document.querySelector('.prototype-notes')?.getBoundingClientRect().left||window.innerWidth;
    const left=Math.max(8,Math.min(rect.left,canvasRight-width-8));
    let top=rect.bottom+6;
    if(top+height>window.innerHeight-8) top=Math.max(8,rect.top-height-6);
    pop.style.left=left+'px';
    pop.style.top=top+'px';
  }
  function setLessonAdjustMode(key) {
    state.lessonAdjustSource=key;
    hideLessonPopover();
    const tip=$('#formalAdjustTip');
    if(tip) tip.hidden=false;
    $('#resultPage .formal-teacher-scroll')?.classList.add('is-adjusting');
    $('#resultPage')?.querySelectorAll('[data-lesson-slot]').forEach(cell=>{
      cell.classList.toggle('is-adjust-source',cell.dataset.lessonSlot===key);
    });
  }
  function clearLessonAdjustMode() {
    state.lessonAdjustSource=null;
    const tip=$('#formalAdjustTip');
    if(tip) tip.hidden=true;
    const scroll=$('#resultPage .formal-teacher-scroll');
    if(scroll) {
      scroll.classList.remove('is-adjusting');
      scroll.querySelectorAll('.is-adjust-source').forEach(cell=>cell.classList.remove('is-adjust-source'));
    }
  }
  function openLessonConfirm(type,sourceKey,targetKey) {
    state.lessonConfirm={type,sourceKey,targetKey:targetKey||''};
    hideLessonPopover();
    const overlay=$('#formalLessonConfirm'), text=$('#formalLessonConfirmText');
    if(!overlay||!text) return;
    text.textContent=type==='delete'?'确认删除当前课节？':type==='move'?'确认调整到当前时段？':'确认更换课节时间？';
    overlay.hidden=false;
  }
  function closeLessonConfirm() {
    state.lessonConfirm=null;
    const overlay=$('#formalLessonConfirm');
    if(overlay) overlay.hidden=true;
  }
  function refreshAfterLessonChange() {
    clearLessonAdjustMode();
    closeLessonConfirm();
    hideLessonPopover();
    const y=window.scrollY;
    renderResult(true,true);
    window.scrollTo({top:y,behavior:'auto'});
  }
  function applyLessonConfirm() {
    const action=state.lessonConfirm;
    if(!action) return;
    const {type,sourceKey,targetKey}=action;
    const source=findLesson(sourceKey);
    if(!source) {closeLessonConfirm();return;}
    if(type==='delete') {
      state.resultLessons=state.resultLessons.filter(row=>row!==source);
      state.newPlacedLessons.delete(sourceKey);
      state.pickedSlots.delete(sourceKey);
    } else if(type==='move') {
      const [date,time,courseId]=lessonKeyParts(targetKey);
      if(!date||!time) {closeLessonConfirm();return;}
      source[0]=date;source[1]=time;
      const targetCourse=courses.find(item=>String(item.id)===String(courseId));
      if(targetCourse) source[2]=targetCourse.id;
      if(state.newPlacedLessons.delete(sourceKey)) state.newPlacedLessons.add(formalLessonKey(source));
      state.pickedSlots.delete(targetKey);
      state.pickedSlots.delete(sourceKey);
    } else if(type==='swap') {
      const target=findLesson(targetKey);
      if(!target) {closeLessonConfirm();return;}
      const held=[target[0],target[1]];
      target[0]=source[0];target[1]=source[1];
      source[0]=held[0];source[1]=held[1];
      const sourceWasNew=state.newPlacedLessons.delete(sourceKey);
      const targetWasNew=state.newPlacedLessons.delete(targetKey);
      if(sourceWasNew) state.newPlacedLessons.add(formalLessonKey(source));
      if(targetWasNew) state.newPlacedLessons.add(formalLessonKey(target));
    }
    refreshAfterLessonChange();
    notify(type==='delete'?'已删除当前课节':type==='move'?'课节已调整到所选时段':'两节课时间已对调');
  }
  function renderResult(reuseExisting=false,keepScroll=false,planned=null) {
    closeWizard(false); state.completed=true;
    document.body.classList.add('formal-page-active');
    $('#orderPage').hidden=true; $('#resultPage').hidden=false;
    if(!reuseExisting) {
      state.restartingSchedule=false;
      state.planMode='智能排课';
      state.currentPlanCreatedAt=versionName(new Date());
      state.selectedResultLessons.clear();
      state.newPlacedLessons.clear();
      state.pickedSlots.clear();
      state.resultLessons=lessonChange?copyData(state.changeLessons):planned||generateStrategyLessons();
      state.activeVersionId=null;
    }
    const lessons=state.resultLessons;
    const classHours=courses.reduce((total,course)=>total+course.hours,0);
    const lessonHours=lesson=>{
      const [start,end]=lesson[1].split('-').map(minutes);
      return (end-start)/60;
    };
    const remainingHours=classHours-lessons.reduce((sum,lesson)=>sum+lessonHours(lesson),0);
    const courseScheduledHours=courseId=>lessons.filter(item=>item[2]===courseId).reduce((sum,lesson)=>sum+lessonHours(lesson),0);
    // 无 packages 的排课单（老数据/演示单）视作单课程包 = 班级1，与多包渲染结构一致
    const sideGroups=flowClassGroups.length?flowClassGroups:(courses.length?[{name:flowOrderTitle,index:1,courses}]:[]);
    const sideGroupInfo=courseId=>{const gi=sideGroups.findIndex(g=>g.courses.some(c=>c.id===courseId));return {index:gi,group:gi>=0?sideGroups[gi]:null,color:classColors[(gi>=0?gi:0)%classColors.length]};};
    const sideInfoHtml=`<section class="formal-side-card"><div class="formal-side-title"><span>排课信息</span><button type="button" class="formal-side-toggle" id="formalSideToggle" title="收起排课信息">收起 ‹</button></div><div class="formal-side-info"><div class="formal-side-fields"><div><label>学生姓名</label><strong>${escapeHtml(flowStudentName)}</strong></div><div><label>排课单总课时</label><strong>${classHours}</strong></div><div><label>排课单未排课时</label><strong>${Math.max(0,remainingHours)}</strong></div></div>${sideGroups.map((group,gi)=>{
      const color=classColors[gi%classColors.length];
      const hours=group.courses.reduce((total,course)=>total+course.hours,0);
      const scheduled=group.courses.reduce((total,course)=>total+courseScheduledHours(course.id),0);
      return `<div class="formal-side-class-block" style="--cls-main:${color[0]};--cls-light:${color[1]}"><div class="formal-side-class-head"><span class="formal-side-class-index">班级${group.index}</span><span class="formal-side-class-tag">班级课时${hours}/未排课时${Math.max(0,hours-scheduled)}</span></div><div class="formal-side-class-name">${escapeHtml(group.name)}</div><div class="formal-side-course-list">${group.courses.map(course=>{const done=courseScheduledHours(course.id);return `<div class="formal-side-course-row"><span>${escapeHtml(course.name)}</span><b>${done}/${course.hours}</b></div>`;}).join('')}</div></div>`;
    }).join('')}</div><div class="formal-class-note">课程后的数字为 已排课时/总课时</div></section>`;
    const dates=[...new Set(lessons.map(item=>item[0]))].sort();
    if(!dates.length) dates.push(orderDates.start);
    const times=[...new Set(lessons.map(item=>item[1]))].sort();
    if(!times.length) times.push('08:20-10:20','10:30-12:30','13:30-15:30','16:00-18:00','18:30-20:30');
    const scheduleTimes=[...new Set(['08:20-10:20','10:30-12:30','13:30-15:30','16:00-18:00','18:30-20:30',...times])].sort();
    const weekdays=['周日','周一','周二','周三','周四','周五','周六'];
    const weekday=date=>weekdays[new Date(`${date}T00:00:00Z`).getUTCDay()];
    const calendar=`<div class="formal-calendar-grid" style="--formal-day-count:${dates.length}"><div class="formal-calendar-head formal-calendar-corner">时间/时期</div>${dates.map(date=>`<div class="formal-calendar-head">${date}<span>${weekday(date)}</span></div>`).join('')}${times.map(time=>`<div class="formal-time">${time.replace('-', ' ~ ')}</div>${dates.map(date=>{const item=lessons.find(row=>row[0]===date&&row[1]===time);if(!item)return '<div class="formal-calendar-cell"></div>';const course=courses.find(c=>c.id===item[2]);return `<div class="formal-calendar-cell">${formalLessonCard(item,course,selectedTeacher(course),true,sideGroupInfo(course.id))}</div>`;}).join('')}`).join('')}</div>`;
    const teacherSchedule=`<table class="formal-teacher-table"><thead><tr><th>科目</th><th>教师姓名</th><th>上课时段</th>${dates.map(date=>`<th>${date}<small>(${weekday(date)})</small></th>`).join('')}<th>操作</th></tr></thead><tbody>${courses.map(course=>{const clsInfo=courseClassInfo(course.id);return scheduleTimes.map((time,index)=>`<tr>${index===0?`<td class="formal-merged" rowspan="${scheduleTimes.length}"><div class="formal-course-teacher-cell"><span>${escapeHtml(course.name)}</span>${clsInfo.group?`<small class="formal-course-class" style="color:${clsInfo.color[0]}">班级 ${clsInfo.group.index} · ${escapeHtml(clsInfo.group.name)}</small>`:''}<button class="formal-add-teacher" type="button" data-formal-add-teacher="${course.id}"><span aria-hidden="true">＋</span> 添加教师</button></div></td><td class="formal-merged" rowspan="${scheduleTimes.length}">${escapeHtml(selectedTeacher(course))}</td>`:''}<td>${time}</td>${dates.map(date=>{const status=slotStatus(date,time,course);const slotKey=formalLessonKey([date,time,course.id]);const slotAttrs=status.clickable?` data-teacher-slot="${slotKey}"`:'';const lessonAttrs=(status.cls==='is-teacher'||status.cls==='is-new')?` data-lesson-slot="${slotKey}"`:(status.cls==='is-available'||status.cls==='is-selected')?` data-empty-slot="${slotKey}"`:'';return `<td class="formal-teacher-slot ${status.cls}"${slotAttrs}${lessonAttrs} title="${status.tip}">${status.label}</td>`;}).join('')}${index===0?`<td class="formal-merged" rowspan="${scheduleTimes.length}"><button class="formal-link-button" type="button">删除</button></td>`:''}</tr>`).join('');}).join('')}</tbody></table>`;
    $('#resultPage').innerHTML=`<div class="formal-toolbar"><div class="formal-toolbar-left"><button class="formal-back" id="formalBack">‹ 返回</button><strong class="formal-toolbar-title" title="${escapeHtml(flowOrderTitle)}">${escapeHtml(flowOrderTitle)}${renewalPreview?' · 预排课表':''}</strong></div><div class="formal-toolbar-right"><button class="primary" id="formalFinish">${renewalPreview?'完成':'结束排课单'}</button></div></div>
      <div class="formal-layout${state.sideCollapsed?' side-collapsed':''}"><aside class="formal-side-column">${sideInfoHtml}</aside><div class="formal-main-column">
      <section class="formal-workspace"><header class="formal-workspace-head"><h2>教师排课 <span class="formal-calendar-icon">▦</span></h2><div class="formal-head-actions"><div class="formal-head-group group-refresh"><button id="formalRefresh">↻ 更新排课数据</button></div><div class="formal-head-group group-info"><button id="formalViewOrderInfo" type="button" aria-expanded="${!state.sideCollapsed}">查看排课信息</button><button id="formalViewApproval">查看审批结果</button><button id="formalViewConsult">查看售前咨单</button></div><div class="formal-head-group group-plan"><button id="formalSavePlan">保存排课方案</button><button id="formalSwitchPlan" ${state.versions.length?'':'disabled'}>切换排课方案</button></div><div class="formal-head-group group-preview"><button id="formalExportTeacherSchedule">预览教师课表</button><button id="formalStudentPreview">预览学生课表</button></div><div class="formal-head-group group-result"><button id="formalViewSchedule" ${state.planMode==='人工排课'?'disabled':''}>查看智能排课结果</button><button id="formalRestartSchedule">重新排课</button></div><span class="formal-collapse">⌄</span></div></header><div class="formal-linked-teachers"><span>已关联教师：</span>${[...new Set(courses.map(c=>selectedTeacher(c)))].map(t=>`<span class="formal-teacher-chip">${escapeHtml(t)} ×</span>`).join('')}<div class="formal-legend"><span class="published">已发布</span><span class="pending">待发布</span><span class="change">待变更</span><span class="conflict">冲突</span></div></div>
      <div class="formal-actions"><button id="formalAddLesson">添加课程时间</button><button>冲突检测</button><button>冲突详情</button><button id="viewConfirmedRequirements">查看排课要求</button><button>查找可用课次</button><button>清除空白课次</button><button>回写班级</button><button>回写班级课表</button><button>查看回写记录</button><button id="formalScheduleLog" type="button">排课日志</button></div>
      <div class="formal-actions formal-batch-actions"><button class="formal-active-action">◉ 关闭批量操作</button><button>◯ 全选</button><button disabled>时间调整</button><button disabled>关联课程</button><button disabled>关联教师</button><button disabled>关联教室</button><button disabled>取消教室</button><button disabled>删除书课</button><button disabled>添加备注</button><button disabled>回写选中课次</button><button disabled>修改授课模式</button><button disabled>添加课号</button></div>
      <p class="formal-generated-summary" role="status">${lessons.length?`已生成 ${lessons.length} 节 · 未排 ${Math.max(0,remainingHours)} 课时`:'暂无符合当前策略及师生日程的课节'}</p><div class="formal-calendar-card"><div class="formal-calendar-scroll">${calendar}</div></div><div class="formal-panel-grip">↧</div>
      <section class="formal-bottom-panel"><header class="formal-workspace-head"><h2>教师日程 <span class="formal-calendar-icon">▦</span></h2><span class="formal-collapse">⌄</span></header><div class="formal-bottom-content"><div class="formal-schedule-tabs"><button class="active">日程总览</button><button>日程详情</button></div><div class="formal-bottom-filters"><label>日期<input value="${dates[0]}　至　${dates.at(-1)}" readonly></label><label>时段<input value="${scheduleTimes.join(';')}" readonly></label><label>星期<select><option>请选择</option></select></label><div class="formal-filter-actions"><button>重置</button><button class="primary">查询</button></div></div><div class="formal-calendar-legend"><strong>图例：</strong><span class="leave">老师有课</span><span class="rest">老师休假</span><span class="available">可排</span><span class="unavailable">不可排（未到排课时间）</span><span class="student">学生有课</span><span class="shared">老师&学生都有课</span><span class="selected">已选择</span><span class="new">新排</span></div><div class="formal-teacher-scroll">${teacherSchedule}</div></div></section></section>
      </div></div>
      <footer class="formal-fixed-footer"><button id="formalCancel">取消</button><button class="primary" id="formalSubmit">${renewalPreview?'保存预排课表':'提交'}</button></footer><div id="formalDialog" class="formal-dialog-backdrop" hidden></div><div id="teacherScheduleDrawer" class="teacher-schedule-backdrop" hidden></div><div id="formalLessonPopover" class="formal-lesson-popover" hidden><button type="button" data-lesson-action="delete">删除课节</button><button type="button" data-lesson-action="adjust">调整课节</button></div><div id="formalLessonConfirm" class="formal-lesson-confirm-backdrop" hidden><div class="formal-lesson-confirm-window" role="dialog" aria-modal="true" aria-labelledby="formalLessonConfirmText"><h3 id="formalLessonConfirmText"></h3><div class="formal-lesson-confirm-actions"><button type="button" data-lesson-confirm="cancel">取消</button><button type="button" class="primary" data-lesson-confirm="ok">确认</button></div></div></div><div id="formalAdjustTip" class="formal-adjust-tip" hidden><span>调整课节：点击空白格子移动课节，或点击其他绿色课节互换时间</span><button type="button" data-lesson-adjust-cancel>取消调整</button></div>`;
    if(!keepScroll) window.scrollTo({top:0,behavior:'smooth'});
  }

  const teacherScheduleZones=[['Asia/Shanghai','北京&上海'],['Europe/London','伦敦'],['America/New_York','纽约']];
  const teacherScheduleRoom=course=>course.mode==='线上'?'Classin':'鸿寿3F-D区-401';
  const scheduleWeekStart=date=>{
    const day=utcDate(date);
    return isoDate(new Date(day.getTime()-((day.getUTCDay()+6)%7)*DAY));
  };
  function scheduleLocalMoment(date,time,timezone) {
    const moment=new Date(`${date}T${time}:00+08:00`);
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(moment).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
    return {date:`${parts.year}-${parts.month}-${parts.day}`,time:`${parts.hour}:${parts.minute}`};
  }
  function teacherScheduleLessons() {
    return state.resultLessons.flatMap(([date,time,courseId])=>{
      const course=courses.find(item=>item.id===courseId);
      if(!course||selectedTeacher(course)!==teacherScheduleView.teacher) return [];
      const room=teacherScheduleRoom(course);
      const [from,to]=time.split('-');
      const localStart=scheduleLocalMoment(date,from,teacherScheduleView.timezone);
      const localEnd=scheduleLocalMoment(date,to,teacherScheduleView.timezone);
      return [{date:localStart.date,time:`${localStart.time}-${localEnd.time}`,course,room}];
    }).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  }
  function teacherScheduleContext() {
    const all=teacherScheduleView.queried?teacherScheduleLessons():[];
    const days=[];
    if(all.length) {
      const first=utcDate(scheduleWeekStart(all[0].date)).getTime();
      const last=utcDate(scheduleWeekStart(all.at(-1).date)).getTime()+6*DAY;
      for(let cursor=first;cursor<=last;cursor+=DAY) days.push(isoDate(new Date(cursor)));
    }
    const baseline=teacherScheduleView.timezone==='Asia/Shanghai'?['00:00-23:59','08:20-10:20','09:00-10:00','10:00-10:30','10:30-12:30','13:30-15:30','14:30-16:30','16:00-18:00','18:30-20:30']:['00:00-23:59'];
    const times=[...new Set([...baseline,...all.map(item=>item.time)])].sort();
    return {all,days,times};
  }
  function teacherScheduleTable(days,times,lessons) {
    const weekdays=['周日','周一','周二','周三','周四','周五','周六'];
    const cells=new Map();
    for(const lesson of lessons) {
      const key=`${lesson.date}|${lesson.time}`;
      if(!cells.has(key)) cells.set(key,[]);
      cells.get(key).push(lesson);
    }
    return `<table class="teacher-schedule-table" style="--schedule-day-count:${days.length}"><thead><tr class="teacher-schedule-weekdays"><th>时间</th>${days.map(day=>`<th>${weekdays[utcDate(day).getUTCDay()]}</th>`).join('')}</tr><tr class="teacher-schedule-dates"><th></th>${days.map(day=>`<th>${escapeHtml(day)}</th>`).join('')}</tr></thead><tbody>${times.map(time=>`<tr><th>${escapeHtml(time)}</th>${days.map(day=>`<td>${(cells.get(`${day}|${time}`)||[]).map(item=>`<div class="teacher-schedule-lesson"><strong>${escapeHtml(item.course.name)}</strong><span>${escapeHtml(item.room)}</span><span>${escapeHtml(plainName(teacherScheduleView.teacher))}</span><span>${escapeHtml(flowStudentName)}</span></div>`).join('')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function renderTeacherScheduleDrawer() {
    const overlay=$('#teacherScheduleDrawer');
    if(!overlay) return;
    const teachers=[...new Set(courses.map(selectedTeacher).filter(name=>name&&name!=='未选择'))];
    const {all,days,times}=teacherScheduleContext();
    const table=all.length?`<div class="teacher-schedule-table-scroll" id="teacherScheduleScroll">${teacherScheduleTable(days,times,all)}</div>`:'<div class="teacher-schedule-empty">当前查询条件下没有课节，请更换老师后重试。</div>';
    overlay.innerHTML=`<section class="teacher-schedule-drawer" role="dialog" aria-modal="true" aria-labelledby="teacherScheduleTitle"><header class="teacher-schedule-header"><strong id="teacherScheduleTitle">导出教师课表</strong><button type="button" data-close-teacher-schedule aria-label="关闭">×</button></header><div class="teacher-schedule-body"><div class="teacher-schedule-filters"><label>老师姓名<select id="teacherScheduleTeacher"><option value="">请选择老师</option>${teachers.map(name=>`<option value="${escapeHtml(name)}" ${teacherScheduleView.teacher===name?'selected':''}>${escapeHtml(name)}</option>`).join('')}</select></label><label>时区<select id="teacherScheduleTimezone">${teacherScheduleZones.map(([value,label])=>`<option value="${value}" ${teacherScheduleView.timezone===value?'selected':''}>${escapeHtml(label)}</option>`).join('')}</select></label><button type="button" class="teacher-schedule-query" data-query-teacher-schedule>查询</button></div>${teacherScheduleView.queried?table:'<div class="teacher-schedule-empty">请选择老师姓名并点击“查询”，查看该老师的课表。</div>'}</div><footer class="teacher-schedule-footer"><button type="button" data-close-teacher-schedule>关闭</button><button type="button" data-export-teacher-schedule="pdf" ${all.length?'':'disabled'}>导出PDF课表</button><button type="button" data-export-teacher-schedule="excel" ${all.length?'':'disabled'}>导出Excel课表</button></footer></section>`;
    overlay.hidden=false;
    document.body.classList.add('teacher-schedule-open');
    if(all.length) {
      const today=isoDate(new Date());
      const focusDate=all.find(item=>item.date>=today)?.date||all[0].date;
      const focusIndex=days.indexOf(scheduleWeekStart(focusDate));
      const scroller=$('#teacherScheduleScroll');
      scroller.scrollLeft=Math.max(0,focusIndex)*213;
    }
  }
  function closeTeacherScheduleDrawer() {
    const overlay=$('#teacherScheduleDrawer');
    if(overlay) {overlay.hidden=true;overlay.innerHTML='';}
    document.body.classList.remove('teacher-schedule-open');
  }
  function queryTeacherSchedule() {
    const teacher=$('#teacherScheduleTeacher')?.value;
    if(!teacher) {notify('请先选择老师姓名');return;}
    teacherScheduleView.teacher=teacher;
    teacherScheduleView.timezone=$('#teacherScheduleTimezone').value;
    teacherScheduleView.queried=true;
    renderTeacherScheduleDrawer();
  }
  function exportTeacherSchedule(format) {
    const {all,days,times}=teacherScheduleContext();
    if(!all.length) {notify('当前没有可导出的课节');return;}
    const period=`${days[0]} 至 ${days.at(-1)}`;
    const title=`${plainName(teacherScheduleView.teacher)}教师课表（${period}）`;
    if(format==='pdf') {
      const pages=[];
      for(let index=0;index<days.length;index+=7) {
        const weekDays=days.slice(index,index+7);
        const lessons=all.filter(item=>weekDays.includes(item.date));
        if(lessons.length) pages.push(`<section class="print-week"><h2>${weekDays[0]} — ${weekDays.at(-1)}</h2>${teacherScheduleTable(weekDays,times,lessons)}</section>`);
      }
      const opened=window.teacherScheduleExport.printPdf(title,pages.join(''));
      if(!opened) notify('请允许弹出打印窗口，然后选择“另存为PDF”');
      return;
    }
    const weekdays=['周日','周一','周二','周三','周四','周五','周六'];
    const rows=[[title],[`时区：${teacherScheduleZones.find(([value])=>value===teacherScheduleView.timezone)?.[1]||''}`],['时间',...days.map(day=>`${weekdays[utcDate(day).getUTCDay()]} ${day}`)],...times.map(time=>[time,...days.map(day=>all.filter(item=>item.date===day&&item.time===time).map(item=>`${item.course.name}\n${item.room}\n${plainName(teacherScheduleView.teacher)}\n${flowStudentName}`).join('\n\n'))])];
    window.teacherScheduleExport.downloadExcel(rows,`${plainName(teacherScheduleView.teacher)}教师课表_${days[0]}_${days.at(-1)}.xlsx`);
  }

  function openFormalDialog(type,versionId) {
    const overlay=$('#formalDialog');
    if(!overlay) return;
    if(type==='approval') {
      const records=[flowOrder?.approvalRecords,flowOrder?.approvals].find(Array.isArray)||[];
      const rows=records.map(record=>`<tr><td>${escapeHtml(record.type||record.approvalType||'--')}</td><td>${escapeHtml(record.subject||record.course||'--')}</td><td>${escapeHtml(record.status||'--')}</td><td>${escapeHtml(record.result||'--')}</td><td>${escapeHtml(record.reviewer||'--')}</td><td>${escapeHtml(record.reviewedAt||record.approvalTime||'--')}</td><td>${escapeHtml(record.rejectReason||'--')}</td></tr>`).join('');
      overlay.innerHTML=`<div class="formal-dialog-window formal-approval-dialog" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">查看审批结果</strong><button type="button" data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body"><p class="formal-approval-order">排课单：${escapeHtml(flowOrderTitle)}</p>${rows?`<div class="formal-approval-table-wrap"><table><thead><tr><th>审批类型</th><th>排课科目</th><th>审批状态</th><th>审批结果</th><th>审批人</th><th>审批时间</th><th>驳回原因</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="formal-approval-empty">当前排课单暂无审批记录</div>'}</div><footer><button type="button" data-formal-dialog-close>关闭</button></footer></div>`;
    } else if(type==='restart') {
      overlay.innerHTML='<div class="formal-dialog-window formal-restart-dialog" role="alertdialog" aria-modal="true" aria-labelledby="formalDialogTitle" aria-describedby="formalRestartWarning"><header><strong id="formalDialogTitle">重新排课</strong><button type="button" data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body"><p id="formalRestartWarning">重新排课会删除全部预排课节，确认重新排课？</p></div><footer><button type="button" data-formal-dialog-close>取消</button><button type="button" class="primary" data-formal-restart-confirm>确认重新排课</button></footer></div>';
    } else if(type==='save') {
      const active=state.versions.find(item=>item.id===state.activeVersionId);
      const sameAsActive=active&&JSON.stringify(active.snapshot)===JSON.stringify(resultSnapshot());
      const remark=sameAsActive?active.remark||'':'';
      overlay.innerHTML=`<div class="formal-dialog-window formal-save-dialog" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">保存排课方案</strong><button data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body"><label class="formal-save-remark">方案备注（选填）<textarea id="formalPlanRemark" maxlength="200" placeholder="请输入方案备注，最多200字">${escapeHtml(remark)}</textarea></label></div><footer><button data-formal-dialog-close>取消</button><button class="primary" data-formal-save-confirm>确认保存</button></footer></div>`;
    } else if(type==='switch') {
      if(!state.versions.length) return;
      if(!state.versions.some(item=>item.id===state.pendingPlanVersionId)) state.pendingPlanVersionId=state.activeVersionId||state.versions[0].id;
      overlay.innerHTML=`<div class="formal-dialog-window formal-switch-dialog" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">切换排课方案</strong><button data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body"><div class="formal-version-list"><table><thead><tr><th>方案编号</th><th>保存时间</th><th>备注</th><th>排课结果</th></tr></thead><tbody>${[...state.versions].sort((a,b)=>Number(a.planNo)-Number(b.planNo)).map(version=>`<tr tabindex="0" data-formal-version-row="${escapeHtml(version.id)}" class="${state.pendingPlanVersionId===version.id?'selected':''}"><td><span class="formal-plan-radio"></span>${version.planNo}</td><td>${escapeHtml(version.savedAt)}</td><td class="formal-version-remark">${version.remark?escapeHtml(version.remark):'—'}</td><td><button data-formal-result-id="${escapeHtml(version.id)}">查看</button></td></tr>`).join('')}</tbody></table></div></div><footer><button data-formal-dialog-close>取消</button><button class="primary" data-formal-switch-confirm>确认切换方案</button></footer></div>`;
    } else if(type==='resultPreview') {
      const version=state.versions.find(item=>item.id===versionId);
      if(!version) return;
      const lessons=[...version.snapshot.resultLessons].sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
      const weekdays=['周日','周一','周二','周三','周四','周五','周六'];
      const dates=[...new Set(lessons.map(item=>item[0]))];
      const times=[...new Set(lessons.map(item=>item[1]))].sort();
      const weekday=date=>weekdays[new Date(`${date}T00:00:00Z`).getUTCDay()];
      const calendar=`<div class="formal-calendar-grid" style="--formal-day-count:${dates.length}"><div class="formal-calendar-head formal-calendar-corner">时间/时期</div>${dates.map(date=>`<div class="formal-calendar-head">${escapeHtml(date)}<span>${weekday(date)}</span></div>`).join('')}${times.map(time=>`<div class="formal-time">${escapeHtml(time.replace('-', ' ~ '))}</div>${dates.map(date=>{const item=lessons.find(row=>row[0]===date&&row[1]===time);if(!item)return '<div class="formal-calendar-cell"></div>';const course=courses.find(c=>c.id===item[2]);if(!course)return '<div class="formal-calendar-cell"></div>';const teacher=version.snapshot.direct?.[course.id]||version.snapshot.selected?.[course.id]||'未选择';return `<div class="formal-calendar-cell">${formalLessonCard(item,course,teacher,false)}</div>`;}).join('')}`).join('')}</div>`;
      overlay.innerHTML=`<div class="formal-dialog-window formal-result-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">方案${version.planNo} · 排课结果</strong><button data-formal-result-back aria-label="返回方案列表">×</button></header><div class="formal-dialog-body"><div class="formal-preview-summary"><span>创建时间：${escapeHtml(version.createdAt)}</span><span>保存时间：${escapeHtml(version.savedAt)}</span>${version.remark?`<span>备注：${escapeHtml(version.remark)}</span>`:''}</div>${lessons.length?`<div class="formal-preview-calendar"><div class="formal-calendar-scroll">${calendar}</div></div>`:'<div class="formal-preview-empty">该方案暂无已排课节</div>'}</div><footer><button data-formal-result-back>返回方案列表</button></footer></div>`;
    } else if(type==='manualLesson') {
      overlay.innerHTML=`<div class="formal-dialog-window" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">添加课程时间</strong><button data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body formal-manual-fields"><label>课程<select id="formalManualCourse">${courses.map(course=>`<option value="${course.id}">${escapeHtml(course.name)}</option>`).join('')}</select></label><label>日期<input id="formalManualDate" type="date" value="2026-09-07"></label><label>时段<select id="formalManualTime">${['08:20-10:20','10:30-12:30','13:30-15:30','14:30-16:30','16:00-18:00','18:30-20:30'].map(time=>`<option value="${time}">${time}</option>`).join('')}</select></label></div><footer><button data-formal-dialog-close>取消</button><button class="primary" data-formal-manual-add>确认添加</button></footer></div>`;
    }
    overlay.hidden=false;
  }
  function closeFormalDialog() {
    const overlay=$('#formalDialog');
    if(overlay) {overlay.hidden=true;overlay.innerHTML='';}
  }
  function restartScheduling() {
    closeFormalDialog();
    state.resultLessons=[];
    state.selectedResultLessons.clear();
    state.newPlacedLessons.clear();
    state.pickedSlots.clear();
    state.restartingSchedule=true;
    state.completed=false;
    state.draft=null;
    state.aiSnapshot=null;
    state.coursePlans=null;
    state.selected={};
    state.direct={};
    state.teacherRequirements=Object.fromEntries(courses.map(course=>[course.id,defaultTeacherRequirement(course)]));
    state.recommended=false;
    state.activeVersionId=null;
    state.pendingPlanVersionId=null;
    state.currentPlanCreatedAt=null;
    state.requirementConversation=null;
    state.aiAnalysisError='';
    document.body.classList.remove('formal-page-active');
    $('#resultPage').hidden=true;
    $('#orderPage').hidden=false;
    if(educatorTeacherFlow)editEducatorRequirements();
    else openWizard(1);
  }
  document.addEventListener('scroll',event=>{
    if(event.target?.classList?.contains('formal-teacher-scroll')) hideLessonPopover();
  },true);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&state.lessonConfirm) {closeLessonConfirm();return;}
    const lessonPop=$('#formalLessonPopover');
    if(event.key==='Escape'&&(state.lessonAdjustSource||(lessonPop&&!lessonPop.hidden))) {clearLessonAdjustMode();hideLessonPopover();return;}
    const scheduleOverlay=$('#teacherScheduleDrawer');
    if(scheduleOverlay&&!scheduleOverlay.hidden&&event.key==='Escape') {closeTeacherScheduleDrawer();return;}
    const teacherOverlay=$('#teacherLoadBackdrop');
    if(teacherOverlay&&!teacherOverlay.hidden&&event.key==='Escape') {closeTeacherLoad();return;}
    const overlay=$('#formalDialog');
    if(!overlay||overlay.hidden) return;
    if(event.key==='Escape') {closeFormalDialog();return;}
    const row=event.target.closest('[data-formal-version-row]');
    if(row&&(event.key==='Enter'||event.key===' ')&&!event.target.closest('button')) {
      event.preventDefault();
      state.pendingPlanVersionId=row.dataset.formalVersionRow;
      openFormalDialog('switch');
    }
  });

  document.addEventListener('click',event=>{
    if(!event.target.closest('.formal-lesson-popover')&&!event.target.closest('#formalLessonConfirm')&&!event.target.closest('[data-lesson-slot]')) hideLessonPopover();
    if(event.target.id==='formalLessonConfirm') {closeLessonConfirm();return;}
    if(event.target.id==='flowRequirementsOverlay') {closeRequirementReview();return;}
    if(event.target.id==='teacherScheduleDrawer') {closeTeacherScheduleDrawer();return;}
    if(event.target.id==='teacherLoadBackdrop') {closeTeacherLoad();return;}
    if(event.target.id==='modalBackdrop'&&event.target.classList.contains('flow-drawer-backdrop')) {closeWizard();return;}
    const dateControl=event.target.closest('.order-date-controls .order-date-item');
    if(dateControl&&event.target.tagName!=='INPUT') {
      const input=dateControl.querySelector('input[type="date"]');
      if(input&&!input.disabled) {
        event.preventDefault();
        try { input.showPicker(); } catch { input.focus(); }
      }
      return;
    }
    if(!event.target.closest('.teacher-style-select')) {
      document.querySelectorAll('.teacher-style-menu').forEach(item=>item.hidden=true);
      document.querySelectorAll('[data-open-teacher-styles]').forEach(item=>item.setAttribute('aria-expanded','false'));
    }
    const versionRow=event.target.closest('[data-formal-version-row]');
    if(versionRow&&!event.target.closest('button')) {state.pendingPlanVersionId=versionRow.dataset.formalVersionRow;openFormalDialog('switch');return;}
    const sideToggle=event.target.closest('#formalSideToggle');
    if(sideToggle) {state.sideCollapsed=true;$('#resultPage .formal-layout')?.classList.add('side-collapsed');$('#formalViewOrderInfo')?.setAttribute('aria-expanded','false');$('#formalViewOrderInfo')?.focus();return;}
    const popButton=event.target.closest('[data-lesson-action]');
    if(popButton) {
      const key=$('#formalLessonPopover')?.dataset.key||'';
      if(popButton.dataset.lessonAction==='delete') openLessonConfirm('delete',key,'');
      else setLessonAdjustMode(key);
      return;
    }
    const confirmButton=event.target.closest('[data-lesson-confirm]');
    if(confirmButton) {if(confirmButton.dataset.lessonConfirm==='ok') applyLessonConfirm(); else closeLessonConfirm();return;}
    if(event.target.closest('[data-lesson-adjust-cancel]')) {clearLessonAdjustMode();hideLessonPopover();return;}
    const lessonCell=event.target.closest('[data-lesson-slot]');
    if(lessonCell) {
      const key=lessonCell.dataset.lessonSlot;
      if(state.lessonAdjustSource) {if(key!==state.lessonAdjustSource) openLessonConfirm('swap',state.lessonAdjustSource,key);}
      else openLessonPopover(key,lessonCell);
      return;
    }
    const emptyCell=event.target.closest('[data-empty-slot]');
    if(emptyCell&&state.lessonAdjustSource) {openLessonConfirm('move',state.lessonAdjustSource,emptyCell.dataset.emptySlot);return;}
    const slotCell=event.target.closest('[data-teacher-slot]');
    if(slotCell) {toggleTeacherSlot(slotCell.dataset.teacherSlot);return;}
    const button=event.target.closest('button'); if(!button) return;
    if(button.id==='viewFlowRequirements') {openRequirementReview();return;}
    if(button.id==='viewTeacherStrategy') {openTeacherStrategyReview();return;}
    if(button.hasAttribute('data-educator-teacher-method')){
      const {courseId,educatorTeacherMethod}=button.dataset;
      if(button.getAttribute('aria-pressed')==='true')return;
      delete state.selected[courseId];
      if(educatorTeacherMethod==='specified')educatorSpecifiedCourses.add(courseId);
      else {
        educatorSpecifiedCourses.delete(courseId);
        delete state.direct[courseId];
      }
      if(state.step===3)renderTeachers();
      else renderAnalysis();
      $(`[data-course-id="${courseId}"][data-educator-teacher-method="${educatorTeacherMethod}"]`)?.focus();
      return;
    }
    if(button.hasAttribute('data-edit-educator-requirements')) {editEducatorRequirements();return;}
    if(button.hasAttribute('data-edit-educator-supplement')) {editEducatorSupplement();return;}
    if(button.hasAttribute('data-cancel-educator-supplement')) {closeRequirementReview();openRequirementReview();return;}
    if(button.hasAttribute('data-confirm-educator-supplement')) {confirmEducatorSupplement();return;}
    if(button.hasAttribute('data-remove-educator-supplement-file')){
      educatorSupplementFiles.splice(Number(button.dataset.removeEducatorSupplementFile),1);
      renderEducatorSupplementFiles();
      return;
    }
    if(button.hasAttribute('data-cancel-educator-requirements')) {
      closeRequirementReview();
      educatorRequirementDraft=null;
      educatorAnalysisIssues=[];
      openWizard(2);
      $('#wizardFooter [data-edit-educator-requirements]')?.focus();
      return;
    }
    if(button.hasAttribute('data-confirm-educator-requirements')) {regenerateEducatorRequirements();return;}
    if(button.hasAttribute('data-cancel-educator-strategy')) {
      closeRequirementReview();
      openTeacherStrategyReview();
      return;
    }
    if(button.hasAttribute('data-confirm-educator-strategy')){
      const error=validateDraft();
      if(error){notify(error);return;}
      educatorStrategyEdit=null;
      state.aiSnapshot={global:globalAnalysisSummary(),courses:Object.fromEntries(courses.map(course=>[course.id,state.draft.courses[course.id].map(segment=>`${segment.frequency}，${segment.time}`).join('；')]))};
      applyEducatorStrategy({showStrategy:true});
      notify('已更新排课策略');
      return;
    }
    if(button.hasAttribute('data-edit-educator-strategy')||educatorTeacherFlow&&button.hasAttribute('data-edit-strategy-from-teachers')){
      educatorStrategyEdit={draft:copyData(state.draft),dirty:state.dirty,editing:state.editing};
      state.editing=true;
      openTeacherStrategyReview();
      return;
    }
    if(button.hasAttribute('data-strategy-supplement')) {openTeacherSupplementReview();return;}
    if(button.hasAttribute('data-edit-strategy-from-teachers')) {
      closeRequirementReview();
      state.strategyEditSnapshot=copyData({draft:state.draft,direct:state.direct,selected:state.selected,editingSpecifiedCourseId:state.editingSpecifiedCourseId});
      state.strategyEditDirty=state.dirty;
      state.strategyEditFromTeachers=true;
      state.editing=true;
      openWizard(2);
      return;
    }
    if(button.hasAttribute('data-cancel-strategy-edit')) {cancelTeacherStrategyEdit();return;}
    if(button.id==='closeTeacherSupplement') {closeRequirementReview();return;}
    if(button.id==='saveTeacherSupplement') {
      const value=$('#teacherDirectSupplement')?.value.trim();
      if(!value) {notify('请先填写补充排课要求');return;}
      state.supplement=[state.supplement.trim(),value].filter(Boolean).join('\n');
      closeRequirementReview();
      setLoading('正在重新分析排课要求','重新生成排课策略…',()=>{finishAiAnalysis(2);notify('已更新排课策略，请核对分析结果');});
      return;
    }
    if(button.hasAttribute('data-fill-direct-teacher')) {$('#teacherDirectName').value=button.dataset.fillDirectTeacher;return;}
    if(button.hasAttribute('data-save-direct-teacher')) {
      const id=button.dataset.saveDirectTeacher;
      const teacher=resolveSpecifiedTeacher($('#teacherDirectName')?.value||'');
      if(!teacher) {notify('请选择已有老师，或填写老师姓名(工号)');return;}
      state.direct[id]=teacher;
      delete state.selected[id];
      closeRequirementReview();renderTeachers();
      notify(`已指定 ${plainName(teacher)} 为本课程老师`);
      return;
    }
    if(button.hasAttribute('data-clear-direct-teacher')) {
      const id=button.dataset.clearDirectTeacher;
      delete state.direct[id];
      closeRequirementReview();renderTeachers();
      notify('已取消本课程指定老师');
      return;
    }
    if(button.id==='closeFlowRequirements') {closeRequirementReview();return;}
    if(button.hasAttribute('data-order-end-rule')) {state.orderEndRule=button.dataset.orderEndRule;refreshSupplement();return;}
    if(button.hasAttribute('data-close-teacher-schedule')) {closeTeacherScheduleDrawer();return;}
    if(button.hasAttribute('data-query-teacher-schedule')) {queryTeacherSchedule();return;}
    if(button.hasAttribute('data-export-teacher-schedule')) {exportTeacherSchedule(button.dataset.exportTeacherSchedule);return;}
    if(button.hasAttribute('data-choose-educator-supplement')) {$('#educatorSupplementFiles')?.click();return;}
    if(button.hasAttribute('data-choose-supplement')) {$('#fileInput')?.click();return;}
    if(button.hasAttribute('data-remove-supplement-file')) {
      state.files.splice(Number(button.dataset.removeSupplementFile),1);
      refreshSupplement();
      return;
    }
    if(button.hasAttribute('data-view-teacher-load')) {openTeacherLoad(button.dataset.viewTeacherLoad);return;}
    if(button.hasAttribute('data-close-teacher-load')) {closeTeacherLoad();return;}
    if(button.hasAttribute('data-teacher-load-year')) {teacherLoadView.year+=Number(button.dataset.teacherLoadYear);renderTeacherLoad();return;}
    if(button.hasAttribute('data-toggle-teacher-tags')) {teacherLoadView.showTags=!teacherLoadView.showTags;renderTeacherLoad();return;}
    if(button.hasAttribute('data-open-teacher-styles')&&state.editingTeacherRequirements) {
      const menu=button.nextElementSibling;
      const opening=menu.hidden;
      document.querySelectorAll('.teacher-style-menu').forEach(item=>item.hidden=true);
      document.querySelectorAll('[data-open-teacher-styles]').forEach(item=>item.setAttribute('aria-expanded','false'));
      menu.hidden=!opening;
      button.setAttribute('aria-expanded',String(opening));
      return;
    }
    if(button.hasAttribute('data-toggle-teacher-style')&&state.teacherRequirementDrafts) {
      const courseId=button.closest('[data-teacher-requirement-course]')?.dataset.teacherRequirementCourse;
      if(!courseId) return;
      const style=button.dataset.toggleTeacherStyle;
      const styles=state.teacherRequirementDrafts[courseId].styles;
      const index=styles.indexOf(style);
      if(index<0) styles.push(style);
      else styles.splice(index,1);
      button.classList.toggle('is-selected',index<0);
      button.setAttribute('aria-pressed',String(index<0));
      button.closest('.teacher-style-select').querySelector('[data-teacher-style-display]').textContent=styles.length?styles.join('、'):'不限';
      return;
    }
    if(button.hasAttribute('data-edit-teacher-requirements')) {
      const scrollTop=$('#wizardBody').scrollTop;
      state.editingTeacherRequirements=true;
      state.teacherRequirementDrafts=copyData(state.teacherRequirements);
      renderTeachers();
      $('#wizardBody').scrollTop=scrollTop;
      return;
    }
    if(button.hasAttribute('data-cancel-teacher-requirements')) {
      const scrollTop=$('#wizardBody').scrollTop;
      state.editingTeacherRequirements=false;
      state.teacherRequirementDrafts=null;
      renderTeachers();
      $('#wizardBody').scrollTop=scrollTop;
      return;
    }
    if(button.hasAttribute('data-save-teacher-requirements')) {
      if(!state.editingTeacherRequirements||!state.teacherRequirementDrafts) return;
      const scrollTop=$('#wizardBody').scrollTop;
      state.teacherRequirements=copyData(state.teacherRequirementDrafts);
      let removedSelections=0;
      for(const course of courses) {
        const recommendedNames=new Set(recommendTeachersForCourse(course).teachers.map(teacher=>teacher.name));
        const currentTeacherSelected=!consultPreview&&course.history.some(([name,relation])=>relation==='当前'&&name===state.selected[course.id]);
        if(state.selected[course.id]&&!currentTeacherSelected&&!recommendedNames.has(state.selected[course.id])) {
          delete state.selected[course.id];
          removedSelections++;
        }
      }
      state.editingTeacherRequirements=false;
      state.teacherRequirementDrafts=null;
      setLoading('正在重新推荐排课老师','按照所有课程更新后的老师要求，重新筛选并核对周期覆盖…',()=>{
        renderTeachers();
        $('#wizardBody').scrollTop=scrollTop;
        notify(removedSelections?`已重新推荐老师；${removedSelections}门课程的原选老师不再符合要求，已取消选择`:'所有课程的老师要求已更新，推荐结果已刷新');
      });
      return;
    }
    if(button.hasAttribute('data-add-strategy')) {addCourseStrategy(button.dataset.addStrategy);return;}
    if(button.hasAttribute('data-delete-strategy')) {deleteCourseStrategy(button.dataset.deleteStrategy,Number(button.dataset.strategyIndex));return;}
    if(button.hasAttribute('data-add-unavailable-time')) {
      const module=button.closest('[data-strategy-limits]');
      module.querySelector('[data-unavailable-time-list]').insertAdjacentHTML('beforeend',unavailableTimeRow({dateFrom:'',dateTo:'',weekdays:[],allDay:true,startTime:'',endTime:''}));
      syncUnavailableTimeRules(module);
      return;
    }
    if(button.hasAttribute('data-remove-unavailable-time')) {
      const module=button.closest('[data-strategy-limits]');
      button.closest('[data-unavailable-time-row]').remove();
      syncUnavailableTimeRules(module);
      return;
    }
    if(button.hasAttribute('data-toggle-teacher-requirements')) {
      const courseId=button.dataset.toggleTeacherRequirements;
      const summary=document.getElementById(`teacher-requirement-${courseId}`);
      if(!summary) return;
      const expanding=summary.hidden;
      summary.hidden=!expanding;
      button.setAttribute('aria-expanded',String(expanding));
      button.textContent=expanding?'收起老师要求':'查看老师要求';
      if(expanding) state.expandedTeacherRequirementIds.add(courseId);
      else state.expandedTeacherRequirementIds.delete(courseId);
      return;
    }
    if(button.hasAttribute('data-view-course-plan')) {
      const courseId=button.dataset.viewCoursePlan;
      state.expandedPlanCourseId=state.expandedPlanCourseId===courseId?null:courseId;
      const scrollTop=$('#wizardBody').scrollTop;
      renderTeachers();
      $('#wizardBody').scrollTop=scrollTop;
      document.querySelector(`[data-view-course-plan="${courseId}"]`)?.focus();
      return;
    }
    if(button.id==='formalSavePlan') {
      openFormalDialog('save');
      $('#formalPlanRemark')?.focus();
      return;
    }
    if(button.id==='formalRestartSchedule') {openFormalDialog('restart');return;}
    if(button.hasAttribute('data-formal-restart-confirm')) {restartScheduling();return;}
    if(button.hasAttribute('data-formal-save-confirm')) {
      const remark=$('#formalPlanRemark')?.value.trim()||'';
      const {version,persisted,created}=saveCurrentResultVersion(remark);
      const switchButton=$('#formalSwitchPlan');
      if(switchButton) switchButton.disabled=false;
      closeFormalDialog();
      notify(persisted?`方案${version.planNo}已${created?'保存，可在切换排课方案中查看':'更新保存时间'}`:'当前方案仅保存在此页面，浏览器未允许持久保存');
      return;
    }
    if(button.id==='formalSwitchPlan') {openFormalDialog('switch');return;}
    if(button.hasAttribute('data-formal-dialog-close')) {closeFormalDialog();return;}
    if(button.hasAttribute('data-formal-result-id')) {openFormalDialog('resultPreview',button.dataset.formalResultId);return;}
    if(button.hasAttribute('data-formal-result-back')) {openFormalDialog('switch');return;}
    if(button.hasAttribute('data-formal-switch-confirm')) {
      const version=state.versions.find(item=>item.id===state.pendingPlanVersionId);
      if(!version) {notify('请先选择排课方案');return;}
      restoreResultSnapshot(version.snapshot);
      state.currentPlanCreatedAt=version.createdAt;
      state.activeVersionId=version.id;
      renderResult(true);
      notify(`已切换至方案${version.planNo}`);
      return;
    }
    if(button.id==='formalAddLesson') {openFormalDialog('manualLesson');return;}
    if(button.hasAttribute('data-formal-add-teacher')) {notify('添加教师需接入教师选择与日程数据');return;}
    if(button.hasAttribute('data-formal-manual-add')) {
      const courseId=$('#formalManualCourse').value;
      const date=$('#formalManualDate').value;
      const time=$('#formalManualTime').value;
      if(!date) {notify('请选择日期');return;}
      if(state.resultLessons.some(row=>row[0]===date&&row[1]===time)) {notify('该时段已有课程，请选择其他时间');return;}
      state.resultLessons.push([date,time,courseId]);
      state.resultLessons.sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
      renderResult(true);
      notify('课节已添加到当前方案');
      return;
    }
    if(button.hasAttribute('data-add-time-slot')) {
      const control=button.closest('[data-time-control]');
      const used=[...control.querySelectorAll('[data-time-weekday]:checked')].map(input=>input.value);
      const weekday=weekdayLabels.find(day=>!used.includes(day))||'周一';
      control.querySelector('[data-time-slot-list]').insertAdjacentHTML('beforeend',timeSlotRow({type:'优先',weekdays:[weekday],start:'08:20',end:'10:20'}));
      syncTimeControl(control);
      return;
    }
    if(button.hasAttribute('data-remove-time-slot')) {
      const control=button.closest('[data-time-control]');
      if(control.querySelectorAll('[data-time-slot-row]').length<=1) {notify('请至少保留一个时段，可将其类型改为常规');return;}
      button.closest('[data-time-slot-row]').remove();
      syncTimeControl(control);
      return;
    }
    if(button.id==='selfClassAssign') {
      const key='teacher-scheduling-v32-educator-assignments';
      let assignments={};
      try { assignments=JSON.parse(localStorage.getItem(key)||'{}')||{}; } catch {}
      assignments[String(flowOrder.id)]={handler:'李春玲',status:'处理中'};
      localStorage.setItem(key,JSON.stringify(assignments));
      flowOrder.handler='李春玲';flowOrder.status='处理中';
      window.refreshEducatorPendingCounts?.();
      if(location.hash.startsWith('#flow-order='))history.replaceState(null,'',`${location.pathname}${location.search}#flow-order=${encodeURIComponent(JSON.stringify(flowOrder))}`);
      renderOrder();notify('排课单已分配');return;
    }
    if(button.id==='startScheduling'||button.id==='restartScheduling') {
      if(state.draft) {
        state.editing=false;
        openWizard(2);
        return;
      }
      if(strategyAnalysisStatus==='SUCCESS') {finishAiAnalysis(2,{useSubmitted:true});return;}
      if(educatorTeacherFlow){openEducatorRequirementPage();return;}
      state.aiAnalysisError=strategyAnalysisStatus==='BUSINESS_FAILED'
        ?(flowOrder?.strategyAnalysis?.reason||flowOrder?.precheckIssues?.join('；')||'AI分析未生成可用策略，请补充排课要求后重新提交。')
        :'';
      openWizard(1);
      if(strategyAnalysisStatus==='TECHNICAL_FAILED') notify('AI分析暂不可用，请重新提交分析');
      return;
    }
    if(button.id==='formalBack'||button.id==='formalCancel') {
      if(homeroomSupplement){notifyHomeroomSupplement('homeroom-supplement-close');return;}
      document.body.classList.remove('formal-page-active');$('#resultPage').hidden=true;$('#orderPage').hidden=false;return;
    }

    if(button.id==='formalViewSchedule') { openWizard(4);return; }
    if(button.id==='formalRefresh') { notify('排课数据已更新（原型示意）');return; }
    if(button.id==='formalViewOrderInfo') {state.sideCollapsed=false;$('#resultPage .formal-layout')?.classList.remove('side-collapsed');button.setAttribute('aria-expanded','true');return;}
    if(button.id==='formalViewApproval') {openFormalDialog('approval');return;}
    if(button.id==='formalViewConsult') { window.openEducatorLinkedConsults?.();return; }
    if(button.id==='formalExportTeacherSchedule') {Object.assign(teacherScheduleView,{teacher:'',timezone:'Asia/Shanghai',queried:false});renderTeacherScheduleDrawer();return;}
    if(button.id==='formalStudentPreview') { notify('学生课表预览需接入正式课节数据');return; }
    if(lessonChange&&(button.id==='formalFinish'||button.id==='formalSubmit')){
      notifyHomeroomSupplement('homeroom-change-submit',{
        lessons:state.resultLessons,teachers:Object.fromEntries(courses.map(course=>[course.id,selectedTeacher(course)]))
      });
      return;
    }
    if(renewalPreview&&(button.id==='formalFinish'||button.id==='formalSubmit')){
      notifyHomeroomSupplement('homeroom-renewal-ready',{snapshot:resultSnapshot()});
      notifyHomeroomSupplement('homeroom-supplement-close');
      return;
    }
    if(button.id==='formalSubmit'&&lockedSlotModes.size){
      activeSlotLocks=window.studentSlotLocks.active();
      const requested=selectedLockedSlots();
      const unavailable=validateLockedSlots();
      if(unavailable){notify(unavailable);return;}
      const used=requested.filter(lock=>state.resultLessons.some(row=>row[0]===lock.date&&row[1]===lock.time&&row[2]===lock.courseId)&&
        window.studentSlotLocks.sameTeacher(lock.teacher,selectedTeacher(courses.find(course=>course.id===lock.courseId))));
      if(used.length&&!window.studentSlotLocks.consume(studentNumber,used.map(lock=>lock.id))){
        notify('锁定时段已失效，请返回补充排课要求重新排课。');return;
      }
      used.forEach(lock=>lockedSlotChoices.get(lock.courseId).delete(lock.id));
      used.forEach(lock=>{if(!lockedSlotChoices.get(lock.courseId).size)lockedSlotModes.delete(lock.courseId);});
      activeSlotLocks=window.studentSlotLocks.active();
    }
    if(button.id==='formalFinish') { notify('原型演示未实际结束排课单');return; }
    if(button.id==='formalSubmit') {
      if(!state.pickedSlots.size&&!state.newPlacedLessons.size) {notify('请先点击空白格子选择要排课的时段');return;}
      const added=[...state.pickedSlots,...state.newPlacedLessons].map(key=>key.split('|')).filter(parts=>courses.some(course=>course.id===parts[2]));
      for(const [date,time,courseId] of added) if(!state.resultLessons.some(row=>row[0]===date&&row[1]===time&&row[2]===courseId)) state.resultLessons.push([date,time,courseId]);
      state.resultLessons.sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
      for(const key of state.pickedSlots) state.newPlacedLessons.add(key);
      state.pickedSlots.clear();
      renderResult(true);
      notify(`排课已确认提交，新排 ${added.length} 节课程已生效`);
      return;
    }
    if(button.id==='viewConfirmedRequirements') { state.editing=false;openWizard(2);return; }
    if(button.id==='closeWizard'||button.hasAttribute('data-close')) {closeWizard();return;}
    if(button.hasAttribute('data-restart-plan')) {closeWizard();openFormalDialog('restart');return;}
    if(button.hasAttribute('data-pick-history')) {
      const id=button.dataset.pickHistory;
      const course=courses.find(item=>item.id===id);
      if(homeroomSupplement&&(!course?.isHistoricalCourse||!course.history.some(([teacher])=>teacher===button.dataset.teacher)))return;
      if(state.direct[id]!==button.dataset.teacher){lockedSlotModes.delete(id);lockedSlotChoices.delete(id);}
      state.direct[id]=button.dataset.teacher;delete state.selected[id];state.editingSpecifiedCourseId=null;refreshStrategyTeacher(id);return;
    }
    if(button.hasAttribute('data-change-specified')) {const id=button.dataset.changeSpecified;state.editingSpecifiedCourseId=id;refreshStrategyTeacher(id);return;}
    if(button.hasAttribute('data-cancel-specified-change')) {const id=state.editingSpecifiedCourseId;state.editingSpecifiedCourseId=null;refreshStrategyTeacher(id);return;}
    if(button.hasAttribute('data-set-specified')) {
      if(homeroomSupplement)return;
      const id=button.dataset.setSpecified;
      const teacher=resolveSpecifiedTeacher($(`[data-specified-input="${id}"]`).value);
      if(!teacher) {notify('请输入已有老师的姓名或工号，其他老师请填写姓名(工号)');return;}
      state.direct[id]=teacher;
      delete state.selected[id];
      state.editingSpecifiedCourseId=null;
      refreshStrategyTeacher(id);
      return;
    }
    if(button.hasAttribute('data-clear-specified')) {const id=button.dataset.clearSpecified;delete state.direct[id];lockedSlotModes.delete(id);lockedSlotChoices.delete(id);state.editingSpecifiedCourseId=null;refreshStrategyTeacher(id);return;}
    if(button.hasAttribute('data-confirm-conflict-option')) {submitRequirementConversation(button.dataset.confirmConflictOption);return;}
    if(button.hasAttribute('data-send-conflict-message')) {submitRequirementConversation($('#requirementChatInput')?.value);return;}
    if(button.hasAttribute('data-analyze')) {
      if(!orderDates.start) {notify('请选择开课日期');return;}
      if(state.orderEndRule===endRules[0]&&(!orderDates.end||orderDates.end<orderDates.start)) {notify('结课日期不能为空，且不能早于开课日期');return;}
      if(!validScheduleTimezone(state.scheduleTimezone)) {notify('请选择有效的上课时区（例如 Europe/London）');return;}
      activeSlotLocks=window.studentSlotLocks.active();
      const lockError=validateLockedSlots();
      if(lockError){lockedSlotModes.forEach(refreshStrategyTeacher);notify(lockError);return;}
      const aiError=state.requirementConversation?.sourceText===state.supplement&&state.requirementConversation.resolution?null:simulatedAiAnalysisError();
      state.aiAnalysisError='';
      if(!homeroomSupplement&&(aiError?.kind==='CONFLICT'||aiError?.kind==='DIALOGUE')) {openRequirementConversation(aiError);return;}
      setLoading('正在分析排课要求','识别全局与各科目要求，输出自然语言及结构化策略…',()=>{
        if(homeroomSupplement&&aiError){showHomeroomAnalysisError(aiError);return;}
        if(aiError?.status==='TECHNICAL_FAILED') {state.step=1;renderWizard();notify('系统调用失败，请重新提交AI分析');return;}
        if(aiError) { showAiAnalysisError(aiError.message); return; }
        if(lessonChange){
          const result=calculateChangeLessons();
          if(result.questions){showHomeroomAnalysisError(result);return;}
          state.changeLessons=result.lessons;
          const dates=state.changeLessons.map(row=>row[0]).sort();
          Object.assign(orderDates,{start:dates[0],end:dates.at(-1)});
        }
        state.homeroomAnalysisResult=null;
        finishAiAnalysis();
      });
      return;
    }
    if(button.hasAttribute('data-back-supplement')) {openWizard(1);return;}
    if(button.hasAttribute('data-toggle-edit')) {state.editing=!state.editing;renderAnalysis();return;}
    if(button.hasAttribute('data-save-rules')) {const error=validateDraft();if(error){notify(error);return;}state.editing=false;state.dirty=false;state.coursePlans=null;state.recommended=false;state.selected={};if(state.strategyEditFromTeachers){state.strategyEditSnapshot=null;state.strategyEditDirty=false;state.strategyEditFromTeachers=false;generateCoursePlans();state.recommended=true;openWizard(3);notify('排课策略已保存，学生计划和老师推荐已更新');}else{renderAnalysis();notify('排课策略已保存');}return;}
    if(button.hasAttribute('data-recommend')) {
      if(state.editing){notify('请先校验并保存策略');return;}
      if(educatorTeacherFlow&&hasMissingSpecifiedTeacher()){notify('请先为选择指定方式的课程指定老师');return;}
      const error=validateDraft();
      if(error){notify(error);return;}
      if(!homeroomSupplement&&!consultPreview&&allTeachersSpecified()){generateSchedule();return;}
      state.strategyEditFromTeachers=false;
      state.selected={};
      openTeacherSelection();
      return;
    }
    if(button.hasAttribute('data-transfer-consult') && consultPreview) {window.parent.postMessage({type:'consult-preview-transfer',consultId:flowOrder.consultId},'*');return;}
    if(button.hasAttribute('data-select-candidate')) {delete state.direct[button.dataset.selectCandidate];state.selected[button.dataset.selectCandidate]=button.dataset.teacher;renderTeachers();if(!consultPreview)notify(`已选择 ${plainName(button.dataset.teacher)}`);return;}
    if(button.hasAttribute('data-generate')) {const missing=courses.find(c=>!state.direct[c.id]&&!state.selected[c.id]);if(missing){notify(`请先为${missing.name}${consultPreview?'选择方案':'选择老师'}`);return;}if(consultPreview){setLoading('正在生成预排课表','按所选方案和学生时段生成预排课表…',()=>window.parent.postMessage({type:'consult-preview-ready',consultId:flowOrder.consultId,teachers:courses.map(course=>selectedTeacher(course))},'*'));return;}generateSchedule();}
  });
  document.addEventListener('keydown',event=>{
    if(event.target.id==='requirementChatInput'&&event.key==='Enter'&&!event.shiftKey) {
      event.preventDefault();
      submitRequirementConversation(event.target.value);
      return;
    }
    if(event.key!=='Escape') return;
    if(!$('#flowRequirementsOverlay').hidden) {closeRequirementReview();return;}
    if(!$('#teacherLoadBackdrop').hidden) {closeTeacherLoad();return;}
    if(!$('#modalBackdrop').hidden&&$('#modalBackdrop').classList.contains('flow-drawer-backdrop')) closeWizard();
  });
  document.addEventListener('input',event=>{
    const t=event.target;
    if(t.hasAttribute('data-schedule-timezone-input')) {
      state.scheduleTimezone=t.value.trim();
      return;
    }
    if(t.hasAttribute('data-order-date')) {
      orderDates[t.dataset.orderDate]=t.value;
      if(t.dataset.orderDate==='start') {
        const endInput=document.querySelector('[data-order-date="end"]');
        if(endInput) endInput.min=t.value;
      }
      return;
    }
    if(t.id==='supplementInput') {
      if(state.supplement!==t.value) state.requirementConversation=null;
      state.supplement=t.value;
      const count=$('#supplementCharacterCount');
      if(count) count.textContent=`${t.value.length}/2000`;
    }
    if(t.closest('[data-unavailable-time-row]')) syncUnavailableTimeRules(t.closest('[data-strategy-limits]'));
    if(t.hasAttribute('data-lesson-count')) {
      t.value=t.value.match(/^\d*/)[0];
      const segment=state.draft.courses[t.dataset.course][Number(t.dataset.segment)];
      segment.lessonCount=t.value;
      normalizeCourseDayCap(segment);
      const course=courses.find(item=>item.id===t.dataset.course);
      t.closest('.structured-segment').querySelector('[data-course-day-cap]').outerHTML=courseDayCapField(course,Number(t.dataset.segment),segment);
      state.dirty=true;
    }
    if(t.closest('[data-frequency-control]')) syncFrequencyControl(t.closest('[data-frequency-control]'));
    if(t.closest('[data-time-control]')&&t.matches('[data-time-start],[data-time-end]')) syncTimeControl(t.closest('[data-time-control]'));
    if(t.dataset.globalKey){state.draft.global[t.dataset.globalKey]=t.value;state.dirty=true;}
    if(t.dataset.course && t.dataset.segment!==undefined && t.dataset.key){state.draft.courses[t.dataset.course][Number(t.dataset.segment)][t.dataset.key]=t.value;state.dirty=true;}
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='educatorSupplementFiles'){
      appendEducatorSupplementFiles(event.target.files);
      event.target.value='';
      return;
    }
    const mode=event.target.dataset.heldMode;
    if(mode){
      if(event.target.value==='locked'){
        lockedSlotModes.add(mode);
        const locks=locksForTeacher(state.direct[mode]).filter(lockFitsOrder);
        if(!lockedSlotChoices.has(mode))lockedSlotChoices.set(mode,new Set(locks.length===1?[locks[0].id]:[]));
      }else lockedSlotModes.delete(mode);
      refreshStrategyTeacher(mode);
      $(`[data-held-mode="${mode}"]:checked`)?.focus();
      return;
    }
    const heldCourse=event.target.dataset.heldSlot;
    if(heldCourse){
      const choices=lockedSlotChoices.get(heldCourse);
      if(event.target.checked)choices.add(event.target.value);else choices.delete(event.target.value);
      return;
    }
    const t=event.target;
    if(t.hasAttribute('data-select-result-lesson')) {
      if(t.checked) state.selectedResultLessons.add(t.dataset.selectResultLesson);
      else state.selectedResultLessons.delete(t.dataset.selectResultLesson);
      return;
    }
    if(t.hasAttribute('data-schedule-timezone-choice')) {
      state.scheduleTimezone=t.value==='__custom__'?'':t.value;
      refreshSupplement();
      return;
    }
    if(t.hasAttribute('data-teacher-requirement-field')&&state.teacherRequirementDrafts) {
      const courseId=t.closest('[data-teacher-requirement-course]')?.dataset.teacherRequirementCourse;
      if(courseId) state.teacherRequirementDrafts[courseId][t.dataset.teacherRequirementField]=t.value;
      return;
    }
    if(t.hasAttribute('data-order-end-rule')) {
      state.orderEndRule=t.value;
      refreshSupplement();
      return;
    }
    if(t.closest('[data-unavailable-time-row]')) {
      const row=t.closest('[data-unavailable-time-row]');
      if(t.hasAttribute('data-unavailable-everyday')&&t.checked) row.querySelectorAll('[data-unavailable-weekday]').forEach(input=>{input.checked=false;});
      if(t.hasAttribute('data-unavailable-weekday')&&t.checked) row.querySelector('[data-unavailable-everyday]').checked=false;
      const selected=[...row.querySelectorAll('[data-unavailable-weekday]:checked')].map(input=>input.value);
      if(!selected.length) row.querySelector('[data-unavailable-everyday]').checked=true;
      row.querySelector('[data-weekday-summary]').textContent=selected.length?selected.join('、'):'每天';
      if(t.hasAttribute('data-unavailable-mode')) row.querySelector('[data-unavailable-time-inputs]').hidden=t.value==='allDay';
      syncUnavailableTimeRules(t.closest('[data-strategy-limits]'));
    }
    if(t.closest('[data-frequency-control]')) syncFrequencyControl(t.closest('[data-frequency-control]'));
    if(t.closest('[data-time-control]')) {
      const control=t.closest('[data-time-control]');
      if(t.hasAttribute('data-time-rule-type')&&t.value!=='常规') {
        const row=t.closest('[data-time-slot-row]');
        if(!row.querySelector('[data-time-weekday]:checked')) row.querySelector('[data-time-weekday]').checked=true;
        if(!row.querySelector('[data-time-start]').value) row.querySelector('[data-time-start]').value='08:20';
        if(!row.querySelector('[data-time-end]').value) row.querySelector('[data-time-end]').value='10:20';
      }
      syncTimeControl(control);
    }
    if(t.dataset.globalKey){state.draft.global[t.dataset.globalKey]=t.value;state.dirty=true;}
    if(t.dataset.course && t.dataset.segment!==undefined && t.dataset.key){
      const segment=state.draft.courses[t.dataset.course][Number(t.dataset.segment)];
      segment[t.dataset.key]=t.value;
      state.dirty=true;
      if(t.dataset.key==='completion'){
        const usesFrequency=t.value==='按频次排课';
        if(usesFrequency) segment.frequency=formatFrequency(segment);
        if(!segment.weekCap) segment.weekCap='无特殊要求';
        normalizeCourseDayCap(segment);
        const course=courses.find(item=>item.id===t.dataset.course);
        t.closest('.structured-segment').querySelector('[data-completion-fields]').outerHTML=completionSpecificFields(course,Number(t.dataset.segment),segment);
        t.closest('.structured-segment').querySelector('[data-course-day-cap]').outerHTML=courseDayCapField(course,Number(t.dataset.segment),segment);
      }
    }
    if(event.target.id==='fileInput') appendSupplementFiles(event.target.files);
  });
  document.addEventListener('dragover',event=>{
    const zone=event.target.closest('#supplementDropZone, .educator-analysis-upload');
    if(!zone) return;
    event.preventDefault();
    event.dataTransfer.dropEffect='copy';
    zone.classList.add('is-dragging');
  });
  document.addEventListener('dragleave',event=>{
    const zone=event.target.closest('#supplementDropZone, .educator-analysis-upload');
    if(zone&&!zone.contains(event.relatedTarget)) zone.classList.remove('is-dragging');
  });
  document.addEventListener('drop',event=>{
    const zone=event.target.closest('#supplementDropZone, .educator-analysis-upload');
    if(!zone) return;
    event.preventDefault();
    zone.classList.remove('is-dragging');
    if(zone.matches('.educator-analysis-upload'))appendEducatorSupplementFiles(event.dataTransfer.files);
    else appendSupplementFiles(event.dataTransfer.files);
  });
  if(flowOrder)$('#salesWorkspaceTab').addEventListener('click',event=>{
    event.preventDefault();
    location.href=`../index.html?v=20261110g&order=${flowOrder.id}#flow-return=${encodeURIComponent(JSON.stringify(flowOrder))}`;
  });
  if(educatorTeacherFlow&&location.hash.startsWith('#flow-order='))loadEducatorStrategy();
  renderOrder();
  if(homeroomSupplement) {
    document.documentElement.classList.add('embedded-homeroom-supplement');
    if(renewalPreview&&flowOrder.renewalPreview){
      restoreResultSnapshot(flowOrder.renewalPreview);
      renderResult(true);
    }else{
      openWizard(1);
      if(lessonChange?.autoAnalyze)$('[data-analyze]').click();
    }
    if(lessonChange)window.addEventListener('message',event=>{
      if(event.source===window.parent&&event.origin===location.origin&&event.data?.kind==='homeroom-change-rejected')notify(event.data.message);
    });
  } else if(consultPreview) {
    document.body.classList.add('consult-preview-mode');
    state.draft=initialDraft();
    generateCoursePlans();
    state.recommended=true;
    openWizard(3);
    $('#closeWizard').addEventListener('click',()=>window.parent.postMessage({type:'consult-preview-close',consultId:flowOrder.consultId},'*'));
  } else if(priorityPreviewRules) {
    state.draft=initialDraft();
    generateCoursePlans();
    state.recommended=true;
    openWizard(3);
  } else if(educatorTeacherFlow&&
    new URLSearchParams(location.search).get('order-list-view')===String(flowOrder.id)&&
    !flowSubmission?.selfClass&&flowOrder.type!=='自组班排课单'&&
    !['待分配','已完成','已关闭','已驳回','已撤回','已取消'].includes(flowOrder.status)){
    if(state.draft)openWizard(2);
    else if(strategyAnalysisStatus==='SUCCESS')finishAiAnalysis(2,{useSubmitted:true});
    else openEducatorRequirementPage();
  }
})();
