const express = require("express");
const QRCode = require("qrcode");
const { getLocalIp } = require("../utils/network");
const { requireAdmin } = require("../utils/adminAuth");

const router = express.Router();

/**
 * İsteğin geldiği public URL'yi belirler.
 * - Render.com / reverse-proxy arkasında: X-Forwarded-Host + X-Forwarded-Proto kullanır
 * - Yerel geliştirme: LAN IP + PORT kullanır
 */
function resolveBaseUrl(req) {
  // Render.com ve çoğu reverse-proxy bu header'ları set eder
  const forwardedHost = req.headers["x-forwarded-host"];
  const forwardedProto = req.headers["x-forwarded-proto"];

  if (forwardedHost) {
    const proto = forwardedProto ? forwardedProto.split(",")[0].trim() : "https";
    const host = forwardedHost.split(",")[0].trim();
    return `${proto}://${host}`;
  }

  // Yerel ortam: LAN IP + port
  const port = process.env.PORT || 3000;
  const ip = getLocalIp();
  const isDefaultPort = (String(port) === "80" || String(port) === "443");
  return `http://${ip}${isDefaultPort ? "" : `:${port}`}`;
}

// GET /api/qr -> { playUrl, adminUrl, qrDataUrl }
router.get("/", requireAdmin, async (req, res) => {
  try {
    const base = resolveBaseUrl(req);
    const playUrl = `${base}/play`;
    const adminUrl = `${base}/admin`;

    const qrDataUrl = await QRCode.toDataURL(playUrl, {
      width: 480,
      margin: 1,
      color: { dark: "#101B3D", light: "#FFFFFF" }
    });

    res.json({ playUrl, adminUrl, qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: "QR kod üretilemedi.", detail: String(err) });
  }
});

module.exports = router;
