(function (global) {
  "use strict";
  var selector = "code[data-toolbox-code]";
  var keywords = new Set("async await break case catch class const continue default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while with yield".split(" "));

  // Tokens retain every source character. DOM nodes are always created as text.
  function tokens(source, language) {
    source = String(source);
    var result = [];
    function add(kind, value) { if (value) result.push({ kind: kind, text: value }); }
    function script(text, css) {
      var pattern = /\/\*[\s\S]*?(?:\*\/|$)|\/\/[^\n]*|"(?:\\[\s\S]|[^"\\])*(?:"|$)|'(?:\\[\s\S]|[^'\\])*(?:'|$)|`(?:\\[\s\S]|[^`\\])*(?:`|$)|(?:0[xX][0-9a-fA-F]+|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|[\p{L}_$][\p{L}\p{N}_$-]*|\s+|./gu;
      var match;
      while ((match = pattern.exec(text))) {
        var value = match[0], kind = "";
        if (/^\/[/\*]/.test(value)) kind = "comment";
        else if (/^["'`]/.test(value)) kind = /^\s*:/.test(text.slice(pattern.lastIndex)) ? "property" : "string";
        else if (/^\d/.test(value)) kind = "number";
        else if (keywords.has(value)) kind = "keyword";
        else if (/^[\p{L}_$]/u.test(value)) { if (/^\s*:/.test(text.slice(pattern.lastIndex))) kind = "property"; }
        else if (!/^\s+$/.test(value)) kind = "punctuation";
        add(kind, value);
      }
    }
    if (!/^(html|xml|markup)$/.test(language)) { script(source, language === "css"); return result; }
    var pattern = /<!--[\s\S]*?(?:-->|$)|<![^>]*>|<\/?[A-Za-z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>|[^<]+|</g;
    var match, embedded = "";
    while ((match = pattern.exec(source))) {
      var value = match[0];
      if (value.indexOf("<!--") === 0) { add("comment", value); continue; }
      if (value[0] !== "<" || value.length === 1) { if (embedded) script(value, embedded === "style"); else add("", value); continue; }
      var tagName = /^<\/?([A-Za-z][\w:-]*)/.exec(value);
      var tagPattern = /"[^"]*"|'[^']*'|[A-Za-z_][\w:-]*|\s+|./g;
      var part, first = true;
      while ((part = tagPattern.exec(value))) {
        var bit = part[0], kind = "punctuation";
        if (/^["']/.test(bit)) kind = "string";
        else if (/^\s+$/.test(bit)) kind = "";
        else if (/^[A-Za-z_]/.test(bit)) { kind = first ? "tag" : "property"; first = false; }
        add(kind, bit);
      }
      if (tagName && /^(script|style)$/i.test(tagName[1])) embedded = value[1] === "/" ? "" : tagName[1].toLowerCase();
    }
    return result;
  }

  function start(document) {
    var overview = document.querySelector('[data-solid-edit-section="overview"]');
    if (overview && global.location) {
      var hash = global.location.hash;
      var routes = { "#playground": "demo/", "#output": "demo/#output", "#features": "guide/", "#integration": "setup/", "#setup": "setup/#setup", "#api": "setup/#api" };
      var destination = routes[hash] || (/^#api-/.test(hash) ? "setup/" + hash : "");
      if (destination) { global.location.replace("/toolbox/solid-edit/" + destination); return; }
    }
    document.querySelectorAll("[data-toolbox-copy]").forEach(function (button) {
      button.addEventListener("click", function () {
        var code = document.getElementById(button.dataset.toolboxCopy);
        var status = document.getElementById(button.dataset.copyStatus);
        if (!code) return;
        function feedback(success) {
          if (status) status.textContent = success ? button.dataset.copySuccess : button.dataset.copyError;
          if (!success) {
            var range = document.createRange(); range.selectNodeContents(code);
            var selection = global.getSelection(); selection.removeAllRanges(); selection.addRange(range);
          }
        }
        try {
          if (!global.navigator.clipboard || !global.navigator.clipboard.writeText) { feedback(false); return; }
          global.navigator.clipboard.writeText(code.textContent).then(function () { feedback(true); }, function () { feedback(false); });
        } catch (_) { feedback(false); }
      });
    });
    var cache = new WeakMap();
    function highlight(element) {
      var source = element.textContent, language = element.dataset.toolboxCode;
      var previous = cache.get(element);
      if (previous && previous.source === source && previous.language === language && previous.firstChild === element.firstChild) return;
      cache.set(element, { source: source, language: language });
      if (!source || source.length > 262144) return;
      var fragment = document.createDocumentFragment();
      tokens(source, language).forEach(function (token) {
        var node = document.createTextNode(token.text);
        if (token.kind) {
          var span = document.createElement("span");
          span.className = "sg-code-" + token.kind;
          span.appendChild(node); node = span;
        }
        fragment.appendChild(node);
      });
      element.replaceChildren(fragment);
      cache.set(element, { source: source, language: language, firstChild: element.firstChild });
    }
    var nodes = document.querySelectorAll(selector);
    nodes.forEach(highlight);
    if (!global.MutationObserver) return;
    var observer = new global.MutationObserver(function (mutations) {
      var changed = new Set();
      mutations.forEach(function (mutation) {
        var target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
        var code = target && target.closest(selector);
        if (code) changed.add(code);
      });
      changed.forEach(highlight);
    });
    nodes.forEach(function (code) { observer.observe(code, { childList: true, characterData: true, subtree: true }); });
  }
  if (typeof module === "object" && module.exports) module.exports = { tokens: tokens };
  if (!global.document) return;
  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", function () { start(global.document); }, { once: true });
  else start(global.document);
})(typeof window === "object" ? window : globalThis);
