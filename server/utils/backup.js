const fs = require("fs");
const path = require("path");
const db = require("../db");
const { loadOverrides } = require("./contentStore");
const { ensureJoinCodes } = require("./joinCode");

const TABLES = [
  "teams",
  "team_answers",
  "ana_kanit_progress",
  "final_progress",
  "son_gece_answers",
  "session_config",
  "case_overrides"
];

const BACKUP_DIR = path.join(path.dirname(db.path), "backups");

/** Tüm tabloları bellekte JSON nesnesi olarak döndürür. */
function dumpAll(reason = "manuel") {
  const dump = { app: "vc-dedektifleri", version: 1, createdAt: new Date().toISOString(), reason, tables: {} };
  TABLES.forEach((t) => {
    dump.tables[t] = db.prepare(`SELECT * FROM ${t}`).all();
  });
  return dump;
}

/**
 * Tüm tabloları JSON dosyasına da yazar (sunucu diskine) ve dökümü döndürür.
 * Oturum sıfırlanmadan/takım silinmeden önce çağrılır. Ücretsiz Render'da disk kalıcı olmadığı için
 * asıl güvence, dökümün tarayıcıya indirilmesidir (bkz. admin paneli).
 */
function backupAll(reason = "manuel") {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const dump = dumpAll(reason);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `yedek-${stamp}.json`;
  fs.writeFileSync(path.join(BACKUP_DIR, fileName), JSON.stringify(dump, null, 2), "utf8");
  return { fileName, teamCount: dump.tables.teams.length, dump };
}

/**
 * Bir yedek dökümünü geri yükler: mevcut tüm oyun verisi silinir, yedekteki satırlar (takım kimlikleri
 * dahil, yani oyuncuların telefonlarındaki kayıtlar tekrar geçerli olur) eklenir.
 * Yalnızca bilinen tablolar/kolonlar kabul edilir. İşlem tek bir transaction'dır.
 */
function restoreAll(dump) {
  if (!dump || typeof dump !== "object" || !dump.tables || typeof dump.tables !== "object") {
    throw new Error("Geçersiz yedek dosyası.");
  }
  TABLES.forEach((t) => {
    if (dump.tables[t] !== undefined && !Array.isArray(dump.tables[t])) {
      throw new Error(`Geçersiz yedek: ${t} tablosu liste değil.`);
    }
  });
  const teams = dump.tables.teams;
  if (!Array.isArray(teams)) throw new Error("Yedekte takım tablosu yok.");

  const columnsOf = (t) => db.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);

  db.exec("BEGIN");
  try {
    // Alt tablolar önce silinir
    ["team_answers", "ana_kanit_progress", "final_progress", "son_gece_answers", "teams"].forEach((t) =>
      db.prepare(`DELETE FROM ${t}`).run()
    );
    let restoredTeams = 0;
    // Yedekte vaka düzenlemeleri varsa mevcut düzenlemelerin yerine geçer (eski yedeklerde yoksa dokunulmaz)
    if (dump.tables.case_overrides !== undefined) db.prepare("DELETE FROM case_overrides").run();
    ["teams", "team_answers", "ana_kanit_progress", "final_progress", "son_gece_answers", "session_config", "case_overrides"].forEach(
      (t) => {
        const rows = dump.tables[t] || [];
        const cols = columnsOf(t);
        rows.forEach((row) => {
          if (!row || typeof row !== "object") return;
          const keys = Object.keys(row).filter((k) => cols.includes(k));
          if (keys.length === 0) return;
          const sql = `INSERT OR REPLACE INTO ${t} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`;
          db.prepare(sql).run(...keys.map((k) => row[k]));
          if (t === "teams") restoredTeams += 1;
        });
      }
    );
    db.exec("COMMIT");
    ensureJoinCodes(); // eski yedeklerde giriş kodu yoktur
    loadOverrides();
    return { restoredTeams };
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch (e2) {}
    throw e;
  }
}

module.exports = { backupAll, dumpAll, restoreAll, BACKUP_DIR };
