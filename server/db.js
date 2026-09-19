/**
 * VC DEDEKTİFLERİ 2.0 — VERİ MODELİ (SQLite)
 *
 * NOT (Eylül 2026 düzeltmesi): Bu dosya artık `better-sqlite3` NPM paketi
 * yerine Node.js'in kendi yerleşik `node:sqlite` modülünü kullanır. Sebep:
 * `better-sqlite3` native bir modüldür ve bazı Windows makinelerinde kurulum
 * sırasında Python + C++ derleyici gerektirir (node-gyp hatası). `node:sqlite`
 * ise Node.js v22.5+ ile birlikte gelir — hiçbir ek kurulum, Python ya da
 * derleyici gerektirmez. API'si (`prepare/run/get/all`) neredeyse birebir
 * aynıdır, bu yüzden geri kalan tüm route dosyaları değişmeden çalışır.
 */

const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

// DB_PATH: testler ve özel kurulumlar için veritabanı dosyasının yerini değiştirir.
const dbPath = process.env.DB_PATH || path.join(__dirname, "db", "game.sqlite3");
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const rawDb = new DatabaseSync(dbPath);

// better-sqlite3 ile aynı arayüzü koruyan ince bir sarmalayıcı — böylece
// server/routes/*.js dosyalarının hiçbiri değişmek zorunda kalmadı.
const db = {
  exec: (sql) => rawDb.exec(sql),
  pragma: (str) => {
    try {
      rawDb.exec(`PRAGMA ${str}`);
    } catch (e) {
      /* WAL bazı ortamlarda desteklenmeyebilir; sessizce yoksay */
    }
  },
  prepare: (sql) => {
    const stmt = rawDb.prepare(sql);
    return {
      run: (...args) => stmt.run(...args),
      get: (...args) => stmt.get(...args),
      all: (...args) => stmt.all(...args)
    };
  }
};

db.path = dbPath;

db.pragma("journal_mode = WAL");

db.exec(`
-- ---------------------------------------------------------------------------
-- TAKIMLAR — doğrusal akıştaki mevcut konumu tutar
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  members TEXT DEFAULT '',
  current_stage TEXT NOT NULL DEFAULT 'BRIEFING',
  current_bolum INTEGER DEFAULT 1,
  current_mini_vaka INTEGER,
  total_score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Mini vaka Karar Anı — serbest metin cevap + facilitator puanı
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_answers (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  mini_vaka_sira INTEGER NOT NULL,
  answer_text TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  score INTEGER,
  scored_at TEXT,
  UNIQUE(team_id, mini_vaka_sira)
);

-- ---------------------------------------------------------------------------
-- Ana Kanıt sentezi — sözlü yapılır, facilitator admin'den puan girer
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ana_kanit_progress (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  harf TEXT NOT NULL CHECK (harf IN ('A','B','C')),
  revealed_at TEXT NOT NULL DEFAULT (datetime('now')),
  score INTEGER,
  scored_at TEXT,
  UNIQUE(team_id, harf)
);

-- ---------------------------------------------------------------------------
-- Final Dosyası ilerlemesi
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS final_progress (
  team_id TEXT PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
  kilit_acildi_mi INTEGER NOT NULL DEFAULT 0,
  kilit_acilis_zamani TEXT,
  parca_a_text TEXT,
  parca_a_submitted_at TEXT,
  parca_a_score INTEGER,
  parca_a_scored_at TEXT
);

-- ---------------------------------------------------------------------------
-- Son Gece — Üç Yolun Sınavı (OTOMATİK puanlanır)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS son_gece_answers (
  team_id TEXT PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
  satir1_mini_vaka INTEGER,
  satir2_mini_vaka INTEGER,
  satir3_mini_vaka INTEGER,
  score INTEGER NOT NULL DEFAULT 0,
  submitted_at TEXT
);

-- ---------------------------------------------------------------------------
-- Oturum ayarları
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  session_name TEXT NOT NULL DEFAULT 'VC Dedektifleri 2.0',
  final_parca_a_enabled INTEGER NOT NULL DEFAULT 1,
  broadcast_message TEXT,
  broadcast_updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Kolon migrasyonu kontrolü
try {
  db.exec("ALTER TABLE session_config ADD COLUMN broadcast_message TEXT");
  db.exec("ALTER TABLE session_config ADD COLUMN broadcast_updated_at TEXT");
} catch (e) {
  /* Kolonlar zaten varsa yoksay */
}

// Duyuruyu hangi takımların gördüğünü izlemek için (admin paneli "X takımdan Y'si gördü")
try {
  db.exec("ALTER TABLE teams ADD COLUMN seen_broadcast_at TEXT");
} catch (e) {
  /* Kolon zaten varsa yoksay */
}

const cfg = db.prepare("SELECT * FROM session_config WHERE id = 1").get();
if (!cfg) {
  db.prepare(
    "INSERT INTO session_config (id, session_name, final_parca_a_enabled) VALUES (1, 'VC Dedektifleri 2.0', 1)"
  ).run();
}

module.exports = db;

