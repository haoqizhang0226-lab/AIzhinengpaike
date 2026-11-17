(() => {
  'use strict';
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const labels=['班级名称','班级编号','上课时间','课程名称','授课老师','关联教室','添加备注','操作人','操作类型','操作时间','内容描述'];
  let rows=[],visibleRows=[],page=1,pageSize=10,criteria={};
  const $=selector=>document.querySelector(selector);
  const dateTime=(date,time)=>`${date} ${String(time||'').replace(/(\d\d:\d\d)/g,'$1:00').replace('-', ' - ')}`;
  const match=(value,query)=>String(value??'').toLowerCase().includes(String(query||'').trim().toLowerCase());

  function buildRows(context){
    const courseById=new Map((context.courses||[]).map(course=>[course.id,course]));
    const entries=[];
    for(const [date,time,courseId] of context.lessons||[]){
      const course=courseById.get(courseId);
      if(!course)continue;
      const group=context.groups.find(item=>item.courseIds.includes(courseId))||context.groups[0]||{};
      const base={className:group.name||'--',classNumber:group.number||'--',lessonTime:dateTime(date,time),courseName:course.name,teacher:course.teacher,room:course.room,remark:'--',operator:context.operator,operationTime:context.created};
      entries.push({...base,type:'关联教师',description:`已关联教师【${course.teacher}】`});
      entries.push({...base,teacher:'--',type:'关联课程',description:`已关联课程【${course.name}】`});
      entries.push({...base,courseName:'--',teacher:'--',type:'添加课程时间',description:`添加课程时间为【${dateTime(date,time)}】`});
    }
    entries.unshift(...(context.groups||[]).map(group=>({className:group.name||'--',classNumber:group.number||'--',lessonTime:'--',courseName:'--',teacher:'--',room:'--',remark:'--',operator:context.operator,type:'回写班级',operationTime:context.created,description:`当前班级【${group.name||'--'}】已回写`})));
    return entries;
  }

  function ensureDrawer(){
    if($('#scheduleLogDrawer'))return;
    document.body.insertAdjacentHTML('beforeend',`<div class="schedule-log-backdrop" id="scheduleLogBackdrop" hidden></div>
      <section class="schedule-log-drawer" id="scheduleLogDrawer" role="dialog" aria-modal="true" aria-label="排课日志" hidden>
        <header><button type="button" id="scheduleLogClose" aria-label="关闭排课日志">×</button><strong>排课日志</strong></header>
        <div class="schedule-log-body">
          <form id="scheduleLogFilters" class="schedule-log-filters">
            <label>班级名称<input name="className" type="search" placeholder="请输入班级名称"></label>
            <label>班级编号<input name="classNumber" type="search" placeholder="请输入班级编号"></label>
            <label>上课时间<span class="schedule-log-range"><input name="lessonFrom" type="datetime-local" aria-label="上课开始时间"><span>至</span><input name="lessonTo" type="datetime-local" aria-label="上课结束时间"></span></label>
            <label>课程名称<input name="courseName" type="search" placeholder="请输入"></label>
            <label>授课老师<input name="teacher" type="search" placeholder="请输入"></label>
            <label>关联教室<input name="room" type="search" placeholder="请输入"></label>
            <label>操作日期<span class="schedule-log-range"><input name="operationFrom" type="date" aria-label="操作开始日期"><span>至</span><input name="operationTo" type="date" aria-label="操作结束日期"></span></label>
            <label>操作人<input name="operator" type="search" placeholder="请输入"></label>
            <label>添加备注<select name="remark"><option value="">请选择</option><option value="有">有</option><option value="无">无</option></select></label>
            <label>操作类型<select name="type"><option value="">选择类型</option><option>回写班级</option><option>关联教师</option><option>关联课程</option><option>添加课程时间</option></select></label>
            <div class="schedule-log-filter-actions"><button type="reset">重置</button><button type="submit">查询</button></div>
          </form>
          <div class="schedule-log-export"><button type="button" id="scheduleLogExport">导出EXCEL</button></div>
          <div class="schedule-log-table-scroll"><table class="schedule-log-table"><thead><tr>${labels.map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody id="scheduleLogRows"></tbody></table></div>
          <div class="schedule-log-pagination"><div id="scheduleLogPages"></div><label><select id="scheduleLogPageSize"><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select></label><span id="scheduleLogTotal"></span><label>前往 <input id="scheduleLogJump" type="number" min="1" value="1"> 页</label></div>
        </div>
      </section>`);
    $('#scheduleLogClose').addEventListener('click',close);
    $('#scheduleLogBackdrop').addEventListener('click',close);
    $('#scheduleLogFilters').addEventListener('submit',event=>{event.preventDefault();criteria=Object.fromEntries(new FormData(event.currentTarget).entries());page=1;render();});
    $('#scheduleLogFilters').addEventListener('reset',()=>{criteria={};page=1;queueMicrotask(render);});
    $('#scheduleLogPageSize').addEventListener('change',event=>{pageSize=Number(event.target.value);page=1;render();});
    $('#scheduleLogPages').addEventListener('click',event=>{const button=event.target.closest('[data-log-page]');if(button){page=Number(button.dataset.logPage);render();}});
    $('#scheduleLogJump').addEventListener('change',event=>{page=Number(event.target.value)||1;render();});
    $('#scheduleLogExport').addEventListener('click',exportRows);
  }

  function filtered(){
    const f=criteria;
    return rows.filter(row=>match(row.className,f.className)&&match(row.classNumber,f.classNumber)&&match(row.courseName,f.courseName)&&match(row.teacher,f.teacher)&&match(row.room,f.room)&&match(row.operator,f.operator)&&(!f.type||row.type===f.type)&&(!f.remark||(f.remark==='有'?row.remark!=='--':row.remark==='--'))&&(!f.lessonFrom||row.lessonTime.slice(0,16)>=f.lessonFrom.replace('T',' '))&&(!f.lessonTo||row.lessonTime.slice(0,16)<=f.lessonTo.replace('T',' '))&&(!f.operationFrom||row.operationTime.slice(0,10)>=f.operationFrom)&&(!f.operationTo||row.operationTime.slice(0,10)<=f.operationTo));
  }
  function render(){
    visibleRows=filtered();
    const totalPages=Math.max(1,Math.ceil(visibleRows.length/pageSize));
    page=Math.min(Math.max(1,page),totalPages);
    const pageRows=visibleRows.slice((page-1)*pageSize,page*pageSize);
    const keys=['className','classNumber','lessonTime','courseName','teacher','room','remark','operator','type','operationTime','description'];
    $('#scheduleLogRows').innerHTML=pageRows.length?pageRows.map((row,index)=>`<tr>${keys.map(key=>`<td title="${escapeHtml(row[key])}">${escapeHtml(row[key])}</td>`).join('')}</tr>`).join(''):'<tr><td colspan="11" class="schedule-log-empty">暂无符合条件的排课日志</td></tr>';
    const buttons=[];
    for(let number=Math.max(1,page-2);number<=Math.min(totalPages,Math.max(5,page+2));number++)buttons.push(`<button type="button" data-log-page="${number}" ${number===page?'class="active" aria-current="page"':''}>${number}</button>`);
    $('#scheduleLogPages').innerHTML=`<button type="button" data-log-page="${Math.max(1,page-1)}" ${page===1?'disabled':''}>‹</button>${buttons.join('')}<button type="button" data-log-page="${Math.min(totalPages,page+1)}" ${page===totalPages?'disabled':''}>›</button>`;
    $('#scheduleLogTotal').textContent=`共 ${visibleRows.length} 条`;
    $('#scheduleLogJump').value=String(page);
    $('#scheduleLogJump').max=String(totalPages);
  }
  function open(){
    ensureDrawer();
    const context=window.getEducatorScheduleLogContext?.();
    if(!context)return;
    rows=buildRows(context);criteria={};page=1;
    $('#scheduleLogFilters').reset();
    render();
    $('#scheduleLogBackdrop').hidden=false;
    $('#scheduleLogDrawer').hidden=false;
    $('#scheduleLogClose').focus();
  }
  function close(){
    $('#scheduleLogBackdrop').hidden=true;
    $('#scheduleLogDrawer').hidden=true;
    $('#formalScheduleLog')?.focus();
  }
  function exportRows(){
    const keys=['className','classNumber','lessonTime','courseName','teacher','room','remark','operator','type','operationTime','description'];
    const cell=value=>`"${String(value??'').replaceAll('"','""')}"`;
    const csv='\ufeff'+[labels.map(cell).join(','),...visibleRows.map(row=>keys.map(key=>cell(row[key])).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='排课日志.csv';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.addEventListener('click',event=>{if(event.target.closest('#formalScheduleLog'))open();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#scheduleLogDrawer')&&!$('#scheduleLogDrawer').hidden){event.stopPropagation();close();}});
})();
