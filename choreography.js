/* Choreography grid: silent, looping video previews.
   - Clicking a tile (its overlay) opens the full piece on YouTube.
   - The corner mute button toggles that clip's sound; unmuting one clip
     mutes any other that's playing, so audio never stacks. */
(function () {
  const tiles = document.querySelectorAll(".video-tile");
  if (!tiles.length) return;

  const controls = [];

  tiles.forEach((tile) => {
    const overlay = tile.querySelector(".video-tile__overlay");
    if (overlay && tile.dataset.link) {
      overlay.addEventListener("click", () => {
        window.open(tile.dataset.link, "_blank", "noopener");
      });
    }

    const video = tile.querySelector(".video-tile__video");
    const muteBtn = tile.querySelector(".video-tile__mute");
    if (!video || !muteBtn) return;

    const setState = (unmuted) => {
      video.muted = !unmuted;
      muteBtn.classList.toggle("is-unmuted", unmuted);
      muteBtn.setAttribute("aria-label", unmuted ? "Mute" : "Unmute");
    };

    controls.push({ video, setState });

    muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willUnmute = video.muted;
      if (willUnmute) {
        // exclusive: silence every other clip first
        controls.forEach((c) => {
          if (c.video !== video) c.setState(false);
        });
      }
      setState(willUnmute);
    });
  });
})();
