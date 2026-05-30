/**
 * Local dev server: static files + Vercel-style API handlers (req, res).
 * Use when `vercel dev` is unavailable (no CLI login) or for quick staff portal tests.
 *
 * Usage: npm run dev:local
 * Env: loads .env.local into process.env (does not print values).
 * Open: http://localhost:3000/staff/
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 3000);

function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".txt": "text/plain; charset=utf-8",
    ".vcf": "text/vcard; charset=utf-8",
  };
  return map[ext] || "application/octet-stream";
}

function safeResolveUnderRoot(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded.replace(/^\/+/, "");
  const abs = path.normalize(path.join(ROOT, rel));
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function apiHandlerPath(pathname) {
  const clean = pathname.replace(/\/$/, "") || "/";
  if (!clean.startsWith("/api/")) return null;
  const rel = clean.slice(1) + ".js";
  const abs = path.join(ROOT, rel);
  if (!abs.startsWith(ROOT)) return null;
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return null;
  return abs;
}

async function runApi(absHandler, req, res, query) {
  delete require.cache[require.resolve(absHandler)];
  // API handlers import lib/* — bust that cache too so search fixes apply without restart.
  const libRoot = path.join(ROOT, "lib") + path.sep;
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(libRoot)) delete require.cache[key];
  }
  const mod = require(absHandler);
  const handler = typeof mod === "function" ? mod : mod.default;
  if (typeof handler !== "function") {
    res.statusCode = 500;
    res.end("Invalid API module");
    return;
  }
  req.query = query;
  // Minimal Vercel-like response helpers for API handlers.
  res.status = function status(code) {
    res.statusCode = Number(code) || 200;
    return res;
  };
  res.send = function send(payload) {
    if (payload === undefined || payload === null) return res.end("");
    if (Buffer.isBuffer(payload)) return res.end(payload);
    if (typeof payload === "object") {
      if (!res.getHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json");
      }
      return res.end(JSON.stringify(payload));
    }
    return res.end(String(payload));
  };
  res.json = function json(payload) {
    if (!res.getHeader("Content-Type")) {
      res.setHeader("Content-Type", "application/json");
    }
    return res.end(JSON.stringify(payload));
  };
  const ct = String(req.headers["content-type"] || "").toLowerCase();
  if (req.method !== "GET" && req.method !== "HEAD" && ct.includes("application/json")) {
    try {
      const buf = await readBody(req);
      const text = buf.toString("utf8");
      req.body = text ? JSON.parse(text) : {};
    } catch (e) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }
  } else if (req.method !== "GET" && req.method !== "HEAD") {
    const buf = await readBody(req);
    req.body = buf.toString("utf8");
  }
  await handler(req, res);
}

function serveStatic(urlPath, res) {
  let abs = safeResolveUnderRoot(urlPath);
  if (!abs) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
    const idx = path.join(abs, "index.html");
    if (fs.existsSync(idx)) abs = idx;
  }
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    const tryHtml = abs + ".html";
    if (fs.existsSync(tryHtml) && fs.statSync(tryHtml).isFile()) abs = tryHtml;
    else {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", contentType(abs));
  fs.createReadStream(abs).pipe(res);
}

loadEnvLocal();

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = u.pathname;
  const query = Object.fromEntries(u.searchParams.entries());

  const apiFile = apiHandlerPath(pathname);
  if (apiFile) {
    try {
      await runApi(apiFile, req, res, query);
    } catch (e) {
      console.error(e);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "API error" }));
      }
    }
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  serveStatic(pathname === "/" ? "/index.html" : pathname, res);
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is in use. Try: PORT=3001 npm run dev:local`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  const base = `http://localhost:${PORT}`;
  console.log("");
  console.log("Local dev server running");
  console.log("────────────────────────────────────────");
  console.log(`Staff portal:     ${base}/staff/`);
  console.log(`Medical intake:   ${base}/medical-intake.html?t=YOUR_TOKEN`);
  console.log(`Medical API test: ${base}/api/medical-intake/validate?t=YOUR_TOKEN`);
  console.log(`Site home:        ${base}/`);
  console.log("────────────────────────────────────────");
  console.log("Loads .env.local — uses your Supabase project for tokens/PHI.");
  console.log("Preview link:     npm run mint:intake-link");
  console.log("");
});
