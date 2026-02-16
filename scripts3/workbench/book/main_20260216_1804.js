/**
 * scripts3/workbench/book/main.js
 * - Book Workbench main (React, Babel)
 * - White search button in result header removed
 */

(function () {

  function set_main() {

    const rootEl = document.getElementById("div_main");
    if (!rootEl) return;

    const WB = window.sg_workbench_i18n || null;
    const WBB = window.sg_workbench_i18n_book || null;

    const resolve = (code) =>
      (WB && typeof WB.resolveLangCode === "function")
        ? WB.resolveLangCode(code)
        : code;

    const getLang = () => {
      const seg = (location.pathname || "/").split("/").filter(Boolean);
      return seg[0] || "en";
    };

    const t = (lang, key, fallback) => {
      if (WBB?.t) {
        const v = WBB.t(lang, key);
        if (v && v !== key) return v;
      }
      if (WB?.t) {
        const v = WB.t(lang, key);
        if (v && v !== key) return v;
      }
      return fallback ?? key;
    };

    const fmtPubdate = (v) => {
      if (!v) return "";
      const s = String(v);
      if (/^\d{8}$/.test(s)) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
      if (/^\d{6}$/.test(s)) return `${s.slice(0,4)}-${s.slice(4,6)}`;
      return s;
    };

    const App = () => {

      const lang = getLang();

      const [q, setQ] = React.useState("");
      const [searchRes, setSearchRes] = React.useState([]);
      const [searching, setSearching] = React.useState(false);
      const [searchErr, setSearchErr] = React.useState("");
      const [hasSearched, setHasSearched] = React.useState(false);

      const apiSearch = `/${lang}/workbench/book/ajax_search_raw_naver/`;
      const detailsBase = `/${lang}/workbench/book/details/`;

      const doSearch = async () => {

        const qq = (q || "").trim();
        if (!qq) return;

        setSearching(true);
        setHasSearched(true);
        setSearchErr("");
        setSearchRes([]);

        try {
          const res = await fetch(apiSearch, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ q: qq }),
          });

          const json = await res.json();

          if (!json?.ok) throw new Error("Search failed");

          setSearchRes(json.items || []);
        } catch (e) {
          setSearchErr("Search failed.");
        } finally {
          setSearching(false);
        }
      };

      return (

        React.createElement("div", { className: "max-w-6xl mx-auto" },

          /* Search Box */
          React.createElement("div", { className: "mb-8" },
            React.createElement("div", { className: "flex gap-4" },
              React.createElement("input", {
                value: q,
                onChange: e => setQ(e.target.value),
                onKeyDown: e => { if (e.key === "Enter") doSearch(); },
                placeholder: t(lang, "wb.book.search.placeholder"),
                className: "flex-1 border rounded-xl px-4 py-3"
              }),
              React.createElement("button", {
                onClick: doSearch,
                className: "bg-slate-900 text-white px-5 py-3 rounded-xl font-bold"
              }, t(lang, "wb.book.search.btn", "Search"))
            )
          ),

          /* Search Results */
          hasSearched && React.createElement("div", {
            className: "rounded-2xl border p-6"
          },

            React.createElement("div", { className: "mb-4" },
              React.createElement("div", {
                className: "text-lg font-black"
              }, t(lang, "wb.book.search.results", "Search results")),
              React.createElement("div", {
                className: "text-sm text-slate-500"
              },
                searching
                  ? "Searching..."
                  : `${searchRes.length} results`
              )
            ),

            searchErr &&
              React.createElement("div", { className: "text-rose-600" }, searchErr),

            (!searching && searchRes.length === 0) &&
              React.createElement("div", null, "No results."),

            React.createElement("div", {
              className: "grid grid-cols-1 md:grid-cols-3 gap-6"
            },
              searchRes.map((b, idx) =>
                React.createElement("a", {
                  key: idx,
                  href: `${detailsBase}${b.isbn}/`,
                  className: "block border rounded-xl p-4 hover:bg-slate-50"
                },
                  React.createElement("div", { className: "font-bold" }, b.title),
                  React.createElement("div", { className: "text-sm text-slate-600" }, b.author),
                  React.createElement("div", { className: "text-xs text-slate-500" },
                    t(lang, "wb.book.pubdate", "Published"), ": ",
                    fmtPubdate(b.pubdate)
                  ),
                  React.createElement("div", { className: "text-xs text-slate-400" },
                    "ISBN: ", b.isbn
                  )
                )
              )
            )
          )
        )
      );
    };

    ReactDOM.createRoot(rootEl).render(React.createElement(App));
  }

  window.set_main = set_main;
  set_main();

})();
