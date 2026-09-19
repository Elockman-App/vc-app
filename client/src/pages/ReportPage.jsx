import React, { useEffect, useState } from "react";
import { api } from "../api";

/**
 * Etkinlik sonuç raporu (/report). Yönetici PIN'i ile giriş yapılmış tarayıcıda açılır.
 * "PDF olarak kaydet" düğmesi tarayıcının yazdırma penceresini açar (hedef: PDF olarak kaydet).
 */

function fmt(d) {
  try {
    return new Date(d).toLocaleString("tr-TR");
  } catch (e) {
    return d;
  }
}

const th = { textAlign: "left", padding: "6px 8px", borderBottom: "2px solid #101b3d", fontSize: "0.85rem" };
const td = { padding: "6px 8px", borderBottom: "1px solid #dfe4f0", fontSize: "0.9rem", verticalAlign: "top" };

function Bar({ pct }) {
  return (
    <div style={{ background: "#e6eaf5", borderRadius: 4, height: 10, width: 140 }}>
      <div style={{ width: `${pct || 0}%`, height: "100%", background: pct >= 70 ? "#2e7d32" : pct >= 50 ? "#f9a825" : "#c62828", borderRadius: 4 }} />
    </div>
  );
}

export default function ReportPage() {
  const [r, setR] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    document.title = "Etkinlik Sonuç Raporu";
    api
      .getReport()
      .then(setR)
      .catch((e) => setErr(e.status === 401 ? "Bu raporu görmek için önce yönetici panelinden PIN ile giriş yapın." : e.message || "Rapor yüklenemedi."));
  }, []);

  if (err) return <p style={{ padding: "2rem", color: "#c62828", fontFamily: "sans-serif" }}>{err}</p>;
  if (!r) return <p style={{ padding: "2rem", fontFamily: "sans-serif" }}>Yükleniyor...</p>;

  return (
    <div style={{ background: "#fff", color: "#101b3d", minHeight: "100vh", fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff !important; } .avoid { break-inside: avoid; } }`}</style>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem" }}>
        <div className="no-print" style={{ textAlign: "right", marginBottom: 10 }}>
          <button className="btn" style={{ width: "auto", margin: 0 }} onClick={() => window.print()}>
            🖨️ PDF olarak kaydet / Yazdır
          </button>
        </div>

        <h1 style={{ marginBottom: 2 }}>{r.sessionName} — Etkinlik Sonuç Raporu</h1>
        <div style={{ color: "#5a6b96", marginBottom: 16 }}>Oluşturulma: {fmt(r.generatedAt)}</div>

        <div className="avoid" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          {[
            ["Katılan takım", r.teamCount],
            ["Oyunu tamamlayan", `${r.finishedCount} / ${r.teamCount}`],
            ["Puan bekleyen cevap", r.pendingScoring]
          ].map(([k, v]) => (
            <div key={k} style={{ border: "1px solid #dfe4f0", borderRadius: 8, padding: "0.6rem 1rem", minWidth: 150 }}>
              <div style={{ fontSize: "0.78rem", color: "#5a6b96" }}>{k}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{v}</div>
            </div>
          ))}
        </div>
        {r.pendingScoring > 0 && (
          <p style={{ background: "#fff8e1", border: "1px solid #f0d98a", borderRadius: 6, padding: "0.5rem 0.8rem", fontSize: "0.88rem" }}>
            ⚠ {r.pendingScoring} cevap henüz puanlanmadı; ortalamalar sadece puanlanmış cevapları içerir.
          </p>
        )}

        <h2>Sıralama</h2>
        <table className="avoid" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Takım</th>
              <th style={th}>Üyeler</th>
              <th style={th}>Puan / {r.maxTotalScore}</th>
              <th style={th}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {r.ranking.map((t) => (
              <tr key={t.rank}>
                <td style={td}>{t.rank}</td>
                <td style={td}><b>{t.name}</b></td>
                <td style={td}>{t.members}</td>
                <td style={td}>{t.totalScore}</td>
                <td style={td}>{t.finished ? "Tamamladı" : "Devam ediyor"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Vaka bazında başarı (ortalama puan, 100 üzerinden)</h2>
        <table className="avoid" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Vaka</th>
              <th style={th}>Bölüm</th>
              <th style={th}>Cevap</th>
              <th style={th}>Ortalama</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {r.perCase.map((c) => (
              <tr key={c.sira}>
                <td style={td}>{c.sira}. {c.baslik}</td>
                <td style={td}>{c.bolum}</td>
                <td style={td}>{c.scoredCount} / {c.answerCount} puanlı</td>
                <td style={td}>{c.avgScore === null ? "—" : c.avgScore}</td>
                <td style={td}>{c.avgScore !== null && <Bar pct={c.avgPercent} />}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {(r.weakest.length > 0 || r.strongest.length > 0) && (
          <div className="avoid" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
            {r.weakest.length > 0 && (
              <div style={{ flex: 1, minWidth: 260, borderLeft: "4px solid #c62828", background: "#fdf0f0", padding: "0.6rem 1rem" }}>
                <b>En çok zorlanılan vakalar</b>
                <ol style={{ margin: "4px 0 0 18px", padding: 0 }}>
                  {r.weakest.map((c) => <li key={c.sira}>{c.baslik} ({c.avgScore})</li>)}
                </ol>
              </div>
            )}
            {r.strongest.length > 0 && (
              <div style={{ flex: 1, minWidth: 260, borderLeft: "4px solid #2e7d32", background: "#eef7ee", padding: "0.6rem 1rem" }}>
                <b>En iyi anlaşılan vakalar</b>
                <ol style={{ margin: "4px 0 0 18px", padding: 0 }}>
                  {r.strongest.map((c) => <li key={c.sira}>{c.baslik} ({c.avgScore})</li>)}
                </ol>
              </div>
            )}
          </div>
        )}

        <h2>Bölüm bazında (VC Way yolculukları)</h2>
        <table className="avoid" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Bölüm</th>
              <th style={th}>Değerler</th>
              <th style={th}>Ortalama %</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {r.perBolum.map((b) => (
              <tr key={b.num}>
                <td style={td}>{b.num}. {b.baslik}</td>
                <td style={td}>{b.degerler.join(", ")}</td>
                <td style={td}>{b.avgPercent === null ? "—" : `%${b.avgPercent}`}</td>
                <td style={td}>{b.avgPercent !== null && <Bar pct={b.avgPercent} />}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Diğer bölümler (ortalama)</h2>
        <table className="avoid" style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Ana Kanıt sentezi", r.others.anaKanit],
              ["Final — Parça A teşhisi", r.others.parcaA],
              ["Son Gece — Üç Yolun Sınavı", r.others.sonGece]
            ].map(([name, o]) => (
              <tr key={name}>
                <td style={td}>{name}</td>
                <td style={td}>{o.avg === null ? "—" : `${o.avg} / ${o.max}`}</td>
                <td style={td}>{o.count} takım</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: "#5a6b96", fontSize: "0.8rem", marginTop: 20 }}>
          Not: Bölüm ve vaka ortalamaları yönetici puanlarına dayanır; küçük takım sayılarında (5 takım) eğilim olarak okunmalıdır.
        </p>
      </div>
    </div>
  );
}
