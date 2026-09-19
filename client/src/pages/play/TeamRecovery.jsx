import React, { useState } from "react";
import { useGame } from "../../context/GameContext";

/**
 * Sunucu yeniden başlatıldığında veya facilitator oturumu sıfırladığında gösterilir:
 * oyuncunun takım kaydı sunucuda bulunamamıştır.
 */
export default function TeamRecovery() {
  const { restoreTeam, startFresh } = useGame();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function handleRestore() {
    setBusy(true);
    setErr(null);
    try {
      const t = await restoreTeam();
      if (!t) startFresh(); // kayıtlı bilgi yoksa yeni takım ekranına düş
    } catch (e) {
      setErr(e.message || "Takım geri yüklenemedi, tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen dark">
      <div className="center-screen">
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div className="divider-eyebrow">BİLGİLENDİRME</div>
            <h1 style={{ fontSize: "1.5rem" }}>Oturum yenilendi</h1>
            <p className="muted">
              Sunucu yeniden başlatılmış ya da oturum sıfırlanmış olabilir, takım kaydınız artık
              bulunamıyor. Kaldığınız aşamadan devam edebilirsiniz. Önceki puanlarınız sıfırlanmış olur,
              bunu oyun yöneticisine bildirin.
            </p>
          </div>
          <div className="card-dark">
            {err && <p style={{ color: "#ff8080", fontSize: "0.9rem" }}>{err}</p>}
            <button className="btn" onClick={handleRestore} disabled={busy}>
              {busy ? "Geri yükleniyor..." : "Kaldığım yerden devam et"}
            </button>
            <button className="btn secondary" style={{ marginTop: "0.6rem" }} onClick={startFresh} disabled={busy}>
              Yeni takımla başla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
