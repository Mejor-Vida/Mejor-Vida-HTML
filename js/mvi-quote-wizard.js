/**
 * Nebraska final-expense quote wizard (replaces single-page quote form).
 */
(function () {
  var STEPS = ["gender", "dob", "state", "tobacco", "coverage", "contact"];
  var SUMMARY_KEYS = ["gender", "dob", "state", "tobacco", "coverage"];

  var state = {
    gender: "",
    dobMonth: "",
    dobDay: "",
    dobYear: "",
    state: "NE",
    tobacco: "",
    coverage: 0,
    fullName: "",
    email: "",
    phone: "",
    smsConsent: false,
  };

  var answered = {
    gender: false,
    dob: false,
    state: false,
    tobacco: false,
    coverage: false,
  };

  var stepIndex = 0;
  var formEl = document.getElementById("mvi-nebraska-quote-flow");
  if (!formEl) return;

  function lang() {
    var path = window.location.pathname.replace(/\\/g, "/");
    if (/\/en(\/|$)/.test(path)) return "en";
    return document.documentElement.classList.contains("lang-en") ? "en" : "es";
  }

  function t(es, en) {
    return lang() === "es" ? es : en;
  }

  var MONTH_ABBR = {
    es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  };

  function monthOptionLabel(num) {
    var abbr = MONTH_ABBR[lang()][num - 1];
    return num + " " + abbr;
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function ageFromDob(y, mo, d) {
    var birth = new Date(y, mo - 1, d);
    if (Number.isNaN(birth.getTime())) return null;
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var md = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age;
  }

  function isoDob() {
    if (!state.dobYear || !state.dobMonth || !state.dobDay) return "";
    return (
      state.dobYear +
      "-" +
      pad2(parseInt(state.dobMonth, 10)) +
      "-" +
      pad2(parseInt(state.dobDay, 10))
    );
  }

  function dobDisplay() {
    if (!state.dobMonth || !state.dobDay || !state.dobYear) return "";
    return (
      pad2(parseInt(state.dobMonth, 10)) +
      "/" +
      pad2(parseInt(state.dobDay, 10)) +
      "/" +
      state.dobYear
    );
  }

  function splitFullName(full) {
    var s = String(full || "").trim();
    if (!s) return { firstName: "", lastName: "" };
    var parts = s.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  }

  function formatCoverage(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  function summaryValue(key) {
    if (!answered[key]) return "";
    if (key === "gender") {
      if (state.gender === "male") return t("Hombre", "Male");
      if (state.gender === "female") return t("Mujer", "Female");
      return "";
    }
    if (key === "dob") return dobDisplay();
    if (key === "state") return state.state || "";
    if (key === "tobacco") {
      if (state.tobacco === "yes") return t("Sí", "Yes");
      if (state.tobacco === "no") return t("No", "Non-User");
      return "";
    }
    if (key === "coverage" && state.coverage) return formatCoverage(state.coverage);
    return "";
  }

  function updateSummaryBar() {
    var completedCount = SUMMARY_KEYS.filter(function (key) {
      return answered[key];
    }).length;
    var fillPct = (completedCount / SUMMARY_KEYS.length) * 100;

    var bar = document.querySelector(".mvi-quote-summary-bar");
    var strip = document.querySelector(".mvi-quote-progress-strip");
    if (bar) {
      bar.style.setProperty("--fill-pct", fillPct + "%");
      bar.classList.toggle("is-empty", completedCount === 0);
    }
    if (strip) strip.classList.toggle("is-empty", completedCount === 0);

    SUMMARY_KEYS.forEach(function (key) {
      var seg = document.querySelector('[data-summary-seg="' + key + '"]');
      if (!seg) return;
      var valEl = seg.querySelector(".mvi-quote-summary-val");
      var filled = !!summaryValue(key);
      seg.classList.toggle("is-filled", filled);
      if (valEl) valEl.textContent = summaryValue(key);
    });
  }

  function showStep(i) {
    stepIndex = i;
    STEPS.forEach(function (id, idx) {
      var panel = document.getElementById("mvi-step-" + id);
      if (panel) panel.hidden = idx !== i;
    });
    var prevBtn = document.getElementById("mvi-wizard-prev");
    var nextBtn = document.getElementById("mvi-wizard-next");
    var navWrap = document.getElementById("mvi-wizard-nav");
    if (prevBtn) prevBtn.hidden = i === 0;
    var stepId = STEPS[i];
    var autoAdvance = stepId === "gender" || stepId === "tobacco";
    var isContact = stepId === "contact";
    if (nextBtn) nextBtn.hidden = autoAdvance || isContact;
    if (navWrap) navWrap.hidden = autoAdvance;
    if (prevBtn && isContact) prevBtn.hidden = false;
    if (stepId === "coverage" && !state.coverage) {
      var covSel = document.getElementById("mvi-coverage");
      if (covSel && !covSel.value) {
        covSel.value = "10000";
        state.coverage = 10000;
      }
    }
    if (isContact) {
      var allDataStepsDone = SUMMARY_KEYS.every(function (key) {
        return answered[key];
      });
      if (allDataStepsDone) {
        if (window.MviGa4Funnel && window.MviGa4Funnel.trackFormStepsCompleted) {
          window.MviGa4Funnel.trackFormStepsCompleted("nebraska_quote_wizard");
        } else if (typeof gtag === "function") {
          gtag("event", "form_steps_completed", { form_source: "nebraska_quote_wizard" });
        }
      }
    }
    updateSummaryBar();
    var status = document.getElementById("mvi-quote-status");
    if (status) status.textContent = "";
  }

  function validateCurrentStep() {
    var step = STEPS[stepIndex];
    if (step === "gender" && !state.gender) {
      return t("Seleccione su género.", "Please select your gender.");
    }
    if (step === "dob") {
      if (!state.dobMonth || !state.dobDay || !state.dobYear) {
        return t("Seleccione su fecha de nacimiento.", "Please select your date of birth.");
      }
      var age = ageFromDob(
        parseInt(state.dobYear, 10),
        parseInt(state.dobMonth, 10),
        parseInt(state.dobDay, 10)
      );
      if (age == null) return t("Fecha no válida.", "Invalid date.");
      if (age < 18) {
        return t(
          "Las cotizaciones están disponibles desde los 18 años.",
          "Quotes are available starting at age 18."
        );
      }
      if (age > 85) {
        return t(
          "Las cotizaciones están disponibles hasta los 85 años.",
          "Quotes are available up to age 85."
        );
      }
      return null;
    }
    if (step === "state") {
      if (!state.state) {
        return t("Seleccione su estado.", "Please select your state.");
      }
      if (lang() === "en" && state.state !== "NE") {
        return (
          "We're sorry — Julie is licensed in Nebraska only. We cannot provide an online quote for residents of other states at this time."
        );
      }
    }
    if (step === "tobacco" && !state.tobacco) {
      return t("Indique si usa tabaco.", "Please answer the tobacco question.");
    }
    if (step === "coverage") {
      var cov = parseInt(document.getElementById("mvi-coverage")?.value || state.coverage, 10);
      if (!Number.isFinite(cov) || cov < 2000) {
        return t("Seleccione el monto de cobertura.", "Please select a coverage amount.");
      }
      state.coverage = cov;
    }
    if (step === "contact") {
      var names = splitFullName(state.fullName);
      if (!names.firstName) return t("Ingrese su nombre.", "Please enter your name.");
      if (!state.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
        return t("Ingrese un correo válido.", "Please enter a valid email.");
      }
      if (String(state.phone || "").replace(/\D/g, "").length < 10) {
        return t(
          "Ingrese un teléfono válido (mínimo 10 dígitos).",
          "Enter a valid phone (at least 10 digits)."
        );
      }
      return null;
    }
    return null;
  }

  function goNext() {
    var err = validateCurrentStep();
    var status = document.getElementById("mvi-quote-status");
    if (err) {
      if (status) {
        status.className = "small text-center text-danger mt-2";
        status.textContent = err;
      }
      return;
    }
    if (lang() !== "en" && STEPS[stepIndex] === "state" && state.state !== "NE") {
      answered.state = true;
      updateSummaryBar();
      window.location.href =
        "quote-out-of-state.html?state=" + encodeURIComponent(state.state);
      return;
    }
    answered[STEPS[stepIndex]] = true;
    if (stepIndex < STEPS.length - 1) {
      var nextIndex = stepIndex + 1;
      if (STEPS[nextIndex] === "contact") {
        if (window.MviGa4Funnel && window.MviGa4Funnel.trackFormStepsCompleted) {
          window.MviGa4Funnel.trackFormStepsCompleted("nebraska_quote_wizard");
        } else if (typeof gtag === "function") {
          gtag("event", "form_steps_completed", { form_source: "nebraska_quote_wizard" });
        }
      }
      showStep(nextIndex);
    }
  }

  function goPrev() {
    if (stepIndex > 0) showStep(stepIndex - 1);
  }

  var dobPickers = {};
  var dobPickerDocBound = false;

  function dobPlaceholder(part) {
    if (part === "month") return t("Mes", "Month");
    if (part === "day") return t("Día", "Day");
    return t("Año", "Year");
  }

  function monthOptionsList() {
    return [{ value: "", label: dobPlaceholder("month") }].concat(
      Array.from({ length: 12 }, function (_, i) {
        var v = String(i + 1);
        return { value: v, label: monthOptionLabel(i + 1) };
      })
    );
  }

  function dayOptionsList() {
    return [{ value: "", label: dobPlaceholder("day") }].concat(
      Array.from({ length: 31 }, function (_, i) {
        var v = String(i + 1);
        return { value: v, label: v };
      })
    );
  }

  function yearOptionsList() {
    var now = new Date();
    var maxYear = now.getFullYear() - 45;
    var minYear = now.getFullYear() - 85;
    var list = [{ value: "", label: dobPlaceholder("year") }];
    for (var y = maxYear; y >= minYear; y--) {
      list.push({ value: String(y), label: String(y) });
    }
    return list;
  }

  function closeAllDobPickerMenus() {
    document.querySelectorAll(".mvi-dob-picker.is-open").forEach(function (wrap) {
      wrap.classList.remove("is-open");
      var menu = wrap.querySelector(".mvi-dob-picker-menu");
      var btn = wrap.querySelector(".mvi-dob-picker-btn");
      if (menu) menu.hidden = true;
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function syncDobStateFromPickers() {
    var mo = document.getElementById("mvi-dob-month");
    var day = document.getElementById("mvi-dob-day");
    var year = document.getElementById("mvi-dob-year");
    state.dobMonth = mo ? mo.value : "";
    state.dobDay = day ? day.value : "";
    state.dobYear = year ? year.value : "";
    updateSummaryBar();
  }

  function createDobPicker(wrap, part, options) {
    var hiddenId = "mvi-dob-" + part;
    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = hiddenId;
    hidden.value =
      part === "month"
        ? state.dobMonth || ""
        : part === "day"
          ? state.dobDay || ""
          : state.dobYear || "";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mvi-dob-picker-btn form-select";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute(
      "aria-label",
      part === "month" ? t("Mes", "Month") : part === "day" ? t("Día", "Day") : t("Año", "Year")
    );

    var labelSpan = document.createElement("span");
    labelSpan.className = "mvi-dob-picker-label";
    btn.appendChild(labelSpan);

    var menu = document.createElement("ul");
    menu.className = "mvi-dob-picker-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    function renderMenu(opts) {
      menu.innerHTML = "";
      opts.forEach(function (opt) {
        var li = document.createElement("li");
        li.setAttribute("role", "option");
        li.setAttribute("data-value", opt.value);
        li.textContent = opt.label;
        if (!opt.value) li.classList.add("is-placeholder");
        menu.appendChild(li);
      });
    }

    function syncLabel() {
      var v = hidden.value;
      var match = options.find(function (o) {
        return o.value === v;
      });
      labelSpan.textContent = match ? match.label : options[0].label;
      menu.querySelectorAll('[role="option"]').forEach(function (li) {
        var selected = li.getAttribute("data-value") === v;
        li.classList.toggle("is-selected", selected);
        li.setAttribute("aria-selected", selected ? "true" : "false");
      });
    }

    function setOptions(opts) {
      options = opts;
      renderMenu(opts);
      if (!opts.some(function (o) { return o.value === hidden.value; })) {
        hidden.value = "";
        if (part === "month") state.dobMonth = "";
        if (part === "day") state.dobDay = "";
        if (part === "year") state.dobYear = "";
      }
      syncLabel();
    }

    renderMenu(options);
    syncLabel();

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var willOpen = menu.hidden;
      closeAllDobPickerMenus();
      if (willOpen) {
        menu.hidden = false;
        wrap.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });

    menu.addEventListener("click", function (e) {
      var li = e.target.closest('[role="option"]');
      if (!li) return;
      hidden.value = li.getAttribute("data-value") || "";
      if (part === "month") state.dobMonth = hidden.value;
      if (part === "day") state.dobDay = hidden.value;
      if (part === "year") state.dobYear = hidden.value;
      syncLabel();
      closeAllDobPickerMenus();
      hidden.dispatchEvent(new Event("change", { bubbles: true }));
      syncDobStateFromPickers();
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    wrap.appendChild(hidden);

    return { setOptions: setOptions, syncLabel: syncLabel };
  }

  function initDobPickers() {
    var parts = [
      { part: "month", wrapId: "mvi-dob-month-wrap", options: monthOptionsList() },
      { part: "day", wrapId: "mvi-dob-day-wrap", options: dayOptionsList() },
      { part: "year", wrapId: "mvi-dob-year-wrap", options: yearOptionsList() },
    ];
    parts.forEach(function (cfg) {
      var wrap = document.getElementById(cfg.wrapId);
      if (!wrap || wrap.dataset.ready === "1") return;
      dobPickers[cfg.part] = createDobPicker(wrap, cfg.part, cfg.options);
      wrap.dataset.ready = "1";
    });
    if (!dobPickerDocBound) {
      dobPickerDocBound = true;
      document.addEventListener("click", closeAllDobPickerMenus);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeAllDobPickerMenus();
      });
    }
  }

  function refreshMonthPicker() {
    if (dobPickers.month) dobPickers.month.setOptions(monthOptionsList());
  }

  function populateDobSelects() {
    initDobPickers();
    refreshMonthPicker();
  }

  function populateStateSelect() {
    var sel = document.getElementById("mvi-state");
    if (!sel || sel.options.length > 1) return;
    var list = window.MVS_US_STATES || [];
    list.forEach(function (row) {
      var o = document.createElement("option");
      o.value = row.c;
      o.textContent = row.n + " (" + row.c + ")";
      sel.appendChild(o);
    });
    try {
      var p = new URLSearchParams(location.search);
      var fromUrl = (p.get("state") || "").toUpperCase();
      if (fromUrl && fromUrl.length === 2) state.state = fromUrl;
    } catch (e) {}
    sel.value = state.state || "NE";
  }

  function populateCoverageSelect() {
    var sel = document.getElementById("mvi-coverage");
    if (!sel || sel.options.length > 1) return;
    var amounts = window.MVI_COVERAGE_AMOUNTS || [];
    amounts.forEach(function (amt) {
      var o = document.createElement("option");
      o.value = String(amt);
      o.textContent = formatCoverage(amt);
      sel.appendChild(o);
    });
  }

  function bindChoiceButtons() {
    document.querySelectorAll("[data-choice-field]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var field = btn.getAttribute("data-choice-field");
        var val = btn.getAttribute("data-choice-value");
        state[field] = val;
        document
          .querySelectorAll('[data-choice-field="' + field + '"]')
          .forEach(function (b) {
            b.classList.toggle("is-selected", b === btn);
          });
        answered[field] = true;
        updateSummaryBar();
        setTimeout(function () {
          if (stepIndex < STEPS.length - 1) showStep(stepIndex + 1);
        }, 180);
      });
    });
  }

  function bindInputs() {
    ["mvi-dob-month", "mvi-dob-day", "mvi-dob-year"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", syncDobStateFromPickers);
    });
    var st = document.getElementById("mvi-state");
    if (st) {
      st.addEventListener("change", function () {
        state.state = st.value;
        updateSummaryBar();
        var status = document.getElementById("mvi-quote-status");
        var notEligible = document.getElementById("mvi-state-not-eligible");
        var ineligible =
          lang() === "en" && state.state && state.state !== "NE";
        var msg =
          "We're sorry — Julie is licensed in Nebraska only. We cannot provide an online quote for residents of other states at this time.";
        if (notEligible) notEligible.hidden = !ineligible;
        if (status) {
          if (ineligible) {
            status.className = "small text-center text-danger mt-2";
            status.textContent = msg;
          } else {
            status.textContent = "";
          }
        }
      });
    }
    var cov = document.getElementById("mvi-coverage");
    if (cov) {
      cov.addEventListener("change", function () {
        state.coverage = parseInt(cov.value, 10) || 10000;
        updateSummaryBar();
      });
    }
    var nm = document.getElementById("ql-fullname");
    var em = document.getElementById("ql-email");
    var ph = document.getElementById("ql-phone");
    if (nm) nm.addEventListener("input", function () { state.fullName = nm.value; });
    if (em) em.addEventListener("input", function () { state.email = em.value; });
    if (ph) ph.addEventListener("input", function () { state.phone = ph.value; });
    var sms = document.getElementById("ql-sms-consent");
    if (sms) sms.addEventListener("change", function () { state.smsConsent = sms.checked; });
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

  function mviCollectOriginDetail() {
    var o = {};
    try {
      var p = new URLSearchParams(location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach(
        function (key) {
          var v = p.get(key);
          if (v) o[key] = v.slice(0, 500);
        }
      );
      o.page_path = (location.pathname + location.search).slice(0, 2000);
      if (document.referrer) o.referrer = document.referrer.slice(0, 2000);
    } catch (e2) {}
    return o;
  }

  async function submitQuote() {
    var err = validateCurrentStep();
    var status = document.getElementById("mvi-quote-status");
    var submitBtn = document.getElementById("mvi-quote-submit");
    if (err) {
      if (status) {
        status.className = "small text-center text-danger mt-2";
        status.textContent = err;
      }
      return;
    }

    var L = lang();
    var names = splitFullName(state.fullName);
    var age = ageFromDob(
      parseInt(state.dobYear, 10),
      parseInt(state.dobMonth, 10),
      parseInt(state.dobDay, 10)
    );
    var sex = state.gender;
    var smoker = state.tobacco === "yes";
    var coverage = state.coverage || parseInt(document.getElementById("mvi-coverage")?.value, 10) || 10000;

    if (status) {
      status.className = "small text-center text-body-secondary mt-2";
      status.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status"></span>' +
        t("Calculando…", "Calculating…");
    }
    if (submitBtn) submitBtn.disabled = true;

    try {
      var res = await fetch("/api/quote-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: age,
          sex: sex,
          smoker: smoker,
          coverageAmount: coverage,
        }),
      });
      var data = await res.json().catch(function () {
        return {};
      });
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || t("Error al calcular", "Could not calculate"));
      }
      if (data.quote_status !== "ok") {
        if (status) {
          status.className = "small text-center text-danger mt-2";
          status.textContent =
            data.quote_error ||
            t("No hay datos para esa combinación.", "No data for that combination.");
        }
        return;
      }

      var quoteSummary =
        L === "es"
          ? "Cotizador web: " +
            formatCoverage(coverage) +
            " rango " +
            data.quote_low +
            " – " +
            data.quote_high +
            " (medio " +
            data.quote_anchor +
            "). DOB " +
            dobDisplay() +
            ", edad " +
            age +
            ", " +
            sex +
            ", " +
            state.state +
            ", tabaco " +
            (smoker ? "sí" : "no") +
            "."
          : "Web estimator: " +
            formatCoverage(coverage) +
            " range " +
            data.quote_low +
            " – " +
            data.quote_high +
            " (mid " +
            data.quote_anchor +
            "). DOB " +
            dobDisplay() +
            ", age " +
            age +
            ", " +
            sex +
            ", " +
            state.state +
            ", tobacco " +
            (smoker ? "yes" : "no") +
            ".";

      var sessionClientId = mviGetSessionClientId();
      var syncRes = await fetch("/api/quote-lead-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: names.firstName,
          lastName: names.lastName,
          email: state.email.trim(),
          phone: state.phone.trim(),
          state: state.state,
          quoteSummary: quoteSummary,
          quoteLow: data.quote_low,
          quoteHigh: data.quote_high,
          quoteAnchor: data.quote_anchor,
          age: age,
          sex: sex,
          smoker: smoker,
          dob: isoDob(),
          coverageAmount: coverage,
          consent: state.smsConsent,
          lang: L,
          source: "nebraska_quote_page",
          sessionClientId: sessionClientId,
          originDetail: mviCollectOriginDetail(),
        }),
      });
      var syncData = await syncRes.json().catch(function () {
        return {};
      });
      var leadSaved = syncRes.ok && syncData.ok;

      try {
        sessionStorage.setItem(
          "mviNebraskaQuoteResult",
          JSON.stringify({
            lang: L,
            firstName: names.firstName,
            quote_low: data.quote_low,
            quote_high: data.quote_high,
            quote_anchor: data.quote_anchor,
            age: age,
            sex: sex,
            smoker: smoker,
            dob: isoDob(),
            dobDisplay: dobDisplay(),
            state: state.state,
            coverage: coverage,
            savedAt: new Date().toISOString(),
            leadId: leadSaved ? syncData.id || null : null,
            leadSaved: leadSaved,
            syncError: leadSaved
              ? null
              : syncData.error ||
                t("No pudimos guardar sus datos.", "We could not save your details."),
            sessionClientId: sessionClientId,
          })
        );
      } catch (storageErr) {}

      if (window.MviGa4Funnel && window.MviGa4Funnel.trackQuoteSubmitted) {
        window.MviGa4Funnel.trackQuoteSubmitted({
          form_source: "nebraska_quote_wizard",
          state: state.state,
          coverage: coverage,
          lead_saved: leadSaved,
        });
      } else if (typeof gtag === "function") {
        gtag("event", "quote_submitted", {
          form_source: "nebraska_quote_wizard",
          state: state.state,
          coverage: coverage,
          lead_saved: leadSaved,
        });
      }

      if (status) {
        status.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status"></span>' +
          t("Llevándole a sus resultados…", "Taking you to your results…");
      }
      location.replace("quote-results.html");
    } catch (submitErr) {
      if (status) {
        status.className = "small text-center text-danger mt-2";
        status.textContent =
          submitErr.message ||
          t("Error de red. Intente más tarde.", "Network error. Try again.");
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function applyTobaccoChoice(val) {
    if (val !== "yes" && val !== "no") return;
    state.tobacco = val;
    answered.tobacco = true;
    document.querySelectorAll('[data-choice-field="tobacco"]').forEach(function (btn) {
      btn.classList.toggle("is-selected", btn.getAttribute("data-choice-value") === val);
    });
    updateSummaryBar();
  }

  function firstIncompleteStepIndex() {
    if (!state.gender) return 0;
    if (!state.dobMonth || !state.dobDay || !state.dobYear) return 1;
    if (!state.state) return 2;
    if (!state.tobacco) return 3;
    if (!state.coverage) return 4;
    return 5;
  }

  function applyLandingQueryParams() {
    try {
      var p = new URLSearchParams(location.search);
      if (p.get("from") !== "landing") return;
      var nm = document.getElementById("ql-fullname");
      var em = document.getElementById("ql-email");
      var name =
        p.get("name") ||
        [p.get("firstName"), p.get("lastName")].filter(Boolean).join(" ").trim();
      var email = (p.get("email") || "").trim();
      if (nm && name) {
        nm.value = name;
        state.fullName = name;
      }
      if (em && email) {
        em.value = email;
        state.email = email;
      }
      var st = document.getElementById("mvi-state");
      var stateCode = (p.get("state") || "").trim().toUpperCase();
      if (st && stateCode && stateCode.length === 2) {
        st.value = stateCode;
        state.state = stateCode;
        answered.state = true;
      }
      var ph = document.getElementById("ql-phone");
      var phone = (p.get("phone") || "").trim();
      if (!phone) {
        try {
          phone = sessionStorage.getItem("mviLandingPhone") || "";
        } catch (ePhone) {}
      }
      if (ph && phone) {
        ph.value = phone;
        state.phone = phone;
      }
      var sms = document.getElementById("ql-sms-consent");
      var consent = (p.get("consent") || "").toLowerCase();
      if (consent !== "1" && consent !== "true") {
        try {
          if (sessionStorage.getItem("mviLandingSmsConsent") === "1") consent = "1";
        } catch (eConsent) {}
      }
      if (sms && (consent === "1" || consent === "true")) {
        sms.checked = true;
        state.smsConsent = true;
      }
      var tobacco = (p.get("tobacco") || "").toLowerCase();
      if (tobacco !== "yes" && tobacco !== "no") {
        try {
          var saved = sessionStorage.getItem("mviLandingTobacco");
          if (saved === "yes" || saved === "no") tobacco = saved;
        } catch (e2) {}
      }
      applyTobaccoChoice(tobacco);
    } catch (e) {}
  }

  function init() {
    document.body.classList.add("mvi-quote-wizard-page");
    populateDobSelects();
    populateStateSelect();
    populateCoverageSelect();
    bindChoiceButtons();
    bindInputs();
    applyLandingQueryParams();

    var prev = document.getElementById("mvi-wizard-prev");
    var next = document.getElementById("mvi-wizard-next");
    if (prev) prev.addEventListener("click", function (e) { e.preventDefault(); goPrev(); });
    if (next) next.addEventListener("click", function (e) { e.preventDefault(); goNext(); });

    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      submitQuote();
    });

    showStep(firstIncompleteStepIndex());

    window.addEventListener("mvi-site-language", function () {
      refreshMonthPicker();
      if (dobPickers.day) dobPickers.day.setOptions(dayOptionsList());
      if (dobPickers.year) dobPickers.year.setOptions(yearOptionsList());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
