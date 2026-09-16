// Sadece görsel/etiket amaçlı, hassas olmayan veri (kod/not parçası içermez —
// bunlar yalnızca sunucudan reveal endpoint'i ile gelir).
export const BOLUMLER_META = [
  {
    num: 1,
    baslik: "BİZİM VAROLUŞ YOLUMUZ",
    degerler: ["İş Sağlığı ve Güvenliği", "Etik ve Çeşitlilik", "Açık İletişim"],
    accent: "3B6EA8",
    heroGorsel: "bolum1.jpg",
    facilitatorAcilis: "İlk dosya kutusu önünüzde. Üçü de küçük olaylar. İç Denetim bunları neden bir araya koydu?"
  },
  {
    num: 2,
    baslik: "BİZİM İŞ YAPIŞ YOLUMUZ",
    degerler: ["Müşteri Odaklılık", "Güven ve Sadelik", "Sorumluluk Bilinci ile Hareket"],
    accent: "B8863B",
    heroGorsel: "bolum2.jpg",
    facilitatorAcilis: "İkinci kutu farklı bir aileden: burada kimse bir şeyi saklamıyor. Peki sorun nerede?"
  },
  {
    num: 3,
    baslik: "BİZİM GELİŞME YOLUMUZ",
    degerler: ["Öğrenme ve Gelişme", "Kalıcı Çözümler", "Sürdürülebilir Miras"],
    accent: "3B8A6E",
    heroGorsel: "bolum3.jpg",
    facilitatorAcilis: "Son kutu en eskilerini içeriyor. Soru artık 'ne oldu' değil, 'neden bu kadar uzun sürdü'."
  }
];

export function getBolumMeta(num) {
  return BOLUMLER_META.find((b) => b.num === Number(num)) || BOLUMLER_META[0];
}
