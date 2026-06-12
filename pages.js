// Generates all inner pages for staalre.com from the assembled homepage:
// header + footer are extracted from index.html (so nav/footer changes made in
// assemble.js propagate automatically), content blocks reuse the same design
// tokens. Run AFTER assemble.js:  node assemble.js && node pages.js
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://staalre.com';
const home = fs.readFileSync('index.html', 'utf8');

/* ---------- shared chrome extracted from the homepage ---------- */
const loadingLine = '<div class="loading-line_loadingLine__br2iU"></div>';
const headerHtml = home
  .slice(home.indexOf('<header'), home.indexOf('</header>') + '</header>'.length)
  .replace('header_wrapper__MJ5bn header_transparent__rCyyn', 'header_wrapper__MJ5bn'); // solid bar on subpages
const footerHtml = home.slice(home.indexOf('<div class="footer_wrapper__9GQwi">'), home.indexOf('<div id="_rht_toaster"'));

/* ---------- tiny builders (FIND design tokens) ---------- */
const btn = (label, href, opts = {}) => `
<a class="button_button-round__TFjlU ${opts.secondary ? 'button_color-secondary__FZDOG' : 'button_color-primary__JJ7Hh'}${opts.inversed ? ' button_inversed__slQcI' : ''}" href="${href}">
  <div class="button_content__6Zh3n">
    <div class="button_button-round-text__IEwW5"><span data-text="${label}">${label}</span></div>
    <span class="button_icon-after__vljdM"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m20.78 12.531-6.75 6.75a.75.75 0 1 1-1.06-1.061l5.47-5.47H3.75a.75.75 0 1 1 0-1.5h14.69l-5.47-5.469a.75.75 0 1 1 1.06-1.061l6.75 6.75a.75.75 0 0 1 0 1.061"></path></svg></span>
  </div>
</a>`;

const hero = (title, sub) => `
<section class="page-hero">
  <div class="container_container__v5gtR">
    <h1>${title}</h1>
    ${sub ? `<div class="page-hero-sub">${sub}</div>` : ''}
  </div>
</section>`;

const statement = (html, opts = {}) => `
<section class="page-section${opts.grey ? ' -grey' : ''}">
  <div class="container_container__v5gtR"><div class="statement">${html}</div></div>
</section>`;

const split = (label, contentHtml, num) => `
<div class="split">
  <div class="split-label">${num ? `<span class="num">${num}</span>` : ''}${label}</div>
  <div class="split-content">${contentHtml}</div>
</div>`;

const splitSection = (rows, opts = {}) => `
<section class="page-section${opts.grey ? ' -grey' : ''}">
  <div class="container_container__v5gtR">${rows.join('')}</div>
</section>`;

const outro = (titleHtml, label = 'Let’s Talk', href = '/contact') => `
<section class="outro_root__stMHm">
  <div class="outro_bg__9kU9x"><img alt="" loading="lazy" width="2880" height="1464" decoding="async" style="color:transparent" src="/images/bg.jpg" /></div>
  <div class="container_container__v5gtR">
    <div class="outro_title__Eqbbj"><h2>${titleHtml}</h2></div>
    <div class="outro_actions__qfUxG"><div>${btn(label, href, { inversed: true })}</div></div>
  </div>
</section>`;

const postEntry = (p) => `
<div class="latest-posts_item__zlarM"><div class="post-entry_root__QwbHf"><div class="post-entry_grid__FQEYN">
  <div class="post-entry_grid-col__tD_KO">
    <a class="post-entry_thumbnail__AD3RU" href="${p.url}"><div class="image_container__RA4p4">
      <img alt="${p.title}" class="image_image__xwoGQ image_lazy__jTV8A" src="${p.thumb}" />
      <div class="image_placeholder__lcbHH"></div>
    </div></a>
  </div>
  <div class="post-entry_grid-col__tD_KO">
    <div class="post-entry_date__zuyY6">${p.date}</div>
    <div>
      <a href="${p.url}" class="post-entry_title__JBO73">${p.title}</a>
      <div class="post-entry_text__Xeca_"><p>${p.excerpt}</p></div>
    </div>
    <div class="post-entry_action__LwmZk"><a href="${p.url}"><button type="button" class="button_button-round__TFjlU button_color-secondary__FZDOG"><div class="button_content__6Zh3n"><div class="button_button-round-text__IEwW5"><span data-text="Read More">Read More</span></div><span class="button_icon-after__vljdM"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m20.78 12.531-6.75 6.75a.75.75 0 1 1-1.06-1.061l5.47-5.47H3.75a.75.75 0 1 1 0-1.5h14.69l-5.47-5.469a.75.75 0 1 1 1.06-1.061l6.75 6.75a.75.75 0 0 1 0 1.061"></path></svg></span></div></button></a></div>
  </div>
</div></div></div>`;

/* ---------- FIND-style feature blocks ---------- */
// dark full-bleed rows with a giant word + image revealed on hover (homepage services)
const darkRows = (items) => `
<section class="services_root__Ch_WM" style="padding:6rem 0">
  <div class="services_items__PESAO">
    ${items.map(it => `
    <a class="services_item__D_u7g" href="${it.href}">
      <div class="container_container__v5gtR">
        <div class="services_item-bg___wJGg"><img alt="" decoding="async" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;object-fit:cover;color:transparent" src="${it.img}" /></div>
        <div class="services_item-num__QGde9"></div>
        <div class="services_item-text__uKETL"><h3>${it.text}</h3></div>
        <div class="services_item-more__pkhNR"><span>${it.word}</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M3.315 10.996h16.623l-.884.707-8.084-8.135h2.526l8.261 8.337-8.286 8.337h-2.526l8.11-8.135.883.708H3.315z"></path></svg></div>
      </div>
    </a>`).join('')}
  </div>
</section>`;

