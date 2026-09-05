(function bootSolidEditProduct(window) {
  "use strict";
  window.CONTENT_EDITOR_AUTOSTART = false;
  window.CONTENT_EDITOR_AUTOINIT = false;
  window.CONTENT_EDITOR_MATHJAX_CDN_URL = "https://cdn.jsdelivr.net/gh/mathjax/MathJax@600692ad9d3552cc25f85510d5797bc942ecc9f7/es5/tex-svg.js";
  window.CONTENT_EDITOR_MATHJAX_BUNDLE_URL = window.CONTENT_EDITOR_MATHJAX_CDN_URL;
  window.CONTENT_EDITOR_HLJS_SCRIPT_SRC = "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@91724c0adaf7bea7e5c5c85e4ea1d672f6c0ed23/build/highlight.min.js";
  // Initialize the cache before SolidEdit's SVG rendering requests use it.
  window.MathJax = {
    tex: { inlineMath: [], displayMath: [["$$", "$$"], ["\\[", "\\]"]], processEscapes: true },
    svg: { fontCache: "global" },
    startup: { typeset: false },
    options: { enableMenu: false, skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"] }
  };
  var script = document.currentScript;
  if (!script || !script.src) return;
  try {
    var css = new URL("highlight_20260822_1631.css", script.src);
    if (css.origin === window.location.origin) window.CONTENT_EDITOR_HLJS_STYLE_HREF = css.href;
  } catch (_) { /* The editor retains its built-in highlighting styles. */ }
})(window);
