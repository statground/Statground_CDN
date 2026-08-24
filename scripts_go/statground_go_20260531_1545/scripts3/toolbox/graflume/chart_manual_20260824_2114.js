(function () {
  "use strict";

  var root = document.querySelector("[data-graflume-chart-manual]");
  if (!root || root.dataset.graflumeChartManualBound === "true") return;
  root.dataset.graflumeChartManualBound = "true";

  var panels = Array.prototype.slice.call(
    root.querySelectorAll("[data-graflume-chart-example]"),
  );
  var tabs = Array.prototype.slice.call(
    root.querySelectorAll("[data-graflume-example-tab]"),
  );
  var states = new Map();
  var activePanel = null;
  var permanentlyDestroyed = false;
  var supportedThemes = ["graflume-light", "graflume-dark", "ggplot"];
  var themeEvent = "graflume:themechange";

  function normalizeTheme(value) {
    var candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
    return supportedThemes.indexOf(candidate) >= 0 ? candidate : "";
  }

  var currentTheme =
    normalizeTheme(root.getAttribute("data-graflume-theme")) ||
    "graflume-light";

  function copy(key, fallback, maximumLength) {
    var value = root.dataset ? root.dataset[key] : "";
    var resolved =
      typeof value === "string" && value.trim() ? value.trim() : fallback;
    return resolved.slice(0, maximumLength || 240);
  }

  function elementFor(panel, datasetKey) {
    var id = panel.dataset ? panel.dataset[datasetKey] : "";
    return id ? document.getElementById(id) : null;
  }

  function readJSON(panel, datasetKey, label) {
    var node = elementFor(panel, datasetKey);
    if (!node) throw new Error(label + " payload is missing.");
    var value = JSON.parse(node.textContent || "null");
    if (value === null || typeof value !== "object") {
      throw new Error(label + " payload is invalid.");
    }
    return value;
  }

  function setStatus(panel, message, state) {
    var status = elementFor(panel, "graflumeStatusId");
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function showError(panel, message) {
    var mount = elementFor(panel, "graflumeMountId");
    if (!mount) return;
    var fallback = document.createElement("p");
    fallback.className = "sg-graflume-chart-fallback";
    fallback.dataset.state = "error";
    fallback.setAttribute("role", "alert");
    fallback.textContent = message;
    mount.replaceChildren(fallback);
  }

  function safeDownloadBase(panel) {
    var value = panel.dataset.graflumeDownloadBase || "graflume-chart-data";
    return /^graflume-[a-z0-9-]+-data$/.test(value)
      ? value
      : "graflume-chart-data";
  }

  function csvValue(value) {
    if (value === null || typeof value === "undefined") return "";
    var output =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    return /[",\r\n]/.test(output)
      ? '"' + output.replace(/"/g, '""') + '"'
      : output;
  }

  function csvText(state) {
    var records = [state.fields.map(csvValue).join(",")];
    state.rows.forEach(function (row) {
      records.push(
        state.fields
          .map(function (field) {
            return csvValue(row[field]);
          })
          .join(","),
      );
    });
    return records.join("\r\n") + "\r\n";
  }

  function downloadBlob(panel, body, type, extension) {
    var url = URL.createObjectURL(new Blob([body], { type: type }));
    var anchor = document.createElement("a");
    anchor.hidden = true;
    anchor.href = url;
    anchor.download = safeDownloadBase(panel) + "." + extension;
    document.body.appendChild(anchor);
    try {
      anchor.click();
    } finally {
      anchor.remove();
      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 0);
    }
  }

  function downloadData(panel, state, format) {
    if (format === "csv") {
      downloadBlob(panel, csvText(state), "text/csv;charset=utf-8", "csv");
    } else if (format === "json") {
      downloadBlob(
        panel,
        JSON.stringify(state.data, null, 2) + "\n",
        "application/json;charset=utf-8",
        "json",
      );
    }
  }

  function setTableVisible(panel, visible) {
    var dataPanel = elementFor(panel, "graflumeDataPanelId");
    var toggle = panel.querySelector("[data-graflume-table-toggle]");
    if (!dataPanel || !toggle) return;
    var label = visible ? toggle.dataset.hideLabel : toggle.dataset.showLabel;
    dataPanel.hidden = !visible;
    toggle.setAttribute("aria-expanded", visible ? "true" : "false");
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    var visibleLabel = toggle.querySelector(
      "[data-graflume-table-toggle-label]",
    );
    if (visibleLabel) visibleLabel.textContent = label;
  }

  function initializeHostControls(panel, state) {
    if (state.hostControlsReady) return;
    state.hostControlsReady = true;
    var dataPanel = elementFor(panel, "graflumeDataPanelId");
    var tableToggle = panel.querySelector("[data-graflume-table-toggle]");
    if (tableToggle && dataPanel) {
      tableToggle.hidden = false;
      setTableVisible(panel, !dataPanel.hidden);
      tableToggle.addEventListener("click", function () {
        setTableVisible(panel, dataPanel.hidden);
      });
    }
    panel
      .querySelectorAll("[data-graflume-download]")
      .forEach(function (button) {
        button.hidden = false;
        button.addEventListener("click", function () {
          downloadData(panel, state, button.dataset.graflumeDownload || "");
        });
      });
    var help = panel.querySelector(".sg-graflume-manual-help");
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

  function markPlaybackRows(panel, state, playbackState) {
    var playback =
      state.capabilities &&
      state.capabilities.core &&
      state.capabilities.core.playback;
    if (!playback) return;
    var frame =
      playbackState && typeof playbackState === "object"
        ? playbackState.frame
        : undefined;
    panel
      .querySelectorAll("[data-graflume-row-index]")
      .forEach(function (rowNode) {
        var row = state.rows[Number(rowNode.dataset.graflumeRowIndex)];
        var current =
          row &&
          typeof frame !== "undefined" &&
          String(row[playback.field]) === String(frame);
        if (current) rowNode.dataset.playbackCurrent = "true";
        else delete rowNode.dataset.playbackCurrent;
      });
  }

  function requiredMethods(instance, runtimeName, playbackEnabled) {
    var methods =
      runtimeName === "spatial"
        ? ["getCamera", "zoomBy", "panBy", "resetCamera"]
        : ["getViewState", "zoomBy", "panBy", "resetView"];
    if (runtimeName === "spatial") {
      methods = methods.concat(["getAvailability", "setCamera", "on"]);
    }
    methods = methods.concat([
      "getLegendState",
      "setLegendItemVisible",
      "getSelection",
      "setSelection",
      "getAnnotations",
      "setAnnotations",
      "getAnnotationsVisible",
      "setAnnotationsVisible",
      "resize",
      "toggleFullscreen",
      "toDataURL",
      "destroy",
    ]);
    if (playbackEnabled) {
      methods = methods.concat([
        "getPlaybackState",
        "play",
        "pause",
        "step",
        "seek",
        "setPlaybackRate",
        "setPlaybackLoop",
      ]);
    }
    methods.forEach(function (name) {
      if (typeof instance[name] !== "function") {
        throw new Error(
          "The pinned Graflume runtime is missing " + name + "().",
        );
      }
    });
  }

  function captureTransientState(state) {
    if (!state || !state.chart) return null;
    var runtimeName = runtimeFor(state.panel).name;
    var snapshot = {
      annotations: state.chart.getAnnotations(),
      annotationsVisible: state.chart.getAnnotationsVisible(),
      legend: state.chart.getLegendState(),
      selection: state.chart.getSelection(),
    };
    if (runtimeName === "spatial") {
      snapshot.camera = state.chart.getCamera();
    } else {
      snapshot.view = state.chart.getViewState();
      if (
        state.capabilities &&
        state.capabilities.core &&
        state.capabilities.core.playback
      ) {
        snapshot.playback = state.chart.getPlaybackState();
      }
    }
    return snapshot;
  }

  function restoreLegendState(chart, legend) {
    if (!legend || !Array.isArray(legend.items)) return;
    var current = chart.getLegendState();
    legend.items.forEach(function (item) {
      var nextItem = current.items.find(function (candidate) {
        return candidate.id === item.id;
      });
      if (
        nextItem &&
        nextItem.toggleable &&
        typeof item.visible === "boolean" &&
        nextItem.visible !== item.visible
      ) {
        chart.setLegendItemVisible(item.id, item.visible);
      }
    });
  }

  function restoreCoreView(chart, view) {
    if (!view || !view.enabled) return;
    chart.resetView();
    var current = chart.getViewState();
    if (!current.enabled) return;
    if (
      Number.isFinite(view.zoom) &&
      view.zoom > 0 &&
      Number.isFinite(current.zoom) &&
      current.zoom > 0
    ) {
      chart.zoomBy(view.zoom / current.zoom, { x: 0, y: 0 });
    }
    current = chart.getViewState();
    if (
      Number.isFinite(view.offsetX) &&
      Number.isFinite(view.offsetY) &&
      Number.isFinite(current.offsetX) &&
      Number.isFinite(current.offsetY)
    ) {
      chart.panBy(
        view.offsetX - current.offsetX,
        view.offsetY - current.offsetY,
      );
    }
  }

  function restorePlaybackState(chart, playback) {
    if (!playback || !playback.enabled) return;
    chart.pause();
    chart.setPlaybackRate(playback.rate);
    chart.setPlaybackLoop(playback.loop);
    if (playback.playing) chart.play();
    chart.seek(playback.index);
  }

  function restoreTransientState(state, runtimeName, snapshot) {
    if (!snapshot || !state.chart) return;
    var chart = state.chart;
    chart.setAnnotations(snapshot.annotations);
    chart.setAnnotationsVisible(snapshot.annotationsVisible);
    restoreLegendState(chart, snapshot.legend);
    if (snapshot.selection && snapshot.selection.enabled) {
      chart.setSelection(snapshot.selection.items);
    }
    if (runtimeName === "spatial") {
      if (snapshot.camera) chart.setCamera(snapshot.camera);
    } else {
      restoreCoreView(chart, snapshot.view);
      restorePlaybackState(chart, snapshot.playback);
    }
  }

  function scheduleResize(state) {
    if (!state || !state.chart || state.panel.hidden || state.resizeFrame)
      return;
    state.resizeFrame = window.requestAnimationFrame(function () {
      state.resizeFrame = 0;
      if (
        state.chart &&
        !state.panel.hidden &&
        typeof state.chart.resize === "function"
      ) {
        state.chart.resize();
      }
    });
  }

  function destroyState(state) {
    if (state.resizeFrame) window.cancelAnimationFrame(state.resizeFrame);
    state.resizeFrame = 0;
    if (state.resizeObserver) state.resizeObserver.disconnect();
    state.resizeObserver = null;
    if (typeof state.unsubscribeAvailability === "function") {
      state.unsubscribeAvailability();
    }
    state.unsubscribeAvailability = null;
    if (typeof state.unsubscribePlayback === "function") {
      state.unsubscribePlayback();
    }
    state.unsubscribePlayback = null;
    if (state.chart && typeof state.chart.destroy === "function") {
      state.chart.destroy();
    }
    state.chart = null;
  }

  function runtimeFor(panel) {
    var name = panel.dataset.graflumeRuntime || "core";
    if (name === "spatial") {
      return { name: name, api: window.GraflumeSpatial };
    }
    return { name: "core", api: window.Graflume };
  }

  function setReadyState(panel) {
    panel.dataset.graflumeExampleState = "ready";
    root.dataset.graflumeChartManualState = "ready";
    setStatus(panel, copy("graflumeReady", "Ready", 120), "ready");
  }

  function setLoadingState(panel) {
    panel.dataset.graflumeExampleState = "loading";
    root.dataset.graflumeChartManualState = "loading";
    setStatus(panel, copy("graflumeLoading", "Loading", 120), "loading");
  }

  function setUnavailableState(panel) {
    panel.dataset.graflumeExampleState = "error";
    root.dataset.graflumeChartManualState = "error";
    setStatus(
      panel,
      copy("graflumeError", "The chart could not be rendered.", 240),
      "error",
    );
  }

  function applySpatialAvailability(panel, availability) {
    if (
      !availability ||
      typeof availability !== "object" ||
      typeof availability.status !== "string" ||
      typeof availability.available !== "boolean"
    ) {
      throw new Error("Spatial availability state is invalid.");
    }
    if (availability.status === "ready" && availability.available) {
      setReadyState(panel);
      return;
    }
    if (availability.status === "initializing") {
      setLoadingState(panel);
      return;
    }
    if (
      availability.status === "unavailable" ||
      availability.status === "context-lost" ||
      availability.status === "destroyed"
    ) {
      setUnavailableState(panel);
      return;
    }
    throw new Error(
      "Spatial availability status is unsupported: " + availability.status,
    );
  }

  function observeSpatialAvailability(panel, state) {
    state.unsubscribeAvailability = state.chart.on(
      "availabilitychange",
      function (event) {
        try {
          applySpatialAvailability(
            panel,
            event && event.state ? event.state : state.chart.getAvailability(),
          );
        } catch (error) {
          setUnavailableState(panel);
          if (window.console && typeof window.console.error === "function") {
            window.console.error(
              "Graflume spatial availability update failed.",
              error,
            );
          }
        }
      },
    );
    applySpatialAvailability(panel, state.chart.getAvailability());
  }

  function renderPanel(panel, transientState) {
    var existing = states.get(panel);
    if (existing && existing.chart) {
      scheduleResize(existing);
      return;
    }
    var state = existing || {
      panel: panel,
      chart: null,
      resizeFrame: 0,
      resizeObserver: null,
      unsubscribePlayback: null,
      unsubscribeAvailability: null,
      hostControlsReady: false,
    };
    states.set(panel, state);
    setLoadingState(panel);
    try {
      state.data = readJSON(panel, "graflumeDataPayloadId", "Data");
      state.rows = panel.dataset.graflumeTableDataPayloadId
        ? readJSON(panel, "graflumeTableDataPayloadId", "Table data")
        : state.data;
      state.fields = readJSON(panel, "graflumeFieldsPayloadId", "Fields");
      state.capabilities = readJSON(
        panel,
        "graflumeCapabilitiesPayloadId",
        "Capabilities",
      );
      if (!Array.isArray(state.rows)) {
        throw new Error("Table data payload must be an array.");
      }
      if (
        !Array.isArray(state.fields) ||
        state.fields.some(function (field) {
          return typeof field !== "string";
        })
      ) {
        throw new Error("Fields payload must be an array of names.");
      }
      if (
        state.capabilities.schema !==
        "statground.graflume.manual-capabilities.v1"
      ) {
        throw new Error("Capabilities payload has an unsupported schema.");
      }

      var mount = elementFor(panel, "graflumeMountId");
      var functionName = panel.dataset.graflumeChartApi || "";
      var runtime = runtimeFor(panel);
      if (
        !mount ||
        !functionName ||
        !runtime.api ||
        typeof runtime.api[functionName] !== "function"
      ) {
        throw new Error("Graflume Quick API is unavailable: " + functionName);
      }
      var options = readJSON(panel, "graflumeOptionsPayloadId", "Options");
      options.theme = currentTheme;
      if (runtime.name === "core" && typeof options.width === "undefined") {
        options.width = "container";
      }
      if (runtime.name === "spatial") {
        if (!options.create || typeof options.create !== "object") {
          options.create = {};
        }
        if (typeof options.create.height === "undefined") {
          options.create.height = 420;
        }
      } else if (typeof options.height === "undefined") {
        options.height = 420;
      }
      mount.replaceChildren();
      state.chart = runtime.api[functionName](
        "#" + mount.id,
        state.data,
        options,
      );
      if (!state.chart || typeof state.chart.destroy !== "function") {
        throw new Error("Graflume did not return a chart instance.");
      }
      var playbackEnabled = Boolean(
        runtime.name === "core" &&
        state.capabilities.core &&
        state.capabilities.core.playback,
      );
      requiredMethods(state.chart, runtime.name, playbackEnabled);
      restoreTransientState(state, runtime.name, transientState);
      if (playbackEnabled && typeof state.chart.on === "function") {
        state.unsubscribePlayback = state.chart.on(
          "playbackchange",
          function (event) {
            markPlaybackRows(
              panel,
              state,
              event && event.state ? event.state : event,
            );
          },
        );
        markPlaybackRows(panel, state, state.chart.getPlaybackState());
      }
      initializeHostControls(panel, state);
      if (runtime.name === "spatial") {
        observeSpatialAvailability(panel, state);
      } else {
        setReadyState(panel);
      }
      if (typeof window.ResizeObserver === "function") {
        state.resizeObserver = new window.ResizeObserver(function () {
          scheduleResize(state);
        });
        state.resizeObserver.observe(mount);
      }
    } catch (error) {
      destroyState(state);
      panel.dataset.graflumeExampleState = "error";
      root.dataset.graflumeChartManualState = "error";
      var message = copy(
        "graflumeError",
        "The chart could not be rendered.",
        240,
      );
      setStatus(panel, message, "error");
      showError(panel, message);
      if (window.console && typeof window.console.error === "function") {
        window.console.error("Graflume chart manual example failed.", error);
      }
    }
  }

  function styleTab(tab, selected) {
    tab.setAttribute("aria-selected", selected ? "true" : "false");
    tab.tabIndex = selected ? 0 : -1;
    ["border-blue-600", "bg-blue-600", "text-white"].forEach(function (name) {
      tab.classList.toggle(name, selected);
    });
    ["border-slate-200", "bg-white", "text-slate-700"].forEach(function (name) {
      tab.classList.toggle(name, !selected);
    });
  }

  function replaceThemeToken(node, theme) {
    if (!node) return;
    if (node.nodeType === 3) {
      var value = node.nodeValue || "";
      var match = value.match(
        /^(['"`])(graflume-light|graflume-dark|ggplot)\1$/,
      );
      if (match) node.nodeValue = match[1] + theme + match[1];
      return;
    }
    Array.prototype.forEach.call(node.childNodes || [], function (child) {
      replaceThemeToken(child, theme);
    });
  }

  function syncVisibleTheme(panel, theme) {
    panel
      .querySelectorAll(
        "[data-graflume-options-code], [data-graflume-example-code]",
      )
      .forEach(function (code) {
        replaceThemeToken(code, theme);
      });
  }

  function syncAllVisibleThemes(theme) {
    panels.forEach(function (panel) {
      syncVisibleTheme(panel, theme);
    });
  }

  function replaceActiveHash(panel) {
    if (!window.history || typeof window.history.replaceState !== "function")
      return;
    try {
      var url = new window.URL(window.location.href);
      url.hash = panel.id;
      window.history.replaceState(
        window.history.state,
        "",
        url.pathname + url.search + url.hash,
      );
    } catch (_error) {
      window.history.replaceState(window.history.state, "", "#" + panel.id);
    }
  }

  function activate(index, focusTab, updateHash) {
    if (index < 0 || index >= panels.length) return;
    var previous = activePanel;
    activePanel = panels[index];
    panels.forEach(function (panel, panelIndex) {
      panel.hidden = panelIndex !== index;
    });
    tabs.forEach(function (tab, tabIndex) {
      styleTab(tab, tabIndex === index);
    });
    if (previous && previous !== activePanel) {
      var previousState = states.get(previous);
      if (previousState) destroyState(previousState);
      previous.dataset.graflumeExampleState = "inactive";
    }
    renderPanel(activePanel);
    if (focusTab && tabs[index]) tabs[index].focus();
    if (updateHash && window.history && activePanel.id) {
      replaceActiveHash(activePanel);
    }
  }

  function handleThemeChange(event) {
    if (permanentlyDestroyed) return;
    var detail = event && event.detail;
    var nextTheme = normalizeTheme(detail && detail.theme);
    if (!nextTheme || nextTheme === currentTheme) return;
    var activeState = activePanel ? states.get(activePanel) : null;
    var transientState = captureTransientState(activeState);
    currentTheme = nextTheme;
    root.setAttribute("data-graflume-theme", currentTheme);
    syncAllVisibleThemes(currentTheme);
    if (!activePanel) return;
    if (activeState) destroyState(activeState);
    renderPanel(activePanel, transientState);
  }

  function initialize() {
    if (permanentlyDestroyed || panels.length === 0) return;
    syncAllVisibleThemes(currentTheme);
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(index, false, true);
      });
      tab.addEventListener("keydown", function (event) {
        var next = index;
        var rtl = document.documentElement.dir === "rtl";
        if (event.key === "ArrowRight") next = index + (rtl ? -1 : 1);
        else if (event.key === "ArrowLeft") next = index + (rtl ? 1 : -1);
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate((next + tabs.length) % tabs.length, true, true);
      });
    });
    var hash = window.location.hash.slice(1);
    var hashIndex = panels.findIndex(function (panel) {
      return panel.id === hash;
    });
    var defaultIndex = tabs.findIndex(function (tab) {
      return tab.getAttribute("aria-selected") === "true";
    });
    activate(
      hashIndex >= 0 ? hashIndex : defaultIndex >= 0 ? defaultIndex : 0,
      false,
      false,
    );
  }

  function handlePageHide(event) {
    if (event.persisted) return;
    root.removeEventListener(themeEvent, handleThemeChange);
    states.forEach(destroyState);
    permanentlyDestroyed = true;
  }

  function handlePageShow(event) {
    if (event.persisted && activePanel) scheduleResize(states.get(activePanel));
  }

  root.addEventListener(themeEvent, handleThemeChange);
  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("pageshow", handlePageShow);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
