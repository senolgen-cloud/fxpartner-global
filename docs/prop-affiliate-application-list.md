# Prop Firma Affiliate Başvuru Listesi

**Hazırlanma:** 19 Ağustos 2026
**Amaç:** `/prop-firmalar` tablosundaki "İndirim" sütununu doldurmak ve gelir akışını açmak.
**Mevcut durum:** 2 ortak (IC Funded, FundedNext) — ikisinde de teyitli indirim kodu **yok**.

> ⚠️ **Bu dokümandaki komisyon oranları üçüncü taraf derlemelerinden.** Prop affiliate
> oranları sık değişiyor ve çoğu firma gerçek oranı ancak başvuru sonrası paylaşıyor.
> Hepsi başvuru sırasında teyit edilecek; buradaki rakamlar pazarlığa girerken
> bilmemiz gereken **taban**, vaat değil.

---

## 0. Her başvuruda hedefimiz ne

Sıradan bir affiliate linki almak yeterli değil. Üç şeyi birden istiyoruz:

| İstek | Neden |
|---|---|
| **1. İndirim kodu** | Tabloyu dolduran şey bu. Kodsuz link, sütunda "İndirim yok" olarak kalır. |
| **2. RevShare veya Hybrid** (CPA değil) | Gelirin büyük kısmı **retry**'lardan geliyor — başarısız olup tekrar challenge alan trader. Saf CPA bu kuyruğu kaçırır. |
| **3. Ödeme kanıtı erişimi** | `payoutProof: verified` olmadan firmayı hiçbir yerde promote etmiyoruz. Bu bizim şartımız, onların değil. |

**Pazarlık kozumuz:** Türkçe pazarda kaynaklı prop içeriği üreten ilk site olmamız,
mevcut Telegram topluluklarımız, ve zaten işleyen bir broker ortaklık altyapısı.
Prop firmalar için Türkiye büyük ve rakipsiz bir pazar — bunu başvuruda söyleyeceğiz.

---

## 1. Dalga 1 — Tablodaki firmalar (öncelik: yüksek)

Bunlar zaten `/prop-firmalar`'da listeli. Sıralamayı etkilemez, sadece indirim
sütununu doldurur ve geliri açar.

### 1.1 The5ers — 🥇 en yüksek bilinen oran

| | |
|---|---|
| **Bilinen oran** | **%20-40**, yenileme ve hesap yükseltmelerinde **ömür boyu rev-share** |
| **Alternatif kaynak** | %10-20 (performans kademesine göre) — çelişki var, başvuruda netleşecek |
| **Neden öncelikli** | Listedeki en yüksek bilinen tavan + ömür boyu model tam istediğimiz yapı |
| **Başvuru** | the5ers.com → Affiliate / Partners bölümü |
| **Dikkat** | Bootcamp aktivasyon ücreti iade edilmiyor — indirim kodu istemek burada özellikle değerli |

### 1.2 FTMO — 🥈 en güvenilir marka

