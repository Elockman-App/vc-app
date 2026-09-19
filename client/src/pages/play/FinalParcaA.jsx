import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";

export default function FinalParcaA() {
  const { team, advance } = useGame();
  const [enabled, setEnabled] = useState(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [err, setErr] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setErr(null);
    api
      .getSession()
      .then((s) => {
        if (!s.finalParcaAEnabled) {
          advance(); // facilitator bu adımı kapattıysa otomatik atla
        } else {
          setEnabled(true);
        }
      })
      .catch((e) => setErr(e.message || "Bağlantı sorunu."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  async function submit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await api.submitParcaA(team.id, text);
      setReveal(res);
    } catch (e) {
      setErr(e.message || "Gönderilemedi, tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  if (enabled === null && err)
    return (
      <div className="screen dark" style={{ padding: "1.4rem 1.1rem", justifyContent: "center", textAlign: "center" }}>
        <p style={{ color: "#ff8080" }}>{err}</p>
        <button className="btn" onClick={() => setTick((t) => t + 1)}>Tekrar Dene</button>
      </div>
    );
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
          {err && <p style={{ color: "#ff8080" }}>{err}</p>}
          <button className="btn" disabled={submitting} onClick={submit}>
            {submitting ? "Gönderiliyor..." : "Teşhisi Gönder"}
          </button>
        </>
      ) : (
        <>
          {reveal.already && (
            <p className="muted">Bu teşhis daha önce kaydedildi; ilk cevabınız geçerlidir.</p>
          )}
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
