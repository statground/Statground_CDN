/**
 * scripts3/workbench/book/main.js
 * - Book Workbench main (React, Babel)
 * - Depends on window.sg_workbench_i18n + window.sg_workbench_i18n_book (loaded before this file)
 *
 * Routing rule:
 * - URL prefix (/<lang>/...) is the SSOT.
 * - If language modal updates localStorage('sg_lang'), redirect by replacing URL prefix.
 */
(function () {
  function set_main() {
    const rootEl = document.getElementById("div_main");
    if (!rootEl) return;

    const WB = window.sg_workbench_i18n || null;              // base i18n
    const WBB = window.sg_workbench_i18n_book || null;        // book i18n (optional)

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

    const getLangForRender = () => {
      const fromPath = getUrlPrefixLang();
      if (fromPath) return fromPath;

      const fromStorage = getStorageLang();
      if (fromStorage) return fromStorage;

      try {
        const v = document.documentElement.getAttribute("lang");
        const vv = v ? resolve(v) : "en";
        if (ALLOW.size > 0 && !ALLOW.has(vv)) return "en";
        return vv;
      } catch (e) {
        return "en";
      }
    };

    const t = (lang, key, fallback) => {
      // book dict first
      if (WBB && typeof WBB.t === "function") {
        const v = WBB.t(lang, key);
        if (v && v !== key) return v;
      }
      // then base dict
      if (WB && typeof WB.t === "function") {
        const v = WB.t(lang, key);
        if (v && v !== key) return v;
      }
      return fallback != null ? fallback : key;
    };

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

    const isDesktopNow = () => {
      try { return window.matchMedia && window.matchMedia("(min-width: 768px)").matches; }
      catch { return false; }
    };

    const fmtAuthor = (s) => {
      if (!s) return "";
      return String(s).split("^").filter(Boolean).join(", ");
    };

    const fmtPublisher = (s) => (s ? String(s).trim() : "");

    const fmtPubdate = (v) => {
      if (v == null) return "";
      let s = String(v).trim();
      if (!s) return "";
      if (!/^\d+$/.test(s)) return s;
      if (s.length === 8) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
      if (s.length === 6) return `${s.slice(0,4)}-${s.slice(4,6)}`;
      if (s.length === 4) return s;
      return s;
    };

    const EmptyCover = () => (
      React.createElement("svg",
        { viewBox: "0 0 120 160", className: "w-14 h-20 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950", "aria-hidden": "true" },
        React.createElement("rect", { x: "14", y: "18", width: "76", height: "124", rx: "10", ry: "10", fill: "currentColor", className: "text-slate-200 dark:text-slate-800" }),
        React.createElement("rect", { x: "24", y: "34", width: "56", height: "10", rx: "5", fill: "currentColor", className: "text-slate-300 dark:text-slate-700" }),
        React.createElement("rect", { x: "24", y: "52", width: "42", height: "8", rx: "4", fill: "currentColor", className: "text-slate-300 dark:text-slate-700" }),
        React.createElement("rect", { x: "24", y: "66", width: "50", height: "8", rx: "4", fill: "currentColor", className: "text-slate-300 dark:text-slate-700" }),
        React.createElement("rect", { x: "24", y: "108", width: "40", height: "8", rx: "4", fill: "currentColor", className: "text-slate-300 dark:text-slate-700" })
      )
    );

    const App = () => {
      const [lang, setLang] = React.useState(getLangForRender());
      const [q, setQ] = React.useState("");
      const [searchRes, setSearchRes] = React.useState([]);
      const [searching, setSearching] = React.useState(false);
      const [searchErr, setSearchErr] = React.useState("");
      const [hasSearched, setHasSearched] = React.useState(false);
      const [visibleCount, setVisibleCount] = React.useState(24);
      const sentinelRef = React.useRef(null);
      const [recent, setRecent] = React.useState([]);
      const [loadingRecent, setLoadingRecent] = React.useState(false);
      const [recentErr, setRecentErr] = React.useState("");
      const [isDesktop, setIsDesktop] = React.useState(isDesktopNow());

      React.useEffect(() => {
        const prefix = getUrlPrefixLang();
        if (prefix) {
          try { localStorage.setItem("sg_lang", prefix); } catch (e) {}
          setLang(prefix);
        }
      }, []);

      React.useEffect(() => {
        const tick = () => {
          const prefix = getUrlPrefixLang() || lang;
          const storageLang = getStorageLang();

          if (storageLang && storageLang !== prefix) {
            applyLangToUrl(storageLang);
            return;
          }

          const renderLang = getLangForRender();
          setLang((prev) => (prev === renderLang ? prev : renderLang));
        };

        const list = document.getElementById("lang-modal-list");
        const onClick = () => setTimeout(tick, 0);
        if (list) list.addEventListener("click", onClick);

        const timer = setInterval(tick, 400);

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

      React.useEffect(() => {
        const onResize = () => setIsDesktop(isDesktopNow());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      }, []);


      // Infinite scroll for search results (initial 24, then +24 when reaching bottom)
      React.useEffect(() => {
        if (!hasSearched) return;
        const el = sentinelRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
          (entries) => {
            for (const ent of entries) {
              if (ent.isIntersecting) {
                setVisibleCount((v) => {
                  const next = v + 24;
                  return next > (searchRes ? searchRes.length : 0) ? (searchRes ? searchRes.length : 0) : next;
                });
              }
            }
          },
          { root: null, rootMargin: "250px", threshold: 0.01 }
        );

        obs.observe(el);
        return () => obs.disconnect();
      }, [hasSearched, (searchRes ? searchRes.length : 0)]);

      const backHref = `/${lang}/workbench/`;
      const limit = isDesktop ? 12 : 3;
      const apiRecent = `/${lang}/workbench/book/ajax_recent_raw_naver/?limit=${limit}`;
      const apiSearch = `/${lang}/workbench/book/ajax_search_raw_naver/`;
      const detailsBase = `/${lang}/workbench/book/details/`;

      const buildHref = (isbn) => {
        const v = (isbn || "").trim();
        if (!v) return null;
        return `${detailsBase}${encodeURIComponent(v)}/`;
      };

      
      const fmtSearchCount = (n) => {
        const tpl = t(lang, "wb.book.search.count", "{n} results found.");
        return String(tpl).replace("{n}", String(n));
      };

const doSearch = async () => {
  const qq = (q || "").trim();
  if (!qq) {
    setSearchErr(t(lang, "wb.book.search.empty", "Please enter a keyword."));
    setSearchRes([]);
    return;
  }

  setHasSearched(true);
  setVisibleCount(24);

  setSearching(true);
  setSearchErr("");
  setSearchRes([]);

  try {
    const res = await fetch(apiSearch, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ q: qq }),
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { json = null; }

    if (!res.ok || !json?.ok) {
      const safeMsg =
        (json && typeof json.error === "string" && json.error.length < 200)
        ? json.error
        : t(lang, "wb.book.err.search", "Search failed. Please try again.");
      throw new Error(safeMsg);
    }

    const items = Array.isArray(json.items) ? json.items : [];
    setSearchRes(items);
    if (items.length === 0) {
      setSearchErr(t(lang, "wb.book.search.no_result", "No results."));
    }
  } catch (e) {
    setSearchErr(e?.message || t(lang, "wb.book.err.search", "Search failed."));
    setSearchRes([]);
  } finally {
    setSearching(false);
  }
};

const onSearchKeyDown = (e) => {
  if (e && e.key === "Enter") {
    e.preventDefault();
    doSearch();
  }
};

const fetchRecent = async () => {
        setLoadingRecent(true);
        setRecentErr("");
        try {
          const res = await fetch(apiRecent, {
            method: "GET",
            headers: { "Accept": "application/json" },
            credentials: "same-origin",
          });

          const text = await res.text();
          let json = null;
          try { json = JSON.parse(text); } catch { json = null; }

          if (!res.ok || !json?.ok) {
            const safeMsg =
              (json && typeof json.error === "string" && json.error.length < 200)
              ? json.error
              : t(lang, "wb.book.err.load_recent", "Failed to load recent books.");
            throw new Error(safeMsg);
          }

          setRecent(Array.isArray(json.items) ? json.items : []);
        } catch (e) {
          setRecent([]);
          setRecentErr(e?.message || t(lang, "wb.book.err.load_recent", "Failed to load recent books."));
        } finally {
          setLoadingRecent(false);
        }
      };

      React.useEffect(() => { fetchRecent(); }, [apiRecent]);

      const outerClass =
        "block rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 transition";

      return (
        React.createElement("div", { className: "w-full" },
          React.createElement("div", { className: "max-w-6xl mx-auto" },

            React.createElement("div", { className: "mb-8" },
              React.createElement("a", { href: backHref, className: "text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" },
                "← ", t(lang, "wb.badge", "Workbench")
              ),
              React.createElement("h1", { className: "mt-4 text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white" },
                t(lang, "wb.book.title", "Book Workbench")
              ),
              React.createElement("p", { className: "mt-3 text-sm md:text-base text-slate-600 dark:text-slate-300" },
                t(lang, "wb.book.desc", "Explore and validate book data.")
              )
            ),

            React.createElement("div", { className: "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm" },
              React.createElement("div", { className: "flex items-center gap-4" },
                React.createElement("div", { className: "text-slate-700 dark:text-slate-200" },
                  React.createElement("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                    React.createElement("circle", { cx: "11", cy: "11", r: "8", strokeWidth: "2" }),
                    React.createElement("path", { strokeWidth: "2", d: "M21 21l-4.3-4.3" })
                  )
                ),
                React.createElement("input", {
                  type: "text",
                  placeholder: t(lang, "wb.book.search.placeholder", "Search by title, author, ISBN..."),
                  value: q,
                  onChange: (e) => setQ(e.target.value),
                  onKeyDown: onSearchKeyDown,
                  className: "flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                }),
                React.createElement("button", {
                  onClick: doSearch,
                  className: "rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 text-sm font-extrabold hover:opacity-90 transition"
                }, t(lang, "wb.book.search.btn", "Search"))
              )
            ),

            
React.createElement("div", { className: (hasSearched ? "" : "hidden ") + "mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm" },
  React.createElement("div", { className: "flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800" },
    React.createElement("div", null,
      React.createElement("div", { className: "text-lg font-black text-slate-900 dark:text-white" },
        t(lang, "wb.book.search.results", "Search results")
      ),
      React.createElement("div", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400" },
        searching ? t(lang, "wb.book.searching", "Searching...") : (hasSearched ? fmtSearchCount((searchRes && searchRes.length) ? searchRes.length : 0) : "")
      )
    ),
    React.createElement("button", {
      onClick: doSearch,
      className: "rounded-xl px-4 py-2 text-sm font-extrabold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950 transition"
    }, t(lang, "wb.book.search.btn", "Search"))
  ),

  React.createElement("div", { className: "px-6 py-5" },
    searching ? React.createElement("div", { className: "text-sm text-slate-600 dark:text-slate-300" }, t(lang, "wb.book.searching", "Searching...")) : null,

    (!searching && searchErr) ? React.createElement("div", { className: "rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-200" }, searchErr) : null,

    (!searching && !searchErr && (!searchRes || searchRes.length === 0)) ? React.createElement("div", { className: "text-sm text-slate-600 dark:text-slate-300" }, t(lang, "wb.book.search.no_result", "No results.")) : null,

    (!searching && !searchErr && searchRes && searchRes.length > 0) ? (
      React.createElement("div", { className: isDesktop ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "space-y-4" },
        searchRes.slice(0, visibleCount).map((b, idx) => {
          const href = buildHref(b?.isbn);
          const author = fmtAuthor(b?.author);
          const publisher = fmtPublisher(b?.publisher);
          const pubdate = fmtPubdate(b?.pubdate);

          const inner = React.createElement("div", { className: "flex gap-4 p-4" },
            React.createElement("div", { className: "shrink-0" },
              b?.cover_url
                ? React.createElement("img", {
                    src: b.cover_url,
                    alt: "",
                    className: "w-14 h-20 rounded-lg border border-slate-200 dark:border-slate-800 object-cover bg-slate-50 dark:bg-slate-950",
                    loading: "lazy",
                    onError: (e) => { e.currentTarget.style.display = "none"; }
                  })
                : React.createElement(EmptyCover)
            ),
            React.createElement("div", { className: "min-w-0 flex-1" },
              React.createElement("div", { className: "font-extrabold text-slate-900 dark:text-white line-clamp-2" }, b?.title || "(no title)"),
              React.createElement("div", { className: "mt-1 text-sm text-slate-600 dark:text-slate-300 truncate" }, author),
              publisher ? React.createElement("div", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400 truncate" }, publisher) : null,
              pubdate ? React.createElement("div", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400 truncate" },
                t(lang, "wb.book.pubdate", "Published"), ": ", pubdate
              ) : null,
              React.createElement("div", { className: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400" },
                b?.isbn ? React.createElement("span", null, t(lang, "wb.book.isbn", "ISBN"), ": ", b.isbn) : null
              )
            )
          );

          if (!href) {
            return React.createElement("div", {
              key: `${b.isbn || ""}-${idx}`,
              className: outerClass + " opacity-70 cursor-not-allowed",
              title: t(lang, "wb.book.no_isbn", "Missing ISBN")
            }, inner);
          }

          return React.createElement("a", { key: `${b.isbn || ""}-${idx}`, href, className: outerClass }, inner);
        })
      )
    ) : null
  )
),



            (hasSearched ? React.createElement("div", { ref: sentinelRef, className: "h-10" }) : null),

React.createElement("div", { className: (hasSearched ? "hidden " : "") + "mt-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm" },
              React.createElement("div", { className: "flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800" },
                React.createElement("div", null,
                  React.createElement("div", { className: "text-lg font-black text-slate-900 dark:text-white" },
                    t(lang, "wb.book.recent.title", "Recently collected books")
                  ),
                  React.createElement("div", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400" },
                    t(lang, "wb.book.recent.latest_n", "Recently collected books (latest {n})").replace("{n}", String(limit))
                  )
                ),
                React.createElement("button", {
                  onClick: fetchRecent,
                  className: "rounded-xl px-4 py-2 text-sm font-extrabold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950 transition"
                }, t(lang, "wb.book.refresh", "Refresh"))
              ),

              React.createElement("div", { className: "px-6 py-5" },
                loadingRecent ? React.createElement("div", { className: "text-sm text-slate-600 dark:text-slate-300" }, t(lang, "wb.book.loading", "Loading...")) : null,

                (!loadingRecent && recentErr) ? React.createElement("div", { className: "rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-200" }, recentErr) : null,

                (!loadingRecent && !recentErr && recent.length === 0) ? React.createElement("div", { className: "text-sm text-slate-600 dark:text-slate-300" }, t(lang, "wb.book.empty", "No books.")) : null,

                (!loadingRecent && !recentErr && recent.length > 0) ? (
                  React.createElement("div", { className: isDesktop ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "space-y-4" },
                    recent.map((b, idx) => {
                      const href = buildHref(b?.isbn);
                      const author = fmtAuthor(b?.author);
                      const publisher = fmtPublisher(b?.publisher);
                      const pubdate = fmtPubdate(b?.pubdate);

                      const inner = React.createElement("div", { className: "flex gap-4 p-4" },
                        React.createElement("div", { className: "shrink-0" },
                          b?.cover_url
                            ? React.createElement("img", {
                                src: b.cover_url,
                                alt: "",
                                className: "w-14 h-20 rounded-lg border border-slate-200 dark:border-slate-800 object-cover bg-slate-50 dark:bg-slate-950",
                                loading: "lazy",
                                onError: (e) => { e.currentTarget.style.display = "none"; }
                              })
                            : React.createElement(EmptyCover)
                        ),
                        React.createElement("div", { className: "min-w-0 flex-1" },
                          React.createElement("div", { className: "font-extrabold text-slate-900 dark:text-white line-clamp-2" }, b?.title || "(no title)"),
                          React.createElement("div", { className: "mt-1 text-sm text-slate-600 dark:text-slate-300 truncate" }, author),
                          publisher ? React.createElement("div", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400 truncate" }, publisher) : null,
                          pubdate ? React.createElement("div", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400 truncate" },
                            t(lang, "wb.book.pubdate", "Published"), ": ", pubdate
                          ) : null,
                          React.createElement("div", { className: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400" },
                            b?.isbn ? React.createElement("span", null, t(lang, "wb.book.isbn", "ISBN"), ": ", b.isbn) : null,
                            b?.created_at ? React.createElement("span", null, t(lang, "wb.book.collected", "Collected"), ": ", b.created_at) : null
                          )
                        )
                      );

                      if (!href) {
                        return React.createElement("div", {
                          key: `${b.uuid || ""}-${idx}`,
                          className: outerClass + " opacity-70 cursor-not-allowed",
                          title: t(lang, "wb.book.no_isbn", "Missing ISBN")
                        }, inner);
                      }

                      return React.createElement("a", { key: `${b.uuid || ""}-${idx}`, href, className: outerClass }, inner);
                    })
                  )
                ) : null
              )
            )
          )
        )
      );
    };

    const root = ReactDOM.createRoot(rootEl);
    root.render(React.createElement(App));
  }

  window.set_main = set_main;
  // auto run
  try { set_main(); } catch (e) { console.error(e); }
})();