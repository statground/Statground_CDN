// ============================================================
// Statground Menu + Header Bundle (20251220_1512)
// - Combines:
//   1) init_variables_20251220_1505.js  (MENU_ITEMS single source of truth)
//   2) menu.js                          (menu render + dropdown behavior)
//   3) get_menu_header.js               (login/user header via AJAX)
// - Target stack: Django + TiDB + text/babel + Tailwind/Flowbite
// ============================================================

/* global React, ReactDOM */

// ---------------------------------------------------------------------
// 0) Small helpers
// ---------------------------------------------------------------------
(function () {
  if (!window) return;

  // Avoid double-initializing if the script is included twice.
  if (window.__STATGROUND_MENU_BUNDLE_LOADED__) return;
  window.__STATGROUND_MENU_BUNDLE_LOADED__ = true;

  // Safe noop if console isn't available (older embedded envs)
  if (!window.console) window.console = { log() {}, warn() {}, error() {} };

  // Optional: click-outside to close menus (PC dropdown)
  // Attach once.
  document.addEventListener("click", function (e) {
    try {
      const menuRoot = document.getElementById("div_menu_root");
      if (!menuRoot) return;
      // If click is outside menu root -> close
      if (!menuRoot.contains(e.target)) {
        if (typeof window.WebRMenu?.click_dropdown === "function") {
          window.WebRMenu.click_dropdown(); // close all
        }
      }
    } catch (err) {
      // ignore
    }
  }, true);
})();

// ---------------------------------------------------------------------
// 1) Single Source of Truth (from init_variables_20251220_1505.js)
// ---------------------------------------------------------------------
const MENU_ITEMS = [
  {
    id: "category",
    label: "카테고리",
    children: [
      { label: "도서", slug: "book" },
      // Add more here later
    ],
  },
  { id: "community", label: "커뮤니티", href: "/community/" },
];

// ---------------------------------------------------------------------
// 2) Menu behavior + rendering (improved design)
//    - mobile/pc spacing 개선
//    - dropdown: 부드러운 그림자 + 둥근 모서리 + 넓이 제한
//    - 접근성: aria, keyboard
// ---------------------------------------------------------------------

// children이 있는 메뉴만 드롭다운 대상
const DROPDOWN_IDS = MENU_ITEMS.filter(m => m.children?.length).map(m => m.id);

// ===== State =====
const MenuState = {
  hamburger: false,
  sections: Object.fromEntries(DROPDOWN_IDS.map(id => [id, false])),
};

// ===== Class Presets =====
const CLASS_PC_OPEN     = "block md:hidden bg-white border-b border-gray-200 shadow-sm";
const CLASS_MOBILE_OPEN = "flex flex-col w-full justify-center items-start px-5 pt-1.5 pb-3 space-y-1 border-b border-gray-200 bg-white";
const CLASS_HIDDEN      = "hidden";

// ===== Utilities =====
function elemIdPC(id)     { return `div_megamenu_${id}`; }
function elemIdMobile(id) { return `div_menu_mobile_${id}`; }

function closeAllMenus() {
  DROPDOWN_IDS.forEach((id) => {
    MenuState.sections[id] = false;
    const pc = document.getElementById(elemIdPC(id));
    const mobile = document.getElementById(elemIdMobile(id));
    if (pc) pc.className = CLASS_HIDDEN;
    if (mobile) mobile.className = CLASS_HIDDEN;
  });
}

function click_dropdown(id) {
  if (!id) {
    closeAllMenus();
    return;
  }
  DROPDOWN_IDS.forEach((key) => {
    const willOpen = key === id && !MenuState.sections[key];
    MenuState.sections[key] = willOpen;

    const pc = document.getElementById(elemIdPC(key));
    const mobile = document.getElementById(elemIdMobile(key));
    if (pc) pc.className = willOpen ? CLASS_PC_OPEN : CLASS_HIDDEN;
    if (mobile) mobile.className = willOpen ? CLASS_MOBILE_OPEN : CLASS_HIDDEN;
  });
}

function click_hamburger() {
  const menuMobile = document.getElementById("div_menu_mobile");
  MenuState.hamburger = !MenuState.hamburger;
  if (menuMobile) {
    // md 이상: mobile menu 숨김
    menuMobile.className = MenuState.hamburger
      ? "md:hidden border-t border-gray-200"
      : "hidden md:hidden";
  }
}

