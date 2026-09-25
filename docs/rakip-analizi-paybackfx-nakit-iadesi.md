# PaybackFX — nakit iadesi rakip analizi

İnceleme tarihi: 25 Eylül 2026. Kaynak: paybackfx.com (ana sayfa, /brokers, /brokers/xm-group/15,
/support ve alt sekmeleri, /tools, /prop-firms, /tr).
Aşağıdaki rakamların hepsi **onların sitesinde yazdığı haliyle** alınmıştır; bağımsız olarak
doğrulanmadı. Oranların neredeyse tamamı "up to / kadar" ile yazılmış, yani tavan değerlerdir.

---

## 1. Kısaca kim

- Forex iade (rebate/cashback) aracısı. Kendi brokerı yok; ortağı olduğu brokerlara müşteri
  yönlendiriyor, brokerdan aldığı IB komisyonunun büyük kısmını kullanıcıya geri veriyor.
  Bizim XM ve Lite Finance nakit iadesi modelimizle **birebir aynı mantık**.
- Sahibi **Myfxbook LTD**. Bu, sitenin en güçlü kozu: 2009'dan beri bilinen bir marka, "Brought to
  you by Myfxbook" her sayfada yazıyor ve yorumlar Myfxbook profilinden geliyor (4,3/5).
  Bizim muadilimiz: gerçek MT5 hesabı, yayınlanan sinyal geçmişi ve ödenen iade toplamı.
- 17 dil: en, tr, ar, ru, de, es, fr, it, hu, pl, pt, id, th, vi, zh, ja, ko. Türkçe ve Arapça
  sürümleri var, yani bizim iki pazarımızda da doğrudan rakip.
- Google Play'de mobil uygulaması var.

## 2. İade oranları — bizde de olan brokerlar

Lot başına rakamlar "round turn" (aç-kapa) başına.

| Broker | PaybackFX'in yayınladığı oran |
|---|---|
| **XM** | Micro/Standard: **18,75 $/lota kadar** · XM Zero/Ultra Low: **11,25 $/lota kadar** |
| **Exness** | Standard: spreadin %30'u · Pro: %18,75 · Raw Spread: lot başına 168,75 $'a kadar |
| **AvaTrade** | Tüm enstrümanlarda spreadin %30'u |
| **FxPro** | Uygulanan spread komisyonunun %30'u |
| **Tickmill** | Classic 7,5 $/lot · ECN Pro 1,5 $/lot + %5 komisyon indirimi · VIP 1,5 $/lot |
| **IC Markets** | Standard 0,409 pip/lota kadar · Raw: komisyonun %37,5'i |
| **Pepperstone** | Standard 0,37 pip/lot · Razor: komisyonun %17'si |
| **RoboForex** | Komisyonun %37,5'i (Prime %15) |

**Bizim için en kritik satır XM.** Bizim `src/data/cashback.ts` dosyasında XM için yazan tahmini
oran "lot başına 5 dolara kadar" ve statüsü hâlâ `pending`. PaybackFX aynı brokerda Micro/Standard
için 18,75 $ tavanı ilan ediyor. Aradaki fark üç sebepten olabilir:

1. Onların rakamı **tavan** ve büyük hacim kademesine ait olabilir.
2. Micro/Standard hesaplar geniş spreadli hesaplar; oradaki IB payı Zero/Ultra Low'dan yüksek olur.
3. Kendi anlaşmamızın payı gerçekten daha düşük olabilir.

Ne olursa olsun, "lot başına 5 dolara kadar" ilanıyla aynı brokerda 18,75 $ ilan eden bir rakiple
yan yana görünmek bizim aleyhimize. **Yapılacak iş:** XM ortak yöneticimizden hesap türü bazında
güncel IB kademelerini yazılı isteyip kendi oranımızı netleştirmek ve `cashback.ts` içindeki XM
kaydını `pending` olmaktan çıkarmak.

## 3. Ödeme mekaniği (en çok fark yarattığımız yer)

