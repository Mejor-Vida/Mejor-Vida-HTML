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
      return v ? String(v).trim() : "";
    } catch (e) {
      return "";
    }
  }

  function isValidFbc(value) {
    return /^fb\.1\.\d+\..+/.test(String(value || "").trim());
  }

  function fbcFromFbclid(fbclid, clickTimeMs) {
    var id = String(fbclid || "").trim();
    if (!id) return "";
    var ts = String(clickTimeMs || readSession("mviFbClickTime") || Date.now());
    return "fb.1." + ts + "." + id.slice(0, 500);
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
    if (!fbclid) return "";

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
      var fbclid = String(originDetail.fbclid || "").trim() || readSession("mviFbclid");
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
    if (fbc) out.metaFbc = fbc.slice(0, 500);
    if (ua) out.clientUserAgent = ua.slice(0, 1000);
    return out;
  }

  captureFbClickId();

  window.MVIMetaCapiMatch = {
    collectForLeadSync: collectForLeadSync,
    captureFbClickId: captureFbClickId,
  };
})();
