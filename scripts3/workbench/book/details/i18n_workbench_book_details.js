/**
 * scripts3/workbench/book/details/i18n_workbench_book_details.js
 * - Adds/overrides book-detail specific UI translations for ALL supported languages.
 * - Requires i18n_workbench.js to be loaded first (window.sg_workbench_i18n).
 */
(function () {
  const base = window.sg_workbench_i18n;
  if (!base || !base.dict || !base.languages) {
    window.sg_workbench_i18n_book_details = { t: function (_lang, key) { return key; } };
    return;
  }

  function mergeLangDict(langCode, patch) {
    if (!base.dict[langCode]) base.dict[langCode] = {};
    for (const k in patch) base.dict[langCode][k] = patch[k];
  }

  function t(lang, key) {
    const L = base.resolveLangCode ? base.resolveLangCode(lang) : lang;
    const d = base.dict[L] || {};
    return d[key] || key;
  }

  // ---------- ko ----------
  mergeLangDict("ko", {
    "wb.book.details.back": "검색으로 돌아가기",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "저자",
    "wb.book.details.publisher": "출판사",
    "wb.book.details.pubdate": "출간일",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "마켓플레이스",
    "wb.book.details.open": "바로가기",
    "wb.book.details.desc": "소개",
    "wb.book.details.not_found": "도서 정보를 찾지 못했습니다.",
    "wb.book.details.not_found_isbn": "도서 정보를 찾지 못했습니다. (isbn={isbn})",
    "wb.book.details.loading": "불러오는 중...",
    "wb.book.details.err": "오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
  });

  // ---------- en ----------
  mergeLangDict("en", {
    "wb.book.details.back": "Back to search",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Author",
    "wb.book.details.publisher": "Publisher",
    "wb.book.details.pubdate": "Published",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Open",
    "wb.book.details.desc": "Description",
    "wb.book.details.not_found": "Book details not found.",
    "wb.book.details.not_found_isbn": "Book details not found. (isbn={isbn})",
    "wb.book.details.loading": "Loading...",
    "wb.book.details.err": "Something went wrong. Please try again."
  });

  // ---------- ja ----------
  mergeLangDict("ja", {
    "wb.book.details.back": "検索に戻る",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "著者",
    "wb.book.details.publisher": "出版社",
    "wb.book.details.pubdate": "刊行日",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "マーケットプレイス",
    "wb.book.details.open": "開く",
    "wb.book.details.desc": "紹介",
    "wb.book.details.not_found": "書籍情報が見つかりません。",
    "wb.book.details.not_found_isbn": "書籍情報が見つかりません。(isbn={isbn})",
    "wb.book.details.loading": "読み込み中...",
    "wb.book.details.err": "エラーが発生しました。後でもう一度お試しください。"
  });

  // ---------- zh-Hans ----------
  mergeLangDict("zh-Hans", {
    "wb.book.details.back": "返回搜索",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "作者",
    "wb.book.details.publisher": "出版社",
    "wb.book.details.pubdate": "出版日期",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "电商平台",
    "wb.book.details.open": "打开",
    "wb.book.details.desc": "简介",
    "wb.book.details.not_found": "未找到图书信息。",
    "wb.book.details.not_found_isbn": "未找到图书信息。(isbn={isbn})",
    "wb.book.details.loading": "加载中…",
    "wb.book.details.err": "发生错误，请稍后重试。"
  });

  // ---------- zh-Hant ----------
  mergeLangDict("zh-Hant", {
    "wb.book.details.back": "返回搜尋",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "作者",
    "wb.book.details.publisher": "出版社",
    "wb.book.details.pubdate": "出版日期",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "平台",
    "wb.book.details.open": "開啟",
    "wb.book.details.desc": "簡介",
    "wb.book.details.not_found": "找不到圖書資訊。",
    "wb.book.details.not_found_isbn": "找不到圖書資訊。(isbn={isbn})",
    "wb.book.details.loading": "載入中…",
    "wb.book.details.err": "發生錯誤，請稍後再試。"
  });

  // ---------- es ----------
  mergeLangDict("es", {
    "wb.book.details.back": "Volver a la búsqueda",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Autor",
    "wb.book.details.publisher": "Editorial",
    "wb.book.details.pubdate": "Fecha de publicación",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Abrir",
    "wb.book.details.desc": "Descripción",
    "wb.book.details.not_found": "No se encontró la información del libro.",
    "wb.book.details.not_found_isbn": "No se encontró la información del libro. (isbn={isbn})",
    "wb.book.details.loading": "Cargando...",
    "wb.book.details.err": "Ocurrió un error. Inténtalo de nuevo."
  });

  // ---------- fr ----------
  mergeLangDict("fr", {
    "wb.book.details.back": "Retour à la recherche",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Auteur",
    "wb.book.details.publisher": "Éditeur",
    "wb.book.details.pubdate": "Date de publication",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Ouvrir",
    "wb.book.details.desc": "Description",
    "wb.book.details.not_found": "Informations du livre introuvables.",
    "wb.book.details.not_found_isbn": "Informations du livre introuvables. (isbn={isbn})",
    "wb.book.details.loading": "Chargement…",
    "wb.book.details.err": "Une erreur s’est produite. Veuillez réessayer."
  });

  // ---------- de ----------
  mergeLangDict("de", {
    "wb.book.details.back": "Zurück zur Suche",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Autor",
    "wb.book.details.publisher": "Verlag",
    "wb.book.details.pubdate": "Erscheinungsdatum",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Öffnen",
    "wb.book.details.desc": "Beschreibung",
    "wb.book.details.not_found": "Buchdetails nicht gefunden.",
    "wb.book.details.not_found_isbn": "Buchdetails nicht gefunden. (isbn={isbn})",
    "wb.book.details.loading": "Wird geladen...",
    "wb.book.details.err": "Ein Fehler ist aufgetreten. Bitte erneut versuchen."
  });

  // ---------- pt-BR ----------
  mergeLangDict("pt-BR", {
    "wb.book.details.back": "Voltar para a busca",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Autor",
    "wb.book.details.publisher": "Editora",
    "wb.book.details.pubdate": "Data de publicação",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Abrir",
    "wb.book.details.desc": "Descrição",
    "wb.book.details.not_found": "Detalhes do livro não encontrados.",
    "wb.book.details.not_found_isbn": "Detalhes do livro não encontrados. (isbn={isbn})",
    "wb.book.details.loading": "Carregando...",
    "wb.book.details.err": "Ocorreu um erro. Tente novamente."
  });

  // ---------- ru ----------
  mergeLangDict("ru", {
    "wb.book.details.back": "Назад к поиску",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Автор",
    "wb.book.details.publisher": "Издательство",
    "wb.book.details.pubdate": "Дата публикации",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Маркетплейс",
    "wb.book.details.open": "Открыть",
    "wb.book.details.desc": "Описание",
    "wb.book.details.not_found": "Сведения о книге не найдены.",
    "wb.book.details.not_found_isbn": "Сведения о книге не найдены. (isbn={isbn})",
    "wb.book.details.loading": "Загрузка...",
    "wb.book.details.err": "Произошла ошибка. Повторите попытку."
  });

  // ---------- id ----------
  mergeLangDict("id", {
    "wb.book.details.back": "Kembali ke pencarian",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Penulis",
    "wb.book.details.publisher": "Penerbit",
    "wb.book.details.pubdate": "Tanggal terbit",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Buka",
    "wb.book.details.desc": "Deskripsi",
    "wb.book.details.not_found": "Detail buku tidak ditemukan.",
    "wb.book.details.not_found_isbn": "Detail buku tidak ditemukan. (isbn={isbn})",
    "wb.book.details.loading": "Memuat...",
    "wb.book.details.err": "Terjadi kesalahan. Silakan coba lagi."
  });

  // ---------- vi ----------
  mergeLangDict("vi", {
    "wb.book.details.back": "Quay lại tìm kiếm",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Tác giả",
    "wb.book.details.publisher": "Nhà xuất bản",
    "wb.book.details.pubdate": "Ngày xuất bản",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Mở",
    "wb.book.details.desc": "Giới thiệu",
    "wb.book.details.not_found": "Không tìm thấy thông tin sách.",
    "wb.book.details.not_found_isbn": "Không tìm thấy thông tin sách. (isbn={isbn})",
    "wb.book.details.loading": "Đang tải...",
    "wb.book.details.err": "Đã xảy ra lỗi. Vui lòng thử lại."
  });

  // ---------- th ----------
  mergeLangDict("th", {
    "wb.book.details.back": "กลับไปที่การค้นหา",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "ผู้เขียน",
    "wb.book.details.publisher": "สำนักพิมพ์",
    "wb.book.details.pubdate": "วันที่พิมพ์",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "เปิด",
    "wb.book.details.desc": "รายละเอียด",
    "wb.book.details.not_found": "ไม่พบข้อมูลหนังสือ",
    "wb.book.details.not_found_isbn": "ไม่พบข้อมูลหนังสือ (isbn={isbn})",
    "wb.book.details.loading": "กำลังโหลด...",
    "wb.book.details.err": "เกิดข้อผิดพลาด กรุณาลองใหม่"
  });

  // ---------- ms ----------
  mergeLangDict("ms", {
    "wb.book.details.back": "Kembali ke carian",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Pengarang",
    "wb.book.details.publisher": "Penerbit",
    "wb.book.details.pubdate": "Tarikh terbit",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Buka",
    "wb.book.details.desc": "Penerangan",
    "wb.book.details.not_found": "Butiran buku tidak ditemui.",
    "wb.book.details.not_found_isbn": "Butiran buku tidak ditemui. (isbn={isbn})",
    "wb.book.details.loading": "Memuatkan...",
    "wb.book.details.err": "Ralat berlaku. Sila cuba lagi."
  });

  // ---------- fil ----------
  mergeLangDict("fil", {
    "wb.book.details.back": "Bumalik sa search",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "May-akda",
    "wb.book.details.publisher": "Publisher",
    "wb.book.details.pubdate": "Petsa ng paglabas",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Buksan",
    "wb.book.details.desc": "Paglalarawan",
    "wb.book.details.not_found": "Hindi nakita ang detalye ng libro.",
    "wb.book.details.not_found_isbn": "Hindi nakita ang detalye ng libro. (isbn={isbn})",
    "wb.book.details.loading": "Naglo-load...",
    "wb.book.details.err": "May error. Pakisubukang muli."
  });

  // ---------- hi ----------
  mergeLangDict("hi", {
    "wb.book.details.back": "खोज पर वापस जाएँ",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "लेखक",
    "wb.book.details.publisher": "प्रकाशक",
    "wb.book.details.pubdate": "प्रकाशन तिथि",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "मार्केटप्लेस",
    "wb.book.details.open": "खोलें",
    "wb.book.details.desc": "विवरण",
    "wb.book.details.not_found": "पुस्तक विवरण नहीं मिला।",
    "wb.book.details.not_found_isbn": "पुस्तक विवरण नहीं मिला। (isbn={isbn})",
    "wb.book.details.loading": "लोड हो रहा है...",
    "wb.book.details.err": "त्रुटि हुई। कृपया फिर से प्रयास करें।"
  });

  // ---------- ar ----------
  mergeLangDict("ar", {
    "wb.book.details.back": "العودة إلى البحث",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "المؤلف",
    "wb.book.details.publisher": "الناشر",
    "wb.book.details.pubdate": "تاريخ النشر",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "المتجر",
    "wb.book.details.open": "فتح",
    "wb.book.details.desc": "الوصف",
    "wb.book.details.not_found": "لم يتم العثور على تفاصيل الكتاب.",
    "wb.book.details.not_found_isbn": "لم يتم العثور على تفاصيل الكتاب. (isbn={isbn})",
    "wb.book.details.loading": "جارٍ التحميل...",
    "wb.book.details.err": "حدث خطأ. حاول مرة أخرى."
  });

  // ---------- it ----------
  mergeLangDict("it", {
    "wb.book.details.back": "Torna alla ricerca",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Autore",
    "wb.book.details.publisher": "Editore",
    "wb.book.details.pubdate": "Data di pubblicazione",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Apri",
    "wb.book.details.desc": "Descrizione",
    "wb.book.details.not_found": "Dettagli del libro non trovati.",
    "wb.book.details.not_found_isbn": "Dettagli del libro non trovati. (isbn={isbn})",
    "wb.book.details.loading": "Caricamento...",
    "wb.book.details.err": "Si è verificato un errore. Riprova."
  });

  // ---------- nl ----------
  mergeLangDict("nl", {
    "wb.book.details.back": "Terug naar zoeken",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Auteur",
    "wb.book.details.publisher": "Uitgever",
    "wb.book.details.pubdate": "Publicatiedatum",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Openen",
    "wb.book.details.desc": "Beschrijving",
    "wb.book.details.not_found": "Boekdetails niet gevonden.",
    "wb.book.details.not_found_isbn": "Boekdetails niet gevonden. (isbn={isbn})",
    "wb.book.details.loading": "Laden...",
    "wb.book.details.err": "Er is een fout opgetreden. Probeer het opnieuw."
  });

  // ---------- pl ----------
  mergeLangDict("pl", {
    "wb.book.details.back": "Wróć do wyszukiwania",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Autor",
    "wb.book.details.publisher": "Wydawca",
    "wb.book.details.pubdate": "Data publikacji",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Otwórz",
    "wb.book.details.desc": "Opis",
    "wb.book.details.not_found": "Nie znaleziono szczegółów książki.",
    "wb.book.details.not_found_isbn": "Nie znaleziono szczegółów książki. (isbn={isbn})",
    "wb.book.details.loading": "Ładowanie...",
    "wb.book.details.err": "Wystąpił błąd. Spróbuj ponownie."
  });

  // ---------- sv ----------
  mergeLangDict("sv", {
    "wb.book.details.back": "Tillbaka till sök",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Författare",
    "wb.book.details.publisher": "Förlag",
    "wb.book.details.pubdate": "Utgivningsdatum",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Öppna",
    "wb.book.details.desc": "Beskrivning",
    "wb.book.details.not_found": "Bokdetaljer hittades inte.",
    "wb.book.details.not_found_isbn": "Bokdetaljer hittades inte. (isbn={isbn})",
    "wb.book.details.loading": "Laddar...",
    "wb.book.details.err": "Ett fel uppstod. Försök igen."
  });

  // ---------- tr ----------
  mergeLangDict("tr", {
    "wb.book.details.back": "Aramaya geri dön",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Yazar",
    "wb.book.details.publisher": "Yayınevi",
    "wb.book.details.pubdate": "Yayın tarihi",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Marketplace",
    "wb.book.details.open": "Aç",
    "wb.book.details.desc": "Açıklama",
    "wb.book.details.not_found": "Kitap detayları bulunamadı.",
    "wb.book.details.not_found_isbn": "Kitap detayları bulunamadı. (isbn={isbn})",
    "wb.book.details.loading": "Yükleniyor...",
    "wb.book.details.err": "Bir hata oluştu. Lütfen tekrar deneyin."
  });

  // ---------- uk ----------
  mergeLangDict("uk", {
    "wb.book.details.back": "Повернутися до пошуку",
    "wb.book.details.source": "ClickHouse: statground_book.raw_naver",
    "wb.book.details.author": "Автор",
    "wb.book.details.publisher": "Видавництво",
    "wb.book.details.pubdate": "Дата публікації",
    "wb.book.details.isbn": "ISBN",
    "wb.book.details.marketplace": "Маркетплейс",
    "wb.book.details.open": "Відкрити",
    "wb.book.details.desc": "Опис",
    "wb.book.details.not_found": "Дані про книгу не знайдено.",
    "wb.book.details.not_found_isbn": "Дані про книгу не знайдено. (isbn={isbn})",
    "wb.book.details.loading": "Завантаження...",
    "wb.book.details.err": "Сталася помилка. Спробуйте ще раз."
  });

  window.sg_workbench_i18n_book_details = { t };
})();
