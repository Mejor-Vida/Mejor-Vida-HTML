/**
 * HubSpot meeting confirmation page — posts booking payload to MVI + optional Make.com webhook.
 */
(function () {
  "use strict";

  var MAKE_WEBHOOK_URL =
    typeof window.__MVI_MAKE_APPOINTMENT_WEBHOOK__ === "string"
      ? window.__MVI_MAKE_APPOINTMENT_WEBHOOK__.trim()
      : "";

  var API_URL = "/api/webhooks/appointment";

  function pickParam(params, keys) {
    for (var i = 0; i < keys.length; i++) {
      var v = params.get(keys[i]);
      if (v && String(v).trim() && !/^\{\{.*\}\}$/.test(v)) return String(v).trim();
    }
    return "";
  }

  function formatMeetingTime(raw) {
    if (!raw) return "";
    var ms = Date.parse(raw);
    if (Number.isNaN(ms)) return raw;
    try {
      return new Intl.DateTimeFormat("es-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(ms));
    } catch (_e) {
      return raw;
    }
  }

  function buildPayload(params) {
    var startTime = pickParam(params, [
      "startTime",
      "start_time",
      "appointmentStart",
      "appointment_start",
      "scheduled_at",
      "meeting_start",
      "hs_meeting_start_time",
    ]);
    var meetingTime = pickParam(params, ["meetingTime", "meeting_time", "appointmentTime"]) || formatMeetingTime(startTime);

    return {
      firstName: pickParam(params, ["firstName", "firstname", "first_name"]),
      lastName: pickParam(params, ["lastName", "lastname", "last_name"]),
      email: pickParam(params, ["email"]).toLowerCase(),
      phone: pickParam(params, ["phone", "mobilephone", "mobilePhone"]),
      startTime: startTime,
      meetingTime: meetingTime,
      appointmentStart: startTime,
      meetingTitle: pickParam(params, ["meetingTitle", "meeting_title"]),
      hubspotContactId: pickParam(params, ["hubspotContactId", "contactId", "contact_id"]),
      hubspotMeetingId: pickParam(params, ["hubspotMeetingId", "meetingId", "meeting_id"]),
      source: "hubspot_scheduler",
    };
  }

  function postJson(url, payload) {
    if (!url) return Promise.resolve(null);
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {
      return null;
    });
  }

  function renderConfirmation(payload) {
    var whenEl = document.getElementById("confirmWhen");
    var nameEl = document.getElementById("confirmName");
    if (nameEl) {
      var name = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
      nameEl.textContent = name || payload.email || "";
    }
    if (whenEl) {
      whenEl.textContent = payload.meetingTime || payload.startTime || "";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var payload = buildPayload(params);
    renderConfirmation(payload);

    if (!payload.email && !payload.phone) {
      return;
    }

    // Server already synced via /api/hubspot-meeting-webhook redirect (?processed=1).
    if (pickParam(params, ["processed", "synced"]) === "1") {
      return;
    }

    postJson(API_URL, payload);
    if (MAKE_WEBHOOK_URL) {
      postJson(MAKE_WEBHOOK_URL, payload);
    }

    var redirect = pickParam(params, ["redirect"]);
    if (redirect) {
      try {
        var u = new URL(redirect, window.location.origin);
        var host = u.hostname.toLowerCase();
        if (host === "mejorvidainsurance.com" || host === "www.mejorvidainsurance.com") {
          window.setTimeout(function () {
            window.location.href = u.toString();
          }, 2500);
        }
      } catch (_e) {
        /* ignore invalid redirect */
      }
    }
  });
})();
