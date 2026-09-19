import React from "react";
import { soundEngine } from "../utils/soundEngine";

const VAKALAR = [
  { sira: 1, bolum: 1, baslik: "KAYAN AN", icon: "⚠️" },
  { sira: 2, bolum: 1, baslik: "GÖLGEDEKİ ORTAK", icon: "🤝" },
  { sira: 3, bolum: 1, baslik: "KIRIK ZİNCİR", icon: "⛓️" },
  { sira: 4, bolum: 2, baslik: "BU SEFERLİK", icon: "🕒" },
  { sira: 5, bolum: 2, baslik: "EŞİĞİN ALTINDA", icon: "📉" },
  { sira: 6, bolum: 2, baslik: "BOŞ SANDALYE", icon: "🪑" },
  { sira: 7, bolum: 3, baslik: "YANLIŞ İSİM", icon: "📢" },
  { sira: 8, bolum: 3, baslik: "GÖRÜNMEYEN DURUŞ", icon: "⚙️" },
  { sira: 9, bolum: 3, baslik: "DUVARIN ÖTESİ", icon: "🏭" }
];

export default function CaseProgressMapModal({ team, onClose }) {
  const currentSira = team?.currentMiniVaka || 1;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="inspector-modal-content map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🗺️ VAKA HARİTASI & DEDEKTİF İLERLEMESİ</div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="map-team-status">
            <span>
              Takım: <b>{team?.name || "Bilinmiyor"}</b>
            </span>
            <span style={{ color: "var(--gold)" }}>
              Puan: <b>{team?.totalScore || 0} PTS</b>
            </span>
          </div>

          <div className="map-grid">
            {VAKALAR.map((v) => {
              const isDone = currentSira > v.sira;
              const isCurrent = currentSira === v.sira;

              return (
                <div
                  key={v.sira}
                  className={`map-card ${isDone ? "done" : ""} ${isCurrent ? "active" : ""}`}
                >
                  <div className="map-card-number">Vaka #{v.sira}</div>
                  <div className="map-card-icon">{v.icon}</div>
                  <div className="map-card-title">{v.baslik}</div>
                  <div className="map-card-badge">
                    {isDone ? "✅ Tamamlandı" : isCurrent ? "🔍 İnceleniyor" : "🔒 Kilitli"}
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
            Haritayı Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
