(function () {
  "use strict";

  var activeClass = "statground-admin-visit-tab rounded-t-lg px-5 py-4 text-sm font-bold text-blue-600 bg-slate-100";
  var inactiveClass = "statground-admin-visit-tab rounded-t-lg px-5 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50";
  var chart = null;

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

  function draw(kind) {
    var data = readData();
    var el = document.getElementById("statground-admin-visits-chart");
    if (!data || !el || !window.echarts) {
      return;
    }

    setActiveTab(kind);

    var rows = rowsFor(data, kind).slice().sort(function (a, b) {
      return String(a.Date || "").localeCompare(String(b.Date || ""));
    });
    var categories = rows.map(function (row) { return row.Date || ""; });
    var visitors = rows.map(function (row) { return Number(row.Visitor || 0); });
    var pageviews = rows.map(function (row) { return Number(row.Pageview || 0); });

    if (chart) {
      chart.dispose();
    }
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
    requestAnimationFrame(function () {
      if (chart) {
        chart.resize();
      }
    });
  }

  function init() {
    document.querySelectorAll(".statground-admin-visit-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        draw(tab.getAttribute("data-series") || "monthly");
      });
    });
    draw("monthly");
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
