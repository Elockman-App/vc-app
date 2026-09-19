import React, { useEffect, useState } from "react";
import { api } from "../api";
import { soundEngine } from "../utils/soundEngine";
import { useLang } from "../i18n";

const VAKALAR = [
  { sira: 1, bolum: 1, icon: "⚠️" },
  { sira: 2, bolum: 1, icon: "🤝" },
  { sira: 3, bolum: 1, icon: "⛓️" },
  { sira: 4, bolum: 2, icon: "🕒" },
  { sira: 5, bolum: 2, icon: "📉" },
  { sira: 6, bolum: 2, icon: "🪑" },
  { sira: 7, bolum: 3, icon: "📢" },
  { sira: 8, bolum: 3, icon: "⚙️" },
  { sira: 9, bolum: 3, icon: "🏭" }
];

export default function CaseProgressMapModal({ team, onClose }) {
  const { t, lang } = useLang();
  const [titles, setTitles] = useState({});
  useEffect(() => {
    // Başlıklar panelden düzenlenmiş olabilir: sunucudaki güncel listeyi kullan
    api
      .listMiniVaka()
      .then((list) => setTitles(Object.fromEntries(list.map((v) => [v.sira, v.baslik]))))
      .catch(() => {});
  }, [lang]);
  const currentSira = team?.currentMiniVaka || 1;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="inspector-modal-content map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{t("map.title")}</div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="map-team-status">
            <span>
              {t("map.team")} <b>{team?.name || t("map.unknown")}</b>
            </span>
            <span style={{ color: "var(--gold)" }}>
              {t("map.score")} <b>{team?.totalScore || 0} PTS</b>
            </span>
          </div>

          {team?.joinCode && (
            <div className="muted" style={{ textAlign: "center", margin: "0 0 0.8rem", fontSize: "0.85rem" }}>
              {t("code.title")}: <b style={{ color: "var(--gold)", letterSpacing: 3 }}>{team.joinCode}</b>
            </div>
          )}
          <div className="map-grid">
            {VAKALAR.map((v) => {
              const isDone = currentSira > v.sira;
              const isCurrent = currentSira === v.sira;

              return (
                <div
                  key={v.sira}
                  className={`map-card ${isDone ? "done" : ""} ${isCurrent ? "active" : ""}`}
                >
                  <div className="map-card-number">{t("map.case", { n: v.sira })}</div>
                  <div className="map-card-icon">{v.icon}</div>
                  <div className="map-card-title">{titles[v.sira] || t("case." + v.sira)}</div>
                  <div className="map-card-badge">
                    {isDone ? t("map.done") : isCurrent ? t("map.current") : t("map.locked")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn"
            onClick={() => {
              soundEngine.playClickSound();
              onClose();
            }}
          >
            {t("map.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
