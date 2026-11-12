(() => {
  'use strict';
  const data = window.GAMER;
  if (!data) return;
  const M = window.GamerMotion;
  const dialog = document.getElementById('demo-dialog');
  const dialogMedia = document.getElementById('dialog-media');
  const status = document.getElementById('dialog-status');
  const playlistNavigation = document.getElementById('dialog-playlist');
  let opener, playlist = [], playlistIndex = 0;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const safeMedia = value => {
    if (!value) return '';
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) || (location.protocol === 'file:' && url.protocol === 'file:') ? value : '';
    } catch { return ''; }
  };
  // Use a BV number or the full https://www.bilibili.com/video/BV... URL.
  const bilibiliMedia = item => {
    const value = String(item.bilibili || '').trim();
    if (!value) return null;
    let bvid = '', part = Number(item.bilibiliPage || 1);
    if (/^BV[0-9A-Za-z]{10}$/.test(value)) bvid = value;
    else {
      try {
        const url = new URL(value);
        if (!['bilibili.com', 'www.bilibili.com', 'm.bilibili.com', 'player.bilibili.com'].includes(url.hostname)) return null;
        bvid = url.pathname.match(/(?:^|\/)(BV[0-9A-Za-z]{10})(?:\/|$)/)?.[1] || url.searchParams.get('bvid') || '';
        part = Number(url.searchParams.get('p') || part);
      } catch { return null; }
    }
    if (!/^BV[0-9A-Za-z]{10}$/.test(bvid)) return null;
    part = Number.isInteger(part) && part > 0 ? part : 1;
    const params = new URLSearchParams({bvid, p: String(part), autoplay: '1', danmaku: '0', poster: '1'});
    return {embed: 'https://player.bilibili.com/player.html?' + params, url: 'https://www.bilibili.com/video/' + bvid + '/?p=' + part};
  };
  const hasMedia = item => !!(safeMedia(item.src) || bilibiliMedia(item));
  const durationLabel = seconds => {
    const total = Math.round(seconds || 0);
    return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
  };
  const videoElement = (item, errorTarget, autoplay = false) => {
    const video = make('video');
    video.controls = true; video.playsInline = true;
    video.preload = 'none'; video.muted = true; video.defaultMuted = true;
    video.defaultPlaybackRate = video.playbackRate = item.playbackRate || 1;
    video.poster = safeMedia(item.poster); video.dataset.src = safeMedia(item.src);
    if (item.captions) {
      const track = make('track');
      track.kind = 'captions'; track.srclang = 'en'; track.label = 'English';
      track.src = safeMedia(item.captions); video.append(track);
    }
    video.addEventListener('error', () => {
      if (errorTarget) errorTarget.textContent = 'This recording could not be loaded. Please try again later.';
    });
    return video;
  };
  const bilibiliElement = (item, target) => {
    const media = bilibiliMedia(item);
    const frame = make('iframe', 'bilibili-player');
    frame.src = media.embed; frame.title = item.title + ' · Bilibili';
    frame.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    const link = make('a', 'external-video-link', 'Open on Bilibili ↗');
    link.href = media.url; link.target = '_blank'; link.rel = 'noopener';
    target.append(frame);
    return link;
  };
  const clearDialogMedia = () => {
    const video = dialogMedia.querySelector('video');
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    dialogMedia.replaceChildren(); // Removing an iframe also stops its playback.
  };
  const showDemo = item => {
    const title = document.getElementById('dialog-title');
    title.hidden = item.category === 'Main story';
    title.textContent = title.hidden ? '' : item.title;
    dialog.setAttribute('aria-labelledby', title.hidden ? 'dialog-category' : 'dialog-title');
    document.getElementById('dialog-category').textContent = item.category + ' / ' + item.game;
    const description = document.getElementById('dialog-description');
    description.textContent = item.description || '';
    description.hidden = !item.description;
    clearDialogMedia();
    status.replaceChildren();
    if (bilibiliMedia(item)) {
      const link = bilibiliElement(item, dialogMedia);
      status.append(make('span', '', 'Full walkthrough · '), link);
    } else if (safeMedia(item.src)) {
      status.textContent = item.duration ? durationLabel(item.duration) : '';
      dialogMedia.append(videoElement(item, status, true));
    } else {
      const img = make('img'); img.src = safeMedia(item.poster); img.alt = 'Recording cover: ' + item.title;
      dialogMedia.append(img);
      status.textContent = item.localSrc ? 'Full walkthrough available in the intranet preview.' : 'Recording forthcoming';
    }
    if (M && !M.reduced) { M.restart(dialogMedia, 'media-in'); M.restart(document.querySelector('.dialog-copy'), 'media-in'); }
    playlistNavigation.hidden = playlist.length < 2;
    document.getElementById('dialog-position').textContent = (playlistIndex + 1) + ' / ' + playlist.length;
    document.getElementById('previous-demo').disabled = playlistIndex === 0;
    document.getElementById('next-demo').disabled = playlistIndex === playlist.length - 1;
  };
  const openDemo = (item, button, items) => {
    opener = button; playlist = items || [item];
    playlistIndex = Math.max(0, playlist.findIndex(x => x.id === item.id));
    showDemo(item); dialog.showModal(); document.body.style.overflow = 'hidden';
  };
  const moveDemo = offset => {
    const next = playlistIndex + offset;
    if (next < 0 || next >= playlist.length) return;
    playlistIndex = next; showDemo(playlist[playlistIndex]);
  };
  document.getElementById('previous-demo').addEventListener('click', () => moveDemo(-1));
  document.getElementById('next-demo').addEventListener('click', () => moveDemo(1));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Stage badges are intentionally not rendered on recording cards (checkpoint provenance stays internal).
  const stageBadge = () => null;
  // Hover preview: a muted, looping, preload="none" video that only loads on pointer hover.
  const attachHoverPreview = (poster, item) => {
    if (item.disableHoverPreview || reducedMotion || !safeMedia(item.src) || !window.matchMedia('(hover: hover)').matches) return;
    let video;
    poster.addEventListener('pointerenter', () => {
      if (!video) {
        video = make('video', 'hover-preview'); video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'none';
        video.defaultPlaybackRate = video.playbackRate = item.playbackRate || 1;
        video.src = safeMedia(item.src); video.setAttribute('aria-hidden', 'true'); poster.append(video);
      }
      video.currentTime = 0; video.play().catch(() => {});
    });
    poster.addEventListener('pointerleave', () => { if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); video = null; } });
  };
  const buildCard = (item, demos, featured = false) => {
    const card = make('article', 'video-card' + (item.number ? ' recording-card' : '') + (featured ? ' featured' : ''));
    if (['Main story', 'Minigames'].includes(item.category) && safeMedia(item.src)) {
      card.classList.add('inline-video-card');
      card.dataset.clipId = item.id;
      const video = videoElement(item, null);
      video.setAttribute('aria-label', item.title);
      video.loop = true; // grid clips keep playing while on screen
      const frame = make('div', 'media-frame'); frame.append(video);
      card.append(frame);
      // Optional story caption: a short scene name and one sentence on what the agent does.
      if (item.name || item.caption) {
        const caption = make('div', 'media-caption');
        if (item.name) caption.append(make('h4', 'media-caption-title', item.name));
        if (item.caption) caption.append(make('p', 'media-caption-text', item.caption));
        card.append(caption);
        if (item.name) video.setAttribute('aria-label', item.name);
      }
      return card;
    }
    const button = make('button'); button.type = 'button';
    button.setAttribute('aria-label', (hasMedia(item) ? 'Play ' : 'View details: ') + item.title);
    const poster = make('div', 'video-poster');
    const img = make('img'); img.src = safeMedia(item.poster); img.alt = ''; img.loading = 'lazy'; img.width = 800; img.height = 450;
    poster.append(img);
    if (!item.number && item.category !== 'Main story') poster.append(make('span', 'media-label', bilibiliMedia(item) ? 'BILIBILI WALKTHROUGH' : 'WALKTHROUGH'));
    if (hasMedia(item)) poster.append(make('span', 'play-icon', '▷'));
    else poster.append(make('span', 'preview-note', item.localSrc ? 'Intranet video' : 'Recording forthcoming'));
    if (item.duration) poster.append(make('span', 'clip-duration', durationLabel(item.duration)));
    attachHoverPreview(poster, item);
    const meta = make('div', 'video-meta');
    meta.append(make('h3', '', item.title));
    if (!item.number) meta.append(make('p', '', item.game));
    const tags = make('div', 'tag-row');
    tags.append(make('span', 'type-tag', item.label || item.skill));
    if (item.ability) tags.append(make('span', 'ability-tag', item.ability));
    meta.append(tags);
    if (featured && item.description) meta.append(make('p', 'featured-note', item.description));
    button.append(poster);
    if (!['Main story', 'Minigames'].includes(item.category)) button.append(meta);
    button.addEventListener('click', () => openDemo(item, button, demos));
    card.append(button); return card;
  };
  // A separate long-form player, followed by one horizontally sliding gallery per chapter.
  const storyChapters = data.mainStory?.chapters || [];
  const storyTabs = document.getElementById('main-story-tabs');
  const storyGrid = document.getElementById('main-story-grid');
  const storyLong = document.getElementById('main-story-long');
  const storyMounts = new Set(window.GAMER_LOCAL_MEDIA || []);
  const longItem = data.mainStory?.longVideo;
  if (storyLong && longItem) {
    const item = {...longItem};
    if (storyMounts.has(item.localSrc?.split('?')[0])) item.src = item.localSrc;
    if (safeMedia(item.src)) {
      const video = videoElement(item, document.getElementById('main-story-long-status'));
      video.id = 'main-story-long-video';
      video.preload = 'none';
      video.setAttribute('aria-label', 'Honkai: Star Rail main-story extended gameplay');
      storyLong.append(video);
    } else {
      const image = make('img'); image.src = safeMedia(item.poster); image.alt = 'Honkai: Star Rail main-story gameplay';
      storyLong.append(image);
      document.getElementById('main-story-long-status').textContent = 'Full video available in the intranet preview.';
    }
    document.getElementById('main-story-long-duration').textContent = durationLabel(item.duration);
  }
  // Tabs: an underline indicator slides under the active label.
  const buildTabs = (container, entries, onSelect) => {
    container.replaceChildren();
    const buttons = entries.map(entry => {
      const button = make('button', 'gallery-tab'); button.type = 'button';
      button.dataset.key = entry.id; button.setAttribute('aria-pressed', 'false');
      if (entry.controls) button.setAttribute('aria-controls', entry.controls);
      button.append(make('span', 'gallery-tab-label', entry.name));
      button.addEventListener('click', () => {
        onSelect(entry.id);
        button.scrollIntoView({behavior:reducedMotion ? 'auto' : 'smooth', block:'nearest', inline:'nearest'});
      });
      container.append(button); return button;
    });
    M?.indicator(container, {variant:'underline'});
    return id => buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.key === id)));
  };
  // Grid swap: release the old players' media, then render the new cards with a short fade.
  const swapGrid = (grid, render) => {
    const draw = () => {
      grid.querySelectorAll('video').forEach(video => {video.pause(); video.removeAttribute('src'); video.load();});
      render();
    };
    if (M && grid.children.length) M.swapContent(grid, draw, {items:'.video-card'}); else draw();
  };

  if (storyTabs && storyGrid && storyChapters.length) {
    let activeChapter = '';
    const chapterClips = chapter => chapter.clips.filter(hasMedia).map(item => ({
      ...item, title:chapter.title + ' · ' + item.title, category:'Main story', game:'Honkai: Star Rail',
      label:chapter.chapter, poster:item.poster || 'assets/paper/hsr.png', description:'', disableHoverPreview:true
    }));
    let markStory;
    const renderStory = id => {
      const chapter = storyChapters.find(c => c.id === id);
      if (!chapter || activeChapter === chapter.id) return;
      activeChapter = chapter.id; markStory(chapter.id);
      const clips = chapterClips(chapter);
      storyGrid.dataset.clips = String(clips.length);
      storyGrid.setAttribute('aria-label', chapter.title + ' gameplay videos');
      swapGrid(storyGrid, () => { storyGrid.replaceChildren(...clips.map(item => buildCard(item, clips))); });
    };
    markStory = buildTabs(storyTabs, storyChapters.map(chapter => ({
      id:chapter.id, name:chapter.title, controls:'main-story-grid'
    })), renderStory);
    renderStory(storyChapters[0].id);
  }

  const miniFilters = document.getElementById('minigame-filters');
  const recordings = data.recordings || data.demos.filter(x => x.category === 'Minigames');
  // Mechanics follow the configured gallery order.
  const typeOrder = [...new Set([...recordings].sort((a, b) => a.number - b.number).map(x => x.type))];
  const typeMeta = Object.fromEntries(data.demos.filter(x => x.category === 'Minigames').map(x => [x.id, x]));
  const filters = [];
  typeOrder.forEach(type => {
    const items = recordings.filter(x => x.type === type);
    if (items.length) filters.push({id:type, name:items[0].title, controls:'minigame-grid'});
  });
  // Recordings within a mechanic play in number order.
  const byNumber = items => [...items].sort((a, b) => a.number - b.number);
  const miniGrid = document.getElementById('minigame-grid');
  let activeMini = '', markMini;
  const renderMinis = type => {
    if (activeMini === type) return;
    activeMini = type; markMini(type);
    const items = byNumber(recordings.filter(x => x.type === type));
    const info = typeMeta[type] || {};
    swapGrid(miniGrid, () => {
      const head = make('div', 'mechanic-head');
      const titleBlock = make('div');
      const introduction = [info.label || items[0]?.skill, info.description].filter(Boolean).join(' · ');
      titleBlock.append(make('h3', '', items[0]?.title || ''), make('p', '', introduction));
      head.append(titleBlock);
      const grid = make('div', 'media-grid'); grid.dataset.clips = String(items.length);
      grid.setAttribute('aria-label', (items[0]?.title || '') + ' videos');
      const clips = items.map((item, index) => ({...item, title:item.title + ' ' + (index + 1), description:'', disableHoverPreview:true}));
      grid.append(...clips.map(item => buildCard(item, clips)));
      miniGrid.replaceChildren(head, grid);
    });
  };
  if (miniFilters && filters.length) {
    markMini = buildTabs(miniFilters, filters, renderMinis);
    renderMinis(filters[0].id);
  }
  document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }});
  dialog.addEventListener('close', () => { clearDialogMedia(); document.body.style.overflow = ''; opener?.focus(); });
  const mountInline = (target, item) => {
    if (bilibiliMedia(item)) {
      const cover = make('button', 'bilibili-cover'); cover.type = 'button';
      const img = make('img'); img.src = safeMedia(item.poster); img.alt = item.title;
      cover.append(img, make('span', 'bilibili-load', '▷  Watch on Bilibili'));
      cover.addEventListener('click', () => { target.replaceChildren(); const link = bilibiliElement(item, target); target.append(link); });
      target.replaceChildren(cover); return true;
    }
    if (safeMedia(item.src)) { target.replaceChildren(videoElement(item, null)); return true; }
    return false;
  };
  mountInline(document.getElementById('hero-media'), {...data.teaser, title:'Gamer project overview'});
  const bar = (width,className) => {const n=make('i',className);n.style.width=Math.max(0,Math.min(100,width))+'%';return n;};
  // Latency panels are built once per GPU; switching the backbone animates each row in place.
  const latencyTarget=document.getElementById('latency-chart');latencyTarget.replaceChildren();
  const latencyPanels=['A800','H200'].map(hardware=>{
    const panel=make('div','latency-panel'),subtitle=make('p','chart-subtitle'),rows=make('div','latency-rows');
    panel.append(make('h3','','NVIDIA '+hardware),subtitle,rows,make('p','chart-scale','0–300 ms · mean request latency'));
    latencyTarget.append(panel);return {hardware,subtitle,rows};
  });
  const renderLatency = model => {
    document.querySelectorAll('#latency-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===model)));
    const item=data.latency[model];
    latencyPanels.forEach(({hardware,subtitle,rows})=>{
      if(M)M.swapText(subtitle,item.name);else subtitle.textContent=item.name;
      const list=item[hardware],min=Math.min(...list.map(x=>x[1]));
      const create=([config])=>{const row=make('div','latency-row'),track=make('div','latency-track');track.append(make('i','latency-fill'));row.append(make('span','latency-config',config),make('b','latency-value'),track);return row;};
      const update=(row,[,latency],i,fresh)=>{
        row.classList.toggle('fastest',latency===min);
        if(M){M.bar(row.children[2].firstChild,latency/300*100,fresh);M.number(row.children[1],latency,{decimals:2,fresh});}
        else{row.children[2].firstChild.style.width=latency/300*100+'%';row.children[1].textContent=latency.toFixed(2);}
      };
      if(M)M.keyed(rows,list,x=>x[0],create,update);else{rows.replaceChildren();list.forEach((x,i)=>{const r=create(x);rows.append(r);update(r,x,i,true);});}
    });
  };
  document.querySelectorAll('#latency-tabs button').forEach(b=>b.addEventListener('click',()=>renderLatency(b.dataset.model)));
  renderLatency('dense');
  const benchmarkTabs=document.getElementById('benchmark-tabs');
  const realtimeChart=document.getElementById('realtime-chart');
  const renderBenchmark = benchmark => {
    for(const button of benchmarkTabs.children)button.setAttribute('aria-pressed',String(button.textContent===benchmark));
    const index=['MCU','ViZDoom','OmniGameArena','GameWorld','Average'].indexOf(benchmark);
    const heading=document.getElementById('benchmark-heading'),title=benchmark+' · real-time score';
    if(M)M.swapText(heading,title);else heading.textContent=title;
    const list=[...data.realtime].sort((a,b)=>b.rt[index]-a.rt[index]);
    const create=item=>{
      const row=make('div','comparison-row'+(item.ours?' ours':'')),track=make('div','comparison-track');
      track.append(make('i','ghost'),make('i','solid'));track.setAttribute('role','img');
      row.append(make('span','bar-rank'),make('span','bar-name',item.name),track,make('b','bar-value'));return row;
    };
    const update=(row,item,i,fresh)=>{
      const rt=item.rt[index],tp=rt-item.delta[index],[rank,,track,value]=row.children;
      rank.textContent=String(i+1);
      track.setAttribute('aria-label','Real-time '+rt.toFixed(1)+'%; time-paused '+tp.toFixed(1)+'%');
      if(M){M.bar(track.children[0],tp,fresh);M.bar(track.children[1],rt,fresh);M.number(value,rt,{decimals:1,fresh});}
      else{track.children[0].style.width=tp+'%';track.children[1].style.width=rt+'%';value.textContent=rt.toFixed(1);}
    };
    if(M)M.keyed(realtimeChart,list,x=>x.name,create,update);else{realtimeChart.replaceChildren();list.forEach((x,i)=>{const r=create(x);realtimeChart.append(r);update(r,x,i,true);});}
  };
  data.benchmarks.forEach(name=>{const b=make('button','',name);b.type='button';b.addEventListener('click',()=>renderBenchmark(name));benchmarkTabs.append(b);});
  renderBenchmark('Average');
  const table = (headers,rows) => {
    const t=make('table'),head=make('thead'),hr=make('tr'),body=make('tbody');
    headers.forEach(h=>hr.append(make('th','',h)));head.append(hr);
    rows.forEach(row=>{const tr=make('tr',row.highlight?'highlight':'');row.cells.forEach(c=>tr.append(make('td','',String(c))));body.append(tr);});
    t.append(head,body);return t;
  };
  document.getElementById('realtime-table').append(table(['Model','MCU','ViZDoom','OmniGameArena','GameWorld','Average'],data.realtime.map(x=>({highlight:x.ours,cells:[x.name,...x.rt.map(v=>v.toFixed(1))]}))));
  document.getElementById('rl-video').addEventListener('error',()=>{document.querySelector('.video-figure figcaption').textContent='This recording could not be loaded. Please try again later.';});
})();
