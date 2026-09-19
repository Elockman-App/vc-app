// Admin güvenliği ve puanlama doğrulaması: `npm test` içinde smoketest'ten sonra çalışır.
// Geçici bir veritabanıyla sunucuyu ayrı bir portta başlatır; gerçek veriye dokunmaz.
const assert = require("assert");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PIN = "246810";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vc-admintest-"));

let PORT;
let BASE;
let server;

// İşletim sisteminden boş bir port iste (sabit/rastgele port başka bir işlemle çakışabiliyordu)
function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = require("net").createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function startServer() {
  server = spawn(process.execPath, ["--no-warnings", path.join(__dirname, "server.js")], {
    env: { ...process.env, PORT: String(PORT), ADMIN_PIN: PIN, DB_PATH: path.join(tmp, "test.sqlite3") },
    stdio: "ignore"
  });
}

async function call(method, url, body, token) {
  const res = await fetch(BASE + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body && method !== "GET" ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  return { status: res.status, json, text };
}

async function waitUp() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) return;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Sunucu başlamadı");
}

// Varsayılan PIN: ADMIN_PIN yoksa sabit PIN kullanılır, tanımlıysa o geçerli olur
{
  const { execFileSync } = require("child_process");
  const env = { ...process.env };
  delete env.ADMIN_PIN;
  const out = execFileSync(process.execPath, ["-e", "const a=require('./utils/adminAuth');console.log(a.ADMIN_PIN+','+a.pinFromEnv)"], { cwd: __dirname, env }).toString().trim();
  assert.strictEqual(out, "1326155,false");
  const out2 = execFileSync(process.execPath, ["-e", "const a=require('./utils/adminAuth');console.log(a.ADMIN_PIN+','+a.pinFromEnv)"], { cwd: __dirname, env: { ...env, ADMIN_PIN: "998877" } }).toString().trim();
  assert.strictEqual(out2, "998877,true");
  console.log("ADMIN_PIN yoksa sabit varsayılan PIN, varsa ortam değişkeni kullanılıyor. ✔");
}

// QR adresi: Render'da alan adı (Host başlığı) kullanılmalı, iç ağ IP'si değil
{
  const { resolveBaseUrl } = require("./utils/baseUrl");
  const fakeIp = () => "192.168.1.24";
  const r = (headers, env = {}, protocol) => resolveBaseUrl({ headers, protocol }, { env, getLocalIp: fakeIp });
  assert.strictEqual(r({ host: "vc-app.onrender.com", "x-forwarded-proto": "https" }), "https://vc-app.onrender.com");
  assert.strictEqual(r({ host: "10.0.0.5:10000", "x-forwarded-host": "oyun.firma.com", "x-forwarded-proto": "https,http" }), "https://oyun.firma.com");
  assert.strictEqual(r({ host: "localhost:3000" }, { PORT: "3000" }), "http://192.168.1.24:3000");
  assert.strictEqual(r({ host: "127.0.0.1:3000" }, { PORT: "8080" }), "http://192.168.1.24:8080");
  assert.strictEqual(r({ host: "192.168.1.50:3000" }), "http://192.168.1.50:3000");
  assert.strictEqual(r({ host: "vc-app.onrender.com" }, { PUBLIC_URL: "https://oyun.sirket.com/" }), "https://oyun.sirket.com");
  assert.strictEqual(r({ host: "x.onrender.com" }, { PUBLIC_URL: "oyun.sirket.com" }), "https://oyun.sirket.com");
  console.log("QR adresi Render alan adını / PUBLIC_URL'yi doğru seçiyor. ✔");
}

