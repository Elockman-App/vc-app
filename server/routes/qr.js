const express = require("express");
const QRCode = require("qrcode");
const { getLocalIp } = require("../utils/network");

const router = express.Router();

// GET /api/qr -> { playUrl, adminUrl, qrDataUrl }
router.get("/", async (req, res) => {
  try {
    const port = process.env.PORT || 3000;
    const ip = getLocalIp();
    const playUrl = `http://${ip}:${port}/play`;
    const adminUrl = `http://${ip}:${port}/admin`;
    const qrDataUrl = await QRCode.toDataURL(playUrl, {
      width: 480,
      margin: 1,
      color: { dark: "#101B3D", light: "#FFFFFF" }
    });
    res.json({ playUrl, adminUrl, qrDataUrl, ip, port });
  } catch (err) {
    res.status(500).json({ error: "QR kod üretilemedi.", detail: String(err) });
  }
});

module.exports = router;
