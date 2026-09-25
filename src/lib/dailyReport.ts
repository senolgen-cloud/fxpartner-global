import { and, asc, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { SIGNAL_TZ, SIGNALS_EPOCH } from "@/lib/signalPeriods";

/**
 * Gün sonu raporunun veri katmanı — /gun-sonu sayfası, paylaşım görseli ve
 * /api/cron/daily-report üçü de buradan besleniyor.
 *
 * Gün sınırı SIGNAL_TZ (Europe/Istanbul). Sitenin geri kalanı da öyle
 * (signalPeriods.ts): "bugün" okurun yaşadığı gün, saat 03:00'te biten bir
 * UTC günü değil. Rapor 00:00'da BİTEN günü anlatır, o yüzden cron gece
 * yarısı çalıştığında dünün tarihini ister.
 *
 * İşlemler kapanış zamanına göre toplanır, açılış zamanına göre değil: bir
 * gün önce açılıp bugün kapanan pozisyonun kâr/zararı bugünün hanesine
 * yazılır, tıpkı takvimdeki gibi (SignalCalendar).
 */

export type DailyTrade = {
  pair: string;
  direction: string | null;
  volume: string | null;
  entry: string;
  closePrice: string | null;
  profit: number;
  outcome: "WIN" | "LOSS";
  closedAt: Date;
};

export type DailyReport = {
  /** YYYY-MM-DD, Istanbul takviminde. */
  date: string;
  trades: DailyTrade[];
  total: number;
  wins: number;
  losses: number;
  best: DailyTrade | null;
  worst: DailyTrade | null;
  /** Parite bazında toplam, büyükten küçüğe. */
  byPair: { pair: string; total: number; count: number }[];
};

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: SIGNAL_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Bir anın Istanbul takvimindeki günü, YYYY-MM-DD. */
export function istanbulDayKey(instant: Date): string {
  return dayKeyFormat.format(instant);
}

/**
 * YYYY-MM-DD gününün Istanbul'daki başlangıcı ve bitişi, UTC anları olarak.
 *
 * Istanbul yıl boyu UTC+3 (2016'dan beri yaz saati uygulaması yok), ama ofset
 * sabit yazılmıyor: tarih Intl'e sorularak bulunuyor ki mevzuat değişirse
 * hesap kendiliğinden doğru kalsın — signalPeriods.ts'teki startOfDayInTz ile
 * aynı gerekçe.
 */
export function istanbulDayRange(date: string): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;

  // Aynı duvar saatini veren UTC anını bul, sonra o andaki gerçek ofseti
  // ölçüp düzelt.
  const guess = Date.UTC(y, m - 1, d, 0, 0, 0);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SIGNAL_TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(guess));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const asTz = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"));
  const offset = asTz - guess;
  const start = new Date(guess - offset);
  const end = new Date(start.getTime() + 86_400_000);
  return { start, end };
}

/** Raporun anlattığı gün: şu an itibarıyla en son BİTEN Istanbul günü. */
export function lastCompletedDay(now: Date = new Date()): string {
  const todayStart = istanbulDayRange(istanbulDayKey(now));
  const ref = todayStart ? new Date(todayStart.start.getTime() - 1) : new Date(now.getTime() - 86_400_000);
  return istanbulDayKey(ref);
}

export async function getDailyReport(date: string): Promise<DailyReport | null> {
  const range = istanbulDayRange(date);
  if (!range) return null;

  const rows = await db.query.tradeSignals.findMany({
    where: and(
      eq(tradeSignals.status, "closed"),
      gte(tradeSignals.closedAt, range.start),
      lt(tradeSignals.closedAt, range.end),
      // Kayıt başlangıcından önceki işlemler siteye hiç girmiyor; rapor da
      // /signals panosunun gösterdiği kaydı anlatır, ondan fazlasını değil.
      gte(tradeSignals.createdAt, SIGNALS_EPOCH)
    ),
    orderBy: asc(tradeSignals.closedAt),
  });

  const trades: DailyTrade[] = rows
    .filter((r) => (r.outcome === "WIN" || r.outcome === "LOSS") && r.profit !== null && r.closedAt)
    .map((r) => ({
      pair: r.pair,
      direction: r.direction,
      volume: r.volume,
      entry: r.entry,
      closePrice: r.closePrice,
      profit: parseFloat(r.profit as string),
      outcome: r.outcome as "WIN" | "LOSS",
      closedAt: r.closedAt as Date,
    }));

  const total = trades.reduce((s, t) => s + t.profit, 0);
  const wins = trades.filter((t) => t.outcome === "WIN").length;
  const pairMap = new Map<string, { pair: string; total: number; count: number }>();
  for (const t of trades) {
    const e = pairMap.get(t.pair) ?? { pair: t.pair, total: 0, count: 0 };
    e.total += t.profit;
    e.count += 1;
    pairMap.set(t.pair, e);
  }

  return {
    date,
    trades,
    total,
    wins,
    losses: trades.length - wins,
    best: trades.length ? trades.reduce((a, b) => (b.profit > a.profit ? b : a)) : null,
    worst: trades.length ? trades.reduce((a, b) => (b.profit < a.profit ? b : a)) : null,
    byPair: [...pairMap.values()].sort((a, b) => b.total - a.total),
  };
}

/** Son N günün rapor özetleri (boş günler atlanır) — /gun-sonu dizini için. */
export async function getRecentReportDays(days = 30, now: Date = new Date()): Promise<
  { date: string; total: number; count: number }[]
> {
  const out: { date: string; total: number; count: number }[] = [];
  const last = lastCompletedDay(now);
  const lastRange = istanbulDayRange(last);
  if (!lastRange) return out;

  for (let i = 0; i < days; i++) {
    const key = istanbulDayKey(new Date(lastRange.start.getTime() - i * 86_400_000 + 3_600_000));
    const report = await getDailyReport(key);
    if (report && report.trades.length > 0) {
      out.push({ date: key, total: report.total, count: report.trades.length });
    }
  }
  return out;
}

/** "25 Eylül 2026 Cuma" — rapor başlığı ve paylaşım metni için. */
export function formatDayLabel(date: string, locale = "tr-TR"): string {
  const range = istanbulDayRange(date);
  if (!range) return date;
  return new Date(range.start.getTime() + 43_200_000).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: SIGNAL_TZ,
  });
}

export function formatUsd(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}
