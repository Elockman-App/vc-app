import React, { useState } from "react";
import { useGame } from "../../context/GameContext";

export default function TeamCreate() {
  const { createTeam } = useGame();
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setErr("Lütfen bir takım adı girin.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await createTeam(name, members);
    } catch (e2) {
      setErr(e2.message || "Takım oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen dark">
      <div className="center-screen">
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div className="divider-eyebrow">PROJE AYNA</div>
            <h1 style={{ fontSize: "1.7rem" }}>VC Dedektifleri 2.0</h1>
            <p className="muted">Dedektif ekibinin adını gir, soruşturmaya başlayalım.</p>
          </div>
          <form onSubmit={handleSubmit} className="card-dark">
            <div className="form-field">
              <label>Takım Adı</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Sarı Bariyer Ekibi"
                maxLength={60}
                autoFocus
              />
            </div>
            <div className="form-field">
              <label>Takım Üyeleri (opsiyonel)</label>
              <input
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                placeholder="Örn: Ayşe, Mehmet, Can"
                maxLength={300}
              />
            </div>
            {err && <p style={{ color: "#ff8080", fontSize: "0.9rem" }}>{err}</p>}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Oluşturuluyor..." : "Soruşturmaya Başla"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
