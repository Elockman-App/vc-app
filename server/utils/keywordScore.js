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
  return (text || "")
    .toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function extractKeywords(referansMetin) {
  const words = normalize(referansMetin);
  const meaningful = words.filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  return [...new Set(meaningful)];
}

/**
 * @returns {number} 0-100 arası öneri puanı (yüzde kaç anahtar kelime eşleşti)
 */
function suggestScore(answerText, referansMetin) {
  const keywords = extractKeywords(referansMetin);
  if (keywords.length === 0) return null;

  const answerWords = new Set(normalize(answerText));
  const matched = keywords.filter((k) => answerWords.has(k));

  const ratio = matched.length / keywords.length;
  return Math.round(ratio * 100);
}

module.exports = { suggestScore, extractKeywords, normalize };
