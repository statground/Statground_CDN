(function () {
  "use strict";

  var root = document.querySelector("[data-graflume-chart-manual]");
  if (!root || root.dataset.graflumeChartManualBound === "true") return;
  root.dataset.graflumeChartManualBound = "true";

  var mount = document.getElementById("graflume-chart-manual-example");
  var status = document.getElementById("graflume-chart-manual-status");
  var dataNode = document.getElementById("graflume-chart-manual-data");
  var optionsNode = document.getElementById("graflume-chart-manual-options");
  var chart = null;
  var resizeObserver = null;
  var resizeFrame = 0;
  var destroyed = false;

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

  function destroyChart() {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = 0;
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
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

  function render() {
    if (!mount) return;
    var functionName = copy("graflumeChartApi", "", 80);
    var runtime = window.Graflume;
    if (!functionName || !runtime || typeof runtime[functionName] !== "function") {
      throw new Error("Graflume Quick API is unavailable: " + functionName);
    }

    var rows = readJSON(dataNode, "Data");
    var options = readJSON(optionsNode, "Options");
    if (!Array.isArray(rows)) throw new Error("Data payload must be an array.");
    if (typeof options.width === "undefined") options.width = "container";
    if (typeof options.height === "undefined") options.height = 420;

    mount.replaceChildren();
    chart = runtime[functionName]("#graflume-chart-manual-example", rows, options);
    if (!chart || typeof chart.destroy !== "function") {
      throw new Error("Graflume did not return a chart instance.");
    }

    root.dataset.graflumeChartManualState = "ready";
    setStatus(copy("graflumeReady", "Ready", 120), "ready");
    if (typeof window.ResizeObserver === "function") {
      resizeObserver = new window.ResizeObserver(scheduleResize);
      resizeObserver.observe(mount);
    }
  }

  try {
    render();
  } catch (error) {
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
