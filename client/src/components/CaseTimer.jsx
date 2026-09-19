import React, { useState, useEffect } from "react";
import { soundEngine } from "../utils/soundEngine";
import { useLang } from "../i18n";

export default function CaseTimer({ durationSeconds = 180 }) {
  const { t } = useLang();
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    setSecondsLeft(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 30 && next > 0) {
          setIsUrgent(true);
          soundEngine.playTickSound();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className={`case-timer-box ${isUrgent ? "urgent" : ""}`}>
      <span className="timer-icon">⏱️</span>
      <span className="timer-value">{secondsLeft > 0 ? formatted : t("timer.up")}</span>
    </div>
  );
}
