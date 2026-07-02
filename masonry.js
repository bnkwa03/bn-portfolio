/* Real column-based masonry: splits a flat list of items into N column
   wrapper divs (round-robin, preserving source order) so every column
   starts flush at the same top edge and packs without dead space. */
(function () {
  function columnsFor(container) {
    const width = window.innerWidth;
    if (container.dataset.masonry === "video") {
      return width <= 560 ? 1 : 2;
    }
    if (width <= 560) return 1;
    if (width <= 900) return 2;
    return 3;
  }

  function layout(container, itemSelector, colClass) {
    const items = Array.from(container.querySelectorAll(itemSelector));
    if (!items.length) return;

    const cols = columnsFor(container);
    if (Number(container.dataset.cols) === cols) return;
    container.dataset.cols = cols;

    const colEls = [];
    for (let i = 0; i < cols; i++) {
      const col = document.createElement("div");
      col.className = colClass;
      colEls.push(col);
    }
    items.forEach((item, i) => colEls[i % cols].appendChild(item));

    container.innerHTML = "";
    colEls.forEach((col) => container.appendChild(col));
  }

  function layoutAll() {
    document.querySelectorAll(".gallery").forEach((g) => {
      layout(g, "img", "gallery__col");
    });
    document.querySelectorAll(".video-grid").forEach((v) => {
      layout(v, ".video-tile", "video-grid__col");
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutAll, 150);
  });

  layoutAll();
})();
