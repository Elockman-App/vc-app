import React, { useEffect, useState, useCallback, useRef } from "react";
import { api, adminToken } from "../api";

export default function AdminDashboard() {
  // authed: null = kontrol ediliyor, false = giriş gerekli, true = giriş yapıldı
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    if (!adminToken.get()) {
      setAuthed(false);
    } else {
      api.checkAdmin().then(() => setAuthed(true)).catch(() => setAuthed(false));
    }
    const onUnauthorized = () => setAuthed(false);
    window.addEventListener("admin-unauthorized", onUnauthorized);
    return () => window.removeEventListener("admin-unauthorized", onUnauthorized);
  }, []);

  if (authed === null) {
    return (
      <div className="admin-wrap">
        <p className="muted" style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</p>
      </div>
    );
  }
  if (!authed) return <AdminLogin onLoggedIn={() => setAuthed(true)} />;
  return (
    <AdminPanel
      onLogout={() => {
        adminToken.clear();
        setAuthed(false);
      }}
    />
  );
}

// SQLite datetime('now') UTC ve "YYYY-MM-DD HH:MM:SS" biçiminde (saat dilimi yok) döner
function parseUtc(s) {
  if (!s) return null;
  const str = String(s);
  const d = new Date(str.includes("T") ? str : str.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? null : d;
}

function minutesSince(s, nowMs) {
  const d = parseUtc(s);
  return d ? Math.max(0, Math.floor((nowMs - d.getTime()) / 60000)) : null;
}

function formatClock(d) {
  return d ? d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "-";
}

const STUCK_MINUTES = 10;

// ---- Yeni cevap sesi ----
let audioCtx = null;
function playBeep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    [880, 1175].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const t0 = audioCtx.currentTime + i * 0.16;
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t0);
      o.stop(t0 + 0.15);
    });
  } catch (e) {}
}

// ---- Yedek: panel, son yedeği tarayıcıda saklar (sunucu ücretsiz planda veri kaybedebilir) ----
const BACKUP_LS = "vc_admin_last_backup";

function readStoredBackup() {
  try {
    return JSON.parse(localStorage.getItem(BACKUP_LS) || "null");
  } catch (e) {
    return null;
  }
}

function storeBackup(dump) {
  try {
    if (dump && dump.tables && dump.tables.teams.length > 0) {
      localStorage.setItem(
        BACKUP_LS,
        JSON.stringify({ savedAt: Date.now(), teamCount: dump.tables.teams.length, dump })
      );
    } else {
      localStorage.removeItem(BACKUP_LS);
    }
  } catch (e) {}
}

function clearStoredBackup() {
  try {
    localStorage.removeItem(BACKUP_LS);
  } catch (e) {}
}

