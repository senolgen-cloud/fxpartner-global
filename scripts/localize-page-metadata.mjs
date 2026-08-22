// Converts a page's static `export const metadata` into a per-locale
// generateMetadata that reads title and description from the dictionary and
// rewrites alternates for the locale.
//
//   node scripts/localize-page-metadata.mjs            # apply
//   node scripts/localize-page-metadata.mjs --dry      # report only
//
// Why it has to happen at all: a page that sets alternates.canonical replaces
// the layout's alternates object wholesale, hreflang included, so those pages
// were quietly dropping the language links the layout provides. Rebuilding
// the object per page puts them back.
//
// Only touches the simple shape — a static metadata object whose title and
// description are string literals. Pages that already compute their metadata
// are left alone and listed at the end for a human to look at.

import fs from "node:fs";
import { execSync } from "node:child_process";

const DRY = process.argv.includes("--dry");
const files = execSync("find 'src/app/[locale]' -name page.tsx", { encoding: "utf8" })
  .trim()
  .split("\n");

function keyFor(file, field) {
  const route = file.replace("src/app/[locale]", "").replace("/page.tsx", "") || "/";
  const base = route === "/" ? "home" : route.slice(1).replace(/\//g, ".");
  return `page.${base}.${field}`;
}

function routeOf(file) {
  return file.replace("src/app/[locale]", "").replace("/page.tsx", "") || "/";
}

const converted = [];
const skipped = [];

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");

  if (src.includes("export async function generateMetadata")) {
    skipped.push([file, "already computes its metadata"]);
    continue;
  }
  const start = src.indexOf("export const metadata: Metadata = {");
  if (start === -1) {
    skipped.push([file, "no static metadata export"]);
    continue;
  }
  // A dynamic route's params carry more than the locale; those pages need
  // their own handling.
  if (file.includes("[")) {
    const withoutLocale = file.replace("src/app/[locale]", "");
    if (withoutLocale.includes("[")) {
      skipped.push([file, "dynamic route"]);
      continue;
    }
  }

  const end = src.indexOf("\n};", start);
  if (end === -1) {
    skipped.push([file, "could not find the end of the object"]);
    continue;
  }

  const body = src.slice(start + "export const metadata: Metadata = {".length, end);
  const hasTitle = /\n\s*title:/.test(body);
  const hasDescription = /\n\s*description:/.test(body);
  if (!hasTitle && !hasDescription) {
    skipped.push([file, "metadata has neither title nor description"]);
    continue;
  }

  // Rebuild the object: title/description come from the dictionary, the
  // canonical gets the locale prefix, and the language set is restated.
  const lines = body.split("\n");
  const kept = [];
  let depth = 0;
  for (const line of lines) {
    const t = line.trim();
    if (depth === 0 && (t.startsWith("title:") || t.startsWith("description:"))) {
      // skip the literal, including a value that sits on the next line
      if (!t.endsWith(",")) depth = -1;
      continue;
    }
    if (depth === -1) {
      if (t.endsWith(",")) depth = 0;
      continue;
    }
    if (depth === 0 && t.startsWith("alternates:")) {
      if (!t.includes("}")) depth = 1;
      continue;
    }
    if (depth === 1) {
      if (t.startsWith("}")) depth = 0;
      continue;
    }
    kept.push(line);
  }

  const route = routeOf(file);
  const rebuilt = [
    "export async function generateMetadata({",
    "  params,",
    "}: {",
    "  params: Promise<{ locale: string }>;",
    "}): Promise<Metadata> {",
    "  const { locale: rawLocale } = await params;",
    "  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;",
    "  const t = getDictionary(locale);",
    "",
    "  return {",
    hasTitle ? `    title: t[${JSON.stringify(keyFor(file, "title"))}],` : null,
    hasDescription ? `    description: t[${JSON.stringify(keyFor(file, "description"))}],` : null,
    "    alternates: {",
    `      canonical: localePath(locale, ${JSON.stringify(route)}),`,
    "      languages: Object.fromEntries(",
    `        locales.map((l) => [hreflangCode[l], localePath(l, ${JSON.stringify(route)})])`,
    "      ),",
    "    },",
    ...kept.map((l) => l.replace(/^ {2}/, "    ")).filter((l) => l.trim()),
    "  };",
    "}",
  ]
    .filter((l) => l !== null)
    .join("\n");

  let out = src.slice(0, start) + rebuilt + src.slice(end + "\n};".length);

  if (!out.includes('from "@/lib/dictionary"')) {
    out = out.replace(
      /^(import .*\n)/,
      '$1import { getDictionary } from "@/lib/dictionary";\nimport { defaultLocale, hreflangCode, isLocale, locales, localePath, type Locale } from "@/lib/i18n";\n'
    );
  }

  if (!DRY) fs.writeFileSync(file, out, "utf8");
  converted.push(file);
}

console.log(`${DRY ? "would convert" : "converted"}: ${converted.length}`);
for (const f of converted) console.log("  " + f);
console.log(`\nleft alone: ${skipped.length}`);
for (const [f, why] of skipped) console.log(`  ${f}\n    ${why}`);
