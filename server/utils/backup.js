const fs = require("fs");
const path = require("path");
const db = require("../db");

const TABLES = [
  "teams",
  "team_answers",
  "ana_kanit_progress",
  "final_progress",
  "son_gece_answers",
  "session_config"
];

const BACKUP_DIR = path.join(path.dirname(db.path), "backups");

/**
 * Tüm tabloları tek bir JSON dosyasına yazar. Oturum sıfırlanmadan önce
 * çağrılır; böylece yanlışlıkla sıfırlama geri alınabilir.
 * Dönüş: dosya adı (tam yol değil).
 */
function backupAll(reason = "manuel") {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const dump = { createdAt: new Date().toISOString(), reason, tables: {} };
  TABLES.forEach((t) => {
    dump.tables[t] = db.prepare(`SELECT * FROM ${t}`).all();
  });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `yedek-${stamp}.json`;
  fs.writeFileSync(path.join(BACKUP_DIR, fileName), JSON.stringify(dump, null, 2), "utf8");
  return { fileName, teamCount: dump.tables.teams.length };
}

module.exports = { backupAll, BACKUP_DIR };
