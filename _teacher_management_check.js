const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

class FakeElement {
  constructor() {
    this.hidden = false;
    this.listeners = {};
    this.attrs = {};
    this.classes = new Set();
    this.classList = {
      add: name => this.classes.add(name),
      remove: name => this.classes.delete(name),
      toggle: (name, force) => force ? this.classes.add(name) : this.classes.delete(name)
    };
  }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  setAttribute(name, value) { this.attrs[name] = value; }
  fire(name, event = {}) { this.listeners[name]?.(event); }
}

const elements = Object.fromEntries(['orderPage', 'resultPage', 'teacherManagementPage', 'teacherManagementFrame', 'scheduleMenu', 'teacherMenu', 'teacherSubmenu', 'teacherScheduleMenu'].map(id => [id, new FakeElement()]));
elements.resultPage.hidden = true;
elements.teacherManagementPage.hidden = true;
elements.teacherSubmenu.hidden = true;
const posted = [];
elements.teacherManagementFrame.contentWindow = { postMessage: message => posted.push(message) };
const listeners = {};
const window = { addEventListener: (name, handler) => { listeners[name] = handler; } };
const document = { getElementById: id => elements[id], body: new FakeElement() };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'teacher-management.js'), 'utf8'), { window, document });

elements.teacherMenu.fire('click');
assert.equal(elements.teacherSubmenu.hidden, false);
assert.equal(elements.teacherMenu.attrs['aria-expanded'], 'true');
elements.teacherScheduleMenu.fire('click');
assert.equal(elements.orderPage.hidden, true);
assert.equal(elements.teacherManagementPage.hidden, false);
assert.equal(posted.at(-1).kind, 'REQUEST_TEACHER_PRIORITY_CONFIG');
assert.equal(elements.teacherScheduleMenu.classes.has('active'), true);

const config = { kind: 'TEACHER_PRIORITY_CONFIG', rules: [{ course: 'TOEFL' }], published: { TOEFL: true } };
listeners.message({ source: elements.teacherManagementFrame.contentWindow, data: config });
assert.equal(window.getTeacherPriorityConfiguration().rules[0].course, 'TOEFL');
listeners.message({ source: {}, data: { kind: 'TEACHER_PRIORITY_CONFIG', rules: [], published: {} } });
assert.equal(window.getTeacherPriorityConfiguration().rules.length, 1);

elements.scheduleMenu.fire('click');
assert.equal(elements.orderPage.hidden, false);
assert.equal(elements.teacherManagementPage.hidden, true);
assert.equal(elements.scheduleMenu.classes.has('active'), true);
console.log('Teacher management navigation and rule sync checks passed');
