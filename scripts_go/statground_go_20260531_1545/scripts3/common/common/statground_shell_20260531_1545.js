(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function parseContext() {
    const el = document.getElementById("statground-page-context");
    if (!el) return {};
    try {
      return JSON.parse(el.textContent || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function callSetMain() {
    if (window.__statgroundSetMainCalled) return;
    if (typeof window.set_main !== "function") return;
    window.__statgroundSetMainCalled = true;
    try {
      const result = window.set_main();
      if (result && typeof result.catch === "function") result.catch((err) => console.error(err));
    } catch (err) {
      console.error(err);
    }
  }

  function removeBootClass() {
    document.documentElement.classList.remove("statground-preflight");
    const skeleton = document.getElementById("statground_boot_skeleton");
    if (skeleton) skeleton.remove();
  }

  async function boot() {
    window.STATGROUND_PAGE_CONTEXT = parseContext();
    try {
      if (window.sg_get_current_lang && window.sg_set_current_lang) {
        window.sg_set_current_lang(window.sg_get_current_lang());
      }
    } catch (e) {}

    try { if (typeof window.set_header === "function") await window.set_header(); } catch (e) { console.warn(e); }
    try { if (typeof window.set_footer === "function") await window.set_footer(); } catch (e) { console.warn(e); }
    try { if (typeof window.sg_init_i18n === "function") window.sg_init_i18n(); } catch (e) { console.warn(e); }
    try { if (typeof window.sg_apply_workbench_links === "function") window.sg_apply_workbench_links(); } catch (e) {}

    window.setTimeout(callSetMain, 0);
    window.setTimeout(removeBootClass, 120);
  }

  ready(boot);
})();
