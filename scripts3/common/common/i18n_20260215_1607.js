/**
 * scripts/common/i18n.js
 * - 언어 모달 + i18n 공통
 */

function sg_init_i18n() {
// ------------------------------------------------------------
      // Language modal + i18n
      // ------------------------------------------------------------
      // - 언어 선택 버튼(데스크톱/모바일) 클릭 시 모달을 열고,
      //   선택한 언어 코드로 문구(data-i18n, placeholder)를 치환합니다.
      // - localStorage(LANG_KEY=sg_lang)에 저장하여 재방문 시 유지합니다.
      // - resolveLangCode(): 브라우저 언어/지역 코드(en-US, zh-TW 등)를
      //   내부 지원 코드 집합으로 정규화합니다.
      (() => {
        const LANG_KEY = 'sg_lang';
        const rootEl = document.documentElement;

        const languages = [
          { code: 'ko', label: '한국어' },
          { code: 'en', label: 'English' },
          { code: 'ja', label: '日本語' },
          { code: 'zh-Hans', label: '中文(简体)' },
          { code: 'zh-Hant', label: '中文(繁體)' },
          { code: 'es', label: 'Español' },
          { code: 'fr', label: 'Français' },
          { code: 'de', label: 'Deutsch' },
          { code: 'pt-BR', label: 'Português (Brasil)' },
          { code: 'ru', label: 'Русский' },
          { code: 'id', label: 'Bahasa Indonesia' },
          { code: 'vi', label: 'Tiếng Việt' },
          { code: 'th', label: 'ไทย' },
          { code: 'ms', label: 'Bahasa Melayu' },
          { code: 'fil', label: 'Filipino' },
          { code: 'hi', label: 'हिन्दी' },
          { code: 'ar', label: 'العربية' },
          { code: 'it', label: 'Italiano' },
          { code: 'nl', label: 'Nederlands' },
          { code: 'pl', label: 'Polski' },
          { code: 'sv', label: 'Svenska' },
          { code: 'tr', label: 'Türkçe' },
          { code: 'uk', label: 'Українська' }
        ];

        const i18n = {
		ko: {
			'nav.data': '데이터',
			'nav.workbench': '워크벤치',
			'nav.story': '스토리',
			'nav.academy': '아카데미',
			'nav.login': '로그인',
			'search.placeholder': '무엇을 분석하고 싶으신가요?',
			'search.trending': '인기 검색어:',
			'search.press': 'Press',
			'search.enter': 'Enter',
			'footer.about': '통계마당 소개',
			'footer.webr': 'Web-R',
			'footer.privacy': '개인정보처리방침',
			'footer.terms': '이용약관',
			'footer.company': '주식회사 통계마당',
			'footer.ceo_dpo': '대표, 개인정보보호책임자',
			'footer.ceo_name': '유재성',
			'footer.bizno': '사업자등록번호',
			'footer.ecomno': '통신판매업신고번호',
			'footer.addr': '서울특별시 강남구 테헤란로70길 12, 402-106A호',
			'footer.phone': '대표전화'
		},

		en: {
			'nav.data': 'Data',
			'nav.workbench': 'Workbench',
			'nav.story': 'Stories',
			'nav.academy': 'Academy',
			'nav.login': 'Sign in',
			'search.placeholder': 'What would you like to analyze?',
			'search.trending': 'Trending:',
			'search.press': 'Press',
			'search.enter': 'Enter',
			'footer.about': 'About',
			'footer.webr': 'Web-R',
			'footer.privacy': 'Privacy Policy',
			'footer.terms': 'Terms',
			'footer.company': 'Statistical Ground Corp.',
			'footer.ceo_dpo': 'CEO, DPO',
			'footer.ceo_name': 'Jaeseong Yoo',
			'footer.bizno': 'Business Reg. No.',
			'footer.ecomno': 'E-commerce Reg. No.',
			'footer.addr': '12, Teheran-ro 70-gil, Gangnam-gu, Seoul, 402-106A',
			'footer.phone': 'Phone'
		},

		ja: {
			'nav.data': 'データ',
			'nav.workbench': 'ワークベンチ',
			'nav.story': 'ストーリー',
			'nav.academy': 'アカデミー',
			'nav.login': 'ログイン',
			'search.placeholder': '何を分析しますか？',
			'search.trending': '人気:',
			'search.press': 'Press',
			'search.enter': 'Enter',
			'footer.about': '紹介',
			'footer.webr': 'Web-R',
			'footer.privacy': 'プライバシー',
			'footer.terms': '利用規約',
			'footer.company': 'Statistical Ground Corp.',
			'footer.ceo_dpo': '代表・個人情報保護責任者',
			'footer.ceo_name': 'ユ・ジェソン',
			'footer.bizno': '事業者登録番号',
			'footer.ecomno': '通信販売業登録番号',
			'footer.addr': 'ソウル特別市 江南区 テヘラン路70ギル12, 402-106A',
			'footer.phone': '代表電話'
		},

		'zh-Hans': {
			'nav.data': '数据',
			'nav.workbench': '工作台',
			'nav.story': '故事',
			'nav.academy': '学院',
			'nav.login': '登录',
			'search.placeholder': '你想分析什么？',
			'search.trending': '热门：',
			'search.press': '按',
			'search.enter': '回车',
			'footer.about': '关于',
			'footer.webr': 'Web-R',
			'footer.privacy': '隐私政策',
			'footer.terms': '使用条款',
			'footer.company': 'Statistical Ground Corp.',
			'footer.ceo_dpo': '代表 / 数据保护负责人',
			'footer.ceo_name': 'Jaeseong Yoo',
			'footer.bizno': '营业执照号',
			'footer.ecomno': '电商备案号',
			'footer.addr': '韩国首尔市 江南区 Teheran-ro 70-gil 12, 402-106A',
			'footer.phone': '联系电话'
		},
		
		'zh-Hant': {
		  'nav.data': '資料',
		  'nav.workbench': '工作台',
		  'nav.story': '故事',
		  'nav.academy': '學院',
		  'nav.login': '登入',
		  'search.placeholder': '你想分析什麼？',
		  'search.trending': '熱門：',
		  'search.press': '按',
		  'search.enter': 'Enter',
		  'footer.about': '關於',
		  'footer.webr': 'Web-R',
		  'footer.privacy': '隱私政策',
		  'footer.terms': '使用條款',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': '代表 / 資料保護負責人',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': '營業登記號',
		  'footer.ecomno': '電商登記號',
		  'footer.addr': '韓國首爾市 江南區 Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': '聯絡電話'
		},

		es: {
		  'nav.data': 'Datos',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Historias',
		  'nav.academy': 'Academia',
		  'nav.login': 'Iniciar sesión',
		  'search.placeholder': '¿Qué quieres analizar?',
		  'search.trending': 'Tendencias:',
		  'search.press': 'Pulsa',
		  'search.enter': 'Enter',
		  'footer.about': 'Acerca de',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Privacidad',
		  'footer.terms': 'Términos',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'Nº registro',
		  'footer.ecomno': 'Nº comercio',
		  'footer.addr': 'Seúl, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Tel.'
		},

		fr: {
		  'nav.data': 'Données',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Histoires',
		  'nav.academy': 'Académie',
		  'nav.login': 'Connexion',
		  'search.placeholder': 'Que voulez-vous analyser ?',
		  'search.trending': 'Tendances :',
		  'search.press': 'Appuyez sur',
		  'search.enter': 'Entrée',
		  'footer.about': 'À propos',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Confidentialité',
		  'footer.terms': 'Conditions',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'PDG, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'N° immatriculation',
		  'footer.ecomno': 'N° e-commerce',
		  'footer.addr': 'Séoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Téléphone'
		},

		de: {
		  'nav.data': 'Daten',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Stories',
		  'nav.academy': 'Akademie',
		  'nav.login': 'Anmelden',
		  'search.placeholder': 'Was möchten Sie analysieren?',
		  'search.trending': 'Trends:',
		  'search.press': 'Drücken Sie',
		  'search.enter': 'Enter',
		  'footer.about': 'Über uns',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Datenschutz',
		  'footer.terms': 'AGB',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DSB',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'Reg.-Nr.',
		  'footer.ecomno': 'E-Commerce-Nr.',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Tel.'
		},

		'pt-BR': {
		  'nav.data': 'Dados',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Histórias',
		  'nav.academy': 'Academia',
		  'nav.login': 'Entrar',
		  'search.placeholder': 'O que você quer analisar?',
		  'search.trending': 'Em alta:',
		  'search.press': 'Pressione',
		  'search.enter': 'Enter',
		  'footer.about': 'Sobre',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Privacidade',
		  'footer.terms': 'Termos',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'CNPJ/Reg.',
		  'footer.ecomno': 'Reg. e-commerce',
		  'footer.addr': 'Seul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Telefone'
		},

		ru: {
		  'nav.data': 'Данные',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Истории',
		  'nav.academy': 'Академия',
		  'nav.login': 'Войти',
		  'search.placeholder': 'Что вы хотите проанализировать?',
		  'search.trending': 'Тренды:',
		  'search.press': 'Нажмите',
		  'search.enter': 'Enter',
		  'footer.about': 'О нас',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Конфиденц.',
		  'footer.terms': 'Условия',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'Рег. №',
		  'footer.ecomno': 'E-com №',
		  'footer.addr': 'Сеул, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Тел.'
		},

		id: {
		  'nav.data': 'Data',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Cerita',
		  'nav.academy': 'Akademi',
		  'nav.login': 'Masuk',
		  'search.placeholder': 'Apa yang ingin Anda analisis?',
		  'search.trending': 'Tren:',
		  'search.press': 'Tekan',
		  'search.enter': 'Enter',
		  'footer.about': 'Tentang',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Privasi',
		  'footer.terms': 'Ketentuan',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'No. usaha',
		  'footer.ecomno': 'No. e-commerce',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Telepon'
		},

		vi: {
		  'nav.data': 'Dữ liệu',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Câu chuyện',
		  'nav.academy': 'Học viện',
		  'nav.login': 'Đăng nhập',
		  'search.placeholder': 'Bạn muốn phân tích gì?',
		  'search.trending': 'Xu hướng:',
		  'search.press': 'Nhấn',
		  'search.enter': 'Enter',
		  'footer.about': 'Giới thiệu',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Quyền riêng tư',
		  'footer.terms': 'Điều khoản',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'Mã ĐKKD',
		  'footer.ecomno': 'Mã TMĐT',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Điện thoại'
		},

		th: {
		  'nav.data': 'ข้อมูล',
		  'nav.workbench': 'เวิร์กเบนช์',
		  'nav.story': 'เรื่องราว',
		  'nav.academy': 'สถาบัน',
		  'nav.login': 'เข้าสู่ระบบ',
		  'search.placeholder': 'ต้องการวิเคราะห์อะไร?',
		  'search.trending': 'กำลังมาแรง:',
		  'search.press': 'กด',
		  'search.enter': 'Enter',
		  'footer.about': 'เกี่ยวกับ',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'ความเป็นส่วนตัว',
		  'footer.terms': 'ข้อกำหนด',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'เลขทะเบียน',
		  'footer.ecomno': 'เลขอีคอมเมิร์ซ',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'โทร.'
		},

		ms: {
		  'nav.data': 'Data',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Cerita',
		  'nav.academy': 'Akademi',
		  'nav.login': 'Log masuk',
		  'search.placeholder': 'Apa yang anda mahu analisis?',
		  'search.trending': 'Trending:',
		  'search.press': 'Tekan',
		  'search.enter': 'Enter',
		  'footer.about': 'Mengenai',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Privasi',
		  'footer.terms': 'Terma',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'No. daftar',
		  'footer.ecomno': 'No. e-dagang',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Telefon'
		},

		fil: {
		  'nav.data': 'Data',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Kuwento',
		  'nav.academy': 'Akademya',
		  'nav.login': 'Mag-sign in',
		  'search.placeholder': 'Ano ang gusto mong suriin?',
		  'search.trending': 'Trending:',
		  'search.press': 'Pindutin',
		  'search.enter': 'Enter',
		  'footer.about': 'Tungkol',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Privacy',
		  'footer.terms': 'Terms',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'Reg. No.',
		  'footer.ecomno': 'E-com No.',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Telepono'
		},

		hi: {
		  'nav.data': 'डेटा',
		  'nav.workbench': 'वर्कबेंच',
		  'nav.story': 'कहानियाँ',
		  'nav.academy': 'अकादमी',
		  'nav.login': 'लॉग इन',
		  'search.placeholder': 'आप क्या विश्लेषण करना चाहते हैं?',
		  'search.trending': 'ट्रेंडिंग:',
		  'search.press': 'दबाएँ',
		  'search.enter': 'Enter',
		  'footer.about': 'परिचय',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'गोपनीयता',
		  'footer.terms': 'शर्तें',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'पंजीकरण',
		  'footer.ecomno': 'ई-कॉम पंजीकरण',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'फ़ोन'
		},

		ar: {
		  'nav.data': 'البيانات',
		  'nav.workbench': 'منضدة العمل',
		  'nav.story': 'قصص',
		  'nav.academy': 'الأكاديمية',
		  'nav.login': 'تسجيل الدخول',
		  'search.placeholder': 'ماذا تريد أن تحلل؟',
		  'search.trending': 'الشائع:',
		  'search.press': 'اضغط',
		  'search.enter': 'Enter',
		  'footer.about': 'حول',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'الخصوصية',
		  'footer.terms': 'الشروط',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'المدير، مسؤول الخصوصية',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'رقم السجل',
		  'footer.ecomno': 'رقم التجارة الإلكترونية',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'الهاتف'
		},

		it: {
		  'nav.data': 'Dati',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Storie',
		  'nav.academy': 'Accademia',
		  'nav.login': 'Accedi',
		  'search.placeholder': 'Cosa vuoi analizzare?',
		  'search.trending': 'Di tendenza:',
		  'search.press': 'Premi',
		  'search.enter': 'Invio',
		  'footer.about': 'Chi siamo',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Privacy',
		  'footer.terms': 'Termini',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'N. registrazione',
		  'footer.ecomno': 'N. e-commerce',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Telefono'
		},

		nl: {
		  'nav.data': 'Data',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Verhalen',
		  'nav.academy': 'Academie',
		  'nav.login': 'Inloggen',
		  'search.placeholder': 'Wat wil je analyseren?',
		  'search.trending': 'Trending:',
		  'search.press': 'Druk op',
		  'search.enter': 'Enter',
		  'footer.about': 'Over',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Privacy',
		  'footer.terms': 'Voorwaarden',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, FG',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'Registratienr.',
		  'footer.ecomno': 'E-com nr.',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Telefoon'
		},

		pl: {
		  'nav.data': 'Dane',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Historie',
		  'nav.academy': 'Akademia',
		  'nav.login': 'Zaloguj się',
		  'search.placeholder': 'Co chcesz przeanalizować?',
		  'search.trending': 'Trendy:',
		  'search.press': 'Naciśnij',
		  'search.enter': 'Enter',
		  'footer.about': 'O nas',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Prywatność',
		  'footer.terms': 'Warunki',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'CEO, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'Nr rejestru',
		  'footer.ecomno': 'Nr e-commerce',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Telefon'
		},

		sv: {
		  'nav.data': 'Data',
		  'nav.workbench': 'Workbench',
		  'nav.story': 'Berättelser',
		  'nav.academy': 'Akademi',
		  'nav.login': 'Logga in',
		  'search.placeholder': 'Vad vill du analysera?',
		  'search.trending': 'Trendigt:',
		  'search.press': 'Tryck',
		  'search.enter': 'Enter',
		  'footer.about': 'Om',
		  'footer.webr': 'Web-R',
		  'footer.privacy': 'Integritet',
		  'footer.terms': 'Villkor',
		  'footer.company': 'Statistical Ground Corp.',
		  'footer.ceo_dpo': 'VD, DPO',
		  'footer.ceo_name': 'Jaeseong Yoo',
		  'footer.bizno': 'Reg.nr',
		  'footer.ecomno': 'E-com nr',
		  'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
		  'footer.phone': 'Telefon'
		},

		tr: {
			'nav.data': 'Veri',
			'nav.workbench': 'Çalışma alanı',
			'nav.story': 'Hikâyeler',
			'nav.academy': 'Akademi',
			'nav.login': 'Giriş yap',
			'search.placeholder': 'Neyi analiz etmek istersiniz?',
			'search.trending': 'Trendler:',
			'search.press': 'Basın',
			'search.enter': 'Enter',
			'footer.about': 'Hakkında',
			'footer.webr': 'Web-R',
			'footer.privacy': 'Gizlilik',
			'footer.terms': 'Şartlar',
			'footer.company': 'Statistical Ground Corp.',
			'footer.ceo_dpo': 'CEO, DPO',
			'footer.ceo_name': 'Jaeseong Yoo',
			'footer.bizno': 'Kayıt No',
			'footer.ecomno': 'E-ticaret No',
			'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
			'footer.phone': 'Telefon'
		},

		uk: {
			'nav.data': 'Дані',
			'nav.workbench': 'Workbench',
			'nav.story': 'Історії',
			'nav.academy': 'Академія',
			'nav.login': 'Увійти',
			'search.placeholder': 'Що ви хочете проаналізувати?',
			'search.trending': 'У тренді:',
			'search.press': 'Натисніть',
			'search.enter': 'Enter',
			'footer.about': 'Про нас',
			'footer.webr': 'Web-R',
			'footer.privacy': 'Конфіденційність',
			'footer.terms': 'Умови',
			'footer.company': 'Statistical Ground Corp.',
			'footer.ceo_dpo': 'CEO, DPO',
			'footer.ceo_name': 'Jaeseong Yoo',
			'footer.bizno': 'Реєстр №',
			'footer.ecomno': 'E-com №',
			'footer.addr': 'Seoul, Gangnam-gu, Teheran-ro 70-gil 12, 402-106A',
			'footer.phone': 'Тел.'
		}
    };

        const UI_I18N_KEYS = [
          'nav.data','nav.workbench','nav.story','nav.academy','nav.login',
          'search.placeholder','search.trending','search.press','search.enter',
          'footer.about','footer.about','footer.privacy','footer.terms',
          'footer.company','footer.ceo_dpo','footer.ceo_name',
          'footer.bizno','footer.ecomno','footer.addr','footer.phone'
        ];

        function t(lang, key) {
          return (i18n[lang] && i18n[lang][key]) ||
                (i18n['en'] && i18n['en'][key]) ||
                (i18n['ko'] && i18n['ko'][key]) ||
                key;
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

        function normalizeI18nCoverage() {
          const en = i18n['en'] || {};
          const ko = i18n['ko'] || {};
          languages.forEach(l => {
            if (!i18n[l.code]) i18n[l.code] = {};
            UI_I18N_KEYS.forEach(k => {
              if (i18n[l.code][k] == null || i18n[l.code][k] === '') {
                i18n[l.code][k] = en[k] ?? ko[k] ?? k;
              }
            });
          });
        }

        function applyLang(lang) {
          const rtl = (lang === 'ar' || lang === 'he');
          rootEl.setAttribute('lang', lang);
          rootEl.setAttribute('dir', rtl ? 'rtl' : 'ltr');

          document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(lang, key);
          });

          document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', t(lang, key));
          });

          const ecom = document.getElementById('footer-ecomno');
          if (ecom) ecom.style.display = (lang === 'ko') ? '' : 'none';

          const phoneNum = document.getElementById('footer-phone-number');
          if (phoneNum) phoneNum.textContent = (lang === 'ko') ? '0507-1300-9704' : '82) 0507-1300-9704';

          if (lang === 'ko') {
            const companyEl = document.querySelector('[data-i18n="footer.company"]');
            const ceoEl = document.querySelector('[data-i18n="footer.ceo_name"]');
            if (companyEl) companyEl.textContent = '주식회사 통계마당';
            if (ceoEl) ceoEl.textContent = '유재성';
          }
        }

        function buildModalList(containerEl, currentLang) {
          if (!containerEl) return;
          containerEl.innerHTML = languages.map(l => {
            const active = l.code === currentLang;
            return `
              <button class="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                      data-lang="${l.code}">
                <div>
                  <div class="font-semibold">${l.label}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${l.code}</div>
                </div>
                <svg class="w-5 h-5 ${active ? '' : 'opacity-0'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-width="2" d="M20 6L9 17l-5-5"></path>
                </svg>
              </button>
            `;
          }).join('');
        }

        const modal = document.getElementById('lang-modal');
        const modalList = document.getElementById('lang-modal-list');
        const modalClose = document.getElementById('lang-modal-close');
        const modalBackdrop = document.getElementById('lang-modal-backdrop');

        const toggle = document.getElementById('lang-toggle');
        const mToggle = document.getElementById('mobile-lang-toggle');

        function openLangModal() {
          if (!modal) return;
          const current = localStorage.getItem(LANG_KEY) || (rootEl.getAttribute('lang') || 'en');
          buildModalList(modalList, resolveLangCode(current));
          modal.classList.remove('hidden');
        }

        function closeLangModal() {
          if (!modal) return;
          modal.classList.add('hidden');
        }

        if (toggle) toggle.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openLangModal(); });
        if (mToggle) mToggle.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openLangModal(); });

        if (modalClose) modalClose.addEventListener('click', closeLangModal);
        if (modalBackdrop) modalBackdrop.addEventListener('click', closeLangModal);

        if (modalList) {
          modalList.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-lang]');
            if (!btn) return;
            const lang = resolveLangCode(btn.getAttribute('data-lang'));
            localStorage.setItem(LANG_KEY, lang);
            applyLang(lang);
            closeLangModal();
          });
        }

        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLangModal(); });

        normalizeI18nCoverage();
        const saved = localStorage.getItem(LANG_KEY);
        const browser = (navigator.language || 'en');
        const initial = resolveLangCode(saved || browser);

        const best =
          languages.find(l => l.code === initial) ||
          languages.find(l => initial.startsWith(l.code)) ||
          languages.find(l => l.code.startsWith(initial.split('-')[0])) ||
          languages[0];

        applyLang(best.code);
      })();
}
