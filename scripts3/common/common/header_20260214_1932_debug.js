/**
 * scripts/common/header.js
 * - header HTML 주입 + 헤더 UI 초기화
 * - NOTE: meta.html에서 set_header()를 직접 호출하므로, 전역(window)에 반드시 노출합니다.
 */
const __SG_DEFAULT_MENU_HTML = `<nav class="w-full px-6 py-4 flex justify-between items-center z-50 border-b border-transparent">
    <div class="flex items-center gap-6">
      <a href="/" class="text-xl font-black tracking-tighter text-blue-700">
        STATGROUND
      </a>
      <!-- 개발중 메뉴 숨김 -->
      <!--
      <div class="hidden md:flex gap-4 text-sm font-bold opacity-70">
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.data">데이터</span></a>
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.workbench">워크벤치</span></a>
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.story">스토리</span></a>
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.academy">아카데미</span></a>
      </div>
      -->
    </div>

    <div id="header-actions" class="flex items-center justify-end gap-3 sm:gap-4 flex-nowrap">
      
      <!-- 다크모드 -->
      <div class="w-11 h-11 flex items-center justify-center shrink-0">
        <button id="theme-toggle" class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-full w-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white" aria-label="Toggle dark mode" title="다크모드">
          <svg id="icon-moon" class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-width="2" d="M12 3a7.5 7.5 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
          </svg>
          <svg id="icon-sun" class="w-5 h-5 block hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" stroke-width="2"></circle>
          </svg>
        </button>
      </div>

      <!-- 언어 -->
      <div class="w-11 h-11 flex items-center justify-center shrink-0">
        <button id="lang-toggle" type="button" class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-full w-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white" aria-label="Language" title="Language">
          <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
            <path stroke-width="2" d="M2 12h20"></path>
          </svg>
        </button>
      </div>

      <!-- 모바일 햄버거 -->
      <div class="w-11 h-11 flex items-center justify-center shrink-0 md:hidden">
        <button id="mobile-menu-btn" class="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition h-full w-11 inline-flex items-center justify-center rounded-lg leading-none text-slate-700 dark:text-white" aria-label="Open menu">
          <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-width="2" d="M4 6h16"></path>
            <path stroke-width="2" d="M4 12h16"></path>
            <path stroke-width="2" d="M4 18h16"></path>
          </svg>
        </button>
      </div>

      <!-- 로그인 버튼 제거됨 -->
    </div>
  </nav>

  <!-- 모바일 메뉴 -->
  <div id="mobile-menu" class="md:hidden hidden fixed inset-0 z-50 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <div class="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
      <a href="/" class="text-lg font-black tracking-tighter text-blue-700">
        STATGROUND
      </a>

      <div class="flex items-center gap-2">
        <button id="mobile-theme-toggle" class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-11 w-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white">
          <svg id="mobile-icon-moon" class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-width="2" d="M12 3a7.5 7.5 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
          </svg>
        </button>

        <button id="mobile-menu-close" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 모바일 메뉴 항목도 개발중이라 숨김 -->
    <!--
    <nav class="flex flex-col p-6 space-y-6 text-lg font-bold">
      ...
    </nav>
    -->
  </div>`;


// meta.html에서 (async()=>{ await set_header(); ... }) 형태로 호출하므로 전역 노출이 필수
window.set_header = async function set_header() {
  const menu = document.getElementById('div_menu');
  if (menu) menu.innerHTML = __SG_DEFAULT_MENU_HTML;

  // 공통 초기화 훅(있으면 호출)
  try { window.sg_init_mobile_menu && window.sg_init_mobile_menu(); } catch (e) {}
  try { window.sg_init_theme && window.sg_init_theme(); } catch (e) {}
  try { window.sg_init_i18n && window.sg_init_i18n(); } catch (e) {}
};
