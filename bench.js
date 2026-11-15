// RT vs TP recordings: each card plays the same task twice, side by side, once with the game
// paused during inference (TP) and once with the game running (RT), plus the mean over all runs.
(() => {
  'use strict';
  const data = window.GAMER?.benchVideos;
  const host = document.getElementById('bench-grid');
  const tabs = document.getElementById('bench-tabs');
  const M = window.GamerMotion;
  if (!data || !host || !tabs || !M) return;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const BENCHES = [
    { id: 'mcu', name: 'MCU', unit: 'success' },
    { id: 'vizdoom', name: 'ViZDoom', unit: 'score' },
    { id: 'oga', name: 'OmniGameArena', unit: 'progress' },
    { id: 'gameworld', name: 'GameWorld', unit: 'progress' }
  ];
  const percentage = v => (v * 100).toFixed(1).replace(/\.0$/, '');
  const fmtMean = (bench, v) => bench.unit === 'score' ? v.toFixed(1) : percentage(v) + '%';
  // MCU runs only succeed or fail: clips show the outcome, means show successes out of all runs.

  // The shared viewport controller starts/stops each comparison pair together.
  const restartPair = card => window.GamerPlayback.restart(card._videos || []);

  // crop = [x, y, w, h] in source pixels: the frame shows only that region (the game area),
  // hiding overlays such as the keyboard/mouse drawing or the reasoning panel.
  const clip = (bench, mode, run, crop, delta) => {
    const fig = el('figure', 'bc-clip ' + mode);
    const tag = el('span', 'bc-tag', mode === 'rt' ? '▶ RT · real-time' : '⏸ TP · time-paused');
    const frame = el('div', 'bc-frame');
    const video = el('video'); video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'none';
    video.dataset.src = run.src; video.setAttribute('aria-label', (mode === 'rt' ? 'Real-time' : 'Time-paused') + ' run');
    if (M.reduced) video.controls = true;
    video.addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); });
    const time = el('i', 'bc-time');
    video.addEventListener('timeupdate', () => { time.style.transform = 'scaleX(' + (video.duration ? video.currentTime / video.duration : 0) + ')'; });
    if (crop) {
      const [cx, cy, cw, ch] = crop;
      frame.classList.add('bc-cropped'); frame.style.aspectRatio = cw + ' / ' + ch;
      const fit = () => {
        const sw = video.videoWidth, sh = video.videoHeight; if (!sw) return;
        const scale = 100 / cw * sw;               // video width as % of the frame
        video.style.width = scale + '%'; video.style.height = 'auto';
        video.style.left = -cx / cw * 100 + '%'; video.style.top = -cy / ch * 100 + '%';
      };
      video.addEventListener('loadedmetadata', fit); fit();
    }
    frame.append(video, time);
    const heading = el('div', 'bc-clip-head');
    const wins = run.wins ?? Math.round(run.mean * run.runs);
    const metric = bench.unit === 'success'
      ? 'Success rate: ' + wins + '/' + run.runs
      : (bench.unit === 'score' ? 'Mean score: ' : 'Mean progress: ') + fmtMean(bench, run.mean);
    heading.append(tag, el('span', 'bc-rate', metric));
    if (mode === 'rt') {
      const amount = bench.unit === 'score' ? Math.abs(delta).toFixed(1) : percentage(Math.abs(delta));
      const sign = delta >= 0 ? '+' : '−';
      const unit = bench.unit === 'score' ? ' points' : ' pp';
      const lift = el('span', 'bc-lift' + (delta >= 0 ? ' up' : ' down'), sign + amount + unit + ' vs TP');
      const explanation = amount + (bench.unit === 'score' ? ' points ' : ' percentage points ') + (delta >= 0 ? 'higher' : 'lower') + ' than TP';
      lift.title = explanation; lift.setAttribute('aria-label', explanation);
      heading.append(lift);
    }
    fig.append(heading, frame);
    if (bench.unit === 'success') {
      const cap = el('figcaption');
      cap.append(el('span', '', 'Result'), el('em', run.success ? 'bc-solved' : 'bc-failed', run.success ? '✓ Success' : '✗ Fail'));
      fig.append(cap);
    }
    return { fig, video };
  };

  const card = (bench, item) => {
    const rate = bench.unit === 'success';
    const article = el('article', 'bc-card bc-inline-metrics' + (rate ? ' bc-success' : ''));
    const head = el('header', 'bc-head');
    const titles = el('div');
    titles.append(el('h4', '', item.game + ' (with ' + item.model + ')'));
    const sync = el('button', 'bc-sync', '↻'); sync.type = 'button'; sync.title = 'Restart both clips together'; sync.setAttribute('aria-label', 'Restart both ' + item.game + ' clips together');
    sync.addEventListener('click', () => { restartPair(article); M.restart(sync, 'spin'); });
    head.append(titles, sync);
    const gap = item.rt.mean - item.tp.mean;
    const pair = el('div', 'bc-pair'), tp = clip(bench, 'tp', item.tp, item.crop, gap), rt = clip(bench, 'rt', item.rt, item.crop, gap);
    pair.append(tp.fig, rt.fig);
    article._videos = [tp.video, rt.video];
    // Start both clips at the same moment once each has enough data to play.
    let ready = 0;
    article._videos.forEach(v => v.addEventListener('canplay', () => { if (++ready === 2 && article._videos.every(v => window.GamerPlayback.isActive(v))) restartPair(article); }, { once: true }));
    // Aggregate metrics are aligned above their respective recordings.
    article.append(head, pair);
    return article;
  };

  const placeholder = bench => {
    const article = el('article', 'bc-card bc-placeholder');
    const head = el('header', 'bc-head'); const titles = el('div');
    titles.append(el('h4', '', bench.name), el('span', 'bc-model', 'Recordings coming soon'));
    head.append(titles);
    const pair = el('div', 'bc-pair');
    [['tp', '⏸ TP · time-paused'], ['rt', '▶ RT · real-time']].forEach(([mode, label]) => {
      const fig = el('figure', 'bc-clip ' + mode), frame = el('div', 'bc-frame bc-empty');
      frame.append(el('span', '', 'Clip slot reserved'));
      fig.append(el('span', 'bc-tag', label), frame); pair.append(fig);
    });
    article.append(head, pair);
    return article;
  };

  const render = id => {
    const bench = BENCHES.find(b => b.id === id);
    [...tabs.children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bench === id)));
    const items = data[id] || [];
    const draw = () => {
      host.querySelectorAll('.bc-card').forEach(c => { (c._videos || []).forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }); });
      host.replaceChildren();
      host.dataset.bench = id;
      if (!items.length) host.append(placeholder(bench));
      else items.forEach(item => { const c = card(bench, item); host.append(c); });
      window.GamerPlayback.refresh();
    };
    M.swapContent(host, draw, { items: '.bc-card' });
  };

  BENCHES.forEach(bench => {
    const b = el('button', '', bench.name); b.type = 'button'; b.dataset.bench = bench.id;
    if (!(data[bench.id] || []).length) b.append(el('small', 'bc-soon', 'soon'));
    b.addEventListener('click', () => render(bench.id));
    tabs.append(b);
  });
  render('mcu');
})();
