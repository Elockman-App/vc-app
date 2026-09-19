import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { useLang } from "../../i18n";
import LangSwitch from "../../components/LangSwitch";

/**
 * Sunucu yeniden başlatıldığında veya facilitator oturumu sıfırladığında gösterilir:
 * oyuncunun takım kaydı sunucuda bulunamamıştır.
 */
export default function TeamRecovery() {
  const { restoreTeam, resumeIfExists, startFresh } = useGame();
  const { t } = useLang();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // Oyun yöneticisi yedeği geri yüklerse takım kaydı yeniden görünür: kendiliğinden devam et
  useEffect(() => {
    const t = setInterval(() => {
      resumeIfExists();
    }, 5000);
    return () => clearInterval(t);
  }, [resumeIfExists]);

  async function handleRestore() {
    setBusy(true);
    setErr(null);
    try {
      const t = await restoreTeam();
      if (!t) startFresh(); // kayıtlı bilgi yoksa yeni takım ekranına düş
    } catch (e) {
      setErr(e.message || t("rec.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen dark">
      <div className="center-screen">
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <LangSwitch style={{ marginBottom: "1rem" }} />
            <div className="divider-eyebrow">{t("rec.eyebrow")}</div>
            <h1 style={{ fontSize: "1.5rem" }}>{t("rec.title")}</h1>
            <p className="muted">{t("rec.p1")}</p>
            <p className="muted">
              <b>{t("rec.p2a")}</b>
              {t("rec.p2b")}
            </p>
          </div>
          <div className="card-dark">
            {err && <p style={{ color: "#ff8080", fontSize: "0.9rem" }}>{err}</p>}
            <button className="btn" onClick={handleRestore} disabled={busy}>
              {busy ? t("rec.restoring") : t("rec.restore")}
            </button>
            <button className="btn secondary" style={{ marginTop: "0.6rem" }} onClick={startFresh} disabled={busy}>
              {t("rec.fresh")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
