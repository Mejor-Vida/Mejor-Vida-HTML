/**
 * Inline quote results for landing flow (same data as quote-results.html).
 */
(function () {
  "use strict";

  var IS_EN =
    document.documentElement.lang === "en" ||
    document.body.getAttribute("data-lf-lang") === "en";

  function ui(en, es) {
    return IS_EN ? en : es;
  }

  function pageLang(fallback) {
    if (fallback === "en" || fallback === "es") return fallback;
    return IS_EN ? "en" : "es";
  }

  function siteApiUrl(path) {
    var origin = window.location.origin || "";
    if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)) {
      return "https://www.mejorvidainsurance.com" + path;
    }
    return path;
  }

  function mviGetSessionClientId() {
    try {
      var k = "mviSessionClientId";
      var s = sessionStorage.getItem(k);
      if (s && s.length > 0 && s.length < 200) return s;
      s =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "s-" + String(Date.now()) + "-" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(k, s);
      return s;
    } catch (e) {
      return null;
    }
  }

  function mviPostAnalytics(payload) {
    try {
      fetch(siteApiUrl("/api/analytics-event"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(function () {});
    } catch (e) {}
  }

  function formatMoney(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  function parseDollar(str) {
    var n = parseFloat(String(str || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function formatDollarAmount(num) {
    return "$" + Number(num).toFixed(2);
  }

  function bindScheduleModal() {
    var modalEl = document.getElementById("lf-schedule-modal");
    var iframe = document.getElementById("lf-schedule-iframe");
    if (!modalEl || modalEl.getAttribute("data-lf-schedule-bound") === "1") return;
    modalEl.setAttribute("data-lf-schedule-bound", "1");

    function setScheduleIframeSrc() {
      if (!iframe) return;
      var url = iframe.getAttribute("data-src-es");
      if (url) iframe.setAttribute("src", url);
      iframe.setAttribute("title", ui("Schedule a call with Julie", "Agendar cita con Julie"));
    }

    modalEl.addEventListener("show.bs.modal", setScheduleIframeSrc);
    modalEl.addEventListener("show.bs.modal", function () {
      document.body.classList.add("lf-schedule-modal-open");
    });
    modalEl.addEventListener("hidden.bs.modal", function () {
      document.body.classList.remove("lf-schedule-modal-open");
    });
  }

  function render(q) {
    if (!q || !q.quote_low || !q.quote_high || !q.quote_anchor) return;

    var root = document.getElementById("lf-results-panel");
    if (!root) return;

    bindScheduleModal();

    var leadWarn = document.getElementById("lf-results-lead-warning");
    if (leadWarn) {
      if (q.leadSaved === false) {
        leadWarn.hidden = false;
        leadWarn.textContent =
          (q.syncError || ui("We could not save your information", "No pudimos guardar tus datos")) +
          ui(
            ". Your estimate is shown below. Check your phone or email, or call 402-440-5438.",
            ". Tu estimación aparece abajo. Revisa tu teléfono o correo, o llama al 402-440-5438."
          );
      } else {
        leadWarn.hidden = true;
        leadWarn.textContent = "";
      }
    }

    if (q.leadId) {
      mviPostAnalytics({
        eventType: "quote_results_viewed",
        quoteLeadSubmissionId: q.leadId,
        sessionClientId: q.sessionClientId || mviGetSessionClientId(),
        data: { path: location.pathname, inline: true },
      });
      var scheduleModalEl = document.getElementById("lf-schedule-modal");
      if (scheduleModalEl && scheduleModalEl.getAttribute("data-analytics-bound") !== "1") {
        scheduleModalEl.setAttribute("data-analytics-bound", "1");
        scheduleModalEl.addEventListener("show.bs.modal", function () {
          mviPostAnalytics({
            eventType: "schedule_modal_opened",
            quoteLeadSubmissionId: q.leadId,
            sessionClientId: q.sessionClientId || mviGetSessionClientId(),
            data: { inline: true },
          });
        });
      }
    }

    var lang = pageLang(q.lang);
    var lowLine = document.getElementById("lf-results-low-line");
    var rangeHint = document.getElementById("lf-results-range-hint");
    var detailDob = document.getElementById("lf-results-detail-dob");
    var detailAge = document.getElementById("lf-results-detail-age");
    var detailSex = document.getElementById("lf-results-detail-sex");
    var detailState = document.getElementById("lf-results-detail-state");
    var detailTobacco = document.getElementById("lf-results-detail-tobacco");
    var coverageRange = document.getElementById("lf-results-coverage-range");
    var coverageValue = document.getElementById("lf-results-coverage-value");
    var quoteCoverage = document.getElementById("lf-results-quote-coverage");

    if (lowLine) lowLine.textContent = q.quote_low;
    if (rangeHint) {
      var lowNum = parseDollar(q.quote_low);
      var highNum = parseDollar(q.quote_high);
      var singleRate = lowNum > 0 && highNum > 0 && lowNum === highNum;
      if (singleRate) {
        rangeHint.textContent =
          lang === "es"
            ? "Estimado de referencia con la tarifa Assurity que tenemos en archivo. Julie confirma el precio final según salud y aseguradora."
            : "Reference estimate from our on-file Assurity rate. Julie confirms your final price based on health and carrier.";
      } else {
        rangeHint.textContent =
          lang === "es"
            ? "Rango típico de " + q.quote_low + " a " + q.quote_high + "/mes según aseguradora y salud."
            : "Typical range " + q.quote_low + " to " + q.quote_high + "/mo depending on carrier and health.";
      }
    }

    var coverage = parseInt(String(q.coverage || 10000), 10);
    if (!Number.isFinite(coverage) || coverage < 2000) coverage = 10000;
    if (coverage > 50000) coverage = 50000;
    coverage = Math.round(coverage / 1000) * 1000;

    var age = q.age;
    var sex = String(q.sex || "").toLowerCase();
    var smoker = q.smoker === true || q.smoker === "true";
    var st = String(q.state || "NE").toUpperCase();
    var sexLabelEs = sex === "female" ? "mujer" : sex === "male" ? "hombre" : sex;
    var sexLabelEn = sex === "female" ? "female" : sex === "male" ? "male" : sex;

    var quoteBaseline = {
      coverage: coverage,
      quote_low: parseDollar(q.quote_low),
      quote_high: parseDollar(q.quote_high),
      quote_anchor: parseDollar(q.quote_anchor),
    };

    function renderQuoteForCoverage(newCoverage) {
      newCoverage = parseInt(String(newCoverage), 10);
      if (!Number.isFinite(newCoverage)) return;
      newCoverage = Math.max(2000, Math.min(50000, Math.round(newCoverage / 1000) * 1000));
      var factor = newCoverage / quoteBaseline.coverage;
      var low = quoteBaseline.quote_low * factor;
      var high = quoteBaseline.quote_high * factor;
      var anchor = quoteBaseline.quote_anchor * factor;
      var lowStr = formatDollarAmount(low);
      var highStr = formatDollarAmount(high);
      if (lowLine) lowLine.textContent = lowStr;
      if (rangeHint) {
        var singleRateNow = low > 0 && high > 0 && low === high;
        if (singleRateNow) {
          rangeHint.textContent =
            lang === "es"
              ? "Estimado de referencia con la tarifa Assurity que tenemos en archivo. Julie confirma el precio final según salud y aseguradora."
              : "Reference estimate from our on-file Assurity rate. Julie confirms your final price based on health and carrier.";
        } else {
          rangeHint.textContent =
            lang === "es"
              ? "Rango típico de " + lowStr + " a " + highStr + "/mes según aseguradora y salud."
              : "Typical range " + lowStr + " to " + highStr + "/mo depending on carrier and health.";
        }
      }
      if (coverageValue) coverageValue.textContent = formatMoney(newCoverage);
      if (quoteCoverage) quoteCoverage.textContent = formatMoney(newCoverage);
      if (coverageRange) coverageRange.value = String(newCoverage);
      q.coverage = newCoverage;
      q.quote_low = lowStr;
      q.quote_high = highStr;
      q.quote_anchor = formatDollarAmount(anchor);
      try {
        sessionStorage.setItem("mviNebraskaQuoteResult", JSON.stringify(q));
      } catch (storageErr) {}
    }

    if (detailDob) detailDob.textContent = q.dobDisplay || "—";
    if (detailAge) detailAge.textContent = age != null && age !== "" ? String(age) : "—";
    if (detailSex) detailSex.textContent = lang === "es" ? sexLabelEs : sexLabelEn;
    if (detailState) detailState.textContent = st || "—";
    if (detailTobacco) {
      detailTobacco.textContent = lang === "es" ? (smoker ? "Sí" : "No") : smoker ? "Yes" : "No";
    }
    if (quoteCoverage) quoteCoverage.textContent = formatMoney(coverage);
    if (coverageRange) {
      coverageRange.value = String(coverage);
      if (coverageValue) coverageValue.textContent = formatMoney(coverage);
      if (coverageRange.getAttribute("data-lf-bound") !== "1") {
        coverageRange.setAttribute("data-lf-bound", "1");
        coverageRange.addEventListener("input", function () {
          renderQuoteForCoverage(coverageRange.value);
        });
        coverageRange.addEventListener("change", function () {
          renderQuoteForCoverage(coverageRange.value);
        });
      }
    }

    var greeting = document.getElementById("lf-results-greeting");
    if (greeting && q.firstName) {
      greeting.textContent =
        lang === "es"
          ? "Gracias, " + q.firstName + ". Este es tu estimado personalizado."
          : "Thank you, " + q.firstName + ". Here is your personalized estimate.";
      greeting.hidden = false;
    }
  }

  window.MVILandingQuoteResults = { render: render };
})();
