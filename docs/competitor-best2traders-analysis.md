# Rakip Analizi — best2traders.com

**İncelenme tarihi:** 19 Ağustos 2026
**Ne olduğu:** Prop firma + broker karşılaştırma ve inceleme platformu. 23 prop firma listeliyor.
**Neden önemli:** Bizim `/prop-firmalar` dikeyimizin doğrudan uluslararası muadili — ve birkaç
mekaniği bizden çok daha olgun. Editoryal tarafı ise belirgin şekilde zayıf; farkımız orada.

---

## 1. Site yapısı

| Bölüm | URL | Ne yapıyor |
|---|---|---|
| Prop Firms | `/prop-firms/` | Ana karşılaştırma tablosu, 23 firma |
| Offers | `/offers/` | İndirim/kampanya sayfası |
| Brokers | `/brokers/` | Broker tarafı (bizim ana işimiz) |
| Prop Reviews | `/prop-reviews/` | Firma inceleme sayfaları |
| Broker Reviews | `/broker-reviews/` | Broker incelemeleri |
| Blog | `/blog/` | Sektör haberleri + firma duyuruları |
| FAQ | `/faq/` | SSS |
| **Choose Challenge** | `/choose-challenge` | **10 adımlı sihirbaz** |
| **Compare** | `/compare` | Yan yana karşılaştırma |
| **Rewards Calculator** | `/rewards-calculator` | **Puan/iade hesaplayıcı** |
| List Your Firm + CRM | — | B2B: firmalar listelenmek için ödüyor |

Dil: İngilizce + **Arapça toggle (عربي)**. Login/hesap sistemi var.

---

## 2. Bizim için işe yarayacaklar — öncelik sırasına göre

### 2.1 ⭐ Challenge cashback (puan → nakit) — EN DEĞERLİ FİKİR

`/rewards-calculator` sayfasının işleyişi:

> 1. Kullanıcı challenge'ı onların linkiyle satın alır
> 2. Satın alma fiyatına göre otomatik **puan** kazanır
> 3. Puanı nakde çevirip **USDT ile çeker**

Yani **affiliate komisyonunu kullanıcıyla paylaşıyorlar.** Bu, broker tarafında bizim zaten
yaptığımız cashback modelinin prop karşılığı.

**Neden bizim için özellikle uygun:**

| Bizde zaten var olan | Prop'a uyarlaması |
|---|---|
| `/cashback` sayfası ve `cashbackPrograms` veri modeli | `propCashback` olarak birebir kopyalanabilir |
| `live` / `pending` statü disiplini | Aynen geçerli |
| **NOWPayments kripto ödeme rayı** | USDT ödemesi için altyapı **hazır** — yeni entegrasyon gerekmiyor |
| Cashback kurulum akışı (`/cashback/<slug>/setup`) | Prop için aynı desen |

**Ve kritik olarak: bu fikrin prop kural riski YOK.** İptal olan "Challenge Modu"nun aksine
(bkz. `docs/prop-firm-strategy.md` Bölüm 2.6), bir satın alma iadesi trader'ın işlemlerine
hiç dokunmuyor — hiçbir firmanın sinyal/copy trading yasağını tetiklemiyor.

→ **Öneri: "Challenge Modu"nun bıraktığı ürün boşluğunu bu doldursun.**

### 2.2 ⭐ İndirim kodu sütunu + üstü çizili fiyat

Karşılaştırma tablolarının en dönüşüm getiren öğesi. Örnek satırları:

| Firma | Kod | İndirim | Fiyat |
|---|---|---|---|
| IC Funded | `BESTTRADERS` | %10 | ~~$74~~ **$52** |
| FundedNext | `BTRADER` | %5 | ~~$59.99~~ **$57** |
| Alpha Capital | `b7gh8` | %15 | ~~$27~~ **$23** |
| Earn2Trade | `Best2Traders` | %20 | ~~$150~~ **$75** |
| FTMO / FundingPips / The5ers | — | *No discount code* | €89 / $29 / $22 |

İki şey doğru yapılmış:
1. **Üstü çizili fiyat + indirimli fiyat** yan yana — indirimi soyut bir yüzde olmaktan çıkarıyor.
2. **İndirimi olmayan firmalar için açıkça "No discount code" yazıyor** — gizlemiyorlar. Bu,
   bizim `discount.status: "pending"` disiplinimizle uyumlu ve kopyalanabilir.

