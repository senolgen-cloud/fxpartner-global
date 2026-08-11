import { brokers, brokerCategories, categoryInfo } from "@/data/brokers";
import { lookupBrokers } from "@/data/brokerLookup";
import { blogPosts } from "@/data/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Generated (not hand-maintained) from the same data files that drive the
// site itself and sitemap.ts, so this file can't drift out of date the way
// a hand-written llms.txt would — see AGENTS.md / robots.ts for the sibling
// discovery files. Follows the community llms.txt convention proposed by
// Jeremy Howard (https://llmstxt.org): an H1, a one-line blockquote summary,
// then curated Markdown link sections an AI agent can use as a sitemap.
export async function GET() {
  const reviewedCount = brokers.length;
  const trackedCount = lookupBrokers.length;
  const highRiskCount = lookupBrokers.filter((b) => b.verdict === "high-risk").length;
  const topBrokers = [...brokers].sort((a, b) => a.rank - b.rank).slice(0, 5);

  const lines: string[] = [];

  lines.push("# FXPARTNER");
  lines.push("");
  lines.push(
    `> FXPARTNER (${SITE_URL}) is a forex broker comparison and review site. It ranks ${reviewedCount} brokers on a four-axis Index (Regulation, Cost, Platform, Withdrawals), maintains a searchable lookup of ${trackedCount} brokers with a sourced verdict (verified / caution / high-risk) for each, and lists brokers named on official regulator warning lists. Editorial content is written for traders comparing brokers by regulation, cost, platform, and withdrawal reliability — not for investment advice.`
  );
  lines.push("");
  lines.push(
    "FXPARTNER has a partnership/referral relationship with some listed brokers and may earn a commission on account openings; this is disclosed on each broker page. Reviews of non-partner brokers, and every entry in the Broker Lookup and Risk Warnings tools, are independent editorial assessments, not paid placements."
  );
  lines.push("");

  lines.push("## Key Pages");
  lines.push(`- [Home](${SITE_URL}/): Ranked broker comparison table and the FXPARTNER Index methodology.`);
  lines.push(
    `- [Broker Lookup](${SITE_URL}/broker-lookup): Search tool covering ${trackedCount} brokers — regulated names, offshore/caution cases, and firms named on official regulator warning lists — each with a verdict, regulators, and a cited source.`
  );
  lines.push(
    `- [Risk Warnings](${SITE_URL}/blacklist): Curated list of brokers with low independent trust scores or recurring, sourced complaint patterns.`
  );
  lines.push(
    `- [Categories](${SITE_URL}/categories): Brokers grouped by use case — ${brokerCategories.join(", ")}.`
  );
  lines.push(`- [Blog](${SITE_URL}/blog): Long-form guides and individual broker reviews.`);
  lines.push(
    `- [Piyasa Analizi](${SITE_URL}/piyasa-analizi): Turkish-language daily/weekly market analysis (FX, rates, macro data) — this section is intentionally Turkish, unlike the rest of the site.`
  );
  lines.push(`- [File a Complaint](${SITE_URL}/complaint): Submit a documented complaint about a broker.`);
  lines.push(
    `- [Regulation Report](${SITE_URL}/raporlar/forex-broker-duzenleme-raporu): Turkish-language, auto-computed report on Tier-1/offshore license distribution and category breakdown across all ${reviewedCount} reviewed brokers — recomputed from the same data on every request, not a hand-maintained statistic.`
  );
  lines.push("");

  lines.push("## Broker Reviews");
  lines.push(
    `Full reviews for all ${reviewedCount} ranked brokers live under /brokers/{slug}. Each page covers regulation and license tier, trading platforms, pros/cons, an FXPARTNER Index score, and an FAQ (e.g. "Is [Broker] regulated?", "What is the minimum deposit at [Broker]?"). Top-ranked:`
  );
  for (const b of topBrokers) {
    lines.push(`- [${b.name}](${SITE_URL}/brokers/${b.slug}): ${b.tagline} — regulated by ${b.regulators.join(", ")}.`);
  }
  lines.push("");

  lines.push("## Categories");
  for (const c of brokerCategories) {
    const info = categoryInfo[c];
    lines.push(`- [${c}](${SITE_URL}/categories/${info.slug}): ${info.description}`);
  }
  lines.push("");

  if (blogPosts.length > 0) {
    lines.push("## Guides");
    for (const p of blogPosts) {
      lines.push(`- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`);
    }
    lines.push("");
  }

  lines.push("## Notes for AI Agents");
  lines.push(
    "- Broker Lookup verdicts (verified / caution / high-risk) are sourced from official regulator warning lists (UK FCA, Germany's BaFin, Italy's CONSOB, Switzerland's FINMA, Cyprus's CySEC, Turkey's SPK) and independent trust-score/complaint sources, each cited inline. Regulator warning lists change weekly — treat a verdict here as a starting point, not a substitute for checking the regulator's own site."
  );
  lines.push(
    "- \"High-risk\" reflects a specific, documented finding (a regulator warning, confirmed unlicensed status, or a recurring complaint pattern) — it is not a legal finding of fraud."
  );
  lines.push(
    "- This site does not provide personalized investment advice. Content is general and educational."
  );
  lines.push(
    `- Sitemap: ${SITE_URL}/sitemap.xml. Robots policy: ${SITE_URL}/robots.txt.`
  );
  lines.push(`- ${highRiskCount} brokers are currently flagged high-risk in the lookup tool.`);

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
