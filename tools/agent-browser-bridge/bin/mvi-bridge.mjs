#!/usr/bin/env node
/**
 * CLI for MVI Agent Browser Bridge
 *
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs status
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs tabs
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs active
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs text
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs links
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs html
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs eval 'document.title'
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs navigate 'https://...'
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs click 'css=button'
 *   node tools/agent-browser-bridge/bin/mvi-bridge.mjs screenshot
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = process.env.MVI_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.MVI_BRIDGE_PORT || 9334);
const TOKEN = process.env.MVI_BRIDGE_TOKEN || "mvi-local-bridge";
const BASE = `http://${HOST}:${PORT}`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

async function api(pathname, opts = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "X-MVI-Bridge-Token": TOKEN,
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(body.error || body.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

async function command(action, args = {}) {
  return api("/v1/command", {
    method: "POST",
    body: JSON.stringify({ action, args }),
  });
}

function usage() {
  console.log(`MVI Agent Browser Bridge CLI

Usage:
  mvi-bridge status
  mvi-bridge tabs
  mvi-bridge active
  mvi-bridge text [--max N]
  mvi-bridge links
  mvi-bridge html [--max N]
  mvi-bridge eval <js>
  mvi-bridge navigate <url>
  mvi-bridge click <css-selector>
  mvi-bridge screenshot [out.png]

Server: ${BASE}
`);
}

async function main() {
  const [,, cmd, ...rest] = process.argv;
  if (!cmd || cmd === "-h" || cmd === "--help") {
    usage();
    process.exit(0);
  }

  try {
    if (cmd === "status") {
      const s = await api("/v1/status");
      console.log(JSON.stringify(s, null, 2));
      process.exit(s.armed ? 0 : 2);
    }

    const maxIdx = rest.indexOf("--max");
    const max = maxIdx >= 0 ? Number(rest[maxIdx + 1]) : undefined;
    const positional =
      maxIdx >= 0
        ? rest.filter((_, i) => i !== maxIdx && i !== maxIdx + 1)
        : rest.slice();

    if (cmd === "tabs") {
      console.log(JSON.stringify(await command("tabs"), null, 2));
      return;
    }
    if (cmd === "active") {
      console.log(JSON.stringify(await command("activeTab"), null, 2));
      return;
    }
    if (cmd === "text") {
      console.log(JSON.stringify(await command("pageText", { maxChars: max || 120000 }), null, 2));
      return;
    }
    if (cmd === "links") {
      console.log(JSON.stringify(await command("pageLinks"), null, 2));
      return;
    }
    if (cmd === "html") {
      console.log(JSON.stringify(await command("pageHtml", { maxChars: max || 200000 }), null, 2));
      return;
    }
    if (cmd === "eval") {
      const code = positional.join(" ");
      if (!code) throw new Error("eval requires JS expression");
      console.log(JSON.stringify(await command("evaluate", { code }), null, 2));
      return;
    }
    if (cmd === "navigate") {
      const url = positional[0];
      if (!url) throw new Error("navigate requires URL");
      console.log(JSON.stringify(await command("navigate", { url }), null, 2));
      return;
    }
    if (cmd === "click") {
      const selector = positional.join(" ");
      if (!selector) throw new Error("click requires CSS selector");
      console.log(JSON.stringify(await command("click", { selector }), null, 2));
      return;
    }
    if (cmd === "screenshot") {
      const out = positional[0] || path.join(ROOT, "last-screenshot.png");
      const result = await command("screenshot");
      if (!result.ok || !result.dataUrl) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(1);
      }
      const b64 = result.dataUrl.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(out, Buffer.from(b64, "base64"));
      console.log(JSON.stringify({ ok: true, path: out, bytes: Buffer.from(b64, "base64").length }, null, 2));
      return;
    }

    usage();
    process.exit(1);
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: e.message, body: e.body || null }, null, 2));
    process.exit(1);
  }
}

main();
