/**
 * scripts/main.js
 * - 페이지별 메인 UI만 담당 (header/footer 공통 제외)
 * - 현재 메인 UI는 개발중이므로 임시 안내 문구만 출력
 */

window.set_main = async function set_main() {
  const main = document.getElementById('div_main');
  if (!main) return;

  // 기존 React UI 제거 후 안내 문구 출력
  main.innerHTML = `
    <div class="w-full flex items-center justify-center py-40">
      <div class="text-center">
        <p class="text-sm font-black tracking-[0.4em] uppercase opacity-40 mb-6 text-blue-600">
          Universal Data Discovery
        </p>
        <h1 class="text-2xl md:text-4xl font-extrabold tracking-tight">
          데이터를 수집하고 있습니다.
        </h1>
      </div>
    </div>
  `;

  // body 기본 레이아웃 클래스 유지
  document.body.className = "flex flex-col h-screen";
};
