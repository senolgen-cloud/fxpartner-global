import { NextRequest, NextResponse } from "next/server";
import { notifyCronFailure } from "./notify";

// Wraps a cron route's GET handler so an uncaught exception (missing env
// var, a feed going down, an expired key) emails an admin alert instead of
// just 500ing invisibly — see notifyCronFailure for why that matters.
// Unauthorized (401) responses are a normal `return`, not a `throw`, so
// they never trigger an alert.
export function withCronErrorAlert(
  jobName: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async function GET(req: NextRequest): Promise<NextResponse> {
    try {
      return await handler(req);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`[cron:${jobName}]`, error);
      await notifyCronFailure(jobName, error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  };
}
