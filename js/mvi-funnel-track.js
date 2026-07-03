/**
 * First-party funnel event tracker for CRM diagnostics.
 * Pairs with /api/funnel-event — separate from GA4.
 */
(function (global) {
  "use strict";

  var ACQ_KEY = "mviFunnelAcq";
  var mirrorContext = {};
  var recentTrackKeys = {};
  var DEDUPE_MS = 600;

  var STEP_NAME_MAP = {
    objective_picker: "landing",
    state: "state",
    sex: "sex",
    date_of_birth: "date_of_birth",
    tobacco: "tobacco",
    name: "name",
    email: "email",
    phone: "phone",
    results: "quote_result",
    calc_state: "calc_state",
    calc_ceremony: "calc_ceremony",
    calc_funeral_costs: "calc_funeral_costs",
    calc_household: "calc_household",
    calc_results: "calc_results",
  };

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

  function getSessionId() {
    try {
      var k = "mviSessionClientId";
      var s = sessionStorage.getItem(k);
      if (s && s.length > 0 && s.length < 200) return s;
      var id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "s-" + String(Date.now()) + "-" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(k, id);
      return id;
    } catch (e) {
      return "s-" + String(Date.now());
    }
  }

  function detectDevice() {
    try {
      var w = global.innerWidth || 1024;
      if (w < 640) return "mobile";
      if (w < 1024) return "tablet";
      return "desktop";
    } catch (e) {
      return "desktop";
    }
  }

  function deriveSource(params) {
    var p = params || {};
    var utm = String(p.utm_source || "").toLowerCase();
    if (p.fbclid || utm.indexOf("facebook") >= 0 || utm.indexOf("fb") === 0 || utm === "meta") {
      return "facebook";
    }
    if (p.gclid || utm.indexOf("google") >= 0) return "google";
    try {
      var ref = document.referrer || "";
      if (ref && !/mejorvidainsurance\.com/i.test(ref)) return "organic";
    } catch (eRef) {}
    return "direct";
  }

  function getAcquisition() {
    try {
      var raw = readSession(ACQ_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var acq = { source: "direct" };
    try {
      var sp = new URLSearchParams(global.location.search);
      acq = {
        source: deriveSource({
          utm_source: sp.get("utm_source"),
          fbclid: sp.get("fbclid"),
          gclid: sp.get("gclid"),
        }),
        campaign: sp.get("utm_campaign") || "",
        ad_set: sp.get("utm_term") || "",
        ad_name: sp.get("utm_content") || "",
        keyword: sp.get("utm_term") || sp.get("keyword") || "",
        search_term: sp.get("utm_term") || "",
      };
      Object.keys(acq).forEach(function (k) {
        if (typeof acq[k] === "string") acq[k] = acq[k].slice(0, 500);
      });
    } catch (e2) {}
    writeSession(ACQ_KEY, JSON.stringify(acq));
    return acq;
  }

  function siteApiUrl(path) {
    var origin = global.location.origin || "";
    if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)) return origin + path;
    return path;
  }

  function postEvent(payload) {
    try {
      fetch(siteApiUrl("/api/funnel-event"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  function track(opts) {
    var acq = getAcquisition();
    var dedupeKey = [
      getSessionId(),
      opts.tool,
      opts.step_name,
      opts.event_type,
    ].join("|");
    var now = Date.now();
    if (recentTrackKeys[dedupeKey] && now - recentTrackKeys[dedupeKey] < DEDUPE_MS) {
      return;
    }
    recentTrackKeys[dedupeKey] = now;
    postEvent({
      session_id: getSessionId(),
      source: acq.source,
      campaign: acq.campaign || undefined,
      ad_set: acq.ad_set || undefined,
      ad_name: acq.ad_name || undefined,
      keyword: acq.keyword || undefined,
      search_term: acq.search_term || undefined,
      tool: opts.tool,
      step_name: opts.step_name,
      event_type: opts.event_type,
      page_or_step: opts.page_or_step || global.location.pathname,
      device: detectDevice(),
      event_data: opts.event_data || {},
    });
  }

  function toolFromFlow(flow) {
    if (flow === "calculator") return "calculator";
    if (flow === "schedule") return "schedule";
    return "quote";
  }

  function isLandingPage() {
    try {
      return /gastos-finales-ads|landing-gastos-finales|landing-final-expense/i.test(
        global.location.pathname || ""
      );
    } catch (e) {
      return false;
    }
  }

  function markLeadConverted() {
    writeSession("mviLeadConversionTracked", "1");
  }

  function leadAlreadyTracked() {
    return readSession("mviLeadConversionTracked") === "1";
  }

  function fromGa4(eventName, params, ctx) {
    ctx = ctx || mirrorContext || {};
    var flow = ctx.activeFlow || "quote";
    var tool = toolFromFlow(flow);
    var page = global.location.pathname;

    if (eventName === "objective_selected") {
      var obj = params && params.objective;
      if (obj === "quote") {
        track({ tool: "quote", step_name: "get_quote_click", event_type: "click", page_or_step: page });
      } else if (obj === "calculator") {
        track({ tool: "calculator", step_name: "calculator_click", event_type: "click", page_or_step: page });
      } else if (obj === "schedule") {
        track({ tool: "schedule", step_name: "schedule_click", event_type: "click", page_or_step: page });
      }
      return;
    }

    if (eventName === "step_viewed" && params && params.step_name) {
      var step = STEP_NAME_MAP[params.step_name] || params.step_name;
      if (isLandingPage()) {
        var funnelViewSteps = { landing: true, quote_result: true, calc_results: true };
        if (!funnelViewSteps[step]) return;
      }
      track({ tool: tool, step_name: step, event_type: "step_view", page_or_step: page });
      return;
    }

    if (eventName === "step_completed" && params && params.step_name) {
      var stepC = STEP_NAME_MAP[params.step_name] || params.step_name;
      track({ tool: tool, step_name: stepC, event_type: "step_complete", page_or_step: page });
      return;
    }

    if (eventName === "quote_submitted") {
      if (isLandingPage()) {
        markLeadConverted();
        track({ tool: "quote", step_name: "lead_submitted", event_type: "conversion", page_or_step: page });
      } else {
        markLeadConverted();
        track({ tool: "quote", step_name: "quote_submitted", event_type: "conversion", page_or_step: page });
      }
      return;
    }

    if (eventName === "qualify_lead") {
      if (isLandingPage()) return;
      if (leadAlreadyTracked()) return;
      markLeadConverted();
      track({
        tool: "quote",
        step_name: "qualify_lead",
        event_type: "conversion",
        page_or_step: page,
      });
      return;
    }

    if (eventName === "form_started") {
      track({ tool: "quote", step_name: "form_started", event_type: "step_view", page_or_step: page });
      return;
    }

    if (eventName === "schedule_modal_opened") {
      track({ tool: "schedule", step_name: "calendar_opened", event_type: "step_view", page_or_step: page });
      return;
    }

    if (eventName === "appointment_booked" || eventName === "close_convert_lead") {
      if (eventName === "appointment_booked") {
        track({ tool: "schedule", step_name: "booking_confirmed", event_type: "conversion", page_or_step: page });
      }
      return;
    }

    if (eventName === "agent_card_clicked") {
      track({ tool: "bio", step_name: "bio_click", event_type: "click", page_or_step: page });
      return;
    }

    if (eventName === "whatsapp_clicked") {
      track({ tool: "whatsapp", step_name: "whatsapp_click", event_type: "click", page_or_step: page });
      return;
    }

    if (eventName === "quote_cta_clicked") {
      if (isLandingPage()) return;
      track({ tool: "quote", step_name: "quote_cta_click", event_type: "click", page_or_step: page });
      return;
    }

    if (eventName === "form_steps_completed") {
      if (isLandingPage()) return;
      track({ tool: "quote", step_name: "form_steps_done", event_type: "step_view", page_or_step: page });
      return;
    }
  }

  function setMirrorContext(ctx) {
    mirrorContext = ctx && typeof ctx === "object" ? ctx : {};
  }

  function installGtagMirrorOnce() {
    if (global.__mviFunnelGtagMirrored) return;
    if (typeof global.gtag !== "function") return;
    var originalGtag = global.gtag;
    global.gtag = function () {
      var args = arguments;
      var result = originalGtag.apply(this, args);
      if (args.length >= 2 && String(args[0]) === "event" && args[1]) {
        fromGa4(String(args[1]), args[2] || {}, mirrorContext);
      }
      return result;
    };
    global.__mviFunnelGtagMirrored = true;
  }

  global.MVIFunnelTrack = {
    track: track,
    fromGa4: fromGa4,
    mirrorGa4: fromGa4,
    setMirrorContext: setMirrorContext,
    getAcquisition: getAcquisition,
    getSessionId: getSessionId,
  };

  installGtagMirrorOnce();
  if (!global.__mviFunnelGtagMirrored) {
    var hookAttempts = 0;
    var hookTimer = global.setInterval(function () {
      installGtagMirrorOnce();
      hookAttempts += 1;
      if (global.__mviFunnelGtagMirrored || hookAttempts > 40) {
        global.clearInterval(hookTimer);
      }
    }, 50);
  }
})(typeof window !== "undefined" ? window : this);
