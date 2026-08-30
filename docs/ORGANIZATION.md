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
| Haber & Editöryal | Elif Sarman — Editöryal Direktör | Haber filtreleme/çeviri, `/blog`, blog-share duyurusu | **Active** — news-update hâlâ paused, bkz. aşağıdaki blok |
| Broker İstihbaratı & İnceleme | Deniz Akar — Baş Broker Analisti | Broker skorlama, `/brokers`, `/categories` | Manual |
| Ortaklık & Cashback | Mert Kıvanç — Ortaklıklar Direktörü | Rev-share anlaşmaları, `/cashback`, Sub-IB partner başvuruları (`/partners`) | Manual |
| Reklam & Kampanya | Sena Yıldırım — Büyüme ve Reklam Direktörü | Haftalık kampanya özeti (campaign-digest) | **Active** |
| Sosyal Medya & Topluluk | Barış Ongun — Topluluk Yöneticisi | Telegram altyapısı, web push bildirimleri, marka sesi tutarlılığı | Active |
| Uyumluluk & Marka | Aylin Demirtaş — Uyumluluk ve Marka Direktörü | Yasal metinler, son onay mercii | Manual |

Her departmanın tam görev tanımı, sahip olduğu dosyalar ve "expert" persona
detayı `src/lib/departments.ts` içindeki `Department` kayıtlarındadır.

## Ekip (28.08.2026'da katıldı)

On iki kişi departmanlara dağıtıldı. `src/lib/departments.ts` içindeki
`team` alanında duruyorlar — yukarıdaki tabloda görünen `expert` alanında
**değil**, ve bu kasıtlı: `expert` üretilen içeriğin editöryal sesi olan
kurgusal bir personadır, `team` ise gerçek kişilerdir. İkisini aynı alanda
tutmak, makine yazımı metni gerçek bir insanın imzasıyla yayınlamak olurdu.

| Departman | Kişi | Görev | Sorumluluk |
|---|---|---|---|
| Piyasa Analizi | Mehmet Ali Erdoğan | Kıdemli Teknik Analist | Günlük teknik analiz, `/teknik-analiz` enstrüman kapsamı |
| Piyasa Analizi | Tuğçe *(soyadı teyit bekliyor)* | Makro Ekonomist | Ekonomik takvim yorumu, veri günleri |
| Haber & Editöryal | Şebnem Köse | Akademi Editörü | Akademi ders serisi, konu kuyruğu, görsel anlatım metinleri |
| Haber & Editöryal | Yunus Emre Coşkun | Haber Editörü | Haber filtreleme ve çeviri kalitesi, `/haber-bulteni` |
| Broker İstihbaratı | Dilek Arabacıoğlu | Regülasyon Araştırmacısı | Lisans doğrulama, `/broker-lookup`, risk uyarı listesi |
| Broker İstihbaratı | Taner Turan | Broker Analisti | Maliyet/spread karşılaştırması, `/categories`, prop firma incelemeleri |
| Ortaklık & Cashback | Erdem Tarlan | Ortaklık Yöneticisi | IB/rev-share takibi, cashback oranı doğrulama, `/partners` |
| Reklam & Kampanya | Gülşah Avcı | Kampanya Küratörü | Kampanya şartlarının kaynağından doğrulanması, `/campaigns` |
| Sosyal Medya & Topluluk | Esmanur Bulut | Sosyal Medya Uzmanı | Instagram yayın planı, görsel içerik |
| Sosyal Medya & Topluluk | Sezgin Ünal | Topluluk ve Sinyal Operasyonu | Telegram kanalı, sinyal duyuru temposu, VIP akışı |
| Uyumluluk & Marka | Nilüfer Hatun | Uyumluluk Uzmanı | Yasal metinler, şikayet süreci, otomasyon 'active' onayı |
| Uyumluluk & Marka | Arif Tuncel | Veri Koruma Sorumlusu | Çerez onayı ve consent kayıtları, `/privacy` |

**Kayda geçmeyen:** kimsenin özgeçmişi, önceki işvereni ya da sertifikası.
Roster kurulurken bu bilgiler verilmedi; gerçek bir kişi adına kariyer
uydurmak, alanı boş bırakmaktan kötüdür. Kendileri ilettiğinde eklenir.

**Görev dağılımı bir öneridir.** Kimin hangi alanda uzman olduğu
bilinmediği için atamalar kişilerin geçmişine değil, departmanların
ihtiyacına göre yapıldı. Yer değiştirmeleri tek satırlık bir düzenleme.

### Hâlâ departmanı olmayan alanlar

