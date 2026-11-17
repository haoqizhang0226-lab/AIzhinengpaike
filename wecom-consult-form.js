(() => {
  const storageKey = 'smart-scheduling-v32-consults';
  const hierarchy = {
    高端:{高端牛剑:['高阶笔试'],高端竞赛:['高端竞赛']},
    全日制:{全日制学校:['上海远见']},
    英联邦:{英联邦学科:['ALEVEL','GCSE','IGCSE'],英联邦语言:['托福','雅思']},
    英研:{英研课程:['英国大学课程']},
    橡沐:{橡沐学科:['美高同步']}
  };
  const systems = Object.values(hierarchy).flatMap(group => Object.keys(group));
  const divisionFor = system => Object.keys(hierarchy).find(division => Object.hasOwn(hierarchy[division],system)) || '';
  const itemsFor = system => hierarchy[divisionFor(system)]?.[system] || [];
  const subjects = ['听力','阅读','口语','写作','数学','物理','化学','生物','计算机','经济','商务','会计','心理','英语','中文','综合'];
  const levels = ['先修/同步-B及以上','先修/同步-B及以下','备考-B及以上','不限'];
  const campuses = ['舜元中心','雅仕校区','鸿寿校区','浦东校区','苏悦校区','望京校区','海淀校区','南山校区'];
  const styles = ['风趣幽默','可全英文','热情活泼','严格严肃','循序善诱','疑难专家','生动形象','温柔耐心','雷厉风行','其他'];
  const customerCatalog = [{name:'张同学',no:'VA100073946'},{name:'陈同学',no:'VA100086215'},{name:'王同学',no:'VA100094332'},{name:'刘同学',no:'VA100092578'}];
  const steps = ['基本信息','课程信息','匹配要求','核对提交'];
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const options = (values,value,blank=true) => (blank ? '<option value="">请选择</option>' : '') + values.map(item => `<option value="${safe(item)}"${item===value?' selected':''}>${safe(item)}</option>`).join('');
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const write = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } };
  const blankCourse = () => ({subject:'',board:'',grade:'',module:'',studentLevel:'先修/同步-B及以上',expectedGrade:'',mode:'线下',campus:'',hours:''});
  const blankDraft = customerName => ({consultType:'1V1',customerName,customerNo:'',start:'',endMode:'FINISH_ALL',end:'',requirement:'',attachments:[],teacherStyle:'',teacherGender:'',progress:'',otherRequirement:'',groups:[{id:'g1',system:'',item:'',courses:[]}],step:0,supplement:''});
  let body,footer,onSubmitted,customerName,draft,draftKey,phase='editing',searchResults=null,validation='',mounted=false;
  const persist = () => { if (draft && draftKey && phase !== 'done') write(draftKey,draft); };
  const field = (label,content,extra='') => `<div class="wecom-form-field ${extra}"><strong>${label}</strong>${content}</div>`;
  const select = (values,value,attr,blank=true) => `<select ${attr}>${options(values,value,blank)}</select>`;
  const readText = value => safe(value || '—');
  function stepper() { return `<div class="wecom-form-steps" aria-label="填写进度">${steps.map((name,index) => `<span class="${index===draft.step?'active':index<draft.step?'done':''}">${index+1}. ${name}</span>`).join('')}</div>`; }
  function basicMarkup() {
    const types=['1V1','试听','诊断','自组班'];
    return field('咨单类型',`<div class="wecom-type-options" role="radiogroup" aria-label="咨单类型">${types.map(type=>`<label><input type="radio" name="wecomConsultType" data-field="consultType" value="${type}"${draft.consultType===type?' checked':''}>${type}</label>`).join('')}</div>`)+
      field('客户信息',`<div class="wecom-customer-search"><input id="wecomFormCustomer" type="search" data-field="customerName" placeholder="输入姓名或客户编号搜索" value="${safe(draft.customerName)}"><button type="button" data-action="search-customer">搜索</button></div>${draft.customerNo?`<small class="wecom-selected-customer">已选择：${safe(draft.customerName)}（${safe(draft.customerNo)}）</small>`:''}<div class="wecom-customer-results">${searchResults===null?'':searchResults.length?searchResults.map(person=>`<button type="button" data-action="choose-customer" data-customer-no="${safe(person.no)}">${safe(person.name)}（${safe(person.no)}）</button>`).join(''):'未找到已入库客户，可保留姓名继续填写'}</div>`);
  }
  function courseMarkup(course,groupId,index) {
    const attr = key => `data-group-id="${safe(groupId)}" data-course-index="${index}" data-course-field="${key}"`;
    const input = (key,value,type='text',extra='') => `<input type="${type}" ${attr(key)} value="${safe(value)}" ${extra}>`;
    const row = (label,control) => `<label><span>${label}</span>${control}</label>`;
    return `<section class="wecom-course-card"><div class="wecom-course-head"><strong>科目 ${index+1}</strong><button type="button" data-action="remove-course" data-group-id="${safe(groupId)}" data-course-index="${index}">移除</button></div><div class="wecom-course-grid">`+
      row('科目',select(subjects,course.subject,attr('subject')))+row('考试局',select(['AQA','OCR','EDX','CAIE','IB'],course.board,attr('board')))+
      row('年级',select(['AS','A2','IAL-AS','IGCSE','GCSE','IB','其他'],course.grade,attr('grade')))+row('模块',input('module',course.module))+
      row('学生水平',select(levels,course.studentLevel,attr('studentLevel')))+row('期望成绩',select(levels,course.expectedGrade,attr('expectedGrade')))+
      row('授课模式',select(['线上','线下'],course.mode,attr('mode'),false))+row('校区',select(campuses,course.campus,attr('campus')+(course.mode==='线上'?' disabled':'')))+
      row('课时',input('hours',course.hours,'number','min="0.25" step="0.25" inputmode="decimal"'))+'</div></section>';
  }
  function coursesMarkup() {
    return draft.groups.map((group,index) => `<section class="wecom-course-group" data-group-id="${safe(group.id)}"><header><strong>课程组合 ${index+1}</strong>${draft.groups.length>1?`<button type="button" data-action="remove-group" data-group-id="${safe(group.id)}">移除组合</button>`:''}</header><div class="wecom-course-grid"><label><span>课程体系</span>${select(systems,group.system,`data-group-id="${safe(group.id)}" data-group-field="system"`)}</label><label><span>课程项</span>${select(itemsFor(group.system),group.item,`data-group-id="${safe(group.id)}" data-group-field="item"${group.system?'':' disabled'}`)}</label></div>${group.courses.map((course,courseIndex)=>courseMarkup(course,group.id,courseIndex)).join('')}<button type="button" class="wecom-add-course" data-action="add-course" data-group-id="${safe(group.id)}">＋ 添加科目</button></section>`).join('')+'<button type="button" class="wecom-add-group" data-action="add-group">＋ 添加课程组合</button>';
  }
  function matchMarkup() {
    const input = (key,type='text',extra='') => `<input type="${type}" data-field="${key}" value="${safe(draft[key])}" ${extra}>`;
    const area = (key,max,placeholder) => `<textarea data-field="${key}" maxlength="${max}" placeholder="${placeholder}">${safe(draft[key])}</textarea>`;
    return '<div class="wecom-form-grid">'+field('开课日期',input('start','date'))+
      field('结课日期',`<div class="wecom-form-choice"><label><input type="radio" name="wecomEndMode" data-field="endMode" value="FINISH_ALL"${draft.endMode==='FINISH_ALL'?' checked':''}>排完全部课程结束</label><label><input type="radio" name="wecomEndMode" data-field="endMode" value="SPECIFIED_DATE"${draft.endMode==='SPECIFIED_DATE'?' checked':''}>指定结课日期</label></div>${draft.endMode==='SPECIFIED_DATE'?input('end','date',`min="${safe(draft.start)}"`):''}`)+
      field('时间要求',area('requirement',1000,'请输入学生可上课的日期、时段及频次要求'),'full')+
      field('附件',`<label class="wecom-upload">＋ 上传图片<input type="file" id="wecomConsultAttachments" accept=".jpg,.jpeg,.png,.bmp,image/jpeg,image/png,image/bmp" multiple hidden></label><div class="wecom-attachment-list">${draft.attachments.map((item,index)=>`<span>${safe(item.name)}<button type="button" data-action="remove-attachment" data-file-index="${index}" aria-label="移除${safe(item.name)}">×</button></span>`).join('')}</div><small>支持 JPG、PNG、BMP，最多 20 个，每个不超过 20MB</small>`,'full')+
      field('老师风格',`<div class="wecom-form-choice">${styles.map(style=>`<label><input type="radio" name="wecomTeacherStyle" data-field="teacherStyle" value="${safe(style)}"${draft.teacherStyle===style?' checked':''}>${safe(style)}</label>`).join('')}</div>`,'full')+
      field('老师性别',`<div class="wecom-form-choice">${['男老师','女老师','都可以'].map(gender=>`<label><input type="radio" name="wecomTeacherGender" data-field="teacherGender" value="${gender}"${draft.teacherGender===gender?' checked':''}>${gender}</label>`).join('')}</div>`,'full')+
      field('目前校内进度/需要听的知识点',area('progress',500,'请输入学生目前校内进度和需要学习的知识点'),'full')+
      field('其他要求（选填）',area('otherRequirement',500,'可补充其他匹配要求'),'full')+'</div>';
  }
  function reviewMarkup() {
    const courses = draft.groups.flatMap(group => group.courses.map(course => ({...course,system:group.system,item:group.item})));
    return `<div class="wecom-review"><section><h3>基本信息</h3><p>咨单类型：${readText(draft.consultType)}</p><p>客户信息：${readText(draft.customerName)}${draft.customerNo?`（${safe(draft.customerNo)}）`:''}</p></section><section><h3>课程信息</h3>${courses.map(course=>`<div class="wecom-review-course"><strong>${readText(course.system)} · ${readText(course.item)} · ${readText(course.subject)}</strong><small>${readText(course.board)} / ${readText(course.grade)} / ${readText(course.module)}　${readText(course.mode)}　${readText(course.campus)}　${safe(course.hours)}课时</small><small>学生水平：${readText(course.studentLevel)}　期望成绩：${readText(course.expectedGrade)}</small></div>`).join('')}</section><section><h3>匹配要求</h3><p>开课日期：${readText(draft.start)}</p><p>结课日期：${draft.endMode==='FINISH_ALL'?'排完全部课程结束':readText(draft.end)}</p><p>时间要求：${readText(draft.requirement)}</p><p>附件：${draft.attachments.length?draft.attachments.map(item=>safe(item.name)).join('、'):'—'}</p><p>老师风格：${readText(draft.teacherStyle)}</p><p>老师性别：${readText(draft.teacherGender)}</p><p>目前校内进度/需要听的知识点：${readText(draft.progress)}</p><p>其他要求：${readText(draft.otherRequirement)}</p></section>${draft.issue?`<section class="wecom-ai-issue"><h3>AI分析结果</h3><p>${safe(draft.issue)}</p><label>补充排课要求<textarea data-field="supplement" maxlength="1000" placeholder="请补充可上课日期、时段和课程安排">${safe(draft.supplement)}</textarea></label></section>`:''}</div>`;
  }
  function render(resetScroll=false) {
    if (phase === 'done') return;
    const previousScroll=body.scrollTop;
    if (phase === 'analyzing') { body.innerHTML='<div class="wecom-ai-loading" role="status"><strong>AI正在分析排课要求…</strong><span>请稍候</span></div>'; }
    else body.innerHTML = `<div class="wecom-consult-step">${stepper()}${validation?`<p class="wecom-form-error" role="alert">${safe(validation)}</p>`:''}<div class="wecom-step-content">${[basicMarkup,coursesMarkup,matchMarkup,reviewMarkup][draft.step]()}</div></div>`;
    const showControls = phase !== 'analyzing';
    footer.querySelector('#wecomDrawerPrevious').hidden = !showControls || draft.step===0;
    footer.querySelector('#wecomDrawerNext').hidden = !showControls || draft.step===3;
    footer.querySelector('#wecomDrawerSubmit').hidden = !showControls || draft.step!==3;
    footer.querySelector('#wecomDrawerSubmit').textContent = draft.issue ? '重新分析并提交' : '提交咨单';
    footer.querySelector('#wecomDrawerCancel').textContent = '取消';
    body.scrollTop=resetScroll?0:previousScroll;
  }
  function validateStep(step) {
    if (step===0) return draft.customerName.trim() ? '' : '请填写客户信息';
    if (step===1) {
      if (!draft.groups.length || draft.groups.some(group=>!group.system||!group.item||!group.courses.length)) return '请选择课程体系、课程项，并为每组添加科目';
      if (draft.groups.some(group=>group.courses.some(course=>!course.subject||!course.board||!course.grade))) return '请补全科目、考试局和年级';
      if (draft.groups.some(group=>group.courses.some(course=>!Number.isFinite(Number(course.hours))||Number(course.hours)<=0||Math.round(Number(course.hours)*4)!==Number(course.hours)*4))) return '课时须为 0.25 的正倍数';
    }
    if (step===2) {
      if (!draft.start) return '请选择开课日期';
      if (draft.endMode==='SPECIFIED_DATE'&&(!draft.end||draft.end<draft.start)) return '请选择不早于开课日期的结课日期';
      if (!draft.progress.trim()) return '请填写目前校内进度/需要听的知识点';
    }
    return '';
  }
  function consultIssue(reply='') {
    const content = draft.requirement.trim();
    if (reply.trim().length>=6 && /(周|月|日|时|节|课|老师|教师|日期|时间|按照|确认)/.test(reply) && !/仍有冲突|继续报错|待定|不确定|不知道/.test(reply)) return '';
    if (/仍有冲突|继续报错|待定|不确定|不知道/.test(content+' '+reply)) return '排课要求中仍有待定或冲突的内容，请明确可上课的日期、时段及课程安排。';
    if (/老师时间(排课|安排|上课)?(即可|就行)?/.test(content)) return '';
    if (content.length<8) return '排课要求尚未明确学生可上课的日期或时段。请补充学生的可排时间与需要避开的时间。';
    if (/冲突|展示报错|报错/.test(content)) return '排课要求中存在前后冲突的时段，请明确最终采用的课程与上课时间。';
    return '';
  }
  function updateField(event) {
    const target=event.target;
    if (target.type==='file'&&target.id==='wecomConsultAttachments') {
      const files=[...target.files];
      if (draft.attachments.length+files.length>20||files.some(file=>file.size>20*1024*1024)) { validation='最多上传20张图片，单张不超过20MB'; render(); return; }
      draft.attachments.push(...files.map(file=>({name:file.name,size:file.size,type:file.type})));
      validation='';persist();render();return;
    }
    const group=target.dataset.groupId && draft.groups.find(item=>item.id===target.dataset.groupId);
    if (group&&target.dataset.groupField) {
      group[target.dataset.groupField]=target.value;
      if (target.dataset.groupField==='system') { group.item='';group.courses=[];render(); }
      persist();return;
    }
    if (group&&target.dataset.courseField) {
      const course=group.courses[Number(target.dataset.courseIndex)];
      if (!course) return;
      course[target.dataset.courseField]=target.value;
      if (target.dataset.courseField==='mode') { if (target.value==='线上') course.campus=''; render(); }
      persist();return;
    }
    if (!target.dataset.field || (target.type==='radio'&&!target.checked)) return;
    draft[target.dataset.field]=target.value;
    if(target.dataset.field==='requirement'){draft.issue='';draft.supplement='';}
    if (target.dataset.field==='customerName') {
      draft.customerNo='';searchResults=null;
      body.querySelector('.wecom-selected-customer')?.remove();
      const results=body.querySelector('.wecom-customer-results');if(results)results.innerHTML='';
    }
    if (target.dataset.field==='endMode') { if(target.value==='FINISH_ALL')draft.end='';render(); }
    persist();
  }
  function searchCustomers() {
    const query=draft.customerName.trim().toLowerCase();
    const saved=read(storageKey);
    const people=[...customerCatalog,...(Array.isArray(saved)?saved.filter(item=>item.customerNo&&item.customerName).map(item=>({name:item.customerName,no:item.customerNo})):[])];
    searchResults=query?[...new Map(people.filter(item=>item.name.toLowerCase().includes(query)||item.no.toLowerCase().includes(query)).map(item=>[item.no,item])).values()].slice(0,6):[];
    render();
  }
  function onBodyClick(event) {
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action;
    const group=draft.groups.find(item=>item.id===button.dataset.groupId);
    if(action==='search-customer'){searchCustomers();return;}
    if(action==='choose-customer'){
      const person=searchResults?.find(item=>item.no===button.dataset.customerNo);
      if(person){draft.customerName=person.name;draft.customerNo=person.no;searchResults=null;persist();render();}
      return;
    }
    if(action==='add-group'){draft.groups.push({id:'g'+Date.now(),system:'',item:'',courses:[]});persist();render();return;}
    if(action==='remove-group'&&group&&draft.groups.length>1){draft.groups=draft.groups.filter(item=>item!==group);persist();render();return;}
    if(action==='add-course'&&group){group.courses.push(blankCourse());persist();render();return;}
    if(action==='remove-course'&&group){group.courses.splice(Number(button.dataset.courseIndex),1);persist();render();return;}
    if(action==='remove-attachment'){draft.attachments.splice(Number(button.dataset.fileIndex),1);persist();render();}
  }
  function next() {
    if (phase!=='editing') return;
    validation=validateStep(draft.step);
    if(validation){render();return;}
    draft.step=Math.min(3,draft.step+1);validation='';persist();render(true);
  }
  function previous() { if(phase!=='editing')return;draft.step=Math.max(0,draft.step-1);validation='';persist();render(true); }
  const timestamp = () => new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai',hour12:false});
  function commit() {
    const rows=read(storageKey);const items=Array.isArray(rows)?rows:[];
    const created=timestamp();const prefix=created.slice(0,10).replaceAll('-','');
    const used=items.map(item=>String(item.schemeNo||'')).filter(value=>value.startsWith(prefix)&&/^\d{12}$/.test(value)).map(value=>Number(value.slice(8)));
    const sequence=(used.length?Math.max(...used)+1:0);
    if(sequence>9999){validation='当日方案编号已用尽，无法新增售前咨单';phase='editing';render();return;}
    const courses=draft.groups.flatMap(group=>group.courses.map(course=>({...course,groupId:group.id,division:divisionFor(group.system),system:group.system,item:group.item,classType:'1v1',module:course.module||'/',historicalTeacher:'无',currentTeacher:'',teacherDiscussed:'',studentResult:'',hours:Number(course.hours),campus:course.mode==='线上'?'':course.campus})));
    const item={id:'ZD'+Date.now(),schemeNo:prefix+String(sequence).padStart(4,'0'),created,consultType:draft.consultType,customerName:draft.customerName.trim(),customerNo:draft.customerNo,advisorName:'李春玲',initiator:'李春玲',initiatorRole:'销售顾问',status:'进行中',transferredToEducator:false,handlerName:'',autoCloseEligible:true,linkedOrderIds:[],source:'企微侧边栏',start:draft.start,endMode:draft.endMode,end:draft.endMode==='SPECIFIED_DATE'?draft.end:'',scheduleType:'此科目新排',timeRequirement:'vague',preciseTime:null,requirement:[draft.requirement.trim(),draft.supplement.trim()?`补充要求：${draft.supplement.trim()}`:''].filter(Boolean).join('\n'),transferRequirement:'',attachments:draft.attachments,teacherStyles:draft.teacherStyle?[draft.teacherStyle]:[],teacherGender:draft.teacherGender,progress:draft.progress.trim(),otherRequirement:draft.otherRequirement.trim(),courses};
    if(!write(storageKey,[item,...items])){validation='保存失败，请重试';phase='editing';render();return;}
    try{localStorage.removeItem(draftKey);}catch{}
    phase='done';body.innerHTML=`<div class="wecom-submit-success" role="status"><span>✓</span><strong>售前咨单已提交</strong><p>方案编号：${safe(item.schemeNo)}</p><p>可在销售工作台的售前咨单列表查看。</p></div>`;
    ['wecomDrawerPrevious','wecomDrawerNext','wecomDrawerSubmit'].forEach(id=>{footer.querySelector('#'+id).hidden=true;});
    footer.querySelector('#wecomDrawerCancel').textContent='完成';
    onSubmitted?.(item);
  }
  let analysisToken=0;
  function submit() {
    if(phase!=='editing')return;
    for(let step=0;step<3;step++){validation=validateStep(step);if(validation){draft.step=step;persist();render();return;}}
    validation='';phase='analyzing';render();
    const token=++analysisToken;
    setTimeout(()=>{
      if(token!==analysisToken||phase!=='analyzing')return;
      const issue=consultIssue(draft.supplement);
      phase='editing';
      if(issue){draft.issue=issue;draft.step=3;persist();render();return;}
      draft.issue='';commit();
    },1500);
  }
  function mount(config) {
    body=config.body;footer=config.footer;onSubmitted=config.onSubmitted;customerName=config.customerName||'当前微信客户';
    draftKey='wecom-consult-draft:'+customerName;
    const saved=read(draftKey);
    draft={...blankDraft(customerName),...(saved&&typeof saved==='object'?saved:{})};
    if(!Array.isArray(draft.groups)||!draft.groups.length)draft.groups=blankDraft(customerName).groups;
    if(!Array.isArray(draft.attachments))draft.attachments=[];
    draft.step=Math.max(0,Math.min(3,Number(draft.step)||0));
    phase='editing';searchResults=null;validation='';
    if(!mounted){
      body.addEventListener('input',event=>{if(event.target.type!=='file')updateField(event);});
      body.addEventListener('change',event=>updateField(event));
      body.addEventListener('click',onBodyClick);
      footer.querySelector('#wecomDrawerPrevious').addEventListener('click',previous);
      footer.querySelector('#wecomDrawerNext').addEventListener('click',next);
      footer.querySelector('#wecomDrawerSubmit').addEventListener('click',submit);
      mounted=true;
    }
    render(true);
  }
  function pause() { analysisToken++;if(phase==='analyzing')phase='editing';persist(); }
  window.WecomConsultForm={mount,pause};
})();
