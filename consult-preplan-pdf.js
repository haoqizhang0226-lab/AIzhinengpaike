/* 售前咨单预排课表：无外部依赖的离线 PDF 导出。 */
(function () {
  'use strict';
  const WIDTH = 1190;
  const HEIGHT = 1684;
  const LEFT = 60;
  const RIGHT = WIDTH - LEFT;
  const BLUE = '#103c65';
  const RULE = '#8fa2bd';
  const CJK = '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif';

  function utcDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    return match ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])) : null;
  }
  function dateText(date) { return date.toISOString().slice(0, 10); }
  function addDays(date, amount) { return new Date(date.getTime() + amount * 86400000); }
  function monday(date) { return addDays(date, -((date.getUTCDay() + 6) % 7)); }
  function setFont(ctx, size, weight = 400) { ctx.font = `${weight} ${size}px ${CJK}`; }
  function line(ctx, x1, y1, x2, y2, color = RULE, width = 1) {
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.moveTo(x1 + .5, y1 + .5); ctx.lineTo(x2 + .5, y2 + .5); ctx.stroke();
  }
  function roundedRect(ctx, x, y, w, h, radius, fill) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fillStyle = fill; ctx.fill();
  }
  function wrap(ctx, value, width) {
    const result = [];
    for (const paragraph of String(value || '').split('\n')) {
      if (!paragraph) { result.push(''); continue; }
      let current = '';
      for (const char of paragraph) {
        if (current && ctx.measureText(current + char).width > width) {
          result.push(current); current = char;
        } else current += char;
      }
      if (current) result.push(current);
    }
    return result;
  }
  function drawLogo(ctx) {
    ctx.save();
    ctx.strokeStyle = BLUE; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(139, 101, 39, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(114, 119); ctx.lineTo(139, 78); ctx.lineTo(164, 119);
    ctx.moveTo(126, 108); ctx.lineTo(152, 108); ctx.moveTo(103, 101); ctx.lineTo(119, 101);
    ctx.moveTo(158, 101); ctx.lineTo(174, 101); ctx.stroke();
    ctx.fillStyle = BLUE;
    setFont(ctx, 27, 700); ctx.fillText('VISION ACADEMY', 195, 99);
    setFont(ctx, 20, 700); ctx.fillText('惟 寻 国 际 教 育', 198, 127);
    ctx.restore();
  }
  function drawCalendar(ctx) {
    ctx.save(); ctx.translate(1044, 96); ctx.rotate(.13); ctx.globalAlpha = .11;
    roundedRect(ctx, -72, -66, 136, 134, 14, '#70b0ff');
    roundedRect(ctx, -72, -66, 136, 37, 14, '#4589e8');
    ctx.strokeStyle = '#356ab2'; ctx.lineWidth = 8;
    for (const x of [-34, 25]) {
      ctx.beginPath(); ctx.ellipse(x, -65, 13, 27, 0, Math.PI, Math.PI * 2); ctx.stroke();
    }
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++)
      roundedRect(ctx, -52 + col * 38, -12 + row * 32, 20, 18, 4, '#2b74dc');
    ctx.restore();
  }
  function drawHeader(ctx, summaries) {
    const wash = ctx.createLinearGradient(0, 0, WIDTH, 290);
    wash.addColorStop(0, '#f1fbff'); wash.addColorStop(.55, '#ffffff'); wash.addColorStop(1, '#f8fcff');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, WIDTH, 275);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 275, WIDTH, HEIGHT - 275);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
      ctx.beginPath(); ctx.arc(25 + col * 21, 28 + row * 21, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill();
    }
    drawLogo(ctx); drawCalendar(ctx);
    ctx.fillStyle = '#0a0a0a'; setFont(ctx, 36, 700);
    const title = '预排课程表'; ctx.fillText(title, (WIDTH - ctx.measureText(title).width) / 2, 226);
    const rowCount = Math.ceil(summaries.length / 2);
    setFont(ctx, 16);
    for (let index = 0; index < summaries.length; index++) {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = LEFT + col * 590;
      const y = 307 + row * 34;
      const value = summaries[index];
      const suffix = `：${value.count}节/${value.hours}课时`;
      const nameWidth = 565 - ctx.measureText(suffix).width;
      const name = value.name;
      let clipped = name;
      while (clipped.length && ctx.measureText(clipped).width > nameWidth) clipped = clipped.slice(0, -1);
      if (clipped !== name) clipped = clipped.slice(0, -1) + '…';
      ctx.fillStyle = '#666666'; setFont(ctx, 16); ctx.fillText(clipped, x, y);
      const nameActualWidth = ctx.measureText(clipped).width;
      ctx.fillStyle = '#333333'; setFont(ctx, 16, 700); ctx.fillText(suffix, x + nameActualWidth, y);
    }
    return Math.max(378, 326 + rowCount * 34);
  }
  function drawFooter(ctx, pageNumber) {
    ctx.fillStyle = '#444444'; setFont(ctx, 16);
    ctx.fillText('提示文案：', LEFT, 1628);
    const page = `第 ${pageNumber} 页`;
    ctx.fillText(page, RIGHT - ctx.measureText(page).width, 1628);
  }
  function lessonLines(ctx, lesson, cellWidth) {
    setFont(ctx, 13.5);
    return wrap(ctx, lesson.course, cellWidth - 22);
  }
  function cardHeight(ctx, lesson, cellWidth) {
    return 25 + lessonLines(ctx, lesson, cellWidth).length * 19 + 21 + 10;
  }
  function weekHeight(ctx, days) {
    const cellWidth = (RIGHT - LEFT) / 7;
    const max = Math.max(...days.map(day => day.reduce((height, lesson) => height + cardHeight(ctx, lesson, cellWidth), 0)));
    return Math.max(410, 75 + max + 12);
  }
  function drawWeek(ctx, week, y, height) {
    const width = RIGHT - LEFT;
    const cw = width / 7;
    const weekdays = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
    roundedRect(ctx, LEFT, y, width, height, 9, '#ffffff');
    ctx.fillStyle = '#8fa1b8'; ctx.fillRect(LEFT, y, width, 41);
    ctx.fillStyle = '#ffffff'; setFont(ctx, 18, 700);
    for (let day = 0; day < 7; day++) {
      const label = weekdays[day];
      ctx.fillText(label, LEFT + day * cw + (cw - ctx.measureText(label).width) / 2, y + 27);
    }
    for (let day = 0; day < 7; day++) {
      const x = LEFT + day * cw;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y + 41, cw, height - 41);
      ctx.fillStyle = '#303030'; setFont(ctx, 16);
      ctx.fillText(dateText(addDays(week.start, day)), x + 10, y + 65);
      let cardY = y + 74;
      for (const lesson of week.days[day]) {
        const h = cardHeight(ctx, lesson, cw);
        line(ctx, x, cardY, x + cw, cardY, '#e4ebf3');
        roundedRect(ctx, x + 10, cardY + 13, 4, 10, 2, '#416cff');
        ctx.fillStyle = '#222222'; setFont(ctx, 13.5);
        ctx.fillText(lesson.time, x + 20, cardY + 24);
        let textY = cardY + 43;
        for (const part of lessonLines(ctx, lesson, cw)) {
          ctx.fillText(part, x + 11, textY); textY += 19;
        }
        ctx.fillText(lesson.teacher || '待选老师', x + 11, textY + 1);
        cardY += h;
      }
    }
    ctx.strokeStyle = RULE; ctx.lineWidth = 1;
    ctx.strokeRect(LEFT + .5, y + .5, width - 1, height - 1);
    for (let day = 1; day < 7; day++) line(ctx, LEFT + day * cw, y, LEFT + day * cw, y + height);
    line(ctx, LEFT, y + 41, RIGHT, y + 41, '#d0dbe7');
    line(ctx, LEFT, y + 74, RIGHT, y + 74, '#d0dbe7');
  }
  function readLessons(table, selected) {
    return [...table.querySelectorAll('tbody tr[data-course-index]')]
      .filter(row => selected.has(Number(row.dataset.courseIndex)))
      .map(row => {
        const text = row.cells[0]?.textContent.trim() || '';
        const match = /^(\d{4}-\d{2}-\d{2})\s+(.+)$/.exec(text);
        return match ? {
          date: match[1], time: match[2].replace('—', '-'),
          course: row.cells[2]?.textContent.trim() || '课程',
          teacher: row.cells[3]?.textContent.trim() || '待选老师',
          courseIndex: Number(row.dataset.courseIndex)
        } : null;
      }).filter(Boolean).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }
  function groupWeeks(lessons) {
    const first = monday(utcDate(lessons[0].date));
    const last = monday(utcDate(lessons.at(-1).date));
    const weeks = [];
    for (let start = first; start <= last; start = addDays(start, 7)) {
      const days = Array.from({length: 7}, () => []);
      weeks.push({start, days});
    }
    for (const lesson of lessons) {
      const date = utcDate(lesson.date);
      const index = Math.round((monday(date) - first) / 604800000);
      const day = (date.getUTCDay() + 6) % 7;
      weeks[index].days[day].push(lesson);
    }
    return weeks;
  }
  function makeCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH; canvas.height = HEIGHT;
    return canvas;
  }
  function renderPages(summaries, weeks) {
    const pages = [];
    let weekIndex = 0;
    while (weekIndex < weeks.length) {
      const canvas = makeCanvas();
      const ctx = canvas.getContext('2d', {alpha: false});
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      let y = drawHeader(ctx, summaries);
      let drawn = 0;
      while (weekIndex < weeks.length && drawn < 2) {
        const height = weekHeight(ctx, weeks[weekIndex].days);
        if (drawn && y + height > 1540) break;
        drawWeek(ctx, weeks[weekIndex], y, Math.min(height, 1540 - y));
        y += height + 40; weekIndex++; drawn++;
      }
      drawFooter(ctx, pages.length + 1);
      pages.push(canvas.toDataURL('image/jpeg', .9).split(',')[1]);
    }
    return pages;
  }
  function pdfFromJpegs(jpegs) {
    const encoder = new TextEncoder();
    const chunks = [];
    const offsets = [0];
    let length = 0;
    const append = value => {
      const bytes = typeof value === 'string' ? encoder.encode(value) : value;
      chunks.push(bytes); length += bytes.length;
    };
    const object = (number, body) => {
      offsets[number] = length;
      append(`${number} 0 obj\n`);
      if (Array.isArray(body)) body.forEach(append); else append(body);
      append('\nendobj\n');
    };
    append('%PDF-1.4\n%\xC2\xB5\xC2\xB6\n');
    object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    const pageIds = jpegs.map((_, index) => 3 + index * 3);
    object(2, `<< /Type /Pages /Kids [${pageIds.map(id => id + ' 0 R').join(' ')}] /Count ${jpegs.length} >>`);
    jpegs.forEach((base64, index) => {
      const pageId = pageIds[index];
      const contentId = pageId + 1;
      const imageId = pageId + 2;
      object(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      const content = 'q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n';
      object(contentId, [`<< /Length ${encoder.encode(content).length} >>\nstream\n`, content, 'endstream']);
      const binary = atob(base64);
      const image = Uint8Array.from(binary, char => char.charCodeAt(0));
      object(imageId, [`<< /Type /XObject /Subtype /Image /Width ${WIDTH} /Height ${HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`, image, '\nendstream']);
    });
    const xref = length;
    append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
    for (let index = 1; index < offsets.length; index++) append(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`);
    append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(chunks, {type: 'application/pdf'});
  }
  function formatHours(value) { return String(Number(value || 0)).replace(/\.0+$/, ''); }

  window.ConsultPreplanPdf = {
    export({table, selectedCourses, courses, filename}) {
      const lessons = readLessons(table, selectedCourses);
      if (!lessons.length) return false;
      const counts = new Map();
      for (const lesson of lessons) counts.set(lesson.courseIndex, (counts.get(lesson.courseIndex) || 0) + 1);
      const summaries = [...selectedCourses].filter(index => counts.has(index)).map(index => ({
        name: courses[index]?.name || '课程',
        count: counts.get(index),
        hours: formatHours(courses[index]?.hours)
      }));
      const blob = pdfFromJpegs(renderPages(summaries, groupWeeks(lessons)));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = filename || '预排课程表.pdf';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return true;
    }
  };
})();
