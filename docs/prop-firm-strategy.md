# Prop Firm / Funded Account Stratejisi

**Durum:** **Aktif dikey** — 19 Ağustos 2026'da inşaya başlandı. Ana hizmet kalemi olarak konumlandırıldı.
**Ortaklar:** IC Funded (IC Markets destekli) ve FundedNext — bkz. Bölüm 2.5.
**⚠️ Önemli revizyon (19.08.2026):** Her iki ortak da sinyal/copy trading kullanımını yasaklıyor.
"Challenge Modu" ürün fikri bu haliyle geçersiz — bkz. Bölüm 2.6.
**Yayında:** `/prop-firmalar` karşılaştırma sayfası (6 firma), `src/data/propFirms.ts`, ana menüde birincil link.
**Amaç:** Prop firm (funded account) pazarına, FXPARTNER'ın mevcut güven markasını riske atmadan girmek.
**Temel ilke:** Site önce. Ve daha önemlisi — **puanlama bağımsız kalır.** Prop firmalar, brokerlarla aynı
editoryal disipline tabidir; ortaklık bir firmanın nasıl değerlendirildiğini asla değiştirmez.

---

## 0. Tez — tek cümlede

Prop firm pazarı FXPARTNER için **yeni bir gelir kalemi olmaktan çok, mevcut ürünlerin önüne konulacak
yeni ve çok daha geniş bir huni ağzıdır**; asıl kazanç affiliate komisyonu değil, o hunideki trafiğin
Pro/VIP paketlerine ve CopyTrade'e dönüşmesidir.

Bunun sebebi basit: prop firm affiliate komisyonu işlem başına ~$20-40'tır (aşağıda hesabı var).
Pro paketi $59'dur ve **tekrarlıdır**. Prop içeriği, bize zaten aradığımız kitleyi — risk yönetimi
problemi olan, sermayesi kısıtlı, aktif trader'ı — getirir.

---

## 1. Neden şimdi

| Sinyal | Anlamı |
|---|---|
| Sektör 2015-2024 arası **%1.264 büyüdü** | Talep gerçek, geçici bir moda değil |
| SPK sonrası Türkiye'de yerel forex fiilen bitti (yüksek teminat + düşük kaldıraç) | Türk trader zaten offshore'a kaymış durumda; prop, "az sermaye ile büyük hesap" vaadiyle tam bu boşluğa oturuyor |
| Challenge ücreti $50-500 arası **dijital bir satın alma** | Broker'a $500 yatırmaktan çok daha düşük sürtünme → çok daha yüksek dönüşüm |
| Türkçe prop içeriği zayıf ve büyük ölçüde saf affiliate spam | Kaynaklı, dürüst içerikle sıralama almak brokerlara göre çok daha kolay |
| Prop firm'de başarısızlığın #1 sebebi **drawdown ihlali** | Bu bir risk yönetimi problemi — yani FXPARTNER'ın zaten sattığı şey |

**Kritik gözlem:** Prop trader'ın acısı ("challenge'ı geçemiyorum") ile FXPARTNER'ın ürünü
(doğrulanmış sinyaller + risk yönetimi + pozisyon hesaplayıcı) birebir örtüşüyor. Broker dikeyinde
böyle temiz bir eşleşme yok.

---

## 2. Önce riskler — bu dikey neden tehlikeli

Bunu en başa koyuyorum, çünkü bu dikeye girme kararı aslında **bu risklerin yönetilip yönetilemeyeceği**
kararıdır.

### 2.1 Firma çöküşü riski (en büyük tehdit)

2020-2026 arasında **80'den fazla prop firma kapandı.** Sadece bilinen örnekler:

| Firma | Akıbet |
|---|---|
| MyForexFunds | CFTC tarafından kapatıldı (2023) |
| TrueForexFunds | Kapandı (Mayıs 2024), ~**$1.2M ödenmemiş payout** bıraktı |
| FundingTicks | Trustpilot 4.1 → 3.2 düşüşünün ardından kapandı (Ocak 2026) |
| MyFundedFX | Kapandı (Şubat 2026) |

**FXPARTNER için anlamı:** Önerdiğimiz bir firma parayla birlikte kaybolursa, bu sadece bir affiliate
kaybı değil — sitenin üzerine kurulduğu güven iddiasının çöküşüdür. `/blacklist` sayfasında brokerlar
için koyduğumuz standardın aynısını, hatta daha sıkısını burada uygulamak zorundayız.

