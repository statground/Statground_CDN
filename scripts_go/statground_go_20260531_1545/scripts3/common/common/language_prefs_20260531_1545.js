(function () {
  const KEY = "sg_lang";
  const COOKIE = "sg_lang";
  const SUPPORTED = [
    "ko", "en", "ja", "zh-Hans", "zh-Hant", "es", "fr", "de", "pt-BR",
    "ru", "id", "vi", "th", "ms", "fil", "hi", "ar", "it", "nl", "pl",
    "sv", "tr", "uk"
  ];

  function resolveLangCode(code) {
    if (!code) return "";
    const raw = String(code).trim();
    if (!raw) return "";
    const lower = raw.toLowerCase();
    if (lower === "zh" || lower.indexOf("zh-") === 0) {
      if (lower.includes("tw") || lower.includes("hk") || lower.includes("mo") || lower.includes("hant")) return "zh-Hant";
      return "zh-Hans";
    }
    if (lower === "tl" || lower.indexOf("tl-") === 0 || lower === "fil" || lower.indexOf("fil-") === 0) return "fil";
    if (lower === "pt" || lower.indexOf("pt-") === 0) return "pt-BR";
    const exact = SUPPORTED.find((lang) => lang.toLowerCase() === lower);
    if (exact) return exact;
    const family = SUPPORTED.find((lang) => lower.indexOf(lang.toLowerCase() + "-") === 0);
    return family || "";
  }

  function cookieValue(name) {
    try {
      return document.cookie.split(";").map((v) => v.trim()).reduce((found, part) => {
        if (found) return found;
        const prefix = name + "=";
        return part.indexOf(prefix) === 0 ? decodeURIComponent(part.slice(prefix.length)) : "";
      }, "");
    } catch (e) {
      return "";
    }
  }

  function persist(lang) {
    const resolved = resolveLangCode(lang);
    if (!resolved) return "";
    try { localStorage.setItem(KEY, resolved); } catch (e) {}
    try {
      document.cookie = COOKIE + "=" + encodeURIComponent(resolved) + "; Path=/; Max-Age=31536000; SameSite=Lax";
    } catch (e) {}
    return resolved;
  }

  function pathLang() {
    try {
      const first = (location.pathname || "").split("/").filter(Boolean)[0] || "";
      return resolveLangCode(first);
    } catch (e) {
      return "";
    }
  }

  function storageLang() {
    try { return resolveLangCode(localStorage.getItem(KEY)); } catch (e) { return ""; }
  }

  function htmlLang() {
    try { return resolveLangCode(document.documentElement.getAttribute("lang")); } catch (e) { return ""; }
  }

  function browserLang() {
    try { return resolveLangCode(navigator.language || ""); } catch (e) { return ""; }
  }

  function currentLang() {
    return pathLang() || storageLang() || resolveLangCode(cookieValue(COOKIE)) || htmlLang() || browserLang() || "ko";
  }

  function applyDocumentLang(lang) {
    const resolved = resolveLangCode(lang) || "ko";
    const root = document.documentElement;
    const rtl = resolved === "ar" || resolved === "he";
    if (root) {
      root.setAttribute("lang", resolved);
      root.setAttribute("dir", rtl ? "rtl" : "ltr");
    }
    return resolved;
  }

  window.sg_supported_langs = SUPPORTED.slice();
  window.sg_resolve_lang_code = resolveLangCode;
  window.sg_get_current_lang = currentLang;
  window.sg_set_current_lang = function (lang) {
    const resolved = persist(lang);
    if (!resolved) return "";
    applyDocumentLang(resolved);
    try { window.dispatchEvent(new CustomEvent("sg_lang_changed", { detail: { lang: resolved } })); } catch (e) {}
    return resolved;
  };

  if (!window.__sgLangSetItemHooked) {
    window.__sgLangSetItemHooked = true;
    try {
      const original = localStorage.setItem.bind(localStorage);
      localStorage.setItem = function (key, value) {
        original(key, value);
        if (String(key || "") !== KEY) return;
        const resolved = resolveLangCode(value);
        if (!resolved) return;
        try {
          document.cookie = COOKIE + "=" + encodeURIComponent(resolved) + "; Path=/; Max-Age=31536000; SameSite=Lax";
        } catch (e) {}
        applyDocumentLang(resolved);
        try { window.dispatchEvent(new CustomEvent("sg_lang_changed", { detail: { lang: resolved } })); } catch (e) {}
      };
    } catch (e) {}
  }

  applyDocumentLang(persist(currentLang()));
})();
