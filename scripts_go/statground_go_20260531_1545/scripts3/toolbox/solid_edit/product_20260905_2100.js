(function solidEditProduct(global) {
  "use strict";

  function revealHash(document, hash) {
    var id;
    try { id = decodeURIComponent(String(hash || "").replace(/^#/, "")); } catch (_) { return; }
    var target = id && document.getElementById(id);
    if (!target) return;
    var parent = target;
    while (parent) {
      if (String(parent.tagName).toLowerCase() === "details") parent.open = true;
      parent = parent.parentElement;
    }
    if (typeof target.scrollIntoView === "function") target.scrollIntoView({ block: "start" });
  }

  function initProduct(document, window) {
    function byID(id) { return document.getElementById(id); }
    function text(element, value) { if (element) element.textContent = String(value == null ? "" : value); }
    var mount = byID("solid-edit-demo-mount");
    var source = byID("solid-edit-demo-source");
    if (!mount || !source || mount.dataset.productInitialized === "true") return;
    mount.dataset.productInitialized = "true";

    var status = byID("solid-edit-demo-status");
    var error = byID("solid-edit-demo-error");
    var fullButton = byID("solid-edit-demo-mode-full");
    var miniButton = byID("solid-edit-demo-mode-mini");
    var htmlButton = byID("solid-edit-demo-show-html");
    var markdownButton = byID("solid-edit-demo-show-markdown");
    var resetButton = byID("solid-edit-demo-reset");
    var copyButton = byID("solid-edit-demo-copy");
    var downloadButton = byID("solid-edit-demo-download");
    var setupCopyButton = byID("solid-edit-setup-copy");
    var output = byID("solid-edit-demo-output");
    var code = byID("solid-edit-demo-code");
    var count = byID("solid-edit-demo-count");
    var actionStatus = byID("solid-edit-action-status");
    var confirmation = byID("solid-edit-confirm");
    var applyButton = byID("solid-edit-confirm-apply");
    var cancelButton = byID("solid-edit-confirm-cancel");
    var sampleButtons = Array.prototype.slice.call(document.querySelectorAll("[data-solid-edit-sample]"));
    var controls = [fullButton, miniButton, htmlButton, markdownButton, resetButton, copyButton, downloadButton].concat(sampleButtons);
    var defaults = {
      loading: "Loading the editor…", readyFull: "Full editor ready", readyMini: "Compact editor ready",
      runtimeError: "The editor could not load. Refresh the page to try again.", outputEmpty: "The document is empty.",
      placeholder: "Start writing here.", copied: "Copied.", copyError: "Select the code and copy it manually.",
      downloaded: "Download started.", downloadError: "The download could not start. Try copying the result.",
      sampleLoaded: "Opened {title}.", resetDone: "The sample has been restored.",
      confirmReplace: "Replace your changes with the sample?", characterCount: "{count} characters"
    };
    var copy = {};
    Object.keys(defaults).forEach(function (key) {
      copy[key] = mount.dataset["copy" + key.charAt(0).toUpperCase() + key.slice(1)] || defaults[key];
    });
    var lang = String(mount.dataset.lang || document.documentElement.lang || "en");
    var storageKey = "statground:toolbox:solid-edit:product:20260905:" + lang;
    var initialHTML = String(source.value || "");
    var editor = null;
    var mode = mount.dataset.initialMode === "mini" ? "mini" : "full";
    var outputMode = "html";
    var currentSample = sampleButtons.length ? sampleButtons[0].dataset.solidEditSample : "article";
    var dirty = false;
    var applyingSample = false;
    var outputFrame = 0;
    var rendererTimer = 0;
    var pending = null;
    var switching = false;

    if (!mount.contains(source)) mount.appendChild(source);

    function pressed(button, active) {
      if (!button) return;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.dataset.active = active ? "true" : "false";
    }
    function busy(value) {
      controls.forEach(function (button) { if (button) button.disabled = value; });
      mount.setAttribute("aria-busy", value ? "true" : "false");
    }
    function showError() {
      if (error) error.hidden = false;
      text(error, copy.runtimeError);
      text(status, copy.runtimeError);
      mount.dataset.ready = "false";
    }
    function currentHTML() {
      if (editor && typeof editor.getHTML === "function") {
        try { return String(editor.getHTML() || ""); } catch (_) { /* Keep the mirrored source available. */ }
      }
      return String(source.value || "");
    }
    function currentOutput() {
      if (outputMode === "html") return currentHTML();
      if (!editor || typeof editor.getMarkdown !== "function") throw new Error("Markdown is unavailable");
      return String(editor.getMarkdown() || "");
    }
    function renderOutput() {
      outputFrame = 0;
      // Earlier editor callbacks may repaint code with the offline highlighter.
      // Refresh through the supported renderer after those callbacks settle.
      if (editor && typeof editor.renderAllCodeBlocks === "function") {
        try { editor.renderAllCodeBlocks(); } catch (_) { /* Keep the source copy available if rendering fails. */ }
      }
      // Math images must contain their glyph paths instead of referencing page-only caches.
      var mathOutput = window.MathJax && window.MathJax.startup && window.MathJax.startup.output;
      if (mathOutput && mathOutput.options && mathOutput.options.fontCache !== "none") {
        mathOutput.options.fontCache = "none";
        if (editor && typeof editor.renderAllMath === "function" && editor.editor && editor.editor.querySelector(".lre-math-node")) {
          try { editor.renderAllMath(true); } catch (_) { /* The editor keeps the original TeX available. */ }
        }
      }
      try { text(output, currentOutput() || copy.outputEmpty); }
      catch (_) { text(output, copy.runtimeError); }
      var value = editor && editor.editor ? String(editor.editor.textContent || "") : "";
      text(count, copy.characterCount.replace("{count}", String(Array.from(value).length)));
    }
    function scheduleOutput() {
      if (!outputFrame) outputFrame = window.requestAnimationFrame(renderOutput);
    }
    function scheduleRendererRefresh() {
      if (rendererTimer) window.clearTimeout(rendererTimer);
      rendererTimer = window.setTimeout(function () {
        rendererTimer = 0;
        renderOutput();
      }, 250);
    }
    function observeEdit(event) {
      // Rendered math, captions and selection markers can change HTML without an edit.
      // Latch actual edits before the library's autosave clears its dirty state.
      var target = event && event.target;
      var bodyInput = event && event.type === "input" && editor && editor.editor &&
        (target === editor.editor || (typeof editor.editor.contains === "function" && editor.editor.contains(target)));
      if (!applyingSample && ((!editor && target === source) || bodyInput || (editor && editor.state && editor.state.dirty))) dirty = true;
      scheduleOutput();
      if (target !== source) scheduleRendererRefresh();
    }
    function syncControls() {
      pressed(fullButton, mode === "full");
      pressed(miniButton, mode === "mini");
      pressed(htmlButton, outputMode === "html");
      pressed(markdownButton, outputMode === "markdown");
      sampleButtons.forEach(function (button) { pressed(button, button.dataset.solidEditSample === currentSample); });
      mount.dataset.mode = mode;
      mount.dataset.sample = currentSample;
      var options = ["  lang: " + JSON.stringify(lang), "  restoreDraft: false"];
      if (mode === "mini") options.push("  toolbarSize: \"mini\"");
      text(code, "const editor = window.mountContentEditor(\"#content\", {\n" + options.join(",\n") + "\n});");
    }
    function updateSampleLabel() {
      var button = sampleButtons.filter(function (item) { return item.dataset.solidEditSample === currentSample; })[0];
      if (!button) return;
      text(byID("solid-edit-demo-document-title"), button.dataset.title);
      text(byID("solid-edit-demo-description"), button.dataset.description);
    }
    function destroyEditor() {
      var html = currentHTML();
      source.value = html;
      if (editor && typeof window.destroyLocalRichEditor === "function") {
        try { window.destroyLocalRichEditor(editor); } catch (_) { /* The textarea still holds the user's work. */ }
      }
      editor = null;
      return html;
    }
    function mountEditor(html) {
      source.value = String(html || "");
      var wasApplying = applyingSample;
      applyingSample = true;
      try {
        if (typeof window.mountContentEditor !== "function") throw new Error("Editor is unavailable");
        var options = { placeholder: copy.placeholder, lang: lang, html: source.value, restoreDraft: false, storageKey: storageKey };
        if (mode === "mini") options.toolbarSize = "mini";
        editor = window.mountContentEditor(source, options);
        if (!editor || !editor.root) throw new Error("Editor did not mount");
        ["input", "change", "click", "keyup"].forEach(function (name) { editor.root.addEventListener(name, observeEdit); });
      } catch (_) {
        editor = null;
        showError();
        return false;
      } finally {
        applyingSample = wasApplying;
      }
      if (error) error.hidden = true;
      text(error, "");
      mount.dataset.ready = "true";
      text(status, mode === "mini" ? copy.readyMini : copy.readyFull);
      syncControls();
      scheduleOutput();
      scheduleRendererRefresh();
      return true;
    }
    function switchMode(nextMode) {
      if (switching || (editor && nextMode === mode)) return;
      switching = true;
      busy(true);
      var html = destroyEditor();
      mode = nextMode;
      mountEditor(html);
      syncControls();
      busy(false);
      switching = false;
    }
    function sampleHTML(id) {
      var templates = document.querySelectorAll("[data-solid-edit-sample-content]");
      for (var i = 0; i < templates.length; i += 1) {
        if (templates[i].dataset.solidEditSampleContent !== id) continue;
        var content = templates[i].content || templates[i];
        var textarea = content.querySelector("textarea");
        if (textarea) return String(textarea.value || "");
      }
      return initialHTML;
    }
    function replaceSample(id, reset) {
      var html = sampleHTML(id);
      applyingSample = true;
      try {
        if (!editor || typeof editor.setHTML !== "function") throw new Error("Remount required");
        editor.setHTML(html);
        source.value = currentHTML();
      } catch (_) {
        destroyEditor();
        mountEditor(html);
      } finally {
        applyingSample = false;
      }
      currentSample = id;
      dirty = false;
      syncControls();
      updateSampleLabel();
      renderOutput();
      scheduleRendererRefresh();
      var title = byID("solid-edit-demo-document-title");
      text(actionStatus, reset ? copy.resetDone : copy.sampleLoaded.replace("{title}", title ? title.textContent : id));
    }
    function closeConfirmation() {
      var action = pending;
      pending = null;
      if (confirmation) confirmation.hidden = true;
      if (action && action.trigger && typeof action.trigger.focus === "function") action.trigger.focus();
      return action;
    }
    function requestSample(id, reset, trigger) {
      if (!dirty) {
        closeConfirmation();
        replaceSample(id, reset);
        return;
      }
      pending = { id: id, reset: reset, trigger: trigger };
      if (!confirmation || !applyButton || !cancelButton) {
        text(actionStatus, copy.confirmReplace);
        return;
      }
      confirmation.hidden = false;
      text(byID("solid-edit-confirm-message"), copy.confirmReplace);
      if (typeof cancelButton.focus === "function") cancelButton.focus();
    }
    function copyFallback(element, feedback) {
      try {
        var parent = element;
        while (parent) {
          if (String(parent.tagName).toLowerCase() === "details") parent.open = true;
          parent = parent.parentElement;
        }
        var range = document.createRange();
        range.selectNodeContents(element);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (_) { /* The visible code remains available for manual copying. */ }
      text(feedback || actionStatus, copy.copyError);
    }
    function copyText(element, value, feedback) {
      if (!element) return Promise.resolve();
      var clipboard = window.navigator && window.navigator.clipboard;
      if (!clipboard || typeof clipboard.writeText !== "function") {
        copyFallback(element, feedback);
        return Promise.resolve();
      }
      try {
        return Promise.resolve(clipboard.writeText(value)).then(function () { text(feedback || actionStatus, copy.copied); }, function () { copyFallback(element, feedback); });
      } catch (_) {
        copyFallback(element, feedback);
        return Promise.resolve();
      }
    }
    function on(button, callback) { if (button) button.addEventListener("click", callback); }
    on(fullButton, function () { switchMode("full"); });
    on(miniButton, function () { switchMode("mini"); });
    on(htmlButton, function () { outputMode = "html"; syncControls(); renderOutput(); });
    on(markdownButton, function () { outputMode = "markdown"; syncControls(); renderOutput(); });
    on(resetButton, function () { requestSample(currentSample, true, resetButton); });
    on(applyButton, function () { var action = closeConfirmation(); if (action) replaceSample(action.id, action.reset); });
    on(cancelButton, closeConfirmation);
    if (confirmation) confirmation.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { event.preventDefault(); closeConfirmation(); }
    });
    sampleButtons.forEach(function (button) {
      on(button, function () {
        if (button.dataset.solidEditSample !== currentSample) requestSample(button.dataset.solidEditSample, false, button);
      });
    });
    on(copyButton, function () {
      renderOutput();
      try { return copyText(output, currentOutput()); } catch (_) { text(actionStatus, copy.runtimeError); }
    });
    on(setupCopyButton, function () {
      var setup = byID("solid-edit-setup-code");
      return copyText(setup, setup ? setup.textContent : "", byID("solid-edit-setup-status"));
    });
    on(downloadButton, function () {
      var url;
      var link;
      try {
        var value = currentOutput();
        var blob = new window.Blob([value], { type: outputMode === "markdown" ? "text/markdown;charset=utf-8" : "text/html;charset=utf-8" });
        url = window.URL.createObjectURL(blob);
        link = document.createElement("a");
        link.href = url;
        link.download = "solid-edit-" + currentSample.replace(/[^a-z0-9_-]/gi, "") + (outputMode === "markdown" ? ".md" : ".html");
        document.body.appendChild(link);
        link.click();
        text(actionStatus, copy.downloaded);
      } catch (_) { text(actionStatus, copy.downloadError); }
      finally {
        if (link) link.remove();
        if (url) window.setTimeout(function () { window.URL.revokeObjectURL(url); }, 1000);
      }
    });
    source.addEventListener("input", observeEdit);
    window.addEventListener("pagehide", function () {
      if (outputFrame) window.cancelAnimationFrame(outputFrame);
      outputFrame = 0;
      if (rendererTimer) window.clearTimeout(rendererTimer);
      rendererTimer = 0;
      destroyEditor();
      try { window.localStorage.removeItem(storageKey); } catch (_) { /* Storage may be unavailable. */ }
    });
    window.addEventListener("pageshow", function (event) {
      if (event.persisted && !editor) mountEditor(source.value);
    });
    busy(true);
    text(status, copy.loading);
    syncControls();
    updateSampleLabel();
    mountEditor(initialHTML);
    dirty = false;
    busy(false);
  }

  if (typeof module === "object" && module.exports) module.exports = { initProduct: initProduct, revealHash: revealHash };
  if (!global.document) return;
  function start() {
    initProduct(global.document, global);
    revealHash(global.document, global.location.hash);
    global.addEventListener("hashchange", function () { revealHash(global.document, global.location.hash); });
  }
  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})(typeof window === "object" ? window : globalThis);