> **Bunu bir zayıflık değil, konumlanma avantajına çeviriyoruz.** Türkçe pazarda hiç kimse prop firma
> ödeme kanıtı (payout proof) takibi yapmıyor. Bunu yapan ilk site olmak, bu dikeydeki tüm otoritemizin
> temeli olacak. Detay: Bölüm 5.2.

### 2.2 Regülasyon riski

- **AB:** Düzenleyiciler funded-account modelini **MiFID II kapsamına** çekmeyi değerlendiriyor.
  İtalya'da CONSOB, prop "challenge"larını *"bir tür finans video oyunu"* olarak nitelendirip
  manipüle edilmiş zorluk seviyeleri ve ödenmeyen kâr paylarına dikkat çekti. Belçika FSMA ve
  İspanya CNMV de uyarı yayımladı.
- **ABD/İngiltere:** CFTC, FCA ve ASIC modeli inceliyor; bir ABD istişare süreci 2026 sonuna sarkıyor.
- **Türkiye:** Prop firm geliri **doğrudan yasak değil, ama SPK tarafından düzenlenmiş de değil** —
  gri alan. İki somut nokta:
  1. Türkiye'de yerleşik kişiler **kendi inisiyatifleriyle** yurt dışı firmalarda hesap açabilir.
  2. Ancak yurt dışı firmaların **Türkiye'ye yönelik pazarlama faaliyeti yapması** izinsiz sermaye
     piyasası faaliyeti sayılıyor.

  → (2) numaralı madde, konumlanmamızı belirliyor: FXPARTNER **bağımsız bir yayıncı/karşılaştırma
  platformudur**, bir firmanın Türkiye pazarlama kolu değildir. Bu ayrım dilde, tasarımda ve
  sözleşmelerde net tutulmalı. **Bu maddenin hukuk danışmanına okutulması Faz 0'ın çıkış şartıdır.**

### 2.3 Ürün uyumsuzluğu riski (gözden kaçması çok kolay)

**Prop firmaların büyük çoğunluğu copy trading'i ve üçüncü parti sinyal servisi kullanımını
kısıtlar veya tamamen yasaklar.**

Bu, plandaki en kritik teknik kısıttır:

- **CopyTrade, prop kullanıcılarına doğrulama yapılmadan ASLA pazarlanamaz.** Aksi halde kullanıcının
  hesabı kural ihlalinden iptal edilir ve suçlanacak taraf biz oluruz.
- "Challenge Modu" sinyal katmanı (Bölüm 5.3) da her firma için tek tek doğrulanmalıdır.
- Her prop firma kaydında **`copyTradingAllowed` ve `signalServiceAllowed`** alanları zorunlu olacak;
  doğrulanmamışsa `unknown` kalır ve o firma için ilgili ürün çapraz satışı **kapalıdır**.

### 2.4 Marka riski — ve sıralama bütünlüğü

Prop pazarlaması "hızlı zengin ol" estetiğine kayan bir alan. `docs/instagram-strategy.md`'de
tanımladığımız kırmızı çizgilerin (kâr ekran görüntüsü, garanti kazanç iddiası) burada da aynen
geçerli olduğunu tekrar etmek gerekiyor — prop içeriği bu çizgileri aşındırmanın en kolay yoludur.

**Sıralama bütünlüğü — bu dikeye özel en büyük marka riski:** Affiliate ortağını karşılaştırma
listesinin tepesine koyma baskısı burada broker tarafından çok daha güçlüdür, çünkü liste sayfası
doğrudan gelir üretir. Buna direnmek zorundayız: bu dikeyde sattığımız tek şey listenin
güvenilirliğidir. Ortaklık ilişkisi her firma kartında **açıkça etiketlenir** (`isPartner`), ama
sıralamayı satın almaz.

### 2.5 İlk ortak: IC Funded

**Neden iyi bir ilk ortak:** IC Funded bağımsız bir startup değil — sitede zaten rank 6 broker olarak
yer alan **IC Markets**'ın fiyatlama ve emir gerçekleştirme altyapısını kullanıyor. Bu, Bölüm 2.1'de
tanımlanan **1 numaralı riski (firma çöküşü) belirgin şekilde düşürüyor.** Bağımsız bir prop firmayla
başlasaydık, Faz 0 durum tespiti çok daha uzun sürerdi.

**Ama ilk günden iki kırmızı çizgiye çarptı:**

