/* Choreography grid: muted video loops that unmute on hover and open
   their YouTube link on click; the local-only clip has no click-through
   since it has no link yet. */
(function () {
  const tiles = document.querySelectorAll(".video-tile");
  if (!tiles.length) return;

  tiles.forEach((tile) => {
    const video = tile.querySelector(".video-tile__video");
    const overlay = tile.querySelector(".video-tile__overlay");

    if (video) {
      tile.addEventListener("mouseenter", () => {
        video.muted = false;
      });
      tile.addEventListener("mouseleave", () => {
        video.muted = true;
      });
    }

    if (overlay && tile.dataset.link) {
      overlay.addEventListener("click", () => {
        window.open(tile.dataset.link, "_blank", "noopener");
      });
    }
  });
})();
