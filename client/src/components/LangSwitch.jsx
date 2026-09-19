import React from "react";
import { LANGS, useLang } from "../i18n";

/** TR / EN dil seçici. Seçim anında uygulanır ve tarayıcıda saklanır. */
export default function LangSwitch({ style }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className="lang-switch" style={style} title={t("langTitle")}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={"lang-btn" + (lang === l.code ? " active" : "")}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
