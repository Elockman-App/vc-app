// Sadece görsel/etiket amaçlı, hassas olmayan veri (kod/not parçası içermez —
// bunlar yalnızca sunucudan reveal endpoint'i ile gelir).
const TEXTS = {
  tr: [
    {
      baslik: "BİZİM VAROLUŞ YOLUMUZ",
      degerler: ["İş Sağlığı ve Güvenliği", "Etik ve Çeşitlilik", "Açık İletişim"],
      facilitatorAcilis: "İlk dosya kutusu önünüzde. Üçü de küçük olaylar. İç Denetim bunları neden bir araya koydu?"
    },
    {
      baslik: "BİZİM İŞ YAPIŞ YOLUMUZ",
      degerler: ["Müşteri Odaklılık", "Güven ve Sadelik", "Sorumluluk Bilinci ile Hareket"],
      facilitatorAcilis: "İkinci kutu farklı bir aileden: burada kimse bir şeyi saklamıyor. Peki sorun nerede?"
    },
    {
      baslik: "BİZİM GELİŞME YOLUMUZ",
      degerler: ["Öğrenme ve Gelişme", "Kalıcı Çözümler", "Sürdürülebilir Miras"],
      facilitatorAcilis: "Son kutu en eskilerini içeriyor. Soru artık 'ne oldu' değil, 'neden bu kadar uzun sürdü'."
    }
  ],
  en: [
    {
      baslik: "OUR WAY OF BEING",
      degerler: ["Occupational Health and Safety", "Ethics and Diversity", "Open Communication"],
      facilitatorAcilis: "The first case box is in front of you. All three are small incidents. Why did Internal Audit put them together?"
    },
    {
      baslik: "OUR WAY OF DOING BUSINESS",
      degerler: ["Customer Focus", "Trust and Simplicity", "Acting with a Sense of Responsibility"],
      facilitatorAcilis: "The second box comes from a different family: here, nobody is hiding anything. So where is the problem?"
    },
    {
      baslik: "OUR WAY OF DEVELOPING",
      degerler: ["Learning and Development", "Lasting Solutions", "Sustainable Legacy"],
      facilitatorAcilis: "The last box holds the oldest files. The question is no longer 'what happened', but 'why did it take so long'."
    }
  ]
};

const BASE = [
  { num: 1, accent: "3B6EA8", heroGorsel: "bolum1.jpg" },
  { num: 2, accent: "B8863B", heroGorsel: "bolum2.jpg" },
  { num: 3, accent: "3B8A6E", heroGorsel: "bolum3.jpg" }
];

// Varsayılan dil Türkçe (admin paneli vb. eski çağrılar aynen çalışır)
export function getBolumMeta(num, lang = "tr") {
  const i = Math.max(0, BASE.findIndex((b) => b.num === Number(num)));
  const texts = (TEXTS[lang] || TEXTS.tr)[i];
  return { ...BASE[i], ...texts };
}

export const BOLUMLER_META = BASE.map((b, i) => ({ ...b, ...TEXTS.tr[i] }));
