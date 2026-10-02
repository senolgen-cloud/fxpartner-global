import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { outboundClicks } from "@/db/schema";
import { getAttribution } from "@/lib/visitor";

// Siteden çıkan link tıklamaları — OutboundClickTracker'ın sendBeacon'ı.
//
// Herkese açık bir uç nokta, o yüzden gelen her alan kısaltılıyor ve href
// gerçek bir dış http(s) adresi değilse kayıt düşülmüyor. Hata hiçbir zaman
// okura yansımaz: tıklama zaten gerçekleşti, kayıt yalnızca bir istatistik.
const SITE_HOST = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global").hostname;

function clip(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (raw.length > 4096) return new NextResponse(null, { status: 413 });
    const body = JSON.parse(raw) as Record<string, unknown>;

    const href = clip(body.href, 1000);
    const path = clip(body.path, 255);
    if (!href || !path) return new NextResponse(null, { status: 400 });

    let url: URL;
    try {
      url = new URL(href);
    } catch {
      return new NextResponse(null, { status: 400 });
    }
    const host = url.hostname.toLowerCase();
    if ((url.protocol !== "https:" && url.protocol !== "http:") || host === SITE_HOST || host.endsWith(`.${SITE_HOST}`)) {
      return new NextResponse(null, { status: 400 });
    }

    const { source, campaign } = await getAttribution();
    await db.insert(outboundClicks).values({
      href: url.toString().slice(0, 1000),
      host: host.slice(0, 255),
      path,
      placement: clip(body.placement, 64),
      source,
      campaign,
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("outbound click not recorded —", err);
    return new NextResponse(null, { status: 204 });
  }
}
