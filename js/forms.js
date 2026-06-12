/* Form handling for STAAL Real Estate.
   Submissions go to Supabase (insert-only anon REST). If Supabase isn't
   configured yet, forms fall back to a pre-filled mailto so nothing is lost. */
(function () {
  'use strict';

  // Filled in by the Supabase setup; safe to expose (anon key + RLS insert-only)
  var SUPABASE_URL = '';
  var SUPABASE_ANON_KEY = '';

  var configured = SUPABASE_URL && SUPABASE_ANON_KEY;

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
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
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
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = contactForm;
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
