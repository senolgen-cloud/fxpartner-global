import { Redis } from "@upstash/redis";

const POSTED_KEY = "fxpartner:posted-guids";
const MAX_KEEP = 500;

let client: Redis | null = null;

function getClient(): Redis {
  if (!client) {
    // Support both the Upstash-native env names and the ones Vercel's
    // "KV" naming carried over from the deprecated @vercel/kv product.
    const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
      throw new Error("Upstash Redis env vars are not set (UPSTASH_REDIS_REST_URL/TOKEN)");
    }
    client = new Redis({ url, token });
  }
  return client;
}

export async function isAlreadyPosted(guid: string): Promise<boolean> {
  const redis = getClient();
  const score = await redis.zscore(POSTED_KEY, guid);
  return score !== null;
}

export async function markAsPosted(guid: string): Promise<void> {
  const redis = getClient();
  await redis.zadd(POSTED_KEY, { score: Date.now(), member: guid });
  const count = await redis.zcard(POSTED_KEY);
  if (count > MAX_KEEP) {
    await redis.zremrangebyrank(POSTED_KEY, 0, count - MAX_KEEP - 1);
  }
}
