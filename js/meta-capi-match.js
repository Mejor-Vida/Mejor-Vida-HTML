/**
 * Meta CAPI match keys for Spanish FE landing quote sync (fbp, fbc, user agent).
 * Load only on Spanish gastos-finales landings — not EN compliance pages.
 */
(function () {
  "use strict";

  function readCookie(name) {
    try {
      var escaped = name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&");
      var match = document.cookie.match(new RegExp("(?:^|; )" + escaped + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : "";
    } catch (e) {
      return "";
    }
  }

  function fbcFromFbclid(fbclid) {
    var id = String(fbclid || "").trim();
    if (!id) return "";
    return "fb.1." + Date.now() + "." + id.slice(0, 500);
  }

  function collectForLeadSync(originDetail) {
    originDetail = originDetail || {};
    var fbp = readCookie("_fbp").trim();
    var fbc = readCookie("_fbc").trim();
    if (!fbc && originDetail.fbclid) {
      fbc = fbcFromFbclid(originDetail.fbclid);
    }
    var ua =
      typeof navigator !== "undefined" ? String(navigator.userAgent || "").trim() : "";
    var out = {};
    if (fbp) out.metaFbp = fbp.slice(0, 200);
    if (fbc) out.metaFbc = fbc.slice(0, 500);
    if (ua) out.clientUserAgent = ua.slice(0, 1000);
    return out;
  }

  window.MVIMetaCapiMatch = {
    collectForLeadSync: collectForLeadSync,
  };
})();
