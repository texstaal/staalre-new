// One-off generator: builds STAAL logo SVG path data from the local
// Instrument Sans variable font (bold instance), in the same coordinate
// systems as the FIND artwork it replaces:
//   - wordmark svg: viewBox 0 0 975 280  (header + footer)
//   - hero svg:     viewBox 0 0 977 423  (big word + "Real Estate" line)
const fontkit = require('fontkit');
const fs = require('fs');

let font = fontkit.openSync('InstrumentSans-var.ttf');
if (font.variationAxes && font.variationAxes.wght) {
  font = font.getVariation({ wght: 700 });
}

function transformPath(path, sx, sy, tx, ty) {
  // flip Y (font coords are y-up, SVG y-down): y' = ty - y*sy
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

// returns per-glyph path data for `str`, scaled so cap height == capPx,
// then horizontally fitted/centred into boxW; baseline at baselineY
function buildWord(str, capPx, boxW, baselineY, letterSpacing) {
  const run = font.layout(str);
  const capHeight = font.capHeight || 700;
  let scale = capPx / capHeight;
  // measure advance width (+ letter spacing between glyphs)
  let width = 0;
  run.positions.forEach((pos, i) => {
    width += pos.xAdvance * scale;
    if (i < run.positions.length - 1) width += letterSpacing;
  });
  if (width > boxW) {
    const shrink = boxW / width;
    scale *= shrink;
    width = boxW;
    letterSpacing *= shrink;
  }
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

// 1) wordmark: STAAL filling 975 x 280
const wordmark = buildWord('STAAL', 280, 975, 280, 10);

// 2) hero logo: STAAL on top (cap 280, baseline 280) + "Real Estate" below
const heroWord = buildWord('STAAL', 280, 977, 280, 10);
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
console.log('wordmark width', Math.round(wordmark.width), '| hero sub width', Math.round(heroSub.width), '| paths', wordmark.paths.length, heroWord.paths.length, heroSub.paths.length);