// chevron-masked image strip (homepage "arrows" motif)
const chevronStrip = `
<section style="padding:2rem 0 4rem">
  <div class="container_container__v5gtR">
    <div class="arrows-section_arrows__BPayV">
      ${[1, 2, 3, 4].map(n => `<div class="arrows-section_arrow___KXxg"><img alt="" loading="lazy" width="692" height="880" decoding="async" style="color:transparent" src="/images/${n}.jpg" /></div>`).join('')}
    </div>
  </div>
</section>`;

// dark hover-expanding image cards (homepage features)
const featureCards = (items) => `
<section class="features_root__CCic6" style="padding:8rem 0">
  <div class="container_container__v5gtR">
    <div class="features_items__oPgtQ" style="margin-top:0">
      ${items.map(it => `
      <a class="features_item__IPG1i" href="${it.href}">
        <div class="features_item-bg__gntQ1"><img alt="${it.title}" loading="lazy" width="1107" height="940" decoding="async" style="color:transparent" src="${it.img}" /></div>
        <div class="features_item-title__uXmdj"><h3>${it.title}</h3></div>
        <div class="features_item-text__X8po0"><p>${it.text}</p></div>
        <div class="features_item-more__MtYBo"><span class="button_button-round__TFjlU button_color-secondary__FZDOG button_inversed__slQcI" style="display:inline-block"><span class="button_content__6Zh3n">${it.cta || 'Read More'}</span></span></div>
      </a>`).join('')}
    </div>
  </div>
</section>`;

// monochrome stats band
const statsBand = (stats) => `
<section class="page-section -grey">
  <div class="container_container__v5gtR">
    <div class="stats-row">
      ${stats.map(s => `<div class="stat"><div class="stat-num">${s[0]}</div><div class="stat-label">${s[1]}</div></div>`).join('')}
    </div>
  </div>
</section>`;

// native-details FAQ, styled like the numbered list rows
const faqBlock = (title, items) => `
<section class="page-section">
  <div class="container_container__v5gtR">
    <div class="latest-posts_title__BvrE_" style="margin-bottom:4rem"><h2>${title}</h2></div>
    <div class="faq">
      ${items.map(it => `
      <details class="faq-item">
        <summary>${it.q}</summary>
        <div class="faq-body"><p>${it.a}</p></div>
      </details>`).join('')}
    </div>
  </div>
</section>`;

