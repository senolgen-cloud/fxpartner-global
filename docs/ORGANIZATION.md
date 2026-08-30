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
| Sinyal & Copytrade | Onur Bektaş — Sinyal Operasyonları Direktörü | MT5 köprüsü, `/signals` panosu, `/copytrade`, pozisyon hesaplayıcı | **Active** (olay tetiklemeli) |
| Üyelik & Hesap | Selin Arıkan — Üye Deneyimi Direktörü | Kayıt/giriş ve kimlik doğrulama, erişim kademeleri, üye paneli, bildirim kutusu | Manual |
| Yapay Zeka Asistanı | Cem Yalçın — Yapay Zeka Ürün Direktörü | `/ai-asistan`, asistan API'si, kademe limitleri, soru kaydı | **Active** (istek anında, denetimsiz) |
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
| Sinyal & Copytrade | Sezgin Ünal | Sinyal Operasyonu Sorumlusu | MT5 köprüsünün sağlığı, pano doğruluğu, copytrade başvuruları |
| Yapay Zeka Asistanı | Taner Turan | Asistan Kalite Sorumlusu | Soru kaydını okumak, istem ve red kuralları, kademe limitleri |
| Piyasa Analizi | Mehmet Ali Erdoğan | Kıdemli Teknik Analist | Günlük teknik analiz, `/teknik-analiz` enstrüman kapsamı |
| Piyasa Analizi | Tuğçe Süslü | Makro Ekonomist | Ekonomik takvim yorumu, veri günleri |
| Haber & Editöryal | Şebnem Köser | Akademi Editörü | Akademi ders serisi, konu kuyruğu, görsel anlatım metinleri |
| Haber & Editöryal | Yunus Emre Coşkun | Haber Editörü | Haber filtreleme ve çeviri kalitesi, `/haber-bulteni` |
| Broker İstihbaratı | Dilek Arabacıoğlu | Regülasyon Araştırmacısı | Lisans doğrulama, `/broker-lookup`, risk uyarı listesi |
| Ortaklık & Cashback | Erden Tarlan | Ortaklık Yöneticisi | IB/rev-share takibi, cashback oranı doğrulama, `/partners` |
| Reklam & Kampanya | Gülşah Avcı | Kampanya Küratörü | Kampanya şartlarının kaynağından doğrulanması, `/campaigns` |
| Sosyal Medya & Topluluk | Esmanur Bulut | Sosyal Medya Uzmanı | Instagram yayın planı, görsel içerik |
| Uyumluluk & Marka | Nilüfer Hatun | Uyumluluk Uzmanı | Yasal metinler, şikayet süreci, otomasyon 'active' onayı |
| Uyumluluk & Marka | Akif Tuncel | Veri Koruma Sorumlusu | Çerez onayı ve consent kayıtları, `/privacy` |

**Kayda geçmeyen:** kimsenin özgeçmişi, önceki işvereni ya da sertifikası.
Roster kurulurken bu bilgiler verilmedi; gerçek bir kişi adına kariyer
uydurmak, alanı boş bırakmaktan kötüdür. Kendileri ilettiğinde eklenir.

**İsimler teyitli.** Roster el yazısı bir listeden kuruldu ve dört okuma
şüpheliydi; biri (bir soyadı) tahmin edilmek yerine boş bırakılmıştı.
Dördü de 28.08.2026'da kurucuya doğrulatıldı: Tuğçe Süslü, Şebnem Köser,
Erden Tarlan, Akif Tuncel.

**Görev dağılımı bir öneridir.** Kimin hangi alanda uzman olduğu
bilinmediği için atamalar kişilerin geçmişine değil, departmanların
ihtiyacına göre yapıldı. Yer değiştirmeleri tek satırlık bir düzenleme.

### Sinyal & Copytrade Departmanı (28.08.2026'da açıldı)

Sinyal panosu sitenin merkezindeki ürün ve 28.08.2026'ya kadar hiçbir
departmana ait değildi — yazılmamış olmasından başka bir sebebi yoktu.
Departman MT5 köprüsünü (`api/trade-signal`, `trade-update`,
`trade-result`, `pending-order`, `signals`, `live-prices` ve `mt5-ea/`),
panoyu ve erişim kademelerini, copytrade akışını ve pozisyon hesaplayıcıyı
sahipleniyor.

Otomasyonu takvimle değil **olayla** çalışıyor: EA bir işlem açtığında uç
nokta tetikleniyor, cron beklemiyor. Yukarıdaki üç durumun (`active` /
`paused` / `manual`) bunun için bir karşılığı yok; `active` en yakını.

