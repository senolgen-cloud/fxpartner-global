import { unstable_rethrow } from "next/navigation";
import { auth } from "@/auth";

/**
 * The session, or none, if the session store cannot be reached.
 *
 * Auth.js reads the session out of the same database as everything else,
 * and its adapter throws when that read fails. Every page in the site
 * calls auth() through the root layout, so during the 2026-08-31 outage
 * that single query took down the entire site for anybody holding a
 * session cookie — the layout threw before any page component ran. It was
 * the largest error group of the day by a wide margin: 158 occurrences
 * against 70 for the next one.
 *
 * A reader whose session cannot be read is, for that request, exactly a
 * signed-out reader: they see the public site and a sign-in link. That is
 * a small, honest degradation and it fails closed — nothing is unlocked
 * by a failed lookup, only locked.
 *
 * Which is why this is for *rendering* only. Server actions and write
 * routes keep calling auth() directly: there, "we could not tell who you
 * are" must stop the write rather than quietly perform it as a stranger.
 */
export async function optionalSession() {
  try {
    return await auth();
  } catch (err) {
    // See lib/dbOptional.ts: auth() reads cookies, and reading cookies is
    // one of the things Next reports by throwing. Swallowing that here made
    // the build treat the login page as static.
    unstable_rethrow(err);
    console.error("session unavailable, treating the reader as signed out —", err);
    return null;
  }
}
