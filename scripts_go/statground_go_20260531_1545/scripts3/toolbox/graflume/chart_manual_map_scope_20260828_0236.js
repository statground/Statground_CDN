(function () {
  "use strict";

  var root = document.querySelector(
    '[data-graflume-chart-manual][data-graflume-family="map"]',
  );
  if (!root) return;

  var selectors = Array.from(
    root.querySelectorAll("[data-graflume-map-scope-selector]"),
  );
  if (selectors.length === 0) return;

  var catalogPromises = new Map();
  var manifestPromises = new Map();
  var loaderByRoot = new Map();
  var states = new Map();
  var requestSequence = 0;
  var maximumRenderedResults = 200;
  var largeSelectionFeatures = 120;
  var largeSelectionBytes = 12 * 1024 * 1024;
  var renderResultTimeoutMilliseconds = 20000;
  var boundaryRootPath = "scripts3/toolbox/graflume/geography/natural-earth-10m/";
  var boundaryPolicy = "Natural Earth de facto boundaries; statistical reference, not legal authority";
  var allowedOperations = [
    "load-catalog",
    "search",
    "select-visible",
    "clear",
    "apply",
  ];

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function safeString(value, maximum) {
    return typeof value === "string" && value.length > 0 && value.length <= maximum;
  }

  function safeID(value) {
    return safeString(value, 64) && /^[A-Z0-9][A-Z0-9._:+?~-]*$/.test(value);
  }

  function safeNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function safeBounds(value) {
    return (
      Array.isArray(value) &&
      value.length === 4 &&
      value.every(safeNumber) &&
      value[0] >= -180 &&
      value[2] <= 180 &&
      value[1] >= -90 &&
      value[3] <= 90 &&
      value[0] <= value[2] &&
      value[1] <= value[3]
    );
  }

  function normalizedLanguage() {
    var value = (root.closest("[lang]") || document.documentElement).lang || "en";
    value = value.trim().toLowerCase();
    return value || "en";
  }

  function normalizedSearch(value) {
    var text = String(value || "").trim().toLocaleLowerCase(normalizedLanguage());
    if (typeof text.normalize === "function") {
      text = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
    return text.replace(/\s+/g, " ");
  }

  function localizedName(item) {
    var language = normalizedLanguage();
    var base = language.split("-", 1)[0];
    var names = isPlainObject(item.names) ? item.names : {};
    return names[language] || names[base] || names.en || item.name || item.id;
  }

  function searchText(item, parent) {
    var parts = [item.id, item.isoSubdivision, item.iso2, item.name, item.type];
    if (parent) {
      parts.push(parent.id, parent.name);
      if (isPlainObject(parent.names)) parts.push.apply(parts, Object.values(parent.names));
    }
    if (isPlainObject(item.names)) parts.push.apply(parts, Object.values(item.names));
    if (Array.isArray(item.aliases)) parts.push.apply(parts, item.aliases);
    return normalizedSearch(parts.filter(Boolean).join(" "));
  }

  function sameOriginURL(path, base) {
    var url = new URL(path, base);
    if (
      url.origin !== window.location.origin ||
      url.username !== "" ||
      url.password !== "" ||
      url.hash !== ""
    ) {
      throw new Error("Map assets must use the Statground same-origin asset route.");
    }
    return url.href;
  }

  function sameRootURL(path, assetRoot) {
    var rootURL = new URL(assetRoot);
    var url = new URL(path, rootURL);
    if (
      url.origin !== rootURL.origin ||
      url.username !== "" ||
      url.password !== "" ||
      url.hash !== "" ||
      url.search !== "" ||
      url.pathname.indexOf(rootURL.pathname) !== 0
    ) {
      throw new Error("Map assets must remain under the pinned boundary root.");
    }
    return url.href;
  }

  function validateAssetRoot(value, metadata) {
    var absoluteRoot = new URL(value, window.location.href).href;
    var url = new URL(sameOriginURL("./", absoluteRoot));
    if (
      url.search !== "" ||
      url.pathname.slice(-metadata.boundaryRoot.length) !== metadata.boundaryRoot
    ) {
      throw new Error("Map asset root does not match the closed boundary path.");
    }
    return url.href;
  }

  function readJSONScript(id) {
    if (!safeString(id, 180)) throw new Error("Map metadata id is invalid.");
    var node = document.getElementById(id);
    if (!node || node.type !== "application/json") {
      throw new Error("Map metadata is unavailable.");
    }
    var value = JSON.parse(node.textContent || "null");
    if (!isPlainObject(value)) throw new Error("Map metadata must be an object.");
    return value;
  }

  function validateMetadata(value) {
    var modes = ["country", "region", "mixed", "catalog"];
    var details = ["auto", "low", "medium", "high", "full"];
    var expectedLevels = {
      country: ["country"],
      region: ["region"],
      mixed: ["country", "region"],
      catalog: ["country", "region"],
    };
    var requiredLabels = [
      "title",
      "selectVisibleCountries",
      "selectVisibleRegions",
      "retry",
      "ready",
      "unavailable",
      "noResults",
      "largeSelectionConfirm",
      "uncontestedDisclaimer",
    ];
    var initialTotal = Array.isArray(value.initialCountries) && Array.isArray(value.initialRegions)
      ? value.initialCountries.length + value.initialRegions.length
      : 0;
    var levels = expectedLevels[value.mode];
    if (
      value.schema !== "statground.graflume.map-scope-demo.v1" ||
      value.boundaryRoot !== boundaryRootPath ||
      value.manifestPath !== "manifest.json" ||
      value.catalogPath !== "catalog.json" ||
      value.sourceCommit !== "f1890d9f152c896d250a77557a5751a93d494776" ||
      value.sourceId !== "natural-earth-admin-0-admin-1-10m" ||
      value.admin0Version !== "5.1.2" ||
      value.admin1Version !== "5.1.1" ||
      value.sourceScale !== "1:10m" ||
      value.boundaryPolicy !== boundaryPolicy ||
      value.countryCount !== 263 ||
      value.isoCountryCount !== 249 ||
      value.userAssignedCountryCount !== 1 ||
      value.sourceAdditionalCountryCount !== 13 ||
      value.sourceAdmin1FeatureCount !== 4596 ||
      value.regionCount !== 4501 ||
      value.maximumSelections !== 50000 ||
      modes.indexOf(value.mode) < 0 ||
      details.indexOf(value.geometryDetail) < 0 ||
      !Number.isInteger(value.geometryBudget) ||
      value.geometryBudget < 1000 ||
      value.geometryBudget > 1000000 ||
      typeof value.fit !== "boolean" ||
      !Number.isInteger(value.fitPadding) ||
      value.fitPadding < 0 ||
      value.fitPadding > 200 ||
      typeof value.labelsEnabled !== "boolean" ||
      !isPlainObject(value.labels) ||
      requiredLabels.some(function (label) { return !safeString(value.labels[label], 500); }) ||
      !Array.isArray(value.allowedLevels) ||
      !levels ||
      value.allowedLevels.length !== levels.length ||
      value.allowedLevels.some(function (level, index) { return level !== levels[index]; }) ||
      !Array.isArray(value.operations) ||
      value.operations.length !== allowedOperations.length ||
      value.operations.some(function (operation, index) {
        return operation !== allowedOperations[index];
      }) ||
      !Array.isArray(value.initialCountries) ||
      !Array.isArray(value.initialRegions) ||
      initialTotal < 1 ||
      initialTotal > value.maximumSelections ||
      new Set(value.initialCountries.concat(value.initialRegions)).size !== initialTotal ||
      value.initialCountries.some(function (id) { return !safeID(id); }) ||
      value.initialRegions.some(function (id) { return !safeID(id); }) ||
      (value.mode === "country" && (value.initialCountries.length < 1 || value.initialRegions.length !== 0)) ||
      (value.mode === "region" && (value.initialCountries.length < 1 || value.initialRegions.length < 1)) ||
      ((value.mode === "mixed" || value.mode === "catalog") &&
        (value.initialCountries.length < 1 || value.initialRegions.length < 1))
    ) {
      throw new Error("Map metadata failed its closed contract.");
    }
    return value;
  }

  function safeNames(value) {
    if (!isPlainObject(value)) return false;
    var entries = Object.entries(value);
    return (
      entries.length <= 40 &&
      entries.every(function (entry) {
        return /^[A-Za-z]{2,3}(?:-[A-Za-z]{2,8})?$/.test(entry[0]) &&
          safeString(entry[1], 240);
      })
    );
  }

  function safeAliases(value) {
    return (
      Array.isArray(value) &&
      value.length <= 100 &&
      value.every(function (entry) { return safeString(entry, 500); })
    );
  }

  function validateCatalog(value, metadata) {
    if (
      !isPlainObject(value) ||
      value.schemaVersion !== "1" ||
      value.id !== metadata.sourceId ||
      value.sourceCommit !== metadata.sourceCommit ||
      value.license !== "public-domain" ||
      value.countryCount !== metadata.countryCount ||
      value.isoCountryCount !== metadata.isoCountryCount ||
      value.userAssignedCountryCount !== metadata.userAssignedCountryCount ||
      value.sourceAdditionalCountryCount !== metadata.sourceAdditionalCountryCount ||
      value.sourceAdmin1FeatureCount !== metadata.sourceAdmin1FeatureCount ||
      value.regionCount !== metadata.regionCount ||
      !Array.isArray(value.countries) ||
      value.countries.length !== metadata.countryCount
    ) {
      throw new Error("Map catalog identity or coverage does not match the pinned contract.");
    }
    var countryIDs = new Set();
    var regionIDs = new Set();
    var regions = [];
    value.countries.forEach(function (country) {
      if (
        !isPlainObject(country) ||
        !safeID(country.id) ||
        countryIDs.has(country.id) ||
        !safeString(country.name, 240) ||
        !safeNames(country.names) ||
        !safeString(country.type, 240) ||
        ["iso-3166-1", "user-assigned", "source-additional"].indexOf(country.status) < 0 ||
        !safeAliases(country.aliases) ||
        !safeBounds(country.bounds) ||
        !Number.isInteger(country.regionCount) ||
        country.regionCount < 0 ||
        !Array.isArray(country.regions) ||
        country.regions.length !== country.regionCount
      ) {
        throw new Error("Map catalog contains an invalid country entry.");
      }
      countryIDs.add(country.id);
      country._search = searchText(country, null);
      country.regions.forEach(function (region) {
        if (
          !isPlainObject(region) ||
          !safeID(region.id) ||
          regionIDs.has(region.id) ||
          (region.isoSubdivision !== null && !safeString(region.isoSubdivision, 64)) ||
          !safeString(region.name, 240) ||
          !safeNames(region.names) ||
          !safeString(region.type, 240) ||
          !safeAliases(region.aliases) ||
          !safeBounds(region.bounds)
        ) {
          throw new Error("Map catalog contains an invalid principal-region entry.");
        }
        regionIDs.add(region.id);
        region._country = country;
        region._search = searchText(region, country);
        regions.push(region);
      });
    });
    if (regionIDs.size !== metadata.regionCount) {
      throw new Error("Map catalog does not contain every declared principal region.");
    }
    return {
      raw: value,
      countries: value.countries,
      regions: regions,
      countryByID: new Map(value.countries.map(function (item) { return [item.id, item]; })),
      regionByID: new Map(regions.map(function (item) { return [item.id, item]; })),
    };
  }

  function assertExactAssetResponse(response, requestedURL, assetRoot) {
    if (
      response.redirected === true ||
      !safeString(response.url, 2048) ||
      sameRootURL(response.url, assetRoot) !== requestedURL
    ) {
      throw new Error("Map asset redirected or escaped its pinned boundary root.");
    }
  }

  function fetchJSON(url, maximumBytes, assetRoot, forceReload) {
    var requestedURL = sameRootURL(url, assetRoot);
    return fetch(requestedURL, {
      credentials: "same-origin",
      cache: forceReload ? "reload" : "force-cache",
      redirect: "error",
    }).then(function (response) {
      assertExactAssetResponse(response, requestedURL, assetRoot);
      if (!response.ok) throw new Error("Map asset returned HTTP " + response.status + ".");
      var type = (response.headers.get("content-type") || "").toLowerCase();
      if (type.indexOf("json") < 0 && type.indexOf("octet-stream") < 0) {
        throw new Error("Map asset returned an unsupported MIME type.");
      }
      var declared = Number(response.headers.get("content-length") || 0);
      if (declared > maximumBytes) throw new Error("Map asset exceeds its byte budget.");
      return response.text();
    }).then(function (text) {
      if (!text || text.length > maximumBytes) throw new Error("Map asset exceeds its byte budget.");
      return JSON.parse(text);
    });
  }

  function catalogFor(state, forceReload) {
    var url = state.catalogURL;
    if (forceReload) catalogPromises.delete(url);
    if (!catalogPromises.has(url)) {
      catalogPromises.set(
        url,
        fetchJSON(url, 6 * 1024 * 1024, state.assetRoot, forceReload).then(function (value) {
          return validateCatalog(value, state.metadata);
        }).catch(function (error) {
          catalogPromises.delete(url);
          throw error;
        }),
      );
    }
    return catalogPromises.get(url);
  }

  function manifestFor(state, forceReload) {
    var url = state.manifestURL;
    if (forceReload) manifestPromises.delete(url);
    if (!manifestPromises.has(url)) {
      manifestPromises.set(
        url,
        fetchJSON(url, 1024 * 1024, state.assetRoot, forceReload).then(function (manifest) {
          if (
            !isPlainObject(manifest) ||
            manifest.schemaVersion !== "1" ||
            manifest.id !== state.metadata.sourceId ||
            manifest.revision !== state.metadata.sourceCommit ||
            !safeString(manifest.attribution, 500) ||
            !Array.isArray(manifest.sources) ||
            manifest.sources.length !== 248
          ) {
            throw new Error("Map boundary manifest identity is invalid.");
          }
          return manifest;
        }).catch(function (error) {
          manifestPromises.delete(url);
          throw error;
        }),
      );
    }
    return manifestPromises.get(url);
  }

  function setStatus(state, text, mode) {
    state.status.textContent = text;
    state.selector.dataset.graflumeMapScopeState = mode || "ready";
  }

  function isKorean() {
    return normalizedLanguage().split("-", 1)[0] === "ko";
  }

  function countText(state) {
    var countries = state.selectedCountries.size;
    var regions = state.selectedRegions.size;
    return isKorean()
      ? "국가 " + countries.toLocaleString() + "개 · 지역 " + regions.toLocaleString() + "개 선택"
      : countries.toLocaleString() + " countries · " + regions.toLocaleString() + " regions selected";
  }

  function resultSummary(kind, total) {
    var noun = kind === "country" ? (isKorean() ? "국가" : "countries") : (isKorean() ? "지역" : "regions");
    if (total <= maximumRenderedResults) {
      return isKorean()
        ? noun + " " + total.toLocaleString() + "개"
        : total.toLocaleString() + " " + noun;
    }
    return isKorean()
      ? noun + " " + total.toLocaleString() + "개 중 앞의 " + maximumRenderedResults + "개 표시 · 전체 선택 가능"
      : "Showing the first " + maximumRenderedResults + " of " + total.toLocaleString() + " " + noun + " · all filtered results remain selectable";
  }

  function itemLabel(state, kind, item) {
    var label = document.createElement("label");
    label.className = "sg-graflume-map-choice";
    var input = document.createElement("input");
    input.type = "checkbox";
    input.value = item.id;
    input.dataset.graflumeMapChoice = kind;
    input.checked = (kind === "country" ? state.selectedCountries : state.selectedRegions).has(item.id);
    var copy = document.createElement("span");
    copy.className = "sg-graflume-map-choice__copy";
    var strong = document.createElement("strong");
    strong.textContent = localizedName(item);
    var small = document.createElement("small");
    if (kind === "country") {
      small.textContent = item.id + " · " + item.type + " · " + item.regionCount.toLocaleString() + " regions";
    } else {
      small.textContent = item.id + " · " + localizedName(item._country) + " · " + item.type;
    }
    copy.append(strong, small);
    label.append(input, copy);
    return label;
  }

  function renderResults(state, kind) {
    if (!state.catalog) return;
    var queryNode = kind === "country" ? state.countrySearch : state.regionSearch;
    var resultNode = kind === "country" ? state.countryResults : state.regionResults;
    if (!queryNode || !resultNode) return;
    var query = normalizedSearch(queryNode.value);
    var candidates = kind === "country" ? state.catalog.countries : state.catalog.regions;
    if (kind === "region" && state.metadata.mode === "region" && state.selectedCountries.size > 0) {
      candidates = candidates.filter(function (item) {
        return state.selectedCountries.has(item._country.id);
      });
    }
    var filtered = query
      ? candidates.filter(function (item) { return item._search.indexOf(query) >= 0; })
      : candidates.slice();
    if (kind === "country") state.filteredCountries = filtered;
    else state.filteredRegions = filtered;
    resultNode.replaceChildren();
    var fragment = document.createDocumentFragment();
    filtered.slice(0, maximumRenderedResults).forEach(function (item) {
      fragment.append(itemLabel(state, kind, item));
    });
    if (filtered.length === 0) {
      var empty = document.createElement("p");
      empty.className = "sg-graflume-map-results__empty";
      empty.textContent = state.metadata.labels.noResults;
      fragment.append(empty);
    }
    var summary = document.createElement("p");
    summary.className = "sg-graflume-map-results__summary";
    summary.id = resultNode.id + "-summary";
    summary.setAttribute("role", "status");
    summary.setAttribute("aria-live", "polite");
    summary.textContent = resultSummary(kind, filtered.length);
    fragment.append(summary);
    resultNode.append(fragment);
  }

  function syncSelectVisibleControl(state) {
    var button = state.actions.find(function (candidate) {
      return candidate.dataset.graflumeMapAction === "select-visible";
    });
    if (!button) return;
    var kind = state.lastFocus;
    if (kind === "region" && !state.regionResults) kind = "country";
    if (kind === "country" && !state.countryResults) kind = "region";
    var results = kind === "region" ? state.regionResults : state.countryResults;
    var label = kind === "region"
      ? state.metadata.labels.selectVisibleRegions
      : state.metadata.labels.selectVisibleCountries;
    button.setAttribute("aria-label", label);
    if (results && results.id) button.setAttribute("aria-controls", results.id);
  }

  function syncControls(state) {
    var count = state.selectedCountries.size + state.selectedRegions.size;
    state.actions.forEach(function (button) {
      var action = button.dataset.graflumeMapAction;
      button.disabled = !state.catalog || state.loading ||
        ((action === "clear" || action === "apply") && count === 0);
    });
    syncSelectVisibleControl(state);
  }

  function renderAllResults(state) {
    renderResults(state, "country");
    renderResults(state, "region");
    syncControls(state);
    setStatus(state, countText(state), state.loading ? "loading" : "ready");
  }

  function pruneRegionsOutsideSelectedCountries(state) {
    if (state.metadata.mode !== "region" || !state.catalog) return;
    state.selectedRegions.forEach(function (id) {
      var region = state.catalog.regionByID.get(id);
      if (!region || !state.selectedCountries.has(region._country.id)) {
        state.selectedRegions.delete(id);
      }
    });
  }

  function bindChoiceChanges(state) {
    state.selector.addEventListener("change", function (event) {
      var input = event.target.closest("[data-graflume-map-choice]");
      if (!input || !state.selector.contains(input)) return;
      var kind = input.dataset.graflumeMapChoice;
      state.lastFocus = kind;
      var collection = kind === "country"
        ? state.selectedCountries
        : state.selectedRegions;
      if (input.checked) {
        if (state.selectedCountries.size + state.selectedRegions.size >= state.metadata.maximumSelections) {
          input.checked = false;
          syncSelectVisibleControl(state);
          setStatus(state, isKorean() ? "최대 선택 개수에 도달했습니다." : "The maximum selection count has been reached.", "error");
          return;
        }
        collection.add(input.value);
      } else {
        collection.delete(input.value);
      }
      if (kind === "country") {
        pruneRegionsOutsideSelectedCountries(state);
        renderResults(state, "region");
      }
      syncControls(state);
      setStatus(state, countText(state), "ready");
    });
  }

  function selectVisible(state) {
    var kind = state.lastFocus;
    if (kind === "region" && !state.regionResults) kind = "country";
    var values = kind === "region" ? state.filteredRegions : state.filteredCountries;
    var collection = kind === "region" ? state.selectedRegions : state.selectedCountries;
    var available = state.metadata.maximumSelections -
      (state.selectedCountries.size + state.selectedRegions.size - collection.size);
    collection.clear();
    values.slice(0, available).forEach(function (item) { collection.add(item.id); });
    renderAllResults(state);
  }

  function clearSelection(state) {
    state.selectedCountries.clear();
    state.selectedRegions.clear();
    renderAllResults(state);
  }

  function runtimeAPI() {
    var api = window.Graflume;
    if (
      !api ||
      typeof api.createMapBoundaryLoader !== "function" ||
      typeof api.scopeGeoJsonFeatures !== "function"
    ) {
      throw new Error("The current Graflume runtime does not expose detailed Map loading.");
    }
    return api;
  }

  function fetchBoundaryShard(state, source, signal) {
    if (!isPlainObject(source) || !safeString(source.url, 2048)) {
      return Promise.reject(new Error("Map boundary source URL is invalid."));
    }
    var requestedURL;
    try {
      requestedURL = sameRootURL(source.url, state.assetRoot);
    } catch (error) {
      return Promise.reject(error);
    }
    return fetch(requestedURL, {
      signal: signal,
      credentials: "same-origin",
      cache: "force-cache",
      redirect: "error",
    }).then(function (response) {
      assertExactAssetResponse(response, requestedURL, state.assetRoot);
      if (!response.ok) {
        throw new Error("Map boundary source returned HTTP " + response.status + ".");
      }
      var mimeType = (response.headers.get("content-type") || "").split(";", 1)[0].trim();
      return response.arrayBuffer().then(function (buffer) {
        return {
          bytes: new Uint8Array(buffer),
          mimeType: mimeType || undefined,
        };
      });
    });
  }

  function loaderFor(state, api) {
    if (!loaderByRoot.has(state.assetRoot)) {
      loaderByRoot.set(state.assetRoot, api.createMapBoundaryLoader({
        baseURL: state.assetRoot,
        maximumEntries: 384,
        maximumConcurrent: 4,
        maximumManifestBytes: 1024 * 1024,
        maximumSourceBytes: 16 * 1024 * 1024,
        maximumTotalBytes: 64 * 1024 * 1024,
        fetcher: function (source, signal) {
          return fetchBoundaryShard(state, source, signal);
        },
      }));
    }
    return loaderByRoot.get(state.assetRoot);
  }

  function featureCenter(feature) {
    var properties = feature.properties || {};
    var longitude = Number(properties.labelLongitude);
    var latitude = Number(properties.labelLatitude);
    if (Number.isFinite(longitude) && Number.isFinite(latitude)) return [longitude, latitude];
    return [0, 0];
  }

  function statisticalValue(id) {
    var hash = 2166136261;
    for (var index = 0; index < id.length; index += 1) {
      hash ^= id.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return 35 + ((hash >>> 0) % 66);
  }

  function rowForFeature(feature) {
    var properties = feature.properties || {};
    var id = String(feature.id || properties.id || properties.isoSubdivision || properties.countryCode || "");
    var center = featureCenter(feature);
    return {
      featureId: id,
      countryCode: String(properties.countryCode || id),
      name: String(properties[isKorean() ? "name_ko" : "name_en"] || properties.name || id),
      value: statisticalValue(id),
      longitude: center[0],
      latitude: center[1],
    };
  }

  function cloneInitialOptions(state) {
    var id = state.panel.dataset.graflumeOptionsPayloadId;
    var source = readJSONScript(id);
    return JSON.parse(JSON.stringify(source));
  }

  function applyOptions(state, collection, attribution) {
    var options = cloneInitialOptions(state);
    options.title = {
      text: isKorean() ? "선택한 세계 국가·지역" : "Selected world countries and regions",
      subtitle: isKorean()
        ? countText(state) + " · Natural Earth 1:10m"
        : countText(state) + " · Natural Earth 1:10m",
    };
    options.x = { field: "longitude", type: "quantitative", title: "Longitude" };
    options.y = { field: "latitude", type: "quantitative", title: "Latitude" };
    options.axes = { x: false, y: false };
    options.mark = {
      fields: { featureKey: "$id", dataKey: "featureId", color: "value" },
      options: {
        basemap: "none",
        graticule: false,
        geojson: collection,
        attribution: attribution,
        mapScope: {
          level: "feature",
          property: "$id",
          values: collection.features.map(function (feature) { return feature.id; }),
          unmatched: "error",
          empty: "error",
        },
        geometryDetail: state.metadata.geometryDetail,
        geometryBudget: Math.min(
          1000000,
          Math.max(state.metadata.geometryBudget, collection.features.length * 240),
        ),
        maximumFeatures: 50000,
        fit: state.metadata.fit,
        fitPadding: state.metadata.fitPadding,
        joinDuplicate: "error",
        joinUnmatched: "error",
        labels: state.metadata.labelsEnabled
          ? {
              field: isKorean() ? "name_ko" : "name_en",
              longitudeField: "labelLongitude",
              latitudeField: "labelLatitude",
              maximum: Math.min(240, Math.max(24, collection.features.length)),
              fontSize: 10,
              padding: 3,
              collision: "hide",
            }
          : false,
      },
    };
    options.accessibility = {
      label: isKorean() ? "선택한 국가와 지역의 통계 지도" : "Statistical map of selected countries and regions",
      description: isKorean()
        ? "Natural Earth 1:10m 경계에서 사용자가 선택한 모든 국가와 주요 행정구역을 결합한 지도입니다."
        : "A map combining every user-selected country and principal administrative region from the pinned Natural Earth 1:10m pack.",
    };
    return options;
  }

  function requestedSelection(state) {
    var countryIDs = Array.from(state.selectedCountries);
    var regionIDs = Array.from(state.selectedRegions);
    if (
      state.metadata.allowedLevels.indexOf("region") >= 0 &&
      regionIDs.length === 0 &&
      countryIDs.length > 0 &&
      state.metadata.mode === "region"
    ) {
      regionIDs = state.catalog.regions.filter(function (region) {
        return state.selectedCountries.has(region._country.id);
      }).map(function (region) { return region.id; });
    }
    var parentCountries = new Set();
    regionIDs.forEach(function (id) {
      var region = state.catalog.regionByID.get(id);
      if (region) parentCountries.add(region._country.id);
    });
    return {
      countryIDs: state.metadata.allowedLevels.indexOf("country") >= 0 ? countryIDs : [],
      regionIDs: regionIDs,
      parentCountries: Array.from(parentCountries),
    };
  }

  function selectedSourceBytes(manifest, selection) {
    var parents = new Set(selection.parentCountries);
    return manifest.sources.reduce(function (total, source) {
      if (source.level === "country" && selection.countryIDs.length > 0) return total + source.byteLength;
      if (source.level === "region" && Array.isArray(source.countries) && source.countries.some(function (id) { return parents.has(id); })) {
        return total + source.byteLength;
      }
      return total;
    }, 0);
  }

  function scopeCollection(api, collection, property, values) {
    return api.scopeGeoJsonFeatures(collection, {
      level: "feature",
      property: property,
      values: values,
      unmatched: "error",
      empty: "error",
    });
  }

  function loadSelectedBoundaries(state, api, manifest, selection, signal) {
    var loader = loaderFor(state, api);
    var jobs = [];
    if (selection.countryIDs.length > 0) {
      jobs.push(loader.load(manifest, { level: "country", countries: selection.countryIDs }, signal).then(function (result) {
        return {
          collection: scopeCollection(api, result.collection, "countryCode", selection.countryIDs),
          attribution: result.attribution,
          byteLength: result.byteLength,
          sourceIDs: result.sourceIds,
        };
      }));
    }
    if (selection.regionIDs.length > 0) {
      jobs.push(loader.load(manifest, { level: "region", countries: selection.parentCountries }, signal).then(function (result) {
        return {
          collection: scopeCollection(api, result.collection, "$id", selection.regionIDs),
          attribution: result.attribution,
          byteLength: result.byteLength,
          sourceIDs: result.sourceIds,
        };
      }));
    }
    return Promise.all(jobs).then(function (results) {
      var features = [];
      var seen = new Set();
      results.forEach(function (result) {
        result.collection.features.forEach(function (feature) {
          var id = String(feature.id);
          if (seen.has(id)) return;
          seen.add(id);
          features.push(feature);
        });
      });
      return {
        collection: { type: "FeatureCollection", features: features },
        attribution: results.map(function (result) { return result.attribution; }).filter(Boolean)[0] || "Natural Earth · 1:10m",
        byteLength: results.reduce(function (sum, result) { return sum + result.byteLength; }, 0),
        sourceCount: new Set(results.flatMap(function (result) { return result.sourceIDs || []; })).size,
      };
    });
  }

  function clearRenderResultTimeout(state) {
    if (state.resultTimer) window.clearTimeout(state.resultTimer);
    state.resultTimer = 0;
  }

  function hideRetry(state) {
    state.retryMode = "";
    if (state.retryButton) state.retryButton.hidden = true;
  }

  function showRetry(state, mode) {
    state.retryMode = mode;
    if (!state.retryButton) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "mt-3 min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700";
      button.dataset.graflumeMapScopeRetry = "";
      button.textContent = state.metadata.labels.retry;
      button.setAttribute("aria-label", state.metadata.labels.retry);
      button.addEventListener("click", function () {
        var retryMode = state.retryMode;
        hideRetry(state);
        if (retryMode === "catalog") loadSelector(state, true);
        else if (retryMode === "apply") applySelection(state, true);
      });
      state.selector.append(button);
      state.retryButton = button;
    }
    state.retryButton.hidden = false;
    state.retryButton.disabled = false;
  }

  function startRenderResultTimeout(state, token, generation) {
    clearRenderResultTimeout(state);
    state.resultTimer = window.setTimeout(function () {
      if (
        state.destroyed ||
        state.pendingToken !== token ||
        state.renderGeneration !== generation
      ) {
        return;
      }
      state.pendingToken = "";
      state.pendingSummary = null;
      state.loading = false;
      syncControls(state);
      setStatus(state, state.metadata.labels.unavailable, "error");
      showRetry(state, "apply");
    }, renderResultTimeoutMilliseconds);
  }

  function applySelection(state, forceReload) {
    if (state.loading || !state.catalog) return;
    hideRetry(state);
    state.loading = true;
    syncControls(state);
    setStatus(state, isKorean() ? "선택한 상세 경계를 준비하고 있습니다…" : "Preparing the selected detailed boundaries…", "loading");
    if (state.abortController) state.abortController.abort();
    state.abortController = new AbortController();
    var signal = state.abortController.signal;
    var selection = requestedSelection(state);
    if (selection.countryIDs.length + selection.regionIDs.length === 0) {
      state.loading = false;
      syncControls(state);
      setStatus(state, state.metadata.labels.noResults, "error");
      return;
    }
    Promise.resolve().then(function () {
      var api = runtimeAPI();
      return manifestFor(state, forceReload).then(function (manifest) {
        var bytes = selectedSourceBytes(manifest, selection);
        var featureCount = selection.countryIDs.length + selection.regionIDs.length;
        var signature = selection.countryIDs.join(",") + "|" + selection.regionIDs.join(",");
        if (
          signature !== state.confirmedSignature &&
          (featureCount >= largeSelectionFeatures || bytes >= largeSelectionBytes)
        ) {
          if (!window.confirm(state.metadata.labels.largeSelectionConfirm)) {
            throw { cancelled: true };
          }
          state.confirmedSignature = signature;
        }
        return loadSelectedBoundaries(state, api, manifest, selection, signal);
      });
    }).then(function (loaded) {
      if (signal.aborted) return;
      if (loaded.collection.features.length === 0) throw new Error("No selected Map features were loaded.");
      var rows = loaded.collection.features.map(rowForFeature);
      var token = "map-scope-" + (++requestSequence).toString(36) + "-" + Date.now().toString(36);
      state.pendingToken = token;
      state.pendingSummary = {
        features: loaded.collection.features.length,
        bytes: loaded.byteLength,
        sources: loaded.sourceCount,
      };
      state.renderGeneration += 1;
      var generation = state.renderGeneration;
      setStatus(state, isKorean() ? "차트를 렌더링하고 있습니다…" : "Rendering the selected map…", "loading");
      startRenderResultTimeout(state, token, generation);
      root.dispatchEvent(new CustomEvent("graflume:manual-render", {
        detail: {
          schema: "statground.graflume.manual-render.v1",
          panelId: state.panel.id,
          token: token,
          data: rows,
          options: applyOptions(state, loaded.collection, loaded.attribution),
        },
      }));
    }).catch(function (error) {
      if (signal.aborted) return;
      state.loading = false;
      if (error && error.cancelled) {
        syncControls(state);
        setStatus(state, countText(state), "ready");
      } else {
        syncControls(state);
        setStatus(state, state.metadata.labels.unavailable, "error");
        showRetry(state, "apply");
        if (window.console && typeof window.console.error === "function") {
          window.console.error("Graflume detailed Map selection failed.", error);
        }
      }
    });
  }

  function handleRenderResult(event) {
    var detail = event && event.detail;
    if (!isPlainObject(detail) || detail.schema !== "statground.graflume.manual-render-result.v1") return;
    states.forEach(function (state) {
      if (state.panel.id !== detail.panelId || state.pendingToken !== detail.token) return;
      clearRenderResultTimeout(state);
      state.pendingToken = "";
      state.loading = false;
      syncControls(state);
      if (detail.status === "ready") {
        var summary = state.pendingSummary || { features: 0, bytes: 0, sources: 0 };
        var text = isKorean()
          ? summary.features.toLocaleString() + "개 경계 · " + summary.sources.toLocaleString() + "개 조각 · " + (summary.bytes / 1048576).toFixed(1) + " MiB 적용 완료"
          : summary.features.toLocaleString() + " boundaries · " + summary.sources.toLocaleString() + " shards · " + (summary.bytes / 1048576).toFixed(1) + " MiB applied";
        setStatus(state, text, "ready");
        hideRetry(state);
      } else {
        setStatus(state, state.metadata.labels.unavailable, "error");
        showRetry(state, "apply");
      }
      state.pendingSummary = null;
    });
  }

  function bindActions(state) {
    if (state.countrySearch) {
      state.countrySearch.addEventListener("focus", function () {
        state.lastFocus = "country";
        syncSelectVisibleControl(state);
      });
      state.countrySearch.addEventListener("input", function () {
        state.lastFocus = "country";
        renderResults(state, "country");
        syncSelectVisibleControl(state);
      });
    }
    if (state.regionSearch) {
      state.regionSearch.addEventListener("focus", function () {
        state.lastFocus = "region";
        syncSelectVisibleControl(state);
      });
      state.regionSearch.addEventListener("input", function () {
        state.lastFocus = "region";
        renderResults(state, "region");
        syncSelectVisibleControl(state);
      });
    }
    state.actions.forEach(function (button) {
      button.addEventListener("click", function () {
        var action = button.dataset.graflumeMapAction;
        if (action === "select-visible") selectVisible(state);
        else if (action === "clear") clearSelection(state);
        else if (action === "apply") applySelection(state);
      });
    });
    bindChoiceChanges(state);
  }

  function selectorIsVisible(state) {
    return !state.panel.hidden && state.selector.getClientRects().length > 0;
  }

  function maybeAutoApply(state) {
    if (
      !state.catalog ||
      state.initialApplyStarted ||
      state.loading ||
      !selectorIsVisible(state)
    ) {
      return;
    }
    state.initialApplyStarted = true;
    applySelection(state);
  }

  function enableSelector(state) {
    state.selector.querySelectorAll("fieldset").forEach(function (fieldset) { fieldset.disabled = false; });
    hideRetry(state);
    renderAllResults(state);
    setStatus(state, state.metadata.labels.ready + " " + countText(state), "ready");
    if (observer) observer.unobserve(state.selector);
    maybeAutoApply(state);
  }

  function loadSelector(state, forceReload) {
    if (state.destroyed) return;
    if (state.catalog) {
      maybeAutoApply(state);
      return;
    }
    if (state.started) return;
    state.started = true;
    hideRetry(state);
    state.selector.dataset.graflumeMapScopeState = "loading";
    catalogFor(state, forceReload).then(function (catalog) {
      if (state.destroyed) return;
      state.catalog = catalog;
      state.selectedCountries = new Set(state.metadata.initialCountries.filter(function (id) { return catalog.countryByID.has(id); }));
      state.selectedRegions = new Set(state.metadata.initialRegions.filter(function (id) { return catalog.regionByID.has(id); }));
      enableSelector(state);
    }).catch(function (error) {
      state.started = false;
      setStatus(state, state.metadata.labels.unavailable, "error");
      showRetry(state, "catalog");
      if (window.console && typeof window.console.error === "function") {
        window.console.error("Graflume Map catalog failed.", error);
      }
    });
  }

  function initializeSelector(selector) {
    var panel = selector.closest("[data-graflume-chart-example]");
    if (!panel || !panel.id || !panel.dataset.graflumeMapScopePayloadId) return;
    try {
      var metadata = validateMetadata(readJSONScript(panel.dataset.graflumeMapScopePayloadId));
      var assetRoot = selector.dataset.graflumeMapAssetRoot;
      if (!safeString(assetRoot, 2048)) throw new Error("Map asset root is unavailable.");
      assetRoot = validateAssetRoot(assetRoot, metadata);
      var catalogURL = sameRootURL(metadata.catalogPath, assetRoot);
      var manifestURL = sameRootURL(metadata.manifestPath, assetRoot);
      if (
        sameRootURL(selector.dataset.graflumeMapCatalogUrl, assetRoot) !== catalogURL ||
        sameRootURL(selector.dataset.graflumeMapManifestUrl, assetRoot) !== manifestURL
      ) {
        throw new Error("Map entrypoint URLs do not match the pinned asset root.");
      }
      var state = {
        selector: selector,
        panel: panel,
        metadata: metadata,
        assetRoot: assetRoot,
        catalogURL: catalogURL,
        manifestURL: manifestURL,
        status: selector.querySelector("[data-graflume-map-scope-status]"),
        countrySearch: selector.querySelector("[data-graflume-map-country-search]"),
        regionSearch: selector.querySelector("[data-graflume-map-region-search]"),
        countryResults: selector.querySelector("[data-graflume-map-country-results]"),
        regionResults: selector.querySelector("[data-graflume-map-region-results]"),
        actions: Array.from(selector.querySelectorAll("[data-graflume-map-action]")),
        selectedCountries: new Set(),
        selectedRegions: new Set(),
        filteredCountries: [],
        filteredRegions: [],
        lastFocus: metadata.allowedLevels.indexOf("region") >= 0 ? "region" : "country",
        catalog: null,
        started: false,
        loading: false,
        destroyed: false,
        abortController: null,
        confirmedSignature: "",
        pendingToken: "",
        pendingSummary: null,
        renderGeneration: 0,
        resultTimer: 0,
        retryMode: "",
        retryButton: null,
        initialApplyStarted: false,
      };
      if (!state.status || state.actions.length !== 3) throw new Error("Map selector controls are incomplete.");
      states.set(selector, state);
      bindActions(state);
      return state;
    } catch (error) {
      selector.dataset.graflumeMapScopeState = "error";
      var output = selector.querySelector("[data-graflume-map-scope-status]");
      if (output) output.textContent = "Detailed Map selector unavailable.";
      if (window.console && typeof window.console.error === "function") {
        window.console.error("Graflume Map selector metadata failed.", error);
      }
      return null;
    }
  }

  var observer = typeof IntersectionObserver === "function"
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var state = states.get(entry.target);
          if (state) loadSelector(state);
        });
      }, { rootMargin: "320px 0px" })
    : null;

  selectors.forEach(function (selector) {
    var state = initializeSelector(selector);
    if (!state) return;
    if (observer) observer.observe(selector);
    else if (!state.panel.hidden) loadSelector(state);
  });

  root.addEventListener("graflume:manual-render-result", handleRenderResult);
  function activateVisibleSelectors() {
    window.setTimeout(function () {
      states.forEach(function (state) {
        if (selectorIsVisible(state)) loadSelector(state);
      });
    }, 0);
  }
  root.addEventListener("click", activateVisibleSelectors);
  root.addEventListener("focusin", activateVisibleSelectors);
  window.addEventListener("pagehide", function (event) {
    if (event.persisted) return;
    if (observer) observer.disconnect();
    states.forEach(function (state) {
      state.destroyed = true;
      clearRenderResultTimeout(state);
      if (state.abortController) state.abortController.abort();
    });
    root.removeEventListener("graflume:manual-render-result", handleRenderResult);
  }, { once: true });
})();
