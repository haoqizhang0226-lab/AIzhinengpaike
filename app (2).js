(() => {
  'use strict';
  const STORAGE_KEY = 'teacher-org-priority-demo-v4';
  const PREVIOUS_KEY = 'teacher-org-priority-demo-v3';
  const $ = selector => document.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const modeNames = { OFFLINE_OMO: '线下／OMO', ONLINE: '线上' };
  const campuses = [
    { id: 'hongshou', name: '鸿寿校区' }, { id: 'yashi', name: '雅仕校区' },
    { id: 'pudong', name: '浦东校区' }, { id: 'shunyuan', name: '舜元中心' },
    { id: 'nanshan', name: '南山校区' }, { id: 'wangjing', name: '望京校区' },
    { id: 'haidian', name: '海淀校区' }, { id: 'suyue', name: '苏悦校区' },
    { id: 'shidai', name: '时代校区' }, { id: 'changan', name: '长安国际校区' },
    { id: 'futian', name: '福田校区' }
  ];
  const addedCampuses = ['shunyuan', 'nanshan', 'wangjing', 'haidian', 'shidai', 'changan', 'futian'];
  const sources = [
    { id: 'oxmu_sales', name: '唯寻上海-橡沐中心', fullName: '唯寻上海-橡沐中心', departments: ['oxmu_sales_team', 'oxmu_advisory'] },
    { id: 'union_sales', name: '唯寻上海-英联邦浦西', fullName: '唯寻上海-英联邦浦西', departments: ['union_sales_team', 'union_advisory'] },
    { id: 'suzhou_sales', name: '唯寻江苏-唯寻苏州', fullName: '唯寻江苏-唯寻苏州', departments: ['suzhou_sales_team'] }
  ];
  const courses = [
    { id: 'ALEVEL', name: 'ALEVEL', path: ['英联邦', '英联邦学科', 'ALEVEL'], campuses: ['yashi', 'hongshou', 'suyue', 'pudong', ...addedCampuses], sources: ['oxmu_sales', 'union_sales', 'suzhou_sales'] },
    { id: 'TOEFL', name: '托福', path: ['英联邦', '英联邦语培', '托福'], campuses: ['yashi', 'hongshou', ...addedCampuses], sources: ['oxmu_sales', 'union_sales'] },
    { id: 'IELTS', name: '雅思', path: ['英联邦', '英联邦语培', '雅思'], campuses: ['yashi', 'pudong', ...addedCampuses], sources: ['union_sales', 'suzhou_sales'] },
    { id: 'IB', name: 'IB', path: ['英联邦', '英联邦学科', 'IB'], campuses: ['yashi', 'hongshou', 'suyue', 'pudong', ...addedCampuses], sources: ['oxmu_sales', 'union_sales', 'suzhou_sales'] },
    { id: 'AP', name: 'AP', path: ['橡沐', '橡沐学科', 'AP'], campuses: ['yashi', 'hongshou', 'suyue', 'pudong', ...addedCampuses], sources: ['oxmu_sales', 'union_sales', 'suzhou_sales'] },
    { id: 'SAT', name: 'SAT', path: ['橡沐', '橡沐语培', 'SAT'], campuses: ['yashi', 'hongshou', 'suyue', ...addedCampuses], sources: ['oxmu_sales', 'union_sales', 'suzhou_sales'] },
    { id: 'GRE', name: 'GRE', path: ['橡沐', '橡沐语培', 'GRE'], campuses: ['yashi', 'suyue', ...addedCampuses], sources: ['oxmu_sales', 'union_sales', 'suzhou_sales'] }
  ];
  const orgs = [
    { id: 'oxmu', name: '橡沐教学架构', shortName: '橡沐', fullName: '唯寻上海-橡沐中心', parent: null },
    { id: 'oxmu_teaching', name: '橡沐教学部', shortName: '橡沐教学部', fullName: '唯寻上海-橡沐中心-教学部', parent: 'oxmu' },
    { id: 'oxmu_tutoring', name: '橡沐辅导组', shortName: '橡沐辅导组', fullName: '唯寻上海-橡沐中心-辅导组', parent: 'oxmu' },
    { id: 'union', name: '英联邦教学架构', shortName: '英联邦', fullName: '唯寻上海-英联邦', parent: null },
    { id: 'union_puxi', name: '英联邦浦西中心', shortName: '英联邦浦西', fullName: '唯寻上海-英联邦浦西', parent: 'union' },
    { id: 'union_puxi_teaching', name: '班课教学部', shortName: '浦西班课教学部', fullName: '唯寻上海-英联邦浦西-班课教学部', parent: 'union_puxi' },
    { id: 'union_puxi_tutoring', name: '一对一教学组', shortName: '浦西一对一教学组', fullName: '唯寻上海-英联邦浦西-一对一教学组', parent: 'union_puxi' },
    { id: 'union_pudong', name: '英联邦浦东中心', shortName: '英联邦浦东', fullName: '唯寻上海-英联邦浦东', parent: 'union' },
    { id: 'union_pudong_teaching', name: '教学部', shortName: '浦东教学部', fullName: '唯寻上海-英联邦浦东-教学部', parent: 'union_pudong' },
    { id: 'union_suzhou', name: '英联邦苏州中心', shortName: '苏州分校', fullName: '唯寻江苏-唯寻苏州', parent: 'union' },
    { id: 'union_suzhou_teaching', name: '教学部', shortName: '苏州教学部', fullName: '唯寻江苏-唯寻苏州-教学部', parent: 'union_suzhou' },
    { id: 'full_day', name: '全日制学科架构', shortName: '全日制学科', fullName: '唯寻上海-全日制学科', parent: null },
    { id: 'full_day_teaching', name: '学科教学部', shortName: '全日制教学部', fullName: '唯寻上海-全日制学科-学科教学部', parent: 'full_day' }
  ];
  const orgTree = [
    { id: 'company', name: '上海帆寻科技有限公司', parent: null },
    { id: 'shanghai', name: '唯寻上海', parent: 'company' },
    { id: 'oxmu', name: '橡沐中心', parent: 'shanghai', teacherId: 'oxmu', sourceId: 'oxmu_sales' },
    { id: 'oxmu_teaching', name: '教学部', parent: 'oxmu', teacherId: 'oxmu_teaching' },
    { id: 'oxmu_tutoring', name: '辅导组', parent: 'oxmu', teacherId: 'oxmu_tutoring' },
    { id: 'union', name: '英联邦教学架构', parent: 'shanghai', teacherId: 'union' },
    { id: 'union_puxi', name: '英联邦浦西', parent: 'shanghai', teacherId: 'union_puxi', sourceId: 'union_sales' },
    { id: 'union_puxi_teaching', name: '班课教学部', parent: 'union_puxi', teacherId: 'union_puxi_teaching' },
    { id: 'union_puxi_tutoring', name: '一对一教学组', parent: 'union_puxi', teacherId: 'union_puxi_tutoring' },
    { id: 'union_pudong', name: '英联邦浦东', parent: 'shanghai', teacherId: 'union_pudong' },
    { id: 'union_pudong_teaching', name: '教学部', parent: 'union_pudong', teacherId: 'union_pudong_teaching' },
    { id: 'full_day', name: '全日制学科', parent: 'shanghai', teacherId: 'full_day' },
    { id: 'full_day_teaching', name: '学科教学部', parent: 'full_day', teacherId: 'full_day_teaching' },
    { id: 'jiangsu', name: '唯寻江苏', parent: 'company' },
    { id: 'union_suzhou', name: '唯寻苏州', parent: 'jiangsu', teacherId: 'union_suzhou', sourceId: 'suzhou_sales' },
    { id: 'union_suzhou_teaching', name: '教学部', parent: 'union_suzhou', teacherId: 'union_suzhou_teaching' }
  ];
  const tier = (orgIds, approvalRequired = false, approvalText = '') => {
    const selected = [...new Set(Array.isArray(orgIds) ? orgIds : orgIds ? [orgIds] : [])];
    return { orgIds: selected, job: 'ALL', descendants: true, approvalRequired, approvalText };
  };
  const entry = (id, mode, conditions, tiers) => ({ id, mode, conditions, tiers });
  const defaults = [
    { id: 'G001', name: '英联邦课程规则', courseIds: ['ALEVEL'], entries: [
      entry('R001', 'OFFLINE_OMO', ['yashi', 'hongshou'], [tier('union_puxi'), tier('union_pudong'), tier('oxmu_teaching')]),
      entry('R002', 'OFFLINE_OMO', ['suyue'], [tier('union_suzhou'), tier('union_puxi')]),
      entry('R003', 'OFFLINE_OMO', ['pudong'], [tier('union_pudong'), tier('union_puxi')]),
      entry('R004', 'ONLINE', ['oxmu_sales'], [tier('oxmu'), tier('union_puxi'), tier('union_pudong')]),
      entry('R005', 'ONLINE', ['union_sales', 'suzhou_sales'], [tier('union_puxi'), tier('union_pudong'), tier('union_suzhou')])
    ] },
    { id: 'G002', name: '托福课程规则', courseIds: ['TOEFL'], entries: [
      entry('R006', 'OFFLINE_OMO', ['yashi', 'hongshou'], [tier('union_puxi', true, '推荐英联邦浦西中心老师需先由所属教学部门负责人审批。'), tier('oxmu_teaching', true, '推荐橡沐教学部老师需先向该部门负责人提交跨团队排课审批。')]),
      entry('R007', 'ONLINE', ['oxmu_sales', 'union_sales'], [tier('oxmu'), tier('union_puxi')])
    ] },
    { id: 'G003', name: '雅思课程规则', courseIds: ['IELTS'], entries: [
      entry('R008', 'OFFLINE_OMO', ['yashi', 'pudong'], [tier('union_puxi'), tier('union_pudong')]),
      entry('R009', 'ONLINE', ['union_sales', 'suzhou_sales'], [tier('union_puxi'), tier('union_suzhou')])
    ] }
  ];

  let saved;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(PREVIOUS_KEY) || 'null'); } catch { saved = null; }
  function normalizeEntry(raw) {
    const tiers = [];
    for (const old of Array.isArray(raw.tiers) ? raw.tiers : []) {
      const previousApprovals = Object.values(old.approvalByOrg || {}).filter(item => item?.required);
      const approvalRequired = !!old.approvalRequired || previousApprovals.length > 0;
      const approvalText = [...new Set([old.approvalText, ...previousApprovals.map(item => item.text)].map(value => String(value || '').trim()).filter(Boolean))].join('；').slice(0, 300);
      const row = tier(Array.isArray(old.orgIds) ? old.orgIds : old.orgId || '', approvalRequired, approvalText);
      const duplicate = tiers.find(item => row.orgIds.length && item.orgIds.join('|') === row.orgIds.join('|'));
      if (!duplicate) { tiers.push(row); continue; }
      duplicate.approvalRequired ||= row.approvalRequired;
      if (row.approvalText && !duplicate.approvalText.includes(row.approvalText)) duplicate.approvalText = [duplicate.approvalText, row.approvalText].filter(Boolean).join('；').slice(0, 300);
    }
    const mode = raw.mode === 'ONLINE' ? 'ONLINE' : 'OFFLINE_OMO';
    const conditions = Array.isArray(raw.conditions) ? raw.conditions.map(id => mode === 'OFFLINE_OMO' && id === 'suzhou' ? 'suyue' : id) : [];
    return { id: String(raw.id || ''), mode, conditions: [...new Set(conditions)], tiers };
  }
  function loadGroups() {
    if (Array.isArray(saved?.groups)) return saved.groups.map(group => ({ id: String(group.id), name: String(group.name || ''), courseIds: [...new Set(Array.isArray(group.courseIds) ? group.courseIds : [])], entries: (group.entries || []).map(normalizeEntry) }));
    if (!Array.isArray(saved?.rules)) return clone(defaults);
    return courses.filter(course => saved.rules.some(rule => rule.course === course.id)).map((course, index) => ({
      id: `G${String(index + 1).padStart(3, '0')}`,
      name: String(saved.names?.[course.id] || `${course.name}课程规则`),
      courseIds: [course.id],
      entries: saved.rules.filter(rule => rule.course === course.id).map(normalizeEntry)
    }));
  }
  const state = { groups: loadGroups(), editing: null, attemptedSave: false, creatingCourseIds: [], creatingPicker: { open: false, root: '英联邦', branch: '英联邦学科' }, activeOrgPopover: null };
  const courseName = id => courses.find(item => item.id === id)?.name || id;
  const coursePath = id => courses.find(item => item.id === id)?.path.join(' / ') || courseName(id);
  const orgName = id => { const item = orgs.find(org => org.id === id); return item?.shortName || item?.name || '未选择架构'; };
  const orgFullName = id => { const item = orgs.find(org => org.id === id); return item?.fullName || (item?.parent ? `${orgFullName(item.parent)}-${item.name}` : item?.name) || '未选择架构'; };
  function compactOrgPath(fullName) {
    const chars = [...String(fullName || '')];
    if (chars.length <= 7) return fullName;
    const prefix = chars.slice(0, 7).join('');
    const levels = fullName.split('-');
    return levels.length > 2 ? `${prefix}...${levels.at(-1)}` : `${prefix}...`;
  }
  const conditionOptions = mode => mode === 'ONLINE' ? sources : campuses;
  const conditionName = (mode, id) => conditionOptions(mode).find(item => item.id === id)?.name || id;
  const conditionFullName = (mode, id) => { const item = conditionOptions(mode).find(option => option.id === id); return item?.fullName || item?.name || id; };
  const defaultTreeExpanded = () => new Set(orgTree.map(node => node.id));
  function editableOrgTree(kind, selectedIds, expanded, allowedIds = null) {
    const field = `${kind}Id`;
    const childrenOf = id => orgTree.filter(node => node.parent === id);
    const visible = node => !!node[field] || childrenOf(node.id).some(visible);
    const row = node => {
      if (!visible(node)) return '';
      const children = childrenOf(node.id).filter(visible);
      const open = expanded.has(node.id);
      const value = node[field];
      const selected = value && selectedIds.includes(value);
      const allowed = !allowedIds || allowedIds.has(value) || selected;
      const toggle = children.length ? `<button type="button" class="org-tree-caret" data-tree-toggle="${node.id}" aria-expanded="${open}" aria-label="${open ? '收起' : '展开'}${escapeHtml(node.name)}">${open ? '▾' : '▸'}</button>` : '<span class="org-tree-caret"></span>';
      const check = value ? `<button type="button" class="org-tree-box ${selected ? 'checked' : ''}" data-tree-select="${kind}" data-tree-value="${value}" role="checkbox" aria-checked="${!!selected}" aria-label="选择${escapeHtml(node.name)}" ${allowed ? '' : 'disabled'}>${selected ? '✓' : ''}</button>` : '<span class="org-tree-box org-tree-box-empty" aria-hidden="true"></span>';
      const label = value ? `<button type="button" class="org-tree-label" data-tree-select="${kind}" data-tree-value="${value}" title="${escapeHtml(node.name)}" ${allowed ? '' : 'disabled'}>${escapeHtml(node.name)}</button>` : `<span class="org-tree-label">${escapeHtml(node.name)}</span>`;
      return `<div class="org-tree-node" role="treeitem" aria-expanded="${children.length ? open : false}"><div class="org-tree-line">${toggle}${check}${label}</div>${children.length && open ? `<div class="org-tree-children" role="group">${children.map(row).join('')}</div>` : ''}</div>`;
    };
    return `<div class="org-tree org-tree-edit" role="tree">${orgTree.filter(node => node.parent === null).map(row).join('')}</div>`;
  }
  const nextId = (prefix, ids) => `${prefix}${String(Math.max(0, ...ids.map(id => Number(String(id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')}`;
  const nextGroupId = () => nextId('G', state.groups.map(group => group.id));
  const nextEntryId = () => nextId('R', state.groups.flatMap(group => group.entries.map(item => item.id)));
  function orgScope(id) {
    if (!id) return [];
    const children = parent => orgs.filter(item => item.parent === parent).flatMap(item => [item.id, ...children(item.id)]);
    return [id, ...children(id)];
  }
  function groupIssues(group, groups = state.groups) {
    const issues = [];
    const name = group.name.trim();
    if (!name) issues.push('请输入规则名称。');
    if (groups.some(other => other.id !== group.id && other.name.trim() === name)) issues.push('规则名称已被使用。');
    for (const courseId of group.courseIds) {
      if (!courses.some(item => item.id === courseId)) issues.push(`课程项 ${courseId} 不存在。`);
      if (groups.some(other => other.id !== group.id && other.courseIds.includes(courseId))) issues.push(`${courseName(courseId)}已归属于其他规则，请先从原规则中移除。`);
    }
    const scenes = new Set(), onlineDepartments = new Map();
    for (const rule of group.entries) {
      const label = `${modeNames[rule.mode]}规则`;
      if (!rule.conditions.length) issues.push(`${label}需要选择适用条件。`);
      if (!rule.tiers.length) issues.push(`${label}需要添加教师架构。`);
      for (const condition of rule.conditions) {
        if (!conditionOptions(rule.mode).some(item => item.id === condition)) issues.push(`${label}包含未知条件 ${condition}。`);
        const key = `${rule.mode}|${condition}`;
        if (scenes.has(key)) issues.push(`${label}中的${conditionName(rule.mode, condition)}重复配置。`);
        scenes.add(key);
        if (rule.mode === 'ONLINE') {
          const source = sources.find(item => item.id === condition);
          for (const department of source?.departments || []) {
            const previous = onlineDepartments.get(department);
            if (previous && previous !== condition) issues.push(`${conditionName('ONLINE', previous)}与${conditionName('ONLINE', condition)}覆盖同一发起部门。`);
            onlineDepartments.set(department, condition);
          }
        }
        for (const courseId of group.courseIds) {
          const course = courses.find(item => item.id === courseId);
          if (course && !(rule.mode === 'ONLINE' ? course.sources : course.campuses).includes(condition)) issues.push(`${course.name}不适用${conditionName(rule.mode, condition)}，请调整课程项或条件。`);
        }
      }
      const used = new Map();
      rule.tiers.forEach((row, index) => {
        if (!row.orgIds?.length) { issues.push(`${label}的第 ${index + 1} 位尚未选择教师架构。`); return; }
        if (row.approvalRequired && !String(row.approvalText || '').trim()) issues.push(`${label}的第 ${index + 1} 位勾选了排课需审批，请填写提示文案。`);
        for (const orgId of row.orgIds) {
          if (!orgs.some(item => item.id === orgId)) { issues.push(`${label}的第 ${index + 1} 位包含未知教师架构 ${orgId}。`); continue; }
          for (const member of orgScope(orgId)) {
            if (used.has(member)) {
              const previous = used.get(member);
              issues.push(previous === index ? `${label}的第 ${index + 1} 位所选教师架构范围交叉。` : `${label}的第 ${previous + 1} 位与第 ${index + 1} 位教师架构范围交叉。`);
              break;
            }
            used.set(member, index);
          }
        }
      });
    }
    return [...new Set(issues)];
  }
  const groupActive = group => group.courseIds.length > 0 && group.entries.length > 0 && groupIssues(group).length === 0;
  function flatRules() {
    return state.groups.flatMap(group => group.courseIds.flatMap(course => group.entries.map(rule => ({
      id: `${rule.id}_${course}`, groupId: group.id, course, mode: rule.mode,
      conditions: clone(rule.conditions), tiers: clone(rule.tiers)
    }))));
  }
  function published() {
    return Object.fromEntries(courses.map(course => {
      const matches = state.groups.filter(group => group.courseIds.includes(course.id));
      return [course.id, matches.length === 1 && groupActive(matches[0])];
    }));
  }
  function syncToScheduling() {
    if (window.parent && window.parent !== window && typeof window.parent.postMessage === 'function') window.parent.postMessage({ kind: 'TEACHER_PRIORITY_CONFIG', rules: flatRules(), published: published() }, '*');
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ groups: state.groups, rules: flatRules(), published: published() })); }
    catch { toast('当前浏览器无法保存演示数据'); }
    syncToScheduling();
  }
  function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2600); }
  function orgHierarchyPopover(key, fullNames) {
    if (state.activeOrgPopover !== key) return '';
    return `<div class="org-detail-popover" role="dialog" aria-label="完整组织架构"><div class="org-detail-heading"><strong>完整组织架构</strong><button type="button" data-close-org-popover aria-label="关闭架构信息">×</button></div><div class="org-detail-list" role="list">${fullNames.map(name => `<div class="org-detail-item" role="listitem">${escapeHtml(name)}</div>`).join('')}</div></div>`;
  }
  function priorityPreview(group, rule) {
    return rule.tiers.map((row, index) => {
      const key = `teacher:${group.id}:${rule.id}:${index}`;
      const fullNames = row.orgIds.map(orgFullName);
      const summary = fullNames.length ? compactOrgPath(fullNames[0]) : '未选择架构';
      return `<div class="org-detail-anchor"><button type="button" class="org-chip" data-show-org-path="${escapeHtml(key)}" aria-expanded="${state.activeOrgPopover === key}" aria-label="查看完整教师组织架构"><span class="org-chip-name">${escapeHtml(summary)}</span>${fullNames.length > 1 ? `<b class="org-selection-count">+${fullNames.length - 1}</b>` : ''}${row.approvalRequired ? `<span class="approval-mark" aria-label="审批提示：${escapeHtml(row.approvalText)}">排课需审批<span class="approval-tooltip" role="tooltip">${escapeHtml(row.approvalText)}</span></span>` : ''}</button>${orgHierarchyPopover(key, fullNames)}</div>`;
    }).join('<i>›</i>') || '<span>尚未配置教师架构</span>';
  }
  function conditionPreview(group, rule) {
    if (rule.mode !== 'ONLINE') return `<strong title="${escapeHtml(rule.conditions.map(id => conditionFullName(rule.mode, id)).join('、'))}">${rule.conditions.length ? rule.conditions.map(id => escapeHtml(conditionName(rule.mode, id))).join('、') : '未选择'}</strong>`;
    if (!rule.conditions.length) return '<strong>未选择</strong>';
    const key = `source:${group.id}:${rule.id}:all`;
    const fullNames = rule.conditions.map(id => conditionFullName(rule.mode, id));
    const summary = compactOrgPath(fullNames[0]);
    return `<div class="source-org-list"><div class="org-detail-anchor"><button type="button" class="source-org-button" data-show-org-path="${escapeHtml(key)}" aria-expanded="${state.activeOrgPopover === key}" aria-label="查看完整排课单发起人组织架构" title="${escapeHtml(fullNames.join('、'))}">${escapeHtml(summary)}${fullNames.length > 1 ? `<b class="org-selection-count">+${fullNames.length - 1}</b>` : ''}</button>${orgHierarchyPopover(key, fullNames)}</div></div>`;
  }
  function modeModule(group, mode) {
    const rules = group.entries.filter(rule => rule.mode === mode);
    return `<section class="group-module"><div class="group-module-head"><h3>${modeNames[mode]}规则</h3><button type="button" data-add-entry="${mode}" data-group="${escapeHtml(group.id)}">＋ ${mode === 'ONLINE' ? '新增线上规则' : '新增线下/OMO规则'}</button></div><div class="group-module-body">${rules.length ? rules.map(rule => `<div class="group-subrule ${state.activeOrgPopover?.includes(`:${rule.id}:`) ? 'is-org-popover-open' : ''}"><div class="subrule-top"><div class="subrule-field"><span>${mode === 'ONLINE' ? '排课发起人：' : '授课校区：'}</span>${conditionPreview(group, rule)}</div><button type="button" data-edit-entry="${escapeHtml(rule.id)}" data-group="${escapeHtml(group.id)}">编辑 →</button></div><div class="subrule-priority"><span>教师组织优先级：</span><div class="priority-preview">${priorityPreview(group, rule)}</div></div></div>`).join('') : '<div class="group-empty">暂无规则</div>'}</div></section>`;
  }
  function groupCard(group) {
    return `<article class="group-card"><header class="group-card-head"><h2>${escapeHtml(group.name)}</h2><div class="group-card-actions"><button type="button" class="button button-quiet" data-edit-group="${escapeHtml(group.id)}">编辑基本信息</button></div></header><div class="group-course-panel"><small>适用课程项</small><div class="group-course-items">${group.courseIds.length ? group.courseIds.map(id => `<span title="${escapeHtml(coursePath(id))}">${escapeHtml(coursePath(id))}</span>`).join('') : '<span class="unassigned">尚未选择课程项</span>'}</div></div><div class="group-modules">${modeModule(group, 'OFFLINE_OMO')}${modeModule(group, 'ONLINE')}</div></article>`;
  }
  function render() { $('#groupList').innerHTML = state.groups.length ? state.groups.map(groupCard).join('') : '<div class="group-empty-page">暂无教师排课规则，点击“新增教师排课规则”开始配置。</div>'; }
  function openModal(title, body, actions) { $('#modalTitle').textContent = title; $('#modalBody').innerHTML = body; $('#modalActions').innerHTML = actions; $('#modalBackdrop').hidden = false; }
  function closeModal() { $('#modalBackdrop').hidden = true; }
  function initialPicker(selectedIds) {
    const first = courses.find(course => course.id === selectedIds[0]) || courses[0];
    return { open: false, root: first.path[0], branch: first.path[1] };
  }
  function coursePickerHtml(selectedIds, picker, ownerId = null) {
    const selectable = course => !state.groups.some(group => group.id !== ownerId && group.courseIds.includes(course.id));
    const roots = [...new Set(courses.map(course => course.path[0]))];
    const root = roots.includes(picker.root) ? picker.root : roots[0];
    const branches = [...new Set(courses.filter(course => course.path[0] === root).map(course => course.path[1]))];
    const branch = branches.includes(picker.branch) ? picker.branch : branches[0];
    const allSelected = list => list.length > 0 && list.every(course => selectedIds.includes(course.id));
    const rootsHtml = roots.map(name => {
      const available = courses.filter(course => course.path[0] === name && selectable(course));
      return `<div class="picker-row ${name === root ? 'active' : ''}"><button type="button" class="picker-check" data-picker-select-root="${escapeHtml(name)}" aria-label="选择${escapeHtml(name)}全部课程项" ${available.length ? '' : 'disabled'}>${allSelected(available) ? '☑' : '□'}</button><button type="button" class="picker-name" data-picker-root="${escapeHtml(name)}">${escapeHtml(name)}<span>›</span></button></div>`;
    }).join('');
    const branchesHtml = branches.map(name => {
      const available = courses.filter(course => course.path[0] === root && course.path[1] === name && selectable(course));
      return `<div class="picker-row ${name === branch ? 'active' : ''}"><button type="button" class="picker-check" data-picker-select-branch="${escapeHtml(name)}" aria-label="选择${escapeHtml(name)}全部课程项" ${available.length ? '' : 'disabled'}>${allSelected(available) ? '☑' : '□'}</button><button type="button" class="picker-name" data-picker-branch="${escapeHtml(name)}">${escapeHtml(name)}<span>›</span></button></div>`;
    }).join('');
    const leavesHtml = courses.filter(course => course.path[0] === root && course.path[1] === branch).map(course => `<button type="button" class="picker-leaf ${selectedIds.includes(course.id) ? 'selected' : ''}" data-picker-course="${course.id}" title="${selectable(course) ? escapeHtml(coursePath(course.id)) : '已用于其他规则'}" ${selectable(course) ? '' : 'disabled'}><span>${selectedIds.includes(course.id) ? '☑' : '□'}</span>${escapeHtml(course.name)}</button>`).join('');
    const chosen = selectedIds.map(coursePath);
    const summary = chosen.length ? `<span class="picker-path" title="${escapeHtml(chosen[0])}">${escapeHtml(chosen[0])}</span>${chosen.length > 1 ? `<span class="picker-more">+${chosen.length - 1}</span>` : ''}` : '<span class="picker-placeholder">请选择适用课程项</span>';
    return `<button type="button" class="picker-trigger" data-picker-toggle aria-expanded="${picker.open}"><span class="picker-summary">${summary}</span><span class="picker-caret">⌄</span></button><div class="picker-popover" ${picker.open ? '' : 'hidden'}><div class="picker-column">${rootsHtml}</div><div class="picker-column">${branchesHtml}</div><div class="picker-column">${leavesHtml}</div></div>`;
  }
  function handleCoursePicker(event, selectedIds, picker, ownerId, rerender) {
    const selectable = course => !state.groups.some(group => group.id !== ownerId && group.courseIds.includes(course.id));
    const toggleGroup = list => {
      const available = list.filter(selectable);
      const add = available.some(course => !selectedIds.includes(course.id));
      for (const course of available) {
        const index = selectedIds.indexOf(course.id);
        if (add && index < 0) selectedIds.push(course.id);
        if (!add && index >= 0) selectedIds.splice(index, 1);
      }
    };
    const rootSelect = event.target.closest('[data-picker-select-root]');
    if (rootSelect) { toggleGroup(courses.filter(course => course.path[0] === rootSelect.dataset.pickerSelectRoot)); picker.root = rootSelect.dataset.pickerSelectRoot; picker.branch = courses.find(course => course.path[0] === picker.root)?.path[1] || ''; rerender(); return true; }
    const branchSelect = event.target.closest('[data-picker-select-branch]');
    if (branchSelect) { toggleGroup(courses.filter(course => course.path[0] === picker.root && course.path[1] === branchSelect.dataset.pickerSelectBranch)); picker.branch = branchSelect.dataset.pickerSelectBranch; rerender(); return true; }
    const leaf = event.target.closest('[data-picker-course]');
    if (leaf) { const course = courses.find(item => item.id === leaf.dataset.pickerCourse); if (course && selectable(course)) { const index = selectedIds.indexOf(course.id); index >= 0 ? selectedIds.splice(index, 1) : selectedIds.push(course.id); rerender(); } return true; }
    const root = event.target.closest('[data-picker-root]');
    if (root) { picker.root = root.dataset.pickerRoot; picker.branch = courses.find(course => course.path[0] === picker.root)?.path[1] || ''; picker.open = true; rerender(); return true; }
    const branch = event.target.closest('[data-picker-branch]');
    if (branch) { picker.branch = branch.dataset.pickerBranch; picker.open = true; rerender(); return true; }
    if (event.target.closest('[data-picker-toggle]')) { picker.open = !picker.open; rerender(); return true; }
    return false;
  }
  function renderCreateCourseChoices() {
    $('#createCourseChoices').innerHTML = coursePickerHtml(state.creatingCourseIds, state.creatingPicker);
  }
  function createGroup() {
    const name = ($('#newGroupName')?.value || '').trim();
    if (!name) { toast('请输入规则名称'); return; }
    if (!state.creatingCourseIds.length) { toast('请选择适用课程项'); return; }
    if (state.groups.some(group => group.name.trim() === name)) { toast('规则名称已被使用'); return; }
    if (state.creatingCourseIds.some(id => state.groups.some(group => group.courseIds.includes(id)))) { toast('课程项已用于其他规则'); return; }
    state.groups.push({ id: nextGroupId(), name, courseIds: [...state.creatingCourseIds], entries: [] });
    persist(); closeModal(); render(); toast('规则已创建，可按授课模式新增小规则');
  }
  function openGroupEditor(group) {
    state.editing = { type: 'group', groupId: group.id, draft: clone(group), original: JSON.stringify(group), picker: initialPicker(group.courseIds) };
    state.attemptedSave = false;
    $('#drawerBackdrop').hidden = false;
    renderEditor();
  }
  function openEntryEditor(group, rule = null, mode = null) {
    const draft = rule ? clone(rule) : entry(nextEntryId(), mode, [], []);
    state.editing = { type: 'entry', groupId: group.id, isNew: !rule, draft, original: JSON.stringify(draft), campusOpen: false, openTeacherTree: null, treeExpanded: defaultTreeExpanded() };
    state.attemptedSave = false;
    $('#drawerBackdrop').hidden = false;
    renderEditor();
  }
  function closeEditor(force = false) {
    if (!force && state.editing && JSON.stringify(state.editing.draft) !== state.editing.original) {
      openModal('放弃未保存的修改？', '<p class="modal-intro">当前修改尚未保存。</p>', '<button type="button" class="button button-quiet" data-close-modal>继续编辑</button><button type="button" class="button button-primary" data-confirm-discard>放弃修改</button>');
      return;
    }
    state.editing = null;
    $('#drawerBackdrop').hidden = true;
  }
  function entryGroupDraft() {
    const group = clone(state.groups.find(item => item.id === state.editing.groupId));
    const draft = state.editing.draft;
    group.entries = state.editing.isNew ? [...group.entries, clone(draft)] : group.entries.map(item => item.id === draft.id ? clone(draft) : item);
    return group;
  }
  function renderEditor() {
    if (!state.editing) return;
    const { type, draft, groupId } = state.editing;
    const group = state.groups.find(item => item.id === groupId);
    $('#groupFields').hidden = type !== 'group';
    $('#entryFields').hidden = type !== 'entry';
    $('#cancelDrawer').hidden = type === 'entry' && state.editing.isNew;
    $('#deleteGroup').hidden = type === 'entry' && state.editing.isNew;
    $('#deleteGroup').textContent = '删除';
    $('#saveGroup').textContent = type === 'group' ? '保存基本信息' : '保存规则';
    if (type === 'group') {
      $('#drawerTitle').textContent = '编辑基本信息';
      $('#editGroupName').value = draft.name;
      $('#courseChoices').innerHTML = coursePickerHtml(draft.courseIds, state.editing.picker, draft.id);
    } else {
      $('#drawerTitle').textContent = `${state.editing.isNew ? '新增' : '编辑'}${draft.mode === 'ONLINE' ? '线上规则' : '线下/OMO规则'}`;
      $('#entryParent').textContent = `适用课程项：${group.courseIds.map(courseName).join('、')}`;
      $('#entryConditionTitle').textContent = draft.mode === 'ONLINE' ? '排课发起人（可多选）' : '授课校区（可多选）';
      const selectedCourses = group.courseIds.map(id => courses.find(item => item.id === id)).filter(Boolean);
      const optionsHtml = conditionOptions(draft.mode).map(option => {
        const selected = draft.conditions.includes(option.id);
        const allowed = selectedCourses.every(course => (draft.mode === 'ONLINE' ? course.sources : course.campuses).includes(option.id));
        if (draft.mode === 'OFFLINE_OMO') return `<button type="button" class="campus-option ${selected ? 'selected' : ''}" data-condition="${option.id}" aria-pressed="${selected}" title="${escapeHtml(option.name)}" ${allowed || selected ? '' : 'disabled'}>${escapeHtml(option.name)}${selected ? '<b aria-hidden="true">✓</b>' : ''}</button>`;
        return '';
      }).join('');
      $('#entryConditionChoices').className = draft.mode === 'OFFLINE_OMO' ? 'campus-picker-host' : 'source-tree-host';
      const chosenCampuses = draft.conditions.map(id => conditionName('OFFLINE_OMO', id));
      const campusSummary = chosenCampuses.length ? `${chosenCampuses.slice(0, 2).join('、')}${chosenCampuses.length > 2 ? ` +${chosenCampuses.length - 2}` : ''}` : '请选择校区';
      const allowedSources = new Set(sources.filter(source => selectedCourses.every(course => course.sources.includes(source.id))).map(source => source.id));
      $('#entryConditionChoices').innerHTML = draft.mode === 'OFFLINE_OMO' ? `<button type="button" class="campus-trigger ${chosenCampuses.length ? 'has-value' : ''}" data-campus-toggle aria-expanded="${state.editing.campusOpen}" title="${escapeHtml(chosenCampuses.join('、'))}"><span>${escapeHtml(campusSummary)}</span><i aria-hidden="true">${state.editing.campusOpen ? '⌃' : '⌄'}</i></button><div class="campus-dropdown" ${state.editing.campusOpen ? '' : 'hidden'}>${optionsHtml}</div>` : editableOrgTree('source', draft.conditions, state.editing.treeExpanded, allowedSources);
      $('#entryPriorityList').innerHTML = draft.tiers.length ? draft.tiers.map((row, index) => {
        const fullNames = row.orgIds.map(orgFullName);
        const summary = fullNames.length ? `${fullNames[0]}${fullNames.length > 1 ? ` +${fullNames.length - 1}` : ''}` : '选择教师架构';
        return `<div class="priority-row ${state.editing.openTeacherTree === index ? 'tree-open' : ''}" data-tier="${index}"><span class="priority-rank">${index + 1}</span><div class="teacher-org-picker"><button type="button" class="teacher-org-trigger ${row.orgIds.length ? 'has-value' : ''}" data-open-teacher-tree="${index}" aria-expanded="${state.editing.openTeacherTree === index}" title="${escapeHtml(fullNames.join('、'))}"><span>${escapeHtml(summary)}</span><i aria-hidden="true">⌄</i></button>${state.editing.openTeacherTree === index ? editableOrgTree('teacher', row.orgIds, state.editing.treeExpanded) : ''}</div><div class="priority-options"><label class="approval-option ${row.approvalRequired ? 'selected' : ''}"><input type="checkbox" data-field="approvalRequired" ${row.approvalRequired ? 'checked' : ''}>排课需审批</label>${row.approvalRequired ? `<input type="text" class="approval-text-input" data-field="approvalText" maxlength="300" placeholder="请输入审批提示文案" value="${escapeHtml(row.approvalText)}">` : ''}</div><div class="row-actions"><button type="button" data-move="up" aria-label="上移" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-move="down" aria-label="下移" ${index === draft.tiers.length - 1 ? 'disabled' : ''}>↓</button><button type="button" class="danger" data-remove-tier aria-label="删除架构">×</button></div></div>`;
      }).join('') : '<div class="priority-empty">尚未添加教师架构</div>';
    }
    const proposed = type === 'group' ? draft : entryGroupDraft();
    const issues = state.attemptedSave ? groupIssues(proposed, [...state.groups.filter(item => item.id !== groupId), proposed]) : [];
    $('#drawerValidation').hidden = !issues.length;
    $('#drawerValidation').innerHTML = issues.length ? `<strong>请处理以下配置问题</strong>${issues.map(item => `<div>• ${escapeHtml(item)}</div>`).join('')}` : '';
  }
  function saveEditor() {
    if (!state.editing) return;
    const { type, groupId, draft } = state.editing;
    const proposed = type === 'group' ? draft : entryGroupDraft();
    const issues = groupIssues(proposed, [...state.groups.filter(item => item.id !== groupId), proposed]);
    if (issues.length) { state.attemptedSave = true; renderEditor(); toast('请先处理规则配置问题'); return; }
    state.groups = state.groups.map(item => item.id === groupId ? clone(proposed) : item);
    persist(); closeEditor(true); render(); toast(type === 'group' ? '基本信息已保存' : '小规则已保存');
  }

  $('#addTeacherRule').addEventListener('click', () => {
    state.creatingCourseIds = [];
    state.creatingPicker = initialPicker([]);
    openModal('新增教师排课规则', '<label class="name-field"><span>规则名称</span><input id="newGroupName" type="text" maxlength="40" placeholder="请输入规则名称"></label><div class="create-course-section"><strong>适用课程项（可多选）</strong><div class="course-picker" id="createCourseChoices"></div></div>', '<button type="button" class="button button-quiet" data-close-modal>取消</button><button type="button" class="button button-primary" data-confirm-create>提交</button>');
    renderCreateCourseChoices();
  });
  $('#groupList').addEventListener('click', event => {
    if (event.target.closest('.approval-mark')) { event.stopPropagation?.(); return; }
    const showOrg = event.target.closest('[data-show-org-path]');
    if (showOrg) { const key = showOrg.dataset.showOrgPath; state.activeOrgPopover = state.activeOrgPopover === key ? null : key; render(); event.stopPropagation?.(); return; }
    if (event.target.closest('[data-close-org-popover]')) { state.activeOrgPopover = null; render(); event.stopPropagation?.(); return; }
    const editGroup = event.target.closest('[data-edit-group]');
    if (editGroup) { const group = state.groups.find(item => item.id === editGroup.dataset.editGroup); if (group) openGroupEditor(group); return; }
    const add = event.target.closest('[data-add-entry]');
    if (add) { const group = state.groups.find(item => item.id === add.dataset.group); if (group) openEntryEditor(group, null, add.dataset.addEntry); return; }
    const editEntry = event.target.closest('[data-edit-entry]');
    if (editEntry) { const group = state.groups.find(item => item.id === editEntry.dataset.group); const rule = group?.entries.find(item => item.id === editEntry.dataset.editEntry); if (group && rule) openEntryEditor(group, rule); }
  });
  document.addEventListener('click', event => {
    if (state.activeOrgPopover && !event.target.closest('.org-detail-anchor')) { state.activeOrgPopover = null; render(); }
  });
  $('#courseChoices').addEventListener('click', event => {
    if (state.editing?.type !== 'group') return;
    handleCoursePicker(event, state.editing.draft.courseIds, state.editing.picker, state.editing.groupId, renderEditor);
  });
  $('#editGroupName').addEventListener('input', event => { if (state.editing?.type === 'group') state.editing.draft.name = event.target.value; });
  $('#drawerBackdrop').addEventListener('click', event => {
    if (event.target === $('#drawerBackdrop')) closeEditor();
    else if (state.editing?.type === 'entry' && state.editing.draft.mode === 'OFFLINE_OMO' && state.editing.campusOpen && !event.target.closest('#entryConditionChoices')) { state.editing.campusOpen = false; renderEditor(); }
    else if (state.editing?.type === 'entry' && state.editing.openTeacherTree !== null && !event.target.closest('.teacher-org-picker')) { state.editing.openTeacherTree = null; renderEditor(); }
  });
  $('#entryConditionChoices').addEventListener('click', event => {
    // 重绘选项后，原按钮会脱离 DOM；阻止同一次点击继续冒泡到抽屉并把下拉框关掉。
    event.stopPropagation?.();
    if (state.editing?.type === 'entry' && state.editing.draft.mode === 'ONLINE') {
      const toggle = event.target.closest('[data-tree-toggle]');
      if (toggle) { const id = toggle.dataset.treeToggle, expanded = state.editing.treeExpanded; expanded.has(id) ? expanded.delete(id) : expanded.add(id); renderEditor(); return; }
      const choice = event.target.closest('[data-tree-select="source"]');
      if (choice && !choice.disabled) { const list = state.editing.draft.conditions, id = choice.dataset.treeValue; list.includes(id) ? list.splice(list.indexOf(id), 1) : list.push(id); renderEditor(); }
      return;
    }
    if (event.target.closest('[data-campus-toggle]') && state.editing?.type === 'entry' && state.editing.draft.mode === 'OFFLINE_OMO') { state.editing.campusOpen = !state.editing.campusOpen; state.editing.openTeacherTree = null; renderEditor(); return; }
    const button = event.target.closest('[data-condition]');
    if (!button || button.disabled || state.editing?.type !== 'entry') return;
    const list = state.editing.draft.conditions, id = button.dataset.condition;
    list.includes(id) ? list.splice(list.indexOf(id), 1) : list.push(id);
    renderEditor();
  });
  $('#addTier').addEventListener('click', () => { if (state.editing?.type === 'entry') { state.editing.draft.tiers.push(tier('')); renderEditor(); } });
  $('#entryPriorityList').addEventListener('click', event => {
    event.stopPropagation?.();
    if (state.editing?.type !== 'entry') return;
    const row = event.target.closest('[data-tier]'); if (!row) return;
    const index = Number(row.dataset.tier), list = state.editing.draft.tiers;
    const toggle = event.target.closest('[data-tree-toggle]');
    if (toggle) { const id = toggle.dataset.treeToggle, expanded = state.editing.treeExpanded; expanded.has(id) ? expanded.delete(id) : expanded.add(id); renderEditor(); return; }
    const choice = event.target.closest('[data-tree-select="teacher"]');
    if (choice && !choice.disabled) { const selected = list[index].orgIds, id = choice.dataset.treeValue; selected.includes(id) ? selected.splice(selected.indexOf(id), 1) : selected.push(id); renderEditor(); return; }
    if (event.target.closest('[data-open-teacher-tree]')) { state.editing.openTeacherTree = state.editing.openTeacherTree === index ? null : index; state.editing.campusOpen = false; renderEditor(); return; }
    if (event.target.closest('[data-remove-tier]')) { list.splice(index, 1); state.editing.openTeacherTree = null; renderEditor(); return; }
    const move = event.target.closest('[data-move]'); if (!move) return;
    const next = index + (move.dataset.move === 'up' ? -1 : 1);
    if (next < 0 || next >= list.length) return;
    [list[index], list[next]] = [list[next], list[index]]; state.editing.openTeacherTree = null; renderEditor();
  });
  $('#entryPriorityList').addEventListener('change', event => {
    if (state.editing?.type !== 'entry') return;
    const row = event.target.closest('[data-tier]');
    if (!row || event.target.dataset.field !== 'approvalRequired') return;
    state.editing.draft.tiers[Number(row.dataset.tier)].approvalRequired = event.target.checked;
    renderEditor();
  });
  $('#entryPriorityList').addEventListener('input', event => {
    if (state.editing?.type !== 'entry' || event.target.dataset.field !== 'approvalText') return;
    const row = event.target.closest('[data-tier]');
    if (row) state.editing.draft.tiers[Number(row.dataset.tier)].approvalText = event.target.value;
  });
  $('#saveGroup').addEventListener('click', saveEditor);
  $('#closeDrawer').addEventListener('click', () => closeEditor());
  $('#cancelDrawer').addEventListener('click', () => closeEditor());
  $('#deleteGroup').addEventListener('click', () => {
    if (!state.editing) return;
    if (state.editing.type === 'entry' && state.editing.isNew) { closeEditor(true); return; }
    const group = state.groups.find(item => item.id === state.editing.groupId);
    const isEntry = state.editing.type === 'entry';
    openModal(isEntry ? '删除这条小规则？' : '删除整个规则？', isEntry ? `<p class="modal-intro">删除后，${escapeHtml(state.editing.draft.conditions.map(id => conditionName(state.editing.draft.mode, id)).join('、'))}将不再按这条教师架构顺序推荐。</p>` : `<p class="modal-intro">删除“${escapeHtml(group.name)}”后，该规则下所有线下／OMO和线上配置会一起删除。</p>`, '<button type="button" class="button button-quiet" data-close-modal>取消</button><button type="button" class="button button-primary" data-confirm-delete>删除规则</button>');
  });
  $('#closeModal').addEventListener('click', closeModal);
  $('#modalBackdrop').addEventListener('click', event => {
    if (event.target === $('#modalBackdrop') || event.target.closest('[data-close-modal]')) { closeModal(); return; }
    if ($('#createCourseChoices') && handleCoursePicker(event, state.creatingCourseIds, state.creatingPicker, null, renderCreateCourseChoices)) return;
    if (event.target.closest('[data-confirm-create]')) { createGroup(); return; }
    if (event.target.closest('[data-confirm-discard]')) { closeModal(); closeEditor(true); return; }
    if (event.target.closest('[data-confirm-delete]') && state.editing) {
      const { type, groupId, draft } = state.editing;
      if (type === 'group') state.groups = state.groups.filter(item => item.id !== groupId);
      else state.groups = state.groups.map(item => item.id === groupId ? { ...item, entries: item.entries.filter(rule => rule.id !== draft.id) } : item);
      persist(); closeModal(); closeEditor(true); render(); toast(type === 'group' ? '规则已删除' : '小规则已删除');
    }
  });
  $('#modalBackdrop').addEventListener('keydown', event => { if (event.key === 'Enter' && event.target.id === 'newGroupName') createGroup(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { if (!$('#modalBackdrop').hidden) closeModal(); else if (state.editing?.type === 'entry' && state.editing.openTeacherTree !== null) { state.editing.openTeacherTree = null; renderEditor(); } else if (state.editing?.type === 'entry' && state.editing.campusOpen) { state.editing.campusOpen = false; renderEditor(); } else if (!$('#drawerBackdrop').hidden) closeEditor(); else if (state.activeOrgPopover) { state.activeOrgPopover = null; render(); } } });
  if (typeof window.addEventListener === 'function') window.addEventListener('message', event => { if (event.data?.kind === 'REQUEST_TEACHER_PRIORITY_CONFIG') syncToScheduling(); });
  render(); syncToScheduling();
})();
