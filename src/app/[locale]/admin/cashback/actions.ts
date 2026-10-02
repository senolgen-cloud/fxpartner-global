"use server";

import { db } from "@/db";
import {
  cashbackAccounts,
  cashbackRecords,
  cashbackLeads,
  type CashbackAccountStatus,
  type CashbackLeadStatus,
} from "@/db/schema";
import { auth } from "@/auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { grantCashbackProTrial } from "@/lib/subscription";
import { sendProTrialEmail } from "@/lib/subscriptionEmails";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "senolgen@gmail.com";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) throw new Error("Not authorized");
}

export async function setAccountStatus(accountId: string, status: CashbackAccountStatus) {
  await requireAdmin();
  // Stamped so the member's notifications can say when we answered.
  // created_at is when they applied, which is a different date entirely.
  await db
    .update(cashbackAccounts)
    .set({ status, statusChangedAt: sql`now()` })
    .where(eq(cashbackAccounts.id, accountId));

  // A member's first verified account earns one free Pro month
  // (docs/ekim-2026-yukselis-plani.md, Hamle 2). The verification itself is
  // already saved above; a failure to grant or to email must not undo it,
  // and grantCashbackProTrial is once-per-member so re-verifying is safe.
  if (status === "verified") {
    const [account] = await db
      .select({ userId: cashbackAccounts.userId })
      .from(cashbackAccounts)
      .where(eq(cashbackAccounts.id, accountId))
      .limit(1);
    if (account?.userId) {
      try {
        const granted = await grantCashbackProTrial(account.userId);
        if (granted?.email) {
          await sendProTrialEmail({
            to: granted.email,
            name: granted.name,
            tier: granted.tier,
            until: granted.currentPeriodEnd,
          });
        }
      } catch (err) {
        console.error("cashback Pro month could not be granted —", err);
      }
    }
  }

  revalidatePath("/admin/cashback");
}

export async function setLeadStatus(leadId: string, status: CashbackLeadStatus) {
  await requireAdmin();
  await db.update(cashbackLeads).set({ status }).where(eq(cashbackLeads.id, leadId));
  revalidatePath("/admin/cashback");
}

export async function addCashbackRecord(formData: FormData) {
  await requireAdmin();
  const accountId = String(formData.get("accountId") || "");
  const period = String(formData.get("period") || "").trim();
  const amountUsd = String(formData.get("amountUsd") || "").trim();
  const note = String(formData.get("note") || "").trim();

  if (!accountId || !period || !amountUsd) return;

  await db.insert(cashbackRecords).values({
    accountId,
    period,
    amountUsd,
    note: note || null,
  });

  revalidatePath("/admin/cashback");
}
