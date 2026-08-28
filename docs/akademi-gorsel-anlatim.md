# FXPARTNER Akademi — Görsel Anlatım Sistemi

**Durum:** Yayında (28.08.2026). Altı şekil, altı ders konusuna bağlı.
**Sahip:** Haber & Editöryal Departmanı (bkz. `src/lib/departments.ts`).
**Sayfalar:** `/egitim` (rozet + giriş), `/egitim/[slug]` (dersin içinde), `/egitim/gorsel-anlatimlar` (hepsi bir arada).

---

## 1. Sorun

Akademi dersleri düz yazı. Konu listesindeki (`src/lib/educationTopics.ts`) yaklaşık on
başlık için düz yazı yanlış biçim:

- "Kaybın telafisi orantılı değildir" — yazınca dört cümle, çizince tek bakış.
- "Buy limit fiyatın altına, buy stop üstüne konur" — tanım okumakla değil, çizgiyi
  görmekle oturuyor.
- "Londra ile New York 15:00–19:00 arası birlikte açık" — üç saat aralığını ezberlemek
  yerine tek eksende görmek gerekiyor.

Bu şekiller aynı zamanda **okurun geri döndüğü** kısım. Kimse buy limit'in hangi tarafa
konduğunu kontrol etmek için 400 kelimeyi tekrar okumuyor.

---

## 2. Karar: şekiller görsel dosya değil, işaretleme

Bu, sistemin tek önemli tasarım kararı ve alternatifi bariz göründüğü için gerekçesi
yazılı duruyor.

Site dört dilde yayınlanıyor (`tr`, `ua`, `en`, `ar`) ve biri sağdan sola. **PNG'ye
gömülen her etiket, okurun dörtte üçüne Türkçe görünürdü.** İşaretlemeyle çizilince:

| | PNG | İşaretleme (bugünkü yol) |
|---|---|---|
| Dört dil | Her dil için ayrı dosya | Etiketler `tr()`'den geçer |
| Arapça (RTL) | Ayrıca aynalanmış dosya | Düzen kendiliğinden aynalanır |
| Tema rengi | Rengin ekran görüntüsü | Temanın kendi token'ları |
| Telefon | Ölçeklenip bulanıklaşır | Kırılma noktasında yeniden dizilir |
| Ağırlık | Şekil başına yüzlerce KB | Sıfır ek istek |

Zaman ekseni tek istisna: `dir="ltr"` ile sabitlenmiş, çünkü 24 saatlik bir eksen Arapça
ağaçta da soldan sağa akar — aynalanırsa gece yarısı sağa düşer ve altındaki her saat
etiketiyle çelişir.

---

## 3. Dosyalar

```
src/lib/educationVisuals.ts              kayıt: hangi şekil hangi konuya ait
src/components/education/LessonFigure.tsx   çerçeve: başlık, çizim, altyazı, alt metni
src/components/education/Figure*.tsx        altı çizimin kendisi
src/app/[locale]/egitim/gorsel-anlatimlar/  hepsi bir arada sayfası
scripts/check-education-visuals.mjs         bağlantı denetimi
```

**Şekil derse değil, konuya bağlanır.** Dersin slug'ı üreticiden çıkar ve konu yeniden
yazılırsa değişebilir; `topic` ise kuyruğun kendi kimliği ve değişmez.

**Bir şekli birden fazla konu paylaşır.** Risk/ödül tablosu; ders risk/ödül oranını da,
beklenen değeri de, kâr al seviyesini de anlatıyor olsa aynı şekildir. Üç neredeyse aynı
kopya çizmek, senkronda tutulacak üç şey demek olurdu.

### Bugünkü altı şekil

| Şekil | Ne gösteriyor | Bağlı konular |
|---|---|---|
| `position-sizing` | Risk ÷ (stop × pip değeri) = lot, sayılı örnekle | 4 |
| `risk-reward` | 1:1 / 1:2 / 1:3 ve başabaş kazanma oranı (%50/%33/%25) | 4 |
| `drawdown-recovery` | −%10→+%11 … −%50→+%100, ortak ölçekte | 4 |
| `pending-orders` | Dört emir türü, güncel fiyat çizgisine göre | 4 |
| `trading-sessions` | 24 saatlik eksen, Londra–New York kesişimi | 3 |
| `leverage-margin` | 1:30 / 1:100 / 1:500 teminat, sabit pip değeri | 4 |

Altı şekil 108 konunun 23'ünü kapsıyor.

### Yeni şekil eklemek

1. `educationVisuals.ts`'e girdi ekle: `id`, `slug`, `title`, `caption`, `alt`, `topics`.
2. `src/components/education/Figure<Ad>.tsx` yaz. Sunucu bileşeni; her metin `tr()`'den
   geçmeli, hiçbir renk elle yazılmamalı — token kullan.
