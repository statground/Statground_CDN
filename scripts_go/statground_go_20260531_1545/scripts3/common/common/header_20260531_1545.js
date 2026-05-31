/**
 * scripts/common/header.js
 * - header HTML 주입 + 헤더 UI 초기화
 *
 * ✅ 정책 반영
 * 1) 메뉴는 "워크벤치"만 노출
 * 2) 다국어 선택은 기존 방식(모달 #lang-modal) 유지  (i18n.js가 제어)
 * 3) 워크벤치 링크는 /workbench/ 가 아니라 /{선택언어}/workbench/ 로 이동
 *    - 선택 언어는 localStorage('sg_lang') 기준 (i18n.js와 동일 키)
 *
 * ⚠️ 주의
 * - sg_init_i18n()은 i18n.js 내부에서 모달 열기/선택/적용을 처리한다.
 * - 우리는 "링크 경로"만 언어에 맞게 바꿔준다(모달 UI/로직은 건드리지 않음).
 */

// ------------------------------------------
// Helpers: current language + link apply
// ------------------------------------------
function sg_get_lang_from_storage() {
  try {
    if (window.sg_get_current_lang) {
      const current = window.sg_get_current_lang();
      if (current) return current;
    }
  } catch (e) {}
  try {
    const v = localStorage.getItem("sg_lang");
    if (v && typeof v === "string") return v;
  } catch (e) {}
  return null;
}

function sg_get_lang_fallback() {
  // 1) storage
  const s = sg_get_lang_from_storage();
  if (s) return s;

  // 2) html lang
  try {
    const v = document.documentElement.getAttribute("lang");
    if (v) return v;
  } catch (e) {}

  // 3) default
  return "ko";
}

function sg_build_workbench_url(lang) {
  const l = (lang || "ko").trim();
  return `/${l}/workbench/`;
}

function sg_apply_workbench_links() {
  const lang = sg_get_lang_fallback();
  const url = sg_build_workbench_url(lang);

  // PC/모바일 공통으로 data-nav="workbench"만 갱신
  document.querySelectorAll('a[data-nav="workbench"]').forEach((a) => {
    try { a.setAttribute("href", url); } catch (e) {}
  });
}

