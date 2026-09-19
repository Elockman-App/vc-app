import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import { useLang } from "../../i18n";

export default function Kapanis() {
  const { team } = useGame();
  const { t } = useLang();
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
        <div className="divider-eyebrow">{t("end.eyebrow")}</div>
        <p style={{ fontStyle: "italic", fontFamily: "Cambria, Georgia, serif", lineHeight: 1.5 }}>
          “{t("end.quote")}”
        </p>
        <h2 style={{ color: "var(--gold)", fontSize: "1.2rem", marginTop: "1.2rem" }}>
          {t("end.question")}
        </h2>

        <div className="card-dark" style={{ marginTop: "1.5rem" }}>
          <div className="muted">{t("end.score")}</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--gold)" }}>
            {fresh?.totalScore ?? team.totalScore}
          </div>
          <div className="muted">/ 1200</div>
        </div>
        <p className="muted" style={{ marginTop: "1rem" }}>
          {t("end.gm")}
        </p>
      </div>
    </div>
  );
}
