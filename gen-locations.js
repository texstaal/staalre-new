/*
 * gen-locations.js — generates the /locations hub index and the eight
 * per-hub warehouse-location pages for staalre.com.
 *
 * These are static location landing pages (SEO + GEO): each targets
 * "warehouse space in <hub>" intent, front-loads a self-contained, citable
 * answer, carries sourced market data, an FAQ, BreadcrumbList + Place schema,
 * and cross-links to the sibling hubs.
 *
 * Run:  node gen-locations.js
 * Rebuild any time the data below changes (e.g. a quarterly figures refresh).
 */
const fs = require('fs');
const path = require('path');

const LAST_MOD = '2026-07-09';

/* ---- shared shell pieces (copied verbatim from the existing subpages) ---- */
const LOGO_PATHS = `
              <path fill="currentColor" d="M263.71203,186.0462c0,29.76939 -8.68394,52.40864 -26.0492,67.91512c-19.84188,17.36 -51.78028,26.03869 -95.81521,26.03869c-34.73314,0 -64.1923,-6.66216 -88.38009,-19.99174c-24.18253,-13.33484 -38.60056,-34.42291 -43.25408,-63.26685h82.79587c1.85615,18.91643 18.2907,28.37333 49.30103,28.37333c18.9138,0 31.9384,-2.0139 39.06854,-6.04695c7.1354,-4.03042 10.70573,-11.16056 10.70573,-21.39042c0,-2.78948 -1.00958,-5.42648 -3.02873,-7.90836c-2.0139,-2.48188 -5.11099,-4.65089 -9.29653,-6.50967c-4.18554,-1.86404 -8.37108,-3.57033 -12.55662,-5.1215c-4.18554,-1.54854 -9.61202,-3.09709 -16.27944,-4.64826c-6.66742,-1.54854 -12.25164,-2.78948 -16.75268,-3.72282c-4.49577,-0.9307 -10.38761,-2.0139 -17.67812,-3.24958c-7.28526,-1.24094 -12.32263,-2.17164 -15.11211,-2.79737c-16.12695,-2.78948 -30.69746,-7.13014 -43.71681,-13.01934c-31.31793,-13.33484 -46.9769,-33.95756 -46.9769,-61.86817c0,-28.21822 8.52357,-49.61127 25.57596,-64.18178c19.22404,-16.43192 50.85221,-24.65052 94.88976,-24.65052c34.10742,0 63.64019,7.443 88.60094,22.32638c24.96601,14.87812 37.44901,35.49822 37.44901,61.85765h-83.25859c-1.55117,-19.53164 -15.65897,-29.29878 -42.32864,-29.29878c-15.19361,0 -27.21127,2.01653 -36.05033,6.04695c-8.8338,4.02516 -13.2507,8.67343 -13.2507,13.94479c0,3.72282 1.31718,7.29315 3.95418,10.70573c2.63437,3.40732 6.81991,6.4308 12.55662,9.06516c5.73408,2.637 11.08432,4.88751 16.04807,6.75155c4.96376,1.85878 11.78366,3.79643 20.46498,5.81559c8.67869,2.0139 15.11211,3.40732 19.29765,4.18554c4.1908,0.77296 10.31662,1.93239 18.37221,3.48094c15.50648,3.09972 30.08225,7.28526 43.72732,12.55662c31.31793,12.71962 46.9769,32.2539 46.9769,58.60808zM263.71203,186.0462" data-letter="S"></path>
              <path fill="currentColor" d="M372.99838,277.21315h-71.63793v-217.2169h-78.59981v-54.88526h228.83755v54.88526h-78.59981zM372.99838,277.21315" data-letter="T"></path>
              <path fill="currentColor" d="M662.35972,277.21315h-75.82347l-19.06629,-55.34798h-96.75117l-19.06629,55.34798h-75.81296l89.30554,-272.10216h107.9091zM555.37606,165.58122l-36.28169,-111.63192l-36.28169,111.63192zM555.37606,165.58122" data-letter="A"></path>
              <path fill="currentColor" d="M769.4731,277.21315h-75.82347l-19.06629,-55.34798h-96.75117l-19.06629,55.34798h-75.81296l89.30554,-272.10216h107.9091zM662.48944,165.58122l-36.28169,-111.63192l-36.28169,111.63192zM662.48944,165.58122" data-letter="A"></path>
              <path fill="currentColor" d="M759.66355,5.11099h71.62742v217.2169h133.49558v54.88526h-205.123zM759.66355,5.11099" data-letter="L"></path>`;

const HEAD_LINKS = `    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="preload" href="/fonts/space-grotesk-400.woff2" as="font" crossorigin="" type="font/woff2" />
    <link rel="preload" href="/fonts/space-grotesk-700.woff2" as="font" crossorigin="" type="font/woff2" />
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
    <link rel="stylesheet" href="/css/staal.css" />`;

const VERCEL = `    <!-- Vercel Web Analytics (cookieless; enable Analytics on the Vercel project) -->
    <script defer src="/_vercel/insights/script.js"></script>
    <!-- Vercel Speed Insights (Core Web Vitals; cookieless) -->
    <script>window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments);};</script>
    <script defer src="/_vercel/speed-insights/script.js"></script>`;

const HEADER = `    <header class="header_wrapper__MJ5bn">
      <div class="container_container__v5gtR">
        <div class="header_content__cVJDb">
          <div class="header_logo__LO_Jk">
            <a href="/" aria-label="Staal Real Estate — home">            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 975 280">${LOGO_PATHS}
            </svg>
</a>
          </div>
          <nav class="header_nav__if_jI">
            <div class="header_nav-item__Wn05d"><a href="/lease-warehouse-netherlands"><span data-text="Lease">Lease</span></a></div>
            <div class="header_nav-item__Wn05d"><a href="/services"><span data-text="Services">Services</span></a></div>
            <div class="header_nav-item__Wn05d"><a href="/process"><span data-text="Process">Process</span></a></div>
            <div class="header_nav-item__Wn05d"><a href="/sectors"><span data-text="Sectors">Sectors</span></a></div>
            <div class="header_nav-item__Wn05d"><a href="/locations"><span data-text="Locations">Locations</span></a></div>
            <div class="header_nav-item__Wn05d"><a href="/insights"><span data-text="Insights">Insights</span></a></div>
            <div class="header_nav-item__Wn05d"><a href="/partners"><span data-text="Partners">Partners</span></a></div>
            <div class="header_nav-item__Wn05d"><a href="/about"><span data-text="About">About</span></a></div>
          </nav>
          <div class="header_actions__Sv09J">
            <a class="button_button-round__TFjlU button_color-primary__JJ7Hh" href="/contact"><div class="button_content__6Zh3n"><div class="button_button-round-text__IEwW5"><span data-text="Contact">Contact</span></div></div></a>
          </div>
          <button class="burger-btn_btn__IvzqD header_burger-control__YR_x_" aria-label="Menu control" aria-expanded="false"><span></span><span></span></button>
        </div>
      </div>
      <div class="burger-menu_wrapper__gKR7D" style="padding-top:0" data-lenis-prevent="true">
        <div class="burger-menu_backdrop__wfXK5"></div>
        <div class="burger-menu_content__rv4kf">
          <nav class="burger-menu_nav__dAhwA">
            <div class="burger-menu_nav-item__mCA9u"><a href="/lease-warehouse-netherlands">Lease</a></div>
            <div class="burger-menu_nav-item__mCA9u"><a href="/services">Services</a></div>
            <div class="burger-menu_nav-item__mCA9u"><a href="/process">Process</a></div>
            <div class="burger-menu_nav-item__mCA9u"><a href="/sectors">Sectors</a></div>
            <div class="burger-menu_nav-item__mCA9u"><a href="/locations">Locations</a></div>
            <div class="burger-menu_nav-item__mCA9u"><a href="/insights">Insights</a></div>
            <div class="burger-menu_nav-item__mCA9u"><a href="/partners">Partners</a></div>
            <div class="burger-menu_nav-item__mCA9u"><a href="/about">About</a></div>
          </nav>
        </div>
        <div class="burger-menu_actions__In3qE">
          <a class="button_button-round__TFjlU button_color-primary__JJ7Hh" href="/contact"><div class="button_content__6Zh3n"><div class="button_button-round-text__IEwW5"><span data-text="Contact">Contact</span></div></div></a>
        </div>
      </div>
    </header>`;

