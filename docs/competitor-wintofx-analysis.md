# WintoFX (wintofx.com) — Rakip İncelemesi ve İş Planı

İnceleme tarihi: 2026-08-13. Kaynak: wintofx.com/tr (Ana sayfa, Sıralamalar, Düzenleyiciler, broker detay sayfası — AvaTrade, Topluluk, Resmi Açıklama sayfaları gezildi).

## WintoFX ne yapıyor

Kendini "Global Broker Regulation Inquiry Platform" olarak konumlandırıyor — bir broker karşılaştırma sitesinden çok, **düzenleyici/lisans doğrulama + kullanıcı şikayet platformu**. Öne çıkan yapı taşları:

1. **Sıralamalar** — Marka Sıralaması / Popülerlik Sıralaması / **Dolandırıcılık Uyarıları** olmak üzere 3 ayrı liste, ülke/bölge filtresiyle.
2. **Broker detay sayfası** çok katmanlı:
   - 4 eksenli skor: Regülasyon, Şeffaflık, Teknoloji, Memnuniyet (bizim 4 eksenimiz: Regülasyon, Maliyet, Platform, Çekim — farklı ama karşılaştırılabilir bir yapı)
   - Risk etiketi (Düşük/Orta/Yüksek Risk rozeti)
   - **Lisans listesi + lisans numarası + ülke + "AAA" derecelendirme rozeti** her regülatör için ayrı ayrı
   - **MT4/MT5 sunucu doğrulama bloğu**: kaç MT4/MT5 sunucusu var, ortalama yürütme hızı (ms) — brokerin gerçek altyapısını doğrulayan somut bir güven sinyali
   - Resmi mobil uygulama listesi + mağaza indirme sayıları (4.6M, 13K gibi)
   - Hesap/işlem koşulları, para yatırma-çekme, destek dilleri/saatleri — bizdekiyle benzer
   - Yıldızlı kullanıcı puanlama sistemi + "Yorum Yaz" + "Hatalı Bilgi Bildir" butonu
3. **Düzenleyiciler ansiklopedisi** (`/regulators`) — her regülatör (ASIC, SFC, CMA, ...) için kuruluş yılı, kapsadığı varlık sınıfları, açıklama metni, AAA rozeti. Aranabilir, filtrelenebilir. Ciddi bir SEO/içerik varlığı.
4. **Topluluk / Şikayet Panosu** (`/topluluk`) — Trustpilot tarzı, 124+ kullanıcı şikayeti, filtrelenebilir (tarih, puan, durum: çözüldü/çözülmedi/cevaplandı/cevaplanmadı), sıralanabilir. Şikayetler spesifik broker adları ve somut mağduriyet anlatımlarıyla ("X şirketi param bloke etti" vb.) — çok güçlü uzun kuyruk SEO trafiği ve güven sinyali üretiyor.
5. **Geniş canlı ticker** — forex + kripto (BTC, ETH, SOL, DOGE, PEPE dahil ~45 enstrüman), bizim ticker'dan kapsam olarak daha geniş.
6. **WintoExpo / WintoStore** — ayrı alt markalar (etkinlik + "mağaza"), ekosistem genişletme örneği.
7. **"Resmi Açıklama" sayfası** — sitenin "yatırım toplama/dolandırıcılık" iddialarına karşı kamuya açık savunma metni yayınlamış durumda.

## Giriş Yap / Kaydol incelemesi

WintoFX'te hesap sistemi **iki ayrı taraf** için kurgulanmış — hem header'daki "Giriş Yap" hem "Kaydol" tıklandığında önce bir **hesap türü seçim ekranı** çıkıyor:

- **Kullanıcılar için** — "Yorum yazmak ve profilinizi yönetmek için kullanıcı hesabınızı oluşturun." Bu, Topluluk/şikayet panosuna yorum bırakabilmenin ön koşulu.
- **İşletmeler için** — "İşletme hesabınızı yapılandırın." Brokerlerin kendi profillerini (muhtemelen "Hatalı Bilgi Bildir" itirazlarına cevap verme, iletişim bilgisi güncelleme gibi) yönetebildiği ayrı bir portal.

