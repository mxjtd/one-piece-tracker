import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import { SAGAS, FILLER_EPS, MILESTONES, CREW_MEMBERS, TOTAL_EPS, themes } from "./data";
import { loadStorage, useStorageSync } from "./hooks/useStorage";
import EpButton from "./components/EpButton";
import HoverButton from "./components/HoverButton";
import Toast from "./components/Toast";
import ProgressShip from "./components/ProgressShip";
import CrewRoster from "./components/CrewRoster";

const TOAST_DURATION = 3500;
const markAllStyle = color => ({ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: `1px solid ${color}44`, background: "transparent", color, cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" });
const markAllHover = color => ({ background: `${color}18` });

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
  const [seenCrewToasts, setSeenCrewToasts] = useState(new Set([1]));
  const [paceMode, setPaceMode] = useState("date");
  const [targetDate, setTargetDate] = useState(null);
  const [dailyPace, setDailyPace] = useState(1);
  const toastTimer = useRef(null);
  const t = themes[mode];

  useEffect(() => {
    const d = loadStorage();
    if (d) {
      setWatched(new Set(d.watched || []));
      if (d.skipFiller !== undefined) setSkipFiller(d.skipFiller);
      if (d.mode) setMode(d.mode);
      if (d.seenMilestones) setSeenMilestones(new Set(d.seenMilestones));
      if (d.seenCrewToasts) setSeenCrewToasts(new Set(d.seenCrewToasts));
      if (d.targetDate) setTargetDate(new Date(d.targetDate));
      if (d.dailyPace) setDailyPace(d.dailyPace);
    }
    setLoaded(true);
  }, []);

  useStorageSync(watched, skipFiller, mode, seenMilestones, loaded, targetDate, dailyPace, seenCrewToasts);

  useEffect(() => {
    document.body.style.backgroundColor = mode === "dark" ? "#080E1A" : "#F5F0EB";
  }, [mode]);

  useEffect(() => {
    for (const m of MILESTONES) {
      if (watched.has(m.ep) && !seenMilestones.has(m.ep)) {
        setSeenMilestones(p => new Set([...p, m.ep]));
        setToast(m);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION);
        break;
      }
    }
  }, [watched, seenMilestones]);

  useEffect(() => {
    for (const m of CREW_MEMBERS) {
      if (!m.joinMsg) continue;
      if (watched.has(m.ep) && !seenCrewToasts.has(m.ep)) {
        setSeenCrewToasts(p => new Set([...p, m.ep]));
        setToast({ emoji: m.emoji, msg: m.joinMsg });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION);
        break;
      }
    }
  }, [watched, seenCrewToasts]);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const allCanonEps = useMemo(() => {
    const e = [];
    for (let i = 1; i <= TOTAL_EPS; i++) if (!isSkippable(i)) e.push(i);
    return e;
  }, []);

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
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Outfit',sans-serif", paddingBottom: 40, transition: "background 0.6s ease, color 0.5s ease" }}>
      <Toast toast={toast} t={t} />

      {/* HEADER */}
      <div style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, padding: "24px 20px 20px", transition: "all 0.6s ease" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ margin: 0, lineHeight: 1.1, minWidth: 0 }}>
            <span style={{ fontFamily: "'Pirata One',cursive", fontSize: "clamp(28px,5vw,42px)", color: t.accent, letterSpacing: 2, textShadow: `0 2px 16px ${t.accent}40` }}>ONE PIECE</span><br />
            <span style={{ fontSize: "clamp(11px,2vw,14px)", fontWeight: 400, color: t.textMuted, letterSpacing: 3, textTransform: "uppercase", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Complete Series Tracker</span>
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HoverButton
              baseStyle={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
              hoverStyle={{ transform: "rotate(20deg)", boxShadow: `0 2px 12px ${t.accent}33` }}
              onClick={() => setMode(m => m === "dark" ? "light" : "dark")}
            >{mode === "dark" ? "☀️" : "🌙"}</HoverButton>
            <div style={{ display: "flex", background: t.pillBg, borderRadius: 20, overflow: "hidden", border: `1px solid ${t.pillBorder}` }}>
              {[["sagas", "Arcs"], ["crew", "Crew"], ["stats", "Stats"], ["pace", "Pace"]].map(([v, label]) => (
                <button key={v} onClick={() => setView(v)} style={{ padding: "8px 18px", fontSize: 14, fontWeight: view === v ? 600 : 400, background: view === v ? `${t.accent}22` : "none", color: view === v ? t.accent : t.textMuted, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s ease" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, maxWidth: 800, margin: "16px auto 0", padding: "0 20px" }}>
        {[{ val: stats.done, lbl: "Watched" }, { val: stats.remaining, lbl: "Remaining" }, { val: currentArcInfo.arc, lbl: "Current Arc", sm: true }, { val: `~${stats.hoursLeft}h`, lbl: "Watch Time Left" }].map((s, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "16px 12px", textAlign: "center", transition: "all 0.6s ease" }}>
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
      {view === "crew" && (
        <div style={{ maxWidth: 800, margin: "20px auto 0", padding: "0 20px" }}>
          <h2 style={{ fontSize: 12, letterSpacing: 3, color: t.textMuted, fontWeight: 600, marginBottom: 6, marginTop: 0 }}>STRAW HAT CREW</h2>
          <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>Crew members unlock as you watch their recruitment episode.</p>
          <CrewRoster watched={watched} t={t} />
        </div>
      )}
      {view === "sagas" ? (
        <div style={{ maxWidth: 800, margin: "16px auto 0", padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          {SAGAS.map(saga => {
            const ss = getSagaStats(saga);
            const isOpen = expandedSaga === saga.name;
            const isComplete = ss.pct === 100 && ss.total > 0;
            return (
              <div key={saga.name} style={{ background: t.card, borderTop: `1px solid ${t.cardBorder}`, borderRight: `1px solid ${t.cardBorder}`, borderBottom: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${saga.color}`, borderRadius: 12, overflow: "hidden", transition: "all 0.6s ease" }}>
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
                      baseStyle={markAllStyle(saga.color)}
                      hoverStyle={markAllHover(saga.color)}
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
                        <div key={arcKey} style={{ background: t.cardAlt, border: `1px solid ${arcComplete ? saga.color + "55" : t.cardBorder}`, borderRadius: 10, overflow: "hidden", transition: "all 0.6s ease" }}>
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
                              <HoverButton
                                baseStyle={markAllStyle(saga.color)}
                                hoverStyle={markAllHover(saga.color)}
                                onClick={e => { e.stopPropagation(); markArc(arc, !arcComplete); }}
                              >{arcComplete ? "Unmark All" : "Mark All"}</HoverButton>
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
      ) : view === "crew" ? null : view === "pace" ? (
        <div style={{ maxWidth: 800, margin: "20px auto 0", padding: "0 20px" }}>
          <h2 style={{ fontSize: 12, letterSpacing: 3, color: t.textMuted, fontWeight: 600, marginBottom: 14, marginTop: 0 }}>WATCH PACE CALCULATOR</h2>
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "20px", marginBottom: 28, "--dp-bg": t.card, "--dp-header": t.cardAlt, "--dp-border": t.cardBorder, "--dp-text": t.text, "--dp-muted": t.textMuted, "--dp-hover": t.cardHover, "--dp-accent": t.accent }}>
            <div style={{ display: "flex", background: t.pillBg, borderRadius: 20, overflow: "hidden", border: `1px solid ${t.pillBorder}`, width: "fit-content", marginBottom: 20 }}>
              {[{ val: "date", label: "By Date" }, { val: "pace", label: "By Pace" }].map(opt => (
                <button key={opt.val} onClick={() => setPaceMode(opt.val)} style={{ padding: "7px 18px", fontSize: 13, fontWeight: paceMode === opt.val ? 600 : 400, background: paceMode === opt.val ? `${t.accent}22` : "none", color: paceMode === opt.val ? t.accent : t.textMuted, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s ease" }}>
                  {opt.label}
                </button>
              ))}
            </div>
            {paceMode === "date" ? (() => {
              const today = new Date(); today.setHours(0,0,0,0);
              const daysLeft = targetDate ? Math.ceil((targetDate - today) / 86400000) : null;
              const epsPerDay = daysLeft > 0 && stats.remaining > 0 ? Math.ceil(stats.remaining / daysLeft) : null;
              const isPast = daysLeft !== null && daysLeft <= 0;
              const statusColor = isPast ? "#EF4444" : epsPerDay === null ? t.textMuted : epsPerDay <= 1 ? "#4ADE80" : epsPerDay <= 3 ? t.accent : "#EF4444";
              const statusLabel = isPast ? "Date passed" : epsPerDay === null ? "Set a date" : epsPerDay <= 1 ? "Very chill pace" : epsPerDay <= 3 ? "On track" : "Ambitious pace";
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <label style={{ fontSize: 14, color: t.textSoft, fontWeight: 500 }}>Target date</label>
                    <div className="op-datepicker">
                      <DatePicker selected={targetDate} onChange={date => setTargetDate(date)} minDate={new Date()} placeholderText="Pick a date" dateFormat="MMM d, yyyy"
                        customInput={<input style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: "7px 12px", fontSize: 14, color: t.text, fontFamily: "'Outfit',sans-serif", cursor: "pointer", outline: "none", width: 150 }} />}
                      />
                    </div>
                    {targetDate && <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: `${statusColor}22`, color: statusColor }}>{statusLabel}</span>}
                  </div>
                  {epsPerDay && !isPast && (
                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                      {[{ n: epsPerDay, l: "Eps / Day Needed" }, { n: daysLeft, l: "Days Left" }, { n: stats.remaining, l: "Episodes Left" }].map((f, i) => (
                        <div key={i} style={{ background: t.cardAlt, border: `1px solid ${t.cardBorder}`, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: t.accent }}>{f.n}</div>
                          <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{f.l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isPast && <p style={{ marginTop: 12, fontSize: 14, color: "#EF4444" }}>That date has already passed — pick a future date.</p>}
                </div>
              );
            })() : (() => {
              const pace = Math.max(1, Math.floor(dailyPace));
              const daysToFinish = stats.remaining > 0 ? Math.ceil(stats.remaining / pace) : 0;
              const finishDate = new Date(Date.now() + daysToFinish * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const statusColor = pace >= 4 ? "#EF4444" : pace >= 2 ? t.accent : "#4ADE80";
              const statusLabel = pace >= 4 ? "Ambitious pace" : pace >= 2 ? "On track" : "Very chill pace";
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <label style={{ fontSize: 14, color: t.textSoft, fontWeight: 500 }}>Episodes per day</label>
                    <input type="number" min={1} max={50} value={dailyPace} onChange={e => setDailyPace(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: "7px 12px", fontSize: 14, color: t.text, fontFamily: "'Outfit',sans-serif", width: 80 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: `${statusColor}22`, color: statusColor }}>{statusLabel}</span>
                  </div>
                  {stats.remaining > 0 ? (
                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                      {[{ n: finishDate, l: "Estimated Finish", sm: true }, { n: daysToFinish, l: "Days to Finish" }, { n: stats.remaining, l: "Episodes Left" }].map((f, i) => (
                        <div key={i} style={{ background: t.cardAlt, border: `1px solid ${t.cardBorder}`, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                          <div style={{ fontSize: f.sm ? 16 : 24, fontWeight: 800, color: t.accent, lineHeight: 1.2 }}>{f.n}</div>
                          <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{f.l}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ marginTop: 12, fontSize: 14, color: "#4ADE80" }}>You've finished everything! 🏴‍☠️</p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 800, margin: "20px auto 0", padding: "0 20px" }}>
          <h2 style={{ fontSize: 12, letterSpacing: 3, color: t.textMuted, fontWeight: 600, marginBottom: 14, marginTop: 0 }}>QUICK FACTS</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
            {[
              { n: TOTAL_EPS, l: "Total Episodes" },
              { n: allCanonEps.length, l: "Canon Episodes" },
              { n: FILLER_EPS.size, l: "Filler Episodes" },
              { n: SAGAS.length, l: "Sagas" },
              { n: SAGAS.reduce((a, s) => a + s.arcs.length, 0), l: "Story Arcs" },
              { n: `~${Math.round((allCanonEps.length * 24) / 60)}h`, l: "Canon Runtime" },
            ].map((f, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "16px 12px", textAlign: "center", transition: "all 0.6s ease" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.accent }}>{f.n}</div>
                <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{f.l}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 12, letterSpacing: 3, color: t.textMuted, fontWeight: 600, marginBottom: 14, marginTop: 28 }}>MILESTONES</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MILESTONES.map(m => { const unlocked = watched.has(m.ep); return (
              <div key={m.ep} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: unlocked ? t.card : "transparent", border: `1px solid ${unlocked ? t.cardBorder : "transparent"}`, borderRadius: 10, opacity: unlocked ? 1 : 0.3, transition: "all 0.6s ease" }}>
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
          onClick={() => { if (confirm("Reset ALL progress?")) { setWatched(new Set()); setSeenMilestones(new Set()); setSeenCrewToasts(new Set([1])); } }}
        >
          Reset All Progress
        </HoverButton>
        <div style={{ fontSize: 13, color: t.textSubtle, marginTop: 8 }}>Progress saves automatically between sessions</div>
      </div>
    </div>
  );
}
