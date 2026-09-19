import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";

const GameContext = createContext(null);
const STORAGE_KEY = "vc2_team_id";
// Takımın son bilinen durumu: sunucu yeniden başlarsa kaldığı yerden devam edebilsin diye
const SNAPSHOT_KEY = "vc2_team_snapshot";

function readSnapshot() {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "null");
  } catch (e) {
    return null;
  }
}

function writeSnapshot(t) {
  try {
    localStorage.setItem(
      SNAPSHOT_KEY,
      JSON.stringify({
        name: t.name,
        members: t.members || "",
        stage: t.currentStage,
        bolum: t.currentBolum,
        miniVaka: t.currentMiniVaka
      })
    );
  } catch (e) {}
}

// Doğrusal akış: her mini vaka bitince ya bir sonraki vakaya ya Ana Kanıt'a geçilir.
// bkz. server/utils/stages.js — bu liste sunucudaki enum ile birebir uyumlu olmalı.
function computeNext(team) {
  const { currentStage: stage, currentBolum: bolum, currentMiniVaka: mv } = team;

  if (stage === "BRIEFING") return { stage: "BOLUM", bolum: 1, miniVaka: 1 };
  if (stage === "BOLUM") return { stage: "OLAY_ANI", bolum, miniVaka: mv };
  if (stage === "OLAY_ANI") return { stage: "KANIT_ANI", bolum, miniVaka: mv };
  if (stage === "KANIT_ANI") return { stage: "KARAR_ANI", bolum, miniVaka: mv };

  if (stage === "KARAR_ANI") {
    if (mv % 3 === 0) return { stage: "ANA_KANIT", bolum, miniVaka: mv };
    return { stage: "OLAY_ANI", bolum, miniVaka: mv + 1 };
  }

  if (stage === "ANA_KANIT") {
    if (bolum < 3) return { stage: "BOLUM", bolum: bolum + 1, miniVaka: bolum * 3 + 1 };
    return { stage: "FINAL_KILIT", bolum, miniVaka: mv };
  }

  if (stage === "FINAL_KILIT") return { stage: "FINAL_PARCA_A", bolum, miniVaka: mv };
  if (stage === "FINAL_PARCA_A") return { stage: "SON_GECE_ACILIS", bolum, miniVaka: mv };
  if (stage === "SON_GECE_ACILIS") return { stage: "SON_GECE_KANIT", bolum, miniVaka: mv };
  if (stage === "SON_GECE_KANIT") return { stage: "SON_GECE_SENTEZ", bolum, miniVaka: mv };
  if (stage === "SON_GECE_SENTEZ") return { stage: "KAPANIS", bolum, miniVaka: mv };

  return { stage: "KAPANIS", bolum, miniVaka: mv };
}

