# Pipcy — tasarım ve sayfa kurgusu incelemesi

İnceleme tarihi: 25 Eylül 2026. Kaynak: pipcy.com ana sayfa (metin dökümü + sahibinin gönderdiği
iki ekran görüntüsü). Pipcy bir prop firma; bizim rakibimiz değil ama sayfa kurgusu, brokerları
sunma biçimimize doğrudan uyarlanabilir. Aşağıdaki rakamlar onların sitesinde yazdığı haliyle
aktarılmıştır, doğrulanmamıştır.

---

## 1. Sayfanın iskeleti (yukarıdan aşağı)

1. Üstte ince duyuru şeridi: indirim + kupon kodu + "teklifi al" bağlantısı.
2. Hero: tek cümlelik iddia, iki buton (biri ücretsiz deneme), altında **istatistik şeridi** —
   1.264+ aktif trader, 5,3 M$+ toplam ödül, 47 ülke, %100'e kadar pay.
3. "AS FEATURED IN" basın logoları.
4. Ücretsiz akademi bloğu: 18 kurs, 130+ ders, 10 e-kitap, 290+ terim, 5 hesaplayıcı. Her kalem
   sayısıyla birlikte veriliyor; kayan ders listesi var.
5. Avantaj kartları (yüksek pay, düşük maliyet) — içinde canlı grafik maketi.
6. **Program kartları:** hesap büyüklüğü seçici ($2,5K → $100K), üstü çizili fiyat + indirimli
   fiyat, ve her kartta aynı sırayla özellik satırları: max zarar, kâr hedefi, min işlem günü,
   kâr payı, fonlanan hesap, ödeme süresi, ortalama ilk ödeme, günlük drawdown, haber ticareti.
   Bir kartta "BEST VALUE" rozeti.
7. Geri sayım + kupon kodu ("ENDS IN 4d 02h 45m", kod: DU50).
8. MT5 bloğu: mobil / Mac / Windows indirme kartları.
9. "3 Simple Steps": numaralı üç adım.
10. Sosyal kanıt: yorumlar + **ödeme sertifikaları karuseli** (isim, ülke bayrağı, tutar, mühür).
11. **Rakip karşılaştırma tablosu:** satırlar özellik, sütunlar Pipcy / FTMO / Funding Pips /
    The5ers. Altında tek cümlelik özet: "More freedom. Lower cost. Faster growth."
12. Topluluk kartları: YouTube, Discord, Telegram.
13. Blog kartları: kategori etiketi, tarih, başlık, yazar.
14. Sağ kenardan taşan, yavaşça dönen kavisli "READY TO TRADE" yazısı.

Görsel dil: neredeyse siyah zemin, tek bir yeşil vurgu, cam/parlama efektleri, iri başlık tipografisi,
bol boşluk, kartlarda ince kenarlık ve hafif iç parlama.

## 2. Bizim broker sayfalarımıza doğrudan uyarlanabilecekler

Öncelik sırasına göre:

**1) Broker kartlarına sabit özellik satırları.** Pipcy'nin plan kartlarındaki mantık: her kartta
aynı sırada aynı satırlar. Bizde karşılığı: minimum yatırım, tipik spread, kaldıraç, regülasyon,
para çekme süresi, nakit iade oranı. Aynı sıra, karşılaştırmayı göz seviyesinde mümkün kılıyor.
Bugün `RankedBrokerCard` daha çok puan ve rozet gösteriyor; sayılar kartın içinde değil.

**2) Hesap türü seçici.** Onlarda hesap büyüklüğü ($2,5K/$5K/$10K…), bizde hesap türü
(Standard / ECN / Cent / Zero). Seçim değişince spread, komisyon ve nakit iade satırı güncellenir.
Bu bilgi elimizde zaten var; şu an tek bir satırda özetleniyor.

**3) Broker karşılaştırma tablosu.** ~~brokerlar için yok~~ — **DÜZELTME (25.09.2026):** var.
`ComparisonTable` bileşeni `/brokerlar`, ana sayfa ve `/prop-firmalar` sayfalarında zaten
çalışıyor; ilk notta gözden kaçtı. Eksik olan sütunlar aynı gün eklendi: **para çekme** (anket) ve
**nakit iade** (yalnızca teyitli oran). Kriter sayısı 6'dan 8'e çıktı ve ana sayfadaki
"karşılaştırma kriteri" sayacı bu listeden beslendiği için kendiliğinden güncellendi.

**4) Kampanya geri sayımı.** Onlarda sahte aciliyet riski taşıyan bir sayaç var; bizde **gerçek
tarihli** bir kampanya duruyor: XM Sınırsız Nakit İadesi 20 Ekim'de bitiyor. Bitiş tarihi olan
kampanyalarda geri sayım dürüst bir bilgidir — tarih veriden gelir, süre dolunca kampanya listeden
düşer. Tarihi olmayan kampanyada sayaç koymayalım.

**5) İstatistik şeridi.** Onlarınki 1.264 trader / 5,3 M$ ödül. Bizde doğrulanabilir karşılıkları
var: ödenen nakit iadesi toplamı (17.369 $), yayınlanan kapanmış sinyal sayısı, takip edilen gerçek
MT5 hesabı, broker sayısı. Uydurma sayı koymadan aynı etkiyi verir.

**6) Ödeme sertifikaları karuseli.** Onlarda isim + ülke + tutar. Bizdeki dürüst karşılığı, nakit
iadesi ödemeleri ve kapanan sinyal sonuçları. Yalnızca gerçekten ödenmiş tutarlarla ve isim
yerine baş harf/rumuzla yapılmalı; kişisel veri yayınlamadan.

**7) Kavisli dönen yazı.** Bugün eklendi (`ArcText`), /paketler kapanış çağrısında.

## 3. Kopyalanmaması gerekenler

- **Sahte aciliyet.** Her sayfa yüklemesinde sıfırlanan geri sayım ve "limited time" şeridi, bitiş
  tarihi gerçek değilse okuru bir kez kandırır, ikinci kez kaybettirir.
- **Doğrulanamayan sosyal kanıt.** "1.264+ aktif trader" gibi rakamların kaynağı yok. Bizim
  sitedeki kural bunun tersi: her rakam veriden gelir ve nereden geldiği yazılır.
- **"AS FEATURED IN" logoları.** Gerçek bir yayın ilişkisi yoksa konulmaz.
- **Rakip karşılaştırmasında seçici satır.** Onların tablosu yalnızca kendilerinin kazandığı
  satırları içeriyor. Bizim broker tablomuz, partnerimiz olan brokerın zayıf olduğu satırı da
  göstermeli; zaten inceleme sayfalarımızın tonu bu.

## 4. Önerilen sıra

1. Broker kartlarına özellik satırları (en görünür kazanç, veri hazır).
2. Broker karşılaştırma tablosu (prop firma tablosunun kardeşi).
3. Hesap türü seçici.
4. Kampanya geri sayımı — yalnızca bitiş tarihi olan kampanyalarda (bugün: XM, 20 Ekim).
5. İstatistik şeridi (yalnızca doğrulanabilir dört sayı).
6. Ödeme/sonuç karuseli — kişisel veri kuralları netleştikten sonra.
