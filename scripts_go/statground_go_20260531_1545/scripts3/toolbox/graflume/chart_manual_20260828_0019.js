(function () {
  "use strict";

  var root = document.querySelector("[data-graflume-chart-manual]");
  if (!root || root.dataset.graflumeChartManualBound === "true") return;

  var themeIDPattern = /^[a-z][a-z0-9-]{0,63}$/;
  var dataRecipeV2Schema = "statground.graflume.data-recipe.v2";
  var runtimeReloads = { core: null, spatial: null };
  var runtimeReloadAttempts = { core: 0, spatial: 0 };
  var runtimeRetrySchedule = ["frame", 100, 400];

  function themeRegistryError(message) {
    var fallback = copy(
      "graflumePayloadInvalid",
      "The chart example data could not be read.",
      240,
    );
    var host = root.querySelector("[data-graflume-theme-selector]");
    if (!host) return fallback;
    var node = host.querySelector("[data-graflume-theme-registry-error]");
    if (!node) {
      node = document.createElement("p");
      node.className = "sg-graflume-theme-selector-error";
      node.setAttribute("data-graflume-theme-registry-error", "");
      node.setAttribute("role", "alert");
      host.appendChild(node);
    }
    var resolved =
      typeof message === "string" && message.trim()
        ? message.trim().slice(0, 240)
        : fallback.slice(0, 240);
    node.textContent = resolved;
    return resolved;
  }

  function failThemeRegistryPanels(message) {
    var category = "payload-invalid";
    root.dataset.graflumeChartManualState = "error";
    root.dataset.graflumeChartManualErrorCategory = category;
    root
      .querySelectorAll("[data-graflume-chart-example]")
      .forEach(function (panel) {
        panel.dataset.graflumeExampleState = "error";
        panel.dataset.graflumeErrorCategory = category;
        var statusID = panel.dataset.graflumeStatusId || "";
        var status = statusID ? document.getElementById(statusID) : null;
        if (status && root.contains(status)) {
          status.textContent = message;
          status.dataset.state = "error";
        }
        var mountID = panel.dataset.graflumeMountId || "";
        var mount = mountID ? document.getElementById(mountID) : null;
        if (!mount || !root.contains(mount)) return;
        var fallback = document.createElement("p");
        fallback.className = "sg-graflume-chart-fallback";
        fallback.dataset.state = "error";
        fallback.setAttribute("role", "alert");
        fallback.textContent = message;
        mount.replaceChildren(fallback);
      });
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
      var id =
        entry && typeof entry.id === "string"
          ? entry.id.trim().toLowerCase()
          : "";
      if (!themeIDPattern.test(id) || seen[id]) {
        throw new Error("Invalid Graflume engine theme entry.");
      }
      seen[id] = true;
      return id;
    });
    return { ids: ids, themeByID: seen };
  }

  var registryNode = root.querySelector(
    'script[data-graflume-theme-registry][type="application/json"]',
  );
  var themeRegistry = null;
  try {
    var registryDocument = JSON.parse(
      registryNode ? registryNode.textContent || "null" : "null",
    );
    if (
      registryDocument &&
      registryDocument.schema === "statground.graflume.theme-registry.v1" &&
      Array.isArray(registryDocument.themes) &&
      registryDocument.themes.length > 0 &&
      registryDocument.themes.length <= 32
    ) {
      var themeByID = Object.create(null);
      var themes = [];
      var validThemes = true;
      registryDocument.themes.forEach(function (theme) {
        var id =
          theme && typeof theme.id === "string"
            ? theme.id.trim().toLowerCase()
            : "";
        var label =
          theme && typeof theme.label === "string" ? theme.label.trim() : "";
        if (!themeIDPattern.test(id) || !label || themeByID[id]) {
          validThemes = false;
          return;
        }
        themeByID[id] = true;
        themes.push(id);
      });
      var defaultTheme =
        typeof registryDocument.defaultTheme === "string"
          ? registryDocument.defaultTheme.trim().toLowerCase()
          : "";
      var errorLabel =
        typeof registryDocument.errorLabel === "string"
          ? registryDocument.errorLabel.trim().slice(0, 240)
          : "";
      var engineCatalogs = [window.Graflume, window.GraflumeSpatial]
        .map(readEngineThemeCatalog)
        .filter(Boolean);
      var compatibleThemes = themes.filter(function (id) {
        return engineCatalogs.every(function (catalog) {
          return catalog.themeByID[id];
        });
      });
      var supportedThemeByID = Object.create(null);
      compatibleThemes.forEach(function (id) {
        supportedThemeByID[id] = true;
      });
      var drift = engineCatalogs.some(function (catalog) {
        return (
          catalog.ids.length !== themes.length ||
          catalog.ids.some(function (id, index) {
            return id !== themes[index];
          })
        );
      });
      if (validThemes && errorLabel && supportedThemeByID[defaultTheme]) {
        themeRegistry = {
          defaultTheme: defaultTheme,
          drift: drift,
          errorLabel: errorLabel,
          themeByID: supportedThemeByID,
        };
      }
    }
  } catch (_error) {
    themeRegistry = null;
  }
  if (!themeRegistry) {
    root.dataset.graflumeThemeRegistryState = "invalid";
    failThemeRegistryPanels(themeRegistryError());
    return;
  }
  root.dataset.graflumeThemeRegistryState = themeRegistry.drift
    ? "drift"
    : "ready";
  if (themeRegistry.drift) themeRegistryError(themeRegistry.errorLabel);
  root.dataset.graflumeChartManualBound = "true";

  var panels = Array.prototype.slice.call(
    root.querySelectorAll("[data-graflume-chart-example]"),
  );
  var allTabs = Array.prototype.slice.call(
    root.querySelectorAll("[data-graflume-example-tab]"),
  );
  var states = new Map();
  var activePanels = new Map();
  var exampleGroups = [];
  var alwaysPanels = [];
  var permanentlyDestroyed = false;
  var themeEvent = "graflume:themechange";

  function normalizeTheme(value) {
    var candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
    return themeRegistry.themeByID[candidate] ? candidate : "";
  }

  var currentTheme =
    normalizeTheme(root.getAttribute("data-graflume-theme")) ||
    themeRegistry.defaultTheme;

  function copy(key, fallback, maximumLength) {
    var value = root.dataset ? root.dataset[key] : "";
    var resolved =
      typeof value === "string" && value.trim() ? value.trim() : fallback;
    return resolved.slice(0, maximumLength || 240);
  }

  var adaptiveRegistry = null;
  var adaptiveProfileIDPattern = /^[a-z][a-z0-9-]{0,63}$/;
  var adaptiveCapabilityPattern = /^[a-z][a-z0-9-]{0,63}$/;

  function readAdaptiveRegistry() {
    var node = root.querySelector(
      'script[data-graflume-adaptive-registry][type="application/json"]',
    );
    if (!node) return null;
    var documentValue = JSON.parse(node.textContent || "null");
    if (
      !documentValue ||
      documentValue.schema !==
        "statground.graflume.adaptive-device-registry.v1" ||
      documentValue.sourceContractVersion !== "0.1" ||
      (documentValue.sourceCommit !== "WORKTREE" &&
        !/^[0-9a-f]{40}$/.test(documentValue.sourceCommit || "")) ||
      !Array.isArray(documentValue.profiles) ||
      documentValue.profiles.length === 0 ||
      documentValue.profiles.length > 32
    ) {
      throw new Error("Invalid adaptive-device registry.");
    }
    var profileByID = Object.create(null);
    var profiles = documentValue.profiles.map(function (entry) {
      var id =
        entry && typeof entry.id === "string"
          ? entry.id.trim().toLowerCase()
          : "";
      var capabilities = entry && entry.capabilities;
      if (
        !adaptiveProfileIDPattern.test(id) ||
        profileByID[id] ||
        !Number.isInteger(entry.viewportWidth) ||
        entry.viewportWidth < 160 ||
        entry.viewportWidth > 7680 ||
        !Number.isInteger(entry.viewportHeight) ||
        entry.viewportHeight < 160 ||
        entry.viewportHeight > 4320 ||
        !Number.isInteger(entry.chartHeight) ||
        entry.chartHeight < 180 ||
        entry.chartHeight > 620 ||
        !Array.isArray(capabilities) ||
        capabilities.length === 0 ||
        capabilities.some(function (value) {
          return (
            typeof value !== "string" || !adaptiveCapabilityPattern.test(value)
          );
        })
      ) {
        throw new Error("Invalid adaptive-device profile.");
      }
      var profile = {
        id: id,
        viewportWidth: entry.viewportWidth,
        viewportHeight: entry.viewportHeight,
        chartHeight: entry.chartHeight,
        capabilities: capabilities.slice(),
      };
      profileByID[id] = profile;
      return profile;
    });
    var defaultProfile =
      typeof documentValue.defaultProfile === "string"
        ? documentValue.defaultProfile.trim().toLowerCase()
        : "";
    if (!profileByID[defaultProfile]) {
      throw new Error("Adaptive-device default profile is invalid.");
    }
    return {
      defaultProfile: defaultProfile,
      profileByID: profileByID,
      profiles: profiles,
    };
  }

  function adaptiveProfileForPanel(panel) {
    if (!adaptiveRegistry || !panel) return null;
    var id = (panel.dataset.graflumeAdaptiveProfile || "").toLowerCase();
    return adaptiveRegistry.profileByID[id] || null;
  }

  function applyAdaptiveProfileOptions(panel, options, runtimeName) {
    var profile = adaptiveProfileForPanel(panel);
    if (!profile) return;
    if (!options.create || typeof options.create !== "object") {
      options.create = {};
    }
    options.create.adaptive = { profiles: profile.id };
    if (runtimeName === "spatial") {
      options.create.height = profile.chartHeight;
    } else {
      options.height = profile.chartHeight;
    }
    panel.dataset.graflumeAdaptiveRuntimeProfile = profile.id;
  }

  function recipeError(message) {
    var error = new Error(message);
    error.graflumeManualCategory = "payload-invalid";
    return error;
  }

  function demoRecipeFromPayload(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }
    if (value.schema === dataRecipeV2Schema) {
      if (
        !value.recipe ||
        typeof value.recipe !== "object" ||
        Array.isArray(value.recipe)
      ) {
        throw recipeError("Demo recipe payload is invalid.");
      }
      return value.recipe;
    }
    if (
      value.version === 2 &&
      typeof value.id === "string" &&
      value.cardinality &&
      value.outputBudget
    ) {
      return value;
    }
    return null;
  }

  function sameJSONValue(left, right) {
    if (left === right) return true;
    if (typeof left !== typeof right || left === null || right === null) {
      return false;
    }
    if (Array.isArray(left) || Array.isArray(right)) {
      return (
        Array.isArray(left) &&
        Array.isArray(right) &&
        left.length === right.length &&
        left.every(function (entry, index) {
          return sameJSONValue(entry, right[index]);
        })
      );
    }
    if (typeof left !== "object") return false;
    var leftKeys = Object.keys(left).sort();
    var rightKeys = Object.keys(right).sort();
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(function (key, index) {
        return key === rightKeys[index] && sameJSONValue(left[key], right[key]);
      })
    );
  }

  function validatedDemoMaterialization(value, api) {
    var recipe = demoRecipeFromPayload(value);
    if (!recipe) return null;
    if (!api || typeof api.materializeDemoRecipe !== "function") {
      throw categorizedError(
        "runtime-contract",
        "The pinned Graflume runtime does not expose the demo recipe materializer.",
      );
    }
    var materialized;
    try {
      materialized = api.materializeDemoRecipe(recipe);
    } catch (error) {
      throw categorizedError(
        "payload-invalid",
        error && typeof error.message === "string"
          ? error.message
          : "The demo recipe could not be materialized.",
      );
    }
    var plan = materialized && materialized.plan;
    var previewRows = materialized && materialized.previewRows;
    if (
      !materialized ||
      typeof materialized !== "object" ||
      typeof materialized.data === "undefined" ||
      !Array.isArray(previewRows) ||
      previewRows.length > 12 ||
      !plan ||
      typeof plan !== "object" ||
      !Number.isSafeInteger(plan.sourceRows) ||
      !Number.isSafeInteger(plan.generatedRows) ||
      !Number.isSafeInteger(plan.processedRows) ||
      !Number.isSafeInteger(plan.derivedRows) ||
      !Number.isSafeInteger(plan.renderedRows) ||
      !Number.isSafeInteger(plan.renderedMaximum) ||
      plan.sourceRows < 1 ||
      plan.generatedRows !== plan.sourceRows ||
      plan.processedRows !== plan.sourceRows ||
      plan.derivedRows < 1 ||
      plan.renderedRows < 1 ||
      plan.renderedRows > plan.renderedMaximum ||
      plan.derivedRows > plan.renderedMaximum
    ) {
      throw categorizedError(
        "payload-invalid",
        "Graflume returned an invalid demo materialization plan.",
      );
    }
    if (
      plan.recipeId !== recipe.id ||
      plan.seed !== recipe.seed ||
      plan.sourceRows !== recipe.cardinality.sourceRows ||
      plan.renderedMaximum !== recipe.outputBudget.maximum ||
      !sameJSONValue(plan.reduction, recipe.reduction) ||
      !sameJSONValue(plan.budget, recipe.outputBudget) ||
      previewRows.length > recipe.preview.maximumRows
    ) {
      throw categorizedError(
        "payload-invalid",
        "Graflume returned a demo plan that does not match its recipe.",
      );
    }
    return materialized;
  }

  function updateMaterializationPlan(panel, plan) {
    var host = panel.querySelector("[data-graflume-data-plan]");
    if (!host || !plan) return;
    var values = {
      source: plan.sourceRows,
      generated: plan.generatedRows,
      processed: plan.processedRows,
      derived: plan.derivedRows,
      rendered: plan.renderedRows,
      maximum: plan.renderedMaximum,
      reduction:
        plan.reduction && typeof plan.reduction.method === "string"
          ? plan.reduction.method
          : "",
      resource:
        plan.budget && typeof plan.budget.resource === "string"
          ? plan.budget.resource
          : "",
    };
    Object.keys(values).forEach(function (key) {
      var node = host.querySelector("[data-graflume-plan-" + key + "]");
      if (node) node.textContent = String(values[key]);
    });
    host.dataset.graflumePlanState = "ready";
  }

  function elementFor(panel, datasetKey) {
    var id = panel.dataset ? panel.dataset[datasetKey] : "";
    return id ? document.getElementById(id) : null;
  }

  function readJSON(panel, datasetKey, label) {
    var node = elementFor(panel, datasetKey);
    if (!node) {
      throw categorizedError("payload-invalid", label + " payload is missing.");
    }
    var value;
    try {
      value = JSON.parse(node.textContent || "null");
    } catch (_error) {
      throw categorizedError("payload-invalid", label + " payload is invalid.");
    }
    if (value === null || typeof value !== "object") {
      throw categorizedError("payload-invalid", label + " payload is invalid.");
    }
    return value;
  }

  function setStatus(panel, message, state) {
    var status = elementFor(panel, "graflumeStatusId");
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function syncRootState() {
    var visible = panels.filter(function (panel) {
      return !panel.hidden;
    });
    var errorPanel = visible.find(function (panel) {
      return panel.dataset.graflumeExampleState === "error";
    });
    if (errorPanel) {
      root.dataset.graflumeChartManualState = "error";
      root.dataset.graflumeChartManualErrorCategory =
        errorPanel.dataset.graflumeErrorCategory || "render-failed";
      return;
    }
    delete root.dataset.graflumeChartManualErrorCategory;
    if (
      visible.some(function (panel) {
        return panel.dataset.graflumeExampleState === "loading";
      })
    ) {
      root.dataset.graflumeChartManualState = "loading";
      return;
    }
    root.dataset.graflumeChartManualState = "ready";
  }

  function removeRetryButton(panel) {
    var retry = panel.querySelector("[data-graflume-example-retry]");
    if (retry) retry.remove();
  }

  function showRetryButton(panel) {
    var status = elementFor(panel, "graflumeStatusId");
    if (!status || !status.parentElement) return;
    var retry = panel.querySelector("[data-graflume-example-retry]");
    if (!retry) {
      retry = document.createElement("button");
      retry.type = "button";
      retry.className = "sg-graflume-example-retry";
      retry.setAttribute("data-graflume-example-retry", "");
      retry.addEventListener("click", function () {
        retryPanel(panel);
      });
      status.parentElement.appendChild(retry);
    }
    retry.textContent = copy("graflumeRetry", "Try again", 120);
  }

  function panelErrorMessage(category) {
    var fallback = copy(
      "graflumeError",
      "The chart could not be rendered.",
      240,
    );
    if (category === "runtime-unavailable") {
      return copy("graflumeRuntimeUnavailable", fallback, 240);
    }
    if (category === "payload-invalid") {
      return copy("graflumePayloadInvalid", fallback, 240);
    }
    if (category === "spec-invalid") {
      return copy("graflumeSpecInvalid", fallback, 240);
    }
    if (category === "runtime-contract") {
      return copy("graflumeRuntimeContract", fallback, 240);
    }
    if (category === "render-failed") {
      return copy("graflumeRenderFailed", fallback, 240);
    }
    if (category === "spatial-unavailable") {
      return copy("graflumeWebglUnavailable", fallback, 240);
    }
    if (category === "context-lost") {
      return copy("graflumeContextLost", fallback, 240);
    }
    return fallback;
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

  function setErrorState(panel, category, replaceMount) {
    var state = states.get(panel);
    if (state) state.lastErrorCategory = category;
    panel.dataset.graflumeExampleState = "error";
    panel.dataset.graflumeErrorCategory = category;
    var message = panelErrorMessage(category);
    setStatus(panel, message, "error");
    showRetryButton(panel);
    if (replaceMount) showError(panel, message);
    syncRootState();
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

  var tableActionSchema = "statground.graflume.table-action-demo.v1";
  var tableActionNames = {
    read: true,
    edit: true,
    undo: true,
    redo: true,
    reset: true,
    "export-csv": true,
    "export-json": true,
  };
  var tableActionLabelNames = [
    "title",
    "summary",
    "editLabel",
    "apply",
    "undo",
    "redo",
    "reset",
    "refresh",
    "downloadCSV",
    "downloadJSON",
    "sourceRows",
    "viewRows",
    "result",
    "ready",
    "applied",
    "rejected",
    "unavailable",
    "noChange",
    "downloaded",
  ];

  function tableActionMetadata(panel) {
    var value = readJSON(
      panel,
      "graflumeTableActionsPayloadId",
      "Table actions",
    );
    var allowedKeys = {
      schema: true,
      layerId: true,
      keyField: true,
      targetKey: true,
      field: true,
      inputType: true,
      initialValue: true,
      csvMode: true,
      jsonMode: true,
      operations: true,
      labels: true,
    };
    var identifier = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
    var valid =
      value.schema === tableActionSchema &&
      /^layer-[0-9]{1,3}$/.test(value.layerId || "") &&
      identifier.test(value.keyField || "") &&
      identifier.test(value.field || "") &&
      typeof value.targetKey === "string" &&
      value.targetKey.length > 0 &&
      value.targetKey.length <= 80 &&
      value.inputType === "integer" &&
      Number.isSafeInteger(value.initialValue) &&
      value.csvMode === "view" &&
      value.jsonMode === "source" &&
      Array.isArray(value.operations) &&
      value.operations.length > 0 &&
      value.operations.length <= Object.keys(tableActionNames).length &&
      value.labels &&
      typeof value.labels === "object" &&
      !Array.isArray(value.labels) &&
      Object.keys(value).every(function (key) {
        return allowedKeys[key] === true;
      });
    var seen = Object.create(null);
    if (valid) {
      valid = value.operations.every(function (operation) {
        if (
          typeof operation !== "string" ||
          !tableActionNames[operation] ||
          seen[operation]
        ) {
          return false;
        }
        seen[operation] = true;
        return true;
      });
    }
    if (valid) {
      valid =
        Object.keys(value.labels).every(function (key) {
          return tableActionLabelNames.indexOf(key) >= 0;
        }) &&
        tableActionLabelNames.every(function (key) {
          return (
            typeof value.labels[key] === "string" &&
            value.labels[key].trim().length > 0 &&
            value.labels[key].length <= 300
          );
        });
    }
    if (!valid) {
      throw categorizedError(
        "payload-invalid",
        "The Table action payload is invalid.",
      );
    }
    value.operationSet = seen;
    return value;
  }

  function tableActionHost(panel) {
    return panel.querySelector("[data-graflume-table-actions]");
  }

  function setTableActionResult(state, message, eventText, status) {
    var host = tableActionHost(state.panel);
    if (!host) return;
    host.dataset.graflumeTableActionsState = status || "ready";
    var result = host.querySelector("[data-graflume-table-action-result]");
    var eventNode = host.querySelector("[data-graflume-table-action-event]");
    if (result) result.textContent = String(message || "").slice(0, 300);
    if (eventNode && typeof eventText === "string") {
      eventNode.textContent = eventText.slice(0, 300);
    }
  }

  function setTableActionControlsEnabled(state, enabled) {
    var host = tableActionHost(state.panel);
    if (!host) return;
    host
      .querySelectorAll("[data-graflume-table-action]")
      .forEach(function (button) {
        var action = button.dataset.graflumeTableAction || "";
        button.disabled = !(
          enabled &&
          state.tableActionMetadata &&
          state.tableActionMetadata.operationSet[action]
        );
      });
  }

  function shortTableActionValue(value) {
    if (value === null) return "null";
    if (
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean"
    ) {
      return "[value]";
    }
    return String(value)
      .replace(/[\r\n\t]+/g, " ")
      .slice(0, 80);
  }

  function updateTableActionCounts(state) {
    var host = tableActionHost(state.panel);
    if (!host || !state.chart || !state.tableActionMetadata) return;
    var layerID = state.tableActionMetadata.layerId;
    var source = state.chart.getTableData(layerID, "source");
    var view = state.chart.getTableData(layerID, "view");
    if (!Array.isArray(source) || !Array.isArray(view)) {
      throw new Error("Graflume returned invalid Table row data.");
    }
    var sourceNode = host.querySelector('[data-graflume-table-count="source"]');
    var viewNode = host.querySelector('[data-graflume-table-count="view"]');
    if (sourceNode) sourceNode.textContent = String(source.length);
    if (viewNode) viewNode.textContent = String(view.length);
    return { source: source.length, view: view.length };
  }

  function requiredTableActionMethods(chart, metadata) {
    var methods = { read: "getTableData" };
    if (metadata.operationSet.edit) methods.edit = "setTableCellValue";
    if (metadata.operationSet.undo) methods.undo = "undoTableEdit";
    if (metadata.operationSet.redo) methods.redo = "redoTableEdit";
    if (metadata.operationSet.reset) methods.reset = "resetTableData";
    if (metadata.operationSet["export-csv"])
      methods["export-csv"] = "exportTableCSV";
    if (metadata.operationSet["export-json"])
      methods["export-json"] = "exportTableJSON";
    if (typeof chart.on !== "function") {
      throw categorizedError(
        "runtime-contract",
        "The pinned Graflume runtime is missing Table action events.",
      );
    }
    Object.keys(methods).forEach(function (action) {
      if (typeof chart[methods[action]] !== "function") {
        throw categorizedError(
          "runtime-contract",
          "The pinned Graflume runtime is missing a Table action API.",
        );
      }
    });
  }

  function tableActionDownload(state, action) {
    var metadata = state.tableActionMetadata;
    var content;
    var mime;
    var extension;
    if (action === "export-csv") {
      content = state.chart.exportTableCSV(metadata.layerId, metadata.csvMode);
      mime = "text/csv;charset=utf-8";
      extension = "csv";
    } else {
      content = state.chart.exportTableJSON(
        metadata.layerId,
        metadata.jsonMode,
      );
      mime = "application/json;charset=utf-8";
      extension = "json";
    }
    if (typeof content !== "string" || content.length > 5 * 1024 * 1024) {
      throw new Error("Graflume returned an invalid Table export.");
    }
    downloadBlob(state.panel, content, mime, extension);
    setTableActionResult(
      state,
      metadata.labels.downloaded,
      action + " · " + content.length + " bytes",
      "ready",
    );
  }

  function runTableAction(state, action) {
    var metadata = state.tableActionMetadata;
    if (
      !metadata ||
      !metadata.operationSet[action] ||
      !state.chart ||
      state.panel.hidden ||
      state.generation !== state.tableActionGeneration
    ) {
      return;
    }
    try {
      var changed = false;
      if (action === "read") {
        var counts = updateTableActionCounts(state);
        setTableActionResult(
          state,
          metadata.labels.ready,
          "source=" + counts.source + " · view=" + counts.view,
          "ready",
        );
        return;
      }
      if (action === "edit") {
        var host = tableActionHost(state.panel);
        var input =
          host && host.querySelector("[data-graflume-table-action-value]");
        var raw = input ? input.value.trim() : "";
        var numeric = Number(raw);
        var nextValue =
          raw !== "" && Number.isSafeInteger(numeric) ? numeric : raw;
        changed = state.chart.setTableCellValue(
          metadata.layerId,
          { key: metadata.targetKey },
          metadata.field,
          nextValue,
        );
      } else if (action === "undo") {
        changed = state.chart.undoTableEdit(metadata.layerId);
      } else if (action === "redo") {
        changed = state.chart.redoTableEdit(metadata.layerId);
      } else if (action === "reset") {
        changed = state.chart.resetTableData(metadata.layerId);
      } else if (action === "export-csv" || action === "export-json") {
        tableActionDownload(state, action);
        return;
      }
      updateTableActionCounts(state);
      if (action === "edit") {
        // setTableCellValue emits the authoritative validation event
        // synchronously. Keep that bounded event summary instead of replacing
        // it with a less specific button result.
        return;
      }
      setTableActionResult(
        state,
        changed ? metadata.labels.applied : metadata.labels.noChange,
        action + " · " + (changed ? "changed" : "unchanged"),
        changed ? "ready" : "unchanged",
      );
    } catch (_error) {
      setTableActionResult(
        state,
        metadata.labels.unavailable,
        action + " · unavailable",
        "error",
      );
    }
  }

  function bindTableActions(state) {
    var host = tableActionHost(state.panel);
    if (!host || state.tableActionsBound) return;
    state.tableActionsBound = true;
    host
      .querySelectorAll("[data-graflume-table-action]")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          runTableAction(state, button.dataset.graflumeTableAction || "");
        });
      });
    var input = host.querySelector("[data-graflume-table-action-value]");
    if (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          runTableAction(state, "edit");
        }
      });
    }
  }

  function initializeTableActions(state, generation) {
    var host = tableActionHost(state.panel);
    if (!host) return;
    var metadata = tableActionMetadata(state.panel);
    requiredTableActionMethods(state.chart, metadata);
    state.tableActionMetadata = metadata;
    state.tableActionGeneration = generation;
    bindTableActions(state);
    setTableActionControlsEnabled(state, true);
    updateTableActionCounts(state);
    state.unsubscribeTableEdit = state.chart.on(
      "tableeditchange",
      function (event) {
        if (
          state.generation !== generation ||
          !state.chart ||
          !event ||
          event.layerId !== metadata.layerId
        ) {
          return;
        }
        updateTableActionCounts(state);
        var message = event.valid
          ? metadata.labels.applied
          : metadata.labels.rejected;
        var eventText =
          "row=" +
          String(event.row) +
          " · " +
          String(event.field || "").slice(0, 64) +
          " · " +
          shortTableActionValue(event.previousValue) +
          " → " +
          shortTableActionValue(event.newValue) +
          " · " +
          String(event.reason || "").slice(0, 64);
        setTableActionResult(
          state,
          message,
          eventText,
          event.valid ? "ready" : "rejected",
        );
      },
    );
    setTableActionResult(state, metadata.labels.ready, "ready", "ready");
  }

  function tableVisible(dataPanel) {
    return dataPanel.tagName === "DETAILS" ? dataPanel.open : !dataPanel.hidden;
  }

  function tableControls(panel) {
    return Array.prototype.slice.call(
      panel.querySelectorAll(
        "[data-graflume-table-toggle], [data-graflume-table-toggle-proxy]",
      ),
    );
  }

  function activeTableControl(panel) {
    return (
      panel.querySelector("[data-graflume-table-toggle-proxy]:not([hidden])") ||
      panel.querySelector("[data-graflume-table-toggle]:not([hidden])")
    );
  }

  function setTableVisible(panel, visible, focusTarget) {
    var dataPanel = elementFor(panel, "graflumeDataPanelId");
    var source = panel.querySelector("[data-graflume-table-toggle]");
    if (!dataPanel || !source) return;
    var label = visible ? source.dataset.hideLabel : source.dataset.showLabel;
    if (dataPanel.tagName === "DETAILS") dataPanel.open = visible;
    else dataPanel.hidden = !visible;
    dataPanel.dataset.state = visible ? "open" : "closed";
    tableControls(panel).forEach(function (toggle) {
      toggle.setAttribute("aria-expanded", visible ? "true" : "false");
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
      var visibleLabel = toggle.querySelector(
        "[data-graflume-table-toggle-label]",
      );
      if (visibleLabel) visibleLabel.textContent = label;
    });
    if (focusTarget === "panel" && visible) dataPanel.focus();
    if (focusTarget === "toggle" && !visible) {
      var toggle = activeTableControl(panel);
      if (toggle) toggle.focus();
    }
  }

  function bindTableControl(panel, toggle) {
    if (!toggle || toggle.dataset.graflumeTableControlBound === "true") return;
    toggle.dataset.graflumeTableControlBound = "true";
    toggle.addEventListener("click", function () {
      var dataPanel = elementFor(panel, "graflumeDataPanelId");
      if (!dataPanel) return;
      var visible = tableVisible(dataPanel);
      setTableVisible(panel, !visible, visible ? "toggle" : "panel");
    });
  }

  function nativeTableToolbar(panel) {
    var mount = elementFor(panel, "graflumeMountId");
    if (!mount) return null;
    var spatial = mount.querySelector("[data-graflume-spatial-controls]");
    if (spatial && spatial.querySelector("[data-graflume-spatial-control]")) {
      return spatial;
    }
    var strips = Array.prototype.slice.call(
      mount.querySelectorAll("[data-graflume-controls-strip]"),
    );
    return (
      strips.find(function (strip) {
        return strip.querySelector(
          "[data-graflume-control]:not([data-graflume-table-toggle-proxy])",
        );
      }) || null
    );
  }

  function installTableControl(panel) {
    var source = panel.querySelector("[data-graflume-table-toggle]");
    var dataPanel = elementFor(panel, "graflumeDataPanelId");
    if (!source || !dataPanel) return false;
    source.hidden = true;
    var toolbar = nativeTableToolbar(panel);
    var existing = panel.querySelector("[data-graflume-table-toggle-proxy]");
    if (!toolbar) {
      if (existing) existing.remove();
      setTableVisible(panel, false);
      return false;
    }
    if (existing && existing.parentElement === toolbar) return true;
    if (existing) existing.remove();
    var proxy = source.cloneNode(true);
    proxy.hidden = false;
    proxy.removeAttribute("data-graflume-table-toggle");
    proxy.setAttribute("data-graflume-table-toggle-proxy", "true");
    proxy.className = "graflume-controls__button";
    proxy.dataset.graflumeControl = "data-table";
    var visibleLabel = proxy.querySelector(
      "[data-graflume-table-toggle-label]",
    );
    if (visibleLabel) visibleLabel.remove();
    bindTableControl(panel, proxy);
    toolbar.appendChild(proxy);
    source.hidden = true;
    setTableVisible(panel, tableVisible(dataPanel));
    return true;
  }

  function observeTableControl(panel, state) {
    if (
      state.tableControlObserver ||
      typeof window.MutationObserver !== "function"
    )
      return;
    var mount = elementFor(panel, "graflumeMountId");
    if (!mount) return;
    state.tableControlObserver = new window.MutationObserver(function () {
      installTableControl(panel);
    });
    state.tableControlObserver.observe(mount, {
      childList: true,
      subtree: true,
    });
  }

  function initializeHostControls(panel, state) {
    installTableControl(panel);
    observeTableControl(panel, state);
    if (state.hostControlsReady) return;
    state.hostControlsReady = true;
    var dataPanel = elementFor(panel, "graflumeDataPanelId");
    var tableToggle = panel.querySelector("[data-graflume-table-toggle]");
    if (tableToggle && dataPanel) {
      tableToggle.hidden = true;
      bindTableControl(panel, tableToggle);
      setTableVisible(panel, tableVisible(dataPanel));
      if (dataPanel.tagName === "DETAILS") {
        dataPanel.addEventListener("toggle", function () {
          setTableVisible(panel, dataPanel.open);
        });
      }
      var closeButton = dataPanel.querySelector("[data-graflume-table-close]");
      if (closeButton) {
        closeButton.addEventListener("click", function () {
          setTableVisible(panel, false, "toggle");
        });
      }
      dataPanel.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && tableVisible(dataPanel)) {
          event.preventDefault();
          setTableVisible(panel, false, "toggle");
        }
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
        throw categorizedError(
          "runtime-contract",
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

  function cancelPendingRetry(state) {
    if (!state) return;
    if (state.retryFrame) window.cancelAnimationFrame(state.retryFrame);
    if (state.retryTimer) window.clearTimeout(state.retryTimer);
    state.retryFrame = 0;
    state.retryTimer = 0;
  }

  function reportCleanupError(label, error) {
    if (window.console && typeof window.console.error === "function") {
      window.console.error(label, error);
    }
  }

  function releaseStateResources(state) {
    if (!state) return;
    if (state.resizeFrame) window.cancelAnimationFrame(state.resizeFrame);
    state.resizeFrame = 0;
    if (state.resizeObserver) {
      try {
        state.resizeObserver.disconnect();
      } catch (error) {
        reportCleanupError("Graflume ResizeObserver cleanup failed.", error);
      }
    }
    state.resizeObserver = null;
    if (typeof state.unsubscribeAvailability === "function") {
      try {
        state.unsubscribeAvailability();
      } catch (error) {
        reportCleanupError("Graflume availability cleanup failed.", error);
      }
    }
    state.unsubscribeAvailability = null;
    if (typeof state.unsubscribePlayback === "function") {
      try {
        state.unsubscribePlayback();
      } catch (error) {
        reportCleanupError("Graflume playback cleanup failed.", error);
      }
    }
    state.unsubscribePlayback = null;
    if (typeof state.unsubscribeTableEdit === "function") {
      try {
        state.unsubscribeTableEdit();
      } catch (error) {
        reportCleanupError("Graflume Table action cleanup failed.", error);
      }
    }
    state.unsubscribeTableEdit = null;
    state.tableActionGeneration = -1;
    setTableActionControlsEnabled(state, false);
    if (state.tableControlObserver) {
      try {
        state.tableControlObserver.disconnect();
      } catch (error) {
        reportCleanupError(
          "Graflume table-control observer cleanup failed.",
          error,
        );
      }
    }
    state.tableControlObserver = null;
    var chart = state.chart;
    state.chart = null;
    if (chart && typeof chart.destroy === "function") {
      try {
        chart.destroy();
      } catch (error) {
        reportCleanupError("Graflume chart cleanup failed.", error);
      }
    }
  }

  function scheduleResize(state) {
    if (!state || !state.chart || state.panel.hidden || state.resizeFrame)
      return;
    var generation = state.generation;
    state.resizeFrame = window.requestAnimationFrame(function () {
      state.resizeFrame = 0;
      if (
        state.generation === generation &&
        state.chart &&
        !state.panel.hidden &&
        typeof state.chart.resize === "function"
      ) {
        state.chart.resize();
      }
    });
  }

  function destroyState(state) {
    if (!state) return;
    state.generation += 1;
    cancelPendingRetry(state);
    releaseStateResources(state);
  }

  function runtimeAPI(name) {
    return name === "spatial" ? window.GraflumeSpatial : window.Graflume;
  }

  function runtimeFor(panel) {
    var name = panel.dataset.graflumeRuntime || "core";
    if (name === "spatial") {
      return { name: name, api: runtimeAPI(name) };
    }
    return { name: "core", api: runtimeAPI("core") };
  }

  function runtimeScript(name) {
    var declared = document.querySelector(
      'script[data-graflume-runtime-script="' + name + '"][src]',
    );
    if (declared) return declared;
    var suffix =
      name === "spatial"
        ? "/cdn/graflume.spatial.global.js"
        : "/cdn/graflume.complete.global.js";
    return Array.prototype.find.call(
      document.querySelectorAll("script[src]"),
      function (script) {
        var source = script.getAttribute("src") || "";
        try {
          return new window.URL(source, window.location.href).pathname.endsWith(
            suffix,
          );
        } catch (_error) {
          return false;
        }
      },
    );
  }

  function retryRuntimePanels(name) {
    states.forEach(function (state, panel) {
      if (
        !panel.hidden &&
        !state.chart &&
        state.lastErrorCategory === "runtime-unavailable" &&
        runtimeFor(panel).name === name
      ) {
        renderPanel(panel);
      }
    });
  }

  function requestRuntimeReload(name, userInitiated) {
    if (runtimeAPI(name) || runtimeReloads[name]) return;
    var maximumAttempts = userInitiated ? 3 : 1;
    if (runtimeReloadAttempts[name] >= maximumAttempts) return;
    var source = runtimeScript(name);
    if (!source || !source.src) return;
    var loader = document.createElement("script");
    loader.async = true;
    loader.src = source.src;
    ["integrity", "crossorigin", "referrerpolicy"].forEach(function (name) {
      var value = source.getAttribute(name);
      if (value) loader.setAttribute(name, value);
    });
    if (source.nonce) loader.nonce = source.nonce;
    runtimeReloadAttempts[name] += 1;
    runtimeReloads[name] = loader;
    loader.addEventListener(
      "load",
      function () {
        runtimeReloads[name] = null;
        loader.remove();
        retryRuntimePanels(name);
      },
      { once: true },
    );
    loader.addEventListener(
      "error",
      function () {
        runtimeReloads[name] = null;
        loader.remove();
      },
      { once: true },
    );
    (document.head || document.documentElement).appendChild(loader);
  }

  function setReadyState(panel) {
    var state = states.get(panel);
    if (state) {
      state.lastErrorCategory = "";
      state.retryAttempt = 0;
    }
    panel.dataset.graflumeExampleState = "ready";
    delete panel.dataset.graflumeErrorCategory;
    removeRetryButton(panel);
    setStatus(panel, copy("graflumeReady", "Ready", 120), "ready");
    syncRootState();
  }

  function setLoadingState(panel) {
    panel.dataset.graflumeExampleState = "loading";
    delete panel.dataset.graflumeErrorCategory;
    removeRetryButton(panel);
    setStatus(panel, copy("graflumeLoading", "Loading", 120), "loading");
    syncRootState();
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
      setErrorState(
        panel,
        availability.status === "context-lost"
          ? "context-lost"
          : "spatial-unavailable",
        false,
      );
      return;
    }
    throw new Error(
      "Spatial availability status is unsupported: " + availability.status,
    );
  }

  function observeSpatialAvailability(panel, state, generation) {
    state.unsubscribeAvailability = state.chart.on(
      "availabilitychange",
      function (event) {
        if (state.generation !== generation || !state.chart) return;
        try {
          applySpatialAvailability(
            panel,
            event && event.state ? event.state : state.chart.getAvailability(),
          );
        } catch (error) {
          setErrorState(panel, "spatial-unavailable", false);
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

  function categorizedError(category, message) {
    var error = new Error(message);
    error.graflumeManualCategory = category;
    return error;
  }

  function classifyRenderError(error) {
    if (
      error &&
      typeof error.graflumeManualCategory === "string" &&
      /^(payload-invalid|runtime-unavailable|runtime-contract)$/.test(
        error.graflumeManualCategory,
      )
    ) {
      return error.graflumeManualCategory;
    }
    var message =
      error && typeof error.message === "string" ? error.message : "";
    if (
      /Invalid (?:SpatialSpec|ChartSpec)|Encoding must be|Unknown property|unsupported schema|validation error/i.test(
        message,
      )
    ) {
      return "spec-invalid";
    }
    return "render-failed";
  }

  function scheduleRuntimeRetry(state, transientState, generation) {
    if (
      permanentlyDestroyed ||
      state.generation !== generation ||
      state.panel.hidden ||
      state.retryAttempt >= runtimeRetrySchedule.length
    ) {
      return false;
    }
    var step = runtimeRetrySchedule[state.retryAttempt];
    state.retryAttempt += 1;
    setLoadingState(state.panel);
    var retry = function () {
      state.retryFrame = 0;
      state.retryTimer = 0;
      if (
        permanentlyDestroyed ||
        state.generation !== generation ||
        state.panel.hidden
      ) {
        return;
      }
      attemptRender(state, transientState, generation);
    };
    if (step === "frame") {
      state.retryFrame = window.requestAnimationFrame(retry);
    } else {
      state.retryTimer = window.setTimeout(retry, step);
    }
    return true;
  }

  function ensurePanelPayload(state, api) {
    if (state.payloadReady) return;
    state.panel.dataset.graflumePayloadState = "materializing";
    var rawData = readJSON(state.panel, "graflumeDataPayloadId", "Data");
    var materialized =
      state.materialization || validatedDemoMaterialization(rawData, api);
    if (materialized) state.materialization = materialized;
    state.data = materialized ? materialized.data : rawData;
    var authoredRows = state.panel.dataset.graflumeTableDataPayloadId
      ? readJSON(state.panel, "graflumeTableDataPayloadId", "Table data")
      : state.data;
    if (
      materialized &&
      !sameJSONValue(authoredRows, materialized.previewRows)
    ) {
      throw categorizedError(
        "payload-invalid",
        "The server-rendered preview does not match the pinned Graflume recipe.",
      );
    }
    state.rows = materialized ? materialized.previewRows : authoredRows;
    state.materializationPlan = materialized ? materialized.plan : null;
    state.fields = readJSON(state.panel, "graflumeFieldsPayloadId", "Fields");
    state.capabilities = readJSON(
      state.panel,
      "graflumeCapabilitiesPayloadId",
      "Capabilities",
    );
    if (!Array.isArray(state.rows)) {
      throw categorizedError(
        "payload-invalid",
        "Table data payload must be an array.",
      );
    }
    if (
      !Array.isArray(state.fields) ||
      state.fields.some(function (field) {
        return typeof field !== "string";
      })
    ) {
      throw categorizedError(
        "payload-invalid",
        "Fields payload must be an array of names.",
      );
    }
    if (
      state.capabilities.schema !== "statground.graflume.manual-capabilities.v1"
    ) {
      throw categorizedError(
        "payload-invalid",
        "Capabilities payload has an unsupported schema.",
      );
    }
    state.payloadReady = true;
    state.panel.dataset.graflumePayloadState = "ready";
    updateMaterializationPlan(state.panel, state.materializationPlan);
  }

  function attemptRender(state, transientState, generation) {
    var panel = state.panel;
    if (
      permanentlyDestroyed ||
      panel.hidden ||
      state.generation !== generation
    ) {
      return;
    }
    setLoadingState(panel);
    try {
      var mount = elementFor(panel, "graflumeMountId");
      var functionName = panel.dataset.graflumeChartApi || "";
      var runtime = runtimeFor(panel);
      if (!mount || !functionName) {
        throw categorizedError(
          "payload-invalid",
          "Graflume manual mount contract is invalid.",
        );
      }
      if (!runtime.api) {
        throw categorizedError(
          "runtime-unavailable",
          "Graflume runtime is unavailable.",
        );
      }
      if (typeof runtime.api[functionName] !== "function") {
        throw categorizedError(
          "runtime-contract",
          "Graflume Quick API is unavailable: " + functionName,
        );
      }
      ensurePanelPayload(state, runtime.api);
      var options = readJSON(panel, "graflumeOptionsPayloadId", "Options");
      options.theme = currentTheme;
      if (state.materializationPlan) {
        if (!options.create || typeof options.create !== "object") {
          options.create = {};
        }
        var adaptive =
          options.create.adaptive && typeof options.create.adaptive === "object"
            ? options.create.adaptive
            : {};
        var environment =
          adaptive.environment && typeof adaptive.environment === "object"
            ? adaptive.environment
            : {};
        environment.rowCount = state.materializationPlan.sourceRows;
        adaptive.environment = environment;
        adaptive.largeDataNavigation = true;
        options.create.adaptive = adaptive;
      }
      applyAdaptiveProfileOptions(panel, options, runtime.name);
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
        options.height = 620;
      }
      mount.replaceChildren();
      state.chart = runtime.api[functionName](
        "#" + mount.id,
        state.data,
        options,
      );
      if (!state.chart || typeof state.chart.destroy !== "function") {
        throw categorizedError(
          "runtime-contract",
          "Graflume did not return a chart instance.",
        );
      }
      var playbackEnabled = Boolean(
        runtime.name === "core" &&
        state.capabilities.core &&
        state.capabilities.core.playback,
      );
      requiredMethods(state.chart, runtime.name, playbackEnabled);
      restoreTransientState(state, runtime.name, transientState);
      initializeTableActions(state, generation);
      if (playbackEnabled && typeof state.chart.on === "function") {
        state.unsubscribePlayback = state.chart.on(
          "playbackchange",
          function (event) {
            if (state.generation !== generation || !state.chart) return;
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
        observeSpatialAvailability(panel, state, generation);
      } else {
        setReadyState(panel);
      }
      if (typeof window.ResizeObserver === "function") {
        state.resizeObserver = new window.ResizeObserver(function () {
          if (state.generation === generation) scheduleResize(state);
        });
        state.resizeObserver.observe(mount);
      }
    } catch (error) {
      if (
        !state.payloadReady &&
        panel.dataset.graflumePayloadState === "materializing"
      ) {
        panel.dataset.graflumePayloadState = "error";
      }
      releaseStateResources(state);
      var category = classifyRenderError(error);
      state.lastErrorCategory = category;
      if (category === "runtime-unavailable") {
        requestRuntimeReload(runtimeFor(panel).name, false);
        if (scheduleRuntimeRetry(state, transientState, generation)) return;
      }
      setErrorState(panel, category, true);
      if (window.console && typeof window.console.error === "function") {
        window.console.error("Graflume chart manual example failed.", error);
      }
    }
  }

  function renderPanel(panel, transientState) {
    if (
      panel &&
      panel.dataset.graflumeConfirmBeforeRender === "true" &&
      panel.dataset.graflumeConfirmed !== "true"
    ) {
      panel.dataset.graflumeConsentState = "pending";
      return;
    }
    var existing = states.get(panel);
    if (existing && existing.chart) {
      scheduleResize(existing);
      return;
    }
    var state = existing || {
      panel: panel,
      chart: null,
      generation: 0,
      resizeFrame: 0,
      retryFrame: 0,
      retryTimer: 0,
      retryAttempt: 0,
      resizeObserver: null,
      unsubscribePlayback: null,
      unsubscribeTableEdit: null,
      unsubscribeAvailability: null,
      tableControlObserver: null,
      hostControlsReady: false,
      tableActionsBound: false,
      tableActionMetadata: null,
      tableActionGeneration: -1,
      payloadReady: false,
      lastErrorCategory: "",
    };
    states.set(panel, state);
    cancelPendingRetry(state);
    state.generation += 1;
    state.retryAttempt = 0;
    state.lastErrorCategory = "";
    attemptRender(state, transientState, state.generation);
  }

  function retryPanel(panel) {
    if (permanentlyDestroyed || !panel || panel.hidden) return;
    var state = states.get(panel);
    var runtimeName = runtimeFor(panel).name;
    if (state) destroyState(state);
    requestRuntimeReload(runtimeName, true);
    renderPanel(panel);
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

  function confirmPanelActivation(panel) {
    if (
      !panel ||
      panel.dataset.graflumeConfirmBeforeRender !== "true" ||
      panel.dataset.graflumeConfirmed === "true"
    ) {
      return true;
    }
    panel.dataset.graflumeConsentState = "prompting";
    var message = copy(
      "graflumeVolumeConfirm",
      "This large-data example may take time to load. Load it now?",
      480,
    );
    var accepted = false;
    try {
      accepted =
        typeof window.confirm === "function" && window.confirm(message);
    } catch (_error) {
      accepted = false;
    }
    if (!accepted) {
      panel.dataset.graflumeConsentState = "declined";
      return false;
    }
    panel.dataset.graflumeConfirmed = "true";
    panel.dataset.graflumeConsentState = "accepted";
    return true;
  }

  function replaceThemeToken(node, theme) {
    if (!node) return;
    if (node.nodeType === 3) {
      var value = node.nodeValue || "";
      var quote = value.charAt(0);
      if (
        value.length >= 2 &&
        (quote === "'" || quote === '"' || quote === "`") &&
        value.charAt(value.length - 1) === quote &&
        normalizeTheme(value.slice(1, -1))
      ) {
        node.nodeValue = quote + theme + quote;
      }
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

  function nearestExampleGroup(node) {
    if (!node || typeof node.closest !== "function") return null;
    return node.closest("[data-graflume-example-group]");
  }

  function isBasicPanel(panel) {
    if (!panel) return false;
    if (
      panel.hasAttribute("data-graflume-basic-example") ||
      panel.dataset.graflumeExampleKind === "basic"
    ) {
      return true;
    }
    var group = nearestExampleGroup(panel);
    return Boolean(
      group && group.getAttribute("data-graflume-example-group") === "basic",
    );
  }

  function panelControlledBy(tab, groupElement) {
    var panelID = tab ? tab.getAttribute("aria-controls") : "";
    var panel = panelID ? document.getElementById(panelID) : null;
    if (!panel || !root.contains(panel) || isBasicPanel(panel)) return null;
    if (groupElement !== root && nearestExampleGroup(panel) !== groupElement) {
      return null;
    }
    return panel;
  }

  function createExampleGroup(element, groupTabs, candidatePanels) {
    var orderedPanels = [];
    var seen = new Set();
    groupTabs.forEach(function (tab) {
      var panel = panelControlledBy(tab, element);
      if (panel && !seen.has(panel)) {
        orderedPanels.push(panel);
        seen.add(panel);
      }
    });
    candidatePanels.forEach(function (panel) {
      if (!isBasicPanel(panel) && !seen.has(panel)) {
        orderedPanels.push(panel);
        seen.add(panel);
      }
    });
    return {
      element: element,
      tabs: groupTabs,
      panels: orderedPanels,
    };
  }

  function buildExampleGroups() {
    exampleGroups = [];
    alwaysPanels = [];
    activePanels.clear();
    var claimedPanels = new Set();
    var groupElements = Array.prototype.slice.call(
      root.querySelectorAll("[data-graflume-example-group]"),
    );

    groupElements.forEach(function (groupElement) {
      var groupName = groupElement.getAttribute("data-graflume-example-group");
      var groupPanels = Array.prototype.slice
        .call(groupElement.querySelectorAll("[data-graflume-chart-example]"))
        .filter(function (panel) {
          return nearestExampleGroup(panel) === groupElement;
        });
      if (groupName === "basic") {
        groupPanels.forEach(function (panel) {
          claimedPanels.add(panel);
          alwaysPanels.push(panel);
        });
        return;
      }
      var groupTabs = Array.prototype.slice
        .call(groupElement.querySelectorAll("[data-graflume-example-tab]"))
        .filter(function (tab) {
          return nearestExampleGroup(tab) === groupElement;
        });
      var group = createExampleGroup(groupElement, groupTabs, groupPanels);
      group.panels.forEach(function (panel) {
        claimedPanels.add(panel);
      });
      if (group.tabs.length > 0 && group.panels.length > 0) {
        exampleGroups.push(group);
      } else {
        group.panels.forEach(function (panel) {
          alwaysPanels.push(panel);
        });
      }
    });

    if (exampleGroups.length === 0 && allTabs.length > 0) {
      var legacyPanels = panels.filter(function (panel) {
        return !isBasicPanel(panel);
      });
      var legacyGroup = createExampleGroup(root, allTabs, legacyPanels);
      if (legacyGroup.panels.length > 0) {
        exampleGroups.push(legacyGroup);
        legacyGroup.panels.forEach(function (panel) {
          claimedPanels.add(panel);
        });
      }
    }

    panels.forEach(function (panel) {
      if (isBasicPanel(panel) || !claimedPanels.has(panel)) {
        if (alwaysPanels.indexOf(panel) === -1) alwaysPanels.push(panel);
      }
    });
  }

  function tabForPanel(group, panel) {
    for (var index = 0; index < group.tabs.length; index += 1) {
      if (panelControlledBy(group.tabs[index], group.element) === panel) {
        return group.tabs[index];
      }
    }
    return null;
  }

  function activateGroup(group, panel, focusTab, updateHash) {
    if (
      permanentlyDestroyed ||
      !group ||
      !panel ||
      group.panels.indexOf(panel) < 0
    ) {
      return false;
    }
    if (!confirmPanelActivation(panel)) {
      var retainedPanel = activePanels.get(group) || null;
      var retainedTab = retainedPanel
        ? tabForPanel(group, retainedPanel)
        : null;
      if (!retainedTab) {
        retainedTab = group.tabs.find(function (tab) {
          return tab.getAttribute("aria-selected") === "true";
        });
      }
      if (retainedTab && typeof retainedTab.focus === "function") {
        retainedTab.focus();
      }
      return false;
    }
    var previous = activePanels.get(group) || null;
    activePanels.set(group, panel);
    group.panels.forEach(function (candidate) {
      candidate.hidden = candidate !== panel;
    });
    group.tabs.forEach(function (tab) {
      styleTab(tab, panelControlledBy(tab, group.element) === panel);
    });
    if (previous && previous !== panel) {
      var previousState = states.get(previous);
      if (previousState) destroyState(previousState);
      previous.dataset.graflumeExampleState = "inactive";
    }
    renderPanel(panel);
    var activeTab = tabForPanel(group, panel);
    if (focusTab && activeTab) activeTab.focus();
    if (updateHash && window.history && panel.id) {
      replaceActiveHash(panel);
    }
    return true;
  }

  function visibleActivePanels() {
    var visible = [];
    var seen = new Set();
    alwaysPanels.forEach(function (panel) {
      if (!panel.hidden && !seen.has(panel)) {
        visible.push(panel);
        seen.add(panel);
      }
    });
    activePanels.forEach(function (panel) {
      if (panel && !panel.hidden && !seen.has(panel)) {
        visible.push(panel);
        seen.add(panel);
      }
    });
    return visible;
  }

  function handleThemeChange(event) {
    if (permanentlyDestroyed) return;
    var detail = event && event.detail;
    var nextTheme = normalizeTheme(detail && detail.theme);
    if (!nextTheme || nextTheme === currentTheme) return;
    var active = visibleActivePanels();
    var transientStates = new Map();
    active.forEach(function (panel) {
      var state = states.get(panel);
      var transientState = null;
      try {
        transientState = captureTransientState(state);
      } catch (error) {
        reportCleanupError("Graflume transient state capture failed.", error);
      }
      transientStates.set(panel, transientState);
      if (state) destroyState(state);
    });
    currentTheme = nextTheme;
    root.setAttribute("data-graflume-theme", currentTheme);
    syncAllVisibleThemes(currentTheme);
    active.forEach(function (panel) {
      renderPanel(panel, transientStates.get(panel));
    });
  }

  function selectedPanelForGroup(group, hash) {
    if (hash) {
      var hashPanel = document.getElementById(hash);
      if (hashPanel && group.panels.indexOf(hashPanel) >= 0) return hashPanel;
    }
    for (var index = 0; index < group.tabs.length; index += 1) {
      if (group.tabs[index].getAttribute("aria-selected") === "true") {
        var selected = panelControlledBy(group.tabs[index], group.element);
        if (selected) return selected;
      }
    }
    for (
      var panelIndex = 0;
      panelIndex < group.panels.length;
      panelIndex += 1
    ) {
      if (!group.panels[panelIndex].hidden) return group.panels[panelIndex];
    }
    return group.panels[0] || null;
  }

  function bindGroup(group) {
    group.tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        var panel = panelControlledBy(tab, group.element);
        if (panel) activateGroup(group, panel, false, true);
      });
      tab.addEventListener("keydown", function (event) {
        var next = index;
        var rtl = (document.documentElement.dir || "").toLowerCase() === "rtl";
        if (event.key === "ArrowRight") next = index + (rtl ? -1 : 1);
        else if (event.key === "ArrowLeft") next = index + (rtl ? 1 : -1);
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = group.tabs.length - 1;
        else return;
        event.preventDefault();
        next = (next + group.tabs.length) % group.tabs.length;
        var panel = panelControlledBy(group.tabs[next], group.element);
        if (panel) activateGroup(group, panel, true, true);
      });
    });
  }

  function activateHashTarget(focusTab) {
    var hash = window.location.hash.slice(1);
    if (!hash) return false;
    var panel = document.getElementById(hash);
    if (!panel || !root.contains(panel)) return false;
    for (var index = 0; index < exampleGroups.length; index += 1) {
      var group = exampleGroups[index];
      if (group.panels.indexOf(panel) >= 0) {
        return activateGroup(group, panel, focusTab, false);
      }
    }
    var state = states.get(panel);
    if (alwaysPanels.indexOf(panel) >= 0 && state) scheduleResize(state);
    return alwaysPanels.indexOf(panel) >= 0;
  }

  function handleHashChange() {
    if (!permanentlyDestroyed) activateHashTarget(false);
  }

  function activateAdaptiveProfile(section, profile, focusTab, renderNow) {
    if (!section || !profile || permanentlyDestroyed) return false;
    var tabs = Array.prototype.slice.call(
      section.querySelectorAll("[data-graflume-adaptive-tab]"),
    );
    var descriptions = Array.prototype.slice.call(
      section.querySelectorAll("[data-graflume-adaptive-description]"),
    );
    var panel = section.querySelector("[data-graflume-adaptive-example]");
    if (!panel) return false;
    section.dataset.graflumeAdaptiveProfile = profile.id;
    panel.dataset.graflumeAdaptiveProfile = profile.id;
    tabs.forEach(function (tab) {
      styleTab(tab, tab.dataset.graflumeAdaptiveTab === profile.id);
    });
    descriptions.forEach(function (description) {
      description.hidden =
        description.dataset.graflumeAdaptiveDescription !== profile.id;
    });
    var viewport = panel.querySelector("[data-graflume-adaptive-viewport]");
    if (viewport) {
      viewport.dataset.graflumeAdaptiveProfile = profile.id;
      viewport.dataset.graflumeAdaptiveCapabilities =
        profile.capabilities.join(" ");
      viewport.style.setProperty(
        "--sg-graflume-device-width",
        profile.viewportWidth + "px",
      );
      viewport.style.setProperty(
        "--sg-graflume-device-height",
        profile.viewportHeight + "px",
      );
      viewport.style.setProperty(
        "--sg-graflume-device-chart-height",
        profile.chartHeight + "px",
      );
    }
    var activeTab = tabs.find(function (tab) {
      return tab.dataset.graflumeAdaptiveTab === profile.id;
    });
    if (focusTab && activeTab) activeTab.focus();
    if (renderNow) {
      var state = states.get(panel);
      if (state) destroyState(state);
      renderPanel(panel);
    }
    return true;
  }

  function bindAdaptiveSection(section) {
    if (!adaptiveRegistry || !section) return;
    var tabs = Array.prototype.slice.call(
      section.querySelectorAll("[data-graflume-adaptive-tab]"),
    );
    if (tabs.length !== adaptiveRegistry.profiles.length) {
      throw new Error("Adaptive-device tabs drifted from the registry.");
    }
    var selectedProfile =
      adaptiveRegistry.profileByID[adaptiveRegistry.defaultProfile];
    var hash = window.location.hash.slice(1);
    tabs.forEach(function (tab, index) {
      var id = (tab.dataset.graflumeAdaptiveTab || "").toLowerCase();
      var profile = adaptiveRegistry.profileByID[id];
      if (!profile) throw new Error("Unknown adaptive-device tab.");
      if (tab.getAttribute("aria-controls") === hash) selectedProfile = profile;
      tab.addEventListener("click", function () {
        activateAdaptiveProfile(section, profile, false, true);
      });
      tab.addEventListener("keydown", function (event) {
        var next = index;
        var rtl = (document.documentElement.dir || "").toLowerCase() === "rtl";
        if (event.key === "ArrowRight") next = index + (rtl ? -1 : 1);
        else if (event.key === "ArrowLeft") next = index + (rtl ? 1 : -1);
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        next = (next + tabs.length) % tabs.length;
        var nextProfile =
          adaptiveRegistry.profileByID[
            tabs[next].dataset.graflumeAdaptiveTab || ""
          ];
        if (nextProfile) {
          activateAdaptiveProfile(section, nextProfile, true, true);
        }
      });
    });
    activateAdaptiveProfile(section, selectedProfile, false, false);
  }

  function initialize() {
    if (permanentlyDestroyed || panels.length === 0) return;
    buildExampleGroups();
    syncAllVisibleThemes(currentTheme);
    try {
      adaptiveRegistry = readAdaptiveRegistry();
      root
        .querySelectorAll('[data-graflume-example-section="adaptive"]')
        .forEach(bindAdaptiveSection);
      if (adaptiveRegistry) {
        root.dataset.graflumeAdaptiveRegistryState = "ready";
      }
    } catch (error) {
      adaptiveRegistry = null;
      root.dataset.graflumeAdaptiveRegistryState = "invalid";
      if (window.console && typeof window.console.error === "function") {
        window.console.error(
          "Graflume adaptive-device registry failed.",
          error,
        );
      }
    }
    alwaysPanels.forEach(function (panel) {
      panel.hidden = false;
      renderPanel(panel);
    });
    var hash = window.location.hash.slice(1);
    exampleGroups.forEach(function (group) {
      bindGroup(group);
      var selected = selectedPanelForGroup(group, hash);
      if (!activateGroup(group, selected, false, false)) {
        var fallback = group.panels.find(function (panel) {
          return panel.dataset.graflumeConfirmBeforeRender !== "true";
        });
        if (fallback) activateGroup(group, fallback, false, false);
      }
    });
  }

  function handlePageHide(event) {
    if (event.persisted) return;
    root.removeEventListener(themeEvent, handleThemeChange);
    window.removeEventListener("hashchange", handleHashChange);
    window.removeEventListener("online", handleOnline);
    states.forEach(destroyState);
    activePanels.clear();
    permanentlyDestroyed = true;
  }

  function handlePageShow(event) {
    if (!event.persisted) return;
    visibleActivePanels().forEach(function (panel) {
      var state = states.get(panel);
      if (
        state &&
        !state.chart &&
        state.lastErrorCategory === "runtime-unavailable"
      ) {
        requestRuntimeReload(runtimeFor(panel).name, true);
        renderPanel(panel);
      } else {
        scheduleResize(state);
      }
    });
  }

  function handleOnline() {
    if (permanentlyDestroyed) return;
    visibleActivePanels().forEach(function (panel) {
      var state = states.get(panel);
      if (
        state &&
        !state.chart &&
        state.lastErrorCategory === "runtime-unavailable"
      ) {
        requestRuntimeReload(runtimeFor(panel).name, true);
        renderPanel(panel);
      }
    });
  }

  root.addEventListener(themeEvent, handleThemeChange);
  window.addEventListener("hashchange", handleHashChange);
  window.addEventListener("online", handleOnline);
  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("pageshow", handlePageShow);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
