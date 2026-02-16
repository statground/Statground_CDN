/**
 * scripts3/workbench/book/i18n_workbench_book.js
 * - Extends window.sg_workbench_i18n dict with book-specific keys
 */
(function () {
  const base = window.sg_workbench_i18n;
  if (!base || !base.dict || !base.languages) {
    // base i18n must be loaded first
    window.sg_workbench_i18n_book = {
      t: function (_lang, key) { return key; }
    };
    return;
  }

  // shallow merge per-language
  function mergeLangDict(langCode, patch) {
    if (!base.dict[langCode]) base.dict[langCode] = {};
    for (const k in patch) base.dict[langCode][k] = patch[k];
  }

  // helpers
  function t(lang, key) {
    const L = base.resolveLangCode ? base.resolveLangCode(lang) : lang;
    const d = base.dict[L] || {};
    return d[key] || key;
  }

  // --- Book Workbench keys (minimal but covers UI) ---
  const ko = {
    "wb.book.title": "도서 워크벤치",
    "wb.book.desc": "도서 데이터(검색/상세/마켓/어필리에이트)를 빠르게 탐색하고 품질을 점검합니다.",
    "wb.book.search.placeholder": "도서명, 저자, ISBN 검색...",
    "wb.book.search.btn": "검색",
    "wb.book.search.todo": "검색 기능은 다음 단계에서 구현됩니다.",
    "wb.book.recent.title": "최근 수집된 도서",
    "wb.book.recent.pc": "PC: 최신 12개",
    "wb.book.recent.mobile": "Mobile: 최신 3개",
    "wb.book.refresh": "새로고침",
    "wb.book.loading": "불러오는 중...",
    "wb.book.empty": "표시할 도서가 없습니다.",
    "wb.book.err.load_recent": "최근 수집된 도서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    "wb.book.isbn": "ISBN",
    "wb.book.collected": "수집",
    "wb.book.pubdate": "출간일",
    "wb.book.no_isbn": "ISBN이 없어 상세 페이지로 이동할 수 없습니다."
  };

  const en = {
    "wb.book.title": "Book Workbench",
    "wb.book.desc": "Explore and validate book data (search/details/market/affiliate).",
    "wb.book.search.placeholder": "Search by title, author, ISBN...",
    "wb.book.search.btn": "Search",
    "wb.book.search.todo": "Search will be implemented next.",
    "wb.book.recent.title": "Recently collected books",
    "wb.book.recent.pc": "Desktop: latest 12",
    "wb.book.recent.mobile": "Mobile: latest 3",
    "wb.book.refresh": "Refresh",
    "wb.book.loading": "Loading...",
    "wb.book.empty": "No books to show.",
    "wb.book.err.load_recent": "Failed to load recent books. Please try again.",
    "wb.book.isbn": "ISBN",
    "wb.book.collected": "Collected",
    "wb.book.pubdate": "Published",
    "wb.book.no_isbn": "Cannot open details because ISBN is missing."
  };

  const ja = {
    "wb.book.title": "書籍ワークベンチ",
    "wb.book.desc": "書籍データ（検索/詳細/マーケット/アフィリエイト）を素早く確認します。",
    "wb.book.search.placeholder": "書名・著者・ISBNで検索...",
    "wb.book.search.btn": "検索",
    "wb.book.search.todo": "検索機能は次の段階で実装します。",
    "wb.book.recent.title": "最近収集された書籍",
    "wb.book.recent.pc": "PC: 最新12件",
    "wb.book.recent.mobile": "Mobile: 最新3件",
    "wb.book.refresh": "更新",
    "wb.book.loading": "読み込み中...",
    "wb.book.empty": "表示できる書籍がありません。",
    "wb.book.err.load_recent": "最近の書籍を読み込めませんでした。しばらくしてから再試行してください。",
    "wb.book.isbn": "ISBN",
    "wb.book.collected": "収集",
    "wb.book.pubdate": "刊行日",
    "wb.book.no_isbn": "ISBNがないため詳細ページへ移動できません。"
  };

  const zhHans = {
    "wb.book.title": "图书工作台",
    "wb.book.desc": "快速浏览并检查图书数据（搜索/详情/市场/联盟）。",
    "wb.book.search.placeholder": "按书名、作者、ISBN 搜索…",
    "wb.book.search.btn": "搜索",
    "wb.book.search.todo": "搜索功能将在下一阶段实现。",
    "wb.book.recent.title": "最近采集的图书",
    "wb.book.recent.pc": "PC：最新 12 条",
    "wb.book.recent.mobile": "Mobile：最新 3 条",
    "wb.book.refresh": "刷新",
    "wb.book.loading": "加载中…",
    "wb.book.empty": "暂无可显示的图书。",
    "wb.book.err.load_recent": "无法加载最近采集的图书，请稍后重试。",
    "wb.book.isbn": "ISBN",
    "wb.book.collected": "采集",
    "wb.book.pubdate": "出版日期",
    "wb.book.no_isbn": "缺少 ISBN，无法打开详情页。"
  };

  const zhHant = {
    "wb.book.title": "圖書工作台",
    "wb.book.desc": "快速瀏覽並檢查圖書資料（搜尋/詳情/市場/聯盟）。",
    "wb.book.search.placeholder": "以書名、作者、ISBN 搜尋…",
    "wb.book.search.btn": "搜尋",
    "wb.book.search.todo": "搜尋功能將在下一階段實作。",
    "wb.book.recent.title": "最近蒐集的圖書",
    "wb.book.recent.pc": "PC：最新 12 筆",
    "wb.book.recent.mobile": "Mobile：最新 3 筆",
    "wb.book.refresh": "重新整理",
    "wb.book.loading": "載入中…",
    "wb.book.empty": "沒有可顯示的圖書。",
    "wb.book.err.load_recent": "無法載入最近蒐集的圖書，請稍後再試。",
    "wb.book.isbn": "ISBN",
    "wb.book.collected": "蒐集",
    "wb.book.pubdate": "出版日期",
    "wb.book.no_isbn": "缺少 ISBN，無法開啟詳情頁。"
  };

  // Apply patches
  mergeLangDict("ko", ko);
  mergeLangDict("en", en);
  mergeLangDict("ja", ja);
  mergeLangDict("zh-Hans", zhHans);
  mergeLangDict("zh-Hant", zhHant);

  // Fallback: for other languages in base.languages, at least provide English labels if missing
  try {
    (base.languages || []).forEach((l) => {
      const code = l && l.code;
      if (!code) return;
      if (!base.dict[code]) base.dict[code] = {};
      const d = base.dict[code];
      // only set if missing
      for (const k in en) {
        if (!(k in d)) d[k] = en[k];
      }
    });
  } catch (e) {}

  window.sg_workbench_i18n_book = { t };
})();