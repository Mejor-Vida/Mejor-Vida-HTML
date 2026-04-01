(function () {
  'use strict';

  var STORAGE_KEY = 'mvsQuoteResult';

  function currentLang() {
    var c = document.documentElement.className || '';
    return c.indexOf('lang-en') !== -1 ? 'en' : 'es';
  }

  function t(key) {
    var L = currentLang();
    var m = {
      pageTitle: {
        es: 'Tus cotizaciones ilustrativas',
        en: 'Your illustrative quotes',
      },
      pageSub: {
        es: 'Primas de referencia por aseguradora. Julie confirma elegibilidad y precios finales.',
        en: 'Reference premiums by carrier. Julie confirms eligibility and final pricing.',
      },
      scheduleTitle: {
        es: 'Agenda una llamada con Julie',
        en: 'Schedule a call with Julie',
      },
      scheduleSub: {
        es: 'Elige un horario que te convenga. Usa el calendario abajo o el botón para abrir en una pestaña nueva.',
        en: 'Pick a time that works for you. Use the calendar below or the button to open in a new tab.',
      },
      openScheduler: {
        es: 'Abrir agenda en nueva pestaña',
        en: 'Open scheduler in new tab',
      },
      backToForm: {
        es: '← Volver al formulario de cotización',
        en: '← Back to quote form',
      },
      missing: {
        es: 'No encontramos resultados de cotización. Vuelve al formulario e inténtalo de nuevo.',
        en: 'We could not find quote results. Return to the form and try again.',
      },
      monthly: { es: 'al mes (referencia)', en: 'per month (illustrative)' },
      coverage: { es: 'Cobertura', en: 'Coverage' },
      savedNote: {
        es: 'Guardamos tu información para que Julie pueda dar seguimiento.',
        en: 'We saved your details so Julie can follow up.',
      },
      leadWarn: {
        es: 'No se pudo guardar en el servidor (revisa la configuración).',
        en: 'Lead save failed (check server configuration).',
      },
      emailSent: { es: 'Te enviamos un correo con el resumen.', en: 'We emailed you a summary.' },
      emailSkipped: {
        es: 'Correo no enviado (configura el servidor de correo si aplica).',
        en: 'Email not sent (configure outbound email if applicable).',
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

  function carrierTitle(c) {
    var L = currentLang();
    if (c.carrierKey === 'mutual-of-omaha-level') {
      return L === 'es'
        ? 'Mutual of Omaha — Nivel (ilustrativo)'
        : 'Mutual of Omaha — Level (illustrative)';
    }
    if (c.carrierKey === 'mutual-of-omaha-graded') {
      return L === 'es'
        ? 'Mutual of Omaha — Graduado (ilustrativo)'
        : 'Mutual of Omaha — Graded (illustrative)';
    }
    return c.carrierName || c.carrierKey || '';
  }

  function renderReferralOnly(data) {
    var ref = document.getElementById('quote-referral-panel');
    var sec = document.getElementById('quote-results-carrier-section');
    var moo = document.getElementById('quote-moo-explainer');
    var foot = document.getElementById('quote-results-foot');
    if (data.quoteStatus !== 'referral_out_of_state') {
      if (ref) {
        ref.hidden = true;
        ref.textContent = '';
      }
      if (sec) sec.hidden = false;
      return false;
    }
    var n = data.referralOutOfStateNote;
    var txt = n && (currentLang() === 'es' ? n.es : n.en);
    if (ref) {
      ref.textContent = txt || '';
      ref.hidden = !txt;
    }
    if (sec) sec.hidden = true;
    if (moo) moo.hidden = true;
    if (foot) foot.hidden = true;
    return true;
  }

  function renderMooExplainer(data) {
    var el = document.getElementById('quote-moo-explainer');
    if (!el) return;
    var n = data && data.mooLevelGradedNote;
    var ok =
      data &&
      data.quoteStatus === 'quote_generated' &&
      data.carriers &&
      data.carriers.length &&
      n &&
      typeof n === 'object';
    if (!ok) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    var txt = (currentLang() === 'es' ? n.es : n.en) || '';
    if (!txt) {
      el.hidden = true;
      return;
    }
    el.textContent = txt;
    el.hidden = false;
  }

  function embedUrlForSchedule(scheduleUrl) {
    if (typeof window.MVS_SCHEDULE_EMBED_URL === 'string' && window.MVS_SCHEDULE_EMBED_URL.trim()) {
      return window.MVS_SCHEDULE_EMBED_URL.trim();
    }
    if (!scheduleUrl) return null;
    if (/calendly\.com/i.test(scheduleUrl)) {
      try {
        var u = new URL(scheduleUrl);
        if (!u.searchParams.has('embed')) u.searchParams.set('embed', 'true');
        return u.toString();
      } catch (e) {
        return null;
      }
    }
    return null;
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
        img.style.maxHeight = '40px';
        img.style.width = 'auto';
        img.style.objectFit = 'contain';
        top.appendChild(img);
      }
      var ttl = document.createElement('strong');
      ttl.className = 'text-primary';
      ttl.textContent = carrierTitle(c);
      top.appendChild(ttl);
      card.appendChild(top);

      if (c.qualified && c.monthly != null) {
        var p = document.createElement('p');
        p.className = 'mb-1 fw-semibold';
        p.textContent = money(c.monthly) + ' / ' + t('monthly');
        var cove = document.createElement('p');
        cove.className = 'small text-body-secondary mb-0';
        cove.textContent = t('coverage') + ': $' + Number(c.coverage).toLocaleString();
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

  function wireSchedule(data) {
    var scheduleUrl = data && data.scheduleUrl ? String(data.scheduleUrl) : '';
    var embed = embedUrlForSchedule(scheduleUrl);
    var iframe = document.getElementById('schedule-iframe');
    var wrap = document.getElementById('schedule-embed-wrap');
    var btn = document.getElementById('schedule-open-tab');
    var noLink = document.getElementById('schedule-no-link');

    if (btn) {
      if (scheduleUrl) {
        btn.href = scheduleUrl;
        btn.hidden = false;
      } else {
        btn.hidden = true;
      }
    }

    if (noLink) {
      noLink.hidden = !!scheduleUrl;
    }

    if (iframe && wrap && embed) {
      iframe.src = embed;
      iframe.title = currentLang() === 'es' ? 'Calendario con Julie' : 'Schedule with Julie';
      wrap.hidden = false;
    } else if (wrap) {
      wrap.hidden = true;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var raw = sessionStorage.getItem(STORAGE_KEY);
    var missing = document.getElementById('quote-results-missing');
    var main = document.getElementById('quote-results-main');

    if (!raw) {
      if (missing) missing.hidden = false;
      if (main) main.hidden = true;
      return;
    }

    var data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      if (missing) missing.hidden = false;
      if (main) main.hidden = true;
      return;
    }

    if (!data) {
      if (missing) missing.hidden = false;
      if (main) main.hidden = true;
      return;
    }

    if (data.quoteStatus === 'referral_out_of_state') {
      if (missing) missing.hidden = true;
      if (main) main.hidden = false;
      renderReferralOnly(data);
      wireSchedule(data);
      document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          setTimeout(function () {
            renderReferralOnly(data);
            wireSchedule(data);
          }, 0);
        });
      });
      return;
    }

    if (!data.carriers) {
      if (missing) missing.hidden = false;
      if (main) main.hidden = true;
      return;
    }

    if (missing) missing.hidden = true;
    if (main) main.hidden = false;

    renderReferralOnly(data);
    renderMooExplainer(data);
    renderCarriers(data.carriers, data);
    wireSchedule(data);
    var foot0 = document.getElementById('quote-results-foot');
    if (foot0) foot0.hidden = false;

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTimeout(function () {
          renderReferralOnly(data);
          renderMooExplainer(data);
          renderCarriers(data.carriers, data);
          wireSchedule(data);
          var foot1 = document.getElementById('quote-results-foot');
          if (foot1) foot1.hidden = false;
        }, 0);
      });
    });
  });
})();
