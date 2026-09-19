import React, { useEffect, useState, useCallback } from "react";
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
            PIN, sunucu konsolunda (start.bat penceresi) veya Render'daki ADMIN_PIN ayarında yazar.
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

  const refresh = useCallback(() => {
    api.overview().then(setOverview).catch(() => {});
    api.queue().then(setQueue).catch(() => {});
    api.getScored().then(setScored).catch(() => {});
  }, []);

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
      setResetMsg(`Oturum sıfırlandı. Yedek: ${r.backupFile} (${r.backedUpTeams} takım)`);
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

  const teamsSorted = [...(overview?.teams || [])].sort((a, b) => b.totalScore - a.totalScore);
  const top3 = teamsSorted.slice(0, 3);

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.05em", color: "#D4AF37" }}>
          VC DEDEKTİFLERİ 2.0 — ADMİN PANELİ
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
          </div>

          <div className="admin-card">
            <h3 style={{ marginTop: 0, fontSize: "1rem" }}>Oturum Kontrolü & Rapor</h3>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              {overview?.teamCount ?? 0} takım katıldı.
            </p>

            <button
              className="btn secondary"
              onClick={handleCsv}
              style={{ width: "100%", marginBottom: "0.8rem", color: "#101b3d", borderColor: "#101b3d" }}
            >
              📊 Sonuçları CSV (Excel) İndir
            </button>

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
          {top3.length > 0 && (
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

          {tab === "takimlar" && <TeamsTable overview={overview} />}
          {tab === "kuyruk" && <EvaluationQueue queue={queue} onScored={refresh} />}
          {tab === "puanlanan" && <ScoredList scored={scored} onScored={refresh} />}
        </div>
      </div>
    </div>
  );
}


function TeamsTable({ overview }) {
  return (
    <div className="admin-card">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Takım</th>
            <th>Aşama</th>
            <th>Bölüm</th>
            <th>Mini Vaka</th>
            <th>Puan</th>
          </tr>
        </thead>
        <tbody>
          {(overview?.teams || []).map((t) => (
            <tr key={t.id}>
              <td>
                <b>{t.name}</b>
                {t.members && <div className="muted" style={{ fontSize: "0.78rem" }}>{t.members}</div>}
              </td>
              <td>{t.stageLabel}</td>
              <td>{t.currentBolum}</td>
              <td>{t.currentMiniVaka}</td>
              <td style={{ fontWeight: 700 }}>{t.totalScore} / 1200</td>
            </tr>
          ))}
          {(overview?.teams || []).length === 0 && (
            <tr>
              <td colSpan={5} className="muted" style={{ textAlign: "center", padding: "1.5rem" }}>
                Henüz takım katılmadı. QR kodu paylaşın.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EvaluationQueue({ queue, onScored }) {
  if (!queue) return <p className="muted">Yükleniyor...</p>;

  const nothing =
    queue.pendingAnswers.length === 0 &&
    queue.pendingFinalA.length === 0 &&
    queue.anaKanitPending.length === 0;

  return (
    <div>
      {nothing && (
        <div className="admin-card">
          <p className="muted" style={{ textAlign: "center" }}>
            Değerlendirme bekleyen cevap yok. 🎉
          </p>
        </div>
      )}

      {queue.pendingAnswers.map((item) => (
        <MiniVakaQueueItem key={item.answerId} item={item} onScored={onScored} />
      ))}

      {queue.pendingFinalA.map((item) => (
        <FinalAQueueItem key={item.teamId} item={item} onScored={onScored} />
      ))}

      {queue.anaKanitPending.length > 0 && (
        <div className="admin-card">
          <h4 style={{ marginTop: 0 }}>Ana Kanıt Sentez Puanları (sözlü, 0-30)</h4>
          {queue.anaKanitPending.map((item) => (
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
