import { useState } from "react";

function starFill(i, filled) {
  if (filled >= i) return 100;
  if (filled >= i - 0.5) return 50;
  return 0;
}

function StarDisplay({ i, filled, color, size, muted }) {
  const pct = starFill(i, filled);
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size, lineHeight: 1, flexShrink: 0 }}>
      <span aria-hidden="true" style={{ fontSize: size, color: "transparent", textShadow: `0 0 0 ${muted}`, lineHeight: 1 }}>★</span>
      {pct > 0 && (
        <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: `${pct}%`, overflow: "hidden", display: "inline-block", fontSize: size, color, lineHeight: 1 }}>★</span>
      )}
    </span>
  );
}

export function Stars({ filled, color, size = 20, muted = "#4A5E7A" }) {
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <StarDisplay key={i} i={i} filled={filled} color={color} size={size} muted={muted} />
      ))}
    </span>
  );
}

export default function ArcRating({ arcKey, currentRating, onRate, color, t }) {
  const [hovered, setHovered] = useState(null);
  const displayed = hovered ?? currentRating ?? 0;

  return (
    <div
      role="group"
      aria-label="Rate this arc"
      style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.expandedBorder}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
    >
      <span aria-hidden="true" style={{ fontSize: 12, color: t.textMuted, fontWeight: 500, letterSpacing: 0.5 }}>Rate this arc:</span>
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{ position: "relative", display: "inline-block", width: 26, height: 26, lineHeight: 1 }}>
            <span aria-hidden="true" style={{ fontSize: 26, color: "transparent", textShadow: `0 0 0 ${t.textMuted}`, lineHeight: 1, display: "block" }}>★</span>
            {starFill(i, displayed) > 0 && (
              <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: `${starFill(i, displayed)}%`, overflow: "hidden", display: "inline-block", fontSize: 26, color, lineHeight: 1, pointerEvents: "none" }}>★</span>
            )}
            <button
              onClick={() => onRate(arcKey, (i - 0.5) === currentRating ? null : i - 0.5)}
              onPointerEnter={() => setHovered(i - 0.5)}
              onPointerLeave={() => setHovered(null)}
              aria-label={`Rate ${i - 0.5} out of 5 stars${currentRating === i - 0.5 ? " (current, click to clear)" : ""}`}
              aria-pressed={currentRating === i - 0.5}
              style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            />
            <button
              onClick={() => onRate(arcKey, i === currentRating ? null : i)}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(null)}
              aria-label={`Rate ${i} out of 5 stars${currentRating === i ? " (current, click to clear)" : ""}`}
              aria-pressed={currentRating === i}
              style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            />
          </span>
        ))}
      </div>
      {currentRating && (
        <span style={{ fontSize: 11, color: t.textMuted }}>{currentRating}/5</span>
      )}
    </div>
  );
}
