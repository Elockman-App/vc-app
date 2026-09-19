const db = require("../db");

/**
 * team.total_score alanını dört kaynaktan yeniden hesaplar (bkz. Plan §7):
 *   1) team_answers.score      (9 mini vaka, facilitator puanlı, max 900)
 *   2) ana_kanit_progress.score(3 x 0-30, facilitator puanlı, max 90)
 *   3) final_progress.parca_a_score (facilitator puanlı, max 90)
 *   4) son_gece_answers.score  (otomatik, max 120)
 * NULL puanlar 0 sayılır (henüz değerlendirilmemiş).
 */
function recomputeTotalScore(teamId) {
  const answers = db
    .prepare("SELECT COALESCE(SUM(score), 0) AS s FROM team_answers WHERE team_id = ?")
    .get(teamId).s;
  const anaKanit = db
    .prepare("SELECT COALESCE(SUM(score), 0) AS s FROM ana_kanit_progress WHERE team_id = ?")
    .get(teamId).s;
  const finalRow = db
    .prepare("SELECT parca_a_score FROM final_progress WHERE team_id = ?")
    .get(teamId);
  const parcaA = (finalRow && finalRow.parca_a_score) || 0;
  const sonGeceRow = db
    .prepare("SELECT score FROM son_gece_answers WHERE team_id = ?")
    .get(teamId);
  const sonGece = (sonGeceRow && sonGeceRow.score) || 0;

  const total = answers + anaKanit + parcaA + sonGece;
  db.prepare("UPDATE teams SET total_score = ?, updated_at = datetime('now') WHERE id = ?").run(
    total,
    teamId
  );
  return total;
}

module.exports = { recomputeTotalScore };
