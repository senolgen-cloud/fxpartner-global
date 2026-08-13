# WintoFX "İşletmeler" Listesi — FXPARTNER Broker Lookup Kapsam Planı

**Güncelleme (2026-08-13, aynı gün):** A grubundaki 24 broker gerçek regülatör araştırmasıyla `brokerLookup.ts`'ye eklendi ve production'a push edildi (commit `5f5f455`). Ayrıca kendi 9 partner broker'ımıza (`brokers.ts`) gerçek lisans numaraları eklendi ve broker inceleme sayfalarına Low/Medium/High risk rozeti eklendi. Aşağıdaki "A grubu" listesi artık **tamamlandı** — kalan iş sadece B grubu (küçük Türkiye'ye özel markalar).

Tarih: 2026-08-13. wintofx.com/tr/businesses üzerindeki 6 sayfa (~180 firma) taranarak isim + slug + lisans etiketi çıkarıldı ([raw liste aşağıda](#ham-liste-wintofxten-çekilen)).

## Neden yeni sayfa açmıyoruz, mevcut sistemi büyütüyoruz

Sitede zaten tam olarak bu ihtiyaç için kurulmuş bir sistem var: **[`src/data/brokerLookup.ts`](../src/data/brokerLookup.ts)** + **`/broker-lookup`** sayfası:

- `BrokerLookupFullIndex` bileşeni tüm girdileri **sunucu tarafında düz HTML** olarak render ediyor (`<details>` içinde) — yani JS çalışmasa bile Google/AI crawler'lar her firmanın adını ve notunu görebiliyor. Bu, "AGENA MARKETS güvenilir mi" gibi aramalarda bizim de çıkmamız hedefine tam uyuyor.
- Dosyanın başında **çok net bir bütünlük kuralı** var: *"Every entry here is grounded in real research... never fabricated."* Yani WintoFX'in yaptığı gibi (uydurma "AAA" skorları, doğrulanmamış lisans numaraları) burada yapamayız — her girdi gerçek bir kaynağa (regülatör uyarı listesi, SPK bülteni, bağımsız inceleme) dayanmalı.

Bu yüzden yeni bir "broker kartı" şablonu/route'u sıfırdan kurmak yerine, WintoFX'in listesindeki isimleri bu mevcut veritabanına **gerçek araştırmayla** eklemek doğru yol.

## Karşılaştırma sonucu — WintoFX'in 180 firmasının bizdeki durumu

### ✅ Zaten tam incelemesi var (brokers.ts) — 9 firma
AVATRADE, EXNESS, FXPRO, IC MARKETS, markets.com, TICKMILL, THİNK MARKETS, XM — bunlar zaten `/brokers/[slug]` altında tam incelemeye sahip, `brokerLookup.ts`'de de `relatedSlug` ile bağlı.

### ✅ Zaten brokerLookup.ts'de araştırılmış — 21 firma (isim varyasyonuyla eşleşiyor)
Arama zaten çalışıyor çünkü `searchLookupBrokers` substring eşleştirmesi yapıyor (örn. "OCTAFX" araması "Octa (OctaFX)" kaydını buluyor). Aşağıdakiler ekstra iş gerektirmiyor, sadece teyit:

| WintoFX adı | Bizdeki kayıt | Verdict |
|---|---|---|
| ETORO | eToro | verified |
| FBS | FBS | caution |
| FOREX.com | FOREX.com | verified |
| FP MARKETS | FP Markets | verified |
| HFM MARKETS | HFM (HF Markets/HotForex) | caution |
| IG | IG | verified |
| İNTEGRAL YATIRIM | İntegral Yatırım Menkul Değerler | verified (SPK) |
| KLAS FX | KlasFX (klasfx275.com) | high-risk |
| NORDFX | NordFX | caution |
| OANDA | OANDA | verified |
| OCTAFX | Octa (OctaFX) | caution |
| PEPPERSTONE | Pepperstone | verified |
| PLUS500 | Plus500 | verified |
| SWİSSQUOTE | Swissquote | verified |
| VANTAGE | Vantage Markets | verified |
| VOLUME INVESTMENT | Volume Investment | high-risk (tam isim eşleşmesi) |
| CRYON FX | CryonFX (cryonfx5.com) | high-risk |

### ⚠️ Muhtemel varyant, doğrulama gerekiyor — 4 firma
Aynı marka ailesinden olabilir ama farklı domain/unvanla kayıtlı, teyitsiz birleştirme yapmadım:
- GALATA YATIRIM ↔ bizdeki "Galata Menkul (galatamenkul.org)"
- DİNAMİK YATIRIM ↔ bizdeki "Dinamik Menkul Değerler"
- PHASE FOREX ↔ bizdeki "Phase Global (phaseglobal7/8.com)"
- WINEX MARKETS ↔ bizdeki "Winex Global (winexglobal7/8.com)"

### ❌ Bizde hiç yok, araştırma gerekiyor — ~150 firma
İki kategoriye ayrılıyor:

**A) Tanınmış, muhtemelen gerçekten regüleli uluslararası brokerlar (~20)** — hızlı, düşük riskli araştırma (resmi regülatör sitesinden lisans teyidi yeterli): Axi, BDSwiss, Capital.com, CMC Markets, Equiti, FXCM, FxOpen, FXTM, GO Markets, ICM Capital, Imperial Markets, Infinox, IronFX, JustMarkets, Libertex, MultiBank Group, Scope Markets, XTB, Dukascopy, Admirals (zaten var, teyit), Alpari, InstaForex, RoboForex, LiteForex, PocketOption, QuadcodeFX.

**B) Küçük/tanınmayan marka adları (~130)** — çoğu muhtemelen offshore/lisanssız veya Türkiye'ye özel "X Yatırım/Menkul/Capital/FX" tipi platformlar. Bunlar tam olarak brokerLookup.ts'nin "Turkey's SPK access-blocking actions" bölümündeki gibi tek tek SPK bülteni / regülatör uyarı listesi taranarak doğrulanmalı — toplu/hızlı yapılamaz, yanlış "high-risk" etiketi gerçek bir firmaya zarar verebilir, yanlış "verified" etiketi ise kullanıcıyı riske atar.