/* ---------- the three insights ---------- */
const posts = [
  {
    slug: 'leasing-warehouse-space-netherlands',
    title: 'A Foreign Company’s Guide to Leasing Warehouse Space in the Netherlands',
    date: '2026-04-13',
    thumb: '/images/blog-q1-2026-nyc-market-report.png',
    excerpt: 'What international occupiers need to know before signing a Dutch lease: indexation, service charges, and break options.',
    body: `
<p>The Netherlands is one of Europe’s most efficient logistics markets, and one of its most particular. Dutch leases follow conventions that surprise many international occupiers, and the difference between a good and a bad signature is rarely the headline rent. It’s the structure around it.</p>
<h2>The ROZ model: the default you’ll be offered</h2>
<p>Most Dutch industrial leases are based on the ROZ model (Raad voor Onroerende Zaken), a standardised contract written, historically, from the landlord’s perspective. It works, but almost everything in it is negotiable, and landlords expect informed tenants to negotiate it. Key points to scrutinise:</p>
<ul>
<li><strong>Term and break options.</strong> 5 + 5 years is common, but growing operations often need a break at year three, or expansion rights in the same park. Both are achievable in the right market conditions, provided you ask before heads of terms.</li>
<li><strong>Indexation.</strong> Dutch rents index annually to CPI. After the inflation spikes of recent years, caps on annual indexation (for example 3–4%) have become a realistic ask.</li>
<li><strong>Service charges.</strong> Understand exactly what the landlord recharges. On logistics parks, items like security, landscaping and sprinkler maintenance can add materially to occupancy cost.</li>
<li><strong>Reinstatement.</strong> What you must remove or restore at lease end (racking, mezzanines, office fit-out) should be agreed in writing at the start, not argued about at the end.</li>
</ul>
<h2>Incentives: where the real deal lives</h2>
<p>Headline rents in prime Dutch logistics are public knowledge; incentives are not. Rent-free periods, phased rent, and landlord contributions to fit-out vary enormously with the asset, the landlord’s situation, and how your covenant is presented. A well-prepared international tenant, with a clear requirement, credible financials and proper representation, routinely secures terms a cold inquiry never sees.</p>
<h2>The practical checklist</h2>
<ol>
<li>Define the operational requirement first: clear height, floor load, docks per 1,000 m², power, office ratio, parking.</li>
<li>Check zoning (bestemmingsplan) and any environmental permit requirements for your activity.</li>
<li>Model total occupancy cost (rent, service charges, energy, municipal taxes), not just rent per m².</li>
<li>Negotiate the ROZ deviations in heads of terms, before lawyers are involved.</li>
<li>Document handover condition thoroughly; it defines your reinstatement liability.</li>
</ol>
<p>STAAL represents occupiers only. If you’re planning a Dutch entry or expansion, we’ll tell you what the market will actually give you, before you’re committed.</p>`
  },
  {
    slug: 'dutch-logistics-hub-comparison',
    title: 'Rotterdam, Venlo or Tilburg: Choosing the Right Dutch Logistics Hub',
    date: '2026-04-01',
    thumb: '/images/blog-philly-winter-chill.jpg',
    excerpt: 'The major Dutch logistics regions compared on location, labour, transport links and availability, and how to choose between them.',
    body: `
<p>“Where should we be?” is usually the first question an international occupier asks, and the honest answer is: it depends on what your network needs to do. The Netherlands is small, but its logistics geography is sharply differentiated.</p>
<h2>Rotterdam & the port corridor</h2>
<p>If your flows are container-heavy, proximity to the Port of Rotterdam compresses drayage cost and time. The Maasvlakte and surrounding zones (Botlek, Waalhaven, and the A15 corridor) offer deep-sea connectivity no inland location can match. The trade-offs: scarce land, premium rents, and a tight labour market shared with the port itself.</p>
<h2>Venlo & the southeast</h2>
<p>Venlo sits on the German border with tri-modal access (road, rail, barge) and consistently ranks as Europe’s top logistics location. It’s the natural choice for distribution into the German Ruhr and wider European market. Large-footprint, modern stock is more available here than in the Randstad, and labour, often supported by international workforce agencies, is comparatively accessible.</p>
<h2>Tilburg–Waalwijk & central Brabant</h2>
<p>The Tilburg region balances national coverage with European reach: barge terminals, strong XXL warehouse stock, and an established e-commerce fulfilment cluster. For a single-site Dutch operation serving both NL and cross-border e-commerce, central Brabant is frequently the rational compromise.</p>
<h2>Schiphol & the Randstad</h2>
<p>Air-cargo-dependent and high-value, low-volume flows (electronics, pharma, fashion) cluster around Schiphol and Amsterdam. Expect the country’s highest rents, smallest units, and most competitive leasing processes, but unmatched same-day reach into the Benelux’s wealthiest consumer base.</p>
<h2>How to actually decide</h2>
<ul>
<li><strong>Map your flows first.</strong> Inbound port vs. air vs. road; outbound B2B vs. B2C; where your customers actually are.</li>
<li><strong>Price labour, not just rent.</strong> A €5/m² saving means little if you can’t staff a second shift.</li>
<li><strong>Check power early.</strong> Grid congestion (netcongestie) is real; sites with secured capacity carry a premium for a reason.</li>
<li><strong>Visit before you shortlist.</strong> Parks that look identical on paper differ enormously in access, neighbours and condition.</li>
</ul>
<p>We run this analysis with clients as the first step of every search, before a single viewing is booked.</p>`
  },
  {
    slug: 'lease-or-buy-distribution',
    title: 'Lease or Buy: What Makes Sense for Your Distribution Operation',
    date: '2026-03-09',
    thumb: '/images/blog-what-1m-buys.jpg',
    excerpt: 'A practical look at when leasing beats buying for a distribution operation in the Netherlands, and when it doesn’t.',
    body: `
<p>Most international occupiers default to leasing in a new market, usually rightly. But the Dutch market periodically rewards owner-occupiers, and the question deserves a real answer, not a reflex.</p>
<h2>The case for leasing</h2>
<ul>
<li><strong>Speed and flexibility.</strong> A lease can complete in weeks; an acquisition takes months. If your volumes may double, or halve, within five years, flexibility is worth paying for.</li>
<li><strong>Capital discipline.</strong> Your capital almost certainly earns more in your operation (inventory, automation, marketing) than in Dutch industrial brick.</li>
<li><strong>Market access.</strong> The institutional landlords who own most modern Dutch logistics stock simply don’t sell single assets to occupiers; the leasable universe is far larger than the buyable one.</li>
</ul>
<h2>The case for buying</h2>
<ul>
<li><strong>Specialised fit-out.</strong> Heavy automation, cold storage, or process-specific installations amortise over 10–15 years, longer than any sensible lease commitment.</li>
<li><strong>Scarce locations.</strong> In land-constrained zones (port areas, urban last-mile), owning is control. Leases renew on the landlord’s terms when alternatives don’t exist.</li>
<li><strong>Total-cost arithmetic.</strong> With Dutch industrial yields and interest rates in their current relationship, ownership can undercut occupancy cost for stable, long-horizon operations, especially with energy investments (solar, storage) that landlords under-deliver.</li>
</ul>
<h2>The hybrid routes</h2>
<p>Build-to-suit with a forward lease, sale-and-leaseback of an acquired asset, or buying the land and leasing the building: Dutch practice supports all three. They’re negotiated cases, and they live or die on representation.</p>
<h2>Our view</h2>
<p>Lease until the operation is proven and the location is certain; buy when specialisation, scarcity or arithmetic says so. We support both, and we’ll show you the numbers side by side before you choose.</p>`
  }
];

/* ---------- page definitions ---------- */
const pages = [];

/* SERVICES */
pages.push({
  file: 'services.html', url: '/services',
  title: 'Services — Lease, Buy & Occupier Advisory',
  desc: 'Warehouse leasing, acquisition and occupier advisory in the Netherlands. STAAL represents the occupier — full search, negotiation and handover support.',
  content: `
${hero('Services', 'Find, lease, and acquire warehouse & logistics space in the Netherlands — <span class="em">with one independent advisor working only for you.</span>')}
${darkRows([
  { word: 'Lease', href: '#lease', img: '/images/buy.jpg', text: 'The fastest route into the Dutch market: full search, shortlists, viewings, and lease terms negotiated on your side.' },
  { word: 'Buy', href: '#buy', img: '/images/sell.jpg', text: 'Buyer-side acquisition of logistics property: sourcing, assessment, due-diligence coordination, and price negotiation.' },
  { word: 'Advise', href: '#advise', img: '/images/rent.jpg', text: 'For sitting tenants and owner-occupiers: renewals, expansions, relocations, and stay-or-go decisions with real market evidence.' }
])}
${statement('Whether you’re entering the Dutch market or expanding in it, the service is the same: <span class="em">we run the full process from requirement to keys, and we answer only to you.</span>')}
${splitSection([
  split('<span id="lease"></span>Lease', `
    <p>The fastest route into the Dutch market. We translate your operation into a property brief, scan the entire market — including space that never reaches the portals — and negotiate lease terms that protect you for the full term.</p>
    <ul>
      <li>Requirement intake: size, clear height, docks, power, office ratio, timing, budget</li>
      <li>Full market search, including off-market and pre-completion space</li>
      <li>Shortlists, viewings and suitability advice — we’ll tell you what’s wrong with a building, not just what’s right</li>
      <li>Negotiation of rent, incentives, indexation caps, break options and reinstatement</li>
      <li>Documentation support and handover coordination</li>
    </ul>
    <div class="btn-row">${btn('Start a Lease Search', '/contact')}</div>`, '01'),
  split('<span id="buy"></span>Buy', `
    <p>For operations ready to own — specialised fit-out, scarce locations, or simply better arithmetic. We source, assess and negotiate logistics property acquisitions on the buyer’s side only.</p>
    <ul>
      <li>Acquisition brief and total-cost-of-ownership modelling</li>
      <li>Sourcing: on-market, off-market and build-to-suit opportunities</li>
      <li>Technical and commercial assessment, with due-diligence coordination</li>
      <li>Price and condition negotiation through to notarial transfer</li>
      <li>Coordination with your legal, tax and finance advisors — or ours</li>
    </ul>
    <div class="btn-row">${btn('Discuss an Acquisition', '/contact')}</div>`, '02'),
  split('<span id="advise"></span>Advise', `
    <p>Already in a building? We advise sitting tenants and owner-occupiers on what their space is worth to them — and what to do next.</p>
    <ul>
      <li>Lease renewals and rent reviews, negotiated with market evidence</li>
      <li>Expansion, consolidation and relocation studies</li>
      <li>Sale-and-leaseback and disposal strategy for owner-occupiers</li>
      <li>Stay-or-go analysis ahead of break dates</li>
    </ul>
    <div class="btn-row">${btn('Ask About Your Situation', '/contact')}</div>`, '03')
])}
${statement('Outside our core scope — landlord leasing, residential, retail — <span class="em">we’ll say so honestly and bring in a trusted partner instead of stretching.</span>', { grey: true })}
${outro('Tell us what your operation needs. <span class="em">We’ll find the space that fits.</span>', 'Send Your Requirements')}`
});

