// Generates the PNG app icons (no dependencies): an indigo tile with two stacked white cards.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

/** Signed distance to a rounded rectangle centred at (cx, cy). */
function roundRectDist(x, y, cx, cy, hw, hh, r, angle = 0) {
  const cos = Math.cos(-angle), sin = Math.sin(-angle);
  const dx0 = x - cx, dy0 = y - cy;
  const dx = Math.abs(dx0 * cos - dy0 * sin) - (hw - r);
  const dy = Math.abs(dx0 * sin + dy0 * cos) - (hh - r);
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
}

function makeIcon(size, fullBleed) {
  const s = size / 512;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const bg = [79, 70, 229], back = [165, 180, 252], white = [255, 255, 255], ink = [79, 70, 229];
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5) / s, py = (y + 0.5) / s;
      const cov = (d) => Math.min(1, Math.max(0, 0.5 - d * s));
      let rgb = [0, 0, 0], a = 0;
      const paint = (color, alpha) => {
        rgb = rgb.map((v, i) => v * (1 - alpha) + color[i] * alpha);
        a = a + alpha * (1 - a);
      };
      paint(bg, fullBleed ? 1 : cov(roundRectDist(px, py, 256, 256, 256, 256, 112)));
      paint(back, cov(roundRectDist(px, py, 290, 262, 118, 150, 28, (10 * Math.PI) / 180)));
      paint(white, cov(roundRectDist(px, py, 237, 260, 125, 150, 28)));
      // three "text lines" on the card
      for (const [ly, lw] of [[205, 80], [255, 80], [305, 50]]) {
        paint(ink, cov(roundRectDist(px, py, 237 - (80 - lw), ly, lw, 11, 11)));
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = Math.round(rgb[0]);
      raw[o + 1] = Math.round(rgb[1]);
      raw[o + 2] = Math.round(rgb[2]);
      raw[o + 3] = Math.round(a * 255);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync('public/icon-192.png', makeIcon(192, false));
writeFileSync('public/icon-512.png', makeIcon(512, false));
// iOS applies its own rounded mask, so the touch icon is full-bleed.
writeFileSync('public/apple-touch-icon.png', makeIcon(180, true));
console.log('icons written');
