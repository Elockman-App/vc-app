import React, { useCallback, useEffect, useState } from "react";
import { api } from "../../api";

/**
 * "Vaka Tartışma" sekmesi: bir mini vakanın sorusunu ve tüm takımların cevaplarını yan yana gösterir.
 * Etkinlikte vaka bittikten sonra projeksiyona yansıtılıp sözlü tartışma için kullanılır.
 */
export default function DiscussionTab() {
  const [data, setData] = useState(null);
  const [sira, setSira] = useState(1);
  const [hideNames, setHideNames] = useState(true);
  const [showRef, setShowRef] = useState(false);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await api.getDiscussion());
      setErr(null);
    } catch (e) {
      setErr(e.message || "Yüklenemedi.");
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  const c = data?.cases?.find((x) => x.sira === sira);

  return (
    <div className="admin-card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {(data?.cases || []).map((x) => (
          <button
            key={x.sira}
            className={"chip" + (x.sira === sira ? " on" : "")}
            style={{ cursor: "pointer", border: "1px solid #c9d1e3" }}
            onClick={() => setSira(x.sira)}
            title={x.baslik}
          >
            {x.sira}. {x.baslik} <b>({x.answers.length})</b>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 10, fontSize: "0.88rem" }}>
        <label>
          <input type="checkbox" checked={hideNames} onChange={(e) => setHideNames(e.target.checked)} /> Takım adlarını gizle
          (anonim)
        </label>
        <label>
          <input type="checkbox" checked={showRef} onChange={(e) => setShowRef(e.target.checked)} /> Referans çözümü göster
        </label>
      </div>

      {err && <p style={{ color: "#c62828" }}>{err}</p>}
      {!c && !err && <p className="muted">Yükleniyor...</p>}

      {c && (
        <>
          <div style={{ background: "#101b3d", color: "#fff", borderRadius: 10, padding: "1rem 1.2rem", marginBottom: 12 }}>
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
              MİNİ VAKA {c.sira} — {c.baslik}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: 4 }}>“{c.kararSorusu}”</div>
          </div>

          {c.answers.length === 0 && <p className="muted">Bu vaka için henüz cevap gelmedi.</p>}
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {c.answers.map((a, i) => (
              <div
                key={i}
                style={{ border: "1.5px solid #c9d1e3", borderRadius: 10, padding: "0.8rem 1rem", background: "#fff", color: "#101b3d" }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 6, color: "#5a6b96" }}>
                  {hideNames ? `Takım ${i + 1}` : a.teamName}
                </div>
                <div style={{ fontSize: "1.05rem", lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{a.text}</div>
              </div>
            ))}
          </div>

          {showRef && (
            <div style={{ marginTop: 14, borderLeft: "4px solid #2e7d32", background: "#eef7ee", color: "#1b3d1e", padding: "0.8rem 1rem", borderRadius: 6 }}>
              <b>Referans çözüm:</b> {c.dogruCozum}
            </div>
          )}
        </>
      )}
    </div>
  );
}