/* PROCESS */
pages.push({
  file: 'process.html', url: '/process',
  title: 'Our Process — From Brief to Keys',
  desc: 'How STAAL works: requirement intake, market search, viewings, suitability advice, negotiation, documentation and handover — one contact throughout.',
  content: `
${hero('From Brief<br />to Keys.', 'One advisor, one process, six steps — <span class="em">from the first conversation to the day you collect the keys.</span>')}
${chevronStrip}
${splitSection([
  split('Intake', `
    <p>We start with your operation, not with listings. Throughput, inbound and outbound flows, racking, staff, growth plans — translated into a precise property brief: location, size, clear height, docks, floor load, power, office share, parking, timing and budget.</p>
    <p>This step is free, and it’s where most costly mistakes are prevented.</p>`, '01'),
  split('Market Search', `
    <p>We scan the full Dutch market against your brief — published listings, our owner and developer network, and space that hasn’t reached the market yet. You get a clear overview of what genuinely exists, not a portal export.</p>`, '02'),
  split('Shortlist & Viewings', `
    <p>We shortlist the buildings worth your time and organise viewings around your schedule — in person with you, or on your behalf with full photo and video reporting if you’re abroad.</p>`, '03'),
  split('Suitability Advice', `
    <p>For each serious candidate: honest advice on structure, condition, compliance, zoning, energy, expansion potential and total occupancy cost. We’ll talk you out of the wrong building — that’s the job.</p>`, '04'),
  split('Negotiation', `
    <p>Lease or purchase, we negotiate on your side only: rent or price, incentives, indexation, break options, reinstatement, conditions precedent. Because we negotiate in this market continuously, we know what the market will actually give.</p>`, '05'),
  split('Documentation & Handover', `
    <p>We support the contract phase together with your (or our partner) legal counsel, manage the conditions through signing, and coordinate the handover — snagging, meter readings, condition reporting — so day one in the building is an operational day, not an administrative one.</p>`, '06')
])}
${statement('Throughout all six steps you have one point of contact: <span class="em">the person who took your brief is the person who hands you the keys.</span>', { grey: true })}
${faqBlock('Common <span class="em">Questions</span>', [
  { q: 'What does your service cost?', a: 'In many Dutch occupier transactions our fee is settled within the deal, so there is often nothing out of pocket. Where that is not the case, we agree a fixed fee before we start. Either way, you know the cost up front.' },
  { q: 'We’re not in the Netherlands yet. Can you run the search remotely?', a: 'Yes. Most of our clients decide from abroad. We do the viewings on your behalf with full photo and video reporting, handle everything in English, and plan a single efficient visit for the final shortlist if you want to see it in person.' },
  { q: 'How long does a search take?', a: 'A lease typically runs six weeks to three months from brief to signature, depending on how specific the requirement is. Acquisitions usually take three to six months including due diligence.' },
  { q: 'Do you only work on large requirements?', a: 'No. We work from a first Dutch unit of around 1,000 m² up to XXL distribution centres. The process is the same; only the shortlist changes.' },
  { q: 'Can you also help with offices or retail?', a: 'Our core is logistics and industrial. For anything outside it we either bring in a trusted partner or tell you honestly who is better placed, and stay involved as much as you want.' }
])}
${outro('Ready to start? <span class="em">The intake conversation costs nothing.</span>', 'Book an Intake Call')}`
});

