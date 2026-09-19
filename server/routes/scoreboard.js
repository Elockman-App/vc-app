const express = require("express");
const db = require("../db");

const router = express.Router();

// İlerleme yüzdesi (yönetim panelindeki hesapla aynı: 35 adım)
const TOTAL = 35;
const FINAL_STEPS = {
  FINAL_KILIT: 30,
  FINAL_PARCA_A: 31,
  SON_GECE_ACILIS: 32,
  SON_GECE_KANIT: 33,
  SON_GECE_SENTEZ: 34,
  KAPANIS: 35
};

function progress(t) {
  const st = t.current_stage;
  if (st in FINAL_STEPS) return Math.round((FINAL_STEPS[st] / TOTAL) * 100);
  if (st === "BRIEFING") return 0;
  const base = ((t.current_bolum || 1) - 1) * 10;
  const k = ((t.current_mini_vaka || 1) - 1) % 3;
  let within = 0;
  if (st === "OLAY_ANI") within = k * 3;
  else if (st === "KANIT_ANI") within = k * 3 + 1;
  else if (st === "KARAR_ANI") within = k * 3 + 2;
  else if (st === "ANA_KANIT") within = 9;
  return Math.min(100, Math.round(((base + within) / TOTAL) * 100));
}

function where(t) {
  const st = t.current_stage;
  if (st === "BRIEFING") return { key: "brief" };
  if (st === "KAPANIS") return { key: "done" };
  if (st.startsWith("FINAL")) return { key: "final" };
  if (st.startsWith("SON_GECE")) return { key: "night" };
  return { key: "case", bolum: t.current_bolum || 1, miniVaka: t.current_mini_vaka || 1 };
}

// GET /api/scoreboard — herkese açık canlı skor tablosu (projeksiyon için).
// Puanlar gizliyken ne puan ne sıralama dönmez; sadece ilerleme görünür.
router.get("/", (req, res) => {
  const cfg = db.prepare("SELECT * FROM session_config WHERE id = 1").get();
  const hidden = !!cfg?.scoreboard_hidden;
  const rows = db
    .prepare(hidden ? "SELECT * FROM teams ORDER BY created_at ASC" : "SELECT * FROM teams ORDER BY total_score DESC, created_at ASC")
    .all();
  res.json({
    sessionName: cfg?.session_name || "VC Dedektifleri 2.0",
    hidden,
    serverTime: new Date().toISOString(),
    teams: rows.map((t) => ({
      name: t.name,
      progress: progress(t),
      where: where(t),
      score: hidden ? null : t.total_score
    }))
  });
});

module.exports = router;
