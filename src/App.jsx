import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { SAGAS, FILLER_EPS, MILESTONES, TOTAL_EPS, themes } from "./data";
import { loadStorage, useStorageSync } from "./hooks/useStorage";
import EpButton from "./components/EpButton";
import HoverButton from "./components/HoverButton";
import Toast from "./components/Toast";
import ProgressShip from "./components/ProgressShip";

function expandRange(s, e) { const a = []; for (let i = s; i <= e; i++) a.push(i); return a; }
function getArcEpisodes(arc) { return expandRange(arc.eps[0], arc.eps[1]); }
function isSkippable(ep) { return FILLER_EPS.has(ep); }

export default function App() {
  const [watched, setWatched] = useState(new Set());
  const [expandedSaga, setExpandedSaga] = useState(null);
  const [expandedArc, setExpandedArc] = useState(null);
  const [skipFiller, setSkipFiller] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("sagas");
  const [hoveredSaga, setHoveredSaga] = useState(null);
  const [hoveredArc, setHoveredArc] = useState(null);
  const [mode, setMode] = useState("dark");
  const [toast, setToast] = useState(null);
  const [seenMilestones, setSeenMilestones] = useState(new Set());
  const toastTimer = useRef(null);
  const t = themes[mode];

  useEffect(() => {
    const d = loadStorage();
    if (d) {
      setWatched(new Set(d.watched || []));
      if (d.skipFiller !== undefined) setSkipFiller(d.skipFiller);
      if (d.mode) setMode(d.mode);
      if (d.seenMilestones) setSeenMilestones(new Set(d.seenMilestones));
    }
    setLoaded(true);
  }, []);

  useStorageSync(watched, skipFiller, mode, seenMilestones, loaded);

  useEffect(() => {
    document.body.style.backgroundColor = mode === "dark" ? "#080E1A" : "#F5F0EB";
  }, [mode]);

  useEffect(() => {
    for (const m of MILESTONES) {
      if (watched.has(m.ep) && !seenMilestones.has(m.ep)) {
        setSeenMilestones(p => new Set([...p, m.ep]));
        setToast(m);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3500);
        break;
      }
    }
  }, [watched]);

  const allCanonEps = useMemo(() => {
    const e = [];
    for (let i = 1; i <= TOTAL_EPS; i++) if (!isSkippable(i)) e.push(i);
    return e;
  }, []);

  // All episodes that actually appear as buttons in the UI (within arc ranges)
  const allTrackableEps = useMemo(() => {
    const e = [];
    SAGAS.forEach(s => s.arcs.forEach(a => { for (let i = a.eps[0]; i <= a.eps[1]; i++) e.push(i); }));
    return e;
  }, []);

  const stats = useMemo(() => {
    const rel = skipFiller ? allCanonEps : allTrackableEps;
    const total = rel.length, done = rel.filter(e => watched.has(e)).length;
    return { total, done, remaining: total - done, pct: total > 0 ? (done / total) * 100 : 0, hoursLeft: Math.round(((total - done) * 24) / 60) };
  }, [watched, skipFiller, allCanonEps, allTrackableEps]);

  const currentArcInfo = useMemo(() => {
    const cur = (skipFiller ? allCanonEps : allTrackableEps).find(ep => !watched.has(ep));
    if (!cur) return { arc: "All done!" };
    for (const s of SAGAS) for (const a of s.arcs) if (cur >= a.eps[0] && cur <= a.eps[1]) return { arc: a.name };
    return { arc: "—" };
  }, [watched, skipFiller, allCanonEps, allTrackableEps]);

  const toggleEp = useCallback(ep => setWatched(p => { const n = new Set(p); n.has(ep) ? n.delete(ep) : n.add(ep); return n; }), []);
  const markArc = useCallback((arc, mark) => setWatched(p => { const n = new Set(p); getArcEpisodes(arc).forEach(ep => mark ? n.add(ep) : n.delete(ep)); return n; }), []);
  const markSaga = useCallback((saga, mark) => setWatched(p => { const n = new Set(p); saga.arcs.forEach(arc => getArcEpisodes(arc).forEach(ep => mark ? n.add(ep) : n.delete(ep))); return n; }), []);

  const getArcStats = arc => {
    const eps = getArcEpisodes(arc);
    const rel = skipFiller ? eps.filter(e => !isSkippable(e)) : eps;
    const done = rel.filter(e => watched.has(e)).length;
    return { done, total: rel.length, pct: rel.length > 0 ? (done / rel.length) * 100 : 0 };
  };

  const getSagaStats = saga => {
    let done = 0, total = 0;
    saga.arcs.forEach(a => { const s = getArcStats(a); done += s.done; total += s.total; });
    return { done, total, pct: total > 0 ? (done / total) * 100 : 0 };
  };

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: t.loadBg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 48 }}>⚓</div>
      <p style={{ color: t.textMuted, fontFamily: "'Outfit',sans-serif" }}>Loading your voyage...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Outfit',sans-serif", paddingBottom: 40, transition: "background 0.4s ease, color 0.3s ease" }}>
      <Toast toast={toast} t={t} />

      {/* HEADER */}
      <div style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, padding: "24px 20px 20px", transition: "all 0.3s ease" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ margin: 0, lineHeight: 1.1 }}>
            <span style={{ fontFamily: "'Pirata One',cursive", fontSize: "clamp(28px,5vw,42px)", color: t.accent, letterSpacing: 2, textShadow: `0 2px 16px ${t.accent}40` }}>ONE PIECE</span><br />
            <span style={{ fontSize: "clamp(11px,2vw,14px)", fontWeight: 400, color: t.textMuted, letterSpacing: 3, textTransform: "uppercase" }}>Complete Series Tracker</span>
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HoverButton
              baseStyle={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
              hoverStyle={{ transform: "rotate(20deg)", boxShadow: `0 2px 12px ${t.accent}33` }}
              onClick={() => setMode(m => m === "dark" ? "light" : "dark")}
            >{mode === "dark" ? "☀️" : "🌙"}</HoverButton>
            <div style={{ display: "flex", background: t.pillBg, borderRadius: 20, overflow: "hidden", border: `1px solid ${t.pillBorder}` }}>
              {["sagas", "stats"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding: "8px 18px", fontSize: 14, fontWeight: view === v ? 600 : 400, background: view === v ? `${t.accent}22` : "none", color: view === v ? t.accent : t.textMuted, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s ease" }}>
                  {v === "sagas" ? "Arcs" : "Stats"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, maxWidth: 800, margin: "16px auto 0", padding: "0 20px" }}>
        {[{ val: stats.done, lbl: "Watched" }, { val: stats.remaining, lbl: "Remaining" }, { val: currentArcInfo.arc, lbl: "Current Arc", sm: true }, { val: `~${stats.hoursLeft}h`, lbl: "Watch Time Left" }].map((s, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "16px 12px", textAlign: "center", transition: "all 0.3s ease" }}>
            <div style={{ fontSize: s.sm ? 18 : 28, fontWeight: 800, color: t.text, lineHeight: 1.1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4, fontWeight: 500 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* PROGRESS BAR */}
      <div style={{ maxWidth: 800, margin: "16px auto 0", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: 2, color: t.textMuted, fontWeight: 600 }}>GRAND LINE PROGRESS</span>
          <span style={{ fontSize: 14, color: t.accent, fontWeight: 700 }}>{Math.round(stats.pct)}%</span>
        </div>
        <div style={{ width: "100%", height: 14, background: t.card, borderRadius: 8, position: "relative", border: `1px solid ${t.cardBorder}`, overflow: "visible" }}>
          <div style={{ height: "100%", background: t.accentGrad, borderRadius: 8, transition: "width 0.5s ease", position: "relative", width: `${stats.pct}%` }}>
            <ProgressShip pct={stats.pct} />
          </div>
          {SAGAS.map((saga, i) => (
            <div key={i} style={{ position: "absolute", top: 0, bottom: 0, width: 1.5, left: `${(saga.arcs[saga.arcs.length - 1].eps[1] / TOTAL_EPS) * 100}%`, background: `${saga.color}44` }} />
          ))}
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ maxWidth: 800, margin: "12px auto 0", padding: "0 20px" }}>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input type="checkbox" checked={skipFiller} onChange={e => setSkipFiller(e.target.checked)} style={{ marginRight: 6 }} />
          <span style={{ fontSize: 14, color: t.textSoft }}>Skip filler episodes ({FILLER_EPS.size} eps)</span>
        </label>
      </div>

      {/* MAIN CONTENT */}
      {view === "sagas" ? (
        <div style={{ maxWidth: 800, margin: "16px auto 0", padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          {SAGAS.map(saga => {
            const ss = getSagaStats(saga);
            const isOpen = expandedSaga === saga.name;
            const isComplete = ss.pct === 100 && ss.total > 0;
            return (
              <div key={saga.name} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${saga.color}`, borderRadius: 12, overflow: "hidden", transition: "all 0.3s ease" }}>
                <div
                  onClick={() => setExpandedSaga(isOpen ? null : saga.name)}
                  onMouseEnter={() => setHoveredSaga(saga.name)}
                  onMouseLeave={() => setHoveredSaga(null)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", cursor: "pointer", userSelect: "none", transition: "background 0.15s ease", borderRadius: 12, background: hoveredSaga === saga.name ? t.cardHover : "transparent" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: saga.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: t.text }}>{saga.name} {isComplete && <span style={{ color: "#4ADE80" }}>✓</span>}</div>
                      <div style={{ fontSize: 14, color: t.textMuted, marginTop: 2 }}>{ss.done}/{ss.total} episodes · {saga.arcs.length} arc{saga.arcs.length > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 60, height: 6, background: t.cardBorder, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, transition: "width 0.4s", width: `${ss.pct}%`, background: saga.color }} />
                    </div>
                    <HoverButton
                      baseStyle={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: `1px solid ${saga.color}44`, background: "transparent", color: saga.color, cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}
                      hoverStyle={{ background: `${saga.color}18` }}
                      onClick={e => { e.stopPropagation(); markSaga(saga, !isComplete); }}
                    >{isComplete ? "Unmark All" : "Mark All"}</HoverButton>
                    <span style={{ fontSize: 10, color: t.textMuted, transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</span>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {saga.arcs.map(arc => {
                      const as = getArcStats(arc), arcKey = `${saga.name}-${arc.name}`, arcOpen = expandedArc === arcKey, arcComplete = as.pct === 100 && as.total > 0;
                      return (
                        <div key={arcKey} style={{ background: t.cardAlt, border: `1px solid ${arcComplete ? saga.color + "55" : t.cardBorder}`, borderRadius: 10, overflow: "hidden", transition: "all 0.3s ease" }}>
                          <div
                            onClick={() => setExpandedArc(arcOpen ? null : arcKey)}
                            onMouseEnter={() => setHoveredArc(arcKey)}
                            onMouseLeave={() => setHoveredArc(null)}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", cursor: "pointer", userSelect: "none", transition: "background 0.15s ease", borderRadius: 10, background: hoveredArc === arcKey ? t.arcHover : "transparent" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 24 }}>{arc.icon}</span>
                              <div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>{arc.name} {arcComplete && <span style={{ color: "#4ADE80", fontSize: 14 }}>✓</span>}</div>
                                <div style={{ fontSize: 13, color: t.textDim, marginTop: 2 }}>Ep {arc.eps[0]}–{arc.eps[1]} · {as.done}/{as.total}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 48, height: 5, background: t.cardBorder, borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 3, transition: "width 0.3s", width: `${as.pct}%`, background: saga.color }} />
                              </div>
                              <span style={{ fontSize: 10, color: t.textMuted, transition: "transform 0.2s ease", transform: arcOpen ? "rotate(180deg)" : "none" }}>▼</span>
                            </div>
                          </div>
                          {arcOpen && (
                            <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${t.expandedBorder}` }}>
                              <p style={{ fontSize: 15, color: t.textSoft, lineHeight: 1.6, margin: "12px 0", fontStyle: "italic" }}>{arc.teaser}</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "10px 0" }}>
                                {getArcEpisodes(arc).map(ep => {
                                  if (skipFiller && FILLER_EPS.has(ep)) return null;
                                  return <EpButton key={ep} ep={ep} isW={watched.has(ep)} isFiller={FILLER_EPS.has(ep)} color={saga.color} onClick={() => toggleEp(ep)} t={t} />;
                                })}
                              </div>
                              <HoverButton
                                baseStyle={{ width: "100%", padding: 10, border: `1px solid ${saga.color}44`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", background: "transparent", color: saga.color, letterSpacing: 0.5 }}
                                hoverStyle={{ background: `${saga.color}18` }}
                                onClick={() => markArc(arc, !arcComplete)}
                              >
                                {arcComplete ? "Unmark All" : "Mark All Watched"}
                              </HoverButton>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ maxWidth: 800, margin: "20px auto 0", padding: "0 20px" }}>
          <h2 style={{ fontSize: 12, letterSpacing: 3, color: t.textMuted, fontWeight: 600, marginBottom: 14, marginTop: 0 }}>SAGA BREAKDOWN</h2>
          {SAGAS.map(saga => { const ss = getSagaStats(saga); return (
            <div key={saga.name} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: saga.color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: t.text, flex: 1 }}>{saga.name}</span>
                <span style={{ fontSize: 14, color: t.textMuted }}>{ss.done}/{ss.total}</span>
              </div>
              <div style={{ width: "100%", height: 8, background: t.card, borderRadius: 4, overflow: "hidden", border: `1px solid ${t.cardBorder}` }}>
                <div style={{ height: "100%", borderRadius: 4, transition: "width 0.4s", width: `${ss.pct}%`, background: saga.color }} />
              </div>
            </div>
          ); })}

          <h2 style={{ fontSize: 12, letterSpacing: 3, color: t.textMuted, fontWeight: 600, marginBottom: 14, marginTop: 28 }}>QUICK FACTS</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
            {[
              { n: TOTAL_EPS, l: "Total Episodes" },
              { n: allCanonEps.length, l: "Canon Episodes" },
              { n: FILLER_EPS.size, l: "Filler Episodes" },
              { n: SAGAS.length, l: "Sagas" },
              { n: SAGAS.reduce((a, s) => a + s.arcs.length, 0), l: "Story Arcs" },
              { n: `~${Math.round((allCanonEps.length * 24) / 60)}h`, l: "Canon Runtime" },
            ].map((f, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "16px 12px", textAlign: "center", transition: "all 0.3s ease" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.accent }}>{f.n}</div>
                <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{f.l}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 12, letterSpacing: 3, color: t.textMuted, fontWeight: 600, marginBottom: 14, marginTop: 28 }}>MILESTONES</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MILESTONES.map(m => { const unlocked = watched.has(m.ep); return (
              <div key={m.ep} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: unlocked ? t.card : "transparent", border: `1px solid ${unlocked ? t.cardBorder : "transparent"}`, borderRadius: 10, opacity: unlocked ? 1 : 0.3, transition: "all 0.3s ease" }}>
                <span style={{ fontSize: 22 }}>{unlocked ? m.emoji : "🔒"}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{unlocked ? m.msg : "???"}</div>
                  <div style={{ fontSize: 12, color: t.textDim }}>Episode {m.ep}</div>
                </div>
              </div>
            ); })}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ maxWidth: 800, margin: "28px auto 0", padding: "0 20px", textAlign: "center" }}>
        <HoverButton
          baseStyle={{ background: "none", border: `1px solid ${t.dangerBorder}`, color: "#EF4444", padding: "10px 22px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit',sans-serif", opacity: 0.6 }}
          hoverStyle={{ opacity: 1, background: "#EF444411" }}
          onClick={() => { if (confirm("Reset ALL progress?")) { setWatched(new Set()); setSeenMilestones(new Set()); } }}
        >
          Reset All Progress
        </HoverButton>
        <div style={{ fontSize: 13, color: t.textSubtle, marginTop: 8 }}>Progress saves automatically between sessions</div>
      </div>
    </div>
  );
}
