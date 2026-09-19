import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { api } from "../../api";

export default function FinalKilit() {
  const { team, advance } = useGame();
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
      setErr(e.body?.error || e.message || "Kod hatalı, tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen dark" style={{ padding: "1.4rem 1.1rem", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="divider-eyebrow">FİNAL DOSYASI</div>
        <h1 style={{ fontSize: "1.6rem" }}>Aynadaki Örüntü</h1>
      </div>

      {!notTam ? (
        <>
          <p className="muted" style={{ textAlign: "center" }}>
            Üç Ana Kanıt kodunu birleştirin ve girin.
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
            {busy ? "Kontrol ediliyor..." : "Kilidi Aç"}
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
              Devam Et →
            </button>
          )}
        </>
      )}
    </div>
  );
}