function saveJsonFile(obj, fileName) {
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- İlerleme: oyun 35 adım (3 bölüm x 10 adım + Final/Son Gece 5 adım) ----
const PROGRESS_TOTAL = 35;
const FINAL_STEPS = {
  FINAL_KILIT: 30,
  FINAL_PARCA_A: 31,
  SON_GECE_ACILIS: 32,
  SON_GECE_KANIT: 33,
  SON_GECE_SENTEZ: 34,
  KAPANIS: 35
};

function progressPercent(t) {
  const st = t.currentStage;
  if (st in FINAL_STEPS) return Math.round((FINAL_STEPS[st] / PROGRESS_TOTAL) * 100);
  if (st === "BRIEFING") return 0;
  const base = ((t.currentBolum || 1) - 1) * 10;
  const k = ((t.currentMiniVaka || 1) - 1) % 3;
  let within = 0;
  if (st === "OLAY_ANI") within = k * 3;
  else if (st === "KANIT_ANI") within = k * 3 + 1;
  else if (st === "KARAR_ANI") within = k * 3 + 2;
  else if (st === "ANA_KANIT") within = 9;
  return Math.min(100, Math.round(((base + within) / PROGRESS_TOTAL) * 100));
}

const GROUPS = ["Brifing", "Bölüm 1", "Bölüm 2", "Bölüm 3", "Final", "Son Gece", "Tamamladı"];

function stageGroup(t) {
  const st = t.currentStage;
  if (st === "BRIEFING") return "Brifing";
  if (st === "KAPANIS") return "Tamamladı";
  if (st.startsWith("FINAL")) return "Final";
  if (st.startsWith("SON_GECE")) return "Son Gece";
  return `Bölüm ${t.currentBolum || 1}`;
}

function AdminLogin({ onLoggedIn }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!pin.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.login(pin.trim());
      adminToken.set(r.token);
      onLoggedIn();
    } catch (err) {
      setError(err.message || "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.05em", color: "#D4AF37" }}>
          VC DEDEKTİFLERİ 2.0 — ADMİN PANELİ
        </div>
        <h1 style={{ color: "#fff", margin: 0, fontSize: "1.4rem" }}>Giriş</h1>
      </div>
      <div style={{ maxWidth: 360, margin: "2rem auto", padding: "0 1rem" }}>
        <form className="admin-card" onSubmit={submit}>
          <h3 style={{ marginTop: 0 }}>Admin PIN</h3>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            PIN, sunucu konsolunda (sunucuyu başlattığınız pencere) veya Render'daki ADMIN_PIN ayarında yazar.
          </p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            className="answer-input"
            style={{ minHeight: "auto", padding: "0.6rem", fontSize: "1rem", marginBottom: "0.6rem" }}
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          {error && (
            <div style={{ color: "#c62828", fontSize: "0.85rem", fontWeight: 700, marginBottom: 8 }}>
              {error}
            </div>
          )}
          <button className="btn" type="submit" disabled={busy || !pin.trim()} style={{ width: "100%" }}>
            {busy ? "Kontrol ediliyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("takimlar");
  const [qr, setQr] = useState(null);
  const [overview, setOverview] = useState(null);
  const [queue, setQueue] = useState(null);
  const [busy, setBusy] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState(null);
  const [scored, setScored] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [resetText, setResetText] = useState("");
  const [resetMsg, setResetMsg] = useState(null);
  const [offline, setOffline] = useState(false);
  const [lastOk, setLastOk] = useState(null);
  const [sessionNameDraft, setSessionNameDraft] = useState(null);
  const [storedBackup, setStoredBackup] = useState(() => readStoredBackup());
  const [restoreMsg, setRestoreMsg] = useState(null);
  const [soundOn, setSoundOn] = useState(() => {
    try {
      return localStorage.getItem("vc_admin_sound") !== "0";
    } catch (e) {
      return true;
    }
  });
  const prevPending = useRef(null);
  const tickRef = useRef(0);
  const fileInputRef = useRef(null);
  const [hideScores, setHideScores] = useState(() => {
    try {
      return localStorage.getItem("vc_hide_scores") === "1";
    } catch (e) {
      return false;
    }
  });

  function toggleHideScores(v) {
    setHideScores(v);
    try {
      localStorage.setItem("vc_hide_scores", v ? "1" : "0");
    } catch (e) {}
  }

  function toggleSound(v) {
    setSoundOn(v);
    try {
      localStorage.setItem("vc_admin_sound", v ? "1" : "0");
    } catch (e) {}
    if (v) playBeep(); // tarayıcı sesi bu tıklamayla etkinleştirir
  }

  // Sunucudan tam yedeği al ve tarayıcıda sakla (takım yoksa saklananı siler)
  const snapshotBackup = useCallback(async () => {
    try {
      const d = await api.exportBackup();
      storeBackup(d);
      setStoredBackup(readStoredBackup());
    } catch (e) {}
  }, []);

  const refresh = useCallback(async () => {
    const [o, q, sc] = await Promise.allSettled([api.overview(), api.queue(), api.getScored()]);
    if (o.status === "fulfilled") setOverview(o.value);
    if (q.status === "fulfilled") setQueue(q.value);
    if (sc.status === "fulfilled") setScored(sc.value);
    // Ana veri (overview) alınamıyorsa sunucuya ulaşılamıyor demektir
    if (o.status === "fulfilled") {
      setOffline(false);
      setLastOk(new Date());
      // Takım varken yaklaşık 30 sn'de bir yedeği tarayıcıda tazele
      if (o.value.teamCount > 0) {
        if (tickRef.current % 8 === 0) snapshotBackup();
        tickRef.current += 1;
      } else {
        tickRef.current = 0;
      }
    } else {
      setOffline(true);
    }
  }, [snapshotBackup]);

  useEffect(() => {
    api.getQr().then(setQr).catch(() => {});
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  async function handleReset() {
    if (resetText !== "SIFIRLA") return;
    setBusy(true);
    setResetMsg(null);
    try {
      const r = await api.resetSession(resetText);
      if (r.backup) saveJsonFile(r.backup, `vc_dedektifleri_${r.backupFile}`);
      clearStoredBackup();
      setStoredBackup(null);
      setResetMsg(
        `Oturum sıfırlandı. ${r.backedUpTeams} takımın yedeği bilgisayarınıza indirildi (${r.backupFile}).`
      );
      setShowReset(false);
      setResetText("");
      refresh();
    } catch (err) {
      setResetMsg(err.message || "Sıfırlama başarısız.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClearBroadcast() {
    try {
      await api.sendBroadcast("");
      setBroadcastStatus("Duyuru kaldırıldı.");
      setTimeout(() => setBroadcastStatus(null), 3000);
    } catch (e) {
      setBroadcastStatus("Duyuru kaldırılamadı.");
    }
  }

  async function doRestore(dump, label) {
    setRestoreMsg(null);
    try {
      const r = await api.restoreBackup(dump);
      setRestoreMsg(`${label}: ${r.restoredTeams} takım geri yüklendi.`);
      tickRef.current = 0;
      refresh();
    } catch (e) {
      setRestoreMsg(e.message || "Geri yükleme başarısız.");
    }
  }

  async function handleRestoreFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dump = JSON.parse(await file.text());
      const n = dump?.tables?.teams?.length ?? 0;
      if (
        !window.confirm(
          `Mevcut TÜM veri silinip yedekteki ${n} takım geri yüklenecek. Devam edilsin mi?`
        )
      )
        return;
      await doRestore(dump, "Dosyadan geri yükleme");
    } catch (err) {
      setRestoreMsg("Yedek dosyası okunamadı: " + (err.message || "geçersiz dosya"));
    }
  }

  async function handleBackupDownload() {
    try {
      await api.downloadBackup();
    } catch (e) {
      window.alert(e.message || "Yedek indirilemedi.");
    }
  }

  async function saveSessionName() {
    try {
      await api.setSession({ name: sessionNameDraft });
      setSessionNameDraft(null);
      refresh();
    } catch (e) {
      window.alert(e.message || "Oturum adı kaydedilemedi.");
    }
  }

  async function handleAnswersCsv() {
    try {
      await api.downloadAnswersCsv();
    } catch (e) {
      window.alert(e.message || "Dosya indirilemedi.");
    }
  }

  async function handleCsv() {
    try {
      await api.downloadCsv();
    } catch (e) {
      window.alert(e.message || "CSV indirilemedi.");
    }
  }

  async function toggleFinalParcaA(enabled) {
    await api.setSession({ finalParcaAEnabled: enabled });
    refresh();
  }

  async function handleSendBroadcast(e) {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    try {
      await api.sendBroadcast(broadcastText);
      setBroadcastStatus("Duyuru tüm takımlara gönderildi! 📢");
      setBroadcastText("");
      setTimeout(() => setBroadcastStatus(null), 3000);
    } catch (e) {
      setBroadcastStatus("Duyuru gönderilemedi.");
    }
  }

  const pendingTotal =
    (queue?.pendingAnswers?.length || 0) +
    (queue?.pendingFinalA?.length || 0) +
    (queue?.anaKanitPending?.length || 0);

  // Yeni cevap: ses + sekme başlığında bekleyen sayısı
  useEffect(() => {
    if (!queue) return;
    if (prevPending.current !== null && pendingTotal > prevPending.current && soundOn) playBeep();
    prevPending.current = pendingTotal;
    document.title = pendingTotal > 0 ? `(${pendingTotal}) Admin — VC Dedektifleri` : "Admin — VC Dedektifleri";
  }, [pendingTotal, queue, soundOn]);

  useEffect(() => {
    const original = document.title;
    return () => {
      document.title = original;
    };
  }, []);

  const teamsSorted = [...(overview?.teams || [])].sort((a, b) => b.totalScore - a.totalScore);
  const top3 = teamsSorted.slice(0, 3);

  return (
    <div className="admin-wrap">
      {offline && (
        <div style={{ background: "#c62828", color: "#fff", padding: "0.5rem 1.4rem", fontWeight: 700, fontSize: "0.9rem" }}>
          ⚠ Sunucuya ulaşılamıyor — ekrandaki veriler eski olabilir. Son başarılı güncelleme: {formatClock(lastOk)}
        </div>
      )}
      {!offline && overview && overview.teamCount === 0 && storedBackup && storedBackup.teamCount > 0 && (
        <div className="admin-banner">
          <span>
            Sunucudaki veri sıfırlanmış görünüyor (sunucu yeniden başlamış olabilir). Bu tarayıcıdaki son yedek:{" "}
            <b>{storedBackup.teamCount} takım</b>, {formatClock(new Date(storedBackup.savedAt))}.
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            <button
              className="btn"
              style={{ width: "auto", margin: "0 8px 0 0", padding: "0.35em 0.9em", fontSize: "0.82rem" }}
              onClick={() => doRestore(storedBackup.dump, "Otomatik yedek")}
            >
              Yedeği geri yükle
            </button>
            <button
              className="btn secondary"
              style={{ width: "auto", margin: 0, padding: "0.35em 0.9em", fontSize: "0.82rem", color: "#101b3d", borderColor: "#101b3d" }}
              onClick={() => {
                clearStoredBackup();
                setStoredBackup(null);
              }}
            >
              Yoksay
            </button>
          </span>
        </div>
      )}
      <div className="admin-header">
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.05em", color: "#D4AF37" }}>
          VC DEDEKTİFLERİ 2.0 — ADMİN PANELİ
          {!offline && lastOk && (
            <span style={{ marginLeft: 12, color: "#9fb0d8" }}>Son güncelleme: {formatClock(lastOk)}</span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1 style={{ color: "#fff", margin: 0, fontSize: "1.4rem" }}>
            {overview?.sessionName || "Yükleniyor..."}
          </h1>
          <button
            className="btn secondary"
            style={{ width: "auto", margin: 0, padding: "0.3em 0.9em", fontSize: "0.8rem" }}
            onClick={onLogout}
          >
            Çıkış
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <div>
          <div className="admin-card qr-panel">
            <h3 style={{ marginTop: 0 }}>Katılım için Taratın</h3>
            {qr ? (
              <>
                <img src={qr.qrDataUrl} alt="QR kod" />
                <div className="muted" style={{ wordBreak: "break-all", marginTop: 8 }}>
                  {qr.playUrl}
                </div>
              </>
            ) : (
              <p className="muted">QR kod üretiliyor...</p>
            )}
          </div>

          <div className="admin-card">
            <h3 style={{ marginTop: 0, fontSize: "1rem" }}>📢 Canlı Duyuru Yayınla</h3>
            <form onSubmit={handleSendBroadcast}>
              <input
                type="text"
                className="answer-input"
                style={{ minHeight: "auto", padding: "0.6rem", fontSize: "0.9rem", marginBottom: "0.5rem" }}
                placeholder="Örn: 2. Bölüme Geçiliyor! Son 5 Dakika!"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn"
                  type="submit"
                  disabled={!broadcastText.trim()}
                  style={{ fontSize: "0.85rem", padding: "0.5em 1em" }}
                >
                  Tüm Ekranlara Gönder
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={handleClearBroadcast}
                  style={{ fontSize: "0.85rem", padding: "0.5em 1em", color: "#101b3d", borderColor: "#101b3d" }}
                >
                  Duyuruyu Kaldır
                </button>
              </div>
            </form>
            {broadcastStatus && (
              <div style={{ fontSize: "0.8rem", color: "#22c55e", marginTop: 6, fontWeight: 700 }}>
                {broadcastStatus}
              </div>
            )}
            {overview?.broadcast && (
              <div className="muted" style={{ fontSize: "0.8rem", marginTop: 8 }}>
                Yayında: “{overview.broadcast.message}”
                <br />
                <b>
                  {overview.broadcast.seenCount} / {overview.teamCount} takım gördü
                </b>
              </div>
            )}
          </div>

          <div className="admin-card">
            <h3 style={{ marginTop: 0, fontSize: "1rem" }}>Oturum Kontrolü & Rapor</h3>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              {overview?.teamCount ?? 0} takım katıldı.
            </p>

            <button
              className="btn secondary"
              onClick={handleCsv}
              style={{ width: "100%", marginBottom: "0.5rem", color: "#101b3d", borderColor: "#101b3d" }}
            >
              📊 Sonuçları CSV (Excel) İndir
            </button>
            <button
              className="btn secondary"
              onClick={handleAnswersCsv}
              style={{ width: "100%", marginBottom: "0.8rem", color: "#101b3d", borderColor: "#101b3d" }}
            >
              📝 Cevap Detaylarını CSV İndir
            </button>

            <div style={{ marginBottom: 10 }}>
              <div className="muted" style={{ fontSize: "0.78rem", marginBottom: 4 }}>Oturum adı</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text"
                  className="answer-input"
                  style={{ minHeight: "auto", padding: "0.45rem", fontSize: "0.88rem", flex: 1, margin: 0 }}
                  value={sessionNameDraft ?? overview?.sessionName ?? ""}
                  maxLength={80}
                  onChange={(e) => setSessionNameDraft(e.target.value)}
                />
                <button
                  className="btn"
                  style={{ width: "auto", margin: 0, padding: "0.4em 0.9em", fontSize: "0.8rem" }}
                  disabled={sessionNameDraft === null || !sessionNameDraft.trim()}
                  onClick={saveSessionName}
                >
                  Kaydet
                </button>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", marginBottom: 10 }}>
              <input type="checkbox" checked={hideScores} onChange={(e) => toggleHideScores(e.target.checked)} />
              Puanları bu ekranda gizle (projeksiyon)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", marginBottom: 10 }}>
              <input type="checkbox" checked={soundOn} onChange={(e) => toggleSound(e.target.checked)} />
              🔔 Kuyruğa yeni cevap gelince ses çal
            </label>

            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <button
                className="btn secondary"
                onClick={handleBackupDownload}
                style={{ flex: 1, margin: 0, padding: "0.45em 0.6em", fontSize: "0.8rem", color: "#101b3d", borderColor: "#101b3d" }}
              >
                💾 Yedeği indir
              </button>
              <button
                className="btn secondary"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{ flex: 1, margin: 0, padding: "0.45em 0.6em", fontSize: "0.8rem", color: "#101b3d", borderColor: "#101b3d" }}
              >
                ♻️ Yedekten yükle
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: "none" }}
                onChange={handleRestoreFile}
              />
            </div>
            {restoreMsg && (
              <div style={{ fontSize: "0.8rem", marginBottom: 10, fontWeight: 700, wordBreak: "break-word" }}>{restoreMsg}</div>
            )}

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={overview?.finalParcaAEnabled ?? true}
                onChange={(e) => toggleFinalParcaA(e.target.checked)}
              />
              Final Parça A oynatılsın
            </label>
            {!showReset ? (
              <button className="btn danger" style={{ width: "100%" }} disabled={busy} onClick={() => setShowReset(true)}>
                Oturumu Sıfırla
              </button>
            ) : (
              <div style={{ border: "1.5px solid #c62828", borderRadius: 8, padding: "0.7rem" }}>
                <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>
                  Tüm takımlar ve puanlar silinecek (silmeden önce otomatik yedek alınır). Onaylamak için{" "}
                  <b>SIFIRLA</b> yazın.
                </div>
                <input
                  type="text"
                  className="answer-input"
                  style={{ minHeight: "auto", padding: "0.5rem", fontSize: "0.9rem", marginBottom: 6 }}
                  value={resetText}
                  onChange={(e) => setResetText(e.target.value)}
                  placeholder="SIFIRLA"
                  autoFocus
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn danger"
                    style={{ flex: 1, margin: 0 }}
                    disabled={busy || resetText !== "SIFIRLA"}
                    onClick={handleReset}
                  >
                    Sıfırla
                  </button>
                  <button
                    className="btn secondary"
                    style={{ flex: 1, margin: 0, color: "#101b3d", borderColor: "#101b3d" }}
                    onClick={() => {
                      setShowReset(false);
                      setResetText("");
                    }}
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            )}
            {resetMsg && (
              <div style={{ fontSize: "0.8rem", marginTop: 8, fontWeight: 700, wordBreak: "break-all" }}>{resetMsg}</div>
            )}
          </div>
        </div>

        <div>
          {hideScores && teamsSorted.length > 0 && (
            <div className="admin-card" style={{ textAlign: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--navy)" }}>🏆 Sonuçlar finalde açıklanacak</h3>
            </div>
          )}
          {!hideScores && top3.length > 0 && (
            <div className="admin-card">
              <h3 style={{ marginTop: 0, fontSize: "1rem", color: "var(--navy)" }}>🏆 LİDERLİK PODYUMU</h3>
              <div className="podium-container">
                {top3[1] && (
                  <div className="podium-place p2">
                    <div className="podium-rank">🥈 2.</div>
                    <div className="podium-name">{top3[1].name}</div>
                    <div className="podium-score">{top3[1].totalScore} PTS</div>
                  </div>
                )}
                {top3[0] && (
                  <div className="podium-place p1">
                    <div className="podium-rank">🥇 1.</div>
                    <div className="podium-name">{top3[0].name}</div>
                    <div className="podium-score">{top3[0].totalScore} PTS</div>
                  </div>
                )}
                {top3[2] && (
                  <div className="podium-place p3">
                    <div className="podium-rank">🥉 3.</div>
                    <div className="podium-name">{top3[2].name}</div>
                    <div className="podium-score">{top3[2].totalScore} PTS</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="tabs">
            <button className={tab === "takimlar" ? "active" : ""} onClick={() => setTab("takimlar")}>
              Canlı Takımlar ({overview?.teamCount || 0})
            </button>
            <button className={tab === "kuyruk" ? "active" : ""} onClick={() => setTab("kuyruk")}>
              Değerlendirme Kuyruğu {pendingTotal > 0 && `(${pendingTotal})`}
            </button>
            <button className={tab === "puanlanan" ? "active" : ""} onClick={() => setTab("puanlanan")}>
              Puanlananlar
            </button>
          </div>

          {tab === "takimlar" && <TeamsTable
              overview={overview}
              hideScores={hideScores}
              onChanged={refresh}
              onTeamDeleted={snapshotBackup}
            />}
          {tab === "kuyruk" && <EvaluationQueue queue={queue} onScored={refresh} />}
          {tab === "puanlanan" && <ScoredList scored={scored} onScored={refresh} />}
        </div>
      </div>
    </div>
  );
}


function TeamsTable({ overview, hideScores, onChanged, onTeamDeleted }) {
  const nowMs = overview?.serverTime ? Date.parse(overview.serverTime) : Date.now();
  const max = overview?.maxTotalScore || 1200;
  const teams = overview?.teams || [];
  const groupCounts = {};
  teams.forEach((t) => {
    const g = stageGroup(t);
    groupCounts[g] = (groupCounts[g] || 0) + 1;
  });

  return (
    <div className="admin-card">
      {teams.length > 0 && (
        <div className="chip-row">
          {GROUPS.map((g) => (
            <span key={g} className={"chip" + (groupCounts[g] ? " on" : "")}>
              {g}: <b>{groupCounts[g] || 0}</b>
            </span>
          ))}
        </div>
      )}
      <div className="table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Takım</th>
            <th>Aşama</th>
            <th>Bölüm</th>
            <th>Mini Vaka</th>
            <th>Cevap</th>
            <th>Son Hareket</th>
            <th>Puan</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <TeamRow key={t.id} t={t} nowMs={nowMs} max={max} hideScores={hideScores} onChanged={onChanged} onTeamDeleted={onTeamDeleted} />
          ))}
          {teams.length === 0 && (
            <tr>
              <td colSpan={7} className="muted" style={{ textAlign: "center", padding: "1.5rem" }}>
                Henüz takım katılmadı. QR kodu paylaşın.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function TeamRow({ t, nowMs, max, hideScores, onChanged, onTeamDeleted }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(t.name);
  const [members, setMembers] = useState(t.members || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [err, setErr] = useState(null);

  const mins = minutesSince(t.updatedAt, nowMs);
  const finished = t.currentStage === "KAPANIS";
  const stuck = !finished && mins !== null && mins >= STUCK_MINUTES;
  const joined = parseUtc(t.createdAt);

  async function save() {
    setErr(null);
    try {
      await api.renameTeam(t.id, name, members);
      setEditing(false);
      onChanged();
    } catch (e) {
      setErr(e.message || "Kaydedilemedi.");
    }
  }

  async function remove() {
    setErr(null);
    try {
      await api.deleteTeam(t.id);
      onChanged();
      if (onTeamDeleted) onTeamDeleted(); // tarayıcıdaki yedeği güncelle (son takım silindiyse temizler)
    } catch (e) {
      setErr(e.message || "Silinemedi.");
      setConfirmDelete(false);
    }
  }

  const linkBtn = { background: "none", border: "none", color: "#101b3d", textDecoration: "underline", cursor: "pointer", fontSize: "0.75rem", padding: 0, marginRight: 10 };

  return (
    <tr style={stuck ? { background: "#fff4e5" } : undefined}>
      <td>
        {editing ? (
          <div>
            <input
              type="text"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "0.3em", marginBottom: 4 }}
              placeholder="Takım adı"
            />
            <input
              type="text"
              value={members}
              maxLength={300}
              onChange={(e) => setMembers(e.target.value)}
              style={{ width: "100%", padding: "0.3em", marginBottom: 4 }}
              placeholder="Üyeler"
            />
            <button style={linkBtn} disabled={!name.trim()} onClick={save}>Kaydet</button>
            <button
              style={linkBtn}
              onClick={() => {
                setEditing(false);
                setName(t.name);
                setMembers(t.members || "");
                setErr(null);
              }}
            >
              Vazgeç
            </button>
          </div>
        ) : (
          <div>
            <b>{t.name}</b>
            {t.members && <div className="muted" style={{ fontSize: "0.78rem" }}>{t.members}</div>}
            <div className="muted" style={{ fontSize: "0.72rem" }}>
              Katıldı: {joined ? formatClock(joined) : "-"}
            </div>
            <div style={{ marginTop: 3 }}>
              <button style={linkBtn} onClick={() => setEditing(true)}>Düzenle</button>
              {!confirmDelete ? (
                <button style={{ ...linkBtn, color: "#c62828" }} onClick={() => setConfirmDelete(true)}>Sil</button>
              ) : (
                <span style={{ fontSize: "0.75rem" }}>
                  Bu takım ve tüm cevapları silinsin mi (yedek alınır)?{" "}
                  <button style={{ ...linkBtn, color: "#c62828", fontWeight: 700 }} onClick={remove}>Evet, sil</button>
                  <button style={linkBtn} onClick={() => setConfirmDelete(false)}>Vazgeç</button>
                </span>
              )}
            </div>
          </div>
        )}
        {err && <div style={{ color: "#c62828", fontSize: "0.75rem", fontWeight: 700 }}>{err}</div>}
      </td>
      <td>
        {t.stageLabel}
        <div className="progress-track" title={`Oyun ilerlemesi: %${progressPercent(t)}`}>
          <div
            className={"progress-fill" + (finished ? " done" : stuck ? " stuck" : "")}
            style={{ width: `${progressPercent(t)}%` }}
          />
        </div>
        <div className="muted" style={{ fontSize: "0.7rem" }}>%{progressPercent(t)}</div>
      </td>
      <td>{t.currentBolum}</td>
      <td>{t.currentMiniVaka}</td>
      <td>{t.answeredCount} / 9</td>
      <td style={{ fontSize: "0.82rem", color: stuck ? "#b45309" : undefined, fontWeight: stuck ? 700 : 400 }}>
        {finished ? "Tamamladı ✔" : mins === null ? "-" : mins === 0 ? "az önce" : `${mins} dk önce`}
        {stuck && <div>⚠ hareketsiz</div>}
      </td>
      <td style={{ fontWeight: 700 }}>{hideScores ? "•••" : `${t.totalScore} / ${max}`}</td>
    </tr>
  );
}

function EvaluationQueue({ queue, onScored }) {
  const [teamFilter, setTeamFilter] = useState("");
  const [newestFirst, setNewestFirst] = useState(false);

  if (!queue) return <p className="muted">Yükleniyor...</p>;

  const nothing =
    queue.pendingAnswers.length === 0 &&
    queue.pendingFinalA.length === 0 &&
    queue.anaKanitPending.length === 0;

  const teamNames = [
    ...new Set(
      [...queue.pendingAnswers, ...queue.pendingFinalA, ...queue.anaKanitPending].map((i) => i.teamName)
    )
  ].sort((a, b) => a.localeCompare(b, "tr"));

  const byTeam = (i) => !teamFilter || i.teamName === teamFilter;
  const order = (key) => (a, b) =>
    (newestFirst ? -1 : 1) * String(a[key] || "").localeCompare(String(b[key] || ""));

  const answers = queue.pendingAnswers.filter(byTeam).sort(order("submittedAt"));
  const finalA = queue.pendingFinalA.filter(byTeam).sort(order("submittedAt"));
  const anaKanit = queue.anaKanitPending.filter(byTeam).sort(order("revealedAt"));

  return (
    <div>
      {!nothing && (
        <div className="admin-card" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: "0.85rem" }}>
            Takım:{" "}
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} style={{ padding: "0.3em" }}>
              <option value="">Tümü ({teamNames.length})</option>
              {teamNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: "0.85rem" }}>
            Sıra:{" "}
            <select
              value={newestFirst ? "yeni" : "eski"}
              onChange={(e) => setNewestFirst(e.target.value === "yeni")}
              style={{ padding: "0.3em" }}
            >
              <option value="eski">En çok bekleyen önce</option>
              <option value="yeni">En yeni önce</option>
            </select>
          </label>
          <span className="muted" style={{ fontSize: "0.8rem" }}>
            {answers.length + finalA.length + anaKanit.length} öğe gösteriliyor
          </span>
        </div>
      )}

      {nothing && (
        <div className="admin-card">
          <p className="muted" style={{ textAlign: "center" }}>
            Değerlendirme bekleyen cevap yok. 🎉
          </p>
        </div>
      )}

      {answers.map((item) => (
        <MiniVakaQueueItem key={item.answerId} item={item} onScored={onScored} />
      ))}

      {finalA.map((item) => (
        <FinalAQueueItem key={item.teamId} item={item} onScored={onScored} />
      ))}

      {anaKanit.length > 0 && (
        <div className="admin-card">
          <h4 style={{ marginTop: 0 }}>Ana Kanıt Sentez Puanları (sözlü, 0-30)</h4>
          {anaKanit.map((item) => (
            <AnaKanitQueueItem key={item.teamId + item.harf} item={item} onScored={onScored} />
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreInput({ max, suggested, initial, onSubmit, submitLabel = "Puanı Kaydet" }) {
  const start = initial != null ? initial : suggested;
  const [value, setValue] = useState(start != null ? String(start) : "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const trimmed = value.trim();
  const num = Number(trimmed);
  const valid = trimmed !== "" && Number.isFinite(num) && num >= 0 && num <= max;

  async function handleSave() {
    if (!valid) {
      setError(`0 ile ${max} arasında bir puan girin.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(Math.round(num));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || "Puan kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {suggested != null && (
        <div className="muted" style={{ fontSize: "0.82rem", marginBottom: 4 }}>
          💡 Yerel öneri (anahtar kelime örtüşmesi, yapay zeka değildir): <b>{suggested}</b> / {max}
        </div>
      )}
      <div className="score-input-row">
        <input
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder={`0-${max}`}
        />
        <span className="muted">/ {max}</span>
        <button
          className="btn"
          style={{ width: "auto", padding: "0.5em 1em", margin: 0 }}
          disabled={!valid || saving}
          onClick={handleSave}
        >
          {saving ? "Kaydediliyor..." : submitLabel}
        </button>
        {saved && <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.85rem" }}>✔ Kaydedildi</span>}
      </div>
      {error && <div style={{ color: "#c62828", fontSize: "0.82rem", fontWeight: 700, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function ScoredList({ scored, onScored }) {
  if (!scored) return <p className="muted">Yükleniyor...</p>;
  const nothing =
    scored.answers.length === 0 && scored.finalA.length === 0 && scored.anaKanit.length === 0;

  return (
    <div>
      {nothing && (
        <div className="admin-card">
          <p className="muted" style={{ textAlign: "center" }}>Henüz puanlanmış bir cevap yok.</p>
        </div>
      )}

      {scored.answers.map((item) => (
        <div className="queue-item" key={item.answerId}>
          <div>
            <b>{item.teamName}</b> — Mini Vaka {item.miniVakaSira}: {item.miniVakaBaslik}
          </div>
          <div className="answer-text">{item.answerText}</div>
          <div className="ref-text">Referans Çözüm: {item.dogruCozum}</div>
          <ScoreInput
            max={item.maxScore}
            initial={item.score}
            submitLabel="Puanı Güncelle"
            onSubmit={async (score) => {
              await api.scoreMiniVaka(item.answerId, score);
              onScored();
            }}
          />
        </div>
      ))}

      {scored.finalA.map((item) => (
        <div className="queue-item" style={{ borderColor: "#D4AF37" }} key={"fa" + item.teamId}>
          <div>
            <b>{item.teamName}</b> — Final Parça A (Örüntü Haritası)
          </div>
          <div className="answer-text">{item.answerText}</div>
          <ScoreInput
            max={item.maxScore}
            initial={item.score}
            submitLabel="Puanı Güncelle"
            onSubmit={async (score) => {
              await api.scoreFinalParcaA(item.teamId, score);
              onScored();
            }}
          />
        </div>
      ))}

      {scored.anaKanit.length > 0 && (
        <div className="admin-card">
          <h4 style={{ marginTop: 0 }}>Ana Kanıt Sentez Puanları (0-30)</h4>
          {scored.anaKanit.map((item) => (
            <div
              key={item.teamId + item.harf}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}
            >
              <span>
                {item.teamName} — Ana Kanıt {item.harf}
              </span>
              <ScoreInput
                max={item.maxScore}
                initial={item.score}
                submitLabel="Güncelle"
                onSubmit={async (score) => {
                  await api.scoreAnaKanit(item.teamId, item.harf, score);
                  onScored();
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniVakaQueueItem({ item, onScored }) {
  return (
    <div className="queue-item">
      <div>
        <b>{item.teamName}</b> — Mini Vaka {item.miniVakaSira}: {item.miniVakaBaslik}
      </div>
      <div className="answer-text">{item.answerText}</div>
      <div className="ref-text">Referans Çözüm: {item.dogruCozum}</div>
      <ScoreInput
        max={item.maxScore}
        suggested={item.suggestedScore}
        onSubmit={async (score) => {
          await api.scoreMiniVaka(item.answerId, score);
          onScored();
        }}
      />
    </div>
  );
}

function FinalAQueueItem({ item, onScored }) {
  return (
    <div className="queue-item" style={{ borderColor: "#D4AF37" }}>
      <div>
        <b>{item.teamName}</b> — Final Parça A (Örüntü Haritası)
      </div>
      <div className="answer-text">{item.answerText}</div>
      <ScoreInput
        max={item.maxScore}
        suggested={item.suggestedScore}
        onSubmit={async (score) => {
          await api.scoreFinalParcaA(item.teamId, score);
          onScored();
        }}
      />
    </div>
  );
}

function AnaKanitQueueItem({ item, onScored }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
      <span>
        {item.teamName} — Ana Kanıt {item.harf}
      </span>
      <ScoreInput
        max={item.maxScore}
        onSubmit={async (score) => {
          await api.scoreAnaKanit(item.teamId, item.harf, score);
          onScored();
        }}
      />
    </div>
  );
}
