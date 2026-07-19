"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateCountry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;
  const country = String(formData.get("country") || "").trim();
  await db
    .update(users)
    .set({ country: country || null })
    .where(eq(users.id, session.user.id));
  revalidatePath("/account");
}
