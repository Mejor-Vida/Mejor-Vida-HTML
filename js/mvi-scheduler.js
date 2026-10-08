/**
 * Mejor Vida booking scheduler — calendar month, times, then contact form.
 */
(function () {
  "use strict";

  var API = {
    config: "/api/scheduler/config",
    slots: "/api/scheduler/slots",
    book: "/api/scheduler/book",
  };

  var CONSENT_ES =
    'Sí, acepto recibir mensajes de texto (SMS) de marketing de Mejor Vida Insurance LLC, incluidos seguimiento personalizado de cotización, recordatorios de citas, actualizaciones del estado de la solicitud y mensajes de servicio al cliente. Pueden aplicar tarifas de mensajes y datos. Frecuencia: hasta 1–5 mensajes por semana. Responda STOP para cancelar. Responda AYUDA para obtener ayuda. El consentimiento no es obligatorio para obtener una cotización ni para contratar un seguro. Los SMS se entregan a través de proveedores autorizados, incluido Telnyx. <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">Política de Privacidad</a> · <a href="/terms-service.html" target="_blank" rel="noopener noreferrer">Términos de Servicio</a> · <a href="/sms-optin.html" target="_blank" rel="noopener noreferrer">Programa SMS</a>.';
  var CONSENT_EN =
    'Yes, I agree to receive marketing SMS text messages from Mejor Vida Insurance LLC, including personalized quote follow-up, appointment scheduling reminders, application status updates, and customer service messages. Message and data rates may apply. Frequency: up to 1–5 messages per week. Reply STOP to opt out. Reply HELP for help. Consent is not required to get a quote or purchase insurance. SMS is delivered via authorized providers including Telnyx. <a href="/en/privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> · <a href="/en/terms-service.html" target="_blank" rel="noopener noreferrer">Terms of Service</a> · <a href="/en/sms-optin.html" target="_blank" rel="noopener noreferrer">SMS program</a>.';

  var state = {
    lang: "es",
    bookerTz: "",
    hostTz: "America/Chicago",
    slots: [],
    selected: null,
    selectedYmd: "",
    days: [],
    viewYear: 0,
    viewMonth: 0,
    requireEmail: true,
  };

  function t(key) {
    var es = {
      tz_label: "Horario mostrado en:",
      tz_hint: "Detectamos su zona por su conexión. Cámbiela si no es correcta.",
      pick_day: "Elija un día del calendario",
      pick_time: "Elija una hora",
      no_slots: "No hay horarios ese día. Pruebe otro día.",
      first_name: "Nombre",
      phone: "Teléfono",
      email: "Correo electrónico",
      confirm: "Confirmar cita",
      success: "¡Listo! Su cita quedó agendada. Revise su correo para la confirmación.",
      loading: "Cargando horarios…",
      your_time: "Su hora:",
      prev_month: "Mes anterior",
      next_month: "Mes siguiente",
      enter_details: "Sus datos de contacto",
    };
    var en = {
      tz_label: "Times shown in:",
      tz_hint: "We guessed your zone from your connection. Change it if needed.",
      pick_day: "Pick a day on the calendar",
      pick_time: "Pick a time",
      no_slots: "No times that day. Try another day.",
      first_name: "First name",
      phone: "Phone",
      email: "Email",
      confirm: "Confirm appointment",
      success: "You're booked! Check your email for confirmation.",
      loading: "Loading times…",
      your_time: "Your time:",
      prev_month: "Previous month",
      next_month: "Next month",
      enter_details: "Your contact details",
    };
    var dict = state.lang === "en" ? en : es;
    return dict[key] || key;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function browserTz() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (_e) {
      return "";
    }
  }

  function fetchJson(url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j && j.error) || "request_failed");
        return j;
      });
    });
  }

  function groupDays(slots) {
    var map = new Map();
    slots.forEach(function (s) {
      var y = s.ymdBooker;
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(s);
    });
    return Array.from(map.entries()).map(function (entry) {
      return { ymd: entry[0], slots: entry[1] };
    });
  }

  function availableYmdSet() {
    var set = {};
    state.days.forEach(function (d) {
      set[d.ymd] = true;
    });
    return set;
  }

  function syncViewMonthFromSelection() {
    if (state.selectedYmd) {
      var p = state.selectedYmd.split("-");
      state.viewYear = Number(p[0]);
      state.viewMonth = Number(p[1]);
      return;
    }
    if (state.days[0]) {
      var p2 = state.days[0].ymd.split("-");
      state.viewYear = Number(p2[0]);
      state.viewMonth = Number(p2[1]);
      return;
    }
    var now = new Date();
    state.viewYear = now.getFullYear();
    state.viewMonth = now.getMonth() + 1;
  }

  function monthTitle(y, m) {
    try {
      return new Intl.DateTimeFormat(state.lang === "en" ? "en-US" : "es-US", {
        month: "long",
        year: "numeric",
        timeZone: state.bookerTz || "UTC",
      }).format(new Date(Date.UTC(y, m - 1, 15, 12)));
    } catch (_e) {
      return y + "-" + m;
    }
  }

  function daysInMonth(y, m) {
    return new Date(y, m, 0).getDate();
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function renderCalendar(container, root) {
    container.innerHTML = "";
    var avail = availableYmdSet();
    var y = state.viewYear;
    var m = state.viewMonth;
    var dim = daysInMonth(y, m);

    var head = el("div", "mvi-scheduler__cal-head");
    var prev = el("button", "mvi-scheduler__cal-nav", "‹");
    prev.type = "button";
    prev.setAttribute("aria-label", t("prev_month"));
    var title = el("span", "mvi-scheduler__cal-title", monthTitle(y, m));
    var next = el("button", "mvi-scheduler__cal-nav", "›");
    next.type = "button";
    next.setAttribute("aria-label", t("next_month"));
    head.appendChild(prev);
    head.appendChild(title);
    head.appendChild(next);
    container.appendChild(head);

    var dowRow = el("div", "mvi-scheduler__cal-dow");
    var dowFmt = new Intl.DateTimeFormat(state.lang === "en" ? "en-US" : "es-US", {
      weekday: "short",
    });
    var refSun = new Date(2023, 0, 1);
    for (var i = 0; i < 7; i++) {
      var d = new Date(refSun);
      d.setDate(refSun.getDate() + i);
      dowRow.appendChild(el("span", "mvi-scheduler__cal-dow-cell", dowFmt.format(d)));
    }
    container.appendChild(dowRow);

    var grid = el("div", "mvi-scheduler__cal-grid");
    var firstDow = new Date(y, m - 1, 1).getDay();
    for (var blank = 0; blank < firstDow; blank++) {
      grid.appendChild(el("span", "mvi-scheduler__cal-cell mvi-scheduler__cal-cell--empty"));
    }
    for (var day = 1; day <= dim; day++) {
      var ymd = y + "-" + pad2(m) + "-" + pad2(day);
      var cell = el("button", "mvi-scheduler__cal-cell");
      cell.type = "button";
      cell.textContent = String(day);
      if (!avail[ymd]) {
        cell.disabled = true;
        cell.classList.add("is-disabled");
      } else {
        if (ymd === state.selectedYmd) cell.classList.add("is-active");
        cell.addEventListener("click", function (picked) {
          return function () {
            state.selectedYmd = picked;
            state.selected = null;
            renderCalendar(container, root);
            renderSlots(root.querySelector(".mvi-scheduler__slots"));
            hideDetails(root);
          };
        }(ymd));
      }
      grid.appendChild(cell);
    }
    container.appendChild(grid);

    prev.addEventListener("click", function () {
      var nm = m - 1;
      var ny = y;
      if (nm < 1) {
        nm = 12;
        ny -= 1;
      }
      state.viewMonth = nm;
      state.viewYear = ny;
      renderCalendar(container, root);
    });
    next.addEventListener("click", function () {
      var nm = m + 1;
      var ny = y;
      if (nm > 12) {
        nm = 1;
        ny += 1;
      }
      state.viewMonth = nm;
      state.viewYear = ny;
      renderCalendar(container, root);
    });
  }

  function hideDetails(root) {
    var details = root.querySelector(".mvi-scheduler__details");
    var conf = root.querySelector(".mvi-scheduler__confirm");
    if (details) details.hidden = true;
    if (conf) {
      conf.hidden = true;
      conf.textContent = "";
    }
  }

  function showDetails(root, slot) {
    var details = root.querySelector(".mvi-scheduler__details");
    var conf = root.querySelector(".mvi-scheduler__confirm");
    if (conf) {
      conf.hidden = false;
      conf.textContent = t("your_time") + " " + slot.labelBooker;
    }
    if (details) details.hidden = false;
  }

  function loadSlots(root) {
    var slotsWrap = root.querySelector(".mvi-scheduler__slots");
    var calWrap = root.querySelector(".mvi-scheduler__calendar");
    slotsWrap.innerHTML = '<p class="mvi-scheduler__loading">' + t("loading") + "</p>";
    var tz = state.bookerTz;
    return fetchJson(API.slots + "?timezone=" + encodeURIComponent(tz)).then(function (data) {
      state.hostTz = data.hostTimezone || state.hostTz;
      state.slots = data.slots || [];
      state.days = groupDays(state.slots);
      if (!state.selectedYmd && state.days[0]) state.selectedYmd = state.days[0].ymd;
      syncViewMonthFromSelection();
      renderCalendar(calWrap, root);
      renderSlots(slotsWrap);
      hideDetails(root);
    });
  }

  function renderSlots(container) {
    container.innerHTML = "";
    if (!state.selectedYmd) {
      container.appendChild(el("p", "mvi-scheduler__hint", t("pick_day")));
      return;
    }
    var day = state.days.find(function (d) {
      return d.ymd === state.selectedYmd;
    });
    if (!day || !day.slots.length) {
      container.appendChild(el("p", "mvi-scheduler__hint", t("no_slots")));
      return;
    }
    day.slots.forEach(function (slot) {
      var btn = el("button", "mvi-scheduler__slot", slot.labelBooker);
      btn.type = "button";
      if (state.selected && state.selected.startUtc === slot.startUtc) {
        btn.classList.add("is-selected");
      }
      btn.addEventListener("click", function () {
        state.selected = slot;
        renderSlots(container);
        showDetails(container.closest(".mvi-scheduler"), slot);
      });
      container.appendChild(btn);
    });
  }

  function consentHtml() {
    var html = state.lang === "en" ? CONSENT_EN : CONSENT_ES;
    return (
      '<div class="form-check mvi-sms-consent-block mb-3">' +
      '<input class="form-check-input" id="sch-sms-consent" type="checkbox"/>' +
      '<label class="form-check-label" for="sch-sms-consent">' +
      '<span class="mvi-sms-consent-scroll" tabindex="0">' +
      html +
      "</span></label></div>"
    );
  }

  function buildForm(detailsRoot) {
    var form = el("div", "mvi-scheduler__form");
    form.innerHTML =
      "<h3 class=\"mvi-scheduler__form-title\">" +
      t("enter_details") +
      "</h3>" +
      "<label>" +
      t("first_name") +
      '</label><input name="firstName" required autocomplete="given-name" />' +
      "<label>" +
      t("phone") +
      '</label><input name="phone" required type="tel" autocomplete="tel" />' +
      "<label>" +
      t("email") +
      '</label><input name="email" type="email" required autocomplete="email" />' +
      consentHtml();
    var err = el("p", "mvi-scheduler__error");
    err.hidden = true;
    var submit = el("button", "mvi-scheduler__submit", t("confirm"));
    submit.type = "button";
    submit.addEventListener("click", function () {
      var root = detailsRoot.closest(".mvi-scheduler");
      var mountRoot = root.parentElement;
      err.hidden = true;
      if (!state.selected) {
        err.textContent = t("pick_time");
        err.hidden = false;
        return;
      }
      var fd = new FormData(form);
      var firstName = String(fd.get("firstName") || "").trim();
      var phone = String(fd.get("phone") || "").trim();
      var email = String(fd.get("email") || "").trim();
      if (!firstName || !phone || !email) {
        err.textContent = state.lang === "en" ? "Please fill in all fields." : "Complete todos los campos.";
        err.hidden = false;
        return;
      }
      var payload = {
        startUtc: state.selected.startUtc,
        endUtc: state.selected.endUtc,
        bookerTimezone: state.bookerTz,
        firstName: firstName,
        phone: phone,
        email: email,
        language: state.lang === "en" ? "english" : "spanish",
        marketingOptIn: !!document.getElementById("sch-sms-consent") && document.getElementById("sch-sms-consent").checked,
      };
      if (window.MVIConsentCapture && window.MVIConsentCapture.attachToPayload) {
        window.MVIConsentCapture.attachToPayload(payload, "sch-sms-consent");
      }
      submit.disabled = true;
      fetchJson(API.book, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          mountRoot.innerHTML =
            '<div class="mvi-scheduler__confirm mvi-scheduler__confirm--success">' +
            t("success") +
            "<br><br>" +
            (res.labels && res.labels.booker ? res.labels.booker : "") +
            "</div>";
          if (typeof gtag === "function") {
            gtag("event", "appointment_booked", { location: "mvi_scheduler" });
          }
        })
        .catch(function (e) {
          err.textContent = e.message || "Error";
          err.hidden = false;
          submit.disabled = false;
        });
    });
    detailsRoot.appendChild(form);
    detailsRoot.appendChild(err);
    detailsRoot.appendChild(submit);
  }

  function mount(container) {
    if (!container) return;
    state.lang = container.getAttribute("data-lang") === "en" ? "en" : "es";

    var root = el("div", "mvi-scheduler");
    var tzRow = el("div", "mvi-scheduler__tz");
    tzRow.appendChild(el("label", "", t("tz_label")));
    var select = document.createElement("select");
    select.setAttribute("aria-label", t("tz_label"));
    tzRow.appendChild(select);
    root.appendChild(tzRow);
    root.appendChild(el("p", "mvi-scheduler__hint", t("tz_hint")));
    root.appendChild(el("p", "mvi-scheduler__hint mvi-scheduler__hint--strong", t("pick_day")));
    root.appendChild(el("div", "mvi-scheduler__calendar"));
    root.appendChild(el("p", "mvi-scheduler__hint mvi-scheduler__hint--strong", t("pick_time")));
    root.appendChild(el("div", "mvi-scheduler__slots"));
    root.appendChild(el("div", "mvi-scheduler__confirm"));
    var details = el("div", "mvi-scheduler__details");
    details.hidden = true;
    root.appendChild(details);
    root.querySelector(".mvi-scheduler__confirm").hidden = true;

    container.innerHTML = "";
    container.appendChild(root);

    buildForm(details);

    fetchJson(API.config + "?tz=" + encodeURIComponent(browserTz()))
      .then(function (cfg) {
        state.requireEmail = cfg.requireEmail !== false;
        (cfg.timezoneOptions || []).forEach(function (opt) {
          var o = document.createElement("option");
          o.value = opt.id;
          o.textContent = opt.label;
          select.appendChild(o);
        });
        state.bookerTz = cfg.suggestedBookerTimezone || browserTz() || "America/Chicago";
        select.value = state.bookerTz;
        select.addEventListener("change", function () {
          state.bookerTz = select.value;
          state.selected = null;
          state.selectedYmd = "";
          loadSlots(root);
        });
        return loadSlots(root);
      })
      .catch(function () {
        root.querySelector(".mvi-scheduler__slots").textContent = "Scheduler unavailable.";
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    mount(document.getElementById("mvi-scheduler-root"));
  });
})();
