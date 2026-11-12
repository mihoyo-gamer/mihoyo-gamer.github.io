(() => {
  'use strict';
  const data = window.GAMER?.research;
  const M = window.GamerMotion;
  if (!data || !M) return;
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const $ = id => document.getElementById(id);
  const table = (headers, rows) => {
    const result = node('table'), head = node('thead'), body = node('tbody'), heading = node('tr');
    headers.forEach(title => { const cell = node('th', '', title); cell.scope = 'col'; heading.append(cell); });
    head.append(heading);
    rows.forEach(row => {
      const tr = node('tr', row.ours ? 'highlight' : '');
      row.values.forEach((value, index) => { const cell = node(index ? 'td' : 'th', '', value); if (!index) cell.scope = 'row'; tr.append(cell); });
      body.append(tr);
    });
    result.append(head, body); return result;
  };
  // Keyed bar chart: rows are reused by name, so switching a metric slides each bar to its new
  // length, counts the value, and moves the row to its new rank.
  const chart = (target, rows, max = 100, unit = '%') => {
    M.keyed(target, rows, item => item.name, item => {
      const row = node('div', 'research-row'), track = node('div', 'research-track');
      track.append(node('i')); track.setAttribute('role', 'img');
      row.append(node('span', 'research-name', item.name), track, node('b'));
      return row;
    }, (row, item, index, fresh) => {
      row.classList.toggle('ours', !!item.ours);
      const track = row.children[1];
      track.setAttribute('aria-label', item.name + ': ' + item.value.toFixed(1) + unit);
      M.bar(track.firstChild, item.value / max * 100, fresh);
      M.number(row.children[2], item.value, { decimals: 1, suffix: unit, fresh });
    });
  };
  const findPaper = (kind, number) => data.library.find(item => item.kind === kind && item.number === number);
  const paperPreview = item => {
    const figure = node('figure', 'paper-figure'), link = node('a');
    link.href = item.src; link.target = '_blank'; link.rel = 'noopener';
    const image = node('img'); image.src = item.src; image.alt = item.title;
    image.width = item.width; image.height = item.height; image.loading = 'lazy';
    link.append(image);
    const caption = node('figcaption', '', item.title);
    figure.append(link, caption); return figure;
  };

  /* ---------- RL rollout cases ---------- */
  // The selector now controls only the detailed rollout figure.
  const rolloutImage = $('rollout-image'), rolloutView = $('rollout-image-view');
  const zoomButtons = document.querySelectorAll('[data-rollout-zoom]');
  const setRolloutZoom = zoom => {
    const fit = zoom === 'fit';
    rolloutView.toggleAttribute('data-zoomed', !fit);
    rolloutImage.style.width = fit ? '' : Number(rolloutImage.getAttribute('width')) * Number(zoom) + 'px';
    rolloutView.scrollLeft = rolloutView.scrollTop = 0;
    zoomButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rolloutZoom === zoom)));
  };
  zoomButtons.forEach(button => button.addEventListener('click', () => setRolloutZoom(button.dataset.rolloutZoom)));
  const renderRollout = key => {
    const item = data.rollouts[key], source = findPaper('figure', item.figure);
    document.querySelectorAll('[data-rollout]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rollout === key)));
    Object.assign(rolloutImage, { src: source.src, alt: source.title, width: source.width, height: source.height });
    setRolloutZoom('fit');
    $('rollout-image-link').href = source.pdf || source.src;
    M.swapText($('rollout-caption'), source.title + ' · Zoom and scroll to read the details');
  };
  document.querySelectorAll('[data-rollout]').forEach(button => button.addEventListener('click', () => renderRollout(button.dataset.rollout)));
  renderRollout('training');

  /* ---------- Minigame comparison ---------- */
  const miniSelect = $('minigame-result-select');
  data.minigameMetrics.forEach((name, index) => { const option = node('option', '', name); option.value = index; miniSelect.append(option); });
  const renderMiniResults = () => {
    const index = Number(miniSelect.value);
    M.swapText($('minigame-result-heading'), data.minigameMetrics[index]);
    chart($('minigame-result-chart'), data.minigameScores.map(item => ({ ...item, value: item.scores[index] })).sort((a, b) => b.value - a.value));
  };
  miniSelect.addEventListener('change', renderMiniResults); renderMiniResults();
  $('minigame-result-table').append(table(['Model', ...data.minigameMetrics], data.minigameScores.map(item => ({ ours: item.ours, values: [item.name, ...item.scores.map(value => value.toFixed(1))] }))));

  /* ---------- Table 9 waterfall, played step by step ---------- */
  // Each row starts at the previous latency and shrinks to its own value while the
  // headline speedup and latency count along with it.
  (() => {
    const target = $('optimization-chart'); target.replaceChildren();
    const wf = node('div', 'waterfall'), rows = data.optimizations, max = rows[0][4];
    const fmtMs = v => (v < 100 ? v.toFixed(2) : Math.round(v)) + ' ms';
    const pct = v => v / max * 100 + '%';
    const parts = rows.map((row, i) => {
      const prev = i ? rows[i - 1][4] : row[4], cur = row[4];
      const r = node('div', 'wf-row on' + (i === rows.length - 1 ? ' final' : ''));
      const track = node('div', 'wf-track'), remain = node('i'), cut = node('i', 'cut');
      remain.style.left = '0'; remain.style.width = pct(cur);
      cut.style.left = pct(cur); cut.style.width = pct(prev - cur);
      if (prev > cur) cut.title = '−' + (prev - cur).toFixed(0) + ' ms';
      track.append(remain, cut);
      track.setAttribute('role', 'img'); track.setAttribute('aria-label', row[0] + ': ' + cur.toFixed(2) + ' ms');
      const value = node('b', '', fmtMs(cur));
      r.append(node('span', '', row[0]), track, value); wf.append(r);
      return { r, remain, cut, value, prev, cur };
    });
    target.append(wf);
    const speed = document.querySelector('.engine-speedup'), pair = document.querySelector('.latency-pair b');
    const speedFmt = v => v.toFixed(1) + '×';
    let timers = [];
    const stage = (p, done) => {
      p.r.classList.toggle('on', done);
      p.remain.style.width = pct(done ? p.cur : p.prev);
      p.cut.style.left = pct(p.cur);
      p.cut.style.width = done ? pct(p.prev - p.cur) : '0%';
    };
    const play = () => {
      timers.forEach(clearTimeout); timers = [];
      if (M.reduced) return;
      parts.forEach(p => stage(p, false));
      if (speed) M.setNumber(speed, 1, speedFmt);
      if (pair) M.setNumber(pair, max, fmtMs);
      parts.forEach((p, i) => timers.push(setTimeout(() => {
        stage(p, true);
        if (pair) M.number(pair, p.cur, { format: fmtMs, duration: 420 });
        if (speed) M.number(speed, max / p.cur, { format: speedFmt, duration: 420 });
      }, 200 + i * 300)));
    };
    M.whenVisible(target, play);
    $('optimization-replay')?.addEventListener('click', play);
  })();
  $('optimization-table').append(table(['Cumulative configuration', 'Vision ms', 'Prefill ms', 'Decode ms', 'Latency ms', 'Step Hz', 'Control Hz'], data.optimizations.map((row, index) => ({ ours: index === data.optimizations.length - 1, values: [row[0], ...row.slice(1).map(value => value.toFixed(2))] }))));

  $('data-table-previews').append(paperPreview(findPaper('table', 2)));
})();
