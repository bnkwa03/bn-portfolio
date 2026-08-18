/* About page — editorial image clusters + per-row arrow-key lightbox.
   Swap a `src` to a real path to replace a placeholder. One-line change. */
(function () {
  // ---- Cluster data. { src, alt, ratio, caption, span, href, text } ----
  const CLUSTERS = {
    leadership: [
      { src: "assets/leadership 1.png", alt: "Stanford's 2025 Convocation Speaker", ratio: 0.88, span: "xl", bold: true, caption: "Stanford's 2025 Convocation Speaker (click to watch!)", href: "https://www.youtube.com/watch?v=UES7sb5JZLo&t=4s" },
      { src: "assets/leadership 2.png", alt: "Frosh RA", ratio: 0.85, span: "md", caption: "Frosh RA" },
      { src: "assets/leadership 3.png", alt: "d.school Peer Advisor", ratio: 1.64, span: "sm", caption: "d.school Peer Advisor" },
      { src: "assets/leadership 4.png", alt: "Stanford DV8", ratio: 1.15, span: "md", caption: "Stanford DV8" },
      { moreHref: "https://www.linkedin.com/in/bennie-nkwantabisa" }
    ],
    // Captions shown in the hover bubble, in order starting with ski.png.
    fun: [
      { src: "assets/ski.png",        alt: "ski",        ratio: 0.75, span: "lg", caption: "skiinggg" },
      { src: "assets/vibes.jpg",      alt: "vibes",      ratio: 0.75, span: "md", caption: "RActivities" },
      { src: "assets/dv8.png",        alt: "dv8",        ratio: 1.07, span: "md", caption: "i <3 dv8" },
      { src: "assets/pieces.png",     alt: "pieces",     ratio: 0.73, span: "sm", caption: "mix n match!" },
      { src: "assets/crossword.png",  alt: "crossword",  ratio: 0.75, span: "md", caption: "crossword candid?" },
      { src: "assets/beach.jpg",      alt: "beach",      ratio: 0.75, span: "md", caption: "home :)" },
      { src: "assets/caves.jpg",      alt: "caves",      ratio: 0.75, span: "sm", caption: "jet setter" },
      { src: "assets/facetime.PNG",   alt: "facetime",   ratio: 0.46, span: "lg", caption: "call your friends!" },
      { src: "assets/meggy.JPG",      alt: "meggy",      ratio: 1.50, span: "md", caption: "hee hee hee" },
      { src: "assets/sweets.jpg",     alt: "sweets",     ratio: 1.00, span: "sm", caption: "sweet treats <3" },
      { src: "assets/rename.png",     alt: "rename",     ratio: 0.92, span: "sm", caption: "red couch!" },
      { src: "assets/picnic.png",     alt: "picnic",     ratio: 0.77, span: "sm", caption: "picniccc" },
      { src: "assets/wall.png",       alt: "wall",       ratio: 0.78, span: "lg", caption: "an ooold curation" },
      { src: "assets/fray.png",       alt: "fray",       ratio: 0.80, span: "md", caption: "THE FRAY!!" },
      { src: "assets/jump.png",       alt: "jump",       ratio: 0.96, span: "sm", caption: "yippeeee" },
      { src: "assets/wacky walk.png", alt: "wacky walk", ratio: 0.97, span: "md", caption: "wacky walk!" }
    ],
    next: []
  };

  // ---- "not yet started" gaggle: white-bg cutouts (multiply-blended) + captions. Not clickable. ----
  const GAGGLE = {
    next: [
      { src: "assets/screenplay.jpg",       caption: "write a screenplay" },
      { src: "assets/music video.jpg",       caption: "make music videos" },
      { src: "assets/fashion.jpg",           caption: "learn about + make fashion" },
      { src: "assets/music production.jpg",  caption: "produce music" },
      { src: "assets/guitar.jpg",            caption: "learn a bunch of instruments" },
      { src: "assets/language.jpg",          caption: "learn a bunch of languages" },
      { src: "assets/travel.jpg",            caption: "travel the world (beyond vacation)" },
      { src: "assets/running.jpg",           caption: "run a half marathon" },
      { src: "assets/podcast.jpg",           caption: "start a podcast" },
      { src: "assets/writing3.png",          caption: "write!!" }
    ]
  };

  function makeInner(item, i) {
    if (item.src) {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || "";
      img.loading = "lazy";
      img.width = Math.round((item.ratio || 1) * 400);
      img.height = 400;
      return img;
    }
    const ph = document.createElement("div");
    ph.className = "cl__ph cl__ph--" + "abc"[i % 3];
    ph.textContent = item.alt || "image";
    return ph;
  }

  function makeBox(item, i) {
    const box = document.createElement("button");
    box.type = "button";
    box.className = "cl__item cl__item--" + (item.span || "md");
    box.style.setProperty("--ratio", item.ratio || 1);
    box.setAttribute("aria-label", (item.alt || "image") + ", open larger");
    box.appendChild(makeInner(item, i));
    return box;
  }

  // ---- Marquee: a moving, edge-faded line. Clicking opens this row's gallery. ----
  const cursorEl = document.querySelector(".cursor");
  const cursorLabel = cursorEl && cursorEl.querySelector(".cursor__label");

  function renderMarquee(container, items, gallery) {
    const track = document.createElement("div");
    track.className = "ab__track";
    function buildSet(hidden) {
      items.forEach(function (item, idx) {
        const box = makeBox(item, idx);
        box.dataset.idx = idx;
        if (item.caption) box.dataset.caption = item.caption;
        if (hidden) { box.setAttribute("aria-hidden", "true"); box.tabIndex = -1; }
        track.appendChild(box);
      });
    }
    buildSet(false);
    buildSet(true); // duplicate for a seamless loop
    track.addEventListener("click", function (e) {
      const b = e.target.closest(".cl__item");
      if (b) openLightbox(gallery, +b.dataset.idx);
    });
    // Hover morphs the eye cursor into a dark bubble with a per-photo caption.
    if (cursorEl && cursorLabel) {
      track.addEventListener("mouseover", function (e) {
        const b = e.target.closest(".cl__item");
        if (!b || !b.dataset.caption) return;
        cursorLabel.textContent = b.dataset.caption;
        cursorEl.classList.add("is-treat");
      });
      track.addEventListener("mouseout", function (e) {
        const b = e.target.closest(".cl__item");
        if (b && !e.relatedTarget) { cursorEl.classList.remove("is-treat"); return; }
        if (b && !b.contains(e.relatedTarget) && !(e.relatedTarget && e.relatedTarget.closest(".cl__item"))) {
          cursorEl.classList.remove("is-treat");
        }
      });
    }
    container.appendChild(track);
  }

  function renderCluster(container) {
    const key = container.getAttribute("data-cluster");
    const below = container.dataset.captions === "below";
    const marquee = container.dataset.marquee === "true";
    const items = CLUSTERS[key] || [];
    const gallery = items.filter(function (it) { return it.src && !it.href; });

    if (marquee) { renderMarquee(container, items, gallery); return; }

    items.forEach(function (item) {
      if (item.text) {
        const note = document.createElement("span");
        note.className = "cl__note";
        note.textContent = item.text;
        container.appendChild(note);
        return;
      }
      if (item.moreHref) {
        const more = document.createElement("a");
        more.className = "cl__more";
        more.href = item.moreHref; more.target = "_blank"; more.rel = "noopener";
        more.textContent = "+ more…";
        container.appendChild(more);
        return;
      }
      const isLink = !!item.href;
      let box;
      if (isLink) {
        box = document.createElement("a");
        box.className = "cl__item cl__item--" + (item.span || "md");
        box.style.setProperty("--ratio", item.ratio || 1);
        box.href = item.href; box.target = "_blank"; box.rel = "noopener";
        box.setAttribute("aria-label", item.caption || item.alt || "image");
        box.appendChild(makeInner(item, 0));
      } else {
        box = makeBox(item, gallery.indexOf(item));
        const gi = gallery.indexOf(item);
        box.addEventListener("click", function () { openLightbox(gallery, gi); });
      }

      if (below) {
        const fig = document.createElement("figure");
        fig.className = "cl__fig";
        fig.appendChild(box);
        if (item.caption) {
          const cap = document.createElement("figcaption");
          cap.className = "cl__label" + (item.bold ? " cl__label--bold" : "");
          if (isLink) {
            const a = document.createElement("a");
            a.href = item.href; a.target = "_blank"; a.rel = "noopener";
            a.textContent = item.caption;
            cap.appendChild(a);
          } else {
            cap.textContent = item.caption;
          }
          fig.appendChild(cap);
        }
        container.appendChild(fig);
      } else {
        container.appendChild(box);
      }
    });
  }

  document.querySelectorAll(".ab__cluster").forEach(renderCluster);

  // ---- "not yet started" gaggle: display only, not clickable ----
  function renderGaggle(container) {
    const key = container.getAttribute("data-gaggle");
    (GAGGLE[key] || []).forEach(function (item, i) {
      const fig = document.createElement("figure");
      fig.className = "gag";
      if (item.src) {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.caption;
        img.loading = "lazy";
        img.width = 200; img.height = 200;
        img.addEventListener("error", function () {
          const ph = document.createElement("span");
          ph.className = "gag__ph cl__ph--" + "abc"[i % 3];
          ph.textContent = item.caption;
          img.replaceWith(ph);
        });
        fig.appendChild(img);
      } else {
        const ph = document.createElement("span");
        ph.className = "gag__ph cl__ph--" + "abc"[i % 3];
        ph.textContent = item.caption;
        fig.appendChild(ph);
      }
      const cap = document.createElement("figcaption");
      cap.className = "gag__cap";
      cap.textContent = item.caption;
      fig.appendChild(cap);
      // Clicking pops little hearts off the eye cursor (and suppresses the site glitter).
      fig.addEventListener("click", function (e) {
        e.stopPropagation();
        burstHearts(e.clientX, e.clientY);
      });
      container.appendChild(fig);
    });
  }
  document.querySelectorAll(".gaggle").forEach(renderGaggle);

  function burstHearts(x, y) {
    const n = 6 + Math.floor(Math.random() * 4);
    for (let k = 0; k < n; k++) {
      const h = document.createElement("span");
      h.className = "heart";
      h.textContent = "♥";
      h.style.left = x + "px";
      h.style.top = y + "px";
      h.style.setProperty("--dx", (Math.random() * 80 - 40).toFixed(0) + "px");
      h.style.setProperty("--dy", (-60 - Math.random() * 70).toFixed(0) + "px");
      h.style.setProperty("--rot", (Math.random() * 50 - 25).toFixed(0) + "deg");
      h.style.setProperty("--dur", (0.7 + Math.random() * 0.5).toFixed(2) + "s");
      h.style.fontSize = (0.7 + Math.random() * 0.7).toFixed(2) + "rem";
      document.body.appendChild(h);
      h.addEventListener("animationend", function () { h.remove(); });
    }
  }

  // ---- Lightbox, confined to one gallery (row) at a time ----
  let activeGallery = [];
  let current = 0;
  const box = document.createElement("div");
  box.className = "ablx";
  box.setAttribute("aria-hidden", "true");
  box.innerHTML =
    '<button class="ablx__close" type="button" aria-label="Close">&times;</button>' +
    '<button class="ablx__btn ablx__btn--prev" type="button" aria-label="Previous">&#8249;</button>' +
    '<button class="ablx__btn ablx__btn--next" type="button" aria-label="Next">&#8250;</button>' +
    '<figure class="ablx__stage"><div class="ablx__media"></div><figcaption class="ablx__cap"></figcaption></figure>';
  document.body.appendChild(box);

  const media = box.querySelector(".ablx__media");
  const cap = box.querySelector(".ablx__cap");
  const prevBtn = box.querySelector(".ablx__btn--prev");
  const nextBtn = box.querySelector(".ablx__btn--next");

  function show(i) {
    const item = activeGallery[i];
    if (!item) return;
    current = i;
    media.innerHTML = "";
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || "";
    media.appendChild(img);
    cap.textContent = item.caption || "";
    cap.style.display = item.caption ? "" : "none";
  }

  function openLightbox(gallery, i) {
    activeGallery = gallery;
    const solo = gallery.length < 2;
    prevBtn.style.display = solo ? "none" : "";
    nextBtn.style.display = solo ? "none" : "";
    show(i);
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    document.body.classList.add("ablx-open");
  }
  function close() {
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
    document.body.classList.remove("ablx-open");
  }
  function step(dir) {
    if (activeGallery.length < 2) return;
    show((current + dir + activeGallery.length) % activeGallery.length);
  }

  box.querySelector(".ablx__close").addEventListener("click", close);
  prevBtn.addEventListener("click", function () { step(-1); });
  nextBtn.addEventListener("click", function () { step(1); });
  box.addEventListener("click", function (e) {
    if (e.target === box || e.target === box.querySelector(".ablx__stage")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });

  // ---- Simple fade-in, respecting reduced motion ----
  const reveals = document.querySelectorAll(".reveal");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }
})();
