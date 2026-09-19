import React, { useEffect } from "react";
import { soundEngine } from "../utils/soundEngine";

export default function EvidenceInspectorModal({ kanit, onClose }) {
  useEffect(() => {
    soundEngine.playCardOpenSound();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!kanit) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="inspector-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            🔍 DETAYLI KANIT İNCELEMESİ — {kanit.baslik || "KANIT"}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {kanit.type === "whatsapp" || kanit.type === "teams" ? (
            <div className={`kanit-card chat ${kanit.type} zoomed`}>
              <div className="chat-header">{kanit.baslik}</div>
              <div className="chat-bubble">
                <div className="chat-meta">
                  {kanit.from} {kanit.time && `• ${kanit.time}`}
                </div>
                <div className="chat-text">{kanit.text}</div>
              </div>
            </div>
          ) : kanit.type === "data" ? (
            <div className="kanit-card data zoomed">
              <div className="data-title">📊 {kanit.baslik}</div>
              {(kanit.rows || []).map(([lbl, val], idx) => (
                <div key={idx} className="data-row">
                  <div className="data-label">{lbl}</div>
                  <div className="data-value">{val}</div>
                </div>
              ))}
            </div>
          ) : kanit.type === "quote" ? (
            <div className="kanit-card quote zoomed">
              <div className="quote-title">🗣️ {kanit.baslik}</div>
              <div className="quote-text">"{kanit.text}"</div>
              {kanit.who && <div className="quote-who">— {kanit.who}</div>}
            </div>
          ) : (
            <div className="card-dark">
              <pre>{JSON.stringify(kanit, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>
            İncelemeyi Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
