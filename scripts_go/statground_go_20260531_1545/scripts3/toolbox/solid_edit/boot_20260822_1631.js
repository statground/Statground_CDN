(function bootStatgroundSolidEditDemo() {
  "use strict";

  window.CONTENT_EDITOR_AUTOSTART = false;
  window.CONTENT_EDITOR_AUTOINIT = false;

  var currentScript = document.currentScript;
  if (!currentScript || !currentScript.src) {
    return;
  }

  try {
    var styleURL = new URL("highlight_20260822_1631.css", currentScript.src);
    if (styleURL.origin === window.location.origin) {
      window.CONTENT_EDITOR_HLJS_STYLE_HREF = styleURL.href;
    }
  } catch (_) {
    // SolidEdit retains its built-in code highlighting if URL resolution fails.
  }
})();
