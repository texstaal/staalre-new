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
body = body.replaceAll('Find What Moves You', 'Make Your Move.');
setInner('hero_text__R6LQ5', 'div',
  '<p>The Netherlands is Europe’s logistics heart. <span class="em">We secure the space your growth runs on.</span></p>');
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
  '<p>Practical insight on the Dutch logistics market: site selection, lease terms, and what to know before you sign.</p>');
body = body.replaceAll('Visit Our Blog', 'Read Our Insights');
body = body.replaceAll('Q1 2026 NYC Market Report', 'A Foreign Company’s Guide to Leasing Warehouse Space in the Netherlands');
body = body.replaceAll('Philly Real Estate: A Winter Chill or a Spring Opportunity?', 'Rotterdam, Venlo or Tilburg: Choosing the Right Dutch Logistics Hub');
body = body.replaceAll('What $1M Buys in Different NYC Neighborhoods', 'Lease or Buy: What Makes Sense for Your Distribution Operation');
// clean the inert NYC blog slug URLs (pages don't exist, but keep them on-brand)
body = body.replaceAll('/blog/Q1-2026-NYC-Market-Report', '/blog/leasing-warehouse-space-netherlands');
body = body.replaceAll('/blog/blog-post-1', '/blog/dutch-logistics-hub-comparison');
body = body.replaceAll('/blog/What-1M-Buys-in-Different-NYC-Neighborhoods', '/blog/lease-or-buy-distribution');
setInner('post-entry_text__Xeca_', 'div', [
  '<p>What international occupiers need to know before signing a Dutch lease: indexation, service charges, and break options.</p>',
  '<p>The major Dutch logistics regions compared on location, labour, transport links and availability, and how to choose between them.</p>',
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
body = body.replace('5 West 37th Street, 12th Floor,', 'Speerstraat 7-2,');
body = body.replace('New York, NY 10018', 'Amsterdam, 1076XM, The Netherlands');
body = body.replace(/href="geo:[^"]*"/, 'href="https://maps.google.com/?q=Speerstraat+7-2,+Amsterdam"');

/* ---- external FIND links ---- */
body = body.replaceAll('https://app.findrealestate.com/authentication/sign-in', '/contact');
body = body.replace(/href="https:\/\/(?:www\.)?(?:facebook|instagram|youtube)\.com\/[^"]*"/g, 'href="#"');
body = body.replace(/href="https:\/\/www\.linkedin\.com\/[^"]*"/g, 'href="#"');

/* ---- route internal links to the real pages ---- */
// "Work With Us" in the occupiers section goes to contact, not the old /join
body = body.replace(/(for-agents_controls__pBRRC">\s*<a[^>]*href=")\/join(")/, '$1/contact$2');
body = body.replaceAll('href="/search"', 'href="/services"');
body = body.replaceAll('href="/agents"', 'href="/process"');
body = body.replaceAll('href="/join"', 'href="/sectors"');
body = body.replaceAll('href="/blog"', 'href="/insights"');
body = body.replaceAll('/blog/', '/insights/');
body = body.replaceAll('href="/terms-of-service"', 'href="/terms"');
body = body.replaceAll('href="/privacy-policy"', 'href="/privacy"');
body = body.replaceAll('href="/operating-procedure"', 'href="/cookie-policy"');
// Disclaimer pointed at an external NY-state PDF; Press has no page — local now
body = body.replace(/<a target="_blank" href="https:\/\/dos\.ny\.gov[^"]*">([\s\S]*?)<\/a>/, '<a href="/disclaimer">$1</a>');
body = body.replace(/<a href="\/press-and-media">[\s\S]*?<\/a>\s*/, '');

/* ---- header + burger nav: radix dropdown triggers -> direct links ---- */
const navHrefs = { Sectors: '/sectors', Insights: '/insights', Partners: '/partners', About: '/about' };
for (const [label, href] of Object.entries(navHrefs)) {
  // desktop header item (drop the chevron arrow; plain roll-hover link)
  body = body.replace(
    new RegExp('<div>\\s*<div class="header_nav-item__Wn05d" type="button"[^>]*>\\s*<span data-text="' + label + '">[\\s\\S]*?</div>\\s*</div>\\s*</div>'),
    '<div class="header_nav-item__Wn05d"><a href="' + href + '"><span data-text="' + label + '">' + label + '\n</span></a></div>'
  );
}
// burger items still carry the ORIGINAL FIND labels (Join/Paperwork/Resources/
// About) at this point — convert each whole dropdown block to a direct link
const burgerMap = [['Join', 'Sectors', '/sectors'], ['Paperwork', 'Insights', '/insights'], ['Resources', 'Partners', '/partners'], ['About', 'About', '/about']];
for (const [orig, label, href] of burgerMap) {
  body = body.replace(
    new RegExp('<div data-state="closed">\\s*<div class="burger-menu_nav-item__mCA9u" type="button"[^>]*>\\s*' + orig + '[\\s\\S]*?burger-menu_nav-item-content__kj0Kw">\\s*</div>\\s*</div>'),
    '<div class="burger-menu_nav-item__mCA9u"><a href="' + href + '">' + label + '\n</a></div>'
  );
}

const SITE_URL = 'https://staalre.com/';
const TITLE = 'STAAL Real Estate | Make Your Move — Warehouse & Logistics Space in the Netherlands';
const DESC = 'The Netherlands is Europe’s logistics heart. STAAL helps international businesses find, lease and acquire the warehouse space their growth runs on. Independent, occupier-only, hands-on.';
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

    <link rel="preload" href="fonts/space-grotesk-400.woff2" as="font" crossorigin="" type="font/woff2" />
    <link rel="preload" href="fonts/space-grotesk-700.woff2" as="font" crossorigin="" type="font/woff2" />
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
    {"@context":"https://schema.org","@type":"RealEstateAgent","name":"STAAL Real Estate","description":"${DESC}","url":"${SITE_URL}","email":"tex@staalre.com","telephone":"+31628363631","areaServed":"NL","address":{"@type":"PostalAddress","streetAddress":"Speerstraat 7-2","addressLocality":"Amsterdam","postalCode":"1076XM","addressCountry":"NL"},"knowsAbout":["Warehouse real estate","Logistics property","Tenant representation","Occupier advisory"]}
    </script>
  </head>
`;

const tail = `

    <script src="js/lenis.min.js"></script>
    <script src="js/swiper-bundle.min.js"></script>
    <script src="js/main.js"></script>
    <script src="js/forms.js"></script>
  </body>
</html>
`;

/* ---- interactive Netherlands logistics map (replaces the chevron strip) ---- */
const nlmap = JSON.parse(fs.readFileSync('nl-map.json', 'utf8'));
// pins live INSIDE the svg (shared coordinate system) so they always line up
const mapPins = nlmap.hubs.map((h, i) =>
  `<g class="nl-pin${i === 0 ? ' -active' : ''}" data-i="${i}"><circle class="nl-pin-hit" cx="${h.x}" cy="${h.y}" r="20" /><circle class="nl-pin-halo" cx="${h.x}" cy="${h.y}" r="6" /><circle class="nl-pin-dot" cx="${h.x}" cy="${h.y}" r="5.5" /></g>`).join('');
const mapRows = nlmap.hubs.map((h, i) =>
  `<li><button type="button" class="nl-hub-row${i === 0 ? ' -active' : ''}" data-i="${i}"><span class="nl-hub-tick"></span><span>${h.name}</span></button></li>`).join('');
const mapNotes = nlmap.hubs.map((h, i) =>
  `<p class="nl-hub-note${i === 0 ? ' -active' : ''}" data-i="${i}">${h.note}</p>`).join('');
const mapHtml = `<div class="nl-map" data-nl-map>
            <div class="nl-map-aside">
              <div class="nl-map-eyebrow">Main logistics hubs</div>
              <p class="nl-map-lede">We work nationwide — these are the hubs that drive Dutch logistics. <span class="em">Tap one to see what it’s known for.</span></p>
              <ul class="nl-hub-list">${mapRows}</ul>
              <div class="nl-map-notes">${mapNotes}</div>
            </div>
            <div class="nl-map-figure">
              <svg class="nl-map-svg" viewBox="${nlmap.viewBox}" xmlns="http://www.w3.org/2000/svg"><path class="nl-map-shape" d="${nlmap.path}" /><g class="nl-pins">${mapPins}</g></svg>
            </div>
          </div>
          `;
body = body.replace(
  /<div class="arrows-section_arrows__BPayV">[\s\S]*?<\/div>\s*<div class="arrows-section_text__Z1Oii">/,
  mapHtml + '<div class="arrows-section_text__Z1Oii">'
);

/* ---- lift the testimonials section off the homepage, but keep it ----
   Saved to saved/testimonials-section.html. To bring it back later, comment
   out this block (and add a <link>/markup hook) — nothing is lost. */
const testiRe = /\s*<section class="testimonials_root__PiYLZ">[\s\S]*?<\/section>/;
const testiMatch = body.match(testiRe);
if (testiMatch) {
  fs.mkdirSync('saved', { recursive: true });
  fs.writeFileSync('saved/testimonials-section.html', testiMatch[0].trim() + '\n', 'utf8');
  body = body.replace(testiRe, '\n      <!-- "What our clients say" removed for now; full section saved in saved/testimonials-section.html. Restore once real testimonials are in. -->');
}

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
/* z-index 0 keeps the footer BELOW main (z1, opaque) for the reveal effect
   while staying clickable — negative z-index made body swallow all clicks */
.footer_wrapper__9GQwi{position:sticky;bottom:0;z-index:0}

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

/* ====================================================================
   SUBPAGE STYLES — same tokens as the FIND modules (rem scale, #151717,
   #f1f1f1, .em grey). Used by the generated inner pages.
   ==================================================================== */
.page-hero{padding:6rem 0 4rem}
@media(min-width:768px){.page-hero{padding:15rem 0 8rem}}
.page-hero h1{font-weight:700;font-size:4.4rem;line-height:1.05;letter-spacing:-.02em;margin:0}
@media(min-width:768px){.page-hero h1{font-size:9.6rem;letter-spacing:-.04em}}
.page-hero .page-hero-sub{margin-top:2rem;font-weight:500;font-size:1.8rem;line-height:1.5;max-width:81.2rem}
@media(min-width:768px){.page-hero .page-hero-sub{margin-top:3rem;font-size:3.2rem;line-height:130%;letter-spacing:-.01em}}
.page-section{padding:4rem 0}
@media(min-width:768px){.page-section{padding:7rem 0}}
.page-section.-grey{background:#f1f1f1}
.page-section.-dark{background:#151717;color:#fff}
.page-section.-dark .em{color:hsla(0,0%,100%,.4)}

/* split rows (label left, content right) — mirrors labeled-section */
.split{display:flex;flex-direction:column;gap:3rem;padding:4rem 0;border-top:1px solid rgba(21,23,23,.1)}
@media(min-width:768px){.split{flex-direction:row;gap:6rem;padding:7rem 0}
.split>.split-label{flex:1 1}
.split>.split-content{max-width:97.6rem;flex:2 1}}
.split-label{font-size:2.6rem;font-weight:500;line-height:1.1;letter-spacing:-.01em}
@media(min-width:768px){.split-label{font-size:3.6rem}}
.split-label .num{display:block;font-size:1.4rem;color:#b3b3b3;margin-bottom:1.6rem}
@media(min-width:768px){.split-label .num{font-size:2rem}}
.split-content p{font-weight:500;font-size:1.7rem;line-height:1.55}
@media(min-width:768px){.split-content p{font-size:2.2rem;line-height:1.5}}
.split-content p+p{margin-top:2rem}
.split-content ul{margin:2.4rem 0 0;padding:0;list-style:none}
.split-content li{position:relative;padding:1.6rem 0 1.6rem 3.4rem;font-weight:500;font-size:1.6rem;line-height:1.5;border-top:1px solid rgba(21,23,23,.08)}
@media(min-width:768px){.split-content li{font-size:2rem;padding:2rem 0 2rem 4.2rem}}
.split-content li:before{content:"";position:absolute;left:.2rem;top:2.35rem;width:1.6rem;height:1.6rem;background:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%231F4257" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>') center/contain no-repeat}
.split-content .btn-row{margin-top:3rem}

/* big intro statement */
.statement{font-weight:500;font-size:2.6rem;line-height:1.3;letter-spacing:-.01em;max-width:97.6rem}
@media(min-width:768px){.statement{font-size:4.4rem;line-height:1.15;letter-spacing:-.02em}}

/* article prose */
.article-head{padding:6rem 0 0}
@media(min-width:768px){.article-head{padding:13rem 0 0}}
.article-date{font-weight:500;font-size:1.4rem;color:#b3b3b3;margin-bottom:2rem}
@media(min-width:768px){.article-date{font-size:1.8rem}}
.article-head h1{font-weight:700;font-size:3.4rem;line-height:1.1;letter-spacing:-.02em;max-width:97.6rem}
@media(min-width:768px){.article-head h1{font-size:6.4rem;letter-spacing:-.03em}}
.article-hero-img{margin:4rem 0 0;aspect-ratio:976/450;overflow:hidden}
@media(min-width:768px){.article-hero-img{margin:6rem 0 0}}
.article-hero-img img{width:100%;height:100%;object-fit:cover}
.article-prose{max-width:81.2rem;margin:0 auto;padding:5rem 0 2rem}
@media(min-width:768px){.article-prose{padding:8rem 0 4rem}}
.article-prose h2{font-weight:600;font-size:2.4rem;line-height:1.2;letter-spacing:-.01em;margin:4rem 0 1.6rem}
@media(min-width:768px){.article-prose h2{font-size:3.4rem;margin:5.5rem 0 2rem}}
.article-prose h3{font-weight:600;font-size:1.9rem;margin:3rem 0 1.2rem}
@media(min-width:768px){.article-prose h3{font-size:2.4rem}}
.article-prose p{font-weight:400;font-size:1.6rem;line-height:1.65;margin:0 0 1.8rem}
@media(min-width:768px){.article-prose p{font-size:2rem;margin:0 0 2.4rem}}
.article-prose ul,.article-prose ol{margin:0 0 2.4rem;padding-left:2.4rem}
.article-prose li{font-size:1.6rem;line-height:1.6;margin:.8rem 0}
@media(min-width:768px){.article-prose li{font-size:2rem}}
.article-prose strong{font-weight:600}
/* steel-blue only on inline text links — NEVER on buttons (blue-on-black is
   unreadable); buttons keep their own colours */
.article-prose a:not([class*="button_"]){color:${ACCENT};text-decoration:underline}
.article-prose a[class*="button_"]{color:#fff;text-decoration:none}
.legal-updated{font-size:1.4rem;color:#b3b3b3;margin-bottom:3rem}
@media(min-width:768px){.legal-updated{font-size:1.8rem}}

/* contact page */
.contact-grid{display:grid;gap:5rem;padding:2rem 0 6rem}
@media(min-width:768px){.contact-grid{grid-template-columns:1fr 97.6rem;gap:8rem;padding:2rem 0 10rem}}
.contact-block+.contact-block{margin-top:3.6rem}
.contact-label{font-size:1.4rem;color:#b3b3b3;margin-bottom:1rem}
@media(min-width:768px){.contact-label{font-size:1.8rem}}
.contact-value,.contact-value a{font-weight:500;font-size:1.8rem;line-height:1.5;color:#151717}
@media(min-width:768px){.contact-value,.contact-value a{font-size:2.2rem}}
.contact-value a:hover{color:${ACCENT}}
.contact-form{display:grid;gap:2.4rem}
@media(min-width:768px){.contact-form{grid-template-columns:1fr 1fr;gap:3rem}}
.form-field{display:flex;flex-direction:column;gap:.8rem}
.form-field.-full{grid-column:1/-1}
.form-field label{font-weight:500;font-size:1.4rem;color:#151717}
@media(min-width:768px){.form-field label{font-size:1.6rem}}
.form-field input,.form-field select,.form-field textarea{appearance:none;border:1px solid rgba(21,23,23,.25);background:#fff;border-radius:.4rem;padding:1.5rem 1.8rem;font-family:var(--font-primary);font-size:1.6rem;color:#151717;outline:none;transition:border-color .2s}
@media(min-width:768px){.form-field input,.form-field select,.form-field textarea{font-size:1.8rem}}
.form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:${ACCENT}}
.form-field textarea{min-height:14rem;resize:vertical}
.form-actions{grid-column:1/-1;display:flex;align-items:center;gap:2.4rem;flex-wrap:wrap}
.form-note{font-size:1.3rem;color:#b3b3b3;max-width:46rem}
@media(min-width:768px){.form-note{font-size:1.5rem}}
.form-status{grid-column:1/-1;display:none;padding:1.6rem 2rem;border-radius:.4rem;font-weight:500;font-size:1.6rem}
.form-status.-ok{display:block;background:rgba(31,66,87,.08);color:${ACCENT}}
.form-status.-err{display:block;background:rgba(170,40,40,.07);color:#a22}

/* 404 */
.notfound{min-height:55vh;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:3rem;padding:8rem 0}

/* responsive footer: the sticky reveal trick is desktop-only — on phones the
   footer is a normal block (sticky + negative z-index is flaky on mobile
   Safari), plus guards against fixed-width overflow at any width */
@media(max-width:767px){
  .footer_wrapper__9GQwi{position:static;z-index:0}
  .footer_newsletter-container__POI_T{width:auto;max-width:100%}
}
.footer_newsletter-container__POI_T{max-width:100%}
.footer_logo__5ncK8 svg{max-width:100%;height:auto}
.footer_copyright-container__yt1ht{flex-wrap:wrap}

/* anchored sections clear the sticky header */
[id]{scroll-margin-top:10rem}

/* ---- mobile polish ---- */
@media(max-width:767px){
  /* zoomed at rest; while scrolling the building slides UP (no zoom) and
     the smoke rises early to swallow its base for a clean flow */
  .hero_house__aJy7p{width:140%;left:-20%;right:auto}
  /* giant service words (Lease/Buy/Manage) were clipping off-screen */
  .services_item-more__pkhNR{font-size:7rem}
  /* feature cards: side-by-side swipe with snap + a peek of the next card */
  .features_items__oPgtQ{grid-auto-flow:column;grid-auto-columns:78%;gap:1.6rem;margin:6rem -2rem 0;padding:0 2rem;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
  .features_item__IPG1i{width:auto;height:38rem;scroll-snap-align:center}
}

/* footer contacts: never clip the phone number — items may wrap to a new
   row, numbers stay on one line */
.footer_contact__fFxbr{min-width:0}
.footer_contact-value__e1jbK span{white-space:nowrap}
@media(min-width:768px){.footer_contacts__HFiAl{gap:5rem;flex-wrap:wrap}}

/* ---- inner-page components (original, same design tokens) ---- */
/* editorial index: numbered giant words, light theme, arrow slides on hover */
.index-list{border-top:1px solid rgba(21,23,23,.12)}
.index-item{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:2rem;padding:2.6rem 0;border-bottom:1px solid rgba(21,23,23,.12);color:#151717}
@media(min-width:768px){.index-item{grid-template-columns:8rem 1fr auto auto;gap:4rem;padding:4rem 0}}
.index-num{font-size:1.4rem;font-weight:500;color:#b3b3b3}
@media(min-width:768px){.index-num{font-size:1.8rem}}
.index-word{font-weight:500;font-size:4.6rem;line-height:.95;letter-spacing:-.03em;transition:color .3s}
@media(min-width:768px){.index-word{font-size:9.2rem;letter-spacing:-.04em}}
.index-desc{grid-column:1/-1;font-weight:500;font-size:1.5rem;line-height:1.5;color:#6f7070;max-width:44rem}
@media(min-width:768px){.index-desc{grid-column:auto;font-size:1.8rem;text-align:left}}
.index-arrow{display:none}
@media(min-width:768px){.index-arrow{display:block;width:4.4rem;height:4.4rem;opacity:0;transform:translateX(-1.5rem);transition:opacity .3s,transform .6s cubic-bezier(.16,1,.3,1)}}
.index-item:hover .index-word{color:${ACCENT}}
.index-item:hover .index-arrow{opacity:1;transform:translateX(0)}

/* step pills: compact anchored overview; active state follows scroll */
.step-pills{display:flex;flex-wrap:wrap;gap:1rem}
.step-pill{display:inline-flex;align-items:center;gap:1rem;padding:1.1rem 1.8rem;border:1px solid rgba(21,23,23,.25);border-radius:100px;font-weight:500;font-size:1.4rem;line-height:1;color:#151717;transition:background .25s,color .25s,border-color .25s}
@media(min-width:768px){.step-pill{padding:1.4rem 2.4rem;font-size:1.7rem}}
.step-pill .n{font-size:1.1rem;color:#b3b3b3;transition:color .25s}
.step-pill:hover{border-color:#151717}
.step-pill.-active{background:#151717;border-color:#151717;color:#fff}
.step-pill.-active .n{color:hsla(0,0%,100%,.5)}

/* sector tabs: underlined tab row + image/text panel */
.tabs-nav{display:flex;flex-wrap:wrap;gap:0 3rem;border-bottom:1px solid rgba(21,23,23,.15)}
@media(min-width:768px){.tabs-nav{gap:0 5rem}}
.tab-btn{appearance:none;background:none;border:none;cursor:pointer;padding:1.4rem 0;font-family:var(--font-primary);font-weight:500;font-size:1.6rem;color:#8a8b8b;position:relative;transition:color .25s}
@media(min-width:768px){.tab-btn{font-size:2.2rem;padding:1.8rem 0}}
.tab-btn:after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:${ACCENT};transform:scaleX(0);transform-origin:left center;transition:transform .45s cubic-bezier(.16,1,.3,1)}
.tab-btn.-active{color:#151717}
.tab-btn.-active:after{transform:scaleX(1)}
.tab-panel{display:none;padding:4rem 0 0}
.tab-panel.-active{display:grid;gap:3rem;animation:tabIn .5s cubic-bezier(.16,1,.3,1)}
@media(min-width:768px){.tab-panel.-active{grid-template-columns:1fr 1fr;gap:6rem;align-items:center}}
@keyframes tabIn{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
.tab-media{aspect-ratio:16/11;overflow:hidden}
.tab-media img{width:100%;height:100%;object-fit:cover}
.tab-body h3{font-weight:500;font-size:2.4rem;letter-spacing:-.01em;margin:0 0 1.6rem}
@media(min-width:768px){.tab-body h3{font-size:3.4rem}}
.tab-body p{font-weight:500;font-size:1.6rem;line-height:1.55;color:#3c3e3e}
@media(min-width:768px){.tab-body p{font-size:2rem}}
.tab-body ul{margin:2rem 0 0;padding:0;list-style:none}
.tab-body li{padding:1.2rem 0;border-top:1px solid rgba(21,23,23,.08);font-weight:500;font-size:1.5rem}
@media(min-width:768px){.tab-body li{font-size:1.8rem;padding:1.5rem 0}}

/* interactive Netherlands logistics map (homepage, replaces chevron strip).
   pins are inside the SVG so they always align with the coastline. */
.nl-map{display:grid;gap:4rem;margin-top:5rem;align-items:center}
@media(min-width:768px){.nl-map{grid-template-columns:0.8fr 1fr;gap:7rem;margin-top:9rem}}
.nl-map-figure{order:-1;position:relative;width:100%;max-width:40rem;margin:0 auto}
@media(min-width:768px){.nl-map-figure{order:0;max-width:46rem}}
.nl-map-svg{width:100%;height:auto;display:block;overflow:visible}
.nl-map-shape{fill:#eceae6;stroke:rgba(21,23,23,.12);stroke-width:1.1;stroke-linejoin:round}
.nl-pin{cursor:pointer}
.nl-pin-hit{fill:transparent}
.nl-pin-dot{fill:#151717;transform-box:fill-box;transform-origin:center;transition:fill .25s,transform .25s}
.nl-pin-halo{fill:#1F4257;opacity:0;transform-box:fill-box;transform-origin:center;pointer-events:none}
.nl-pin:hover .nl-pin-dot{fill:#1F4257;transform:scale(1.25)}
.nl-pin.-active .nl-pin-dot{fill:#1F4257;transform:scale(1.35)}
.nl-pin.-active .nl-pin-halo{animation:nlPulse 2.2s ease-out infinite}
@keyframes nlPulse{0%{opacity:.45;transform:scale(.5)}100%{opacity:0;transform:scale(2.6)}}
.nl-map-eyebrow{font-weight:600;font-size:1.4rem;color:#b3b3b3;margin-bottom:1.4rem}
@media(min-width:768px){.nl-map-eyebrow{font-size:1.6rem}}
.nl-map-lede{font-weight:500;font-size:1.7rem;line-height:1.4;letter-spacing:-.01em;margin-bottom:3rem;max-width:34rem}
@media(min-width:768px){.nl-map-lede{font-size:2.2rem;margin-bottom:3.5rem}}
.nl-hub-list{list-style:none;margin:0;padding:0}
.nl-hub-row{display:flex;align-items:center;gap:1.4rem;width:100%;text-align:left;background:none;border:none;border-top:1px solid rgba(21,23,23,.1);padding:1.5rem 0;cursor:pointer;font-family:var(--font-primary);font-weight:500;font-size:2rem;line-height:1.1;letter-spacing:-.01em;color:#9a9b9b;transition:color .25s}
@media(min-width:768px){.nl-hub-row{font-size:2.6rem;padding:1.8rem 0}}
.nl-hub-list li:last-child .nl-hub-row{border-bottom:1px solid rgba(21,23,23,.1)}
.nl-hub-tick{flex:0 0 auto;width:0;height:2px;background:#1F4257;transition:width .35s cubic-bezier(.16,1,.3,1)}
.nl-hub-row:hover{color:#151717}
.nl-hub-row.-active{color:#151717}
.nl-hub-row.-active .nl-hub-tick{width:2.6rem}
.nl-map-notes{margin-top:2.4rem;min-height:7rem}
.nl-hub-note{display:none;font-weight:500;font-size:1.7rem;line-height:1.5;color:#5a5c5c;max-width:40rem}
@media(min-width:768px){.nl-hub-note{font-size:2rem}}
.nl-hub-note.-active{display:block;animation:tabIn .4s cubic-bezier(.16,1,.3,1)}

/* mini steps: three columns, steel numerals */
.mini-steps{display:grid;gap:3rem}
@media(min-width:768px){.mini-steps{grid-template-columns:repeat(3,1fr);gap:3rem}}
.mini-step{border-top:1px solid rgba(21,23,23,.15);padding-top:2.4rem}
.mini-step .ms-num{font-weight:700;font-size:3.4rem;line-height:1;letter-spacing:-.02em;color:${ACCENT}}
@media(min-width:768px){.mini-step .ms-num{font-size:5.2rem}}
.mini-step h3{font-weight:500;font-size:1.9rem;margin:1.6rem 0 .8rem}
@media(min-width:768px){.mini-step h3{font-size:2.4rem}}
.mini-step p{font-weight:500;font-size:1.5rem;line-height:1.55;color:#6f7070}
@media(min-width:768px){.mini-step p{font-size:1.8rem}}

/* stats band */
.stats-row{display:grid;gap:4rem}
@media(min-width:768px){.stats-row{grid-template-columns:repeat(3,1fr);gap:3rem}}
.stat{border-top:1px solid rgba(21,23,23,.15);padding-top:2.4rem}
.stat-num{font-weight:700;font-size:5.6rem;line-height:1;letter-spacing:-.03em}
@media(min-width:768px){.stat-num{font-size:9.6rem}}
.stat-label{margin-top:1.4rem;font-weight:500;font-size:1.5rem;line-height:1.5;color:#7a7a7a}
@media(min-width:768px){.stat-label{font-size:2rem}}

/* FAQ (native details/summary, styled like the numbered rows) */
.faq{border-bottom:1px solid rgba(21,23,23,.1)}
.faq-item{border-top:1px solid rgba(21,23,23,.1)}
.faq-item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:3rem;padding:2.6rem 0;font-weight:500;font-size:1.9rem;line-height:1.25;letter-spacing:-.01em}
@media(min-width:768px){.faq-item summary{padding:3.6rem 0;font-size:3rem;letter-spacing:-.02em}}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary:after{content:"";flex:0 0 auto;width:2rem;height:2rem;background:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23151717" d="M11 5h2v14h-2z"/><path fill="%23151717" d="M5 11h14v2H5z"/></svg>') center/contain no-repeat;transition:transform .35s cubic-bezier(.16,1,.3,1)}
@media(min-width:768px){.faq-item summary:after{width:2.6rem;height:2.6rem}}
.faq-item[open] summary:after{transform:rotate(45deg)}
.faq-item summary:hover{color:${ACCENT}}
.faq-body{padding:0 0 3rem;max-width:81.2rem}
.faq-body p{font-weight:400;font-size:1.6rem;line-height:1.6;color:#3c3e3e}
@media(min-width:768px){.faq-body p{font-size:2rem}}
`;
fs.writeFileSync('css/staal.css', staalCss, 'utf8');

console.log('index.html:', (head + body + tail).length, 'chars | staal.css:', staalCss.length, 'chars');
