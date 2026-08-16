/* =========================================================
   About — interactive node map (FigJam-style).
   Center = Bennie. 3-4 category bubbles. Each opens a small
   fan of leaf bubbles; clicking a leaf opens a detail card.
   Desktop renders the canvas map; narrow screens fall back to
   a stacked accordion built from the same config.
   Placeholder copy is in [brackets] — swap it for real words.
   ========================================================= */
(function () {
  const map = document.getElementById("about-map");
  const stack = document.getElementById("about-stack");
  const card = document.getElementById("about-card");
  if (!map || !stack || !card) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Content ----------------------------------------------------------
  const DATA = {
    center: { title: "Bennie", sub: "UX Researcher" },
    categories: [
      {
        id: "work",
        title: "How I Work",
        leaves: [
          { title: "Mixed Methods", body: "[How you blend qualitative depth with quantitative signal — a sentence or two.]" },
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
          { title: "Focus Areas", body: "[UX research, interaction design, AI-assisted methods, etc.]" },
          { title: "Currently @ Carnelian", body: "[What you're doing there right now.]" },
        ],
      },
      {
        id: "drives",
        title: "What Drives Me",
        leaves: [
          { title: "Unspoken Needs", body: "[The throughline — grounding systems in what people can't quite articulate.]" },
          { title: "People + Systems", body: "[Why the seam between human behavior and systems is where you like to work.]" },
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
    if (leaf.href) {
      cardLink.href = leaf.href;
      cardLink.hidden = false;
    } else {
      cardLink.hidden = true;
    }
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
    const frag = document.createDocumentFragment();
    const lead = document.createElement("p");
    lead.className = "about-stack__lead";
    lead.textContent = DATA.center.title + " — " + DATA.center.sub;
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
        const h = document.createElement("p");
        h.className = "about-stack__h";
        h.textContent = leaf.title;
        const b = document.createElement("p");
        b.className = "about-stack__b";
        b.textContent = leaf.body;
        item.appendChild(h);
        item.appendChild(b);
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

  // ---- Canvas map (desktop) --------------------------------------------
  const NS = "http://www.w3.org/2000/svg";
  let svg, nodes = {}; // id -> element
  let openCat = null;

  function el(cls, html) {
    const d = document.createElement("div");
    d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }

  function buildMap() {
    map.innerHTML = "";
    svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "about-map__wires");
    map.appendChild(svg);
    nodes = {};

    // Center
    const center = el("map-node map-node--center",
      '<span class="map-node__inner"><span class="map-node__title">' +
      DATA.center.title + '</span><span class="map-node__sub">' +
      DATA.center.sub + "</span></span>");
    map.appendChild(center);
    nodes.center = center;

    DATA.categories.forEach((cat) => {
      const c = el("map-node map-node--cat",
        '<button type="button" class="map-node__inner"><span class="map-node__title">' +
        cat.title + '</span><span class="map-node__hint">+</span></button>');
      c.dataset.cat = cat.id;
      c.querySelector("button").addEventListener("click", () => toggleCat(cat.id));
      map.appendChild(c);
      nodes[cat.id] = c;

      cat.leaves.forEach((leaf, li) => {
        const l = el("map-node map-node--leaf",
          '<button type="button" class="map-node__inner"><span class="map-node__title">' +
          leaf.title + "</span></button>");
        l.dataset.cat = cat.id;
        l.dataset.leaf = li;
        l.querySelector("button").addEventListener("click", () => openCard(leaf));
        map.appendChild(l);
        nodes[cat.id + "-" + li] = l;
      });
    });

    layout();
  }

  function place(node, x, y) {
    node.style.left = x + "px";
    node.style.top = y + "px";
  }

  function wire(x1, y1, x2, y2, cls) {
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    if (cls) line.setAttribute("class", cls);
    svg.appendChild(line);
  }

  const positions = {}; // id -> {x,y}

  function layout() {
    const W = map.clientWidth, H = map.clientHeight;
    const cx = W / 2, cy = H / 2;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const R1 = Math.min(W, H) * 0.32;
    const R2 = Math.min(W, H) * 0.2;

    place(nodes.center, cx, cy);
    positions.center = { x: cx, y: cy };

    const n = DATA.categories.length;
    DATA.categories.forEach((cat, i) => {
      const a = (-45 + i * (360 / n)) * Math.PI / 180;
      const x = cx + R1 * Math.cos(a);
      const y = cy + R1 * Math.sin(a);
      place(nodes[cat.id], x, y);
      positions[cat.id] = { x, y, a };

      // leaves fan outward around the category's direction
      const m = cat.leaves.length;
      const spread = (Math.min(m, 4) - 1) * 32 * Math.PI / 180; // total fan
      cat.leaves.forEach((leaf, li) => {
        const la = a + (m > 1 ? (li / (m - 1) - 0.5) * spread : 0);
        const lx = x + R2 * Math.cos(la);
        const ly = y + R2 * Math.sin(la);
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
      wire(c.x, c.y, p.x, p.y, "wire" + (openCat === cat.id ? " wire--on" : ""));
      if (openCat === cat.id) {
        cat.leaves.forEach((leaf, li) => {
          const lp = positions[cat.id + "-" + li];
          wire(p.x, p.y, lp.x, lp.y, "wire wire--leaf wire--on");
        });
      }
    });
  }

  function toggleCat(id) {
    openCat = openCat === id ? null : id;
    map.classList.toggle("has-open", !!openCat);
    DATA.categories.forEach((cat) => {
      const on = cat.id === openCat;
      nodes[cat.id].classList.toggle("is-open", on);
      nodes[cat.id].classList.toggle("is-dim", !!openCat && !on);
      cat.leaves.forEach((leaf, li) => {
        nodes[cat.id + "-" + li].classList.toggle("is-shown", on);
      });
    });
    drawWires();
  }

  // ---- Boot -------------------------------------------------------------
  buildStack();

  const mq = window.matchMedia("(min-width: 761px)");
  let built = false;
  function sync() {
    if (mq.matches && !built) { buildMap(); built = true; }
    if (mq.matches && built) layout();
  }
  sync();
  mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);

  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => { if (mq.matches && built) layout(); }, 120);
  });

  if (reduce) map.classList.add("no-drift");
})();
