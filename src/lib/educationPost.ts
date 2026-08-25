import type { EducationTopic } from "@/lib/educationTopics";

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type EducationCopy = { title: string; excerpt: string; body: string };

// What the model is not allowed to do, stated as rules rather than hoped for.
//
// A generated post carries the site's name, and the site's whole position is
// that it does not tell anyone what to buy. So the prompt forbids the three
// things a model reaches for when it runs out of substance: a market call, a
// number it cannot support, and the implication that following the article
// makes money. Everything on the topic list is process or mechanics — true
// regardless of where price goes — which is what makes those rules keepable.
const RULES = [
  "Yatırım tavsiyesi verme. Hiçbir enstrüman, yön, seviye veya zamanlama önerme.",
  "Getiri vaat etme, ima etme veya örnek kâr rakamı uydurma.",
  "Uydurma istatistik, uydurma araştırma, uydurma alıntı kullanma.",
  "Belirli bir broker, ürün veya platform önerme.",
  "Kesinlik dili kullanma: 'her zaman', 'garanti', 'kesin' gibi ifadelerden kaçın.",
  "Okuru suçlayan ya da küçümseyen bir ton kullanma; anlatıcı sakin ve pratik olsun.",
].join("\n- ");

const STYLE = `Biçim, FXPARTNER'ın eğitim yazısı formatı:
- Kısa, çarpıcı bir başlık. Başında tek bir emoji olabilir.
- Açılışta 2-3 cümlelik bir giriş: okurun kendinde tanıyacağı somut bir durum.
- Ardından emoji ile işaretlenmiş 3-5 bölüm. Örnek bölüm başlıkları: "⚠️ Nedir?", "🧠 Neden olur:", "⛔️ Nasıl durdurulur:", "💡 Pratik ipucu:", "🎯 Özet:".
- Madde listelerinde emoji madde işareti kullan (🟠 veya numaralı 🔢).
- Kapanışta tek cümlelik, abartısız bir hatırlatma.
- Toplam 250-400 kelime. Türkçe, sen-dili değil siz-dili.`;

function buildPrompt(topic: EducationTopic): string {
  return `FXPARTNER için bir yatırımcı eğitim yazısı yaz.

KONU: ${topic.brief}

${STYLE}

KURALLAR:
- ${RULES}

Yanıtı yalnızca şu JSON şemasıyla ver, başka hiçbir şey yazma:
{"title": "...", "excerpt": "...", "body": "..."}

title: yazının başlığı.
excerpt: arama sonucunda ve liste sayfasında görünecek 1-2 cümlelik özet (en fazla 200 karakter).
body: yazının tamamı. Satır sonları için gerçek yeni satır karakteri kullan.`;
}

// Cheap, mechanical checks on what came back. A model asked not to promise
// returns will usually comply; "usually" is not a standard to publish on, so
// the obvious violations are caught here and the post is dropped rather than
// stored. Dropping one post costs nothing — the queue simply serves it again
// on the next run.
const FORBIDDEN = [
  /garanti(li|siyle|si)?\b/i,
  /kesin kâr|kesin kazan|kesinlikle kazan/i,
  /%\s*\d+\s*(kâr|kazanç|getiri)\s*(garanti|kesin)/i,
  /zengin ol|hızlı para kazan/i,
];

export function findPolicyProblems(copy: EducationCopy): string[] {
  const text = `${copy.title}\n${copy.excerpt}\n${copy.body}`;
  const problems: string[] = [];
  for (const re of FORBIDDEN) {
    const m = text.match(re);
    if (m) problems.push(`yasak ifade: "${m[0]}"`);
  }
  if (copy.body.length < 400) problems.push(`gövde çok kısa (${copy.body.length} karakter)`);
  if (copy.excerpt.length > 260) problems.push(`özet çok uzun (${copy.excerpt.length} karakter)`);
  if (!copy.title.trim()) problems.push("başlık boş");
  return problems;
}

export async function generateEducationPost(topic: EducationTopic): Promise<EducationCopy | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("educationPost: GEMINI_API_KEY not set");
    return null;
  }

  let res: Response;
  try {
    res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(topic) }] }],
        generationConfig: {
          temperature: 0.6,
          // 2048 truncated a 300-word post mid-string and the JSON came back
          // unparseable — which read like a broken model rather than a budget
          // that was simply too small. Emoji are several tokens each and
          // these posts are built out of them.
          maxOutputTokens: 6144,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (err) {
    console.error(`educationPost: request failed for ${topic.id}:`, err);
    return null;
  }

  if (!res.ok) {
    console.error(`educationPost: HTTP ${res.status} for ${topic.id}`);
    return null;
  }

  let copy: EducationCopy;
  try {
    const data = await res.json();
    const candidate = data?.candidates?.[0];
    // Truncation has its own name here. Told apart from a malformed reply it
    // points at the token budget; folded into "unparseable" it looks like the
    // model is broken and sends you reading the prompt.
    if (candidate?.finishReason === "MAX_TOKENS") {
      console.error(`educationPost: ${topic.id} hit the output limit — raise maxOutputTokens`);
      return null;
    }
    const text = candidate?.content?.parts?.[0]?.text;
    if (typeof text !== "string") throw new Error("no text part");
    const parsed = JSON.parse(text);
    copy = {
      title: String(parsed.title ?? "").trim(),
      excerpt: String(parsed.excerpt ?? "").trim(),
      body: String(parsed.body ?? "").trim(),
    };
  } catch (err) {
    console.error(`educationPost: unparseable response for ${topic.id}:`, err);
    return null;
  }

  const problems = findPolicyProblems(copy);
  if (problems.length) {
    console.error(`educationPost: ${topic.id} rejected — ${problems.join("; ")}`);
    return null;
  }

  return copy;
}

export function slugifyEducation(topicId: string, title: string): string {
  const base = title
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70)
    .replace(/-+$/, "");
  // The topic id is the tail rather than the head so the readable words lead
  // the URL, and it guarantees uniqueness even if two titles slugify the same.
  return `${base || "egitim"}-${topicId}`;
}