→ **Bizim durumumuz:** IC Funded'da %30 var (teyit bekliyor), FundedNext linkinde indirim yok.
Sütunu şimdiden ekleyebiliriz; FundedNext satırı dürüstçe "indirim yok" der.

### 2.3 ⭐ "Choose Challenge" sihirbazı (10 adım)

`/choose-challenge` — Adım 1: *"Ne işlem yapıyorsun? CFD / Futures"*. 10 adımda kullanıcıyı
tek bir challenge önerisine indiriyor. Hero'daki ana CTA bu ("Find Your Perfect Prop Firm in
60 Seconds").

**Neden işe yarıyor:** 23 firmalık bir tablo yeni başlayanı felç eder. Sihirbaz kararı onun
yerine veriyor ve yüksek niyetli bir tıklama üretiyor.

**Bizim avantajımız:** Kullanıcının verdiği cevaplar (hesap boyutu, risk toleransı, platform)
bizim **drawdown hesaplayıcımızı** doğrudan besleyebilir — onlarda böyle bir bağlantı yok.
Sihirbazın çıktısı hem firma önerisi hem de kişiselleştirilmiş lot hesabı olur.

### 2.4 Filtre seti

Tabloda: `CFDs / Futures` toggle, `Founded Country`, `Challenge Type`, `Payout Cycle`,
`Platforms`, **`Available In`** (ülke bazlı erişilebilirlik), `Sort: Rating`, firma adı arama.

**`Available In` bizim için kritik:** Türk kullanıcının ilk sorusu "bu firma Türkiye'den
kabul ediyor mu, para çekebiliyor muyum?" Bunu filtre yapan ilk Türkçe site olmak güçlü.

Bizde şu an sadece model filtresi (1/2 aşamalı/anında) var.

### 2.5 Sütun seti — bizde eksik olanlar

Onlarda olup bizde olmayan: **Max Allocation**, **Payout Cycle**, **Platforms**, **Starting Price
(indirimli)**.
Bizde olup onlarda olmayan: **Günlük DD / Maks. DD**, **Min. Gün**, **Ödeme Kanıtı**.

→ Kural sütunları bizim editoryal avantajımız; onların ticari sütunlarını eklemek dönüşüm getirir.
İkisi birleşince tablo hem daha dürüst hem daha satan hale gelir.

### 2.6 Futures prop firmaları — tamamen kaçırdığımız segment

Listelerinde Earn2Trade (NinjaTrader), E8, Apex tarzı **futures** firmaları var ve `CFDs/Futures`
ayrımını en üst seviye filtre yapmışlar. Bizim 6 firmamızın hepsi CFD tarafında.

Futures prop, ABD'de çok büyük ve Türkiye'de neredeyse hiç bilinmiyor — "ilk olalım" hedefiyle
birebir örtüşen bir boşluk.

### 2.7 Ucuz içerik motoru: "firma eklendi" duyurusu

Blog'da: *"IC Funded Now Listed on Best2Traders"*, *"IC Funded Adds Instant Funded"*,
*"Finotive Launches Finotive One"*. Yani **her firma ekleyişini ve her kural değişikliğini
haber yapıyorlar.** Neredeyse sıfır maliyetli, sürekli taze içerik — ve bizim `haber-bulteni`
altyapımız bunu zaten yapabilir.

### 2.8 Weekly Highlights bloğu

"Top Rated Firm", "Weekly Reviews", "Best Discount (%40 AquaFunded)", "Trending Now".
Haftalık tekrar eden, otomatikleştirilebilir bir modül — siteye canlılık katıyor ve geri
dönüşü teşvik ediyor.

### 2.9 Arapça toggle = bizim Türkçe oyunumuzun doğrulaması

Global İngilizce içeriğin doymuş olduğu bir alanda, **hizmet görmeyen bir dil pazarını** hedef
almışlar. Bu tam olarak bizim Türkçe stratejimiz — ve çalıştığının kanıtı.

### 2.10 "List Your Firm" + CRM

Firmalardan listelenme/öne çıkma ücreti alıyorlar. Bu, strateji dokümanımızdaki **Akış C
(firma sponsorluğu)** ile aynı şey — Faz 3'e koymuştuk, doğru yerde duruyor.

---

## 3. Zayıflıkları — bizim farkımızın tam olarak nerede olduğu

### 3.1 🔴 Sıralama affiliate'e göre şekillenmiş görünüyor

En çarpıcı bulgu:

