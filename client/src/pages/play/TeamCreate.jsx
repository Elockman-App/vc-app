import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useLang } from "../../i18n";
import LangSwitch from "../../components/LangSwitch";

export default function TeamCreate() {
  const { createTeam, joinTeam } = useGame();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [mode, setMode] = useState("new");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === "join") {
      if (!name.trim() || code.replace(/\D/g, "").length !== 4) {
        setErr(t("team.needJoin"));
        return;
      }
      setBusy(true);
      setErr(null);
      try {
        await joinTeam(name, code);
      } catch (e2) {
        setErr(e2.message || t("team.failed"));
      } finally {
        setBusy(false);
      }
      return;
    }
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
          <div style={{ display: "flex", gap: 8, marginBottom: "0.8rem" }}>
            {[["new", "team.tabNew"], ["join", "team.tabJoin"]].map(([m, k]) => (
              <button
                key={m}
                type="button"
                className={"btn" + (mode === m ? "" : " secondary")}
                style={{ flex: 1, margin: 0, padding: "0.5em" }}
                onClick={() => {
                  setMode(m);
                  setErr(null);
                }}
              >
                {t(k)}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="card-dark">
            {mode === "join" && <p className="muted" style={{ marginTop: 0 }}>{t("team.joinHint")}</p>}
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
            {mode === "new" ? (
              <div className="form-field">
                <label>{t("team.members")}</label>
                <input
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder={t("team.membersPh")}
                  maxLength={300}
                />
              </div>
            ) : (
              <div className="form-field">
                <label>{t("team.code")}</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  inputMode="numeric"
                  maxLength={4}
                />
              </div>
            )}
            {err && <p style={{ color: "#ff8080", fontSize: "0.9rem" }}>{err}</p>}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? (mode === "join" ? t("team.joining") : t("team.creating")) : mode === "join" ? t("team.joinBtn") : t("team.start")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