/* SECTORS */
pages.push({
  file: 'sectors.html', url: '/sectors',
  title: 'Sectors — E-commerce, Logistics & Distribution',
  desc: 'STAAL advises e-commerce, fulfilment, logistics, distribution and light-industrial occupiers on warehouse space across the Netherlands.',
  content: `
${hero('Sectors', 'Built for the businesses that move goods — <span class="em">especially international companies entering or expanding in the Dutch market.</span>')}
${featureCards([
  { title: 'E-commerce & Fulfilment', href: '#ecommerce', img: '/images/mortgage-services.jpg', text: 'Fulfilment centres, returns processing, and leases that scale with your volumes.' },
  { title: 'Logistics & Distribution', href: '#logistics', img: '/images/property-management.jpg', text: 'Distribution centres and cross-docks, planned around your network, not a portal list.' },
  { title: 'Light Industrial & Production', href: '#industrial', img: '/images/development.jpg', text: 'Power, permits and process-specific space, checked before you commit.' }
])}
${splitSection([
  split('<span id="ecommerce"></span>E-commerce & Fulfilment', `
    <p>D2C brands, marketplaces and 3PL fulfilment operations live or die on labour, parcel-network proximity and scalability. We search with those constraints first: workforce catchment, carrier depots, mezzanine potential, and leases with room to grow — or shrink.</p>
    <ul>
      <li>Fulfilment centres from first 2,000 m² unit to XXL</li>
      <li>Returns processing and value-added services space</li>
      <li>Scalable lease structures for fast-growing volumes</li>
    </ul>`),
  split('<span id="logistics"></span>Logistics & Distribution', `
    <p>For 3PLs, freight forwarders and wholesale distribution, the building is a node in a network. Port drayage, the German hinterland, barge and rail terminals, driving-time coverage — we model the geography before we shortlist a single building.</p>
    <ul>
      <li>Distribution centres on the A15, A16, A58 and A67 corridors</li>
      <li>Cross-dock and transshipment facilities</li>
      <li>Multi-site network moves and consolidations</li>
    </ul>`),
  split('<span id="industrial"></span>Light Industrial & Production', `
    <p>Assembly, processing and tech production need what standard logistics boxes often lack: power, permits and process-specific fit-out. We check grid capacity (netcongestie is real), zoning and environmental categories before you fall in love with a building.</p>
    <ul>
      <li>Production and assembly facilities with secured power</li>
      <li>Combined production–warehouse–office configurations</li>
      <li>Build-to-suit guidance where existing stock won’t fit</li>
    </ul>`),
  split('International Market Entry', `
    <p>Our sweet spot: companies from abroad making their first Dutch commitment. We act as your local eyes, explain how the Dutch market actually works, and coordinate the local network — legal, tax, workforce, fit-out — around your timeline and your language.</p>
    <ul>
      <li>Market orientation and location strategy before you commit</li>
      <li>Remote viewings with full reporting for overseas teams</li>
      <li>One English-speaking contact from brief to keys</li>
    </ul>`)
])}
${outro('Don’t see your exact operation? <span class="em">If it moves goods, we can help — or say honestly who can.</span>')}`
});

/* PARTNERS */
pages.push({
  file: 'partners.html', url: '/partners',
  title: 'Partners — A Trusted Network Around Your Deal',
  desc: 'STAAL works with trusted Dutch partners in legal, tax, finance, fit-out, construction and property management — coordinated around your transaction.',
  content: `
${hero('Partners', 'Boutique doesn’t mean alone. <span class="em">Around every transaction we coordinate a proven Dutch network — so you never have to assemble one yourself.</span>')}
${statement('We stay independent: partners are engaged case by case, you contract with them directly, <span class="em">and we take no hidden fees for introductions.</span>')}
<section class="page-section -grey">
  <div class="container_container__v5gtR">
    <div class="rewired_label__db93N">How engagement works:</div>
    <div>
      <div class="rewired_list-item__R5lrq" data-index="01"><span>You brief us once. <span class="em">One conversation covers the property deal and everything needed around it.</span></span></div>
      <div class="rewired_list-item__R5lrq" data-index="02"><span>We bring the right partner in. <span class="em">Matched to your case, introduced at the right moment, briefed by us.</span></span></div>
      <div class="rewired_list-item__R5lrq" data-index="03"><span>You contract directly. <span class="em">Transparent scope and fees, while we keep the whole timeline coordinated.</span></span></div>
    </div>
  </div>
</section>
${splitSection([
  split('Legal & Tax', `
    <p>Dutch real estate lawyers and tax advisors who work in English and know occupier-side priorities — ROZ deviations, VAT-on-rent elections, transfer tax structuring and permit questions.</p>`),
  split('Finance', `
    <p>For acquisitions and heavy fit-out: introductions to banks and alternative lenders active in Dutch industrial property, plus support preparing the file they’ll want to see.</p>`),
  split('Fit-out & Construction', `
    <p>Racking, mezzanines, cold rooms, offices, solar — partners who can price your fit-out before you sign, so the building decision is made with real numbers.</p>`),
  split('Property & Facility Management', `
    <p>Once you’re in: building maintenance, facility services and landlord liaison for occupiers who don’t want to manage Dutch suppliers from abroad.</p>`),
  split('Workforce & Relocation', `
    <p>Logistics staffing agencies, payroll providers and relocation support for the people side of a Dutch market entry.</p>`)
])}
${outro('Need a deal team, not just a building? <span class="em">Tell us what you’re planning.</span>')}`
});

/* ABOUT */
pages.push({
  file: 'about.html', url: '/about',
  title: 'About STAAL Real Estate',
  desc: 'STAAL Real Estate is a boutique occupier-side advisory for warehouse and logistics property in the Netherlands, based in Amsterdam.',
  content: `
${hero('Steel-strong<br />on your side.', 'STAAL is a boutique real estate advisory from Amsterdam — <span class="em">focused on warehouse and logistics space, acting for the occupier.</span>')}
<section style="padding:0 0 2rem">
  <div class="container_container__v5gtR">
    <div class="why-us_preview__OofJt"><video src="/images/why-us.mp4" autoplay="" playsinline="" loop="" muted=""></video></div>
  </div>
</section>
${statement('<em>Staal</em> is Dutch for steel: the material the buildings are made of, <span class="em">and the way we negotiate for the companies inside them.</span>')}
${statsBand([
  ['100%', 'Occupier-side. We never act for the landlord.'],
  ['1', 'Point of contact, from first brief to keys.'],
  ['NL', 'Nationwide, from the Rotterdam port to Venlo.']
])}
${splitSection([
  split('What we are', `
    <p>A specialist, not a department. STAAL does one thing: helping businesses find, lease and acquire logistics property in the Netherlands. No landlord listings, no divided loyalty — when we sit at the table, everyone knows whose side we’re on.</p>`),
  split('Who we work for', `
    <p>Occupiers — especially international e-commerce, fulfilment, logistics and distribution companies entering or expanding in the Dutch market. Most of our clients work in English, decide from abroad, and need a local advisor they can trust with the whole process.</p>`),
  split('How we work', `
    <p>Personal, fast and hands-on. You get one point of contact with direct lines to owners and developers, honest advice that includes “don’t take this building”, and a process that runs from first brief to final handover. When a request falls outside our scope, we bring in a trusted partner rather than pretend.</p>`),
  split('Where we are', `
    <p>Head office: Speerstraat 7-2, Amsterdam, 1076XM, The Netherlands — working nationwide, from the Rotterdam port corridor to Venlo and everything between.</p>
    <div class="btn-row">${btn('Meet Us', '/contact')}</div>`)
])}
${outro('The Dutch market, with someone on your side. <span class="em">Let’s talk about what you’re planning.</span>')}`
});

