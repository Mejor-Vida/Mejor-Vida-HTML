/**
 * Staff CRM — Scheduler settings + appointments list.
 */
(function () {
  "use strict";

  var DAY_KEYS = [
    { d: 0, en: "Sunday", es: "Domingo" },
    { d: 1, en: "Monday", es: "Lunes" },
    { d: 2, en: "Tuesday", es: "Martes" },
    { d: 3, en: "Wednesday", es: "Miércoles" },
    { d: 4, en: "Thursday", es: "Jueves" },
    { d: 5, en: "Friday", es: "Viernes" },
    { d: 6, en: "Saturday", es: "Sábado" },
  ];

  function t(key) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key);
    return key;
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  async function api(path, body, opts) {
    return window.StaffCrm.authedApi(path, body, opts);
  }

  function hourToTime(h) {
    var n = parseInt(h, 10);
    if (!Number.isFinite(n)) return "09:00";
    return String(n).padStart(2, "0") + ":00";
  }

  function timeToHour(v) {
    var p = String(v || "").split(":");
    return parseInt(p[0], 10) || 0;
  }

  function renderWorkHours(cfg) {
    var wh = (cfg && cfg.workHours) || {};
    var lang = window.StaffCrmI18n && window.StaffCrmI18n.getLang ? window.StaffCrmI18n.getLang() : "en";
    var rows = DAY_KEYS.map(function (day) {
      var hours = wh[day.d] ?? wh[String(day.d)];
      var on = !!hours;
      var start = on ? hourToTime(hours[0]) : "09:00";
      var end = on ? hourToTime(hours[1]) : "17:00";
      var label = lang === "es" ? day.es : day.en;
      return (
        "<tr data-dow=\"" +
        day.d +
        "\"><td><label><input type=\"checkbox\" class=\"crm-sch-day-on\" " +
        (on ? "checked" : "") +
        " /> " +
        esc(label) +
        "</label></td><td><input type=\"time\" class=\"crm-sch-start\" value=\"" +
        esc(start) +
        "\" " +
        (on ? "" : "disabled") +
        " /></td><td><input type=\"time\" class=\"crm-sch-end\" value=\"" +
        esc(end) +
        "\" " +
        (on ? "" : "disabled") +
        " /></td></tr>"
      );
    });
    return (
      '<table class="crm-scheduler-hours"><thead><tr><th>' +
      esc(t("scheduler_day")) +
      "</th><th>" +
      esc(t("scheduler_start")) +
      "</th><th>" +
      esc(t("scheduler_end")) +
      "</th></tr></thead><tbody>" +
      rows.join("") +
      "</tbody></table>"
    );
  }

  function collectWorkHours(root) {
    var out = {};
    root.querySelectorAll(".crm-scheduler-hours tbody tr").forEach(function (tr) {
      var d = parseInt(tr.getAttribute("data-dow"), 10);
      var on = tr.querySelector(".crm-sch-day-on").checked;
      if (!on) {
        out[d] = null;
        return;
      }
      var start = timeToHour(tr.querySelector(".crm-sch-start").value);
      var end = timeToHour(tr.querySelector(".crm-sch-end").value);
      if (end <= start) end = start + 1;
      out[d] = [start, end];
    });
    return out;
  }

  function renderAppointments(rows) {
    if (!rows || !rows.length) {
      return '<p class="crm-muted">' + esc(t("scheduler_no_appts")) + "</p>";
    }
    var html =
      '<table class="crm-scheduler-appt-table"><thead><tr><th>' +
      esc(t("scheduler_col_when")) +
      "</th><th>" +
      esc(t("scheduler_col_client")) +
      "</th><th>" +
      esc(t("scheduler_col_tz")) +
      "</th><th>" +
      esc(t("scheduler_col_actions")) +
      "</th></tr></thead><tbody>";
    rows.forEach(function (row) {
      var clientLink = row.contact_id
        ? '<a href="#/clients/' + encodeURIComponent(row.contact_id) + '/overview">' + esc(row.name) + "</a>"
        : esc(row.name);
      var calHint = row.calendar_synced
        ? '<span class="crm-muted" title="Google Calendar">GCal</span>'
        : '<span class="crm-scheduler-cal-miss" title="' + esc(t("scheduler_cal_missing")) + '">No GCal</span>';
      var actions =
        row.status === "scheduled"
          ? (!row.calendar_synced
              ? '<button type="button" class="crm-btn crm-btn--sm crm-scheduler-sync" data-appt-id="' +
                esc(row.id) +
                '">' +
                esc(t("scheduler_sync_gcal")) +
                "</button> "
              : "") +
            '<button type="button" class="crm-btn crm-btn--sm crm-scheduler-cancel" data-appt-id="' +
            esc(row.id) +
            '">' +
            esc(t("scheduler_cancel")) +
            "</button>"
          : esc(row.status || "");
      html +=
        "<tr><td><strong>" +
        esc(row.host_label || row.starts_at) +
        "</strong><br><span class=\"crm-muted\">" +
        esc(row.client_label || "") +
        "</span><br>" +
        calHint +
        "</td><td>" +
        clientLink +
        "<br><span class=\"crm-muted\">" +
        esc(row.phone || "") +
        "</span></td><td>" +
        esc(row.booker_timezone || "") +
        "</td><td>" +
        actions +
        "</td></tr>";
    });
    html += "</tbody></table>";
    return html;
  }

  function wireWorkHourToggles(root) {
    root.querySelectorAll(".crm-sch-day-on").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var tr = cb.closest("tr");
        var dis = !cb.checked;
        tr.querySelector(".crm-sch-start").disabled = dis;
        tr.querySelector(".crm-sch-end").disabled = dis;
      });
    });
  }

  /** List HTML is replaced on refresh — delegate clicks so Cancel/Sync keep working. */
  function wireApptListActions(main) {
    var list = main.querySelector("#sch-appt-list");
    if (!list) return;
    if (list.getAttribute("data-appt-actions") === "1") return;
    list.setAttribute("data-appt-actions", "1");
    list.addEventListener("click", function (ev) {
      var syncBtn = ev.target && ev.target.closest ? ev.target.closest(".crm-scheduler-sync") : null;
      var cancelBtn = ev.target && ev.target.closest ? ev.target.closest(".crm-scheduler-cancel") : null;
      var btn = syncBtn || cancelBtn;
      if (!btn || btn.disabled) return;
      var apptId = btn.getAttribute("data-appt-id");
      if (!apptId) return;

      if (syncBtn) {
        btn.disabled = true;
        api("/api/staff/scheduler", { action: "sync_calendar", appointmentId: apptId }, { method: "POST" })
          .then(function () {
            var refresh = document.getElementById("sch-refresh-calls");
            if (refresh) refresh.click();
          })
          .catch(function (e) {
            btn.disabled = false;
            window.alert(e.message || "Error");
          });
        return;
      }

      if (!window.confirm(t("scheduler_cancel_confirm"))) return;
      btn.disabled = true;
      api("/api/staff/scheduler", { action: "cancel", appointmentId: apptId }, { method: "POST" })
        .then(function () {
          var refresh = document.getElementById("sch-refresh-calls");
          if (refresh) refresh.click();
        })
        .catch(function (e) {
          btn.disabled = false;
          window.alert(e.message || "Error");
        });
    });
  }

  async function mount(main) {
    main.innerHTML = '<div class="crm-placeholder">' + esc(t("loading")) + "</div>";
    var data = await api("/api/staff/scheduler");
    var cfg = data.config || {};
    var integ = data.integration || {};

    var calHealth = integ.calendarHealth || {};
    var googleCls = integ.googleCalendar ? "crm-scheduler-status-ok" : "crm-scheduler-status-warn";
    var googleTxt = integ.googleCalendar
      ? t("scheduler_google_ok")
      : calHealth.reason === "calendar_api_disabled"
        ? t("scheduler_google_api_disabled")
        : calHealth.message || t("scheduler_google_missing");
    var enableLink =
      calHealth.enableUrl
        ? '<p><a href="' +
          esc(calHealth.enableUrl) +
          '" target="_blank" rel="noopener">' +
          esc(t("scheduler_google_enable_api")) +
          "</a></p>"
        : "";

    main.innerHTML =
      '<div class="crm-page-head"><h1>' +
      esc(t("scheduler_title")) +
      '</h1><p class="crm-muted">' +
      esc(t("scheduler_sub")) +
      "</p></div>" +
      '<div class="crm-scheduler-grid">' +
      '<div class="crm-card"><h2>' +
      esc(t("scheduler_integration")) +
      "</h2><p class=\"" +
      googleCls +
      '">' +
      esc(googleTxt) +
      "</p>" +
      enableLink +
      '<p><a href="' +
      esc(integ.calendarAuthUrl || "/api/staff/calendar-auth") +
      '" target="_blank" rel="noopener">' +
      esc(t("scheduler_connect_google")) +
      '</a></p><p class="crm-muted"><a href="' +
      esc(integ.publicScheduleUrl || "/schedule-julie.html") +
      '" target="_blank" rel="noopener">' +
      esc(t("scheduler_public_link")) +
      "</a></p></div>" +
      '<div class="crm-card"><h2>' +
      esc(t("scheduler_timing")) +
      "</h2>" +
      '<label class="crm-field-label">' +
      esc(t("scheduler_host_tz")) +
      '</label><input class="crm-input" id="sch-host-tz" value="' +
      esc(cfg.hostTimezone || "America/Chicago") +
      '" />' +
      '<label class="crm-field-label">' +
      esc(t("scheduler_slot_min")) +
      '</label><input class="crm-input" type="number" id="sch-slot" min="15" max="120" value="' +
      esc(cfg.slotMinutes || 30) +
      '" />' +
      '<label class="crm-field-label">' +
      esc(t("scheduler_buffer_min")) +
      '</label><input class="crm-input" type="number" id="sch-buffer" min="0" max="60" value="' +
      esc(cfg.bufferMinutes || 10) +
      '" />' +
      '<label class="crm-field-label">' +
      esc(t("scheduler_min_notice")) +
      '</label><input class="crm-input" type="number" id="sch-notice" min="0" max="168" value="' +
      esc(cfg.minNoticeHours || 3) +
      '" />' +
      '<label class="crm-field-label">' +
      esc(t("scheduler_horizon")) +
      '</label><input class="crm-input" type="number" id="sch-horizon" min="1" max="90" value="' +
      esc(cfg.horizonDays || 21) +
      '" />' +
      '<label class="crm-field-label">' +
      esc(t("scheduler_max_per_day")) +
      '</label><input class="crm-input" type="number" id="sch-max-day" min="1" max="30" value="' +
      esc(cfg.maxBookingsPerDay || 8) +
      '" /></div>' +
      '<div class="crm-card crm-scheduler-grid--full"><h2>' +
      esc(t("scheduler_hours")) +
      "</h2>" +
      renderWorkHours(cfg) +
      "</div>" +
      '<div class="crm-card"><h2>' +
      esc(t("scheduler_rules")) +
      "</h2>" +
      '<label><input type="checkbox" id="sch-req-phone" ' +
      (cfg.requirePhone ? "checked" : "") +
      " /> " +
      esc(t("scheduler_req_phone")) +
      "</label><br>" +
      '<label><input type="checkbox" id="sch-req-email" ' +
      (cfg.requireEmail ? "checked" : "") +
      " /> " +
      esc(t("scheduler_req_email")) +
      "</label><br>" +
      '<label><input type="checkbox" id="sch-ip-tz" ' +
      (cfg.defaultToIpTimezone !== false ? "checked" : "") +
      " /> " +
      esc(t("scheduler_ip_tz")) +
      "</label><br>" +
      '<label><input type="checkbox" id="sch-public" ' +
      (cfg.bookingPagePublic !== false ? "checked" : "") +
      " /> " +
      esc(t("scheduler_public_on")) +
      '</label><label class="crm-field-label" style="margin-top:12px">' +
      esc(t("scheduler_blocked")) +
      '</label><textarea class="crm-input" id="sch-blocked" rows="3" placeholder="2026-12-25">' +
      esc((cfg.blockedDates || []).join("\n")) +
      "</textarea></div>" +
      '<div class="crm-card"><h2>' +
      esc(t("scheduler_copy")) +
      "</h2>" +
      '<label class="crm-field-label">ES</label><input class="crm-input" id="sch-title-es" value="' +
      esc(cfg.confirmationTitleEs || "") +
      '" />' +
      '<label class="crm-field-label">EN</label><input class="crm-input" id="sch-title-en" value="' +
      esc(cfg.confirmationTitleEn || "") +
      '" /></div>' +
      "</div>" +
      '<div style="margin:16px 0"><button type="button" class="crm-btn" id="sch-save">' +
      esc(t("scheduler_save")) +
      '</button><span id="sch-save-status" class="crm-muted" style="margin-left:12px"></span></div>' +
      '<div class="crm-card crm-scheduler-grid--full" id="sch-scheduled-calls">' +
      '<div class="crm-scheduler-calls-head">' +
      '<h2>' +
      esc(t("scheduler_scheduled_calls")) +
      "</h2>" +
      '<button type="button" class="crm-btn crm-btn--secondary" id="sch-refresh-calls">' +
      esc(t("scheduler_scheduled_calls_btn")) +
      "</button></div>" +
      '<p class="crm-muted">' +
      esc(t("scheduler_scheduled_calls_hint")) +
      '</p><div id="sch-appt-list">' +
      renderAppointments(data.appointments) +
      "</div></div>";

    document.getElementById("sch-refresh-calls").addEventListener("click", async function () {
      var list = document.getElementById("sch-appt-list");
      list.innerHTML = '<p class="crm-muted">' + esc(t("loading")) + "</p>";
      try {
        var apptData = await api(
          "/api/staff/scheduler?view=appointments&status=scheduled&order=asc&from=" +
            encodeURIComponent(new Date().toISOString())
        );
        list.innerHTML = renderAppointments(apptData.appointments || []);
      } catch (e) {
        list.innerHTML = '<p class="crm-muted">' + esc(e.message || "Error") + "</p>";
      }
    });

    wireWorkHourToggles(main);
    wireApptListActions(main);

    document.getElementById("sch-save").addEventListener("click", async function () {
      var status = document.getElementById("sch-save-status");
      status.textContent = t("saving");
      var blocked = String(document.getElementById("sch-blocked").value || "")
        .split(/\n+/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      var patch = {
        hostTimezone: document.getElementById("sch-host-tz").value.trim(),
        slotMinutes: parseInt(document.getElementById("sch-slot").value, 10),
        bufferMinutes: parseInt(document.getElementById("sch-buffer").value, 10),
        minNoticeHours: parseInt(document.getElementById("sch-notice").value, 10),
        horizonDays: parseInt(document.getElementById("sch-horizon").value, 10),
        maxBookingsPerDay: parseInt(document.getElementById("sch-max-day").value, 10),
        workHours: collectWorkHours(main),
        requirePhone: document.getElementById("sch-req-phone").checked,
        requireEmail: document.getElementById("sch-req-email").checked,
        defaultToIpTimezone: document.getElementById("sch-ip-tz").checked,
        bookingPagePublic: document.getElementById("sch-public").checked,
        blockedDates: blocked,
        confirmationTitleEs: document.getElementById("sch-title-es").value.trim(),
        confirmationTitleEn: document.getElementById("sch-title-en").value.trim(),
      };
      try {
        await api("/api/staff/scheduler", { config: patch }, { method: "PATCH" });
        status.textContent = t("scheduler_saved");
      } catch (e) {
        status.textContent = e.message || "Error";
      }
    });
  }

  window.StaffCrmScheduler = { mount: mount };
})();
