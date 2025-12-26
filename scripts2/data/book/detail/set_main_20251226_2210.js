// safe string trim helper
function strip(x){ return (x===undefined || x===null) ? "" : String(x).trim(); }

// 마켓 이름 기반 로고 매핑 함수
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

// BOOK_UUID 우선순위:
// 1) Django template에서 주입한 window.SG_BOOK.bookUuid
// 2) URL(/data/book/<uuid>/)에서 추출
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
  // 커버(표지) 클릭 시: 커미션 링크(가능하면 교보/YES24) 중 랜덤으로 이동
  function openRandomCommissionLink(book) {
    try {
      const mps = Array.isArray(book?.marketplaces) ? book.marketplaces : [];
      const hasUrl = (mp) => mp && mp.url && String(mp.url).trim() && String(mp.url).trim() !== "#";
      const normName = (mp) => String(mp?.name || "").toLowerCase();

      // 1) 교보/YES24 우선
      let candidates = mps.filter(mp => hasUrl(mp) && (normName(mp).includes("교보") || normName(mp).includes("kyobo") || normName(mp).includes("yes24") || normName(mp).includes("예스")));
      // 2) 없으면 전체 url 중에서
      if (!candidates.length) candidates = mps.filter(hasUrl);
      if (!candidates.length) return;

      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const url = String(pick.url).trim();
      if (!url) return;
      window.open(url, "_blank", "noopener");
    } catch (e) {}
  }

  // 출간일 포맷팅: YYYYMMDD -> YYYY-MM-DD, YYYYMM -> YYYY-MM, YYYY -> YYYY
  function formatPublishedDate(raw) {
    const s = String(raw || "").trim();
    if (!s) return "-";
    // 이미 하이픈으로 포맷된 경우 그대로 반환
    if (/\d{4}-\d{2}-\d{2}/.test(s) || /\d{4}-\d{2}$/.test(s)) return s;
    const digits = s.replace(/\D/g, "");
    if (digits.length === 8) return digits.slice(0,4) + "-" + digits.slice(4,6) + "-" + digits.slice(6,8);
    if (digits.length === 6) return digits.slice(0,4) + "-" + digits.slice(4,6);
    if (digits.length === 4) return digits;
    return s;
  }
  // BookDetail (class component 유지)
  class BookDetail extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        error: "",
        book: null,
        activeTab: "desc",
        linksLoading: false,
      };
      this.handleCopy = this.handleCopy.bind(this);
    }

    componentDidMount() {
      this.load();
    }

    async load() {
      if (!BOOK_UUID) {
        this.setState({ loading: false, error: "책 UUID를 확인할 수 없습니다. (URL 또는 템플릿 주입 값을 확인해주세요.)" });
        return;
      }

      try {
        // 1) 상세(필수)
        const res = await fetch(`/data/ajax_book_detail/${BOOK_UUID}/`);
        const json = await res.json();

        // 백엔드 응답 포맷 호환:
        // - { ok: true, book: {...} }
        // - { status: "success", data: {...} }
        const ok = !!(json && (json.ok === true || json.status === "success"));
        const bookObj = (json && (json.book || json.data)) || null;

        if (!ok || !bookObj) {
          throw new Error((json && (json.message || json.error)) || "상세 정보를 불러오지 못했습니다.");
        }

        // 2) 부가(선택): marketplace list, 서점 검색 링크(ISBN 기반)
        // 실패해도 상세페이지가 죽지 않도록 개별 try/catch
        let marketplaces = [];
        try {
          const mres = await fetch(`/data/ajax_marketplace_list/`);
          const mjson = await mres.json();
          if (mjson && mjson.ok && Array.isArray(mjson.marketplaces)) {
            marketplaces = mjson.marketplaces.map(x => {
              const nm = strip(x.name);
              return {
                uuid: strip(x.uuid),
                code: strip(x.uuid),  // price lookup key (uuid_marketplace)
                name: nm,
                active: x.active ? 1 : 0,
                logo: getMarketplaceLogo(nm)  // 추가된 로고 필드
              };
            }).filter(x => x.uuid);
          }
        } catch (e) {}
        // (links는 별도 AJAX로 로딩)
        const links = null;
        // 3) 병합: marketplaces 배열을 bookObj에 주입
        // - v_book_list_all에 price(JSON)가 있고, 키가 uuid_marketplace(=marketplace.uuid)인 구조를 전제로 함
        // - price에 URL이 없거나 준비중이면 ISBN 기반 검색 링크로 fallback
        const merged = Object.assign({}, bookObj);

        const priceObj = merged && merged.price ? merged.price : {};
        const mpList = Array.isArray(marketplaces) ? marketplaces : [];

        // name 기반 링크 매핑 (search url)
        const linkByName = (name) => {
          const n = (name || "").toLowerCase();
          if (!links) return "";
          // legacy 호환(혹시 links가 들어오는 경우)
          if (links[n]) return links[n] || "";
          if (links[name]) return links[name] || "";
          if (n.includes("교보")) return links.kyobo || links["교보문고"] || "";
          if (n.includes("yes24") || n.includes("예스24") || n.includes("예스")) return links.yes24 || links["YES24"] || "";
          if (n.includes("영풍")) return links.ypbooks || links["영풍문고"] || "";
          if (n.includes("알라딘")) return links.aladin || links["알라딘"] || "";
          return "";
        };

        merged.marketplaces = mpList.map(mp => {
          const p = (mp.code && priceObj && priceObj[mp.code]) ? priceObj[mp.code] : null;
          const url = (p && p.url) ? p.url : linkByName(mp.name);
          const amount = (p && (p.price || p.amount)) ? (p.price || p.amount) : null;
          return Object.assign({}, mp, {
            url: url || "",
            price_text: amount ? `${Number(amount).toLocaleString()}원` : (p && p.price_text ? p.price_text : ""),
          });
        });

        // raw_json이 문자열일 수 있으니 탭에서 보기 좋게 준비
        if (merged && merged.raw_json && typeof merged.raw_json !== "string") {
          try { merged.raw_json = JSON.stringify(merged.raw_json, null, 2); } catch (e) {}
        }

        this.setState({ book: merged, loading: false, error: "" }, () => {
          // 데이터는 먼저 보여주고, 마켓플레이스 링크는 별도 AJAX로 로딩
          this.loadLinks();
        });
      } catch (e) {
        this.setState({ loading: false, error: (e && e.message) ? e.message : "오류가 발생했습니다." });
      }
    }

    
    async loadLinks() {
      if (!BOOK_UUID) return;
      this.setState({ linksLoading: true });

      try {
        const res = await fetch(`/data/ajax_book_links/${BOOK_UUID}/`);
        const json = await res.json();
        if (!json || !json.ok) throw new Error((json && (json.error || json.message)) ? (json.error || json.message) : "마켓플레이스 링크 조회 실패");

        const map = {};
        // 우선 links_by_name 사용
        if (json.links_by_name && typeof json.links_by_name === "object") {
          Object.keys(json.links_by_name).forEach(k => {
            const key = String(k || "").toLowerCase().trim();
            if (key) map[key] = String(json.links_by_name[k] || "");
          });
        }
        // items 배열도 지원
        if (Array.isArray(json.items)) {
          json.items.forEach(it => {
            const key = String(it.marketplace_name || "").toLowerCase().trim();
            if (key && it.url) map[key] = String(it.url);
          });
        }
        // legacy links 지원
        if (json.links && typeof json.links === "object") {
          Object.keys(json.links).forEach(k => {
            const key = String(k || "").toLowerCase().trim();
            if (key) map[key] = String(json.links[k] || "");
          });
        }

        this.setState(prev => {
          const b = prev.book;
          if (!b) return { linksLoading: false };

          const mps = Array.isArray(b.marketplaces) ? b.marketplaces.map(mp => {
            const cur = (mp && mp.url) ? String(mp.url).trim() : "";
            if (cur) return mp;
            const nameKey = String(mp?.name || "").toLowerCase().trim();
            const u = nameKey ? (map[nameKey] || "") : "";
            return Object.assign({}, mp, { url: u || "" });
          }) : [];

          return { book: Object.assign({}, b, { marketplaces: mps }), linksLoading: false };
        });

      } catch (e) {
        // 링크 실패해도 상세 데이터는 유지
        this.setState({ linksLoading: false });
      }
    }

