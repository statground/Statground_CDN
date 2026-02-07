/**
 * scripts/common/theme.js
 * - 다크모드 토글 공통
 */

function sg_init_theme() {
// ------------------------------------------------------------
      // Dark mode toggle + sync desktop/mobile icons
      // ------------------------------------------------------------
      // - 데스크톱/모바일 헤더 각각에 토글 버튼이 있으므로,
      //   하나의 토글 로직(toggleTheme)으로 양쪽을 동시에 동기화합니다.
      // - localStorage(KEY=sg_theme)에 dark/light를 저장해 새로고침해도 유지됩니다.
      (() => {
        const KEY = 'sg_theme';
        const rootEl = document.documentElement;

        const btn = document.getElementById('theme-toggle');
        const moon = document.getElementById('icon-moon');
        const sun = document.getElementById('icon-sun');

        const mBtn = document.getElementById('mobile-theme-toggle');
        const mMoon = document.getElementById('mobile-icon-moon');
        const mSun = document.getElementById('mobile-icon-sun');

        function syncIcons(isDark) {
          if (moon && sun) { moon.classList.toggle('hidden', isDark); sun.classList.toggle('hidden', !isDark); }
          if (mMoon && mSun) { mMoon.classList.toggle('hidden', isDark); mSun.classList.toggle('hidden', !isDark); }
        }

        function applyTheme(mode) {
          const isDark = (mode === 'dark');
          rootEl.classList.toggle('dark', isDark);
          syncIcons(isDark);
        }

        const saved = localStorage.getItem(KEY);
        if (saved === 'dark' || saved === 'light') {
          applyTheme(saved);
        } else {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          applyTheme(prefersDark ? 'dark' : 'light');
        }

        function toggleTheme() {
          const next = rootEl.classList.contains('dark') ? 'light' : 'dark';
          localStorage.setItem(KEY, next);
          applyTheme(next);
        }

        if (btn) btn.addEventListener('click', toggleTheme);
        if (mBtn) mBtn.addEventListener('click', toggleTheme);
      })();
}