| Bulgu | Sonuç |
|---|---|
| **IC Funded copy trading'i açıkça yasaklıyor** | FXPARTNER CopyTrade, IC Funded hesaplarına **pazarlanamaz.** Bölüm 2.3 ilk ortakta gerçekleşti. |
| Sinyal servisi durumu belirsiz | "Challenge Modu" bu firma için **yazılı teyit alınmadan açılmaz.** EA'lara izin var ("hyperactivity" şartıyla), bu manuel sinyal uygulamasının muhtemelen kabul edilebilir olduğuna işaret ediyor — ama muhtemel, teyit değildir. |
| %30 indirimin nasıl uygulandığı doğrulanamadı | `discount.status: "pending"` — link otomatik mi uyguluyor, kod mu gerekiyor teyit edilene kadar oran sitede sayı olarak yayımlanmıyor. |
| Kendi ödeme doğrulamamız yapılmadı | `payoutProof.status: "monitored"` — promote edilemez. Ortak ilişkisi mevcut olduğu için birkaç günlük iş. |

**Ortağa sorulacaklar (tek e-posta):**
1. Sinyal servisinden alınan işlemleri **manuel** uygulamak kural ihlali mi? (yazılı cevap)
2. "Hyperactivity" eşiği nedir — işlem sıklığı/süre olarak tanımlı mı?
3. %30 indirim `bit.ly/funded-ic` linkiyle otomatik mi uygulanıyor, yoksa kod mu var?
4. 48 saatlik ödeme garantisi + $500 tazminat sözleşme metninde geçiyor mu?
5. Türk kullanıcılar için çalışan çekim yöntemleri neler?
6. Minimum işlem günü: faz başına 3 gün mü, toplam 5 gün mü? (kaynaklar çelişiyor)
7. Son 30 günden paylaşılabilir ödeme kanıtı alabilir miyiz?

Bu 7 sorunun cevabı, IC Funded'ı `monitored` → `verified` çevirir ve `discount`'u `live` yapar.

### 2.6 ⚠️ REVİZYON: "Challenge Modu" ürün fikri geçersiz

**İkinci ortak FundedNext'in kuralları incelendiğinde, planın merkezindeki ürün fikri çöktü.**

| Ortak | Copy trading | Sinyal servisi |
|---|---|---|
| **IC Funded** | ❌ Yasak | ❓ Belirsiz (teyit bekliyor) |
| **FundedNext** | ⚠️ Yalnızca kendi hesapları arası | ❌ **Açıkça yasak** |

FundedNext, trader'ın **herhangi bir sinyal servisine abone olmasını veya dış sinyallerle işlem
yönlendirmesini** açıkça yasaklıyor. Copy trading'e ise yalnızca kişinin kendi hesapları arasında
izin veriyor — FXPARTNER'ın merkezi CopyTrade hesabından kopyalamak bu şartı sağlamaz ve
"üçüncü taraf istismarı" kuralını tetikler.

**Sonuç: Bölüm 5.3'te "ürün hendeğimiz" diye tanımlanan "Challenge Modu" sinyal katmanı,
her iki ortakta da uygulanamaz.** Bu fikir rafa kalkıyor.

#### Bunun yerine ne geçerli — huni mantığının düzeltilmesi

Orijinal plan şunu varsayıyordu: *prop trafiği → prop hesabında kullanılacak sinyal paketi satışı.*
Bu yol kapalı. Doğru huni şu:

> **Prop içeriği trafiği getirir → o trader'ın KENDİ broker hesabı için paket satılır.**

Ayrım kritik ve mesajlaşmaya birebir yansımalı: paketlerimizi prop hesabında kullanmayı teşvik
eden tek bir cümle bile, kullanıcının fonlanmış hesabını kaybettirir ve sorumluluğu bize yükler.
Prop sayfalarındaki paket CTA'ları **"kendi hesabınızda"** ibaresini taşımak zorunda.

#### Hâlâ geçerli olan ve kural riski taşımayan ürünler

| Ürün | Neden güvenli |
|---|---|
| **Prop drawdown hesaplayıcı** | Bir hesap makinesi sinyal değildir; hiçbir firma kuralı ihlal edilmez. Dikeyin en güçlü SEO/backlink varlığı olmaya devam ediyor. |
| **Eğitim / risk yönetimi içeriği** | Trader'ın kendi kararını iyileştirir; dış sinyal değildir. |
| **Karşılaştırma + ödeme kanıtı takibi** | Saf yayıncılık. Dikeyin otorite motoru. |
| **Affiliate geliri** | Etkilenmedi. |
| **Paket satışı (kendi broker hesabı için)** | Etkilenmedi — sadece mesajlaşma netleştirilmeli. |

