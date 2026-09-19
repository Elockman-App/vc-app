const express = require("express");
const db = require("../db");
const { FINAL, getFinal, getMiniVaka } = require("../data/cases");
const { langOf } = require("../utils/lang");
const { recomputeTotalScore } = require("../utils/scoring");

const router = express.Router();

// GET /api/son-gece  — sahne verisi (zaman çizelgesi + kanıtlar + boş sınav satırları)
router.get("/", (req, res) => {
  const FINAL = getFinal(langOf(req));
  res.json({
    lokasyon: FINAL.sonGece.lokasyon,
    zamanCizelgesi: FINAL.sonGece.zamanCizelgesi,
    kanitAni: FINAL.sonGece.kanitAni,
    gercekcilikCapasi: FINAL.sonGece.gercekcilikCapasi,
    // Doğru cevaplar İSTEMCİYE gönderilmez — sadece soru metinleri (yolculuk/kanıt) gider.
    ucYolSinavi: FINAL.sonGece.ucYolSinavi.map((r) => ({ yolculuk: r.yolculuk, kanit: r.kanit }))
  });
});

// POST /api/son-gece/sentez   { teamId, satir1, satir2, satir3 }  (her biri 1-9 mini vaka sırası)
// OTOMATİK PUANLANIR — tek otomatik-puanlı karar ekranı (bkz. Plan §5.4)
router.post("/sentez", (req, res) => {
  const { teamId, satir1, satir2, satir3 } = req.body || {};
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(teamId);
  if (!team) return res.status(404).json({ error: "Takım bulunamadı." });

  const FINAL_L = getFinal(langOf(req));
  const dogrular = FINAL.sonGece.ucYolSinavi.map((r) => r.dogruMiniVakaSira);

  // İlk gönderim kalıcıdır: doğru cevapları gördükten sonra tekrar denenemez.
  const existing = db.prepare("SELECT * FROM son_gece_answers WHERE team_id = ?").get(teamId);
  const already = !!existing;
  const cevaplar = existing
    ? [existing.satir1_mini_vaka, existing.satir2_mini_vaka, existing.satir3_mini_vaka].map(Number)
    : [Number(satir1), Number(satir2), Number(satir3)];

  let score = 0;
  const lang = langOf(req);
  const detay = FINAL_L.sonGece.ucYolSinavi.map((r, i) => {
    const correct = cevaplar[i] === dogrular[i];
    if (correct) score += 40;
    return {
      yolculuk: r.yolculuk,
      seciminiz: cevaplar[i],
      dogruMiniVakaSira: r.dogruMiniVakaSira,
      // Panelden başlık düzenlenmiş olabilir: güncel başlığı kullan
      dogruMiniVakaBaslik: getMiniVaka(r.dogruMiniVakaSira, lang)?.baslik || r.dogruMiniVakaBaslik,
      correct
    };
  });

  if (!existing) {
    db.prepare(
      `INSERT INTO son_gece_answers (team_id, satir1_mini_vaka, satir2_mini_vaka, satir3_mini_vaka, score, submitted_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    ).run(teamId, cevaplar[0], cevaplar[1], cevaplar[2], score);
  }

  const totalScore = recomputeTotalScore(teamId);
  res.json({ score, maxScore: 120, detay, totalScore, already });
});

module.exports = router;
