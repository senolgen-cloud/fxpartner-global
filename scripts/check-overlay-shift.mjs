// Fails when a blog overlay key points at a section that no longer exists.
//
//   node scripts/check-overlay-shift.mjs
//
// The blog overlays in src/data/i18n/<locale>/blog.json are keyed by
// POSITION — "slug.s3.heading" is whatever the fourth section happens to be
// today. That is fine until somebody inserts a section in the middle of a
// post, at which point every later key silently describes the wrong
// section: an English reader gets the heading of the section after the one
// they are reading, all the way down the page, and nothing anywhere reports
// it. It happened on 9 Eylül 2026 to litefinance-anlik-para-cekme, and the
// only reason it was caught is that somebody printed the Turkish and the
// English side by side.
//
// A shift always leaves the same fingerprint: keys for indices past the end
// of the post. That is what this looks for. It cannot see a shift that
// happens to leave the count unchanged (a section replaced rather than
// inserted), so it is a smoke alarm, not a proof — but the insert case is
// the one that actually happens, because posts grow.
//
// The fix when it fires is always the same: delete every key for that slug
// and re-translate the post from the current Turkish. Patching individual
// keys re-creates the drift a different way.

import fs from "node:fs";

const BLOG = "src/data/blog.ts";
const LOCALES = ["en", "uk", "ar"];

function readPosts() {
  const src = fs.readFileSync(BLOG, "utf8");
  const start = src.indexOf("export const blogPosts");
  const open = src.indexOf("= [", start) + 2;
  let depth = 0, end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") { depth--; if (depth === 0) { end = i; break; } }
  }
  return eval("(" + src.slice(open, end + 1).replace(/,(\s*[}\]])/g, "$1") + ")");
}

const posts = readPosts();
const shape = new Map(
  posts.map((p) => [
    p.slug,
    {
      sections: p.sections?.length ?? 0,
      lists: (p.sections ?? []).map((s) => s.list?.length ?? 0),
      paragraphs: (p.sections ?? []).map((s) => s.paragraphs?.length ?? 0),
      faqs: p.faqs?.length ?? 0,
    },
  ])
);

const problems = [];

for (const locale of LOCALES) {
  const path = `src/data/i18n/${locale}/blog.json`;
  const overlay = JSON.parse(fs.readFileSync(path, "utf8"));

  for (const key of Object.keys(overlay)) {
    const m = key.match(/^(.+?)\.s(\d+)\.(?:heading|p(\d+)|l(\d+))$/);
    const f = key.match(/^(.+?)\.faq(\d+)\.[qa]$/);
    if (!m && !f) continue;

    const slug = (m ?? f)[1];
    const post = shape.get(slug);
    if (!post) continue; // a deleted post's leftovers are a different problem

    if (f) {
      if (Number(f[2]) >= post.faqs) problems.push([locale, key, `post has ${post.faqs} faq(s)`]);
      continue;
    }

    const s = Number(m[2]);
    if (s >= post.sections) {
      problems.push([locale, key, `post has ${post.sections} section(s)`]);
      continue;
    }
    if (m[3] !== undefined && Number(m[3]) >= post.paragraphs[s]) {
      problems.push([locale, key, `section ${s} has ${post.paragraphs[s]} paragraph(s)`]);
    }
    if (m[4] !== undefined && Number(m[4]) >= post.lists[s]) {
      problems.push([locale, key, `section ${s} has ${post.lists[s]} list item(s)`]);
    }
  }
}

if (problems.length) {
  console.error(
    `${problems.length} overlay key(s) point past the end of their post — a section or list was\n` +
      `almost certainly inserted, which shifts every later translation onto the wrong content:\n`
  );
  for (const [locale, key, why] of problems.slice(0, 20)) {
    console.error(`  ${locale}/blog.json  ${key}   (${why})`);
  }
  if (problems.length > 20) console.error(`  … +${problems.length - 20} more`);
  console.error(
    `\n  fix: delete every key for the affected slug and re-translate the post from\n` +
      `       the current Turkish. Patching single keys re-creates the drift.\n`
  );
  process.exit(1);
}

console.log(
  `no shifted blog overlays: ${posts.length} post(s) x ${LOCALES.length} locale(s) checked`
);
