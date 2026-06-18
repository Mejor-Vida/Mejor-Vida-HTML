/**
 * When HubSpot Meetings is embedded in an iframe, booking confirmation often
 * stays inside the iframe — the meeting redirect URL / Make webhook never fires.
 * HubSpot emits meetingBookSucceeded via postMessage; we sync to /api/webhooks/appointment.
 */
(function () {
  "use strict";

  var API_URL = "/api/webhooks/appointment";
  var ANALYTICS_URL = "/api/analytics-event";
  var ORIGIN_RE = /^https:\/\/meetings(?:-[a-z0-9]+)?\.hubspot\.com$/i;

  function pickString() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v == null) continue;
      var s = String(v).trim();
      if (s) return s;
    }
    return "";
  }

  function isoFromEvent(ev) {
    if (!ev || typeof ev !== "object") return "";
    var dt = pickString(ev.dateTime, ev.date_time, ev.startTime, ev.start_time);
    if (dt) return dt;
    if (ev.startTimeUtc != null && !Number.isNaN(Number(ev.startTimeUtc))) {
      return new Date(Number(ev.startTimeUtc)).toISOString();
    }
    return pickString(ev.dateString, ev.date_string);
  }

  function buildPayload(data) {
    var mp = data.meetingsPayload || {};
    var br = mp.bookingResponse || {};
    var post = br.postResponse || {};
    var contact = post.contact || {};
    var ev = br.event || post.event || {};

    var email = pickString(contact.email, contact.Email).toLowerCase();
    var startTime = isoFromEvent(ev) || isoFromEvent(post);
    var meetingTime = pickString(ev.dateString, ev.date_string, startTime);

    return {
      firstName: pickString(contact.firstName, contact.firstname, contact.FirstName),
      lastName: pickString(contact.lastName, contact.lastname, contact.LastName),
      email: email,
      phone: pickString(contact.phone, contact.mobilephone, contact.phoneNumber),
      startTime: startTime,
      meetingTime: meetingTime,
      appointmentStart: startTime,
      hubspotMeetingId: pickString(post.meetingId, post.id, mp.formGuid),
      source: "hubspot_scheduler",
    };
  }

  function dedupeKey(payload) {
    return [payload.email, payload.phone, payload.startTime].join("|").toLowerCase();
  }

  function alreadySent(key) {
    try {
      return sessionStorage.getItem("mvi_hs_booking:" + key) === "1";
    } catch (_e) {
      return false;
    }
  }

  function markSent(key) {
    try {
      sessionStorage.setItem("mvi_hs_booking:" + key, "1");
    } catch (_e) {
      /* ignore */
    }
  }

  function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(s || "")
    );
  }

  function siteApiUrl(path) {
    var origin = window.location.origin || "";
    if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)) {
      return "https://www.mejorvidainsurance.com" + path;
    }
    return path;
  }

  function getSessionClientId() {
    try {
      var k = "mviSessionClientId";
      var s = sessionStorage.getItem(k);
      if (s && s.length > 0 && s.length < 200) return s;
      return null;
    } catch (_e) {
      return null;
    }
  }

  function getSessionLeadContext() {
    try {
      var raw = sessionStorage.getItem("mviNebraskaQuoteResult");
      if (!raw) return null;
      var q = JSON.parse(raw);
      if (!q || !q.leadId || !isUuid(q.leadId)) return null;
      return {
        leadId: q.leadId,
        sessionClientId: q.sessionClientId || getSessionClientId(),
      };
    } catch (_e) {
      return null;
    }
  }

  function trackGaEvent(eventName, params) {
    if (typeof gtag !== "function") return;
    gtag("event", eventName, params || {});
  }

  function postCallScheduledIndicated(payload, leadCtx) {
    if (!leadCtx || !isUuid(leadCtx.leadId)) return;

    fetch(siteApiUrl(ANALYTICS_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "call_scheduled_indicated",
        quoteLeadSubmissionId: leadCtx.leadId,
        sessionClientId: leadCtx.sessionClientId || getSessionClientId(),
        data: {
          path: location.pathname,
          source: payload.source || "hubspot_scheduler",
        },
      }),
      keepalive: true,
    }).catch(function () {});
  }

  function postBooking(payload) {
    if (!payload.email && !payload.phone) return false;
    var key = dedupeKey(payload);
    if (alreadySent(key)) return false;
    markSent(key);

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {
      /* allow retry if tab stays open */
      try {
        sessionStorage.removeItem("mvi_hs_booking:" + key);
      } catch (_e2) {
        /* ignore */
      }
    });

    return true;
  }

  function handleMeetingBookSucceeded(data) {
    var payload = buildPayload(data);
    if (!postBooking(payload)) return;

    var analyticsPayload = {
      location: "hubspot_scheduler",
      page_path: location.pathname,
      source: payload.source || "hubspot_scheduler",
    };
    trackGaEvent("appointment_booked", analyticsPayload);
    trackGaEvent("close_convert_lead", analyticsPayload);

    var leadCtx = getSessionLeadContext();
    postCallScheduledIndicated(payload, leadCtx);
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.meetingBookSucceeded !== true) return;
    if (!ORIGIN_RE.test(String(event.origin || ""))) return;

    try {
      handleMeetingBookSucceeded(data);
    } catch (_e) {
      /* ignore malformed payloads */
    }
  });
})();
