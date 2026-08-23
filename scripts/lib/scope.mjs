// Where in a source file is it safe to put a translation call?
//
// Shared by the wiring codemods and by check-module-scope-tr.mjs, because
// they need the same two answers and getting either wrong is silent:
//
//   inert[i]  — index i is inside a comment or a string. A codemod that
//               ignores this rewrites prose: "see propFirms.ts" in a doc
//               comment became "see trData(propFirms).ts".
//
//   eager     — spans of top-level `const|let|var` initialisers. They run
//               once, when the module is imported, so a translation call
//               inside one resolves against no request and freezes whichever
//               locale answered first. A function *declaration* is deferred
//               and therefore fine.
//
// This is a scanner, not a parser. It handles the shapes this codebase
// actually contains; anything exotic should be done by hand.

export function scan(source) {
  const depth = new Int32Array(source.length);
  const inert = new Uint8Array(source.length);
  let level = 0;
  let quote = null;
  let comment = null; // "line" | "block"

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    depth[i] = level;
    if (comment || quote) inert[i] = 1;

    if (comment === "line") { if (ch === "\n") comment = null; continue; }
    if (comment === "block") { if (ch === "*" && next === "/") { inert[i + 1] = 1; comment = null; i++; } continue; }
    if (quote) {
      if (ch === "\\") { inert[i + 1] = 1; i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && next === "/") { comment = "line"; inert[i] = inert[i + 1] = 1; i++; continue; }
    if (ch === "/" && next === "*") { comment = "block"; inert[i] = inert[i + 1] = 1; i++; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; inert[i] = 1; continue; }
    if (ch === "{") level++;
    else if (ch === "}") level = Math.max(0, level - 1);
  }

  const eager = [];
  for (const m of source.matchAll(/^(?:export\s+)?(?:const|let|var)\s/gm)) {
    if (depth[m.index] !== 0 || inert[m.index]) continue;
    let end = m.index;
    for (; end < source.length; end++) {
      if (inert[end]) continue;
      if (source[end] === ";" && depth[end] === 0) break;
    }
    eager.push([m.index, end]);
  }

  return {
    depth,
    inert,
    eager,
    /** True when a call placed at `i` would run at import rather than per request. */
    runsAtImport(i) {
      return depth[i] === 0 || eager.some(([a, b]) => i > a && i < b);
    },
  };
}
