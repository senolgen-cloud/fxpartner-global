import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const row = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
    columns: { coverImageData: true },
  });

  if (!row?.coverImageData) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = Buffer.from(row.coverImageData, "base64");
  return new Response(buffer, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
