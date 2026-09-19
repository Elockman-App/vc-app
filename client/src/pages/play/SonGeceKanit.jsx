import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import { useLang } from "../../i18n";
import KanitCard from "../../components/KanitCard";

export default function SonGeceKanit() {
  const { advance } = useGame();
  const { t, lang } = useLang();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getSonGece().then(setData);
  }, [lang]);

  if (!data) return <p className="spinner-text">{t("loading")}</p>;

  return (
    <div className="screen dark" style={{ padding: "1.1rem 0 1.1rem 1.1rem" }}>
      <div style={{ paddingRight: "1.1rem" }}>
        <div className="beat-tag">{t("beat.evidence")}</div>
        <h2 style={{ fontSize: "1.2rem" }}>{t("nightEv.title")}</h2>
      </div>

      <div className="kanit-scroll">
        {data.kanitAni.map((k, i) => (
          <KanitCard kanit={k} key={i} />
        ))}
      </div>

      <div style={{ padding: "0 1.1rem" }}>
        <p className="muted" style={{ fontStyle: "italic" }}>
          {data.gercekcilikCapasi}
        </p>
        <button className="btn" onClick={advance}>
          {t("nightEv.next")}
        </button>
      </div>
    </div>
  );
}
