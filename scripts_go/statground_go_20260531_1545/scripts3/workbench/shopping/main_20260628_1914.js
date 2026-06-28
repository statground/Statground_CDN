(function () {
  const dict = {
    ko: {
      back: "워크벤치",
      title: "Shopping Radar",
      desc: "Gmarket 수집 데이터로 가격대, 할인 신호, 카테고리 벤치마크를 관찰합니다.",
      notice: "모든 수치는 Statground가 수집한 시점과 범위 안의 관측값입니다. 최저가 보장이나 구매 권유가 아니며, 가격과 판매 여부는 원문 상품 페이지에서 확인해야 합니다.",
      provider: "Gmarket",
      loading: "레이더를 불러오는 중...",
      loadError: "쇼핑 레이더를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      products: "관측 상품",
      categories: "카테고리",
      discounted: "할인 신호",
      lowPrice: "1만원 이하",
      median: "중앙값",
      collected: "최근 수집",
      benchmark: "카테고리 가격 벤치마크",
      candidates: "저가/할인 후보",
      drops: "가격 하락 후보",
      noDrops: "같은 상품의 두 번 이상 관측이 쌓이면 가격 하락 후보가 표시됩니다.",
      searchTitle: "상품/키워드 탐색",
      searchPlaceholder: "상품명, 카테고리, 키워드 검색...",
      search: "검색",
      searchResults: "검색 결과",
      searching: "검색하는 중...",
      noResults: "검색 결과가 없습니다.",
      searchError: "쇼핑 데이터를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      source: "원문 보기",
      price: "가격",
      originalPrice: "표시 정가",
      categoryMedian: "카테고리 중앙값",
      reason: "후보 사유",
      category: "카테고리",
      productCode: "상품 코드",
      range: "가격 범위",
      lowShare: "저가 비중",
      discountShare: "할인 비중",
      previous: "이전 관측",
      current: "현재 관측"
    },
    en: {
      back: "Workbench",
      title: "Shopping Radar",
      desc: "Observe price ranges, discount signals, and category benchmarks from collected Gmarket data.",
      notice: "All metrics are observations within Statground's collection scope and time. They are not a lowest-price guarantee or purchase recommendation; check the original product page for current price and availability.",
      provider: "Gmarket",
      loading: "Loading radar...",
      loadError: "Failed to load Shopping Radar. Please try again.",
      products: "Observed products",
      categories: "Categories",
      discounted: "Discount signals",
      lowPrice: "Under KRW 10,000",
      median: "Median",
      collected: "Latest collection",
      benchmark: "Category price benchmark",
      candidates: "Low-price candidates",
      drops: "Price-drop candidates",
      noDrops: "Price-drop candidates appear after the same product is observed at least twice.",
      searchTitle: "Product and keyword search",
      searchPlaceholder: "Search title, category, keyword...",
      search: "Search",
      searchResults: "Search results",
      searching: "Searching...",
      noResults: "No results.",
      searchError: "Failed to search shopping data. Please try again.",
      source: "Open source",
      price: "Price",
      originalPrice: "Listed original",
      categoryMedian: "Category median",
      reason: "Signal",
      category: "Category",
      productCode: "Product code",
      range: "Price range",
      lowShare: "Low-price share",
      discountShare: "Discount share",
      previous: "Previous",
      current: "Current"
    }
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function displayLang(lang) {
    const raw = String(lang || "").trim();
    const lower = raw.toLowerCase();
    if (!raw) return "ko";
    if (lower === "zh" || lower.startsWith("zh-")) {
      return lower.includes("tw") || lower.includes("hk") || lower.includes("mo") || lower.includes("hant") ? "zh-Hant" : "zh-Hans";
    }
    if (lower === "pt" || lower.startsWith("pt-")) return "pt-BR";
    if (lower === "tl" || lower.startsWith("tl-") || lower === "fil" || lower.startsWith("fil-")) return "fil";
    const supported = ["ko", "en", "ja", "zh-Hans", "zh-Hant", "es", "fr", "de", "pt-BR", "ru", "id", "vi", "th", "ms", "fil", "hi", "ar", "it", "nl", "pl", "sv", "tr", "uk"];
    return supported.find((code) => lower === code.toLowerCase() || lower.startsWith(code.toLowerCase() + "-")) || "ko";
  }

  function routeLang() {
    const seg = (location.pathname || "").split("/").filter(Boolean);
    if (seg.length > 0 && seg[0] !== "workbench") return displayLang(seg[0]);
    if (window.sg_get_current_lang) return displayLang(window.sg_get_current_lang());
    return displayLang(document.documentElement.getAttribute("lang") || "ko");
  }

  function eventLang(event) {
    const raw = event && event.detail && event.detail.lang ? String(event.detail.lang).trim() : "";
    return raw ? displayLang(raw) : "";
  }

  function syncLangToURL(lang) {
    const langCode = displayLang(lang);
    if (!langCode) return false;
    const parts = (location.pathname || "/").split("/").filter(Boolean);
    const workbenchIndex = parts.indexOf("workbench");
    if (workbenchIndex < 0) return false;
    if (workbenchIndex === 0) {
      parts.unshift(langCode);
    } else {
      parts[0] = langCode;
    }
    const next = "/" + parts.join("/") + "/" + (location.search || "") + (location.hash || "");
    const current = (location.pathname || "/") + (location.search || "") + (location.hash || "");
    if (next !== current) {
      location.href = next;
      return true;
    }
    return false;
  }

  function t(lang, key) {
    const d = dict[displayLang(lang)] || dict[String(lang || "").slice(0, 2)] || dict.en;
    return d[key] || dict.en[key] || dict.ko[key] || key;
  }

  function number(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return "";
    try { return new Intl.NumberFormat().format(Math.round(n)); } catch (_) { return String(Math.round(n)); }
  }

  function pct(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return "0%";
    return (Math.round(n * 10) / 10).toString() + "%";
  }

  function krw(value) {
    const v = number(value);
    return v ? "KRW " + v : "-";
  }

  function apiURL(lang, kind, params) {
    const base = "/" + encodeURIComponent(displayLang(lang)) + "/workbench/shopping/" + kind + "/";
    const query = new URLSearchParams(params || {});
    return base + (query.toString() ? "?" + query.toString() : "");
  }

  function fetchJSON(url) {
    return fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "same-origin" })
      .then((res) => res.text().then((text) => {
        let json = null;
        try { json = JSON.parse(text); } catch (_) {}
        return { ok: res.ok && !!(json && json.ok), status: res.status, json: json };
      }));
  }

  function cartIcon() {
    return [
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">',
      '<path stroke-width="2" d="M6 6h15l-2 8H8L6 3H3"></path>',
      '<circle cx="9" cy="20" r="1.8" stroke-width="2"></circle>',
      '<circle cx="18" cy="20" r="1.8" stroke-width="2"></circle>',
      '</svg>'
    ].join("");
  }

  function statCard(title, value, sub) {
    return [
      '<div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="text-xs font-bold uppercase tracking-normal text-slate-500">' + esc(title) + '</div>',
      '<div class="mt-2 text-2xl font-black text-slate-950">' + esc(value) + '</div>',
      sub ? '<div class="mt-1 text-xs text-slate-500">' + esc(sub) + '</div>' : '',
      '</div>'
    ].join("");
  }

  function renderSummary(lang, summary) {
    const s = summary || {};
    return [
      '<section class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">',
      statCard(t(lang, "products"), number(s.product_count || 0), t(lang, "collected") + " " + (s.latest_collected_at || "-")),
      statCard(t(lang, "categories"), number(s.category_count || 0), t(lang, "median") + " " + krw(s.median_price_krw || 0)),
      statCard(t(lang, "discounted"), number(s.discounted_count || 0), pct(s.discounted_percent || 0)),
      statCard(t(lang, "lowPrice"), number(s.low_price_count || 0), pct(s.low_price_percent || 0)),
      '</section>'
    ].join("");
  }

  function renderBenchmark(lang, categories) {
    const rows = (categories || []).map((item) => {
      const low = Math.max(0, Math.min(100, Number(item.low_price_percent || 0)));
      const discounted = Math.max(0, Math.min(100, Number(item.discounted_percent || 0)));
      return [
        '<tr class="border-b border-slate-100 last:border-b-0">',
        '<td class="py-3 pr-4 align-top">',
        '<div class="text-sm font-black text-slate-950">' + esc(item.source_category || "-") + '</div>',
        '<div class="mt-1 text-xs text-slate-500">' + esc(number(item.product_count || 0)) + '</div>',
        '</td>',
        '<td class="py-3 pr-4 align-top text-xs text-slate-600">' + esc(krw(item.min_price_krw)) + ' - ' + esc(krw(item.max_price_krw)) + '<br><span class="font-bold text-slate-900">' + esc(krw(item.median_price_krw)) + '</span></td>',
        '<td class="py-3 pr-4 align-top">',
        '<div class="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><div class="h-full bg-emerald-500" style="width:' + esc(low) + '%"></div></div>',
        '<div class="mt-1 text-xs text-slate-500">' + esc(pct(item.low_price_percent)) + '</div>',
        '</td>',
        '<td class="py-3 align-top">',
        '<div class="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><div class="h-full bg-sky-500" style="width:' + esc(discounted) + '%"></div></div>',
        '<div class="mt-1 text-xs text-slate-500">' + esc(pct(item.discounted_percent)) + '</div>',
        '</td>',
        '</tr>'
      ].join("");
    }).join("");
    return [
      '<section class="rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<div class="border-b border-slate-200 px-5 py-4">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "benchmark")) + '</h2>',
      '</div>',
      '<div class="overflow-x-auto px-5">',
      '<table class="min-w-full">',
      '<thead><tr class="border-b border-slate-200 text-left text-xs font-black text-slate-500">',
      '<th class="py-3 pr-4">' + esc(t(lang, "category")) + '</th>',
      '<th class="py-3 pr-4">' + esc(t(lang, "range")) + '</th>',
      '<th class="py-3 pr-4">' + esc(t(lang, "lowShare")) + '</th>',
      '<th class="py-3">' + esc(t(lang, "discountShare")) + '</th>',
      '</tr></thead>',
      '<tbody>' + rows + '</tbody>',
      '</table>',
      '</div>',
      '</section>'
    ].join("");
  }

  function productCard(lang, item) {
    const url = String(item && item.product_url ? item.product_url : "").trim();
    const source = url
      ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700">' + esc(t(lang, "source")) + '</a>'
      : "";
    return [
      '<article class="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex items-start gap-3">',
      '<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">' + cartIcon() + '</div>',
      '<div class="min-w-0 flex-1">',
      '<div class="line-clamp-2 text-sm font-black leading-5 text-slate-950">' + esc(item && item.product_name ? item.product_name : "") + '</div>',
      '<div class="mt-1 flex flex-wrap gap-1 text-[11px] font-bold text-slate-500">',
      '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(item && item.source_category ? item.source_category : t(lang, "provider")) + '</span>',
      item && item.product_code ? '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(item.product_code) + '</span>' : '',
      '</div>',
      '</div>',
      '</div>',
      '<dl class="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-600">',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "price")) + '</dt><dd class="font-black text-slate-950">' + esc(krw(item && item.price_krw)) + '</dd></div>',
      item && item.original_price_krw ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "originalPrice")) + '</dt><dd>' + esc(krw(item.original_price_krw)) + '</dd></div>' : '',
      item && item.category_median_price_krw ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "categoryMedian")) + '</dt><dd>' + esc(krw(item.category_median_price_krw)) + '</dd></div>' : '',
      item && item.reason ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "reason")) + '</dt><dd class="text-right">' + esc(item.reason) + '</dd></div>' : '',
      item && item.collected_at ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "collected")) + '</dt><dd class="text-right">' + esc(item.collected_at) + '</dd></div>' : '',
      '</dl>',
      '<div class="mt-auto pt-4">' + source + '</div>',
      '</article>'
    ].join("");
  }

  function productGrid(lang, items) {
    if (!items || !items.length) {
      return '<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "noResults")) + '</div>';
    }
    return '<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">' + items.map((item) => productCard(lang, item)).join("") + '</div>';
  }

  function renderDrops(lang, drops) {
    if (!drops || !drops.length) {
      return '<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "noDrops")) + '</div>';
    }
    return '<div class="grid grid-cols-1 gap-4 md:grid-cols-2">' + drops.map((item) => [
      '<article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="text-sm font-black text-slate-950 line-clamp-2">' + esc(item.product_name || "") + '</div>',
      '<div class="mt-2 text-xs font-bold text-rose-600">-' + esc(pct(item.drop_percent)) + '</div>',
      '<dl class="mt-3 grid gap-2 text-xs text-slate-600">',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "previous")) + '</dt><dd>' + esc(krw(item.previous_price_krw)) + '</dd></div>',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "current")) + '</dt><dd class="font-black text-slate-950">' + esc(krw(item.price_krw)) + '</dd></div>',
      '</dl>',
      item.product_url ? '<a href="' + esc(item.product_url) + '" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700">' + esc(t(lang, "source")) + '</a>' : '',
      '</article>'
    ].join("")).join("") + '</div>';
  }

  function renderRadar(lang, radar) {
    const r = radar || {};
    return [
      renderSummary(lang, r.summary || {}),
      '<div class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">',
      renderBenchmark(lang, r.categories || []),
      '<section class="rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<div class="border-b border-slate-200 px-5 py-4"><h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "drops")) + '</h2></div>',
      '<div class="p-5">' + renderDrops(lang, r.price_drop_candidates || []) + '</div>',
      '</section>',
      '</div>',
      '<section class="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<div class="border-b border-slate-200 px-5 py-4"><h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "candidates")) + '</h2></div>',
      '<div class="p-5">' + productGrid(lang, r.deal_candidates || []) + '</div>',
      '</section>'
    ].join("");
  }

  function render(langOverride) {
    const root = document.getElementById("div_main");
    if (!root) return;
    const lang = displayLang(langOverride || routeLang());
    const backHref = "/" + encodeURIComponent(lang) + "/workbench/";
    root.innerHTML = [
      '<div class="w-full">',
      '<div class="mx-auto max-w-7xl">',
      '<div class="mb-8">',
      '<a href="' + esc(backHref) + '" class="text-sm font-bold text-slate-500 hover:text-slate-900">← ' + esc(t(lang, "back")) + '</a>',
      '<div class="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">',
      '<div>',
      '<h1 class="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">' + esc(t(lang, "title")) + '</h1>',
      '<p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600">' + esc(t(lang, "desc")) + '</p>',
      '</div>',
      '<span class="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">' + esc(t(lang, "provider")) + '</span>',
      '</div>',
      '</div>',
      '<div class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">' + esc(t(lang, "notice")) + '</div>',
      '<div id="sg-shopping-radar"><div class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">' + esc(t(lang, "loading")) + '</div></div>',
      '<section class="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "searchTitle")) + '</h2>',
      '<form id="sg-shopping-search" class="mt-4 flex flex-col gap-3 md:flex-row">',
      '<input id="sg-shopping-query" class="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-4 text-sm text-slate-900 placeholder:text-slate-400" type="search" autocomplete="off" placeholder="' + esc(t(lang, "searchPlaceholder")) + '">',
      '<button class="min-h-[44px] rounded-lg bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-700" type="submit">' + esc(t(lang, "search")) + '</button>',
      '</form>',
      '</section>',
      '<section id="sg-shopping-results" class="mt-6 hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm"></section>',
      '</div>',
      '</div>'
    ].join("");

    const radarEl = document.getElementById("sg-shopping-radar");
    const resultsEl = document.getElementById("sg-shopping-results");
    const form = document.getElementById("sg-shopping-search");
    const input = document.getElementById("sg-shopping-query");

    function showRadar(payload) {
      radarEl.innerHTML = renderRadar(lang, payload && payload.radar ? payload.radar : {});
    }

    function showRadarError() {
      radarEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "loadError")) + '</div>';
    }

    const radarURL = apiURL(lang, "ajax_radar_gmarket", {});
    const early = window.__statgroundShoppingRadarEarlyFetch;
    if (early && early.url === radarURL && early.promise) {
      early.promise.then((res) => res && res.ok ? showRadar(res.json) : showRadarError()).catch(showRadarError);
    } else {
      fetchJSON(radarURL).then((res) => res && res.ok ? showRadar(res.json) : showRadarError()).catch(showRadarError);
    }

    if (form && input && resultsEl) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const query = String(input.value || "").trim();
        resultsEl.classList.remove("hidden");
        if (!query) {
          resultsEl.innerHTML = '<div class="text-sm text-slate-600">' + esc(t(lang, "noResults")) + '</div>';
          return;
        }
        resultsEl.innerHTML = '<div class="text-sm text-slate-600">' + esc(t(lang, "searching")) + '</div>';
        fetchJSON(apiURL(lang, "ajax_search_gmarket", { q: query, limit: 24 }))
          .then((res) => {
            if (!res || !res.ok) throw new Error("search_failed");
            const items = res.json && res.json.items ? res.json.items : [];
            resultsEl.innerHTML = [
              '<div class="mb-4">',
              '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "searchResults")) + '</h2>',
              '</div>',
              items.length ? productGrid(lang, items) : '<div class="text-sm text-slate-600">' + esc(t(lang, "noResults")) + '</div>'
            ].join("");
          })
          .catch(function () {
            resultsEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "searchError")) + '</div>';
          });
      });
    }
  }

  window.set_main = render;
  window.addEventListener("sg_lang_changed", function (event) {
    const nextLang = eventLang(event);
    if (nextLang && syncLangToURL(nextLang)) return;
    render(nextLang);
  });
})();
