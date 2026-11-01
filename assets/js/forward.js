/* Old WordPress addresses forward to their new page, keeping any ?query (e.g. Google Ads click IDs)
   so ad conversions are still credited. A meta refresh on the page is the no-JS fallback. */
(function () {
  var s = document.currentScript, to = s && s.getAttribute('data-to');
  if (!to) return;
  var q = location.search, h = location.hash, i = to.indexOf('#');
  if (i > -1) { h = h || to.slice(i); to = to.slice(0, i); }
  if (q) to += (to.indexOf('?') > -1 ? '&' : '?') + q.slice(1);
  location.replace(to + h);
})();