**Gelir modeline etkisi:** Akış A (affiliate) ve Akış B (paket) aynen duruyor; Bölüm 4.4'teki
birim ekonomisi değişmiyor. Değişen tek şey, paketin **hangi hesapta** kullanılacağına dair
mesaj — ki bu zaten dürüstlük gereği netleştirilmesi gereken bir şeydi.

---

## 3. Stratejik konumlanma

Pazarda üç tip oyuncu var:

| Tip | Ne yapıyor | Zayıflığı |
|---|---|---|
| Saf affiliate siteler | İndirim kodu + "en iyi 10 prop firma" listesi | Sıfır güven, sıfır ürün, firma çökünce yok oluyor |
| Global inceleme siteleri | İngilizce, derin ama Türkçe yok | Türk trader'ın gerçek sorunlarına (vergi, ödeme yöntemi, dil) değinmiyor |
| Prop firmaların kendisi | Kendi ürününü satıyor | Taraflı |

**FXPARTNER'ın boşluğu:** *Türkçe + kaynaklı + ödeme kanıtı takip eden + trader'a challenge'ı geçmesi
için gerçek bir araç veren* platform. Dördünü birden yapan yok.

### Haksız avantajlarımız

1. **Doğrulanmış sinyal geçmişi** — `src/lib/signalStats.ts` gerçek bir MT5 hesabından, EA üzerinden
   türetilmiş, tier bazlı kazanma oranı üretiyor. Prop içeriğinde "bize neden güvenelim" sorusunun
   cevabı hazır ve elle yazılmamış.
2. **Mevcut araç altyapısı** — `/pozisyon-hesaplayici` zaten var; prop drawdown kurallarına genişletmek
   sıfırdan yazmaktan çok daha ucuz.
3. **Editoryal disiplin** — `cashback.ts`'teki `live`/`pending` ayrımı, `/blacklist`'teki kanıt zorunluluğu.
   Bu disiplini prop'a taşımak, rakiplerin kopyalayamayacağı tek şey.
4. **Dağıtım** — aktif Telegram toplulukları + yeni Instagram kanalı.

---

## 4. Gelir modeli

Üç akış, önem sırasına göre **ters** sıralanmış (en görünür olan en küçüğü):

### 4.1 Akış A — Affiliate komisyonu (görünür ama küçük)

Sektör standartları:

| Model | Tipik oran |
|---|---|
| RevShare (challenge ücreti üzerinden) | **%10-25**, üst uçta %30 |
| CPA (funded/ilk satın alma başına) | Sabit tutar, en yaygın manşet oran |
| Hybrid (düşük CPA + RevShare kuyruğu) | Ciddi programlarda giderek varsayılan |
| Ölçekleme komisyonu | Funded hesap büyüdükçe ~%3 aylık tekrarlı |

**Bizim tercihimiz: RevShare veya Hybrid.** Sebebi "retry ekonomisi" — gelirin büyük kısmı ilk
satıştan değil, **başarısız olup tekrar challenge alan** trader'dan geliyor. CPA bu kuyruğu kaçırır.

### 4.2 Akış B — Paket çapraz satışı (asıl iş)

Prop içeriğine gelen trafiğin Pro ($59) / VIP ($99) paketlerine dönüşümü. Tek seferlik değil, **tekrarlı**.

### 4.3 Akış C — Firma sponsorluğu

Brokerlarda uyguladığımız aylık görünürlük modelinin prop karşılığı. **Faz 3'ten önce açılmaz** —
önce trafiğin kanıtlanması gerekiyor.

### 4.4 Birim ekonomisi — modelleme senaryosu

> ⚠️ **Bunlar varsayımdır, veri değildir.** Faz 1 sonunda gerçek analytics ile değiştirilecek.
> Amaç, dikeyin büyüklük mertebesini görmek.

**6. ay, muhafazakâr senaryo:**

