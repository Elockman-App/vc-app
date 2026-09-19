import React, { useEffect } from "react";
import { soundEngine } from "../utils/soundEngine";
import { useLang } from "../i18n";

export default function BroadcastModal({ message, onClose }) {
  const { t } = useLang();
  useEffect(() => {
    if (message) {
      soundEngine.playBroadcastSound();
    }
  }, [message]);

  if (!message) return null;

  return (
    <div className="modal-backdrop broadcast-backdrop" onClick={onClose}>
      <div className="broadcast-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="broadcast-badge">{t("bc.badge")}</div>
        <div className="broadcast-text">"{message}"</div>
        <button
          className="btn"
          onClick={() => {
            soundEngine.playClickSound();
            onClose();
          }}
        >
          {t("bc.ok")}
        </button>
      </div>
    </div>
  );
}
