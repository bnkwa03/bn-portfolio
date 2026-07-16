/* Experimental project showcase: filter bar smoothly shows/hides cards.
   Self-contained — safe to delete along with the #showcase section. */
(function () {
  const bar = document.querySelector(".showcase-filter");
  if (!bar) return;

  const buttons = bar.querySelectorAll(".showcase-filter__btn");
  const cards = document.querySelectorAll(".showcase-card");
  const DURATION = 360; // keep in sync with the CSS transition

  const applyFilter = (filter) => {
    cards.forEach((card) => {
      const cats = (card.dataset.cat || "").split(/\s+/);
      const match = filter === "all" || cats.includes(filter);

      if (match) {
        card.hidden = false;
        // next frame so the browser registers display change before fading in
        requestAnimationFrame(() => card.classList.remove("is-hidden"));
      } else {
        card.classList.add("is-hidden");
        setTimeout(() => {
          if (card.classList.contains("is-hidden")) card.hidden = true;
        }, DURATION);
      }
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      applyFilter(btn.dataset.filter);
    });
  });
})();
