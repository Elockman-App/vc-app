const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");
const { getMiniVaka, getBolumByMiniVaka, listMiniVakaMeta } = require("../data/cases");
const { langOf } = require("../utils/lang");

const router = express.Router();

// GET /api/mini-vaka  — 9 vakanın kısa listesi (Son Gece eşleştirme ekranı için)
router.get("/", (req, res) => {
  res.json(listMiniVakaMeta(langOf(req)));
});

/**
 * Oyuncuya gönderilen mini vaka verisi — `dogruCozum` ve `finalIcgorusu`
 * BİLEREK dışarıda bırakılır (cevap anahtarı niteliğinde). Bu ikisi yalnızca
 * takım cevabını gönderdikten SONRA, tek seferlik bir "reveal" olarak
 * POST /answer yanıtında döner (bkz. aşağı).
 */
function publicMiniVaka(mv) {
  const { dogruCozum, finalIcgorusu, ...rest } = mv;
  return rest;
}

// GET /api/mini-vaka/:sira
router.get("/:sira", (req, res) => {
  const lang = langOf(req);
  const mv = getMiniVaka(req.params.sira, lang);
  if (!mv) return res.status(404).json({ error: "Mini vaka bulunamadı." });
  const bolum = getBolumByMiniVaka(req.params.sira, lang);
  res.json({ ...publicMiniVaka(mv), bolumBaslik: bolum?.baslik, bolumAccent: bolum?.accent });
});

// POST /api/mini-vaka/:sira/answer   { teamId, answerText }
router.post("/:sira/answer", (req, res) => {
  const mv = getMiniVaka(req.params.sira, langOf(req));
  if (!mv) return res.status(404).json({ error: "Mini vaka bulunamadı." });

  const { teamId, answerText } = req.body || {};
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(teamId);
  if (!team) return res.status(404).json({ error: "Takım bulunamadı." });
  if (!answerText || !answerText.trim()) {
    return res.status(400).json({ error: "Cevap metni boş olamaz." });
  }

  const existing = db
    .prepare("SELECT * FROM team_answers WHERE team_id = ? AND mini_vaka_sira = ?")
    .get(teamId, mv.sira);

  // İlk gönderilen cevap kalıcıdır: referans çözümü gördükten sonra sayfayı
  // yenileyip cevabı değiştirmek (kopyalamak) mümkün olmasın.
  if (existing) {
    return res.json({
      saved: true,
      already: true,
      dogruCozum: mv.dogruCozum,
      finalIcgorusu: mv.finalIcgorusu
    });
  }
  db.prepare(
    `INSERT INTO team_answers (id, team_id, mini_vaka_sira, answer_text)
     VALUES (?, ?, ?, ?)`
  ).run(nanoid(10), teamId, mv.sira, answerText.trim().slice(0, 2000));

  // Takıma anında "referans çözüm" gösterilir (kendi kendine değerlendirme için);
  // gerçek puanı facilitator admin panelinden ayrıca girer.
  res.json({
    saved: true,
    dogruCozum: mv.dogruCozum,
    finalIcgorusu: mv.finalIcgorusu
  });
});

module.exports = router;
