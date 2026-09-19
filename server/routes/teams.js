const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");
const { STAGE_ORDER } = require("../utils/stages");
const { requireAdmin } = require("../utils/adminAuth");
const { newJoinCode } = require("../utils/joinCode");

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
    joinCode: row.join_code || null,
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
    `INSERT INTO teams (id, name, members, current_stage, current_bolum, current_mini_vaka, join_code)
     VALUES (?, ?, ?, 'BRIEFING', 1, 1, ?)`
  ).run(id, name.trim().slice(0, 60), (members || "").trim().slice(0, 300), newJoinCode());

  const row = db.prepare("SELECT * FROM teams WHERE id = ?").get(id);
  res.status(201).json(serializeTeam(row));
});

// Kod tahminine karşı: IP başına 5 dakikada 10 hatalı giriş
const joinFails = new Map();
function joinLocked(ip) {
  const r = joinFails.get(ip);
  if (!r) return false;
  if (Date.now() - r.first > 5 * 60 * 1000) {
    joinFails.delete(ip);
    return false;
  }
  return r.count >= 10;
}
function joinFail(ip) {
  const r = joinFails.get(ip);
  if (!r || Date.now() - r.first > 5 * 60 * 1000) joinFails.set(ip, { count: 1, first: Date.now() });
  else r.count += 1;
}

// POST /api/teams/join  { name, code }  — mevcut bir takıma (başka telefondan / sayfa kapandıktan sonra) katıl
router.post("/join", (req, res) => {
  const ip = req.ip || "unknown";
  if (joinLocked(ip)) {
    return res.status(429).json({ error: "Çok fazla hatalı deneme. Birkaç dakika sonra tekrar deneyin." });
  }
  const name = String(req.body?.name || "").trim().toLowerCase();
  const code = String(req.body?.code || "").replace(/\D/g, "");
  if (!name || code.length !== 4) {
    return res.status(400).json({ error: "Takım adı ve 4 haneli kodu girin." });
  }
  const rows = db.prepare("SELECT * FROM teams WHERE join_code = ?").all(code);
  const row = rows.find((r) => r.name.trim().toLowerCase() === name);
  if (!row) {
    joinFail(ip);
    return res.status(404).json({ error: "Takım adı ya da kod hatalı." });
  }
  joinFails.delete(ip);
  res.json(serializeTeam(row));
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