**Kayıt formu** (`/tr/register`, kullanıcı tarafı):
- Sade bir ilk adım: E-posta, Şifre (min. 8 karakter), Şifre onayı, Kullanım Şartları onay kutusu, reCAPTCHA
- Üstte **"Kayıt İlerlemesi: 0/4"** göstergesi var — yani email/şifre sadece 1. adım, muhtemelen sonrasında e-posta doğrulama + profil bilgisi (isim, ülke) + tercih adımları geliyor (formu tamamlamadım, gerçek hesap oluşturmadım).

**Giriş formu** (`/tr/login`):
- E-posta veya kullanıcı adı, Şifre, "Beni Hatırla", reCAPTCHA
- "Şifrenizi mi unuttunuz?" linki (`/password/reset`)
- **Google ile tek tıkla giriş** (OAuth) — şifre yönetimi sürtünmesini azaltan standart bir kolaylık

**Ayrıca:** Ana sayfada "Hak Koruma Merkezi" adında bir güven widget'ı var — **"$855,504 Çözülen Birikmiş Tutar"** ve **"2,432 Çözülen İnsan Sayısı"** rakamlarını öne çıkarıyor. Bu, hesap sistemi + şikayet panosunun birlikte ürettiği somut bir sosyal kanıt: kullanıcılar sadece yorum yazmıyor, platform "senin adına çözdüğümüz X tutar" diye ölçülebilir bir sonuç gösteriyor.

