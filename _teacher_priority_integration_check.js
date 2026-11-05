const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

class Element {
  constructor() {
    this.innerHTML = '';
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
    this.dataset = {};
    this.style = {};
    this.scrollTop = 0;
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  addEventListener() {}
  setAttribute() {}
  removeAttribute() {}
}

const script = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
function renderWithRules(rules, online = false) {
  const elements = new Map();
  const get = selector => {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  };
  const context = {
    document: { querySelector: get, querySelectorAll: () => [], addEventListener() {}, body: get('body') },
    window: { location: { hash: '#teacher-priority-preview=' + encodeURIComponent(JSON.stringify(rules)) } },
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout: () => 1, clearTimeout() {},
    Intl, Date, Math, console
  };
  vm.runInNewContext(script('teacher-priority-recommendation.js'), context);
  const appScript = online
    ? script('app.js').replaceAll("mode:'线下', campus:'雅仕校区'", "mode:'线上', campus:'雅仕校区'")
    : script('app.js');
  vm.runInNewContext(appScript, context);
  assert.equal(get('#wizardTitle').textContent, '选择排课老师');
  return get('#wizardBody').innerHTML;
}

const configuredRule = { course: 'TOEFL', mode: 'OFFLINE_OMO', conditions: ['yashi'], tiers: [
  { orgId: 'union_puxi', job: 'FULL_TIME', descendants: true, approvalRequired: true, approvalText: '浦西审批说明' },
  { orgId: 'oxmu_teaching', job: 'FULL_TIME', descendants: true, approvalRequired: true, approvalText: '橡沐审批说明' }
] };
const configured = renderWithRules([configuredRule]);
assert(!configured.includes('teacher-tier-summary'));
assert(!configured.includes('第 1 档：'));
assert(configured.includes('candidate-action'));
assert(configured.includes('org-approval-icon'));
assert(configured.includes('role="tooltip">浦西审批说明'));
assert(configured.includes('选择该老师</button><span class="org-approval-icon"'));
assert(configured.includes('浦西审批说明'));
assert(!configured.includes('【示例】'));
assert(!configured.includes('兜底推荐'));

const allTypes = renderWithRules([{ ...configuredRule, tiers: [{ ...configuredRule.tiers[0], job: 'ALL' }] }]);
assert(allTypes.includes('org-approval-icon'));
assert(!allTypes.includes('teacher-tier-summary'));

const multiOrg = renderWithRules([{ ...configuredRule, tiers: [{ orgIds: ['union_puxi', 'oxmu_teaching'], job: 'ALL', descendants: true, approvalRequired: true, approvalText: '同级架构共用审批说明' }] }]);
assert(multiOrg.includes('同级架构共用审批说明'));
assert(!multiOrg.includes('teacher-tier-summary'));
const secondOrgOnly = renderWithRules([{ ...configuredRule, tiers: [{ orgIds: ['oxmu_teaching'], job: 'ALL', descendants: true, approvalRequired: false, approvalText: '' }] }]);
assert(secondOrgOnly.includes('荷超(VA000144)'));
assert(secondOrgOnly.includes('【示例】'));

const fallback = renderWithRules([]);
assert(fallback.includes('选择该老师'));
assert(!fallback.includes('teacher-tier-summary'));
assert(!fallback.includes('浦西审批说明'));
assert(fallback.includes('【示例】推荐该老师需先由所属教学部门负责人审批'));
assert.equal((fallback.match(/class="org-approval-icon"/g) || []).length, 1);

const onlineFallback = renderWithRules([], true);
assert(onlineFallback.includes('选择该老师'));
assert(!onlineFallback.includes('teacher-tier-summary'));

const unavailableConfigured = renderWithRules([{ ...configuredRule, tiers: [
  { orgId: 'union_pudong', job: 'FULL_TIME', descendants: true, approvalRequired: false, approvalText: '' }
] }]);
assert(unavailableConfigured.includes('暂无可用教师'));
assert(!unavailableConfigured.includes('兜底推荐'));
console.log('Teacher priority integration checks passed');