| Firma | Puanları | İndirim kodları var mı |
|---|---|---|
| **IC Funded** (2023 kuruluşlu) | **5.0 — 1. sıra** | ✅ %10 |
| FTMO (2014, sektör referansı, %99,8 ödeme) | 4.7 | ❌ Yok |
| FundingPips | 4.6 | ❌ Yok |
| The5ers (2016) | 3.9 | ❌ Yok |

2023 kuruluşlu bir firmanın, on yıllık ödeme sicili olan FTMO'nun üzerinde **tam puanla** birinci
olması ve tam da indirim kodu olan firma olması — bu, `docs/prop-firm-strategy.md` Bölüm 2.4'te
tarif ettiğimiz tuzağın canlı örneği.

**Bizim karşıt duruşumuz:** Bizde IC Funded 5. sırada, FundedNext 1. sırada — ve FundedNext'in
skoru ortaklık kurulmadan önce verildi. Bu farkı `/prop-firmalar` sayfasında **açıkça anlatmak**
konumlanmamızın merkezi olmalı.

### 3.2 🔴 Ödeme kanıtı / iflas takibi yok

23 firma listeliyorlar ama hiçbirinde "bu firma gerçekten ödüyor mu, ayakta mı" verisi yok.
Sadece yıldız puanı var. 80+ firmanın kapandığı bir sektörde bu en kritik eksik —
ve bizim `payoutProof` alanımızın var olma sebebi.

### 3.3 🔴 Boş sosyal kanıt sayaçları

Hero'da **"0+ Total Reviews"**, **"0+ Users Helped"** yazıyor. Sıfır gösteren bir güven sayacı,
sayaç olmamasından kötüdür. → Bizde `signalStats.ts` disiplini var: eşiğin altında sayı yayımlamıyoruz.

### 3.4 🔴 Yerel bağlam yok

Vergi, yerel regülasyon, ülke bazlı çekim yöntemi içeriği yok. Bizim en değerli içeriğimiz
("Prop Firma Geliri ve Vergi: Türkiye'de Nasıl Beyan Edilir?") burada karşılıksız.

### 3.5 🔴 Kural riski uyarısı yok

Copy trading / sinyal yasaklarını hiç göstermiyorlar. Kullanıcının fonlanmış hesabını
kaybettirebilecek tek bilgi bu — bizde her firma kartında var.

---

## 4. Kopyalanmayacaklar

1. **Affiliate'e göre sıralama.** Tek kazanma sebebimiz bunu yapmamak.
2. **Sıfır gösteren sayaçlar.** Gerçek sayı olana kadar sayaç yok.
3. **Tam puan (5.0) enflasyonu.** 2023 kuruluşlu firmaya 5.0 vermek puanı anlamsızlaştırır.
4. **Sadece yıldız puanına dayalı değerlendirme.** Rubrik + kanıt şart.

---

## 5. Aksiyon listesi

| # | İş | Etki | Efor |
|---|---|---|---|
| 1 | **Prop challenge cashback** (`propCashback` + NOWPayments/USDT) | ⭐⭐⭐ | Orta — altyapı hazır |
| 2 | Tabloya **indirim kodu + üstü çizili fiyat** sütunu | ⭐⭐⭐ | Düşük |
| 3 | Tabloya **Max Allocation / Payout Cycle / Platform** sütunları | ⭐⭐ | Düşük |
| 4 | **`Available In`** — Türkiye'den kabul + çekim yöntemi filtresi | ⭐⭐⭐ | Orta (araştırma) |
| 5 | **Challenge seçim sihirbazı** → drawdown hesaplayıcıya bağlanır | ⭐⭐⭐ | Yüksek |
| 6 | **Futures prop firmaları** segmenti (Earn2Trade, Apex, TopStep) | ⭐⭐ | Orta |
| 7 | Firma ekleme/kural değişikliği **haber postları** | ⭐⭐ | Düşük — altyapı hazır |
| 8 | **Weekly Highlights** modülü | ⭐ | Orta |
| 9 | Firma sayısını 6 → 15+ çıkarmak | ⭐⭐ | Orta |
| 10 | "Neden ortağımız 1. sırada değil" açıklayıcı bölümü | ⭐⭐ | Düşük |

**Önerilen ilk üç:** 2 → 1 → 4.
(2) en düşük eforla en hızlı dönüşüm artışı; (1) iptal olan "Challenge Modu"nun yerine geçecek
gerçek ürün farkı; (4) Türk kullanıcının ilk sorusuna cevap veren, rakipte olmayan yerel avantaj.
