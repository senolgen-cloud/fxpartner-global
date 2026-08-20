# URL Mimarisi ve Long-Tail SEO Planı

**Hazırlanma:** 19 Ağustos 2026
**Amaç:** Her bölümü kendi landing page'ine sahip hale getirip long-tail organik trafiği açmak.
**Durum:** Karar bekliyor — Bölüm 2'deki migration kararı diğer her şeyin yolunu belirliyor.

---

## 1. Mevcut envanter

### Var olan rotalar

| Rota | Tip | Durum |
|---|---|---|
| `/brokers/[slug]` | 22 detay sayfası | ✅ Canlı, indexli |
| `/prop-firmalar` | Hub | ✅ Canlı (bugün) |
| `/signals` | Tek sayfa | ✅ Canlı |
| `/copytrade` | Tek sayfa | ✅ Canlı |
| `/ekonomik-takvim` | Tek sayfa | ✅ Zaten Türkçe |
| `/piyasa-analizi` + `/[slug]` | Hub + detay | ✅ Zaten Türkçe |
| `/teknik-analiz` + `/[date]` | Hub + detay | ✅ Zaten Türkçe |
| `/haber-bulteni` + `/[slug]` | Hub + detay | ✅ Zaten Türkçe |
| `/blog` + `/[slug]` | Hub + detay | ✅ Canlı |
| `/categories` + `/[slug]` | Hub + detay | ✅ Canlı |
| `/cashback`, `/campaigns`, `/partners`, `/paketler`, `/blacklist`, `/broker-lookup`, `/pozisyon-hesaplayici` | Tekil | ✅ Canlı |

### 🔴 En büyük eksik: broker index sayfası YOK

**`/brokers/` diye bir sayfa yok.** Broker listesi ana sayfada `/#brokers` çapası olarak duruyor.

Bunun anlamı: sitenin nişteki **en yüksek hacimli ticari kelimeler** için yarışabilecek
adanmış bir sayfası yok —

- "en iyi forex broker"
- "forex broker karşılaştırma"
- "güvenilir forex şirketleri"
- "forex broker önerisi"

Bir ana sayfa çapası bu kelimeler için adanmış bir sayfa kadar sıralanamaz. **Bu, slug
dilinden çok daha büyük bir kayıp** ve düzeltmesi sıfır risk taşıyor (yeni sayfa, migration yok).

### Diğer eksikler

| Eksik | Kaç sayfa | Neden değerli |
|---|---|---|
| Prop firma detay sayfaları | 6 → 15+ | 6 firma tek sayfada sıkışmış; her biri kendi markası için aranıyor |
| Parite bazlı sinyal sayfaları | ~18 | "eurusd sinyal", "altın sinyal" — yüksek hacim, tekrarlayan arama |
| Broker index | 1 | Yukarıdaki ticari kelimeler |

---

## 2. ⚠️ Karar noktası: `/brokers/` → `/brokerlar/` migration'ı

Bu, planın tek riskli parçası. **22 sayfa şu anda canlı ve Google tarafından indexlenmiş.**

### Gerçekler

- **301 yönlendirmesiz yapılırsa mevcut sıralamalar yok olur.** Amacın tam tersi.
- **301 ile yapılırsa hayatta kalır** ama bedava değil: Google'ın tam aktarımı haftalar-aylar
  sürüyor ve link değerinin küçük bir kısmı her zaman kayboluyor.
- **Slug dili zayıf bir sıralama sinyali.** Google "brokers" kelimesini gayet anlıyor.
  Başlık, içerik ve backlink'ler URL'deki kelimeden çok daha belirleyici.

### Yine de lehte olan argüman

- Site hâlâ görece genç — 22 sayfa yönetilebilir bir migration. **Sonra yapmak daha pahalı olacak.**
- Türkçe slug, SERP'te görünen URL'de kullanıcıya tanıdık geliyor → tıklama oranına küçük katkı.
- Next.js `redirects()` ile kalıcı 301 kurmak teknik olarak basit ve güvenilir.

### Öneri

**Migration'ı yap — ama Bölüm 3'teki yeni sayfalarla AYNI ANDA.**

Gerekçe: iki ayrı değişiklik = iki ayrı yeniden indexleme dalgası. Tek seferde yapılırsa
Google siteyi bir kez yeniden tarar, dalgalanma bir kez yaşanır.

Ve slug'ları da düzeltelim: `/brokers/xm` → `/brokerlar/xm-global` gibi, marka adının tam
hali. Bu, slug dilinden daha değerli.

> **Karar sizin.** "Migration'ı atla, sadece yeni sayfaları yap" da tamamen geçerli bir
> seçim — riski sıfırlar, değerin büyük kısmını yine alırsınız.

---

## 3. Hedef mimari

```
/brokerlar/                          ← YENİ hub (en yüksek ticari değer)
/brokerlar/xm-global/                ← migration + slug düzeltmesi
/brokerlar/litefinance/
/brokerlar/fxpro/
/brokerlar/ic-markets/
   … (22 broker)
/brokerlar/kategoriler/              ← /categories taşınır
/brokerlar/kategoriler/dusuk-spread/

/prop-firmalar/                      ← ✅ var
/prop-firmalar/ftmo/                 ← YENİ detay sayfaları
/prop-firmalar/fundednext/
/prop-firmalar/ic-funded/
   … (6 → 15+)
/prop-firmalar/indirim-kodlari/      ← YENİ, çok yüksek niyetli
/prop-firmalar/[slug]/indirim-kodu/  ← YENİ

/forex-sinyalleri/                   ← /signals taşınır
/forex-sinyalleri/eurusd/            ← YENİ (~18 parite)
/forex-sinyalleri/xauusd/
/forex-sinyalleri/gbpusd/

/forex-copytrade/                    ← /copytrade taşınır
/forex-ekonomik-takvim/              ← /ekonomik-takvim taşınır
/piyasa-analizi/                     ← değişmez
/teknik-analiz/                      ← değişmez
```

