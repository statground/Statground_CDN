(function () {
  function ctx() {
    return window.STATGROUND_PAGE_CONTEXT || {};
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function bookUUID() {
    const page = ctx();
    if (page.book_uuid) return String(page.book_uuid);
    const match = (location.pathname || "").match(/\/data\/book\/([^/]+)\//);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function coverFallback(book) {
    const title = encodeURIComponent((book && book.title) || "Book");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="560" viewBox="0 0 420 560"><rect width="420" height="560" rx="28" fill="#f1f5f9"/><rect x="42" y="52" width="42" height="456" rx="14" fill="#0f172a"/><text x="112" y="168" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#0f172a">' + title.slice(0, 24) + '</text><text x="112" y="492" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#64748b">Statistical Ground</text></svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function normalize(json) {
    if (!json || json.ok === false) return null;
    return json.item || json.book || json.data || null;
  }

  function renderBook(root, book) {
    if (!book) {
      root.innerHTML = '<div class="max-w-5xl mx-auto rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">도서 상세를 찾을 수 없습니다.</div>';
      return;
    }
    const title = book.title || "(no title)";
    const cover = book.cover_url || book.image || coverFallback(book);
    const author = book.author || book.authors || "-";
    const publisher = book.publisher || "-";
    const pubdate = book.pubdate || book.published_at || "-";
    const isbn = book.isbn || book.isbn_raw || "-";
    const description = book.description || book.introduction || "";
    const link = book.link || book.url || "";

    root.innerHTML = [
      '<div class="max-w-6xl mx-auto px-2 md:px-0">',
      '<div class="mb-5 flex items-center justify-between gap-3">',
      '<a href="/data/book/" class="text-sm font-bold text-slate-500 hover:text-slate-900">도서</a>',
      link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener" class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">원문 보기</a>' : '',
      '</div>',
      '<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">',
      '<div class="grid grid-cols-1 md:grid-cols-12 gap-6">',
      '<div class="md:col-span-4">',
      '<div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">',
      '<img src="' + esc(cover) + '" alt="" class="w-full h-auto object-cover" loading="lazy" decoding="async" />',
      '</div>',
      '</div>',
      '<div class="md:col-span-8 min-w-0">',
      '<h1 class="text-2xl md:text-4xl font-black tracking-tight text-slate-900 break-words">' + esc(title) + '</h1>',
      '<div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">',
      meta("저자", author),
      meta("출판사", publisher),
      meta("발행일", pubdate),
      meta("ISBN", isbn),
      '</div>',
      description ? '<div class="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">' + esc(description) + '</div>' : '',
      '</div>',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function meta(label, value) {
    return '<div class="rounded-xl border border-slate-200 bg-slate-50 p-3"><div class="text-xs text-slate-500">' + esc(label) + '</div><div class="mt-1 break-words text-sm font-semibold text-slate-900">' + esc(value || "-") + '</div></div>';
  }

  function setMain() {
    const root = document.getElementById("div_main");
    if (!root) return;
    const uuid = bookUUID();
    if (!uuid) {
      root.innerHTML = '<div class="max-w-5xl mx-auto rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">도서 식별자가 없습니다.</div>';
      return;
    }
    root.innerHTML = '<div class="max-w-6xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div class="animate-pulse space-y-4"><div class="h-7 w-2/3 rounded bg-slate-200"></div><div class="h-4 w-1/3 rounded bg-slate-200"></div><div class="h-64 rounded bg-slate-200"></div></div></div>';
    fetch("/data/ajax_book_detail/" + encodeURIComponent(uuid) + "/", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((json) => renderBook(root, normalize(json)))
      .catch(() => {
        root.innerHTML = '<div class="max-w-5xl mx-auto rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.</div>';
      });
  }

  window.set_main = setMain;
})();
