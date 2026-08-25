"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ACCENT_IDS } from "@/lib/accents";

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

// One action for the whole profile card rather than one per field. A member
// edits a profile, not four independent settings, and four actions would mean
// four round trips and four chances for half of it to save.
//
// Every value is validated against what it is allowed to be: an accent has to
// be one of the six, a broker has to exist in the directory, a country has to
// be a two-letter code. The form only ever offers valid options, so anything
// else arrived by hand.

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const displayName = String(formData.get("displayName") || "").trim().slice(0, 40);
  const accentRaw = String(formData.get("accentColor") || "").trim();
  const countryRaw = String(formData.get("country") || "").trim().toUpperCase();
  const brokerRaw = String(formData.get("preferredBroker") || "").trim();

  const { brokers: brokerList } = await import("@/data/brokers");
  const brokerSlugs = new Set(brokerList.map((b) => b.slug));

  await db
    .update(users)
    .set({
      name: displayName || null,
      accentColor: ACCENT_IDS.has(accentRaw) ? accentRaw : null,
      country: /^[A-Z]{2}$/.test(countryRaw) ? countryRaw : null,
      preferredBroker: brokerSlugs.has(brokerRaw) ? brokerRaw : null,
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/account");
}
