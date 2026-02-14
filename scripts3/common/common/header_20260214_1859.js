/**
 * scripts/common/header.js
 * - header HTML 주입 + 헤더 UI 초기화
 * - 개발 임시 버전 (메뉴/로그인 숨김)
 */

const __SG_DEFAULT_MENU_HTML = `<nav class="w-full px-6 py-4 flex justify-between items-center z-50 border-b border-transparent">
    <div class="flex items-center gap-6">
      <a href="/" class="text-xl font-black tracking-tighter text-blue-700">
        STATGROUND
      </a>

      <!-- 개발 중: 상단 메뉴 숨김 -->
      <div class="hidden gap-4 text-sm font-bold opacity-70">
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.data">데이터</span></a>
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.workbench">워크벤치</span></a>
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.story">스토리</span></a>
        <a href="#" class="hover:text-blue-600"><span data-i18n="nav.academy">아카데미</span></a>
      </div>
    </div>

    <div id="header-actions" class="flex items-center justify-end gap-3 sm:gap-4 flex-nowrap">

      <div class="w-11 h-11 flex items-center justify-center shrink-0">
        <button id="theme-toggle"
          class="hover:bg-slate-100 dark:hover:bg-slate-800 transition w-11 h-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white"
          aria-label="Toggle dark mode" title="다크모드">
        </button>
      </div>

      <div class="w-11 h-11 flex items-center justify-center shrink-0">
        <button id="lang-toggle"
          class="hover:bg-slate-100 dark:hover:bg-slate-800 transition w-11 h-11 inline-flex items-center justify-center rounded-full leading-none text-slate-700 dark:text-white"
          aria-label="Language" title="Language">
        </button>
      </div>

      <!-- 개발 중: 로그인 버튼 전체 숨김 -->
      <div class="hidden items-center justify-center shrink-0">
      </div>

    </div>
  </nav>

  <!-- 모바일 메뉴 (내부 네비게이션 숨김) -->
  <div id="mobile-menu"
       class="md:hidden hidden fixed inset-0 z-50 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">

    <div class="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
      <a href="/" class="text-lg font-black tracking-tighter text-blue-700">
        STATGROUND
      </a>
    </div>

    <nav class="hidden flex-col p-6 space-y-6 text-lg font-bold text-slate-900 dark:text-slate-100">
      <a href="#"><span data-i18n="nav.data">데이터</span></a>
      <a href="#"><span data-i18n="nav.workbench">워크벤치</span></a>
      <a href="#"><span data-i18n="nav.story">스토리</span></a>
      <a href="#"><span data-i18n="nav.academy">아카데미</span></a>
    </nav>
  </div>`;


async function set_header() {
  const menu = document.getElementById('div_menu');
  if (menu) menu.innerHTML = __SG_DEFAULT_MENU_HTML;

  try { window.sg_init_mobile_menu && window.sg_init_mobile_menu(); } catch (e) {}
  try { window.sg_init_theme && window.sg_init_theme(); } catch (e) {}
  try { window.sg_init_i18n && window.sg_init_i18n(); } catch (e) {}
}