**Panoyu Telegram'a duyurmak bu departmanda değil.** `active-signals-digest`
ve `signalAlertPace.ts` Sosyal Medya & Topluluk'ta kalıyor: o departmanın
tanımı zaten "diğer departmanların içeriğini tek bir marka sesiyle
yayınlamak" — yayın kanalı onların, içerik sinyal departmanının.

Sezgin Ünal buraya taşındı. Sosyal Medya & Topluluk'a "Topluluk ve Sinyal
Operasyonu" unvanıyla konmuştu, çünkü sinyalin departmanı yoktu.
Departmanın sahiplendiği yüzey alanına göre tek kişi az; bu bir tespit,
kadro kararı kurucunun.

### Üyelik & Hesap Departmanı (28.08.2026'da açıldı)

`/account` sitedeki en büyük sahipsiz alandı: kayıt, giriş, kimlik
doğrulama, erişim kademeleri, üye paneli ve bildirim kutusu. Departman
`src/auth.ts`'ten `memberNotifications.ts`'e kadar bu zinciri sahipleniyor.

**`tierAccess.ts` ve `vip.ts` sinyal departmanından buraya taşındı.** Oraya
"üyelik departmanı yok, bunları kullanan tek yüzey pano" notuyla ödünç
konmuşlardı ve not, departman açılırsa taşınacaklarını söylüyordu. Pano
onları kullanmaya devam ediyor — kullanmak sahiplenmek değil.

**Bildirim sınırı:** gönderim altyapısı (`push.ts`, `sw.js`,
`api/push/*`, `NotificationOptIn`) Sosyal Medya & Topluluk'ta kalıyor,
çünkü orası yayın kanalı. Üyenin zilde ne gördüğü, neyin okunmuş sayıldığı
ve tercihleri (`memberNotifications.ts`, `api/notifications`, `HeaderBell`,
`NotificationProvider`) burada.

### Yapay Zeka Asistanı Departmanı (28.08.2026'da açıldı)

Asistan sorulara sitenin kendi verisiyle cevap veriyor (canlı kurlar,
broker kataloğu) ve departman ne söylediğinden, neyi söylemeyi
reddettiğinden ve her cevabın maliyetinden sorumlu. `/ai-asistan`,
asistan API'si, `AiMarketAssistant` ve `/admin/ai-sorulari` onun.

`/admin/ai-sorulari` küçük görünür ama ürünün denetim yüzeyi: sorulan her
soru `ai_assistant_log`'a yazılıyor ve asistanın gerçekte ne cevapladığını
görmenin tek yolu o sayfa.

**Otomasyonu `active`.** Takvimli değil — istek anında çalışıyor — ama bir
insan araya girmeden markanın adına konuşuyor. Uyumluluk & Marka'nın
"active olan her şey benim onayımdan geçer" kuralı bu yüzden buraya da
uygulanmalı. (Üyelik & Hesap `manual`: orada da istek anında çalışan kod
var ama hiçbiri markanın adına cümle kurmuyor.)

**Sahiplenmediği şey: model çağıran her modül.** `educationPost.ts`,
`bulletin.ts` ve `translateContent.ts` da Gemini'ye gidiyor; ürettikleri
şey içerik ve içerik onu yazan departmanın. Bu departman asistan ürününün
sahibi, sitenin yapay zeka kullanımının değil. Üçü de Haber & Editöryal'da.

**İnsan desteği de değil.** `LiveSupportWidget` (WhatsApp/Telegram) Sosyal
Medya & Topluluk'ta: biri modelin cevapladığı soru, diğeri bir insana
gidiyor.

**Model adı tek yerde: `src/lib/gemini.ts`.** Altı dosyada ayrı ayrı
yazılıydı — `educationPost`, `bulletin`, `translateContent`, asistan
route'u ve iki script — ve her biri aynı istek URL'ini kendi kopyasından
kuruyordu. Yükseltme altı düzenleme demekti ve biri atlanırsa yakalanması
en zor biçimde bozuluyordu: hiçbir şey kırılmıyor, hiçbir uyarı çıkmıyor,
sadece o yüzey eski modeli çağırmaya devam ediyor.

Scriptler `.mjs` ve TypeScript modülünü import edemiyor, o yüzden
`scripts/lib/gemini.mjs` değeri **kopyalamıyor, `gemini.ts`'ten okuyor** —
iki yer bir yer değildir ve unutulan hep ikincisidir.

