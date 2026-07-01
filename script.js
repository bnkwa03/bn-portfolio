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

  // Custom cursor: replaces the native pointer 1:1, swells into a
  // "Read more" pill over project work.
  const cursor = document.querySelector(".cursor");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (cursor && canHover) {
    window.addEventListener("mousemove", (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      cursor.classList.add("is-active");
    });

    document.querySelectorAll(".project").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hovering"));
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
