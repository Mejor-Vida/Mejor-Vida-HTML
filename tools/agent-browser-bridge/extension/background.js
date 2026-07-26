const BRIDGE = "http://127.0.0.1:9334";
const TOKEN = "mvi-local-bridge";

let armed = false;
let pollLoop = 0;

chrome.storage.local.get(["armed"]).then((v) => {
  armed = Boolean(v.armed);
  updateBadge();
  heartbeat();
  ensurePolling();
});

chrome.alarms.create("mvi-bridge-heartbeat", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "mvi-bridge-heartbeat") heartbeat();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type === "getState") {
      sendResponse({ armed });
      return;
    }
    if (msg.type === "setArmed") {
      armed = Boolean(msg.armed);
      await chrome.storage.local.set({ armed });
      updateBadge();
      await heartbeat();
      ensurePolling();
      sendResponse({ ok: true, armed });
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

function updateBadge() {
  chrome.action.setBadgeText({ text: armed ? "ON" : "" });
  chrome.action.setBadgeBackgroundColor({ color: armed ? "#0d7a6f" : "#64748b" });
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
    const meta = await activeTabMeta();
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
      }),
    });
  } catch {
    /* server offline */
  }
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
      const result = await runCommand(data.command);
      await fetch(`${BRIDGE}/v1/result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MVI-Bridge-Token": TOKEN,
        },
        body: JSON.stringify(result),
      });
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
        data = await activeTabMeta();
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
        break;
      case "navigate":
        data = await navigate(args.url);
        break;
      case "click":
        data = await click(args.selector);
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

function wrap(data) {
  if (data && typeof data === "object" && !Array.isArray(data)) return data;
  return { data };
}

async function listTabs() {
  const tabs = await chrome.tabs.query({});
  return {
    tabs: tabs.map((t) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      active: t.active,
      windowId: t.windowId,
    })),
  };
}

async function getTargetTabId() {
  const meta = await activeTabMeta();
  if (!meta.tabId) throw new Error("no_active_tab");
  return meta.tabId;
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
  const meta = await activeTabMeta();
  return { ...meta, text, length: (text || "").length };
}

async function pageHtml(maxChars) {
  const html = await inject((max) => document.documentElement.outerHTML.slice(0, max), [maxChars]);
  const meta = await activeTabMeta();
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
  const meta = await activeTabMeta();
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
  const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
    format: "png",
  });
  const meta = await activeTabMeta();
  return { ...meta, dataUrl };
}
