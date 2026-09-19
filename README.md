# VC DEDEKTİFLERİ 2.0 — Oyun Sunucusu

Kurumsal içi ağda (internetsiz) çalışan, sinematik/graphic-novel formatındaki
"VC Dedektifleri 2.0" deneyiminin dijital oyun motoru. Bu sürüm, doğrusal akışı
(`Açılış → Bölüm 1 → Ana Kanıt A → Bölüm 2 → ... → Final Dosyası → Son Gece →
Kapanış`) ve `VC_Dedektifleri_2.0_FINAL_PRODUCTION_EDITION.md` dokümanındaki
7 alanlı mini vaka modelini (Hero Görsel, Olay Anı, Konuşma Balonları, Kanıt
Anı, Karar Sorusu, Doğru Çözüm, Final İçgörüsü) birebir uygular.

## Mimari

| Katman | Teknoloji |
|---|---|
| Frontend | React + Vite (mobil öncelikli, koyu sinematik tema) |
| Backend | Node.js + Express |
| Veritabanı | SQLite (`server/db/game.sqlite3`) |
| Dağıtım | Tek Windows dizüstü bilgisayar, şirket WiFi'ı |

**Önemli mimari fark (1.0'a göre):** Karar Anı soruları artık çoktan seçmeli
değil, **açık uçlu**dur. Takımlar telefondan serbest metin gönderir; facilitator
admin panelindeki **Değerlendirme Kuyruğu**'ndan cevapları okuyup 0-100 arası
puan girer. Tek otomatik puanlanan bölüm, Son Gece'deki "Üç Yolun Sınavı"dır
(sabit doğru cevapları vardır).

## Kurulum (Bir Kez, İnternetli Ortamda)

1. [Node.js LTS](https://nodejs.org) kurun (v18+).
2. Bu klasörü dizüstü bilgisayara kopyalayın.
3. `install.bat`'a çift tıklayın (hem sunucu hem arayüz bağımlılıklarını kurar
   ve arayüzü derler).
4. Doğrulama: `server` klasöründe `npm test` — tüm testler geçmeli
   (`✅ TÜM SMOKE TESTLER GEÇTİ` ve `✅ ADMİN TESTLERİ GEÇTİ`).

## Çalıştırma (Etkinlik Günü, İnternetsiz)

1. Dizüstü bilgisayarı etkinlik WiFi'ına bağlayın.
2. `start.bat`'a çift tıklayın.
3. Konsolda görünen adresleri kullanın:
   - **Admin (projeksiyona yansıtın):** `http://<ip>:3000/admin`
   - **Oyuncu girişi (QR ile taranır):** `http://<ip>:3000/play`

## Admin Paneli Girişi (PIN)

Admin paneli (`/admin`) ve tüm `/api/admin/*` rotaları **PIN** ile korunur.

- **Varsayılan:** `ADMIN_PIN` ortam değişkeni tanımlı değilse kodda tanımlı sabit PIN kullanılır
  (`server/utils/adminAuth.js` → `DEFAULT_PIN`). PIN her açılışta aynıdır.
- **Değiştirmek için:** Render → servis → *Environment* → `ADMIN_PIN` ekleyin (yerelde `set ADMIN_PIN=123456`).
  Ortam değişkeni varsa varsayılanın yerine o kullanılır. Depo herkese açıksa varsayılan PIN kaynak kodda
  görünür; daha güvenli olması için `ADMIN_PIN` tanımlayın veya depoyu "private" yapın.
- PIN'i yanlış girenler dakikada 5 denemeyle sınırlanır; oturum 12 saat geçerlidir.
- Oyuncu ekranı (`/play`) PIN gerektirmez.

**Oturumu Sıfırla** artık "SIFIRLA" yazılmasını ister ve silmeden önce otomatik yedek alır
(`server/db/backups/yedek-<tarih>.json`). Yanlış puan girdiyseniz **Puanlananlar** sekmesinden düzeltebilirsiniz.

## Facilitator İçin Notlar

- **Değerlendirme Kuyruğu** admin panelinde ayrı bir sekmedir; bekleyen cevap
  sayısı sekme başlığında görünür. Oyunun akışını yavaşlatmaz — takımlar puan
  beklemeden bir sonraki adıma geçer, siz arka planda puanlarsınız.
- **Final Parça A**, admin panelinden açık/kapalı yapılabilir (30 dakikalık
  hedefe sıkıştırmak için kapatılması önerilir — bkz. Final Production Edition §6.2).
- Hero görseller `client/public/images/` altındadır. Şu an 5 genel referans
  görseli bölüm bazında dönüşümlü kullanılıyor (bkz. Director's Cut
  değerlendirmesi §3); gerçek sahneye özel görseller hazır olduğunda bu
  klasördeki dosyaları **aynı isimlerle** değiştirmeniz yeterlidir, kod
  değişikliği gerekmez.

## Proje Yapısı

```
vc-app/
├── server/
│   ├── server.js              # API + derlenmiş arayüzü sunar
│   ├── db.js                  # SQLite şeması (6 tablo)
│   ├── smoketest.js           # `npm test` ile çalışan doğrulama
│   ├── admintest.js           # Admin yetki/puanlama/sıfırlama testleri (geçici DB kullanır)
│   ├── data/cases.js          # 3 bölüm + 9 mini vaka + Final + Son Gece verisi
│   ├── utils/
│   │   ├── stages.js          # Doğrusal akış aşama listesi
│   │   ├── scoring.js         # Toplam puan hesaplama (4 kaynaktan)
│   │   ├── adminAuth.js       # Admin PIN girişi + token doğrulama
│   │   ├── parseScore.js      # Facilitator puan doğrulaması
│   │   └── backup.js          # Sıfırlama öncesi JSON yedeği
│   └── routes/
│       ├── teams.js           # Takım oluşturma + aşama ilerletme
│       ├── miniVaka.js        # Olay/Kanıt/Karar içeriği + cevap gönderme
│       ├── anaKanit.js        # Ana Kanıt reveal + facilitator puanı
│       ├── final.js           # Kilit açma + Parça A
│       ├── sonGece.js         # Üç Yolun Sınavı (otomatik puanlı)
│       ├── admin.js           # Genel bakış + Değerlendirme Kuyruğu
│       ├── session.js         # Oyuncuya açık oturum ayarları
│       └── qr.js              # QR kod üretimi
└── client/
    ├── public/images/         # Hero görseller (9 vaka + Son Gece + Kapanış)
    └── src/
        ├── pages/play/        # Her ekran (OlayAni, KanitAni, KararAni, ...)
        ├── pages/AdminDashboard.jsx
        ├── components/        # KanitCard, SpeechBubble, BolumTheme
        ├── data/bolumler.js   # Bölüm renk/başlık referansı (hassas değil)
        └── context/GameContext.jsx  # Doğrusal akış state machine'i
```

## Notlar

- Veritabanı, Node.js'in kendi yerleşik `node:sqlite` modülünü kullanır — hiçbir
  native paket derlemesi (Python/C++ derleyici) gerekmez. `install.bat`'ın
  internet gerektirmesinin tek sebebi `express`/`cors`/`nanoid`/`qrcode` gibi
  sade JavaScript paketlerini indirmektir.
- Puanlama mantığı ve Karar Anı "Doğru Çözüm" referansları sadece cevap
  gönderildikten SONRA istemciye açılır — önceden sızdırılmaz
  (`server/routes/miniVaka.js` → `publicMiniVaka()`).
