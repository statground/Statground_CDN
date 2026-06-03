(function () {
  const STYLE_ID = "statground-intro-logo-rail-style";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function shuffle(items) {
    const shuffled = items.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const current = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = current;
    }
    return shuffled;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "@keyframes statgroundIntroLogoRail {",
      "  from { transform: translate3d(0, 0, 0); }",
      "  to { transform: translate3d(-50%, 0, 0); }",
      "}",
      ".statground-intro-logo-rail {",
      "  overflow: hidden;",
      "  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);",
      "  mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);",
      "}",
      ".statground-intro-logo-track {",
      "  display: flex;",
      "  width: max-content;",
      "  gap: 1rem;",
      "  animation: statgroundIntroLogoRail var(--statground-intro-logo-duration, 130s) linear infinite;",
      "  will-change: transform;",
      "}",
      ".statground-intro-logo-rail:hover .statground-intro-logo-track {",
      "  animation-play-state: paused;",
      "}",
      "@media (prefers-reduced-motion: reduce) {",
      "  .statground-intro-logo-rail {",
      "    overflow-x: auto;",
      "    -webkit-mask-image: none;",
      "    mask-image: none;",
      "  }",
      "  .statground-intro-logo-track {",
      "    animation: none;",
      "  }",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function initRail(rail) {
    const track = rail.querySelector("[data-intro-logo-track]");
    if (!track || track.dataset.ready === "1") return;

    const originalItems = Array.from(track.querySelectorAll("[data-intro-logo-item]"));
    if (!originalItems.length) return;

    const orderedItems = shuffle(originalItems);
    track.textContent = "";
    orderedItems.forEach((item) => track.appendChild(item));
    orderedItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      track.appendChild(clone);
    });

    const duration = Math.max(90, orderedItems.length * 4);
    track.style.setProperty("--statground-intro-logo-duration", duration + "s");
    track.dataset.ready = "1";
  }

  ready(function () {
    ensureStyles();
    document.querySelectorAll("[data-intro-logo-rail]").forEach(initRail);
  });
})();
