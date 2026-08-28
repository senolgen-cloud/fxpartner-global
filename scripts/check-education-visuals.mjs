/**
 * Checks that every Akademi figure is attached to a real lesson subject.
 *
 *   node scripts/check-education-visuals.mjs
 *
 * A figure in lib/educationVisuals.ts claims one or more topic ids from
 * lib/educationTopics.ts. Nothing at runtime notices when a claim is wrong:
 * getVisualForTopic() looks the lesson's topic up in the list and returns
 * undefined, the page renders without a figure, and the only symptom is a
 * diagram that quietly stopped appearing. That is exactly the kind of bug
 * that survives a release, because the page still looks finished.
 *
 * Two ways it goes wrong, both caught here:
 *   - a typo, or a topic retired from the queue, leaves a figure pointing at
 *     an id that does not exist;
 *   - two figures claim the same topic, and which one a lesson gets depends
 *     on array order rather than on anyone's decision.
 *
 * Also checks the slugs, because they are anchors on
 * /egitim/gorsel-anlatimlar and a duplicate would make one of them
 * unreachable.
 *
 * Reads the source with regexes rather than importing it: these files are
 * TypeScript with path aliases, and standing up a loader for a check this
 * small costs more than it returns. The shapes matched are the shapes the
 * files are actually written in, and a reformat that breaks the match fails
 * loudly here rather than passing silently.
 */
import fs from "node:fs";

const topicsSource = fs.readFileSync("src/lib/educationTopics.ts", "utf8");
const visualsSource = fs.readFileSync("src/lib/educationVisuals.ts", "utf8");

const topicIds = new Set(
  [...topicsSource.matchAll(/\{\s*id:\s*"([a-z0-9-]+)"/g)].map((m) => m[1])
);

// One entry per `{ id: …, slug: …, … topics: [...] }` block in the visuals
// list. The id and slug come from their own lines; the topics come from the
// array that follows.
const visuals = [...visualsSource.matchAll(
  /id:\s*"([a-z0-9-]+)",\s*\n\s*slug:\s*"([a-z0-9-]+)",[\s\S]*?topics:\s*\[([^\]]*)\]/g
)].map((m) => ({
  id: m[1],
  slug: m[2],
  topics: [...m[3].matchAll(/"([a-z0-9-]+)"/g)].map((t) => t[1]),
}));

const problems = [];

if (topicIds.size === 0) problems.push("no topic ids found — has educationTopics.ts changed shape?");
if (visuals.length === 0) problems.push("no figures found — has educationVisuals.ts changed shape?");

const claimedBy = new Map();
const slugs = new Map();

for (const v of visuals) {
  if (v.topics.length === 0) {
    problems.push(`${v.id}: claims no topic, so no lesson will ever show it`);
  }
  for (const t of v.topics) {
    if (!topicIds.has(t)) {
      problems.push(`${v.id}: topic "${t}" is not in educationTopics.ts`);
    }
    const owner = claimedBy.get(t);
    if (owner) problems.push(`topic "${t}" is claimed by both ${owner} and ${v.id}`);
    else claimedBy.set(t, v.id);
  }
  const sameSlug = slugs.get(v.slug);
  if (sameSlug) problems.push(`slug "${v.slug}" is used by both ${sameSlug} and ${v.id}`);
  else slugs.set(v.slug, v.id);
}

if (problems.length) {
  console.error("education visuals:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  `education visuals: ${visuals.length} figures cover ${claimedBy.size} of ${topicIds.size} topics, all resolved`
);
