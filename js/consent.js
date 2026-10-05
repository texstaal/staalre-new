/* Cookie consent + Google Ads tag (AW-18344770449).
   Consent Mode v2 defaults are set inline in every page's <head> (all denied).
   The Google tag library is only loaded after the visitor accepts, so no
   advertising cookies are set and nothing is sent to Google without consent.
   The choice itself is kept in localStorage (strictly necessary) for 12 months. */
(function () {
  'use strict';

  var ADS_ID = 'AW-18344770449';
  // Google Ads conversion for a submitted enquiry: paste the "send_to" value
  // from Google Ads (Goals > Conversions > the lead action > Tag setup), e.g.
  // 'AW-18344770449/AbCdEfGhIjK'. Leave empty to skip conversion events.
  var ADS_LEAD_SEND_TO = 'AW-18344770449/btU8CJ6Ky4odEJH3u6tE'; // "Aanvraag website (alle formulieren)"
  // Separate conversion for WhatsApp / phone / email taps. Create a second
  // conversion action in Google Ads and paste its send_to here; empty = off.
  var ADS_CONTACT_SEND_TO = '';

  var KEY = 'staal_consent';
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;
  var loaded = false;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && (v.c === 'granted' || v.c === 'denied') && Date.now() - v.t < MAX_AGE) return v.c;
    } catch (e) {}
    return null;
  }
  function save(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ c: choice, t: Date.now() })); } catch (e) {}
  }

  function grant() {
    gtag('consent', 'update', {
      ad_storage: 'granted', ad_user_data: 'granted',
      ad_personalization: 'granted', analytics_storage: 'granted'
    });
    if (loaded) return;
    loaded = true;
    gtag('js', new Date());
    gtag('config', ADS_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ADS_ID;
    document.head.appendChild(s);
  }
  function deny() {
    gtag('consent', 'update', {
      ad_storage: 'denied', ad_user_data: 'denied',
      ad_personalization: 'denied', analytics_storage: 'denied'
    });
    // remove first-party Google Ads cookies left from an earlier "Accept"
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_gcl_/.test(name)) {
        var host = location.hostname.replace(/^www\./, '');
        document.cookie = name + '=; Max-Age=0; path=/';
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + host;
      }
    });
  }

  /* ---------- banner ---------- */
  var banner = null;
  function close() { if (banner) { banner.remove(); banner = null; } }
  function open() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p class="cookie-banner-text">We use cookies to understand how visitors find us and to measure our marketing. ' +
      'Optional cookies are only set if you accept. <a href="/cookie-policy">Cookie policy</a></p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="cookie-btn" data-choice="denied">Reject all</button>' +
      '<button type="button" class="cookie-btn" data-choice="granted">Accept all</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-choice]');
      if (!btn) return;
      var choice = btn.getAttribute('data-choice');
      save(choice);
      if (choice === 'granted') grant(); else deny();
      close();
    });
    document.body.appendChild(banner);
  }

  // "Cookie settings" links (footer, cookie policy) reopen the banner
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cookie-settings]');
    if (!a) return;
    e.preventDefault();
    open();
  });

  var choice = read();
  if (choice === 'granted') grant();
  else if (choice !== 'denied') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open);
    else open();
  }

  // Used by forms.js after a successful enquiry
  window.staalConsent = {
    open: open,
    lead: function () {
      if (read() !== 'granted' || !ADS_LEAD_SEND_TO) return;
      gtag('event', 'conversion', { send_to: ADS_LEAD_SEND_TO });
    }
  };

  // WhatsApp, phone and email taps: a Vercel Analytics event always (cookieless),
  // and a Google Ads conversion only with consent and once a label is set above.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="wa.me/"], a[href^="tel:"], a[href^="mailto:"]');
    if (!a) return;
    var href = a.getAttribute('href');
    var type = /wa\.me/.test(href) ? 'whatsapp' : /^tel:/.test(href) ? 'phone' : 'email';
    try { if (window.va) window.va('event', { name: 'Contact', data: { type: type, page: location.pathname } }); } catch (err) {}
    if (read() === 'granted' && ADS_CONTACT_SEND_TO) gtag('event', 'conversion', { send_to: ADS_CONTACT_SEND_TO });
  });
})();
