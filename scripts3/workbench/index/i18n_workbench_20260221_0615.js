/**
 * scripts3/workbench/i18n_workbench.js
 * - Workbench i18n
 * - NOTE: Keep this file loaded before workbench main.js
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
    },
    "es": {
        "wb.badge": "Banco de trabajo",
        "wb.title": "Banco de trabajo",
        "wb.subtitle": "Un espacio para explorar datos, analizarlos y crear informes.",
        "wb.card.book.title": "Libros",
        "wb.card.book.desc": "Explora rápidamente los datos de libros y revisa su calidad.",
        "wb.cta.open": "Abrir"
    },
    "fr": {
        "wb.badge": "Atelier",
        "wb.title": "Atelier",
        "wb.subtitle": "Un espace pour explorer, analyser les données et créer des rapports.",
        "wb.card.book.title": "Livres",
        "wb.card.book.desc": "Explorez rapidement les données de livres et vérifiez la qualité.",
        "wb.cta.open": "Ouvrir"
    },
    "de": {
        "wb.badge": "Werkbank",
        "wb.title": "Werkbank",
        "wb.subtitle": "Ein Arbeitsbereich für Datenexploration, Analyse und Reporting.",
        "wb.card.book.title": "Bücher",
        "wb.card.book.desc": "Buchdaten schnell erkunden und die Qualität prüfen.",
        "wb.cta.open": "Öffnen"
    },
    "pt-BR": {
        "wb.badge": "Workbench",
        "wb.title": "Workbench",
        "wb.subtitle": "Um espaço para explorar dados, analisar e criar relatórios.",
        "wb.card.book.title": "Livros",
        "wb.card.book.desc": "Explore rapidamente os dados de livros e verifique a qualidade.",
        "wb.cta.open": "Abrir"
    },
    "ru": {
        "wb.badge": "Рабочая зона",
        "wb.title": "Рабочая зона",
        "wb.subtitle": "Пространство для изучения данных, анализа и создания отчётов.",
        "wb.card.book.title": "Книги",
        "wb.card.book.desc": "Быстро изучайте данные о книгах и проверяйте качество.",
        "wb.cta.open": "Открыть"
    },
    "id": {
        "wb.badge": "Workbench",
        "wb.title": "Workbench",
        "wb.subtitle": "Ruang kerja untuk eksplorasi data, analisis, dan pembuatan laporan.",
        "wb.card.book.title": "Buku",
        "wb.card.book.desc": "Jelajahi data buku dengan cepat dan periksa kualitasnya.",
        "wb.cta.open": "Buka"
    },
    "vi": {
        "wb.badge": "Bàn làm việc",
        "wb.title": "Bàn làm việc",
        "wb.subtitle": "Không gian để tra cứu, phân tích dữ liệu và tạo báo cáo.",
        "wb.card.book.title": "Sách",
        "wb.card.book.desc": "Khám phá nhanh dữ liệu sách và kiểm tra chất lượng.",
        "wb.cta.open": "Mở"
    },
    "th": {
        "wb.badge": "เวิร์กเบนช์",
        "wb.title": "เวิร์กเบนช์",
        "wb.subtitle": "พื้นที่ทำงานสำหรับการสำรวจ วิเคราะห์ข้อมูล และสร้างรายงาน",
        "wb.card.book.title": "หนังสือ",
        "wb.card.book.desc": "สำรวจข้อมูลหนังสืออย่างรวดเร็วและตรวจสอบคุณภาพ",
        "wb.cta.open": "เปิด"
    },
    "ms": {
        "wb.badge": "Workbench",
        "wb.title": "Workbench",
        "wb.subtitle": "Ruang kerja untuk penerokaan data, analisis dan pembinaan laporan.",
        "wb.card.book.title": "Buku",
        "wb.card.book.desc": "Teroka data buku dengan pantas dan semak kualiti.",
        "wb.cta.open": "Buka"
    },
    "fil": {
        "wb.badge": "Workbench",
        "wb.title": "Workbench",
        "wb.subtitle": "Isang workspace para sa pag-explore ng data, analysis, at paggawa ng report.",
        "wb.card.book.title": "Mga Aklat",
        "wb.card.book.desc": "Mabilis na i-explore ang book data at i-check ang quality.",
        "wb.cta.open": "Buksan"
    },
    "hi": {
        "wb.badge": "वर्कबेंच",
        "wb.title": "वर्कबेंच",
        "wb.subtitle": "डेटा खोज, विश्लेषण और रिपोर्ट बनाने के लिए एक कार्यक्षेत्र।",
        "wb.card.book.title": "किताबें",
        "wb.card.book.desc": "किताबों के डेटा को जल्दी देखें और गुणवत्ता जाँचें।",
        "wb.cta.open": "खोलें"
    },
    "ar": {
        "wb.badge": "مساحة العمل",
        "wb.title": "مساحة العمل",
        "wb.subtitle": "مساحة لاستكشاف البيانات وتحليلها وإنشاء التقارير.",
        "wb.card.book.title": "الكتب",
        "wb.card.book.desc": "استكشف بيانات الكتب بسرعة وتحقق من الجودة.",
        "wb.cta.open": "فتح"
    },
    "it": {
        "wb.badge": "Workbench",
        "wb.title": "Workbench",
        "wb.subtitle": "Uno spazio per esplorare i dati, analizzare e creare report.",
        "wb.card.book.title": "Libri",
        "wb.card.book.desc": "Esplora rapidamente i dati dei libri e controlla la qualità.",
        "wb.cta.open": "Apri"
    },
    "nl": {
        "wb.badge": "Werkbank",
        "wb.title": "Werkbank",
        "wb.subtitle": "Een werkruimte voor data-exploratie, analyse en rapportage.",
        "wb.card.book.title": "Boeken",
        "wb.card.book.desc": "Verken snel boekgegevens en controleer de kwaliteit.",
        "wb.cta.open": "Openen"
    },
    "pl": {
        "wb.badge": "Warsztat",
        "wb.title": "Warsztat",
        "wb.subtitle": "Przestrzeń do eksploracji danych, analizy i tworzenia raportów.",
        "wb.card.book.title": "Książki",
        "wb.card.book.desc": "Szybko przeglądaj dane o książkach i sprawdzaj jakość.",
        "wb.cta.open": "Otwórz"
    },
    "sv": {
        "wb.badge": "Arbetsbänk",
        "wb.title": "Arbetsbänk",
        "wb.subtitle": "En arbetsyta för datautforskning, analys och rapportering.",
        "wb.card.book.title": "Böcker",
        "wb.card.book.desc": "Utforska snabbt bokdata och kontrollera kvaliteten.",
        "wb.cta.open": "Öppna"
    },
    "tr": {
        "wb.badge": "Çalışma Tezgâhı",
        "wb.title": "Çalışma Tezgâhı",
        "wb.subtitle": "Veri keşfi, analiz ve rapor oluşturma için bir çalışma alanı.",
        "wb.card.book.title": "Kitaplar",
        "wb.card.book.desc": "Kitap verilerini hızlıca keşfedin ve kaliteyi kontrol edin.",
        "wb.cta.open": "Aç"
    },
    "uk": {
        "wb.badge": "Робоча область",
        "wb.title": "Робоча область",
        "wb.subtitle": "Простір для дослідження даних, аналізу та створення звітів.",
        "wb.card.book.title": "Книги",
        "wb.card.book.desc": "Швидко досліджуйте дані про книги та перевіряйте якість.",
        "wb.cta.open": "Відкрити"
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
