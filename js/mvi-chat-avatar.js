/**
 * Mejor Vida — Level 1 chat avatar (FREE, image-swap + CSS motion).
 *
 * Hooks on #mvi-assistant-root: mvi-assistant-hook
 *   detail.hook: 'panel' | 'thinking' | 'replied'
 *
 * Optional root attributes:
 *   data-mvi-avatar-debug="1"        — on-screen state readout
 *   data-mvi-avatar-fallback="url"  — last-resort image if idle fails
 *   data-mvi-avatar-disabled="1"   — skip init
 */
(function () {
  "use strict";

  var LAYERS = ["idle", "happy", "thinking", "attention", "blink"];
  /** 1×1 transparent GIF — last resort when all image URLs fail */
  var TRANSPARENT_GIF =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  function assetUrl(root, name) {
    var attr = "data-mvi-avatar-" + name;
    if (root.getAttribute(attr)) return root.getAttribute(attr);
    var base = (root.getAttribute("data-mvi-avatar-base") || "img/mvi-chat-avatar").replace(/\/$/, "");
    return base + "/" + name + ".png";
  }

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function init(root) {
    if (!root || root.getAttribute("data-mvi-avatar-disabled") === "1") return;
    if (root.getAttribute("data-mvi-avatar-init") === "1") return;
    root.setAttribute("data-mvi-avatar-init", "1");

    var shell = root.querySelector("[data-mvi-avatar-shell]");
    var openBtn = root.querySelector("[data-mvi-avatar-open]");
    if (!shell || !openBtn) return;

    var debugEnabled = root.getAttribute("data-mvi-avatar-debug") === "1";
    var fallbackUrl = root.getAttribute("data-mvi-avatar-fallback") || "";
    var idleFallback = assetUrl(root, "idle");
    var reduceMotion = prefersReducedMotion();

    var fig = shell.querySelector(".mvi-chat-avatar");
    if (!fig) {
      fig = document.createElement("figure");
      fig.className = "mvi-chat-avatar mvi-chat-avatar--motion-idle";
      fig.setAttribute("data-mvi-chat-avatar", "");
      if (reduceMotion) fig.classList.add("mvi-chat-avatar--reduce-motion");
      LAYERS.forEach(function (name) {
        var img = document.createElement("img");
        img.className = "mvi-chat-avatar__layer";
        img.setAttribute("data-mvi-avatar-layer", name);
        img.alt = "";
        img.decoding = "async";
        img.loading = "eager";
        img.src = assetUrl(root, name);
        bindImageFallback(img, name, idleFallback, fallbackUrl);
        fig.appendChild(img);
      });
      shell.appendChild(fig);
    }

    var layers = {};
    LAYERS.forEach(function (name) {
      layers[name] = fig.querySelector('[data-mvi-avatar-layer="' + name + '"]');
    });

    var avatarState = {
      panelOpen: false,
      botPhase: "idle",
      happyUntil: 0,
      visibleLayer: "idle",
    };

    var blinkTimer = null;
    var blinkPhaseTimer = null;
    var attentionTimer = null;
    var attentionPhaseTimer = null;
    var happyTimer = null;
    var debugEl = null;

    function bindImageFallback(img, name, idleUrl, globalFallback) {
      var stage = 0;
      img.addEventListener(
        "error",
        function onErr() {
          if (name === "idle") {
            if (stage === 0 && globalFallback) {
              stage = 1;
              img.src = globalFallback;
              return;
            }
            img.removeEventListener("error", onErr);
            img.src = TRANSPARENT_GIF;
            return;
          }
          if (stage === 0) {
            stage = 1;
            img.src = idleUrl;
            return;
          }
          if (stage === 1 && globalFallback) {
            stage = 2;
            img.src = globalFallback;
            return;
          }
          img.removeEventListener("error", onErr);
          img.src = TRANSPARENT_GIF;
        },
      );
    }

    function clearBlinkTimers() {
      if (blinkTimer) window.clearTimeout(blinkTimer);
      blinkTimer = null;
      if (blinkPhaseTimer) window.clearTimeout(blinkPhaseTimer);
      blinkPhaseTimer = null;
    }

    function clearAttentionTimers() {
      if (attentionTimer) window.clearTimeout(attentionTimer);
      attentionTimer = null;
      if (attentionPhaseTimer) window.clearTimeout(attentionPhaseTimer);
      attentionPhaseTimer = null;
    }

    function clearHappyTimer() {
      if (happyTimer) window.clearTimeout(happyTimer);
      happyTimer = null;
    }

    function clearAllTimers() {
      clearBlinkTimers();
      clearAttentionTimers();
      clearHappyTimer();
    }

    function ensureDebugEl() {
      if (!debugEnabled || debugEl) return;
      debugEl = document.createElement("div");
      debugEl.className = "mvi-chat-avatar-debug";
      debugEl.setAttribute("aria-hidden", "true");
      root.appendChild(debugEl);
    }

    function updateDebug() {
      if (!debugEnabled) return;
      ensureDebugEl();
      if (!debugEl) return;
      debugEl.textContent =
        "avatar " +
        JSON.stringify({
          panelOpen: avatarState.panelOpen,
          botPhase: avatarState.botPhase,
          layer: avatarState.visibleLayer,
          happyMs: Math.max(0, avatarState.happyUntil - Date.now()) | 0,
          reduceMotion: prefersReducedMotion(),
        });
    }

    function applyReduceMotionClass() {
      var rm = prefersReducedMotion();
      fig.classList.toggle("mvi-chat-avatar--reduce-motion", rm);
      return rm;
    }

    function showLayer(name) {
      LAYERS.forEach(function (n) {
        var el = layers[n];
        if (!el) return;
        el.classList.toggle("is-visible", n === name);
      });
      avatarState.visibleLayer = name;
      updateDebug();
    }

    function refreshExpression() {
      var now = Date.now();
      fig.classList.remove("mvi-chat-avatar--thinking", "mvi-chat-avatar--happy");

      if (avatarState.botPhase === "thinking") {
        showLayer("thinking");
        fig.classList.add("mvi-chat-avatar--thinking");
        updateDebug();
        return;
      }
      if (now < avatarState.happyUntil) {
        showLayer("happy");
        fig.classList.add("mvi-chat-avatar--happy");
        updateDebug();
        return;
      }
      showLayer("idle");
      updateDebug();
    }

    function scheduleBlink() {
      clearBlinkTimers();
      if (reduceMotion || prefersReducedMotion()) return;
      if (avatarState.botPhase === "thinking") return;
      blinkTimer = window.setTimeout(function () {
        blinkTimer = null;
        if (avatarState.botPhase === "thinking") return;
        if (prefersReducedMotion()) return;
        showLayer("blink");
        blinkPhaseTimer = window.setTimeout(function () {
          blinkPhaseTimer = null;
          refreshExpression();
          scheduleBlink();
        }, 110 + Math.random() * 90);
      }, 3200 + Math.random() * 3800);
    }

    function scheduleAttention() {
      clearAttentionTimers();
      if (reduceMotion || prefersReducedMotion()) return;
      attentionTimer = window.setTimeout(function () {
        attentionTimer = null;
        if (
          document.hidden ||
          avatarState.panelOpen ||
          avatarState.botPhase === "thinking" ||
          prefersReducedMotion()
        ) {
          scheduleAttention();
          return;
        }
        fig.classList.add("mvi-chat-avatar--attention");
        showLayer("attention");
        attentionPhaseTimer = window.setTimeout(function () {
          attentionPhaseTimer = null;
          fig.classList.remove("mvi-chat-avatar--attention");
          refreshExpression();
          scheduleBlink();
          scheduleAttention();
        }, 2100);
      }, 26000 + Math.random() * 18000);
    }

    function onPanelHook(open) {
      avatarState.panelOpen = open;
      clearBlinkTimers();
      clearAttentionTimers();
      fig.classList.remove("mvi-chat-avatar--attention");
      applyReduceMotionClass();
      fig.classList.toggle("mvi-chat-avatar--motion-idle", true);
      if (!open) {
        scheduleAttention();
      }
      refreshExpression();
      if (!prefersReducedMotion()) scheduleBlink();
    }

    function onThinkingHook() {
      clearBlinkTimers();
      clearAttentionTimers();
      fig.classList.remove("mvi-chat-avatar--attention");
      avatarState.botPhase = "thinking";
      refreshExpression();
    }

    function onRepliedHook(success) {
      clearHappyTimer();
      avatarState.botPhase = "idle";
      if (success) {
        avatarState.happyUntil = Date.now() + 2200;
        fig.classList.add("mvi-chat-avatar--happy");
        refreshExpression();
        happyTimer = window.setTimeout(function () {
          happyTimer = null;
          avatarState.happyUntil = 0;
          fig.classList.remove("mvi-chat-avatar--happy");
          refreshExpression();
          if (!prefersReducedMotion()) {
            scheduleBlink();
            scheduleAttention();
          }
        }, 2400);
      } else {
        fig.classList.remove("mvi-chat-avatar--happy");
        avatarState.happyUntil = 0;
        refreshExpression();
        if (!prefersReducedMotion()) {
          scheduleBlink();
          scheduleAttention();
        }
      }
    }

    function onHook(e) {
      var d = e.detail || {};
      if (d.hook === "panel") onPanelHook(!!d.open);
      else if (d.hook === "thinking") onThinkingHook();
      else if (d.hook === "replied") onRepliedHook(d.ok !== false);
    }

    root.addEventListener("mvi-assistant-hook", onHook);

    var visHandler = function () {
      if (!document.hidden && !prefersReducedMotion()) {
        clearBlinkTimers();
        clearAttentionTimers();
        scheduleBlink();
        scheduleAttention();
      }
    };
    document.addEventListener("visibilitychange", visHandler);

    var mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    var mqHandler = function () {
      reduceMotion = prefersReducedMotion();
      applyReduceMotionClass();
      clearAllTimers();
      fig.classList.remove("mvi-chat-avatar--attention");
      refreshExpression();
      if (!reduceMotion) {
        scheduleBlink();
        scheduleAttention();
      }
      updateDebug();
    };
    if (mq && mq.addEventListener) mq.addEventListener("change", mqHandler);
    else if (mq && mq.addListener) mq.addListener(mqHandler);

    window.addEventListener("pagehide", clearAllTimers);

    refreshExpression();
    if (!prefersReducedMotion()) {
      scheduleBlink();
      scheduleAttention();
    }
    updateDebug();

    window.MviChatAvatar = window.MviChatAvatar || {};
    window.MviChatAvatar.refresh = refreshExpression;
    window.MviChatAvatar.destroy = function () {
      clearAllTimers();
      root.removeEventListener("mvi-assistant-hook", onHook);
      document.removeEventListener("visibilitychange", visHandler);
      if (mq && mq.removeEventListener) mq.removeEventListener("change", mqHandler);
      else if (mq && mq.removeListener) mq.removeListener(mqHandler);
      window.removeEventListener("pagehide", clearAllTimers);
      root.removeAttribute("data-mvi-avatar-init");
      if (debugEl && debugEl.parentNode) debugEl.parentNode.removeChild(debugEl);
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("mvi-assistant-root");
    if (root) init(root);
  });
})();
