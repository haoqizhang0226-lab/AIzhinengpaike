(() => {
  const form = document.getElementById('createOrderForm');
  const search = document.getElementById('createStudentSearch');
  const suggestions = document.getElementById('createStudentSuggestions');
  const details = document.getElementById('createStudentDetails');
  const fileInput = document.getElementById('createVoucherInput');
  const drop = document.getElementById('createVoucherDrop');
  const fileList = document.getElementById('createVoucherList');
  const requirementAttachmentInput = document.getElementById('createRequirementAttachmentInput');
  const requirementAttachmentDrop = document.getElementById('createRequirementAttachmentDrop');
  const requirementAttachmentList = document.getElementById('createRequirementAttachmentList');
  const sampleStudents = [
    {name:'授课反馈产品验收',number:'VA100078710',english:'--',gender:'男',grade:'8年级',birthday:'--',age:'--',country:'--',phone:'138****9993',wechat:'Z****2',email:'--',school:'上海市建平中学'},
    {name:'陈同学',number:'VA100086215',english:'--',gender:'女',grade:'9年级',birthday:'--',age:'--',country:'--',phone:'--',wechat:'--',email:'--',school:'--'},
    {name:'王同学',number:'VA100094332',english:'--',gender:'男',grade:'10年级',birthday:'--',age:'--',country:'--',phone:'--',wechat:'--',email:'--',school:'--'},
    {name:'张同学',number:'VA100073946',english:'--',gender:'--',grade:'8年级',birthday:'--',age:'--',country:'--',phone:'--',wechat:'--',email:'--',school:'--'}
  ];
  const fields = ['english','gender','grade','birthday','age','country','phone','wechat','email','school'];
  const safe = value => String(value ?? '').replace(/[&<>"']/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let student = null;
  let vouchers = [];
  let requirementAttachments = [];

  function catalog() {
    const records = new Map(sampleStudents.map(item => [item.name + '|' + item.number,item]));
    for (const order of allOrders) {
      const data = order.submission;
      if (!data?.student) continue;
      const item = data.studentInfo || {name:data.student,number:data.customerNo || '',grade:'--'};
      records.set(item.name + '|' + item.number,item);
    }
    return [...records.values()];
  }
  function renderStudent() {
    details.hidden = false;
    fields.forEach(key => {
      const node = details.querySelector('[data-student-field="' + key + '"]');
      if (node) node.textContent = student?.[key] || '--';
    });
  }
  function showSuggestions() {
    const query = search.value.trim().toLowerCase();
    const matches = catalog().filter(item => !query || item.name.toLowerCase().includes(query) || (item.number || '').toLowerCase().includes(query)).slice(0,8);
    suggestions.innerHTML = matches.map((item,index) => '<button type="button" data-student-index="' + index + '">' + safe(item.name) + '<small>' + safe(item.number || '暂无编号') + '</small></button>').join('');
    suggestions._matches = matches;
    suggestions.hidden = matches.length === 0;
  }
  function setStudentName(name,number = '') {
    const found = catalog().find(item => item.name === name && (!number || item.number === number)) ||
      catalog().find(item => item.name === name);
    student = found ? {...found,number:number || found.number || ''} :
      {name,number,english:'--',gender:'--',grade:'--',birthday:'--',age:'--',country:'--',phone:'--',wechat:'--',email:'--',school:'--'};
    search.value = name;
    suggestions.hidden = true;
    renderStudent();
    window.createOrderPackages?.setStudentSelected(true,student.number);
  }
  function selectExistingStudent(name,number) {
    const found = catalog().find(item => item.name === name && item.number === number);
    if (found) { setStudentName(found.name,found.number); return true; }
    search.value = name || '';
    student = null;
    renderStudent();
    window.createOrderPackages?.setStudentSelected(false);
    showSuggestions();
    return false;
  }
  function renderVouchers() {
    fileList.innerHTML = vouchers.map((file,index) =>
      '<span>' + safe(file.name) + '<button type="button" data-remove-voucher="' + index + '" aria-label="移除' + safe(file.name) + '">×</button></span>').join('');
  }
  function renderRequirementAttachments() {
    requirementAttachmentList.innerHTML = requirementAttachments.map((file,index) =>
      '<span>' + safe(file.name) + '<button type="button" data-remove-requirement-attachment="' + index + '" aria-label="移除' + safe(file.name) + '">×</button></span>').join('');
  }
  function addFiles(files,kind = 'voucher') {
    const target = kind === 'requirement' ? requirementAttachments : vouchers;
    const label = kind === 'requirement' ? '附件' : '凭证';
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['jpg','jpeg','png','bmp'].includes(extension) || file.size > 20 * 1024 * 1024) {
        toast(label + '仅支持 JPG、PNG、BMP，单个文件不超过 20MB');
        continue;
      }
      if (target.length >= 20) { toast('最多上传 20 个' + label + '文件'); break; }
      if (!target.some(item => item.name === file.name && item.size === file.size)) target.push({name:file.name,size:file.size});
    }
    if (kind === 'requirement') renderRequirementAttachments();
    else renderVouchers();
  }
  function updateCounter(input) {
    const counter = document.querySelector('[data-counter-for="' + input.id + '"]');
    if (counter) counter.textContent = input.value.length + '/' + input.maxLength;
  }
  function reset() {
    student = null;
    search.value = '';
    suggestions.hidden = true;
    renderStudent();
    window.createOrderPackages?.setStudentSelected(false);
    form.querySelectorAll('.create-other-section input[type="checkbox"],.create-other-section input[type="radio"]').forEach(input => { input.checked = false; });
    for (const id of ['createProgress','createCourseNote','createExamDate']) {
      const input = document.getElementById(id);
      input.value = '';
      if (input.tagName === 'TEXTAREA') updateCounter(input);
    }
    fileInput.value = '';
    requirementAttachmentInput.value = '';
    vouchers = [];
    requirementAttachments = [];
    renderVouchers();
    renderRequirementAttachments();
  }
  function read() {
    const checked = selector => [...form.querySelectorAll(selector)].filter(input => input.checked).map(input => input.value);
    return {
      studentInfo:student ? {...student} : {name:search.value.trim(),number:''},
      customerNo:student?.number || '',
      requirementAttachments:requirementAttachments.map(file => file.name),
      extra:{
        teacherStyles:checked('#createTeacherStyles input'),
        teacherGender:form.querySelector('input[name="createTeacherGender"]:checked')?.value || '',
        progress:document.getElementById('createProgress').value.trim(),
        examDate:document.getElementById('createExamDate').value,
        studyPurposes:checked('#createStudyPurposes input'),
        familyRelation:form.querySelector('input[name="createFamilyRelation"]:checked')?.value || '',
        courseNote:document.getElementById('createCourseNote').value.trim(),
        vouchers:vouchers.map(file => file.name)
      }
    };
  }
  function validate() {
    if (!student || search.value.trim() !== student.name) {
      toast('请从搜索结果中选择学生'); search.focus(); return false;
    }
    if (!form.querySelector('#createTeacherStyles input:checked')) {
      toast('请选择老师风格'); form.querySelector('#createTeacherStyles input')?.focus(); return false;
    }
    if (!form.querySelector('input[name="createTeacherGender"]:checked')) {
      toast('请选择老师性别'); form.querySelector('input[name="createTeacherGender"]')?.focus(); return false;
    }
    if (!document.getElementById('createProgress').value.trim()) {
      toast('请填写目前校内进度或需要听的知识点'); document.getElementById('createProgress').focus(); return false;
    }
    return true;
  }

  search.addEventListener('focus',showSuggestions);
  search.addEventListener('input',() => {
    if (student && student.name !== search.value.trim()) {
      student = null;
      window.createOrderPackages?.setStudentSelected(false);
    }
    renderStudent();
    showSuggestions();
  });
  suggestions.addEventListener('click',event => {
    const button = event.target.closest('[data-student-index]');
    if (!button) return;
    const item = suggestions._matches[Number(button.dataset.studentIndex)];
    if (item) setStudentName(item.name,item.number);
  });
  document.addEventListener('click',event => {
    if (!event.target.closest('.create-student-search')) suggestions.hidden = true;
  });
  for (const id of ['createProgress','createCourseNote']) {
    const input = document.getElementById(id);
    input.addEventListener('input',() => updateCounter(input));
  }
  fileInput.addEventListener('change',event => { addFiles(event.target.files); fileInput.value = ''; });
  requirementAttachmentInput.addEventListener('change',event => { addFiles(event.target.files,'requirement'); requirementAttachmentInput.value = ''; });
  drop.addEventListener('dragover',event => { event.preventDefault(); drop.classList.add('is-dragging'); });
  drop.addEventListener('dragleave',() => drop.classList.remove('is-dragging'));
  drop.addEventListener('drop',event => { event.preventDefault(); drop.classList.remove('is-dragging'); addFiles(event.dataTransfer.files); });
  requirementAttachmentDrop.addEventListener('dragover',event => { event.preventDefault(); requirementAttachmentDrop.classList.add('is-dragging'); });
  requirementAttachmentDrop.addEventListener('dragleave',() => requirementAttachmentDrop.classList.remove('is-dragging'));
  requirementAttachmentDrop.addEventListener('drop',event => { event.preventDefault(); requirementAttachmentDrop.classList.remove('is-dragging'); addFiles(event.dataTransfer.files,'requirement'); });
  fileList.addEventListener('click',event => {
    const button = event.target.closest('[data-remove-voucher]');
    if (!button) return;
    vouchers.splice(Number(button.dataset.removeVoucher),1);
    renderVouchers();
  });
  requirementAttachmentList.addEventListener('click',event => {
    const button = event.target.closest('[data-remove-requirement-attachment]');
    if (!button) return;
    requirementAttachments.splice(Number(button.dataset.removeRequirementAttachment),1);
    renderRequirementAttachments();
  });
  renderStudent();
  window.createOrderDetails = {reset,read,validate,setStudentName,selectExistingStudent,studentNumber:() => student?.number || ''};
})();
