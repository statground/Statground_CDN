/**
 * scripts/common/header.js
 * - Statground Go header/menu HTML injection and interaction wiring.
 */
(function () {
  const LOGO_URL = "https://cdn.jsdelivr.net/gh/statground/Common_CDN@61734f918460833a5e9d2ebca77b6a3f2fa8fc98/images/logo/logo_reg.png";
  const FLAG_CDN_BASE = "https://cdn.jsdelivr.net/npm/circle-flags@1.0.0/flags/";
  const LANG_META = {
    ko: { label: "한국어", country: "kr" },
    en: { label: "English", country: "us" },
    ja: { label: "日本語", country: "jp" },
    "zh-Hans": { label: "中文(简体)", country: "cn" },
    "zh-Hant": { label: "中文(繁體)", country: "tw" },
    es: { label: "Español", country: "es" },
    fr: { label: "Français", country: "fr" },
    de: { label: "Deutsch", country: "de" },
    "pt-BR": { label: "Português", country: "br" },
    ru: { label: "Русский", country: "ru" },
    id: { label: "Bahasa Indonesia", country: "id" },
    vi: { label: "Tiếng Việt", country: "vn" },
    th: { label: "ไทย", country: "th" },
    ms: { label: "Bahasa Melayu", country: "my" },
    fil: { label: "Filipino", country: "ph" },
    hi: { label: "हिन्दी", country: "in" },
    ar: { label: "العربية", country: "sa" },
    it: { label: "Italiano", country: "it" },
    nl: { label: "Nederlands", country: "nl" },
    pl: { label: "Polski", country: "pl" },
    sv: { label: "Svenska", country: "se" },
    tr: { label: "Türkçe", country: "tr" },
    uk: { label: "Українська", country: "ua" }
  };

  function statgroundCDNBase() {
    const scriptURL = typeof document !== "undefined" && document.currentScript && document.currentScript.src ? document.currentScript.src : "";
    const match = scriptURL.match(/gh\/statground\/Statground_CDN@([^/,]+)\//);
    if (match) return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN@" + match[1] + "/";
    return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/";
  }

  const STATGROUND_CDN = statgroundCDNBase();
  const SOCIAL_LINKS = [
    ["Facebook Group", "https://www.facebook.com/groups/statground", "facebook-group"],
    ["Facebook Page", "https://www.facebook.com/Statground", "facebook-page"],
    ["Twitter", "https://twitter.com/Statground1", "x"],
    ["Instagram", "https://www.instagram.com/statground/", "instagram"],
    ["LinkedIn", "https://www.linkedin.com/company/82371650/", "linkedin"],
    ["Threads", "https://www.threads.net/@statground", "threads"]
  ];

  const LABELS = {
    ko: {
      home: "홈",
      data: "데이터",
      dataHub: "데이터 허브",
      bookData: "도서 데이터",
      workbench: "워크벤치",
      workbenchHub: "워크벤치 홈",
      bookWorkbench: "도서 워크벤치",
      lectureWorkbench: "강의 워크벤치",
      shoppingInsight: "Shopping Price Insight",
      intro: "소개",
      companyIntro: "통계마당 소개",
      terms: "서비스 이용약관",
      privacy: "개인정보 처리방침",
      webR: "Web-R",
      account: "계정",
      login: "로그인",
      signup: "회원 가입",
      myinfo: "내 정보",
      logout: "로그아웃",
      admin: "Admin Page",
      language: "Language",
      openMenu: "메뉴 열기",
      closeMenu: "메뉴 닫기",
      external: "외부 서비스",
      dataDesc: "수집된 공개 데이터를 확인하고 상세 페이지로 이동합니다.",
      bookDataDesc: "운영 중인 도서 데이터 상세 화면입니다.",
      workbenchDesc: "데이터 탐색과 점검 도구를 엽니다.",
      bookWorkbenchDesc: "NAVER 도서 read-model을 검색하고 상세를 확인합니다.",
      lectureWorkbenchDesc: "Inflearn 강의 read-model을 검색하고 상세를 확인합니다.",
      shoppingInsightDesc: "쇼핑 가격대, 키워드, 상품 근거를 분석합니다.",
      introDesc: "주식회사 통계마당의 소개와 운영 정보를 확인합니다.",
      termsDesc: "Statground 서비스 이용 조건을 확인합니다.",
      privacyDesc: "개인정보 처리 기준과 이용자 권리를 확인합니다.",
      webRDesc: "통계마당이 운영하는 Web-R 서비스로 이동합니다.",
      accountDesc: "로그인, 가입, 내 정보 화면으로 이동합니다."
    },
    en: {
      home: "Home",
      data: "Data",
      dataHub: "Data Hub",
      bookData: "Book Data",
      workbench: "Workbench",
      workbenchHub: "Workbench Home",
      bookWorkbench: "Book Workbench",
      lectureWorkbench: "Lecture Workbench",
      shoppingInsight: "Shopping Price Insight",
      intro: "About",
      companyIntro: "About Statground",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      webR: "Web-R",
      account: "Account",
      login: "Sign in",
      signup: "Sign up",
      myinfo: "My Info",
      logout: "Sign out",
      admin: "Admin Page",
      language: "Language",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      external: "External services",
      dataDesc: "Browse collected public data and detail pages.",
      bookDataDesc: "Open the current book data detail surface.",
      workbenchDesc: "Open tools for data exploration and checks.",
      bookWorkbenchDesc: "Search and inspect the NAVER book read model.",
      lectureWorkbenchDesc: "Search and inspect the Inflearn course read model.",
      shoppingInsightDesc: "Analyze shopping price bands, keywords, and product evidence.",
      introDesc: "Company and operating information for Statground.",
      termsDesc: "Review the Statground service terms.",
      privacyDesc: "Review privacy practices and user rights.",
      webRDesc: "Visit the Web-R service operated by Statground.",
      accountDesc: "Sign in, create an account, or manage your profile."
    }
  };

  function resolveLang(raw) {
    if (window.sg_resolve_lang_code) {
      return window.sg_resolve_lang_code(raw) || "";
    }
    return String(raw || "").trim();
  }

  function currentLang() {
    if (window.sg_get_current_lang) {
      return window.sg_get_current_lang() || "ko";
    }
    try {
      return resolveLang(localStorage.getItem("sg_lang")) || resolveLang(document.documentElement.getAttribute("lang")) || "ko";
    } catch (e) {
      return "ko";
    }
  }

  function text(key) {
    const lang = currentLang();
    const table = LABELS[lang] || LABELS[String(lang).split("-")[0]] || LABELS.en || LABELS.ko;
    return (table && table[key]) || LABELS.ko[key] || key;
  }

  function langMeta(code) {
    const resolved = resolveLang(code) || "ko";
    return LANG_META[resolved] || LANG_META[String(resolved).split("-")[0]] || { label: resolved || "Language", country: "kr" };
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function flagBadge(meta) {
    const country = String(meta.country || "kr").toLowerCase().replace(/[^a-z-]/g, "") || "kr";
    return `<span class="inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm"><img src="${FLAG_CDN_BASE}${country}.svg" alt="" class="h-full w-full object-cover" loading="lazy" decoding="async"></span>`;
  }

  function languageButton(id, extraClass) {
    const meta = langMeta(currentLang());
    return [
      `<button id="${esc(id)}" type="button" class="inline-flex min-h-[36px] items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-blue-700 ${extraClass || ""}" aria-label="${esc(text("language"))}" title="${esc(text("language"))}">`,
      flagBadge(meta),
      `<span>${esc(meta.label)}</span>`,
      '<svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-width="2" d="m6 9 6 6 6-6"></path></svg>',
      '</button>'
    ].join("");
  }

  function socialSVG(kind) {
    switch (kind) {
      case "facebook-group":
        return `<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 48 48" aria-hidden="true"><path d="M25.638355 48H2.649232C1.185673 48 0 46.813592 0 45.350603V2.649211C0 1.18585 1.185859 0 2.649232 0h42.701723C46.813955 0 48 1.18585 48 2.649211v42.701392C48 46.813778 46.813769 48 45.350955 48h-12.23165V29.411755h6.239216l.934234-7.244169h-7.17345v-4.624945c0-2.097354.582407-3.526631 3.589985-3.526631l3.836021-.001677V7.535091c-.663425-.088283-2.940527-.285521-5.589759-.285521-5.530718 0-9.317197 3.375956-9.317197 9.575639v5.342377h-6.255233v7.244169h6.255233V48Z"></path></svg>`;
      case "facebook-page":
        return `<svg class="h-4 w-4" fill="currentColor" viewBox="-5 0 20 20" aria-hidden="true"><path transform="translate(-329 -7239)" d="M335.821282 7259v-9h2.732411l.446307-4h-3.178718v-1.948c0-1.03.026311-2.052 1.465602-2.052h1.457805v-2.86c0-.043-1.252192-.14-2.519002-.14-2.645683 0-4.30228 1.657-4.30228 4.7v2.3H329v4h2.923407v9h3.897875Z"></path></svg>`;
      case "x":
        return `<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 487.43 456.19" aria-hidden="true"><path transform="translate(-6.29 -21.9)" d="M7.48 21.9 195.66 273.57 6.29 478.1h42.62L214.71 299l134 179.11h145L294.93 212.33 471.2 21.9h-42.62L275.89 186.82 152.51 21.9H7.48ZM70.16 53.3h66.63L431 446.7h-66.61L70.16 53.3Z"></path></svg>`;
      case "instagram":
        return `<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 18c3.3137 0 6-2.6863 6-6s-2.6863-6-6-6-6 2.6863-6 6 2.6863 6 6 6Zm0-2c2.2091 0 4-1.7909 4-4s-1.7909-4-4-4-4 1.7909-4 4 1.7909 4 4 4Z"></path><path d="M18 5c-.5523 0-1 .44772-1 1s.4477 1 1 1 1-.44772 1-1-.4477-1-1-1Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6v2.8c0 3.3603 0 5.0405.65396 6.3239.57524 1.129 1.49312 2.0469 2.6221 2.6221C5.55953 23 7.23969 23 10.6 23h2.8c3.3603 0 5.0405 0 6.3239-.654.5752-.5752 1.4931-1.4931 2.6221-2.6221C23 18.4405 23 16.7603 23 13.4v-2.8c0-3.36031 0-5.04047-.654-6.32394-.5752-1.12898-1.4931-2.04686-2.6221-2.6221C18.4405 1 16.7603 1 13.4 1h-2.8c-3.36031 0-5.04047 0-6.32394.65396-1.12898.57524-2.04686 1.49312-2.6221 2.6221ZM13.4 3h-2.8c-1.71316 0-2.87775.00156-3.77792.0751-.87684.07164-1.32524.20149-1.63804.36087-.75265.3835-1.36457.99542-1.74807 1.74807-.15938.3128-.28923.7612-.36087 1.63804C3.00156 7.72225 3 8.88684 3 10.6v2.8c0 1.7132.00156 2.8777.0751 3.7779.07164.8769.20149 1.3253.36087 1.6381.3835.7526.99542 1.3645 1.74807 1.748.3128.1594.7612.2893 1.63804.3609C7.72225 20.9984 8.88684 21 10.6 21h2.8c1.7132 0 2.8777-.0016 3.7779-.0751.8769-.0716 1.3253-.2015 1.6381-.3609.7526-.3835 1.3645-.9954 1.748-1.748.1594-.3128.2893-.7612.3609-1.6381C20.9984 16.2777 21 15.1132 21 13.4v-2.8c0-1.71316-.0016-2.87775-.0751-3.77792-.0716-.87684-.2015-1.32524-.3609-1.63804-.3835-.75265-.9954-1.36457-1.748-1.74807-.3128-.15938-.7612-.28923-1.6381-.36087C16.2777 3.00156 15.1132 3 13.4 3Z"></path></svg>`;
      case "linkedin":
        return `<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true"><path d="M28.778 1.004H3.218C3.21 1.004 3.201 1 3.191 1 1.992 1 1.019 1.964 1.005 3.159v25.672c.014 1.196.987 2.161 2.186 2.161h25.583c.008 0 .018.004.028.004 1.2 0 2.175-.963 2.194-2.159V3.165c-.019-1.197-.994-2.161-2.195-2.161h-.023ZM9.9 26.562H5.446V12.251H9.9v14.311ZM7.674 10.293c-1.425 0-2.579-1.155-2.579-2.579s1.155-2.579 2.579-2.579c1.424 0 2.579 1.154 2.579 2.578v.004c0 1.423-1.154 2.577-2.577 2.577h-.002Zm18.882 16.269h-4.441v-6.959c0-1.66-.034-3.795-2.314-3.795-2.316 0-2.669 1.806-2.669 3.673v7.082h-4.441V12.252h4.266v1.951h.058c.828-1.395 2.326-2.315 4.039-2.315.061 0 .121.001.181.003 4.5 0 5.332 2.962 5.332 6.817v7.854Z"></path></svg>`;
      case "threads":
        return `<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 192 192" aria-hidden="true"><path d="M141.537 88.9883c-.827-.3964-1.667-.7779-2.518-1.1432-1.482-27.3069-16.403-42.9401-41.4571-43.1001h-.3399c-14.9856 0-27.4489 6.3966-35.12 18.0364l13.779 9.4521c5.7306-8.6945 14.7242-10.548 21.3476-10.548h.229c8.2494.0526 14.4744 2.4511 18.5034 7.1285 2.932 3.4053 4.893 8.111 5.864 14.0498-7.314-1.2431-15.224-1.6253-23.68-1.1405-23.8203 1.3721-39.1339 15.2646-38.1054 34.5687.5219 9.792 5.4001 18.216 13.7354 23.719 7.0474 4.652 16.124 6.927 25.5573 6.412 12.4577-.683 22.2307-5.436 29.0487-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.4875 16.351-22.8093-.169-40.0597-7.484-51.2754-21.742-10.5026-13.351-15.9304-32.635-16.1329-57.317.2025-24.6822 5.6303-43.9664 16.1329-57.3173C56.9538 24.4249 74.2039 17.11 97.0132 16.9405c22.9748.1708 40.5258 7.5209 52.1708 21.8475 5.71 7.0256 10.015 15.8608 12.853 26.1623l16.147-4.3081c-3.44-12.68-8.853-23.6065-16.219-32.6682C147.036 9.60668 125.202.195148 97.0695 0h-.1126C68.8816.19447 47.2921 9.6418 32.7883 28.0793 19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96l.0007.0675c.2237 28.6165 6.8812 51.4465 19.7876 67.8535 14.5038 18.437 36.0933 27.885 64.1686 28.079h.1126c24.9605-.173 42.5545-6.708 57.0485-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.9448-24.723-24.5527ZM98.4405 129.507c-10.44.588-21.2861-4.098-21.8209-14.135-.3964-7.442 5.2962-15.746 22.4616-16.7352 1.9658-.1134 3.8948-.1688 5.7898-.1688 6.235 0 12.068.6057 17.371 1.765-1.978 24.702-13.58 28.713-23.8015 29.274Z"></path></svg>`;
      default:
        return `<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle></svg>`;
    }
  }

  function socialIcon(item) {
    return [
      `<a href="${esc(item[1])}" target="_blank" rel="noopener" aria-label="${esc(item[0])}" title="${esc(item[0])}" class="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">`,
      socialSVG(item[2]),
      '</a>'
    ].join("");
  }

  function socialBar() {
    return '<div class="flex flex-row flex-wrap items-center gap-1">' + SOCIAL_LINKS.map(socialIcon).join("") + '</div>';
  }

  function langPath(path) {
    const lang = encodeURIComponent(currentLang() || "ko");
    const suffix = String(path || "/").replace(/^\/+/, "");
    return "/" + lang + "/" + suffix;
  }

  function pageContext() {
    return window.STATGROUND_PAGE_CONTEXT || {};
  }

  function currentUserFromContext() {
    const ctx = pageContext();
    return {
      name: String(ctx.username || ctx.nickname || "").trim(),
      role: String(ctx.role || "").trim()
    };
  }

  function menuSections() {
    const sections = [
      {
        id: "workbench",
        title: text("workbench"),
        icon: "tool",
        items: [
          { title: text("workbenchHub"), desc: text("workbenchDesc"), href: langPath("workbench/"), icon: "tool" },
          { title: text("bookWorkbench"), desc: text("bookWorkbenchDesc"), href: langPath("workbench/book/"), icon: "book" },
          { title: text("lectureWorkbench"), desc: text("lectureWorkbenchDesc"), href: langPath("workbench/lecture/"), icon: "video" },
          { title: text("shoppingInsight"), desc: text("shoppingInsightDesc"), href: langPath("shopping/"), icon: "shopping" }
        ]
      }
    ];
    const role = currentUserFromContext().role.toLowerCase();
    if (role === "관리자" || role === "administrator" || role === "admin") {
      sections.push({
        id: "advertising",
        title: "광고",
        icon: "advertising",
        items: [
          { title: "광고 글 관리", desc: "SolidEdit로 광고 이야기를 작성하고 발행합니다.", href: "/admin/advertising/", icon: "advertising" }
        ]
      });
    }
    return sections;
  }

  function icon(name) {
    const common = 'class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"';
    switch (name) {
      case "database":
        return `<svg ${common}><ellipse cx="12" cy="5" rx="7" ry="3" stroke-width="2"></ellipse><path stroke-width="2" d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"></path><path stroke-width="2" d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"></path></svg>`;
      case "book":
        return `<svg ${common}><path stroke-width="2" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path stroke-width="2" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"></path><path stroke-width="2" d="M8 6h8M8 10h8"></path></svg>`;
      case "video":
        return `<svg ${common}><path stroke-width="2" d="M15 10.5 20 7v10l-5-3.5V17H4V7h11v3.5Z"></path><path stroke-width="2" d="M7 10h5M7 14h4"></path></svg>`;
      case "shopping":
        return `<svg ${common}><path stroke-width="2" d="M4 19h16"></path><path stroke-width="2" d="M6 17V9"></path><path stroke-width="2" d="M10 17V5"></path><path stroke-width="2" d="M14 17v-7"></path><path stroke-width="2" d="M18 17V7"></path></svg>`;
      case "advertising":
        return `<svg ${common}><path stroke-width="2" d="M4 11v2a2 2 0 0 0 2 2h2l4 4v-4l7-3V8L8 5v4H6a2 2 0 0 0-2 2Z"></path><path stroke-width="2" d="M19 9V5M19 15v4"></path></svg>`;
      case "tool":
        return `<svg ${common}><path stroke-width="2" d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.9-2.9 2.4-2.6Z"></path></svg>`;
      case "info":
        return `<svg ${common}><circle cx="12" cy="12" r="9" stroke-width="2"></circle><path stroke-width="2" d="M12 11v5"></path><path stroke-width="2" d="M12 8h.01"></path></svg>`;
      case "terms":
        return `<svg ${common}><path stroke-width="2" d="M7 3h7l4 4v14H7V3Z"></path><path stroke-width="2" d="M14 3v5h5"></path><path stroke-width="2" d="M9 13h6M9 17h6"></path></svg>`;
      case "privacy":
        return `<svg ${common}><path stroke-width="2" d="M12 3 5 6v5c0 4.5 2.8 8.2 7 10 4.2-1.8 7-5.5 7-10V6l-7-3Z"></path><path stroke-width="2" d="m9.5 12 1.8 1.8L15 10"></path></svg>`;
      case "user":
        return `<svg ${common}><path stroke-width="2" d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="7" r="4" stroke-width="2"></circle></svg>`;
      case "plus":
        return `<svg ${common}><path stroke-width="2" d="M12 5v14M5 12h14"></path></svg>`;
      case "settings":
        return `<svg ${common}><circle cx="12" cy="12" r="3" stroke-width="2"></circle><path stroke-width="2" d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3-.2-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-5v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.2.1-2-3 .1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3 .2.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3h5v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.2-.1 2 3-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z"></path></svg>`;
      case "external":
        return `<svg ${common}><path stroke-width="2" d="M7 17 17 7M9 7h8v8"></path><path stroke-width="2" d="M19 19H5V5"></path></svg>`;
      default:
        return `<svg ${common}><circle cx="12" cy="12" r="9" stroke-width="2"></circle></svg>`;
    }
  }

  function chevron() {
    return '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-width="2" d="m6 9 6 6 6-6"></path></svg>';
  }

  function menuCard(item) {
    const target = item.external ? ' target="_blank" rel="noopener"' : "";
    return [
      `<a href="${esc(item.href)}"${target} class="group flex min-h-[118px] items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-300 hover:bg-blue-50">`,
      `<span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 group-hover:text-blue-700">${icon(item.icon)}</span>`,
      '<span class="min-w-0">',
      `<span class="block text-sm font-black text-slate-950 group-hover:text-blue-700">${esc(item.title)}</span>`,
      `<span class="mt-1 block text-xs leading-5 text-slate-500">${esc(item.desc)}</span>`,
      '</span>',
      '</a>'
    ].join("");
  }

  function desktopMega(section) {
    return [
      `<div id="sg-mega-${esc(section.id)}" data-menu-panel="${esc(section.id)}" class="hidden border-b border-slate-200 bg-white shadow-lg">`,
      '<div class="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2 lg:px-8">',
      section.items.map(menuCard).join(""),
      '</div>',
      `<div class="border-t border-slate-100 bg-slate-50 px-6 py-2 text-center text-xs font-bold text-slate-500">${esc(section.title)}</div>`,
      '</div>'
    ].join("");
  }

  function accountLinks() {
    const user = currentUserFromContext();
    if (!user.name) {
      return [
        `<a href="/account/" class="inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-bold text-blue-700 hover:bg-blue-50">${esc(text("login"))}</a>`,
        '<span class="h-5 w-px bg-slate-200" aria-hidden="true"></span>',
        `<a href="/account/signup/" class="inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-700">${esc(text("signup"))}</a>`
      ].join("");
    }
    const role = user.role ? `<a href="/account/myinfo/" class="inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-bold text-blue-700 hover:bg-blue-50">${esc(user.role)}</a>` : "";
    const admin = user.role === "관리자" ? `<a href="/admin/" class="inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-700">${esc(text("admin"))}</a>` : "";
    return [
      `<a href="/account/myinfo/" class="group relative inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-slate-900 hover:bg-slate-50 hover:text-blue-700" title="${esc(text("myinfo"))}" aria-label="${esc(user.name + " " + text("myinfo"))}">${icon("user")}<span>${esc(user.name)}</span></a>`,
      role,
      admin,
      '<span class="hidden h-5 w-px bg-slate-200 sm:inline-block" aria-hidden="true"></span>',
      `<a href="/account/logout/" class="inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-700">${esc(text("logout"))}</a>`
    ].filter(Boolean).join("");
  }

  function desktopNav(section) {
    return [
      `<button type="button" data-menu-toggle="${esc(section.id)}" aria-expanded="false" aria-controls="sg-mega-${esc(section.id)}" class="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-slate-900 hover:bg-blue-50 hover:text-blue-700">`,
      `<span>${esc(section.title)}</span>`,
      chevron(),
      '</button>'
    ].join("");
  }

  function mobileSection(section) {
    return [
      '<section class="border-b border-slate-100 pb-3">',
      `<button type="button" data-mobile-section="${esc(section.id)}" aria-expanded="false" aria-controls="sg-mobile-section-${esc(section.id)}" class="flex min-h-[48px] w-full items-center justify-between rounded-lg px-2 text-left text-base font-black text-slate-950 hover:bg-blue-50">`,
      `<span class="inline-flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">${icon(section.icon)}</span>${esc(section.title)}</span>`,
      chevron(),
      '</button>',
      `<div id="sg-mobile-section-${esc(section.id)}" class="hidden space-y-2 px-2 pb-2">`,
      section.items.map(function (item) {
        const target = item.external ? ' target="_blank" rel="noopener"' : "";
        return `<a href="${esc(item.href)}"${target} class="flex items-start gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-700"><span class="mt-0.5 text-slate-500">${icon(item.icon)}</span><span><span class="block font-bold">${esc(item.title)}</span><span class="mt-1 block text-xs leading-5 text-slate-500">${esc(item.desc)}</span></span></a>`;
      }).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function headerHTML() {
    const sections = menuSections();
    return [
      '<header class="sg-header bg-white text-slate-950 shadow-sm">',
      '<nav class="border-b border-slate-200 bg-white">',
      '<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">',
      '<a href="/" class="flex min-w-0 items-center" aria-label="Statistical Ground home">',
      `<img src="${LOGO_URL}" alt="Statistical Ground" width="1655" height="245" class="h-9 w-auto max-w-[210px] object-contain sm:h-10 sm:max-w-[280px] lg:max-w-[320px]" loading="eager" decoding="async">`,
      '</a>',
      '<div class="hidden min-w-0 flex-1 flex-row flex-wrap items-center justify-end gap-2 text-sm md:flex">',
      languageButton("lang-toggle", ""),
      '<span class="mx-1 h-5 w-px bg-slate-200" aria-hidden="true"></span>',
      socialBar(),
      '</div>',
      '<button type="button" id="mobile-menu-btn" class="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden" aria-label="' + esc(text("openMenu")) + '" aria-controls="mobile-menu" aria-expanded="false">',
      '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>',
      '</button>',
      '</div>',
      '</nav>',
      '<nav class="hidden border-b border-slate-200 bg-white md:block">',
      '<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">',
      '<div class="hidden flex-wrap items-center gap-3 md:flex">',
      sections.map(desktopNav).join(""),
      '</div>',
      '<div class="hidden min-w-0 flex-row flex-wrap items-center justify-end gap-2 md:flex">',
      accountLinks(),
      '</div>',
      '</div>',
      '</nav>',
      sections.map(desktopMega).join(""),
      '<div id="mobile-menu" class="fixed inset-0 z-50 hidden overflow-y-auto bg-white text-slate-950 md:hidden">',
      '<div class="flex items-center justify-between border-b border-slate-200 p-5">',
      '<a href="/" class="flex min-w-0 items-center" aria-label="Statistical Ground home">',
      `<img src="${LOGO_URL}" alt="Statistical Ground" width="1655" height="245" class="h-8 w-auto max-w-[150px] object-contain sm:max-w-[220px]" loading="eager" decoding="async">`,
      '</a>',
      '<div class="flex items-center gap-2">',
      '<button id="mobile-menu-close" type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100" aria-label="' + esc(text("closeMenu")) + '"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-width="2" d="M6 18 18 6M6 6l12 12"></path></svg></button>',
      '</div>',
      '</div>',
      '<div class="space-y-3 p-5">',
      '<div class="flex flex-wrap items-center gap-2 px-2">',
      languageButton("mobile-lang-toggle", ""),
      '</div>',
      '<div class="flex flex-wrap items-center gap-1 px-2">',
      socialBar(),
      '</div>',
      '<div class="flex flex-wrap gap-2 px-2">',
      accountLinks(),
      '</div>',
      `<a href="/" class="flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-base font-black text-slate-950 hover:bg-blue-50">${icon("home")}<span>${esc(text("home"))}</span></a>`,
      sections.map(mobileSection).join(""),
      '</div>',
      '</div>',
      '<div id="lang-modal" class="fixed inset-0 z-[60] hidden">',
      '<div id="lang-modal-backdrop" class="absolute inset-0 bg-black/40"></div>',
      '<div class="relative flex h-full w-full items-center justify-center p-4">',
      '<div class="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">',
      '<div class="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div class="font-black tracking-tight">Language</div><button id="lang-modal-close" type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100" aria-label="Close language modal"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-width="2" d="M6 18 18 6M6 6l12 12"></path></svg></button></div>',
      '<div class="max-h-[60vh] overflow-auto py-2" id="lang-modal-list"></div>',
      '</div>',
      '</div>',
      '</div>',
      '</header>'
    ].join("");
  }

  function closeDesktopMenus() {
    document.querySelectorAll("[data-menu-panel]").forEach(function (panel) {
      panel.classList.add("hidden");
    });
    document.querySelectorAll("[data-menu-toggle]").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  }

  function bindMenuInteractions() {
    document.querySelectorAll("[data-menu-toggle]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        const id = button.getAttribute("data-menu-toggle");
        const panel = document.getElementById("sg-mega-" + id);
        if (!panel) return;
        const willOpen = panel.classList.contains("hidden");
        closeDesktopMenus();
        if (willOpen) {
          panel.classList.remove("hidden");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });

    if (!window.__sgMenuOutsideClickBound) {
      window.__sgMenuOutsideClickBound = true;
      document.addEventListener("click", function (event) {
        if (event.target.closest(".sg-header")) return;
        closeDesktopMenus();
      });
    }

    document.querySelectorAll("[data-mobile-section]").forEach(function (button) {
      button.addEventListener("click", function () {
        const id = button.getAttribute("data-mobile-section");
        const panel = document.getElementById("sg-mobile-section-" + id);
        if (!panel) return;
        const open = panel.classList.contains("hidden");
        panel.classList.toggle("hidden", !open);
        button.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  function bindMobileMenu() {
    const openBtn = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");
    const closeBtn = document.getElementById("mobile-menu-close");
    if (openBtn && menu) {
      openBtn.addEventListener("click", function () {
        menu.classList.remove("hidden");
        openBtn.setAttribute("aria-expanded", "true");
      });
    }
    if (closeBtn && menu) {
      closeBtn.addEventListener("click", function () {
        menu.classList.add("hidden");
        if (openBtn) openBtn.setAttribute("aria-expanded", "false");
      });
    }
    if (menu) {
      menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          menu.classList.add("hidden");
          if (openBtn) openBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  async function setHeader() {
    const menu = document.getElementById("div_menu");
    if (!menu) return;
    menu.innerHTML = headerHTML();
    bindMenuInteractions();
    bindMobileMenu();
  }

  async function set_header() {
    await setHeader();
  }

  window.sg_apply_workbench_links = function () {
    const sections = menuSections();
    const byTitle = sections.reduce(function (items, section) {
      return items.concat(section.items);
    }, []);
    byTitle.forEach(function (item) {
      document.querySelectorAll('a[href="' + item.href.replace(/"/g, '\\"') + '"]').forEach(function (link) {
        link.setAttribute("href", item.href);
      });
    });
  };
  window.set_header = set_header;

  window.addEventListener("sg_lang_changed", function () {
    setHeader().then(function () {
      try { window.sg_init_i18n && window.sg_init_i18n(); } catch (e) {}
    });
  });
})();