`scripts/check-gemini-model.mjs` ikisini birden koruyor: modelin
`gemini.ts` dışında hiçbir dosyada adının geçmemesi, ve scriptlerin
okuyucusunun hâlâ çalışması. İkinci kural birleştirmenin kendi yarattığı
kırılganlık için: okuyucu `gemini.ts`'in şekline bağlı ve bozulursa aksi
hâlde ancak bir sonraki çeviri çalıştırmasında ortaya çıkardı. İki dal da
kırılarak doğrulandı.

Sabit bu departmanın — en çok çağıran taraf olduğu için değil, sitenin
hangi modelle konuştuğu tek bir karar olduğu ve tek bir sahibi olması
gerektiği için.

### Kayıt defterinin kendisi denetleniyor

`scripts/check-department-owns.mjs` üç şeyi kontrol ediyor:

1. **Sahiplenilen her yol gerçekten var mı.** Bu denetim yazılır yazılmaz 13
   bayat yol buldu — `src/app/blog`, `src/app/campaigns`, `src/app/terms` ve
   arkadaşları, site çok dilli yapıya geçtiğinde `src/app/[locale]/` altına
   taşınmış ve kayıt defterinde eski hâlleriyle kalmışlardı.
2. **Hiçbir yol iki departmana ait değil.** Bu dokümanın kendi iddiası, ve
   iki sahip sıfır sahiple aynı arıza: bir şey bozulduğunda ya kimsenin adı
   yoktur ya da ikisi de diğerinin sandığını düşünür.
3. **Her rotanın bir sahibi var.** Asıl çürüyecek yer burası: yeni bir sayfa
   yayına girer, kimse buraya eklemez, ve kayıt defteri sessizce siteyi
   anlatmayı bırakır.

Üçünün de düştüğü kasten doğrulandı: bozuk yol, çift sahip, sahipsiz rota.

Bugün: **10 departman, 151 yol** — tamamı yerinde, her biri tek sahipli, ve
`src/app/[locale]/` altındaki her rota kapsanıyor.

### Kasıtlı olarak sahipsiz: platform katmanı

Kütüphaneler rota gibi denetlenmiyor, çünkü on altı modül gerçekten hiçbir
departmanın konusu değil ama her departmanın yolu. Bunlara sahip atamak
sorumluluk değil, dosyalama olurdu:

- **i18n** — `chrome.ts`, `i18n.ts`, `dictionary.ts`, `localizeContent.ts`,
  `serverLocale.ts`, `country.ts`, `countryLanguages.ts`
- **SEO / paylaşım kartları** — `schema.ts`, `ogAssets.ts`, `ogIcons.tsx`
- **operasyon** — `cron-wrapper.ts`, `notify.ts` (cron hatası uyarıları)
- **diğer** — `navLinks.ts`, `visitor.ts`, `usePrefersReducedMotion.ts` ve
  kayıt defterinin kendisi, `departments.ts`

### Yapay Zeka Asistanı'na kadro (30.08.2026)

Taner Turan Broker İstihbaratı'ndan buraya taşındı. Bu departmanın günlük
işi modelin ne cevapladığını okuyup yanlışı yakalamak, ve asistan sorulara
canlı kurlarla broker kataloğundan cevap veriyor — kataloğu bilen biri,
yanlış bir cevabı kayıtta görebilecek olan kişi.

Kimin taşınacağı tek gerçek karardı. İki kişilik dört departman vardı:

- **Uyumluluk & Marka** elendi. Asistanın `active` olmasının sebebi zaten
  onların denetimi; denetleyeni denetlenenin içine koymak olurdu.
- Kalan üçü de `active`, ama **ne ürettikleri** aynı değil. Haber &
  Editöryal ile Piyasa Analizi'nin otomasyonu günde iki kez **yeni metin**
  yazıyor ve editörsüz kalamaz. Broker İstihbaratı'nınki
  (`broker-review-share`) mevcut inceleme sayfaları arasında dönüyor — yeni
  içerik üretmiyor, dolayısıyla bir kişiyle de dönmeye devam eder.

Broker İstihbaratı'nın çekirdeği (lisans doğrulama, `/broker-lookup`, risk
uyarı listesi) Dilek Arabacıoğlu'nda kalıyor; taşınan, kataloğun
karşılaştırma tarafıydı ve asistanın en çok soru aldığı alan da o.

### Kadrosu olmayan tek departman

Üyelik & Hesap'ın kadrosu yok. Sırf roster dolu görünsün diye birini
kaydırmak, görünür bir boşluğu yanlış bir atamayla takas etmek olurdu;
boşluk kayıtlı duruyor.
