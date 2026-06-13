(function () {
  "use strict";

  var activeClass = "statground-admin-visit-tab rounded-t-lg px-5 py-4 text-sm font-bold text-blue-600 bg-slate-100";
  var inactiveClass = "statground-admin-visit-tab rounded-t-lg px-5 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50";
  var chart = null;
  var resizeObserver = null;

  function readData() {
    var el = document.getElementById("statground-admin-visits-data");
    if (!el) {
      return null;
    }
    try {
      return JSON.parse(el.textContent || "{}");
    } catch (error) {
      return null;
    }
  }

  function rowsFor(data, kind) {
    var key = kind === "daily" ? "Daily" : kind === "yearly" ? "Yearly" : "Monthly";
    return Array.isArray(data && data[key]) ? data[key] : [];
  }

  function setActiveTab(kind) {
    document.querySelectorAll(".statground-admin-visit-tab").forEach(function (tab) {
      tab.className = tab.getAttribute("data-series") === kind ? activeClass : inactiveClass;
    });
  }

  function toRows(data, kind) {
    return rowsFor(data, kind).slice().sort(function (a, b) {
      return String(a.Date || "").localeCompare(String(b.Date || ""));
    });
  }

  function ensureChartSize(el) {
    el.style.minHeight = el.style.minHeight || "520px";
    if (!el.style.height && el.offsetHeight < 320) {
      el.style.height = "520px";
    }
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function attachResize(el) {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(function () {
        if (chart) {
          chart.resize();
        }
      });
      resizeObserver.observe(el);
    }
  }

  function renderFallback(el, rows) {
    var maxPageview = rows.reduce(function (max, row) {
      return Math.max(max, Number(row.Pageview || 0));
    }, 1);
    var maxVisitor = rows.reduce(function (max, row) {
      return Math.max(max, Number(row.Visitor || 0));
    }, 1);
    var recent = rows.slice(-24);
    el.innerHTML = [
      '<div style="height:520px;display:flex;flex-direction:column;gap:16px;padding:28px 16px 18px;">',
      '<div style="text-align:center;font-size:26px;font-weight:800;color:#334155;">방문 추이 그래프</div>',
      '<div style="display:flex;justify-content:center;gap:18px;font-size:13px;font-weight:700;color:#475569;">',
      '<span><i style="display:inline-block;width:30px;height:14px;border-radius:4px;background:#5470de;margin-right:6px;vertical-align:-2px;"></i>방문자 수</span>',
      '<span><i style="display:inline-block;width:30px;height:14px;border-radius:4px;background:#b7df23;margin-right:6px;vertical-align:-2px;"></i>페이지 뷰</span>',
      '</div>',
      '<div style="flex:1;display:flex;align-items:flex-end;gap:10px;border-bottom:1px solid #cbd5e1;border-left:1px solid #e2e8f0;padding:12px 10px 24px;overflow-x:auto;">',
      recent.map(function (row) {
        var pageviewHeight = Math.max(4, Math.round((Number(row.Pageview || 0) / maxPageview) * 300));
        var visitorHeight = Math.max(4, Math.round((Number(row.Visitor || 0) / maxVisitor) * 300));
        return [
          '<div style="min-width:44px;display:flex;flex-direction:column;align-items:center;gap:6px;">',
          '<div style="height:310px;display:flex;align-items:flex-end;gap:3px;">',
          '<span title="방문자 수 ', Number(row.Visitor || 0).toLocaleString("ko-KR"), '" style="width:16px;height:', visitorHeight, 'px;background:#5470de;border-radius:3px 3px 0 0;"></span>',
          '<span title="페이지 뷰 ', Number(row.Pageview || 0).toLocaleString("ko-KR"), '" style="width:16px;height:', pageviewHeight, 'px;background:#b7df23;border-radius:3px 3px 0 0;"></span>',
          '</div>',
          '<div style="font-size:11px;color:#64748b;white-space:nowrap;">', escapeHTML(row.Date), '</div>',
          '</div>'
        ].join("");
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function drawNow(kind) {
    var data = readData();
    var el = document.getElementById("statground-admin-visits-chart");
    if (!data || !el) {
      return false;
    }

    setActiveTab(kind);
    ensureChartSize(el);

    var rows = toRows(data, kind);
    if (!rows.length) {
      renderFallback(el, rows);
      return true;
    }
    if (!window.echarts) {
      return false;
    }

    var categories = rows.map(function (row) { return row.Date || ""; });
    var visitors = rows.map(function (row) { return Number(row.Visitor || 0); });
    var pageviews = rows.map(function (row) { return Number(row.Pageview || 0); });

    try {
      if (chart) {
        chart.dispose();
      }
      el.innerHTML = "";
      chart = window.echarts.init(el, null, { renderer: "canvas" });
      chart.setOption({
        title: {
          text: "방문 추이 그래프",
          left: "center",
          top: 0,
          textStyle: { fontSize: 26, fontWeight: 800, color: "#334155" }
        },
        color: ["#5470de", "#b7df23"],
        legend: {
          data: ["방문자 수", "페이지 뷰"],
          top: 42,
          textStyle: { color: "#475569", fontWeight: 600 }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          valueFormatter: function (value) {
            return Number(value || 0).toLocaleString("ko-KR");
          }
        },
        toolbox: {
          right: 10,
          top: 18,
          feature: {
            dataZoom: { yAxisIndex: "none" },
            restore: {},
            saveAsImage: {}
          }
        },
        grid: { left: 72, right: 72, top: 92, bottom: 76 },
        xAxis: {
          type: "category",
          data: categories,
          axisLabel: { color: "#64748b", interval: "auto" },
          axisLine: { lineStyle: { color: "#cbd5e1" } }
        },
        yAxis: [
          {
            type: "value",
            name: "방문자 수",
            nameTextStyle: { color: "#64748b", fontWeight: 700 },
            axisLabel: { color: "#64748b", formatter: function (value) { return Number(value).toLocaleString("ko-KR"); } },
            splitLine: { lineStyle: { color: "#e2e8f0" } }
          },
          {
            type: "value",
            name: "페이지 뷰",
            nameTextStyle: { color: "#64748b", fontWeight: 700 },
            axisLabel: { color: "#64748b", formatter: function (value) { return Number(value).toLocaleString("ko-KR"); } },
            splitLine: { show: false }
          }
        ],
        dataZoom: [
          { type: "inside", xAxisIndex: 0, zoomOnMouseWheel: true, moveOnMouseMove: true },
          { type: "slider", xAxisIndex: 0, height: 28, bottom: 28 }
        ],
        series: [
          { name: "방문자 수", type: "bar", yAxisIndex: 0, data: visitors, barMaxWidth: 28 },
          { name: "페이지 뷰", type: "bar", yAxisIndex: 1, data: pageviews, barMaxWidth: 28 }
        ]
      });
      attachResize(el);
      requestAnimationFrame(function () {
        if (chart) {
          chart.resize();
        }
      });
      window.setTimeout(function () {
        if (chart) {
          chart.resize();
        }
      }, 400);
      return true;
    } catch (error) {
      renderFallback(el, rows);
      return true;
    }
  }

  function draw(kind, attempt) {
    if (drawNow(kind)) {
      return;
    }
    if (attempt < 60) {
      window.setTimeout(function () {
        draw(kind, attempt + 1);
      }, 100);
      return;
    }
    var data = readData();
    var el = document.getElementById("statground-admin-visits-chart");
    if (data && el) {
      renderFallback(el, toRows(data, kind));
    }
  }

  function init() {
    document.querySelectorAll(".statground-admin-visit-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        draw(tab.getAttribute("data-series") || "monthly", 0);
      });
    });
    draw("monthly", 0);
    window.addEventListener("load", function () {
      draw("monthly", 0);
    }, { once: true });
    window.addEventListener("resize", function () {
      if (chart) {
        chart.resize();
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