// ===== SVG Icon (Double Chevron) =====
function SvgDoubleChevronRight(props) {
  const size = props.size || 14;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      class={props.class || ""}
    >
      <path d="M8 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

// ===== Unified Menu Component =====
function Div_menu() {

  // ─── PC Menu Bar ───────────────────────────────
  function PCMenuBar() {
    function Item({ item }) {
      const isDropdown = !!item.children?.length;
      const onClick = () => {
        if (isDropdown) click_dropdown(item.id);
        else if (item.href) location.href = item.href;
      };
      return (
        <span
          class="flex flex-row justify-center items-center w-fit px-4 py-2 text-sm rounded-xl cursor-pointer hover:bg-blue-50 active:bg-blue-100 transition-colors select-none"
          onClick={onClick}
          role="button"
          tabindex="0"
          aria-haspopup={isDropdown ? "menu" : undefined}
          aria-expanded={isDropdown ? (MenuState.sections[item.id] ? "true" : "false") : undefined}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
        >
          <span class="font-medium text-gray-800">{item.label}</span>
        </span>
      );
    }
    return (
      <div class="flex flex-row justify-center items-center visible md:hidden gap-1">
        {MENU_ITEMS.map((m) => <Item key={m.id} item={m} />)}
      </div>
    );
  }

  // ─── PC Dropdowns ───────────────────────────────
  function PCDropdowns() {
    const dropdownMenus = MENU_ITEMS.filter(m => m.children?.length);
    return (
      <>
        {dropdownMenus.map((m) => (
          <div key={m.id} id={elemIdPC(m.id)} class="hidden">
            <div class="max-w-6xl mx-auto px-6 lg:px-12 py-3">
              <div class="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                  {m.children.map((c) => (
                    <a
                      key={c.slug}
                      href={`/data/${c.slug}/`}
                      class="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors"
                      role="menuitem"
                    >
                      <span class="text-sm text-gray-800">{c.label}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </a>
                  ))}
                </div>
                <div class="flex justify-center items-center bg-gray-50 border-t border-gray-200 py-2">
                  <p class="text-xs text-gray-600">{m.label}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // ─── Mobile Components ──────────────────────────
  function MobileTitle({ title, onClick, expanded }) {
    return (
      <button
        type="button"
        class="flex flex-row items-center justify-between w-full h-11 px-5 hover:bg-blue-50 active:bg-blue-100 transition-colors"
        onClick={onClick}
        aria-expanded={expanded ? "true" : "false"}
      >
        <span class="flex items-center">
          <SvgDoubleChevronRight class="mr-2 text-gray-500" size={14} />
          <span class="text-[15px] font-medium text-gray-800">{title}</span>
        </span>
        <span class="text-xs text-gray-500">{expanded ? "닫기" : "열기"}</span>
      </button>
    );
  }

  function MobileChild({ title, url }) {
    return (
      <a
        class="flex items-center w-full h-10 px-8 hover:bg-blue-50 transition-colors"
        href={url}
      >
        <span class="text-[14px] text-gray-700">- {title}</span>
      </a>
    );
  }

  function MobileMenuList() {
    return (
      <div id="div_menu_mobile" class="hidden md:hidden bg-white">
        {MENU_ITEMS.map((m) => {
          if (m.children?.length) {
            const expanded = !!MenuState.sections[m.id];
            return (
              <React.Fragment key={m.id}>
                <MobileTitle title={m.label} expanded={expanded} onClick={() => click_dropdown(m.id)} />
                <div id={elemIdMobile(m.id)} class="hidden">
                  {m.children.map((c) => (
                    <MobileChild key={c.slug} title={c.label} url={`/data/${c.slug}/`} />
                  ))}
                </div>
              </React.Fragment>
            );
          }
          return (
            <a
              key={m.id}
              class="flex items-center w-full h-11 px-5 hover:bg-blue-50 transition-colors"
              href={m.href}
            >
              <span class="text-[15px] font-medium text-gray-800">{m.label}</span>
            </a>
          );
        })}
      </div>
    );
  }

  // ─── Hamburger ─────────────────────────────────
  function Hamburger() {
    return (
      <button
        type="button"
        class="flex items-center md:flex hidden p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
        onClick={() => click_hamburger()}
        aria-label="Open main menu"
        aria-controls="div_menu_mobile"
        aria-expanded={MenuState.hamburger ? "true" : "false"}
      >
        <img
          src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/menu_hamburger.svg"
          class="w-8 h-8"
          alt="Menu"
        />
      </button>
    );
  }

  // ─── Render ────────────────────────────────────
  return (
    <div id="div_menu_root" class="flex flex-col w-full">
      <div id="div_menu_sub_header" class="w-full"></div>

      <nav class="w-full bg-white border-b border-gray-200">
        <div class="flex flex-row justify-between items-center h-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
          <a href="/" class="flex items-center gap-2 text-xl font-bold">
            <img
              src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/logo/logo.png"
              class="object-contain h-7"
              alt="Statground Logo"
            />
          </a>

          <Hamburger />
          <PCMenuBar />
        </div>
      </nav>

      <PCDropdowns />
      <MobileMenuList />
    </div>
  );
}

// Export
window.WebRMenu = {
  Div_menu,
  click_dropdown,
};

// ---------------------------------------------------------------------
// 3) Header (AJAX + Render) - improved UI + fixes
//    - Duplicate id 제거
//    - role badge 개선 + (준회원) CTA 강조
// ---------------------------------------------------------------------
async function get_menu_header() {
  const mount = document.getElementById("div_menu_sub_header");
  if (!mount) return;

  const data = await fetch("/ajax_get_menu_header/")
    .then((res) => res.json())
    .catch(() => ({ role: "", name: "" }));

  window.gv_role = data["role"] || "";

  function roleBadge(role) {
    if (role === "관리자") return "bg-purple-50 text-purple-700 border-purple-200";
    if (role === "정회원") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (role === "준회원") return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  function HeaderLink(props) {
    return (
      <a
        href={props.url}
        class="inline-flex items-center gap-2 hover:underline underline-offset-4 text-gray-700 hover:text-gray-900 transition-colors"
      >
        {props.url_image != null && (
          <img src={props.url_image} class="w-4 h-4" alt="" />
        )}
        <span class="text-sm">{props.name}</span>
      </a>
    );
  }

  function Div_sub_menu_header(props) {
    const isLoggedIn = (window.gv_username || "") !== "";

    return (
      <div class="w-full bg-gray-50 border-b border-gray-200">
        <div class="flex justify-end items-center h-9 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 gap-3">
          {!isLoggedIn ? (
            <>
              <HeaderLink url={"/account/"} name={"로그인"} />
              <span class="text-gray-300">|</span>
              <HeaderLink url={"/account/signup/"} name={"회원 가입"} />
            </>
          ) : (
            <>
              <HeaderLink
                url={"/account/myinfo/"}
                name={props.data.name}
                url_image={
                  "https://cdn.jsdelivr.net/gh/statground/statkiss_CDN/images/svg/header_user.svg"
                }
              />

              <span class="text-gray-300">|</span>

              <a href="/intro/membership/" class="inline-flex items-center gap-2">
                <span class={"inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold " + roleBadge(props.data.role)}>
                  {props.data.role || "회원"}
                </span>
                {props.data.role === "준회원" && (
                  <span class="text-xs font-semibold text-red-600 animate-pulse">
                    정회원 가입하기
                  </span>
                )}
              </a>

              {props.data.role === "관리자" && (
                <>
                  <span class="text-gray-300">|</span>
                  <HeaderLink url={"/admin/"} name={"Admin"} />
                </>
              )}

              <span class="text-gray-300">|</span>
              <HeaderLink url={"/account/logout/"} name={"로그아웃"} />
            </>
          )}
        </div>
      </div>
    );
  }

  ReactDOM.render(<Div_sub_menu_header data={data} />, mount);
}

// Export header getter too (optional)
window.WebRMenuHeader = {
  get_menu_header,
};

// ---------------------------------------------------------------------
// 4) Optional auto-run (safe)
// ---------------------------------------------------------------------
(function () {
  try {
    if (document.getElementById("div_menu_sub_header")) {
      get_menu_header();
    }
  } catch (e) {
    // ignore
  }
})();
