/**
 * scripts/index/main_20260606_2015.js
 * - Homepage collecting message
 * - Lets the first-page main area fill the remaining viewport so the footer sits at the bottom.
 */

window.set_main = async function set_main() {
  const main = document.getElementById("div_main");
  if (!main) return;

  const shellMain = main.closest("main");
  if (shellMain) {
    shellMain.className = "flex min-h-0 w-full flex-1 items-center justify-center px-6 py-10 md:px-10 md:py-14";
  }

  main.className = "flex w-full items-center justify-center";
  main.innerHTML = `
    <div class="flex w-full items-center justify-center text-center">
      <div>
        <p class="mb-4 text-xs font-black uppercase text-blue-600 opacity-40 sm:text-sm md:mb-6 md:text-base">
          Universal Data Discovery
        </p>
        <h1 class="text-2xl font-extrabold sm:text-3xl md:text-4xl">
          데이터를 수집하고 있습니다.
        </h1>
      </div>
    </div>
  `;

  document.body.className = "flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-white";
};
