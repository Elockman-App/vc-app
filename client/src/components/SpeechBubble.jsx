import React from "react";
import TypewriterText from "./TypewriterText";

export default function SpeechBubble({ text, align = "left", speaker }) {
  return (
    <div className={"speech-bubble " + align}>
      <div className="bubble-box">
        {speaker ? <div className="bubble-speaker">{speaker}</div> : null}
        <TypewriterText text={text} speed={25} />
      </div>
      <div className="bubble-tail" />
    </div>
  );
}

