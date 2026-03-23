import { useState } from "react";

export default function EpButton({ ep, isW, isFiller, color, onClick, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 46, minHeight: 44, border: "1px solid", borderRadius: 8, cursor: "pointer",
        fontFamily: "'Outfit',sans-serif", position: "relative", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 0, transition: "all 0.15s ease",
        background: isW ? color : hovered ? t.epHover : t.epDefault,
        borderColor: isW ? color : isFiller ? t.fillerBorder : hovered ? t.epHoverBorder : t.epBorder,
        color: isW ? "#fff" : isFiller ? t.fillerText : t.text, opacity: isFiller ? 0.6 : 1,
        transform: hovered && !isW ? "translateY(-2px)" : "none",
        boxShadow: hovered && !isW ? "0 4px 12px rgba(0,0,0,0.15)" : isW ? `0 2px 8px ${color}44` : "none",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600 }}>{ep}</span>
      {isFiller && <span style={{ fontSize: 8, position: "absolute", bottom: 2, color: t.fillerText, fontWeight: 500 }}>FILLER</span>}
      {isW && <span style={{ position: "absolute", top: 1, right: 3, fontSize: 8, fontWeight: 700 }}>✓</span>}
    </button>
  );
}
