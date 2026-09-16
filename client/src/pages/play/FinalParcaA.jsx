import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";

export default function FinalParcaA() {
  const { team, advance } = useGame();
  const [enabled, setEnabled] = useState(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reveal, setReveal] = useState(null);

  useEffect(() => {
    api.getSession().then((s) => {
      if (!s.finalParcaAEnabled) {
        advance(); // facilitator bu adımı kapattıysa otomatik atla
      } else {
        setEnabled(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.submitParcaA(team.id, text);
      setReveal(res);
    } finally {
      setSubmitting(false);
    }
  }

  if (enabled === null) return <p className="spinner-text">Yükleniyor...</p>;

  return (
    <div className="screen dark" style={{ padding: "1.2rem 1.1rem" }}>
      <div className="beat-tag">FİNAL — PARÇA A</div>
      <h2 style={{ fontSize: "1.15rem" }}>Örüntü Haritası</h2>
      <p className="karar-question" style={{ fontSize: "1.15rem" }}>
        İç Denetim'e sunulacak tek cümlelik teşhis nedir?
      </p>

      {!reveal ? (
        <>
          <textarea
            className="answer-input"
            placeholder="Bu şirketin asıl sorunu..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn" disabled={submitting} onClick={submit}>
            {submitting ? "Gönderiliyor..." : "Teşhisi Gönder"}
          </button>
        </>
      ) : (
        <>
          <div className="reveal-box">
            <b>Referans:</b> {reveal.dogruCozumReferansi}
          </div>
          <button className="btn" onClick={advance}>
            Devam Et → Son Gece
          </button>
        </>
      )}
    </div>
  );
}
