import { NextRequest, NextResponse } from "next/server";
import { generateObject, generateImage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { gte } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { buildBrokerDirectory } from "@/lib/aiAssistant";

// Owned by AI Danışman Departmanı (Ada Yalman) — see src/lib/departments.ts
// and docs/ORGANIZATION.md. Unlike every other cron in this repo, this one
// runs on a real `schedule:` from day one (not workflow_dispatch-only),
// and publishes without human review — both at the site owner's explicit,
// informed request. See ORGANIZATION.md for the tradeoff this skips.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Small rotating list of evergreen topics — there's no admin picking a
// topic in an unattended run, so we cycle through these deterministically
// by ISO week number instead of picking randomly, so re-runs in the same
// week (e.g. a manual workflow_dispatch retry) land on the same topic.
const TOPICS = [
  "How spreads and commissions actually work, and why they vary between account types",
  "What negative balance protection is and why it matters when markets gap",
  "How to read a broker's regulatory license and what Tier-1 vs offshore really means",
  "Why withdrawal speed is a better trust signal than a broker's marketing page",
  "Micro vs standard vs ECN accounts: what actually changes for a new trader",
  "How leverage limits differ by country and why that's a regulation, not a broker choice",
];

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

const blogDraftSchema = z.object({
  slug: z.string().describe("URL-safe kebab-case slug"),
  title: z.string(),
  excerpt: z.string(),
  readingMinutes: z.number().int().min(1).max(30),
  sections: z.array(
    z.object({
      heading: z.string().optional(),
      paragraphs: z.array(z.string()),
      list: z.array(z.string()).optional(),
    }),
  ),
});

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const alreadyPostedToday = await db.query.blogPosts.findFirst({
    where: gte(blogPosts.publishedAt, startOfToday),
    columns: { id: true },
  });
  if (alreadyPostedToday) {
    return NextResponse.json({ ok: true, skipped: "already posted today" });
  }

  const topic = TOPICS[isoWeekNumber(new Date()) % TOPICS.length];

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: blogDraftSchema,
    system: `You are FXPARTNER's editorial assistant, writing an unattended, automatically-published blog post for a forex broker comparison site. Never guarantee returns or call anything risk-free — this is not investment advice. Write in a neutral, evidence-based tone. Ground any broker-specific claim only in this directory, never invent numbers:\n${buildBrokerDirectory()}`,
    prompt: `Topic: ${topic}\n\nDraft a blog post matching the schema. 3-6 sections, each with 1-3 paragraphs. Include a "list" only where a bulleted breakdown genuinely helps.`,
  });

  const { image } = await generateImage({
    model: openai.image("gpt-image-1"),
    prompt: `Editorial cover photo for a forex broker comparison blog post titled "${object.title}". Clean, professional, finance/fintech visual — charts, currency symbols, or trading desk imagery. No text or logos rendered in the image.`,
    size: "1536x1024",
  });

  await db
    .insert(blogPosts)
    .values({
      slug: object.slug,
      title: object.title,
      excerpt: object.excerpt,
      readingMinutes: object.readingMinutes,
      sections: object.sections,
      coverImageData: image.base64,
      source: "ai-auto",
    })
    .onConflictDoNothing({ target: blogPosts.slug });

  return NextResponse.json({ ok: true, slug: object.slug });
}
