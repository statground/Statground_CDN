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

// --- Statground: dark-mode fallback (Tailwind CDN + external JS class scanning issue) ---
// This page renders most UI via external JS. cdn.tailwindcss.com may not generate `dark:*` utilities here.
// We apply a scoped CSS fallback so dark mode matches Book Workbench tone.
(function sg_workbench_dark_fallback_init(){
  const STYLE_ID = 'sg-workbench-dark-fallback-style';
  const css = `
    html.dark body{
      background-color:#020617 !important;
      background-image:
        radial-gradient(1000px circle at 18% 10%, rgba(59,130,246,0.14), transparent 55%),
        radial-gradient(900px circle at 82% 12%, rgba(147,51,234,0.10), transparent 55%) !important;
      background-attachment: fixed !important;
    }

    /* Surfaces (Badges, Hero, Cards) */
    html.dark .bg-white\\/70{ background-color: rgba(2,6,23,0.34) !important; }
    html.dark .bg-white\\/80{ background-color: rgba(2,6,23,0.38) !important; }
    html.dark .bg-white\\/70,
    html.dark .bg-white\\/80{
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
    }

    /* Icon tile background inside cards */
    html.dark .bg-slate-50{ background-color: rgba(2,6,23,0.52) !important; }

    /* Borders */
    html.dark .border-slate-200{ border-color: rgba(51,65,85,0.55) !important; }
    html.dark .border-slate-300{ border-color: rgba(51,65,85,0.65) !important; }

    /* Text */
    html.dark .text-slate-900{ color:#f8fafc !important; }
    html.dark .text-slate-800{ color:#f1f5f9 !important; }
    html.dark .text-slate-700{ color:#e2e8f0 !important; }
    html.dark .text-slate-600{ color:#cbd5e1 !important; }
    html.dark .text-slate-500{ color:#94a3b8 !important; }

    /* CTA/Buttons that are designed for light mode */
    html.dark .bg-white{ background-color: rgba(2,6,23,0.55) !important; }
    html.dark .text-white{ color:#f8fafc !important; }

    /* Hover: prevent bright flash */
    html.dark .bg-white\\/80:hover{ background-color: rgba(15,23,42,0.45) !important; }
    html.dark .bg-white\\/70:hover{ background-color: rgba(15,23,42,0.42) !important; }
  `;

  function ensureStyle(){
    let el = document.getElementById(STYLE_ID);
    if(!el){
      el = document.createElement('style');
      el.id = STYLE_ID;
      el.type = 'text/css';
      el.appendChild(document.createTextNode(css));
      document.head.appendChild(el);
    }
  }

  function sync(){
    const isDark = document.documentElement.classList.contains('dark');
    if(isDark) ensureStyle();
  }

  // run now
  try{ sync(); }catch(e){}

  // observe theme toggle (class changes on <html>)
  try{
    const mo = new MutationObserver(() => sync());
    mo.observe(document.documentElement, { attributes:true, attributeFilter:['class'] });
  }catch(e){}
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
