// Generates a correct, simple SVG silhouette of the Netherlands plus
// geographically-accurate pin positions for the key logistics hubs.
// Source: public-domain country boundary GeoJSON (georgique/world-geojson).
// Output: nl-map.json { path, viewBox, hubs:[{name,x,y,...}] }
// Run once:  node gen-nl-map.js
const fs = require('fs');

const SRC = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
const W = 560;           // target viewBox width
const PAD = 20;          // padding inside the viewBox

// logistics hubs (lat, lon) + a short note shown on hover/tap
const HUBS = [
  { name: 'Rotterdam', lat: 51.92, lon: 4.48, note: 'Europe’s largest seaport: deep-sea containers and port-edge distribution.' },
  { name: 'Schiphol / Amsterdam', lat: 52.31, lon: 4.76, note: 'Air cargo and high-value, time-critical logistics around the capital.' },
  { name: 'Tilburg–Waalwijk', lat: 51.56, lon: 5.08, note: 'Central Brabant: XXL warehousing and the e-commerce fulfilment cluster.' },
  { name: 'Venlo', lat: 51.37, lon: 6.17, note: 'On the German border: tri-modal gateway to the Ruhr and beyond.' },
  { name: 'Eindhoven', lat: 51.44, lon: 5.48, note: 'Brainport: tech production, assembly and high-mix light-industrial space.' }
];

(async () => {
  const r = await fetch(SRC);
  const j = await r.json();
  const f = j.features.find(x => { const p = x.properties; return p.ISO_A3 === 'NLD' || p.ADMIN === 'Netherlands' || p.name === 'Netherlands'; });
  const g = f.geometry || f;
  const polys = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
  // keep only mainland-NL polygons (Europe bbox)
  const euPolys = polys.filter(poly => {
    const r0 = poly[0];
    let mnx = 999, mxx = -999, mny = 999, mxy = -999;
    r0.forEach(p => { mnx = Math.min(mnx, p[0]); mxx = Math.max(mxx, p[0]); mny = Math.min(mny, p[1]); mxy = Math.max(mxy, p[1]); });
    return mxx > 2 && mnx < 8 && mxy > 49 && mny < 54;
  });

  // bbox across kept polygons
  let mnx = 999, mxx = -999, mny = 999, mxy = -999;
  euPolys.forEach(poly => poly.forEach(ring => ring.forEach(p => {
    mnx = Math.min(mnx, p[0]); mxx = Math.max(mxx, p[0]); mny = Math.min(mny, p[1]); mxy = Math.max(mxy, p[1]);
  })));

  // equirectangular projection with longitude compressed by cos(meanLat)
  const meanLat = (mny + mxy) / 2 * Math.PI / 180;
  const kx = Math.cos(meanLat);
  const spanX = (mxx - mnx) * kx;
  const spanY = (mxy - mny);
  const scale = (W - PAD * 2) / spanX;
  const H = Math.round(spanY * scale + PAD * 2);
  const project = (lon, lat) => [
    +(PAD + (lon - mnx) * kx * scale).toFixed(1),
    +(PAD + (mxy - lat) * scale).toFixed(1)   // flip Y (north up)
  ];

  // build the path; drop tiny rings (islands/noise) for a clean silhouette
  let d = '';
  euPolys.forEach(poly => poly.forEach((ring, ri) => {
    if (ri > 0) return;                 // outer ring only — no holes needed here
    if (ring.length < 25) return;       // skip tiny island specks for a clean silhouette
    ring.forEach((p, i) => {
      const [x, y] = project(p[0], p[1]);
      d += (i === 0 ? 'M' : 'L') + x + ' ' + y;
    });
    d += 'Z';
  }));

  const hubs = HUBS.map(h => {
    const [x, y] = project(h.lon, h.lat);
    return { name: h.name, note: h.note, x, y };
  });

  fs.writeFileSync('nl-map.json', JSON.stringify({ viewBox: `0 0 ${W} ${H}`, path: d, hubs }, null, 2));
  console.log('nl-map.json written | viewBox 0 0', W, H, '| path chars', d.length, '| hubs', hubs.length);
  hubs.forEach(h => console.log('  ', h.name, h.x, h.y));
})();
