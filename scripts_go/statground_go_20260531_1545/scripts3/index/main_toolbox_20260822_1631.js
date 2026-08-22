(function () {
  "use strict";

  window.set_main = async function set_main() {
    var main = document.getElementById("div_main");
    if (!main) return;

    var shellMain = main.closest("main");
    if (shellMain) {
      shellMain.className = "w-full flex-1";
    }

    main.classList.add("w-full");
    document.body.className = "flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-white text-slate-950";
  };
})();
