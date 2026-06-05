(function () {
  var steps = Array.prototype.slice.call(document.querySelectorAll(".lf-step"));
  var maxBuiltStep = steps.reduce(function (max, el) {
    return Math.max(max, Number(el.getAttribute("data-step")) || 0);
  }, 0);
  var plannedSteps = Number(document.body.getAttribute("data-total-steps")) || maxBuiltStep;
  var TOTAL_STEPS = plannedSteps;
  var currentStep = 1;
  var activeFlow = null;
  var selections = {
    sex: null,
    birthdate: null,
    tobacco: null,
    state: null,
    firstName: null,
    lastName: null,
    applicantConsent: false,
    email: null,
    phone: null,
    smsConsent: false,
  };

  var progressRoot = document.querySelector(".lf-progress");
  var progressBar = document.getElementById("lf-progress-bar");
  var backBtn = document.getElementById("lf-btn-back");
  var nextBtn = document.getElementById("lf-btn-next");
  var nextDefaultAnchor = document.getElementById("lf-next-default-anchor");
  var julieAfterNext = document.getElementById("lf-julie-after-next");
  var headerTagline = document.getElementById("lf-header-tagline");
  var stateCombobox = null;
  var quoteSubmitting = false;

  var STORAGE_KEYS = {
    sex: "mviLandingSex",
    birthdate: "mviLandingBirthdate",
    tobacco: "mviLandingTobacco",
    state: "mviLandingState",
    firstName: "mviLandingFirstName",
    lastName: "mviLandingLastName",
    applicantConsent: "mviLandingApplicantConsent",
    email: "mviLandingEmail",
    phone: "mviLandingPhone",
    smsConsent: "mviLandingSmsConsent",
  };

  var nameStepPhase = "fields";

  var IS_EN =
    document.documentElement.lang === "en" ||
    document.body.getAttribute("data-lf-lang") === "en";

  var NEXT_LABELS = {
    default: IS_EN ? "Next" : "Siguiente",
  };

  var CHOICE_SELECTOR = ".lf-option-btn";

  var MULTI_FIELD_ORDER = {};

  function parseMultiValue(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.slice();
    if (typeof raw === "string") {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice();
      } catch (e) {}
      return raw
        .split(",")
        .map(function (part) {
          return part.trim();
        })
        .filter(Boolean);
    }
    return [];
  }

  function normalizeMultiValue(values, field) {
    var order = MULTI_FIELD_ORDER[field] || [];
    return order.filter(function (key) {
      return values.indexOf(key) >= 0;
    });
  }

  function shouldShowStep(stepEl) {
    var unless = stepEl.getAttribute("data-show-unless");
    if (unless) {
      var unlessParts = unless.split(":");
      if (selections[unlessParts[0]] === unlessParts[1]) return false;
    }
    var when = stepEl.getAttribute("data-show-when");
    if (!when) return true;
    var parts = when.split(":");
    var field = parts[0];
    var expected = parts[1] || "";
    var values = expected.indexOf("|") >= 0 ? expected.split("|") : expected.split(",");
    return values.indexOf(selections[field]) >= 0;
  }

  function isCalculatorStep(stepNum) {
    return stepNum >= 21 && stepNum <= 25;
  }

  function isCalculatorFlow() {
    return activeFlow === "calculator";
  }

  function getCalculatorStepNumbers() {
    return steps
      .filter(function (el) {
        return el.getAttribute("data-lf-flow") === "calculator";
      })
      .map(function (el) {
        return Number(el.getAttribute("data-step"));
      })
      .sort(function (a, b) {
        return a - b;
      });
  }

  function getVisibleStepNumbers() {
    if (currentStep === 1 && !activeFlow) return [1];
    if (isCalculatorFlow()) return getCalculatorStepNumbers();
    return steps
      .filter(function (el) {
        if (el.hasAttribute("data-lf-results-only")) return false;
        if (el.getAttribute("data-lf-flow") === "calculator") return false;
        return shouldShowStep(el);
      })
      .map(function (el) {
        return Number(el.getAttribute("data-step"));
      })
      .sort(function (a, b) {
        return a - b;
      });
  }

  function getNextStepNumber(from) {
    var nums = getVisibleStepNumbers();
    for (var i = 0; i < nums.length; i++) {
      if (nums[i] > from) return nums[i];
    }
    return null;
  }

  function getPrevStepNumber(from) {
    var nums = getVisibleStepNumbers();
    var prev = null;
    for (var i = 0; i < nums.length; i++) {
      if (nums[i] >= from) break;
      prev = nums[i];
    }
    return prev;
  }

  function getActiveStepEl() {
    return steps.find(function (el) {
      return Number(el.getAttribute("data-step")) === currentStep;
    });
  }

  function stepRequiresSelection(stepEl) {
    return !!(stepEl && stepEl.getAttribute("data-field"));
  }

  function stepAutoAdvances(stepEl) {
    return !!(stepEl && stepEl.hasAttribute("data-auto-advance"));
  }

  function getActiveChoices() {
    var step = getActiveStepEl();
    if (!step) return [];
    return Array.prototype.slice.call(step.querySelectorAll(CHOICE_SELECTOR));
  }

  function getActiveField() {
    var step = getActiveStepEl();
    return step ? step.getAttribute("data-field") : null;
  }

  function getSelection(field) {
    return selections[field] || null;
  }

  function getChoiceValue(choice) {
    return choice.getAttribute("data-goal") || choice.getAttribute("data-value");
  }

  function getStepFieldType(stepEl) {
    return stepEl ? stepEl.getAttribute("data-field-type") : null;
  }

  function parseBirthdate(value) {
    if (window.MVILandingDateMask && window.MVILandingDateMask.parseBirthdate) {
      return window.MVILandingDateMask.parseBirthdate(value);
    }
    var match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    var month = Number(match[1]);
    var day = Number(match[2]);
    var year = Number(match[3]);
    var date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return { month: month, day: day, year: year };
  }

  function isValidBirthdate(value) {
    if (window.MVILandingDateMask && window.MVILandingDateMask.isCompleteValidBirthdate) {
      return window.MVILandingDateMask.isCompleteValidBirthdate(value, 18, 100);
    }
    var parsed = parseBirthdate(value);
    if (!parsed) return false;
    var today = new Date();
    var age = today.getFullYear() - parsed.year;
    var monthDiff = today.getMonth() - (parsed.month - 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.day)) age -= 1;
    return age >= 18 && age <= 100;
  }

  function isValidStateCode(value) {
    var code = String(value || "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) return false;
    var list = window.MVS_US_STATES || [];
    return list.some(function (s) {
      return s.c === code;
    });
  }

  function isValidLegalName(value) {
    return /^[A-Za-z][A-Za-z\s'.-]{1,49}$/.test(String(value || "").trim());
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function formatPhoneInput(value) {
    var d = String(value || "").replace(/\D/g, "").slice(0, 11);
    if (d.length > 0 && d[0] !== "1") d = d.slice(0, 10);
    else if (d.length > 1) d = d.slice(0, 11);
    if (d.length === 11 && d[0] === "1") d = d.slice(1);
    d = d.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }

  function normalizeUsPhoneE164(value) {
    var d = String(value || "").replace(/\D/g, "");
    if (d.length === 10) return "+1" + d;
    if (d.length === 11 && d[0] === "1") return "+" + d;
    return null;
  }

  function isValidPhone(value) {
    return !!normalizeUsPhoneE164(value);
  }

  function fieldHasValue(stepEl, field) {
    if (!field) return true;
    var value = getSelection(field);
    if (getStepFieldType(stepEl) === "multi") {
      return parseMultiValue(value).length > 0;
    }
    if (getStepFieldType(stepEl) === "date") {
      return isValidBirthdate(value);
    }
    if (getStepFieldType(stepEl) === "select") {
      return isValidStateCode(value);
    }
    if (getStepFieldType(stepEl) === "name") {
      return isValidLegalName(selections.firstName) && isValidLegalName(selections.lastName);
    }
    if (getStepFieldType(stepEl) === "email") {
      return isValidEmail(value);
    }
    if (getStepFieldType(stepEl) === "phone") {
      return isValidPhone(selections.phone);
    }
    return !!value;
  }

  function setProgressPct(pct) {
    pct = Math.max(0, Math.min(100, Math.round(pct)));
    progressBar.style.width = pct + "%";
    if (progressRoot) progressRoot.setAttribute("aria-valuenow", String(pct));
  }

  function currentStepProgressCredit() {
    if (currentStep === 1) return 0;
    if (currentStep === 14 || currentStep === 25) return 1;
    if (isCalculatorStep(currentStep)) {
      if (window.MVILandingCalculator && window.MVILandingCalculator.canProceed) {
        return window.MVILandingCalculator.canProceed(currentStep) ? 1 : 0;
      }
      return 0;
    }
    var step = getActiveStepEl();
    if (!step) return 0;
    if (
      stepRequiresSelection(step) ||
      getStepFieldType(step) === "date" ||
      getStepFieldType(step) === "select" ||
      getStepFieldType(step) === "name" ||
      getStepFieldType(step) === "email" ||
      getStepFieldType(step) === "phone"
    ) {
      return fieldHasValue(step, getActiveField()) ? 1 : 0;
    }
    return 0;
  }

  function updateProgress() {
    if (!progressBar) return;
    if (currentStep === 1) {
      setProgressPct(0);
      return;
    }
    if (currentStep === 14 || currentStep === 25) {
      setProgressPct(100);
      return;
    }
    var nums =
      isCalculatorFlow() && isCalculatorStep(currentStep)
        ? getCalculatorStepNumbers()
        : getVisibleStepNumbers();
    if (!nums.length) {
      setProgressPct(0);
      return;
    }
    var idx = nums.indexOf(currentStep);
    if (idx < 0) {
      setProgressPct(0);
      return;
    }
    var credit = currentStepProgressCredit();
    setProgressPct(((idx + credit) / nums.length) * 100);
  }

  function updateNextButton() {
    if (!nextBtn) {
      updateProgress();
      return;
    }
    var step = getActiveStepEl();
    if (currentStep === 1 && document.getElementById("lf-objective-grid")) {
      nextBtn.hidden = true;
      updateProgress();
      return;
    }
    if (currentStep === 14 || currentStep === 25) {
      nextBtn.hidden = true;
      updateProgress();
      return;
    }
    if (isCalculatorStep(currentStep)) {
      nextBtn.hidden = false;
      nextBtn.textContent = "Siguiente";
      var canProceed =
        window.MVILandingCalculator && window.MVILandingCalculator.canProceed
          ? window.MVILandingCalculator.canProceed(currentStep)
          : true;
      nextBtn.disabled = !canProceed;
      updateProgress();
      return;
    }
    if (stepAutoAdvances(step)) {
      nextBtn.hidden = true;
      updateProgress();
      return;
    }
    nextBtn.hidden = false;
    if (quoteSubmitting) {
      nextBtn.disabled = true;
      updateProgress();
      return;
    }
    if (currentStep === 11) {
      nextBtn.textContent = nameStepPhase === "consent" ? "Continuar" : (NEXT_LABELS[currentStep] || NEXT_LABELS.default);
    } else if (currentStep === 13 && !quoteSubmitting) {
      nextBtn.textContent = "Ver mi estimado";
    } else {
      nextBtn.textContent = NEXT_LABELS[currentStep] || NEXT_LABELS.default;
    }
    if (!stepRequiresSelection(step)) {
      nextBtn.disabled = false;
      updateProgress();
      return;
    }
    var field = getActiveField();
    nextBtn.disabled = !fieldHasValue(step, field);
    updateProgress();
  }

  function updateRadioTabindex(choices, selectedValue) {
    choices.forEach(function (choice) {
      var on = getChoiceValue(choice) === selectedValue;
      choice.tabIndex = on ? 0 : -1;
    });
    if (!selectedValue && choices.length) choices[0].tabIndex = 0;
  }

  function hasNextStep() {
    return getNextStepNumber(currentStep) !== null;
  }

  function updateMultiTabindex(choices, values) {
    var focusChoice =
      choices.find(function (choice) {
        return values.indexOf(getChoiceValue(choice)) >= 0;
      }) || choices[0];
    choices.forEach(function (choice) {
      choice.tabIndex = choice === focusChoice ? 0 : -1;
    });
  }

  function applyMultiSelectionUI(field, values) {
    var choices = getActiveChoices();
    choices.forEach(function (choice) {
      var on = values.indexOf(getChoiceValue(choice)) >= 0;
      choice.classList.toggle("is-selected", on);
      choice.setAttribute("aria-checked", on ? "true" : "false");
    });
    updateMultiTabindex(choices, values);
  }

  function setMultiSelection(field, values, options) {
    options = options || {};
    var normalized = normalizeMultiValue(parseMultiValue(values), field);
    selections[field] = normalized;
    applyMultiSelectionUI(field, normalized);
    try {
      var key = STORAGE_KEYS[field];
      if (key) {
        if (normalized.length) sessionStorage.setItem(key, JSON.stringify(normalized));
        else sessionStorage.removeItem(key);
      }
    } catch (e) {}
    updateNextButton();
  }

  function toggleMultiSelection(field, value) {
    var current = parseMultiValue(selections[field]);
    var idx = current.indexOf(value);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(value);
    setMultiSelection(field, current);
  }

  /** Single-select per step. Branching via data-show-when on conditional steps. */
  function setSelection(field, value, options) {
    options = options || {};
    selections[field] = value || null;
    var choices = getActiveChoices();
    choices.forEach(function (choice) {
      var on = getChoiceValue(choice) === value;
      choice.classList.toggle("is-selected", on);
      choice.setAttribute("aria-checked", on ? "true" : "false");
    });
    updateRadioTabindex(choices, value);
    try {
      var key = STORAGE_KEYS[field];
      if (key) {
        if (value) sessionStorage.setItem(key, value);
        else sessionStorage.removeItem(key);
      }
    } catch (e) {}
    updateNextButton();

    if (options.autoAdvance) {
      var step = getActiveStepEl();
      if (stepAutoAdvances(step) && value) {
        window.setTimeout(function () {
          var next = getNextStepNumber(currentStep);
          if (next !== null) showStep(next);
          else submitLandingQuote();
        }, 180);
      }
    }
  }

  function setDateValue(field, value) {
    selections[field] = value || null;
    try {
      var key = STORAGE_KEYS[field];
      if (key) {
        if (value) sessionStorage.setItem(key, value);
        else sessionStorage.removeItem(key);
      }
    } catch (e) {}
    updateNextButton();
  }

  function setNameValue(field, value) {
    var normalized = String(value || "").trim().replace(/\s+/g, " ");
    selections[field] = normalized || null;
    try {
      var key = STORAGE_KEYS[field];
      if (key) {
        if (normalized) sessionStorage.setItem(key, normalized);
        else sessionStorage.removeItem(key);
      }
    } catch (e) {}
    updateNextButton();
  }

  function setEmailValue(field, value) {
    var normalized = String(value || "").trim();
    selections[field] = normalized || null;
    try {
      var key = STORAGE_KEYS[field];
      if (key) {
        if (normalized) sessionStorage.setItem(key, normalized);
        else sessionStorage.removeItem(key);
      }
    } catch (e) {}
    updateNextButton();
  }

  function setPhoneValue(field, value) {
    var e164 = normalizeUsPhoneE164(value);
    selections[field] = e164 || null;
    try {
      var key = STORAGE_KEYS[field];
      if (key) {
        if (e164) sessionStorage.setItem(key, e164);
        else sessionStorage.removeItem(key);
      }
    } catch (e) {}
    updateNextButton();
  }

  function refreshDateStep(step) {
    var field = step.getAttribute("data-field");
    if (getStepFieldType(step) !== "date" || field !== "birthdate") return;
    var input = document.getElementById("lf-birthdate-input");
    var hint = document.getElementById("lf-birthdate-hint");
    if (!input) return;
    input.value = selections.birthdate || "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.classList.toggle("is-invalid", !!(input.value && !isValidBirthdate(input.value)));
    if (hint) hint.hidden = !(input.value && !isValidBirthdate(input.value));
  }

  function setStateValue(field, value) {
    var normalized = String(value || "").trim().toUpperCase();
    selections[field] = isValidStateCode(normalized) ? normalized : null;
    try {
      var key = STORAGE_KEYS[field];
      if (key) {
        if (selections[field]) sessionStorage.setItem(key, selections[field]);
        else sessionStorage.removeItem(key);
      }
    } catch (e) {}
    updateNextButton();
  }

  function getStateListItems() {
    var list = window.MVS_US_STATES || [];
    return list
      .slice()
      .sort(function (a, b) {
        if (a.c === "NE") return -1;
        if (b.c === "NE") return 1;
        return a.n.localeCompare(b.n);
      })
      .map(function (st) {
        return { name: st.n, code: st.c };
      });
  }

  function stateCodeFromName(name) {
    if (!name) return null;
    var list = window.MVS_US_STATES || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].n === name) return list[i].c;
    }
    return null;
  }

  function stateNameFromCode(code) {
    if (!code) return "";
    var upper = String(code).trim().toUpperCase();
    var list = window.MVS_US_STATES || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].c === upper) return list[i].n;
    }
    return "";
  }

  function refreshStateStep(step) {
    var field = step.getAttribute("data-field");
    if (getStepFieldType(step) !== "select" || field !== "state") return;
    var input = document.getElementById("lf-state-combobox-input");
    var hint = document.getElementById("lf-state-hint");
    if (stateCombobox && selections.state) {
      stateCombobox.setValue(stateNameFromCode(selections.state) || selections.state);
    }
    if (!input) return;
    var invalid = !!(selections.state && !isValidStateCode(selections.state));
    input.classList.toggle("is-invalid", invalid);
    if (hint) hint.hidden = !invalid;
  }

  function refreshNameStep(step) {
    if (getStepFieldType(step) !== "name") return;
    var firstInput = document.getElementById("lf-first-name-input");
    var lastInput = document.getElementById("lf-last-name-input");
    if (firstInput) firstInput.value = selections.firstName || "";
    if (lastInput) lastInput.value = selections.lastName || "";
  }

  function refreshEmailStep(step) {
    var field = step.getAttribute("data-field");
    if (getStepFieldType(step) !== "email" || field !== "email") return;
    var input = document.getElementById("lf-email-input");
    var hint = document.getElementById("lf-email-hint");
    if (!input) return;
    input.value = selections.email || "";
    var invalid = !!(input.value && !isValidEmail(input.value));
    input.classList.toggle("is-invalid", invalid);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    if (hint) hint.hidden = !invalid;
  }

  function refreshPhoneStep(step) {
    if (getStepFieldType(step) !== "phone") return;
    var input = document.getElementById("lf-phone-input");
    var hint = document.getElementById("lf-phone-hint");
    var smsCheck = document.getElementById("lf-sms-consent");
    if (!input) return;
    if (selections.phone) {
      input.value = formatPhoneInput(selections.phone.replace(/^\+1/, ""));
    } else {
      input.value = "";
    }
    var invalid = !!(input.value && !isValidPhone(input.value));
    input.classList.toggle("is-invalid", invalid);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    if (hint) hint.hidden = !invalid;
    if (smsCheck) smsCheck.checked = !!selections.smsConsent;
  }

  function refreshStepUI() {
    var step = getActiveStepEl();
    if (!step) {
      updateNextButton();
      return;
    }
    if (getStepFieldType(step) === "date") {
      refreshDateStep(step);
      updateNextButton();
      return;
    }
    if (getStepFieldType(step) === "select") {
      refreshStateStep(step);
      updateNextButton();
      return;
    }
    if (getStepFieldType(step) === "name") {
      refreshNameStep(step);
      updateNextButton();
      return;
    }
    if (getStepFieldType(step) === "email") {
      refreshEmailStep(step);
      updateNextButton();
      return;
    }
    if (getStepFieldType(step) === "phone") {
      refreshPhoneStep(step);
      updateNextButton();
      return;
    }
    if (getStepFieldType(step) === "multi") {
      var multiField = getActiveField();
      var multiValues = normalizeMultiValue(parseMultiValue(getSelection(multiField)), multiField);
      applyMultiSelectionUI(multiField, multiValues);
      updateNextButton();
      return;
    }
    if (!stepRequiresSelection(step)) {
      updateNextButton();
      return;
    }
    var field = getActiveField();
    var choices = getActiveChoices();
    var value = getSelection(field);
    choices.forEach(function (choice) {
      var on = getChoiceValue(choice) === value;
      choice.classList.toggle("is-selected", on);
      choice.setAttribute("aria-checked", on ? "true" : "false");
    });
    updateRadioTabindex(choices, value);
    updateNextButton();
  }

  function placeNextButton() {
    if (!nextBtn || !nextDefaultAnchor) return;
    if (nextBtn.parentElement !== nextDefaultAnchor) {
      nextDefaultAnchor.appendChild(nextBtn);
    }
  }

  function syncNameStepPhase() {
    var consent = document.getElementById("lf-name-consent");
    nameStepPhase = selections.applicantConsent ? "consent" : nameStepPhase;
    if (currentStep !== 11) {
      if (consent) consent.hidden = true;
      if (!selections.applicantConsent) nameStepPhase = "fields";
      return;
    }
    if (consent) consent.hidden = nameStepPhase !== "consent";
  }

  function showNameConsentPhase() {
    nameStepPhase = "consent";
    var consent = document.getElementById("lf-name-consent");
    if (consent) consent.hidden = false;
    updateNextButton();
    window.scrollTo(0, document.body.scrollHeight);
  }

  function hideNameConsentPhase() {
    nameStepPhase = "fields";
    var consent = document.getElementById("lf-name-consent");
    if (consent) consent.hidden = true;
    updateNextButton();
  }

  function setApplicantConsent(value) {
    selections.applicantConsent = !!value;
    try {
      if (selections.applicantConsent) sessionStorage.setItem(STORAGE_KEYS.applicantConsent, "1");
      else sessionStorage.removeItem(STORAGE_KEYS.applicantConsent);
    } catch (e) {}
  }

  function showStep(step) {
    if (step === 1) {
      activeFlow = null;
    } else if (isCalculatorStep(step)) {
      activeFlow = "calculator";
    } else if (step > 1 && step < 14) {
      activeFlow = "quote";
    }
    currentStep = step;
    closeInfoTip();
    if (step !== 11 && !selections.applicantConsent) nameStepPhase = "fields";
    var isResults = step === 14;
    var isCalcResults = step === 25;
    document.body.classList.toggle("lf-landing--results", isResults);
    document.body.classList.toggle("lf-landing--calc-results", isCalcResults);
    steps.forEach(function (el) {
      var n = Number(el.getAttribute("data-step"));
      el.hidden = n !== step;
    });
    if (backBtn) backBtn.hidden = step <= 1 || isResults || isCalcResults;
    if (julieAfterNext) julieAfterNext.hidden = step !== 1 || isResults || isCalcResults;
    if (headerTagline) {
      headerTagline.hidden = step !== 1 || isResults || isCalcResults;
      if (step === 1) {
        headerTagline.textContent = "¿Listo para aprender más de gastos finales?";
      } else if (isCalculatorStep(step) && !isCalcResults) {
        headerTagline.hidden = false;
        headerTagline.textContent = "Calculadora de gastos finales";
      }
    }
    syncNameStepPhase();
    placeNextButton();
    if (isCalculatorStep(step) && window.MVILandingCalculator && window.MVILandingCalculator.onEnterStep) {
      window.MVILandingCalculator.onEnterStep(step);
    }
    refreshStepUI();
    updateNextButton();
    window.scrollTo(0, 0);
  }

  function tryAutoAdvanceCalc() {
    if (!isCalculatorStep(currentStep)) return;
    var step = getActiveStepEl();
    if (!step || !stepAutoAdvances(step)) return;
    window.setTimeout(function () {
      var next = getNextStepNumber(currentStep);
      if (next !== null) showStep(next);
    }, 180);
  }

  function showCalculatorStep(stepNum) {
    activeFlow = "calculator";
    showStep(stepNum);
  }

  function startQuoteFromCalculator(stateCode) {
    if (stateCode && isValidStateCode(stateCode)) {
      selections.state = String(stateCode).trim().toUpperCase();
      try {
        sessionStorage.setItem(STORAGE_KEYS.state, selections.state);
      } catch (e) {}
    }
    activeFlow = "quote";
    showStep(2);
  }

  function showQuoteResultsStep(quotePayload) {
    if (window.MVILandingQuoteResults && window.MVILandingQuoteResults.render) {
      window.MVILandingQuoteResults.render(quotePayload);
    }
    showStep(14);
  }

  function moveChoiceFocus(delta) {
    var choices = getActiveChoices();
    if (!choices.length) return;
    var active = document.activeElement;
    var idx = choices.indexOf(active);
    if (idx < 0) idx = 0;
    else idx = (idx + delta + choices.length) % choices.length;
    choices[idx].focus();
  }

  function moveSelection(delta) {
    var field = getActiveField();
    var choices = getActiveChoices();
    if (!field || !choices.length) return;
    var selected = getSelection(field);
    var idx = choices.findIndex(function (c) {
      return getChoiceValue(c) === selected;
    });
    if (idx < 0) idx = 0;
    else idx = (idx + delta + choices.length) % choices.length;
    var choice = choices[idx];
    setSelection(field, getChoiceValue(choice), { autoAdvance: stepAutoAdvances(getActiveStepEl()) });
    choice.focus();
  }

  function bindChoices() {
    document.querySelectorAll(CHOICE_SELECTOR).forEach(function (choice) {
      choice.addEventListener("click", function () {
        var step = choice.closest(".lf-step");
        if (!step || step.hidden) return;
        if (step.getAttribute("data-lf-flow") === "calculator") return;
        var field = step.getAttribute("data-field");
        var value = getChoiceValue(choice);
        if (getStepFieldType(step) === "multi") {
          toggleMultiSelection(field, value);
          return;
        }
        setSelection(field, value, { autoAdvance: stepAutoAdvances(step) });
      });
      choice.addEventListener("keydown", function (ev) {
        var step = choice.closest(".lf-step");
        if (!step || step.hidden) return;
        var field = step.getAttribute("data-field");
        var value = getChoiceValue(choice);
        if (getStepFieldType(step) === "multi") {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            toggleMultiSelection(field, value);
            return;
          }
          if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
            ev.preventDefault();
            moveChoiceFocus(1);
          } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
            ev.preventDefault();
            moveChoiceFocus(-1);
          }
          return;
        }
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          setSelection(field, value, { autoAdvance: stepAutoAdvances(step) });
          return;
        }
        if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
          ev.preventDefault();
          moveSelection(1);
        } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
          ev.preventDefault();
          moveSelection(-1);
        }
      });
    });
  }

  function submitLandingQuote() {
    if (!window.MVILandingQuoteSubmit || !window.MVILandingQuoteSubmit.submit) {
      if (document.body.getAttribute("data-inline-quote-results") === "1") return;
      window.location.replace(
        document.body.getAttribute("data-quote-results-href") || "../quote-results.html"
      );
      return;
    }
    window.MVILandingQuoteSubmit.submit({
      selections: selections,
      parseBirthdate: parseBirthdate,
      isValidBirthdate: isValidBirthdate,
      nextBtn: nextBtn,
      isSubmitting: function () {
        return quoteSubmitting;
      },
      setSubmitting: function (v) {
        quoteSubmitting = !!v;
        updateNextButton();
      },
      onQuoteComplete: function (quotePayload) {
        showQuoteResultsStep(quotePayload);
      },
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (currentStep === 11 && nameStepPhase === "consent") {
        hideNameConsentPhase();
        return;
      }
      if (isCalculatorStep(currentStep)) {
        var calcFirst =
          (window.MVILandingCalculator && window.MVILandingCalculator.FIRST_STEP) || 21;
        if (currentStep <= calcFirst) {
          showStep(1);
          return;
        }
      }
      var prev = getPrevStepNumber(currentStep);
      if (prev !== null) showStep(prev);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (isCalculatorStep(currentStep)) {
        if (
          window.MVILandingCalculator &&
          window.MVILandingCalculator.canProceed &&
          !window.MVILandingCalculator.canProceed(currentStep)
        ) {
          return;
        }
        var calcNext = getNextStepNumber(currentStep);
        if (calcNext !== null) {
          showStep(calcNext);
        }
        return;
      }
      var step = getActiveStepEl();
      if (
        stepRequiresSelection(step) ||
        getStepFieldType(step) === "date" ||
        getStepFieldType(step) === "select" ||
        getStepFieldType(step) === "name" ||
        getStepFieldType(step) === "email" ||
        getStepFieldType(step) === "phone"
      ) {
        var field = getActiveField();
        if (!fieldHasValue(step, field)) return;
      }
      if (currentStep === 2 && selections.state && selections.state !== "NE") {
        window.location.href =
          "../quote-out-of-state.html?state=" + encodeURIComponent(selections.state);
        return;
      }
      if (currentStep === 11 && nameStepPhase === "fields") {
        showNameConsentPhase();
        return;
      }
      if (currentStep === 11 && nameStepPhase === "consent") {
        setApplicantConsent(true);
      }
      var next = getNextStepNumber(currentStep);
      if (next !== null) {
        showStep(next);
        return;
      }
      submitLandingQuote();
    });
  }

  bindChoices();

  function bindBirthdateInput() {
    var input = document.getElementById("lf-birthdate-input");
    var hint = document.getElementById("lf-birthdate-hint");
    if (!input) return;

    var today = new Date();
    var minYear = today.getFullYear() - 100;
    var maxYear = today.getFullYear();

    function sync(formatted, showHint) {
      setDateValue("birthdate", formatted || null);
      var invalid = !!(formatted && !isValidBirthdate(formatted));
      var incomplete = !!(formatted && formatted.length > 0 && formatted.length < 10);
      input.classList.toggle("is-invalid", invalid || (incomplete && showHint));
      if (hint) hint.hidden = !(showHint && (invalid || incomplete));
    }

    if (window.MVILandingDateMask && window.MVILandingDateMask.attachBirthdateMask) {
      window.MVILandingDateMask.attachBirthdateMask(input, {
        minYear: minYear,
        maxYear: maxYear,
        onChange: sync,
      });
    } else {
      input.addEventListener("input", function () {
        sync(input.value, false);
      });
      input.addEventListener("blur", function () {
        sync(input.value, true);
      });
    }

    if (selections.birthdate) {
      input.value = selections.birthdate;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  bindBirthdateInput();

  function initStateCombobox() {
    var mount = document.getElementById("lf-state-combobox-mount");
    if (!mount || !window.MVILandingSearchCombobox) return;

    var initialName = selections.state ? stateNameFromCode(selections.state) : "";

    stateCombobox = window.MVILandingSearchCombobox.create(mount, {
      items: getStateListItems(),
      showCode: true,
      allowEmpty: true,
      placeholder: "Selecciona tu estado",
      inputId: "lf-state-combobox-input",
      listboxId: "lf-state-combobox-listbox",
      skipLabel: true,
      baseClass: "lf-state-combobox",
      value: initialName,
      autocomplete: "address-level1",
      onChange: function (name) {
        setStateValue("state", stateCodeFromName(name));
        var input = document.getElementById("lf-state-combobox-input");
        var hint = document.getElementById("lf-state-hint");
        if (input) input.classList.remove("is-invalid");
        if (hint) hint.hidden = true;
      },
    });

    var stateInput = document.getElementById("lf-state-combobox-input");
    if (stateInput) {
      stateInput.setAttribute("aria-describedby", "lf-state-hint");
      stateInput.addEventListener("focus", function () {
        if (stateCombobox) stateCombobox.open();
      });
      stateInput.addEventListener("blur", function () {
        window.setTimeout(function () {
          if (stateCombobox) stateCombobox.close();
          var invalid = !!(selections.state && !isValidStateCode(selections.state));
          stateInput.classList.toggle("is-invalid", invalid);
          var hint = document.getElementById("lf-state-hint");
          if (hint) hint.hidden = !invalid;
        }, 180);
      });
    }
  }

  function bindNameInputs() {
    var firstInput = document.getElementById("lf-first-name-input");
    var lastInput = document.getElementById("lf-last-name-input");
    if (!firstInput || !lastInput) return;

    function sync() {
      setNameValue("firstName", firstInput.value);
      setNameValue("lastName", lastInput.value);
    }

    firstInput.addEventListener("input", sync);
    lastInput.addEventListener("input", sync);
  }

  bindNameInputs();

  function bindEmailInput() {
    var input = document.getElementById("lf-email-input");
    var hint = document.getElementById("lf-email-hint");
    if (!input) return;

    function sync(value, showHint) {
      setEmailValue("email", value || null);
      var invalid = !!(value && !isValidEmail(value));
      input.classList.toggle("is-invalid", invalid && showHint);
      input.setAttribute("aria-invalid", invalid && showHint ? "true" : "false");
      if (hint) hint.hidden = !(showHint && invalid);
    }

    input.addEventListener("input", function () {
      sync(input.value, false);
    });
    input.addEventListener("blur", function () {
      sync(input.value, true);
    });
  }

  bindEmailInput();

  function setSmsConsent(value) {
    selections.smsConsent = !!value;
    try {
      if (selections.smsConsent) sessionStorage.setItem(STORAGE_KEYS.smsConsent, "1");
      else sessionStorage.removeItem(STORAGE_KEYS.smsConsent);
    } catch (e) {}
  }

  function bindPhoneInput() {
    var input = document.getElementById("lf-phone-input");
    var hint = document.getElementById("lf-phone-hint");
    var smsCheck = document.getElementById("lf-sms-consent");
    if (!input) return;

    function sync(value, showHint) {
      input.value = formatPhoneInput(value);
      setPhoneValue("phone", input.value || null);
      var invalid = !!(input.value && !isValidPhone(input.value));
      input.classList.toggle("is-invalid", invalid && showHint);
      input.setAttribute("aria-invalid", invalid && showHint ? "true" : "false");
      if (hint) hint.hidden = !(showHint && invalid);
    }

    input.addEventListener("input", function () {
      sync(input.value, false);
    });
    input.addEventListener("blur", function () {
      sync(input.value, true);
    });

    if (smsCheck) {
      smsCheck.addEventListener("change", function () {
        setSmsConsent(smsCheck.checked);
      });
    }
  }

  bindPhoneInput();

  function closeInfoTip() {
    document.querySelectorAll(".lf-info-popover").forEach(function (tip) {
      tip.hidden = true;
      tip.classList.remove("is-above", "is-below");
    });
    document.querySelectorAll(".lf-info-btn").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
    });
    var backdrop = document.getElementById("lf-legacy-info-backdrop");
    if (backdrop) backdrop.hidden = true;
  }

  function positionInfoTip(btn, tip) {
    var rect = btn.getBoundingClientRect();
    var margin = 12;
    var gap = 10;
    var prevVisibility = tip.style.visibility;
    tip.style.visibility = "hidden";
    tip.hidden = false;
    var tipRect = tip.getBoundingClientRect();
    var tipW = tipRect.width;
    var tipH = tipRect.height;
    tip.hidden = true;
    tip.style.visibility = prevVisibility;

    var left = rect.left + rect.width / 2 - tipW / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - tipW - margin));

    var belowTop = rect.bottom + gap;
    var aboveTop = rect.top - gap - tipH;
    var placeBelow = belowTop + tipH <= window.innerHeight - margin;
    var top = placeBelow ? belowTop : Math.max(margin, aboveTop);

    tip.style.left = left + "px";
    tip.style.top = top + "px";
    tip.classList.toggle("is-below", placeBelow);
    tip.classList.toggle("is-above", !placeBelow);

    var arrowX = rect.left + rect.width / 2 - left;
    arrowX = Math.max(18, Math.min(arrowX, tipW - 18));
    tip.style.setProperty("--lf-info-arrow-x", arrowX + "px");
  }

  function bindInfoTip() {
    var backdrop = document.getElementById("lf-legacy-info-backdrop");
    var triggers = document.querySelectorAll(".lf-info-btn[aria-controls]");
    if (!triggers.length) return;

    triggers.forEach(function (btn) {
      var tipId = btn.getAttribute("aria-controls");
      var tip = tipId ? document.getElementById(tipId) : null;
      if (!tip) return;

      btn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var willOpen = tip.hidden;
        closeInfoTip();
        if (willOpen) {
          positionInfoTip(btn, tip);
          if (backdrop) backdrop.hidden = false;
          tip.hidden = false;
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    if (backdrop) {
      backdrop.addEventListener("click", closeInfoTip);
    }

    document.querySelectorAll(".lf-info-popover").forEach(function (tip) {
      tip.addEventListener("click", function (ev) {
        ev.stopPropagation();
      });
    });

    window.addEventListener("resize", function () {
      var openBtn = document.querySelector(".lf-info-btn[aria-expanded='true']");
      if (!openBtn) return;
      var tipId = openBtn.getAttribute("aria-controls");
      var tip = tipId ? document.getElementById(tipId) : null;
      if (tip && !tip.hidden) positionInfoTip(openBtn, tip);
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closeInfoTip();
    });
  }

  bindInfoTip();

  try {
    var savedSex = sessionStorage.getItem(STORAGE_KEYS.sex);
    var savedBirthdate = sessionStorage.getItem(STORAGE_KEYS.birthdate);
    var savedTobacco = sessionStorage.getItem(STORAGE_KEYS.tobacco);
    var savedState = sessionStorage.getItem(STORAGE_KEYS.state);
    var savedFirstName = sessionStorage.getItem(STORAGE_KEYS.firstName);
    var savedLastName = sessionStorage.getItem(STORAGE_KEYS.lastName);
    var savedApplicantConsent = sessionStorage.getItem(STORAGE_KEYS.applicantConsent);
    var savedEmail = sessionStorage.getItem(STORAGE_KEYS.email);
    var savedPhone = sessionStorage.getItem(STORAGE_KEYS.phone);
    var savedSmsConsent = sessionStorage.getItem(STORAGE_KEYS.smsConsent);
    if (savedSex) selections.sex = savedSex;
    if (savedBirthdate) selections.birthdate = savedBirthdate;
    if (savedTobacco === "yes" || savedTobacco === "no") selections.tobacco = savedTobacco;
    if (savedState) selections.state = savedState;
    else selections.state = "NE";
    if (savedFirstName) selections.firstName = savedFirstName;
    if (savedLastName) selections.lastName = savedLastName;
    if (savedApplicantConsent === "1") {
      selections.applicantConsent = true;
      nameStepPhase = "consent";
    }
    if (savedEmail) selections.email = savedEmail;
    if (savedPhone) selections.phone = savedPhone;
    if (savedSmsConsent === "1") selections.smsConsent = true;
  } catch (e) {}

  initStateCombobox();

  var firstNameInput = document.getElementById("lf-first-name-input");
  var lastNameInput = document.getElementById("lf-last-name-input");
  if (firstNameInput && selections.firstName) firstNameInput.value = selections.firstName;
  if (lastNameInput && selections.lastName) lastNameInput.value = selections.lastName;

  var emailInput = document.getElementById("lf-email-input");
  if (emailInput && selections.email) emailInput.value = selections.email;

  var phoneInput = document.getElementById("lf-phone-input");
  if (phoneInput && selections.phone) {
    phoneInput.value = formatPhoneInput(selections.phone.replace(/^\+1/, ""));
  }
  var smsConsentCheck = document.getElementById("lf-sms-consent");
  if (smsConsentCheck) smsConsentCheck.checked = !!selections.smsConsent;

  (function bindObjectiveCards() {
    var grid = document.getElementById("lf-objective-grid");
    if (!grid) return;
    grid.addEventListener("click", function (ev) {
      var quoteCard = ev.target.closest('[data-lf-objective="quote"]');
      if (quoteCard) {
        ev.preventDefault();
        activeFlow = "quote";
        var next = getNextStepNumber(1);
        if (next !== null) showStep(next);
        return;
      }
      var calcCard = ev.target.closest('[data-lf-objective="calculator"]');
      if (calcCard) {
        ev.preventDefault();
        activeFlow = "calculator";
        var calcFirst =
          (window.MVILandingCalculator && window.MVILandingCalculator.FIRST_STEP) || 21;
        showStep(calcFirst);
      }
    });
  })();

  if (window.MVILandingCalculator && window.MVILandingCalculator.init) {
    window.MVILandingCalculator.init();
  }

  window.MVILandingFlow = {
    updateNextButton: updateNextButton,
    tryAutoAdvanceCalc: tryAutoAdvanceCalc,
    showCalculatorStep: showCalculatorStep,
    startQuoteFromCalculator: startQuoteFromCalculator,
  };

  (function bindScheduleModalFromObjectives() {
    var modalEl = document.getElementById("lf-schedule-modal");
    var iframe = document.getElementById("lf-schedule-iframe");
    if (!modalEl || modalEl.getAttribute("data-lf-schedule-bound") === "1") return;
    modalEl.setAttribute("data-lf-schedule-bound", "1");

    function setScheduleIframeSrc() {
      if (!iframe) return;
      var url = iframe.getAttribute("data-src-es");
      if (url) iframe.setAttribute("src", url);
      iframe.setAttribute("title", "Agendar cita con Julie");
    }

    modalEl.addEventListener("show.bs.modal", setScheduleIframeSrc);
    modalEl.addEventListener("show.bs.modal", function () {
      document.body.classList.add("lf-schedule-modal-open");
    });
    modalEl.addEventListener("hidden.bs.modal", function () {
      document.body.classList.remove("lf-schedule-modal-open");
    });
  })();

  (function bindResultsObjectiveCards() {
    var calcBtn = document.getElementById("lf-results-start-calc");
    if (calcBtn && calcBtn.getAttribute("data-lf-results-bound") !== "1") {
      calcBtn.setAttribute("data-lf-results-bound", "1");
      calcBtn.addEventListener("click", function () {
        activeFlow = "calculator";
        var calcFirst =
          (window.MVILandingCalculator && window.MVILandingCalculator.FIRST_STEP) || 21;
        showStep(calcFirst);
      });
    }
  })();

  showStep(1);

  try {
    if (new URLSearchParams(window.location.search).get("compliance-preview") === "phone") {
      activeFlow = "quote";
      currentStep = 13;
      showStep(13);
    }
  } catch (previewErr) {}

  (function bindLogoReset() {
    var logo = document.getElementById("lf-logo-reset");
    if (!logo) return;
    logo.addEventListener("click", function (e) {
      e.preventDefault();
      Object.keys(STORAGE_KEYS).forEach(function (key) {
        try {
          sessionStorage.removeItem(STORAGE_KEYS[key]);
        } catch (err) {}
      });
      if (window.MVILandingCalculator && window.MVILandingCalculator.clearProgress) {
        window.MVILandingCalculator.clearProgress();
      }
      window.location.href = "./";
    });
  })();
})();
