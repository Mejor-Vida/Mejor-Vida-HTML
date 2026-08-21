(function () {
  "use strict";

  var DEV_PREVIEW_TOKEN = "dev-preview-local";
  var IS_LOCAL =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";
  var BUILD_PREVIEW = !!window.MI_BUILD_PREVIEW;
  var params = new URLSearchParams(window.location.search);
  var TOKEN = params.get("t") || "";
  var DEV_PREVIEW = BUILD_PREVIEW || (IS_LOCAL && params.get("preview") === "1");
  if (DEV_PREVIEW && !TOKEN) {
    TOKEN = DEV_PREVIEW_TOKEN;
  } else if (IS_LOCAL && !TOKEN && !BUILD_PREVIEW) {
    TOKEN = DEV_PREVIEW_TOKEN;
    DEV_PREVIEW = true;
  }
  var state = {
    healthInfo: {
      gender: "",
      birthdate: "",
      dobMonth: "",
      dobDay: "",
      dobYear: "",
      heightFt: null,
      heightIn: null,
      weightLbs: null,
      tobaccoUse: null,
    },
    providers: [],
    prescriptions: [],
    pharmacies: [],
    conditions: [],
  };

  var FREQUENCIES = [
    "per month",
    "per two months",
    "per three months",
    "per six months",
    "per year",
  ];
  var FREQUENCIES_ES = [
    "por mes",
    "cada dos meses",
    "cada tres meses",
    "cada seis meses",
    "por año",
  ];
  var DISTANCES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  var currentUiLang = "es";
  var landingMeta = { first_name: "", language: "Spanish" };
  var onFormScreen = false;
  var WIZARD_STEPS = [
    "gender",
    "birthdate",
    "height",
    "weight",
    "tobacco",
    "providers",
    "prescriptions",
    "pharmacy",
    "conditions",
    "submit",
  ];
  var wizardStepIndex = 0;
  var wizardWired = false;
  var onOpenProviderModal = null;
  var onOpenDrugModal = null;
  var onOpenPharmacyModal = null;
  var onOpenConditionModal = null;
  var returnToSubmitAfterEdit = false;
  var editReturnStepId = null;

  function tf(key, vars) {
    var s = t(key);
    if (!vars) return s;
    Object.keys(vars).forEach(function (k) {
      s = s.replace("{" + k + "}", String(vars[k]));
    });
    return s;
  }

  var I18N = {
    en: {
      seg_health: "HEALTH",
      seg_providers: "PROVIDERS",
      seg_rx: "PRESCRIPTIONS",
      seg_pharmacy: "PHARMACY",
      seg_conditions: "CONDITIONS",
      seg_review: "REVIEW",
      health_title: "Health Info",
      gender: "Gender",
      male: "Male",
      female: "Female",
      birthdate: "Birthdate",
      age: "Age",
      height: "Height",
      weight: "Weight (lbs)",
      tobacco: "Tobacco use",
      yes: "Yes",
      no: "No",
      providers: "Providers",
      prescriptions: "Prescriptions",
      pharmacy: "Pharmacy",
      conditions: "Conditions",
      add_new: "Add New +",
      remove_item: "Remove",
      empty_providers: "This contact has no providers.",
      empty_rx: "This contact has no prescriptions.",
      empty_pharmacy: "This contact has no pharmacy.",
      empty_conditions: "This contact has no conditions.",
      consent_prefix:
        "I understand that this questionnaire collects personal health information. I authorize Mejor Vida Insurance and its licensed agents to use the information I provide to evaluate insurance eligibility, prepare insurance options, and assist me with my insurance request. I understand that my information will be transmitted and stored securely and handled in accordance with the ",
      privacy_policy: "Privacy Policy",
      consent_suffix: ".",
      consent_note:
        "By submitting this questionnaire, you consent to the collection and use of your information for insurance evaluation purposes.",
      submit: "Submit Medical Profile",
      val_gender: "Male",
      val_female: "Female",
      val_none: "—",
      val_ready: "Ready",
      agent_title: "Licensed Life & Health Insurance Agent",
      agent_npn_label: "NPN",
      help_label: "Need help?",
      header_title: "Medical Questionnaire",
      header_subtitle: "Please complete before your scheduled call.",
      wa_label: "WhatsApp",
      julie_card_title: "Licensed Life & Health Insurance Agent",
      julie_card_npn: "Producer License #21695431",
      julie_card_langs: "English · Spanish",
      next: "Next",
      back: "Back",
      step_submit_title: "Review and submit",
      review_section_health: "Health information",
      review_section_medical: "Medical information",
      review_edit: "Edit",
      review_none: "None",
      review_age_years: "Age {age}",
      q_gender: "What is your gender?",
      q_birthdate: "What is your date of birth?",
      q_height: "What is your height?",
      q_weight: "What is your weight (lbs)?",
      q_tobacco: "Have you smoked or used tobacco in the last 12 months?",
      q_providers: "Who are your doctors or specialists?",
      q_prescriptions: "What prescriptions do you take?",
      q_pharmacy: "What is your preferred pharmacy?",
      q_conditions: "What health conditions have you been diagnosed with?",
      step_lead_providers: "Add any doctors or specialists you see. Tap Next if you have none.",
      step_lead_prescriptions: "Add any medications you take. Tap Next if you have none.",
      step_lead_pharmacy: "Add your preferred pharmacy. Tap Next if you have none.",
      step_lead_conditions: "Add any health conditions you have been diagnosed with. Tap Next if none apply.",
      err_gender: "Please select your gender.",
      err_birthdate: "Please select your date of birth.",
      err_birthdate_invalid: "Invalid date.",
      err_birthdate_min: "Birthdate must be for age 18 or older.",
      err_birthdate_max: "Birthdate must be for age 100 or younger.",
      err_height: "Please enter your height.",
      err_weight: "Please enter your weight in pounds.",
      err_tobacco: "Please select Yes or No.",
      err_consent: "Please confirm the authorization checkbox before submitting.",
      modal_add_providers: "Add Providers",
      modal_search_provider: "Search for a Provider",
      modal_zip_code: "Zip Code",
      modal_distance: "Distance",
      modal_search: "Search",
      modal_cancel: "Cancel",
      modal_add_provider: "Add Provider →",
      modal_zip_5: "Zip code must be 5 digits",
      modal_enter_provider: "Enter a provider name to search",
      modal_no_providers: "No providers found.",
      modal_searching: "Searching…",
      modal_search_failed: "Search failed.",
      modal_providers_found: "{count} Provider found",
      modal_providers_found_plural: "{count} Providers found",
      modal_add_prescriptions: "Add Prescriptions",
      modal_search_prescription: "Search for a Prescription",
      modal_add_prescription: "Add Prescription →",
      modal_enter_prescription: "Search for a Prescription",
      modal_prescription_min_chars: "Type at least 2 characters to search",
      modal_no_prescriptions: "No prescriptions found.",
      modal_prescriptions_found: "{count} prescription found",
      modal_prescriptions_found_plural: "{count} prescriptions found",
      modal_dosage: "Dosage",
      modal_dosage_unknown: "None / Unknown",
      modal_quantity: "Quantity",
      modal_frequency: "Frequency",
      modal_add_pharmacy: "Add Pharmacy",
      modal_search_pharmacy: "Search for a Pharmacy",
      modal_add_pharmacy_btn: "Add Pharmacy →",
      modal_address: "Address",
      modal_pharmacy_name: "Pharmacy Name",
      modal_physical: "Physical",
      modal_online: "Online",
      modal_no_pharmacies: "No pharmacies found.",
      modal_pharmacies_found: "{count} pharmacy found",
      modal_pharmacies_found_plural: "{count} pharmacies found",
      modal_add_condition: "Add a Condition",
      modal_search_condition: "Search for a condition",
      modal_search_condition_prompt: "Search for a Health Condition",
      modal_condition_translate_btn: "Translate to English",
      modal_condition_translated_label: "English:",
      modal_no_conditions: "No conditions found.",
      modal_conditions_found: "{count} condition found",
      modal_conditions_found_plural: "{count} conditions found",
      modal_next_btn: "Next →",
    },
    es: {
      seg_health: "SALUD",
      seg_providers: "PROVEEDORES",
      seg_rx: "RECETAS",
      seg_pharmacy: "FARMACIA",
      seg_conditions: "CONDICIONES",
      seg_review: "REVISIÓN",
      health_title: "Información de salud",
      gender: "Género",
      male: "Masculino",
      female: "Femenino",
      birthdate: "Fecha de nacimiento",
      age: "Edad",
      height: "Estatura",
      weight: "Peso (lbs)",
      tobacco: "Uso de tabaco",
      yes: "Sí",
      no: "No",
      providers: "Proveedores",
      prescriptions: "Recetas",
      pharmacy: "Farmacia",
      conditions: "Condiciones",
      add_new: "Agregar +",
      remove_item: "Eliminar",
      empty_providers: "Este contacto no tiene proveedores.",
      empty_rx: "Este contacto no tiene recetas.",
      empty_pharmacy: "Este contacto no tiene farmacia.",
      empty_conditions: "Este contacto no tiene condiciones.",
      consent_prefix:
        "Entiendo que este cuestionario recopila información personal de salud. Autorizo a Mejor Vida Insurance y a sus agentes licenciados a utilizar la información que proporciono para evaluar elegibilidad de seguro, preparar opciones de seguro y ayudarme con mi solicitud de seguro. Entiendo que mi información se transmitirá y almacenará de forma segura y se manejará de acuerdo con la ",
      privacy_policy: "Política de privacidad",
      consent_suffix: ".",
      consent_note:
        "Al enviar este cuestionario, usted consiente la recopilación y el uso de su información para fines de evaluación de seguro.",
      submit: "Enviar perfil médico",
      val_gender: "Masculino",
      val_female: "Femenino",
      val_none: "—",
      val_ready: "Listo",
      agent_title: "Agente licenciada de seguros de vida y salud",
      agent_npn_label: "N.º de productor",
      help_label: "¿Necesitas ayuda?",
      header_title: "Cuestionario médico",
      header_subtitle: "Complételo antes de su llamada programada.",
      wa_label: "WhatsApp",
      julie_card_title: "Agente de seguros licenciada",
      julie_card_npn: "Licencia de productor #21695431",
      julie_card_langs: "Inglés · Español",
      next: "Siguiente",
      back: "Atrás",
      step_submit_title: "Revisar y enviar",
      review_section_health: "Información de salud",
      review_section_medical: "Información médica",
      review_edit: "Editar",
      review_none: "Ninguno",
      review_age_years: "Edad {age}",
      q_gender: "¿Cuál es su género?",
      q_birthdate: "¿Cuál es su fecha de nacimiento?",
      q_height: "¿Cuál es su estatura?",
      q_weight: "¿Cuál es su peso (lbs)?",
      q_tobacco: "¿Ha fumado o usado tabaco en los últimos 12 meses?",
      q_providers: "¿Quiénes son sus médicos o especialistas?",
      q_prescriptions: "¿Qué medicamentos recetados toma?",
      q_pharmacy: "¿Cuál es su farmacia preferida?",
      q_conditions: "¿Qué condiciones de salud le han diagnosticado?",
      step_lead_providers: "Agregue médicos o especialistas que consulte. Toque Siguiente si no tiene ninguno.",
      step_lead_prescriptions: "Agregue medicamentos que tome. Toque Siguiente si no tiene ninguno.",
      step_lead_pharmacy: "Agregue su farmacia preferida. Toque Siguiente si no tiene ninguna.",
      step_lead_conditions: "Agregue condiciones de salud diagnosticadas. Toque Siguiente si no aplica ninguna.",
      err_gender: "Seleccione su género.",
      err_birthdate: "Seleccione su fecha de nacimiento.",
      err_birthdate_invalid: "Fecha no válida.",
      err_birthdate_min: "La fecha de nacimiento debe ser para edad de 18 años o más.",
      err_birthdate_max: "La fecha de nacimiento debe ser para edad de 100 años o menos.",
      err_height: "Ingrese su estatura.",
      err_weight: "Ingrese su peso en libras.",
      err_tobacco: "Seleccione Sí o No.",
      err_consent: "Confirme la casilla de autorización antes de enviar.",
      modal_add_providers: "Agregar proveedores",
      modal_search_provider: "Buscar un proveedor",
      modal_zip_code: "Código postal",
      modal_distance: "Distancia",
      modal_search: "Buscar",
      modal_cancel: "Cancelar",
      modal_add_provider: "Agregar proveedor →",
      modal_zip_5: "El código postal debe tener 5 dígitos",
      modal_enter_provider: "Ingrese el nombre de un proveedor para buscar",
      modal_no_providers: "No se encontraron proveedores.",
      modal_searching: "Buscando…",
      modal_search_failed: "Error en la búsqueda.",
      modal_providers_found: "{count} proveedor encontrado",
      modal_providers_found_plural: "{count} proveedores encontrados",
      modal_add_prescriptions: "Agregar recetas",
      modal_search_prescription: "Buscar una receta",
      modal_add_prescription: "Agregar receta →",
      modal_enter_prescription: "Buscar una receta",
      modal_prescription_min_chars: "Escriba al menos 2 caracteres para buscar",
      modal_no_prescriptions: "No se encontraron recetas.",
      modal_prescriptions_found: "{count} receta encontrada",
      modal_prescriptions_found_plural: "{count} recetas encontradas",
      modal_dosage: "Dosis",
      modal_dosage_unknown: "Ninguna / Desconocida",
      modal_quantity: "Cantidad",
      modal_frequency: "Frecuencia",
      modal_add_pharmacy: "Agregar farmacia",
      modal_search_pharmacy: "Buscar una farmacia",
      modal_add_pharmacy_btn: "Agregar farmacia →",
      modal_address: "Dirección",
      modal_pharmacy_name: "Nombre de la farmacia",
      modal_physical: "Física",
      modal_online: "En línea",
      modal_no_pharmacies: "No se encontraron farmacias.",
      modal_pharmacies_found: "{count} farmacia encontrada",
      modal_pharmacies_found_plural: "{count} farmacias encontradas",
      modal_add_condition: "Agregar una condición",
      modal_search_condition: "Buscar una condición",
      modal_search_condition_prompt: "Buscar una condición de salud",
      modal_condition_translate_btn: "Traducir al inglés",
      modal_condition_translated_label: "Inglés:",
      modal_no_conditions: "No se encontraron condiciones.",
      modal_conditions_found: "{count} condición encontrada",
      modal_conditions_found_plural: "{count} condiciones encontradas",
      modal_next_btn: "Siguiente →",
    },
  };

  function $(id) {
    return document.getElementById(id);
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(null, args);
      }, ms);
    };
  }

  function api(path, opts) {
    var url = path + (path.indexOf("?") >= 0 ? "&" : "?") + "t=" + encodeURIComponent(TOKEN);
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || j.ok === false) throw new Error(j.error || "request_failed");
        return j;
      });
    });
  }

  var DOB_MIN_AGE = 18;
  var DOB_MAX_AGE = 100;
  var MONTH_ABBR = {
    es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  };
  var miDobPickers = {};
  var miDobPickerDocBound = false;

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function ageFromDob(y, mo, d) {
    var birth = new Date(y, mo - 1, d);
    if (Number.isNaN(birth.getTime())) return null;
    if (birth.getFullYear() !== y || birth.getMonth() !== mo - 1 || birth.getDate() !== d) return null;
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var md = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age;
  }

  function dobPlaceholder(part) {
    if (part === "month") return currentUiLang === "es" ? "Mes" : "Month";
    if (part === "day") return currentUiLang === "es" ? "Día" : "Day";
    return currentUiLang === "es" ? "Año" : "Year";
  }

  function monthOptionLabel(num) {
    var abbr = MONTH_ABBR[currentUiLang][num - 1];
    return num + " " + abbr;
  }

  function monthOptionsList() {
    return [{ value: "", label: dobPlaceholder("month") }].concat(
      Array.from({ length: 12 }, function (_, i) {
        var v = String(i + 1);
        return { value: v, label: monthOptionLabel(i + 1) };
      })
    );
  }

  function daysInMonth(month, year) {
    if (!month) return 31;
    var m = parseInt(month, 10);
    if (!m || m < 1 || m > 12) return 31;
    var y = year ? parseInt(year, 10) : 2000;
    if (m === 2) {
      var leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      return leap ? 29 : 28;
    }
    if (m === 4 || m === 6 || m === 9 || m === 11) return 30;
    return 31;
  }

  function dayOptionsList() {
    var h = state.healthInfo;
    var maxDay = daysInMonth(h.dobMonth, h.dobYear);
    return [{ value: "", label: dobPlaceholder("day") }].concat(
      Array.from({ length: maxDay }, function (_, i) {
        var v = String(i + 1);
        return { value: v, label: v };
      })
    );
  }

  function yearOptionsList() {
    var now = new Date();
    var maxYear = now.getFullYear() - DOB_MIN_AGE;
    var minYear = now.getFullYear() - DOB_MAX_AGE;
    var list = [{ value: "", label: dobPlaceholder("year") }];
    for (var y = maxYear; y >= minYear; y--) {
      list.push({ value: String(y), label: String(y) });
    }
    return list;
  }

  function syncBirthdateFromDobParts() {
    var h = state.healthInfo;
    if (h.dobYear && h.dobMonth && h.dobDay) {
      h.birthdate =
        h.dobYear +
        "-" +
        pad2(parseInt(h.dobMonth, 10)) +
        "-" +
        pad2(parseInt(h.dobDay, 10));
    } else {
      h.birthdate = "";
    }
  }

  function birthdateAge() {
    var h = state.healthInfo;
    if (!h.dobMonth || !h.dobDay || !h.dobYear) return null;
    return ageFromDob(parseInt(h.dobYear, 10), parseInt(h.dobMonth, 10), parseInt(h.dobDay, 10));
  }

  function validateBirthdateStep() {
    var h = state.healthInfo;
    if (!h.dobMonth || !h.dobDay || !h.dobYear) return t("err_birthdate");
    var age = birthdateAge();
    if (age == null) return t("err_birthdate_invalid");
    if (age < DOB_MIN_AGE) return t("err_birthdate_min");
    if (age > DOB_MAX_AGE) return t("err_birthdate_max");
    syncBirthdateFromDobParts();
    return "";
  }

  function closeAllMiDobPickerMenus() {
    document.querySelectorAll(".mvi-dob-picker.is-open").forEach(function (wrap) {
      wrap.classList.remove("is-open");
      var menu = wrap.querySelector(".mvi-dob-picker-menu");
      var btn = wrap.querySelector(".mvi-dob-picker-btn");
      if (menu) menu.hidden = true;
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function refreshMiDobDayOptions() {
    var h = state.healthInfo;
    var maxDay = daysInMonth(h.dobMonth, h.dobYear);
    if (h.dobDay && parseInt(h.dobDay, 10) > maxDay) {
      h.dobDay = String(maxDay);
      var dayEl = $("mi-dob-day");
      if (dayEl) dayEl.value = h.dobDay;
    }
    if (miDobPickers.day) miDobPickers.day.setOptions(dayOptionsList());
  }

  function syncMiDobStateFromPickers() {
    var mo = $("mi-dob-month");
    var day = $("mi-dob-day");
    var year = $("mi-dob-year");
    state.healthInfo.dobMonth = mo ? mo.value : "";
    state.healthInfo.dobDay = day ? day.value : "";
    state.healthInfo.dobYear = year ? year.value : "";
    refreshMiDobDayOptions();
    syncBirthdateFromDobParts();
    updateAgeDisplay();
  }

  function createMiDobPicker(wrap, part, options) {
    var hiddenId = "mi-dob-" + part;
    var h = state.healthInfo;
    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = hiddenId;
    hidden.value =
      part === "month" ? h.dobMonth || "" : part === "day" ? h.dobDay || "" : h.dobYear || "";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mvi-dob-picker-btn form-select";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute(
      "aria-label",
      part === "month" ? dobPlaceholder("month") : part === "day" ? dobPlaceholder("day") : dobPlaceholder("year")
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
      if (
        !opts.some(function (o) {
          return o.value === hidden.value;
        })
      ) {
        hidden.value = "";
        if (part === "month") h.dobMonth = "";
        if (part === "day") h.dobDay = "";
        if (part === "year") h.dobYear = "";
      }
      syncLabel();
    }

    renderMenu(options);
    syncLabel();

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var willOpen = menu.hidden;
      closeAllMiDobPickerMenus();
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
      if (part === "month") h.dobMonth = hidden.value;
      if (part === "day") h.dobDay = hidden.value;
      if (part === "year") h.dobYear = hidden.value;
      syncLabel();
      closeAllMiDobPickerMenus();
      hidden.dispatchEvent(new Event("change", { bubbles: true }));
      syncMiDobStateFromPickers();
      showStepError("birthdate", "");
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    wrap.appendChild(hidden);

    return { setOptions: setOptions, syncLabel: syncLabel };
  }

  function initMiDobPickers() {
    var parts = [
      { part: "month", wrapId: "mi-dob-month-wrap", options: monthOptionsList() },
      { part: "day", wrapId: "mi-dob-day-wrap", options: dayOptionsList() },
      { part: "year", wrapId: "mi-dob-year-wrap", options: yearOptionsList() },
    ];
    parts.forEach(function (cfg) {
      var wrap = $(cfg.wrapId);
      if (!wrap || wrap.dataset.ready === "1") return;
      miDobPickers[cfg.part] = createMiDobPicker(wrap, cfg.part, cfg.options);
      wrap.dataset.ready = "1";
    });
    if (!miDobPickerDocBound) {
      miDobPickerDocBound = true;
      document.addEventListener("click", closeAllMiDobPickerMenus);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeAllMiDobPickerMenus();
      });
    }
    refreshMiDobPickerLabels();
  }

  function refreshMiDobPickerLabels() {
    if (miDobPickers.month) miDobPickers.month.setOptions(monthOptionsList());
    refreshMiDobDayOptions();
    if (miDobPickers.year) miDobPickers.year.setOptions(yearOptionsList());
    ["mi-dob-month", "mi-dob-day", "mi-dob-year"].forEach(function (id, i) {
      var el = $(id);
      var part = ["dobMonth", "dobDay", "dobYear"][i];
      if (el) el.value = state.healthInfo[part] || "";
    });
    if (miDobPickers.month) miDobPickers.month.syncLabel();
    if (miDobPickers.day) miDobPickers.day.syncLabel();
    if (miDobPickers.year) miDobPickers.year.syncLabel();
  }

  function calcAge(dob) {
    if (!dob) return "—";
    var parts = dob.split("-");
    if (parts.length !== 3) return "—";
    var age = ageFromDob(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10));
    if (age == null || age < DOB_MIN_AGE || age > DOB_MAX_AGE) return "—";
    return String(age);
  }

  function updateAgeDisplay() {
    var el = $("mi-age-display");
    if (!el) return;
    var age = birthdateAge();
    el.textContent = age == null ? "—" : String(age);
  }

  function renderLists() {
    renderList("providers", state.providers, function (p) {
      return (p.name || "Provider") + (p.specialty ? " — " + p.specialty : "") + (p.npi ? " (NPI " + p.npi + ")" : "");
    });
    renderList("prescriptions", state.prescriptions, function (p) {
      return (p.drugName || "") + " — " + (p.dosage || "") + ", qty " + (p.quantity || "") + ", " + (p.frequency || "");
    });
    renderList("pharmacies", state.pharmacies, function (p) {
      return (p.name || "Pharmacy") + " — " + [p.address_line, p.city, p.state, p.zip].filter(Boolean).join(", ");
    });
    renderList("conditions", state.conditions, function (c) {
      return (c.name || "") + (c.icd10_code ? " (" + c.icd10_code + ")" : "");
    });
    ["providers", "prescriptions", "pharmacies", "conditions"].forEach(function (k) {
      var cnt = $("mi-count-" + k);
      if (cnt) cnt.textContent = "(" + state[k].length + ")";
    });
    if (currentWizardStepId() === "submit") renderReviewSummary();
  }

  function reviewGenderValue() {
    var g = state.healthInfo.gender;
    if (!g) return t("review_none");
    if (g === "Male") return t("male");
    if (g === "Female") return t("female");
    return g;
  }

  function reviewBirthdateValue() {
    var h = state.healthInfo;
    if (!h.birthdate) return t("review_none");
    var parts = h.birthdate.split("-");
    if (parts.length !== 3) return h.birthdate;
    var display = parts[1] + "/" + parts[2] + "/" + parts[0];
    var age = birthdateAge();
    if (age != null) display += " (" + tf("review_age_years", { age: age }) + ")";
    return display;
  }

  function reviewHeightValue() {
    var h = state.healthInfo;
    if (h.heightFt == null || h.heightIn == null) return t("review_none");
    return h.heightFt + " ft " + h.heightIn + " in";
  }

  function reviewWeightValue() {
    var w = state.healthInfo.weightLbs;
    if (!w) return t("review_none");
    return w + " lbs";
  }

  function reviewTobaccoValue() {
    var v = state.healthInfo.tobaccoUse;
    if (v === true) return t("yes");
    if (v === false) return t("no");
    return t("review_none");
  }

  function reviewListValue(key, labelFn) {
    var items = state[key] || [];
    if (!items.length) return t("review_none");
    return items.map(labelFn);
  }

  function renderReviewRow(label, valueHtml, stepId, block) {
    return (
      '<div class="mi-review-row' +
      (block ? " mi-review-row--block" : "") +
      '">' +
      '<div class="mi-review-row-main">' +
      '<span class="mi-review-label">' +
      escapeHtml(label) +
      "</span>" +
      (block
        ? '<ul class="mi-review-value-list">' +
          valueHtml +
          "</ul>"
        : '<span class="mi-review-value">' + valueHtml + "</span>") +
      "</div>" +
      '<button type="button" class="mi-review-edit" data-mi-edit-step="' +
      escapeHtml(stepId) +
      '">' +
      escapeHtml(t("review_edit")) +
      "</button></div>"
    );
  }

  function renderReviewSummary() {
    var wrap = $("mi-review-summary");
    if (!wrap) return;
    var html = "";
    html +=
      '<h3 class="mi-review-section-title">' +
      escapeHtml(t("review_section_health")) +
      "</h3>";
    html += renderReviewRow(t("gender"), escapeHtml(reviewGenderValue()), "gender", false);
    html += renderReviewRow(t("birthdate"), escapeHtml(reviewBirthdateValue()), "birthdate", false);
    html += renderReviewRow(t("height"), escapeHtml(reviewHeightValue()), "height", false);
    html += renderReviewRow(t("weight"), escapeHtml(reviewWeightValue()), "weight", false);
    html += renderReviewRow(t("tobacco"), escapeHtml(reviewTobaccoValue()), "tobacco", false);

    html +=
      '<h3 class="mi-review-section-title">' +
      escapeHtml(t("review_section_medical")) +
      "</h3>";

    var providers = reviewListValue("providers", function (p) {
      return (p.name || "Provider") + (p.specialty ? " — " + p.specialty : "") + (p.npi ? " (NPI " + p.npi + ")" : "");
    });
    html += renderReviewRow(
      t("providers"),
      Array.isArray(providers)
        ? providers.map(function (line) {
            return "<li>" + escapeHtml(line) + "</li>";
          }).join("")
        : escapeHtml(providers),
      "providers",
      Array.isArray(providers)
    );

    var rx = reviewListValue("prescriptions", function (p) {
      return (p.drugName || "") + " — " + (p.dosage || "") + ", qty " + (p.quantity || "") + ", " + (p.frequency || "");
    });
    html += renderReviewRow(
      t("prescriptions"),
      Array.isArray(rx)
        ? rx.map(function (line) {
            return "<li>" + escapeHtml(line) + "</li>";
          }).join("")
        : escapeHtml(rx),
      "prescriptions",
      Array.isArray(rx)
    );

    var pharmacies = reviewListValue("pharmacies", function (p) {
      return (p.name || "Pharmacy") + " — " + [p.address_line, p.city, p.state, p.zip].filter(Boolean).join(", ");
    });
    html += renderReviewRow(
      t("pharmacy"),
      Array.isArray(pharmacies)
        ? pharmacies.map(function (line) {
            return "<li>" + escapeHtml(line) + "</li>";
          }).join("")
        : escapeHtml(pharmacies),
      "pharmacy",
      Array.isArray(pharmacies)
    );

    var conditions = reviewListValue("conditions", function (c) {
      return (c.name || "") + (c.icd10_code ? " (" + c.icd10_code + ")" : "");
    });
    html += renderReviewRow(
      t("conditions"),
      Array.isArray(conditions)
        ? conditions.map(function (line) {
            return "<li>" + escapeHtml(line) + "</li>";
          }).join("")
        : escapeHtml(conditions),
      "conditions",
      Array.isArray(conditions)
    );

    wrap.innerHTML = html;
  }

  function jumpToStepFromReview(stepId) {
    var idx = WIZARD_STEPS.indexOf(stepId);
    if (idx < 0) return;
    editReturnStepId = stepId;
    returnToSubmitAfterEdit = true;
    goToWizardStep(idx);
  }

  function wireReviewSummary() {
    var wrap = $("mi-review-summary");
    if (!wrap || wrap.dataset.miReviewWired === "1") return;
    wrap.dataset.miReviewWired = "1";
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-mi-edit-step]");
      if (!btn) return;
      e.preventDefault();
      jumpToStepFromReview(btn.getAttribute("data-mi-edit-step"));
    });
  }

  function renderList(key, items, labelFn) {
    var list = $("mi-list-" + key);
    var empty = $("mi-empty-" + key);
    if (!list) return;
    if (!items.length) {
      list.innerHTML = "";
      if (empty) empty.classList.remove("mi-hidden");
      return;
    }
    if (empty) empty.classList.add("mi-hidden");
    list.innerHTML = items
      .map(function (item, idx) {
        return (
          '<div class="mi-list-item"><span class="mi-list-item-label">' +
          escapeHtml(labelFn(item)) +
          '</span><button type="button" class="mi-remove" aria-label="' +
          escapeHtml(t("remove_item")) +
          '" data-key="' +
          key +
          '" data-idx="' +
          idx +
          '"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></div>'
        );
      })
      .join("");
    list.querySelectorAll(".mi-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.getAttribute("data-key");
        var i = parseInt(btn.getAttribute("data-idx"), 10);
        state[k].splice(i, 1);
        renderLists();
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isSpanishLang(lang) {
    if (lang != null) return /spanish|español|espanol|^es$/i.test(String(lang || ""));
    return currentUiLang === "es";
  }

  function uiLangFromMeta(lang) {
    var s = lang != null ? String(lang).trim() : "";
    if (!s) return "es";
    return isSpanishLang(s) ? "es" : "en";
  }

  function t(key) {
    var pack = I18N[currentUiLang] || I18N.en;
    return pack[key] != null ? pack[key] : key;
  }

  function setUiLang(lang) {
    currentUiLang = lang === "es" ? "es" : "en";
    landingMeta.language = currentUiLang === "es" ? "Spanish" : "English";
    document.documentElement.className = "lang-" + currentUiLang;
    document.documentElement.lang = currentUiLang;
    var logo = $("mi-header-logo");
    if (logo) {
      logo.src =
        currentUiLang === "es" ? "/img/logo-spanish2.png" : "/img/logo-english2.png";
    }
    document.querySelectorAll("[data-mi-lang-btn]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-mi-lang-btn") === currentUiLang);
    });
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (I18N[currentUiLang][key]) el.textContent = I18N[currentUiLang][key];
    });
    applyFormLabels();
    paintChromeCopy();
    paintLandingCopy();
    refreshMiDobPickerLabels();
    updateProgressBar();
  }

  var WA_LINKS = {
    en: "https://wa.me/14024405438?text=Hello%2C%20I%20have%20a%20question%20about%20my%20medical%20questionnaire.",
    es: "https://wa.me/14024405438?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20mi%20cuestionario%20m%C3%A9dico.",
  };

  function paintChromeCopy() {
    var helpLabel = $("mi-help-label");
    if (helpLabel) helpLabel.textContent = t("help_label");
    var headerTitle = $("mi-header-title");
    if (headerTitle) headerTitle.textContent = t("header_title");
    var headerSubtitle = $("mi-header-subtitle");
    if (headerSubtitle) headerSubtitle.textContent = t("header_subtitle");
    var wa = $("mi-header-wa");
    if (wa) {
      wa.href = WA_LINKS[currentUiLang] || WA_LINKS.en;
      var waLbl = wa.querySelector(".mi-wa-label");
      if (waLbl) waLbl.textContent = t("wa_label");
    }
    var julieTitle = $("mi-julie-card-title");
    if (julieTitle) julieTitle.textContent = t("julie_card_title");
    var julieNpn = $("mi-julie-card-npn");
    if (julieNpn) julieNpn.textContent = t("julie_card_npn");
    var julieLangs = $("mi-julie-card-langs");
    if (julieLangs) julieLangs.textContent = t("julie_card_langs");
  }

  function wireLangToggle() {
    var wrap = document.querySelector(".mi-lang-toggle");
    if (!wrap || wrap.dataset.miLangWired === "1") return;
    wrap.dataset.miLangWired = "1";
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-mi-lang-btn]");
      if (!btn) return;
      e.preventDefault();
      setUiLang(btn.getAttribute("data-mi-lang-btn"));
    });
  }

  function applyFormLabels() {
    var titleMap = {
      "mi-step-title-gender": "q_gender",
      "mi-step-title-birthdate": "q_birthdate",
      "mi-step-title-height": "q_height",
      "mi-step-title-weight": "q_weight",
      "mi-step-title-tobacco": "q_tobacco",
      "mi-step-title-providers": "q_providers",
      "mi-step-title-prescriptions": "q_prescriptions",
      "mi-step-title-pharmacy": "q_pharmacy",
      "mi-step-title-conditions": "q_conditions",
      "mi-step-title-submit": "step_submit_title",
    };
    Object.keys(titleMap).forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = t(titleMap[id]);
    });
    var ageLabel = $("mi-age-label");
    if (ageLabel) ageLabel.textContent = t("age");
    document.querySelectorAll("[data-gender]").forEach(function (btn) {
      btn.textContent = btn.getAttribute("data-gender") === "Male" ? t("male") : t("female");
    });
    document.querySelectorAll("[data-tobacco]").forEach(function (btn) {
      btn.textContent = btn.getAttribute("data-tobacco") === "yes" ? t("yes") : t("no");
    });
    document.querySelectorAll(".mi-add-btn").forEach(function (btn) {
      btn.textContent = t("add_new");
    });
    var leadMap = {
      "mi-step-lead-providers": "step_lead_providers",
      "mi-step-lead-prescriptions": "step_lead_prescriptions",
      "mi-step-lead-pharmacy": "step_lead_pharmacy",
      "mi-step-lead-conditions": "step_lead_conditions",
    };
    Object.keys(leadMap).forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = t(leadMap[id]);
    });
    var emptyMap = ["empty_providers", "empty_rx", "empty_pharmacy", "empty_conditions"];
    ["mi-empty-providers", "mi-empty-prescriptions", "mi-empty-pharmacies", "mi-empty-conditions"].forEach(
      function (id, i) {
        var el = $(id);
        if (el) el.textContent = t(emptyMap[i]);
      }
    );
    var consentText = $("mi-consent-text");
    if (consentText) {
      var policyUrl =
        currentUiLang === "es" ? "/privacy-policy.html" : "/en/privacy-policy.html";
      consentText.innerHTML =
        escapeHtml(t("consent_prefix")) +
        '<a href="' +
        policyUrl +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(t("privacy_policy")) +
        "</a>" +
        escapeHtml(t("consent_suffix"));
    }
    var consentNote = $("mi-consent-note");
    if (consentNote) consentNote.textContent = t("consent_note");
    var submitBtn = $("mi-submit-btn");
    if (submitBtn) submitBtn.textContent = t("submit");
    var nextLabel = $("mi-wizard-next-label");
    if (nextLabel) nextLabel.textContent = t("next");
    var backLabel = $("mi-wizard-back-label");
    if (backLabel) backLabel.textContent = "← " + t("back");
    applyProviderModalLabels();
    applyDrugModalLabels();
    applyPharmacyModalLabels();
    applyConditionModalLabels();
  }

  function applyConditionModalLabels() {
    var titleMap = {
      "mi-condition-modal-title": "modal_add_condition",
      "mi-condition-search-label": "modal_search_condition",
      "mi-condition-cancel": "modal_cancel",
      "mi-condition-next-label": "modal_next_btn",
      "mi-condition-translate-btn-label": "modal_condition_translate_btn",
      "mi-condition-translated-label": "modal_condition_translated_label",
    };
    Object.keys(titleMap).forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = t(titleMap[id]);
    });
    var searchIn = $("mi-condition-search");
    if (searchIn) searchIn.placeholder = t("modal_search");
    var translateBtn = $("mi-condition-translate-btn");
    var searchWrap = document.querySelector("#mi-modal-condition .mi-condition-search-wrap");
    if (translateBtn) translateBtn.classList.toggle("mi-hidden", currentUiLang !== "es");
    if (searchWrap) {
      searchWrap.classList.toggle("mi-condition-search-wrap--compact", currentUiLang === "es");
      searchWrap.classList.toggle("mi-condition-search-wrap--full", currentUiLang !== "es");
    }
  }

  function applyPharmacyModalLabels() {
    var titleMap = {
      "mi-pharmacy-modal-title": "modal_add_pharmacy",
      "mi-pharmacy-modal-subtitle": "modal_search_pharmacy",
      "mi-pharmacy-zip-label": "modal_zip_code",
      "mi-pharmacy-distance-label": "modal_distance",
      "mi-pharmacy-address-label": "modal_address",
      "mi-pharmacy-name-label": "modal_pharmacy_name",
      "mi-pharmacy-cancel": "modal_cancel",
      "mi-pharmacy-add-label": "modal_add_pharmacy_btn",
    };
    Object.keys(titleMap).forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = t(titleMap[id]);
    });
    var tabP = $("mi-pharm-tab-physical");
    var tabO = $("mi-pharm-tab-online");
    if (tabP) tabP.textContent = t("modal_physical");
    if (tabO) tabO.textContent = t("modal_online");
    var nameIn = $("mi-pharmacy-name");
    if (nameIn) nameIn.placeholder = t("modal_search");
  }

  function applyDrugModalLabels() {
    var titleMap = {
      "mi-drug-modal-title": "modal_add_prescriptions",
      "mi-drug-modal-subtitle": "modal_search_prescription",
      "mi-drug-search-label": "modal_search",
      "mi-drug-cancel": "modal_cancel",
      "mi-drug-add-label": "modal_add_prescription",
      "mi-drug-dosage-label": "modal_dosage",
      "mi-drug-qty-label": "modal_quantity",
      "mi-drug-frequency-label": "modal_frequency",
    };
    Object.keys(titleMap).forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = t(titleMap[id]);
    });
    var searchIn = $("mi-drug-search");
    if (searchIn) searchIn.placeholder = t("modal_search");
  }

  function applyProviderModalLabels() {
    var titleMap = {
      "mi-provider-modal-title": "modal_add_providers",
      "mi-provider-modal-subtitle": "modal_search_provider",
      "mi-provider-zip-label": "modal_zip_code",
      "mi-provider-distance-label": "modal_distance",
      "mi-provider-search-label": "modal_search",
      "mi-provider-cancel": "modal_cancel",
      "mi-provider-add-label": "modal_add_provider",
    };
    Object.keys(titleMap).forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = t(titleMap[id]);
    });
    var searchIn = $("mi-provider-search");
    if (searchIn) searchIn.placeholder = t("modal_search");
  }

  function healthInfoComplete() {
    var h = state.healthInfo;
    return !!(
      h.gender &&
      h.birthdate &&
      h.heightFt != null &&
      h.heightIn != null &&
      h.weightLbs &&
      h.tobaccoUse !== null
    );
  }

  function currentWizardStepId() {
    return WIZARD_STEPS[wizardStepIndex] || WIZARD_STEPS[0];
  }

  function normalizeHeightForStep() {
    if (state.healthInfo.heightFt != null && state.healthInfo.heightIn == null) {
      state.healthInfo.heightIn = 0;
      var el = $("mi-height-in");
      if (el && el.value === "") el.value = "0";
    }
  }

  function showStepError(stepId, message) {
    WIZARD_STEPS.forEach(function (s) {
      var err = $("mi-step-err-" + s);
      if (err) err.classList.add("mi-hidden");
    });
    if (!message) return;
    var el = $("mi-step-err-" + stepId);
    if (el) {
      el.textContent = message;
      el.classList.remove("mi-hidden");
    }
  }

  function validateWizardStep(stepId) {
    var h = state.healthInfo;
    if (stepId === "gender") {
      if (!h.gender) return t("err_gender");
      return "";
    }
    if (stepId === "birthdate") {
      return validateBirthdateStep();
    }
    if (stepId === "height") {
      normalizeHeightForStep();
      if (h.heightFt == null || h.heightIn == null) return t("err_height");
      return "";
    }
    if (stepId === "weight") {
      if (!h.weightLbs) return t("err_weight");
      return "";
    }
    if (stepId === "tobacco") {
      if (h.tobaccoUse === null) return t("err_tobacco");
      return "";
    }
    if (stepId === "submit") {
      var consent = $("mi-consent");
      if (!consent || !consent.checked) return t("err_consent");
      return "";
    }
    return "";
  }

  function syncChoiceButtons() {
    document.querySelectorAll("[data-gender]").forEach(function (btn) {
      btn.classList.toggle("is-selected", btn.getAttribute("data-gender") === state.healthInfo.gender);
    });
    document.querySelectorAll("[data-tobacco]").forEach(function (btn) {
      var val = btn.getAttribute("data-tobacco");
      var selected =
        state.healthInfo.tobaccoUse === null
          ? false
          : val === "yes"
            ? state.healthInfo.tobaccoUse === true
            : state.healthInfo.tobaccoUse === false;
      btn.classList.toggle("is-selected", selected);
    });
  }

  function goToWizardStep(index) {
    wizardStepIndex = Math.max(0, Math.min(index, WIZARD_STEPS.length - 1));
    var stepId = currentWizardStepId();
    document.querySelectorAll(".mi-step").forEach(function (step) {
      var active = step.getAttribute("data-mi-step") === stepId;
      step.classList.toggle("is-active", active);
      step.classList.toggle("mi-hidden", !active);
    });
    showStepError(stepId, "");
    var nextBtn = $("mi-wizard-next");
    var onSubmit = stepId === "submit";
    if (nextBtn) nextBtn.hidden = onSubmit;
    syncChoiceButtons();
    var activeStep = document.querySelector('.mi-step[data-mi-step="' + stepId + '"]');
    if (activeStep) {
      var focusEl = activeStep.querySelector(
        "input, .mvi-quote-choice-btn[data-gender], .mvi-quote-choice-btn[data-tobacco], .mvi-dob-picker-btn"
      );
      if (focusEl && typeof focusEl.focus === "function") focusEl.focus();
    }
    updateProgressBar();
    if (stepId === "birthdate") {
      refreshMiDobDayOptions();
      updateAgeDisplay();
    }
    if (stepId === "submit") renderReviewSummary();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function wireWizard() {
    if (wizardWired) return;
    wizardWired = true;
    var nextBtn = $("mi-wizard-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var stepId = currentWizardStepId();
        var err = validateWizardStep(stepId);
        if (err) {
          showStepError(stepId, err);
          return;
        }
        if (returnToSubmitAfterEdit && editReturnStepId === stepId) {
          returnToSubmitAfterEdit = false;
          editReturnStepId = null;
          goToWizardStep(WIZARD_STEPS.indexOf("submit"));
          return;
        }
        returnToSubmitAfterEdit = false;
        editReturnStepId = null;
        goToWizardStep(wizardStepIndex + 1);
      });
    }
    var backBtn = $("mi-wizard-back");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        if (wizardStepIndex === 0) {
          returnToSubmitAfterEdit = false;
          editReturnStepId = null;
          onFormScreen = false;
          $("mi-app").classList.add("mi-hidden");
          $("mi-landing").classList.remove("mi-hidden");
          updateProgressBar();
          return;
        }
        goToWizardStep(wizardStepIndex - 1);
      });
    }
  }

  function wizardProgressPercent() {
    if (!onFormScreen) return 0;
    return Math.min(
      100,
      Math.round(((wizardStepIndex + 1) / WIZARD_STEPS.length) * 100)
    );
  }

  function updateProgressBar() {
    var pct = wizardProgressPercent();
    var bar = $("mi-summary-bar");
    var strip = $("mi-progress-strip");
    if (bar) {
      bar.style.setProperty("--fill-pct", pct + "%");
      bar.classList.toggle("is-empty", pct === 0);
      bar.setAttribute("aria-valuenow", String(pct));
    }
    if (strip) strip.classList.toggle("is-empty", !onFormScreen);

    var stepId = onFormScreen ? currentWizardStepId() : "welcome";
    var macro = "welcome";
    if (onFormScreen) {
      if (stepId === "submit") macro = "submit";
      else if (["providers", "prescriptions", "pharmacy", "conditions"].indexOf(stepId) >= 0) macro = "medical";
      else macro = "health";
    }
    document.querySelectorAll("#mi-macro-stepper li").forEach(function (li) {
      var step = li.getAttribute("data-mi-macro");
      li.classList.toggle("is-active", step === macro);
      li.classList.toggle("is-done", macroOrder(step) < macroOrder(macro));
    });
  }

  function macroOrder(step) {
    return { welcome: 0, health: 1, medical: 2, submit: 3 }[step] || 0;
  }

  function landingCopy() {
    var es = currentUiLang === "es";
    if (es) {
      return {
        headerTitle: "Cuestionario médico seguro",
        greeting: function (name) {
          var n = String(name || "").trim();
          if (!n || /^there$/i.test(n)) return "Hola,";
          return "Hola " + n + ",";
        },
        lead:
          "Gracias por programar su llamada con Julie. Este cuestionario incluye las mismas preguntas de salud que utilizan las compañías de seguros de gastos finales para determinar elegibilidad. Completarlo antes de su llamada nos ayuda a preparar opciones reales para usted.",
        bullets: [
          "Julie revisará su perfil médico antes de la llamada",
          "Identificaremos los productos para los que usted podría calificar según su historial de salud",
          "Esto nos permite dedicar nuestro tiempo juntos a encontrar la mejor opción para usted y responder sus preguntas",
        ],
        privacy:
          "Su información se transmite y almacena de forma segura mediante cifrado. Solo se utilizará para evaluar opciones de seguro de gastos finales para usted.",
        expiry: "Este enlace es personal, solo puede usarse una vez y vence en 7 días.",
        cta: "Comenzar cuestionario médico →",
      };
    }
    return {
      headerTitle: "Secure Medical Questionnaire",
      greeting: function (name) {
        var n = String(name || "").trim();
        if (!n || /^there$/i.test(n)) return "Hi,";
        return "Hi " + n + ",";
      },
      lead:
        "Thank you for scheduling your call with Julie. This questionnaire includes the same health questions that final expense insurance companies use to determine eligibility. Completing it before your call helps us prepare real options for you.",
      bullets: [
        "Julie will review your medical profile before your call",
        "We'll identify which products you may qualify for based on your health history",
        "This allows us to spend our time together finding the best option for you and answering your questions",
      ],
      privacy:
        "Your information is transmitted and stored securely using encryption. It will only be used to evaluate final expense insurance options for you.",
      expiry: "This link is personal, may only be used once, and expires in 7 days.",
      cta: "Begin Medical Questionnaire →",
    };
  }

  function paintLandingCopy() {
    var firstName = String(landingMeta.first_name || "").trim();
    if (/^there$/i.test(firstName)) firstName = "";
    var copy = landingCopy();
    var greeting = $("mi-landing-greeting");
    if (greeting) greeting.textContent = copy.greeting(firstName);
    var lead = $("mi-landing-lead");
    if (lead) lead.textContent = copy.lead;
    var list = $("mi-landing-list");
    if (list) {
      list.innerHTML = copy.bullets.map(function (b) {
        return "<li>" + escapeHtml(b) + "</li>";
      }).join("");
    }
    var privacyEl = $("mi-landing-privacy");
    if (privacyEl) privacyEl.textContent = copy.privacy;
    var expiryEl = $("mi-landing-expiry");
    if (expiryEl) expiryEl.textContent = copy.expiry;
    var cta = $("mi-landing-start");
    if (cta) cta.textContent = copy.cta;
  }

  function showDevBanner() {
    if (!DEV_PREVIEW) return;
    var header = document.querySelector(".mi-header-sticky");
    if (!header || document.getElementById("mi-dev-banner")) return;
    var bar = document.createElement("div");
    bar.id = "mi-dev-banner";
    bar.className = "mi-dev-banner";
    bar.textContent =
      "Local dev preview — search works; submit is disabled. Use npm run mint:intake-link for a real token test.";
    header.insertAdjacentElement("afterend", bar);
  }

  function showLanding(meta) {
    landingMeta = meta || landingMeta;
    setUiLang(uiLangFromMeta(landingMeta.language));
    onFormScreen = false;
    paintLandingCopy();
    showDevBanner();
    updateProgressBar();
    $("mi-gate").classList.add("mi-hidden");
    $("mi-landing").classList.remove("mi-hidden");
    $("mi-app").classList.add("mi-hidden");
  }

  function showForm() {
    onFormScreen = true;
    wizardStepIndex = 0;
    $("mi-landing").classList.add("mi-hidden");
    $("mi-app").classList.remove("mi-hidden");
    wireSections();
    wireWizard();
    wireReviewSummary();
    initMiDobPickers();
    wireHealthInfo();
    wireDrugModal();
    wireProviderModal();
    wirePharmacyModal();
    wireConditionModal();
    wireSubmit();
    applyFormLabels();
    renderLists();
    goToWizardStep(0);
  }

  function wireLandingStart() {
    var btn = $("mi-landing-start");
    if (!btn) return;
    btn.addEventListener("click", showForm);
  }

  function openModal(id) {
    var m = $(id);
    if (!m) return;
    m.classList.add("show");
    if (id === "mi-modal-provider" && onOpenProviderModal) onOpenProviderModal();
    if (id === "mi-modal-drug" && onOpenDrugModal) onOpenDrugModal();
    if (id === "mi-modal-pharmacy" && onOpenPharmacyModal) onOpenPharmacyModal();
    if (id === "mi-modal-condition" && onOpenConditionModal) onOpenConditionModal();
  }
  function closeModal(id) {
    var m = $(id);
    if (m) m.classList.remove("show");
  }

  function wireSections() {
    document.querySelectorAll(".mi-add-btn").forEach(function (btn) {
      if (btn.dataset.miAddWired === "1") return;
      btn.dataset.miAddWired = "1";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var modal = btn.getAttribute("data-modal");
        if (modal) openModal(modal);
      });
    });
    document.querySelectorAll(".mi-modal-close, .mi-modal-cancel").forEach(function (btn) {
      if (btn.dataset.miModalWired === "1") return;
      btn.dataset.miModalWired = "1";
      btn.addEventListener("click", function () {
        closeModal(btn.getAttribute("data-close"));
      });
    });
  }

  function wireHealthInfo() {
    function bumpProgress() {
      updateAgeDisplay();
    }
    document.querySelectorAll("[data-gender]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.healthInfo.gender = btn.getAttribute("data-gender");
        document.querySelectorAll("[data-gender]").forEach(function (b) {
          b.classList.toggle("is-selected", b === btn);
        });
        showStepError("gender", "");
        bumpProgress();
      });
    });
    document.querySelectorAll("[data-tobacco]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.healthInfo.tobaccoUse = btn.getAttribute("data-tobacco") === "yes";
        document.querySelectorAll("[data-tobacco]").forEach(function (b) {
          b.classList.toggle("is-selected", b === btn);
        });
        showStepError("tobacco", "");
        bumpProgress();
      });
    });
    initMiDobPickers();
    ["mi-height-ft", "mi-height-in", "mi-weight"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("input", function () {
        if (id === "mi-height-ft") state.healthInfo.heightFt = parseInt(el.value, 10) || null;
        else if (id === "mi-height-in") state.healthInfo.heightIn = parseInt(el.value, 10) || null;
        else state.healthInfo.weightLbs = parseInt(el.value, 10) || null;
        bumpProgress();
      });
    });
  }

  function fillDistanceSelect(sel) {
    if (!sel) return;
    sel.innerHTML = DISTANCES.map(function (d) {
      return '<option value="' + d + '">' + d + " miles</option>";
    }).join("");
  }

  function wireDrugModal() {
    var DOSAGE_UNKNOWN = "__unknown__";
    var step = 1;
    var selected = null;
    var searchIn = $("mi-drug-search");
    var results = $("mi-drug-results");
    var countEl = $("mi-drug-count");
    var step1 = $("mi-drug-step1");
    var step2 = $("mi-drug-step2");
    var dosageSel = $("mi-drug-dosage");
    var qtyIn = $("mi-drug-qty");
    var freqSel = $("mi-drug-frequency");
    var addBtn = $("mi-drug-add");
    var selectedLabel = $("mi-drug-selected-label");

    if (freqSel) {
      freqSel.innerHTML = FREQUENCIES.map(function (f) {
        return '<option value="' + f + '">' + f + "</option>";
      }).join("");
    }

    function populateDosageSelect(items) {
      if (!dosageSel) return;
      var list = items || [];
      var html =
        '<option value="' +
        DOSAGE_UNKNOWN +
        '">' +
        escapeHtml(t("modal_dosage_unknown")) +
        "</option>";
      html += list
        .map(function (x) {
          return (
            '<option value="' +
            escapeHtml(x.dosage_label) +
            '">' +
            escapeHtml(x.dosage_label) +
            "</option>"
          );
        })
        .join("");
      dosageSel.innerHTML = html;
      if (list.length) {
        dosageSel.value = list[0].dosage_label;
        if (qtyIn) qtyIn.value = list[0].default_quantity || 30;
      } else {
        dosageSel.value = DOSAGE_UNKNOWN;
      }
    }

    function dosageValueForSubmit() {
      if (!dosageSel) return "";
      if (dosageSel.value === DOSAGE_UNKNOWN) return t("modal_dosage_unknown");
      return dosageSel.value;
    }

    function setAddEnabled() {
      if (!addBtn) return;
      addBtn.disabled = !(step === 2 && selected && dosageSel && dosageSel.value);
    }

    function showDrugHint(message) {
      if (results) {
        results.innerHTML =
          '<p class="mi-drug-results-hint">' + escapeHtml(message) + "</p>";
      }
      if (countEl) countEl.textContent = "";
    }

    function reset() {
      step = 1;
      selected = null;
      if (searchIn) searchIn.value = "";
      if (step1) step1.classList.remove("mi-hidden");
      if (step2) step2.classList.add("mi-hidden");
      if (selectedLabel) selectedLabel.textContent = "";
      if (dosageSel) dosageSel.innerHTML = "";
      if (qtyIn) qtyIn.value = "30";
      showDrugHint(t("modal_enter_prescription"));
      setAddEnabled();
    }

    onOpenDrugModal = reset;

    var doSearch = debounce(function () {
      var q = (searchIn && searchIn.value.trim()) || "";
      if (q.length < 2) {
        showDrugHint(t("modal_prescription_min_chars"));
        return;
      }
      if (results) {
        results.innerHTML =
          '<p class="mi-drug-results-hint">' + escapeHtml(t("modal_searching")) + "</p>";
      }
      if (countEl) countEl.textContent = "";
      api("/api/medical-intake/search?type=drugs&q=" + encodeURIComponent(q))
        .then(function (data) {
          var items = data.items || [];
          if (!items.length) {
            showDrugHint(t("modal_no_prescriptions"));
            return;
          }
          if (countEl) {
            countEl.textContent =
              items.length === 1
                ? tf("modal_prescriptions_found", { count: items.length })
                : tf("modal_prescriptions_found_plural", { count: items.length });
          }
          if (!results) return;
          results.innerHTML = items
            .map(function (d) {
              return (
                '<button type="button" class="mi-drug-option" data-name="' +
                escapeHtml(d.name) +
                '" data-rxcui="' +
                escapeHtml(d.rxcui || "") +
                '" data-type="' +
                escapeHtml(d.drug_type || "") +
                '"><span class="mi-drug-option-name">' +
                escapeHtml(d.name) +
                "</span>" +
                (d.drug_type
                  ? '<span class="mi-drug-option-type">' + escapeHtml(d.drug_type) + "</span>"
                  : "") +
                "</button>"
              );
            })
            .join("");
          results.querySelectorAll(".mi-drug-option").forEach(function (btn) {
            btn.addEventListener("click", function () {
              selected = {
                name: btn.getAttribute("data-name"),
                rxcui: btn.getAttribute("data-rxcui") || "",
                drug_type: btn.getAttribute("data-type") || "",
              };
              if (selectedLabel) {
                selectedLabel.textContent =
                  selected.name + (selected.drug_type ? " (" + selected.drug_type + ")" : "");
              }
              step = 2;
              if (step1) step1.classList.add("mi-hidden");
              if (step2) step2.classList.remove("mi-hidden");
              populateDosageSelect([]);
              setAddEnabled();
              api(
                "/api/medical-intake/search?type=drug-dosages&rxcui=" +
                  encodeURIComponent(selected.rxcui) +
                  "&name=" +
                  encodeURIComponent(selected.name)
              )
                .then(function (dd) {
                  populateDosageSelect(dd.items || []);
                  setAddEnabled();
                })
                .catch(function () {
                  populateDosageSelect([]);
                  setAddEnabled();
                });
            });
          });
        })
        .catch(function () {
          showDrugHint(t("modal_search_failed"));
        });
    }, 400);

    if (searchIn) searchIn.addEventListener("input", doSearch);
    if (dosageSel) dosageSel.addEventListener("change", setAddEnabled);
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (!selected || !dosageSel || addBtn.disabled) return;
        state.prescriptions.push({
          drugName: selected.name,
          rxcui: selected.rxcui,
          drug_type: selected.drug_type,
          dosage: dosageValueForSubmit(),
          quantity: parseInt(qtyIn && qtyIn.value, 10) || 30,
          frequency: freqSel ? freqSel.value : "per month",
        });
        renderLists();
        closeModal("mi-modal-drug");
        reset();
      });
    }
    document.querySelectorAll('[data-close="mi-modal-drug"]').forEach(function (el) {
      el.addEventListener("click", reset);
    });
  }

  function wireProviderModal() {
    fillDistanceSelect($("mi-provider-distance"));
    var zipIn = $("mi-provider-zip");
    var searchIn = $("mi-provider-search");
    var results = $("mi-provider-results");
    var countEl = $("mi-provider-count");
    var pagination = $("mi-provider-pagination");
    var addBtn = $("mi-provider-add");
    var ctx = { items: [], page: 1, total: 0, perPage: 20, pick: null };

    function setAddEnabled() {
      if (addBtn) addBtn.disabled = !(ctx.pick && ctx.items[ctx.pick.p]);
    }

    function showProviderHint(message) {
      if (results) {
        results.innerHTML =
          '<p class="mi-provider-results-hint">' + escapeHtml(message) + "</p>";
      }
      if (countEl) countEl.textContent = "";
      if (pagination) pagination.innerHTML = "";
      ctx.pick = null;
      setAddEnabled();
    }

    function resetProviderModal() {
      ctx.page = 1;
      ctx.items = [];
      ctx.total = 0;
      ctx.pick = null;
      setAddEnabled();
      var zip = (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "";
      if (zip.length !== 5) showProviderHint(t("modal_zip_5"));
      else showProviderHint(t("modal_enter_provider"));
    }

    onOpenProviderModal = resetProviderModal;

    function renderProviderCards() {
      if (!results) return;
      if (!ctx.items.length) {
        showProviderHint(t("modal_no_providers"));
        return;
      }
      if (countEl) {
        countEl.textContent =
          ctx.total === 1
            ? tf("modal_providers_found", { count: ctx.total })
            : tf("modal_providers_found_plural", { count: ctx.total });
      }
      results.innerHTML = ctx.items
        .map(function (p, pi) {
          var locs = p.locations || [
            { address_line: p.address_line, city: p.city, state: p.state, zip: p.zip },
          ];
          var primary = locs[0];
          var extra = locs.slice(1);
          var primaryAddr = [primary.address_line, primary.city, primary.state, primary.zip]
            .filter(Boolean)
            .join(", ");
          var spec = p.specialty
            ? '<div class="mi-provider-spec">' + escapeHtml(p.specialty) + "</div>"
            : "";
          var extraHtml = "";
          if (extra.length) {
            extraHtml =
              '<details class="mi-provider-more"><summary>Additional Locations (' +
              extra.length +
              ")</summary>" +
              extra
                .map(function (loc, li) {
                  var addr = [loc.address_line, loc.city, loc.state, loc.zip].filter(Boolean).join(", ");
                  var checked =
                    ctx.pick && ctx.pick.p === pi && ctx.pick.l === li + 1 ? " checked" : "";
                  return (
                    '<label class="mi-provider-loc">' +
                    '<input type="radio" name="mi-provider-pick" data-p="' +
                    pi +
                    '" data-l="' +
                    (li + 1) +
                    '"' +
                    checked +
                    " /> " +
                    escapeHtml(addr) +
                    "</label>"
                  );
                })
                .join("") +
              "</details>";
          }
          var checked0 = ctx.pick && ctx.pick.p === pi && ctx.pick.l === 0 ? " checked" : "";
          return (
            '<div class="mi-provider-card">' +
            spec +
            '<div class="mi-provider-name">' +
            escapeHtml(p.name) +
            "</div>" +
            '<div class="mi-provider-npi">' +
            escapeHtml(p.npi || "") +
            "</div>" +
            '<label class="mi-provider-loc mi-provider-loc-primary">' +
            '<input type="radio" name="mi-provider-pick" data-p="' +
            pi +
            '" data-l="0"' +
            checked0 +
            " /> " +
            escapeHtml(primaryAddr) +
            "</label>" +
            extraHtml +
            "</div>"
          );
        })
        .join("");

      results.querySelectorAll('input[name="mi-provider-pick"]').forEach(function (inp) {
        inp.addEventListener("change", function () {
          ctx.pick = {
            p: parseInt(inp.getAttribute("data-p"), 10),
            l: parseInt(inp.getAttribute("data-l"), 10),
          };
          setAddEnabled();
        });
      });

      if (pagination) {
        var pages = Math.max(1, Math.ceil(ctx.total / ctx.perPage));
        if (pages <= 1) {
          pagination.innerHTML = "";
        } else {
          pagination.innerHTML =
            '<button type="button" class="mi-btn secondary" id="mi-provider-prev"' +
            (ctx.page <= 1 ? " disabled" : "") +
            ">Prev</button>" +
            "<span>Page " +
            ctx.page +
            " of " +
            pages +
            "</span>" +
            '<button type="button" class="mi-btn secondary" id="mi-provider-next"' +
            (ctx.page >= pages ? " disabled" : "") +
            ">Next</button>";
          var prev = $("mi-provider-prev");
          var next = $("mi-provider-next");
          if (prev)
            prev.addEventListener("click", function () {
              if (ctx.page > 1) {
                ctx.page--;
                doSearch();
              }
            });
          if (next)
            next.addEventListener("click", function () {
              if (ctx.page < pages) {
                ctx.page++;
                doSearch();
              }
            });
        }
      }
      setAddEnabled();
    }

    function doSearch() {
      var zip = (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "";
      var term = (searchIn && searchIn.value.trim()) || "";
      if (zip.length !== 5) {
        showProviderHint(t("modal_zip_5"));
        return;
      }
      if (!term) {
        showProviderHint(t("modal_enter_provider"));
        return;
      }
      if (results) {
        results.innerHTML =
          '<p class="mi-provider-results-hint">' + escapeHtml(t("modal_searching")) + "</p>";
      }
      api(
        "/api/medical-intake/search?type=providers&zipCode=" +
          encodeURIComponent(zip) +
          "&searchTerm=" +
          encodeURIComponent(term) +
          "&radius=" +
          encodeURIComponent(($("mi-provider-distance") && $("mi-provider-distance").value) || "25") +
          "&page=" +
          encodeURIComponent(ctx.page) +
          "&perPage=" +
          encodeURIComponent(ctx.perPage)
      )
        .then(function (data) {
          ctx.items = data.items || [];
          ctx.total = data.total != null ? data.total : ctx.items.length;
          ctx.pick = null;
          renderProviderCards();
        })
        .catch(function () {
          showProviderHint(t("modal_search_failed"));
        });
    }

    var debouncedSearch = debounce(doSearch, 400);
    if (searchIn)
      searchIn.addEventListener("input", function () {
        ctx.page = 1;
        debouncedSearch();
      });
    if (zipIn)
      zipIn.addEventListener("input", function () {
        ctx.page = 1;
        debouncedSearch();
      });
    var dist = $("mi-provider-distance");
    if (dist)
      dist.addEventListener("change", function () {
        ctx.page = 1;
        doSearch();
      });
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (!ctx.pick) return;
        var p = ctx.items[ctx.pick.p];
        if (!p) return;
        var locs = p.locations || [
          {
            address_line: p.address_line,
            city: p.city,
            state: p.state,
            zip: p.zip,
            phone: p.phone,
          },
        ];
        var loc = locs[ctx.pick.l] || locs[0];
        state.providers.push({
          npi: p.npi,
          name: p.name,
          specialty: p.specialty,
          address_line: loc.address_line,
          city: loc.city,
          state: loc.state,
          zip: loc.zip,
          phone: loc.phone || p.phone || "",
        });
        renderLists();
        closeModal("mi-modal-provider");
      });
    }
  }

  function wirePharmacyModal() {
    fillDistanceSelect($("mi-pharmacy-distance"));
    var zipIn = $("mi-pharmacy-zip");
    var addrIn = $("mi-pharmacy-address");
    var nameIn = $("mi-pharmacy-name");
    var distSel = $("mi-pharmacy-distance");
    var results = $("mi-pharmacy-results");
    var countEl = $("mi-pharmacy-count");
    var pagination = $("mi-pharmacy-pagination");
    var addBtn = $("mi-pharmacy-add");
    var tabPhysical = $("mi-pharm-tab-physical");
    var tabOnline = $("mi-pharm-tab-online");
    var selectedCard = $("mi-pharmacy-selected");
    var selectedLabel = $("mi-pharmacy-selected-label");
    var pharmType = "physical";
    var ctx = { items: [], total: 0, page: 1, perPage: 10, pick: null };

    function setAddEnabled() {
      if (addBtn) addBtn.disabled = ctx.pick == null;
    }

    function updateSelectedPharmacy() {
      if (!selectedCard || !selectedLabel) return;
      if (ctx.pick == null || !ctx.items[ctx.pick]) {
        selectedCard.classList.add("mi-hidden");
        selectedLabel.textContent = "";
        return;
      }
      var p = ctx.items[ctx.pick];
      var addr = [p.address_line, p.city, p.state, p.zip].filter(Boolean).join(", ");
      selectedLabel.textContent = (p.name || "Pharmacy") + (addr ? " — " + addr : "");
      selectedCard.classList.remove("mi-hidden");
    }

    function showPharmHint(message) {
      if (results) {
        results.innerHTML =
          '<p class="mi-pharmacy-results-hint">' + escapeHtml(message) + "</p>";
      }
      if (countEl) countEl.textContent = "";
      if (pagination) pagination.innerHTML = "";
      ctx.pick = null;
      updateSelectedPharmacy();
      setAddEnabled();
    }

    function resetPharmacyModal() {
      ctx = { items: [], total: 0, page: 1, perPage: 10, pick: null };
      pharmType = "physical";
      if (zipIn) zipIn.value = "";
      if (addrIn) addrIn.value = "";
      if (nameIn) nameIn.value = "";
      if (tabPhysical) tabPhysical.classList.add("active");
      if (tabOnline) tabOnline.classList.remove("active");
      showPharmHint(t("modal_zip_5"));
      setAddEnabled();
    }

    onOpenPharmacyModal = resetPharmacyModal;

    function renderPharmacyResults() {
      if (pharmType === "physical") {
        var zip = (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "";
        if (zip.length !== 5) {
          showPharmHint(t("modal_zip_5"));
          return;
        }
      }
      if (!ctx.items.length) {
        showPharmHint(t("modal_no_pharmacies"));
        return;
      }
      if (countEl) {
        countEl.textContent =
          ctx.total === 1
            ? tf("modal_pharmacies_found", { count: ctx.total })
            : tf("modal_pharmacies_found_plural", { count: ctx.total });
      }
      if (!results) return;
      results.innerHTML = ctx.items
        .map(function (p, i) {
          var addr = [p.address_line, p.city, p.state, p.zip].filter(Boolean).join(", ");
          return (
            '<button type="button" class="mi-pharmacy-option' +
            (ctx.pick === i ? " is-selected" : "") +
            '" data-idx="' +
            i +
            '"><span class="mi-pharmacy-option-name">' +
            escapeHtml(p.name) +
            "</span>" +
            (addr ? '<span class="mi-pharmacy-option-addr">' + escapeHtml(addr) + "</span>" : "") +
            "</button>"
          );
        })
        .join("");
      results.querySelectorAll(".mi-pharmacy-option").forEach(function (btn) {
        btn.addEventListener("click", function () {
          ctx.pick = parseInt(btn.getAttribute("data-idx"), 10);
          results.querySelectorAll(".mi-pharmacy-option").forEach(function (b, li) {
            b.classList.toggle("is-selected", li === ctx.pick);
          });
          updateSelectedPharmacy();
          setAddEnabled();
        });
      });

      if (pagination) {
        var pages = Math.max(1, Math.ceil(ctx.total / ctx.perPage));
        if (pages <= 1) {
          pagination.innerHTML = "";
        } else {
          pagination.innerHTML =
            '<button type="button" class="mi-btn secondary" id="mi-pharmacy-prev"' +
            (ctx.page <= 1 ? " disabled" : "") +
            ">Prev</button>" +
            "<span>Page " +
            ctx.page +
            " of " +
            pages +
            "</span>" +
            '<button type="button" class="mi-btn secondary" id="mi-pharmacy-next"' +
            (ctx.page >= pages ? " disabled" : "") +
            ">Next</button>";
          var prev = $("mi-pharmacy-prev");
          var next = $("mi-pharmacy-next");
          if (prev) {
            prev.addEventListener("click", function () {
              if (ctx.page > 1) {
                ctx.page--;
                ctx.pick = null;
                doSearch();
              }
            });
          }
          if (next) {
            next.addEventListener("click", function () {
              if (ctx.page < pages) {
                ctx.page++;
                ctx.pick = null;
                doSearch();
              }
            });
          }
        }
      }
      updateSelectedPharmacy();
      setAddEnabled();
    }

    function doSearch() {
      if (pharmType === "physical") {
        var zip = (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "";
        if (zip.length !== 5) {
          showPharmHint(t("modal_zip_5"));
          return;
        }
      }
      if (results) {
        results.innerHTML =
          '<p class="mi-pharmacy-results-hint">' + escapeHtml(t("modal_searching")) + "</p>";
      }
      if (countEl) countEl.textContent = "";
      ctx.pick = null;
      updateSelectedPharmacy();
      setAddEnabled();
      api(
        "/api/medical-intake/search?type=pharmacies&zipCode=" +
          encodeURIComponent((zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "") +
          "&pharmacyName=" +
          encodeURIComponent((nameIn && nameIn.value.trim()) || "") +
          "&address=" +
          encodeURIComponent((addrIn && addrIn.value.trim()) || "") +
          "&radius=" +
          encodeURIComponent((distSel && distSel.value) || "25") +
          "&pharmacyType=" +
          encodeURIComponent(pharmType) +
          "&page=" +
          encodeURIComponent(ctx.page) +
          "&perPage=" +
          encodeURIComponent(ctx.perPage)
      )
        .then(function (data) {
          ctx.items = data.items || [];
          ctx.total = data.total != null ? data.total : ctx.items.length;
          renderPharmacyResults();
        })
        .catch(function () {
          showPharmHint(t("modal_search_failed"));
        });
    }

    var debouncedSearch = debounce(doSearch, 400);

    function setTab(t) {
      pharmType = t;
      ctx.page = 1;
      ctx.pick = null;
      if (tabPhysical) tabPhysical.classList.toggle("active", t === "physical");
      if (tabOnline) tabOnline.classList.toggle("active", t === "online");
      if (t === "online") showPharmHint(t("modal_search_pharmacy"));
      else showPharmHint(t("modal_zip_5"));
      doSearch();
    }

    if (tabPhysical) {
      tabPhysical.addEventListener("click", function () {
        setTab("physical");
      });
    }
    if (tabOnline) {
      tabOnline.addEventListener("click", function () {
        setTab("online");
      });
    }
    if (nameIn) nameIn.addEventListener("input", function () {
      ctx.page = 1;
      debouncedSearch();
    });
    if (zipIn) zipIn.addEventListener("input", function () {
      ctx.page = 1;
      debouncedSearch();
    });
    if (addrIn) addrIn.addEventListener("input", function () {
      ctx.page = 1;
      debouncedSearch();
    });
    if (distSel) distSel.addEventListener("change", function () {
      ctx.page = 1;
      doSearch();
    });
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (ctx.pick == null || addBtn.disabled) return;
        var p = ctx.items[ctx.pick];
        if (p) {
          state.pharmacies.push(Object.assign({}, p, { pharmacy_type: pharmType }));
          renderLists();
          closeModal("mi-modal-pharmacy");
          resetPharmacyModal();
        }
      });
    }
    document.querySelectorAll('[data-close="mi-modal-pharmacy"]').forEach(function (el) {
      el.addEventListener("click", resetPharmacyModal);
    });
  }

  function wireConditionModal() {
    var searchIn = $("mi-condition-search");
    var results = $("mi-condition-results");
    var countEl = $("mi-condition-count");
    var nextBtn = $("mi-condition-next");
    var translateBtn = $("mi-condition-translate-btn");
    var translateWrap = $("mi-condition-translate-wrap");
    var translateEl = $("mi-condition-translate");
    var items = [];
    var pick = null;
    var resultCount = 0;

    function resolveSearchQuery(raw) {
      var q = String(raw || "").trim();
      if (!q || !window.MiConditionSearchEs) return q;
      return window.MiConditionSearchEs.resolveConditionSearchQuery(q) || q;
    }

    function hideTranslation() {
      if (translateWrap) translateWrap.classList.add("mi-hidden");
      if (translateEl) translateEl.textContent = "";
    }

    function showTranslation(original, english) {
      if (!translateWrap || !translateEl || !original) {
        hideTranslation();
        return;
      }
      if (
        window.MiConditionSearchEs &&
        window.MiConditionSearchEs.queryDiffersFromTranslation(original)
      ) {
        translateEl.textContent = english;
        translateWrap.classList.remove("mi-hidden");
      } else {
        hideTranslation();
      }
    }

    function setNextEnabled() {
      if (nextBtn) nextBtn.disabled = pick == null;
    }

    function showConditionHint(message) {
      if (results) {
        results.innerHTML =
          '<p class="mi-condition-results-hint">' + escapeHtml(message) + "</p>";
      }
      if (countEl) countEl.textContent = "";
      pick = null;
      setNextEnabled();
    }

    function resetConditionModal() {
      items = [];
      pick = null;
      resultCount = 0;
      if (searchIn) searchIn.value = "";
      hideTranslation();
      showConditionHint(t("modal_search_condition_prompt"));
    }

    onOpenConditionModal = resetConditionModal;

    function renderConditionResults() {
      if (!results) return;
      if (!items.length) {
        showConditionHint(t("modal_no_conditions"));
        return;
      }
      if (countEl) {
        countEl.textContent =
          resultCount === 1
            ? tf("modal_conditions_found", { count: resultCount })
            : tf("modal_conditions_found_plural", { count: resultCount });
      }
      results.innerHTML = items
        .map(function (c, i) {
          var checked = pick === i ? " checked" : "";
          return (
            '<label class="mi-condition-option' +
            (pick === i ? " is-selected" : "") +
            '">' +
            '<input type="radio" name="mi-cond-pick" data-idx="' +
            i +
            '"' +
            checked +
            " />" +
            '<span class="mi-condition-option-body">' +
            '<strong class="mi-condition-option-name">' +
            escapeHtml(c.name) +
            "</strong>" +
            (c.icd10_code
              ? '<span class="mi-condition-option-code">' + escapeHtml(c.icd10_code) + "</span>"
              : "") +
            "</span></label>"
          );
        })
        .join("");
      results.querySelectorAll('input[name="mi-cond-pick"]').forEach(function (inp) {
        inp.addEventListener("change", function () {
          pick = parseInt(inp.getAttribute("data-idx"), 10);
          results.querySelectorAll(".mi-condition-option").forEach(function (lab, li) {
            lab.classList.toggle("is-selected", li === pick);
          });
          setNextEnabled();
        });
      });
      setNextEnabled();
    }

    function runConditionSearch(searchQ, originalQ) {
      if (results) {
        results.innerHTML =
          '<p class="mi-condition-results-hint">' + escapeHtml(t("modal_searching")) + "</p>";
      }
      if (countEl) countEl.textContent = "";
      pick = null;
      setNextEnabled();
      api("/api/medical-intake/search?type=conditions&q=" + encodeURIComponent(searchQ))
        .then(function (data) {
          items = data.items || [];
          resultCount = data.result_count != null ? data.result_count : items.length;
          renderConditionResults();
        })
        .catch(function () {
          items = [];
          showConditionHint(t("modal_search_failed"));
        });
      if (originalQ != null) showTranslation(originalQ, searchQ);
    }

    function needsTranslation(q) {
      return (
        window.MiConditionSearchEs &&
        window.MiConditionSearchEs.queryDiffersFromTranslation(q)
      );
    }

    function translateAndSearch() {
      var q = (searchIn && searchIn.value.trim()) || "";
      if (q.length < 2) {
        hideTranslation();
        showConditionHint(t("modal_search_condition_prompt"));
        return;
      }
      var searchQ = resolveSearchQuery(q);
      runConditionSearch(searchQ, q);
    }

    var doSearchOnInput = debounce(function () {
      var q = (searchIn && searchIn.value.trim()) || "";
      if (q.length < 2) {
        hideTranslation();
        items = [];
        showConditionHint(t("modal_search_condition_prompt"));
        return;
      }
      if (currentUiLang === "es" && needsTranslation(q)) {
        hideTranslation();
        return;
      }
      runConditionSearch(q, null);
    }, 400);

    if (searchIn) {
      searchIn.addEventListener("input", doSearchOnInput);
      searchIn.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          ev.preventDefault();
          translateAndSearch();
        }
      });
    }
    if (translateBtn) {
      translateBtn.addEventListener("click", translateAndSearch);
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (nextBtn.disabled || pick == null) return;
        var c = items[pick];
        if (
          c &&
          !state.conditions.some(function (x) {
            return x.icd10_code === c.icd10_code && x.name === c.name;
          })
        ) {
          state.conditions.push(c);
        }
        renderLists();
        closeModal("mi-modal-condition");
        resetConditionModal();
      });
    }
    document.querySelectorAll('[data-close="mi-modal-condition"]').forEach(function (el) {
      el.addEventListener("click", resetConditionModal);
    });
  }

  function wireSubmit() {
    var form = $("mi-form");
    if (!form) return;
    var consent = $("mi-consent");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = validateWizardStep("submit");
      if (err) {
        showStepError("submit", err);
        return;
      }
      if (!healthInfoComplete()) {
        alert("Please complete all health questions.");
        return;
      }
      var btn = $("mi-submit-btn");
      if (btn) btn.disabled = true;
      fetch("/api/medical-intake/submit?t=" + encodeURIComponent(TOKEN), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: TOKEN,
          healthInfo: state.healthInfo,
          providers: state.providers,
          prescriptions: state.prescriptions,
          pharmacies: state.pharmacies,
          conditions: state.conditions,
          consent: true,
        }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error || "submit_failed");
          $("mi-gate").classList.remove("mi-hidden");
          $("mi-landing").classList.add("mi-hidden");
          $("mi-app").classList.add("mi-hidden");
          $("mi-gate").innerHTML =
            "<h2>Thank you</h2><p>Your medical information was submitted securely. Julie will review it before your call.</p>";
        })
        .catch(function (err) {
          if (err.message === "dev_preview_submit_disabled") {
            alert("Dev preview — submit is disabled on localhost. Use npm run mint:intake-link to test a real submission.");
            if (btn) btn.disabled = false;
            return;
          }
          alert("Could not submit: " + (err.message || "error"));
          if (btn) btn.disabled = false;
        });
    });
  }

  function startIntake(meta) {
    wireLandingStart();
    showLanding(meta || { first_name: "Preview", language: "Spanish" });
  }

  function init() {
    wireLangToggle();
    paintChromeCopy();
    if (DEV_PREVIEW) {
      if (!IS_LOCAL) {
        $("mi-gate").innerHTML =
          "<h2>Preview unavailable</h2><p>The builder preview runs on localhost only. Use <code>npm run dev:local</code> and open <code>/medical-intake-preview.html</code>.</p>";
        return;
      }
      startIntake({ first_name: "Preview", language: "Spanish", dev_preview: true });
      return;
    }
    if (!TOKEN) {
      $("mi-gate").innerHTML = "<h2>Invalid link</h2><p>This medical intake link is missing or invalid.</p>";
      return;
    }
    api("/api/medical-intake/validate")
      .then(function (meta) {
        startIntake(meta);
      })
      .catch(function (err) {
        var msg =
          err.message === "token_expired"
            ? "This link has expired. Please contact Julie for a new link."
            : err.message === "token_used"
              ? "This link was already used."
              : "This link is invalid or expired.";
        $("mi-gate").innerHTML = "<h2>Unable to open form</h2><p>" + escapeHtml(msg) + "</p>";
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