/* CONTACT */
pages.push({
  file: 'contact.html', url: '/contact',
  title: 'Contact STAAL Real Estate',
  desc: 'Send your warehouse or logistics requirement to STAAL Real Estate, Amsterdam. We respond within one business day.',
  content: `
${hero('Contact', 'Tell us what your operation needs — <span class="em">we respond within one business day.</span>')}
<section class="page-section" style="padding-top:0">
  <div class="container_container__v5gtR">
    <div class="contact-grid">
      <div>
        <div class="contact-block">
          <div class="contact-label">Head Office</div>
          <div class="contact-value"><a href="https://maps.google.com/?q=Speerstraat+7-2,+Amsterdam" target="_blank" rel="noopener noreferrer">Speerstraat 7-2<br />Amsterdam, 1076XM<br />The Netherlands</a></div>
        </div>
        <div class="contact-block">
          <div class="contact-label">Email</div>
          <div class="contact-value"><a href="mailto:tex@staalre.com">tex@staalre.com</a></div>
        </div>
        <div class="contact-block">
          <div class="contact-label">Phone / WhatsApp</div>
          <div class="contact-value"><a href="tel:+31628363631">+31 6 28 36 36 31</a></div>
        </div>
        <div class="contact-block">
          <div class="contact-label">Hours</div>
          <div class="contact-value">Monday – Friday, 9:00 – 18:00 CET<br />Calls outside office hours by appointment</div>
        </div>
      </div>
      <div>
        <form id="contact-form" class="contact-form" novalidate>
          <div class="form-field"><label for="cf-name">Your name *</label><input id="cf-name" name="name1" type="text" autocomplete="name" required /></div>
          <div class="form-field"><label for="cf-company">Company</label><input id="cf-company" name="company" type="text" autocomplete="organization" /></div>
          <div class="form-field"><label for="cf-email">Email *</label><input id="cf-email" name="email" type="email" autocomplete="email" required /></div>
          <div class="form-field"><label for="cf-phone">Phone</label><input id="cf-phone" name="phone" type="tel" autocomplete="tel" /></div>
          <div class="form-field -full"><label for="cf-interest">I’m looking to</label>
            <select id="cf-interest" name="interest">
              <option value="lease">Lease warehouse / logistics space</option>
              <option value="buy">Buy warehouse / logistics property</option>
              <option value="advice">Get advice on an existing situation</option>
              <option value="other">Something else</option>
            </select>
          </div>
          <div class="form-field -full"><label for="cf-message">Your requirement *</label><textarea id="cf-message" name="message" placeholder="Location(s), approximate size in m², timing, and anything we should know."></textarea></div>
          <div id="contact-status" class="form-status" role="status"></div>
          <div class="form-actions">
            <button type="submit" class="button_button-round__TFjlU button_color-primary__JJ7Hh"><div class="button_content__6Zh3n"><div class="button_button-round-text__IEwW5"><span data-text="Send Requirements">Send Requirements</span></div><span class="button_icon-after__vljdM"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m20.78 12.531-6.75 6.75a.75.75 0 1 1-1.06-1.061l5.47-5.47H3.75a.75.75 0 1 1 0-1.5h14.69l-5.47-5.469a.75.75 0 1 1 1.06-1.061l6.75 6.75a.75.75 0 0 1 0 1.061"></path></svg></span></div></button>
            <div class="form-note">Your details are used only to answer your request — see our <a href="/privacy" style="text-decoration:underline">privacy policy</a>.</div>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>`
});

/* INSIGHTS LISTING */
pages.push({
  file: 'insights.html', url: '/insights',
  title: 'Insights — Dutch Logistics Real Estate',
  desc: 'Practical insight on the Dutch logistics property market: site selection, lease terms, and what to know before you sign.',
  content: `
${hero('Insights<br /><span class="em">&amp; Resources</span>', 'Practical reading on the Dutch logistics market: <span class="em">site selection, lease terms, and what to know before you sign.</span>')}
<section class="latest-posts_root__W0OHF" style="padding-top:0">
  <div class="container_container__v5gtR">
    <div class="latest-posts_items__LcqgW">
      ${posts.map(p => postEntry({ ...p, url: '/insights/' + p.slug })).join('\n')}
    </div>
  </div>
</section>
${outro('Prefer answers to articles? <span class="em">Ask us directly.</span>')}`
});

/* ARTICLES */
for (const p of posts) {
  const others = posts.filter(x => x.slug !== p.slug);
  pages.push({
    file: path.join('insights', p.slug + '.html'), url: '/insights/' + p.slug,
    title: p.title,
    desc: p.excerpt,
    ogImage: SITE_URL + p.thumb,
    content: `
<article>
  <div class="container_container__v5gtR">
    <div class="article-head">
      <div class="article-date">${p.date}</div>
      <h1>${p.title}</h1>
      <div class="article-hero-img"><img src="${p.thumb}" alt="${p.title}" loading="eager" /></div>
    </div>
    <div class="article-prose">${p.body}
      <div style="margin-top:4rem">${btn('Discuss Your Requirement', '/contact')}</div>
    </div>
  </div>
</article>
<section class="latest-posts_root__W0OHF">
  <div class="container_container__v5gtR">
    <div class="latest-posts_title__BvrE_" style="margin-bottom:2rem"><h2>More <span class="em">Insights</span></h2></div>
    <div class="latest-posts_items__LcqgW">
      ${others.map(o => postEntry({ ...o, url: '/insights/' + o.slug })).join('\n')}
    </div>
  </div>
</section>`
  });
}

