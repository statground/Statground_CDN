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
    ["Facebook Group", "https://www.facebook.com/groups/statground", STATGROUND_CDN + "assets3/images/svg/footer_facebook_group.svg"],
    ["Facebook Page", "https://www.facebook.com/Statground", STATGROUND_CDN + "assets3/images/svg/footer_facebook_page.svg"],
    ["Twitter", "https://twitter.com/Statground1", STATGROUND_CDN + "assets3/images/svg/footer_twitter_x.svg"],
    ["Instagram", "https://www.instagram.com/statground/", STATGROUND_CDN + "assets3/images/svg/footer_instagram.svg"],
    ["LinkedIn", "https://www.linkedin.com/company/82371650/", STATGROUND_CDN + "assets3/images/svg/footer_linkedin.svg"],
    ["Threads", "https://www.threads.net/@statground", STATGROUND_CDN + "assets3/images/svg/footer_threads.svg"]
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
      intro: "소개",
      companyIntro: "통계마당 소개",
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
      introDesc: "주식회사 통계마당의 소개와 운영 정보를 확인합니다.",
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
      intro: "About",
      companyIntro: "About Statground",
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
      introDesc: "Company and operating information for Statground.",
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

  function socialIcon(item) {
    return [
      `<a href="${esc(item[1])}" target="_blank" rel="noopener" aria-label="${esc(item[0])}" title="${esc(item[0])}" class="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">`,
      `<img src="${esc(item[2])}" alt="" class="h-5 w-5 object-contain" loading="lazy" decoding="async">`,
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
    return [
      {
        id: "data",
        title: text("data"),
        icon: "database",
        items: [
          { title: text("dataHub"), desc: text("dataDesc"), href: "/data/", icon: "database" },
          { title: text("bookData"), desc: text("bookDataDesc"), href: "/data/book/", icon: "book" }
        ]
      },
      {
        id: "workbench",
        title: text("workbench"),
        icon: "tool",
        items: [
          { title: text("workbenchHub"), desc: text("workbenchDesc"), href: langPath("workbench/"), icon: "tool" },
          { title: text("bookWorkbench"), desc: text("bookWorkbenchDesc"), href: langPath("workbench/book/"), icon: "book" }
        ]
      },
      {
        id: "intro",
        title: text("intro"),
        icon: "info",
        items: [
          { title: text("companyIntro"), desc: text("introDesc"), href: "/intro/", icon: "info" },
          { title: text("webR"), desc: text("webRDesc"), href: "https://www.web-r.org", icon: "external", external: true }
        ]
      },
      {
        id: "account",
        title: text("account"),
        icon: "user",
        items: [
          { title: text("login"), desc: text("accountDesc"), href: "/account/", icon: "user" },
          { title: text("signup"), desc: text("accountDesc"), href: "/account/signup/", icon: "plus" },
          { title: text("myinfo"), desc: text("accountDesc"), href: "/account/myinfo/", icon: "settings" }
        ]
      }
    ];
  }

  function icon(name) {
    const common = 'class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"';
    switch (name) {
      case "database":
        return `<svg ${common}><ellipse cx="12" cy="5" rx="7" ry="3" stroke-width="2"></ellipse><path stroke-width="2" d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"></path><path stroke-width="2" d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"></path></svg>`;
      case "book":
        return `<svg ${common}><path stroke-width="2" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path stroke-width="2" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"></path><path stroke-width="2" d="M8 6h8M8 10h8"></path></svg>`;
      case "tool":
        return `<svg ${common}><path stroke-width="2" d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.9-2.9 2.4-2.6Z"></path></svg>`;
      case "info":
        return `<svg ${common}><circle cx="12" cy="12" r="9" stroke-width="2"></circle><path stroke-width="2" d="M12 11v5"></path><path stroke-width="2" d="M12 8h.01"></path></svg>`;
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
      '<nav class="border-b border-slate-200 bg-white">',
      '<div class="mx-auto flex max-w-7xl flex-row flex-wrap items-center justify-start gap-2 px-4 py-3 md:justify-end md:px-6">',
      accountLinks(),
      '</div>',
      '</nav>',
      '<nav class="border-b border-slate-200 bg-white">',
      '<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">',
      '<div class="hidden flex-wrap items-center gap-3 md:flex">',
      sections.map(desktopNav).join(""),
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
