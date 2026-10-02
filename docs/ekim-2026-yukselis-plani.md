# Ekim 2026 — Acil Yükseliş ve Gelir Planı

**İlan tarihi:** 1 Ekim 2026 · **Süre:** 31 gün · **Kadro:** kurucu + Claude
**Tek hedef:** Ay sonunda, hangi kanalın ne kadar para getirdiğini rakamla söyleyebilmek
ve bu ayı, **tekrarlayan gelirin** ilk gerçek ayı olarak kapatmak.

> Kardeş dokümanlar: `tanitim-reklam-programi.md` (uyumluluk kapısı, tanıtım metni),
> `prop-firm-strategy.md`, `prop-affiliate-application-list.md`, `litefinance-strategy.md`,
> `instagram-strategy.md`. Bu plan onların yerine geçmez. Ekim ayı için **önceliği** belirler.

---

## 0. CEO teşhisi: elimizde ne var?

**Ürün tarafı güçlü, para tarafı dağınık.** Site, tek kişilik bir işletme için fazlasıyla
gelişmiş: 29 broker, 16 prop firma, 36 blog yazısı, 4 dil, otomatik piyasa özetleri,
MT5 köprüsüyle canlı sinyal panosu, AI asistan, Telegram ve push altyapısı, kripto ödeme.
Eksik olan yeni bir özellik değil. Eksik olan **mevcut trafiğin paraya çevrilmesi.**

| Gelir hattı | Durum | Ekim potansiyeli |
|---|---|---|
| **Pro $59 / VIP $99** (NOWPayments) | Çalışıyor. Tek seferlik fatura var, **yenileme mekanizması yok** | 🔥 Yüksek: en hızlı nakit |
| **Broker IB / cashback** | 8 referans linki aktif. Cashback'te **sadece LiteFinance canlı**, XM/Exness/AvaTrade "tahmini" | 🔥 Yüksek: tekrarlayan, en büyük marj |
| **Prop affiliate** | IC Funded `EIEGEB` %30 **canlı ve doğrulanmış**. FundedNext, FundingPips, Moneta linkli ama kodsuz | Orta-yüksek: düşük sürtünmeli dijital satış |
| **CopyTrade** | Link var (`COPYTRADE_URL`) | Orta |
| **Sponsorlu alanlar** | XM makale içi, skyscraper, leaderboard bileşenleri hazır | Orta: trafik verisi olmadan satılamaz |
| **Sub-IB partner programı** | Sayfa ve form hazır | Düşük (Ekim için): uzun vadeli |

### Kritik bulgu: şu an kör uçuyoruz

