const BRIDGE = "http://127.0.0.1:9334";
const TOKEN = "mvi-local-bridge";

let armed = false;
let pollLoop = 0;
/** Sticky portal/control tab — PDF new tabs must not steal agent commands. */
let controlTabId = null;
let keepaliveTimer = null;

chrome.storage.local.get(["armed", "controlTabId"]).then((v) => {
  armed = Boolean(v.armed);
  controlTabId = typeof v.controlTabId === "number" ? v.controlTabId : null;
  updateBadge();
  heartbeat();
  ensurePolling();
  ensureKeepalive();
});

chrome.alarms.create("mvi-bridge-heartbeat", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "mvi-bridge-heartbeat") heartbeat();
});

// If a PDF/viewer tab becomes active, keep control on the portal tab.
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!armed) return;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (isPdfLikeUrl(tab.url || "") || isPdfLikeUrl(tab.pendingUrl || "")) {
      return; // ignore — do not rebind controlTabId
    }
    // User focused a normal page while armed → treat as new control surface
    if (tab.url && /^https?:/i.test(tab.url)) {
      await setControlTab(tabId);
      heartbeat();
    }
  } catch {
    /* tab gone */
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === controlTabId) {
    controlTabId = null;
    chrome.storage.local.remove("controlTabId");
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type === "getState") {
      sendResponse({ armed, controlTabId });
      return;
    }
    if (msg.type === "setArmed") {
      armed = Boolean(msg.armed);
      await chrome.storage.local.set({ armed });
      if (armed) {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tab?.id && !isPdfLikeUrl(tab.url || "")) {
          await setControlTab(tab.id);
        }
      }
      updateBadge();
      await heartbeat();
      ensurePolling();
      ensureKeepalive();
      await broadcastArmed();
      sendResponse({ ok: true, armed, controlTabId });
      return;
    }
    if (msg.type === "pingServer") {
      try {
        const res = await fetch(`${BRIDGE}/v1/status`);
        sendResponse(await res.json());
      } catch (e) {
        sendResponse({ ok: false, error: String(e.message || e) });
      }
    }
  })();
  return true;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-bridge") {
    armed = !armed;
  } else if (command === "disarm-bridge") {
    armed = false;
  } else {
    return;
  }
  await chrome.storage.local.set({ armed });
  if (armed) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab?.id && !isPdfLikeUrl(tab.url || "")) {
      await setControlTab(tab.id);
    }
  }
  updateBadge();
  await heartbeat();
  ensurePolling();
  ensureKeepalive();
  await broadcastArmed();
});

async function broadcastArmed() {
  try {
    const tabs = await chrome.tabs.query({});
    await Promise.all(
      tabs.map(async (t) => {
        if (!t.id) return;
        try {
          await chrome.tabs.sendMessage(t.id, { type: "armedChanged", armed });
        } catch {
          /* no content script on this tab */
        }
      })
    );
  } catch {
    /* ignore */
  }
}

function isPdfLikeUrl(url) {
  const u = String(url || "");
  if (!u) return false;
  if (/\.pdf($|\?|#)/i.test(u)) return true;
  if (/^chrome-extension:\/\//i.test(u) && /pdf/i.test(u)) return true;
  if (/^blob:/i.test(u) && /pdf/i.test(u)) return true;
  return false;
}

async function setControlTab(tabId) {
  controlTabId = tabId;
  await chrome.storage.local.set({ controlTabId: tabId });
}

function updateBadge() {
  chrome.action.setBadgeText({ text: armed ? "ON" : "" });
  chrome.action.setBadgeBackgroundColor({ color: armed ? "#0d7a6f" : "#64748b" });
}

async function controlTabMeta() {
  if (controlTabId != null) {
    try {
      const tab = await chrome.tabs.get(controlTabId);
      if (tab?.id) {
        return {
          tabTitle: tab.title || "",
          tabUrl: tab.url || tab.pendingUrl || "",
          tabId: tab.id,
        };
      }
    } catch {
      controlTabId = null;
    }
  }
  return activeTabMeta();
}

async function activeTabMeta() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return {
    tabTitle: tab?.title || "",
    tabUrl: tab?.url || "",
    tabId: tab?.id,
  };
}

async function heartbeat() {
  try {
    const meta = await controlTabMeta();
    await fetch(`${BRIDGE}/v1/hello`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MVI-Bridge-Token": TOKEN,
      },
      body: JSON.stringify({
        armed,
        tabTitle: meta.tabTitle,
        tabUrl: meta.tabUrl,
        controlTabId: meta.tabId || null,
      }),
    });
  } catch {
    /* server offline */
  }
}

function ensureKeepalive() {
  if (keepaliveTimer) return;
  keepaliveTimer = setInterval(() => {
    if (!armed) return;
    heartbeat();
  }, 5000);
}

function ensurePolling() {
  if (!armed) return;
  if (pollLoop) return;
  pollLoop = 1;
  poll();
}

