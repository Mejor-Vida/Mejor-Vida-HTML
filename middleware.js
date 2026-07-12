/**
 * Strict CSP: default-src 'none' + explicit allowlists.
 * - script-src: per-request nonce on inline <script> (no script 'unsafe-inline').
 * - style-src-elem: same nonce on inline <style>; external CSS from self + font/CDN hosts.
 * - style-src-attr 'unsafe-inline': required for Bootstrap, staff UI, and script.js (CSSOM / style="").
 *   Removing it needs replacing those patterns with class-based styling (incremental).
 * - Legacy style-src fallback for browsers without style-src-elem / style-src-attr (still includes
 *   'unsafe-inline' for attributes — scanners may flag until attr/CSSOM is refactored).
 */

function generateCspNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function buildContentSecurityPolicy(nonce) {
  const n = `'nonce-${nonce}'`;
  const styleHosts = "https://fonts.googleapis.com https://cdnjs.cloudflare.com";
  return [
    "default-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    /* blob: — license map modal embeds fetched PDFs via object URL (licencias / licenses). */
    "object-src 'self' blob:",
    /*
     * IMPORTANT — DO NOT MODIFY WITHOUT READING THIS:
     * The following CSP directives are required for the Meta Pixel to work:
     *
     * form-action: must include https://www.facebook.com
     * frame-src: must include https://www.facebook.com
     * connect-src: must include https://www.facebook.com and https://connect.facebook.net
     * script-src: must include https://connect.facebook.net (fbevents.js)
     *
     * Removing these will silently break the Meta Pixel Lead event and
     * Advanced Matching — ads will stop optimizing without any visible error.
     * Last confirmed working: May 2026.
     *
     * GA4 (gtag.js G-K921EG6JWG): script-src needs googletagmanager.com;
     * connect-src needs google-analytics.com / analytics.google.com or events never reach GA4.
     */
    `script-src 'self' ${n} https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://cdn.tailwindcss.com https://connect.facebook.net https://www.googletagmanager.com`,
    `style-src-elem 'self' ${n} ${styleHosts}`,
    "style-src-attr 'unsafe-inline'",
    `style-src 'self' ${n} ${styleHosts} 'unsafe-inline'`,
    "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.facebook.com https://facebook.com https://connect.facebook.net https://*.facebook.com https://*.facebook.net https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com",
    "media-src 'self' https:",
    "frame-src 'self' blob: https://www.facebook.com https://meetings-na2.hubspot.com https://*.hubspot.com https://*.hsforms.com https://docs.google.com",
    "form-action 'self' https://www.facebook.com https://meetings-na2.hubspot.com https://*.hubspot.com",
    "upgrade-insecure-requests",
  ].join("; ");
}

function addNonceToInlineScripts(html, nonce) {
  return html.replace(/<script(\s[^>]*)?>/gi, (full, attrs) => {
    const a = attrs === undefined ? "" : attrs;
    if (/\ssrc\s*=/i.test(a)) return full;
    if (/\snonce\s*=/i.test(a)) return full;
    if (!a) return `<script nonce="${nonce}">`;
    return `<script nonce="${nonce}"${a}>`;
  });
}

function addNonceToInlineStyleTags(html, nonce) {
  return html.replace(/<style(\s[^>]*)?>/gi, (full, attrs) => {
    const a = attrs === undefined ? "" : attrs;
    if (/\snonce\s*=/i.test(a)) return full;
    if (!a) return `<style nonce="${nonce}">`;
    return `<style nonce="${nonce}"${a}>`;
  });
}

function isStaticAssetPath(pathname) {
  return /\.(?:ico|png|jpe?g|gif|webp|svg|css|js|mjs|map|woff2?|woff|ttf|eot|json|xml|txt|pdf|vcf|webmanifest)$/i.test(
    pathname
  );
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (isStaticAssetPath(pathname)) {
    return fetch(request);
  }

  const res = await fetch(request);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text/html")) {
    return res;
  }

  const nonce = generateCspNonce();
  let html;
  try {
    html = await res.text();
  } catch {
    return res;
  }

  let body = addNonceToInlineScripts(html, nonce);
  body = addNonceToInlineStyleTags(body, nonce);
  const headers = new Headers(res.headers);
  headers.set("Content-Security-Policy", buildContentSecurityPolicy(nonce));
  headers.delete("content-length");

  return new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

export const config = {
  // Skip /api/* — proxying API through fetch() caused 5xx during deploys and polling.
  matcher: ["/((?!api/).*)"],
};
