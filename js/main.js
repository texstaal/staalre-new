/* Re-implementation of the findrealestate.com runtime behaviour for the static
   copy of the page. The original site is a Next.js app whose JS chunks are not
   available locally, so this file drives: the hero scroll choreography, the
   sticky header states, the burger menu, the testimonials carousel, lazy blog
   images, the loading line and the reveal-on-scroll animations. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- scrollbar width var (used by full-bleed calcs) ---------- */
  function setScrollbarVar() {
    doc.style.setProperty('--scrollbar-width', (window.innerWidth - doc.clientWidth) + 'px');
  }
  setScrollbarVar();

  /* ---------- Lenis smooth scrolling ---------- */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  }

  /* ---------- loading line ---------- */
  var loadingLine = qs('.loading-line_loadingLine__br2iU');
  if (loadingLine) {
    loadingLine.classList.add('loading-line_visible__bLNFL', 'loading-line_loading__Or4mA');
    window.addEventListener('load', function () {
      loadingLine.classList.add('loading-line_completing__6DhGD');
      setTimeout(function () {
        loadingLine.classList.remove(
          'loading-line_visible__bLNFL',
          'loading-line_loading__Or4mA',
          'loading-line_completing__6DhGD'
        );
      }, 600);
    });
  }

  /* ---------- header: transparent at top, hide on scroll down ---------- */
  var header = qs('.header_wrapper__MJ5bn');
  var FIXED = 'header_-fixed__r0usw';
  var HIDDEN = 'header_-hidden__CVUoR';
  var lastY = window.scrollY;
  var menuOpen = false;
  function updateHeader(y) {
    if (!header) return;
    // stay transparent for the whole hero; white bar only once the white
    // content (why-us) has reached the top of the viewport
    var fixedAt = (typeof metrics !== 'undefined' && metrics.heroEnd) ? metrics.heroEnd - 2 : 10;
    header.classList.toggle(FIXED, y >= fixedAt);
    if (menuOpen) { header.classList.remove(HIDDEN); lastY = y; return; }
    if (y > lastY + 2 && y > 250) header.classList.add(HIDDEN);
    else if (y < lastY - 2) header.classList.remove(HIDDEN);
    lastY = y;
  }

  /* ---------- burger menu ---------- */
  var burgerBtn = qs('.header_burger-control__YR_x_');
  var burgerMenu = qs('.burger-menu_wrapper__gKR7D');
  if (burgerBtn && burgerMenu) {
    var backdrop = qs('.burger-menu_backdrop__wfXK5', burgerMenu);
    var menuContent = qs('.burger-menu_content__rv4kf', burgerMenu);
    var menuActions = qs('.burger-menu_actions__In3qE', burgerMenu);
    burgerMenu.style.transition = 'opacity .35s ease';
    if (backdrop) {
      backdrop.style.transform = 'scaleY(0)';
      backdrop.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1)';
    }
    [menuContent, menuActions].forEach(function (el) {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity .35s ease .12s, transform .5s cubic-bezier(.16,1,.3,1) .12s';
    });
    burgerBtn.addEventListener('click', function () {
      menuOpen = !menuOpen;
      burgerBtn.setAttribute('aria-expanded', String(menuOpen));
      burgerBtn.classList.toggle('burger-btn_-active__gfidG', menuOpen);
      burgerMenu.style.paddingTop = header ? header.offsetHeight + 'px' : '0';
      burgerMenu.style.opacity = menuOpen ? '1' : '0';
      burgerMenu.style.pointerEvents = menuOpen ? 'auto' : 'none';
      if (backdrop) backdrop.style.transform = menuOpen ? 'scaleY(1)' : 'scaleY(0)';
      [menuContent, menuActions].forEach(function (el) {
        if (!el) return;
        el.style.opacity = menuOpen ? '1' : '0';
        el.style.transform = menuOpen ? 'translateY(0)' : 'translateY(12px)';
      });
      doc.classList.toggle('lenis-stopped', menuOpen);
      if (lenis) { menuOpen ? lenis.stop() : lenis.start(); }
      updateHeader(window.scrollY);
    });
  }

  /* ---------- lazy blog images ---------- */
  qsa('img.image_lazy__jTV8A').forEach(function (img) {
    var container = img.closest('.image_container__RA4p4');
    var markLoaded = function () { if (container) container.classList.add('image_loaded__kIqzn'); };
    if (img.complete && img.naturalWidth > 0) markLoaded();
    else {
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', markLoaded);
    }
  });

  /* ---------- testimonials carousel ---------- */
  var carousel = qs('.testimonials_carousel__EBBTD .swiper');
  if (carousel && window.Swiper) {
    new Swiper(carousel, {
      speed: 650,
      autoHeight: false,
      autoplay: { delay: 6000, disableOnInteraction: true },
      pagination: {
        el: carousel.querySelector('.swiper-pagination'),
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '"></span>';
        }
      }
    });
  }

  /* ---------- CTA routing ----------
     The FIND site opened dialogs from these buttons; the dialog markup was
     client-rendered and isn't in the static DOM, so they route to pages. */
  qsa('button[aria-haspopup="dialog"]').forEach(function (btn) {
    var to = '/contact';
    if (btn.closest('.services_item__D_u7g')) to = '/services';
    else if (btn.closest('.features_item-more__MtYBo')) to = '/partners';
    if (btn.classList.contains('services_item__D_u7g')) to = '/services';
    btn.addEventListener('click', function () { window.location.href = to; });
  });
  // (newsletter + contact submission live in js/forms.js)

  /* ---------- reveal-on-scroll ---------- */
  var revealGroups = [
    ['.why-us_grid__RSZoF', '.why-us_preview__OofJt'],
    ['.arrows-section_title__a4gyt'],
    ['.arrows-section_arrow___KXxg'],
    ['.arrows-section_text__Z1Oii'],
    ['.rewired_left-col__vLphn'],
    ['.rewired_list-item__R5lrq'],
    ['.assymetric-image-split_label__4qblS', '.assymetric-image-split_small-img__199s0'],
    ['.for-agents_above-text__SVOzq', '.assymetric-image-split_image___yxAD', '.for-agents_below-text__DBjLv', '.for-agents_controls__pBRRC'],
    ['.testimonials_title__V_61W'],
    ['.testimonials_grid__S3Kng'],
    ['.services_caption__Q_j1k', '.services_hgrid__9FHyx .services_title__eMyhw'],
    ['.services_brief__OJqWD', '.services_action__21_Mi'],
    ['.features_title__vVo3d', '.features_text__Wp8am', '.features_actions__f8ehB'],
    ['.features_item__IPG1i'],
    ['.latest-posts_title__BvrE_', '.latest-posts_text__1m3Av', '.latest-posts_actions__ZwOlM'],
    ['.latest-posts_item__zlarM'],
    ['.outro_title__Eqbbj', '.outro_actions__qfUxG > div']
  ];

  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }) : null;

  revealGroups.forEach(function (group) {
    var els = [];
    group.forEach(function (sel) { els = els.concat(qsa(sel)); });
    els.forEach(function (el, i) {
      if (reduceMotion || !io) {
        el.style.visibility = 'visible';
        return;
      }
      el.style.opacity = '0';
      el.style.transform = 'translateY(34px)';
      el.style.transition =
        'opacity .9s cubic-bezier(.16,1,.3,1) ' + (i * 90) + 'ms, ' +
        'transform .9s cubic-bezier(.16,1,.3,1) ' + (i * 90) + 'ms';
      el.style.willChange = 'opacity, transform';
      io.observe(el);
    });
  });

  /* ---------- hero scroll choreography ---------- */
  var hero = qs('.hero_root__N0Loz');
  var heroRefs = null;
  if (hero) {
    heroRefs = {
      back: qs('.hero_back__8ReFI', hero),
      bg: qs('.hero_bg__S_r_n', hero),
      houses: qsa('.hero_house__aJy7p', hero),               // [0] plain, [1] inside composite
      composite: qs('.hero_composite__3blHB', hero),
      clouds: qsa('.hero_clouds__bC7V4 .hero_cloud__TvA3o', hero),
      logo: qs('.hero_logo__FxgRj', hero),
      smoke: qs('.hero_top__WegWw .hero_smoke__8za_R', hero),
      content: qs('.hero_content__DK_Ny', hero),
      title: qs('.hero_title__JpmHS', hero),
      text: qs('.hero_text__R6LQ5', hero),
      actions: qs('.hero_actions__RlphJ', hero)
    };
    heroRefs.logoPaths = heroRefs.logo ? qsa('path', heroRefs.logo) : [];

    // prepare stroke drawing
    heroRefs.logoPaths.forEach(function (path) {
      var len = 0;
      try { len = path.getTotalLength(); } catch (e) { len = 4000; }
      path.dataset.len = String(len);
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);
    });

    // reveal the SSR-hidden hero and play the intro
    hero.style.visibility = 'visible';
    var introEls = [heroRefs.title, heroRefs.text, heroRefs.actions].filter(Boolean);
    if (!reduceMotion) {
      introEls.forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(38px)';
        el.style.transition =
          'opacity 1s cubic-bezier(.16,1,.3,1) ' + (200 + i * 140) + 'ms, ' +
          'transform 1s cubic-bezier(.16,1,.3,1) ' + (200 + i * 140) + 'ms';
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          introEls.forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
        });
      });
    }
  }

  // cached metrics, refreshed on resize
  var metrics = { remPx: 10, vh: 0, heroH: 0, heroEnd: 0, desktop: true, houseStart: 22 };
  function refreshMetrics() {
    metrics.remPx = parseFloat(getComputedStyle(doc).fontSize) || 10;
    metrics.vh = window.innerHeight;
    metrics.desktop = window.matchMedia('(min-width: 768px)').matches;
    if (hero) {
      metrics.heroH = hero.offsetHeight;
      metrics.heroEnd = Math.max(1, metrics.heroH - metrics.vh);
      // the warehouse is bottom-anchored; pick the start offset (translateY %)
      // so the building's roofline (29.6% into the cutout) sits low in the
      // viewport with plenty of sky above it. End offset is 0 = doors at the
      // bottom edge. Height is derived from the (reliable) element width times
      // the cutout aspect ratio — offsetHeight can read stale before the image
      // lays out, which previously clamped the building too high over the CTA.
      if (heroRefs && heroRefs.houses[0]) {
        var hw = heroRefs.houses[0].offsetWidth || metrics.vh;
        var hh = hw * 1250 / 1920;
        // 0.30 coefficient targets the roofline at ~70% of viewport height,
        // sitting ~5cm below the "Find Properties" button (was 0.5 = mid screen)
        metrics.houseStart = clamp(0.704 - 0.30 * (metrics.vh / hh), 0.18, 0.82) * 100;
        // phones: position the roofline (29.6% into the cutout) directly under
        // the hero button instead — measured, not formula-based. Only computed
        // near the top of the page, where the hero layout is untransformed.
        if (!metrics.desktop && heroRefs.actions && window.scrollY < metrics.vh * 0.2) {
          var ar = heroRefs.actions.getBoundingClientRect();
          var targetTop = ar.bottom + window.scrollY + 16;
          metrics.houseStart = clamp((targetTop - 0.296 * hh - (metrics.vh - hh)) / hh, 0, 0.7) * 100;
        }
      }
    }
    setScrollbarVar();
  }
  refreshMetrics();
  window.addEventListener('resize', refreshMetrics);
  window.addEventListener('load', refreshMetrics);

  var lastP = -1;
  function renderHero(p, t) {
    var r = heroRefs;
    if (!r) return;
    var pChanged = Math.abs(p - lastP) > 0.0004;

    // clouds wobble continuously; everything else only re-renders when the
    // scroll progress actually moved (keeps the compositor mostly idle).
    // They drift all the way to the centre so the letters vanish behind them.
    // clouds begin drifting from the very first scroll (linear from p=0 so
    // there's no dead zone), gently OUTWARD and a touch higher, over the whole
    // hero so they never lurch. start position (p=0) is unchanged.
    var cloudT = seg(p, 0, 1);
    var wobX = Math.sin(t / 4200) * 1.6;
    var wobY = Math.cos(t / 5100) * 1.4;
    if (r.clouds[0]) {        // left cloud → drifts left
      r.clouds[0].style.transform =
        'translate(' + (lerp(0, -38, cloudT) + wobX) + '%, ' + (lerp(0, -18, cloudT) + wobY) + '%)';
    }
    if (r.clouds[1]) {        // right cloud → drifts right
      r.clouds[1].style.transform =
        'translate(' + (lerp(0, 36, cloudT) - wobX) + '%, ' + (lerp(0, -20, cloudT) - wobY) + '%)';
    }

    if (!pChanged) return;
    lastP = p;

    // sky: slow zoom for depth
    if (r.back) r.back.style.transform = 'scale(' + lerp(1, 1.1, easeInOut(seg(p, 0, 0.6))) + ')';

    // warehouse rises: roofline visible mid-screen at rest, overhead doors
    // reach the viewport bottom edge (translateY 0) at the end of the rise
    // warehouse pans at a STEADY (linear) rate the whole way down so scrolling
    // feels continuous. The old version eased the rise OUT and the in-letter
    // pan IN, and the two met at zero velocity around p=0.45 (just as the
    // writing finished) — which read as the building pausing. A single linear
    // pan keeps a constant speed: houseStart (lower, sky above) at p=0 →
    // 0 ("landed", doors at the bottom) near p=0.45 → keeps panning inside the
    // letters. Both the solid building and the copy in the letters share it.
    var houseY = metrics.houseStart * (1 - Math.min(p, 0.9) / 0.45);
    var houseTransform;
    if (metrics.desktop) {
      houseTransform = 'translateY(' + houseY + '%)';
    } else {
      // phones: NO zoom — the building slides straight up at a steady rate,
      // rising behind the letters while the smoke (raised early below)
      // swallows its base so the lift never shows a hard bottom edge
      var my = -70 * Math.min(p, 0.9) / 0.45;
      houseTransform = 'translateY(' + my + '%)';
    }
    r.houses.forEach(function (h) { h.style.transform = houseTransform; });

    // headline is overtaken / fades upward
    if (r.content) {
      var cT = seg(p, 0.06, 0.26);
      r.content.style.opacity = String(1 - cT);
      r.content.style.transform = 'translateY(' + lerp(0, -14, cT) + 'vh)';
      r.content.style.pointerEvents = cT > 0.5 ? 'none' : '';
    }

    // logo outline: fade in and start "writing" early, then hand to composite
    if (r.logo) {
      var logoIn = seg(p, 0.08, 0.16);
      var logoOut = seg(p, 0.40, 0.54);
      r.logo.style.opacity = String(Math.min(logoIn, 1 - logoOut));
      var draw = easeInOut(seg(p, 0.1, 0.40));
      r.logoPaths.forEach(function (path) {
        path.style.strokeDashoffset = String(parseFloat(path.dataset.len) * (1 - draw));
      });
    }

    // composite (warehouse seen through the STAAL letters) replaces the plain
    // warehouse, then the letters dissolve behind the rising clouds and smoke
    // warehouse → sky: starts well before the writing finishes (~p 0.40) so
    // the solid building gives way to sky early, while the letters complete
    var compIn = seg(p, 0.22, 0.44);
    var compOut = easeInOut(seg(p, 0.7, 0.9));
    if (r.composite) r.composite.style.opacity = String(Math.min(compIn, 1 - compOut));
    if (r.houses[0]) r.houses[0].style.opacity = String(1 - compIn);

    // smoke rises past the letters near the end, covering them. On phones it
    // already laps at the building's base at rest and climbs much earlier,
    // hiding the bottom edge of the upward-sliding building.
    if (r.smoke) {
      if (metrics.desktop) {
        var smokeT = easeInOut(seg(p, 0.34, 0.92));
        r.smoke.style.transform = 'translateY(' + lerp(70, -35, smokeT) + '%)';
      } else {
        var smokeTm = easeInOut(seg(p, 0.03, 0.5));
        r.smoke.style.transform = 'translateY(' + lerp(52, -30, smokeTm) + '%)';
      }
    }
  }

  /* ---------- sector tabs ---------- */
  qsa('[data-tabs]').forEach(function (root) {
    var btns = qsa('.tab-btn', root);
    var panels = qsa('.tab-panel', root);
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('-active'); });
        panels.forEach(function (x) { x.classList.remove('-active'); });
        b.classList.add('-active');
        if (panels[i]) panels[i].classList.add('-active');
      });
    });
  });

  /* ---------- step pills: highlight the step you're reading ---------- */
  var pillLinks = qsa('.step-pill[href^="#"]');
  if (pillLinks.length && 'IntersectionObserver' in window) {
    var pillFor = {};
    pillLinks.forEach(function (p) { pillFor[p.getAttribute('href').slice(1)] = p; });
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        pillLinks.forEach(function (p) { p.classList.remove('-active'); });
        if (pillFor[en.target.id]) pillFor[en.target.id].classList.add('-active');
      });
    }, { rootMargin: '-25% 0px -55% 0px' });
    Object.keys(pillFor).forEach(function (id) {
      var t = document.getElementById(id);
      if (t) pio.observe(t);
    });
  }

  /* ---------- keep the muted hero video playing when visible ---------- */
  var video = qs('.why-us_preview__OofJt video');
  function ensureVideoPlays() {
    if (video && video.paused && !document.hidden) {
      var pr = video.play();
      if (pr && pr.catch) pr.catch(function () {});
    }
  }
  document.addEventListener('visibilitychange', ensureVideoPlays);
  window.addEventListener('load', ensureVideoPlays);

  /* ---------- main loop ---------- */
  function tick(t) {
    var y = window.scrollY;
    updateHeader(y);
    if (hero && metrics.heroH > metrics.vh && !window.__pauseHeroFx) {
      var p = clamp(y / (metrics.heroH - metrics.vh), 0, 1);
      renderHero(p, t);
    }
  }
  // scroll listener keeps the scrubbed states correct even when rAF is
  // throttled (hidden window); rAF drives the continuous cloud motion
  window.addEventListener('scroll', function () { tick(performance.now()); }, { passive: true });
  window.__heroTick = function () { tick(performance.now()); };
  function frame(t) {
    if (lenis) lenis.raf(t);
    tick(t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
