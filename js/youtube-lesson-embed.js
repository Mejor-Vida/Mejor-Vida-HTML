/**
 * Teaching videos already have burned-in Spanish subtitles.
 * Pin a mini player when the in-article slot leaves view; restore it when the slot returns.
 * Do not move the iframe in the DOM — YouTube pauses if the embed is reparented.
 */
(function () {
  var iframe = document.querySelector(".lic-lesson-video iframe");
  if (!iframe) return;
  if (!iframe.id) iframe.id = "mvi-lesson-yt";

  var section = iframe.closest(".lic-lesson-video");
  var slot = iframe.closest(".lic-lesson-video__slot") || iframe.parentElement;
  var frame = iframe.closest(".lic-lesson-video__frame") || iframe.parentElement;
  var playerRef = null;
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

  function shouldPip() {
    return !!(section && frame && !dismissed && !slotVisible);
  }

  function syncPip() {
    if (!section) return;
    var on = shouldPip();
    section.classList.toggle("is-pip", on);
    if (frame) frame.classList.toggle("is-pip-float", on);
    document.body.classList.toggle("lic-lesson-is-pip", on);
  }

  function closePip() {
    dismissed = true;
    try {
      if (playerRef && typeof playerRef.pauseVideo === "function") playerRef.pauseVideo();
    } catch (e) {}
    syncPip();
  }

  function ensureCloseButton() {
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
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          var entry = entries[0];
          if (!entry) return;
          slotVisible = entry.intersectionRatio >= 0.22;
          if (slotVisible) dismissed = false;
          syncPip();
        },
        { threshold: [0, 0.12, 0.22, 0.4, 0.75, 1] }
      );
      observer.observe(slot);
    } else {
      slotVisible = true;
    }
    window.addEventListener("scroll", syncPip, { passive: true });
    window.addEventListener("resize", syncPip);
    syncPip();
  }

  function attach() {
    if (!window.YT || !window.YT.Player || iframe.getAttribute("data-mvi-yt") === "1") return;
    iframe.setAttribute("data-mvi-yt", "1");
    var player = new window.YT.Player(iframe.id, {
      events: {
        onReady: function (e) {
          playerRef = e.target;
          hideCaptions(e.target);
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

  bindPip();

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
