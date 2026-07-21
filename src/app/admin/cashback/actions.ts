"use server";

import { db } from "@/db";
import { cashbackAccounts, cashbackRecords, type CashbackAccountStatus } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "senolgen@gmail.com";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) throw new Error("Not authorized");
}

export async function setAccountStatus(accountId: string, status: CashbackAccountStatus) {
  await requireAdmin();
  await db.update(cashbackAccounts).set({ status }).where(eq(cashbackAccounts.id, accountId));
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
