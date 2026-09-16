const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (isJson && body && body.error) || "Bir hata oluştu.";
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  // takımlar
  createTeam: (name, members) =>
    request("/teams", { method: "POST", body: JSON.stringify({ name, members }) }),
  getTeam: (id) => request(`/teams/${id}`),
  listTeams: () => request("/teams"),
  setStage: (id, stage, bolum, miniVaka) =>
    request(`/teams/${id}/stage`, {
      method: "PUT",
      body: JSON.stringify({ stage, bolum, miniVaka })
    }),

  // mini vaka
  listMiniVaka: () => request(`/mini-vaka`),
  getMiniVaka: (sira) => request(`/mini-vaka/${sira}`),
  submitAnswer: (sira, teamId, answerText) =>
    request(`/mini-vaka/${sira}/answer`, {
      method: "POST",
      body: JSON.stringify({ teamId, answerText })
    }),

  // ana kanıt
  revealAnaKanit: (harf, teamId, bolumNum) =>
    request(`/ana-kanit/${harf}/reveal`, {
      method: "POST",
      body: JSON.stringify({ teamId, bolumNum })
    }),

  // final
  unlockFinal: (teamId, code) =>
    request(`/final/unlock`, { method: "POST", body: JSON.stringify({ teamId, code }) }),
  submitParcaA: (teamId, text) =>
    request(`/final/parca-a`, { method: "POST", body: JSON.stringify({ teamId, text }) }),
  getFinalProgress: (teamId) => request(`/final/${teamId}`),

  // son gece
  getSonGece: () => request(`/son-gece`),
  submitSonGeceSentez: (teamId, satir1, satir2, satir3) =>
    request(`/son-gece/sentez`, {
      method: "POST",
      body: JSON.stringify({ teamId, satir1, satir2, satir3 })
    }),

  // admin
  overview: () => request("/admin/overview"),
  queue: () => request("/admin/queue"),
  scoreMiniVaka: (answerId, score) =>
    request(`/admin/answers/${answerId}/score`, {
      method: "PUT",
      body: JSON.stringify({ score })
    }),
  scoreAnaKanit: (teamId, harf, score) =>
    request(`/ana-kanit/admin/${teamId}/${harf}/score`, {
      method: "PUT",
      body: JSON.stringify({ score })
    }),
  scoreFinalParcaA: (teamId, score) =>
    request(`/final/admin/${teamId}/parca-a/score`, {
      method: "PUT",
      body: JSON.stringify({ score })
    }),
  setSession: (patch) => request(`/admin/session`, { method: "PUT", body: JSON.stringify(patch) }),
  resetSession: () => request(`/admin/reset`, { method: "POST" }),
  sendBroadcast: (message) =>
    request(`/admin/broadcast`, { method: "POST", body: JSON.stringify({ message }) }),
  exportCsvUrl: `${BASE}/admin/export-csv`,

  // oturum
  getSession: () => request(`/session`),

  // qr
  getQr: () => request("/qr")
};

