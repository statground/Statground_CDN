/**
 * scripts3/workbench/index/main.js
 * - Workbench main (React, Babel)
 * - Depends on window.sg_workbench_i18n (loaded before this file)
 *
 * Routing rule:
 * - URL prefix (/<lang>/...) is the SSOT for direct navigation.
 * - When user selects a language in the global language modal, localStorage('sg_lang') changes.
 *   In that case, we redirect by replacing URL prefix to the selected language (so routing stays consistent).
 *
 * Fixes in this version:
 * 1) Direct navigation to /en/... stays in en (storage is aligned to URL on mount; no redirect to old storage).
 * 2) Language modal selection works again: we detect storage change and redirect URL prefix to match.
 * 3) Dark mode CTA readability: always high-contrast (bg-slate-900 text-white).
 */



/* ==== Statground Workbench Dark Theme Fallback (main.js-only) =========================
 * Why: When using Tailwind CDN, dark:* utilities inside external JS may not be generated.
 * This fallback ensures Workbench main cards/badges/panels match Book Workbench dark tone.
 * Scope: only active when <html class="dark">.
 * =================================================================================== */
(function sg_workbench_dark_fallback_init(){
  try{
    if (document.getElementById('sg-workbench-main-dark-fallback')) return;
    const css = `
/* Base page tone */
html.dark body{
  background-color:#020617 !important;
  color:#e5e7eb !important;
  color-scheme: dark;
}
/* Surfaces that were bg-white/70 or bg-white/80 */
html.dark .bg-white\\/70, html.dark .bg-white\\/80{
  background-color: rgba(2,6,23,0.35) !important; /* ~ slate-950/35 */
}
html.dark .dark\\:bg-slate-900\\/70, html.dark .dark\\:bg-slate-900\\/80{
  background-color: rgba(2,6,23,0.35) !important; /* in case tailwind generates it, keep consistent */
}
/* Borders */
html.dark .border-slate-200, html.dark .border-slate-300{
  border-color: rgba(30,41,59,0.7) !important; /* ~ slate-800/70 */
}
html.dark .dark\\:border-slate-700, html.dark .dark\\:border-slate-800{
  border-color: rgba(30,41,59,0.7) !important;
}
/* Text colors */
html.dark .text-slate-700, html.dark .text-slate-800{
  color: #cbd5e1 !important; /* slate-300 */
}
html.dark .text-slate-600{
  color:#94a3b8 !important; /* slate-400 */
}
/* Buttons/links that were dark on light */
html.dark .text-slate-900{
  color:#e5e7eb !important;
}
/* Card hover (avoid bright hover) */
html.dark a.group.block:hover, html.dark .group.block:hover{
  background-color: rgba(15,23,42,0.40) !important; /* ~ slate-900/40 */
}
/* Badge chips */
html.dark .rounded-full.bg-white\\/70{
  background-color: rgba(2,6,23,0.35) !important;
}
/* Hero glass panel inner gradient overlays (keep subtle) */
html.dark .absolute.inset-0.pointer-events-none .blur-3xl{
  opacity: 0.35 !important;
}
`;
    const style = document.createElement('style');
    style.id = 'sg-workbench-main-dark-fallback';
    style.textContent = css;
    document.head.appendChild(style);
    // Debug marker (safe)
    console.log('[Statground] workbench main dark fallback: enabled');
  }catch(e){
    console.warn('[Statground] workbench main dark fallback failed', e);
  }
})();

