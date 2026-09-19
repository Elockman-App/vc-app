const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");
const { STAGE_ORDER } = require("../utils/stages");
const { requireAdmin } = require("../utils/adminAuth");

const router = express.Router();

function serializeTeam(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    members: row.members,
    currentStage: row.current_stage,
    currentBolum: row.current_bolum,
    currentMiniVaka: row.current_mini_vaka,
    totalScore: row.total_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// POST /api/teams  { name, members }
router.post("/", (req, res) => {
  const { name, members } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Takım adı zorunludur." });
  }
  const id = nanoid(8);
  db.prepare(
    `INSERT INTO teams (id, name, members, current_stage, current_bolum, current_mini_vaka)
     VALUES (?, ?, ?, 'BRIEFING', 1, 1)`
  ).run(id, name.trim().slice(0, 60), (members || "").trim().slice(0, 300));

  const row = db.prepare("SELECT * FROM teams WHERE id = ?").get(id);
  res.status(201).json(serializeTeam(row));
});

// GET /api/teams  (admin — tüm takımlar)
router.get("/", requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM teams ORDER BY created_at ASC").all();
  res.json(rows.map(serializeTeam));
});

// GET /api/teams/:id
router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM teams WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Takım bulunamadı." });
  res.json(serializeTeam(row));
});

/**
 * PUT /api/teams/:id/stage
 * body: { stage, bolum?, miniVaka? }
 * Doğrusal akışta ilerlemeyi kaydeder. Geri gitme/atlama kontrolü istemcide
 * (Play.jsx state machine) yapılır — sunucu burada sadece geçerli bir stage
 * adı olup olmadığını doğrular.
 */
router.put("/:id/stage", (req, res) => {
  const { stage, bolum, miniVaka } = req.body || {};
  if (!STAGE_ORDER.includes(stage)) {
    return res.status(400).json({ error: "Geçersiz aşama: " + stage });
  }
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(req.params.id);
  if (!team) return res.status(404).json({ error: "Takım bulunamadı." });

  db.prepare(
    `UPDATE teams SET
       current_stage = ?,
       current_bolum = COALESCE(?, current_bolum),
       current_mini_vaka = COALESCE(?, current_mini_vaka),
       updated_at = datetime('now')
     WHERE id = ?`
  ).run(stage, bolum ?? null, miniVaka ?? null, req.params.id);

  const updated = db.prepare("SELECT * FROM teams WHERE id = ?").get(req.params.id);
  res.json(serializeTeam(updated));
});

module.exports = router;
