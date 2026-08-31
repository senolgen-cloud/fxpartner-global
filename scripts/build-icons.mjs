/**
 * Builds every app icon the site ships, from one master file.
 *
 *   node scripts/build-icons.mjs
 *
 * There are eight of them across four consumers — the web app manifest, the
 * <link> tags Next emits, the service worker's push notification, and the
 * browser tab — and before this script they were resized by hand. That is
 * the kind of job that goes wrong quietly: one size gets missed, and the
 * only symptom is a stale logo on somebody's home screen months later,
 * because a PWA icon is cached hard and nobody looks at their own tab.
 *
 * Two framings, and the difference matters:
 *
 * - "any" fills the frame, because that is what iOS, Windows and the tab
 *   show — the platform adds its own rounded corners around a full-bleed
 *   square.
 * - "maskable" is the same art at 60% width on the same black field,
 *   because Android crops icons to whatever shape the launcher wants, up
 *   to a circle. Ship the full-bleed version as maskable and the circle
 *   takes a bite out of the globe.
 *
 * Both ratios were measured off the icons this replaced (84% and 60% of
 * the canvas width) so the new artwork lands in exactly the frame the old
 * one occupied: a swap, not a redesign.
 *
 * The master is cropped to its own content first. The artwork arrives with
 * uneven black padding — 148px above and 357px below — so using it as-is
 * would hang the lockup high in the frame and make it look small next to
 * every other icon on a home screen.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MASTER = "public/icon-fxpartner-2026-master.png";
const OUT = "public";
const BASE = "icon-fxpartner-2026";
const FAVICON = "src/app/favicon.ico";

/** The artwork's own field. Not the manifest's #06090b: a seam would show. */
const FIELD = { r: 0, g: 0, b: 0, alpha: 1 };

/** Fraction of the canvas width the artwork occupies, per framing. */
const FILL = { any: 0.84, maskable: 0.6 };

/** Anything above this is content rather than the black field. */
const CONTENT_THRESHOLD = 18;

async function contentBox(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (data[i] > CONTENT_THRESHOLD || data[i + 1] > CONTENT_THRESHOLD || data[i + 2] > CONTENT_THRESHOLD) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error(`${file} is entirely background — nothing to crop to`);
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1, canvas: { width, height } };
}

/** The artwork alone, square, with the field trimmed off every side. */
async function trimmedSquare(file) {
  const box = await contentBox(file);
  const side = Math.max(box.width, box.height);
  // Centred in its own square, clamped so the crop stays inside the master.
  const left = Math.max(0, Math.min(box.canvas.width - side, box.left - Math.round((side - box.width) / 2)));
  const top = Math.max(0, Math.min(box.canvas.height - side, box.top - Math.round((side - box.height) / 2)));
  return { buffer: await sharp(file).extract({ left, top, width: side, height: side }).png().toBuffer(), box };
}

async function render(art, size, fill) {
  const inner = Math.round(size * fill);
  const pad = Math.round((size - inner) / 2);
  const scaled = await sharp(art).resize(inner, inner, { fit: "contain", background: FIELD }).png().toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: FIELD },
  })
    .composite([{ input: scaled, left: pad, top: pad }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * An .ico holding one PNG per size.
 *
 * Written here rather than with a dependency because the format is a
 * 6-byte header, a 16-byte entry per image and then the images themselves;
 * every browser that still reads .ico has accepted PNG payloads for over a
 * decade, and the file this replaces was already built that way.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const { buffer: art, box } = await trimmedSquare(MASTER);
const written = [];

for (const size of [1024, 512, 192]) {
  const file = path.join(OUT, `${BASE}-${size}.png`);
  fs.writeFileSync(file, await render(art, size, FILL.any));
  written.push(file);
}

// iOS wants its own 180: it does not round the corners of what it is given,
// it rounds the corners of what it renders, so a full-bleed square at the
// exact size beats letting it downscale a 1024.
const apple = path.join(OUT, `${BASE}-apple-180.png`);
fs.writeFileSync(apple, await render(art, 180, FILL.any));
written.push(apple);

for (const size of [512, 192]) {
  const file = path.join(OUT, `${BASE}-maskable-${size}.png`);
  fs.writeFileSync(file, await render(art, size, FILL.maskable));
  written.push(file);
}

// The tab. Four sizes because Windows shortcuts and older browsers pick
// different ones, and 16 is not a downscale of 48 that anyone would like.
const faviconSizes = [16, 32, 48, 64];
const faviconImages = [];
for (const size of faviconSizes) {
  faviconImages.push({ size, data: await render(art, size, FILL.any) });
}
fs.writeFileSync(FAVICON, ico(faviconImages));
written.push(FAVICON);

console.log(
  `icons: cropped ${box.width}x${box.height} of artwork out of the master, wrote ${written.length} files`
);
for (const f of written) console.log(`  ${f}`);
