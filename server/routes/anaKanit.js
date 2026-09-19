const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");
const { getBolum } = require("../data/cases");
const { langOf } = require("../utils/lang");
const { recomputeTotalScore } = require("../utils/scoring");
const { requireAdmin } = require("../utils/adminAuth");
const { parseScore } = require("../utils/parseScore");

const router = express.Router();

// POST /api/ana-kanit/:harf/reveal   { teamId, bolumNum }
router.post("/:harf/reveal", (req, res) => {
  const harf = (req.params.harf || "").toUpperCase();
  if (!["A", "B", "C"].includes(harf)) {
    return res.status(400).json({ error: "Geçersiz Ana Kanıt harfi." });
  }
  const { teamId, bolumNum } = req.body || {};
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(teamId);
  if (!team) return res.status(404).json({ error: "Takım bulunamadı." });

  const bolum = getBolum(bolumNum, langOf(req));
  if (!bolum || bolum.anaKanit.harf !== harf) {
    return res.status(400).json({ error: "Bölüm/harf eşleşmiyor." });
  }

  const existing = db
    .prepare("SELECT * FROM ana_kanit_progress WHERE team_id = ? AND harf = ?")
    .get(teamId, harf);
  if (!existing) {
    db.prepare(
      `INSERT INTO ana_kanit_progress (id, team_id, harf) VALUES (?, ?, ?)`
    ).run(nanoid(10), teamId, harf);
  }

  res.json({ kod: bolum.anaKanit.kod, notParcasi: bolum.anaKanit.notParcasi });
});

// ---- FACİLİTATÖR (ADMİN) PUANLAMA ----
// PUT /api/ana-kanit/admin/:teamId/:harf/score   { score }
router.put("/admin/:teamId/:harf/score", requireAdmin, (req, res) => {
  const { teamId, harf } = req.params;
  const parsed = parseScore(req.body?.score, 30);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const score = parsed.score;

  const row = db
    .prepare("SELECT * FROM ana_kanit_progress WHERE team_id = ? AND harf = ?")
    .get(teamId, harf.toUpperCase());
  if (!row) return res.status(404).json({ error: "Bu takım henüz bu Ana Kanıt'ı görmedi." });

  db.prepare(
    "UPDATE ana_kanit_progress SET score = ?, scored_at = datetime('now') WHERE team_id = ? AND harf = ?"
  ).run(score, teamId, harf.toUpperCase());

  const totalScore = recomputeTotalScore(teamId);
  res.json({ ok: true, score, totalScore });
});

module.exports = router;
