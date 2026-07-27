import { NextRequest } from "next/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { Redis } from "@upstash/redis";
import { buildSystemPrompt } from "@/lib/aiAssistant";

// Owned by AI Danışman Departmanı — see src/lib/departments.ts. Public,
// user-triggered endpoint that spends real OpenAI credits, so it's rate
// limited per IP before touching the model.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_SECONDS = 60;

let redis: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  if (!redis) redis = new Redis({ url, token });
  return redis;
}

async function isRateLimited(ip: string): Promise<boolean> {
  const client = getRedis();
  // Without Redis configured, fail open rather than breaking the widget —
  // the OPENAI_API_KEY requirement below is the harder gate anyway.
  if (!client) return false;

  const key = `fxpartner:chat-rate:${ip}`;
  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, RATE_LIMIT_WINDOW_SECONDS);
  }
  return count > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("Chat assistant is not configured.", { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (await isRateLimited(ip)) {
    return new Response("Too many messages — please wait a minute and try again.", { status: 429 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
