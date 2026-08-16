/* =========================================================
   About — interactive node map (FigJam-style, pan + zoom).
   Center = bennie nkwantabisa. Category circles expand a fan
   of leaf circles; clicking a leaf opens a detail card.
   The board can be dragged (pan) and zoomed (wheel / buttons).
   Narrow screens fall back to a stacked accordion.
   Placeholder copy is in [brackets] — swap for real words.
   ========================================================= */
(function () {
  const map = document.getElementById("about-map");
  const world = document.getElementById("about-world");
  const stack = document.getElementById("about-stack");
  const card = document.getElementById("about-card");
  if (!map || !world || !stack || !card) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Content ----------------------------------------------------------
  const DATA = {
    center: { title: "bennie nkwantabisa" },
    categories: [
      {
        id: "work",
        title: "How I Work",
        leaves: [
          { title: "Mixed Methods", body: "[How you blend qualitative depth with quantitative signal.]" },
          { title: "Rigor + Craft", body: "[Why you care about both airtight method and the feel of the final thing.]" },
          { title: "AI as a Tool", body: "[How you use AI to move faster without letting it make the calls.]" },
        ],
      },
      {
        id: "beyond",
        title: "Beyond the Work",
        leaves: [
          { title: "Choreography", body: "[A line about dance / the pieces you stage.]", href: "play.html" },
          { title: "Photography", body: "[A line about what you shoot and why.]", href: "play.html" },
          { title: "Graphic Design", body: "[A line about the design work you make for fun.]", href: "play.html" },
        ],
      },
      {
        id: "background",
        title: "Background",
        leaves: [
          { title: "Stanford", body: "[Degree, focus, year.]" },
          { title: "Focus Areas", body: "[UX research, interaction design, AI-assisted methods.]" },
          { title: "@ Carnelian", body: "[What you're doing there right now.]" },
        ],
      },
      {
        id: "drives",
        title: "What Drives Me",
        leaves: [
          { title: "Unspoken Needs", body: "[Grounding systems in what people can't quite articulate.]" },
          { title: "People + Systems", body: "[Why the seam between behavior and systems is where you like to work.]" },
        ],
      },
    ],
  };

  // ---- Detail card ------------------------------------------------------
  const cardTitle = card.querySelector(".about-card__title");
  const cardBody = card.querySelector(".about-card__body");
  const cardLink = card.querySelector(".about-card__link");
  const cardClose = card.querySelector(".about-card__close");

  function openCard(leaf) {
    cardTitle.textContent = leaf.title;
    cardBody.textContent = leaf.body;
    if (leaf.href) { cardLink.href = leaf.href; cardLink.hidden = false; }
    else { cardLink.hidden = true; }
    card.hidden = false;
    requestAnimationFrame(() => card.classList.add("is-open"));
  }
  function closeCard() {
    card.classList.remove("is-open");
    setTimeout(() => { card.hidden = true; }, 250);
  }
  cardClose.addEventListener("click", closeCard);
  card.addEventListener("click", (e) => { if (e.target === card) closeCard(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCard(); });

  // ---- Stacked fallback (mobile) ---------------------------------------
  function buildStack() {
    if (stack.childElementCount) return;
    const frag = document.createDocumentFragment();
    const lead = document.createElement("p");
    lead.className = "about-stack__lead";
    lead.textContent = DATA.center.title;
    frag.appendChild(lead);
    DATA.categories.forEach((cat) => {
      const det = document.createElement("details");
      det.className = "about-stack__group";
      const sum = document.createElement("summary");
      sum.textContent = cat.title;
      det.appendChild(sum);
      cat.leaves.forEach((leaf) => {
        const item = document.createElement("div");
        item.className = "about-stack__item";
        item.innerHTML =
          '<p class="about-stack__h"></p><p class="about-stack__b"></p>';
        item.querySelector(".about-stack__h").textContent = leaf.title;
        item.querySelector(".about-stack__b").textContent = leaf.body;
        if (leaf.href) {
          const a = document.createElement("a");
          a.className = "about-stack__link";
          a.href = leaf.href;
          a.textContent = "See more →";
          item.appendChild(a);
        }
        det.appendChild(item);
      });
      frag.appendChild(det);
    });
    stack.appendChild(frag);
  }

  // ---- Canvas map (world coordinates centred on 0,0) --------------------
  const NS = "http://www.w3.org/2000/svg";
  let svg, nodes = {}, positions = {}, openCat = null, built = false;

  function nodeEl(cls, inner) {
    const d = document.createElement("div");
    d.className = cls;
    d.innerHTML = inner;
    return d;
  }

  function buildMap() {
    world.innerHTML = "";
    svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "about-map__wires");
    svg.setAttribute("overflow", "visible");
    world.appendChild(svg);
    nodes = {};

    nodes.center = nodeEl("map-node map-node--center",
      '<span class="map-node__inner"><span class="map-node__title">' +
      DATA.center.title + "</span></span>");
    world.appendChild(nodes.center);

    DATA.categories.forEach((cat) => {
      const c = nodeEl("map-node map-node--cat",
        '<span class="map-node__inner"><span class="map-node__title">' +
        cat.title + '</span><span class="map-node__hint">+</span></span>');
      c.dataset.cat = cat.id;
      world.appendChild(c);
      nodes[cat.id] = c;
      cat.leaves.forEach((leaf, li) => {
        const l = nodeEl("map-node map-node--leaf",
          '<span class="map-node__inner"><span class="map-node__title">' +
          leaf.title + "</span></span>");
        l.dataset.cat = cat.id;
        l.dataset.leaf = li;
        world.appendChild(l);
        nodes[cat.id + "-" + li] = l;
      });
    });
    built = true;
    layout();
  }

  function place(node, x, y) { node.style.left = x + "px"; node.style.top = y + "px"; }

  function layout() {
    // Fixed world radii (px) — the whole thing pans/zooms, so no viewport math.
    const R1 = 250, R2 = 190;
    place(nodes.center, 0, 0);
    positions.center = { x: 0, y: 0 };

    const n = DATA.categories.length;
    DATA.categories.forEach((cat, i) => {
      const a = (-45 + i * (360 / n)) * Math.PI / 180;
      const x = R1 * Math.cos(a), y = R1 * Math.sin(a);
      place(nodes[cat.id], x, y);
      positions[cat.id] = { x, y };
      const m = cat.leaves.length;
      const spread = (Math.min(m, 4) - 1) * 34 * Math.PI / 180;
      cat.leaves.forEach((leaf, li) => {
        const la = a + (m > 1 ? (li / (m - 1) - 0.5) * spread : 0);
        const lx = x + R2 * Math.cos(la), ly = y + R2 * Math.sin(la);
        place(nodes[cat.id + "-" + li], lx, ly);
        positions[cat.id + "-" + li] = { x: lx, y: ly };
      });
    });
    drawWires();
  }

  function drawWires() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const c = positions.center;
    DATA.categories.forEach((cat) => {
      const p = positions[cat.id];
      line(c.x, c.y, p.x, p.y, "wire" + (openCat === cat.id ? " wire--on" : ""));
      if (openCat === cat.id) {
        cat.leaves.forEach((leaf, li) => {
          const lp = positions[cat.id + "-" + li];
          line(p.x, p.y, lp.x, lp.y, "wire wire--leaf wire--on");
        });
      }
    });
  }
  function line(x1, y1, x2, y2, cls) {
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", x1); l.setAttribute("y1", y1);
    l.setAttribute("x2", x2); l.setAttribute("y2", y2);
    l.setAttribute("class", cls);
    svg.appendChild(l);
  }

  function toggleCat(id) {
    openCat = openCat === id ? null : id;
    DATA.categories.forEach((cat) => {
      const on = cat.id === openCat;
      nodes[cat.id].classList.toggle("is-open", on);
      nodes[cat.id].classList.toggle("is-dim", !!openCat && !on);
      cat.leaves.forEach((leaf, li) =>
        nodes[cat.id + "-" + li].classList.toggle("is-shown", on));
    });
    drawWires();
  }

  // ---- Pan + zoom -------------------------------------------------------
  let tx = 0, ty = 0, scale = 1;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function apply() { world.style.transform =
    "translate(" + tx + "px," + ty + "px) scale(" + scale + ")"; }

  let panning = false, sx = 0, sy = 0, moved = false;
  map.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".map-node, .about-zoom")) return;
    panning = true; moved = false;
    sx = e.clientX - tx; sy = e.clientY - ty;
    map.setPointerCapture(e.pointerId);
    map.classList.add("is-grabbing");
  });
  map.addEventListener("pointermove", (e) => {
    if (!panning) return;
    tx = e.clientX - sx; ty = e.clientY - sy; moved = true; apply();
  });
  const endPan = () => { panning = false; map.classList.remove("is-grabbing"); };
  map.addEventListener("pointerup", endPan);
  map.addEventListener("pointercancel", endPan);

  // Click (delegated) — only when it wasn't a drag.
  map.addEventListener("click", (e) => {
    const node = e.target.closest(".map-node");
    if (!node || moved) return;
    if (node.classList.contains("map-node--cat")) {
      toggleCat(node.dataset.cat);
    } else if (node.classList.contains("map-node--leaf")) {
      const cat = DATA.categories.find((c) => c.id === node.dataset.cat);
      if (cat) openCard(cat.leaves[+node.dataset.leaf]);
    }
  });

  function zoomAt(clientX, clientY, factor) {
    const r = map.getBoundingClientRect();
    const rx = clientX - (r.left + r.width / 2);
    const ry = clientY - (r.top + r.height / 2);
    const wx = (rx - tx) / scale, wy = (ry - ty) / scale;
    scale = clamp(scale * factor, 0.45, 2.4);
    tx = rx - wx * scale; ty = ry - wy * scale; apply();
  }
  map.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  }, { passive: false });

  // Zoom buttons + reset
  map.querySelectorAll(".about-zoom__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = map.getBoundingClientRect();
      const act = btn.dataset.zoom;
      if (act === "reset") { tx = 0; ty = 0; scale = 1; apply(); return; }
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, act === "in" ? 1.2 : 1 / 1.2);
    });
  });

  if (reduce) map.classList.add("no-drift");

  // ---- Boot -------------------------------------------------------------
  buildStack();
  const mq = window.matchMedia("(min-width: 761px)");
  function sync() { if (mq.matches && !built) { buildMap(); apply(); } }
  sync();
  mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
})();
