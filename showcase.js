// Showcase components: chapter navigation, theme, pipeline, Pause⇄Run switch, milestone timelines,
// action-packet demo.
(() => {
  'use strict';
  const G = window.GAMER || {};
  const S = G.showcase, R = G.research;
  const M = window.GamerMotion;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt1 = v => (Math.round(v * 10) / 10).toFixed(1);

  /* ---------- Theme ---------- */
  const themeButton = $('theme-toggle');
  const applyTheme = theme => {
    document.documentElement.dataset.theme = theme;
    if (themeButton) { themeButton.setAttribute('aria-pressed', String(theme === 'dark')); themeButton.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'; }
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme === 'dark' ? '#0b0f1a' : '#080b13');
  };
  applyTheme(document.documentElement.dataset.theme || 'light');
  let currentTheme = document.documentElement.dataset.theme || 'light';
  themeButton?.addEventListener('click', () => {
    // Track the target theme ourselves so quick repeated clicks always alternate.
    const next = currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('gamer-theme', next); } catch {}
    // A circular reveal grows from the toggle where the browser supports view transitions.
    if (!document.startViewTransition || reduced || document.hidden) { applyTheme(next); return; }
    const r = themeButton.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    const transition = document.startViewTransition(() => applyTheme(currentTheme));
    transition.ready.then(() => {
      document.documentElement.animate({ clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
        { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
    setTimeout(() => { if (document.documentElement.dataset.theme !== currentTheme) applyTheme(currentTheme); }, 400);
  });

  /* ---------- Reading progress + scroll-spy ---------- */
  const progress = $('read-progress');
  const navLinks = [...document.querySelectorAll('.nav nav a[href^="#"]')];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= 120) current = s;
    navLinks.forEach(a => a.classList.toggle('current', current && a.getAttribute('href') === '#' + current.id));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Count-up on reveal ---------- */
  const countUp = (node, target, decimals, suffix, duration = 1100) => {
    if (reduced) { node.textContent = target.toFixed(decimals) + suffix; return; }
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / duration), eased = 1 - Math.pow(1 - t, 3);
      node.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const revealOnce = (node, callback) => {
    if (M) { M.whenVisible(node, callback); return; }
    if (!('IntersectionObserver' in window)) { callback(); return; }
    const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); callback(); } }, { threshold: 0.3 });
    io.observe(node);
  };
  document.querySelectorAll('[data-count]').forEach(node => {
    const target = Number(node.dataset.count), decimals = Number(node.dataset.decimals || 0), suffix = node.dataset.suffix || '';
    revealOnce(node, () => countUp(node, target, decimals, suffix));
  });
  document.querySelectorAll('.reveal').forEach(node => revealOnce(node, () => node.classList.add('is-visible')));

  /* ---------- 48-game marquee ---------- */
  const marquee = $('game-marquee');
  if (marquee && S) {
    const track = el('div', 'marquee-track');
    [...S.games, ...S.games].forEach(([name]) => { const item = el('span', 'marquee-item'); item.append(el('b', '', name)); track.append(item); });
    marquee.append(track);
  }

  /* ---------- Table 1: agent comparison ---------- */
  const agentTarget = $('agent-table');
  if (agentTarget && S) {
    const t = el('table', 'agent-table'), thead = el('thead'), tr = el('tr');
    S.agents.columns.forEach(c => tr.append(el('th', '', c))); thead.append(tr);
    const tbody = el('tbody');
    S.agents.rows.forEach(row => {
      const r = el('tr', row[0].startsWith('Gamer') ? 'highlight' : '');
      row.forEach((v, i) => {
        const cell = el(i ? 'td' : 'th', '');
        if (typeof v === 'boolean') { cell.className = v ? 'yes' : 'no'; cell.textContent = v ? '✓' : '✗'; cell.setAttribute('aria-label', v ? 'yes' : 'no'); }
        else cell.textContent = v;
        if (!i) cell.scope = 'row';
        r.append(cell);
      });
      tbody.append(r);
    });
    t.append(thead, tbody); agentTarget.append(t);
    revealOnce(agentTarget, () => M.staggerIn(tbody.rows, 70));
  }

  /* ---------- Action packet demo (Fig. 3) ---------- */
  const packet = $('action-demo');
  if (packet && S) {
    const KEYS = [['W'], ['A', 'S', 'D'], ['Shift', 'Space', 'F'], ['LMB', 'RMB']];
    const think = $('action-think'), note = $('action-note'), mouse = $('action-mouse'), arrow = $('action-arrow');
    const blocks = [...packet.querySelectorAll('.packet-block')];
    const keyboard = $('action-keyboard'); keyboard.replaceChildren();
    KEYS.forEach(rowKeys => { const row = el('div', 'key-row'); rowKeys.forEach(k => { const key = el('span', 'key', k); key.dataset.key = k; row.append(key); }); keyboard.append(row); });
    const serial = $('action-serial');
    let step = 0, block = 0, timer;
    const render = () => {
      const item = S.actionDemo[step];
      think.textContent = item.think ? item.think : '<think></think>';
      think.classList.toggle('empty', !item.think);
      note.textContent = item.note;
      mouse.textContent = 'ΔP = (' + item.mouse.join(', ') + ')';
      const [dx, dy] = item.mouse, len = Math.hypot(dx, dy);
      arrow.style.transform = 'rotate(' + (len ? Math.atan2(dy, dx) * 180 / Math.PI : 0) + 'deg) scaleX(' + Math.min(1, len / 120) + ')';
      arrow.style.opacity = len ? 1 : 0.15;
      blocks.forEach((b, i) => { b.textContent = item.blocks[i].length ? item.blocks[i].join('+') : '∅'; b.classList.toggle('active', i === block); b.classList.toggle('held', item.blocks[i].length > 0); });
      const active = new Set(item.blocks[block]);
      keyboard.querySelectorAll('.key').forEach(k => k.classList.toggle('down', active.has(k.dataset.key)));
      serial.textContent = '<|action_start|> ' + item.mouse.join(',') + ' ; ' + item.blocks.map(b => b.length ? b.join('+') : '-').join(' ; ') + ' <|action_end|>';
      $('action-step').textContent = 'Observation ' + (step + 1) + ' / ' + S.actionDemo.length + ' · block ' + (block + 1) + ' / 6';
    };
    const advance = () => { block++; if (block > 5) { block = 0; step = (step + 1) % S.actionDemo.length; } render(); };
    const play = () => { clearInterval(timer); if (!reduced) timer = setInterval(advance, 230); };
    $('action-prev')?.addEventListener('click', () => { clearInterval(timer); block = 0; step = (step + S.actionDemo.length - 1) % S.actionDemo.length; render(); });
    $('action-next')?.addEventListener('click', () => { clearInterval(timer); block = 0; step = (step + 1) % S.actionDemo.length; render(); });
    $('action-play')?.addEventListener('click', play);
    render(); revealOnce(packet, play);
  }

  /* ---------- Repeat-aware loss decay ---------- */
  const decay = $('decay-demo');
  if (decay && S) {
    // Bars rise one by one on first view; the γ slider then reshapes them live.
    const seq = ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'A', 'A', 'W', 'W', 'F', 'W', 'W', 'W'];
    let n = 0, prev = null;
    const cells = seq.map((k, i) => {
      n = k === prev ? n + 1 : 1; prev = k;
      const cell = el('div', 'decay-cell' + (n === 1 ? ' fresh' : ''));
      const bar = el('i'), weight = el('small');
      bar.style.transitionDelay = (i * 45) + 'ms';
      cell.append(bar, el('b', '', k), weight); decay.append(cell);
      return { cell, bar, weight, repeat: n };
    });
    const gammaInput = $('decay-gamma'), gammaOut = $('decay-gamma-out');
    let fresh = true;
    const update = () => {
      const gamma = gammaInput ? Number(gammaInput.value) : S.stats.gamma;
      if (gammaOut) gammaOut.textContent = gamma.toFixed(2);
      const total = cells.reduce((s, c) => s + Math.pow(gamma, c.repeat - 1), 0);
      cells.forEach(({ cell, bar, weight, repeat }) => {
        const w = Math.pow(gamma, repeat - 1);
        M.bar(bar, w * 100, fresh, 'height');
        M.number(weight, w, { decimals: 2, fresh, duration: 300 });
        cell.title = 'repeat #' + repeat + ' → weight γ^' + (repeat - 1) + ' = ' + w.toFixed(3);
      });
      // Each transition step (first press of a key) has weight 1, so their share is count / total weight.
      const share = $('decay-share');
      if (share) M.number(share, cells.filter(c => c.repeat === 1).length / total * 100, { decimals: 0, suffix: '%', fresh, duration: 300 });
      if (!fresh) cells.forEach(c => { c.bar.style.transitionDelay = '0ms'; });
      fresh = false;
    };
    gammaInput?.addEventListener('input', update);
    update();
  }

  /* ---------- Random key remapping: the rebound keys trade places on a loop (CSS) ---------- */
  // Demo: each trajectory draws a new bijection over the movement keys. The task text and the
  // pressed key change, but the agent's movement stays the same because it follows the function.
  const remapDemo = $('remap-demo');
  if (remapDemo && M) {
    const KEYS = ['A', 'D', 'W', 'S'], FUNCS = [['left', -1, 0], ['right', 1, 0], ['up', 0, -1], ['down', 0, 1]];
    const keyEls = {}, keysBox = $('rd-keys');
    KEYS.forEach(k => { const el2 = el('span', 'key', k); keysBox.append(el2); keyEls[k] = el2; });
    const agent = $('rd-agent'), spec = $('rd-spec'), traj = $('rd-traj');
    const route = [0, 0, 2, 1, 1, 3, 1, 2];     // function indices: same plan every trajectory
    let mapping = ['A', 'D', 'W', 'S'], n = 1, step = 0, pos = [50, 50], timer = 0;
    const shuffle = () => { const m = [...KEYS]; for (let i = m.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [m[i], m[j]] = [m[j], m[i]]; } return m.join() === mapping.join() ? shuffle() : m; };
    const showSpec = () => {
      spec.replaceChildren(...FUNCS.map(([f], i) => { const s = el('span', 'rd-bind'); s.append(el('b', '', mapping[i]), document.createTextNode(' ' + f)); return s; }));
      M.restart(spec, 'rd-pop');
    };
    const tick = () => {
      const fi = route[step % route.length], [f, dx, dy] = FUNCS[fi], key = mapping[fi];
      pos = [Math.max(8, Math.min(92, pos[0] + dx * 14)), Math.max(18, Math.min(82, pos[1] + dy * 22))];
      agent.style.left = pos[0] + '%'; agent.style.top = pos[1] + '%';
      Object.values(keyEls).forEach(k => k.classList.remove('down'));
      keyEls[key].classList.add('down'); M.restart(keyEls[key], 'rd-press');
      M.swapText($('rd-intent'), 'move ' + f); M.swapText($('rd-key'), key); M.swapText($('rd-result'), 'moves ' + f + ' ✓');
      step++;
      if (step % route.length === 0) { setTimeout(next, 900); return; }
      timer = setTimeout(tick, 900);
    };
    const next = () => {
      clearTimeout(timer); mapping = n === 0 ? mapping : shuffle(); n++;
      M.swapText(traj, 'Trajectory ' + n); showSpec(); pos = [50, 50]; step = 0;
      agent.style.left = '50%'; agent.style.top = '50%';
      timer = setTimeout(tick, 700);
    };
    showSpec();
    $('rd-next')?.addEventListener('click', next);
    revealOnce(remapDemo, () => { if (reduced) return; timer = setTimeout(tick, 600); });
  }

  /* ---------- Pause ⇄ Run switch (Table 5) ---------- */
  const rtChart = $('pause-run-chart');
  if (rtChart && G.realtime) {
    const names = ['Average', 'MCU', 'ViZDoom', 'OmniGameArena', 'GameWorld'];
    const dataIndex = { Average: 4, MCU: 0, ViZDoom: 1, OmniGameArena: 2, GameWorld: 3 }; // column order in G.realtime
    let mode = 'running', bench = 0;
    const toggle = $('pause-run-toggle');
    const benchTabs = $('pause-run-bench');
    names.forEach((n, i) => { const b = el('button', '', n); b.type = 'button'; b.setAttribute('aria-pressed', String(i === bench)); b.addEventListener('click', () => { bench = i; [...benchTabs.children].forEach((c, j) => c.setAttribute('aria-pressed', String(j === bench))); draw(); }); benchTabs.append(b); });
    const rows = new Map();
    const panel = rtChart.closest('.pause-run');
    const picked = G.realtime.filter(x => x.ours || !x.name.startsWith('Qwen'));
    picked.forEach(item => {
      const row = el('div', 'pr-row' + (item.ours ? ' ours' : ''));
      const name = el('span', 'pr-name', item.name), track = el('div', 'pr-track'), ghost = el('i', 'pr-ghost'), fill = el('i', 'pr-fill'), val = el('b', 'pr-value'), delta = el('small', 'pr-delta');
      track.append(ghost, fill); row.append(name, track, val, delta); rtChart.append(row);
      rows.set(item.name, { row, ghost, fill, val, delta, item });
    });
    let first = true;
    // Rows glide to their new rank, bars stretch or shrink, scores count, and once the game runs a
    // hatched ghost keeps the paused score visible so the drop reads at a glance.
    const draw = () => {
      const idx = dataIndex[names[bench]];
      const score = item => mode === 'paused' ? item.rt[idx] - item.delta[idx] : item.rt[idx];
      const order = [...picked].sort((a, b) => score(b) - score(a));
      M.flip(rtChart, () => order.forEach(item => rtChart.append(rows.get(item.name).row)));
      rows.forEach(({ ghost, fill, val, delta, item }) => {
        const rt = item.rt[idx], tp = rt - item.delta[idx], v = mode === 'paused' ? tp : rt, d = item.delta[idx];
        M.bar(ghost, Math.max(0.5, tp), first);
        M.bar(fill, Math.max(0.5, v), first);
        M.number(val, v, { decimals: 1, fresh: first });
        const text = mode === 'paused' ? '' : (d > 0 ? '+' : '') + fmt1(d);
        if (delta.textContent !== text) { delta.textContent = text; if (text) M.restart(delta, 'pop'); }
        delta.className = 'pr-delta ' + (d > 0 ? 'up' : d < 0 ? 'down' : '') + (text ? ' pop' : '');
      });
      first = false;
      panel.dataset.mode = mode;
      M.swapText($('pause-run-heading'), names[bench] + ' · ' + (mode === 'paused' ? 'time-paused (TP)' : 'real-time (RT)'));
      const frontier = picked.filter(x => !x.ours), avgDrop = frontier.reduce((s, x) => s + x.delta[idx], 0) / frontier.length;
      const ours = picked.find(x => x.name === 'Gamer-35B-A3B-CPT');
      M.swapText($('pause-run-summary'), mode === 'paused'
        ? 'Time-paused scores. Select real-time evaluation to compare the same policies while the environment continues running.'
        : 'Mean change (RT − TP): ' + (avgDrop > 0 ? '+' : '') + fmt1(avgDrop) + ' points for the displayed baselines; ' + (ours.delta[idx] > 0 ? '+' : '') + fmt1(ours.delta[idx]) + ' points for Gamer-35B-A3B-CPT.');
    };
    toggle.addEventListener('click', () => { mode = mode === 'paused' ? 'running' : 'paused'; toggle.setAttribute('aria-checked', String(mode === 'running')); toggle.dataset.mode = mode; M.restart(panel, 'pr-flash'); draw(); });
    draw();
  }

  /* ---------- Milestone timelines (Tables 13/14) ---------- */
  const TYPE = { N: ['Navigation', 'nav'], D: ['Dialogue', 'dlg'], C: ['Combat', 'cmb'], U: ['UI interaction', 'ui'], P: ['Puzzle', 'puz'] };
  document.querySelectorAll('[data-quest-timeline]').forEach(host => {
    const quest = S?.quests[host.dataset.questTimeline]; if (!quest) return;
    const bar = el('div', 'ms-bar'), detail = el('div', 'ms-detail');
    const counts = {}, shows = [];
    let autoplay = null, userTookOver = false;
    const stopAutoplay = () => { userTookOver = true; clearInterval(autoplay); };
    quest.milestones.forEach(([id, text, type, s], i) => {
      counts[type] = (counts[type] || 0) + 1;
      const seg = el('button', 'ms-seg ' + TYPE[type][1]); seg.type = 'button'; seg.style.flexGrow = s; seg.style.setProperty('--i', i);
      seg.setAttribute('aria-label', id + ' · ' + TYPE[type][0] + ' · ' + text + ' · budget ' + s + ' s');
      const show = () => {
        if (seg.classList.contains('current')) return;
        detail.replaceChildren(el('b', '', '#' + id + ' · ' + TYPE[type][0]), el('span', '', text), el('small', '', 'Configured budget ' + s + ' s · milestone ' + (i + 1) + ' / ' + quest.milestones.length));
        M.restart(detail, 'ms-pop');
        bar.querySelectorAll('.ms-seg').forEach(x => x.classList.toggle('current', x === seg));
      };
      shows.push(show);
      const manual = () => { stopAutoplay(); show(); };
      seg.addEventListener('mouseenter', manual); seg.addEventListener('focus', manual); seg.addEventListener('click', manual);
      bar.append(seg);
    });
    // On first view the segments grow in, then a playhead walks the quest until the reader takes over.
    M.whenVisible(host, () => {
      if (reduced) return;
      M.restart(bar, 'ms-grow');
      let step = 0;
      setTimeout(() => {
        if (userTookOver) return;
        shows[0]();
        autoplay = setInterval(() => { step = (step + 1) % shows.length; shows[step](); }, 1700);
      }, 1100);
    });
    const legend = el('div', 'ms-legend');
    Object.entries(TYPE).forEach(([k, [name, cls]]) => { if (counts[k]) { const item = el('span', cls); item.append(el('i'), document.createTextNode(name + ' ' + counts[k])); legend.append(item); } });
    const head = el('div', 'ms-head'); head.append(el('strong', '', quest.milestones.length + ' milestones · ' + quest.parentSteps + ' parent steps'), el('span', '', 'Total budget ' + Math.floor(quest.total / 60) + ' min ' + (quest.total % 60 ? quest.total % 60 + ' s' : '')));
    detail.append(el('b', '', 'Hover a segment'), el('span', '', 'Segment width is the configured per-milestone budget, not measured completion time.'));
    host.append(head, bar, legend, detail);
  });

  /* ---------- BibTeX copy ---------- */
  $('copy-bibtex')?.addEventListener('click', async () => {
    const text = $('bibtex')?.textContent || '';
    const button = $('copy-bibtex');
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); copied = true; } } catch {}
    if (!copied) {
      const field = document.createElement('textarea');
      field.value = text; field.readOnly = true;
      field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.append(field); field.select();
      try { copied = document.execCommand('copy'); } catch {}
      field.remove(); button.focus({preventScroll:true});
    }
    if (copied) {
      button.textContent = 'Copied ✓';
      setTimeout(() => button.textContent = 'Copy BibTeX', 1800);
    } else {
      const selection = getSelection(), range = document.createRange();
      range.selectNodeContents($('bibtex')); selection.removeAllRanges(); selection.addRange(range);
      button.textContent = 'Select and copy';
    }
  });
})();
