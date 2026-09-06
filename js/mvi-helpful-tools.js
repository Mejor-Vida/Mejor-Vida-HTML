(function () {
  var root = document.querySelector(".mvi-helpful-tools");
  if (!root) return;
  var scroller = root.querySelector(".mvi-helpful-tools__scroller");
  var prev = root.querySelector("[data-tools-prev]");
  var next = root.querySelector("[data-tools-next]");
  if (!scroller || !prev || !next) return;

  function step() {
    var card = scroller.querySelector(".mvi-helpful-tools__card");
    if (!card) return Math.round(scroller.clientWidth * 0.7);
    var styles = window.getComputedStyle(scroller);
    var gap = parseFloat(styles.columnGap || styles.gap) || 12;
    return Math.round(card.getBoundingClientRect().width + gap);
  }

  function updateButtons() {
    var max = scroller.scrollWidth - scroller.clientWidth - 2;
    prev.disabled = scroller.scrollLeft <= 2;
    next.disabled = scroller.scrollLeft >= max || max <= 0;
  }

  prev.addEventListener("click", function () {
    scroller.scrollBy({ left: -step(), behavior: "smooth" });
  });
  next.addEventListener("click", function () {
    scroller.scrollBy({ left: step(), behavior: "smooth" });
  });
  scroller.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
})();
