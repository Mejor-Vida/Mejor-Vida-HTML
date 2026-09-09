/**
 * Teaching videos already have burned-in Spanish subtitles.
 * Keep the YouTube caption track for search, but do not display it on the embed.
 * While playing, pin a mini player to the lower-right after the original slot leaves view.
 */
(function () {
  var iframe = document.querySelector(".lic-lesson-video iframe");
  if (!iframe) return;
  if (!iframe.id) iframe.id = "mvi-lesson-yt";

  var section = iframe.closest(".lic-lesson-video");
  var slot = iframe.closest(".lic-lesson-video__slot") || iframe.parentElement;
  var playerRef = null;
  var started = false;
  var slotVisible = true;
  var dismissed = false;

  function hideCaptions(player) {
    if (!player) return;
    try {
      player.loadModule("captions");
    } catch (e) {}
    try {
      player.setOption("captions", "track", {});
    } catch (e2) {}
    try {
      player.unloadModule("captions");
    } catch (e3) {}
    try {
      player.unloadModule("cc");
    } catch (e4) {}
  }

  function playerState() {
    if (!playerRef || typeof playerRef.getPlayerState !== "function") return -1;
    try {
      return playerRef.getPlayerState();
    } catch (e) {
      return -1;
    }
  }

  function shouldPip() {
    if (!section || dismissed || !started || slotVisible) return false;
    var state = playerState();
    if (state === 0) return false;
    return state === 1 || state === 2 || state === 3;
  }

  function syncPip() {
    if (!section) return;
    section.classList.toggle("is-pip", shouldPip());
  }

  function closePip() {
    dismissed = true;
    try {
      if (playerRef && typeof playerRef.pauseVideo === "function") playerRef.pauseVideo();
    } catch (e) {}
    syncPip();
  }

  function ensureCloseButton() {
    var frame = iframe.closest(".lic-lesson-video__frame") || iframe.parentElement;
    if (!frame || frame.querySelector(".lic-lesson-video__close")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lic-lesson-video__close";
    var isEn = /^en\b/i.test(document.documentElement.lang || "");
    btn.setAttribute("aria-label", isEn ? "Close video" : "Cerrar video");
    btn.innerHTML = "<span aria-hidden=\"true\">&times;</span>";
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closePip();
    });
    frame.appendChild(btn);
  }

  function bindPip() {
    if (!slot || slot.getAttribute("data-mvi-pip") === "1") return;
    slot.setAttribute("data-mvi-pip", "1");
    ensureCloseButton();
    if (!("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(
      function (entries) {
        var entry = entries[0];
        if (!entry) return;
        slotVisible = entry.intersectionRatio >= 0.22;
        if (slotVisible) dismissed = false;
        syncPip();
      },
      { threshold: [0, 0.12, 0.22, 0.4, 0.75] }
    );
    observer.observe(slot);
    window.addEventListener("scroll", syncPip, { passive: true });
    window.addEventListener("resize", syncPip);
  }

  function attach() {
    if (!window.YT || !window.YT.Player || iframe.getAttribute("data-mvi-yt") === "1") return;
    iframe.setAttribute("data-mvi-yt", "1");
    var player = new window.YT.Player(iframe.id, {
      events: {
        onReady: function (e) {
          playerRef = e.target;
          hideCaptions(e.target);
          bindPip();
          var n = 0;
          var id = window.setInterval(function () {
            hideCaptions(e.target);
            n += 1;
            if (n > 20) window.clearInterval(id);
          }, 400);
        },
        onStateChange: function (e) {
          hideCaptions(e.target);
          playerRef = e.target;
          if (e.data === 1 || e.data === 3) started = true;
          if (e.data === 0) started = false;
          syncPip();
        },
      },
    });
    hideCaptions(player);
  }

  function withParams(src) {
    var origin = encodeURIComponent(window.location.origin);
    src = src.replace("www.youtube-nocookie.com", "www.youtube.com");
    if (src.indexOf("cc_load_policy=") === -1) src += (src.indexOf("?") >= 0 ? "&" : "?") + "cc_load_policy=0";
    if (src.indexOf("enablejsapi=") === -1) src += (src.indexOf("?") >= 0 ? "&" : "?") + "enablejsapi=1";
    if (src.indexOf("origin=") === -1) src += "&origin=" + origin;
    return src;
  }

  var nextSrc = withParams(iframe.getAttribute("src") || "");
  var prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (typeof prev === "function") prev();
    attach();
  };

  function loadApi() {
    if (window.YT && window.YT.Player) {
      attach();
      return;
    }
    if (document.querySelector("script[src*='iframe_api']")) return;
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  if (iframe.getAttribute("src") !== nextSrc) {
    iframe.addEventListener("load", function onLoad() {
      iframe.removeEventListener("load", onLoad);
      loadApi();
    });
    iframe.setAttribute("src", nextSrc);
  } else {
    loadApi();
  }
})();
