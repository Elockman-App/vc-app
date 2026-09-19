/**
 * VC DEDEKTİFLERİ 2.0 — VAKA VERİSİ
 * Kaynak: VC_Dedektifleri_2.0_FINAL_PRODUCTION_EDITION.md
 *
 * Bu dosya, Final Production Edition'daki 7 alanlı mini vaka modelini birebir taşır:
 *   heroGorsel, olayAni (ozet + balonlar), kanitAni (3 kanıt), kararSorusu,
 *   dogruCozum, finalIcgorusu.
 *
 * ÖNEMLİ MİMARİ NOT: Bu dosyada artık gizli bir "cevap anahtarı" YOKTUR.
 * Karar Soruları açık uçludur; takımlar serbest metin gönderir, facilitator
 * admin panelinden okuyup puan verir (bkz. routes/answers.js). `dogruCozum`
 * alanı facilitator'e REFERANS olarak gösterilir — istemciye (oyuncuya) hiçbir
 * zaman gönderilmez (bkz. publicCase() en altta).
 */

const BOLUMLER = [
  {
    num: 1,
    key: "varolus",
    baslik: "BİZİM VAROLUŞ YOLUMUZ",
    degerler: ["İş Sağlığı ve Güvenliği", "Etik ve Çeşitlilik", "Açık İletişim"],
    accent: "3B6EA8",
    facilitatorAcilis: "İlk dosya kutusu önünüzde. Üçü de küçük olaylar. İç Denetim bu üç olayı neden bir araya koymuş olabilir?",
    anaKanit: { harf: "A", kod: "471", notParcasi: "Bu şirkette kimse yalan söylemiyor." }
  },
  {
    num: 2,
    key: "isyapis",
    baslik: "BİZİM İŞ YAPIŞ YOLUMUZ",
    degerler: ["Müşteri Odaklılık", "Güven ve Sadelik", "Sorumluluk Bilinci ile Hareket"],
    accent: "B8863B",
    facilitatorAcilis: "İkinci kutu farklı: burada kimse bir şey saklamıyor, her şey ortada. Peki sorun nerede?",
    anaKanit: { harf: "B", kod: "295", notParcasi: "Herkes bir kere uyarıyor, sonra susuyor." }
  },
  {
    num: 3,
    key: "gelisme",
    baslik: "BİZİM GELİŞME YOLUMUZ",
    degerler: ["Öğrenme ve Gelişme", "Kalıcı Çözümler", "Sürdürülebilir Miras"],
    accent: "3B8A6E",
    facilitatorAcilis: "Son kutuda en eski dosyalar var. Soru artık 'ne oldu' değil, 'bu neden bu kadar uzun sürdü?'",
    anaKanit: { harf: "C", kod: "836", notParcasi: "Ve gerçek, her seferinde bir adım geriden geliyor." }
  }
];