// ------------------------------------------
// Header HTML (기존 모달 구조 유지)
// ------------------------------------------
const __SG_DEFAULT_MENU_HTML = `
<nav class="w-full px-6 py-4 flex justify-between items-center z-50 border-b border-transparent">
  <div class="flex items-center gap-6">
    <!-- 기존: span 로고 / 요청: 로고 클릭 시 / 이동이 자연스러워서 a로 -->
    <a href="/" class="text-xl font-black tracking-tighter text-blue-700">STATGROUND</a>

    <!-- ✅ 워크벤치만 노출 (PC: md 이상) -->
    <div class="hidden md:flex gap-4 text-sm font-bold opacity-70">
      <a data-nav="workbench" href="/en/workbench/" class="hover:text-blue-600">
        <span data-i18n="nav.workbench">워크벤치</span>
      </a>
    </div>
  </div>

  <div id="header-actions" class="flex items-center justify-end gap-3 sm:gap-4 flex-nowrap">
    <!-- 다크모드 -->
    <div class="w-11 h-11 flex items-center justify-center shrink-0">
      <button id="theme-toggle"
              class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-full w-11 h-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white"
              aria-label="Toggle dark mode" title="다크모드">
        <svg id="icon-moon" class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path stroke-width="2" d="M12 3a7.5 7.5 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
        </svg>
        <svg id="icon-sun" class="w-5 h-5 block hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4" stroke-width="2"></circle>
          <path stroke-width="2" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
        </svg>
      </button>
    </div>

    <!-- ✅ 다국어 버튼: 기존 id/lang-toggle 유지 (i18n.js가 모달을 열어줌) -->
    <div class="w-11 h-11 flex items-center justify-center shrink-0">
      <button id="lang-toggle" type="button"
              class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-full w-11 h-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white"
              aria-label="Language" title="Language">
        <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
          <path stroke-width="2" d="M2 12h20"></path>
          <path stroke-width="2" d="M12 2a15 15 0 0 1 0 20"></path>
          <path stroke-width="2" d="M12 2a15 15 0 0 0 0 20"></path>
        </svg>
      </button>
    </div>

    <!-- 모바일 햄버거 -->
    <div class="w-11 h-11 flex items-center justify-center shrink-0 md:hidden">
      <button id="mobile-menu-btn"
              class="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition h-full w-11 h-11 inline-flex items-center justify-center rounded-lg leading-none text-slate-700 dark:text-white"
              aria-label="Open menu">
        <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path stroke-width="2" d="M4 6h16"></path>
          <path stroke-width="2" d="M4 12h16"></path>
          <path stroke-width="2" d="M4 18h16"></path>
        </svg>
      </button>
    </div>

    <!-- ✅ 로그인 버튼 숨김 (요청 유지) -->
  </div>
</nav>

<!-- 모바일 메뉴 -->
<div id="mobile-menu" class="md:hidden hidden fixed inset-0 z-50 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
  <div class="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
    <a href="/" class="text-lg font-black tracking-tighter text-blue-700">STATGROUND</a>

    <div class="flex items-center gap-2">
      <button id="mobile-theme-toggle"
              class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-11 w-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white"
              aria-label="Toggle dark mode" title="다크모드">
        <svg id="mobile-icon-moon" class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path stroke-width="2" d="M12 3a7.5 7.5 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
        </svg>
        <svg id="mobile-icon-sun" class="w-5 h-5 block hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4" stroke-width="2"></circle>
          <path stroke-width="2" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
        </svg>
      </button>

      <!-- ✅ 모바일 다국어 버튼: 기존 id/mobile-lang-toggle 유지 -->
      <button id="mobile-lang-toggle" type="button"
              class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-11 w-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white"
              aria-label="Language" title="Language">
        <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
          <path stroke-width="2" d="M2 12h20"></path>
          <path stroke-width="2" d="M12 2a15 15 0 0 1 0 20"></path>
          <path stroke-width="2" d="M12 2a15 15 0 0 0 0 20"></path>
        </svg>
      </button>

      <button id="mobile-menu-close" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>

  <!-- ✅ 워크벤치만 노출 (모바일) -->
  <nav class="flex flex-col p-6 space-y-6 text-lg font-bold text-slate-900 dark:text-slate-100">
    <a data-nav="workbench" href="/en/workbench/" class="hover:text-blue-600">
      <span data-i18n="nav.workbench">워크벤치</span>
    </a>
  </nav>
</div>

<!-- ✅ 기존 다국어 모달 구조 유지 (#lang-modal) -->
<div id="lang-modal" class="hidden fixed inset-0 z-[60]">
  <div id="lang-modal-backdrop" class="absolute inset-0 bg-black/40"></div>

  <div class="relative h-full w-full flex items-center justify-center p-4">
    <div class="w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
        <div class="font-extrabold tracking-tight">Language</div>
        <button id="lang-modal-close" class="h-10 w-10 inline-flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close language modal">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="max-h-[60vh] overflow-auto py-2" id="lang-modal-list"></div>
    </div>
  </div>
</div>
`;

// ------------------------------------------
// set_header (meta.html에서 호출)
// ------------------------------------------
async function set_header() {
  const menu = document.getElementById("div_menu");
  if (menu) menu.innerHTML = __SG_DEFAULT_MENU_HTML;

  // 1) 헤더 주입 직후: 현재 언어에 맞게 워크벤치 링크 세팅
  try { sg_apply_workbench_links(); } catch (e) {}

  // 2) 기존 초기화 훅 (프로젝트 파일들이 제공)
  // - mobile_menu.js의 sg_init_mobile_menu(): 햄버거 열고 닫기 :contentReference[oaicite:2]{index=2}
  try { window.sg_init_mobile_menu && window.sg_init_mobile_menu(); } catch (e) {}
  try { window.sg_init_theme && window.sg_init_theme(); } catch (e) {}

  // 3) 언어 변경 시(모달에서 선택) 워크벤치 링크도 즉시 갱신
  // i18n.js는 내부 클로저라 applyLang을 직접 훅킹하기 어렵고,
  // 대신 lang-modal-list 클릭 이후(localStorage 저장된 뒤) 링크를 재적용한다.
  const modalList = document.getElementById("lang-modal-list");
  if (modalList && !modalList.__sg_workbench_link_hooked) {
    modalList.__sg_workbench_link_hooked = true;
    modalList.addEventListener("click", () => {
      // i18n.js가 localStorage에 저장한 다음 tick에서 반영되므로 micro-delay
      setTimeout(() => {
        try { sg_apply_workbench_links(); } catch (e) {}
      }, 0);
    });
  }
}

// meta.html에서 직접 호출하므로 전역 노출
window.set_header = set_header;
