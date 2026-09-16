// Kurulum sonrası doğrulama: `npm test` (server klasöründe) ile çalıştırılır.
const assert = require("assert");
const path = require("path");

const cases = require("./data/cases.js");

console.log(`Yüklenen bölüm sayısı: ${cases.BOLUMLER.length}`);
assert.strictEqual(cases.BOLUMLER.length, 3);

console.log(`Yüklenen mini vaka sayısı: ${cases.MINI_VAKALAR.length}`);
assert.strictEqual(cases.MINI_VAKALAR.length, 9);

cases.MINI_VAKALAR.forEach((mv) => {
  assert.ok(mv.heroGorsel, `${mv.baslik}: heroGorsel eksik`);
  assert.strictEqual(mv.olayAni.balonlar.length, 2, `${mv.baslik}: 2 konuşma balonu olmalı`);
  assert.strictEqual(mv.kanitAni.length, 3, `${mv.baslik}: 3 kanıt olmalı`);
  assert.ok(mv.kararSorusu, `${mv.baslik}: kararSorusu eksik`);
  assert.ok(mv.dogruCozum, `${mv.baslik}: dogruCozum eksik`);
  assert.ok(mv.finalIcgorusu, `${mv.baslik}: finalIcgorusu eksik`);
});
console.log("9 mini vakanın tamamı 7 alanlı modele uygun. ✔");

const kilit = cases.FINAL.kilitKodu;
assert.strictEqual(kilit, cases.BOLUMLER.map((b) => b.anaKanit.kod).join(""));
console.log("Final kilit kodu, 3 Ana Kanıt kodunun birleşimiyle eşleşiyor:", kilit);

cases.FINAL.sonGece.ucYolSinavi.forEach((row) => {
  const mv = cases.getMiniVaka(row.dogruMiniVakaSira);
  assert.strictEqual(mv.baslik, row.dogruMiniVakaBaslik, "Son Gece referans başlığı uyuşmuyor");
});
console.log("Son Gece — Üç Yolun Sınavı referansları doğru mini vakalara işaret ediyor. ✔");

const metaJson = JSON.stringify(cases.listMiniVakaMeta());
assert.ok(!metaJson.includes("dogruCozum") && !metaJson.includes("kararSorusu"));
console.log("listMiniVakaMeta() cevap anahtarı sızdırmıyor. ✔");

// Veritabanı şeması kurulabiliyor mu?
try {
  const db = require("./db.js");
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((t) => t.name);
  ["teams", "team_answers", "ana_kanit_progress", "final_progress", "son_gece_answers", "session_config"].forEach(
    (t) => assert.ok(tables.includes(t), `Tablo eksik: ${t}`)
  );
  console.log("Veritabanı şeması (6 tablo) başarıyla kuruldu. ✔");
} catch (e) {
  console.error("UYARI: Veritabanı testi çalıştırılamadı —", e.message);
  console.error("Bu genellikle 'npm install' henüz çalıştırılmadığı anlamına gelir.");
  process.exit(1);
}

console.log("\n✅ TÜM SMOKE TESTLER GEÇTİ — kurulum doğru görünüyor.");
