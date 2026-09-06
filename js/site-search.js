/**
 * Public website search — ranks indexed pages for a visitor question.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-mvi-site-search]");
  if (!root) return;

  var lang = root.getAttribute("data-lang") === "en" ? "en" : "es";
  var indexUrl = root.getAttribute("data-index") || "/data/site-search.json";
  var form = root.querySelector("[data-search-form]");
  var input = root.querySelector("[data-search-input]");
  var statusEl = root.querySelector("[data-search-status]");
  var listEl = root.querySelector("[data-search-results]");

  var COPY = {
    es: {
      searching: "Buscando…",
      empty: "Escriba una pregunta o tema para ver las páginas más relevantes.",
      none: "No encontramos páginas para esa búsqueda. Pruebe con otras palabras, como “gastos finales”, “cotización” o “funeral”.",
      error: "No pudimos cargar el índice de búsqueda. Recargue la página e intente de nuevo.",
      count: function (n, q) {
        return n === 1
          ? '1 página relevante para “' + q + '”.'
          : n + ' páginas relevantes para “' + q + '”.';
      },
    },
    en: {
      searching: "Searching…",
      empty: "Type a question or topic to see the most relevant pages.",
      none: "No pages matched that search. Try other words, such as “final expense”, “quote”, or “funeral”.",
      error: "We could not load the search index. Reload the page and try again.",
      count: function (n, q) {
        return n === 1
          ? '1 relevant page for “' + q + '”.'
          : n + ' relevant pages for “' + q + '”.';
      },
    },
  };

  var t = COPY[lang] || COPY.es;
  var pages = null;
  var loadPromise = null;

  var STOP = {
    de: 1, la: 1, el: 1, los: 1, las: 1, un: 1, una: 1, unos: 1, y: 1, o: 1, en: 1, para: 1, con: 1,
    por: 1, del: 1, al: 1, se: 1, su: 1, sus: 1, que: 1, es: 1, the: 1, a: 1, an: 1, of: 1, to: 1,
    for: 1, and: 1, or: 1, in: 1, on: 1, with: 1, your: 1, my: 1, is: 1, are: 1, how: 1, what: 1,
    do: 1, does: 1, can: 1, i: 1, me: 1, we: 1, you: 1, about: 1, from: 1,
  };

  var SYN = [
    ["gastos finales", "final expense", "burial insurance", "seguro de entierro", "funeral insurance"],
    ["cotizacion", "cotización", "quote", "precio", "costo", "cost"],
    ["funeral", "entierro", "burial", "cremacion", "cremation"],
    ["examen medico", "medical exam", "sin examen", "no exam"],
    ["mayores", "seniors", "ancianos"],
    ["whatsapp", "mensaje", "contact", "contacto"],
  ];

  function fold(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s$]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(q) {
    var parts = fold(q).split(" ").filter(function (w) {
      return w.length > 1 && !STOP[w];
    });
    var extra = [];
    var joined = " " + parts.join(" ") + " ";
    SYN.forEach(function (group) {
      var hit = group.some(function (alias) {
        return joined.indexOf(" " + fold(alias) + " ") !== -1 || parts.indexOf(fold(alias)) !== -1;
      });
      if (!hit) return;
      group.forEach(function (alias) {
        fold(alias).split(" ").forEach(function (w) {
          if (w.length > 1 && extra.indexOf(w) === -1) extra.push(w);
        });
      });
    });
    return parts.concat(extra);
  }

  function countHits(hay, word) {
    if (!hay || !word) return 0;
    var n = 0;
    var i = 0;
    while ((i = hay.indexOf(word, i)) !== -1) {
      n += 1;
      i += word.length;
    }
    return n;
  }

  function scoreDoc(doc, words, phrase) {
    var title = fold(doc.title);
    var h1 = fold(doc.h1);
    var desc = fold(doc.description);
    var text = fold(doc.text);
    var s = 0;
    if (phrase && phrase.length > 3) {
      if (title.indexOf(phrase) !== -1) s += 80;
      else if (h1.indexOf(phrase) !== -1) s += 55;
      else if (desc.indexOf(phrase) !== -1) s += 35;
      else if (text.indexOf(phrase) !== -1) s += 12;
    }
    words.forEach(function (w) {
      if (title.indexOf(w) !== -1) s += 14 + Math.min(6, countHits(title, w));
      if (h1.indexOf(w) !== -1) s += 8;
      if (desc.indexOf(w) !== -1) s += 6;
      if (text.indexOf(w) !== -1) s += 2 + Math.min(4, countHits(text, w));
    });
    if (/^\/(blog|en\/blog)\//.test(doc.url)) s += 2;
    if (doc.url === "/" || doc.url === "/en/") s -= 4;
    return s;
  }

  function snippet(doc, words) {
    var desc = String(doc.description || "").trim();
    if (desc) return desc;
    var text = String(doc.text || "");
    if (!text) return "";
    var folded = fold(text);
    var idx = -1;
    for (var i = 0; i < words.length; i++) {
      idx = folded.indexOf(words[i]);
      if (idx !== -1) break;
    }
    if (idx < 0) return text.slice(0, 180);
    var start = Math.max(0, idx - 40);
    var chunk = text.slice(start, start + 200).trim();
    return (start > 0 ? "…" : "") + chunk + (start + 200 < text.length ? "…" : "");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadIndex() {
    if (pages) return Promise.resolve(pages);
    if (loadPromise) return loadPromise;
    loadPromise = fetch(indexUrl, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("index");
        return res.json();
      })
      .then(function (data) {
        pages = (data && data.pages) || [];
        return pages;
      });
    return loadPromise;
  }

  function render(query) {
    var q = String(query || "").trim();
    listEl.innerHTML = "";
    if (!q) {
      statusEl.textContent = t.empty;
      return;
    }
    statusEl.textContent = t.searching;
    loadIndex()
      .then(function (all) {
        var words = tokens(q);
        var phrase = fold(q);
        var ranked = all
          .filter(function (doc) {
            return doc.lang === lang;
          })
          .map(function (doc) {
            return { doc: doc, score: scoreDoc(doc, words, phrase) };
          })
          .filter(function (row) {
            return row.score >= 8;
          })
          .sort(function (a, b) {
            return b.score - a.score;
          })
          .slice(0, 24);

        if (!ranked.length) {
          statusEl.textContent = t.none;
          return;
        }
        statusEl.textContent = t.count(ranked.length, q);
        var html = ranked
          .map(function (row) {
            var doc = row.doc;
            var href = doc.url;
            return (
              '<li class="mvi-site-search__item">' +
              '<a class="mvi-site-search__link" href="' +
              escapeHtml(href) +
              '">' +
              '<span class="mvi-site-search__title">' +
              escapeHtml(doc.title) +
              "</span>" +
              '<span class="mvi-site-search__desc">' +
              escapeHtml(snippet(doc, words)) +
              "</span>" +
              "</a></li>"
            );
          })
          .join("");
        listEl.innerHTML = html;
      })
      .catch(function () {
        statusEl.textContent = t.error;
      });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      var url = new URL(window.location.href);
      if (q) url.searchParams.set("q", q);
      else url.searchParams.delete("q");
      history.replaceState({}, "", url);
      render(q);
    });
  }

  var initial = "";
  try {
    initial = new URLSearchParams(window.location.search).get("q") || "";
  } catch (e) {
    initial = "";
  }
  if (input && initial) input.value = initial;
  if (initial) render(initial);
  else statusEl.textContent = t.empty;
})();