/* LEGAL PAGES */
const LEGAL_DATE = '12 June 2026';
const legalIntro = (title) => `
${hero(title)}
<section class="page-section" style="padding-top:0">
  <div class="container_container__v5gtR"><div class="article-prose" style="margin:0;padding-top:0">
  <p class="legal-updated">Last updated: ${LEGAL_DATE}</p>`;
const legalOutro = `</div></div></section>`;

pages.push({
  file: 'terms.html', url: '/terms',
  title: 'Terms & Conditions',
  desc: 'Terms and conditions for the use of staalre.com and the services of STAAL Real Estate, Amsterdam.',
  content: `${legalIntro('Terms &amp;<br />Conditions')}
<h2>1. Who we are</h2>
<p>STAAL Real Estate (“STAAL”, “we”, “us”) is a real estate advisory firm with its head office at Speerstraat 7-2, Amsterdam, 1076XM, The Netherlands. You can reach us at <a href="mailto:tex@staalre.com">tex@staalre.com</a> or +31 6 28 36 36 31.</p>
<h2>2. Scope of these terms</h2>
<p>These terms govern your use of this website and apply to our advisory services unless a written engagement agreement states otherwise. By using this website you accept these terms. If you do not agree with them, please do not use the site.</p>
<h2>3. Services and engagements</h2>
<p>Information on this website describes our services in general terms and does not constitute an offer. An advisory relationship is established only by a written engagement (which may be by email) confirming scope and, where applicable, fees. Until such an engagement exists, no agency, brokerage or fiduciary relationship arises from your use of this website or from preliminary conversations.</p>
<h2>4. No advice without engagement</h2>
<p>Content on this website — including articles, market commentary and examples — is general information, not advice for your specific situation. Property decisions should not be based on website content alone. We accept no liability for decisions made on the basis of this website without a written engagement.</p>
<h2>5. Third parties and partners</h2>
<p>Where we introduce trusted partners (legal, tax, finance, construction or other professionals), you contract with them directly. We are not a party to those agreements and accept no liability for partner services, save where mandatory law provides otherwise.</p>
<h2>6. Intellectual property</h2>
<p>All content on this website (text, design, graphics and logos) belongs to STAAL or its licensors. You may not reproduce or reuse it for commercial purposes without our prior written consent.</p>
<h2>7. Liability</h2>
<p>This website is provided “as is”. We make reasonable efforts to keep its content accurate and available but give no guarantees. To the maximum extent permitted by Dutch law, our liability for damage arising from the use of this website is excluded. For engaged services, liability is limited to the fee paid for the engagement concerned, except in cases of intent or gross negligence.</p>
<h2>8. Governing law and disputes</h2>
<p>Dutch law governs these terms and any use of this website. Disputes will be submitted exclusively to the competent court in Amsterdam, the Netherlands.</p>
<h2>9. Changes</h2>
<p>We may update these terms from time to time; the version published on this page applies. Material changes will be indicated by the “last updated” date above.</p>
${legalOutro}`
});

pages.push({
  file: 'privacy.html', url: '/privacy',
  title: 'Privacy Policy',
  desc: 'How STAAL Real Estate handles personal data under the GDPR: what we collect, why, how long we keep it, and your rights.',
  content: `${legalIntro('Privacy<br />Policy')}
<p>STAAL Real Estate, Speerstraat 7-2, Amsterdam, 1076XM, The Netherlands, is the controller for personal data processed via this website. Contact: <a href="mailto:tex@staalre.com">tex@staalre.com</a>.</p>
<h2>1. What we collect, and why</h2>
<ul>
<li><strong>Contact form.</strong> Name, company, email, phone and your message. Used solely to answer your request and conduct any follow-up you ask for. Legal basis: pre-contractual steps at your request (art. 6(1)(b) GDPR).</li>
<li><strong>Newsletter.</strong> Your email address, used to send occasional market updates. Legal basis: consent (art. 6(1)(a)); you can withdraw it any time via the unsubscribe option or by emailing us.</li>
<li><strong>Correspondence.</strong> If you email or call us, we process the contact details and content involved to handle the matter.</li>
</ul>
<h2>2. Where data is stored</h2>
<p>Form submissions are stored in a database hosted by Supabase (within the EU where available) and in our email and business systems. We share personal data with no one else, except service providers processing it on our instructions, or where the law requires disclosure.</p>
<h2>3. Retention</h2>
<p>Contact requests are kept as long as needed to handle your matter and for a maximum of 2 years after last contact, unless an engagement follows (in which case engagement-related retention rules apply, including statutory administration periods). Newsletter data is kept until you unsubscribe.</p>
<h2>4. Cookies and analytics</h2>
<p>This website currently sets no tracking or advertising cookies. See the <a href="/cookie-policy">cookie policy</a> for detail.</p>
<h2>5. Your rights</h2>
<p>Under the GDPR you may request access, correction, deletion, restriction, portability, and object to processing. Email <a href="mailto:tex@staalre.com">tex@staalre.com</a>; we respond within one month. You can also lodge a complaint with the Dutch supervisory authority, the Autoriteit Persoonsgegevens.</p>
<h2>6. Changes</h2>
<p>We may update this policy; the version on this page applies, with the date above.</p>
${legalOutro}`
});