**FXPARTNER için değerlendirme:** Bizim zaten ayrı bir **fxpartner-vip** uygulaması var (Next.js, Phase 1+2 tamamlanmış, Neon/Stripe/Resend bekliyor — bkz. memory) ve bu VIP app zaten "kullanıcı hesabı" ihtiyacını üstlenecek doğal yer. WintoFX'teki gibi ana sitede ayrı bir kullanıcı/işletme hesap sistemi kurmak yerine, **yorum/şikayet sistemi gibi hesap gerektiren özellikleri VIP app'e bağlamak** (ya da VIP app'in auth altyapısını ana site için de paylaşmak) daha az tekrar iş ve daha tutarlı bir mimari olur. "Hak Koruma Merkezi" tarzı somut sosyal kanıt fikri (çözülen şikayet sayısı/tutarı) ise düşük efor + yüksek güven getirisi olduğu için öncelik listesine eklemeye değer.

## ⚠️ Önemli uyarı — kopyalamayın

WintoFX'in sıraladığı brokerlerin çoğu **"Lisanssız"** (W2 Forex, Fourpro, Gann Markets, Lotas Capital, Global Exp, Avax Markets) veya offshore/zayıf lisanslı (Komorlar, Karadağ) — yani düşük kaliteli, riskli aracı kurumlar. Site kendisi kamuoyunda "yatırım toplama/dolandırıcılık" suçlamalarına karşı resmi açıklama yayınlamak zorunda kalmış. Topluluk sayfasındaki şikayetlerin çoğu da tam olarak bu tür brokerlerle ilgili para çekememe/dolandırılma vakaları.

**Sonuç:** WintoFX'in görsel/yapısal zenginliğini örnek alabiliriz, ama iş modelini (lisanssız/offshore brokerleri parlak sayfalarla "9.20 skor" gibi güven veren rakamlarla listelemek) asla kopyalamamalıyız. FXPARTNER'ın zaten sadece regüleli/güvenilir brokerlerle çalışması ([project_fxpartner_departments.md] hatırlanan compliance-first yaklaşımıyla uyumlu) rekabet avantajımız — bunu öne çıkarmalıyız.

---

## İş Planı — Önceliklendirilmiş Aksiyon Listesi

### Yüksek öncelik (belirgin fark yaratır, orta efor)

1. **Broker sayfalarına lisans numarası + regülatör rozeti ekle.** Şu an `regulators: string[]` sadece isim listesi ([brokers.ts](../src/data/brokers.ts)). Her regülatör için lisans numarası, ülke ve doğrulama linki eklemek somut güven sinyali verir ve WintoFX'in en güçlü özelliğini karşılar.
2. **MT4/MT5 altyapı doğrulama bloğu.** Broker sayfasına "Tam Lisanslı MT4/MT5", sunucu sayısı, ortalama yürütme hızı gibi teknik doğrulama kartı eklemek — bizim zaten MT5 EA altyapımız olduğu için (bkz. mt5-ea/) bu veriyi otantik şekilde toplayabiliriz, taklit değil gerçek veri sunabiliriz.
3. **Kullanıcı yorum/şikayet sistemi.** Şu an broker sayfalarında editoryal inceleme var ama kullanıcı yorumu/puanlama yok. Trustpilot tarzı bir "Yorum Yaz" + yıldız puanlama + moderasyon akışı, hem SEO hem güven açısından büyük kazanç. Riskli ama iyi yönetilirse en güçlü fark yaratıcı özellik olabilir.
4. **Risk seviyesi rozeti** (Düşük/Orta/Yüksek Risk) broker kartlarına — mevcut 4 eksenli skorumuzdan otomatik türetilebilir, düşük efor yüksek etki.

### Orta öncelik (SEO/içerik yatırımı)

5. **Düzenleyici ansiklopedisi sayfası** (`/duzenleyiciler`) — ASIC, CySEC, FCA, DFSA vb. için ayrı, aranabilir sayfalar. Zaten broker verilerinde bu regülatörler geçiyor; bağımsız sayfalara çıkarmak hem SEO hem "regülasyon sorgulama" konumlandırmasını güçlendirir.
6. **Ticker enstrüman kapsamını genişlet** — şu an major forex + XAU ağırlıklı; kripto çiftleri (BTC, ETH, SOL vb.) eklemek kullanıcı ilgisini artırabilir (sinyallerimizde zaten BTCUSD/ETHUSD işlem görüyor).
7. **"Sıralamalar" sayfasını 3'e böl** — Marka/Popülerlik/(bizim versiyonumuzda "Dolandırıcılık Uyarıları" yerine) "Uyarı Listesi — Kaçının" tarzı bir liste, sadece doğrulanmış kaynaklardan (SPK, düzenleyici uyarı listeleri) beslenerek — hukuki risk taşımadan güven inşa eder.

### Düşük öncelik / gözlem

8. **Mobil uygulama indirme istatistikleri** broker profiline eklenebilir (App Store/Play Store API ile), küçük ama inandırıcı bir detay.
9. **Ayrı marka genişlemesi (Expo/Store benzeri)** — şimdilik gözlemde kalsın, FXPARTNER VIP zaten bu yönde bir adım.
10. **"Hatalı Bilgi Bildir" butonu** — broker sayfalarına düşük efor, kullanıcı güveni + veri kalitesi için ucuz bir kazanım.
11. **"Çözülen şikayet/sonuç" güven widget'ı** — WintoFX'in "Hak Koruma Merkezi" ($855K çözülen tutar, 2.432 kişi) tarzı somut bir sosyal kanıt sayacı; madde 3'teki yorum/şikayet sistemi hayata geçerse doğal bir uzantısı olur.
12. **Hesap sistemi kararı** — kullanıcı yorum/şikayet özelliği (madde 3) hesap gerektirir. Ana sitede sıfırdan auth kurmak yerine mevcut **fxpartner-vip** app'inin auth altyapısını değerlendirmek (paylaşımlı login ya da entegrasyon) — mimari kararı gerektirir, önce tasarlanmalı.

---

## Not

Bu belge bir envanter/öneri listesidir, hiçbir kod değişikliği içermez. Hangi maddelerle başlamak istediğini söylersen (örn. "önce lisans numarası + regülatör rozetini ekleyelim") o maddeyi uygulamaya geçebilirim.
