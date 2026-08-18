/* About page — editorial image clusters + arrow-key lightbox.
   Swap a `src` to a real path to replace a placeholder. One-line change. */
(function () {
  // ---- Cluster data. { src, alt, ratio, caption, span } ----
  // src: "" renders a token-colored placeholder showing `alt`.
  // ratio: width / height. span: "sm" | "md" | "lg". caption: 6 words max, optional.
  const CLUSTERS = {
    leadership: [
      { src: "assets/leadership 1.png", alt: "2025 Convocation Speaker", ratio: 0.88, span: "lg", caption: "2025 Convocation Speaker (click to watch!)", href: "https://www.youtube.com/watch?v=UES7sb5JZLo&t=4s" },
      { src: "assets/leadership 2.png", alt: "Frosh RA", ratio: 0.85, span: "md", caption: "Frosh RA" },
      { src: "assets/leadership 3.png", alt: "d.school Peer Advisor", ratio: 1.64, span: "sm", caption: "d.school Peer Advisor" },
      { src: "assets/leadership 4.png", alt: "Stanford DV8", ratio: 1.15, span: "md", caption: "Stanford DV8" },
      { text: "Sleep & Dreams TA" },
      { text: "Frosh 101 Co-Lead Training TA" }
    ],
    fun: [
      { src: "", alt: "for fun 01", ratio: 0.8,  span: "lg", caption: "" },
      { src: "", alt: "for fun 02", ratio: 1.4,  span: "sm", caption: "PLACEHOLDER caption" },
      { src: "", alt: "for fun 03", ratio: 1.0,  span: "md", caption: "" },
      { src: "", alt: "for fun 04", ratio: 0.75, span: "md", caption: "PLACEHOLDER caption" },
      { src: "", alt: "for fun 05", ratio: 1.33, span: "sm", caption: "" },
      { src: "", alt: "for fun 06", ratio: 1.1,  span: "lg", caption: "" }
    ],
    next: []
  };

  // ---- "not yet started" gaggle: transparent cutouts with handwritten captions ----
  // Drop a matching PNG into assets/notyet/ to replace each placeholder. One-line change.
  const GAGGLE = {
    next: [
      { src: "assets/screenplay.jpg",        caption: "write a screenplay" },
      { src: "assets/music video.jpg",        caption: "make music videos" },
      { src: "assets/fashion.jpg",            caption: "learn about + make fashion" },
      { src: "assets/music production.jpg",   caption: "produce music" },
      { src: "assets/guitar.jpg",             caption: "learn a bunch of instruments" },
      { src: "assets/language.jpg",           caption: "learn a bunch of languages" },
      { src: "assets/travel.jpg",             caption: "travel the world (beyond vacation)" },
      { src: "assets/running.jpg",            caption: "run a half marathon" },
      { src: "assets/podcast.jpg",            caption: "start a podcast" },
      { src: "assets/write.jpg",              caption: "write!!" }
    ]
  };

  const all = []; // flat list, DOM order, for lightbox navigation

  function makeInner(item, globalIndex) {
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
    ph.className = "cl__ph cl__ph--" + "abc"[globalIndex % 3];
    ph.textContent = item.alt || "image";
    return ph;
  }

  function renderCluster(container) {
    const key = container.getAttribute("data-cluster");
    const below = container.dataset.captions === "below";
    const items = CLUSTERS[key] || [];
    items.forEach(function (item) {
      // Text-only role (no photo): render a small labeled card.
      if (item.text) {
        const note = document.createElement("span");
        note.className = "cl__note";
        note.textContent = item.text;
        container.appendChild(note);
        return;
      }
      const globalIndex = all.length;
      const isLink = !!item.href;
      const box = document.createElement(isLink ? "a" : "button");
      box.className = "cl__item cl__item--" + (item.span || "md");
      box.style.setProperty("--ratio", item.ratio || 1);
      box.appendChild(makeInner(item, globalIndex));
      if (isLink) {
        box.href = item.href;
        box.target = "_blank";
        box.rel = "noopener";
        box.setAttribute("aria-label", item.caption || item.alt || "image");
      } else {
        box.type = "button";
        box.setAttribute("aria-label", (item.caption || item.alt || "image") + ", open larger");
        box.dataset.index = globalIndex;
        box.addEventListener("click", function () { openLightbox(globalIndex); });
        all.push(item);
      }

      if (below) {
        const fig = document.createElement("figure");
        fig.className = "cl__fig";
        fig.appendChild(box);
        if (item.caption) {
          const cap = document.createElement("figcaption");
          cap.className = "cl__label";
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
        if (item.caption) {
          const cap = document.createElement("span");
          cap.className = "cl__cap";
          cap.textContent = item.caption;
          box.appendChild(cap);
        }
        container.appendChild(box);
      }
    });
  }

  document.querySelectorAll(".ab__cluster").forEach(renderCluster);

  function renderGaggle(container) {
    const key = container.getAttribute("data-gaggle");
    const items = GAGGLE[key] || [];
    items.forEach(function (item, i) {
      const globalIndex = all.length;
      const fig = document.createElement("button");
      fig.type = "button";
      fig.className = "gag";
      fig.setAttribute("aria-label", item.caption + ", open larger");
      fig.dataset.index = globalIndex;
      if (item.src) {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.caption;
        img.loading = "lazy";
        img.width = 200; img.height = 200;
        // Until the cutout exists, fall back to a captioned placeholder block.
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
      const cap = document.createElement("span");
      cap.className = "gag__cap";
      cap.textContent = item.caption;
      fig.appendChild(cap);
      fig.addEventListener("click", function () { openLightbox(globalIndex); });
      container.appendChild(fig);
      all.push({ src: item.src, alt: item.caption, caption: item.caption });
    });
  }
  document.querySelectorAll(".gaggle").forEach(renderGaggle);

  // ---- Lightbox ----
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

  function show(i) {
    const item = all[i];
    if (!item) return;
    current = i;
    media.innerHTML = "";
    if (item.src) {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || "";
      media.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "ablx__ph cl__ph--" + "abc"[i % 3];
      ph.textContent = item.alt || "image";
      media.appendChild(ph);
    }
    cap.textContent = item.caption || "";
    cap.style.display = item.caption ? "" : "none";
  }

  function openLightbox(i) {
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
    show((current + dir + all.length) % all.length);
  }

  box.querySelector(".ablx__close").addEventListener("click", close);
  box.querySelector(".ablx__btn--prev").addEventListener("click", function () { step(-1); });
  box.querySelector(".ablx__btn--next").addEventListener("click", function () { step(1); });
  box.addEventListener("click", function (e) {
    if (e.target === box || e.target === box.querySelector(".ablx__stage")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });

  // ---- Simple fade-in, respecting reduced motion (mirrors site .reveal) ----
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