pages.push({
  file: 'cookie-policy.html', url: '/cookie-policy',
  title: 'Cookie Policy',
  desc: 'Cookie policy for staalre.com — which cookies the site uses and why.',
  content: `${legalIntro('Cookie<br />Policy')}
<h2>1. The short version</h2>
<p>This website currently uses <strong>no tracking, advertising or analytics cookies</strong>, and shows no cookie banner because none is required for the way it works today.</p>
<h2>2. What the site does use</h2>
<ul>
<li><strong>Strictly necessary, session-level storage.</strong> Technical functionality (for example remembering that a form was submitted during your visit) may use short-lived browser storage. It identifies you to no third party and expires with your session.</li>
<li><strong>Hosting logs.</strong> Our hosting provider (Vercel) keeps standard, short-lived technical logs (IP address, request, time) for security and reliability, as virtually all hosting does.</li>
</ul>
<h2>3. If this changes</h2>
<p>If we ever add analytics or marketing tools that require consent, this page will be updated first and a consent banner added before any such cookie is set.</p>
<h2>4. Questions</h2>
<p>Email <a href="mailto:tex@staalre.com">tex@staalre.com</a>.</p>
${legalOutro}`
});

pages.push({
  file: 'disclaimer.html', url: '/disclaimer',
  title: 'Disclaimer',
  desc: 'Disclaimer for staalre.com — the limits of the information on this website.',
  content: `${legalIntro('Disclaimer')}
<h2>1. General information only</h2>
<p>The content of this website — including market commentary, articles, indicative figures and descriptions of lease or purchase practice — is provided for general information. It is not legal, tax, financial or investment advice, and it is not advice on any specific property or transaction.</p>
<h2>2. No rights from website content</h2>
<p>Market conditions change and every transaction is different. No rights can be derived from the information on this website. Verify any figure or statement before relying on it; for decisions, engage us (or another qualified advisor) for advice on your specific situation.</p>
<h2>3. Third-party links</h2>
<p>Links to third-party websites are provided for convenience. We do not control and are not responsible for their content.</p>
<h2>4. Contact</h2>
<p>Questions about this disclaimer: <a href="mailto:tex@staalre.com">tex@staalre.com</a> · STAAL Real Estate, Speerstraat 7-2, Amsterdam, 1076XM, The Netherlands.</p>
${legalOutro}`
});

/* 404 */
pages.push({
  file: '404.html', url: '/404',
  title: 'Page not found',
  desc: 'This page does not exist.',
  noSitemap: true,
  content: `
<section class="notfound">
  <div class="container_container__v5gtR">
    <h1 style="font-weight:700;font-size:clamp(4rem,8vw,9.6rem);letter-spacing:-.03em;line-height:1">Lost in <span class="em">the warehouse.</span></h1>
    <p class="page-hero-sub" style="margin-top:2rem">This page doesn’t exist — but the right space might. </p>
    <div style="margin-top:3.6rem;display:flex;gap:1.6rem;flex-wrap:wrap">${btn('Back to Home', '/')}${btn('Contact Us', '/contact', { secondary: true })}</div>
  </div>
</section>`
});

/* ---------- shared head/tail ---------- */
const headFor = (p) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${p.title} | STAAL Real Estate</title>
    <meta name="description" content="${p.desc}" />
    <meta name="author" content="STAAL Real Estate" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#1F4257" />
    <link rel="canonical" href="${SITE_URL}${p.url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="STAAL Real Estate" />
    <meta property="og:title" content="${p.title} | STAAL Real Estate" />
    <meta property="og:description" content="${p.desc}" />
    <meta property="og:url" content="${SITE_URL}${p.url}" />
    <meta property="og:locale" content="en_NL" />
    <meta property="og:image" content="${p.ogImage || SITE_URL + '/images/og-image.jpg'}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${p.title} | STAAL Real Estate" />
    <meta name="twitter:description" content="${p.desc}" />
    <meta name="twitter:image" content="${p.ogImage || SITE_URL + '/images/og-image.jpg'}" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preload" href="/fonts/26d0ba92e140f0dc-s.p.woff2" as="font" crossorigin="" type="font/woff2" />
    <link rel="preload" href="/fonts/5c0c2bcbaa4149ca-s.p.woff2" as="font" crossorigin="" type="font/woff2" />
    <link rel="stylesheet" href="/css/a463080343a8b988.css" />
    <link rel="stylesheet" href="/css/804a152dbcc38a56.css" />
    <link rel="stylesheet" href="/css/5290e5f354def47d.css" />
    <link rel="stylesheet" href="/css/b6b0e4d6e1848150.css" />
    <link rel="stylesheet" href="/css/33f3cda2aa79f5e3.css" />
    <link rel="stylesheet" href="/css/4c0c15c47e700f3f.css" />
    <link rel="stylesheet" href="/css/f46e979614fc3394.css" />
    <link rel="stylesheet" href="/css/76625cdb983d5d00.css" />
    <link rel="stylesheet" href="/css/c8e589196f30db03.css" />
    <link rel="stylesheet" href="/css/dd8866e20d835adf.css" />
    <link rel="stylesheet" href="/css/17424100e880a33c.css" />
    <link rel="stylesheet" href="/css/staal.css" />
  </head>
  <body class="__variable_3d9088 __variable_c1a059">
    ${loadingLine}
    ${headerHtml}
    <main>`;

const tail = `
    </main>
    ${footerHtml}
    <script src="/js/lenis.min.js"></script>
    <script src="/js/main.js"></script>
    <script src="/js/forms.js"></script>
  </body>
</html>
`;

/* ---------- write pages ---------- */
fs.mkdirSync('insights', { recursive: true });
for (const p of pages) {
  fs.writeFileSync(p.file, headFor(p) + p.content + tail, 'utf8');
}

/* ---------- sitemap + robots ---------- */
const urls = ['/'].concat(pages.filter(p => !p.noSitemap).map(p => p.url));
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  '\n</urlset>\n', 'utf8');
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');

console.log('generated', pages.length, 'pages +', 'sitemap.xml + robots.txt');
console.log(pages.map(p => '  ' + p.file).join('\n'));
