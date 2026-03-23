import { useState } from "react";

const meats = ["🍖", "🍖 MEAT!", "🍖🍖 MORE MEAT!!", "🍖🍖🍖 NIKU!!!"];

export default function ProgressShip({ pct }) {
  const [bouncing, setBouncing] = useState(false);
  const [idx, setIdx] = useState(0);

  const handleClick = () => {
    setBouncing(true);
    setIdx(i => (i + 1) % meats.length);
    setTimeout(() => setBouncing(false), 700);
  };

  if (pct < 3) return null;
  return (
    <span
      onClick={handleClick}
      style={{
        position: "absolute", right: -8, top: -14, fontSize: 20, cursor: "pointer", userSelect: "none",
        transition: "transform 0.2s ease, filter 0.2s ease",
        transform: bouncing ? "translateY(-10px) rotate(-12deg) scale(1.2)" : "none",
        filter: bouncing ? "drop-shadow(0 6px 12px rgba(212,164,76,0.6))" : "none",
      }}
    >
      {bouncing ? meats[idx] : "🚢"}
    </span>
  );
}
