const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/session — oyuncu istemcisinin ihtiyaç duyduğu, hassas olmayan oturum ayarları
router.get("/", (req, res) => {
  const cfg = db.prepare("SELECT * FROM session_config WHERE id = 1").get();
  res.json({
    sessionName: cfg?.session_name || "VC Dedektifleri 2.0",
    finalParcaAEnabled: !!cfg?.final_parca_a_enabled,
    broadcastMessage: cfg?.broadcast_message || null,
    broadcastUpdatedAt: cfg?.broadcast_updated_at || null
  });
});

module.exports = router;

