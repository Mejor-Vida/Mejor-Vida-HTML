(function () {
  "use strict";

  var lang = document.documentElement.classList.contains("lang-en") ? "en" : "es";
  var params = new URLSearchParams(location.search);
  var id = params.get("id") || "";
  var token = params.get("token") || "";

  function t(key) {
    var es = {
      loading: "Cargando…",
      invalid: "Este enlace no es valido o ya expiro.",
      when: "Su cita:",
      cancel_btn: "Cancelar cita",
      reschedule_btn: "Elegir otra hora",
      cancelled: "Su cita fue cancelada.",
      already: "Esta cita ya estaba cancelada.",
      err: "No se pudo cancelar. Llame al 402-440-5438.",
      confirm: "¿Seguro que desea cancelar esta cita?",
    };
    var en = {
      loading: "Loading…",
      invalid: "This link is invalid or has expired.",
      when: "Your appointment:",
      cancel_btn: "Cancel appointment",
      reschedule_btn: "Pick a new time",
      cancelled: "Your appointment was cancelled.",
      already: "This appointment was already cancelled.",
      err: "Could not cancel. Please call 402-440-5438.",
      confirm: "Are you sure you want to cancel this appointment?",
    };
    return (lang === "en" ? en : es)[key] || key;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function bookUrl() {
    return lang === "en" ? "schedule-julie.html" : "../schedule-julie.html";
  }

  async function load() {
    var root = el("sch-manage-root");
    if (!id || !token || !root) {
      if (root) root.textContent = t("invalid");
      return;
    }
    root.textContent = t("loading");
    try {
      var r = await fetch(
        "/api/scheduler/appointment?id=" + encodeURIComponent(id) + "&token=" + encodeURIComponent(token)
      );
      var data = await r.json();
      if (!r.ok || !data.appointment) {
        root.textContent = t("invalid");
        return;
      }
      var appt = data.appointment;
      root.innerHTML =
        "<p class=\"sch-manage-when\"><strong>" +
        t("when") +
        "</strong><br>" +
        (appt.booker_label || appt.starts_at) +
        "</p>" +
        (appt.status === "cancelled"
          ? "<p class=\"sch-manage-ok\">" + t("already") + "</p>"
          : "<div class=\"sch-manage-actions\">" +
            "<button type=\"button\" class=\"sch-manage-btn sch-manage-btn--danger\" id=\"sch-manage-cancel\">" +
            t("cancel_btn") +
            "</button>" +
            "<a class=\"sch-manage-btn sch-manage-btn--link\" href=\"" +
            bookUrl() +
            "\">" +
            t("reschedule_btn") +
            "</a></div>");

      var cancelBtn = document.getElementById("sch-manage-cancel");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", async function () {
          if (!window.confirm(t("confirm"))) return;
          cancelBtn.disabled = true;
          try {
            var cr = await fetch("/api/scheduler/cancel", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ appointmentId: id, token: token }),
            });
            var cj = await cr.json();
            if (!cr.ok) {
              root.innerHTML = "<p class=\"sch-manage-err\">" + t("err") + "</p>";
              return;
            }
            root.innerHTML =
              "<p class=\"sch-manage-ok\">" +
              t("cancelled") +
              '</p><p><a class="sch-manage-btn sch-manage-btn--link" href="' +
              bookUrl() +
              '">' +
              t("reschedule_btn") +
              "</a></p>";
          } catch (_e) {
            root.innerHTML = "<p class=\"sch-manage-err\">" + t("err") + "</p>";
          }
        });
      }

      if (location.hash === "#cancel" && cancelBtn) {
        cancelBtn.focus();
      }
    } catch (_e) {
      root.textContent = t("invalid");
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
