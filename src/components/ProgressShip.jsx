import { useState, useEffect, useRef } from "react";

const meats = ["🍖", "🍖 MEAT!", "🍖🍖 MORE MEAT!!", "🍖🍖🍖 NIKU!!!"];

export default function ProgressShip({ pct }) {
  const [bouncing, setBouncing] = useState(false);
  const [idx, setIdx] = useState(0);

  const timerRef = useRef(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleClick = () => {
    setBouncing(true);
    setIdx(i => (i + 1) % meats.length);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setBouncing(false), 700);
  };

  if (pct < 3) return null;
  return (
    <button
      onClick={handleClick}
      aria-label="Luffy wants meat"
      style={{
        position: "absolute", right: -8, top: -14, fontSize: 20, cursor: "pointer", userSelect: "none",
        background: "none", border: "none", padding: 0, lineHeight: 1,
        transition: "transform 0.2s ease, filter 0.2s ease",
        transform: bouncing ? "translateY(-10px) rotate(-12deg) scale(1.2)" : "none",
        filter: bouncing ? "drop-shadow(0 6px 12px rgba(212,164,76,0.6))" : "none",
      }}
    >
      {bouncing ? meats[idx] : "🚢"}
    </button>
  );
}
