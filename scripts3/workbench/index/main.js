function set_main() {
  const rootEl = document.getElementById("div_main");
  if (!rootEl) return;

  const WB = window.sg_workbench_i18n;
  const getLangFromPath = () => {
    const seg = (location.pathname || "/").split("/").filter(Boolean);
    return seg[0] || "en";
  };

  const Badge = ({ children }) => (
    <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">
      {children}
    </span>
  );

  const Card = ({ href, title, desc, icon, cta }) => (
    <a href={href} className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-200">
            {icon}
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</div>
            <div className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{desc}</div>
          </div>
        </div>

        <div className="shrink-0">
          {/* ✅ JSX 주석은 이렇게 */}
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
    const lang = getLangFromPath();
    const bookHref = `/${lang}/workbench/book/`;

    // RTL 언어 지원
    React.useEffect(() => {
      const rtl = WB && WB.isRtl ? WB.isRtl(lang) : false;
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
    }, [lang]);

    const tt = (key) => (WB && WB.t ? WB.t(lang, key) : key);

    return (
      <div className="w-full">
        <div className="max-w-6xl mx-auto px-2 md:px-0">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm">
            <div className="relative p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge>{tt("wb.badge")}</Badge>
                <Badge>Lang: {lang}</Badge>
              </div>

              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {tt("wb.title")}
              </h1>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl">
                {tt("wb.subtitle")}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card
              href={bookHref}
              title={tt("wb.card.book.title")}
              desc={tt("wb.card.book.desc")}
              icon={IconBook}
              cta={tt("wb.cta.open")}
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