/* Choreography grid: muted YouTube loops that unmute on hover and open
   their YouTube link on click; the local clip behaves the same way but
   has no click-through since it has no link yet. */
(function () {
  const tiles = document.querySelectorAll(".video-tile[data-yt-id]");
  if (!tiles.length) return;

  const players = new Map();

  window.onYouTubeIframeAPIReady = function () {
    tiles.forEach((tile, index) => {
      const mount = document.createElement("div");
      mount.id = `yt-player-${index}`;
      tile.querySelector(".video-tile__player").appendChild(mount);

      const videoId = tile.dataset.ytId;
      const player = new YT.Player(mount.id, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: videoId,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            e.target.playVideo();
          },
        },
      });
      players.set(tile, player);
    });
  };

  tiles.forEach((tile) => {
    const overlay = tile.querySelector(".video-tile__overlay");

    tile.addEventListener("mouseenter", () => {
      const player = players.get(tile);
      if (player && player.unMute) player.unMute();
    });
    tile.addEventListener("mouseleave", () => {
      const player = players.get(tile);
      if (player && player.mute) player.mute();
    });
    overlay.addEventListener("click", () => {
      window.open(tile.dataset.link, "_blank", "noopener");
    });
  });

  const localVideo = document.querySelector(".video-tile--local .video-tile__video");
  if (localVideo) {
    const localTile = localVideo.closest(".video-tile");
    localTile.addEventListener("mouseenter", () => {
      localVideo.muted = false;
    });
    localTile.addEventListener("mouseleave", () => {
      localVideo.muted = true;
    });
  }
})();
