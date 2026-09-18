/**
 * Funeral home + cemetery directory — jump to the city’s static resource URL.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-mvi-fhdir]");
  if (!root) return;

  var lang = root.getAttribute("data-lang") === "en" ? "en" : "es";
  var dataUrl = root.getAttribute("data-src") || "/data/funeral-resources.json";
  var form = root.querySelector("[data-fhdir-form]");
  var input = root.querySelector("[data-fhdir-input]");
  var suggestEl = root.querySelector("[data-fhdir-suggest]");
  var statusEl = root.querySelector("[data-fhdir-status]");
  var resultsEl = root.querySelector("[data-fhdir-results]");

  var COPY = {
    es: {
      looking: "Buscando…",
      error: "No pudimos cargar el directorio. Recargue la página.",
      empty: "Escriba una ciudad. Si está en una comunidad cercana, use ese nombre (por ejemplo Derby o Bellevue).",
      none: "Todavía no hay funerarias reunidas para esa búsqueda. Pruebe el nombre de otra ciudad o pueblo cercano.",
      several: "Hay más de una coincidencia. Elija la ciudad:",
      updated: function (d) {
        return "Actualizado " + d + " a partir de las guías y contactos de ciudad.";
      },
    },
    en: {
      looking: "Searching…",
      error: "We could not load the directory. Reload the page.",
      empty: "Type a city. If you live in a nearby town, use that name (for example Derby or Bellevue).",
      none: "We do not have funeral homes gathered for that search yet. Try another city or nearby town.",
      several: "More than one match. Choose the city:",
      updated: function (d) {
        return "Updated " + d + " from the city guides and directory contacts.";
      },
    },
  };

  var t = COPY[lang] || COPY.es;
  var data = null;

  function fold(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function records() {
    if (!data) return [];
    if (data.listings && data.listings.length) return data.listings;
    return data.places || [];
  }

  function recName(r) {
    return lang === "es" ? r.nameEs : r.nameEn;
  }

  function recState(r) {
    return lang === "es" ? r.stateNameEs : r.stateNameEn;
  }

  function recHref(r) {
    if (lang === "en") return r.pathEn || "";
    return r.pathEs || "";
  }

  function findRecords(q) {
    var f = fold(q);
    if (!f || f.length < 2) return [];
    var list = records();
    var primary = list.filter(function (r) {
      return (
        fold(r.nameEn) === f ||
        fold(r.nameEs) === f ||
        r.slug === String(q).trim() ||
        fold(String(r.slug || "").replace(/-/g, " ")) === f
      );
    });
    if (primary.length) return primary;
    var alias = list.filter(function (r) {
      return (r.aliases || []).some(function (a) {
        return fold(a) === f;
      });
    });
    if (alias.length) return alias;
    return list.filter(function (r) {
      if (fold(r.nameEn).indexOf(f) === 0 || fold(r.nameEs).indexOf(f) === 0) return true;
      return (r.aliases || []).some(function (a) {
        return fold(a).indexOf(f) === 0;
      });
    });
  }

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function hideSuggest() {
    if (!suggestEl) return;
    suggestEl.hidden = true;
    suggestEl.innerHTML = "";
  }

  function showSuggest(items) {
    if (!suggestEl) return;
    if (!items.length) {
      hideSuggest();
      return;
    }
    suggestEl.innerHTML = items
      .slice(0, 8)
      .map(function (r) {
        var href = recHref(r);
        if (href) {
          return (
            "<li><a href='" +
            esc(href) +
            "'>" +
            esc(recName(r)) +
            ", " +
            esc(recState(r)) +
            "</a></li>"
          );
        }
        return (
          "<li><button type='button' data-slug='" +
          esc(r.slug) +
          "'>" +
          esc(recName(r)) +
          ", " +
          esc(recState(r)) +
          "</button></li>"
        );
      })
      .join("");
    suggestEl.hidden = false;
  }

  function goTo(rec) {
    var href = recHref(rec);
    if (href) {
      window.location.href = href;
      return;
    }
    hideSuggest();
    if (input) input.value = recName(rec);
    setStatus(t.updated(data.updated));
  }

  function renderChoices(items) {
    if (!resultsEl) return;
    resultsEl.innerHTML =
      '<p class="mvi-fhdir__lede">' +
      esc(t.several) +
      "</p><ul class='mvi-fhdir__pills'>" +
      items
        .map(function (r) {
          var href = recHref(r);
          if (href) {
            return (
              "<li><a href='" +
              esc(href) +
              "'>" +
              esc(recName(r)) +
              ", " +
              esc(recState(r)) +
              "</a></li>"
            );
          }
          return (
            "<li><button type='button' data-slug='" +
            esc(r.slug) +
            "'>" +
            esc(recName(r)) +
            ", " +
            esc(recState(r)) +
            "</button></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  function runQuery(q) {
    var query = String(q || "").trim();
    if (!query) {
      if (resultsEl) resultsEl.innerHTML = "";
      setStatus(t.empty);
      return;
    }
    var items = findRecords(query);
    if (!items.length) {
      if (resultsEl) resultsEl.innerHTML = "";
      setStatus(t.none);
      return;
    }
    if (items.length === 1) {
      goTo(items[0]);
      return;
    }
    setStatus(t.several);
    hideSuggest();
    renderChoices(items);
  }

  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      runQuery(input.value);
    });
  }

  if (input) {
    input.addEventListener("input", function () {
      if (!data) return;
      var q = input.value.trim();
      if (q.length < 2) {
        hideSuggest();
        return;
      }
      showSuggest(findRecords(q));
    });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") hideSuggest();
    });
  }

  document.addEventListener("click", function (ev) {
    if (suggestEl && !root.contains(ev.target)) hideSuggest();
  });

  setStatus(t.looking);
  fetch(dataUrl, { credentials: "same-origin" })
    .then(function (res) {
      if (!res.ok) throw new Error("load");
      return res.json();
    })
    .then(function (json) {
      data = json;
      var onListing = !!root.querySelector(".mvi-fhdir__place");
      setStatus((onListing ? "" : t.empty + " ") + t.updated(data.updated));
      var params = new URLSearchParams(window.location.search);
      var ciudad = params.get("ciudad") || params.get("city") || params.get("q");
      if (ciudad) runQuery(ciudad);
    })
    .catch(function () {
      setStatus(t.error);
    });
})();
