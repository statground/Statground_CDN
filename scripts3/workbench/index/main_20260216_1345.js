function set_main() {
  const rootEl = document.getElementById("div_main");
  if (!rootEl) return;

  const WB = window.sg_workbench_i18n;

  // ✅ URL의 언어(있으면) / localStorage 언어(우선) / html lang 순으로 결정
  const getLang = () => {
    const fromStorage = (() => {
      try {
        const v = localStorage.getItem("sg_lang");
        return v ? v : null;
      } catch (e) {
        return null;
      }
    })();

    const fromPath = (() => {
      const seg = (location.pathname || "/").split("/").filter(Boolean);
      return seg[0] || null;
    })();

    const fromHtml = (() => {
      try {
        return document.documentElement.getAttribute("lang") || null;
      } catch (e) {
        return null;
      }
    })();

    const raw = fromStorage || fromPath || fromHtml || "en";
    return (WB && WB.resolveLangCode) ? WB.resolveLangCode(raw) : raw;
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
            <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</div>
            <div className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{desc}</div>
          </div>
        </div>

        <div className="shrink-0">
          {/* ✅ 다크모드에서도 글자 안 사라지게: 진한 배경 + 흰 글자 고정 */}
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

    const tt = React.useCallback(
      (key) => (WB && WB.t ? WB.t(lang, key) : key),
      [lang]
    );

    // ✅ 언어 변경 감지: (1) 모달 리스트 클릭 훅 + (2) 폴링 백업
    React.useEffect(() => {
      const apply = () => setLang(getLang());

      // 1) 모달 리스트 클릭 후 반영
      const list = document.getElementById("lang-modal-list");
      const onClick = () => setTimeout(apply, 0);
      if (list) list.addEventListener("click", onClick);

      // 2) 같은 탭에서 localStorage 변화는 storage 이벤트가 안 뜰 수 있으니 폴링
      const timer = setInterval(() => {
        const next = getLang();
        setLang((prev) => (prev === next ? prev : next));
      }, 500);

      return () => {
        if (list) list.removeEventListener("click", onClick);
        clearInterval(timer);
      };
    }, []);

    // RTL 지원
    React.useEffect(() => {
      const rtl = WB && WB.isRtl ? WB.isRtl(lang) : false;
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
    }, [lang]);

    // ⚠️ 링크는 “현재 URL의 <lang> prefix”를 유지해야 라우팅이 맞음
    // localStorage 언어를 따라갈 수도 있지만, 루트 라우팅이 <str:lang> 기반이면 prefix가 진짜 언어임
    const langPrefix = (() => {
      const seg = (location.pathname || "/").split("/").filter(Boolean);
      return seg[0] || lang;
    })();

    const bookHref = `/${langPrefix}/workbench/book/`;

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
