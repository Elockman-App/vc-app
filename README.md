# VC DEDEKTİFLERİ 2.0 — Oyun Sunucusu

Şirket içi etik ve değerler oyunu. Takımlar telefondan oynar: 9 kısa vaka (olay, kanıt, karar sorusu),
3 bölüm, 3 kilitli not parçası, Final Dosyası ve Son Gece. Oyun **Türkçe ve İngilizce** oynanabilir.

Canlı adres: https://vc-dedektifleri.onrender.com (oyuncular `/play`, yönetici `/admin`)

## Nasıl çalışır?

| Katman | Teknoloji |
|---|---|
| Arayüz | React + Vite (telefon öncelikli) |
| Sunucu | Node.js + Express |
| Veritabanı | SQLite (Node'un yerleşik `node:sqlite` modülü) |
| Yayın | Render (ücretsiz plan) |

Akış: Açılış → Bölüm 1 → Ana Kanıt A → Bölüm 2 → Ana Kanıt B → Bölüm 3 → Ana Kanıt C → Final Dosyası → Son Gece → Kapanış.

Karar soruları açık uçludur. Takımlar serbest metin yazar, oyun yöneticisi **Değerlendirme Kuyruğu**'ndan
0-100 arası puan verir. Otomatik puanlanan tek bölüm Son Gece'deki "Üç Yolun Sınavı"dır.
İlk gönderilen cevap kalıcıdır, sonradan değiştirilemez.

## Önemli: Render ücretsiz planı

- Veritabanı diski geçicidir. Sunucu yeniden başlarsa (yeni push, 15 dakika hareketsizlik sonrası uyku vb.) **tüm veriler sıfırlanır**.
- Oyun günü **push yapmayın**. Push, Render'ı yeniden başlatır ve açık oyunları siler.
- Koruma: Admin panelinden **yedek indirin**, sorun olursa **geri yükleyin**. Panel ayrıca tarayıcıda otomatik son yedeği tutar.
- 15 dakika hareketsiz kalan sunucu uyur, ilk açılış yavaştır. Oyundan önce `/play` adresini bir kez açın.

## Yönetici (admin) paneli

`/admin` adresi **PIN** ile korunur.

- Varsayılan PIN `server/utils/adminAuth.js` içinde (`DEFAULT_PIN`). `ADMIN_PIN` ortam değişkeni tanımlıysa o kullanılır
  (Render → servis → Environment). Depo herkese açıksa varsayılan PIN görünür; depoyu "private" yapın veya `ADMIN_PIN` tanımlayın.
- PIN'i yanlış girenler dakikada 5 denemeyle sınırlanır, oturum 12 saat geçerlidir.

Panelde neler var:

- **Genel bakış ve Değerlendirme Kuyruğu:** takımlar, puanlar, bekleyen cevaplar.
- **Tartışma sekmesi:** her vaka için takımların cevapları, tartışma için.
- **Vaka İçeriği:** vaka metinlerini (TR/EN ayrı) panelden düzenleme, özgün metne geri dönme.
- **Rapor:** oyun sonrası özet (`/report`).
- **Skor tablosu:** `/scoreboard` herkese açık ekran, panelden gizlenebilir.
- **Ayarlar:** vaka süresi, Final Parça A açık/kapalı, duyuru gönderme.
- **Yedek / Geri yükleme / Oturumu sıfırla:** sıfırlama "SIFIRLA" yazılmasını ister ve öncesinde otomatik yedek alır.

## Oyuncu tarafı

- Takım kurma veya **takım koduyla** başka telefondan katılma.
- Kod Defteri (açılan Ana Kanıt kodları), Sözlük, "Nasıl oynanır?" kartı.
- Dil seçimi (TR/EN), tarayıcıda hatırlanır.

## Kendi bilgisayarında çalıştırma (geliştirme)

Node.js 22.5 veya üstü gerekir (yerleşik SQLite için).

```
npm run install-all     # sunucu ve arayüz paketlerini kurar
npm run build           # arayüzü derler
npm start               # derler ve sunucuyu başlatır
npm test                # sunucu testleri (smoke + admin)
```

## Proje yapısı

```
vc-app/
├── server/
│   ├── server.js, db.js
│   ├── data/cases.js, cases.en.js   # vakalar (TR ve İngilizce katmanı)
│   ├── routes/                      # teams, miniVaka, anaKanit, final, sonGece, admin, adminExtra, scoreboard, session, qr
│   ├── utils/                       # stages, scoring, adminAuth, backup, contentStore, joinCode, lang ...
│   ├── smoketest.js, admintest.js
└── client/
    ├── public/images/               # hero görseller (aynı isimle değiştirilebilir)
    └── src/
        ├── pages/play/              # oyuncu ekranları
        ├── pages/                   # AdminDashboard, ScoreboardPage, ReportPage
        ├── components/, context/, i18n.js
```

## Notlar

- Puanlama mantığı ve "Doğru Çözüm" referansları oyuncuya ancak cevap gönderildikten sonra açılır.
- Vaka metinleri `server/data/cases.js` içindedir. Panelden yapılan düzenlemeler veritabanında durur
  ve yedeğe dahildir. Kalıcı değişiklik için dosyayı güncelleyin.
