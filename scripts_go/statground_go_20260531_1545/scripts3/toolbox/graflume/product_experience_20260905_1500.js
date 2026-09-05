(function (global) {
  "use strict";

  var types = ["line", "bar", "area"];
  var maxValue = 1000000000;

  function validateRows(rows) {
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > 24) return null;
    var result = [];
    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      if (!row || typeof row.month !== "string") return null;
      var month = row.month.trim();
      var raw = row.sales;
      if (!month || Array.from(month).length > 32 || /[\u0000-\u001f\u007f]/.test(month)) return null;
      if (typeof raw !== "number" && typeof raw !== "string") return null;
      if (typeof raw === "string" && !raw.trim()) return null;
      var sales = Number(raw);
      if (!Number.isFinite(sales) || Math.abs(sales) > maxValue) return null;
      result.push({ month: month, sales: sales });
    }
    return result;
  }

  function validSelection(value, allowed, fallback) {
    return allowed.indexOf(value) >= 0 ? value : fallback;
  }

  function chartOptions(type, theme) {
    var options = {
      x: { field: "month", type: "ordinal" },
      y: { field: "sales", type: "quantitative" },
      theme: theme,
    };
    if (type === "line") options.mark = { point: true };
    return options;
  }

  function scriptJSON(value) {
    return JSON.stringify(value, null, 2).replace(/[<>&\u2028\u2029]/g, function (character) {
      return "\\u" + character.charCodeAt(0).toString(16).padStart(4, "0");
    });
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function standaloneHTML(config, rows, type, theme) {
    rows = validateRows(rows);
    if (!rows || types.indexOf(type) < 0) throw new Error("Invalid chart data");
    return [
      "<!doctype html>",
      '<html lang="' + escapeHTML(config.lang || "en") + '">',
      "<head>",
      '  <meta charset="utf-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1">',
      "  <title>" + escapeHTML(config.codeTitle || config.title || "Graflume") + "</title>",
      "</head>",
      "<body>",
      "  <h1>" + escapeHTML(config.title || "Graflume") + "</h1>",
      '  <div id="chart" style="width:100%;height:420px"></div>',
      '  <script src="' + escapeHTML(config.runtimeURL) + '" integrity="' + escapeHTML(config.runtimeSRI) + '" crossorigin="anonymous"></script>',
      "  <script>",
      "    const rows = " + scriptJSON(rows) + ";",
      "    Graflume." + type + "('#chart', rows, " + scriptJSON(chartOptions(type, theme)) + ");",
      "  </script>",
      "</body>",
      "</html>",
      "",
    ].join("\n");
  }

  function initFilters(scope) {
    var buttons = Array.from(scope.querySelectorAll("[data-graflume-purpose-filter]"));
    var cards = Array.from(scope.querySelectorAll("[data-graflume-purpose]"));
    var groups = Array.from(scope.querySelectorAll("[data-graflume-purpose-group]"));
    var count = scope.querySelector("[data-graflume-filter-count]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var purpose = button.getAttribute("data-graflume-purpose-filter");
        var visible = 0;
        cards.forEach(function (card) {
          var purposes = (card.getAttribute("data-graflume-purpose") || "").split(/\s+/);
          card.hidden = purpose !== "all" && purposes.indexOf(purpose) < 0;
          if (!card.hidden) visible += 1;
        });
        groups.forEach(function (group) {
          group.hidden = !Array.from(group.querySelectorAll("[data-graflume-purpose]")).some(function (card) { return !card.hidden; });
        });
        buttons.forEach(function (candidate) { candidate.setAttribute("aria-pressed", String(candidate === button)); });
        if (count) {
          var template = count.getAttribute("data-count-template") || "{count}";
          count.textContent = template.replace("{count}", String(visible));
        }
      });
    });
  }

  function initStarter(root) {
    var document = root.ownerDocument;
    var configElement = root.querySelector("[data-graflume-starter-config]");
    var chartElement = root.querySelector("[data-starter-chart]");
    var code = root.querySelector("[data-starter-code]");
    var typeInput = root.querySelector("[data-starter-type]");
    var themeInput = root.querySelector("[data-starter-theme]");
    var status = root.querySelector("[data-starter-status]");
    var copyButton = root.querySelector("[data-starter-copy]");
    var downloadButton = root.querySelector("[data-starter-download]");
    var retryButton = root.querySelector("[data-starter-retry]");
    var resetButton = root.querySelector("[data-starter-reset]");
    if (!configElement || !chartElement || !code || !typeInput || !themeInput) return;
    var config;
    try { config = JSON.parse(configElement.textContent); } catch (_) { return; }
    var initialRows = validateRows(config.rows);
    if (!initialRows) return;
    var labels = config.labels || {};
    var themes = Array.from(themeInput.options).map(function (option) { return option.value; });
    var rowsElements = Array.from(root.querySelectorAll("[data-starter-row]"));
    var chart = null;
    var currentType = "";
    var currentTheme = "";
    var source = "";
    var valid = false;
    var timer = null;
    var retries = 0;
    var retrying = false;
    var disposed = false;

    function announce(key) {
      if (status) {
        status.textContent = labels[key] || "";
        status.setAttribute("data-state", key === "invalid" || key === "failed" ? "error" : "ready");
      }
    }

    function setValid(value) {
      valid = value;
      if (copyButton) copyButton.disabled = !value;
      if (downloadButton) downloadButton.disabled = !value;
    }

    function readRows() {
      var inputRows = rowsElements.map(function (row) {
        var month = row.querySelector("[data-starter-month]");
        var value = row.querySelector("[data-starter-value]");
        var candidate = { month: month ? month.value : "", sales: value ? value.value : "" };
        var rowValid = validateRows([candidate]) !== null;
        if (month) month.setAttribute("aria-invalid", String(!validateRows([{ month: candidate.month, sales: 0 }])));
        if (value) value.setAttribute("aria-invalid", String(!validateRows([{ month: "Month", sales: candidate.sales }])));
        return rowValid ? candidate : null;
      });
      return validateRows(inputRows);
    }

    function selections() {
      return {
        type: validSelection(typeInput.value, types, "line"),
        theme: validSelection(themeInput.value, themes, themes[0] || "editorial"),
      };
    }

    function rememberTheme(theme) {
      try {
        var url = new URL(global.location.href);
        url.searchParams.set("theme", theme);
        global.history.replaceState(global.history.state, "", url.href);
      } catch (_) { /* The chart is usable without history access. */ }
      document.querySelectorAll('a[data-graflume-starter-link]').forEach(function (link) {
        try {
          var url = new URL(link.href, global.location.href);
          if (url.origin !== global.location.origin) return;
          url.searchParams.set("theme", theme);
          link.href = url.href;
        } catch (_) { /* Keep the server-rendered link. */ }
      });
    }

    function render(message) {
      if (disposed) return;
      var rows = readRows();
      if (!rows) { setValid(false); announce("invalid"); return; }
      var selection = selections();
      var engine = global.Graflume;
      if (!engine || typeof engine[selection.type] !== "function") {
        setValid(false);
        announce("failed");
        if (retryButton) { retryButton.hidden = false; retryButton.disabled = retrying || retries >= 2; }
        return;
      }
      var nextSource = standaloneHTML(config, rows, selection.type, selection.theme);
      var staging = null;
      var nextChart = null;
      try {
        if (chart && currentType === selection.type && currentTheme === selection.theme) {
          chart.setData(rows);
        } else {
          staging = document.createElement("div");
          staging.style.width = "100%";
          staging.style.height = "420px";
          chartElement.appendChild(staging);
          nextChart = engine[selection.type](staging, rows, chartOptions(selection.type, selection.theme));
          if (chart) chart.destroy();
          chartElement.replaceChildren(staging);
          chart = nextChart;
          currentType = selection.type;
          currentTheme = selection.theme;
        }
        source = nextSource;
        code.textContent = source;
        setValid(true);
        if (retryButton) retryButton.hidden = true;
        announce(message);
        rememberTheme(selection.theme);
      } catch (_) {
        if (nextChart && nextChart !== chart) nextChart.destroy();
        if (staging && nextChart !== chart) staging.remove();
        setValid(false);
        announce("failed");
      }
    }

    function update() {
      global.clearTimeout(timer);
      setValid(false);
      if (!readRows()) { announce("invalid"); return; }
      timer = global.setTimeout(function () { render("updated"); }, 180);
    }

    function selectCode() {
      var details = code.closest("details");
      if (details) details.open = true;
      code.setAttribute("tabindex", "-1");
      code.focus();
      var selection = global.getSelection();
      if (selection) {
        var range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      announce("copyFallback");
    }

    if (copyButton) copyButton.addEventListener("click", function () {
      if (!valid || !source) return;
      if (!global.navigator.clipboard || typeof global.navigator.clipboard.writeText !== "function") { selectCode(); return; }
      var copiedSource = source;
      global.navigator.clipboard.writeText(source).then(function () {
        if (!disposed && valid && source === copiedSource) announce("copied");
      }, function () { if (!disposed && valid) selectCode(); });
    });

    if (downloadButton) downloadButton.addEventListener("click", function () {
      if (!valid || !source) return;
      var url = global.URL.createObjectURL(new global.Blob([source], { type: "text/html;charset=utf-8" }));
      var link = document.createElement("a");
      link.href = url;
      link.download = "graflume-" + currentType + ".html";
      document.body.appendChild(link);
      link.click();
      link.remove();
      global.setTimeout(function () { global.URL.revokeObjectURL(url); }, 1000);
      announce("downloaded");
    });

    if (resetButton) resetButton.addEventListener("click", function () {
      global.clearTimeout(timer);
      rowsElements.forEach(function (row, index) {
        if (!initialRows[index]) return;
        row.querySelector("[data-starter-month]").value = initialRows[index].month;
        row.querySelector("[data-starter-value]").value = initialRows[index].sales;
      });
      render("ready");
    });

    if (retryButton) retryButton.addEventListener("click", function () {
      if (retrying || retries >= 2 || disposed) return;
      if (global.Graflume) { render("ready"); return; }
      var original = document.querySelector("script[data-graflume-starter-runtime]");
      if (!original) {
        original = Array.from(document.scripts).find(function (script) {
          return script.src === new URL(config.runtimeURL, global.location.href).href;
        });
      }
      if (!original) { announce("failed"); return; }
      var replacement = document.createElement("script");
      Array.from(original.attributes).forEach(function (attribute) {
        if (attribute.name !== "id") replacement.setAttribute(attribute.name, attribute.value);
      });
      if (original.nonce) replacement.nonce = original.nonce;
      replacement.src = original.src;
      retries += 1;
      retrying = true;
      retryButton.disabled = true;
      var timeout;
      var finished = false;
      function finish() {
        if (finished) return;
        finished = true;
        global.clearTimeout(timeout);
        retrying = false;
        replacement.onload = null;
        replacement.onerror = null;
        if (disposed) return;
        render("ready");
      }
      replacement.onload = finish;
      replacement.onerror = finish;
      timeout = global.setTimeout(finish, 15000);
      original.replaceWith(replacement);
    });

    root.addEventListener("input", function (event) {
      if (event.target.matches("[data-starter-month], [data-starter-value]")) update();
    });
    [typeInput, themeInput].forEach(function (input) {
      input.addEventListener("change", function () { global.clearTimeout(timer); render("updated"); });
    });
    typeInput.value = validSelection(config.type, types, "line");
    var initialTheme = validSelection(config.theme, themes, themes[0] || "editorial");
    try { initialTheme = validSelection(new URL(global.location.href).searchParams.get("theme"), themes, initialTheme); } catch (_) { /* Use the server default. */ }
    themeInput.value = initialTheme;
    setValid(false);
    render("ready");
    global.addEventListener("pagehide", function (event) {
      if (event.persisted) return;
      disposed = true;
      global.clearTimeout(timer);
      if (chart) chart.destroy();
    });
  }

  if (typeof module === "object" && module.exports && !global.document) {
    module.exports = { validateRows: validateRows, validSelection: validSelection, buildOptions: chartOptions, generateHTML: standaloneHTML, initFilters: initFilters, initStarter: initStarter };
    return;
  }
  if (!global.document) return;
  function initialize() {
    global.document.querySelectorAll("[data-graflume-filter-scope]").forEach(initFilters);
    global.document.querySelectorAll("[data-graflume-starter]").forEach(initStarter);
  }
  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})(typeof window === "undefined" ? globalThis : window);
