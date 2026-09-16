import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";

const GameContext = createContext(null);
const STORAGE_KEY = "vc2_team_id";

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
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
        setTeam(null);
        setMiniVaka(null);
      } finally {
        setLoading(false);
      }
    },
    [loadMiniVakaIfNeeded]
  );

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) loadTeam(savedId);
    else setLoading(false);
  }, [loadTeam]);

  const createTeam = useCallback(async (name, members) => {
    const t = await api.createTeam(name, members);
    localStorage.setItem(STORAGE_KEY, t.id);
    setTeam(t);
    return t;
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
      value={{ team, miniVaka, loading, createTeam, advance, goTo, refreshTeam }}
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
