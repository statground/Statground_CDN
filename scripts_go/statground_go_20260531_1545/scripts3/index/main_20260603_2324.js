/**
 * scripts/index/main_20260603_2324.js
 * - Homepage collecting message
 * - Centers the message in the viewport area instead of using fixed vertical padding.
 */

window.set_main = async function set_main() {
  const main = document.getElementById("div_main");
  if (!main) return;

  const shellMain = main.closest("main");
  if (shellMain) {
    shellMain.className = "flex flex-1 w-full items-center justify-center px-6 py-8 md:px-10";
  }

  main.className = "flex w-full items-center justify-center";
  main.innerHTML = `
    <div class="flex min-h-[calc(100vh-12rem)] w-full items-center justify-center text-center">
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

  document.body.className = "flex min-h-screen flex-col overflow-y-auto bg-white";
};
