# Veritabanı kesintisinde site ne yapar

**Durum:** Yayında (31.08.2026).
**Tetikleyen olay:** Neon compute kotasının dolması — 31.08 00:43–12:00 UTC.
**Denetim:** `node scripts/check-degradation.mjs`

---

## 1. O gün ne oldu

Veritabanı kotayı doldurdu ve her sorgu on bir saat boyunca hata verdi.
Kodda bunu yakalayan hiçbir yer yoktu, yani:

- Önbelleğe düşmeyen her okuyucu, üzerinde sadece bir hata numarası olan
  siyah bir ekran gördü (`ERROR 1461601500`). Ne başlık, ne menü, ne çıkış.
- Sayfanın **deposunda duran** içeriği de gitti: broker listesi, karşılaştırma
  tablosu, SSS — hiçbiri veritabanına ihtiyaç duymuyordu.
- `/sitemap.xml` derleme sırasında aynı hatayı yedi ve **tüm dağıtımlar**
  durdu. `main` iki commit geride kaldı.

Hata gruplarının en büyüğü tek bir sorguydu: oturum okuma. `auth()` kök
layout'tan çağrılıyor, yani oturum çerezi taşıyan bir okuyucu için **her**
sayfa, sayfanın kendi kodu çalışmadan önce ölüyordu (158 olay; ikinci sıradaki
70).

## 2. Kural

> Bir sayfa yalnızca **var olma sebebi** olan şey için ölür.

Eksik bir bölüm eksik bir bölümdür; ölü bir sayfa değildir.

| Yüzey | Veritabanı yokken |
|---|---|
| Kök layout, header, alt menü, proxy | Okuyucu **çıkış yapmış** sayılır (`optionalSession`) |
| Ana sayfa | Sinyal kartı ve puanlar olmadan render edilir, uyarı yok |
| `/brokerlar` | Puan rozetleri düşer, uyarı yok — yanlış bir şey yazmıyor |
| `/signals` | Pano boş + "şu an alınamıyor", canlı piyasa ızgarası çalışır |
| `/egitim`, `/haber-bulteni` | Liste yerine uyarı — **"henüz yayınlanmadı" değil** |
| `/brokers/[slug]` | İnceleme tam, yorumlar yerine uyarı, başlıkta sayı yok |
| `/topluluk` | Akış yerine uyarı |
| `/egitim/[slug]`, `/haber-bulteni/[slug]` | Ölür — ama markalı, çevrilmiş hata sayfasına |
| `/account` | Proxy girişe yönlendirir (kapalı tarafa düşer) |
| Bildirim ucu (`/api/notifications`) | 503 + boş gövde; zil son sayısını korur |
| Cron uçları, sunucu eylemleri, yazma yolları | **Değişmedi** — gürültülü kalmalı |

İki taraf da bilinçli. Bir dersin ya da bültenin **kendisi** satırsa, boş bir
makale iskeleti okuyucuya yalan, tarayıcıya da indekslenecek bir boşluk olurdu.
Orada görünür bir hata doğru cevaptır — ama Next'in varsayılan siyah ekranı
değil, sitenin içinde duran, dört dilde konuşan bir sayfa.

## 3. Parçalar

```
src/lib/dbOptional.ts            loadOptional(): veri + "alınamadı" bayrağı
src/lib/optionalSession.ts       oturum okunamıyorsa çıkış yapmış say
src/components/DataUnavailable.tsx  boş durumun dürüst hâli
src/app/[locale]/error.tsx       sayfa hatası: markalı, çevrilmiş, "tekrar dene"
src/app/global-error.tsx         layout'un kendisi çökerse: son çare
scripts/check-degradation.mjs    denetim
```

### `unavailable` bayrağı neden var

"Boş liste" ile "okunamadı" veride birbirinin aynısı görünür, ama sadece
birinin özrü vardır. Bayrak olmasaydı, kesinti sırasında `/haber-bulteni`
doksan bültenin üstünde **"Henüz bülten yayınlanmadı"** yazacaktı. Bunun
söylendiği okuyucu on dakika sonra geri gelmez.

### En ince tuzak

`try/catch` Next'in **akış kontrolünü** de yutar. `notFound()`, `redirect()`
ve "bu sayfa dinamik" işaretinin hepsi hata fırlatarak çalışır. İlk sürümde
`optionalSession` dinamik işaretini yuttu ve derleme, çerez okuyan sayfaları
statik üretmeye başladı — belirtisi, yine de "başarılı" diyen bir derlemenin
içindeki yığın izleri duvarıydı. Çözüm: her iki yardımcı da önce
`unstable_rethrow(err)` çağırır. Denetim bunu ayrıca kontrol eder.

## 4. Nasıl doğrulandı

Bu ortamda gerçek bir veritabanı yok, dolayısıyla ulaşılamayan bir
`DATABASE_URL` ile çalıştırmak simülasyon değil, **aynı arıza**:

