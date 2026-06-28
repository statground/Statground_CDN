(function () {
  const ECHARTS_URL = "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js";
  const watchKey = "statground_shopping_watchlist_v1";
  const chartRegistry = {};
  let echartsPromise = null;

  const dict = {
    ko: {
      back: "워크벤치",
      title: "Shopping Price Insight",
      desc: "가격, 할인 강도, 카테고리 압력, 셀러 기회를 원본 재게시 없이 파생 지표로 분석합니다.",
      notice: "상품명과 대표 이미지 1개는 후보 식별을 위해 표시합니다. 상세설명, 리뷰, 상세 이미지, 판매자, 브랜드, raw payload는 표시하지 않습니다. 표시 가격은 수집 시점 관측값이며 배송비와 옵션 총액은 외부몰에서 최종 확인해야 합니다.",
      budget: "예산",
      category: "카테고리",
      query: "찾는 것",
      queryPlaceholder: "예: 가구, 화장품, 상품코드",
      intent: "분석 목적",
      intent_budget: "저가 탐색",
      intent_gift: "선물 탐색",
      intent_daily: "생활템 탐색",
      intent_seller: "셀러 분석",
      allCategories: "전체",
      analyze: "분석하기",
      finding: "분석 중...",
      loadError: "쇼핑 인사이트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      finderError: "조건에 맞는 분석 결과를 만들지 못했습니다. 조건을 바꿔 다시 시도해 주세요.",
      overview: "시장 요약",
      chartPrice: "가격대 분포",
      chartCategory: "카테고리 할인/저가 압력",
      chartCandidates: "후보별 가격·신뢰도",
      chartSeller: "셀러 기회 점수",
      candidates: "가격 후보",
      actions: "다음 행동",
      seller: "셀러 기회",
      watchlist: "가격 알림 후보",
      policies: "안전 경계",
      products: "관측 상품",
      categoriesLabel: "카테고리",
      discounted: "할인 신호",
      lowPrice: "1만원 이하",
      latest: "최근 수집",
      median: "중앙값",
      price: "관측가",
      basis: "배송/옵션 미포함",
      originalPrice: "표시 정가",
      categoryMedian: "카테고리 중앙값",
      confidence: "딜 신뢰도",
      reason: "분석 사유",
      collected: "수집 시각",
      source: "판매처에서 현재가 확인",
      saveWatch: "알림 후보 저장",
      savedWatch: "저장됨",
      removeWatch: "삭제",
      routerNotice: "판매처 이동은 서버 링크 라우터를 거치며, 외부몰 이동 또는 파트너 링크가 포함될 수 있습니다.",
      noCandidates: "현재 조건에서 표시할 후보가 없습니다.",
      noSeller: "셀러 기회 신호가 아직 없습니다.",
      noWatchlist: "저장된 가격 알림 후보가 없습니다.",
      pressure_high_price_pressure: "가격 압박 높음",
      pressure_promotion_sensitive: "프로모션 민감",
      pressure_thin_sample: "표본 부족",
      pressure_watch: "관찰",
      status_active: "적용",
      status_partial: "부분 적용",
      chartEmpty: "차트를 그릴 표본이 아직 부족합니다.",
      demand: "수요/표본",
      discount: "할인율",
      lowPriceShare: "저가 비중",
      opportunity: "기회 점수",
      kpiCoverage: "가격 이력",
      kpiCoverageSub: "재관측 상품",
      kpiPriceRange: "가격 범위",
      kpiPriceRangeSub: "최저가 - 최고가",
      kpiPolicy: "공개 데이터",
      kpiPolicySub: "파생 지표 중심",
      sellerFirst: "셀러 분석 모드에서는 카테고리 압력과 기회 점수를 먼저 봅니다."
    },
    en: {
      back: "Workbench",
      title: "Shopping Price Insight",
      desc: "Analyze price, discount pressure, category competition, and seller opportunity from derived signals without republishing marketplace content.",
      notice: "Product titles and one representative image are displayed for candidate identification. Descriptions, reviews, detail images, sellers, brands, and raw payloads are not displayed. Prices are observations at collection time; verify shipping, options, availability, and final price on the external mall.",
      budget: "Budget",
      category: "Category",
      query: "Need",
      queryPlaceholder: "e.g. furniture, beauty, product code",
      intent: "Analysis goal",
      intent_budget: "Budget hunt",
      intent_gift: "Gift hunt",
      intent_daily: "Daily item",
      intent_seller: "Seller analysis",
      allCategories: "All",
      analyze: "Analyze",
      finding: "Analyzing...",
      loadError: "Failed to load shopping insight. Please try again.",
      finderError: "Could not build insight for the current filters. Try different filters.",
      overview: "Market summary",
      chartPrice: "Price band distribution",
      chartCategory: "Category discount and low-price pressure",
      chartCandidates: "Candidate price and confidence",
      chartSeller: "Seller opportunity score",
      candidates: "Price candidates",
      actions: "Next actions",
      seller: "Seller opportunities",
      watchlist: "Price alert candidates",
      policies: "Safety boundary",
      products: "Observed products",
      categoriesLabel: "Categories",
      discounted: "Discount signals",
      lowPrice: "Under KRW 10,000",
      latest: "Latest collection",
      median: "Median",
      price: "Observed price",
      basis: "Excludes shipping/options",
      originalPrice: "Listed original",
      categoryMedian: "Category median",
      confidence: "Deal confidence",
      reason: "Signal",
      collected: "Collected",
      source: "Check current external price",
      saveWatch: "Save alert candidate",
      savedWatch: "Saved",
      removeWatch: "Remove",
      routerNotice: "Merchant navigation goes through the server link router and may include partner links.",
      noCandidates: "No displayable candidates for the current filters.",
      noSeller: "No seller opportunity signal yet.",
      noWatchlist: "No saved price alert candidates.",
      pressure_high_price_pressure: "High price pressure",
      pressure_promotion_sensitive: "Promotion-sensitive",
      pressure_thin_sample: "Thin sample",
      pressure_watch: "Watch",
      status_active: "Active",
      status_partial: "Partial",
      chartEmpty: "Not enough observations to draw this chart yet.",
      demand: "Demand/sample",
      discount: "Discount",
      lowPriceShare: "Low-price share",
      opportunity: "Opportunity",
      kpiCoverage: "Price history",
      kpiCoverageSub: "Repeated observations",
      kpiPriceRange: "Price range",
      kpiPriceRangeSub: "Lowest - highest",
      kpiPolicy: "Public data",
      kpiPolicySub: "Derived metrics only",
      sellerFirst: "Seller analysis mode prioritizes category pressure and opportunity scores."
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
    if (lower === "zh" || lower.startsWith("zh-")) return lower.includes("tw") || lower.includes("hk") || lower.includes("mo") || lower.includes("hant") ? "zh-Hant" : "zh-Hans";
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
    const parts = (location.pathname || "/").split("/").filter(Boolean);
    const workbenchIndex = parts.indexOf("workbench");
    if (!langCode || workbenchIndex < 0) return false;
    if (workbenchIndex === 0) parts.unshift(langCode);
    else parts[0] = langCode;
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

  function loadECharts() {
    if (window.echarts) return Promise.resolve(window.echarts);
    if (echartsPromise) return echartsPromise;
    echartsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = ECHARTS_URL;
      script.defer = true;
      script.onload = () => window.echarts ? resolve(window.echarts) : reject(new Error("echarts_missing"));
      script.onerror = () => reject(new Error("echarts_load_failed"));
      document.head.appendChild(script);
    });
    return echartsPromise;
  }

  function productLabel(item) {
    const name = item && typeof item.product_name === "string" ? item.product_name.trim() : "";
    if (name) return name;
    return item && item.product_label ? item.product_label : (item && item.product_code ? "Observed item #" + item.product_code : "Observed item");
  }

  function imageURL(item) {
    const raw = String(item && item.image_url ? item.image_url : "").trim();
    if (!raw || !/^https?:\/\//i.test(raw)) return "";
    return raw;
  }

  function optionHTML(value, label, selected) {
    return '<option value="' + esc(value) + '"' + (selected ? " selected" : "") + '>' + esc(label) + '</option>';
  }

  function statCard(title, value, sub) {
    return [
      '<div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="text-xs font-bold uppercase tracking-normal text-slate-500">' + esc(title) + '</div>',
      '<div class="mt-2 text-2xl font-black text-slate-950">' + esc(value) + '</div>',
      sub ? '<div class="mt-1 text-xs leading-5 text-slate-500">' + esc(sub) + '</div>' : '',
      '</div>'
    ].join("");
  }

  function chartBox(id, title) {
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="mb-3 flex items-center justify-between gap-3">',
      '<h2 class="text-sm font-black text-slate-950">' + esc(title) + '</h2>',
      '<span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">ECharts</span>',
      '</div>',
      '<div id="' + esc(id) + '" class="h-[280px] w-full rounded-lg bg-slate-50"></div>',
      '</section>'
    ].join("");
  }

  function emptyChart(el, lang) {
    if (!el) return;
    el.innerHTML = '<div class="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">' + esc(t(lang, "chartEmpty")) + '</div>';
  }

  function renderSnapshot(lang, radar) {
    const s = radar && radar.summary ? radar.summary : {};
    return [
      '<section class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">',
      statCard(t(lang, "products"), number(s.product_count || 0), t(lang, "latest") + " " + (s.latest_collected_at || "-")),
      statCard(t(lang, "categoriesLabel"), number(s.category_count || 0), t(lang, "median") + " " + krw(s.median_price_krw || 0)),
      statCard(t(lang, "discounted"), number(s.discounted_count || 0), pct(s.discounted_percent || 0)),
      statCard(t(lang, "lowPrice"), number(s.low_price_count || 0), pct(s.low_price_percent || 0)),
      statCard(t(lang, "kpiCoverage"), number(s.history_product_runs || 0), t(lang, "kpiCoverageSub")),
      '</section>',
      '<section class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">',
      statCard(t(lang, "kpiPriceRange"), krw(s.min_price_krw || 0) + " - " + krw(s.max_price_krw || 0), t(lang, "kpiPriceRangeSub")),
      statCard(t(lang, "kpiPolicy"), t(lang, "kpiPolicySub"), t(lang, "routerNotice")),
      '</section>'
    ].join("");
  }

  function renderFinderForm(lang, radar) {
    const categories = ((radar && radar.categories) || []).map((item) => item.source_category).filter(Boolean);
    const opts = [optionHTML("", t(lang, "allCategories"), true)].concat(categories.map((name) => optionHTML(name, name, false))).join("");
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<form id="sg-shopping-finder-form" class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">',
      '<label class="block"><span class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "budget")) + '</span><input id="sg-shopping-budget" inputmode="numeric" class="mt-2 min-h-[44px] w-full rounded-lg border border-slate-300 px-4 text-sm" value="30000"></label>',
      '<label class="block"><span class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "category")) + '</span><select id="sg-shopping-category" class="mt-2 min-h-[44px] w-full rounded-lg border border-slate-300 px-4 text-sm">' + opts + '</select></label>',
      '<label class="block"><span class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "query")) + '</span><input id="sg-shopping-query" class="mt-2 min-h-[44px] w-full rounded-lg border border-slate-300 px-4 text-sm" placeholder="' + esc(t(lang, "queryPlaceholder")) + '"></label>',
      '<button class="mt-5 min-h-[44px] rounded-lg bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-700" type="submit">' + esc(t(lang, "analyze")) + '</button>',
      '<div class="lg:col-span-4">',
      '<div class="flex flex-wrap gap-2" id="sg-shopping-intents">',
      intentButton(lang, "budget", true),
      intentButton(lang, "gift", false),
      intentButton(lang, "daily", false),
      intentButton(lang, "seller", false),
      '</div>',
      '</div>',
      '</form>',
      '</section>'
    ].join("");
  }

  function intentButton(lang, value, active) {
    return '<button type="button" data-intent="' + esc(value) + '" class="rounded-lg border px-3 py-2 text-xs font-black ' + (active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400") + '">' + esc(t(lang, "intent_" + value)) + '</button>';
  }

  function renderHeadline(lang, finder) {
    const h = finder && finder.headline ? finder.headline : {};
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">',
      '<div>',
      '<h2 class="text-2xl font-black text-slate-950">' + esc(h.title || t(lang, "candidates")) + '</h2>',
      '<p class="mt-2 text-sm leading-6 text-slate-600">' + esc(h.summary || "") + '</p>',
      finder && finder.query && finder.query.intent === "seller" ? '<p class="mt-2 text-xs font-bold text-slate-500">' + esc(t(lang, "sellerFirst")) + '</p>' : '',
      '</div>',
      '<div class="grid grid-cols-2 gap-2 text-xs md:min-w-[300px]">',
      '<div class="rounded-lg bg-slate-50 p-3"><div class="font-bold text-slate-500">' + esc(t(lang, "budget")) + '</div><div class="mt-1 font-black text-slate-950">' + esc(krw(h.budget_krw || 0)) + '</div></div>',
      '<div class="rounded-lg bg-slate-50 p-3"><div class="font-bold text-slate-500">' + esc(t(lang, "confidence")) + '</div><div class="mt-1 font-black text-slate-950">' + esc(number(h.average_confidence_score || 0)) + '</div></div>',
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderActions(lang, actions) {
    const rows = (actions || []).map((item) => [
      '<article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="text-sm font-black text-slate-950">' + esc(item.label || "") + '</div>',
      '<p class="mt-2 text-sm leading-6 text-slate-600">' + esc(item.detail || "") + '</p>',
      '</article>'
    ].join("")).join("");
    return '<section><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "actions")) + '</h2><div class="grid grid-cols-1 gap-3 md:grid-cols-2">' + rows + '</div></section>';
  }

  function watchlist() {
    try {
      const parsed = JSON.parse(localStorage.getItem(watchKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.product_code).slice(0, 30) : [];
    } catch (_) {
      return [];
    }
  }

  function saveWatch(item) {
    if (!item || !item.product_code) return;
    const rows = watchlist().filter((row) => row.product_code !== item.product_code);
    rows.unshift({
      product_code: item.product_code,
      product_name: typeof item.product_name === "string" ? item.product_name.trim() : "",
      product_label: productLabel(item),
      image_url: imageURL(item),
      source_category: item.source_category || "",
      price_krw: Number(item.price_krw || 0),
      product_url: item.product_url || "",
      saved_at: new Date().toISOString()
    });
    localStorage.setItem(watchKey, JSON.stringify(rows.slice(0, 30)));
  }

  function removeWatch(code) {
    localStorage.setItem(watchKey, JSON.stringify(watchlist().filter((row) => row.product_code !== code)));
  }

  function watched(code) {
    return watchlist().some((row) => row.product_code === code);
  }

  function productCard(lang, item) {
    const url = String(item && item.product_url ? item.product_url : "").trim();
    const code = item && item.product_code ? String(item.product_code) : "";
    const isWatched = watched(code);
    const label = productLabel(item);
    const img = imageURL(item);
    return [
      '<article class="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      img ? '<div class="mb-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50"><img src="' + esc(img) + '" alt="' + esc(label) + '" loading="lazy" referrerpolicy="no-referrer" class="max-h-full max-w-full object-contain"></div>' : '',
      '<div class="flex items-start justify-between gap-3">',
      '<div>',
      '<h3 class="text-sm font-black leading-5 text-slate-950">' + esc(label) + '</h3>',
      '<div class="mt-1 flex flex-wrap gap-1 text-[11px] font-bold text-slate-500">',
      '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(item && item.source_category ? item.source_category : "") + '</span>',
      code ? '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(code) + '</span>' : '',
      '</div>',
      '</div>',
      '<span class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">' + esc(number(item && (item.deal_confidence_score || item.radar_score) || 0)) + '</span>',
      '</div>',
      '<dl class="mt-4 grid gap-2 text-xs text-slate-600">',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "price")) + '</dt><dd class="font-black text-slate-950">' + esc(krw(item && item.price_krw)) + '</dd></div>',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "basis")) + '</dt><dd class="text-right">' + esc(t(lang, "basis")) + '</dd></div>',
      item && item.original_price_krw ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "originalPrice")) + '</dt><dd>' + esc(krw(item.original_price_krw)) + '</dd></div>' : '',
      item && item.category_median_price_krw ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "categoryMedian")) + '</dt><dd>' + esc(krw(item.category_median_price_krw)) + '</dd></div>' : '',
      item && item.reason ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "reason")) + '</dt><dd class="text-right">' + esc(item.reason) + '</dd></div>' : '',
      item && item.collected_at ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "collected")) + '</dt><dd class="text-right">' + esc(item.collected_at) + '</dd></div>' : '',
      '</dl>',
      '<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">' + esc(t(lang, "routerNotice")) + '</div>',
      '<div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">',
      code ? '<button type="button" data-watch-code="' + esc(code) + '" class="min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:border-slate-500">' + esc(isWatched ? t(lang, "savedWatch") : t(lang, "saveWatch")) + '</button>' : '',
      url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700">' + esc(t(lang, "source")) + '</a>' : '',
      '</div>',
      '</article>'
    ].join("");
  }

  function renderCandidates(lang, items) {
    if (!items || !items.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "noCandidates")) + '</section>';
    }
    return '<section><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "candidates")) + '</h2><div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">' + items.map((item) => productCard(lang, item)).join("") + '</div></section>';
  }

  function renderSeller(lang, items) {
    if (!items || !items.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "noSeller")) + '</section>';
    }
    const rows = items.map((item) => [
      '<article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex items-start justify-between gap-3">',
      '<h3 class="text-sm font-black text-slate-950">' + esc(item.source_category || "-") + '</h3>',
      '<span class="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-700">' + esc(t(lang, "pressure_" + (item.competition_level || "watch"))) + '</span>',
      '</div>',
      '<div class="mt-3 grid grid-cols-3 gap-2 text-xs">',
      '<div class="rounded-lg bg-slate-50 p-2"><div class="font-bold text-slate-500">' + esc(t(lang, "median")) + '</div><div class="font-black text-slate-950">' + esc(krw(item.median_price_krw || 0)) + '</div></div>',
      '<div class="rounded-lg bg-slate-50 p-2"><div class="font-bold text-slate-500">' + esc(t(lang, "lowPrice")) + '</div><div class="font-black text-slate-950">' + esc(pct(item.low_price_percent || 0)) + '</div></div>',
      '<div class="rounded-lg bg-slate-50 p-2"><div class="font-bold text-slate-500">' + esc(t(lang, "discounted")) + '</div><div class="font-black text-slate-950">' + esc(pct(item.discounted_percent || 0)) + '</div></div>',
      '</div>',
      '<p class="mt-3 text-sm leading-6 text-slate-600">' + esc(item.recommended_action || "") + '</p>',
      '</article>'
    ].join("")).join("");
    return '<section><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "seller")) + '</h2><div class="grid grid-cols-1 gap-4 lg:grid-cols-2">' + rows + '</div></section>';
  }

  function renderPolicies(lang, notes) {
    const rows = (notes || []).map((item) => '<span class="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">' + esc(item.label || item.code || "") + ' · ' + esc(t(lang, "status_" + (item.status || "active"))) + '</span>').join("");
    return '<section><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "policies")) + '</h2><div class="flex flex-wrap gap-2">' + rows + '</div></section>';
  }

  function renderWatchlist(lang) {
    const rows = watchlist();
    if (!rows.length) {
      return '<section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "watchlist")) + '</h2><p class="mt-3 text-sm text-slate-500">' + esc(t(lang, "noWatchlist")) + '</p></section>';
    }
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "watchlist")) + '</h2>',
      '<div class="mt-3 grid gap-2">',
      rows.map((item) => [
        '<div class="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">',
        '<div class="flex items-center gap-3">',
        imageURL(item) ? '<div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-white"><img src="' + esc(imageURL(item)) + '" alt="' + esc(productLabel(item)) + '" loading="lazy" referrerpolicy="no-referrer" class="max-h-full max-w-full object-contain"></div>' : '',
        '<div><div class="font-black text-slate-900">' + esc(productLabel(item)) + '</div><div class="mt-1 text-slate-500">' + esc(item.source_category || "") + ' · ' + esc(krw(item.price_krw || 0)) + '</div></div>',
        '</div>',
        '<div class="flex gap-2">',
        item.product_url ? '<a class="inline-flex min-h-[34px] items-center rounded-lg bg-slate-900 px-3 font-black text-white" href="' + esc(item.product_url) + '" target="_blank" rel="noopener noreferrer">' + esc(t(lang, "source")) + '</a>' : '',
        '<button type="button" data-remove-watch="' + esc(item.product_code) + '" class="min-h-[34px] rounded-lg border border-slate-300 px-3 font-black text-slate-600">' + esc(t(lang, "removeWatch")) + '</button>',
        '</div>',
        '</div>'
      ].join("")).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderChartsShell(lang) {
    return [
      '<section class="grid grid-cols-1 gap-4 xl:grid-cols-2">',
      chartBox("sg-shopping-chart-price", t(lang, "chartPrice")),
      chartBox("sg-shopping-chart-category", t(lang, "chartCategory")),
      chartBox("sg-shopping-chart-candidates", t(lang, "chartCandidates")),
      chartBox("sg-shopping-chart-seller", t(lang, "chartSeller")),
      '</section>'
    ].join("");
  }

  function renderFinderResult(lang, finder) {
    const sellerFirst = finder && finder.query && finder.query.intent === "seller";
    return [
      renderHeadline(lang, finder),
      '<div class="mt-6">',
      renderChartsShell(lang),
      '</div>',
      sellerFirst ? '<div class="mt-6">' + renderSeller(lang, finder && finder.seller_opportunities) + '</div>' : '',
      '<div class="mt-6">',
      renderActions(lang, finder && finder.next_actions),
      '</div>',
      '<div class="mt-6">',
      renderCandidates(lang, finder && finder.candidates),
      '</div>',
      !sellerFirst ? '<div class="mt-6">' + renderSeller(lang, finder && finder.seller_opportunities) + '</div>' : '',
      '<div class="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.5fr]">',
      renderWatchlist(lang),
      renderPolicies(lang, finder && finder.policy_notes),
      '</div>'
    ].join("");
  }

  function bucketPrices(items) {
    const buckets = [
      { label: "<=10k", min: 0, max: 10000, count: 0 },
      { label: "10k-30k", min: 10001, max: 30000, count: 0 },
      { label: "30k-50k", min: 30001, max: 50000, count: 0 },
      { label: "50k-100k", min: 50001, max: 100000, count: 0 },
      { label: "100k+", min: 100001, max: Infinity, count: 0 }
    ];
    (items || []).forEach((item) => {
      const price = Number(item && item.price_krw || 0);
      const bucket = buckets.find((row) => price >= row.min && price <= row.max);
      if (bucket) bucket.count += 1;
    });
    return buckets;
  }

  function paintChart(id, lang, option) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!option) {
      emptyChart(el, lang);
      return;
    }
    loadECharts().then((echarts) => {
      if (!document.body.contains(el)) return;
      if (chartRegistry[id]) chartRegistry[id].dispose();
      chartRegistry[id] = echarts.init(el, null, { renderer: "canvas" });
      chartRegistry[id].setOption(option);
    }).catch(() => emptyChart(el, lang));
  }

  function chartTextStyle() {
    return { color: "#334155", fontFamily: "Inter, system-ui, sans-serif" };
  }

  function renderInsightCharts(lang, radar, finder) {
    const candidates = (finder && finder.candidates && finder.candidates.length ? finder.candidates : radar && radar.deal_candidates) || [];
    const categories = (finder && finder.category_options && finder.category_options.length ? finder.category_options : radar && radar.categories) || [];
    const sellers = (finder && finder.seller_opportunities && finder.seller_opportunities.length ? finder.seller_opportunities : radar && radar.seller_insights) || [];
    const buckets = bucketPrices(candidates);

    paintChart("sg-shopping-chart-price", lang, candidates.length ? {
      color: ["#0f766e"],
      tooltip: { trigger: "axis" },
      grid: { left: 44, right: 16, top: 22, bottom: 36 },
      xAxis: { type: "category", data: buckets.map((row) => row.label), axisLabel: chartTextStyle() },
      yAxis: { type: "value", minInterval: 1, axisLabel: chartTextStyle() },
      series: [{ type: "bar", name: t(lang, "products"), data: buckets.map((row) => row.count), barMaxWidth: 44, itemStyle: { borderRadius: [6, 6, 0, 0] } }]
    } : null);

    paintChart("sg-shopping-chart-category", lang, categories.length ? {
      color: ["#2563eb", "#f59e0b"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 48, right: 16, top: 20, bottom: 58 },
      xAxis: { type: "category", data: categories.slice(0, 8).map((row) => String(row.source_category || "-").slice(0, 12)), axisLabel: { ...chartTextStyle(), rotate: 25 } },
      yAxis: { type: "value", axisLabel: { formatter: "{value}%" } },
      series: [
        { type: "bar", name: t(lang, "lowPriceShare"), data: categories.slice(0, 8).map((row) => Number(row.low_price_percent || 0)), barMaxWidth: 24, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "discount"), data: categories.slice(0, 8).map((row) => Number(row.discounted_percent || 0)), smooth: true, symbolSize: 7 }
      ]
    } : null);

    paintChart("sg-shopping-chart-candidates", lang, candidates.length ? {
      color: ["#7c3aed"],
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          const item = params.data && params.data.raw ? params.data.raw : {};
          return esc(productLabel(item)) + "<br>" + esc(t(lang, "price")) + ": " + esc(krw(item.price_krw || 0)) + "<br>" + esc(t(lang, "confidence")) + ": " + esc(number(item.deal_confidence_score || item.radar_score || 0));
        }
      },
      grid: { left: 56, right: 16, top: 20, bottom: 42 },
      xAxis: { type: "value", name: "KRW", axisLabel: { formatter: function (value) { return number(value); } } },
      yAxis: { type: "value", name: t(lang, "confidence"), min: 0, max: 100 },
      series: [{
        type: "scatter",
        symbolSize: function (data) { return Math.max(10, Math.min(34, Number(data[2] || 0) / 3)); },
        data: candidates.slice(0, 36).map((item) => ({
          value: [Number(item.price_krw || 0), Number(item.deal_confidence_score || item.radar_score || 0), Number(item.discount_percent || 0) + Number(item.below_category_median_percent || 0)],
          raw: item
        }))
      }]
    } : null);

    paintChart("sg-shopping-chart-seller", lang, sellers.length ? {
      color: ["#dc2626"],
      tooltip: { trigger: "axis" },
      grid: { left: 48, right: 18, top: 20, bottom: 48 },
      xAxis: { type: "value", axisLabel: { formatter: "{value}" } },
      yAxis: { type: "category", data: sellers.slice(0, 8).map((row) => String(row.source_category || "-").slice(0, 14)), axisLabel: chartTextStyle() },
      series: [{
        type: "bar",
        name: t(lang, "opportunity"),
        data: sellers.slice(0, 8).map((row) => Math.round((Number(row.low_price_percent || 0) * 1.3 + Number(row.discounted_percent || 0) + Math.min(Number(row.product_count || 0), 30)) * 10) / 10),
        barMaxWidth: 22,
        itemStyle: { borderRadius: [0, 6, 6, 0] }
      }]
    } : null);
  }

  function bindWatchButtons(lang, currentItems) {
    const map = {};
    (currentItems || []).forEach((item) => {
      if (item && item.product_code) map[item.product_code] = item;
    });
    document.querySelectorAll("[data-watch-code]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const code = btn.getAttribute("data-watch-code");
        saveWatch(map[code]);
        const result = document.getElementById("sg-shopping-finder-result");
        if (result && window.__statgroundLastFinder) {
          result.innerHTML = renderFinderResult(lang, window.__statgroundLastFinder);
          renderInsightCharts(lang, window.__statgroundLastRadar || {}, window.__statgroundLastFinder);
          bindWatchButtons(lang, window.__statgroundLastFinder.candidates || []);
        }
      });
    });
    document.querySelectorAll("[data-remove-watch]").forEach((btn) => {
      btn.addEventListener("click", function () {
        removeWatch(btn.getAttribute("data-remove-watch"));
        const result = document.getElementById("sg-shopping-finder-result");
        if (result && window.__statgroundLastFinder) {
          result.innerHTML = renderFinderResult(lang, window.__statgroundLastFinder);
          renderInsightCharts(lang, window.__statgroundLastRadar || {}, window.__statgroundLastFinder);
          bindWatchButtons(lang, window.__statgroundLastFinder.candidates || []);
        }
      });
    });
  }

  function bindFinder(lang, radar) {
    const form = document.getElementById("sg-shopping-finder-form");
    const resultEl = document.getElementById("sg-shopping-finder-result");
    if (!form || !resultEl) return;
    let selectedIntent = "budget";
    function syncIntentButtons() {
      document.querySelectorAll("#sg-shopping-intents [data-intent]").forEach((btn) => {
        const active = btn.getAttribute("data-intent") === selectedIntent;
        btn.className = "rounded-lg border px-3 py-2 text-xs font-black " + (active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400");
      });
    }
    document.querySelectorAll("#sg-shopping-intents [data-intent]").forEach((btn) => {
      btn.addEventListener("click", function () {
        selectedIntent = btn.getAttribute("data-intent") || "budget";
        syncIntentButtons();
      });
    });
    function submit() {
      const budget = String(document.getElementById("sg-shopping-budget").value || "30000").replace(/,/g, "");
      const category = document.getElementById("sg-shopping-category").value || "";
      const query = document.getElementById("sg-shopping-query").value || "";
      resultEl.innerHTML = '<div class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">' + esc(t(lang, "finding")) + '</div>';
      fetchJSON(apiURL(lang, "ajax_find_gmarket", { budget_krw: budget, category: category, q: query, intent: selectedIntent }))
        .then((res) => {
          if (!res || !res.ok) throw new Error("finder_failed");
          window.__statgroundLastFinder = res.json && res.json.finder ? res.json.finder : {};
          resultEl.innerHTML = renderFinderResult(lang, window.__statgroundLastFinder);
          renderInsightCharts(lang, radar, window.__statgroundLastFinder);
          bindWatchButtons(lang, window.__statgroundLastFinder.candidates || []);
        })
        .catch(function () {
          resultEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "finderError")) + '</div>';
        });
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submit();
    });
    submit();
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
      '<span class="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">Gmarket · Derived metrics</span>',
      '</div>',
      '</div>',
      '<div class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">' + esc(t(lang, "notice")) + '</div>',
      '<div id="sg-shopping-app"><div class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">' + esc(t(lang, "finding")) + '</div></div>',
      '</div>',
      '</div>'
    ].join("");

    const appEl = document.getElementById("sg-shopping-app");
    function showApp(payload) {
      const radar = payload && payload.radar ? payload.radar : {};
      window.__statgroundLastRadar = radar;
      appEl.innerHTML = [
        '<div class="mb-8">',
        '<h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "overview")) + '</h2>',
        renderSnapshot(lang, radar),
        '</div>',
        renderFinderForm(lang, radar),
        '<div id="sg-shopping-finder-result" class="mt-6"></div>'
      ].join("");
      bindFinder(lang, radar);
    }
    function showError() {
      appEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "loadError")) + '</div>';
    }
    const radarURL = apiURL(lang, "ajax_radar_gmarket", {});
    const early = window.__statgroundShoppingRadarEarlyFetch;
    if (early && early.url === radarURL && early.promise) {
      early.promise.then((res) => res && res.ok ? showApp(res.json) : showError()).catch(showError);
    } else {
      fetchJSON(radarURL).then((res) => res && res.ok ? showApp(res.json) : showError()).catch(showError);
    }
  }

  window.addEventListener("resize", function () {
    Object.keys(chartRegistry).forEach((key) => {
      if (chartRegistry[key]) chartRegistry[key].resize();
    });
  });

  window.set_main = render;
  window.addEventListener("sg_lang_changed", function (event) {
    const nextLang = eventLang(event);
    if (nextLang && syncLangToURL(nextLang)) return;
    render(nextLang);
  });
})();
