// Makes every page record its locale before it renders anything.
//
//   node scripts/set-page-locale.mjs [--dry]
//
// The layout does this too, but too late: metadata and the page body run in
// render passes where the layout's write hasn't happened yet, so tr() in a
// server component read the default and returned Turkish inside /ua. Setting
// it at the top of the page's own body is ordered correctly by construction —
// a component's body always runs before its children render.
//
// Pages that already destructure params get locale added to that destructure;
// sync pages become async, which a server component is free to be.

import fs from "node:fs";
import { execSync } from "node:child_process";

const DRY = process.argv.includes("--dry");
const files = execSync("find 'src/app/[locale]' -name page.tsx", { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

const IMPORTS = 'import { setServerLocale } from "@/lib/serverLocale";';
const I18N_IMPORT = 'import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";';

const done = [];
const skipped = [];

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");

  if (src.includes("setServerLocale(")) {
    skipped.push([file, "already sets it"]);
    continue;
  }

  const decl = src.match(
    /export default (async )?function ([A-Za-z0-9_]+)\(\s*(\{[^}]*\})?\s*(:\s*\{[\s\S]*?\})?\s*\)\s*\{/
  );
  if (!decl) {
    skipped.push([file, "default export isn't a plain function"]);
    continue;
  }

  const [whole, isAsync, name, destructure] = decl;

  // Rebuild the signature with params in it.
  let signature;
  if (!destructure) {
    signature = `export default async function ${name}({\n  params,\n}: {\n  params: Promise<{ locale: string }>;\n}) {`;
  } else if (destructure.includes("params")) {
    // params already there; the type may or may not mention locale, and adding
    // it is what makes the destructure below type-check.
    signature = whole.replace("export default function", "export default async function");
    src = src.replace(/params: Promise<\{([^}]*)\}>/, (m, inner) =>
      inner.includes("locale") ? m : `params: Promise<{${inner.replace(/\s*$/, "")} locale: string }>`
    );
  } else {
    skipped.push([file, "destructures something other than params"]);
    continue;
  }

  const body = `\n  const { locale: pageLocale } = await params;\n  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);\n`;

  src = src.replace(decl[0], signature + body);

  if (!src.includes(IMPORTS)) {
    const lines = src.split("\n");
    let last = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) last = i;
    const toAdd = [IMPORTS];
    if (!src.includes('from "@/lib/i18n"')) toAdd.push(I18N_IMPORT);
    lines.splice(last + 1, 0, ...toAdd);
    src = lines.join("\n");
  } else if (!src.includes('from "@/lib/i18n"')) {
    src = src.replace(IMPORTS, IMPORTS + "\n" + I18N_IMPORT);
  }

  if (!DRY) fs.writeFileSync(file, src, "utf8");
  done.push(file);
}

console.log(`${DRY ? "would patch" : "patched"} ${done.length} pages`);
for (const f of done.slice(0, 50)) console.log("  " + f);
console.log(`\nleft alone: ${skipped.length}`);
for (const [f, why] of skipped) console.log(`  ${f}\n    ${why}`);
