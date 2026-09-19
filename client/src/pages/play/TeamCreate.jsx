import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useLang } from "../../i18n";
import LangSwitch from "../../components/LangSwitch";

export default function TeamCreate() {
  const { createTeam } = useGame();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setErr(t("team.needName"));
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await createTeam(name, members);
    } catch (e2) {
      setErr(e2.message || t("team.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen dark">
      <div className="center-screen">
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <LangSwitch style={{ marginBottom: "1rem" }} />
            <div className="divider-eyebrow">{t("team.eyebrow")}</div>
            <h1 style={{ fontSize: "1.7rem" }}>{t("team.title")}</h1>
            <p className="muted">{t("team.sub")}</p>
          </div>
          <form onSubmit={handleSubmit} className="card-dark">
            <div className="form-field">
              <label>{t("team.name")}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("team.namePh")}
                maxLength={60}
                autoFocus
              />
            </div>
            <div className="form-field">
              <label>{t("team.members")}</label>
              <input
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                placeholder={t("team.membersPh")}
                maxLength={300}
              />
            </div>
            {err && <p style={{ color: "#ff8080", fontSize: "0.9rem" }}>{err}</p>}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? t("team.creating") : t("team.start")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
