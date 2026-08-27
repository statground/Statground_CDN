(function () {
  "use strict";

  var panelSelector =
    '[data-graflume-chart-example][data-graflume-row-table="available"]';
  var fallbackSelector = "[data-graflume-manual-table-toolbar]";
  var scanQueued = false;

  function mountFor(panel) {
    var id = panel.dataset.graflumeMountId || "";
    return id ? document.getElementById(id) : null;
  }

  function nativeToolbar(mount) {
    return mount.querySelector(
      "[data-graflume-spatial-controls], " +
        "[data-graflume-controls-strip]:not([data-graflume-manual-controls-strip])",
    );
  }

  function install(panel) {
    var source = panel.querySelector("[data-graflume-table-toggle]");
    var popover = panel.querySelector("[data-graflume-data-popover]");
    var chartWindow = panel.querySelector(".sg-graflume-window");
    var mount = mountFor(panel);
    if (!source || !popover || !chartWindow || !mount) return;

    var fallback = chartWindow.querySelector(fallbackSelector);
    if (nativeToolbar(mount)) {
      if (fallback) fallback.remove();
      return;
    }
    if (fallback) return;

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

  function start() {
    scan();
    if (typeof window.MutationObserver !== "function") return;
    new window.MutationObserver(queueScan).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // This script is deferred, so the complete manual DOM already exists. Run
  // before DOMContentLoaded so the main controller can bind its first proxy
  // instead of cloning an already-bound source button after chart creation.
  start();
})();
