import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import KanitCard from "../../components/KanitCard";
import EvidenceInspectorModal from "../../components/EvidenceInspectorModal";

export default function KanitAni() {
  const { miniVaka, advance } = useGame();
  const [inspectingKanit, setInspectingKanit] = useState(null);

  if (!miniVaka) return <p className="spinner-text">Yükleniyor...</p>;

  return (
    <div className="screen dark" style={{ padding: "1.1rem 0 1.1rem 1.1rem" }}>
      <div style={{ paddingRight: "1.1rem" }}>
        <div className="beat-tag">KANIT ANI</div>
        <h2 style={{ fontSize: "1.2rem" }}>{miniVaka.baslik}</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          Kanıtları incelemek veya büyütmek için kartlara tıklayın ↓
        </p>
      </div>

      <div className="kanit-scroll">
        {miniVaka.kanitAni.map((k, i) => (
          <KanitCard kanit={k} key={i} onInspect={(item) => setInspectingKanit(item)} />
        ))}
      </div>

      <div style={{ padding: "0 1.1rem" }}>
        <button className="btn" onClick={advance}>
          Devam Et → Karar Anı
        </button>
      </div>

      {inspectingKanit && (
        <EvidenceInspectorModal
          kanit={inspectingKanit}
          onClose={() => setInspectingKanit(null)}
        />
      )}
    </div>
  );
}

