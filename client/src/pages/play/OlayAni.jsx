import React from "react";
import { useGame } from "../../context/GameContext";
import SpeechBubble from "../../components/SpeechBubble";
import { getBolumMeta } from "../../data/bolumler";

export default function OlayAni() {
  const { team, miniVaka, advance } = useGame();

  if (!miniVaka) return <p className="spinner-text">Yükleniyor...</p>;
  const meta = getBolumMeta(team.currentBolum);
  const heroUrl = `/images/${miniVaka.heroGorsel}`;

  return (
    <div className="screen dark" style={{ "--accent": "#" + meta.accent }}>
      <div className="hero-bg" style={{ backgroundImage: `url(${heroUrl})` }} />
      <div className="hero-scrim" />
      <div className="hero-content">
        <div className="beat-tag">OLAY ANI</div>
        <div className="doc-caption">
          Mini Vaka {miniVaka.sira} — {miniVaka.baslik}
        </div>

        <div style={{ flex: 1 }} />

        <SpeechBubble text={miniVaka.olayAni.balonlar[0]} align="left" />
        <SpeechBubble text={miniVaka.olayAni.balonlar[1]} align="right" />

        <button className="btn" onClick={advance}>
          Devam Et → Kanıt Anı
        </button>
      </div>
    </div>
  );
}
