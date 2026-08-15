import type { NewsItem } from "./news";

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type Bulletin = {
  title: string;
  excerpt: string;
  body: string; // paragraphs separated by \n\n
};

// Grounded synthesis, not free commentary: the model is only allowed to
// rephrase/combine the facts already present in the fetched items below
// into one flowing Turkish bulletin — same "no invented detail" principle
// as translate.ts's DeepL step, just applied at the paragraph level
// instead of the sentence level so the result reads as original prose
// (and credits every source by name) rather than a re-post of any one
// publisher's wording. If Gemini isn't configured, callers fall back to
// a template-only bulletin (see buildFallbackBulletin) instead of
// blocking the whole news-update run.
export async function synthesizeBulletin(items: NewsItem[]): Promise<Bulletin | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const factSheet = items
    .map((it, i) => `${i + 1}. [${it.source}] ${it.title} — ${it.description}`)
    .join("\n");

  const systemPrompt = `Sen FXPARTNER için günlük finans haber bülteni yazan bir editörsün.

KURALLAR (asla ihlal etme):
- SADECE aşağıda verilen haber maddelerindeki gerçekleri kullan. Yeni bir rakam, tarih, tahmin, alıntı veya olay UYDURMA.
- Kaynakların cümlelerini birebir kopyalama — kendi akıcı Türkçe cümlelerinle, gerçekleri birleştirerek özgün bir bülten metni yaz.
- Yorum/analiz eklerken sadece verilen gerçeklerin arasındaki bağlantıyı açıkla (örn. "bu gelişme X'i etkileyebilir çünkü Y" gibi mekanizma açıklaması), asla yeni bir fiyat seviyesi veya olay öngörme.
- Bu yatırım tavsiyesi değildir; bülten metninde bunu ima edecek kesin yönlendirmeler (al/sat vb.) kullanma.
- Çıktıyı TAM OLARAK şu formatta ver, başka hiçbir şey ekleme:

BAŞLIK: <15-20 kelimelik, günün öne çıkan gelişmesini özetleyen başlık>
ÖZET: <1-2 cümlelik özet>
GÖVDE: <3-6 paragraf, paragraflar arasında boş satır>`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `Bugünün haber maddeleri:\n\n${factSheet}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    console.error("Gemini bulletin synthesis failed:", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = await res.json();
  const raw: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";

  return parseBulletinOutput(raw);
}

function parseBulletinOutput(raw: string): Bulletin | null {
  const titleMatch = raw.match(/BAŞLIK:\s*(.+)/);
  const excerptMatch = raw.match(/ÖZET:\s*(.+)/);
  const bodyMatch = raw.match(/GÖVDE:\s*([\s\S]+)/);

  if (!titleMatch || !bodyMatch) return null;

  return {
    title: titleMatch[1].trim(),
    excerpt: excerptMatch ? excerptMatch[1].trim() : "",
    body: bodyMatch[1].trim(),
  };
}

// Used only when GEMINI_API_KEY isn't set, so news-update still publishes
// something rather than silently doing nothing — a plain, factual list
// instead of synthesized prose. No fabrication risk either way since it's
// just the fetched titles verbatim.
export function buildFallbackBulletin(items: NewsItem[]): Bulletin {
  const body = items.map((it) => `**${it.title}** (${it.source})\n${it.description}`).join("\n\n");
  return {
    title: "Günün Öne Çıkan Piyasa Haberleri",
    excerpt: items
      .slice(0, 2)
      .map((it) => it.title)
      .join(" · "),
    body,
  };
}
