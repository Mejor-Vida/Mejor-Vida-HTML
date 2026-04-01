(function () {
  'use strict';

  /** Base URL for quote API, no trailing slash. Empty string = same origin (e.g. /api/quote/…). */
  function apiBase() {
    if (typeof window.MVS_QUOTE_API !== 'string') return '';
    return String(window.MVS_QUOTE_API).trim().replace(/\/$/, '');
  }

  function isQuoteApiConfigured() {
    return typeof window.MVS_QUOTE_API === 'string';
  }

  function currentLang() {
    var c = document.documentElement.className || '';
    return c.indexOf('lang-en') !== -1 ? 'en' : 'es';
  }

  function t(key) {
    var L = currentLang();
    var m = {
      configureApi: {
        es: 'Falta la URL del servidor de cotizaciones en esta página. En producción debe coincidir con el dominio (p. ej. proxy en /api/quote/) o definirse antes de cargar el formulario.',
        en: 'This page is missing the quote API base URL. In production use your site origin if the API is proxied at /api/quote/, or set window.MVS_QUOTE_API before this script loads.',
      },
      loadOptionsFail: {
        es: 'No se pudieron cargar las opciones del formulario. Revisa la API o tu conexión.',
        en: 'Could not load form options. Check the API or your connection.',
      },
      submitFail: {
        es: 'No se pudo enviar. Inténtalo de nuevo o llámanos.',
        en: 'Could not submit. Try again or call us.',
      },
      submitting: { es: 'Enviando…', en: 'Submitting…' },
      seeEstimate: { es: 'Ver cotización aproximada', en: 'See approximate quote' },
      monthly: { es: 'al mes (referencia)', en: 'per month (illustrative)' },
      coverage: { es: 'Cobertura', en: 'Coverage' },
      qualified: { es: 'Califica según la herramienta', en: 'Qualified in this tool' },
      schedule: { es: 'Agendar llamada con Julie', en: 'Schedule a call with Julie' },
      savedNote: {
        es: 'Guardamos tu información para que Julie pueda dar seguimiento.',
        en: 'We saved your details so Julie can follow up.',
      },
      leadWarn: {
        es: 'No se pudo guardar en la hoja (revisa el servidor).',
        en: 'Lead list save failed (check server logs).',
      },
      emailSent: { es: 'Te enviamos un correo con el resumen.', en: 'We emailed you a summary.' },
      emailSkipped: {
        es: 'Correo no enviado (configura Resend o revisa permisos).',
        en: 'Email not sent (configure Resend or check settings).',
      },
      disclaimer: { es: 'Aviso legal', en: 'Disclaimer' },
      reason_rates_not_configured_in_tool: {
        es: 'Prima no disponible en esta herramienta; Julie puede cotizar esta aseguradora por separado.',
        en: 'Premium not in this tool yet; Julie can quote this carrier separately.',
      },
      reason_age_or_coverage_not_in_table: {
        es: 'Edad o monto fuera de la tabla mostrada; contacta a Julie para opciones.',
        en: 'Age or amount outside the table shown; contact Julie for options.',
      },
      reason_rate_unavailable: {
        es: 'No se pudo calcular la prima con los datos actuales.',
        en: 'Could not calculate a premium with current data.',
      },
      reason_default: { es: 'Ver detalles con Julie.', en: 'See details with Julie.' },
      validation: {
        es: 'Marca las tres casillas de consentimiento (correo, llamada y texto) para continuar.',
        en: 'Check all three consent boxes (email, call, and text) to continue.',
      },
      healthOther: {
        es: 'Si eligió «Otra», describa la condición (al menos 2 caracteres).',
        en: 'If you chose “Other,” please describe the condition (at least 2 characters).',
      },
      healthSelect: {
        es: 'Seleccione una condición de salud de la lista.',
        en: 'Please select a health condition from the list.',
      },
      birthdateRequired: {
        es: 'Seleccione mes, día y año de nacimiento.',
        en: 'Select month, day, and year of birth.',
      },
      birthdateInvalid: {
        es: 'La fecha de nacimiento no es válida. Revise mes y día.',
        en: 'That date of birth is not valid. Check month and day.',
      },
      birthdateOutOfRange: {
        es: 'La edad debe estar entre {min} y {max} años para esta cotización (según la tabla de tarifas).',
        en: 'Age must be between {min} and {max} for this quote (per our rate table).',
      },
      ageOrBirthdateRequired: {
        es: 'Indique la fecha de nacimiento o la edad.',
        en: 'Enter your date of birth or age.',
      },
      coverageSelect: {
        es: 'Seleccione un monto de cobertura.',
        en: 'Please select a coverage amount.',
      },
      coverageOther: {
        es: 'Elija un monto de la lista ($2,000 a $50,000 en Nivel; hasta $20,000 en Graduado).',
        en: 'Choose an amount from the list ($2,000–$50,000 for Level; up to $20,000 for Graded).',
      },
      levelCoverageMax: {
        es: 'Para Nivel (Level), el monto máximo en esta herramienta es $50,000.',
        en: 'For Level, the maximum face amount in this tool is $50,000.',
      },
      gradedCoverage: {
        es: 'Para estimación Graduado (Graded), el monto máximo es $20,000. Elija otro monto o use Nivel (Level) para cantidades mayores.',
        en: 'For a Graded estimate, the maximum face amount is $20,000. Choose a lower amount or use Level for higher amounts.',
      },
      gradedAge: {
        es: 'Para estimación Graduado (Graded), la edad debe estar entre 45 y 80 años.',
        en: 'For a Graded estimate, age must be between 45 and 80.',
      },
      coverageOtherGraded: {
        es: 'Con Graduado (Graded), «Otra cantidad» no puede superar $20,000.',
        en: 'With Graded, “Other amount” cannot exceed $20,000.',
      },
    };
    var bag = m[key];
    return bag ? bag[L] : key;
  }

  function headersJson() {
    var h = { 'Content-Type': 'application/json' };
    var sec = (typeof window.MVS_QUOTE_SECRET === 'string' ? window.MVS_QUOTE_SECRET : '').trim();
    if (sec) h['X-Quote-Secret'] = sec;
    return h;
  }

  async function fetchJson(path) {
    if (!isQuoteApiConfigured()) throw new Error('no_api');
    var r = await fetch(apiBase() + path, { headers: headersJson() });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }

  var _ageMin = 45;
  var _ageMax = 85;

  function pad2(n) {
    var x = parseInt(n, 10);
    return x < 10 ? '0' + x : String(x);
  }

  function daysInMonth(year, month) {
    var y = parseInt(year, 10);
    var m = parseInt(month, 10);
    return new Date(y, m, 0).getDate();
  }

  function computeAgeFromYmd(y, m, d) {
    var ty = new Date().getFullYear();
    var tm = new Date().getMonth() + 1;
    var td = new Date().getDate();
    var age = ty - y;
    if (tm < m || (tm === m && td < d)) age--;
    return age;
  }

  /**
   * Day count for the DOB pickers. Works in any order: year+month gives exact length;
   * month alone uses a leap year so Feb 29 stays available until a non-leap year is chosen;
   * year alone or neither uses 1–31 so day can be chosen before month/year.
   */
  function daysInMonthForDobPick(y, m) {
    if (y && m) return daysInMonth(y, m);
    if (m) return daysInMonth(2000, m);
    return 31;
  }

  function syncDobDays() {
    var ysel = document.getElementById('quote-dob-year');
    var msel = document.getElementById('quote-dob-month');
    var dsel = document.getElementById('quote-dob-day');
    if (!ysel || !msel || !dsel) return;
    var y = ysel.value;
    var m = msel.value;
    var prev = dsel.value;
    var dim = daysInMonthForDobPick(y, m);
    dsel.innerHTML = '<option value="">—</option>';
    for (var di = 1; di <= dim; di++) {
      var op = document.createElement('option');
      op.value = String(di);
      op.textContent = String(di);
      dsel.appendChild(op);
    }
    if (prev && parseInt(prev, 10) <= dim) dsel.value = prev;
  }

  function fillDobMonthOptions() {
    var msel = document.getElementById('quote-dob-month');
    if (!msel || msel.querySelector('option[value="1"]')) return;
    var MONTHS_BI = [
      'Jan · Ene',
      'Feb · Feb',
      'Mar · Mar',
      'Apr · Abr',
      'May · May',
      'Jun · Jun',
      'Jul · Jul',
      'Aug · Ago',
      'Sep · Sep',
      'Oct · Oct',
      'Nov · Nov',
      'Dec · Dic',
    ];
    for (var mi = 1; mi <= 12; mi++) {
      var op = document.createElement('option');
      op.value = String(mi);
      op.textContent = pad2(mi) + ' — ' + MONTHS_BI[mi - 1];
      msel.appendChild(op);
    }
  }

  function fillDobYearOptions() {
    var ysel = document.getElementById('quote-dob-year');
    if (!ysel) return;
    var cur = new Date().getFullYear();
    var ylo = cur - _ageMax;
    var yhi = cur - _ageMin;
    ysel.innerHTML = '<option value="">—</option>';
    for (var y = yhi; y >= ylo; y--) {
      var op = document.createElement('option');
      op.value = String(y);
      op.textContent = String(y);
      ysel.appendChild(op);
    }
  }

  function wireOptions(opts) {
    if (opts && opts.ageMin != null) _ageMin = opts.ageMin;
    if (opts && opts.ageMax != null) _ageMax = opts.ageMax;
    fillDobYearOptions();
    syncDobDays();
  }

  var LEVEL_MAX_COVERAGE = 50000;
  var GRADED_MAX_COVERAGE = 20000;
  var GRADED_AGE_MIN = 45;
  var GRADED_AGE_MAX = 80;

  function formatUsd(n) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  }

  function coverageGroupTitle(lo, hi, lang) {
    if (lang === 'es') return 'De ' + formatUsd(lo) + ' a ' + formatUsd(hi);
    return formatUsd(lo) + ' – ' + formatUsd(hi);
  }

  function appendThousandStepRange(parent, from, to) {
    for (var a = from; a <= to; a += 1000) {
      var opt = document.createElement('option');
      opt.value = String(a);
      opt.textContent = formatUsd(a);
      parent.appendChild(opt);
    }
  }

  /** Level: $2k–$50k by $1k. Graded: $2k–$20k by $1k. Optgroups keep long lists scannable. */
  function populateCoverageSelect() {
    var sel = document.getElementById('quote-coverage');
    if (!sel) return;
    var maxAmount = benefitPlanValue() === 'graded' ? GRADED_MAX_COVERAGE : LEVEL_MAX_COVERAGE;
    var lang = currentLang();
    var previous = sel.value;

    sel.textContent = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = lang === 'es' ? '— Elija el monto —' : '— Select amount —';
    sel.appendChild(placeholder);

    function addGroup(lo, hi) {
      hi = Math.min(hi, maxAmount);
      if (lo > hi) return;
      var og = document.createElement('optgroup');
      og.label = coverageGroupTitle(lo, hi, lang);
      appendThousandStepRange(og, lo, hi);
      sel.appendChild(og);
    }

    if (maxAmount >= 2000) addGroup(2000, Math.min(9000, maxAmount));
    if (maxAmount >= 10000) {
      var midEnd = maxAmount <= 24000 ? maxAmount : 24000;
      addGroup(10000, midEnd);
    }
    if (maxAmount >= 25000) addGroup(25000, maxAmount);

    var want = parseInt(previous, 10);
    if (!isNaN(want) && want >= 2000 && want <= maxAmount && want % 1000 === 0) {
      sel.value = String(want);
    } else if (!isNaN(want) && want > maxAmount) {
      sel.value = String(maxAmount);
    }
  }

  function resolvedCoverageAmount() {
    var sel = document.getElementById('quote-coverage');
    var v = sel ? sel.value : '';
    if (!v) return NaN;
    return parseInt(v, 10);
  }

  function benefitPlanValue() {
    var el = document.getElementById('quote-benefit-plan');
    return el && el.value === 'graded' ? 'graded' : 'level';
  }

  function collectForm() {
    var phoneEl = document.getElementById('quote-phone');
    var phone = phoneEl ? phoneEl.value.trim() : '';
    var healthEl = document.getElementById('quote-health');
    var health = healthEl ? healthEl.value.trim() : '';
    var otherEl = document.getElementById('quote-health-other');
    var other = otherEl ? otherEl.value.trim() : '';
    var y = (document.getElementById('quote-dob-year') || {}).value || '';
    var m = (document.getElementById('quote-dob-month') || {}).value || '';
    var d = (document.getElementById('quote-dob-day') || {}).value || '';
    var dateOfBirth = '';
    var age = NaN;
    if (y && m && d) {
      var yi = parseInt(y, 10);
      var mi = parseInt(m, 10);
      var di = parseInt(d, 10);
      if (di >= 1 && di <= daysInMonth(yi, mi)) {
        dateOfBirth = y + '-' + pad2(m) + '-' + pad2(d);
        age = computeAgeFromYmd(yi, mi, di);
      }
    } else {
      var legacyAgeEl = document.getElementById('quote-age');
      if (legacyAgeEl && legacyAgeEl.value !== '') {
        var la = parseInt(legacyAgeEl.value, 10);
        if (!isNaN(la)) age = la;
      }
    }
    return {
      firstName: (document.getElementById('quote-first') || {}).value || '',
      lastName: (document.getElementById('quote-last') || {}).value || '',
      email: (document.getElementById('quote-email') || {}).value || '',
      phone: phone,
      dateOfBirth: dateOfBirth,
      age: age,
      gender: (document.getElementById('quote-gender') || {}).value || '',
      coverage: resolvedCoverageAmount(),
      tobacco: (document.getElementById('quote-tobacco') || {}).value || 'no',
      healthCondition: health,
      healthConditionOther: health === 'other' ? other : '',
      state: ((document.getElementById('quote-state') || {}).value || 'NE').toUpperCase(),
      zip: (document.getElementById('quote-zip') || {}).value || '',
      lang: currentLang(),
      consentEmail: !!(document.getElementById('quote-consent-email') || {}).checked,
      consentCall: !!(document.getElementById('quote-consent-call') || {}).checked,
      consentText: !!(document.getElementById('quote-consent-text') || {}).checked,
      benefitPlan: benefitPlanValue(),
    };
  }

  function birthdateRangeMsg() {
    return t('birthdateOutOfRange')
      .replace(/\{min\}/g, String(_ageMin))
      .replace(/\{max\}/g, String(_ageMax));
  }

  function mapServerSubmitError(code, detail) {
    if (code === 'invalid_date_of_birth' || code === 'dob_future') return t('birthdateInvalid');
    if (code === 'dob_required') return t('ageOrBirthdateRequired');
    if (code && String(code).indexOf('age_out_of_range') === 0) {
      var parts = /^age_out_of_range:(\d+)-(\d+)$/.exec(String(code));
      if (parts)
        return t('birthdateOutOfRange')
          .replace(/\{min\}/g, parts[1])
          .replace(/\{max\}/g, parts[2]);
      return birthdateRangeMsg();
    }
    if (code === 'consent_all_required') return t('validation');
    if (code === 'invalid_email') {
      return currentLang() === 'es' ? 'Revise el correo electrónico.' : 'Please check the email address.';
    }
    if (code === 'name_required') {
      return currentLang() === 'es' ? 'Nombre y apellido son obligatorios.' : 'First and last name are required.';
    }
    if (code === 'phone_required') {
      return currentLang() === 'es' ? 'El teléfono no es válido.' : 'Phone number is not valid.';
    }
    if (code === 'lead_persist_failed' && detail) return String(detail).slice(0, 280);
    if (code === 'graded_coverage_max_20000') return t('gradedCoverage');
    if (code === 'level_coverage_max_50000') return t('levelCoverageMax');
    if (code && String(code).indexOf('graded_age_out_of_range') === 0) {
      var gp = /^graded_age_out_of_range:(\d+)-(\d+)$/.exec(String(code));
      if (gp) {
        return currentLang() === 'es'
          ? 'Para estimación Graduado (Graded), la edad debe estar entre ' + gp[1] + ' y ' + gp[2] + ' años.'
          : 'For a Graded estimate, age must be between ' + gp[1] + ' and ' + gp[2] + '.';
      }
      return t('gradedAge');
    }
    return null;
  }

  function syncHealthOtherField() {
    var sel = document.getElementById('quote-health');
    var wrap = document.getElementById('quote-health-other-wrap');
    var other = document.getElementById('quote-health-other');
    if (!sel || !other) return;
    var isOther = sel.value === 'other';
    if (wrap) wrap.classList.toggle('opacity-50', !isOther);
    other.disabled = !isOther;
    other.setAttribute('aria-required', isOther ? 'true' : 'false');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var errEl = document.getElementById('quote-form-error');
    var submitBtn0 = document.getElementById('quote-submit');
    if (submitBtn0) submitBtn0.textContent = t('seeEstimate');

    if (!isQuoteApiConfigured()) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = t('configureApi');
      }
      return;
    }

    fillDobMonthOptions();
    fillDobYearOptions();
    syncDobDays();
    var dobYear = document.getElementById('quote-dob-year');
    var dobMonth = document.getElementById('quote-dob-month');
    if (dobYear) dobYear.addEventListener('change', syncDobDays);
    if (dobMonth) dobMonth.addEventListener('change', syncDobDays);

    fetchJson('/api/quote/options')
      .then(function (j) {
        if (j && j.ok) wireOptions(j);
      })
      .catch(function () {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = t('loadOptionsFail');
        }
      });

    var form = document.getElementById('quote-form');
    if (!form) return;

    var healthSel = document.getElementById('quote-health');
    var healthOther = document.getElementById('quote-health-other');
    if (healthSel) {
      healthSel.addEventListener('change', syncHealthOtherField);
      healthSel.addEventListener('change', function () {
        if (errEl && errEl.textContent === t('healthOther')) errEl.hidden = true;
      });
    }
    if (healthOther) {
      healthOther.addEventListener('input', syncHealthOtherField);
    }
    syncHealthOtherField();

    var covSel = document.getElementById('quote-coverage');
    populateCoverageSelect();

    var bpEl = document.getElementById('quote-benefit-plan');
    if (bpEl) {
      bpEl.addEventListener('change', function () {
        populateCoverageSelect();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('quote-submit');
      var payload = collectForm();
      if (!payload.healthCondition) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = t('healthSelect');
        }
        return;
      }
      if (payload.healthCondition === 'other' && payload.healthConditionOther.length < 2) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = t('healthOther');
        }
        syncHealthOtherField();
        return;
      }
      var covChoice = covSel ? covSel.value : '';
      if (!covChoice) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = t('coverageSelect');
        }
        return;
      }
      if (benefitPlanValue() === 'graded') {
        if (!isNaN(payload.age) && (payload.age < GRADED_AGE_MIN || payload.age > GRADED_AGE_MAX)) {
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = t('gradedAge');
          }
          return;
        }
        if (!isNaN(payload.coverage) && payload.coverage > GRADED_MAX_COVERAGE) {
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = t('gradedCoverage');
          }
          return;
        }
      }
      if (isNaN(payload.coverage)) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = t('coverageSelect');
        }
        return;
      }
      if (!payload.consentEmail || !payload.consentCall || !payload.consentText) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = t('validation');
        }
        return;
      }
      if (isNaN(payload.age)) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = document.getElementById('quote-age')
            ? t('ageOrBirthdateRequired')
            : t('birthdateRequired');
        }
        return;
      }
      if (payload.age < _ageMin || payload.age > _ageMax) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = birthdateRangeMsg();
        }
        return;
      }
      var outbound = Object.assign({}, payload);
      if (outbound.dateOfBirth) delete outbound.age;
      else delete outbound.dateOfBirth;
      if (errEl) errEl.hidden = true;
      if (btn) {
        btn.disabled = true;
        btn.textContent = t('submitting');
      }

      fetch(apiBase() + '/api/quote/submit', {
        method: 'POST',
        headers: headersJson(),
        body: JSON.stringify(outbound),
      })
        .then(function (r) {
          return r.text().then(function (text) {
            var j = null;
            if (text) {
              try {
                j = JSON.parse(text);
              } catch (err) {
                j = null;
              }
            }
            return { ok: r.ok, status: r.status, body: j, rawText: text };
          });
        })
        .then(function (res) {
          if (!res.ok || !res.body || !res.body.ok) {
            var code = res.body && res.body.error;
            var detail = res.body && res.body.detail;
            var mapped = mapServerSubmitError(code, detail);
            throw new Error(
              mapped ||
                (code ? String(code) : null) ||
                (detail ? String(detail) : null) ||
                (!res.body && res.status >= 400
                  ? (currentLang() === 'es'
                      ? 'Respuesta inválida del servidor (' + res.status + ').'
                      : 'Invalid server response (' + res.status + ').')
                  : t('submitFail'))
            );
          }
          try {
            sessionStorage.setItem(
              'mvsQuoteResult',
              JSON.stringify(Object.assign({}, res.body, { lang: currentLang() }))
            );
          } catch (e) {}
          window.location.href = 'quote-results.html';
        })
        .catch(function (e) {
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent =
              e && e.message && e.message !== 'undefined' ? e.message : t('submitFail');
          }
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = t('seeEstimate');
          }
        });
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTimeout(function () {
          var sb = document.getElementById('quote-submit');
          if (sb && !sb.disabled) sb.textContent = t('seeEstimate');
          populateCoverageSelect();
        }, 0);
      });
    });
  });
})();
