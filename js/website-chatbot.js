/**
 * Final expense assistant — embedded in #chatbot-widget-root (index.html).
 * Phase 1: collect contact. Phase 2: browser-side FAQ-style replies + escalation hint.
 * Replace CHAT_API_URL when a backend is ready (Supabase + retrieval).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mejorvida_fe_chat_contact_v1';
  /** RAG API — default /api/rag-site; set data-chat-api-url="" on root to use FAQ-only mode */
  var CHAT_API_URL = '/api/rag-site';
  var DEFAULT_AVATAR_SRC = 'img/julie-chatbot-avatar-cutout.png';

  function getLang() {
    return document.documentElement.classList.contains('lang-en') ? 'en' : 'es';
  }

  /** Detect the language of a typed question (overrides page locale for API calls). */
  function detectQuestionLang(text) {
    var s = String(text || '');
    // Spanish-specific characters are a strong signal
    if (/[ñáéíóúü¿¡]/i.test(s)) return 'es';
    var lower = s.toLowerCase();
    // Common Spanish question words / connectors
    var esWords = ['qué', 'que', 'cómo', 'como', 'cuánto', 'cuanto', 'cuál', 'cual',
                   'tengo', 'puedo', 'tiene', 'seguro', 'cuántos', 'cuantos',
                   'necesito', 'quiero', 'es un', 'hay ', 'cuándo', 'cuando',
                   'dónde', 'donde', 'por qué', 'para qué'];
    for (var i = 0; i < esWords.length; i++) {
      if (lower.indexOf(esWords[i]) !== -1) return 'es';
    }
    return 'en';
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  var T = {
    es: {
      title: 'Asistente de gastos finales',
      subtitle: 'Primero tu contacto; luego puedes hacer preguntas.',
      firstName: 'Nombre',
      lastName: 'Apellido (opcional)',
      email: 'Correo electrónico',
      phone: 'Teléfono (opcional)',
      startChat: 'Empezar',
      privacyNote:
        'Usamos tu contacto para responder y dar seguimiento. No vendemos tu información.',
      welcomeAfterContact: function (name) {
        return (
          'Gracias, ' +
          (name || 'Hola') +
          '. Pregunta lo que quieras sobre gastos finales. Si no tengo la respuesta aquí, Julie puede ayudarte por correo o WhatsApp.'
        );
      },
      placeholder: 'Escribe tu pregunta…',
      send: 'Enviar',
      botName: 'Julie',
      thinking: '…',
      escalate:
        'No tengo esa respuesta detallada aquí. Julie puede revisar tu caso: escríbenos por WhatsApp o agenda una consulta. También puedes escribir a chatbot@mejorvidainsurance.com.',
      validationName: 'Indica al menos tu nombre.',
      validationEmail: 'Indica un correo válido.',
      resumeLabel: 'Continuar con la conversación',
      newChat: 'Nuevo contacto',
      speechBubble: '¿En qué puedo ayudarte?',
    },
    en: {
      title: 'Final expense assistant',
      subtitle: 'Share your contact first; then ask your questions.',
      firstName: 'First name',
      lastName: 'Last name (optional)',
      email: 'Email',
      phone: 'Phone (optional)',
      startChat: 'Start',
      privacyNote:
        'We use your contact to respond and follow up. We do not sell your information.',
      welcomeAfterContact: function (name) {
        return (
          'Thanks, ' +
          (name || 'there') +
          '. Ask anything about final expense insurance. If I do not have it here, Julie can help by email or WhatsApp.'
        );
      },
      placeholder: 'Type your question…',
      send: 'Send',
      botName: 'Julie',
      thinking: '…',
      escalate:
        "I don't have that detailed answer here. Julie can review your situation—message us on WhatsApp or schedule a consult. You can also email chatbot@mejorvidainsurance.com.",
      validationName: 'Please enter your first name.',
      validationEmail: 'Please enter a valid email.',
      resumeLabel: 'Continue conversation',
      newChat: 'New contact',
      speechBubble: 'What can I help you with?',
    },
  };

  var FAQ = {
    es: [
      {
        keys: ['qué es', 'que es', 'gastos finales', 'seguro de gastos', 'final expense'],
        text:
          'Un seguro de gastos finales es un tipo de seguro de vida pensado para ayudar a cubrir funeral, entierro y deudas pequeñas al final de la vida. Las primas suelen ser niveladas y el proceso puede ser sencillo.',
      },
      {
        keys: ['cuánto', 'cuanto', 'cuesta', 'precio', 'prima', 'costo'],
        text:
          'El costo depende de la edad, salud y monto de cobertura. Puedes pedir una cotización gratis en la web o por WhatsApp; con tus datos Julie puede orientarte mejor.',
      },
      {
        keys: ['examen', 'médico', 'medico', 'salud'],
        text:
          'Muchas pólizas de gastos finales usan suscripción simplificada o preguntas de salud; a menudo no se requiere examen médico. Depende del producto y de tu situación.',
      },
      {
        keys: ['tiempo', 'rápido', 'cuánto tarda', 'cuanto tarda', 'aprobación'],
        text:
          'El tiempo varía por aseguradora y caso. A veces puede ser en días. Julie revisa tu información y te explica los siguientes pasos.',
      },
      {
        keys: ['español', 'inglés', 'ingles', 'idioma'],
        text:
          'Sí—Julie atiende en español e inglés para que entiendas tus opciones con claridad.',
      },
      {
        keys: ['nebraska', 'licencia', 'estado', 'residente'],
        text:
          'Julie está autorizada para ofrecer y vender seguros de vida en Nebraska. Si vives en otro estado, revisa las opciones indicadas en el sitio o pregunta por referidos.',
      },
    ],
    en: [
      {
        keys: ['what is', 'final expense', 'burial', 'funeral'],
        text:
          'Final expense insurance is a type of whole life coverage meant to help with funeral, burial, and small end-of-life bills. Premiums are often level and the process can be straightforward.',
      },
      {
        keys: ['how much', 'cost', 'premium', 'price'],
        text:
          'Cost depends on age, health, and coverage amount. Start with a free quote online or WhatsApp—Julie can guide you with your details.',
      },
      {
        keys: ['medical exam', 'exam', 'health', 'underwriting'],
        text:
          'Many final expense policies use simplified underwriting or health questions; often there is no medical exam. It depends on the product and your situation.',
      },
      {
        keys: ['how long', 'fast', 'approval', 'days'],
        text:
          'Timing varies by carrier and case—sometimes within days. Julie reviews your info and explains next steps.',
      },
      {
        keys: ['spanish', 'english', 'language', 'español'],
        text:
          'Yes—Julie serves clients in both Spanish and English.',
      },
      {
        keys: ['nebraska', 'license', 'state', 'resident'],
        text:
          'Julie is licensed for life insurance in Nebraska. If you live elsewhere, use the state-appropriate path on the site or ask about referrals.',
      },
    ],
  };

  function normalizeQuestion(q) {
    return String(q || '')
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function matchFaq(lang, question) {
    var n = normalizeQuestion(question);
    if (!n) return null;
    var rows = FAQ[lang] || FAQ.en;
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var score = 0;
      for (var k = 0; k < row.keys.length; k++) {
        var key = row.keys[k];
        if (n.indexOf(key) !== -1) score += key.length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = row.text;
      }
    }
    return bestScore >= 4 ? best : null;
  }

  function loadContact() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveContact(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clearContact() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  function mount(root) {
    if (!root) return;

    var ragAttr = root.getAttribute('data-chat-api-url');
    if (ragAttr !== null) {
      var t = String(ragAttr).trim();
      CHAT_API_URL = t === '' ? null : t;
    }

    var avatarSrc = root.getAttribute('data-avatar-src') || DEFAULT_AVATAR_SRC;

    var state = {
      contact: loadContact(),
    };

    var el = {};
    root.innerHTML =
      '<div class="fe-chatbot-layout">' +
      '  <div class="fe-chatbot-figure-col">' +
      '    <div class="fe-chatbot-figure-wrap">' +
      '    <div class="fe-chatbot-figure">' +
      '      <img class="fe-chatbot-figure-img" src="' +
      escapeHtml(avatarSrc) +
      '" alt="Julie" decoding="async" />' +
      '    </div>' +
      '    <div class="fe-chatbot-figure-bubble" role="status">' +
      '      <p class="mb-0 fw-semibold fe-chatbot-figure-bubble-text" data-lang="es">' +
      escapeHtml(T.es.speechBubble) +
      '</p>' +
      '      <p class="mb-0 fw-semibold fe-chatbot-figure-bubble-text" data-lang="en">' +
      escapeHtml(T.en.speechBubble) +
      '</p>' +
      '    </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="fe-chatbot-col">' +
      '  <div class="fe-chatbot card border-0 shadow-sm overflow-hidden h-100">' +
      '  <div class="fe-chatbot-header text-white px-3 py-3">' +
      '    <div class="fe-chatbot-title fw-bold" data-fe-role="title"></div>' +
      '    <div class="fe-chatbot-subtitle small text-white text-opacity-90 mt-1" data-fe-role="subtitle"></div>' +
      '  </div>' +
      '  <div class="fe-chatbot-messages" data-fe-role="messages" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '  <div class="fe-chatbot-contact border-top bg-white p-3" data-fe-role="contact-panel"></div>' +
      '  <div class="fe-chatbot-compose border-top bg-white p-3 d-none" data-fe-role="compose">' +
      '    <div class="input-group">' +
      '      <label class="visually-hidden" for="fe-chatbot-input" data-fe-role="input-label">Message</label>' +
      '      <textarea id="fe-chatbot-input" class="form-control fe-chatbot-textarea" rows="1" data-fe-role="input" autocomplete="off"></textarea>' +
      '      <button type="button" class="btn btn-primary fe-chatbot-send" data-fe-role="send"></button>' +
      '    </div>' +
      '  </div>' +
      '  </div>' +
      '  </div>' +
      '</div>';

    el.card = root.querySelector('.fe-chatbot');
    el.messages = root.querySelector('[data-fe-role="messages"]');
    el.contactPanel = root.querySelector('[data-fe-role="contact-panel"]');
    el.compose = root.querySelector('[data-fe-role="compose"]');
    el.input = root.querySelector('[data-fe-role="input"]');
    el.send = root.querySelector('[data-fe-role="send"]');
    el.title = root.querySelector('[data-fe-role="title"]');
    el.subtitle = root.querySelector('[data-fe-role="subtitle"]');
    el.inputLabel = root.querySelector('[data-fe-role="input-label"]');

    function applyStrings() {
      var lang = getLang();
      var t = T[lang];
      el.title.textContent = t.title;
      el.subtitle.textContent = t.subtitle;
      el.input.placeholder = t.placeholder;
      el.send.textContent = t.send;
      el.inputLabel.textContent = t.placeholder;
      el.input.setAttribute('aria-label', t.placeholder);
    }

    function scrollMessages() {
      el.messages.scrollTop = el.messages.scrollHeight;
    }

    function appendMessage(role, text) {
      var lang = getLang();
      var isUser = role === 'user';
      var wrap = document.createElement('div');
      wrap.className = 'fe-chatbot-msg fe-chatbot-msg--' + (isUser ? 'user' : 'bot');
      if (isUser) {
        wrap.innerHTML =
          '<div class="fe-chatbot-bubble">' +
          '<div class="fe-chatbot-bubble-text">' +
          escapeHtml(text).replace(/\n/g, '<br>') +
          '</div></div>';
      } else {
        wrap.innerHTML =
          '<div class="fe-chatbot-msg-body min-w-0">' +
          '<div class="fe-chatbot-bubble-name small text-muted mb-1">' +
          escapeHtml(T[lang].botName) +
          '</div>' +
          '<div class="fe-chatbot-bubble">' +
          '<div class="fe-chatbot-bubble-text">' +
          escapeHtml(text).replace(/\n/g, '<br>') +
          '</div></div></div>';
      }
      el.messages.appendChild(wrap);
      scrollMessages();
    }

    function appendBotAndSpeak(text) {
      appendMessage('bot', text);
    }

    function removeThinkingMessage() {
      var lang = getLang();
      var t = T[lang];
      var lastMsg = el.messages.querySelector('.fe-chatbot-msg:last-child');
      var lastTxt = lastMsg && lastMsg.querySelector('.fe-chatbot-bubble-text');
      if (lastTxt && lastTxt.textContent === t.thinking) {
        lastMsg.remove();
      }
    }

    function renderContactForm() {
      var lang = getLang();
      var t = T[lang];
      var c = state.contact || {};
      el.contactPanel.innerHTML =
        '<form class="fe-chatbot-form" novalidate>' +
        '  <div class="row g-2">' +
        '    <div class="col-md-6">' +
        '      <label class="form-label small mb-1" for="fe-fn">' +
        escapeHtml(t.firstName) +
        '</label>' +
        '      <input type="text" id="fe-fn" name="firstName" class="form-control form-control-sm" required value="' +
        escapeHtml(c.firstName || '') +
        '" autocomplete="given-name" />' +
        '    </div>' +
        '    <div class="col-md-6">' +
        '      <label class="form-label small mb-1" for="fe-ln">' +
        escapeHtml(t.lastName) +
        '</label>' +
        '      <input type="text" id="fe-ln" name="lastName" class="form-control form-control-sm" value="' +
        escapeHtml(c.lastName || '') +
        '" autocomplete="family-name" />' +
        '    </div>' +
        '    <div class="col-md-6">' +
        '      <label class="form-label small mb-1" for="fe-em">' +
        escapeHtml(t.email) +
        '</label>' +
        '      <input type="email" id="fe-em" name="email" class="form-control form-control-sm" required value="' +
        escapeHtml(c.email || '') +
        '" autocomplete="email" />' +
        '    </div>' +
        '    <div class="col-md-6">' +
        '      <label class="form-label small mb-1" for="fe-ph">' +
        escapeHtml(t.phone) +
        '</label>' +
        '      <input type="tel" id="fe-ph" name="phone" class="form-control form-control-sm" value="' +
        escapeHtml(c.phone || '') +
        '" autocomplete="tel" />' +
        '    </div>' +
        '  </div>' +
        '  <p class="small text-body-secondary mt-2 mb-2">' +
        escapeHtml(t.privacyNote) +
        '</p>' +
        '  <div class="d-flex flex-wrap align-items-center gap-2">' +
        '    <button type="submit" class="btn btn-primary btn-sm">' +
        escapeHtml(t.startChat) +
        '</button>' +
        (state.contact
          ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-fe-clear>' +
            escapeHtml(t.newChat) +
            '</button>'
          : '') +
        '  </div>' +
        '  <div class="invalid-feedback d-block small mt-1" data-fe-err style="display:none !important;"></div>' +
        '</form>';

      var form = el.contactPanel.querySelector('.fe-chatbot-form');
      var err = el.contactPanel.querySelector('[data-fe-err]');
      var clearBtn = el.contactPanel.querySelector('[data-fe-clear]');

      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          clearContact();
          state.contact = null;
          el.messages.innerHTML = '';
          renderContactForm();
          el.compose.classList.add('d-none');
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        err.style.display = 'none';
        var fd = new FormData(form);
        var firstName = String(fd.get('firstName') || '').trim();
        var lastName = String(fd.get('lastName') || '').trim();
        var email = String(fd.get('email') || '').trim();
        var phone = String(fd.get('phone') || '').trim();
        if (!firstName) {
          err.textContent = t.validationName;
          err.style.display = 'block';
          return;
        }
        if (!validEmail(email)) {
          err.textContent = t.validationEmail;
          err.style.display = 'block';
          return;
        }
        state.contact = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          savedAt: Date.now(),
        };
        saveContact(state.contact);
        el.contactPanel.innerHTML =
          '<p class="small text-body-secondary mb-0">' +
          escapeHtml(firstName) +
          ' · ' +
          escapeHtml(email) +
          (phone ? ' · ' + escapeHtml(phone) : '') +
          ' · <button type="button" class="btn btn-link btn-sm p-0 align-baseline" data-fe-edit>' +
          escapeHtml(t.newChat) +
          '</button></p>';
        el.contactPanel.querySelector('[data-fe-edit]').addEventListener('click', function () {
          renderContactForm();
        });

        el.compose.classList.remove('d-none');
        appendBotAndSpeak(t.welcomeAfterContact(firstName));
        el.input.focus();
      });
    }

    function afterContactReady() {
      el.compose.classList.remove('d-none');
      el.contactPanel.innerHTML = '';
      var lang = getLang();
      var t = T[lang];
      var c = state.contact;
      if (c) {
        el.contactPanel.innerHTML =
          '<p class="small text-body-secondary mb-0">' +
          escapeHtml(c.firstName) +
          ' · ' +
          escapeHtml(c.email) +
          (c.phone ? ' · ' + escapeHtml(c.phone) : '') +
          ' · <button type="button" class="btn btn-link btn-sm p-0 align-baseline" data-fe-edit>' +
          escapeHtml(t.newChat) +
          '</button></p>';
        el.contactPanel.querySelector('[data-fe-edit]').addEventListener('click', function () {
          clearContact();
          state.contact = null;
          el.messages.innerHTML = '';
          renderContactForm();
          el.compose.classList.add('d-none');
        });
      }
      appendBotAndSpeak(t.welcomeAfterContact(c && c.firstName));
      el.input.focus();
    }

    function sendUserMessage() {
      var lang = getLang();
      var t = T[lang];
      var text = String(el.input.value || '').trim();
      if (!text) return;
      el.input.value = '';
      appendMessage('user', text);

      if (CHAT_API_URL) {
        appendMessage('bot', t.thinking);
        var questionLang = detectQuestionLang(text);
        fetch(CHAT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            locale: questionLang,
            contact: state.contact,
          }),
        })
          .then(function (r) {
            if (!r.ok) throw new Error('chat api ' + r.status);
            return r.json();
          })
          .then(function (data) {
            removeThinkingMessage();
            if (data && data.reply) {
              appendBotAndSpeak(data.reply);
              return;
            }
            if (data && data.status === 'no_answer') {
              appendBotAndSpeak(t.escalate);
              return;
            }
            appendBotAndSpeak(t.escalate);
          })
          .catch(function () {
            removeThinkingMessage();
            var matched = matchFaq(lang, text);
            appendBotAndSpeak(matched || t.escalate);
          });
        return;
      }

      var matched = matchFaq(lang, text);
      window.setTimeout(function () {
        appendBotAndSpeak(matched || t.escalate);
      }, 280);
    }

    el.send.addEventListener('click', sendUserMessage);
    el.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.setTimeout(function () {
          applyStrings();
        }, 0);
      });
    });

    applyStrings();

    if (state.contact && state.contact.email && validEmail(state.contact.email)) {
      afterContactReady();
    } else {
      renderContactForm();
    }

    var section = document.getElementById('final-expense-answers');
    if (section && 'IntersectionObserver' in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && el.card) {
              el.card.classList.add('fe-chatbot--in-view');
            }
          });
        },
        { threshold: 0.12 }
      );
      obs.observe(section);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('chatbot-widget-root');
    if (root) mount(root);
  });
})();
