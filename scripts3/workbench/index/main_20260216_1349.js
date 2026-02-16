/**
 * scripts3/workbench/index/main.js
 * - Workbench main (React, Babel)
 * - Depends on window.sg_workbench_i18n (loaded before this file)
 *
 * Fixes:
 * 1) Language change now updates BOTH UI text and URL prefix (/<lang>/...)
 * 2) Robust language detection: localStorage('sg_lang') -> URL prefix -> <html lang> -> 'en'
 * 3) Dark mode CTA readability: always high-contrast (bg-slate-900 text-white)
 */

function set_main() {
  const rootEl = document.getElementById("div_main");
  if (!rootEl) return;

  const WB = window.sg_workbench_i18n || null;

  const getAllowedLangSet = () => {
    try {
      const arr = (WB && Array.isArray(WB.languages)) ? WB.languages : [];
      const set = new Set(arr.map(x => x && x.code).filter(Boolean));
      return set;
    } catch (e) {
      return new Set();
    }
  };

  const ALLOW = getAllowedLangSet();

  const getUrlPrefixLang = () => {
    const seg = (location.pathname || "/").split("/").filter(Boolean);
    const maybe = seg[0] || null;
    if (!maybe) return null;
    if (ALLOW.size > 0) return ALLOW.has(maybe) ? maybe : null;
    return maybe;
  };

  const resolve = (code) => {
    if (WB && typeof WB.resolveLangCode === "function") return WB.resolveLangCode(code);
    return code;
  };

  const getLang = () => {
    const fromStorage = (() => {
      try {
        const v = localStorage.getItem("sg_lang");
        return v ? v : null;
      } catch (e) {
        return null;
      }
    })();

    const fromPath = getUrlPrefixLang();

    const fromHtml = (() => {
      try {
        return document.documentElement.getAttribute("lang") || null;
      } catch (e) {
        return null;
      }
    })();

    const raw = fromStorage || fromPath || fromHtml || "en";
    const lang = resolve(raw);

    // normalize to known language if we have allow-list
    if (ALLOW.size > 0 && !ALLOW.has(lang)) return "en";
    return lang;
  };

  const t = (lang, key) => (WB && typeof WB.t === "function") ? WB.t(lang, key) : key;

  const applyLangToUrl = (newLang) => {
    if (!newLang) return;
    if (ALLOW.size > 0 && !ALLOW.has(newLang)) return;

    const seg = (location.pathname || "/").split("/").filter(Boolean);
    if (seg.length === 0) return;

    // If first segment is not a known lang, we still replace it (Statground uses /<lang>/...)
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
    const [lang, setLang] = React.useState(getLang());

    // When app mounts, if storage lang differs from URL prefix, sync URL (optional but consistent)
    React.useEffect(() => {
      const prefix = getUrlPrefixLang();
      if (prefix && prefix !== lang) {
        // Route is prefix-based, so URL should follow selected language
        applyLangToUrl(lang);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // RTL support
    React.useEffect(() => {
      const rtl = (WB && typeof WB.isRtl === "function") ? WB.isRtl(lang) : (lang === "ar" || lang === "he");
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
    }, [lang]);

    // Observe language changes triggered by the global language modal (which updates localStorage)
    React.useEffect(() => {
      const apply = () => {
        const next = getLang();
        setLang((prev) => (prev === next ? prev : next));
      };

      // 1) Hook modal list clicks (same-tab)
      const list = document.getElementById("lang-modal-list");
      const onClick = () => setTimeout(apply, 0);
      if (list) list.addEventListener("click", onClick);

      // 2) Poll as a reliable fallback (same-tab localStorage changes won't always fire 'storage')
      const timer = setInterval(apply, 400);

      // 3) Listen storage (other tabs)
      const onStorage = (e) => {
        if (!e) return;
        if (e.key === "sg_lang") apply();
      };
      window.addEventListener("storage", onStorage);

      return () => {
        if (list) list.removeEventListener("click", onClick);
        clearInterval(timer);
        window.removeEventListener("storage", onStorage);
      };
    }, []);

    // IMPORTANT: if lang changes and URL prefix differs, redirect so routing matches
    React.useEffect(() => {
      const prefix = getUrlPrefixLang();
      if (prefix && prefix !== lang) {
        applyLangToUrl(lang);
      }
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