## Önerilen aksiyon sırası

1. **A grubu (~20 tanınmış broker)** — bir sonraki oturumda gerçek araştırmayla (resmi regülatör lisans sorgulama sayfaları) `brokerLookup.ts`'ye eklenebilir. Bu, en yüksek arama hacmine sahip isimler olduğu için öncelik.
2. **B grubu (~130 küçük marka)** — SPK'nın erişim engelleme bültenleri ve FCA/CySEC/BaFin uyarı listeleri taranarak kademeli eklenmeli. Tek seferde değil, haftalık/aylık bültenler takip edilerek büyütülecek bir çalışma.
3. **Varyant teyidi (4 firma)** — aynı marka ailesi mi değil mi, domain/WHOIS veya şirket unvanı karşılaştırmasıyla netleştirilip mevcut kayıtlara birleştirilebilir.
4. **SEO ölçümü** — `/broker-lookup` sayfasının Search Console'da hangi marka-adı sorguları için gösterildiğini birkaç hafta sonra kontrol etmek, gerçekten "AGENA MARKETS" tarzı aramalarda çıkıp çıkmadığımızı doğrular.

## Ham liste (WintoFX'ten çekilen, 180 isim)

<details>
<summary>Tümünü göster</summary>

A-MARKETS, AB TRADE, ACY SECURITIES, ADMIRALS, AGENA MARKETS, AGİLE GLOBAL, AKÇE MENKUL KIYMETLER, AKDENİZ YATIRIM, AL GLOBAL MARKET, ALL CAPITAL, ALPARI, ALTERNATİF YATIRIM, ALTIN YATIRIM, ANADOLU MENKUL, AVATRADE, AVAX MARKETS, AVENOR YATIRIM, AVIS YATIRIM, AVİX TRADE, AVRUPA FX, AXI, BDSWISS, BETA YATIRIM, BEXTON CAPITAL, BİRLİK GLOBAL MARKETS, BLUEBERRY GLOBAL MARKETS, BONNY MARKETS, BORSA PRİME, BULL BEAR EXCHANGE, BURGAN BANK, Capital.com, CMC Markets, COPİDAY, COSMO MARKETS, COSMOS CAPİTAL, CPT MARKETS C1, CRYON FX, D PRİME, DAİCHAİCONİC, Delta N1 Capital, DİNAMİK YATIRIM, DREXEL İNVEST, DS FİNANCE, DUKAS COPY, EFON GLOBAL MARKETS, EFOR FX, EIGHTCAP, ENDEKS MENKUL DEĞERLER, EQUİTİ, ES MENKUL, ETORO, ETX CAPITAL, EVO MARKETS, EXBİNA, EXFAST MARKETS, EXNESS, FBS, FİBER MARKETS, FINOVA MARKETS, FİRST GLOBAL FX, FOREX.com, FOURPRO, FOX MARKETS, FP MARKETS, FXCHOICE, FXCM, FXGiants, FXOPEN, FXPRO, FXTM, GALATA YATIRIM, GALYA MARKETS, GANN MARKETS, GANO PRIME, GARNET TRADE, GEX FINANCE, GKM FOREX, GLOBAL EXP, GO Markets, GODO, HFM MARKETS, HYCM, IC MARKETS, ICM CAPITAL, İDOL FX, IG, İKAS FX, IMPERIAL MARKETS, INFINOX, İNFO CAPİTAL, İNFO GLOBAL MARKETS, INSTAFOREX, İNTEGRAL GROUP YATIRIM C1, İNTEGRAL YATIRIM, IRONFX, IŞIK MENKUL DEĞERLER, JARDEN, JOY FX, JUST MARKETS, KLAS FX, LIBERTEX, LİTE FOREX, LOTAS CAPİTAL, LUNA CAPİTAL, MAJESTYFX, markets.com, MASTER MARKETS, MERCURY YATIRIM, MONETA MARKETS, MONEY GRAM TRADE, MONO CAPİTAL, MONZO CAPİTAL, MOYA MARKETS, MULTIBANK GROUP, NEROX İNVEST, NET VARLIK MENKUL DEĞERLER, NEXT LEVEL FX, NOBLE TRADİNG, NORDFX, NOREXA FİNANCE, NUMBER ONE CAPİTAL, OANDA, OCTAFX, OLİVE MARKETS, ONSA FX, ORDER INVEST, ORNEX CAPITAL, PEPPERSTONE, PHASE FOREX, PLUS500, POCKET OPTİON, PRAVDA MARKETS, PRESTİGE İNVEST, PROFIT CAPITAL, QUADCODEFX, QUİCK MONEY MARKETS, RADİO CAPİTAL, RAVEX GLOBAL, RJ YATIRIM, ROBOFOREX, SARDİS MARKETS, SARIKAYA YATIRIM, SCOPE MARKETS, SILVER INVEST, STAR GROUP FX, SWİSSQUOTE, T&T GLOBAL GROUP, THEOS MARKETS, THİNK MARKETS, THOMSON İNVESTMENT, TICKMILL, TİCKZ, TONİKS TRADE, TRADE GLOBAL, ÜLKER YATIRIM, UNIQ INVESTMENT, ÜNLÜ & Co, VALORA, VANTAGE, VELTARA MARKETS, VERTEX FOREX, VERTEX MARKETS, VEXA İNVESTMENT, VİNOVA MARKET, VLC CAPITAL, VOLUME INVESTMENT, VOLYA MARKETS, W2 FOREX, WePro, WINEX MARKETS, WINX BROKERS, XBN CAPITAL, XM, XTB, XYLO MARKETS, ZEN CAPITAL MARKET, ZENİTH MARKET

</details>

## Not

Bu çalışma kod değişikliği içermiyor — sadece envanter/kapsam analizi. A grubundaki ~20 tanınmış broker için gerçek regülatör teyidiyle `brokerLookup.ts`'ye ekleme yapmamı istersen bir sonraki adım olarak başlayabilirim.
