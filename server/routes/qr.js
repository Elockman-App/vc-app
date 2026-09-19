const express = require("express");
const QRCode = require("qrcode");
const { resolveBaseUrl } = require("../utils/baseUrl");
const { requireAdmin } = require("../utils/adminAuth");

const router = express.Router();

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
