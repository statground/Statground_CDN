// children이 있는 메뉴만 드롭다운 대상
const DROPDOWN_IDS = MENU_ITEMS.filter(m => m.children?.length).map(m => m.id);

// ===== 2) State & Class Presets =====
const MenuState = {
  hamburger: false,
  sections: Object.fromEntries(DROPDOWN_IDS.map(id => [id, false])),
};

const CLASS_PC_OPEN     = "mt-1 bg-white border-gray-200 shadow-sm border-y block md:hidden";
const CLASS_MOBILE_OPEN = "flex flex-col w-full justify-center items-start px-[30px] pt-[6px] pb-[10px] space-y-1 border-b";
const CLASS_HIDDEN      = "hidden";

// ===== 3) Utilities =====
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
    menuMobile.className = MenuState.hamburger
      ? "hidden md:flex md:flex-col md:visible md:mt-[20px]"
      : "hidden";
  }
}

// ===== 4) SVG Icon (>> Double Chevron) =====
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

// ===== 5) Unified Menu Component =====
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
          class="flex flex-row justify-center items-center w-fit px-[24px] h-4/6 text-sm rounded-lg cursor-pointer hover:bg-blue-100"
          onClick={onClick}
          role="button"
          tabindex="0"
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
        >
          {item.label}
        </span>
      );
    }
    return (
      <div class="flex flex-row justify-cetner items-center visible md:hidden">
        {MENU_ITEMS.map((m) => <Item key={m.id} item={m} />)}
      </div>
    );
  }

  // ─── PC Dropdown (Category etc.) ────────────────
  function PCDropdowns() {
    return (
      <>
        {MENU_ITEMS.filter(m => m.children?.length).map((m) => (
          <div key={m.id} id={elemIdPC(m.id)} class="hidden">
            <div class="grid grid-cols-3 max-w-full px-[200px] py-2 mx-auto text-sm text-gray-600">
              <ul class="my-2 space-y-2">
                {m.children.slice(0, Math.ceil(m.children.length/2)).map((c) => (
                  <li key={c.slug} class="flex flex-row justify-center items-center w-full">
                    <a href={`/data/${c.slug}/`} class="px-4 py-2 w-full text-center hover:bg-blue-100">{c.label}</a>
                  </li>
                ))}
              </ul>
              <ul class="my-2 space-y-2">
                {m.children.slice(Math.ceil(m.children.length/2)).map((c) => (
                  <li key={c.slug} class="flex flex-row justify-center items-center w-full">
                    <a href={`/data/${c.slug}/`} class="px-4 py-2 w-full text-center hover:bg-blue-100">{c.label}</a>
                  </li>
                ))}
              </ul>
              <ul class="my-2"></ul>
            </div>
            <div class="flex flex-row justify-center items-center bg-gray-100 border-b border-gray-300 shadow">
              <p class="text-xs text-gray-700">{m.label}</p>
            </div>
          </div>
        ))}
      </>
    );
  }

  // ─── Mobile Components ──────────────────────────
  function MobileTitle({ title, onClick }) {
    return (
      <div
        class="flex flex-row items-center w-full h-[34px] px-[20px] cursor-pointer hover:bg-blue-200"
        onClick={onClick}
      >
        <SvgDoubleChevronRight class="mr-2" size={14} />
        <span class="text-[15px]">{title}</span>
      </div>
    );
  }

  function MobileChild({ title, url }) {
    return (
      <div
        class="flex items-center w-full h-[28px] px-[28px] cursor-pointer hover:bg-blue-100"
        onClick={() => (location.href = url)}
      >
        <span class="text-[14px]">- {title}</span>
      </div>
    );
  }

  function MobileMenuList() {
    return (
      <div id="div_menu_mobile" class="hidden">
        {MENU_ITEMS.map((m) => {
          if (m.children?.length) {
            return (
              <React.Fragment key={m.id}>
                <MobileTitle title={m.label} onClick={() => click_dropdown(m.id)} />
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
              class="flex flex-col justify-center items-start w-full h-[40px] px-[20px] hover:bg-blue-200"
              href={m.href}
            >
              <span class="text-[15px]">{m.label}</span>
            </a>
          );
        })}
      </div>
    );
  }

  // ─── Hamburger ─────────────────────────────────
  function Hamburger() {
    return (
      <div class="flex items-center hidden md:flex md:visible" onClick={() => click_hamburger()}>
        <button
          type="button"
          class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
      </div>
    );
  }

  // ─── Render ────────────────────────────────────
  return (
    <div class="flex flex-col">
      <div onClick={() => click_dropdown()} id="div_menu_sub_header" class="w-full"></div>

      <nav class="flex flex-row justify-between bg-white border-gray-200 h-[50px] px-[200px] sm:px-[50px]">
        <a href="/" class="flex items-center text-xl font-bold">
          <img
            src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/logo/logo.png"
            class="object-scale-down h-6"
            alt="Statground Logo"
          />
        </a>
        <Hamburger />
        <PCMenuBar />
      </nav>

      {/* PC용 드롭다운 */}
      <PCDropdowns />

      {/* 모바일 메뉴 */}
      <MobileMenuList />
    </div>
  );
}

// ===== 6) Export & Mount =====
window.WebRMenu = {
  Div_menu,
  click_dropdown,
};
