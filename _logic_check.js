const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

class Element {
  constructor() {
    this.dataset = {}; this.innerHTML = ''; this.textContent = ''; this.value = '';
    this.hidden = false; this.disabled = false; this.style = {}; this.listeners = {};
    this.classList = { add() {}, remove() {} };
  }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  fire(name, target = this) { assert(this.listeners[name], `missing listener ${name}`); this.listeners[name]({ target }); }
}
const nodes = new Map();
const get = selector => { if (!nodes.has(selector)) nodes.set(selector, new Element()); return nodes.get(selector); };
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
assert(html.includes('id="groupList"'));
assert(html.includes('＋ 新增教师排课规则'));
assert(html.includes('id="groupFields"'));
assert(html.includes('id="entryFields"'));
assert(!html.includes('架构规则覆盖'));
assert(fs.existsSync(path.join(__dirname, 'grouped.css')));
const styles = fs.readFileSync(path.join(__dirname, 'grouped.css'), 'utf8');
assert(styles.includes('.group-modules{display:flex;flex-direction:column'));
assert(styles.includes('.group-module h3::before'));
assert(styles.includes('.campus-dropdown{position:absolute'));
assert(styles.includes('.org-tree-edit{max-height:280px'));
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
ids.add('newGroupName'); ids.add('createCourseChoices');
assert.deepEqual([...new Set([...script.matchAll(/\$\('#([^']+)'\)/g)].map(match => match[1]).filter(id => !ids.has(id)))], []);

const storage = new Map();
const documentListeners = {};
vm.runInNewContext(script, {
  document: { querySelector: selector => selector === '#createCourseChoices' && !get('#modalBody').innerHTML.includes('id="createCourseChoices"') ? null : get(selector), addEventListener(name, handler) { documentListeners[name] = handler; } }, window: {},
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  setTimeout: () => 1, clearTimeout() {}, console
});
const count = (source, needle) => [...source.matchAll(new RegExp(needle, 'g'))].length;
const popupItems = () => get('#groupList').innerHTML.match(/<div class="org-detail-list" role="list">([\s\S]*?)<\/div><\/div>/)?.[1] || '';
const target = (selectors, value = {}) => ({ ...value, closest: selector => Object.hasOwn(selectors, selector) ? { dataset: selectors[selector] } : null });
const click = (root, selectors) => get(root).fire('click', target(selectors));
const clickConditionWithBubble = selectors => {
  let stopped = false;
  const event = { target: target(selectors), stopPropagation() { stopped = true; } };
  get('#entryConditionChoices').listeners.click(event);
  // 真实页面中重绘会使原目标脱离 DOM，继续冒泡时抽屉无法再识别它属于选项区。
  if (!stopped) get('#drawerBackdrop').listeners.click(event);
};
const clickPriorityWithBubble = selectors => {
  let stopped = false;
  const event = { target: target(selectors), stopPropagation() { stopped = true; } };
  get('#entryPriorityList').listeners.click(event);
  if (!stopped) get('#drawerBackdrop').listeners.click(event);
};
const tierTarget = (index, value = {}, extra = {}) => target({ '[data-tier]': { tier: String(index) }, ...extra }, value);
const chooseTeacherOrg = (index, id) => {
  clickPriorityWithBubble({ '[data-tier]': { tier: String(index) }, '[data-open-teacher-tree]': { openTeacherTree: String(index) } });
  assert(get('#entryPriorityList').innerHTML.includes('org-tree-edit'));
  clickPriorityWithBubble({ '[data-tier]': { tier: String(index) }, '[data-tree-select="teacher"]': { treeValue: id } });
};

assert.equal(count(get('#groupList').innerHTML, 'data-edit-group='), 3);
assert.equal(count(get('#groupList').innerHTML, 'data-edit-entry='), 9);
assert.equal(count(get('#groupList').innerHTML, 'data-add-entry='), 6);
assert.equal(count(get('#groupList').innerHTML, '＋ 新增线下/OMO规则'), 3);
assert.equal(count(get('#groupList').innerHTML, '＋ 新增线上规则'), 3);
assert(!get('#groupList').innerHTML.includes('新增小规则'));
assert(get('#groupList').innerHTML.includes('编辑基本信息'));
assert(get('#groupList').innerHTML.includes('编辑 →'));
assert(!get('#groupList').innerHTML.includes('编辑小规则'));
assert(get('#groupList').innerHTML.includes('group-course-panel'));
assert(get('#groupList').innerHTML.includes('group-module-body'));
assert(get('#groupList').innerHTML.includes('雅仕校区、鸿寿校区</strong>'));
assert(get('#groupList').innerHTML.includes('苏悦校区</strong>'));
assert(!get('#groupList').innerHTML.includes('苏州校区'));
assert(get('#groupList').innerHTML.includes('教师组织优先级：</span><div class="priority-preview">'));
assert(get('#groupList').innerHTML.includes('排课发起人：</span><div class="source-org-list">'));
assert(get('#groupList').innerHTML.includes('>唯寻上海-橡沐...</button>'));
assert(get('#groupList').innerHTML.includes('>唯寻上海-英联...<b class="org-selection-count">+1</b></button>'));
assert(get('#groupList').innerHTML.includes('title="唯寻上海-英联邦浦西、唯寻江苏-唯寻苏州"'));
assert.equal(count(get('#groupList').innerHTML, 'data-show-org-path="source:G001:R005:all"'), 1);
assert(get('#groupList').innerHTML.includes('title="唯寻上海-橡沐中心"'));
assert(!get('#groupList').innerHTML.includes('class="org-chip" title='));
assert(get('#groupList').innerHTML.includes('org-chip-name">唯寻上海-橡沐...</span>'));
assert(get('#groupList').innerHTML.includes('org-chip-name">唯寻上海-英联...</span>'));
assert(get('#groupList').innerHTML.includes('org-chip-name">唯寻江苏-唯寻...</span>'));
assert(get('#groupList').innerHTML.includes('org-chip-name">唯寻上海-橡沐...教学部</span>'));
assert(!get('#groupList').innerHTML.includes('橡沐组织规则'));
assert(!get('#groupList').innerHTML.includes('已生效'));

click('#groupList', { '[data-show-org-path]': { showOrgPath: 'teacher:G001:R001:0' } });
assert(get('#groupList').innerHTML.includes('role="dialog" aria-label="完整组织架构"'));
assert.equal(count(popupItems(), 'class="org-detail-item"'), 1);
assert(popupItems().includes('唯寻上海-英联邦浦西'));
assert(!get('#groupList').innerHTML.includes('selected-org-tree'));
assert(!popupItems().includes('上海帆寻科技有限公司'));
assert(!popupItems().includes('橡沐中心'));
click('#groupList', { '[data-close-org-popover]': {} });
assert(!get('#groupList').innerHTML.includes('role="dialog" aria-label="完整组织架构"'));
click('#groupList', { '[data-show-org-path]': { showOrgPath: 'source:G001:R004:all' } });
assert.equal(count(popupItems(), 'class="org-detail-item"'), 1);
assert(popupItems().includes('唯寻上海-橡沐中心'));
assert(!popupItems().includes('英联邦浦西'));
click('#groupList', { '[data-show-org-path]': { showOrgPath: 'source:G001:R004:all' } });
assert(!get('#groupList').innerHTML.includes('role="dialog" aria-label="完整组织架构"'));
click('#groupList', { '[data-show-org-path]': { showOrgPath: 'source:G001:R005:all' } });
assert(get('#groupList').innerHTML.includes('group-subrule is-org-popover-open'));
assert.equal(count(popupItems(), 'class="org-detail-item"'), 2);
assert(popupItems().includes('唯寻上海-英联邦浦西'));
assert(popupItems().includes('唯寻江苏-唯寻苏州'));
assert(!popupItems().includes('org-detail-index'));
assert(!popupItems().includes('橡沐中心'));
click('#groupList', { '[data-close-org-popover]': {} });
click('#groupList', { '[data-edit-entry]': { group: 'G003', editEntry: 'R009' } });
assert(get('#entryConditionChoices').innerHTML.includes('data-tree-value="union_sales" role="checkbox" aria-checked="true"'));
assert(get('#entryConditionChoices').innerHTML.includes('data-tree-value="suzhou_sales" role="checkbox" aria-checked="true"'));
assert(get('#entryConditionChoices').innerHTML.includes('data-tree-value="oxmu_sales" role="checkbox" aria-checked="false" aria-label="选择橡沐中心" disabled'));
get('#cancelDrawer').fire('click');

get('#addTeacherRule').fire('click');
assert.equal(get('#modalTitle').textContent, '新增教师排课规则');
get('#newGroupName').value = '新课程教师规则';
click('#modalBackdrop', { '[data-picker-toggle]': {} });
click('#modalBackdrop', { '[data-picker-root]': { pickerRoot: '橡沐' } });
click('#modalBackdrop', { '[data-picker-branch]': { pickerBranch: '橡沐语培' } });
click('#modalBackdrop', { '[data-picker-course]': { pickerCourse: 'SAT' } });
click('#modalBackdrop', { '[data-picker-branch]': { pickerBranch: '橡沐学科' } });
click('#modalBackdrop', { '[data-picker-course]': { pickerCourse: 'AP' } });
assert(get('#createCourseChoices').innerHTML.includes('橡沐 / 橡沐语培 / SAT'));
assert(get('#createCourseChoices').innerHTML.includes('picker-more">+1'));
click('#modalBackdrop', { '[data-confirm-create]': {} });
assert.equal(count(get('#groupList').innerHTML, 'data-edit-group='), 4);
assert.equal(JSON.parse(storage.get('teacher-org-priority-demo-v4')).groups.find(group => group.id === 'G004').courseIds.join(','), 'SAT,AP');

click('#groupList', { '[data-edit-group]': { editGroup: 'G004' } });
assert.equal(get('#groupFields').hidden, false);
assert.equal(get('#entryFields').hidden, true);
assert.equal(get('#drawerTitle').textContent, '编辑基本信息');
assert.equal(get('#deleteGroup').textContent, '删除');
assert.equal(get('#saveGroup').textContent, '保存基本信息');
assert.equal(get('#deleteGroup').hidden, false);
assert.equal(get('#cancelDrawer').hidden, false);
assert(get('#courseChoices').innerHTML.includes('橡沐 / 橡沐语培 / SAT'));
click('#courseChoices', { '[data-picker-root]': { pickerRoot: '英联邦' } });
assert(get('#courseChoices').innerHTML.includes('已用于其他规则'));
get('#editGroupName').fire('input', { value: 'SAT与AP教师规则' });
get('#saveGroup').fire('click');
assert(get('#groupList').innerHTML.includes('SAT与AP教师规则'));

click('#groupList', { '[data-add-entry]': { group: 'G004', addEntry: 'OFFLINE_OMO' } });
assert.equal(get('#drawerTitle').textContent, '新增线下/OMO规则');
assert.equal(get('#entryParent').textContent, '适用课程项：SAT、AP');
assert.equal(get('#deleteGroup').hidden, true);
assert.equal(get('#cancelDrawer').hidden, true);
assert.equal(get('#saveGroup').textContent, '保存规则');
assert.equal(get('#groupFields').hidden, true);
assert.equal(get('#entryFields').hidden, false);
assert.equal(get('#entryConditionTitle').textContent, '授课校区（可多选）');
assert(get('#entryConditionChoices').innerHTML.includes('请选择校区'));
clickConditionWithBubble({ '[data-campus-toggle]': {} });
assert(get('#entryConditionChoices').innerHTML.includes('aria-expanded="true"'));
for (const [id, name] of [['shunyuan', '舜元中心'], ['nanshan', '南山校区'], ['wangjing', '望京校区'], ['haidian', '海淀校区'], ['suyue', '苏悦校区'], ['shidai', '时代校区'], ['changan', '长安国际校区'], ['futian', '福田校区']]) {
  const option = get('#entryConditionChoices').innerHTML.match(new RegExp(`data-condition="${id}"[^>]*>${name}`))?.[0];
  assert(option && !option.includes('disabled'), `${name}应可选择`);
}
clickConditionWithBubble({ '[data-condition]': { condition: 'wangjing' } });
assert(get('#entryConditionChoices').innerHTML.includes('望京校区'));
clickConditionWithBubble({ '[data-condition]': { condition: 'wangjing' } });
clickConditionWithBubble({ '[data-condition]': { condition: 'suyue' } });
clickConditionWithBubble({ '[data-condition]': { condition: 'hongshou' } });
assert(get('#entryConditionChoices').innerHTML.includes('苏悦校区、鸿寿校区'));
clickConditionWithBubble({ '[data-condition]': { condition: 'hongshou' } });
get('#addTier').fire('click');
chooseTeacherOrg(0, 'union_suzhou');
clickPriorityWithBubble({ '[data-tier]': { tier: '0' }, '[data-tree-select="teacher"]': { treeValue: 'oxmu' } });
assert(get('#entryPriorityList').innerHTML.includes('data-tree-value="union_suzhou" role="checkbox" aria-checked="true"'));
assert(get('#entryPriorityList').innerHTML.includes('data-tree-value="oxmu" role="checkbox" aria-checked="true"'));
get('#entryPriorityList').fire('change', tierTarget(0, { dataset: { field: 'approvalRequired' }, checked: true }));
assert(get('#entryPriorityList').innerHTML.includes('approval-text-input'));
assert.equal(count(get('#entryPriorityList').innerHTML, 'data-field="approvalRequired"'), 1);
get('#saveGroup').fire('click');
assert.equal(get('#drawerBackdrop').hidden, false);
assert(get('#drawerValidation').innerHTML.includes('请填写提示文案'));
get('#entryPriorityList').fire('input', tierTarget(0, { dataset: { field: 'approvalText' }, value: '需苏州教学负责人审批' }));
get('#saveGroup').fire('click');
assert.equal(get('#drawerBackdrop').hidden, true);
assert(get('#groupList').innerHTML.includes('苏悦校区</strong>'));
assert.equal(count(get('#groupList').innerHTML, 'data-edit-entry='), 10);

click('#groupList', { '[data-add-entry]': { group: 'G004', addEntry: 'OFFLINE_OMO' } });
click('#entryConditionChoices', { '[data-campus-toggle]': {} });
click('#entryConditionChoices', { '[data-condition]': { condition: 'yashi' } });
get('#addTier').fire('click');
chooseTeacherOrg(0, 'union_puxi');
get('#saveGroup').fire('click');
assert(get('#groupList').innerHTML.includes('雅仕校区</strong>'));

click('#groupList', { '[data-add-entry]': { group: 'G004', addEntry: 'ONLINE' } });
assert.equal(get('#drawerTitle').textContent, '新增线上规则');
assert.equal(get('#entryParent').textContent, '适用课程项：SAT、AP');
assert.equal(get('#deleteGroup').hidden, true);
assert.equal(get('#cancelDrawer').hidden, true);
assert.equal(get('#entryConditionTitle').textContent, '排课发起人（可多选）');
assert(get('#entryConditionChoices').innerHTML.includes('上海帆寻科技有限公司'));
assert(get('#entryConditionChoices').innerHTML.includes('橡沐中心'));
assert(get('#entryConditionChoices').innerHTML.includes('英联邦浦西'));
assert(get('#entryConditionChoices').innerHTML.includes('唯寻苏州'));
click('#entryConditionChoices', { '[data-tree-toggle]': { treeToggle: 'jiangsu' } });
assert(!get('#entryConditionChoices').innerHTML.includes('data-tree-value="suzhou_sales"'));
click('#entryConditionChoices', { '[data-tree-toggle]': { treeToggle: 'jiangsu' } });
click('#entryConditionChoices', { '[data-tree-select="source"]': { treeValue: 'oxmu_sales' } });
assert(get('#entryConditionChoices').innerHTML.includes('data-tree-value="oxmu_sales" role="checkbox" aria-checked="true"'));
get('#addTier').fire('click');
chooseTeacherOrg(0, 'oxmu');
get('#saveGroup').fire('click');
const saved = JSON.parse(storage.get('teacher-org-priority-demo-v4'));
assert.equal(saved.groups.find(group => group.id === 'G004').entries.length, 3);
assert.equal(saved.rules.filter(rule => rule.course === 'SAT').length, 3);
assert.equal(saved.rules.filter(rule => rule.course === 'AP').length, 3);
assert.equal(saved.published.SAT, true);
assert.equal(saved.published.AP, true);
assert.equal(saved.rules.find(rule => rule.id === 'R010_SAT').tiers[0].approvalText, '需苏州教学负责人审批');
assert.equal(saved.rules.find(rule => rule.id === 'R010_SAT').tiers[0].approvalRequired, true);
assert.equal(saved.rules.find(rule => rule.id === 'R010_SAT').tiers[0].orgIds.join(','), 'union_suzhou,oxmu');
assert(get('#groupList').innerHTML.includes('data-show-org-path="teacher:G004:R010:0"'));
assert.equal(count(get('#groupList').innerHTML, 'data-show-org-path="teacher:G004:R010:0"'), 1);
assert(get('#groupList').innerHTML.includes('org-chip-name">唯寻江苏-唯寻...</span><b class="org-selection-count">+1</b>'));
assert(get('#groupList').innerHTML.includes('排课需审批'));
assert(get('#groupList').innerHTML.includes('class="approval-tooltip" role="tooltip">需苏州教学负责人审批</span>'));
assert(get('#groupList').innerHTML.includes('需苏州教学负责人审批</span></span></button>'));
assert(!get('#groupList').innerHTML.includes('title="唯寻江苏-唯寻苏州、唯寻上海-橡沐中心"'));
click('#groupList', { '[data-show-org-path]': { showOrgPath: 'teacher:G004:R010:0' } });
assert.equal(count(popupItems(), 'class="org-detail-item"'), 2);
assert(popupItems().includes('唯寻江苏-唯寻苏州'));
assert(popupItems().includes('唯寻上海-橡沐中心'));
assert(!popupItems().includes('org-detail-index'));
assert(!popupItems().includes('英联邦浦东'));
click('#groupList', { '[data-close-org-popover]': {} });

click('#groupList', { '[data-edit-entry]': { group: 'G004', editEntry: 'R010' } });
assert.equal(get('#drawerTitle').textContent, '编辑线下/OMO规则');
assert.equal(get('#entryParent').textContent, '适用课程项：SAT、AP');
assert(get('#entryConditionChoices').innerHTML.includes('data-condition="suyue" aria-pressed="true"'));
assert.equal(get('#deleteGroup').textContent, '删除');
assert.equal(get('#deleteGroup').hidden, false);
assert.equal(get('#cancelDrawer').hidden, false);
assert.equal(get('#saveGroup').textContent, '保存规则');
clickConditionWithBubble({ '[data-campus-toggle]': {} });
assert(get('#entryConditionChoices').innerHTML.includes('aria-expanded="true"'));
documentListeners.keydown({ key: 'Escape' });
assert(get('#entryConditionChoices').innerHTML.includes('aria-expanded="false"'));
assert.equal(get('#drawerBackdrop').hidden, false);
clickConditionWithBubble({ '[data-campus-toggle]': {} });
clickPriorityWithBubble({ '[data-tier]': { tier: '0' }, '[data-open-teacher-tree]': { openTeacherTree: '0' } });
assert(get('#entryConditionChoices').innerHTML.includes('aria-expanded="false"'));
assert(get('#entryPriorityList').innerHTML.includes('org-tree-edit'));
documentListeners.keydown({ key: 'Escape' });
assert(!get('#entryPriorityList').innerHTML.includes('org-tree-edit'));
assert.equal(get('#drawerBackdrop').hidden, false);
get('#entryPriorityList').fire('input', tierTarget(0, { dataset: { field: 'approvalText' }, value: '需苏州主管审批' }));
clickPriorityWithBubble({ '[data-tier]': { tier: '0' }, '[data-open-teacher-tree]': { openTeacherTree: '0' } });
get('#cancelDrawer').fire('click');
assert.equal(get('#modalBackdrop').hidden, false);
documentListeners.keydown({ key: 'Escape' });
assert.equal(get('#modalBackdrop').hidden, true);
assert(get('#entryPriorityList').innerHTML.includes('org-tree-edit'));
documentListeners.keydown({ key: 'Escape' });
assert(!get('#entryPriorityList').innerHTML.includes('org-tree-edit'));
get('#saveGroup').fire('click');
assert.equal(get('#drawerBackdrop').hidden, true);
assert.equal(JSON.parse(storage.get('teacher-org-priority-demo-v4')).rules.find(rule => rule.id === 'R010_SAT').tiers[0].approvalText, '需苏州主管审批');

click('#groupList', { '[data-add-entry]': { group: 'G004', addEntry: 'OFFLINE_OMO' } });
click('#entryConditionChoices', { '[data-campus-toggle]': {} });
click('#entryConditionChoices', { '[data-condition]': { condition: 'suyue' } });
get('#addTier').fire('click');
chooseTeacherOrg(0, 'union_pudong');
get('#saveGroup').fire('click');
assert.equal(get('#drawerBackdrop').hidden, false);
assert(get('#drawerValidation').innerHTML.includes('重复配置'));
get('#cancelDrawer').fire('click');
click('#modalBackdrop', { '[data-confirm-discard]': {} });
click('#groupList', { '[data-edit-entry]': { group: 'G004', editEntry: 'R011' } });
get('#deleteGroup').fire('click');
assert.equal(get('#modalTitle').textContent, '删除这条小规则？');
click('#modalBackdrop', { '[data-confirm-delete]': {} });
assert.equal(JSON.parse(storage.get('teacher-org-priority-demo-v4')).rules.filter(rule => rule.course === 'SAT').length, 2);
click('#groupList', { '[data-edit-group]': { editGroup: 'G004' } });
get('#deleteGroup').fire('click');
assert.equal(get('#modalTitle').textContent, '删除整个规则？');
click('#modalBackdrop', { '[data-confirm-delete]': {} });
assert.equal(get('#drawerBackdrop').hidden, true);
assert.equal(JSON.parse(storage.get('teacher-org-priority-demo-v4')).groups.some(group => group.id === 'G004'), false);
assert.equal(count(get('#groupList').innerHTML, 'data-edit-group='), 3);
const legacyNodes = new Map();
const legacyGet = selector => { if (!legacyNodes.has(selector)) legacyNodes.set(selector, new Element()); return legacyNodes.get(selector); };
const legacyRules = { groups: [{ id: 'G100', name: '旧校区规则', courseIds: ['ALEVEL'], entries: [{ id: 'R100', mode: 'OFFLINE_OMO', conditions: ['suzhou'], tiers: [{ orgId: 'union_suzhou' }] }] }] };
vm.runInNewContext(script, {
  document: { querySelector: legacyGet, addEventListener() {} }, window: {},
  localStorage: { getItem: key => key === 'teacher-org-priority-demo-v4' ? JSON.stringify(legacyRules) : null, setItem() {} },
  setTimeout: () => 1, clearTimeout() {}, console
});
assert(legacyGet('#groupList').innerHTML.includes('苏悦校区</strong>'));
assert(legacyGet('#groupList').innerHTML.includes('data-show-org-path="teacher:G100:R100:0"'));
assert(!legacyGet('#groupList').innerHTML.includes('苏州校区'));
const reloadNodes = new Map();
const reloadGet = selector => { if (!reloadNodes.has(selector)) reloadNodes.set(selector, new Element()); return reloadNodes.get(selector); };
vm.runInNewContext(script, {
  document: { querySelector: reloadGet, addEventListener() {} }, window: {},
  localStorage: { getItem: key => key === 'teacher-org-priority-demo-v4' ? JSON.stringify(saved) : null, setItem() {} },
  setTimeout: () => 1, clearTimeout() {}, console
});
assert(reloadGet('#groupList').innerHTML.includes('data-show-org-path="teacher:G004:R010:0"'));
assert(reloadGet('#groupList').innerHTML.includes('排课需审批'));
assert(reloadGet('#groupList').innerHTML.includes('class="approval-tooltip" role="tooltip">需苏州教学负责人审批</span>'));
const perOrgSaved = JSON.parse(JSON.stringify(saved));
const oldTier = perOrgSaved.groups.find(group => group.id === 'G004').entries.find(rule => rule.id === 'R010').tiers[0];
delete oldTier.approvalRequired;
delete oldTier.approvalText;
oldTier.approvalByOrg = { union_suzhou: { required: true, text: '苏州审批' }, oxmu: { required: true, text: '橡沐审批' } };
const migrationNodes = new Map();
const migrationGet = selector => { if (!migrationNodes.has(selector)) migrationNodes.set(selector, new Element()); return migrationNodes.get(selector); };
vm.runInNewContext(script, {
  document: { querySelector: migrationGet, addEventListener() {} }, window: {},
  localStorage: { getItem: key => key === 'teacher-org-priority-demo-v4' ? JSON.stringify(perOrgSaved) : null, setItem() {} },
  setTimeout: () => 1, clearTimeout() {}, console
});
assert(migrationGet('#groupList').innerHTML.includes('class="approval-tooltip" role="tooltip">苏州审批；橡沐审批</span>'));
console.log('Small teacher rule editor checks passed');
