(function () {
  const dict = {
    ko: {
      back: "워크벤치",
      title: "Shopping Deal OS",
      desc: "Gmarket 수집 데이터를 상품 카탈로그가 아니라 가격 검증, 딜 신뢰도, 셀러 경쟁 인텔리전스로 변환해 봅니다.",
      notice: "상품명, 이미지, 상세설명, 판매자, 브랜드, raw payload는 표시하지 않습니다. 가격은 수집 시점 관측값이며 배송비와 옵션 총액은 외부몰에서 최종 확인해야 합니다.",
      provider: "Gmarket 파생지표",
      loading: "쇼핑 인텔리전스를 불러오는 중...",
      loadError: "쇼핑 인텔리전스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      shopperTab: "쇼퍼",
      sellerTab: "셀러",
      policyTab: "안전정책",
      searchTab: "탐색",
      products: "관측 상품",
      categories: "카테고리",
      discounted: "할인 신호",
      lowPrice: "1만원 이하",
      median: "중앙값",
      history: "이력 관측",
      collected: "최근 수집",
      shopperTitle: "딜 검증 후보",
      shopperDesc: "저가, 표시 할인, 카테고리 중앙값 대비 가격 차이를 합쳐 후보를 고릅니다.",
      drops: "가격 하락 후보",
      noDrops: "같은 상품의 두 번 이상 관측이 쌓이면 가격 하락 후보가 표시됩니다.",
      sellerTitle: "셀러 경쟁 인텔리전스",
      sellerDesc: "카테고리별 저가 압박과 할인 민감도를 보고 가격·배송·프로모션 점검 우선순위를 잡습니다.",
      benchmark: "카테고리 가격 벤치마크",
      policyTitle: "원본 데이터 안전 경계",
      policyDesc: "서비스 화면은 원본 재배포가 아니라 파생된 사실·통계·자체 라벨을 표시합니다.",
      searchTitle: "내부 매칭 탐색",
      searchDesc: "검색어는 내부 매칭에만 쓰고 결과에는 중립 라벨과 가격 지표만 표시합니다.",
      searchPlaceholder: "상품명, 카테고리, 상품코드 검색...",
      search: "검색",
      searchResults: "탐색 결과",
      searching: "검색하는 중...",
      noResults: "표시할 결과가 없습니다.",
      searchError: "쇼핑 데이터를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      source: "외부에서 현재가 확인",
      disclosure: "외부몰 이동 또는 파트너 링크가 포함될 수 있습니다. 가격과 판매 여부를 직접 확인하세요.",
      price: "관측가",
      basis: "배송/옵션 미포함",
      originalPrice: "표시 정가",
      categoryMedian: "카테고리 중앙값",
      reason: "후보 사유",
      confidence: "딜 신뢰도",
      category: "카테고리",
      productCode: "상품 코드",
      range: "가격 범위",
      lowShare: "저가 비중",
      discountShare: "할인 비중",
      previous: "이전 관측",
      current: "현재 관측",
      action: "권장 액션",
      pressure: "경쟁 압박",
      pressure_high_price_pressure: "높음",
      pressure_promotion_sensitive: "프로모션 민감",
      pressure_thin_sample: "표본 부족",
      pressure_watch: "관찰",
      status_active: "적용",
      status_partial: "부분 적용"
    },
    en: {
      back: "Workbench",
      title: "Shopping Deal OS",
      desc: "Turns collected Gmarket data into deal validation, price intelligence, and seller competition signals instead of a product catalog mirror.",
      notice: "Product titles, images, descriptions, sellers, brands, and raw payloads are not displayed. Prices are observations at collection time; verify shipping, options, availability, and final price on the external mall.",
      provider: "Gmarket derived signals",
      loading: "Loading shopping intelligence...",
      loadError: "Failed to load shopping intelligence. Please try again.",
      shopperTab: "Shopper",
      sellerTab: "Seller",
      policyTab: "Policy",
      searchTab: "Search",
      products: "Observed products",
      categories: "Categories",
      discounted: "Discount signals",
      lowPrice: "Under KRW 10,000",
      median: "Median",
      history: "History runs",
      collected: "Latest collection",
      shopperTitle: "Deal validation candidates",
      shopperDesc: "Candidates combine low price, listed discount, and gap versus category median.",
      drops: "Price-drop candidates",
      noDrops: "Price-drop candidates appear after the same product is observed at least twice.",
      sellerTitle: "Seller competition intelligence",
      sellerDesc: "Use category price pressure and discount sensitivity to prioritize price, shipping, and promotion checks.",
      benchmark: "Category price benchmark",
      policyTitle: "Raw data safety boundary",
      policyDesc: "The service displays derived facts, statistics, and neutral labels rather than redistributing raw source content.",
      searchTitle: "Internal matching search",
      searchDesc: "Queries are used for internal matching only; results show neutral labels and price metrics.",
      searchPlaceholder: "Search title, category, product code...",
      search: "Search",
      searchResults: "Search results",
      searching: "Searching...",
      noResults: "No displayable results.",
      searchError: "Failed to search shopping data. Please try again.",
      source: "Check current external price",
      disclosure: "External mall navigation or partner links may be included. Verify price and availability directly.",
      price: "Observed price",
      basis: "Excludes shipping/options",
      originalPrice: "Listed original",
      categoryMedian: "Category median",
      reason: "Signal",
      confidence: "Deal confidence",
      category: "Category",
      productCode: "Product code",
      range: "Price range",
      lowShare: "Low-price share",
      discountShare: "Discount share",
      previous: "Previous",
      current: "Current",
      action: "Action",
      pressure: "Pressure",
      pressure_high_price_pressure: "High",
      pressure_promotion_sensitive: "Promotion-sensitive",
      pressure_thin_sample: "Thin sample",
      pressure_watch: "Watch",
      status_active: "Active",
      status_partial: "Partial"
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

  function icon(path) {
    return '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>';
  }

  function productLabel(item) {
    return item && item.product_label ? item.product_label : (item && item.product_code ? "Observed item #" + item.product_code : "Observed item");
  }

  function statCard(title, value, sub, accent) {
    return [
      '<div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex items-center justify-between gap-3">',
      '<div class="text-xs font-bold uppercase tracking-normal text-slate-500">' + esc(title) + '</div>',
      '<div class="h-2 w-2 rounded-full ' + esc(accent || "bg-slate-400") + '"></div>',
      '</div>',
      '<div class="mt-2 text-2xl font-black text-slate-950">' + esc(value) + '</div>',
      sub ? '<div class="mt-1 text-xs text-slate-500">' + esc(sub) + '</div>' : '',
      '</div>'
    ].join("");
  }

  function renderSummary(lang, summary) {
    const s = summary || {};
    return [
      '<section class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">',
      statCard(t(lang, "products"), number(s.product_count || 0), t(lang, "collected") + " " + (s.latest_collected_at || "-"), "bg-emerald-500"),
      statCard(t(lang, "categories"), number(s.category_count || 0), t(lang, "median") + " " + krw(s.median_price_krw || 0), "bg-sky-500"),
      statCard(t(lang, "discounted"), number(s.discounted_count || 0), pct(s.discounted_percent || 0), "bg-amber-500"),
      statCard(t(lang, "lowPrice"), number(s.low_price_count || 0), pct(s.low_price_percent || 0), "bg-teal-500"),
      statCard(t(lang, "history"), number(s.history_product_runs || 0), s.first_collected_at || "-", "bg-violet-500"),
      '</section>'
    ].join("");
  }

  function tabButton(lang, id, label, active) {
    return '<button type="button" data-sg-shopping-tab="' + esc(id) + '" class="rounded-lg border px-3 py-2 text-sm font-black transition ' + (active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400") + '">' + esc(label) + '</button>';
  }

  function productCard(lang, item) {
    const url = String(item && item.product_url ? item.product_url : "").trim();
    const score = Number(item && (item.deal_confidence_score || item.radar_score) || 0);
    const source = url
      ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-[40px] items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700">' + esc(t(lang, "source")) + '</a>'
      : "";
    return [
      '<article class="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex items-start gap-3">',
      '<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">',
      icon('<path stroke-width="2" d="M4 12h16"></path><path stroke-width="2" d="M12 4v16"></path><path stroke-width="2" d="M7 17l10-10"></path>'),
      '</div>',
      '<div class="min-w-0 flex-1">',
      '<div class="text-sm font-black leading-5 text-slate-950">' + esc(productLabel(item)) + '</div>',
      '<div class="mt-1 flex flex-wrap gap-1 text-[11px] font-bold text-slate-500">',
      '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(item && item.source_category ? item.source_category : t(lang, "provider")) + '</span>',
      item && item.product_code ? '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(item.product_code) + '</span>' : '',
      '</div>',
      '</div>',
      '</div>',
      '<dl class="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-600">',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "price")) + '</dt><dd class="font-black text-slate-950">' + esc(krw(item && item.price_krw)) + '</dd></div>',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "basis")) + '</dt><dd class="text-right">' + esc(t(lang, "basis")) + '</dd></div>',
      item && item.original_price_krw ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "originalPrice")) + '</dt><dd>' + esc(krw(item.original_price_krw)) + '</dd></div>' : '',
      item && item.category_median_price_krw ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "categoryMedian")) + '</dt><dd>' + esc(krw(item.category_median_price_krw)) + '</dd></div>' : '',
      score ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "confidence")) + '</dt><dd class="font-black text-emerald-700">' + esc(number(score)) + '</dd></div>' : '',
      item && item.reason ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "reason")) + '</dt><dd class="text-right">' + esc(item.reason) + '</dd></div>' : '',
      item && item.collected_at ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "collected")) + '</dt><dd class="text-right">' + esc(item.collected_at) + '</dd></div>' : '',
      '</dl>',
      '<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">' + esc(t(lang, "disclosure")) + '</div>',
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
      '<div class="text-sm font-black text-slate-950">' + esc(productLabel(item)) + '</div>',
      '<div class="mt-2 text-xs font-black text-rose-600">-' + esc(pct(item.drop_percent)) + '</div>',
      '<dl class="mt-3 grid gap-2 text-xs text-slate-600">',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "previous")) + '</dt><dd>' + esc(krw(item.previous_price_krw)) + '</dd></div>',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "current")) + '</dt><dd class="font-black text-slate-950">' + esc(krw(item.price_krw)) + '</dd></div>',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "basis")) + '</dt><dd class="text-right">' + esc(t(lang, "basis")) + '</dd></div>',
      '</dl>',
      '<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">' + esc(t(lang, "disclosure")) + '</div>',
      item.product_url ? '<a href="' + esc(item.product_url) + '" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700">' + esc(t(lang, "source")) + '</a>' : '',
      '</article>'
    ].join("")).join("") + '</div>';
  }

  function renderShopper(lang, radar) {
    const r = radar || {};
    return [
      '<section class="rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<div class="border-b border-slate-200 px-5 py-4">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "shopperTitle")) + '</h2>',
      '<p class="mt-1 text-sm text-slate-600">' + esc(t(lang, "shopperDesc")) + '</p>',
      '</div>',
      '<div class="p-5">' + productGrid(lang, r.deal_candidates || []) + '</div>',
      '</section>',
      '<section class="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<div class="border-b border-slate-200 px-5 py-4"><h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "drops")) + '</h2></div>',
      '<div class="p-5">' + renderDrops(lang, r.price_drop_candidates || []) + '</div>',
      '</section>'
    ].join("");
  }

  function renderSeller(lang, radar) {
    const rows = ((radar && radar.seller_insights) || []).map((item) => [
      '<article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex items-start justify-between gap-3">',
      '<div>',
      '<h3 class="text-sm font-black text-slate-950">' + esc(item.source_category || "-") + '</h3>',
      '<p class="mt-1 text-xs text-slate-500">' + esc(number(item.product_count || 0)) + ' · ' + esc(t(lang, "median")) + ' ' + esc(krw(item.median_price_krw || 0)) + '</p>',
      '</div>',
      '<span class="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-700">' + esc(t(lang, "pressure_" + (item.competition_level || "watch"))) + '</span>',
      '</div>',
      '<div class="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">',
      '<div class="rounded-lg bg-slate-50 p-3"><div class="font-bold text-slate-500">' + esc(t(lang, "lowShare")) + '</div><div class="mt-1 font-black text-slate-950">' + esc(pct(item.low_price_percent || 0)) + '</div></div>',
      '<div class="rounded-lg bg-slate-50 p-3"><div class="font-bold text-slate-500">' + esc(t(lang, "discountShare")) + '</div><div class="mt-1 font-black text-slate-950">' + esc(pct(item.discounted_percent || 0)) + '</div></div>',
      '</div>',
      '<div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700"><span class="font-black text-slate-900">' + esc(t(lang, "action")) + '</span> · ' + esc(item.recommended_action || "") + '</div>',
      '</article>'
    ].join("")).join("");
    return [
      '<section class="rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<div class="border-b border-slate-200 px-5 py-4">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "sellerTitle")) + '</h2>',
      '<p class="mt-1 text-sm text-slate-600">' + esc(t(lang, "sellerDesc")) + '</p>',
      '</div>',
      '<div class="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">' + (rows || '<div class="text-sm text-slate-600">' + esc(t(lang, "noResults")) + '</div>') + '</div>',
      '</section>',
      '<section class="mt-6">' + renderBenchmark(lang, (radar && radar.categories) || []) + '</section>'
    ].join("");
  }

  function renderBenchmark(lang, categories) {
    const rows = (categories || []).map((item) => {
      const low = Math.max(0, Math.min(100, Number(item.low_price_percent || 0)));
      const discounted = Math.max(0, Math.min(100, Number(item.discounted_percent || 0)));
      return [
        '<tr class="border-b border-slate-100 last:border-b-0">',
        '<td class="py-3 pr-4 align-top"><div class="text-sm font-black text-slate-950">' + esc(item.source_category || "-") + '</div><div class="mt-1 text-xs text-slate-500">' + esc(number(item.product_count || 0)) + '</div></td>',
        '<td class="py-3 pr-4 align-top text-xs text-slate-600">' + esc(krw(item.min_price_krw)) + ' - ' + esc(krw(item.max_price_krw)) + '<br><span class="font-bold text-slate-900">' + esc(krw(item.median_price_krw)) + '</span></td>',
        '<td class="py-3 pr-4 align-top"><div class="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><div class="h-full bg-emerald-500" style="width:' + esc(low) + '%"></div></div><div class="mt-1 text-xs text-slate-500">' + esc(pct(item.low_price_percent)) + '</div></td>',
        '<td class="py-3 align-top"><div class="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><div class="h-full bg-sky-500" style="width:' + esc(discounted) + '%"></div></div><div class="mt-1 text-xs text-slate-500">' + esc(pct(item.discounted_percent)) + '</div></td>',
        '</tr>'
      ].join("");
    }).join("");
    return [
      '<div class="rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<div class="border-b border-slate-200 px-5 py-4"><h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "benchmark")) + '</h2></div>',
      '<div class="overflow-x-auto px-5">',
      '<table class="min-w-full">',
      '<thead><tr class="border-b border-slate-200 text-left text-xs font-black text-slate-500"><th class="py-3 pr-4">' + esc(t(lang, "category")) + '</th><th class="py-3 pr-4">' + esc(t(lang, "range")) + '</th><th class="py-3 pr-4">' + esc(t(lang, "lowShare")) + '</th><th class="py-3">' + esc(t(lang, "discountShare")) + '</th></tr></thead>',
      '<tbody>' + rows + '</tbody>',
      '</table>',
      '</div>',
      '</div>'
    ].join("");
  }

  function renderPolicy(lang, radar) {
    const notes = ((radar && radar.policy_notes) || []).map((item) => [
      '<article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex items-start justify-between gap-3">',
      '<h3 class="text-sm font-black text-slate-950">' + esc(item.label || item.code || "-") + '</h3>',
      '<span class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">' + esc(t(lang, "status_" + (item.status || "active"))) + '</span>',
      '</div>',
      '<p class="mt-2 text-sm leading-6 text-slate-600">' + esc(item.detail || "") + '</p>',
      '</article>'
    ].join("")).join("");
    return [
      '<section class="rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<div class="border-b border-slate-200 px-5 py-4">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "policyTitle")) + '</h2>',
      '<p class="mt-1 text-sm text-slate-600">' + esc(t(lang, "policyDesc")) + '</p>',
      '</div>',
      '<div class="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">' + notes + '</div>',
      '</section>'
    ].join("");
  }

  function renderSearchShell(lang) {
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "searchTitle")) + '</h2>',
      '<p class="mt-1 text-sm text-slate-600">' + esc(t(lang, "searchDesc")) + '</p>',
      '<form id="sg-shopping-search" class="mt-4 flex flex-col gap-3 md:flex-row">',
      '<input id="sg-shopping-query" class="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-4 text-sm text-slate-900 placeholder:text-slate-400" type="search" autocomplete="off" placeholder="' + esc(t(lang, "searchPlaceholder")) + '">',
      '<button class="min-h-[44px] rounded-lg bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-700" type="submit">' + esc(t(lang, "search")) + '</button>',
      '</form>',
      '</section>',
      '<section id="sg-shopping-results" class="mt-6 hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm"></section>'
    ].join("");
  }

  function renderPane(lang, tab, radar) {
    if (tab === "seller") return renderSeller(lang, radar);
    if (tab === "policy") return renderPolicy(lang, radar);
    if (tab === "search") return renderSearchShell(lang);
    return renderShopper(lang, radar);
  }

  function bindTabs(lang, radar, active) {
    document.querySelectorAll("[data-sg-shopping-tab]").forEach((button) => {
      button.addEventListener("click", function () {
        const tab = button.getAttribute("data-sg-shopping-tab") || "shopper";
        const tabs = document.getElementById("sg-shopping-tabs");
        const pane = document.getElementById("sg-shopping-pane");
        if (tabs) {
          tabs.innerHTML = [
            tabButton(lang, "shopper", t(lang, "shopperTab"), tab === "shopper"),
            tabButton(lang, "seller", t(lang, "sellerTab"), tab === "seller"),
            tabButton(lang, "policy", t(lang, "policyTab"), tab === "policy"),
            tabButton(lang, "search", t(lang, "searchTab"), tab === "search")
          ].join("");
        }
        if (pane) pane.innerHTML = renderPane(lang, tab, radar);
        bindTabs(lang, radar, tab);
        if (tab === "search") bindSearch(lang);
      });
    });
    if (active === "search") bindSearch(lang);
  }

  function bindSearch(lang) {
    const resultsEl = document.getElementById("sg-shopping-results");
    const form = document.getElementById("sg-shopping-search");
    const input = document.getElementById("sg-shopping-query");
    if (!form || !input || !resultsEl || form.getAttribute("data-bound") === "1") return;
    form.setAttribute("data-bound", "1");
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
            '<div class="mb-4"><h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "searchResults")) + '</h2></div>',
            items.length ? productGrid(lang, items) : '<div class="text-sm text-slate-600">' + esc(t(lang, "noResults")) + '</div>'
          ].join("");
        })
        .catch(function () {
          resultsEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "searchError")) + '</div>';
        });
    });
  }

  function renderRadar(lang, radar) {
    return [
      renderSummary(lang, radar && radar.summary),
      '<div id="sg-shopping-tabs" class="mt-6 flex flex-wrap gap-2">',
      tabButton(lang, "shopper", t(lang, "shopperTab"), true),
      tabButton(lang, "seller", t(lang, "sellerTab"), false),
      tabButton(lang, "policy", t(lang, "policyTab"), false),
      tabButton(lang, "search", t(lang, "searchTab"), false),
      '</div>',
      '<div id="sg-shopping-pane" class="mt-6">' + renderPane(lang, "shopper", radar) + '</div>'
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
      '</div>',
      '</div>'
    ].join("");

    const radarEl = document.getElementById("sg-shopping-radar");
    function showRadar(payload) {
      const radar = payload && payload.radar ? payload.radar : {};
      radarEl.innerHTML = renderRadar(lang, radar);
      bindTabs(lang, radar, "shopper");
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
  }

  window.set_main = render;
  window.addEventListener("sg_lang_changed", function (event) {
    const nextLang = eventLang(event);
    if (nextLang && syncLangToURL(nextLang)) return;
    render(nextLang);
  });
})();
