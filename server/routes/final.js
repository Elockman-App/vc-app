const express = require("express");
const db = require("../db");
const { FINAL } = require("../data/cases");
const { recomputeTotalScore } = require("../utils/scoring");
const { requireAdmin } = require("../utils/adminAuth");
const { parseScore } = require("../utils/parseScore");

const router = express.Router();

function ensureRow(teamId) {
  const existing = db.prepare("SELECT * FROM final_progress WHERE team_id = ?").get(teamId);
  if (!existing) {
    db.prepare("INSERT INTO final_progress (team_id) VALUES (?)").run(teamId);
  }
}

// POST /api/final/unlock   { teamId, code }
// 3 kodun (471-295-836) birleşimini kabul eder — tireli/tiresiz her iki format da olur.
router.post("/unlock", (req, res) => {
  const { teamId, code } = req.body || {};
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(teamId);
  if (!team) return res.status(404).json({ error: "Takım bulunamadı." });

  const normalized = String(code || "").replace(/[^0-9]/g, "");
  if (normalized !== FINAL.kilitKodu) {
    return res.status(400).json({ ok: false, error: "Kod hatalı, tekrar deneyin." });
  }

  ensureRow(teamId);
  db.prepare(
    `UPDATE final_progress SET kilit_acildi_mi = 1, kilit_acilis_zamani = datetime('now')
     WHERE team_id = ?`
  ).run(teamId);

  res.json({ ok: true, notTam: FINAL.notTam });
});

// POST /api/final/parca-a   { teamId, text }
router.post("/parca-a", (req, res) => {
  const { teamId, text } = req.body || {};
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(teamId);
  if (!team) return res.status(404).json({ error: "Takım bulunamadı." });
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Teşhis metni boş olamaz." });
  }

  ensureRow(teamId);
  const prev = db.prepare("SELECT parca_a_text FROM final_progress WHERE team_id = ?").get(teamId);
  if (prev && prev.parca_a_text) {
    // İlk gönderim kalıcıdır (referansı gördükten sonra değiştirilemez)
    return res.json({ saved: true, already: true, dogruCozumReferansi: FINAL.parcaA.dogruCozumReferansi });
  }
  db.prepare(
    `UPDATE final_progress SET parca_a_text = ?, parca_a_submitted_at = datetime('now')
     WHERE team_id = ?`
  ).run(text.trim().slice(0, 1000), teamId);

  res.json({ saved: true, dogruCozumReferansi: FINAL.parcaA.dogruCozumReferansi });
});

// GET /api/final/:teamId  — bir takımın Final ilerlemesi
router.get("/:teamId", (req, res) => {
  const row = db.prepare("SELECT * FROM final_progress WHERE team_id = ?").get(req.params.teamId);
  res.json(
    row || { team_id: req.params.teamId, kilit_acildi_mi: 0, parca_a_text: null, parca_a_score: null }
  );
});

// ---- FACİLİTATÖR (ADMİN) PUANLAMA ----
// PUT /api/final/admin/:teamId/parca-a/score   { score }
router.put("/admin/:teamId/parca-a/score", requireAdmin, (req, res) => {
  const { teamId } = req.params;
  const parsed = parseScore(req.body?.score, 90);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const score = parsed.score;

  ensureRow(teamId);
  db.prepare(
    "UPDATE final_progress SET parca_a_score = ?, parca_a_scored_at = datetime('now') WHERE team_id = ?"
  ).run(score, teamId);

  const totalScore = recomputeTotalScore(teamId);
  res.json({ ok: true, score, totalScore });
});

module.exports = router;
