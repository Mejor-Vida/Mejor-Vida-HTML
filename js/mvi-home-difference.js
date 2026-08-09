/**
 * Homepage “Why Families Choose Mejor Vida” card carousel
 * — prev/next + scroll-snap sync
 */
(function () {
  "use strict";

  function init(root) {
    var track = root.querySelector("[data-diff-track]");
    var prev = root.querySelector("[data-diff-prev]");
    var next = root.querySelector("[data-diff-next]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-diff-card]"));
    if (!track || !prev || !next || cards.length === 0) return;

    var index = 0;
    var scrollTimer = null;

    function nearestIndex() {
      var trackRect = track.getBoundingClientRect();
      var mid = trackRect.left + trackRect.width / 2;
      var best = 0;
      var bestDist = Infinity;
      cards.forEach(function (card, i) {
        var r = card.getBoundingClientRect();
        var center = r.left + r.width / 2;
        var d = Math.abs(center - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    }

    function updateButtons() {
      prev.disabled = index <= 0;
      next.disabled = index >= cards.length - 1;
      prev.setAttribute("aria-disabled", prev.disabled ? "true" : "false");
      next.setAttribute("aria-disabled", next.disabled ? "true" : "false");
    }

    function go(i) {
      index = Math.max(0, Math.min(cards.length - 1, i));
      var card = cards[index];
      var left =
        card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({
        left: Math.max(0, left),
        behavior: "smooth",
      });
      updateButtons();
    }

    prev.addEventListener("click", function () {
      go(index - 1);
    });
    next.addEventListener("click", function () {
      go(index + 1);
    });

    track.addEventListener(
      "scroll",
      function () {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
          index = nearestIndex();
          updateButtons();
        }, 80);
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      function () {
        index = nearestIndex();
        updateButtons();
      },
      { passive: true }
    );

    updateButtons();
  }

  function boot() {
    document.querySelectorAll("[data-mvi-home-diff]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
