import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import { useLang } from "../../i18n";

export default function SonGeceAcilis() {
  const { advance } = useGame();
  const { t, lang } = useLang();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getSonGece().then(setData);
  }, [lang]);

  if (!data) return <p className="spinner-text">{t("loading")}</p>;

  return (
    <div className="screen dark" style={{ padding: "1.4rem 1.1rem", justifyContent: "center" }}>
      <div className="hero-bg" style={{ backgroundImage: "url(/images/son_gece.jpg)" }} />
      <div className="hero-scrim" />
      <div className="hero-content" style={{ justifyContent: "flex-start", paddingTop: "2rem" }}>
        <h1 style={{ fontSize: "2.2rem" }}>{t("night.title")}</h1>
        <p style={{ color: "var(--gold)", fontStyle: "italic" }}>{data.lokasyon}</p>

        <div style={{ flex: 1 }} />

        <div className="timeline">
          {data.zamanCizelgesi.map((t, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-dot" />
              <div className="timeline-time">{t.saat}</div>
              <div className="timeline-event">{t.olay}</div>
            </div>
          ))}
        </div>

        <p className="muted" style={{ fontStyle: "italic" }}>
          {t("night.note")}
        </p>

        <button className="btn" onClick={advance}>
          {t("next")}
        </button>
      </div>
    </div>
  );
}
