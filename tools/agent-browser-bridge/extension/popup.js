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
  const { armed } = await chrome.runtime.sendMessage({ type: "getState" });
  paint(Boolean(armed));

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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      tabState.textContent = `${tab.title || "(no title)"} — ${tab.url || ""}`;
    }
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