const ARROW = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m20.78 12.531-6.75 6.75a.75.75 0 1 1-1.06-1.061l5.47-5.47H3.75a.75.75 0 1 1 0-1.5h14.69l-5.47-5.469a.75.75 0 1 1 1.06-1.061l6.75 6.75a.75.75 0 0 1 0 1.061"></path></svg>`;

function ctaButton(label, href, inversed) {
  const cls = 'button_button-round__TFjlU button_color-primary__JJ7Hh' + (inversed ? ' button_inversed__slQcI' : '');
  return `<a class="${cls}" href="${href}"><div class="button_content__6Zh3n"><div class="button_button-round-text__IEwW5"><span data-text="${label}">${label}</span></div><span class="button_icon-after__vljdM">${ARROW}</span></div></a>`;
}

const FOOTER = `    <div class="footer_wrapper__9GQwi">
      <div class="container_container__v5gtR">
        <div class="footer_content__E2ijt">
          <div class="footer_newsletter-container__POI_T">
            <div>
              <div class="footer_newsletter-title__bRCRZ">Get our market updates.</div>
              <div class="footer_newsletter-form__0k_h5">
                <form>
                  <div class="footer_input-container__K2c_A">
                    <div class="form-text-input_form-input__5AJnT">
                      <div class="text-input_input-wrapper__ia6GQ form-text-input_input-wrapper__Aw_YD footer_input-wrapper__1l5CZ text-input_dark__c1u8L">
                        <input type="text" class="text-input_input__cs4B0" placeholder="Enter your email" autocomplete="on" name="email" aria-label="Email address" value="" />
                      </div>
                    </div>
                    <button id="btn_newsletter_signup_footer" type="submit" aria-label="Subscribe" class="footer_newsletter-submit-btn__HrC3v">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m20.78 12.531-6.75 6.75a.75.75 0 1 1-1.06-1.061l5.47-5.47H3.75a.75.75 0 1 1 0-1.5h14.69l-5.47-5.469a.75.75 0 1 1 1.06-1.061l6.75 6.75a.75.75 0 0 1 0 1.061"></path></svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div class="footer_contacts__HFiAl">
              <div data-contact="address" class="footer_contact__fFxbr">
                <div class="footer_contact-label__gYKsP">Head Office</div>
                <div class="footer_contact-value__e1jbK"><a href="https://maps.google.com/?q=Speerstraat+7-2,+Amsterdam"><div>Speerstraat 7-2,</div><div>Amsterdam, 1076XM, The Netherlands</div></a></div>
              </div>
              <div data-contact="email" class="footer_contact__fFxbr">
                <div class="footer_contact-label__gYKsP">Email Us</div>
                <div class="footer_contact-value__e1jbK"><a href="mailto:tex@staalre.com">tex@staalre.com</a></div>
              </div>
              <div data-contact="phone" class="footer_contact__fFxbr">
                <div class="footer_contact-label__gYKsP">Call Us</div>
                <div class="footer_contact-value__e1jbK"><a href="tel:+31659129127"><span>+31 6 59 12 91 27</span></a></div>
              </div>
              <div data-contact="whatsapp" class="footer_contact__fFxbr">
                <div class="footer_contact-label__gYKsP">WhatsApp</div>
                <div class="footer_contact-value__e1jbK"><a href="https://wa.me/31659129127?text=Hi%20Staal%20Real%20Estate%2C%20I%27d%20like%20to%20enquire%20about%20warehouse%20space." target="_blank" rel="noopener noreferrer" aria-label="Message us on WhatsApp" style="display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.4rem;border-radius:999px;background:transparent;color:#fff;border:1.5px solid #fff;font-weight:600;font-size:1.5rem;text-decoration:none"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true" style="flex:none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"></path></svg>Message us</a></div>
              </div>
            </div>
          </div>
          <div class="footer_links__vib46">
            <div class="footer_nav__XkBHY">
              <a class="footer_nav-link__LFUNG" href="/lease-warehouse-netherlands"><span data-text="Lease">Lease</span></a>
              <a class="footer_nav-link__LFUNG" href="/services"><span data-text="Services">Services</span></a>
              <a class="footer_nav-link__LFUNG" href="/process"><span data-text="Process">Process</span></a>
              <a class="footer_nav-link__LFUNG" href="/sectors"><span data-text="Sectors">Sectors</span></a>
              <a class="footer_nav-link__LFUNG" href="/locations"><span data-text="Locations">Locations</span></a>
              <a class="footer_nav-link__LFUNG" href="/about"><span data-text="About">About</span></a>
              <a class="footer_nav-link__LFUNG" href="/contact"><span data-text="Contact">Contact</span></a>
            </div>
            <div class="footer_socials__4JfcA">
              <a href="https://www.linkedin.com/in/texstaal" target="_blank" rel="noopener noreferrer" class="footer_social-link__2uQBq">LinkedIn</a>
            </div>
          </div>
          <div class="footer_logo__5ncK8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 975 280">${LOGO_PATHS}
            </svg>
          </div>
          <div class="footer_copyright-container__yt1ht">
            <div class="footer_sublinks__Pj_ed">
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy policy</a>
              <a href="/disclaimer">Disclaimer</a>
              <a href="/cookie-policy">Cookie Policy</a>
            </div>
            <div>Staal Real Estate</div>
            <div>Copyright &copy;<!-- -->2026</div>
          </div>
        </div>
      </div>
    </div>
    <script defer src="/js/lenis.min.js"></script>
    <script defer src="/js/main.js"></script>
    <script defer src="/js/forms.js"></script>`;

function docHead(title, description, canonical, ogImage, jsonld) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="author" content="Staal Real Estate" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#1F4257" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="en" href="${canonical}" />
    <link rel="alternate" hreflang="x-default" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Staal Real Estate" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:locale" content="en_NL" />
    <meta property="og:image" content="https://www.staalre.com/images/${ogImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="https://www.staalre.com/images/${ogImage}" />
${HEAD_LINKS}
    <script type="application/ld+json">
${JSON.stringify(jsonld)}
    </script>
${VERCEL}
  </head>
  <body class="__variable_3d9088 __variable_c1a059">
    <div class="loading-line_loadingLine__br2iU"></div>
${HEADER}
    <main>`;
}

const DOC_TAIL = `    </main>
${FOOTER}
  </body>
