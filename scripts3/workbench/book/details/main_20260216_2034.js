// =====================================
// Workbench Book Detail set_main (Stable URL lang)
// - First render ALWAYS uses URL prefix lang (routeLang)
// - Prevents "auto revert" to stored language by requiring a recent user gesture
//   before adopting language changes from localStorage/cookies/html.
// - Reacts to explicit language change via:
//   1) Custom event: window.dispatchEvent(new CustomEvent("sg_lang_changed", {detail:{lang:"xx"}}))
//   2) localStorage.setItem("lang"/"sg_lang"/...) triggered by user gesture (click/keydown)
// - No polling (so background scripts won't override)
// =====================================
async function set_main() {
  const root = document.getElementById("div_main");
  if (!root) return;

  const path = (location.pathname || "");
  const m = path.match(/\/workbench\/book\/details\/([^\/]+)\//);
  const isbn = m && m[1] ? decodeURIComponent(m[1]) : "";

  // URL lang (routing/API + initial UI)
  const seg = path.split("/").filter(Boolean);
  const routeLang = (seg && seg.length > 0 ? seg[0] : "en");

  // wait for details i18n (max ~1s)
  for (let i = 0; i < 20; i++) {
    if (window.sg_workbench_i18n_book_details && typeof window.sg_workbench_i18n_book_details.t === "function") break;
    await new Promise(r => setTimeout(r, 50));
  }

  const detailsI18n = window.sg_workbench_i18n_book_details || {};
  const t = (typeof detailsI18n.t === "function") ? detailsI18n.t : ((_, k) => k);
  const tf = (typeof detailsI18n.tf === "function") ? detailsI18n.tf : ((lang, k, vars) => {
    let s = t(lang, k);
    if (vars) for (const kk in vars) s = s.replaceAll(`{${kk}}`, String(vars[kk]));
    return s;
  });

  async function fetchDetail() {
    const url = `/${routeLang}/workbench/book/ajax_detail_raw_naver/?isbn=${encodeURIComponent(isbn)}`;
    const res = await fetch(url, { method: "GET", headers: { "Accept": "application/json" } });
    return await res.json();
  }

  function formatPubdate(s) {
    const v = (s || "").trim();
    if (/^\d{8}$/.test(v)) return `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`;
    if (/^\d{6}$/.test(v)) return `${v.slice(0,4)}-${v.slice(4,6)}`;
    return v;
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  let bookCache = window.__WB_BOOK_DETAIL_CACHE__ || (window.__WB_BOOK_DETAIL_CACHE__ = {});
  const cacheKey = `isbn:${isbn}`;

  async function getBook() {
    if (bookCache[cacheKey]) return bookCache[cacheKey];

    root.innerHTML = `<div class="text-sm text-slate-600 dark:text-slate-300">${esc(t(routeLang, "wb.book.details.loading"))}</div>`;

    let j;
    try { j = await fetchDetail(); }
    catch (e) {
      root.innerHTML = `<div class="text-sm text-rose-600">${esc(t(routeLang, "wb.book.details.err"))}</div>`;
      return null;
    }

    if (!j || !j.ok || !j.found || !j.item) {
      root.innerHTML = `<div class="text-sm text-rose-600">${esc(tf(routeLang, "wb.book.details.not_found_isbn", { isbn }))}</div>`;
      return null;
    }

    bookCache[cacheKey] = j.item;
    return j.item;
  }

  function render(book, uiLang) {
    const backUrl = `/${uiLang}/workbench/book/`;

    const coverUrl = (book.cover_url || "").trim();
    const title = esc(book.title || "제목 없음");
    const author = esc(book.author || "-");
    const publisher = esc(book.publisher || "-");
    const pubdate = esc(formatPubdate(book.pubdate || "-"));
    const isbnRaw = esc(book.isbn_raw || isbn);
    const link = (book.link || "").trim();
    const desc = esc(book.description || "");

    const labelBack = esc(t(uiLang, "wb.book.details.back"));
    const labelAuthor = esc(t(uiLang, "wb.book.details.author"));
    const labelPublisher = esc(t(uiLang, "wb.book.details.publisher"));
    const labelPubdate = esc(t(uiLang, "wb.book.details.pubdate"));
    const labelIsbn = esc(t(uiLang, "wb.book.details.isbn"));
    const labelMarketplace = esc(t(uiLang, "wb.book.details.marketplace"));
    const labelOpen = esc(t(uiLang, "wb.book.details.open"));
    const labelDesc = esc(t(uiLang, "wb.book.details.desc"));
    const labelSource = esc(t(uiLang, "wb.book.details.source"));

    root.innerHTML = `
      <div class="max-w-6xl mx-auto mb-4">
        <a href="${backUrl}"
           class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 19a1 1 0 0 1-.7-.29l-6-6a1 1 0 0 1 0-1.42l6-6a1 1 0 1 1 1.4 1.42L10.91 12l5.29 5.29A1 1 0 0 1 15.5 19z"/>
            </svg>
          </span>
          ${labelBack}
        </a>
      </div>

      <div class="max-w-6xl mx-auto">
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div class="text-xs text-slate-500 dark:text-slate-400 mb-4">${labelSource}</div>

          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 md:col-span-4">
              <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                ${coverUrl ? `<img src="${coverUrl}" alt="${title}" class="w-full h-auto object-cover" onerror="this.style.display='none';" />` : ``}
              </div>
            </div>

            <div class="col-span-12 md:col-span-8">
              <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">${title}</h1>

              <div class="mt-3 text-slate-600 dark:text-slate-300 text-sm">
                ${labelAuthor} | <span class="font-semibold text-slate-900 dark:text-white">${author}</span>
                <span class="mx-2 text-slate-300 dark:text-slate-600">|</span>
                ${labelPubdate} | <span class="font-semibold text-slate-900 dark:text-white">${pubdate}</span>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-3">
                <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                  <div class="text-xs text-slate-500 dark:text-slate-400">${labelPublisher}</div>
                  <div class="text-sm font-semibold text-slate-900 dark:text-white mt-1">${publisher}</div>
                </div>

                <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                  <div class="text-xs text-slate-500 dark:text-slate-400">${labelIsbn}</div>
                  <div class="text-sm font-semibold text-slate-900 dark:text-white mt-1 break-all">${isbnRaw}</div>
                </div>
              </div>

              <div class="mt-8">
                <div class="text-base font-bold text-slate-900 dark:text-white mb-3">${labelMarketplace}</div>

                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  ${link ? `
                    <a href="${link}" target="_blank" rel="noopener"
                       class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition p-3 flex flex-col items-center justify-center gap-2">
                      <div class="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                        <img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/naver.png" alt="naver" class="h-full w-full object-contain" />
                      </div>
                      <div class="text-sm font-extrabold text-slate-900 dark:text-white text-center">Naver</div>
                      <div class="px-2 py-1 text-xs font-semibold rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900">${labelOpen}</div>
                    </a>
                  ` : ``}
                </div>

                <div class="mt-8 flex justify-center">
                  <a href="#" target="_blank" rel="noopener">
                    <img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/common/affiliates/adpick.png"
                         alt="Adpick" class="w-[125px] h-[125px] object-contain" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <div class="text-base font-bold text-slate-900 dark:text-white mb-3">${labelDesc}</div>
            <div class="text-sm leading-7 text-slate-700 dark:text-slate-200 whitespace-pre-line">${desc}</div>
          </div>
        </div>
      </div>
    `;
  }

  // ---------------- initial render (URL lang wins) ----------------
  if (!isbn) {
    root.innerHTML = `<div class="text-sm text-rose-600">${esc(t(routeLang, "wb.book.details.no_isbn"))}</div>`;
    return;
  }

  const book = await getBook();
  if (!book) return;

  // lock language to URL until user explicitly changes it
  let currentLang = routeLang;
  render(book, currentLang);

  // ---------------- explicit language change handling ----------------
  const watchedKeys = new Set(["lang", "sg_lang", "statground_lang", "site_lang", "language", "wb_lang"]);
  let lastUserGestureAt = 0;

  function markGesture() { lastUserGestureAt = Date.now(); }

  document.addEventListener("click", markGesture, { capture: true, passive: true });
  document.addEventListener("keydown", markGesture, { capture: true, passive: true });
  document.addEventListener("touchstart", markGesture, { capture: true, passive: true });

  function maybeAdoptLang(newLang) {
    if (!newLang) return;
    if (newLang === currentLang) return;
    currentLang = newLang;
    render(book, currentLang);
  }

  // 1) Custom event from language modal (recommended)
  window.addEventListener("sg_lang_changed", (e) => {
    const newLang = e && e.detail && e.detail.lang ? String(e.detail.lang) : "";
    if (newLang) maybeAdoptLang(newLang);
  });

  // 2) Hook localStorage.setItem for same-tab changes (only accept if user gesture just happened)
  if (!window.__SG_WB_LANG_SETITEM_HOOKED__) {
    window.__SG_WB_LANG_SETITEM_HOOKED__ = true;

    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (k, v) {
      origSetItem(k, v);
      try {
        const key = String(k || "");
        if (!watchedKeys.has(key)) return;
        // accept only near user gesture (prevents background auto-sets)
        if (Date.now() - lastUserGestureAt > 1200) return;
        maybeAdoptLang(String(v || ""));
      } catch (_) {}
    };
  }

  // 3) Also react when <html lang="..."> is changed by UI script (only with user gesture)
  const obs = new MutationObserver(() => {
    const htmlLang = (document.documentElement && document.documentElement.getAttribute("lang")) || "";
    if (!htmlLang) return;
    if (Date.now() - lastUserGestureAt > 1200) return;
    maybeAdoptLang(htmlLang);
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
}
