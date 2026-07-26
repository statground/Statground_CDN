/**
 * National bibliography explorer for Statground Book.
 *
 * Progressive enhancement only: the existing catalog remains usable when the
 * NLK-derived discovery views are unavailable or this request fails.
 */
(function () {
  "use strict";

  if (window.__statgroundNationalBibliographyLoaded) return;
  window.__statgroundNationalBibliographyLoaded = true;

  var SOURCE_URL = "https://lod.nl.go.kr/home/dataset/datadownload.do";
  var KOGL_URL = "https://www.kogl.or.kr/info/licenseType1.do";
  var CC0_URL = "https://creativecommons.org/publicdomain/zero/1.0/";
  var isKorean = String(document.documentElement.lang || "").toLowerCase().indexOf("ko") === 0;
  var copy = isKorean ? {
    explorerTitle: "국가서지로 둘러보기",
    explorerDescription: "국립중앙도서관 국가서지 LOD를 바탕으로 KDC 주제별 책을 살펴보세요.",
    all: "전체",
    loading: "서지 정보를 불러오는 중입니다.",
    empty: "이 분류에서 표시할 책이 아직 없습니다.",
    count: "권",
    published: "발행",
    libraryTitle: "전국 도서관 디렉터리",
    libraryDescription: "도서관 이름을 검색할 수 있습니다. 특정 책의 소장·대출 가능 여부를 뜻하지 않습니다.",
    libraryPlaceholder: "도서관 이름",
    librarySearch: "도서관 찾기",
    libraryEmpty: "검색 결과가 없습니다.",
    libraryMore: "더 보기",
    homepage: "홈페이지",
    phone: "전화",
    closed: "휴관",
    contextTitle: "국가서지 맥락",
    contextDescription: "국립중앙도서관 LOD의 분류·주제·전거 정보를 함께 보여드립니다.",
    classification: "KDC 분류",
    subjects: "주제",
    languages: "언어",
    places: "발행지",
    series: "총서",
    extents: "형태",
    authors: "저자 전거",
    aliases: "다른 이름",
    fields: "활동 분야",
    jobs: "직업",
    related: "함께 살펴볼 책",
    source: "출처: 국립중앙도서관 국가서지 LOD",
    updated: "데이터 갱신",
    license: "공공누리 제1유형 · CC0 1.0"
  } : {
    explorerTitle: "Browse the national bibliography",
    explorerDescription: "Explore books by KDC subject using the National Library of Korea LOD bibliography.",
    all: "All",
    loading: "Loading bibliography information.",
    empty: "No books are available in this category yet.",
    count: "books",
    published: "Published",
    libraryTitle: "Library directory",
    libraryDescription: "Search libraries by name. This does not indicate that a particular book is held or available.",
    libraryPlaceholder: "Library name",
    librarySearch: "Find libraries",
    libraryEmpty: "No libraries found.",
    libraryMore: "Show more",
    homepage: "Website",
    phone: "Phone",
    closed: "Closed",
    contextTitle: "National bibliography context",
    contextDescription: "Classification, subjects, and authority data from the National Library of Korea LOD.",
    classification: "KDC classification",
    subjects: "Subjects",
    languages: "Languages",
    places: "Publication places",
    series: "Series",
    extents: "Extent",
    authors: "Author authorities",
    aliases: "Also known as",
    fields: "Fields",
    jobs: "Occupations",
    related: "Related books",
    source: "Source: National Library of Korea national bibliography LOD",
    updated: "Dataset updated",
    license: "KOGL Type 1 · CC0 1.0"
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function safeLink(raw) {
    try {
      var parsed = new URL(String(raw || ""), window.location.origin);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
      return parsed.href;
    } catch (_) {
      return "";
    }
  }

  function addParam(rawURL, key, value) {
    var parsed = new URL(rawURL, window.location.origin);
    if (value !== undefined && value !== null && String(value) !== "") {
      parsed.searchParams.set(key, String(value));
    } else {
      parsed.searchParams.delete(key);
    }
    return parsed.pathname + parsed.search;
  }

  async function getJSON(url, signal) {
    var response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { "Accept": "application/json" },
      signal: signal
    });
    if (!response.ok) throw new Error("request_failed");
    var payload = await response.json();
    if (!payload || !payload.ok) throw new Error("data_unavailable");
    return payload;
  }

  function formatDate(raw) {
    var value = String(raw || "").trim();
    if (!value) return "";
    var match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? match[1] + "-" + match[2] + "-" + match[3] : value;
  }

  function formatPubdate(raw) {
    var value = String(raw || "").replace(/\D/g, "");
    if (value.length >= 8) return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8);
    if (value.length >= 4) return value.slice(0, 4);
    return String(raw || "");
  }

  function detailsURL(isbn) {
    var parts = (window.location.pathname || "/").split("/").filter(Boolean);
    var lang = parts[0] || "ko";
    return "/" + encodeURIComponent(lang) + "/workbench/book/details/" + encodeURIComponent(String(isbn || "")) + "/";
  }

  function injectStyles() {
    if (document.getElementById("sg-national-bibliography-css")) return;
    var style = document.createElement("style");
    style.id = "sg-national-bibliography-css";
    style.textContent =
      ".sg-nb{max-width:1280px;margin:2rem auto 0;color:#0f172a}" +
      ".sg-nb__panel{border:1px solid #e2e8f0;border-radius:24px;background:linear-gradient(145deg,#f8fafc,#fff);padding:clamp(1rem,3vw,2rem);box-shadow:0 18px 50px rgba(15,23,42,.06)}" +
      ".sg-nb__eyebrow{font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#0369a1}" +
      ".sg-nb h2,.sg-nb h3,.sg-nb h4{margin:0;color:inherit}" +
      ".sg-nb h2{font-size:clamp(1.35rem,3vw,2rem);line-height:1.2}.sg-nb h3{font-size:1.15rem}" +
      ".sg-nb__lead{margin:.65rem 0 0;max-width:70ch;color:#475569;line-height:1.7}" +
      ".sg-nb__chips{display:flex;gap:.5rem;overflow:auto;padding:.95rem 0 .35rem;scrollbar-width:thin}" +
      ".sg-nb__chip{flex:0 0 auto;border:1px solid #cbd5e1;border-radius:999px;background:#fff;padding:.55rem .85rem;color:#334155;font:inherit;font-size:.86rem;font-weight:700;cursor:pointer}" +
      ".sg-nb__chip[aria-pressed=true]{border-color:#0369a1;background:#0369a1;color:#fff}" +
      ".sg-nb__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:.85rem;margin-top:1rem}" +
      ".sg-nb__book{display:flex;gap:.75rem;min-width:0;border:1px solid #e2e8f0;border-radius:16px;background:#fff;padding:.85rem;color:inherit;text-decoration:none;transition:transform .15s,border-color .15s}" +
      ".sg-nb__book:hover,.sg-nb__book:focus-visible{border-color:#38bdf8;transform:translateY(-2px);outline:none}" +
      ".sg-nb__cover{width:48px;height:68px;flex:0 0 auto;border-radius:7px;background:#e2e8f0;object-fit:cover}" +
      ".sg-nb__book-copy{min-width:0}.sg-nb__title{font-weight:800;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
      ".sg-nb__meta{margin-top:.3rem;color:#64748b;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".sg-nb__status{margin:1rem 0 0;color:#64748b;font-size:.9rem}" +
      ".sg-nb__library{margin-top:1.5rem;padding-top:1.35rem;border-top:1px solid #e2e8f0}" +
      ".sg-nb__form{display:flex;gap:.55rem;margin-top:.85rem}.sg-nb__input{min-width:0;flex:1;border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:.7rem .85rem;color:inherit;font:inherit}" +
      ".sg-nb__button{border:0;border-radius:12px;background:#0f172a;color:#fff;padding:.7rem 1rem;font:inherit;font-weight:800;cursor:pointer}" +
      ".sg-nb__library-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.7rem;margin-top:.9rem}" +
      ".sg-nb__library-card{border:1px solid #e2e8f0;border-radius:14px;background:#fff;padding:.85rem}.sg-nb__library-card p{margin:.35rem 0 0;color:#64748b;font-size:.82rem;line-height:1.5}" +
      ".sg-nb__library-card a{color:#0369a1;font-weight:700}.sg-nb__footer{display:flex;flex-wrap:wrap;gap:.45rem 1rem;margin-top:1.25rem;color:#64748b;font-size:.75rem}" +
      ".sg-nb__footer a{color:inherit;text-underline-offset:3px}" +
      ".sg-nb__context-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.8rem;margin-top:1rem}" +
      ".sg-nb__context-card{border:1px solid #e2e8f0;border-radius:16px;background:#fff;padding:1rem}.sg-nb__tag-list{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.65rem}" +
      ".sg-nb__tag{border-radius:999px;background:#e0f2fe;color:#0c4a6e;padding:.3rem .58rem;font-size:.78rem}.sg-nb__author{margin-top:.75rem;padding-top:.75rem;border-top:1px solid #e2e8f0}.sg-nb__author:first-of-type{border-top:0;padding-top:0}" +
      ".sg-nb__author p{margin:.3rem 0 0;color:#64748b;font-size:.82rem;line-height:1.5}" +
      "html.dark .sg-nb{color:#e2e8f0}html.dark .sg-nb__panel{border-color:#334155;background:linear-gradient(145deg,rgba(15,23,42,.94),rgba(2,6,23,.94))}" +
      "html.dark .sg-nb__lead,html.dark .sg-nb__meta,html.dark .sg-nb__status,html.dark .sg-nb__library-card p,html.dark .sg-nb__author p,html.dark .sg-nb__footer{color:#94a3b8}" +
      "html.dark .sg-nb__chip,html.dark .sg-nb__book,html.dark .sg-nb__library-card,html.dark .sg-nb__context-card,html.dark .sg-nb__input{border-color:#334155;background:#0f172a;color:#e2e8f0}" +
      "html.dark .sg-nb__chip[aria-pressed=true]{border-color:#38bdf8;background:#0369a1;color:#fff}" +
      "html.dark .sg-nb__library{border-color:#334155}html.dark .sg-nb__button{background:#e2e8f0;color:#0f172a}" +
      "@media(max-width:540px){.sg-nb__form{align-items:stretch;flex-direction:column}.sg-nb__grid{grid-template-columns:1fr}.sg-nb__panel{border-radius:18px}}";
    document.head.appendChild(style);
  }

  function renderSourceFooter(parent, updated) {
    var footer = el("div", "sg-nb__footer");
    var source = el("a", "", copy.source);
    source.href = SOURCE_URL;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    footer.appendChild(source);
    if (updated) footer.appendChild(el("span", "", copy.updated + ": " + formatDate(updated)));
    var license = el("span");
    var kogl = el("a", "", copy.license.split(" · ")[0]);
    kogl.href = KOGL_URL;
    kogl.target = "_blank";
    kogl.rel = "noopener noreferrer";
    license.appendChild(kogl);
    license.appendChild(document.createTextNode(" · "));
    var cc0 = el("a", "", "CC0 1.0");
    cc0.href = CC0_URL;
    cc0.target = "_blank";
    cc0.rel = "noopener noreferrer";
    license.appendChild(cc0);
    footer.appendChild(license);
    parent.appendChild(footer);
  }

  function renderBooks(parent, items) {
    clear(parent);
    if (!Array.isArray(items) || items.length === 0) {
      parent.appendChild(el("p", "sg-nb__status", copy.empty));
      return;
    }
    items.forEach(function (item) {
      var isbn = item && (item.isbn || item.canonical_isbn);
      if (!isbn) return;
      var card = el("a", "sg-nb__book");
      card.href = detailsURL(isbn);
      var cover = el("div", "sg-nb__cover");
      var coverURL = safeLink(item.image || item.cover_url);
      if (coverURL) {
        var image = el("img", "sg-nb__cover");
        image.src = coverURL;
        image.alt = "";
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        image.addEventListener("error", function () { image.replaceWith(cover); }, { once: true });
        card.appendChild(image);
      } else {
        card.appendChild(cover);
      }
      var body = el("div", "sg-nb__book-copy");
      body.appendChild(el("div", "sg-nb__title", item.title || isbn));
      if (item.author) body.appendChild(el("div", "sg-nb__meta", String(item.author).split("^").filter(Boolean).join(", ")));
      var published = formatPubdate(item.pubdate);
      if (item.publisher || published) {
        body.appendChild(el("div", "sg-nb__meta", [item.publisher, published && copy.published + " " + published].filter(Boolean).join(" · ")));
      }
      if (item.kdc_label || item.kdc_code) body.appendChild(el("div", "sg-nb__meta", [item.kdc_code, item.kdc_label].filter(Boolean).join(" ")));
      card.appendChild(body);
      parent.appendChild(card);
    });
  }

  function mountExplorer(root) {
    var discoveryURL = root.dataset.discoveryUrl;
    var librariesURL = root.dataset.librariesUrl;
    if (!discoveryURL || !librariesURL) return;

    root.classList.add("sg-nb");
    var panel = el("div", "sg-nb__panel");
    panel.appendChild(el("div", "sg-nb__eyebrow", "NLK LOD · 2026-05-29"));
    panel.appendChild(el("h2", "", copy.explorerTitle));
    panel.appendChild(el("p", "sg-nb__lead", copy.explorerDescription));
    var chips = el("div", "sg-nb__chips");
    chips.setAttribute("role", "group");
    var books = el("div", "sg-nb__grid");
    var status = el("p", "sg-nb__status", copy.loading);
    panel.appendChild(chips);
    panel.appendChild(status);
    panel.appendChild(books);

    var discoveryController = null;
    function loadDiscovery(kdc) {
      if (discoveryController) discoveryController.abort();
      discoveryController = new AbortController();
      status.hidden = false;
      status.textContent = copy.loading;
      Array.prototype.forEach.call(chips.querySelectorAll("button"), function (button) {
        button.setAttribute("aria-pressed", button.dataset.kdc === String(kdc || "") ? "true" : "false");
      });
      var requestURL = addParam(addParam(discoveryURL, "kdc", kdc || ""), "limit", "24");
      getJSON(requestURL, discoveryController.signal).then(function (payload) {
        var result = payload.discovery || {};
        clear(chips);
        var categories = [{ code: "", label: copy.all, book_count: 0 }].concat(Array.isArray(result.categories) ? result.categories : []);
        categories.forEach(function (category) {
          var label = category.label || category.code || copy.all;
          if (category.code && category.book_count !== undefined) {
            label += " · " + Number(category.book_count || 0).toLocaleString() + " " + copy.count;
          }
          var button = el("button", "sg-nb__chip", label);
          button.type = "button";
          button.dataset.kdc = category.code || "";
          button.setAttribute("aria-pressed", (category.code || "") === String(kdc || "") ? "true" : "false");
          button.addEventListener("click", function () { loadDiscovery(category.code || ""); });
          chips.appendChild(button);
        });
        renderBooks(books, result.items);
        status.hidden = true;
        var oldFooter = panel.querySelector(".sg-nb__footer");
        if (oldFooter) oldFooter.remove();
        renderSourceFooter(panel, result.dataset_updated_at);
      }).catch(function (error) {
        if (error && error.name === "AbortError") return;
        root.hidden = true;
      });
    }

    var library = el("section", "sg-nb__library");
    library.appendChild(el("h3", "", copy.libraryTitle));
    library.appendChild(el("p", "sg-nb__lead", copy.libraryDescription));
    var form = el("form", "sg-nb__form");
    var input = el("input", "sg-nb__input");
    input.type = "search";
    input.maxLength = 80;
    input.placeholder = copy.libraryPlaceholder;
    input.setAttribute("aria-label", copy.libraryPlaceholder);
    var searchButton = el("button", "sg-nb__button", copy.librarySearch);
    searchButton.type = "submit";
    form.appendChild(input);
    form.appendChild(searchButton);
    var libraryList = el("div", "sg-nb__library-list");
    var libraryStatus = el("p", "sg-nb__status");
    libraryStatus.hidden = true;
    var more = el("button", "sg-nb__button", copy.libraryMore);
    more.type = "button";
    more.hidden = true;
    library.appendChild(form);
    library.appendChild(libraryStatus);
    library.appendChild(libraryList);
    library.appendChild(more);
    panel.appendChild(library);
    root.appendChild(panel);

    var libraryCursor = "";
    var libraryController = null;
    function renderLibraries(items, append) {
      if (!append) clear(libraryList);
      (Array.isArray(items) ? items : []).forEach(function (item) {
        var card = el("article", "sg-nb__library-card");
        card.appendChild(el("h4", "", item.name || item.identifier || item.id));
        if (item.library_type) card.appendChild(el("p", "", item.library_type));
        if (item.phone) card.appendChild(el("p", "", copy.phone + ": " + item.phone));
        if (item.closed_days) card.appendChild(el("p", "", copy.closed + ": " + item.closed_days));
        var homepage = safeLink(item.homepage);
        if (homepage) {
          var link = el("a", "", copy.homepage);
          link.href = homepage;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          card.appendChild(link);
        }
        libraryList.appendChild(card);
      });
    }
    function loadLibraries(append) {
      if (libraryController) libraryController.abort();
      libraryController = new AbortController();
      libraryStatus.hidden = false;
      libraryStatus.textContent = copy.loading;
      var requestURL = addParam(addParam(librariesURL, "q", input.value.trim()), "limit", "12");
      if (append && libraryCursor) requestURL = addParam(requestURL, "cursor", libraryCursor);
      getJSON(requestURL, libraryController.signal).then(function (payload) {
        var result = payload.libraries || {};
        renderLibraries(result.items, append);
        libraryCursor = result.next_cursor || "";
        more.hidden = !libraryCursor;
        libraryStatus.textContent = libraryList.children.length ? "" : copy.libraryEmpty;
        libraryStatus.hidden = !!libraryList.children.length;
      }).catch(function (error) {
        if (error && error.name === "AbortError") return;
        libraryStatus.hidden = true;
        if (!append) clear(libraryList);
        more.hidden = true;
      });
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      libraryCursor = "";
      loadLibraries(false);
    });
    more.addEventListener("click", function () { loadLibraries(true); });
    loadDiscovery("");
  }

  function addTags(card, title, values) {
    values = (Array.isArray(values) ? values : []).filter(Boolean);
    if (!values.length) return false;
    card.appendChild(el("h3", "", title));
    var list = el("div", "sg-nb__tag-list");
    values.forEach(function (value) {
      var label = typeof value === "object" ? (value.label || value.name || value.code || value.id) : value;
      if (label) list.appendChild(el("span", "sg-nb__tag", label));
    });
    card.appendChild(list);
    return true;
  }

  function mountContext(root) {
    var contextURL = root.dataset.contextUrl;
    var isbn = root.dataset.isbn;
    if (!contextURL || !isbn) return;
    getJSON(addParam(contextURL, "isbn", isbn)).then(function (payload) {
      if (!payload.found || !payload.context) return;
      var data = payload.context;
      root.classList.add("sg-nb");
      var panel = el("div", "sg-nb__panel");
      panel.appendChild(el("div", "sg-nb__eyebrow", "NLK LOD · 2026-05-29"));
      panel.appendChild(el("h2", "", copy.contextTitle));
      panel.appendChild(el("p", "sg-nb__lead", copy.contextDescription));
      var grid = el("div", "sg-nb__context-grid");

      [
        [copy.classification, data.kdc],
        [copy.subjects, data.subjects],
        [copy.languages, data.languages],
        [copy.places, data.publication_places],
        [copy.series, data.series],
        [copy.extents, data.extents]
      ].forEach(function (section) {
        var card = el("section", "sg-nb__context-card");
        if (addTags(card, section[0], section[1])) grid.appendChild(card);
      });

      if (Array.isArray(data.authors) && data.authors.length) {
        var authors = el("section", "sg-nb__context-card");
        authors.appendChild(el("h3", "", copy.authors));
        data.authors.forEach(function (author) {
          var authorNode = el("div", "sg-nb__author");
          authorNode.appendChild(el("h4", "", author.name || author.id));
          var life = [author.birth_year, author.death_year].filter(Boolean).join("–");
          if (life) authorNode.appendChild(el("p", "", life));
          if (Array.isArray(author.aliases) && author.aliases.length) authorNode.appendChild(el("p", "", copy.aliases + ": " + author.aliases.join(", ")));
          if (Array.isArray(author.fields) && author.fields.length) authorNode.appendChild(el("p", "", copy.fields + ": " + author.fields.join(", ")));
          if (Array.isArray(author.job_titles) && author.job_titles.length) authorNode.appendChild(el("p", "", copy.jobs + ": " + author.job_titles.join(", ")));
          authors.appendChild(authorNode);
        });
        grid.appendChild(authors);
      }

      if (Array.isArray(data.related_books) && data.related_books.length) {
        var related = el("section", "sg-nb__context-card");
        related.appendChild(el("h3", "", copy.related));
        var relatedGrid = el("div", "sg-nb__grid");
        renderBooks(relatedGrid, data.related_books);
        related.appendChild(relatedGrid);
        grid.appendChild(related);
      }

      if (!grid.children.length) return;
      panel.appendChild(grid);
      renderSourceFooter(panel, data.dataset_updated_at);
      root.appendChild(panel);
    }).catch(function () {
      // Optional enrichment must never break the core book detail.
    });
  }

  injectStyles();
  var explorer = document.getElementById("book-bibliography-explorer");
  if (explorer) mountExplorer(explorer);
  var context = document.getElementById("book-bibliography-context");
  if (context) mountContext(context);
})();
