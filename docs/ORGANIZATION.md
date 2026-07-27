# FXPARTNER — Departman Yapısı

FXPARTNER burada, tek bir "site" değil, her biri belirli bir alanda uzman
bir "departman" tarafından yürütülen profesyonel bir finansal medya/danışmanlık
şirketi gibi kurgulanmıştır. Her departmanın gerçek kod karşılığı vardır: bir
departmana atanan her sorumluluk, bu repodaki somut bir route, data dosyası
veya sayfaya karşılık gelir. Tek doğruluk kaynağı [`src/lib/departments.ts`](../src/lib/departments.ts)
dosyasıdır — bu doküman onun okunabilir anlatımıdır, kendi başına ayrı bir
kaynak değildir.

**Kurucu:** Erdem Torun — CEO. Tüm departmanların üzerinde marka ve nihai
onay sahibi; "asla salesy değil, asla kâr garantisi yok" ilkesinin
sahibidir.

## Departmanlar

| Departman | Uzman | Sorumluluk | Otomasyon |
|---|---|---|---|
| Piyasa Analizi | Kaan Ediz — Baş Piyasa Analisti | Teknik analiz (market-update, BTC/USD, 2x/gün), günlük piyasa özeti duyurusu (market-analysis-share) | **Active** |
| Haber & Editöryal | Elif Sarman — Editöryal Direktör | Haber filtreleme/çeviri, `/blog`, news-update cron | Paused — bkz. aşağıdaki blok |
| Broker İstihbaratı & İnceleme | Deniz Akar — Baş Broker Analisti | Broker skorlama, `/brokers`, `/categories` | Manual |
| Ortaklık & Cashback | Mert Kıvanç — Ortaklıklar Direktörü | Rev-share anlaşmaları, `/cashback` | Manual |
| Reklam & Kampanya | Sena Yıldırım — Büyüme ve Reklam Direktörü | Haftalık kampanya özeti (campaign-digest) | **Active** |
| Sosyal Medya & Topluluk | Barış Ongun — Topluluk Yöneticisi | Telegram altyapısı, marka sesi tutarlılığı | Active |
| Uyumluluk & Marka | Aylin Demirtaş — Uyumluluk ve Marka Direktörü | Yasal metinler, son onay mercii | Manual |
| AI Danışman | Ada Yalman — AI Danışmanlık Direktörü | Ziyaretçi sohbet asistanı (`/api/chat`), editöryal metin ve kapak görseli üretimi — hem admin panelinden (`/admin/content-generator`) hem haftalık otomatik cron'dan (`blog-auto-generate`) — ikisi de doğrudan yayınlar, inceleme yok | **Active** — bkz. aşağıdaki blok |

Her departmanın tam görev tanımı, sahip olduğu dosyalar ve "expert" persona
detayı `src/lib/departments.ts` içindeki `Department` kayıtlarındadır.

### Telegram içerik çeşitliliği (2026-07-26 güncellemesi)

Telegram kanalı artık sadece BTC/USD grafiğiyle sınırlı değil — üç farklı
departman, üç farklı içerik türünü kendi ritminde paylaşıyor:

1. **market-update** (Piyasa Analizi) — BTC/USD teknik özeti, günde 2 kez (08:00 ve 18:00 UTC).
2. **market-analysis-share** (Piyasa Analizi) — güncel `/piyasa-analizi` günlük özetini duyurur; her 2 saatte bir kontrol eder ama aynı günü tekrar paylaşmaz (dedup: Postgres'teki `telegram_post` tablosu, Upstash'e ihtiyaç yok).
3. **campaign-digest** (Reklam & Kampanya) — aktif broker kampanyalarını ve cashback oranlarını haftalık özetler (Pazartesi 09:00 UTC).

**news-update hâlâ paused:** Vercel production'da `DEEPL_API_KEY` ve
`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` tanımlı değil (bkz.
`vercel env ls production`). Bu iki değişken eklenmeden schedule
açılırsa, route her çalıştığında 500 döner — daha önce tam olarak bu
yüzden kapatılmıştı (commit `d207f0`). Bu iki anahtar Vercel'e
eklendiğinde, `.github/workflows/telegram-cron.yml`'a bir `schedule`
girişi eklemek ve `departments.ts`'te bu departmanın `automation`
alanını `"active"` yapmak yeterli.

### Blog otomasyonu ve bilinçli istisna (2026-07-26 güncellemesi)

`blog-auto-generate` cron'u (AI Danışman) her Çarşamba 10:00 UTC'de
OpenAI ile bir blog yazısı + kapak görseli üretip **doğrudan yayınlar**
(`src/data/blog.ts` artık statik dizi değil, Postgres'teki `blog_post`
tablosu — bkz. `src/db/schema.ts`). Aynı gün ikinci bir çalıştırma
(ör. elle `workflow_dispatch` retry) o günün postunu tekrar üretmez,
no-op döner.

Bu, repodaki **tek istisna**: her yeni otomasyon önce `workflow_dispatch`
ile "paused" eklenip ancak Uyumluluk & Marka onayından sonra
`schedule`'a alınırken, `blog-auto-generate` site sahibinin doğrudan ve
bilgilendirilmiş talebiyle — bu riskin ("yayınlanmadan önce hiç kimse
okumuyor") kendisine açıkça gösterilip onaylanmasının ardından — baştan
`schedule` ile ve inceleme adımı olmadan eklendi. Teknik önlemler var
(broker gerçeklerini `aiAssistant.ts`'teki broker dizinine sabitleme,
aynı gün ikinci yayını engelleme) ama bunlar bir editöryal inceleme
kapısı değil.

## Otomasyon durumları ne anlama gelir

- **Active** — kod bir schedule'a bağlıdır ve insan müdahalesi olmadan
  çalışır. Bugün itibariyle bu durumda olanlar: Telegram gönderim
  altyapısının kendisi, market-update/market-analysis-share/campaign-digest,
  ve — yukarıdaki istisna ile — `blog-auto-generate`.
- **Paused** — route gerçek ve çalışır durumda, `.github/workflows/telegram-cron.yml`
  içinde tanımlıdır, ama tetikleyicisi yalnızca `workflow_dispatch`'tir
  (elle tetikleme). Bir cron'u "active"e almak, o workflow'a bir `schedule:`
  bloğu eklemek kadar basittir — ama bu adım **Uyumluluk & Marka
  Departmanı'nın (Aylin Demirtaş) onayından sonra** atılmalıdır, çünkü
  otomatik gönderim marka sesini ve yasal uyarı metnini insansız temsil
  eder hale gelir.
- **Manual** — otomasyon yok, kasıtlı olarak yok; bu alanlar (broker
  skorlama, cashback oranları, hukuki metinler) editöryal/insan
  onayı gerektirir ve otomatikleştirilmeye aday değildir.

## Yeni bir departman otomasyonu eklerken

1. Route'u `src/app/api/cron/<isim>/route.ts` altına, mevcut
   `market-update`/`news-update` route'larındaki `isAuthorized()` +
   `CRON_SECRET` deseniyle birebir aynı şekilde yaz.
2. `src/lib/departments.ts` içindeki ilgili departmanın `owns` listesine
   yeni dosyayı ekle.
3. `.github/workflows/telegram-cron.yml` içine **`workflow_dispatch`
   ile paused** bir job olarak ekle — asla doğrudan `schedule` ile başlatma.
4. Uyumluluk & Marka onayı alındıktan sonra, sadece o zaman `schedule:`
   bloğu eklenir ve departman kaydı `automation: "active"` olarak güncellenir.
