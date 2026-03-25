import { CREW_MEMBERS } from "../data";

export default function CrewRoster({ watched, t }) {
  const maxWatched = watched.size > 0 ? Math.max(...watched) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {CREW_MEMBERS.map(member => {
        const unlocked = watched.has(member.ep);
        const bountyVisible = maxWatched >= member.bountyEp;
        return (
          <div
            key={member.name}
            style={{
              background: unlocked ? t.card : t.cardAlt,
              border: `1px solid ${t.cardBorder}`,
              borderLeft: unlocked ? `3px solid ${t.accent}` : `3px solid ${t.cardBorder}`,
              borderRadius: 12,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: unlocked ? 1 : 0.4,
              transition: "opacity 0.6s ease, background 0.6s ease",
              animation: unlocked ? "crewUnlock 0.4s ease" : "none",
            }}
          >
            <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0, width: 44, textAlign: "center" }}>
              {unlocked ? member.emoji : "❓"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>
                  {unlocked ? member.name : "???"}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: unlocked ? t.accent : t.textMuted, letterSpacing: 1, textTransform: "uppercase", background: unlocked ? `${t.accent}18` : "transparent", padding: "2px 8px", borderRadius: 20, border: `1px solid ${unlocked ? t.accent + "44" : t.cardBorder}` }}>
                  {unlocked ? member.role : "???"}
                </span>
              </div>
              <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.5, margin: 0 }}>
                {unlocked ? member.bio : `Unlocks at episode ${member.ep}`}
              </p>
              {unlocked && (
                <div style={{ marginTop: 8, fontSize: 11, color: t.textMuted }}>
                  <span>Ep {member.ep}</span>
                  {bountyVisible && (
                    <>
                      <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>
                      <span>🏴 {member.bounty} Berry</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
