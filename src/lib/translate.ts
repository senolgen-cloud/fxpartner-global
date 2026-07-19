// Faithful machine translation only — deliberately not an LLM call.
// A dedicated MT model translates; it doesn't add commentary, opinions,
// or invented detail the way a generative rewrite could. That matters
// for unsupervised, repeated posting of financial headlines.
export async function translateToTurkish(texts: string[]): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) throw new Error("DEEPL_API_KEY is not set");

  // Free-tier keys end in ":fx"; that determines which host to use.
  const host = apiKey.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";

  const res = await fetch(`https://${host}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: texts,
      source_lang: "EN",
      target_lang: "TR",
    }),
  });

  if (!res.ok) {
    throw new Error(`DeepL translate failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.translations.map((t: { text: string }) => t.text);
}
