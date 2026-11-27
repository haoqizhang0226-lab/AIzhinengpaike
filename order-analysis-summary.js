(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const fileNames = files => [...new Set((files||[]).map(file=>typeof file==='string'?file:file?.name).filter(Boolean))].join('、');
  function fieldGroups({submission={},supplements=[],replyText='',supplementFiles=[]}={}){
    const extra=submission.extra||{};
    const precise=submission.preciseTime;
    const weekdays=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const originalImages=fileNames(submission.requirementAttachments);
    const addedFiles=fileNames([...supplements.flatMap(item=>item?.attachments||[]),...supplementFiles]);
    const addedText=replyText||supplements.map(item=>typeof item==='string'?item:item?.text).filter(Boolean).join('\n');
    const specifiedEnd=submission.endMode==='SPECIFIED_DATE'||(!submission.endMode&&!!submission.end);
    return [
      {title:'排课要求',fields:[
        ['开课日期',submission.start,{compact:true}],
        ['结课日期',specifiedEnd?submission.end:'排完全部课程结束',{compact:true}],
        ['排课类型',submission.type,{compact:true}],
        ['时间要求',submission.time||(precise?'精准排课':'')],
        ...(precise?[
          ['星期',(precise.weekdays||[]).map(day=>weekdays[day]).filter(Boolean).join('、')||'每天'],
          ['上课时间',[...(precise.slots||[]),...(precise.custom||[]).map(([start,end])=>`${start}-${end}`)].join('、')]
        ]:[]),
        ['排课时间要求',submission.requirement,{multiline:true}],
        ['时间要求相关图片',originalImages,{attachment:true}],
        ...(addedText?[['排课时间要求补充',addedText,{multiline:true}]]:[]),
        ...(addedFiles?[['补充附件',addedFiles,{attachment:true}]]:[]),
        ['老师风格',extra.teacherStyles?.join('、')],
        ['老师性别',extra.teacherGender],
        ['目前校内进度/需要听的知识点',extra.progress,{multiline:true}],
        ['其他排课要求',extra.otherRequirement,{multiline:true}]
      ]},
      {title:'其他信息',fields:[
        ['预计/已报名考试时间',extra.examDate],
        ['学习目的',extra.studyPurposes?.join('、')],
        ['家庭与学习关系',extra.familyRelation],
        ['课程备注',extra.courseNote,{multiline:true}],
        ['凭证',fileNames(extra.vouchers)||submission.credential,{attachment:true}]
      ]}
    ];
  }
  function aiPrecheckDetail(label,value,options={}){
    const valueHtml=options.attachment&&value&&value!=='--'
      ?`<span class="ai-precheck-detail-link">${esc(value)}</span>`
      :esc(value||'--');
    return `<div class="ai-precheck-detail-row${options.half?' half':''}${label.length>12?' long-label':''}"><span class="ai-precheck-detail-label">${esc(label)}</span><span class="ai-precheck-detail-colon">：</span><span class="ai-precheck-detail-value${options.multiline?' multiline':''}">${valueHtml}</span></div>`;
  }
  function render(draft){
    const submission=draft?.submission||{};
    const student=submission.studentInfo||{};
    const packages=(submission.packages||[]).filter(pack=>pack.name||pack.courses?.length);
    if(!packages.length&&submission.courses?.length)packages.push({name:submission.package,courses:submission.courses});
    const courseHeaders=['科目','考试局','年级','模块','学生水平','授课模式','校区','课时','历史授课老师','期望成绩','当前授课老师','老师时间是否已沟通'];
    const readCourse=course=>[course.subject||course.name,course.board,course.grade,course.module,course.studentLevel,course.mode,course.campus,course.hours,course.historicalTeacher,course.expectedGrade,course.currentTeacher,course.teacherDiscussed];
    const packageCards=packages.map(pack=>`<div class="ai-precheck-readonly-package"><div class="ai-precheck-readonly-package-name"><span aria-hidden="true">▣</span> ${esc(pack.name||'课时包')}</div>${pack.score&&/雅思/.test(pack.name)?`<p>目前(期望)成绩：${esc(pack.score)}</p>`:''}<div class="ai-precheck-readonly-table-scroll"><table><thead><tr>${courseHeaders.map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${(pack.courses||[]).map(course=>`<tr>${readCourse(course).map(value=>`<td>${esc(value||'--')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`).join('')||'<p>暂无课程</p>';
    const detailCards=fieldGroups(draft||{}).map(({title,fields})=>{
      const datePair=fields[0]?.[2]?.compact
        ?`<div class="ai-precheck-detail-pair">${fields.slice(0,2).map(([label,value])=>aiPrecheckDetail(label,value,{half:true})).join('')}</div>`
        :'';
      const rows=fields.slice(datePair?2:0).map(([label,value,options])=>aiPrecheckDetail(label,value,options)).join('');
      return `<section class="ai-precheck-readonly-card ai-precheck-detail-card"><h2>${title}</h2><div class="ai-precheck-detail-list">${datePair}${rows}</div></section>`;
    }).join('');
    return `<section class="ai-precheck-readonly-card ai-precheck-student-card"><h2>学生信息</h2><div class="ai-precheck-student-summary">
        <div><span>学生编号：</span><strong>${esc(student.number||submission.customerNo||'--')}</strong></div>
        <div><span>学生姓名：</span><strong>${esc(student.name||submission.student||'--')}</strong></div>
        <div><span>在读年级：</span><strong>${esc(student.grade?`${student.grade}年级`:'--')}</strong></div>
      </div></section>
      <section class="ai-precheck-readonly-card"><h2>课程信息</h2>${packageCards}</section>${detailCards}`;
  }
  window.orderAnalysisSummary={render,fieldGroups};
})();
