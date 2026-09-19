const express = require("express");
const db = require("../db");
const { BOLUMLER, MINI_VAKALAR, getMiniVaka, FINAL } = require("../data/cases");
const { recomputeTotalScore } = require("../utils/scoring");
const { suggestScore } = require("../utils/keywordScore");
const { requireAdmin, loginHandler } = require("../utils/adminAuth");
const { parseScore } = require("../utils/parseScore");
const { backupAll } = require("../utils/backup");

const router = express.Router();

// Giriş herkese açık; bunun altındaki TÜM admin rotaları PIN ile alınan token ister.
router.post("/login", loginHandler);
router.use(requireAdmin);

// GET /api/admin/check — geçerli token var mı? (istemci açılışta oturumu doğrular)
router.get("/check", (req, res) => res.json({ ok: true }));

// CSV hücresi: tırnaklar kaçırılır; =, +, -, @ ile başlayan metinler Excel'de formül olarak
// çalışmasın diye başına ' eklenir (CSV/formül enjeksiyonu koruması).
function csvCell(value) {
  let v = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
  return `"${v.replace(/"/g, '""')}"`;
}

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

/**
 * GET /api/admin/scored
 * Daha önce puanlanmış her şeyi döner; facilitator yanlış girdiği puanı buradan düzeltir.
 */
router.get("/scored", (req, res) => {
  const answers = db
    .prepare(
      `SELECT ta.id, ta.team_id, t.name AS team_name, ta.mini_vaka_sira, ta.answer_text, ta.score, ta.scored_at
       FROM team_answers ta JOIN teams t ON t.id = ta.team_id
       WHERE ta.score IS NOT NULL ORDER BY ta.scored_at DESC, ta.rowid DESC`
    )
    .all()
    .map((row) => {
      const mv = getMiniVaka(row.mini_vaka_sira);
      return {
        type: "MINI_VAKA",
        answerId: row.id,
        teamId: row.team_id,
        teamName: row.team_name,
        miniVakaSira: row.mini_vaka_sira,
        miniVakaBaslik: mv?.baslik,
        answerText: row.answer_text,
        dogruCozum: mv?.dogruCozum,
        score: row.score,
        scoredAt: row.scored_at,
        maxScore: 100
      };
    });

  const finalA = db
    .prepare(
      `SELECT fp.team_id, t.name AS team_name, fp.parca_a_text, fp.parca_a_score, fp.parca_a_scored_at
       FROM final_progress fp JOIN teams t ON t.id = fp.team_id
       WHERE fp.parca_a_score IS NOT NULL ORDER BY fp.parca_a_scored_at DESC`
    )
    .all()
    .map((row) => ({
      type: "FINAL_PARCA_A",
      teamId: row.team_id,
      teamName: row.team_name,
      answerText: row.parca_a_text,
      score: row.parca_a_score,
      scoredAt: row.parca_a_scored_at,
      maxScore: 90
    }));

  const anaKanit = db
    .prepare(
      `SELECT akp.team_id, t.name AS team_name, akp.harf, akp.score, akp.scored_at
       FROM ana_kanit_progress akp JOIN teams t ON t.id = akp.team_id
       WHERE akp.score IS NOT NULL ORDER BY akp.scored_at DESC`
    )
    .all()
    .map((row) => ({
      type: "ANA_KANIT",
      teamId: row.team_id,
      teamName: row.team_name,
      harf: row.harf,
      score: row.score,
      scoredAt: row.scored_at,
      maxScore: 30
    }));

  res.json({ answers, finalA, anaKanit });
});

// PUT /api/admin/answers/:answerId/score   { score }  (yeniden puanlama da bu rotayı kullanır)
router.put("/answers/:answerId/score", (req, res) => {
  const { answerId } = req.params;
  const parsed = parseScore(req.body?.score, 100);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const score = parsed.score;

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
      String(name).trim().slice(0, 80) || "VC Dedektifleri 2.0"
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

// POST /api/admin/broadcast  { message }  — boş mesaj, yayındaki duyuruyu kaldırır
router.post("/broadcast", (req, res) => {
  const message = String(req.body?.message || "").trim().slice(0, 300);
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
    const name = csvCell(t.name);
    const members = csvCell(t.members);
    csv += `${t.id};${name};${members};${stageLabel};${t.current_bolum};${t.current_mini_vaka || "-"};${t.total_score};${t.created_at}\n`;
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="vc_dedektifleri_skor_raporu.csv"');
  res.send(csv);
});

// POST /api/admin/reset  { confirm: "SIFIRLA" }
// Tüm takımları ve ilerlemeyi siler. Silmeden önce otomatik JSON yedeği alınır;
// yayındaki duyuru da temizlenir. Oturum ayarları (ad, Final Parça A) kalır.
router.post("/reset", (req, res) => {
  if (req.body?.confirm !== "SIFIRLA") {
    return res.status(400).json({ error: 'Onay için "SIFIRLA" yazılmalıdır.' });
  }
  let backup;
  try {
    backup = backupAll("oturum-sifirlama");
  } catch (e) {
    // Yedek alınamadıysa veriyi ASLA silme.
    return res.status(500).json({ error: "Yedek alınamadığı için sıfırlama iptal edildi: " + e.message });
  }
  db.prepare("DELETE FROM team_answers").run();
  db.prepare("DELETE FROM ana_kanit_progress").run();
  db.prepare("DELETE FROM final_progress").run();
  db.prepare("DELETE FROM son_gece_answers").run();
  db.prepare("DELETE FROM teams").run();
  db.prepare(
    "UPDATE session_config SET broadcast_message = NULL, broadcast_updated_at = ? WHERE id = 1"
  ).run(new Date().toISOString());
  res.json({ ok: true, backupFile: backup.fileName, backedUpTeams: backup.teamCount });
});

module.exports = router;

