// safe string trim helper
function strip(x){ return (x===undefined || x===null) ? "" : String(x).trim(); }

const BOOK_UUID = (window.SG_BOOK && window.SG_BOOK.bookUuid) ? window.SG_BOOK.bookUuid : "";

function set_main() {
	// BookDetail (class component 유지)
	class BookDetail extends React.Component {
	  constructor(props) {
		super(props);
		this.state = {
		  loading: true,
		  error: "",
		  book: null,
		  activeTab: "desc",
		};
		this.handleCopy = this.handleCopy.bind(this);
	  }

	  componentDidMount() {
		this.load();
	  }

	  async load() {
		try {
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
		  this.setState({ book: bookObj, loading: false, error: "" });
		} catch (e) {
		  this.setState({ loading: false, error: (e && e.message) ? e.message : "오류가 발생했습니다." });
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
				 href={`/book/?keyword=${encodeURIComponent(k)}`}
				 className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50">
				#{k}
			  </a>
			))}
		  </div>
		);
	  }

	  renderMarketplace(book) {
		const mps = Array.isArray(book?.marketplaces) ? book.marketplaces : [];
		const price = book?.price || {};
		if (!mps.length) {
		  return (
			<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
			  마켓플레이스 정보가 없습니다.
			</div>
		  );
		}
		return (
		  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
			{mps.slice(0, 9).map((mp, idx) => {
			  const code = (mp.code || mp.uuid || mp.name || "").toString();
			  const p = (code && price && price[code]) ? price[code] : null;
			  const url = (p && p.url) ? p.url : (mp.url || "");
			  const priceText = p && (p.price || p.amount)
				? `${Number(p.price || p.amount).toLocaleString()}원`
				: (mp.price_text || "");
			  const disabled = !url || url === "#";
			  return (
				<a key={idx}
				   href={disabled ? "javascript:void(0)" : url}
				   target={disabled ? undefined : "_blank"}
				   rel={disabled ? undefined : "noopener"}
				   className={"group rounded-xl border border-slate-200 bg-white p-4 transition " + (disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50")}>
				  <div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
					  {mp.logo ? <img src={mp.logo} alt="" className="h-full w-full object-contain" /> : <span className="text-xs font-extrabold text-slate-600">{(mp.name || "MP").slice(0,2)}</span>}
					</div>
					<div className="min-w-0">
					  <div className="text-sm font-extrabold text-slate-900 truncate">{mp.name || "마켓플레이스"}</div>
					  <div className="text-xs text-slate-500 truncate">{priceText ? priceText : (disabled ? "준비중" : "구매/확인하기")}</div>
					</div>
				  </div>
				  <div className={"mt-3 inline-flex items-center justify-center w-full px-3 py-2 text-sm font-semibold rounded-lg " + (disabled ? "bg-slate-200 text-slate-600" : "bg-slate-900 text-white group-hover:bg-black")}>
					{disabled ? "준비중" : "바로가기"}
				  </div>
				</a>
			  );
			})}
		  </div>
		);
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
				<div className="mt-4">
				  <a href="/data/book/"
					 className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-black">
					검색으로 돌아가기
				  </a>
				</div>
			  </div>
			</div>
		  );
		}

		const title = book?.title || "제목 없음";
		const subtitle = book?.subtitle || "";
		const cover = book?.cover_url || "";
		const publisher = book?.publisher || "-";
		const publishedDate = book?.published_date || "-";
		const isbn = book?.isbn13 || book?.isbn10 || "-";
		const language = book?.language || "-";
		const pageCount = (book?.page_count !== null && book?.page_count !== undefined) ? book.page_count : "-";
		const authors = book?.authors || "-";
		const publishYear = (book?.publish_year !== null && book?.publish_year !== undefined) ? book.publish_year : "-";
		const uuid = book?.uuid || "";

		return (
		  <div className="min-h-screen">
			<header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
			  <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3 min-w-0">
				  <a href="/data/book/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-slate-900">
					<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">B</span>
					<span>도서</span>
				  </a>
				  <span className="text-slate-300">/</span>
				  <span className="text-sm text-slate-600 truncate">{title}</span>
				</div>
				<div className="flex items-center gap-2">
				  <button type="button"
						  onClick={() => this.handleCopy(uuid)}
						  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
					UUID 복사
				  </button>
				  <a href="/data/book/"
					 className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-black">
					검색으로 돌아가기
				  </a>
				</div>
			  </div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
			  <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
				  <div className="md:col-span-4">
					<div className="bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
					  <img className="w-full h-auto object-cover"
						   src={cover}
						   alt={title}
						   onError={(e) => { e.currentTarget.src = "https://cdn.jsdelivr.net/gh/statground/Statground_CDN@main/images/book_cover_fallback.png"; }} />
					</div>

					<div className="mt-4 grid grid-cols-2 gap-3">
					  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<div className="text-xs text-slate-500">출판사</div>
						<div className="text-sm font-semibold text-slate-900 mt-1 break-words">{publisher}</div>
					  </div>
					  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<div className="text-xs text-slate-500">출간일</div>
						<div className="text-sm font-semibold text-slate-900 mt-1 break-words">{publishedDate}</div>
					  </div>
					  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<div className="text-xs text-slate-500">ISBN</div>
						<div className="text-sm font-semibold text-slate-900 mt-1 break-words">{isbn}</div>
					  </div>
					  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<div className="text-xs text-slate-500">언어 · 페이지</div>
						<div className="text-sm font-semibold text-slate-900 mt-1 break-words">{language} · {pageCount}</div>
					  </div>
					</div>
				  </div>

				  <div className="md:col-span-8">
					<div className="flex items-start justify-between gap-4">
					  <div className="min-w-0">
						<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
						{subtitle ? <p className="mt-2 text-slate-600 text-base md:text-lg">{subtitle}</p> : null}

						<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
						  <div>
							<span className="text-slate-500">저자</span>
							<span className="mx-1 text-slate-300">|</span>
							<a className="font-semibold text-slate-900 hover:underline" href={`/data/book/?author=${encodeURIComponent(authors)}`}>{authors}</a>
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

					  <div className="shrink-0 text-right hidden sm:block">
						<div className="text-xs text-slate-500">UUID</div>
						<div className="mt-1 font-mono text-xs text-slate-700 break-all max-w-xs">{uuid}</div>
					  </div>
					</div>

					<div className="mt-6">
					  <div className="flex items-center justify-between">
						<h2 className="text-base font-bold text-slate-900">마켓플레이스</h2>
						<a href={book?.info_url || "#"} className="text-sm font-semibold text-slate-700 hover:underline">원본 정보 보기</a>
					  </div>
					  <div className="mt-3">
						{this.renderMarketplace(book)}
					  </div>
					</div>

					<div className="mt-6 flex flex-wrap gap-2">
					  {[
						["desc", "소개"],
						["toc", "목차"],
						["meta", "메타데이터"],
						["raw", "원본 JSON"],
					  ].map(([k, label]) => {
						const on = activeTab === k;
						return (
						  <button key={k}
								  type="button"
								  onClick={() => this.setState({ activeTab: k })}
								  className={"inline-flex items-center px-3 py-2 text-sm font-semibold rounded-lg " + (on ? "bg-slate-900 text-white hover:bg-black" : "border border-slate-200 bg-white hover:bg-slate-50")}>
							{label}
						  </button>
						);
					  })}
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