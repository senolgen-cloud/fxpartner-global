import { tr, trf, trLocale } from "@/lib/chrome";

// One review on a broker page.
//
// EVERY STRUCTURED FIELD IS OPTIONAL AND THE CARD IS BUILT AROUND THAT.
// Reviews collected before 2026-08-27 carry a rating and a body and nothing
// else — twenty real reviews that must keep rendering exactly as well as a
// new one. So each block appears only when its field is filled, and a
// legacy review simply renders as the name, score, date and verdict it
// always was. Nothing is stubbed, and nothing says "not specified".

// Dates as ISO strings, because the comments are read once and shared
// between readers (lib/cachedReads.ts) and a shared cache stores JSON. Both
// use sites below already went through new Date(...), so nothing here
// changed except the type finally saying what arrives.
export type BrokerReview = {
  id: string;
  body: string;
  rating: number | null;
  createdAt: string;
  userName: string | null;
  userCountry?: string | null;
  title: string | null;
  experience: string | null;
  liked: string | null;
  improved: string | null;
  ratingPlatform: number | null;
  ratingPricing: number | null;
  ratingService: number | null;
  ratingWithdrawal: number | null;
  brokerReply: string | null;
  brokerReplyAt: string | null;
};

// A switch of literals rather than a lookup table, because tr() only makes
// it into the catalogue when the extractor can see a literal argument.
// tr(TABLE[key]) translates at runtime and ships Turkish to every other
// tree, since no catalogue ever learns the key. Called per request, so the
// module-scope rule is satisfied too.
function experienceLabel(value: string): string | null {
  switch (value) {
    case "<1":
      return tr("1 yıldan az");
    case "1-3":
      return tr("1-3 yıl");
    case "3-5":
      return tr("3-5 yıl");
    case "5+":
      return tr("5 yıldan fazla");
    default:
      return null;
  }
}

function Stars({ value }: { value: number }) {
  return (
    <span className="font-mono text-xs tracking-tight text-gold" aria-hidden="true">
      {"★".repeat(value)}
      <span className="text-text-muted/30">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function AxisScores({ review }: { review: BrokerReview }) {
  const axes = [
    { label: tr("Platform"), value: review.ratingPlatform },
    { label: tr("Maliyet"), value: review.ratingPricing },
    { label: tr("Destek"), value: review.ratingService },
    { label: tr("Para çekme"), value: review.ratingWithdrawal },
  ].filter((a): a is { label: string; value: number } => a.value != null);

  if (axes.length === 0) return null;

  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-hairline-light pt-3 sm:grid-cols-4">
      {axes.map((a) => (
        <div key={a.label}>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
            {a.label}
          </dt>
          <dd className="mt-0.5 flex items-center gap-1.5">
            <Stars value={a.value} />
            <span className="font-mono text-xs tabular-stat text-text-dark">{a.value}/5</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

// The question arrives already translated — wrapped at each call site, so
// the extractor sees a literal there instead of a variable here.
function Prompted({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-text-dark">{question}</h4>
      <p className="mt-1 text-[15px] leading-relaxed text-text-dark/90">{answer}</p>
    </div>
  );
}

export default function BrokerReviewCard({
  review,
  brokerName,
  flag,
}: {
  review: BrokerReview;
  brokerName: string;
  flag?: string | null;
}) {
  const date = new Date(review.createdAt).toLocaleDateString(trLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  // A review that answered the prompts gets them as headings; one that only
  // ever had the single box keeps its paragraph unlabelled, because calling
  // it "Overall" would imply the writer was choosing between sections they
  // were never shown.
  const structured = Boolean(review.liked || review.improved);

  return (
    <article className="py-6">
      {review.title && (
        <h3 className="font-poppins text-lg font-semibold leading-snug text-text-dark">
          {review.title}
        </h3>
      )}

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium text-text-dark">
          {review.userName || tr("FXPARTNER kullanıcısı")}
        </span>
        {flag && <span aria-hidden="true">{flag}</span>}
        {review.rating != null && (
          <span className="flex items-center gap-1.5">
            <Stars value={review.rating} />
            <span className="font-mono text-xs tabular-stat text-gold">{review.rating}/5</span>
          </span>
        )}
        <span className="font-mono text-xs text-text-muted">{date}</span>
      </div>

      {experienceLabel(review.experience ?? "") && (
        <p className="mt-1 font-mono text-[11px] text-text-muted">
          {trf("{broker} ile {span} deneyim", {
            broker: brokerName,
            span: experienceLabel(review.experience ?? "")!,
          })}
        </p>
      )}

      {review.liked && <Prompted question={tr("En çok neyi beğendi?")} answer={review.liked} />}
      {review.improved && (
        <Prompted question={tr("Neyin gelişmesini isterdi?")} answer={review.improved} />
      )}

      {structured ? (
        <Prompted question={tr("Genel")} answer={review.body} />
      ) : (
        <p className="mt-2 text-[15px] leading-relaxed text-text-dark/90">{review.body}</p>
      )}

      <AxisScores review={review} />

      {review.brokerReply && (
        // Marked as the broker's answer and visually subordinate to the
        // review. It is a right of reply, not a correction: it sits under
        // the review and never replaces or edits it.
        <div className="mt-4 rounded-xl border-l-2 border-signal bg-paper px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            {trf("{broker} yanıtı", { broker: brokerName })}
            {review.brokerReplyAt && (
              <>
                {" · "}
                {new Date(review.brokerReplyAt).toLocaleDateString(trLocale(), {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </>
            )}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-dark/90">{review.brokerReply}</p>
        </div>
      )}
    </article>
  );
}
