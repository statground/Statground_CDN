(function () {
  "use strict";

  var root = document.querySelector("main[data-graflume-demo-root]");
  if (!root || root.dataset.graflumeDemoBound === "true") return;
  root.dataset.graflumeDemoBound = "true";

  var elements = {
    chart: document.getElementById("graflume-demo-chart"),
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
  var chartEventCleanups = [];
  var resizeFrame = 0;
  var destroyed = false;
  var refreshCycle = 0;
  var currentRows = [];
  var kinds = { combo: true, bar: true, line: true, scatter: true };

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

  function setControlsDisabled(disabled) {
    [elements.kind, elements.theme, elements.refresh, elements.exportPNG].forEach(function (element) {
      if (element) element.disabled = disabled;
    });
  }

  function reportFailure(message, error) {
    root.dataset.graflumeDemoState = "error";
    setStatus(message, "error");
    setControlsDisabled(true);
    if (window.console && typeof window.console.error === "function" && error) {
      window.console.error("Graflume demo failed.", error);
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
  var refreshPatterns = [
    [0, 0, 0, 0, 0],
    [0.04, -0.02, 0.06, -0.03, 0.02],
    [-0.03, 0.05, -0.01, 0.04, -0.02],
    [0.02, 0.03, -0.04, 0.01, 0.05],
  ];

  function roundToTwo(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function rowsForCycle(cycle) {
    var pattern = refreshPatterns[cycle % refreshPatterns.length];
    return baseRows.map(function (row, index) {
      var ratio = pattern[index % pattern.length];
      return {
        period: row.period,
        periodIndex: row.periodIndex,
        target: row.target,
        actual: roundToTwo(Math.max(0, row.actual * (1 + ratio))),
      };
    });
  }

  function selectedKind() {
    var value = elements.kind ? String(elements.kind.value || "").toLowerCase() : "combo";
    return kinds[value] ? value : "combo";
  }

  function titleFor(kind) {
    var titles = {
      combo: copy("titleCombo", "Target and actual", 120),
      bar: copy("titleBar", "Actual values", 120),
      line: copy("titleLine", "Actual trend", 120),
      scatter: copy("titleScatter", "Target and actual relationship", 120),
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

  function buildSpec(kind) {
    var spec = {
      specVersion: "0.1",
      data: currentRows,
      width: "container",
      height: 400,
      title: {
        text: titleFor(kind),
        subtitle: copy("subtitle", "Interactive Graflume ChartSpec demo", 160),
      },
      locale: locale,
      theme: currentTheme,
      performance: "auto",
      interaction: { hover: true, click: true },
      accessibility: {
        label: titleFor(kind),
        description: copy(
          "ariaDescription",
          "An interactive chart comparing target and actual values by period.",
          300,
        ),
      },
    };

    if (kind === "combo") {
      spec.layers = [
        {
          id: "target",
          mark: { type: "bar", fill: "#2563eb", opacity: 0.35, cornerRadius: 7 },
          x: periodEncoding(),
          y: targetEncoding(),
        },
        {
          id: "actual",
          mark: { type: "line", stroke: "#dc2626", lineWidth: 3, point: true },
          x: periodEncoding(),
          y: actualEncoding(),
        },
      ];
      return spec;
    }

    if (kind === "scatter") {
      spec.mark = {
        type: "point",
        fill: "#2563eb",
        stroke: "#ffffff",
        lineWidth: 2,
        radius: 7,
      };
      spec.x = targetEncoding();
      spec.y = actualEncoding();
      return spec;
    }

    spec.mark =
      kind === "line"
        ? { type: "line", stroke: "#2563eb", lineWidth: 3, point: true }
        : { type: "bar", fill: "#2563eb", opacity: 0.9, cornerRadius: 7 };
    spec.x = periodEncoding();
    spec.y = actualEncoding();
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
    elements.selected.textContent =
      String(row.period || "") +
      " · " +
      copy("labelTarget", "Target", 60) +
      " " +
      formatNumber(row.target) +
      " · " +
      copy("labelActual", "Actual", 60) +
      " " +
      formatNumber(row.actual);
  }

  function syncThemeButton() {
    var dark = currentTheme === "graflume-dark";
    elements.theme.setAttribute("aria-pressed", dark ? "true" : "false");
    elements.theme.textContent = dark
      ? copy("themeLightLabel", "Use light chart theme", 100)
      : copy("themeDarkLabel", "Use dark chart theme", 100);
  }

  function applySpec() {
    var spec = buildSpec(selectedKind());
    chart.setSpec(spec);
    updateSpecText(spec);
    showDatum(null);
  }

  function handleKindChange() {
    if (destroyed || !chart) return;
    if (!kinds[String(elements.kind.value || "").toLowerCase()]) elements.kind.value = "combo";
    try {
      applySpec();
      setStatus(copy("statusReady", "The interactive chart is ready.", 180), "ready");
    } catch (error) {
      reportFailure(copy("errorRender", "The chart could not be updated.", 180), error);
    }
  }

  function handleThemeClick() {
    if (destroyed || !chart) return;
    currentTheme = currentTheme === "graflume-dark" ? "graflume-light" : "graflume-dark";
    try {
      applySpec();
      syncThemeButton();
      setStatus(copy("statusReady", "The interactive chart is ready.", 180), "ready");
    } catch (error) {
      reportFailure(copy("errorRender", "The chart could not be updated.", 180), error);
    }
  }

  function handleRefreshClick() {
    if (destroyed || !chart) return;
    refreshCycle = (refreshCycle + 1) % refreshPatterns.length;
    currentRows = rowsForCycle(refreshCycle);
    try {
      chart.setData(currentRows);
      updateTable();
      updateSpecText(chart.getSpec());
      showDatum(null);
      setStatus(copy("statusRefreshed", "The deterministic sample data was refreshed.", 180), "ready");
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

  function cleanup() {
    if (destroyed) return;
    destroyed = true;
    window.removeEventListener("resize", handleResize);
    elements.kind.removeEventListener("change", handleKindChange);
    elements.theme.removeEventListener("click", handleThemeClick);
    elements.refresh.removeEventListener("click", handleRefreshClick);
    elements.exportPNG.removeEventListener("click", handleExportClick);
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
  }

  var required = [
    elements.chart,
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

  currentRows = rowsForCycle(0);
  if (!kinds[String(elements.kind.value || "").toLowerCase()]) elements.kind.value = "combo";

  try {
    elements.chart.replaceChildren();
    var initialSpec = buildSpec(selectedKind());
    chart = window.Graflume.create(elements.chart, initialSpec);
    chartEventCleanups.push(
      chart.on("hover", function (event) {
        showDatum(event.hit ? event.hit.datum : null);
      }),
    );
    chartEventCleanups.push(
      chart.on("click", function (event) {
        showDatum(event.hit ? event.hit.datum : null);
      }),
    );
    chartEventCleanups.push(
      chart.on("error", function () {
        reportFailure(copy("errorRender", "The chart could not be updated.", 180));
      }),
    );
    updateSpecText(initialSpec);
    updateTable();
    showDatum(null);
    syncThemeButton();
    elements.kind.addEventListener("change", handleKindChange);
    elements.theme.addEventListener("click", handleThemeClick);
    elements.refresh.addEventListener("click", handleRefreshClick);
    elements.exportPNG.addEventListener("click", handleExportClick);
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pagehide", cleanup, { once: true });
    root.dataset.graflumeDemoState = "ready";
    setControlsDisabled(false);
    setStatus(copy("statusReady", "The interactive chart is ready.", 180), "ready");
  } catch (error) {
    reportFailure(copy("errorRender", "The chart could not be drawn.", 180), error);
  }
})();
