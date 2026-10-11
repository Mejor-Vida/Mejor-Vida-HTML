/**
 * CRM Practice exam — California life policies four-hour course.
 * A question leaves the bank only after it is answered correctly.
 * A miss shows the explanation, then the question is shuffled back in.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "mvi_ca_life_practice_exam_v1";

  var COPY = {
    en: {
      title: "Practice exam",
      sub: "California Life Insurance Policies four-hour course. One bank. A question is finished only after you answer it correctly.",
      note: "The Department of Insurance does not publish this course exam. These are original practice questions written from the 2025 four-hour course outline, the Department’s FAQ on who must take it, and the Life-Only Agent examination objectives that outline is based on. This is not the official exam and it does not replace the approved course.",
      mastered: "{n} answered correctly",
      left: "{n} still in the bank",
      repeat: "You missed this one. It stays in the bank until you get it right.",
      check: "Check answer",
      correct: "Correct. That question is out of the bank.",
      wrongTitle: "Not yet — read this, then it goes back into the bank",
      continue: "Continue",
      doneTitle: "The bank is clear",
      doneBody: "Every question has been answered correctly. You can start over whenever you want another full pass.",
      reset: "Start over",
      resetConfirm: "Clear your progress and put every question back in the bank?",
      empty: "The question bank did not load.",
    },
    es: {
      title: "Examen de práctica",
      sub: "Curso de cuatro horas de pólizas de vida de California. Un solo banco. Una pregunta se termina solo cuando la responde bien.",
      note: "El Departamento de Seguros no publica este examen. Las preguntas de práctica salen del programa de cuatro horas de 2025, de las preguntas frecuentes del Departamento y de los objetivos del examen de agente de vida. No es el examen oficial y no sustituye el curso aprobado. Las preguntas están en inglés.",
      mastered: "{n} respondidas bien",
      left: "{n} siguen en el banco",
      repeat: "Falló esta pregunta. Sigue en el banco hasta que la responda bien.",
      check: "Revisar respuesta",
      correct: "Correcto. Esa pregunta ya salió del banco.",
      wrongTitle: "Todavía no — lea esto; luego vuelve al banco",
      continue: "Continuar",
      doneTitle: "El banco está completo",
      doneBody: "Respondió bien todas las preguntas. Puede empezar de nuevo cuando quiera otro repaso completo.",
      reset: "Empezar de nuevo",
      resetConfirm: "¿Borrar el avance y regresar todas las preguntas al banco?",
      empty: "No se cargó el banco de preguntas.",
    },
  };

  var root = null;
  var state = null;
  var phase = "ask";
  var picked = -1;
  var displayOrder = [];
  var flash = "";
  var flashTimer = null;

  function lang() {
    return window.StaffCrm && window.StaffCrm.getLang && window.StaffCrm.getLang() === "es" ? "es" : "en";
  }

  function copy(key, vars) {
    var text = (COPY[lang()] || COPY.en)[key] || COPY.en[key] || key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (_, name) {
      return vars[name] == null ? "" : String(vars[name]);
    });
  }

  function esc(s) {
    return window.StaffCrm && window.StaffCrm.esc ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  function bank() {
    return Array.isArray(window.MVI_CA_LIFE_EXAM) ? window.MVI_CA_LIFE_EXAM : [];
  }

  function indexById() {
    var map = {};
    bank().forEach(function (item) {
      map[item.id] = item;
    });
    return map;
  }

  function shuffle(list) {
    var i;
    for (i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  function freshState() {
    var ids = bank().map(function (item) {
      return item.id;
    });
    shuffle(ids);
    return { mastered: {}, missed: {}, queue: ids };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.queue) || typeof parsed.mastered !== "object") return freshState();
      parsed.missed = parsed.missed || {};
      return parsed;
    } catch (e) {
      return freshState();
    }
  }

  function reconcile(data) {
    var ids = {};
    bank().forEach(function (item) {
      ids[item.id] = true;
    });
    data.queue = (data.queue || []).filter(function (id) {
      return ids[id] && !data.mastered[id];
    });
    var seen = {};
    data.queue.forEach(function (id) {
      seen[id] = true;
    });
    Object.keys(data.mastered).forEach(function (id) {
      if (!ids[id]) delete data.mastered[id];
      seen[id] = true;
    });
    bank().forEach(function (item) {
      if (!seen[item.id]) data.queue.push(item.id);
    });
  }

  function save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mastered: state.mastered, missed: state.missed, queue: state.queue })
      );
    } catch (e) {}
  }

  function current() {
    if (!state || !state.queue.length) return null;
    return indexById()[state.queue[0]] || null;
  }

  function prepareOrder(item) {
    displayOrder = item.choices.map(function (_, i) {
      return i;
    });
    shuffle(displayOrder);
  }

  function putBack(id) {
    state.queue.shift();
    if (!state.queue.length) {
      state.queue.push(id);
      return;
    }
    var at = 1 + Math.floor(Math.random() * state.queue.length);
    state.queue.splice(at, 0, id);
  }

  function clearFlashSoon() {
    if (flashTimer) window.clearTimeout(flashTimer);
    if (flash !== "correct") return;
    flashTimer = window.setTimeout(function () {
      flashTimer = null;
      if (flash !== "correct") return;
      flash = "";
      render();
    }, 900);
  }

  function onClick(ev) {
    var btn = ev.target.closest("[data-exam-action]");
    if (!btn || !root || !root.contains(btn)) return;
    var action = btn.getAttribute("data-exam-action");
    if (action === "pick" && phase === "ask") {
      flash = "";
      picked = Number(btn.getAttribute("data-choice"));
      render();
      return;
    }
    if (action === "check" && phase === "ask") {
      grade();
      return;
    }
    if (action === "continue" && phase === "explain") {
      var item = current();
      if (item) putBack(item.id);
      phase = "ask";
      picked = -1;
      flash = "";
      var next = current();
      if (next) prepareOrder(next);
      save();
      render();
      return;
    }
    if (action === "reset") {
      if (!window.confirm(copy("resetConfirm"))) return;
      state = freshState();
      phase = "ask";
      picked = -1;
      flash = "";
      var first = current();
      if (first) prepareOrder(first);
      save();
      render();
    }
  }

  function grade() {
    var item = current();
    if (!item || picked < 0) return;
    var chosen = displayOrder[picked];
    if (chosen === item.answer) {
      state.mastered[item.id] = true;
      delete state.missed[item.id];
      state.queue.shift();
      flash = "correct";
      phase = "ask";
      picked = -1;
      var next = current();
      if (next) prepareOrder(next);
      save();
      render();
      return;
    }
    state.missed[item.id] = (state.missed[item.id] || 0) + 1;
    phase = "explain";
    save();
    render();
  }

  function choiceClass(displayIndex, item) {
    var original = displayOrder[displayIndex];
    var classes = "crm-exam-choice";
    if (phase === "ask" && picked === displayIndex) classes += " is-picked";
    if (phase === "explain") {
      if (original === item.answer) classes += " is-correct";
      else if (picked === displayIndex) classes += " is-wrong";
    }
    return classes;
  }

  function renderEmpty(main) {
    main.innerHTML =
      '<div class="crm-exam"><div class="crm-placeholder"><strong>' + esc(copy("empty")) + "</strong></div></div>";
  }

  function render() {
    if (!root) return;
    var total = bank().length;
    var mastered = Object.keys(state.mastered).length;
    var left = state.queue.length;
    var pct = total ? Math.round((mastered / total) * 100) : 0;
    var item = current();

    var body;
    if (!item) {
      body =
        '<div class="crm-exam-card crm-exam-done"><h2>' +
        esc(copy("doneTitle")) +
        "</h2><p>" +
        esc(copy("doneBody")) +
        '</p><button type="button" class="crm-btn secondary" data-exam-action="reset">' +
        esc(copy("reset")) +
        "</button></div>";
    } else {
      var letters = ["A", "B", "C", "D", "E", "F"];
      var choices = displayOrder
        .map(function (original, displayIndex) {
          return (
            '<button type="button" class="' +
            choiceClass(displayIndex, item) +
            '" data-exam-action="pick" data-choice="' +
            displayIndex +
            '"' +
            (phase === "explain" ? " disabled" : "") +
            '><span class="crm-exam-letter">' +
            letters[displayIndex] +
            ".</span> " +
            esc(item.choices[original]) +
            "</button>"
          );
        })
        .join("");

      var explain = "";
      if (phase === "explain") {
        var correctText = item.choices[item.answer];
        explain =
          '<div class="crm-exam-explain"><strong>' +
          esc(copy("wrongTitle")) +
          "</strong><p><strong>" +
          esc(correctText) +
          ".</strong> " +
          esc(item.explain) +
          '</p></div><div class="crm-exam-actions"><button type="button" class="crm-btn" data-exam-action="continue">' +
          esc(copy("continue")) +
          "</button></div>";
      } else {
        var flashHtml = flash === "correct" ? '<p class="crm-exam-repeat" style="color:var(--crm-ok)">' + esc(copy("correct")) + "</p>" : "";
        explain =
          flashHtml +
          '<div class="crm-exam-actions"><button type="button" class="crm-btn" data-exam-action="check"' +
          (picked < 0 ? " disabled" : "") +
          ">" +
          esc(copy("check")) +
          "</button></div>";
      }

      body =
        '<article class="crm-exam-card">' +
        '<p class="crm-exam-topic">' +
        esc(item.topic) +
        "</p>" +
        (state.missed[item.id] ? '<p class="crm-exam-repeat">' + esc(copy("repeat")) + "</p>" : "") +
        '<h2 class="crm-exam-q">' +
        esc(item.q) +
        "</h2>" +
        '<div class="crm-exam-choices">' +
        choices +
        "</div>" +
        explain +
        "</article>";
    }

    root.innerHTML =
      '<section class="crm-exam">' +
      '<div class="crm-exam-head"><div><h1>' +
      esc(copy("title")) +
      '</h1><p class="crm-exam-sub">' +
      esc(copy("sub")) +
      '</p></div><button type="button" class="crm-btn secondary crm-exam-reset" data-exam-action="reset">' +
      esc(copy("reset")) +
      "</button></div>" +
      '<p class="crm-exam-note">' +
      esc(copy("note")) +
      "</p>" +
      '<div class="crm-exam-progress"><div class="crm-exam-progress-row"><span>' +
      esc(copy("mastered", { n: mastered })) +
      "</span><span>" +
      esc(copy("left", { n: left })) +
      '</span></div><div class="crm-exam-bar" aria-hidden="true"><span style="width:' +
      pct +
      '%"></span></div></div>' +
      body +
      "</section>";

    clearFlashSoon();
  }

  function mount(main) {
    root = main;
    if (!main._examBound) {
      main.addEventListener("click", onClick);
      main._examBound = true;
    }
    if (!bank().length) {
      renderEmpty(main);
      return;
    }
    state = load();
    reconcile(state);
    phase = "ask";
    picked = -1;
    flash = "";
    var item = current();
    if (item) prepareOrder(item);
    save();
    render();
  }

  window.StaffCrmPracticeExam = { mount: mount };
})();