| Adım | Varsayım | Sonuç |
|---|---|---|
| Prop içeriğine aylık oturum | Organik + Telegram + Instagram | 12.000 |
| Firma linkine tıklama oranı | %6 | 720 tık |
| Challenge satın alma dönüşümü | %5 | 36 satış |
| Ortalama challenge bedeli | $140 | — |
| Komisyon oranı | %20 | **$1.008 / ay** |
| Retry çarpanı (yaşam boyu) | 1,7x | **~$1.700 / ay efektif** |

**Aynı trafikten paket dönüşümü:**

| Adım | Varsayım | Sonuç |
|---|---|---|
| Pro/VIP dönüşüm oranı | %0,15 | 18 üye / ay |
| Ortalama paket bedeli | $59 | **$1.062 / ay — ve TEKRARLI** |

**Okunuş:** Affiliate geliri 6. ayda ~$1.700 ile tavan yapıp trafikle doğrusal büyür.
Paket geliri ~$1.062'de başlar ama **birikimlidir** — 12. ayda affiliate'i geçer, 18. ayda katlar.
Bu yüzden tüm prop içeriği, affiliate linkine değil **pakete** optimize edilmelidir.

---

## 5. Ürün mimarisi — kod tabanına eşlenmiş

### 5.1 Veri modeli: `src/data/propFirms.ts`

`brokers.ts` deseni izlenir ama **ayrı bir dosya ve ayrı bir puanlama ekseni** kullanılır.
Prop firma bir broker değildir; aynı Index'e sokmak ikisini de yanlış ölçer.

```ts
export interface PropFirm {
  rank: number;
  slug: string;
  name: string;
  logo?: string;
  founded: number;
  headquarters: string;
  referralUrl: string;
  discountCode?: string;

  // Challenge yapısı
  models: ("1-step" | "2-step" | "instant")[];
  accountSizes: string[];
  challengeFeeFrom: string;
  profitSplit: string;          // ör. "%80-95"
  platforms: string[];          // MT5, cTrader, DXtrade, Match-Trader, TradeLocker

  // Kural seti — drawdown hesaplayıcısını besleyen alanlar
  dailyDrawdown: string;
  maxDrawdown: string;
  drawdownType: "static" | "trailing";
  minTradingDays: number | null;
  newsTrading: "allowed" | "restricted" | "banned";
  weekendHolding: "allowed" | "banned";

  // ⚠️ ÜRÜN UYUMU — Bölüm 2.3. Doğrulanmadıysa "unknown" kalır
  // ve o firma için ilgili çapraz satış kapanır.
  copyTradingAllowed: "allowed" | "banned" | "unknown";
  signalServiceAllowed: "allowed" | "banned" | "unknown";

  // Güven ekseni — bu dikeyin kalbi
  payoutProof: PayoutProof;
  scoreRules: number;
  scoreCost: number;
  scorePayout: number;
  scoreTransparency: number;

  summary: string;
  pros: string[];
  cons: string[];
  extraFaqs?: { q: string; a: string }[];
}
```

### 5.2 Ödeme kanıtı takibi — `/prop-risk`

**Bu dikeydeki tek gerçek farklılaştırıcımız.** `/blacklist`'in prop karşılığı, ama proaktif:

```ts
export interface PayoutProof {
  // "verified"  — son 30 gün içinde kaynaklı, kontrol edilmiş ödeme kanıtı var
  // "monitored" — kanıt var ama 30 günden eski, ya da şikayet örüntüsü izleniyor
  // "warning"   — somut, kaynaklı gecikme/ret örüntüsü tespit edildi
  // "none"      — henüz doğrulanmadı; bu firma HİÇBİR YERDE promote edilmez
  status: "verified" | "monitored" | "warning" | "none";
  lastCheckedAt: string;      // ISO tarih
  sources: string[];          // Trustpilot, resmi payout raporu, topluluk kanıtı
  note: string;
}
```

**Kural — `cashback.ts`'teki `live`/`pending` disiplininin aynısı:**
`/prop-firmalar` hub'ı dışında hiçbir yerde (inceleme sayfası CTA'sı, kampanya, Telegram, Instagram)
`status: "verified"` olmayan bir firma promote edilemez.

Aylık **"Prop Firma Ödeme Raporu"** yayımlanır. Bu, hem SEO hem backlink hem de otorite motorudur —
ve firmalar üzerinde gerçek bir baskı yaratır.

### 5.3 Araçlar

