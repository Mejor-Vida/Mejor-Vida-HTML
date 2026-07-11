/**
 * GA4 conversion funnel events (Mejor Vida quote flow).
 * Funnel: page_view → quote_cta_clicked → form_steps_completed → quote_submitted → qualify_lead
 * Booking: appointment_booked → close_convert_lead (Google Ads primary conversions)
 */
(function (global) {
  var formStepsTracked = false;

  function track(eventName, params) {
    if (typeof gtag === "function") {
      gtag("event", eventName, params || {});
      return;
    }
    if (global.MVIFunnelTrack && typeof global.MVIFunnelTrack.mirrorGa4 === "function") {
      global.MVIFunnelTrack.mirrorGa4(eventName, params || {}, { surface: "website" });
    }
  }

  function isQuotePagePath(pathname) {
    return /\/quote\.html$/.test(pathname || "");
  }

  function isQuoteHref(href) {
    if (!href || href.charAt(0) === "#") return false;
    try {
      var url = new URL(href, global.location.href);
      return isQuotePagePath(url.pathname);
    } catch (e) {
      return /(^|\/)quote\.html(\?|#|$)/.test(href);
    }
  }

  function ctaLocation(el) {
    if (!el) return "page";
    if (el.classList.contains("btn-see-prices") || el.closest(".header-actions")) return "header";
    if (el.classList.contains("hero-quote-bubble-link") || el.closest("#home, .hero-two-tone")) {
      return "hero";
    }
    if (el.closest("footer, .site-footer")) return "footer";
    if (el.closest(".mobile-menu")) return "mobile_menu";
    if (el.closest('[data-lf-objective="quote"]')) return "landing_objective";
    return "page";
  }

  function trackQuoteCtaClicked(location, extra) {
    var payload = { link_location: location || "page" };
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        payload[key] = extra[key];
      });
    }
    try {
      payload.page_path = global.location.pathname;
    } catch (ePath) {}
    track("quote_cta_clicked", payload);
  }

  function trackFormStepsCompleted(source, extra) {
    if (formStepsTracked) return;
    formStepsTracked = true;
    var payload = { form_source: source || "nebraska_quote_wizard" };
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        payload[key] = extra[key];
      });
    }
    try {
      payload.page_path = global.location.pathname;
    } catch (ePath) {}
    track("form_steps_completed", payload);
  }

  var formStartedTracked = false;

  function trackFormStarted(extra) {
    if (formStartedTracked) return;
    formStartedTracked = true;
    var payload = { form_source: "nebraska_quote_wizard" };
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        payload[key] = extra[key];
      });
    }
    try {
      payload.page_path = global.location.pathname;
    } catch (ePath) {}
    track("form_started", payload);
  }

  function trackQuoteSubmitted(extra) {
    var payload = extra || {};
    try {
      if (!payload.page_path) payload.page_path = global.location.pathname;
    } catch (ePath) {}
    track("quote_submitted", payload);
    track("qualify_lead", payload);
  }

  function trackCloseConvertLead(extra) {
    var payload = extra || {};
    try {
      if (!payload.page_path) payload.page_path = global.location.pathname;
    } catch (ePath) {}
    track("close_convert_lead", payload);
  }

  function bindQuoteCtaClicks() {
    if (global.document.documentElement.getAttribute("data-mvi-ga4-cta-bound") === "1") {
      return;
    }
    global.document.documentElement.setAttribute("data-mvi-ga4-cta-bound", "1");
    global.document.addEventListener(
      "click",
      function (ev) {
        if (isQuotePagePath(global.location.pathname)) return;
        var el = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
        if (!el) return;
        var href = el.getAttribute("href") || "";
        if (!isQuoteHref(href)) return;
        trackQuoteCtaClicked(ctaLocation(el));
      },
      true
    );
  }

  function isWhatsAppHref(href) {
    return /wa\.me\/|api\.whatsapp\.com\/|whatsapp:/i.test(String(href || ""));
  }

  function bindWhatsAppClicks() {
    if (global.document.documentElement.getAttribute("data-mvi-ga4-wa-bound") === "1") {
      return;
    }
    global.document.documentElement.setAttribute("data-mvi-ga4-wa-bound", "1");
    global.document.addEventListener(
      "click",
      function (ev) {
        var el = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
        if (!el) return;
        var href = el.getAttribute("href") || "";
        if (!isWhatsAppHref(href)) return;
        var location = "header";
        if (el.closest("footer, .site-footer")) location = "footer";
        else if (el.closest(".mobile-menu")) location = "mobile_menu";
        track("whatsapp_clicked", { location: location, page_path: global.location.pathname });
      },
      true
    );
  }

  function bindScheduleLinkClicks() {
    if (global.document.documentElement.getAttribute("data-mvi-ga4-sched-bound") === "1") {
      return;
    }
    global.document.documentElement.setAttribute("data-mvi-ga4-sched-bound", "1");
    global.document.addEventListener(
      "click",
      function (ev) {
        var el = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
        if (!el) return;
        var href = el.getAttribute("href") || "";
        if (!/(^|\/)schedule-julie\.html(\?|#|$)/.test(href)) return;
        track("schedule_click", { location: "nav_link", page_path: global.location.pathname });
      },
      true
    );
  }

  function bindBioLinkClicks() {
    if (global.document.documentElement.getAttribute("data-mvi-ga4-bio-bound") === "1") {
      return;
    }
    global.document.documentElement.setAttribute("data-mvi-ga4-bio-bound", "1");
    global.document.addEventListener(
      "click",
      function (ev) {
        var el = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
        if (!el) return;
        var href = el.getAttribute("href") || "";
        if (!/(^|\/)about-julie\.html(\?|#|$)/.test(href)) return;
        track("agent_card_clicked", { location: "nav_link", page_path: global.location.pathname });
      },
      true
    );
  }

  function bindCalculatorLinkClicks() {
    if (global.document.documentElement.getAttribute("data-mvi-ga4-calc-bound") === "1") {
      return;
    }
    global.document.documentElement.setAttribute("data-mvi-ga4-calc-bound", "1");
    global.document.addEventListener(
      "click",
      function (ev) {
        var el = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
        if (!el) return;
        var href = el.getAttribute("href") || "";
        if (!/(^|\/)final-expense-estimator\.html(\?|#|$)/.test(href)) return;
        track("calculator_click", { location: "nav_link", page_path: global.location.pathname });
      },
      true
    );
  }

  function initPageViewEvents() {
    try {
      var path = global.location.pathname || "";
      if (/\/about-julie\.html$/i.test(path)) {
        track("agent_card_clicked", { location: "bio_page_view", page_path: path });
      }
      if (/\/schedule-julie\.html$/i.test(path)) {
        track("schedule_click", { location: "schedule_page", page_path: path });
        track("schedule_modal_opened", { location: "schedule_page", page_path: path });
      }
      if (/\/final-expense-estimator\.html$/i.test(path)) {
        track("calculator_click", { location: "fe_calculator_page", page_path: path });
      }
    } catch (ePage) {}
  }

  function trackQuoteStepCompleted(stepName, extra) {
    var payload = { step_name: stepName, form_source: "nebraska_quote_wizard" };
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        payload[key] = extra[key];
      });
    }
    try {
      payload.page_path = global.location.pathname;
    } catch (ePath) {}
    track("step_completed", payload);
  }

  function bindSiteFunnelEvents() {
    bindQuoteCtaClicks();
    bindWhatsAppClicks();
    bindScheduleLinkClicks();
    bindBioLinkClicks();
    bindCalculatorLinkClicks();
    initPageViewEvents();
  }

  global.MviGa4Funnel = {
    track: track,
    trackQuoteCtaClicked: trackQuoteCtaClicked,
    trackFormStepsCompleted: trackFormStepsCompleted,
    trackFormStarted: trackFormStarted,
    trackQuoteSubmitted: trackQuoteSubmitted,
    trackCloseConvertLead: trackCloseConvertLead,
    trackQuoteStepCompleted: trackQuoteStepCompleted,
    bindQuoteCtaClicks: bindQuoteCtaClicks,
    bindSiteFunnelEvents: bindSiteFunnelEvents,
    resetFormStepsCompleted: function () {
      formStepsTracked = false;
    },
  };

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", bindSiteFunnelEvents);
  } else {
    bindSiteFunnelEvents();
  }
})(typeof window !== "undefined" ? window : globalThis);
