(function initStatgroundSolidEditManualDemo() {
  "use strict";

  if (window.__STATGROUND_SOLID_EDIT_MANUAL_DEMO_20260822_1631__) {
    return;
  }
  window.__STATGROUND_SOLID_EDIT_MANUAL_DEMO_20260822_1631__ = true;

  function start() {
    var mount = document.getElementById("solid-edit-demo-mount");
    var source = document.getElementById("solid-edit-demo-source");
    var status = document.getElementById("solid-edit-demo-status");
    var error = document.getElementById("solid-edit-demo-error");
    var fullButton = document.getElementById("solid-edit-demo-mode-full");
    var miniButton = document.getElementById("solid-edit-demo-mode-mini");
    var htmlButton = document.getElementById("solid-edit-demo-show-html");
    var markdownButton = document.getElementById("solid-edit-demo-show-markdown");
    var resetButton = document.getElementById("solid-edit-demo-reset");
    var output = document.getElementById("solid-edit-demo-output");
    var code = document.getElementById("solid-edit-demo-code");

    if (!mount || !source) {
      return;
    }

    var copy = {
      loading: mount.dataset.copyLoading || "Loading SolidEdit demo…",
      readyFull: mount.dataset.copyReadyFull || "Full editor ready",
      readyMini: mount.dataset.copyReadyMini || "Mini editor ready",
      runtimeError: mount.dataset.copyRuntimeError || "The editor demo could not be loaded. Please refresh the page and try again.",
      outputEmpty: mount.dataset.copyOutputEmpty || "The editor is empty.",
      placeholder: mount.dataset.copyPlaceholder || source.getAttribute("placeholder") || "Write your content here."
    };
    var lang = String(mount.dataset.lang || document.documentElement.lang || "en").trim() || "en";
    var storageKey = "statground:toolbox:solid-edit:demo:20260822:" + lang;
    var initialHTML = source.value || "";
    var editor = null;
    var mode = mount.dataset.initialMode === "mini" ? "mini" : "full";
    var outputMode = "html";
    var switching = false;
    var outputFrame = 0;

    if (!mount.contains(source)) {
      mount.appendChild(source);
    }

    function setText(element, value) {
      if (element) {
        element.textContent = String(value == null ? "" : value);
      }
    }

    function setPressed(button, pressed) {
      if (!button) {
        return;
      }
      button.setAttribute("aria-pressed", pressed ? "true" : "false");
      button.dataset.active = pressed ? "true" : "false";
    }

    function setBusy(busy) {
      [fullButton, miniButton, htmlButton, markdownButton, resetButton].forEach(function (button) {
        if (button) {
          button.disabled = !!busy;
        }
      });
      mount.setAttribute("aria-busy", busy ? "true" : "false");
    }

    function showError() {
      if (error) {
        error.hidden = false;
        setText(error, copy.runtimeError);
      }
      setText(status, copy.runtimeError);
      mount.dataset.ready = "false";
      setBusy(false);
    }

    function clearError() {
      if (error) {
        error.hidden = true;
        setText(error, "");
      }
    }

    function currentHTML() {
      if (editor && typeof editor.getHTML === "function") {
        try {
          return String(editor.getHTML() || "");
        } catch (_) {
          // Fall through to the mirrored textarea value.
        }
      }
      return String(source.value || "");
    }

    function currentMarkdown() {
      if (editor && typeof editor.getMarkdown === "function") {
        try {
          return String(editor.getMarkdown() || "");
        } catch (_) {
          // Fall through to the HTML source when conversion is unavailable.
        }
      }
      return currentHTML();
    }

    function renderOutput() {
      outputFrame = 0;
      if (!output) {
        return;
      }
      var value = outputMode === "markdown" ? currentMarkdown() : currentHTML();
      output.textContent = value || copy.outputEmpty;
    }

    function scheduleOutput() {
      if (outputFrame) {
        return;
      }
      outputFrame = window.requestAnimationFrame(renderOutput);
    }

    function renderCode() {
      if (!code) {
        return;
      }
      var lines = [
        "const editor = window.mountContentEditor(\"#solid-edit-demo-source\", {",
        "  placeholder: " + JSON.stringify(copy.placeholder) + ",",
        "  restoreDraft: false,",
        "  storageKey: " + JSON.stringify(storageKey) + ",",
        "  lang: " + JSON.stringify(lang)
      ];
      if (mode === "mini") {
        lines[lines.length - 1] += ",";
        lines.push("  toolbarSize: \"mini\"");
      }
      lines.push("});");
      code.textContent = lines.join("\n");
    }

    function syncControls() {
      setPressed(fullButton, mode === "full");
      setPressed(miniButton, mode === "mini");
      setPressed(htmlButton, outputMode === "html");
      setPressed(markdownButton, outputMode === "markdown");
      mount.dataset.mode = mode;
      renderCode();
    }

    function destroyEditor() {
      var html = currentHTML();
      source.value = html;
      if (editor && typeof window.destroyLocalRichEditor === "function") {
        try {
          window.destroyLocalRichEditor(editor);
        } catch (_) {
          // The source textarea remains available as the non-JavaScript fallback.
        }
      }
      editor = null;
      return html;
    }

    function mountEditor(html) {
      if (typeof window.mountContentEditor !== "function") {
        showError();
        return false;
      }

      var options = {
        placeholder: copy.placeholder,
        restoreDraft: false,
        storageKey: storageKey,
        lang: lang,
        html: String(html || "")
      };
      if (mode === "mini") {
        options.toolbarSize = "mini";
      }

      source.value = options.html;
      try {
        editor = window.mountContentEditor(source, options);
        if (!editor || !editor.root) {
          throw new Error("SolidEdit mount returned no editor instance");
        }
      } catch (_) {
        editor = null;
        showError();
        return false;
      }

      clearError();
      mount.dataset.ready = "true";
      setText(status, mode === "mini" ? copy.readyMini : copy.readyFull);
      syncControls();
      scheduleOutput();
      return true;
    }

    function switchMode(nextMode) {
      if (switching || (nextMode !== "full" && nextMode !== "mini")) {
        return;
      }
      if (editor && nextMode === mode) {
        return;
      }
      switching = true;
      setBusy(true);
      setText(status, copy.loading);
      var html = destroyEditor();
      mode = nextMode;
      syncControls();
      mountEditor(html);
      setBusy(false);
      switching = false;
    }

    function showOutput(nextMode) {
      outputMode = nextMode === "markdown" ? "markdown" : "html";
      syncControls();
      renderOutput();
    }

    function resetDemo() {
      try {
        window.localStorage.removeItem(storageKey);
      } catch (_) {
        // The demo still resets in memory when storage is unavailable.
      }
      source.value = initialHTML;
      if (editor && typeof editor.setHTML === "function") {
        try {
          editor.setHTML(initialHTML);
        } catch (_) {
          destroyEditor();
          source.value = initialHTML;
          mountEditor(initialHTML);
        }
      }
      scheduleOutput();
    }

    if (fullButton) {
      fullButton.addEventListener("click", function () {
        switchMode("full");
      });
    }
    if (miniButton) {
      miniButton.addEventListener("click", function () {
        switchMode("mini");
      });
    }
    if (htmlButton) {
      htmlButton.addEventListener("click", function () {
        showOutput("html");
      });
    }
    if (markdownButton) {
      markdownButton.addEventListener("click", function () {
        showOutput("markdown");
      });
    }
    if (resetButton) {
      resetButton.addEventListener("click", resetDemo);
    }
    source.addEventListener("input", scheduleOutput);

    window.addEventListener("pagehide", function () {
      if (outputFrame) {
        window.cancelAnimationFrame(outputFrame);
        outputFrame = 0;
      }
      destroyEditor();
    });
    window.addEventListener("pageshow", function (event) {
      if (event.persisted && !editor) {
        mountEditor(source.value || initialHTML);
      }
    });

    setBusy(true);
    setText(status, copy.loading);
    syncControls();
    mountEditor(initialHTML);
    setBusy(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
