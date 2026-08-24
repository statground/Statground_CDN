(function () {
  "use strict";

  var ROOT_SELECTOR = "[data-graflume-theme-scope]";
  var HOST_SELECTOR = "[data-graflume-theme-selector]";
  var INPUT_SELECTOR = "[data-graflume-theme-input]";
  var REGISTRY_SELECTOR = "script[data-graflume-theme-registry]";
  var PREVIEW_SELECTOR = "img[data-graflume-theme-preview]";
  var VALUE_SELECTOR = "[data-graflume-theme-value]";
  var REGISTRY_SCHEMA = "statground.graflume.theme-registry.v1";
  var THEME_EVENT = "graflume:themechange";
  var STORAGE_KEY = "statground.graflume.theme.v1";
  var THEME_ID_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;
  var PREVIEW_KEY_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;
  var controllers = [];
  var inputSequence = 0;

  function safeText(value, maximumLength) {
    return typeof value === "string"
      ? value.trim().slice(0, maximumLength)
      : "";
  }

  function safePreviewURL(value) {
    var source = safeText(value, 2048);
    if (!source) return "";
    try {
      var url = new window.URL(source, window.location.href);
      if (
        url.protocol !== "https:" &&
        !(url.protocol === "http:" && url.origin === window.location.origin)
      ) {
        return "";
      }
      return url.href;
    } catch (_error) {
      return "";
    }
  }

  function readEngineThemeCatalog(api) {
    if (!api) return null;
    if (!Array.isArray(api.builtInThemeCatalog)) {
      throw new Error("Graflume engine theme catalog is unavailable.");
    }
    if (
      api.builtInThemeCatalog.length === 0 ||
      api.builtInThemeCatalog.length > 32
    ) {
      throw new Error("Invalid Graflume engine theme catalog.");
    }
    var seen = Object.create(null);
    var ids = api.builtInThemeCatalog.map(function (entry) {
      var id = safeText(entry && entry.id, 64).toLowerCase();
      if (!THEME_ID_PATTERN.test(id) || seen[id]) {
        throw new Error("Invalid Graflume engine theme entry.");
      }
      seen[id] = true;
      return id;
    });
    return { ids: ids, themeByID: seen };
  }

  function reconcileEngineCatalog(themes, defaultTheme) {
    var catalogs = [window.Graflume, window.GraflumeSpatial]
      .map(readEngineThemeCatalog)
      .filter(Boolean);
    if (catalogs.length === 0) {
      return { defaultTheme: defaultTheme, drift: false, themes: themes };
    }
    var compatibleThemes = themes.filter(function (theme) {
      return catalogs.every(function (catalog) {
        return catalog.themeByID[theme.id];
      });
    });
    var supportedByID = Object.create(null);
    compatibleThemes.forEach(function (theme) {
      supportedByID[theme.id] = true;
    });
    if (!supportedByID[defaultTheme]) {
      throw new Error("Graflume engine does not support the default theme.");
    }
    var serverIDs = themes.map(function (theme) {
      return theme.id;
    });
    var drift = catalogs.some(function (catalog) {
      return (
        catalog.ids.length !== serverIDs.length ||
        catalog.ids.some(function (id, index) {
          return id !== serverIDs[index];
        })
      );
    });
    return {
      defaultTheme: defaultTheme,
      drift: drift,
      themes: compatibleThemes,
    };
  }

  function readRegistry(root) {
    var node = root.querySelector(REGISTRY_SELECTOR);
    if (!node || node.type !== "application/json") return null;
    try {
      var documentValue = JSON.parse(node.textContent || "null");
      if (
        !documentValue ||
        documentValue.schema !== REGISTRY_SCHEMA ||
        !Array.isArray(documentValue.themes) ||
        documentValue.themes.length === 0 ||
        documentValue.themes.length > 32
      ) {
        return null;
      }

      var themes = [];
      var themeByID = Object.create(null);
      documentValue.themes.forEach(function (candidate) {
        var id = safeText(candidate && candidate.id, 64).toLowerCase();
        var label = safeText(candidate && candidate.label, 120);
        if (!THEME_ID_PATTERN.test(id) || !label || themeByID[id]) {
          throw new Error("Invalid Graflume theme registry entry.");
        }
        var theme = { id: id, label: label };
        themes.push(theme);
        themeByID[id] = theme;
      });

      var defaultTheme = safeText(documentValue.defaultTheme, 64).toLowerCase();
      var label = safeText(documentValue.label, 120);
      var errorLabel = safeText(documentValue.errorLabel, 240);
      if (!themeByID[defaultTheme] || !label || !errorLabel) return null;

      var previews = Object.create(null);
      var previewDocument = documentValue.previews;
      if (previewDocument && typeof previewDocument === "object") {
        var previewKeys = Object.keys(previewDocument);
        if (previewKeys.length > 256) return null;
        previewKeys.forEach(function (key) {
          if (!PREVIEW_KEY_PATTERN.test(key)) {
            throw new Error("Invalid Graflume preview registry key.");
          }
          var candidateSources = previewDocument[key];
          if (!candidateSources || typeof candidateSources !== "object") {
            throw new Error("Invalid Graflume preview registry sources.");
          }
          var sourceKeys = Object.keys(candidateSources);
          if (
            sourceKeys.some(function (themeID) {
              return !themeByID[themeID];
            })
          ) {
            throw new Error("Unknown Graflume preview theme.");
          }
          var sources = Object.create(null);
          themes.forEach(function (theme) {
            var source = safePreviewURL(candidateSources[theme.id]);
            if (!source) {
              throw new Error("Missing Graflume preview source.");
            }
            sources[theme.id] = source;
          });
          previews[key] = sources;
        });
      }

      var reconciled = reconcileEngineCatalog(themes, defaultTheme);
      var supportedThemeByID = Object.create(null);
      reconciled.themes.forEach(function (theme) {
        supportedThemeByID[theme.id] = theme;
      });
      return {
        defaultTheme: reconciled.defaultTheme,
        drift: reconciled.drift,
        errorLabel: errorLabel,
        label: label,
        previews: previews,
        themeByID: supportedThemeByID,
        themes: reconciled.themes,
      };
    } catch (_error) {
      return null;
    }
  }

  function normalizeTheme(registry, value) {
    var candidate = safeText(value, 64).toLowerCase();
    return registry.themeByID[candidate] ? candidate : "";
  }

  function queryTheme(registry) {
    try {
      return normalizeTheme(
        registry,
        new window.URL(window.location.href).searchParams.get("theme"),
      );
    } catch (_error) {
      return "";
    }
  }

  function storedTheme(registry) {
    try {
      return normalizeTheme(registry, window.localStorage.getItem(STORAGE_KEY));
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

  function initialTheme(controller) {
    return (
      queryTheme(controller.registry) ||
      normalizeTheme(
        controller.registry,
        controller.root.getAttribute("data-graflume-theme"),
      ) ||
      storedTheme(controller.registry) ||
      controller.registry.defaultTheme
    );
  }

  function option(theme) {
    var node = document.createElement("option");
    node.value = theme.id;
    node.textContent = theme.label;
    return node;
  }

  function createInput(host, registry) {
    var label = document.createElement("label");
    var labelText = document.createElement("span");
    var input = document.createElement("select");
    var inputID = "graflume-theme-select-" + String(++inputSequence);

    host.classList.add("sg-graflume-theme-selector");
    label.className = "sg-graflume-theme-selector-label";
    label.htmlFor = inputID;
    labelText.className = "sg-graflume-theme-selector-title";
    labelText.textContent = registry.label;
    input.id = inputID;
    input.className = "sg-graflume-theme-selector-input";
    input.setAttribute("data-graflume-theme-input", "");
    registry.themes.forEach(function (theme) {
      input.appendChild(option(theme));
    });
    label.appendChild(labelText);
    label.appendChild(input);
    host.appendChild(label);
    return input;
  }

  function showRegistryError(host, message) {
    if (!host) return;
    var error = host.querySelector("[data-graflume-theme-registry-error]");
    if (!error) {
      error = document.createElement("p");
      error.className = "sg-graflume-theme-selector-error";
      error.setAttribute("data-graflume-theme-registry-error", "");
      error.setAttribute("role", "alert");
      host.appendChild(error);
    }
    error.textContent = safeText(message, 240) || "Theme catalog unavailable.";
  }

  function updatePreviews(controller, theme) {
    controller.root
      .querySelectorAll(PREVIEW_SELECTOR)
      .forEach(function (image) {
        var key = safeText(
          image.getAttribute("data-graflume-theme-preview"),
          80,
        );
        var sources = controller.registry.previews[key];
        var source = sources && sources[theme];
        if (!source) return;
        image.setAttribute("data-graflume-preview-theme", theme);
        if (image.src !== source) image.src = source;
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
    var normalized = normalizeTheme(controller.registry, theme);
    if (!normalized || controller.destroyed) return;
    controller.root.setAttribute("data-graflume-theme", normalized);
    controller.input.value = normalized;
    updatePreviews(controller, normalized);
    updateVisibleValues(controller.root, normalized);
    storeTheme(normalized);
    syncQuery(normalized);
    announceTheme(controller.root, normalized, source);
  }

  function bindRoot(root) {
    if (root.getAttribute("data-graflume-theme-bound") === "true") return;
    var host = root.querySelector(HOST_SELECTOR);
    var registry = readRegistry(root);
    if (!host || !registry) {
      root.setAttribute("data-graflume-theme-registry-state", "invalid");
      showRegistryError(host, root.getAttribute("data-graflume-error") || "");
      return;
    }
    var input =
      host.querySelector(INPUT_SELECTOR) || createInput(host, registry);
    var controller = {
      destroyed: false,
      host: host,
      input: input,
      registry: registry,
      root: root,
      onChange: null,
    };
    controller.onChange = function () {
      var nextTheme = normalizeTheme(registry, input.value);
      if (!nextTheme) {
        input.value =
          normalizeTheme(registry, root.getAttribute("data-graflume-theme")) ||
          registry.defaultTheme;
        return;
      }
      applyTheme(controller, nextTheme, "selector");
    };
    root.setAttribute("data-graflume-theme-bound", "true");
    root.setAttribute(
      "data-graflume-theme-registry-state",
      registry.drift ? "drift" : "ready",
    );
    if (registry.drift) showRegistryError(host, registry.errorLabel);
    input.addEventListener("change", controller.onChange);
    controllers.push(controller);
    applyTheme(controller, initialTheme(controller), "initial");
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
        queryTheme(controller.registry) ||
        normalizeTheme(
          controller.registry,
          controller.root.getAttribute("data-graflume-theme"),
        );
      if (theme) applyTheme(controller, theme, "history");
    });
  }

  function handlePopState() {
    controllers.forEach(function (controller) {
      var theme = queryTheme(controller.registry);
      if (theme) applyTheme(controller, theme, "history");
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
