/* Two-step forms (.lp-card > form.lp-form): the lease, buy, rent-out and sell landing
   pages (#requirement) and the general enquiry form at the end of the other pages
   (#enquiry). Step 1 asks what is needed (tap buttons), step 2 who to reply to. The form
   keeps its id and field names, so js/forms.js submits it as before; this file handles
   the steps, the thank-you panel, the owner wording of the general form, the header's
   "Send enquiry" button and the mobile quick-contact bar. */
(function () {
  'use strict';

  // main.js shows the header on any upward scroll; once a step is lined up, tuck it
  // away again so it doesn't cover the step (it returns when the visitor scrolls up)
  function tuckHeader() {
    setTimeout(function () {
      var header = document.querySelector('.header_wrapper__MJ5bn');
      if (header && window.scrollY > 250) header.classList.add('header_-hidden__CVUoR');
    }, 700);
  }

  document.querySelectorAll('.lp-card').forEach(function (card) {
    var form = card.querySelector('form.lp-form');
    if (!form) return;
    var steps = form.querySelectorAll('.lp-step');
    var label = card.querySelector('.lp-step-label');
    var bar = card.querySelector('.lp-progress');
    var err = card.querySelector('.lp-error');
    var errText = err.textContent;
    var required = (form.getAttribute('data-step1-required') || '').split(',').filter(Boolean);

    function show(n) {
      steps.forEach(function (s) { s.hidden = s.getAttribute('data-step') !== String(n); });
      label.textContent = label.getAttribute('data-step' + n);
      bar.classList.toggle('-step2', n === 2);
      if (n === 2 && window.innerWidth >= 768) { // on phones focus would open the keyboard over the step
        var first = form.querySelector('.lp-step[data-step="2"] input:not([type=radio])');
        if (first) first.focus({ preventScroll: true });
      }
      fit();
    }
    // Phones: line the card up with the top of the screen so a whole step is in view
    function fit() {
      var top = card.getBoundingClientRect().top;
      if (window.innerWidth >= 768) {
        if (top < 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (Math.abs(top - 6) > 4) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      tuckHeader();
    }
    card.lpFit = fit;
    function missing() {
      return required.filter(function (n) { return !form.querySelector('input[name="' + n + '"]:checked'); });
    }
    // A choice we can't help with (under 500 m²) stops at step 1 with its own message
    function stopped() {
      var c = form.querySelector('input[data-stop]:checked');
      return c ? c.getAttribute('data-stop') : '';
    }

    form.querySelector('[data-lp-next]').addEventListener('click', function () {
      var stop = stopped();
      if (stop || missing().length) { err.textContent = stop || errText; err.hidden = false; return; }
      err.hidden = true;
      show(2);
    });
    form.addEventListener('change', function () { if (!missing().length && !stopped()) err.hidden = true; });
    form.querySelector('[data-lp-back]').addEventListener('click', function () { show(1); });

    // General form: owners (rent out, sell) are asked about their building instead of
    // the space they need. ?intent=sell in the URL, or the page's data-default-intent,
    // preselects the first question.
    var swaps = card.querySelectorAll('[data-owner-text]');
    if (swaps.length) {
      swaps.forEach(function (el) { el.setAttribute('data-default-text', el.textContent); });
      var wording = function () {
        var intent = form.querySelector('input[name="intent"]:checked');
        var owner = !!intent && /^(let|sell)$/.test(intent.value);
        swaps.forEach(function (el) { el.textContent = el.getAttribute(owner ? 'data-owner-text' : 'data-default-text'); });
      };
      var want = (/[?&]intent=(lease|buy|let|sell)\b/.exec(location.search) || [])[1] || form.getAttribute('data-default-intent');
      var pre = want && form.querySelector('input[name="intent"][value="' + want + '"]');
      if (pre) pre.checked = true;
      wording();
      form.addEventListener('change', function (e) { if (e.target.name === 'intent') wording(); });
    }

    // forms.js reports success in the form's status line; swap the form for a thank-you panel
    var status = form.querySelector('.form-status');
    var done = card.querySelector('.lp-done');
    new MutationObserver(function () {
      if (!status.classList.contains('-ok')) return;
      form.hidden = true; label.hidden = true; bar.hidden = true;
      done.hidden = false; done.focus();
    }).observe(status, { attributes: true, attributeFilter: ['class'] });
  });

  // The page's own form: #requirement on the service pages, #enquiry everywhere else
  var section = document.getElementById('requirement') || document.getElementById('enquiry');
  var card = section && section.querySelector('.lp-card');
  if (!card) return;

  // "Send enquiry" in the header and the menu opens /contact elsewhere; here it goes to the form
  document.querySelectorAll('[data-enquiry-cta]').forEach(function (a) { a.setAttribute('href', '#' + section.id); });

  // Links to the form: close the menu first if it is open; on phones line the card up
  document.querySelectorAll('a[href="#' + section.id + '"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var burger = document.querySelector('.header_burger-control__YR_x_');
      var menuOpen = !!burger && burger.getAttribute('aria-expanded') === 'true';
      if (menuOpen) burger.click(); // main.js closes it and restarts smooth scrolling
      if (window.innerWidth >= 768 && !menuOpen) return; // desktop: the plain anchor jump is fine
      e.preventDefault();
      setTimeout(function () {
        if (window.innerWidth >= 768) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else card.lpFit();
      }, menuOpen ? 350 : 0);
    });
  });

  // Phones: quick-contact bar, visible once past the top of the page and hidden while the form is on screen
  var sticky = document.querySelector('.lp-sticky');
  var hero = document.querySelector('.lp-hero, .page-hero, .article-head, .hero_root__N0Loz');
  if (sticky && hero && 'IntersectionObserver' in window) {
    var pastHero = false, formVisible = false;
    var update = function () { sticky.classList.toggle('-on', pastHero && !formVisible); };
    new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (es) { formVisible = es[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(section);
  }
})();
