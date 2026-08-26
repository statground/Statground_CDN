(function () {
  "use strict";

  var root = document.querySelector("[data-graflume-chart-manual]");
  if (!root || root.dataset.graflumeChartManualBound === "true") return;

  var themeIDPattern = /^[a-z][a-z0-9-]{0,63}$/;
  var dataRecipeSchema = "statground.graflume.data-recipe.v1";
  var dataRecipeNamePattern = /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/;
  var dataRecipeFactors = [1e-9, 1e9, 0, 1e-6, 1e6, 1];
  // Must match graflumeEdgeCaseMaximumRuntimeRows in the Statground Go loader.
  var dataRecipeMaximumRows = 300000;
  var dataRecipeMaximumMagnitude = 1e300;
  var dataRecipeMinimumMagnitude = 1e-300;
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

  function recipeError(message) {
    var error = new Error(message);
    error.graflumeManualCategory = "payload-invalid";
    return error;
  }

  function cloneRecipeValue(value, depth) {
    if (depth > 32) throw recipeError("Data recipe nesting is too deep.");
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "boolean"
    ) {
      return value;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        throw recipeError("Data recipe numbers must be finite.");
      }
      return value;
    }
    if (Array.isArray(value)) {
      if (value.length > dataRecipeMaximumRows) {
        throw recipeError("Data recipe arrays exceed the row limit.");
      }
      return value.map(function (entry) {
        return cloneRecipeValue(entry, depth + 1);
      });
    }
    if (!value || typeof value !== "object") {
      throw recipeError("Data recipe values must be portable JSON.");
    }
    var keys = Object.keys(value);
    if (keys.length > 256) {
      throw recipeError("Data recipe objects have too many fields.");
    }
    var clone = {};
    keys.forEach(function (key) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        throw recipeError("Data recipe contains an unsafe field name.");
      }
      clone[key] = cloneRecipeValue(value[key], depth + 1);
    });
    return clone;
  }

  function validateDataRecipe(recipe) {
    var allowed = {
      schema: true,
      family: true,
      profile: true,
      base: true,
      sourcePayloadId: true,
      fields: true,
      targetRows: true,
      recipeId: true,
      recipeVersion: true,
      seed: true,
      shape: true,
    };
    if (
      Object.keys(recipe).some(function (key) {
        return !allowed[key];
      })
    ) {
      throw recipeError("Data recipe contains an unknown property.");
    }
    if (
      typeof recipe.family !== "string" ||
      !themeIDPattern.test(recipe.family)
    ) {
      throw recipeError("Data recipe family is invalid.");
    }
    if (
      recipe.profile !== "range" &&
      recipe.profile !== "structure" &&
      recipe.profile !== "volume"
    ) {
      throw recipeError("Data recipe profile is invalid.");
    }
    if (
      !Number.isInteger(recipe.targetRows) ||
      recipe.targetRows < 1 ||
      recipe.targetRows > dataRecipeMaximumRows
    ) {
      throw recipeError("Data recipe targetRows is out of range.");
    }
    if (
      Object.prototype.hasOwnProperty.call(recipe, "recipeId") &&
      (typeof recipe.recipeId !== "string" ||
        !dataRecipeNamePattern.test(recipe.recipeId))
    ) {
      throw recipeError("Data recipe recipeId is invalid.");
    }
    if (
      Object.prototype.hasOwnProperty.call(recipe, "recipeVersion") &&
      recipe.recipeVersion !== 1
    ) {
      throw recipeError("Data recipe recipeVersion is unsupported.");
    }
    if (
      Object.prototype.hasOwnProperty.call(recipe, "seed") &&
      (!Number.isInteger(recipe.seed) ||
        recipe.seed < 1 ||
        recipe.seed > 4294967295)
    ) {
      throw recipeError("Data recipe seed is out of range.");
    }
    if (
      Object.prototype.hasOwnProperty.call(recipe, "shape") &&
      recipe.shape !== "rows" &&
      recipe.shape !== "surface-grid" &&
      recipe.shape !== "volume-grid" &&
      recipe.shape !== "vector-set"
    ) {
      throw recipeError("Data recipe shape is invalid.");
    }
    if (!Array.isArray(recipe.fields) || recipe.fields.length > 128) {
      throw recipeError("Data recipe fields are invalid.");
    }
    var seenFields = Object.create(null);
    recipe.fields.forEach(function (field) {
      if (
        typeof field !== "string" ||
        !dataRecipeNamePattern.test(field) ||
        seenFields[field]
      ) {
        throw recipeError("Data recipe contains an invalid field.");
      }
      seenFields[field] = true;
    });
    return recipe;
  }

  function sourcePayload(scope, id) {
    if (
      typeof id !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_.:-]{0,127}$/.test(id)
    ) {
      throw recipeError("Data recipe sourcePayloadId is invalid.");
    }
    var node = document.getElementById(id);
    var boundary =
      scope && typeof scope.contains === "function" ? scope : document;
    if (
      !node ||
      !boundary.contains(node) ||
      node.tagName !== "SCRIPT" ||
      node.type !== "application/json"
    ) {
      throw recipeError("Data recipe source payload is unavailable.");
    }
    var value;
    try {
      value = JSON.parse(node.textContent || "null");
    } catch (_error) {
      throw recipeError("Data recipe source payload is invalid.");
    }
    return value;
  }

  function resolvedRecipeBase(recipe, scope) {
    var hasBase = Object.prototype.hasOwnProperty.call(recipe, "base");
    var hasSource = Object.prototype.hasOwnProperty.call(
      recipe,
      "sourcePayloadId",
    );
    if (hasBase === hasSource) {
      throw recipeError(
        "Data recipe requires exactly one base or sourcePayloadId.",
      );
    }
    var base = hasBase
      ? recipe.base
      : sourcePayload(scope, recipe.sourcePayloadId);
    if (
      (!Array.isArray(base) && (!base || typeof base !== "object")) ||
      (Array.isArray(base) && base.length === 0) ||
      (base && typeof base === "object" && base.schema === dataRecipeSchema)
    ) {
      throw recipeError("Data recipe base is invalid.");
    }
    return base;
  }

  function finiteScaledNumber(value, factor) {
    if (!Number.isFinite(value) || !Number.isFinite(factor) || factor < 0) {
      throw recipeError("Range recipe values must be finite.");
    }
    if (value === 0 || factor === 0) return 0;
    var scaled = value * factor;
    if (
      !Number.isFinite(scaled) ||
      Math.abs(scaled) > dataRecipeMaximumMagnitude
    ) {
      return Math.sign(value) * dataRecipeMaximumMagnitude;
    }
    if (scaled === 0 || Math.abs(scaled) < dataRecipeMinimumMagnitude) {
      return Math.sign(value) * dataRecipeMinimumMagnitude;
    }
    return scaled;
  }

  function resolveRangeRecipe(recipe, base) {
    var rows = cloneRecipeValue(base, 0);
    var numericFields = Object.create(null);
    recipe.fields.forEach(function (field) {
      numericFields[field] = true;
    });
    rows.forEach(function (row, index) {
      if (!row || typeof row !== "object" || Array.isArray(row)) return;
      var factor = dataRecipeFactors[index % dataRecipeFactors.length];
      Object.keys(numericFields).forEach(function (field) {
        if (typeof row[field] === "number") {
          row[field] = finiteScaledNumber(row[field], factor);
        }
      });
    });
    return rows;
  }

  function finiteArray(value, label) {
    if (!Array.isArray(value) || value.length === 0) {
      throw recipeError(label + " must be a non-empty array.");
    }
    value.forEach(function (entry) {
      if (typeof entry !== "number" || !Number.isFinite(entry)) {
        throw recipeError(label + " must contain only finite numbers.");
      }
    });
    return value;
  }

  function finiteTupleArray(value, label) {
    if (!Array.isArray(value) || value.length === 0) {
      throw recipeError(label + " must be a non-empty array.");
    }
    value.forEach(function (tuple) {
      if (!Array.isArray(tuple) || tuple.length !== 3) {
        throw recipeError(label + " must contain three-number tuples.");
      }
      tuple.forEach(function (entry) {
        if (typeof entry !== "number" || !Number.isFinite(entry)) {
          throw recipeError(label + " must contain finite tuples.");
        }
      });
    });
    return value;
  }

  function positiveInteger(value, label) {
    if (!Number.isInteger(value) || value < 1) {
      throw recipeError(label + " must be a positive integer.");
    }
    return value;
  }

  function scaledNumericArray(values) {
    return values.map(function (value, index) {
      return finiteScaledNumber(
        value,
        dataRecipeFactors[index % dataRecipeFactors.length],
      );
    });
  }

  function validateSurfaceData(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw recipeError("Surface recipe data must be an object.");
    }
    var rows = positiveInteger(value.rows, "Surface rows");
    var columns = positiveInteger(value.columns, "Surface columns");
    if (rows < 2 || columns < 2) {
      throw recipeError("Surface grid dimensions must each be at least two.");
    }
    var cellCount = rows * columns;
    if (!Number.isSafeInteger(cellCount) || cellCount > dataRecipeMaximumRows) {
      throw recipeError("Surface grid exceeds the row limit.");
    }
    var x = finiteArray(value.x, "Surface x");
    var y = finiteArray(value.y, "Surface y");
    var z = finiteArray(value.z, "Surface z");
    var values = finiteArray(value.values, "Surface values");
    if (
      x.length !== columns ||
      y.length !== rows ||
      z.length !== cellCount ||
      values.length !== cellCount
    ) {
      throw recipeError("Surface grid arrays have inconsistent lengths.");
    }
    return {
      rows: rows,
      columns: columns,
      x: x,
      y: y,
      z: z,
      values: values,
    };
  }

  function interpolatedAxis(source, length) {
    if (length === 1) return [source[0]];
    var first = source[0];
    var last = source[source.length - 1];
    return Array.from({ length: length }, function (_entry, index) {
      var ratio = index / (length - 1);
      return finiteScaledNumber(first * (1 - ratio) + last * ratio, 1);
    });
  }

  function surfaceGridDimensions(targetRows) {
    var rows = Math.max(1, Math.floor(Math.sqrt(targetRows)));
    while (rows > 1 && targetRows % rows !== 0) rows -= 1;
    return [rows, targetRows / rows];
  }

  function sampledIndex(index, targetLength, sourceLength) {
    if (targetLength <= 1 || sourceLength <= 1) return 0;
    return Math.round((index * (sourceLength - 1)) / (targetLength - 1));
  }

  function resampleSurfaceData(source, targetRows) {
    var dimensions = surfaceGridDimensions(targetRows);
    var rows = dimensions[0];
    var columns = dimensions[1];
    var z = new Array(targetRows);
    var values = new Array(targetRows);
    for (var row = 0; row < rows; row += 1) {
      var sourceRow = sampledIndex(row, rows, source.rows);
      for (var column = 0; column < columns; column += 1) {
        var sourceColumn = sampledIndex(column, columns, source.columns);
        var sourceIndex = sourceRow * source.columns + sourceColumn;
        var targetIndex = row * columns + column;
        z[targetIndex] = source.z[sourceIndex];
        values[targetIndex] = source.values[sourceIndex];
      }
    }
    return {
      rows: rows,
      columns: columns,
      x: interpolatedAxis(source.x, columns),
      y: interpolatedAxis(source.y, rows),
      z: z,
      values: values,
    };
  }

  function resolveSurfaceRecipe(recipe, base) {
    var source = validateSurfaceData(base);
    var result = resampleSurfaceData(source, recipe.targetRows);
    if (recipe.profile === "range") {
      result.z = scaledNumericArray(result.z);
      result.values = scaledNumericArray(result.values);
    } else if (recipe.profile === "structure") {
      result.z.reverse();
      result.values.reverse();
    }
    validateSurfaceData(result);
    return result;
  }

  function validateVolumeData(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw recipeError("Volume recipe data must be an object.");
    }
    if (!Array.isArray(value.dimensions) || value.dimensions.length !== 3) {
      throw recipeError("Volume dimensions must contain three integers.");
    }
    var dimensions = value.dimensions.map(function (entry) {
      var dimension = positiveInteger(entry, "Volume dimension");
      if (dimension < 2) {
        throw recipeError("Volume dimensions must each be at least two.");
      }
      return dimension;
    });
    var voxelCount = dimensions.reduce(function (product, entry) {
      return product * entry;
    }, 1);
    if (
      !Number.isSafeInteger(voxelCount) ||
      voxelCount > dataRecipeMaximumRows
    ) {
      throw recipeError("Volume grid exceeds the row limit.");
    }
    var values = finiteArray(value.values, "Volume values");
    if (values.length !== voxelCount) {
      throw recipeError("Volume values do not match its dimensions.");
    }
    ["origin", "spacing"].forEach(function (field) {
      if (!Object.prototype.hasOwnProperty.call(value, field)) return;
      if (!Array.isArray(value[field]) || value[field].length !== 3) {
        throw recipeError("Volume " + field + " must contain three numbers.");
      }
      value[field].forEach(function (entry) {
        if (typeof entry !== "number" || !Number.isFinite(entry)) {
          throw recipeError("Volume " + field + " must be finite.");
        }
      });
    });
    return { dimensions: dimensions, values: values };
  }

  function volumeGridDimensions(targetRows) {
    var first = Math.max(1, Math.floor(Math.cbrt(targetRows)));
    while (first > 1 && targetRows % first !== 0) first -= 1;
    var remainder = targetRows / first;
    var second = Math.max(1, Math.floor(Math.sqrt(remainder)));
    while (second > 1 && remainder % second !== 0) second -= 1;
    return [first, second, remainder / second];
  }

  function resampleVolumeData(source, targetRows) {
    var dimensions = volumeGridDimensions(targetRows);
    var values = new Array(targetRows);
    for (var index = 0; index < targetRows; index += 1) {
      var sourceIndex = sampledIndex(index, targetRows, source.values.length);
      values[index] = source.values[sourceIndex];
    }
    return { dimensions: dimensions, values: values };
  }

  function resolveSpatialVolumeRecipe(recipe, base) {
    var source = validateVolumeData(base);
    var result = cloneRecipeValue(base, 0);
    var sampled = resampleVolumeData(source, recipe.targetRows);
    result.dimensions = sampled.dimensions;
    result.values = sampled.values;
    if (recipe.profile === "range") {
      result.values = scaledNumericArray(result.values);
    } else if (recipe.profile === "structure") {
      result.values.reverse();
    }
    validateVolumeData(result);
    return result;
  }

  function validateSpatialVectorData(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw recipeError("Spatial vector recipe data must be an object.");
    }
    var origins = finiteTupleArray(value.origins, "Spatial vector origins");
    var vectors = finiteTupleArray(value.vectors, "Spatial vector vectors");
    var length = origins.length;
    var labels = value.labels;
    var colors = value.colors;
    if (labels !== undefined && !Array.isArray(labels)) {
      throw recipeError("Spatial vector labels must be an array when present.");
    }
    if (colors !== undefined && !Array.isArray(colors)) {
      throw recipeError("Spatial vector colors must be an array when present.");
    }
    if (
      vectors.length !== length ||
      (labels !== undefined && labels.length !== length) ||
      (colors !== undefined && colors.length !== length)
    ) {
      throw recipeError("Spatial vector arrays must have parallel lengths.");
    }
    if (labels !== undefined) {
      labels.forEach(function (label) {
        if (typeof label !== "string") {
          throw recipeError("Spatial vector labels must be strings.");
        }
      });
    }
    if (colors !== undefined) {
      colors.forEach(function (color) {
        if (typeof color !== "string") {
          throw recipeError("Spatial vector colors must be strings.");
        }
      });
    }
    return {
      origins: origins,
      vectors: vectors,
      labels: labels,
      colors: colors,
    };
  }

  function resolveSpatialVectorRecipe(recipe, base) {
    var source = validateSpatialVectorData(base);
    var result = cloneRecipeValue(base, 0);
    var fields = ["origins", "vectors"];
    if (source.labels !== undefined) fields.push("labels");
    if (source.colors !== undefined) fields.push("colors");
    fields.forEach(function (field) {
      result[field] = new Array(recipe.targetRows);
    });
    for (var index = 0; index < recipe.targetRows; index += 1) {
      var sourceIndex =
        recipe.targetRows <= source.origins.length
          ? sampledIndex(index, recipe.targetRows, source.origins.length)
          : index % source.origins.length;
      var repeatBatch = Math.floor(index / source.origins.length);
      result.origins[index] = cloneRecipeValue(source.origins[sourceIndex], 0);
      result.vectors[index] = cloneRecipeValue(source.vectors[sourceIndex], 0);
      if (source.labels !== undefined) {
        result.labels[index] =
          source.labels[sourceIndex] +
          (repeatBatch > 0 ? "__r" + String(repeatBatch + 1) : "");
      }
      if (source.colors !== undefined) {
        result.colors[index] = source.colors[sourceIndex];
      }
    }
    if (recipe.profile === "range") {
      result.vectors = result.vectors.map(function (vector, index) {
        var factor = dataRecipeFactors[index % dataRecipeFactors.length];
        return vector.map(function (entry) {
          return finiteScaledNumber(entry, factor);
        });
      });
    } else if (recipe.profile === "structure") {
      fields.forEach(function (field) {
        result[field].reverse();
      });
    }
    validateSpatialVectorData(result);
    return result;
  }

  function resolveStructureRecipe(base) {
    return base
      .slice()
      .reverse()
      .map(function (entry) {
        return cloneRecipeValue(entry, 0);
      });
  }

  function identityRepeatField(field) {
    return {
      id: true,
      key: true,
      node: true,
      parent: true,
      source: true,
      target: true,
      category: true,
      label: true,
      name: true,
      word: true,
      group: true,
      series: true,
      stage: true,
      sample: true,
    }[field.toLowerCase()];
  }

  function numericRepeatField(field) {
    var normalized = field.toLowerCase();
    return /(?:^|[_-])(x|time|index|timestamp|step|sequence|position)$/.test(
      normalized,
    );
  }

  function isoDateWithOffset(value, field, repeatIndex) {
    if (typeof value !== "string" || repeatIndex === 0) return "";
    var dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    var dateTime = /^\d{4}-\d{2}-\d{2}T/.test(value);
    if (!dateOnly && !dateTime) return "";
    var timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) return "";
    var delta = dateOnly ? repeatIndex * 86400000 : repeatIndex * 1000;
    var shifted = new Date(timestamp + delta);
    if (!Number.isFinite(shifted.getTime())) return "";
    return dateOnly
      ? shifted.toISOString().slice(0, 10)
      : shifted.toISOString();
  }

  function numericRepeatSteps(rows) {
    var ranges = Object.create(null);
    rows.forEach(function (row) {
      if (!row || typeof row !== "object" || Array.isArray(row)) return;
      Object.keys(row).forEach(function (field) {
        var value = row[field];
        if (!numericRepeatField(field) || typeof value !== "number") return;
        if (!Number.isFinite(value)) {
          throw recipeError("Volume recipe numbers must be finite.");
        }
        var range = ranges[field] || { minimum: value, maximum: value };
        range.minimum = Math.min(range.minimum, value);
        range.maximum = Math.max(range.maximum, value);
        ranges[field] = range;
      });
    });
    var steps = Object.create(null);
    Object.keys(ranges).forEach(function (field) {
      var range = ranges[field];
      var span = range.maximum - range.minimum;
      steps[field] =
        Number.isFinite(span) && span >= 0 ? Math.max(1, span + 1) : 1;
    });
    return steps;
  }

  function repeatVolumeRow(source, repeatIndex, steps) {
    var row = cloneRecipeValue(source, 0);
    if (!row || typeof row !== "object" || Array.isArray(row)) return row;
    var suffix = "__r" + String(repeatIndex + 1);
    Object.keys(row).forEach(function (field) {
      var value = row[field];
      var shiftedDate = isoDateWithOffset(value, field, repeatIndex);
      if (shiftedDate) {
        row[field] = shiftedDate;
      } else if (
        typeof value === "string" &&
        value &&
        (identityRepeatField(field) || field.toLowerCase() === "period") &&
        repeatIndex > 0
      ) {
        row[field] = value + suffix;
      } else if (
        typeof value === "number" &&
        numericRepeatField(field) &&
        repeatIndex > 0
      ) {
        var shifted = value + repeatIndex * (steps[field] || 1);
        row[field] = finiteScaledNumber(shifted, 1);
      }
    });
    return row;
  }

  function resolveVolumeRecipe(recipe, base) {
    var steps = numericRepeatSteps(base);
    var result = [];
    var repeatIndex = 0;
    while (result.length < recipe.targetRows) {
      for (
        var index = 0;
        index < base.length && result.length < recipe.targetRows;
        index += 1
      ) {
        result.push(repeatVolumeRow(base[index], repeatIndex, steps));
      }
      repeatIndex += 1;
    }
    return result;
  }

  function resolvedRecipeCardinality(recipe, value) {
    var shape = recipe.shape;
    if (!shape && recipe.family === "surface") shape = "surface-grid";
    if (!shape && recipe.family === "volume") shape = "volume-grid";
    if (!shape && recipe.family === "spatial-vector") shape = "vector-set";
    if (shape === "surface-grid") {
      var surface = validateSurfaceData(value);
      return surface.rows * surface.columns;
    }
    if (shape === "volume-grid") {
      return validateVolumeData(value).dimensions.reduce(function (
        product,
        entry,
      ) {
        return product * entry;
      }, 1);
    }
    if (shape === "vector-set") {
      return validateSpatialVectorData(value).origins.length;
    }
    if (!Array.isArray(value)) {
      throw recipeError("Row recipe data must be an array.");
    }
    return value.length;
  }

  function resolveDataRecipe(value, scope) {
    if (
      !value ||
      typeof value !== "object" ||
      value.schema !== dataRecipeSchema
    ) {
      return value;
    }
    var recipe = validateDataRecipe(value);
    var base = resolvedRecipeBase(recipe, scope || document);
    var result;
    if (recipe.family === "surface") {
      result = resolveSurfaceRecipe(recipe, base);
    } else if (recipe.family === "volume") {
      result = resolveSpatialVolumeRecipe(recipe, base);
    } else if (recipe.family === "spatial-vector") {
      result = resolveSpatialVectorRecipe(recipe, base);
    } else {
      if (!Array.isArray(base)) {
        throw recipeError("Object data recipes require a supported family.");
      }
      if (recipe.profile === "range") {
        result = resolveRangeRecipe(recipe, base);
      } else if (recipe.profile === "structure") {
        result = resolveStructureRecipe(base);
      } else {
        result = resolveVolumeRecipe(recipe, base);
      }
    }
    if (resolvedRecipeCardinality(recipe, result) !== recipe.targetRows) {
      throw recipeError("Data recipe did not resolve its declared row count.");
    }
    return result;
  }

  function installDataRecipeHelper() {
    var existing = window.StatgroundGraflumeManual;
    if (typeof existing !== "undefined") {
      return Boolean(
        existing && typeof existing.expandDataRecipe === "function",
      );
    }
    var helper = Object.freeze({
      expandDataRecipe: function (recipe, scope) {
        return resolveDataRecipe(recipe, scope || document);
      },
    });
    try {
      Object.defineProperty(window, "StatgroundGraflumeManual", {
        configurable: false,
        enumerable: true,
        value: helper,
        writable: false,
      });
    } catch (_error) {
      return false;
    }
    return true;
  }

  installDataRecipeHelper();

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

  function ensurePanelPayload(state) {
    if (state.payloadReady) return;
    var rawData = readJSON(state.panel, "graflumeDataPayloadId", "Data");
    state.data = resolveDataRecipe(rawData, root);
    state.rows = state.panel.dataset.graflumeTableDataPayloadId
      ? readJSON(state.panel, "graflumeTableDataPayloadId", "Table data")
      : state.data;
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
      ensurePanelPayload(state);
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
      unsubscribeAvailability: null,
      hostControlsReady: false,
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
      return;
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
        activateGroup(group, panel, focusTab, false);
        return true;
      }
    }
    var state = states.get(panel);
    if (alwaysPanels.indexOf(panel) >= 0 && state) scheduleResize(state);
    return alwaysPanels.indexOf(panel) >= 0;
  }

  function handleHashChange() {
    if (!permanentlyDestroyed) activateHashTarget(false);
  }

  function initialize() {
    if (permanentlyDestroyed || panels.length === 0) return;
    buildExampleGroups();
    syncAllVisibleThemes(currentTheme);
    alwaysPanels.forEach(function (panel) {
      panel.hidden = false;
      renderPanel(panel);
    });
    var hash = window.location.hash.slice(1);
    exampleGroups.forEach(function (group) {
      bindGroup(group);
      activateGroup(group, selectedPanelForGroup(group, hash), false, false);
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
