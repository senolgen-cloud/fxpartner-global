// Pulls the translatable prose out of the Turkish data files into flat
// key/value JSON for scripts/translate.mjs, and writes it to tmp/.
//
//   node scripts/extract-content.mjs brokers
//   node scripts/extract-content.mjs blog
//
// Only prose is extracted. Slugs, URLs, numbers, dates, image paths, ratings
// and scores stay behind: they are the same in every language, and a value
// that never reaches the model is a value the model cannot damage.
//
// Keys are stable and derived from the record's own slug, so re-running after
// an edit produces the same keys and only the changed strings need retranslating.

import fs from "node:fs";

const TARGET = process.argv[2];
if (!["brokers", "blog"].includes(TARGET)) {
  console.error("usage: node scripts/extract-content.mjs <brokers|blog>");
  process.exit(1);
}

// Reading the data files as text rather than importing them: they are TS
// modules that pull in the db and half the app, and all this needs is the
// string literals.
function quoted(line) {
  // Two shapes live in these files: bare TS keys (title: "x") and JSON-style
  // quoted ones ("title": "x"). Taking from the first quote to the last would
  // swallow the key itself on the second shape — which it did, putting
  // 'title": "Lot Nedir?' into 71 blog strings — so the key is cut off first.
  let rest = line.trim();
  if (rest.startsWith('"')) {
    const keyEnd = rest.indexOf('"', 1);
    const colon = rest.indexOf(":", keyEnd);
    if (colon !== -1) rest = rest.slice(colon + 1);
  } else {
    const colon = rest.indexOf(":");
    // only strip a leading key, never a colon inside the value
    if (colon !== -1 && colon < rest.indexOf('"')) rest = rest.slice(colon + 1);
  }

  const a = rest.indexOf('"');
  const b = rest.lastIndexOf('"');
  if (a < 0 || b <= a) return null;
  try {
    return JSON.parse(rest.slice(a, b + 1));
  } catch {
    return rest.slice(a + 1, b);
  }
}

function extractBrokers() {
  const lines = fs.readFileSync("src/data/brokers.ts", "utf8").split("\n");
  const out = {};
  let slug = null;
  let list = null;
  let listIndex = 0;
  let faqIndex = -1;

  const PROSE_FIELDS = ["tagline", "summary", "bestFor", "accentNote"];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    const slugMatch = t.match(/^slug: "([a-z0-9-]+)",$/);
    if (slugMatch) {
      slug = slugMatch[1];
      list = null;
      faqIndex = -1;
      continue;
    }
    if (!slug) continue;

    for (const field of PROSE_FIELDS) {
      if (t.startsWith(`${field}: "`)) out[`${slug}.${field}`] = quoted(t);
      else if (t === `${field}:`) out[`${slug}.${field}`] = quoted(lines[i + 1]);
    }

    if (t === "pros: [" || t === "cons: [") {
      list = t.slice(0, 4);
      listIndex = 0;
      continue;
    }
    if (list && t === "],") {
      list = null;
      continue;
    }
    if (list && t.startsWith('"')) {
      out[`${slug}.${list}.${listIndex++}`] = quoted(t);
      continue;
    }

    if (t.startsWith('q: "')) out[`${slug}.faq.${++faqIndex}.q`] = quoted(t);
    else if (t.startsWith('a: "')) out[`${slug}.faq.${faqIndex}.a`] = quoted(t);

    // deepDive prose, but not its account names or figures
    if (t.startsWith("deposits:")) out[`${slug}.deepDive.deposits`] = quoted(t === "deposits:" ? lines[i + 1] : t);
    if (t.startsWith("withdrawals:")) out[`${slug}.deepDive.withdrawals`] = quoted(t === "withdrawals:" ? lines[i + 1] : t);
    if (t.startsWith("support:")) out[`${slug}.deepDive.support`] = quoted(t === "support:" ? lines[i + 1] : t);
    if (t.startsWith("education:")) out[`${slug}.deepDive.education`] = quoted(t === "education:" ? lines[i + 1] : t);
  }

  for (const k of Object.keys(out)) if (!out[k]) delete out[k];
  return out;
}

function extractBlog() {
  const lines = fs.readFileSync("src/data/blog.ts", "utf8").split("\n");
  const out = {};
  let slug = null;
  let sectionIndex = -1;
  let paraIndex = 0;
  let inParagraphs = false;
  let inList = false;
  let listIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();

    const slugMatch = t.match(/^"?slug"?: "([a-z0-9-]+)",$/);
    if (slugMatch) {
      slug = slugMatch[1];
      sectionIndex = -1;
      continue;
    }
    if (!slug) continue;

    if (t.startsWith('"title":') || t.startsWith("title:")) out[`${slug}.title`] = quoted(t);
    if (t.startsWith('"excerpt":') || t.startsWith("excerpt:")) out[`${slug}.excerpt`] = quoted(t);
    if (t.startsWith('"heading":') || t.startsWith("heading:")) {
      sectionIndex++;
      out[`${slug}.s${sectionIndex}.heading`] = quoted(t);
    }

    if (t === '"paragraphs": [' || t === "paragraphs: [") {
      inParagraphs = true;
      paraIndex = 0;
      if (!out[`${slug}.s${sectionIndex}.heading`] && sectionIndex === -1) sectionIndex = 0;
      continue;
    }
    if (inParagraphs && (t === "]," || t === "]")) {
      inParagraphs = false;
      continue;
    }
    if (inParagraphs && t.startsWith('"')) {
      out[`${slug}.s${sectionIndex}.p${paraIndex++}`] = quoted(t);
      continue;
    }

    if (t === '"list": [' || t === "list: [") {
      inList = true;
      listIndex = 0;
      continue;
    }
    if (inList && (t === "]," || t === "]")) {
      inList = false;
      continue;
    }
    if (inList && t.startsWith('"')) {
      out[`${slug}.s${sectionIndex}.l${listIndex++}`] = quoted(t);
    }
  }

  for (const k of Object.keys(out)) if (!out[k]) delete out[k];
  return out;
}

const data = TARGET === "brokers" ? extractBrokers() : extractBlog();
fs.mkdirSync("tmp", { recursive: true });
const path = `tmp/${TARGET}.tr.json`;
fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");

const words = Object.values(data).join(" ").split(/\s+/).length;
console.log(`${path}: ${Object.keys(data).length} strings, ~${words} words`);