`src/app/[locale]/layout.tsx` içinde `<Analytics />` bağlı, ama **Vercel projesinde Web
Analytics kapalı** (API, 1 Ekim'de "Web Analytics not found" döndü). Yani:
- kaç ziyaretçi geldiğini,
- hangi sayfanın para kazandırdığını,
- Telegram'ın mı Google'ın mı trafik getirdiğini

**bilmiyoruz.** Ölçemediğimiz bir şeyi büyütemeyiz. Bu yüzden 1. adım bu.

---

## 1. Yönetim ilkeleri (tek kişilik şirket için)

1. **Paraya en yakın iş önce.** Yeni sayfa veya yeni dil, mevcut ziyaretçiyi ödeyen müşteriye
   çeviren işten sonra gelir.
2. **Tekrarlayan gelir > tek seferlik gelir.** IB rev-share ve paket yenilemesi, tek bir prop
   satışından değerlidir.
3. **Kurucunun zamanı en kıt kaynak.** Kodu, içeriği, çeviriyi ve e-posta taslaklarını Claude
   yapar. Kurucu sadece insan gerektiren işi yapar: broker görüşmesi, Telegram'da topluluk,
   onay ve para kararı.
4. **Kırmızı çizgiler değişmez:** kâr/getiri vaadi yok, Instagram'da sinyal/VIP satışı yok,
   hukuki görüş olmadan ücretli reklam yok (bkz. `tanitim-reklam-programi.md` §1).
   Bir ay acele ettik diye 6. Instagram hesabını ya da markanın güvenini yakmayız.

---

## 2. Ekim'in beş hamlesi (öncelik sırasıyla)

### Hamle 1: Ölçümü aç (1–2 Ekim) · *kurucu 10 dk, Claude 2 saat*
- [ ] **Kurucu:** Vercel → fxpartner-global → Analytics → *Enable* (Web Analytics).
- [x] **Claude:** siteden çıkan her link tıklaması `outbound_click` tablosuna yazılıyor
      (`OutboundClickTracker`, `/api/click`); rapor: **`/tr/admin/tiklamalar`** (partner,
      sayfa ve kaynak kırılımı). Vercel Analytics açıksa `outbound_click` olayı da gidiyor.
- [x] **Claude:** Telegram'a giden her site linki `?utm_source=telegram` ile etiketleniyor
      (`lib/telegram.ts → tagSiteLinks`). Telegram uygulaması referrer göndermediği için
      bu okurlar önceden "direct" görünüyordu.
- [ ] **Kurucu:** broker ve prop panellerinden **Eylül rakamlarını** tek tabloya yaz:
      kayıt, FTD, lot, komisyon. Bu, Ekim'in başlangıç çizgisi (baseline).

### Hamle 2: Paketleri gerçek bir aboneliğe çevir (2–9 Ekim) · *en hızlı nakit*
NOWPayments yinelenen ödeme desteklemiyor, yani bugün Pro alan biri 30 gün sonra kendiliğinden
kayboluyor. Ekim'in en hızlı parası, bu sızıntıyı kapatmak ve peşin satış yapmak:
- [x] **3 aylık peşin paket:** Pro 3 ay **$149** (normalde $177), VIP 3 ay **$249** (normalde $297).
      Nakit bugün kasaya girer, müşteri 90 gün kalır.
- [x] **Yenileme hatırlatması:** `/api/cron/subscription-renewal` her gün 09:10 TSİ'de;
      bitişe 5 ve 1 gün kala e-posta, bitişten 2 gün sonra erişimi kapatıp "süren doldu"
      e-postası. Erken yenileyenin kalan günleri artık kaybolmuyor.
      **Not:** bu değişiklikten önce erişim hiç kapanmıyordu (`currentPeriodEnd` kontrol
      edilmiyordu). Süresi geçmiş eski aboneler ilk çalışmada ücretsiz katmana düşer.
- [ ] **"Ekim Kurucu Üye" fiyatı:** sadece 31 Ekim'e kadar geçerli, gerçek bir son tarih
      (sahte geri sayım yok). Ödeyenler fiyatı yenilemede de korur.
- [x] **IB köprüsü:** `hasVerifiedCashbackAccount()` zaten kodda var. Doğrulanmış LiteFinance
      veya IC Funded hesabı açana **1 ay Pro ücretsiz.** Bu, $59'lık bir indirimi tekrarlayan
      bir IB gelirine çevirir. Planın en kârlı hamlesi bu.

### Hamle 3: Bekleyen cashback anlaşmalarını kapat (5–16 Ekim) · *kurucu işi*
`cashback.ts`'de XM, Exness ve AvaTrade "pending" durumda. Canlı olmayan program hiçbir yerde
tanıtılamıyor, yani bu üç broker şu an yarım güçle çalışıyor.
- [ ] **Claude:** her hesap yöneticisine gönderilecek kısa ve net e-posta taslağını yazar
      (istenen: nihai oran yazılı olarak, ödeme takvimi, alt-IB izni).
- [ ] **Kurucu:** 5 Ekim'de gönderir, 12 Ekim'de takip eder.
- [ ] Teyit gelen her broker için `status: "live"` yapılır; broker sayfası, kampanyalar ve
      Telegram özetleri otomatik olarak tanıtmaya başlar.

### Hamle 4: Prop dikeyini paraya çevir (7–25 Ekim)
Elimizde doğrulanmış, %30'luk bir kod var (`EIEGEB`). Az kişinin sunabildiği bir şey bu ve
şu an sadece bir tablonun içinde duruyor.
- [ ] **Claude:** `/prop-firmalar/indirim-kodlari` sayfasını "Ekim 2026" başlıklı, güncel
      tarihli bir arama sayfasına çevirir ("prop firma indirim kodu" araması ticari niyetlidir).
- [ ] **Claude:** challenge'ı geçmeye odaklı 3 makale yazar: drawdown kuralı + pozisyon
      hesaplayıcı, "challenge'ı neden kaybediyorsun", IC Funded 5K/10K/25K maliyet hesabı.
      Hepsi koda ve hesaplayıcıya bağlanır.
- [ ] **Kurucu:** `prop-affiliate-application-list.md` Dalga 1'deki başvuruları yapar
      (The5ers, FTMO, FundingPips için indirim kodu iste). Her yeni kod = tabloda yeni bir satır.
- [ ] Telegram'da haftada 1 kez "challenge risk hesabı" içeriği paylaşılır (satış değil, eğitim + kod).

### Hamle 5: Sponsorlu alanları sat (20–31 Ekim)
Bileşenler hazır, eksik olan tek şey 3 haftalık trafik verisi (Hamle 1'den gelecek).
- [ ] **Claude:** `/reklam` medya kiti sayfasını hazırlar: aylık ziyaret, Telegram üye sayısı,
      dil dağılımı, alan fiyatları.
- [ ] **Kurucu:** zaten IB ilişkisi olan 3 brokera (XM, LiteFinance, Exness) Kasım için
      sabit ücretli alan teklif eder. Mevcut ilişki, soğuk satıştan çok daha kolaydır.

---

## 3. Takvim

| Hafta | Tarih | Odak | Kurucu | Claude |
|---|---|---|---|---|
| **H0** | 1–4 Eki | Ölçüm + baseline | Analytics aç, Eylül rakamlarını topla | Tıklama takibi, UTM'ler |
| **H1** | 5–11 Eki | Paket ve abonelik | Broker e-postalarını gönder, Telegram'da Ekim duyurusu | 3 aylık paket, yenileme e-postası, Pro karşılığında IB köprüsü |
| **H2** | 12–18 Eki | Cashback + prop | Broker takibi, prop başvuruları | İndirim kodu sayfası, 3 prop makalesi, çeviriler |
| **🔎 15 Eki** | | **Ara kontrol** | Rakamlara bak, karar ver | Rapor hazırla |
| **H3** | 19–25 Eki | Ölçekle | Çalışana yüklen, çalışmayanı kes | Kazanan kanala ek içerik, medya kiti |
| **H4** | 26–31 Eki | Kapanış | "Kurucu Üye" son hafta duyurusu, reklam teklifleri | Ay sonu raporu, Kasım planı |

### Kurucunun günlük rutini (≈ 60–90 dk)
- **10 dk:** dünkü rakamlar (Analytics + broker panelleri + NOWPayments).
- **30 dk:** Telegram: soruları yanıtla, günün 1 değerli paylaşımı (otomatik özetlere ek, insan sesiyle).
- **20 dk:** o haftanın kurucu işi (e-posta, başvuru, görüşme).
- **10 dk:** Claude'a o günün işini ver ve bir önceki işi onayla.

---

## 4. Hedefler: başlangıç değeri ölçülünce kesinleşir

Bugün baseline olmadığı için aşağıdakiler **taban hedeflerdir**. 4 Ekim'de Eylül rakamları
geldiğinde güncellenir. Birim ekonomisi:

| Kalem | Birim | Ekim tabanı | Not |
|---|---|---|---|
| Pro/VIP satış | $59–$249 | **10 ödeme** | Bunun bir kısmı 3 aylık peşin paket olmalı |
| Doğrulanmış cashback hesabı | tekrarlayan IB geliri | **15 hesap** | Asıl değer; her biri aylarca komisyon üretir |
| Prop satışı (EIEGEB + yeni kodlar) | ~$20–40 komisyon | **20 satış** | `prop-firm-strategy.md` §0'daki aralık |
| Canlıya geçen cashback programı | — | **+2 broker** | XM / Exness / AvaTrade'den en az ikisi |
| Kasım için satılan reklam alanı | sabit ücret | **1 anlaşma** | |

**Kuzey yıldızı metriği:** *aylık tekrarlayan gelir* = aktif paket aboneleri + aktif IB
müşterilerinden gelen komisyon. Ekim'in başarısı bu sayının Eylül'den yüksek kapanmasıyla ölçülür.

---

## 5. 15 Ekim ara kontrolü: devam mı, kes mi?

| Gözlem | Karar |
|---|---|
| Affiliate tıklaması var, kayıt yok | Sorun brokerın açılış sayfasında. Brokerla konuş, link/teklif değiştir |
| Paket sayfasına giriş var, ödeme yok | Kripto ödeme sürtünmesi. Ödeme adımlarını anlatan rehber ve USDT-TRC20'yi öne çıkar |
| Telegram trafiği, Google'ın 5 katı | İçerik bütçesini Telegram'a özel formatlara kaydır |
| Prop sayfası trafiği bariz biçimde önde | H3–H4'ü tamamen prop'a ayır |
| Hiçbir şey ölçülemiyor | Diğer her şeyi durdur, önce ölçümü düzelt |

---

## 6. Ekim'de yapmayacaklarımız

- Yeni dil, yeni büyük özellik, yeni 3D/animasyon çalışması
- Ücretli reklam (hukuki görüş kapısı geçilmeden)
- Instagram'da paket, sinyal veya affiliate linki satışı
- "Garanti", "aylık %X", kâr ekran görüntüsü, sahte aciliyet
- Teyit edilmemiş cashback oranını "canlı" gibi sunmak

Bunlar hız kazandırmaz. Markanın tek sermayesi olan güveni harcar.

---

## 7. İlk 48 saatin yapılacaklar listesi

0. [ ] **Kurucu, yayından ÖNCE:** `drizzle/0014_october_revenue.sql`'i Neon SQL editöründe
       çalıştır. Kod yeni kolonları okuyor; migration'sız yayın girişi bozar.
       SQL `IF NOT EXISTS` ile yazıldı, mevcut koda zararı yok, iki kez çalıştırmak güvenli.
1. [ ] **Kurucu:** Vercel'de Web Analytics'i aç
2. [ ] **Kurucu:** Eylül baseline tablosunu doldur (broker panelleri, NOWPayments, Telegram üye sayısı)
3. [x] **Claude:** affiliate tıklama takibi ve UTM'ler
4. [x] **Claude:** 3 aylık paket ($149 / $249) ve 1 ay ücretsiz Pro. "Ekim Kurucu Üye"
       fiyat kilidi henüz yok; ayrı bir karar.
5. [ ] **Claude:** XM / Exness / AvaTrade e-posta taslakları
6. [ ] **Kurucu:** Telegram'da Ekim duyurusu (metni Claude yazar, kurucu onaylar)
