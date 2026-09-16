const express = require("express");
const db = require("../db");
const { BOLUMLER, MINI_VAKALAR, getMiniVaka, FINAL } = require("../data/cases");
const { recomputeTotalScore } = require("../utils/scoring");
const { suggestScore } = require("../utils/keywordScore");

const router = express.Router();

const STAGE_LABELS = {
  BRIEFING: "Giriş Brifingi",
  OLAY_ANI: "Olay Anı",
  KANIT_ANI: "Kanıt Anı",
  KARAR_ANI: "Karar Anı",
  ANA_KANIT: "Ana Kanıt",
  FINAL_KILIT: "Final — Kilit",
  FINAL_PARCA_A: "Final — Parça A",
  SON_GECE_ACILIS: "Son Gece",
  SON_GECE_KANIT: "Son Gece — Kanıt",
  SON_GECE_SENTEZ: "Son Gece — Üç Yolun Sınavı",
  KAPANIS: "Kapanış — Tamamladı"
};

// GET /api/admin/overview
router.get("/overview", (req, res) => {
  const teams = db.prepare("SELECT * FROM teams ORDER BY total_score DESC, created_at ASC").all();
  const sessionConfig = db.prepare("SELECT * FROM session_config WHERE id = 1").get();

  const teamData = teams.map((t) => {
    const answeredCount = db
      .prepare("SELECT COUNT(*) AS n FROM team_answers WHERE team_id = ?")
      .get(t.id).n;
    return {
      id: t.id,
      name: t.name,
      members: t.members,
      currentStage: t.current_stage,
      stageLabel: STAGE_LABELS[t.current_stage] || t.current_stage,
      currentBolum: t.current_bolum,
      currentMiniVaka: t.current_mini_vaka,
      totalScore: t.total_score,
      answeredCount,
      createdAt: t.created_at
    };
  });

  res.json({
    sessionName: sessionConfig?.session_name || "VC Dedektifleri 2.0",
    finalParcaAEnabled: !!sessionConfig?.final_parca_a_enabled,
    teamCount: teamData.length,
    teams: teamData,
    bolumler: BOLUMLER.map((b) => ({ num: b.num, baslik: b.baslik, anaKanit: b.anaKanit }))
  });
});

/**
 * GET /api/admin/queue
 * Facilitator'ün puan vermesi gereken tüm bekleyen öğeleri tek listede döner:
 *   - mini vaka Karar Anı cevapları (score IS NULL)
 *   - Final Parça A teşhisleri (text var, score yok)
 * Ana Kanıt sentez puanları ayrı, çok kısa bir listede döner (§ aşağıda).
 */
router.get("/queue", (req, res) => {
  const pendingAnswers = db
    .prepare(
      `SELECT ta.id, ta.team_id, t.name AS team_name, ta.mini_vaka_sira, ta.answer_text, ta.submitted_at
       FROM team_answers ta JOIN teams t ON t.id = ta.team_id
       WHERE ta.score IS NULL ORDER BY ta.submitted_at ASC`
    )
    .all()
    .map((row) => {
      const mv = getMiniVaka(row.mini_vaka_sira);
      const rawSuggestion = suggestScore(row.answer_text, mv?.dogruCozum);
      return {
        type: "MINI_VAKA",
        answerId: row.id,
        teamId: row.team_id,
        teamName: row.team_name,
        miniVakaSira: row.mini_vaka_sira,
        miniVakaBaslik: mv?.baslik,
        answerText: row.answer_text,
        dogruCozum: mv?.dogruCozum,
        submittedAt: row.submitted_at,
        maxScore: 100,
        // Yerel/çevrimdışı kelime-örtüşme önerisi (0-100) — yapay zeka değil,
        // sadece Oyun Yöneticisi için bir başlangıç noktası. null olabilir.
        suggestedScore: rawSuggestion
      };
    });

  const pendingFinalA = db
    .prepare(
      `SELECT fp.team_id, t.name AS team_name, fp.parca_a_text, fp.parca_a_submitted_at
       FROM final_progress fp JOIN teams t ON t.id = fp.team_id
       WHERE fp.parca_a_text IS NOT NULL AND fp.parca_a_score IS NULL
       ORDER BY fp.parca_a_submitted_at ASC`
    )
    .all()
    .map((row) => {
      const rawSuggestion = suggestScore(row.parca_a_text, FINAL.parcaA.dogruCozumReferansi);
      return {
        type: "FINAL_PARCA_A",
        teamId: row.team_id,
        teamName: row.team_name,
        answerText: row.parca_a_text,
        submittedAt: row.parca_a_submitted_at,
        maxScore: 90,
        // 0-100 ölçeğindeki öneriyi 90 puanlık tavana orantılıyoruz
        suggestedScore: rawSuggestion !== null ? Math.round((rawSuggestion / 100) * 90) : null
      };
    });

  const anaKanitPending = db
    .prepare(
      `SELECT akp.team_id, t.name AS team_name, akp.harf, akp.revealed_at
       FROM ana_kanit_progress akp JOIN teams t ON t.id = akp.team_id
       WHERE akp.score IS NULL ORDER BY akp.revealed_at ASC`
    )
    .all()
    .map((row) => ({
      type: "ANA_KANIT",
      teamId: row.team_id,
      teamName: row.team_name,
      harf: row.harf,
      revealedAt: row.revealed_at,
      maxScore: 30
    }));

  res.json({ pendingAnswers, pendingFinalA, anaKanitPending });
});

