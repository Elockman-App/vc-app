import React from "react";
import { GLOSSARY, useLang } from "../i18n";
import { soundEngine } from "../utils/soundEngine";

/** Oyunda geçen kelimelerin kısa açıklamaları (Türkçe / İngilizce) */
export default function GlossaryModal({ onClose }) {
  const { t, lang } = useLang();
  const items = GLOSSARY[lang] || GLOSSARY.tr;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="inspector-modal-content map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{t("glossary.title")}</div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {items.map(([term, def]) => (
            <div key={term} style={{ marginBottom: "0.7rem" }}>
              <div style={{ fontWeight: 700, color: "var(--gold)" }}>{term}</div>
              <div className="muted">{def}</div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button
            className="btn"
            onClick={() => {
              soundEngine.playClickSound();
              onClose();
            }}
          >
            {t("glossary.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
