const { getLocalIp } = require("./network");

const LOCAL_HOST = /^(localhost|127\.\d+\.\d+\.\d+|\[?::1\]?)$/i;

function firstValue(v) {
  return v ? String(v).split(",")[0].trim() : "";
}

/**
 * Oyuncuların açacağı adresin kökünü (QR kod için) belirler. Öncelik sırası:
 *  1) PUBLIC_URL ortam değişkeni (elle sabitlemek isterseniz)
 *  2) İsteğin geldiği adres: Render/proxy arkasında X-Forwarded-Host, yoksa Host başlığı.
 *     (Render, orijinal alan adını Host başlığında taşır; eski kod yalnızca X-Forwarded-Host'a
 *     baktığı için Render'da sunucunun iç ağ IP'sini gösteriyordu.)
 *  3) Panel "localhost" ile açıldıysa (yerel çalıştırma): bilgisayarın LAN IP'si + port
 */
function resolveBaseUrl(req, opts = {}) {
  const env = opts.env || process.env;

  const fixed = (env.PUBLIC_URL || "").trim().replace(/\/+$/, "");
  if (fixed) return /^https?:\/\//i.test(fixed) ? fixed : `https://${fixed}`;

  const h = req.headers || {};
  const host = firstValue(h["x-forwarded-host"]) || firstValue(h["host"]);
  const hostname = host.replace(/:\d+$/, "");

  if (!host || LOCAL_HOST.test(hostname)) {
    const port = env.PORT || 3000;
    const ip = (opts.getLocalIp || getLocalIp)();
    const isDefaultPort = String(port) === "80" || String(port) === "443";
    return `http://${ip}${isDefaultPort ? "" : `:${port}`}`;
  }

  const proto = firstValue(h["x-forwarded-proto"]) || req.protocol || "http";
  return `${proto}://${host}`;
}

module.exports = { resolveBaseUrl };
