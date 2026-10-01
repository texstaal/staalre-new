// Browser-side extractor for a fundainbusiness.nl listing page.
// Run it in the built-in browser on an open listing (javascript_tool); it
// returns raw listing data that goes into the "options" array of a
// proposal.json (see SKILL.md). It only reads what the page already shows.
(() => {
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const lds = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => { try { return JSON.parse(s.textContent); } catch (e) { return null; } })
    .filter(Boolean);
  const product = lds.find((j) => j.photo || j.offers) || {};
  const crumbs = (lds.find((j) => j['@type'] === 'BreadcrumbList') || {}).itemListElement || [];

  // "Kenmerken" table: dt/dd pairs
  const facts = {};
  document.querySelectorAll('dt').forEach((dt) => {
    const dd = dt.nextElementSibling;
    if (dd && dd.tagName === 'DD') facts[txt(dt)] = txt(dd);
  });

  // coordinates from the object map config
  let lat = null, lng = null;
  const mapCfg = document.querySelector('[data-object-map-config]');
  if (mapCfg) { try { const c = JSON.parse(mapCfg.textContent); lat = c.lat; lng = c.lng; } catch (e) {} }

  // full photo gallery (media viewer), falling back to JSON-LD photos
  const idOf = (u) => (u.match(/valentina_media\/\d+\/\d+\/\d+/) || [])[0];
  let ids = [...document.querySelectorAll('.media-viewer-fotos__item img')]
    .map((i) => idOf(i.getAttribute('data-lazy') || i.getAttribute('src') || ''))
    .filter(Boolean);
  if (!ids.length) ids = (product.photo || []).map((p) => idOf(p.contentUrl || '')).filter(Boolean);
  ids = [...new Set(ids)];
  const photos = ids.map((id) => `https://cloud.funda.nl/${id}_2160.jpg`);

  const h1 = document.querySelector('h1');
  const h1Lines = h1 ? h1.innerText.split('\n').map((s) => s.trim()).filter(Boolean) : [];
  const descEl = document.querySelector('.object-description-body, [class*="object-description"]');
  const brokerEl = document.querySelector('.object-contact-aanbieder-name, [class*="aanbieder-name"], a[href*="/makelaars/"]');
  const priceHeader = txt(document.querySelector('.object-header__price, [class*="object-header__price"]'));

  return {
    url: location.href.split('?')[0].split('#')[0],
    fundaId: (location.pathname.match(/object-(\d+)/) || [])[1] || null,
    propertyType: (location.pathname.split('/')[1] || ''),
    title: product.name || h1Lines[0] || '',
    postcodeCity: h1Lines[1] || '',
    address: product.address || {},
    estate: crumbs.length > 2 ? (crumbs[2].item || {}).name : null,
    offerPrice: product.offers ? Number(product.offers.price) : null,
    priceHeader,
    facts,
    lat, lng,
    broker: brokerEl ? brokerEl.childNodes[0] && brokerEl.childNodes[0].textContent.trim() || txt(brokerEl).split('Toon')[0].trim() : null,
    description: descEl ? descEl.innerText.replace(/^\s*Omschrijving\s*/, '').replace(/Lees de volledige omschrijving\s*$/, '').trim() : (document.querySelector('meta[property="og:description"]') || {}).content || '',
    photos,
  };
})()