Roster kurulurken çıktı: sitenin bazı yüzeyleri hiçbir departmana ait
değil. `/signals` (sinyal panosu, `signalAccess`/`signalStats`/`SignalsBoard`),
`/copytrade` ve `mt5-ea/`, `/prop-firmalar`, `/ai-asistan`, `/account`
(üyelik, bildirim tercihleri) ve `/pozisyon-hesaplayici`. Bunların bir
kısmı ürünün merkezinde — özellikle sinyal panosu. Yeni bir departman
açmak organizasyon şemasını değiştirmek demek, o yüzden burada yalnızca
tespit olarak duruyor; kararı kurucuya ait.

### Telegram içerik çeşitliliği (2026-07-26 güncellemesi)

Telegram kanalı artık sadece BTC/USD grafiğiyle sınırlı değil — dört farklı
departman, dört farklı içerik türünü kendi ritminde paylaşıyor:

1. **market-update** (Piyasa Analizi) — BTC/USD teknik özeti, günde 2 kez (08:00 ve 18:00 UTC).
2. **market-analysis-share** (Piyasa Analizi) — güncel `/piyasa-analizi` günlük özetini duyurur; her 2 saatte bir kontrol eder ama aynı günü tekrar paylaşmaz (dedup: Postgres'teki `telegram_post` tablosu, Upstash'e ihtiyaç yok).
3. **campaign-digest** (Reklam & Kampanya) — aktif broker kampanyalarını ve cashback oranlarını haftalık özetler (Pazartesi 09:00 UTC).
4. **blog-share** (Haber & Editöryal) — `/blog`'a eklenen en eski duyurulmamış yazıyı duyurur; her 2 saatte bir kontrol eder (market-analysis-share'den 30 dk kaydırılmış), aynı anda birden fazla yazı eklenmişse hepsini tek seferde değil, çalıştırma başına bir tanesini paylaşarak gün içine yayar.

**news-update hâlâ paused:** Vercel production'da `DEEPL_API_KEY` ve
`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` tanımlı değil (bkz.
`vercel env ls production`). Bu iki değişken eklenmeden schedule
açılırsa, route her çalıştığında 500 döner — daha önce tam olarak bu
yüzden kapatılmıştı (commit `d207f0`). Bu iki anahtar Vercel'e
eklendiğinde, `.github/workflows/telegram-cron.yml`'a bir `schedule`
girişi eklemek ve `departments.ts`'te bu departmanın `automation`
alanını `"active"` yapmak yeterli. (`blog-share` bu bloktan bağımsız,
zaten aktif — o route DeepL/Upstash'e değil, elle yazılan
`src/data/blog.ts` girdilerine dayanıyor.)

### Web push bildirimleri (2026-08-05 eklendi)

FXStreet tarzı tarayıcı push bildirimleri, Sosyal Medya & Topluluk
Departmanı'nın (Barış Ongun) sorumluluğunda: `src/lib/push.ts`
(`web-push` + VAPID anahtarları ile gönderim), `public/sw.js` (service
worker), `src/app/api/push/subscribe` ve `/unsubscribe` (abonelik
CRUD'u), `src/components/NotificationOptIn.tsx` (siteye eklenen,
TelegramPopup/BonusPopup'tan farklı olarak köşede beliren, ısrarcı
olmayan izin isteme kartı). Abonelikler `push_subscription` tablosunda
tutulur; `userId` nullable'dır — bildirim izni bir hesap gerektirmez,
tıpkı FXStreet'te olduğu gibi anonim ziyaretçi de abone olabilir.

market-analysis-share, campaign-digest ve blog-share — üçü de Telegram
gönderiminin hemen ardından `sendPushToAll(...)` çağırır (best-effort;
push başarısız olursa Telegram gönderimini etkilemez). Yani "haber,
analiz, reklam" içeriğinin hepsi hem Telegram'a hem push'a aynı anda
gider — ayrı bir push-only cron yok.

**Prod'da çalışması için gereken tek eksik:** Vercel production'da
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
tanımlı değil (yerelde `.env.local`'da mevcut, `npx web-push
generate-vapid-keys` ile üretildi). Bu üç değişken Vercel'e eklenip
yeniden deploy edilmeden web push hiçbir yerde çalışmaz.

## Otomasyon durumları ne anlama gelir

- **Active** — kod bir schedule'a bağlıdır ve insan müdahalesi olmadan
  çalışır (şu an yalnızca Telegram gönderim altyapısının kendisi bu
  durumda; içerik üreten cron'ların hiçbiri değil).
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
