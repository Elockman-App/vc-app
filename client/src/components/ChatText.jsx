import React from "react";

// "Ad: mesaj" satırlarını karşılıklı yazışma gibi gösterir. Tek satırlık eski metinler aynen görünür.
export default function ChatText({ text }) {
  const lines = String(text || "").split("\n").filter((l) => l.trim());
  if (lines.length <= 1) return <div className="chat-text">{text}</div>;
  return (
    <div className="chat-thread">
      {lines.map((l, i) => {
        const m = l.match(/^([^:]{1,40}):\s*(.*)$/);
        return (
          <div className="chat-line" key={i}>
            {m ? <b className="chat-who">{m[1]}</b> : null}
            <span>{m ? m[2] : l}</span>
          </div>
        );
      })}
    </div>
  );
}
