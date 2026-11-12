// Shared motion layer: keyed list updates with FLIP reordering, number tweens, growing bars,
// text and image cross-fades, sliding indicators for segmented controls, scroll reveals,
// sortable tables, and a zooming figure lightbox. Every helper degrades to an instant
// update when the reader prefers reduced motion.
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  /* ---------- Visibility: run once when an element first scrolls into view ---------- */
  // Elements inside a closed <details> have no box, so they wait until the panel opens.
  const watchers = new Map();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const list = watchers.get(entry.target);
      watchers.delete(entry.target); io.unobserve(entry.target);
      list?.forEach(fn => fn());
    });
  }, { threshold: 0.12 }) : null;
  const whenVisible = (el, fn) => {
    if (!io || reduced || !el) { fn(); return; }
    if (!watchers.has(el)) { watchers.set(el, []); io.observe(el); }
    watchers.get(el).push(fn);
    armFallback();
  };
  // Fallback: IntersectionObserver callbacks can stall in throttled or background tabs, which
  // would leave revealed content invisible. A cheap position check on scroll and on a slow
  // timer guarantees every watcher eventually fires.
  let fallbackTimer = 0;
  const sweep = () => {
    watchers.forEach((list, target) => {
      if (!target.isConnected) { watchers.delete(target); io.unobserve(target); return; }
      const r = target.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return; // inside a closed <details>
      if (r.top < innerHeight && r.bottom > 0) { watchers.delete(target); io.unobserve(target); list.forEach(fn => fn()); }
    });
    if (!watchers.size) { clearInterval(fallbackTimer); fallbackTimer = 0; }
  };
  const armFallback = () => { if (!fallbackTimer) fallbackTimer = setInterval(sweep, 700); };
  addEventListener('scroll', () => { if (watchers.size) requestAnimationFrame(sweep); }, { passive: true });
  document.addEventListener('toggle', () => { if (watchers.size) setTimeout(sweep, 50); }, true);

  /* ---------- Small animation primitives ---------- */
  const restart = (el, cls) => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const enter = (node, index = 0) => {
    if (reduced) return;
    node.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, delay: Math.min(index, 14) * 40, easing: EASE, fill: 'backwards' });
  };
  const staggerIn = (nodes, step = 45) => {
    if (reduced) return;
    [...nodes].forEach((node, i) => node.animate(
      [{ opacity: 0, transform: 'translateY(14px) scale(.985)' }, { opacity: 1, transform: 'none' }],
      { duration: 480, delay: Math.min(i, 14) * step, easing: EASE, fill: 'backwards' }));
  };

  // FLIP: measure children, run the DOM change, then animate each child from its old position.
  const flip = (container, mutate, opts = {}) => {
    if (reduced || !container || !container.getClientRects().length) { mutate(); return; }
    const before = new Map([...container.children].map(c => [c, c.getBoundingClientRect()]));
    mutate();
    [...container.children].forEach(child => {
      const a = before.get(child); if (!a) return;
      const b = child.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        child.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
          { duration: opts.duration || 560, easing: EASE });
      }
    });
  };

  // Reuse child nodes by key so bars and numbers animate between states instead of being rebuilt.
  const keyed = (container, items, keyOf, create, update) => {
    flip(container, () => {
      const old = new Map();
      [...container.children].forEach(child => {
        if (child.dataset.key !== undefined) old.set(child.dataset.key, child); else child.remove();
      });
      let freshCount = 0;
      items.forEach((item, i) => {
        const key = String(keyOf(item, i));
        let node = old.get(key);
        const fresh = !node;
        if (fresh) { node = create(item, i); node.dataset.key = key; } else old.delete(key);
        container.append(node);
        update(node, item, i, fresh);
        if (fresh) enter(node, freshCount++);
      });
      old.forEach(node => node.remove());
    });
  };

  // Bars grow from zero the first time they are seen, then glide between values.
  const bar = (el, pct, fresh, prop = 'width') => {
    const value = Math.max(0, Math.min(100, pct)) + '%';
    el._bar = value;
    if (fresh && !reduced) {
      el.style[prop] = '0%';
      // Flushing style commits the 0% start, so the transition runs even without animation frames.
      whenVisible(el.parentElement || el, () => { void el.offsetWidth; el.style[prop] = el._bar; });
    } else el.style[prop] = value;
  };

  // Numbers tween from the value currently shown; the first fresh render counts up from zero on view.
  // A timer guarantees the final value even where animation frames are throttled (hidden panes).
  const tweenNumber = (el, duration = 700) => {
    cancelAnimationFrame(el._numRaf); clearTimeout(el._numDone);
    const from = el._num, to = el._numTarget, fmt = el._numFmt;
    if (reduced || Math.abs(from - to) < 1e-9) { el._num = to; el.textContent = fmt(to); return; }
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      el._num = t < 1 ? from + (to - from) * easeOut(t) : to;
      el.textContent = fmt(el._num);
      if (t < 1) el._numRaf = requestAnimationFrame(tick);
    };
    el._numRaf = requestAnimationFrame(tick);
    el._numDone = setTimeout(() => { if (el._numTarget === to) { cancelAnimationFrame(el._numRaf); el._num = to; el.textContent = fmt(to); } }, duration + 80);
  };
  const number = (el, to, opts = {}) => {
    if (!el) return;
    el._numTarget = to;
    el._numFmt = opts.format || (v => (opts.prefix || '') + v.toFixed(opts.decimals ?? 1) + (opts.suffix || ''));
    if (el._numPending) return;
    if (el._num === undefined && opts.fresh && !reduced) {
      el._numPending = true; el._num = opts.from ?? 0; el.textContent = el._numFmt(el._num);
      whenVisible(el, () => { el._numPending = false; tweenNumber(el, opts.duration || 1000); });
      return;
    }
    if (el._num === undefined) { el._num = to; el.textContent = el._numFmt(to); return; }
    tweenNumber(el, opts.duration);
  };
  const setNumber = (el, value, fmt) => {
    cancelAnimationFrame(el._numRaf); clearTimeout(el._numDone); el._numPending = false;
    el._num = el._numTarget = value; if (fmt) el._numFmt = fmt; el.textContent = el._numFmt(value);
  };

  // Text cross-fade: slide the old text up and out, the new text in from below.
  const swapText = (el, text) => {
    if (!el) return;
    text = String(text);
    if (el._swapTo === text || (el._swapTo === undefined && el.textContent === text)) return;
    el._swapTo = text;
    if (reduced || !el.getClientRects().length) { el.textContent = text; return; }
    el.getAnimations().forEach(a => a.cancel());
    const out = el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-5px)' }],
      { duration: 130, easing: 'ease-in', fill: 'forwards' });
    // The timer is a fallback for tabs where animations are throttled and never finish.
    let done = false;
    const swap = () => {
      if (done) return; done = true;
      if (el._swapTo !== text) return;
      el.textContent = text; out.cancel();
      el.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: EASE });
    };
    out.onfinish = swap; setTimeout(swap, 200);
  };

  // Image cross-fade: blur out, swap the source, reveal once the new image has decoded.
  const swapImage = (img, attrs) => {
    if (!img) return;
    const apply = () => { for (const k in attrs) img.setAttribute(k, attrs[k]); };
    if (reduced || img.getAttribute('src') === attrs.src || !img.getClientRects().length) { apply(); return; }
    const token = img._swapToken = {};
    img.getAnimations().forEach(a => a.cancel());
    const out = img.animate([{ opacity: 1, filter: 'none' }, { opacity: 0, filter: 'blur(6px)' }], { duration: 170, fill: 'forwards' });
    let done = false;
    const swap = () => {
      if (done) return; done = true;
      if (img._swapToken !== token) return;
      apply();
      let shown = false;
      const show = () => {
        if (shown || img._swapToken !== token) return; shown = true;
        out.cancel();
        img.animate([{ opacity: 0, filter: 'blur(6px)', transform: 'scale(.99)' }, { opacity: 1, filter: 'none', transform: 'none' }],
          { duration: 420, easing: EASE });
      };
      (img.decode ? img.decode() : Promise.resolve()).then(show, show);
      setTimeout(show, 1200);
    };
    out.onfinish = swap; setTimeout(swap, 240);
  };

  // Content swap: fade the old block out, render, ease the height, stagger the new items in.
  const swapContent = (container, render, opts = {}) => {
    const items = () => container.querySelectorAll(opts.items || ':scope > *');
    if (reduced || !container.children.length || !container.getClientRects().length) { render(); staggerIn(items()); return; }
    container.getAnimations().forEach(a => a.cancel());
    const token = container._swapToken = {}, h1 = container.offsetHeight;
    const out = container.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px)' }],
      { duration: 150, easing: 'ease-in', fill: 'forwards' });
    let done = false;
    const swap = () => {
      if (done) return; done = true;
      if (container._swapToken !== token) return;
      render(); out.cancel();
      const h2 = container.offsetHeight;
      if (Math.abs(h2 - h1) > 2) {
        container.style.overflow = 'hidden';
        container.animate([{ height: h1 + 'px' }, { height: h2 + 'px' }], { duration: 360, easing: EASE })
          .onfinish = () => { container.style.overflow = ''; };
      }
      staggerIn(items());
    };
    out.onfinish = swap; setTimeout(swap, 220);
  };

  /* ---------- Sliding indicator for segmented controls, chapter tabs, and the nav ---------- */
  const indicator = (container, opts = {}) => {
    if (!container || container._ind) return;
    const itemSel = opts.item || 'button';
    const isActive = opts.active || (b => b.getAttribute('aria-pressed') === 'true');
    const ind = document.createElement('span');
    ind.className = 'seg-ind' + (opts.variant ? ' ' + opts.variant : '');
    ind.setAttribute('aria-hidden', 'true');
    container.append(ind); container.classList.add('has-ind'); container._ind = ind;
    let placed = false;
    const place = () => {
      const target = [...container.querySelectorAll(itemSel)].find(isActive);
      if (!target || !target.offsetParent || !target.offsetWidth) { ind.style.opacity = '0'; return; }
      if (!placed || reduced) ind.style.transition = 'none';
      ind.style.opacity = '1';
      ind.style.width = target.offsetWidth + 'px';
      ind.style.height = target.offsetHeight + 'px';
      ind.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
      if (!placed) { void ind.offsetWidth; ind.style.transition = ''; placed = true; }
    };
    new MutationObserver(place).observe(container, { subtree: true, attributes: true, attributeFilter: [opts.attr || 'aria-pressed', 'class'] });
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => requestAnimationFrame(place));
      ro.observe(container); container.querySelectorAll(itemSel).forEach(item => ro.observe(item));
    }
    place();
  };

  /* ---------- Sortable tables ---------- */
  const NUMERIC = /^[−\-+]?\d[\d,]*(\.\d+)?\s*(%|ms|s|×|GB|Hz|h)?$/;
  const sortable = table => {
    const head = table.tHead?.rows[0], body = table.tBodies[0];
    if (!head || !body || table._sortable || body.rows.length < 3) return;
    table._sortable = true; table.classList.add('sortable-table');
    const cellValue = (row, col) => {
      const text = (row.cells[col]?.textContent || '').trim();
      return col > 0 && NUMERIC.test(text) ? parseFloat(text.replace(/,/g, '').replace('−', '-')) : text;
    };
    [...head.cells].forEach((th, col) => {
      th.tabIndex = 0; th.setAttribute('aria-sort', 'none'); th.title = 'Sort by ' + th.textContent.trim();
      const sort = () => {
        const dir = th.getAttribute('aria-sort') === 'descending' ? 'ascending' : 'descending';
        [...head.cells].forEach(cell => cell.setAttribute('aria-sort', 'none'));
        th.setAttribute('aria-sort', dir);
        const rows = [...body.rows].sort((a, b) => {
          const x = cellValue(a, col), y = cellValue(b, col);
          const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
          return dir === 'ascending' ? c : -c;
        });
        flip(body, () => rows.forEach(row => body.append(row)), { duration: 460 });
        [...body.rows].forEach(row => { const cell = row.cells[col]; if (cell && !reduced) cell.animate([{ backgroundColor: 'rgba(59,91,219,.16)' }, { backgroundColor: 'transparent' }], { duration: 900, easing: 'ease-out' }); });
      };
      th.addEventListener('click', sort);
      th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sort(); } });
    });
  };

  /* ---------- Figure lightbox: zoom from the thumbnail ---------- */
  const IMAGE = /\.(png|jpe?g|webp|gif|svg)([?#].*)?$/i;
  const lightbox = () => {
    document.addEventListener('click', event => {
      const link = event.target.closest('.paper-figure > a');
      const thumb = link?.querySelector('img');
      if (!thumb || !IMAGE.test(link.getAttribute('href') || '') || event.metaKey || event.ctrlKey || event.shiftKey || event.button) return;
      event.preventDefault();
      const r = thumb.getBoundingClientRect(), ratio = r.width / r.height || 1.6;
      let w = innerWidth * 0.94, h = w / ratio;
      if (h > innerHeight * 0.88) { h = innerHeight * 0.88; w = h * ratio; }
      const left = (innerWidth - w) / 2, top = (innerHeight - h) / 2;
      const overlay = document.createElement('div');
      overlay.className = 'lightbox'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', thumb.alt || 'Figure'); overlay.tabIndex = -1;
      const big = new Image(); big.className = 'lightbox-img'; big.alt = thumb.alt; big.src = link.href;
      Object.assign(big.style, { width: w + 'px', height: h + 'px', left: left + 'px', top: top + 'px' });
      const close = document.createElement('button'); close.type = 'button'; close.className = 'lightbox-close'; close.setAttribute('aria-label', 'Close figure'); close.textContent = '×';
      const hint = document.createElement('span'); hint.className = 'lightbox-hint'; hint.textContent = 'Click anywhere or press Esc to close';
      overlay.append(big, close, hint); document.body.append(overlay);
      document.body.style.overflow = 'hidden';
      const from = rect => `translate(${rect.left - left}px, ${rect.top - top}px) scale(${rect.width / w})`;
      big.animate([{ transform: from(r) }, { transform: 'none' }], { duration: reduced ? 0 : 460, easing: EASE });
      requestAnimationFrame(() => overlay.classList.add('open'));
      overlay.focus();
      let closing = false;
      const shut = () => {
        if (closing) return; closing = true;
        document.removeEventListener('keydown', onKey);
        overlay.classList.remove('open');
        const anim = big.animate([{ transform: 'none' }, { transform: from(thumb.getBoundingClientRect()) }],
          { duration: reduced ? 0 : 360, easing: EASE, fill: 'forwards' });
        let done = false;
        const finish = () => { if (done) return; done = true; overlay.remove(); document.body.style.overflow = ''; link.focus({ preventScroll: true }); };
        anim.onfinish = finish;
        setTimeout(finish, 450); // cleanup does not depend on the animation completing
      };
      const onKey = e => { if (e.key === 'Escape') shut(); };
      overlay.addEventListener('click', shut);
      document.addEventListener('keydown', onKey);
    });
  };

  /* ---------- Page-wide initialisation, after every deferred script has rendered ---------- */
  const markReveal = (selector, cls) => document.querySelectorAll(selector).forEach(el => {
    if (el.classList.contains('reveal') || el.closest('details:not([open])')) return;
    el.classList.add(cls);
    if (cls === 'm-stagger') [...el.children].forEach((child, i) => child.style.setProperty('--i', i));
    whenVisible(el, () => {
      void el.offsetWidth;
      el.classList.add('m-in');
      const count = cls === 'm-stagger' ? el.children.length : 1;
      setTimeout(() => {
        el.classList.remove(cls, 'm-in');
        if (cls === 'm-stagger') [...el.children].forEach(child => child.style.removeProperty('--i'));
      }, 900 + count * 90);
    });
  });
  const autoCount = selector => document.querySelectorAll(selector).forEach(el => {
    if (el.children.length) return;
    const match = el.textContent.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s);
    if (!match) return;
    const [, pre, digits, post] = match;
    const decimals = (digits.split('.')[1] || '').length, comma = digits.includes(',');
    const value = parseFloat(digits.replace(/,/g, ''));
    el.classList.add('counting');
    number(el, value, { fresh: true, duration: 1300, format: v => pre + (comma ? Math.round(v).toLocaleString('en-US') : v.toFixed(decimals)) + post });
  });

  const init = () => {
    document.querySelectorAll('.segmented').forEach(seg => indicator(seg, { variant: seg.classList.contains('showcase-filters') ? 'chip' : '' }));
    indicator(document.querySelector('.nav nav'), { item: 'a', variant: 'nav', attr: 'class', active: a => a.classList.contains('current') });
    markReveal('.paper-figure, .video-figure, .story-feature, .engine-story, .abstract-box, .bibtex-box, .latency-panels, .rollout-counts, .research-chart, .pr-axis', 'm-reveal');
    markReveal('.stats, .pipeline, .data-metrics, .hierarchy-cards, .memory-notes, .result-callouts, .action-facts, .resource-grid, .streaming-comparison', 'm-stagger');
    autoCount('.data-metrics strong, .hierarchy-cards strong, .action-facts strong, .pipeline strong, .result-callouts strong');
    document.querySelectorAll('.agent-table, .detail-table table').forEach(sortable);
    document.querySelectorAll('.figure-details').forEach(d => d.addEventListener('toggle', () => {
      if (d.open) d.querySelectorAll('table tbody').forEach(tb => staggerIn(tb.rows, 18));
    }));
    lightbox();
  };
  // Deferred scripts run before DOMContentLoaded, so this waits until every component has rendered.
  if (document.readyState === 'complete') init(); else document.addEventListener('DOMContentLoaded', init);

  window.GamerMotion = { reduced, EASE, whenVisible, restart, enter, staggerIn, flip, keyed, bar, number, setNumber, swapText, swapImage, swapContent, indicator };
})();
