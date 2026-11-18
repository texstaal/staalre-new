/* One-question-at-a-time forms (.lp-card > form.lp-form): the lease, buy, rent-out and
   sell landing pages (#requirement) and the general enquiry form at the end of the other
   pages (#enquiry). Each required answer is shown on its own screen to cut the friction of
   a long form; tapping a choice chip moves straight to the next question, free-text fields
   advance with Next or Enter, and the optional extras sit behind one final skippable step.
   The form keeps its id and field names, so js/forms.js submits it exactly as before; this
   file only re-presents the existing fields as a step-by-step flow, keeps the thank-you
   panel, the owner wording of the general form, the header "Send enquiry" button and the
   mobile quick-contact bar. */
(function () {
  'use strict';

  var NL = document.documentElement.lang === 'nl';
  var t = function (en, nl) { return NL ? nl : en; };

  // main.js shows the header on any upward scroll; once a step is lined up, tuck it
  // away again so it doesn't cover the step (it returns when the visitor scrolls up)
  function tuckHeader() {
    setTimeout(function () {
      var header = document.querySelector('.header_wrapper__MJ5bn');
      if (header && window.scrollY > 250) header.classList.add('header_-hidden__CVUoR');
    }, 700);
  }

  var ADVANCE_ICON = '<span class="button_icon-after__vljdM"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m20.78 12.531-6.75 6.75a.75.75 0 1 1-1.06-1.061l5.47-5.47H3.75a.75.75 0 1 1 0-1.5h14.69l-5.47-5.469a.75.75 0 1 1 1.06-1.061l6.75 6.75a.75.75 0 0 1 0 1.061"></path></svg></span>';
  function roundButton(type, text, extraClass) {
    var b = document.createElement('button');
    b.type = type;
    b.className = 'button_button-round__TFjlU button_color-primary__JJ7Hh' + (extraClass ? ' ' + extraClass : '');
    b.innerHTML = '<div class="button_content__6Zh3n"><div class="button_button-round-text__IEwW5"><span data-text="' + text + '">' + text + '</span></div>' + ADVANCE_ICON + '</div>';
    return b;
  }

  function wizard(card) {
    var form = card.querySelector('form.lp-form');
    if (!form) return;

    var label = card.querySelector('.lp-step-label');
    var bar = card.querySelector('.lp-progress');
    var errText = t('Please answer this to continue.', 'Beantwoord dit om verder te gaan.');
    var submitBtn = form.querySelector('button[type="submit"]');
    var status = form.querySelector('.form-status');
    var formNote = form.querySelector('.form-note');
    var step1Required = (form.getAttribute('data-step1-required') || '').split(',').filter(Boolean);

    // ---- collect the form's questions in document order ----
    // A question is either a choice group (.lp-chips with its .lp-q label) or a single
    // field (.form-field). Required ones each get their own screen; the optional ones are
    // gathered behind one final "add detail" screen.
    var units = [];
    var anchors = form.querySelectorAll('.lp-chips, .form-field');
    anchors.forEach(function (el) {
      if (el.classList.contains('lp-chips')) {
        var lbl = el.previousElementSibling;
        if (lbl && !lbl.classList.contains('lp-q')) lbl = null;
        var radios = el.querySelectorAll('input[type="radio"]');
        if (!radios.length) return;
        var name = radios[0].name;
        var req = step1Required.indexOf(name) > -1 ||
          Array.prototype.some.call(radios, function (r) { return r.required; });
        units.push({ kind: 'chips', name: name, label: lbl, node: el, required: req, radios: radios });
      } else { // .form-field
        var ctrl = el.querySelector('input, select, textarea');
        if (!ctrl || ctrl.name === 'region') return; // region question removed
        units.push({ kind: 'field', name: ctrl.name, node: el, control: ctrl, required: ctrl.required });
      }
    });
    if (!units.length) return;

    var requiredUnits = units.filter(function (u) { return u.required; });
    var optionalUnits = units.filter(function (u) { return !u.required; });

    // ---- build the step track ----
    var track = document.createElement('div');
    track.className = 'lp-track';
    var slides = [];

    function makeSlide() {
      var s = document.createElement('div');
      s.className = 'lp-slide';
      s.hidden = true;
      track.appendChild(s);
      slides.push(s);
      return s;
    }

    requiredUnits.forEach(function (u) {
      var s = makeSlide();
      if (u.label) s.appendChild(u.label);
      s.appendChild(u.node);
      u.slide = s;
    });

    var optionalSlide = null;
    if (optionalUnits.length) {
      optionalSlide = makeSlide();
      var h = document.createElement('p');
      h.className = 'lp-q';
      h.textContent = t('Anything else? (optional)', 'Nog iets toe te voegen? (optioneel)');
      optionalSlide.appendChild(h);
      var wrap = document.createElement('div');
      wrap.className = 'lp-fields';
      optionalUnits.forEach(function (u) {
        if (u.kind === 'chips' && u.label) wrap.appendChild(u.label);
        wrap.appendChild(u.node);
      });
      optionalSlide.appendChild(wrap);
    }

    // Put the track where the first fieldset was, then drop the now-empty scaffolding.
    var firstStep = form.querySelector('.lp-step');
    form.insertBefore(track, firstStep);
    form.querySelectorAll('.lp-step').forEach(function (fs) { fs.remove(); });

    // ---- navigation footer (shared across slides) ----
    var nav = document.createElement('div');
    nav.className = 'lp-nav';
    var err = document.createElement('p');
    err.className = 'lp-error';
    err.setAttribute('role', 'alert');
    err.hidden = true;
    var actions = document.createElement('div');
    actions.className = 'lp-actions';
    var backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'lp-back';
    backBtn.textContent = t('← Back', '← Terug');
    var nextBtn = roundButton('button', t('Next', 'Volgende'));
    actions.appendChild(submitBtn);   // real submit (moved out of the old step 2)
    actions.appendChild(nextBtn);
    actions.appendChild(backBtn);
    nav.appendChild(err);
    if (status) nav.appendChild(status);
    nav.appendChild(actions);
    if (formNote) nav.appendChild(formNote);
    form.appendChild(nav);

    var N = slides.length;
    var at = 0;

    function isChipsSlide(i) {
      return i < requiredUnits.length && requiredUnits[i].kind === 'chips';
    }
    function isLast(i) { return i === N - 1; }

    function progress() {
      if (label) label.textContent = t('Question ', 'Vraag ') + (at + 1) + t(' of ', ' van ') + N;
      if (bar) {
        bar.classList.toggle('-step2', at === N - 1);
        var pb = bar.querySelector('.lp-progress-bar');
        if (pb) pb.style.width = Math.round(((at + 1) / N) * 100) + '%';
      }
    }

    function fit() {
      var top = card.getBoundingClientRect().top;
      if (window.innerWidth >= 768) { if (top < 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (Math.abs(top - 6) > 4) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      tuckHeader();
    }
    card.lpFit = fit;

    function show(i, focus) {
      at = Math.max(0, Math.min(i, N - 1));
      slides.forEach(function (s, k) { s.hidden = k !== at; });
      err.hidden = true;
      backBtn.hidden = at === 0;
      var last = isLast(at);
      submitBtn.hidden = !last;
      // Choice screens advance on tap, so they need no Next button (unless they're last).
      nextBtn.hidden = last || isChipsSlide(at);
      progress();
      if (focus !== false) {
        if (isChipsSlide(at)) {
          // leave focus for a deliberate tap; nothing to type
        } else {
          var input = slides[at].querySelector('input:not([type=radio]):not([type=hidden]), textarea');
          if (input && window.innerWidth >= 768) try { input.focus({ preventScroll: true }); } catch (e) {}
        }
      }
      fit();
    }

    // A size the team can't help with (e.g. under 500 m²) stops the flow with its message.
    function stopMsg() {
      var c = form.querySelector('input[data-stop]:checked');
      return c ? c.getAttribute('data-stop') : '';
    }
    function fail(msg) { err.textContent = msg || errText; err.hidden = false; }

    // Validate the current required slide before moving on.
    function validate() {
      if (at >= requiredUnits.length) return true; // optional slide
      var u = requiredUnits[at];
      if (u.kind === 'chips') {
        if (!form.querySelector('input[name="' + u.name + '"]:checked')) { fail(); return false; }
        var stop = stopMsg();
        if (stop) { fail(stop); return false; }
        return true;
      }
      var v = (u.control.value || '').trim();
      if (!v) { fail(); return false; }
      if (u.control.type === 'email' && v.indexOf('@') < 1) {
        fail(t('Please enter a valid email address.', 'Vul een geldig e-mailadres in.'));
        return false;
      }
      return true;
    }

    function next() { if (validate()) show(at + 1); }

    nextBtn.addEventListener('click', next);
    backBtn.addEventListener('click', function () { show(at - 1); });

    // Enter in a text field advances instead of submitting early.
    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'textarea') return;
      if (!isLast(at)) { e.preventDefault(); next(); }
    });

    // Choice chips: selecting one clears any error and, on a non-final screen, advances.
    form.addEventListener('change', function (e) {
      if (!e.target || e.target.type !== 'radio') return;
      if (at < requiredUnits.length && requiredUnits[at].name === e.target.name) {
        var stop = stopMsg();
        if (stop) { fail(stop); return; }
        err.hidden = true;
        if (!isLast(at)) setTimeout(function () { show(at + 1); }, 220);
      }
    });

    // General form: owners (rent out, sell) are asked about their building rather than the
    // space they need. ?intent=sell in the URL, or data-default-intent, preselects it.
    var swaps = card.querySelectorAll('[data-owner-text]');
    var startAt = 0;
    if (swaps.length) {
      swaps.forEach(function (el) { el.setAttribute('data-default-text', el.textContent); });
      var wording = function () {
        var intent = form.querySelector('input[name="intent"]:checked');
        var owner = !!intent && /^(let|sell)$/.test(intent.value);
        swaps.forEach(function (el) { el.textContent = el.getAttribute(owner ? 'data-owner-text' : 'data-default-text'); });
      };
      var want = (/[?&]intent=(lease|buy|let|sell)\b/.exec(location.search) || [])[1] || form.getAttribute('data-default-intent');
      var pre = want && form.querySelector('input[name="intent"][value="' + want + '"]');
      if (pre) { pre.checked = true; if (requiredUnits[0] && requiredUnits[0].name === 'intent') startAt = 1; }
      wording();
      form.addEventListener('change', function (e) { if (e.target.name === 'intent') wording(); });
    }

    // forms.js reports success in the status line; swap the whole form for the thank-you panel.
    var done = card.querySelector('.lp-done');
    if (status && done) {
      new MutationObserver(function () {
        if (!status.classList.contains('-ok')) return;
        form.hidden = true;
        if (label) label.hidden = true;
        if (bar) bar.hidden = true;
        done.hidden = false; done.focus();
      }).observe(status, { attributes: true, attributeFilter: ['class'] });
    }

    show(startAt, false);
  }

  document.querySelectorAll('.lp-card').forEach(wizard);

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
        else if (card.lpFit) card.lpFit();
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
