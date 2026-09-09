import Link from "@/components/LocaleLink";
import { trf, trLocale } from "@/lib/chrome";
import { getBrokerBySlug } from "@/data/brokers";
import { trData } from "@/lib/localizeContent";
import { rankedWithdrawalReports, WITHDRAWAL_SURVEY_DATE } from "@/data/withdrawalSurvey";

/**
 * Withdrawal speed, ranked, as investors report it.
 *
 * The one number nobody publishes and everybody wants. Spread and leverage
 * are on every broker's own site; how long the money actually takes to
 * arrive is only knowable from the people who have withdrawn.
 *
 * Two things this component is careful about, both of them credibility
 * rather than decoration:
 *
 * It is labelled as reported, not measured, everywhere it can be — the
 * eyebrow, the heading's own words and the note underneath. We have not
 * stopwatched anyone.
 *
 * And it says plainly that an unlisted broker is one without enough
 * reports. Six of nineteen are ranked here; without that line a reader
 * reasonably concludes the other thirteen are slow, which is a claim the
 * survey does not make and we would not be able to defend.
 */
export default function WithdrawalSpeedTable() {
  const reports = rankedWithdrawalReports();
  const rows = reports
    .map((report) => ({ report, broker: getBrokerBySlug(report.slug) }))
    .filter((row): row is { report: (typeof reports)[number]; broker: NonNullable<ReturnType<typeof getBrokerBySlug>> } =>
      Boolean(row.broker)
    );

  if (rows.length === 0) return null;

  const surveyDate = new Date(WITHDRAWAL_SURVEY_DATE);

  return (
    <div>
      <ol className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline">
        {rows.map(({ report, broker }, i) => (
          <li key={broker.slug}>
            <Link
              href={`/brokers/${broker.slug}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-ink-soft/40"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs ${
                  i === 0
                    ? "bg-signal/15 text-signal"
                    : "border border-hairline text-text-on-ink-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 font-poppins text-[15px] font-semibold text-text-on-ink">
                {broker.name}
              </span>
              <span
                className={`shrink-0 text-right font-mono text-xs sm:text-sm ${
                  i === 0 ? "text-signal" : "text-text-on-ink-muted"
                }`}
              >
                {trData(report).label}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-xs leading-relaxed text-text-on-ink-muted">
        {trf(
          "Bu sıralama bir ölçüm değil, yatırımcı geri dönüşlerinin özeti — {date} tarihinde derlendi. Süreler çekim yöntemine, hesap doğrulamasının tamamlanmış olmasına ve tutara göre değişir; kripto çekimler genelde en hızlısıdır.",
          {
            date: surveyDate.toLocaleDateString(trLocale(), {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }),
          }
        )}{" "}
        {trf(
          "Listede olmayan bir broker yavaş olduğu için değil, hakkında yeterli geri dönüş olmadığı için burada yok — {ranked} broker sıralanabildi.",
          { ranked: rows.length }
        )}
      </p>
    </div>
  );
}