const MINI_VAKALAR = [
  {
    bolum: 1,
    sira: 1,
    baslik: "KAYAN AN",
    heroGorsel: "kayan_an.jpg",
    olayAni: {
      ozet: "Hasanoğlan Hazır Beton Tesisi, hammadde sahası. Bir operatör yerde küçük bir hidrolik yağ sızıntısı görüyor. Yanındakilere sözlü olarak söylüyor ama bunu şirketin resmi bildirim sistemine hiç girmiyor.",
      konusanlar: ["Operatör", "Vardiya Amiri"],
      balonlar: ["Şurada yağ dökülmüş, zemin kayıyor. Bildirim açsam mı?", "Boş ver, gün sonunda silerler. Bir de kâğıt işiyle uğraşma."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Saha Mesaj Grubu", from: "Operatör ve Vardiya Amiri", time: "11:15", text: "Operatör: Şurada yağ sızıntısı var, dikkat edin, zemin kayıyor.\nVardiya Amiri: Gördüm. Bildirim açmayalım, gün sonunda silinir.\nOperatör: Ama biri kayıp düşerse?" },
      { type: "data", baslik: "Tehlike Bildirim Sistemi", rows: [["Bugün sisteme girilen bildirim", "0"]] },
      { type: "quote", baslik: "Tanık İfadesi", who: "Ziyaretçi Yüklenici Mühendisi", text: "İç Denetim: Orada bir uyarı levhası var mıydı?\nZiyaretçi Yüklenici Mühendisi: Az kalsın düşüyordum. Ortada bir uyarı levhası bile yoktu." }
    ],
    kararSorusu: "Bu olay bir kazaya dönüşebilirdi (buna \"ramak kala\" denir). Sizce hangi anda ne yapılsaydı sorun baştan önlenirdi?",
    dogruCozum: "Operatör tehlikeyi gördü ve yanındakilere söyledi; ama \"küçük bir şey\" diye resmi sisteme girmedi. Tehlike ne kadar küçük olursa olsun, hemen resmi sisteme kaydedilmeliydi. Böylece herkes haberdar olur ve sızıntı giderilirdi.",
    finalIcgorusu: "Küçük görünen tehlike, resmi sisteme hiç girmedi."
  },
  {
    bolum: 1,
    sira: 2,
    baslik: "GÖLGEDEKİ ORTAK",
    heroGorsel: "golgedeki_ortak.jpg",
    olayAni: {
      ozet: "Ankara Fabrika, gece. Bakım Müdürü, yeğeninin yeni kurduğu şirketten yedek parça alıyor. Bu akrabalığı şirkette kimseye bildirmiyor.",
      konusanlar: ["Satınalma Uzmanı", "Bakım Müdürü"],
      balonlar: ["Müdürüm, bu firmayı sistemde daha önce görmedim. Kayıt formunu dolduralım mı?", "Gerek yok, yeğenim kurdu bu firmayı. Ben ona güveniyorum."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Kişisel Hat", from: "Müdür ve yeğeni (tedarikçi sahibi)", time: "22:10", text: "Bakım Müdürü: Kırıcı motoru için bir çözüm bulabildin mi yeğenim?\nYeğeni (tedarikçi): Buldum dayı, yarın sabah getiriyorum. Cumartesi yemeğe de geliyorum, annem seni sordu 😄\nBakım Müdürü: Ne güzel, anneni de öp benden." },
      { type: "data", baslik: "SAP Tedarikçi Kaydı", rows: [["Akrabalık / ortaklık bildirimi", "HAYIR"], ["Kayıt tarihi", "İlk siparişle aynı gün"]] },
      { type: "quote", baslik: "Tanık İfadesi", who: "Bakım Müdürü", text: "İç Denetim: Tedarikçi firmayla ilgili neden kimseye bir şey söylemediniz?\nBakım Müdürü: Kimse sormadı, ben de söylemedim." }
    ],
    kararSorusu: "Bu süreçte hangi tek adım, her şeyi en başından şeffaf hale getirirdi?",
    dogruCozum: "Akrabalık, tedarikçinin kayıt formunda en baştan bildirilmeliydi. Parça iyi ve ucuz olsa bile, bildirilmeyen bir çıkar ilişkisi doğru sayılmaz.",
    finalIcgorusu: "Sonuç iyi olunca, yanlış yöntem fark edilmeyebiliyor."
  },
  {
    bolum: 1,
    sira: 3,
    baslik: "KIRIK ZİNCİR",
    heroGorsel: "kirik_zincir.jpg",
    olayAni: {
      ozet: "Sivas Fabrika, gece vardiyası. Bir bandın koruyucu kapağı 4 gündür yok. Bu bilgi vardiyadan vardiyaya sadece ağızdan ağza aktarılıyor ve yeni gelen operatöre hiç ulaşmıyor.",
      konusanlar: ["Yeni Operatör", "Gece Operatörü"],
      balonlar: ["Bu bandın koruyucu kapağı nerede? Kimse bana bir şey söylemedi.", "Bir süredir yok, biz alıştık. Sen sadece dikkat et."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Vardiya Grubu", from: "Vardiya Grubu (Yeni Operatör ve Gece Operatörü)", time: "07:08", text: "Yeni Operatör: Şu bandın kapağı yok, gördüm. Ne oldu?\nGece Operatörü: Tamire gitti, biz böyle şeylere alışığız.\nYeni Operatör: Peki bunu kimse yazmadı mı?" },
      { type: "data", baslik: "Vardiya Teslim Formu (4 Gün)", rows: [["\"Açık Riskler\" bölümü", "[ BOŞ ]"]] },
      { type: "quote", baslik: "Tanık İfadesi", who: "Yeni Operatör", text: "İç Denetim: Kapağın olmadığını neden sormadınız?\nYeni Operatör: Kimse bana söylemedi. \"Belki normaldir, sormak aptalca görünür\" diye düşündüm." }
    ],
    kararSorusu: "Bilgi zincirinde tam olarak hangi halka koptu?",
    dogruCozum: "Bilgi sözlü olarak 3-4 kişiden geçince kayboldu. Vardiya teslim formundaki \"Açık Riskler\" bölümü doldurulmalıydı; böylece yeni gelen herkes durumu yazılı olarak görürdü.",
    finalIcgorusu: "Herkesin bildiğini sanması, aslında kimsenin bilmemesi demek olabilir."
  },

  {
    bolum: 2,
    sira: 4,
    baslik: "BU SEFERLİK",
    heroGorsel: "bu_seferlik.jpg",
    olayAni: {
      ozet: "Kayaş Hazır Beton Tesisi, gece. Büyük bir müşteri sözleşmeyi iptal etmekle tehdit ediyor. Saha sorumlusu bir sürücüyü ek sevkiyata gönderiyor ve sürücünün çıkış saatini kayıtlarda değiştiriyor.",
      konusanlar: ["Sürücü", "Saha Sorumlusu"],
      balonlar: ["Mesaim bitti ama müşteri hâlâ bekliyor. Bu sevkiyat kayda nasıl geçecek?", "Sen git, kaydı ben düzeltirim. Bu seferlik idare edelim."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Sevkiyat Ekibi", from: "Saha Sorumlusu ve Sürücü", time: "20:52", text: "Saha Sorumlusu: Bu seferlik idare et, mesai kaydını ben düzeltirim.\nSürücü: Mesaim 20:00'de bitti, kayıtta öyle görünmeyecek mi?\nSaha Sorumlusu: Merak etme, ben hallederim." },
      { type: "data", baslik: "SAP Giriş-Çıkış (Turnike) Kaydı", rows: [["Gerçek çıkış saati", "23:52"], ["Sistemdeki kayıt", "19:00 (23:58'de elle değiştirilmiş)"]] },
      { type: "data", baslik: "Performans Göstergesi — Vardiya Aşımı", rows: [["Son 3 haftanın seyri", "Sürekli artıyor"]] }
    ],
    kararSorusu: "Bu olayda verilen kararlardan hangisi sonradan düzeltilebilirdi, hangisi düzeltilemezdi?",
    dogruCozum: "Ek sevkiyat, tartışılabilir bir ticari karardı; sonradan değerlendirilebilirdi. Ama çıkış kaydını değiştirmek geri alınamaz bir dürüstlük ihlaliydi.",
    finalIcgorusu: "\"Bu seferlik\" bir kez söylenince alışkanlığa dönüştü."
  },
  {
    bolum: 2,
    sira: 5,
    baslik: "EŞİĞİN ALTINDA",
    heroGorsel: "esigin_altinda.jpg",
    olayAni: {
      ozet: "Ankara Fabrika. 50.000 TL altındaki alımlar için tek imza yeterli. Bir mühendis aynı pompayı 9 ayda 9 kez onartıyor ve her seferinde tutarı bu sınırın altında tutuyor.",
      konusanlar: ["Satınalma Uzmanı", "Planlama Mühendisi"],
      balonlar: ["Bu pompa için yine arıza kaydı açılmış. Bu kaçıncı oldu?", "Tutar hep 50 bin altında, tek imza yeter. Büyütmeye gerek yok."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Bakım Planlama", from: "Planlama Mühendisi ve Satınalma Uzmanı", time: "—", text: "Satınalma Uzmanı: Bu pompa için yeni bir yatırım talebi açalım mı?\nPlanlama Mühendisi: Büyük yatırım sürecine girmek istemiyorum, şimdilik idare edelim." },
      { type: "data", baslik: "SAP Satınalma Geçmişi", rows: [["9 sipariş", "Hepsi 42-48 bin TL arası"], ["Onay türü", "Hepsi tek imzalı"]] },
      { type: "teams", baslik: "Süreç İyileştirme (Arşiv)", from: "Finansal Planlama ve Kontrol Sorumlusu", time: "—", text: "Tekrarlayan harcamalar için uyarı ekleyelim mi? → \"Not aldım, ileride bakarız.\" (hiç yapılmadı)" }
    ],
    kararSorusu: "Sistemde hangi tek değişiklik bu tekrarı çok daha erken yakalardı?",
    dogruCozum: "Hiçbir kural çiğnenmedi. Ama aynı arızanın kaç kez tekrarlandığını izleyen bir uyarı olsaydı, 2-3. tekrarda \"kalıcı çözüm bulalım\" denirdi.",
    finalIcgorusu: "Kural çiğnenmedi ama kuralın amacı çoktan boşa çıkmıştı."
  },
  {
    bolum: 2,
    sira: 6,
    baslik: "BOŞ SANDALYE",
    heroGorsel: "bos_sandalye.jpg",
    olayAni: {
      ozet: "Yozgat Fabrika. Kalite Geliştirme Şefi, kalite değerlerinde kötüye giden bir seyir fark ediyor ama resmi rapor açmıyor. Konu toplantıda ertelenince bir daha hiç gündeme gelmiyor.",
      konusanlar: ["Proses Mühendisi", "Kalite Geliştirme Şefi"],
      balonlar: ["Kalite rakamları 9 haftadır sürekli kötüleşiyor. Toplantıya taşısak mı?", "Bu hafta gündem dolu. Şimdilik kalsın, sonra bakarız."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Kalite–Üretim Koordinasyonu", from: "Proses Mühendisi ve Kalite Geliştirme Şefi", time: "—", text: "Proses Mühendisi: Resmi bir talep olmadan onay almak zor... Toplantıda konuşalım mı?\nKalite Geliştirme Şefi: Bu hafta gündem dolu, şimdilik kalsın." },
      { type: "data", baslik: "Toplantı Notu", rows: [["Karar", "Zaman yetmediği için konuşulamadı, ertelendi."]] },
      { type: "data", baslik: "SAP Kalite Seyri", rows: [["Son 9 haftanın seyri", "Hiç durmadan yükseldi"], ["Otomatik uyarı", "Yok"]] }
    ],
    kararSorusu: "Bu olayda yer alan kişilerden hangisi, görev tanımı net olmasa bile konuyu üst yönetime taşıyabilirdi?",
    dogruCozum: "Herkes sadece kendi görev tanımının sınırında kaldı. Gerçek sahiplenme, resmi yetki olmasa bile riski sonuna kadar takip etmektir.",
    finalIcgorusu: "Fark edilen sorun bir kez söylendi ama hiç resmi talebe dönüşmedi."
  },

  {
    bolum: 3,
    sira: 7,
    baslik: "YANLIŞ İSİM",
    heroGorsel: "yanlis_isim.jpg",
    olayAni: {
      ozet: "Nevşehir Fabrika. Yeni bir deneme projesi (pilot proje) 2. haftada \"başarılı\" ilan edilip herkese duyuruluyor. Sorunlar başlayınca sorumlu kişi, kanıt olmadan suçu bir operatöre yüklüyor.",
      konusanlar: ["Proje Mühendisi", "Organizasyonel Gelişim Müdürü"],
      balonlar: ["Herkes kutluyor ama sahadaki sorunlar bitmedi, içim rahat değil.", "Şimdi bunu konuşmanın sırası değil. Başarıyı bozmayalım."]
    },
    kanitAni: [
      { type: "teams", baslik: "Erken Duyuru", from: "Organizasyonel Gelişim Müdürü", time: "2. Hafta", text: "İlk 2 hafta harika gitti! Yarın bölge yönetimine de paylaşacağım 🎉" },
      { type: "whatsapp", baslik: "Proje Ekibi", from: "Proje Ekibi (Proje Mühendisi ve Ekip Arkadaşı)", time: "5. Hafta", text: "Ekip Arkadaşı: Sahadaki sorunun nedeni ne olabilir?\nProje Mühendisi: Sorun var demek çok kötü görünür... En olası neden bu operatör, başka türlü açıklamak zor." },
      { type: "data", baslik: "SAP Kurallara Uyum Karşılaştırması", rows: [["Suçlanan operatörün uyumu", "Suçlanmayan vardiyadan bile yüksek"]] }
    ],
    kararSorusu: "Hangi anda dürüstçe \"bu iyi gitmiyor\" denseydi her şey değişirdi?",
    dogruCozum: "Projeyi erken ve herkese açık şekilde başarılı ilan etmek, geri dönmeyi zorlaştırdı. Kanıt olmadan birini suçlamak hiçbir koşulda kabul edilemez.",
    finalIcgorusu: "Hatayı saklamak, hatanın kendisinden daha pahalıya patladı."
  },
  {
    bolum: 3,
    sira: 8,
    baslik: "GÖRÜNMEYEN DURUŞ",
    heroGorsel: "gorunmeyen_durus.jpg",
    olayAni: {
      ozet: "Samsun Fabrika. Haftada 15-20 kez, her biri 15 dakikadan kısa süren küçük duruşlar (mikro duruş) oluyor. Bunlar resmi arıza sayılmadığı için performans göstergeleri hep yeşil görünüyor.",
      konusanlar: ["Bakım Ustabaşı", "Üretim Sorumlusu"],
      balonlar: ["Bant bu hafta yine birkaç kez durdu. Bunu kayda geçirsek mi?", "Hepsi 15 dakikadan kısa, arıza sayılmaz. Zaten hemen çalışıyor."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Bakım Takip", from: "Bakım Takip (Ustabaşı ve Üretim Sorumlusu)", time: "—", text: "Üretim Sorumlusu: Bant yine durmuş, ne oluyor?\nBakım Ustabaşı: Aylarca söyledim, duvara konuşuyor gibiydim." },
      { type: "data", baslik: "Bakım Kaydı ve Sevkiyat Kaydı", rows: [["Aynı 4 tarih", "Hem küçük duruşlar hem teslimat gecikmeleri en yüksek seviyede"]] },
      { type: "data", baslik: "Performans Panosu", rows: [["Makine verimliliği panosu (OEE: makinenin ne kadar verimli çalıştığı)", "%89 → Yeşil (iyi görünüyor)"], ["Bayiye zamanında teslimat panosu (ayrı rapor)", "%78 → Kırmızı (kötü)"], ["Sonuç", "İki pano ayrı raporlarda, kimse yan yana koymadı"]] }
    ],
    kararSorusu: "Hangi iki rapor yan yana konsaydı, sorun aylar önce anlaşılırdı?",
    dogruCozum: "Sorun bir kişide değil, ölçüm şeklindeydi: 15 dakikadan kısa duruşlar hiç sayılmıyordu. Bakım kayıtları ile teslimat gecikmeleri yan yana konsaydı bağlantı görülürdü.",
    finalIcgorusu: "İki doğru rapor, yan yana konmadığı için hiçbir şey anlatmadı."
  },
  {
    bolum: 3,
    sira: 9,
    baslik: "DUVARIN ÖTESİ",
    heroGorsel: "duvarin_otesi.jpg",
    olayAni: {
      ozet: "Ankara Fabrika. Fabrika yasal sınırları aşmıyor ama komşulardan 2 yıldır toz şikâyeti geliyor. Toz önleme yatırımı 3 kez \"yasal zorunluluk yok\" denilerek erteleniyor.",
      konusanlar: ["Çevre Mühendisi", "Fabrika Yönetimi"],
      balonlar: ["Komşulardan yine toz şikâyeti geldi. Toz önleme yatırımını artık yapalım mı?", "Yasal bir zorunluluk yok, elimizden geleni yapıyoruz zaten. Bu yıl da olmaz."]
    },
    kanitAni: [
      { type: "teams", baslik: "Yatırım Önerileri (Arşiv)", from: "Çevre Mühendisi", time: "2 yıl boyunca", text: "Toz önleme yatırımı önerildi ama 2 yıl üst üste \"yasal zorunluluk yok\" denilerek ertelendi." },
      { type: "data", baslik: "Şikâyet Kaydı", rows: [["Komşulardan gelen toz şikâyeti (yıl yıl)", "1. yıl: 7 → 2. yıl: 11 → 3. yıl: 14"], ["Resmi (yazılı) başvuru", "1 adet"], ["Sonuç", "Şikâyetler her yıl artıyor, sorun kendiliğinden geçmiyor"]] },
      { type: "data", baslik: "Ölçüm Notu", rows: [["3 yıllık ölçüm günleri", "Hep rüzgârsız günde yapılmış"]] }
    ],
    kararSorusu: "Şirket hiçbir yasayı çiğnemedi. Bu, 2 yıllık ertelemeyi haklı çıkarır mı?",
    dogruCozum: "Yasaya uymak yeterli değil, sadece en alt çıtadır. Şirket iki yıl bekleyince, en başta yatırım yapmaktan daha pahalıya mal oldu.",
    finalIcgorusu: "Örüntü 2 yıldır oradaydı — kimse tek bir çizgide görmedi."
  }
];

const FINAL = {
  kilitKodu: "471295836", // 471 + 295 + 836 birlesimi (tirensiz); sunucu her iki formati da kabul eder
  kilitKoduTireli: "471-295-836",
  notTam: [
    "Bu şirkette kimse yalan söylemiyor.",
    "Herkes bir kere uyarıyor, sonra susuyor.",
    "Ve gerçek, her seferinde bir adım geriden geliyor."
  ],
  parcaA: {
    gorev: "İç Denetim'e sunacağınız tek cümlelik teşhis nedir? (Bu şirketin asıl sorunu ne?)",
    dogruCozumReferansi: "Bu şirkette insanlar riski görüyor ve söylüyor — ama bir uyarıyı otomatik olarak büyütüp doğru yere ulaştıracak güvenli ve düzenli bir yöntem yok."
  },
  koprucumlesi: "Şimdi göreceğiz: bu ders gerçekten öğrenildi mi?",
  sonGece: {
    lokasyon: "Ankara Fabrika (Merkez)",
    zamanCizelgesi: [
      { saat: "21:40", olay: "Fırının dış yüzeyinde aşırı sıcak bir nokta bulundu" },
      { saat: "22:04", olay: "Fırını kontrollü ve hızlı şekilde soğutmaya karar verildi" },
      { saat: "23:45", olay: "Süreç güvenle tamamlandı" }
    ],
    kanitAni: [
      { type: "whatsapp", baslik: "ACİL – Fırın Durum", from: "Üretim Vardiya Mühendisi", time: "21:42", text: "Sıcak nokta buldum, 4. bölge. Planlı duruşa 80 dk var. Acil görüşmemiz lazım." },
      { type: "whatsapp", baslik: "ACİL – Fırın Durum", from: "İş Sağlığı ve Güvenliği Şefi", time: "22:04", text: "Önerim: fırını tamamen durdurmak yerine kontrollü ve hızlı soğutalım. 15 dk içinde başlayabiliriz." },
      { type: "data", baslik: "Termal Tarama (22:03)", rows: [["Fırın yüzey sıcaklığı", "412°C (tehlike sınırı: 450°C)"], ["Sıcaklık artış hızı", "30 dakikada +18°C"]] }
    ],
    // Üç Yolun Sınavı: SABİT doğru cevaplar (otomatik puanlanır, bkz. server/routes/sonGece.js)
    ucYolSinavi: [
      {
        yolculuk: "Varoluş Yolumuz",
        kanit: "Sıcak nokta bulunur bulunmaz 3 kişiye AYNI ANDA, net bilgi verildi",
        dogruMiniVakaSira: 3, // Kırık Zincir
        dogruMiniVakaBaslik: "KIRIK ZİNCİR"
      },
      {
        yolculuk: "İş Yapış Yolumuz",
        kanit: "Kararı üç kişi açıkça sahiplendi",
        dogruMiniVakaSira: 6, // Boş Sandalye
        dogruMiniVakaBaslik: "BOŞ SANDALYE"
      },
      {
        yolculuk: "Gelişme Yolumuz",
        kanit: "Sıcaklık verisine bakıldı, kalıcı çözüm planlandı",
        dogruMiniVakaSira: 8, // Görünmeyen Duruş
        dogruMiniVakaBaslik: "GÖRÜNMEYEN DURUŞ"
      }
    ],
    gercekcilikCapasi: "Bu senaryo kurgu, ama kararlar gerçek bir kriz yönetiminde izlenen yöntemdir."
  },
  kapanisMesaji: "Bu dokuz dosyada tek bir kötü niyetli insan yoktu. Sadece dokuz farklı an, aynı boşluğu gösteriyordu: bir sinyal görüldü, bir kere söylendi, sonra sessizliğe gömüldü. Son Gece bize bunun tersinin de mümkün olduğunu gösterdi — çünkü VC Way'in üç yolculuğu o gece ayrı ayrı değil, birlikte çalıştı.",
  kapanisSorusu: "Yarın, sizin sahanızda birisi küçük bir sinyal gördüğünde, bu şirket onu duyacak mı?"
};

// ---------------------------------------------------------------------------
// YARDIMCI FONKSİYONLAR
// ---------------------------------------------------------------------------

// İngilizce çeviri (cases.en.js) Türkçe verinin üzerine bindirilir.
const EN = require("./cases.en")(BOLUMLER, MINI_VAKALAR, FINAL);

/** Dile göre veri seti: "en" ise İngilizce, aksi halde Türkçe. */
function dataFor(lang) {
  return lang === "en" ? EN : { BOLUMLER, MINI_VAKALAR, FINAL };
}

function getFinal(lang) {
  return dataFor(lang).FINAL;
}

// Panelden düzenlenen metinler (bkz. utils/contentStore.js): { tr: { "1": {...} }, en: { ... } }
let OVERRIDES = { tr: {}, en: {} };

function setOverrides(map) {
  OVERRIDES = { tr: (map && map.tr) || {}, en: (map && map.en) || {} };
}

/** Kodla gelen özgün (düzenlenmemiş) vaka */
function getBaseMiniVaka(sira, lang) {
  return dataFor(lang).MINI_VAKALAR.find((mv) => mv.sira === Number(sira)) || null;
}

function getMiniVaka(sira, lang) {
  const base = getBaseMiniVaka(sira, lang);
  if (!base) return null;
  const ov = (OVERRIDES[lang === "en" ? "en" : "tr"] || {})[String(base.sira)];
  if (!ov) return base;
  return {
    ...base,
    ...ov,
    olayAni: { ...base.olayAni, ...(ov.olayAni || {}) }
  };
}

function getBolum(num, lang) {
  return dataFor(lang).BOLUMLER.find((b) => b.num === Number(num)) || null;
}

function getBolumByMiniVaka(sira, lang) {
  const mv = getMiniVaka(sira, lang);
  return mv ? getBolum(mv.bolum, lang) : null;
}

/**
 * Bir mini vakayı OYUNCU istemcisine göndermeye hazırlar.
 * `dogruCozum` ve `finalIcgorusu` facilitator/puanlama referansıdır — bilerek
 * bu fonksiyonun dışında (server/routes/miniVaka.js'te) filtrelenir; bu dosya
 * sadece ham veriyi tutar, sızdırma kararı route katmanına aittir (bkz. Plan §3).
 */
function listMiniVakaMeta(lang) {
  return dataFor(lang).MINI_VAKALAR.map((base) => {
    const mv = getMiniVaka(base.sira, lang);
    return { sira: mv.sira, bolum: mv.bolum, baslik: mv.baslik };
  });
}

module.exports = {
  BOLUMLER,
  MINI_VAKALAR,
  FINAL,
  getFinal,
  setOverrides,
  getBaseMiniVaka,
  getMiniVaka,
  getBolum,
  getBolumByMiniVaka,
  listMiniVakaMeta
};
