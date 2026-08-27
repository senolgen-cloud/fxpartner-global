import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consentRecords } from "@/db/schema";
import { POLICY_VERSION, type Decision } from "@/lib/consent";
import { isLocale } from "@/lib/i18n";

// Writes one row per answer to the cookie banner and hands back its id,
// which the banner then stores in the cookie. See consentRecords in
// src/db/schema.ts for why the id is generated here rather than reusing
// anything already identifying the browser.
//
// The banner sets its cookie whether or not this succeeds. A reader who
// says no must have that honoured even if our database is down — the
// record is evidence for us, never a condition of their choice.

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let decision: Decision;
  let locale: string | null = null;
  try {
    const body = await req.json();
    if (body?.decision !== "all" && body?.decision !== "essential") {
      return NextResponse.json({ error: "bad decision" }, { status: 400 });
    }
    decision = body.decision;
    locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : null;
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  try {
    await db.insert(consentRecords).values({
      id,
      decision,
      policyVersion: POLICY_VERSION,
      locale,
      // Coarse enough to evidence which regime applied, and not an
      // identifier. No IP is stored anywhere in this row.
      country: req.headers.get("x-vercel-ip-country"),
      // Evidence of which browser answered, truncated because the full
      // string is long and none of it is looked up.
      userAgent: req.headers.get("user-agent")?.slice(0, 200) ?? null,
    });
  } catch (err) {
    console.error("consent record insert failed:", err);
    // 200 with no id: the banner proceeds, the cookie is written without a
    // record id, and the reader's choice still takes effect.
    return NextResponse.json({ id: null }, { status: 200 });
  }

  return NextResponse.json({ id });
}
