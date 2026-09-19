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
    facilitatorAcilis: "İlk dosya kutusu önünüzde. Üçü de küçük olaylar. İç Denetim bunları neden bir araya koydu?",
    anaKanit: { harf: "A", kod: "471", notParcasi: "Bu şirkette kimse yalan söylemiyor." }
  },
  {
    num: 2,
    key: "isyapis",
    baslik: "BİZİM İŞ YAPIŞ YOLUMUZ",
    degerler: ["Müşteri Odaklılık", "Güven ve Sadelik", "Sorumluluk Bilinci ile Hareket"],
    accent: "B8863B",
    facilitatorAcilis: "İkinci kutu farklı bir aileden: burada kimse bir şeyi saklamıyor. Peki sorun nerede?",
    anaKanit: { harf: "B", kod: "295", notParcasi: "Herkes bir kere uyarıyor, sonra susuyor." }
  },
  {
    num: 3,
    key: "gelisme",
    baslik: "BİZİM GELİŞME YOLUMUZ",
    degerler: ["Öğrenme ve Gelişme", "Kalıcı Çözümler", "Sürdürülebilir Miras"],
    accent: "3B8A6E",
    facilitatorAcilis: "Son kutu en eskilerini içeriyor. Soru artık 'ne oldu' değil, 'neden bu kadar uzun sürdü'.",
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
      ozet: "Hasanoğlan HB Tesisi, hammadde sahası. Bir operatör küçük bir hidrolik sızıntı fark eder, sözlü uyarır ama resmi sisteme hiç girmez.",
      balonlar: [
        "Zemin burada parlıyor, dikkatli olun.",
        "Ee, hep biraz sızdırır zaten."
      ]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Saha İçi Mesajlaşma", from: "Operatör", time: "11:15", text: "Şurada sızıntı var, dikkat et, kayıyor." },
      { type: "data", baslik: "Tehlike Bildirim Sistemi", rows: [["Bugün Kaydedilen Bildirim", "0"]] },
      { type: "quote", baslik: "Tanık İfadesi", who: "Ziyaretçi Yüklenici Mühendisi", text: "Az kalsın düşüyordum, uyarı levhası bile yok." }
    ],
    kararSorusu: "Bu ramak-kala önlenebilirdi. Tam olarak hangi anda, ne yapılsaydı önlenirdi?",
    dogruCozum: "Sinyal gerçekten görüldü ve paylaşıldı — ama hiçbir zaman resmi sisteme girmedi çünkü \"küçük\" bulundu. Her tehlike, boyutundan bağımsız, saniyeler içinde resmi sisteme girilmeliydi.",
    finalIcgorusu: "Küçük görünen sinyal, resmi sisteme hiç girmedi."
  },
  {
    bolum: 1,
    sira: 2,
    baslik: "GÖLGEDEKİ ORTAK",
    heroGorsel: "golgedeki_ortak.jpg",
    olayAni: {
      ozet: "Ankara Fabrika (Merkez), gece. Bakım Müdürü, akrabasına ait yeni kurulmuş bir tedarikçiden parça alır; ilişki hiç beyan edilmez.",
      balonlar: [
        "Gece yarısı bir telefon çalıyor.",
        "Merak etme, tanıdığım biri hallediyor."
      ]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Kişisel Hat", from: "Tedarikçi Sahibi", time: "22:10", text: "Abi kırıcı motoru bulundu... Ablamın kahvaltısı için de gelirim 😄" },
      { type: "data", baslik: "SAP Tedarikçi Kaydı", rows: [["İlişkili Taraf Beyanı", "HAYIR"], ["Kayıt Tarihi", "İlk sipariş tarihiyle aynı gün"]] },
      { type: "quote", baslik: "Tanık İfadesi", who: "Bakım Müdürü", text: "Kimse sormadı, ben de öne çıkarmadım." }
    ],
    kararSorusu: "Bu sürecin hangi tek adımı, her şeyi baştan şeffaf hale getirirdi?",
    dogruCozum: "İlişki tedarikçi kayıt formunda baştan beyan edilmeliydi. \"İyi sonuç\" beyan edilmeyen bir çıkar çatışmasını meşrulaştırmaz.",
    finalIcgorusu: "Doğru sonuç, yanlış yöntemi görünmez kılabiliyor."
  },
  {
    bolum: 1,
    sira: 3,
    baslik: "KIRIK ZİNCİR",
    heroGorsel: "kirik_zincir.jpg",
    olayAni: {
      ozet: "Sivas Fabrika, gece vardiyası. Bir bandın koruyucu kapağı 4 gün eksik kalır; bilgi sözlü aktarılır, deneyimsiz operatöre hiç ulaşmaz.",
      balonlar: [
        "O koruyucu kapak nereye gitti?",
        "Boş ver, birkaç gündür böyle."
      ]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Vardiya Grubu", from: "Gece Operatörü", time: "07:08", text: "Kapak yok gördüm, ne oldu? → \"Tamir edildi, alışığız böyle şeylere.\"" },
      { type: "data", baslik: "Vardiya Devir Formu (4 Gün)", rows: [["Açık Riskler Alanı", "[ BOŞ ]"]] },
      { type: "quote", baslik: "Tanık İfadesi", who: "Yeni Operatör", text: "Kimse söylemedi. 'Belki normaldir, sormak aptalca görünür' diye düşündüm." }
    ],
    kararSorusu: "Bilgi zincirinde tam olarak hangi halka koptu?",
    dogruCozum: "Sözlü aktarım 3-4 kişiden sonra güvenilirliğini kaybetti. \"Açık Riskler\" alanı doldurulmalıydı.",
    finalIcgorusu: "Herkesin bildiği bir şey, resmen 'bilinmiyor' olabilir."
  },

  {
    bolum: 2,
    sira: 4,
    baslik: "BU SEFERLİK",
    heroGorsel: "bu_seferlik.jpg",
    olayAni: {
      ozet: "Kayaş HB Tesisi, gece. Büyük bir müşteri sözleşme iptaliyle tehdit edince, saha sorumlusu bir sürücüyü ek sevkiyata gönderir ve çıkış kaydını değiştirir.",
      balonlar: [
        "Vardiyam bitti ama telefon susmuyor.",
        "Bu seferliğine bir çözüm bulalım."
      ]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Sevkiyat Ekibi", from: "Saha Sorumlusu", time: "20:52", text: "Bu seferlik idare et, puantajı ben hallederim." },
      { type: "data", baslik: "SAP PDKS Log", rows: [["Gerçek Çıkış", "23:52"], ["Sistemdeki Kayıt", "19:00 (elle değiştirildi, 23:58)"]] },
      { type: "data", baslik: "KPI — Vardiya Aşım Sıklığı", rows: [["Son 3 Hafta Trendi", "Sürekli Artışta"]] }
    ],
    kararSorusu: "Verilen kararlardan hangisi geri alınabilirdi, hangisi geri alınamazdı?",
    dogruCozum: "Ek sevkiyat tartışmaya açık bir ticari karardı; kaydı değiştirmek geri alınamaz bir dürüstlük ihlaliydi.",
    finalIcgorusu: "'Bu seferlik' bir kez söylenince alışkanlığa dönüştü."
  },
  {
    bolum: 2,
    sira: 5,
    baslik: "EŞİĞİN ALTINDA",
    heroGorsel: "esigin_altinda.jpg",
    olayAni: {
      ozet: "Ankara Fabrika (Merkez). 50.000 TL altı satınalmalarda tek imza yeterli hale getirilir; bir mühendis aynı pompa için 9 ayda 9 kez, hep eşiğin altında onarım yaptırır.",
      balonlar: [
        "Yine mi aynı arıza kaydı açıldı?",
        "Büyütmeye gerek yok, hemen hallederiz."
      ]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Bakım Planlama", from: "Planlama Mühendisi", time: "—", text: "Büyük yatırım süreciyle uğraşmak istemiyorum, şimdilik idare edelim." },
      { type: "data", baslik: "SAP Satınalma Geçmişi", rows: [["9 Sipariş", "Hepsi 42-48K TL Aralığında"], ["Onay Tipi", "Hepsi Tek İmza"]] },
      { type: "teams", baslik: "Süreç İyileştirme (Arşiv)", from: "Finansal Planlama ve Kontrol Sorumlusu", time: "—", text: "Tekrarlayan harcama uyarısı eklesek mi? → \"Not aldım, ileride.\" (hiç uygulanmadı)" }
    ],
    kararSorusu: "Sistemde hangi tek değişiklik bu örüntüyü çok daha erken yakalardı?",
    dogruCozum: "Hiçbir kural çiğnenmedi — ama tekrar sayısını izleyen bir uyarı olsaydı, 2-3. tekrarda kalıcı çözüm tartışması açılırdı.",
    finalIcgorusu: "Kural çiğnenmedi, ama amacı çoktan aşılmıştı."
  },
  {
    bolum: 2,
    sira: 6,
    baslik: "BOŞ SANDALYE",
    heroGorsel: "bos_sandalye.jpg",
    olayAni: {
      ozet: "Yozgat Fabrika. Kalite Geliştirme Şefi bir trendi fark eder ama resmi rapor açmaz; konu toplantı gündeminde ertelenir ve bir daha hiç gelmez.",
      balonlar: [
        "Bu rakamlar hep aynı yöne gidiyor.",
        "Şimdilik gündemde değil, sonra bakarız."
      ]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Kalite–Üretim Koordinasyon", from: "Proses Mühendisi", time: "—", text: "Resmi bir talep olmadan onay almam zor... Toplantıda gündeme getirelim mi?" },
      { type: "data", baslik: "Toplantı Notu", rows: [["Karar", "Zaman kısıtı nedeniyle görüşülemedi, ertelendi."]] },
      { type: "data", baslik: "SAP Kalite Trendi", rows: [["9 Haftalık Trend", "Kesintisiz Yükseliş"], ["Otomatik Uyarı", "Yok"]] }
    ],
    kararSorusu: "Beş karakterden hangisi, yetkisi net olmasa bile konuyu üst makama taşıyabilirdi?",
    dogruCozum: "Herkes kendi görev tanımının sınırında kaldı; gerçek sahiplenme resmi yetkiden bağımsız olarak riski sonuna kadar takip etmeyi gerektirir.",
    finalIcgorusu: "'Gözlem' bir kez söylendi ama hiç 'talebe' dönüşmedi."
  },

  {
    bolum: 3,
    sira: 7,
    baslik: "YANLIŞ İSİM",
    heroGorsel: "yanlis_isim.jpg",
    olayAni: {
      ozet: "Nevşehir Fabrika. Bir pilot proje 2. haftada başarılı ilan edilip erken duyurulur; sorunlar başlayınca sorumlu, kanıtsız biçimde bir operatöre yıkar.",
      balonlar: [
        "Herkes kutluyor ama içim rahat değil.",
        "Şimdi bunu konuşmanın sırası değil."
      ]
    },
    kanitAni: [
      { type: "teams", baslik: "Erken Duyuru", from: "Organizasyonel Gelişim Müdürü", time: "2. Hafta", text: "İlk 2 hafta harika! Yarın bölgesel yönetime paylaşacağım 🎉" },
      { type: "whatsapp", baslik: "Proje Ekibi", from: "Proje Mühendisi", time: "5. Hafta", text: "Sorun var demek çok kötü görünür... En olası açıklama bu, başka türlü açıklaması zor." },
      { type: "data", baslik: "SAP Uyum Karşılaştırması", rows: [["Suçlanan Operatörün Uyumu", "Suçlamayan Vardiyadan da Yüksek"]] }
    ],
    kararSorusu: "Hangi an, dürüst bir 'bu iyi gitmiyor' cümlesiyle her şeyi değiştirebilirdi?",
    dogruCozum: "Erken, kamuya açık başarı duyurusu geri dönülmezlik baskısı yarattı. Kanıtsız suçlama hiçbir koşulda kabul edilemez.",
    finalIcgorusu: "Hatayı saklamak, hatadan daha pahalıya patladı."
  },
  {
    bolum: 3,
    sira: 8,
    baslik: "GÖRÜNMEYEN DURUŞ",
    heroGorsel: "gorunmeyen_durus.jpg",
    olayAni: {
      ozet: "Samsun Fabrika. Haftada 15-20 kez, 15 dakikanın altında kalan 'mikro duruşlar' hiç resmi arıza sayılmaz; KPI hep yeşil görünür.",
      balonlar: [
        "Bant yine birkaç dakikalığına durdu.",
        "Önemli değil, hemen devam ediyor zaten."
      ]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Bakım Takip", from: "Makine Bakım Formeni", time: "—", text: "Aylarca söyledim, duvara konuşuyormuşum gibi hissettim." },
      { type: "data", baslik: "Bakım Kaydı vs Sevkiyat Kaydı", rows: [["Aynı 4 Tarih", "Hem Mikro Duruş Hem Gecikme Zirvede"]] },
      { type: "data", baslik: "KPI Panosu", rows: [["OEE", "%89 (Yeşil)"], ["Bayi Zamanında Teslimat (Ayrı Pano)", "%78 (Kırmızı)"]] }
    ],
    kararSorusu: "Hangi iki rapor yan yana konulsaydı sorun aylar önce çözülürdü?",
    dogruCozum: "Sorun bir kişide değil, ölçüm tanımındaydı — eşiğin altındaki tekrarlar hiç izlenmiyordu.",
    finalIcgorusu: "İki doğru rapor, yan yana konulmadığı için hiçbir şey ifade etmedi."
  },
  {
    bolum: 3,
    sira: 9,
    baslik: "DUVARIN ÖTESİ",
    heroGorsel: "duvarin_otesi.jpg",
    olayAni: {
      ozet: "Ankara Fabrika (Merkez). Fabrika hiçbir yasal limiti aşmıyor ama 2 yıldır toz şikâyeti var; çözüm 3 kez 'yasal zorunluluk yok' gerekçesiyle ertelenir.",
      balonlar: [
        "Duvarın öte yakasından yine şikayet geldi.",
        "Elimizden geleni yapıyoruz zaten."
      ]
    },
    kanitAni: [
      { type: "teams", baslik: "Yatırım Önerileri (Arşiv)", from: "Çevre Mühendisi", time: "2 Yıl Boyunca", text: "Öneri 2 yıl üst üste 'yasal zorunluluk yok' gerekçesiyle ertelendi." },
      { type: "data", baslik: "Şikâyet Kaydı", rows: [["3 Yıllık Trend", "7 → 11 → 14+1 Resmi Başvuru"]] },
      { type: "data", baslik: "Ölçüm Notu", rows: [["3 Yıllık Ölçüm Günleri", "Hep Rüzgarsız Günde Yapılmış"]] }
    ],
    kararSorusu: "Şirket hiçbir yasayı çiğnemedi. Bu, iki yıllık ertelemeyi haklı çıkarır mı?",
    dogruCozum: "Yasal uyum sorumluluğun tavanı değil tabanı olmalı. İki yıllık erteleme sonunda yatırımın kendisinden daha pahalıya mal oldu.",
    finalIcgorusu: "Örüntü 2 yıl oradaydı — kimse tek çizgide görmedi."
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
    gorev: "İç Denetim'e sunulacak tek cümlelik teşhis nedir?",
    dogruCozumReferansi: "Bu şirkette insanlar riski görüyor ve söylüyor — ama organizasyonun, bir uyarıyı otomatik olarak büyütecek güvenli ve sistematik bir mekanizması yok."
  },
  koprucumlesi: "Şimdi göreceğiz: bu ders gerçekten öğrenildi mi?",
  sonGece: {
    lokasyon: "Ankara Fabrika (Merkez)",
    zamanCizelgesi: [
      { saat: "21:40", olay: "Fırın kabuğunda sıcak nokta tespit edildi" },
      { saat: "22:04", olay: "Hızlandırılmış kontrollü soğutma kararı verildi" },
      { saat: "23:45", olay: "Süreç güvenle tamamlandı" }
    ],
    kanitAni: [
      { type: "whatsapp", baslik: "ACİL – Fırın Durum", from: "Üretim Vardiya Mühendisi", time: "21:42", text: "Sıcak nokta tespit ettim, bölge 4. Duruşa 80 dk var. Acil görüşme lazım." },
      { type: "whatsapp", baslik: "ACİL – Fırın Durum", from: "İş Sağlığı ve Güvenliği Şefi", time: "22:04", text: "Öneri: hızlandırılmış kontrollü soğutma, tam acil durdurma değil. 15 dk içinde başlayabiliriz." },
      { type: "data", baslik: "Termal Tarama (22:03)", rows: [["Kabuk Yüzey Sıcaklığı", "412°C (Kritik Eşik: 450°C)"], ["Sıcaklık Artış Hızı", "+18°C / 30 dk"]] }
    ],
    // Üç Yolun Sınavı: SABİT doğru cevaplar (otomatik puanlanır, bkz. server/routes/sonGece.js)
    ucYolSinavi: [
      {
        yolculuk: "Varoluş Yolumuz",
        kanit: "Sıcak nokta tespit edilir edilmez 3 kişiye AYNI ANDA, net bilgi verildi",
        dogruMiniVakaSira: 3, // Kırık Zincir
        dogruMiniVakaBaslik: "KIRIK ZİNCİR"
      },
      {
        yolculuk: "İş Yapış Yolumuz",
        kanit: "Karar üç kişi tarafından açıkça sahiplenildi",
        dogruMiniVakaSira: 6, // Boş Sandalye
        dogruMiniVakaBaslik: "BOŞ SANDALYE"
      },
      {
        yolculuk: "Gelişme Yolumuz",
        kanit: "Trend verisine bakıldı, kalıcı çözüm planlandı",
        dogruMiniVakaSira: 8, // Görünmeyen Duruş
        dogruMiniVakaBaslik: "GÖRÜNMEYEN DURUŞ"
      }
    ],
    gercekcilikCapasi: "Bu senaryo kurgu ama karar süreci gerçek bir kriz yönetimi pratiğidir."
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

function getMiniVaka(sira, lang) {
  return dataFor(lang).MINI_VAKALAR.find((mv) => mv.sira === Number(sira)) || null;
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
  return dataFor(lang).MINI_VAKALAR.map((mv) => ({
    sira: mv.sira,
    bolum: mv.bolum,
    baslik: mv.baslik
  }));
}

module.exports = {
  BOLUMLER,
  MINI_VAKALAR,
  FINAL,
  getFinal,
  getMiniVaka,
  getBolum,
  getBolumByMiniVaka,
  listMiniVakaMeta
};