async function poll() {
  pollLoop = 0;
  if (!armed) return;
  try {
    const res = await fetch(`${BRIDGE}/v1/pending?wait=25000`, {
      headers: { "X-MVI-Bridge-Token": TOKEN },
    });
    const data = await res.json();
    if (data.command) {
      // Keep server "fresh" while a long command (navigate / PDF open) runs.
      const beat = setInterval(() => heartbeat(), 3000);
      try {
        const result = await runCommand(data.command);
        await fetch(`${BRIDGE}/v1/result`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-MVI-Bridge-Token": TOKEN,
          },
          body: JSON.stringify(result),
        });
      } finally {
        clearInterval(beat);
      }
    }
  } catch {
    await sleep(1500);
  }
  if (armed) {
    pollLoop = 1;
    poll();
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runCommand(cmd) {
  const { id, action, args = {} } = cmd;
  try {
    let data;
    switch (action) {
      case "tabs":
        data = await listTabs();
        break;
      case "activeTab":
        data = await controlTabMeta();
        break;
      case "pageText":
        data = await pageText(args.maxChars || 120000);
        break;
      case "pageHtml":
        data = await pageHtml(args.maxChars || 200000);
        break;
      case "pageLinks":
        data = await pageLinks();
        break;
      case "evaluate":
        data = await evaluate(args.code || "");
        // PDF clicks often activate a new tab — snap focus back to control tab.
        await refocusControlTab();
        break;
      case "navigate":
        data = await navigate(args.url);
        break;
      case "click":
        data = await click(args.selector);
        await refocusControlTab();
        break;
      case "screenshot":
        data = await screenshot();
        break;
      default:
        return { id, ok: false, error: `unknown_action:${action}` };
    }
    return { id, ok: true, ...wrap(data) };
  } catch (e) {
    return { id, ok: false, error: String(e.message || e) };
  }
}

async function refocusControlTab() {
  if (controlTabId == null) return;
  try {
    const tab = await chrome.tabs.get(controlTabId);
    if (!tab?.id) return;
    await chrome.tabs.update(tab.id, { active: true });
    if (tab.windowId != null) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }
  } catch {
    /* ignore */
  }
}

function wrap(data) {
  if (data && typeof data === "object" && !Array.isArray(data)) return data;
  return { data };
}

async function listTabs() {
  const tabs = await chrome.tabs.query({});
  return {
    controlTabId,
    tabs: tabs.map((t) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      active: t.active,
      windowId: t.windowId,
      isControl: t.id === controlTabId,
    })),
  };
}

async function getTargetTabId() {
  if (controlTabId != null) {
    try {
      const t = await chrome.tabs.get(controlTabId);
      if (t?.id) {
        // If control somehow landed on a PDF, fall back to last focused http(s) tab
        if (!isPdfLikeUrl(t.url || "") && !isPdfLikeUrl(t.pendingUrl || "")) {
          return t.id;
        }
      }
    } catch {
      controlTabId = null;
    }
  }
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) throw new Error("no_active_tab");
  if (!isPdfLikeUrl(tab.url || "")) {
    await setControlTab(tab.id);
  }
  return tab.id;
}

async function inject(fn, args = []) {
  const tabId = await getTargetTabId();
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: fn,
    args,
  });
  return results?.[0]?.result;
}

async function pageText(maxChars) {
  const text = await inject((max) => {
    const t = document.body ? document.body.innerText : "";
    return t.slice(0, max);
  }, [maxChars]);
  const meta = await controlTabMeta();
  return { ...meta, text, length: (text || "").length };
}

async function pageHtml(maxChars) {
  const html = await inject((max) => document.documentElement.outerHTML.slice(0, max), [maxChars]);
  const meta = await controlTabMeta();
  return { ...meta, html, length: (html || "").length };
}

async function pageLinks() {
  const links = await inject(() => {
    const out = [];
    const seen = new Set();
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.href;
      if (!href || seen.has(href)) continue;
      seen.add(href);
      out.push({
        href,
        text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 200),
      });
      if (out.length >= 400) break;
    }
    return out;
  });
  const meta = await controlTabMeta();
  return { ...meta, links };
}

async function evaluate(code) {
  if (!code || typeof code !== "string") throw new Error("code_required");
  // Safer than eval string across worlds: Function constructor in page context
  const result = await inject((src) => {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${src});`);
    const value = fn();
    try {
      return { value: JSON.parse(JSON.stringify(value)) };
    } catch {
      return { value: String(value) };
    }
  }, [code]);
  return result;
}

async function navigate(url) {
  if (!url) throw new Error("url_required");
  const tabId = await getTargetTabId();
  const tab = await chrome.tabs.update(tabId, { url });
  await setControlTab(tab.id);
  return { tabId: tab.id, url: tab.pendingUrl || tab.url || url };
}

async function click(selector) {
  if (!selector) throw new Error("selector_required");
  const clicked = await inject((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false };
    el.scrollIntoView({ block: "center", inline: "center" });
    el.click();
    return {
      found: true,
      tag: el.tagName,
      text: (el.innerText || "").trim().slice(0, 120),
    };
  }, [selector]);
  return clicked;
}

async function screenshot() {
  // captureVisibleTab needs the control tab visible
  await refocusControlTab();
  await sleep(150);
  const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
    format: "png",
  });
  const meta = await controlTabMeta();
  return { ...meta, dataUrl };
}