| Konu | PaybackFX | Biz |
|---|---|---|
| Raporlama | Gerçek zamanlı (brokerin verdiği ölçüde) | Panelde takip |
| Para ne zaman hazır | Brokerdan **ayda bir** toplanıyor (genelde ayın 1–10'u; XM'de 21–30 aralığı yazıyor), sonra çekilebilir | XM kampanyamızda **gün sonunda hesaba** |
| Nereye ödenir | Skrill, Neteller, Volet, WebMoney, Capitalist, USDT (TRC-20/ERC-20), banka havalesi, PayPal | İşlem hesabına |
| İşlem hesabına ödeme | **Yapılmıyor** — "3. taraf ödemesi kabul edilmiyor" | Doğrudan işlem hesabına geçiyor |
| Hesap para birimi | Sadece USD | — |

Çekim ücretleri ve limitleri (onların tablosu):

- Skrill EUR: min 1 €, ücret %0 · Skrill USD: %3
- Neteller EUR: %0 · Neteller USD: %3
- USDT (TRC-20 / ERC-20): min 10 ₮, ücret %3 + 3 ₮, günlük 2.000 ₮
- Banka havalesi: min 100 $, **40 $ ücret**
- PayPal: ayda 1 talep, min 10 $, limit 1.000 $
- WebMoney / Capitalist: %1

**Çıkarım:** Bizim en güçlü iki argümanımız burada. (a) İade **gün sonunda** ödeniyor, onlarda ay
sonunu ve toplama takvimini beklemek gerekiyor. (b) İade **işlem hesabına** geçiyor, yani ertesi
gün teminat olarak çalışıyor; onlarda cüzdana çekmek gerekiyor ve çekim ücreti var (banka havalesi
40 $, kripto %3). Bu iki cümle, nakit iadesi sayfamızın ve reklam metinlerinin ana vaadi olmalı.

## 4. Kurallar ve kısıtlar (bunları biz de yazmalıyız)

XM sayfalarında açıkça yazdıkları, bizim sayfamızda karşılığı olması gerekenler:

- **5 dakika kuralı:** XM, 5 dakikadan kısa süren işlemler için iade ödemiyor.
- **Bonus feragati:** "Bizim yönlendirdiğimiz hesaplar bonusa uygun değildir." XM'de iade ile
  bonusun aynı anda alınamadığını söylüyorlar. Bu bizim için **doğrulanması şart** bir nokta:
  sitemizde hem XM nakit iadesi hem XM bonus kampanyaları duruyor. İkisi aynı hesapta mümkün mü,
  XM'e sorulmalı; değilse kullanıcıya baştan söylemeliyiz.
- **Mevcut hesap sorunu:** XM'de mevcut hesap iadeye dahil edilemiyor, yeni hesap gerekiyor.
  Biz zaten "ek hesap aç" diyoruz — aynı kısıt, bizde daha anlaşılır anlatılmış.
- **Churning yasağı:** "Sırf iade üretmek için işlem yapmayın, broker bu iadeleri iptal eder."
  Bizim bonus/iade yazılarımızdaki "iade kazanmak için işlem açmayın" uyarısıyla aynı çizgi.
- **Demo hesap:** iade yok.
- **CySEC kısıtı:** XM'in CySEC kuruluşu iadeye dahil değil; ayrıca Avustralya, Belçika, Arjantin,
  Portekiz ve İspanya'ya kapalı.
- **Ülke kısıtları (site geneli):** İran, Irak, İsrail, Lübnan, Suriye ve ABD kabul edilmiyor.
- Aynı brokerda birden fazla hesap olabiliyor, ama **hepsi onların IB'si altında açılmış olmalı**.

## 5. Ürün tarafında kopyalanabilir iyi fikirler

1. **İade hesaplayıcı her yerde.** Ana sayfada, broker listesinde ve her broker sayfasında aynı
   hesaplayıcı var: birim (lot/pip/USD), günlük işlem sayısı ve iade oranı girilince aylık ve
   yıllık kazanç çıkıyor. Bizde `/pozisyon-hesaplayici` var ama **iade hesaplayıcı yok**.
   Nakit iadesi sayfamıza eklenmesi en hızlı kazanç.
