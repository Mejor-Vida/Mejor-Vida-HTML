#!/usr/bin/env node
/**
 * Localhost bridge between Cursor agent (HTTP) and the MVI Agent Browser Bridge
 * Chrome extension (long-poll). Bind: 127.0.0.1 only.
 *
 *   npm run bridge:browser
 *   npm run bridge:browser:status
 *   npm run bridge:browser:cmd -- tabs
 */
import http from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";

const HOST = "127.0.0.1";
const PORT = Number(process.env.MVI_BRIDGE_PORT || 9334);
const TOKEN = process.env.MVI_BRIDGE_TOKEN || "mvi-local-bridge";

/** @type {{ connected: boolean, armed: boolean, lastSeen: number, tabTitle?: string, tabUrl?: string }} */
const extension = {
  connected: false,
  armed: false,
  lastSeen: 0,
  tabTitle: "",
  tabUrl: "",
};

/** @type {Map<string, { resolve: Function, reject: Function, timer: NodeJS.Timeout }>} */
const waitingAgents = new Map();

/** @type {Array<{ id: string, action: string, args: object }>} */
const pendingCommands = [];

/** @type {Array<{ resolve: Function, timer: NodeJS.Timeout }>} */
const pendingPollers = [];

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-MVI-Bridge-Token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(data);
}

function unauthorized(res) {
  json(res, 401, { ok: false, error: "unauthorized" });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error("invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function checkToken(req) {
  const h = req.headers["x-mvi-bridge-token"];
  const u = new URL(req.url || "/", `http://${HOST}:${PORT}`);
  const q = u.searchParams.get("token");
  return (h || q || "") === TOKEN;
}

function flushPoller(cmd) {
  const poller = pendingPollers.shift();
  if (!poller) return false;
  clearTimeout(poller.timer);
  poller.resolve(cmd);
  return true;
}

function enqueueCommand(action, args = {}) {
  return new Promise((resolve, reject) => {
    if (!extension.connected || Date.now() - extension.lastSeen > 15000) {
      reject(Object.assign(new Error("extension_offline"), { code: "extension_offline" }));
      return;
    }
    if (!extension.armed) {
      reject(Object.assign(new Error("extension_disarmed"), { code: "extension_disarmed" }));
      return;
    }
    const id = randomUUID();
    const cmd = { id, action, args };
    const timer = setTimeout(() => {
      waitingAgents.delete(id);
      reject(Object.assign(new Error("timeout"), { code: "timeout" }));
    }, Number(args.timeoutMs || 60000));
    waitingAgents.set(id, { resolve, reject, timer });
    if (!flushPoller(cmd)) pendingCommands.push(cmd);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-MVI-Bridge-Token",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
  const path = url.pathname;

  try {
    // Extension endpoints (token required)
    if (path === "/v1/hello" && req.method === "POST") {
      if (!checkToken(req)) return unauthorized(res);
      const body = await readBody(req);
      extension.connected = true;
      extension.armed = Boolean(body.armed);
      extension.lastSeen = Date.now();
      extension.tabTitle = body.tabTitle || "";
      extension.tabUrl = body.tabUrl || "";
      return json(res, 200, { ok: true, serverTime: Date.now() });
    }

    if (path === "/v1/pending" && req.method === "GET") {
      if (!checkToken(req)) return unauthorized(res);
      extension.connected = true;
      extension.lastSeen = Date.now();
      const waitMs = Math.min(Number(url.searchParams.get("wait") || 25000), 28000);

      if (pendingCommands.length) {
        return json(res, 200, { ok: true, command: pendingCommands.shift() });
      }

      const command = await new Promise((resolve) => {
        const timer = setTimeout(() => {
          const idx = pendingPollers.findIndex((p) => p.resolve === resolve);
          if (idx >= 0) pendingPollers.splice(idx, 1);
          resolve(null);
        }, waitMs);
        pendingPollers.push({ resolve, timer });
      });

      if (!command) return json(res, 200, { ok: true, command: null });
      return json(res, 200, { ok: true, command });
    }

    if (path === "/v1/result" && req.method === "POST") {
      if (!checkToken(req)) return unauthorized(res);
      const body = await readBody(req);
      const waiter = waitingAgents.get(body.id);
      if (!waiter) return json(res, 404, { ok: false, error: "unknown_command_id" });
      clearTimeout(waiter.timer);
      waitingAgents.delete(body.id);
      waiter.resolve(body);
      return json(res, 200, { ok: true });
    }

    // Agent / status endpoints
    if (path === "/v1/status" && req.method === "GET") {
      const fresh = extension.connected && Date.now() - extension.lastSeen < 15000;
      return json(res, 200, {
        ok: true,
        online: fresh,
        armed: fresh && extension.armed,
        lastSeen: extension.lastSeen || null,
        tabTitle: extension.tabTitle || null,
        tabUrl: extension.tabUrl || null,
        pendingCommands: pendingCommands.length,
        port: PORT,
      });
    }

    if (path === "/v1/command" && req.method === "POST") {
      if (!checkToken(req)) return unauthorized(res);
      const body = await readBody(req);
      const action = body.action;
      if (!action) return json(res, 400, { ok: false, error: "action_required" });
      try {
        const result = await enqueueCommand(action, body.args || {});
        return json(res, 200, result);
      } catch (e) {
        const code = e.code || "error";
        const status = code === "timeout" ? 504 : 503;
        return json(res, status, { ok: false, error: code, message: e.message });
      }
    }

    if (path === "/" && req.method === "GET") {
      return json(res, 200, {
        ok: true,
        name: "MVI Agent Browser Bridge",
        endpoints: ["/v1/status", "/v1/command", "/v1/hello", "/v1/pending", "/v1/result"],
      });
    }

    json(res, 404, { ok: false, error: "not_found" });
  } catch (e) {
    json(res, 500, { ok: false, error: "server_error", message: String(e.message || e) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`MVI Agent Browser Bridge listening on http://${HOST}:${PORT}`);
  console.log(`Token: ${TOKEN}`);
  console.log("Load the Chrome extension, open Connext, turn the bridge ON, then run:");
  console.log("  npm run bridge:browser:status");
  console.log("  npm run bridge:browser:cmd -- tabs");
});
