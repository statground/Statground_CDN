(function () {
  "use strict";

  var navs = Array.prototype.slice.call(document.querySelectorAll("[data-graflume-doc-nav]"));
  if (!navs.length) return;

  function decodedHash(value) {
    var raw = String(value || "");
    if (!raw || raw.charAt(0) !== "#" || raw.length === 1) return "";
    try {
      return decodeURIComponent(raw.slice(1));
    } catch (_error) {
      return "";
    }
  }

  function targetForLink(link) {
    var href = String(link.getAttribute("href") || "").trim();
    if (!href) return null;

    var hash = href.charAt(0) === "#" ? href : "";
    if (!hash) {
      try {
        var resolved = new URL(href, window.location.href);
        if (
          resolved.origin !== window.location.origin ||
          resolved.pathname !== window.location.pathname ||
          resolved.search !== window.location.search
        ) {
          return null;
        }
        hash = resolved.hash;
      } catch (_error) {
        return null;
      }
    }

    var id = decodedHash(hash);
    return id ? document.getElementById(id) : null;
  }

  navs.forEach(function (nav) {
    if (nav.dataset.graflumeDocNavBound === "true") return;
    nav.dataset.graflumeDocNavBound = "true";

    var allLinks = Array.prototype.slice.call(nav.querySelectorAll("a[href]"));
    var records = allLinks.map(function (link) {
      return { link: link, target: targetForLink(link) };
    }).filter(function (record) {
      return Boolean(record.target);
    });

    if (!records.length) return;

    var observer = null;
    var scheduled = false;
    var preferHashOnNextRefresh = false;
    var fallbackBound = false;
    var destroyed = false;

    function setCurrent(record) {
      allLinks.forEach(function (link) {
        link.removeAttribute("aria-current");
      });
      if (record) record.link.setAttribute("aria-current", "location");
    }

    function recordForHash() {
      var id = decodedHash(window.location.hash);
      if (!id) return null;
      for (var index = 0; index < records.length; index += 1) {
        if (records[index].target.id === id) return records[index];
      }
      return null;
    }

    function recordForPosition() {
      var activationLine = Math.max(96, Math.min(220, window.innerHeight * 0.24));
      var selected = records[0];

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        return records[records.length - 1];
      }

      records.forEach(function (record) {
        if (record.target.getBoundingClientRect().top <= activationLine) selected = record;
      });
      return selected;
    }

    function refresh() {
      scheduled = false;
      if (destroyed) return;
      var selected = preferHashOnNextRefresh ? recordForHash() : null;
      preferHashOnNextRefresh = false;
      setCurrent(selected || recordForPosition());
    }

    function schedule(preferHash) {
      preferHashOnNextRefresh = preferHashOnNextRefresh || Boolean(preferHash);
      if (scheduled || destroyed) return;
      scheduled = true;
      var requestFrame = window.requestAnimationFrame || function (callback) {
        return window.setTimeout(callback, 16);
      };
      requestFrame(refresh);
    }

    function onHashChange() {
      schedule(true);
    }

    function onPageShow() {
      schedule(true);
    }

    function onScrollOrResize() {
      schedule(false);
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      if (observer) observer.disconnect();
      if (fallbackBound) {
        window.removeEventListener("scroll", onScrollOrResize);
        window.removeEventListener("resize", onScrollOrResize);
      }
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      records.forEach(function (record) {
        record.link.removeEventListener("click", onLinkClick);
      });
    }

    function onPageHide(event) {
      if (!event.persisted) destroy();
    }

    function onLinkClick(event) {
      var link = event.currentTarget;
      for (var index = 0; index < records.length; index += 1) {
        if (records[index].link === link) {
          setCurrent(records[index]);
          break;
        }
      }
    }

    records.forEach(function (record) {
      record.link.addEventListener("click", onLinkClick);
    });
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);

    if (typeof window.IntersectionObserver === "function") {
      observer = new window.IntersectionObserver(function () {
        schedule(false);
      }, {
        root: null,
        rootMargin: "-18% 0px -70% 0px",
        threshold: [0, 0.01, 0.25, 0.6],
      });
      records.forEach(function (record) {
        observer.observe(record.target);
      });
    } else {
      fallbackBound = true;
      window.addEventListener("scroll", onScrollOrResize, { passive: true });
      window.addEventListener("resize", onScrollOrResize);
    }

    schedule(true);
  });
})();
