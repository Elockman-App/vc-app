import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import CaseTimer from "../../components/CaseTimer";
import { soundEngine } from "../../utils/soundEngine";

export default function KararAni() {
  const { team, miniVaka, advance } = useGame();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [err, setErr] = useState(null);

  if (!miniVaka) return <p className="spinner-text">Yükleniyor...</p>;

  // Cevap kalite metriği (karakter sayısı)
  const charCount = text.trim().length;
  const qualityPercent = Math.min(100, Math.round((charCount / 120) * 100));
  const qualityLabel =
    charCount === 0
      ? "Henüz yazılmadı"
      : charCount < 30
      ? "Kısa Yanıt"
      : charCount < 80
      ? "Yeterli Detay"
      : "Kapsamlı Analiz ✨";


  const qualityColor =
    charCount < 30 ? "#f87171" : charCount < 80 ? "#facc15" : "#4ade80";

  async function submit() {
    if (!text.trim()) {
      setErr("Lütfen bir cevap yazın.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const res = await api.submitAnswer(miniVaka.sira, team.id, text);
      soundEngine.playSuccessSound();
      setReveal(res);
    } catch (e) {
      setErr(e.message || "Cevap gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screen dark" style={{ padding: "1.2rem 1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="beat-tag karar">KARAR ANI</div>
        {!reveal && <CaseTimer durationSeconds={180} />}
      </div>

      <p className="karar-question">“{miniVaka.kararSorusu}”</p>

      {!reveal ? (
        <>
          <textarea
            className="answer-input"
            placeholder="Takımınızın cevabını buraya yazın..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="quality-meter">
            <div className="quality-meter-text">
              <span>Analiz Derinliği: <b style={{ color: qualityColor }}>{qualityLabel}</b></span>
              <span>{charCount} karakter</span>
            </div>
            <div className="quality-meter-bar">
              <div
                className="quality-meter-fill"
                style={{ width: `${qualityPercent}%`, background: qualityColor }}
              />
            </div>
          </div>

          {err && <p style={{ color: "#ff8080" }}>{err}</p>}
          <button className="btn" disabled={submitting} onClick={submit}>
            {submitting ? "Gönderiliyor..." : "Cevabı Gönder"}
          </button>
        </>
      ) : (
        <>
          {reveal.already && (
            <p className="muted">Bu vaka için cevabınız daha önce kaydedildi; ilk cevabınız geçerlidir.</p>
          )}
          <div className="reveal-box">
            <b>Referans Çözüm:</b> {reveal.dogruCozum}
          </div>
          <div className="reveal-box" style={{ borderLeftColor: "#fff" }}>
            <b>Final'e Taşınan İçgörü:</b> “{reveal.finalIcgorusu}”
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            Oyun Yöneticisi puanınızı ayrıca değerlendirecek.
          </p>
          <button className="btn" onClick={advance}>
            Devam Et →
          </button>
        </>
      )}
    </div>
  );
}

