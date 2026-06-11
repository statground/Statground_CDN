(function () {
  const dict = {
    ko: {
      back: "워크벤치",
      title: "강의 워크벤치",
      desc: "Inflearn에서 수집된 강의 데이터를 빠르게 탐색하고 상태를 확인합니다.",
      searchPlaceholder: "강의명, 카테고리, 키워드 검색...",
      search: "검색",
      sort: "정렬",
      sortLatest: "최신 개설/업데이트",
      sortStudents: "수강생 많은 순",
      sortLessons: "강의 수 많은 순",
      sortRating: "평점 높은 순",
      sortReviews: "리뷰 많은 순",
      searchResults: "검색 결과",
      recentTitle: "Inflearn 강의",
      latestN: "표시 {n}개",
      loading: "불러오는 중...",
      searching: "검색하는 중...",
      empty: "표시할 강의가 없습니다.",
      noResults: "검색 결과가 없습니다.",
      recentError: "강의를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
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
      price: "가격",
      free: "무료",
      instructor: "지식공유자",
      instructors: "지식공유자",
      introduction: "강의 소개",
      overview: "강의 구성",
      curriculum: "커리큘럼",
      keywords: "키워드",
      features: "제공 항목",
      newBadge: "NEW",
      bestBadge: "BEST",
      certificate: "수료증",
      answer: "질문 답변",
      inquiry: "문의",
      preview: "미리보기",
      video: "영상",
      attachment: "자료",
      moreUnits: "그 외 {n}개 강의"
    },
    en: {
      back: "Workbench",
      title: "Lecture Workbench",
      desc: "Explore Inflearn lecture data collected into Statground.",
      searchPlaceholder: "Search by title, category, keyword...",
      search: "Search",
      sort: "Sort",
      sortLatest: "Newest opened/updated",
      sortStudents: "Most students",
      sortLessons: "Most lessons",
      sortRating: "Highest rating",
      sortReviews: "Most reviews",
      searchResults: "Search results",
      recentTitle: "Inflearn courses",
      latestN: "Showing {n}",
      loading: "Loading...",
      searching: "Searching...",
      empty: "No courses to show.",
      noResults: "No results.",
      recentError: "Failed to load courses. Please try again.",
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
      price: "Price",
      free: "Free",
      instructor: "Instructor",
      instructors: "Instructors",
      introduction: "Course Introduction",
      overview: "Course Overview",
      curriculum: "Curriculum",
      keywords: "Keywords",
      features: "Included",
      newBadge: "NEW",
      bestBadge: "BEST",
      certificate: "Certificate",
      answer: "Q&A",
      inquiry: "Inquiry",
      preview: "Preview",
      video: "Video",
      attachment: "Files",
      moreUnits: "{n} more lessons"
    }
  };

  const sortOptions = [
    ["latest", "sortLatest"],
    ["students", "sortStudents"],
    ["lessons", "sortLessons"],
    ["rating", "sortRating"],
    ["reviews", "sortReviews"]
  ];

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

  function displayLang(lang) {
    const raw = String(lang || "").trim();
    const lower = raw.toLowerCase();
    if (!raw) return "ko";
    if (lower === "zh" || lower.startsWith("zh-")) {
      return lower.includes("tw") || lower.includes("hk") || lower.includes("mo") || lower.includes("hant") ? "zh-Hant" : "zh-Hans";
    }
    if (lower === "pt" || lower.startsWith("pt-")) return "pt-BR";
    if (lower === "tl" || lower.startsWith("tl-") || lower === "fil" || lower.startsWith("fil-")) return "fil";
    const supported = ["ko", "en", "ja", "zh-Hans", "zh-Hant", "es", "fr", "de", "pt-BR", "ru", "id", "vi", "th", "ms", "fil", "hi", "ar", "it", "nl", "pl", "sv", "tr", "uk"];
    return supported.find((code) => lower === code.toLowerCase() || lower.startsWith(code.toLowerCase() + "-")) || "ko";
  }

  function t(lang, key) {
    const d = dict[displayLang(lang)] || dict[String(lang || "").slice(0, 2)] || dict.en;
    return d[key] || dict.en[key] || dict.ko[key] || key;
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

  function stripHTML(value) {
    return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  function splitKeywords(raw) {
    return String(raw || "")
      .split(/[#,|]/)
      .map((x) => x.trim())
      .filter(Boolean)
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .slice(0, 18);
  }

  function courseHref(lang, item) {
    return `/${encodeURIComponent(displayLang(lang))}/workbench/lecture/details/${encodeURIComponent(item.course_id || "")}/`;
  }

  function inflearnAffiliateHref(lang, item) {
    const courseID = item && item.course_id ? item.course_id : "";
    return `/${encodeURIComponent(displayLang(lang))}/workbench/lecture/affiliate/inflearn/${encodeURIComponent(courseID)}/`;
  }

  function apiURL(lang, path) {
    return `/${encodeURIComponent(displayLang(lang))}/workbench/lecture/${path}`;
  }

  function featureBadges(lang, item) {
    return [
      item && item.is_new ? t(lang, "newBadge") : "",
      item && item.is_best ? t(lang, "bestBadge") : "",
      item && item.provides_certificate ? t(lang, "certificate") : "",
      item && item.provides_instructor_answer ? t(lang, "answer") : "",
      item && item.provides_inquiry ? t(lang, "inquiry") : ""
    ].filter(Boolean);
  }

  function cardHTML(lang, item) {
    const title = esc(item.title || "(no title)");
    const category = [item.category_main_title, item.category_sub_title].filter(Boolean).join(" / ");
    const href = courseHref(lang, item);
    const thumb = item.thumbnail_url
      ? `<img src="${esc(item.thumbnail_url)}" alt="" class="h-full w-full object-cover" loading="lazy" decoding="async" />`
      : `<div class="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">Inflearn</div>`;
    const chips = featureBadges(lang, item).slice(0, 2).map((x) => `<span class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">${esc(x)}</span>`).join("");
    return `
      <a href="${href}" class="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950">
        <div class="flex gap-4">
          <div class="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
            ${thumb}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex min-h-5 flex-wrap gap-1">${chips}</div>
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
    const options = sortOptions.map(([value, label]) => `<option value="${esc(value)}">${esc(t(lang, label))}</option>`).join("");
    root.innerHTML = `
      <div class="mx-auto max-w-6xl">
        <div class="mb-8">
          <a href="/${esc(displayLang(lang))}/workbench/" class="text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">← ${esc(t(lang, "back"))}</a>
          <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">${esc(t(lang, "title"))}</h1>
          <p class="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">${esc(t(lang, "desc"))}</p>
        </div>
        <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div class="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
              <svg class="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" stroke-width="2"></circle><path stroke-width="2" d="M21 21l-4.3-4.3"></path></svg>
              <input id="sg-lecture-search-input" type="search" class="w-full border-0 bg-transparent text-sm text-slate-900 outline-none focus:ring-0 dark:text-white" placeholder="${esc(t(lang, "searchPlaceholder"))}" />
            </div>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label for="sg-lecture-sort" class="sr-only">${esc(t(lang, "sort"))}</label>
              <select id="sg-lecture-sort" class="h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                ${options}
              </select>
              <button id="sg-lecture-search-button" type="button" class="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-extrabold text-white transition hover:bg-blue-700">${esc(t(lang, "search"))}</button>
            </div>
          </div>
        </section>
        <section id="sg-lecture-results" class="mt-8"></section>
      </div>
    `;
  }

  function sectionHTML(title, subtitle, body) {
    return `
      <div class="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
    const langCode = displayLang(lang);
    const limit = window.matchMedia && window.matchMedia("(max-width: 767px)").matches ? 3 : 12;
    renderShell(root, langCode);
    const results = document.getElementById("sg-lecture-results");
    const input = document.getElementById("sg-lecture-search-input");
    const button = document.getElementById("sg-lecture-search-button");
    const sort = document.getElementById("sg-lecture-sort");

    async function loadRecent() {
      const sortValue = sort && sort.value ? sort.value : "latest";
      results.innerHTML = sectionHTML(t(langCode, "recentTitle"), t(langCode, "latestN").replace("{n}", String(limit)), `<div class="text-sm text-slate-600 dark:text-slate-300">${esc(t(langCode, "loading"))}</div>`);
      try {
        const json = await fetchJSON(apiURL(langCode, `ajax_recent_inflearn/?limit=${limit}&lang=${encodeURIComponent(langCode)}&sort=${encodeURIComponent(sortValue)}`));
        results.innerHTML = sectionHTML(t(langCode, "recentTitle"), t(langCode, "latestN").replace("{n}", String(limit)), listHTML(langCode, json.items || [], t(langCode, "empty")));
      } catch (_) {
        results.innerHTML = sectionHTML(t(langCode, "recentTitle"), "", `<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${esc(t(langCode, "recentError"))}</div>`);
      }
    }

    async function search() {
      const q = (input && input.value ? input.value : "").trim();
      if (!q) {
        await loadRecent();
        return;
      }
      const sortValue = sort && sort.value ? sort.value : "latest";
      results.innerHTML = sectionHTML(t(langCode, "searchResults"), q, `<div class="text-sm text-slate-600 dark:text-slate-300">${esc(t(langCode, "searching"))}</div>`);
      const body = new URLSearchParams({ q, lang: langCode, sort: sortValue, limit: "48" });
      try {
        const json = await fetchJSON(apiURL(langCode, "ajax_search_inflearn/"), { method: "POST", body });
        results.innerHTML = sectionHTML(t(langCode, "searchResults"), `${q} · ${number((json.items || []).length)}`, listHTML(langCode, json.items || [], t(langCode, "noResults")));
      } catch (_) {
        results.innerHTML = sectionHTML(t(langCode, "searchResults"), q, `<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${esc(t(langCode, "searchError"))}</div>`);
      }
    }

    if (button) button.addEventListener("click", search);
    if (sort) sort.addEventListener("change", search);
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
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">${esc(label)}</div>
        <div class="mt-1 break-words text-sm font-extrabold text-slate-900 dark:text-white">${esc(value || "-")}</div>
      </div>
    `;
  }

  function instructorHTML(lang, item) {
    const instructors = Array.isArray(item.instructors) ? item.instructors : [];
    if (instructors.length === 0) return "";
    return sectionHTML(t(lang, "instructors"), "", `
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        ${instructors.map((x) => {
          const intro = stripHTML(x.introduce_html || "");
          const thumb = x.thumbnail_url
            ? `<img src="${esc(x.thumbnail_url)}" alt="" class="h-12 w-12 rounded-full object-cover" loading="lazy" decoding="async" />`
            : `<div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">IN</div>`;
          return `
            <div class="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              ${thumb}
              <div class="min-w-0">
                <div class="truncate text-sm font-extrabold text-slate-900 dark:text-white">${esc(x.name || t(lang, "instructor"))}</div>
                ${x.role ? `<div class="mt-0.5 text-xs text-slate-500">${esc(x.role)}</div>` : ""}
                ${intro ? `<p class="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">${esc(intro)}</p>` : ""}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `);
  }

  function curriculumHTML(lang, item) {
    const rows = Array.isArray(item.curriculum) ? item.curriculum : [];
    if (rows.length === 0) return "";
    const sections = [];
    const byKey = new Map();
    rows.forEach((unit) => {
      const key = `${unit.section_id || 0}:${unit.section_title || ""}`;
      if (!byKey.has(key)) {
        const section = { title: unit.section_title || t(lang, "curriculum"), units: [] };
        byKey.set(key, section);
        sections.push(section);
      }
      byKey.get(key).units.push(unit);
    });
    const maxUnits = 80;
    let shown = 0;
    const body = sections.map((section) => {
      const units = section.units.filter(() => {
        shown += 1;
        return shown <= maxUnits;
      });
      if (units.length === 0) return "";
      return `
        <div class="border-b border-slate-100 py-4 last:border-b-0 dark:border-slate-800">
          <h3 class="text-sm font-black text-slate-900 dark:text-white">${esc(section.title)}</h3>
          <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            ${units.map((unit) => {
              const labels = [
                unit.is_preview ? t(lang, "preview") : "",
                unit.has_video ? t(lang, "video") : "",
                unit.has_attachment ? t(lang, "attachment") : ""
              ].filter(Boolean);
              return `
                <div class="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
                  <div class="line-clamp-2 text-xs font-bold text-slate-800 dark:text-slate-100">${esc(unit.unit_title || "-")}</div>
                  <div class="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-500">
                    ${unit.runtime_sec ? `<span>${esc(runtime(unit.runtime_sec))}</span>` : ""}
                    ${labels.map((x) => `<span>${esc(x)}</span>`).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
    const more = rows.length > maxUnits ? `<p class="mt-4 text-xs font-bold text-slate-500">${esc(t(lang, "moreUnits").replace("{n}", number(rows.length - maxUnits)))}</p>` : "";
    return sectionHTML(t(lang, "curriculum"), `${number(rows.length)} ${t(lang, "units")}`, body + more);
  }

  function keywordHTML(lang, item) {
    const words = splitKeywords(item.keywords);
    if (words.length === 0) return "";
    return sectionHTML(t(lang, "keywords"), "", `
      <div class="flex flex-wrap gap-2">
        ${words.map((word) => `<span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">${esc(word)}</span>`).join("")}
      </div>
    `);
  }

  async function renderDetail(root, lang) {
    const langCode = displayLang(lang);
    const courseID = detailCourseID();
    root.innerHTML = `<div class="mx-auto max-w-6xl text-sm text-slate-600 dark:text-slate-300">${esc(t(langCode, "loading"))}</div>`;
    try {
      const json = await fetchJSON(apiURL(langCode, `ajax_detail_inflearn/?course_id=${encodeURIComponent(courseID)}&lang=${encodeURIComponent(langCode)}`));
      if (!json.found || !json.item) {
        root.innerHTML = `<div class="mx-auto max-w-6xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">${esc(t(langCode, "detailNotFound"))}</div>`;
        return;
      }
      const item = json.item;
      const category = [item.category_main_title, item.category_sub_title].filter(Boolean).join(" / ");
      const thumb = item.thumbnail_url ? `<img src="${esc(item.thumbnail_url)}" alt="" class="h-full w-full object-cover" loading="eager" decoding="async" />` : "";
      const badges = featureBadges(langCode, item);
      const instructors = Array.isArray(item.instructors) && item.instructors.length > 0
        ? item.instructors.map((x) => x.name).filter(Boolean).join(", ")
        : "-";
      const featureBody = badges.length > 0
        ? `<div class="flex flex-wrap gap-2">${badges.map((x) => `<span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">${esc(x)}</span>`).join("")}</div>`
        : `<div class="text-sm text-slate-600 dark:text-slate-300">-</div>`;
      root.innerHTML = `
        <div class="mx-auto max-w-6xl">
          <div class="mb-4">
            <a href="/${esc(langCode)}/workbench/lecture/" class="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">← ${esc(t(langCode, "title"))}</a>
          </div>
          <article class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
              <div class="md:col-span-4">
                <div class="aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">${thumb}</div>
              </div>
              <div class="md:col-span-8">
                <div class="flex flex-wrap gap-2">
                  ${badges.slice(0, 3).map((x) => `<span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">${esc(x)}</span>`).join("")}
                </div>
                <h1 class="mt-3 text-2xl font-black leading-snug text-slate-900 dark:text-white md:text-4xl">${esc(item.title || "(no title)")}</h1>
                <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">${esc(item.description || "")}</p>
                <div class="mt-5 flex flex-wrap gap-3">
                  <a href="${esc(inflearnAffiliateHref(langCode, item))}" target="_blank" rel="noopener noreferrer sponsored" class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700">${esc(t(langCode, "openOriginal"))}</a>
                </div>
              </div>
            </div>
            <div class="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              ${statHTML(t(langCode, "students"), number(item.student_count))}
              ${statHTML(t(langCode, "rating"), rating(item.average_star))}
              ${statHTML(t(langCode, "reviews"), number(item.review_count))}
              ${statHTML(t(langCode, "price"), priceText(langCode, item))}
              ${statHTML(t(langCode, "units"), number(item.lecture_unit_count))}
              ${statHTML(t(langCode, "runtime"), runtime(item.runtime_sec))}
              ${statHTML(t(langCode, "category"), category)}
              ${statHTML(t(langCode, "level"), item.level_code || "-")}
              ${statHTML(t(langCode, "instructor"), instructors)}
              ${statHTML(t(langCode, "published"), item.published_at || "-")}
              ${statHTML(t(langCode, "updated"), item.last_updated_at || "-")}
            </div>
          </article>
          <div class="mt-6 grid grid-cols-1 gap-6">
            ${sectionHTML(t(langCode, "introduction"), "", `<p class="text-sm leading-7 text-slate-700 dark:text-slate-200">${esc(item.description || "")}</p>`)}
            ${sectionHTML(t(langCode, "features"), "", featureBody)}
            ${instructorHTML(langCode, item)}
            ${curriculumHTML(langCode, item)}
            ${keywordHTML(langCode, item)}
          </div>
        </div>
      `;
    } catch (_) {
      root.innerHTML = `<div class="mx-auto max-w-6xl rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${esc(t(langCode, "detailError"))}</div>`;
    }
  }

  async function render() {
    const root = document.getElementById("div_main");
    if (!root) return;
    const lang = displayLang(routeLang());
    if (detailCourseID()) {
      await renderDetail(root, lang);
    } else {
      await renderIndex(root, lang);
    }
  }

  window.set_main = render;
  window.addEventListener("sg_lang_changed", render);
})();
