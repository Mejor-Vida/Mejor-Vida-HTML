/**
 * Meta CAPI match keys for Spanish FE landing quote sync (fbp, fbc, user agent).
 * Load only on Spanish gastos-finales landings — not EN compliance pages.
 *
 * fbc must be the exact _fbc cookie value (fb.1.{clickMs}.{fbclid}) — never
 * transform the fbclid segment or CAPI attribution breaks.
 */
(function () {
  "use strict";

  var FBC_COOKIE_MAX_AGE = 7776000; // 90 days — Meta default for _fbc

  function readCookie(name) {
    try {
      var escaped = name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&");
      var match = document.cookie.match(new RegExp("(?:^|; )" + escaped + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : "";
    } catch (e) {
      return "";
    }
  }

  function readSession(key) {
    try {
      return sessionStorage.getItem(key) || "";
    } catch (e) {
      return "";
    }
  }

  function writeSession(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {}
  }

  function hasFbcShape(value) {
    return /^fb\.1\.\d+\..+/.test(String(value || "").trim());
  }

  function isPlaceholderFbclid(value) {
    var id = String(value || "");
    return /^(fbclid|\{\{fbclid\}\}|test|placeholder)$/i.test(id);
  }

  function rawFbclidFromUrl() {
    try {
      var v = new URLSearchParams(location.search).get("fbclid");
      if (v == null || v === "" || isPlaceholderFbclid(v)) return "";
      return String(v);
    } catch (e) {
      return "";
    }
  }

  function fbclidFromFbc(fbc) {
    var match = String(fbc || "").trim().match(/^fb\.1\.\d+\.(.+)$/);
    return match ? match[1] : "";
  }

  function fbcFromFbclid(fbclid, clickTimeMs) {
    if (!fbclid || isPlaceholderFbclid(fbclid)) return "";
    var ts = String(clickTimeMs || Date.now());
    return "fb.1." + ts + "." + fbclid;
  }

  function setFbcCookie(fbc) {
    if (!hasFbcShape(fbc)) return;
    try {
      document.cookie =
        "_fbc=" +
        encodeURIComponent(fbc) +
        "; path=/; max-age=" +
        FBC_COOKIE_MAX_AGE +
        "; samesite=lax";
      writeSession("mviMetaFbc", fbc);
    } catch (e) {}
  }

  function rememberFbclidClick(fbclid) {
    var stored = readSession("mviFbclid");
    var clickTime = readSession("mviFbClickTime");
    if (stored && stored !== fbclid) {
      clickTime = "";
    }
    if (!clickTime) {
      clickTime = String(Date.now());
      writeSession("mviFbClickTime", clickTime);
    }
    writeSession("mviFbclid", fbclid);
    return clickTime;
  }

  /** Prefer Meta Pixel's _fbc; only seed the cookie when missing. */
  function captureFbClickId() {
    var cookieFbc = readCookie("_fbc").trim();
    if (hasFbcShape(cookieFbc)) {
      writeSession("mviMetaFbc", cookieFbc);
      var cookieFbclid = fbclidFromFbc(cookieFbc);
      if (cookieFbclid) writeSession("mviFbclid", cookieFbclid);
      return cookieFbc;
    }

    var fbclid = rawFbclidFromUrl() || readSession("mviFbclid");
    if (!fbclid) return "";

    var clickTime = rememberFbclidClick(fbclid);
    var fbc = fbcFromFbclid(fbclid, clickTime);
    setFbcCookie(fbc);
    return fbc;
  }

  function resolveFbc() {
    captureFbClickId();

    var fbc = readCookie("_fbc").trim();
    if (hasFbcShape(fbc)) {
      writeSession("mviMetaFbc", fbc);
      return fbc;
    }

    fbc = readSession("mviMetaFbc").trim();
    if (hasFbcShape(fbc)) return fbc;

    return "";
  }

  function collectForLeadSync() {
    var fbp = readCookie("_fbp").trim();
    var fbc = resolveFbc();
    var ua =
      typeof navigator !== "undefined" ? String(navigator.userAgent || "").trim() : "";
    var out = {};
    if (fbp) out.metaFbp = fbp.slice(0, 200);
    if (fbc) out.metaFbc = fbc;
    if (ua) out.clientUserAgent = ua.slice(0, 1000);
    return out;
  }

  captureFbClickId();

  window.MVIMetaCapiMatch = {
    collectForLeadSync: collectForLeadSync,
    captureFbClickId: captureFbClickId,
  };
})();
