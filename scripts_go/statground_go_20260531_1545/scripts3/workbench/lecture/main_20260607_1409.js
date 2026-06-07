(function () {
  const dict = {
    ko: {
      back: "워크벤치",
      title: "강의 워크벤치",
      desc: "Inflearn에서 수집된 강의 데이터를 빠르게 탐색하고 상태를 확인합니다.",
      searchPlaceholder: "강의명, 카테고리, 키워드, course ID 검색...",
      search: "검색",
      searchResults: "검색 결과",
      recentTitle: "최근 수집된 Inflearn 강의",
      latestN: "최신 {n}개",
      loading: "불러오는 중...",
      searching: "검색하는 중...",
      empty: "표시할 강의가 없습니다.",
      noResults: "검색 결과가 없습니다.",
      recentError: "최근 수집된 강의를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      searchError: "강의를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      detailError: "강의 상세를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      detailNotFound: "강의를 찾을 수 없습니다.",
      openOriginal: "Inflearn에서 보기",
      students: "수강생",
      reviews: "리뷰",
      rating: "평점",
      units: "강의 수",
      runtime: "총 시간",
      category: "카테고리",
      level: "난이도",
      published: "공개일",
      updated: "업데이트",
      fetched: "수집",
      price: "가격",
      free: "무료",
      instructor: "지식공유자",
      badges: "특징",
      newBadge: "NEW",
      bestBadge: "BEST",
      certificate: "수료증",
      answer: "질문 답변",
      inquiry: "문의",
      locale: "locale",
      courseID: "Course ID"
    },
    en: {
      back: "Workbench",
      title: "Lecture Workbench",
      desc: "Explore Inflearn lecture data collected into Statground.",
      searchPlaceholder: "Search by title, category, keyword, course ID...",
      search: "Search",
      searchResults: "Search results",
      recentTitle: "Recently collected Inflearn courses",
      latestN: "Latest {n}",
      loading: "Loading...",
      searching: "Searching...",
      empty: "No courses to show.",
      noResults: "No results.",
      recentError: "Failed to load recent courses. Please try again.",
      searchError: "Failed to search courses. Please try again.",
      detailError: "Failed to load course details. Please try again.",
      detailNotFound: "Course not found.",
      openOriginal: "Open on Inflearn",
      students: "Students",
      reviews: "Reviews",
      rating: "Rating",
      units: "Lessons",
      runtime: "Runtime",
      category: "Category",
      level: "Level",
      published: "Published",
      updated: "Updated",
      fetched: "Fetched",
      price: "Price",
      free: "Free",
      instructor: "Instructor",
      badges: "Badges",
      newBadge: "NEW",
      bestBadge: "BEST",
      certificate: "Certificate",
      answer: "Q&A",
      inquiry: "Inquiry",
      locale: "locale",
      courseID: "Course ID"
    }
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function routeLang() {
    const seg = (location.pathname || "").split("/").filter(Boolean);
    if (seg.length > 0 && seg[0] !== "workbench") return seg[0];
    if (window.sg_get_current_lang) return window.sg_get_current_lang();
    return "ko";
  }

  function inflearnLocale(lang) {
    return String(lang || "").toLowerCase() === "en" ? "en" : "ko";
  }

  function t(lang, key) {
    const d = dict[lang] || dict[String(lang || "").slice(0, 2)] || dict.ko;
    return d[key] || dict.en[key] || key;
  }

  function number(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return "0";
    try { return new Intl.NumberFormat().format(n); } catch (_) { return String(n); }
  }

  function rating(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return "-";
    return n.toFixed(1);
  }

  function runtime(seconds) {
    const n = Number(seconds || 0);
    if (!Number.isFinite(n) || n <= 0) return "-";
    const h = Math.floor(n / 3600);
    const m = Math.round((n % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  function priceText(lang, item) {
    const regular = Number(item && item.krw_regular_price ? item.krw_regular_price : 0);
    const pay = Number(item && item.krw_pay_price ? item.krw_pay_price : 0);
    if (regular <= 0 && pay <= 0) return t(lang, "free");
    const value = pay > 0 ? pay : regular;
    return "KRW " + number(value);
  }

  function courseHref(lang, item) {
    return `/${encodeURIComponent(lang)}/workbench/lecture/details/${encodeURIComponent(item.course_id || "")}/`;
  }

  function apiURL(lang, path) {
    return `/${encodeURIComponent(lang)}/workbench/lecture/${path}`;
  }

  function cardHTML(lang, item) {
    const title = esc(item.title || "(no title)");
    const category = [item.category_main_title, item.category_sub_title].filter(Boolean).join(" / ");
    const href = courseHref(lang, item);
    const thumb = item.thumbnail_url
      ? `<img src="${esc(item.thumbnail_url)}" alt="" class="h-full w-full object-cover" loading="lazy" decoding="async" onerror="this.style.display='none';" />`
      : "";
    const chips = [
      item.is_new ? `<span class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">${esc(t(lang, "newBadge"))}</span>` : "",
      item.is_best ? `<span class="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">${esc(t(lang, "bestBadge"))}</span>` : ""
    ].filter(Boolean).join("");
    return `
      <a href="${href}" class="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950">
        <div class="flex gap-4">
          <div class="h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
            ${thumb}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap gap-1">${chips}</div>
            <h2 class="mt-1 line-clamp-2 text-sm font-extrabold leading-snug text-slate-900 dark:text-white">${title}</h2>
            <p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">${esc(category || item.level_code || "")}</p>
            <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
              <span>${esc(t(lang, "students"))}: ${number(item.student_count)}</span>
              <span>${esc(t(lang, "rating"))}: ${rating(item.average_star)}</span>
              <span>${esc(t(lang, "units"))}: ${number(item.lecture_unit_count)}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  }

  function renderShell(root, lang) {
    root.innerHTML = `
      <div class="mx-auto max-w-6xl">
        <div class="mb-8">
          <a href="/${esc(lang)}/workbench/" class="text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">← ${esc(t(lang, "back"))}</a>
          <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">${esc(t(lang, "title"))}</h1>
          <p class="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">${esc(t(lang, "desc"))}</p>
        </div>
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex flex-col gap-3 md:flex-row md:items-center">
            <div class="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
              <svg class="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" stroke-width="2"></circle><path stroke-width="2" d="M21 21l-4.3-4.3"></path></svg>
              <input id="sg-lecture-search-input" type="search" class="w-full border-0 bg-transparent text-sm text-slate-900 outline-none focus:ring-0 dark:text-white" placeholder="${esc(t(lang, "searchPlaceholder"))}" />
            </div>
            <button id="sg-lecture-search-button" type="button" class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700">${esc(t(lang, "search"))}</button>
          </div>
        </section>
        <section id="sg-lecture-results" class="mt-8"></section>
      </div>
    `;
  }

  function sectionHTML(title, subtitle, body) {
    return `
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h2 class="text-lg font-black text-slate-900 dark:text-white">${esc(title)}</h2>
          ${subtitle ? `<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">${esc(subtitle)}</p>` : ""}
        </div>
        <div class="px-6 py-5">${body}</div>
      </div>
    `;
  }

  function listHTML(lang, items, emptyText) {
    if (!items || items.length === 0) {
      return `<div class="text-sm text-slate-600 dark:text-slate-300">${esc(emptyText)}</div>`;
    }
    return `<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">${items.map((item) => cardHTML(lang, item)).join("")}</div>`;
  }

  async function fetchJSON(url, options) {
    const res = await fetch(url, Object.assign({ credentials: "same-origin", headers: { Accept: "application/json" } }, options || {}));
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) { json = null; }
    if (!res.ok || !json || json.ok === false) {
      throw new Error(json && json.error ? json.error : "request failed");
    }
    return json;
  }

  async function renderIndex(root, lang) {
    const locale = inflearnLocale(lang);
    const limit = window.matchMedia && window.matchMedia("(max-width: 767px)").matches ? 3 : 12;
    renderShell(root, lang);
    const results = document.getElementById("sg-lecture-results");
    const input = document.getElementById("sg-lecture-search-input");
    const button = document.getElementById("sg-lecture-search-button");

    async function loadRecent() {
      results.innerHTML = sectionHTML(t(lang, "recentTitle"), t(lang, "latestN").replace("{n}", String(limit)), `<div class="text-sm text-slate-600 dark:text-slate-300">${esc(t(lang, "loading"))}</div>`);
      try {
        const json = await fetchJSON(apiURL(lang, `ajax_recent_inflearn/?limit=${limit}&locale=${encodeURIComponent(locale)}`));
        results.innerHTML = sectionHTML(t(lang, "recentTitle"), t(lang, "latestN").replace("{n}", String(limit)), listHTML(lang, json.items || [], t(lang, "empty")));
      } catch (_) {
        results.innerHTML = sectionHTML(t(lang, "recentTitle"), "", `<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${esc(t(lang, "recentError"))}</div>`);
      }
    }

    async function search() {
      const q = (input && input.value ? input.value : "").trim();
      if (!q) {
        await loadRecent();
        return;
      }
      results.innerHTML = sectionHTML(t(lang, "searchResults"), q, `<div class="text-sm text-slate-600 dark:text-slate-300">${esc(t(lang, "searching"))}</div>`);
      const body = new URLSearchParams({ q, locale, limit: "48" });
      try {
        const json = await fetchJSON(apiURL(lang, "ajax_search_inflearn/"), { method: "POST", body });
        results.innerHTML = sectionHTML(t(lang, "searchResults"), `${q} · ${number((json.items || []).length)}`, listHTML(lang, json.items || [], t(lang, "noResults")));
      } catch (_) {
        results.innerHTML = sectionHTML(t(lang, "searchResults"), q, `<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${esc(t(lang, "searchError"))}</div>`);
      }
    }

    if (button) button.addEventListener("click", search);
    if (input) input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        search();
      }
    });
    await loadRecent();
  }

  function detailCourseID() {
    const parts = (location.pathname || "").split("/").filter(Boolean);
    const idx = parts.indexOf("lecture");
    if (idx < 0 || parts[idx + 1] !== "details") return "";
    return parts[idx + 2] || "";
  }

  function statHTML(label, value) {
    return `
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">${esc(label)}</div>
        <div class="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">${esc(value || "-")}</div>
      </div>
    `;
  }

  async function renderDetail(root, lang) {
    const locale = inflearnLocale(lang);
    const courseID = detailCourseID();
    root.innerHTML = `<div class="mx-auto max-w-6xl text-sm text-slate-600 dark:text-slate-300">${esc(t(lang, "loading"))}</div>`;
    try {
      const json = await fetchJSON(apiURL(lang, `ajax_detail_inflearn/?course_id=${encodeURIComponent(courseID)}&locale=${encodeURIComponent(locale)}`));
      if (!json.found || !json.item) {
        root.innerHTML = `<div class="mx-auto max-w-6xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">${esc(t(lang, "detailNotFound"))}</div>`;
        return;
      }
      const item = json.item;
      const category = [item.category_main_title, item.category_sub_title].filter(Boolean).join(" / ");
      const thumb = item.thumbnail_url ? `<img src="${esc(item.thumbnail_url)}" alt="" class="h-full w-full object-cover" loading="eager" decoding="async" />` : "";
      const instructors = Array.isArray(item.instructors) && item.instructors.length > 0
        ? item.instructors.map((x) => esc(x.name || String(x.instructor_id))).join(", ")
        : "-";
      const badges = [
        item.is_new ? t(lang, "newBadge") : "",
        item.is_best ? t(lang, "bestBadge") : "",
        item.provides_certificate ? t(lang, "certificate") : "",
        item.provides_instructor_answer ? t(lang, "answer") : "",
        item.provides_inquiry ? t(lang, "inquiry") : ""
      ].filter(Boolean);
      root.innerHTML = `
        <div class="mx-auto max-w-6xl">
          <div class="mb-4">
            <a href="/${esc(lang)}/workbench/lecture/" class="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">← ${esc(t(lang, "title"))}</a>
          </div>
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
              <div class="md:col-span-4">
                <div class="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">${thumb}</div>
              </div>
              <div class="md:col-span-8">
                <div class="flex flex-wrap gap-2">
                  ${badges.map((x) => `<span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">${esc(x)}</span>`).join("")}
                  <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">${esc(t(lang, "locale"))}: ${esc(item.locale || locale)}</span>
                </div>
                <h1 class="mt-3 text-2xl font-black leading-snug text-slate-900 dark:text-white md:text-4xl">${esc(item.title || "(no title)")}</h1>
                <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">${esc(item.description || "")}</p>
                <div class="mt-5 flex flex-wrap gap-3">
                  <a href="${esc(item.course_url || "https://www.inflearn.com/")}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700">${esc(t(lang, "openOriginal"))}</a>
                </div>
              </div>
            </div>
            <div class="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              ${statHTML(t(lang, "students"), number(item.student_count))}
              ${statHTML(t(lang, "rating"), rating(item.average_star))}
              ${statHTML(t(lang, "reviews"), number(item.review_count))}
              ${statHTML(t(lang, "price"), priceText(lang, item))}
              ${statHTML(t(lang, "units"), number(item.lecture_unit_count))}
              ${statHTML(t(lang, "runtime"), runtime(item.runtime_sec))}
              ${statHTML(t(lang, "category"), category)}
              ${statHTML(t(lang, "level"), item.level_code || "-")}
              ${statHTML(t(lang, "instructor"), instructors)}
              ${statHTML(t(lang, "published"), item.published_at || "-")}
              ${statHTML(t(lang, "updated"), item.last_updated_at || "-")}
              ${statHTML(t(lang, "fetched"), item.fetched_at || "-")}
            </div>
            <div class="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              ${esc(t(lang, "courseID"))}: ${esc(item.course_id || courseID)}
            </div>
          </article>
        </div>
      `;
    } catch (_) {
      root.innerHTML = `<div class="mx-auto max-w-6xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${esc(t(lang, "detailError"))}</div>`;
    }
  }

  async function render() {
    const root = document.getElementById("div_main");
    if (!root) return;
    const lang = routeLang();
    if (detailCourseID()) {
      await renderDetail(root, lang);
    } else {
      await renderIndex(root, lang);
    }
  }

  window.set_main = render;
  window.addEventListener("sg_lang_changed", render);
})();
