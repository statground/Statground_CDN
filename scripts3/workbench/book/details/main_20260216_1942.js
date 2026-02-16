// ================================
// Workbench Book Detail set_main()
// ================================
async function set_main() {
  const root = document.getElementById("div_main");
  if (!root) return;

  // lang + isbn from URL: /{lang}/workbench/book/details/<isbn>/
  const p = (location.pathname || "");
  const m = p.match(/\/workbench\/book\/details\/([^\/]+)\//);
  const isbn = m && m[1] ? decodeURIComponent(m[1]) : "";

  const seg = p.split("/").filter(Boolean);
  const lang = (seg && seg.length > 0 ? seg[0] : "en");

  // i18n helpers
  const i18n = window.sg_workbench_i18n_book_details;
  const t = (i18n && typeof i18n.t === "function") ? i18n.t : ((_, k) => k);
  const tf = (i18n && typeof i18n.tf === "function")
    ? i18n.tf
    : ((_, k, vars) => {
        let s = t(lang, k);
        if (vars) for (const kk in vars) s = s.replaceAll(`{${kk}}`, String(vars[kk]));
        return s;
      });

  // data fetch
  async function fetch_detail() {
    const url = `/${lang}/workbench/book/ajax_detail_raw_naver/?isbn=${encodeURIComponent(isbn)}`;
    const res = await fetch(url, { method: "GET", headers: { "Accept": "application/json" } });
    return await res.json();
  }

  function format_pubdate(s) {
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

  // render: missing isbn
  if (!isbn) {
    root.innerHTML = `<div class="text-sm text-rose-600">${esc(t(lang, "wb.book.details.no_isbn"))}</div>`;
    return;
  }

  // render: loading placeholder (optional)
  root.innerHTML = `<div class="text-sm text-slate-600 dark:text-slate-300">${esc(t(lang, "wb.book.details.loading"))}</div>`;

  let j;
  try {
    j = await fetch_detail();
  } catch (e) {
    root.innerHTML = `<div class="text-sm text-rose-600">${esc(t(lang, "wb.book.details.err"))}</div>`;
    return;
  }

  if (!j || !j.ok || !j.found || !j.item) {
    root.innerHTML = `<div class="text-sm text-rose-600">${esc(tf(lang, "wb.book.details.not_found_isbn", { isbn }))}</div>`;
    return;
  }

  const book = j.item;
  const backUrl = `/${lang}/workbench/book/`;

  const coverUrl = (book.cover_url || "").trim();
  const title = esc(book.title || "제목 없음");
  const author = esc(book.author || "-");
  const publisher = esc(book.publisher || "-");
  const pubdate = esc(format_pubdate(book.pubdate || "-"));
  const isbnRaw = esc(book.isbn_raw || isbn);
  const link = (book.link || "").trim();
  const desc = esc(book.description || "");

  const labelBack = esc(t(lang, "wb.book.details.back"));
  const labelAuthor = esc(t(lang, "wb.book.details.author"));
  const labelPublisher = esc(t(lang, "wb.book.details.publisher"));
  const labelPubdate = esc(t(lang, "wb.book.details.pubdate"));
  const labelIsbn = esc(t(lang, "wb.book.details.isbn"));
  const labelMarketplace = esc(t(lang, "wb.book.details.marketplace"));
  const labelOpen = esc(t(lang, "wb.book.details.open"));
  const labelDesc = esc(t(lang, "wb.book.details.desc"));
  const labelSource = esc(t(lang, "wb.book.details.source"));

  root.innerHTML = `
    <!-- 🔙 Back -->
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

        <div class="text-xs text-slate-500 dark:text-slate-400 mb-4">
          ${labelSource}
        </div>

        <div class="grid grid-cols-12 gap-6">
          <!-- Cover -->
          <div class="col-span-12 md:col-span-4">
            <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden">
              ${coverUrl ? `
                <img src="${coverUrl}"
                     alt="${title}"
                     class="w-full h-auto object-cover"
                     onerror="this.style.display='none';" />
              ` : ``}
            </div>
          </div>

          <!-- Info -->
          <div class="col-span-12 md:col-span-8">
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
              ${title}
            </h1>

            <div class="mt-3 text-slate-600 dark:text-slate-300 text-sm">
              ${labelAuthor} |
              <span class="font-semibold text-slate-900 dark:text-white">
                ${author}
              </span>
              <span class="mx-2 text-slate-300 dark:text-slate-600">|</span>
              ${labelPubdate} |
              <span class="font-semibold text-slate-900 dark:text-white">
                ${pubdate}
              </span>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                <div class="text-xs text-slate-500 dark:text-slate-400">${labelPublisher}</div>
                <div class="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  ${publisher}
                </div>
              </div>

              <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                <div class="text-xs text-slate-500 dark:text-slate-400">${labelIsbn}</div>
                <div class="text-sm font-semibold text-slate-900 dark:text-white mt-1 break-all">
                  ${isbnRaw}
                </div>
              </div>
            </div>

            <!-- Marketplace -->
            <div class="mt-8">
              <div class="text-base font-bold text-slate-900 dark:text-white mb-3">${labelMarketplace}</div>

              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                ${link ? `
                  <a href="${link}" target="_blank" rel="noopener"
                     class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition p-3 flex flex-col items-center justify-center gap-2">
                    <div class="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                      <img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/naver.png"
                           alt="naver"
                           class="h-full w-full object-contain" />
                    </div>
                    <div class="text-sm font-extrabold text-slate-900 dark:text-white text-center">Naver</div>
                    <div class="px-2 py-1 text-xs font-semibold rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      ${labelOpen}
                    </div>
                  </a>
                ` : ``}
              </div>

              <!-- ✅ Adpick banner -->
              <div class="mt-8 flex justify-center">
                <a href="#" target="_blank" rel="noopener">
                  <img
                    src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/common/affiliates/adpick.png"
                    alt="Adpick"
                    class="w-[125px] h-[125px] object-contain"
                  />
                </a>
              </div>

            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mt-8">
          <div class="text-base font-bold text-slate-900 dark:text-white mb-3">${labelDesc}</div>
          <div class="text-sm leading-7 text-slate-700 dark:text-slate-200 whitespace-pre-line">
            ${desc}
          </div>
        </div>

      </div>
    </div>
  `;
}
