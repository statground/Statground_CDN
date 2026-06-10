(function () {
  const body = document.body;
  if (!body || !body.dataset || !body.dataset.legalLang) {
    return;
  }

  let pendingReload = false;
  window.addEventListener("sg_lang_changed", function (event) {
    if (pendingReload) {
      return;
    }
    const nextLang = event && event.detail && event.detail.lang ? String(event.detail.lang) : "";
    const currentLang = String(body.dataset.legalLang || "");
    if (!nextLang || nextLang === currentLang) {
      return;
    }
    pendingReload = true;
    window.location.reload();
  });
})();
