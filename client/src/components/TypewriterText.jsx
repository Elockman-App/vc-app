import React, { useState, useEffect, useRef } from "react";
import { soundEngine } from "../utils/soundEngine";

export default function TypewriterText({
  text = "",
  speed = 22,
  className = "",
  style = {},
  onComplete,
  enableSound = true
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setDisplayedText("");
    setIsCompleted(false);
    indexRef.current = 0;

    if (!text) return;

    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        const nextChar = text.charAt(indexRef.current);
        setDisplayedText((prev) => prev + nextChar);

        // Her 2 karakterde bir hafif daktilo tık sesi
        if (enableSound && indexRef.current % 2 === 0) {
          soundEngine.playTypewriterSound();
        }

        indexRef.current += 1;
      } else {
        clearInterval(timerRef.current);
        setIsCompleted(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed, enableSound, onComplete]);

  // Tıklanınca anında metni tamamla
  const handleSkip = () => {
    if (isCompleted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedText(text);
    setIsCompleted(true);
    if (onComplete) onComplete();
  };

  return (
    <span
      className={`typewriter-container ${className}`}
      style={{ cursor: isCompleted ? "default" : "pointer", ...style }}
      onClick={handleSkip}
      title={isCompleted ? "" : "Tıklayarak metni anında tamamlayabilirsiniz"}
    >
      {displayedText}
      {!isCompleted && <span className="typewriter-cursor">|</span>}
    </span>
  );
}
