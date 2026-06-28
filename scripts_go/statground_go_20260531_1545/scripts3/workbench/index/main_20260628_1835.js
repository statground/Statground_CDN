(function () {
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeLang(raw) {
    if (window.sg_resolve_lang_code) {
      return window.sg_resolve_lang_code(raw) || "";
    }
    return String(raw || "").trim();
  }

  function currentLang(langOverride) {
    const preferred = normalizeLang(langOverride);
    if (preferred) return preferred;
    if (window.sg_get_current_lang) return window.sg_get_current_lang();
    const seg = (location.pathname || "").split("/").filter(Boolean);
    return seg[0] || "ko";
  }

  function eventLang(event) {
    const raw = event && event.detail && event.detail.lang ? String(event.detail.lang).trim() : "";
    return normalizeLang(raw);
  }

  function syncLangToURL(lang) {
    const langCode = normalizeLang(lang);
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

  function t(lang, key, fallback) {
    const wb = window.sg_workbench_i18n;
    if (wb && typeof wb.t === "function") {
      const value = wb.t(lang, key);
      if (value && value !== key) return value;
    }
    if (lang === "ko") {
      const ko = {
        "wb.card.book.title": "도서 워크벤치",
        "wb.card.book.desc": "NAVER 도서 데이터를 검색하고 상세를 확인합니다.",
        "wb.card.lecture.title": "강의 워크벤치",
        "wb.card.lecture.desc": "Inflearn 강의 데이터를 탐색하고 수집 상태를 확인합니다.",
        "wb.card.shopping.title": "쇼핑 워크벤치",
        "wb.card.shopping.desc": "쇼핑 상품명, 가격, 수집 시점과 원문 링크를 확인합니다."
      };
      if (ko[key]) return ko[key];
    }
    const en = {
      "wb.card.shopping.title": "Shopping Workbench",
      "wb.card.shopping.desc": "Inspect product names, prices, collection time, and source links."
    };
    return en[key] || fallback || key;
  }

  function iconBook() {
    return [
      '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">',
      '<path stroke-width="2" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>',
      '<path stroke-width="2" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"></path>',
      '<path stroke-width="2" d="M8 6h8"></path>',
      '<path stroke-width="2" d="M8 10h8"></path>',
      '</svg>'
    ].join("");
  }

  function iconLecture() {
    return [
      '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">',
      '<path stroke-width="2" d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v13H6.5A2.5 2.5 0 0 0 4 19.5v-13Z"></path>',
      '<path stroke-width="2" d="M8 8h8"></path>',
      '<path stroke-width="2" d="M8 11h6"></path>',
      '<path stroke-width="2" d="M6.5 17H20"></path>',
      '</svg>'
    ].join("");
  }

  function iconShopping() {
    return [
      '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">',
      '<path stroke-width="2" d="M6 6h15l-2 8H8L6 3H3"></path>',
      '<circle cx="9" cy="20" r="1.8" stroke-width="2"></circle>',
      '<circle cx="18" cy="20" r="1.8" stroke-width="2"></circle>',
      '</svg>'
    ].join("");
  }

  function cardHTML(href, icon, title, desc, cta) {
    return [
      '<a href="' + href + '" class="group block h-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm hover:shadow-md transition">',
      '<div class="flex h-full flex-col gap-4">',
      '<div class="flex items-start gap-4">',
      '<div class="h-12 w-12 shrink-0 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-200">',
      icon,
      '</div>',
      '<div class="min-w-0">',
      '<div class="text-lg font-black tracking-tight text-slate-900 dark:text-white">',
      esc(title),
      '</div>',
      '<div class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">',
      esc(desc),
      '</div>',
      '</div>',
      '</div>',
      '<span class="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-extrabold group-hover:opacity-90 transition">',
      esc(cta),
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-width="2" d="M9 5l7 7-7 7"></path></svg>',
      '</span>',
      '</div>',
      '</a>'
    ].join("");
  }

  function render(langOverride) {
    const root = document.getElementById("div_main");
    if (!root) return;
    const lang = currentLang(langOverride);
    const bookHref = "/" + encodeURIComponent(lang) + "/workbench/book/";
    const lectureHref = "/" + encodeURIComponent(lang) + "/workbench/lecture/";
    const shoppingHref = "/" + encodeURIComponent(lang) + "/workbench/shopping/";
    const cta = t(lang, "wb.cta.open", "Open");

    root.innerHTML = [
      '<div class="w-full">',
      '<div class="max-w-6xl mx-auto px-2 md:px-0">',
      '<section class="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm">',
      '<div class="relative p-8 md:p-12">',
      '<div class="flex flex-wrap items-center gap-2 mb-4">',
      '<span class="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">',
      esc(t(lang, "wb.badge", "Workbench")),
      '</span>',
      '<span class="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">',
      esc(lang),
      '</span>',
      '</div>',
      '<h1 class="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">',
      esc(t(lang, "wb.title", "Workbench")),
      '</h1>',
      '<p class="mt-3 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl">',
      esc(t(lang, "wb.subtitle", "A workspace for data exploration, analysis, and report building.")),
      '</p>',
      '</div>',
      '</section>',
      '<div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">',
      cardHTML(
        bookHref,
        iconBook(),
        t(lang, "wb.card.book.title", "Book Workbench"),
        t(lang, "wb.card.book.desc", "Quickly explore book data and check quality."),
        cta
      ),
      cardHTML(
        lectureHref,
        iconLecture(),
        t(lang, "wb.card.lecture.title", "Lecture Workbench"),
        t(lang, "wb.card.lecture.desc", "Explore Inflearn lecture data and collection status."),
        cta
      ),
      cardHTML(
        shoppingHref,
        iconShopping(),
        t(lang, "wb.card.shopping.title", "Shopping Workbench"),
        t(lang, "wb.card.shopping.desc", "Inspect shopping product data and source links."),
        cta
      ),
      '</div>',
      '</div>',
      '</div>'
    ].join("");
  }

  window.set_main = render;
  window.addEventListener("sg_lang_changed", function (event) {
    const nextLang = eventLang(event);
    if (nextLang && syncLangToURL(nextLang)) return;
    render(nextLang);
  });
})();
