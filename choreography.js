/* Choreography grid: silent, looping video previews that open their
   YouTube link on click. The local-only clip has no click-through since
   it has no link yet. */
(function () {
  const tiles = document.querySelectorAll(".video-tile");
  if (!tiles.length) return;

  tiles.forEach((tile) => {
    const overlay = tile.querySelector(".video-tile__overlay");

    if (overlay && tile.dataset.link) {
      overlay.addEventListener("click", () => {
        window.open(tile.dataset.link, "_blank", "noopener");
      });
    }
  });
})();
