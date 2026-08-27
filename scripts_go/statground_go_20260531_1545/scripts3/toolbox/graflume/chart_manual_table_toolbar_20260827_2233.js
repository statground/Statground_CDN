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
    var spatial = mount.querySelector("[data-graflume-spatial-controls]");
    if (
      spatial &&
      spatial.querySelector("[data-graflume-spatial-control]")
    ) {
      return spatial;
    }
    return (
      Array.prototype.slice
        .call(mount.querySelectorAll("[data-graflume-controls-strip]"))
        .find(function (strip) {
          return strip.querySelector(
            "[data-graflume-control]:not([data-graflume-table-toggle-proxy])",
          );
        }) || null
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

  function removeProxy(panel) {
    var proxy = panel.querySelector(proxySelector);
    if (proxy) proxy.remove();
  }

  function ensureProxy(panel, toolbar, source) {
    var proxy = panel.querySelector(proxySelector);
    if (proxy && proxy.parentElement !== toolbar) {
      proxy.remove();
      proxy = null;
    }
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
      toolbar.appendChild(proxy);
    }
    bindProxy(panel, proxy);
    return proxy;
  }

  function install(panel) {
    var source = panel.querySelector("[data-graflume-table-toggle]");
    var popover = dataPanelFor(panel);
    var mount = mountFor(panel);
    if (!source || !popover || !mount) return;
    source.hidden = true;
    bindPopover(panel, popover);
    panel.querySelectorAll(fallbackSelector).forEach(function (fallback) {
      fallback.remove();
    });

    var toolbar = nativeToolbar(mount);
    if (!toolbar) {
      removeProxy(panel);
      setVisible(panel, false);
      return;
    }
    ensureProxy(panel, toolbar, source);
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
