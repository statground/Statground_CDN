(function (global) {
  'use strict';
  function normalize(value) { return String(value || '').normalize('NFKC').toLocaleLowerCase().trim(); }
  function matches(text, query) { return normalize(query).split(/\s+/).every(function (term) { return normalize(text).includes(term); }); }
  function init(document) {
    function reveal(hash, scroll) {
      var id;
      try { id = decodeURIComponent(String(hash || '').replace(/^#/, '')); } catch (_) { return; }
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      var node = target;
      while (node) {
        if (node.tagName === 'DETAILS') node.open = true;
        if (node.matches && node.matches('[data-graflume-api-entry]') && node.hidden) {
          var search = document.querySelector('[data-graflume-api-search]');
          if (search) { search.value = ''; search.dispatchEvent(new Event('input', { bubbles: true })); }
        }
        node = node.parentElement;
      }
      if (scroll) global.requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
    }
    document.querySelectorAll('[data-graflume-api-search]').forEach(function (input) {
      var scope = input.closest('[data-graflume-api-scope]') || document;
      var cards = Array.from(scope.querySelectorAll('[data-graflume-api-entry]'));
      var empty = scope.querySelector('[data-graflume-api-empty]');
      var count = scope.querySelector('[data-graflume-api-count]');
      function filter() {
        var visible = 0;
        cards.forEach(function (card) {
          card.hidden = !matches(card.textContent + ' ' + (card.getAttribute('data-graflume-api-keywords') || ''), input.value);
          if (!card.hidden) visible += 1;
        });
        scope.querySelectorAll('[data-graflume-api-group]').forEach(function (group) {
          group.hidden = !Array.from(group.querySelectorAll('[data-graflume-api-entry]')).some(function (card) { return !card.hidden; });
        });
        if (empty) empty.hidden = visible !== 0;
        if (count) count.textContent = (count.getAttribute('data-count-template') || '{count}').replace('{count}', String(visible));
      }
      input.addEventListener('input', filter);
      filter();
    });
    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href*="#"]');
      if (!link) return;
      var url;
      try { url = new URL(link.href, global.location.href); } catch (_) { return; }
      if (url.origin !== global.location.origin || url.pathname !== global.location.pathname || url.search !== global.location.search) return;
      reveal(url.hash, true);
    });
    global.addEventListener('hashchange', function () { reveal(global.location.hash, true); });
    reveal(global.location.hash, true);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { normalize: normalize, matches: matches, init: init };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(document); });
    else init(document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
