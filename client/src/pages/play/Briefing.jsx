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
      <div className="card-dark">
        <div style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 6 }}>{t("how.title")}</div>
        {["how.1", "how.2", "how.3", "how.4"].map((k, i) => (
          <p key={k} style={{ margin: "0 0 6px", lineHeight: 1.45 }}>
            <b>{i + 1}.</b> {t(k)}
          </p>
        ))}
      </div>
      {team?.joinCode && (
        <div className="card-dark" style={{ textAlign: "center" }}>
          <div className="muted" style={{ fontSize: "0.8rem", letterSpacing: 2 }}>{t("code.title")}</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: 6, color: "var(--gold)" }}>{team.joinCode}</div>
          <div className="muted" style={{ fontSize: "0.8rem" }}>{t("code.hint")}</div>
        </div>
      )}
      <button className="btn" onClick={advance}>
        {t("next")}
      </button>
    </div>
  );
}
