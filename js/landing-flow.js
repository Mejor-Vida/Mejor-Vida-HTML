(function () {
  var steps = Array.prototype.slice.call(document.querySelectorAll(".lf-step"));
  var maxBuiltStep = steps.reduce(function (max, el) {
    return Math.max(max, Number(el.getAttribute("data-step")) || 0);
  }, 0);
  var plannedSteps = Number(document.body.getAttribute("data-total-steps")) || maxBuiltStep;
  var TOTAL_STEPS = Math.max(maxBuiltStep, plannedSteps);
  var currentStep = 1;
  var selections = {
    goal: [],
    sex: null,
    estatePlan: null,
    birthdate: null,
    usResidency: null,
    zipCode: null,
    firstName: null,
    lastName: null,
    applicantConsent: false,
    email: null,
  };

  var progressRoot = document.querySelector(".lf-progress");
  var progressBar = document.getElementById("lf-progress-bar");
  var backBtn = document.getElementById("lf-btn-back");
  var nextBtn = document.getElementById("lf-btn-next");
  var nextDefaultAnchor = document.getElementById("lf-next-default-anchor");

  var STORAGE_KEYS = {
    goal: "mviLandingGoal",
    sex: "mviLandingSex",
    estatePlan: "mviLandingEstatePlan",
    birthdate: "mviLandingBirthdate",
    usResidency: "mviLandingUsResidency",
    zipCode: "mviLandingZipCode",
    firstName: "mviLandingFirstName",
    lastName: "mviLandingLastName",
    applicantConsent: "mviLandingApplicantConsent",
    email: "mviLandingEmail",
  };

  var nameStepPhase = "fields";

  var NEXT_LABELS = {
    8: "Next: Basic Details",
    default: "Next",
  };

  var CHOICE_SELECTOR = ".lf-goal-card, .lf-option-btn";

  var MULTI_FIELD_ORDER = {
    goal: ["protect-loved-ones", "inheritance", "funeral-expenses", "not-sure"],
  };

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

  function getVisibleStepNumbers() {
    return steps
      .filter(shouldShowStep)
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

  function isValidZipCode(value) {
    return /^\d{5}$/.test(String(value || "").trim());
  }

  function isValidLegalName(value) {
    return /^[A-Za-z][A-Za-z\s'.-]{1,49}$/.test(String(value || "").trim());
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
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
    if (getStepFieldType(stepEl) === "zip") {
      return isValidZipCode(value);
    }
    if (getStepFieldType(stepEl) === "name") {
      return isValidLegalName(selections.firstName) && isValidLegalName(selections.lastName);
    }
    if (getStepFieldType(stepEl) === "email") {
      return isValidEmail(value);
    }
    return !!value;
  }

  function updateProgress() {
    if (!progressBar) return;
    var nums = getVisibleStepNumbers();
    var idx = nums.indexOf(currentStep);
    var progressStep = idx >= 0 ? idx + 1 : currentStep;
    var pct = Math.round((progressStep / TOTAL_STEPS) * 100);
    pct = Math.max(0, Math.min(pct, 100));
    progressBar.style.width = pct + "%";
    if (progressRoot) progressRoot.setAttribute("aria-valuenow", String(pct));
  }

  function updateNextButton() {
    if (!nextBtn) return;
    var step = getActiveStepEl();
    if (stepAutoAdvances(step)) {
      nextBtn.hidden = true;
      return;
    }
    nextBtn.hidden = false;
    if (currentStep === 11) {
      nextBtn.textContent = nameStepPhase === "consent" ? "Continue" : (NEXT_LABELS[currentStep] || NEXT_LABELS.default);
    } else {
      nextBtn.textContent = NEXT_LABELS[currentStep] || NEXT_LABELS.default;
    }
    if (!stepRequiresSelection(step)) {
      nextBtn.disabled = false;
      return;
    }
    var field = getActiveField();
    nextBtn.disabled = !fieldHasValue(step, field);
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
          else goToQuote();
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

  function setZipValue(field, value) {
    var normalized = String(value || "").replace(/\D/g, "").slice(0, 5);
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

  function refreshZipStep(step) {
    var field = step.getAttribute("data-field");
    if (getStepFieldType(step) !== "zip" || field !== "zipCode") return;
    var input = document.getElementById("lf-zip-input");
    var hint = document.getElementById("lf-zip-hint");
    if (!input) return;
    input.value = selections.zipCode || "";
    input.classList.toggle("is-invalid", !!(input.value && !isValidZipCode(input.value)));
    if (hint) hint.hidden = !(input.value && !isValidZipCode(input.value));
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
    if (getStepFieldType(step) === "zip") {
      refreshZipStep(step);
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
    currentStep = step;
    closeInfoTip();
    if (step !== 11 && !selections.applicantConsent) nameStepPhase = "fields";
    steps.forEach(function (el) {
      var n = Number(el.getAttribute("data-step"));
      el.hidden = n !== step;
    });
    if (backBtn) backBtn.hidden = step <= 1;
    syncNameStepPhase();
    placeNextButton();
    refreshStepUI();
    updateProgress();
    window.scrollTo(0, 0);
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

  function goToQuote() {
    var params = new URLSearchParams();
    if (selections.goal && selections.goal.length) {
      params.set("goal", selections.goal.join(","));
    }
    if (selections.sex) {
      params.set("sex", selections.sex);
      params.set("gender", selections.sex);
    }
    if (selections.estatePlan) params.set("estatePlan", selections.estatePlan);
    if (selections.birthdate && isValidBirthdate(selections.birthdate)) {
      params.set("birthdate", selections.birthdate);
      var parsed = parseBirthdate(selections.birthdate);
      if (parsed) {
        params.set("dobMonth", String(parsed.month));
        params.set("dobDay", String(parsed.day));
        params.set("dobYear", String(parsed.year));
      }
    }
    if (selections.usResidency) params.set("usResidency", selections.usResidency);
    if (selections.zipCode) {
      params.set("zipCode", selections.zipCode);
      params.set("zip", selections.zipCode);
    }
    if (selections.firstName) params.set("firstName", selections.firstName);
    if (selections.lastName) params.set("lastName", selections.lastName);
    if (selections.firstName && selections.lastName) {
      params.set("name", selections.firstName + " " + selections.lastName);
    }
    if (selections.applicantConsent) params.set("applicantConsent", "1");
    if (selections.email && isValidEmail(selections.email)) params.set("email", selections.email);
    params.set("from", "landing");
    var productLine = document.body.getAttribute("data-product-line");
    if (productLine) params.set("productLine", productLine);
    var quoteHref = document.body.getAttribute("data-quote-href") || "../en/quote.html";
    window.location.href = quoteHref + "?" + params.toString();
  }

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (currentStep === 11 && nameStepPhase === "consent") {
        hideNameConsentPhase();
        return;
      }
      var prev = getPrevStepNumber(currentStep);
      if (prev !== null) showStep(prev);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var step = getActiveStepEl();
      if (stepRequiresSelection(step) || getStepFieldType(step) === "date" || getStepFieldType(step) === "zip" || getStepFieldType(step) === "name" || getStepFieldType(step) === "email") {
        var field = getActiveField();
        if (!fieldHasValue(step, field)) return;
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
      goToQuote();
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

  function bindZipInput() {
    var input = document.getElementById("lf-zip-input");
    var hint = document.getElementById("lf-zip-hint");
    if (!input) return;

    function sync(value, showHint) {
      var digits = String(value || "").replace(/\D/g, "").slice(0, 5);
      if (input.value !== digits) input.value = digits;
      setZipValue("zipCode", digits || null);
      var invalid = !!(digits && !isValidZipCode(digits));
      var incomplete = !!(digits && digits.length > 0 && digits.length < 5);
      input.classList.toggle("is-invalid", invalid || (incomplete && showHint));
      if (hint) hint.hidden = !(showHint && (invalid || incomplete));
    }

    input.addEventListener("input", function () {
      sync(input.value, false);
    });
    input.addEventListener("blur", function () {
      sync(input.value, true);
    });
  }

  bindZipInput();

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
    var savedGoal = sessionStorage.getItem(STORAGE_KEYS.goal);
    var savedSex = sessionStorage.getItem(STORAGE_KEYS.sex);
    var savedEstatePlan = sessionStorage.getItem(STORAGE_KEYS.estatePlan);
    var savedBirthdate = sessionStorage.getItem(STORAGE_KEYS.birthdate);
    var savedUsResidency = sessionStorage.getItem(STORAGE_KEYS.usResidency);
    var savedZipCode = sessionStorage.getItem(STORAGE_KEYS.zipCode);
    var savedFirstName = sessionStorage.getItem(STORAGE_KEYS.firstName);
    var savedLastName = sessionStorage.getItem(STORAGE_KEYS.lastName);
    var savedApplicantConsent = sessionStorage.getItem(STORAGE_KEYS.applicantConsent);
    var savedEmail = sessionStorage.getItem(STORAGE_KEYS.email);
    if (savedGoal) selections.goal = normalizeMultiValue(parseMultiValue(savedGoal), "goal");
    if (savedSex) selections.sex = savedSex;
    if (savedEstatePlan) selections.estatePlan = savedEstatePlan;
    if (savedBirthdate) selections.birthdate = savedBirthdate;
    if (savedUsResidency) selections.usResidency = savedUsResidency;
    if (savedZipCode) selections.zipCode = savedZipCode;
    if (savedFirstName) selections.firstName = savedFirstName;
    if (savedLastName) selections.lastName = savedLastName;
    if (savedApplicantConsent === "1") {
      selections.applicantConsent = true;
      nameStepPhase = "consent";
    }
    if (savedEmail) selections.email = savedEmail;
  } catch (e) {}

  var zipInput = document.getElementById("lf-zip-input");
  if (zipInput && selections.zipCode) zipInput.value = selections.zipCode;

  var firstNameInput = document.getElementById("lf-first-name-input");
  var lastNameInput = document.getElementById("lf-last-name-input");
  if (firstNameInput && selections.firstName) firstNameInput.value = selections.firstName;
  if (lastNameInput && selections.lastName) lastNameInput.value = selections.lastName;

  var emailInput = document.getElementById("lf-email-input");
  if (emailInput && selections.email) emailInput.value = selections.email;

  showStep(1);
})();