</html>
`;

/* ------------------------------- hub data ------------------------------- */
const BASE = 'https://www.staalre.com';
const hubs = [
  {
    slug: 'rotterdam',
    name: 'Rotterdam',
    region: 'South Holland',
    hero: 'hub-rotterdam.jpg',
    heroAlt: 'Loading docks at a logistics warehouse near the Port of Rotterdam',
    subtitle: 'Europe’s largest seaport and the Netherlands’ biggest distribution gateway.',
    lede: 'Rotterdam is the Netherlands’ largest logistics gateway and home to Europe’s biggest seaport, which handled 435.8 million tonnes of cargo in 2024. For tenants, warehousing here means direct access to deep-sea container flows, port drayage and the A15 corridor — at the highest rents and tightest land availability in the country.',
    stats: [
      { num: '435.8M', unit: 'tonnes', label: 'Cargo through the Port of Rotterdam in 2024 — Europe’s largest port.', src: 'Port of Rotterdam, 2024' },
      { num: '13.8M', unit: 'TEU', label: 'Container throughput in 2024, up 2.8% year on year.', src: 'Port of Rotterdam, 2024' },
      { num: '~€85', unit: '/m²/yr', label: 'Indicative prime logistics rent — among the highest in the Netherlands.', src: 'CBRE / Statista, 2023–25' },
    ],
    known: [
      'Deep-sea container and bulk flows through Maasvlakte, Botlek and Waalhaven',
      'Port-edge distribution and drayage on the A15 corridor toward Ridderkerk and Barendrecht',
      'Distripark Maasvlakte, deep-sea, shortsea and RoRo terminals, and rail/barge “extended-gate” links inland',
      'Some of the largest — and scarcest — modern warehouse footprints in the country',
    ],
    suits: [
      'Importers and exporters moving containerised volume',
      'Port drayage, transloading and deep-sea supply chains',
      'Operations that must sit within reach of the terminals',
    ],
    faq: [
      { q: 'Where do warehouses cluster around Rotterdam?', a: 'The heaviest concentration sits on the port itself — Maasvlakte, Botlek and Waalhaven — and along the A15 corridor east of the port toward Ridderkerk, Barendrecht and Dordrecht, where larger modern units and better land availability are found.' },
      { q: 'Why are Rotterdam warehouse rents higher than the rest of the Netherlands?', a: 'Land next to the terminals is scarce and demand from port-related tenants is constant. That scarcity keeps prime Rotterdam logistics rents among the highest in the country, so structuring the lease well matters more here than almost anywhere else.' },
    ],
  },
  {
    slug: 'schiphol-amsterdam',
    name: 'Schiphol / Amsterdam',
    region: 'North Holland',
    hero: 'hub-schiphol-amsterdam.jpg',
    heroAlt: 'Modern logistics warehouse in the Amsterdam – Schiphol region',
    subtitle: 'The air-cargo gateway for high-value, time-critical goods.',
    lede: 'Schiphol and the wider Amsterdam region are the Netherlands’ air-freight gateway. Amsterdam Airport Schiphol — Europe’s fourth-largest cargo airport — handled 1.5 million tonnes of freight in 2024, up 8.2%. Warehousing here is built around speed: pharma, perishables and e-commerce express, in the smallest, most expensive units in the country.',
    stats: [
      { num: '1.5M', unit: 'tonnes', label: 'Air cargo through Schiphol in 2024, up 8.2% — Europe’s #4 airfreight hub.', src: 'Schiphol Cargo, 2024' },
      { num: '+11%', unit: 'YoY', label: 'Recent year-on-year prime logistics rental growth around Schiphol.', src: 'CBRE market data, 2025' },
      { num: 'Highest', unit: 'rents', label: 'Rents rank at or near the top nationally; units are the smallest.', src: 'Statista / CBRE, 2023–25' },
    ],
    known: [
      'Air-cargo-adjacent handling for time-critical and temperature-controlled goods',
      'Clustered around Schiphol Logistics Park, Aalsmeer and Hoofddorp, with pharma-compliant space',
      'Pharma, perishables and high-value express e-commerce',
      'Scarce land across the Randstad, so smaller and higher-rent units',
    ],
    suits: [
      'Pharma, life-sciences and cold-chain operations',
      'E-commerce express and high-value, time-critical goods',
      'Tenants that must be minutes from the freight terminals',
    ],
    faq: [
      { q: 'What kind of warehousing does Schiphol specialise in?', a: 'Air-freight-adjacent space: temperature-controlled and pharma handling, high-value and time-critical goods, and express e-commerce. Because proximity to the cargo terminals is the whole point, units are smaller and command the highest rents in the Netherlands.' },
      { q: 'Is space available directly at Schiphol, or nearby?', a: 'On-airport cargo space is limited and tightly held. Most tenants take modern units in the surrounding Randstad — Hoofddorp, Aalsmeer, Amsterdam Westpoort and along the A4/A9 — within a short drive of the terminals.' },
    ],
  },
  {
    slug: 'venlo',
    name: 'Venlo',
    region: 'Limburg',
    hero: 'hub-venlo.jpg',
    heroAlt: 'Palletised goods inside a distribution warehouse in the Venlo region',
    subtitle: 'Ranked Europe’s most desirable logistics location.',
    lede: 'Venlo, on the German border in Limburg, is ranked Europe’s most desirable logistics location by Prologis research — scoring top in nine of eleven criteria. It is tri-modal (road, rail and barge) and sits on the doorstep of the German market, which makes it the default choice for German-hinterland distribution and large fashion and 3PL operations.',
    stats: [
      { num: '#1', unit: 'in Europe', label: 'Ranked Europe’s most desirable logistics location, top in 9 of 11 criteria.', src: 'Prologis research' },
      { num: 'Tri-modal', unit: 'access', label: 'Road (A67/A73), rail and barge via Trade Port Noord.', src: 'Trade Port Noord' },
      { num: '+3.4%', unit: '/yr', label: 'Among the strongest Dutch logistics rental growth since 2017.', src: 'Market data (Statista), 2017–24' },
    ],
    known: [
      'Direct road, rail and barge links straight into the German market',
      'A major 3PL, fashion and e-commerce fulfilment cluster',
      'An “extended gate” of the Port of Rotterdam, with Venray’s expansion-ready land nearby',
      'Strong land availability compared with the Randstad — room for XXL',
    ],
    suits: [
      'Companies distributing into Germany and Central Europe',
      'Fashion, apparel and returns-heavy e-commerce',
      'XXL distribution centres needing land and modern stock',
    ],
    faq: [
      { q: 'Why is Venlo rated Europe’s best logistics location?', a: 'In Prologis’s European ranking, Venlo came out first overall, scoring highest on availability of land, road access, transport cost and regulation. Its position directly on the German border, with road, rail and barge connections, lets tenants serve the Netherlands and the German hinterland from one site.' },
      { q: 'What does tri-modal mean for a Venlo warehouse?', a: 'Tri-modal means goods can move by road (the A67 and A73), by rail, and by barge through Trade Port Noord. That gives tenants cheaper long-haul options and resilience when one mode is congested — a real advantage for high-volume distribution.' },
    ],
  },
  {
    slug: 'tilburg-waalwijk',
    name: 'Tilburg–Waalwijk',
    region: 'North Brabant',
    hero: 'hub-tilburg-waalwijk.jpg',
    heroAlt: 'Large XXL distribution warehouse in the Tilburg – Waalwijk region',
    subtitle: 'The XXL e-commerce fulfilment cluster of central Brabant.',
    lede: 'Tilburg–Waalwijk, in central North Brabant, is the Netherlands’ XXL e-commerce fulfilment cluster. Its central position in the Dutch population, combined with rail and barge terminals and the A58/A59/A261, has drawn a dense concentration of very large distribution and fulfilment centres serving national and Benelux demand.',
    stats: [
      { num: 'XXL', unit: 'cluster', label: 'One of the highest concentrations of very large DCs in the Netherlands.', src: 'Regional market data' },
      { num: '+3.2%', unit: '/yr', label: 'Among the strongest Dutch logistics rental growth since 2017.', src: 'Market data (Statista), 2017–24' },
      { num: 'Central', unit: 'to NL', label: 'Barge terminal at Tilburg plus A58/A59/A261 for national reach.', src: 'Port of Tilburg' },
    ],
    known: [
      'A concentration of XXL national e-commerce and retail fulfilment centres',
      'Central location for next-day coverage of the Dutch population',
      'Barge terminals linking to both Rotterdam and Antwerp, on the A58, A27 and A16',
    ],
    suits: [
      'National e-commerce fulfilment and returns processing',
      'Retailers needing very large, single-site footprints',
      'Operations optimising for next-day national delivery',
    ],
    faq: [
      { q: 'Why is Tilburg–Waalwijk the go-to for e-commerce fulfilment?', a: 'It sits centrally in the Dutch population, so a single distribution centre here reaches most of the country within a short drive. Combined with rail and barge terminals and abundant land for very large buildings, that has made it the default cluster for XXL e-commerce and retail fulfilment.' },
      { q: 'Can you still find very large (XXL) units here?', a: 'Yes — this is one of the few Dutch regions purpose-built for XXL footprints, though the best modern units move quickly. Early representation and a clear requirement are the difference between securing space and missing it.' },
    ],
  },
  {
    slug: 'breda-moerdijk',
    name: 'Breda–Moerdijk',
    region: 'North Brabant',
    hero: 'hub-breda-moerdijk.webp',
    heroAlt: 'Warehouse loading docks in the Breda – Moerdijk logistics corridor',
    subtitle: 'On the Rotterdam–Antwerp axis, between two of Europe’s biggest ports.',
    lede: 'Breda–Moerdijk sits on the corridor between Rotterdam and Antwerp — two of Europe’s largest ports — with the Port of Moerdijk, a major combined sea-and-inland port, at its centre. On the A16/A17/A58 with barge and rail terminals, it is a natural base for Benelux and cross-border distribution.',
    stats: [
      { num: 'Rtm–Antw', unit: 'corridor', label: 'Midway between the ports of Rotterdam and Antwerp on the A16/A17.', src: 'Geography' },
      { num: 'Sea+inland', unit: 'port', label: 'Port of Moerdijk — one of the largest industrial ports in the Netherlands.', src: 'Port of Moerdijk' },
      { num: 'Barge+rail', unit: 'terminals', label: 'Container barge and rail links for cost-efficient long-haul.', src: 'Port of Moerdijk' },
    ],
    known: [
      'Position on the Rotterdam–Antwerp axis for two-port reach',
      'The Port of Moerdijk on the Hollandsch Diep — sea, barge, rail and pipeline links',
      'Industrial and chemical-adjacent as well as general distribution space',
    ],
    suits: [
      'Cross-border Benelux distribution',
      'Container barge and multimodal supply chains',
      'Industrial and chemical-adjacent tenants',
    ],
    faq: [
      { q: 'What makes Breda–Moerdijk useful for cross-border logistics?', a: 'It lies on the A16 corridor between Rotterdam and Antwerp, so tenants can draw on both ports from one location and serve the Netherlands, Belgium and northern France with ease. The Port of Moerdijk adds barge and rail options on the doorstep.' },
      { q: 'Is the Port of Moerdijk a seaport or an inland port?', a: 'Both — it is a combined sea and inland port, one of the largest industrial port areas in the Netherlands, handling seagoing and barge traffic alongside a large logistics and manufacturing estate.' },
    ],
  },
  {
    slug: 'eindhoven',
    name: 'Eindhoven',
    region: 'North Brabant',
    hero: 'hub-eindhoven.jpg',
    heroAlt: 'High-tech logistics facility in the Eindhoven Brainport region',
    subtitle: 'Brainport — high-tech manufacturing supply chains and high-value goods.',
    lede: 'Eindhoven anchors the Brainport region, the Netherlands’ high-tech manufacturing heartland around companies like ASML. That concentration of advanced manufacturing drives demand for high-value, spare-parts and manufacturing-adjacent warehousing — and has given Eindhoven the strongest logistics rental growth in the country since 2017.',
    stats: [
      { num: '+3.7%', unit: '/yr', label: 'Strongest Dutch logistics rental growth of any region since 2017.', src: 'Market data (Statista), 2017–24' },
      { num: 'Brainport', unit: 'cluster', label: 'High-tech manufacturing hub (ASML and its supply chain).', src: 'Brainport Eindhoven' },
      { num: '18M', unit: 'consumers', label: 'Within a 100 km radius — reaching into Belgium and Germany.', src: 'Brainport / regional data' },
    ],
    known: [
      'High-tech and high-value manufacturing supply chains',
      'Spare-parts, service-logistics and cleanroom-adjacent space',
      'The A2/A67 crossroads and Eindhoven Airport air cargo; Helmond’s automotive and high-tech campuses',
    ],
    suits: [
      'High-tech, semiconductor and high-value manufacturers',
      'Service-parts and after-sales logistics',
      'Suppliers that need to sit close to Brainport OEMs',
    ],
    faq: [
      { q: 'What drives warehouse demand in Eindhoven?', a: 'The Brainport high-tech cluster — ASML and its extensive supply chain — generates steady demand for high-value, spare-parts and manufacturing-adjacent warehousing. That has made Eindhoven the fastest-growing Dutch logistics rental market since 2017.' },
      { q: 'Is Eindhoven only for high-tech tenants?', a: 'No. While high-tech supply chains dominate, its central-south position and A2/A67 access also make it a strong general distribution location for southern Netherlands and cross-border Belgian and German flows.' },
    ],
  },
  {
    slug: 'nijmegen-arnhem',
    name: 'Nijmegen–Arnhem',
    region: 'Gelderland',
    hero: 'hub-nijmegen-arnhem.jpg',
    heroAlt: 'Distribution warehouse in the Nijmegen – Arnhem eastern corridor',
    subtitle: 'The eastern corridor into the German market.',
    lede: 'Nijmegen–Arnhem, in Gelderland, is a fast-growing logistics region on the eastern corridor toward Germany. On the A15, A12, A50 and A73 with barge terminals on the Waal and Rhine, it offers newer XXL stock and better availability than the crowded Randstad — useful for tenants serving the German hinterland.',
    stats: [
      { num: 'A15/A12', unit: 'corridor', label: 'Eastern motorway corridor toward the German border and the Ruhr.', src: 'Geography' },
      { num: 'Growing', unit: 'region', label: 'A fast-growing logistics region with newer XXL developments.', src: 'Regional market data' },
      { num: 'Barge', unit: 'terminals', label: 'Container barge links on the Waal and Rhine (e.g. BCTN Nijmegen).', src: 'BCTN' },
    ],
    known: [
      'Close to the German border and the Ruhr industrial region',
      'Newer XXL developments with stronger availability than the Randstad',
      'Barge connectivity on the Waal and Rhine',
    ],
    suits: [
      'German-hinterland and eastern-Netherlands distribution',
      'Growth-stage tenants seeking modern space and availability',
      'Multimodal supply chains using Rhine barge',
    ],
    faq: [
      { q: 'Why choose Nijmegen–Arnhem over a Randstad location?', a: 'For tenants serving eastern Netherlands and Germany, it is closer to the market and typically offers newer stock and better availability than the congested Randstad — often at more workable rents, with barge access on the Rhine.' },
      { q: 'How good is the German-market access from here?', a: 'Very good. The A15 and A12 run east toward the German border and the Ruhr conurbation, one of Europe’s densest industrial and consumer markets, so a single site here can serve both eastern Netherlands and western Germany.' },
    ],
  },
  {
    slug: 'roermond-maastricht',
    name: 'Roermond–Maastricht',
    region: 'Limburg',
    hero: 'hub-roermond-maastricht.jpg',
    heroAlt: 'Interior of a distribution warehouse in the Roermond – Maastricht region',
    subtitle: 'The southern gateway into Germany and Belgium.',
    lede: 'Roermond–Maastricht, in southern Limburg, is a tri-border gateway into Germany and Belgium. On the A2, A73 and A76 and close to the Venlo logistics cluster, it suits cross-border distribution and southern-Netherlands coverage, with barge access on the Maas and an established retail-logistics presence around Roermond.',
    stats: [
      { num: 'Tri-border', unit: 'NL/DE/BE', label: 'Cross-border position into Germany and Belgium on the A2/A73/A76.', src: 'Geography' },
      { num: 'Near Venlo', unit: 'cluster', label: 'Draws on the wider Limburg logistics ecosystem around Venlo.', src: 'Regional market data' },
      { num: 'Maas', unit: 'barge', label: 'Barge access on the Maas plus a strong retail-logistics presence.', src: 'Geography' },
    ],
    known: [
      'A tri-border location for German and Belgian distribution',
      'Proximity to the Venlo tri-modal cluster',
      'Retail and outlet logistics presence around Roermond',
    ],
    suits: [
      'Cross-border distribution into Germany and Belgium',
      'Southern-Netherlands and Euregio coverage',
      'Retail and outlet-linked logistics',
    ],
    faq: [
      { q: 'What is Roermond–Maastricht best suited for?', a: 'Cross-border distribution. Its tri-border position lets tenants serve southern Netherlands, western Germany and Belgian Limburg from one base, on the A2/A73/A76 and within reach of the larger Venlo logistics cluster.' },
      { q: 'Does it connect to the rest of the Dutch logistics network?', a: 'Yes. It sits on the same Limburg corridor as Venlo, with motorway and Maas barge links north toward the Randstad and the other main hubs, so it works as a southern node in a national network rather than in isolation.' },
    ],
  },
  {
    slug: 'utrecht-tiel-geldermalsen',
    name: 'Utrecht–Tiel–Geldermalsen',
    region: 'Utrecht / Gelderland',
    hero: 'hub-utrecht-tiel-geldermalsen.jpg',
    heroAlt: 'Distribution warehouse in the central Netherlands A2 corridor',
    subtitle: 'The central A2 corridor — nationwide distribution from the heart of the country.',
    lede: 'The Utrecht–Tiel–Geldermalsen corridor sits at the centre of the Netherlands on the A2, the spine linking Amsterdam, Utrecht, ’s-Hertogenbosch and Eindhoven. Its central position, deep labour pool and Waal barge access make it a natural single-site base for next-day national distribution and e-commerce fulfilment.',
    stats: [
      { num: 'A2', unit: 'spine', label: 'On the A2 linking Amsterdam, Utrecht, ’s-Hertogenbosch and Eindhoven.', src: 'Geography' },
      { num: 'Central', unit: 'to NL', label: 'Reaches the whole country within a short drive — ideal for next-day delivery.', src: 'Geography' },
      { num: 'Waal', unit: 'barge', label: 'Inland shipping on the Waal near Tiel, plus rail-linked distribution zones.', src: 'Regional data' },
    ],
    known: [
      'A central position with the deepest national reach of any Dutch hub',
      'Strong labour availability across the Utrecht region',
      'Road (A2), rail and Waal barge access for multimodal distribution',
    ],
    suits: [
      'National distribution and e-commerce fulfilment from one central site',
      'Cross-dock and high-throughput operations',
      'Tenants optimising next-day coverage of the whole country',
    ],
    faq: [
      { q: 'Why choose the central Utrecht–Tiel–Geldermalsen corridor?', a: 'Because it is the most central logistics position in the Netherlands. On the A2 spine between Amsterdam and Eindhoven, a single distribution centre here reaches the entire country within a short drive — which is why it is favoured for national e-commerce fulfilment and cross-dock operations.' },
      { q: 'What transport links does the A2 corridor offer?', a: 'Road on the A2 (Amsterdam–Utrecht–’s-Hertogenbosch–Eindhoven), rail-linked distribution zones, and inland barge access on the Waal near Tiel — giving tenants multimodal options alongside a large regional labour pool.' },
    ],
  },
  {
    slug: 'almere-lelystad',
    name: 'Almere–Lelystad',
    region: 'Flevoland',
    hero: 'hub-almere-lelystad.jpg',
    heroAlt: 'Sustainable modern logistics warehouse in Almere–Lelystad, Flevoland',
    subtitle: 'Sustainable, scalable fulfilment on Amsterdam’s doorstep.',
    lede: 'Almere–Lelystad, in Flevoland, is the sustainable growth extension of the Amsterdam metropolitan area. With room to build, the A6 and A27 into the Randstad, and the Flevokust inland port, it offers the newest, greenest warehouse stock in the region — BREEAM-certified, gasless and automation-ready — for e-commerce and high-volume fulfilment.',
    stats: [
      { num: 'Newest', unit: 'stock', label: 'BREEAM Very Good–Outstanding, gasless, automation-ready developments.', src: 'Regional data' },
      { num: 'A6 / A27', unit: 'to Randstad', label: 'Direct access to Amsterdam and the northern Netherlands.', src: 'Geography' },
      { num: 'Flevokust', unit: 'inland port', label: 'Container barge terminal plus room for build-to-suit development.', src: 'Flevokust Haven' },
    ],
    known: [
      'The most available development land near the Amsterdam metro area',
      'Sustainable, energy-efficient and automation-ready modern stock',
      'A6/A27 access and the Flevokust inland port at Lelystad',
    ],
    suits: [
      'E-commerce and high-volume fulfilment near Amsterdam',
      'Tenants with strong sustainability requirements (BREEAM, gasless)',
      'Build-to-suit projects needing scalable land',
    ],
    faq: [
      { q: 'What makes Almere–Lelystad attractive for logistics?', a: 'Space and sustainability. As the growth extension of the Amsterdam metropolitan area, Flevoland offers the region’s most available development land and its newest, greenest stock — BREEAM-certified, gasless and automation-ready — with A6/A27 access into the Randstad.' },
      { q: 'How close is it to Amsterdam and the ports?', a: 'Almere is on Amsterdam’s doorstep via the A6, with Lelystad and the Flevokust inland port a little further north. That puts tenants within easy reach of the Randstad consumer market while keeping the space and cost advantages of Flevoland.' },
    ],
  },
];

/* ------------------------------ rendering ------------------------------ */
function statsBand(stats) {
  const items = stats.map(s => `        <div class="stat"><div class="stat-num">${s.num}<span style="font-size:.4em;font-weight:500;letter-spacing:0"> ${s.unit}</span></div><div class="stat-label">${s.label}<br /><span style="color:#b3b3b3;font-size:.8em">Source: ${s.src}</span></div></div>`).join('\n');
  return `      <div class="stats-row">\n${items}\n      </div>`;
}

function splitBlock(num, label, intro, bullets) {
  const lis = bullets.map(b => `            <li>${b}</li>`).join('\n');
  return `      <div class="split">
        <div class="split-label"><span class="num">${num}</span>${label}</div>
        <div class="split-content">
          <p>${intro}</p>
          <ul>
