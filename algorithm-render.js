(() => {
  const source = document.getElementById('algorithmDocument');
  const contents = document.getElementById('algorithmContents');
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const inline = value => escape(value)
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>');
  const cells = line => line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(cell => cell.trim());
  const separator = line => /^\|?[\s:|-]+\|?$/.test(line) && line.includes('---');
  function render(markdown) {
    const lines = markdown.replace(/\r\n?/g,'\n').split('\n');
    const output = [];
    const headings = [];
    let paragraph = [];
    let list = [];
    let listType = '';
    let headingIndex = 0;
    const flushParagraph = () => { if (paragraph.length) { output.push('<p>' + inline(paragraph.join(' ')) + '</p>'); paragraph = []; } };
    const flushList = () => { if (list.length) { output.push('<' + listType + '>' + list.map(item => '<li>' + inline(item) + '</li>').join('') + '</' + listType + '>'); list = []; listType = ''; } };
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const trimmed = line.trim();
      if (!trimmed) { flushParagraph(); flushList(); continue; }
      if (trimmed.startsWith('```')) {
        flushParagraph(); flushList();
        const language = trimmed.slice(3).trim();
        const code = [];
        while (++index < lines.length && !lines[index].trim().startsWith('```')) code.push(lines[index]);
        output.push('<pre><code' + (language ? ' data-language="' + escape(language) + '"' : '') + '>' + escape(code.join('\n')) + '</code></pre>');
        continue;
      }
      const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
      if (heading) {
        flushParagraph(); flushList();
        const level = heading[1].length;
        const label = heading[2];
        if (level === 1 && output.length === 0) continue;
        const id = 'algorithm-section-' + headingIndex++;
        if (level === 2) headings.push({id,label});
        output.push('<h' + level + ' id="' + id + '">' + inline(label) + '</h' + level + '>');
        continue;
      }
      if (trimmed.startsWith('|') && index + 1 < lines.length && separator(lines[index + 1].trim())) {
        flushParagraph(); flushList();
        const headers = cells(trimmed);
        index++;
        const rows = [];
        while (index + 1 < lines.length && lines[index + 1].trim().startsWith('|')) rows.push(cells(lines[++index]));
        output.push('<div class="prototype-algorithm-table"><table><thead><tr>' + headers.map(cell => '<th>' + inline(cell) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + headers.map((_,column) => '<td>' + inline(row[column] || '') + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
        continue;
      }
      const ordered = /^\d+\.\s+(.+)$/.exec(trimmed);
      const unordered = /^[-*]\s+(.+)$/.exec(trimmed);
      if (ordered || unordered) {
        flushParagraph();
        const type = ordered ? 'ol' : 'ul';
        if (listType && listType !== type) flushList();
        listType = type;
        list.push((ordered || unordered)[1]);
        continue;
      }
      if (trimmed.startsWith('>')) { flushParagraph(); flushList(); output.push('<blockquote>' + inline(trimmed.replace(/^>\s*/,'')) + '</blockquote>'); continue; }
      if (/^[-*_]{3,}$/.test(trimmed)) { flushParagraph(); flushList(); output.push('<hr>'); continue; }
      flushList();
      paragraph.push(trimmed);
    }
    flushParagraph(); flushList();
    source.innerHTML = output.join('\n');
    contents.innerHTML = '<strong>本页目录</strong><div>' + headings.map(item => '<a href="#' + item.id + '">' + inline(item.label) + '</a>').join('') + '</div>';
  }
  fetch('algorithm-source.md').then(response => { if (!response.ok) throw new Error(); return response.text(); }).then(render).catch(() => { source.textContent = '算法方案加载失败，请检查本地原型服务。'; });
})();
