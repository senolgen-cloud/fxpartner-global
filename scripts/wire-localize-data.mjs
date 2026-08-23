// Routes the Turkish-authored data modules through the translation walk at
// every place they are read.
//
//   node scripts/wire-localize-data.mjs --dry
//   node scripts/wire-localize-data.mjs
//
// src/data/{propFirms,marketAnalysis,technicalAnalysis,partnerProgram,
// packageTiers}.ts are imported directly by pages and components, which then
// render their Turkish straight to the reader whatever locale they are in.
// Wrapping each read in trData() (server) or useLocalizedData() (client)
// sends it through the same catalogue the JSX uses.
//
// Only reads are wrapped, never the import itself: the modules stay the
// single Turkish source, and a caller that wants the untranslated original
// (the share bots, the sitemap) simply is not wrapped.

import fs from "node:fs";
import path from "node:path";
import { scan } from "./lib/scope.mjs";

const DRY = process.argv.includes("--dry");
// useLocalizedData is a hook, so it is only legal at the top level of a
// component body — and a regex cannot tell a top-level read from one inside
// a .map() callback. trData is an ordinary function and is safe anywhere,
// so the codemod does the server files and leaves the client ones to a
// person who can see where the component body starts.
const SERVER_ONLY = !process.argv.includes("--all");

// Exported values worth translating, per module. Functions are called at the
// use site, so both the call and the bare identifier are matched.
const EXPORTS = [
  // propFirms
  "propFirms", "propFirmsByScore", "getPropFirm", "getPropFirmByBackingBroker",
  "getFeaturedPartner", "PAYOUT_STATUS_LABEL",
  // marketAnalysis
  "marketAnalysisPosts", "getMarketAnalysisPostBySlug",
  // technicalAnalysis
  "technicalAnalysisPosts", "getTechnicalAnalysisPostBySlug", "bulletinTitles", "getBulletinTitle",
  // partnerProgram
  "partnerSteps", "partnerTiers", "whyFxPartnerCards", "contentLibraryCategories",
  "contentStudioPrompt", "contentStudioSamples", "partnerFaqItems", "networkRegions",
  // packageTiers
  "PACKAGE_TIER_INFO", "FREE_TIER_INFO", "ACCESS_TIER_LABEL",
  // brokers — the category table only; broker records themselves go through
  // localizeBroker(), which has its own per-field overlay.
  "categoryInfo",
];

// Exports whose values carry no prose: scores, ordering, booleans, arcs.
// Wrapping them would cost a tree walk for nothing.
const STRUCTURAL_EXPORTS = new Set([
  "getPropFirmScores", "isPromotable", "hasActiveLink", "canUseCopyTrade",
  "canUseSignals", "formatDrawdown", "FEATURED_PARTNER_SLUG",
  "PACKAGE_TIER_ORDER", "calculatorDefaults", "networkArcs",
  "isoToBulletinSlug", "bulletinSlugToIso", "getMarketAnalysisCoverImage",
]);

// Callers that must keep the Turkish: the bots post to Turkish-language
// channels, and the sitemap is not prose at all.
const SKIP = [
  "src/app/api/",
  "src/app/sitemap.ts",
  // A single Turkish index for crawlers, not a localized page.
  "src/app/llms.txt/",
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name).split(path.sep).join("/");
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const results = [];

for (const file of walk("src")) {
  if (SKIP.some((p) => file.startsWith(p))) continue;
  let source = fs.readFileSync(file, "utf8");
  if (!/from "@\/data\/(propFirms|marketAnalysis|technicalAnalysis|partnerProgram|packageTiers|brokers)"/.test(source)) continue;

  const isClient = source.startsWith('"use client"');
  if (isClient && SERVER_ONLY) {
    results.push({ file, changed: 0, note: "client component — wire useLocalizedData by hand" });
    continue;
  }
  const wrapper = isClient ? "useLocalizedData" : "trData";
  const imported = EXPORTS.filter((name) => new RegExp(`\\b${name}\\b`).test(source));
  let changed = 0;

  // Everything up to the end of the last import is off limits. A per-line
  // check is not enough: a multi-line import puts each name on its own line
  // with no "import" keyword in sight, and wrapping one there produces
  // `import { trData(getPropFirm), }` — which is what the first run did.
  let scope = scan(source);
  const importBlock = [...source.matchAll(/^import [\s\S]*?;$/gm)];
  const importsEnd = importBlock.length
    ? importBlock[importBlock.length - 1].index + importBlock[importBlock.length - 1][0].length
    : 0;

  for (const name of imported) {
    if (STRUCTURAL_EXPORTS.has(name)) continue;
    // Three read shapes: a no-arg call, a call with arguments, and a bare
    // reference used as a value. Each becomes wrapper(<original>). Import
    // lines and already-wrapped reads are left alone so a rerun is a no-op.
    const read = new RegExp(`(?<![.\\w$])${name}(\\([^()]*\\))?(?![\\w("'\`])`, "g");
    source = source.replace(read, (match, _call, offset) => {
      if (offset < importsEnd) return match;
      // Prose, not code: a doc comment naming the module is not a read.
      if (scope.inert[offset]) return match;
      // A top-level initialiser runs at import, where there is no request,
      // so wrapping there would freeze the first locale served.
      if (scope.runsAtImport(offset)) return match;
      if (source.slice(Math.max(0, offset - wrapper.length - 1), offset) === `${wrapper}(`) return match;
      changed++;
      return `${wrapper}(${match})`;
    });
    scope = scan(source);
  }

  if (!changed) {
    results.push({ file, changed: 0, note: "no read site matched" });
    continue;
  }

  if (isClient) {
    if (!source.includes('from "@/components/useLocalizedData"')) {
      source = source.replace(/^("use client";\n)/, '$1import { useLocalizedData } from "@/components/useLocalizedData";\n');
    }
  } else if (!source.includes("trData")) {
    // handled below
  }
  if (!isClient && !/import \{[^}]*trData[^}]*\} from "@\/lib\/localizeContent"/.test(source)) {
    const existing = source.match(/import \{([^}]*)\} from "@\/lib\/localizeContent";/);
    if (existing) {
      source = source.replace(existing[0], `import {${existing[1].replace(/\s*$/, "")}, trData } from "@/lib/localizeContent";`);
    } else {
      // Insert after the last top-of-file import, so a multi-line import
      // statement is never split down the middle.
      const imports = [...source.matchAll(/^import [\s\S]*?;$/gm)];
      const last = imports[imports.length - 1];
      if (!last) {
        results.push({ file, changed: 0, note: "no import to anchor to" });
        continue;
      }
      const at = last.index + last[0].length;
      source = source.slice(0, at) + '\nimport { trData } from "@/lib/localizeContent";' + source.slice(at);
    }
  }

  if (!DRY) fs.writeFileSync(file, source, "utf8");
  results.push({ file, changed, wrapper });
}

const touched = results.filter((r) => r.changed > 0);
console.log(`${DRY ? "would wrap" : "wrapped"} ${touched.reduce((s, r) => s + r.changed, 0)} read sites in ${touched.length} files`);
for (const r of touched) console.log(`  ${String(r.changed).padStart(3)}  ${r.wrapper.padEnd(18)} ${r.file}`);
for (const r of results.filter((r) => !r.changed)) console.log(`  --   skipped           ${r.file} (${r.note})`);
