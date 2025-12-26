  // safe string trim helper
  function strip(x){ return (x===undefined || x===null) ? "" : String(x).trim(); }

  // ✅ 서버 검색 활성화: google/loc/naver/openlibrary를 서버에서 모두 호출하고
  //    statground_book_raw.all에 저장 후 결과(uuid 포함)를 내려준다.
  const USE_SERVER_SEARCH = true;

  function set_main() {
	const { useEffect, useMemo, useRef, useState } = React;

	function safeText(v) {
	  if (v === null || v === undefined) return "";
	  if (typeof v === "string") return v;
	  return String(v);
	}

	// 날짜 포맷
	function formatDate(s) {
	  if (!s && s !== 0) return "";
	  const str = String(s).trim();
	  if (/^\d{8}$/.test(str)) return `${str.slice(0,4)}-${str.slice(4,6)}-${str.slice(6,8)}`;
	  if (/^\d{6}$/.test(str)) return `${str.slice(0,4)}-${str.slice(4,6)}`;
	  if (/^\d{4}$/.test(str)) return str;
	  return str;
	}

	// ---- source별 raw -> 표준 row로 매핑 ----
	function normalizeGoogle(item) {
	  const vi = item?.volumeInfo || {};
	  const authors = Array.isArray(vi?.authors) ? vi.authors.join(", ") : "";
	  const identifiers = Array.isArray(vi?.industryIdentifiers) ? vi.industryIdentifiers : [];
	  const isbn13 = identifiers.find(x => x?.type === "ISBN_13")?.identifier || "";
	  const isbn10 = identifiers.find(x => x?.type === "ISBN_10")?.identifier || "";
	  return {
		title: vi?.title || "",
		author: authors,
		publisher: vi?.publisher || "",
		published: vi?.publishedDate || "",
		isbn: isbn13 || isbn10,
		link: vi?.infoLink || item?.selfLink || "",
		cover: vi?.imageLinks?.thumbnail || vi?.imageLinks?.smallThumbnail || "",
		uuid: item?.uuid || "",
	  };
	}

	function normalizeNaver(item) {
	  const stripHtml = (s) => safeText(s).replace(/<[^>]*>/g, "");
	  return {
		title: stripHtml(item?.title),
		author: stripHtml(item?.author),
		publisher: stripHtml(item?.publisher),
		published: stripHtml(item?.pubdate),
		isbn: stripHtml(item?.isbn),
		link: stripHtml(item?.link),
		cover: stripHtml(item?.image),
		uuid: item?.uuid || "",
	  };
	}

	function normalizeOpenLibrary(doc) {
	  const authors = Array.isArray(doc?.author_name) ? doc.author_name.join(", ") : "";
	  const isbns = Array.isArray(doc?.isbn) ? doc.isbn : [];
	  const coverId = doc?.cover_i;
	  const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-S.jpg` : "";
	  const key = doc?.key ? `https://openlibrary.org${doc.key}` : "";
	  return {
		title: doc?.title || "",
		author: authors,
		publisher: Array.isArray(doc?.publisher) ? (doc.publisher[0] || "") : (doc?.publisher || ""),
		published: doc?.first_publish_year ? String(doc.first_publish_year) : "",
		isbn: isbns[0] || "",
		link: key,
		cover,
		uuid: doc?.uuid || "",
	  };
	}

	function normalizeLoc(r) {
	  const contributors = Array.isArray(r?.contributor) ? r.contributor.join(", ") : (r?.contributor || "");
	  return {
		title: r?.title || "",
		author: contributors,
		publisher: r?.publisher || "",
		published: r?.date || "",
		isbn: "",
		link: r?.url || "",
		cover: "",
		uuid: r?.uuid || "",
	  };
	}

	const SEARCH_SOURCES = [
	  { key: "google", label: "Google", normalize: normalizeGoogle },
	  { key: "naver", label: "Naver", normalize: normalizeNaver },
	  { key: "open_library", label: "OpenLibrary", normalize: normalizeOpenLibrary },
	  { key: "loc", label: "LoC", normalize: normalizeLoc },
	];

	const buildSearchForm = (q, field = "all") => {
	  const fd = new FormData();
	  fd.append("q", q);
	  fd.append("field", field);
	  return fd;
	};

	const firstArray = (...cands) => cands.find((c) => Array.isArray(c)) || [];
	const hasContent = (r) => [r?.title, r?.author, r?.published, r?.isbn, r?.link, r?.cover].some(v => safeText(v).trim());

	async function fetchJson(url, options) {
	  const opts = { ...options };
	  opts.headers = { ...opts.headers };
	  if (window.SG_BOOK?.csrfToken) {
		opts.headers["X-CSRFToken"] = window.SG_BOOK.csrfToken;
	  }
	  const res = await fetch(url, opts);
	  const ct = res.headers.get("content-type") || "";
	  if (!ct.includes("application/json")) {
		const text = await res.text();
		throw new Error(`JSON 아님 status=${res.status}, body=${text.slice(0, 120)}`);
	  }
	  const json = await res.json();
	  if (!res.ok || json?.ok === false) {
		throw new Error(json?.error || json?.message || res.statusText);
	  }
	  return json;
	}

	// 외부 API 전용 JSON 로더 (응답 ok 여부만 확인)
	async function fetchExternalJson(url) {
	  const res = await fetch(url, { headers: { "accept": "application/json" } });
	  const ct = res.headers.get("content-type") || "";
	  if (!ct.includes("application/json")) {
		const text = await res.text();
		throw new Error(`외부 API 응답이 JSON이 아님 status=${res.status}, body=${text.slice(0, 120)}`);
	  }
	  return res.json();
	}

	// 외부 API URL 빌더
	function buildGoogleUrl(q, field) {
	  const term = encodeURIComponent(String(q || "").trim());
	  let query = term;
	  if (field === "title") query = `intitle:${term}`;
	  else if (field === "author") query = `inauthor:${term}`;
	  else if (field === "isbn") query = `isbn:${term}`;
	  else if (field === "publisher") query = `inpublisher:${term}`;
	  return `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20`;
	}
	function buildOpenLibraryUrl(q, field) {
	  const term = encodeURIComponent(String(q || "").trim());
	  let query = term;
	  if (field === "title") query = `title:${term}`;
	  else if (field === "author") query = `author:${term}`;
	  else if (field === "isbn") query = `isbn:${term}`;
	  return `https://openlibrary.org/search.json?q=${query}&limit=20`;
	}
	function buildLocUrl(q) {
	  const term = encodeURIComponent(String(q || "").trim());
	  return `https://www.loc.gov/books/?q=${term}&fo=json`;
	}

	// 공개 API 폴백 집계
	async function clientAggregateSearch(q, field) {
	  const perSourceResults = { google: [], open_library: [], loc: [], naver: [] };
	  try {
		const g = await fetchExternalJson(buildGoogleUrl(q, field));
		perSourceResults.google = Array.isArray(g.items) ? g.items.map(normalizeGoogle).filter(hasContent) : [];
	  } catch (e) { /* 무시 */ }
	  try {
		const ol = await fetchExternalJson(buildOpenLibraryUrl(q, field));
		const docs = Array.isArray(ol.docs) ? ol.docs : [];
		perSourceResults.open_library = docs.map(normalizeOpenLibrary).filter(hasContent);
	  } catch (e) { /* 무시 */ }
	  try {
		const lo = await fetchExternalJson(buildLocUrl(q));
		const recs = Array.isArray(lo.results) ? lo.results : [];
		perSourceResults.loc = recs.map(normalizeLoc).filter(hasContent);
	  } catch (e) { /* 무시 */ }
	  return perSourceResults;
	}

	// 책 카드
	function BookCard({ b }) {
	  const cover = b?.cover_url || b?.cover || "";
	  const title = strip(b?.title) || "(no title)";
	  let authors = b?.authors ?? b?.author ?? "";
	  if (Array.isArray(authors)) authors = authors.join("^");
	  authors = safeText(authors).split("^").map(x => x.trim()).filter(Boolean).join(", ");

	  const publisher = strip(b?.publisher);
	  const publishedRaw = strip(b?.published_date || b?.published || b?.pubdate);
	  const published = formatDate(publishedRaw);

	  const tags = [];
	  if (publisher) tags.push(publisher);
	  if (published) tags.push(published);

	  const isUuid = (v) => {
		if (!v) return false;
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v));
	  };
	  const targetUrl = isUuid(b.uuid) ? `/data/book/${encodeURIComponent(b.uuid)}/` : (b.link || null);

	  function onKeyDown(e) {
		if (e.key === "Enter" || e.key === " ") {
		  if (isUuid(b.uuid)) window.location.href = targetUrl;
		  else if (b.link) window.open(b.link, "_blank", "noopener");
		}
	  }

	  return (
		<article
		  role="link"
		  tabIndex={0}
		  onKeyDown={onKeyDown}
		  onClick={() => {
			if (isUuid(b.uuid)) window.location.href = targetUrl;
			else if (b.link) window.open(b.link, "_blank", "noopener");
		  }}
		  className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
		>
		  <div className="flex gap-4">
			<div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
			  {cover ? (
				<img src={cover} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://cdn.jsdelivr.net/gh/statground/Statground_CDN@main/images/book_cover_fallback.png"; }} />
			  ) : (
				<span className="text-slate-400 text-xs">COVER</span>
			  )}
			</div>

			<div className="min-w-0 flex-1">
			  <h3 className="font-semibold leading-snug line-clamp-2 text-slate-900">{title}</h3>
			  <p className="text-sm text-slate-600 mt-1 line-clamp-1">{authors || "-"}</p>

			  {tags.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-1">
				  {tags.slice(0, 3).map((t, i) => (
					<span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
					  {t}
					</span>
				  ))}
				</div>
			  )}
			</div>
		  </div>
		</article>
	  );
	}

	// 검색 화면 컴포넌트
	function Div_main() {
	  const [query, setQuery] = useState("");
	  const [loading, setLoading] = useState(false);
	  const [error, setError] = useState(null);
	  const [result, setResult] = useState(null);
	  const [sourceRows, setSourceRows] = useState({});
	  const [hasSearched, setHasSearched] = useState(false);
	  const [showAllMerged, setShowAllMerged] = useState(false);

	  const [searchField, setSearchField] = useState("all");

	  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
	  const timerRef = useRef(null);
	  const inputRef = useRef(null);

	  const mergedRows = useMemo(() => {
		const r = result || {};
		return firstArray(
		  r.all,
		  r.results_all,
		  r.results,
		  r.aggregateJson?.results,
		  []
		).filter(Boolean);
	  }, [result]);

	  const fallbackRows = useMemo(() => {
		if (Array.isArray(result?.results) && result.results.length > 0) return result.results;
		const merged = [];
		SEARCH_SOURCES.forEach((src) => {
		  (sourceRows[src.key] || []).forEach((r, idx) => {
			merged.push({
			  title: r.title,
			  authors: r.author,
			  publisher: r.publisher || "",
			  published_date: r.published,
			  isbn10: r.isbn,
			  isbn13: "",
			  cover_url: r.cover,
			  link: r.link,
			  uuid: r.uuid || `${src.key}-${idx}`,
			  source_primary: src.label,
			});
		  });
		});
		return merged.filter(hasContent);
	  }, [result, sourceRows]);

	  const rows = (Array.isArray(mergedRows) && mergedRows.length > 0)
		? mergedRows
		: (fallbackRows || []);

	  async function onSearch() {
		const q = (query || "").trim();
		if (!q) {
		  setShowEmptyWarning(true);
		  inputRef.current?.focus();
		  if (timerRef.current) clearTimeout(timerRef.current);
		  timerRef.current = setTimeout(() => setShowEmptyWarning(false), 2000);
		  return;
		}

		setHasSearched(true);
		setLoading(true);
		setError(null);
		setResult(null);
		setSourceRows({});

		if (USE_SERVER_SEARCH) {
		  try {
			const aggregateJson = await fetchJson("/data/ajax_book_search/?pages=3", {
			  method: "POST",
			  body: buildSearchForm(q, searchField),
			});
			const perSourceResults = {};
			SEARCH_SOURCES.forEach((src) => {
			  const savedData = aggregateJson.saved?.[src.key];
			  perSourceResults[src.key] = savedData?.results
				? savedData.results.map(src.normalize).filter(hasContent)
				: [];
			});
			setSourceRows(perSourceResults);
			setResult(aggregateJson);
		  } catch (e) {
			try {
			  const perSourceResults = await clientAggregateSearch(q, searchField);
			  setSourceRows(perSourceResults);
			} catch (e2) {
			  setError(e2?.message || String(e2));
			}
		  } finally {
			setLoading(false);
		  }
		} else {
		  try {
			const perSourceResults = await clientAggregateSearch(q, searchField);
			setSourceRows(perSourceResults);
		  } catch (e2) {
			setError(e2?.message || String(e2));
		  } finally {
			setLoading(false);
		  }
		}
	  }

	  function setChip(v) {
		setQuery(v);
		setSearchField("all");
		setTimeout(() => onSearch(), 0);
	  }

	  useEffect(() => {
		function onKey(e) {
		  if (e.key === "/" && document.activeElement !== inputRef.current) {
			e.preventDefault();
			inputRef.current?.focus();
		  }
		  if (e.key === "Escape") {
			if (document.activeElement === inputRef.current) setQuery("");
		  }
		}
		document.addEventListener("keydown", onKey);
		return () => {
		  document.removeEventListener("keydown", onKey);
		  if (timerRef.current) clearTimeout(timerRef.current);
		};
	  }, []);

	  const countAll = rows.length;

	  const placeholderText = searchField === "title" ? "제목을 입력하세요 (단축키 /)"
		: searchField === "author" ? "저자를 입력하세요 (단축키 /)"
		: searchField === "isbn" ? "ISBN을 입력하세요 (단축키 /)"
		: searchField === "publisher" ? "출판사를 입력하세요 (단축키 /)"
		: "검색어를 입력하세요 (제목·저자·ISBN·키워드, 단축키 /)";

	  return (
		<div className="w-full">
		  <header className="bg-white">
			<div className="bg-grid border-b border-slate-200">
			  <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
				<div className="grid md:grid-cols-12 gap-8 items-start">
				  <div className="md:col-span-5">
					<div className="rounded-2xl border border-slate-500 bg-white shadow-sm p-4 md:p-5">
					  <div className="flex items-start justify-between gap-3">
						<div>
						  <div className="text-sm font-semibold">도서 검색</div>
						  <div className="text-xs text-slate-500">제목·저자·ISBN·키워드</div>
						</div>
					  </div>

					  <div className="mt-3 flex gap-2">
						{[
						  { key: "all", label: "전체" },
						  { key: "title", label: "제목" },
						  { key: "author", label: "저자" },
						  { key: "isbn", label: "ISBN" },
						  { key: "publisher", label: "출판사" },
						].map((s) => (
						  <button
							key={s.key}
							type="button"
							onClick={() => setSearchField(s.key)}
							aria-pressed={searchField === s.key}
							className={
							  "text-sm px-3 py-1 rounded-md border " +
							  (searchField === s.key
								? "bg-slate-900 text-white border-slate-900"
								: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
							}
						  >
							{s.label}
						  </button>
						))}
					  </div>

					  <div className="mt-3">
						<label className="sr-only" htmlFor="q">검색어</label>
						<div className="relative">
						  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
							<svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
							  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
								d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
							</svg>
						  </div>
						  <input
							id="q"
							ref={inputRef}
							type="search"
							className="block w-full rounded-xl border border-slate-300 bg-white p-3 pl-10 text-sm focus:border-slate-900 focus:ring-slate-900"
							value={query}
							onChange={(e) => { setQuery(e.target.value); setShowEmptyWarning(false); }}
							onKeyDown={(e) => e.key === "Enter" && onSearch()}
							placeholder={placeholderText}
							autoComplete="off"
						  />
						  {showEmptyWarning && (
							<div className="absolute left-0 mt-1 text-sm text-white bg-red-600 px-3 py-1 rounded shadow">
							  검색어를 입력하세요
							</div>
						  )}
						</div>

						<div className="mt-3 flex justify-between items-center">
						  <button
							id="btnSearch"
							className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 w-full"
							type="button"
							onClick={onSearch}
							disabled={loading}
						  >
							{loading ? "검색중..." : "검색"}
						  </button>
						</div>
					  </div>
					</div>
				  </div>
				</div>
			  </div>
			</div>
		  </header>

		  <div className="mx-auto max-w-6xl px-4 py-8 md:py-10 space-y-10">
			{hasSearched && !error && !loading && (
			  <section>
				<div className="flex items-end justify-between gap-4">
				  <div>
					<h2 className="text-xl font-bold">검색 결과</h2>
				  </div>
				  <div className="text-sm text-slate-600">
					<span className="font-semibold">{countAll}</span>건
				  </div>
				</div>

				<div className="mt-5">
				  {countAll === 0 ? (
					<div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center text-slate-500">
					  결과가 없습니다.
					</div>
				  ) : (
					<>
					  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{(showAllMerged ? rows : rows.slice(0, 9)).map((b, idx) => (
						  <BookCard key={b.uuid || idx} b={b} />
						))}
					  </div>

					  {countAll > 9 && (
						<div className="mt-4 text-sm text-slate-600">
						  <button
							type="button"
							className="underline decoration-slate-300 hover:decoration-slate-900"
							onClick={() => setShowAllMerged((v) => !v)}
						  >
							{showAllMerged ? "접기" : "더 보기"}
						  </button>
						</div>
					  )}
					</>
				  )}
				</div>
			  </section>
			)}

			{!hasSearched && (
			  <section>
				<div className="flex items-end justify-between gap-4">
				  <div>
					<h2 className="text-xl font-bold">카테고리</h2>
				  </div>
				</div>

				<div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
				  <button type="button" onClick={() => setChip("통계 기초")} className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
					<div className="font-semibold">통계 기초</div>
					<div className="text-sm text-slate-600 mt-1">확률 · 추정 · 검정</div>
				  </button>
				  <button type="button" onClick={() => setChip("데이터 분석")} className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
					<div className="font-semibold">데이터 분석</div>
					<div className="text-sm text-slate-600 mt-1">SQL · EDA · 리포팅</div>
				  </button>
				  <button type="button" onClick={() => setChip("머신러닝")} className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
					<div className="font-semibold">머신러닝</div>
					<div className="text-sm text-slate-600 mt-1">모델 · 평가 · 튜닝</div>
				  </button>
				  <button type="button" onClick={() => setChip("데이터 엔지니어링")} className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
					<div className="font-semibold">데이터 엔지니어링</div>
					<div className="text-sm text-slate-600 mt-1">파이프라인 · DW/DM</div>
				  </button>
				</div>
			  </section>
			)}
		  </div>
		</div>
	  );
	}

	const root = ReactDOM.createRoot(document.getElementById("div_main"));
	root.render(<Div_main />);
  }