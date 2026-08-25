# FXPARTNER MT5 EA'ları

Bu klasördeki dört EA, sinyal servisinin farklı parçalarını yürütür. Hangisinin
nerede çalıştığını karıştırmak, sessizce yanlış işlem açmanın en kolay yoludur —
önce bu tabloyu okuyun.

| Dosya | Nerede çalışır | Ne yapar |
|---|---|---|
| **FXPARTNER_SignalEngineEA.mq5** | Sinyal (master) hesabı | **Sinyalleri üretir ve yayınlar.** Çok sembollü tarama, yapısal stop, güven skoru, risk ve işlem yönetimi. |
| FXPARTNER_TradeSignal.mq5 | Sinyal (master) hesabı | SignalEngine'inkiler **hariç** her pozisyonu `/api/trade-signal` ve `/api/trade-result` uçlarına bildirir → Telegram/X kartları. Açık işlemde SL/TP değişirse veya kısmi kapanış olursa `/api/trade-update` ile sitedeki kartı da düzeltir (v1.40). |
| FXPARTNER_IntradayEA.mq5 | (eski) sinyal hesabı | Tek sembollü, yüksek frekanslı önceki motor. SignalEngine'in yerini aldığı EA. |
| FXPARTNER_CopierEA.mq5 | Üyenin kendi hesabı | Sitedeki aktif sinyalleri üyenin hesabına kopyalar. |

---

## SignalEngine — neden yazıldı

`FXPARTNER_IntradayEA.mq5` zamanla **sinyal adedi** için ayarlandı: EMA20 trend
filtresi, 45/55 RSI bandı, 0.7 ATR stop, sembol başına günde ~7-8 kurulum. Kendi
başlığında da yazıyor: *"trade count went up because the edge requirement went
down."*

Sonuçları satan, her işlemi Telegram ve X'te yayınlayan ve `/signals` sayfasında
kazanma oranını herkese açık gösteren bir servis için bu yanlış takas. SignalEngine
önceliği tersine çevirir: **daha az kurulum, her biri çok zaman dilimli uyum,
yapısal stop ve puanlanmış bir güven skorundan geçmiş.**

Somut farklar:

- **Tek grafikten çok sembol.** Paketler FX (ücretsiz), metal/endeks (Pro) ve
  kripto/enerji (VIP) satıyor. Sembol başına grafik açma modelinde VIP üyeler
  ancak BTCUSD grafiği açmayı hatırladığınız günlerde kripto sinyali alır. Burada
  kapsama bir alışkanlık değil, bir ayar (`InpSymbols`).
- **Yapısal stop.** Stop, kurulumu geçersiz kılan gerçek swing'in ATR kadar
  ötesine konur. Yayınlanan bir SL, okuyucunun kendi grafiğinde görebileceği bir
  seviye olmalı — keyfi bir mesafe değil.
- **Güven skoru (0-100).** `/api/trade-signal` ucu `confidence` ve `target2`
  parametrelerini baştan beri kabul ediyordu; hiçbir şey göndermiyordu. Artık
  gönderen bir şey var.
- **Sinyal temposu.** Günlük tavan, sembol başına tavan, iki sinyal arası minimum
  süre ve zarar sonrası bekleme. Kanal bir seansta 40 GOLD sinyali atmasın diye.
- **Portföy riski.** Tek işlem riskinin yanında: toplam açık risk tavanı, para
  birimi başına pozisyon tavanı (korelasyon freni), günlük zarar freni, zirveden
  düşüş kilidi ve her emirden önce marj kontrolü.

---

## Kurulum

1. `FXPARTNER_SignalEngineEA.ex5` dosyasını MT5'in `MQL5/Experts` klasörüne
   kopyalayın (ya da `.mq5`'i MetaEditor'de derleyin).
2. **Herhangi bir** grafiğe ekleyin. O grafiğin sembolü ve periyodu önemsizdir —
   motor her sembol için `InpWorkingTf` / `InpBiasTf` değerlerini kendisi okur.
3. `InpSymbols`'ü **kendi brokerınızın** sembol adlarıyla doldurun. Broker
   `EURUSDm` gibi ekler kullanıyorsa `InpSymbolPrefix` / `InpSymbolSuffix`
   ayarlayın. Bulunamayan semboller Journal'a yazılır ve atlanır — ilk çalıştırma
   sonrası Journal'ı mutlaka okuyun.
