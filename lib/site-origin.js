/**
 * Restrict browser calls to /api/*-site routes to allowed origins (not a secret — reduces abuse).
 * Env: WEBSITE_ALLOWED_ORIGINS — comma-separated origins, no trailing slash.
 * Default: production www + apex + common local dev ports.
 */

const DEFAULT_ALLOWED =
  "https://www.mejorvidainsurance.com,https://mejorvidainsurance.com,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500,http://localhost:8080,http://127.0.0.1:8080,http://127.0.0.1:4174,http://localhost:4174";

function parseAllowed() {
  const raw = process.env.WEBSITE_ALLOWED_ORIGINS || DEFAULT_ALLOWED;
  const list = raw
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  // Vercel sets VERCEL_URL (no scheme), e.g. mejor-vida-html.vercel.app — allow same-origin fetches from that deployment.
  const vercelHost = String(process.env.VERCEL_URL || "")
    .trim()
    .replace(/^https?:\/\//i, "");
  if (vercelHost) {
    list.push(`https://${vercelHost}`);
    list.push(`http://${vercelHost}`);
  }
  return list;
}

function originMatches(needle, allowedList) {
  if (!needle) return false;
  const n = needle.replace(/\/$/, "");
  return allowedList.some((a) => n === a || n.startsWith(a + "/"));
}

/**
 * @returns {{ ok: true } | { ok: false, status: number, error: string }}
 */
function verifySiteOrigin(req) {
  const host = String(req.headers.host || "")
    .toLowerCase()
    .trim()
    .replace(/\/$/, "");

  let allowed = parseAllowed();
  // Browser Origin can be the stable *.vercel.app project URL while VERCEL_URL may be a per-deploy
  // hostname or unset — always allow the origin implied by the request Host on Vercel.
  if (host.endsWith(".vercel.app")) {
    const protoRaw = String(req.headers["x-forwarded-proto"] || "https").split(",")[0] || "https";
    const proto = protoRaw.trim() === "http" ? "http" : "https";
    allowed = allowed.concat([`${proto}://${host}`, proto === "https" ? `http://${host}` : `https://${host}`]);
  }

  const origin = String(req.headers.origin || "").trim();
  if (origin && originMatches(origin, allowed)) {
    return { ok: true };
  }
  const referer = String(req.headers.referer || "").trim();
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (originMatches(refOrigin, allowed)) {
        return { ok: true };
      }
    } catch (e) {
      /* ignore */
    }
  }
  if (
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return { ok: true };
  }
  return { ok: false, status: 403, error: "Forbidden" };
}

module.exports = { verifySiteOrigin, parseAllowed };
