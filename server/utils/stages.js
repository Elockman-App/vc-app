// Doğrusal akış sırası (bkz. Plan §2). Client tarafında da bu sıra kullanılır.
const STAGE_ORDER = [
  "BRIEFING",
  "BOLUM",
  "OLAY_ANI",
  "KANIT_ANI",
  "KARAR_ANI",
  "ANA_KANIT",
  "FINAL_KILIT",
  "FINAL_PARCA_A",
  "SON_GECE_ACILIS",
  "SON_GECE_KANIT",
  "SON_GECE_SENTEZ",
  "KAPANIS"
];

module.exports = { STAGE_ORDER };
