/* EmptyHands — Google Ads conversion tracking with cookie consent.
   Only included on pages when a Google Ads tag ID is set in _build/build.py (GOOGLE_ADS).
   Google Consent Mode v2 (advanced): the Google tag loads on every page so Google Ads can detect it,
   but with all storage denied — no cookies are set and ad data is redacted until the visitor
   clicks Accept. Rejecting keeps everything denied. */
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
  var DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  var GRANTED = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' };
  gtag('consent', 'default', DENIED);
  gtag('set', 'ads_data_redaction', true);
  gtag('js', new Date());
  gtag('config', ID);
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
  document.head.appendChild(s);

  var load = function () { gtag('consent', 'update', GRANTED); };

  /* Conversions: sent without cookies until the visitor accepts (Google models these) */
  var convert = function (kind) {
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
      'No cookies are set unless you accept.</p>' +
      '<div class="consent-actions"><button type="button" class="btn btn--ghost" data-choice="denied">Reject</button>' +
      '<button type="button" class="btn btn--seal" data-choice="granted">Accept</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-choice]');
      if (!b) return;
      var choice = b.getAttribute('data-choice');
      save(choice);
      banner.hidden = true;
      gtag('consent', 'update', choice === 'granted' ? GRANTED : DENIED);
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
