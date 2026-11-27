(() => {
  const key = 'smart-scheduling-student-slot-locks';
  const read = () => {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; }
    catch { return {}; }
  };
  const active = lock => lock && !lock.used && lock.expiresAt > Date.now();
  const teacherIdentity = teacher => String(teacher || '').trim().match(/^([^（(]+)(?:[（(]([^）)]+)[）)])?$/);

  window.studentSlotLocks = {
    forLesson(student, lesson) { return read()[`${student}:${lesson}`]; },
    active() { return Object.values(read()).filter(active); },
    sameTeacher(left, right) {
      const a = teacherIdentity(left), b = teacherIdentity(right);
      return Boolean(a && b && (a[2] && b[2] ? a[2] === b[2] : a[1].trim() === b[1].trim()));
    },
    lock(student, lesson) {
      const locks = read();
      const id = `${student}:${lesson.id}`;
      locks[id] = {id, student, teacher:lesson.teacher, date:lesson.date, time:lesson.time, expiresAt:Date.now() + 6 * 60 * 60 * 1000};
      localStorage.setItem(key, JSON.stringify(locks));
    },
    consume(student, ids) {
      const locks = read();
      if (ids.some(id => locks[id]?.student !== student || !active(locks[id]))) return false;
      ids.forEach(id => { locks[id].used = true; });
      localStorage.setItem(key, JSON.stringify(locks));
      return true;
    }
  };
})();