4. ⚠️ **`InpDryRun` varsayılan olarak `false` — yani EA'yı grafiğe eklediğiniz an
   gerçek emir açar ve ilk işlemi doğrudan Telegram/X'e yayınlar.** Sessiz
   çalıştırmak isterseniz `true` yapın: emir açmaz, alacağı her kurulumu skoruyla
   Journal'a yazar. Motorun kurallarını kanal görmeden önce görmenin tek yolu bu,
   ve ilk hafta için hâlâ önerilen mod.
5. `InpApiSecret`'i doldurun ve WebRequest izin listesini ekleyin (aşağıya bakın),
   yoksa emirler açılır ama yayın gitmez.

### Hedging hesabı gerekir

Netting hesapta aynı sembolde ikinci pozisyon mevcut olanı değiştirir; sinyal
başına stop/TP yönetimi, kısmi kapama ve raporlama bozulur. EA başlangıçta bunu
tespit edip Journal'a uyarı yazar ama sizin yerinize karar vermez.

---

## Yayınlama: kim neyi yayınlar

İki EA da aynı hesapta çalışır ve ikisi de yayın yapabilir. Aynı işlemi iki kez
yayınlamamaları için görev paylaşımı **magic number** üzerinden kurulur:

| EA | Ayar | Yayınladığı |
|---|---|---|
| **SignalEngine** | `InpReportToSite = true`, `InpMagic = 990300` | Kendi işlemleri — **güven skoru ve TP2 ile** |
| **TradeSignal** | `InpMagicExclude = 990300` | 990300 **dışındaki** her şey: elle açtığınız işlemler, IntradayEA, vb. |

İki varsayılan birbirine uyumlu geliyor, ekstra ayar gerekmiyor. Tek kural:
**SignalEngine'in `InpMagic`'ini değiştirirseniz TradeSignal'in `InpMagicExclude`'unu
da aynı değere çekin.** Yoksa her işlem Telegram ve X'e iki kez düşer — veritabanı
`ticket` üzerinden tekrarı yok sayar ama gönderi gider.

`InpMagicExclude = 0` yaparsanız hariç tutma kapanır (eski davranış).

### Gereken ayarlar

- SignalEngine `InpApiSecret` → `.env` içindeki `TRADE_SIGNAL_SECRET` değeri.
  Boşsa EA başlangıçta uyarır ve hiçbir sinyal gitmez.
- MT5 > Araçlar > Seçenekler > Uzman Danışmanlar > "Listelenen URL için
  WebRequest'e izin ver" → `https://fxpartner.global`
- `InpDryRun` artık varsayılan `false`: yayın **ilk işlemle birlikte başlar**.
  `true` yaparsanız emir açılmadığı için raporlanacak işlem de olmaz, yani
  hiçbir şey yayınlanmaz.

---

## Güven skoru nasıl hesaplanır

**Zorunlu koşullar** (skor bunları satın alamaz — sağlanmazsa kurulum yoktur):

