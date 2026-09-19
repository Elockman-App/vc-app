import React, { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import TeamCreate from "./play/TeamCreate";
import Briefing from "./play/Briefing";
import BolumAyirici from "./play/BolumAyirici";
import OlayAni from "./play/OlayAni";
import KanitAni from "./play/KanitAni";
import KararAni from "./play/KararAni";
import AnaKanit from "./play/AnaKanit";
import FinalKilit from "./play/FinalKilit";
import FinalParcaA from "./play/FinalParcaA";
import SonGeceAcilis from "./play/SonGeceAcilis";
import SonGeceKanit from "./play/SonGeceKanit";
import SonGeceSentez from "./play/SonGeceSentez";
import Kapanis from "./play/Kapanis";

import { soundEngine } from "../utils/soundEngine";
import CaseProgressMapModal from "../components/CaseProgressMapModal";
import BroadcastModal from "../components/BroadcastModal";
import { api } from "../api";

const STAGE_COMPONENTS = {
  BRIEFING: Briefing,
  BOLUM: BolumAyirici,
  OLAY_ANI: OlayAni,
  KANIT_ANI: KanitAni,
  KARAR_ANI: KararAni,
  ANA_KANIT: AnaKanit,
  FINAL_KILIT: FinalKilit,
  FINAL_PARCA_A: FinalParcaA,
  SON_GECE_ACILIS: SonGeceAcilis,
  SON_GECE_KANIT: SonGeceKanit,
  SON_GECE_SENTEZ: SonGeceSentez,
  KAPANIS: Kapanis
};

export default function Play() {
  const { team, loading } = useGame();
  const [muted, setMuted] = useState(soundEngine.isMuted());
  const [showMap, setShowMap] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState(null);
  const [lastBroadcastTime, setLastBroadcastTime] = useState(null);

  // Periyodik duyuru kontrolü (3 saniyede bir)
  useEffect(() => {
    if (!team) return;

    const checkSession = async () => {
      try {
        const sess = await api.getSession();
        if (sess?.broadcastMessage && sess?.broadcastUpdatedAt !== lastBroadcastTime) {
          setBroadcastMsg(sess.broadcastMessage);
          setLastBroadcastTime(sess.broadcastUpdatedAt);
        } else if (!sess?.broadcastMessage && sess?.broadcastUpdatedAt !== lastBroadcastTime) {
          // Facilitator duyuruyu kaldırdı: açık modal varsa kapat
          setBroadcastMsg(null);
          setLastBroadcastTime(sess?.broadcastUpdatedAt ?? null);
        }
      } catch (e) {}
    };

    checkSession();
    const interval = setInterval(checkSession, 3000);
    return () => clearInterval(interval);
  }, [team, lastBroadcastTime]);

  if (loading) return <p className="spinner-text">Yükleniyor...</p>;
  if (!team) return <TeamCreate />;

  const StageComponent = STAGE_COMPONENTS[team.currentStage] || Briefing;

  const toggleSound = () => {
    const isNowMuted = soundEngine.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <>
      <div className="top-bar">
        <span>👥 {team.name}</span>

        <div className="top-bar-controls">
          <button className="icon-btn" onClick={() => setShowMap(true)} title="Vaka Haritası">
            🗺️ Harita
          </button>
          <button className="icon-btn" onClick={toggleSound} title="Ses Aç / Kapa">
            {muted ? "🔇" : "🔊"}
          </button>
          <span className="score">{team.totalScore} PTS</span>
        </div>
      </div>

      <StageComponent />

      {showMap && <CaseProgressMapModal team={team} onClose={() => setShowMap(false)} />}
      {broadcastMsg && (
        <BroadcastModal message={broadcastMsg} onClose={() => setBroadcastMsg(null)} />
      )}
    </>
  );
}

