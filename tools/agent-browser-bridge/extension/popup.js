const armToggle = document.getElementById("armToggle");
const statusLabel = document.getElementById("statusLabel");
const serverState = document.getElementById("serverState");
const tabState = document.getElementById("tabState");

function paint(armed) {
  armToggle.setAttribute("aria-pressed", armed ? "true" : "false");
  statusLabel.textContent = armed ? "Bridge ON" : "Bridge OFF";
  statusLabel.classList.toggle("on", armed);
}

async function refresh() {
  const state = await chrome.runtime.sendMessage({ type: "getState" });
  const armed = Boolean(state?.armed);
  paint(armed);

  try {
    const status = await chrome.runtime.sendMessage({ type: "pingServer" });
    if (status && status.ok) {
      serverState.textContent = status.online
        ? status.armed
          ? "connected · armed"
          : "connected · waiting for ON"
        : "reachable · extension heartbeat needed";
    } else {
      serverState.textContent = "offline — run npm run bridge:browser";
    }
  } catch {
    serverState.textContent = "offline — run npm run bridge:browser";
  }

  try {
    let controlLabel = "";
    if (typeof state?.controlTabId === "number") {
      try {
        const t = await chrome.tabs.get(state.controlTabId);
        controlLabel = `Control: ${(t.title || "(no title)").slice(0, 40)} — ${(t.url || "").slice(0, 80)}`;
      } catch {
        controlLabel = "Control tab closed — focus the portal and toggle Bridge OFF/ON";
      }
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeLabel = tab
      ? `Active: ${(tab.title || "(no title)").slice(0, 40)} — ${(tab.url || "").slice(0, 80)}`
      : "Active: —";
    tabState.textContent = controlLabel ? `${controlLabel}\n${activeLabel}` : activeLabel;
  } catch {
    tabState.textContent = "—";
  }
}

armToggle.addEventListener("click", async () => {
  const next = armToggle.getAttribute("aria-pressed") !== "true";
  await chrome.runtime.sendMessage({ type: "setArmed", armed: next });
  paint(next);
  refresh();
});

refresh();
setInterval(refresh, 2000);
