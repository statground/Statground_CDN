/**
 * scripts/common/mobile_menu.js
 * - 헤더 주입 이후에만 초기화 가능
 */

function sg_init_mobile_menu() {
// ------------------------------------------------------------
      // Mobile menu open/close
      // ------------------------------------------------------------
      // - 모바일(nav 숨김) 환경에서 햄버거 버튼으로 전체화면 메뉴를 열고 닫습니다.
      // - 단순히 'hidden' 클래스를 토글하는 방식이라 CSS/Tailwind와 충돌이 적습니다.
      const openBtn = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      const closeBtn = document.getElementById('mobile-menu-close');
      if (openBtn && mobileMenu) openBtn.addEventListener('click', () => mobileMenu.classList.remove('hidden'));
      if (closeBtn && mobileMenu) closeBtn.addEventListener('click', () => mobileMenu.classList.add('hidden'));
}
