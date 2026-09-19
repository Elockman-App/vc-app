import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import { getBolumMeta } from "../../data/bolumler";

export default function AnaKanit() {
  const { team, advance } = useGame();
  const [data, setData] = useState(null);
  const meta = getBolumMeta(team.currentBolum);
  const harf = { 1: "A", 2: "B", 3: "C" }[meta.num];

  useEffect(() => {
    api.revealAnaKanit(harf, team.id, meta.num).then(setData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.currentBolum]);

  if (!data) return <p className="spinner-text">Kilit açılıyor...</p>;

  return (
    <div className="screen dark" style={{ "--accent": "#" + meta.accent, padding: "1.4rem 1.1rem", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="divider-eyebrow" style={{ color: "var(--accent)" }}>
          ANA KANIT {harf}
        </div>
        <div className="kod-box">{data.kod}</div>
        <div className="not-parcasi-box">“{data.notParcasi}”</div>
        <p className="muted" style={{ marginTop: "1rem" }}>
          Bu kodu saklayın — Final Dosyası'nın kilidini açmak için gerekecek.
        </p>
      </div>
      <button className="btn" style={{ background: "var(--accent)" }} onClick={advance}>
        Devam Et →
      </button>
    </div>
  );
}