toast(msg) {
      try {
        const el = document.createElement("div");
        el.className = "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm shadow-lg";
        el.innerText = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1600);
      } catch (e) {}
    }

    async handleCopy(text) {
      const t = (text || "").toString();
      if (!t) return this.toast("복사할 내용이 없습니다.");
      try {
        await navigator.clipboard.writeText(t);
        this.toast("복사 완료");
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = t;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        this.toast("복사 완료");
      }
    }

    splitKeywords(s) {
      if (!s) return [];
      const raw = (typeof s === "string") ? s.trim() : s;
      try {
        const j = (typeof raw === "string") ? JSON.parse(raw) : raw;
        if (Array.isArray(j)) return j.map(x => String(x).trim()).filter(Boolean).slice(0, 30);
      } catch (e) {}
      return String(raw)
        .replace(/\n/g, " ")
        .split(/[,;|]/g)
        .map(x => x.trim())
        .filter(Boolean)
        .slice(0, 30);
    }

    renderKeywords(book) {
      const kws = this.splitKeywords(book?.subjects || "");
      if (!kws.length) {
        return <span className="text-sm text-slate-400">키워드가 없습니다.</span>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {kws.map((k, i) => (
            <a key={i}
               href={`/data/book/?keyword=${encodeURIComponent(k)}`}
               className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50">
              #{k}
            </a>
          ))}
        </div>
      );
    }

    renderMarketplace(book) {
      const mps = Array.isArray(book?.marketplaces) ? book.marketplaces.slice() : [];
       // info_url을 마켓 형태로 추가 (중복 방지)
       try {
         const infoUrl = (book && book.info_url) ? String(book.info_url).trim() : "";
         if (infoUrl) {
           const exists = mps.find(mp => mp.url === infoUrl);
           if (!exists) {
             let name = "원본 정보";
             try {
               const u = new URL(infoUrl, location.origin);
               const h = (u.hostname || "").toLowerCase();
               const parts = h.split(".");
               if (h.includes("google")) name = "Google";
               else if (h.includes("naver")) name = "Naver";
               else if (h.includes("openlibrary") || h.includes("openlibrary.org")) name = "Open Library";
               else if (h.includes("kyobo")) name = "Kyobo";
               else if (h.includes("yes24")) name = "YES24";
               else if (h.includes("ypbooks") || h.includes("youngpoong")) name = "영풍문고";
               else if (h.includes("loc") || h.includes("loc.gov") || h.includes("libraryofcongress") || h.includes("congress")) name = "Library of Congress";
               else {
                 let base = parts[0] || "";
                 if (base === "www" && parts.length > 1) base = parts[1];
                 name = base ? (base.charAt(0).toUpperCase() + base.slice(1)) : "원본 정보";
               }
             } catch (e) {}
             mps.unshift({
               uuid: "info_" + Math.random().toString(36).slice(2,8),
               code: "info",
               name: name,
               active: 1,
               url: infoUrl,
               price_text: "",
               // info 항목에도 로고를 채움
               logo: getMarketplaceLogo(name) || null
             });
           }
         }
       } catch (e) {}
      // 준비중(비활성) 마켓은 노출하지 않음
      const visible = mps.filter(mp => mp && mp.url && String(mp.url).trim() !== "#" );
      if (!visible.length) {
         return (
           <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
             마켓플레이스 정보가 없습니다.
           </div>
         );
       }

       // 로딩 플래그는 state에서 읽음
       const loadingLinks = this.state?.linksLoading;

       return (
         // 그리드 셀을 채우고 카드처럼 나열되도록 변경 (준비중 제외)
         <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-3 justify-items-stretch">
           {visible.slice(0, 9).map((mp, idx) => {
             const url = (mp && mp.url) ? String(mp.url).trim() : "";
             const priceText = (mp && mp.price_text) ? mp.price_text : "";
             const isLoading = (!url) && loadingLinks;

             // url이 없고 로딩도 끝났다면(예외 상황) 클릭 불가 카드로 표시
             const Wrapper = url ? "a" : "div";
             const wrapperProps = url ? {
               href: url,
               target: "_blank",
               rel: "noopener",
             } : {};

             return (
               <Wrapper key={idx}
                  {...wrapperProps}
                 // 카드 높이/간격 감소: h-20, 내부 gap 축소
                 className={"group rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition w-full flex flex-col justify-center h-20 " + (url ? "cursor-pointer" : "cursor-default opacity-90")}>
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                       {mp.logo ? <img src={mp.logo} alt="" className="h-full w-full object-contain" /> : <span className="text-xs font-extrabold text-slate-600">{(mp.name || "MP").slice(0,2)}</span>}
                     </div>
                     <div className="min-w-0 flex-1">
                       <div className="text-sm font-extrabold text-slate-900 truncate">{mp.name || "마켓플레이스"}</div>
                      {isLoading ? (
                        <div className="mt-0 h-3 w-28 rounded bg-slate-200 animate-pulse"></div>
                      ) : (
                        <div className="text-xs text-slate-500 truncate">{priceText || ""}</div>
                      )}
                     </div>
                   </div>
                 {/* 버튼 위 여백 최소화 및 가운데 정렬 */}
                 <div className="mt-0 flex justify-center">
                   {isLoading ? (
                     <div className="h-6 w-20 rounded-md bg-slate-200 animate-pulse"></div>
                   ) : (
                     <div className={"inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md " + (url ? "bg-slate-900 text-white group-hover:bg-black" : "bg-slate-200 text-slate-600")}>
                       {url ? "바로가기" : "대기"}
                     </div>
                   )}
                 </div>
               </Wrapper>
             );
           })}
         </div>
       );
     }

    renderTabContent(book, activeTab) {
      const desc = book?.description || "";
      const toc = book?.table_of_contents || "";
      const meta = {
        uuid: book?.uuid,
        title: book?.title,
        subtitle: book?.subtitle,
        authors: book?.authors,
        publisher: book?.publisher,
        published_date: book?.published_date,
        publish_year: book?.publish_year,
        isbn13: book?.isbn13,
        isbn10: book?.isbn10,
        language: book?.language,
        page_count: book?.page_count,
        source_primary: book?.source_primary,
        source_list: book?.source_list,
        last_query: book?.last_query,
        last_query_at: book?.last_query_at,
        updated_at: book?.updated_at,
      };

      const boxCls = "mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 whitespace-pre-wrap leading-6";

      if (activeTab === "desc") {
        return <div className={boxCls}>{desc ? desc : "소개가 없습니다."}</div>;
      }
      if (activeTab === "toc") {
        return <div className={boxCls}>{toc ? toc : "목차가 없습니다."}</div>;
      }
      if (activeTab === "meta") {
        return <pre className={boxCls + " font-mono text-xs"}>{JSON.stringify(meta, null, 2)}</pre>;
      }
      if (activeTab === "raw") {
        const raw = book?.raw_json || "";
        return <pre className={boxCls + " font-mono text-xs overflow-auto"}>{raw ? raw : "원본 JSON이 없습니다."}</pre>;
      }
      return null;
    }

    render() {
      const { loading, error, book, activeTab } = this.state;

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
              <div className="text-rose-700 font-extrabold text-lg">오류 발생</div>
              <div className="mt-2 text-rose-700 text-sm break-words">{error}</div>
            </div>
          </div>
        );
      }

      const title = book?.title || "제목 없음";
      const subtitle = book?.subtitle || "";
      const cover = book?.cover_url || "";
      // 메타 필드 원본 값(빈값 판단용)
      const rawPublisher = (book?.publisher || "").toString();
      const rawPublishedDate = (book?.published_date || "").toString();
      const rawIsbn13 = (book?.isbn13 || "").toString();
      const rawIsbn10 = (book?.isbn10 || "").toString();
      const rawLanguage = (book?.language || "").toString();
      const rawPageCount = (book?.page_count !== null && book?.page_count !== undefined) ? String(book.page_count) : "";
      // 표시 여부
      const hasPublisher = rawPublisher.trim() !== "";
      const hasPublishedDate = rawPublishedDate.trim() !== "";
      const hasIsbn = (rawIsbn13.trim() !== "") || (rawIsbn10.trim() !== "");
      const hasLangOrPage = rawLanguage.trim() !== "" || rawPageCount.trim() !== "";
      const hasMetaInfo = hasPublisher || hasPublishedDate || hasIsbn || hasLangOrPage;
      // 표시용 값 (기존 레이아웃과 호환)
      const publisher = hasPublisher ? rawPublisher : "-";
      const publishedDate = hasPublishedDate ? formatPublishedDate(rawPublishedDate) : "-";
      
      const isbn = hasIsbn ? (rawIsbn13 || rawIsbn10) : "-";
      const language = hasLangOrPage ? `${rawLanguage || "-"} · ${rawPageCount || "-"}` : "-";
      const pageCount = rawPageCount || "-";
      // 저자 표시: 배열이면 각 요소를 '^', ',', ';', '|'로 분리하여 평탄화한 뒤 ", "로 결합
      const rawAuthors = book?.authors || "";
      let authorsDisplay = "-";
      const splitRe = /[\^,;|]+/;
      if (Array.isArray(rawAuthors)) {
        const parts = rawAuthors.flatMap(a => {
          const nameStr = (typeof a === "string") ? a : (a && a.name) ? a.name : String(a || "");
          return nameStr.split(splitRe).map(s => s.trim()).filter(Boolean);
        });
        authorsDisplay = parts.length ? parts.join(", ") : "-";
      } else {
        const s = String(rawAuthors || "").split(splitRe).map(x => x.trim()).filter(Boolean).join(", ");
        authorsDisplay = s ? s : "-";
      }
      const publishYear = (book?.publish_year !== null && book?.publish_year !== undefined) ? book.publish_year : "-";
      const uuid = book?.uuid || "";
       // 소개/목차가 비어있다면 표시하지 않기 위해 미리 trim
       const desc = (book?.description || "").toString().trim();
       const toc = (book?.table_of_contents || "").toString().trim();
       
       return (
         <div className="min-h-screen bg-white">
           <main className="max-w-6xl mx-auto px-4 py-8">
             <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
               <div className="grid grid-cols-12 md:grid-cols-1 gap-6">
                 
                 <div className="col-span-4 md:col-span-1">
                   <div
                     className="bg-slate-100 rounded-xl border border-slate-200 overflow-hidden w-48 md:w-full mx-auto cursor-pointer hover:opacity-95 transition"
                     role="link"
                     tabIndex={0}
                     onClick={() => openRandomCommissionLink(book)}
                     onKeyDown={(e) => {
                       if (e.key === "Enter" || e.key === " ") openRandomCommissionLink(book);
                     }}
                     title="표지를 클릭하면 마켓플레이스로 이동합니다"
                   >
                     <img className="w-full h-auto object-cover"
                          src={cover}
                          alt={title}
                          onError={(e) => { e.currentTarget.src = "https://cdn.jsdelivr.net/gh/statground/Statground_CDN@main/images/book_cover_fallback.png"; }} />
                   </div>

                   {/* 출판사/출간일/ISBN/언어·페이지가 있을 때만 표시 */}
                   {hasMetaInfo ? (
                     <div className="mt-4 grid grid-cols-2 md:grid-cols-1 gap-3">
                       {hasPublisher ? (
                         <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                           <div className="text-xs text-slate-500">출판사</div>
                           <div className="text-sm font-semibold text-slate-900 mt-1 break-words">{publisher}</div>
                         </div>
                       ) : null}

                       {hasPublishedDate ? (
                         <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                           <div className="text-xs text-slate-500">출간일</div>
                           <div className="text-sm font-semibold text-slate-900 mt-1 break-words">{publishedDate}</div>
                         </div>
                       ) : null}

                       {hasIsbn ? (
                         <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                           <div className="text-xs text-slate-500">ISBN</div>
                           <div className="text-sm font-semibold text-slate-900 mt-1 break-words">{isbn}</div>
                         </div>
                       ) : null}

                       {hasLangOrPage ? (
                         <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                           <div className="text-xs text-slate-500">언어 · 페이지</div>
                           <div className="text-sm font-semibold text-slate-900 mt-1 break-words">{rawLanguage ? rawLanguage : "-"} · {rawPageCount ? rawPageCount : "-"}</div>
                         </div>
                       ) : null}
                     </div>
                   ) : null}

                   {/* 좌측 UUID 표시 블록 제거 */}
                 </div>

                 <div className="col-span-8 md:col-span-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
                      {subtitle ? <p className="mt-2 text-slate-600 text-base md:text-lg">{subtitle}</p> : null}

                      <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                        <div>
                          <span className="text-slate-500">저자</span>
                          <span className="mx-1 text-slate-300">|</span>
                          <a className="font-semibold text-slate-900 hover:underline" href={`/data/book/?author=${encodeURIComponent(authorsDisplay)}`}>{authorsDisplay}</a>
                        </div>
                        <div>
                          <span className="text-slate-500">출판연도</span>
                          <span className="mx-1 text-slate-300">|</span>
                          <span className="font-semibold text-slate-900">{publishYear}</span>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="text-xs font-semibold text-slate-500 mb-2">키워드</div>
                        {this.renderKeywords(book)}
                      </div>
                    </div>

                    {/* 우측 UUID 표시 블록 제거 */}
                  </div>

                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                     <h2 className="text-base font-bold text-slate-900">마켓플레이스</h2>
                   </div>
                   <div className="mt-3">
                     {this.renderMarketplace(book)}
                   </div>
                 </div>

                  {/* 소개 / 목차를 탭 대신 순차적으로 보여줌 (메타데이터·원본 JSON 제외) */}
                  <div className="mt-7">
                    {desc ? (
                      <div className="mt-4">
                        <div className="text-xs font-semibold text-slate-500 mb-2">소개</div>
                        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 whitespace-pre-wrap leading-6">
                          {desc}
                        </div>
                      </div>
                    ) : null}

                    {toc ? (
                      <div className={`mt-6 ${desc ? "" : "mt-0"}`}>
                        <div className="text-xs font-semibold text-slate-500 mb-2">목차</div>
                        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 whitespace-pre-wrap leading-6">
                          {toc}
                        </div>
                      </div>
                    ) : null}
                  </div>
 
                </div>
              </div>
            </section>
          </main>
        </div>
      );
    }
  }

  const root = ReactDOM.createRoot(document.getElementById("div_main"));
  root.render(<BookDetail />);
}
