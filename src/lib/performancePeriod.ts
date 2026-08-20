// Yayınlanan performansın hangi tarihten itibaren geçerli sayılacağı.
//
// NEDEN VAR:
// Ağustos 2026 bir deneme dönemiydi — EA yapılandırması, lot büyüklükleri ve
// enstrüman seti oturmamıştı; hesapta ayrıca MT5 tarafında düzeltilen kayıtlar
// oldu. Bu dönemin sonuçlarını canlı performans olarak yayımlamak, ölçmediğimiz
// bir şeyi ölçüyormuş gibi göstermek olurdu.
//
// ÇÖZÜM, VERİYİ SİLMEK DEĞİL AYIRMAK:
// Deneme dönemi işlemleri veritabanında durmaya devam eder ve geçmişte
// "Deneme" etiketiyle görünür; ama yayınlanan kazanma oranı ve K/Z
// toplamlarına GİRMEZ. Böylece hem kayıt bütünlüğü korunur (bu işlemlerin
// büyük kısmı Telegram ve X'e canlı gönderildi, orada duruyorlar) hem de
// yayınlanan rakam gerçekten temsil ettiği dönemi ölçer.
//
// Kârlı işlemleri tutup zararlıları elemek yerine dönemin TAMAMI ayrılıyor —
// aksi halde geriye kalan şey deneme verisi olmaktan çıkıp seçilmiş veri olur.

/** Canlı performans yayınının başladığı an (UTC). */
export const LIVE_PERFORMANCE_START = new Date("2026-09-01T00:00:00Z");

/** Bu işlem deneme döneminden mi? */
export function isTestPeriod(date: Date | null | undefined): boolean {
  if (!date) return false;
  return date < LIVE_PERFORMANCE_START;
}

/** Yalnızca canlı dönem işlemleri — yayınlanan her istatistik bunu kullanır. */
export function livePeriodOnly<T extends { closedAt?: Date | null; createdAt: Date }>(
  rows: T[]
): T[] {
  return rows.filter((r) => !isTestPeriod(r.closedAt ?? r.createdAt));
}

export const TEST_PERIOD_LABEL = "Deneme";

export const TEST_PERIOD_NOTE =
  "Ağustos 2026 deneme dönemidir: EA yapılandırması ve lot büyüklükleri bu " +
  "dönemde test edildi. Bu işlemler geçmişte görünür ancak yayınlanan " +
  "performans istatistiklerine dahil edilmez. Canlı performans yayını " +
  "1 Eylül 2026'da başlar.";
