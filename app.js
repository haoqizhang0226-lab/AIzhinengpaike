(() => {
  'use strict';

  const orderText = '写作30课时：9月每周固定1节，固定周一18:30—20:30；10月、11月每周可排2—3节，优先周三、周四10:20—12:30；12月排完剩余课时。听力30课时：9月每周1—2节，优先周中08:20—12:20；10月每周1—2节，优先周三、周四10:30—12:30；12月排完剩余课时。口语30课时：9月每月3—4节，固定周二10:30—12:30；10月每月3—4节，优先周三、周四10:30—12:30；11月至12月每周1—2节，优先周六、周日08:20—10:20。阅读30课时：9月每两周1节，优先周二、周四14:30—16:30；10月、11月每月2—3节，优先周中14:30—16:30；12月排完剩余课时。10月1日至7日全天停排；10月8日至10日禁排早课（08:20—10:20）。';
  const courses = [
    { id:'writing', name:'托福-写作-线下', hours:30, mode:'线下', campus:'雅仕校区', tags:['疑难专家','循序善诱'], history:[['郑扬扬(VA000755)','当前'],['荷超(VA000144)','历史'],['崔昕瑜(VA001736)','历史']], ai:'9月每周固定1节，固定周一18:30—20:30。9月首周从周二开始，无周一固定时段，首周目标为0节；10—11月每周2—3节，优先周三、周四上午；12月排完剩余课节。', segments:[['2026-09-01','2026-09-30','每周固定1节','固定周一18:30—20:30'],['2026-10-08','2026-11-30','每周2—3节','优先周三、周四10:20—12:30'],['2026-12-01','2026-12-30','排完剩余课程','不限制']], funnel:[326,29,12,6,3], candidates:[
      { name:'郑扬扬(VA000755)', relation:'当前授课老师', slots:24, periods:[['9月固定周一',4,6],['10—11月周频次',7,11],['截止前累计',15,24]], preference:89, reason:'固定周一全部覆盖，最紧周期仍有2个可替换时段。' },
      { name:'荷超(VA000144)', relation:'历史授课老师', slots:22, periods:[['9月固定周一',4,5],['10—11月周频次',7,12],['截止前累计',15,22]], preference:94, reason:'全部周期可排，但9月固定时段余量仅1个。' },
      { name:'崔昕瑜(VA001736)', relation:'历史授课老师', slots:20, periods:[['9月固定周一',4,5],['10—11月周频次',7,10],['截止前累计',15,20]], preference:85, reason:'满足总量及频次；优先时段覆盖略低。' }
    ]},
    { id:'listening', name:'托福-听力-线下', hours:30, mode:'线下', campus:'雅仕校区', tags:['循序善诱','温柔耐心'], history:[['王紫(VA001968)','当前'],['崔昕瑜(VA001736)','历史'],['夏红微(VA002413)','历史']], ai:'9月和10月每周1—2节，优先上午。11—12月在剩余有效日期内排完课程总量；老师需覆盖每周最低课节和结课前累计课节。', segments:[['2026-09-01','2026-09-30','每周1—2节','优先周中08:20—12:20'],['2026-10-08','2026-10-31','每周1—2节','优先周三、周四10:30—12:30'],['2026-11-01','2026-12-30','排完剩余课程','不限制']], funnel:[326,34,15,7,3], candidates:[
      { name:'王紫(VA001968)', relation:'当前授课老师', slots:27, periods:[['9月自然周',1,3],['10月自然周',1,4],['截止前累计',15,27]], preference:92, reason:'各自然周最低要求均可覆盖，上午优先时段较充足。' },
      { name:'夏红微(VA002413)', relation:'历史授课老师', slots:25, periods:[['9月自然周',1,2],['10月自然周',1,4],['截止前累计',15,25]], preference:97, reason:'优先时段覆盖高；9月有一周的可替换时段较少。' },
      { name:'崔昕瑜(VA001736)', relation:'历史授课老师', slots:23, periods:[['9月自然周',1,2],['10月自然周',1,3],['截止前累计',15,23]], preference:84, reason:'能够排满课程，部分课节需使用普通可排时段。' }
    ]},
    { id:'speaking', name:'托福-口语-线下', hours:30, mode:'线下', campus:'雅仕校区', tags:['热情活泼','可全英文'], history:[['王紫(VA001968)','当前'],['姜雪竹(VA002901)','历史']], ai:'9月每月3—4节，周二10:30—12:30为固定时段；10月每月3—4节，优先周三、周四上午；11月至12月每周1—2节，优先周末早课。', segments:[['2026-09-01','2026-09-30','每月3—4节','固定周二10:30—12:30'],['2026-10-08','2026-10-31','每月3—4节','优先周三、周四10:30—12:30'],['2026-11-01','2026-12-30','每周1—2节','优先周六、周日08:20—10:20']], funnel:[326,31,13,5,3], candidates:[
      { name:'姜雪竹(VA002901)', relation:'历史授课老师', slots:23, periods:[['9月固定周二',4,6],['10月月频次',3,5],['11—12月周频次',1,3]], preference:91, reason:'每个固定周二均可授课，月频次与周频次均有安全余量。' },
      { name:'王紫(VA001968)', relation:'当前授课老师', slots:24, periods:[['9月固定周二',4,5],['10月月频次',3,7],['11—12月周频次',1,4]], preference:95, reason:'优先时段匹配高，但9月固定时段余量只有1个。' },
      { name:'崔昕瑜(VA001736)', relation:'', slots:21, periods:[['9月固定周二',4,5],['10月月频次',3,5],['11—12月周频次',1,3]], preference:83, reason:'可完成全量课程；周末优先时段覆盖较少。' }
    ]},
    { id:'reading', name:'托福-阅读-线下', hours:30, mode:'线下', campus:'雅仕校区', tags:['温柔耐心','疑难专家'], history:[['郑扬扬(VA000755)','当前'],['杨红艳(VA001642)','历史'],['姜雪竹(VA002901)','历史']], ai:'9月每两周1节，优先周二或周四14:30—16:30；10月、11月每月2—3节，优先工作日下午；12月排完剩余课程。双周以要求开始日期所在自然周为第一周，不拆成每周目标。', segments:[['2026-09-01','2026-09-30','每两周1节','优先周二、周四14:30—16:30'],['2026-10-08','2026-11-30','每月2—3节','优先周中14:30—16:30'],['2026-12-01','2026-12-30','排完剩余课程','不限制']], funnel:[326,27,11,5,3], candidates:[
      { name:'杨红艳(VA001642)', relation:'历史授课老师', slots:25, periods:[['9月自然双周',1,3],['10—11月自然月',2,5],['截止前累计',15,25]], preference:88, reason:'双周与月度最低要求均覆盖，最紧周期余量2个。' },
      { name:'郑扬扬(VA000755)', relation:'当前授课老师', slots:26, periods:[['9月自然双周',1,2],['10—11月自然月',2,5],['截止前累计',15,26]], preference:91, reason:'总交集较多，但首个双周只有1个可替换时段。' },
      { name:'姜雪竹(VA002901)', relation:'历史授课老师', slots:22, periods:[['9月自然双周',1,2],['10—11月自然月',2,4],['截止前累计',15,22]], preference:85, reason:'全程可排；部分下午优先时段需用普通时间替代。' }
    ]}
  ];

  const versionStorageKey='teacher-schedule-v7-versions';
  function loadVersions() {
    try {
      const saved=JSON.parse(localStorage.getItem(versionStorageKey)||'[]');
      if(!Array.isArray(saved)) return [];
      const valid=saved.filter(item=>item&&item.id&&item.name&&item.snapshot?.draft&&Array.isArray(item.snapshot.resultLessons));
      return valid.map((item,index)=>({...item,planNo:item.planNo||valid.length-index,kind:item.kind||item.snapshot.planMode||'智能排课',savedAt:item.savedAt||item.name}));
    } catch { return []; }
  }
  function persistVersions(versions) {
    try { localStorage.setItem(versionStorageKey,JSON.stringify(versions)); return true; }
    catch { return false; }
  }
  const copyData=value=>JSON.parse(JSON.stringify(value));
  const state = { step:1, supplement:'', files:[], direct:{}, selected:{}, editing:false, dirty:false, draft:null, aiSnapshot:null, coursePlans:null, expandedPlanCourseId:null, recommended:false, completed:false, resultLessons:[], versions:loadVersions(), activeVersionId:null, planMode:'智能排课', pendingPlanVersionId:null };
  const initialDraft = () => ({ global:{weekCap:'无特殊要求',dayCap:'无特殊要求',method:'交叉排课'}, availability:{
    fullDayStops:[{start:'2026-10-01',end:'2026-10-07'}],
    blockedSlots:[{start:'2026-10-08',end:'2026-10-10',from:'08:20',to:'10:20'}]
  }, courses:Object.fromEntries(courses.map(c=>[c.id,c.segments.map(s=>{
    const frequency=frequencySpec(s[2]);
    const time=parseTimeRequirement(s[3]);
    const segment={start:s[0],end:s[1],frequency:s[2],frequencyPeriod:frequency.period,frequencyMin:frequency.min||1,frequencyMax:frequency.max||1,lessonCount:'',weekCap:'无特殊要求',time:s[3],timeMode:time.mode,timeSlots:time.slots,completion:s[2]==='排完剩余课程'?'排完剩余课程':'按频次排课',dayCap:'1'};
    if(segment.completion==='按频次排课') segment.frequency=formatFrequency(segment);
    normalizeCourseDayCap(segment);
    return segment;
  })])) });
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
    draft.availability.fullDayStops ||= [];
    draft.availability.blockedSlots ||= [];
    return draft;
  }
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const displayDate = value => String(value ?? '').replaceAll('-','/');
  const plainName = name => String(name).replace(/\(.+\)/,'');
  const notify = message => { const t=$('#toast'); t.textContent=message; t.classList.add('show'); clearTimeout(notify.timer); notify.timer=setTimeout(()=>t.classList.remove('show'),2600); };
  const dateLabel = value => value.replaceAll('-','.');
  const avatar = '<span class="chat-avatar"><img src="ai-dialog-avatar.png" alt="AI助手"></span>';
  const rankCandidates = course => [...course.candidates].sort((a,b)=>{
    const minRatio = t => Math.min(...t.periods.filter(p=>p[1]>0).map(p=>(p[2]-p[1])/p[1]));
    const r = minRatio(b)-minRatio(a); if(r) return r;
    const minAbs = t => Math.min(...t.periods.map(p=>p[2]-p[1]));
    const m = minAbs(b)-minAbs(a); if(m) return m;
    const p=b.preference-a.preference; if(p) return p;
    return a.name.localeCompare(b.name,'zh-CN');
  });
  const tightPeriod = teacher => teacher.periods.reduce((worst,p)=>!worst || (p[2]-p[1])/p[1]<(worst[2]-worst[1])/worst[1] ? p : worst,null);

  function renderOrder() {
    $('#orderRequirementText').textContent=orderText;
  }
  function setLoading(title,description,callback) {
    $('#loadingTitle').textContent=title; $('#loadingDescription').textContent=description;
    $('#loadingBackdrop').hidden=false;
    setTimeout(()=>{ $('#loadingBackdrop').hidden=true; callback(); },1050);
  }
  function openWizard(step) { state.step=step; $('#modalBackdrop').hidden=false; renderWizard(); }
  function closeWizard() { $('#modalBackdrop').hidden=true; }
  function renderWizard() {
    const titles={1:'补充排课要求',2:'确认排课策略',3:'选择排课老师',4:'查看智能排课结果'};
    $('.wizard').dataset.step=String(state.step);
    $('#wizardTitle').textContent=titles[state.step];
    if(state.step===1) renderSupplement();
    else if(state.step===2) renderAnalysis();
    else if(state.step===3) renderTeachers();
    else renderCompletedPlan();
    $('#wizardBody').scrollTop=0;
  }
  function renderSupplement() {
    $('#wizardBody').innerHTML=`<div class="chat-row">${avatar}<div class="chat-bubble order-requirement-bubble"><strong>排课单中的排课要求</strong><p>${escapeHtml(orderText)}</p></div></div>
      <div class="chat-row">${avatar}<div class="chat-bubble"><strong>请确认是否指定排课老师</strong><div class="content-card" style="margin:12px 0 0">${courses.map(c=>`<div class="course-mini" data-course="${c.id}"><div class="course-mini-head"><strong>${c.name}</strong><span class="meta-chip">${c.hours}课时</span><span class="meta-chip">${c.hours/2}节</span><span class="meta-chip">${c.mode}</span><span class="meta-chip">${c.campus}</span>${c.tags.map(t=>`<span class="requirement-chip">${t}</span>`).join('')}</div><div class="teacher-line"><span>当前授课老师</span><div class="teacher-list">${c.history.filter(h=>h[1]==='当前').map(h=>`<button class="teacher-choice ${state.direct[c.id]===h[0]?'selected':''}" data-pick-history="${c.id}" data-teacher="${escapeHtml(h[0])}">${escapeHtml(h[0])}</button>`).join('')||'—'}</div></div><div class="teacher-line"><span>历史授课老师</span><div class="teacher-list">${c.history.filter(h=>h[1]==='历史').map(h=>`<button class="teacher-choice ${state.direct[c.id]===h[0]?'selected':''}" data-pick-history="${c.id}" data-teacher="${escapeHtml(h[0])}">${escapeHtml(h[0])}</button>`).join('')||'—'}</div></div><div class="teacher-line"><span>指定排课老师</span><input class="teacher-input" data-specified-input="${c.id}" placeholder="输入老师姓名或工号"><button class="btn" data-set-specified="${c.id}">指定</button>${state.direct[c.id]?`<span class="selected-spec">${escapeHtml(state.direct[c.id])} · 教务指定</span><button class="remove-spec" data-clear-specified="${c.id}" aria-label="删除指定老师">×</button>`:''}</div></div>`).join('')}</div></div></div>
      <div class="chat-row">${avatar}<div class="chat-bubble"><strong>补充排课要求</strong><textarea id="supplementInput" placeholder="可以输入文字、上传图片补充排课要求">${escapeHtml(state.supplement)}</textarea><div style="margin-top:10px"><label class="btn btn-quiet" style="display:inline-flex;align-items:center">＋ 上传沟通截图<input id="fileInput" type="file" accept="image/*" multiple hidden></label><span style="font-size:11px;color:#91a0b2;margin-left:10px">${state.files.length?state.files.map(escapeHtml).join('、'):'支持 JPG、PNG、WEBP'}</span></div></div></div>`;
    $('#wizardFooter').innerHTML='<button class="btn" data-close>取消</button><button class="btn btn-primary" data-analyze>AI分析排课要求</button>';
  }
  function field(label,value,attrs='') { return `<label>${label}<input ${attrs} value="${escapeHtml(value)}" ${state.editing?'':'disabled'}></label>`; }
  function dateRangeField(start,end,attrs) {
    if(!state.editing) return `<label class="date-range-field">排课日期<input value="${escapeHtml(displayDate(start))} - ${escapeHtml(displayDate(end))}" disabled></label>`;
    return `<label class="date-range-field">排课日期<div class="date-range-inputs"><input type="date" ${attrs} data-key="start" value="${escapeHtml(start)}" aria-label="排课开始日期"><span>-</span><input type="date" ${attrs} data-key="end" value="${escapeHtml(end)}" aria-label="排课结束日期"></div></label>`;
  }
  function globalSelect(label,key,value,options) {
    return `<label>${label}<select data-global-key="${key}" ${state.editing?'':'disabled'}>${options.map(option=>`<option value="${escapeHtml(option)}" ${value===option?'selected':''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
  }
  function globalStructure() {
    const global=state.draft.global;
    const limits=['无特殊要求',...Array.from({length:10},(_,i)=>String(i+1))];
    return `<div class="global-policy-card"><div class="rule-grid">${globalSelect('周排课上限','weekCap',global.weekCap,limits)}${globalSelect('日排课上限','dayCap',global.dayCap,limits)}${globalSelect('多课程排课方式','method',global.method,['随机排课','交叉排课'])}</div></div>`;
  }
  function globalAnalysisSummary() {
    const global=state.draft.global;
    return `周排课上限 ${global.weekCap}，日排课上限 ${global.dayCap}，多课程排课方式 ${global.method}。`;
  }
  const DAY=86400000;
  const utcDate=value=>new Date(`${value}T00:00:00Z`);
  const isoDate=date=>date.toISOString().slice(0,10);
  const daysBetween=(a,b)=>Math.round((b-a)/DAY)+1;
  const roundLessons=value=>value<=0?0:value<.5?1:Math.floor(value+.5);
  const isStoppedDay=day=>{
    return state.draft.availability.fullDayStops.some(stop=>stop.start<=day&&day<=stop.end);
  };
  const minutes=value=>{const [hour,minute]=value.split(':').map(Number);return hour*60+minute;};
  const isBlockedSlot=(day,start,end)=>isStoppedDay(day)||state.draft.availability.blockedSlots.some(slot=>slot.start<=day&&day<=slot.end&&start<minutes(slot.to)&&end>minutes(slot.from));
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
  const formatTimeRequirement=segment=>segment.timeMode==='常规'?'系统选择时段':`${segment.timeMode}${segment.timeSlots.map(slot=>`${slot.weekdays.join('、')}${slot.start}—${slot.end}`).join('；')}`;
  function effectiveDays(start,end) {
    let count=0;
    for(let t=start.getTime();t<=end.getTime();t+=DAY){const day=isoDate(new Date(t));if(!isStoppedDay(day))count++;}
    return count;
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
    if(requirement.timeMode!=='固定') return Infinity;
    let count=0;
    for(let t=start.getTime();t<=end.getTime();t+=DAY) {
      const date=new Date(t),day=isoDate(date),weekday=weekdayLabels[(date.getUTCDay()+6)%7];
      const intervals=requirement.timeSlots.filter(slot=>slot.weekdays.includes(weekday)&&/^\d{1,2}:\d{2}$/.test(slot.start)&&/^\d{1,2}:\d{2}$/.test(slot.end))
        .map(slot=>[minutes(slot.start),minutes(slot.end)])
        .filter(([from,to])=>from<to&&!isBlockedSlot(day,from,to))
        .sort((a,b)=>a[1]-b[1]);
      let lastEnd=-1,dayCount=0;
      for(const [from,to] of intervals) if(from>=lastEnd) {dayCount++;lastEnd=to;}
      count+=Math.min(dayCount,dailyCapacity);
    }
    return count;
  }
  function weeklyCapacity(requirement,start,end,dailyCapacity) {
    const weeklyLimit=Number(requirement.weekCap);
    let total=0;
    for(let cursor=new Date(start);cursor<=end;) {
      const [,weekEnd]=periodBounds(cursor,'week',requirement.start);
      const sliceEnd=weekEnd<end?weekEnd:end;
      const dayCapacity=effectiveDays(cursor,sliceEnd)*dailyCapacity;
      total+=Math.min(dayCapacity,fixedCapacity(requirement,cursor,sliceEnd,dailyCapacity),Number.isInteger(weeklyLimit)&&weeklyLimit>0?weeklyLimit:Infinity);
      cursor=new Date(sliceEnd.getTime()+DAY);
    }
    return total;
  }
  function strategyPlan(course) {
    const requirements=state.draft.courses[course.id];
    const buckets=[];
    const issues=[];
    for(const [index,requirement] of requirements.entries()) {
      const start=utcDate(requirement.start),end=utcDate(requirement.end);
      if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||start>end) continue;
      const dailyCapacity=Number(requirement.dayCap)||1;
      if(requirement.completion==='排完剩余课程'||requirement.completion==='按课节数排课') {
        const days=effectiveDays(start,end);
        const capacity=weeklyCapacity(requirement,start,end,dailyCapacity);
        if(requirement.completion==='按课节数排课') {
          const count=Number(requirement.lessonCount)||0;
          if(count>capacity) issues.push(`排课要求${index+1}最多可排${capacity}节，无法完成指定的${count}节`);
          buckets.push({index,start:requirement.start,end:requirement.end,days,min:count,max:count,count:true,finish:false});
        } else buckets.push({index,start:requirement.start,end:requirement.end,days,min:0,max:capacity,finish:true});
        continue;
      }
      const spec={period:requirement.frequencyPeriod,min:Number(requirement.frequencyMin),max:Number(requirement.frequencyMax)};
      for(let cursor=new Date(start);cursor<=end;) {
        const [periodStart,periodEnd]=periodBounds(cursor,spec.period,requirement.start);
        const sliceEnd=periodEnd<end?periodEnd:end;
        const days=effectiveDays(cursor,sliceEnd);
        const denominator=daysBetween(periodStart,periodEnd);
        const capacity=fixedCapacity(requirement,cursor,sliceEnd,dailyCapacity);
        const min=Math.min(capacity,days*dailyCapacity,roundLessons(spec.min*days/denominator));
        const max=Math.max(min,Math.min(capacity,days*dailyCapacity,roundLessons(spec.max*days/denominator)));
        buckets.push({index,start:isoDate(cursor),end:isoDate(sliceEnd),days,min,max,finish:false});
        cursor=new Date(sliceEnd.getTime()+DAY);
      }
    }
    const futureMax=Array(buckets.length+1).fill(0);
    for(let i=buckets.length-1;i>=0;i--) futureMax[i]=futureMax[i+1]+buckets[i].max;
    const rows=[];
    let remaining=course.hours/2;
    for(let i=0;i<buckets.length;i++) {
      const bucket=buckets[i];
      if(remaining<=0) {if(bucket.count&&bucket.min>0) issues.push(`排课要求${bucket.index+1}的指定节数超过课程总节数`);continue;}
      if(bucket.count&&bucket.min>remaining) issues.push(`排课要求${bucket.index+1}的指定节数超过课程剩余${remaining}节`);
      // Do not simply take every period's minimum: reserve enough lessons for the future maximum capacity.
      const futureShortfall=Math.max(0,remaining-futureMax[i+1]);
      const target=bucket.count?Math.min(remaining,bucket.min):bucket.finish?Math.min(remaining,bucket.max):Math.min(remaining,bucket.max,Math.max(bucket.min,futureShortfall));
      rows.push({...bucket,target});
      remaining-=target;
    }
    return {rows,remaining,issues};
  }
  function planRuleLine(requirement) {
    const frequency=requirement.completion==='按频次排课'?`<span>${escapeHtml(requirement.frequency)}</span>`:'';
    const lessonCount=requirement.completion==='按课节数排课'?`<span>排课课节数 ${escapeHtml(requirement.lessonCount)}节</span>`:'';
    const weekCap=requirement.completion!=='按频次排课'?`<span>周排课上限 ${escapeHtml(requirement.weekCap||'无特殊要求')}${requirement.weekCap&&requirement.weekCap!=='无特殊要求'?'节':''}</span>`:'';
    return `<div class="result-rule-line"><span>${escapeHtml(requirement.completion)}</span>${frequency}${lessonCount}${weekCap}<span>${escapeHtml(requirement.time)}</span><span>单科日上限 ${escapeHtml(requirement.dayCap)} 节</span></div>`;
  }
  function coursePlanList(courseId) {
    const plan=state.coursePlans?.[courseId];
    if(!plan) return '<div class="strategy-notice">请先生成排课计划</div>';
    const requirements=state.draft.courses[courseId];
    return requirements.map((requirement,index)=>{
      const rows=plan.rows.filter(row=>row.index===index);
      if(!rows.length) return '';
      return `<div class="result-requirement teacher-plan-section"><div class="teacher-plan-heading"><strong>排课计划 ${index+1}</strong><span>${dateLabel(requirement.start)}—${dateLabel(requirement.end)}</span></div>${planRuleLine(requirement)}<div class="result-table-scroll"><table class="result-period-table"><thead><tr><th>排期日期</th><th>有效排课天数</th><th>本周期预计排课</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${dateLabel(row.start)}—${dateLabel(row.end)}</td><td>${row.days}天</td><td><strong>${row.finish?'排完剩余课程':row.count?`${row.min} 节`:`${row.min}—${row.max} 节`}</strong></td></tr>`).join('')}</tbody></table></div></div>`;
    }).join('')||'<div class="strategy-notice">当前策略没有可执行的排课日期</div>';
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
    if(!state.editing) return `<label>周排课上限<input value="${escapeHtml(value==='无特殊要求'?value:`${value}节`)}" disabled></label>`;
    const options=['无特殊要求',...Array.from({length:10},(_,i)=>String(i+1))];
    return `<label>周排课上限<select data-course="${course.id}" data-segment="${index}" data-key="weekCap">${options.map(option=>`<option value="${option}" ${value===option?'selected':''}>${option==='无特殊要求'?option:`${option}节`}</option>`).join('')}</select></label>`;
  }
  function completionSpecificFields(course,index,segment) {
    const fields=segment.completion==='按频次排课'?frequencyField(course,index,segment):`${segment.completion==='按课节数排课'?lessonCountField(course,index,segment):''}${weekCapField(course,index,segment)}`;
    return `<div class="completion-specific-fields" data-completion-fields>${fields}</div>`;
  }
  function timeSlotRow(slot) {
    return `<div class="course-time-slot-row" data-time-slot-row><details class="weekday-picker" data-weekday-picker><summary><span data-weekday-summary>${slot.weekdays.length?slot.weekdays.join('、'):'选择星期'}</span></summary><div class="weekday-options">${weekdayLabels.map(day=>`<label><input type="checkbox" data-time-weekday value="${day}" ${slot.weekdays.includes(day)?'checked':''}>${day}</label>`).join('')}</div></details><input type="time" value="${escapeHtml(slot.start)}" data-time-start aria-label="开始时间"><i>—</i><input type="time" value="${escapeHtml(slot.end)}" data-time-end aria-label="结束时间"><button type="button" data-remove-time-slot aria-label="删除时段">×</button></div>`;
  }
  function timeField(course,index,segment) {
    if(!state.editing) return field('上课时段',segment.time);
    return `<div class="course-rule-control time-rule-control" data-time-control data-course="${course.id}" data-segment="${index}"><span>上课时段</span><select data-time-mode aria-label="时段类型">${['固定','优先','常规'].map(mode=>`<option value="${mode}" ${segment.timeMode===mode?'selected':''}>${mode}</option>`).join('')}</select><div class="course-time-slot-editor" data-time-slot-editor ${segment.timeMode==='常规'?'hidden':''}><div class="course-time-slot-list" data-time-slot-list>${segment.timeSlots.map(timeSlotRow).join('')}</div><button type="button" class="course-add-time-slot" data-add-time-slot>＋ 添加时段</button></div><div class="course-regular-time" data-regular-time ${segment.timeMode==='常规'?'':'hidden'}>系统选择时段</div></div>`;
  }
  const courseDayCapBounds=segment=>{
    if(segment.completion==='排完剩余课程') return {min:1,max:10};
    if(segment.completion==='按课节数排课') {
      const count=Number(segment.lessonCount);
      return {min:1,max:Number.isInteger(count)&&count>0?Math.min(10,count):10};
    }
    const min=Number(segment.frequencyMin),max=Number(segment.frequencyMax);
    return Number.isInteger(min)&&Number.isInteger(max)&&min>=1&&max>=min?{min,max}:null;
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
    return `<label data-course-day-cap ${enabled?'':'class="course-day-cap-disabled"'}>日排课上限<select data-course="${course.id}" data-segment="${index}" data-key="dayCap" ${state.editing&&enabled?'':'disabled'}>${options.map(option=>`<option value="${option}" ${value===option?'selected':''}>${option}节</option>`).join('')}</select></label>`;
  }
  function courseStructure(course) {
    return `<div class="structure-body">${state.draft.courses[course.id].map((s,i)=>`<div class="requirement-strategy-pair"><div class="structured-segment"><strong>策略 ${i+1}</strong><div class="rule-grid">${dateRangeField(s.start,s.end,`data-course="${course.id}" data-segment="${i}"`)}${completionField(course,i,s.completion)}${completionSpecificFields(course,i,s)}${timeField(course,i,s)}${courseDayCapField(course,i,s)}</div></div></div>`).join('')}</div>`;
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
    segment.timeMode=control.querySelector('[data-time-mode]').value;
    segment.timeSlots=[...control.querySelectorAll('[data-time-slot-row]')].map(row=>{
      const weekdays=[...row.querySelectorAll('[data-time-weekday]:checked')].map(input=>input.value);
      row.querySelector('[data-weekday-summary]').textContent=weekdays.length?weekdays.join('、'):'选择星期';
      return {weekdays,start:row.querySelector('[data-time-start]').value,end:row.querySelector('[data-time-end]').value};
    });
    segment.time=formatTimeRequirement(segment);
    state.dirty=true;
  }
  function renderAnalysis() {
    if(!state.draft) state.draft=initialDraft();
    if(!state.aiSnapshot) state.aiSnapshot={ global:'周排课上限和日排课上限均无特殊要求，多课程采用交叉排课。', courses:Object.fromEntries(courses.map(c=>[c.id,c.ai])) };
    $('#wizardBody').innerHTML=`<section class="content-card analysis-section"><div class="content-card-header"><strong>全局排课策略</strong>${state.dirty?'<small>已修改 · 待校验</small>':''}</div><div class="content-card-inner"><div class="analysis-card"><div class="analysis-heading"><i>✦</i>排课要求AI分析结果</div><p>${escapeHtml(globalAnalysisSummary())}</p></div><details class="structure" ${state.editing?'open':''}><summary><span>排课策略</span></summary><div class="structure-body">${globalStructure()}</div></details></div></section>
      ${courses.map(c=>`<section class="content-card analysis-section"><div class="content-card-header"><div class="course-analysis-title"><strong>${c.name}</strong><span class="meta-chip">${c.hours}课时</span><span class="meta-chip">2小时/节</span><span class="meta-chip">${c.hours/2}节</span><span class="meta-chip">${c.mode}</span><span class="meta-chip">${c.campus}</span></div></div><div class="content-card-inner"><div class="analysis-card"><div class="analysis-heading"><i>✦</i>排课要求AI分析结果</div><p>${escapeHtml(state.aiSnapshot.courses[c.id])}</p></div><details class="structure" ${state.editing?'open':''}><summary><span>排课策略</span></summary>${courseStructure(c)}</details></div></section>`).join('')}`;
    $('#wizardFooter').innerHTML=`<button class="btn" data-back-supplement>补充排课要求</button><button class="btn btn-quiet" data-toggle-edit>${state.editing?'退出编辑':'编辑排课策略'}</button>${state.editing?'<button class="btn btn-primary" data-save-rules>校验并保存策略</button>':'<button class="btn btn-primary" data-recommend>生成排课计划并推荐排课教师</button>'}`;
  }
  function renderCandidate(course,teacher) {
    const total=course.hours/2;
    const requirements=state.draft.courses[course.id];
    const hasFixed=requirements.some(segment=>segment.timeMode==='固定');
    const hasPreferred=requirements.some(segment=>segment.timeMode==='优先');
    const fixedPeriod=teacher.periods.find(period=>period[0].includes('固定'));
    const fixedCovered=Math.min(total,fixedPeriod?fixedPeriod[2]:Math.round(total*teacher.preference/100));
    const preferredCovered=Math.min(total,Math.round(total*teacher.preference/100));
    const metrics=[`<span><b>${total}/${total}</b><small>总课节覆盖</small></span>`];
    if(hasFixed) metrics.push(`<span><b>${fixedCovered}/${total}</b><small>固定时段覆盖</small></span>`);
    else if(hasPreferred) metrics.push(`<span><b>${preferredCovered}/${total}</b><small>优先时段覆盖</small></span>`);
    const selected=state.selected[course.id]===teacher.name;
    return `<article class="candidate ${selected?'selected':''}"><div class="candidate-title"><div><strong>${escapeHtml(teacher.name)}</strong>${teacher.relation?`<div class="relation">${escapeHtml(teacher.relation)}</div>`:''}</div></div><div class="candidate-metrics" style="--metric-count:${metrics.length}">${metrics.join('')}</div><button class="btn ${selected?'choose-teacher':'btn-quiet choose-teacher'}" data-select-candidate="${course.id}" data-teacher="${escapeHtml(teacher.name)}">${selected?'✓ 已选为本课程老师':'选择该老师'}</button></article>`;
  }
  function renderTeachers() {
    const selectedCount=courses.filter(c=>state.direct[c.id]||state.selected[c.id]).length;
    $('#wizardBody').innerHTML=`<div class="teacher-selection-count"><span class="selection-summary">已选择 ${selectedCount} / ${courses.length} 门</span></div>
      ${courses.map(c=>{const direct=state.direct[c.id],expanded=state.expandedPlanCourseId===c.id;return `<section class="content-card teacher-course-card"><div class="content-card-header"><div><strong>${c.name}</strong><span class="meta-chip">${c.hours}课时 · 15节</span><span class="meta-chip">${c.mode} · ${c.campus}</span>${c.tags.map(t=>`<span class="requirement-chip">${t}</span>`).join('')}</div><div class="teacher-course-actions"><button class="btn btn-quiet" type="button" data-view-course-plan="${c.id}" aria-expanded="${expanded}" aria-controls="course-plan-${c.id}">${expanded?'收起排课计划':'查看排课计划'}</button></div></div><div class="teacher-course-plan" id="course-plan-${c.id}" ${expanded?'':'hidden'}>${coursePlanList(c.id)}</div><div class="content-card-inner">${direct?`<div class="specified-card"><strong>${escapeHtml(direct)}</strong><span class="specified-selected">✓ 已选为本课程老师</span></div>`:`<div class="candidate-grid">${rankCandidates(c).map(t=>renderCandidate(c,t)).join('')}</div>`}</div></section>`}).join('')}`;
    $('#wizardFooter').innerHTML=`<button class="btn" data-back-analysis>返回修改要求</button><button class="btn btn-primary" data-generate ${selectedCount<courses.length?'disabled':''}>联合排课并生成正式排课</button>`;
  }
  function validateDraft() {
    const global=state.draft.global;
    const validLimit=value=>value==='无特殊要求'||Number.isInteger(Number(value))&&Number(value)>=1&&Number(value)<=10;
    if(!validLimit(global.weekCap)||!validLimit(global.dayCap)) return '全局排课上限无效';
    if(!['随机排课','交叉排课'].includes(global.method)) return '多课程排课方式无效';
    for(const c of courses) for(let i=0;i<state.draft.courses[c.id].length;i++) {
      const s=state.draft.courses[c.id][i];
      if(!s.start||!s.end||s.start>s.end) return `${c.name}排课要求${i+1}的日期无效`;
      if(i>0&&s.start<=state.draft.courses[c.id][i-1].end) return `${c.name}排课要求${i}与${i+1}的日期不能重叠`;
      if(!s.time?.trim()) return `${c.name}排课要求${i+1}的上课时段未填写`;
      if(s.completion==='按频次排课') {
        if(!frequencyPeriods[s.frequencyPeriod]) return `${c.name}排课要求${i+1}的上课周期无效`;
        if(!Number.isInteger(s.frequencyMin)||!Number.isInteger(s.frequencyMax)||s.frequencyMin<1||s.frequencyMax<s.frequencyMin) return `${c.name}排课要求${i+1}的频次范围无效`;
      } else if(s.completion==='按课节数排课') {
        if(!/^\d+$/.test(String(s.lessonCount))||!Number.isSafeInteger(Number(s.lessonCount))||Number(s.lessonCount)<1||Number(s.lessonCount)>c.hours/2) return `${c.name}排课要求${i+1}的课节数应为1至${c.hours/2}的整数`;
      } else if(s.completion!=='排完剩余课程') return `${c.name}排课要求${i+1}的排课类型无效`;
      const weekCap=s.weekCap||'无特殊要求';
      if(s.completion!=='按频次排课'&&weekCap!=='无特殊要求'&&(!Number.isInteger(Number(weekCap))||Number(weekCap)<1||Number(weekCap)>10)) return `${c.name}排课要求${i+1}的周排课上限无效`;
      const dayBounds=courseDayCapBounds(s);
      if(!dayBounds||!Number.isInteger(Number(s.dayCap))||Number(s.dayCap)<dayBounds.min||Number(s.dayCap)>dayBounds.max) return `${c.name}排课要求${i+1}的日排课上限无效`;
      if(s.timeMode!=='常规') {
        if(!s.timeSlots.length) return `${c.name}排课要求${i+1}请至少添加一个上课时段`;
        if(s.timeSlots.some(slot=>!slot.weekdays.length||slot.weekdays.some(day=>!weekdayLabels.includes(day))||!/^\d{2}:\d{2}$/.test(slot.start)||!/^\d{2}:\d{2}$/.test(slot.end)||minutes(slot.start)>=minutes(slot.end))) return `${c.name}排课要求${i+1}的星期或时段无效`;
      }
    }
    return '';
  }
  function generateCoursePlans() {
    const plans=Object.fromEntries(courses.map(course=>[course.id,strategyPlan(course)]));
    for(const course of courses) {
      const plan=plans[course.id];
      if(plan.issues.length) return `${course.name}${plan.issues[0]}`;
      if(plan.remaining>0) return `${course.name}按当前策略仍有课节无法分配，请调整日期、课节数或上限`;
    }
    state.coursePlans=plans;
    state.expandedPlanCourseId=null;
    return '';
  }
  function selectedTeacher(course) { return state.direct[course.id]||state.selected[course.id]||'未选择'; }
  function renderCompletedPlan() {
    const lessons=state.resultLessons;
    const courseResults=courses.map(course=>{
      const total=course.hours/2;
      const courseLessons=lessons.filter(item=>item[2]===course.id);
      const actualTotal=courseLessons.length;
      const totalMet=actualTotal===total;
      const plan=strategyPlan(course);
      const requirementCards=state.draft.courses[course.id].map((requirement,index)=>{
        const actualInRequirement=courseLessons.filter(item=>requirement.start<=item[0]&&item[0]<=requirement.end).length;
        const evaluatedRows=plan.rows.filter(row=>row.index===index).map(row=>{
          const actual=courseLessons.filter(item=>row.start<=item[0]&&item[0]<=row.end).length;
          const cumulative=courseLessons.filter(item=>item[0]<=row.end).length;
          const met=row.finish?cumulative===total:actual>=row.min&&actual<=row.max;
          const expected=row.finish?`截至本段排满 ${total} 节`:row.count?`${row.min} 节`:`${row.min}—${row.max} 节`;
          return {actual,met,html:`<tr><td>${dateLabel(row.start)}—${dateLabel(row.end)}</td><td>${expected}</td><td><strong>${actual} 节</strong></td><td><span class="result-status ${met?'met':'unmet'}">${met?'完成':'未完成'}</span></td></tr>`};
        });
        const accounted=evaluatedRows.reduce((sum,row)=>sum+row.actual,0);
        const completedBefore=courseLessons.filter(item=>item[0]<requirement.start).length===total;
        const requirementMet=(evaluatedRows.length?evaluatedRows.every(row=>row.met):completedBefore)&&accounted===actualInRequirement;
        const periodRows=evaluatedRows.map(row=>row.html).join('');
        return `<details class="result-requirement"><summary class="result-requirement-head"><strong>排课计划 ${index+1}</strong><span>${dateLabel(requirement.start)}—${dateLabel(requirement.end)}</span><em class="result-status ${requirementMet?'met':'unmet'}">${requirementMet?'完成':'未完成'} 已排${actualInRequirement}节</em></summary>${planRuleLine(requirement)}${periodRows?`<div class="result-table-scroll"><table class="result-period-table"><thead><tr><th>排课日期</th><th>本周期预计排课</th><th>本周期实际排课</th><th>完成情况</th></tr></thead><tbody>${periodRows}</tbody></table></div>`:'<div class="result-empty-period">本段暂无周期排课结果</div>'}</details>`;
      }).join('');
      const totalLabel=totalMet?'已完成':actualTotal<total?'未完成':'超出';
      return `<section class="content-card result-course-card"><div class="content-card-header"><div class="course-analysis-title"><strong>${escapeHtml(course.name)}</strong><span class="meta-chip">授课老师：${escapeHtml(selectedTeacher(course))}</span></div><span class="result-status ${totalMet?'met':'unmet'}">${totalLabel} 已排${actualTotal}/${total}节</span></div><div class="content-card-inner">${requirementCards}</div></section>`;
    }).join('');
    $('#wizardBody').innerHTML=courseResults;
    $('#wizardFooter').innerHTML='<button class="btn" data-restart-plan>重新排课</button><button class="btn btn-primary" data-close>关闭</button>';
  }
  function resultSnapshot() {
    return copyData({draft:state.draft,selected:state.selected,direct:state.direct,resultLessons:state.resultLessons,supplement:state.supplement,files:state.files,aiSnapshot:state.aiSnapshot,planMode:state.planMode});
  }
  function restoreResultSnapshot(snapshot) {
    state.draft=normalizeDraft(snapshot.draft);
    state.coursePlans=null;
    state.expandedPlanCourseId=null;
    state.selected=copyData(snapshot.selected||{});
    state.direct=copyData(snapshot.direct||{});
    state.resultLessons=copyData(snapshot.resultLessons);
    state.supplement=snapshot.supplement||'';
    state.files=copyData(snapshot.files||[]);
    state.aiSnapshot=copyData(snapshot.aiSnapshot||null);
    state.planMode=snapshot.planMode||'智能排课';
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
    const sameSecond=state.versions.filter(item=>item.name===base||item.name.startsWith(`${base}（`)).length;
    const name=sameSecond?`${base}（${sameSecond+1}）`:base;
    const planNo=Math.max(0,...state.versions.map(item=>Number(item.planNo)||0))+1;
    const version={id:`${Date.now()}-${state.versions.length}`,name,planNo,kind:state.planMode,savedAt:base,snapshot:resultSnapshot()};
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
      state.resultLessons=[
        ...['2026-09-07','2026-09-14','2026-09-21','2026-09-28'].map(date=>[date,'18:30-20:30','writing']),
        ...['2026-10-15','2026-10-22'].map(date=>[date,'10:20-12:30','writing']),
        ...['2026-09-02','2026-09-09','2026-09-16','2026-09-23','2026-09-30','2026-10-14','2026-10-21','2026-10-28','2026-11-04','2026-11-11','2026-11-18','2026-11-25','2026-12-02','2026-12-09'].map(date=>[date,'08:20-10:20','listening']),
        ['2026-10-08','10:30-12:30','listening'],
        ...['2026-09-01','2026-09-08','2026-09-15','2026-09-22','2026-10-20'].map(date=>[date,'10:30-12:30','speaking']),
        ...['2026-09-03','2026-09-17','2026-09-29'].map(date=>[date,'14:30-16:30','reading'])
      ].sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
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
    const calendar=`<div class="formal-calendar-grid" style="--formal-day-count:${dates.length}"><div class="formal-calendar-head formal-calendar-corner"><span>日期</span><span>时间</span></div>${dates.map(date=>`<div class="formal-calendar-head">${date}<span>${weekday(date)}</span></div>`).join('')}${times.map(time=>`<div class="formal-time">${time.replace('-', ' ~ ')}</div>${dates.map(date=>{const item=lessons.find(row=>row[0]===date&&row[1]===time);if(!item)return '<div class="formal-calendar-cell"></div>';const course=courses.find(c=>c.id===item[2]);return `<div class="formal-calendar-cell"><article class="formal-lesson"><strong>${escapeHtml(course.name)}</strong><span>${escapeHtml(selectedTeacher(course))}</span><span>${escapeHtml(course.campus)} · 2课时</span><span>备注：--</span><em>${escapeHtml(course.mode)}</em></article></div>`;}).join('')}`).join('')}</div>`;
    const teacherSchedule=`<table class="formal-teacher-table"><thead><tr><th>科目</th><th>教师姓名</th><th>上课时段</th>${dates.map(date=>`<th>${date}<small>(${weekday(date)})</small></th>`).join('')}<th>操作</th></tr></thead><tbody>${courses.map(course=>scheduleTimes.map((time,index)=>`<tr>${index===0?`<td class="formal-merged" rowspan="${scheduleTimes.length}"><div class="formal-course-teacher-cell"><span>${escapeHtml(course.name)}</span><button class="formal-add-teacher" type="button" data-formal-add-teacher="${course.id}"><span aria-hidden="true">＋</span> 添加教师</button></div></td><td class="formal-merged" rowspan="${scheduleTimes.length}">${escapeHtml(selectedTeacher(course))}</td>`:''}<td>${time}</td>${dates.map(date=>{const isLesson=lessons.some(row=>row[0]===date&&row[1]===time&&row[2]===course.id);return `<td class="formal-teacher-slot ${isLesson?'has-lesson':''}">${isLesson?`<span>${escapeHtml(course.name)}</span>`:''}</td>`;}).join('')}${index===0?`<td class="formal-merged" rowspan="${scheduleTimes.length}"><button class="formal-link-button" type="button">删除</button></td>`:''}</tr>`).join('')).join('')}</tbody></table>`;
    $('#resultPage').innerHTML=`<div class="formal-toolbar"><div class="formal-toolbar-left"><button class="formal-back" id="formalBack">‹ 返回</button><strong>排课单</strong><button id="formalRefresh">↻ 更新排课数据</button></div><div class="formal-toolbar-right"><button id="formalStudentPreview">预览学生课表</button><button class="primary" id="formalFinish">结束排课单</button></div></div>
      <section class="formal-order-card"><div class="formal-order-title"><strong>托福听说读写组合排课-1v1</strong><label class="formal-media-toggle"><input type="checkbox" disabled><span>优选多媒体</span></label></div><div class="formal-order-facts"><span>学生姓名：<strong>托福组合排课测试学生</strong></span><span>班级课时：<strong>${classHours}</strong></span><span>未排课时：<strong>${remainingHours}</strong></span><span>排课课程：${courses.map(c=>`<span class="formal-course-pill">${escapeHtml(c.name)}</span>`).join(' ')}</span></div></section>
      <section class="formal-workspace"><header class="formal-workspace-head"><h2>教师排课 <span class="formal-calendar-icon">▦</span></h2><div class="formal-head-actions"><button id="formalNewPlan">新增排课方案</button><button id="formalSwitchPlan" ${state.versions.length?'':'disabled'}>切换排课方案</button><button id="formalViewSchedule" ${state.planMode==='人工排课'?'disabled':''}>智能排课结果</button><span class="formal-collapse">⌄</span></div></header><div class="formal-linked-teachers"><span>已关联教师：</span>${[...new Set(courses.map(c=>selectedTeacher(c)))].map(t=>`<span class="formal-teacher-chip">${escapeHtml(t)} ×</span>`).join('')}<div class="formal-legend"><span class="published">已发布</span><span class="pending">待发布</span><span class="change">待变更</span><span class="conflict">冲突</span></div></div>
      <div class="formal-actions"><button id="formalAddLesson">添加课程时间</button><button>冲突检测</button><button>冲突详情</button><button id="viewConfirmedRequirements">查看排课要求</button><button>查找可用课次</button><button>清除空白课次</button><button>回写班级</button><button>回写班级课表</button><button>查看回写记录</button><button>排课日志</button></div>
      <div class="formal-actions formal-batch-actions"><button class="formal-active-action">◉ 关闭批量操作</button><button>◯ 全选</button><button disabled>时间调整</button><button disabled>关联课程</button><button disabled>关联教师</button><button disabled>关联教室</button><button disabled>取消教室</button><button disabled>删除书课</button><button disabled>添加备注</button><button disabled>回写选中课次</button><button disabled>修改授课模式</button><button disabled>添加课号</button></div>
      <div class="formal-calendar-card"><div class="formal-calendar-scroll">${calendar}</div></div><div class="formal-panel-grip">↧</div>
      <section class="formal-bottom-panel"><header class="formal-workspace-head"><h2>教师日程 <span class="formal-calendar-icon">▦</span></h2><span class="formal-collapse">⌄</span></header><div class="formal-bottom-content"><div class="formal-schedule-tabs"><button class="active">日程总览</button><button>日程详情</button></div><div class="formal-bottom-filters"><label>日期<input value="${dates[0]}　至　${dates.at(-1)}" readonly></label><label>时段<input value="${scheduleTimes.join(';')}" readonly></label><label>星期<select><option>请选择</option></select></label><div class="formal-filter-actions"><button>重置</button><button class="primary">查询</button></div></div><div class="formal-calendar-legend"><strong>图例：</strong><span class="leave">老师有课</span><span class="rest">老师休假</span><span class="available">可排</span><span class="unavailable">不可排（未到排课时间）</span><span class="student">学生有课</span><span class="shared">老师&学生都有课</span><span class="selected">已选择</span><span class="new">新排</span></div><div class="formal-teacher-scroll">${teacherSchedule}</div></div></section></section>
      <footer class="formal-fixed-footer"><button id="formalCancel">取消</button><button class="primary" id="formalSubmit">提交</button></footer><div id="formalDialog" class="formal-dialog-backdrop" hidden></div>`;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function openFormalDialog(type,versionId) {
    const overlay=$('#formalDialog');
    if(!overlay) return;
    if(type==='new') {
      overlay.innerHTML=`<div class="formal-dialog-window" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">新增排课方案</strong><button data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body"><p>新增排课方案时，会自动将当前方案保存为一个版本。请选择新方案的排课方式。</p></div><footer><button data-formal-dialog-close>取消</button><button class="primary" data-formal-new-intelligent>智能排课</button><button class="primary" data-formal-new-manual>人工排课</button></footer></div>`;
    } else if(type==='switch') {
      if(!state.versions.length) return;
      if(!state.versions.some(item=>item.id===state.pendingPlanVersionId)) state.pendingPlanVersionId=state.activeVersionId||state.versions[0].id;
      overlay.innerHTML=`<div class="formal-dialog-window formal-switch-dialog" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">切换排课方案</strong><button data-formal-dialog-close aria-label="关闭">×</button></header><div class="formal-dialog-body"><div class="formal-version-list"><table><thead><tr><th>方案编号</th><th>保存时间</th><th>智能排课策略</th></tr></thead><tbody>${state.versions.map(version=>`<tr tabindex="0" data-formal-version-row="${escapeHtml(version.id)}" class="${state.pendingPlanVersionId===version.id?'selected':''}"><td><span class="formal-plan-radio"></span>方案${version.planNo}${version.kind==='人工排课'?'<small>人工排课</small>':''}</td><td>${escapeHtml(version.savedAt)}</td><td><button data-formal-strategy-id="${escapeHtml(version.id)}" ${version.kind==='人工排课'?'disabled':''}>查看</button></td></tr>`).join('')}</tbody></table></div></div><footer><button data-formal-dialog-close>取消</button><button class="primary" data-formal-switch-confirm>确认切换方案</button></footer></div>`;
    } else if(type==='strategy') {
      const version=state.versions.find(item=>item.id===versionId);
      if(!version||version.kind==='人工排课') return;
      const previousDraft=state.draft;
      const previousEditing=state.editing;
      let strategyHtml='';
      try {
        state.draft=normalizeDraft(version.snapshot.draft);
        state.editing=false;
        strategyHtml=`<section class="formal-strategy-section"><h3>全局排课策略</h3>${globalStructure()}</section>${courses.map(course=>`<section class="formal-strategy-section"><h3>${escapeHtml(course.name)}</h3>${courseStructure(course)}</section>`).join('')}`;
      } finally {
        state.draft=previousDraft;
        state.editing=previousEditing;
      }
      overlay.innerHTML=`<div class="formal-dialog-window formal-strategy-dialog" role="dialog" aria-modal="true" aria-labelledby="formalDialogTitle"><header><strong id="formalDialogTitle">方案${version.planNo} · 智能排课策略</strong><button data-formal-strategy-back aria-label="返回方案列表">×</button></header><div class="formal-dialog-body">${strategyHtml}</div><footer><button data-formal-strategy-back>返回方案列表</button></footer></div>`;
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
    const versionRow=event.target.closest('[data-formal-version-row]');
    if(versionRow&&!event.target.closest('button')) {state.pendingPlanVersionId=versionRow.dataset.formalVersionRow;openFormalDialog('switch');return;}
    const button=event.target.closest('button'); if(!button) return;
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
      state.activeVersionId=null;
      renderResult(true);
      notify(persisted?`方案${version.planNo}已保存，可在新方案中添加课程时间`:'当前方案仅保存在此页面，浏览器未允许持久保存');
      return;
    }
    if(button.hasAttribute('data-formal-strategy-id')) {openFormalDialog('strategy',button.dataset.formalStrategyId);return;}
    if(button.hasAttribute('data-formal-strategy-back')) {openFormalDialog('switch');return;}
    if(button.hasAttribute('data-formal-switch-confirm')) {
      const version=state.versions.find(item=>item.id===state.pendingPlanVersionId);
      if(!version) {notify('请先选择排课方案');return;}
      restoreResultSnapshot(version.snapshot);
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
      control.querySelector('[data-time-slot-list]').insertAdjacentHTML('beforeend',timeSlotRow({weekdays:[weekday],start:'08:20',end:'10:20'}));
      syncTimeControl(control);
      return;
    }
    if(button.hasAttribute('data-remove-time-slot')) {
      const control=button.closest('[data-time-control]');
      if(control.querySelectorAll('[data-time-slot-row]').length<=1) {notify('请至少保留一个时段，或改为常规');return;}
      button.closest('[data-time-slot-row]').remove();
      syncTimeControl(control);
      return;
    }
    if(button.id==='startScheduling'||button.id==='restartScheduling') { openWizard(1); return; }
    if(button.id==='formalBack'||button.id==='formalCancel') { document.body.classList.remove('formal-page-active');$('#resultPage').hidden=true;$('#orderPage').hidden=false;return; }
    if(button.id==='formalRefresh') { notify('排课数据已更新（原型示意）');return; }
    if(button.id==='formalViewSchedule') { openWizard(4);return; }
    if(button.id==='formalStudentPreview') { notify('学生课表预览需接入正式课节数据');return; }
    if(button.id==='formalFinish') { notify('原型演示未实际结束排课单');return; }
    if(button.id==='formalSubmit') { notify('原型演示未实际提交排课');return; }
    if(button.id==='viewConfirmedRequirements') { state.editing=false;openWizard(2);return; }
    if(button.id==='closeWizard'||button.hasAttribute('data-close')) {closeWizard();return;}
    if(button.hasAttribute('data-restart-plan')) {openWizard(1);return;}
    if(button.hasAttribute('data-pick-history')) {state.direct[button.dataset.pickHistory]=button.dataset.teacher;renderSupplement();return;}
    if(button.hasAttribute('data-set-specified')) {const id=button.dataset.setSpecified;const value=$(`[data-specified-input="${id}"]`).value.trim();if(!value){notify('请输入老师姓名或工号');return;}state.direct[id]=value;renderSupplement();return;}
    if(button.hasAttribute('data-clear-specified')) {delete state.direct[button.dataset.clearSpecified];renderSupplement();return;}
    if(button.hasAttribute('data-analyze')) {state.editing=false;state.draft=initialDraft();state.aiSnapshot=null;state.coursePlans=null;state.dirty=false;state.recommended=false;state.selected={};setLoading('正在分析排课要求','识别全局与各科目要求，输出自然语言及结构化策略…',()=>openWizard(2));return;}
    if(button.hasAttribute('data-back-supplement')) {openWizard(1);return;}
    if(button.hasAttribute('data-toggle-edit')) {state.editing=!state.editing;renderAnalysis();return;}
    if(button.hasAttribute('data-save-rules')) {const error=validateDraft();if(error){notify(error);return;}state.editing=false;state.dirty=false;state.coursePlans=null;state.recommended=false;state.selected={};renderAnalysis();notify('排课策略已保存');return;}
    if(button.hasAttribute('data-recommend')) {if(state.editing){notify('请先校验并保存策略');return;}const error=validateDraft();if(error){notify(error);return;}const planError=generateCoursePlans();if(planError){notify(planError);return;}state.selected={};setLoading('正在生成排课计划并推荐教师','按已确认的策略计算分周期计划，并筛选候选老师…',()=>{state.recommended=true;openWizard(3);});return;}
    if(button.hasAttribute('data-back-analysis')) {state.editing=false;openWizard(2);return;}
    if(button.hasAttribute('data-select-candidate')) {state.selected[button.dataset.selectCandidate]=button.dataset.teacher;renderTeachers();notify(`已选择 ${plainName(button.dataset.teacher)}`);return;}
    if(button.hasAttribute('data-generate')) {const missing=courses.find(c=>!state.direct[c.id]&&!state.selected[c.id]);if(missing){notify(`请先为${missing.name}选择老师`);return;}state.step=4;$('.wizard').dataset.step='4';$('#wizardTitle').textContent='生成排课方案';setLoading('正在生成排课方案','固定时段优先尝试、共用时段动态比较，冲突时前向检查并回退…',renderResult);}
  });
  document.addEventListener('input',event=>{
    const t=event.target;
    if(t.id==='supplementInput') state.supplement=t.value;
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
    if(t.closest('[data-frequency-control]')) syncFrequencyControl(t.closest('[data-frequency-control]'));
    if(t.closest('[data-time-control]')) {
      const control=t.closest('[data-time-control]');
      if(t.hasAttribute('data-time-mode')) {
        const regular=t.value==='常规';
        if(!regular&&!control.querySelector('[data-time-slot-row]')) control.querySelector('[data-time-slot-list]').insertAdjacentHTML('beforeend',timeSlotRow({weekdays:['周一'],start:'08:20',end:'10:20'}));
        control.querySelector('[data-time-slot-editor]').hidden=regular;
        control.querySelector('[data-regular-time]').hidden=!regular;
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
    if(event.target.id==='fileInput'){state.files=[...state.files,...[...event.target.files].map(f=>f.name)];renderSupplement();notify(`已添加 ${event.target.files.length} 张截图`);}
  });
  renderOrder();
})();
