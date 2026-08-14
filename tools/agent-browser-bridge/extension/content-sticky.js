/**
 * Sticky on-page Bridge ON/OFF control.
 * Survives page clicks (unlike the extension popup).
 */
(function () {
  const HOST_ID = "mvi-bridge-sticky-root";
  if (document.getElementById(HOST_ID)) return;

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
      .title { font-size: 11px; font-weight: 700; letter-spacing: .02em; }
      .state { font-size: 13px; font-weight: 700; color: #fec963; margin-top: 2px; }
      .state.on { color: #6ee7b7; }
      .hint { font-size: 10px; opacity: .88; }
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
    </style>
    <div class="panel" id="panel">
      <div class="row">
        <div>
          <div class="title">MVI Bridge</div>
          <div class="state" id="state">OFF</div>
          <div class="hint">⌥⇧X = force OFF</div>
        </div>
        <button class="toggle" id="toggle" type="button" aria-pressed="false" aria-label="Toggle MVI Agent Bridge"></button>
      </div>
      <button class="force-off" id="forceOff" type="button">TURN BRIDGE OFF</button>
    </div>
  `;

  const panel = shadow.getElementById("panel");
  const stateEl = shadow.getElementById("state");
  const toggle = shadow.getElementById("toggle");
  const forceOff = shadow.getElementById("forceOff");

  let busy = false;

  function paint(armed) {
    const on = Boolean(armed);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    stateEl.textContent = on ? "ON" : "OFF";
    stateEl.classList.toggle("on", on);
    panel.classList.toggle("is-on", on);
  }

  async function setArmed(next) {
    if (busy) return;
    busy = true;
    try {
      // Optimistic UI so OFF feels instant even if messaging is slow
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
    // mousedown wins when the agent is also clicking the page
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

  bindDisarm(forceOff);

  // Keep page scripts from eating events aimed at our host
  ["mousedown", "mouseup", "pointerdown", "pointerup", "click"].forEach((evt) => {
    host.addEventListener(evt, (e) => e.stopPropagation(), true);
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "armedChanged") paint(msg.armed);
  });

  chrome.runtime
    .sendMessage({ type: "getState" })
    .then((s) => paint(Boolean(s?.armed)))
    .catch(() => paint(false));

  document.documentElement.appendChild(host);
})();