${lis}
          </ul>
        </div>
      </div>`;
}

function faqBlock(faq) {
  const items = faq.map(f => `        <details class="faq-item"><summary>${f.q}</summary><div class="faq-body"><p>${f.a}</p></div></details>`).join('\n');
  return `      <div class="faq">\n${items}\n      </div>`;
}

function siblingLinks(current) {
  const links = hubs.filter(h => h.slug !== current).map(h =>
    `        <a class="index-item" href="/locations/${h.slug}" style="text-decoration:none"><span class="index-num"></span><span class="index-word" style="font-size:2.6rem">${h.name}</span></a>`
  ).join('\n');
  return `      <div class="index-list">\n${links}\n      </div>`;
}

function hubPage(h) {
  const canonical = `${BASE}/locations/${h.slug}`;
  const title = `Warehouse Space for Rent in ${h.name}`;
  const description = `${h.subtitle} Independent tenant-side warehouse advice in ${h.name}.`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: title,
        description: description, isPartOf: { '@id': BASE + '/#website' },
        about: { '@type': 'Place', name: h.name + ', Netherlands' },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${BASE}/images/${h.hero}` }, inLanguage: 'en',
      },
      {
        '@type': 'Service', name: `Warehouse tenant & buyer representation in ${h.name}`,
        serviceType: 'Tenant-side warehouse real estate advisory',
        provider: { '@id': BASE + '/#organization' },
        areaServed: { '@type': 'Place', name: `${h.name}, ${h.region}, Netherlands` },
      },
      {
        '@type': 'FAQPage', '@id': canonical + '#faq',
        mainEntity: h.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Locations', item: BASE + '/locations' },
          { '@type': 'ListItem', position: 3, name: h.name, item: canonical },
        ],
      },
    ],
  };
  const body = `
      <section class="page-hero">
        <div class="container_container__v5gtR">
          <div style="font-weight:600;font-size:1.4rem;color:#b3b3b3;margin-bottom:1.6rem"><a href="/locations" style="color:#b3b3b3;text-decoration:none">Locations</a> &nbsp;/&nbsp; ${h.region}</div>
          <h1>Warehouse Space in ${h.name}</h1>
          <div class="page-hero-sub">${h.subtitle}</div>
        </div>
      </section>

      <section class="page-section" style="padding-top:0">
        <div class="container_container__v5gtR">
          <div class="article-hero-img" style="margin:0 0 4rem"><img src="/images/${h.hero}" alt="${h.heroAlt}" loading="eager" /></div>
          <p class="statement">${h.lede}</p>
        </div>
      </section>

      <section class="page-section -grey">
        <div class="container_container__v5gtR">
          <div class="nl-map-eyebrow" style="margin-bottom:3rem">${h.name} at a glance</div>
${statsBand(h.stats)}
        </div>
      </section>

      <section class="page-section">
        <div class="container_container__v5gtR">
${splitBlock('01', 'What ' + h.name + ' is known for', 'The character of the market shapes what you should look for on the ground:', h.known)}
${splitBlock('02', 'Who it suits', 'We map your operation to the region before we shortlist a single building:', h.suits)}
        </div>
      </section>

      <section class="page-section -grey">
        <div class="container_container__v5gtR">
          <div class="nl-map-eyebrow" style="margin-bottom:2rem">Frequently asked</div>
          <h2 style="font-weight:700;font-size:3.4rem;letter-spacing:-.02em;margin:0 0 3rem">Warehousing in ${h.name}</h2>
${faqBlock(h.faq)}
        </div>
      </section>

      <section class="page-section">
        <div class="container_container__v5gtR">
          <div class="nl-map-eyebrow" style="margin-bottom:2rem">Other Dutch logistics hubs</div>
${siblingLinks(h.slug)}
        </div>
      </section>

      <section class="outro_root__stMHm">
        <div class="outro_bg__9kU9x"><img alt="" loading="lazy" width="2880" height="1464" decoding="async" style="color:transparent" src="/images/bg.webp" /></div>
        <div class="container_container__v5gtR">
          <div class="outro_title__Eqbbj"><h2>Looking to lease warehouse space in ${h.name}? <span class="em">From 500 m² to XXL — tell us the requirement and we’ll tell you what the market will give you.</span></h2></div>
          <div class="outro_actions__qfUxG"><div>${ctaButton('Send Your Requirement', '/lease-warehouse-netherlands#requirement', true)}</div></div>
        </div>
      </section>`;
  return docHead(title, description, canonical, 'og-image.jpg', jsonld) + body + '\n' + DOC_TAIL;
}

