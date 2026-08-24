"use client";
import { useIntlLocale, useTr, useTrf } from "@/components/useTr";
import { formatPercent } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "@/components/LocaleLink";
import type { tradeSignals, TradeSignalOutcome } from "@/db/schema";
import { canViewSignal, requiredTierForPair, type AccessTier } from "@/lib/signalAccess";
import { ACCESS_TIER_LABEL } from "@/data/packageTiers";
import TradingViewChart from "./TradingViewChart";
import LotLadder from "./LotLadder";
import TradeNowButton from "./TradeNowButton";
import { favorableMove } from "@/lib/contractSizes";

type Signal = typeof tradeSignals.$inferSelect;
type SignalJson = Omit<Signal, "createdAt" | "closedAt"> & {
  createdAt: string;
  closedAt: string | null;
};

const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";
const POLL_MS = 15000;

function toSignal(s: SignalJson): Signal {
  return { ...s, createdAt: new Date(s.createdAt), closedAt: s.closedAt ? new Date(s.closedAt) : null };
}

// Two-tone chime via Web Audio — no audio file to ship/host, and it sounds
// identical everywhere. Browsers block audio until the page has seen a user
// gesture, so the AudioContext is created lazily on first click/keydown
// rather than on mount; until that first gesture fires, a signal arriving
// won't audibly chime (the push notification below still covers that case).
let sharedAudioCtx: AudioContext | null = null;

function unlockAudio() {
  if (sharedAudioCtx) return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (Ctx) sharedAudioCtx = new Ctx();
}

function playSignalChime() {
  if (!sharedAudioCtx) return;
  const ctx = sharedAudioCtx;
  if (ctx.state === "suspended") ctx.resume();
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.14;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

// Only Pro/VIP instruments can ever be locked — free-tier FX signals are
// public to everyone, signed in or not (see lib/signalAccess.ts), so this
// is only ever reached for a paid tier and the prompt is always "upgrade".
function lockPrompt(
  pair: string,
  trf: (text: string, vars: Record<string, string | number>) => string
): { href: string; label: string; badge: string } {
  const required = requiredTierForPair(pair);
  return {
    href: "/paketler",
    label: trf("Bu sinyal {tier} üyelere özel — Yükselt →", { tier: ACCESS_TIER_LABEL[required] }),
    badge: ACCESS_TIER_LABEL[required],
  };
}

// SVG donut mirroring the poster's "73% Başarı Oranı" ring — plain text
// couldn't carry that at-a-glance read, and TrustGauge's version is styled
// for broker trust scores (0-10, different color scale), not a win rate.
function PerformanceRing({ rate }: { rate: number | null }) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = rate ?? 0;
  const offset = circumference * (1 - pct / 100);
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-hairline"
        />
        {rate !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-signal transition-[stroke-dashoffset] duration-700 ease-out"
          />
        )}
      </svg>
      <span className="absolute font-display text-xl font-semibold">
        {rate !== null ? `${rate}%` : "—"}
      </span>
    </div>
  );
}

function LockBadge({ pair }: { pair: string }) {
  const trf = useTrf();
  const { href, label, badge } = lockPrompt(pair, trf);
  return (
    <Link
      href={href}
      title={label}
      className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold transition-colors hover:border-gold hover:bg-gold/20"
    >
      🔒 {badge}
    </Link>
  );
}

function outcomeColor(outcome: TradeSignalOutcome | null) {
  if (outcome === "WIN") return TICK_UP;
  if (outcome === "LOSS") return TICK_DOWN;
  return "var(--text-on-ink-muted)";
}

