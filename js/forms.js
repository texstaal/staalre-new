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
            setStatus(status, true, 'Thank you — your requirements were sent. We respond within one business day.');
          })
          .catch(mailtoFallback)
          .finally(function () { if (btn) btn.disabled = false; });
      } else {
        mailtoFallback();
      }
    });
  }
})();
