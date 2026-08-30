import { NextRequest, NextResponse } from "next/server";
import { getTickerPairs } from "@/lib/rates";
import { brokers } from "@/data/brokers";
import { db } from "@/db";
import { aiAssistantLogs } from "@/db/schema";
import { getViewerAccess, hasTierAccess } from "@/lib/tierAccess";
import { and, eq, gte } from "drizzle-orm";
import { GEMINI_URL } from "@/lib/gemini";

/**
 * Questions a signed-in free member may ask per day.
 *
 * Not a pricing rule so much as a spending one: each answer costs money per
 * call and the free tier costs the member nothing, so without a ceiling the
 * bill has no ceiling either. Pro and VIP are not counted at all.
 *
 * One number, in one place, meant to be changed.
 */
const AI_FREE_DAILY_LIMIT = 3;

// Midnight in Istanbul rather than UTC: the allowance should reset when the
// member's day does, and this audience sits almost entirely in one timezone.
// Reusing the same DISPLAY_TZ the calendar and the signal board already use.
function startOfLocalDay(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const secondsIntoDay = get("hour") * 3600 + get("minute") * 60 + get("second");
  return new Date(Date.now() - secondsIntoDay * 1000);
}

async function countQuestionsToday(userId: string): Promise<number> {
  const rows = await db
    .select({ id: aiAssistantLogs.id })
    .from(aiAssistantLogs)
    .where(and(eq(aiAssistantLogs.userId, userId), gte(aiAssistantLogs.createdAt, startOfLocalDay())));
  return rows.length;
}

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

type ChatMessage = { role: "user" | "assistant"; content: string };

// One line per broker so the assistant links to our own referral URL
// instead of inventing or linking to a broker's raw homepage — every
// click through that link earns FXPARTNER a commission.
function brokerLinkLines() {
  return brokers
    .map((b) => {
      const base = `- ${b.name}: referans linki ${b.referralUrl} | site incelemesi ${SITE_URL}/brokers/${b.slug}`;
      const promo = BROKER_PROMO_NOTES[b.slug];
      return promo ? `${base} | özel avantaj: ${promo}` : base;
    })
    .join("\n");
}

// Broker-specific promotional notes surfaced only in AI assistant replies
// (distinct from the structured, page-rendered `promotion` field in
// src/data/brokers.ts, which is reserved for the broker's own verified
// campaigns) — the model is instructed to weave these in naturally when
// that broker comes up, not recite them verbatim.
const BROKER_PROMO_NOTES: Record<string, string> = {
  "lite-finance":
    "FXPARTNER'e özel %20 Marjin Destek Bonusu — hesap açılışında Ortak Kodu alanına 667827970 girilerek etkinleştirilir ve LiteFinance'daki birçok ek avantajın kilidini açar.",
};

// Google Translate language codes (matching src/lib/countryLanguages.ts,
// the site's own LanguageSwitcher) -> a plain English name Gemini can act
// on reliably. Falls back to Intl.DisplayNames for anything not listed
// here rather than needing every possible code hardcoded.
function languageName(code: string): string {
  const KNOWN: Record<string, string> = {
    en: "English",
    tr: "Turkish",
    de: "German",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    nl: "Dutch",
    pt: "Portuguese",
    ru: "Russian",
    pl: "Polish",
    el: "Greek",
    ar: "Arabic",
    id: "Indonesian",
    ms: "Malay",
    vi: "Vietnamese",
    th: "Thai",
    ja: "Japanese",
    ko: "Korean",
    "zh-CN": "Simplified Chinese",
  };
  if (KNOWN[code]) return KNOWN[code];
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? "English";
  } catch {
    return "English";
  }
}

// Keeps the request small and on-topic — this assistant only talks about
// forex/market analysis, not general chit-chat, coding help, etc.
function buildSystemPrompt(tickerLine: string, targetLanguage: string) {
  return `Sen FXPARTNER sitesinin Yapay Zeka Piyasa Asistanısın. Forex pariteleri, altın/petrol, makroekonomik veriler (CPI, NFP, faiz kararları) ve teknik/temel analiz stratejileri hakkında sorulara yanıt veriyorsun.

Güncel piyasa verileri (referans amaçlı, gecikmeli olabilir):
${tickerLine}

Sitede incelenen brokerlar ve linkleri:
${brokerLinkLines()}

Kurallar:
- Sadece finans/forex/piyasa konularında yanıt ver. Konu dışı sorularda kibarca konuyu piyasa analizine yönlendir.
- Kısa, net ve eğitici cevaplar ver. Gerektiğinde madde işaretleri kullan.
- ASLA doğrudan yatırım tavsiyesi verme ("şunu al", "şimdi sat" gibi kesin talimatlar verme). Senaryo ve olasılık dilinde konuş ("X olursa, genellikle Y beklenir" gibi).
- Uydurma fiyat, veri veya haber verme. Emin olmadığın konularda bunu belirt.
- Kullanıcı yukarıdaki listede bulunan bir brokeri sorarsa (örn. "XM güvenilir mi?", "IC Markets nasıl?"), cevabında MUTLAKA o brokerin markdown formatındaki referans linkini ve/veya site incelemesi linkini ver. Listede olmayan bir broker sorulursa, onun hakkında sitede bilgi bulunmadığını belirt ve link uydurma.
- Bir brokerin yanında "özel avantaj" notu varsa, bunu cevabına kurumsal ve akıcı bir dille, doğal bir cümle içinde dahil et (madde madde kopyalama, düz metin olarak anlat). Bu notu sadece o broker sorulduğunda kullan, başka brokerlere uygulama veya uydurma.
- MUTLAKA yalnızca ${targetLanguage} dilinde yanıt ver — ziyaretçi sitede bu dili seçmiş durumda. Kullanıcı farklı bir dilde yazsa bile ${targetLanguage} dilinde yanıtlamaya devam et; dil değiştirme.`;
}

