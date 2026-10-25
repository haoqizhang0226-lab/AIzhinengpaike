(() => {
  'use strict';

  const defaultOrderDates={start:'2026-09-01',end:'2026-12-30'};
  const orderDates={...defaultOrderDates};
  const endRules=['按开结课日期排课','排完全部课程结束'];
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
  const orderText = '写作30课时：9月每周固定1节，固定周一18:30—20:30；10月、11月每周可排2—3节，优先周三、周四10:20—12:30，10月23日全天不可排，周五18:30—20:30不可排；12月排完剩余课时。听力30课时：9月每周1—2节，优先周中08:20—12:20；10月每周1—2节，优先周三、周四10:30—12:30；12月排完剩余课时。口语30课时：9月每月3—4节，固定周二10:30—12:30；10月每月3—4节，优先周三、周四10:30—12:30；11月至12月每周1—2节，优先周六、周日08:20—10:20。阅读30课时：9月每两周1节，优先周二、周四14:30—16:30；10月、11月每月2—3节，优先周中14:30—16:30；12月排完剩余课时。10月1日至7日全天不可排；10月8日至10日早课（08:20—10:20）不可排。';
  const courses = [
    { id:'writing', name:'托福-写作-线下', hours:30, mode:'线下', campus:'雅仕校区', tags:['严格严肃','循序善诱'], history:[['郑扬扬(VA000755)','当前'],['荷超(VA000144)','历史'],['崔昕瑜(VA001736)','历史']], ai:'9月每周固定1节，固定周一18:30—20:30。9月首周从周二开始，无周一固定时段，首周目标为0节；10—11月每周2—3节，优先周三、周四上午；10月23日全天不可排，周五18:30—20:30不可排；12月排完剩余课节。', segments:[['2026-09-01','2026-09-30','每周固定1节','固定周一18:30—20:30'],['2026-10-08','2026-11-30','每周2—3节','优先周三、周四10:20—12:30'],['2026-12-01','2026-12-30','排完剩余课程','不限制']], funnel:[326,29,12,6,3], candidates:[
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
  const teacherDepartment='唯寻上海-英联邦浦西中心-班课教学部-教学组';
  const teacherStatusOrder=['引导','可排','待审批-新生','待审批-新生&老生','停排-新生','停排-老生&新生'];
  const teacherSchedulingStatus={
    '郑扬扬(VA000755)':'引导',
    '王紫(VA001968)':'可排',
    '杨红艳(VA001642)':'待审批-新生',
    '荷超(VA000144)':'引导',
    '崔昕瑜(VA001736)':'待审批-新生&老生',
    '夏红微(VA002413)':'停排-新生',
    '姜雪竹(VA002901)':'停排-老生&新生'
  };
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
  const teacherCampusOptions=['雅仕校区','浦东校区','舜元中心','南山校区','鸿港校区','苏悦校区','时代校区','长安国际校区2'];
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
  const teacherLoadExample=[[333,13],[131.25,14],[141,15],[215,16],[208.5,17],[185.5,18],[136.25,19],[370.5,20],[102,21],[65.5,22],[11,23],[24,24]];
  const teacherLoadView={name:'',year:2026,showTags:false};
  const teacherScheduleView={teacher:'',timezone:'Asia/Shanghai',queried:false};
  const demoResultLessons = [
    ...['2026-09-07','2026-09-14','2026-09-21','2026-09-28'].map(date=>[date,'18:30-20:30','writing']),
    ...['2026-10-15','2026-10-22'].map(date=>[date,'10:20-12:30','writing']),
    ...['2026-09-02','2026-09-09','2026-09-16','2026-09-23','2026-09-30','2026-10-14','2026-10-21','2026-10-28','2026-11-04','2026-11-11','2026-11-18','2026-11-25','2026-12-02','2026-12-09'].map(date=>[date,'08:20-10:20','listening']),
    ['2026-10-08','10:30-12:30','listening'],
    ...['2026-09-01','2026-09-08','2026-09-15','2026-09-22','2026-10-20'].map(date=>[date,'10:30-12:30','speaking']),
    ...['2026-09-03','2026-09-17','2026-09-29'].map(date=>[date,'14:30-16:30','reading'])
  ].sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));

  const versionStorageKey='teacher-schedule-v7-versions';
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
  const state = { step:1, supplement:'', files:[], aiAnalysisError:'', direct:{}, selected:{}, editingSpecifiedCourseId:null, teacherRequirements:Object.fromEntries(courses.map(course=>[course.id,defaultTeacherRequirement(course)])), editingTeacherRequirements:false, teacherRequirementDrafts:null, orderEndRule:endRules[0], scheduleTimezone:'Asia/Shanghai', editing:false, dirty:false, draft:null, aiSnapshot:null, coursePlans:null, expandedPlanCourseId:null, recommended:false, completed:false, resultLessons:[], versions:loadVersions(), activeVersionId:null, planMode:'智能排课', pendingPlanVersionId:null, currentPlanCreatedAt:null };
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
  const initialDraft = () => ({ global:{weekCap:'无特殊要求',dayCap:'无特殊要求',method:'交叉排课'}, courseLessonHours:Object.fromEntries(courses.map(c=>[c.id,2])), availability:{fullDayStops:[],blockedSlots:[]}, courses:Object.fromEntries(courses.map(c=>[c.id,initialCourseSegments(c)])) });
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
      draft.global={weekCap:active?.weekCap||'无特殊要求',dayCap:active?.dayCap||'无特殊要求',method:active?.method||'交叉排课'};
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
      const segmentStart=segment.start||orderDates.start,segmentEnd=segment.end||'';
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
  function teacherRequirementFields(course) {
    const editing=state.editingTeacherRequirements;
    const saved=teacherRequirementFor(course);
    const display=value=>value||'不限';
    const values=[`授课模式：${display(saved.mode)}`,`授课校区：${saved.mode==='线上'?'不适用':display(saved.campus)}`,`教师级别：${display(saved.level)}`,`试听课：${display(saved.trial)}`,`诊断课：${display(saved.diagnosis)}`,`自组班：${display(saved.selfOrganized)}`,`学生水平：${display(saved.studentLevel)}`,`教师性别：${display(saved.gender)}`,`教师风格：${saved.styles.length?saved.styles.join('、'):'不限'}`,`岗位类型：${display(saved.position)}`];
    const summary=`<div class="teacher-requirement-summary">${values.map(value=>`<span>${escapeHtml(value)}</span>`).join('')}</div>`;
    if(!editing) return summary;
    const requirement=state.teacherRequirementDrafts[course.id];
    const field=(label,key,options)=>`<label class="teacher-requirement-field"><span>${label}</span><select data-teacher-requirement-field="${key}">${teacherRequirementOptions(options,requirement[key])}</select></label>`;
    const styles=`<div class="teacher-requirement-field teacher-style-field"><span>教师风格</span><div class="teacher-style-select"><button type="button" class="teacher-style-trigger" data-open-teacher-styles aria-expanded="false"><span data-teacher-style-display>${escapeHtml(requirement.styles.length?requirement.styles.join('、'):'不限')}</span><b aria-hidden="true">⌄</b></button><div class="teacher-style-menu" hidden role="group" aria-label="教师风格（可多选）">${teacherStyleOptions.map(style=>`<button type="button" class="teacher-style-option ${requirement.styles.includes(style)?'is-selected':''}" data-toggle-teacher-style="${escapeHtml(style)}" aria-pressed="${requirement.styles.includes(style)}">${escapeHtml(style)}</button>`).join('')}</div></div></div>`;
    return `<div class="teacher-requirement-editor" data-teacher-requirement-course="${course.id}"><div class="teacher-requirement-fields">${field('授课模式','mode',['线上','线下','线上/线下'])}${field('授课校区','campus',teacherCampusOptions)}${field('教师级别','level',['金牌','普通'])}${field('试听课','trial',['试听需直属主管审批','不可试听','可带试听'])}${field('诊断课','diagnosis',['可带诊断'])}${field('自组班','selfOrganized',['可带自组班'])}${field('学生水平','studentLevel',teacherStudentLevelOptions)}${field('教师性别','gender',['男老师','女老师'])}${styles}${field('岗位类型','position',['全职','兼职','实习'])}</div></div>`;
  }
  const notify = message => { const t=$('#toast'); t.textContent=message; t.classList.add('show'); clearTimeout(notify.timer); notify.timer=setTimeout(()=>t.classList.remove('show'),2600); };
  const dateLabel = value => value.replaceAll('-','.');
  const avatar = '<span class="chat-avatar"><img src="ai-dialog-avatar.png" alt="AI助手"></span>';
  const rankCandidates = course => [...course.candidates].sort((a,b)=>{
    const statusDifference=teacherStatusOrder.indexOf(teacherStatus(a.name))-teacherStatusOrder.indexOf(teacherStatus(b.name));
    if(statusDifference) return statusDifference;
    const left=teacherCoverageSummary(course,a.name),right=teacherCoverageSummary(course,b.name);
    if(left.gap!==right.gap) return left.gap-right.gap;
    if(left.total!==right.total) return right.total-left.total;
    if(a.preference!==b.preference) return b.preference-a.preference;
    return a.name.localeCompare(b.name,'zh-CN');
  });
  const tightPeriod = teacher => teacher.periods.reduce((worst,p)=>!worst || (p[2]-p[1])/p[1]<(worst[2]-worst[1])/worst[1] ? p : worst,null);

  function renderOrder() {
    $('#orderRequirementText').textContent=orderText;
  }
  function setLoading(title,description,callback) {
    $('#loadingTitle').textContent=title; $('#loadingDescription').textContent=description;
    $('.wizard').dataset.loading='true';
    $('.wizard').setAttribute('aria-busy','true');
    $('#closeWizard').disabled=true;
    $('#loadingBackdrop').hidden=false;
    setTimeout(()=>{
      $('#loadingBackdrop').hidden=true;
      $('.wizard').dataset.loading='false';
      $('.wizard').removeAttribute('aria-busy');
      $('#closeWizard').disabled=false;
      callback();
    },1050);
  }
  function simulatedAiAnalysisError() {
    const text=state.supplement.replace(/\s+/g,'');
    if(text.includes('展示技术报错样式')) return {kind:'TECHNICAL_FAILED',message:'AI分析暂时不可用，请稍后重试。'};
    if(text.includes('展示报错样式')) {
      return {kind:'BUSINESS_FAILED',message:'【模拟报错】AI无法完成排课要求分析：部分上课时段要求存在冲突。请核对后修改补充信息，再重新提交分析。'};
    }
    if(/周一18:30[—\-~至]20:30禁排/.test(text)) {
      return {kind:'BUSINESS_FAILED',message:'写作要求每周一 18:30—20:30 固定上课，但补充信息要求同一时段禁排。请修改冲突内容后重新提交分析。'};
    }
    return null;
  }
  function showAiAnalysisError(message) {
    state.aiAnalysisError=message;
    state.step=1;
    renderWizard();
  }
  function openWizard(step) { state.step=step; $('#modalBackdrop').hidden=false; renderWizard(); }
  function closeWizard() {
    if(!$('#loadingBackdrop').hidden) return;
    state.editingTeacherRequirements=false;
    state.teacherRequirementDrafts=null;
    $('#modalBackdrop').hidden=true;
    document.body.classList.remove('flow-drawer-open');
  }
  function renderWizard() {
    const titles={1:'补充排课要求',2:'确认排课策略',3:'选择排课老师',4:'查看智能排课结果'};
    const isDrawer=state.step<=3;
    $('#modalBackdrop').classList.toggle('flow-drawer-backdrop',isDrawer);
    document.body.classList.toggle('flow-drawer-open',isDrawer);
    $('.wizard').dataset.step=String(state.step);
    $('#wizardTitle').textContent=titles[state.step];
    if(state.step===1) renderSupplement();
    else if(state.step===2) renderAnalysis();
    else if(state.step===3) renderTeachers();
    else renderCompletedPlan();
    $('#wizardBody').scrollTop=0;
  }
  function supplementTeacherCard(course) {
    const selected=state.direct[course.id];
    const editing=state.editingSpecifiedCourseId===course.id;
    const input=`<input class="teacher-input" data-specified-input="${course.id}" placeholder="输入老师姓名或工号"><button class="btn" data-set-specified="${course.id}">指定</button>${editing?'<button class="btn btn-quiet" data-cancel-specified-change>取消</button>':''}`;
    const chosen=`<span class="teacher-choice selected specified-teacher-tag">${escapeHtml(selected)}</span><button class="btn btn-quiet" data-change-specified="${course.id}">更换</button><button class="remove-spec" data-clear-specified="${course.id}" aria-label="删除指定老师">×</button>`;
    return `<div class="course-mini" data-course="${course.id}"><div class="course-mini-head"><strong>${course.name}</strong><span class="meta-chip">${course.hours}课时</span><span class="meta-chip">${course.mode}</span><span class="meta-chip">${course.campus}</span></div><div class="teacher-line"><span>当前授课老师</span><div class="teacher-list">${course.history.filter(h=>h[1]==='当前').map(h=>`<button class="teacher-choice ${selected===h[0]?'selected':''}" data-pick-history="${course.id}" data-teacher="${escapeHtml(h[0])}">${escapeHtml(h[0])}</button>`).join('')||'—'}</div></div><div class="teacher-line"><span>历史授课老师</span><div class="teacher-list">${course.history.filter(h=>h[1]==='历史').map(h=>`<button class="teacher-choice ${selected===h[0]?'selected':''}" data-pick-history="${course.id}" data-teacher="${escapeHtml(h[0])}">${escapeHtml(h[0])}</button>`).join('')||'—'}</div></div><div class="teacher-line specified-teacher-line"><span>指定排课老师</span><div class="specified-teacher-control">${selected&&!editing?chosen:input}</div></div></div>`;
  }
  function resolveSpecifiedTeacher(value) {
    const input=value.trim().replaceAll('（','(').replaceAll('）',')');
    const known=[...new Set(courses.flatMap(course=>[...course.history.map(item=>item[0]),...course.candidates.map(item=>item.name)]))];
    const match=known.find(name=>name===input||plainName(name)===input||name.slice(name.indexOf('(')+1,-1).toLowerCase()===input.toLowerCase());
    return match||(/^[^()]+\([A-Za-z0-9]+\)$/.test(input)?input:null);
  }
  function renderSupplement() {
    const knownTimezone=scheduleTimezoneOptions.some(([id])=>id===state.scheduleTimezone);
    $('#wizardBody').innerHTML=`${state.aiAnalysisError?`<section class="supplement-ai-error ai-analysis-error" role="alert"><strong>AI分析失败</strong><p>${escapeHtml(state.aiAnalysisError)}</p></section>`:''}
      <section class="supplement-panel"><header class="supplement-panel-header"><h3>排课要求</h3><span>来自排课单</span></header>
        <div class="order-date-controls">
          <label class="order-control"><span>排课要求</span><select data-order-end-rule aria-label="排课要求">${endRules.map(rule=>`<option value="${rule}" ${state.orderEndRule===rule?'selected':''}>${rule}</option>`).join('')}</select><i class="order-control-chevron" aria-hidden="true"></i></label>
          <label class="order-control order-date-item"><span>开课日期</span><input type="date" data-order-date="start" aria-label="开课日期" value="${escapeHtml(orderDates.start)}"><i class="order-control-chevron" aria-hidden="true"></i></label>
          <label class="order-control order-date-item ${state.orderEndRule===endRules[1]?'is-disabled':''}"><span>结课日期</span><input type="date" data-order-date="end" aria-label="结课日期" value="${escapeHtml(orderDates.end)}" min="${escapeHtml(orderDates.start)}" ${state.orderEndRule===endRules[1]?'disabled':''}><i class="order-control-chevron" aria-hidden="true"></i></label>
          <label class="order-control"><span>上课时区</span><select id="scheduleTimezoneChoice" data-schedule-timezone-choice aria-label="上课时区">${scheduleTimezoneOptions.map(([id,label])=>`<option value="${id}" ${state.scheduleTimezone===id?'selected':''}>${escapeHtml(label)}</option>`).join('')}<option value="__custom__" ${knownTimezone?'':'selected'}>其他时区</option></select><i class="order-control-chevron" aria-hidden="true"></i></label>
        </div>
        ${knownTimezone?'':`<div class="order-timezone-custom"><label>其他上课时区<input type="text" data-schedule-timezone-input aria-label="其他上课时区" placeholder="例如 Europe/Paris" value="${escapeHtml(state.scheduleTimezone)}"></label></div>`}
        <p class="supplement-order-text">${escapeHtml(orderText)}</p></section>
      <section class="supplement-panel"><header class="supplement-panel-header"><h3>指定授课老师</h3><span>已指定 ${Object.keys(state.direct).length}/${courses.length}</span></header><div class="supplement-teacher-grid">${courses.map(supplementTeacherCard).join('')}</div></section>
      <section class="supplement-panel supplement-upload-panel"><header class="supplement-panel-header"><h3>上传补充信息</h3></header><div class="supplement-panel-content"><textarea id="supplementInput" placeholder="输入补充文字，或上传沟通截图补充排课要求">${escapeHtml(state.supplement)}</textarea><div class="supplement-upload-zone" id="supplementDropZone"><button type="button" class="btn btn-quiet" data-choose-supplement>＋ 上传补充信息</button><span>或将图片拖拽到此处</span><small>支持 PNG、JPG、WebP 图片；原型仅展示文件名</small><input id="fileInput" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden></div>${state.files.length?`<div class="supplement-file-list">${state.files.map((name,index)=>`<span>${escapeHtml(name)}<button type="button" data-remove-supplement-file="${index}" aria-label="删除${escapeHtml(name)}">×</button></span>`).join('')}</div>`:''}</div></section>`;
    $('#wizardFooter').innerHTML='<button class="btn" data-close>取消</button><button class="btn btn-primary" data-analyze>AI分析排课要求</button>';
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
    state.files=[...new Set([...state.files,...accepted.map(file=>file.name)])];
    refreshSupplement();
    notify(`已选择 ${accepted.length} 份补充信息${accepted.length<files.length?'，不支持的格式已忽略':''}`);
  }
  function field(label,value,attrs='') { return `<label>${label}<input ${attrs} value="${escapeHtml(value)}" ${state.editing?'':'disabled'}></label>`; }
  function dateRangeField(start,end,attrs,lastStrategy=false,courseEnd='',courseStart='') {
    const displayedStart=start||courseStart;
    const displayedEnd=end||courseEnd;
    if(!state.editing) return `<label class="date-range-field">排课日期<input value="${escapeHtml(displayDate(displayedStart))}${displayedEnd?` - ${escapeHtml(displayDate(displayedEnd))}${(!start&&courseStart)||(!end&&courseEnd)?'（排课单日期兜底）':''}`:' 起 · 排完全部课时结束'}" disabled></label>`;
    const hints=[];
    if(courseStart) hints.push(`开始日期留空时按排课单开课日期 ${displayDate(courseStart)} 兜底`);
    if(lastStrategy) hints.push(courseEnd?`结束日期留空时按排课单结课日期 ${displayDate(courseEnd)} 兜底`:'结束日期留空时排完全部课时后确定结课日期');
    return `<label class="date-range-field">排课日期<div class="date-range-inputs"><input type="date" ${attrs} data-key="start" value="${escapeHtml(start)}" aria-label="排课开始日期" ${courseStart?'':'required'}><span>-</span><input type="date" ${attrs} data-key="end" value="${escapeHtml(end)}" aria-label="排课结束日期${lastStrategy?'（最后一条策略可留空）':''}" ${lastStrategy?'':'required'}></div>${hints.length?`<small class="date-range-hint">${escapeHtml(hints.join('；'))}</small>`:''}</label>`;
  }
  function effectiveCourseRequirements(course) {
    const segments=state.draft.courses[course.id];
    return segments.map((segment,index)=>({
      ...segment,
      start:index===0&&!segment.start?orderDates.start:segment.start,
      end:index===segments.length-1&&!segment.end&&state.orderEndRule==='按开结课日期排课'&&segment.completion!=='排完剩余课程'?orderDates.end:segment.end
    }));
  }
  function globalSelect(label,key,value,options) {
    return `<label>${label}<select data-global-key="${key}" ${state.editing?'':'disabled'}>${options.map(option=>`<option value="${escapeHtml(option)}" ${value===option?'selected':''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
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
  const courseLessonTotal=course=>Math.ceil(course.hours/courseLessonHours(course)-1e-9);
  const courseFinalLessonHours=course=>Number((course.hours-(courseLessonTotal(course)-1)*courseLessonHours(course)).toFixed(2));
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
  function teacherAvailable(teacherName,day,time,courseId) {
    if(!teacherName) return true;
    if(demoResultLessons.some(item=>item[0]===day&&item[1]===time&&item[2]===courseId)) return true;
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
  function calendarCapacity(requirement,start,end,courseId,teacherName='',specificType='') {
    if(!end||end<start) return 0;
    const course=courses.find(item=>item.id===courseId);
    const durationMinutes=Math.round((course?courseLessonHours(course):2)*60);
    const clock=value=>`${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;
    const perDay=Math.min(Number(requirement.dayCap)||1,Number(state.draft.global.dayCap)||Infinity);
    const perWeek=Math.min(Number(requirement.weekCap)||Infinity,Number(state.draft.global.weekCap)||Infinity);
    const weekly=new Map();
    for(let t=start.getTime();t<=end.getTime();t+=DAY) {
      const date=new Date(t),day=isoDate(date);
      if(isStoppedDay(day,requirement)) continue;
      const weekday=weekdayLabels[(date.getUTCDay()+6)%7];
      const explicitStarts=timeRulesOf(requirement).filter(rule=>rule.type!=='常规'&&!rule.allDay&&rule.weekdays.includes(weekday)&&rule.start).map(rule=>minutes(rule.start));
      const eligible=studentSlots(day).flatMap(time=>{
        const [availableFrom,availableTo]=time.split('-').map(minutes);
        const starts=new Set([availableFrom,...explicitStarts.filter(value=>value>=availableFrom&&value<availableTo)]);
        return [...starts].map(from=>[from,from+durationMinutes,availableTo]);
      }).filter(([from,to,availableTo])=>{
        if(to>availableTo) return false;
        if(isBlockedSlot(day,from,to,requirement)) return false;
        const onlyRules=rulesByType(requirement,'仅限');
        if(onlyRules.length&&!onlyRules.some(rule=>slotInRule(rule,weekday,from,to))) return false;
        if(onlyFixedRules(requirement)&&!rulesByType(requirement,'固定').some(rule=>slotInRule(rule,weekday,from,to))) return false;
        if(specificType&&!rulesByType(requirement,specificType).some(rule=>slotInRule(rule,weekday,from,to))) return false;
        return teacherAvailable(teacherName,day,`${clock(from)}-${clock(to)}`,courseId);
      }).map(([from,to])=>[from,to]).sort((a,b)=>a[1]-b[1]);
      let dayCount=0,lastEnd=-1;
      for(const [from,to] of eligible) if(from>=lastEnd&&dayCount<perDay) {dayCount++;lastEnd=to;}
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
      if(!requirement.end&&index===requirements.length-1) {
        buckets.push({index,start:requirement.start,end:'',days:null,min:0,max:Infinity,requiredMin:0,requiredMax:Infinity,studentCapacity:null,studentGap:0,finish:true,rolling:true});
        continue;
      }
      const start=utcDate(requirement.start),end=utcDate(requirement.end);
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
  const previewEnd=start=>isoDate(new Date(utcDate(start).getTime()+55*DAY));
  function periodRequirement(row) {
    if(row.rolling) return '排完剩余课节（滚动）';
    if(row.finish) return '排完剩余课节';
    return lessonRange(row.requiredMin,row.requiredMax);
  }
  function studentCapacityLabel(row,course,requirement) {
    if(row.rolling) {
      const capacity=calendarCapacity(requirement,utcDate(row.start),utcDate(previewEnd(row.start)),course.id);
      return `${Math.min(courseLessonTotal(course),capacity)} 节（近8周）`;
    }
    if(row.finish) return `${Math.min(courseLessonTotal(course),row.studentCapacity)} 节`;
    return `${row.max} 节`;
  }
  const studentGap=row=>row.finish?'待实际排课后核对':`${row.studentGap} 节`;
  const studentEffectiveDays=(row,requirement)=>row.rolling
    ?`${effectiveDays(utcDate(row.start),utcDate(previewEnd(row.start)),requirement)} 天（近8周）`
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
      const range=requirement.end?`${dateLabel(requirement.start)}—${dateLabel(requirement.end)}`:`${dateLabel(requirement.start)} 起 · 排完全部课时结束`;
      return `<div class="result-requirement teacher-plan-section"><div class="teacher-plan-heading"><strong>学生排课计划 · 策略 ${index+1}</strong><span>${range}</span></div>${planRuleLine(requirement)}<div class="result-table-scroll"><table class="result-period-table"><thead><tr><th>排课日期</th><th>有效天数</th><th>学生排课要求</th><th>学生可排容量</th><th>下限容量缺口</th></tr></thead><tbody>${rows.map(row=>`<tr class="${row.rolling?'rolling-plan-row':''}"><td>${periodDate(row)}</td><td>${studentEffectiveDays(row,requirement)}</td><td>${periodRequirement(row)}</td><td><strong>${studentCapacityLabel(row,course,requirement)}</strong></td><td class="${row.studentGap?'period-gap':''}">${studentGap(row)}</td></tr>`).join('')}</tbody></table></div>${rows.some(row=>row.rolling)?'<div class="rolling-plan-note">排完为止不设固定结课日；近8周仅用于展示当前可排容量，后续继续滚动计算。</div>':''}</div>`;
    }).join('')||'<div class="strategy-notice">当前策略没有可执行的排课日期</div>';
    const warning=plan.remaining>0?`<div class="strategy-notice is-error">按示例学生日程测算，指定日期内预计仍有 ${plan.remaining} 节缺少排课机会；可继续选择老师，最终以联合排课结果为准。</div>`:'';
    return `${sections}${warning}`;
  }
  function completionField(course,index,value) {
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
    if(!state.editing) return `<div class="course-rule-control time-rule-control"><span>上课时段</span><div class="course-time-rule-view-list">${timeRulesOf(segment).map(rule=>`<div class="course-time-rule-view-row"><strong>${escapeHtml(rule.type)}</strong><span>${rule.type==='常规'?'系统选择时段':escapeHtml(`${rule.weekdays.join('、')} ${rule.allDay?'全天':`${rule.start}—${rule.end}`}`)}</span></div>`).join('')}</div></div>`;
    return `<div class="course-rule-control time-rule-control" data-time-control data-course="${course.id}" data-segment="${index}"><span>上课时段</span><div class="course-time-slot-editor"><div class="course-time-slot-list" data-time-slot-list>${timeRulesOf(segment).map(timeSlotRow).join('')}</div><button type="button" class="course-add-time-slot" data-add-time-slot>＋ 添加时段</button></div></div>`;
  }
  function unavailableTimeRow(rule) {
    const selected=rule.weekdays||[];
    return `<div class="strategy-limit-edit-row" data-unavailable-time-row><label class="unavailable-field">开始日期<input type="date" data-unavailable-from aria-label="不可排开始日期" value="${escapeHtml(rule.dateFrom||'')}"></label><label class="unavailable-field">结束日期<input type="date" data-unavailable-to aria-label="不可排结束日期" value="${escapeHtml(rule.dateTo||'')}"></label><div class="unavailable-field"><span>星期</span><details class="weekday-picker unavailable-weekday-picker"><summary><span data-weekday-summary>${selected.length?selected.join('、'):'每天'}</span></summary><div class="weekday-options"><label><input type="checkbox" data-unavailable-everyday ${selected.length?'':'checked'}>每天</label>${weekdayLabels.map(day=>`<label><input type="checkbox" data-unavailable-weekday value="${day}" ${selected.includes(day)?'checked':''}>${day}</label>`).join('')}</div></details></div><label class="unavailable-field unavailable-mode-field">时段<select data-unavailable-mode aria-label="不可排时段类型"><option value="allDay" ${rule.allDay?'selected':''}>全天</option><option value="specific" ${rule.allDay?'':'selected'}>指定时段</option></select></label><div class="unavailable-time-inputs" data-unavailable-time-inputs ${rule.allDay?'hidden':''}><label class="unavailable-field">开始时间<input type="time" data-unavailable-start aria-label="不可排开始时间" value="${escapeHtml(rule.startTime||'')}"></label><label class="unavailable-field">结束时间<input type="time" data-unavailable-end aria-label="不可排结束时间" value="${escapeHtml(rule.endTime||'')}"></label></div><button type="button" data-remove-unavailable-time aria-label="删除不可排时段">×</button></div>`;
  }
  function unavailableTimeView(rule) {
    const field=(label,value)=>`<div class="unavailable-field"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`;
    return `<div class="unavailable-view-row">${field('开始日期',rule.dateFrom?dateLabel(rule.dateFrom):'策略开始日期')}${field('结束日期',rule.dateTo?dateLabel(rule.dateTo):'策略结束日期')}${field('星期',rule.weekdays?.length?rule.weekdays.join('、'):'每天')}${field('时段',rule.allDay?'全天':'指定时段')}${rule.allDay?'':`<div class="unavailable-time-inputs">${field('开始时间',rule.startTime||'--')}${field('结束时间',rule.endTime||'--')}</div>`}</div>`;
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
    return `<label data-course-day-cap ${enabled?'':'class="course-day-cap-disabled"'}>本课程每日课节上限<select data-course="${course.id}" data-segment="${index}" data-key="dayCap" ${state.editing&&enabled?'':'disabled'}>${options.map(option=>`<option value="${option}" ${value===option?'selected':''}>${option}节</option>`).join('')}</select></label>`;
  }
  function courseStructure(course) {
    const segments=state.draft.courses[course.id];
    const fallbackEnd=state.orderEndRule==='按开结课日期排课'?orderDates.end:'';
    const duration=courseLessonHours(course),last=courseFinalLessonHours(course);
    const lessonInfo=`<div class="course-lesson-info"><label>课程总课时<input value="${course.hours} 课时" disabled></label><label>课节时长<div class="course-lesson-duration"><input type="number" min="0.25" max="12" step="0.25" value="${duration}" data-course-lesson-hours="${course.id}" ${state.editing?'':'disabled'}><span>课时/节</span></div></label><label>总课节数<input value="${courseLessonTotal(course)} 节${last<duration?`（尾节 ${last} 课时）`:''}" disabled></label></div>`;
    return `<div class="structure-body">${lessonInfo}${segments.map((s,i)=>`<div class="requirement-strategy-pair"><div class="structured-segment"><div class="structured-segment-head"><strong>策略 ${i+1}</strong>${state.editing?`<button type="button" class="segment-delete-button" data-delete-strategy="${course.id}" data-strategy-index="${i}" ${segments.length===1?'disabled title="至少保留一条策略"':''}>删除策略</button>`:''}</div><div class="rule-grid">${dateRangeField(s.start,s.end,`data-course="${course.id}" data-segment="${i}"`,i===segments.length-1,i===segments.length-1&&s.completion!=='排完剩余课程'?fallbackEnd:'',i===0?orderDates.start:'')}${completionField(course,i,s.completion)}${completionSpecificFields(course,i,s)}${timeField(course,i,s)}${courseDayCapField(course,i,s)}</div>${restrictionModule(course,i,s)}</div></div>`).join('')}${state.editing?`<button type="button" class="course-add-strategy" data-add-strategy="${course.id}">＋ 添加策略</button>`:''}</div>`;
  }
  function addCourseStrategy(courseId) {
    const segments=state.draft.courses[courseId];
    const previous=segments.at(-1);
    if(!previous.end) {notify('请先填写当前策略的结束日期，再添加下一条策略');return;}
    const start=utcDate(previous.start||orderDates.start),end=utcDate(previous.end);
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
    previous.unavailableTimeRules=unavailableInRange(originalUnavailable,previous.start||orderDates.start,previous.end);
    next.unavailableTimeRules=unavailableInRange(originalUnavailable,next.start,next.end);
    segments.push(next);
    state.dirty=true;
    renderAnalysis();
    notify('已添加策略，请核对日期；最后一条策略的结束日期可留空');
  }
  function deleteCourseStrategy(courseId,index) {
    const segments=state.draft.courses[courseId];
    if(segments.length<=1) {notify('每门课程至少保留一条策略');return;}
    const [removed]=segments.splice(index,1);
    if(index===0) segments[0].start=removed.start;
    else segments[index-1].end=removed.end;
    state.dirty=true;
    renderAnalysis();
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
  function renderAnalysis() {
    if(!state.draft) state.draft=initialDraft();
    if(!state.aiSnapshot) state.aiSnapshot={ global:'学生每周总课节上限和学生每日总课节上限均无特殊要求，多课程采用交叉排课。', courses:Object.fromEntries(courses.map(c=>[c.id,c.ai])) };
    $('#wizardBody').innerHTML=`${scheduleTimezoneContext()}<section class="content-card analysis-section"><div class="content-card-header"><strong>全局排课策略</strong>${state.dirty?'<small>已修改 · 待校验</small>':''}</div><div class="content-card-inner"><div class="analysis-card"><div class="analysis-heading"><i>✦</i>排课要求AI分析结果</div><p>${escapeHtml(globalAnalysisSummary())}</p></div><details class="structure" ${state.editing?'open':''}><summary><span>排课策略</span></summary><div class="structure-body">${globalStructure()}</div></details></div></section>
      ${courses.map(c=>`<section class="content-card analysis-section"><div class="content-card-header"><div class="course-analysis-title"><strong>${c.name}</strong><span class="meta-chip">${c.hours}课时</span><span class="meta-chip">${courseLessonHours(c)}课时/节</span><span class="meta-chip">${courseLessonTotal(c)}节</span><span class="meta-chip">${c.mode}</span><span class="meta-chip">${c.campus}</span></div></div><div class="content-card-inner"><div class="analysis-card"><div class="analysis-heading"><i>✦</i>排课要求AI分析结果</div><p>${escapeHtml(state.aiSnapshot.courses[c.id])}</p></div><details class="structure" ${state.editing?'open':''}><summary><span>排课策略</span></summary>${courseStructure(c)}</details></div></section>`).join('')}`;
    $('#wizardFooter').innerHTML=`<button class="btn" data-back-supplement>补充排课要求</button><button class="btn btn-quiet" data-toggle-edit>${state.editing?'退出编辑':'编辑排课策略'}</button>${state.editing?'<button class="btn btn-primary" data-save-rules>校验并保存策略</button>':'<button class="btn btn-primary" data-recommend>生成学生排课计划并推荐教师</button>'}`;
  }
  function renderCandidate(course,teacher,specified=false) {
    const total=courseLessonTotal(course);
    const requirements=state.draft.courses[course.id];
    const hasFixed=requirements.some(segment=>rulesByType(segment,'固定').length);
    const hasPreferred=requirements.some(segment=>rulesByType(segment,'优先').length);
    const coverage=teacherCoverageSummary(course,teacher.name);
    const metrics=[`<span><b>${coverage.total}/${total}</b><small>总课节覆盖</small></span>`];
    if(hasFixed) metrics.push(`<span><b>${coverage.fixed}/${total}</b><small>固定时段覆盖</small></span>`);
    else if(hasPreferred) metrics.push(`<span><b>${coverage.preferred}/${total}</b><small>优先时段覆盖</small></span>`);
    const selected=specified||state.selected[course.id]===teacher.name;
    const status=teacherStatus(teacher.name);
    const statusTone=status==='引导'||status==='可排'?'ready':'warning';
    const action=specified?'<button class="btn choose-teacher" type="button" disabled>✓ 已指定为本课程老师</button>':`<button class="btn ${selected?'choose-teacher':'btn-quiet choose-teacher'}" data-select-candidate="${course.id}" data-teacher="${escapeHtml(teacher.name)}">${selected?'✓ 已选为本课程老师':'选择该老师'}</button>`;
    return `<article class="candidate ${selected?'selected':''} ${specified?'specified-candidate':''}" data-scheduling-status="${escapeHtml(status)}"><div class="candidate-title"><div><div class="candidate-name-row"><strong>${escapeHtml(teacher.name)}</strong><span class="teacher-status-tag ${statusTone}">${escapeHtml(status)}</span></div><div class="teacher-department">${teacherDepartment}</div></div><button type="button" class="teacher-load-button" data-view-teacher-load="${escapeHtml(teacher.name)}">查看</button></div><div class="candidate-metrics" style="--metric-count:${metrics.length}">${metrics.join('')}</div>${action}</article>`;
  }
  function renderCandidatesByStatus(course) {
    const ranked=rankCandidates(course).filter(teacher=>matchesTeacherRequirements(course,teacher.name));
    if(!ranked.length) return '<div class="empty-teacher">当前老师要求下暂无符合条件的推荐老师。请调整要求后重新推荐。</div>';
    return `<div class="candidate-status-groups">${teacherStatusOrder.map(status=>{
      const matching=ranked.filter(teacher=>teacherStatus(teacher.name)===status);
      return matching.length?`<div class="candidate-status-group" data-status="${escapeHtml(status)}"><div class="candidate-grid">${matching.map(teacher=>renderCandidate(course,teacher)).join('')}</div></div>`:'';
    }).join('')}</div>`;
  }
  function renderTeachers() {
    const selectedCount=courses.filter(c=>state.direct[c.id]||state.selected[c.id]).length;
    const editing=state.editingTeacherRequirements;
    $('#wizardBody').innerHTML=`${scheduleTimezoneContext()}<div class="teacher-selection-count"><span class="selection-summary">${editing?'正在修改老师要求，保存后重新展示推荐结果':`已选择 ${selectedCount} / ${courses.length} 门`}</span></div>
      ${courses.map(c=>{
        const direct=state.direct[c.id],expanded=state.expandedPlanCourseId===c.id,requirement=teacherRequirementFor(c);
        const teacherPanel=direct?`<div class="candidate-grid">${renderCandidate(c,{name:direct},true)}</div>`:editing?'':renderCandidatesByStatus(c);
        return `<section class="content-card teacher-course-card"><div class="content-card-header"><div><strong>${c.name}</strong><span class="meta-chip">${c.hours}课时 · 15节</span><span class="meta-chip">${escapeHtml(requirement.mode)} · ${escapeHtml(requirement.campus||'不限校区')}</span></div><div class="teacher-course-actions"><button class="btn btn-quiet" type="button" data-view-course-plan="${c.id}" aria-expanded="${expanded}" aria-controls="course-plan-${c.id}">${expanded?'收起学生排课计划':'查看学生排课计划'}</button></div></div>${teacherRequirementFields(c)}<div class="teacher-course-plan" id="course-plan-${c.id}" ${expanded?'':'hidden'}>${coursePlanList(c.id)}</div>${teacherPanel?`<div class="content-card-inner">${teacherPanel}</div>`:''}</section>`;
      }).join('')}`;
    $('#wizardFooter').innerHTML=state.editingTeacherRequirements?'<button class="btn" data-cancel-teacher-requirements>取消修改</button><button class="btn btn-primary" data-save-teacher-requirements>保存并重新推荐老师</button>':`<button class="btn" data-back-analysis>返回修改要求</button><button class="btn" data-edit-teacher-requirements>修改老师要求</button><button class="btn btn-primary" data-generate ${selectedCount<courses.length?'disabled':''}>联合排课并生成正式排课</button>`;
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
      escapeHtml(teacherDepartment),
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
    if(!endRules.includes(state.orderEndRule)) return '全单兜底排课规则无效';
    for(const course of courses) {
      const duration=Number(state.draft.courseLessonHours?.[course.id]);
      if(!Number.isFinite(duration)||duration<=0||Math.abs(duration*4-Math.round(duration*4))>1e-9) return `${course.name}的课节时长必须为大于0的0.25课时倍数`;
      if(!Number.isFinite(course.hours)||course.hours<=0||Math.abs(course.hours*4-Math.round(course.hours*4))>1e-9) return `${course.name}的课程总课时必须为0.25课时的倍数`;
    }
    for(const c of courses) for(let i=0;i<state.draft.courses[c.id].length;i++) {
      const s=state.draft.courses[c.id][i];
      const lastStrategy=i===state.draft.courses[c.id].length-1;
      const effectiveStart=s.start||(i===0?orderDates.start:'');
      const effectiveEnd=s.end||(lastStrategy&&state.orderEndRule==='按开结课日期排课'&&s.completion!=='排完剩余课程'?orderDates.end:'');
      if(!effectiveStart) return `${c.name}策略${i+1}请选择排课开始日期`;
      if(!lastStrategy&&!s.end) return `${c.name}策略${i+1}请选择排课结束日期；只有最后一条策略可留空`;
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
  function renderCompletedPlan() {
    const lessons=state.resultLessons;
    const courseResults=courses.map(course=>{
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
          const periodGap=finishedInPeriod?0:row.finish?Math.max(0,total-cumulative):Math.max(0,row.requiredMin-actual);
          return {actual,met,html:`<tr><td>${periodDate(row)}</td><td>${periodRequirement(row)}</td><td><strong>${expectedRange}</strong></td><td>${actual} 节</td><td class="${periodGap?'period-gap':''}">${periodGap} 节</td><td><span class="result-status ${met?'met':'unmet'}">${met?'完成':'未完成'}</span></td></tr>`};
        });
        const accounted=evaluatedRows.reduce((sum,row)=>sum+row.actual,0);
        const completedBefore=courseLessons.filter(item=>item[0]<requirement.start).length===total;
        const requirementMet=(evaluatedRows.length?evaluatedRows.every(row=>row.met):completedBefore)&&accounted===actualInRequirement;
        const periodRows=evaluatedRows.map(row=>row.html).join('');
        return `<details class="result-requirement"><summary class="result-requirement-head"><strong>排课计划 ${index+1}</strong><span>${requirement.end?`${dateLabel(requirement.start)}—${dateLabel(requirement.end)}`:`${dateLabel(requirement.start)} 起 · 排完全部课时结束`}</span><em class="result-status ${requirementMet?'met':'unmet'}">${requirementMet?'完成':'未完成'} 已排${actualInRequirement}节</em></summary>${planRuleLine(requirement,true)}${periodRows?`<div class="result-table-scroll"><table class="result-period-table"><thead><tr><th>排课日期</th><th>学生排课要求</th><th>本周期预计排课</th><th>本周期实际排课</th><th>本周期排课差额</th><th>完成状态</th></tr></thead><tbody>${periodRows}</tbody></table></div>`:'<div class="result-empty-period">本段暂无周期排课结果</div>'}</details>`;
      }).join('');
      const totalLabel=totalMet?'已完成':actualTotal<total?'未完成':'超出';
      const totalGap=Math.max(0,total-actualTotal);
      return `<section class="content-card result-course-card"><div class="content-card-header"><div class="course-analysis-title"><strong>${escapeHtml(course.name)}</strong><span class="meta-chip">授课老师：${escapeHtml(selectedTeacher(course))}</span></div><span class="result-status ${totalMet?'met':'unmet'}">${totalLabel} 已排${actualTotal}/${total}节${totalGap?` · 待补${totalGap}节`:''}</span></div><div class="content-card-inner">${requirementCards}</div></section>`;
    }).join('');
    $('#wizardBody').innerHTML=`${scheduleTimezoneContext()}${courseResults}`;
    $('#wizardFooter').innerHTML='<button class="btn" data-restart-plan>重新排课</button><button class="btn btn-primary" data-close>关闭</button>';
  }
  function resultSnapshot() {
    return copyData({draft:state.draft,orderDates,orderEndRule:state.orderEndRule,scheduleTimezone:state.scheduleTimezone,selected:state.selected,direct:state.direct,teacherRequirements:state.teacherRequirements,resultLessons:state.resultLessons,supplement:state.supplement,files:state.files,aiSnapshot:state.aiSnapshot,planMode:state.planMode,createdAt:state.currentPlanCreatedAt});
  }
  function restoreResultSnapshot(snapshot) {
    Object.assign(orderDates,defaultOrderDates,snapshot.orderDates||{});
    state.draft=normalizeDraft(snapshot.draft);
    state.orderEndRule=snapshot.orderEndRule||(
      Object.values(snapshot.courseBoundaries||{}).some(boundary=>boundary.endMode==='排完全部课时结束')?endRules[1]:endRules[0]
    );
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
  function createResultVersion() {
    const base=versionName(new Date());
    if(!state.currentPlanCreatedAt) state.currentPlanCreatedAt=base;
    const sameSecond=state.versions.filter(item=>item.name===base||item.name.startsWith(`${base}（`)).length;
    const name=sameSecond?`${base}（${sameSecond+1}）`:base;
    const planNo=Math.max(0,...state.versions.map(item=>Number(item.planNo)||0))+1;
    const version={id:`${Date.now()}-${state.versions.length}`,name,planNo,kind:state.planMode,createdAt:state.currentPlanCreatedAt,savedAt:base,snapshot:resultSnapshot()};
    state.versions.unshift(version);
    const persisted=persistVersions(state.versions);
    return {version,persisted};
  }
  function renderResult(reuseExisting=false) {
    closeWizard(); state.completed=true;
    document.body.classList.add('formal-page-active');
    $('#orderPage').hidden=true; $('#resultPage').hidden=false;
    if(!reuseExisting) {
      state.planMode='智能排课';
      state.currentPlanCreatedAt=versionName(new Date());
      state.resultLessons=copyData(demoResultLessons).filter(([date,,courseId])=>{
        const course=courses.find(item=>item.id===courseId);
        return course&&effectiveCourseRequirements(course).some(segment=>segment.start<=date&&(!segment.end||date<=segment.end));
      });
      state.activeVersionId=null;
    }
    const lessons=state.resultLessons;
    const classHours=courses.reduce((total,course)=>total+course.hours,0);
    const remainingHours=classHours-lessons.length*2;
    const dates=[...new Set(lessons.map(item=>item[0]))].sort();
    if(!dates.length) dates.push('2026-09-07','2026-09-08','2026-09-09','2026-09-10','2026-09-14','2026-09-15','2026-09-16');
    const times=[...new Set(lessons.map(item=>item[1]))].sort();
    if(!times.length) times.push('08:20-10:20','10:30-12:30','13:30-15:30','16:00-18:00','18:30-20:30');
    const scheduleTimes=[...new Set(['08:20-10:20','10:30-12:30','13:30-15:30','16:00-18:00','18:30-20:30',...times])].sort();
    const weekdays=['周日','周一','周二','周三','周四','周五','周六'];
    const weekday=date=>weekdays[new Date(`${date}T00:00:00Z`).getUTCDay()];
    const calendar=`<div class="formal-calendar-grid" style="--formal-day-count:${dates.length}"><div class="formal-calendar-head formal-calendar-corner"><span>日期</span><span>时间</span></div>${dates.map(date=>`<div class="formal-calendar-head">${date}<span>${weekday(date)}</span></div>`).join('')}${times.map(time=>`<div class="formal-time">${time.replace('-', ' ~ ')}</div>${dates.map(date=>{const item=lessons.find(row=>row[0]===date&&row[1]===time);if(!item)return '<div class="formal-calendar-cell"></div>';const course=courses.find(c=>c.id===item[2]);return `<div class="formal-calendar-cell"><article class="formal-lesson"><div class="formal-lesson-title"><strong>${escapeHtml(course.name)}</strong><span>${escapeHtml(plainName(selectedTeacher(course)))}</span></div><div class="formal-lesson-meta"><span class="formal-lesson-mode">${escapeHtml(course.mode)}</span><span>${course.mode==='线上'?'Classin':'鸿寿3F-D区-401'}</span></div><div class="formal-lesson-note">备注：--</div></article></div>`;}).join('')}`).join('')}</div>`;
    const teacherSchedule=`<table class="formal-teacher-table"><thead><tr><th>科目</th><th>教师姓名</th><th>上课时段</th>${dates.map(date=>`<th>${date}<small>(${weekday(date)})</small></th>`).join('')}<th>操作</th></tr></thead><tbody>${courses.map(course=>scheduleTimes.map((time,index)=>`<tr>${index===0?`<td class="formal-merged" rowspan="${scheduleTimes.length}"><div class="formal-course-teacher-cell"><span>${escapeHtml(course.name)}</span><button class="formal-add-teacher" type="button" data-formal-add-teacher="${course.id}"><span aria-hidden="true">＋</span> 添加教师</button></div></td><td class="formal-merged" rowspan="${scheduleTimes.length}">${escapeHtml(selectedTeacher(course))}</td>`:''}<td>${time}</td>${dates.map(date=>{const isLesson=lessons.some(row=>row[0]===date&&row[1]===time&&row[2]===course.id);return `<td class="formal-teacher-slot ${isLesson?'has-lesson':''}">${isLesson?`<span>${escapeHtml(course.name)}</span>`:''}</td>`;}).join('')}${index===0?`<td class="formal-merged" rowspan="${scheduleTimes.length}"><button class="formal-link-button" type="button">删除</button></td>`:''}</tr>`).join('')).join('')}</tbody></table>`;
    $('#resultPage').innerHTML=`<div class="formal-toolbar"><div class="formal-toolbar-left"><button class="formal-back" id="formalBack">‹ 返回</button><strong>排课单</strong><button id="formalRefresh">↻ 更新排课数据</button></div><div class="formal-toolbar-right"><button id="formalStudentPreview">预览学生课表</button><button class="primary" id="formalFinish">结束排课单</button></div></div>
      <section class="formal-order-card"><div class="formal-order-title"><strong>托福听说读写组合排课-1v1</strong><label class="formal-media-toggle"><input type="checkbox" disabled><span>优选多媒体</span></label></div><div class="formal-order-facts"><span>学生姓名：<strong>托福组合排课测试学生</strong></span><span>班级课时：<strong>${classHours}</strong></span><span>未排课时：<strong>${remainingHours}</strong></span><span>排课课程：${courses.map(c=>`<span class="formal-course-pill">${escapeHtml(c.name)}</span>`).join(' ')}</span></div></section>
      <section class="formal-workspace"><header class="formal-workspace-head"><h2>教师排课 <span class="formal-calendar-icon">▦</span></h2><div class="formal-head-actions"><button id="formalNewPlan">新增排课方案</button><button id="formalSwitchPlan" ${state.versions.length?'':'disabled'}>切换排课方案</button><button id="formalViewSchedule" ${state.planMode==='人工排课'?'disabled':''}>智能排课结果</button><button id="formalExportTeacherSchedule">导出教师课表</button><span class="formal-collapse">⌄</span></div></header><div class="formal-linked-teachers"><span>已关联教师：</span>${[...new Set(courses.map(c=>selectedTeacher(c)))].map(t=>`<span class="formal-teacher-chip">${escapeHtml(t)} ×</span>`).join('')}<div class="formal-legend"><span class="published">已发布</span><span class="pending">待发布</span><span class="change">待变更</span><span class="conflict">冲突</span></div></div>
      <div class="formal-actions"><button id="formalAddLesson">添加课程时间</button><button>冲突检测</button><button>冲突详情</button><button id="viewConfirmedRequirements">查看排课要求</button><button>查找可用课次</button><button>清除空白课次</button><button>回写班级</button><button>回写班级课表</button><button>查看回写记录</button><button>排课日志</button></div>
      <div class="formal-actions formal-batch-actions"><button class="formal-active-action">◉ 关闭批量操作</button><button>◯ 全选</button><button disabled>时间调整</button><button disabled>关联课程</button><button disabled>关联教师</button><button disabled>关联教室</button><button disabled>取消教室</button><button disabled>删除书课</button><button disabled>添加备注</button><button disabled>回写选中课次</button><button disabled>修改授课模式</button><button disabled>添加课号</button></div>
      <div class="formal-calendar-card"><div class="formal-calendar-scroll">${calendar}</div></div><div class="formal-panel-grip">↧</div>
      <section class="formal-bottom-panel"><header class="formal-workspace-head"><h2>教师日程 <span class="formal-calendar-icon">▦</span></h2><span class="formal-collapse">⌄</span></header><div class="formal-bottom-content"><div class="formal-schedule-tabs"><button class="active">日程总览</button><button>日程详情</button></div><div class="formal-bottom-filters"><label>日期<input value="${dates[0]}　至　${dates.at(-1)}" readonly></label><label>时段<input value="${scheduleTimes.join(';')}" readonly></label><label>星期<select><option>请选择</option></select></label><div class="formal-filter-actions"><button>重置</button><button class="primary">查询</button></div></div><div class="formal-calendar-legend"><strong>图例：</strong><span class="leave">老师有课</span><span class="rest">老师休假</span><span class="available">可排</span><span class="unavailable">不可排（未到排课时间）</span><span class="student">学生有课</span><span class="shared">老师&学生都有课</span><span class="selected">已选择</span><span class="new">新排</span></div><div class="formal-teacher-scroll">${teacherSchedule}</div></div></section></section>
      <footer class="formal-fixed-footer"><button id="formalCancel">取消</button><button class="primary" id="formalSubmit">提交</button></footer><div id="formalDialog" class="formal-dialog-backdrop" hidden></div><div id="teacherScheduleDrawer" class="teacher-schedule-backdrop" hidden></div>`;
    window.scrollTo({top:0,behavior:'smooth'});
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
    return `<table class="teacher-schedule-table" style="--schedule-day-count:${days.length}"><thead><tr class="teacher-schedule-weekdays"><th>时间</th>${days.map(day=>`<th>${weekdays[utcDate(day).getUTCDay()]}</th>`).join('')}</tr><tr class="teacher-schedule-dates"><th></th>${days.map(day=>`<th>${escapeHtml(day)}</th>`).join('')}</tr></thead><tbody>${times.map(time=>`<tr><th>${escapeHtml(time)}</th>${days.map(day=>`<td>${(cells.get(`${day}|${time}`)||[]).map(item=>`<div class="teacher-schedule-lesson"><strong>${escapeHtml(item.course.name)}</strong><span>${escapeHtml(item.room)}</span><span>${escapeHtml(plainName(teacherScheduleView.teacher))}</span><span>托福组合排课测试学生</span></div>`).join('')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
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
    const rows=[[title],[`时区：${teacherScheduleZones.find(([value])=>value===teacherScheduleView.timezone)?.[1]||''}`],['时间',...days.map(day=>`${weekdays[utcDate(day).getUTCDay()]} ${day}`)],...times.map(time=>[time,...days.map(day=>all.filter(item=>item.date===day&&item.time===time).map(item=>`${item.course.name}\n${item.room}\n${plainName(teacherScheduleView.teacher)}\n托福组合排课测试学生`).join('\n\n'))])];
    window.teacherScheduleExport.downloadExcel(rows,`${plainName(teacherScheduleView.teacher)}教师课表_${days[0]}_${days.at(-1)}.xlsx`);
  }

  function openFormalDialog(type,versionId) {
    const overlay=$('#formalDialog');
    if(!overlay) return;
    if(type==='new') {
      overlay.innerHTML=`<div class="formal-dialog-window" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">新增排课方案</strong><button data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body"><p>新增排课方案时，会自动将当前方案保存为一个版本。请选择新方案的排课方式。</p></div><footer><button data-formal-dialog-close>取消</button><button class="primary" data-formal-new-intelligent>智能排课</button><button class="primary" data-formal-new-manual>人工排课</button></footer></div>`;
    } else if(type==='switch') {
      if(!state.versions.length) return;
      if(!state.versions.some(item=>item.id===state.pendingPlanVersionId)) state.pendingPlanVersionId=state.activeVersionId||state.versions[0].id;
      overlay.innerHTML=`<div class="formal-dialog-window formal-switch-dialog" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">切换排课方案</strong><button data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body"><div class="formal-version-list"><table><thead><tr><th>方案编号</th><th>创建时间</th><th>保存时间</th><th>排课结果</th></tr></thead><tbody>${[...state.versions].sort((a,b)=>Number(a.planNo)-Number(b.planNo)).map(version=>`<tr tabindex="0" data-formal-version-row="${escapeHtml(version.id)}" class="${state.pendingPlanVersionId===version.id?'selected':''}"><td><span class="formal-plan-radio"></span>${version.planNo}</td><td>${escapeHtml(version.createdAt)}</td><td>${escapeHtml(version.savedAt)}</td><td><button data-formal-result-id="${escapeHtml(version.id)}">查看</button></td></tr>`).join('')}</tbody></table></div></div><footer><button data-formal-dialog-close>取消</button><button class="primary" data-formal-switch-confirm>确认切换方案</button></footer></div>`;
    } else if(type==='resultPreview') {
      const version=state.versions.find(item=>item.id===versionId);
      if(!version) return;
      const lessons=[...version.snapshot.resultLessons].sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
      const weekdays=['周日','周一','周二','周三','周四','周五','周六'];
      const dates=[...new Set(lessons.map(item=>item[0]))];
      const times=[...new Set(lessons.map(item=>item[1]))].sort();
      const weekday=date=>weekdays[new Date(`${date}T00:00:00Z`).getUTCDay()];
      const calendar=`<div class="formal-calendar-grid" style="--formal-day-count:${dates.length}"><div class="formal-calendar-head formal-calendar-corner"><span>日期</span><span>时间</span></div>${dates.map(date=>`<div class="formal-calendar-head">${escapeHtml(date)}<span>${weekday(date)}</span></div>`).join('')}${times.map(time=>`<div class="formal-time">${escapeHtml(time.replace('-', ' ~ '))}</div>${dates.map(date=>{const item=lessons.find(row=>row[0]===date&&row[1]===time);if(!item)return '<div class="formal-calendar-cell"></div>';const course=courses.find(c=>c.id===item[2]);if(!course)return '<div class="formal-calendar-cell"></div>';const teacher=version.snapshot.direct?.[course.id]||version.snapshot.selected?.[course.id]||'未选择';return `<div class="formal-calendar-cell"><article class="formal-lesson"><div class="formal-lesson-title"><strong>${escapeHtml(course.name)}</strong><span>${escapeHtml(plainName(teacher))}</span></div><div class="formal-lesson-meta"><span class="formal-lesson-mode">${escapeHtml(course.mode)}</span><span>${course.mode==='线上'?'Classin':'鸿寿3F-D区-401'}</span></div><div class="formal-lesson-note">备注：--</div></article></div>`;}).join('')}`).join('')}</div>`;
      overlay.innerHTML=`<div class="formal-dialog-window formal-result-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">方案${version.planNo} · 排课结果</strong><button data-formal-result-back aria-label="返回方案列表">×</button></header><div class="formal-dialog-body"><div class="formal-preview-summary"><span>创建时间：${escapeHtml(version.createdAt)}</span><span>保存时间：${escapeHtml(version.savedAt)}</span></div>${lessons.length?`<div class="formal-preview-calendar"><div class="formal-calendar-scroll">${calendar}</div></div>`:'<div class="formal-preview-empty">该方案暂无已排课节</div>'}</div><footer><button data-formal-result-back>返回方案列表</button></footer></div>`;
    } else if(type==='manualLesson') {
      overlay.innerHTML=`<div class="formal-dialog-window" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">添加课程时间</strong><button data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body formal-manual-fields"><label>课程<select id="formalManualCourse">${courses.map(course=>`<option value="${course.id}">${escapeHtml(course.name)}</option>`).join('')}</select></label><label>日期<input id="formalManualDate" type="date" value="2026-09-07"></label><label>时段<select id="formalManualTime">${['08:20-10:20','10:30-12:30','13:30-15:30','14:30-16:30','16:00-18:00','18:30-20:30'].map(time=>`<option value="${time}">${time}</option>`).join('')}</select></label></div><footer><button data-formal-dialog-close>取消</button><button class="primary" data-formal-manual-add>确认添加</button></footer></div>`;
    }
    overlay.hidden=false;
  }
  function closeFormalDialog() {
    const overlay=$('#formalDialog');
    if(overlay) {overlay.hidden=true;overlay.innerHTML='';}
  }
  document.addEventListener('keydown',event=>{
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
    const button=event.target.closest('button'); if(!button) return;
    if(button.hasAttribute('data-close-teacher-schedule')) {closeTeacherScheduleDrawer();return;}
    if(button.hasAttribute('data-query-teacher-schedule')) {queryTeacherSchedule();return;}
    if(button.hasAttribute('data-export-teacher-schedule')) {exportTeacherSchedule(button.dataset.exportTeacherSchedule);return;}
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
        if(state.selected[course.id]&&!matchesTeacherRequirements(course,state.selected[course.id])) {
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
    if(button.hasAttribute('data-view-course-plan')) {
      const courseId=button.dataset.viewCoursePlan;
      state.expandedPlanCourseId=state.expandedPlanCourseId===courseId?null:courseId;
      const scrollTop=$('#wizardBody').scrollTop;
      renderTeachers();
      $('#wizardBody').scrollTop=scrollTop;
      document.querySelector(`[data-view-course-plan="${courseId}"]`)?.focus();
      return;
    }
    if(button.id==='formalNewPlan') {openFormalDialog('new');return;}
    if(button.id==='formalSwitchPlan') {openFormalDialog('switch');return;}
    if(button.hasAttribute('data-formal-dialog-close')) {closeFormalDialog();return;}
    if(button.hasAttribute('data-formal-new-intelligent')) {
      const {version,persisted}=createResultVersion();
      state.activeVersionId=version.id;
      closeFormalDialog();
      renderResult(true);
      openWizard(1);
      notify(persisted?`当前方案已保存为方案${version.planNo}`:'当前方案仅保存在此页面，浏览器未允许持久保存');
      return;
    }
    if(button.hasAttribute('data-formal-new-manual')) {
      const {version,persisted}=createResultVersion();
      state.planMode='人工排课';
      state.resultLessons=[];
      state.currentPlanCreatedAt=versionName(new Date());
      state.activeVersionId=null;
      renderResult(true);
      notify(persisted?`方案${version.planNo}已保存，可在新方案中添加课程时间`:'当前方案仅保存在此页面，浏览器未允许持久保存');
      return;
    }
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
      state.activeVersionId=null;
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
    if(button.id==='startScheduling'||button.id==='restartScheduling') { openWizard(1); return; }
    if(button.id==='formalBack'||button.id==='formalCancel') { document.body.classList.remove('formal-page-active');$('#resultPage').hidden=true;$('#orderPage').hidden=false;return; }
    if(button.id==='formalRefresh') { notify('排课数据已更新（原型示意）');return; }
    if(button.id==='formalViewSchedule') { openWizard(4);return; }
    if(button.id==='formalExportTeacherSchedule') {Object.assign(teacherScheduleView,{teacher:'',timezone:'Asia/Shanghai',queried:false});renderTeacherScheduleDrawer();return;}
    if(button.id==='formalStudentPreview') { notify('学生课表预览需接入正式课节数据');return; }
    if(button.id==='formalFinish') { notify('原型演示未实际结束排课单');return; }
    if(button.id==='formalSubmit') { notify('原型演示未实际提交排课');return; }
    if(button.id==='viewConfirmedRequirements') { state.editing=false;openWizard(2);return; }
    if(button.id==='closeWizard'||button.hasAttribute('data-close')) {closeWizard();return;}
    if(button.hasAttribute('data-restart-plan')) {openWizard(1);return;}
    if(button.hasAttribute('data-pick-history')) {state.direct[button.dataset.pickHistory]=button.dataset.teacher;state.editingSpecifiedCourseId=null;refreshSupplement();return;}
    if(button.hasAttribute('data-change-specified')) {state.editingSpecifiedCourseId=button.dataset.changeSpecified;refreshSupplement();return;}
    if(button.hasAttribute('data-cancel-specified-change')) {state.editingSpecifiedCourseId=null;refreshSupplement();return;}
    if(button.hasAttribute('data-set-specified')) {
      const id=button.dataset.setSpecified;
      const teacher=resolveSpecifiedTeacher($(`[data-specified-input="${id}"]`).value);
      if(!teacher) {notify('请输入已有老师的姓名或工号，其他老师请填写姓名(工号)');return;}
      state.direct[id]=teacher;
      state.editingSpecifiedCourseId=null;
      refreshSupplement();
      return;
    }
    if(button.hasAttribute('data-clear-specified')) {delete state.direct[button.dataset.clearSpecified];state.editingSpecifiedCourseId=null;refreshSupplement();return;}
    if(button.hasAttribute('data-analyze')) {
      if(!orderDates.start) {notify('请选择开课日期');return;}
      if(state.orderEndRule===endRules[0]&&(!orderDates.end||orderDates.end<orderDates.start)) {notify('结课日期不能为空，且不能早于开课日期');return;}
      if(!validScheduleTimezone(state.scheduleTimezone)) {notify('请选择有效的上课时区（例如 Europe/London）');return;}
      const aiError=simulatedAiAnalysisError();
      state.aiAnalysisError='';
      setLoading('正在分析排课要求','识别全局与各科目要求，输出自然语言及结构化策略…',()=>{
        if(aiError?.kind==='TECHNICAL_FAILED') {state.step=1;renderWizard();notify(aiError.message);return;}
        if(aiError) { showAiAnalysisError(aiError.message); return; }
        state.editing=false;
        const simpleOnly=/^(按|按照)老师(的)?时间排课(即可|就可以|就行)?[。！!]?$/u.test(state.supplement.trim());
        state.draft=simpleOnly?simpleTeacherTimeDraft():initialDraft();
        state.aiSnapshot=simpleOnly?{global:'未提出额外全局限制；多课程按交叉排课软目标处理。',courses:Object.fromEntries(courses.map(course=>[course.id,`仅要求按老师可用时间排课，未指定学生时段。${state.orderEndRule===endRules[0]?`在有效开结课日期内按每周 ${state.draft.courses[course.id][0].frequencyMin}—${state.draft.courses[course.id][0].frequencyMax} 节尽量均匀安排；课程排满可提前结束。`:'无明确结课日期，默认每周 1—3 节，排完剩余课程结束。'}本课程每日课节上限默认 1 节。`]))}:null;
        state.coursePlans=null;
        state.dirty=false;
        state.recommended=false;
        state.selected={};
        openWizard(2);
      });
      return;
    }
    if(button.hasAttribute('data-back-supplement')) {openWizard(1);return;}
    if(button.hasAttribute('data-toggle-edit')) {state.editing=!state.editing;renderAnalysis();return;}
    if(button.hasAttribute('data-save-rules')) {const error=validateDraft();if(error){notify(error);return;}state.editing=false;state.dirty=false;state.coursePlans=null;state.recommended=false;state.selected={};renderAnalysis();notify('排课策略已保存');return;}
    if(button.hasAttribute('data-recommend')) {if(state.editing){notify('请先校验并保存策略');return;}const error=validateDraft();if(error){notify(error);return;}generateCoursePlans();state.selected={};setLoading('正在计算学生排课计划并推荐教师','按各周期要求与示例学生日程计算可排容量，再测算候选老师覆盖…',()=>{state.recommended=true;openWizard(3);});return;}
    if(button.hasAttribute('data-back-analysis')) {state.editing=false;openWizard(2);return;}
    if(button.hasAttribute('data-select-candidate')) {state.selected[button.dataset.selectCandidate]=button.dataset.teacher;renderTeachers();notify(`已选择 ${plainName(button.dataset.teacher)}`);return;}
    if(button.hasAttribute('data-generate')) {const missing=courses.find(c=>!state.direct[c.id]&&!state.selected[c.id]);if(missing){notify(`请先为${missing.name}选择老师`);return;}setLoading('正在生成排课方案','固定时段优先尝试、共用时段动态比较，冲突时前向检查并回退…',renderResult);}
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape') return;
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
    if(t.id==='supplementInput') state.supplement=t.value;
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
    const t=event.target;
    if(t.hasAttribute('data-course-lesson-hours')) {
      state.draft.courseLessonHours[t.dataset.courseLessonHours]=t.value;
      state.dirty=true;state.coursePlans=null;state.recommended=false;
      renderAnalysis();
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
    const zone=event.target.closest('#supplementDropZone');
    if(!zone) return;
    event.preventDefault();
    event.dataTransfer.dropEffect='copy';
    zone.classList.add('is-dragging');
  });
  document.addEventListener('dragleave',event=>{
    const zone=event.target.closest('#supplementDropZone');
    if(zone&&!zone.contains(event.relatedTarget)) zone.classList.remove('is-dragging');
  });
  document.addEventListener('drop',event=>{
    const zone=event.target.closest('#supplementDropZone');
    if(!zone) return;
    event.preventDefault();
    zone.classList.remove('is-dragging');
    appendSupplementFiles(event.dataTransfer.files);
  });
  renderOrder();
})();
