const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/session — oyuncu istemcisinin ihtiyaç duyduğu, hassas olmayan oturum ayarları
router.get("/", (req, res) => {
  const cfg = db.prepare("SELECT * FROM session_config WHERE id = 1").get();

  // Oyuncu istemcisi kendi takım kimliğini yollar; duyuruyu aldığı böylece kaydedilir
  const teamId = typeof req.query.teamId === "string" ? req.query.teamId.slice(0, 40) : null;
  if (teamId && cfg?.broadcast_message && cfg?.broadcast_updated_at) {
    db.prepare("UPDATE teams SET seen_broadcast_at = ? WHERE id = ?").run(cfg.broadcast_updated_at, teamId);
  }

  res.json({
    sessionName: cfg?.session_name || "VC Dedektifleri 2.0",
    finalParcaAEnabled: !!cfg?.final_parca_a_enabled,
    caseTimerSeconds: cfg?.case_timer_seconds ?? 180,
    broadcastMessage: cfg?.broadcast_message || null,
    broadcastUpdatedAt: cfg?.broadcast_updated_at || null
  });
});

module.exports = router;

