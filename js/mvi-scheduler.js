/**
 * Mejor Vida booking scheduler — client TZ (IP hint + picker), slots, CRM + Google.
 */
(function () {
  "use strict";

  var API = {
    config: "/api/scheduler/config",
    slots: "/api/scheduler/slots",
    book: "/api/scheduler/book",
  };

  var state = {
    lang: "es",
    bookerTz: "",
    hostTz: "America/Chicago",
    slots: [],
    selected: null,
    selectedYmd: "",
    days: [],
  };

  function t(key) {
    var es = {
      tz_label: "Horario mostrado en:",
      tz_hint: "Detectamos su zona por su conexión. Cámbiela si no es correcta.",
      pick_day: "Elija un día",
      pick_time: "Elija una hora",
      no_slots: "No hay horarios ese día. Pruebe otro día.",
      first_name: "Nombre",
      phone: "Teléfono",
      email: "Correo (opcional)",
      confirm: "Confirmar cita",
      success: "¡Listo! Su cita quedó agendada.",
      loading: "Cargando horarios…",
      your_time: "Su hora:",
    };
    var en = {
      tz_label: "Times shown in:",
      tz_hint: "We guessed your zone from your connection. Change it if needed.",
      pick_day: "Pick a day",
      pick_time: "Pick a time",
      no_slots: "No times that day. Try another day.",
      first_name: "First name",
      phone: "Phone",
      email: "Email (optional)",
      confirm: "Confirm appointment",
      success: "You're booked!",
      loading: "Loading times…",
      your_time: "Your time:",
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

  function loadSlots(root) {
    var slotsWrap = root.querySelector(".mvi-scheduler__slots");
    var daysWrap = root.querySelector(".mvi-scheduler__days");
    slotsWrap.innerHTML = '<p class="mvi-scheduler__loading">' + t("loading") + "</p>";
    var tz = state.bookerTz;
    return fetchJson(API.slots + "?timezone=" + encodeURIComponent(tz)).then(function (data) {
      state.hostTz = data.hostTimezone || state.hostTz;
      state.slots = data.slots || [];
      state.days = groupDays(state.slots);
      if (!state.selectedYmd && state.days[0]) state.selectedYmd = state.days[0].ymd;
      renderDays(daysWrap);
      renderSlots(slotsWrap);
    });
  }

  function formatDayLabel(ymd) {
    try {
      var parts = ymd.split("-");
      var dt = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12));
      return new Intl.DateTimeFormat(state.lang === "en" ? "en-US" : "es-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: state.bookerTz || "UTC",
      }).format(dt);
    } catch (_e) {
      return ymd;
    }
  }

  function renderDays(container) {
    container.innerHTML = "";
    state.days.forEach(function (d) {
      var btn = el("button", "mvi-scheduler__day", formatDayLabel(d.ymd));
      if (d.ymd === state.selectedYmd) btn.classList.add("is-active");
      btn.type = "button";
      btn.addEventListener("click", function () {
        state.selectedYmd = d.ymd;
        state.selected = null;
        renderDays(container);
        renderSlots(container.parentElement.querySelector(".mvi-scheduler__slots"));
      });
      container.appendChild(btn);
    });
  }

  function renderSlots(container) {
    container.innerHTML = "";
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
        var conf = document.querySelector(".mvi-scheduler__confirm");
        if (conf) {
          conf.hidden = false;
          conf.textContent = t("your_time") + " " + slot.labelBooker;
        }
      });
      container.appendChild(btn);
    });
  }

  function buildForm(root, cfg) {
    var form = el("div", "mvi-scheduler__form");
    form.innerHTML =
      '<label>' +
      t("first_name") +
      '</label><input name="firstName" required autocomplete="given-name" />' +
      '<label>' +
      t("phone") +
      '</label><input name="phone" required type="tel" autocomplete="tel" />' +
      '<label>' +
      t("email") +
      '</label><input name="email" type="email" autocomplete="email" />';
    var err = el("p", "mvi-scheduler__error");
    err.hidden = true;
    var submit = el("button", "mvi-scheduler__submit", t("confirm"));
    submit.type = "button";
    submit.addEventListener("click", function () {
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
      if (!firstName || !phone) {
        err.textContent = t("first_name");
        err.hidden = false;
        return;
      }
      submit.disabled = true;
      fetchJson(API.book, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUtc: state.selected.startUtc,
          endUtc: state.selected.endUtc,
          bookerTimezone: state.bookerTz,
          firstName: firstName,
          phone: phone,
          email: email,
          language: state.lang === "en" ? "english" : "spanish",
        }),
      })
        .then(function (res) {
          root.innerHTML = '<div class="mvi-scheduler__confirm">' + t("success") + "<br><br>" + (res.labels && res.labels.booker ? res.labels.booker : "") + "</div>";
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
    root.appendChild(form);
    root.appendChild(err);
    root.appendChild(submit);
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
    root.appendChild(el("p", "mvi-scheduler__hint", t("pick_day")));
    root.appendChild(el("div", "mvi-scheduler__days"));
    root.appendChild(el("p", "mvi-scheduler__hint", t("pick_time")));
    root.appendChild(el("div", "mvi-scheduler__slots"));
    root.appendChild(el("div", "mvi-scheduler__confirm"));
    root.querySelector(".mvi-scheduler__confirm").hidden = true;

    container.innerHTML = "";
    container.appendChild(root);

    fetchJson(API.config + "?tz=" + encodeURIComponent(browserTz()))
      .then(function (cfg) {
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
          loadSlots(root);
        });
        buildForm(root, cfg);
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
