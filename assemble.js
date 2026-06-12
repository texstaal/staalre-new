// Rebuilds index.html from the saved findrealestate.com page:
//  - localizes all assets (css/fonts/images/video, blog thumbs)
//  - swaps FIND branding for STAAL (logos, letter mask, copy, links)
//  - uses the warehouse cutout as the hero building
const fs = require('fs');

const RAW = 'C:/Users/texst/Downloads/findrealestate_com.html';
const logo = JSON.parse(fs.readFileSync('staal-logo.json', 'utf8'));
let html = fs.readFileSync(RAW, 'utf8');

/* ---- generic asset cleanup ---- */
html = html.replace(/\s(?:imagesrcset|srcset)="[^"]*"/g, '');
html = html.replace(/\/_next\/image\?url=%2F_next%2Fstatic%2Fmedia%2F([A-Za-z0-9_-]+)\.[a-f0-9]{8}\.(\w+)&amp;[^"]*/g, 'images/$1.$2');
html = html.replace(/\/_next\/static\/media\/([A-Za-z0-9_-]+)\.[a-f0-9]{8}\.(\w+)(\?[^"]*)?/g, 'images/$1.$2');
html = html.replace(/\?dpl=dpl_[A-Za-z0-9]+/g, '');

/* ---- body slice ---- */
let body = html.slice(html.indexOf('<body'), html.indexOf('<script src="/_next/static/chunks/webpack'));

/* ---- disambiguate duplicate-named images ---- */
body = body.replace(/(assymetric-image-split_small-img__199s0"[\s\S]*?src=")images\/1\.jpg/, '$1images/1 (1).jpg');
body = body.replace(/(assymetric-image-split_image___yxAD"[\s\S]*?src=")images\/2\.jpg/, '$1images/2 (1).jpg');
body = body.replace(/(testimonials_preview___uhyO"[\s\S]*?src=")images\/1\.jpg/, '$1images/1 (2).jpg');

/* ---- local media ---- */
body = body.replace('src="/videos/why-us.mp4"', 'src="images/why-us.mp4"');
body = body.replaceAll('images/house.png', 'images/warehouse.png');
// warehouse cutout has different intrinsic dimensions than the FIND house
body = body.replaceAll('loading="eager" width="3840" height="3416"', 'loading="eager" width="1920" height="1250"');

/* ---- blog thumbnails ---- */
const thumbs = [
  ['Q1 2026 NYC Market Report', 'images/blog-q1-2026-nyc-market-report.png'],
  ['Philly Real Estate: A Winter Chill or a Spring Opportunity?', 'images/blog-philly-winter-chill.jpg'],
  ['What $1M Buys in Different NYC Neighborhoods', 'images/blog-what-1m-buys.jpg']
];
for (const [alt, src] of thumbs) {
  body = body.replace(
    `alt="${alt}" class="image_image__xwoGQ image_lazy__jTV8A" fetchpriority="low"`,
    `alt="${alt}" class="image_image__xwoGQ image_lazy__jTV8A" fetchpriority="low" src="${src}"`
  );
}

/* ---- drop GTM noscript ---- */
body = body.replace(/\s*<noscript>[\s\S]*?<\/noscript>/, '');

/* ---- STAAL wordmark (header + footer svgs share the 975x280 viewBox) ---- */
body = body.replace(
  /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" fill="none" viewBox="0 0 975 280">[\s\S]*?<\/svg>/g,
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 975 280">\n              ${logo.wordmark}\n            </svg>`
);

/* ---- STAAL hero outline logo (977x423) ---- */
body = body.replace(
  /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 977 423">[\s\S]*?<\/svg>/,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 977 423">\n                <g fill="currentColor">\n              ${logo.heroWord}\n              ${logo.heroSub}\n                </g>\n              </svg>`
);

/* ====================================================================
   COPY REWRITE — STAAL: boutique warehouse & logistics real estate
   advisory in the Netherlands, acting for the occupier (tenant/buyer).
   Tone: professional, direct, boutique, international, hands-on.
   ==================================================================== */

// replace the inner HTML of element(s) matching a class (in document order)
function setInner(cls, tag, vals) {
  if (!Array.isArray(vals)) vals = [vals];
  let i = 0;
  const esc = cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const re = new RegExp('(<' + tag + '\\b[^>]*\\bclass="[^"]*\\b' + esc + '\\b[^"]*"[^>]*>)([\\s\\S]*?)(</' + tag + '>)', 'g');
  body = body.replace(re, (m, open, inner, close) => (i < vals.length) ? open + vals[i++] + close : m);
}

/* ---- hero ---- */
body = body.replaceAll('Find What Moves You', 'Built on Solid Ground');
setInner('hero_text__R6LQ5', 'div',
  '<p>Warehouse &amp; logistics real estate advisory in the Netherlands. <span class="em">We help international businesses find, lease, and acquire the right space.</span></p>');
body = body.replaceAll('Find Properties', 'Find Your Space');

/* ---- why STAAL ---- */
body = body.replaceAll('Why FIND', 'Why STAAL');
setInner('why-us_text__rT1u9', 'div',
  'New to the Dutch market, or growing in it? You shouldn’t have to navigate it alone. <span class="em">Local market knowledge, direct lines to owners, and one point of contact from first search to final signature.</span>');

/* ---- arrows ---- */
setInner('arrows-section_title__a4gyt', 'div', '<h2>More than <span class="em">square metres.</span></h2>');
setInner('arrows-section_text__Z1Oii', 'div',
  '<p>Your warehouse is your operation — inbound, storage, fulfilment, distribution. <span class="em">Location, access, clear height, and timing decide how well it runs. We make sure they’re right.</span></p>');

/* ---- steps (Intake → Search & Select → Secure & Hand Over) ---- */
setInner('rewired_title__1_3e9', 'h2', '<div>From Brief</div><div class="em">to Keys.</div>');
setInner('rewired_label__db93N', 'div', 'How it works:');
setInner('rewired_list-item__R5lrq', 'div', [
  '<span>Intake. <span class="em">We map exactly what your operation needs — size, location, access, clear height, timing, and budget.</span></span>',
  '<span>Search &amp; Select. <span class="em">We scan the market, shortlist the best-fit warehouses, and arrange the viewings.</span></span>',
  '<span>Secure &amp; Hand Over. <span class="em">We negotiate your lease or purchase, support the documentation, and coordinate handover.</span></span>'
]);
body = body.replaceAll('Start Your Search', 'Send Your Requirements');

/* ---- for occupiers (repurposed from "For Agents") ---- */
setInner('assymetric-image-split_label__4qblS', 'div', 'For Occupiers');
setInner('for-agents_above-text__SVOzq', 'div', 'We Work for You. <span class="em">Not the Landlord.</span>');
setInner('for-agents_below-text__DBjLv', 'div',
  'STAAL represents the occupier — the company that will actually use the space. <span class="em">No divided loyalty, no listing bias. You get one independent, hands-on advisor who knows the Dutch logistics market, negotiates hard on your behalf, and stays with you from the first brief to the day you collect the keys. When a request falls outside our scope, we bring in trusted partners rather than hand you off.</span>');
body = body.replaceAll('Join The Movement', 'Work With Us');

/* ---- testimonials (PLACEHOLDER — swap for real client quotes) ---- */
setInner('testimonials_title__V_61W', 'div', '<h2>What Our <span class="em">Clients Say.</span></h2>');
setInner('testimonials_quote__877vg', 'div', [
  '<p>We needed space near Rotterdam fast. STAAL had a relevant shortlist within a week and we signed well inside our budget.</p>',
  '<p>As a foreign company we didn’t know the Dutch market at all. STAAL handled the search, viewings, negotiation and paperwork from start to finish.</p>',
  '<p>One point of contact the whole way — no portals, no chasing brokers who actually work for the landlord.</p>',
  '<p>They talked us out of a building that looked great but didn’t fit our racking. That advice saved us a costly mistake.</p>',
  '<p>Fast, direct, and genuinely on our side. Exactly what you want when you’re signing a long lease.</p>'
]);
setInner('testimonials_author__5Drje', 'div', [
  'Supply Chain Director · E-commerce',
  'Managing Director · Fulfilment',
  'Operations Lead · Distribution',
  'Logistics Manager · Retail',
  'Founder · D2C Brand'
]);

/* ---- services (Lease / Buy / Manage) ---- */
body = body.replaceAll('How FIND', 'How STAAL');
setInner('services_item-text__uKETL', 'div', [
  '<h3>Lease the right warehouse without the guesswork. We run the full search, compare options on what actually matters — location, clear height, docks, access — and negotiate terms that protect your operation.</h3>',
  '<h3>Acquire logistics property with an advisor who answers only to you. From sourcing to due-diligence support and price negotiation, we help you buy the right asset at the right number.</h3>',
  '<h3>Already in a building? We advise on renewals, renegotiations, expansions, and relocations, so your space keeps pace with your growth.</h3>'
]);
{ const words = ['Lease', 'Buy', 'Manage']; let i = 0;
  body = body.replace(/(services_item-more__pkhNR">\s*<span>)([\s\S]*?)(<\/span>)/g, (m, o, inner, c) => i < words.length ? o + words[i++] + c : m); }
body = body.replace(/(services_brief__OJqWD">\s*<div>)([\s\S]*?)(<\/div>)/,
  '$1From first requirement to final handover, you get one boutique advisor who knows Dutch logistics real estate <span class="em">and works only for you.</span>$3');
body = body.replaceAll('Get Started with FIND', 'Get Started with STAAL');

/* ---- features (Financing / Property Management / Construction & Development) ---- */
body = body.replace(/(features_title__vVo3d">\s*<h2>\s*<div>)([\s\S]*?)(<\/div>\s*<\/h2>)/,
  '$1Support<br />Beyond <span class="em">the</span><br /><span class="em">Search</span>$3');
setInner('features_text__Wp8am', 'div',
  '<p>Securing the space is the start. <span class="em">We stay involved — and where you need more, we bring in trusted partners.</span></p>');
body = body.replaceAll('Discover Our Services', 'How We Help');
setInner('features_item-title__uXmdj', 'div', [
  '<h3>Financing</h3>',
  '<h3>Property Management</h3>',
  '<h3>Construction &amp; Development</h3>'
]);
setInner('features_item-text__X8po0', 'div', [
  '<p>Introductions to lenders and finance partners for your lease or acquisition.</p>',
  '<p>Ongoing advice on your space as your operation grows or relocates.</p>',
  '<p>Build-to-suit and development guidance for warehouses shaped around your process.</p>'
]);

/* ---- insights / blog (PLACEHOLDER topics) ---- */
body = body.replace(/(latest-posts_title__BvrE_">\s*<h2>\s*<div>)([\s\S]*?)(<\/div>\s*<\/h2>)/,
  '$1Insights<br /><span class="em">&amp; Resources</span>$3');
setInner('latest-posts_text__1m3Av', 'div',
  '<p>Practical insight on the Dutch logistics market — site selection, lease terms, and what to know before you sign.</p>');
body = body.replaceAll('Visit Our Blog', 'Read Our Insights');
body = body.replaceAll('Q1 2026 NYC Market Report', 'A Foreign Company’s Guide to Leasing Warehouse Space in the Netherlands');
body = body.replaceAll('Philly Real Estate: A Winter Chill or a Spring Opportunity?', 'Rotterdam, Venlo or Tilburg: Choosing the Right Dutch Logistics Hub');
body = body.replaceAll('What $1M Buys in Different NYC Neighborhoods', 'Lease or Buy: What Makes Sense for Your Distribution Operation');
// clean the inert NYC blog slug URLs (pages don't exist, but keep them on-brand)
body = body.replaceAll('/blog/Q1-2026-NYC-Market-Report', '/blog/leasing-warehouse-space-netherlands');
body = body.replaceAll('/blog/blog-post-1', '/blog/dutch-logistics-hub-comparison');
body = body.replaceAll('/blog/What-1M-Buys-in-Different-NYC-Neighborhoods', '/blog/lease-or-buy-distribution');
setInner('post-entry_text__Xeca_', 'div', [
  '<p>What international occupiers need to know before signing a Dutch lease — from indexation and service charges to break options.</p>',
  '<p>The major Dutch logistics regions compared on location, labour, transport links and availability — and how to choose.</p>',
  '<p>A practical look at when leasing beats buying for a distribution operation in the Netherlands, and when it doesn’t.</p>'
]);

/* ---- outro ---- */
setInner('outro_title__Eqbbj', 'div', '<h2>Let’s find your <span class="em">space in the Netherlands.</span></h2>');
body = body.replaceAll('Let’s Get Started', 'Let’s Talk');

/* ---- navigation labels (desktop + footer use data-text; burger is plain) ---- */
const navMap = [
  ['Search', 'Services'], ['Agents', 'Process'], ['Join', 'Sectors'],
  ['Paperwork', 'Insights'], ['Resources', 'Partners'],
  ['About Us', 'About'], ['Agent Portal', 'Contact'], ['Sign In', 'Contact']
];
for (const [from, to] of navMap) {
  const e = from.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  body = body.replace(new RegExp('data-text="' + from + '">(\\s*)' + e, 'g'), 'data-text="' + to + '">$1' + to);
}
// burger (mobile) menu — plain-text links and dropdown triggers
body = body.replace(/(href="\/search">\s*)Search/g, '$1Services');
body = body.replace(/(href="\/agents">\s*)Agents/g, '$1Process');
for (const [from, to] of [['Join', 'Sectors'], ['Paperwork', 'Insights'], ['Resources', 'Partners']]) {
  body = body.replace(new RegExp('(burger-menu_nav-item__mCA9u"[^>]*aria-controls="[^"]*">\\s*)' + from, 'g'), '$1' + to);
}

/* ---- footer newsletter + sublinks ---- */
body = body.replace('Subscribe to our Newsletter!', 'Get our market updates.');
body = body.replace('placeholder="Enter address"', 'placeholder="Enter your email"');
body = body.replace('Fair Housing Notice', 'Disclaimer');
body = body.replace('Operating Procedure', 'Cookie Policy');
body = body.replace(/<span class="undefined">[\s\S]*?Vouchers Welcome\s*<\/span>\s*/, '');
body = body.replace(/<span class="undefined">[\s\S]*?Vivienda\s*<\/span>\s*/, '');

/* ---- brand + any stray FIND mentions ---- */
body = body.replaceAll('FIND Real Estate', 'STAAL Real Estate');
body = body.replaceAll('FIND', 'STAAL');

/* ---- STAAL contact details ---- */
body = body.replaceAll('hello@findrealestate.com', 'tex@staalre.com');
body = body.replaceAll('+1 212 994 9965', '+31 6 28 36 36 31');
body = body.replaceAll('tel:+12129949965', 'tel:+31628363631');
body = body.replace('5 West 37th Street, 12th Floor,', 'Speerstraat 7-2');
body = body.replace(/<div>\s*New York, NY 10018\s*<\/div>\s*/, '');
body = body.replace(/href="geo:[^"]*"/, 'href="https://maps.google.com/?q=Speerstraat+7-2"');

/* ---- external FIND links ---- */
body = body.replaceAll('https://app.findrealestate.com/authentication/sign-in', '#');
body = body.replace(/href="https:\/\/(?:www\.)?(?:facebook|instagram|youtube)\.com\/[^"]*"/g, 'href="#"');
body = body.replace(/href="https:\/\/www\.linkedin\.com\/[^"]*"/g, 'href="#"');

const SITE_URL = 'https://staalre.com/';
const TITLE = 'STAAL Real Estate | Warehouse & Logistics Real Estate Advisory in the Netherlands';
const DESC = 'STAAL Real Estate is a boutique advisory helping international businesses find, lease and acquire warehouse and logistics property in the Netherlands. Independent, occupier-focused and hands-on.';
const ACCENT = '#1F4257';        // steel-blue brand accent (STAAL = steel) — on light
const ACCENT_BRIGHT = '#6FA0C0'; // lighter steel for hovers on the dark footer

const head = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${TITLE}</title>
    <meta name="description" content="${DESC}" />
    <meta name="keywords" content="warehouse real estate Netherlands, logistics property Netherlands, industrial real estate advisor, occupier advisory, tenant representation, lease warehouse Netherlands, distribution centre, fulfilment space, e-commerce logistics real estate" />
    <meta name="author" content="STAAL Real Estate" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="${ACCENT}" />
    <link rel="canonical" href="${SITE_URL}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="STAAL Real Estate" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESC}" />
    <meta property="og:url" content="${SITE_URL}" />
    <meta property="og:locale" content="en_NL" />
    <meta property="og:image" content="${SITE_URL}images/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESC}" />
    <meta name="twitter:image" content="${SITE_URL}images/og-image.jpg" />

    <!-- Icons (drop these files in later) -->
    <link rel="icon" href="favicon.ico" sizes="any" />
    <link rel="icon" href="icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" />
    <link rel="manifest" href="site.webmanifest" />

    <link rel="preload" href="fonts/26d0ba92e140f0dc-s.p.woff2" as="font" crossorigin="" type="font/woff2" />
    <link rel="preload" href="fonts/5c0c2bcbaa4149ca-s.p.woff2" as="font" crossorigin="" type="font/woff2" />
    <link rel="stylesheet" href="css/a463080343a8b988.css" data-precedence="next" />
    <link rel="stylesheet" href="css/804a152dbcc38a56.css" data-precedence="next" />
    <link rel="stylesheet" href="css/5290e5f354def47d.css" data-precedence="next" />
    <link rel="stylesheet" href="css/b6b0e4d6e1848150.css" data-precedence="next" />
    <link rel="stylesheet" href="css/33f3cda2aa79f5e3.css" data-precedence="next" />
    <link rel="stylesheet" href="css/4c0c15c47e700f3f.css" data-precedence="next" />
    <link rel="stylesheet" href="css/f46e979614fc3394.css" data-precedence="next" />
    <link rel="stylesheet" href="css/76625cdb983d5d00.css" data-precedence="next" />
    <link rel="stylesheet" href="css/c8e589196f30db03.css" data-precedence="next" />
    <link rel="stylesheet" href="css/dd8866e20d835adf.css" data-precedence="next" />
    <link rel="stylesheet" href="css/17424100e880a33c.css" data-precedence="next" />
    <link rel="stylesheet" href="css/staal.css" />
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"RealEstateAgent","name":"STAAL Real Estate","description":"${DESC}","url":"${SITE_URL}","email":"tex@staalre.com","telephone":"+31628363631","areaServed":"NL","address":{"@type":"PostalAddress","streetAddress":"Speerstraat 7-2","addressCountry":"NL"},"knowsAbout":["Warehouse real estate","Logistics property","Tenant representation","Occupier advisory"]}
    </script>
  </head>
`;

const tail = `

    <script src="js/lenis.min.js"></script>
    <script src="js/swiper-bundle.min.js"></script>
    <script src="js/main.js"></script>
  </body>
</html>
`;

fs.writeFileSync('index.html', head + body.trimEnd() + tail, 'utf8');

/* ---- STAAL override stylesheet ---- */
const staalCss = `/* STAAL overrides on top of the original FIND stylesheets:
   - hero building uses the warehouse cutout (1920x1250) instead of the
     FIND house (1920x1708); it is anchored to the viewport bottom so the
     overhead doors land exactly at the bottom edge at the end of the rise
   - the composite "see the building through the letters" mask uses the
     STAAL letterforms generated from Instrument Sans Bold
   - the footer sits behind the page and is revealed ONLY as the outro
     ("Find You. We'll Help You Get There.") scrolls up over it. main is
     painted opaque white so the sticky footer (z-index -1) is covered by
     every section above and only shows through below the last section. */
.hero_house__aJy7p{top:auto;bottom:0;height:auto;aspect-ratio:1920/1250}
.hero_composite__3blHB{-webkit-mask-image:url('data:image/svg+xml,${logo.mask}');mask-image:url('data:image/svg+xml,${logo.mask}')}
/* bigger STAAL hero wordmark — outline (.hero_logo) and the composite fill
   must scale together and stay centred so they line up exactly (~1.25x) */
.hero_logo__FxgRj{width:29.38rem;height:12.75rem;top:calc(50% - 6.38rem);left:calc(50% - 14.69rem)}
.hero_composite__3blHB{-webkit-mask-size:29.38rem 12.75rem;mask-size:29.38rem 12.75rem}
@media(min-width:768px){
  .hero_logo__FxgRj{width:122.13rem;height:52.88rem;top:calc(50% - 26.44rem);left:calc(50% - 61.06rem)}
  .hero_composite__3blHB{-webkit-mask-size:122.13rem 52.88rem;mask-size:122.13rem 52.88rem}
}
main{background:#fff}
.footer_wrapper__9GQwi{position:sticky;bottom:0;z-index:-1}

/* steel-blue accent — small touches only; the base stays monochrome */
::selection{background:${ACCENT};color:#fff}
::-moz-selection{background:${ACCENT};color:#fff}
*{outline-color:${ACCENT}}
/* top progress bar */
.loading-line_loadingLine__br2iU:before{background:${ACCENT}}
/* active testimonial number */
.testimonials_carousel__EBBTD .swiper-pagination-bullet.swiper-pagination-bullet-active{color:${ACCENT}}
/* nav hover — only once the bar is solid (dark text on white) */
.header_wrapper__MJ5bn.header_-fixed__r0usw .header_nav-item__Wn05d:hover,
.header_wrapper__MJ5bn.header_-fixed__r0usw .header_actions__Sv09J a:hover{color:${ACCENT}}
/* footer links + newsletter submit (lighter steel reads on the dark footer) */
.footer_nav-link__LFUNG:hover,
.footer_social-link__2uQBq:hover,
.footer_contact-value__e1jbK a:hover,
.footer_newsletter-submit-btn__HrC3v:hover{color:${ACCENT_BRIGHT}}
/* newsletter field underline on focus */
.footer_input-wrapper__1l5CZ:focus-within{border-bottom-color:${ACCENT_BRIGHT}}
`;
fs.writeFileSync('css/staal.css', staalCss, 'utf8');

console.log('index.html:', (head + body + tail).length, 'chars | staal.css:', staalCss.length, 'chars');
