/**
 * scripts3/workbench/i18n_workbench_20260216_1435.js
 * - Workbench 전용 i18n (React용)
 * - 공용 i18n.js의 언어 리스트를 그대로 사용
 */
(function () {
  const languages = [
  { code: "ko", label: "\ud55c\uad6d\uc5b4" },
  { code: "en", label: "English" },
  { code: "ja", label: "\u65e5\u672c\u8a9e" },
  { code: "zh-Hans", label: "\u4e2d\u6587(\u7b80\u4f53)" },
  { code: "zh-Hant", label: "\u4e2d\u6587(\u7e41\u9ad4)" },
  { code: "es", label: "Espa\u00f1ol" },
  { code: "fr", label: "Fran\u00e7ais" },
  { code: "de", label: "Deutsch" },
  { code: "pt-BR", label: "Portugu\u00eas (Brasil)" },
  { code: "ru", label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "vi", label: "Ti\u1ebfng Vi\u1ec7t" },
  { code: "th", label: "\u0e44\u0e17\u0e22" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "fil", label: "Filipino" },
  { code: "hi", label: "\u0939\u093f\u0928\u094d\u0926\u0940" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "sv", label: "Svenska" },
  { code: "tr", label: "T\u00fcrk\u00e7e" },
  { code: "uk", label: "\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430" }
];

  const dict = {
  "ko": {
    "wb.badge": "워크벤치",
    "wb.title": "워크벤치",
    "wb.subtitle": "데이터 조회·분석·리포트 제작을 위한 작업 공간입니다.",
    "wb.card.book.title": "도서 워크벤치",
    "wb.card.book.desc": "도서 데이터(검색/상세/마켓/어필리에이트)를 빠르게 탐색하고 품질을 점검합니다.",
    "wb.cta.open": "열기"
  },
  "en": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "A workspace for data exploration, analysis, and report building.",
    "wb.card.book.title": "Book Workbench",
    "wb.card.book.desc": "Quickly explore book data (search/detail/market/affiliate) and check quality.",
    "wb.cta.open": "Open"
  },
  "ja": {
    "wb.badge": "ワークベンチ",
    "wb.title": "ワークベンチ",
    "wb.subtitle": "データの参照・分析・レポート作成のための作業スペースです。",
    "wb.card.book.title": "書籍ワークベンチ",
    "wb.card.book.desc": "書籍データ（検索/詳細/マーケット/アフィリエイト）を素早く探索し、品質を確認します。",
    "wb.cta.open": "開く"
  },
  "zh-Hans": {
    "wb.badge": "工作台",
    "wb.title": "工作台",
    "wb.subtitle": "用于数据查询、分析与报告制作的工作空间。",
    "wb.card.book.title": "图书工作台",
    "wb.card.book.desc": "快速浏览图书数据（搜索/详情/市场/联盟），并检查数据质量。",
    "wb.cta.open": "打开"
  },
  "zh-Hant": {
    "wb.badge": "工作台",
    "wb.title": "工作台",
    "wb.subtitle": "用於資料查詢、分析與報告製作的工作空間。",
    "wb.card.book.title": "圖書工作台",
    "wb.card.book.desc": "快速探索圖書資料（搜尋/詳情/市集/聯盟），並檢查資料品質。",
    "wb.cta.open": "開啟"
  },
  "es": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Un espacio de trabajo para consulta de datos, análisis y creación de informes.",
    "wb.card.book.title": "Workbench de libros",
    "wb.card.book.desc": "Explora rápidamente datos de libros (búsqueda/detalle/mercado/afiliados) y verifica la calidad.",
    "wb.cta.open": "Abrir"
  },
  "fr": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Un espace de travail pour la consultation des données, l’analyse et la création de rapports.",
    "wb.card.book.title": "Workbench Livres",
    "wb.card.book.desc": "Explorez rapidement les données de livres (recherche/détail/marché/affiliation) et vérifiez la qualité.",
    "wb.cta.open": "Ouvrir"
  },
  "de": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Ein Arbeitsbereich für Datenabfrage, Analyse und Report-Erstellung.",
    "wb.card.book.title": "Buch-Workbench",
    "wb.card.book.desc": "Buchdaten (Suche/Details/Markt/Affiliate) schnell erkunden und Qualität prüfen.",
    "wb.cta.open": "Öffnen"
  },
  "pt-BR": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Um espaço de trabalho para consulta de dados, análise e criação de relatórios.",
    "wb.card.book.title": "Workbench de livros",
    "wb.card.book.desc": "Explore rapidamente dados de livros (busca/detalhe/market/afiliados) e verifique a qualidade.",
    "wb.cta.open": "Abrir"
  },
  "ru": {
    "wb.badge": "Рабочая среда",
    "wb.title": "Рабочая среда",
    "wb.subtitle": "Рабочее пространство для запросов к данным, анализа и подготовки отчётов.",
    "wb.card.book.title": "Книжная рабочая среда",
    "wb.card.book.desc": "Быстро изучайте данные о книгах (поиск/детали/маркет/партнёрки) и проверяйте качество.",
    "wb.cta.open": "Открыть"
  },
  "id": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Ruang kerja untuk kueri data, analisis, dan pembuatan laporan.",
    "wb.card.book.title": "Workbench Buku",
    "wb.card.book.desc": "Jelajahi data buku (pencarian/detail/market/afiliasi) dengan cepat dan periksa kualitasnya.",
    "wb.cta.open": "Buka"
  },
  "vi": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Không gian làm việc để truy vấn dữ liệu, phân tích và tạo báo cáo.",
    "wb.card.book.title": "Workbench Sách",
    "wb.card.book.desc": "Khám phá nhanh dữ liệu sách (tìm kiếm/chi tiết/chợ/tiếp thị liên kết) và kiểm tra chất lượng.",
    "wb.cta.open": "Mở"
  },
  "th": {
    "wb.badge": "เวิร์กเบนช์",
    "wb.title": "เวิร์กเบนช์",
    "wb.subtitle": "พื้นที่ทำงานสำหรับค้นข้อมูล วิเคราะห์ และสร้างรายงาน",
    "wb.card.book.title": "เวิร์กเบนช์หนังสือ",
    "wb.card.book.desc": "สำรวจข้อมูลหนังสือ (ค้นหา/รายละเอียด/มาร์เก็ต/แอฟฟิลิเอต) อย่างรวดเร็วและตรวจสอบคุณภาพ",
    "wb.cta.open": "เปิด"
  },
  "ms": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Ruang kerja untuk pertanyaan data, analisis dan pembinaan laporan.",
    "wb.card.book.title": "Workbench Buku",
    "wb.card.book.desc": "Terokai data buku (carian/perincian/market/afiliasi) dengan pantas dan semak kualiti.",
    "wb.cta.open": "Buka"
  },
  "fil": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Isang workspace para sa pag-query ng data, pagsusuri, at paggawa ng report.",
    "wb.card.book.title": "Book Workbench",
    "wb.card.book.desc": "Mabilis na i-explore ang data ng libro (search/detail/market/affiliate) at i-check ang quality.",
    "wb.cta.open": "Buksan"
  },
  "hi": {
    "wb.badge": "वर्कबेंच",
    "wb.title": "वर्कबेंच",
    "wb.subtitle": "डेटा क्वेरी, विश्लेषण और रिपोर्ट बनाने के लिए एक कार्यक्षेत्र।",
    "wb.card.book.title": "पुस्तक वर्कबेंच",
    "wb.card.book.desc": "पुस्तक डेटा (खोज/विवरण/मार्केट/एफिलिएट) को जल्दी देखें और गुणवत्ता जाँचें।",
    "wb.cta.open": "खोलें"
  },
  "ar": {
    "wb.badge": "منضدة العمل",
    "wb.title": "منضدة العمل",
    "wb.subtitle": "مساحة عمل لاستعلام البيانات وتحليلها وإنشاء التقارير.",
    "wb.card.book.title": "منضدة عمل الكتب",
    "wb.card.book.desc": "استكشف بيانات الكتب بسرعة (بحث/تفاصيل/سوق/إحالة) وتحقق من الجودة.",
    "wb.cta.open": "فتح"
  },
  "it": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Uno spazio di lavoro per interrogare i dati, analizzare e creare report.",
    "wb.card.book.title": "Workbench Libri",
    "wb.card.book.desc": "Esplora rapidamente i dati dei libri (ricerca/dettaglio/market/affiliazione) e verifica la qualità.",
    "wb.cta.open": "Apri"
  },
  "nl": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Een werkruimte voor dataquery’s, analyse en het maken van rapporten.",
    "wb.card.book.title": "Boeken-Workbench",
    "wb.card.book.desc": "Verken snel boekgegevens (zoeken/details/market/affiliate) en controleer de kwaliteit.",
    "wb.cta.open": "Openen"
  },
  "pl": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "Przestrzeń robocza do zapytań danych, analizy i tworzenia raportów.",
    "wb.card.book.title": "Workbench książek",
    "wb.card.book.desc": "Szybko przeglądaj dane książek (wyszukiwanie/szczegóły/market/afiliacja) i sprawdzaj jakość.",
    "wb.cta.open": "Otwórz"
  },
  "sv": {
    "wb.badge": "Workbench",
    "wb.title": "Workbench",
    "wb.subtitle": "En arbetsyta för datafrågor, analys och rapportskapande.",
    "wb.card.book.title": "Bok-Workbench",
    "wb.card.book.desc": "Utforska snabbt bokdata (sök/detalj/market/affiliate) och kontrollera kvaliteten.",
    "wb.cta.open": "Öppna"
  },
  "tr": {
    "wb.badge": "Çalışma alanı",
    "wb.title": "Çalışma alanı",
    "wb.subtitle": "Veri sorgulama, analiz ve rapor oluşturma için bir çalışma alanı.",
    "wb.card.book.title": "Kitap Çalışma Alanı",
    "wb.card.book.desc": "Kitap verilerini (arama/detay/pazar/affiliate) hızlıca keşfedin ve kaliteyi kontrol edin.",
    "wb.cta.open": "Aç"
  },
  "uk": {
    "wb.badge": "Робоча область",
    "wb.title": "Робоча область",
    "wb.subtitle": "Робочий простір для запитів до даних, аналізу та створення звітів.",
    "wb.card.book.title": "Книжкова робоча область",
    "wb.card.book.desc": "Швидко переглядайте дані про книги (пошук/деталі/маркет/партнерки) та перевіряйте якість.",
    "wb.cta.open": "Відкрити"
  }
};

  const FALLBACK_ORDER = ["en", "ko"];

  function t(lang, key) {
    if (dict[lang] && dict[lang][key] != null && dict[lang][key] !== "") return dict[lang][key];
    for (const fb of FALLBACK_ORDER) {
      if (dict[fb] && dict[fb][key] != null && dict[fb][key] !== "") return dict[fb][key];
    }
    return key;
  }

  function resolveLangCode(code) {
    if (!code) return 'en';
    const c = String(code).trim();

    if (c === 'zh' || c.toLowerCase().startsWith('zh-')) {
      const lower = c.toLowerCase();
      if (lower.includes('tw') || lower.includes('hk') || lower.includes('mo') || lower.includes('hant')) return 'zh-Hant';
      return 'zh-Hans';
    }

    if (c === 'tl' || c.toLowerCase().startsWith('tl-') || c === 'fil' || c.toLowerCase().startsWith('fil-')) return 'fil';
    if (c === 'pt' || c.toLowerCase().startsWith('pt-')) return 'pt-BR';
    if (c.toLowerCase().startsWith('en-')) return 'en';
    if (c.toLowerCase().startsWith('ja-')) return 'ja';
    if (c.toLowerCase().startsWith('ko-')) return 'ko';
    return c;
  }

  function isRtl(lang) {
    return lang === 'ar' || lang === 'he';
  }

  window.sg_workbench_i18n = {
    languages,
    dict,
    t,
    resolveLangCode,
    isRtl
  };
})();
