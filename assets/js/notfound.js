/* "Page not found": if the missing address looks like an old WordPress page (from an old ad, Google result
   or bookmark), forward to the matching new page, keeping any ?query such as Google Ads click IDs. */
(function () {
  var s = document.currentScript;
  var posts = ((s && s.getAttribute('data-posts')) || '').split(' ');
  var path = decodeURIComponent(location.pathname).toLowerCase().replace(/\/+$/, '');
  var last = path.split('/').pop().replace(/\.html?$/, '').replace(/-\d+$/, '');
  var to = null;
  if (last && posts.indexOf(last) > -1) to = 'blog/' + last + '.html';
  else {
    var rules = [
      [/yoga/, 'yoga.html'], [/tai[-_ ]?chi/, 'tai-chi.html'], [/shiatsu|clinic/, 'shiatsu.html'], [/coaching/, 'coaching.html'],
      [/register|join|trial|book/, 'join.html'], [/contact|address|location|find-us/, 'contact.html'],
      [/fee|price|product|shop|cart|checkout|basket|membership/, 'fees.html'], [/yudansha|black-?belt/, 'yudansha.html'],
      [/instructor|mentor|sensei|teacher/, 'instructors.html'], [/testimonial|review/, 'testimonials.html'],
      [/gallery|photo|video/, 'gallery.html'], [/about/, 'about.html'], [/app|account|login/, 'our-app.html'],
      [/kihon/, 'kihon.html'], [/kata/, 'kata.html'], [/bunkai/, 'bunkai.html'], [/kumite/, 'kumite.html'],
      [/karate/, 'karate.html'], [/blog|news|journal|category|tag|author|\/20\d\d\//, 'blog/index.html']
    ];
    for (var i = 0; i < rules.length; i++) { if (rules[i][0].test(path)) { to = rules[i][1]; break; } }
  }
  if (to) location.replace('/' + to + location.search + location.hash);
})();
