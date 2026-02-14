    // -----------------------------
    // Archived Book Detail (stable)
    // -----------------------------
    function strip(x){ return (x===undefined || x===null) ? "" : String(x).trim(); }


function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function makeBookCoverSvgDataUri({ title, author, year }) {
  const t = escapeXml(title || "Untitled");
  const a = escapeXml(author || "");
  const y = escapeXml(year || "");

  // 3:4 비율 커버(예: 600x800)
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f8fafc"/>
      <stop offset="1" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="spine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Cover card -->
  <rect x="60" y="60" width="480" height="680" rx="28" fill="url(#bg)" filter="url(#shadow)"/>
  <!-- Spine -->
  <rect x="60" y="60" width="36" height="680" rx="18" fill="url(#spine)"/>
  <!-- Subtle pattern -->
  <g opacity="0.25">
    <circle cx="460" cy="170" r="80" fill="#94a3b8"/>
    <circle cx="420" cy="220" r="46" fill="#cbd5e1"/>
  </g>

  <!-- Title -->
  <text x="120" y="240" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
        font-size="44" font-weight="800" fill="#0f172a">
    ${t.length > 20 ? t.slice(0, 20) + "…" : t}
  </text>

  <!-- Author -->
  ${a ? `
  <text x="120" y="300" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
        font-size="22" font-weight="700" fill="#334155">
    ${a.length > 28 ? a.slice(0, 28) + "…" : a}
  </text>` : ""}

  <!-- Year badge -->
  ${y ? `
  <g>
    <rect x="120" y="340" width="120" height="40" rx="12" fill="#0f172a"/>
    <text x="180" y="367" text-anchor="middle"
          font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
          font-size="18" font-weight="800" fill="#ffffff">
      ${y}
    </text>
  </g>` : ""}

  <!-- Bottom label -->
  <text x="120" y="700" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
        font-size="16" font-weight="700" fill="#64748b">
    Statistical Ground · Archived
  </text>

  <!-- Small book icon -->
  <g transform="translate(455, 650)" opacity="0.65">
    <rect x="0" y="0" width="62" height="82" rx="10" fill="#0f172a"/>
    <rect x="8" y="10" width="46" height="6" rx="3" fill="#ffffff"/>
    <rect x="8" y="26" width="38" height="6" rx="3" fill="#ffffff" opacity="0.85"/>
    <rect x="8" y="42" width="42" height="6" rx="3" fill="#ffffff" opacity="0.7"/>
  </g>
</svg>`.trim();

  // data URI로 사용 (utf8 인코딩)
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function getMarketplaceLogo(name){
      const n = (name || "").toLowerCase();
      if(!n) return null;
      if(n.includes("google")) return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/google_books.png";
      if(n.includes("교보") || n.includes("kyobo")) return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/kyobobook.png";
      if(n.includes("영풍") || n.includes("ypbooks") || n.includes("youngpoong")) return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/ypbooks.png";
      if(n.includes("yes24") || n.includes("예스24") || n.includes("예스")) return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/yes24.png";
      if(n.includes("open library") || n.includes("openlibrary")) return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/openlibrary.png";
      if(n.includes("loc") || n.includes("loc.gov") || n.includes("libraryofcongress") || n.includes("library of congress") || n.includes("congress")) return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/loc.png";
      if(n.includes("알라딘") || n.includes("aladin")) return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/aladin.png";
      if(n.includes("naver")) return "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/data/book/naver.png";
      return null;
    }

    function getBookUuid(){
      try{
        if (window.SG_BOOK && window.SG_BOOK.bookUuid) return String(window.SG_BOOK.bookUuid).trim();
      }catch(e){}
      try{
        const p = (location.pathname || "").replace(/\/+$/,"");
        const m = p.match(/\/data\/book\/([0-9a-fA-F-]{36})$/);
        if (m && m[1]) return m[1];
      }catch(e){}
      return "";
    }
    const BOOK_UUID = getBookUuid();

    function set_main() {

      function normalizeArchivedBook(json){
        const ok = !!(json && (json.ok === true || json.status === "success"));
        let bookObj = (json && (json.book || json.data)) ? (json.book || json.data) : null;
        if (!bookObj && json && json.uuid) bookObj = json;
        if (!ok && !bookObj) return null;

        const b = Object.assign({}, bookObj);

        if (Array.isArray(b.authors)) {
          b.authors = b.authors.map(x => (x && x.name) ? x.name : String(x || "")).map(x => x.trim()).filter(Boolean).join(", ");
        }
        if (!strip(b.authors)) b.authors = "-";

        if (!b.subjects && b.categories) b.subjects = b.categories;

        const MARKET_LABEL = {
          "google": "Google",
          "google_books": "Google",
          "yes24": "YES24",
          "kyobo": "교보문고",
          "aladin": "알라딘",
          "ypbooks": "영풍문고",
          "youngpoong": "영풍문고",
          "naver": "Naver",
          "openlibrary": "Open Library",
          "loc": "Library of Congress",
          "libraryofcongress": "Library of Congress",
          "search": "검색",
          "se": "검색",
        };

        // ✅ 노출 금지 타입 (UI에 표시되면 안 되는 임시/자동 타입)
        const BLOCK_TYPES = new Set([
          "search", "se",        // 검색 카드
          "commission", "co"     // 커미션/트래킹 임시 카드
        ]);

        // ✅ 허용 마켓(운영 기준)
        const ALLOW_TYPES = new Set([
          "google", "google_books",
          "yes24",
          "kyobo",
          "aladin",
          "ypbooks", "youngpoong",
          "naver",
          "openlibrary",
          "loc", "libraryofcongress"
        ]);


        const out = [];

        if (b.marketplace_map && typeof b.marketplace_map === "object") {
          Object.keys(b.marketplace_map).forEach(k => {
            const rawName = strip(k);
            const url = strip(b.marketplace_map[k]);
            if (!rawName || !url) return;
            const key = rawName.toLowerCase();
            if (BLOCK_TYPES.has(key)) return;
            if (!ALLOW_TYPES.has(key)) return;
            const name = MARKET_LABEL[key] || rawName;
            out.push({ uuid:key, code:key, name, active:1, url, price_text:"", logo:getMarketplaceLogo(name) });
          });
        }

        if (Array.isArray(b.marketplaces)) {
          b.marketplaces.forEach(it => {
            const rawName = strip(it.name || it.type);
            const url = strip(it.url);
            if (!rawName || !url) return;
            const key = rawName.toLowerCase();
            if (BLOCK_TYPES.has(key)) return;
            if (!ALLOW_TYPES.has(key)) return;
            const name = MARKET_LABEL[key] || rawName;
            const exists = out.find(x => x.name.toLowerCase() === name.toLowerCase());
            if (exists) return;
            out.push({ uuid:key, code:key, name, active:1, url, price_text:"", logo:getMarketplaceLogo(name) });
          });
        }

        function buildSearchLinks(title) {
          const q = encodeURIComponent(title || "");
          if (!q) return [];
          return [
            { name: "Google", url: `https://www.google.com/search?q=${q}` },
            { name: "YES24", url: `https://www.yes24.com/Product/Search?domain=ALL&query=${q}` },
            { name: "교보문고", url: `https://search.kyobobook.co.kr/search?keyword=${q}` },
            { name: "알라딘", url: `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=All&SearchWord=${q}` },
            { name: "영풍문고", url: `https://www.ypbooks.co.kr/search?keyword=${q}` },
          ];
        }

        const titleForSearch = strip(b.title) || strip(b.subtitle) || strip(b.dedupe_key);
        const existingNames = new Set(out.map(x => (x.name || "").toLowerCase()));
        if (false && out.length <= 2 && titleForSearch) {
          buildSearchLinks(titleForSearch).forEach(x => {
            const k = x.name.toLowerCase();
            if (existingNames.has(k)) return;
            out.push({ uuid:k, code:k, name:x.name, active:1, url:x.url, price_text:"", logo:getMarketplaceLogo(x.name) });
          });
        }

        const pri = (x)=> {
          const n = String(x.name||"").toLowerCase();
          if(n.includes("교보") || n.includes("kyobo")) return 0;
          if(n.includes("yes24") || n.includes("예스")) return 1;
          if(n.includes("알라딘") || n.includes("aladin")) return 2;
          if(n.includes("영풍") || n.includes("ypbooks")) return 3;
          if(n.includes("google")) return 4;
          if(n.includes("naver")) return 5;
          if(n.includes("openlibrary")) return 6;
          if(n.includes("congress") || n.includes("loc")) return 7;
          if(n.includes("원본")) return 8;
          return 99;
        };
        out.sort((a,b)=> pri(a)-pri(b));

        b.marketplaces = out;
        return b;
      }

      class BookDetail extends React.Component {
        constructor(props) {
          super(props);
          this.state = { loading: true, error: "", book: null, coverFailed: false };
        }

        componentDidMount() { this.load(); }

        splitKeywords(s) {
          if (!s) return [];
          const raw = (typeof s === "string") ? s.trim() : s;
          try {
            const j = (typeof raw === "string") ? JSON.parse(raw) : raw;
            if (Array.isArray(j)) return j.map(x => String(x).trim()).filter(Boolean).slice(0, 30);
          } catch (e) {}
          return String(raw).replace(/\n/g, " ").split(/[,;|]/g).map(x => x.trim()).filter(Boolean).slice(0, 30);
        }

        renderKeywords(book) {
          const kws = this.splitKeywords(book?.subjects || book?.categories || "");
          if (!kws.length) return <span className="text-sm text-slate-400">키워드가 없습니다.</span>;
          return (
            <div className="flex flex-wrap gap-2">
              {kws.map((k, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white">
                  #{k}
                </span>
              ))}
            </div>
          );
        }

        async load() {
          if (!BOOK_UUID) { this.setState({ loading:false, error:"책 UUID를 확인할 수 없습니다." }); return; }
          try {
            const res = await fetch(`/data/ajax_book_detail/${BOOK_UUID}/`);
            const json = await res.json();
            const bookObj = normalizeArchivedBook(json);
            if (!bookObj) throw new Error((json && (json.message || json.error)) || "상세 정보를 불러오지 못했습니다.");
            this.setState({ book: bookObj, loading:false, error:"", coverFailed:false });
          } catch (e) {
            this.setState({ loading:false, error: (e && e.message) ? e.message : "오류가 발생했습니다." });
          }
        }

        render() {
          const { loading, error, book } = this.state;

          if (loading) {
            return (
              <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-64 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            );
          }

          if (error) {
            return (
              <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                  <div className="text-rose-700 font-extrabold text-lg">조회에 실패했습니다</div>
                  <div className="mt-2 text-rose-700 text-sm break-words">{error}</div>
                  <div className="mt-4 text-slate-500 text-sm">uuid: {BOOK_UUID}</div>
                </div>
              </div>
            );
          }

          const title = book?.title || "제목 없음";

          const authors = book?.authors || "-";
          const year = book?.publish_year ?? "-";
          const lang = book?.language || "-";
          const pages = (book?.page_count ?? "-");

          const rawCover = strip(book?.cover_url);
          const fallbackCover = makeBookCoverSvgDataUri({ title, author: authors, year: year });
          const coverSrc = (this.state.coverFailed || !rawCover) ? fallbackCover : rawCover;
return (
            <div className="max-w-6xl mx-auto px-4 py-10">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-100 overflow-hidden">
                      
{rawCover ? (
  <img
    className="w-full h-auto object-cover"
    src={rawCover}
    alt={title}
  />
) : (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 600 800"
    className="w-full h-auto"
  >
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc"/>
        <stop offset="100%" stopColor="#e2e8f0"/>
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="600" height="800" fill="url(#bg)" />
    <rect x="40" y="40" width="520" height="720" rx="24" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2"/>

    <text
      x="300"
      y="250"
      textAnchor="middle"
      fontSize="36"
      fontWeight="800"
      fill="#0f172a"
    >
      {title}
    </text>

    <text
      x="300"
      y="310"
      textAnchor="middle"
      fontSize="20"
      fontWeight="600"
      fill="#334155"
    >
      {authors}
    </text>

    <text
      x="300"
      y="360"
      textAnchor="middle"
      fontSize="18"
      fontWeight="700"
      fill="#0f172a"
    >
      {year}
    </text>

    <text
      x="300"
      y="740"
      textAnchor="middle"
      fontSize="14"
      fill="#64748b"
    >
      Statistical Ground · Archived
    </text>
  </svg>
)}

                    </div>
                  </div>

                  <div className="col-span-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>

                    <div className="mt-3 text-slate-600 text-sm">
                      저자 | <span className="font-semibold text-slate-900">{authors}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      출판연도 | <span className="font-semibold text-slate-900">{year}</span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">언어</div>
                        <div className="text-sm font-semibold text-slate-900 mt-1">{lang}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">페이지</div>
                        <div className="text-sm font-semibold text-slate-900 mt-1">{pages}</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-xs font-semibold text-slate-500 mb-2">키워드</div>
                      {this.renderKeywords(book)}
                    </div>

                    <div className="mt-8">
                      <div className="text-base font-bold text-slate-900 mb-3">마켓플레이스</div>
                      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {(book?.marketplaces || []).slice(0, 8).map((mp, i) => (
                          <a key={i} href={mp.url} target="_blank" rel="noopener"
                             className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition p-3 flex flex-col items-center justify-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                              {mp.logo ? <img src={mp.logo} alt="" className="h-full w-full object-contain" /> : <span className="text-xs font-extrabold text-slate-600">{(mp.name || "MP").slice(0,2)}</span>}
                            </div>
                            <div className="text-sm font-extrabold text-slate-900 text-center">{mp.name}</div>
                            <div className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-900 text-white">바로가기</div>
                          </a>
                        ))}
                      </div>
                    </div>
                        {/* Affiliate Banner */}
                        <div className="mt-8 flex justify-center">
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener"
                        >
                            <img
                            src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/images/common/affiliates/adpick.png"
                            alt="Adpick"
                            className="w-[125px] h-[125px] object-contain"
                            />
                        </a>
                        </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      }

      const root = ReactDOM.createRoot(document.getElementById("div_main"));
      root.render(<BookDetail />);
    }
