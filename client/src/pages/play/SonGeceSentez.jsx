import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";

export default function SonGeceSentez() {
  const { team, advance } = useGame();
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
  }, [tick]);

  async function gonder() {
    if (!secim[0] || !secim[1] || !secim[2]) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await api.submitSonGeceSentez(team.id, secim[0], secim[1], secim[2]);
      setSonuc(res);
    } catch (e) {
      setErr(e.message || "Gönderilemedi, tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  if ((!sinav || vakalar.length === 0) && err)
    return (
      <div className="screen dark" style={{ padding: "1.4rem 1.1rem", justifyContent: "center", textAlign: "center" }}>
        <p style={{ color: "#ff8080" }}>{err}</p>
        <button className="btn" onClick={() => setTick((t) => t + 1)}>Tekrar Dene</button>
      </div>
    );
  if (!sinav || vakalar.length === 0) return <p className="spinner-text">Yükleniyor...</p>;

  return (
    <div className="screen dark" style={{ padding: "1.2rem 1.1rem" }}>
      <div className="beat-tag karar">ÜÇ YOLUN SINAVI</div>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        Bu gecedeki her kanıt için, tam tersini gösteren mini vakayı seçin.
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
              <option value="">Bir mini vaka seçin...</option>
              {vakalar.map((mv) => (
                <option key={mv.sira} value={mv.sira}>
                  Mini Vaka {mv.sira} — {mv.baslik}
                </option>
              ))}
            </select>
          ) : (
            <div className={"sentez-result " + (sonuc.detay[i].correct ? "correct" : "incorrect")}>
              {sonuc.detay[i].correct
                ? "✔ Doğru!"
                : `✘ Doğru cevap: Mini Vaka ${sonuc.detay[i].dogruMiniVakaSira} — ${sonuc.detay[i].dogruMiniVakaBaslik}`}
            </div>
          )}
        </div>
      ))}

      {!sonuc ? (
        <>
        {err && <p style={{ color: "#ff8080", textAlign: "center" }}>{err}</p>}
        <button className="btn" disabled={busy} onClick={gonder}>
          {busy ? "Gönderiliyor..." : "Cevapları Gönder"}
        </button>
        </>
      ) : (
        <>
          {sonuc.already && (
            <p className="muted" style={{ textAlign: "center" }}>İlk gönderiminiz geçerlidir.</p>
          )}
          <p style={{ textAlign: "center", fontWeight: 700, marginTop: "1rem" }}>
            Puanınız: {sonuc.score} / {sonuc.maxScore}
          </p>
          <button className="btn" onClick={advance}>
            Devam Et → Kapanış
          </button>
        </>
      )}
    </div>
  );
}
