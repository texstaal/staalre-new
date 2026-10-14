/* Form handling for STAAL Real Estate.
   Submissions go to Supabase (insert-only anon REST). If Supabase isn't
   configured yet, forms fall back to a pre-filled mailto so nothing is lost. */
(function () {
  'use strict';

  // Filled in by the Supabase setup; safe to expose (anon key + RLS insert-only)
  var SUPABASE_URL = 'https://vlwvlmyxcrcvlpnfluch.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd3ZsbXl4Y3JjdmxwbmZsdWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTM3MTAsImV4cCI6MjA5NzAyOTcxMH0.6lObN4e-9cJVRAvZsCdJ0kBn0iNctUZJkegl01NCUD4';

  var configured = SUPABASE_URL && SUPABASE_ANON_KEY;

  // Dutch pages (<html lang="nl">) get Dutch messages, and the enquiry says so for the CRM
  var NL = document.documentElement.lang === 'nl';
  var t = function (en, nl) { return NL ? nl : en; };

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
      // Google Ads auto-tagging adds gclid (or gbraid/wbraid on iOS) to the
      // landing URL. Only the fact is recorded, not the ID, and only when the
      // form is sent from the page the ad opened.
      if (q.has('gclid') || q.has('gbraid') || q.has('wbraid')) out.push('Google Ads click: yes');
    } catch (e) { /* attribution is best-effort */ }
    return out.join('\n').slice(0, 400);
  }

  // Vercel Web Analytics custom event (no-op if analytics isn't loaded/enabled).
  function trackLead(form) {
    try { if (window.va) window.va('event', { name: 'Lead', data: { form: form } }); } catch (e) {}
    // Google Ads conversion (only fires with cookie consent; see js/consent.js)
    try { if (window.staalConsent) window.staalConsent.lead(form); } catch (e) {}
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
          input.placeholder = t('Thanks — you’re on the list.', 'Bedankt, u staat op de lijst.');
          setTimeout(function () { input.placeholder = t('Enter your email', 'Uw e-mailadres'); }, 4000);
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

  /* ---------- enquiry forms ----------
     The two-step forms share one submit path: the four service pages (lease,
     buy, rent out, sell) and the general enquiry form on every other page.
     Each form's answers are folded into the message, and `interest` starts
     with the deal type (lease, buy, let, sell) because the CRM trigger files
     leads on that prefix. No DB change: everything rides on the existing
     contact_requests columns. `read` returns null when a required answer is
     missing, otherwise { interest, track, subject, lines }. */
  function wireForm(id, opts) {
    var f = document.getElementById(id);
    if (!f) return;
    armSpamTrap(f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = f.querySelector('.form-status');
      if (isBot(f)) {
        // Mimic the success path so bots get no feedback to optimise against.
        f.reset();
        setStatus(status, true, opts.ok);
        return;
      }
      var val = function (n) { var el = f.elements[n]; return (el && el.value || '').trim(); };
      var name = val('name1'), email = val('email');
      var lead = opts.read(val);
      if (!name || !val('company') || email.indexOf('@') < 1 || !lead) {
        setStatus(status, false, opts.missing);
        return;
      }
      var lines = lead.lines.slice();
      var extra = val('message');
      if (extra) { lines.push('', extra); }
      if (NL) lines.push('', 'Language: Dutch (reply in Dutch)');
      lines.push('', attribution());
      var row = {
        name: name,
        company: val('company'),
        email: email,
        phone: val('phone'),
        interest: lead.interest.slice(0, 120),
        message: lines.join('\n').slice(0, 5000),
        source: location.pathname
      };
      var btn = f.querySelector('button[type="submit"]');
      var mailtoFallback = function () {
        location.href = 'mailto:tex@staalre.com?subject=' +
          encodeURIComponent(lead.subject + ' — ' + (row.company || row.name)) +
          '&body=' + encodeURIComponent(row.message);
      };
      if (configured) {
        if (btn) btn.disabled = true;
        insertRow('contact_requests', row)
          .then(function () {
            f.reset();
            trackLead(lead.track);
            setStatus(status, true, opts.ok);
          })
          .catch(mailtoFallback)
          .finally(function () { if (btn) btn.disabled = false; });
      } else {
        mailtoFallback();
      }
    });
  }

  /* /lease-warehouse-netherlands: the two qualifiers (NL registration + Dutch
     bank account) tag `interest` so established occupiers are easy to triage. */
  wireForm('lease-form', {
    ok: t('Thank you, your requirement was sent. We usually reply within a few hours.', 'Bedankt, uw aanvraag is verstuurd. We reageren meestal binnen een paar uur.'),
    missing: t('Please add your name, company, a valid email, the size you need, and whether you’re registered in the Netherlands.', 'Vul uw naam, bedrijf, een geldig e-mailadres en de gewenste oppervlakte in, en geef aan of uw bedrijf in Nederland is ingeschreven.'),
    read: function (val) {
      var size = val('size'), nl = val('nl_registered');
      if (!size || !nl) return null;
      var established = /yes|progress/i.test(nl); // established or nearly so
      return {
        interest: (established ? 'lease · NL-established' : 'lease · setup-stage') + ' · ' + size,
        track: 'lease',
        subject: 'Warehouse requirement',
        lines: [
          'Requirement: Lease warehouse space',
          'Size: ' + size,
          'Region: ' + (val('region') || 'No preference'),
          'Timing: ' + (val('timing') || '—'),
          'Use: ' + (val('use') || '—'),
          'Registered in NL (KvK): ' + nl,
          'Dutch bank account: ' + (val('dutch_bank') || '—')
        ]
      };
    }
  });

  /* /buy-warehouse-netherlands: owner-occupier acquisition brief. */
  wireForm('buy-form', {
    ok: t('Thank you, your acquisition brief was sent. We usually reply within a few hours.', 'Bedankt, uw zoekopdracht is verstuurd. We reageren meestal binnen een paar uur.'),
    missing: t('Please add your name, company, a valid email, the size you need and an indicative budget.', 'Vul uw naam, bedrijf, een geldig e-mailadres, de gewenste oppervlakte en een indicatief budget in.'),
    read: function (val) {
      var size = val('size'), budget = val('budget');
      if (!size || !budget) return null;
      return {
        interest: 'buy · owner-occupier · ' + budget + ' · ' + size,
        track: 'buy',
        subject: 'Acquisition brief',
        lines: [
          'Requirement: Buy a warehouse (owner-occupier)',
          'Size: ' + size,
          'Budget: ' + budget,
          'Region: ' + (val('region') || 'No preference'),
          'Timing: ' + (val('timing') || '—'),
          'Use: ' + (val('use') || '—'),
          'Financing: ' + (val('financing') || '—'),
          'Also open to leasing: ' + (val('lease_ok') || '—')
        ]
      };
    }
  });

  /* /rent-out-warehouse-netherlands: owners, and tenants subletting surplus space. */
  wireForm('let-form', {
    ok: t('Thank you, your building details were sent. We usually reply within a few hours.', 'Bedankt, de gegevens van uw pand zijn verstuurd. We reageren meestal binnen een paar uur.'),
    missing: t('Please add your name, company, a valid email, the space you want to rent out and who you are.', 'Vul uw naam, bedrijf, een geldig e-mailadres, de oppervlakte die u wilt verhuren en uw rol in.'),
    read: function (val) {
      var size = val('size'), role = val('role');
      if (!size || !role) return null;
      return {
        interest: 'let · ' + (/tenant/i.test(role) ? 'sublet' : /owner/i.test(role) ? 'owner' : 'adviser') + ' · ' + size,
        track: 'let',
        subject: 'Letting enquiry',
        lines: [
          'Requirement: Rent out a warehouse',
          'You are: ' + role,
          'Space to let: ' + size,
          'Available: ' + (val('availability') || '—'),
          'Region: ' + (val('region') || '—'),
          'Town / business park: ' + (val('town') || '—'),
          'Current or target rent: ' + (val('rent') || '—')
        ]
      };
    }
  });

  /* /sell-warehouse-netherlands: vacant buildings go to owner-occupiers, let ones to investors. */
  wireForm('sell-form', {
    ok: t('Thank you, your building details were sent. We usually reply within a few hours.', 'Bedankt, de gegevens van uw pand zijn verstuurd. We reageren meestal binnen een paar uur.'),
    missing: t('Please add your name, company, a valid email, the size of the building and whether it is let.', 'Vul uw naam, bedrijf, een geldig e-mailadres, de oppervlakte van het pand en de verhuurstatus in.'),
    read: function (val) {
      var size = val('size'), occupancy = val('occupancy');
      if (!size || !occupancy) return null;
      return {
        interest: 'sell · ' + (/partly/i.test(occupancy) ? 'partly let' : /^let/i.test(occupancy) ? 'let' : 'vacant') + ' · ' + size,
        track: 'sell',
        subject: 'Sale enquiry',
        lines: [
          'Requirement: Sell a warehouse',
          'Building size: ' + size,
          'Occupancy: ' + occupancy,
          'Timing: ' + (val('timing') || '—'),
          'Region: ' + (val('region') || '—'),
          'Town / business park: ' + (val('town') || '—'),
          'Price idea: ' + (val('price') || '—'),
          'Sale and leaseback: ' + (val('leaseback') || '—')
        ]
      };
    }
  });

  /* The general enquiry form (/contact, the homepage and the end of every other
     page): the first question says which of the four services it is. */
  var INTENTS = {
    lease: ['Lease warehouse space', 'Warehouse requirement'],
    buy: ['Buy a warehouse', 'Acquisition brief'],
    let: ['Rent out a warehouse', 'Letting enquiry'],
    sell: ['Sell a warehouse', 'Sale enquiry']
  };
  wireForm('enquiry-form', {
    ok: t('Thank you, your enquiry was sent. We usually reply within a few hours.', 'Bedankt, uw aanvraag is verstuurd. We reageren meestal binnen een paar uur.'),
    missing: t('Please choose what we can help with and the size, and add your name, company and a valid email.', 'Kies waarmee we u kunnen helpen en de oppervlakte, en vul uw naam, bedrijf en een geldig e-mailadres in.'),
    read: function (val) {
      var intent = val('intent'), size = val('size'), it = INTENTS[intent];
      if (!it || !size) return null;
      var owner = intent === 'let' || intent === 'sell';
      return {
        interest: intent + ' · enquiry · ' + size,
        track: 'enquiry · ' + intent,
        subject: it[1],
        lines: [
          'Requirement: ' + it[0],
          (owner ? 'Building size: ' : 'Size: ') + size,
          (owner ? 'Location: ' : 'Region: ') + (val('region') || (owner ? '—' : 'No preference')),
          'Timing: ' + (val('timing') || '—')
        ]
      };
    }
  });
})();
