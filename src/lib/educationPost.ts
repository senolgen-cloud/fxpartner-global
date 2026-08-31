import type { EducationTopic } from "@/lib/educationTopics";
import { brokers } from "@/data/brokers";
import { GEMINI_URL } from "@/lib/gemini";


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
//
// The prompt states six rules. Until this ran on a schedule only one of them
// — the return promise — had a check behind it, which meant the other five
// were being enforced by asking nicely. These cover three more. The
// remaining two (tone, and certainty language) are matters of degree that a
// regex reads badly, and stay with the prompt.
const FORBIDDEN = [
  /garanti(li|siyle|si)?\b/i,
  /kesin kâr|kesin kazan|kesinlikle kazan/i,
  /%\s*\d+\s*(kâr|kazanç|getiri)\s*(garanti|kesin)/i,
  /zengin ol|hızlı para kazan/i,
];

// A market call. Every topic on the list is process or mechanics and none of
// them needs to name an instrument, so an instrument sitting near a
// direction is the shape of the one thing this site does not do.
const INSTRUMENTS =
  /(EUR\/?USD|GBP\/?USD|USD\/?TRY|USD\/?JPY|XAU\/?USD|XAG\/?USD|BTC\/?USD|ETH\/?USD|GOLD|ALTIN|GÜMÜŞ|BITCOIN|NASDAQ|US100|US30|SP500)/i;
// Turkish letters, not \b. JS word boundaries are ASCII-only, so "ş" reads
// as a non-word character and \b after "alış" never matches — which is how
// "GOLD için alış yönü uygun" walked straight past this check in testing.
const TR_LETTER = "a-zA-ZçğıöşüÇĞİÖŞÜ";
const DIRECTION = new RegExp(
  `(?<![${TR_LETTER}])(al[ıi][şs]|sat[ıi][şs]|long|short|y[üu]kseli[şs] bekle|d[üu][şs][üu][şs] bekle|hedef fiyat)(?![${TR_LETTER}])`,
  "i"
);

// A statistic with a source attached is a statistic the model invented: the
// generator has no research to cite and is told not to pretend otherwise.
const SOURCED_STAT = /(ara[şs]t[ıi]rma|[çc]al[ıi][şs]ma|istatistik|veriler?e g[öo]re|rapor)[^.]{0,40}%\s*\d+/i;

// Any broker from the catalogue. The prompt forbids recommending one; this
// checks against the real list rather than a guess at what it might name.
const BROKER_NAMES = brokers
  .map((b) => b.name)
  .filter((n) => n.length >= 3)
  .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

export function findPolicyProblems(copy: EducationCopy): string[] {
  const text = `${copy.title}\n${copy.excerpt}\n${copy.body}`;
  const problems: string[] = [];
  for (const re of FORBIDDEN) {
    const m = text.match(re);
    if (m) problems.push(`yasak ifade: "${m[0]}"`);
  }
  const instrument = text.match(INSTRUMENTS);
  if (instrument && DIRECTION.test(text)) {
    problems.push(`piyasa görüşü izlenimi: "${instrument[0]}" + yön ifadesi`);
  }

  const stat = text.match(SOURCED_STAT);
  if (stat) problems.push(`kaynaklı istatistik iddiası: "${stat[0].slice(0, 60)}"`);

  for (const name of BROKER_NAMES) {
    const hit = text.match(new RegExp(`\\b${name}\\b`, "i"));
    if (hit) {
      problems.push(`broker adı geçiyor: "${hit[0]}"`);
      break;
    }
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

export function slugifyEducation(
  topicId: string,
  title: string,
  taken: ReadonlySet<string> = new Set()
): string {
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
  // The topic id used to be glued on unconditionally, which guaranteed
  // uniqueness at the cost of ending every Turkish URL in an English tag:
  // ".../kaybi-kovalamak-zarari-geri-alma-isleminin-mekanigi-revenge-trading".
  // These pages exist to rank in Turkish, so that tail was working against
  // the one job they have. Each topic is published exactly once and the ids
  // are unique, so a clash needs two different topics to produce the same
  // title — rare enough to handle when it happens rather than to pay for on
  // every URL.
  const clean = base || "egitim";
  if (!taken.has(clean)) return clean;

  const withTopic = `${clean}-${topicId}`;
  if (!taken.has(withTopic)) return withTopic;

  let n = 2;
  while (taken.has(`${withTopic}-${n}`)) n++;
  return `${withTopic}-${n}`;
}

