import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useLang } from "../../i18n";
import KanitCard from "../../components/KanitCard";
import EvidenceInspectorModal from "../../components/EvidenceInspectorModal";

export default function KanitAni() {
  const { miniVaka, advance } = useGame();
  const { t } = useLang();
  const [inspectingKanit, setInspectingKanit] = useState(null);

  if (!miniVaka) return <p className="spinner-text">{t("loading")}</p>;

  return (
    <div className="screen dark" style={{ padding: "1.1rem 0 1.1rem 1.1rem" }}>
      <div style={{ paddingRight: "1.1rem" }}>
        <div className="beat-tag">{t("beat.evidence")}</div>
        <h2 style={{ fontSize: "1.2rem" }}>{miniVaka.baslik}</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          {t("evidence.hint")}
        </p>
      </div>

      <div className="kanit-scroll">
        {miniVaka.kanitAni.map((k, i) => (
          <KanitCard kanit={k} key={i} onInspect={(item) => setInspectingKanit(item)} />
        ))}
      </div>

      <div style={{ padding: "0 1.1rem" }}>
        <button className="btn" onClick={advance}>
          {t("evidence.next")}
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

