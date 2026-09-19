import React, { useEffect, useState } from "react";
import { api } from "../api";

/**
 * Canlı skor tablosu — projeksiyona yansıtmak için (/scoreboard).
 * Giriş gerektirmez; puanlar admin panelinden "gizle" denirse görünmez, sadece ilerleme gösterilir.
 */

function whereLabel(w) {
  if (w.key === "brief") return "Brifingde";
  if (w.key === "done") return "Tamamladı 🏁";
  if (w.key === "final") return "Final Dosyası";
  if (w.key === "night") return "Son Gece";
  return `Vaka ${w.miniVaka}`;
}

export default function ScoreboardPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const d = await api.getScoreboard();
        if (alive) {
          setData(d);
          setErr(false);
        }
      } catch (e) {
        if (alive) setErr(true);
      }
    }
    load();
    const t = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    document.title = "Skor Tablosu — VC Dedektifleri";
  }, []);

  const teams = data?.teams || [];

  return (
    <div style={{ minHeight: "100vh", background: "#0b1230", color: "#fff", padding: "2rem clamp(1rem, 4vw, 4rem)", boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ letterSpacing: 4, fontSize: "0.9rem", color: "#c9a44c" }}>PROJE AYNA</div>
        <h1 style={{ margin: "0.2rem 0", fontSize: "clamp(1.6rem, 4vw, 3rem)" }}>{data?.sessionName || "VC Dedektifleri 2.0"}</h1>
        <div style={{ opacity: 0.7 }}>{data?.hidden ? "Puanlar finalde açıklanacak" : "Canlı Sıralama"}</div>
        {err && <div style={{ color: "#ff8a80", marginTop: 6 }}>Bağlantı kesildi, yeniden deneniyor…</div>}
      </div>

      {teams.length === 0 && !err && (
        <p style={{ textAlign: "center", opacity: 0.7, fontSize: "1.2rem" }}>Henüz takım katılmadı.</p>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 12 }}>
        {teams.map((t, i) => (
          <div
            key={t.name + i}
            style={{
              display: "grid",
              gridTemplateColumns: "clamp(2.5rem, 6vw, 4.5rem) 1fr auto",
              alignItems: "center",
              gap: 16,
              background: "#16204a",
              borderRadius: 14,
              padding: "1rem 1.4rem",
              border: !data?.hidden && i === 0 ? "2px solid #c9a44c" : "2px solid transparent"
            }}
          >
            <div style={{ fontSize: "clamp(1.4rem, 4vw, 2.6rem)", fontWeight: 800, color: "#c9a44c", textAlign: "center" }}>
              {data?.hidden ? "•" : i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "clamp(1.1rem, 3vw, 2rem)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <div style={{ flex: 1, height: 10, background: "#0b1230", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${t.progress}%`, height: "100%", background: t.where.key === "done" ? "#4caf50" : "#5b8def", transition: "width 0.6s" }} />
                </div>
                <div style={{ fontSize: "0.95rem", opacity: 0.8, minWidth: 110 }}>{whereLabel(t.where)}</div>
              </div>
            </div>
            <div style={{ fontSize: "clamp(1.4rem, 4vw, 2.6rem)", fontWeight: 800, color: "#c9a44c", minWidth: 90, textAlign: "right" }}>
              {t.score === null ? "" : t.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
