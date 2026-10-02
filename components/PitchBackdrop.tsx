"use client";
import { useState } from "react";
export function PitchBackdrop() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="pitch-backdrop" data-paused={paused}>
      <div className="pitch-art" aria-hidden="true">
        <div className="pitch-glow" />
        <svg className="pitch-lines" viewBox="0 0 600 360" fill="none">
          <rect x="20" y="20" width="560" height="320" rx="4" />
          <path d="M300 20V340 M20 95H100V265H20 M580 95H500V265H580 M20 140H55V220H20 M580 140H545V220H580" />
          <circle cx="300" cy="180" r="58" />
          <circle cx="300" cy="180" r="3" fill="currentColor" />
          <path d="M100 132Q145 180 100 228 M500 132Q455 180 500 228" />
        </svg>
        <div className="pitch-orbit" />
        <div className="pitch-grain" />
      </div>
      <button type="button" className="motion-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume background" : "Pause background"}</button>
    </div>
  );
}
