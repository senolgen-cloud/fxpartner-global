// Posts trade-signal cards to X (Twitter) via OAuth 1.0a user-context auth.
// OAuth 1.0a (not OAuth2) because the v1.1 media upload endpoint — still the
// simplest way to attach an image to a v2 tweet — only accepts it.

const UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json";
const TWEET_URL = "https://api.twitter.com/2/tweets";

interface OAuth1Credentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

function getCredentials(): OAuth1Credentials {
  const consumerKey = process.env.X_API_KEY;
  const consumerSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;
  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    throw new Error("X API credentials are not configured");
  }
  return { consumerKey, consumerSecret, accessToken, accessTokenSecret };
}

// RFC 3986 percent-encoding — stricter than encodeURIComponent, which leaves
// !*'() unescaped. OAuth 1.0a signatures require all of them encoded.
function pctEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!*'()]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

async function hmacSha1(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function oauth1Header(
  method: string,
  url: string,
  signedParams: Record<string, string>,
  creds: OAuth1Credentials
): Promise<string> {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.consumerKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };

  const allParams = { ...oauthParams, ...signedParams };
  const paramString = Object.keys(allParams)
    .sort()
    .map((k) => `${pctEncode(k)}=${pctEncode(allParams[k])}`)
    .join("&");

  const baseString = `${method.toUpperCase()}&${pctEncode(url)}&${pctEncode(paramString)}`;
  const signingKey = `${pctEncode(creds.consumerSecret)}&${pctEncode(creds.accessTokenSecret)}`;
  const signature = await hmacSha1(signingKey, baseString);

  const headerParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
  return (
    "OAuth " +
    Object.keys(headerParams)
      .sort()
      .map((k) => `${pctEncode(k)}="${pctEncode(headerParams[k])}"`)
      .join(", ")
  );
}

// Chunked-avoiding base64 conversion — String.fromCharCode(...bytes) blows
// the call stack on large arrays, so this walks the buffer in chunks.
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function postTradeSignalToX(
  imageUrl: string,
  text: string
): Promise<{ tweetId: string }> {
  const creds = getCredentials();

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to fetch card image: ${imgRes.status}`);
  const base64 = arrayBufferToBase64(await imgRes.arrayBuffer());

  // Simple (non-chunked) media upload — fine for a single PNG well under
  // the 5MB image limit. media_data is a signed form param per X's spec.
  const mediaParams = { media_data: base64 };
  const uploadAuth = await oauth1Header("POST", UPLOAD_URL, mediaParams, creds);
  const uploadRes = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: uploadAuth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(mediaParams).toString(),
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.media_id_string) {
    throw new Error(`X media upload failed: ${JSON.stringify(uploadData)}`);
  }

  const tweetAuth = await oauth1Header("POST", TWEET_URL, {}, creds);
  const tweetRes = await fetch(TWEET_URL, {
    method: "POST",
    headers: {
      Authorization: tweetAuth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, media: { media_ids: [uploadData.media_id_string] } }),
  });
  const tweetData = await tweetRes.json();
  if (!tweetRes.ok) {
    throw new Error(`X tweet failed: ${JSON.stringify(tweetData)}`);
  }
  return { tweetId: tweetData.data.id };
}
