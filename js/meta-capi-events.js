/**
 * Meta Pixel + CAPI — PageView (landing) and ViewContent (quote section).
 * Spanish gastos-finales landings only. Pairs browser eventID with server event_id.
 */
(function () {
  "use strict";

  var IS_EN =
    document.documentElement.lang === "en" ||
    document.body.getAttribute("data-lf-lang") === "en";
  if (IS_EN) return;

  var path = "";
  try {
    path = location.pathname || "";
  } catch (e) {}
  if (path.indexOf("gastos-finales-ads") === -1) return;

  var STORAGE_KEYS = {
    email: "mviLandingEmail",
    phone: "mviLandingPhone",
    firstName: "mviLandingFirstName",
    lastName: "mviLandingLastName",
    sex: "mviLandingSex",
    state: "mviLandingState",
  };

  function siteApiUrl(apiPath) {
    var origin = window.location.origin || "";
    if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)) {
      return origin + apiPath;
    }
    return apiPath;
  }

  function readStorage(key, generator) {
    try {
      var existing = sessionStorage.getItem(key);
      if (existing && existing.length > 0 && existing.length < 200) return existing;
      var created = generator();
      sessionStorage.setItem(key, created);
      return created;
    } catch (e) {
      return generator();
    }
  }

  function readSessionValue(key) {
    try {
      var value = sessionStorage.getItem(key);
      return value && value.length > 0 ? value : "";
    } catch (e) {
      return "";
    }
  }

  function newEventId(prefix) {
    var id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()) + "-" + Math.random().toString(36).slice(2, 10);
    return prefix + id;
  }

  function getSessionClientId() {
    return readStorage("mviSessionClientId", function () {
      return typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "s-" + String(Date.now()) + "-" + Math.random().toString(36).slice(2, 10);
    });
  }

  function getPageViewEventId() {
    return readStorage("mviMetaPageViewEventId", function () {
      return newEventId("pv-");
    });
  }

  function getViewContentEventId() {
    return readStorage("mviMetaViewContentEventId", function () {
      return newEventId("vc-");
    });
  }

  function normalizePhoneForPayload(phone) {
    var digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) return "+1" + digits;
    if (digits.length === 11 && digits.charAt(0) === "1") return "+" + digits;
    return String(phone || "").trim();
  }

  function collectLeadHints(leadHints) {
    var hints = {};
    if (leadHints && typeof leadHints === "object") {
      Object.keys(leadHints).forEach(function (key) {
        if (leadHints[key] != null && String(leadHints[key]).trim()) {
          hints[key] = String(leadHints[key]).trim();
        }
      });
    }
    var email = hints.email || readSessionValue(STORAGE_KEYS.email);
    var phone = hints.phone || readSessionValue(STORAGE_KEYS.phone);
    var firstName = hints.firstName || readSessionValue(STORAGE_KEYS.firstName);
    var lastName = hints.lastName || readSessionValue(STORAGE_KEYS.lastName);
    var sex = hints.sex || readSessionValue(STORAGE_KEYS.sex);
    var state = hints.state || readSessionValue(STORAGE_KEYS.state);
    if (email) hints.email = email.slice(0, 320);
    if (phone) hints.phone = normalizePhoneForPayload(phone).slice(0, 32);
    if (firstName) hints.firstName = firstName.slice(0, 120);
    if (lastName) hints.lastName = lastName.slice(0, 120);
    if (sex) hints.sex = sex.slice(0, 16);
    if (state) hints.state = state.slice(0, 8);
    return hints;
  }

  function collectOriginDetail() {
    var o = {};
    try {
      var p = new URLSearchParams(location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach(
        function (key) {
          var v = p.get(key);
          if (v) o[key] = v.slice(0, 500);
        }
      );
      o.page_path = (location.pathname + location.search).slice(0, 2000);
      if (document.referrer) o.referrer = document.referrer.slice(0, 2000);
    } catch (e2) {}
    return o;
  }

  function buildCapiPayload(eventName, eventId, extra) {
    var originDetail = collectOriginDetail();
    var payload = {
      eventName: eventName,
      eventId: eventId,
      sessionClientId: getSessionClientId(),
      originDetail: originDetail,
      lang: "es",
    };
    if (extra && typeof extra === "object") {
      Object.keys(extra).forEach(function (k) {
        payload[k] = extra[k];
      });
    }
    if (window.MVIMetaCapiMatch && typeof window.MVIMetaCapiMatch.collectForLeadSync === "function") {
      var match = window.MVIMetaCapiMatch.collectForLeadSync(originDetail);
      if (match.metaFbp) payload.metaFbp = match.metaFbp;
      if (match.metaFbc) payload.metaFbc = match.metaFbc;
      if (match.clientUserAgent) payload.clientUserAgent = match.clientUserAgent;
    }
    return payload;
  }

  function postCapi(payload) {
    try {
      return fetch(siteApiUrl("/api/meta-capi-event"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (e) {
      return Promise.resolve(null);
    }
  }

  var viewContentPixelSent = false;
  var viewContentCapiSent = false;

  function viewContentCustomData() {
    return {
      content_type: "product",
      content_name: "final_expense_quote",
      content_category: "insurance",
    };
  }

  function trackPageView() {
    var eventId = getPageViewEventId();
    if (typeof fbq === "function") {
      fbq("track", "PageView", {}, { eventID: eventId });
    }
    postCapi(buildCapiPayload("PageView", eventId));
  }

  function sendViewContentCapi(leadHints) {
    if (viewContentCapiSent) return;
    var hints = collectLeadHints(leadHints);
    if (!hints.email && !hints.phone) return;
    viewContentCapiSent = true;
    var eventId = getViewContentEventId();
    postCapi(
      buildCapiPayload("ViewContent", eventId, {
        contentName: "final_expense_quote",
        email: hints.email || undefined,
        phone: hints.phone || undefined,
        firstName: hints.firstName || undefined,
        lastName: hints.lastName || undefined,
        sex: hints.sex || undefined,
        state: hints.state || undefined,
      })
    );
  }

  function trackViewContentPixel() {
    if (viewContentPixelSent) return;
    viewContentPixelSent = true;
    var eventId = getViewContentEventId();
    if (typeof fbq === "function") {
      fbq("track", "ViewContent", viewContentCustomData(), { eventID: eventId });
    }
  }

  function trackViewContent(leadHints) {
    trackViewContentPixel();
    sendViewContentCapi(leadHints);
  }

  function onLandingStep(step, activeFlow, leadHints) {
    var flow = activeFlow || "quote";
    if (flow !== "quote" && flow != null) return;

    if (step === 2) {
      trackViewContentPixel();
      return;
    }

    if (step >= 12 && step <= 14) {
      trackViewContentPixel();
      sendViewContentCapi(leadHints);
    }
  }

  function init() {
    if (typeof fbq !== "function") {
      window.setTimeout(init, 50);
      return;
    }
    trackPageView();
  }

  window.MVIMetaCapiEvents = {
    trackPageView: trackPageView,
    trackViewContent: trackViewContent,
    onLandingStep: onLandingStep,
    getPageViewEventId: getPageViewEventId,
    getViewContentEventId: getViewContentEventId,
    getSessionClientId: getSessionClientId,
    collectLeadHints: collectLeadHints,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
