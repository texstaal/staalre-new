/* Form handling for STAAL Real Estate.
   Submissions go to Supabase (insert-only anon REST). If Supabase isn't
   configured yet, forms fall back to a pre-filled mailto so nothing is lost. */
(function () {
  'use strict';

  // Filled in by the Supabase setup; safe to expose (anon key + RLS insert-only)
  var SUPABASE_URL = 'https://vlwvlmyxcrcvlpnfluch.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd3ZsbXl4Y3JjdmxwbmZsdWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTM3MTAsImV4cCI6MjA5NzAyOTcxMH0.6lObN4e-9cJVRAvZsCdJ0kBn0iNctUZJkegl01NCUD4';

  var configured = SUPABASE_URL && SUPABASE_ANON_KEY;

  /* ---------- spam protection ----------
     Injected at runtime (the forms only submit via JS anyway). A hidden
     "website" field is a honeypot: real users never see it, bots fill it.
     A timestamp guards against instant scripted submits. Both fail silently
     so a bot can't tell it was caught. */
  function armSpamTrap(form) {
    if (!form || form.__trap) return;
    var hp = document.createElement('input');
    hp.type = 'text';
    hp.name = 'website';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    form.appendChild(hp);
    form.__trap = { field: hp, loadedAt: Date.now() };
  }

  // Returns true if the submission looks like a bot (caught silently by caller).
  function isBot(form) {
    var t = form && form.__trap;
    if (!t) return false;
    if (t.field.value) return true;                  // honeypot filled
    if (Date.now() - t.loadedAt < 2000) return true; // submitted too fast
    return false;
  }

  function insertRow(table, row) {
    return fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(row)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
    });
  }

  /* ---------- lead attribution ----------
     Where the enquiry came from: the previous page (internal article or
     external referrer) and any utm_* tags on this URL. Read only at submit
     time and sent with the enquiry itself; nothing is stored in the browser,
     so the cookie policy's "no tracking storage" still holds. */
  function attribution() {
    var out = [];
    try {
      var ref = document.referrer ? new URL(document.referrer) : null;
      if (ref) {
        out.push('Came from: ' + (ref.host === location.host ? ref.pathname : ref.host + ref.pathname));
      } else {
        out.push('Came from: direct / unknown');
      }
      var q = new URLSearchParams(location.search), utm = [];
      q.forEach(function (v, k) { if (/^utm_/.test(k)) utm.push(k.slice(4) + '=' + v); });
      if (utm.length) out.push('Campaign: ' + utm.join(', '));
    } catch (e) { /* attribution is best-effort */ }
    return out.join('\n').slice(0, 400);
  }

  // Vercel Web Analytics custom event (no-op if analytics isn't loaded/enabled).
  function trackLead(form) {
    try { if (window.va) window.va('event', { name: 'Lead', data: { form: form } }); } catch (e) {}
  }

  function setStatus(el, ok, msg) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('-ok', '-err');
    el.classList.add(ok ? '-ok' : '-err');
  }

  /* ---------- newsletter (footer, every page) ---------- */
  var newsForm = document.querySelector('.footer_newsletter-form__0k_h5 form');
  if (newsForm) {
    armSpamTrap(newsForm);
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (isBot(newsForm)) { return; } // silently drop bots; UI gives no signal
      var input = newsForm.querySelector('input[name="email"]');
      var email = input ? input.value.trim() : '';
      if (!email || email.indexOf('@') < 1) { if (input) input.focus(); return; }
      var done = function () {
        if (input) {
          input.value = '';
          input.placeholder = 'Thanks — you’re on the list.';
          setTimeout(function () { input.placeholder = 'Enter your email'; }, 4000);
        }
      };
      if (configured) {
        insertRow('newsletter_subscribers', { email: email, source: location.pathname })
          .then(done)
          .catch(function () {
            location.href = 'mailto:tex@staalre.com?subject=' +
              encodeURIComponent('Newsletter signup') + '&body=' + encodeURIComponent(email);
          });
      } else {
        location.href = 'mailto:tex@staalre.com?subject=' +
          encodeURIComponent('Newsletter signup') + '&body=' + encodeURIComponent(email);
      }
    }, true);
  }

  /* ---------- contact form (/contact) ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    armSpamTrap(contactForm);
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = contactForm;
      if (isBot(f)) {
        // Mimic the success path so bots get no feedback to optimise against.
        var s = document.getElementById('contact-status');
        f.reset();
        setStatus(s, true, 'Thank you — your requirements were sent. We respond within one business day.');
        return;
      }
      var status = document.getElementById('contact-status');
      var btn = f.querySelector('button[type="submit"]');
      var row = {
        name: (f.name1 && f.name1.value || '').trim(),
        company: (f.company && f.company.value || '').trim(),
        email: (f.email && f.email.value || '').trim(),
        phone: (f.phone && f.phone.value || '').trim(),
        interest: (f.interest && f.interest.value || '').trim(),
        message: (f.message && f.message.value || '').trim(),
        source: location.pathname
      };
      if (!row.name || row.email.indexOf('@') < 1 || !row.message) {
        setStatus(status, false, 'Please fill in your name, a valid email, and a short description of your requirement.');
        return;
      }
      row.message = (row.message + '\n\n' + attribution()).slice(0, 5000);
      var mailtoFallback = function () {
        var bodyTxt = 'Name: ' + row.name + '\nCompany: ' + row.company + '\nEmail: ' + row.email +
          '\nPhone: ' + row.phone + '\nInterest: ' + row.interest + '\n\n' + row.message;
        location.href = 'mailto:tex@staalre.com?subject=' +
          encodeURIComponent('Requirement — ' + (row.company || row.name)) +
          '&body=' + encodeURIComponent(bodyTxt);
      };
      if (configured) {
        if (btn) btn.disabled = true;
        insertRow('contact_requests', row)
          .then(function () {
            f.reset();
            trackLead('contact · ' + (row.interest || 'none'));
            setStatus(status, true, 'Thank you — your requirements were sent. We respond within one business day.');
          })
          .catch(mailtoFallback)
          .finally(function () { if (btn) btn.disabled = false; });
      } else {
        mailtoFallback();
      }
    });
  }

  /* ---------- lease requirement form (/lease-warehouse-netherlands) ----------
     Structured intake. Folds the size/region/timing/use answers plus the two
     qualifiers (NL registration + Dutch bank account) into the message, and
     tags `interest` so established occupiers are easy to triage. No DB change:
     everything rides on the existing contact_requests columns. */
  var leaseForm = document.getElementById('lease-form');
  if (leaseForm) {
    armSpamTrap(leaseForm);
    leaseForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = leaseForm;
      var status = document.getElementById('lease-status');
      if (isBot(f)) {
        f.reset();
        setStatus(status, true, 'Thank you — your requirement was sent. We respond within one business day.');
        return;
      }
      var val = function (n) { return (f[n] && f[n].value || '').trim(); };
      var name = val('name1'), email = val('email'), size = val('size'), nl = val('nl_registered');
      if (!name || email.indexOf('@') < 1 || !size || !nl) {
        setStatus(status, false, 'Please add your name, a valid email, the size you need, and whether you’re registered in the Netherlands.');
        return;
      }
      var lines = [
        'Requirement: Lease warehouse space',
        'Size: ' + size,
        'Region: ' + (val('region') || 'No preference'),
        'Timing: ' + (val('timing') || '—'),
        'Use: ' + (val('use') || '—'),
        'Registered in NL (KvK): ' + nl,
        'Dutch bank account: ' + (val('dutch_bank') || '—')
      ];
      var extra = val('message');
      if (extra) { lines.push('', extra); }
      lines.push('', attribution());
      var established = /yes|progress/i.test(nl); // established or nearly so
      var tag = established ? 'lease · NL-established' : 'lease · setup-stage';
      var row = {
        name: name,
        company: val('company'),
        email: email,
        phone: val('phone'),
        interest: (tag + ' · ' + size).slice(0, 120),
        message: lines.join('\n').slice(0, 5000),
        source: location.pathname
      };
      var btn = f.querySelector('button[type="submit"]');
      var mailtoFallback = function () {
        location.href = 'mailto:tex@staalre.com?subject=' +
          encodeURIComponent('Warehouse requirement — ' + (row.company || row.name)) +
          '&body=' + encodeURIComponent(row.message);
      };
      if (configured) {
        if (btn) btn.disabled = true;
        insertRow('contact_requests', row)
          .then(function () {
            f.reset();
            trackLead('lease');
            setStatus(status, true, 'Thank you — your requirement was sent. We respond within one business day.');
          })
          .catch(mailtoFallback)
          .finally(function () { if (btn) btn.disabled = false; });
      } else {
        mailtoFallback();
      }
    });
  }

  /* ---------- buy requirement form (/buy-warehouse-netherlands) ----------
     Owner-occupier acquisition intake. Same pattern as the lease form: the
     answers fold into the message, and `interest` starts with "buy" so the
     CRM trigger files the lead as deal type Buy. */
  var buyForm = document.getElementById('buy-form');
  if (buyForm) {
    armSpamTrap(buyForm);
    buyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = buyForm;
      var status = document.getElementById('buy-status');
      if (isBot(f)) {
        f.reset();
        setStatus(status, true, 'Thank you — your acquisition brief was sent. We respond within one business day.');
        return;
      }
      var val = function (n) { return (f[n] && f[n].value || '').trim(); };
      var name = val('name1'), email = val('email'), size = val('size'), budget = val('budget');
      if (!name || email.indexOf('@') < 1 || !size || !budget) {
        setStatus(status, false, 'Please add your name, a valid email, the size you need and an indicative budget.');
        return;
      }
      var lines = [
        'Requirement: Buy a warehouse (owner-occupier)',
        'Size: ' + size,
        'Budget: ' + budget,
        'Region: ' + (val('region') || 'No preference'),
        'Timing: ' + (val('timing') || '—'),
        'Use: ' + (val('use') || '—'),
        'Financing: ' + (val('financing') || '—'),
        'Also open to leasing: ' + (val('lease_ok') || '—')
      ];
      var extra = val('message');
      if (extra) { lines.push('', extra); }
      lines.push('', attribution());
      var row = {
        name: name,
        company: val('company'),
        email: email,
        phone: val('phone'),
        interest: ('buy · owner-occupier · ' + budget + ' · ' + size).slice(0, 120),
        message: lines.join('\n').slice(0, 5000),
        source: location.pathname
      };
      var btn = f.querySelector('button[type="submit"]');
      var mailtoFallback = function () {
        location.href = 'mailto:tex@staalre.com?subject=' +
          encodeURIComponent('Acquisition brief — ' + (row.company || row.name)) +
          '&body=' + encodeURIComponent(row.message);
      };
      if (configured) {
        if (btn) btn.disabled = true;
        insertRow('contact_requests', row)
          .then(function () {
            f.reset();
            trackLead('buy');
            setStatus(status, true, 'Thank you — your acquisition brief was sent. We respond within one business day.');
          })
          .catch(mailtoFallback)
          .finally(function () { if (btn) btn.disabled = false; });
      } else {
        mailtoFallback();
      }
    });
  }
})();
