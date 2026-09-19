import React from "react";
import { useGame } from "../../context/GameContext";

export default function Briefing() {
  const { team, advance } = useGame();

  return (
    <div className="screen dark" style={{ padding: "1.2rem 1.1rem" }}>
      <div className="divider-eyebrow">DOSYA BRİFİNGİ</div>
      <h1 style={{ fontSize: "1.6rem" }}>Hoş Geldiniz, {team?.name}</h1>
      <p>
        Altı ay önce İç Denetim'e imzasız bir not ulaştı. 9 dosya. 3 bölüm. Tek soru:
        <b> notu yazan kişi neyi gördü?</b>
      </p>
      <p className="muted">
        Not, üç parçaya bölündü. Her bölüm sonunda bir parça + bir kod kazanacaksınız.
        Üç kod, Final Dosyası'nın kilidini açacak.
      </p>
      <div className="card-dark" style={{ borderLeft: "4px solid var(--red)" }}>
        <div style={{ fontWeight: 700, color: "#ff8080", marginBottom: 6 }}>İMZASIZ NOT</div>
        <div className="muted" style={{ fontStyle: "italic" }}>İÇERİK: [ ERİŞİM KISITLI ]</div>
      </div>
      <button className="btn" onClick={advance}>
        Devam Et →
      </button>
    </div>
  );
}
