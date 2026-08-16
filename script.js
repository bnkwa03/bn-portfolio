/* Slow, breathy reveals on entry + as elements scroll into view. */
(function () {
  const reveals = document.querySelectorAll(".reveal");

  // Entrance: reveal hero shortly after load so it feels intentional, not instant.
  const showOnLoad = () => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".hero .reveal").forEach((el) =>
        el.classList.add("is-visible")
      );
    });
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  window.addEventListener("load", showOnLoad);

  // Floating nav: hide on scroll down, reveal on scroll up.
  const nav = document.querySelector(".nav");
  const sideNavs = document.querySelectorAll(".cs-sidenav");
  if (nav) {
    let lastY = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        const hide = y > lastY && y > 120;
        nav.classList.toggle("nav--hidden", hide);
        sideNavs.forEach((s) => s.classList.toggle("cs-sidenav--hidden", hide));
        lastY = y;
      },
      { passive: true }
    );
  }

  // Case-study floating nav: highlight the section currently in view.
  const tocLinks = document.querySelectorAll(".cs-toc__link");
  if (tocLinks.length) {
    const linkById = {};
    tocLinks.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      if (id) linkById[id] = a;
    });
    const sections = Object.keys(linkById)
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      let active = null;
      const setActive = (id) => {
        if (id === active) return;
        active = id;
        tocLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + id)
        );
      };
      const spy = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length) setActive(visible[0].target.id);
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
      );
      sections.forEach((s) => spy.observe(s));
    }
  }

  // Lightbox: click a case-study image to expand it over a dimmed
  // backdrop; close by clicking the backdrop, the ✕, or pressing Escape.
  const lightboxImgs = document.querySelectorAll(
    ".cs-figimg, .cs-feature__frame img, .cs-evidence__fig img"
  );
  if (lightboxImgs.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML =
      '<button class="lightbox__close" aria-label="Close">&times;</button>' +
      '<img class="lightbox__img" alt="" />';
    document.body.appendChild(box);

    const boxImg = box.querySelector(".lightbox__img");
    const closeBtn = box.querySelector(".lightbox__close");

    const open = (src, alt) => {
      boxImg.src = src;
      boxImg.alt = alt || "";
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    };
    const close = () => {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
    };

    lightboxImgs.forEach((img) => {
      img.classList.add("is-zoomable");
      img.addEventListener("click", () => open(img.currentSrc || img.src, img.alt));
    });

    box.addEventListener("click", (e) => {
      if (e.target !== boxImg) close();
    });
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && box.classList.contains("is-open")) close();
    });
  }

  // Play category bar: clicking a word selects it and swaps the panel
  // below; the selection persists until another word is clicked.
  const categoryItems = document.querySelectorAll(".category-bar__item");
  if (categoryItems.length) {
    const panels = document.querySelectorAll(".category-panel");
    const selectCategory = (name) => {
      categoryItems.forEach((btn) =>
        btn.classList.toggle("is-active", btn.dataset.category === name)
      );
      panels.forEach((panel) =>
        panel.classList.toggle("is-active", panel.dataset.panel === name)
      );
    };

    categoryItems.forEach((btn) => {
      btn.addEventListener("click", () => selectCategory(btn.dataset.category));
    });
  }

  // Custom cursor: replaces the native pointer 1:1, swells into a
  // "Read more" pill over project work.
  const cursor = document.querySelector(".cursor");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (cursor && canHover) {
    const eye = cursor.querySelector(".cursor__eye");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.addEventListener("mousemove", (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      cursor.classList.add("is-active");
    });

    // Blink — squash the eye shut briefly.
    const blink = () => {
      if (!eye || reduceMotion) return;
      eye.classList.remove("is-blinking");
      void eye.offsetWidth; // restart the animation
      eye.classList.add("is-blinking");
    };
    if (eye) {
      eye.addEventListener("animationend", () => eye.classList.remove("is-blinking"));
    }

    // Blink when you click anything.
    document.addEventListener("click", blink);

    // Blink on its own, at a gentle irregular rhythm.
    if (!reduceMotion) {
      const scheduleBlink = () => {
        const wait = 3500 + Math.random() * 3500;
        setTimeout(() => {
          if (document.hasFocus()) blink();
          scheduleBlink();
        }, wait);
      };
      scheduleBlink();
    }

    const cursorLabel = document.querySelector(".cursor__label");
    document.querySelectorAll(".project").forEach((el) => {
      el.addEventListener("mouseenter", (e) => {
        if (cursorLabel) cursorLabel.textContent = "Read more";
        // Unfold toward whichever side has room; glance that way.
        cursor.classList.toggle("look-left", e.clientX > window.innerWidth * 0.62);
        cursor.classList.add("is-hovering");
      });
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hovering"));
    });

    // Glitter: a little sparkle burst when clicking on empty, non-interactive space.
    const glitterColors = ["#C0764D", "#5C84A3", "#E7D8C4", "#9A9389"];
    const isInteractive = (el) =>
      !!el.closest("a, button, input, textarea, select, [role='button'], [onclick]");

    document.addEventListener("click", (e) => {
      if (isInteractive(e.target)) return;

      const count = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const bit = document.createElement("span");
        bit.className = "glitter";
        const angle = Math.random() * Math.PI * 2;
        const spread = 10 + Math.random() * 26;
        const x1 = Math.cos(angle) * spread;
        const y1 = 30 + Math.random() * 34;
        bit.style.setProperty("--x0", "0px");
        bit.style.setProperty("--y0", "0px");
        bit.style.setProperty("--x1", `${x1}px`);
        bit.style.setProperty("--y1", `${y1}px`);
        bit.style.setProperty("--spin", `${(Math.random() * 360 - 180).toFixed(0)}deg`);
        bit.style.setProperty("--fall-duration", `${(0.7 + Math.random() * 0.5).toFixed(2)}s`);
        bit.style.left = `${e.clientX}px`;
        bit.style.top = `${e.clientY}px`;
        bit.style.background = glitterColors[i % glitterColors.length];
        document.body.appendChild(bit);
        bit.addEventListener("animationend", () => bit.remove());
      }
    });
  }
})();
