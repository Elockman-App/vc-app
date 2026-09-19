const BASE = "/api";

// ---- Admin oturum token'ı (PIN ile giriş) ----
const TOKEN_KEY = "vc_admin_token";
let memoryToken = null; // localStorage kullanılamazsa yedek
export const adminToken = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY) || memoryToken;
    } catch (e) {
      return memoryToken;
    }
  },
  set(t) {
    memoryToken = t;
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch (e) {}
  },
  clear() {
    memoryToken = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }
};

async function request(path, options = {}) {
  const token = adminToken.get();
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  if (res.status === 401 && !path.startsWith("/admin/login")) {
    // Süresi dolmuş / geçersiz admin oturumu — paneli giriş ekranına döndür
    adminToken.clear();
    window.dispatchEvent(new Event("admin-unauthorized"));
  }
  if (!res.ok) {
    const message = (isJson && body && body.error) || "Bir hata oluştu.";
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

async function downloadFile(path, filename) {
  const token = adminToken.get();
  const res = await fetch(BASE + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    if (res.status === 401) {
      adminToken.clear();
      window.dispatchEvent(new Event("admin-unauthorized"));
    }
    throw new Error("Dosya indirilemedi.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
  login: (pin) => request("/admin/login", { method: "POST", body: JSON.stringify({ pin }) }),
  checkAdmin: () => request("/admin/check"),
  getScored: () => request("/admin/scored"),
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
  resetSession: (confirm) =>
    request(`/admin/reset`, { method: "POST", body: JSON.stringify({ confirm }) }),
  sendBroadcast: (message) =>
    request(`/admin/broadcast`, { method: "POST", body: JSON.stringify({ message }) }),
  // CSV'ler Authorization başlığı gerektirdiği için düz link yerine fetch + blob ile indirilir
  downloadCsv: () => downloadFile("/admin/export-csv", "vc_dedektifleri_skor_raporu.csv"),
  downloadAnswersCsv: () =>
    downloadFile("/admin/export-answers-csv", "vc_dedektifleri_cevap_detaylari.csv"),
  renameTeam: (id, name, members) =>
    request(`/admin/teams/${id}`, { method: "PUT", body: JSON.stringify({ name, members }) }),
  deleteTeam: (id) => request(`/admin/teams/${id}`, { method: "DELETE" }),

  // oturum
  getSession: () => request(`/session`),

  // qr
  getQr: () => request("/qr")
};

