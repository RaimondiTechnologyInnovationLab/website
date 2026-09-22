"use client";

import { useEffect, useRef } from "react";

const turns = Array.from({ length: 9 }, (_, index) => index);
const helixAmplitude = 16;
const basePairs = Array.from({ length: 8 }, (_, index) => {
  const x = index * 20 + 10;
  const phase = (x % 80) / 80;
  const offset = 4 * helixAmplitude * phase * (1 - phase) * (x < 80 ? -1 : 1);
  return { x, top: 44 + offset, bottom: 44 - offset };
});

function DnaStrands() {
  return (
    <svg viewBox="0 0 1200 88" preserveAspectRatio="xMinYMid slice" focusable="false">
      <g className="vision-dna-molecule" fill="none" stroke="currentColor" strokeLinecap="round">
        {turns.map((turn) => (
          <g key={turn} transform={`translate(${turn * 160} 0)`}>
            {basePairs.map(({ x, top, bottom }) => (
              <line className="vision-dna-pair" key={x} x1={x} y1={top} x2={x} y2={bottom} />
            ))}
            <path className="vision-dna-strand vision-dna-strand-back" d={`M0 44 Q40 ${44 + helixAmplitude * 2} 80 44 T160 44`} />
            <path className="vision-dna-strand" d={`M0 44 Q40 ${44 - helixAmplitude * 2} 80 44 T160 44`} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function ApproachProgress({ variant = "dna" }: { variant?: "dna" | "bar" }) {
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;
    let visible = false;
    const syncPlayback = () => {
      visual.dataset.playing = String(visible && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(visual);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [variant]);

  // Keep the original scroll bar available for a one-line visual rollback.
  if (variant === "bar") return <div className="vision-progress" aria-hidden="true"><span /></div>;

  return (
    <div ref={visualRef} className="vision-dna" aria-hidden="true">
      <div className="vision-dna-track"><DnaStrands /></div>
      <div className="vision-dna-loaded"><DnaStrands /></div>
    </div>
  );
}
