(function () {
  "use strict";

  var panelSelector =
    '[data-graflume-chart-example][data-graflume-row-table="available"]';
  var fallbackSelector = "[data-graflume-manual-table-toolbar]";
  var proxySelector = "[data-graflume-table-toggle-proxy]";
  var scanQueued = false;

  function mountFor(panel) {
    var id = panel.dataset.graflumeMountId || "";
    return id ? document.getElementById(id) : null;
  }

  function dataPanelFor(panel) {
    var id = panel.dataset.graflumeDataPanelId || "";
    return id ? document.getElementById(id) : null;
  }

  function nativeToolbar(mount) {
    return mount.querySelector(
      "[data-graflume-spatial-controls], " +
        "[data-graflume-controls-strip]:not([data-graflume-manual-controls-strip])",
    );
  }

  function controls(panel) {
    return panel.querySelectorAll(
      "[data-graflume-table-toggle], [data-graflume-table-toggle-proxy]",
    );
  }

  function setVisible(panel, visible, focusTarget) {
    var source = panel.querySelector("[data-graflume-table-toggle]");
    var popover = dataPanelFor(panel);
    if (!source || !popover) return;
    var label = visible ? source.dataset.hideLabel : source.dataset.showLabel;
    popover.hidden = !visible;
    popover.dataset.state = visible ? "open" : "closed";
    controls(panel).forEach(function (control) {
      control.setAttribute("aria-expanded", visible ? "true" : "false");
      control.setAttribute("aria-label", label);
      control.title = label;
    });
    if (visible && focusTarget === "panel") popover.focus();
    if (!visible && focusTarget === "toggle") {
      var proxy = panel.querySelector(proxySelector + ":not([hidden])");
      if (proxy) proxy.focus();
    }
  }

  function bindProxy(panel, proxy) {
    if (proxy.dataset.graflumeManualTableControlBound === "true") return;
    proxy.dataset.graflumeManualTableControlBound = "true";
    proxy.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var popover = dataPanelFor(panel);
        if (!popover) return;
        var visible = !popover.hidden;
        setVisible(panel, !visible, visible ? "toggle" : "panel");
      },
      true,
    );
  }

  function bindPopover(panel, popover) {
    if (popover.dataset.graflumeManualPopoverBound === "true") return;
    popover.dataset.graflumeManualPopoverBound = "true";
    var close = popover.querySelector("[data-graflume-table-close]");
    if (close) {
      close.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();
          setVisible(panel, false, "toggle");
        },
        true,
      );
    }
    popover.addEventListener(
      "keydown",
      function (event) {
        if (event.key !== "Escape" || popover.hidden) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setVisible(panel, false, "toggle");
      },
      true,
    );
  }

  function fallbackToolbar(chartWindow, source) {
    var existing = chartWindow.querySelector(fallbackSelector);
    if (existing) {
      return existing.querySelector("[data-graflume-controls-strip]");
    }
    var host = document.createElement("div");
    host.className = "sg-graflume-manual-table-toolbar";
    host.setAttribute("data-graflume-manual-table-toolbar", "true");
    var strip = document.createElement("div");
    strip.className = "graflume-controls__strip";
    strip.setAttribute("data-graflume-controls-strip", "true");
    strip.setAttribute("data-graflume-manual-controls-strip", "true");
    strip.setAttribute("role", "toolbar");
    strip.setAttribute("aria-label", source.getAttribute("aria-label") || "Data");
    host.appendChild(strip);
    chartWindow.appendChild(host);
    return strip;
  }

  function ensureProxy(panel, toolbar, source) {
    var proxy = panel.querySelector(proxySelector);
    if (!proxy) {
      proxy = source.cloneNode(true);
      proxy.hidden = false;
      proxy.removeAttribute("data-graflume-table-toggle");
      proxy.removeAttribute("data-graflume-table-control-bound");
      proxy.setAttribute("data-graflume-table-toggle-proxy", "true");
      proxy.className = "graflume-controls__button";
      proxy.dataset.graflumeControl = "data-table";
      var label = proxy.querySelector("[data-graflume-table-toggle-label]");
      if (label) label.remove();
    }
    bindProxy(panel, proxy);
    if (proxy.parentElement !== toolbar) toolbar.appendChild(proxy);
    source.hidden = true;
    return proxy;
  }

  function install(panel) {
    var source = panel.querySelector("[data-graflume-table-toggle]");
    var popover = dataPanelFor(panel);
    var chartWindow = panel.querySelector(".sg-graflume-window");
    var mount = mountFor(panel);
    if (!source || !popover || !chartWindow || !mount) return;
    bindPopover(panel, popover);

    var native = nativeToolbar(mount);
    var toolbar = native || fallbackToolbar(chartWindow, source);
    ensureProxy(panel, toolbar, source);
    if (native) {
      var fallback = chartWindow.querySelector(fallbackSelector);
      if (fallback) fallback.remove();
    }
    setVisible(panel, !popover.hidden);
  }

  function scan() {
    scanQueued = false;
    document.querySelectorAll(panelSelector).forEach(install);
  }

  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    window.requestAnimationFrame(scan);
  }

  scan();
  if (typeof window.MutationObserver === "function") {
    new window.MutationObserver(queueScan).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
})();
