const crypto = require("crypto");
const db = require("../db");

/** 4 haneli, o an kullanılmayan bir takım giriş kodu üretir. */
function newJoinCode() {
  const used = new Set(db.prepare("SELECT join_code FROM teams WHERE join_code IS NOT NULL").all().map((r) => r.join_code));
  for (let i = 0; i < 200; i++) {
    const code = String(crypto.randomInt(0, 10000)).padStart(4, "0");
    if (!used.has(code)) return code;
  }
  return String(crypto.randomInt(0, 10000)).padStart(4, "0");
}

/** Kodu olmayan takımlara (eski kayıtlar / eski yedekler) kod atar. */
function ensureJoinCodes() {
  db.prepare("SELECT id FROM teams WHERE join_code IS NULL OR join_code = ''").all().forEach((t) => {
    db.prepare("UPDATE teams SET join_code = ? WHERE id = ?").run(newJoinCode(), t.id);
  });
}

module.exports = { newJoinCode, ensureJoinCodes };
