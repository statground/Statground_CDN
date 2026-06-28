(function () {
  const dict = {
    ko: {
      back: "워크벤치",
      title: "쇼핑 워크벤치",
      desc: "수집 시점 기준의 쇼핑 상품 데이터를 원문 확인용으로 탐색합니다.",
      notice: "가격과 판매 여부는 수시로 바뀔 수 있습니다. 구매나 의사결정 전에는 반드시 원문 상품 페이지에서 최신 정보를 확인해 주세요.",
      searchPlaceholder: "상품명, 카테고리, 키워드 검색...",
      search: "검색",
      searchResults: "검색 결과",
      recentTitle: "최근 수집 상품",
      latestN: "표시 {n}개",
      loading: "불러오는 중...",
      searching: "검색하는 중...",
      empty: "표시할 상품이 없습니다.",
      noResults: "검색 결과가 없습니다.",
      recentError: "쇼핑 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      searchError: "쇼핑 데이터를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      price: "가격",
      originalPrice: "정가",
      category: "카테고리",
      collected: "수집 시점",
      source: "원문 보기",
      provider: "Gmarket"
    },
    en: {
      back: "Workbench",
      title: "Shopping Workbench",
      desc: "Explore shopping product data collected for source verification.",
      notice: "Prices and availability can change at any time. Check the original product page before making decisions.",
      searchPlaceholder: "Search title, category, keyword...",
      search: "Search",
      searchResults: "Search results",
      recentTitle: "Recently collected products",
      latestN: "Showing {n}",
      loading: "Loading...",
      searching: "Searching...",
      empty: "No products to show.",
      noResults: "No results.",
      recentError: "Failed to load shopping data. Please try again.",
      searchError: "Failed to search shopping data. Please try again.",
      price: "Price",
      originalPrice: "Original",
      category: "Category",
      collected: "Collected",
      source: "Open source",
      provider: "Gmarket"
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
    if (!Number.isFinite(n) || n <= 0) return "";
    try { return new Intl.NumberFormat().format(n); } catch (_) { return String(n); }
  }

  function priceText(item) {
    const price = number(item && item.price_krw);
    if (!price) return "-";
    return "KRW " + price;
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
      '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">',
      '<path stroke-width="2" d="M6 6h15l-2 8H8L6 3H3"></path>',
      '<circle cx="9" cy="20" r="1.8" stroke-width="2"></circle>',
      '<circle cx="18" cy="20" r="1.8" stroke-width="2"></circle>',
      '</svg>'
    ].join("");
  }

  function productCard(lang, item) {
    const url = String(item && item.product_url ? item.product_url : "").trim();
    const category = [item && item.source_category, item && item.search_keyword].filter(Boolean).join(" · ");
    const original = number(item && item.original_price_krw);
    const source = url
      ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700">' + esc(t(lang, "source")) + '</a>'
      : "";
    return [
      '<article class="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex items-start gap-3">',
      '<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">',
      cartIcon(),
      '</div>',
      '<div class="min-w-0 flex-1">',
      '<div class="line-clamp-2 text-sm font-black leading-5 text-slate-950">' + esc(item && item.product_name ? item.product_name : "") + '</div>',
      '<div class="mt-1 flex flex-wrap gap-1 text-[11px] font-bold text-slate-500">',
      '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(t(lang, "provider")) + '</span>',
      item && item.product_code ? '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(item.product_code) + '</span>' : '',
      '</div>',
      '</div>',
      '</div>',
      '<dl class="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-600">',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "price")) + '</dt><dd class="font-black text-slate-950">' + esc(priceText(item)) + '</dd></div>',
      original ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "originalPrice")) + '</dt><dd>' + esc("KRW " + original) + '</dd></div>' : '',
      category ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "category")) + '</dt><dd class="truncate text-right">' + esc(category) + '</dd></div>' : '',
      item && item.collected_at ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "collected")) + '</dt><dd class="text-right">' + esc(item.collected_at) + '</dd></div>' : '',
      '</dl>',
      '<div class="mt-auto pt-4">',
      source,
      '</div>',
      '</article>'
    ].join("");
  }

  function productGrid(lang, items) {
    if (!items || !items.length) {
      return '<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "empty")) + '</div>';
    }
    return '<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">' + items.map((item) => productCard(lang, item)).join("") + '</div>';
  }

  function render(langOverride) {
    const root = document.getElementById("div_main");
    if (!root) return;
    const lang = displayLang(langOverride || routeLang());
    const recentLimit = window.matchMedia && !window.matchMedia("(min-width: 768px)").matches ? 6 : 12;
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
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<form id="sg-shopping-search" class="flex flex-col gap-3 md:flex-row">',
      '<input id="sg-shopping-query" class="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-4 text-sm text-slate-900 placeholder:text-slate-400" type="search" autocomplete="off" placeholder="' + esc(t(lang, "searchPlaceholder")) + '">',
      '<button class="min-h-[44px] rounded-lg bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-700" type="submit">' + esc(t(lang, "search")) + '</button>',
      '</form>',
      '</section>',
      '<section id="sg-shopping-results" class="mt-6 hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm"></section>',
      '<section class="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">',
      '<div>',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "recentTitle")) + '</h2>',
      '<p class="mt-1 text-xs text-slate-500">' + esc(t(lang, "latestN").replace("{n}", String(recentLimit))) + '</p>',
      '</div>',
      '</div>',
      '<div id="sg-shopping-recent" class="p-5"><div class="text-sm text-slate-600">' + esc(t(lang, "loading")) + '</div></div>',
      '</section>',
      '</div>',
      '</div>'
    ].join("");

    const recentEl = document.getElementById("sg-shopping-recent");
    const resultsEl = document.getElementById("sg-shopping-results");
    const form = document.getElementById("sg-shopping-search");
    const input = document.getElementById("sg-shopping-query");

    function showRecent(payload) {
      const items = payload && payload.items ? payload.items : [];
      recentEl.innerHTML = productGrid(lang, items);
    }

    function showRecentError() {
      recentEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "recentError")) + '</div>';
    }

    const recentURL = apiURL(lang, "ajax_recent_gmarket", { limit: recentLimit });
    const early = window.__statgroundShoppingRecentEarlyFetch;
    if (early && early.url === recentURL && early.promise) {
      early.promise.then((res) => res && res.ok ? showRecent(res.json) : showRecentError()).catch(showRecentError);
    } else {
      fetchJSON(recentURL).then((res) => res && res.ok ? showRecent(res.json) : showRecentError()).catch(showRecentError);
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
              '<p class="mt-1 text-xs text-slate-500">' + esc(t(lang, "latestN").replace("{n}", String(items.length))) + '</p>',
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
