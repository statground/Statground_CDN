(function () {
  "use strict";
  var root = document.querySelector("[data-graflume-network-synthetic]");
  if (!root) return;
  var manual = root.closest("[data-graflume-chart-manual]");
  var status = root.querySelector("[data-network-status]");
  var labels;
  try {
    labels = JSON.parse(
      root.querySelector("[data-network-metadata]").textContent,
    );
    if (labels.schema !== "statground.graflume.network-synthetic.v1") return;
  } catch (_) {
    return;
  }
  var initialized = false;
  function initialize() {
    if (initialized) return true;
    var api = window.Graflume;
    if (
      !api ||
      typeof api.generateNetworkTopology !== "function" ||
      typeof api.network !== "function" ||
      !Array.isArray(api.networkTopologyCatalog)
    ) {
      root.dataset.networkState = "error";
      status.textContent = labels.unavailable;
      return false;
    }
    initialized = true;
    var catalog = api.networkTopologyCatalog;
    var controlLabels = {};
    Object.keys(labels.controls || {}).forEach(function (key) {
      var value = labels.controls[key];
      if (typeof value === "string" && value.trim()) controlLabels[key] = value;
    });
    var topology = root.querySelector("[data-network-topology]");
    var count = root.querySelector("[data-network-count]");
    var seed = root.querySelector("[data-network-seed]");
    var probability = root.querySelector("[data-network-probability]");
    var directed = root.querySelector("[data-network-directed]");
    var gallery = root.querySelector("[data-network-gallery]");
    var host = root.querySelector("[data-network-chart]");
    var download = root.querySelector("[data-network-download]");
    var presets = Array.from(
      root.querySelectorAll("[data-network-count-preset]"),
    );
    var code = root.querySelector("[data-network-code]");
    var data = root.querySelector("[data-network-data]");
    var chart = null;
    var graph = null;
    var savedParameters = null;
    var previews = [];
    var destroyed = false;
    var theme = manual.getAttribute("data-graflume-theme") || "light";
    var formatter = new Intl.NumberFormat(
      document.documentElement.lang || "en",
    );

    function name(entry) {
      return labels.labels[entry.id] || entry.label;
    }

    function descriptor() {
      return catalog.find(function (entry) {
        return entry.id === topology.value;
      });
    }

    function parameters() {
      return {
        topology: topology.value,
        nodeCount: Number(count.value),
        directed: directed.checked,
        seed: Number(seed.value),
        edgeProbability: Number(probability.value),
      };
    }

    function options(nextGraph, preview, width) {
      var entry = catalog.find(function (item) {
        return item.id === nextGraph.topology;
      });
      return {
        width: preview ? width : "container",
        height: preview ? 148 : 420,
        theme: theme,
        x: { field: "source", type: "ordinal" },
        y: { field: "value", type: "quantitative" },
        mark: nextGraph.mark,
        axes: { x: false, y: false },
        legend: false,
        accessibility: {
          label: name(entry),
          description:
            labels.nodes +
            ": " +
            nextGraph.nodeCount +
            ", " +
            labels.edges +
            ": " +
            nextGraph.edgeCount,
        },
        interaction: preview
          ? {
              hover: false,
              click: false,
              tooltip: false,
              controls: false,
              navigation: false,
            }
          : {
              tooltip: true,
              navigation: true,
              controls: {
                zoom: true,
                reset: true,
                fullscreen: true,
                export: true,
                labels: controlLabels,
              },
            },
      };
    }

    function syncControls() {
      var entry = descriptor();
      count.min = String(entry.minNodes);
      count.max = String(entry.maxNodes);
      presets.forEach(function (button) {
        var value = Number(button.dataset.networkCountPreset);
        button.disabled = value < entry.minNodes || value > entry.maxNodes;
        button.setAttribute(
          "aria-pressed",
          String(value === Number(count.value)),
        );
      });
      var random = entry.id === "random" || entry.id === "small-world";
      seed.disabled = !random;
      probability.disabled = !random;
      Array.from(gallery.children).forEach(function (card) {
        card
          .querySelector("button")
          .setAttribute(
            "aria-pressed",
            String(card.dataset.networkTopologyCard === entry.id),
          );
      });
    }

    function displaySource(nextGraph, params) {
      var publicOptions = {
        width: "container",
        height: 420,
        theme: theme,
        x: { field: "source", type: "ordinal" },
        y: { field: "value", type: "quantitative" },
        axes: { x: false, y: false },
        legend: false,
        interaction: { tooltip: true, navigation: true, controls: true },
      };
      code.textContent =
        "const graph = Graflume.generateNetworkTopology(" +
        JSON.stringify(params, null, 2) +
        ");\n" +
        "const chart = Graflume.network('#chart', graph.data, {\n" +
        "  ..." +
        JSON.stringify(publicOptions, null, 2).replace(/\n/g, "\n  ") +
        ",\n  mark: graph.mark\n});";
      data.textContent = JSON.stringify(nextGraph, null, 2);
    }

    // Compile the candidate before replacing the last successfully rendered graph.
    function render() {
      if (destroyed) return;
      syncControls();
      var params = parameters();
      var nextMount = null;
      var nextChart = null;
      try {
        var entry = descriptor();
        if (
          !Number.isInteger(params.nodeCount) ||
          params.nodeCount < entry.minNodes ||
          params.nodeCount > entry.maxNodes ||
          !Number.isInteger(params.seed) ||
          params.seed < 0 ||
          params.seed > 4294967295 ||
          !Number.isFinite(params.edgeProbability) ||
          params.edgeProbability < 0 ||
          params.edgeProbability > 1
        ) {
          throw new RangeError("parameters");
        }
        var nextGraph = api.generateNetworkTopology(params);
        nextMount = document.createElement("div");
        nextMount.className = "sg-network-synthetic-candidate";
        host.appendChild(nextMount);
        nextChart = api.network(
          nextMount,
          nextGraph.data,
          options(
            nextGraph,
            false,
            Math.max(240, Math.floor(host.clientWidth || 640)),
          ),
        );
        if (!nextChart || typeof nextChart.destroy !== "function")
          throw new Error("chart");
        if (chart) chart.destroy();
        Array.from(host.children).forEach(function (child) {
          if (child !== nextMount) child.remove();
        });
        nextMount.className = "";
        chart = nextChart;
        graph = nextGraph;
        savedParameters = params;
        displaySource(graph, savedParameters);
        download.hidden = false;
        status.textContent =
          labels.ready +
          " · " +
          labels.nodes +
          ": " +
          formatter.format(graph.nodeCount) +
          " · " +
          labels.edges +
          ": " +
          formatter.format(graph.edgeCount);
        root.dataset.networkState = "ready";
        root.dataset.networkTopology = params.topology;
        root.dataset.networkNodeCount = String(graph.nodeCount);
        root.dataset.networkEdgeCount = String(graph.edgeCount);
      } catch (error) {
        if (nextChart && nextChart !== chart) nextChart.destroy();
        if (nextMount && nextMount.parentNode) nextMount.remove();
        root.dataset.networkState = "error";
        status.textContent =
          error instanceof RangeError ? labels.invalid : labels.unavailable;
      }
    }

    function select(entry) {
      topology.value = entry.id;
      directed.checked = entry.directed;
      count.value = String(
        Math.max(
          entry.minNodes,
          Math.min(entry.maxNodes, Number(count.value) || 8),
        ),
      );
      render();
    }

    function renderPreviews() {
      previews.forEach(function (preview) {
        preview.destroy();
      });
      previews = [];
      Array.from(gallery.children).forEach(function (card) {
        var mount = card.querySelector("[data-network-preview]");
        mount.replaceChildren();
        try {
          var entry = catalog.find(function (item) {
            return item.id === card.dataset.networkTopologyCard;
          });
          var preview = api.generateNetworkTopology({
            topology: entry.id,
            nodeCount: 8,
            directed: entry.directed,
            seed: 1,
            edgeProbability: 0.2,
          });
          previews.push(
            api.network(
              mount,
              preview.data,
              options(
                preview,
                true,
                Math.max(120, Math.floor(mount.clientWidth || 180)),
              ),
            ),
          );
          card.dataset.networkPreviewState = "ready";
        } catch (_) {
          mount.textContent = labels.unavailable;
          card.dataset.networkPreviewState = "error";
        }
      });
    }

    catalog.forEach(function (entry) {
      var option = document.createElement("option");
      option.value = entry.id;
      option.textContent = name(entry);
      topology.appendChild(option);
      var card = document.createElement("div");
      card.className = "sg-network-synthetic-card";
      card.dataset.networkTopologyCard = entry.id;
      var mount = document.createElement("div");
      mount.dataset.networkPreview = "";
      mount.setAttribute("aria-hidden", "true");
      mount.inert = true;
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = name(entry);
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        select(entry);
      });
      var limits = document.createElement("small");
      limits.textContent =
        labels.nodes + ": " + entry.minNodes + "–" + entry.maxNodes;
      limits.dir = "auto";
      card.append(mount, button, limits);
      gallery.appendChild(card);
    });
    root.querySelector("[data-network-controls]").disabled = false;
    topology.value = "diamond";
    root
      .querySelector("[data-network-form]")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    topology.addEventListener("change", function () {
      select(descriptor());
    });
    directed.addEventListener("change", render);
    count.addEventListener("input", syncControls);
    presets.forEach(function (button) {
      button.addEventListener("click", function () {
        count.value = button.dataset.networkCountPreset;
        render();
      });
    });
    download.addEventListener("click", function () {
      if (!graph) return;
      var url = URL.createObjectURL(
        new Blob([JSON.stringify(graph, null, 2)], {
          type: "application/json",
        }),
      );
      var anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        "network-" + graph.topology + "-" + graph.nodeCount + ".json";
      anchor.click();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    });
    manual.addEventListener("graflume:themechange", function (event) {
      var next = event.detail && event.detail.theme;
      if (!next || next === theme) return;
      theme = next;
      renderPreviews();
      if (savedParameters) {
        // A theme change retains the currently displayed graph even if a form edit is invalid.
        var pending = {
          topology: topology.value,
          nodeCount: count.value,
          seed: seed.value,
          edgeProbability: probability.value,
          directed: directed.checked,
        };
        topology.value = savedParameters.topology;
        count.value = String(savedParameters.nodeCount);
        seed.value = String(savedParameters.seed);
        probability.value = String(savedParameters.edgeProbability);
        directed.checked = savedParameters.directed;
        render();
        topology.value = pending.topology;
        count.value = pending.nodeCount;
        seed.value = pending.seed;
        probability.value = pending.edgeProbability;
        directed.checked = pending.directed;
        syncControls();
      }
    });
    var resizeFrame = 0;
    var lastWidth = 0;
    var observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(function () {
            var width = Math.floor(host.clientWidth);
            if (!width || width === lastWidth) return;
            lastWidth = width;
            cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(function () {
              if (destroyed) return;
              if (chart && typeof chart.resize === "function")
                chart.resize(width, 420);
              renderPreviews();
            });
          })
        : null;
    if (observer) observer.observe(host);
    window.addEventListener("pagehide", function (event) {
      if (event.persisted) return;
      destroyed = true;
      cancelAnimationFrame(resizeFrame);
      if (observer) observer.disconnect();
      if (chart) chart.destroy();
      previews.forEach(function (preview) {
        preview.destroy();
      });
    });
    renderPreviews();
    render();
    return true;
  }
  function recover() {
    if (!initialize()) return;
    document.removeEventListener("load", recover, true);
    manual.removeEventListener("graflume:manual-render-result", recover);
  }
  if (!initialize()) {
    document.addEventListener("load", recover, true);
    manual.addEventListener("graflume:manual-render-result", recover);
  }
})();
