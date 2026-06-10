/**
 * scripts/common/footer.js
 * - footer HTML 주입
 */
const __SG_DEFAULT_FOOTER_HTML = `<footer class="w-full px-6 py-4 border-t border-slate-100 text-[11px] md:text-[12px] text-slate-500 dark:text-slate-300 z-50 bg-inherit">
    <div class="max-w-7xl mx-auto flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-y-2">
        <div class="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <a href="/intro/" class="hover:underline"><span data-i18n="footer.about">통계마당 소개</span></a>
		  <a href="https://www.web-r.org" class="hover:underline" target="_blank"><span data-i18n="footer.webr">Web-R</span></a>
        </div>
        <div class="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <a href="/intro/privates/" class="hover:underline"><span data-i18n="footer.privacy">개인정보처리방침</span></a>
          <a href="/intro/terms/" class="hover:underline"><span data-i18n="footer.terms">이용약관</span></a>
        </div>
      </div>

      <div class="keep-all leading-snug">
        <div class="flex flex-wrap gap-x-2 gap-y-1">
          <span class="font-semibold" data-i18n="footer.company">주식회사 통계마당</span>
          <span class="opacity-70">·</span>
          <span><span data-i18n="footer.ceo_dpo">대표, 개인정보보호책임자</span>: <span data-i18n="footer.ceo_name">유재성</span></span>
          <span class="opacity-70">·</span>
          <span class="whitespace-nowrap"><span data-i18n="footer.bizno">사업자등록번호</span>: 795-88-02574</span>
          <span class="opacity-70">·</span>
          <span id="footer-ecomno" class="whitespace-nowrap"><span data-i18n="footer.ecomno">통신판매업신고번호</span>: 2024-서울강남-06145</span>
        </div>

        <div class="mt-1 flex flex-wrap gap-x-2 gap-y-1">
          <span><span data-i18n="footer.addr">서울특별시 강남구 테헤란로70길 12, 402-106A호</span></span>
          <span class="opacity-70">·</span>
          <span class="whitespace-nowrap"><span data-i18n="footer.phone">대표전화</span>: <span id="footer-phone-number">0507-1300-9704</span></span>
        </div>
      </div>
    </div>
  </footer>`;

async function set_footer() {
  const footer = document.getElementById('div_footer');
  if (footer) footer.innerHTML = __SG_DEFAULT_FOOTER_HTML;
}


// meta.html에서 set_footer()를 직접 호출하므로 전역(window)에 노출 (안전장치)
window.set_footer = set_footer;