/* ------------------------------- index -------------------------------- */
function indexPage() {
  const canonical = `${BASE}/locations`;
  const title = 'Dutch Logistics Hubs — Where to Rent Warehouse Space';
  const description = 'The main Dutch logistics hubs — Rotterdam, Schiphol, Venlo, Tilburg and more — and what each is best for. Independent tenant-side warehouse advice, nationwide.';
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': canonical + '#webpage', url: canonical, name: title, description: description, isPartOf: { '@id': BASE + '/#website' }, inLanguage: 'en' },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Locations', item: canonical },
      ] },
      { '@type': 'ItemList', itemListElement: hubs.map((h, i) => ({ '@type': 'ListItem', position: i + 1, name: h.name, url: `${BASE}/locations/${h.slug}` })) },
    ],
  };
  const rows = hubs.map((h, i) => `        <a class="index-item" href="/locations/${h.slug}" style="text-decoration:none">
          <span class="index-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="index-word">${h.name}</span>
          <span class="index-desc">${h.subtitle}</span>
          <span class="index-arrow"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="#1F4257" d="m20.78 12.531-6.75 6.75a.75.75 0 1 1-1.06-1.061l5.47-5.47H3.75a.75.75 0 1 1 0-1.5h14.69l-5.47-5.469a.75.75 0 1 1 1.06-1.061l6.75 6.75a.75.75 0 0 1 0 1.061"></path></svg></span>
        </a>`).join('\n');
  const body = `
      <section class="page-hero">
        <div class="container_container__v5gtR">
          <h1>Where We Work</h1>
          <div class="page-hero-sub">We advise tenants nationwide — these are the hubs that drive Dutch logistics. <span class="em">Each has its own strengths, rents and stock.</span></div>
        </div>
      </section>

      <section class="page-section" style="padding-top:0">
        <div class="container_container__v5gtR">
          <p class="statement" style="margin-bottom:5rem">The Netherlands runs Europe’s densest logistics network from a handful of hubs — a deep-sea port, an air-cargo gateway, and a string of border and inland clusters. Choosing the right one decides your labour pool, transport cost and how fast you reach your customers. Here is what each is best for.</p>
${'      <div class="index-list">\n' + rows + '\n      </div>'}
        </div>
      </section>

      <section class="page-section -grey">
        <div class="container_container__v5gtR">
          <div class="split" style="border-top:none;padding-top:0">
            <div class="split-label"><span class="num">Not sure which?</span>Compare the hubs</div>
            <div class="split-content">
              <p>The right hub depends on where your goods come from, where your customers are, and your labour and cost constraints. We map that before shortlisting a single building — and our guide walks through the trade-offs.</p>
              <div class="btn-row">${ctaButton('Read: Choosing a Dutch Logistics Hub', '/insights/dutch-logistics-hub-comparison', false)}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="outro_root__stMHm">
        <div class="outro_bg__9kU9x"><img alt="" loading="lazy" width="2880" height="1464" decoding="async" style="color:transparent" src="/images/bg.webp" /></div>
        <div class="container_container__v5gtR">
          <div class="outro_title__Eqbbj"><h2>Know your region, or want a recommendation? <span class="em">Either way, one call gets you moving.</span></h2></div>
          <div class="outro_actions__qfUxG"><div>${ctaButton('Let’s Talk', '/contact', true)}</div></div>
        </div>
      </section>`;
  return docHead(title, description, canonical, 'og-image.jpg', jsonld) + body + '\n' + DOC_TAIL;
}