function set_main() {
  const rootEl = document.getElementById("div_main");
  if (!rootEl) return;

  const WB = window.sg_workbench_i18n || null;

  const getAllowedLangSet = () => {
    try {
      const arr = (WB && Array.isArray(WB.languages)) ? WB.languages : [];
      return new Set(arr.map(x => x && x.code).filter(Boolean));
    } catch (e) {
      return new Set();
    }
  };

  const ALLOW = getAllowedLangSet();

  const resolve = (code) => {
    if (WB && typeof WB.resolveLangCode === "function") return WB.resolveLangCode(code);
    return code;
  };

  const getUrlPrefixLang = () => {
    const seg = (location.pathname || "/").split("/").filter(Boolean);
    const maybe = seg[0] || null;
    if (!maybe) return null;
    const v = resolve(maybe);
    if (ALLOW.size > 0) return ALLOW.has(v) ? v : null;
    return v;
  };

  const getStorageLang = () => {
    try {
      const v = localStorage.getItem("sg_lang");
      if (!v) return null;
      const vv = resolve(v);
      if (ALLOW.size > 0 && !ALLOW.has(vv)) return null;
      return vv;
    } catch (e) {
      return null;
    }
  };

  // ✅ For rendering: URL prefix first (because routing is prefix-based)
  const getLangForRender = () => {
    const fromPath = getUrlPrefixLang();
    if (fromPath) return fromPath;

    const fromStorage = getStorageLang();
    if (fromStorage) return fromStorage;

    const fromHtml = (() => {
      try {
        const v = document.documentElement.getAttribute("lang");
        return v ? resolve(v) : null;
      } catch (e) {
        return null;
      }
    })();

    const lang = fromHtml || "en";
    if (ALLOW.size > 0 && !ALLOW.has(lang)) return "en";
    return lang;
  };

  const t = (lang, key) => (WB && typeof WB.t === "function") ? WB.t(lang, key) : key;

  const applyLangToUrl = (newLang) => {
    if (!newLang) return;
    if (ALLOW.size > 0 && !ALLOW.has(newLang)) return;

    const seg = (location.pathname || "/").split("/").filter(Boolean);
    if (seg.length === 0) return;

    seg[0] = newLang;

    const next = "/" + seg.join("/") + (location.search || "") + (location.hash || "");
    const curr = (location.pathname || "/") + (location.search || "") + (location.hash || "");
    if (next !== curr) location.href = next;
  };

  const Badge = ({ children }) => (
    <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">
      {children}
    </span>
  );

  const Card = ({ href, title, desc, icon, cta }) => (
    <a
      href={href}
      className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-200">
            {icon}
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </div>
            <div className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {desc}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {/* High-contrast CTA for both light/dark */}
          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-extrabold group-hover:opacity-90 transition">
            {cta}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );

  const IconBook = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path strokeWidth="2" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path strokeWidth="2" d="M8 6h8" />
      <path strokeWidth="2" d="M8 10h8" />
    </svg>
  );

  const App = () => {
    const [lang, setLang] = React.useState(getLangForRender());

    // ✅ On mount: align storage to URL prefix (SSOT) — no redirects.
    React.useEffect(() => {
      const prefix = getUrlPrefixLang();
      if (prefix) {
        try { localStorage.setItem("sg_lang", prefix); } catch (e) {}
        setLang(prefix);
      }
    }, []);

    // RTL support
    React.useEffect(() => {
      const rtl = (WB && typeof WB.isRtl === "function") ? WB.isRtl(lang) : (lang === "ar" || lang === "he");
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
    }, [lang]);

    // ✅ Detect language modal selection:
    // - When localStorage changes to a different language than URL prefix,
    //   redirect by replacing the URL prefix.
    React.useEffect(() => {
      const tick = () => {
        const prefix = getUrlPrefixLang() || lang;
        const storageLang = getStorageLang();

        // If storageLang exists and differs from URL prefix, user likely selected language in modal.
        if (storageLang && storageLang !== prefix) {
          applyLangToUrl(storageLang); // will navigate (reload)
          return;
        }

        // Otherwise, just keep render language in sync with prefix (SSOT)
        const renderLang = getLangForRender();
        setLang((prev) => (prev === renderLang ? prev : renderLang));
      };

      // 1) Hook modal list clicks (same-tab)
      const list = document.getElementById("lang-modal-list");
      const onClick = () => setTimeout(tick, 0);
      if (list) list.addEventListener("click", onClick);

      // 2) Poll fallback
      const timer = setInterval(tick, 400);

      // 3) Storage event (other tabs)
      const onStorage = (e) => {
        if (e && e.key === "sg_lang") tick();
      };
      window.addEventListener("storage", onStorage);

      return () => {
        if (list) list.removeEventListener("click", onClick);
        clearInterval(timer);
        window.removeEventListener("storage", onStorage);
      };
    }, [lang]);

    const bookHref = `/${lang}/workbench/book/`;

    return (
      <div className="w-full">
        <div className="max-w-6xl mx-auto px-2 md:px-0">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-slate-200/40 dark:bg-slate-800/40 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-slate-200/30 dark:bg-slate-800/30 blur-3xl" />
            </div>

            <div className="relative p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge>{t(lang, "wb.badge")}</Badge>
                <Badge>Lang: {lang}</Badge>
              </div>

              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {t(lang, "wb.title")}
              </h1>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl">
                {t(lang, "wb.subtitle")}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card
              href={bookHref}
              title={t(lang, "wb.card.book.title")}
              desc={t(lang, "wb.card.book.desc")}
              icon={IconBook}
              cta={t(lang, "wb.cta.open")}
            />
          </div>
        </div>
      </div>
    );
  };

  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}

window.set_main = set_main;
