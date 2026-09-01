// Signals go to one place, and only one place.
//
// As of 2026-09-01 a trade signal is published to the paid VIP group's
// SIGNALS topic and nowhere else. It used to go out to the public channel,
// the Arabic mirror, X and a push to every anonymous subscriber — four
// simultaneous giveaways of the thing members pay for.
//
// The routes that publish signals therefore must not call the general-purpose
// senders (sendTelegramMessage / sendTelegramPhoto) or the X posters, because
// those default to the public channel. They go through sendSignalMessage /
// sendSignalPhoto, which resolve the destination in one place and have no
// public fallback at all.
//
// This is checked rather than trusted for the usual reason: a public post is
// not an error. Nothing throws, nothing turns red — the signal simply reaches
// 16,000 people who did not pay for it, and the first sign is a member asking
// why they are paying. One import is all it takes.
//
// Run: node scripts/check-signal-channel.mjs

import { readFileSync } from "node:fs";

// Every route that publishes a trade signal, in any form.
const SIGNAL_ROUTES = [
  "src/app/api/trade-signal/route.ts",
  "src/app/api/trade-result/route.ts",
  "src/app/api/pending-order/route.ts",
  "src/app/api/cron/active-signals-digest/route.ts",
];

// Named imports that would put a signal somewhere public.
const FORBIDDEN = [
  "sendTelegramMessage",
  "sendTelegramPhoto",
  "postTextToX",
  "postTradeSignalToX",
  "sendPushToNonMembers",
  "sendPushToAll",
  "arabicChatId",
];

const REQUIRED = /\bsendSignal(Message|Photo)\b/;

const problems = [];

for (const path of SIGNAL_ROUTES) {
  let src;
  try {
    src = readFileSync(path, "utf8");
  } catch {
    problems.push(`${path}: missing — update SIGNAL_ROUTES in this script if the route moved.`);
    continue;
  }

  for (const name of FORBIDDEN) {
    if (new RegExp(`\\b${name}\\b`).test(src)) {
      problems.push(`${path}: uses ${name}() — signals must not reach a public audience.`);
    }
  }
  if (!REQUIRED.test(src)) {
    problems.push(`${path}: never calls sendSignalMessage/sendSignalPhoto — does it still publish?`);
  }
}

// The senders themselves must keep no public fallback: the moment one is
// added, every route above quietly gains one too.
const telegram = readFileSync("src/lib/telegram.ts", "utf8");
const sendersStart = telegram.indexOf("async function sendToSignalChannel");
const sendersEnd = telegram.indexOf("export async function sendTelegramMessage");
if (sendersStart === -1 || sendersEnd === -1 || sendersEnd < sendersStart) {
  problems.push("src/lib/telegram.ts: cannot find sendToSignalChannel — this check has gone blind.");
} else {
  const senders = telegram.slice(sendersStart, sendersEnd);
  if (senders.includes("getConfig(")) {
    problems.push(
      "src/lib/telegram.ts: sendToSignalChannel reads getConfig() — that is the public channel id."
    );
  }
}

if (problems.length > 0) {
  console.error("Signal channel check failed:\n");
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    "\nPublish through sendSignalMessage/sendSignalPhoto (src/lib/telegram.ts), which post to\n" +
      "the destination signalDestination() names and nowhere else."
  );
  process.exit(1);
}

console.log(`✓ ${SIGNAL_ROUTES.length} signal routes publish only to the signal destination`);
