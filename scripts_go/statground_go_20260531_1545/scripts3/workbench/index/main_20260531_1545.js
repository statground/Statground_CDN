(function () {
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function currentLang() {
    if (window.sg_get_current_lang) return window.sg_get_current_lang();
    const seg = (location.pathname || "").split("/").filter(Boolean);
    return seg[0] || "ko";
  }

  function t(lang, key, fallback) {
    const wb = window.sg_workbench_i18n;
    if (wb && typeof wb.t === "function") {
      const value = wb.t(lang, key);
      if (value && value !== key) return value;
    }
    return fallback || key;
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

  function render() {
    const root = document.getElementById("div_main");
    if (!root) return;
    const lang = currentLang();
    const bookHref = "/" + encodeURIComponent(lang) + "/workbench/book/";

    root.innerHTML = [
      '<div class="w-full">',
      '<div class="max-w-6xl mx-auto px-2 md:px-0">',
      '<section class="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm">',
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
      '<a href="' + bookHref + '" class="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm hover:shadow-md transition">',
      '<div class="flex items-start justify-between gap-4">',
      '<div class="flex items-start gap-4">',
      '<div class="h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-200">',
      iconBook(),
      '</div>',
      '<div>',
      '<div class="text-lg font-black tracking-tight text-slate-900 dark:text-white">',
      esc(t(lang, "wb.card.book.title", "Book Workbench")),
      '</div>',
      '<div class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">',
      esc(t(lang, "wb.card.book.desc", "Quickly explore book data and check quality.")),
      '</div>',
      '</div>',
      '</div>',
      '<span class="shrink-0 inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-extrabold group-hover:opacity-90 transition">',
      esc(t(lang, "wb.cta.open", "Open")),
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-width="2" d="M9 5l7 7-7 7"></path></svg>',
      '</span>',
      '</div>',
      '</a>',
      '</div>',
      '</div>',
      '</div>'
    ].join("");
  }

  window.set_main = render;
  window.addEventListener("sg_lang_changed", render);
})();