3. `LessonFigure.tsx` içindeki `FIGURES` haritasına bağla.
4. `node scripts/check-education-visuals.mjs` çalıştır.
5. Yeni Türkçe dizeleri `src/data/i18n/{en,uk,ar}/chrome.json`'a çevirileriyle ekle.

`alt` metni **çizimin tarifi değil, çizimin söylediği şey** olmalı. "Artan uzunlukta üç
çubuk" bir okura hiçbir şey vermiyor; "1:2'de başabaş kalmak için işlemlerin %33'ü
kazanmalı" veriyor.

### Denetim

`scripts/check-education-visuals.mjs` iki şeyi yakalar: var olmayan bir konu id'sine
bağlanmış şekil, ve aynı konuyu paylaşan iki şekil. İkisi de çalışma anında sessiz —
`getVisualForTopic()` `undefined` döner, sayfa şekilsiz ama tamamlanmış görünür.

---

## 4. Konu kuyruğu — üçüncü parti

`educationTopics.ts` 77'den 108 konuya çıktı. Yeni partide iki eksen var:

- **İşlem maliyeti.** İlk iki parti riski ve emri anlatıyordu, ama bir işlemin ne
  tuttuğunu — spread, komisyon ve swap'ın toplamını — hiçbir ders tek başına ele
  almıyordu. Altı konu (`total-cost-of-a-trade`, `cost-vs-holding-period`,
  `commission-vs-spread-math`, `currency-conversion-cost`, `inactivity-fee`,
  `deposit-withdrawal-mismatch`).
- **Otomasyon.** MT5 tarafından gelen okur EA, backtest ve aşırı optimizasyon
  sorularıyla geliyor; hepsi mekanik, yani listenin kapsamında. Beş konu.

Ayrıca: gün dönümü ve swap (3), hesap büyüklükleri ve teminat seviyesi (4), ölçüm ve
kayıt (4), psikoloji (5), platform kullanımı (4).

Sınır değişmedi: hiçbiri piyasa görüşü, tahmin ya da pozisyon açma gerekçesi değil.
Günde iki yazıyla kuyruk yaklaşık iki ay yetiyor.

---

## 5. Canva denemesi — ne çıktı, ne çıkmadı

Şekiller Canva'da denendi. Sonuç, yukarıdaki "işaretleme" kararını doğruladı; kayda
geçmesi gereken üç şey var.

**1. Canva'nın AI'ı verilen metni yazmıyor.** Formül kutuları ve sayılar tek tek
belirtildiği halde şablon dolgu metniyle geldi: *"Anahtar Noktalar"*, *"Doğru hesaplama,
yatırımcıların daha iyi kararlar almasını sağlar"*, *"Daha fazla bilgi edinin!"*. Açılış
cümlesi *"…risk yönetimi ve **kâr potansiyelini artırmak** açısından kritik"* idi — bu,
`src/lib/educationPost.ts`'teki getiri ima etme kuralının tam olarak yasakladığı biçim.
Üretilen içeriğin denetimden geçmesi gerektiği burada da geçerli.

**2. Dışa aktarma bu ortamdan alınamıyor.** `export-design` çalışıyor ve bir indirme
bağlantısı veriyor, ancak `export-download.canva.com`, `media.canva.com` ve
`design.canva.ai` egress politikası tarafından reddediliyor (403). Yani Canva çıktısı bu
oturumda depoya giremiyordu; bir sonraki denemede de giremeyecek.

**3. Elde kalan.** Pozisyon büyüklüğü infografiği düzeltildi ve hesapta duruyor:

- **Tasarım:** `DAHTm_0RNQk` — https://www.canva.com/design/DAHTm_0RNQk
- Dolgu metni gerçek ders içeriğiyle değiştirildi (formül + üç adım).
- Şablonun parlak yeşili (`#37d37a`) marka turkuazına (`#0891b2`) çekildi.
- Turkuaz zeminde okunmayan koyu gövde metni beyaza alındı.
- Alt bant: *"Yatırım tavsiyesi değildir · fxpartner.global/egitim"*.

Sosyal paylaşım için kullanılabilir (bkz. `docs/instagram-strategy.md`), ama hâlâ
şablonun konuyla ilgisiz stok görsellerini taşıyor. **Sitedeki şekiller bu tasarımdan
türetilmedi ve ona bağlı değil** — kod tarafı kendi başına tamamdır.

**Sonraki tur için:** Canva'yı sitenin şekillerini üretmek için değil, onların sosyal
sürümlerini üretmek için kullanmak daha doğru. O durumda da metin `generate-design`'a
bırakılmamalı; şablon seçilip `edit-design` ile gerçek kopya yazılmalı.