| Araç | Ne yapar | Neden |
|---|---|---|
| **Prop Drawdown Hesaplayıcı** | `/pozisyon-hesaplayici`'yi genişletir: firma seçilir, günlük/maks. drawdown kuralına göre güvenli lot verir | Challenge başarısızlığının #1 sebebini doğrudan hedefler. Yüksek SEO + doğal backlink |
| **Challenge Maliyet Karşılaştırıcı** | Hesap boyutu → firmalar arası gerçek maliyet (ücret, retry politikası, iade) | Yüksek satın alma niyeti |
| **Kural Karşılaştırıcı** | Haber ticareti, hafta sonu, min. gün, drawdown tipi yan yana | Mevcut `ComparisonTable` deseni yeniden kullanılabilir |
| ~~**"Challenge Modu" sinyal katmanı**~~ | ~~Mevcut sinyalleri prop drawdown kısıtlarına göre yeniden boyutlandırır~~ | ❌ **İPTAL — bkz. Bölüm 2.6.** Her iki ortak da dış sinyal kullanımını yasaklıyor. |

---

## 6. İçerik ve SEO planı

### Pillar (ana) içerikler — Faz 1

1. **Prop Firm Nedir? Türk Trader İçin Tam Rehber** — dikeyin ana kapısı
2. **Prop Firm Geliri ve Vergi: Türkiye'de Nasıl Beyan Edilir?** ← *en değerli içerik*
3. **Challenge Neden Geçilemiyor? Drawdown Matematiği**
4. **1-Step vs 2-Step vs Instant Funding**
5. **Prop Firma Çökerse Ne Olur? Batan Firmaların Tam Listesi** ← *otorite içeriği*

> **(2) neden en değerli:** Yüksek arama hacmi, sıfır rekabet, saf güven inşası ve hiçbir affiliate
> sitesinin dokunmadığı bir konu. Vergi konusunda **kesin tavsiye vermeyiz** — süreci ve
> yükümlülüğü anlatır, mali müşavire yönlendiririz.

### İndirim kodu sayfaları — Faz 2

Prop aramalarının en yüksek niyetli kategorisi. Her firma için `/prop-firmalar/<slug>/indirim-kodu`.
Mevcut `promotion` alan deseni birebir uyarlanabilir.

### Dağıtım

`docs/instagram-strategy.md`'deki **site önce, sosyal sonra** ilkesi aynen geçerli.
Telegram'da ayrı bir prop kanalı Faz 3'te açılır — önce sitede kütüphane oluşmalı.

---

## 7. Yol haritası

| Faz | Süre | Çıktı | Çıkış şartı |
|---|---|---|---|
| **Faz 0 — Durum tespiti** | 2 hafta | 8-10 firmanın solvency/payout araştırması; hukuk görüşü (Bölüm 2.2); affiliate başvuruları | Hukuk onayı + en az 4 firmada `payoutProof: verified` |
| **Faz 1 — Temel** | 4 hafta | `propFirms.ts`, `/prop-firmalar` hub, firma inceleme sayfaları, 5 pillar içerik | Sayfalar indexlendi, ilk organik trafik |
| **Faz 2 — Araçlar** | 4 hafta | Drawdown hesaplayıcı, maliyet karşılaştırıcı, `/prop-risk`, indirim kodu sayfaları | Araç kullanımı ölçülebilir, ilk affiliate dönüşümleri |
| **Faz 3 — Ürünleştirme** | 6 hafta | "Challenge Modu" sinyal katmanı, prop Telegram kanalı, paket çapraz satış hunisi | Paket dönüşümü affiliate gelirini geçti |
| **Faz 4 — Sürekli** | — | Aylık ödeme raporu, firma izleme, sponsorluk satışı | — |

**Toplam ilk sonuç: ~16 hafta.** Faz 0 ve 1'deki tek bağımlılık affiliate onaylarıdır;
onay beklerken içerik yazılabilir (link olmadan da yayımlanır — zaten `payoutProof` disiplini
bunu gerektiriyor).

---

## 8. Kırmızı çizgiler

`about` sayfasındaki "her zaman şeffaf, her zaman doğru" ilkesinin bu dikeydeki karşılığı:

1. **`payoutProof: verified` olmayan firma promote edilmez.** İstisnasız.
2. **Ortaklık, puanlamayı değiştirmez.** Ortak olduğumuz firma da aynı rubrikten geçer.
3. **Geçme oranı gerçeği yazılır.** Challenge'ların büyük çoğunluğu başarısızlıkla sonuçlanır;
   bunu gizleyen bir sayfa yayımlamayız.