- Çalışma zaman diliminde net bir trend yönü (kapanış, trend EMA'nın bir tarafında)
- Hızlı EMA'ya geri çekilme **ve** oradan trend yönünde kapanış
- ATR / fiyat ≥ `InpMinAtrPercent` (ölü piyasa filtresi)
- Yapısal stop, `InpMinStopAtr` – `InpMaxStopAtr` ATR bandının içinde

**Puanlanan faktörler** (toplam 100):

| Faktör | Puan |
|---|---|
| Bias zaman dilimi (varsayılan H4) aynı yönde | 30 |
| Bias EMA'sının eğimi aynı yönde | 10 |
| RSI momentum dönüşü (50 bandına dokunup geri döndü) | 20 |
| Derin geri çekilme (trend EMA'sına kadar geldi) | 10 |
| RSI aşırı uzamamış | 10 |
| Giriş, trend EMA'sından ≤ 1.5 ATR uzakta | 10 |
| Spread, stop mesafesinin ≤ %5'i | 10 (≤ %7.2 ise 5) |

`InpMinConfidence` (varsayılan 60) altındaki kurulumlar alınmaz. Bu sayı kartın
üzerinde yayınlandığı için eşiğin altındaki bir kurulumu yine de almak, skoru
süse çevirirdi — o yüzden eşik gerçekten bağlayıcı.

---

## İşlem yönetimi

1. **Giriş:** piyasa emri, SL yapısal seviyede, broker TP'si TP2'de.
2. **TP1'de:** hacmin `InpPartialAtTp1Percent` kadarı kapatılır, stop başabaşa
   çekilir (`InpBreakevenBufferR` kadar lehte — komisyon payı).
3. **`InpTrailStartR` kârdan sonra:** stop, fiyatın `InpTrailDistanceR` kadar
   R gerisinde iz sürer. Stop asla gevşetilmez.
4. **`InpMaxTradeHours`** (varsayılan 0 = kapalı): süresi dolan pozisyon piyasadan
   kapatılır.

Pozisyon başına durum (açılış stopu, TP1, hangi adımların yapıldığı) terminal
global değişkenlerinde tutulur; EA yeniden başlatılsa da kısmi kapama iki kez
çalışmaz, 1R hesabı kaybolmaz. Durumu bulunamayan bir pozisyon (elle açılmış ya da
EA yeniden kurulmuş) mevcut stopuyla **devralınır** ve bu Journal'a yazılır — o
pozisyonda TP1 kısmi kapaması çalışmaz.

---

## Risk ayarları — hangisi neyi durdurur

| Girdi | Neyi durdurur |
|---|---|
| `InpRiskPercent` | Tek işlemde riske edilen bakiye yüzdesi (lot buradan hesaplanır) |
| `InpMaxOpenRiskPercent` | Açık pozisyonların toplam riski; aşılacaksa yeni işlem yok |
| `InpMaxDailyLossPercent` | Gün başı bakiyeye göre zarar; aşılırsa gün boyu yeni işlem yok |
| `InpMaxDrawdownPercent` | Zirve bakiyeden düşüş; aşılırsa yeni işlem yok |
| `InpMaxPerCurrency` | Aynı para birimine aynı yönde pozisyon sayısı (korelasyon) |
| `InpMaxOpenPositions` | Toplam açık pozisyon |

Günlük zarar freni ve zirve bakiye **global değişkenlerde saklanır**: EA'yı
zararlı bir sabahın ardından yeniden başlatmak freni sıfırlamaz.

Düşüş kilidi yalnızca **yeni girişleri** durdurur, açık pozisyonları kapatmaz.
Bir düşüş tetiğiyle otomatik likidasyon, dalgalanan zararı en kötü anda
gerçekleşmiş zarara çevirir — hem de otomatik olarak, yayınlanan bir hesapta.

`InpAllowMinLotOverRisk = false` (varsayılan): brokerın minimum lotu bile
`InpRiskPercent`'i aşıyorsa kurulum **atlanır**. `IntradayEA`'nın lot hesabı bu
durumda minimum lota yuvarlıyordu — küçük hesapta ayarladığınızdan sessizce daha
fazla risk demekti.

---

## Test protokolü

1. **Strateji Test Cihazı**, sembol başına, en az 2-3 yıl, farklı piyasa rejimleri
   (trendli, sıkışık, yüksek volatilite). Tek bir dönemde iyi görünen ayar
   kümesini seçmeyin.
2. **Demo + `InpDryRun = true`**, en az 2 hafta. Journal'daki kurulumları gerçek
   grafiklerle karşılaştırın: skorlar makul mü, stoplar gerçekten yapısal mı?
3. **Demo + canlı emir**, en az 4 hafta. Kısmi kapama, başabaş ve iz süren stop
   gerçekten çalışıyor mu?
4. **Küçük canlı hesap**, `InpRiskPercent` düşük. Ancak burada geçtikten sonra
   yayın hesabına bağlayın.

---

## Dürüst sınırlar

- Bu bir kural kümesidir, kârlı bir sistem değil. Buradaki filtrelerin hepsi aynı
  anda yanılabilir; yapısal stop da vurulan bir stoptur.
- Ekonomik takvim filtresi MT5'in kendi takvimini kullanır. Bazı brokerlarda bu
  takvim boş gelir — o durumda filtre sessizce hiçbir şeyi engellemez.
- Güven skoru geçmiş performansa göre **kalibre edilmemiştir**; faktör ağırlıkları
  makul varsayımlardır. "Güven 85" ile "%85 kazanma olasılığı" aynı şey değildir
  ve kart metninde de öyle sunulmamalıdır.
- Sonuçlar ürünün kendisidir: kötü bir ay herkese açıktır. Pozisyon boyutunu buna
  göre seçin.
