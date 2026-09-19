import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";
import { useLang } from "../../i18n";

export default function SonGeceSentez() {
  const { team, advance } = useGame();
  const { t, lang } = useLang();
  const [sinav, setSinav] = useState(null);
  const [vakalar, setVakalar] = useState([]);
  const [secim, setSecim] = useState({ 0: "", 1: "", 2: "" });
  const [sonuc, setSonuc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setErr(null);
    Promise.all([api.getSonGece(), api.listMiniVaka()])
      .then(([d, v]) => {
        setSinav(d.ucYolSinavi);
        setVakalar(v);
      })
      .catch((e) => setErr(e.message || "Bağlantı sorunu."));
  }, [tick, lang]);

  async function gonder() {
    if (!secim[0] || !secim[1] || !secim[2]) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await api.submitSonGeceSentez(team.id, secim[0], secim[1], secim[2]);
      setSonuc(res);
    } catch (e) {
      setErr(e.message || t("pa.sendFail"));
    } finally {
      setBusy(false);
    }
  }

  if ((!sinav || vakalar.length === 0) && err)
    return (
      <div className="screen dark" style={{ padding: "1.4rem 1.1rem", justifyContent: "center", textAlign: "center" }}>
        <p style={{ color: "#ff8080" }}>{err}</p>
        <button className="btn" onClick={() => setTick((t) => t + 1)}>{t("retry")}</button>
      </div>
    );
  if (!sinav || vakalar.length === 0) return <p className="spinner-text">{t("loading")}</p>;

  return (
    <div className="screen dark" style={{ padding: "1.2rem 1.1rem" }}>
      <div className="beat-tag karar">{t("quiz.tag")}</div>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        {t("quiz.intro")}
      </p>

      {sinav.map((row, i) => (
        <div className="sentez-row" key={i}>
          <div className="sentez-yolculuk">{row.yolculuk}</div>
          <div className="sentez-kanit">{row.kanit}</div>
          {!sonuc ? (
            <select
              className="mv-select"
              value={secim[i]}
              onChange={(e) => setSecim((s) => ({ ...s, [i]: e.target.value }))}
            >
              <option value="">{t("quiz.select")}</option>
              {vakalar.map((mv) => (
                <option key={mv.sira} value={mv.sira}>
                  {t("miniCase", { n: mv.sira, title: mv.baslik })}
                </option>
              ))}
            </select>
          ) : (
            <div className={"sentez-result " + (sonuc.detay[i].correct ? "correct" : "incorrect")}>
              {sonuc.detay[i].correct
                ? t("quiz.correct")
                : t("quiz.wrong", {
                    n: sonuc.detay[i].dogruMiniVakaSira,
                    title: sonuc.detay[i].dogruMiniVakaBaslik
                  })}
            </div>
          )}
        </div>
      ))}

      {!sonuc ? (
        <>
        {err && <p style={{ color: "#ff8080", textAlign: "center" }}>{err}</p>}
        <button className="btn" disabled={busy} onClick={gonder}>
          {busy ? t("dec.sending") : t("quiz.send")}
        </button>
        </>
      ) : (
        <>
          {sonuc.already && (
            <p className="muted" style={{ textAlign: "center" }}>{t("quiz.already")}</p>
          )}
          <p style={{ textAlign: "center", fontWeight: 700, marginTop: "1rem" }}>
            {t("quiz.score", { s: sonuc.score, m: sonuc.maxScore })}
          </p>
          <button className="btn" onClick={advance}>
            {t("quiz.next")}
          </button>
        </>
      )}
    </div>
  );
}
