// Multi-level task supervision (paper Fig. 7) as a four-step animation: segment the recording
// into key actions, label each as an L1 operation, merge them into L2 subgoals, then one L3 task.
(() => {
  'use strict';
  const root = document.getElementById('df-anim');
  const M = window.GamerMotion;
  if (!root || !M) return;
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

  const T0 = 56.037, T1 = 128.031;
  const OPS = [
    [56.037, 'Start the current challenge'], [64.087, 'Review the opponent setup'], [80.087, 'Choose an investment option'],
    [95.876, 'Temporarily leave the attempt'], [111.994, 'Start the next challenge'], [128.031, 'Choose the next investment']
  ];
  const GOALS = [[0, 2, 'Complete setup for the first Currency Wars stage 1-1 attempt.', '56.037–80.087 s'], [3, 5, 'Leave the current attempt and prepare the next challenge.', '95.876–128.031 s']];
  const TASK = 'Attempt Currency Wars stage 1-1 by preparing the challenge, reviewing the opponent setup, and choosing an investment. Temporarily leave the attempt, then prepare the next challenge.';
  const CAPTIONS = [
    'The aligned recording is segmented around detected key actions.',
    'Each short clip receives an L1 operation instruction covering one or two key decisions.',
    'Adjacent operations form L2 subgoals covering three to five decisions.',
    'Subgoals form an L3 task with an instruction covering the full sequence.'
  ];
  const SAMPLE_COUNTS = [null, '~261K samples', '~211K samples', '~234K samples'];
  const pct = t => (t - T0) / (T1 - T0) * 100;

  // Timeline ticks under the source frame.
  const timeline = $('df-timeline');
  OPS.forEach(([t], i) => { const tick = el('span', 'df-tick'); tick.style.left = pct(t) + '%'; tick.title = t.toFixed(3) + ' s'; tick.style.setProperty('--i', i); timeline.append(tick); });

  // L1: six clips with their operation text.
  const l1 = $('df-l1');
  l1.append(el('span', 'df-row-tag', 'L1'));
  const clips = OPS.map(([t, text], i) => {
    const card = el('div', 'df-clip'); card.style.setProperty('--i', i);
    const img = el('img'); img.src = 'assets/data-factory/short-' + (i + 1) + '.jpg'; img.alt = text; img.width = 116; img.height = 65;
    card.append(img, el('p', 'df-op', text));
    l1.append(card); return card;
  });
  // L2 and L3 brackets.
  const l2 = $('df-l2'); l2.append(el('span', 'df-row-tag', 'L2'));
  const goals = GOALS.map(([a, b, text, span], i) => {
    const g = el('div', 'df-goal'); g.style.gridColumn = (a + 2) + ' / ' + (b + 3); g.style.setProperty('--i', i);
    g.append(el('p', '', text)); l2.append(g); return g;
  });
  const l3 = $('df-l3'); l3.append(el('span', 'df-row-tag', 'L3'));
  const task = el('div', 'df-task'); task.style.gridColumn = '2 / 8';
  task.append(el('p', '', TASK)); l3.append(task);

  const buttons = [...root.querySelectorAll('[data-df-step]')];
  const playhead = $('df-playhead');
  let step = -1, timer = 0, playing = false;
  const show = s => {
    step = s;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.dfStep) === s)));
    root.dataset.step = s;
    M.swapText($('df-caption'), CAPTIONS[s]);
    const count = $('df-count');
    count.hidden = SAMPLE_COUNTS[s] === null;
    count.textContent = SAMPLE_COUNTS[s] || '';
    count.setAttribute('aria-label', s ? `L${s}: ${SAMPLE_COUNTS[s]}` : '');
    playhead.style.left = (s === 0 ? 100 : 0) + '%';
    if (s === 0) M.restart(timeline, 'df-scan');
  };
  const stop = () => { playing = false; clearTimeout(timer); $('df-play').textContent = '▶ Play'; };
  const play = (from = 0) => {
    stop(); playing = true; $('df-play').textContent = '⏸ Pause';
    const run = s => { show(s); if (s < 3) timer = setTimeout(() => run(s + 1), M.reduced ? 800 : 1400); else timer = setTimeout(stop, 1400); };
    run(from);
  };
  buttons.forEach(b => b.addEventListener('click', () => { stop(); show(Number(b.dataset.dfStep)); }));
  $('df-play').addEventListener('click', () => playing ? stop() : play(step >= 3 || step < 0 ? 0 : step));
  show(3); // fully built state until it scrolls into view
  M.whenVisible(root, () => { if (!M.reduced) play(0); });
})();