---

## 4. 🔴 En büyük teknik risk: ince (thin) sayfalar

Bu plan siteye **~60 programatik sayfa** ekliyor (22 broker + 18 parite + 15 prop + hub'lar).

**Google, ince programatik sayfaları site geneli için cezalandırır.** Yani kötü yapılırsa
bu plan trafiği artırmaz, azaltır.

Her sayfa tipinin ayakta durabilmesi için gereken özgün içerik:

| Sayfa tipi | Özgün içeriği nereden geliyor | Yeterli mi |
|---|---|---|
| `/brokerlar/[slug]` | Zaten dolu: inceleme, puanlama, artı/eksi, SSS, deepDive, yorumlar | ✅ Zaten güçlü |
| `/prop-firmalar/[slug]` | Kural setleri, drawdown tabloları, ödeme kanıtı, artı/eksi, ürün uyumu, SSS | ✅ Veri hazır |
| `/forex-sinyalleri/[parite]` | O paritenin canlı sinyali + kapanmış işlem geçmişi + `signalStats` kazanma oranı + `technicals.ts` seviyeleri + parite hakkında özgün metin | ⚠️ **Dikkat gerektiren tek yer** |

**Parite sayfaları için kural:** Bir paritede yeterli kapanmış işlem geçmişi yoksa o sayfa
**yayımlanmaz**. `signalStats.ts` zaten "eşiğin altında sayı yayımlama" disiplinini taşıyor;
aynı eşik sayfa yayımlamaya da uygulanmalı. 18 ince sayfa yerine 6 dolu sayfayla başlamak
her açıdan daha iyi.

---

## 5. Uygulama sırası

### Faz 1 — Sıfır riskli, en yüksek değer (önce bu)

1. **`/brokerlar/` hub sayfası** — ana sayfa çapasının yapamadığı işi yapar.
   En yüksek hacimli ticari kelimeler. Migration yok, yeni sayfa.
2. **`/prop-firmalar/[slug]`** — 6 detay sayfası. Veri hazır, sadece render.
3. **`/prop-firmalar/[slug]/indirim-kodu`** — prop aramalarının en yüksek niyetli kategorisi.
   IC Funded'ın `EIEGEB` kodu artık canlı, bu sayfa bugün değer üretebilir.

### Faz 2 — Migration (karar verilirse)

4. `next.config.ts` içine kalıcı 301 tablosu.
5. `/brokers/[slug]` → `/brokerlar/[slug]` + slug düzeltmeleri.
6. `/signals` → `/forex-sinyalleri`, `/copytrade` → `/forex-copytrade`,
   `/ekonomik-takvim` → `/forex-ekonomik-takvim`.
7. Sitemap, iç linkler, `navLinks.ts`, mobil şerit, JSON-LD `url` alanları güncellenir.
8. Google Search Console'da adres değişikliği bildirimi + yeni sitemap gönderimi.

### Faz 3 — Parite sayfaları (içerik eşiği dolunca)

9. `/forex-sinyalleri/[parite]` — yalnızca yeterli kapanmış işlem geçmişi olan pariteler.

---

## 6. Migration yapılırsa: teknik kontrol listesi

- [ ] `next.config.ts` → `redirects()` ile **kalıcı (308/301)** yönlendirmeler
- [ ] Eski slug → yeni slug eşleme tablosu tek bir dosyada (elle dağıtılmaz)
- [ ] `sitemap.ts` yalnızca YENİ URL'leri listeler (eskiler asla kalmaz)
- [ ] Tüm iç linkler yeni URL'e — eski URL'e giden iç link kalmamalı
      (301 zinciri tarama bütçesi yakar)
- [ ] `alternates.canonical` her sayfada yeni URL
- [ ] JSON-LD içindeki `url` / `@id` alanları güncel
- [ ] `breadcrumbSchema()` çağrıları güncel
- [ ] OG/Twitter `url` alanları güncel
- [ ] `llms.txt` güncel
- [ ] Search Console: yeni sitemap gönder, eski URL'lerin 301 döndüğünü doğrula
- [ ] Deploy sonrası eski URL'lerin gerçekten 301 verdiğini canlıda test et

---

## 7. Beklenen etki

Dürüst tahmin, ayrıştırılmış:

| Kaynak | Etki | Güven |
|---|---|---|
| `/brokerlar/` hub sayfası | **Yüksek** — şu an yarışamadığımız ticari kelimeler | Yüksek |
| Prop firma detay sayfaları | **Yüksek** — her marka kendi adıyla aranıyor | Yüksek |
| İndirim kodu sayfaları | **Orta-Yüksek** — düşük hacim, çok yüksek dönüşüm | Yüksek |
| Parite sinyal sayfaları | **Orta-Yüksek** — ama içerik derinliğine bağlı | Orta |
| Slug'ın Türkçeleşmesi | **Düşük** — zayıf sıralama sinyali | Yüksek |
| Slug'ın tam marka adı olması (`xm` → `xm-global`) | **Düşük-Orta** | Orta |

**Okunuş:** Değerin büyük kısmı **yeni sayfalardan** geliyor, migration'dan değil.
Migration doğru yapılırsa nötr-hafif pozitif, yanlış yapılırsa ciddi negatif.
Bu yüzden Faz 1 önce.
