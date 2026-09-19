import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import { useLang } from "../../i18n";

export default function FinalParcaA() {
  const { team, advance } = useGame();
  const { t } = useLang();
  const [enabled, setEnabled] = useState(null);
  const draftKey = `vc2_draft_${team.id}_A`;
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(draftKey) || "";
    } catch (e) {
      return "";
    }
  });
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
      .catch((e) => setErr(e.message || t("net.issue")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    if (reveal) return;
    try {
      if (text) localStorage.setItem(draftKey, text);
      else localStorage.removeItem(draftKey);
    } catch (e) {}
  }, [text, draftKey, reveal]);

  async function submit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await api.submitParcaA(team.id, text);
      try {
        localStorage.removeItem(draftKey);
      } catch (e2) {}
      setReveal(res);
    } catch (e) {
      setErr(e.message || t("pa.sendFail"));
    } finally {
      setSubmitting(false);
    }
  }

  if (enabled === null && err)
    return (
      <div className="screen dark" style={{ padding: "1.4rem 1.1rem", justifyContent: "center", textAlign: "center" }}>
        <p style={{ color: "#ff8080" }}>{err}</p>
        <button className="btn" onClick={() => setTick((t) => t + 1)}>{t("retry")}</button>
      </div>
    );
  if (enabled === null) return <p className="spinner-text">{t("loading")}</p>;

  return (
    <div className="screen dark" style={{ padding: "1.2rem 1.1rem" }}>
      <div className="beat-tag">{t("pa.tag")}</div>
      <h2 style={{ fontSize: "1.15rem" }}>{t("pa.title")}</h2>
      <p className="karar-question" style={{ fontSize: "1.15rem" }}>
        {t("pa.question")}
      </p>

      {!reveal ? (
        <>
          <textarea
            className="answer-input"
            placeholder={t("pa.placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {err && <p style={{ color: "#ff8080" }}>{err}</p>}
          <button className="btn" disabled={submitting} onClick={submit}>
            {submitting ? t("dec.sending") : t("pa.send")}
          </button>
        </>
      ) : (
        <>
          {reveal.already && (
            <p className="muted">{t("pa.already")}</p>
          )}
          <div className="reveal-box">
            <b>{t("pa.ref")}</b> {reveal.dogruCozumReferansi}
          </div>
          <button className="btn" onClick={advance}>
            {t("pa.next")}
          </button>
        </>
      )}
    </div>
  );
}
