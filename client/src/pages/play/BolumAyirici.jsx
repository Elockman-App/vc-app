import React from "react";
import { useGame } from "../../context/GameContext";
import BolumTheme from "../../components/BolumTheme";
import { getBolumMeta } from "../../data/bolumler";
import { useLang } from "../../i18n";

export default function BolumAyirici() {
  const { team, advance } = useGame();
  const { t, lang } = useLang();
  const meta = getBolumMeta(team.currentBolum, lang);

  return (
    <BolumTheme accentHex={meta.accent}>
      <div className="screen dark">
        <div className="hero-bg" style={{ backgroundImage: `url(/images/${meta.heroGorsel})` }} />
        <div className="hero-scrim" />
        <div className="hero-content">
          <div className="divider-eyebrow" style={{ color: "var(--accent)" }}>
            {t("chapter", { n: meta.num })}
          </div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>{meta.baslik}</h1>
          <div style={{ marginBottom: "1.2rem" }}>
            {meta.degerler.map((v) => (
              <span className="value-pill" key={v}>
                {v}
              </span>
            ))}
          </div>
          <p style={{ fontStyle: "italic", fontFamily: "Cambria, Georgia, serif" }}>
            “{meta.facilitatorAcilis}”
          </p>
          <button className="btn" style={{ background: "var(--accent)" }} onClick={advance}>
            {t("next")}
          </button>
        </div>
      </div>
    </BolumTheme>
  );
}
