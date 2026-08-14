# forexturkiyeplatformu.com — Site İncelemesi ve Not Alma

Tarih: 2026-08-14. Kaynak: forexturkiyeplatformu.com (Ana sayfa, VIP, Günlük Raporlar, Araçlar sayfaları gezildi).

## Genel yapı

Türkçe, VIP-sinyal-topluluğu odaklı bir platform. Kendini "biz analiz ediyoruz, birlikte kazanıyoruz" sloganıyla konumlandırıyor — FXPARTNER'dan farklı olarak kendi VIP sinyal grubunu satıyor (ücretsiz üyelik + broker üzerinden komisyon modeli).

## ✅ Uyguladığımız / uyarladığımız

1. **Canlı Piyasalar kartları → `/signals` sayfasına eklendi.** Ana sayfalarındaki 6 enstrümanlık (Altın, Gümüş, Nasdaq, DAX, Bitcoin, Brent) canlı fiyat kartlarını (fiyat + günlük değişim + yön rozeti + sparkline + "Analizi Gör" CTA) kendi tarzımızda uyguladım: [`LiveMarketsGrid.tsx`](../src/components/LiveMarketsGrid.tsx), sinyal listesinin hemen üstünde. Bizim zaten gerçek, ücretsiz API'lerden beslenen fiyat verimiz vardı ([`src/lib/rates.ts`](../src/lib/rates.ts) — Frankfurter FX, gold-api.com, CoinGecko), sadece yeni bir kart görünümü olarak sunduk. Sparkline'lar mevcut sinyal kartlarımızdaki gibi **dekoratif** (gerçek intraday veri değil, bu netlik korunuyor).

## 📝 Değerlendirilmeye değer, henüz uygulanmadı

2. **Günlük/Aylık şeffaflık raporu.** `gunluk-raporlar.php` sayfasında yıl/ay/gün seçiciyle geçmişe dönük işlem özetleri (İşlem sayısı, Kazanç/Kayıp, Başarı %, Toplam $/₺) ve altında **gerçek MT5 terminal ekran görüntüsü tarzında** tekil işlem kartları (ticket no, açılış→kapanış fiyatı, delta/pips%, SL/TP, swap, komisyon) var — kayıpları da açıkça gösteriyorlar (14 Ağustos günü -$803, %20 başarı). Güçlü bir şeffaflık/güven sinyali. Bizim `/signals` sayfamızdaki "Toplam Fiyat Farkı" bloğu benzer bir işi yapıyor ama onlarınki gibi ay/gün bazında gezilebilir bir arşiv değil. **Öneri:** ileride bir "Geçmiş İşlem Arşivi" sayfası (yıl/ay filtreli) eklenebilir.
3. **Araçlar sayfası (7 hesaplayıcı).** Kâr/Zarar hesaplama, sermayeye göre ideal lot hesaplama, Risk/Ödül oranı, teminat hesaplama, ortalama maliyet/başabaş, canlı S/R seviyeleri, ATR volatilite hesaplayıcı — üstüne "Yapay Zeka Destekli Analiz" (S/R + ATR korelasyonu) katmışlar. Bizde şu an böyle bir araç seti yok. **Öneri:** düşük efor/yüksek pratik değerli bir sonraki adım olabilir — özellikle Kâr/Zarar ve Lot hesaplayıcı en çok aranan iki araç.
4. **Saatlik otomatik teknik analiz makaleleri.** Her enstrüman için EMA20/50, Bollinger Bantları, RSI, ATR, Hacim Profili (POC/VAH/VAL) içeren, saatte bir güncellenen uzun-form analiz metinleri var. Bizim `/teknik-analiz` sayfamızla aynı kategoride ama onlar daha fazla gösterge kullanıyor (biz pivot/S-R odaklıyken onlar EMA+Bollinger+RSI+ATR+Hacim Profili de ekliyor). **Öneri:** `/teknik-analiz`'i bu göstergelerle zenginleştirmek ayrı bir iyileştirme konusu olabilir.
5. **Ücretsiz VIP modeli.** Para almadan VIP grup, karşılığında broker üzerinden IB komisyonu alan bir model kullanıyorlar (bizim cashback/partner sistemimize benzer ama VIP sinyal grubu + kâr/zarar botu + lot rehberi + swapsız hesap gibi somut "üye ayrıcalıkları" listesi var). Bizim `fxpartner-vip` projesiyle örtüşen bir alan — ayrıca not düşüyorum, ileride VIP özellik listesini karşılaştırmak faydalı olabilir.

## ⚠️ Dikkat

Sitenin "%85+ Sinyal Başarısı" gibi iddiaları var; günlük raporlarda gördüğümüz gerçek başarı oranları (%56 aylık, %20 bir günde) bu iddiayla tam örtüşmüyor gibi duruyor — muhtemelen "%85+" farklı bir zaman aralığı/ürün seçimi. Bizim sitede böyle genel/iddialı bir yüzde asla kullanmıyoruz, sadece gerçek win-rate'i gösteriyoruz — bu ayrım korunmalı.
