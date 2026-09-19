import React from "react";
import { useGame } from "../../context/GameContext";
import { useLang } from "../../i18n";

export default function Briefing() {
  const { team, advance } = useGame();
  const { t } = useLang();

  return (
    <div className="screen dark" style={{ padding: "1.2rem 1.1rem" }}>
      <div className="divider-eyebrow">{t("brief.eyebrow")}</div>
      <h1 style={{ fontSize: "1.6rem" }}>{t("brief.welcome", { name: team?.name })}</h1>
      <p>
        {t("brief.p1a")}
        <b>{t("brief.p1b")}</b>
      </p>
      <p className="muted">
        {t("brief.p2")}
      </p>
      <div className="card-dark" style={{ borderLeft: "4px solid var(--red)" }}>
        <div style={{ fontWeight: 700, color: "#ff8080", marginBottom: 6 }}>{t("brief.noteTitle")}</div>
        <div className="muted" style={{ fontStyle: "italic" }}>{t("brief.noteBody")}</div>
      </div>
      <button className="btn" onClick={advance}>
        {t("next")}
      </button>
    </div>
  );
}