- `npm run build` → 538/538 sayfa, yedi bozulma satırı adıyla loglandı,
  derleme tamam. Statik rota sayısı değişmedi (5).
- `npm run start` + istekler: `/tr`, `/tr/egitim`, `/tr/haber-bulteni`,
  `/tr/signals`, `/tr/brokerlar`, `/tr/brokers/xm`, `/tr/topluluk`,
  `/tr/paketler`, `/ua`, `/en/egitim`, `/ar/brokerlar` → hepsi **200**.
  `/tr/account` → **307** (girişe).
- Gerçek tarayıcıda (Chromium) ders ve bülten sayfaları: hata sınırı
  Türkçe, Ukraynaca ve Arapça olarak render oldu; header ve footer yerinde.

## 5. Paylaşılan okumalar — faturayı düşüren kısım

Bozulma kesintiyi dayanılır kılar; **sebebini** azaltan şey bu bölüm.

Neon sorgu sayısına değil **compute süresine** göre faturalanıyor ve boşta
kalınca uyuyor. Yani pahalı olan sorgunun büyüklüğü değil, veritabanını
uyandırma sayısı — ve site bunu neredeyse her istekte yapıyordu. En kötüsü
bir sayfa bile değildi: `/signals` her **15 saniyede** bir `/api/signals`'ı
yokluyor, yani açık bırakılmış tek bir sekme dakikada iki sorgu çalıştırıyor
ve veritabanı hiç uyuyamıyordu.

Bu verilerin hiçbiri okuyucuya özel değil. Sinyal panosu herkes için aynı
satırlar (maskeleme sonradan, kişiye göre uygulanıyor); ders listesi, bülten
listesi ve broker puan ortalamaları da herkes için aynı. Bu yüzden bir kez
okunup paylaşılıyorlar — `src/lib/cachedReads.ts`.

**Ölçüm** (sahte bir Neon ucu, gönderilen her SQL sayıldı; aynı derleme, aynı
istekler):

| İstek | Önce | Sonra |
|---|---|---|
| 5 × `/api/signals` | 10 sorgu | **2** |
| 5 × `/tr` | 15 sorgu | **0** |
| 5 × `/tr/egitim` | 5 sorgu | **0** |
| 5 × `/tr/brokers/xm` | 5 sorgu | **0** |
| 5 × `/tr/haber-bulteni` | 5 sorgu | **0** |
| +20 × `/api/signals` (bir sekme, beş dakika) | 40 sorgu | **0** |

Sıfırlar önbelleğin derleme sırasında ısınmasından: bir dağıtımdan sonra
production'da da durum bu.

**Süre taban, mekanizma değil.** Her girdi bir etiket taşıyor ve veriyi
*yazan* kod o etiketi temizliyor — yeni bir sinyal, yeni bir yorum, yeni bir
ders anında görünüyor, TTL'in dolmasını beklemiyor. TTL yalnızca kaçırılan
bir temizliğin ne kadar sürebileceğini sınırlıyor.
`scripts/check-cache-tags.mjs` her etiketin bir temizleyicisi olduğunu
denetliyor; temizleyicisi olmayan etiket, olmayı bekleyen bayat bir sayfadır.

**Tarih tuzağı.** `unstable_cache` değeri `JSON.stringify` ile saklayıp
`JSON.parse` ile döndürüyor: `Date` girer, **string** çıkar. En kötü hata
biçimi bu — ilk istek çalışır, sonraki her istek (yani önbelleğin var olma
sebebi olanlar) `.toISOString()` üzerinde patlar. Bu yüzden derleyici buna
izin vermiyor: `JsonSafe<T>` tipi, tarih taşıyan bir okumayı reddediyor.
Paylaşılan okumalar tarihlerini ISO string'e kendileri çeviriyor — zaten her
tüketici `new Date(...)` yapıyordu.

**Paylaşılmayanlar, bilerek:** oturum (tanımı gereği kişiye özel; çerezi
olmayan okuyucu için hiç sorgu çalışmıyor), abonelik/tier (kişiye özel), ve
makale sayfaları — `/egitim/[slug]`, `/haber-bulteni/[slug]` — görüntüleme
başına tek sorgu, buna karşılık bileşenleri satırın `Date` alanları üzerinde
doğrudan metot çağırıyor. Küçük kazanç, gerçek risk.

## 6. Açık kalan

- **Kotanın kendisi.** Bu iş kesintiyi görünür ve dayanılır kılar; onu
  önlemez. Neon/Vercel plan kararı hâlâ verilmedi (bkz. oturum notları).
- **Durum kodu.** Dinamik bir sayfa çoğu zaman gövdesini akıtmaya başlamış
  oluyor, yani yanıt zaten 200 ve hata sınırı istemcide render ediliyor.
  Sonradan değiştirilemez; kesintiyi tarayıcıya 503 ile bildirmek istenirse
  bu, sayfa kodunda değil kenar katmanında çözülecek bir iş.
