/**
 * Sticky on-page Bridge ON/OFF control.
 * Survives page clicks (unlike the extension popup).
 * Drag the header to move; collapse to a small chip when it is in the way.
 */
(function () {
  const HOST_ID = "mvi-bridge-sticky-root";
  if (document.getElementById(HOST_ID)) return;

  const POS_KEY = "mviBridgeStickyPos";
  const MIN_KEY = "mviBridgeStickyMin";
  const DRAG_THRESHOLD = 6;

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.setAttribute("data-mvi-bridge-sticky", "1");
  Object.assign(host.style, {
    all: "initial",
    position: "fixed",
    top: "12px",
    right: "12px",
    zIndex: "2147483646",
    fontFamily: "system-ui, -apple-system, sans-serif",
    pointerEvents: "auto",
  });

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      .panel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(13, 71, 161, 0.97);
        color: #fff;
        box-shadow: 0 8px 24px rgba(0,0,0,.28);
        border: 1px solid rgba(255,255,255,.22);
        min-width: 190px;
        user-select: none;
        pointer-events: auto;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .drag {
        flex: 1;
        min-width: 0;
        cursor: grab;
      }
      .panel.is-dragging .drag { cursor: grabbing; }
      .title { font-size: 11px; font-weight: 700; letter-spacing: .02em; }
      .state { font-size: 13px; font-weight: 700; color: #fec963; margin-top: 2px; }
      .state.on { color: #6ee7b7; }
      .hint { font-size: 10px; opacity: .88; }
      .tools {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .min-btn {
        appearance: none;
        width: 26px;
        height: 26px;
        border: none;
        border-radius: 6px;
        background: rgba(255,255,255,.16);
        color: #fff;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        pointer-events: auto;
      }
      .min-btn:hover { background: rgba(255,255,255,.28); }
      .toggle {
        appearance: none;
        width: 46px;
        height: 26px;
        border-radius: 999px;
        border: none;
        background: #94a3b8;
        position: relative;
        cursor: pointer;
        flex-shrink: 0;
        pointer-events: auto;
      }
      .toggle::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        transition: transform .15s ease;
      }
      .toggle[aria-pressed="true"] { background: #0d7a6f; }
      .toggle[aria-pressed="true"]::after { transform: translateX(20px); }
      .force-off {
        display: none;
        width: 100%;
        border: none;
        border-radius: 8px;
        background: #b91c1c;
        color: #fff;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: .03em;
        padding: 10px 12px;
        cursor: pointer;
        pointer-events: auto;
      }
      .panel.is-on .force-off { display: block; }
      .force-off:hover { background: #991b1b; }
      .force-off:active { transform: scale(0.98); }
      .panel.is-min {
        min-width: 0;
        padding: 6px 8px 6px 10px;
        gap: 0;
      }
      .panel.is-min .hint,
      .panel.is-min .force-off,
      .panel.is-min .toggle { display: none; }
      .panel.is-min .state { font-size: 11px; margin-top: 0; }
      .panel.is-min .min-btn { font-size: 14px; }
    </style>
    <div class="panel" id="panel">
      <div class="row">
        <div class="drag" id="drag" title="Drag to move">
          <div class="title">MVI Bridge</div>
          <div class="state" id="state">OFF</div>
          <div class="hint">⌥⇧X = force OFF · drag to move</div>
        </div>
        <div class="tools">
          <button class="min-btn" id="minBtn" type="button" title="Minimize" aria-label="Minimize MVI Bridge">–</button>
          <button class="toggle" id="toggle" type="button" aria-pressed="false" aria-label="Toggle MVI Agent Bridge"></button>
        </div>
      </div>
      <button class="force-off" id="forceOff" type="button">TURN BRIDGE OFF</button>
    </div>
  `;

  const panel = shadow.getElementById("panel");
  const stateEl = shadow.getElementById("state");
  const toggle = shadow.getElementById("toggle");
  const forceOff = shadow.getElementById("forceOff");
  const minBtn = shadow.getElementById("minBtn");

  let busy = false;
  let minimized = false;

  function paint(armed) {
    const on = Boolean(armed);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    stateEl.textContent = on ? "ON" : "OFF";
    stateEl.classList.toggle("on", on);
    panel.classList.toggle("is-on", on);
  }

  function setMinimized(next) {
    minimized = Boolean(next);
    panel.classList.toggle("is-min", minimized);
    minBtn.textContent = minimized ? "+" : "–";
    minBtn.title = minimized ? "Expand" : "Minimize";
    minBtn.setAttribute("aria-label", minimized ? "Expand MVI Bridge" : "Minimize MVI Bridge");
    try {
      chrome.storage.local.set({ [MIN_KEY]: minimized });
    } catch {
      /* ignore */
    }
  }

  function clamp(left, top) {
    const rect = host.getBoundingClientRect();
    const w = rect.width || 200;
    const h = rect.height || 80;
    const maxL = Math.max(8, window.innerWidth - w - 8);
    const maxT = Math.max(8, window.innerHeight - h - 8);
    return {
      left: Math.min(maxL, Math.max(8, left)),
      top: Math.min(maxT, Math.max(8, top)),
    };
  }

  function applyPos(pos) {
    if (!pos || typeof pos.left !== "number" || typeof pos.top !== "number") return;
    const next = clamp(pos.left, pos.top);
    host.style.left = next.left + "px";
    host.style.top = next.top + "px";
    host.style.right = "auto";
  }

  function savePos() {
    const rect = host.getBoundingClientRect();
    try {
      chrome.storage.local.set({
        [POS_KEY]: { left: rect.left, top: rect.top },
      });
    } catch {
      /* ignore */
    }
  }

  function bindDrag() {
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;
    let pointerId = null;

    function isControl(e) {
      const path = e.composedPath ? e.composedPath() : [];
      return path.includes(toggle) || path.includes(forceOff) || path.includes(minBtn);
    }

    function onMove(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!moved) {
        moved = true;
        panel.classList.add("is-dragging");
      }
      const next = clamp(origLeft + dx, origTop + dy);
      host.style.left = next.left + "px";
      host.style.top = next.top + "px";
      host.style.right = "auto";
    }

    function onUp(e) {
      if (e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      panel.classList.remove("is-dragging");
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
      if (moved) savePos();
    }

    host.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button != null && e.button !== 0) return;
        if (isControl(e)) return;
        e.preventDefault();
        const rect = host.getBoundingClientRect();
        dragging = true;
        moved = false;
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        origLeft = rect.left;
        origTop = rect.top;
        window.addEventListener("pointermove", onMove, true);
        window.addEventListener("pointerup", onUp, true);
        window.addEventListener("pointercancel", onUp, true);
      },
      true
    );
  }

  async function setArmed(next) {
    if (busy) return;
    busy = true;
    try {
      paint(next);
      const res = await chrome.runtime.sendMessage({ type: "setArmed", armed: next });
      paint(Boolean(res?.armed ?? next));
    } catch (err) {
      paint(false);
      console.warn("[mvi-bridge-sticky] setArmed failed", err);
    } finally {
      busy = false;
    }
  }

  function bindDisarm(el) {
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      setArmed(false);
    };
    el.addEventListener("mousedown", handler, true);
    el.addEventListener("pointerdown", handler, true);
    el.addEventListener("click", handler, true);
  }

  toggle.addEventListener(
    "mousedown",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const next = toggle.getAttribute("aria-pressed") !== "true";
      setArmed(next);
    },
    true
  );
  toggle.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    },
    true
  );

  minBtn.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      setMinimized(!minimized);
    },
    true
  );

  bindDisarm(forceOff);
  bindDrag();

  ["mousedown", "mouseup", "pointerdown", "pointerup", "click"].forEach((evt) => {
    host.addEventListener(evt, (e) => e.stopPropagation(), true);
  });

  window.addEventListener("resize", () => {
    const rect = host.getBoundingClientRect();
    applyPos({ left: rect.left, top: rect.top });
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "armedChanged") paint(msg.armed);
  });

  chrome.runtime
    .sendMessage({ type: "getState" })
    .then((s) => paint(Boolean(s?.armed)))
    .catch(() => paint(false));

  chrome.storage.local.get([POS_KEY, MIN_KEY], (s) => {
    if (s && s[POS_KEY]) applyPos(s[POS_KEY]);
    if (s && s[MIN_KEY]) setMinimized(true);
  });

  document.documentElement.appendChild(host);
})();
