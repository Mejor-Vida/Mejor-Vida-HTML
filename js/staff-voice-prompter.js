/**
 * Staff Voice Prompter — CRM overlay.
 * Voice-follow scrolling for Julie’s YouTube scripts (Web Speech API).
 * Inspired by the open-source VoicePrompter app (kosuvorov/VoicePrompter, GPLv3);
 * this file is original Mejor Vida code, not a copy of that repository.
 */
(function () {
  "use strict";

  var overlay = null;
  var recognition = null;
  var listening = false;
  var wantListen = false;
  var words = [];
  var sentences = [];
  var index = 0;
  var lastMatched = "";
  var commandArmed = true;
  var fontSize = 64;
  var opts = {};
  var shownSent = -1;
  var micStream = null;
  var audioCtx = null;
  var analyser = null;
  var levelRaf = 0;
  var levelData = null;
  var peakLevel = 0;
  var heardAt = 0;
  var restartTimer = 0;
  var restartCount = 0;
  var fatalError = "";

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function fold(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9ñ]+/g, "");
  }

  function endsSentence(display) {
    return /[.!?…]["»”']?$/.test(String(display || ""));
  }

  function tokenize(text) {
    var out = [];
    String(text || "")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .forEach(function (line, li, arr) {
        String(line)
          .split(/\s+/)
          .filter(Boolean)
          .forEach(function (raw) {
            out.push({ display: raw, clean: fold(raw), skip: !fold(raw) });
          });
        if (li < arr.length - 1) out.push({ display: "", clean: "", skip: true, br: true });
      });
    return out;
  }

  function spokenCount(slice) {
    var n = 0;
    for (var i = 0; i < slice.length; i++) {
      if (!slice[i].skip) n++;
    }
    return n;
  }

  function assignSentences(list) {
    var groups = [];
    var cur = [];
    function pushCur() {
      if (!cur.length) return;
      groups.push(cur);
      cur = [];
    }
    list.forEach(function (w) {
      cur.push(w);
      if (w.br || endsSentence(w.display)) pushCur();
    });
    pushCur();
    var merged = [];
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      while (i < groups.length - 1 && spokenCount(g) < 4) {
        i++;
        g = g.concat(groups[i]);
      }
      merged.push(g);
    }
    sentences = merged.map(function (g) {
      var start = list.indexOf(g[0]);
      var end = list.indexOf(g[g.length - 1]) + 1;
      var si = merged.indexOf(g);
      g.forEach(function (w) {
        w.sent = si;
      });
      return { start: start, end: end, words: g };
    });
    sentences.forEach(function (s, si) {
      s.words.forEach(function (w) {
        w.sent = si;
      });
    });
  }

  function currentSentIndex() {
    if (!words.length || !sentences.length) return 0;
    if (index >= words.length) return sentences.length - 1;
    var w = words[Math.min(index, words.length - 1)];
    return w && w.sent != null ? w.sent : 0;
  }

  function SpeechCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function setHeard(msg) {
    if (!overlay) return;
    var el = overlay.querySelector("[data-vp='heard']");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  /**
   * Live input meter. Speech recognition captures audio on its own, but it gives
   * no signal about whether the microphone is actually feeding it. The meter is
   * the only way Julie can tell "mic is dead" apart from "words aren't matching".
   */
  function stopMeter() {
    if (levelRaf) {
      cancelAnimationFrame(levelRaf);
      levelRaf = 0;
    }
    if (micStream) {
      micStream.getTracks().forEach(function (tr) {
        try { tr.stop(); } catch (e) {}
      });
      micStream = null;
    }
    if (audioCtx) {
      try { audioCtx.close(); } catch (e) {}
      audioCtx = null;
    }
    analyser = null;
    levelData = null;
    peakLevel = 0;
    paintLevel(0);
  }

  function paintLevel(pct) {
    if (!overlay) return;
    var bar = overlay.querySelector("[data-vp='level'] i");
    if (bar) bar.style.width = Math.max(0, Math.min(100, Math.round(pct))) + "%";
  }

  function tickLevel() {
    if (!analyser || !levelData) return;
    analyser.getByteTimeDomainData(levelData);
    var peak = 0;
    for (var i = 0; i < levelData.length; i++) {
      var dev = Math.abs(levelData[i] - 128);
      if (dev > peak) peak = dev;
    }
    // 128 is full scale for 8-bit time-domain data; boost so normal speech fills the bar.
    var pct = Math.min(100, (peak / 128) * 300);
    peakLevel = Math.max(peakLevel * 0.9, pct);
    paintLevel(peakLevel);
    if (peakLevel > 8) heardAt = Date.now();
    levelRaf = requestAnimationFrame(tickLevel);
  }

  function startMeter() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        micStream = stream;
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
        var src = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        levelData = new Uint8Array(analyser.fftSize);
        src.connect(analyser);
        tickLevel();
      })
      .catch(function (err) {
        // Permission problems surface here far more clearly than through
        // SpeechRecognition's onerror, so report them from this path.
        var name = (err && err.name) || "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          fatalError = "vp_err_blocked";
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          fatalError = "vp_err_no_mic";
        } else if (name === "NotReadableError") {
          fatalError = "vp_err_mic_busy";
        }
        if (fatalError) {
          var key = fatalError;
          stopRecognition();
          fatalError = key;
          labelBar();
        }
      });
  }

  function speechErrorKey(code) {
    if (code === "not-allowed" || code === "service-not-allowed") return "vp_err_blocked";
    if (code === "audio-capture") return "vp_err_no_mic";
    if (code === "network") return "vp_err_network";
    if (code === "language-not-supported") return "vp_err_lang";
    return "";
  }

  function stageHtml() {
    return (
      '<div class="mvi-prompter__prev" data-vp="prev"></div>' +
      '<div class="mvi-prompter__now" data-vp="now"></div>' +
      '<div class="mvi-prompter__next" data-vp="next"></div>'
    );
  }

  function ensureOverlay() {
    if (overlay) {
      var stage = overlay.querySelector("[data-vp='stage']");
      if (stage && !overlay.querySelector("[data-vp='prev']")) stage.innerHTML = stageHtml();
      return overlay;
    }
    overlay = document.createElement("div");
    overlay.id = "mvi-prompter";
    overlay.className = "mvi-prompter";
    overlay.setAttribute("hidden", "");
    overlay.innerHTML =
      '<div class="mvi-prompter__bar">' +
      '<button type="button" class="mvi-prompter__close" data-vp="close"></button>' +
      '<p class="mvi-prompter__title" data-vp="title"></p>' +
      '<span class="mvi-prompter__status" data-vp="status"></span>' +
      '<span class="mvi-prompter__level" data-vp="level" aria-hidden="true"><i></i></span>' +
      '<button type="button" class="mvi-prompter__mic" data-vp="mic"></button>' +
      '<label class="mvi-prompter__font">Aa <input data-vp="font" type="range" min="48" max="96" value="64" /></label>' +
      "</div>" +
      '<p class="mvi-prompter__error" data-vp="error" hidden></p>' +
      '<div class="mvi-prompter__stage" data-vp="stage" tabindex="0">' +
      stageHtml() +
      "</div>" +
      '<p class="mvi-prompter__heard" data-vp="heard" hidden></p>' +
      '<p class="mvi-prompter__hint" data-vp="hint"></p>';
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-vp]");
      if (!btn) return;
      var act = btn.getAttribute("data-vp");
      if (act === "close") close();
      if (act === "mic") toggleListen();
    });
    overlay.addEventListener("input", function (e) {
      if (e.target.getAttribute("data-vp") === "font") {
        fontSize = Number(e.target.value) || 64;
        shownSent = -1;
        if (overlay && !overlay.hasAttribute("hidden")) renderWords();
      }
    });
    overlay.addEventListener("click", function (e) {
      var word = e.target.closest("[data-wi]");
      if (!word) return;
      jumpTo(Number(word.getAttribute("data-wi")));
    });
    document.addEventListener("keydown", onKey);
    return overlay;
  }

  function labelBar() {
    overlay.querySelector("[data-vp='close']").textContent = t("vp_close");
    overlay.querySelector("[data-vp='mic']").textContent = listening ? t("vp_stop") : t("vp_start_mic");
    overlay.querySelector("[data-vp='hint']").textContent = t("vp_hint");
    overlay.querySelector("[data-vp='status']").textContent = fatalError
      ? t("vp_mic_problem")
      : listening
        ? t("vp_listening")
        : t("vp_paused");
    overlay.querySelector("[data-vp='mic']").classList.toggle("is-on", listening);
    overlay.querySelector("[data-vp='status']").classList.toggle("is-error", !!fatalError);
    var errBox = overlay.querySelector("[data-vp='error']");
    if (errBox) {
      errBox.textContent = fatalError ? t(fatalError) : "";
      errBox.hidden = !fatalError;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wordHtml(w, i, role) {
    if (w.br) return "<br/>";
    var cls = "";
    if (role === "now") cls = i < index ? " is-done" : "";
    return '<span class="mvi-prompter__w' + cls + '" data-wi="' + i + '">' + escapeHtml(w.display) + "</span>";
  }

  function sentenceHtml(sent, role) {
    if (!sent) return "";
    return sent.words
      .map(function (w) {
        return wordHtml(w, words.indexOf(w), role);
      })
      .join(" ");
  }

  function renderWords() {
    var stage = overlay.querySelector("[data-vp='stage']");
    var prevBox = overlay.querySelector("[data-vp='prev']");
    var nowBox = overlay.querySelector("[data-vp='now']");
    var nextBox = overlay.querySelector("[data-vp='next']");
    var si = currentSentIndex();
    var shifted = shownSent >= 0 && si !== shownSent;
    var prev = sentences[si - 1];
    var now = sentences[si];
    var next = sentences[si + 1];
    prevBox.innerHTML = sentenceHtml(prev, "prev");
    prevBox.hidden = !prev;
    nowBox.innerHTML = sentenceHtml(now, "now");
    nextBox.innerHTML = sentenceHtml(next, "next");
    nextBox.hidden = !next;
    if (shifted) {
      stage.classList.remove("is-shift");
      void stage.offsetWidth;
      stage.classList.add("is-shift");
    }
    if (shownSent !== si) {
      shownSent = si;
      nowBox.style.fontSize = fontSize + "px";
      requestAnimationFrame(fitNow);
    }
  }

  function fitNow() {
    var stage = overlay.querySelector("[data-vp='stage']");
    var box = overlay.querySelector("[data-vp='now']");
    if (!box || !stage || !stage.clientHeight) return;
    var size = fontSize;
    box.style.fontSize = size + "px";
    var guard = 0;
    while (stage.scrollHeight > stage.clientHeight + 2 && size > 32 && guard < 40) {
      size -= 2;
      box.style.fontSize = size + "px";
      guard++;
    }
  }

  function jumpTo(i) {
    if (!Number.isFinite(i)) return;
    index = Math.max(0, Math.min(words.length, i));
    lastMatched = "";
    renderWords();
  }

  function goStart() {
    jumpTo(0);
  }

  function goBack() {
    var si = currentSentIndex();
    var prev = sentences[Math.max(0, si - 1)];
    jumpTo(prev ? prev.start : 0);
  }

  function goStop() {
    wantListen = false;
    stopRecognition();
    labelBar();
  }

  function lastTwo(tokens) {
    if (tokens.length < 2) return "";
    return tokens.slice(-2).join(" ");
  }

  function commandConflict(pair) {
    var parts = pair.split(" ");
    var from = Math.max(0, index - 4);
    var to = Math.min(words.length, index + 10);
    for (var i = from; i < to - 1; i++) {
      if (words[i].clean === parts[0] && words[i + 1].clean === parts[1]) return true;
    }
    return false;
  }

  function handleCommands(spokenTokens) {
    var pair = lastTwo(spokenTokens);
    if (pair !== "go start" && pair !== "go back" && pair !== "go stop" && pair !== "go next") {
      commandArmed = true;
      return false;
    }
    if (commandConflict(pair)) {
      commandArmed = true;
      return false;
    }
    if (!commandArmed) return true;
    commandArmed = false;
    if (pair === "go start") goStart();
    else if (pair === "go back") goBack();
    else if (pair === "go stop") goStop();
    else if (pair === "go next") {
      var si = currentSentIndex();
      var next = sentences[Math.min(sentences.length - 1, si + 1)];
      jumpTo(next ? next.start : index);
    }
    return true;
  }

  function nextSpoken(from, end) {
    var i = from;
    while (i < end && words[i] && words[i].skip) i++;
    return i;
  }

  function matchSpoken(spokenTokens) {
    var recent = spokenTokens.map(fold).filter(Boolean);
    if (recent.length > 16) recent = recent.slice(-16);
    if (!recent.length) return;
    var si = currentSentIndex();
    var sent = sentences[si];
    if (!sent) return;
    if (index >= sent.end) {
      var after = sentences[si + 1];
      jumpTo(after ? after.start : index);
      return;
    }
    var ptr = index;
    var heard = false;
    for (var s = 0; s < recent.length; s++) {
      var spoken = recent[s];
      var look = ptr;
      var hops = 0;
      while (look < sent.end && hops < 3) {
        var w = words[look];
        if (!w || w.skip) {
          look++;
          continue;
        }
        if (w.clean === spoken) {
          ptr = nextSpoken(look + 1, sent.end);
          lastMatched = spoken;
          heard = true;
          break;
        }
        look++;
        hops++;
      }
    }
    if (!heard) return;
    if (ptr >= sent.end) {
      var following = sentences[si + 1];
      index = following ? following.start : ptr;
      lastMatched = "";
    } else {
      index = ptr;
    }
    renderWords();
  }

  function onResult(event) {
    var transcript = "";
    for (var i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    heardAt = Date.now();
    setHeard(transcript.trim().slice(-120));
    var tokens = transcript
      .toLowerCase()
      .replace(/[^\w\sñáéíóúü]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map(fold)
      .filter(Boolean);
    if (handleCommands(tokens)) return;
    matchSpoken(tokens);
  }

  function startRecognition() {
    var Ctor = SpeechCtor();
    if (!Ctor) {
      fatalError = "vp_no_speech";
      labelBar();
      return;
    }
    if (!window.isSecureContext) {
      fatalError = "vp_err_insecure";
      labelBar();
      return;
    }
    stopRecognition();
    fatalError = "";
    restartCount = 0;
    recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = opts.lang || "es-US";
    recognition.onresult = onResult;
    recognition.onerror = function (e) {
      var code = (e && e.error) || "";
      // "no-speech" and "aborted" are routine; let onend restart quietly.
      if (code === "no-speech" || code === "aborted") return;
      var key = speechErrorKey(code);
      if (key) {
        fatalError = key;
        wantListen = false;
        listening = false;
        labelBar();
      }
    };
    recognition.onend = function () {
      if (!wantListen) {
        listening = false;
        labelBar();
        return;
      }
      // Chrome ends the session every so often; restart with a small backoff so a
      // persistent failure can't spin in a tight loop.
      restartCount++;
      if (restartCount > 60) {
        wantListen = false;
        listening = false;
        fatalError = "vp_err_restart";
        labelBar();
        return;
      }
      clearTimeout(restartTimer);
      restartTimer = setTimeout(function () {
        if (!wantListen || !recognition) return;
        try {
          recognition.start();
        } catch (e) {}
      }, 250);
    };
    wantListen = true;
    listening = true;
    try {
      recognition.start();
    } catch (e) {
      listening = false;
      wantListen = false;
      fatalError = "vp_err_restart";
    }
    startMeter();
    labelBar();
  }

  function stopRecognition() {
    wantListen = false;
    listening = false;
    clearTimeout(restartTimer);
    restartTimer = 0;
    restartCount = 0;
    if (recognition) {
      try {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.stop();
      } catch (e) {}
      recognition = null;
    }
    stopMeter();
    setHeard("");
  }

  function toggleListen() {
    if (listening) goStop();
    else startRecognition();
  }

  function onKey(e) {
    if (!overlay || overlay.hasAttribute("hidden")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === " " || e.code === "Space") {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      e.preventDefault();
      toggleListen();
    } else if (e.key === "Home") {
      e.preventDefault();
      goStart();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goBack();
    }
  }

  function open(next) {
    opts = next || {};
    ensureOverlay();
    words = tokenize(opts.script || "");
    assignSentences(words);
    index = 0;
    lastMatched = "";
    shownSent = -1;
    commandArmed = true;
    fatalError = "";
    setHeard("");
    overlay.querySelector("[data-vp='title']").textContent = opts.title || t("vp_title");
    overlay.querySelector("[data-vp='font']").value = String(fontSize);
    overlay.removeAttribute("hidden");
    document.body.classList.add("mvi-prompter-open");
    renderWords();
    labelBar();
    overlay.querySelector("[data-vp='stage']").focus();
    if (opts.autoListen === false) {
      labelBar();
      if (!words.some(function (w) { return !w.skip; })) {
        overlay.querySelector("[data-vp='status']").textContent = t("vp_no_script");
      }
      return;
    }
    if (words.some(function (w) { return !w.skip; })) startRecognition();
    else overlay.querySelector("[data-vp='status']").textContent = t("vp_no_script");
  }

  function close() {
    stopRecognition();
    if (overlay) overlay.setAttribute("hidden", "");
    document.body.classList.remove("mvi-prompter-open");
    if (typeof opts.onClose === "function") {
      try {
        opts.onClose();
      } catch (e) {}
    }
  }

  window.addEventListener("hashchange", function () {
    if (!/#\/youtube/.test(location.hash || "")) close();
  });

  window.StaffVoicePrompter = { open: open, close: close };
})();
