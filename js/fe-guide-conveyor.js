(function () {
  var DURATION = 560;
  var EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
  var SLOTS = ["feature", "t1", "t2", "t3", "b1", "b2", "b3"];

  document.querySelectorAll("[data-fe-guide-conveyor]").forEach(initConveyor);

  function wrap(i, n) {
    return ((i % n) + n) % n;
  }

  function rectOf(el) {
    return el.getBoundingClientRect();
  }

  function initConveyor(root) {
    var pool = root.querySelector(".fe-guide-conveyor__pool");
    var nextBtn = root.querySelector("[data-fe-guide-next]");
    var prevBtn = root.querySelector("[data-fe-guide-prev]");
    var live = root.querySelector("[data-fe-guide-live]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-fe-guide-card]"));
    var slots = {};
    var missing = false;
    SLOTS.forEach(function (name) {
      slots[name] = root.querySelector('[data-slot="' + name + '"]');
      if (!slots[name]) missing = true;
    });
    if (!pool || !nextBtn || !prevBtn || cards.length < 7 || missing) return;

    var n = cards.length;
    var pos = 0;
    var busy = false;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function assignedFrom(p) {
      return {
        feature: cards[wrap(p, n)],
        t1: cards[wrap(p - 1, n)],
        t2: cards[wrap(p - 2, n)],
        t3: cards[wrap(p - 3, n)],
        b1: cards[wrap(p + 1, n)],
        b2: cards[wrap(p + 2, n)],
        b3: cards[wrap(p + 3, n)],
      };
    }

    function setVisible(card, visible) {
      if (visible) card.removeAttribute("inert");
      else card.setAttribute("inert", "");
      var img = card.querySelector("img");
      if (visible && img) img.loading = "eager";
    }

    function place(assigned) {
      var visible = {};
      SLOTS.forEach(function (name) {
        var card = assigned[name];
        slots[name].appendChild(card);
        setVisible(card, true);
        visible[card.getAttribute("data-index")] = true;
      });
      cards.forEach(function (card) {
        if (visible[card.getAttribute("data-index")]) return;
        pool.appendChild(card);
        setVisible(card, false);
      });
      root.classList.add("is-ready");
    }

    function announce(assigned) {
      if (!live) return;
      var heading = assigned.feature.querySelector("h3");
      var teaser = assigned.feature.querySelector(".fe-guide-media-card__teaser");
      var parts = [];
      if (heading) parts.push(heading.textContent.trim());
      if (teaser) parts.push(teaser.textContent.trim());
      live.textContent = parts.join(". ");
    }

    function flip(el, from, to) {
      if (!from || !to || !el) return Promise.resolve();
      var dx = from.left - to.left;
      var dy = from.top - to.top;
      var sx = from.width / Math.max(to.width, 1);
      var sy = from.height / Math.max(to.height, 1);
      if ((!dx && !dy && Math.abs(sx - 1) < 0.02 && Math.abs(sy - 1) < 0.02) || reduceMotion.matches || !el.animate) {
        return Promise.resolve();
      }
      el.style.transformOrigin = "top left";
      return el
        .animate(
          [
            { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + ", " + sy + ")" },
            { transform: "none" },
          ],
          { duration: DURATION, easing: EASING }
        )
        .finished.finally(function () {
          el.style.transformOrigin = "";
        });
    }

    function ghost(el, fromRect, dx, dy) {
      if (reduceMotion.matches || !fromRect) return Promise.resolve();
      var node = el.cloneNode(true);
      node.removeAttribute("href");
      node.setAttribute("aria-hidden", "true");
      node.setAttribute("tabindex", "-1");
      node.classList.add("fe-guide-media-card--ghost");
      node.style.position = "fixed";
      node.style.left = fromRect.left + "px";
      node.style.top = fromRect.top + "px";
      node.style.width = fromRect.width + "px";
      node.style.height = fromRect.height + "px";
      node.style.margin = "0";
      node.style.zIndex = "8";
      node.style.pointerEvents = "none";
      document.body.appendChild(node);
      if (!node.animate) {
        node.remove();
        return Promise.resolve();
      }
      return node
        .animate(
          [
            { transform: "none", opacity: 1 },
            { transform: "translate(" + dx + "px," + dy + "px)", opacity: 0 },
          ],
          { duration: DURATION, easing: EASING, fill: "forwards" }
        )
        .finished.then(function () {
          node.remove();
        })
        .catch(function () {
          node.remove();
        });
    }

    function setBusy(on) {
      busy = on;
      nextBtn.disabled = on;
      prevBtn.disabled = on;
      if (on) root.classList.add("is-animating");
      else root.classList.remove("is-animating");
    }

    function rotate(dir) {
      if (busy) return;
      setBusy(true);

      var before = assignedFrom(pos);
      var first = {};
      SLOTS.forEach(function (name) {
        first[name] = rectOf(before[name]);
      });

      pos = wrap(pos + dir, n);
      var after = assignedFrom(pos);
      place(after);

      var movers;
      if (dir > 0) {
        var enterNext = rectOf(after.b3);
        movers = [
          flip(after.feature, first.b1, rectOf(after.feature)),
          flip(after.t1, first.feature, rectOf(after.t1)),
          flip(after.t2, first.t1, rectOf(after.t2)),
          flip(after.t3, first.t2, rectOf(after.t3)),
          flip(after.b1, first.b2, rectOf(after.b1)),
          flip(after.b2, first.b3, rectOf(after.b2)),
          flip(
            after.b3,
            {
              left: enterNext.left + enterNext.width * 0.55,
              top: enterNext.top,
              width: enterNext.width,
              height: enterNext.height,
            },
            enterNext
          ),
          ghost(before.t3, first.t3, Math.round(first.t3.width * 0.7), 0),
        ];
      } else {
        var enterPrev = rectOf(after.t3);
        movers = [
          flip(after.feature, first.t1, rectOf(after.feature)),
          flip(after.t1, first.t2, rectOf(after.t1)),
          flip(after.t2, first.t3, rectOf(after.t2)),
          flip(after.b1, first.feature, rectOf(after.b1)),
          flip(after.b2, first.b1, rectOf(after.b2)),
          flip(after.b3, first.b2, rectOf(after.b3)),
          flip(
            after.t3,
            {
              left: enterPrev.left + enterPrev.width * 0.55,
              top: enterPrev.top,
              width: enterPrev.width,
              height: enterPrev.height,
            },
            enterPrev
          ),
          ghost(before.b3, first.b3, Math.round(first.b3.width * 0.7), 0),
        ];
      }

      Promise.all(movers).finally(function () {
        setBusy(false);
        announce(after);
      });
    }

    var initial = assignedFrom(pos);
    place(initial);
    prevBtn.addEventListener("click", function () {
      rotate(1);
    });
    nextBtn.addEventListener("click", function () {
      rotate(-1);
    });
  }
})();
