/* EmptyHands — Google Ads conversion tracking with cookie consent.
   Only included on pages when a Google Ads tag ID is set in _build/build.py (GOOGLE_ADS).
   Google's tag is not loaded at all until the visitor accepts cookies (UK PECR / GDPR);
   Google Consent Mode records their choice. */
(function () {
  'use strict';
  var cfg = document.querySelector('meta[name="google-ads"]');
  if (!cfg) return;
  var ID = cfg.content;
  var LABELS = {
    lead: cfg.getAttribute('data-lead') || '',
    contact: cfg.getAttribute('data-contact') || '',
    whatsapp: cfg.getAttribute('data-whatsapp') || '',
    call: cfg.getAttribute('data-call') || ''
  };
  var KEY = 'eh-ads-consent';

  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var save = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

  var loaded = false;
  var load = function () {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(s);
  };

  /* Conversions: only sent once the visitor has accepted */
  var convert = function (kind) {
    if (!loaded) return;
    var label = LABELS[kind];
    if (label) gtag('event', 'conversion', { send_to: ID + '/' + label });
    gtag('event', kind === 'lead' ? 'generate_lead' : 'contact', { method: kind });
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) convert('whatsapp');
    else if (/^tel:/.test(href)) convert('call');
  }, true);
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches || !form.matches('form[data-mailto]') || !form.checkValidity()) return;
    convert(/registration/i.test(form.getAttribute('data-subject') || '') ? 'lead' : 'contact');
    if (e.submitter && e.submitter.value === 'whatsapp') convert('whatsapp');
  }, true);

  /* Consent banner */
  var banner;
  var showBanner = function () {
    if (banner) { banner.hidden = false; return; }
    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie choice');
    banner.innerHTML =
      '<p><strong>Cookies</strong> — Google cookies show which adverts help people find the dojo. ' +
      'Nothing is shared with Google unless you accept.</p>' +
      '<div class="consent-actions"><button type="button" class="btn btn--ghost" data-choice="denied">Reject</button>' +
      '<button type="button" class="btn btn--seal" data-choice="granted">Accept</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-choice]');
      if (!b) return;
      var choice = b.getAttribute('data-choice');
      save(choice);
      banner.hidden = true;
      if (choice === 'granted') load();
      else if (loaded) { gtag('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }); }
    });
    document.body.appendChild(banner);
  };

  var choice = read();
  if (choice === 'granted') load();
  else if (choice !== 'denied') showBanner();

  Array.prototype.forEach.call(document.querySelectorAll('.js-cookie-settings'), function (b) {
    b.hidden = false;
    b.addEventListener('click', showBanner);
  });
})();