(async () => {
  try {
    PORT = await getFreePort();
    BASE = `http://127.0.0.1:${PORT}/api`;
    startServer();
    await waitUp();

    // 1) Yetkisiz erişim reddedilmeli
    for (const [m, u] of [
      ["GET", "/admin/overview"], ["GET", "/admin/queue"], ["GET", "/admin/scored"],
      ["GET", "/admin/export-csv"], ["POST", "/admin/reset"], ["POST", "/admin/broadcast"],
      ["PUT", "/admin/session"], ["GET", "/teams"], ["GET", "/qr"],
      ["PUT", "/final/admin/x/parca-a/score"], ["PUT", "/ana-kanit/admin/x/A/score"]
    ]) {
      const r = await call(m, u, {});
      assert.strictEqual(r.status, 401, `${m} ${u} yetkisiz erişime açık (status ${r.status})`);
    }
    assert.strictEqual((await call("GET", "/admin/overview", null, "sahte.token")).status, 401);
    console.log("Admin rotaları PIN olmadan 401 dönüyor. ✔");

    // 2) Oyuncu rotaları açık kalmalı
    assert.strictEqual((await call("GET", "/session")).status, 200);
    const team = await call("POST", "/teams", { name: "=HYPERLINK(\"http://x\")", members: "Ali, Ayşe" });
    assert.strictEqual(team.status, 201);
    console.log("Oyuncu rotaları (oturum, takım oluşturma) açık. ✔");

    // 3) Yanlış PIN reddedilir, doğru PIN token verir
    assert.strictEqual((await call("POST", "/admin/login", { pin: "000000" })).status, 401);
    const login = await call("POST", "/admin/login", { pin: PIN });
    assert.strictEqual(login.status, 200);
    const token = login.json.token;
    assert.ok(token);
    assert.strictEqual((await call("GET", "/admin/overview", null, token)).status, 200);
    console.log("PIN girişi ve token doğrulaması çalışıyor. ✔");

    // 4) Puan doğrulama: boş / aralık dışı / sayı olmayan reddedilir
    const teamId = team.json.id;
    const ans = await call("POST", "/mini-vaka/1/answer", { teamId, answerText: "deneme cevabı" });
    assert.ok(ans.status < 300, "cevap gönderilemedi: " + ans.text);
    const q = await call("GET", "/admin/queue", null, token);
    const answerId = q.json.pendingAnswers[0].answerId;
    for (const bad of [undefined, "", "abc", -1, 101]) {
      const r = await call("PUT", `/admin/answers/${answerId}/score`, { score: bad }, token);
      assert.strictEqual(r.status, 400, `geçersiz puan kabul edildi: ${bad}`);
    }
    const ok = await call("PUT", `/admin/answers/${answerId}/score`, { score: 72 }, token);
    assert.strictEqual(ok.status, 200);
    assert.strictEqual(ok.json.totalScore, 72);
    console.log("Boş/geçersiz puan reddediliyor, geçerli puan kaydediliyor. ✔");

    // 5) Puan düzeltilebilir ve "puanlananlar" listesinde görünür
    const scored = await call("GET", "/admin/scored", null, token);
    assert.strictEqual(scored.json.answers.length, 1);
    assert.strictEqual(scored.json.answers[0].score, 72);
    const fix = await call("PUT", `/admin/answers/${answerId}/score`, { score: 85 }, token);
    assert.strictEqual(fix.json.totalScore, 85);
    assert.strictEqual((await call("GET", "/admin/queue", null, token)).json.pendingAnswers.length, 0);
    console.log("Verilen puan düzeltilebiliyor (72 → 85). ✔");

    // 6) CSV formül enjeksiyonu engellenir
    const csv = await fetch(`${BASE}/admin/export-csv`, { headers: { Authorization: `Bearer ${token}` } });
    const csvText = await csv.text();
    assert.ok(csvText.includes(`"'=HYPERLINK`), "CSV'de formül karakteri kaçırılmamış");
    assert.ok(!/;"=HYPERLINK/.test(csvText));
    console.log("CSV formül enjeksiyonuna karşı korunuyor. ✔");

    // 7) Duyuru yayınla → kaldır
    await call("POST", "/admin/broadcast", { message: "Deneme duyurusu" }, token);
    assert.strictEqual((await call("GET", "/session")).json.broadcastMessage, "Deneme duyurusu");
    await call("POST", "/admin/broadcast", { message: "" }, token);
    assert.strictEqual((await call("GET", "/session")).json.broadcastMessage, null);
    console.log("Duyuru yayınlanıyor ve kaldırılabiliyor. ✔");

    // 7a) Duyuru ulaşımı: takım oturum bilgisini çekince "gördü" sayılır
    await call("POST", "/admin/broadcast", { message: "Ulaşım testi" }, token);
    let ovb = await call("GET", "/admin/overview", null, token);
    assert.strictEqual(ovb.json.broadcast.seenCount, 0);
    await call("GET", `/session?teamId=${teamId}`);
    ovb = await call("GET", "/admin/overview", null, token);
    assert.strictEqual(ovb.json.broadcast.seenCount, 1);
    await call("POST", "/admin/broadcast", { message: "" }, token);
    assert.strictEqual((await call("GET", "/admin/overview", null, token)).json.broadcast, null);
    console.log("Duyurunun kaç takıma ulaştığı sayılıyor. ✔");

    // 7b) Genel bakış yeni alanları içeriyor
    const ov = await call("GET", "/admin/overview", null, token);
    assert.strictEqual(ov.json.maxTotalScore, 1200);
    assert.ok(ov.json.serverTime && ov.json.teams[0].updatedAt, "serverTime/updatedAt eksik");
    console.log("Genel bakış son hareket ve puan tavanı bilgisini döndürüyor. ✔");

    // 7c) Cevap detayları CSV'si
    const acsv = await fetch(`${BASE}/admin/export-answers-csv`, { headers: { Authorization: `Bearer ${token}` } });
    assert.strictEqual(acsv.status, 200);
    const acsvText = await acsv.text();
    assert.ok(acsvText.includes("deneme cevabı") && acsvText.includes(";85;100;"), "cevap CSV'sinde cevap/puan yok");
    assert.strictEqual((await call("GET", "/admin/export-answers-csv")).status, 401);
    console.log("Cevap detayları CSV'si çalışıyor ve PIN istiyor. ✔");

    // 7d) Takım yeniden adlandırma ve silme
    const t2 = await call("POST", "/teams", { name: "Silinecek Takım", members: "X" });
    assert.strictEqual((await call("PUT", `/admin/teams/${t2.json.id}`, { name: "  " }, token)).status, 400);
    const rn = await call("PUT", `/admin/teams/${t2.json.id}`, { name: "Yeni Ad", members: "Y" }, token);
    assert.strictEqual(rn.status, 200);
    assert.strictEqual(rn.json.name, "Yeni Ad");
    assert.strictEqual((await call("DELETE", `/admin/teams/${t2.json.id}`)).status, 401);
    const del = await call("DELETE", `/admin/teams/${t2.json.id}`, null, token);
    assert.strictEqual(del.status, 200);
    assert.ok(fs.existsSync(path.join(tmp, "backups", del.json.backupFile)), "silme yedeği yok");
    assert.strictEqual((await call("GET", "/admin/overview", null, token)).json.teamCount, 1);
    assert.strictEqual((await call("DELETE", `/admin/teams/yok`, null, token)).status, 404);
    console.log("Takım yeniden adlandırma / yedekli silme çalışıyor. ✔");

    // 8) Sıfırlama: onaysız reddedilir, onaylıysa yedek alınıp silinir
    assert.strictEqual((await call("POST", "/admin/reset", {}, token)).status, 400);
    assert.strictEqual((await call("POST", "/admin/reset", { confirm: "sifirla" }, token)).status, 400);
    assert.strictEqual((await call("GET", "/admin/overview", null, token)).json.teamCount, 1);
    const reset = await call("POST", "/admin/reset", { confirm: "SIFIRLA" }, token);
    assert.strictEqual(reset.status, 200);
    assert.strictEqual(reset.json.backedUpTeams, 1);
    const backupFile = path.join(tmp, "backups", reset.json.backupFile);
    assert.ok(fs.existsSync(backupFile), "yedek dosyası yok");
    const dump = JSON.parse(fs.readFileSync(backupFile, "utf8"));
    assert.strictEqual(dump.tables.teams.length, 1);
    assert.strictEqual(dump.tables.team_answers[0].score, 85);
    assert.strictEqual((await call("GET", "/admin/overview", null, token)).json.teamCount, 0);
    console.log("Sıfırlama onay istiyor, önce yedek alıyor. ✔");

    // 8b) Yedek indirme + sıfırlama sonrası geri yükleme (aynı takım kimlikleriyle)
    assert.ok(reset.json.backup && reset.json.backup.tables.teams.length === 1, "reset yanıtında yedek yok");
    assert.strictEqual((await call("GET", "/admin/export-backup")).status, 401);
    assert.strictEqual((await call("POST", "/admin/restore", { backup: reset.json.backup })).status, 401);
    assert.strictEqual((await call("POST", "/admin/restore", { backup: reset.json.backup }, token)).status, 400);
    assert.strictEqual(
      (await call("POST", "/admin/restore", { confirm: "GERI YUKLE", backup: { tables: "x" } }, token)).status,
      400
    );
    const rest = await call("POST", "/admin/restore", { confirm: "GERI YUKLE", backup: reset.json.backup }, token);
    assert.strictEqual(rest.status, 200);
    assert.strictEqual(rest.json.restoredTeams, 1);
    const ov2 = await call("GET", "/admin/overview", null, token);
    assert.strictEqual(ov2.json.teamCount, 1);
    assert.strictEqual(ov2.json.teams[0].id, teamId, "takım kimliği korunmadı");
    assert.strictEqual(ov2.json.teams[0].totalScore, 85);
    assert.strictEqual((await call("GET", `/teams/${teamId}`)).status, 200);
    const exp = await fetch(`${BASE}/admin/export-backup`, { headers: { Authorization: `Bearer ${token}` } });
    const expJson = await exp.json();
    assert.strictEqual(expJson.tables.teams.length, 1);
    console.log("Yedek indirme ve geri yükleme (kimlikler ve puanlar korunarak) çalışıyor. ✔");

    // 9) Kaba kuvvet sınırı
    let locked = false;
    for (let i = 0; i < 8; i++) {
      const r = await call("POST", "/admin/login", { pin: "111111" });
      if (r.status === 429) locked = true;
    }
    assert.ok(locked, "PIN deneme sınırı çalışmıyor");
    console.log("Hatalı PIN denemeleri sınırlanıyor (429). ✔");

    console.log("\n✅ ADMİN TESTLERİ GEÇTİ.");
    cleanup(0);
  } catch (e) {
    console.error("\n❌ ADMİN TESTİ BAŞARISIZ:", e.message);
    cleanup(1);
  }
})();

function cleanup(code) {
  if (server) server.kill();
  setTimeout(() => {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
    process.exit(code);
  }, 300);
}
