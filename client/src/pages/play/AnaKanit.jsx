import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import { getBolumMeta } from "../../data/bolumler";
import { useLang } from "../../i18n";

export default function AnaKanit() {
  const { team, advance } = useGame();
  const { t, lang } = useLang();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [tick, setTick] = useState(0);
  const meta = getBolumMeta(team.currentBolum, lang);
  const harf = { 1: "A", 2: "B", 3: "C" }[meta.num];

  useEffect(() => {
    setErr(null);
    api
      .revealAnaKanit(harf, team.id, meta.num)
      .then(setData)
      .catch((e) => setErr(e.message || t("net.issue")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.currentBolum, tick, lang]);

  if (err)
    return (
      <div className="screen dark" style={{ padding: "1.4rem 1.1rem", justifyContent: "center", textAlign: "center" }}>
        <p style={{ color: "#ff8080" }}>{err}</p>
        <button className="btn" onClick={() => setTick((t) => t + 1)}>{t("retry")}</button>
      </div>
    );
  if (!data) return <p className="spinner-text">{t("clue.unlocking")}</p>;

  return (
    <div className="screen dark" style={{ "--accent": "#" + meta.accent, padding: "1.4rem 1.1rem", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="divider-eyebrow" style={{ color: "var(--accent)" }}>
          {t("clue.eyebrow", { h: harf })}
        </div>
        <div className="kod-box">{data.kod}</div>
        <div className="not-parcasi-box">“{data.notParcasi}”</div>
        <p className="muted" style={{ marginTop: "1rem" }}>
          {t("clue.hint")}
        </p>
      </div>
      <button className="btn" style={{ background: "var(--accent)" }} onClick={advance}>
        {t("next")}
      </button>
    </div>
  );
}