4. **Kâr ekran görüntüsü, garanti kazanç iddiası yok.** Instagram stratejisindeki liste aynen geçerli.
5. **CopyTrade / sinyal servisi uyumu doğrulanmadan çapraz satış yapılmaz** (Bölüm 2.3).
6. **Vergi ve hukuk konusunda yönlendiririz, tavsiye vermeyiz.**
7. **Çöken firma sayfası silinmez** — `warning` statüsüne alınır ve ne olduğu yazılır. Arşiv, güvendir.

---

## 9. Başarı ölçütleri

| Metrik | 3. ay | 6. ay | 12. ay |
|---|---|---|---|
| Prop içeriğine aylık oturum | 2.000 | 12.000 | 40.000 |
| İzlenen firma sayısı (`verified`) | 4 | 8 | 15 |
| Affiliate geliri (aylık) | $150 | $1.700 | $5.000 |
| **Prop kaynaklı paket MRR** | $120 | $1.060 | **$4.500** |
| Drawdown hesaplayıcı kullanımı | — | 1.500/ay | 6.000/ay |

**Asıl izlenecek metrik son satırın bir öncekiyle karşılaştırılmasıdır.** Paket MRR affiliate'i
geçtiği an, dikey doğru kurulmuş demektir.

---

## 10. Karara bağlanması gerekenler

1. **Hukuk görüşü** — Bölüm 2.2, SPK pazarlama sınırı. Faz 0'ın çıkış şartı.
2. **Hangi firmalarla başlanacak?** Kriter: 3+ yıl faaliyet, doğrulanabilir ödeme geçmişi,
   Türk kullanıcı kabulü, çalışan ödeme yöntemi.
3. **Affiliate modeli** — RevShare/Hybrid tercihi (Bölüm 4.1) her firmayla ayrı pazarlık.
4. **"Challenge Modu" ayrı paket mi, Pro'nun içinde mi?** Öneri: **Pro'nun içinde.**
   Yeni bir fiyat katmanı hem `packageTiers.ts`'i karmaşıklaştırır hem de dönüşümü böler.
5. **Kaynak** — Faz 1+2 ağırlıklı içerik ve araç geliştirme işi.

---

## Kaynaklar

Bu dokümandaki sektör verileri (komisyon oranları, kapanan firmalar, regülasyon durumu)
Ağustos 2026 itibarıyla aşağıdaki kaynaklardan derlenmiştir. **Prop sektörü çok hızlı
değişiyor — firma seçimi öncesi hepsi yeniden doğrulanmalıdır.**

- [Prop Firm Affiliate Commission Rates: 2026 Benchmark — track360.io](https://track360.io/blog/prop-firm-affiliate-commission-rates-benchmark-2026)
- [Prop Firm Affiliate Platforms: Subscription-Commission Comparison — track360.io](https://track360.io/blog/prop-firm-affiliate-platform-operator-setup-guide-2026)
- [Prop Firm Shutdowns: 80+ Firms That Closed (2020-2026) — thepropfirmguide.com](https://thepropfirmguide.com/prop-firms-that-shut-down/)
- [Prop Firms That Shut Down in 2023-2026: The Full List — tradernotion.com](https://www.tradernotion.com/blog/prop-firms-that-shut-down-in-2023-2026)
- [How regulators are closing in on retail prop trading in 2026 — The Industry Spread](https://theindustryspread.com/retail-prop-trading-regulation-2026-my-forex-funds-cftc/)
- [Why EU regulators are pulling prop trading inside MiFID II — The Industry Spread](https://theindustryspread.com/eu-regulators-prop-trading-mifid-ii-perimeter/)
- [Europe Signals Tighter Oversight for Prop Firms — fxtrustscore.com](https://www.fxtrustscore.com/europe-prop-firm-regulation-2026/)
- [Prop Trading Nedir: Türk Trader Rehberi 2026 — track360.io](https://track360.io/tr/blog/prop-trading-nedir-turk-trader-rehberi-2026)
- [Yurtdışı Yerleşik Kurumlarda Yapılabilecek Foreks İşlemlerine SPK Duyurusu — ProCompliance](https://www.procompliance.net/yurtdisi-yerlesik-kurumlarda-yapilabilecek-foreks-islemlerine-spk-duyurusu/)
- [Prop Firm Payout Proof: Which Firms Actually Pay? — traderssecondbrain.com](https://traderssecondbrain.com/guides/prop-firm-payout-proof)
