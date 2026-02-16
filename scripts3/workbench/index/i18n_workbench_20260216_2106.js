
/**
 * scripts3/workbench/i18n_workbench.js
 * - Workbench i18n (Book card simplified: removed 'Workbench' wording and removed parentheses details)
 */
(function () {
  const languages = [
    { code: "ko", label: "한국어" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "zh-Hans", label: "中文(简体)" },
    { code: "zh-Hant", label: "中文(繁體)" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "pt-BR", label: "Português (Brasil)" },
    { code: "ru", label: "Русский" },
    { code: "id", label: "Bahasa Indonesia" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "th", label: "ไทย" },
    { code: "ms", label: "Bahasa Melayu" },
    { code: "fil", label: "Filipino" },
    { code: "hi", label: "हिन्दी" },
    { code: "ar", label: "العربية" },
    { code: "it", label: "Italiano" },
    { code: "nl", label: "Nederlands" },
    { code: "pl", label: "Polski" },
    { code: "sv", label: "Svenska" },
    { code: "tr", label: "Türkçe" },
    { code: "uk", label: "Українська" }
  ];

  const dict = {
    "ko": {
      "wb.badge": "워크벤치",
      "wb.title": "워크벤치",
      "wb.subtitle": "데이터 조회·분석·리포트 제작을 위한 작업 공간입니다.",
      "wb.card.book.title": "도서",
      "wb.card.book.desc": "도서 데이터를 빠르게 탐색하고 품질을 점검합니다.",
      "wb.cta.open": "열기"
    },
    "en": {
      "wb.badge": "Workbench",
      "wb.title": "Workbench",
      "wb.subtitle": "A workspace for data exploration, analysis, and report building.",
      "wb.card.book.title": "Books",
      "wb.card.book.desc": "Quickly explore book data and check quality.",
      "wb.cta.open": "Open"
    },
    "ja": {
      "wb.badge": "ワークベンチ",
      "wb.title": "ワークベンチ",
      "wb.subtitle": "データの参照・分析・レポート作成のための作業スペースです。",
      "wb.card.book.title": "書籍",
      "wb.card.book.desc": "書籍データを素早く探索し、品質を確認します。",
      "wb.cta.open": "開く"
    },
    "zh-Hans": {
      "wb.badge": "工作台",
      "wb.title": "工作台",
      "wb.subtitle": "用于数据查询、分析与报告制作的工作空间。",
      "wb.card.book.title": "图书",
      "wb.card.book.desc": "快速浏览图书数据并检查数据质量。",
      "wb.cta.open": "打开"
    },
    "zh-Hant": {
      "wb.badge": "工作台",
      "wb.title": "工作台",
      "wb.subtitle": "用於資料查詢、分析與報告製作的工作空間。",
      "wb.card.book.title": "圖書",
      "wb.card.book.desc": "快速探索圖書資料並檢查資料品質。",
      "wb.cta.open": "開啟"
    }
  };

  const FALLBACK_ORDER = ["en", "ko"];

  function t(lang, key) {
    if (dict[lang] && dict[lang][key]) return dict[lang][key];
    for (const fb of FALLBACK_ORDER) {
      if (dict[fb] && dict[fb][key]) return dict[fb][key];
    }
    return key;
  }

  function resolveLangCode(code) {
    if (!code) return "en";
    return code;
  }

  function isRtl(lang) {
    return lang === "ar";
  }

  window.sg_workbench_i18n = {
    languages,
    dict,
    t,
    resolveLangCode,
    isRtl
  };
})();
