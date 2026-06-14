// One-off generator: builds the STAAL logo path data in the coordinate
// systems the FIND artwork uses:
//   - wordmark svg: viewBox 0 0 975 280  (header + footer)
//   - hero svg:     viewBox 0 0 977 423  (big word + "Real Estate" line)
// STAAL letterforms come from the custom logo (images/logo-src.svg);
// "Real Estate" is set from the site font (Space Grotesk).
const fs = require('fs');
const fontkit = require('fontkit');
const paper = require('paper-jsdom');
paper.setup(new paper.Size(4000, 4000));

let font = fontkit.openSync('SpaceGrotesk-var.ttf');
if (font.variationAxes && font.variationAxes.wght) {
  font = font.getVariation({ wght: 700 });
}

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

// "Real Estate" from the font: per-glyph paths scaled to capPx, centred in boxW
function buildWord(str, capPx, boxW, baselineY, letterSpacing) {
  const run = font.layout(str);
  const capHeight = font.capHeight || 700;
  let scale = capPx / capHeight;
  let width = 0;
  run.positions.forEach((pos, i) => {
    width += pos.xAdvance * scale;
    if (i < run.positions.length - 1) width += letterSpacing;
  });
  if (width > boxW) { const k = boxW / width; scale *= k; width = boxW; letterSpacing *= k; }
  let x = (boxW - width) / 2;
  const paths = [];
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    const d = transformPath(glyph.path, scale, scale, x + pos.xOffset * scale, baselineY - pos.yOffset * scale);
    if (d) paths.push({ d, char: str[i] });
    x += pos.xAdvance * scale + letterSpacing;
  });
  return { paths, width, scale };
}

// STAAL from the custom logo: import (resolving transforms), scale so the caps
// are capPx tall, centre in boxW, sit the baseline at baselineY.
const logoSvg = fs.readFileSync('images/logo-src.svg', 'utf8');
function buildWordFromLogo(capPx, boxW, baselineY) {
  const imported = paper.project.importSVG(logoSvg, { insert: false, expandShapes: true });
  const glyphs = [];
  (function walk(it) {
    if (it.clipMask) return;
    if (it.className === 'Path' || it.className === 'CompoundPath') {
      if (it.bounds.width > 2 && it.bounds.height > 2) glyphs.push(it);
    } else if (it.children) { it.children.forEach(walk); }
  })(imported);
  const group = new paper.Group(glyphs);
  const b = group.bounds;
  let scale = capPx / b.height;
  if (b.width * scale > boxW) scale = boxW / b.width;
  group.scale(scale, b.topLeft);
  const nb = group.bounds;
  group.translate(new paper.Point((boxW - nb.width) / 2 - nb.x, baselineY - nb.bottom));
  const chars = ['S', 'T', 'A', 'A', 'L'];
  const sorted = group.children.slice().sort((p, q) => p.bounds.x - q.bounds.x);
  const paths = sorted.map((it, i) => ({ d: it.pathData, char: chars[i] || 'x' }));
  const width = group.bounds.width;
  group.remove();
  return { paths, width, scale };
}

const wordmark = buildWordFromLogo(280, 975, 280);
const heroWord = buildWordFromLogo(280, 977, 280);
const heroSub = buildWord('Real Estate', 76, 977, 419, 4);

function svgPaths(word, extraAttr) {
  return word.paths
    .map(p => `<path fill="currentColor" d="${p.d}" data-letter="${p.char}"${extraAttr || ''}></path>`)
    .join('\n              ');
}
function maskPaths(word) {
  return word.paths.map(p => `<path d="${p.d}"/>`).join('');
}

const out = {
  wordmark: svgPaths(wordmark),
  heroWord: svgPaths(heroWord),
  heroSub: svgPaths(heroSub),
  mask: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 977 423"><g fill="%23000">${maskPaths(heroWord)}${maskPaths(heroSub)}</g></svg>`
};
fs.writeFileSync('staal-logo.json', JSON.stringify(out, null, 2));
console.log('wordmark w', Math.round(wordmark.width), '| heroWord w', Math.round(heroWord.width), '| heroSub w', Math.round(heroSub.width), '| glyphs', wordmark.paths.length, heroWord.paths.length, heroSub.paths.length);
