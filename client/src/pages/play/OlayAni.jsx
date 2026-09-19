import React from "react";
import { useGame } from "../../context/GameContext";
import SpeechBubble from "../../components/SpeechBubble";
import { getBolumMeta } from "../../data/bolumler";
import { useLang } from "../../i18n";

export default function OlayAni() {
  const { team, miniVaka, advance } = useGame();
  const { t, lang } = useLang();

  if (!miniVaka) return <p className="spinner-text">{t("loading")}</p>;
  const meta = getBolumMeta(team.currentBolum, lang);
  const heroUrl = `/images/${miniVaka.heroGorsel}`;

  return (
    <div className="screen dark" style={{ "--accent": "#" + meta.accent }}>
      <div className="hero-bg" style={{ backgroundImage: `url(${heroUrl})` }} />
      <div className="hero-scrim" />
      <div className="hero-content">
        <div className="beat-tag">{t("beat.event")}</div>
        <div className="doc-caption">
          {t("miniCase", { n: miniVaka.sira, title: miniVaka.baslik })}
        </div>

        <div style={{ flex: 1 }} />

        <SpeechBubble text={miniVaka.olayAni.balonlar[0]} align="left" />
        <SpeechBubble text={miniVaka.olayAni.balonlar[1]} align="right" />

        <button className="btn" onClick={advance}>
          {t("event.next")}
        </button>
      </div>
    </div>
  );
}
