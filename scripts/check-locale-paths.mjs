// Checks that locale prefixing round-trips, for every locale.
//
//   node scripts/check-locale-paths.mjs
//
// splitLocale() once had an "except the default locale" condition, left over
// from when Turkish sat on the bare URL. After Turkish moved to /tr that
// condition was wrong, and nothing said so: splitLocale kept returning a
// path with the prefix still attached, and each caller went on to do
// something reasonable with a wrong input.
//
//   - LocaleSwitcher joined /ua to /tr/blog/x and linked at /ua/tr/blog/x.
//   - useLocalePathname never matched, so no nav item was marked active.
//   - proxy.ts asked path.startsWith("/admin"); "/tr/admin" does not, so the
//     admin guard stopped running and /tr/admin/cashback served the panel
//     unauthenticated.
//
// The property that would have caught all three in one line is that
// splitLocale is the inverse of localePath. That is what this asserts, for
// every locale and a spread of real paths — no locale gets to be a special
// case, which is exactly what went wrong.

import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

// i18n.ts is TypeScript. Rather than stripping types with regexes — which is
// its own quiet source of drift — hand it to the compiler that is already a
// dependency, so this file tests the real source and nothing else.
const SOURCE = "src/lib/i18n.ts";
const src = fs.readFileSync(SOURCE, "utf8");

const ts = (await import("typescript")).default;
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;

const tmp = path.join(process.cwd(), "node_modules", ".cache", "check-locale-paths.compiled.mjs");
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, js);

const { locales, localePath, splitLocale, defaultLocale } = await import(
  pathToFileURL(tmp).href + "?t=" + Date.now()
);

// Paths as the rest of the app writes them: no prefix, Turkish spelling.
const PATHS = [
  "/",
  "/brokerlar",
  "/signals",
  "/admin",
  "/admin/cashback",
  "/account",
  "/account/login",
  "/blog/some-post",
  "/prop-firmalar/ftmo",
  "/cashback/xm/setup",
];

const problems = [];
let checked = 0;

for (const locale of locales) {
  for (const p of PATHS) {
    const url = localePath(locale, p);
    const back = splitLocale(url);
    checked++;

    if (back.locale !== locale) {
      problems.push(
        `localePath(${locale}, "${p}") = "${url}", but splitLocale reads that as locale "${back.locale}"`
      );
    }
    if (back.path !== p) {
      problems.push(
        `localePath(${locale}, "${p}") = "${url}", but splitLocale gives back path "${back.path}" — the prefix survived`
      );
    }
    // The guard that actually broke: a prefixed URL must never re-prefix.
    const doubled = localePath(locale, back.path);
    if (doubled !== url) {
      problems.push(`round-trip is not stable: "${url}" -> "${doubled}"`);
    }
  }
}

// A path carrying no prefix at all reports the default locale and comes back
// untouched. proxy.ts redirects these and reads this result to know where to.
for (const p of PATHS) {
  checked++;
  const back = splitLocale(p);
  if (p === "/") continue; // "/" has no first segment either way
  if (back.locale !== defaultLocale || back.path !== p) {
    problems.push(
      `unprefixed "${p}" should read as {${defaultLocale}, "${p}"}, got {${back.locale}, "${back.path}"}`
    );
  }
}

if (!problems.length) {
  console.log(
    `locale prefixing round-trips for every locale (${checked} cases checked)`
  );
  process.exit(0);
}

console.error(`${problems.length} locale path problem(s):\n`);
for (const p of problems) console.error(`  ${p}`);
console.error(
  "\nsplitLocale must be the exact inverse of localePath, with no locale\n" +
    "treated as a special case. See the note above splitLocale in src/lib/i18n.ts."
);
process.exit(1);
