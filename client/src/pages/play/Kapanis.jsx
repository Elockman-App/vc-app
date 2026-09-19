import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";

export default function Kapanis() {
  const { team } = useGame();
  const [fresh, setFresh] = useState(team);

  useEffect(() => {
    api.getTeam(team.id).then(setFresh);
    const t = setInterval(() => api.getTeam(team.id).then(setFresh), 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen dark" style={{ padding: "1.4rem 1.1rem", justifyContent: "center", textAlign: "center" }}>
      <div className="hero-bg" style={{ backgroundImage: "url(/images/kapanis.jpg)" }} />
      <div className="hero-scrim" />
      <div className="hero-content" style={{ justifyContent: "center", textAlign: "center" }}>
        <div className="divider-eyebrow">KAPANIŞ</div>
        <p style={{ fontStyle: "italic", fontFamily: "Cambria, Georgia, serif", lineHeight: 1.5 }}>
          “Bu dokuz dosyada tek bir kötü niyetli insan yoktu. Sadece dokuz farklı an, aynı boşluğu
          gösteriyordu. Son Gece bize bunun tersinin de mümkün olduğunu gösterdi.”
        </p>
        <h2 style={{ color: "var(--gold)", fontSize: "1.2rem", marginTop: "1.2rem" }}>
          Yarın, sizin sahanızda birisi küçük bir sinyal gördüğünde, bu şirket onu duyacak mı?
        </h2>

        <div className="card-dark" style={{ marginTop: "1.5rem" }}>
          <div className="muted">TAKIM PUANINIZ (canlı güncellenir)</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--gold)" }}>
            {fresh?.totalScore ?? team.totalScore}
          </div>
          <div className="muted">/ 1200</div>
        </div>
        <p className="muted" style={{ marginTop: "1rem" }}>
          Oyun Yöneticisi kazanan takımı açıklayacak. 🏆
        </p>
      </div>
    </div>
  );
}
