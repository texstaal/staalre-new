/* Two-step intake forms on the lease and buy landing pages (.lp-card > form.lp-form).
   Step 1 asks what is needed (tap buttons), step 2 who to send options to. The form
   keeps its id and field names, so js/forms.js submits it exactly as before; this file
   only handles the steps, the thank-you panel and the mobile quick-contact bar. */
(function () {
  'use strict';

  document.querySelectorAll('.lp-card').forEach(function (card) {
    var form = card.querySelector('form.lp-form');
    if (!form) return;
    var steps = form.querySelectorAll('.lp-step');
    var label = card.querySelector('.lp-step-label');
    var bar = card.querySelector('.lp-progress');
    var err = card.querySelector('.lp-error');
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
      // main.js shows the header on any upward scroll; once we're in place, tuck it
      // away again so it doesn't cover the step (it returns when the visitor scrolls up)
      setTimeout(function () {
        var header = document.querySelector('.header_wrapper__MJ5bn');
        if (header && window.scrollY > 250) header.classList.add('header_-hidden__CVUoR');
      }, 700);
    }
    document.querySelectorAll('a[href="#requirement"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (window.innerWidth >= 768) return;
        e.preventDefault();
        fit();
      });
    });
    function missing() {
      return required.filter(function (n) { return !form.querySelector('input[name="' + n + '"]:checked'); });
    }

    form.querySelector('[data-lp-next]').addEventListener('click', function () {
      if (missing().length) { err.hidden = false; return; }
      err.hidden = true;
      show(2);
    });
    form.addEventListener('change', function () { if (!missing().length) err.hidden = true; });
    form.querySelector('[data-lp-back]').addEventListener('click', function () { show(1); });

    // forms.js reports success in the form's status line; swap the form for a thank-you panel
    var status = form.querySelector('.form-status');
    var done = card.querySelector('.lp-done');
    new MutationObserver(function () {
      if (!status.classList.contains('-ok')) return;
      form.hidden = true; label.hidden = true; bar.hidden = true;
      done.hidden = false; done.focus();
    }).observe(status, { attributes: true, attributeFilter: ['class'] });
  });

  // Phones: quick-contact bar, visible after the hero and hidden while the form is on screen
  var sticky = document.querySelector('.lp-sticky');
  var hero = document.querySelector('.lp-hero');
  var section = document.getElementById('requirement');
  if (sticky && hero && section && 'IntersectionObserver' in window) {
    var pastHero = false, formVisible = false;
    var update = function () { sticky.classList.toggle('-on', pastHero && !formVisible); };
    new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (es) { formVisible = es[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(section);
  }
})();
