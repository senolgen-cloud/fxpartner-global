"use server";

import { generateObject, generateImage } from "ai";
import { openai } from "@ai-sdk/openai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { brokers } from "@/data/brokers";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "senolgen@gmail.com";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) throw new Error("Not authorized");
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

export type BlogDraft = z.infer<typeof blogDraftSchema>;

export async function generateBlogDraft(
  _prev: { slug: string | null; title: string | null; error: string | null },
  formData: FormData,
): Promise<{ slug: string | null; title: string | null; error: string | null }> {
  await requireAdmin();

  const topic = String(formData.get("topic") || "").trim();
  const brokerSlug = String(formData.get("brokerSlug") || "").trim();
  const angle = String(formData.get("angle") || "").trim();

  if (!topic) {
    return { slug: null, title: null, error: "Topic is required." };
  }

  const broker = brokerSlug ? brokers.find((b) => b.slug === brokerSlug) : undefined;
  const brokerContext = broker
    ? `Focus broker facts (only use these — never invent numbers): ${JSON.stringify({
        name: broker.name,
        rating: broker.rating,
        minDeposit: broker.minDeposit,
        maxLeverage: broker.maxLeverage,
        regulators: broker.regulators,
        pros: broker.pros,
        cons: broker.cons,
        bestFor: broker.bestFor,
      })}`
    : "No specific broker — write a general educational piece.";

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: blogDraftSchema,
      system:
        "You are FXPARTNER's editorial assistant, drafting a blog post for a forex broker comparison site. Never guarantee returns or call anything risk-free. This is not investment advice. Write in a neutral, evidence-based tone — no hype, no superlatives without a stated reason.",
      prompt: `Topic: ${topic}\n${angle ? `Angle: ${angle}\n` : ""}${brokerContext}\n\nDraft a blog post matching the schema. 3-6 sections, each with 1-3 paragraphs. Include a "list" only where a bulleted breakdown genuinely helps (e.g. steps, criteria).`,
    });

    await db
      .insert(blogPosts)
      .values({
        slug: object.slug,
        title: object.title,
        excerpt: object.excerpt,
        readingMinutes: object.readingMinutes,
        sections: object.sections,
        source: "manual",
      })
      .onConflictDoUpdate({
        target: blogPosts.slug,
        set: {
          title: object.title,
          excerpt: object.excerpt,
          readingMinutes: object.readingMinutes,
          sections: object.sections,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/blog");
    revalidatePath(`/blog/${object.slug}`);

    return { slug: object.slug, title: object.title, error: null };
  } catch (err) {
    return { slug: null, title: null, error: err instanceof Error ? err.message : "Generation failed." };
  }
}

export async function generateCoverImage(
  _prev: { published: boolean; error: string | null },
  formData: FormData,
): Promise<{ published: boolean; error: string | null }> {
  await requireAdmin();

  const slug = String(formData.get("imageSlug") || "").trim();
  const title = String(formData.get("imageTitle") || "").trim();
  if (!slug || !title) {
    return { published: false, error: "Generate a post first." };
  }

  try {
    const { image } = await generateImage({
      model: openai.image("gpt-image-1"),
      prompt: `Editorial cover photo for a forex broker comparison blog post titled "${title}". Clean, professional, finance/fintech visual — charts, currency symbols, or trading desk imagery. No text or logos rendered in the image.`,
      size: "1536x1024",
    });

    await db
      .update(blogPosts)
      .set({ coverImageData: image.base64, updatedAt: new Date() })
      .where(eq(blogPosts.slug, slug));

    revalidatePath(`/blog/${slug}`);

    return { published: true, error: null };
  } catch (err) {
    return { published: false, error: err instanceof Error ? err.message : "Image generation failed." };
  }
}
