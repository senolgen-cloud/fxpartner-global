/**
 * Asserts the one assumption every timestamp in this project rests on:
 * the process reading and writing the database is in UTC.
 *
 * The columns are `timestamp` without a time zone, and the Postgres driver
 * serialises a JS Date to local wall clock and parses a naive value back as
 * local wall clock. That is self-consistent, so JS Dates survive a round
 * trip from any zone. What does not survive is mixing: a column filled by
 * SQL now() holds the *Postgres* wall clock (GMT here), and a non-UTC reader
 * shifts it. On a UTC+3 machine that is a silent three-hour error in every
 * age the site prints, and any JS Date written from that machine is stored
 * three hours off for the UTC readers in production.
 *
 * Run without arguments it checks only the process. With DATABASE_URL
 * present it also proves the round trip against the real database.
 */
import fs from "node:fs";

const problems = [];

function note(msg) {
  problems.push(msg);
}

// 1. The process itself.
const offset = -new Date().getTimezoneOffset();
if (offset !== 0) {
  note(
    `bu süreç UTC değil (offset ${offset > 0 ? "+" : ""}${offset} dk, ` +
      `${Intl.DateTimeFormat().resolvedOptions().timeZone}). ` +
      `Node'u TZ=UTC ile çalıştırın; next.config.ts ve src/instrumentation.ts ` +
      `bunu uygulama için ayarlar, ama tek başına çalışan betikler için değil.`
  );
}

// 2. The round trip, when we can reach the database.
let url = process.env.DATABASE_URL;
if (!url) {
  try {
    url = fs.readFileSync(".env.local", "utf8").match(/^DATABASE_URL="?([^"\n\r]+)"?/m)?.[1];
  } catch {
    /* no .env.local — process check only */
  }
}

if (url) {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);

  await sql`drop table if exists _clock_contract`;
  await sql`create table _clock_contract (id int, ts timestamp)`;
  try {
    const js = new Date();
    await sql`insert into _clock_contract values (1, ${js})`;
    await sql`insert into _clock_contract values (2, now())`;
    const rows = await sql`select id, ts from _clock_contract order by id`;

    const jsDrift = Math.round((new Date(rows[0].ts) - js) / 60000);
    const nowDrift = Math.round((new Date(rows[1].ts) - js) / 60000);

    if (jsDrift !== 0) note(`JS Date gidiş-dönüşte ${jsDrift} dk kayıyor (0 olmalı)`);
    if (Math.abs(nowDrift) > 1) {
      note(
        `SQL now() ile yazılan sütun ${nowDrift} dk kayıyor (0 olmalı) — ` +
          `defaultNow() kullanan her sütun bu kadar yanlış okunuyor`
      );
    }
  } finally {
    await sql`drop table _clock_contract`;
  }
}

if (problems.length) {
  console.error("saat sözleşmesi bozuk:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

console.log(
  url
    ? "clock contract holds: process is UTC and both write paths round-trip exactly"
    : "clock contract holds: process is UTC (no DATABASE_URL, round trip not checked)"
);
