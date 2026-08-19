/**
 * Seniors-over-80 cost table — Female / Male tabs, face columns.
 */
(function () {
  function money(n) {
    if (n == null || n === "") return "—";
    return "$" + Number(n).toLocaleString("en-US");
  }

  function render() {
    var data = window.MVI_OVER80_RATES;
    var tbody = document.querySelector("[data-over80-tbody]");
    if (!data || !tbody) return;
    var gender = document.querySelector(".lic-rate-tab.is-active")
      ? document.querySelector(".lic-rate-tab.is-active").getAttribute("data-over80-gender")
      : "female";
    var rows = (data.tables && data.tables[gender]) || [];
    tbody.innerHTML = rows
      .map(function (r) {
        var ageLabel = r.estimated ? r.age + "<sup>*</sup>" : String(r.age);
        return (
          "<tr><th scope=\"row\">" +
          ageLabel +
          "</th><td>" +
          money(r["5000"]) +
          "</td><td>" +
          money(r["10000"]) +
          "</td><td>" +
          money(r["25000"]) +
          "</td></tr>"
        );
      })
      .join("");
  }

  function bindTabs() {
    var tabs = document.querySelectorAll(".lic-rate-tab[data-over80-gender]");
    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        render();
      });
    });
  }

  function bindGenderQuote() {
    document.querySelectorAll("[data-over80-quote-gender]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var g = btn.getAttribute("data-over80-quote-gender");
        var href = btn.getAttribute("href") || "quote.html";
        try {
          sessionStorage.setItem("mvi_quote_gender", g);
        } catch (err) {}
        var joiner = href.indexOf("?") >= 0 ? "&" : "?";
        window.location.href = href + joiner + "gender=" + encodeURIComponent(g);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindTabs();
      bindGenderQuote();
      render();
    });
  } else {
    bindTabs();
    bindGenderQuote();
    render();
  }
})();
