(function () {
  "use strict";

  var reloading = false;

  function renderedLanguage() {
    var root = document.querySelector("[data-toolbox-language]");
    if (!root) return "";
    return String(root.getAttribute("data-toolbox-language") || "").trim();
  }

  window.addEventListener("sg_lang_changed", function (event) {
    if (reloading) return;
    var next = event && event.detail ? String(event.detail.lang || "").trim() : "";
    var rendered = renderedLanguage();
    if (!next || !rendered || next === rendered) return;
    reloading = true;
    window.location.reload();
  });
})();
