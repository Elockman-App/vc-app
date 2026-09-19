const db = require("../db");
const cases = require("../data/cases");

/**
 * Panelden düzenlenen vaka metinleri.
 * Kodla gelen metin (cases.js / cases.en.js) özgün halidir; buradaki kayıtlar onun üzerine bindirilir.
 * Kaydı silmek özgün metne geri döndürür.
 */

const KANIT_TYPES = ["whatsapp", "teams", "data", "quote"];

function loadOverrides() {
  const map = { tr: {}, en: {} };
  db.prepare("SELECT sira, lang, data FROM case_overrides").all().forEach((r) => {
    try {
      if (map[r.lang]) map[r.lang][String(r.sira)] = JSON.parse(r.data);
    } catch (e) {
      /* bozuk kayıt yok sayılır */
    }
  });
  cases.setOverrides(map);
  return map;
}

function overrideCount() {
  return db.prepare("SELECT COUNT(*) AS n FROM case_overrides").get().n;
}

function str(v, max, field, required = true) {
  const s = String(v ?? "").trim();
  if (required && !s) throw new Error(`"${field}" boş olamaz.`);
  if (s.length > max) throw new Error(`"${field}" en fazla ${max} karakter olabilir.`);
  return s;
}

/** İstemciden gelen düzenlemeyi doğrular ve temiz bir nesneye çevirir. Hata olursa Error fırlatır. */
function sanitize(input) {
  if (!input || typeof input !== "object") throw new Error("Geçersiz içerik.");
  const balonlar = Array.isArray(input.olayAni?.balonlar) ? input.olayAni.balonlar : [];
  if (balonlar.length !== 2) throw new Error("Konuşma balonu tam 2 tane olmalıdır.");
  const kanitlar = Array.isArray(input.kanitAni) ? input.kanitAni : [];
  if (kanitlar.length < 1 || kanitlar.length > 6) throw new Error("Kanıt sayısı 1 ile 6 arasında olmalıdır.");

  const kanitAni = kanitlar.map((k, i) => {
    const type = String(k?.type || "");
    if (!KANIT_TYPES.includes(type)) throw new Error(`Kanıt ${i + 1}: geçersiz tür.`);
    const out = { type, baslik: str(k.baslik, 120, `Kanıt ${i + 1} başlığı`) };
    if (type === "data") {
      const rows = Array.isArray(k.rows) ? k.rows : [];
      if (rows.length < 1 || rows.length > 8) throw new Error(`Kanıt ${i + 1}: 1-8 satır olmalıdır.`);
      out.rows = rows.map((r, j) => [
        str(r?.[0], 120, `Kanıt ${i + 1} satır ${j + 1} etiketi`),
        str(r?.[1], 200, `Kanıt ${i + 1} satır ${j + 1} değeri`)
      ]);
    } else {
      out.text = str(k.text, 600, `Kanıt ${i + 1} metni`);
      if (type === "quote") out.who = str(k.who, 120, `Kanıt ${i + 1} kişi`, false);
      else {
        out.from = str(k.from, 120, `Kanıt ${i + 1} gönderen`, false);
        out.time = str(k.time, 40, `Kanıt ${i + 1} zaman`, false);
      }
    }
    return out;
  });

  return {
    baslik: str(input.baslik, 60, "Başlık"),
    olayAni: {
      ozet: str(input.olayAni?.ozet, 600, "Olay özeti"),
      balonlar: balonlar.map((b, i) => str(b, 200, `Balon ${i + 1}`))
    },
    kanitAni,
    kararSorusu: str(input.kararSorusu, 500, "Karar sorusu"),
    dogruCozum: str(input.dogruCozum, 1200, "Referans çözüm"),
    finalIcgorusu: str(input.finalIcgorusu, 300, "Final içgörüsü")
  };
}

function saveOverride(sira, lang, input) {
  const clean = sanitize(input);
  db.prepare(
    `INSERT INTO case_overrides (sira, lang, data, updated_at) VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(sira, lang) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  ).run(Number(sira), lang, JSON.stringify(clean));
  loadOverrides();
  return clean;
}

function clearOverride(sira, lang) {
  db.prepare("DELETE FROM case_overrides WHERE sira = ? AND lang = ?").run(Number(sira), lang);
  loadOverrides();
}

/** Panelde gösterilecek düzenlenebilir alanlar (geçerli metin + özgün metin + düzenlenmiş mi) */
function editableView(sira, lang) {
  const pick = (mv) => ({
    baslik: mv.baslik,
    olayAni: { ozet: mv.olayAni.ozet, balonlar: mv.olayAni.balonlar },
    kanitAni: mv.kanitAni,
    kararSorusu: mv.kararSorusu,
    dogruCozum: mv.dogruCozum,
    finalIcgorusu: mv.finalIcgorusu
  });
  const base = cases.getBaseMiniVaka(sira, lang);
  const cur = cases.getMiniVaka(sira, lang);
  const edited = !!db.prepare("SELECT 1 AS x FROM case_overrides WHERE sira = ? AND lang = ?").get(Number(sira), lang);
  return { sira: Number(sira), lang, bolum: base.bolum, edited, current: pick(cur), original: pick(base) };
}

module.exports = { loadOverrides, overrideCount, saveOverride, clearOverride, editableView, sanitize };