2. **Broker başına ayrı iade sayfası.** Her broker için `/brokers/<isim>/<id>` şablonu: iade
   tablosu (hesap türü × oran), notlar, "nasıl çalışır", hesaplayıcı, broker künyesi (kuruluş yılı,
   regülasyon, ofisler) ve SSS. Bizde broker inceleme sayfaları var ama iade tarafı ince kalıyor.
3. **Hesap türü bazında tablo.** Tek bir "lot başına X $" yerine Micro/Standard/Zero ayrımı.
   Dürüst ve satın alma kararını kolaylaştırıyor.
4. **Prop firma cashback'i.** Bizim de ortağımız olan **Moneta Funded** onların listesinde:
   ilk alımda %10 iade, tekrar alımlarda %4, üstüne %15 indirim kodu. Diğerleri: PipFarm %7 + %15
   indirim, OneFunded %7 / %3,5 + %15, Eightcap Challenges %10 + %20. Bizim prop firma
   sayfalarımızda indirim kodu var ama **challenge ücretine iade** modeli yok; Moneta Funded ile
   konuşulabilir.
5. **Ücretsiz araç seti** (lot, pip, marjin, Fibonacci, pivot, iade hesaplayıcı) — SEO ve geri
   dönen trafik için klasik ama işe yarayan yem.

## 6. SEO yapısı — ve açık verdikleri yer

Kopyalanacak taraf:

- Başlık kalıbı: "XM Group Rebates & Cashback | Highest Rebate Rates", ana sayfa "Forex Rebates &
  Cashback | Highest Rebate Rates". Marka + kategori + iddia.
- Her broker sayfasında SSS bloğu (bizim blog yazılarımızdaki FAQPage yapısının aynısı).
- 18 hreflang bağlantısı, dil başına ayrı yol (`/tr/...`, `/ar/...`).

Zayıf tarafları — bizim avantajımız:

- **Canonical hatası:** Türkçe içerik gösterilirken sayfanın canonical'ı İngilizce adrese işaret
  ediyor (dil seçimi çerezle taşınıyor, URL aynı kalabiliyor). Bu, arama motoru için kopya içerik
  riski. Bizde her dilin kendi canonical'ı var, bu farkı korumalıyız.
- **Yapısal veri yok:** Broker sayfasında geçerli JSON-LD bulamadım (parse edilemeyen tek blok
  var). Bizim FAQPage/BlogPosting şemamız bu yönden önde.
- İçerik ince: broker sayfalarındaki açıklama metinleri şablon; spread tablosu boş (" - ")
  görünüyor. Bizim inceleme sayfalarımızdaki derinlik burada rakipsiz.

## 7. Yapılacaklar

**Hemen (bu hafta):**

1. XM'den hesap türü bazında güncel IB kademelerini yazılı iste; `cashback.ts` içindeki XM kaydını
   gerçek oranla güncelle ve `pending` durumundan çıkar.
2. XM'e "iade alan hesap bonusa uygun mu" sorusunu sor. Cevap hayırsa nakit iadesi sayfasına ve
   XM yazısına açık bir uyarı ekle.
3. Nakit iadesi sayfasına iki cümlelik fark vurgusu: **gün sonunda ödeme** ve **doğrudan işlem
   hesabına**. Rakibin ay sonu + çekim ücreti modeli karşısında en net üstünlüğümüz bu.

**Kısa vade:**

4. İade hesaplayıcı bileşeni (lot/günlük işlem → aylık/yıllık iade) ve `/cashback` sayfasına
   yerleştirilmesi.
5. Broker başına iade tablosu: hesap türü × oran, artı "hangi işlemler sayılmaz" notları
   (kısa süreli işlem, demo, churning).
6. Blog: "Forex nakit iadesi (cashback) nedir, nasıl ödenir?" — hesaplayıcıya ve broker
   sayfalarına link veren rehber. Mevcut XM yazımız kampanya odaklı; kategori odaklı bir yazı yok.

**Araştırılacak:**

7. Moneta Funded ile challenge ücretine iade konuşulması (rakip %10/%4 veriyor).
8. Türk pazarında hangi anahtar kelimelerde göründükleri (paybackfx.com/tr) ve bizim
   `/cashback` sayfamızla çakışan sorgular.
