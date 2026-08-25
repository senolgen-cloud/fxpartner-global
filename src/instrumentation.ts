/**
 * Pin the server's clock to UTC before anything reads a date.
 *
 * The database stores `timestamp` without a time zone, and the Postgres
 * driver writes and reads those naive values in the Node process's local
 * zone. Production runs on Vercel, which is UTC, so a column filled by
 * `now()` (evaluated by Postgres in GMT) reads back as the right instant and
 * everything agrees.
 *
 * A developer machine that is not UTC breaks that agreement in both
 * directions at once. On a UTC+3 box, a `now()` column reads back three
 * hours early — which is how the signals board came to show a fresh trade as
 * "3 saat önce" locally while the live site was correct — and, worse, a JS
 * Date written from that box is stored as local wall clock, so production
 * later reads it three hours late. That second one is real data damage from
 * a machine that only meant to run a script.
 *
 * Setting TZ here makes dev behave exactly as production does. It is a no-op
 * on Vercel, which is the point: one behaviour everywhere, not two.
 *
 * The long-term fix is timestamptz columns, which no process's zone can
 * misread. That is a migration across every table including the Auth.js
 * ones, so it is not done here — this removes the divergence today.
 */
export function register() {
  if (process.env.TZ !== "UTC") {
    process.env.TZ = "UTC";
  }
}
