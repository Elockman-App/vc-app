import React from "react";
import TypewriterText from "./TypewriterText";

export default function SpeechBubble({ text, align = "left" }) {
  return (
    <div className={"speech-bubble " + align}>
      <div className="bubble-box">
        <TypewriterText text={text} speed={25} />
      </div>
      <div className="bubble-tail" />
    </div>
  );
}

