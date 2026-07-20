/*
 * optimize-images.js — one-off web optimisation for the hub/article photos.
 * Originals are copied to images/_candidates/_hires/ (gitignored) first, then
 * each image is resized to max 1600px wide and re-encoded in place, keeping
 * the same filename so no HTML references change.
 *
 * Run: node optimize-images.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG = path.join(__dirname, 'images');
const BACKUP = path.join(IMG, '_candidates', '_hires');
const MAX_WIDTH = 1600;
const MIN_BYTES = 150 * 1024; // only touch images over ~150 KB

fs.mkdirSync(BACKUP, { recursive: true });

const targets = fs.readdirSync(IMG).filter(f => {
  if (!/^(hub-.*|interior|docks)\.(jpg|jpeg|webp|png)$/i.test(f)) return false;
  const p = path.join(IMG, f);
  return fs.statSync(p).isFile() && fs.statSync(p).size > MIN_BYTES;
});

(async () => {
  let saved = 0;
  for (const f of targets) {
    const src = path.join(IMG, f);
    const before = fs.statSync(src).size;
    fs.copyFileSync(src, path.join(BACKUP, f)); // preserve the original locally
    const input = fs.readFileSync(src);         // read fully before overwriting
    const ext = path.extname(f).toLowerCase();
    let pipeline = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
    if (ext === '.webp') pipeline = pipeline.webp({ quality: 80 });
    else if (ext === '.png') pipeline = pipeline.png({ compressionLevel: 9 });
    else pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    const out = await pipeline.toBuffer();
    if (out.length < before) {
      fs.writeFileSync(src, out);
      saved += before - out.length;
      console.log(
        `${f.padEnd(38)} ${(before / 1024).toFixed(0).padStart(6)} KB -> ${(out.length / 1024).toFixed(0).padStart(5)} KB`
      );
    } else {
      console.log(`${f.padEnd(38)} kept (already optimal)`);
    }
  }
  console.log(`\nTotal saved: ${(saved / 1024 / 1024).toFixed(2)} MB`);
})();
