/**
 * Meta CAPI match keys for Spanish FE landing quote sync (fbp, fbc, user agent).
 * Load only on Spanish gastos-finales landings — not EN compliance pages.
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

  function fbclidFromUrl() {
    try {
      var v = new URLSearchParams(location.search).get("fbclid");
      return isPlausibleFbclid(v) ? String(v).trim() : "";
    } catch (e) {
      return "";
    }
  }

  /** Real ad clicks are long tokens; preview/placeholder values break Meta attribution. */
  function isPlausibleFbclid(value) {
    var id = String(value || "").trim();
    if (!id || id.length < 20) return false;
    if (/^(fbclid|\{\{fbclid\}\}|test|placeholder)$/i.test(id)) return false;
    return true;
  }

  function isValidFbc(value) {
    var fbc = String(value || "").trim();
    if (!/^fb\.1\.\d+\..+/.test(fbc)) return false;
    var fbclidPart = fbc.replace(/^fb\.1\.\d+\./, "");
    return isPlausibleFbclid(fbclidPart);
  }

  function fbcFromFbclid(fbclid, clickTimeMs) {
    var id = String(fbclid || "").trim();
    if (!isPlausibleFbclid(id)) return "";
    var ts = String(clickTimeMs || readSession("mviFbClickTime") || Date.now());
    return "fb.1." + ts + "." + id;
  }

  function setFbcCookie(fbc) {
    if (!isValidFbc(fbc)) return;
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

  /** Capture fbclid + click timestamp once per session; set _fbc before Pixel/CAPI events. */
  function captureFbClickId() {
    var cookieFbc = readCookie("_fbc").trim();
    if (isValidFbc(cookieFbc)) {
      writeSession("mviMetaFbc", cookieFbc);
      return cookieFbc;
    }

    var fbclid = fbclidFromUrl() || readSession("mviFbclid");
    if (!isPlausibleFbclid(fbclid)) return "";

    var clickTime = readSession("mviFbClickTime");
    if (!clickTime) {
      clickTime = String(Date.now());
      writeSession("mviFbClickTime", clickTime);
      writeSession("mviFbclid", fbclid);
    }

    var fbc = fbcFromFbclid(fbclid, clickTime);
    setFbcCookie(fbc);
    return fbc;
  }

  function resolveFbc(originDetail) {
    originDetail = originDetail || {};
    var fbc = readCookie("_fbc").trim();
    if (!isValidFbc(fbc)) {
      fbc = readSession("mviMetaFbc");
    }
    if (!isValidFbc(fbc)) {
      var fbclid =
        (isPlausibleFbclid(originDetail.fbclid) ? String(originDetail.fbclid).trim() : "") ||
        (isPlausibleFbclid(readSession("mviFbclid")) ? readSession("mviFbclid") : "");
      if (fbclid) {
        fbc = fbcFromFbclid(fbclid, readSession("mviFbClickTime"));
        if (isValidFbc(fbc)) setFbcCookie(fbc);
      }
    }
    return isValidFbc(fbc) ? fbc : "";
  }

  function collectForLeadSync(originDetail) {
    originDetail = originDetail || {};
    var fbp = readCookie("_fbp").trim();
    var fbc = resolveFbc(originDetail);
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
