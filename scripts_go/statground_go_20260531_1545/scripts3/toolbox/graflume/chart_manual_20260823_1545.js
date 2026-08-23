(function () {
  "use strict";

  var root = document.querySelector("[data-graflume-chart-manual]");
  if (!root || root.dataset.graflumeChartManualBound === "true") return;
  root.dataset.graflumeChartManualBound = "true";

  var mount = document.getElementById("graflume-chart-manual-example");
  var status = document.getElementById("graflume-chart-manual-status");
  var dataNode = document.getElementById("graflume-chart-manual-data");
  var fieldsNode = document.getElementById("graflume-chart-manual-fields");
  var optionsNode = document.getElementById("graflume-chart-manual-options");
  var capabilitiesNode = document.getElementById("graflume-chart-manual-capabilities");
  var dataPanel = document.querySelector("[data-graflume-data-panel]");
  var tableToggle = document.querySelector("[data-graflume-table-toggle]");
  var tableToggleLabel = document.querySelector("[data-graflume-table-toggle-label]");
  var downloadButtons = document.querySelectorAll("[data-graflume-download]");
  var help = document.querySelector(".sg-graflume-manual-help");
  var chart = null;
  var rows = null;
  var fields = null;
  var capabilities = null;
  var resizeObserver = null;
  var resizeFrame = 0;
  var destroyed = false;
  var unsubscribePlayback = null;

  function copy(key, fallback, maximumLength) {
    var value = root.dataset ? root.dataset[key] : "";
    var resolved = typeof value === "string" && value.trim() ? value.trim() : fallback;
    return resolved.slice(0, maximumLength || 240);
  }

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function showError(message) {
    if (!mount) return;
    var fallback = document.createElement("p");
    fallback.className = "sg-graflume-chart-fallback";
    fallback.dataset.state = "error";
    fallback.setAttribute("role", "alert");
    fallback.textContent = message;
    mount.replaceChildren(fallback);
  }

  function readJSON(node, label) {
    if (!node) throw new Error(label + " payload is missing.");
    var value = JSON.parse(node.textContent || "null");
    if (value === null || typeof value !== "object") {
      throw new Error(label + " payload is invalid.");
    }
    return value;
  }

  function safeDownloadBase() {
    var value = copy("graflumeDownloadBase", "graflume-chart-data", 100);
    return /^graflume-[a-z0-9-]+-data$/.test(value) ? value : "graflume-chart-data";
  }

  function csvValue(value) {
    if (value === null || typeof value === "undefined") return "";
    var text = typeof value === "object" ? JSON.stringify(value) : String(value);
    if (/[",\r\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function csvText() {
    var records = [fields.map(csvValue).join(",")];
    rows.forEach(function (row) {
      records.push(fields.map(function (field) { return csvValue(row[field]); }).join(","));
    });
    return records.join("\r\n") + "\r\n";
  }

  function downloadBlob(body, type, extension) {
    var url = URL.createObjectURL(new Blob([body], { type: type }));
    var anchor = document.createElement("a");
    anchor.hidden = true;
    anchor.href = url;
    anchor.download = safeDownloadBase() + "." + extension;
    document.body.appendChild(anchor);
    try {
      anchor.click();
    } finally {
      anchor.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    }
  }

  function downloadData(format) {
    if (format === "csv") {
      downloadBlob(csvText(), "text/csv;charset=utf-8", "csv");
      return;
    }
    if (format === "json") {
      downloadBlob(JSON.stringify(rows, null, 2) + "\n", "application/json;charset=utf-8", "json");
    }
  }

  function setTableVisible(visible) {
    if (!dataPanel || !tableToggle) return;
    var actionLabel = visible
      ? tableToggle.dataset.hideLabel
      : tableToggle.dataset.showLabel;
    dataPanel.hidden = !visible;
    tableToggle.setAttribute("aria-expanded", visible ? "true" : "false");
    tableToggle.setAttribute("aria-label", actionLabel);
    tableToggle.title = actionLabel;
    if (tableToggleLabel) tableToggleLabel.textContent = actionLabel;
  }

  function initializeHostControls() {
    if (tableToggle && dataPanel) {
      tableToggle.hidden = false;
      setTableVisible(!dataPanel.hidden);
      tableToggle.addEventListener("click", function () {
        setTableVisible(dataPanel.hidden);
      });
    }
    downloadButtons.forEach(function (button) {
      button.hidden = false;
      button.addEventListener("click", function () {
        downloadData(button.dataset.graflumeDownload || "");
      });
    });
    if (help) {
      help.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && help.open) {
          help.open = false;
          var summary = help.querySelector("summary");
          if (summary) summary.focus();
        }
      });
    }
  }

  function playbackValue(state) {
    if (!state || typeof state !== "object") return undefined;
    return state.frame;
  }

  function markPlaybackRows(state) {
    var playback = capabilities && capabilities.core && capabilities.core.playback;
    if (!playback) return;
    var value = playbackValue(state);
    document.querySelectorAll("[data-graflume-row-index]").forEach(function (rowNode) {
      var index = Number(rowNode.dataset.graflumeRowIndex);
      var row = rows[index];
      var current = row && typeof value !== "undefined" && String(row[playback.field]) === String(value);
      if (current) rowNode.dataset.playbackCurrent = "true";
      else delete rowNode.dataset.playbackCurrent;
    });
  }

  function destroyChart() {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = 0;
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (typeof unsubscribePlayback === "function") unsubscribePlayback();
    unsubscribePlayback = null;
    if (chart && typeof chart.destroy === "function") chart.destroy();
    chart = null;
    destroyed = true;
  }

  function scheduleResize() {
    if (!chart || typeof chart.resize !== "function" || resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(function () {
      resizeFrame = 0;
      if (chart && typeof chart.resize === "function") chart.resize();
    });
  }

  function requireCoreMethods(instance, playbackEnabled) {
    ["getViewState", "zoomBy", "panBy", "resetView", "toggleFullscreen", "toDataURL"].forEach(function (name) {
      if (typeof instance[name] !== "function") {
        throw new Error("The pinned Graflume runtime is missing Chart." + name + "().");
      }
    });
    if (!playbackEnabled) return;
    ["getPlaybackState", "play", "pause", "step", "seek", "setPlaybackRate", "setPlaybackLoop"].forEach(function (name) {
      if (typeof instance[name] !== "function") {
        throw new Error("The pinned Graflume runtime is missing Chart." + name + "().");
      }
    });
  }

  function render() {
    if (!mount) return;
    var functionName = copy("graflumeChartApi", "", 80);
    var runtime = window.Graflume;
    if (!functionName || !runtime || typeof runtime[functionName] !== "function") {
      throw new Error("Graflume Quick API is unavailable: " + functionName);
    }

    var options = readJSON(optionsNode, "Options");
    if (typeof options.width === "undefined") options.width = "container";
    if (typeof options.height === "undefined") options.height = 420;

    mount.replaceChildren();
    chart = runtime[functionName]("#graflume-chart-manual-example", rows, options);
    if (!chart || typeof chart.destroy !== "function") {
      throw new Error("Graflume did not return a chart instance.");
    }
    var playbackEnabled = Boolean(capabilities.core && capabilities.core.playback);
    requireCoreMethods(chart, playbackEnabled);
    if (playbackEnabled && typeof chart.on === "function") {
      unsubscribePlayback = chart.on("playbackchange", function (event) {
        markPlaybackRows(event && event.state ? event.state : event);
      });
      markPlaybackRows(chart.getPlaybackState());
    }

    root.dataset.graflumeChartManualState = "ready";
    setStatus(copy("graflumeReady", "Ready", 120), "ready");
    if (typeof window.ResizeObserver === "function") {
      resizeObserver = new window.ResizeObserver(scheduleResize);
      resizeObserver.observe(mount);
    }
  }

  try {
    rows = readJSON(dataNode, "Data");
    fields = readJSON(fieldsNode, "Fields");
    capabilities = readJSON(capabilitiesNode, "Capabilities");
    if (!Array.isArray(rows)) throw new Error("Data payload must be an array.");
    if (!Array.isArray(fields) || fields.some(function (field) { return typeof field !== "string"; })) {
      throw new Error("Fields payload must be an array of names.");
    }
    if (capabilities.schema !== "statground.graflume.manual-capabilities.v1") {
      throw new Error("Capabilities payload has an unsupported schema.");
    }
    initializeHostControls();
    render();
  } catch (error) {
    destroyChart();
    root.dataset.graflumeChartManualState = "error";
    var message = copy("graflumeError", "The chart could not be rendered.", 240);
    setStatus(message, "error");
    showError(message);
    if (window.console && typeof window.console.error === "function") {
      window.console.error("Graflume chart manual failed.", error);
    }
  }

  window.addEventListener("pagehide", function (event) {
    if (!event.persisted) destroyChart();
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted && !destroyed) scheduleResize();
  });
}());
