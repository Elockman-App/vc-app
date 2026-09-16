const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { getLocalIp } = require("./utils/network");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---- API rotaları ----
app.use("/api/teams", require("./routes/teams"));
app.use("/api/session", require("./routes/session"));
app.use("/api/mini-vaka", require("./routes/miniVaka"));
app.use("/api/ana-kanit", require("./routes/anaKanit"));
app.use("/api/final", require("./routes/final"));
app.use("/api/son-gece", require("./routes/sonGece"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/qr", require("./routes/qr"));

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ---- Derlenmiş React arayüzünü sun (client/dist) ----
const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res
      .status(200)
      .send("Arayüz henüz derlenmemiş. Önce 'npm run build' (client klasöründe) çalıştırın.");
  });
}

app.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIp();
  console.log("");
  console.log("============================================================");
  console.log(" VC DEDEKTİFLERİ 2.0 sunucusu çalışıyor");
  console.log("============================================================");
  console.log(` Admin Paneli  : http://${ip}:${PORT}/admin`);
  console.log(` Oyuncu Girişi : http://${ip}:${PORT}/play`);
  console.log(` (Yerel test)  : http://localhost:${PORT}/admin`);
  console.log("============================================================");
  console.log("");
});