// SONUÇ GÖSTERİMİNİN GEÇMİŞİ — aynı hataya dönülmesin diye:
//
//   1. EA'nın "pips" alanı — enstrümanlar arasında tutarsızdı. Bir GOLD
//      işlemi -$242 için "-1212 pip", bir US100 işlemi +$19 için "+6400 pip"
//      kaydediyordu.
//   2. Ham fiyat farkı (giriş -> kapanış) — ölçek olarak karşılaştırılamaz.
//      BTCUSD yüzlerce birim oynarken EURUSD binde birlerle oynuyor.
//   3. 1 lota indirgenmiş P/L — küçük lotlarda sonucu şişiriyordu. 0.30
//      lotluk -$631,50'lik gerçek bir zarar ekranda -$2.105,00 görünüyordu,
//      çünkü 1 lota çıkarmak onu 3,3 katına çıkarıyor. 0.02 lotta çarpan 50.
//
// ŞİMDİ: satırda GERÇEKLEŞEN tutar gösteriliyor. "Kaç lotta ne eder" sorusu
// ayrı bir bileşende (LotLadder) cevaplanıyor; orada sözleşme değeri
// üzerinden hesaplandığı için her lot basamağı doğru çıkıyor.
// Bkz. lib/contractSizes.ts.
function formatPerLot(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Level({ label, value, color }: { label: string; value: string | null; color: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-text-on-ink-muted">{label}</span>
      <span className="font-mono font-medium" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function LevelPair({ target1, stop }: { target1: string | null; stop: string | null }) {
  if (!target1 && !stop) return <span className="text-text-on-ink-muted">—</span>;
  return (
    <span className="font-mono">
      {stop ? <span style={{ color: TICK_DOWN }}>{stop}</span> : <span className="text-text-on-ink-muted">—</span>}
      <span className="text-text-on-ink-muted"> / </span>
      {target1 ? <span style={{ color: TICK_UP }}>{target1}</span> : <span className="text-text-on-ink-muted">—</span>}
    </span>
  );
}

function SignalTable({
  title,
  signals,
  closedView,
  viewerTier,
}: {
  title: string;
  signals: Signal[];
  closedView?: boolean;
  viewerTier: AccessTier | null;
}) {
  const tr = useTr();
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-hairline bg-ink-soft md:block">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-text-on-ink">{title}</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-signal">
          <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
          {tr("Canlı")}
        </span>
      </div>
      {signals.length === 0 ? (
        <p className="px-6 py-8 text-sm text-text-on-ink-muted">{tr("Henüz gösterilecek bir şey yok.")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                <th className="px-6 py-3 font-medium">{tr("Saat")}</th>
                <th className="px-4 py-3 font-medium">{tr("Parite")}</th>
                <th className="px-4 py-3 font-medium">{tr("Yön")}</th>
                <th className="px-4 py-3 font-medium">{tr("Giriş")}</th>
                <th className="px-4 py-3 font-medium">{closedView ? tr("Kapanış") : "SL / TP"}</th>
                <th className="px-4 py-3 font-medium">{tr("Lot")}</th>
                <th className="px-6 py-3 text-right font-medium">{closedView ? tr("Sonuç") : tr("Durum")}</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s) => {
                const isSell = s.direction === "SELL";
                const directionColor = isSell ? TICK_DOWN : TICK_UP;
                // GERÇEK hesap sonucu. Bir süre burada 1-lota indirgenmiş
                // değer gösterildi; küçük lotlarda bu sonucu 10-50 kat
                // şişiriyordu (0.30 lotluk −$631,50'lik bir işlem ekranda
                // −$2.105,00 görünüyordu). Ne olduğunu soran birine
                // verilecek tek dürüst cevap gerçekleşen tutar.
                const resultLine =
                  s.profit !== null ? formatPerLot(parseFloat(s.profit)) : null;
                // Past performance is public regardless of package — only
                // closedView's live/active counterpart is the gated product.
                const locked = closedView ? false : !canViewSignal(viewerTier, s.pair);
                return (
                  <tr key={s.id} className="border-b border-hairline last:border-0">
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono text-xs text-text-on-ink-muted">
                      {(closedView ? s.closedAt : s.createdAt)?.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-display font-semibold text-text-on-ink">
                      {s.pair}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {s.direction ? (
                        <span
                          className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                          style={{ borderColor: directionColor, color: directionColor }}
                        >
                          {s.direction}
                        </span>
                      ) : (
                        <span className="text-text-on-ink-muted">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-text-on-ink">
                      {locked ? "••••••" : s.entry}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {locked ? (
                        <span className="font-mono text-text-on-ink-muted">•••• / ••••</span>
                      ) : closedView ? (
                        <span className="font-mono text-text-on-ink">{s.closePrice ?? "—"}</span>
                      ) : (
                        <LevelPair target1={s.target1} stop={s.stop} />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-text-on-ink-muted">
                      {locked ? "—" : s.volume ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      {locked ? (
                        <LockBadge pair={s.pair} />
                      ) : closedView ? (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold text-on-signal"
                          style={{ background: outcomeColor(s.outcome) }}
                        >
                          {resultLine ?? s.outcome ?? "CLOSED"}
                        </span>
                      ) : (
                        <span className="rounded-full border border-signal px-2.5 py-1 text-xs font-semibold text-signal">
                          Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number) {
  if (!ms || ms <= 0) return "—";
  const totalMinutes = Math.round(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}g ${hours}s`;
  if (hours > 0) return `${hours}s ${minutes}dk`;
  return `${minutes}dk`;
}

function useCountUp(target: number, durationMs = 1400, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    // setTimeout instead of requestAnimationFrame — rAF is paused by the
    // browser while the tab is backgrounded/not compositing, which would
    // leave the counter stuck at 0 indefinitely; setTimeout keeps firing
    // (just throttled) so the count always reaches its target.
    let timer: ReturnType<typeof setTimeout>;
    const start = performance.now();
    const from = 0;
    function tick() {
      const t = Math.min(1, (performance.now() - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) timer = setTimeout(tick, 16);
    }
    tick();
    return () => clearTimeout(timer);
     
  }, [started, target, durationMs]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
  return { ref, display };
}

function PipsStats({ closed }: { closed: Signal[] }) {
  const tr = useTr();
  const locale = useLocale();
  const trf = useTrf();
  const intl = useIntlLocale();
  const decisive = closed
    .filter((s) => (s.outcome === "WIN" || s.outcome === "LOSS") && s.profit !== null)
    .slice()
    .sort((a, b) => (a.closedAt?.getTime() ?? 0) - (b.closedAt?.getTime() ?? 0));

  // GERÇEK hesap kâr/zararı toplanıyor.
  //
  // Kısa bir süre burada 1-lota indirgenmiş değerler toplandı ve bu bir
  // hataydı: 0.02 lotluk bir işlemi 1 lota çıkarmak onu 50 kat
  // ağırlıklandırıyor. Bu pencerede iki küçük lotlu işlem toplamı $5.518
  // yukarı çekerken gerçekte sadece $110 kazandırmışlardı. Gerçekleşen
  // tutarları toplamak tek dürüst yöntem; "kaç lotta ne eder" sorusu ise
  // artık her sinyalin kendi lot merdiveninde cevaplanıyor (LotLadder).
  const perLotValues = decisive.map((s) => parseFloat(s.profit as string));
  const totalPips = perLotValues.reduce((sum, p) => sum + p, 0);
  const wins = decisive.filter((s) => s.outcome === "WIN");
  const losses = decisive.filter((s) => s.outcome === "LOSS");
  const bestTrade = perLotValues.length ? Math.max(...perLotValues) : 0;
  const worstTrade = perLotValues.length ? Math.min(...perLotValues) : 0;

  const totalCount = useCountUp(totalPips, 1400, 2);
  const bestCount = useCountUp(bestTrade, 1200, 2);
  const worstCount = useCountUp(Math.abs(worstTrade), 1200, 2);

  // Kümülatif 1-lot-başına P/L serisi (sparkline).
  let running = 0;
  const cumulative = perLotValues.map((p) => (running += p));
  const points = cumulative.length > 0 ? cumulative : [0];
  const minY = Math.min(0, ...points);
  const maxY = Math.max(0, ...points);
  const rangeY = maxY - minY || 1;
  const W = 600;
  const H = 140;
  const stepX = points.length > 1 ? W / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = points.length > 1 ? i * stepX : W / 2;
    const y = H - ((p - minY) / rangeY) * H;
    return [x, y] as const;
  });
  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L${coords[coords.length - 1][0].toFixed(1)} ${H} L${coords[0][0].toFixed(1)} ${H} Z`
      : "";
  const zeroY = H - ((0 - minY) / rangeY) * H;
  const isPositive = totalPips >= 0;
  const lineColor = isPositive ? TICK_UP : TICK_DOWN;

  // Average trade duration, entry -> close.
  const durations = decisive
    .filter((s) => s.createdAt && s.closedAt)
    .map((s) => s.closedAt!.getTime() - s.createdAt.getTime());
  const avgDurationMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const avgDurationLabel = formatDuration(avgDurationMs);

  // Aylık 1-lot-başına P/L dağılımı.
  const monthlyMap = new Map<string, number>();
  for (const s of decisive) {
    const d = s.closedAt ?? s.createdAt;
    if (!d) continue;
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + parseFloat(s.profit ?? "0"));
  }
  const monthly = Array.from(monthlyMap.entries());
  const monthlyMax = Math.max(1, ...monthly.map(([, v]) => Math.abs(v)));

  // Per-pair breakdown.
  // Parite kırılımında toplamın yanına MEDYAN ve AYKIRI DEĞER işareti de
  // hesaplanıyor.
  //
  // Sebep: toplam tek bir işlem tarafından ele geçirilebiliyor ve o zaman
  // kazanma oranıyla toplam birbiriyle çelişiyormuş gibi görünüyor. SILVER
  // bunun canlı örneği — 8 işlem, %63 kazanma, ama net −$7.954, çünkü tek
  // bir 1.00 lotluk işlem −$10.836 kaybettirmiş ve 5 kazancın toplamından
  // (+$4.673) büyük. Veri doğru; eksik olan, okuyucunun bunu görebilmesi.
  //
  // Medyan tipik işlemi gösterir (SILVER'da +$207,50), aykırı değer işareti
  // ise "bu toplamı tek işlem belirledi" der. İkisi birlikte, rakamı
  // değiştirmeden anlaşılır kılıyor.
  type PairStat = {
    pair: string;
    total: number;
    count: number;
    wins: number;
    values: number[];
  };
  const pairMap = new Map<string, PairStat>();
  for (const s of decisive) {
    const key = s.pair;
    const entry = pairMap.get(key) ?? {
      pair: key,
      total: 0,
      count: 0,
      wins: 0,
      values: [],
    };
    const v = parseFloat(s.profit ?? "0");
    entry.total += v;
    entry.count += 1;
    entry.values.push(v);
    if (s.outcome === "WIN") entry.wins += 1;
    pairMap.set(key, entry);
  }

  const median = (nums: number[]) => {
    if (nums.length === 0) return 0;
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };

  const pairStats = Array.from(pairMap.values())
    .map((p) => {
      const biggest = Math.max(...p.values.map(Math.abs));
      // Tek bir işlem, tüm işlemlerin mutlak büyüklük toplamının yarısından
      // fazlasını oluşturuyorsa toplam o işlem tarafından belirleniyor demektir.
      const magnitude = p.values.reduce((s, v) => s + Math.abs(v), 0);
      return {
        ...p,
        med: median(p.values),
        dominated: p.count > 2 && magnitude > 0 && biggest / magnitude > 0.5,
      };
    })
    .sort((a, b) => b.total - a.total);
  const pairMax = Math.max(1, ...pairStats.map((p) => Math.abs(p.total)));

  if (decisive.length === 0) return null;

  // Kapsanan tarih aralığı veriden türetiliyor. Bir performans rakamının
  // yanında hangi dönemi ölçtüğü yazmazsa okuyucu kendi varsayımını yapar;
  // 13 günlük bir kayıt "yıllık performans" gibi okunabilir. Elle yazılan
  // bir tarih ise veriyle birlikte güncellenmez ve zamanla yalan olur.
  const firstAt = decisive[0]?.closedAt ?? decisive[0]?.createdAt ?? null;
  const lastAt =
    decisive[decisive.length - 1]?.closedAt ??
    decisive[decisive.length - 1]?.createdAt ??
    null;
  const rangeLabel =
    firstAt && lastAt
      ? `${firstAt.toLocaleDateString(intl, { day: "numeric", month: "long" })} – ${lastAt.toLocaleDateString(intl, { day: "numeric", month: "long", year: "numeric" })}`
      : null;

  return (
    <div
      ref={totalCount.ref}
      className="mt-10 overflow-hidden rounded-2xl border border-hairline bg-ink-soft p-6 md:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          {/* Etiket tamamen veriden türetiliyor: işlem sayısı da tarih
              aralığı da. Sayfa yalnızca son N kapanmış işlemi yüklüyor
              (signals/page.tsx → limit), dolayısıyla "Toplam" demek tüm
              geçmişi ima eder ve yanlış olur. Limit veya veri değişirse
              etiket kendiliğinden doğru kalır. */}
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">
            {trf("{count} İşlem — Gerçekleşen K/Z", { count: decisive.length })}
          </span>
          {rangeLabel && (
            <p className="mt-1 font-mono text-[11px] text-text-on-ink-muted">
              {rangeLabel}
            </p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span
              ref={totalCount.ref}
              className="font-display text-5xl font-bold tabular-stat md:text-6xl"
              style={{ color: lineColor }}
            >
              {isPositive ? "+" : "−"}${totalCount.display}
            </span>
          </div>
          {/* Rakamın ne olduğu ve ne OLMADIĞI birlikte yazılıyor: normalize
              edilmiş bir sinyal ölçüsü, hesap getirisi değil. Bu ayrım
              yazılmazsa sayı doğrudan getiri iddiası gibi okunuyor. */}
          <p className="mt-3 max-w-md text-xs leading-relaxed text-text-on-ink-muted">
            {tr("Her işlem 1.00 lotluk pozisyona indirgenerek toplanmıştır — böylece farklı enstrümanlar ve farklı lot büyüklükleri karşılaştırılabilir hale gelir.")}{" "}
            <strong className="text-text-on-ink">{tr("Bu bir getiri oranı değildir")}</strong>{tr("; gerçek sonucunuz kendi lot büyüklüğünüze ve giriş anınıza göre değişir.")}
          </p>
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">{tr("En İyi")}</div>
            <div ref={bestCount.ref} className="mt-1 font-display text-xl font-semibold" style={{ color: TICK_UP }}>
              +${bestCount.display}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">{tr("En Kötü")}</div>
            <div
              ref={worstCount.ref}
              className="mt-1 font-display text-xl font-semibold"
              style={{ color: TICK_DOWN }}
            >
              −${worstCount.display}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">W / L</div>
            <div className="mt-1 font-display text-xl font-semibold text-text-on-ink">
              <span style={{ color: TICK_UP }}>{wins.length}</span>
              <span className="text-text-on-ink-muted"> / </span>
              <span style={{ color: TICK_DOWN }}>{losses.length}</span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              {tr("Ort. Süre")}
            </div>
            <div className="mt-1 font-display text-xl font-semibold text-text-on-ink">{avgDurationLabel}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full md:h-40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pipsFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1={zeroY}
            x2={W}
            y2={zeroY}
            stroke="var(--text-on-ink-muted)"
            strokeOpacity="0.25"
            strokeDasharray="4 4"
          />
          {areaPath && (
            <path d={areaPath} fill="url(#pipsFade)" className="pips-area-in" />
          )}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pips-line-in"
              pathLength={1}
            />
          )}
          {coords.length > 0 && (
            <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="4" fill={lineColor} />
          )}
        </svg>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-text-on-ink-muted">
          <span>{decisive[0]?.closedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span>{trf("{count} işlem", { count: decisive.length })}</span>
          <span>
            {decisive[decisive.length - 1]?.closedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      {monthly.length > 1 && (
        <div className="mt-8 border-t border-hairline pt-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">
            {tr("Aylık Fiyat Farkı")}
          </span>
          <div className="mt-4 flex items-end gap-3">
            {monthly.map(([month, value], i) => {
              const barColor = value >= 0 ? TICK_UP : TICK_DOWN;
              const heightPct = Math.max(4, (Math.abs(value) / monthlyMax) * 100);
              return (
                <div key={month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-mono text-[11px] font-medium" style={{ color: barColor }}>
                    {value >= 0 ? "+" : ""}
                    {formatPerLot(value)}
                  </span>
                  <div className="flex h-24 w-full items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-md monthly-bar-in"
                      style={{
                        height: `${heightPct}%`,
                        background: barColor,
                        animationDelay: `${i * 80}ms`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-text-on-ink-muted">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pairStats.length > 0 && (
        <div className="mt-8 border-t border-hairline pt-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">
            {tr("Parite Bazında Performans")}
          </span>
          <div className="mt-4 space-y-3">
            {pairStats.map((p, i) => {
              const barColor = p.total >= 0 ? TICK_UP : TICK_DOWN;
              const widthPct = Math.max(3, (Math.abs(p.total) / pairMax) * 100);
              const pairWinRate = Math.round((p.wins / p.count) * 100);
              return (
                <div key={p.pair} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 font-display text-sm font-semibold text-text-on-ink">
                    {p.pair}
                  </span>
                  <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-ink">
                    <div
                      className="pair-bar-in h-full rounded-md"
                      style={
                        {
                          "--final-width": `${widthPct}%`,
                          background: `${barColor}4d`,
                          borderRight: `2px solid ${barColor}`,
                          animationDelay: `${i * 70}ms`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  <span
                    className="w-20 shrink-0 text-right font-mono text-xs font-semibold"
                    style={{ color: barColor }}
                  >
                    {p.total >= 0 ? "+" : ""}
                    {formatPerLot(p.total)}
                  </span>
                  {/* Medyan: toplamın yanındaki "tipik işlem" ölçüsü.
                      Toplam tek bir uç işlemle ele geçirilebiliyor, medyan
                      geçirilemiyor. */}
                  <span
                    className="w-24 shrink-0 text-right font-mono text-[11px]"
                    style={{ color: p.med >= 0 ? TICK_UP : TICK_DOWN }}
                    title={tr("Medyan işlem sonucu")}
                  >
                    {tr("ort.")} {formatPerLot(p.med)}
                  </span>
                  <span className="w-20 shrink-0 text-right font-mono text-[11px] text-text-on-ink-muted">
                    {trf("{count} işlem", { count: p.count })}
                  </span>
                  <span className="w-12 shrink-0 text-right font-mono text-[11px] text-text-on-ink-muted">
                    {formatPercent(pairWinRate, locale)}
                  </span>
                  {/* Toplamı tek işlem belirlediyse söylenir. Aksi halde
                      "%63 kazanma ama net eksi" satırı çelişkili görünüyor
                      ve okuyucu veriye güvenmiyor. */}
                  <span className="w-5 shrink-0 text-right">
                    {p.dominated && (
                      <span
                        title={tr("Bu toplamın yarısından fazlasını tek bir işlem oluşturuyor — medyana bakın")}
                        className="cursor-help font-mono text-[11px] text-gold"
                      >
                        ⚠
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-on-ink-muted">
            <span className="text-gold">⚠</span>{" "}
            {tr("işareti, o paritedeki toplamın yarısından fazlasının tek bir işlemden geldiğini gösterir. Böyle durumlarda toplam yerine")}{" "}
            <strong className="text-text-on-ink">{tr("ort.")}</strong>{" "}
            {tr("(medyan) sütununa bakın — tipik işlemin nasıl sonuçlandığını o söyler.")}
          </p>
        </div>
      )}
    </div>
  );
}

// Flags for the pair mark. Only the currencies we actually quote — an
// unmapped leg falls back to its three-letter code, which is what metals,
// indices and crypto get anyway (there is no flag for XAU or US100).
const CURRENCY_FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CHF: "🇨🇭",
  CAD: "🇨🇦", AUD: "🇦🇺", NZD: "🇳🇿", TRY: "🇹🇷", CNH: "🇨🇳",
  SEK: "🇸🇪", NOK: "🇳🇴", ZAR: "🇿🇦", MXN: "🇲🇽", PLN: "🇵🇱",
};

/** EURUSD -> ["EUR","USD"]; anything else stays whole. */
function splitPair(pair: string): [string, string | null] {
  const p = pair.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (p.length === 6 && /^[A-Z]{6}$/.test(p)) return [p.slice(0, 3), p.slice(3)];
  return [p, null];
}

function prettyPair(pair: string): string {
  const [base, quote] = splitPair(pair);
  return quote ? `${base}/${quote}` : base;
}

// Two overlapping tokens for an FX pair, one for everything else — the
// visual anchor that tells you which market a row is about before you read
// anything.
function PairMark({ pair }: { pair: string }) {
  const [base, quote] = splitPair(pair);
  const token = (code: string, i: number) => {
    const flag = CURRENCY_FLAG[code];
    return (
      <span
        key={i}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-ink text-base ${
          i > 0 ? "-ml-3" : ""
        }`}
        style={{ zIndex: 2 - i }}
        aria-hidden="true"
      >
        {flag ?? <span className="font-mono text-[9px] font-semibold text-text-on-ink-muted">{code.slice(0, 3)}</span>}
      </span>
    );
  };
  return (
    <span className="flex shrink-0 items-center">
      {quote ? [token(base, 0), token(quote, 1)] : token(base, 0)}
    </span>
  );
}

// "3 sa önce" — the age of the signal at a glance, the way the reference
// layout carries it. Falls back to the absolute date past a week, where
// "9 g önce" stops being useful.
function relativeAge(date: Date | null, intlLocale: string, tr: (t: string) => string): string {
  if (!date) return "";
  const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 1) return tr("şimdi");
  if (mins < 60) return `${mins} ${tr("dk önce")}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${tr("sa önce")}`;
  const days = Math.round(hours / 24);
  if (days <= 7) return `${days} ${tr("g önce")}`;
  return date.toLocaleDateString(intlLocale, { day: "numeric", month: "short", year: "numeric" });
}

function LevelCell({
  label,
  value,
  color,
  locked,
}: {
  label: string;
  value: string | null;
  color?: string;
  locked?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">{label}</div>
      <div
        className="mt-1 truncate font-mono text-sm font-semibold tabular-stat"
        style={{ color: locked ? "var(--text-on-ink-muted)" : color ?? "var(--text-on-ink)" }}
      >
        {locked ? "••••" : value ?? "—"}
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SignalCard({ signal, viewerTier }: { signal: Signal; viewerTier: AccessTier | null }) {
  const tr = useTr();
  const trf = useTrf();
  const intl = useIntlLocale();
  const [open, setOpen] = useState(false);
  const lock = lockPrompt(signal.pair, trf);
  const isBuy = signal.direction === "BUY";
  const isSell = signal.direction === "SELL";
  const directionColor = isSell ? TICK_DOWN : TICK_UP;
  const isClosed = signal.status === "closed";
  // Past performance is public regardless of package — only open/active
  // signals are gated.
  const locked = isClosed ? false : !canViewSignal(viewerTier, signal.pair);

  // Kartta da gerçekleşen tutar gösteriliyor; "kaç lotta ne eder" sorusunu
  // aşağıdaki LotLadder cevaplıyor.
  const resultLine =
    signal.profit !== null ? formatPerLot(parseFloat(signal.profit)) : null;
  // Kapanmışsa gerçekleşen hareket, açıksa hedefe kadarki potansiyel hareket.
  const ladderMove = isClosed
    ? favorableMove(signal.entry, signal.closePrice, signal.direction)
    : favorableMove(signal.entry, signal.target1, signal.direction);
  // Rakamın neyi ifade ettiği rakamın yanında durmalı; "1 lot başına"
  // olmadan bu sayı bir hesap getirisi gibi okunuyor.
  const resultUnit = null;
  const resultColor = outcomeColor(signal.outcome);

  const openedAt = signal.createdAt;
  const closedAt = signal.closedAt;
  const age = relativeAge(isClosed ? closedAt : openedAt, intl, tr);
  const panelId = `signal-panel-${signal.id}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-gradient-to-b from-ink-soft to-ink shadow-[0_20px_50px_-25px_rgba(0,0,0,0.7)]">
      {/* Header row: identity, the three levels, the action. Everything a
          reader needs to decide whether to open the row at all. */}
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex min-w-0 items-center gap-3 lg:w-[24%] lg:shrink-0">
          <PairMark pair={signal.pair} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="notranslate font-display text-base font-semibold text-text-on-ink">
                {prettyPair(signal.pair)}
              </span>
              {(isBuy || isSell) && (
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: `${directionColor}26`, color: directionColor }}
                >
                  {signal.direction}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-on-ink-muted">
              {isClosed ? (
                <span className="font-semibold" style={{ color: resultColor }}>
                  {signal.outcome ?? tr("KAPANDI")}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-medium uppercase tracking-wide text-signal">
                  <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
                  {tr("Aktif")}
                </span>
              )}
              {age && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{age}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-3 sm:gap-6">
          <LevelCell label={tr("Giriş Fiyatı")} value={signal.entry} locked={locked} />
          <LevelCell label={tr("Zarar Durdur")} value={signal.stop} color={TICK_DOWN} locked={locked} />
          <LevelCell label={tr("Kâr Al")} value={signal.target1} color={TICK_UP} locked={locked} />
        </div>

        {isClosed && resultLine && !locked && (
          <div className="min-w-0 lg:w-[13%] lg:shrink-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">
              {tr("Sonuç")}
            </div>
            <div className="mt-1 font-display text-lg font-bold tabular-stat" style={{ color: resultColor }}>
              {resultLine}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 lg:shrink-0">
          {locked ? (
            <Link
              href={lock.href}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-[12px] font-semibold text-gold transition-colors hover:border-gold hover:bg-gold/20"
            >
              🔒 {lock.badge}
            </Link>
          ) : (
            /* Only while the trade is still open — "copy this trade" on a
               position that closed days ago is an offer the reader cannot
               take, and the history list is long enough that it would put
               a hundred identical sponsored pills on one page. */
            !isClosed && <TradeNowButton variant="inline" />
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? tr("Detayı kapat") : tr("Detayı aç")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline text-text-on-ink-muted transition-colors hover:border-signal hover:text-signal"
          >
            <Chevron open={open} />
          </button>
        </div>
      </div>

      {/* The chart mounts only once a row is opened — one TradingView embed
          per visible card would be several heavy iframes on a page that
          already polls every 15s. */}
      {open && (
        <div id={panelId} className="border-t border-hairline bg-ink/60 p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
            <div className="min-w-0">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {tr("Sinyal Detayı")}
              </h3>
              <div className="mt-3 space-y-1.5">
                <Level
                  label={tr("Açılış")}
                  value={
                    openedAt
                      ? openedAt.toLocaleString(intl, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                        })
                      : null
                  }
                  color="var(--text-on-ink)"
                />
                {isClosed && (
                  <Level
                    label={tr("Kapanış")}
                    value={
                      closedAt
                        ? closedAt.toLocaleString(intl, {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "UTC",
                          })
                        : null
                    }
                    color="var(--text-on-ink)"
                  />
                )}
                {isClosed && !locked && (
                  <Level label={tr("Kapanış Fiyatı")} value={signal.closePrice} color="var(--text-on-ink)" />
                )}
                {!locked && <Level label={tr("Kâr Al 2")} value={signal.target2} color={TICK_UP} />}
                {signal.volume && (
                  <Level label={tr("Hacim")} value={`${signal.volume} lot`} color="var(--text-on-ink-muted)" />
                )}
              </div>

              {/* Lot merdiveni: "bu sinyali kendi lotumla uygulasaydım ne
                  olurdu" sorusunun cevabı. Kapanmış işlemde gerçekleşen,
                  açık işlemde hedefe kadarki hareket üzerinden. Kilitli
                  sinyalde gösterilmez — seviyeler zaten gizli. */}
              {!locked && (
                <div className="mt-4">
                  <LotLadder pair={signal.pair} priceMove={ladderMove} />
                </div>
              )}

              <p className="mt-4 text-[11px] leading-relaxed text-text-on-ink-muted">
                {tr("Bu sinyal, takip edilen FXPARTNER MT5 hesabından otomatik olarak iletildi. Yatırım tavsiyesi değildir.")}
              </p>

              {!locked && !isClosed && <TradeNowButton variant="card" />}
            </div>

            <TradingViewChart symbol={signal.pair} className="h-[280px] sm:h-[340px]" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignalsBoard({
  initialActive,
  initialClosed,
  liveMarkets,
  viewerTier,
}: {
  initialActive: Signal[];
  initialClosed: Signal[];
  liveMarkets?: ReactNode;
  viewerTier: AccessTier | null;
}) {
  const tr = useTr();
  const [active, setActive] = useState(initialActive);
  const [closed, setClosed] = useState(initialClosed);
  const knownIds = useRef(new Set([...initialActive, ...initialClosed].map((s) => s.id)));

  const chartPairs = useMemo(() => {
    const seen = new Set<string>();
    const pairs: string[] = [];
    for (const s of active) {
      const p = s.pair.toUpperCase();
      if (!seen.has(p)) {
        seen.add(p);
        pairs.push(p);
      }
    }
    // Falls back to majors when there's no active signal yet, so the chart
    // panel still has something meaningful to show instead of going empty.
    return pairs.length > 0 ? pairs.slice(0, 6) : ["EURUSD", "GBPUSD", "XAUUSD", "USDJPY"];
  }, [active]);
  const [chartSymbol, setChartSymbol] = useState(chartPairs[0]);

  // Keeps the chart pointed at a still-active pair — if the selected pair's
  // signal closes and drops off chartPairs, snap back to the new first pair
  // rather than silently charting a symbol that's no longer being traded.
  useEffect(() => {
    if (!chartPairs.includes(chartSymbol)) setChartSymbol(chartPairs[0]);
  }, [chartPairs, chartSymbol]);

  // Unlocks the chime's AudioContext on the visitor's first interaction
  // anywhere on the page — required by browser autoplay policy, and cheap
  // to attach unconditionally since unlockAudio() no-ops after the first call.
  useEffect(() => {
    document.addEventListener("pointerdown", unlockAudio, { once: true });
    document.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/signals", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data: { active: SignalJson[]; closed: SignalJson[] } = await res.json();
        if (cancelled) return;
        // Chime only for brand-new active signals — a new closed-trade
        // result isn't something a member needs to react to immediately,
        // and it would fire on every result the moment the board loads.
        const hasNewActiveSignal = data.active.some((s) => !knownIds.current.has(s.id));
        if (hasNewActiveSignal) playSignalChime();
        setActive(data.active.map(toSignal));
        setClosed(data.closed.map(toSignal));
        for (const s of [...data.active, ...data.closed]) knownIds.current.add(s.id);
      } catch {
        // Transient fetch failure — next poll tick will retry.
      }
    }

    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Only WIN/LOSS count toward the win rate — a breakeven close is neither.
  const decisive = closed.filter((s) => s.outcome === "WIN" || s.outcome === "LOSS");
  const wins = decisive.filter((s) => s.outcome === "WIN").length;
  const winRate = decisive.length > 0 ? Math.round((wins / decisive.length) * 100) : null;

  return (
    <>
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">{tr("Canlı Sinyaller")}</span>
            <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{tr("Gerçek Zamanlı İşlem Sinyalleri")}</h1>
            <p className="mt-4 max-w-2xl text-text-on-ink-muted">
              {tr("Aşağıdaki her sinyal, otomatik bir EA aracılığıyla doğrudan takip edilen MT5 hesabımızdan gelir — Telegram kanalımızda ve X'te paylaşılanlarla aynı girişler, her işlem kapandığında gerçek ve doğrulanmış bir sonuçla birlikte. Burada hiçbir şey simüle edilmemiş veya sonradan eklenmemiştir.")}
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-10">
              <div>
                <div className="font-display text-3xl font-semibold">{active.length}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("Aktif Sinyaller")}
                </div>
              </div>
              <div>
                <div className="font-display text-3xl font-semibold">{decisive.length}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("Kapanan İşlemler")}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <PerformanceRing rate={winRate} />
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("Kazanma Oranı")}
                  {decisive.length > 0 && decisive.length < 10 ? ` ${tr("(erken veri)")}` : ""}
                </div>
              </div>
            </div>
          </div>

          <PipsStats closed={closed} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">{tr("Aktif Sinyaller")}</h2>
          <span className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-signal md:flex">
            <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
            {tr("Canlı")}
          </span>
        </div>
        {active.length === 0 ? (
          <p className="text-text-on-ink-muted">
            {tr("Şu anda açık sinyal yok — bir sonrakini paylaşıldığı anda almak için")}{" "}
            <a href="https://t.me/fxpartnerglobal" className="text-signal hover:text-signal-strong">
              {tr("Telegram kanalımızı")}
            </a>{" "}
            takip edin.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {active.map((s) => (
              <SignalCard key={s.id} signal={s} viewerTier={viewerTier} />
            ))}
          </div>
        )}
      </section>

      {liveMarkets}

      <section className="border-b border-hairline bg-ink-soft/30">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">{tr("Canlı Grafik")}</h2>
            <div className="flex flex-wrap gap-2">
              {chartPairs.map((pair) => (
                <button
                  key={pair}
                  type="button"
                  onClick={() => setChartSymbol(pair)}
                  className={`notranslate rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                    chartSymbol === pair
                      ? "border-signal bg-signal/15 text-signal"
                      : "border-hairline text-text-on-ink-muted hover:border-text-on-ink hover:text-text-on-ink"
                  }`}
                >
                  {pair}
                </button>
              ))}
            </div>
          </div>
          {/* One column, the same one the Aktif Sinyaller cards sit in: the
              chart spans the full content width and the performance panel
              runs underneath it as a strip rather than stealing a third of
              the row. */}
          <div className="flex flex-col gap-6">
            <TradingViewChart symbol={chartSymbol} />
            <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-hairline bg-ink p-6 sm:flex-row sm:gap-10">
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("Performans")}
                </span>
                <PerformanceRing rate={winRate} />
              </div>
              <div className="grid w-full grid-cols-3 gap-2 border-t border-hairline pt-5 text-center sm:flex-1 sm:border-l sm:border-t-0 sm:pl-10 sm:pt-0">
                <div>
                  <div className="tabular-stat font-display text-xl font-semibold">
                    {active.length + closed.length}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                    {tr("Toplam Sinyal")}
                  </div>
                </div>
                <div>
                  <div className="tabular-stat font-display text-xl font-semibold text-tick-up">
                    {wins}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                    {tr("Kazanılan")}
                  </div>
                </div>
                <div>
                  <div className="tabular-stat font-display text-xl font-semibold text-tick-down">
                    {decisive.length - wins}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                    {tr("Kaybedilen")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold md:hidden">Son Sinyaller</h2>
          <SignalTable title="Son Sinyaller" signals={closed} closedView viewerTier={viewerTier} />
          {closed.length === 0 ? (
            <p className="mt-4 text-text-on-ink-muted md:hidden">
              {tr("Henüz kapanan sinyal yok — işlemler kapandıkça sonuçlar burada görünecek.")}
            </p>
          ) : (
            <div className="mt-6 flex flex-col gap-4 md:hidden">
              {closed.map((s) => (
                <SignalCard key={s.id} signal={s} viewerTier={viewerTier} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