export function GameProvider({ children }) {
  const [team, setTeam] = useState(null);
  const [miniVaka, setMiniVaka] = useState(null);
  const [loading, setLoading] = useState(true);
  const [netDown, setNetDown] = useState(false);
  const [teamMissing, setTeamMissing] = useState(false);

  // Son bilinen takım durumunu sürekli sakla
  useEffect(() => {
    if (team) writeSnapshot(team);
  }, [team]);

  // api.js'in yolladığı bağlantı olaylarını dinle
  useEffect(() => {
    const down = () => setNetDown(true);
    const up = () => setNetDown(false);
    const missing = () => {
      // Sunucu yeniden başlamış veya oturum sıfırlanmış: kayıtlı takım artık yok
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      setTeam(null);
      setMiniVaka(null);
      // Geri yüklenecek bir kayıt varsa kurtarma ekranı, yoksa doğrudan yeni takım ekranı
      setTeamMissing(!!readSnapshot());
      setLoading(false);
    };
    window.addEventListener("vc-net-down", down);
    window.addEventListener("vc-net-up", up);
    window.addEventListener("vc-team-missing", missing);
    return () => {
      window.removeEventListener("vc-net-down", down);
      window.removeEventListener("vc-net-up", up);
      window.removeEventListener("vc-team-missing", missing);
    };
  }, []);

  const loadMiniVakaIfNeeded = useCallback(async (t) => {
    const needsMiniVaka = ["OLAY_ANI", "KANIT_ANI", "KARAR_ANI"].includes(t.currentStage);
    if (needsMiniVaka && t.currentMiniVaka) {
      const mv = await api.getMiniVaka(t.currentMiniVaka);
      setMiniVaka(mv);
    } else {
      setMiniVaka(null);
    }
  }, []);

  const loadTeam = useCallback(
    async (teamId) => {
      try {
        const t = await api.getTeam(teamId);
        setTeam(t);
        await loadMiniVakaIfNeeded(t);
        setLoading(false);
      } catch (e) {
        if (e && e.network) {
          // Sunucu uyanıyor / bağlantı yok: kaydı SİLME, birkaç saniye sonra tekrar dene
          setTimeout(() => loadTeam(teamId), 3000);
          return;
        }
        // Takım kaydı yok (vc-team-missing olayı zaten kurtarma ekranını açtı) ya da başka hata
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e2) {}
        setTeam(null);
        setMiniVaka(null);
        setLoading(false);
      }
    },
    [loadMiniVakaIfNeeded]
  );

  useEffect(() => {
    let savedId = null;
    try {
      savedId = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    if (savedId) loadTeam(savedId);
    else setLoading(false);
  }, [loadTeam]);

  // Kalp atışı: takım kaydı hâlâ sunucuda mı? (10 sn'de bir; sunucu sıfırlanırsa erken fark edilir)
  useEffect(() => {
    if (!team) return;
    const id = team.id;
    const t = setInterval(() => {
      api.getTeam(id).catch(() => {});
    }, 10000);
    return () => clearInterval(t);
  }, [team?.id]);

  const createTeam = useCallback(async (name, members) => {
    const t = await api.createTeam(name, members);
    try {
      localStorage.setItem(STORAGE_KEY, t.id);
    } catch (e) {}
    setTeam(t);
    setTeamMissing(false);
    return t;
  }, []);

  /** Sunucu yeniden başladıktan sonra: aynı takım adıyla yeni kayıt açar ve kaldığı aşamaya götürür.
   * (Önceki puanlar sunucuyla birlikte gittiği için puan sıfırdan başlar.) */
  const restoreTeam = useCallback(async () => {
    const snap = readSnapshot();
    if (!snap) return null;
    let t = await api.createTeam(snap.name, snap.members);
    try {
      localStorage.setItem(STORAGE_KEY, t.id);
    } catch (e) {}
    if (snap.stage && snap.stage !== "BRIEFING") {
      try {
        t = await api.setStage(t.id, snap.stage, snap.bolum, snap.miniVaka);
      } catch (e) {
        /* aşama geri yüklenemezse baştan devam eder */
      }
    }
    setTeam(t);
    setTeamMissing(false);
    await loadMiniVakaIfNeeded(t);
    return t;
  }, [loadMiniVakaIfNeeded]);

  /** Kurtarma ekranında "yeni takımla başla" seçeneği */
  const startFresh = useCallback(() => {
    try {
      localStorage.removeItem(SNAPSHOT_KEY);
    } catch (e) {}
    setTeamMissing(false);
  }, []);

  /** Doğrusal akışta bir sonraki adıma geçer. Skip edilecek adım varsa (ör.
   * Final Parça A kapalıysa) ilgili ekran kendi içinde bunu handle eder. */
  const advance = useCallback(async () => {
    if (!team) return;
    const next = computeNext(team);
    const updated = await api.setStage(team.id, next.stage, next.bolum, next.miniVaka);
    setTeam(updated);
    await loadMiniVakaIfNeeded(updated);
    return updated;
  }, [team, loadMiniVakaIfNeeded]);

  /** Belirli bir aşamaya doğrudan atlamak için (ör. Final Parça A kapalıyken
   * FINAL_KILIT'ten SON_GECE_ACILIS'e geçiş). */
  const goTo = useCallback(
    async (stage, bolum, miniVaka) => {
      if (!team) return;
      const updated = await api.setStage(
        team.id,
        stage,
        bolum ?? team.currentBolum,
        miniVaka ?? team.currentMiniVaka
      );
      setTeam(updated);
      await loadMiniVakaIfNeeded(updated);
      return updated;
    },
    [team, loadMiniVakaIfNeeded]
  );

  const refreshTeam = useCallback(() => {
    if (team) return loadTeam(team.id);
  }, [team, loadTeam]);

  return (
    <GameContext.Provider
      value={{
        team,
        miniVaka,
        loading,
        netDown,
        teamMissing,
        createTeam,
        restoreTeam,
        startFresh,
        advance,
        goTo,
        refreshTeam
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