async function formatTickerLine(): Promise<string> {
  try {
    const pairs = await getTickerPairs();
    return pairs.map((p) => `${p.symbol}: ${p.value}${p.delta ? ` (${p.delta})` : ""}`).join(", ");
  } catch {
    return "Şu an canlı veri alınamadı.";
  }
}

// Occasionally the model leaks its own internal self-check instead of an
// actual answer — e.g. "German language? Yes. * Financial/Forex focus?
// Yes. * Concise...? Yes." That reads as a checklist of yes/no questions
// about the reply, not a reply itself, so it's a distinctive enough shape
// to catch and retry rather than show to a visitor.
function looksLikeLeakedSelfCheck(reply: string): boolean {
  const yesNoPattern = /\b(yes|no)\.?\s*(\*|\n|$)/gi;
  const matches = reply.slice(0, 300).match(yesNoPattern);
  return (matches?.length ?? 0) >= 2 && /\?\s*(yes|no)/i.test(reply.slice(0, 300));
}

type GeminiResult = { ok: true; reply: string } | { ok: false; status: number; errText: string };

async function callGemini(apiKey: string, contents: unknown, systemPrompt: string): Promise<GeminiResult> {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return { ok: false, status: res.status, errText };
  }

  const data = await res.json();
  const reply: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
    "Üzgünüm, şu anda bir yanıt oluşturamadım.";
  return { ok: true, reply };
}

export async function POST(req: NextRequest) {
  // Anyone may type a question; only a member gets the answer. The page
  // renders the same rule, but that is cosmetic on its own — this endpoint
  // is what actually spends money, so the check lives here.
  //
  // The two refusals are deliberately different. "signin" means the visitor
  // has no account, and the UI turns it into a sign-up prompt with their
  // question preserved. "limit" means they have one and have used today's
  // allowance, which is an upgrade prompt instead. Collapsing both into one
  // 403 would show the wrong offer to half the people who hit it.
  const { signedIn, tier, userId } = await getViewerAccess();
  if (!signedIn || !userId) {
    return NextResponse.json(
      { error: "Bu cevabı görmek için ücretsiz bir hesap gerekiyor.", reason: "signin" },
      { status: 401 }
    );
  }

  if (!hasTierAccess(tier, "pro")) {
    const used = await countQuestionsToday(userId);
    if (used >= AI_FREE_DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: `Bugünlük ücretsiz soru hakkınız doldu (${AI_FREE_DAILY_LIMIT}). Pro pakette sınırsız.`,
          reason: "limit",
        },
        { status: 429 }
      );
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI assistant is not configured." }, { status: 503 });
  }

  let body: { messages?: ChatMessage[]; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const targetLanguage = languageName(typeof body.lang === "string" ? body.lang : "en");
  const tickerLine = await formatTickerLine();

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content).slice(0, 2000) }],
  }));

  const systemPrompt = buildSystemPrompt(tickerLine, targetLanguage);

  // Up to 2 attempts total: a malformed reply (leaked self-check instead
  // of an actual answer, or an empty string) is rare but worth one silent
  // retry before giving up, rather than showing it to a visitor.
  let result = await callGemini(apiKey, contents, systemPrompt);
  if (result.ok && (looksLikeLeakedSelfCheck(result.reply) || result.reply.trim() === "")) {
    console.warn("AI assistant reply looked malformed, retrying once:", result.reply.slice(0, 200));
    result = await callGemini(apiKey, contents, systemPrompt);
  }

  if (!result.ok) {
    console.error("Gemini API error:", result.status, result.errText);
    return NextResponse.json({ error: "AI assistant is temporarily unavailable." }, { status: 502 });
  }

  const reply = result.reply;

  // Best-effort — a logging failure should never break the actual reply.
  const lastUserMessage = messages[messages.length - 1];
  try {
    await db.insert(aiAssistantLogs).values({
      question: String(lastUserMessage.content).slice(0, 2000),
      reply,
      userId,
    });
  } catch (err) {
    console.error("Failed to log AI assistant Q&A:", err);
  }

  return NextResponse.json({ reply });
}
