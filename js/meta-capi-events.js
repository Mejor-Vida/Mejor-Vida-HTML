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

  var viewContentSent = false;

  function trackPageView() {
    var eventId = getPageViewEventId();
    if (typeof fbq === "function") {
      fbq("track", "PageView", {}, { eventID: eventId });
    }
    postCapi(buildCapiPayload("PageView", eventId));
  }

  function trackViewContent() {
    if (viewContentSent) return;
    viewContentSent = true;
    var eventId = getViewContentEventId();
    var content = {
      content_type: "product",
      content_name: "final_expense_quote",
      content_category: "insurance",
    };
    if (typeof fbq === "function") {
      fbq("track", "ViewContent", content, { eventID: eventId });
    }
    postCapi(
      buildCapiPayload("ViewContent", eventId, {
        contentName: "final_expense_quote",
      })
    );
  }

  function onLandingStep(step, activeFlow) {
    var flow = activeFlow || "quote";
    if (step === 2 && (flow === "quote" || flow == null)) {
      trackViewContent();
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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
