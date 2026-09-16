import React, { useEffect } from "react";
import { soundEngine } from "../utils/soundEngine";

export default function BroadcastModal({ message, onClose }) {
  useEffect(() => {
    if (message) {
      soundEngine.playBroadcastSound();
    }
  }, [message]);

  if (!message) return null;

  return (
    <div className="modal-backdrop broadcast-backdrop" onClick={onClose}>
      <div className="broadcast-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="broadcast-badge">📢 FACILITATOR DUYURUSU</div>
        <div className="broadcast-text">"{message}"</div>
        <button
          className="btn"
          onClick={() => {
            soundEngine.playClickSound();
            onClose();
          }}
        >
          Anlaşıldı, Devam Et
        </button>
      </div>
    </div>
  );
}
