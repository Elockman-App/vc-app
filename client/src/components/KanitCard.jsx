import React from "react";

import { useLang } from "../i18n";
import ChatText from "./ChatText";

export default function KanitCard({ kanit, onInspect }) {
  const { t } = useLang();
  if (kanit.type === "whatsapp" || kanit.type === "teams") {
    const isWA = kanit.type === "whatsapp";
    return (
      <div className={"kanit-card chat " + (isWA ? "whatsapp" : "teams")}>
        <div className="chat-header">{kanit.baslik}</div>
        <div className="chat-bubble">
          <div className="chat-meta">
            {kanit.from} · {kanit.time}
          </div>
          <ChatText text={kanit.text} />
          {onInspect && (
            <button
              className="inspect-btn"
              onClick={(e) => {
                e.stopPropagation();
                onInspect(kanit);
              }}
            >
              {t("inspect")}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (kanit.type === "data") {
    return (
      <div className="kanit-card data">
        <div className="data-title">{kanit.baslik}</div>
        {kanit.rows.map((r, i) => (
          <div className="data-row" key={i}>
            <div className="data-label">{r[0]}</div>
            <div className="data-value">{r[1]}</div>
          </div>
        ))}
        {onInspect && (
          <button
            className="inspect-btn"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(kanit);
            }}
          >
            {t("inspect")}
          </button>
        )}
      </div>
    );
  }

  if (kanit.type === "quote") {
    return (
      <div className="kanit-card quote">
        <div className="quote-title">{kanit.baslik}</div>
        <div className="quote-text">“{kanit.text}”</div>
        <div className="quote-who">— {kanit.who}</div>
        {onInspect && (
          <button
            className="inspect-btn"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(kanit);
            }}
          >
            {t("inspect")}
          </button>
        )}
      </div>
    );
  }

  return null;
}
