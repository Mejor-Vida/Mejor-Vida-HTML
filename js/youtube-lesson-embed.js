/**
 * Teaching-page YouTube player.
 * Videos with burned-in Spanish subtitles keep YouTube CC off.
 * Set data-youtube-captions="1" when the file has no burned-in subs.
 * Do not reparent the iframe — that pauses playback.
 */
(function () {
  var frame = document.querySelector(".lic-lesson-video__frame");
  if (!frame) return;

  var section = frame.closest(".lic-lesson-video");
  var slot = frame.closest(".lic-lesson-video__slot") || frame.parentElement;
  var iframe = null;
  var playerRef = null;
  var slotVisible = true;
  var dismissed = false;
  var hydrated = false;
  var isEn = /^en\b/i.test(document.documentElement.lang || "");

  function videoId() {
    return (frame.getAttribute("data-youtube-id") || "").trim();
  }

  function videoTitle() {
    return (
      frame.getAttribute("data-youtube-title") ||
      (isEn ? "Watch this lesson" : "Vea esta lección")
    );
  }

  function embedSrc(id) {
    var origin = encodeURIComponent(window.location.origin);
    var cc = frame.getAttribute("data-youtube-captions") === "1" ? "1" : "0";
    return (
      "https://www.youtube.com/embed/" +
      id +
      "?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&cc_load_policy=" +
      cc +
      "&enablejsapi=1&origin=" +
      origin
    );
  }

  function hideCaptions(player) {
    if (frame.getAttribute("data-youtube-captions") === "1") return;
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
    return !!(section && frame && iframe && !dismissed && !slotVisible);
  }

  function syncPip() {
    if (!section) return;
    var on = shouldPip();
    section.classList.toggle("is-pip", on);
    frame.classList.toggle("is-pip-float", on);
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
    if (frame.querySelector(".lic-lesson-video__close")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lic-lesson-video__close";
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
    if (!iframe || !window.YT || !window.YT.Player || iframe.getAttribute("data-mvi-yt") === "1") return;
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

  function loadApi() {
    if (window.YT && window.YT.Player) {
      attach();
      return;
    }
    if (document.querySelector("script[src*='iframe_api']")) return;
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === "function") prev();
      attach();
    };
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  function hydrate() {
    if (hydrated) return;
    var id = videoId();
    if (!id) return;
    hydrated = true;

    var facade = frame.querySelector(".lic-lesson-video__facade");
    iframe = document.createElement("iframe");
    iframe.id = "mvi-lesson-yt";
    iframe.title = videoTitle();
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.allowFullscreen = true;
    iframe.addEventListener("load", function onLoad() {
      iframe.removeEventListener("load", onLoad);
      loadApi();
    });
    iframe.src = embedSrc(id) + "&autoplay=1";
    frame.appendChild(iframe);
    if (facade) facade.remove();
    bindPip();
  }

  var facade = frame.querySelector(".lic-lesson-video__facade");
  if (facade) {
    facade.addEventListener("click", function (e) {
      e.preventDefault();
      hydrate();
    });
  }
})();