// PUT /api/admin/answers/:answerId/score   { score }
router.put("/answers/:answerId/score", (req, res) => {
  const { answerId } = req.params;
  const score = Math.max(0, Math.min(100, Number(req.body?.score) || 0));

  const row = db.prepare("SELECT * FROM team_answers WHERE id = ?").get(answerId);
  if (!row) return res.status(404).json({ error: "Cevap bulunamadı." });

  db.prepare(
    "UPDATE team_answers SET score = ?, scored_at = datetime('now') WHERE id = ?"
  ).run(score, answerId);

  const totalScore = recomputeTotalScore(row.team_id);
  res.json({ ok: true, score, totalScore });
});

// PUT /api/admin/session  { name?, finalParcaAEnabled? }
router.put("/session", (req, res) => {
  const { name, finalParcaAEnabled } = req.body || {};
  if (name !== undefined) {
    db.prepare("UPDATE session_config SET session_name = ? WHERE id = 1").run(
      name.trim().slice(0, 80) || "VC Dedektifleri 2.0"
    );
  }
  if (finalParcaAEnabled !== undefined) {
    db.prepare("UPDATE session_config SET final_parca_a_enabled = ? WHERE id = 1").run(
      finalParcaAEnabled ? 1 : 0
    );
  }
  const cfg = db.prepare("SELECT * FROM session_config WHERE id = 1").get();
  res.json({ sessionName: cfg.session_name, finalParcaAEnabled: !!cfg.final_parca_a_enabled });
});

// POST /api/admin/broadcast  { message }
router.post("/broadcast", (req, res) => {
  const message = (req.body?.message || "").trim();
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE session_config SET broadcast_message = ?, broadcast_updated_at = ? WHERE id = 1"
  ).run(message || null, now);

  res.json({ ok: true, broadcastMessage: message, broadcastUpdatedAt: now });
});

// GET /api/admin/export-csv — tüm takımların puan ve detaylarını Excel uyumlu UTF-8 CSV olarak indirir
router.get("/export-csv", (req, res) => {
  const teams = db.prepare("SELECT * FROM teams ORDER BY total_score DESC").all();

  // Excel UTF-8 tanıma (BOM)
  let csv = "\uFEFFTakim ID;Takim Adi;Uyeler;Asama;Bolum;Mini Vaka;Toplam Puan;Kayit Tarihi\n";

  teams.forEach((t) => {
    const stageLabel = STAGE_LABELS[t.current_stage] || t.current_stage;
    const name = `"${(t.name || "").replace(/"/g, '""')}"`;
    const members = `"${(t.members || "").replace(/"/g, '""')}"`;
    csv += `${t.id};${name};${members};${stageLabel};${t.current_bolum};${t.current_mini_vaka || "-"};${t.total_score};${t.created_at}\n`;
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="vc_dedektifleri_skor_raporu.csv"');
  res.send(csv);
});

// POST /api/admin/reset — tüm takımları ve ilerlemeyi siler (oturum ayarları kalır)
router.post("/reset", (req, res) => {
  db.prepare("DELETE FROM team_answers").run();
  db.prepare("DELETE FROM ana_kanit_progress").run();
  db.prepare("DELETE FROM final_progress").run();
  db.prepare("DELETE FROM son_gece_answers").run();
  db.prepare("DELETE FROM teams").run();
  res.json({ ok: true });
});

module.exports = router;

