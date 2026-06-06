/**
 * scripts/index/main_20260606_1910.js
 * - Homepage collecting message
 * - Keeps the collecting message compact when the first screen has little content.
 */

window.set_main = async function set_main() {
  const main = document.getElementById("div_main");
  if (!main) return;

  const shellMain = main.closest("main");
  if (shellMain) {
    shellMain.className = "w-full px-6 py-12 md:px-10 md:py-16";
  }

  main.className = "flex w-full items-center justify-center";
  main.innerHTML = `
    <div class="flex w-full items-center justify-center text-center">
      <div>
        <p class="mb-6 text-sm font-black uppercase text-blue-600 opacity-40 md:text-base">
          Universal Data Discovery
        </p>
        <h1 class="text-2xl font-extrabold md:text-4xl">
          데이터를 수집하고 있습니다.
        </h1>
      </div>
    </div>
  `;

  document.body.className = "flex min-h-screen flex-col bg-white";
};
