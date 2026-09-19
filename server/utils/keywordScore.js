/**
 * YEREL/ÇEVRİMDIŞI PUAN ÖNERİSİ
 *
 * Bu bir yapay zeka DEĞİLDİR — internet bağlantısı gerektirmez, dışarıya hiçbir
 * istek atmaz. "Doğru Çözüm" referans metnindeki anlamlı kelimelerin, takımın
 * yazdığı cevapta ne oranda geçtiğine bakan basit bir kelime-örtüşme
 * hesabıdır. Amaç, Oyun Yöneticisi'ne bir BAŞLANGIÇ noktası vermektir —
 * nihai puanı her zaman Oyun Yöneticisi verir, bu sadece bir öneridir.
 */

const STOPWORDS = new Set([
  "ve", "bir", "bu", "şu", "o", "ile", "için", "ama", "çok", "da", "de", "ki",
  "mi", "mı", "mu", "mü", "gibi", "olan", "olarak", "her", "ne", "ya", "veya",
  "çünkü", "ancak", "ise", "daha", "en", "hem", "kadar", "sonra", "önce",
  "değil", "yani", "diye", "hep", "bile", "artık", "tüm", "tam", "her",
  "bunun", "bunu", "buna", "onun", "onu", "ona", "kendi", "göre", "üzere"
]);

function normalize(text) {
  return String(text || "")
    // Büyük İ/I: toLowerCase() "İ"yi "i" + birleşik nokta yapıp kelimeyi ikiye bölüyordu ("İş" -> "i s")
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Türkçe eklemeli bir dildir ("sistem", "sisteme", "sistemin"): kelimeleri ilk 5 harfle (kök) karşılaştırırız.
const STEM_LEN = 5;
function stem(word) {
  return word.length > STEM_LEN ? word.slice(0, STEM_LEN) : word;
}

function extractKeywords(referansMetin) {
  const words = normalize(referansMetin);
  const meaningful = words.filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  return [...new Set(meaningful)];
}

// Referanstaki anahtar kelimelerin bu oranı cevapta geçerse "tam puan" önerilir.
// (İyi bir cevap referans metni kelime kelime tekrarlamaz, o yüzden tavanı %45'e çektik.)
const FULL_SCORE_RATIO = 0.45;

/**
 * @returns {number|null} 0-100 arası, 5'in katı olan öneri puanı
 *   - Anahtar kelimeler kök (ilk 5 harf) üzerinden eşleştirilir.
 *   - Çok kısa cevaplar (1-2 kelime en fazla 15, 3-5 kelime en fazla 50) sınırlanır.
 */
function suggestScore(answerText, referansMetin) {
  const keywords = extractKeywords(referansMetin);
  if (keywords.length === 0) return null;

  const answerWords = normalize(answerText);
  if (answerWords.length === 0) return 0;

  const answerStems = new Set(answerWords.map(stem));
  const matched = keywords.filter((k) => answerStems.has(stem(k)));

  const ratio = matched.length / keywords.length;
  let score = Math.min(100, (ratio / FULL_SCORE_RATIO) * 100);

  if (answerWords.length < 3) score = Math.min(score, 15);
  else if (answerWords.length < 6) score = Math.min(score, 50);

  return Math.round(score / 5) * 5;
}

module.exports = { suggestScore, extractKeywords, normalize, stem };
