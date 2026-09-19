/**
 * Facilitator puanını doğrular. Boş / sayı olmayan / aralık dışı değerleri
 * sessizce 0'a çevirmek yerine reddeder (eski davranış: `Number(x) || 0`).
 * Dönüş: { score } veya { error }
 */
function parseScore(raw, max) {
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) {
    return { error: "Puan boş olamaz." };
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) return { error: "Puan sayı olmalıdır." };
  if (n < 0 || n > max) return { error: `Puan 0 ile ${max} arasında olmalıdır.` };
  return { score: Math.round(n) };
}

module.exports = { parseScore };
