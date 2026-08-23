// Verifies that declared image dimensions match the files on disk.
//
//   node scripts/check-image-dimensions.mjs
//
// src/data/brokers.ts declares a width and height next to every ad creative,
// because next/image needs them to reserve layout space before the file
// loads. Nothing checks that the numbers are true. Swap in a re-exported
// banner at a different size and the page keeps the old numbers: the image
// renders stretched or squashed, and it does it quietly — no error, no
// warning, just a slightly wrong-looking ad that nobody notices for weeks.
//
// PNG and JPEG dimensions are read from the file header directly. Neither
// needs a decoder: PNG puts width and height in the IHDR chunk at a fixed
// offset, and JPEG carries them in the SOF marker.

import fs from "node:fs";
import path from "node:path";

const BROKERS = "src/data/brokers.ts";
const PUBLIC = "public";

function pngSize(buf) {
  // 8-byte signature, then IHDR: length(4) type(4) width(4) height(4).
  if (buf.length < 24) return null;
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  // Walk the marker chain to the first Start-Of-Frame.
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    // SOF0..SOF15, excluding DHT (c4), JPG (c8) and DAC (cc).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function sizeOf(file) {
  const buf = fs.readFileSync(file);
  if (buf.slice(0, 8).toString("hex") === "89504e470d0a1a0a") return pngSize(buf);
  if (buf[0] === 0xff && buf[1] === 0xd8) return jpegSize(buf);
  return null; // svg, webp, avif — not declared with pixel sizes here
}

const source = fs.readFileSync(BROKERS, "utf8");

// adImage / adImageMobile / adImageTall, each with its own Width and Height.
const VARIANTS = ["adImage", "adImageMobile", "adImageTall"];
const problems = [];
let checked = 0;

for (const variant of VARIANTS) {
  const re = new RegExp(
    `${variant}:\\s*"([^"]+)",[\\s\\S]{0,400}?${variant}Width:\\s*(\\d+),[\\s\\S]{0,200}?${variant}Height:\\s*(\\d+),`,
    "g"
  );
  for (const m of source.matchAll(re)) {
    const [, url, w, h] = m;
    const file = path.join(PUBLIC, url.replace(/^\//, ""));
    if (!fs.existsSync(file)) {
      problems.push({ url, issue: "file does not exist" });
      continue;
    }
    const actual = sizeOf(file);
    if (!actual) continue; // format we cannot measure without a decoder
    checked++;
    if (actual.width !== Number(w) || actual.height !== Number(h)) {
      problems.push({
        url,
        issue: `declared ${w}×${h}, file is ${actual.width}×${actual.height}`,
      });
    }
  }
}

if (!problems.length) {
  console.log(`every declared image size matches the file (${checked} checked)`);
  process.exit(0);
}

console.error(`${problems.length} image(s) declared at the wrong size:\n`);
for (const p of problems) {
  console.error(`  ${p.url}`);
  console.error(`    ${p.issue}\n`);
}
process.exit(1);
