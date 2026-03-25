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
      {/* empty base */}
      <span style={{ fontSize: size, color: "transparent", textShadow: `0 0 0 ${muted}`, lineHeight: 1 }}>★</span>
      {/* filled overlay */}
      {pct > 0 && (
        <span style={{ position: "absolute", top: 0, left: 0, width: `${pct}%`, overflow: "hidden", display: "inline-block", fontSize: size, color, lineHeight: 1 }}>★</span>
      )}
    </span>
  );
}

export function Stars({ filled, color, size = 20, muted = "#4A5E7A" }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
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
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.expandedBorder}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500, letterSpacing: 0.5 }}>Rate this arc:</span>
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{ position: "relative", display: "inline-block", width: 26, height: 26, lineHeight: 1 }}>
            {/* empty base */}
            <span style={{ fontSize: 26, color: "transparent", textShadow: `0 0 0 ${t.textMuted}`, lineHeight: 1, display: "block" }}>★</span>
            {/* filled overlay */}
            {starFill(i, displayed) > 0 && (
              <span style={{ position: "absolute", top: 0, left: 0, width: `${starFill(i, displayed)}%`, overflow: "hidden", display: "inline-block", fontSize: 26, color, lineHeight: 1, pointerEvents: "none" }}>★</span>
            )}
            {/* left half button (i - 0.5) */}
            <button
              onClick={() => onRate(arcKey, (i - 0.5) === currentRating ? null : i - 0.5)}
              onPointerEnter={() => setHovered(i - 0.5)}
              onPointerLeave={() => setHovered(null)}
              style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            />
            {/* right half button (i) */}
            <button
              onClick={() => onRate(arcKey, i === currentRating ? null : i)}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(null)}
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