| | |
|---|---|
| **Bilinen oran** | İlk ödenen challenge bedelinin **%8-20**'si |
| **Cookie** | 45 gün |
| **Ekstra** | Gerçek zamanlı raporlama sunan partner portalı |
| **Neden öncelikli** | Tablomuzda 8.5 ile 2. sırada; okuyucunun en çok aradığı marka. FTMO linki olmaması içerik güvenilirliğinde boşluk yaratıyor |
| **Başvuru** | ftmo.com → Partnership / Affiliate |
| **Dikkat** | Oran listenin en düşüğü ve indirim kodu vermemesiyle biliniyor (best2traders'ta da "No discount code"). Yine de marka değeri için almaya değer |

### 1.3 FundingPips

| | |
|---|---|
| **Bilinen oran** | Açık kaynakta yok — başvuruda öğrenilecek |
| **Bilinen** | İndirim kodu veriyor, dönüşüm için affiliate'e esnek ödeme sunuyor |
| **Neden öncelikli** | Tablomuzda 8.5, en ucuz giriş ($32) — fiyat hassas kitlede en yüksek dönüşüm potansiyeli |
| **Başvuru** | fundingpips.com → Affiliate |

### 1.4 Alpha Capital Group

| | |
|---|---|
| **Bilinen oran** | Açık kaynakta yok |
| **Referans** | best2traders'ta **%15** indirim kodu var → demek ki kod veriyorlar |
| **Başvuru** | alphacapitalgroup.uk → Affiliate / Partners |

### 1.5 FundedNext — ⚠️ mevcut ortak, eksik var

Ortaklık **var** ama link (`fpr=FXPARTNER`) saf FirstPromoter takibi — **indirim taşımıyor.**

**Yapılacak:** Mevcut affiliate temsilcisine yazıp bir indirim kodu talep etmek.
Referans: best2traders'ın FundedNext kodu **`BTRADER` %5**. Yani kod veriyorlar, bizde yok.

### 1.6 IC Funded — ⚠️ mevcut ortak, teyit bekliyor

7 soruluk liste hâlâ açık (bkz. `docs/prop-firm-strategy.md` Bölüm 2.5). Kritik olan 3. soru:
%30 indirim linkle otomatik mi uygulanıyor, yoksa kod mu gerekiyor?

**Cevap gelir gelmez:** `discount.status` → `"live"`, `priceFrom` / `priceFromDiscounted` girilir.
Kod hazır, 2 dakikalık iş.

---

## 2. Dalga 2 — Futures firmaları (tamamen boş segment)

Tablomuzun 6 firmasının hepsi CFD tarafında. Futures prop, ABD'de pazarın büyük kısmı
ve **Türkiye'de neredeyse hiç bilinmiyor** — "ilk olalım" hedefiyle birebir örtüşüyor.

### 2.1 Apex Trader Funding — 🥇 futures tarafının en iyi affiliate ekonomisi

| | |
|---|---|
| **Cookie** | **180 gün** — sektörün en uzunu |
| **Model** | Hem değerlendirme hem **reset**'lerde **ömür boyu tekrarlı komisyon** |
| **Neden bu kadar iyi** | Reset'ler üzerinden komisyon = retry ekonomisinin tamamını yakalıyor. Aradığımız yapı tam olarak bu |
| **Min. ödeme eşiği** | $1.000 |
| **Not** | Oranı açıklamıyorlar; agresif indirimler yapıyorlar ($167'lik $50k değerlendirme ara ara $16.70'e düşüyor) — indirim kodu alma ihtimali yüksek |
| **Başvuru** | apextraderfunding.com → Affiliate |

### 2.2 Topstep

Apex ile birlikte futures tarafında marka bilinirliğinin çoğunu tutuyor
(ikisi sektördeki yeni funded-trader kayıtlarının tahminî **%55-65**'i).
Marka güvenilirliği yüksek — içerik otoritesi için değerli.

### 2.3 Earn2Trade

Eğitim + değerlendirme programını birleştiriyor. best2traders'ta **%20 indirim kodu** var.
**Bizim için özellikle uygun:** eğitim odaklı olması, FXPARTNER'ın eğitim/topluluk
tarafıyla doğal olarak eşleşiyor.

### 2.4 Orta kademe (opsiyonel, ikinci tur)

TickTick Trader (esnek komisyon **%40'a kadar**), MyFundedFutures, Take Profit Trader,
BluSky (kademeli komisyon + aylık ödeme).

---

## 3. Kabul kriterlerimiz — kimle çalışmayız

Komisyon teklifi ne olursa olsun, bir firma şu üç şartı geçmeden tabloya **girmez**:

1. **En az 2-3 yıl kesintisiz faaliyet** (veya arkasında düzenlenmiş bir broker).
2. **Doğrulanabilir ödeme geçmişi** — firma beyanı değil, kaynağı kayıtlı kanıt.
3. **Türk kullanıcı kabulü + çalışan çekim yöntemi.**

Ve tabloya girse bile, `payoutProof: verified` olmadan **hiçbir yerde promote edilmez**
(bkz. `propFirms.ts` → `isPromotable()`).

> 2020-2026 arasında 80+ firma kapandı. Yüksek komisyon teklif eden firma, çoğu zaman
> nakit akışı sıkışmış firmadır. **Yüksek oran bir uyarı işareti olabilir.**

---

## 4. Her firmaya sorulacak standart set

IC Funded için hazırladığımız 7 soruluk listenin genelleştirilmiş hâli. Başvuru
onaylandıktan sonra tek e-posta olarak gönderilir:

**Ticari**
1. Komisyon modeli: RevShare mi, CPA mı, hybrid mi? Oran nedir?
2. Reset / retry satın almalarında komisyon ödeniyor mu? (**en kritik soru**)
3. Cookie süresi ve atıf (attribution) penceresi?
4. Bize özel indirim kodu verilebilir mi? Oran ve geçerlilik?
5. İndirim linke otomatik mi gömülü, yoksa checkout'ta kod mu giriliyor?
6. Ödeme eşiği, ödeme takvimi ve yöntemleri?

**Ürün uyumu — bu cevaplar doğrudan koda giriyor**
7. Copy trading serbest mi? Kişinin kendi hesapları arasında istisna var mı?
8. Üçüncü taraf **sinyal servisi** kullanımı serbest mi? (manuel uygulama dahil)
9. EA kullanımı serbest mi, kısıt nedir?

**Doğrulama — bizim şartımız**
10. Son 30 günden paylaşılabilir ödeme kanıtı alabilir miyiz?
11. Türk kullanıcılar için çalışan çekim yöntemleri neler?
12. Türkiye'den kullanıcı kabul ediyor musunuz, kısıt var mı?

---

## 5. E-posta şablonu

### Türkçe

> **Konu:** FXPARTNER — Türkiye pazarı için affiliate ortaklığı
>
> Merhaba,
>
> FXPARTNER, Türkiye'nin forex ve prop trading odaklı karşılaştırma ve inceleme
> platformudur (fxpartner.global). Broker incelemeleri, piyasa analizi, işlem
> sinyalleri ve aktif Telegram topluluklarıyla çalışıyoruz.
>
> Yakın zamanda prop firma (funded account) karşılaştırma bölümümüzü yayına aldık.
> [FİRMA] şu anda listemizde bağımsız olarak değerlendirilmiş durumda.
>
> Türkiye, prop firmalar için büyük ve büyük ölçüde rakipsiz bir pazar: yerel
> düzenlemeler nedeniyle yatırımcıların çoğu yurt dışı çözümlere yöneliyor ve
> Türkçe kaynaklı prop içeriği neredeyse yok.
>
> Affiliate ortaklığı için görüşmek isteriz. Özellikle şunları netleştirmek istiyoruz:
> komisyon modeli (retry/reset satın almaları dahil mi), bize özel bir indirim kodu
> imkânı, ve kullanıcılarımızla paylaşabileceğimiz güncel ödeme kanıtı.
>
> Şunu da belirtmek isteriz: platformumuzda **ortaklık, sıralamayı değiştirmez.**
> Ortak firmalar açıkça etiketlenir ve diğerleriyle aynı kriterlerle puanlanır.
> Bu, kitlemizin listemize güvenmesinin sebebi — ve dolayısıyla ortaklarımıza
> değer katan şeyin de temeli.
>
> İyi çalışmalar,
> Erdem Torun — FXPARTNER
> info@fxpartner.global

### English

> **Subject:** FXPARTNER — affiliate partnership for the Turkish market
>
> Hello,
>
> FXPARTNER (fxpartner.global) is Turkey's forex and prop trading comparison and
> review platform. We publish broker reviews, market analysis and trading signals,
> and run active Telegram communities.
>
> We recently launched our prop firm comparison section, where [FIRM] is already
> listed and independently rated.
>
> Turkey is a large and largely uncontested market for prop firms: local regulation
> pushes most retail traders toward offshore solutions, and there is almost no
> sourced, Turkish-language prop content available.
>
> We'd like to discuss an affiliate partnership — specifically your commission model
> (including whether retries/resets are commissionable), the possibility of a
> dedicated discount code for our audience, and access to recent payout proof we can
> share with our readers.
>
> One thing worth stating up front: on our platform, **a partnership never changes a
> firm's ranking.** Partner firms are clearly labelled and scored against exactly the
> same criteria as everyone else. That's why our audience trusts the list — and it's
> what makes a placement on it worth having.
>
> Best regards,
> Erdem Torun — FXPARTNER
> info@fxpartner.global

---

## 6. Takip tablosu

| # | Firma | Segment | Öncelik | Başvuru | Onay | Komisyon | İndirim kodu | Ödeme kanıtı |
|---|---|---|---|---|---|---|---|---|
| 1 | IC Funded | CFD | 🔴 Acil | ✅ Ortak | ✅ | ? | ⏳ 7 soru bekliyor | ⏳ monitored |
| 2 | FundedNext | CFD | 🔴 Acil | ✅ Ortak | ✅ | ? | ❌ kod talep edilecek | ⏳ monitored |
| 3 | The5ers | CFD | 🟠 Yüksek | ⬜ | ⬜ | %20-40? | ⬜ | ⬜ |
| 4 | FTMO | CFD | 🟠 Yüksek | ⬜ | ⬜ | %8-20 | ⬜ (vermiyor olabilir) | ⬜ |
| 5 | FundingPips | CFD | 🟠 Yüksek | ⬜ | ⬜ | ? | ⬜ | ⬜ |
| 6 | Alpha Capital | CFD | 🟡 Orta | ⬜ | ⬜ | ? | ⬜ (%15 referansı var) | ⬜ |
| 7 | Apex Trader Funding | Futures | 🟠 Yüksek | ⬜ | ⬜ | ? (180g cookie, ömür boyu) | ⬜ | ⬜ |
| 8 | Topstep | Futures | 🟡 Orta | ⬜ | ⬜ | ? | ⬜ | ⬜ |
| 9 | Earn2Trade | Futures | 🟡 Orta | ⬜ | ⬜ | ? | ⬜ (%20 referansı var) | ⬜ |
| 10 | TickTick Trader | Futures | 🟢 Düşük | ⬜ | ⬜ | %40'a kadar | ⬜ | ⬜ |

---

## 7. Önerilen sıra

**Bu hafta:** 1 ve 2 — zaten ortağız, sadece eksik parçaları (kod + kanıt) istiyoruz.
Sıfır sürtünme, tabloyu hemen doldurabilir.

**Önümüzdeki hafta:** 3, 4, 5, 7 — dört başvuru. The5ers oran için, FTMO marka için,
FundingPips dönüşüm için, Apex futures segmentini açmak için.

**Sonra:** Kalanlar, ilk turdan gelen cevaplara göre.

---

## Kaynaklar

Oranlar aşağıdaki derlemelerden; **hepsi başvuruda teyit edilecek.**

- [Top 15 Prop Firm Affiliate Programs for 2026 — quantvps.com](https://www.quantvps.com/blog/best-prop-firm-affiliate-programs)
- [9 Best Prop Firm Affiliate Programs that Pay the Most — vettedpropfirms.com](https://vettedpropfirms.com/best-prop-firm-affiliate-programs-that-pay-the-most/)
- [Best Prop Firm Affiliate Programs With Highest Commissions — tradersunion.com](https://tradersunion.com/ratings/prop/common/prop-firm-affiliate-programs/)
- [FTMO Review 2026: Trader and Operator Perspective — track360.io](https://track360.io/blog/ftmo-review-2026-operator-trader-perspective)
- [Futures Prop Firm Launch: Operator and Affiliate Playbook 2026 — track360.io](https://track360.io/blog/futures-prop-firm-operator-launch-affiliate-playbook-2026)
- [Best Futures Prop Firms 2026 — track360.io](https://track360.io/blog/best-futures-prop-firms-2026-operator-affiliate-ranking)
- [5 Best Prop Firm Affiliate Programs — apextraderfunding.global](https://www.apextraderfunding.global/cms-default-country/trading-education/best-prop-firm-affiliate-programs)
