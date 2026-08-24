(function () {
  "use strict";

  var ROOT_SELECTOR = "[data-graflume-theme-scope]";
  var HOST_SELECTOR = "[data-graflume-theme-selector]";
  var INPUT_SELECTOR = "[data-graflume-theme-input]";
  var PREVIEW_SELECTOR = "img[data-graflume-theme-preview]";
  var VALUE_SELECTOR = "[data-graflume-theme-value]";
  var THEME_EVENT = "graflume:themechange";
  var STORAGE_KEY = "statground.graflume.theme.v1";
  var THEMES = ["graflume-light", "graflume-dark", "ggplot"];
  var SOURCE_ATTRIBUTES = {
    "graflume-light": "data-graflume-theme-src-light",
    "graflume-dark": "data-graflume-theme-src-dark",
    ggplot: "data-graflume-theme-src-ggplot",
  };
  var controllers = [];
  var inputSequence = 0;

  function normalizeTheme(value) {
    var candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
    return THEMES.indexOf(candidate) >= 0 ? candidate : "";
  }

  function attributeCopy(root, host, name, fallback) {
    var value = host.getAttribute(name) || root.getAttribute(name) || "";
    value = typeof value === "string" ? value.trim() : "";
    return (value || fallback).slice(0, 120);
  }

  function queryTheme() {
    try {
      return normalizeTheme(
        new window.URL(window.location.href).searchParams.get("theme"),
      );
    } catch (_error) {
      return "";
    }
  }

  function storedTheme() {
    try {
      return normalizeTheme(window.localStorage.getItem(STORAGE_KEY));
    } catch (_error) {
      return "";
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (_error) {
      // The selector remains fully usable when storage is unavailable.
    }
  }

  function syncQuery(theme) {
    if (!window.history || typeof window.history.replaceState !== "function")
      return;
    try {
      var url = new window.URL(window.location.href);
      if (url.searchParams.get("theme") === theme) return;
      url.searchParams.set("theme", theme);
      window.history.replaceState(
        window.history.state,
        "",
        url.pathname + url.search + url.hash,
      );
    } catch (_error) {
      // URL synchronization is progressive enhancement only.
    }
  }

  function initialTheme(root, host) {
    return (
      queryTheme() ||
      normalizeTheme(root.getAttribute("data-graflume-theme")) ||
      storedTheme() ||
      normalizeTheme(host.getAttribute("data-graflume-theme-default")) ||
      "graflume-light"
    );
  }

  function option(value, label) {
    var node = document.createElement("option");
    node.value = value;
    node.textContent = label;
    return node;
  }

  function createInput(root, host) {
    var label = document.createElement("label");
    var labelText = document.createElement("span");
    var input = document.createElement("select");
    var inputID = "graflume-theme-select-" + String(++inputSequence);

    host.classList.add("sg-graflume-theme-selector");
    label.className = "sg-graflume-theme-selector-label";
    label.htmlFor = inputID;
    labelText.className = "sg-graflume-theme-selector-title";
    labelText.textContent = attributeCopy(
      root,
      host,
      "data-graflume-theme-label",
      "Theme",
    );
    input.id = inputID;
    input.className = "sg-graflume-theme-selector-input";
    input.setAttribute("data-graflume-theme-input", "");
    input.appendChild(
      option(
        "graflume-light",
        attributeCopy(
          root,
          host,
          "data-graflume-theme-light-label",
          "graflume-light",
        ),
      ),
    );
    input.appendChild(
      option(
        "graflume-dark",
        attributeCopy(
          root,
          host,
          "data-graflume-theme-dark-label",
          "graflume-dark",
        ),
      ),
    );
    input.appendChild(
      option(
        "ggplot",
        attributeCopy(root, host, "data-graflume-theme-ggplot-label", "ggplot"),
      ),
    );
    label.appendChild(labelText);
    label.appendChild(input);
    host.appendChild(label);
    return input;
  }

  function updatePreviews(root, theme) {
    var sourceAttribute = SOURCE_ATTRIBUTES[theme];
    root.querySelectorAll(PREVIEW_SELECTOR).forEach(function (image) {
      var source = (image.getAttribute(sourceAttribute) || "").trim();
      if (!source) return;
      image.setAttribute("data-graflume-preview-theme", theme);
      if (image.getAttribute("src") !== source)
        image.setAttribute("src", source);
    });
  }

  function updateVisibleValues(root, theme) {
    root.querySelectorAll(VALUE_SELECTOR).forEach(function (node) {
      node.textContent = theme;
    });
  }

  function announceTheme(root, theme, source) {
    root.dispatchEvent(
      new window.CustomEvent(THEME_EVENT, {
        bubbles: true,
        detail: { theme: theme, source: source },
      }),
    );
  }

  function applyTheme(controller, theme, source) {
    var normalized = normalizeTheme(theme);
    if (!normalized || controller.destroyed) return;
    controller.root.setAttribute("data-graflume-theme", normalized);
    controller.input.value = normalized;
    updatePreviews(controller.root, normalized);
    updateVisibleValues(controller.root, normalized);
    storeTheme(normalized);
    syncQuery(normalized);
    announceTheme(controller.root, normalized, source);
  }

  function bindRoot(root) {
    if (root.getAttribute("data-graflume-theme-bound") === "true") return;
    var host = root.querySelector(HOST_SELECTOR);
    if (!host) return;
    host.classList.add("sg-graflume-theme-selector");
    var input = host.querySelector(INPUT_SELECTOR) || createInput(root, host);
    var controller = {
      destroyed: false,
      host: host,
      input: input,
      root: root,
      onChange: null,
    };
    controller.onChange = function () {
      var nextTheme = normalizeTheme(input.value);
      if (!nextTheme) {
        input.value =
          normalizeTheme(root.getAttribute("data-graflume-theme")) ||
          "graflume-light";
        return;
      }
      applyTheme(controller, nextTheme, "selector");
    };
    root.setAttribute("data-graflume-theme-bound", "true");
    input.addEventListener("change", controller.onChange);
    controllers.push(controller);
    applyTheme(controller, initialTheme(root, host), "initial");
  }

  function initialize() {
    document.querySelectorAll(ROOT_SELECTOR).forEach(bindRoot);
  }

  function destroyController(controller) {
    if (controller.destroyed) return;
    controller.destroyed = true;
    controller.input.removeEventListener("change", controller.onChange);
  }

  function handlePageHide(event) {
    if (event.persisted) return;
    controllers.forEach(destroyController);
    controllers = [];
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("pageshow", handlePageShow);
    window.removeEventListener("popstate", handlePopState);
  }

  function handlePageShow(event) {
    if (!event.persisted) return;
    controllers.forEach(function (controller) {
      var theme =
        queryTheme() ||
        normalizeTheme(controller.root.getAttribute("data-graflume-theme"));
      if (theme) applyTheme(controller, theme, "history");
    });
  }

  function handlePopState() {
    var theme = queryTheme();
    if (!theme) return;
    controllers.forEach(function (controller) {
      applyTheme(controller, theme, "history");
    });
  }

  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("pageshow", handlePageShow);
  window.addEventListener("popstate", handlePopState);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
