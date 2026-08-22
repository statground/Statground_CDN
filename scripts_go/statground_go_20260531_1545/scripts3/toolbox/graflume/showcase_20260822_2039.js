(function () {
  "use strict";

  var root = document.querySelector("main[data-graflume-demo-root]");
  if (!root || root.dataset.graflumeDemoBound === "true") return;
  root.dataset.graflumeDemoBound = "true";

  var elements = {
    hero: document.getElementById("graflume-hero-chart"),
    chart: document.getElementById("graflume-demo-chart"),
    galleryCombo: document.getElementById("graflume-gallery-combo"),
    galleryArea: document.getElementById("graflume-gallery-area"),
    galleryDonut: document.getElementById("graflume-gallery-donut"),
    status: document.getElementById("graflume-demo-status"),
    selected: document.getElementById("graflume-demo-selected"),
    spec: document.getElementById("graflume-demo-spec"),
    tableBody: document.getElementById("graflume-demo-table-body"),
    kind: document.getElementById("graflume-demo-kind"),
    theme: document.getElementById("graflume-demo-theme"),
    refresh: document.getElementById("graflume-demo-refresh"),
    exportPNG: document.getElementById("graflume-demo-export"),
  };

  var chart = null;
  var showcaseCharts = [];
  var chartEventCleanups = [];
  var resizeFrame = 0;
  var destroyed = false;
  var currentRows = [];
  var currentKind = "combo";
  var kinds = { combo: true, bar: true, line: true, area: true, scatter: true, donut: true };

  function copy(key, fallback, maximumLength) {
    var value = root.dataset ? root.dataset[key] : "";
    var resolved = typeof value === "string" && value.trim() ? value.trim() : fallback;
    return resolved.slice(0, maximumLength || 240);
  }

  function setStatus(message, state) {
    if (!elements.status) return;
    elements.status.textContent = message;
    elements.status.dataset.state = state || "ready";
  }

  function controls() {
    return Array.prototype.slice.call(root.querySelectorAll("[data-graflume-kind], #graflume-demo-theme, #graflume-demo-refresh, #graflume-demo-export"));
  }

  function setControlsDisabled(disabled) {
    controls().forEach(function (element) {
      element.disabled = disabled;
    });
  }

  function showChartFallbacks(message) {
    [elements.hero, elements.chart, elements.galleryCombo, elements.galleryArea, elements.galleryDonut]
      .forEach(function (target) {
        if (!target) return;
        var fallback = document.createElement("p");
        fallback.className = "sg-graflume-chart-fallback";
        fallback.dataset.state = "error";
        fallback.textContent = message;
        target.replaceChildren(fallback);
      });
  }

  function reportFailure(message, error) {
    if (!destroyed) cleanup();
    root.dataset.graflumeDemoState = "error";
    setStatus(message, "error");
    setControlsDisabled(true);
    showChartFallbacks(message);
    if (window.console && typeof window.console.error === "function" && error) {
      window.console.error("Graflume showcase failed.", error);
    }
  }

  function resolveLocale(value) {
    var candidate = String(value || "").trim() || "en-US";
    try {
      new Intl.NumberFormat(candidate).format(1);
      return candidate;
    } catch (_error) {
      return "en-US";
    }
  }

  var locale = resolveLocale(copy("locale", "en-US", 35));
  var numberFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  var initialTheme = copy("initialTheme", "light", 10).toLowerCase();
  var currentTheme = initialTheme === "dark" ? "graflume-dark" : "graflume-light";

  function formatNumber(value) {
    return numberFormat.format(Number(value));
  }

  function readRows() {
    var rows = [];
    var nodes = root.querySelectorAll("[data-graflume-row]");
    Array.prototype.forEach.call(nodes, function (node, index) {
      var label = String(node.dataset.label || "").trim().slice(0, 80);
      var target = Number(node.dataset.target);
      var actual = Number(node.dataset.actual);
      if (!label || !Number.isFinite(target) || !Number.isFinite(actual)) return;
      rows.push({ period: label, periodIndex: index + 1, target: target, actual: actual });
    });
    return rows;
  }

  var baseRows = readRows();
  function titleFor(kind) {
    var titles = {
      combo: copy("titleCombo", "Target and actual", 120),
      bar: copy("titleBar", "Actual values", 120),
      line: copy("titleLine", "Actual trend", 120),
      area: copy("titleArea", "Actual area", 120),
      scatter: copy("titleScatter", "Target and actual relationship", 120),
      donut: copy("titleDonut", "Actual share", 120),
    };
    return titles[kind] || titles.combo;
  }

  function periodEncoding() {
    return {
      field: "period",
      type: "ordinal",
      title: copy("axisPeriod", "Period", 80),
      axis: { grid: false },
    };
  }

  function targetEncoding() {
    return {
      field: "target",
      type: "quantitative",
      title: copy("axisTarget", "Target", 80),
      scale: { zero: true, nice: true },
    };
  }

  function actualEncoding() {
    return {
      field: "actual",
      type: "quantitative",
      title: copy("axisActual", "Actual", 80),
      scale: { zero: true, nice: true },
    };
  }

  function commonSpec(height, title, description) {
    var spec = {
      specVersion: "0.1",
      width: "container",
      height: height,
      locale: locale,
      theme: currentTheme,
      performance: "auto",
      interaction: { hover: true, click: true },
      accessibility: {
        label: title || copy("titleCombo", "Graflume chart", 120),
        description: description || copy("ariaDescription", "An interactive Graflume chart.", 300),
      },
    };
    if (title) spec.title = { text: title };
    return spec;
  }

  function buildSpec(kind) {
    var spec = commonSpec(430, titleFor(kind), copy("subtitle", "Interactive Graflume ChartSpec demo", 180));
    spec.data = currentRows;
    spec.title.subtitle = copy("subtitle", "Interactive Graflume ChartSpec demo", 180);

    if (kind === "combo") {
      spec.layers = [
        {
          id: "target",
          mark: { type: "bar", fill: "#2563eb", opacity: 0.3, cornerRadius: 7 },
          x: periodEncoding(),
          y: targetEncoding(),
        },
        {
          id: "actual",
          mark: { type: "line", stroke: "#4f46e5", lineWidth: 3, point: true },
          x: periodEncoding(),
          y: actualEncoding(),
        },
      ];
      return spec;
    }

    if (kind === "scatter") {
      spec.mark = { type: "point", fill: "#2563eb", stroke: "#ffffff", lineWidth: 2, radius: 7 };
      spec.x = targetEncoding();
      spec.y = actualEncoding();
      return spec;
    }

    if (kind === "donut") {
      spec.mark = { type: "pie", options: { innerRadius: 0.56 } };
      spec.x = periodEncoding();
      spec.y = actualEncoding();
      spec.axes = { x: false, y: false };
      return spec;
    }

    if (kind === "area") {
      spec.mark = { type: "area", fill: "#dbeafe", stroke: "#2563eb", lineWidth: 2.5, opacity: 0.9 };
      spec.x = periodEncoding();
      spec.y = actualEncoding();
      return spec;
    }

    spec.mark = kind === "line"
      ? { type: "line", stroke: "#2563eb", lineWidth: 3, point: true }
      : { type: "bar", fill: "#2563eb", opacity: 0.9, cornerRadius: 7 };
    spec.x = periodEncoding();
    spec.y = actualEncoding();
    return spec;
  }

  function heroSpec() {
    var spec = commonSpec(300, titleFor("combo"), copy("ariaDescription", "Target and actual values by quarter.", 300));
    spec.data = currentRows;
    spec.layers = [
      {
        id: "target",
        mark: { type: "bar", fill: "#60a5fa", opacity: 0.24, cornerRadius: 6 },
        x: periodEncoding(),
        y: targetEncoding(),
      },
      {
        id: "actual",
        mark: { type: "line", stroke: "#4f46e5", lineWidth: 3, point: true },
        x: periodEncoding(),
        y: actualEncoding(),
      },
    ];
    return spec;
  }

  function galleryComboSpec() {
    var spec = commonSpec(250, "", copy("ariaDescription", "A compact combination chart rendered by Graflume.", 300));
    spec.data = currentRows;
    spec.layers = [
      { id: "target", mark: { type: "bar", fill: "#dbeafe", cornerRadius: 5 }, x: periodEncoding(), y: targetEncoding() },
      { id: "actual", mark: { type: "line", stroke: "#4f46e5", lineWidth: 2.5, point: true }, x: periodEncoding(), y: actualEncoding() },
    ];
    return spec;
  }

  function galleryAreaSpec() {
    var spec = commonSpec(250, "", copy("ariaDescription", "A compact area chart rendered by Graflume.", 300));
    spec.data = currentRows;
    spec.mark = { type: "area", fill: "#dbeafe", stroke: "#2563eb", lineWidth: 2.5, opacity: 0.95 };
    spec.x = periodEncoding();
    spec.y = actualEncoding();
    return spec;
  }

  function galleryDonutSpec() {
    var spec = commonSpec(250, "", copy("ariaDescription", "A compact donut chart rendered by Graflume.", 300));
    spec.data = currentRows;
    spec.mark = { type: "pie", options: { innerRadius: 0.58 } };
    spec.x = periodEncoding();
    spec.y = actualEncoding();
    spec.axes = { x: false, y: false };
    return spec;
  }

  function updateSpecText(spec) {
    elements.spec.textContent = JSON.stringify(spec, null, 2);
  }

  function updateTable() {
    var fragment = document.createDocumentFragment();
    currentRows.forEach(function (row) {
      var tr = document.createElement("tr");
      var period = document.createElement("th");
      var target = document.createElement("td");
      var actual = document.createElement("td");
      period.scope = "row";
      period.textContent = row.period;
      target.textContent = formatNumber(row.target);
      actual.textContent = formatNumber(row.actual);
      [period, target, actual].forEach(function (cell) {
        cell.className = "px-4 py-3";
      });
      tr.appendChild(period);
      tr.appendChild(target);
      tr.appendChild(actual);
      fragment.appendChild(tr);
    });
    elements.tableBody.replaceChildren(fragment);
  }

  function showDatum(row) {
    if (!row) {
      elements.selected.textContent = copy("selectedEmpty", "Point to or select a value.", 180);
      return;
    }
    elements.selected.textContent = String(row.period || "") + " · " +
      copy("labelTarget", "Target", 60) + " " + formatNumber(row.target) + " · " +
      copy("labelActual", "Actual", 60) + " " + formatNumber(row.actual);
  }

  function syncKindButtons() {
    root.querySelectorAll("[data-graflume-kind]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.graflumeKind === currentKind ? "true" : "false");
    });
  }

  function syncThemeButton() {
    var dark = currentTheme === "graflume-dark";
    elements.theme.setAttribute("aria-pressed", dark ? "true" : "false");
    elements.theme.dataset.chartTheme = dark ? "dark" : "light";
  }

  function applySpec() {
    var spec = buildSpec(currentKind);
    chart.setSpec(spec);
    updateSpecText(spec);
    showDatum(null);
  }

  function handleKindClick(event) {
    var button = event.target.closest("[data-graflume-kind]");
    if (!button || !elements.kind.contains(button) || destroyed || !chart) return;
    var nextKind = String(button.dataset.graflumeKind || "").toLowerCase();
    if (!kinds[nextKind]) return;
    currentKind = nextKind;
    syncKindButtons();
    setStatus(copy("statusReady", "The interactive chart is ready.", 180), "ready");
  }

  function updateShowcaseThemes() {
    showcaseCharts.forEach(function (entry) {
      entry.chart.setSpec(entry.spec());
    });
  }

  function handleThemeClick() {
    if (destroyed || !chart) return;
    currentTheme = currentTheme === "graflume-dark" ? "graflume-light" : "graflume-dark";
    syncThemeButton();
    setStatus(copy("statusReady", "The interactive chart is ready.", 180), "ready");
  }

  function handleRefreshClick() {
    if (destroyed || !chart) return;
    try {
      applySpec();
      updateShowcaseThemes();
      updateTable();
      setStatus(copy("statusRefreshed", "The selected specification was rendered.", 180), "ready");
    } catch (error) {
      reportFailure(copy("errorRender", "The chart could not be updated.", 180), error);
    }
  }

  function exportFilename() {
    var value = copy("exportFilename", "graflume-demo.png", 120)
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!value) value = "graflume-demo.png";
    return /\.png$/i.test(value) ? value : value + ".png";
  }

  function handleExportClick() {
    if (destroyed || !chart) return;
    try {
      var url = chart.toDataURL("image/png");
      if (typeof url !== "string" || url.indexOf("data:image/png") !== 0) throw new Error("PNG export unavailable");
      var link = document.createElement("a");
      link.href = url;
      link.download = exportFilename();
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatus(copy("statusExported", "The PNG download was prepared.", 180), "ready");
    } catch (error) {
      setStatus(copy("errorExport", "The PNG image could not be exported.", 180), "error");
      if (window.console && typeof window.console.error === "function") {
        window.console.error("Graflume PNG export failed.", error);
      }
    }
  }

  function runResize() {
    resizeFrame = 0;
    if (destroyed || !chart) return;
    try {
      chart.resize();
      showcaseCharts.forEach(function (entry) {
        entry.chart.resize();
      });
    } catch (error) {
      reportFailure(copy("errorRender", "The chart could not be resized.", 180), error);
    }
  }

  function handleResize() {
    if (destroyed || !chart || resizeFrame) return;
    if (typeof window.requestAnimationFrame === "function") {
      resizeFrame = window.requestAnimationFrame(runResize);
    } else {
      resizeFrame = window.setTimeout(runResize, 16);
    }
  }

  function handlePageHide(event) {
    if (event && event.persisted) return;
    cleanup();
  }

  function handlePageShow(event) {
    if (event && event.persisted) handleResize();
  }

  function cleanup() {
    if (destroyed) return;
    destroyed = true;
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("pageshow", handlePageShow);
    if (elements.kind) elements.kind.removeEventListener("click", handleKindClick);
    if (elements.theme) elements.theme.removeEventListener("click", handleThemeClick);
    if (elements.refresh) elements.refresh.removeEventListener("click", handleRefreshClick);
    if (elements.exportPNG) elements.exportPNG.removeEventListener("click", handleExportClick);
    if (resizeFrame) {
      if (typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(resizeFrame);
      resizeFrame = 0;
    }
    chartEventCleanups.forEach(function (unsubscribe) {
      if (typeof unsubscribe === "function") unsubscribe();
    });
    chartEventCleanups = [];
    if (chart) chart.destroy();
    chart = null;
    showcaseCharts.forEach(function (entry) {
      entry.chart.destroy();
    });
    showcaseCharts = [];
  }

  function createShowcaseChart(target, specBuilder) {
    target.replaceChildren();
    var instance = window.Graflume.create(target, specBuilder());
    showcaseCharts.push({ chart: instance, spec: specBuilder });
  }

  var required = [
    elements.hero,
    elements.chart,
    elements.galleryCombo,
    elements.galleryArea,
    elements.galleryDonut,
    elements.status,
    elements.selected,
    elements.spec,
    elements.tableBody,
    elements.kind,
    elements.theme,
    elements.refresh,
    elements.exportPNG,
  ];
  if (required.some(function (element) { return !element; })) {
    reportFailure(copy("errorElements", "The interactive demo is temporarily unavailable.", 180));
    return;
  }
  if (!window.Graflume || typeof window.Graflume.create !== "function") {
    reportFailure(copy("errorRuntime", "The chart library could not be loaded.", 180));
    return;
  }
  if (baseRows.length < 2) {
    reportFailure(copy("errorData", "There is not enough sample data to draw the chart.", 180));
    return;
  }

  currentRows = baseRows.map(function (row) {
    return { period: row.period, periodIndex: row.periodIndex, target: row.target, actual: row.actual };
  });
  try {
    elements.chart.replaceChildren();
    var initialSpec = buildSpec(currentKind);
    chart = window.Graflume.create(elements.chart, initialSpec);
    createShowcaseChart(elements.hero, heroSpec);
    createShowcaseChart(elements.galleryCombo, galleryComboSpec);
    createShowcaseChart(elements.galleryArea, galleryAreaSpec);
    createShowcaseChart(elements.galleryDonut, galleryDonutSpec);
    chartEventCleanups.push(chart.on("hover", function (event) {
      showDatum(event.hit ? event.hit.datum : null);
    }));
    chartEventCleanups.push(chart.on("click", function (event) {
      showDatum(event.hit ? event.hit.datum : null);
    }));
    chartEventCleanups.push(chart.on("error", function () {
      reportFailure(copy("errorRender", "The chart could not be updated.", 180));
    }));
    updateSpecText(initialSpec);
    updateTable();
    showDatum(null);
    syncKindButtons();
    syncThemeButton();
    elements.kind.addEventListener("click", handleKindClick);
    elements.theme.addEventListener("click", handleThemeClick);
    elements.refresh.addEventListener("click", handleRefreshClick);
    elements.exportPNG.addEventListener("click", handleExportClick);
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    root.dataset.graflumeDemoState = "ready";
    setControlsDisabled(false);
    setStatus(copy("statusReady", "The interactive chart is ready.", 180), "ready");
  } catch (error) {
    cleanup();
    reportFailure(copy("errorRender", "The chart could not be drawn.", 180), error);
  }
})();
