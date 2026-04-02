/**
 * Forward /api/quote/* to the Python quote service (QUOTE_API_UPSTREAM).
 */

const QUOTE_PROXY_FETCH_MS = 55000;

async function forwardQuoteProxy(req, res, pathSuffix) {
  const upstream = (process.env.QUOTE_API_UPSTREAM || "").trim().replace(/\/$/, "");
  if (!upstream) {
    res.status(503);
    res.setHeader("Content-Type", "application/json");
    res.send(
      JSON.stringify({
        ok: false,
        error: "quote_proxy_misconfigured",
        message:
          "Set QUOTE_API_UPSTREAM in Vercel (Project → Settings → Environment Variables) to your public quote API origin, e.g. https://your-service.railway.app",
      })
    );
    return;
  }

  try {
    const targetUrl = `${upstream}/api/quote/${pathSuffix}`;

    const headers = {};
    const ct = req.headers["content-type"];
    if (ct) headers["Content-Type"] = ct;
    const sec = req.headers["x-quote-secret"];
    if (sec) headers["X-Quote-Secret"] = sec;

    const init = {
      method: req.method,
      headers,
      redirect: "manual",
    };

    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      if (typeof req.body === "object" && req.body !== null && !Buffer.isBuffer(req.body)) {
        init.body = JSON.stringify(req.body);
        if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
      } else if (typeof req.body === "string") {
        init.body = req.body;
      }
    }

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), QUOTE_PROXY_FETCH_MS);
    let r;
    try {
      r = await fetch(targetUrl, { ...init, signal: ac.signal });
    } catch (e) {
      res.status(502);
      res.setHeader("Content-Type", "application/json");
      res.send(
        JSON.stringify({
          ok: false,
          error: "quote_proxy_fetch_failed",
          message: String(e && e.message ? e.message : e).slice(0, 200),
        })
      );
      return;
    } finally {
      clearTimeout(t);
    }

    const outCt = r.headers.get("content-type");
    if (outCt) res.setHeader("Content-Type", outCt);

    let text;
    try {
      text = await r.text();
    } catch (e) {
      res.status(502);
      res.setHeader("Content-Type", "application/json");
      res.send(
        JSON.stringify({
          ok: false,
          error: "quote_proxy_body_read_failed",
          message: String(e && e.message ? e.message : e).slice(0, 200),
        })
      );
      return;
    }
    res.status(r.status);
    res.send(text);
  } catch (e) {
    if (res.headersSent) return;
    res.status(502);
    res.setHeader("Content-Type", "application/json");
    res.send(
      JSON.stringify({
        ok: false,
        error: "quote_proxy_error",
        message: String(e && e.message ? e.message : e).slice(0, 200),
      })
    );
  }
}

module.exports = { forwardQuoteProxy };
