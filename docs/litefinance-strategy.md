# LiteFinance Pazarlama Stratejisi — FXPARTNER

**Tarih:** 19 Ağustos 2026
**Kapsam:** LiteFinance'i FXPARTNER'ın ikinci ana gelir hattı haline getirmek (birinci: XM).
**Temel ilke:** Site önce, sosyal sonra. Her kanal `/brokers/lite-finance` sayfasına akar; affiliate linki hiçbir zaman ilk temas noktası değildir.

---

## 0. Bir cümlelik strateji

> LiteFinance'i "yüksek kaldıraçlı offshore broker" olarak değil, **"10 dolarla başlayıp 0.0 pip ECN'e kadar aynı çatı altında büyüyebildiğin merdiven"** olarak sat — ve regülasyon zayıflığını gizlemek yerine açıkça yazarak güven kazan.

Rakiplerin hepsi bonusu bağırıyor. Bonusla yarışmak fiyat savaşıdır ve kazanılamaz.
Kimse "hangi hesapla başlamalıyım, ne zaman geçmeliyim" sorusunu ciddiye alarak cevaplamıyor.
Boşluk orada.

---

## 1. Teşhis: elimizde ne var, gerçekten

### Satılabilir güçlü yönler (hepsi doğrulandı)

| Varlık | Neden önemli | Rakip karşılaştırması |
|---|---|---|
| Cent hesap, min. **10 $** | Gerçek parayla ama 1/100 risk ölçeğinde başlama | XM min. 5 $ ama cent hesap yok; Exness'te cent var, anlatısı yok |
| ECN, **0.0 pip / lot başına 0,25 $'dan** | Listedeki en ucuz maliyet yapılarından biri | XM Zero: lot başına 3,50 $ — anlatılması kolay bir fark |
| **Aynı brokerda üç seviye** (Cent → Classic → ECN) | Yatırımcıyı taşımak için broker değiştirmesi gerekmiyor | Bu merdiveni tek başlıkta anlatan Türkçe içerik yok |
| **Anlık para çekme** (otomatik akışta, günde 5.000 $'a kadar) | Forex'te 1 numaralı korku "param çıkmaz mı" — anlık çekim bu korkuyu tek cümlede bitirir | Somut, doğrulanabilir, sayı içeren bir vaat; rakiplerin çoğu "24 saat içinde" diyor |
| **4 platform** (MT4, MT5, cTrader, WebTerminal) | cTrader ECN/algo kitlesi için ayırt edici | XM ve çoğu rakip cTrader vermiyor |
| Kendi **copytrade** platformu | Pasif gelir arayan segment + sinyal veren tarafta gelir | `/signals` ve `/copytrade` sayfalarımızla doğal eşleşme |
| **%50'ye kadar nakit iade** (FXPARTNER IB) | En yüksek marjımız burada — XM'de lot başına ~5 $ | `/cashback`'te **tek aktif program**; diğer üçü hâlâ tahmini |
| **%20 koşulsuz teminat bonusu** (FXPARTNER'a özel) | Piyasadaki bonusların neredeyse tamamı hacim şartlı trade bonusu; koşulsuz teminat bonusu nadir | Rakiplerin bonus mesajıyla yarışmıyoruz — **farklı bir ürünü** anlatıyoruz |
| **Türkçe destek hattı** (turkiye@litefinance.com) | Offshore brokerlarda nadir | Güven itirazını doğrudan kırar |

### Gizlenmeyecek zayıf yönler

| Gerçek | Nasıl konuşulur |
|---|---|
| Türkiye'den açılan hesap **CySEC'li AB şirketine değil offshore şirkete** bağlanır | Açıkça yaz. Bunu ilk yazan biz olursak "dürüst kaynak" konumunu biz alırız |
| SPK lisansı yok | Tüm yurt dışı brokerlar için geçerli — kıyas çerçevesine oturt, örtme |
| Çekim yalnızca **yatırılan yönteme ve para birimine** | Bir "ilk gün kurulum" içeriğine dönüştür: doğru yöntemi baştan seç |
| Bazı yöntemlerde **%0-2 çekim masrafı** | Maliyet karşılaştırma tablosunda dipnot olarak ver |
| Bonus **çekilemez**, hacim şartı var | "Bonus tuzağı" içeriği — en çok tıklanacak, en çok güven kazandıracak başlık |

> **Puan notu:** `scoreOverride: 9.1` yerinde kalıyor ve artık formülle de örtüşüyor. Anlık çekimin doğrulanmasıyla para çekme ekseni 5/5'e çıktı; dört eksen (regülasyon 3, maliyet 5, platform 5, çekim 5) **9.0** veriyor. Yani 9.1 artık bir editoryal istisna değil, neredeyse hesabın kendisi — sayfadaki dürüst regülasyon uyarısıyla birlikte savunulabilir.

---

## 2. Kime satıyoruz — üç persona, üç ayrı huni

### A. "İlk 10 dolar" — yeni başlayan (hacmin ~%50'si)
- **Kim:** Demo hesapta 2-8 hafta geçirmiş, gerçek paraya geçmekten korkuyor. 25-35 yaş, Instagram + YouTube.
- **İç görü:** Demo hesap psikolojiyi öğretmiyor. Bunu biliyorlar ama 500 dolar riske atamıyorlar.
- **Mesaj:** *"Demo hesap sana yalan söylüyor. 10 dolarlık cent hesap söylemiyor."*
- **Giriş içeriği:** `/blog/demo-hesaptan-gercek-hesaba-gecis` → cent hesap bölümü → `/brokers/lite-finance`
- **Dönüşüm:** Cent hesap açılışı. Küçük ticket, yüksek hacim, uzun ömür.

### B. "Maliyet avcısı" — aktif scalper / algo (hacmin ~%30'u, gelirin ~%55'i)
- **Kim:** Zaten işlem yapıyor, spread + komisyon toplamını hesaplıyor, cTrader/EA kullanıyor.
- **İç görü:** Bonusa değil, lot başına maliyete bakar. Nakit iadeyi anlar ve arar.
- **Mesaj:** *"XM Zero'da lot başına 3,50 $ ödüyorsun. LiteFinance ECN'de 0,25 $'dan başlıyor — üstüne %50'ye kadar nakit iade, üstüne anlık çekim."*
- **Giriş içeriği:** `/blog/ecn-vs-market-maker-broker-farki` → maliyet tablosu → `/cashback`
- **Dönüşüm:** ECN hesap + nakit iade kaydı. Asıl gelir buradan gelir.
- **Not:** Bu personanın en hızlı dönüşen hali "zaten LiteFinance hesabı olan" kişidir — hesabını kapatmasına gerek yok, sadece `/cashback/lite-finance/setup`'tan hesap numarasını gönderir. Nakit iade creative'inin ana mesajı budur.

### C. "Pasif gelir" — copytrade arayan (hacmin ~%20'si)
- **Kim:** Kendi işlem yapmak istemiyor ya da zamanı yok. `/signals` ve `/copytrade` trafiğimizin karşılığı.
- **İç görü:** "Kopyalarsam param başkasına mı gidiyor?" en büyük itiraz.
- **Mesaj:** *"Fonun kendi hesabında kalır. Kopyalamayı istediğin an durdurursun. 50 dolardan başlar."*
- **Giriş içeriği:** `/copytrade` → LiteFinance sosyal işlem bölümü → `/brokers/lite-finance`
- **Dönüşüm:** Sosyal işlem hesabı; ayrıca kendi sinyal hesabımızı kopyalanmaya açma ihtimali.

---

## 3. Konumlandırma: "Merdiven" anlatısı

Tüm içeriğin omurgası tek bir görsel fikir:

```
   $10                 $50                  $50
   CENT       ──►      CLASSIC       ──►    ECN
   3 pip               1.8 pip              0.0 pip + $0.25/lot
   komisyon yok        komisyon yok         ham spread
   "öğren"             "istikrar kur"       "maliyeti sık"
```

Her içerik parçası bu merdivenin bir basamağını anlatır ve bir sonrakine bağlar.
Bu; hem eğitim (Instagram'da güvenli), hem karşılaştırma (SEO'da aranıyor), hem de satış (dönüşüm) yapan tek çerçevedir.

**Slogan adayları**
1. `10 dolarla başla, 0.0 pip'te devam et.` ← üretilen görsellerde kullanılan
2. `Broker değiştirmeden büyü.`
3. `Cent'ten ECN'e, aynı çatı altında.`

---

## 4. Kanal planı

### 4.1 Site / SEO — ana motor

Hedef sorgular ve karşılık gelen sayfa (hiçbiri henüz yok işaretli olanlar üretilecek):

| Sorgu (aylık niyet) | Sayfa | Durum |
|---|---|---|
| litefinance güvenilir mi | `/brokers/lite-finance` SSS | ✅ güncellendi |
| litefinance yorumlar / şikayet | `/brokers/lite-finance` + `/complaint` | ✅ var |
| litefinance cent hesap nedir | SSS + yeni blog | ⚠️ SSS var, blog yok |
| litefinance ecn komisyon | SSS + maliyet tablosu | ⚠️ SSS var |
| litefinance para çekme süresi | SSS + deepDive | ✅ güncellendi (anlık çekim) |
| litefinance anlık para çekme | **yeni blog** | ❌ üretilecek |
| litefinance bonus çekilir mi | SSS | ✅ eklendi |
| litefinance türkiye spk | SSS | ✅ eklendi |
| litefinance copytrade nasıl | SSS + `/copytrade` | ⚠️ `/copytrade` LiteFinance bölümü yok |
| litefinance vs xm hangisi | **yeni karşılaştırma sayfası** | ❌ üretilecek |
| en düşük minimum yatırımlı forex firması | `/categories/beginners` | ✅ var |

**Yazılacak 5 blog yazısı (öncelik sırasıyla):**
1. `litefinance-cent-hesap-rehberi` — 10 dolarla gerçek işlem: cent hesap nedir, kime uygun, ilk hafta planı → Persona A
2. `litefinance-anlik-para-cekme` — Anlık çekimi açmanın üç şartı (KYC, kabinde otomatik çekim, uygun yöntem), hangi yöntem ne kadar sürer, %0-2 masraf nerede çıkar → en yüksek dönüşümlü güven içeriği
3. `litefinance-ecn-maliyet-hesabi` — Lot başına gerçek maliyet: LiteFinance ECN vs XM Zero vs Exness Raw, üzerine nakit iade eklenmiş net tablo → Persona B
4. `forex-bonus-tuzagi-hacim-sarti` — Bonus neden çekilemez, hacim şartı nasıl hesaplanır (marka-üstü, LiteFinance örnekli) → güven içeriği
5. `litefinance-vs-xm-karsilastirma` — İki sponsorlu brokerı dürüstçe karşılaştır; "hangisi senin için" karar ağacı → alt-huni

### 4.2 Instagram — `docs/instagram-strategy.md` kurallarına tabi

Bu doküman oradaki risk sınıflandırmasını **ezmez**. LiteFinance içeriği de aynı filtreden geçer:
- ❌ Bonus tutarı bağıran görsel, kâr ekran görüntüsü, "kazan" fiili → yayınlanmaz
- ✅ Hesap türü karşılaştırması, maliyet tablosu, "bonus tuzağı" eğitimi, çekim süreleri → yayınlanır
- Affiliate link bio'ya girmez; tek link `/instagram` sayfasına, oradan `/brokers/lite-finance`'a.

**Hazır creative'ler** (bkz. bölüm 5): kare kart feed'e, story 24 saatlik seriye.

### 4.3 Telegram — site sonrası dağıtım

Hafızadaki kural: içerik önce sitede yayınlanır, Telegram gönderisi siteye link verir.
- Blog yayınlandığı gün: özet + link (mevcut `/api/cron/blog-share` akışı)
- Haftada 1: "LiteFinance hesap türü" mini eğitimi + `/brokers/lite-finance` linki
- Kampanya değişiminde: `/campaigns` linki

### 4.4 YouTube Shorts / Reels — 4 video, tek çekim

| # | Başlık | Süre | Kanca |
|---|---|---|---|
| 1 | 10 dolarla gerçek forex hesabı açtım | 45 sn | Ekranda cent hesap açılışı, bakiye 1.000 cent |
| 2 | Lot başına ne kadar ödüyorsun? | 40 sn | XM Zero 3,50 $ vs ECN 0,25 $ tablosu |
| 3 | Bonusunu neden çekemiyorsun | 50 sn | Hacim şartı hesabı, tahtada |
| 4 | Bu brokerın Türkiye'de SPK lisansı yok — ne demek? | 60 sn | Dürüstlük içeriği, en çok paylaşılacak olan |

### 4.5 E-posta — mevcut bülten listesi

3 adımlı otomasyon (Resend altyapısı zaten var):
1. Gün 0 — "Hangi hesapla başlamalısın?" (merdiven görseli + karar ağacı)
2. Gün 3 — "Bonus almadan önce oku" (güven içeriği, satış yok)
3. Gün 7 — "%50'ye kadar nakit iade nasıl işler" (`/cashback` + kayıt)

---

## 5. Görsel envanter

AI ile üretilen arka plan plakaları + kod ile dizilen Türkçe tipografi. İkisinin ayrılması bilinçli: modeller Türkçe diakritikleri (ı, ş, ğ) bozar, tipografi kodda üretilince metin her zaman doğru ve her zaman yeniden üretilebilir.

**Hazır dosyalar:**

| Dosya | Ölçü | Kullanım |
|---|---|---|
| `public/campaigns/litefinance-fxpartner-ad.png` | 1672×941 | Site ad banner, Telegram, X, LinkedIn |
| `public/campaigns/litefinance-fxpartner-square.png` | 1080×1080 | Instagram feed |
| `public/campaigns/litefinance-fxpartner-story.png` | 1080×1920 | Story / Reels kapağı |
| `public/campaigns/litefinance-cashback-square.png` | 1080×1080 | Nakit iade kampanyası — CTA `/cashback/lite-finance/setup` |
| `public/campaigns/bg/litefinance-{16x9,1x1,9x16}.jpg` | — | Ham arka plan plakaları (yeni varyantlar için) |

**Rota parametreleri**

| Parametre | Değerler | Etki |
|---|---|---|
| `v` | `ad` \| `square` \| `story` | Ölçü ve yerleşim |
| `title` | serbest metin, `\n` satır kırar | İkinci satır otomatik yeşil vurgulanır |
| `subtitle` | serbest metin | Başlık altı açıklama |
| `cta` | `cashback` | CTA'yı incelemeden nakit iade kurulumuna çevirir — yalnızca programı **aktif** olan brokerda |

**Yeni varyant üretimi.** Türkçe karakterleri elle URL'e gömmeyin; kabuk bunları bozup görselde kutucuk (□) bırakıyor. `encodeURIComponent` ile üretin:

```bash
node -e "const fs=require('fs');const t='Bonusunu neden\ncekemiyorsun.';const s='Hacim sarti nasil hesaplanir';fetch('http://localhost:3000/api/og/broker-creative/lite-finance?v=square&title='+encodeURIComponent(t)+'&subtitle='+encodeURIComponent(s)).then(r=>r.arrayBuffer()).then(b=>fs.writeFileSync('yeni-creative.png',Buffer.from(b)))"
```

Rota her brokerda çalışır — arka plan plakası olmayan brokerda düz ink zemine düşer.

---

## 6. Huni ve ölçüm

```
Instagram / Shorts / SEO
        │
        ▼
  /brokers/lite-finance   ← tek gerçek iniş sayfası
        │
        ├──► /cashback          (Persona B — en yüksek marj)
        ├──► /copytrade         (Persona C)
        └──► referral link      (Persona A)
```

**UTM şeması** — istisnasız uygulanır:

```
?utm_source={instagram|telegram|youtube|email|organic}
&utm_medium={story|post|reels|broadcast|newsletter}
&utm_campaign=litefinance-merdiven
&utm_content={cent|ecn|bonus|copytrade}
```

**Takip edilecek 5 sayı** (haftalık, `/admin`):

| Metrik | Neden | 90 gün hedefi |
|---|---|---|
| `/brokers/lite-finance` oturumu | Huninin girişi | XM sayfasının %60'ı |
| Sayfa → referral tıklama oranı | Sayfa ikna ediyor mu | ≥ %8 |
| Nakit iade kaydı | Gerçek gelir sinyali | Haftada 5+ |
| Kayıt → ilk yatırım | Onboarding kalitesi | ≥ %35 |
| Lot hacmi / aktif müşteri | Gelirin asıl çarpanı | Ay bazında artan |

**Uyarı:** LiteFinance'te nakit iade oranı %50'ye kadar çıkıyor — XM'de lot başına ~5 $. İki brokerın gelir modeli farklı olduğu için lot başına net getiriyi ilk 30 günde ölçüp gerçek rakamı bu dokümana geri yazın; kanal bütçesi ona göre dağıtılmalı.

---

## 7. Uyum sınırları — istisnasız

> **%20 teminat bonusu — kapatılması gereken üç boşluk.** Kampanya metni ve blog yazısı, bonusun *teminata eklendiği, hacim şartı taşımadığı ve kârın yatırımcıya ait olduğu* esasına göre yazıldı. Üç koşul hâlâ teyit edilmedi ve reklam hacmi artmadan önce netleşmeli: **(1)** azami bonus tavanı var mı, **(2)** bonusun bir geçerlilik süresi var mı, **(3)** kısmi çekimde bonus hangi oranda düşülüyor. Metinlerde bu üçü "çekim yapıldığında hesaptan düşülebilir" ve "koşulları teyit edin" şeklinde temkinli bırakıldı; kesin rakamlar geldiğinde `promotion.note` ve blog yazısının son bölümü güncellenmeli.
>
> **Bir de ifade notu:** banner "koşulsuz, şartsız sadece LiteFinance'da" diyor. Blog yazısında bunu piyasa geneli için mutlak bir olumsuzlama olarak ("hiçbir global firma vermiyor") değil, doğrulanabilir bir ifadeyle yazdık: küresel brokerların standart uygulaması hacim şartlı trade bonusudur, koşulsuz teminat bonusu nadirdir ve genellikle iş ortaklıkları üzerinden sunulur. Mutlak iddia, tek bir karşı örnekle çürütülebilir ve yazının güvenilirliğini bitirir; bu haliyle aynı mesajı verip savunulabilir kalıyor.

| Asla | Yerine |
|---|---|
| "Garanti kazanç", "kesin kâr", aylık getiri vaadi | "Maliyet şu kadar", "süre şu kadar" — sadece doğrulanabilir sayı |
| Kâr ekran görüntüsü, bakiye paylaşımı | Hesap türü / maliyet karşılaştırma görseli |
| Bonusu ana mesaj yapmak | Bonusun koşullarını anlatan eğitim içeriği |
| "Regüle broker" demek | "Mauritius FSC lisansı var, CySEC şirketi Türkiye'ye hizmet vermiyor" |
| Affiliate linki bio'ya / story'ye doğrudan koymak | Kendi alan adımız → inceleme sayfası → link |
| DM'den yönlendirme, toplu mesaj | Herkese açık içerik, tek yönlü huni |

Her creative ve her gönderi risk uyarısı taşır: *"Yatırım tavsiyesi değildir. Kaldıraçlı işlemler yüksek risk içerir."* — üretilen üç görselin üçünde de gömülü.

---

## 8. 30 / 60 / 90 gün

**0-30 gün — temel**
- [x] `/brokers/lite-finance` derin inceleme, 3 hesap türü, dürüst regülasyon bölümü, 9 SSS
- [x] 4 creative (ad / kare / story / nakit iade) + yeniden üretim rotası
- [x] **Nakit iade canlıda:** `/cashback`'te LiteFinance "Aktif" rozetiyle en üstte, `/brokers/lite-finance` sayfasından `/cashback/lite-finance/setup`'a giden banner ile
- [x] **6 blog yazısı yayında** — cent hesap rehberi, anlık para çekme, ECN maliyet hesabı, bonus tuzağı, LiteFinance vs XM, teminat bonusu vs trade bonusu
- [x] **%20 teminat bonusu kampanyası canlıda** — `/campaigns`'te aktif kampanya, reklam slotlarında (`adImage`) ve paylaşım önizlemesinde (`ogImage`) `litefinance-teminat-bonusu.png`
- [ ] Kampanyanın eksik koşulları netleştirilsin: azami bonus tavanı, süre, çekimde düşülme oranı (bkz. bölüm 7 notu)
- [ ] Kapak görseli eksik olan 3 yazı (cent hesap, ECN maliyet, bonus tuzağı) — görsel üretim günlük limiti sıfırlandığında tamamlanacak
- [ ] `/copytrade` sayfasına LiteFinance sosyal işlem bölümü
- [ ] Diğer üç brokerın nakit iade oranı teyit edilip `status: "live"`a çekilsin

**30-60 gün — hacim**
- [ ] Yazıların iç linklenmesi: `/brokers/lite-finance`, `/cashback` ve `/pozisyon-hesaplayici` sayfalarından ilgili yazılara bağlantı
- [ ] 4 Shorts/Reels tek çekimde
- [ ] E-posta 3 adımlı otomasyon
- [ ] Instagram: haftada 2 LiteFinance içeriği (feed + story)

**60-90 gün — optimizasyon**
- [ ] `litefinance-vs-xm-karsilastirma` karar ağacı sayfası
- [ ] İlk 60 günün UTM verisiyle kanal bütçesi yeniden dağıtılır
- [ ] Lot başına net getiri ölçülüp XM ile kıyaslanır; sıralama/vurgu buna göre güncellenir
- [ ] Kendi MT5 hesabımız LiteFinance copytrade'de kopyalanmaya açılsın mı — karar

---

## 9. Kaynaklar

Bu dokümandaki tüm broker verileri şu kaynaklardan doğrulandı (19 Ağustos 2026):

- [LiteFinance — Hesap türleri](https://www.litefinance.org/trading/account-types/)
- [LiteFinance — Cent hesap](https://www.litefinance.org/trading/account-types/cent/)
- [LiteFinance — Sosyal işlem, nasıl çalışır](https://www.litefinance.org/social-trading/how-it-works/)
- [LiteFinance — Sosyal işlem SSS](https://www.litefinance.org/social-trading/faq/)
- [LiteFinance — Şirket bilgileri ve tüzel kişilikler](https://www.litefinance.org/about/)
- [LiteFinance — Promosyon ve bonuslar](https://www.litefinance.org/promo/bonuses/)
- [LiteFinance Türkiye — SSS](https://my.litefinance-tr.org/tr/education/faq)
- [FXScouts — LiteFinance incelemesi](https://fxscouts.com/broker/liteforex/)
- [BrokerAnalysis — LiteFinance 2026](https://www.brokeranalysis.com/broker-review/litefinance/)

Lisans numaraları, minimum tutarlar ve çekim süreleri kampanya başlatılmadan önce **her seferinde** brokerin resmi sitesinden yeniden teyit edilir.
