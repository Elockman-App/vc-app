import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import { useLang } from "../../i18n";

export default function FinalKilit() {
  const { team, advance } = useGame();
  const { t, lang } = useLang();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notTam, setNotTam] = useState(null);
  const [visibleLines, setVisibleLines] = useState(0);

  async function tryUnlock() {
    setBusy(true);
    setErr(null);
    try {
      const res = await api.unlockFinal(team.id, code);
      setNotTam(res.notTam);
      // Director's Cut: üç cümle kademeli belirir (facilitator "4'e kadar sayar" ritmiyle eşleşir)
      res.notTam.forEach((_, i) => {
        setTimeout(() => setVisibleLines((v) => v + 1), (i + 1) * 1400);
      });
    } catch (e) {
      setErr(e.status === 400 ? t("lock.wrong") : e.message || t("lock.wrong"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen dark" style={{ padding: "1.4rem 1.1rem", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="divider-eyebrow">{t("lock.eyebrow")}</div>
        <h1 style={{ fontSize: "1.6rem" }}>{t("lock.title")}</h1>
      </div>

      {!notTam ? (
        <>
          <p className="muted" style={{ textAlign: "center" }}>
            {t("lock.hint")}
          </p>
          <input
            className="lock-input"
            placeholder="471295836"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
          />
          {err && <p style={{ color: "#ff8080", textAlign: "center" }}>{err}</p>}
          <button className="btn" disabled={busy} onClick={tryUnlock}>
            {busy ? t("lock.checking") : t("lock.open")}
          </button>
        </>
      ) : (
        <>
          {notTam.slice(0, visibleLines).map((line, i) => (
            <div className="note-line" key={i}>
              “{line}”
            </div>
          ))}
          {visibleLines >= notTam.length && (
            <button className="btn" onClick={advance}>
              {t("next")}
            </button>
          )}
        </>
      )}
    </div>
  );
}
