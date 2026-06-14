// Generates images/og-image.jpg — the 1200x630 social share card.
// Uses the existing STAAL vector lockup (staal-logo.json), the NL map
// silhouette (nl-map.json) as a watermark, and Space Grotesk converted to
// vector paths so the render needs no system fonts. Rasterised with sharp.
//
//   node gen-og-image.js
const fs = require('fs');
const fontkit = require('fontkit');
const sharp = require('sharp');

const W = 1200, H = 630, P = 96;
const ACCENT = '#1F4257';

let base = fontkit.openSync('SpaceGrotesk-var.ttf');
const v = (w) => (base.variationAxes && base.variationAxes.wght) ? base.getVariation({ wght: w }) : base;
const fMed = v(500), fSemi = v(600);

function transformPath(path, sx, sy, tx, ty) {
  let d = '';
  for (const cmd of path.commands) {
    const a = cmd.args;
    switch (cmd.command) {
      case 'moveTo': d += `M${(a[0] * sx + tx).toFixed(2)} ${(ty - a[1] * sy).toFixed(2)}`; break;
      case 'lineTo': d += `L${(a[0] * sx + tx).toFixed(2)} ${(ty - a[1] * sy).toFixed(2)}`; break;
      case 'quadraticCurveTo':
        d += `Q${(a[0] * sx + tx).toFixed(2)} ${(ty - a[1] * sy).toFixed(2)} ${(a[2] * sx + tx).toFixed(2)} ${(ty - a[3] * sy).toFixed(2)}`; break;
      case 'bezierCurveTo':
        d += `C${(a[0] * sx + tx).toFixed(2)} ${(ty - a[1] * sy).toFixed(2)} ${(a[2] * sx + tx).toFixed(2)} ${(ty - a[3] * sy).toFixed(2)} ${(a[4] * sx + tx).toFixed(2)} ${(ty - a[5] * sy).toFixed(2)}`; break;
      case 'closePath': d += 'Z'; break;
    }
  }
  return d;
}
function measure(font, str, capPx, ls) {
  const run = font.layout(str), cap = font.capHeight || 700, scale = capPx / cap;
  let w = 0;
  run.positions.forEach((p, i) => { w += p.xAdvance * scale; if (i < run.positions.length - 1) w += ls; });
  return w;
}
// fit a string to maxW by shrinking the cap height if needed
function fit(font, str, capPx, ls, maxW) {
  let w = measure(font, str, capPx, ls);
  if (w > maxW) { const k = maxW / w; capPx *= k; ls *= k; w = maxW; }
  return { capPx, ls, width: w };
}
function textPath(font, str, capPx, x, baseY, ls) {
  const run = font.layout(str), cap = font.capHeight || 700, scale = capPx / cap;
  let cx = x; const ds = [];
  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    const d = transformPath(g.path, scale, scale, cx + p.xOffset * scale, baseY - p.yOffset * scale);
    if (d) ds.push(d);
    cx += p.xAdvance * scale + ls;
  });
  return ds.join(' ');
}

// ---- brand lockup (STAAL + Real Estate), native viewBox 0 0 977 423 ----
const logo = JSON.parse(fs.readFileSync('staal-logo.json', 'utf8'));
const lockupPaths = (logo.heroWord + logo.heroSub).replace(/currentColor/g, '#ffffff');
const LW = 560, lockScale = LW / 977, lockX = P, lockY = 196; // top-left of lockup

// ---- NL silhouette watermark, native viewBox 0 0 560 659 ----
const nl = JSON.parse(fs.readFileSync('nl-map.json', 'utf8'));
const nlH = 600, nlScale = nlH / 659, nlW = 560 * nlScale;
const nlX = W - nlW + 150, nlY = (H - nlH) / 2; // bleeds off the right edge

// ---- eyebrow / tagline / domain as vector paths ----
const eyebrowStr = 'WAREHOUSE REAL ESTATE · NETHERLANDS';
const ey = fit(fSemi, eyebrowStr, 21, 5, W - 2 * P);
const eyebrow = textPath(fSemi, eyebrowStr, ey.capPx, P, 138, ey.ls);

const taglineStr = 'Find, lease and acquire the space your growth runs on.';
const tg = fit(fMed, taglineStr, 33, 0, W - 2 * P);
const tagline = textPath(fMed, taglineStr, tg.capPx, P, lockY + 242 + 78, tg.ls);

const domain = textPath(fSemi, 'staalre.com', 25, P, H - 60, 0.5);
const tagRightStr = 'Independent · Occupier-only';
const trW = measure(fMed, tagRightStr, 21, 0.5);
const tagRight = textPath(fMed, tagRightStr, 21, W - P - trW, H - 62, 0.5);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#234a60"/><stop offset="0.55" stop-color="${ACCENT}"/><stop offset="1" stop-color="#15303f"/>
    </linearGradient>
    <radialGradient id="vign" cx="28%" cy="36%" r="80%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.06"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#ffffff" fill-opacity="0.045"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#vign)"/>
  <g transform="translate(${nlX.toFixed(1)} ${nlY.toFixed(1)}) scale(${nlScale.toFixed(4)})"><path d="${nl.path}" fill="#ffffff" fill-opacity="0.06"/></g>
  <rect x="${P}" y="104" width="52" height="3" fill="#7ea3b8"/>
  <path d="${eyebrow}" fill="#9db8c6"/>
  <g transform="translate(${lockX} ${lockY}) scale(${lockScale.toFixed(4)})">${lockupPaths}</g>
  <path d="${tagline}" fill="#f4f6f7"/>
  <rect x="${P}" y="${H - 116}" width="${W - 2 * P}" height="1" fill="#ffffff" fill-opacity="0.16"/>
  <path d="${domain}" fill="#ffffff"/>
  <path d="${tagRight}" fill="#9db8c6"/>
</svg>`;

fs.writeFileSync('images/og-image.svg', svg, 'utf8');
sharp(Buffer.from(svg)).jpeg({ quality: 90, chromaSubsampling: '4:4:4' }).toFile('images/og-image.jpg')
  .then((info) => console.log('og-image.jpg', info.width + 'x' + info.height, (info.size / 1024).toFixed(0) + 'kB',
    '| eyebrow', Math.round(ey.width), '| tagline', Math.round(tg.width), 'cap', tg.capPx.toFixed(1)))
  .catch((e) => { console.error(e); process.exit(1); });
