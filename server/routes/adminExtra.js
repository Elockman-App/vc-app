const express = require("express");
const db = require("../db");
const { BOLUMLER, getMiniVaka } = require("../data/cases");
const { requireAdmin } = require("../utils/adminAuth");
const { editableView, saveOverride, clearOverride } = require("../utils/contentStore");

/**
 * Yönetici (admin) ek rotaları: vaka tartışma görünümü, etkinlik sonuç raporu, vaka metni düzenleme.
 * admin.js ile aynı /api/admin altında çalışır ve aynı PIN'li oturumu ister.
 */
const router = express.Router();
router.use(requireAdmin);

const SIRALAR = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// GET /api/admin/discussion — her mini vaka için: soru, referans çözüm ve tüm takımların cevapları
router.get("/discussion", (req, res) => {
  const rows = db
    .prepare(
      `SELECT ta.mini_vaka_sira AS sira, ta.answer_text, ta.score, t.name AS team_name, ta.submitted_at
       FROM team_answers ta JOIN teams t ON t.id = ta.team_id
       ORDER BY ta.submitted_at ASC`
    )
    .all();
  res.json({
    cases: SIRALAR.map((sira) => {
      const mv = getMiniVaka(sira, "tr");
      return {
        sira,
        bolum: mv.bolum,
        baslik: mv.baslik,
        kararSorusu: mv.kararSorusu,
        dogruCozum: mv.dogruCozum,
        answers: rows
          .filter((r) => r.sira === sira)
          .map((r) => ({ teamName: r.team_name, text: r.answer_text, score: r.score }))
      };
    })
  });
});

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
const round1 = (n) => (n === null ? null : Math.round(n * 10) / 10);

// GET /api/admin/report — etkinlik sonuç raporu için toplu istatistikler
router.get("/report", (req, res) => {
  const cfg = db.prepare("SELECT * FROM session_config WHERE id = 1").get();
  const teams = db.prepare("SELECT * FROM teams ORDER BY total_score DESC, created_at ASC").all();
  const answers = db.prepare("SELECT mini_vaka_sira AS sira, score FROM team_answers").all();
  const ak = db.prepare("SELECT score FROM ana_kanit_progress").all();
  const fa = db.prepare("SELECT parca_a_text, parca_a_score FROM final_progress").all();
  const sg = db.prepare("SELECT score FROM son_gece_answers").all();

  const perCase = SIRALAR.map((sira) => {
    const mv = getMiniVaka(sira, "tr");
    const list = answers.filter((a) => a.sira === sira);
    const scored = list.filter((a) => a.score !== null && a.score !== undefined).map((a) => a.score);
    const a = avg(scored);
    return {
      sira,
      bolum: mv.bolum,
      baslik: mv.baslik,
      answerCount: list.length,
      scoredCount: scored.length,
      avgScore: round1(a),
      avgPercent: a === null ? null : Math.round(a)
    };
  });

  const perBolum = BOLUMLER.map((b) => {
    const scores = perCase.filter((c) => c.bolum === b.num && c.avgScore !== null).map((c) => c.avgScore);
    const a = avg(scores);
    return { num: b.num, baslik: b.baslik, degerler: b.degerler, avgPercent: a === null ? null : Math.round(a) };
  });

  const ranked = perCase.filter((c) => c.avgScore !== null).sort((x, y) => x.avgScore - y.avgScore);
  const scoredAk = ak.filter((r) => r.score !== null).map((r) => r.score);
  const scoredFa = fa.filter((r) => r.parca_a_score !== null).map((r) => r.parca_a_score);

  res.json({
    sessionName: cfg?.session_name || "VC Dedektifleri 2.0",
    generatedAt: new Date().toISOString(),
    teamCount: teams.length,
    finishedCount: teams.filter((t) => t.current_stage === "KAPANIS").length,
    pendingScoring: answers.filter((a) => a.score === null || a.score === undefined).length,
    maxTotalScore: 1200,
    ranking: teams.map((t, i) => ({
      rank: i + 1,
      name: t.name,
      members: t.members || "",
      totalScore: t.total_score,
      finished: t.current_stage === "KAPANIS"
    })),
    perCase,
    perBolum,
    weakest: ranked.slice(0, 3),
    strongest: ranked.slice(-3).reverse(),
    others: {
      anaKanit: { avg: round1(avg(scoredAk)), max: 30, count: scoredAk.length },
      parcaA: { avg: round1(avg(scoredFa)), max: 90, count: scoredFa.length },
      sonGece: { avg: round1(avg(sg.map((r) => r.score))), max: 120, count: sg.length }
    }
  });
});

// ---- Vaka metinlerini panelden düzenleme ----
function checkParams(req, res) {
  const sira = Number(req.params.sira);
  const lang = req.params.lang;
  if (!SIRALAR.includes(sira) || !["tr", "en"].includes(lang)) {
    res.status(400).json({ error: "Geçersiz vaka ya da dil." });
    return null;
  }
  return { sira, lang };
}

// GET /api/admin/content  → 9 vakanın her iki dildeki güncel + özgün metinleri
router.get("/content", (req, res) => {
  res.json({
    cases: SIRALAR.map((sira) => ({ sira, tr: editableView(sira, "tr"), en: editableView(sira, "en") }))
  });
});

// PUT /api/admin/content/:sira/:lang   { baslik, olayAni, kanitAni, kararSorusu, dogruCozum, finalIcgorusu }
router.put("/content/:sira/:lang", (req, res) => {
  const p = checkParams(req, res);
  if (!p) return;
  try {
    saveOverride(p.sira, p.lang, req.body);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  res.json(editableView(p.sira, p.lang));
});

// DELETE /api/admin/content/:sira/:lang → özgün metne geri dön
router.delete("/content/:sira/:lang", (req, res) => {
  const p = checkParams(req, res);
  if (!p) return;
  clearOverride(p.sira, p.lang);
  res.json(editableView(p.sira, p.lang));
});

module.exports = router;
