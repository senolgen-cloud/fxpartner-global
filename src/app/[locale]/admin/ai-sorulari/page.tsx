import Footer from "@/components/Footer";
import { tr, trLocale } from "@/lib/chrome";
import { db } from "@/db";
import { aiAssistantLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { setServerLocale } from "@/lib/serverLocale";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminAiAssistantLogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const logs = await db.select().from(aiAssistantLogs).orderBy(desc(aiAssistantLogs.createdAt)).limit(200);

  return (
    <>
      <main className="flex-1 bg-paper-high">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">Admin</span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text-dark">AI Assistant Q&amp;A Log</h1>
          <p className="mt-2 text-sm text-text-muted">
            {tr("Son 200 soru/cevap, en yeniden eskiye. Kimlik bilgisi tutulmuyor — yalnızca soru, cevap ve zaman.")}
          </p>

          <div className="mt-10 space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-text-muted">{tr("Henüz hiç soru sorulmamış.")}</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-hairline-light bg-white p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                    {log.createdAt.toLocaleString(trLocale(), { timeZone: "Europe/Istanbul" })}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-text-dark">Soru: {log.question}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-text-muted">{log.reply}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
