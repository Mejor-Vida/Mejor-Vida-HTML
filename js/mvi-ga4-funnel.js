/**
 * GA4 conversion funnel events (Mejor Vida quote flow).
 * Funnel: page_view → quote_cta_clicked → form_steps_completed → quote_submitted → qualify_lead
 * Booking: appointment_booked → close_convert_lead (Google Ads primary conversions)
 */
(function (global) {
  var formStepsTracked = false;

  function track(eventName, params) {
    if (typeof gtag !== "function") return;
    gtag("event", eventName, params || {});
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

  global.MviGa4Funnel = {
    track: track,
    trackQuoteCtaClicked: trackQuoteCtaClicked,
    trackFormStepsCompleted: trackFormStepsCompleted,
    trackQuoteSubmitted: trackQuoteSubmitted,
    trackCloseConvertLead: trackCloseConvertLead,
    bindQuoteCtaClicks: bindQuoteCtaClicks,
    resetFormStepsCompleted: function () {
      formStepsTracked = false;
    },
  };

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", bindQuoteCtaClicks);
  } else {
    bindQuoteCtaClicks();
  }
})(typeof window !== "undefined" ? window : globalThis);
