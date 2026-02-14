/**
 * scripts/common/header.js
 * - header HTML 주입 + 헤더 UI 초기화
 */
const __SG_DEFAULT_MENU_HTML = `<nav class="w-full px-6 py-4 flex justify-between items-center z-50 border-b border-transparent">
    <div class="flex items-center gap-6">
      <a href="/" class="text-xl font-black tracking-tighter text-blue-700">STATGROUND</a>
      <div class="hidden md:flex gap-4 text-sm font-bold opacity-70 hidden">
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.data">데이터</span></a>
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.workbench">워크벤치</span></a>
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.story">스토리</span></a>
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.academy">아카데미</span></a>
      </div>
    </div>

    <div id="header-actions" class="flex items-center justify-end gap-3 sm:gap-4 flex-nowrap">
      <div class="w-11 h-11 flex items-center justify-center shrink-0">
        <button id="theme-toggle" class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-full w-11 h-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white" aria-label="Toggle dark mode" title="다크모드">
          <svg id="icon-moon" class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path stroke-width="2" d="M12 3a7.5 7.5 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
          </svg>
          <svg id="icon-sun" class="w-5 h-5 block hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" stroke-width="2"></circle>
            <path stroke-width="2" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
          </svg>
        </button>
      </div>

      <div class="w-11 h-11 flex items-center justify-center shrink-0">
        <button id="lang-toggle" type="button" class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-full w-11 h-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white" aria-label="Language" title="Language">
          <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
            <path stroke-width="2" d="M2 12h20"></path>
            <path stroke-width="2" d="M12 2a15 15 0 0 1 0 20"></path>
            <path stroke-width="2" d="M12 2a15 15 0 0 0 0 20"></path>
          </svg>
        </button>
      </div>

      <div class="w-11 h-11 flex items-center justify-center shrink-0 md:hidden">
        <button id="mobile-menu-btn" class="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition h-full w-11 h-11 inline-flex items-center justify-center rounded-lg leading-none text-slate-700 dark:text-white" aria-label="Open menu">
          <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path stroke-width="2" d="M4 6h16"></path>
            <path stroke-width="2" d="M4 12h16"></path>
            <path stroke-width="2" d="M4 18h16"></path>
          </svg>
        </button>
      </div>

      <div class="hidden items-center justify-center shrink-0">
        <button class="bg-slate-900 text-white dark:bg-slate-800 dark:text-white dark:border dark:border-slate-700 w-11 h-11 inline-flex items-center justify-center rounded-full leading-none sm:hidden" aria-label="로그인">
          <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path stroke-width="2" d="M20 21a8 8 0 0 0-16 0"></path>
            <circle cx="12" cy="7" r="4" stroke-width="2"></circle>
          </svg>
        </button>

        <button class="bg-slate-900 text-white dark:bg-slate-800 dark:text-white dark:border dark:border-slate-700 h-11 inline-flex items-center justify-center px-6 rounded-full text-sm font-bold leading-none whitespace-nowrap hidden sm:inline-flex">
          <span class="text-current whitespace-nowrap" data-i18n="nav.login">로그인</span>
        </button>
      </div>
    </div>
  </nav>

  <div id="mobile-menu" class="md:hidden hidden fixed inset-0 z-50 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <div class="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
      <a href="/" class="text-lg font-black tracking-tighter text-blue-700">STATGROUND</a>

      <div class="flex items-center gap-2">
        <button id="mobile-theme-toggle" class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-11 w-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white" aria-label="Toggle dark mode" title="다크모드">
          <svg id="mobile-icon-moon" class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path stroke-width="2" d="M12 3a7.5 7.5 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
          </svg>
          <svg id="mobile-icon-sun" class="w-5 h-5 block hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" stroke-width="2"></circle>
            <path stroke-width="2" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
          </svg>
        </button>

        <button id="mobile-lang-toggle" type="button" class="hover:bg-slate-100 dark:hover:bg-slate-800 transition h-11 w-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white" aria-label="Language" title="Language">
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

    <nav class="hidden flex-col p-6 space-y-6 text-lg font-bold text-slate-900 dark:text-slate-100">
      <a href="#" class="hover:text-blue-600"><span data-i18n="nav.data">데이터</span></a>
      <a href="#" class="hover:text-blue-600"><span data-i18n="nav.workbench">워크벤치</span></a>
      <a href="#" class="hover:text-blue-600"><span data-i18n="nav.story">스토리</span></a>
      <a href="#" class="hover:text-blue-600"><span data-i18n="nav.academy">아카데미</span></a>
    </nav>
  </div>

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
  
  <!-- 개발중 안내 모달 (메뉴 클릭 시 표시) -->
  <div id="dev-modal" class="hidden fixed inset-0 z-[70]">
    <div id="dev-modal-backdrop" class="absolute inset-0 bg-black/40"></div>

    <div class="relative h-full w-full flex items-center justify-center p-4">
      <div class="w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div class="font-extrabold tracking-tight">Notice</div>
          <button id="dev-modal-close" class="h-10 w-10 inline-flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="px-5 py-5">
          <div class="text-base font-bold">개발중입니다.</div>
          <div class="mt-2 text-sm opacity-80">조금만 기다려 주세요 :)</div>
          <div class="mt-4 flex justify-end">
            <button id="dev-modal-ok"
              class="h-10 px-4 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-sm hover:opacity-90">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

async function set_header() {
  const menu = document.getElementById('div_menu');
  if (menu) menu.innerHTML = __SG_DEFAULT_MENU_HTML;

  try { window.sg_init_mobile_menu && window.sg_init_mobile_menu(); } catch (e) {}
  try { window.sg_init_theme && window.sg_init_theme(); } catch (e) {}
  try { window.sg_init_i18n && window.sg_init_i18n(); } catch (e) {}
  try { window.sg_init_dev_notice && window.sg_init_dev_notice(); } catch (e) {}
}
