import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/lib/i18n";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Paths kept out of every crawler below: /account and /admin are
// authenticated/operator-only surfaces with no indexable content, and
// /api is a data/RPC layer, not a page — none of it is useful for search
// or AI ingestion, and no business reason exists to expose it deliberately.
// Locale-prefixed too: /ua/account is the same authenticated surface as
// /account, and a crawler that only knows the Turkish path would happily
// index the Ukrainian one.
const PRIVATE_PATHS = ["/account", "/admin"];
const DISALLOW = [
  ...PRIVATE_PATHS,
  ...locales
    .filter((l) => l !== defaultLocale)
    .flatMap((l) => PRIVATE_PATHS.map((path) => `/${l}${path}`)),
  "/api/",
];

// AI search-augmented crawlers: fetch content live to answer a specific
// user question and cite the source. Allowing these drives direct
// referral traffic, same category as allowing Googlebot/Bingbot.
const AI_SEARCH_AGENTS = [
  "PerplexityBot",
  "OAI-SearchBot", // OpenAI's search-answer crawler (distinct from GPTBot's training crawl)
];

// AI assistant "browsing on behalf of a user" agents: fetch a page live
// because a person asked ChatGPT/Claude/etc. to look at it right now.
const AI_USER_TRIGGERED_AGENTS = [
  "ChatGPT-User",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
];

// AI training / general-purpose crawlers: build the corpus and/or serve
// citations in chat answers later. FXPARTNER's default posture is to
// allow these — being absent from these corpora means being invisible
// when someone asks ChatGPT/Claude/Gemini "is XM regulated" or "forex
// broker comparison." Revisit only if there's a specific documented
// licensing reason to block one.
const AI_TRAINING_AGENTS = [
  "GPTBot",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "cohere-ai",
  "Meta-ExternalAgent",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  const allowedAiAgents = Array.from(
    new Set([...AI_SEARCH_AGENTS, ...AI_USER_TRIGGERED_AGENTS, ...AI_TRAINING_AGENTS])
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: allowedAiAgents,
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
