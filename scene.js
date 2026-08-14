/* =========================================================
   Scene picker — "set the scene with a song".
   Wired: "In the Rain" (Addison Rae) → rainy-day mode with an
   umbrella cursor, canvas rain that deflects around the umbrella,
   a windshield-wiper clear on project hover, a dark tint with a
   flashlight/spotlight that follows the umbrella, and the song looped
   via a hidden self-hosted <audio> element (ad-free). Persists onto the
   About page. Add assets/in-the-rain-cover.jpg for the record art and a
   licensed assets/in-the-rain.mp3 for the audio.
   ========================================================= */
(function () {
  const body = document.body;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let mouseX = window.innerWidth / 2;
  let mouseY = -100;
  let umbrella = null;
  let rain = null; // { destroy() }

  // ---- Umbrella cursor ---------------------------------------------------
  const UMBRELLA_SVG =
    '<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">' +
    '<g fill="none" stroke="#1d2733" stroke-width="2">' +
    '<path d="M40 40 V70" stroke-linecap="round"/>' +
    '<path d="M40 70 q0 6 7 6" stroke-linecap="round"/>' +
    '</g>' +
    '<path d="M8 40 Q40 8 72 40 Q60 30 52 40 Q46 32 40 40 Q34 32 28 40 Q20 30 8 40 Z" ' +
    'fill="#c0764d" stroke="#8a4f30" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<circle cx="40" cy="40" r="2" fill="#8a4f30"/></svg>';

  function makeUmbrella() {
    umbrella = document.createElement("div");
    umbrella.className = "umbrella";
    umbrella.innerHTML = UMBRELLA_SVG;
    body.appendChild(umbrella);
    umbrella.style.transform = "translate(" + mouseX + "px," + mouseY + "px)";
  }
  function killUmbrella() { if (umbrella) { umbrella.remove(); umbrella = null; } }
  function onMove(e) {
    mouseX = e.clientX; mouseY = e.clientY;
    if (umbrella) umbrella.style.transform = "translate(" + mouseX + "px," + mouseY + "px)";
    // Drive the flashlight/spotlight in body.scene-rain::before.
    body.style.setProperty("--mx", mouseX + "px");
    body.style.setProperty("--my", mouseY + "px");
  }

  // ---- Canvas rain (deflects around the umbrella canopy) -----------------
  function startRain() {
    const c = document.createElement("canvas");
    c.className = "rain-canvas";
    body.appendChild(c);
    const ctx = c.getContext("2d");
    let W, H;
    function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const R = 42;
    const drops = [];
    const N = Math.min(240, Math.floor(window.innerWidth / 7));
    function mk() {
      return { x: Math.random() * W, y: Math.random() * -H, l: 8 + Math.random() * 14,
               s: 7 + Math.random() * 6, o: 0.2 + Math.random() * 0.4 };
    }
    for (let i = 0; i < N; i++) drops.push(mk());
    const splash = [];
    let raf;

    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(184,204,228,0.55)";
      ctx.lineWidth = 1.1;
      for (const d of drops) {
        d.y += d.s;
        const dx = d.x - mouseX;
        if (mouseY > 0 && Math.abs(dx) < R) {
          const canopyY = mouseY - Math.sqrt(Math.max(0, R * R - dx * dx)) * 0.72 - 6;
          if (d.y > canopyY && d.y < canopyY + d.s + 8) {
            splash.push({ x: d.x, y: canopyY, vx: (dx / R) * 2.6, vy: -1 - Math.random() * 1.4, life: 1 });
            const n = mk(); d.x = n.x; d.y = -12; d.l = n.l; d.s = n.s; d.o = n.o;
            continue;
          }
        }
        ctx.globalAlpha = d.o;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.l);
        ctx.stroke();
        if (d.y > H) { const n = mk(); d.x = n.x; d.y = -12; d.l = n.l; d.s = n.s; d.o = n.o; }
      }
      ctx.fillStyle = "rgba(206,220,240,0.7)";
      for (let i = splash.length - 1; i >= 0; i--) {
        const p = splash[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life -= 0.05;
        if (p.life <= 0) { splash.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * 0.7;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    frame();
    rain = { destroy() { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); c.remove(); } };
  }

  // ---- Windshield-wiper overlays on project media ------------------------
  function addWet() {
    document.querySelectorAll(".project__media").forEach((m) => {
      if (m.querySelector(".project__wet")) return;
      const wet = document.createElement("span"); wet.className = "project__wet";
      const wiper = document.createElement("span"); wiper.className = "project__wiper";
      m.appendChild(wet); m.appendChild(wiper);
    });
  }
  function removeWet() {
    document.querySelectorAll(".project__wet, .project__wiper").forEach((n) => n.remove());
  }

  // ---- Audio via a self-hosted <audio> element (ad-free, loops) ----------
  // Drop a licensed copy of the track at the data-audio path (see the record
  // button on index.html). A hidden looping <audio> avoids YouTube's ads.
  let audioEl = null, audioTick = null;

  function ensureAudio(src) {
    if (!audioEl) {
      audioEl = document.createElement("audio");
      audioEl.id = "scene-audio";
      audioEl.className = "yt-scene-hidden";
      audioEl.loop = true;
      audioEl.preload = "auto";
      audioEl.volume = 0.7;
      body.appendChild(audioEl);
    }
    const abs = new URL(src, location.href).href;
    if (audioEl.src !== abs) audioEl.src = src;
    return audioEl;
  }
  function playAudio(src, at) {
    if (!src) return;
    ensureAudio(src);
    const start = () => {
      try { if (at && isFinite(at)) audioEl.currentTime = at; } catch (e) {}
      const p = audioEl.play();
      if (p && p.catch) p.catch(() => {}); // autoplay may be blocked until a gesture
    };
    if (audioEl.readyState >= 1) start();
    else audioEl.addEventListener("loadedmetadata", start, { once: true });
    startTick();
  }
  function startTick() {
    stopTick();
    audioTick = setInterval(() => {
      try { if (audioEl) sessionStorage.setItem("sceneTime", String(audioEl.currentTime)); } catch (e) {}
    }, 1000);
  }
  function stopTick() { if (audioTick) { clearInterval(audioTick); audioTick = null; } }
  function stopAudio() {
    stopTick();
    if (audioEl) { try { audioEl.pause(); } catch (e) {} }
  }

  // ---- Scene control -----------------------------------------------------
  function applyRain(opts) {
    clearScene();
    body.classList.add("scene-rain");
    window.addEventListener("mousemove", onMove, { passive: true });
    makeUmbrella();
    if (!reduce) { startRain(); addWet(); }
    if (opts && opts.audio) playAudio(opts.audio, opts.at);
    try {
      sessionStorage.setItem("scene", "rain");
      if (opts && opts.audio) sessionStorage.setItem("sceneAudio", opts.audio);
    } catch (e) {}
    markPlaying("rain");
  }
  function clearScene() {
    body.classList.remove("scene-rain");
    window.removeEventListener("mousemove", onMove);
    body.style.removeProperty("--mx");
    body.style.removeProperty("--my");
    killUmbrella();
    if (rain) { rain.destroy(); rain = null; }
    removeWet();
    stopAudio();
    try {
      sessionStorage.removeItem("scene");
      sessionStorage.removeItem("sceneAudio");
      sessionStorage.removeItem("sceneTime");
    } catch (e) {}
    markPlaying(null);
  }

  function markPlaying(scene) {
    document.querySelectorAll(".record").forEach((r) => {
      r.classList.toggle("is-playing", !!scene && r.getAttribute("data-scene") === scene);
    });
    const now = document.querySelector(".scene-now");
    if (now) {
      const active = scene ? document.querySelector('.record[data-scene="' + scene + '"]') : null;
      if (active && active.dataset.title) {
        now.innerHTML = "Now playing — <em>" + active.dataset.title + "</em>" +
          (active.dataset.artist ? " · " + active.dataset.artist : "");
        now.hidden = false;
      } else { now.hidden = true; }
    }
  }

  function wireShelf() {
    document.querySelectorAll(".record").forEach((r) => {
      const scene = r.getAttribute("data-scene");
      if (scene === "coming-soon") return;
      r.addEventListener("click", () => {
        if (scene === "rain") applyRain({ audio: r.dataset.audio });
        else clearScene();
      });
    });
  }

  function reapply() {
    let scene, audio, at;
    try {
      scene = sessionStorage.getItem("scene");
      audio = sessionStorage.getItem("sceneAudio");
      at = parseFloat(sessionStorage.getItem("sceneTime") || "0");
    } catch (e) {}
    if (scene === "rain") applyRain({ audio: audio, at: at });
  }

  document.addEventListener("DOMContentLoaded", () => { wireShelf(); reapply(); });
})();
