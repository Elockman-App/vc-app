const crypto = require("crypto");

/**
 * ADMİN YETKİ KONTROLÜ
 *
 * - PIN, `ADMIN_PIN` ortam değişkeninden okunur (Render'da Environment sekmesinden tanımlayın).
 * - `ADMIN_PIN` tanımlı değilse sunucu her açılışta rastgele 6 haneli bir PIN üretir ve
 *   konsola yazar. Yani panel HİÇBİR ZAMAN korumasız açılmaz.
 * - Giriş başarılı olunca imzalı, süreli bir token döner (varsayılan 12 saat).
 *   Token imzası PIN'den türetildiği için sunucu yeniden başlasa da (PIN aynı kaldığı sürece)
 *   açık oturumlar geçerli kalır.
 * - Kaba kuvvet denemelerine karşı IP başına dakikada 5 hatalı girişe izin verilir.
 */

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_FAILS = 5;
const WINDOW_MS = 60 * 1000;

let pinWasGenerated = false;
const ADMIN_PIN = (() => {
  const fromEnv = (process.env.ADMIN_PIN || "").trim();
  if (fromEnv) return fromEnv;
  pinWasGenerated = true;
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
})();

const SECRET = crypto.createHash("sha256").update("vc-admin-secret:" + ADMIN_PIN).digest();

function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function issueToken() {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length || !safeEqual(sig, expected)) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
}

// IP başına hatalı giriş sayacı (bellekte)
const fails = new Map();

function isLocked(ip) {
  const rec = fails.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    fails.delete(ip);
    return false;
  }
  return rec.count >= MAX_FAILS;
}

function registerFail(ip) {
  const rec = fails.get(ip);
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    fails.set(ip, { count: 1, first: Date.now() });
  } else {
    rec.count += 1;
  }
}

// POST /api/admin/login  { pin }
function loginHandler(req, res) {
  const ip = req.ip || "unknown";
  if (isLocked(ip)) {
    return res.status(429).json({ error: "Çok fazla hatalı deneme. Bir dakika sonra tekrar deneyin." });
  }
  const pin = String(req.body?.pin ?? "").trim();
  if (!pin || !safeEqual(pin, ADMIN_PIN)) {
    registerFail(ip);
    return res.status(401).json({ error: "PIN hatalı." });
  }
  fails.delete(ip);
  res.json({ ok: true, token: issueToken(), expiresInMs: TOKEN_TTL_MS });
}

function extractToken(req) {
  const h = req.headers["authorization"] || "";
  if (h.startsWith("Bearer ")) return h.slice(7).trim();
  return req.headers["x-admin-token"] || null;
}

// Express ara katmanı: geçerli admin token'ı yoksa 401 döner
function requireAdmin(req, res, next) {
  if (verifyToken(extractToken(req))) return next();
  res.status(401).json({ error: "Yetkisiz erişim. Lütfen admin PIN'i ile giriş yapın." });
}

module.exports = { requireAdmin, loginHandler, verifyToken, extractToken, ADMIN_PIN, pinWasGenerated };
