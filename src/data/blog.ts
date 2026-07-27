import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts as blogPostsTable, type BlogSection } from "@/db/schema";

export type { BlogSection };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingMinutes: number;
  sections: BlogSection[];
  // Served from src/app/blog/cover/[slug]/route.ts — present only when a
  // cover image has been generated for this post.
  coverImage?: string;
}

function toBlogPost(row: typeof blogPostsTable.$inferSelect): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: row.publishedAt.toISOString().slice(0, 10),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString().slice(0, 10) : undefined,
    readingMinutes: row.readingMinutes,
    sections: row.sections,
    coverImage: row.coverImageData ? `/blog/cover/${row.slug}` : undefined,
  };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const rows = await db.query.blogPosts.findMany({
    orderBy: desc(blogPostsTable.publishedAt),
  });
  return rows.map(toBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const row = await db.query.blogPosts.findFirst({
    where: eq(blogPostsTable.slug, slug),
  });
  return row ? toBlogPost(row) : undefined;
}
