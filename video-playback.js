/* Muted viewport playback for static players and dynamically switched galleries. */
(() => {
  'use strict';
  const states = new Map();
  let frame = 0;
  const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
  const observer = new IntersectionObserver(schedule, {threshold:[0,.05,.15,.25,.35,.5,.65,.8,1]});
  const pause = (video, state) => {
    if (!video.paused) { state.automaticPause = true; video.pause(); }
  };
  const visible = (video, state) => {
    if (!video.isConnected || document.hidden) return false;
    const fullscreen = document.fullscreenElement;
    if (fullscreen) return fullscreen === video || fullscreen.contains(video);
    if (document.pictureInPictureElement === video) return true;
    if (video.closest('[data-gallery-active="false"], [hidden]')) return false;
    const modal = document.querySelector('dialog[open]');
    if (modal && !modal.contains(video)) return false;
    const rect = state.target.getBoundingClientRect();
    if (!rect.width || !rect.height || !state.target.getClientRects().length) return false;
    let left = 0, right = innerWidth;
    const gallery = video.closest('.gallery-carousel');
    if (gallery) {
      const clip = gallery.getBoundingClientRect();
      left = Math.max(left, clip.left); right = Math.min(right, clip.right);
    }
    const width = Math.max(0, Math.min(rect.right,right)-Math.max(rect.left,left));
    const height = Math.max(0, Math.min(rect.bottom,innerHeight)-Math.max(rect.top,72));
    // Normalize against the viewport so tall desktop players still start naturally.
    return width >= Math.min(rect.width, right-left)*.8 &&
      height >= Math.min(rect.height, innerHeight-72)*.5;
  };
  const play = (video, state) => {
    if (video.dataset.src && !video.getAttribute('src')) video.src = video.dataset.src;
    state.attempted = true;
    video.play().catch(() => { /* Native controls remain usable if autoplay is blocked. */ });
  };
  function sync() {
    frame = 0;
    for (const [video,state] of states) {
      if (!video.isConnected) {
        pause(video,state); states.delete(video);
        if (![...states.values()].some(s=>s.target===state.target)) observer.unobserve(state.target);
        video.removeAttribute('src'); video.load();
        continue;
      }
      const active = visible(video,state);
      if (!active) {
        state.active = false; state.attempted = false; state.userPaused = false;
        pause(video,state);
      } else {
        if (!state.active && video.ended) video.currentTime = 0;
        state.active = true;
        if (!state.userPaused && !state.attempted && video.paused) play(video,state);
      }
    }
  }
  const register = video => {
    if (states.has(video) || video.classList.contains('hover-preview')) return;
    video.autoplay = false; video.preload = 'none';
    video.muted = video.defaultMuted = true; video.playsInline = true;
    const state = {target:video.closest('.bc-pair') || video, active:false, attempted:false, userPaused:false, automaticPause:false};
    states.set(video,state); observer.observe(state.target);
    video.addEventListener('pause',()=>{
      if (state.automaticPause) { state.automaticPause = false; return; }
      if (state.active && !video.ended) state.userPaused = true;
    });
    video.addEventListener('play',()=>{
      state.userPaused = false;
      // Cancel a pending play when a tab/slide was hidden while its media loaded.
      if (!visible(video,state)) pause(video,state);
    });
  };
  const refresh = () => { document.querySelectorAll('video').forEach(register); schedule(); };
  window.GamerPlayback = {
    refresh,
    isActive: video => !!states.get(video)?.active && !states.get(video)?.userPaused,
    restart: videos => {
      videos.forEach(video=>{
        register(video);
        const state = states.get(video);
        state.userPaused = false; state.active = visible(video,state);
        video.currentTime = 0;
        if (state.active) play(video,state);
      });
    }
  };
  new MutationObserver(records=>{
    if (records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1 && (n.matches?.('video,dialog') || n.querySelector?.('video'))))) refresh();
  }).observe(document.body,{childList:true,subtree:true});
  addEventListener('scroll',schedule,{capture:true,passive:true});
  addEventListener('resize',schedule,{passive:true});
  document.addEventListener('gallerychange',schedule);
  document.addEventListener('visibilitychange',()=>{sync();});
  document.addEventListener('fullscreenchange',schedule);
  document.addEventListener('leavepictureinpicture',schedule,true);
  refresh();
})();