/* ------------------------------- write -------------------------------- */
/* ---------------------- lease landing page --------------------------- */
function leasePage() {
  const canonical = `${BASE}/lease-warehouse-netherlands`;
  const title = 'Lease Warehouse Space in the Netherlands — From 500 m²';
  const description = 'Lease warehouse space in the Netherlands from 500 m² to XXL. Independent tenant representation — we run the search and negotiate the ROZ lease on your side.';
  const faq = [
    { q: 'Can you rent a small warehouse in the Netherlands?', a: 'Yes. Staal Real Estate arranges warehouse leases from 500 m² upward, all the way to XXL. Smaller units (roughly 500–1,500 m²) are scarcer and let quickly, so early, well-defined representation is often the difference between securing space and missing it.' },
    { q: 'What is the minimum warehouse size you can lease?', a: 'We advise on warehouse leases from 500 m². Below that, self-storage or flex business-centre units are usually a better fit; from 500 m² up to 100,000 m²+ XXL distribution centres, we run the full search and negotiation for you.' },
    { q: 'How much does it cost to rent warehouse space in the Netherlands?', a: 'Indicative prime logistics rents run from roughly €50–65/m²/year in secondary regions to €75–95/m²/year in Rotterdam and €90–115/m²/year around Schiphol (CBRE / Savills / Statista, 2024–25). Smaller units carry a higher rate per m². Budget total occupancy cost — service charges, energy and municipal taxes — not just the headline rent.' },
    { q: 'How long does it take to lease a warehouse in the Netherlands?', a: 'A straightforward lease can complete in a matter of weeks once the requirement is clear; complex or build-to-suit deals take months. Search and shortlisting typically take two to four weeks, followed by viewings, heads of terms and the ROZ lease.' },
    { q: 'Do I need a Dutch company to lease a warehouse in the Netherlands?', a: 'In almost all cases, yes. Dutch landlords expect the tenant to be a registered legal entity — a Dutch BV or a registered branch with a KvK number — and will assess covenant strength; a Dutch business bank account is normally needed for the deposit and rent. If you are already established we move straight to search and terms; if you are still setting up, we time the search around it. See our setup guide.' },
    { q: 'Which regions of the Netherlands do you cover?', a: 'All of them. We work nationwide across the main logistics hubs — Rotterdam, Schiphol/Amsterdam, Venlo, Tilburg–Waalwijk, Eindhoven and more — so we can match the region to your labour, transport and cost needs rather than to one patch. See our location guides.' },
  ];
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: title, description: description, isPartOf: { '@id': BASE + '/#website' }, inLanguage: 'en' },
      { '@type': 'Service', '@id': canonical + '#service', name: 'Warehouse leasing — tenant representation', serviceType: 'Warehouse tenant representation', provider: { '@id': BASE + '/#organization' }, areaServed: { '@type': 'Country', name: 'Netherlands' }, description: 'Tenant-only advisory for leasing warehouse space in the Netherlands from 500 m² to XXL: market search, shortlisting, viewings and ROZ lease negotiation on the tenant’s side.' },
      { '@type': 'FAQPage', '@id': canonical + '#faq', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Lease Warehouse Space', item: canonical },
      ] },
    ],
  };
  const ladder = [
    { sz: '500–1,500 m²', l: 'Small units, city-edge storage and light fulfilment' },
    { sz: '1,500–5,000 m²', l: 'Growing fulfilment and regional distribution' },
    { sz: '5,000–15,000 m²', l: 'National distribution centres' },
    { sz: '15,000 m²+', l: 'XXL logistics and build-to-suit' },
  ].map(s => `<div class="size-card"><div class="sz">${s.sz}</div><div class="szl">${s.l}</div></div>`).join('');
  const regionOpts = ['Rotterdam','Schiphol / Amsterdam','Venlo','Tilburg–Waalwijk','Breda–Moerdijk','Eindhoven','Nijmegen–Arnhem','Roermond–Maastricht','Utrecht–Tiel–Geldermalsen','Almere–Lelystad'].map(r => `<option>${r}</option>`).join('');
  const leaseForm = `<form id="lease-form" class="contact-form" novalidate>
          <div class="form-field"><label for="lf-name">Your name *</label><input id="lf-name" name="name1" type="text" autocomplete="name" required /></div>
          <div class="form-field"><label for="lf-company">Company</label><input id="lf-company" name="company" type="text" autocomplete="organization" /></div>
          <div class="form-field"><label for="lf-email">Email *</label><input id="lf-email" name="email" type="email" autocomplete="email" required /></div>
          <div class="form-field"><label for="lf-phone">Phone / WhatsApp</label><input id="lf-phone" name="phone" type="tel" autocomplete="tel" /></div>
          <div class="form-field"><label for="lf-size">Size needed *</label><select id="lf-size" name="size" required><option value="">Select…</option><option>500–1,000 m²</option><option>1,000–2,500 m²</option><option>2,500–5,000 m²</option><option>5,000–10,000 m²</option><option>10,000 m²+</option></select></div>
          <div class="form-field"><label for="lf-region">Preferred region</label><select id="lf-region" name="region"><option value="">No preference / not sure</option>${regionOpts}</select></div>
          <div class="form-field"><label for="lf-timing">Timing</label><select id="lf-timing" name="timing"><option value="">Select…</option><option>As soon as possible</option><option>Within 3 months</option><option>3–6 months</option><option>6–12 months</option><option>Just exploring</option></select></div>
          <div class="form-field"><label for="lf-use">Primary use</label><select id="lf-use" name="use"><option value="">Select…</option><option>E-commerce fulfilment</option><option>Distribution / 3PL</option><option>Storage</option><option>Light industrial / production</option><option>Other</option></select></div>
          <div class="form-field"><label for="lf-nl">Registered in the Netherlands (KvK)? *</label><select id="lf-nl" name="nl_registered" required><option value="">Select…</option><option>Yes — already registered</option><option>In progress</option><option>Not yet</option></select></div>
          <div class="form-field"><label for="lf-bank">Dutch business bank account?</label><select id="lf-bank" name="dutch_bank"><option value="">Select…</option><option>Yes</option><option>In progress</option><option>Not yet</option></select></div>
          <div class="form-field -full"><label for="lf-message">Anything else</label><textarea id="lf-message" name="message" placeholder="Clear height, docks, power/grid, must-have location, budget, or anything else we should know."></textarea></div>
          <div id="lease-status" class="form-status" role="status"></div>
          <div class="form-actions">
            <button type="submit" class="button_button-round__TFjlU button_color-primary__JJ7Hh"><div class="button_content__6Zh3n"><div class="button_button-round-text__IEwW5"><span data-text="Send My Requirement">Send My Requirement</span></div><span class="button_icon-after__vljdM">${ARROW}</span></div></button>
            <div class="form-note">We respond within one business day. Details are used only to answer your request — see our <a href="/privacy" style="text-decoration:underline">privacy policy</a>.</div>
          </div>
        </form>`;
  const body = `
      <section class="page-hero">
        <div class="container_container__v5gtR">
          <div style="font-weight:600;font-size:1.4rem;color:#b3b3b3;margin-bottom:1.6rem">Leasing · Netherlands</div>
          <h1>Lease Warehouse Space in the Netherlands — From 500 m²</h1>
          <div class="page-hero-sub">Independent, tenant-only advice on leasing warehouse space nationwide — from a first 500 m² unit to XXL. <span class="em">We work for you, never the landlord.</span></div>
        </div>
      </section>

      <section class="page-section" style="padding-top:0">
        <div class="container_container__v5gtR">
          <p class="statement">Staal Real Estate arranges warehouse leases across the Netherlands from 500 m² to XXL. We represent the tenant only — running the full market search, shortlisting the best-fit units, arranging viewings, and negotiating the standardised Dutch (ROZ) lease on your side. One point of contact, from first brief to the day you collect the keys.</p>
          <div style="margin-top:3rem">${ctaButton('Send Your Requirement', '#requirement', false)}</div>
        </div>
      </section>

      <section class="page-section -grey">
        <div class="container_container__v5gtR">
          <div class="nl-map-eyebrow" style="margin-bottom:2.4rem">Whatever your size</div>
          <h2 style="font-weight:700;font-size:3.4rem;letter-spacing:-.02em;margin:0 0 3rem">From 500 m² to XXL</h2>
          <div class="size-ladder">${ladder}</div>
        </div>
      </section>

      <section class="page-section">
        <div class="container_container__v5gtR">
          <div class="nl-map-eyebrow" style="margin-bottom:2.4rem">How leasing works</div>
          <div class="mini-steps">
            <div class="mini-step"><div class="ms-num">01</div><h3>Brief</h3><p>We map exactly what your operation needs — size from 500 m², location, clear height, docks, power, timing and budget.</p></div>
            <div class="mini-step"><div class="ms-num">02</div><h3>Search &amp; shortlist</h3><p>We scan the market, including units never openly advertised, and shortlist the best fits for viewings.</p></div>
            <div class="mini-step"><div class="ms-num">03</div><h3>Negotiate</h3><p>We negotiate the ROZ lease on your side — term, break options, indexation caps, incentives and service charges.</p></div>
            <div class="mini-step"><div class="ms-num">04</div><h3>Hand over</h3><p>We support the documentation, coordinate handover, and stay involved as your operation grows.</p></div>
          </div>
        </div>
      </section>

      <section class="page-section -grey" id="requirement">
        <div class="container_container__v5gtR">
          <div class="nl-map-eyebrow" style="margin-bottom:2rem">Send your requirement</div>
          <h2 style="font-weight:700;font-size:3.4rem;letter-spacing:-.02em;margin:0 0 1.6rem">Tell us what you need</h2>
          <p style="font-weight:500;font-size:1.8rem;line-height:1.5;color:#3c3e3e;max-width:70rem;margin:0 0 3.5rem">The more you tell us, the faster and more precisely we can respond — and if you are already set up in the Netherlands, we can move straight to the search.</p>
          ${leaseForm}
        </div>
      </section>

      <section class="page-section">
        <div class="container_container__v5gtR">
          <div class="nl-map-eyebrow" style="margin-bottom:2rem">Frequently asked</div>
          <h2 style="font-weight:700;font-size:3.4rem;letter-spacing:-.02em;margin:0 0 3rem">Leasing warehouse space in the Netherlands</h2>
${faqBlock(faq)}
        </div>
      </section>

      <section class="page-section -grey">
        <div class="container_container__v5gtR">
          <div class="split" style="border-top:none;padding-top:0">
            <div class="split-label"><span class="num">Where &amp; how</span>Explore more</div>
            <div class="split-content">
              <p>Browse the main Dutch logistics hubs to see what each is best for, or read our guides on how Dutch leases work and how to get set up to lease as a foreign company.</p>
              <ul>
                <li><a href="/locations" style="color:#1F4257;text-decoration:underline">Dutch logistics hubs — where we work</a></li>
                <li><a href="/insights/leasing-warehouse-space-netherlands" style="color:#1F4257;text-decoration:underline">A foreign company’s guide to leasing warehouse space</a></li>
                <li><a href="/insights/getting-set-up-to-lease-netherlands" style="color:#1F4257;text-decoration:underline">Getting set up to lease: KvK, a Dutch bank account &amp; what landlords require</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="outro_root__stMHm">
        <div class="outro_bg__9kU9x"><img alt="" loading="lazy" width="2880" height="1464" decoding="async" style="color:transparent" src="/images/bg.webp" /></div>
        <div class="container_container__v5gtR">
          <div class="outro_title__Eqbbj"><h2>Looking to lease from 500 m²? <span class="em">Send your requirement — we’ll tell you what the market will actually give you.</span></h2></div>
          <div class="outro_actions__qfUxG"><div>${ctaButton('Send Your Requirement', '#requirement', true)}</div></div>
        </div>
      </section>`;
  return docHead(title, description, canonical, 'og-image.jpg', jsonld) + body + '\n' + DOC_TAIL;
}

