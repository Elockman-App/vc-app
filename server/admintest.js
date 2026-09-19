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

    // 8b) İlk cevap kalıcıdır (yenileyip değiştirme yok)
    const lt = (await call("POST", "/teams", { name: "Kilit Takımı" })).json;
    const a1 = await call("POST", "/mini-vaka/1/answer", { teamId: lt.id, answerText: "ilk cevap" });
    assert.ok(a1.json.dogruCozum && !a1.json.already, "ilk cevap kaydedilmeli");
    const a2 = await call("POST", "/mini-vaka/1/answer", { teamId: lt.id, answerText: "ikinci cevap" });
    assert.ok(a2.json.already, "ikinci gönderim 'already' dönmeli");
    const ansQ = await call("GET", "/admin/queue", null, token);
    const saved = ansQ.text;
    assert.ok(saved.includes("ilk cevap") && !saved.includes("ikinci cevap"), "cevap değişmemeli");
    const p1 = await call("POST", "/final/parca-a", { teamId: lt.id, text: "birinci teşhis" });
    const p2 = await call("POST", "/final/parca-a", { teamId: lt.id, text: "ikinci teşhis" });
    assert.ok(!p1.json.already && p2.json.already, "parça A kilitlenmeli");
    const doğru = require("./data/cases").FINAL.sonGece.ucYolSinavi.map((r) => r.dogruMiniVakaSira);
    const s1 = await call("POST", "/son-gece/sentez", { teamId: lt.id, satir1: 99, satir2: 99, satir3: 99 });
    const s2 = await call("POST", "/son-gece/sentez", { teamId: lt.id, satir1: doğru[0], satir2: doğru[1], satir3: doğru[2] });
    assert.strictEqual(s1.json.score, 0);
    assert.ok(s2.json.already && s2.json.score === 0, "Son Gece tekrar denenememeli");
    console.log("İlk cevap kilidi (mini vaka, parça A, son gece) çalışıyor. ✔");

    // 8c) İngilizce içerik (?lang=en) — metinler değişir, kodlar/puanlama aynı kalır
    const mvTr = (await call("GET", "/mini-vaka/1")).json;
    const mvEn = (await call("GET", "/mini-vaka/1?lang=en")).json;
    assert.strictEqual(mvTr.baslik, "KAYAN AN");
    assert.strictEqual(mvEn.baslik, "THE SLIPPERY MOMENT");
    assert.ok(!("dogruCozum" in mvEn), "İngilizce vakada da cevap anahtarı sızmamalı");
    assert.strictEqual(mvEn.heroGorsel, mvTr.heroGorsel);
    const metaEn = (await call("GET", "/mini-vaka?lang=en")).json;
    assert.strictEqual(metaEn.length, 9);
    const enTeam = (await call("POST", "/teams", { name: "EN Takımı" })).json;
    const kEn = (await call("POST", "/ana-kanit/A/reveal?lang=en", { teamId: enTeam.id, bolumNum: 1 })).json;
    assert.strictEqual(kEn.kod, "471");
    assert.ok(/Nobody/.test(kEn.notParcasi));
    const ulEn = (await call("POST", "/final/unlock?lang=en", { teamId: enTeam.id, code: "471-295-836" })).json;
    assert.ok(/Nobody/.test(ulEn.notTam[0]));
    const sgEn = (await call("GET", "/son-gece?lang=en")).json;
    assert.ok(/Our Way/.test(sgEn.ucYolSinavi[0].yolculuk));
    assert.ok(!JSON.stringify(sgEn).includes("dogruMiniVaka"), "Son Gece verisinde cevap sızmamalı");
    const sEn = (await call("POST", "/son-gece/sentez?lang=en", { teamId: enTeam.id, satir1: 3, satir2: 6, satir3: 8 })).json;
    assert.strictEqual(sEn.score, 120, "İngilizce de aynı doğru cevaplarla puanlanmalı");
    assert.strictEqual(sEn.detay[0].dogruMiniVakaBaslik, "THE BROKEN CHAIN");
    assert.strictEqual((await call("GET", "/mini-vaka/1?lang=xx")).json.baslik, "KAYAN AN", "bilinmeyen dil Türkçe'ye düşmeli");
    console.log("İngilizce içerik (vaka, kod, Son Gece) doğru geliyor, puanlama dilden bağımsız. ✔");

    // 8d) Yeni özellikler: takıma katılma kodu, skor tablosu, süre ayarı, vaka düzenleme, rapor, tartışma
    const jt = (await call("POST", "/teams", { name: "Kodlu Takım" })).json;
    assert.ok(/^\d{4}$/.test(jt.joinCode), "takım 4 haneli kod almalı");
    const j1 = await call("POST", "/teams/join", { name: "  kodlu takım ", code: jt.joinCode });
    assert.strictEqual(j1.json.id, jt.id, "ad + kod ile takıma katılınabilmeli");
    const j2 = await call("POST", "/teams/join", { name: "Kodlu Takım", code: jt.joinCode === "0000" ? "0001" : "0000" });
    assert.strictEqual(j2.status, 404, "yanlış kod reddedilmeli");

    const sb = (await call("GET", "/scoreboard")).json;
    assert.ok(sb.teams.length >= 1 && sb.teams[0].score !== null && sb.teams.every((t) => !("id" in t)));
    await call("PUT", "/admin/session", { scoresHidden: true }, token);
    const sbHidden = (await call("GET", "/scoreboard")).json;
    assert.ok(sbHidden.hidden && sbHidden.teams.every((t) => t.score === null), "gizliyken puan dönmemeli");
    await call("PUT", "/admin/session", { scoresHidden: false }, token);

    assert.strictEqual((await call("GET", "/session")).json.caseTimerSeconds, 180);
    assert.strictEqual((await call("PUT", "/admin/session", { caseTimerSeconds: 240 }, token)).json.caseTimerSeconds, 240);
    assert.strictEqual((await call("GET", "/session")).json.caseTimerSeconds, 240);
    assert.strictEqual((await call("PUT", "/admin/session", { caseTimerSeconds: -5 }, token)).status, 400);

    const disc = await call("GET", "/admin/discussion", null, token);
    assert.strictEqual(disc.json.cases.length, 9);
    assert.strictEqual((await call("GET", "/admin/discussion")).status, 401, "tartışma PIN ister");
    const rep = (await call("GET", "/admin/report", null, token)).json;
    assert.strictEqual(rep.perCase.length, 9);
    assert.ok(rep.teamCount >= 1);

    const cont = (await call("GET", "/admin/content", null, token)).json;
    const c1 = cont.cases[0].tr.current;
    const edited = { ...c1, baslik: "DEĞİŞEN BAŞLIK", kararSorusu: "Yeni soru?" };
    const put = await call("PUT", "/admin/content/1/tr", edited, token);
    assert.strictEqual(put.json.edited, true);
    assert.strictEqual((await call("GET", "/mini-vaka/1")).json.baslik, "DEĞİŞEN BAŞLIK", "düzenleme oyuncuya yansımalı");
    assert.strictEqual((await call("GET", "/mini-vaka/1?lang=en")).json.baslik, "THE SLIPPERY MOMENT", "diğer dil etkilenmemeli");
    assert.ok(!("dogruCozum" in (await call("GET", "/mini-vaka/1")).json), "düzenlenmiş vakada da cevap sızmamalı");
    const bad = await call("PUT", "/admin/content/1/tr", { ...edited, baslik: "" }, token);
    assert.strictEqual(bad.status, 400, "boş başlık reddedilmeli");
    const bk = (await call("GET", "/admin/export-backup", null, token)).json;
    assert.ok(bk.tables.case_overrides.length === 1, "yedek vaka düzenlemesini içermeli");
    await call("DELETE", "/admin/content/1/tr", null, token);
    assert.strictEqual((await call("GET", "/mini-vaka/1")).json.baslik, "KAYAN AN", "silinince özgün metne dönmeli");
    await call("PUT", "/admin/content/1/tr", edited, token);
    await call("POST", "/admin/restore", { confirm: "GERI YUKLE", backup: bk }, token);
    assert.strictEqual((await call("GET", "/mini-vaka/1")).json.baslik, "DEĞİŞEN BAŞLIK", "geri yükleme düzenlemeyi getirmeli");
    await call("DELETE", "/admin/content/1/tr", null, token);
    // Kod Defteri: açılan Ana Kanıt kodları takım kaydında görünür (başka telefondan katılınca da)
    const cb0 = (await call("GET", `/teams/${jt.id}`)).json;
    assert.deepStrictEqual(cb0.codes, [], "kanıt açılmadan kod görünmemeli");
    await call("POST", "/ana-kanit/B/reveal", { teamId: jt.id, bolumNum: 2 });
    const cb1 = (await call("GET", `/teams/${jt.id}`)).json;
    assert.deepStrictEqual(cb1.codes, [{ harf: "B", kod: "295" }], "açılan kod defterde görünmeli");
    const cbJoin = (await call("POST", "/teams/join", { name: "Kodlu Takım", code: jt.joinCode })).json;
    assert.strictEqual(cbJoin.codes.length, 1);
    // Özet metni oyuncuya gider (olay özeti ekranda gösteriliyor)
    assert.ok((await call("GET", "/mini-vaka/1")).json.olayAni.ozet.length > 30);
    console.log("Takım kodu, skor tablosu, süre ayarı, rapor, tartışma ve vaka düzenleme çalışıyor. ✔");

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
