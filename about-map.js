/* =========================================================
   About — interactive node map (vanilla, no dependencies).

   HOW TO EDIT CONTENT
   • All content lives in the NODES constant below. Nothing about
     layout is hardcoded per node — positions are computed by
     layout() from each node's level + parent, so adding a 7th child
     to a branch needs no manual repositioning.
   • Add a node: push { id, label, level, parent, description, media }.
       level 0 = root · 1 = branch · 2 = child of a branch.
       parent = the id it hangs off (null for root).
   • Attach media to a node: fill its `media` array with
       { type:'image', src:'assets/x.jpg', caption:'…' }  or
       { type:'link',  href:'https://…',   caption:'…' }.
     Media shows as small floating bubbles near the node on the
     canvas AND in the detail panel. Empty src → placeholder block.

   TUNING CONSTANTS: see CONFIG just below (radii, spacing, node
   sizes, zoom limits, camera easing).
   ========================================================= */
(function () {
  // ---- Tunables ---------------------------------------------------------
  const CONFIG = {
    plane: 8000,            // size of the (large) transformed plane
    rBranch: 300,           // root → branch distance
    rChild: 230,            // branch → child distance
    rMedia: 128,            // node → its media bubbles distance
    branchStartDeg: -45,    // offset so 4 branches aren't a plain "+"
    childStepDeg: 30,       // angular spacing between siblings
    childArcMaxDeg: 156,    // cap so 6–7 children stay legible
    mediaStepDeg: 34,
    size: { 0: 152, 1: 116, 2: 92, media: 54 }, // node diameters (px)
    zoomMin: 0.4,
    zoomMax: 2.5,
    zoomStep: 1.25,
    fitPad: 140,            // px padding when fitting a group in frame
    camMs: 520,             // camera ease duration
    staggerMs: 36,          // per-sibling reveal stagger
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Content (edit me) ------------------------------------------------
  const img = (caption) => ({ type: "image", src: "", caption });
  const lnk = (caption, href = "#") => ({ type: "link", href, caption });
  const LOREM =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do " +
    "eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  const NODES = [
    { id: "root", label: "Bennie Nkwantabisa", level: 0, parent: null, description: LOREM, media: [] },

    // ---- Branch 1: Leadership + Community (6 children) ----
    { id: "lead", label: "Leadership + Community", level: 1, parent: "root", description: LOREM, media: [] },
    { id: "lead-1", label: "Lorem One", level: 2, parent: "lead", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "lead-2", label: "Lorem Two", level: 2, parent: "lead", description: LOREM, media: [img("Lorem"), img("Lorem"), lnk("Lorem link")] },
    { id: "lead-3", label: "Lorem Three", level: 2, parent: "lead", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "lead-4", label: "Lorem Four", level: 2, parent: "lead", description: LOREM, media: [img("Lorem"), lnk("Lorem link")] },
    { id: "lead-5", label: "Lorem Five", level: 2, parent: "lead", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "lead-6", label: "Lorem Six", level: 2, parent: "lead", description: LOREM, media: [img("Lorem"), img("Lorem"), img("Lorem")] },

    // ---- Branch 2: Design + Research (no children; media on the branch) ----
    { id: "design", label: "Design + Research", level: 1, parent: "root", description: LOREM,
      media: [img("Lorem"), img("Lorem"), img("Lorem"), img("Lorem")] },

    // ---- Branch 3: For Fun (6 children) ----
    { id: "fun", label: "For Fun", level: 1, parent: "root", description: LOREM, media: [] },
    { id: "fun-1", label: "Lorem One", level: 2, parent: "fun", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "fun-2", label: "Lorem Two", level: 2, parent: "fun", description: LOREM, media: [img("Lorem"), img("Lorem"), img("Lorem")] },
    { id: "fun-3", label: "Lorem Three", level: 2, parent: "fun", description: LOREM, media: [img("Lorem"), lnk("Lorem link")] },
    { id: "fun-4", label: "Lorem Four", level: 2, parent: "fun", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "fun-5", label: "Lorem Five", level: 2, parent: "fun", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "fun-6", label: "Lorem Six", level: 2, parent: "fun", description: LOREM, media: [img("Lorem"), img("Lorem")] },

    // ---- Branch 4: What Could Be Next (7 children) ----
    { id: "next", label: "What Could Be Next", level: 1, parent: "root", description: LOREM, media: [] },
    { id: "next-1", label: "Lorem One", level: 2, parent: "next", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "next-2", label: "Lorem Two", level: 2, parent: "next", description: LOREM, media: [img("Lorem"), lnk("Lorem link")] },
    { id: "next-3", label: "Lorem Three", level: 2, parent: "next", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "next-4", label: "Lorem Four", level: 2, parent: "next", description: LOREM, media: [img("Lorem"), img("Lorem"), img("Lorem")] },
    { id: "next-5", label: "Lorem Five", level: 2, parent: "next", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "next-6", label: "Lorem Six", level: 2, parent: "next", description: LOREM, media: [img("Lorem"), img("Lorem")] },
    { id: "next-7", label: "Lorem Seven", level: 2, parent: "next", description: LOREM, media: [img("Lorem"), img("Lorem")] },
  ];

  // ---- DOM refs ---------------------------------------------------------
  const canvas = document.getElementById("about-canvas");
  const world = document.getElementById("about-world");
  const edges = document.getElementById("about-edges");
  const crumb = document.getElementById("about-crumb");
  const panel = document.getElementById("about-panel");
  if (!canvas || !world || !edges) return;

  // ---- Indexes ----------------------------------------------------------
  const byId = {};
  NODES.forEach((n) => (byId[n.id] = n));
  const childrenOf = (id) => NODES.filter((n) => n.parent === id && n.level <= 2);
  const branches = childrenOf("root");
  const D2R = Math.PI / 180;
  const P = CONFIG.plane, HALF = P / 2;

  // ---- Deterministic layout --------------------------------------------
  function layout() {
    const root = byId.root;
    root.x = 0; root.y = 0; root.r = CONFIG.size[0] / 2; root._ang = -Math.PI / 2;

    branches.forEach((b, i) => {
      const a = (CONFIG.branchStartDeg + i * 90) * D2R;
      b.x = CONFIG.rBranch * Math.cos(a);
      b.y = CONFIG.rBranch * Math.sin(a);
      b.r = CONFIG.size[1] / 2;
      b._ang = a; // outward direction from root

      const kids = childrenOf(b.id);
      const m = kids.length;
      const arc = Math.min(CONFIG.childArcMaxDeg, (m - 1) * CONFIG.childStepDeg) * D2R;
      kids.forEach((c, j) => {
        const ca = a - arc / 2 + (m > 1 ? (j / (m - 1)) * arc : 0);
        c.x = b.x + CONFIG.rChild * Math.cos(ca);
        c.y = b.y + CONFIG.rChild * Math.sin(ca);
        c.r = CONFIG.size[2] / 2;
        c._ang = ca;
      });
    });

    // Media bubbles: derived from each node's media[], placed around it.
    NODES.forEach((n) => {
      n._media = (n.media || []).map((item, k, arr) => {
        const base = n._ang != null ? n._ang : -Math.PI / 2;
        const spread = (k - (arr.length - 1) / 2) * CONFIG.mediaStepDeg * D2R;
        const a = base + spread;
        return {
          owner: n.id,
          x: n.x + CONFIG.rMedia * Math.cos(a),
          y: n.y + CONFIG.rMedia * Math.sin(a),
          r: CONFIG.size.media / 2,
          item,
          phase: (k * 1.7 + n.id.length) % (Math.PI * 2),
        };
      });
    });
  }

  // ---- Build DOM --------------------------------------------------------
  const nodeEls = {}; // id -> element
  const mediaEls = []; // {el, m}
  function px(v) { return v + "px"; }

  function makeNode(n) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "amap-node amap-node--l" + n.level;
    el.dataset.id = n.id;
    el.style.left = px(HALF + n.x);
    el.style.top = px(HALF + n.y);
    el.style.width = px(CONFIG.size[n.level]);
    el.style.height = px(CONFIG.size[n.level]);
    el.setAttribute("aria-label", n.label);
    el.innerHTML = '<span class="amap-node__label">' + n.label + "</span>";
    world.appendChild(el);
    nodeEls[n.id] = el;
  }

  function makeMedia(m) {
    const el = document.createElement("div");
    el.className = "amap-media";
    el.style.left = px(HALF + m.x);
    el.style.top = px(HALF + m.y);
    el.style.width = px(CONFIG.size.media);
    el.style.height = px(CONFIG.size.media);
    if (m.item.type === "image" && m.item.src) {
      el.style.backgroundImage = 'url("' + m.item.src + '")';
      el.classList.add("amap-media--img");
    } else if (m.item.type === "link") {
      el.classList.add("amap-media--link");
      el.textContent = "↗";
    } else {
      el.classList.add("amap-media--ph");
    }
    world.appendChild(el);
    mediaEls.push({ el, m });
  }

  function buildDOM() {
    world.style.width = px(P);
    world.style.height = px(P);
    edges.setAttribute("viewBox", "0 0 " + P + " " + P);
    edges.style.width = px(P);
    edges.style.height = px(P);
    NODES.forEach(makeNode);
    NODES.forEach((n) => n._media.forEach(makeMedia));
  }

  function drawEdges() {
    while (edges.firstChild) edges.removeChild(edges.firstChild);
    const line = (a, b, cls) => {
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", HALF + a.x); l.setAttribute("y1", HALF + a.y);
      l.setAttribute("x2", HALF + b.x); l.setAttribute("y2", HALF + b.y);
      l.setAttribute("class", cls);
      edges.appendChild(l);
    };
    branches.forEach((b) => {
      const dim = state.level >= 1 && state.branch !== b.id;
      line(byId.root, b, "amap-edge" + (dim ? " is-dim" : ""));
      if (state.branch === b.id) {
        childrenOf(b.id).forEach((c) => line(b, c, "amap-edge amap-edge--child"));
      }
    });
  }

  // ---- Camera -----------------------------------------------------------
  let cam = { x: 0, y: 0, k: 1 };
  let camRAF = null;
  function applyCam() {
    world.style.transform =
      "translate(" + cam.x + "px," + cam.y + "px) scale(" + cam.k + ")";
  }
  function center() { const r = canvas.getBoundingClientRect(); return { w: r.width, h: r.height, rect: r }; }

  // Fit a set of nodes/points in frame. offsetX shifts the framed centre
  // (used to keep a focused node clear of the detail panel).
  function fitTarget(points, offsetX) {
    const pad = CONFIG.fitPad;
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    points.forEach((p) => {
      minx = Math.min(minx, p.x - p.r); maxx = Math.max(maxx, p.x + p.r);
      miny = Math.min(miny, p.y - p.r); maxy = Math.max(maxy, p.y + p.r);
    });
    const { w, h } = center();
    const bw = Math.max(1, maxx - minx), bh = Math.max(1, maxy - miny);
    let k = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
    k = Math.max(CONFIG.zoomMin, Math.min(CONFIG.zoomMax, k));
    const cxw = (minx + maxx) / 2, cyw = (miny + maxy) / 2;
    return { x: (offsetX || 0) - k * cxw, y: -k * cyw, k };
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCam(target, ms) {
    if (camRAF) cancelAnimationFrame(camRAF);
    if (reduce || ms === 0) { cam = target; applyCam(); return; }
    const from = { ...cam }, t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms), e = easeOutCubic(t);
      cam = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        k: from.k + (target.k - from.k) * e,
      };
      applyCam();
      if (t < 1) camRAF = requestAnimationFrame(step);
    };
    camRAF = requestAnimationFrame(step);
  }

  // ---- State + render ---------------------------------------------------
  const state = { level: 0, branch: null, child: null };

  function panelWidth() {
    return window.matchMedia("(max-width: 760px)").matches ? 0 : Math.min(410, center().w * 0.42);
  }

  function visibleNow() {
    // returns the points the camera should frame for the current state
    if (state.level === 0) return [byId.root, ...branches];
    if (state.level === 1) return [byId[state.branch], ...childrenOf(state.branch)];
    const c = byId[state.child];
    return [c, ...(c._media || [])];
  }

  function render(opts) {
    const animate = !(opts && opts.instant);
    // node visibility + dim
    NODES.forEach((n) => {
      const el = nodeEls[n.id];
      let show = false, dim = false;
      if (n.level === 0) { show = true; }
      else if (n.level === 1) {
        show = true;
        dim = state.level >= 1 && state.branch !== n.id;
      } else if (n.level === 2) {
        show = state.branch === n.parent;
        dim = state.level >= 2 && state.child !== n.id;
      }
      el.classList.toggle("is-visible", show);
      el.classList.toggle("is-dim", dim);
      el.classList.toggle("is-selected",
        (n.level === 1 && state.child == null && state.branch === n.id) ||
        (n.level === 2 && state.child === n.id));
      el.tabIndex = show && !dim ? 0 : -1;
    });
    // staggered reveal for the children that just appeared
    if (state.level >= 1) {
      childrenOf(state.branch).forEach((c, i) => {
        const el = nodeEls[c.id];
        el.style.transitionDelay = (reduce ? 0 : i * CONFIG.staggerMs) + "ms";
      });
    }
    // media visibility (only for the selected child, or the selected branch)
    mediaEls.forEach(({ el, m }) => {
      const show =
        (state.level === 2 && m.owner === state.child) ||
        (state.level >= 1 && m.owner === state.branch && childrenOf(state.branch).length === 0);
      el.classList.toggle("is-visible", show);
    });
    drawEdges();
    updateCrumb();

    const offset = state.level === 2 ? -panelWidth() / 2 : 0;
    animateCam(fitTarget(visibleNow(), offset), animate ? CONFIG.camMs : 0);
  }

  // ---- Breadcrumb -------------------------------------------------------
  function updateCrumb() {
    const parts = [{ label: "Bennie", to: { level: 0 } }];
    if (state.branch) parts.push({ label: byId[state.branch].label, to: { level: 1, branch: state.branch } });
    if (state.child) parts.push({ label: byId[state.child].label, to: null });
    crumb.innerHTML = "";
    parts.forEach((p, i) => {
      if (i) { const sep = document.createElement("span"); sep.className = "amap-crumb__sep"; sep.textContent = "/"; crumb.appendChild(sep); }
      if (p.to) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "amap-crumb__seg"; b.textContent = p.label;
        b.addEventListener("click", () => { goTo(p.to); });
        crumb.appendChild(b);
      } else {
        const s = document.createElement("span"); s.className = "amap-crumb__cur"; s.textContent = p.label; crumb.appendChild(s);
      }
    });
  }

  function goTo(to) {
    if (to.level === 0) { state.level = 0; state.branch = null; state.child = null; closePanel(); }
    else if (to.level === 1) { state.level = 1; state.branch = to.branch; state.child = null; closePanel(); }
    render();
  }

  // ---- Selection --------------------------------------------------------
  function selectBranch(id) {
    const kids = childrenOf(id);
    state.branch = id; state.child = null;
    if (kids.length === 0) { state.level = 2; state.child = id; openPanel(id); } // leaf branch → panel + media
    else { state.level = 1; closePanel(); }
    render();
    focusNode(id);
  }
  function selectChild(id) {
    state.level = 2; state.child = id; state.branch = byId[id].parent;
    openPanel(id);
    render();
    focusNode(id);
  }
  function stepUp() {
    if (state.level === 2) { state.level = state.branch && childrenOf(state.branch).length ? 1 : 0; state.child = null; closePanel(); if (state.level === 0) state.branch = null; }
    else if (state.level === 1) { state.level = 0; state.branch = null; }
    render();
  }

  // ---- Detail panel -----------------------------------------------------
  let lastFocused = null;
  function openPanel(id) {
    if (!panel) return;
    const n = byId[id];
    lastFocused = nodeEls[id];
    panel.querySelector(".amap-panel__title").textContent = n.label;
    panel.querySelector(".amap-panel__desc").textContent = n.description || "";
    const imgs = (n.media || []).filter((m) => m.type === "image");
    const links = (n.media || []).filter((m) => m.type === "link");
    const grid = panel.querySelector(".amap-panel__grid");
    const list = panel.querySelector(".amap-panel__links");
    grid.innerHTML = ""; list.innerHTML = "";
    grid.hidden = imgs.length === 0;
    list.hidden = links.length === 0;
    imgs.forEach((m) => {
      const fig = document.createElement("figure");
      fig.className = "amap-panel__fig";
      const box = document.createElement("div");
      box.className = "amap-panel__img";
      if (m.src) box.style.backgroundImage = 'url("' + m.src + '")';
      else box.textContent = "Image";
      fig.appendChild(box);
      if (m.caption) { const cap = document.createElement("figcaption"); cap.textContent = m.caption; fig.appendChild(cap); }
      grid.appendChild(fig);
    });
    links.forEach((m) => {
      const a = document.createElement("a");
      a.href = m.href || "#"; a.className = "amap-panel__link";
      a.textContent = m.caption || m.href; a.target = "_blank"; a.rel = "noopener";
      list.appendChild(a);
    });
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("is-open"));
    const close = panel.querySelector(".amap-panel__close");
    if (close) close.focus();
  }
  function closePanel() {
    if (!panel || panel.hidden) return;
    panel.classList.remove("is-open");
    setTimeout(() => { panel.hidden = true; }, 260);
    if (lastFocused) { lastFocused.focus(); lastFocused = null; }
  }
  if (panel) {
    panel.querySelector(".amap-panel__close").addEventListener("click", () => { stepUp(); });
    // simple focus trap on mobile bottom sheet
    panel.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !window.matchMedia("(max-width: 760px)").matches) return;
      const f = panel.querySelectorAll("a[href], button");
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function focusNode(id) { const el = nodeEls[id]; if (el && el.tabIndex === 0) { /* keep focus subtle */ } }

  // ---- Node clicks (delegated) -----------------------------------------
  world.addEventListener("click", (e) => {
    const el = e.target.closest(".amap-node");
    if (!el || dragMoved) return;
    const n = byId[el.dataset.id];
    if (!n) return;
    if (n.level === 1) selectBranch(n.id);
    else if (n.level === 2) selectChild(n.id);
  });

  // ---- Keyboard ---------------------------------------------------------
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (panel && !panel.hidden) { stepUp(); } else { stepUp(); } return; }
    const el = document.activeElement;
    if (!el || !el.classList || !el.classList.contains("amap-node")) return;
    const n = byId[el.dataset.id];
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const sibs = (n.level === 1 ? branches : childrenOf(n.parent)).filter((s) => nodeEls[s.id].tabIndex === 0);
      const idx = sibs.findIndex((s) => s.id === n.id);
      const next = sibs[(idx + (e.key === "ArrowRight" ? 1 : sibs.length - 1)) % sibs.length];
      if (next) nodeEls[next.id].focus();
    }
  });

  // ---- Pan --------------------------------------------------------------
  const pointers = new Map();
  let panStart = null, dragMoved = false, pinchStart = null;
  canvas.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".amap-node, .amap-zoom, .amap-crumb, .amap-panel")) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      panStart = { x: e.clientX - cam.x, y: e.clientY - cam.y };
      dragMoved = false;
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("is-grabbing");
    } else if (pointers.size === 2) {
      const p = [...pointers.values()];
      pinchStart = { dist: dist(p[0], p[1]), k: cam.k,
        mid: mid(p[0], p[1]) };
      panStart = null;
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinchStart) {
      const p = [...pointers.values()];
      const ratio = dist(p[0], p[1]) / pinchStart.dist;
      const m = mid(p[0], p[1]);
      zoomTo(pinchStart.k * ratio, m.x, m.y);
      return;
    }
    if (panStart) {
      const nx = e.clientX - panStart.x, ny = e.clientY - panStart.y;
      if (!dragMoved && Math.hypot(nx - cam.x, ny - cam.y) < 4) return; // 4px threshold
      dragMoved = true;
      cam.x = nx; cam.y = ny; applyCam();
    }
  });
  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = null;
    if (pointers.size === 0) { panStart = null; canvas.classList.remove("is-grabbing"); }
    // click on empty canvas (no drag) steps up
    if (!dragMoved && e.type === "pointerup" && !e.target.closest(".amap-node, .amap-zoom, .amap-crumb, .amap-panel")) {
      if (state.level > 0) stepUp();
    }
  };
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

  // ---- Zoom (buttons + ctrl/⌘ wheel + pinch). Plain wheel passes through.
  function zoomTo(k, clientX, clientY) {
    const { rect, w, h } = center();
    k = Math.max(CONFIG.zoomMin, Math.min(CONFIG.zoomMax, k));
    const ox = (clientX - rect.left) - w / 2;   // pointer offset from canvas centre
    const oy = (clientY - rect.top) - h / 2;
    const wx = (ox - cam.x) / cam.k, wy = (oy - cam.y) / cam.k;
    cam.k = k; cam.x = ox - wx * k; cam.y = oy - wy * k;
    applyCam();
  }
  canvas.addEventListener("wheel", (e) => {
    if (!e.ctrlKey) return;           // plain wheel / two-finger scroll → page
    e.preventDefault();
    zoomTo(cam.k * (e.deltaY < 0 ? 1.06 : 1 / 1.06), e.clientX, e.clientY);
  }, { passive: false });
  canvas.querySelectorAll(".amap-zoom__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { rect, w, h } = center();
      const cx = rect.left + w / 2, cy = rect.top + h / 2;
      const z = btn.dataset.zoom;
      if (z === "fit") { render(); return; }
      zoomTo(cam.k * (z === "in" ? CONFIG.zoomStep : 1 / CONFIG.zoomStep), cx, cy);
    });
  });

  // ---- Ambient drift for media bubbles ---------------------------------
  function drift(now) {
    const t = now / 1000;
    mediaEls.forEach(({ el, m }) => {
      if (!el.classList.contains("is-visible")) return;
      const dx = Math.sin(t * 0.9 + m.phase) * 4;
      const dy = Math.cos(t * 0.7 + m.phase) * 4;
      el.style.transform = "translate(-50%,-50%) translate(" + dx + "px," + dy + "px)";
    });
    requestAnimationFrame(drift);
  }

  // ---- Boot -------------------------------------------------------------
  layout();
  buildDOM();
  render({ instant: true });
  if (!reduce) requestAnimationFrame(drift);
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => render({ instant: true }), 150); });
})();
