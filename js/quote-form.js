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
      coverageSelect: {
        es: 'Seleccione un monto de cobertura.',
        en: 'Please select a coverage amount.',
      },
      coverageOther: {
        es: 'Si eligió «Otra cantidad», indique un monto entre $2,500 y $150,000.',
        en: 'If you chose “Other amount,” enter an amount between $2,500 and $150,000.',
      },
    };
    var bag = m[key];
    return bag ? bag[L] : key;
  }

  function reasonLabel(code) {
    var k = 'reason_' + String(code || '').replace(/[^a-z0-9_]/gi, '_');
    var msg = t(k);
    if (msg === k) return t('reason_default');
    return msg;
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

  function money(n) {
    if (n == null || isNaN(n)) return '—';
    return (
      '$' +
      Number(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function wireOptions(opts) {
    var age = document.getElementById('quote-age');
    if (age && opts.ageMin != null && opts.ageMax != null) {
      age.min = String(opts.ageMin);
      age.max = String(opts.ageMax);
      age.placeholder = opts.ageMin + '–' + opts.ageMax;
    }
  }

  var COVERAGE_OTHER_MIN = 2500;
  var COVERAGE_OTHER_MAX = 150000;

  function parseCoverageOtherInput(raw) {
    var n = parseInt(String(raw || '').replace(/[^\d]/g, ''), 10);
    return isNaN(n) ? NaN : n;
  }

  function resolvedCoverageAmount() {
    var sel = document.getElementById('quote-coverage');
    var oIn = document.getElementById('quote-coverage-other');
    var v = sel ? sel.value : '';
    if (v === 'other') {
      return oIn ? parseCoverageOtherInput(oIn.value) : NaN;
    }
    if (!v) return NaN;
    return parseInt(v, 10);
  }

  function syncCoverageOtherField() {
    var sel = document.getElementById('quote-coverage');
    var wrap = document.getElementById('quote-coverage-other-wrap');
    var other = document.getElementById('quote-coverage-other');
    if (!sel || !other) return;
    var isOther = sel.value === 'other';
    if (wrap) wrap.classList.toggle('opacity-50', !isOther);
    other.disabled = !isOther;
    other.setAttribute('aria-required', isOther ? 'true' : 'false');
  }

  function renderCarriers(carriers, data) {
    var wrap = document.getElementById('quote-results-cards');
    if (!wrap) return;
    wrap.innerHTML = '';
    (carriers || []).forEach(function (c) {
      var card = document.createElement('div');
      card.className = 'quote-carrier-card border rounded-3 p-3 bg-white shadow-sm';
      var top = document.createElement('div');
      top.className = 'd-flex align-items-center gap-3 mb-2';
      if (c.logo) {
        var img = document.createElement('img');
        img.src = c.logo;
        img.alt = '';
        img.className = 'quote-carrier-logo';
        img.width = 120;
        img.height == null;
        img.style.maxHeight = '40px';
        img.style.width = 'auto';
        img.style.objectFit = 'contain';
        top.appendChild(img);
      }
      var ttl = document.createElement('strong');
      ttl.className = 'text-primary';
      ttl.textContent = c.carrierName || c.carrierKey || '';
      top.appendChild(ttl);
      card.appendChild(top);

      if (c.qualified && c.monthly != null) {
        var p = document.createElement('p');
        p.className = 'mb-1 fw-semibold';
        p.textContent = money(c.monthly) + ' / ' + t('monthly');
        var cove = document.createElement('p');
        cove.className = 'small text-body-secondary mb-0';
        cove.textContent =
          t('coverage') + ': $' + Number(c.coverage).toLocaleString();
        card.appendChild(p);
        card.appendChild(cove);
      } else {
        var r = document.createElement('p');
        r.className = 'small text-body-secondary mb-1';
        r.textContent = reasonLabel(c.reason);
        card.appendChild(r);
      }
      wrap.appendChild(card);
    });

    var foot = document.getElementById('quote-results-foot');
    if (foot) {
      foot.hidden = false;
      var disc = document.getElementById('quote-disclaimer');
      if (disc && data && data.disclaimer) disc.textContent = data.disclaimer;
      var sched = document.getElementById('quote-schedule');
      if (sched && data && data.scheduleUrl) {
        sched.href = data.scheduleUrl;
        sched.hidden = false;
      } else if (sched) {
        sched.hidden = true;
      }
      var meta = document.getElementById('quote-meta');
      if (meta) {
        var parts = [];
        if (data.leadSaved) parts.push(t('savedNote'));
        else if (data.leadError) parts.push(t('leadWarn'));
        if (data.emailSent) parts.push(t('emailSent'));
        else parts.push(t('emailSkipped'));
        meta.textContent = parts.join(' ');
      }
    }
  }

  function collectForm() {
    var phoneEl = document.getElementById('quote-phone');
    var phone = phoneEl ? phoneEl.value.trim() : '';
    var healthEl = document.getElementById('quote-health');
    var health = healthEl ? healthEl.value.trim() : '';
    var otherEl = document.getElementById('quote-health-other');
    var other = otherEl ? otherEl.value.trim() : '';
    return {
      firstName: (document.getElementById('quote-first') || {}).value || '',
      lastName: (document.getElementById('quote-last') || {}).value || '',
      email: (document.getElementById('quote-email') || {}).value || '',
      phone: phone,
      age: parseInt((document.getElementById('quote-age') || {}).value, 10),
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
    };
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
    var covOther = document.getElementById('quote-coverage-other');
    if (covSel) {
      covSel.addEventListener('change', syncCoverageOtherField);
    }
    if (covOther) {
      covOther.addEventListener('input', function () {
        if (errEl && errEl.textContent === t('coverageOther')) errEl.hidden = true;
      });
    }
    syncCoverageOtherField();

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
      if (
        covChoice === 'other' &&
        (isNaN(payload.coverage) ||
          payload.coverage < COVERAGE_OTHER_MIN ||
          payload.coverage > COVERAGE_OTHER_MAX)
      ) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = t('coverageOther');
        }
        return;
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
      if (errEl) errEl.hidden = true;
      if (btn) {
        btn.disabled = true;
        btn.textContent = t('submitting');
      }

      fetch(apiBase() + '/api/quote/submit', {
        method: 'POST',
        headers: headersJson(),
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, status: r.status, body: j };
          });
        })
        .then(function (res) {
          if (!res.ok || !res.body || !res.body.ok) {
            throw new Error((res.body && res.body.error) || String(res.status));
          }
          window.__lastQuoteResponse = res.body;
          var results = document.getElementById('quote-results');
          if (results) results.hidden = false;
          renderCarriers(res.body.carriers, res.body);
          results && results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(function () {
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = t('submitFail');
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
          if (window.__lastQuoteResponse && window.__lastQuoteResponse.carriers) {
            renderCarriers(window.__lastQuoteResponse.carriers, window.__lastQuoteResponse);
          }
          var sb = document.getElementById('quote-submit');
          if (sb && !sb.disabled) sb.textContent = t('seeEstimate');
        }, 0);
      });
    });
  });
})();
