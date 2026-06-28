(function () {
  const dict = {
    ko: {
      back: "워크벤치",
      title: "Shopping Deal Finder",
      desc: "예산과 목적을 넣으면 수집 데이터에서 살펴볼 만한 저가 후보와 셀러 액션을 찾아줍니다.",
      notice: "상품명, 이미지, 상세설명, 판매자, 브랜드, raw payload는 표시하지 않습니다. 가격은 수집 시점 관측값이며 배송비와 옵션 총액은 외부몰에서 최종 확인해야 합니다.",
      budget: "예산",
      category: "카테고리",
      query: "찾는 것",
      queryPlaceholder: "예: 가구, 화장품, 상품코드",
      intent: "목적",
      intent_budget: "저가 쇼핑",
      intent_gift: "선물",
      intent_daily: "생활템",
      intent_seller: "셀러",
      allCategories: "전체",
      find: "후보 찾기",
      finding: "후보를 찾는 중...",
      loadError: "쇼핑 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      finderError: "조건에 맞는 후보를 찾지 못했습니다. 조건을 바꿔 다시 시도해 주세요.",
      candidates: "구매 후보",
      actions: "다음 행동",
      seller: "셀러 기회",
      snapshot: "시장 스냅샷",
      policies: "안전 경계",
      price: "관측가",
      basis: "배송/옵션 미포함",
      originalPrice: "표시 정가",
      categoryMedian: "카테고리 중앙값",
      confidence: "딜 신뢰도",
      reason: "후보 사유",
      collected: "수집 시각",
      source: "외부몰에서 현재가 확인",
      disclosure: "외부몰 이동 또는 파트너 링크가 포함될 수 있습니다. 가격과 판매 여부를 직접 확인하세요.",
      noCandidates: "현재 조건에서 표시할 후보가 없습니다.",
      noSeller: "셀러 기회 신호가 아직 없습니다.",
      pressure_high_price_pressure: "가격 압박 높음",
      pressure_promotion_sensitive: "프로모션 민감",
      pressure_thin_sample: "표본 부족",
      pressure_watch: "관찰",
      products: "관측 상품",
      categoriesLabel: "카테고리",
      discounted: "할인 신호",
      lowPrice: "1만원 이하",
      latest: "최근 수집",
      median: "중앙값",
      status_active: "적용",
      status_partial: "부분 적용"
    },
    en: {
      back: "Workbench",
      title: "Shopping Deal Finder",
      desc: "Enter a budget and goal to find low-price candidates and seller actions from collected shopping signals.",
      notice: "Product titles, images, descriptions, sellers, brands, and raw payloads are not displayed. Prices are observations at collection time; verify shipping, options, availability, and final price on the external mall.",
      budget: "Budget",
      category: "Category",
      query: "Need",
      queryPlaceholder: "e.g. furniture, beauty, product code",
      intent: "Goal",
      intent_budget: "Budget buy",
      intent_gift: "Gift",
      intent_daily: "Daily item",
      intent_seller: "Seller",
      allCategories: "All",
      find: "Find candidates",
      finding: "Finding candidates...",
      loadError: "Failed to load shopping service. Please try again.",
      finderError: "No candidates found for the current filters. Try different filters.",
      candidates: "Buy candidates",
      actions: "Next actions",
      seller: "Seller opportunities",
      snapshot: "Market snapshot",
      policies: "Safety boundary",
      price: "Observed price",
      basis: "Excludes shipping/options",
      originalPrice: "Listed original",
      categoryMedian: "Category median",
      confidence: "Deal confidence",
      reason: "Signal",
      collected: "Collected",
      source: "Check current external price",
      disclosure: "External mall navigation or partner links may be included. Verify price and availability directly.",
      noCandidates: "No displayable candidates for the current filters.",
      noSeller: "No seller opportunity signal yet.",
      pressure_high_price_pressure: "High price pressure",
      pressure_promotion_sensitive: "Promotion-sensitive",
      pressure_thin_sample: "Thin sample",
      pressure_watch: "Watch",
      products: "Observed products",
      categoriesLabel: "Categories",
      discounted: "Discount signals",
      lowPrice: "Under KRW 10,000",
      latest: "Latest collection",
      median: "Median",
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

  function productLabel(item) {
    return item && item.product_label ? item.product_label : (item && item.product_code ? "Observed item #" + item.product_code : "Observed item");
  }

  function optionHTML(value, label, selected) {
    return '<option value="' + esc(value) + '"' + (selected ? " selected" : "") + '>' + esc(label) + '</option>';
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

  function renderSnapshot(lang, radar) {
    const s = radar && radar.summary ? radar.summary : {};
    return [
      '<section class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">',
      statCard(t(lang, "products"), number(s.product_count || 0), t(lang, "latest") + " " + (s.latest_collected_at || "-")),
      statCard(t(lang, "categoriesLabel"), number(s.category_count || 0), t(lang, "median") + " " + krw(s.median_price_krw || 0)),
      statCard(t(lang, "discounted"), number(s.discounted_count || 0), pct(s.discounted_percent || 0)),
      statCard(t(lang, "lowPrice"), number(s.low_price_count || 0), pct(s.low_price_percent || 0)),
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
      '<button class="mt-5 min-h-[44px] rounded-lg bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-700" type="submit">' + esc(t(lang, "find")) + '</button>',
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
      '</div>',
      '<div class="grid grid-cols-2 gap-2 text-xs md:min-w-[260px]">',
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

  function productCard(lang, item) {
    const url = String(item && item.product_url ? item.product_url : "").trim();
    return [
      '<article class="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex items-start justify-between gap-3">',
      '<div>',
      '<h3 class="text-sm font-black leading-5 text-slate-950">' + esc(productLabel(item)) + '</h3>',
      '<div class="mt-1 flex flex-wrap gap-1 text-[11px] font-bold text-slate-500">',
      '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(item && item.source_category ? item.source_category : "") + '</span>',
      item && item.product_code ? '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(item.product_code) + '</span>' : '',
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
      '<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">' + esc(t(lang, "disclosure")) + '</div>',
      url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700">' + esc(t(lang, "source")) + '</a>' : '',
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

  function renderFinderResult(lang, finder) {
    return [
      renderHeadline(lang, finder),
      '<div class="mt-6">',
      renderActions(lang, finder && finder.next_actions),
      '</div>',
      '<div class="mt-6">',
      renderCandidates(lang, finder && finder.candidates),
      '</div>',
      '<div class="mt-6">',
      renderSeller(lang, finder && finder.seller_opportunities),
      '</div>',
      '<div class="mt-6">',
      renderPolicies(lang, finder && finder.policy_notes),
      '</div>'
    ].join("");
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
          resultEl.innerHTML = renderFinderResult(lang, res.json && res.json.finder);
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
      '<span class="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">Gmarket</span>',
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
      appEl.innerHTML = [
        renderFinderForm(lang, radar),
        '<div id="sg-shopping-finder-result" class="mt-6"></div>',
        '<div class="mt-8"><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "snapshot")) + '</h2>' + renderSnapshot(lang, radar) + '</div>'
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

  window.set_main = render;
  window.addEventListener("sg_lang_changed", function (event) {
    const nextLang = eventLang(event);
    if (nextLang && syncLangToURL(nextLang)) return;
    render(nextLang);
  });
})();
