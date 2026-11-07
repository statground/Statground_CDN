(function () {
  "use strict";
  var root = document.querySelector("[data-admin-data-lineage]");
  if (!root) return;
  var labels = JSON.parse(
    root.querySelector("[data-lineage-labels]").textContent,
  );
  var form = root.querySelector("[data-lineage-filters]");
  var status = root.querySelector("[data-lineage-status]");
  var graphStatus = root.querySelector("[data-lineage-graph-status]");
  var mount = root.querySelector("[data-lineage-graph]");
  var mode = root.querySelector("[data-lineage-mode]");
  var catalog = null,
    chart = null,
    selected = "",
    page = 1,
    active = true,
    generation = 0;
  var graphOpen = false,
    timer = null,
    controller = null;
  var byID = new Map(),
    evidence = new Map();
  var pageSize = 50;
  var currentGraphHeight = 580;
  var compactGraph = matchMedia("(max-width: 600px)");
  var number = new Intl.NumberFormat(document.documentElement.lang || "en");

  function element(tag, text) {
    var node = document.createElement(tag);
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  function requestURL(authority) {
    var target = new URL(root.dataset.catalogUrl, location.origin);
    if (target.origin !== location.origin)
      throw new Error("same-origin catalog required");
    if (authority) target.searchParams.set("authority", "1");
    return target.href;
  }

  function retire() {
    generation += 1;
    if (controller) controller.abort();
    if (chart) chart.destroy();
    chart = null;
    catalog = null;
    selected = "";
    byID.clear();
    evidence.clear();
    root.querySelectorAll("[data-lineage-private]").forEach(function (node) {
      node.replaceChildren();
    });
    mount.replaceChildren();
    mount.hidden = true;
    root.querySelector("[data-lineage-columns]").hidden = true;
    form.querySelectorAll("input").forEach(function (node) {
      node.value = "";
    });
    form.querySelectorAll("select").forEach(function (node) {
      while (node.options.length > 1) node.remove(1);
      node.value = "";
    });
    root.querySelector("[data-lineage-pagination]").replaceChildren();
    status.textContent = labels.unavailable;
    graphStatus.textContent = "";
    root.dataset.lineageState = "retired";
    root.dataset.lineageGraphState = "retired";
    delete root.dataset.lineageMatches;
    delete root.dataset.lineageGraphNodes;
    delete root.dataset.lineageGraphHeight;
    history.replaceState(null, "", location.pathname);
  }

  async function authorized(action) {
    try {
      var response = await fetch(requestURL(true), {
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
      });
      if (!response.ok || !(await response.json()).ok)
        throw new Error("authority");
      if (active && catalog) action();
    } catch (_) {
      retire();
    }
  }

  function values() {
    var query = new URLSearchParams(new FormData(form));
    return query;
  }

  function matches(node, query) {
    if (
      ["domain", "layer", "system", "classification"].some(function (key) {
        return query.get(key) && node[key] !== query.get(key);
      })
    )
      return false;
    var term = (query.get("q") || "").trim().toLowerCase();
    return (
      !term ||
      [
        node.id,
        node.label,
        node.qualifiedName,
        node.summary,
        node.repo,
        node.system,
        (node.evidence || [])
          .map(function (id) {
            var item = evidence.get(id);
            return (
              id +
              " " +
              (item
                ? [
                    item.repo,
                    item.commit,
                    item.path,
                    item.line,
                    item.sha256,
                  ].join(" ")
                : "")
            );
          })
          .join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }

  function filtered() {
    var query = values();
    return catalog.nodes.filter(function (node) {
      return matches(node, query);
    });
  }

  function options(name, entries) {
    var select = form.elements[name];
    var prior = select.value;
    while (select.options.length > 1) select.remove(1);
    entries.forEach(function (entry) {
      var option = element("option", entry.label || entry.id);
      option.value = entry.id;
      select.appendChild(option);
    });
    select.value = prior;
  }

  function countSummary() {
    var target = root.querySelector(".sg-lineage-counts");
    target.replaceChildren();
    [
      [catalog.nodes.length, "objects"],
      [catalog.edges.length, "relations"],
      [catalog.repositories.length, "repositories"],
      [catalog.evidence.length, "evidence"],
      [catalog.gaps.length, "gaps"],
    ].forEach(function (entry) {
      target.appendChild(
        element("span", number.format(entry[0]) + " " + entry[1]),
      );
    });
    target.appendChild(element("time", catalog.generatedAt || ""));
  }

  function selectNode(id) {
    selected = id;
    var node = byID.get(id);
    if (!node) return;
    var details = root.querySelector("[data-lineage-details]");
    details.replaceChildren(element("h3", node.label));
    var dl = element("dl");
    [
      "qualifiedName",
      "id",
      "domain",
      "layer",
      "kind",
      "repo",
      "system",
      "classification",
      "summary",
    ].forEach(function (key) {
      dl.append(element("dt", key), element("dd", node[key] || "—"));
    });
    details.appendChild(dl);
    (node.caveats || []).forEach(function (text) {
      details.appendChild(element("p", text));
    });
    details.appendChild(element("h4", labels.evidence));
    appendEvidence(details, node.evidence || []);
    var edges = catalog.edges.filter(function (edge) {
      return edge.source === id || edge.target === id;
    });
    var list = element("ul");
    edges.forEach(function (edge) {
      var item = element(
        "li",
        edge.source +
          " → " +
          edge.target +
          " · " +
          edge.relation +
          " · " +
          edge.confidence +
          " · " +
          (edge.summary || ""),
      );
      appendEvidence(item, edge.evidence || []);
      list.appendChild(item);
    });
    details.appendChild(list);
    var nearby = element("button", labels.neighborhood);
    nearby.type = "button";
    nearby.addEventListener("click", function () {
      mode.value = "neighborhood";
      graphOpen = true;
      authorized(renderGraph);
    });
    details.appendChild(nearby);
    if (graphOpen && mode.value === "neighborhood") renderGraph();
  }

  function appendEvidence(target, ids) {
    ids.forEach(function (id) {
      var item = evidence.get(id);
      if (!item) {
        target.appendChild(element("code", id));
        return;
      }
      var text = [item.repo, item.commit, item.path, item.line || ""].join(":");
      var reference = element("code", text);
      if (typeof item.url === "string") {
        try {
          var url = new URL(item.url);
          if (
            url.protocol === "https:" &&
            url.hostname === "github.com" &&
            !url.username &&
            !url.password &&
            url.pathname.includes("/blob/" + item.commit + "/") &&
            /^[a-f0-9]{40}$/.test(item.commit)
          ) {
            var link = element("a");
            link.href = url.href;
            link.rel = "noopener noreferrer";
            link.target = "_blank";
            link.appendChild(reference);
            reference = link;
          }
        } catch (_) {}
      }
      target.appendChild(reference);
      if (item.sha256)
        target.appendChild(element("small", "sha256:" + item.sha256));
    });
  }

  function renderTable() {
    if (!catalog) return;
    var rows = filtered(),
      pages = Math.max(1, Math.ceil(rows.length / pageSize));
    page = Math.min(Math.max(1, page), pages);
    var table = element("table"),
      head = element("thead"),
      header = element("tr"),
      body = element("tbody");
    body.dataset.lineageRows = "";
    [
      "Object",
      "Domain",
      "Layer",
      "System",
      "Classification",
      "Repository",
    ].forEach(function (text) {
      var th = element("th", text);
      th.scope = "col";
      header.appendChild(th);
    });
    head.appendChild(header);
    table.append(head, body);
    rows.slice((page - 1) * pageSize, page * pageSize).forEach(function (node) {
      var tr = element("tr"),
        th = element("th"),
        button = element("button", node.label);
      th.scope = "row";
      button.type = "button";
      button.dataset.lineageNode = node.id;
      button.addEventListener("click", function () {
        authorized(function () {
          selectNode(node.id);
        });
      });
      th.append(button, element("code", node.qualifiedName || node.id));
      tr.appendChild(th);
      [
        node.domain,
        node.layer,
        node.system,
        node.classification,
        node.repo,
      ].forEach(function (value) {
        tr.appendChild(element("td", value || "—"));
      });
      body.appendChild(tr);
    });
    if (!rows.length) {
      var tr = element("tr"),
        td = element("td", labels.empty);
      td.colSpan = 6;
      tr.appendChild(td);
      body.appendChild(tr);
    }
    root.querySelector(".sg-lineage-table").replaceChildren(table);
    var pagination = root.querySelector("[data-lineage-pagination]");
    pagination.replaceChildren();
    function pageLink(value, text) {
      var link = element("a", text),
        query = values();
      query.set("page", String(value));
      link.href = "/admin/data-lineage/?" + query.toString();
      link.addEventListener("click", function (event) {
        event.preventDefault();
        authorized(function () {
          page = value;
          renderTable();
        });
      });
      return link;
    }
    if (page > 1) pagination.appendChild(pageLink(page - 1, labels.previous));
    pagination.appendChild(
      element("span", number.format(page) + " / " + number.format(pages)),
    );
    if (page < pages) pagination.appendChild(pageLink(page + 1, labels.next));
    status.textContent =
      number.format(rows.length) +
      " / " +
      number.format(catalog.nodes.length) +
      " · " +
      number.format(page) +
      " / " +
      number.format(pages);
    root.dataset.lineageMatches = String(rows.length);
    var query = values();
    if (page > 1) query.set("page", String(page));
    history.replaceState(
      null,
      "",
      location.pathname + (query.toString() ? "?" + query.toString() : ""),
    );
  }

  function graphData() {
    var nodes = filtered(),
      ids = new Set(
        nodes.map(function (node) {
          return node.id;
        }),
      );
    if (mode.value === "neighborhood") {
      ids = new Set(selected ? [selected] : []);
      catalog.edges.forEach(function (edge) {
        if (edge.source === selected || edge.target === selected) {
          ids.add(edge.source);
          ids.add(edge.target);
        }
      });
      nodes = catalog.nodes.filter(function (node) {
        return ids.has(node.id);
      });
    }
    var edges = catalog.edges.filter(function (edge) {
      return ids.has(edge.source) && ids.has(edge.target);
    });
    if (mode.value !== "overview") {
      if (nodes.length > 160 || edges.length > 1000)
        throw new Error(
          labels.graphHint +
            " " +
            number.format(nodes.length) +
            " objects / " +
            number.format(edges.length) +
            " relations",
        );
      return { nodes: nodes, edges: edges };
    }
    var groups = new Map(),
      mapping = new Map(),
      groupedEdges = new Map();
    nodes.forEach(function (node) {
      var id = node.domain + "::" + node.layer;
      if (!groups.has(id))
        groups.set(id, {
          id: id,
          label: node.domain + " · " + node.layer,
          domain: node.domain,
          layer: node.layer,
          count: 0,
        });
      groups.get(id).count += 1;
      mapping.set(node.id, id);
    });
    edges.forEach(function (edge) {
      var source = mapping.get(edge.source),
        target = mapping.get(edge.target),
        id = source + "→" + target;
      if (source !== target && !groupedEdges.has(id))
        groupedEdges.set(id, { id: id, source: source, target: target });
    });
    return {
      nodes: Array.from(groups.values()).map(function (node) {
        node.label += " (" + number.format(node.count) + ")";
        return node;
      }),
      edges: Array.from(groupedEdges.values()),
    };
  }

  var runtimePromise = null;
  function runtime() {
    if (window.Graflume && typeof window.Graflume.network === "function")
      return Promise.resolve(window.Graflume);
    if (runtimePromise) return runtimePromise;
    runtimePromise = new Promise(function (resolve, reject) {
      function append(fallback) {
        var script = element("script"),
          settled = false;
        script.src = fallback
          ? root.dataset.runtimeFallbackUrl
          : root.dataset.runtimeUrl;
        script.integrity = fallback
          ? root.dataset.runtimeFallbackSri
          : root.dataset.runtimeSri;
        script.crossOrigin = "anonymous";
        var timeout = setTimeout(failed, 10000);
        function failed() {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          script.remove();
          if (!fallback && root.dataset.runtimeFallbackUrl) append(true);
          else {
            runtimePromise = null;
            reject(new Error("runtime unavailable"));
          }
        }
        script.onload = function () {
          if (settled) return;
          if (
            !window.Graflume ||
            typeof window.Graflume.network !== "function"
          ) {
            failed();
            return;
          }
          settled = true;
          clearTimeout(timeout);
          resolve(window.Graflume);
        };
        script.onerror = failed;
        document.head.appendChild(script);
      }
      append(false);
    });
    return runtimePromise;
  }

  async function renderGraph() {
    if (!catalog || !graphOpen || !active) return;
    var version = generation;
    try {
      var graph = graphData();
      if (!graph.nodes.length) {
        if (chart) chart.destroy();
        chart = null;
        mount.replaceChildren();
        mount.hidden = true;
        root.querySelector("[data-lineage-columns]").hidden = true;
        root.querySelector("[data-lineage-graph-key]").replaceChildren();
        graphStatus.textContent = labels.empty;
        root.dataset.lineageGraphNodes = "0";
        root.dataset.lineageGraphState = "empty";
        return;
      }
      var api = await runtime();
      if (version !== generation || !catalog || !active) return;
      if (chart) chart.destroy();
      chart = null;
      mount.replaceChildren();
      mount.hidden = false;
      var layers = ["inbound", "L0", "L1", "L2", "L3", "unclassified"],
        columns = new Map(),
        rows = [];
      graph.nodes.forEach(function (node) {
        var layer = layers.includes(node.layer) ? node.layer : "unclassified";
        if (!columns.has(layer)) columns.set(layer, []);
        columns.get(layer).push(node);
      });
      var maximumRows = Math.max(
        1,
        ...Array.from(columns.values()).map(function (nodes) {
          return nodes.length;
        }),
      );
      currentGraphHeight = Math.max(580, maximumRows * 40 + 112);
      mount.style.height = currentGraphHeight + "px";
      root.querySelector("[data-lineage-columns]").hidden = false;
      var key = root.querySelector("[data-lineage-graph-key]");
      key.replaceChildren();
      columns.forEach(function (nodes, layer) {
        nodes.sort(function (a, b) {
          return (a.domain + a.label).localeCompare(b.domain + b.label);
        });
        nodes.forEach(function (node, index) {
          rows.push({
            node: node.id,
            source: null,
            target: null,
            fullLabel: node.label,
            displayLabel:
              mode.value === "overview"
                ? String(node.domain).slice(0, compactGraph.matches ? 3 : 16) +
                  (String(node.domain).length > (compactGraph.matches ? 3 : 16)
                    ? "…"
                    : "") +
                  " " +
                  number.format(node.count)
                : String(node.label).slice(0, compactGraph.matches ? 5 : 22) +
                  (String(node.label).length > (compactGraph.matches ? 5 : 22)
                    ? "…"
                    : ""),
            role: layer,
            nodeX: (layers.indexOf(layer) + 0.5) / layers.length,
            nodeY: (index + 1) / (nodes.length + 1),
            pinned: true,
            value: node.count || 1,
          });
          var entry = element("button", node.label);
          entry.type = "button";
          entry.addEventListener("click", function () {
            authorized(function () {
              if (byID.has(node.id)) selectNode(node.id);
              else {
                form.elements.domain.value = node.domain;
                form.elements.layer.value = node.layer;
                page = 1;
                renderTable();
              }
            });
          });
          key.appendChild(entry);
        });
      });
      graph.edges.forEach(function (edge) {
        rows.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          value: 1,
          directed: true,
          fullLabel: edge.source + " → " + edge.target,
        });
      });
      chart = api.network(mount, rows, {
        width: "container",
        height: currentGraphHeight,
        padding: { left: 16, right: 16, top: 48, bottom: 32 },
        theme: {
          extends: "graflume-light",
          typography: { fontSize: compactGraph.matches ? 10 : 12 },
        },
        x: { field: "source", type: "ordinal" },
        y: { field: "value", type: "quantitative" },
        axes: { x: false, y: false },
        legend: false,
        mark: {
          stroke: "rgba(100,116,139,0.24)",
          fields: {
            source: "source",
            target: "target",
            node: "node",
            label: "displayLabel",
            group: "role",
            nodeX: "nodeX",
            nodeY: "nodeY",
            pinned: "pinned",
            edgeId: "id",
            weight: "value",
            directed: "directed",
          },
          options: { layout: "dag", routing: "orthogonal", directed: true },
        },
        interaction: {
          tooltip: {
            fields: [
              { field: "fullLabel", label: "Object" },
              { field: "node", label: "ID" },
              { field: "role", label: "Layer" },
            ],
          },
          navigation: {
            minZoom: 1,
            maxZoom: 6,
            wheel: "modifier",
            drag: true,
            pinch: true,
            keyboard: true,
          },
          controls: { zoom: true, reset: true, fullscreen: true, export: true },
        },
      });
      chart.on("click", function (event) {
        var hit = event.hit && event.hit.familyInteraction;
        if (!hit || hit.kind !== "network-node") return;
        authorized(function () {
          if (byID.has(hit.id)) selectNode(hit.id);
          else {
            var parts = hit.id.split("::");
            form.elements.domain.value = parts[0];
            form.elements.layer.value = parts[1];
            page = 1;
            renderTable();
          }
        });
      });
      graphStatus.textContent =
        layers.join(" → ") +
        " · " +
        number.format(graph.nodes.length) +
        " nodes / " +
        number.format(graph.edges.length) +
        " relations";
      root.dataset.lineageGraphNodes = String(graph.nodes.length);
      root.dataset.lineageGraphHeight = String(currentGraphHeight);
      root.dataset.lineageGraphState = "ready";
    } catch (error) {
      if (chart) chart.destroy();
      chart = null;
      mount.replaceChildren();
      mount.hidden = true;
      root.querySelector("[data-lineage-columns]").hidden = true;
      root.querySelector("[data-lineage-graph-key]").replaceChildren();
      graphStatus.textContent = String(error.message || labels.unavailable);
      root.dataset.lineageGraphState = "unavailable";
    }
  }

  function gaps() {
    var target = root.querySelector("[data-lineage-gaps]");
    target.replaceChildren();
    catalog.gaps.forEach(function (gap) {
      var entry = element("article");
      entry.append(element("h3", gap.id), element("p", gap.summary || ""));
      appendEvidence(entry, gap.evidence || []);
      target.appendChild(entry);
    });
    var repositories = root.querySelector("[data-lineage-repositories]");
    repositories.replaceChildren();
    catalog.repositories.forEach(function (repo) {
      var entry = element("article");
      entry.append(
        element("h3", repo.id),
        element(
          "code",
          [repo.head, repo.branch, repo.role, repo.status]
            .filter(Boolean)
            .join(" · "),
        ),
        element(
          "p",
          Array.isArray(repo.notes) ? repo.notes.join(" · ") : repo.notes || "",
        ),
      );
      repositories.appendChild(entry);
    });
  }

  async function load() {
    if (!active) return;
    var version = ++generation;
    controller = new AbortController();
    try {
      var response = await fetch(requestURL(false), {
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("authority or catalog unavailable");
      var value = await response.json();
      if (version !== generation || !active) return;
      if (
        value.schema !== "statground.data-lineage.v1" ||
        !Array.isArray(value.nodes) ||
        !Array.isArray(value.edges)
      )
        throw new Error("catalog invalid");
      catalog = value;
      ["repositories", "evidence", "gaps", "domains", "layers"].forEach(
        function (key) {
          if (!Array.isArray(catalog[key])) catalog[key] = [];
        },
      );
      byID = new Map(
        catalog.nodes.map(function (node) {
          return [node.id, node];
        }),
      );
      evidence = new Map(
        catalog.evidence.map(function (item) {
          return [item.id, item];
        }),
      );
      options("domain", catalog.domains);
      options("layer", catalog.layers);
      options(
        "system",
        Array.from(
          new Set(
            catalog.nodes
              .map(function (node) {
                return node.system;
              })
              .filter(Boolean),
          ),
        )
          .sort()
          .map(function (id) {
            return { id: id, label: id };
          }),
      );
      options(
        "classification",
        ["observed", "candidate", "unclassified"].map(function (id) {
          return { id: id, label: id };
        }),
      );
      countSummary();
      renderTable();
      gaps();
      root.dataset.lineageState = "ready";
      if (graphOpen) renderGraph();
    } catch (error) {
      if (version === generation && error.name !== "AbortError") retire();
    }
  }

  form.addEventListener("submit", function (event) {
    if (!catalog) return;
    event.preventDefault();
    authorized(function () {
      page = 1;
      renderTable();
      if (graphOpen) renderGraph();
    });
  });
  root
    .querySelector("[data-lineage-open-graph]")
    .addEventListener("click", function () {
      graphOpen = true;
      authorized(renderGraph);
    });
  mode.addEventListener("change", function () {
    if (graphOpen) authorized(renderGraph);
  });
  document.addEventListener("visibilitychange", function () {
    active = !document.hidden;
    if (!active) retire();
    else load();
  });
  window.addEventListener("pagehide", function () {
    active = false;
    retire();
    if (timer) clearInterval(timer);
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      active = true;
      load();
      timer = setInterval(function () {
        if (active && catalog) authorized(function () {});
      }, 30000);
    }
  });
  timer = setInterval(function () {
    if (active && catalog) authorized(function () {});
  }, 30000);
  if (typeof ResizeObserver === "function") {
    var previousWidth = 0;
    new ResizeObserver(function () {
      var width = mount.clientWidth;
      if (chart && width && width !== previousWidth) {
        previousWidth = width;
        chart.resize(width, currentGraphHeight);
      }
    }).observe(mount);
  }
  compactGraph.addEventListener("change", function () {
    if (active && catalog && graphOpen) renderGraph();
  });
  page = Math.max(
    1,
    Number(new URLSearchParams(location.search).get("page")) || 1,
  );
  load();
})();
