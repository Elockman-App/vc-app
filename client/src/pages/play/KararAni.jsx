import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import { useLang } from "../../i18n";
import CaseTimer from "../../components/CaseTimer";
import { soundEngine } from "../../utils/soundEngine";

export default function KararAni() {
  const { team, miniVaka, advance } = useGame();
  const { t } = useLang();
  // Yazılan cevap taslağı tarayıcıda saklanır: sayfa yenilenirse ya da kapanırsa kaybolmaz
  const draftKey = `vc2_draft_${team.id}_${team.currentMiniVaka}`;
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(draftKey) || "";
    } catch (e) {
      return "";
    }
  });
  const [timerSec, setTimerSec] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (reveal) return;
    try {
      if (text) localStorage.setItem(draftKey, text);
      else localStorage.removeItem(draftKey);
    } catch (e) {}
  }, [text, draftKey, reveal]);

  // Vaka başına süre oyun yöneticisi tarafından ayarlanır (0 = sayaç yok)
  useEffect(() => {
    api
      .getSession()
      .then((s) => setTimerSec(typeof s.caseTimerSeconds === "number" ? s.caseTimerSeconds : 180))
      .catch(() => setTimerSec(180));
  }, []);

  if (!miniVaka) return <p className="spinner-text">{t("loading")}</p>;

  // Cevap kalite metriği (karakter sayısı)
  const charCount = text.trim().length;
  const qualityPercent = Math.min(100, Math.round((charCount / 120) * 100));
  const qualityLabel =
    charCount === 0
      ? t("dec.q0")
      : charCount < 30
      ? t("dec.q1")
      : charCount < 80
      ? t("dec.q2")
      : t("dec.q3");


  const qualityColor =
    charCount < 30 ? "#f87171" : charCount < 80 ? "#facc15" : "#4ade80";

  async function submit() {
    if (!text.trim()) {
      setErr(t("dec.needText"));
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const res = await api.submitAnswer(miniVaka.sira, team.id, text);
      soundEngine.playSuccessSound();
      try {
        localStorage.removeItem(draftKey);
      } catch (e2) {}
      setReveal(res);
    } catch (e) {
      setErr(e.message || t("dec.sendFail"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screen dark" style={{ padding: "1.2rem 1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="beat-tag karar">{t("beat.decision")}</div>
        {!reveal && timerSec > 0 && <CaseTimer durationSeconds={timerSec} />}
      </div>

      <p className="karar-question">“{miniVaka.kararSorusu}”</p>

      {!reveal ? (
        <>
          <div className="reveal-box" style={{ borderLeftColor: "var(--gold)", marginBottom: 8 }}>
            <b>{t("dec.hintTitle")}</b> {t("dec.hint")}
          </div>
          <textarea
            className="answer-input"
            placeholder={t("dec.placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="quality-meter">
            <div className="quality-meter-text">
              <span>{t("dec.depth")} <b style={{ color: qualityColor }}>{qualityLabel}</b></span>
              <span>{t("dec.chars", { n: charCount })}</span>
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
            {submitting ? t("dec.sending") : t("dec.send")}
          </button>
        </>
      ) : (
        <>
          {reveal.already && (
            <p className="muted">{t("dec.already")}</p>
          )}
          <div className="reveal-box">
            <b>{t("dec.ref")}</b> {reveal.dogruCozum}
          </div>
          <div className="reveal-box" style={{ borderLeftColor: "#fff" }}>
            <b>{t("dec.insight")}</b> “{reveal.finalIcgorusu}”
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            {t("dec.gmScores")}
          </p>
          <button className="btn" onClick={advance}>
            {t("next")}
          </button>
        </>
      )}
    </div>
  );
}

