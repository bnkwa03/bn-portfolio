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
  }
})();