const outDir = path.join(__dirname, 'locations');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(__dirname, 'locations.html'), indexPage());
fs.writeFileSync(path.join(__dirname, 'lease-warehouse-netherlands.html'), leasePage());
let count = 0;
for (const h of hubs) {
  fs.writeFileSync(path.join(outDir, h.slug + '.html'), hubPage(h));
  count++;
}
/* ---- homepage map: regenerate pins / spokes / notes / list for all hubs ----
   Coordinates are in the map SVG's 560x659 viewBox. Order matches data-i.
   The first 8 are the original pin positions; the last 2 are new — eyeball
   their placement in the browser and nudge xy if needed. */
const MAP = [
  { xy: [172.7, 380.7], label: 'Rotterdam', slug: 'rotterdam', note: 'Europe’s largest seaport: deep-sea containers and port-edge distribution.' },
  { xy: [210.6, 294.8], label: 'Schiphol / Amsterdam', slug: 'schiphol-amsterdam', note: 'Schiphol air cargo: high-value, time-critical and temperature-controlled goods.' },
  { xy: [401.1, 501.8], label: 'Venlo', slug: 'venlo', note: 'On the German border: one of Europe’s top logistics hotspots and a 3PL cluster.' },
  { xy: [253.8, 460], label: 'Tilburg–Waalwijk', slug: 'tilburg-waalwijk', note: 'Central Brabant: XXL warehousing and the e-commerce fulfilment cluster.' },
  { xy: [201.1, 440.1], label: 'Breda–Moerdijk', slug: 'breda-moerdijk', note: 'Inland port and distribution, with direct links to Rotterdam and Antwerp.' },
  { xy: [307.8, 486.4], label: 'Eindhoven', slug: 'eindhoven', note: 'Brainport: high-tech manufacturing supply chains and high-value goods.' },
  { xy: [363.2, 382.9], label: 'Nijmegen–Arnhem', slug: 'nijmegen-arnhem', note: 'Eastern corridor: a fast-growing logistics region right by the German market.' },
  { xy: [357.8, 583.3], label: 'Roermond–Maastricht', slug: 'roermond-maastricht', note: 'Southern gateway: cross-border distribution into Germany and Belgium.' },
  { xy: [255, 350], label: 'Utrecht–Tiel', slug: 'utrecht-tiel-geldermalsen', note: 'Central A2 corridor: nationwide next-day distribution from the heart of the country.' },
  { xy: [263, 285], label: 'Almere–Lelystad', slug: 'almere-lelystad', note: 'Flevoland: sustainable, scalable fulfilment on Amsterdam’s doorstep.' },
];
function mapSpokes() {
  return '<g class="nl-spokes-layer">' + MAP.map((h, i) => {
    const lines = MAP.filter((_, j) => j !== i).map(o => `<line x1="${h.xy[0]}" y1="${h.xy[1]}" x2="${o.xy[0]}" y2="${o.xy[1]}" />`).join('');
    return `<g class="nl-spokes${i === 0 ? ' -active' : ''}" data-i="${i}">${lines}</g>`;
  }).join('') + '</g>';
}
function mapPins() {
  return '<g class="nl-pins">' + MAP.map((h, i) => {
    const [x, y] = h.xy;
    return `<g class="nl-pin${i === 0 ? ' -active' : ''}" data-i="${i}" data-href="/locations/${h.slug}"><circle class="nl-pin-hit" cx="${x}" cy="${y}" r="22" /><circle class="nl-pin-ring" cx="${x}" cy="${y}" r="11" /><circle class="nl-pin-halo" cx="${x}" cy="${y}" r="6" /><circle class="nl-pin-dot" cx="${x}" cy="${y}" r="5.5" /></g>`;
  }).join('') + '</g>';
}
function mapNotes() {
  return '<div class="nl-map-notes">' + MAP.map((h, i) => `<p class="nl-hub-note${i === 0 ? ' -active' : ''}" data-i="${i}">${h.note}</p>`).join('') + '</div>';
}
function mapList() {
  return '<ul class="nl-hub-list nl-map-list">' + MAP.map((h, i) => `<li><a class="nl-hub-row${i === 0 ? ' -active' : ''}" data-i="${i}" href="/locations/${h.slug}"><span class="nl-hub-tick"></span><span>${h.label}</span><span class="nl-hub-go">Explore &rarr;</span></a></li>`).join('') + '</ul>';
}
const idxPath = path.join(__dirname, 'index.html');
let idx = fs.readFileSync(idxPath, 'utf8');
const before = idx;
idx = idx.replace(/<g class="nl-spokes-layer">[\s\S]*?<\/g><\/g>/, () => mapSpokes());
idx = idx.replace(/<g class="nl-pins">[\s\S]*?<\/g><\/g>/, () => mapPins());
idx = idx.replace(/<div class="nl-map-notes">[\s\S]*?<\/div>/, () => mapNotes());
idx = idx.replace(/<ul class="nl-hub-list nl-map-list">[\s\S]*?<\/ul>/, () => mapList());
if (!before.includes('<g class="nl-spokes-layer">')) { console.error('WARNING: homepage map anchor not found in index.html — map not synced'); }
else if (idx !== before) { fs.writeFileSync(idxPath, idx); }
console.log('Wrote locations.html + ' + count + ' hub pages, and synced homepage map (' + MAP.length + ' hubs)');
