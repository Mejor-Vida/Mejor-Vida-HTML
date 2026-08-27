/**
 * Term quote results — underwriting mode toggle + live API re-quotes.
 */
(function (global) {
  function lang() {
    var l = (document.documentElement.lang || "es").toLowerCase();
    return l.indexOf("en") === 0 ? "en" : "es";
  }

  function t(es, en) {
    return lang() === "en" ? en : es;
  }

  function formatMoney(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  function parseDollar(str) {
    var n = parseFloat(String(str || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
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
      fetch("/api/analytics-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(function () {});
    } catch (e) {}
  }

  function coverageAmountsForMode(mode, age) {
    if (typeof global.mviTermCoverageAmountsForMode === "function") {
      return global.mviTermCoverageAmountsForMode(mode, age);
    }
    return global.MVI_TERM_COVERAGE_AMOUNTS || [250000];
  }

  function snapCoverage(amount, mode, age) {
    if (typeof global.mviSnapTermCoverageForMode === "function") {
      return global.mviSnapTermCoverageForMode(amount, mode, age);
    }
    return amount;
  }

  function coverageIndex(amount, mode, age) {
    if (typeof global.mviTermCoverageIndexForMode === "function") {
      return global.mviTermCoverageIndexForMode(amount, mode, age);
    }
    return 0;
  }

  function coverageFromIndex(index, mode, age) {
    if (typeof global.mviTermCoverageFromIndex === "function") {
      return global.mviTermCoverageFromIndex(index, mode, age);
    }
    return 250000;
  }

  function initTermQuoteResults() {
    var missing = document.getElementById("mvi-results-missing");
    var body = document.getElementById("mvi-results-body");
    var lowLine = document.getElementById("mvi-results-low-line");
    var rangeHint = document.getElementById("mvi-results-range-hint");
    var detailDob = document.getElementById("mvi-results-detail-dob");
    var detailAge = document.getElementById("mvi-results-detail-age");
    var detailSex = document.getElementById("mvi-results-detail-sex");
    var detailState = document.getElementById("mvi-results-detail-state");
    var detailTobacco = document.getElementById("mvi-results-detail-tobacco");
    var detailTerm = document.getElementById("mvi-results-detail-term");
    var coverageRange = document.getElementById("mvi-results-coverage-range");
    var coverageValue = document.getElementById("mvi-results-coverage-value");
    var quoteCoverage = document.getElementById("mvi-results-quote-coverage");
    var modeToggle = document.getElementById("mvi-term-underwriting-toggle");
    var modeHint = document.getElementById("mvi-term-mode-hint");
    var policyIntro = document.getElementById("mvi-results-policy-intro");
    var policyHeading = document.getElementById("mvi-results-policy-heading");
    var priceLabel = document.getElementById("mvi-results-price-label");
    var coverageMaxTick = document.getElementById("mvi-results-coverage-max-tick");
    var fetchStatus = document.getElementById("mvi-results-fetch-status");

    if (!missing || !body) return;

    var raw;
    try {
      raw = sessionStorage.getItem("mviTermQuoteResult");
    } catch (e) {
      raw = null;
    }
    if (!raw) {
      missing.classList.remove("d-none");
      return;
    }

    var q;
    try {
      q = JSON.parse(raw);
    } catch (e) {
      missing.classList.remove("d-none");
      return;
    }
    if (!q || q.age == null) {
      missing.classList.remove("d-none");
      return;
    }

    var age = q.age;
    var sex = String(q.sex || "").toLowerCase();
    var smoker = q.smoker === true || q.smoker === "true";
    var st = String(q.state || "NE").toUpperCase();
    var termYears = q.termYears || q.term_years || 20;
    var activeMode = q.underwritingMode || q.underwriting_mode || "full";
    // Held aside because switching modes clears the live value.
    var storedCarrier = q.quote_carrier || "";
    var coverage = snapCoverage(q.coverage || 250000, activeMode, age);

    if (!q.quote_low && !q.heightFt) {
      missing.classList.remove("d-none");
      return;
    }

    body.classList.remove("d-none");

    var leadWarn = document.getElementById("mvi-results-lead-warning");
    if (leadWarn && q.leadSaved === false) {
      leadWarn.classList.remove("d-none");
      leadWarn.textContent =
        t(
          (q.syncError || "No pudimos guardar sus datos") +
            ". Su estimación aparece abajo. Vuelva al cotizador para corregir su teléfono o correo, o llame al 402-440-5438.",
          (q.syncError || "We could not save your details") +
            ". Your estimate is below. Return to the quote tool to fix your phone or email, or call 402-440-5438."
        );
    }

    if (q.leadId) {
      mviPostAnalytics({
        eventType: "quote_results_viewed",
        quoteLeadSubmissionId: q.leadId,
        sessionClientId: q.sessionClientId || mviGetSessionClientId(),
        data: { path: location.pathname, underwriting_mode: activeMode },
      });
      var scheduleModalEl = document.getElementById("scheduleModal");
      if (scheduleModalEl) {
        scheduleModalEl.addEventListener("show.bs.modal", function () {
          mviPostAnalytics({
            eventType: "schedule_modal_opened",
            quoteLeadSubmissionId: q.leadId,
            sessionClientId: q.sessionClientId || mviGetSessionClientId(),
            data: { underwriting_mode: activeMode },
          });
        });
      }
    }

    var sexLabelEs = sex === "female" ? "mujer" : sex === "male" ? "hombre" : sex;
    var sexLabelEn = sex === "female" ? "female" : sex === "male" ? "male" : sex;

    function quoteParams(coverageAmount, mode) {
      return {
        age: age,
        sex: sex,
        smoker: smoker,
        termYears: termYears,
        coverageAmount: coverageAmount,
        heightFt: q.heightFt,
        heightIn: q.heightIn,
        weightLbs: q.weightLbs,
        state: st,
        underwritingMode: mode,
      };
    }

    function persistSession() {
      try {
        sessionStorage.setItem("mviTermQuoteResult", JSON.stringify(q));
      } catch (e) {}
    }

    /** Names the company behind the quote when the API reports one. */
    function policyIntroText(mode) {
      if (mode === "simplified") {
        return t(
          "American Amicable Easy Term — sin examen médico, decisión rápida. Las tarifas suelen ser más altas que una póliza con suscripción completa.",
          "American Amicable Easy Term — no medical exam, faster decision. Rates are typically higher than fully underwritten coverage."
        );
      }
      var carrier = q.quote_carrier || "";
      if (carrier) {
        return t(
          carrier + " — suscripción completa con examen médico o historial — las mejores tarifas si califica.",
          carrier + " — full medical underwriting — best rates if you qualify."
        );
      }
      return t(
        "Suscripción completa con examen médico o historial — las mejores tarifas si califica.",
        "Full medical underwriting — best rates if you qualify."
      );
    }

    function updateModeUi(mode) {
      activeMode = mode;
      q.underwritingMode = mode;
      // The winning company differs per mode; drop the stale name until the
      // new quote lands so the copy never credits the wrong carrier.
      q.quote_carrier = "";

      if (modeToggle) {
        modeToggle.querySelectorAll("[data-mode]").forEach(function (btn) {
          var on = btn.getAttribute("data-mode") === mode;
          btn.classList.toggle("is-active", on);
          btn.setAttribute("aria-pressed", on ? "true" : "false");
        });
      }

      document.querySelectorAll("[data-carrier-mode]").forEach(function (el) {
        var modes = (el.getAttribute("data-carrier-mode") || "").split(/\s+/);
        el.classList.toggle("d-none", modes.indexOf(mode) === -1);
      });

      if (policyHeading) {
        policyHeading.textContent =
          mode === "simplified"
            ? t("Emisión simplificada", "Simplified issue")
            : t("Suscripción completa", "Fully underwritten");
      }
      if (policyIntro) policyIntro.textContent = policyIntroText(mode);
      if (modeHint) {
        var maxFace = coverageAmountsForMode(mode, age);
        var maxAmt = maxFace[maxFace.length - 1] || 5000000;
        modeHint.textContent =
          mode === "simplified"
            ? t(
                "Cobertura hasta " +
                  formatMoney(maxAmt) +
                  " · sin examen · American Amicable Easy Term",
                "Coverage up to " +
                  formatMoney(maxAmt) +
                  " · no exam · American Amicable Easy Term"
              )
            : t(
                "Mejores tarifas con suscripción completa · hasta " + formatMoney(maxAmt),
                "Best rates with full underwriting · up to " + formatMoney(maxAmt)
              );
      }
      if (priceLabel) {
        priceLabel.textContent =
          mode === "simplified"
            ? t("Estimado emisión simplificada", "Simplified issue estimate")
            : t("Mejor precio estimado (suscripción completa)", "Best estimated price (fully underwritten)");
      }

      if (coverageRange) {
        var amounts = coverageAmountsForMode(mode, age);
        coverageRange.max = String(Math.max(0, amounts.length - 1));
        if (coverageMaxTick && amounts.length) {
          coverageMaxTick.textContent = formatMoney(amounts[amounts.length - 1]);
        }
      }

      document.querySelectorAll(".mvi-results-policy-benefits--full").forEach(function (el) {
        el.classList.toggle("d-none", mode === "simplified");
      });
      document.querySelectorAll(".mvi-results-policy-benefits--simplified").forEach(function (el) {
        el.classList.toggle("d-none", mode !== "simplified");
      });
    }

    function renderQuote(data, coverageAmount) {
      coverage = coverageAmount;
      q.coverage = coverageAmount;
      q.quote_low = data.quote_low;
      q.quote_high = data.quote_high;
      q.quote_anchor = data.quote_anchor;
      q.maxFace = data.max_face;
      q.quote_carrier = data.quote_carrier || "";
      if (policyIntro) policyIntro.textContent = policyIntroText(activeMode);

      if (lowLine) lowLine.textContent = data.quote_low;
      if (rangeHint) {
        if (activeMode === "simplified") {
          rangeHint.textContent =
            t(
              "Tarifa nivelada de Easy Term para su edad y cobertura.",
              "Level Easy Term rate for your age and coverage."
            );
        } else if (data.quote_low === data.quote_high) {
          rangeHint.textContent = t(
            "Tarifa para su edad y cobertura si califica en la mejor clase de salud.",
            "Rate for your age and coverage if you qualify in the best health class."
          );
        } else {
          rangeHint.textContent = t(
            "Rango típico hasta " + data.quote_high + "/mes según aseguradora y salud.",
            "Typical range up to " + data.quote_high + "/mo depending on carrier and health."
          );
        }
      }
      if (coverageValue) coverageValue.textContent = formatMoney(coverageAmount);
      if (quoteCoverage) quoteCoverage.textContent = formatMoney(coverageAmount);
      if (coverageRange) {
        coverageRange.value = String(coverageIndex(coverageAmount, activeMode, age));
      }
      persistSession();
    }

    function setFetchStatus(msg, isError) {
      if (!fetchStatus) return;
      if (!msg) {
        fetchStatus.classList.add("d-none");
        fetchStatus.textContent = "";
        return;
      }
      fetchStatus.classList.remove("d-none");
      fetchStatus.className =
        "small mb-2 " + (isError ? "text-danger" : "text-body-secondary");
      fetchStatus.textContent = msg;
    }

    var fetchTimer = null;
    function fetchQuote(coverageAmount, mode) {
      if (fetchTimer) clearTimeout(fetchTimer);
      return new Promise(function (resolve) {
        fetchTimer = setTimeout(function () {
          setFetchStatus(t("Actualizando tarifa…", "Updating rate…"), false);
          fetch("/api/term-quote-site", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(quoteParams(coverageAmount, mode)),
          })
            .then(function (res) {
              return res.json();
            })
            .then(function (data) {
              setFetchStatus("", false);
              if (data.quote_status === "ok") {
                renderQuote(data, data.coverage_amount || coverageAmount);
                resolve({ ok: true, data: data });
              } else {
                setFetchStatus(data.quote_error || t("Sin datos", "No data"), true);
                resolve({ ok: false, data: data });
              }
            })
            .catch(function () {
              setFetchStatus(t("Error de conexión", "Connection error"), true);
              resolve({ ok: false });
            });
        }, 180);
      });
    }

    function switchMode(mode) {
      if (mode === activeMode) return;
      updateModeUi(mode);
      var snapped = snapCoverage(coverage, mode, age);
      fetchQuote(snapped, mode);
    }

    if (modeToggle) {
      modeToggle.querySelectorAll("[data-mode]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          switchMode(btn.getAttribute("data-mode"));
        });
      });
    }

    if (detailDob) detailDob.textContent = q.dobDisplay || "—";
    if (detailAge) detailAge.textContent = age != null && age !== "" ? String(age) : "—";
    if (detailSex) detailSex.textContent = lang() === "es" ? sexLabelEs : sexLabelEn;
    if (detailState) detailState.textContent = st || "—";
    if (detailTerm) {
      detailTerm.textContent = t(termYears + " años", termYears + " years");
    }
    if (detailTobacco) {
      detailTobacco.textContent = t(smoker ? "Sí" : "No", smoker ? "Yes" : "No");
    }

    updateModeUi(activeMode);

    if (q.quote_low) {
      renderQuote(
        {
          quote_low: q.quote_low,
          quote_high: q.quote_high,
          quote_anchor: q.quote_anchor,
          max_face: q.maxFace,
          quote_carrier: storedCarrier,
        },
        coverage
      );
    } else {
      fetchQuote(coverage, activeMode);
    }

    if (coverageRange) {
      coverageRange.addEventListener("input", function () {
        var amt = coverageFromIndex(coverageRange.value, activeMode, age);
        fetchQuote(amt, activeMode);
      });
    }

    var step3 = document.querySelector(".mvi-quote-macro-stepper li:last-child");
    if (step3) {
      var schedSection = document.getElementById("mvi-results-schedule-section");
      if (schedSection && "IntersectionObserver" in window) {
        var obs = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              step3.classList.toggle("is-active", entry.isIntersecting);
            });
          },
          { rootMargin: "-20% 0px -55% 0px", threshold: 0 }
        );
        obs.observe(schedSection);
      }
    }
  }

  global.mviInitTermQuoteResults = initTermQuoteResults;
})(typeof window !== "undefined" ? window : global);
