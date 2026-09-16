import React from "react";

/** accentHex: "3B6EA8" gibi, # olmadan */
export default function BolumTheme({ accentHex, children }) {
  const style = accentHex ? { "--accent": "#" + accentHex } : {};
  return <div style={style}>{children}</div>;
}
