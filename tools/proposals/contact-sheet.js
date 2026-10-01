#!/usr/bin/env node
// Numbered contact sheet per option, used to pick "hero" and "gallery" photo
// indices in proposal.json (listing photos often carry agent banners or are
// mostly office shots, so the order on funda is not the order we want).
//
//   node tools/proposals/contact-sheet.js <path/to/proposal.json>
// -> <client>/sheets/option-<n>.jpg

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const jsonPath = path.resolve(process.argv[2] || '');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const outDir = path.join(path.dirname(jsonPath), 'sheets');
const cacheDir = path.join(__dirname, '.cache');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });

const full = (p) => (/^\d+\/\d+\/\d+$/.test(p) ? `https://cloud.funda.nl/valentina_media/${p}_2160.jpg` : p);
async function get(url) {
  const f = path.join(cacheDir, crypto.createHash('sha1').update(url).digest('hex').slice(0, 12));
  if (fs.existsSync(f)) return fs.readFileSync(f);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 StaalRE-proposals' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(f, buf);
  return buf;
}

(async () => {
  const W = 360, H = 240, COLS = 5;
  for (const [i, o] of data.options.entries()) {
    const photos = (o.photos || []).map(full);
    const rows = Math.ceil(photos.length / COLS);
    const tiles = await Promise.all(photos.map(async (u, k) => {
      const img = await sharp(await get(u)).resize(W, H, { fit: 'cover' }).toBuffer();
      const label = Buffer.from(`<svg width="${W}" height="${H}"><rect x="6" y="6" width="44" height="30" rx="4" fill="#1F4257"/><text x="28" y="28" font-family="Arial" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">${k}</text></svg>`);
      return { input: await sharp(img).composite([{ input: label }]).toBuffer(), left: (k % COLS) * (W + 6), top: Math.floor(k / COLS) * (H + 6) };
    }));
    const out = path.join(outDir, `option-${i + 1}.jpg`);
    await sharp({ create: { width: COLS * (W + 6) - 6, height: rows * (H + 6) - 6, channels: 3, background: '#fff' } })
      .composite(tiles).jpeg({ quality: 70 }).toFile(out);
    console.log(out);
  }
})().catch((e) => { console.error(e); process.exit(1); });
